import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The form-export route reads the official PDF assets from public/forms via
  // fs at runtime. The path is dynamic, so Next's output tracing can't infer
  // it — include the assets explicitly so they ship with the serverless
  // function on Vercel (works locally without this; fails in prod without it).
  outputFileTracingIncludes: {
    "/api/forms/[formId]/export": ["./public/forms/**"],
  },
};

export default nextConfig;
