import "server-only";

import type { LanguageModelV1 } from "@ai-sdk/provider";
import { generateText } from "ai";

import { log } from "@/lib/log";

export type ModelCandidate = { model: LanguageModelV1; label: string };

/**
 * Picks the first model in the chain that accepts a minimal completion (handles
 * Groq model outages / deprecations / transient errors). Skipped when only one candidate.
 */
export async function selectModelWithPingFallback(
  candidates: ModelCandidate[]
): Promise<{ ok: true; model: LanguageModelV1; label: string } | { ok: false; message: string }> {
  if (candidates.length === 0) {
    return { ok: false, message: "No chat models configured." };
  }

  if (candidates.length === 1) {
    return { ok: true, model: candidates[0].model, label: candidates[0].label };
  }

  const skipPing = process.env.BOOPY_CHAT_SKIP_MODEL_PING?.trim() === "1";
  if (skipPing) {
    return { ok: true, model: candidates[0].model, label: candidates[0].label };
  }

  const errors: string[] = [];
  for (const c of candidates) {
    try {
      await generateText({
        model: c.model,
        maxSteps: 1,
        maxTokens: 8,
        messages: [{ role: "user", content: "0" }],
        abortSignal: AbortSignal.timeout(7000),
      });
      log.info("boopy_chat_model_selected", { label: c.label });
      return { ok: true, model: c.model, label: c.label };
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      errors.push(`${c.label}: ${msg}`);
      log.warn("boopy_chat_model_ping_failed", { label: c.label, error: msg });
    }
  }

  return {
    ok: false,
    message: `All configured chat models failed readiness check: ${errors.join(" | ")}`,
  };
}
