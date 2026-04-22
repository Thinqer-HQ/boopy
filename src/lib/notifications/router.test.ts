import { beforeAll, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/notifications/channels/email", () => ({
  sendEmailChannel: vi.fn(async () => undefined),
}));
vi.mock("@/lib/notifications/channels/push", () => ({
  sendPushChannel: vi.fn(async () => undefined),
}));
vi.mock("@/lib/notifications/channels/slack", () => ({
  sendSlackChannel: vi.fn(async () => undefined),
}));
vi.mock("@/lib/notifications/channels/discord", () => ({
  sendDiscordChannel: vi.fn(async () => undefined),
}));
vi.mock("@/lib/notifications/channels/webhook", () => ({
  sendWebhookChannel: vi.fn(async () => undefined),
}));

let dispatchNotification: typeof import("@/lib/notifications/router").dispatchNotification;

beforeAll(async () => {
  ({ dispatchNotification } = await import("@/lib/notifications/router"));
});

describe("notification router", () => {
  it("rejects incomplete email payloads", async () => {
    await expect(
      dispatchNotification(
        {
          workspaceName: "Boopy",
          groupName: "General",
          vendorName: "Netflix",
          amount: 10,
          currency: "USD",
          renewalDate: "2026-01-01",
          leadTimeDays: 3,
        },
        { channel: "email" }
      )
    ).rejects.toThrow("Missing destination email");
  });

  it("rejects push when no subscriptions", async () => {
    await expect(
      dispatchNotification(
        {
          workspaceName: "Boopy",
          groupName: "General",
          vendorName: "Netflix",
          amount: 10,
          currency: "USD",
          renewalDate: "2026-01-01",
          leadTimeDays: 3,
        },
        { channel: "push", pushSubscriptions: [] }
      )
    ).rejects.toThrow("No push subscriptions configured");
  });
});
