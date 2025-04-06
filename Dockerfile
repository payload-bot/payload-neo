FROM denoland/deno:alpine AS build

USER deno 

WORKDIR /app

RUN deno cache --frozen src/index.ts

COPY . .

FROM denoland/deno:alpine

ENV FLY="true"
ENV LITEFS_DIR="/litefs/data"
ENV DATABASE_FILENAME="sqlite.db"
ENV DATABASE_PATH="$LITEFS_DIR/$DATABASE_FILENAME"
ENV DATABASE_URL="file:$DATABASE_PATH"
ENV NODE_ENV="production"
ENV PORT=3000
ENV HOST="0.0.0.0"
ENV PREVIEW_URL="http://payload-screenshot.internal:8000"
ENV DENO_NO_UPDATE_CHECK=1
ENV DENO_NO_PROMPT=1

# prepare for litefs
COPY --from=flyio/litefs:0.5.0 /usr/local/bin/litefs /usr/local/bin/litefs
ADD litefs.yml /etc/litefs.yml
RUN mkdir -p /data ${LITEFS_DIR}
RUN chown -R deno:deno /data

# add shortcut for connecting to database CLI
RUN echo "#!/bin/sh\nset -x\nsqlite3 \$DATABASE_URL" > /usr/local/bin/db && chmod +x /usr/local/bin/db

WORKDIR /app

USER deno 

COPY --from=build $DENO_DIR $DENO_DIR
COPY --from=build /app .

ENTRYPOINT ["litefs", "mount"]