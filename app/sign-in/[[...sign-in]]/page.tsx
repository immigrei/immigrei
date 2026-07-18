import { SignIn } from "@clerk/nextjs";
import Logo from "../../components/Logo";

export default function SignInPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-cream px-4">
      <div className="mb-8 flex flex-col items-center text-center">
        <Logo variant="lockup" className="text-4xl mb-3" />
        <p className="text-ink-soft text-base">
          Sua jornada migratória nos EUA, com clareza.
        </p>
      </div>
      <SignIn />
    </main>
  );
}
