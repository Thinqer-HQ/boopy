import { describe, expect, it } from "vitest";

import { getBoopyEmotionState } from "@/lib/boopy/emotion-state";

describe("getBoopyEmotionState", () => {
  it("defaults to boopy-hi", () => {
    expect(getBoopyEmotionState({})).toBe("boopy-hi");
  });

  it("uses boopy-sub when trial is ending", () => {
    expect(getBoopyEmotionState({ hasTrialEnding: true })).toBe("boopy-sub");
  });

  it("uses boopy-no for missed renewals or too many subs", () => {
    expect(getBoopyEmotionState({ hasMissedRenewal: true })).toBe("boopy-no");
    expect(getBoopyEmotionState({ hasTooManySubscriptions: true })).toBe("boopy-no");
  });

  it("uses good-yes for savings mode or savings amount", () => {
    expect(getBoopyEmotionState({ inSavingsMode: true })).toBe("good-yes");
    expect(getBoopyEmotionState({ savedAmountMonthly: 1 })).toBe("good-yes");
  });

  it("uses boopy-good for on-track state", () => {
    expect(getBoopyEmotionState({ everythingOnTrack: true })).toBe("boopy-good");
  });

  it("uses boopy-yay for celebratory on-track state", () => {
    expect(getBoopyEmotionState({ everythingOnTrack: true, celebrateSuccess: true })).toBe(
      "boopy-yay"
    );
  });

  it("applies priority: trial ending > missed > savings > on-track", () => {
    expect(
      getBoopyEmotionState({
        hasTrialEnding: true,
        hasMissedRenewal: true,
        inSavingsMode: true,
        everythingOnTrack: true,
        celebrateSuccess: true,
      })
    ).toBe("boopy-sub");
  });
});
