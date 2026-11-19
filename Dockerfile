FROM denoland/deno:alpine-2.9.8 AS deps

WORKDIR /app

COPY deno.json package.json deno.lock ./

RUN deno ci --prod --skip-types

COPY . .

FROM denoland/deno:alpine-2.9.8

ENV FLY="true"
ENV LITEFS_DIR="/litefs/data"
ENV DATABASE_FILENAME="sqlite.db"
ENV DATABASE_PATH="$LITEFS_DIR/$DATABASE_FILENAME"
ENV DATABASE_URL="$DATABASE_PATH"
ENV NODE_ENV="production"
ENV PORT=3000
ENV HOST="0.0.0.0"
ENV DENO_NO_UPDATE_CHECK=1
ENV DENO_NO_PROMPT=1

RUN apk add ca-certificates fuse3 sqlite

# prepare for litefs
COPY --from=flyio/litefs:0.5.5 /usr/local/bin/litefs /usr/local/bin/litefs
COPY litefs.yml /etc/litefs.yml
RUN mkdir -p /data ${LITEFS_DIR}

WORKDIR /app

COPY --from=deps $DENO_DIR $DENO_DIR
COPY --from=deps /app .

ENTRYPOINT ["litefs", "mount"]
