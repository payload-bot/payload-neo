import type { PieceContext } from "@sapphire/framework";
import {
  type ApiRequest,
  type ApiResponse,
  methods,
  Route,
  type RouteOptions,
} from "@sapphire/plugin-api";
import { isNullish } from "@sapphire/utilities";
import type { IEntityRepository } from "./repository/IRepository";
import { EntityRepository } from "./repository/Repository";

export interface EntityControllerOptions extends RouteOptions {
  model: string;
}

export abstract class EntityController<TEntity extends object> extends Route {
  public logger = this.container.logger;
  public client = this.container.client;

  public repository: IEntityRepository<TEntity>;

  public constructor(context: PieceContext, options: EntityControllerOptions) {
    super(context, options as any);

    this.repository = new EntityRepository(options.model);
  }

  public async [methods.GET](request: ApiRequest, response: ApiResponse) {
    const id = request.params.id;

    console.log(id);

    const data = await this.repository.get(id);

    return this.notFoundIfNull(data, response);
  }

  public async [methods.PATCH](request: ApiRequest, response: ApiResponse) {
    const id = request.params.id;
    // TODO: Validate request body
    const body = request.body as Partial<TEntity>;

    await this.repository.patch(id, body);

    return this.ok(response);
  }

  public async [methods.DELETE](request: ApiRequest, response: ApiResponse) {
    const id = request.params.id;

    await this.repository.delete(id);

    return this.ok(response);
  }

  public ok(response: ApiResponse) {
    return response.status(204).respond("");
  }

  public notFound(response: ApiResponse) {
    return response.status(404).respond({
      code: 404,
      message: "Not found",
    });
  }

  public forbidden(response: ApiResponse) {
    return response.status(403).respond({
      code: 403,
      message: "Forbidden",
    });
  }

  public unauthorized(response: ApiResponse) {
    return response.status(401).respond({
      code: 401,
      message: "Unauthorized",
    });
  }

  public notFoundIfNull<TObj>(data: TObj | null, response: ApiResponse) {
    if (isNullish(data)) {
      return this.notFound(response);
    } else {
      return response.status(200).respond(data);
    }
  }

  public internalServerError(response: ApiResponse) {
    this.logger.error("Internal server error occurred");

    return response.status(500).respond({
      code: 500,
      message: "Internal server error",
    });
  }

  public badRequest(response: ApiResponse) {
    return response.status(400).respond({
      code: 400,
      message: "Bad request",
    });
  }
}
