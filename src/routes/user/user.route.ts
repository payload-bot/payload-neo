import { ServiceController } from "#lib/api/ServiceController";
import { Authenticated } from "#lib/api/utils/decorators";
import { User, UserModel } from "#lib/models";
import { ApplyOptions } from "@sapphire/decorators";
import { type ApiRequest, type ApiResponse, methods, type RouteOptions } from "@sapphire/plugin-api";
import { s } from "@sapphire/shapeshift";

const schema = s.object({
  steamId: s.string.optional,
});

@ApplyOptions<RouteOptions>({
  route: "users",
})
export class UserRoute extends ServiceController {
  @Authenticated()
  public async [methods.GET](request: ApiRequest, response: ApiResponse) {
    const repository = this.createRepository<UserModel>(request, response, User);

    const { steamId, fun = null } = await repository.get(request.auth!.id);

    return response.ok({ steamId, pushed: fun?.payload?.feetPushed ?? 0 });
  }

  @Authenticated()
  public async [methods.PATCH](request: ApiRequest, response: ApiResponse) {
    const repository = this.createRepository<UserModel>(request, response, User);
    const { success, value } = schema.run(request.body);

    if (!success) {
      return response.badRequest("Bad request");
    }

    await repository.patch(request.auth!.id, value as any);

    return response.noContent("");
  }

  @Authenticated()
  public async [methods.DELETE](request: ApiRequest, response: ApiResponse) {
    const repository = this.createRepository<UserModel>(request, response, User);

    await repository.delete(request.auth!.id);

    // nom nom nom
    response.cookies.delete("__session");

    return response.noContent("");
  }
}
