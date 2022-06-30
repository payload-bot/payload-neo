import { ServiceController } from "#lib/api/ServiceController";
import { Authenticated } from "#lib/api/utils/decorators";
import { canManage } from "#lib/api/utils/helpers";
import { Server, ServerModel, Webhook, WebhookModel } from "#lib/models";
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
    const guildId = request.params.id;
    if (!await canManage(request.auth?.id, guildId)) {
      return response.forbidden();
    }

    const webhookRepo = this.createRepository<WebhookModel>(request, response, Webhook);
    const serverRepo = this.createRepository<ServerModel>(request, response, Server);

    const guild = await serverRepo.get(guildId);

    if (!guild) {
      return response.notFound();
    }

    const { id, ...rest } = request.body as any;

    const newWebhook = await webhookRepo.post(id, rest);

    await serverRepo.patch(guildId, { webhook: newWebhook.id });

    return response.noContent("");
  }
}
