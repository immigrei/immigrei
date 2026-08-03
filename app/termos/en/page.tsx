import type { Metadata } from "next";
import Link from "next/link";
import Logo from "../../components/Logo";
import Footer from "../../components/Footer";
import LanguageToggle from "../../components/LanguageToggle";

export const metadata: Metadata = {
  metadataBase: new URL("https://immigrei.com"),
  title: "Terms of Use — immigrei",
  description: "Terms of use for the immigrei platform.",
  alternates: {
    canonical: "/termos/en",
    languages: { "pt-BR": "/termos", en: "/termos/en" },
  },
};

// English mirror of /termos, kept in sync by hand — see that file for the
// canonical Portuguese source and the section-by-section history. This
// version exists for anyone reviewing our compliance (e.g. USCIS) who
// doesn't read Portuguese; the marketing site itself stays PT-BR only.
const LAST_UPDATED = "July 31, 2026";

const sections: { title: string; body: string[] }[] = [
  {
    title: "1. What immigrei is — and isn't",
    body: [
      "immigrei is a technology platform that organizes public information about U.S. immigration processes: it shows steps, objective requirements, deadlines and documents, and lets you track your case alongside official sources (USCIS, the Department of State, consulates).",
      "immigrei is NOT a law firm, does not provide legal advice, and does not replace guidance from a licensed attorney. The platform never recommends which immigration path you should take, does not evaluate the merits of your case, and does not predict outcomes. Validations shown in the app check only objective technical requirements published by U.S. federal agencies, always citing the official source.",
      "When the app indicates that something \"requires individual analysis,\" that means the question depends on legal judgment — seek a licensed professional. immigrei may connect you to verified independent professionals; they are not employees or representatives of immigrei, and the professional relationship is established directly between you and them.",
      "immigrei is built and operated by a technology team — we do not have attorneys on our board or on our team. We do not, and are not able to, provide legal advice under any circumstances; our work is to organize public information and build the tools for you to use it, nothing more.",
    ],
  },
  {
    title: "2. Your account",
    body: [
      "You are responsible for the accuracy of the information you enter and for keeping access to your account secure. immigrei processes the facts YOU declare; results based on incorrect data will be incorrect.",
      "You must be at least 18 years old to create an account.",
    ],
  },
  {
    title: "3. Plans and payment",
    body: [
      "immigrei offers a free plan and paid subscription plans, processed by Stripe. You may cancel at any time; paid access remains active until the end of the period already paid for. Prices and benefits for each plan are those shown on the plans page at the time of purchase.",
    ],
  },
  {
    title: "4. Acceptable use",
    body: [
      "You agree not to use the platform for unlawful purposes, not to attempt to access other users' data, not to reverse-engineer it, and not to deliberately overload the service.",
    ],
  },
  {
    title: "5. Informational content and limitation of liability",
    body: [
      "immigrei's content is based on official sources and carefully reviewed, but immigration rules change frequently and every case has its particularities. The service is provided \"as is,\" with no guarantee of completeness, currency, or fitness for your specific case.",
      "To the maximum extent permitted by law, immigrei is not liable for decisions made based on the platform's content, for government agency decisions about your case, or for indirect damages. Nothing in these terms limits liability that cannot be limited by law.",
    ],
  },
  {
    title: "6. Suspension, termination, and changes",
    body: [
      "You may close your account at any time and request deletion of your data (see our Privacy Policy). If we change these terms in a meaningful way, we will ask for your active consent before you continue using immigrei, along with a plain-language summary of what changed.",
      "We may also suspend or terminate your account in cases of misuse of the platform (see section 4), fraud, non-payment, or legal requirement — in those cases we will notify you, except where the law or fraud risk does not permit it.",
    ],
  },
  {
    title: "7. Intellectual property",
    body: [
      "immigrei's software, design, brand, and editorial content (the guides, manuals, and text we write) belong to immigrei. You receive a personal, non-exclusive, non-transferable license to use the platform while your account is active.",
      "What you enter (questionnaire answers, documents you upload to the vault, your case data) remains yours. You grant us a limited license to use that data solely to operate the service for you.",
    ],
  },
  {
    title: "8. Content you post in the community",
    body: [
      "You are responsible for what you post in community stories. Posts go through manual approval before appearing publicly, but that is not a fact-check — immigrei does not guarantee the accuracy of what other users write and does not recommend or endorse any post.",
      "You retain rights to what you write, but you grant us a license to display it on the platform. We may remove any post that violates these terms or that you ask us to remove.",
    ],
  },
  {
    title: "9. Refunds",
    body: [
      "We do not provide prorated refunds for periods already started — upon cancellation, your paid access continues until the end of the period already paid for (see section 3), and the next charge simply doesn't happen.",
    ],
  },
  {
    title: "10. Governing law and venue",
    body: [
      "These terms are governed by the laws of the State of Wyoming, USA — where Hash Vantage Group LLC is registered — and any dispute will be resolved in the courts of that state.",
    ],
  },
  {
    title: "11. Contact",
    body: ["Questions about these terms: ola@immigrei.com."],
  },
];

export default function TermosEnPage() {
  return (
    <main className="min-h-screen bg-cream">
      <header className="flex items-center justify-between px-6 py-6 max-w-3xl mx-auto">
        <Link href="/" aria-label="immigrei — home">
          <Logo variant="lockup" className="text-4xl" />
        </Link>
        <LanguageToggle ptHref="/termos" enHref="/termos/en" lang="en" />
      </header>
      <article className="max-w-2xl mx-auto px-6 pb-20">
        <h1
          className="text-3xl md:text-4xl font-semibold text-ink mb-2"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Terms of Use
        </h1>
        <p className="text-ink-faint text-sm mb-1">
          Last updated: {LAST_UPDATED}
        </p>
        <p className="text-ink-faint text-sm mb-10">
          immigrei is operated by Hash Vantage Group LLC.
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
