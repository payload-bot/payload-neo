import { ApplyOptions } from "@sapphire/decorators";
import { type ApiRequest, type ApiResponse, methods, type RouteOptions, Route } from "@sapphire/plugin-api";

@ApplyOptions<RouteOptions>({
  route: "health",
})
export class MetricsRoute extends Route {
  public async [methods.GET](_request: ApiRequest, response: ApiResponse) {
    return response.noContent();
  }
}
