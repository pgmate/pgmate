import { useMemo } from "react";

import type { LLMModel, LLMUsage, LLMMessage } from "../ask.d";
type UsageByModel = Record<LLMModel, LLMUsage>;

export const useUsage = (messages: LLMMessage[]): UsageByModel => {
  const tokens = useMemo(() => {
    return messages.reduce<UsageByModel>((acc, msg) => {
      if (!msg.usage || !msg.model) {
        return acc; // Skip messages without usage or model
      }

      const model = msg.model;

      // Initialize the model group if it doesn't exist
      if (!acc[model]) {
        acc[model] = {
          completion_tokens: 0,
          prompt_tokens: 0,
          total_tokens: 0,
        };
      }

      // Aggregate usage for the current model
      acc[model].completion_tokens += msg.usage.completion_tokens;
      acc[model].prompt_tokens += msg.usage.prompt_tokens;
      acc[model].total_tokens += msg.usage.total_tokens;

      return acc;
    }, {} as UsageByModel);
  }, [messages]);

  return tokens;
};
