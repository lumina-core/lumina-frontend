import { createOpenAI } from "@ai-sdk/openai";
import { ToolLoopAgent, isStepCount } from "ai";
import { getNewsArticle, searchNews } from "./tools/news";

export function createNewsAgent() {
  const apiKey = process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not configured");
  }

  const headers: Record<string, string> = { "X-Title": "Lumina" };
  if (process.env.APP_URL) {
    headers["HTTP-Referer"] = process.env.APP_URL;
  }

  const openrouter = createOpenAI({
    apiKey,
    baseURL: process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1",
    headers,
    name: "openrouter",
  });

  const today = new Intl.DateTimeFormat("zh-CN", {
    timeZone: "Asia/Shanghai",
    dateStyle: "long",
  }).format(new Date());

  return new ToolLoopAgent({
    model: openrouter.chat(
      process.env.OPENROUTER_MODEL || "openai/gpt-5.6-luna",
    ),
    instructions: `你是 Lumina，一位专门研究央视《新闻联播》的中文分析 Agent。当前日期是 ${today}。

你的工作不是泛泛评论，而是从《新闻联播》原始文稿中寻找可核验的政策信号、报道频次、措辞变化和时间趋势。

规则：
1. 回答事实问题前必须先调用 searchNews；概念可能有多种官方表述时，主动换同义词或相关词搜索。
2. 要趋势计数时，searchNews 才传 groupBy，通常一次按 year 聚合即可。要找原文证据时必须省略 groupBy，拿到文章 ID 后再用 getNewsArticle；不要反复细分聚合，也不要把搜索摘要当完整原文。
3. 只根据工具返回的数据下结论；数据不足时直接说明，不补造数字、日期或政策因果。
4. 把“报道频次变化”和“现实世界变化”区分开。前者只能说明官方报道关注度变化。
5. 回答要简洁、有结构、有判断。引用新闻时使用可点击的 Markdown 链接，并标注日期。
6. 每一步只调用一个工具。先做一次最小、明确的查询，看到结果后再决定是否需要补充检索，避免并行或重复搜索。
7. 默认使用中文。除非用户明确要求，不使用外部网页搜索。`,
    tools: {
      searchNews,
      getNewsArticle,
    },
    stopWhen: isStepCount(5),
    prepareStep: ({ stepNumber, steps }) => {
      if (stepNumber >= 4) {
        return {
          activeTools: [],
          toolChoice: "none",
        };
      }

      const hasSearched = steps.some((step) =>
        step.toolCalls.some((call) => call.toolName === "searchNews"),
      );
      return hasSearched ? { activeTools: ["getNewsArticle"] } : undefined;
    },
    temperature: 0.3,
    maxOutputTokens: 1_800,
    providerOptions: {
      openai: {
        parallelToolCalls: false,
      },
    },
  });
}
