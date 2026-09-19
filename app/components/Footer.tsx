import Link from "next/link";
import Logo from "./Logo";
import { SOCIAL_LINKS } from "@/lib/socialLinks";

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
            {SOCIAL_LINKS.map((link) => (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-ink-soft hover:text-pine transition-colors"
              >
                {link.name}
              </a>
            ))}
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
