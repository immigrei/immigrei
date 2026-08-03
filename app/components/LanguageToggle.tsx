import Link from "next/link";

// Only on /termos, /privacidade, /seguranca — the pages a USCIS reviewer
// (or anyone who doesn't read Portuguese) might actually need to check.
// Not on the rest of the marketing site, which stays PT-BR only.
export default function LanguageToggle({
  ptHref,
  enHref,
  lang,
}: {
  ptHref: string;
  enHref: string;
  lang: "pt" | "en";
}) {
  return (
    <div className="flex items-center gap-1.5 text-sm" role="group" aria-label="Idioma / Language">
      <Link
        href={ptHref}
        aria-current={lang === "pt" ? "true" : undefined}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border transition-colors ${
          lang === "pt"
            ? "border-pine bg-pine-tint text-pine font-semibold"
            : "border-pine-tint text-ink-faint hover:text-pine"
        }`}
      >
        <span aria-hidden="true">🇧🇷</span> PT
      </Link>
      <Link
        href={enHref}
        aria-current={lang === "en" ? "true" : undefined}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border transition-colors ${
          lang === "en"
            ? "border-pine bg-pine-tint text-pine font-semibold"
            : "border-pine-tint text-ink-faint hover:text-pine"
        }`}
      >
        <span aria-hidden="true">🇺🇸</span> EN
      </Link>
    </div>
  );
}
