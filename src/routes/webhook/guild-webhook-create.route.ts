import { ServiceController } from "#lib/api/ServiceController";
import { Authenticated, GuildAuth } from "#lib/api/utils/decorators";
import { ApplyOptions } from "@sapphire/decorators";
import { type ApiRequest, type ApiResponse, methods, type RouteOptions } from "@sapphire/plugin-api";
import { generate } from "generate-password";
import { s } from "@sapphire/shapeshift";
import { WebhookType } from "@prisma/client";

const schema = s.object({
  channelId: s.string,
}).strict;

@ApplyOptions<RouteOptions>({
  route: "webhooks/guilds",
})
export class GuildWebhookCreateRoute extends ServiceController {
  @Authenticated()
  @GuildAuth()
  public async [methods.POST](request: ApiRequest, response: ApiResponse) {
    const guildId = request.params.id;

    const guild = await this.database.guild.findUnique({
      where: { id: guildId },
      select: {
        webhookId: true,
      },
    });

    if (guild?.webhookId != null) {
      return response.notFound();
    }

    const { success, value } = schema.run(request.body);

    if (!success) {
      return response.badRequest("Bad request");
    }

    await this.database.guild.update({
      where: { id: guildId },
      data: {
        webhook: {
          create: {
            id: value!.channelId,
            type: WebhookType.channels,
            value: generate({
              length: 40,
              numbers: true,
              strict: true,
            }),
          },
        },
      },
    });

    return response.noContent("");
  }
}
