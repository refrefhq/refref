# @refref/utils

Shared utilities and plugins for RefRef applications.

## Plugins

### CoreDB Plugin

Fastify plugin that provides database connectivity using `@refref/coredb`.

#### Features

- Initializes database connection pool at server startup
- Decorates Fastify instance with `db` property
- Decorates request with `db` property for easy access
- Handles graceful shutdown and cleanup
- TypeScript-safe with proper type declarations

#### Usage

```typescript
import Fastify from "fastify";
import { coredbPlugin } from "@refref/utils";

const app = Fastify();

// Register the plugin
await app.register(coredbPlugin);

// Use in handlers via request.db
app.get("/example", async (request, reply) => {
  const result = await request.db.query.users.findMany();
  return result;
});
```

#### Environment Variables

- `DATABASE_URL` (required) - PostgreSQL connection string

#### Type Declarations

The plugin extends Fastify types:

```typescript
declare module "fastify" {
  interface FastifyInstance {
    db: DBType;
  }
  interface FastifyRequest {
    db: DBType;
  }
}
```
