import { Search, Brain, Zap, Sparkles, TrendingUp, Building2, Users, FileText } from "lucide-react";
import type { ReactNode } from "react";

export interface Feature {
  icon: ReactNode;
  title: string;
  description: string;
}

export interface UseCase {
  icon: ReactNode;
  category: string;
  example: string;
}

export const FEATURES: Omit<Feature, "icon">[] = [
  {
    title: "智能新闻搜索",
    description: "从海量新闻源中快速检索相关信息，精准定位您关心的内容",
  },
  {
    title: "AI 深度分析",
    description: "基于大语言模型的智能分析，提取关键信息和深层洞察",
  },
  {
    title: "实时追踪",
    description: "持续监控行业动态，第一时间获取重要新闻和市场变化",
  },
  {
    title: "专业洞察",
    description: "结合行业知识，提供投资、研究、决策所需的专业见解",
  },
];

export const FEATURE_ICONS = [Search, Brain, Zap, Sparkles];

export const USE_CASES: Omit<UseCase, "icon">[] = [
  {
    category: "投资视角",
    example: "最近有哪些关于新能源汽车的重要新闻？",
  },
  {
    category: "行业研究",
    example: "分析一下低空经济的发展趋势",
  },
  {
    category: "企业决策",
    example: "搜索头部科技公司的最新战略动向",
  },
  {
    category: "政策解读",
    example: "近期有哪些重要的产业政策发布？",
  },
];

export const USE_CASE_ICONS = [TrendingUp, Building2, Users, FileText];
