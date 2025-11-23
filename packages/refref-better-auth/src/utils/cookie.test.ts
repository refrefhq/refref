import { describe, it, expect } from "vitest";
import { extractRefcodeFromRequest } from "./cookie";

describe("Cookie Utilities", () => {
  it("should extract refcode from cookie", () => {
    const request = {
      headers: {
        cookie: "refref_refcode=ABC123; session=xyz",
      },
    };

    const refcode = extractRefcodeFromRequest(request);
    expect(refcode).toBe("ABC123");
  });

  it("should return undefined when cookie not found", () => {
    const request = {
      headers: {
        cookie: "session=xyz; other=value",
      },
    };

    const refcode = extractRefcodeFromRequest(request);
    expect(refcode).toBeUndefined();
  });

  it("should use custom cookie name", () => {
    const request = {
      headers: {
        cookie: "custom_ref=CUSTOM123; refref_refcode=WRONG",
      },
    };

    const refcode = extractRefcodeFromRequest(request, "custom_ref");
    expect(refcode).toBe("CUSTOM123");
  });
});
