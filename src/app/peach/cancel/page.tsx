import Link from "next/link";
import { AlertCircle } from "lucide-react";

export default function PeachCancelPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-paper px-5 text-ink">
      <section className="max-w-md rounded-lg border border-line bg-white p-6 text-center shadow-soft">
        <AlertCircle className="mx-auto text-accent" size={42} />
        <h1 className="mt-5 text-3xl font-bold">Payment not completed</h1>
        <p className="mt-3 text-muted">
          The Peach Payments checkout was cancelled or could not be completed. Your onboarding progress is still saved.
        </p>
        <Link href="/onboarding" className="mt-6 inline-flex rounded-md bg-ink px-5 py-3 font-semibold text-white">
          Retry payment
        </Link>
      </section>
    </main>
  );
}
