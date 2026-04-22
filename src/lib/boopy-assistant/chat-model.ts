import "server-only";

/**
 * @deprecated Import from `@/lib/boopy-assistant/llm-router` instead (`resolveLlmRouterCandidates`).
 * Kept so existing imports keep working.
 */
export { resolveLlmRouterCandidates as resolveBoopyChatModels } from "@/lib/boopy-assistant/llm-router";
export type { LlmRouterResolution as BoopyChatModelsResolution } from "@/lib/boopy-assistant/llm-router";
