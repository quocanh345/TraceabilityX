export * from './users.schema';

import { users } from './users.schema';

/**
 * Combined schema object passed to `drizzle(pool, { schema })`.
 * Add every new table here so Drizzle's relational query API (`db.query.*`)
 * and type inference stay aware of it.
 */
export const schema = {
  users,
};
