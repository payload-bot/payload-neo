import { ServiceController } from "#lib/api/ServiceController";
import { sendLogPreview } from "#lib/api/utils/webhook-helper";
import { ApplyOptions } from "@sapphire/decorators";
import { type ApiRequest, type ApiResponse, methods, type RouteOptions } from "@sapphire/plugin-api";
import { isNullOrUndefinedOrEmpty, isNullish } from "@sapphire/utilities";
import { webhook } from "#root/drizzle/schema";
import { eq } from "drizzle-orm";
import * as v from "@valibot/valibot";

const schema = v.object({
  logsId: v.union([v.string(), v.number()]),
  demosId: v.union([v.string(), v.number()]),
});

@ApplyOptions<RouteOptions>({
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

    const result = v.safeParse(schema, request.body);

    if (!result.success) {
      return response.badRequest("Bad request");
    }

    await sendLogPreview(this.client, {
      demosId: result.output.demosId.toString(),
      logsId: result.output.logsId.toString(),
      targetId: data[0].id,
      webhookTarget: data[0].type as any,
    });

    return response.noContent();
  }
}

@ApplyOptions<RouteOptions>({
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

    const result = v.safeParse(schema, request.body);

    if (!result.success) {
      return response.badRequest("Bad request");
    }
    this.logger.info(`${request.headers["user-agent"]} made a request to a deprecated endpoint`);

    await sendLogPreview(this.client, {
      demosId: result.output.demosId.toString(),
      logsId: result.output.logsId.toString(),
      targetId: data[0].id,
      webhookTarget: data[0].type as any,
    });

    return response.noContent();
  }
}
