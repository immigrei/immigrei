import { SignUp } from "@clerk/nextjs";
import Logo from "../../components/Logo";

export default function SignUpPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-cream px-4">
      <div className="mb-8 flex flex-col items-center text-center">
        <Logo variant="lockup" className="text-4xl mb-3" />
        <p className="text-ink-soft text-base">
          Comece sua jornada — é gratuito para começar.
        </p>
      </div>
      <SignUp />
    </main>
  );
}
