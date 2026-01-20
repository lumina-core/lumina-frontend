"use client";

import { useState } from "react";
import { Search, ChevronDown, ChevronUp, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ToolCall } from "@/types";

interface ToolCallCardProps {
  toolCall: ToolCall;
}

const toolNames: Record<string, string> = {
  search_news_tool: "搜索新闻",
  search_news: "搜索新闻",
};

export function ToolCallCard({ toolCall }: ToolCallCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { name, input, output, status } = toolCall;

  const displayName = toolNames[name] || name;
  const isRunning = status === "running";
  const isCompleted = status === "completed";

  return (
    <div className="my-3 rounded-xl border border-border-default bg-bg-tertiary overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center gap-3 p-3 hover:bg-bg-elevated transition-colors"
      >
        <div
          className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center",
            isCompleted ? "bg-success/20" : "bg-brand-primary/20"
          )}
        >
          {isRunning ? (
            <Loader2 className="w-4 h-4 text-brand-primary animate-spin" />
          ) : isCompleted ? (
            <Check className="w-4 h-4 text-success" />
          ) : (
            <Search className="w-4 h-4 text-brand-primary" />
          )}
        </div>

        <div className="flex-1 text-left">
          <span className="text-sm font-medium text-text-primary">
            {isRunning ? `正在${displayName}...` : displayName}
          </span>
          {output && (
            <span className="ml-2 text-xs text-text-tertiary">{output}</span>
          )}
        </div>

        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-text-tertiary" />
        ) : (
          <ChevronDown className="w-4 h-4 text-text-tertiary" />
        )}
      </button>

      {isExpanded && (
        <div className="px-3 pb-3 pt-0">
          <div className="rounded-lg bg-bg-primary p-3 text-xs font-mono text-text-secondary">
            <pre className="whitespace-pre-wrap break-words">
              {JSON.stringify(input, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
