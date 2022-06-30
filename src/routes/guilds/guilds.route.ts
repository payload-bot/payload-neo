import { ServiceController } from "#lib/api/ServiceController";
import { Authenticated } from "#lib/api/utils/decorators";
import { canManage } from "#lib/api/utils/helpers";
import { Server } from "#lib/models";
import { ApplyOptions } from "@sapphire/decorators";
import { type ApiRequest, type ApiResponse, methods, type RouteOptions } from "@sapphire/plugin-api";

@ApplyOptions<RouteOptions>({
  route: "guilds/:id",
})
export class GuildRoute extends ServiceController {
  @Authenticated()
  public async [methods.GET](request: ApiRequest, response: ApiResponse) {
    const guildId = request.params.id;
    if (!(await canManage(request.auth?.id, guildId))) {
      return response.forbidden();
    }

    const repository = this.createRepository(request, response, Server);

    const data = await repository.get(guildId);

    return this.notFoundIfNull(data, response);
  }

  @Authenticated()
  public async [methods.PATCH](request: ApiRequest, response: ApiResponse) {
    const guildId = request.params.id;
    if (!(await canManage(request.auth?.id, guildId))) {
      return response.forbidden();
    }

    const repository = this.createRepository(request, response, Server);
    const body = request.body as any;

    await repository.patch(guildId, body as any);

    return response.noContent("");
  }
}
