import { describe, expect, it } from "vitest";

import { AdminGuardError } from "@/lib/admin-guard";

describe("AdminGuardError", () => {
  it("carries the status code through to the error instance", () => {
    const err = new AdminGuardError("Unauthorized", 401);
    expect(err.message).toBe("Unauthorized");
    expect(err.status).toBe(401);
    expect(err).toBeInstanceOf(Error);
  });
});
