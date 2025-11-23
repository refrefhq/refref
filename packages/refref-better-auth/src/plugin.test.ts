import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock dependencies
vi.mock("./utils/api-client");
vi.mock("./utils/cookie");

import { refrefAnalytics } from "./plugin";
import { RefRefAPIClient } from "./utils/api-client";
import { extractRefcodeFromContext } from "./utils/cookie";

describe("refrefAnalytics Plugin", () => {
  let mockTrackSignup: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockTrackSignup = vi.fn().mockResolvedValue({ success: true });
    vi.mocked(RefRefAPIClient).mockImplementation(
      () =>
        ({
          trackSignup: mockTrackSignup,
        }) as any,
    );
  });

  it("should initialize with valid options", () => {
    const plugin = refrefAnalytics({
      apiKey: "test-key",
      productId: "test-product",
    });

    expect(plugin.id).toBe("refref-analytics");
    expect(plugin.hooks.after).toBeDefined();
  });

  it("should throw error when required options missing", () => {
    expect(() => refrefAnalytics({} as any)).toThrow("apiKey is required");
    expect(() => refrefAnalytics({ apiKey: "key" } as any)).toThrow(
      "productId is required",
    );
  });

  it("should track signup with referral code", async () => {
    vi.mocked(extractRefcodeFromContext).mockReturnValue("REF123");

    const plugin = refrefAnalytics({
      apiKey: "test-key",
      productId: "test-product",
    });

    const handler = plugin.hooks.after[0].handler;
    await handler({
      path: "/user/create",
      body: {
        user: {
          id: "user-123",
          email: "test@example.com",
        },
      },
    } as any);

    expect(mockTrackSignup).toHaveBeenCalledWith(
      expect.objectContaining({
        productId: "test-product",
        payload: expect.objectContaining({
          userId: "user-123",
          refcode: "REF123",
        }),
      }),
    );
  });

  it("should track signup without referral code", async () => {
    vi.mocked(extractRefcodeFromContext).mockReturnValue(undefined);

    const plugin = refrefAnalytics({
      apiKey: "test-key",
      productId: "test-product",
    });

    const handler = plugin.hooks.after[0].handler;
    await handler({
      path: "/user/create",
      body: {
        user: { id: "user-456" },
      },
    } as any);

    expect(mockTrackSignup).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: expect.objectContaining({
          userId: "user-456",
          refcode: undefined,
        }),
      }),
    );
  });

  it("should skip tracking when disabled", async () => {
    const plugin = refrefAnalytics({
      apiKey: "test-key",
      productId: "test-product",
      disableSignupTracking: true,
    });

    const handler = plugin.hooks.after[0].handler;
    await handler({
      path: "/user/create",
      body: { user: { id: "user-789" } },
    } as any);

    expect(mockTrackSignup).not.toHaveBeenCalled();
  });

  it("should use custom tracking function", async () => {
    const customTrack = vi.fn();

    const plugin = refrefAnalytics({
      apiKey: "test-key",
      productId: "test-product",
      customSignupTrack: customTrack,
    });

    const handler = plugin.hooks.after[0].handler;
    await handler({
      path: "/user/create",
      body: { user: { id: "user-custom" } },
    } as any);

    expect(customTrack).toHaveBeenCalled();
    expect(mockTrackSignup).not.toHaveBeenCalled();
  });
});
