# Builder
FROM node:18.12.1 AS build
WORKDIR /opt/app

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=1
ENV CI=true

COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn/releases .yarn/releases
COPY .yarn/plugins .yarn/plugins

RUN yarn install --immutable

COPY ./scripts ./scripts
COPY tsconfig.json .
COPY tsup.config.ts .
COPY ./src ./src

RUN yarn build

# Runner
FROM node:18.12.1
WORKDIR /opt/app

ARG VERSION
ARG BUILT_AT

# Yarn v3
ENV CI=true
ENV NODE_ENV=production
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=1
ENV VERSION=${VERSION}
ENV BUILT_AT=${BUILT_AT}

COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn/releases .yarn/releases
COPY .yarn/plugins .yarn/plugins
COPY prisma prisma

RUN yarn workspaces focus --all --production

RUN npx prisma generate

COPY ./assets ./assets
COPY ./scripts ./scripts
COPY ./src/languages ./dist/languages
COPY --from=build /opt/app/dist ./dist
COPY changelog.md ./dist

USER node
CMD ["node", "--enable-source-maps", "."]
HEALTHCHECK --interval=60s --timeout=5s --start-period=60s --retries=2 CMD node scripts/healthcheck.js

EXPOSE 8080