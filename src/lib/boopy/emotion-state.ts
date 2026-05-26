export type BoopyEmotionAsset =
  | "boopy-hi"
  | "boopy-sub"
  | "boopy-good"
  | "good-yes"
  | "boopy-no"
  | "boopy-yay";

export type BoopyReactionContext = {
  hasTrialEnding?: boolean;
  hasMissedRenewal?: boolean;
  hasTooManySubscriptions?: boolean;
  inSavingsMode?: boolean;
  savedAmountMonthly?: number;
  everythingOnTrack?: boolean;
  celebrateSuccess?: boolean;
};

/**
 * Centralized mascot reaction mapping.
 * Keep this as the single source of truth for Boopy state selection.
 */
export function getBoopyEmotionState(context: BoopyReactionContext): BoopyEmotionAsset {
  if (context.hasTrialEnding) return "boopy-sub";

  if (context.hasMissedRenewal || context.hasTooManySubscriptions) {
    return "boopy-no";
  }

  if (context.inSavingsMode || (context.savedAmountMonthly ?? 0) > 0) {
    return "good-yes";
  }

  if (context.everythingOnTrack) {
    return context.celebrateSuccess ? "boopy-yay" : "boopy-good";
  }

  return "boopy-hi";
}
