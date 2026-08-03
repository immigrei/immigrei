import Link from "next/link";
import Logo from "./Logo";

// Site-wide footer — the one place every legal/compliance link lives so
// visitors (including a USCIS reviewer checking our public policies) can
// always find them, from any page, without knowing a URL by heart.
//
// `lang="en"` is only used on the /termos, /privacidade, /seguranca English
// mirrors (see LanguageToggle.tsx) — the rest of the marketing site (home,
// nossa-historia) is PT-BR only, so "Nossa história" always points at the
// Portuguese page even in the English footer; there's no English version.
export default function Footer({ lang = "pt" }: { lang?: "pt" | "en" }) {
  const t =
    lang === "en"
      ? {
          tagline: "Your U.S. immigration journey, with clarity.",
          legal: "Legal",
          terms: "Terms of Use",
          privacy: "Privacy Policy",
          security: "Security",
          company: "Company",
          history: "Our story",
          rights: "All rights reserved.",
          disclaimer: "immigrei is not a law firm and does not replace legal advice.",
          termsHref: "/termos/en",
          privacyHref: "/privacidade/en",
          securityHref: "/seguranca/en",
        }
      : {
          tagline: "Sua jornada migratória nos EUA, com clareza.",
          legal: "Legal",
          terms: "Termos de Uso",
          privacy: "Política de Privacidade",
          security: "Segurança",
          company: "Empresa",
          history: "Nossa história",
          rights: "Todos os direitos reservados.",
          disclaimer: "immigrei não é um escritório de advocacia nem substitui aconselhamento jurídico.",
          termsHref: "/termos",
          privacyHref: "/privacidade",
          securityHref: "/seguranca",
        };

  return (
    <footer className="border-t border-pine-tint bg-cream-2 mt-auto">
      <div className="max-w-5xl mx-auto px-6 py-10 flex flex-col gap-8">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-8">
          <div>
            <Logo variant="lockup" className="text-2xl mb-3" />
            <p className="text-ink-faint text-sm max-w-xs leading-relaxed">
              {t.tagline}
            </p>
          </div>

          <nav aria-label={t.legal} className="flex flex-col gap-2 text-sm">
            <span className="text-[11px] font-bold uppercase tracking-widest text-ink-faint mb-1">
              {t.legal}
            </span>
            <Link href={t.termsHref} className="text-ink-soft hover:text-pine transition-colors">
              {t.terms}
            </Link>
            <Link href={t.privacyHref} className="text-ink-soft hover:text-pine transition-colors">
              {t.privacy}
            </Link>
            <Link href={t.securityHref} className="text-ink-soft hover:text-pine transition-colors">
              {t.security}
            </Link>
          </nav>

          <nav aria-label={t.company} className="flex flex-col gap-2 text-sm">
            <span className="text-[11px] font-bold uppercase tracking-widest text-ink-faint mb-1">
              {t.company}
            </span>
            <Link href="/nossa-historia" className="text-ink-soft hover:text-pine transition-colors">
              {t.history}
            </Link>
            <a href="mailto:ola@immigrei.com" className="text-ink-soft hover:text-pine transition-colors">
              ola@immigrei.com
            </a>
          </nav>
        </div>

        <div className="pt-6 border-t border-pine-tint text-xs text-ink-faint flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <p>&copy; {new Date().getFullYear()} Hash Vantage Group LLC. {t.rights}</p>
          <p>{t.disclaimer}</p>
        </div>
      </div>
    </footer>
  );
}
