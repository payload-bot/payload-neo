import type { IEntityRepository } from "./IEntityRepository";
import { Server } from "../../lib/models/Server";
import { User } from "../../lib/models/User";
import type { Model } from "mongoose";
import type { ApiRequest, ApiResponse, AuthData } from "@sapphire/plugin-api";
import { container } from "@sapphire/framework";

export class EntityRepository<TEntity> implements IEntityRepository<TEntity> {
  protected repository: typeof Model;
  protected request: ApiRequest;
  protected response: ApiResponse;
  protected identity: AuthData | null | undefined;
  protected logger = container.logger;

  constructor(
    model: string,
    request: ApiRequest,
    response: ApiResponse,
    identity: AuthData
  ) {
    this.repository = this.#convertToModel(model);
    this.request = request;
    this.response = response;
    this.identity = identity;
  }

  preGet(_id: string) {}

  prePatch(_obj: TEntity, _obj2: TEntity) {}

  preDelete(_obj: TEntity) {}

  postGet(_obj: TEntity) {}

  postPatch(_obj: TEntity, _obj2: TEntity) {}

  postDelete(_obj: TEntity) {}

  public async get(id: string) {
    await this.preGet(id);
    const data = await this.repository.findById(id, {}).lean();
    await this.postGet(data!);
    return data;
  }

  public async patch(id: string, obj: Partial<TEntity>) {
    const prevDat = await this.get(id);
    await this.prePatch(prevDat, { ...prevDat, ...obj });
    const data = await this.repository
      .findByIdAndUpdate(id, obj)
      .orFail()
      .lean();
    await this.postPatch(prevDat, data);
    return data;
  }

  public async delete(id: string) {
    const existing = await this.get(id);
    await this.preDelete(existing);
    const data = await this.repository.findByIdAndDelete(id).orFail();
    await this.postDelete(existing);
    return data;
  }

  #convertToModel(stringifiedModel: string) {
    switch (stringifiedModel) {
      case "Server": {
        return Server;
      }

      case "User": {
        return User;
      }

      default: {
        throw new Error("Unknown model");
      }
    }
  }
}
