import { ServiceController } from "#lib/api/ServiceController";
import { ApplyOptions } from "@sapphire/decorators";
import { type ApiResponse, methods, type RouteOptions, ApiRequest } from "@sapphire/plugin-api";

@ApplyOptions<RouteOptions>({
  route: "steam",
})
export class SteamRedirectController extends ServiceController {
  public async [methods.GET](request: ApiRequest, response: ApiResponse) {
    const serverIp = request.query.ip;
    const serverPassword = request.query.pw;

    response.statusCode = 302;
    response.setHeader('Location', `steam://connect/${serverIp}${serverPassword != null ? `/${serverPassword}` : ''}`);
    response.end();
  }
}
