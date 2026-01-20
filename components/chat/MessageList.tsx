"use client";

import { useEffect, useRef, useCallback } from "react";
import { MessageItem } from "./MessageItem";
import type { Message } from "@/types";

interface MessageListProps {
  messages: Message[];
  isStreaming?: boolean;
}

export function MessageList({
  messages,
  isStreaming,
}: MessageListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const userScrolledRef = useRef(false);
  const lastMessageCountRef = useRef(messages.length);

  const isNearBottom = useCallback(() => {
    const container = containerRef.current;
    if (!container) return true;
    const threshold = 100;
    return container.scrollHeight - container.scrollTop - container.clientHeight < threshold;
  }, []);

  const handleScroll = useCallback(() => {
    if (!isStreaming) return;
    userScrolledRef.current = !isNearBottom();
  }, [isStreaming, isNearBottom]);

  useEffect(() => {
    // Reset user scroll flag when new message is added (user sends message)
    if (messages.length > lastMessageCountRef.current) {
      userScrolledRef.current = false;
    }
    lastMessageCountRef.current = messages.length;

    // Only auto-scroll if user hasn't scrolled up
    if (!userScrolledRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isStreaming]);

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto px-4 py-6"
    >
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

        <div ref={bottomRef} />
      </div>
    </div>
  );
}
