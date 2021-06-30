FROM node:14 AS build
WORKDIR /opt/app

COPY tsconfig.json .
COPY package*.json ./
COPY ./src ./src
COPY ./buildscripts ./buildscripts
COPY changelog.md .

RUN npm install
RUN npm run build

FROM buildkite/puppeteer
WORKDIR /opt/app

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

COPY package*.json ./

RUN npm install --production

COPY --from=build /opt/app/dist ./dist
COPY ./languages ./languages
COPY ./migrations ./migrations

USER node
CMD ["npm", "start"]

EXPOSE 3000