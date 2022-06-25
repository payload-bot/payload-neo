import type { PieceContext } from "@sapphire/framework";
import { type ApiResponse, Route, type RouteOptions, type ApiRequest } from "@sapphire/plugin-api";
import { isNullish } from "@sapphire/utilities";
import type { Model } from "mongoose";
import { EntityRepository } from "./repository/EntityRepository";

export abstract class ServiceController extends Route {
  protected logger = this.container.logger;
  protected client = this.container.client;

  public constructor(context: PieceContext, options: RouteOptions) {
    super(context, options as any);
  }

  public notFoundIfNull<TObj>(data: TObj | null, response: ApiResponse) {
    if (isNullish(data)) {
      return response.notFound();
    } else {
      return response.ok(data);
    }
  }

  protected createRepository(request: ApiRequest, response: ApiResponse, model: typeof Model) {
    const identity = request.auth;

    return new EntityRepository(model, request, response, identity!);
  }
}
