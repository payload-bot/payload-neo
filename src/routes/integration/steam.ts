import { ServiceController } from "#lib/structs/ServiceController";
import { ApplyOptions } from "@sapphire/decorators";
import { type RouteOptions, ApiRequest, Route } from "@sapphire/plugin-api";

@ApplyOptions<RouteOptions>({
  route: "steam",
  methods: ["GET"],
})
export class SteamRedirectController extends ServiceController {
  async run(request: ApiRequest, response: Route.Response) {
    const serverIp = request.query.ip;
    const serverPassword = request.query.pw;

    response.statusCode = 302;
    response.setHeader("Location", `steam://connect/${serverIp}${serverPassword != null ? `/${serverPassword}` : ""}`);
    response.end();
  }
}
