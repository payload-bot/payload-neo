import { ServiceController } from "#lib/structs/ServiceController.ts";
import { sendLogPreview } from "#lib/utils/webhook-helper.ts";
import { ApplyOptions } from "@sapphire/decorators";
import {
  type ApiRequest,
  type ApiResponse,
  Route,
  type RouteOptions,
} from "@sapphire/plugin-api";
import { isNullish, isNullOrUndefinedOrEmpty } from "@sapphire/utilities";
import { webhook } from "#root/drizzle/schema.ts";
import { eq } from "drizzle-orm";
import { type } from "arktype";

const schema = type({
  demosId: "string | number.integer >= 0",
  logsId: "string | number.integer >= 0",
});

@ApplyOptions<RouteOptions>({
  route: "webhooks/logs",
  methods: ["POST"],
})
export class WebhookExecutionRoute extends ServiceController {
  public async run(request: Route.Request, response: Route.Response) {
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

    const body = await request.readBodyJson();
    const result = schema(body);

    if (result instanceof type.errors) {
      return response.badRequest({
        error: "Bad request",
        message: result.summary,
      });
    }

    await sendLogPreview(this.client, {
      demosId: result.demosId.toString(),
      logsId: result.logsId.toString(),
      targetId: data[0].id,
      webhookTarget: data[0].type as any,
    });

    return response.noContent();
  }
}

@ApplyOptions<RouteOptions>({
  route: "v1/webhooks/logs",
  methods: ["POST"],
})
export class WebhookExecutionv1Route extends ServiceController {
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

    const body = await request.readBodyJson();
    const result = schema(body);

    if (result instanceof type.errors) {
      return response.badRequest({
        error: "Bad request",
        message: result.summary,
      });
    }

    this.logger.info(
      `${
        request.headers["user-agent"]
      } made a request to a deprecated endpoint`,
    );

    await sendLogPreview(this.client, {
      demosId: result.demosId.toString(),
      logsId: result.logsId.toString(),
      targetId: data[0].id,
      webhookTarget: data[0].type as any,
    });

    return response.noContent();
  }
}
