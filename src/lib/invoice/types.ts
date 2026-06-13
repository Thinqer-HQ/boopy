export type InvoiceLineItem = {
  id: string;
  groupId: string;
  groupName: string;
  vendorName: string;
  category: string | null;
  cadence: string;
  renewalDate: string;
  unitAmount: number;
  currency: string;
  markupPercent: number;
  markupAmount: number;
  totalAmount: number;
};

export type InvoiceDetails = {
  // Issuer (agency)
  fromName: string;
  fromAddress: string;
  fromEmail: string;
  fromPhone: string;
  fromVatNumber: string;
  // Recipient (client)
  toName: string;
  toAddress: string;
  toEmail: string;
  // Invoice metadata
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  poNumber: string;
  // Pricing
  markupPercent: number;
  taxPercent: number;
  // Notes
  notes: string;
};

export type InvoiceSummary = {
  currency: string;
  subtotal: number;
  taxAmount: number;
  total: number;
};
