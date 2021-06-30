FROM node:14 AS build
WORKDIR /opt/app

COPY tsconfig.json .
COPY package.json .
COPY yarn.lock .
COPY ./src ./src
COPY ./buildscripts ./buildscripts
COPY changelog.md .

RUN yarn install
RUN yarn build

FROM buildkite/puppeteer
WORKDIR /opt/app

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

COPY package.json .
COPY yarn.lock .

RUN yarn install --prod

COPY --from=build /opt/app/dist ./dist
COPY ./languages ./languages
COPY ./migrations ./migrations

USER node
CMD ["yarn", "start"]

EXPOSE 3000