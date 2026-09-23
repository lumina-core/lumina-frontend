"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useChat } from "@/hooks/useChat";
import { MessageList } from "@/components/chat/MessageList";
import { ChatInput } from "@/components/chat/ChatInput";
import { WelcomeScreen } from "@/components/chat/WelcomeScreen";
import { UsageDisplay } from "@/components/chat/UsageDisplay";
import { CreditGateNotice } from "@/components/chat/CreditGateNotice";
import { SkeletonCard } from "@/components/ui";
import { useAuthStore } from "@/stores/authStore";

type ChatScreenProps = {
  sessionId?: string;
};

export function ChatScreen({ sessionId }: ChatScreenProps) {
  const router = useRouter();
  const credits = useAuthStore((state) => state.credits);
  const {
    messages,
    isStreaming,
    lastUsage,
    currentSession,
    sendMessage,
    loadSession,
    startNewChat,
  } = useChat();

  useEffect(() => {
    if (!sessionId) startNewChat();
  }, [sessionId, startNewChat]);

  const shouldLoadSession = Boolean(
    sessionId && currentSession?.id !== sessionId,
  );
  const { isLoading: isLoadingSession, error: loadError } = useQuery({
    queryKey: ["chatSession", sessionId],
    queryFn: () => loadSession(sessionId!),
    enabled: shouldLoadSession,
    retry: false,
  });

  const beginNewChat = () => {
    startNewChat();
    router.replace("/chat");
  };

  const hasMessages = messages.length > 0;
  const inputDisabled = !credits?.can_use;
  const creditNotice = <CreditGateNotice credits={credits} />;

  if (isLoadingSession) {
    return (
      <div className="flex h-full flex-1 flex-col">
        <div className="flex-1 overflow-y-auto p-4">
          <div className="mx-auto max-w-3xl space-y-4">
            <SkeletonCard className="h-20" />
            <SkeletonCard className="h-32" />
            <SkeletonCard className="h-20" />
          </div>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex h-full flex-1 flex-col items-center justify-center">
        <p className="mb-4 text-error">
          {loadError instanceof Error ? loadError.message : "加载会话失败"}
        </p>
        <button
          type="button"
          onClick={beginNewChat}
          className="rounded-lg bg-brand-primary px-4 py-2 text-white hover:bg-brand-primary/90"
        >
          开始新对话
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-1 flex-col">
      {hasMessages ? (
        <>
          <MessageList messages={messages} isStreaming={isStreaming} />

          {lastUsage && !isStreaming && <UsageDisplay usage={lastUsage} />}

          <div className="border-t border-white/[0.06] bg-bg-primary/90 px-4 pb-4 pt-3 backdrop-blur-xl sm:px-6 sm:pb-5">
            <div className="mx-auto max-w-[760px]">
              <ChatInput
                onSend={sendMessage}
                disabled={inputDisabled}
                isStreaming={isStreaming}
              />
              {creditNotice}
            </div>
          </div>
        </>
      ) : (
        <WelcomeScreen
          onSend={sendMessage}
          isStreaming={isStreaming}
          disabled={inputDisabled}
          inputNotice={creditNotice}
        />
      )}
    </div>
  );
}
