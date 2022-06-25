import { ServiceController } from "#lib/api/ServiceController";
import { ApplyOptions } from "@sapphire/decorators";
import {
  type ApiRequest,
  type ApiResponse,
  methods,
  type RouteOptions,
} from "@sapphire/plugin-api";

@ApplyOptions<RouteOptions>({
  route: "webhooks/test",
})
export class WebhookTestRoute extends ServiceController {
  public async [methods.POST](request: ApiRequest, response: ApiResponse) {
    // test
  }
}
