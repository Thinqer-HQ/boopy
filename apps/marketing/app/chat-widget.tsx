"use client";

import { useEffect, useRef, useState } from "react";

type Message = {
  id: string;
  role: "user" | "assistant";
  text: string;
};

const GREETING: Message = {
  id: "greeting",
  role: "assistant",
  text: "Hey! I'm Boopy's support assistant. Ask me anything about pricing, features, or how it works.",
};

function BotAvatar() {
  return (
    <div className="chat-avatar">
      <svg viewBox="0 0 24 24" fill="none" width={14} height={14}>
        <circle cx="12" cy="12" r="10" fill="white" opacity="0.3" />
        <path
          d="M8 10.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5S10.33 12 9.5 12 8 11.33 8 10.5zM13 10.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5S15.33 12 14.5 12 13 11.33 13 10.5z"
          fill="white"
        />
        <path
          d="M9 15c.83.67 1.83 1 3 1s2.17-.33 3-1"
          stroke="white"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="chat-row chat-row-bot">
      <BotAvatar />
      <div className="chat-bubble chat-bubble-bot typing-indicator">
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([GREETING]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    setError(null);

    const userMsg: Message = { id: crypto.randomUUID(), role: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data = (await res.json()) as { reply?: string; error?: string };
      if (!res.ok || !data.reply) {
        setError(data.error ?? "Something went wrong. Try again.");
      } else {
        setMessages((prev) => [
          ...prev,
          { id: crypto.randomUUID(), role: "assistant", text: data.reply! },
        ]);
      }
    } catch {
      setError("Network error — please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void sendMessage();
    }
  }

  return (
    <>
      {/* Floating trigger */}
      <button
        type="button"
        className={`chat-trigger${open ? "chat-trigger-open" : ""}`}
        aria-label={open ? "Close chat" : "Open support chat"}
        onClick={() => setOpen((o) => !o)}
      >
        {open ? (
          <svg viewBox="0 0 24 24" fill="none" width={22} height={22}>
            <path d="M18 6L6 18M6 6l12 12" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" width={22} height={22}>
            <path
              d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
              stroke="white"
              strokeWidth="2"
              strokeLinejoin="round"
            />
          </svg>
        )}
        {!open && <span className="chat-trigger-pulse" />}
      </button>

      {/* Panel */}
      {open && (
        <div className="chat-panel" role="dialog" aria-label="Boopy support chat">
          {/* Header */}
          <div className="chat-header">
            <div className="chat-header-info">
              <div className="chat-header-avatar">
                <svg viewBox="0 0 24 24" fill="none" width={16} height={16}>
                  <circle cx="12" cy="12" r="10" fill="white" opacity="0.25" />
                  <path
                    d="M8 10.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5S10.33 12 9.5 12 8 11.33 8 10.5zM13 10.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5S15.33 12 14.5 12 13 11.33 13 10.5z"
                    fill="white"
                  />
                  <path
                    d="M9 15c.83.67 1.83 1 3 1s2.17-.33 3-1"
                    stroke="white"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <div>
                <p className="chat-header-name">Boopy Support</p>
                <p className="chat-header-status">
                  <span className="chat-online-dot" />
                  AI · Typically instant
                </p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="chat-messages">
            {messages.map((msg) =>
              msg.role === "user" ? (
                <div key={msg.id} className="chat-row chat-row-user">
                  <div className="chat-bubble chat-bubble-user">{msg.text}</div>
                </div>
              ) : (
                <div key={msg.id} className="chat-row chat-row-bot">
                  <BotAvatar />
                  <div className="chat-bubble chat-bubble-bot">{msg.text}</div>
                </div>
              )
            )}
            {loading && <TypingIndicator />}
            {error && (
              <div className="chat-row chat-row-bot">
                <BotAvatar />
                <div className="chat-bubble chat-bubble-bot chat-bubble-error">{error}</div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="chat-input-wrap">
            <input
              ref={inputRef}
              type="text"
              className="chat-input"
              placeholder="Ask a question…"
              value={input}
              maxLength={500}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              disabled={loading}
            />
            <button
              type="button"
              className="chat-send"
              disabled={!input.trim() || loading}
              onClick={() => void sendMessage()}
              aria-label="Send"
            >
              <svg viewBox="0 0 24 24" fill="none" width={16} height={16}>
                <path
                  d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
          <p className="chat-footer-note">Powered by GPT-4o mini · Boopy questions only</p>
        </div>
      )}
    </>
  );
}
