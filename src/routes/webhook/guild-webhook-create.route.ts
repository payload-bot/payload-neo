import { ServiceController } from "#lib/api/ServiceController";
import { Authenticated } from "#lib/api/utils/decorators";
import { Webhook } from "#lib/models";
import { ApplyOptions } from "@sapphire/decorators";
import {
  type ApiRequest,
  type ApiResponse,
  methods,
  type RouteOptions,
} from "@sapphire/plugin-api";

@ApplyOptions<RouteOptions>({
  route: "webhooks/guilds",
})
export class GuildWebhookCreateRoute extends ServiceController {
  @Authenticated()
  public async [methods.POST](request: ApiRequest, response: ApiResponse) {
    const id = request.params.id;
    if (request.auth?.id !== id) {
      return response.forbidden();
    }

    const repository = this.createRepository(request, response, Webhook);

    const data = await repository.get(id);

    return this.notFoundIfNull(data, response);
  }
}
