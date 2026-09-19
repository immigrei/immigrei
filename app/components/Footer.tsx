import Link from "next/link";
import Logo from "./Logo";
import { SOCIAL_LINKS } from "@/lib/socialLinks";

// Single-color line icons (currentColor) so they follow the footer's ink/pine
// palette instead of each network's own brand colors. Keyed by network name:
// adding a network to SOCIAL_LINKS fails the type-check until it gets an icon.
const iconProps = {
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
} as const;

const SOCIAL_ICONS: Record<(typeof SOCIAL_LINKS)[number]["name"], React.ReactNode> = {
  Instagram: (
    <svg {...iconProps}>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  ),
  Facebook: (
    <svg {...iconProps}>
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  ),
};

// Site-wide footer — the one place every legal/compliance link lives so
// visitors (including a USCIS reviewer checking our public policies) can
// always find them, from any page, without knowing a URL by heart.
export default function Footer() {
  return (
    <footer className="border-t border-pine-tint bg-cream-2 mt-auto">
      <div className="max-w-5xl mx-auto px-6 py-10 flex flex-col gap-8">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-8">
          <div>
            <Logo variant="lockup" className="text-2xl mb-3" />
            <p className="text-ink-faint text-sm max-w-xs leading-relaxed">
              Sua jornada migratória nos EUA, com clareza.
            </p>
            <div className="flex gap-3 mt-5">
              {SOCIAL_LINKS.map((link) => (
                <a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${link.name} da immigrei`}
                  title={`${link.name} da immigrei`}
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-pine-tint text-pine transition-colors hover:bg-pine hover:text-cream-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine"
                >
                  {SOCIAL_ICONS[link.name]}
                </a>
              ))}
            </div>
          </div>

          <nav aria-label="Legal" className="flex flex-col gap-2 text-sm">
            <span className="text-[11px] font-bold uppercase tracking-widest text-ink-faint mb-1">
              Legal
            </span>
            <Link href="/termos" className="text-ink-soft hover:text-pine transition-colors">
              Termos de Uso
            </Link>
            <Link href="/privacidade" className="text-ink-soft hover:text-pine transition-colors">
              Política de Privacidade
            </Link>
            <Link href="/seguranca" className="text-ink-soft hover:text-pine transition-colors">
              Segurança
            </Link>
            <Link href="/suporte" className="text-ink-soft hover:text-pine transition-colors">
              Suporte
            </Link>
          </nav>

          <nav aria-label="Entenda seu caso" className="flex flex-col gap-2 text-sm">
            <span className="text-[11px] font-bold uppercase tracking-widest text-ink-faint mb-1">
              Entenda seu caso
            </span>
            <Link href="/status" className="text-ink-soft hover:text-pine transition-colors">
              Status do caso
            </Link>
            <Link href="/entenda" className="text-ink-soft hover:text-pine transition-colors">
              Guias por formulário
            </Link>
          </nav>

          <nav aria-label="Empresa" className="flex flex-col gap-2 text-sm">
            <span className="text-[11px] font-bold uppercase tracking-widest text-ink-faint mb-1">
              Empresa
            </span>
            <Link href="/nossa-historia" className="text-ink-soft hover:text-pine transition-colors">
              Nossa história
            </Link>
            <a href="mailto:ola@immigrei.com" className="text-ink-soft hover:text-pine transition-colors">
              ola@immigrei.com
            </a>
          </nav>
        </div>

        <div className="pt-6 border-t border-pine-tint text-xs text-ink-faint flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <p>&copy; {new Date().getFullYear()} Hash Vantage Group LLC. Todos os direitos reservados.</p>
          <p>immigrei não é um escritório de advocacia nem substitui aconselhamento jurídico.</p>
        </div>
      </div>
    </footer>
  );
}
