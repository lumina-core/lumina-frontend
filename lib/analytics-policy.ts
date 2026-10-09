import { PUBLIC_PATHS } from "./site";
const publicPaths = new Set<string>(PUBLIC_PATHS);

const ORIGIN = "https://lumina-news-agent.vercel.app";
type Visit = { type: "pageview" | "event"; url: string };
export function analyticsAllowed(location: { origin: string }, preferences: { doNotTrack?: string | null; globalPrivacyControl?: boolean }) {
  return location.origin === ORIGIN && preferences.doNotTrack !== "1" && preferences.globalPrivacyControl !== true;
}
export function sanitizePageview(event: Visit): Visit | null {
  if (event.type !== "pageview") return null;
  try {
    const url = new URL(event.url);
    if (url.origin !== ORIGIN || !(publicPaths.has(url.pathname))) return null;
    url.search = "";
    url.hash = "";
    return { type: "pageview", url: url.href };
  } catch { return null; }
}
