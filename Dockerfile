# Dependencies
FROM node:18.12.1-alpine3.17 AS deps
WORKDIR /app

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=1
ENV VERSION=${VERSION}
ENV BUILT_AT=${BUILT_AT}
ENV CI=true

COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn/releases .yarn/releases
COPY .yarn/plugins .yarn/plugins

RUN yarn install --immutable

# Build Source
FROM node:18.12.1-alpine3.17 AS build
WORKDIR /app
ENV CI=true
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=1

COPY . .
COPY --from=deps /app/node_modules ./node_modules

RUN yarn build
RUN npx prisma generate

RUN yarn workspaces focus --all --production

# Runner
FROM node:18.12.1-alpine3.17
WORKDIR /app
USER node
EXPOSE 3000

ENV NODE_ENV=production

COPY --from=build /app/package.json ./package.json
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/assets ./assets
COPY --from=build /app/dist ./dist

CMD ["node", "--enable-source-maps", "."]