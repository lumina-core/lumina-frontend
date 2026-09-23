"use client";

import { Activity, Coins } from "lucide-react";
import type { ChatUsage } from "@/types";

interface UsageDisplayProps {
  usage: ChatUsage;
}

export function UsageDisplay({ usage }: UsageDisplayProps) {
  const hasCredits = typeof usage.credits_remaining === "number";

  return (
    <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 px-4 py-2 text-xs text-text-tertiary">
      <span className="flex items-center gap-1.5">
        <Activity className="h-3 w-3" />
        本次分析 {usage.input_tokens.toLocaleString()} 输入 / {usage.output_tokens.toLocaleString()} 输出 tokens
      </span>
      {hasCredits && (
        <>
          <span className="h-3 w-px bg-border-default" aria-hidden="true" />
          <span className="flex items-center gap-1.5">
            <Coins className="h-3 w-3 text-brand-hover" />
            扣除 <span className="font-medium text-text-secondary">{usage.credits_deducted ?? 0}</span> 积分
          </span>
          <span className="h-3 w-px bg-border-default" aria-hidden="true" />
          <span>余额 {usage.credits_remaining?.toLocaleString()}</span>
        </>
      )}
    </div>
  );
}
