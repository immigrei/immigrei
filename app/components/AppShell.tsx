import BottomNav from "./BottomNav";
import HeaderUserButton from "./HeaderUserButton";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <header className="flex items-center justify-between px-6 py-4 bg-cream-2 border-b border-pine-tint sticky top-0 z-40">
        <span
          className="text-2xl font-semibold text-pine"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Immigrei
        </span>
        <HeaderUserButton />
      </header>

      <main className="flex-1 pb-28">
        {children}
      </main>

      <BottomNav />
    </div>
  );
}
