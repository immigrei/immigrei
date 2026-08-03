import type { Metadata } from "next";
import Link from "next/link";
import Logo from "../../components/Logo";
import Footer from "../../components/Footer";
import LanguageToggle from "../../components/LanguageToggle";

export const metadata: Metadata = {
  metadataBase: new URL("https://immigrei.com"),
  title: "Privacy Policy — immigrei",
  description: "How immigrei collects, uses, and protects your data.",
  alternates: {
    canonical: "/privacidade/en",
    languages: { "pt-BR": "/privacidade", en: "/privacidade/en" },
  },
};

// English mirror of /privacidade, kept in sync by hand — see that file for
// the canonical Portuguese source. This version exists for anyone reviewing
// our compliance (e.g. USCIS) who doesn't read Portuguese; the marketing
// site itself stays PT-BR only.
const LAST_UPDATED = "July 31, 2026";

const sections: { title: string; body: string[] }[] = [
  {
    title: "1. What we collect",
    body: [
      "Account data: name and email, via our authentication provider.",
      "Your case data: the immigration information YOU choose to enter (entry dates, receipt numbers, I-94, SEVIS, etc.). You control what you enter.",
      "Waitlist: email and, if you choose to share it, where you are in your journey.",
      "Minimal technical usage data (access logs) for security and operations.",
    ],
  },
  {
    title: "2. What we use it for",
    body: [
      "To operate the service: showing your journey, validating technical requirements, sending the alerts you've turned on (case changes, visa bulletin, consulates).",
      "We never use your data for third-party advertising and we never sell your data. Period.",
    ],
  },
  {
    title: "3. Who we share it with",
    body: [
      "Only with the processors necessary for the service to work: our authentication provider, our database and hosting infrastructure, our payment processor (immigrei never sees or stores your card), our email delivery service, and product analytics and technical error-monitoring tools. All under contract and market-standard security practices.",
      "We do not voluntarily share your data with any government authority. Only a valid, binding court order could compel us to — in that case, where the law allows, we will notify you before any response.",
      "If you choose to be connected with a partner professional, we will share with them only what you expressly authorize at that moment.",
    ],
  },
  {
    title: "4. Cookies and tracking",
    body: [
      "We use essential cookies to keep you signed in and an analytics cookie to understand how people use the product — we don't use advertising cookies and we don't sell that data to anyone. The first time you visit immigrei, a banner asks for your consent before any non-essential cookie is activated.",
    ],
  },
  {
    title: "5. Security",
    body: [
      "Your data travels encrypted in transit (TLS) and is stored encrypted at rest. Database access is protected by per-user access rules (RLS) — each user can only access their own data.",
    ],
  },
  {
    title: "6. International data transfer",
    body: [
      "Your data is stored in the United States (AWS infrastructure, Northern Virginia region) and processed by the partners listed above, most of which are also U.S.-based. This means that regardless of where you are, your data does not leave the United States.",
    ],
  },
  {
    title: "7. Retention and deletion",
    body: [
      "We keep your data for as long as your account exists. If your account is inactive for more than 24 months, we may automatically delete non-essential data, notifying you by email beforehand.",
      "You can request full deletion at any time via the email below — we remove your data from our systems within 30 days, except for what the law requires us to retain (e.g., payment tax records).",
    ],
  },
  {
    title: "8. Your rights and the legal basis for each use",
    body: [
      "You can access, correct, export, or delete your data. We honor the rights provided under Brazil's LGPD and applicable U.S. privacy laws, including the California Consumer Privacy Act (CCPA) for California residents. Just write to our contact email.",
      "Each use we make of your data has a legal basis: operating your account and showing your journey (contract performance), billing your subscription (contract performance), sending the alerts you've turned on (contract performance/consent), keeping security logs (legal obligation/legitimate interest), and product analytics (legitimate interest, always with the option to request deletion).",
    ],
  },
  {
    title: "9. If there's a data breach",
    body: [
      "If we identify a security incident that exposes your personal data, we will notify you by email as soon as possible, explaining what happened, which data was affected, and what to do about it. We will also comply with any applicable legal notification obligation.",
    ],
  },
  {
    title: "10. If immigrei changes ownership",
    body: [
      "If immigrei is sold, merged, or ceases operations, your data may be transferred as part of that process. We will notify you before that happens, and the new company (if any) will need to follow a privacy policy at least as protective as this one — or give you the option to export or delete your data before the transfer.",
    ],
  },
  {
    title: "11. Children",
    body: ["immigrei is not intended for users under 18 years of age."],
  },
  {
    title: "12. Changes to this policy",
    body: [
      "If we change this policy in a meaningful way, we will ask for your active consent before you continue using immigrei — not just a passive notice. Along with the request, we'll show a plain-language summary of what changed, so you don't have to re-read the whole document.",
    ],
  },
  {
    title: "13. Contact",
    body: ["Questions about this policy: ola@immigrei.com."],
  },
];

export default function PrivacidadeEnPage() {
  return (
    <main className="min-h-screen bg-cream">
      <header className="flex items-center justify-between px-6 py-6 max-w-3xl mx-auto">
        <Link href="/" aria-label="immigrei — home">
          <Logo variant="lockup" className="text-4xl" />
        </Link>
        <LanguageToggle ptHref="/privacidade" enHref="/privacidade/en" lang="en" />
      </header>
      <article className="max-w-2xl mx-auto px-6 pb-20">
        <h1
          className="text-3xl md:text-4xl font-semibold text-ink mb-2"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Privacy Policy
        </h1>
        <p className="text-ink-faint text-sm mb-1">
          Last updated: {LAST_UPDATED}
        </p>
        <p className="text-ink-faint text-sm mb-6">
          immigrei is operated by Hash Vantage Group LLC.
        </p>
        <p className="text-ink-soft text-base leading-relaxed mb-10">
          We know immigration data is sensitive — for many of us, it&apos;s the
          most sensitive thing there is. This policy is short and free of
          legalese on purpose: you deserve to understand exactly what
          happens with your data.
        </p>
        {sections.map((s) => (
          <section key={s.title} className="mb-8">
            <h2 className="text-ink font-bold text-lg mb-3">{s.title}</h2>
            {s.body.map((p) => (
              <p key={p.slice(0, 40)} className="text-ink-soft text-base leading-relaxed mb-3">
                {p}
              </p>
            ))}
          </section>
        ))}
        <p className="text-ink-faint text-sm mt-10">
          See also our{" "}
          <Link href="/termos/en" className="text-pine underline underline-offset-4">
            Terms of Use
          </Link>
          .
        </p>
      </article>
      <Footer lang="en" />
    </main>
  );
}
