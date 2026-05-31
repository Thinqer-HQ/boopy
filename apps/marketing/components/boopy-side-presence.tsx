"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";

import { BoopyLottieMascot } from "@/components/boopy-lottie-mascot";

export function BoopySidePresence() {
  const [openPopup, setOpenPopup] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const storageKey = "boopy-marketing-popup-dismissed";
    const wasDismissed = sessionStorage.getItem(storageKey) === "1";
    if (wasDismissed || dismissed) return;
    const showDelay = window.setTimeout(() => setOpenPopup(true), 1200);
    const hideDelay = window.setTimeout(() => setOpenPopup(false), 8000);
    return () => {
      window.clearTimeout(showDelay);
      window.clearTimeout(hideDelay);
    };
  }, [dismissed]);

  function closePopup() {
    setOpenPopup(false);
    setDismissed(true);
    sessionStorage.setItem("boopy-marketing-popup-dismissed", "1");
  }

  return (
    <>
      <aside className="pointer-events-none fixed top-1/2 left-3 z-20 hidden -translate-y-1/2 xl:flex">
        <div className="flex w-28 flex-col items-center gap-2 rounded-3xl border border-black/12 bg-white/88 px-2 py-3 shadow-[0_18px_36px_rgba(0,0,0,0.09)] backdrop-blur">
          <BoopyLottieMascot
            className="relative h-24 w-24"
            emotion="boopy-hi"
            reducedMotionBehavior="fallback-image"
          />
          <p className="text-center text-[11px] leading-4 text-neutral-600">Boopy side rail</p>
        </div>
      </aside>

      {openPopup ? (
        <aside className="pointer-events-auto fixed bottom-5 left-4 z-30 max-w-[280px]">
          <div className="rounded-2xl border border-black/14 bg-white px-3 py-3 shadow-[0_18px_34px_rgba(0,0,0,0.12)]">
            <div className="mb-2 flex items-start justify-between gap-2">
              <p className="text-sm font-semibold">Meet Boopy</p>
              <button
                type="button"
                className="rounded p-1 text-neutral-500 hover:text-neutral-900"
                onClick={closePopup}
                aria-label="Dismiss Boopy message"
              >
                <X className="size-4" />
              </button>
            </div>
            <p className="text-sm leading-5 text-neutral-700">
              Boopy lives in whitespace only. You get personality without clutter.
            </p>
          </div>
        </aside>
      ) : null}
    </>
  );
}
