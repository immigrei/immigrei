import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import AppShell from "@/app/components/AppShell";

export default async function DocumentosPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto px-6 py-10">
        <h1
          className="text-3xl font-semibold text-ink mb-1"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Documentos
        </h1>
        <p className="text-ink-soft text-base mb-8">
          Seus documentos organizados por etapa da jornada.
        </p>

        <div className="bg-cream-2 rounded-2xl border border-pine-tint p-8 flex flex-col items-center text-center gap-3">
          <div className="w-14 h-14 rounded-full bg-pine-tint flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="4" y="2" width="12" height="16" rx="2" stroke="var(--pine)" strokeWidth="1.7" />
              <path d="M8 7H12M8 10H14M8 13H11" stroke="var(--pine)" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M14 2V6H18L14 2Z" stroke="var(--pine)" strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
          </div>
          <p
            className="text-lg font-semibold text-ink"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Em breve
          </p>
          <p className="text-ink-soft text-sm leading-relaxed max-w-xs">
            Aqui você vai encontrar checklists de documentos por fase, com alertas de validade e o que preparar antes de cada etapa.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
