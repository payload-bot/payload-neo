import type { LoaderPieceContext } from "@sapphire/framework";
import { type ApiResponse, Route, type RouteOptions } from "@sapphire/plugin-api";
import { isNullish } from "@sapphire/utilities";

export abstract class ServiceController extends Route {
  protected logger = this.container.logger;
  protected client = this.container.client;
  protected database = this.container.database;

  public constructor(context: LoaderPieceContext, options: RouteOptions) {
    super(context as any, options as any);
  }

  public notFoundIfNull<TObj>(data: TObj | null, response: ApiResponse) {
    if (isNullish(data)) {
      return response.notFound();
    } else {
      return response.ok(data);
    }
  }
}
