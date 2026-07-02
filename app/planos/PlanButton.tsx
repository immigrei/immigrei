"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function PlanButton({
  plan,
  highlight,
}: {
  plan: "base" | "core";
  highlight?: boolean;
}) {
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function subscribe() {
    if (!isSignedIn) {
      router.push(`/sign-up?redirect_url=${encodeURIComponent("/planos")}`);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const { url } = await res.json();
      if (url) window.location.href = url;
      else setLoading(false);
    } catch {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={subscribe}
      disabled={loading}
      className={`w-full font-semibold text-base px-6 py-4 rounded-xl transition-colors disabled:opacity-60 ${
        highlight
          ? "bg-amber hover:bg-amber-deep text-white"
          : "bg-pine hover:bg-pine-deep text-cream-2"
      }`}
    >
      {loading ? "Redirecionando..." : "Assinar"}
    </button>
  );
}
