"use client";

import { useCallback } from "react";
import { api } from "@/lib/api";
import { useChatStore } from "@/stores/chatStore";
import { useAuthStore } from "@/stores/authStore";
import type { SSEEvent, Message } from "@/types";

export function useChat() {
  const {
    messages,
    isStreaming,
    lastUsage,
    addMessage,
    appendTextToLastAssistant,
    addToolCallToLastAssistant,
    updateToolCallStatus,
    setIsStreaming,
    setLastUsage,
    clearMessages,
  } = useChatStore();

  const { updateCredits } = useAuthStore();

  const getHistoryContent = (msgs: Message[]) => {
    return msgs.map((m) => {
      const textContent = m.parts
        .filter((p) => p.type === "text")
        .map((p) => (p as { type: "text"; content: string }).content)
        .join("");
      return { role: m.role, content: textContent };
    });
  };

  const sendMessage = useCallback(
    async (query: string) => {
      if (isStreaming || !query.trim()) return;

      // Add user message
      addMessage({ role: "user", parts: [{ type: "text", content: query }] });

      // Add empty assistant message
      addMessage({ role: "assistant", parts: [] });

      setIsStreaming(true);

      try {
        const history = getHistoryContent(messages);

        for await (const event of api.chatStream(query, history)) {
          const e = event as SSEEvent;

          switch (e.type) {
            case "token":
              appendTextToLastAssistant(e.content || "");
              break;

            case "tool_start":
              addToolCallToLastAssistant({
                name: e.name || "",
                input: e.input || {},
                status: "running",
              });
              break;

            case "tool_end":
              updateToolCallStatus(e.name || "", "completed", e.output);
              break;

            case "usage":
              setLastUsage({
                input_tokens: e.input_tokens || 0,
                output_tokens: e.output_tokens || 0,
                credits_deducted: e.credits_deducted || 0,
                credits_remaining: e.credits_remaining || 0,
              });
              updateCredits(e.credits_remaining || 0);
              break;

            case "error":
              throw new Error(e.error || "未知错误");

            case "done":
              break;
          }
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "发送失败";
        appendTextToLastAssistant(`抱歉，发生了错误：${errorMessage}`);
      } finally {
        setIsStreaming(false);
      }
    },
    [
      messages,
      isStreaming,
      addMessage,
      appendTextToLastAssistant,
      addToolCallToLastAssistant,
      updateToolCallStatus,
      setIsStreaming,
      setLastUsage,
      updateCredits,
    ]
  );

  return {
    messages,
    isStreaming,
    lastUsage,
    sendMessage,
    clearMessages,
  };
}
