// Next.js's own instrumentation hook — runs once per server/edge runtime
// startup, before any route handler. Loads the matching Sentry init.
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

export const onRequestError = (
  ...args: Parameters<typeof import("@sentry/nextjs").captureRequestError>
) => import("@sentry/nextjs").then(({ captureRequestError }) => captureRequestError(...args));
