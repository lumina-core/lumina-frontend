import type { ModelMessage } from "ai";
import { cookies } from "next/headers";
import { createNewsAgent } from "@/lib/ai/news-agent";
import { checkChatRateLimit } from "@/lib/server/chat-rate-limit";
import {
  cancelCredits,
  LuminaControlError,
  reserveCredits,
  settleCredits,
  type CreditReservation,
} from "@/lib/server/lumina-control";

export const runtime = "nodejs";
export const maxDuration = 60;

const SESSION_COOKIE = "lumina_session";
const MODEL = process.env.OPENROUTER_MODEL || "openai/gpt-5.6-luna";

type HistoryMessage = {
  role: "user" | "assistant";
  content: string;
};

function encodeEvent(event: Record<string, unknown>) {
  return new TextEncoder().encode(`data: ${JSON.stringify(event)}\n\n`);
}

function summarizeToolOutput(output: unknown) {
  const value = JSON.stringify(output);
  return value.length > 800 ? `${value.slice(0, 800)}…` : value;
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const query = typeof body?.query === "string" ? body.query.trim() : "";
  // Usage IDs are server-owned so a client cannot replay a settled ID to avoid
  // paying for a new analysis.
  const requestId = `lumina:${crypto.randomUUID()}`;

  if (!query) {
    return Response.json({ detail: "请输入问题" }, { status: 400 });
  }
  if (query.length > 2_000) {
    return Response.json({ detail: "问题不能超过 2000 字" }, { status: 400 });
  }

  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE)?.value;
  if (!sessionToken) {
    return Response.json({ detail: "请先登录后再使用" }, { status: 401 });
  }

  const rateLimitResponse = checkChatRateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;

  let reservation: CreditReservation;
  try {
    reservation = await reserveCredits(sessionToken, requestId);
  } catch (error) {
    const status = error instanceof LuminaControlError ? error.status : 502;
    const message =
      error instanceof Error ? error.message : "积分服务暂时不可用";
    return Response.json({ detail: message }, { status });
  }

  const history: HistoryMessage[] = Array.isArray(body?.chat_history)
    ? body.chat_history
        .filter(
          (item: unknown): item is HistoryMessage =>
            typeof item === "object" &&
            item !== null &&
            ["user", "assistant"].includes((item as HistoryMessage).role) &&
            typeof (item as HistoryMessage).content === "string",
        )
        .slice(-12)
    : [];

  const messages: ModelMessage[] = [
    ...history.map((item) => ({ role: item.role, content: item.content })),
    { role: "user", content: query },
  ];

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let agentCompleted = false;
      try {
        const result = await createNewsAgent().stream({
          messages,
          abortSignal: request.signal,
        });

        for await (const part of result.stream) {
          switch (part.type) {
            case "text-delta":
              controller.enqueue(encodeEvent({ type: "token", content: part.text }));
              break;
            case "tool-call":
              controller.enqueue(
                encodeEvent({
                  type: "tool_start",
                  name: part.toolName,
                  input: part.input,
                }),
              );
              break;
            case "tool-result":
              controller.enqueue(
                encodeEvent({
                  type: "tool_end",
                  name: part.toolName,
                  output: summarizeToolOutput(part.output),
                }),
              );
              break;
            case "finish":
              agentCompleted = true;
              let creditUsage: Record<string, number> = {
                credits_deducted: reservation.credits_reserved,
                credits_remaining: reservation.credits_remaining,
              };
              try {
                const settlement = await settleCredits(
                  reservation.request_id,
                  part.totalUsage.inputTokens ?? 0,
                  part.totalUsage.outputTokens ?? 0,
                  MODEL,
                );
                creditUsage = {
                  credits_deducted: settlement.credits_deducted,
                  credits_remaining: settlement.credits_remaining,
                };
              } catch (error) {
                console.error("Lumina credit settlement failed", error);
              }
              controller.enqueue(
                encodeEvent({
                  type: "usage",
                  input_tokens: part.totalUsage.inputTokens ?? 0,
                  output_tokens: part.totalUsage.outputTokens ?? 0,
                  ...creditUsage,
                }),
              );
              break;
            case "error":
              throw part.error;
          }
        }

        controller.enqueue(encodeEvent({ type: "done" }));
      } catch (error) {
        const message = error instanceof Error ? error.message : "Agent 暂时不可用";
        if (!agentCompleted) {
          await cancelCredits(reservation.request_id, message).catch(
            (cancelError) =>
              console.error("Lumina credit cancellation failed", cancelError),
          );
        }
        controller.enqueue(encodeEvent({ type: "error", error: message }));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
