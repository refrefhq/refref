import { vi } from "vitest";

// Mock the @refref/coredb module
vi.mock("@refref/coredb", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@refref/coredb")>();

  const mockDb = {
    execute: vi.fn().mockResolvedValue({ rows: [{ "?column?": 1 }] }),
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockResolvedValue([]),
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    returning: vi.fn().mockResolvedValue([]),
    onConflictDoUpdate: vi.fn().mockReturnThis(),
    onConflictDoNothing: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    transaction: vi.fn(async (fn) => fn(mockDb)),
    query: {
      program: {
        findFirst: vi.fn().mockResolvedValue(null),
      },
      participant: {
        findFirst: vi.fn().mockResolvedValue(null),
      },
      referralLink: {
        findFirst: vi.fn().mockResolvedValue(null),
      },
      productSecrets: {
        findFirst: vi.fn().mockResolvedValue(null),
      },
    },
  };

  return {
    createDb: vi.fn(() => mockDb),
    schema: actual.schema, // Re-export actual schema for type checking
  };
});
