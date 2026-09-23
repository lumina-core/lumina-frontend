import type { ModelMessage } from "ai";
import { cookies } from "next/headers";
import { createNewsAgent } from "@/lib/ai/news-agent";
import { checkChatRateLimit } from "@/lib/server/chat-rate-limit";
import {
  appendPersistedMessage,
  loadPersistedMessages,
} from "@/lib/server/chat-persistence";
import {
  cancelCredits,
  LuminaControlError,
  reserveCredits,
  settleCredits,
  type CreditReservation,
} from "@/lib/server/lumina-control";
import type { MessagePart, ToolCall } from "@/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const SESSION_COOKIE = "lumina_session";
const MODEL = process.env.OPENROUTER_MODEL || "openai/gpt-5.6-luna";

function encodeEvent(event: Record<string, unknown>) {
  return new TextEncoder().encode(`data: ${JSON.stringify(event)}\n\n`);
}

function summarizeToolOutput(output: unknown) {
  const value = JSON.stringify(output);
  return value.length > 800 ? `${value.slice(0, 800)}…` : value;
}

function toolInput(input: unknown): Record<string, unknown> {
  return typeof input === "object" && input !== null
    ? (input as Record<string, unknown>)
    : {};
}

function appendTextPart(parts: MessagePart[], content: string) {
  const previous = parts.at(-1);
  if (previous?.type === "text") {
    previous.content += content;
  } else {
    parts.push({ type: "text", content });
  }
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const query = typeof body?.query === "string" ? body.query.trim() : "";
  const sessionId =
    typeof body?.session_id === "string" ? body.session_id.trim() : "";
  // Usage IDs are server-owned so a client cannot replay a settled ID to avoid
  // paying for a new analysis.
  const requestId = `lumina:${crypto.randomUUID()}`;

  if (!query) {
    return Response.json({ detail: "请输入问题" }, { status: 400 });
  }
  if (query.length > 2_000) {
    return Response.json({ detail: "问题不能超过 2000 字" }, { status: 400 });
  }
  if (!sessionId || sessionId.length > 64) {
    return Response.json({ detail: "会话标识无效" }, { status: 400 });
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

  let persistedHistory;
  try {
    // Persistence is a precondition for generation: never spend tokens on a
    // conversation that cannot be recovered from the user's history.
    await appendPersistedMessage(sessionToken, sessionId, "user", query);
    persistedHistory = await loadPersistedMessages(sessionToken, sessionId);
  } catch (error) {
    await cancelCredits(
      reservation.request_id,
      error instanceof Error ? error.message : "会话保存失败",
    ).catch((cancelError) =>
      console.error("Lumina credit cancellation failed", cancelError),
    );
    const status = error instanceof LuminaControlError ? error.status : 502;
    const message = error instanceof Error ? error.message : "会话保存失败";
    return Response.json({ detail: message }, { status });
  }

  const messages: ModelMessage[] = persistedHistory.items
    .slice(-13)
    .map((item) => ({ role: item.role, content: item.content }));
  let clientConnected = true;

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let agentCompleted = false;
      let assistantResponse = "";
      const processParts: MessagePart[] = [];
      const runningTools = new Map<string, ToolCall>();
      let usage = {
        input_tokens: 0,
        output_tokens: 0,
        credits_deducted: reservation.credits_reserved,
        credits_remaining: reservation.credits_remaining,
      };

      const send = (event: Record<string, unknown>) => {
        if (!clientConnected) return;
        try {
          controller.enqueue(encodeEvent(event));
        } catch {
          clientConnected = false;
        }
      };

      try {
        // Do not bind generation to the browser's AbortSignal. The server must
        // finish consuming and persist the result even after a refresh/drop.
        const result = await createNewsAgent().stream({ messages });

        for await (const part of result.stream) {
          switch (part.type) {
            case "text-delta":
              assistantResponse += part.text;
              appendTextPart(processParts, part.text);
              send({ type: "token", content: part.text });
              break;
            case "tool-call": {
              const id = part.toolCallId || crypto.randomUUID();
              const toolCall: ToolCall = {
                id,
                name: part.toolName,
                input: toolInput(part.input),
                status: "running",
              };
              runningTools.set(id, toolCall);
              processParts.push({ type: "tool_call", toolCall });
              send({
                type: "tool_start",
                tool_call_id: id,
                name: part.toolName,
                input: part.input,
              });
              break;
            }
            case "tool-result": {
              const id = part.toolCallId;
              const output = summarizeToolOutput(part.output);
              const toolCall = runningTools.get(id);
              if (toolCall) {
                toolCall.status = "completed";
                toolCall.output = output;
                runningTools.delete(id);
              }
              send({
                type: "tool_end",
                tool_call_id: id,
                name: part.toolName,
                output,
              });
              break;
            }
            case "finish": {
              agentCompleted = true;
              usage = {
                ...usage,
                input_tokens: part.totalUsage.inputTokens ?? 0,
                output_tokens: part.totalUsage.outputTokens ?? 0,
              };
              try {
                const settlement = await settleCredits(
                  reservation.request_id,
                  usage.input_tokens,
                  usage.output_tokens,
                  MODEL,
                );
                usage.credits_deducted = settlement.credits_deducted;
                usage.credits_remaining = settlement.credits_remaining;
              } catch (error) {
                console.error("Lumina credit settlement failed", error);
              }

              await appendPersistedMessage(
                sessionToken,
                sessionId,
                "assistant",
                assistantResponse || "分析已完成。",
                JSON.stringify({
                  version: 1,
                  status: "complete",
                  model: MODEL,
                  request_id: reservation.request_id,
                  usage,
                  parts: processParts,
                }),
              );
              send({ type: "usage", ...usage });
              break;
            }
            case "error":
              throw part.error;
          }
        }

        if (!agentCompleted) {
          throw new Error("Agent 未能完成本次分析");
        }
        send({ type: "done" });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Agent 暂时不可用";
        if (!agentCompleted) {
          await cancelCredits(reservation.request_id, message).catch(
            (cancelError) =>
              console.error("Lumina credit cancellation failed", cancelError),
          );
        }

        const errorText = assistantResponse
          ? `${assistantResponse}\n\n抱歉，发生了错误：${message}`
          : `抱歉，发生了错误：${message}`;
        await appendPersistedMessage(
          sessionToken,
          sessionId,
          "assistant",
          errorText,
          JSON.stringify({
            version: 1,
            status: "error",
            model: MODEL,
            request_id: reservation.request_id,
            error: message,
            usage,
            parts: [
              ...processParts,
              { type: "text", content: `\n\n抱歉，发生了错误：${message}` },
            ],
          }),
        ).catch((persistenceError) =>
          console.error("Lumina assistant error persistence failed", persistenceError),
        );
        send({ type: "error", error: message });
      } finally {
        if (clientConnected) {
          try {
            controller.close();
          } catch {
            // The browser may have disconnected while persistence continued.
          }
        }
      }
    },
    cancel() {
      clientConnected = false;
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
