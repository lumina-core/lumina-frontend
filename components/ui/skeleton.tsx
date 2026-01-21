"use client";

import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-lg bg-bg-tertiary",
        className
      )}
    />
  );
}

// 文本骨架屏
interface SkeletonTextProps {
  lines?: number;
  className?: string;
}

export function SkeletonText({ lines = 3, className }: SkeletonTextProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            "h-4",
            i === lines - 1 ? "w-2/3" : "w-full"
          )}
        />
      ))}
    </div>
  );
}

// 头像骨架屏
interface SkeletonAvatarProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function SkeletonAvatar({ size = "md", className }: SkeletonAvatarProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
  };

  return (
    <Skeleton className={cn("rounded-full", sizeClasses[size], className)} />
  );
}

// 卡片骨架屏
interface SkeletonCardProps {
  className?: string;
  hasAvatar?: boolean;
}

export function SkeletonCard({ className, hasAvatar = false }: SkeletonCardProps) {
  return (
    <div
      className={cn(
        "p-4 rounded-xl border border-border-default bg-bg-secondary",
        className
      )}
    >
      <div className="flex items-start gap-3">
        {hasAvatar && <SkeletonAvatar size="sm" />}
        <div className="flex-1 space-y-3">
          <Skeleton className="h-5 w-1/3" />
          <SkeletonText lines={2} />
          <div className="flex gap-4">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      </div>
    </div>
  );
}

// 聊天消息骨架屏
export function SkeletonMessage({ isUser = false }: { isUser?: boolean }) {
  if (isUser) {
    return (
      <div className="flex justify-end mb-4">
        <Skeleton className="h-12 w-48 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="mb-6">
      <div className="flex items-start gap-3">
        <Skeleton className="w-8 h-8 rounded-lg flex-shrink-0" />
        <div className="flex-1 space-y-3">
          <SkeletonText lines={4} />
        </div>
      </div>
    </div>
  );
}

// 历史列表骨架屏
export function SkeletonHistoryList({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
