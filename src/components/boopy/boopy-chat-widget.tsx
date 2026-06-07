"use client";

import { useChat } from "ai/react";
import Image from "next/image";
import Link from "next/link";
import { Check, Send, X } from "lucide-react";
import { useEffect, useId, useState } from "react";

import { BoopyLottieMascot } from "@/components/boopy/boopy-lottie-mascot";

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

const SUGGESTIONS = [
  "What renews this week?",
  "Cancel everything I don't use",
  "Add a subscription",
  "Move reminders to Slack",
] as const;

function ToolLines({ invocations }: { invocations: Array<{ toolName: string; state: string }> }) {
  return (
    <div className="mb-2.5 grid gap-1.5">
      {invocations.map((t, i) => {
        const done = t.state === "result";
        const running = t.state === "call" || t.state === "partial-call";
        return (
          <div key={i} className="flex items-center gap-2">
            {done ? (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#e4f6ee] text-[#1faa6b]">
                <Check className="size-2.5" strokeWidth={3} />
              </span>
            ) : running ? (
              <span className="border-primary/20 border-t-primary h-4 w-4 animate-spin rounded-full border-2" />
            ) : (
              <span className="border-border h-4 w-4 rounded-full border-2" />
            )}
            <span
              className={cn(
                "font-mono text-[11px]",
                running ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {t.toolName}()
            </span>
          </div>
        );
      })}
    </div>
  );
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
      <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-3 py-3 text-sm">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-3 text-center">
            <BoopyLottieMascot
              className="relative h-[88px] w-[88px]"
              emotion="boopy-hi"
              reducedMotionBehavior="fallback-image"
            />
            <div>
              <p className="font-heading text-[17px] font-semibold">Hey, I&apos;m Boopy 👋</p>
              <p className="text-muted-foreground mx-auto mt-1 max-w-[210px] text-sm leading-relaxed">
                Tell me what to do and I&apos;ll act on your workspace.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-1.5">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  disabled={busy}
                  onClick={() => {
                    void append({ role: "user", content: s });
                  }}
                  className="border-border bg-background text-muted-foreground hover:text-foreground rounded-full border px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
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
                {m.toolInvocations?.length ? <ToolLines invocations={m.toolInvocations} /> : null}
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

  useEffect(() => {
    const handleOpen = () => setOpen(true);
    window.addEventListener("boopy:openChat", handleOpen);
    return () => window.removeEventListener("boopy:openChat", handleOpen);
  }, []);

  const proAssistant = canUseBoopyAssistant(billing.plan);
  const showLoading = Boolean(workspaceId) && billing.loading;

  if (!workspaceId) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed right-[max(0.75rem,env(safe-area-inset-right))] bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-50 flex flex-col items-end gap-2 sm:right-5 sm:bottom-5 md:right-6 md:bottom-6">
      {open ? (
        <div className="bg-background border-border animate-panel-in pointer-events-auto flex max-h-[min(32rem,70dvh)] w-[min(100vw-2rem,22rem)] flex-col overflow-hidden rounded-2xl border shadow-xl">
          <div className="from-accent to-card flex items-center gap-2.5 border-b bg-gradient-to-r px-3 py-2.5">
            <div className="from-primary/70 to-primary flex size-[34px] shrink-0 items-end justify-center overflow-hidden rounded-[10px] bg-gradient-to-br">
              <Image
                src="/boopy-assets/boopy-hi.png"
                alt=""
                width={30}
                height={30}
                className="-mb-0.5"
                draggable={false}
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold">Boopy Assistant</span>
                <span className="font-heading bg-accent text-accent-foreground rounded px-1.5 py-0.5 text-[10px] font-semibold tracking-wide">
                  PRO
                </span>
              </div>
              <p className="text-muted-foreground text-[11px]">Acts on your workspace</p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="h-7 w-7 shrink-0"
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
      <button
        type="button"
        className={cn(
          "to-primary pointer-events-auto relative flex h-[62px] w-[62px] items-end justify-center overflow-hidden rounded-[20px] bg-gradient-to-br from-[#8b7cf8] shadow-[0_12px_30px_rgba(88,71,224,0.45)] transition-shadow hover:shadow-[0_16px_36px_rgba(88,71,224,0.55)]",
          !open && "animate-fab-bob"
        )}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={open ? "Close Boopy Assistant" : "Open Boopy Assistant"}
      >
        <Image
          src={open ? "/boopy-assets/boopy-good.png" : "/boopy-assets/boopy-hi.png"}
          alt=""
          width={54}
          height={54}
          className="-mb-1"
          draggable={false}
          priority
        />
        {!open && (
          <span className="absolute top-2 right-2 h-[11px] w-[11px] rounded-full border-2 border-white bg-[#ff5a5f]" />
        )}
      </button>
    </div>
  );
}
