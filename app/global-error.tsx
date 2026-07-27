"use client";

import * as Sentry from "@sentry/nextjs";
import NextError from "next/error";
import { useEffect } from "react";

// Catches render errors that escape every other error boundary — the only
// place in the App Router where that's possible. Reports to Sentry, then
// falls back to Next's default error page (this component replaces the
// whole document, so it can't reuse our own layout/styles).
export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="pt-BR">
      <body>
        <NextError statusCode={0} />
      </body>
    </html>
  );
}
