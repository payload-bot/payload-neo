import type { PieceContext } from "@sapphire/framework";
import { type ApiRequest, type ApiResponse, methods, Route, type RouteOptions } from "@sapphire/plugin-api";
import { isNullish } from "@sapphire/utilities";
import { EntityRepository } from "./repository/EntityRepository.js";
import { FixKnownErrors } from "./utils/decorators.js";

export interface EntityControllerOptions extends RouteOptions {
  model?: any;
  repository?: new (...args: any[]) => any;
}

export abstract class EntityController<TEntity> extends Route {
  public logger = this.container.logger;
  public client = this.container.client;

  public constructor(context: PieceContext, options: EntityControllerOptions) {
    super(context, options as any);
  }

  @FixKnownErrors
  public async [methods.GET](request: ApiRequest, response: ApiResponse) {
    const id = request.params.id;
    const repository = this.#createRepository(request, response);

    const data = await repository.get(id);

    return this.notFoundIfNull(data, response);
  }

  @FixKnownErrors
  public async [methods.PATCH](request: ApiRequest, response: ApiResponse) {
    const repository = this.#createRepository(request, response);
    const id = request.params.id;
    // TODO: Validate request body
    const body = request.body as Partial<TEntity>;

    await repository.patch(id, body as any);

    return response.noContent("");
  }

  @FixKnownErrors
  public async [methods.DELETE](request: ApiRequest, response: ApiResponse) {
    const repository = this.#createRepository(request, response);
    const id = request.params.id;

    await repository.delete(id);

    return response.noContent("");
  }

  public notFoundIfNull<TObj>(data: TObj | null, response: ApiResponse) {
    if (isNullish(data)) {
      return response.notFound();
    } else {
      return response.ok(data);
    }
  }

  #createRepository(request: ApiRequest, response: ApiResponse) {
    const { repository, model } = this.options as EntityControllerOptions;
    const identity = request.auth;

    if (repository) {
      return new repository(model!, request, response, identity!);
    }

    return new EntityRepository(model!, request, response, identity!);
  }
}
