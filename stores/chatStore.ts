import { create } from "zustand";
import type { Message, ToolCall, ChatUsage, MessagePart } from "@/types";

let toolCallIdCounter = 0;
const generateToolCallId = () => `tool_${Date.now()}_${++toolCallIdCounter}`;

interface ChatState {
  messages: Message[];
  isStreaming: boolean;
  activeToolCalls: Map<string, ToolCall>;
  lastUsage: ChatUsage | null;

  addMessage: (message: Message) => void;
  appendTextToLastAssistant: (text: string) => void;
  addToolCallToLastAssistant: (toolCall: Omit<ToolCall, "id">) => void;
  updateToolCallStatus: (toolName: string, status: ToolCall["status"], output?: string) => void;
  setIsStreaming: (isStreaming: boolean) => void;
  setLastUsage: (usage: ChatUsage | null) => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  isStreaming: false,
  activeToolCalls: new Map(),
  lastUsage: null,

  addMessage: (message) => {
    set((state) => ({ messages: [...state.messages, message] }));
  },

  appendTextToLastAssistant: (text) => {
    set((state) => {
      const messages = [...state.messages];
      const lastIndex = messages.length - 1;
      if (lastIndex >= 0 && messages[lastIndex].role === "assistant") {
        const parts = [...messages[lastIndex].parts];
        const lastPart = parts[parts.length - 1];
        
        if (lastPart && lastPart.type === "text") {
          parts[parts.length - 1] = { type: "text", content: lastPart.content + text };
        } else {
          parts.push({ type: "text", content: text });
        }
        
        messages[lastIndex] = { ...messages[lastIndex], parts };
      }
      return { messages };
    });
  },

  addToolCallToLastAssistant: (toolCall) => {
    set((state) => {
      const messages = [...state.messages];
      const lastIndex = messages.length - 1;
      const id = generateToolCallId();
      const fullToolCall: ToolCall = { ...toolCall, id };
      
      if (lastIndex >= 0 && messages[lastIndex].role === "assistant") {
        const parts: MessagePart[] = [
          ...messages[lastIndex].parts,
          { type: "tool_call", toolCall: fullToolCall },
        ];
        messages[lastIndex] = { ...messages[lastIndex], parts };
      }
      
      const activeToolCalls = new Map(state.activeToolCalls);
      activeToolCalls.set(id, fullToolCall);
      
      return { messages, activeToolCalls };
    });
  },

  updateToolCallStatus: (toolName, status, output) => {
    set((state) => {
      const messages = [...state.messages];
      const lastIndex = messages.length - 1;
      const activeToolCalls = new Map(state.activeToolCalls);
      
      // Find and update the first running tool call with matching name
      let updatedId: string | null = null;
      for (const [id, tc] of activeToolCalls) {
        if (tc.name === toolName && tc.status === "running") {
          activeToolCalls.set(id, { ...tc, status, output });
          updatedId = id;
          break;
        }
      }
      
      // Update in messages as well
      if (lastIndex >= 0 && messages[lastIndex].role === "assistant" && updatedId) {
        const parts = messages[lastIndex].parts.map((part) => {
          if (part.type === "tool_call" && part.toolCall.id === updatedId) {
            return { type: "tool_call" as const, toolCall: { ...part.toolCall, status, output } };
          }
          return part;
        });
        messages[lastIndex] = { ...messages[lastIndex], parts };
      }
      
      // Remove completed tool calls from active map
      if (status === "completed" && updatedId) {
        activeToolCalls.delete(updatedId);
      }
      
      return { messages, activeToolCalls };
    });
  },

  setIsStreaming: (isStreaming) => set({ isStreaming }),

  setLastUsage: (lastUsage) => set({ lastUsage }),

  clearMessages: () => set({ messages: [], activeToolCalls: new Map(), lastUsage: null }),
}));
