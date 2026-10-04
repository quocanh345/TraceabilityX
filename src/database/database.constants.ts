/**
 * DI token for the Drizzle database instance.
 * Repositories inject it with `@Inject(DRIZZLE_CLIENT)`.
 */
export const DRIZZLE_CLIENT = Symbol('DRIZZLE_CLIENT');

/**
 * DI token for the underlying `pg.Pool` connection pool, exposed in case a
 * consumer needs raw pool access (e.g. transactions spanning multiple
 * repositories, health checks, or manual `LISTEN/NOTIFY`).
 */
export const PG_POOL = Symbol('PG_POOL');
