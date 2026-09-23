"use client";

import { forwardRef } from "react";
import type { CardContent, CardTemplate, ColorScheme, TextSpan, TextStyle } from "./types";
import { CARD_TEMPLATES } from "./types";

interface CardCanvasProps {
  content: CardContent;
  template: CardTemplate;
  scale?: number;
}

/** 9:16 竖屏卡片画布 (1080x1920 逻辑尺寸) */
export const CardCanvas = forwardRef<HTMLDivElement, CardCanvasProps>(
  function CardCanvas({ content, template, scale = 0.35 }, ref) {
    const config = CARD_TEMPLATES[template];
    const { colors } = config;

    const canvasStyle: React.CSSProperties = {
      width: 1080 * scale,
      height: 1920 * scale,
      background: colors.bgGradient,
      position: "relative",
      overflow: "hidden",
      fontFamily: '"Inter", "Geist Sans", "PingFang SC", sans-serif',
    };

    const innerStyle: React.CSSProperties = {
      width: 1080,
      height: 1920,
      transform: `scale(${scale})`,
      transformOrigin: "top left",
      padding: 72,
      boxSizing: "border-box",
      display: "flex",
      flexDirection: "column",
    };

    return (
      <div
        ref={ref}
        style={canvasStyle}
        className="rounded-xl shadow-2xl flex-shrink-0"
      >
        <div style={innerStyle}>
          {/* 顶部装饰 */}
          <TopDecoration colors={colors} />

          {/* 日期标签 */}
          {content.date && (
            <div
              style={{
                fontSize: 24,
                color: colors.textMuted,
                marginBottom: 24,
                letterSpacing: 3,
                textTransform: "uppercase",
                fontWeight: 500,
              }}
            >
              {content.date}
            </div>
          )}

          {/* 主标题 */}
          <h1
            style={{
              fontSize: 68,
              fontWeight: 700,
              color: colors.titleColor,
              lineHeight: 1.25,
              marginBottom: 20,
              letterSpacing: -2,
            }}
          >
            {content.title}
          </h1>

          {/* 副标题 */}
          {content.subtitle && (
            <p
              style={{
                fontSize: 32,
                color: colors.textMuted,
                marginBottom: 40,
                lineHeight: 1.6,
              }}
            >
              {content.subtitle}
            </p>
          )}

          {/* 渐变分隔线 */}
          <div
            style={{
              width: 100,
              height: 4,
              background: `linear-gradient(90deg, ${colors.accentPrimary}, ${colors.accentSecondary})`,
              borderRadius: 2,
              marginBottom: 40,
            }}
          />

          {/* 内容块 */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 28 }}>
            {content.blocks.map((block, idx) => (
              <ContentBlockItem key={idx} block={block} index={idx} colors={colors} />
            ))}
          </div>

          {/* 标签 - 玻璃态 */}
          {content.tags && content.tags.length > 0 && (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 12,
                marginTop: 40,
              }}
            >
              {content.tags.map((tag, idx) => (
                <span
                  key={idx}
                  style={{
                    fontSize: 24,
                    padding: "10px 20px",
                    background: colors.glassBg,
                    color: colors.tagText,
                    borderRadius: 24,
                    fontWeight: 500,
                    border: `1px solid ${colors.glassBorder}`,
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* 底部署名 - 玻璃态 */}
          {content.footer && (
            <div
              style={{
                marginTop: "auto",
                paddingTop: 32,
                fontSize: 26,
                color: colors.textMuted,
                textAlign: "center",
              }}
            >
              {content.footer}
            </div>
          )}
        </div>
      </div>
    );
  }
);

/** 顶部装饰 - 渐变光晕 */
function TopDecoration({ colors }: { colors: ColorScheme }) {
  return (
    <>
      {/* 左上光晕 */}
      <div
        style={{
          position: "absolute",
          top: -200,
          left: -200,
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${colors.accentGlow} 0%, transparent 70%)`,
          pointerEvents: "none",
        }}
      />
      {/* 右下光晕 */}
      <div
        style={{
          position: "absolute",
          bottom: -300,
          right: -200,
          width: 700,
          height: 700,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(139, 92, 246, 0.2) 0%, transparent 70%)`,
          pointerEvents: "none",
        }}
      />
    </>
  );
}

/** 内容块渲染 - 支持富文本和卡片样式 */
function ContentBlockItem({
  block,
  index,
  colors,
}: {
  block: CardContent["blocks"][0];
  index: number;
  colors: ColorScheme;
}) {
  const displayIndex = block.index ?? index + 1;
  const isCardStyle = block.blockStyle === "card";
  const isQuoteStyle = block.blockStyle === "quote";

  const wrapperStyle: React.CSSProperties = isCardStyle
    ? {
        background: colors.glassBg,
        borderRadius: 20,
        padding: 28,
        border: `1px solid ${colors.glassBorder}`,
        boxShadow: colors.glassShadow,
      }
    : isQuoteStyle
    ? {
        borderLeft: `4px solid ${colors.accentPrimary}`,
        background: colors.glassBg,
        padding: "20px 24px",
        borderRadius: "0 16px 16px 0",
      }
    : {};

  return (
    <div style={{ ...wrapperStyle }}>
      <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
        {/* 序号或emoji */}
        {block.emoji ? (
          <span style={{ fontSize: 44, lineHeight: 1 }}>{block.emoji}</span>
        ) : (
          <span
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: "#fff",
              background: `linear-gradient(135deg, ${colors.accentPrimary}, ${colors.accentSecondary})`,
              width: 40,
              height: 40,
              borderRadius: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {displayIndex}
          </span>
        )}

        <div style={{ flex: 1 }}>
          {/* 小标题 */}
          {block.heading && (
            <h3 style={{ fontSize: 32, fontWeight: 600, color: colors.titleColor, marginBottom: 10, lineHeight: 1.4, letterSpacing: -0.5 }}>
              <RichText text={block.heading} style={block.headingStyle} colors={colors} />
            </h3>
          )}
          {/* 正文 */}
          <div style={{ fontSize: 28, color: colors.textColor, lineHeight: 1.7 }}>
            <RichTextContent content={block.content} colors={colors} />
          </div>
        </div>
      </div>
    </div>
  );
}

/** 渲染富文本内容 */
function RichTextContent({ content, colors }: { content: TextSpan[] | string; colors: ColorScheme }) {
  if (typeof content === "string") {
    return <span>{content}</span>;
  }
  return (
    <>
      {content.map((span, i) => (
        <RichText key={i} text={span.text} style={span.style} color={span.color} colors={colors} />
      ))}
    </>
  );
}

/** 富文本片段渲染 - 支持多种样式 */
function RichText({
  text, style, color, colors,
}: {
  text: string;
  style?: TextStyle;
  color?: string;
  colors: ColorScheme;
}) {
  const baseColor = color || colors.textColor;

  const styleMap: Record<TextStyle, React.CSSProperties> = {
    normal: {},
    bold: { fontWeight: 600, color: colors.titleColor },
    highlight: { background: colors.highlightBg, padding: "2px 8px", borderRadius: 6 },
    underline: { textDecoration: "underline", textDecorationColor: colors.accentPrimary, textUnderlineOffset: 4 },
    "underline-wavy": { textDecoration: "underline wavy", textDecorationColor: colors.accentPrimary },
    circle: {
      border: `2px solid ${colors.accentPrimary}`,
      borderRadius: 100,
      padding: "2px 12px",
      display: "inline-block",
    },
    box: {
      background: colors.glassBg,
      border: `1px solid ${colors.glassBorder}`,
      padding: "4px 10px",
      borderRadius: 8,
      display: "inline-block",
    },
    badge: {
      background: `linear-gradient(135deg, ${colors.accentPrimary}, ${colors.accentSecondary})`,
      color: "#fff",
      padding: "4px 14px",
      borderRadius: 20,
      fontWeight: 600,
      fontSize: "0.85em",
    },
    large: { fontSize: "1.2em", fontWeight: 600, color: colors.accentPrimary },
    gradient: {
      background: `linear-gradient(90deg, ${colors.accentPrimary}, ${colors.accentSecondary})`,
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      fontWeight: 600,
    },
  };

  const appliedStyle = style ? styleMap[style] : {};
  return <span style={{ color: baseColor, ...appliedStyle }}>{text}</span>;
}
