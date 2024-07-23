import { ServiceController } from "#lib/api/ServiceController";
import { sendLogPreview } from "#lib/api/utils/webhook-helper";
import { ApplyOptions } from "@sapphire/decorators";
import { type ApiRequest, type ApiResponse, methods, type RouteOptions } from "@sapphire/plugin-api";
import { isNullOrUndefinedOrEmpty, isNullish } from "@sapphire/utilities";
import { s } from "@sapphire/shapeshift";
import { webhook } from "#root/drizzle/schema";
import { eq } from "drizzle-orm";

const schema = s.object({
  logsId: s.number.or(s.string),
  demosId: s.string.nullish,
}).strict;

@ApplyOptions<RouteOptions>({
  name: "webhooklogs-v2",
  route: "webhooks/logs",
})
export class WebhookExecutionRoute extends ServiceController {
  public async [methods.POST](request: ApiRequest, response: ApiResponse) {
    const headerAuth = request.headers?.authorization;

    if (isNullish(headerAuth)) {
      return response.unauthorized();
    }

    const data = await this.database
      .select({ type: webhook.type, id: webhook.id })
      .from(webhook)
      .where(eq(webhook.value, headerAuth));

    if (isNullOrUndefinedOrEmpty(data)) {
      return response.notFound();
    }

    const { success, value } = schema.run(request.body);

    if (!success) {
      return response.badRequest("Bad request");
    }

    // safety: value is nullchecked above
    await sendLogPreview(this.client, {
      demosId: value.demosId,
      logsId: value.logsId.toString(),
      targetId: data[0].id,
      webhookTarget: data[0].type as any,
    });

    return response.noContent();
  }
}

@ApplyOptions<RouteOptions>({
  name: "webhooklogs-v1",
  route: "v1/webhooks/logs",
})
export class WebhookExecutionv1Route extends ServiceController {
  public async [methods.POST](request: ApiRequest, response: ApiResponse) {
    const headerAuth = request.headers?.authorization;

    if (isNullish(headerAuth)) {
      return response.unauthorized();
    }

    const data = await this.database
      .select({ type: webhook.type, id: webhook.id })
      .from(webhook)
      .where(eq(webhook.value, headerAuth));

    if (isNullOrUndefinedOrEmpty(data)) {
      return response.notFound();
    }

    const { success, value } = schema.run(request.body);

    if (!success) {
      return response.badRequest("Bad request");
    }

    this.container.logger.info(`${request.headers["user-agent"]} made a request to a deprecated endpoint`);

    await sendLogPreview(this.client, {
      demosId: value.demosId,
      logsId: value.logsId.toString(),
      targetId: data[0].id,
      webhookTarget: data[0].type as any,
    });

    return response.noContent();
  }
}
