import { Agent as HttpAgent, request as httpRequest } from "node:http";
import { Agent as HttpsAgent, request as httpsRequest } from "node:https";

const LUMINA_CONTROL_URL =
  process.env.LUMINA_CONTROL_URL || "https://www.lumina-core.cn";
const RETRYABLE_STATUS = new Set([429, 502, 503, 504]);
const httpAgent = new HttpAgent({ keepAlive: true, maxSockets: 16 });
const httpsAgent = new HttpsAgent({
  keepAlive: true,
  maxSockets: 16,
  minVersion: "TLSv1.3",
});

export type LuminaOriginResponse = {
  status: number;
  body: string;
  headers: Record<string, string>;
};

type OriginRequestInit = {
  method?: string;
  body?: string;
  headers?: Record<string, string>;
  retry?: boolean;
};

function requestOnce(
  path: string,
  init: OriginRequestInit,
): Promise<LuminaOriginResponse> {
  const url = new URL(path, LUMINA_CONTROL_URL);
  const secure = url.protocol === "https:";
  const body = init.body;

  return new Promise((resolve, reject) => {
    const request = (secure ? httpsRequest : httpRequest)(
      url,
      {
        method: init.method ?? "GET",
        agent: secure ? httpsAgent : httpAgent,
        headers: {
          Accept: "application/json",
          ...(body ? { "Content-Type": "application/json" } : {}),
          ...(body
            ? { "Content-Length": Buffer.byteLength(body).toString() }
            : {}),
          ...init.headers,
        },
        signal: AbortSignal.timeout(12_000),
        // 该源站的跨境 TLS 链路发送 SNI 时偶发被重置。Caddy 的
        // default_sni 提供同一张有效证书；Node 仍校验证书链和 URL 主机名。
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
            response.destroy(new Error("Lumina control response is too large"));
            return;
          }
          chunks.push(chunk);
        });
        response.on("error", reject);
        response.on("end", () => {
          const headers = Object.fromEntries(
            Object.entries(response.headers)
              .filter((entry): entry is [string, string | string[]] =>
                Boolean(entry[1]),
              )
              .map(([key, value]) => [
                key,
                Array.isArray(value) ? value.join(", ") : value,
              ]),
          );
          resolve({
            status: response.statusCode ?? 502,
            body: Buffer.concat(chunks).toString("utf8"),
            headers,
          });
        });
      },
    );
    request.on("error", reject);
    request.end(body);
  });
}

export async function requestLuminaOrigin(
  path: string,
  init: OriginRequestInit = {},
): Promise<LuminaOriginResponse> {
  let lastError: unknown;

  const maxAttempts = init.retry === false ? 1 : 2;
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    try {
      const response = await requestOnce(path, init);
      if (!RETRYABLE_STATUS.has(response.status) || attempt === maxAttempts - 1) {
        return response;
      }
      lastError = new Error(`Lumina control returned ${response.status}`);
    } catch (error) {
      lastError = error;
      if (attempt === maxAttempts - 1) throw error;
    }
    await new Promise((resolve) => setTimeout(resolve, 400));
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("Lumina control request failed");
}

export function parseOriginJson(response: LuminaOriginResponse): unknown {
  if (!response.body) return null;
  try {
    return JSON.parse(response.body);
  } catch {
    return { detail: response.body.slice(0, 500) || "上游服务响应异常" };
  }
}
