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

  await resend.emails.send({
    from: env.RESEND_FROM_EMAIL,
    to: args.to,
    subject,
    html,
  });
}
