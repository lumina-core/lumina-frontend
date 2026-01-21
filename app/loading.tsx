import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-8 h-8 text-brand-primary animate-spin" />
        <p className="text-text-secondary text-sm">加载中...</p>
      </div>
    </div>
  );
}
