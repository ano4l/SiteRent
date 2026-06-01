import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

export default function PeachReturnPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-paper px-5 text-ink">
      <section className="max-w-md rounded-lg border border-line bg-white p-6 text-center shadow-soft">
        <CheckCircle2 className="mx-auto text-emerald-600" size={42} />
        <h1 className="mt-5 text-3xl font-bold">Payment received</h1>
        <p className="mt-3 text-muted">
          Peach Payments returned a successful checkout response. The webhook will confirm the subscription status in the background.
        </p>
        <Link href="/onboarding" className="mt-6 inline-flex rounded-md bg-ink px-5 py-3 font-semibold text-white">
          Continue publishing
        </Link>
      </section>
    </main>
  );
}
