import { EntityRepository } from "#api/repository/EntityRepository";
import type { User, UserModel } from "#lib/models/User";

export class UserRepository extends EntityRepository<typeof User, UserModel> {
  public override async postGet(obj: UserModel) {
    if (this.identity?.id !== obj?.id) {
      throw this.response.notFound();
    }
  }
}
