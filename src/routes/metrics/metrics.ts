import { ServiceController } from "#lib/api/ServiceController";
import { ApplyOptions } from "@sapphire/decorators";
import { type ApiResponse, methods, type RouteOptions, ApiRequest } from "@sapphire/plugin-api";

@ApplyOptions<RouteOptions>({
  route: "metrics",
})
export class MetricsRoute extends ServiceController {
  public async [methods.GET](_: ApiRequest, response: ApiResponse) {
    const metrics = await this.database.$metrics.prometheus();

    return response.ok(metrics);
  }
}
