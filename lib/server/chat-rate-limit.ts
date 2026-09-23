const WINDOW_MS = 10 * 60 * 1_000;
const MAX_REQUESTS = 12;

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const entries = new Map<string, RateLimitEntry>();

function getClientId(request: Request) {
  const forwarded =
    request.headers.get("x-vercel-forwarded-for") ??
    request.headers.get("x-forwarded-for") ??
    "anonymous";
  return forwarded.split(",")[0]?.trim() || "anonymous";
}

export function checkChatRateLimit(request: Request) {
  const now = Date.now();
  const clientId = getClientId(request);
  const existing = entries.get(clientId);
  const entry =
    existing && existing.resetAt > now
      ? existing
      : { count: 0, resetAt: now + WINDOW_MS };

  entry.count += 1;
  entries.set(clientId, entry);

  if (entries.size > 1_000) {
    for (const [key, value] of entries) {
      if (value.resetAt <= now) entries.delete(key);
    }
  }

  if (entry.count <= MAX_REQUESTS) return null;

  const retryAfter = Math.max(1, Math.ceil((entry.resetAt - now) / 1_000));
  return Response.json(
    { detail: "请求有点频繁，请稍后再试" },
    {
      status: 429,
      headers: { "Retry-After": retryAfter.toString() },
    },
  );
}
