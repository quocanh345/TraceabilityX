import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { BaseRepository } from '../common/repositories/base.repository';
import { DRIZZLE_CLIENT } from '../database/database.constants';
import { users } from '../database/schema';
import { Database } from '../database/database.types';

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

/**
 * Encapsulates every SQL query for the `users` table. Controllers and
 * services never touch Drizzle directly — they call methods here.
 */
@Injectable()
export class UsersRepository extends BaseRepository<typeof users, User, NewUser> {
  constructor(@Inject(DRIZZLE_CLIENT) db: Database) {
    super(db, users);
  }

  /** Table-specific query beyond the generic CRUD inherited from BaseRepository. */
  async findByEmail(email: string): Promise<User | undefined> {
    return this.findOneBy(eq(users.email, email));
  }
}
