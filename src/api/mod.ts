import { Hono } from "hono";
import { createMiddleware } from "hono/factory";
import { sValidator } from "@hono/standard-validator";
import { type } from "arktype";
import { isNullish, isNullOrUndefinedOrEmpty } from "@sapphire/utilities";
import { sendLogPreview } from "#utils/webhook-helper.ts";
import { container } from "@sapphire/pieces";
import { webhook } from "#root/drizzle/schema.ts";
import { eq } from "drizzle-orm";
import { envParseInteger, envParseString } from "@skyra/env-utilities";

const webhookSchema = type({
  demosId: "string | number.integer >= 0",
  logsId: "string | number.integer >= 0",
});

const hostname = envParseString("HOST");
const port = envParseInteger("PORT", 3000);

const app = new Hono();

const authorization = createMiddleware(async (c, next) => {
  const headerAuth = c.header("Authorization");

  if (isNullish(headerAuth)) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  const data = await container.database
    .select({ type: webhook.type, id: webhook.id })
    .from(webhook)
    .where(eq(webhook.value, headerAuth));

  if (isNullOrUndefinedOrEmpty(data)) {
    return Response.json({ message: "Not found" }, { status: 404 });
  }

  await next();
});

app.get("/api/v1/webhooks/logs", sValidator("json", webhookSchema));
app.get("/api/webhooks/logs", sValidator("json", webhookSchema), async (c) => {
  const { body } = c.valid("json");

  await sendLogPreview(container.client, {
    demosId: body.demosId.toString(),
    logsId: body.logsId.toString(),
    targetId: body[0].id,
    // deno-lint-ignore no-explicit-any
    webhookTarget: body[0].type as any,
  });

  return c.status(204);
});

export function serve() {
  return Deno.serve({ hostname, port }, app.fetch);
}
