import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export default function PeachFailedPage({ searchParams }: { searchParams?: { status?: string; code?: string } }) {
  return (
    <main className="grid min-h-screen place-items-center bg-paper px-5 text-ink">
      <section className="max-w-md rounded-lg border border-line bg-white p-6 text-center shadow-soft">
        <AlertTriangle className="mx-auto text-red-700" size={42} />
        <h1 className="mt-5 text-3xl font-bold">Payment failed</h1>
        <p className="mt-3 text-muted">
          The payment could not be confirmed from the Peach Payments result. Your onboarding progress is saved and you can retry safely.
        </p>
        {searchParams?.code && (
          <p className="mt-4 rounded-md bg-secondary px-3 py-2 text-xs font-semibold text-muted">
            Result code: {searchParams.code}
          </p>
        )}
        <Link href="/onboarding" className="mt-6 inline-flex rounded-md bg-ink px-5 py-3 font-semibold text-white">
          Retry payment
        </Link>
        <Link href="/dashboard?section=billing" className="ml-3 mt-6 inline-flex rounded-md border border-line bg-white px-5 py-3 font-semibold text-ink">
          Billing
        </Link>
      </section>
    </main>
  );
}
