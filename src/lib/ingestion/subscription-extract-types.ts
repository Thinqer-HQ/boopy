export type ExtractedSubscriptionFields = {
  vendorName: string | null;
  amount: number | null;
  currency: string | null;
  cadence: "monthly" | "yearly" | "quarterly" | "custom" | null;
  renewalDate: string | null;
  startDate: string | null;
  endDate: string | null;
  category: string | null;
  notes: string | null;
};

export type ExtractSubscriptionSource = "heuristic" | "vision";

export type ExtractSubscriptionFromFileResult = {
  source: ExtractSubscriptionSource;
  confidence: number;
  fields: ExtractedSubscriptionFields;
  hints: string[];
};
