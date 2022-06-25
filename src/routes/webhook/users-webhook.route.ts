import { ServiceController } from "#lib/api/ServiceController";
import { Authenticated } from "#lib/api/utils/decorators";
import { Webhook } from "#lib/models";
import { ApplyOptions } from "@sapphire/decorators";
import {
  type ApiRequest,
  type ApiResponse,
  methods,
  type RouteOptions,
} from "@sapphire/plugin-api";

@ApplyOptions<RouteOptions>({
  route: "users/:id",
})
export class UsersWebhookRoute extends ServiceController {
  @Authenticated()
  public async [methods.GET](request: ApiRequest, response: ApiResponse) {
    const id = request.params.id;
    if (request.auth?.id !== id) {
      return response.forbidden();
    }

    const repository = this.createRepository(request, response, Webhook);

    const data = await repository.get(id);

    return this.notFoundIfNull(data, response);
  }

  @Authenticated()
  public async [methods.PATCH](request: ApiRequest, response: ApiResponse) {
    const id = request.params.id;
    if (request.auth?.id !== id) {
      return response.forbidden();
    }

    const repository = this.createRepository(request, response, Webhook);
    const body = request.body as any;

    await repository.patch(id, body as any);

    return response.noContent("");
  }

  @Authenticated()
  public async [methods.DELETE](request: ApiRequest, response: ApiResponse) {
    const id = request.params.id;
    if (request.auth?.id !== id) {
      return response.forbidden();
    }

    const repository = this.createRepository(request, response, Webhook);

    await repository.delete(id);

    return response.noContent("");
  }
}
