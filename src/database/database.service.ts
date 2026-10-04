import { Inject, Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { Pool } from 'pg';
import { DRIZZLE_CLIENT, PG_POOL } from './database.constants';
import { Database } from './database.types';

/**
 * Thin, injectable wrapper around the pool + Drizzle client.
 *
 * Repositories generally inject `DRIZZLE_CLIENT` directly for queries; this
 * service exists for cross-cutting DB concerns that don't belong in any one
 * repository: graceful shutdown, health checks, and (if ever needed) raw
 * pool access for multi-repository transactions.
 */
@Injectable()
export class DatabaseService implements OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);

  constructor(
    @Inject(PG_POOL) private readonly pool: Pool,
    @Inject(DRIZZLE_CLIENT) private readonly db: Database,
  ) {}

  /** The type-safe Drizzle query builder. */
  get client(): Database {
    return this.db;
  }

  /** Simple connectivity check, e.g. for a `/health` endpoint. */
  async isHealthy(): Promise<boolean> {
    try {
      await this.pool.query('SELECT 1');
      return true;
    } catch (error) {
      this.logger.error('Database health check failed', (error as Error).stack);
      return false;
    }
  }

  /** Closes the connection pool. Called automatically on app shutdown. */
  async onModuleDestroy(): Promise<void> {
    this.logger.log('Closing PostgreSQL connection pool...');
    await this.pool.end();
  }
}
