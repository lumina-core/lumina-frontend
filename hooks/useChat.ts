"use client";

import { useCallback } from "react";
import { api } from "@/lib/api";
import { useChatStore } from "@/stores/chatStore";
import { useAuthStore } from "@/stores/authStore";
import type { SSEEvent } from "@/types";

export function useChat() {
  const {
    messages,
    isStreaming,
    currentToolCall,
    lastUsage,
    addMessage,
    updateLastAssistantMessage,
    setToolCall,
    updateToolCallStatus,
    setIsStreaming,
    setLastUsage,
    clearMessages,
  } = useChatStore();

  const { updateCredits } = useAuthStore();

  const sendMessage = useCallback(
    async (query: string) => {
      if (isStreaming || !query.trim()) return;

      // Add user message
      addMessage({ role: "user", content: query });

      // Add empty assistant message
      addMessage({ role: "assistant", content: "" });

      setIsStreaming(true);
      let assistantContent = "";

      try {
        const history = messages.map((m) => ({
          role: m.role,
          content: m.content,
        }));

        for await (const event of api.chatStream(query, history)) {
          const e = event as SSEEvent;

          switch (e.type) {
            case "token":
              assistantContent += e.content || "";
              updateLastAssistantMessage(assistantContent);
              break;

            case "tool_start":
              setToolCall({
                name: e.name || "",
                input: e.input || {},
                status: "running",
              });
              break;

            case "tool_end":
              updateToolCallStatus("completed", e.output);
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
        updateLastAssistantMessage(`抱歉，发生了错误：${errorMessage}`);
      } finally {
        setIsStreaming(false);
        setToolCall(null);
      }
    },
    [
      messages,
      isStreaming,
      addMessage,
      updateLastAssistantMessage,
      setToolCall,
      updateToolCallStatus,
      setIsStreaming,
      setLastUsage,
      updateCredits,
    ]
  );

  return {
    messages,
    isStreaming,
    currentToolCall,
    lastUsage,
    sendMessage,
    clearMessages,
  };
}
