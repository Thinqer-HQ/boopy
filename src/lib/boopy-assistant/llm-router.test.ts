import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

describe("resolveLlmRouterCandidates", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("follows BOOPY_LLM_ROUTER when both API keys are set", async () => {
    vi.stubEnv("BOOPY_LLM_ROUTER", "openai,groq");
    vi.stubEnv("OPENAI_API_KEY", "sk-test-openai");
    vi.stubEnv("GROQ_API_KEY", "gsk-test-groq");
    vi.stubEnv("BOOPY_CHAT_FREE_MODE", "");
    vi.stubEnv("BOOPY_CHAT_PROVIDER", "");
    const { resolveLlmRouterCandidates } = await import("@/lib/boopy-assistant/llm-router");
    const r = resolveLlmRouterCandidates();
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.providerOrder).toEqual(["openai", "groq"]);
      expect(r.candidates[0].label.startsWith("openai:")).toBe(true);
      const groqLabels = r.candidates.filter((c) => c.label.startsWith("groq:"));
      expect(groqLabels.length).toBeGreaterThan(0);
    }
  });

  it("forces Groq only when BOOPY_CHAT_FREE_MODE=1", async () => {
    vi.stubEnv("BOOPY_LLM_ROUTER", "openai,groq");
    vi.stubEnv("BOOPY_CHAT_FREE_MODE", "1");
    vi.stubEnv("OPENAI_API_KEY", "sk-test");
    vi.stubEnv("GROQ_API_KEY", "gsk-test");
    const { resolveLlmRouterCandidates } = await import("@/lib/boopy-assistant/llm-router");
    const r = resolveLlmRouterCandidates();
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.providerOrder).toEqual(["groq"]);
      expect(r.candidates.every((c) => c.label.startsWith("groq:"))).toBe(true);
    }
  });
});
