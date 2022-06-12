import type { Awaitable } from "@sapphire/utilities";

export interface IEntityRepository<TEntity> {
  /**
   * Gets an entity by ID
   * @param id ObjectId
   */
  get(id: string): Awaitable<TEntity | null>;

  /**
   * PATCHes an entity by ID
   * @param id ObjectId
   * @param obj New data to PATCH to TEntity
   */
  patch(id: string, obj: Partial<TEntity>): Awaitable<TEntity | null>;

  /**
   * DELETEs an entity by ID
   * @param id ObjectId
   */
  delete(id: string): Awaitable<boolean>;

  /**
   * Executes before GETing an entity
   * @param id ObjectId
   */
  preGet(id: string): Awaitable<void>;

  /**
   * Executes before PATCHing an entity
   * @param obj Existing entity
   * @param obj2 New entity
   */
  prePatch(obj: TEntity, obj2: TEntity): Awaitable<void>;

  /**
   * Executes before DELETing an entity
   * @param obj Existing entity
   */
  preDelete(obj: TEntity): Awaitable<void>;

  /**
   * Executes after GETing an entity
   * @param obj Existing entity
   */
  postGet(obj: TEntity): Awaitable<void>;

  /**
   * Executes after PATCHing an entity
   * @param obj Existing entity
   * @param obj2 New entity
   */
  postPatch(obj: TEntity, obj2: TEntity): Awaitable<void>;

  /**
   * Executed after DELETing an entity
   * @param obj Existing entity (before deletion)
   */
  postDelete(obj: TEntity): Awaitable<void>;
}
