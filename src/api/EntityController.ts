import type { PieceContext } from "@sapphire/framework";
import {
  type ApiRequest,
  type ApiResponse,
  methods,
  Route,
  type RouteOptions,
} from "@sapphire/plugin-api";
import { isNullish } from "@sapphire/utilities";
import type { Model } from "mongoose";
import type { IEntityRepository } from "./repository/IEntityRepository";
import { EntityRepository } from "./repository/EntityRepository";
import { Authenticate } from "./utils/decorators";

export interface EntityControllerOptions extends RouteOptions {
  model: string;
  repository?: any;
}

export abstract class EntityController<
  TEntity extends typeof Model
> extends Route {
  public logger = this.container.logger;
  public client = this.container.client;

  public repository: IEntityRepository<TEntity>;

  public constructor(context: PieceContext, options: EntityControllerOptions) {
    super(context, options as any);

    if (options.repository) {
      this.repository = new options.repository(options.model);
    }

    this.repository = new EntityRepository(options.model);
  }

  @Authenticate()
  public async [methods.GET](request: ApiRequest, response: ApiResponse) {
    const id = request.params.id;

    const data = await this.repository.get(id);

    return this.notFoundIfNull(data, response);
  }

  public async [methods.PATCH](request: ApiRequest, response: ApiResponse) {
    const id = request.params.id;
    // TODO: Validate request body
    const body = request.body as Partial<TEntity>;

    await this.repository.patch(id, body);

    return response.ok(response);
  }

  public async [methods.DELETE](request: ApiRequest, response: ApiResponse) {
    const id = request.params.id;

    await this.repository.delete(id);

    return response.ok(response);
  }

  public notFoundIfNull<TObj>(data: TObj | null, response: ApiResponse) {
    if (isNullish(data)) {
      return response.notFound();
    } else {
      return response.ok(data);
    }
  }
}
