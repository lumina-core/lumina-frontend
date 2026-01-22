"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion } from "framer-motion";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { SkeletonCard } from "@/components/ui";
import { ArrowLeft, Calendar, Sparkles, AlertCircle, Copy, Check } from "lucide-react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import type { SharedSession, ChatHistoryMessage } from "@/types";

function SharedMessageItem({ message }: { message: ChatHistoryMessage }) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === "user";

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isUser) {
    return (
      <motion.div
        className="flex justify-end mb-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="max-w-[70%] px-4 py-3 rounded-2xl bg-brand-primary text-white">
          <p className="whitespace-pre-wrap">{message.content}</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="mb-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-brand-primary/20 flex items-center justify-center shrink-0">
          <Sparkles className="w-4 h-4 text-brand-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="prose prose-invert prose-sm max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
                ul: ({ children }) => <ul className="mb-3 list-disc pl-4">{children}</ul>,
                ol: ({ children }) => <ol className="mb-3 list-decimal pl-4">{children}</ol>,
                li: ({ children }) => <li className="mb-1">{children}</li>,
                h1: ({ children }) => <h1 className="text-xl font-bold mb-3 mt-4">{children}</h1>,
                h2: ({ children }) => <h2 className="text-lg font-bold mb-2 mt-4">{children}</h2>,
                h3: ({ children }) => <h3 className="text-base font-bold mb-2 mt-3">{children}</h3>,
                code: ({ className, children }) => {
                  const isInline = !className;
                  return isInline ? (
                    <code className="px-1.5 py-0.5 rounded bg-bg-tertiary text-brand-primary font-mono text-sm">
                      {children}
                    </code>
                  ) : (
                    <code className="block p-3 rounded-lg bg-bg-tertiary font-mono text-sm overflow-x-auto">
                      {children}
                    </code>
                  );
                },
                pre: ({ children }) => (
                  <pre className="mb-3 rounded-lg bg-bg-tertiary overflow-hidden">{children}</pre>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="border-l-2 border-brand-primary pl-4 my-3 text-text-secondary">
                    {children}
                  </blockquote>
                ),
                a: ({ href, children }) => (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-primary hover:text-brand-hover underline"
                  >
                    {children}
                  </a>
                ),
                strong: ({ children }) => <strong className="font-semibold text-text-primary">{children}</strong>,
                table: ({ children }) => (
                  <div className="overflow-x-auto my-3">
                    <table className="min-w-full border-collapse">{children}</table>
                  </div>
                ),
                thead: ({ children }) => <thead className="bg-bg-tertiary">{children}</thead>,
                th: ({ children }) => (
                  <th className="px-3 py-2 text-left font-semibold border border-border-primary">{children}</th>
                ),
                td: ({ children }) => (
                  <td className="px-3 py-2 border border-border-primary">{children}</td>
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs text-text-tertiary hover:text-text-secondary hover:bg-bg-tertiary transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  已复制
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  复制
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

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
                  <SharedMessageItem key={msg.id} message={msg} />
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
