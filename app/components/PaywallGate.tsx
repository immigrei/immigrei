import Link from "next/link";

/**
 * Paywall gate — blurs a preview of the real content and drops a CTA into
 * /planos underneath it. Used where the free plan should *see* what it is
 * missing (their own journey, their own vault) instead of hitting a blank
 * wall: the teaser is the argument for subscribing.
 *
 * The preview is inert — hidden from assistive tech and not focusable — so
 * the gate isn't a visual trick layered over live, tabbable content.
 */
export default function PaywallGate({
  eyebrow = "Exclusivo para assinantes",
  titulo,
  descricao,
  cta = "Clique aqui para ter acesso",
  previewClassName = "max-h-72",
  children,
}: {
  eyebrow?: string;
  titulo: string;
  descricao: string;
  cta?: string;
  previewClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="relative">
        <div
          aria-hidden="true"
          inert
          className={`overflow-hidden pointer-events-none select-none blur-[5px] opacity-70 ${previewClassName}`}
        >
          {children}
        </div>
        {/* fade da prévia borrada para o fundo da página */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-cream via-cream/80 to-transparent"
        />
      </div>

      <div className="relative -mt-6 bg-pine rounded-2xl px-5 py-5">
        <p
          className="text-xs font-bold uppercase tracking-widest text-pine-tint mb-1"
          style={{ letterSpacing: "0.1em" }}
        >
          {eyebrow}
        </p>
        <p className="text-sm font-semibold text-cream">{titulo}</p>
        <p className="text-xs text-pine-tint mt-1 leading-relaxed">{descricao}</p>
        <Link
          href="/planos"
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-amber px-5 py-2.5 text-sm font-bold text-ink hover:bg-amber-deep transition-colors"
        >
          {cta} →
        </Link>
      </div>
    </div>
  );
}
