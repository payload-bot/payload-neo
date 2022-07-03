import { ServiceController } from "#lib/api/ServiceController";
import { Authenticated, GuildAuth } from "#lib/api/utils/decorators";
import { ApplyOptions } from "@sapphire/decorators";
import { type ApiRequest, type ApiResponse, methods, type RouteOptions } from "@sapphire/plugin-api";
import { s } from "@sapphire/shapeshift";

const schema = s.object({
  channelId: s.string,
}).strict;

@ApplyOptions<RouteOptions>({
  route: "webhooks/guilds/:id",
})
export class GuildWebhookRoute extends ServiceController {
  @Authenticated()
  @GuildAuth()
  public async [methods.GET](request: ApiRequest, response: ApiResponse) {
    const guildId = request.params.id;

    const guild = await this.database.guild.findUnique({
      where: { id: guildId },
      include: { webhook: true },
    });

    return this.notFoundIfNull(guild?.webhook, response);
  }

  @Authenticated()
  @GuildAuth()
  public async [methods.PATCH](request: ApiRequest, response: ApiResponse) {
    const guildId = request.params.id;
    const { success, value } = schema.run(request.body);

    if (!success) {
      return response.badRequest("Bad request");
    }

    await this.database.guild.update({
      where: { id: guildId },
      data: {
        webhook: {
          update: {
            id: value!.channelId,
          },
        },
      },
    });

    return response.noContent("");
  }

  @Authenticated()
  @GuildAuth()
  public async [methods.DELETE](request: ApiRequest, response: ApiResponse) {
    const guildId = request.params.id;

    await this.database.guild.update({
      where: { id: guildId },
      data: {
        webhook: {
          delete: true,
        },
      },
    });

    return response.noContent("");
  }
}
