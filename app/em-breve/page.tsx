import type { Metadata } from "next";
import WaitlistForm from "./WaitlistForm";

export const metadata: Metadata = {
  title: "Immigrei — Sua jornada migratória nos EUA, com clareza.",
  description:
    "O companheiro completo da sua jornada de imigração nos EUA. Em português, construído por imigrantes, para imigrantes. Em breve.",
};

const pillars = [
  {
    title: "Caminho completo",
    text: "Não só onde seu caso está — mas para onde você vai e o que é preciso em cada etapa.",
  },
  {
    title: "No seu idioma",
    text: "Português primeiro. Sem juridiquês, sem respostas contraditórias do Google.",
  },
  {
    title: "Rede de confiança",
    text: "Profissionais verificados a um toque de distância, quando você estiver pronto.",
  },
];

export default function EmBrevePage() {
  return (
    <main className="min-h-screen bg-cream flex flex-col">
      <header className="flex items-center justify-center px-6 py-6">
        <span
          className="text-2xl font-semibold text-pine"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Immigrei
        </span>
      </header>

      <section className="flex-1 flex flex-col items-center justify-center px-6 text-center py-16">
        <p className="text-xs font-bold uppercase tracking-widest text-amber mb-6">
          Construído por imigrantes, para imigrantes
        </p>
        <h1
          className="text-5xl md:text-6xl font-semibold text-ink leading-tight mb-6 max-w-2xl"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Sua jornada migratória nos EUA,{" "}
          <span className="text-pine">com clareza.</span>
        </h1>
        <p className="text-ink-soft text-lg md:text-xl max-w-xl mb-10 leading-relaxed">
          Estamos construindo o companheiro completo da sua jornada de
          imigração — em português, feito por quem já viveu isso. Deixe seu
          e-mail e seja avisado em primeira mão.
        </p>

        <WaitlistForm />

        <div className="grid sm:grid-cols-3 gap-6 max-w-3xl mt-16 text-left">
          {pillars.map((p) => (
            <div key={p.title} className="bg-cream-2 border border-pine-tint rounded-2xl p-6">
              <h3 className="text-ink font-bold text-base mb-2">{p.title}</h3>
              <p className="text-ink-soft text-sm leading-relaxed">{p.text}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="text-center px-6 py-8 text-ink-faint text-xs leading-relaxed">
        <p>Imigrando com clareza. Em breve.</p>
        <p className="mt-1">© {new Date().getFullYear()} Immigrei. Não somos um escritório de advocacia.</p>
      </footer>
    </main>
  );
}
