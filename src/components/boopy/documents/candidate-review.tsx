"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Candidate = {
  id: string;
  group_id: string | null;
  vendor_name: string | null;
  amount: number | null;
  currency: string | null;
  cadence: "monthly" | "yearly" | "quarterly" | "custom" | null;
  renewal_date: string | null;
  confidence: number;
  status: "pending" | "confirmed" | "rejected";
};

type GroupOption = { id: string; name: string };

type Props = {
  candidate: Candidate;
  groups: GroupOption[];
  onConfirm: (payload: {
    candidateId: string;
    groupId: string;
    vendorName: string;
    amount: number;
    currency: string;
    cadence: "monthly" | "yearly" | "quarterly" | "custom";
    renewalDate: string;
  }) => Promise<void>;
  onReject: (candidateId: string) => Promise<void>;
};

export function CandidateReview({ candidate, groups, onConfirm, onReject }: Props) {
  const hasGroups = groups.length > 0;
  const [vendorName, setVendorName] = useState(candidate.vendor_name ?? "");
  const [amount, setAmount] = useState(candidate.amount ? String(candidate.amount) : "");
  const [currency, setCurrency] = useState(candidate.currency ?? "USD");
  const [cadence, setCadence] = useState<"monthly" | "yearly" | "quarterly" | "custom">(
    candidate.cadence ?? "monthly"
  );
  const [renewalDate, setRenewalDate] = useState(candidate.renewal_date ?? "");
  const [groupId, setGroupId] = useState(candidate.group_id ?? groups[0]?.id ?? "");
  const [saving, setSaving] = useState(false);

  const canConfirm = useMemo(() => {
    return hasGroups && !!vendorName.trim() && !!groupId && !!renewalDate && Number(amount) > 0;
  }, [hasGroups, vendorName, groupId, renewalDate, amount]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Review extracted candidate</CardTitle>
        <CardDescription>Confidence: {(candidate.confidence * 100).toFixed(0)}%</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        <div className="grid gap-1">
          <Label>Group</Label>
          <select
            value={groupId}
            onChange={(event) => setGroupId(event.target.value)}
            disabled={!hasGroups}
            className="border-input bg-background h-10 rounded-md border px-3 text-sm"
          >
            {hasGroups ? (
              groups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))
            ) : (
              <option value="">No groups available</option>
            )}
          </select>
          {!hasGroups ? (
            <p className="text-muted-foreground text-xs">
              Create a group first, then confirm this candidate into that group.
            </p>
          ) : null}
        </div>
        <div className="grid gap-1">
          <Label>Vendor</Label>
          <Input value={vendorName} onChange={(event) => setVendorName(event.target.value)} />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="grid gap-1">
            <Label>Amount</Label>
            <Input
              type="number"
              min={0}
              step="0.01"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
            />
          </div>
          <div className="grid gap-1">
            <Label>Currency</Label>
            <Input
              value={currency}
              onChange={(event) => setCurrency(event.target.value.toUpperCase())}
            />
          </div>
          <div className="grid gap-1">
            <Label>Cadence</Label>
            <select
              value={cadence}
              onChange={(event) =>
                setCadence(event.target.value as "monthly" | "yearly" | "quarterly" | "custom")
              }
              className="border-input bg-background h-10 rounded-md border px-3 text-sm"
            >
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="yearly">Yearly</option>
              <option value="custom">Custom</option>
            </select>
          </div>
        </div>
        <div className="grid gap-1">
          <Label>Renewal date</Label>
          <Input
            type="date"
            value={renewalDate}
            onChange={(event) => setRenewalDate(event.target.value)}
          />
        </div>
        <div className="flex gap-2 pt-1">
          <Button
            disabled={!canConfirm || saving}
            onClick={async () => {
              setSaving(true);
              await onConfirm({
                candidateId: candidate.id,
                groupId,
                vendorName: vendorName.trim(),
                amount: Number(amount),
                currency,
                cadence,
                renewalDate,
              });
              setSaving(false);
            }}
          >
            {saving ? "Saving…" : "Confirm and create subscription"}
          </Button>
          <Button
            variant="outline"
            disabled={saving}
            onClick={async () => {
              setSaving(true);
              await onReject(candidate.id);
              setSaving(false);
            }}
          >
            Reject
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
