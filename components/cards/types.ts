/** 富文本片段样式类型 */
export type TextStyle =
  | "normal"           // 普通文字
  | "bold"             // 加粗
  | "highlight"        // 荧光笔高亮（黄色背景）
  | "underline"        // 下划线
  | "underline-wavy"   // 波浪下划线
  | "circle"           // 圆圈标注
  | "box"              // 方框标注
  | "badge"            // 徽章/标签样式
  | "large"            // 放大强调
  | "gradient";        // 渐变文字

/** 富文本片段 */
export interface TextSpan {
  text: string;
  style?: TextStyle;
  color?: string;  // 自定义颜色
}

/** 单张卡片内容 */
export interface CardContent {
  /** 主标题 */
  title: string;
  /** 副标题 */
  subtitle?: string;
  /** 内容块 */
  blocks: ContentBlock[];
  /** 标签 */
  tags?: string[];
  /** 底部署名/水印 */
  footer?: string;
  /** 日期 */
  date?: string;
}

export interface ContentBlock {
  /** emoji图标 */
  emoji?: string;
  /** 序号（支持数字或特殊符号如 ① ② ③） */
  index?: string | number;
  /** 小标题 */
  heading?: string;
  /** 小标题样式 */
  headingStyle?: TextStyle;
  /** 正文 - 支持富文本片段数组或纯字符串 */
  content: TextSpan[] | string;
  /** 区块样式：卡片/引用/普通 */
  blockStyle?: "card" | "quote" | "plain";
}

/** 卡片页面类型 */
export type CardPageType = "cover" | "content" | "ending";

/** 单页卡片（带类型标识） */
export interface CardPage {
  type: CardPageType;
  content: CardContent;
}

/** 完整的多图卡片系列 */
export interface CardSeries {
  /** 系列ID */
  id: string;
  /** 系列标题 */
  title: string;
  /** 模板风格 */
  template: CardTemplate;
  /** 卡片页面列表：封面 + N张内容 + 结尾 */
  pages: CardPage[];
  /** 创建时间 */
  createdAt?: string;
}

/** 卡片模板类型 - 当前仅支持知识卡片，后续可扩展 */
export type CardTemplate = "knowledge-card";

/** 模板配色方案 - Liquid Glass 风格 */
export interface ColorScheme {
  // 背景
  bg: string;
  bgGradient: string;
  // 玻璃态
  glassBg: string;
  glassBorder: string;
  glassShadow: string;
  // 文字
  titleColor: string;
  textColor: string;
  textMuted: string;
  // 强调色
  accentPrimary: string;
  accentSecondary: string;
  accentGlow: string;
  // 功能色
  highlightBg: string;
  cardBg: string;
  borderColor: string;
  tagBg: string;
  tagText: string;
}

/** 模板配置 */
export interface TemplateConfig {
  id: CardTemplate;
  name: string;
  description: string;
  colors: ColorScheme;
}

/** 知识卡片模板配置 - Liquid Glass 风格 */
export const CARD_TEMPLATES: Record<CardTemplate, TemplateConfig> = {
  "knowledge-card": {
    id: "knowledge-card",
    name: "知识卡片",
    description: "Liquid Glass 磨砂玻璃风格",
    colors: {
      // 深色渐变背景
      bg: "#0f0f1a",
      bgGradient: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f1a 100%)",
      // 玻璃态
      glassBg: "rgba(255, 255, 255, 0.08)",
      glassBorder: "rgba(255, 255, 255, 0.12)",
      glassShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
      // 文字
      titleColor: "#ffffff",
      textColor: "rgba(255, 255, 255, 0.9)",
      textMuted: "rgba(255, 255, 255, 0.5)",
      // 强调色 - 青蓝渐变
      accentPrimary: "#06b6d4",    // cyan-500
      accentSecondary: "#8b5cf6",  // violet-500
      accentGlow: "rgba(6, 182, 212, 0.4)",
      // 功能色
      highlightBg: "rgba(251, 191, 36, 0.25)",
      cardBg: "rgba(255, 255, 255, 0.06)",
      borderColor: "rgba(255, 255, 255, 0.1)",
      tagBg: "rgba(255, 255, 255, 0.1)",
      tagText: "rgba(255, 255, 255, 0.8)",
    },
  },
};
