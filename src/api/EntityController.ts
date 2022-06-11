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
import type { IEntityRepository } from "./repository/IRepository";
import { EntityRepository } from "./repository/Repository";
import { Authenticate } from "./utils/decorators";

export interface EntityControllerOptions extends RouteOptions {
  model: string;
}

export abstract class EntityController<
  TEntity extends typeof Model
> extends Route {
  public logger = this.container.logger;
  public client = this.container.client;

  public repository: IEntityRepository<TEntity>;

  public constructor(context: PieceContext, options: EntityControllerOptions) {
    super(context, options as any);

    this.repository = new EntityRepository(options.model);
  }

  @Authenticate()
  public async [methods.GET](request: ApiRequest, response: ApiResponse) {
    const id = request.params.id;

    const data = await this.repository.get(id);

    this.#enforce(request, response, data);

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

  #enforce(_request: ApiRequest, _response: ApiResponse, data: TEntity | null) {
    if (isNullish(data)) {
      return;
    }

    // TODO: enforcement of permissions
  }
}
