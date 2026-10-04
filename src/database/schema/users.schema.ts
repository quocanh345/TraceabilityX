import { boolean, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

/**
 * `users` table definition.
 * This is the single source of truth for both the SQL schema (via drizzle-kit
 * migrations) and the TypeScript types used across repositories/services.
 */
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  fullName: varchar('full_name', { length: 255 }).notNull(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
