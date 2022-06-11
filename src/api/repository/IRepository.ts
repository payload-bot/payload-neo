import type { Awaitable } from "@sapphire/utilities";

export interface IEntityRepository<TEntity extends object> {
    get(id: string): Awaitable<TEntity | null>;
    patch(id: string, obj: Partial<TEntity>): Awaitable<TEntity | null>;
    delete(id: string): Awaitable<TEntity | null>;
}