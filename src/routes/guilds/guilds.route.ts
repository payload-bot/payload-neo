import { ServiceController } from "#lib/api/ServiceController";
import { Authenticated, GuildAuth } from "#lib/api/utils/decorators";
import { ApplyOptions } from "@sapphire/decorators";
import { type ApiRequest, type ApiResponse, methods, type RouteOptions } from "@sapphire/plugin-api";
import { s } from "@sapphire/shapeshift";

const schema = s.object({
  prefix: s.string.lengthLessThan(30).lengthGreaterThan(0).optional,
  commandRestrictions: s.array(s.string.lengthGreaterThan(0)).optional,
  enableSnipeForEveryone: s.boolean.optional,
  language: s.enum("en-US", "pl-PL", "es-ES", "fi-FI", "de-DE", "ru-RU").optional,
}).strict;

@ApplyOptions<RouteOptions>({
  route: "guilds/:id",
})
export class GuildRoute extends ServiceController {
  @Authenticated()
  @GuildAuth()
  public async [methods.GET](request: ApiRequest, response: ApiResponse) {
    const guildId = request.params.id;

    const guild = await this.database.guild.findUnique({
      where: { id: guildId },
    });

    return this.notFoundIfNull(guild, response);
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
      data: value as any,
    });

    return response.noContent("");
  }
}
