import { ChatScreen } from "@/components/chat/ChatScreen";

type ChatSessionPageProps = {
  params: Promise<{ sessionId: string }>;
};

export default async function ChatSessionPage({ params }: ChatSessionPageProps) {
  const { sessionId } = await params;
  return <ChatScreen sessionId={sessionId} />;
}
