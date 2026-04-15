import Stripe from "stripe";

import { getEnv } from "@/lib/env";

let cachedStripe: Stripe | null = null;

export function getStripe() {
  const env = getEnv();
  if (!env.STRIPE_SECRET_KEY) {
    throw new Error("Missing STRIPE_SECRET_KEY");
  }
  if (!cachedStripe) {
    cachedStripe = new Stripe(env.STRIPE_SECRET_KEY, {
      apiVersion: "2026-03-25.dahlia",
    });
  }
  return cachedStripe;
}
