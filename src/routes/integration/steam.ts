import { ServiceController } from "#lib/structs/ServiceController.ts";
import { ApplyOptions } from "@sapphire/decorators";
import { ApiRequest, Route, type RouteOptions } from "@sapphire/plugin-api";
import { type } from "arktype";

const schema = type({
  ip: "string.ip",
  pw: "string?",
});

@ApplyOptions<RouteOptions>({
  route: "steam",
  methods: ["GET"],
})
export class SteamRedirectController extends ServiceController {
  override run(request: ApiRequest, response: Route.Response) {
    const result = schema(request.query);

    if (result instanceof type.errors) {
      return response.badRequest({
        error: "Bad request",
        message: result.summary,
      });
    }

    response.statusCode = 302;
    response.setHeader(
      "Location",
      `steam://connect/${result.ip}${result.pw != null ? `/${result.pw}` : ""}`,
    );
    response.end();
  }
}
