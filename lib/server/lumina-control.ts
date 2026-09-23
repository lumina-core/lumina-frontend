import {
  parseOriginJson,
  requestLuminaOrigin,
} from "@/lib/server/lumina-origin";

export type CreditReservation = {
  request_id: string;
  status: string;
  credits_reserved: number;
  credits_remaining: number;
  daily_remaining: number;
};

export type CreditSettlement = {
  request_id: string;
  status: string;
  credits_deducted: number;
  credits_remaining: number;
};

export class LuminaControlError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

function detail(payload: unknown, fallback: string) {
  if (typeof payload === "object" && payload !== null) {
    if ("detail" in payload && typeof payload.detail === "string") {
      return payload.detail;
    }
    if (
      "error" in payload &&
      typeof payload.error === "object" &&
      payload.error !== null &&
      "message" in payload.error &&
      typeof payload.error.message === "string"
    ) {
      return payload.error.message;
    }
  }
  return fallback;
}

async function controlJson<T>(
  path: string,
  init: { body: object; sessionToken?: string; internal?: boolean },
): Promise<T> {
  const internalKey = process.env.LUMINA_INTERNAL_KEY;
  if (init.internal && !internalKey) {
    throw new Error("LUMINA_INTERNAL_KEY is not configured");
  }
  const response = await requestLuminaOrigin(path, {
    method: "POST",
    body: JSON.stringify(init.body),
    headers: {
      ...(init.sessionToken
        ? { Authorization: `Bearer ${init.sessionToken}` }
        : {}),
      ...(init.internal && internalKey
        ? { "X-Lumina-Internal-Key": internalKey }
        : {}),
    },
  });
  const payload = parseOriginJson(response);
  if (response.status < 200 || response.status >= 300) {
    throw new LuminaControlError(
      detail(payload, `账户服务返回 ${response.status}`),
      response.status,
    );
  }
  return payload as T;
}

export function reserveCredits(sessionToken: string, requestId: string) {
  return controlJson<CreditReservation>("/lumina/usage/reserve", {
    body: { request_id: requestId },
    sessionToken,
  });
}

export function settleCredits(
  requestId: string,
  inputTokens: number,
  outputTokens: number,
  model: string,
) {
  return controlJson<CreditSettlement>("/lumina/usage/settle", {
    body: {
      request_id: requestId,
      input_tokens: inputTokens,
      output_tokens: outputTokens,
      model,
    },
    internal: true,
  });
}

export function cancelCredits(requestId: string, error: string) {
  return controlJson<CreditSettlement>("/lumina/usage/cancel", {
    body: { request_id: requestId, error: error.slice(0, 500) },
    internal: true,
  });
}
