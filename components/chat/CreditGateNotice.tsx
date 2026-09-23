"use client";

import Link from "next/link";
import type { UserCredits } from "@/types";

interface CreditGateNoticeProps {
  credits: UserCredits | null;
}

export function CreditGateNotice({ credits }: CreditGateNoticeProps) {
  if (credits?.can_use) return null;

  if (!credits) {
    return (
      <p className="mt-3 text-center text-xs text-text-tertiary" role="status">
        正在核验积分…
      </p>
    );
  }

  const isOutOfCredits = credits.credits <= 0;

  return (
    <p className="mt-3 text-center text-xs text-text-secondary" role="status">
      {isOutOfCredits ? "积分不足，暂时无法发起分析。" : "今日分析额度已用完。"}
      {isOutOfCredits ? (
        <Link
          href="/pricing"
          className="ml-1.5 font-medium text-brand-hover underline decoration-brand-primary/40 underline-offset-4 transition-colors hover:text-white"
        >
          查看积分方案
        </Link>
      ) : (
        <span className="ml-1.5 text-text-tertiary">明天再继续</span>
      )}
    </p>
  );
}
