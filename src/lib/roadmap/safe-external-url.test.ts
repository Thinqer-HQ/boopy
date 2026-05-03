import { describe, expect, it } from "vitest";

import { safeExternalHref } from "./safe-external-url";

describe("safeExternalHref", () => {
  it("accepts http and https URLs", () => {
    expect(safeExternalHref("https://boopy.com/blog/hello")).toBe("https://boopy.com/blog/hello");
    expect(safeExternalHref("http://example.com/x")).toBe("http://example.com/x");
  });

  it("rejects non-http protocols and junk", () => {
    expect(safeExternalHref("javascript:alert(1)")).toBeNull();
    expect(safeExternalHref("ftp://x")).toBeNull();
    expect(safeExternalHref("not a url")).toBeNull();
    expect(safeExternalHref("")).toBeNull();
    expect(safeExternalHref(null)).toBeNull();
  });
});
