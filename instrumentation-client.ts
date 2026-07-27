// Client-side Sentry init — Next.js loads this automatically before any
// other client code runs (App Router convention, no explicit import needed).
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  // Free-tier friendly: sample a slice of normal traffic, not every request.
  tracesSampleRate: 0.1,
  enabled: process.env.NODE_ENV === "production",
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
