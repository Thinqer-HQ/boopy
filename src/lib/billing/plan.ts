export type WorkspacePlan = "free" | "pro";

export type PlanCapabilities = {
  maxClients: number;
  maxSubscriptions: number;
  pushEnabled: boolean;
};

const CAPABILITIES: Record<WorkspacePlan, PlanCapabilities> = {
  free: {
    maxClients: 3,
    maxSubscriptions: 30,
    pushEnabled: false,
  },
  pro: {
    maxClients: 100000,
    maxSubscriptions: 100000,
    pushEnabled: true,
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
