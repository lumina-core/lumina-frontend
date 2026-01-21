"use client";

import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui";

import { useAuthStore } from "@/stores/authStore";
import { 
  ArrowLeft, 
  Book, 
  Zap, 
  Code, 
  HelpCircle,
  Coins,
  Shield,
  ExternalLink,
} from "lucide-react";

const docSections = [
  {
    icon: <Zap className="w-5 h-5" />,
    title: "快速开始",
    description: "5 分钟上手 Lumina，开始你的第一次新闻分析",
    href: "/docs/quickstart",
    available: false,
  },
  {
    icon: <Book className="w-5 h-5" />,
    title: "使用指南",
    description: "详细了解各项功能的使用方法和最佳实践",
    href: "/docs/guide",
    available: false,
  },
  {
    icon: <Coins className="w-5 h-5" />,
    title: "积分说明",
    description: "了解积分的获取方式、消耗规则和充值方案",
    href: "/docs/credits",
    available: false,
  },
  {
    icon: <HelpCircle className="w-5 h-5" />,
    title: "常见问题",
    description: "查看其他用户经常遇到的问题和解答",
    href: "/docs/faq",
    available: false,
  },
  {
    icon: <Code className="w-5 h-5" />,
    title: "API 文档",
    description: "通过 API 将 Lumina 集成到你的工作流程中",
    href: "/docs/api",
    available: false,
    badge: "即将推出",
  },
  {
    icon: <Shield className="w-5 h-5" />,
    title: "MCP 协议",
    description: "使用 MCP 协议与其他 AI 工具无缝协作",
    href: "/docs/mcp",
    available: false,
    badge: "即将推出",
  },
];

export default function DocsPage() {
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
              <Link href="/pricing" className="text-sm text-text-secondary hover:text-text-primary transition-colors">
                产品套餐
              </Link>
              <Link href="/docs" className="text-sm text-text-primary font-medium">
                文档
              </Link>
              <Link href="/changelog" className="text-sm text-text-secondary hover:text-text-primary transition-colors">
                更新日志
              </Link>
              <Link href="/about" className="text-sm text-text-secondary hover:text-text-primary transition-colors">
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
          
          <h1 className="text-3xl font-bold text-text-primary mb-4">文档中心</h1>
          <p className="text-text-secondary mb-12">
            了解如何使用 Lumina，获取最佳的新闻分析体验。
          </p>

          {/* Doc Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {docSections.map((section) => (
              <div
                key={section.title}
                className={`relative p-6 rounded-xl border transition-colors ${
                  section.available
                    ? "border-border-default bg-bg-secondary hover:border-brand-primary/50 cursor-pointer"
                    : "border-border-default bg-bg-secondary/50 opacity-70"
                }`}
              >
                {section.badge && (
                  <span className="absolute top-4 right-4 px-2 py-0.5 text-xs font-medium rounded-full bg-brand-primary/10 text-brand-primary">
                    {section.badge}
                  </span>
                )}
                <div className="w-10 h-10 rounded-lg bg-brand-primary/10 flex items-center justify-center text-brand-primary mb-4">
                  {section.icon}
                </div>
                <h3 className="font-semibold text-text-primary mb-2 flex items-center gap-2">
                  {section.title}
                  {section.available && <ExternalLink className="w-4 h-4 text-text-tertiary" />}
                </h3>
                <p className="text-sm text-text-secondary">
                  {section.description}
                </p>
              </div>
            ))}
          </div>

          {/* Coming Soon Notice */}
          <div className="mt-12 p-6 rounded-xl border border-border-default bg-bg-secondary text-center">
            <p className="text-text-secondary">
              📚 文档正在持续完善中，敬请期待...
            </p>
            <p className="text-sm text-text-tertiary mt-2">
              有任何问题可以
              <Link href="/about" className="text-brand-primary hover:underline mx-1">
                联系我们
              </Link>
              获取帮助
            </p>
          </div>
        </div>
      </main>

    </div>
  );
}
