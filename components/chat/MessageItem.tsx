"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkSupersub from "remark-supersub";
import rehypeRaw from "rehype-raw";
import { Copy, Check, Sparkles } from "lucide-react";
import { ToolCallCard } from "./ToolCallCard";
import type { Message, AggregatedToolCall, MessagePart } from "@/types";

interface MessageItemProps {
  message: Message;
  isStreaming?: boolean;
}

type AggregatedPart = MessagePart | { type: "aggregated_tool"; aggregated: AggregatedToolCall };

function aggregateToolCalls(parts: MessagePart[]): AggregatedPart[] {
  const result: AggregatedPart[] = [];
  const toolGroups = new Map<string, { count: number; completedCount: number }>();
  
  parts.forEach((part) => {
    if (part.type === "tool_call") {
      const name = part.toolCall.name;
      const existing = toolGroups.get(name);
      if (existing) {
        existing.count++;
        if (part.toolCall.status === "completed") existing.completedCount++;
      } else {
        toolGroups.set(name, {
          count: 1,
          completedCount: part.toolCall.status === "completed" ? 1 : 0,
        });
      }
    }
  });

  const processedTools = new Set<string>();
  
  parts.forEach((part) => {
    if (part.type === "tool_call") {
      const name = part.toolCall.name;
      if (!processedTools.has(name)) {
        processedTools.add(name);
        const group = toolGroups.get(name)!;
        const aggregated: AggregatedToolCall = {
          name,
          count: group.count,
          completedCount: group.completedCount,
          status: group.completedCount === group.count ? "completed" : "running",
        };
        result.push({ type: "aggregated_tool", aggregated });
      }
    } else {
      result.push(part);
    }
  });

  return result;
}

export function MessageItem({ message, isStreaming }: MessageItemProps) {
  const [copied, setCopied] = useState(false);
  const { role, parts } = message;
  const aggregatedParts = useMemo(() => aggregateToolCalls(parts), [parts]);
  const isUser = role === "user";

  const fullTextContent = parts
    .filter((p) => p.type === "text")
    .map((p) => (p as { type: "text"; content: string }).content)
    .join("");

  const handleCopy = async () => {
    await navigator.clipboard.writeText(fullTextContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isUser) {
    const userContent = parts[0]?.type === "text" ? parts[0].content : "";
    return (
      <motion.div 
        className="flex justify-end mb-4"
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.2 }}
      >
        <div className="max-w-[70%] px-4 py-3 rounded-2xl bg-brand-primary text-white">
          <p className="whitespace-pre-wrap">{userContent}</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="mb-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-start gap-3">
        <motion.div 
          className="w-8 h-8 rounded-lg bg-brand-primary/20 flex items-center justify-center shrink-0"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
        >
          <Sparkles className="w-4 h-4 text-brand-primary" />
        </motion.div>

        <div className="flex-1 min-w-0">
          {/* Render parts with aggregated tool calls */}
          {aggregatedParts.map((part, idx) => {
            if (part.type === "aggregated_tool") {
              return <ToolCallCard key={`tool-${part.aggregated.name}`} aggregatedToolCall={part.aggregated} />;
            }
            if (part.type === "text" && part.content) {
              return (
                <div key={idx} className="prose prose-invert prose-sm max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkSupersub]}
                rehypePlugins={[rehypeRaw]}
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
                  del: ({ children }) => <del className="text-text-tertiary">{children}</del>,
                  table: ({ children }) => (
                    <div className="overflow-x-auto my-3">
                      <table className="min-w-full border-collapse">{children}</table>
                    </div>
                  ),
                  thead: ({ children }) => <thead className="bg-bg-tertiary">{children}</thead>,
                  tbody: ({ children }) => <tbody>{children}</tbody>,
                  tr: ({ children }) => <tr className="border-b border-border-primary">{children}</tr>,
                  th: ({ children }) => (
                    <th className="px-3 py-2 text-left font-semibold border border-border-primary">{children}</th>
                  ),
                  td: ({ children }) => (
                    <td className="px-3 py-2 border border-border-primary">{children}</td>
                  ),
                  sup: ({ children }) => <sup className="text-xs">{children}</sup>,
                  sub: ({ children }) => <sub className="text-xs">{children}</sub>,
                  input: ({ checked }) => (
                    <input type="checkbox" checked={checked} readOnly className="mr-2 accent-brand-primary" />
                  ),
                }}
              >
                {part.content}
              </ReactMarkdown>
                </div>
              );
            }
            return null;
          })}

          {/* Streaming cursor */}
          {isStreaming && (
            <span className="inline-block w-2 h-4 ml-0.5 bg-brand-primary animate-pulse" />
          )}

          {/* Actions */}
          {fullTextContent && !isStreaming && (
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
    </motion.div>
  );
}
