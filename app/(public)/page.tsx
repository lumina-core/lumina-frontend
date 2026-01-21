"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui";
import { Footer } from "@/components/layout/Footer";
import { useAuthStore } from "@/stores/authStore";
import {
  TrendingUp,
  Building2,
  Users,
  FileText,
  Sparkles,
  Search,
  Brain,
  Zap,
  Mail,
  MessageCircle,
  X,
} from "lucide-react";

function ContactQrButton() {
  const [showQr, setShowQr] = useState(false);

  return (
    <>
      <Button size="lg" variant="secondary" className="px-8" onClick={() => setShowQr(true)}>
        <MessageCircle className="w-5 h-5 mr-2" />
        QQ 联系
      </Button>

      {showQr && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setShowQr(false)}
        >
          <div
            className="relative bg-bg-secondary rounded-xl p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowQr(false)}
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
              <p className="mt-4 text-sm text-text-secondary">
                添加时请备注「Lumina 内测」
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const features = [
  {
    icon: <Search className="w-6 h-6" />,
    title: "智能新闻搜索",
    description: "从海量新闻源中快速检索相关信息，精准定位您关心的内容",
  },
  {
    icon: <Brain className="w-6 h-6" />,
    title: "AI 深度分析",
    description: "基于大语言模型的智能分析，提取关键信息和深层洞察",
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: "实时追踪",
    description: "持续监控行业动态，第一时间获取重要新闻和市场变化",
  },
  {
    icon: <Sparkles className="w-6 h-6" />,
    title: "专业洞察",
    description: "结合行业知识，提供投资、研究、决策所需的专业见解",
  },
];

const useCases = [
  {
    icon: <TrendingUp className="w-5 h-5" />,
    category: "投资视角",
    example: "最近有哪些关于新能源汽车的重要新闻？",
  },
  {
    icon: <Building2 className="w-5 h-5" />,
    category: "行业研究",
    example: "分析一下低空经济的发展趋势",
  },
  {
    icon: <Users className="w-5 h-5" />,
    category: "企业决策",
    example: "搜索头部科技公司的最新战略动向",
  },
  {
    icon: <FileText className="w-5 h-5" />,
    category: "政策解读",
    example: "近期有哪些重要的产业政策发布？",
  },
];

export default function LandingPage() {
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      {/* Header */}
      <header className="border-b border-border-default bg-bg-secondary/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Logo />
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

      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-20">
        <div className="text-center max-w-3xl mx-auto">
          {/* Beta Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-primary/10 border border-brand-primary/20 mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-primary"></span>
            </span>
            <span className="text-sm text-brand-primary font-medium">内测进行中</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-6">
            AI 新闻分析助手
          </h1>
          <p className="text-xl text-text-secondary mb-8 leading-relaxed">
            帮助投资者、研究员、企业决策者从海量新闻中快速获取洞察，
            <br className="hidden md:block" />
            让信息搜集和分析更高效、更智能
          </p>
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center justify-center gap-4">
              <a href="#contact">
                <Button size="lg" className="px-8">
                  <Sparkles className="w-5 h-5 mr-2" />
                  获取邀请码
                </Button>
              </a>
              <Link href="/login">
                <Button size="lg" variant="secondary" className="px-8">
                  已有邀请码？登录
                </Button>
              </Link>
            </div>
            <p className="text-sm text-text-tertiary">
              内测期间免费体验，欢迎反馈建议
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-bg-secondary">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-text-primary text-center mb-12">
            核心功能
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="p-6 rounded-xl border border-border-default bg-bg-primary hover:border-brand-primary/50 transition-colors"
              >
                <div className="w-12 h-12 rounded-lg bg-brand-primary/10 flex items-center justify-center text-brand-primary mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">
                  {feature.title}
                </h3>
                <p className="text-text-secondary text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-text-primary text-center mb-4">
            应用场景
          </h2>
          <p className="text-text-secondary text-center mb-12">
            无论您是投资人、分析师还是企业管理者，Lumina 都能助您一臂之力
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {useCases.map((useCase) => (
              <div
                key={useCase.category}
                className="p-5 rounded-xl border border-border-default bg-bg-secondary hover:border-border-hover transition-colors"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-brand-primary">{useCase.icon}</span>
                  <span className="font-medium text-text-primary">
                    {useCase.category}
                  </span>
                </div>
                <p className="text-text-secondary text-sm pl-7">
                  &ldquo;{useCase.example}&rdquo;
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA Section */}
      <section id="contact" className="py-16 px-6 bg-bg-secondary">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-text-primary mb-4">
            获取内测邀请码
          </h2>
          <p className="text-text-secondary mb-8">
            内测期间完全免费，我们期待您的体验反馈，帮助我们做得更好
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="mailto:your-email@example.com?subject=申请Lumina内测邀请码&body=您好，我希望申请Lumina内测邀请码。%0A%0A我的使用场景：">
              <Button size="lg" className="px-8">
                <Mail className="w-5 h-5 mr-2" />
                邮件联系
              </Button>
            </a>
            <ContactQrButton />
          </div>
          <p className="mt-6 text-sm text-text-tertiary">
            请简单描述您的使用场景，我们会尽快发送邀请码
          </p>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
