"use client";

import { Ban, CreditCard } from "lucide-react";
import { useState } from "react";
import type { DashboardClient } from "@/lib/dashboard-data";

export function BillingPanel({ client }: { client: DashboardClient }) {
  const [status, setStatus] = useState(client.subscription_status);
  const [message, setMessage] = useState<string | null>(null);

  async function cancelSubscription() {
    setMessage("Cancelling...");
    const response = await fetch("/api/billing/cancel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId: client.id, reason: "Dashboard cancellation" })
    });
    const result = await response.json();
    if (!response.ok) {
      setMessage(result.error ?? "Could not cancel subscription.");
      return;
    }
    setStatus("cancelled");
    setMessage(result.subscriptionEndsAt ? `Website remains active until ${new Date(result.subscriptionEndsAt).toLocaleDateString("en-ZA")}.` : "Subscription cancelled.");
  }

  return (
    <section className="space-y-5 rounded-xl border border-border bg-card p-6 animate-in fade-in slide-in-from-bottom-4 duration-500 md:p-8">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.22em] text-accent">Subscription health</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-foreground">Billing</h1>
        <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-muted-foreground">Peach subscription status and cancellation controls.</p>
      </div>
      {client.payment_failed_at && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm font-semibold text-destructive">
          Payment failed on {new Date(client.payment_failed_at).toLocaleDateString("en-ZA")}. Please update billing before the grace period ends.
        </div>
      )}
      <div className="grid gap-4 md:grid-cols-3">
        <Info label="Status" value={status} />
        <Info label="Next billing" value={client.next_billing_date ? new Date(client.next_billing_date).toLocaleDateString("en-ZA") : "Not scheduled"} />
        <Info label="Registration" value={status === "active" ? "Card token stored" : "No active token"} />
      </div>
      <div className="flex flex-wrap gap-3">
        <button type="button" className="inline-flex items-center gap-2 rounded-lg border border-border bg-secondary px-5 py-3 text-sm font-bold text-foreground transition hover:bg-secondary/70">
          <CreditCard size={16} />
          Update card
        </button>
        <button type="button" onClick={cancelSubscription} className="inline-flex items-center gap-2 rounded-lg bg-destructive px-5 py-3 text-sm font-bold text-white shadow-[0_12px_26px_rgba(248,113,113,0.12)]">
          <Ban size={16} />
          Cancel subscription
        </button>
      </div>
      {message && <p className="text-sm font-semibold text-muted-foreground">{message}</p>}
    </section>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-secondary p-4">
      <p className="text-sm font-semibold text-muted-foreground">{label}</p>
      <p className="mt-2 text-xl font-bold capitalize text-foreground">{value}</p>
    </div>
  );
}
