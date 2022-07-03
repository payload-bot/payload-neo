import { ServiceController } from "#lib/api/ServiceController";
import { Authenticated } from "#lib/api/utils/decorators";
import { WebhookType } from "@prisma/client";
import { ApplyOptions } from "@sapphire/decorators";
import { type ApiRequest, type ApiResponse, methods, type RouteOptions } from "@sapphire/plugin-api";
import { generate } from "generate-password";

@ApplyOptions<RouteOptions>({
  route: "webhooks/users",
})
export class UsersWebhookRoute extends ServiceController {
  @Authenticated()
  public async [methods.GET](request: ApiRequest, response: ApiResponse) {
    const user = await this.database.user.findUnique({
      where: { id: request.auth!.id },
      include: { webhook: true },
    });

    return this.notFoundIfNull(user?.webhook, response);
  }

  @Authenticated()
  public async [methods.POST](request: ApiRequest, response: ApiResponse) {
    const hasWebhook = await this.database.user.findUnique({
      where: { id: request.auth!.id },
      include: { webhook: true },
    });

    if (hasWebhook != null) {
      return response.badRequest("You can only have one webhook at a time");
    }

    await this.database.user.update({
      where: { id: request.auth!.id },
      data: {
        webhook: {
          create: {
            id: request.auth!.id,
            type: WebhookType.users,
            value: generate({
              length: 40,
              numbers: true,
              strict: true,
            }),
          },
        },
      },
    });

    return response.created("");
  }

  @Authenticated()
  public async [methods.DELETE](request: ApiRequest, response: ApiResponse) {
    await this.database.user.update({
      where: { id: request.auth!.id },
      data: {
        webhook: {
          delete: true,
        },
      },
    });

    return response.noContent("");
  }
}
