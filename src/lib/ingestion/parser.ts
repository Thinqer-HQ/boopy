import { parseWithHeuristics } from "@/lib/ingestion/providers/heuristic";
import type { ParsedSubscriptionCandidate, ParserInput } from "@/lib/ingestion/types";

export type ParserProvider = {
  name: string;
  parse: (input: ParserInput) => Promise<ParsedSubscriptionCandidate>;
};

const heuristicProvider: ParserProvider = {
  name: "heuristic",
  parse: async (input) => parseWithHeuristics(input),
};

export async function parseDocumentCandidate(input: ParserInput) {
  const candidate = await heuristicProvider.parse(input);
  return {
    provider: heuristicProvider.name,
    candidate,
  };
}
