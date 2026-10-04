# TraceabilityX

Production-ready NestJS REST API scaffold: core system setup (configuration, validation,
Swagger docs, standardized success/error response envelopes) plus a type-safe
Drizzle ORM database layer, demonstrated with a `users` CRUD feature module.

## Stack

- **Runtime**: Node.js + TypeScript (strict mode)
- **Framework**: NestJS 11
- **Package manager**: pnpm
- **Database**: PostgreSQL via `pg` (connection pool) + `drizzle-orm` (type-safe query builder)
- **Validation**: class-validator / class-transformer
- **Docs**: @nestjs/swagger (OpenAPI) at `/docs`
- **Config**: @nestjs/config + Joi schema validation

## Getting started

```bash
pnpm install
cp .env.example .env
# edit .env with your PostgreSQL credentials, then create the schema:
pnpm db:generate   # creates a SQL migration from src/database/schema
pnpm db:migrate    # applies pending migrations to the database
pnpm start:dev
```

- API base URL: `http://localhost:3000/api/v1`
- Swagger UI: `http://localhost:3000/docs`
- Health check: `GET /api/v1/health`
- Sample CRUD feature: `GET|POST /api/v1/users`, `GET|PATCH|DELETE /api/v1/users/:id`

## Project structure

```
src/
├── common/            # Cross-cutting guards, filters, interceptors, decorators
│   ├── decorators/
│   ├── filters/       # HttpExceptionFilter (global error envelope)
│   ├── guards/
│   ├── interceptors/  # TransformInterceptor (global success envelope)
│   └── repositories/
│       └── base.repository.ts  # Generic CRUD over any Drizzle table
├── config/            # Configuration factory + Joi env validation schema
├── database/
│   ├── schema/        # Drizzle table definitions (source of truth for SQL + types)
│   ├── database.constants.ts   # DI tokens: DRIZZLE_CLIENT, PG_POOL
│   ├── database.module.ts      # @Global() module: builds the pg Pool + Drizzle client
│   ├── database.service.ts     # Health check + graceful pool shutdown
│   └── database.types.ts       # `Database` = NodePgDatabase<typeof schema>
├── users/             # Sample feature module built on the database layer
│   ├── dto/
│   ├── utils/password.util.ts  # scrypt-based password hashing (no extra dep)
│   ├── users.controller.ts
│   ├── users.module.ts
│   ├── users.repository.ts     # extends BaseRepository<typeof users>
│   └── users.service.ts
├── app.module.ts
├── app.controller.ts
├── app.service.ts
└── main.ts

drizzle/                # Generated SQL migrations (drizzle-kit generate)
drizzle.config.ts        # drizzle-kit CLI config (schema path, DB credentials, output dir)
```

## Database layer

`DatabaseModule` is `@Global()`: import it once in `AppModule` and every feature module can
inject the query builder without re-importing it.

```ts
// Inject the type-safe Drizzle client directly:
constructor(@Inject(DRIZZLE_CLIENT) private readonly db: Database) {}

// ...or extend BaseRepository for a table, which is the pattern used by UsersRepository:
@Injectable()
export class UsersRepository extends BaseRepository<typeof users, User, NewUser> {
  constructor(@Inject(DRIZZLE_CLIENT) db: Database) {
    super(db, users);
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return this.findOneBy(eq(users.email, email));
  }
}
```

`BaseRepository` provides `findAll`, `findById`, `findOneBy`, `create`, `update`, `delete`,
`count` for any table with an `id` column — controllers and services never call Drizzle
directly, only repository methods.

### Adding a new table

1. Define it in `src/database/schema/<name>.schema.ts` and add it to the `schema` object in
   `src/database/schema/index.ts`.
2. Run `pnpm db:generate` to create the migration, then `pnpm db:migrate` to apply it.
3. Create `<Name>Repository extends BaseRepository<typeof <table>, Select, Insert>` for
   table-specific queries, following `UsersRepository` as a template.

## Response contract

**Success**

```json
{ "success": true, "data": {}, "message": "Success" }
```

**Error**

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Validation failed",
  "timestamp": "2026-01-01T00:00:00.000Z",
  "path": "/api/v1/health"
}
```

## Scripts

| Command            | Description                      |
| ------------------ | -------------------------------- |
| `pnpm start:dev`    | Start in watch mode              |
| `pnpm build`        | Compile to `dist/`               |
| `pnpm start:prod`   | Run the compiled build           |
| `pnpm lint`         | Lint & auto-fix                  |
| `pnpm test`         | Unit tests                       |
| `pnpm test:e2e`     | End-to-end tests                 |
| `pnpm db:generate`  | Generate a SQL migration from `src/database/schema` |
| `pnpm db:migrate`   | Apply pending migrations         |
| `pnpm db:push`      | Push schema directly (dev only, skips migration files) |
| `pnpm db:studio`    | Open Drizzle Studio (visual DB browser) |

## Adding a feature module

Create a new folder under `src/<feature-name>/` with its own module, controller,
service, and DTOs, then import it into `AppModule`. Shared, reusable building blocks
(guards, decorators, interceptors, filters) belong in `src/common/`.
