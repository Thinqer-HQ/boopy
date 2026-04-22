import { sendPushReminder } from "@/lib/notifications/push";

type PushPayload = {
  subscriptions: PushSubscriptionJSON[];
  workspaceName: string;
  groupName: string;
  vendorName: string;
  amount: number;
  currency: string;
  renewalDate: string;
  leadTimeDays: number;
};

export async function sendPushChannel(payload: PushPayload) {
  for (const subscription of payload.subscriptions) {
    await sendPushReminder({
      subscription,
      workspaceName: payload.workspaceName,
      clientName: payload.groupName,
      vendorName: payload.vendorName,
      amount: payload.amount,
      currency: payload.currency,
      renewalDate: payload.renewalDate,
      leadTimeDays: payload.leadTimeDays,
    });
  }
}
