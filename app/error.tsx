"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary p-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-xl font-semibold text-text-primary mb-2">
          出错了
        </h2>
        <p className="text-text-secondary mb-6">
          抱歉，页面加载时发生了错误。请尝试刷新页面。
        </p>
        <Button onClick={reset}>
          <RefreshCw className="w-4 h-4 mr-2" />
          重试
        </Button>
      </div>
    </div>
  );
}
