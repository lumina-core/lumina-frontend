"use client";

import { Search, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AggregatedToolCall } from "@/types";

interface ToolCallCardProps {
  aggregatedToolCall: AggregatedToolCall;
}

const toolNames: Record<string, string> = {
  search_news_tool: "搜索新闻",
  search_news: "搜索新闻",
};

export function ToolCallCard({ aggregatedToolCall }: ToolCallCardProps) {
  const { name, count, completedCount, status } = aggregatedToolCall;

  const displayName = toolNames[name] || name;
  const isRunning = status === "running";
  const isCompleted = status === "completed";

  const countDisplay = count > 1 ? ` (${completedCount}/${count})` : "";

  return (
    <div className="my-3 rounded-xl border border-border-default bg-bg-tertiary overflow-hidden">
      <div className="flex items-center gap-3 p-3">
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

        <span className="text-sm font-medium text-text-primary">
          {isRunning ? `正在${displayName}${countDisplay}...` : `${displayName}${countDisplay}`}
        </span>
      </div>
    </div>
  );
}
