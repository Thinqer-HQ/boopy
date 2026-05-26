import { Resend } from "resend";

import { getEnv } from "@/lib/env";

let cachedResend: Resend | null = null;

function getResendClient() {
  const env = getEnv();
  if (!env.RESEND_API_KEY) return null;
  if (!cachedResend) {
    cachedResend = new Resend(env.RESEND_API_KEY);
  }
  return cachedResend;
}

export async function sendRenewalEmail(args: {
  to: string;
  workspaceName: string;
  clientName: string;
  vendorName: string;
  amount: number;
  currency: string;
  renewalDate: string;
  leadTimeDays: number;
}) {
  const env = getEnv();
  const resend = getResendClient();
  if (!resend || !env.RESEND_FROM_EMAIL) {
    throw new Error("Resend is not configured");
  }

  const amountLabel = Number.isFinite(args.amount)
    ? `${args.amount.toFixed(2)} ${args.currency}`
    : args.currency;
  const inDays = `${args.leadTimeDays} day${args.leadTimeDays === 1 ? "" : "s"}`;
  const subject = `Due ${args.renewalDate}: ${args.vendorName} — ${amountLabel} (${inDays})`;

  const html = `
    <div style="font-family: Inter, Arial, sans-serif; line-height: 1.5;">
      <p style="margin: 0 0 8px 0;"><strong>Pay:</strong> ${amountLabel}</p>
      <p style="margin: 0 0 8px 0;"><strong>Due:</strong> ${args.renewalDate}</p>
      <p style="margin: 0 0 8px 0;"><strong>Vendor:</strong> ${args.vendorName}</p>
      <p style="margin: 0; color: #444; font-size: 14px;">Renewal in ${inDays} · ${args.clientName} · ${args.workspaceName}</p>
    </div>
  `;

  const { data, error } = await resend.emails.send({
    from: env.RESEND_FROM_EMAIL,
    to: args.to,
    subject,
    html,
  });
  if (error) {
    throw new Error(`Resend send failed: ${error.message}`);
  }
  return data?.id ?? null;
}

export async function sendRenewalDigestEmail(args: {
  to: string;
  workspaceName: string;
  items: Array<{
    groupName: string;
    vendorName: string;
    amount: number;
    currency: string;
    renewalDate: string;
    leadTimeDays: number;
  }>;
}) {
  const env = getEnv();
  const resend = getResendClient();
  if (!resend || !env.RESEND_FROM_EMAIL) {
    throw new Error("Resend is not configured");
  }
  if (args.items.length === 0) {
    return null;
  }

  const sortedItems = [...args.items].sort((a, b) => {
    const byDate = a.renewalDate.localeCompare(b.renewalDate);
    if (byDate !== 0) return byDate;
    return a.vendorName.localeCompare(b.vendorName);
  });

  const subject =
    sortedItems.length === 1
      ? "Boopy reminder: 1 upcoming renewal"
      : `Boopy reminders: ${sortedItems.length} upcoming renewals`;

  const rows = sortedItems
    .map((item) => {
      const amountLabel = Number.isFinite(item.amount)
        ? `${item.amount.toFixed(2)} ${item.currency}`
        : item.currency;
      const inDays = `${item.leadTimeDays} day${item.leadTimeDays === 1 ? "" : "s"}`;
      return `
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${item.vendorName}</td>
          <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${amountLabel}</td>
          <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${item.renewalDate}</td>
          <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${inDays}</td>
          <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${item.groupName}</td>
        </tr>
      `;
    })
    .join("");

  const html = `
    <div style="font-family: Inter, Arial, sans-serif; line-height: 1.5;">
      <p style="margin: 0 0 8px 0;">
        <strong>${args.workspaceName}</strong> has ${sortedItems.length} upcoming renewal${
          sortedItems.length === 1 ? "" : "s"
        }.
      </p>
      <table style="width: 100%; border-collapse: collapse; margin-top: 8px;">
        <thead>
          <tr style="text-align: left; font-size: 12px; color: #555;">
            <th style="padding: 6px 0; border-bottom: 1px solid #ddd;">Vendor</th>
            <th style="padding: 6px 0; border-bottom: 1px solid #ddd;">Amount</th>
            <th style="padding: 6px 0; border-bottom: 1px solid #ddd;">Due</th>
            <th style="padding: 6px 0; border-bottom: 1px solid #ddd;">Lead time</th>
            <th style="padding: 6px 0; border-bottom: 1px solid #ddd;">Group</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;

  const { data, error } = await resend.emails.send({
    from: env.RESEND_FROM_EMAIL,
    to: args.to,
    subject,
    html,
  });
  if (error) {
    throw new Error(`Resend digest send failed: ${error.message}`);
  }
  return data?.id ?? null;
}
