import type {
  ChatHistoryMessage,
  Message,
  MessagePart,
  ToolCall,
} from "@/types";

type PersistedProcess = {
  version?: number;
  parts?: unknown;
};

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
  if (message.tool_calls) {
    try {
      const payload = JSON.parse(message.tool_calls) as PersistedProcess;
      if (Array.isArray(payload.parts)) {
        const parts = payload.parts.filter(isMessagePart);
        if (parts.length > 0) return parts;
      }
    } catch {
      // Older rows may contain provider-specific JSON. Fall back to content.
    }
  }
  return [{ type: "text", content: message.content }];
}

export function historyMessageToMessage(message: ChatHistoryMessage): Message {
  return {
    id: message.id,
    role: message.role,
    parts: parsePersistedParts(message),
  };
}
