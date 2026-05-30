export type BoopyEmotionAsset =
  | "boopy-hi"
  | "boopy-sub"
  | "boopy-good"
  | "good-yes"
  | "boopy-no"
  | "boopy-yay";

export type BoopyMascotMedia = {
  imageSrc: string;
  imageAlt: string;
  videoWebmSrc?: string;
  videoMp4Src?: string;
  svgFallbackSrc: string;
};

const BOOPY_ASSET_BASE = "/boopy-assets";
const DEFAULT_SVG_FALLBACK = "/boopy-mascot-transparent.svg";

const EMOTION_MEDIA: Record<BoopyEmotionAsset, BoopyMascotMedia> = {
  "boopy-hi": {
    imageSrc: `${BOOPY_ASSET_BASE}/boopy-hi.png`,
    imageAlt: "Boopy waving hello",
    svgFallbackSrc: DEFAULT_SVG_FALLBACK,
  },
  "boopy-sub": {
    imageSrc: `${BOOPY_ASSET_BASE}/boopy-sub.png`,
    imageAlt: "Boopy warning about an upcoming trial ending",
    svgFallbackSrc: DEFAULT_SVG_FALLBACK,
  },
  "boopy-good": {
    imageSrc: `${BOOPY_ASSET_BASE}/boopy-good.png`,
    imageAlt: "Boopy signaling everything is on track",
    svgFallbackSrc: DEFAULT_SVG_FALLBACK,
  },
  "good-yes": {
    imageSrc: `${BOOPY_ASSET_BASE}/good-yes.png`,
    imageAlt: "Boopy celebrating subscription savings",
    svgFallbackSrc: DEFAULT_SVG_FALLBACK,
  },
  "boopy-no": {
    imageSrc: `${BOOPY_ASSET_BASE}/boopy-no.png`,
    imageAlt: "Boopy concerned about risky subscription status",
    svgFallbackSrc: DEFAULT_SVG_FALLBACK,
  },
  "boopy-yay": {
    imageSrc: `${BOOPY_ASSET_BASE}/boopy-yay.png`,
    imageAlt: "Boopy celebrating success",
    videoWebmSrc: `${BOOPY_ASSET_BASE}/boopy-yay-anim-1.webm`,
    videoMp4Src: `${BOOPY_ASSET_BASE}/boopy-yay-anim-1.mp4`,
    svgFallbackSrc: DEFAULT_SVG_FALLBACK,
  },
};

export function getBoopyMascotMedia(emotion: BoopyEmotionAsset): BoopyMascotMedia {
  return EMOTION_MEDIA[emotion];
}
