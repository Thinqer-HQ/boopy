"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { supabaseBrowser } from "@/lib/supabase/browser";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = supabaseBrowser();
    const { data, error: err } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    if (data.session) {
      await fetch("/api/bootstrap", {
        method: "POST",
        headers: { Authorization: `Bearer ${data.session.access_token}` },
      });
      router.replace("/");
      router.refresh();
    }
  }

  async function signUp() {
    setError(null);
    setLoading(true);
    const supabase = supabaseBrowser();
    const { data, error: err } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    if (data.session) {
      await fetch("/api/bootstrap", {
        method: "POST",
        headers: { Authorization: `Bearer ${data.session.access_token}` },
      });
      router.replace("/");
      router.refresh();
    } else {
      setError("Check your email to confirm your account, then sign in.");
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 p-8">
      <div>
        <h1 className="text-xl font-semibold text-zinc-900">Sign in to Boopy</h1>
        <p className="mt-1 text-sm text-zinc-600">Use your Supabase email and password.</p>
      </div>
      <form className="flex flex-col gap-3" onSubmit={signIn}>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-zinc-700">Email</span>
          <input
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(ev) => setEmail(ev.target.value)}
            className="rounded-md border border-zinc-300 px-3 py-2 text-zinc-900"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-zinc-700">Password</span>
          <input
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(ev) => setPassword(ev.target.value)}
            className="rounded-md border border-zinc-300 px-3 py-2 text-zinc-900"
          />
        </label>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            Sign in
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => void signUp()}
            className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-900 disabled:opacity-50"
          >
            Sign up
          </button>
        </div>
      </form>
      <p className="text-center text-sm text-zinc-500">
        <Link href="/" className="text-zinc-800 underline">
          Home
        </Link>
      </p>
    </div>
  );
}
