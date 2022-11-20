import { ApplyOptions } from "@sapphire/decorators";
import { type ApiRequest, type ApiResponse, methods, type RouteOptions, Route } from "@sapphire/plugin-api";
import { envParseString } from "@skyra/env-utilities";

@ApplyOptions<RouteOptions>({
  route: "metrics",
})
export class MetricsRoute extends Route {
  public async [methods.GET](request: ApiRequest, response: ApiResponse) {
    if (request.headers?.authorization !== envParseString("METRICS_HEADER_KEY")) {
      return response.notFound();
    }

    const metrics = await this.container.database.$metrics.prometheus();

    return response.ok(metrics);
  }
}
