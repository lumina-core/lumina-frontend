"use client";

import { Coins } from "lucide-react";
import type { ChatUsage } from "@/types";

interface UsageDisplayProps {
  usage: ChatUsage;
}

export function UsageDisplay({ usage }: UsageDisplayProps) {
  return (
    <div className="flex items-center justify-center gap-4 py-2 text-xs text-text-tertiary">
      <span>
        本次消耗: <span className="text-warning">{usage.credits_deducted}</span> 积分
      </span>
      <span className="w-px h-3 bg-border-default" />
      <span className="flex items-center gap-1">
        <Coins className="w-3 h-3" />
        余额: <span className="text-text-secondary">{usage.credits_remaining.toLocaleString()}</span>
      </span>
    </div>
  );
}
