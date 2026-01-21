"use client";

import Link from "next/link";
import { Button } from "@/components/ui";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { ArrowLeft, Check, Sparkles, Gift, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const plans = [
  {
    name: "免费版",
    price: "0",
    period: "永久",
    description: "适合轻度体验用户",
    credits: 100,
    features: [
      "每日 100 积分",
      "基础新闻搜索",
      "标准响应速度",
      "社区支持",
    ],
    cta: "免费开始",
    popular: false,
  },
  {
    name: "Pro",
    price: "0",
    originalPrice: "29",
    period: "/月",
    description: "适合个人深度用户",
    credits: 2000,
    badge: "限时免费",
    features: [
      "每月 2,000 积分",
      "高级新闻分析",
      "优先响应速度",
      "邮件支持",
      "历史记录保存",
    ],
    cta: "限时领取",
    popular: true,
  },
  {
    name: "团队版",
    price: "99",
    period: "/月",
    description: "适合团队和企业用户",
    credits: 10000,
    features: [
      "每月 10,000 积分",
      "全部高级功能",
      "最快响应速度",
      "专属客服支持",
      "团队协作功能",
      "API 访问权限",
    ],
    cta: "联系我们",
    popular: false,
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      <PublicHeader />

      {/* Content */}
      <main className="flex-1 py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary mb-8">
            <ArrowLeft className="w-4 h-4" />
            返回首页
          </Link>
          
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-text-primary mb-4">选择适合你的套餐</h1>
            <p className="text-text-secondary">
              灵活的定价方案，满足不同需求
            </p>
          </div>

          {/* Growth Plan Banner */}
          <div className="mb-12 p-6 rounded-xl border border-brand-primary/30 bg-gradient-to-r from-brand-primary/10 to-purple-500/10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-brand-primary/20 flex items-center justify-center">
                  <Gift className="w-6 h-6 text-brand-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-text-primary">🚀 增长计划</h3>
                    <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-brand-primary/20 text-brand-primary">
                      限时活动
                    </span>
                  </div>
                  <p className="text-sm text-text-secondary mt-1">
                    邀请好友注册，双方各得 <span className="text-brand-primary font-medium">500 积分</span> 奖励！
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-sm text-text-tertiary">
                  <Users className="w-4 h-4" />
                  <span>已有 128 人参与</span>
                </div>
                <Button size="sm">
                  立即邀请
                </Button>
              </div>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={cn(
                  "relative rounded-xl border p-6 flex flex-col",
                  plan.popular
                    ? "border-brand-primary bg-gradient-to-b from-brand-primary/5 to-transparent"
                    : "border-border-default bg-bg-secondary"
                )}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="px-3 py-1 text-xs font-medium rounded-full bg-brand-primary text-white flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      {plan.badge}
                    </span>
                  </div>
                )}
                
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-text-primary">{plan.name}</h3>
                  <p className="text-sm text-text-tertiary">{plan.description}</p>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    {plan.originalPrice && (
                      <span className="text-lg text-text-tertiary line-through">¥{plan.originalPrice}</span>
                    )}
                    <span className="text-4xl font-bold text-text-primary">
                      {plan.price === "0" ? "免费" : `¥${plan.price}`}
                    </span>
                    {plan.price !== "0" && (
                      <span className="text-text-tertiary">{plan.period}</span>
                    )}
                  </div>
                  <p className="text-sm text-text-secondary mt-2">
                    {plan.credits.toLocaleString()} 积分{plan.period === "永久" ? "/日" : "/月"}
                  </p>
                </div>

                <ul className="space-y-3 mb-6 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-text-secondary">
                      <Check className="w-4 h-4 text-success flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Button
                  className="w-full"
                  variant={plan.popular ? "primary" : "secondary"}
                >
                  {plan.cta}
                </Button>
              </div>
            ))}
          </div>

          {/* FAQ or Additional Info */}
          <div className="text-center">
            <p className="text-text-tertiary text-sm">
              有疑问？
              <Link href="/about" className="text-brand-primary hover:underline ml-1">
                联系我们
              </Link>
            </p>
          </div>
        </div>
      </main>

    </div>
  );
}
