import type { NextConfig } from "next";

// Clerk's own JS bundle, XHR calls and (for social login / bot-check) iframes
// all come from the account's Frontend API domain — a per-project
// *.clerk.accounts.dev subdomain in dev, and *.clerk.com for the account
// portal in prod. Stripe checkout is a full-page redirect (window.location,
// see app/planos/PlanButton.tsx) so no Stripe domain needs script/frame
// access. next/font self-hosts Fraunces/Hanken Grotesk at build time, so no
// Google Fonts domain is needed either.
//
// 'unsafe-inline' on script-src is required in both dev and prod (verified
// against a real `next build && next start` run) — Clerk's bootstrap needs
// it. 'unsafe-eval' is dev-only: Turbopack's React Server DOM runtime evals
// during HMR (~30 eval violations logged in dev), but a production build
// hits zero CSP violations without it — confirmed by running the app end to
// end (sign-in, onboarding, planos, escolas, gated-route redirects) against
// a strict prod build before landing this.
const isDev = process.env.NODE_ENV !== "production";
const CSP = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://*.clerk.accounts.dev https://*.clerk.com https://challenges.cloudflare.com`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https://img.clerk.com https://images.clerk.dev",
  "font-src 'self' data:",
  "connect-src 'self' https://*.clerk.accounts.dev https://*.clerk.com https://clerk-telemetry.com",
  "frame-src 'self' https://*.clerk.accounts.dev https://*.clerk.com https://challenges.cloudflare.com",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
  "upgrade-insecure-requests",
].join("; ");

const nextConfig: NextConfig = {
  // The form-export route reads the official PDF assets from public/forms via
  // fs at runtime. The path is dynamic, so Next's output tracing can't infer
  // it — include the assets explicitly so they ship with the serverless
  // function on Vercel (works locally without this; fails in prod without it).
  outputFileTracingIncludes: {
    "/api/forms/[formId]/export": ["./public/forms/**"],
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: CSP },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
