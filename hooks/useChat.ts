"use client";

import { useCallback } from "react";
import { api } from "@/lib/api";
import { useChatStore } from "@/stores/chatStore";
import { useAuthStore } from "@/stores/authStore";
import type { SSEEvent, Message, ChatSession, ChatHistoryMessage } from "@/types";

export function useChat() {
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



  // 将历史消息转换为前端 Message 格式
  const convertHistoryMessages = (historyMessages: ChatHistoryMessage[]): Message[] => {
    return historyMessages.map((m) => ({
      role: m.role as "user" | "assistant",
      parts: [{ type: "text" as const, content: m.content }],
    }));
  };

  // 加载历史会话
  const loadSession = useCallback(
    async (sessionId: number) => {
      try {
        const [session, messagesRes] = await Promise.all([
          api.getChatSession(sessionId),
          api.getChatMessages(sessionId),
        ]);
        
        setCurrentSession(session);
        setMessages(convertHistoryMessages(messagesRes.items));
        
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
      if (isStreaming || !query.trim()) return;

      // 如果是新对话，先创建会话
      let session = currentSession;
      if (!session) {
        try {
          // 用用户输入的前50个字符作为标题
          const title = query.slice(0, 50) + (query.length > 50 ? "..." : "");
          session = await createSession(title, query.slice(0, 200));
        } catch (error) {
          console.error("Failed to create session:", error);
          // 继续对话，即使创建会话失败
        }
      }

      // Add user message
      addMessage({ role: "user", parts: [{ type: "text", content: query }] });

      // 保存用户消息到数据库
      if (session) {
        api.addChatMessage(session.id, "user", query).catch(console.error);
      }

      // Add empty assistant message
      addMessage({ role: "assistant", parts: [] });

      setIsStreaming(true);

      let assistantResponse = "";

      try {
        const history = getHistoryContent(messages);

        for await (const event of api.chatStream(query, history)) {
          const e = event as SSEEvent;

          switch (e.type) {
            case "token":
              appendTextToLastAssistant(e.content || "");
              assistantResponse += e.content || "";
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
                credits_remaining: e.credits_remaining ?? 0,
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

        // 保存助手消息到数据库
        if (session && assistantResponse) {
          api.addChatMessage(session.id, "assistant", assistantResponse).catch(console.error);
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
      currentSession,
      createSession,
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
    currentSession,
    sendMessage,
    loadSession,
    startNewChat,
    clearMessages,
  };
}
