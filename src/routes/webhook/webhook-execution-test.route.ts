import { ServiceController } from "#lib/api/ServiceController";
import { sendTest } from "#lib/api/utils/webhook-helper";
import { ApplyOptions } from "@sapphire/decorators";
import { type ApiRequest, type ApiResponse, methods, type RouteOptions } from "@sapphire/plugin-api";
import { isNullish } from "@sapphire/utilities";

@ApplyOptions<RouteOptions>({
  route: "webhooks/test",
})
export class WebhookTestRoute extends ServiceController {
  public async [methods.POST](request: ApiRequest, response: ApiResponse) {
    const headerAuth = request.headers?.authorization;

    if (isNullish(headerAuth)) {
      return response.unauthorized();
    }

    const webhook = await this.database.webhook.findUnique({
      where: { value: headerAuth },
      select: { type: true, id: true },
    });

    if (webhook == null) {
      return response.notFound();
    }

    await sendTest(this.client, webhook.type, webhook.id);

    return response.noContent();
  }
}
