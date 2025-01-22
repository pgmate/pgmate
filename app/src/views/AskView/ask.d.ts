export type LLMRole = "system" | "user" | "assistant";
export type LLMModel = "gpt-4o" | "gpt-4o-mini";

export interface LLMMessage {
  id: string;
  role: LLMRole;
  content: string;
}

export type LLMUserMessage = Omit<LLMMessage, "role"> & {
  role: "user";
};

export type LLMAssistantMessage = Omit<LLMMessage, "role"> & {
  role: "assistant";
};
