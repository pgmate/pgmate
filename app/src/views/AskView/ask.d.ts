export type LLMRole = "system" | "user" | "assistant";
export type LLMModel = "gpt-4o" | "gpt-4o-mini";

interface LLMUsage {
  completion_tokens: number;
  prompt_tokens: number;
  total_tokens: number;
}

export interface LLMMessage {
  id: string;
  role: LLMRole;
  content: string;
  usage?: LLMUsage;
}

export type LLMUserMessage = Omit<LLMMessage, "role"> & {
  role: "user";
};

export type LLMAssistantMessage = Omit<LLMMessage, "role"> & {
  role: "assistant";
};
