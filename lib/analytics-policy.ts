const PUBLIC_PATHS = new Set(["/chat", "/pricing", "/privacy"]);

const ORIGIN = "https://lumina-news-agent.vercel.app";
type Visit = { type: "pageview" | "event"; url: string };
export function analyticsAllowed(location: { origin: string }, preferences: { doNotTrack?: string | null; globalPrivacyControl?: boolean }) {
  return location.origin === ORIGIN && preferences.doNotTrack !== "1" && preferences.globalPrivacyControl !== true;
}
export function sanitizePageview(event: Visit): Visit | null {
  if (event.type !== "pageview") return null;
  try {
    const url = new URL(event.url);
    if (url.origin !== ORIGIN || !(PUBLIC_PATHS.has(url.pathname))) return null;
    url.search = "";
    url.hash = "";
    return { type: "pageview", url: url.href };
  } catch { return null; }
}
