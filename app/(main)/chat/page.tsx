"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useChat } from "@/hooks/useChat";
import { MessageList } from "@/components/chat/MessageList";
import { ChatInput } from "@/components/chat/ChatInput";
import { WelcomeScreen } from "@/components/chat/WelcomeScreen";
import { UsageDisplay } from "@/components/chat/UsageDisplay";
import { CreditGateNotice } from "@/components/chat/CreditGateNotice";
import { SkeletonCard } from "@/components/ui";
import { useAuthStore } from "@/stores/authStore";

function ChatContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session");
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

  const sessionIdNum = sessionId ? parseInt(sessionId, 10) : null;
  const shouldLoadSession = sessionIdNum !== null && !isNaN(sessionIdNum) && 
    (!currentSession || currentSession.id !== sessionIdNum);

  const { isLoading: isLoadingSession, error: loadError } = useQuery({
    queryKey: ["chatSession", sessionIdNum],
    queryFn: async () => {
      if (sessionIdNum) {
        await loadSession(sessionIdNum);
      }
      return null;
    },
    enabled: shouldLoadSession,
    retry: false,
  });

  // 当会话加载完成后，同步数据
  useEffect(() => {
    if (!sessionId && currentSession) {
      // URL 参数被清除了，可能需要重置状态
    }
  }, [sessionId, currentSession]);

  const hasMessages = messages.length > 0;
  const inputDisabled = !credits?.can_use;
  const creditNotice = <CreditGateNotice credits={credits} />;

  if (isLoadingSession) {
    return (
      <div className="flex-1 flex flex-col h-full">
        <div className="flex-1 overflow-y-auto p-4">
          <div className="max-w-3xl mx-auto space-y-4">
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
      <div className="flex-1 flex flex-col items-center justify-center h-full">
        <p className="text-error mb-4">{loadError instanceof Error ? loadError.message : "加载会话失败"}</p>
        <button
          onClick={startNewChat}
          className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90"
        >
          开始新对话
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      {hasMessages ? (
        <>
          <MessageList
            messages={messages}
            isStreaming={isStreaming}
          />

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

export default function ChatPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex flex-col h-full">
        <div className="flex-1 overflow-y-auto p-4">
          <div className="max-w-3xl mx-auto space-y-4">
            <SkeletonCard className="h-20" />
            <SkeletonCard className="h-32" />
          </div>
        </div>
      </div>
    }>
      <ChatContent />
    </Suspense>
  );
}
