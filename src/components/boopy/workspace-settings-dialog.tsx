"use client";

import { useEffect, useMemo, useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getCurrencyOptions } from "@/lib/currencies";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  initialName: string;
  initialCurrency: string;
  saving?: boolean;
  forceOpen?: boolean;
  saveLabel?: string;
  serverError?: string | null;
  onSave: (payload: { name: string; defaultCurrency: string }) => Promise<void>;
};

export function WorkspaceSettingsDialog({
  open,
  onOpenChange,
  title,
  description,
  initialName,
  initialCurrency,
  saving = false,
  forceOpen = false,
  saveLabel = "Save settings",
  serverError = null,
  onSave,
}: Props) {
  const [name, setName] = useState(initialName);
  const [currency, setCurrency] = useState(initialCurrency || "USD");
  const [error, setError] = useState<string | null>(null);
  const currencyOptions = useMemo(() => getCurrencyOptions(), []);

  useEffect(() => {
    setName(initialName);
  }, [initialName]);

  useEffect(() => {
    setCurrency(initialCurrency || "USD");
  }, [initialCurrency]);

  async function handleSave() {
    const trimmedName = name.trim();
    const normalizedCurrency = currency.trim().toUpperCase();
    if (!trimmedName) {
      setError("Workspace name is required.");
      return;
    }
    if (normalizedCurrency.length < 3) {
      setError("Currency code must be at least 3 characters.");
      return;
    }
    setError(null);
    await onSave({ name: trimmedName, defaultCurrency: normalizedCurrency });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => (forceOpen ? undefined : onOpenChange(nextOpen))}
    >
      <DialogContent className="sm:max-w-lg" showCloseButton={!forceOpen}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 py-2">
          <div className="grid gap-2">
            <Label htmlFor="workspace-name">Workspace name</Label>
            <Input
              id="workspace-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Personal"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="workspace-currency">Default currency</Label>
            <Input
              id="workspace-currency"
              value={currency}
              list="workspace-currencies"
              onChange={(event) => setCurrency(event.target.value.toUpperCase())}
              placeholder="USD"
              maxLength={8}
            />
            <datalist id="workspace-currencies">
              {currencyOptions.map((value) => (
                <option key={value} value={value} />
              ))}
            </datalist>
            <p className="text-muted-foreground text-xs">
              Search and select from global currencies, or type a valid ISO currency code.
            </p>
            <p className="text-muted-foreground text-xs">
              This sets the default for new subscriptions only. Existing subscriptions keep their
              original currency.
            </p>
          </div>
          {error || serverError ? (
            <p className="text-destructive text-sm">{error ?? serverError}</p>
          ) : null}
        </div>
        <DialogFooter>
          {!forceOpen ? (
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          ) : null}
          <Button disabled={saving} onClick={() => void handleSave()}>
            {saving ? "Saving..." : saveLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
