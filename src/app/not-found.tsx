import Link from "next/link";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f2f4f8] px-5 text-foreground">
      <section className="w-full max-w-md rounded-[28px] border border-white/80 bg-white p-8 text-center shadow-[0_24px_70px_rgba(15,23,42,0.12)]">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-[#f4f6f8] text-foreground">
          <Compass size={26} />
        </span>
        <p className="mt-5 text-sm font-bold uppercase tracking-[0.18em] text-muted-foreground">404</p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight">Page not found</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          The page you are looking for doesn&rsquo;t exist or may have moved.
        </p>
        <Link
          href="/dashboard"
          className="pressable mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-foreground px-5 py-3 text-sm font-semibold text-white transition hover:bg-black"
        >
          Back to dashboard
        </Link>
      </section>
    </main>
  );
}
