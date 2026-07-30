import Link from "next/link";
import BottomNav from "./BottomNav";
import HeaderUserButton from "./HeaderUserButton";
import Logo from "./Logo";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <header className="flex items-center justify-between px-6 py-4 bg-cream-2 border-b border-pine-tint sticky top-0 z-40">
        {/* AppShell only renders behind auth (every page using it redirects
            signed-out visitors to /sign-in first), so the logo can always
            point straight at the logged-in home. */}
        <Link href="/dashboard">
          <Logo variant="wordmark" className="text-2xl" />
        </Link>
        <HeaderUserButton />
      </header>

      <main className="flex-1 pb-28">
        {children}
      </main>

      <BottomNav />
    </div>
  );
}
