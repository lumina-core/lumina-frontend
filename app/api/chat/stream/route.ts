export async function POST(request: Request) {
  const body = await request.json();
  const token = request.headers.get("authorization");
  const backendUrl = process.env.BACKEND_URL || "http://localhost:8000";

  const response = await fetch(`${backendUrl}/api/v1/chat/stream`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: token }),
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    return new Response(response.body, {
      status: response.status,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(response.body, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
