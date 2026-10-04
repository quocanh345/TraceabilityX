import { InferInsertModel, InferSelectModel, SQL, eq, sql } from 'drizzle-orm';
import { PgColumn, PgTable } from 'drizzle-orm/pg-core';
import { Database } from '../../database/database.types';

/** Constraint: any Drizzle pg table that has a primary `id` column. */
type TableWithId = PgTable & { id: PgColumn };

/**
 * Generic CRUD repository over a single Drizzle table.
 *
 * Query-building lives here and in its subclasses — never in controllers or
 * services. Extend this class per table (see `UsersRepository`) to inherit
 * `findAll`/`findById`/`create`/`update`/`delete`/`count`, then add
 * table-specific queries alongside them.
 *
 * Note: a handful of internal casts (`as never` / `as unknown`) are required
 * because Drizzle's column/table typings don't flow through a *generic*
 * abstract class the way they do for a table used directly. The public
 * methods stay fully typed via `TSelect`/`TInsert`; only the plumbing here
 * is cast.
 */
export abstract class BaseRepository<
  TTable extends TableWithId,
  TSelect = InferSelectModel<TTable>,
  TInsert = InferInsertModel<TTable>,
> {
  protected constructor(
    protected readonly db: Database,
    protected readonly table: TTable,
  ) {}

  async findAll(): Promise<TSelect[]> {
    const rows = (await this.db.select().from(this.table as never)) as unknown as TSelect[];
    return rows;
  }

  async findById(id: string): Promise<TSelect | undefined> {
    const rows = (await this.db
      .select()
      .from(this.table as never)
      .where(eq(this.table.id, id))
      .limit(1)) as unknown as TSelect[];
    return rows[0];
  }

  async findOneBy(condition: SQL): Promise<TSelect | undefined> {
    const rows = (await this.db
      .select()
      .from(this.table as never)
      .where(condition)
      .limit(1)) as unknown as TSelect[];
    return rows[0];
  }

  async create(data: TInsert): Promise<TSelect> {
    const rows = (await this.db
      .insert(this.table)
      .values(data as never)
      .returning()) as unknown as TSelect[];
    return rows[0];
  }

  async update(id: string, data: Partial<TInsert>): Promise<TSelect | undefined> {
    const rows = (await this.db
      .update(this.table)
      .set(data as never)
      .where(eq(this.table.id, id))
      .returning()) as unknown as TSelect[];
    return rows[0];
  }

  async delete(id: string): Promise<boolean> {
    const rows = await this.db
      .delete(this.table)
      .where(eq(this.table.id, id))
      .returning({ id: this.table.id });
    return rows.length > 0;
  }

  async count(): Promise<number> {
    const rows = (await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(this.table as never)) as unknown as { count: number }[];
    return rows[0]?.count ?? 0;
  }
}
