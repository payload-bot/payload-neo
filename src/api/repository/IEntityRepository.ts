import type { Awaitable } from "@sapphire/utilities";

export interface IEntityRepository<TEntity extends object> {
  get(id: string): Awaitable<TEntity | null>;
  patch(id: string, obj: Partial<TEntity>): Awaitable<TEntity | null>;
  delete(id: string): Awaitable<boolean>;

  preGet(id: string): Awaitable<void>;
  prePatch(obj: TEntity, obj2: TEntity): Awaitable<void>;
  preDelete(obj: TEntity): Awaitable<void>;

  postGet(obj: TEntity): Awaitable<void>;
  postPatch(obj: TEntity, obj2: TEntity): Awaitable<void>;
  postDelete(obj: TEntity): Awaitable<void>;
}
