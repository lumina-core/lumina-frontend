import { create } from "zustand";
import type { Message, ToolCall, ChatUsage } from "@/types";

interface ChatState {
  messages: Message[];
  isStreaming: boolean;
  currentToolCall: ToolCall | null;
  lastUsage: ChatUsage | null;

  addMessage: (message: Message) => void;
  updateLastAssistantMessage: (content: string) => void;
  setToolCall: (toolCall: ToolCall | null) => void;
  updateToolCallStatus: (status: ToolCall["status"], output?: string) => void;
  setIsStreaming: (isStreaming: boolean) => void;
  setLastUsage: (usage: ChatUsage | null) => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  isStreaming: false,
  currentToolCall: null,
  lastUsage: null,

  addMessage: (message) => {
    set((state) => ({ messages: [...state.messages, message] }));
  },

  updateLastAssistantMessage: (content) => {
    set((state) => {
      const messages = [...state.messages];
      const lastIndex = messages.length - 1;
      if (lastIndex >= 0 && messages[lastIndex].role === "assistant") {
        messages[lastIndex] = { ...messages[lastIndex], content };
      }
      return { messages };
    });
  },

  setToolCall: (toolCall) => set({ currentToolCall: toolCall }),

  updateToolCallStatus: (status, output) => {
    set((state) => {
      if (!state.currentToolCall) return state;

      const updatedToolCall = { ...state.currentToolCall, status, output };

      // Add tool call to last assistant message
      if (status === "completed") {
        const messages = [...state.messages];
        const lastIndex = messages.length - 1;
        if (lastIndex >= 0 && messages[lastIndex].role === "assistant") {
          const toolCalls = messages[lastIndex].toolCalls || [];
          messages[lastIndex] = {
            ...messages[lastIndex],
            toolCalls: [...toolCalls, updatedToolCall],
          };
        }
        return { messages, currentToolCall: null };
      }

      return { currentToolCall: updatedToolCall };
    });
  },

  setIsStreaming: (isStreaming) => set({ isStreaming }),

  setLastUsage: (lastUsage) => set({ lastUsage }),

  clearMessages: () => set({ messages: [], currentToolCall: null, lastUsage: null }),
}));
