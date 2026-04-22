export type GroupRow = {
  id: string;
  workspace_id: string;
  name: string;
  notes: string | null;
  created_at?: string;
  updated_at?: string;
};

export type GroupSpendSummary = {
  groupId: string;
  groupName: string;
  monthlyTotal: number;
  yearlyTotal: number;
};
