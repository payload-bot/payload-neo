import { ServiceController } from "#lib/api/ServiceController";
import { sendLogPreview } from "#lib/api/utils/webhook-helper";
import { ApplyOptions } from "@sapphire/decorators";
import { type ApiRequest, type ApiResponse, methods, type RouteOptions } from "@sapphire/plugin-api";
import { isNullish } from "@sapphire/utilities";
import { s } from "@sapphire/shapeshift";

const schema = s.object({
  logsId: s.number.or(s.string),
}).strict;

@ApplyOptions<RouteOptions>({
  name: "webhooklogs",
  route: "webhooks/logs",
})
export class WebhookExecutionRoute extends ServiceController {
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

    const { success, value } = schema.run(request.body);

    if (!success) {
      return response.badRequest("Bad request");
    }

    // safety: value is nullchecked above
    await sendLogPreview(this.client, webhook.type, webhook.id, value!.logsId.toString());

    return response.noContent();
  }
}

@ApplyOptions<RouteOptions>({
  name: "webhooklogs",
  route: "v1/webhooks/logs",
})
export class WebhookExecutionv1Route extends ServiceController {
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

    const { success, value } = schema.run(request.body);

    if (!success) {
      return response.badRequest("Bad request");
    }

    this.container.logger.info(`${request.headers["user-agent"]} made a request to a deprecated endpoint`);

    // safety: value is nullchecked above
    await sendLogPreview(this.client, webhook.type, webhook.id, value!.logsId.toString());

    return response.noContent();
  }
}

