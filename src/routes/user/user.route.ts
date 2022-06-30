import { ServiceController } from "#lib/api/ServiceController";
import { Authenticated } from "#lib/api/utils/decorators";
import { User } from "#lib/models";
import { ApplyOptions } from "@sapphire/decorators";
import {
  type ApiRequest,
  type ApiResponse,
  methods,
  type RouteOptions,
} from "@sapphire/plugin-api";

@ApplyOptions<RouteOptions>({
  route: "users",
})
export class UserRoute extends ServiceController {
  @Authenticated()
  public async [methods.GET](request: ApiRequest, response: ApiResponse) {
    const repository = this.createRepository(request, response, User);

    const data = await repository.get(request.auth!.id);

    return this.notFoundIfNull(data, response);
  }

  @Authenticated()
  public async [methods.PATCH](request: ApiRequest, response: ApiResponse) {
    const repository = this.createRepository(request, response, User);
    const body = request.body as any;

    await repository.patch(request.auth!.id, body as any);

    return response.noContent("");
  }

  @Authenticated()
  public async [methods.DELETE](request: ApiRequest, response: ApiResponse) {
    const repository = this.createRepository(request, response, User);

    await repository.delete(request.auth!.id);

    // nom nom nom
    response.cookies.delete("__session");

    return response.noContent("");
  }
}
