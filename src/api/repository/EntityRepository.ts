import type { IEntityRepository } from "./IEntityRepository";
import { Server } from "../../lib/models/Server";
import { User } from "../../lib/models/User";
import type { Model } from "mongoose";

export class EntityRepository<TEntity extends typeof Model>
  implements IEntityRepository<TEntity>
{
  #repository: typeof Model;

  constructor(public model: string) {
    this.#repository = this.#convertToModel(model);
  }

  preGet(_id: string) {}

  prePatch(_obj: TEntity, _obj2: TEntity) {}

  preDelete(_obj: TEntity) {}

  postGet(_obj: TEntity) {}

  postPatch(_obj: TEntity, _obj2: TEntity) {}

  postDelete(_obj: TEntity) {}

  public async get(id: string) {
    try {
      return await this.#repository.findById(id, {}).orFail().lean();
    } catch {
      return null;
    }
  }

  public async patch(id: string, obj: Partial<TEntity>) {
    return await this.#repository.findByIdAndUpdate(id, obj).orFail().lean();
  }

  public async delete(id: string) {
    return await this.#repository.findByIdAndDelete(id).orFail();
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
