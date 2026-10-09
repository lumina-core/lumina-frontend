"use client";

import { useSyncExternalStore } from "react";
import { Analytics } from "@vercel/analytics/next";
import { analyticsAllowed, sanitizePageview } from "@/lib/analytics-policy";

const subscribe = () => () => {};
const getServerSnapshot = () => false;
const getSnapshot = () => analyticsAllowed(window.location, navigator);

export function PrivacyAnalytics() {
  const enabled = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return enabled ? <Analytics mode="production" beforeSend={event =>
    analyticsAllowed(window.location, navigator) ? sanitizePageview(event) : null
  } /> : null;
}
