import { Hono } from "hono";
import client from "@prometheus-io/client";

const app = new Hono();

app.get("/", async (_) => {
  return new Response(await client.register.metrics(), { headers: { "Content-Type": client.register.contentType } });
});

export function serveMetrics() {
  return Deno.serve({ port: 6421, hostname: "0.0.0.0" }, app.fetch);
}
