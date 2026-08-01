// Client-side Sentry init — Next.js loads this automatically before any
// other client code runs (App Router convention, no explicit import needed).
import * as Sentry from "@sentry/nextjs";
import posthog from "posthog-js";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  // Free-tier friendly: sample a slice of normal traffic, not every request.
  tracesSampleRate: 0.1,
  enabled: process.env.NODE_ENV === "production",
  ignoreErrors: [
    // ClerkJS's session "touch" heartbeat failing on a transient client
    // network blip (offline, flaky connection). Clerk retries this
    // internally and users never notice — not actionable from our code.
    /ClerkJS: Network error/,
  ],
});

// Opted out until the user accepts the cookie banner (CookieConsent.tsx) —
// nothing is captured before that. The choice persists in localStorage
// (see CookieConsent.tsx), not PostHog's own opt-in/out state, which
// can't tell "opted out by this default" apart from "user declined".
posthog.init(process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN!, {
  api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
  defaults: "2026-05-30",
  opt_out_capturing_by_default: true,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
