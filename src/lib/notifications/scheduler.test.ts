import { describe, expect, it } from "vitest";

import {
  buildIdempotencyKey,
  collectDueNotificationPlans,
  uniqueSortedLeadTimes,
} from "@/lib/notifications/scheduler";

describe("uniqueSortedLeadTimes", () => {
  it("keeps only positive unique days sorted descending", () => {
    const result = uniqueSortedLeadTimes([3, -2, 7, 3, 0, 1, 7]);
    expect(result).toEqual([7, 3, 1]);
  });
});

describe("buildIdempotencyKey", () => {
  it("is deterministic across runs", () => {
    const first = buildIdempotencyKey({
      subscriptionId: "sub_123",
      channel: "email",
      leadTimeDays: 3,
      renewalDate: "2026-05-02",
    });
    const second = buildIdempotencyKey({
      subscriptionId: "sub_123",
      channel: "email",
      leadTimeDays: 3,
      renewalDate: "2026-05-02",
    });
    expect(first).toBe("sub_123:email:3:2026-05-02");
    expect(first).toBe(second);
  });
});

describe("collectDueNotificationPlans", () => {
  it("creates due jobs for enabled channels only", () => {
    const now = new Date("2026-04-22T10:00:00.000Z");
    const result = collectDueNotificationPlans({
      now,
      subscriptions: [
        {
          id: "sub_due",
          workspaceId: "ws_a",
          status: "active",
          renewalDate: "2026-04-23",
        },
      ],
      prefsByWorkspaceId: {
        ws_a: {
          leadTimesDays: [7, 3, 1],
          emailEnabled: true,
          pushEnabled: false,
        },
      },
    });

    expect(result).toHaveLength(3);
    expect(result.map((row) => row.leadTimeDays)).toEqual([7, 3, 1]);
    expect(result.map((row) => row.channel)).toEqual(["email", "email", "email"]);
  });

  it("uses default prefs when workspace prefs are missing", () => {
    const now = new Date("2026-04-30T10:00:00.000Z");
    const result = collectDueNotificationPlans({
      now,
      subscriptions: [
        {
          id: "sub_default",
          workspaceId: "ws_missing",
          status: "active",
          renewalDate: "2026-05-01",
        },
      ],
      prefsByWorkspaceId: {},
    });

    expect(result).toHaveLength(3);
    expect(result[2]).toMatchObject({
      channel: "email",
      leadTimeDays: 1,
      idempotencyKey: "sub_default:email:1:2026-05-01",
    });
  });

  it("ignores non-active subscriptions", () => {
    const now = new Date("2026-04-30T10:00:00.000Z");
    const result = collectDueNotificationPlans({
      now,
      subscriptions: [
        {
          id: "sub_paused",
          workspaceId: "ws_a",
          status: "paused",
          renewalDate: "2026-05-01",
        },
      ],
      prefsByWorkspaceId: {},
    });
    expect(result).toHaveLength(0);
  });
});
