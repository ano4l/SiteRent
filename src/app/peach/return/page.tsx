import Link from "next/link";
import { CheckCircle2, Clock } from "lucide-react";

export default function PeachReturnPage({ searchParams }: { searchParams?: { status?: string; code?: string; transaction?: string } }) {
  const pending = searchParams?.status === "pending";
  const Icon = pending ? Clock : CheckCircle2;

  return (
    <main className="grid min-h-screen place-items-center bg-paper px-5 text-ink">
      <section className="max-w-md rounded-lg border border-line bg-white p-6 text-center shadow-soft">
        <Icon className={pending ? "mx-auto text-amber-600" : "mx-auto text-emerald-600"} size={42} />
        <h1 className="mt-5 text-3xl font-bold">{pending ? "Payment is processing" : "Payment response received"}</h1>
        <p className="mt-3 text-muted">
          {pending
            ? "Peach Payments returned a pending checkout response. The webhook will confirm the final subscription status in the background."
            : "Peach Payments returned a successful checkout response. The webhook will confirm the subscription status in the background."}
        </p>
        {searchParams?.code && (
          <p className="mt-4 rounded-md bg-secondary px-3 py-2 text-xs font-semibold text-muted">
            Result code: {searchParams.code}
          </p>
        )}
        <Link href="/onboarding" className="mt-6 inline-flex rounded-md bg-ink px-5 py-3 font-semibold text-white">
          Continue publishing
        </Link>
        <Link href="/dashboard" className="ml-3 mt-6 inline-flex rounded-md border border-line bg-white px-5 py-3 font-semibold text-ink">
          Dashboard
        </Link>
      </section>
    </main>
  );
}
