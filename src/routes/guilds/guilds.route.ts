import { ServiceController } from "#lib/api/ServiceController";
import { Authenticated } from "#lib/api/utils/decorators";
import { canManage } from "#lib/api/utils/helpers";
import { Server, ServerModel } from "#lib/models";
import { ApplyOptions } from "@sapphire/decorators";
import { type ApiRequest, type ApiResponse, methods, type RouteOptions } from "@sapphire/plugin-api";
import { s } from "@sapphire/shapeshift";

const schema = s.object({
  prefix: s.string.lengthLessThan(30).lengthGreaterThan(0).optional,
  commandRestrictions: s.array(s.string.lengthGreaterThan(0)).optional,
  enableSnipeForEveryone: s.boolean.optional,
  language: s.enum("en-US", "pl-PL", "es-ES", "fi-FI", "de-DE", "ru-RU").optional,
});

@ApplyOptions<RouteOptions>({
  route: "guilds/:id",
})
export class GuildRoute extends ServiceController {
  @Authenticated()
  public async [methods.GET](request: ApiRequest, response: ApiResponse) {
    const guildId = request.params.id;
    if (!(await canManage(request.auth?.id, guildId))) {
      return response.notFound();
    }

    const repository = this.createRepository(request, response, Server);

    const data = await repository.get(guildId);

    return this.notFoundIfNull(data, response);
  }

  @Authenticated()
  public async [methods.PATCH](request: ApiRequest, response: ApiResponse) {
    const guildId = request.params.id;
    if (!(await canManage(request.auth?.id, guildId))) {
      return response.notFound();
    }

    const repository = this.createRepository<ServerModel>(request, response, Server);
    const { success, value } = schema.run(request.body);

    if (!success) {
      return response.badRequest("Bad request");
    }

    await repository.patch(guildId, value as any);

    return response.noContent("");
  }
}
