import type { Metadata } from "next";
import Link from "next/link";
import Logo from "../../components/Logo";
import Footer from "../../components/Footer";
import LanguageToggle from "../../components/LanguageToggle";

export const metadata: Metadata = {
  metadataBase: new URL("https://immigrei.com"),
  title: "Security — immigrei",
  description: "How immigrei protects your data and your case status.",
  alternates: {
    canonical: "/seguranca/en",
    languages: { "pt-BR": "/seguranca", en: "/seguranca/en" },
  },
};

// English mirror of /seguranca, kept in sync by hand — see that file for
// the canonical Portuguese source.
const sections: { title: string; titleNode?: React.ReactNode; body: string[] }[] = [
  {
    title: "Encryption in transit and at rest",
    body: [
      "All traffic between you and immigrei is encrypted (HTTPS/TLS). Data stored in our database is also encrypted at rest.",
    ],
  },
  {
    title: "Per-user access (Row-Level Security)",
    body: [
      "Each user can only access their own data. This is enforced at the database level (RLS in Supabase), not just in the interface — no query can leak one user's data to another.",
    ],
  },
  {
    title: "Checking status with USCIS",
    body: [
      "When you add a receipt number under \"My Case,\" we officially query USCIS's Case Status API (the Torch program, developer.uscis.gov) via OAuth 2.0. We never simulate or fabricate a status — what you see comes directly from the official source, and we show the date of the last check.",
      "immigrei only queries the status of your own case. We never submit, sign, or file anything on your behalf with USCIS — that remains something between you (or your attorney) and the agency.",
    ],
  },
  {
    title: "Rate limiting",
    body: [
      "To protect USCIS's system and our own, we limit the number of status checks per user within a short period. This is automatic and rarely noticeable in normal use.",
    ],
  },
  {
    title: "Authentication",
    body: [
      "Login is handled by Clerk (social login or email), a specialized authentication provider — immigrei never stores your password directly.",
    ],
  },
  {
    title: "Payments",
    body: [
      "Payments are processed by Stripe. immigrei never sees or stores your card number.",
    ],
  },
  {
    title: "Credential rotation",
    body: [
      "The credentials we use to talk to official systems (like the USCIS API) are rotated periodically and never live in source code — only in protected environment variables.",
    ],
  },
  {
    title: "Found a security bug?",
    body: [
      "If you identify a security issue, write to ola@immigrei.com. We take every report seriously and respond as quickly as possible.",
    ],
  },
];

export default function SegurancaEnPage() {
  return (
    <main className="min-h-screen bg-cream">
      <header className="flex items-center justify-between px-6 py-6 max-w-3xl mx-auto">
        <Link href="/" aria-label="immigrei — home">
          <Logo variant="lockup" className="text-4xl" />
        </Link>
        <LanguageToggle ptHref="/seguranca" enHref="/seguranca/en" lang="en" />
      </header>
      <article className="max-w-2xl mx-auto px-6 pb-20">
        <h1
          className="text-3xl md:text-4xl font-semibold text-ink mb-2"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Security
        </h1>
        <p className="text-ink-soft text-base leading-relaxed mb-10">
          Immigration data is sensitive. Here&apos;s exactly what we do, in
          practice, to protect yours.
        </p>
        {sections.map((s) => (
          <section key={s.title} className="mb-8">
            <h2 className="text-ink font-bold text-lg mb-3">{s.titleNode ?? s.title}</h2>
            {s.body.map((p) => (
              <p key={p.slice(0, 40)} className="text-ink-soft text-base leading-relaxed mb-3">
                {p}
              </p>
            ))}
          </section>
        ))}
        <p className="text-ink-faint text-sm mt-10">
          See also our{" "}
          <Link href="/privacidade/en" className="text-pine underline underline-offset-4">
            Privacy Policy
          </Link>
          .
        </p>
      </article>
      <Footer lang="en" />
    </main>
  );
}
