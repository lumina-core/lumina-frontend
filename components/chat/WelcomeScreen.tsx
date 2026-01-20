"use client";

import { useState, useEffect } from "react";
import { Logo } from "@/components/Logo";
import { api } from "@/lib/api";
import { TrendingUp, Building2, Users, FileText } from "lucide-react";
import type { PromptExample } from "@/types";

interface WelcomeScreenProps {
  onSelectPrompt: (prompt: string) => void;
}

const categoryIcons: Record<string, React.ReactNode> = {
  投资视角: <TrendingUp className="w-5 h-5" />,
  行业研究: <Building2 className="w-5 h-5" />,
  企业决策: <Users className="w-5 h-5" />,
  政策解读: <FileText className="w-5 h-5" />,
};

const defaultExamples: PromptExample[] = [
  {
    category: "投资视角",
    prompts: [
      "最近有哪些关于新能源汽车的重要新闻？",
      "AI芯片领域有什么最新动态？",
    ],
  },
  {
    category: "行业研究",
    prompts: [
      "分析一下低空经济的发展趋势",
      "梳理近期半导体产业链的变化",
    ],
  },
  {
    category: "企业决策",
    prompts: [
      "搜索头部科技公司的最新战略动向",
      "有哪些行业并购重组的新闻？",
    ],
  },
  {
    category: "政策解读",
    prompts: [
      "近期有哪些重要的产业政策发布？",
      "解读最新的金融监管政策",
    ],
  },
];

export function WelcomeScreen({ onSelectPrompt }: WelcomeScreenProps) {
  const [examples, setExamples] = useState<PromptExample[]>(defaultExamples);

  useEffect(() => {
    api.getPromptExamples().then((res) => {
      if (res.examples?.length > 0) {
        setExamples(res.examples);
      }
    }).catch(() => {
      // Use default examples
    });
  }, []);

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
      <Logo size="lg" className="mb-2" />
      <p className="text-text-secondary mb-12">AI 新闻分析助手，为您提供专业洞察</p>

      <div className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-2 gap-4">
        {examples.map((category) => (
          <div
            key={category.category}
            className="p-4 rounded-xl border border-border-default bg-bg-secondary hover:border-border-hover transition-colors"
          >
            <div className="flex items-center gap-2 mb-3 text-text-primary">
              <span className="text-brand-primary">
                {categoryIcons[category.category] || <FileText className="w-5 h-5" />}
              </span>
              <span className="font-medium">{category.category}</span>
            </div>
            <div className="space-y-2">
              {category.prompts.slice(0, 2).map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => onSelectPrompt(prompt)}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm text-text-secondary hover:bg-bg-tertiary hover:text-text-primary transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
