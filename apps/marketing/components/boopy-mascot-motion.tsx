"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

import type { BoopyEmotionAsset } from "@/lib/boopy-mascot-assets";
import { getBoopyMascotMedia } from "@/lib/boopy-mascot-assets";

type BoopyMotionVariant = "hero" | "standard" | "compact";
type ReducedMotionBehavior = "fallback-image" | "still-video-poster";

type BoopyMascotMotionProps = {
  className?: string;
  emotion?: BoopyEmotionAsset;
  variant?: BoopyMotionVariant;
  size?: number;
  priority?: boolean;
  reducedMotionBehavior?: ReducedMotionBehavior;
  videoWebmSrc?: string;
  videoMp4Src?: string;
  imageSrc?: string;
  imageAlt?: string;
  svgFallbackSrc?: string;
};

const VIDEO_FALLBACK_TIMEOUT_MS = 2500;

export function BoopyMascotMotion({
  className,
  emotion = "boopy-yay",
  variant = "standard",
  size,
  priority = false,
  reducedMotionBehavior = "fallback-image",
  videoWebmSrc,
  videoMp4Src,
  imageSrc,
  imageAlt,
  svgFallbackSrc,
}: BoopyMascotMotionProps) {
  const media = useMemo(() => getBoopyMascotMedia(emotion), [emotion]);
  const resolvedImageSrc = imageSrc ?? media.imageSrc;
  const resolvedImageAlt = imageAlt ?? media.imageAlt;
  const resolvedWebm = videoWebmSrc ?? media.videoWebmSrc;
  const resolvedMp4 = videoMp4Src ?? media.videoMp4Src;
  const resolvedSvgFallback = svgFallbackSrc ?? media.svgFallbackSrc;
  const [useFallback, setUseFallback] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const shouldForceFallback =
    (!resolvedWebm && !resolvedMp4) ||
    (prefersReducedMotion && reducedMotionBehavior === "fallback-image");

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setPrefersReducedMotion(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (shouldForceFallback) {
      return;
    }
    const timer = window.setTimeout(() => {
      if (!videoLoaded) setUseFallback(true);
    }, VIDEO_FALLBACK_TIMEOUT_MS);
    return () => window.clearTimeout(timer);
  }, [shouldForceFallback, videoLoaded]);

  const finalFallback = useMemo(
    () => (imageFailed ? resolvedSvgFallback : resolvedImageSrc),
    [imageFailed, resolvedImageSrc, resolvedSvgFallback]
  );

  const resolvedSizes =
    size !== undefined
      ? `${size}px`
      : variant === "hero"
        ? "(max-width: 768px) 190px, 280px"
        : variant === "compact"
          ? "(max-width: 768px) 72px, 96px"
          : "(max-width: 768px) 130px, 180px";

  return (
    <div className={className}>
      {!shouldForceFallback && !useFallback ? (
        <video
          className="size-full object-contain"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster={resolvedImageSrc}
          onLoadedData={() => {
            setVideoLoaded(true);
            setUseFallback(false);
          }}
          onError={() => setUseFallback(true)}
        >
          {resolvedWebm ? <source src={resolvedWebm} type="video/webm" /> : null}
          {resolvedMp4 ? <source src={resolvedMp4} type="video/mp4" /> : null}
        </video>
      ) : (
        <Image
          src={finalFallback}
          alt={resolvedImageAlt}
          fill
          sizes={resolvedSizes}
          className="object-contain"
          onError={() => setImageFailed(true)}
          priority={priority}
        />
      )}
    </div>
  );
}
