import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import AppShell from "@/app/components/AppShell";

export default async function ProfissionaisPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto px-6 py-10">
        <h1
          className="text-3xl font-semibold text-ink mb-1"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Profissionais
        </h1>
        <p className="text-ink-soft text-base mb-8">
          Advogados e consultores verificados, que falam português.
        </p>

        <div className="bg-cream-2 rounded-2xl border border-pine-tint p-8 flex flex-col items-center text-center gap-3">
          <div className="w-14 h-14 rounded-full bg-pine-tint flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="9" cy="7" r="3.5" stroke="var(--pine)" strokeWidth="1.7" />
              <path d="M2 20C2 16.6863 5.13401 14 9 14C10.0112 14 10.9686 14.1942 11.8408 14.5479" stroke="var(--pine)" strokeWidth="1.7" strokeLinecap="round" />
              <circle cx="17" cy="17" r="4" stroke="var(--pine)" strokeWidth="1.7" />
              <path d="M17 15V17L18.5 18.5" stroke="var(--pine)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <p
            className="text-lg font-semibold text-ink"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Em breve
          </p>
          <p className="text-ink-soft text-sm leading-relaxed max-w-xs">
            Nossa rede de profissionais verificados vai te conectar ao especialista certo — no momento certo da sua jornada — sem precisar pagar por uma consulta às cegas.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
