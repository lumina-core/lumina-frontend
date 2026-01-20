"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Copy, Check, Sparkles } from "lucide-react";
import { ToolCallCard } from "./ToolCallCard";
import type { Message } from "@/types";

interface MessageItemProps {
  message: Message;
  isStreaming?: boolean;
}

export function MessageItem({ message, isStreaming }: MessageItemProps) {
  const [copied, setCopied] = useState(false);
  const { role, content, toolCalls } = message;
  const isUser = role === "user";

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isUser) {
    return (
      <div className="flex justify-end mb-4">
        <div className="max-w-[70%] px-4 py-3 rounded-2xl bg-brand-primary text-white">
          <p className="whitespace-pre-wrap">{content}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-brand-primary/20 flex items-center justify-center shrink-0">
          <Sparkles className="w-4 h-4 text-brand-primary" />
        </div>

        <div className="flex-1 min-w-0">
          {/* Tool Calls */}
          {toolCalls?.map((tc, idx) => (
            <ToolCallCard key={idx} toolCall={tc} />
          ))}

          {/* Content */}
          {content && (
            <div className="prose prose-invert prose-sm max-w-none">
              <ReactMarkdown
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
                }}
              >
                {content}
              </ReactMarkdown>
              {isStreaming && (
                <span className="inline-block w-2 h-4 ml-0.5 bg-brand-primary animate-pulse" />
              )}
            </div>
          )}

          {/* Actions */}
          {content && !isStreaming && (
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
          )}
        </div>
      </div>
    </div>
  );
}
