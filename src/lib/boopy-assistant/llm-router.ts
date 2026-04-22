import "server-only";

import { createOpenAI } from "@ai-sdk/openai";

import type { ModelCandidate } from "@/lib/boopy-assistant/select-model-with-fallback";

export type LlmProviderId = "groq" | "openai" | "openai_compat";

export type LlmRouterResolution =
  | { ok: true; candidates: ModelCandidate[]; providerOrder: LlmProviderId[] }
  | { ok: false; status: number; message: string };

const GROQ_BASE = "https://api.groq.com/openai/v1";

function parseCommaList(raw: string | undefined): string[] {
  if (!raw?.trim()) return [];
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function parseGroqModelChain(): string[] | null {
  const parts = parseCommaList(process.env.GROQ_MODEL_CHAIN);
  return parts.length > 0 ? parts : null;
}

function defaultGroqModelIds(): string[] {
  const primary =
    (process.env.GROQ_CHAT_MODEL ?? "llama-3.3-70b-versatile").trim() || "llama-3.3-70b-versatile";
  const pool = [primary, "llama-3.3-70b-versatile", "openai/gpt-oss-20b", "llama-3.1-8b-instant"];
  const seen = new Set<string>();
  const ordered: string[] = [];
  for (const id of pool) {
    if (!id || seen.has(id)) continue;
    seen.add(id);
    ordered.push(id);
  }
  return ordered;
}

function groqCandidates(apiKey: string): ModelCandidate[] {
  const chain = parseGroqModelChain() ?? defaultGroqModelIds();
  const client = createOpenAI({
    baseURL: GROQ_BASE,
    apiKey,
    compatibility: "compatible",
  });
  return chain.map((id) => ({ model: client(id), label: `groq:${id}` }));
}

function openaiCandidates(apiKey: string): ModelCandidate[] {
  const chain = parseCommaList(process.env.OPENAI_CHAT_MODEL_CHAIN);
  const models =
    chain.length > 0
      ? chain
      : [(process.env.OPENAI_CHAT_MODEL ?? "gpt-4o-mini").trim() || "gpt-4o-mini"];
  const client = createOpenAI({ apiKey, compatibility: "strict" });
  return models.map((id) => ({ model: client(id), label: `openai:${id}` }));
}

/** OpenAI-compatible base URL (Ollama, vLLM, LiteLLM, etc.) — must include /v1 if the server expects it. */
function openaiCompatCandidates(): ModelCandidate[] | null {
  const rawBase = process.env.BOOPY_OPENAI_COMPAT_BASE_URL?.trim();
  if (!rawBase) return null;
  const baseURL = rawBase.replace(/\/$/, "");
  const apiKey = process.env.BOOPY_OPENAI_COMPAT_API_KEY?.trim() || "ollama";
  const chain = parseCommaList(process.env.BOOPY_OPENAI_COMPAT_MODEL_CHAIN);
  const models =
    chain.length > 0
      ? chain
      : [(process.env.BOOPY_OPENAI_COMPAT_MODEL ?? "llama3.2").trim() || "llama3.2"];
  const client = createOpenAI({
    baseURL,
    apiKey,
    compatibility: "compatible",
  });
  return models.map((id) => ({ model: client(id), label: `openai_compat:${id}` }));
}

const PROVIDER_ALIASES: Record<string, LlmProviderId> = {
  groq: "groq",
  openai: "openai",
  openai_compat: "openai_compat",
  compat: "openai_compat",
  custom: "openai_compat",
  vps: "openai_compat",
  ollama: "openai_compat",
};

function normalizeProviderToken(token: string): LlmProviderId | null {
  const key = token.trim().toLowerCase();
  return PROVIDER_ALIASES[key] ?? null;
}

function parseRouterEnv(): LlmProviderId[] | null {
  const raw = process.env.BOOPY_LLM_ROUTER?.trim();
  if (!raw) return null;
  const out: LlmProviderId[] = [];
  for (const part of raw.split(",")) {
    const id = normalizeProviderToken(part);
    if (id) out.push(id);
  }
  return out.length > 0 ? out : null;
}

function candidatesForProvider(
  id: LlmProviderId,
  keys: { groq: string | undefined; openai: string | undefined }
): ModelCandidate[] | null {
  if (id === "groq") {
    const k = keys.groq;
    if (!k) return null;
    return groqCandidates(k);
  }
  if (id === "openai") {
    const k = keys.openai;
    if (!k) return null;
    return openaiCandidates(k);
  }
  return openaiCompatCandidates();
}

function defaultProviderOrder(keys: {
  groq: string | undefined;
  openai: string | undefined;
  compat: boolean;
}): LlmProviderId[] {
  const explicit = process.env.BOOPY_CHAT_PROVIDER?.trim().toLowerCase();
  const freeOnly = process.env.BOOPY_CHAT_FREE_MODE?.trim() === "1";

  if (freeOnly) return ["groq"];
  if (explicit === "openai") return ["openai"];
  if (explicit === "groq") return ["groq"];

  const order: LlmProviderId[] = [];
  if (keys.openai) order.push("openai");
  if (keys.groq) order.push("groq");
  if (keys.compat) order.push("openai_compat");

  if (order.length > 0) return order;

  return keys.compat ? ["openai_compat"] : [];
}

/**
 * Builds the ordered list of LLM endpoints (router). Same list is passed to ping + stream.
 *
 * Configure with **`BOOPY_LLM_ROUTER`** — comma-separated provider ids, e.g. `groq,openai` or `openai,groq,openai_compat`.
 * Aliases for OpenAI-compatible hosts: `custom`, `compat`, `vps`, `ollama` → `openai_compat`.
 *
 * Per-provider env:
 * - **groq**: `GROQ_API_KEY`, optional `GROQ_MODEL_CHAIN`, `GROQ_CHAT_MODEL`
 * - **openai**: `OPENAI_API_KEY`, optional `OPENAI_CHAT_MODEL_CHAIN`, `OPENAI_CHAT_MODEL`
 * - **openai_compat**: `BOOPY_OPENAI_COMPAT_BASE_URL`, optional `BOOPY_OPENAI_COMPAT_API_KEY`, `BOOPY_OPENAI_COMPAT_MODEL_CHAIN`, `BOOPY_OPENAI_COMPAT_MODEL`
 *
 * Legacy: `BOOPY_CHAT_PROVIDER`, `BOOPY_CHAT_FREE_MODE` still influence **default** order when `BOOPY_LLM_ROUTER` is unset.
 * Default order when unset is **openai → groq → openai_compat** (skip segments without credentials).
 */
export function resolveLlmRouterCandidates(): LlmRouterResolution {
  const groqKey = process.env.GROQ_API_KEY?.trim();
  const openaiKey = process.env.OPENAI_API_KEY?.trim();
  const compatReady = Boolean(process.env.BOOPY_OPENAI_COMPAT_BASE_URL?.trim());
  const freeOnly = process.env.BOOPY_CHAT_FREE_MODE?.trim() === "1";

  if (freeOnly) {
    if (!groqKey) {
      return {
        ok: false,
        status: 500,
        message:
          "BOOPY_CHAT_FREE_MODE=1 requires GROQ_API_KEY (OpenAI and self-hosted compat are disabled).",
      };
    }
    return { ok: true, candidates: groqCandidates(groqKey), providerOrder: ["groq"] };
  }

  const fromEnv = parseRouterEnv();
  const providerOrder =
    fromEnv ??
    defaultProviderOrder({
      groq: groqKey,
      openai: openaiKey,
      compat: compatReady,
    });

  if (providerOrder.length === 0) {
    return {
      ok: false,
      status: 500,
      message:
        "LLM router: no providers configured. Set GROQ_API_KEY and/or OPENAI_API_KEY, or BOOPY_OPENAI_COMPAT_BASE_URL for a self-hosted OpenAI-compatible API. Optional: BOOPY_LLM_ROUTER=groq,openai,openai_compat",
    };
  }

  const candidates: ModelCandidate[] = [];
  for (const id of providerOrder) {
    const slice = candidatesForProvider(id, { groq: groqKey, openai: openaiKey });
    if (slice?.length) candidates.push(...slice);
  }

  if (candidates.length === 0) {
    const tried = providerOrder.join(", ");
    return {
      ok: false,
      status: 500,
      message: `LLM router: ordered providers [${tried}] have no usable credentials or models. Check env vars for each provider.`,
    };
  }

  return { ok: true, candidates, providerOrder };
}
