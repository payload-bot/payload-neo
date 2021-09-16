FROM node:16-slim AS build
WORKDIR /opt/app

COPY package.json .
COPY yarn.lock .

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true

RUN yarn install --frozen-lockfile

COPY ./src ./src
COPY tsconfig.json .

RUN yarn build

FROM node:16-buster-slim
WORKDIR /opt/app

ARG NODE_ENV=production

ENV NODE_ENV=${NODE_ENV}
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true

COPY package.json .
COPY yarn.lock .

RUN yarn install --prod --frozen-lockfile && yarn cache clean

COPY ./assets ./assets
COPY ./languages ./languages
COPY ./migrations ./migrations
COPY --from=build /opt/app/dist ./dist
COPY changelog.md ./dist

USER node
CMD ["node", "."]

EXPOSE 3000