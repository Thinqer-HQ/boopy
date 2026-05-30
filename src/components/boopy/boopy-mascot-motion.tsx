"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

type BoopyMascotMotionProps = {
  className?: string;
  videoWebmSrc?: string;
  videoMp4Src?: string;
  imageSrc?: string;
  imageAlt?: string;
};

const VIDEO_FALLBACK_TIMEOUT_MS = 2500;

export function BoopyMascotMotion({
  className,
  videoWebmSrc = "/boopy-assets/boopy-yay-anim-1.webm",
  videoMp4Src = "/boopy-assets/boopy-yay-anim-1.mp4",
  imageSrc = "/boopy-assets/boopy-yay.png",
  imageAlt = "Boopy mascot cheering",
}: BoopyMascotMotionProps) {
  const [useImageFallback, setUseImageFallback] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (!videoLoaded) setUseImageFallback(true);
    }, VIDEO_FALLBACK_TIMEOUT_MS);
    return () => window.clearTimeout(timer);
  }, [videoLoaded]);

  const finalFallbackSrc = useMemo(() => {
    if (!imageFailed) return imageSrc;
    return "/boopy-mascot-transparent.svg";
  }, [imageFailed, imageSrc]);

  return (
    <div className={className}>
      {!useImageFallback ? (
        <video
          className="size-full object-contain"
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          poster={imageSrc}
          onLoadedData={() => {
            setVideoLoaded(true);
            setUseImageFallback(false);
          }}
          onError={() => setUseImageFallback(true)}
        >
          <source src={videoWebmSrc} type="video/webm" />
          <source src={videoMp4Src} type="video/mp4" />
        </video>
      ) : (
        <Image
          src={finalFallbackSrc}
          alt={imageAlt}
          fill
          sizes="(max-width: 768px) 160px, 220px"
          className="object-contain"
          onError={() => setImageFailed(true)}
          priority
        />
      )}
    </div>
  );
}
