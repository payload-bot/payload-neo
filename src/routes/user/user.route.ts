import { ServiceController } from "#lib/api/ServiceController";
import { Authenticated } from "#lib/api/utils/decorators";
import { Prisma } from "@prisma/client";
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
    });

    return response.noContent("");
  }

  @Authenticated()
  public async [methods.DELETE](request: ApiRequest, response: ApiResponse) {
    try {
      await this.database.user.delete({
        where: { id: request.auth!.id },
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        this.logger.error(e);
        return response.error("Internal server error");
      }
    }

    // Revoke tokens and do a "logout"
    const routes = this.container.stores.get("routes");
    const endpoint = routes.get("logout");

    return await endpoint!.methods.first()!.call(endpoint!, request, response);
  }
}
