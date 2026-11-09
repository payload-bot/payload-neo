import { registry } from "#lib/metrics.ts";

export function serveMetrics() {
  return Deno.serve({ port: 6421, hostname: "0.0.0.0" }, async () => {
    return new Response(await registry.metrics(), { headers: { "Content-Type": registry.contentType } });
  });
}
