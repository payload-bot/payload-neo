import type { Awaitable } from "@sapphire/utilities";

export interface IEntityRepository<TEntity extends object> {
    get(id: string): Awaitable<TEntity | null>;
    patch(id: string, obj: Partial<TEntity>): Awaitable<TEntity | null>;
    delete(id: string): Awaitable<TEntity | null>;

    preGet(id: string): void;
    prePatch(obj: TEntity, obj2: TEntity): void;
    preDelete(obj: TEntity): void;

    postGet(obj: TEntity): void;
    postPatch(obj: TEntity, obj2: TEntity): void;
    postDelete(obj: TEntity): void;
}