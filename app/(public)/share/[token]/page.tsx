"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { MessageItem } from "@/components/chat/MessageItem";
import { SkeletonCard } from "@/components/ui";
import { ArrowLeft, Calendar, AlertCircle } from "lucide-react";
import { api } from "@/lib/api";
import { historyMessageToMessage } from "@/lib/chat/history";
import { useAuthStore } from "@/stores/authStore";
import type { SharedSession } from "@/types";

export default function SharePage() {
  const params = useParams();
  const token = params.token as string;
  const [session, setSession] = useState<SharedSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!token) return;
    
    api.getSharedSession(token)
      .then(setSession)
      .catch((err) => {
        setError(err.message || "无法加载分享内容");
      })
      .finally(() => setLoading(false));
  }, [token]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      <PublicHeader />

      <main className="flex-1 py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            返回首页
          </Link>

          {loading ? (
            <div className="space-y-4">
              <SkeletonCard className="h-12" />
              <SkeletonCard className="h-24" />
              <SkeletonCard className="h-48" />
            </div>
          ) : error ? (
            <div className="rounded-xl border border-border-default bg-bg-secondary p-12 text-center">
              <AlertCircle className="w-12 h-12 text-error mx-auto mb-4" />
              <p className="text-text-primary font-medium mb-2">加载失败</p>
              <p className="text-text-tertiary mb-6">{error}</p>
              <Link
                href="/"
                className="inline-flex items-center justify-center h-10 px-6 text-sm font-medium rounded-lg bg-brand-primary text-white hover:bg-brand-hover transition-colors"
              >
                返回首页
              </Link>
            </div>
          ) : session ? (
            <>
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-text-primary mb-2">
                  {session.title}
                </h1>
                <div className="flex items-center gap-2 text-sm text-text-tertiary">
                  <Calendar className="w-4 h-4" />
                  {formatDate(session.created_at)}
                  <span className="mx-2">·</span>
                  <span>{session.messages.length} 条消息</span>
                </div>
              </div>

              <div className="rounded-xl border border-border-default bg-bg-secondary p-6">
                {session.messages.map((msg) => (
                  <MessageItem key={msg.id} message={historyMessageToMessage(msg)} />
                ))}
              </div>

              <div className="mt-8 text-center">
                <p className="text-text-tertiary text-sm mb-4">
                  想要开始自己的对话？
                </p>
                <Link
                  href={isAuthenticated ? "/chat" : "/login"}
                  className="inline-flex items-center justify-center h-10 px-6 text-sm font-medium rounded-lg bg-brand-primary text-white hover:bg-brand-hover transition-colors"
                >
                  立即体验 Lumina
                </Link>
              </div>
            </>
          ) : null}
        </div>
      </main>
    </div>
  );
}
