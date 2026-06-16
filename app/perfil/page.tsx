import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import AppShell from "@/app/components/AppShell";

export default async function PerfilPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await currentUser();
  const name = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Você";
  const email = user?.emailAddresses?.[0]?.emailAddress ?? "";

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto px-6 py-10">
        <h1
          className="text-3xl font-semibold text-ink mb-1"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Perfil
        </h1>
        <p className="text-ink-soft text-base mb-8">
          Sua conta e configurações.
        </p>

        <div className="bg-cream-2 rounded-2xl border border-pine-tint overflow-hidden mb-5">
          <div className="px-6 py-5 flex items-center gap-4 border-b border-pine-tint">
            <UserButton />
            <div>
              <p className="text-ink font-semibold text-base">{name}</p>
              <p className="text-ink-faint text-sm">{email}</p>
            </div>
          </div>
          <div className="divide-y divide-pine-tint">
            <a href="/onboarding/edit" className="px-6 py-4 flex items-center justify-between group">
              <span className="text-ink text-sm font-medium">Editar informações de imigração</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--ink-faint)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
