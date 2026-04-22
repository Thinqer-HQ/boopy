import { sendDiscordChannel } from "@/lib/notifications/channels/discord";
import { sendEmailChannel } from "@/lib/notifications/channels/email";
import { sendPushChannel } from "@/lib/notifications/channels/push";
import { sendSlackChannel } from "@/lib/notifications/channels/slack";
import { sendWebhookChannel } from "@/lib/notifications/channels/webhook";

export type NotificationChannel = "email" | "push" | "slack" | "discord" | "webhook";

type NotificationContext = {
  workspaceName: string;
  groupName: string;
  vendorName: string;
  amount: number;
  currency: string;
  renewalDate: string;
  leadTimeDays: number;
};

type DestinationConfig = {
  channel: NotificationChannel;
  email?: string;
  pushSubscriptions?: PushSubscriptionJSON[];
  webhookUrl?: string;
  secretHeader?: string | null;
};

export async function dispatchNotification(
  context: NotificationContext,
  destination: DestinationConfig
) {
  if (destination.channel === "email") {
    if (!destination.email) throw new Error("Missing destination email");
    await sendEmailChannel({ ...context, email: destination.email });
    return;
  }
  if (destination.channel === "push") {
    const subscriptions = destination.pushSubscriptions ?? [];
    if (subscriptions.length === 0) throw new Error("No push subscriptions configured");
    await sendPushChannel({ ...context, subscriptions });
    return;
  }
  if (destination.channel === "slack") {
    if (!destination.webhookUrl) throw new Error("Missing Slack webhook URL");
    await sendSlackChannel({
      ...context,
      webhookUrl: destination.webhookUrl,
      secretHeader: destination.secretHeader ?? null,
    });
    return;
  }
  if (destination.channel === "discord") {
    if (!destination.webhookUrl) throw new Error("Missing Discord webhook URL");
    await sendDiscordChannel({
      ...context,
      webhookUrl: destination.webhookUrl,
      secretHeader: destination.secretHeader ?? null,
    });
    return;
  }
  if (destination.channel === "webhook") {
    if (!destination.webhookUrl) throw new Error("Missing webhook URL");
    await sendWebhookChannel({
      ...context,
      webhookUrl: destination.webhookUrl,
      secretHeader: destination.secretHeader ?? null,
    });
    return;
  }
  throw new Error(`Unsupported destination channel: ${destination.channel as string}`);
}
