import { ServiceController } from "#lib/structs/ServiceController.ts";
import { sendTest } from "#lib/utils/webhook-helper.ts";
import { webhook } from "#root/drizzle/schema.ts";
import { ApplyOptions } from "@sapphire/decorators";
import { type ApiRequest, type ApiResponse, type RouteOptions } from "@sapphire/plugin-api";
import { isNullOrUndefinedOrEmpty, isNullish } from "@sapphire/utilities";
import { eq } from "drizzle-orm";

@ApplyOptions<RouteOptions>({
  route: "webhooks/test",
  methods: ["POST"],
})
export class WebhookTestRoute extends ServiceController {
  public async run(request: ApiRequest, response: ApiResponse) {
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

    await sendTest(this.client, data[0].type as any, data[0].id);

    return response.noContent();
  }
}

@ApplyOptions<RouteOptions>({
  route: "v1/webhooks/test",
  methods: ["POST"],
})
export class WebhookTestv1Route extends ServiceController {
  public async run(request: ApiRequest, response: ApiResponse) {
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

    this.logger.info(`${request.headers["user-agent"]} made a request to a deprecated endpoint`);

    await sendTest(this.client, data[0].type as any, data[0].id);

    return response.noContent();
  }
}
