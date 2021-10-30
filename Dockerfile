# Builder
FROM node:16-slim AS build
WORKDIR /opt/app
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=1

COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn/releases .yarn/releases
COPY .yarn/plugins .yarn/plugins

RUN yarn install --immutable

COPY tsconfig.json .
COPY ./src ./src

RUN yarn build


# Runner
FROM node:16-buster-slim
WORKDIR /opt/app

ENV NODE_ENV=production
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=1

COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn/releases .yarn/releases
COPY .yarn/plugins .yarn/plugins

RUN yarn workspaces focus --production && yarn cache clean

COPY ./assets ./assets
COPY ./src/languages ./languages
COPY ./migrations ./migrations
COPY .env /opt/app/.env
COPY --from=build /opt/app/dist ./dist
COPY changelog.md ./dist

USER node
CMD ["node", "."]

EXPOSE 9091