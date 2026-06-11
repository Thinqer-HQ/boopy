"use client";

import { useChat } from "ai/react";
import Image from "next/image";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  Check,
  ChevronDown,
  Loader2,
  Plus,
  RotateCcw,
  Send,
  Square,
  X,
} from "lucide-react";
import { useCallback, useEffect, useId, useRef, useState } from "react";

import { useWorkspaceBilling } from "@/hooks/use-workspace-billing";
import { buttonVariants } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { canUseBoopyAssistant } from "@/lib/billing/plan";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import { cn } from "@/lib/utils";

// ── markdown renderer ─────────────────────────────────────────────────────────

function renderMarkdown(text: string): string {
  let html = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  html = html.replace(
    /```[\w]*\n?([\s\S]*?)```/g,
    (_m, code: string) =>
      `<pre style="background:#f1f0f8;border-radius:6px;padding:10px 12px;overflow-x:auto;font-size:12px;line-height:1.5;margin:6px 0;"><code>${code.trim()}</code></pre>`
  );
  html = html.replace(
    /`([^`]+)`/g,
    '<code style="background:#f1f0f8;border-radius:3px;padding:1px 5px;font-size:12px;">$1</code>'
  );
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");
  html = html.replace(/^[ \t]*[-*] (.+)/gm, '<li style="margin:2px 0;">$1</li>');
  html = html.replace(
    /(<li[\s\S]*?<\/li>)/g,
    '<ul style="padding-left:18px;margin:4px 0;">$1</ul>'
  );
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
  html = html.replace(/\n\n+/g, "<br/><br/>");
  html = html.replace(/\n/g, "<br/>");
  return html;
}

// ── helpers ───────────────────────────────────────────────────────────────────

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
    <div className="flex items-center gap-1.5 py-0.5">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="bg-muted-foreground/50 size-2 rounded-full"
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
  "Show spending by group",
] as const;

const BOOPY_ICON = "/boopy-assets/boopy-icon.png";

// ── chat panel ────────────────────────────────────────────────────────────────

function BoopyAssistantChatPanel({
  chatSessionId,
  onClose,
}: {
  chatSessionId: string;
  onClose: () => void;
}) {
  const { messages, input, setInput, setMessages, append, status, stop, error, reload } = useChat({
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

  const [view, setView] = useState<"home" | "chat">("home");
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
    if (atBottom && view === "chat") scrollToBottom();
  }, [messages, status, atBottom, view, scrollToBottom]);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setAtBottom(el.scrollHeight - el.scrollTop - el.clientHeight < 60);
  }, []);

  const sendMessage = useCallback(
    (text: string) => {
      setAtBottom(true);
      setView("chat");
      void append({ role: "user", content: text });
    },
    [append]
  );

  const handleSubmit = useCallback(
    (e?: React.FormEvent) => {
      e?.preventDefault();
      if (!input?.trim() || busy) return;
      sendMessage(input.trim());
      setInput("");
    },
    [input, busy, sendMessage, setInput]
  );

  const startNewChat = useCallback(() => {
    setMessages([]);
    setInput("");
    setView("home");
  }, [setMessages, setInput]);

  return (
    <div className="flex h-full flex-col">
      {/* ── Header ── */}
      <div className="flex shrink-0 items-center gap-2 border-b bg-white/70 px-3 py-2.5 backdrop-blur">
        {view === "chat" ? (
          <button
            type="button"
            onClick={() => setView("home")}
            className="text-muted-foreground hover:text-foreground flex size-7 shrink-0 items-center justify-center rounded-lg transition-colors hover:bg-black/5"
            aria-label="Back to home"
          >
            <ArrowLeft className="size-4" />
          </button>
        ) : (
          <Image
            src={BOOPY_ICON}
            alt=""
            width={32}
            height={32}
            className="size-8 shrink-0 rounded-[10px]"
            draggable={false}
          />
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-bold">Boopy Assistant</span>
            <span className="bg-primary/10 text-primary rounded px-1.5 py-0.5 text-[10px] font-semibold tracking-wide">
              PRO
            </span>
          </div>
          <p className="text-muted-foreground text-[11px]">Acts on your workspace</p>
        </div>
        {view === "chat" && (
          <button
            type="button"
            onClick={startNewChat}
            className="text-muted-foreground hover:text-foreground flex size-7 shrink-0 items-center justify-center rounded-lg transition-colors hover:bg-black/5"
            aria-label="New conversation"
            title="New conversation"
          >
            <Plus className="size-4" />
          </button>
        )}
        <button
          type="button"
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground flex size-7 shrink-0 items-center justify-center rounded-lg transition-colors hover:bg-black/5"
          aria-label="Close"
        >
          <X className="size-4" />
        </button>
      </div>

      {/* ── Body ── */}
      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
        {view === "home" ? (
          /* ── Home view ── */
          <div className="flex flex-1 flex-col items-center gap-4 overflow-y-auto px-4 py-6 text-center">
            <Image
              src={BOOPY_ICON}
              alt="Boopy"
              width={72}
              height={72}
              className="size-[72px] rounded-2xl shadow-md"
              draggable={false}
            />
            <div>
              <p className="font-heading text-[17px] font-semibold">Hi, I&apos;m Boopy</p>
              <p className="text-muted-foreground mt-1 max-w-[200px] text-xs leading-relaxed">
                Ask me anything about your subscriptions or workspace.
              </p>
            </div>
            <div className="grid w-full grid-cols-2 gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  disabled={busy}
                  onClick={() => sendMessage(s)}
                  className="border-border bg-background hover:bg-accent text-foreground rounded-xl border px-3 py-2.5 text-left text-xs leading-snug font-medium transition-colors disabled:opacity-50"
                >
                  {s}
                </button>
              ))}
            </div>
            {messages.length > 0 && (
              <button
                onClick={() => setView("chat")}
                className="text-primary text-xs font-medium underline-offset-2 hover:underline"
              >
                Continue conversation →
              </button>
            )}
          </div>
        ) : (
          /* ── Chat view ── */
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex flex-1 flex-col gap-2.5 overflow-y-auto px-3 py-3"
          >
            {messages.map((m) => {
              const text = messageBodyText(m);
              const isUser = m.role === "user";
              return (
                <div
                  key={m.id}
                  className={cn("flex items-end gap-2", isUser ? "justify-end" : "justify-start")}
                >
                  {!isUser && (
                    <Image
                      src={BOOPY_ICON}
                      alt=""
                      width={22}
                      height={22}
                      className="mb-0.5 size-[22px] shrink-0 rounded-[6px]"
                      draggable={false}
                    />
                  )}
                  <div
                    className={cn(
                      "max-w-[80%] rounded-2xl px-3 py-2 text-[13px] leading-relaxed",
                      isUser
                        ? "bg-primary text-primary-foreground rounded-br-sm"
                        : "bg-muted text-foreground rounded-bl-sm"
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
              <div className="flex items-end gap-2">
                <Image
                  src={BOOPY_ICON}
                  alt=""
                  width={22}
                  height={22}
                  className="mb-0.5 size-[22px] shrink-0 rounded-[6px]"
                  draggable={false}
                />
                <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-3">
                  <TypingDots />
                </div>
              </div>
            )}

            {error && (
              <div className="border-destructive/20 bg-destructive/5 flex items-start gap-2 rounded-xl border px-3 py-2.5 text-xs">
                <AlertCircle className="text-destructive mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span className="text-destructive flex-1">
                  {error.message || "Something went wrong. Try again."}
                </span>
                <button
                  type="button"
                  onClick={() => void reload()}
                  className="text-destructive hover:bg-destructive/10 shrink-0 rounded p-0.5"
                  title="Retry"
                  aria-label="Retry"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* scroll-to-bottom — only in chat view, overlays above input */}
        {view === "chat" && !atBottom && (
          <div className="pointer-events-none absolute right-3 bottom-3 z-10">
            <button
              type="button"
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
      </div>

      {/* ── Input bar ── */}
      <form className="shrink-0 border-t p-2.5" onSubmit={handleSubmit}>
        <div className="bg-muted/50 flex items-end gap-2 rounded-xl px-3 py-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Message Boopy…"
            rows={2}
            className="min-h-0 flex-1 resize-none border-0 bg-transparent p-0 text-sm shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
          />
          {busy ? (
            <button
              type="button"
              onClick={() => stop()}
              className="bg-primary text-primary-foreground flex size-7 shrink-0 items-center justify-center rounded-lg"
              aria-label="Stop"
            >
              <Square className="size-3 fill-current" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={!input?.trim()}
              className="bg-primary text-primary-foreground flex size-7 shrink-0 items-center justify-center rounded-lg transition-opacity disabled:opacity-40"
              aria-label="Send"
            >
              <Send className="size-3.5" />
            </button>
          )}
        </div>
      </form>
    </div>
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
      <style>{`@keyframes boopyDot{0%,80%,100%{opacity:.25;transform:scale(.8)}40%{opacity:1;transform:scale(1)}}`}</style>

      <div className="pointer-events-none fixed right-[max(0.75rem,env(safe-area-inset-right))] bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-50 flex flex-col items-end gap-3 sm:right-5 sm:bottom-5 md:right-6 md:bottom-6">
        {open ? (
          <div className="bg-background border-border animate-panel-in pointer-events-auto relative flex max-h-[min(34rem,72dvh)] w-[min(100vw-2rem,22rem)] flex-col overflow-hidden rounded-2xl border shadow-xl">
            {showLoading ? (
              <div className="flex flex-1 items-center justify-center gap-2 px-3 py-10 text-sm">
                <Loader2 className="text-muted-foreground h-4 w-4 animate-spin" />
                <span className="text-muted-foreground">Loading…</span>
              </div>
            ) : proAssistant ? (
              <BoopyAssistantChatPanel
                chatSessionId={chatSessionId}
                onClose={() => setOpen(false)}
              />
            ) : (
              /* ── Upsell panel ── */
              <div className="flex flex-col">
                <div className="flex items-center gap-2 border-b px-3 py-2.5">
                  <Image
                    src={BOOPY_ICON}
                    alt=""
                    width={32}
                    height={32}
                    className="size-8 shrink-0 rounded-[10px]"
                    draggable={false}
                  />
                  <span className="flex-1 text-sm font-bold">Boopy Assistant</span>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="text-muted-foreground hover:text-foreground flex size-7 items-center justify-center rounded-lg transition-colors hover:bg-black/5"
                    aria-label="Close"
                  >
                    <X className="size-4" />
                  </button>
                </div>
                <div className="flex flex-col items-center gap-4 px-4 py-6 text-center">
                  <Image
                    src={BOOPY_ICON}
                    alt=""
                    width={72}
                    height={72}
                    className="size-[72px] rounded-2xl shadow-md"
                    draggable={false}
                  />
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Boopy Assistant can read your workspace and take actions — create groups, add
                    subscriptions, answer questions. Included with{" "}
                    <span className="text-foreground font-semibold">Boopy Pro</span>.
                  </p>
                  <Link
                    href="/settings/billing"
                    className={cn(buttonVariants(), "w-full justify-center")}
                    onClick={() => setOpen(false)}
                  >
                    Upgrade to Pro
                  </Link>
                </div>
              </div>
            )}
          </div>
        ) : null}

        {/* ── FAB ── */}
        <button
          type="button"
          className={cn(
            "pointer-events-auto relative flex size-[56px] shrink-0 items-center justify-center overflow-hidden rounded-[18px] shadow-[0_8px_24px_rgba(88,71,224,0.38)] transition-shadow hover:shadow-[0_12px_32px_rgba(88,71,224,0.52)]",
            !open && "animate-fab-bob"
          )}
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-label={open ? "Close Boopy Assistant" : "Open Boopy Assistant"}
        >
          <Image
            src={BOOPY_ICON}
            alt=""
            width={56}
            height={56}
            className="size-full object-cover"
            draggable={false}
            priority
          />
          {!open && (
            <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-[#ff5a5f]" />
          )}
        </button>
      </div>
    </>
  );
}
