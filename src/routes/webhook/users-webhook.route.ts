import { ServiceController } from "#lib/api/ServiceController";
import { Authenticated } from "#lib/api/utils/decorators";
import { Webhook, WebhookModel } from "#lib/models";
import { ApplyOptions } from "@sapphire/decorators";
import {
  type ApiRequest,
  type ApiResponse,
  methods,
  type RouteOptions,
} from "@sapphire/plugin-api";

@ApplyOptions<RouteOptions>({
  route: "webhooks/users",
})
export class UsersWebhookRoute extends ServiceController {
  @Authenticated()
  public async [methods.GET](request: ApiRequest, response: ApiResponse) {
    const repository = this.createRepository(request, response, Webhook);

    const data = await repository.get(request.auth!.id);

    return this.notFoundIfNull(data, response);
  }

  @Authenticated()
  public async [methods.POST](request: ApiRequest, response: ApiResponse) {
    const repository = this.createRepository<WebhookModel>(
      request,
      response,
      Webhook
    );

    const data = await repository.get(request.auth!.id);

    if (data == null) {
      return response.badRequest("You can only have one webhook");
    }

    return this.notFoundIfNull(data, response);
  }

  @Authenticated()
  public async [methods.PATCH](request: ApiRequest, response: ApiResponse) {
    const repository = this.createRepository(request, response, Webhook);
    const body = request.body as any;

    await repository.patch(request.auth!.id, body as any);

    return response.noContent("");
  }

  @Authenticated()
  public async [methods.DELETE](request: ApiRequest, response: ApiResponse) {
    const repository = this.createRepository(request, response, Webhook);

    await repository.delete(request.auth!.id);

    return response.noContent("");
  }
}
