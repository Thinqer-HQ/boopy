"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  onCreate: (payload: {
    channel: "slack" | "discord" | "webhook";
    name: string;
    targetUrl: string;
    secretHeader?: string;
  }) => Promise<void>;
};

export function DestinationForm({ onCreate }: Props) {
  const [channel, setChannel] = useState<"slack" | "discord" | "webhook">("slack");
  const [name, setName] = useState("");
  const [targetUrl, setTargetUrl] = useState("");
  const [secretHeader, setSecretHeader] = useState("");
  const [saving, setSaving] = useState(false);

  return (
    <div className="grid gap-3 rounded-lg border p-4">
      <div className="grid gap-1">
        <Label>Channel</Label>
        <select
          value={channel}
          onChange={(event) => setChannel(event.target.value as "slack" | "discord" | "webhook")}
          className="border-input bg-background h-10 rounded-md border px-3 text-sm"
        >
          <option value="slack">Slack webhook</option>
          <option value="discord">Discord webhook</option>
          <option value="webhook">Generic webhook</option>
        </select>
      </div>
      <div className="grid gap-1">
        <Label>Name</Label>
        <Input
          placeholder="Team Slack"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </div>
      <div className="grid gap-1">
        <Label>Webhook URL</Label>
        <Input
          placeholder="https://..."
          value={targetUrl}
          onChange={(event) => setTargetUrl(event.target.value)}
        />
      </div>
      <div className="grid gap-1">
        <Label>Secret header (optional)</Label>
        <Input value={secretHeader} onChange={(event) => setSecretHeader(event.target.value)} />
      </div>
      <Button
        disabled={saving || !name.trim() || !targetUrl.trim()}
        onClick={async () => {
          setSaving(true);
          await onCreate({
            channel,
            name: name.trim(),
            targetUrl: targetUrl.trim(),
            secretHeader: secretHeader.trim() || undefined,
          });
          setSaving(false);
          setName("");
          setTargetUrl("");
          setSecretHeader("");
        }}
      >
        {saving ? "Saving…" : "Add destination"}
      </Button>
    </div>
  );
}
