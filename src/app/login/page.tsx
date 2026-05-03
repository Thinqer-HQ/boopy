"use client";

import { BellRing, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { MissingSupabaseConfig } from "@/components/boopy/missing-supabase-config";
import { getPublicAppUrl } from "@/lib/auth-site-url";
import { getSupabaseBrowser, isSupabaseBrowserConfigured } from "@/lib/supabase/browser";
import { cn } from "@/lib/utils";

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
    const supabase = getSupabaseBrowser();
    if (!supabase) {
      setLoading(false);
      setError(
        "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local."
      );
      return;
    }
    const { data, error: err } = await supabase.auth.signInWithPassword({
      email: email.trim(),
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
    const emailTrim = email.trim();
    if (!emailTrim || !password) {
      setError("Enter an email and password to create an account.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    const supabase = getSupabaseBrowser();
    if (!supabase) {
      setLoading(false);
      setError(
        "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local."
      );
      return;
    }
    const { data, error: err } = await supabase.auth.signUp({
      email: emailTrim,
      password,
      options: {
        emailRedirectTo: `${getPublicAppUrl()}/login`,
      },
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
    } else {
      setError("Check your email to confirm your account, then sign in.");
    }
  }

  if (!isSupabaseBrowserConfigured()) {
    return <MissingSupabaseConfig />;
  }

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="bg-muted/40 relative hidden flex-col justify-between border-r p-10 lg:flex">
        <div className="font-heading flex items-center gap-2 text-lg font-semibold">
          <span className="bg-primary text-primary-foreground flex size-9 items-center justify-center rounded-lg">
            <BellRing className="size-5" />
          </span>
          Boopy
        </div>
        <div className="space-y-4">
          <blockquote className="space-y-2">
            <p className="text-foreground text-lg leading-relaxed">
              Never miss a renewal. Track subscriptions per client, get email and push reminders
              before charges hit.
            </p>
          </blockquote>
          <div className="text-muted-foreground flex items-center gap-2 text-sm">
            <Sparkles className="text-primary size-4 shrink-0" />
            Built for agencies and operators
          </div>
        </div>
        <p className="text-muted-foreground text-xs">
          UI components from{" "}
          <a
            href="https://ui.shadcn.com/"
            className="hover:text-foreground underline underline-offset-4"
            target="_blank"
            rel="noreferrer"
          >
            shadcn/ui
          </a>
        </p>
      </div>

      <div className="flex flex-col justify-center gap-6 p-6 md:p-10 lg:p-12">
        <div className="mx-auto w-full max-w-sm space-y-6">
          <div className="flex flex-col space-y-1 text-center lg:text-left">
            <h1 className="font-heading text-2xl font-semibold tracking-tight">Welcome back</h1>
            <p className="text-muted-foreground text-sm">
              Sign in with your Supabase email and password.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Sign in</CardTitle>
              <CardDescription>Enter your credentials to open your dashboard.</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={signIn}>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@company.com"
                    required
                    value={email}
                    onChange={(ev) => setEmail(ev.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(ev) => setPassword(ev.target.value)}
                  />
                </div>

                {error ? (
                  <Alert variant="destructive">
                    <AlertTitle>Something went wrong</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                ) : null}

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Please wait…" : "Sign in"}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <div className="text-muted-foreground flex w-full items-center gap-2 text-xs">
                <Separator className="flex-1" />
                <span>or</span>
                <Separator className="flex-1" />
              </div>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled={loading}
                onClick={() => void signUp()}
              >
                Create an account
              </Button>
            </CardFooter>
          </Card>

          <p className="text-muted-foreground text-center text-xs">
            By continuing you agree to track subscription data responsibly.
          </p>
          <p className="text-muted-foreground text-center text-sm">
            <Link
              href="/"
              className={cn(
                buttonVariants({ variant: "link" }),
                "text-muted-foreground inline-flex h-auto min-h-0 p-0 font-normal"
              )}
            >
              Back to app home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
