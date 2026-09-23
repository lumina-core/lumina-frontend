import type {
  ChatHistoryMessage,
  ChatUsage,
  Message,
  MessagePart,
  ToolCall,
} from "@/types";

type PersistedProcess = {
  version?: number;
  parts?: unknown;
  usage?: unknown;
};

function parsedProcess(message: ChatHistoryMessage): PersistedProcess | null {
  if (!message.tool_calls) return null;
  try {
    return JSON.parse(message.tool_calls) as PersistedProcess;
  } catch {
    return null;
  }
}

function isToolCall(value: unknown): value is ToolCall {
  if (typeof value !== "object" || value === null) return false;
  const toolCall = value as Partial<ToolCall>;
  return (
    typeof toolCall.id === "string" &&
    typeof toolCall.name === "string" &&
    typeof toolCall.input === "object" &&
    toolCall.input !== null &&
    ["pending", "running", "completed"].includes(toolCall.status ?? "")
  );
}

function isMessagePart(value: unknown): value is MessagePart {
  if (typeof value !== "object" || value === null || !("type" in value)) {
    return false;
  }
  if (value.type === "text") {
    return "content" in value && typeof value.content === "string";
  }
  return (
    value.type === "tool_call" &&
    "toolCall" in value &&
    isToolCall(value.toolCall)
  );
}

export function parsePersistedParts(message: ChatHistoryMessage): MessagePart[] {
  const payload = parsedProcess(message);
  if (Array.isArray(payload?.parts)) {
    const parts = payload.parts.filter(isMessagePart);
    if (parts.length > 0) return parts;
  }
  return [{ type: "text", content: message.content }];
}

export function parsePersistedUsage(
  message: ChatHistoryMessage | undefined,
): ChatUsage | null {
  if (!message) return null;
  const usage = parsedProcess(message)?.usage;
  if (typeof usage !== "object" || usage === null) return null;
  const value = usage as Partial<ChatUsage>;
  if (
    typeof value.input_tokens !== "number" ||
    typeof value.output_tokens !== "number"
  ) {
    return null;
  }
  return {
    input_tokens: value.input_tokens,
    output_tokens: value.output_tokens,
    ...(typeof value.credits_deducted === "number"
      ? { credits_deducted: value.credits_deducted }
      : {}),
    ...(typeof value.credits_remaining === "number"
      ? { credits_remaining: value.credits_remaining }
      : {}),
  };
}

export function historyMessageToMessage(message: ChatHistoryMessage): Message {
  return {
    id: message.id,
    role: message.role,
    parts: parsePersistedParts(message),
  };
}
