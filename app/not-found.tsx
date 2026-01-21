import Link from "next/link";
import { Button } from "@/components/ui";
import { Home, FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary p-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-full bg-brand-primary/10 flex items-center justify-center mx-auto mb-6">
          <FileQuestion className="w-8 h-8 text-brand-primary" />
        </div>
        <h2 className="text-xl font-semibold text-text-primary mb-2">
          页面未找到
        </h2>
        <p className="text-text-secondary mb-6">
          抱歉，您访问的页面不存在或已被移除。
        </p>
        <Link href="/">
          <Button>
            <Home className="w-4 h-4 mr-2" />
            返回首页
          </Button>
        </Link>
      </div>
    </div>
  );
}
