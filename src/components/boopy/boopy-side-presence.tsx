"use client";

import { X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import type { BoopyEmotionAsset } from "@/lib/boopy/emotion-state";
import { BoopyLottieMascot } from "@/components/boopy/boopy-lottie-mascot";

type PresenceCopy = {
  title: string;
  body: string;
  emotion: BoopyEmotionAsset;
};

function getPresenceCopy(pathname: string): PresenceCopy {
  if (pathname.startsWith("/subscriptions")) {
    return {
      title: "Subscription check-in",
      body: "Boopy can flag trial endings and renewals before charges hit.",
      emotion: "boopy-sub",
    };
  }
  if (pathname.startsWith("/reports")) {
    return {
      title: "Savings mode",
      body: "Scan recurring spend and trim low-value subscriptions quickly.",
      emotion: "good-yes",
    };
  }
  if (pathname.startsWith("/notifications")) {
    return {
      title: "Reminder flow ready",
      body: "Tune reminders here so renewals stay predictable.",
      emotion: "boopy-good",
    };
  }
  return {
    title: "Boopy on standby",
    body: "Your subscription sidekick stays in the side rail to keep UI clean.",
    emotion: "boopy-hi",
  };
}

export function BoopySidePresence() {
  const pathname = usePathname();
  const [openPopup, setOpenPopup] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const copy = useMemo(() => getPresenceCopy(pathname), [pathname]);

  useEffect(() => {
    const storageKey = "boopy-side-popup-dismissed";
    const wasDismissed = sessionStorage.getItem(storageKey) === "1";
    if (wasDismissed || dismissed) return;

    const showDelay = window.setTimeout(() => setOpenPopup(true), 900);
    const hideDelay = window.setTimeout(() => setOpenPopup(false), 7000);
    return () => {
      window.clearTimeout(showDelay);
      window.clearTimeout(hideDelay);
    };
  }, [dismissed, pathname]);

  function closePopup() {
    setOpenPopup(false);
    setDismissed(true);
    sessionStorage.setItem("boopy-side-popup-dismissed", "1");
  }

  return (
    <>
      <aside className="pointer-events-none fixed top-1/2 left-3 z-30 hidden -translate-y-1/2 xl:flex">
        <div className="bg-background/90 border-border/70 flex w-28 flex-col items-center gap-2 rounded-3xl border px-2 py-3 shadow-[0_16px_36px_rgba(0,0,0,0.08)] backdrop-blur">
          <BoopyLottieMascot
            className="relative h-24 w-24"
            emotion={copy.emotion}
            reducedMotionBehavior="fallback-image"
          />
          <p className="text-muted-foreground text-center text-[11px] leading-4">{copy.title}</p>
        </div>
      </aside>

      {openPopup ? (
        <aside className="pointer-events-auto fixed bottom-5 left-4 z-40 max-w-[280px]">
          <div className="bg-background border-border/80 rounded-2xl border px-3 py-3 shadow-[0_18px_36px_rgba(0,0,0,0.12)]">
            <div className="mb-2 flex items-start justify-between gap-2">
              <p className="text-sm font-semibold">{copy.title}</p>
              <button
                type="button"
                className="text-muted-foreground hover:text-foreground rounded p-1"
                onClick={closePopup}
                aria-label="Dismiss Boopy tip"
              >
                <X className="size-4" />
              </button>
            </div>
            <p className="text-muted-foreground text-xs leading-5">{copy.body}</p>
          </div>
        </aside>
      ) : null}
    </>
  );
}
