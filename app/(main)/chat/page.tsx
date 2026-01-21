"use client";

import { useChat } from "@/hooks/useChat";
import { MessageList } from "@/components/chat/MessageList";
import { ChatInput } from "@/components/chat/ChatInput";
import { WelcomeScreen } from "@/components/chat/WelcomeScreen";
import { UsageDisplay } from "@/components/chat/UsageDisplay";

export default function ChatPage() {
  const {
    messages,
    isStreaming,
    lastUsage,
    sendMessage,
  } = useChat();

  const hasMessages = messages.length > 0;

  return (
    <div className="flex-1 flex flex-col h-full">
      {hasMessages ? (
        <MessageList
          messages={messages}
          isStreaming={isStreaming}
        />
      ) : (
        <WelcomeScreen onSelectPrompt={sendMessage} />
      )}

      {/* Usage Display */}
      {lastUsage && !isStreaming && <UsageDisplay usage={lastUsage} />}

      {/* Input Area */}
      <div className="p-4 border-t border-border-default">
        <div className="max-w-3xl mx-auto">
          <ChatInput
            onSend={sendMessage}
            disabled={false}
            isStreaming={isStreaming}
          />
        </div>
      </div>
    </div>
  );
}
