"use client";

import { ScanLine } from "lucide-react";
import { useRef, useState } from "react";

import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import { cn } from "@/lib/utils";

export type SubscriptionScanApplyPayload = {
  vendor?: string;
  amount?: string;
  currency?: string;
  cadence?: "monthly" | "yearly" | "quarterly" | "custom";
  renewalDate?: string;
  startDate?: string;
  endDate?: string;
  category?: string;
  notes?: string;
};

type ApiOk = {
  ok: true;
  source: "heuristic" | "vision";
  confidence: number;
  fields: {
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
  hints: string[];
};

type ApiErr = { error?: string };

function fieldsToPatch(fields: ApiOk["fields"]): SubscriptionScanApplyPayload {
  const patch: SubscriptionScanApplyPayload = {};
  if (fields.vendorName) patch.vendor = fields.vendorName;
  if (fields.amount != null) patch.amount = String(fields.amount);
  if (fields.currency) patch.currency = fields.currency;
  if (fields.cadence) patch.cadence = fields.cadence;
  if (fields.renewalDate) patch.renewalDate = fields.renewalDate;
  if (fields.startDate) patch.startDate = fields.startDate;
  if (fields.endDate) patch.endDate = fields.endDate;
  if (fields.category) patch.category = fields.category;
  if (fields.notes) patch.notes = fields.notes;
  return patch;
}

type Props = {
  workspaceId: string;
  onApply: (
    patch: SubscriptionScanApplyPayload,
    meta: { source: string; confidence: number }
  ) => void;
  disabled?: boolean;
};

export function SubscriptionScanFill({ workspaceId, onApply, disabled }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function runScan(file: File) {
    setError(null);
    setMessage(null);
    setBusy(true);
    try {
      const supabase = getSupabaseBrowser();
      if (!supabase) {
        setError("Not configured.");
        return;
      }
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) {
        setError("Sign in required.");
        return;
      }
      const body = new FormData();
      body.set("workspaceId", workspaceId);
      body.set("file", file);
      const res = await fetch("/api/subscriptions/extract-from-file", {
        method: "POST",
        headers: { Authorization: `Bearer ${session.access_token}` },
        body,
      });
      const json = (await res.json().catch(() => ({}))) as ApiOk | ApiErr;
      if (!res.ok || !("ok" in json) || !json.ok) {
        setError((json as ApiErr).error ?? "Could not read this file.");
        return;
      }
      const patch = fieldsToPatch(json.fields);
      if (Object.keys(patch).length === 0) {
        setError(
          "Nothing usable was found — try another angle, PDF export, or enter details manually."
        );
        return;
      }
      onApply(patch, { source: json.source, confidence: json.confidence });
      const hintTail = json.hints.length > 0 ? ` ${json.hints[0]}` : "";
      setMessage(`Applied (${json.source}). Review before saving.${hintTail}`);
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="flex max-w-full flex-col items-end gap-1">
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept="image/png,image/jpeg,image/webp,application/pdf,text/plain,.pdf,.txt"
        onChange={(event) => {
          const file = event.currentTarget.files?.[0];
          if (file) void runScan(file);
        }}
      />
      <DropdownMenu>
        <DropdownMenuTrigger
          disabled={disabled || busy}
          aria-busy={busy}
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "h-8 gap-1 px-2 text-xs"
          )}
        >
          <ScanLine className="size-3.5 shrink-0" />
          {busy ? "Scanning…" : "Scan"}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[min(18rem,calc(100vw-2rem))]">
          <DropdownMenuItem
            onSelect={(event) => {
              event.preventDefault();
              inputRef.current?.click();
            }}
          >
            Choose image, PDF, or text…
          </DropdownMenuItem>
          <p className="text-muted-foreground border-border border-t px-2 py-2 text-xs leading-snug">
            Fills vendor, amount, dates, and notes when Boopy can read them. Screenshots use server
            AI when <span className="font-mono">OPENAI_API_KEY</span> is set. Your group selection
            is never changed — always verify amounts and renewal dates.
          </p>
        </DropdownMenuContent>
      </DropdownMenu>
      {message ? (
        <p className="text-muted-foreground max-w-56 text-right text-[11px]">{message}</p>
      ) : null}
      {error ? <p className="max-w-56 text-right text-[11px] text-red-600">{error}</p> : null}
    </div>
  );
}
