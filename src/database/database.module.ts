import { Global, Logger, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { DatabaseConfig } from '../config/configuration';
import { DRIZZLE_CLIENT, PG_POOL } from './database.constants';
import { DatabaseService } from './database.service';
import { schema } from './schema';

const logger = new Logger('DatabaseModule');

/**
 * Global database layer.
 *
 * - `PG_POOL`: the raw `pg.Pool` connection pool, built from env vars via ConfigService.
 * - `DRIZZLE_CLIENT`: the type-safe Drizzle query builder wrapping that pool.
 *
 * Both providers are created via `useFactory` so they exist *before* any
 * consumer's constructor runs (unlike wiring them up in `onModuleInit`,
 * which would leave them `undefined` during DI resolution).
 *
 * `@Global()` means any feature module can `@Inject(DRIZZLE_CLIENT)` or use
 * `DatabaseService` without re-importing `DatabaseModule` — it only needs to
 * be imported once, in `AppModule`.
 */
@Global()
@Module({
  providers: [
    {
      provide: PG_POOL,
      inject: [ConfigService],
      useFactory: (configService: ConfigService): Pool => {
        const dbConfig = configService.getOrThrow<DatabaseConfig>('database');

        const pool = new Pool({
          host: dbConfig.host,
          port: dbConfig.port,
          user: dbConfig.username,
          password: dbConfig.password,
          database: dbConfig.database,
          ssl: dbConfig.ssl ? { rejectUnauthorized: false } : false,
          min: dbConfig.poolMin,
          max: dbConfig.poolMax,
        });

        pool.on('error', (err) => {
          // Fired for idle clients that error out in the background (e.g. the
          // DB restarts). Without this handler an unhandled 'error' event
          // would crash the whole Node process.
          logger.error('Unexpected error on idle PostgreSQL client', err.stack);
        });

        return pool;
      },
    },
    {
      provide: DRIZZLE_CLIENT,
      inject: [PG_POOL],
      useFactory: (pool: Pool) => drizzle(pool, { schema }),
    },
    DatabaseService,
  ],
  exports: [PG_POOL, DRIZZLE_CLIENT, DatabaseService],
})
export class DatabaseModule {}
