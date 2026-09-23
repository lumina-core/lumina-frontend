import type { ChatHistoryMessage, ChatMessageListResponse } from "@/types";
import {
  parseOriginJson,
  requestLuminaOrigin,
} from "@/lib/server/lumina-origin";
import { LuminaControlError } from "@/lib/server/lumina-control";

function detail(payload: unknown, fallback: string) {
  if (
    typeof payload === "object" &&
    payload !== null &&
    "detail" in payload &&
    typeof payload.detail === "string"
  ) {
    return payload.detail;
  }
  return fallback;
}

async function historyJson<T>(
  sessionToken: string,
  path: string,
  init: { method?: "GET" | "POST"; body?: object } = {},
): Promise<T> {
  const response = await requestLuminaOrigin(path, {
    method: init.method ?? "GET",
    body: init.body ? JSON.stringify(init.body) : undefined,
    headers: { Authorization: `Bearer ${sessionToken}` },
    // Message appends are not safely repeatable without a message idempotency
    // key, so a lost response must not create a duplicate row.
    retry: init.method !== "POST",
  });
  const payload = parseOriginJson(response);
  if (response.status < 200 || response.status >= 300) {
    throw new LuminaControlError(
      detail(payload, `会话服务返回 ${response.status}`),
      response.status,
    );
  }
  return payload as T;
}

export function loadPersistedMessages(
  sessionToken: string,
  sessionId: string,
) {
  return historyJson<ChatMessageListResponse>(
    sessionToken,
    `/lumina/history/${encodeURIComponent(sessionId)}/messages`,
  );
}

export function appendPersistedMessage(
  sessionToken: string,
  sessionId: string,
  role: "user" | "assistant",
  content: string,
  toolCalls?: string,
) {
  return historyJson<ChatHistoryMessage>(
    sessionToken,
    `/lumina/history/${encodeURIComponent(sessionId)}/messages`,
    {
      method: "POST",
      body: { role, content, tool_calls: toolCalls ?? null },
    },
  );
}
