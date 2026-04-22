export type ParsedCandidateStatus = "pending" | "confirmed" | "rejected";

export type ParsedSubscriptionCandidate = {
  vendorName: string;
  amount: number | null;
  currency: string;
  cadence: "monthly" | "yearly" | "custom";
  renewalDate: string | null;
  confidence: number;
  rawPayload: Record<string, unknown>;
};

export type ParserInput = {
  filename: string;
  mimeType: string;
  textContent: string;
};
