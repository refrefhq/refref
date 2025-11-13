# @refref/id

Type-safe ID generation for RefRef domain entities with collision-resistant CUID2 and entity prefixes.

## Features

- **Type-safe**: Full TypeScript support with entity type checking
- **Collision-resistant**: Uses CUID2 for globally unique identifiers
- **Prefixed IDs**: Each entity type has a unique prefix for easy identification
- **URL-safe**: Generated IDs are safe to use in URLs without encoding
- **Sortable**: IDs are chronologically sortable

## Installation

```bash
pnpm add @refref/id
```

## Usage

### Basic ID Generation

```typescript
import { createId } from "@refref/id";

// Generate a user ID
const userId = createId("user");
// Returns: usr_cl9x8k2n000000d0e8y8z8b0w

// Generate a product ID
const productId = createId("product");
// Returns: prj_cm1a9b3c000000e0f9z0a1b2c
```

### Type Validation

```typescript
import { isValidEntityType, getValidEntityTypes } from "@refref/id";

// Check if an entity type is valid
if (isValidEntityType("user")) {
  console.log("Valid entity type");
}

// Get all valid entity types
const validTypes = getValidEntityTypes();
console.log(validTypes);
// ['user', 'product', 'program', 'participant', ...]
```

### Error Handling

```typescript
import { createId, InvalidEntityError } from "@refref/id";

try {
  createId("invalid" as any);
} catch (error) {
  if (error instanceof InvalidEntityError) {
    console.error(error.message);
    // Invalid entity type: invalid. Valid types are: user, product, program, ...
  }
}
```

## Entity Types & Prefixes

| Entity Type     | Prefix | Example ID                     |
| --------------- | ------ | ------------------------------ |
| user            | usr    | usr_cl9x8k2n000000d0e8y8z8b0w  |
| session         | ses    | ses_cm1a9b3c000000e0f9z0a1b2c  |
| account         | acc    | acc_cm2b0c4d000000f0g0a2b3c4d  |
| verification    | ver    | ver_cm3c1d5e000000g0h1b3c4d5e  |
| product         | prj    | prj_cm4d2e6f000000h0i2c4d5e6f  |
| productUser     | pju    | pju_cm5e3f7g000000i0j3d5e6f7g  |
| invitation      | inv    | inv_cm6f4g8h000000j0k4e6f7g8h  |
| apikey          | key    | key_cm7g5h9i000000k0l5f7g8h9i  |
| programTemplate | pgt    | pgt_cm8h6i0j000000l0m6g8h9i0j  |
| program         | prg    | prg_cm9i7j1k000000m0n7h9i0j1k  |
| eventDefinition | evd    | evd_cma j8k2l000000n0o8i0j1k2l |
| participant     | prt    | prt_cmbk9l3m000000o0p9j1k2l3m  |
| rewardRule      | rwr    | rwr_cmcl0m4n000000p0q0k2l3m4n  |
| reward          | rwd    | rwd_cmdm1n5o000000q0r1l3m4n5o  |
| productSecrets  | sec    | sec_cmen2o6p000000r0s2m4n5o6p  |
| refcode         | rc     | rc_cmfo3p7q000000s0t3n5o6p7q   |
| referral        | ref    | ref_cmgp4q8r000000t0u4o6p7q8r  |
| event           | evt    | evt_cmhq5r9s000000u0v5p7q8r9s  |

## Important Note: Refcode ID vs Code

The `refcode` entity has two distinct identifiers:

- **`id` field**: Database primary key (e.g., `rc_cmfo3p7q000000s0t3n5o6p7q`)
  - Generated using `createId("refcode")`
  - Used for internal database relationships and operations
  - Never exposed to end users

- **`code` field**: User-facing referral code (e.g., `abc1234` or `john-doe`)
  - Generated using `@refref/utils` functions (`generateGlobalCode()` or validated via `validateVanityCode()`)
  - Visible in referral URLs: `REFERRAL_HOST_URL/:code`
  - Unique per scope (global or product-level)

This separation allows for user-friendly, short referral codes while maintaining robust database integrity with collision-resistant CUIDs.

## API

### `createId(entityType: EntityType): string`

Generates a new prefixed ID for the specified entity type.

- **Parameters**: `entityType` - The type of entity to create an ID for
- **Returns**: A prefixed ID string in the format `prefix_cuid2`
- **Throws**: `InvalidEntityError` if the entity type is not valid

### `isValidEntityType(entityType: string): entityType is EntityType`

Type guard to check if a string is a valid entity type.

- **Parameters**: `entityType` - The string to check
- **Returns**: `true` if valid, `false` otherwise

### `getValidEntityTypes(): EntityType[]`

Returns an array of all valid entity types.

- **Returns**: Array of valid entity type strings

### `InvalidEntityError`

Custom error class thrown when an invalid entity type is provided to `createId()`.

## Integration with Drizzle ORM

Use with the `baseFields` function in your schema:

```typescript
import { createId, isValidEntityType } from "@refref/id";
import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

const baseFields = (entityType: string) => ({
  id: text("id")
    .primaryKey()
    .$defaultFn(() =>
      entityType && isValidEntityType(entityType)
        ? createId(entityType)
        : createId(),
    ),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const user = pgTable("user", {
  ...baseFields("user"),
  email: text("email").notNull(),
});
```
