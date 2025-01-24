import { useMemo } from "react";
import type { LLMModel, LLMUsage } from "../ask.d";

type UsageByModel = Record<LLMModel, LLMUsage>;

interface Pricing {
  inputPerMillion: number;
  outputPerMillion: number;
}

const pricing: Record<LLMModel, Pricing> = {
  "gpt-4o-mini": { inputPerMillion: 0.15, outputPerMillion: 0.6 },
  "gpt-4o": { inputPerMillion: 2.5, outputPerMillion: 10.0 },
};

const calculateCost = (model: LLMModel, usage: LLMUsage): number => {
  const modelPricing = pricing[model];
  const inputTokens = usage.prompt_tokens;
  const outputTokens = usage.completion_tokens;

  const inputCost = (inputTokens / 1_000_000) * modelPricing.inputPerMillion;
  const outputCost = (outputTokens / 1_000_000) * modelPricing.outputPerMillion;

  return inputCost + outputCost;
};

const roundToTwoDecimals = (num: number): number => {
  return Math.round((num + Number.EPSILON) * 100) / 100;
};

export const useEstimate = (tokens: UsageByModel) => {
  return useMemo(() => {
    const modelEstimates = Object.entries(tokens).reduce(
      (acc, [model, usage]) => {
        const total = calculateCost(model as LLMModel, usage);
        acc[model as LLMModel] = {
          total,
          pretty: roundToTwoDecimals(total),
        };
        return acc;
      },
      {} as Record<LLMModel, { total: number; pretty: number }>
    );

    const totalCost = Object.values(modelEstimates).reduce(
      (sum, { total }) => sum + total,
      0
    );

    return {
      total: totalCost,
      pretty: roundToTwoDecimals(totalCost),
      models: modelEstimates,
    };
  }, [tokens]);
};
