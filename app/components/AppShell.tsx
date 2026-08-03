"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import BottomNav from "./BottomNav";
import HeaderUserButton from "./HeaderUserButton";
import Logo from "./Logo";
import SearchFab from "./SearchFab";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();

  // Lets the cookie banner (CookieConsent.tsx, in the root layout) know a
  // fixed bottom-0 BottomNav is also on screen, so it can offset itself
  // above the nav instead of covering it — see the `has-bottom-nav` rule
  // in globals.css.
  useEffect(() => {
    document.body.classList.add("has-bottom-nav");
    return () => document.body.classList.remove("has-bottom-nav");
  }, []);

  // Onboarding CTAs that send a signed-out user to a specific destination
  // (saveProfileAndGoTo's "documentos"/"profissionais" destinos) pass that
  // destination as Clerk's redirect_url, so sign-up drops them straight
  // there instead of back on /onboarding — which is the only place that
  // used to flush the profile stashed in localStorage during the 401. That
  // left the profile (and onboarding_completed) never saved, so /dashboard
  // bounced them back to /onboarding on the next visit. AppShell renders on
  // every authenticated page those destinations can land on, so it's the
  // one place that reliably catches the flush no matter where sign-up sent
  // the user.
  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    const pending = localStorage.getItem("immigrei_pending_profile");
    if (!pending) return;
    fetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: pending,
    })
      .then((res) => {
        if (res.ok) {
          localStorage.removeItem("immigrei_pending_profile");
          // The server components on this page (dashboard/painel) already
          // rendered with the pre-save profile — refresh so they re-fetch
          // and show the journey that was just persisted, instead of the
          // stale one until the next manual reload.
          router.refresh();
        }
      })
      .catch(() => {
        // next mount (this page or another AppShell page) tries again
      });
  }, [isLoaded, isSignedIn, router]);

  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <header className="flex items-center justify-between px-6 py-4 bg-cream-2 border-b border-pine-tint sticky top-0 z-40">
        {/* AppShell only renders behind auth (every page using it redirects
            signed-out visitors to /sign-in first), so the logo can always
            point straight at the logged-in home. */}
        <Link href="/dashboard">
          <Logo variant="wordmark" className="text-2xl" />
        </Link>
        <HeaderUserButton />
      </header>

      <main className="flex-1 pb-28">
        {children}
      </main>

      <SearchFab />
      <BottomNav />
    </div>
  );
}
