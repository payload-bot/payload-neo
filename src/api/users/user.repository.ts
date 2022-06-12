import { EntityRepository } from "#api/repository/EntityRepository";
import type { UserModel } from "#lib/models/User";

export class UserRepository extends EntityRepository<UserModel> {
  public override async postGet(obj: UserModel) {
    if (this.identity?.id !== obj.id) {
      throw this.response.notFound();
    }
  }
}
