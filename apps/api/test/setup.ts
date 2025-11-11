import { vi } from "vitest";

// Mock the @refref/coredb module
vi.mock("@refref/coredb", () => {
  const mockDb = {
    execute: vi.fn().mockResolvedValue({ rows: [{ "?column?": 1 }] }),
  };

  return {
    createDb: vi.fn(() => mockDb),
  };
});
