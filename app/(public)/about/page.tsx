"use client";

import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui";
import { Footer } from "@/components/layout/Footer";
import { useAuthStore } from "@/stores/authStore";
import { ArrowLeft } from "lucide-react";

export default function AboutPage() {
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      {/* Header */}
      <header className="border-b border-border-default bg-bg-secondary/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Logo />
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/examples" className="text-sm text-text-secondary hover:text-text-primary transition-colors">
                使用示例
              </Link>
              <Link href="/changelog" className="text-sm text-text-secondary hover:text-text-primary transition-colors">
                更新日志
              </Link>
              <Link href="/about" className="text-sm text-text-primary font-medium">
                关于
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link href="/chat">
                <Button>进入应用</Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost">登录</Button>
                </Link>
                <Link href="/register">
                  <Button>免费注册</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary mb-8">
            <ArrowLeft className="w-4 h-4" />
            返回首页
          </Link>
          <h1 className="text-3xl font-bold text-text-primary mb-4">关于</h1>
          <p className="text-text-secondary mb-8">
            了解更多关于 Lumina 和我们的故事。
          </p>
          
          {/* Placeholder content */}
          <div className="rounded-xl border border-border-default bg-bg-secondary p-12 text-center">
            <p className="text-text-tertiary">内容建设中...</p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
