import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Pre-launch gate: immigrei.com shows only the coming-soon landing while the
// team keeps iterating on immigrei.vercel.app. Remove this block at launch.
const GATED_HOSTS = new Set(["immigrei.com", "www.immigrei.com"]);

const isPublicRoute = createRouteMatcher([
  "/",
  "/em-breve(.*)",
  "/planos",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/vistos(.*)",
  "/onboarding(.*)",
  // API routes authenticate themselves (CRON_SECRET or Clerk auth() in the
  // handler). auth.protect() returns an HTML 404 for unauthenticated API
  // calls, which blocks Vercel Cron and breaks JSON error responses.
  "/api(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  const host = req.headers.get("host")?.toLowerCase().split(":")[0] ?? "";
  if (GATED_HOSTS.has(host)) {
    const { pathname } = req.nextUrl;
    // Waitlist API and landing assets (e.g. opengraph-image) must work on
    // the gated host; everything else → landing.
    if (!pathname.startsWith("/em-breve") && pathname !== "/api/waitlist") {
      const url = req.nextUrl.clone();
      url.pathname = "/em-breve";
      return NextResponse.rewrite(url);
    }
    return NextResponse.next();
  }

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
