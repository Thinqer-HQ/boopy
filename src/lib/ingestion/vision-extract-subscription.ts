import { createOpenAI } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";

import { log } from "@/lib/log";

import { normalizeExtractedSubscriptionFields } from "@/lib/ingestion/normalize-extracted-subscription";
import type { ExtractSubscriptionFromFileResult } from "@/lib/ingestion/subscription-extract-types";

const visionSchema = z.object({
  vendorName: z.string().nullable().optional().describe("Company or product being billed"),
  amount: z.number().nullable().optional().describe("Amount per billing period, not prorated"),
  currency: z
    .string()
    .nullable()
    .optional()
    .describe("ISO 4217 code e.g. USD, EUR — null if unknown"),
  cadence: z
    .enum(["monthly", "yearly", "quarterly", "custom"])
    .nullable()
    .optional()
    .describe("Billing interval inferred from the document"),
  renewalDate: z
    .string()
    .nullable()
    .optional()
    .describe("Next charge or period end as YYYY-MM-DD in UTC sense if shown; null if unclear"),
  startDate: z.string().nullable().optional().describe("Service start if stated, YYYY-MM-DD"),
  endDate: z.string().nullable().optional().describe("Commitment or cancel-by date if stated"),
  category: z.string().nullable().optional().describe("Short category e.g. Software, Hosting"),
  notes: z.string().nullable().optional().describe("One line of extra context; null if none"),
  confidence: z
    .number()
    .min(0)
    .max(1)
    .nullable()
    .optional()
    .describe("Your confidence 0-1 in the key fields (vendor, amount, renewal)"),
});

export async function extractSubscriptionWithVision(args: {
  dataUrl: string;
  filename: string;
}): Promise<ExtractSubscriptionFromFileResult> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  const modelId =
    (process.env.BOOPY_VISION_MODEL ?? process.env.OPENAI_CHAT_MODEL ?? "gpt-4o-mini").trim() ||
    "gpt-4o-mini";
  const openai = createOpenAI({ apiKey });

  try {
    const { object: rawObject } = await generateObject({
      model: openai(modelId),
      schema: visionSchema,
      messages: [
        {
          role: "system",
          content:
            "You extract subscription or invoice billing fields for a personal finance app. " +
            "Return null for any field you cannot justify from the image. " +
            "Dates must be YYYY-MM-DD when you include them. " +
            "Amount is the recurring charge for one period (not tax breakdown unless it's the total due). " +
            "If multiple subscriptions appear, describe only the primary or first complete one in notes and still fill vendor/amount for the clearest line.",
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Filename hint: ${args.filename}. Extract subscription fields from this document.`,
            },
            { type: "image", image: args.dataUrl },
          ],
        },
      ],
    });

    const object = rawObject as z.infer<typeof visionSchema>;

    const fields = normalizeExtractedSubscriptionFields({
      vendorName: object.vendorName ?? null,
      amount: object.amount ?? null,
      currency: object.currency ?? null,
      cadence: object.cadence ?? null,
      renewalDate: object.renewalDate ?? null,
      startDate: object.startDate ?? null,
      endDate: object.endDate ?? null,
      category: object.category ?? null,
      notes: object.notes ?? null,
    });

    const c = object.confidence;
    const confidence =
      typeof c === "number" && Number.isFinite(c) ? Math.min(0.95, Math.max(0.35, c)) : 0.72;

    const hints: string[] = [];
    if (!fields.vendorName && !fields.amount) {
      hints.push("Could not clearly read vendor or amount — check the image or try a PDF export.");
    }
    if (!fields.renewalDate) {
      hints.push("Renewal date was not found — set it manually from your billing portal.");
    }

    return { source: "vision", confidence, fields, hints };
  } catch (err) {
    log.warn("vision_subscription_extract_failed", {
      filename: args.filename,
      error: err instanceof Error ? err.message : "unknown",
    });
    throw err instanceof Error ? err : new Error("Vision extraction failed");
  }
}
