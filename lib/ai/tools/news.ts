import { tool } from "ai";
import { Agent as HttpAgent, request as httpRequest } from "node:http";
import { Agent as HttpsAgent, request as httpsRequest } from "node:https";
import { z } from "zod";

const DATA_HUB_URL =
  process.env.DATA_HUB_URL || "https://www.lumina-core.cn";
const RETRYABLE_STATUS = new Set([429, 502, 503, 504]);
const httpAgent = new HttpAgent({ keepAlive: true, maxSockets: 16 });
const httpsAgent = new HttpsAgent({
  keepAlive: true,
  maxSockets: 16,
  minVersion: "TLSv1.3",
});

function getApiKey() {
  const apiKey = process.env.DATA_HUB_API_KEY;
  if (!apiKey) {
    throw new Error("DATA_HUB_API_KEY is not configured");
  }
  return apiKey;
}

type DataHubResponse = {
  status: number;
  body: string;
};

function requestDataHub(
  path: string,
  init?: { method?: string; body?: string },
): Promise<DataHubResponse> {
  const url = new URL(path, DATA_HUB_URL);
  const secure = url.protocol === "https:";
  const body = init?.body;

  return new Promise((resolve, reject) => {
    const request = (secure ? httpsRequest : httpRequest)(
      url,
      {
        method: init?.method ?? "GET",
        agent: secure ? httpsAgent : httpAgent,
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": getApiKey(),
          ...(body
            ? { "Content-Length": Buffer.byteLength(body).toString() }
            : {}),
        },
        signal: AbortSignal.timeout(12_000),
        // Some cross-border handshakes to this origin are reset after SNI is
        // sent. Caddy serves the same valid certificate as its default; Node
        // still verifies both the certificate chain and URL hostname.
        ...(secure && url.hostname === "www.lumina-core.cn"
          ? { servername: "" }
          : {}),
      },
      (response) => {
        const chunks: Buffer[] = [];
        let bytes = 0;

        response.on("data", (chunk: Buffer) => {
          bytes += chunk.length;
          if (bytes > 2 * 1024 * 1024) {
            response.destroy(new Error("data-hub response is too large"));
            return;
          }
          chunks.push(chunk);
        });
        response.on("error", reject);
        response.on("end", () => {
          resolve({
            status: response.statusCode ?? 502,
            body: Buffer.concat(chunks).toString("utf8"),
          });
        });
      },
    );

    request.on("error", reject);
    request.end(body);
  });
}

async function dataHubFetch(
  path: string,
  init?: { method?: string; body?: string },
) {
  let lastError: unknown;

  for (let attempt = 0; attempt < 2; attempt += 1) {
    let response: DataHubResponse;

    try {
      response = await requestDataHub(path, init);
    } catch (error) {
      lastError = error;
      if (attempt === 1) {
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, 400));
      continue;
    }

    if (response.status >= 200 && response.status < 300) {
      return JSON.parse(response.body);
    }

    const error = new Error(
      `data-hub ${response.status}: ${response.body.slice(0, 300)}`,
    );
    if (!RETRYABLE_STATUS.has(response.status) || attempt === 1) {
      throw error;
    }
    lastError = error;

    await new Promise((resolve) => setTimeout(resolve, 400));
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("data-hub request failed");
}

const searchInput = z
  .object({
    all: z.array(z.string().min(1)).max(5).optional().describe("必须全部命中的关键词"),
    any: z.array(z.string().min(1)).max(5).optional().describe("命中任意一个即可的关键词"),
    phrase: z.string().min(1).optional().describe("需要按原样匹配的完整短语"),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    groupBy: z.enum(["year", "month", "day"]).optional().describe("按时间聚合，用于趋势分析"),
    limit: z.number().int().min(1).max(12).default(8),
  })
  .refine(
    ({ all, any, phrase }) => Boolean(all?.length || any?.length || phrase),
    "all、any、phrase 至少提供一个",
  );

export const searchNews = tool({
  description:
    "检索央视《新闻联播》中文全文库（2016年至今）。支持多关键词 AND/OR、精确短语、日期过滤和按年/月/日聚合。聚合结果会同时返回匹配文章样本及 ID；不要重复聚合，直接用 getNewsArticle 读取样本正文。",
  inputSchema: searchInput,
  execute: async ({ all, any, phrase, startDate, endDate, groupBy, limit }) => {
    const body = {
      all: all ?? [],
      any: any ?? [],
      phrase,
      start_date: startDate,
      end_date: endDate,
      group_by: groupBy,
      fields: groupBy ? undefined : ["id", "news_date", "title", "url"],
      order_by: "news_date",
      order_dir: "desc",
      limit,
    };

    if (groupBy) {
      const [data, samples] = await Promise.all([
        dataHubFetch("/v1/news/search", {
          method: "POST",
          body: JSON.stringify(body),
        }),
        dataHubFetch("/v1/news/search", {
          method: "POST",
          body: JSON.stringify({
            ...body,
            group_by: undefined,
            fields: ["id", "news_date", "title", "url"],
            limit: Math.min(limit, 6),
          }),
        }),
      ]);

      return {
        groupBy: data.group_by,
        total: data.total,
        buckets: data.buckets,
        sampleItems: (samples.items ?? []).map(
          (item: Record<string, unknown>) => ({
            id: item.id,
            date: item.news_date,
            title: item.title,
            url: item.url,
            snippet: item.snippet,
          }),
        ),
      };
    }

    const data = await dataHubFetch("/v1/news/search", {
      method: "POST",
      body: JSON.stringify(body),
    });

    return {
      total: data.total,
      items: (data.items ?? []).map((item: Record<string, unknown>) => ({
        id: item.id,
        date: item.news_date,
        title: item.title,
        url: item.url,
        snippet: item.snippet,
      })),
    };
  },
});

export const getNewsArticle = tool({
  description:
    "按搜索结果中的文章 ID 读取一条《新闻联播》完整文稿。只有在需要核对原文、提炼细节或准确引用时调用。",
  inputSchema: z.object({
    id: z.number().int().positive(),
  }),
  execute: async ({ id }) => {
    const item = await dataHubFetch(`/v1/news/${id}`);
    const content = typeof item.content === "string" ? item.content : "";

    return {
      id: item.id,
      date: item.news_date,
      title: item.title,
      url: item.url,
      content: content.slice(0, 12_000),
      truncated: content.length > 12_000,
    };
  },
});
