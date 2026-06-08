"use client";

import { useChat } from "ai/react";
import Image from "next/image";
import Link from "next/link";
import { AlertCircle, Check, ChevronDown, Loader2, Send, Square, X } from "lucide-react";
import { useCallback, useEffect, useId, useRef, useState } from "react";

import { BoopyLottieMascot } from "@/components/boopy/boopy-lottie-mascot";
import { useWorkspaceBilling } from "@/hooks/use-workspace-billing";
import { Button, buttonVariants } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { canUseBoopyAssistant } from "@/lib/billing/plan";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import { cn } from "@/lib/utils";

// ── simple inline markdown renderer ──────────────────────────────────────────

function renderMarkdown(text: string): string {
  let html = text
    // escape raw HTML
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // fenced code blocks
  html = html.replace(
    /```[\w]*\n?([\s\S]*?)```/g,
    (_m, code: string) =>
      `<pre style="background:#f1f0f8;border-radius:6px;padding:10px 12px;overflow-x:auto;font-size:12px;line-height:1.5;margin:6px 0;"><code>${code.trim()}</code></pre>`
  );
  // inline code
  html = html.replace(
    /`([^`]+)`/g,
    '<code style="background:#f1f0f8;border-radius:3px;padding:1px 5px;font-size:12px;">$1</code>'
  );
  // bold
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  // italic
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");
  // unordered list lines
  html = html.replace(/^[ \t]*[-*] (.+)/gm, '<li style="margin:2px 0;">$1</li>');
  html = html.replace(
    /(<li[\s\S]*?<\/li>)/g,
    '<ul style="padding-left:18px;margin:4px 0;">$1</ul>'
  );
  // headings
  html = html.replace(
    /^### (.+)$/gm,
    '<h3 style="font-size:13px;font-weight:700;margin:8px 0 3px;">$1</h3>'
  );
  html = html.replace(
    /^## (.+)$/gm,
    '<h2 style="font-size:14px;font-weight:700;margin:10px 0 3px;">$1</h2>'
  );
  html = html.replace(
    /^# (.+)$/gm,
    '<h2 style="font-size:15px;font-weight:700;margin:10px 0 3px;">$1</h2>'
  );
  // double newlines → paragraph break
  html = html.replace(/\n\n+/g, "<br/><br/>");
  // single newlines
  html = html.replace(/\n/g, "<br/>");

  return html;
}

// ── helpers ──────────────────────────────────────────────────────────────────

function messageBodyText(m: {
  content?: string;
  parts?: Array<{ type: string; text?: string }>;
}): string {
  if (typeof m.content === "string" && m.content.length > 0) return m.content;
  if (Array.isArray(m.parts)) {
    return m.parts
      .filter((p) => p.type === "text")
      .map((p) => p.text ?? "")
      .join("");
  }
  return "";
}

const TOOL_LABELS: Record<string, string> = {
  get_workspace_overview: "Reading workspace…",
  create_group: "Creating group…",
  create_subscription: "Adding subscription…",
  update_subscription: "Updating subscription…",
  delete_subscription: "Deleting subscription…",
};

function ToolLines({ invocations }: { invocations: Array<{ toolName: string; state: string }> }) {
  return (
    <div className="mb-2 grid gap-1">
      {invocations.map((t, i) => {
        const done = t.state === "result";
        const running = t.state === "call" || t.state === "partial-call";
        const label = TOOL_LABELS[t.toolName] ?? `${t.toolName}…`;
        return (
          <div key={i} className="flex items-center gap-1.5">
            {done ? (
              <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <Check className="size-2.5" strokeWidth={3} />
              </span>
            ) : running ? (
              <Loader2 className="text-muted-foreground h-3.5 w-3.5 animate-spin" />
            ) : (
              <span className="border-border h-3.5 w-3.5 rounded-full border-2" />
            )}
            <span
              className={cn(
                "font-mono text-[11px]",
                done ? "text-muted-foreground line-through" : "text-foreground"
              )}
            >
              {done ? t.toolName : label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-3 py-2">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="bg-muted-foreground/40 h-1.5 w-1.5 rounded-full"
          style={{ animation: `boopyDot 1.2s ease-in-out ${i * 0.2}s infinite` }}
        />
      ))}
    </div>
  );
}

const SUGGESTIONS = [
  "What renews this week?",
  "Add a subscription",
  "How do I upload a receipt?",
  "Show my spending by group",
] as const;

// ── chat panel ────────────────────────────────────────────────────────────────

function BoopyAssistantChatPanel({ chatSessionId }: { chatSessionId: string }) {
  const { messages, input, setInput, append, status, stop, error } = useChat({
    id: chatSessionId,
    api: "/api/chat",
    maxSteps: 8,
    fetch: async (url, options) => {
      const supabase = getSupabaseBrowser();
      const session = await supabase?.auth.getSession();
      const token = session?.data.session?.access_token;
      const headers = new Headers(options?.headers);
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return fetch(url, { ...options, headers });
    },
  });

  const busy = status === "streaming" || status === "submitted";
  const isTyping =
    status === "submitted" &&
    (messages.length === 0 || messages[messages.length - 1].role === "user");

  const scrollRef = useRef<HTMLDivElement>(null);
  const [atBottom, setAtBottom] = useState(true);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior });
  }, []);

  useEffect(() => {
    if (atBottom) scrollToBottom();
  }, [messages, status, atBottom, scrollToBottom]);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 60;
    setAtBottom(isNearBottom);
  }, []);

  const handleSubmit = useCallback(
    (e?: React.FormEvent) => {
      e?.preventDefault();
      if (!input?.trim() || busy) return;
      setAtBottom(true);
      void append({ role: "user", content: input.trim() });
      setInput("");
    },
    [input, busy, append, setInput]
  );

  return (
    <>
      {/* message list */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex flex-1 flex-col gap-2.5 overflow-y-auto px-3 py-3 text-sm"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-3 text-center">
            <BoopyLottieMascot
              className="relative h-[80px] w-[80px]"
              emotion="boopy-hi"
              reducedMotionBehavior="fallback-image"
            />
            <div>
              <p className="font-heading text-[16px] font-semibold">Hey, I&apos;m Boopy</p>
              <p className="text-muted-foreground mx-auto mt-1 max-w-[200px] text-xs leading-relaxed">
                Ask me anything about your subscriptions or Boopy.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-1.5">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  disabled={busy}
                  onClick={() => {
                    setAtBottom(true);
                    void append({ role: "user", content: s });
                  }}
                  className="border-border bg-background text-muted-foreground hover:text-foreground rounded-full border px-2.5 py-1 text-xs font-medium transition-colors disabled:opacity-50"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((m) => {
              const text = messageBodyText(m);
              const isUser = m.role === "user";
              return (
                <div key={m.id} className={cn("flex", isUser ? "justify-end" : "justify-start")}>
                  <div
                    className={cn(
                      "max-w-[92%] rounded-xl px-3 py-2 text-[13px] leading-relaxed",
                      isUser ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                    )}
                  >
                    {m.toolInvocations?.length ? (
                      <ToolLines invocations={m.toolInvocations} />
                    ) : null}
                    {text ? (
                      isUser ? (
                        <span style={{ whiteSpace: "pre-wrap" }}>{text}</span>
                      ) : (
                        <span dangerouslySetInnerHTML={{ __html: renderMarkdown(text) }} />
                      )
                    ) : null}
                  </div>
                </div>
              );
            })}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-xl">
                  <TypingDots />
                </div>
              </div>
            )}
          </>
        )}

        {error && (
          <div className="border-destructive/20 bg-destructive/5 flex items-start gap-2 rounded-lg border px-3 py-2 text-xs">
            <AlertCircle className="text-destructive mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span className="text-destructive">
              {error.message || "Something went wrong. Try again."}
            </span>
          </div>
        )}
      </div>

      {/* scroll-to-bottom button */}
      {!atBottom && (
        <div className="pointer-events-none absolute right-3 bottom-[68px] z-10">
          <button
            onClick={() => {
              setAtBottom(true);
              scrollToBottom();
            }}
            className="bg-background border-border text-muted-foreground pointer-events-auto flex h-7 w-7 items-center justify-center rounded-full border shadow-md"
          >
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* input row */}
      <form className="border-t p-2" onSubmit={handleSubmit}>
        <div className="flex gap-1.5">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Message Boopy…"
            rows={2}
            className="min-h-0 flex-1 resize-none text-sm"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
          />
          <div className="flex flex-col gap-1">
            {busy ? (
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => stop()}
                aria-label="Stop"
              >
                <Square className="h-3.5 w-3.5 fill-current" />
              </Button>
            ) : (
              <Button type="submit" size="icon" disabled={!input?.trim()} aria-label="Send">
                <Send className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </form>
    </>
  );
}

// ── widget ────────────────────────────────────────────────────────────────────

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

  if (!workspaceId) return null;

  return (
    <>
      {/* typing dots keyframe — injected once */}
      <style>{`@keyframes boopyDot{0%,80%,100%{opacity:.25;transform:scale(.8)}40%{opacity:1;transform:scale(1)}}`}</style>

      <div className="pointer-events-none fixed right-[max(0.75rem,env(safe-area-inset-right))] bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-50 flex flex-col items-end gap-2 sm:right-5 sm:bottom-5 md:right-6 md:bottom-6">
        {open ? (
          <div className="bg-background border-border animate-panel-in pointer-events-auto relative flex max-h-[min(34rem,72dvh)] w-[min(100vw-2rem,22rem)] flex-col overflow-hidden rounded-2xl border shadow-xl">
            {/* header */}
            <div className="from-accent to-card flex shrink-0 items-center gap-2.5 border-b bg-gradient-to-r px-3 py-2.5">
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

            {/* body */}
            {showLoading ? (
              <div className="text-muted-foreground flex flex-1 items-center justify-center gap-2 px-3 py-6 text-sm">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading…
              </div>
            ) : proAssistant ? (
              <BoopyAssistantChatPanel chatSessionId={chatSessionId} />
            ) : (
              <div className="space-y-4 px-4 py-5 text-sm">
                <div className="flex justify-center">
                  <BoopyLottieMascot
                    className="relative h-16 w-16"
                    emotion="boopy-hi"
                    reducedMotionBehavior="fallback-image"
                  />
                </div>
                <p className="text-muted-foreground text-center text-sm leading-relaxed">
                  Boopy Assistant can read your workspace and take actions — create groups, add
                  subscriptions, answer questions — all from chat. It&apos;s included with{" "}
                  <span className="text-foreground font-semibold">Boopy Pro</span>.
                </p>
                <Link
                  href="/settings/billing"
                  className={cn(buttonVariants(), "flex w-full justify-center")}
                >
                  Upgrade to Pro
                </Link>
              </div>
            )}
          </div>
        ) : null}

        {/* FAB */}
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
    </>
  );
}
