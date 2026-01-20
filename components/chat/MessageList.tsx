"use client";

import { useEffect, useRef } from "react";
import { MessageItem } from "./MessageItem";
import { ToolCallCard } from "./ToolCallCard";
import type { Message, ToolCall } from "@/types";

interface MessageListProps {
  messages: Message[];
  isStreaming?: boolean;
  currentToolCall?: ToolCall | null;
}

export function MessageList({
  messages,
  isStreaming,
  currentToolCall,
}: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming, currentToolCall]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6">
      <div className="max-w-3xl mx-auto">
        {messages.map((message, idx) => {
          const isLastAssistant =
            idx === messages.length - 1 && message.role === "assistant";

          return (
            <MessageItem
              key={idx}
              message={message}
              isStreaming={isLastAssistant && isStreaming}
            />
          );
        })}

        {/* Current Tool Call (while streaming) */}
        {currentToolCall && isStreaming && (
          <div className="mb-6">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8" /> {/* Spacer */}
              <div className="flex-1">
                <ToolCallCard toolCall={currentToolCall} />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}
