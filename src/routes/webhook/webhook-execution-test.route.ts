import { ServiceController } from "#lib/api/ServiceController";
import { sendTest } from "#lib/api/utils/webhook-helper";
import { ApplyOptions } from "@sapphire/decorators";
import { type ApiRequest, type ApiResponse, methods, type RouteOptions } from "@sapphire/plugin-api";
import { isNullish } from "@sapphire/utilities";

@ApplyOptions<RouteOptions>({
  name: "webhooktestv2",
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

    await sendTest(this.client, webhook.type as any, webhook.id);

    return response.noContent();
  }
}

@ApplyOptions<RouteOptions>({
  name: "webhooktestv1",
  route: "v1/webhooks/test",
})
export class WebhookTestv1Route extends ServiceController {
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

    this.container.logger.info(`${request.headers["user-agent"]} made a request to a deprecated endpoint`);

    await sendTest(this.client, webhook.type as any, webhook.id);

    return response.noContent();
  }
}
