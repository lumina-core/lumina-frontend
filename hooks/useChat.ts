"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { historyMessageToMessage } from "@/lib/chat/history";
import { useChatStore } from "@/stores/chatStore";
import { useAuthStore } from "@/stores/authStore";
import type { SSEEvent, ChatSession } from "@/types";

export function useChat() {
  const router = useRouter();
  const {
    messages,
    isStreaming,
    lastUsage,
    currentSession,
    addMessage,
    appendTextToLastAssistant,
    addToolCallToLastAssistant,
    updateToolCallStatus,
    setIsStreaming,
    setLastUsage,
    setCurrentSession,
    setMessages,
    clearMessages,
  } = useChatStore();

  const {
    credits,
    updateCredits,
    isAuthenticated,
    fetchCredits,
    setUser,
  } = useAuthStore();

  // 加载历史会话
  const loadSession = useCallback(
    async (sessionId: string) => {
      try {
        const [session, messagesRes] = await Promise.all([
          api.getChatSession(sessionId),
          api.getChatMessages(sessionId),
        ]);
        
        setCurrentSession(session);
        setMessages(messagesRes.items.map(historyMessageToMessage));
        
        return session;
      } catch (error) {
        console.error("Failed to load session:", error);
        throw error;
      }
    },
    [setCurrentSession, setMessages]
  );

  // 创建新会话
  const createSession = useCallback(
    async (title: string, preview?: string): Promise<ChatSession> => {
      const session = await api.createChatSession(title, preview);
      setCurrentSession(session);
      return session;
    },
    [setCurrentSession]
  );

  // 开始新对话
  const startNewChat = useCallback(() => {
    clearMessages();
  }, [clearMessages]);

  const sendMessage = useCallback(
    async (query: string) => {
      if (
        isStreaming ||
        !query.trim() ||
        !isAuthenticated ||
        !credits?.can_use
      ) {
        return;
      }

      // 如果是新对话，先创建会话
      let session = currentSession;
      if (!session && isAuthenticated) {
        try {
          // 用用户输入的前50个字符作为标题
          const title = query.slice(0, 50) + (query.length > 50 ? "..." : "");
          session = await createSession(title, query.slice(0, 200));
          window.history.replaceState(
            null,
            "",
            `/chat/${encodeURIComponent(session.id)}`,
          );
        } catch (error) {
          console.error("Failed to create session:", error);
          const message = error instanceof Error ? error.message : "会话创建失败";
          addMessage({
            id: crypto.randomUUID(),
            role: "assistant",
            parts: [{ type: "text", content: `暂时无法创建会话：${message}` }],
          });
          return;
        }
      }

      if (!session) return;

      // Add user message
      addMessage({
        id: crypto.randomUUID(),
        role: "user",
        parts: [{ type: "text", content: query }],
      });

      // Add empty assistant message
      addMessage({ id: crypto.randomUUID(), role: "assistant", parts: [] });

      setIsStreaming(true);

      try {
        for await (const event of api.chatStream(query, session.id)) {
          const e = event as SSEEvent;

          switch (e.type) {
            case "token":
              appendTextToLastAssistant(e.content || "");
              break;

            case "tool_start":
              addToolCallToLastAssistant({
                id: e.tool_call_id,
                name: e.name || "",
                input: e.input || {},
                status: "running",
              });
              break;

            case "tool_end":
              updateToolCallStatus(
                e.name || "",
                "completed",
                e.output,
                e.tool_call_id,
              );
              break;

            case "usage":
              setLastUsage({
                input_tokens: e.input_tokens || 0,
                output_tokens: e.output_tokens || 0,
                credits_deducted: e.credits_deducted,
                credits_remaining: e.credits_remaining,
              });
              if (typeof e.credits_remaining === "number") {
                updateCredits(e.credits_remaining);
              }
              break;

            case "error":
              throw new Error(e.error || "未知错误");

            case "done":
              break;
          }
        }
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          setUser(null);
          router.replace("/login");
          return;
        }
        if (error instanceof ApiError && error.status === 402) {
          await fetchCredits();
        }
        const errorMessage = error instanceof Error ? error.message : "发送失败";
        appendTextToLastAssistant(`\n\n抱歉，发生了错误：${errorMessage}`);
      } finally {
        setIsStreaming(false);
      }
    },
    [
      isStreaming,
      currentSession,
      isAuthenticated,
      credits,
      createSession,
      addMessage,
      appendTextToLastAssistant,
      addToolCallToLastAssistant,
      updateToolCallStatus,
      setIsStreaming,
      setLastUsage,
      updateCredits,
      fetchCredits,
      setUser,
      router,
    ]
  );

  return {
    messages,
    isStreaming,
    lastUsage,
    currentSession,
    sendMessage,
    loadSession,
    startNewChat,
    clearMessages,
  };
}
