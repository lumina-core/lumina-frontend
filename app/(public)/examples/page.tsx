"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { SkeletonCard, Button } from "@/components/ui";
import {
  ArrowLeft,
  Calendar,
  MessageSquare,
  ExternalLink,
  TrendingUp,
  Building2,
  Users,
  FileText,
  Sparkles,
  Heart,
  Cpu,
  User,
} from "lucide-react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import type { FeaturedExample } from "@/types";

const categoryIcons: Record<string, React.ReactNode> = {
  投资视角: <TrendingUp className="w-5 h-5" />,
  行业研究: <Building2 className="w-5 h-5" />,
  企业决策: <Users className="w-5 h-5" />,
  政策解读: <FileText className="w-5 h-5" />,
  民生热点: <Heart className="w-5 h-5" />,
  科技创新: <Cpu className="w-5 h-5" />,
};

export default function ExamplesPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { isAuthenticated } = useAuthStore();

  const { data, isLoading, error } = useQuery({
    queryKey: ["featuredExamples", selectedCategory],
    queryFn: () => api.getFeaturedExamples(selectedCategory || undefined),
  });

  const examples = data?.examples ?? [];
  const categories = data?.categories ?? [];

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("zh-CN");
  };

  const groupedExamples = examples.reduce((acc, ex) => {
    const cat = ex.category || "其他";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(ex);
    return acc;
  }, {} as Record<string, FeaturedExample[]>);

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      <PublicHeader />

      <main className="flex-1 py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            返回首页
          </Link>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-text-primary mb-4">
              使用示例
            </h1>
            <p className="text-text-secondary">
              探索 Lumina 的各种使用场景，了解如何更好地利用 AI 进行新闻分析。
            </p>
          </div>

          {/* Category Filter */}
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              <Button
                variant={selectedCategory === null ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setSelectedCategory(null)}
              >
                全部
              </Button>
              {categories.map((cat) => (
                <Button
                  key={cat}
                  variant={selectedCategory === cat ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setSelectedCategory(cat)}
                >
                  <span className="mr-1.5">
                    {categoryIcons[cat] || <Sparkles className="w-4 h-4" />}
                  </span>
                  {cat}
                </Button>
              ))}
            </div>
          )}

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <SkeletonCard key={i} className="h-40" />
              ))}
            </div>
          ) : error ? (
            <div className="rounded-xl border border-border-default bg-bg-secondary p-12 text-center">
              <p className="text-error mb-2">加载失败</p>
              <p className="text-text-tertiary">{error instanceof Error ? error.message : "请稍后重试"}</p>
            </div>
          ) : examples.length === 0 ? (
            <div className="rounded-xl border border-border-default bg-bg-secondary p-12 text-center">
              <Sparkles className="w-12 h-12 text-text-tertiary mx-auto mb-4" />
              <p className="text-text-secondary mb-2">暂无精选示例</p>
              <p className="text-sm text-text-tertiary">
                精选示例正在准备中，敬请期待
              </p>
            </div>
          ) : selectedCategory ? (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.05 },
                },
              }}
            >
              {examples.map((ex) => (
                <ExampleCard key={ex.id} example={ex} formatDate={formatDate} />
              ))}
            </motion.div>
          ) : (
            <div className="space-y-10">
              {Object.entries(groupedExamples).map(([category, items]) => (
                <div key={category}>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-brand-primary">
                      {categoryIcons[category] || (
                        <Sparkles className="w-5 h-5" />
                      )}
                    </span>
                    <h2 className="text-xl font-semibold text-text-primary">
                      {category}
                    </h2>
                    <span className="text-sm text-text-tertiary">
                      ({items.length})
                    </span>
                  </div>
                  <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                    initial="hidden"
                    animate="visible"
                    variants={{
                      hidden: { opacity: 0 },
                      visible: {
                        opacity: 1,
                        transition: { staggerChildren: 0.05 },
                      },
                    }}
                  >
                    {items.map((ex) => (
                      <ExampleCard
                        key={ex.id}
                        example={ex}
                        formatDate={formatDate}
                      />
                    ))}
                  </motion.div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-16 text-center border-t border-border-default pt-8">
            <p className="text-text-tertiary text-sm mb-4">
              想要开始自己的对话？
            </p>
            <Link
              href={isAuthenticated ? "/chat" : "/login"}
              className="inline-flex items-center justify-center h-10 px-6 text-sm font-medium rounded-lg bg-brand-primary text-white hover:bg-brand-hover transition-colors"
            >
              立即体验 Lumina
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

function ExampleCard({
  example,
  formatDate,
}: {
  example: FeaturedExample;
  formatDate: (d: string) => string;
}) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 15 },
        visible: { opacity: 1, y: 0 },
      }}
    >
      <Link
        href={`/share/${example.share_token}`}
        className="block p-5 rounded-xl border border-border-default bg-bg-secondary hover:border-border-hover hover:shadow-lg transition-all group"
      >
        <h3 className="font-medium text-text-primary mb-2 group-hover:text-brand-primary transition-colors flex items-center gap-2">
          {example.title}
          <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
        </h3>
        {example.preview && (
          <p className="text-sm text-text-secondary line-clamp-2 mb-3">
            {example.preview}
          </p>
        )}
        <div className="flex items-center gap-4 text-xs text-text-tertiary">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {formatDate(example.created_at)}
          </span>
          <span className="flex items-center gap-1">
            <MessageSquare className="w-3 h-3" />
            {example.message_count} 条消息
          </span>
          {example.contributor && (
            <span className="flex items-center gap-1">
              <User className="w-3 h-3" />
              {example.contributor}
            </span>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
