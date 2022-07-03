import type { PrismaClient } from "@prisma/client";
import type { PieceContext } from "@sapphire/framework";
import { type ApiResponse, Route, type RouteOptions, type ApiRequest } from "@sapphire/plugin-api";
import { isNullish } from "@sapphire/utilities";
import { EntityRepository } from "./repository/EntityRepository";

export type Entity = PrismaClient["user"] | PrismaClient["guild"] | PrismaClient["webhook"];

export abstract class ServiceController extends Route {
  protected logger = this.container.logger;
  protected client = this.container.client;
  protected database = this.container.database;

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

  protected createRepository(request: ApiRequest, response: ApiResponse, model: Entity) {
    const identity = request.auth;

    return new EntityRepository<Entity>(model, request, response, identity!);
  }
}
