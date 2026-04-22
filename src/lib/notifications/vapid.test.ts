import { describe, expect, it } from "vitest";

import { isValidVapidPublicKey } from "@/lib/notifications/vapid";

describe("isValidVapidPublicKey", () => {
  it("accepts a valid base64url VAPID public key", () => {
    const key =
      "BH30T1QJhcNHAVAwVyfQI2yG3cg7G2x-PwxCsKzDoMck9nLvQVYvxtGtQJxzvH4qM_iigbK7_opy947MTbS52yY";
    expect(isValidVapidPublicKey(key)).toBe(true);
  });

  it("rejects an empty key", () => {
    expect(isValidVapidPublicKey("")).toBe(false);
  });

  it("rejects non-base64url keys", () => {
    expect(isValidVapidPublicKey("not_a_valid_key!")).toBe(false);
  });
});
