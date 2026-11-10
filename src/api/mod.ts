import { Hono } from "hono";
import { createMiddleware } from "hono/factory";
import { sValidator } from "@hono/standard-validator";
import { type } from "arktype";
import { isNullish, isNullOrUndefinedOrEmpty } from "@sapphire/utilities";
import { sendLogPreview, sendTest } from "#utils/webhook-helper.ts";
import { container } from "@sapphire/pieces";
import { webhook } from "#root/drizzle/schema.ts";
import { eq } from "drizzle-orm";
import { envParseInteger, envParseString } from "@skyra/env-utilities";

const webhookSchema = type({
  "demosId?": "string | number.integer >= 0 | null",
  logsId: "string | number.integer >= 0",
});

const hostname = envParseString("HOST");
const port = envParseInteger("PORT", 3000);

const app = new Hono();

const authorization = createMiddleware<{ Variables: { user: { type: string; id: string } } }>(async (c, next) => {
  const headerAuth = c.req.header("Authorization");

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

  c.set("user", { id: data[0].id, type: data[0].type });

  await next();
});

app.post("/api/v1/webhooks/logs", sValidator("form", webhookSchema), authorization, async (c) => {
  const body = c.req.valid("form");
  const user = c.var.user;

  await sendLogPreview(container.client, {
    demosId: body.demosId?.toString(),
    logsId: body.logsId.toString(),
    targetId: user.id,
    // deno-lint-ignore no-explicit-any
    webhookTarget: user.type as any,
  });

  return c.body(null, 204);
});

app.post("/api/webhooks/logs", sValidator("form", webhookSchema), authorization, async (c) => {
  const body = c.req.valid("form");
  const user = c.var.user;

  await sendLogPreview(container.client, {
    demosId: body.demosId?.toString(),
    logsId: body.logsId.toString(),
    targetId: user.id,
    // deno-lint-ignore no-explicit-any
    webhookTarget: user.type as any,
  });

  return c.body(null, 204);
});

app.post("/api/webhooks/test", authorization, async (c) => {
  const user = c.var.user;

  await sendTest(container.client, user.type as any, user.id);

  return c.body(null, 204);
});

export function serve() {
  return Deno.serve({ hostname, port }, app.fetch);
}
