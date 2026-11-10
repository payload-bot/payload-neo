import client from "@prometheus-io/client";

export function serveMetrics() {
  return Deno.serve({ port: 6421, hostname: "0.0.0.0" }, async () => {
    return new Response(await client.register.metrics(), { headers: { "Content-Type": client.register.contentType } });
  });
}
