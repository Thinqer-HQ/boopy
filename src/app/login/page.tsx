"use client";

import { BellRing, Loader2, Mail, Sparkles } from "lucide-react";
import dynamic from "next/dynamic";
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
import { getHcaptchaSiteKey } from "@/lib/hcaptcha-site-key";
import { getSupabaseBrowser, isSupabaseBrowserConfigured } from "@/lib/supabase/browser";
import { signUpErrorLines } from "@/lib/supabase/sign-up-error-message";
import { cn } from "@/lib/utils";

const HCaptchaLazy = dynamic(() => import("@hcaptcha/react-hcaptcha"), {
  ssr: false,
});

export default function LoginPage() {
  const router = useRouter();
  const hcaptchaSiteKey = getHcaptchaSiteKey();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [signUpSuccessMessage, setSignUpSuccessMessage] = useState<string | null>(null);
  const [pending, setPending] = useState<"sign-in" | "sign-up" | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaMountKey, setCaptchaMountKey] = useState(0);

  function resetHcaptcha() {
    setCaptchaToken(null);
    setCaptchaMountKey((k) => k + 1);
  }

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSignUpSuccessMessage(null);
    if (hcaptchaSiteKey && !captchaToken) {
      setError("Complete the security check before signing in.");
      return;
    }
    setPending("sign-in");
    const supabase = getSupabaseBrowser();
    if (!supabase) {
      setPending(null);
      setError(
        "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local."
      );
      return;
    }
    try {
      const { data, error: err } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
        options: hcaptchaSiteKey && captchaToken ? { captchaToken } : undefined,
      });
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
    } finally {
      setPending(null);
      if (hcaptchaSiteKey) resetHcaptcha();
    }
  }

  async function signUp() {
    setError(null);
    setSignUpSuccessMessage(null);
    const emailTrim = email.trim();
    if (!emailTrim || !password) {
      setError("Enter an email and password to create an account.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (hcaptchaSiteKey && !captchaToken) {
      setError("Complete the security check before creating an account.");
      return;
    }
    setPending("sign-up");
    const supabase = getSupabaseBrowser();
    if (!supabase) {
      setPending(null);
      setError(
        "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local."
      );
      return;
    }
    try {
      const { data, error: err } = await supabase.auth.signUp({
        email: emailTrim,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/login`,
          ...(hcaptchaSiteKey && captchaToken ? { captchaToken } : {}),
        },
      });
      if (err) {
        setSignUpSuccessMessage(null);
        setError(signUpErrorLines(err.message).join("\n"));
        return;
      }
      if (data.session) {
        setSignUpSuccessMessage(null);
        await fetch("/api/bootstrap", {
          method: "POST",
          headers: { Authorization: `Bearer ${data.session.access_token}` },
        });
        router.replace("/");
        router.refresh();
      } else {
        setError(null);
        setSignUpSuccessMessage("Check your email to confirm your account, then sign in.");
      }
    } finally {
      setPending(null);
      if (hcaptchaSiteKey) resetHcaptcha();
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
      </div>

      <div className="flex flex-col justify-center gap-6 p-6 md:p-10 lg:p-12">
        <div className="mx-auto w-full max-w-sm space-y-6">
          <div className="flex flex-col space-y-1 text-center lg:text-left">
            <h1 className="font-heading text-2xl font-semibold tracking-tight">Welcome back</h1>
            <p className="text-muted-foreground text-sm">
              Sign in with your Boopy email and password.
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

                {hcaptchaSiteKey ? (
                  <div className="space-y-2">
                    <Label className="text-muted-foreground text-xs">Security check</Label>
                    <HCaptchaLazy
                      key={captchaMountKey}
                      sitekey={hcaptchaSiteKey}
                      size="compact"
                      sentry={false}
                      theme="light"
                      onVerify={(token) => setCaptchaToken(token)}
                      onExpire={() => setCaptchaToken(null)}
                      onError={() => {
                        setCaptchaToken(null);
                        setSignUpSuccessMessage(null);
                        setError("Security check failed to load. Refresh the page and try again.");
                      }}
                    />
                  </div>
                ) : null}

                {signUpSuccessMessage ? (
                  <Alert
                    variant="default"
                    className="border-emerald-200 bg-emerald-50/90 text-emerald-950 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-50 [&_[data-slot=alert-description]]:text-emerald-900/90 dark:[&_[data-slot=alert-description]]:text-emerald-100/90"
                  >
                    <Mail className="size-4 shrink-0 text-emerald-700 dark:text-emerald-300" />
                    <AlertTitle>Confirm your email</AlertTitle>
                    <AlertDescription>{signUpSuccessMessage}</AlertDescription>
                  </Alert>
                ) : null}

                {error ? (
                  <Alert variant="destructive">
                    <AlertTitle>Something went wrong</AlertTitle>
                    <AlertDescription className="whitespace-pre-line">{error}</AlertDescription>
                  </Alert>
                ) : null}

                <Button
                  type="submit"
                  className="w-full gap-2"
                  disabled={pending !== null || Boolean(hcaptchaSiteKey && !captchaToken)}
                  aria-busy={pending === "sign-in"}
                >
                  {pending === "sign-in" ? (
                    <>
                      <Loader2 className="size-4 animate-spin" aria-hidden />
                      Signing in…
                    </>
                  ) : (
                    "Sign in"
                  )}
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
                className="w-full gap-2"
                disabled={pending !== null || Boolean(hcaptchaSiteKey && !captchaToken)}
                aria-busy={pending === "sign-up"}
                onClick={() => void signUp()}
              >
                {pending === "sign-up" ? (
                  <>
                    <Loader2 className="size-4 animate-spin" aria-hidden />
                    Creating account…
                  </>
                ) : (
                  "Create an account"
                )}
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
