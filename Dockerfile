FROM node:18-bullseye-slim as base
WORKDIR /app

ENV NODE_ENV=production

RUN apt-get update && apt-get install gnupg wget fuse3 openssl sqlite3 ca-certificates -y && \
  wget --quiet --output-document=- https://dl-ssl.google.com/linux/linux_signing_key.pub | gpg --dearmor > /etc/apt/trusted.gpg.d/google-archive.gpg && \
  sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' && \
  apt-get update && \
  apt-get install google-chrome-stable -y --no-install-recommends && \
  rm -rf /var/lib/apt/lists/*

FROM base as deps

COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn/releases .yarn/releases
COPY .yarn/plugins .yarn/plugins

RUN yarn install --immutable

# production deps
FROM base as production-deps

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN yarn workspaces focus --all --production

# build src
FROM base as build

WORKDIR /app

COPY --from=deps /app/node_modules /app/node_modules

COPY . .

RUN yarn build

# runner
FROM base

ENV FLY="true"
ENV LITEFS_DIR="/litefs/data"
ENV DATABASE_FILENAME="sqlite.db"
ENV DATABASE_PATH="$LITEFS_DIR/$DATABASE_FILENAME"
ENV DATABASE_URL="file:$DATABASE_PATH"
ENV INTERNAL_PORT="8080"
ENV PORT="8081"
ENV NODE_ENV="production"

# add shortcut for connecting to database CLI
RUN echo "#!/bin/sh\nset -x\nsqlite3 \$DATABASE_URL" > /usr/local/bin/db && chmod +x /usr/local/bin/db

WORKDIR /app

COPY --from=build /app/assets /app/assets
COPY --from=production-deps /app/node_modules /app/node_modules
COPY --from=build /app/package.json /app/package.json
COPY --from=build /app/dist /app/dist
COPY --from=build /app/src/languages /app/dist/languages

# prepare for litefs
COPY --from=flyio/litefs:0.5.0 /usr/local/bin/litefs /usr/local/bin/litefs
ADD litefs.yml /etc/litefs.yml
RUN mkdir -p /data ${LITEFS_DIR}

RUN npx puppeteer browsers install chrome

CMD ["litefs", "mount"]