import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-cream px-4">
      <div className="mb-8 text-center">
        <h1
          className="text-4xl font-semibold text-pine mb-2"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Immigrei
        </h1>
        <p className="text-ink-soft text-base">
          Comece sua jornada — é gratuito para começar.
        </p>
      </div>
      <SignUp />
    </main>
  );
}
