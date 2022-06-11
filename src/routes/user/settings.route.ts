import { ApplyOptions } from "@sapphire/decorators";
import {
  ApiResponse,
  methods,
  Route,
  RouteOptions,
} from "@sapphire/plugin-api";

@ApplyOptions<RouteOptions>({ route: "/test" })
export class UserRoute extends Route {
  public async [methods.GET](_: unknown, res: ApiResponse) {
    return res.status(200).respond("yo tf?");
  }
}
