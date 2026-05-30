"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

type BoopyMascotMotionProps = {
  className?: string;
  videoWebmSrc?: string;
  videoMp4Src?: string;
  fallbackSrc?: string;
};

const VIDEO_FALLBACK_TIMEOUT_MS = 2500;

export function BoopyMascotMotion({
  className,
  videoWebmSrc = "/boopy-yay-anim-1.webm",
  videoMp4Src = "/boopy-yay-anim-1.mp4",
  fallbackSrc = "/boopy-mascot-fallback.svg",
}: BoopyMascotMotionProps) {
  const [useFallback, setUseFallback] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (!videoLoaded) setUseFallback(true);
    }, VIDEO_FALLBACK_TIMEOUT_MS);
    return () => window.clearTimeout(timer);
  }, [videoLoaded]);

  const finalFallback = useMemo(
    () => (imageFailed ? "/boopy-mascot-transparent.svg" : fallbackSrc),
    [fallbackSrc, imageFailed]
  );

  return (
    <div className={className}>
      {!useFallback ? (
        <video
          className="size-full object-contain"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster={fallbackSrc}
          onLoadedData={() => {
            setVideoLoaded(true);
            setUseFallback(false);
          }}
          onError={() => setUseFallback(true)}
        >
          <source src={videoWebmSrc} type="video/webm" />
          <source src={videoMp4Src} type="video/mp4" />
        </video>
      ) : (
        <Image
          src={finalFallback}
          alt="Boopy mascot"
          fill
          sizes="(max-width: 768px) 130px, 180px"
          className="object-contain"
          onError={() => setImageFailed(true)}
          priority
        />
      )}
    </div>
  );
}
