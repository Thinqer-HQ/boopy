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

function fmtAmount(amount: number, currency: string): string {
  if (!Number.isFinite(amount)) return currency;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    currencyDisplay: "narrowSymbol",
  }).format(amount);
}

function fmtDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return `${months[parseInt(m, 10) - 1]} ${parseInt(d, 10)}, ${y}`;
}

const PURPLE = "#6d5df6";
const PURPLE_LIGHT = "#efecfe";
const BORDER = "#e8e6f4";
const TEXT_MAIN = "#17151f";
const TEXT_MUTED = "#56516b";
const TEXT_LIGHT = "#8a85a0";
const BG = "#f5f4fa";

function emailWrapper(content: string, preheader: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="x-apple-disable-message-reformatting" />
  <title>Boopy</title>
  <!--[if mso]><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch><o:AllowPNG/></o:OfficeDocumentSettings></xml><![endif]-->
</head>
<body style="margin:0;padding:0;background:${BG};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;">${preheader}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BG};">
    <tr><td align="center" style="padding:32px 16px 24px;">
      <table role="presentation" width="100%" style="max-width:520px;" cellpadding="0" cellspacing="0">
        <!-- Logo row -->
        <tr><td style="padding-bottom:20px;">
          <table role="presentation" cellpadding="0" cellspacing="0">
            <tr>
              <td style="background:${PURPLE};border-radius:10px;width:34px;height:34px;text-align:center;vertical-align:middle;">
                <span style="color:#fff;font-size:18px;font-weight:900;letter-spacing:-0.5px;font-family:system-ui,sans-serif;">B</span>
              </td>
              <td style="padding-left:8px;vertical-align:middle;">
                <span style="color:${TEXT_MAIN};font-size:17px;font-weight:700;letter-spacing:-0.3px;">Boopy</span>
              </td>
            </tr>
          </table>
        </td></tr>
        <!-- Card -->
        <tr><td style="background:#ffffff;border:1px solid ${BORDER};border-radius:16px;overflow:hidden;">
          ${content}
        </td></tr>
        <!-- Footer -->
        <tr><td style="padding-top:16px;text-align:center;">
          <p style="margin:0;font-size:11px;color:${TEXT_LIGHT};">
            You're receiving this because email reminders are enabled in your Boopy workspace.
            <br/>Manage notification preferences in <a href="https://useboopy.com/settings/notifications" style="color:${PURPLE};text-decoration:none;">Boopy settings</a>.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
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

  const amountStr = fmtAmount(args.amount, args.currency);
  const dateStr = fmtDate(args.renewalDate);
  const inDays =
    args.leadTimeDays === 0
      ? "today"
      : args.leadTimeDays === 1
        ? "tomorrow"
        : `in ${args.leadTimeDays} days`;
  const subject = `${args.vendorName} renews ${inDays} — ${amountStr}`;

  const content = `
    <!-- Header -->
    <div style="background:linear-gradient(135deg,${PURPLE_LIGHT} 0%,#ffffff 100%);padding:24px 28px 20px;border-bottom:1px solid ${BORDER};">
      <p style="margin:0 0 4px;font-size:12px;font-weight:600;letter-spacing:0.6px;text-transform:uppercase;color:${TEXT_MUTED};">Upcoming renewal</p>
      <p style="margin:0;font-size:22px;font-weight:700;color:${TEXT_MAIN};letter-spacing:-0.4px;">${args.vendorName}</p>
    </div>
    <!-- Receipt body -->
    <div style="padding:0 28px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding:14px 0 13px;border-bottom:1px solid ${BORDER};">
            <span style="font-size:13px;color:${TEXT_MUTED};">Amount due</span>
          </td>
          <td style="padding:14px 0 13px;border-bottom:1px solid ${BORDER};text-align:right;">
            <span style="font-size:16px;font-weight:700;color:${TEXT_MAIN};">${amountStr}</span>
          </td>
        </tr>
        <tr>
          <td style="padding:12px 0 11px;border-bottom:1px solid ${BORDER};">
            <span style="font-size:13px;color:${TEXT_MUTED};">Renewal date</span>
          </td>
          <td style="padding:12px 0 11px;border-bottom:1px solid ${BORDER};text-align:right;">
            <span style="font-size:13px;font-weight:600;color:${TEXT_MAIN};">${dateStr}</span>
          </td>
        </tr>
        <tr>
          <td style="padding:12px 0 11px;border-bottom:1px solid ${BORDER};">
            <span style="font-size:13px;color:${TEXT_MUTED};">Group</span>
          </td>
          <td style="padding:12px 0 11px;border-bottom:1px solid ${BORDER};text-align:right;">
            <span style="font-size:13px;color:${TEXT_MAIN};">${args.clientName}</span>
          </td>
        </tr>
        <tr>
          <td style="padding:12px 0 14px;">
            <span style="font-size:13px;color:${TEXT_MUTED};">Workspace</span>
          </td>
          <td style="padding:12px 0 14px;text-align:right;">
            <span style="font-size:13px;color:${TEXT_MUTED};">${args.workspaceName}</span>
          </td>
        </tr>
      </table>
    </div>
    <!-- CTA -->
    <div style="padding:0 28px 24px;">
      <a href="https://useboopy.com/subscriptions" style="display:block;background:${PURPLE};color:#fff;text-align:center;padding:11px 0;border-radius:10px;font-size:14px;font-weight:600;text-decoration:none;letter-spacing:-0.1px;">View in Boopy</a>
    </div>
  `;

  const { data, error } = await resend.emails.send({
    from: env.RESEND_FROM_EMAIL,
    to: args.to,
    subject,
    html: emailWrapper(content, `${args.vendorName} renews ${inDays} for ${amountStr}.`),
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

  const count = sortedItems.length;
  const subject =
    count === 1
      ? `${sortedItems[0].vendorName} renews soon — Boopy reminder`
      : `${count} renewals coming up — Boopy`;

  // Group totals by currency
  const totals: Record<string, number> = {};
  for (const item of sortedItems) {
    if (Number.isFinite(item.amount)) {
      totals[item.currency] = (totals[item.currency] ?? 0) + item.amount;
    }
  }
  const totalLines = Object.entries(totals)
    .map(([cur, sum]) => fmtAmount(sum, cur))
    .join(" + ");

  const rows = sortedItems
    .map((item, i) => {
      const amountStr = fmtAmount(item.amount, item.currency);
      const dateStr = fmtDate(item.renewalDate);
      const inDays =
        item.leadTimeDays === 0
          ? "today"
          : item.leadTimeDays === 1
            ? "tomorrow"
            : `${item.leadTimeDays}d`;
      const isLast = i === sortedItems.length - 1;
      const rowBorder = isLast ? "" : `border-bottom:1px solid ${BORDER};`;
      return `
        <tr>
          <td style="padding:11px 0 10px;${rowBorder}">
            <div style="font-size:13px;font-weight:600;color:${TEXT_MAIN};margin-bottom:1px;">${item.vendorName}</div>
            <div style="font-size:11px;color:${TEXT_LIGHT};">${item.groupName} · due ${dateStr}</div>
          </td>
          <td style="padding:11px 0 10px;${rowBorder}text-align:right;white-space:nowrap;">
            <div style="font-size:13px;font-weight:700;color:${TEXT_MAIN};">${amountStr}</div>
            <div style="font-size:11px;color:${TEXT_LIGHT};">${inDays}</div>
          </td>
        </tr>
      `;
    })
    .join("");

  const content = `
    <!-- Header -->
    <div style="background:linear-gradient(135deg,${PURPLE_LIGHT} 0%,#ffffff 100%);padding:24px 28px 20px;border-bottom:1px solid ${BORDER};">
      <p style="margin:0 0 3px;font-size:12px;font-weight:600;letter-spacing:0.6px;text-transform:uppercase;color:${TEXT_MUTED};">Renewal reminders</p>
      <p style="margin:0;font-size:22px;font-weight:700;color:${TEXT_MAIN};letter-spacing:-0.4px;">${count} upcoming${count === 1 ? "" : ""}</p>
    </div>
    <!-- Receipt rows -->
    <div style="padding:0 28px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        ${rows}
      </table>
    </div>
    <!-- Total -->
    ${
      totalLines
        ? `
    <div style="margin:0 28px;padding:12px 0;border-top:2px solid ${TEXT_MAIN};">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td><span style="font-size:13px;font-weight:700;color:${TEXT_MAIN};">Total due</span></td>
          <td style="text-align:right;"><span style="font-size:15px;font-weight:800;color:${PURPLE};">${totalLines}</span></td>
        </tr>
      </table>
    </div>`
        : ""
    }
    <!-- CTA -->
    <div style="padding:16px 28px 24px;">
      <a href="https://useboopy.com/subscriptions" style="display:block;background:${PURPLE};color:#fff;text-align:center;padding:11px 0;border-radius:10px;font-size:14px;font-weight:600;text-decoration:none;letter-spacing:-0.1px;">View in Boopy</a>
    </div>
  `;

  const preheader = `${count} renewal${count === 1 ? "" : "s"} coming up${totalLines ? ` — ${totalLines} total` : ""}.`;

  const { data, error } = await resend.emails.send({
    from: env.RESEND_FROM_EMAIL,
    to: args.to,
    subject,
    html: emailWrapper(content, preheader),
  });
  if (error) {
    throw new Error(`Resend digest send failed: ${error.message}`);
  }
  return data?.id ?? null;
}
