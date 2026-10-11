import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import {
  parseOriginJson,
  requestLuminaOrigin,
} from "@/lib/server/lumina-origin";

export const runtime = "nodejs";
export const maxDuration = 30;

const SESSION_COOKIE = "lumina_session";
const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

type RouteContext = { params: Promise<{ path: string[] }> };

// Next has already decoded each catch-all segment. Accept only the alphabet
// used by route names, UUID/legacy numeric IDs and URL-safe share tokens. In
// particular, never re-decode residual '%' or let URL normalization cross scopes.
function targetPath(parts: string[]) {
  if (!parts.length || parts.some((part) => !/^[A-Za-z0-9_-]+$/.test(part))) {
    return null;
  }
  const [scope, ...rest] = parts;
  const prefix: Record<string, string> = {
    auth: "/portal",
    credits: "/lumina/credits",
    invites: "/lumina/invites",
    history: "/lumina/history",
  };
  if (!Object.hasOwn(prefix, scope)) return null;
  const target = prefix[scope] + (rest.length ? `/${rest.join("/")}` : "");
  const normalized = new URL(target, "http://bff.invalid").pathname;
  return normalized === target ? normalized : null;
}

// Match the FINAL canonical upstream path, not just the first browser segment.
// Auth intentionally excludes the private Data Hub keys/usage/admin surfaces.
const ROUTES: [RegExp, string[]][] = [
  [/^\/portal\/(send-code|register|login|logout|change-password|forgot-password|reset-password)$/, ["POST"]],
  [/^\/portal\/me$/, ["GET", "HEAD", "PATCH"]],
  [/^\/lumina\/credits\/balance$/, ["GET", "HEAD"]],
  [/^\/lumina\/credits\/checkin$/, ["POST"]],
  [/^\/lumina\/invites(?:\/(?:me|stats))?$/, ["GET", "HEAD"]],
  [/^\/lumina\/history$/, ["GET", "HEAD", "POST"]],
  [/^\/lumina\/history\/shared\/[A-Za-z0-9_-]+$/, ["GET", "HEAD"]],
  [/^\/lumina\/history\/[A-Za-z0-9_-]+$/, ["GET", "HEAD", "PATCH", "DELETE"]],
  [/^\/lumina\/history\/[A-Za-z0-9_-]+\/messages$/, ["GET", "HEAD", "POST"]],
  [/^\/lumina\/history\/[A-Za-z0-9_-]+\/share$/, ["POST", "DELETE"]],
];

function sameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    return new URL(origin).host === request.nextUrl.host;
  } catch {
    return false;
  }
}

function withClearedSession(response: NextResponse) {
  response.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}

async function handler(request: NextRequest, context: RouteContext) {
  if (MUTATING_METHODS.has(request.method) && !sameOrigin(request)) {
    return NextResponse.json({ detail: "请求来源校验失败" }, { status: 403 });
  }

  const { path } = await context.params;
  const target = targetPath(path);
  const allowed = target && ROUTES.find(([pattern]) => pattern.test(target));
  if (!allowed) {
    return NextResponse.json({ detail: "接口不存在" }, { status: 404 });
  }
  if (!allowed[1].includes(request.method)) {
    return NextResponse.json({ detail: "请求方法不支持" }, {
      status: 405, headers: { Allow: allowed[1].join(", ") },
    });
  }
  if (target === "/portal/logout") {
    return withClearedSession(
      NextResponse.json({ success: true, message: "已退出登录" }),
    );
  }

  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE)?.value;
  const body = ["GET", "HEAD"].includes(request.method)
    ? undefined
    : await request.text();
  const forwardedHeaders = Object.fromEntries(
    [
      "x-vercel-forwarded-for",
      "x-real-ip",
      "x-vercel-ja4-digest",
      "user-agent",
    ]
      .map((key) => [key, request.headers.get(key)] as const)
      .filter((entry): entry is readonly [string, string] => Boolean(entry[1])),
  );

  try {
    const response = await requestLuminaOrigin(
      `${target}${request.nextUrl.search}`,
      {
        method: request.method,
        body,
        // Generic mutations (messages, registration, sharing) do not carry an
        // idempotency key. An ambiguous response must not repeat their writes.
        // Credit reserve/settle/cancel use a separate idempotent transport.
        retry: !MUTATING_METHODS.has(request.method),
        headers: {
          ...forwardedHeaders,
          ...(sessionToken
            ? { Authorization: `Bearer ${sessionToken}` }
            : {}),
        },
      },
    );
    const payload = parseOriginJson(response);
    const isSessionStart =
      path[0] === "auth" &&
      ["login", "register"].includes(path[1] ?? "") &&
      response.status >= 200 &&
      response.status < 300;

    if (isSessionStart && typeof payload === "object" && payload !== null) {
      const authPayload = payload as Record<string, unknown>;
      const accessToken = authPayload.access_token;
      if (typeof accessToken !== "string") {
        return NextResponse.json(
          { detail: "账户服务未返回会话" },
          { status: 502 },
        );
      }
      const expiresIn =
        typeof authPayload.expires_in === "number"
          ? authPayload.expires_in
          : 7 * 24 * 60 * 60;
      const publicPayload = { ...authPayload };
      delete publicPayload.access_token;
      const nextResponse = NextResponse.json(publicPayload, {
        status: response.status,
      });
      nextResponse.cookies.set(SESSION_COOKIE, accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: expiresIn,
      });
      return nextResponse;
    }

    const nextResponse = NextResponse.json(payload, { status: response.status });
    return response.status === 401
      ? withClearedSession(nextResponse)
      : nextResponse;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "账户服务暂时不可用";
    return NextResponse.json({ detail: message }, { status: 502 });
  }
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
