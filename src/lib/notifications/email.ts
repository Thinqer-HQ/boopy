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

  const subject = `${args.vendorName} renews in ${args.leadTimeDays} day${
    args.leadTimeDays === 1 ? "" : "s"
  }`;
  const amountLabel = Number.isFinite(args.amount)
    ? `${args.amount.toFixed(2)} ${args.currency}`
    : args.currency;

  const html = `
    <div style="font-family: Inter, Arial, sans-serif; line-height: 1.6;">
      <h2 style="margin-bottom: 8px;">Subscription renewal reminder</h2>
      <p style="margin: 0 0 12px 0;">
        <strong>${args.vendorName}</strong> renews in ${args.leadTimeDays} day${
          args.leadTimeDays === 1 ? "" : "s"
        }.
      </p>
      <ul style="padding-left: 20px; margin-top: 0;">
        <li>Workspace: ${args.workspaceName}</li>
        <li>Client: ${args.clientName}</li>
        <li>Amount: ${amountLabel}</li>
        <li>Renewal date: ${args.renewalDate}</li>
      </ul>
      <p style="margin-top: 16px;">Manage subscriptions in Boopy.</p>
    </div>
  `;

  await resend.emails.send({
    from: env.RESEND_FROM_EMAIL,
    to: args.to,
    subject,
    html,
  });
}
