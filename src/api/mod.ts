import { type } from "arktype";
import { isNullish, isNullOrUndefinedOrEmpty } from "@sapphire/utilities";
import { sendLogPreview } from "#utils/webhook-helper.ts";
import { container } from "@sapphire/pieces";
import { webhook } from "#root/drizzle/schema.ts";
import { eq } from "drizzle-orm";
import { envParseInteger, envParseString } from "@skyra/env-utilities";

const steamRoute = new URLPattern({ pathname: "/api/steam" });
const webhookRenderUrlOld = new URLPattern({
  pathname: "/api/v1/webhooks/logs",
});
const webhookRenderUrl = new URLPattern({ pathname: "/api/webhooks/logs" });

const logSchema = type({
  ip: "string",
  pw: "string?",
});

const webhookSchema = type({
  demosId: "string | number.integer >= 0",
  logsId: "string | number.integer >= 0",
});

const hostname = envParseString("HOST");
const port = envParseInteger("PORT", 3000);

export function serve() {
  return Deno.serve({ hostname, port }, async (req) => {
    const url = new URL(req.url);

    if (req.method === "GET" && steamRoute.test(req.url)) {
      const result = logSchema(Object.fromEntries(url.searchParams));

      if (result instanceof type.errors) {
        return Response.json({
          error: "Bad request",
          message: result.summary,
        });
      }

      return Response.redirect(
        `steam://connect/${result.ip}${result.pw != null ? `/${result.pw}` : ""}`,
        302,
      );
    }

    if (
      req.method === "POST" &&
      (webhookRenderUrl.test(req.url) || webhookRenderUrlOld.test(req.url))
    ) {
      const headerAuth = req.headers.get("Authorization");

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

      const body = await req.json();
      const result = webhookSchema(body);

      if (result instanceof type.errors) {
        return Response.json({
          error: "Bad request",
          message: result.summary,
        });
      }

      await sendLogPreview(container.client, {
        demosId: result.demosId.toString(),
        logsId: result.logsId.toString(),
        targetId: data[0].id,
        // deno-lint-ignore no-explicit-any
        webhookTarget: data[0].type as any,
      });

      return new Response(null, { status: 204 });
    }

    return new Response(null, { status: 404 });
  });
}
