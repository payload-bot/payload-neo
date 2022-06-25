import { ServiceController } from "#lib/api/ServiceController";
import { Webhook } from "#lib/models";
import { ApplyOptions } from "@sapphire/decorators";
import {
  type ApiRequest,
  type ApiResponse,
  methods,
  type RouteOptions,
} from "@sapphire/plugin-api";

@ApplyOptions<RouteOptions>({
  route: "webhooks/logs",
})
export class WebhookExecutionRoute extends ServiceController {
  public async [methods.POST](request: ApiRequest, response: ApiResponse) {
    // execute
  }
}
