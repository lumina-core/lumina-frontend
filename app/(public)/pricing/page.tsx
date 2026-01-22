"use client";

import Link from "next/link";
import { Button } from "@/components/ui";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { ArrowLeft, Clock, Sparkles } from "lucide-react";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      <PublicHeader />

      <main className="flex-1 py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary mb-8">
            <ArrowLeft className="w-4 h-4" />
            返回首页
          </Link>
          
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-full bg-brand-primary/10 flex items-center justify-center mx-auto mb-6">
              <Clock className="w-10 h-10 text-brand-primary" />
            </div>
            
            <h1 className="text-3xl font-bold text-text-primary mb-4">产品套餐</h1>
            <p className="text-text-secondary mb-2">
              套餐功能正在规划中，暂未开放
            </p>
            <p className="text-text-tertiary text-sm mb-8">
              目前所有功能均可免费使用，敬请期待后续更新
            </p>

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-primary/10 text-brand-primary text-sm mb-8">
              <Sparkles className="w-4 h-4" />
              <span>当前：免费体验期</span>
            </div>

            <div className="flex justify-center gap-4">
              <Link href="/chat">
                <Button>开始使用</Button>
              </Link>
              <Link href="/about">
                <Button variant="secondary">联系我们</Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
