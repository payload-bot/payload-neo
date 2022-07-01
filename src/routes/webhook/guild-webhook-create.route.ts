import { ServiceController } from "#lib/api/ServiceController";
import { Authenticated } from "#lib/api/utils/decorators";
import { canManage } from "#lib/api/utils/helpers";
import { Server, ServerModel, Webhook, WebhookModel } from "#lib/models";
import { ApplyOptions } from "@sapphire/decorators";
import { type ApiRequest, type ApiResponse, methods, type RouteOptions } from "@sapphire/plugin-api";
import { generate } from "generate-password";
import { s } from "@sapphire/shapeshift";

const schema = s.object({
  channelId: s.string,
});

@ApplyOptions<RouteOptions>({
  route: "webhooks/guilds",
})
export class GuildWebhookCreateRoute extends ServiceController {
  @Authenticated()
  public async [methods.POST](request: ApiRequest, response: ApiResponse) {
    const guildId = request.params.id;
    if (!(await canManage(request.auth?.id, guildId))) {
      return response.forbidden();
    }

    const webhookRepo = this.createRepository<WebhookModel>(request, response, Webhook);
    const serverRepo = this.createRepository<ServerModel>(request, response, Server);

    const guild = await serverRepo.get(guildId);

    if (!guild) {
      return response.notFound();
    }

    const { success, value } = schema.run(request.body);

    if (!success) {
      return response.badRequest("Bad request");
    }

    const newWebhook = await webhookRepo.post(value!.channelId, {
      id: value!.channelId,
      type: "channels",
      value: generate({
        length: 40,
        numbers: true,
        strict: true,
      }),
    });

    await serverRepo.patch(guildId, { webhook: newWebhook.id });

    return response.noContent("");
  }
}
