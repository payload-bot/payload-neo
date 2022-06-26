import { ServiceController } from "#lib/api/ServiceController";
import { sendLogPreview } from "#lib/api/utils/webhook-helper";
import { Webhook } from "#lib/models";
import { ApplyOptions } from "@sapphire/decorators";
import {
  type ApiRequest,
  type ApiResponse,
  methods,
  type RouteOptions,
} from "@sapphire/plugin-api";
import { isNullish } from "@sapphire/utilities";

@ApplyOptions<RouteOptions>({
  route: "webhooks/logs",
})
export class WebhookExecutionRoute extends ServiceController {
  public async [methods.POST](request: ApiRequest, response: ApiResponse) {
    const headerAuth = request.headers?.authorization;

    if (isNullish(headerAuth)) {
      return response.unauthorized();
    }

    const webhook = await Webhook.findOne({ value: headerAuth }).lean().exec();

    if (webhook == null) {
      return response.notFound();
    }

    // FIXME: validate body
    const body = request.body as any;

    await sendLogPreview(this.client, webhook.type, webhook.id, body?.logsId);

    return response.noContent();
  }
}
