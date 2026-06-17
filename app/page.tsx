import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const { userId } = await auth();
  if (userId) redirect("/dashboard");

  return (
    <main className="min-h-screen bg-cream flex flex-col">
      <header className="flex items-center justify-between px-6 py-5">
        <span
          className="text-2xl font-semibold text-pine"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Immigrei
        </span>
        <Link
          href="/sign-in"
          className="text-sm font-medium text-pine hover:text-pine-deep transition-colors"
        >
          Entrar
        </Link>
      </header>

      <section className="flex-1 flex flex-col items-center justify-center px-6 text-center py-20">
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
          Não só onde você está — mas para onde você vai, o que precisa fazer e
          com quem pode contar.
        </p>
        <Link
          href="/onboarding"
          className="bg-amber hover:bg-amber-deep text-white font-semibold text-base px-8 py-4 rounded-xl transition-colors"
        >
          Começar agora — é gratuito
        </Link>
      </section>
    </main>
  );
}
