export type WorkspacePlan = "free" | "pro";

export type PlanCapabilities = {
  maxClients: number;
  maxSubscriptions: number;
  pushEnabled: boolean;
  maxDocumentBatchUpload: number;
  /** Pro: AI assistant with tool access to the workspace (Vercel AI SDK + OpenAI in production). */
  boopyAssistant: boolean;
};

const CAPABILITIES: Record<WorkspacePlan, PlanCapabilities> = {
  free: {
    maxClients: 3,
    maxSubscriptions: 30,
    pushEnabled: false,
    maxDocumentBatchUpload: 1,
    boopyAssistant: false,
  },
  pro: {
    maxClients: 100000,
    maxSubscriptions: 100000,
    pushEnabled: true,
    maxDocumentBatchUpload: 50,
    boopyAssistant: true,
  },
};

export function resolvePlan(plan: string | null | undefined): WorkspacePlan {
  return plan === "pro" ? "pro" : "free";
}

export function getPlanCapabilities(plan: WorkspacePlan): PlanCapabilities {
  return CAPABILITIES[plan];
}

export function canCreateClient(plan: WorkspacePlan, currentClientCount: number): boolean {
  return currentClientCount < getPlanCapabilities(plan).maxClients;
}

export function canCreateSubscription(
  plan: WorkspacePlan,
  currentSubscriptionCount: number
): boolean {
  return currentSubscriptionCount < getPlanCapabilities(plan).maxSubscriptions;
}

export function canUseBoopyAssistant(plan: WorkspacePlan): boolean {
  return getPlanCapabilities(plan).boopyAssistant;
}
