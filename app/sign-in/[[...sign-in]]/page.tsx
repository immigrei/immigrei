import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
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
          Sua jornada migratória nos EUA, com clareza.
        </p>
      </div>
      <SignIn />
    </main>
  );
}
