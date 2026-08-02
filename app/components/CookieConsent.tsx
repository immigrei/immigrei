"use client";

import { useEffect, useState } from "react";
import posthog from "posthog-js";

// PostHog inits with opt_out_capturing_by_default: true (instrumentation-
// client.ts), so has_opted_out_capturing() is already true from that
// default alone — it can't tell "never asked" apart from "user declined".
// Tracking the actual decision ourselves instead.
const CONSENT_KEY = "immigrei_cookie_consent";

/**
 * Cookie consent banner. PostHog captures nothing until the user picks
 * "Aceitar" here. The choice persists in localStorage, so this only asks
 * once per browser.
 */
export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Only readable after mount (SSR has no localStorage), and only ever
    // set once here.
    if (!localStorage.getItem(CONSENT_KEY)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setVisible(true);
    }
  }, []);

  function aceitar() {
    localStorage.setItem(CONSENT_KEY, "accepted");
    posthog.opt_in_capturing();
    setVisible(false);
  }

  function recusar() {
    localStorage.setItem(CONSENT_KEY, "declined");
    posthog.opt_out_capturing();
    setVisible(false);
  }

  if (!visible) return null;

  return (
    // z-[60] + the cookie-consent-banner offset in globals.css: on
    // authenticated pages BottomNav.tsx is also fixed bottom-0 z-50 — without
    // both, this banner (later in the DOM, same layer) paints over the nav
    // and blocks every tab until the user picks Aceitar/Recusar.
    <div className="cookie-consent-banner fixed bottom-0 inset-x-0 z-[60] bg-cream-2 border-t border-pine-tint px-4 py-4 sm:px-6 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] transition-[bottom]">
      <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6">
        <p className="text-ink-soft text-sm leading-relaxed flex-1">
          Usamos um cookie de analytics para entender como as pessoas usam a immigrei — nada de publicidade, nunca vendemos esse dado. Veja nossa{" "}
          <a href="/privacidade" className="text-pine underline underline-offset-4">
            Política de Privacidade
          </a>
          .
        </p>
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={recusar}
            className="px-4 py-2 rounded-xl border border-pine-tint text-ink-soft text-sm font-semibold hover:bg-pine-tint transition-colors"
          >
            Recusar
          </button>
          <button
            onClick={aceitar}
            className="px-4 py-2 rounded-xl bg-pine text-cream font-semibold text-sm hover:bg-pine-deep transition-colors"
          >
            Aceitar
          </button>
        </div>
      </div>
    </div>
  );
}
