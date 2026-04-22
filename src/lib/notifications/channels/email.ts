import { sendRenewalEmail } from "@/lib/notifications/email";

type EmailPayload = {
  email: string;
  workspaceName: string;
  groupName: string;
  vendorName: string;
  amount: number;
  currency: string;
  renewalDate: string;
  leadTimeDays: number;
};

export async function sendEmailChannel(payload: EmailPayload) {
  await sendRenewalEmail({
    to: payload.email,
    workspaceName: payload.workspaceName,
    clientName: payload.groupName,
    vendorName: payload.vendorName,
    amount: payload.amount,
    currency: payload.currency,
    renewalDate: payload.renewalDate,
    leadTimeDays: payload.leadTimeDays,
  });
}
