ARG ALPINE_VERSION=3.24

FROM node:26-alpine${ALPINE_VERSION} AS deps

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN npm install -g pnpm@12.18.0

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --prod --frozen-lockfile

COPY . .

FROM node:26-alpine${ALPINE_VERSION}

ENV FLY="true"
ENV LITEFS_DIR="/litefs/data"
ENV DATABASE_FILENAME="sqlite.db"
ENV DATABASE_PATH="$LITEFS_DIR/$DATABASE_FILENAME"
ENV DATABASE_URL="$DATABASE_PATH"
ENV NODE_ENV="production"
ENV PORT=3000
ENV HOST="0.0.0.0"
ENV NODE_OPTIONS="--max-old-space-size=384"

RUN apk add ca-certificates fuse3 sqlite

# prepare for litefs
COPY --from=flyio/litefs:0.5.5 /usr/local/bin/litefs /usr/local/bin/litefs
COPY litefs.yml /etc/litefs.yml
RUN mkdir -p /data ${LITEFS_DIR}

WORKDIR /app

COPY --from=deps /app .

ENTRYPOINT ["litefs", "mount"]
