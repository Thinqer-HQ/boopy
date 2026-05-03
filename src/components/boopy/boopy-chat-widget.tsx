"use client";

import { useChat } from "ai/react";
import Link from "next/link";
import { Lock, MessageCircle, Send, Sparkles, X } from "lucide-react";
import { useId, useState } from "react";

import { useWorkspaceBilling } from "@/hooks/use-workspace-billing";
import { Button, buttonVariants } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { canUseBoopyAssistant } from "@/lib/billing/plan";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import { cn } from "@/lib/utils";

function messageBodyText(m: {
  content?: string;
  parts?: Array<{ type: string; text?: string }>;
}): string {
  if (typeof m.content === "string" && m.content.length > 0) {
    return m.content;
  }
  if (Array.isArray(m.parts)) {
    return m.parts
      .filter((p) => p.type === "text")
      .map((p) => p.text ?? "")
      .join("");
  }
  return "";
}

function toolSummaryLines(m: {
  toolInvocations?: Array<{ toolName: string; state: string }>;
}): string[] {
  const inv = m.toolInvocations;
  if (!inv?.length) return [];
  return inv.map((t) => {
    const label =
      t.state === "result"
        ? "done"
        : t.state === "call"
          ? "running"
          : t.state === "partial-call"
            ? "…"
            : t.state;
    return `• ${t.toolName} (${label})`;
  });
}

function BoopyAssistantChatPanel({ chatSessionId }: { chatSessionId: string }) {
  const { messages, input, setInput, append, status, stop } = useChat({
    id: chatSessionId,
    api: "/api/chat",
    maxSteps: 8,
    fetch: async (url, options) => {
      const supabase = getSupabaseBrowser();
      const session = await supabase?.auth.getSession();
      const token = session?.data.session?.access_token;
      const headers = new Headers(options?.headers);
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return fetch(url, { ...options, headers });
    },
  });

  const busy = status === "streaming" || status === "submitted";

  return (
    <>
      <div className="text-muted-foreground space-y-3 overflow-y-auto px-3 py-2 text-sm">
        {messages.length === 0 ? (
          <p>
            Boopy Assistant (Pro): ask about renewals and groups, or request changes like adding a
            subscription. Only your workspace data is used. Off-topic questions are declined
            briefly.
          </p>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}
            >
              <div
                className={cn(
                  "max-w-[95%] rounded-xl px-3 py-2 whitespace-pre-wrap",
                  m.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground"
                )}
              >
                {toolSummaryLines(m).length > 0 ? (
                  <div className="text-muted-foreground mb-2 font-mono text-xs">
                    {toolSummaryLines(m).join("\n")}
                  </div>
                ) : null}
                {messageBodyText(m)}
              </div>
            </div>
          ))
        )}
      </div>
      <form
        className="border-t p-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (!input?.trim() || busy) return;
          void append({ role: "user", content: input });
          setInput("");
        }}
      >
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Message Boopy…"
            rows={2}
            className="min-h-0 flex-1 resize-none text-sm"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                e.currentTarget.form?.requestSubmit();
              }
            }}
          />
          <div className="flex flex-col gap-1">
            <Button type="submit" size="icon" disabled={busy || !input?.trim()} aria-label="Send">
              <Send className="h-4 w-4" />
            </Button>
            {busy ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => stop()}
              >
                Stop
              </Button>
            ) : null}
          </div>
        </div>
      </form>
    </>
  );
}

export function BoopyChatWidget({ workspaceId }: { workspaceId: string | null }) {
  const [open, setOpen] = useState(false);
  const reactId = useId();
  const chatSessionId = `boopy-chat-${reactId.replace(/:/g, "")}`;
  const billing = useWorkspaceBilling(workspaceId);

  const proAssistant = canUseBoopyAssistant(billing.plan);
  const showLoading = Boolean(workspaceId) && billing.loading;

  if (!workspaceId) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed right-[max(0.75rem,env(safe-area-inset-right))] bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-50 flex flex-col items-end gap-2 sm:right-5 sm:bottom-5 md:right-6 md:bottom-6">
      {open ? (
        <div className="bg-background border-border pointer-events-auto flex max-h-[min(32rem,70dvh)] w-[min(100vw-2rem,22rem)] flex-col overflow-hidden rounded-2xl border shadow-xl">
          <div className="flex items-center justify-between border-b px-3 py-2">
            <div className="flex items-center gap-2">
              {proAssistant ? (
                <Sparkles className="text-primary h-4 w-4" aria-hidden />
              ) : (
                <Lock className="text-muted-foreground h-4 w-4" aria-hidden />
              )}
              <span className="text-sm font-semibold">Boopy Assistant</span>
              {!proAssistant ? (
                <span className="text-muted-foreground bg-muted rounded-md px-1.5 py-0.5 text-xs">
                  Pro
                </span>
              ) : null}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="h-8 w-8"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          {showLoading ? (
            <div className="text-muted-foreground px-3 py-6 text-center text-sm">Loading…</div>
          ) : proAssistant ? (
            <BoopyAssistantChatPanel chatSessionId={chatSessionId} />
          ) : (
            <div className="space-y-4 px-3 py-4 text-sm">
              <p className="text-muted-foreground">
                The Boopy Assistant can read your workspace and create groups or subscriptions from
                chat. It is included with{" "}
                <span className="text-foreground font-medium">Boopy Pro</span>.
              </p>
              <Link
                href="/settings/billing"
                className={cn(buttonVariants(), "inline-flex w-full justify-center")}
              >
                Upgrade to Pro
              </Link>
            </div>
          )}
        </div>
      ) : null}
      <Button
        type="button"
        size="lg"
        className="pointer-events-auto h-14 w-14 rounded-full shadow-lg"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={open ? "Close Boopy Assistant" : "Open Boopy Assistant"}
      >
        {open ? (
          <X className="h-6 w-6" />
        ) : proAssistant ? (
          <MessageCircle className="h-6 w-6" />
        ) : (
          <Lock className="h-6 w-6" />
        )}
      </Button>
    </div>
  );
}
