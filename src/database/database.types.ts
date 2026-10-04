import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { schema } from './schema';

/**
 * Fully-typed Drizzle database handle: `db.select()`, `db.insert()`, and
 * `db.query.<table>` are all typed against `schema`.
 */
export type Database = NodePgDatabase<typeof schema>;
