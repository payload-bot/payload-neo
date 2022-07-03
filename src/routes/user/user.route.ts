import { ServiceController } from "#lib/api/ServiceController";
import { Authenticated } from "#lib/api/utils/decorators";
import { ApplyOptions } from "@sapphire/decorators";
import { type ApiRequest, type ApiResponse, methods, type RouteOptions } from "@sapphire/plugin-api";
import { s } from "@sapphire/shapeshift";

const schema = s.object({
  steamId: s.string.optional,
}).strict;

@ApplyOptions<RouteOptions>({
  route: "users",
})
export class UserRoute extends ServiceController {
  @Authenticated()
  public async [methods.GET](request: ApiRequest, response: ApiResponse) {
    const user = await this.database.user.findUnique({
      where: { id: request.auth!.id },
      include: { webhook: true },
    });

    return response.ok({ steamId: user?.steamId, pushed: user?.pushed, webhook: user?.webhook });
  }

  @Authenticated()
  public async [methods.PATCH](request: ApiRequest, response: ApiResponse) {
    const { success, value } = schema.run(request.body);

    if (!success) {
      return response.badRequest("Bad request");
    }

    await this.database.user.update({
      where: { id: request.auth!.id },
      data: {
        ...value,
      },
      select: {},
    });

    return response.noContent("");
  }

  @Authenticated()
  public async [methods.DELETE](request: ApiRequest, response: ApiResponse) {
    await this.database.user.delete({
      where: { id: request.auth!.id },
    });

    // nom nom nom
    response.cookies.delete("__session");

    return response.noContent("");
  }
}
