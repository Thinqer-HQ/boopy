import "server-only";

import webpush, { type PushSubscription } from "web-push";

import { getEnv } from "@/lib/env";

let configured = false;

function ensureConfigured() {
  if (configured) return;
  const env = getEnv();
  if (!env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || !env.VAPID_PRIVATE_KEY || !env.NEXT_PUBLIC_APP_URL) {
    throw new Error("VAPID configuration is missing");
  }

  const host = new URL(env.NEXT_PUBLIC_APP_URL).host;
  webpush.setVapidDetails(
    `mailto:notifications@${host}`,
    env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    env.VAPID_PRIVATE_KEY
  );
  configured = true;
}

export async function sendPushReminder(args: {
  subscription: PushSubscriptionJSON;
  workspaceName: string;
  clientName: string;
  vendorName: string;
  amount: number;
  currency: string;
  renewalDate: string;
  leadTimeDays: number;
}) {
  ensureConfigured();
  if (
    !args.subscription.endpoint ||
    !args.subscription.keys?.auth ||
    !args.subscription.keys?.p256dh
  ) {
    throw new Error("Invalid push subscription payload");
  }

  const subscription: PushSubscription = {
    endpoint: args.subscription.endpoint,
    keys: {
      auth: args.subscription.keys.auth,
      p256dh: args.subscription.keys.p256dh,
    },
    expirationTime: args.subscription.expirationTime ?? null,
  };

  const payload = JSON.stringify({
    title: `${args.vendorName} renews soon`,
    body: `${args.clientName} • ${args.amount.toFixed(2)} ${args.currency} • in ${args.leadTimeDays} day${
      args.leadTimeDays === 1 ? "" : "s"
    }`,
    tag: `boopy:${args.vendorName}:${args.renewalDate}`,
    url: "/",
    data: {
      workspaceName: args.workspaceName,
      clientName: args.clientName,
      vendorName: args.vendorName,
      renewalDate: args.renewalDate,
      leadTimeDays: args.leadTimeDays,
    },
  });

  await webpush.sendNotification(subscription, payload);
}
