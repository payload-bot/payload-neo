FROM denoland/deno:alpine AS build

WORKDIR /app

COPY . .

RUN deno cache src/index.ts

FROM build

ENV FLY="true"
ENV LITEFS_DIR="/litefs/data"
ENV DATABASE_FILENAME="sqlite.db"
ENV DATABASE_PATH="$LITEFS_DIR/$DATABASE_FILENAME"
ENV DATABASE_URL="file:$DATABASE_PATH"
ENV NODE_ENV="production"
ENV PORT=3000
ENV HOST="0.0.0.0"
ENV NODE_OPTIONS="--max-old-space-size=512"

# add shortcut for connecting to database CLI
RUN echo "#!/bin/sh\nset -x\nsqlite3 \$DATABASE_URL" > /usr/local/bin/db && chmod +x /usr/local/bin/db

WORKDIR /app

COPY --from=build /app/assets /app/assets
COPY --from=build /app/node_modules /app/node_modules
COPY --from=build /app/deno.json /app/deno.json
COPY --from=build /app/src /app/src

# prepare for litefs
COPY --from=flyio/litefs:0.5.0 /usr/local/bin/litefs /usr/local/bin/litefs
ADD litefs.yml /etc/litefs.yml
RUN mkdir -p /data ${LITEFS_DIR}

CMD ["litefs", "mount"]