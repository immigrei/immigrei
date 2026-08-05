import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/em-breve(.*)",
  "/nossa-historia(.*)",
  "/termos",
  "/privacidade",
  "/seguranca",
  "/suporte",
  "/sitemap.xml",
  "/robots.txt",
  "/planos",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/onboarding(.*)",
  // SEVP school directory: public government data, acquisition/SEO surface.
  "/escolas(.*)",
  // Visa education catalog: public, citation-backed content — same reasoning.
  // The "confirm this path" action inside it already handles a logged-out
  // visitor gracefully (see ConfirmBar.tsx: 401 -> stash -> /sign-up).
  "/vistos(.*)",
  // US integration guides (SSN, DMV, credit, ACA, ITIN, LLC): same reasoning
  // as /vistos — public, source-linked editorial content, an SEO/GEO surface.
  // Scoped to this one subpath only; /documentos/cofre and /documentos/custos
  // stay behind auth.protect() as normal — do not widen this to /documentos(.*).
  "/documentos/guias(.*)",
  // API routes authenticate themselves (CRON_SECRET or Clerk auth() in the
  // handler). auth.protect() returns an HTML 404 for unauthenticated API
  // calls, which blocks Vercel Cron and breaks JSON error responses.
  "/api(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
