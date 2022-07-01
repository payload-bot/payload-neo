import { ServiceController } from "#lib/api/ServiceController";
import { Authenticated } from "#lib/api/utils/decorators";
import { canManage } from "#lib/api/utils/helpers";
import { Server, ServerModel, Webhook, WebhookModel } from "#lib/models";
import { ApplyOptions } from "@sapphire/decorators";
import { type ApiRequest, type ApiResponse, methods, type RouteOptions } from "@sapphire/plugin-api";
import { s } from "@sapphire/shapeshift";

const schema = s.object({
  channelId: s.string,
});

@ApplyOptions<RouteOptions>({
  route: "webhooks/guilds/:id",
})
export class GuildWebhookRoute extends ServiceController {
  @Authenticated()
  public async [methods.GET](request: ApiRequest, response: ApiResponse) {
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

    if (guild.webhook == null) {
      return response.notFound();
    }

    const webhook = await webhookRepo.get(guild.webhook);

    return this.notFoundIfNull(webhook, response);
  }

  @Authenticated()
  public async [methods.PATCH](request: ApiRequest, response: ApiResponse) {
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

    if (guild.webhook == null) {
      return response.notFound();
    }

    const { success, value } = schema.run(request.body);

    if (!success) {
      return response.badRequest("Bad request");
    }

    await webhookRepo.patch(guild.webhook, value as any);

    return response.noContent("");
  }

  @Authenticated()
  public async [methods.DELETE](request: ApiRequest, response: ApiResponse) {
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

    if (guild.webhook == null) {
      return response.notFound();
    }

    await webhookRepo.delete(guild.webhook);

    return response.noContent("");
  }
}
