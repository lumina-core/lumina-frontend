"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui";
import { useAuthStore } from "@/stores/authStore";
import { ArrowLeft, Mail, MessageCircle, X } from "lucide-react";

export default function AboutPage() {
  const { isAuthenticated } = useAuthStore();
  const [showQrCode, setShowQrCode] = useState(false);

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
              <Link href="/pricing" className="text-sm text-text-secondary hover:text-text-primary transition-colors">
                产品套餐
              </Link>
              <Link href="/docs" className="text-sm text-text-secondary hover:text-text-primary transition-colors">
                文档
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
          
          {/* Contact Section */}
          <div className="rounded-xl border border-border-default bg-bg-secondary p-8">
            <h2 className="text-xl font-semibold text-text-primary mb-6">联系我</h2>
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="mailto:lumina_dev@163.com"
                className="flex items-center gap-3 px-4 py-3 rounded-lg bg-bg-tertiary hover:bg-bg-primary transition-colors"
              >
                <Mail className="w-5 h-5 text-brand-primary" />
                <div>
                  <p className="text-sm font-medium text-text-primary">邮箱</p>
                  <p className="text-xs text-text-secondary">lumina_dev@163.com</p>
                </div>
              </a>
              <button
                onClick={() => setShowQrCode(true)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg bg-bg-tertiary hover:bg-bg-primary transition-colors text-left"
              >
                <MessageCircle className="w-5 h-5 text-brand-primary" />
                <div>
                  <p className="text-sm font-medium text-text-primary">QQ</p>
                  <p className="text-xs text-text-secondary">扫码添加</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* QR Code Modal */}
      {showQrCode && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setShowQrCode(false)}
        >
          <div
            className="relative bg-bg-secondary rounded-xl p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowQrCode(false)}
              className="absolute top-2 right-2 p-1 rounded-lg hover:bg-bg-tertiary transition-colors"
            >
              <X className="w-5 h-5 text-text-tertiary" />
            </button>
            <div className="text-center">
              <p className="text-text-primary font-medium mb-4">扫描二维码添加 QQ</p>
              <Image
                src="/images/qrcode-qq.JPG"
                alt="QQ 二维码"
                width={200}
                height={200}
                className="rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
