import { UserButton } from "@clerk/nextjs";
import { auth, currentUser } from "@clerk/nextjs/server";

export default async function DashboardPage() {
  const user = await currentUser();
  const firstName = user?.firstName ?? "você";

  return (
    <main className="min-h-screen bg-cream">
      <header className="flex items-center justify-between px-6 py-4 bg-cream-2 border-b border-pine-tint">
        <span
          className="text-2xl font-semibold text-pine"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Immigrei
        </span>
        <UserButton afterSignOutUrl="/" />
      </header>

      <div className="max-w-2xl mx-auto px-6 py-12">
        <h1
          className="text-3xl font-semibold text-ink mb-2"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Olá, {firstName} 👋
        </h1>
        <p className="text-ink-soft text-lg mb-8">
          Sua jornada migratória começa aqui.
        </p>

        <div className="bg-cream-2 rounded-2xl p-6 border border-pine-tint">
          <p className="text-ink-faint text-sm font-bold uppercase tracking-widest mb-3">
            Em breve
          </p>
          <p className="text-ink text-base">
            Seu painel de imigração está sendo construído. Volte em breve para
            ver sua jornada completa.
          </p>
        </div>
      </div>
    </main>
  );
}
