// Client-side Sentry init — Next.js loads this automatically before any
// other client code runs (App Router convention, no explicit import needed).
import * as Sentry from "@sentry/nextjs";
import posthog from "posthog-js";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  // Free-tier friendly: sample a slice of normal traffic, not every request.
  tracesSampleRate: 0.1,
  enabled: process.env.NODE_ENV === "production",
});

posthog.init(process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN!, {
  api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
  defaults: "2026-05-30",
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
