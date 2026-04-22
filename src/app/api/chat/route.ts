import type { Message } from "ai";
import { convertToCoreMessages, streamText } from "ai";

import { canUseBoopyAssistant } from "@/lib/billing/plan";
import { BOOPY_ASSISTANT_SYSTEM_PROMPT } from "@/lib/boopy-assistant/boopy-system-prompt";
import { createBoopyAssistantTools } from "@/lib/boopy-assistant/create-tools";
import { resolveLlmRouterCandidates } from "@/lib/boopy-assistant/llm-router";
import { selectModelWithPingFallback } from "@/lib/boopy-assistant/select-model-with-fallback";
import { getPrimaryWorkspacePlanForToken } from "@/lib/boopy-assistant/workspace-plan";
import { getUserOrThrow } from "@/lib/auth";
import { log } from "@/lib/log";
import { supabaseForUserAccessToken } from "@/lib/supabase/user-access";

export const maxDuration = 60;

function assistantRequiresOpenAiInProduction(): boolean {
  const strict =
    process.env.ENV_STRICT === "true" ||
    (process.env.NODE_ENV === "production" && process.env.VERCEL_ENV !== "preview");
  return strict;
}

export async function POST(req: Request) {
  const authHeader = req.headers.get("authorization") ?? "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  if (!token) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    await getUserOrThrow(token);
  } catch {
    return new Response("Unauthorized", { status: 401 });
  }

  const planGate = await getPrimaryWorkspacePlanForToken(token);
  if (!planGate.ok) {
    return new Response(planGate.message, { status: planGate.status });
  }
  if (!canUseBoopyAssistant(planGate.plan)) {
    return new Response(
      JSON.stringify({
        error: "pro_required",
        message: "Boopy Assistant (AI actions on your workspace) is included with Boopy Pro.",
        upgradePath: "/settings/billing",
      }),
      { status: 403, headers: { "Content-Type": "application/json; charset=utf-8" } }
    );
  }

  if (assistantRequiresOpenAiInProduction() && !process.env.OPENAI_API_KEY?.trim()) {
    return new Response(
      "Boopy Assistant is configured for production use with OpenAI. Set OPENAI_API_KEY (see .env.example).",
      { status: 500 }
    );
  }

  const resolved = resolveLlmRouterCandidates();
  if (!resolved.ok) {
    return new Response(resolved.message, { status: resolved.status });
  }

  log.info("boopy_llm_router", {
    providerOrder: resolved.providerOrder,
    candidateCount: resolved.candidates.length,
  });

  const picked = await selectModelWithPingFallback(resolved.candidates);
  if (!picked.ok) {
    return new Response(picked.message, { status: 503 });
  }

  const json = (await req.json()) as { messages?: Message[] };
  const raw = json.messages ?? [];
  // Preserve assistant tool-call parts; plain { role, content } mapping breaks maxSteps tool loops.
  const forCore = raw.map((message) => {
    const { id, ...rest } = message;
    void id;
    return rest;
  }) as Array<Omit<Message, "id">>;

  const supabase = supabaseForUserAccessToken(token);
  const boopyTools = createBoopyAssistantTools(supabase);
  const tools = {
    get_workspace_overview: boopyTools.getWorkspaceOverview,
    create_group: boopyTools.createGroup,
    create_subscription: boopyTools.createSubscription,
  };

  const result = streamText({
    model: picked.model,
    messages: convertToCoreMessages(forCore, { tools }),
    system: BOOPY_ASSISTANT_SYSTEM_PROMPT,
    tools,
    maxSteps: 6,
    experimental_activeTools: ["get_workspace_overview", "create_group", "create_subscription"],
  });

  return result.toDataStreamResponse();
}
