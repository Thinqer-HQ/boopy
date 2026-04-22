type SlackPayload = {
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

export async function sendSlackChannel(payload: SlackPayload) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (payload.secretHeader) {
    headers["x-boopy-secret"] = payload.secretHeader;
  }
  const response = await fetch(payload.webhookUrl, {
    method: "POST",
    headers,
    body: JSON.stringify({
      text: `Boopy reminder (${payload.workspaceName})\n${payload.vendorName} in ${payload.groupName} renews on ${payload.renewalDate} (${payload.leadTimeDays}d). Amount: ${payload.amount.toFixed(2)} ${payload.currency}`,
    }),
  });
  if (!response.ok) {
    throw new Error(`Slack webhook failed with ${response.status}`);
  }
}
