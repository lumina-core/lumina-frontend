import type { Metadata } from "next";
import { ChatScreen } from "@/components/chat/ChatScreen";

export default function ChatPage() {
  return <ChatScreen />;
}

export const metadata: Metadata = {
  alternates: { canonical: "/chat" },
  robots: { index: true, follow: true },
  openGraph: { url: "/chat", title: "Lumina - 新闻联播 Agent" },
};
