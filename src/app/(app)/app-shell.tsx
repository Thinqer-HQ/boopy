"use client";

import { useRouter } from "next/navigation";
import { type ReactNode, useEffect, useRef, useState } from "react";

import { supabaseBrowser } from "@/lib/supabase/browser";

export function AppShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const bootstrapped = useRef(false);

  useEffect(() => {
    const supabase = supabaseBrowser();

    void (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.replace("/login");
        return;
      }

      if (!bootstrapped.current) {
        bootstrapped.current = true;
        const res = await fetch("/api/bootstrap", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });
        if (!res.ok) {
          bootstrapped.current = false;
        }
      }

      setReady(true);
    })();
  }, [router]);

  if (!ready) {
    return (
      <div className="flex flex-1 items-center justify-center p-8 text-sm text-zinc-600">
        Loading…
      </div>
    );
  }

  return <>{children}</>;
}
