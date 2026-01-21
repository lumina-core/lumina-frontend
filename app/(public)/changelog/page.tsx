"use client";

import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui";
import { useAuthStore } from "@/stores/authStore";
import { ArrowLeft, Sparkles, Wrench, Zap } from "lucide-react";

const changelogs = [
  {
    version: "0.4.0",
    date: "2025-01-21",
    type: "feature" as const,
    title: "聊天功能与用户体验升级",
    changes: [
      "聊天会话持久化，支持从历史记录加载对话",
      "新增每日签到功能，签到可获取积分奖励",
      "注册流程优化，邀请码改为可选",
      "历史记录页面新增动画效果和加载状态",
      "新增骨架屏组件，提升页面加载体验",
    ],
  },
  {
    version: "0.3.0",
    date: "2025-01-20",
    type: "feature" as const,
    title: "公开页面与文档中心",
    changes: [
      "新增产品首页、产品套餐、文档中心等公开页面",
      "新增历史记录页面，支持查看对话历史",
      "优化页面跳转体验，增强登录态感知",
    ],
  },
  {
    version: "0.2.0",
    date: "2025-01-15",
    type: "feature" as const,
    title: "对话体验优化",
    changes: [
      "重构路由结构，将聊天页面移至 /chat 路径",
      "新增侧边栏导航，支持快速新建对话",
      "优化消息渲染，支持 Markdown 格式",
      "新增积分余额显示",
    ],
  },
  {
    version: "0.1.0",
    date: "2025-01-10",
    type: "feature" as const,
    title: "初始版本发布",
    changes: [
      "实现基础对话功能，支持新闻搜索与分析",
      "用户注册与登录系统",
      "积分系统基础框架",
      "深色主题 UI 设计",
    ],
  },
];

const typeConfig = {
  feature: { icon: Sparkles, label: "新功能", color: "text-brand-primary bg-brand-primary/10" },
  improvement: { icon: Zap, label: "优化", color: "text-success bg-success/10" },
  fix: { icon: Wrench, label: "修复", color: "text-warning bg-warning/10" },
};

export default function ChangelogPage() {
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
              <Link href="/docs" className="text-sm text-text-secondary hover:text-text-primary transition-colors">
                文档
              </Link>
              <Link href="/changelog" className="text-sm text-text-primary font-medium">
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
          <h1 className="text-3xl font-bold text-text-primary mb-4">更新日志</h1>
          <p className="text-text-secondary mb-8">
            了解 Lumina 的最新功能更新和改进。
          </p>
          
          {/* Changelog List */}
          <div className="space-y-8">
            {changelogs.map((log, index) => {
              const config = typeConfig[log.type];
              const Icon = config.icon;
              return (
                <div
                  key={log.version}
                  className="relative pl-8 pb-8 border-l-2 border-border-default last:border-l-0 last:pb-0"
                >
                  {/* Timeline dot */}
                  <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-brand-primary border-4 border-bg-primary" />
                  
                  {/* Version header */}
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <span className="text-xl font-bold text-text-primary">v{log.version}</span>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
                      <Icon className="w-3 h-3" />
                      {config.label}
                    </span>
                    <span className="text-sm text-text-tertiary">{log.date}</span>
                  </div>
                  
                  {/* Title */}
                  <h3 className="text-lg font-medium text-text-primary mb-3">{log.title}</h3>
                  
                  {/* Changes */}
                  <ul className="space-y-2">
                    {log.changes.map((change, i) => (
                      <li key={i} className="flex items-start gap-2 text-text-secondary text-sm">
                        <span className="text-brand-primary mt-1">•</span>
                        {change}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </main>

    </div>
  );
}
