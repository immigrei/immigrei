import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/em-breve(.*)",
  "/nossa-historia(.*)",
  "/termos",
  "/privacidade",
  "/sitemap.xml",
  "/robots.txt",
  "/planos",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/onboarding(.*)",
  // SEVP school directory: public government data, acquisition/SEO surface.
  "/escolas(.*)",
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
