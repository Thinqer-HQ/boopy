"use client";

import { useState } from "react";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sent" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      setStatus("error");
      setErrorMessage(error.message);
      return;
    }
    setStatus("sent");
  }

  return (
    <div className="bg-background flex min-h-svh items-center justify-center">
      <div className="border-border bg-card w-full max-w-sm rounded-2xl border p-8 shadow-sm">
        <h1 className="font-heading text-foreground text-2xl font-semibold">Boopy Admin</h1>
        <p className="text-muted-foreground mt-1 text-sm">Sign in with a magic link.</p>

        {status === "sent" ? (
          <p className="text-foreground mt-6 text-sm">Check your email for a sign-in link.</p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@useboopy.com"
              className="border-input bg-background text-foreground w-full rounded-lg border px-3 py-2 text-sm"
            />
            <button
              type="submit"
              className="bg-primary text-primary-foreground w-full rounded-lg px-3 py-2 text-sm font-semibold"
            >
              Send magic link
            </button>
            {status === "error" && <p className="text-destructive text-sm">{errorMessage}</p>}
          </form>
        )}
      </div>
    </div>
  );
}
