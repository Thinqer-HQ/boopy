type WebhookPayload = {
  webhookUrl: string;
  secretHeader?: string | null;
  workspaceName: string;
  groupName: string;
  vendorName: string;
  amount: number;
  currency: string;
  renewalDate: string;
  leadTimeDays: number;
};

export async function sendWebhookChannel(payload: WebhookPayload) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (payload.secretHeader) {
    headers["x-boopy-secret"] = payload.secretHeader;
  }
  const response = await fetch(payload.webhookUrl, {
    method: "POST",
    headers,
    body: JSON.stringify({
      type: "subscription.renewal.reminder",
      workspaceName: payload.workspaceName,
      groupName: payload.groupName,
      vendorName: payload.vendorName,
      amount: payload.amount,
      currency: payload.currency,
      renewalDate: payload.renewalDate,
      leadTimeDays: payload.leadTimeDays,
    }),
  });
  if (!response.ok) {
    throw new Error(`Webhook failed with ${response.status}`);
  }
}
