"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import type { BoopyEmotionAsset } from "@/lib/boopy/emotion-state";
import { getBoopyMascotMedia } from "@/lib/boopy/mascot-assets";
import { BoopyMascotMotion } from "@/components/boopy/boopy-mascot-motion";

type BoopyLottieMascotProps = {
  className?: string;
  emotion?: BoopyEmotionAsset;
  reducedMotionBehavior?: "fallback-image" | "still-video-poster";
  priority?: boolean;
};

export function BoopyLottieMascot({
  className,
  emotion = "boopy-hi",
  reducedMotionBehavior = "fallback-image",
  priority = false,
}: BoopyLottieMascotProps) {
  const media = useMemo(() => getBoopyMascotMedia(emotion), [emotion]);
  const [status, setStatus] = useState<"loading" | "ready" | "failed">("loading");
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const lottieJsonSrc = media.lottieJsonSrc;
    if (!lottieJsonSrc) {
      setStatus("failed");
      return;
    }

    let cancelled = false;
    let animation: { destroy: () => void } | null = null;

    void (async () => {
      try {
        const [lottieModule, response] = await Promise.all([
          import("lottie-web"),
          fetch(lottieJsonSrc, { cache: "force-cache" }),
        ]);
        if (!response.ok) throw new Error(`Lottie not found: ${lottieJsonSrc}`);
        const animationData = (await response.json()) as object;
        if (cancelled || !containerRef.current) return;

        const lottie = lottieModule.default;
        animation = lottie.loadAnimation({
          container: containerRef.current,
          renderer: "svg",
          loop: true,
          autoplay: true,
          animationData,
          assetsPath: "/boopy-assets/",
          rendererSettings: {
            preserveAspectRatio: "xMidYMid meet",
            progressiveLoad: true,
          },
        });
        setStatus("ready");
      } catch {
        if (!cancelled) setStatus("failed");
      }
    })();

    return () => {
      cancelled = true;
      animation?.destroy();
    };
  }, [media.lottieJsonSrc]);

  if (status !== "ready") {
    return (
      <BoopyMascotMotion
        className={className}
        emotion={emotion}
        priority={priority}
        reducedMotionBehavior={reducedMotionBehavior}
      />
    );
  }

  return (
    <div
      ref={containerRef}
      className={`${className ?? ""} animate-mascot-pop`}
      role="img"
      aria-label={media.imageAlt}
      suppressHydrationWarning
    />
  );
}
