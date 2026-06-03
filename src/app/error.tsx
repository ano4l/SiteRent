"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCw } from "lucide-react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="grid min-h-screen place-items-center bg-[#f2f4f8] px-5 text-foreground">
      <section className="w-full max-w-md rounded-[28px] border border-white/80 bg-white p-8 text-center shadow-[0_24px_70px_rgba(15,23,42,0.12)]">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-red-50 text-red-600">
          <AlertTriangle size={26} />
        </span>
        <h1 className="mt-5 text-2xl font-bold tracking-tight">Something went wrong</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          An unexpected error occurred. You can try again, or head back to your dashboard.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={reset}
            className="pressable inline-flex items-center justify-center gap-2 rounded-xl bg-foreground px-5 py-3 text-sm font-semibold text-white transition hover:bg-black"
          >
            <RotateCw size={16} />
            Try again
          </button>
          <Link
            href="/dashboard"
            className="pressable inline-flex items-center justify-center gap-2 rounded-xl border border-[#d9dee5] bg-white px-5 py-3 text-sm font-semibold text-foreground transition hover:border-[#111827]"
          >
            Go to dashboard
          </Link>
        </div>
      </section>
    </main>
  );
}
