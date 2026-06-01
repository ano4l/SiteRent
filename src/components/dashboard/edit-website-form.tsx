"use client";

import { Save } from "lucide-react";
import { useState } from "react";
import type { DashboardClient } from "@/lib/dashboard-data";

export function EditWebsiteForm({ client }: { client: DashboardClient }) {
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  async function onSubmit(formData: FormData) {
    setStatus("saving");
    const response = await fetch("/api/dashboard/client", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientId: client.id,
        businessName: formData.get("businessName"),
        tagline: formData.get("tagline"),
        phone: formData.get("phone"),
        whatsapp: formData.get("whatsapp"),
        email: formData.get("email"),
        primaryCity: formData.get("primaryCity"),
        address: formData.get("address")
      })
    });
    setStatus(response.ok ? "saved" : "error");
  }

  return (
    <form action={onSubmit} className="grid gap-6 rounded-xl border border-border bg-card p-6 animate-in fade-in slide-in-from-bottom-4 duration-500 md:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-accent">Website editor</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-foreground">Edit website</h1>
          <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-muted-foreground">Update the live business details, then publish the changes.</p>
        </div>
        <span className="rounded-full border border-border bg-secondary px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">Live profile</span>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Field name="businessName" label="Business name" defaultValue={client.business_name ?? client.trading_name ?? ""} />
        <Field name="primaryCity" label="Primary city" defaultValue={client.primary_city ?? ""} />
        <Field name="phone" label="Phone" defaultValue={client.phone ?? ""} />
        <Field name="whatsapp" label="WhatsApp" defaultValue={client.whatsapp ?? ""} />
        <Field name="email" label="Email" type="email" defaultValue={client.email ?? ""} />
        <Field name="address" label="Address" defaultValue={client.address ?? ""} />
      </div>
      <label className="text-sm font-semibold text-foreground">
        Tagline
        <textarea name="tagline" defaultValue={client.tagline ?? ""} className="mt-2 min-h-28 w-full rounded-lg border border-border bg-secondary px-4 py-3 text-foreground outline-none transition placeholder:text-muted-foreground focus:border-accent focus:ring-2 focus:ring-accent/20" />
      </label>
      <button type="submit" className="inline-flex w-fit items-center gap-2 rounded-lg bg-accent px-5 py-3 text-sm font-bold text-accent-foreground shadow-[0_12px_26px_rgba(110,231,168,0.12)]">
        <Save size={16} />
        {status === "saving" ? "Saving" : status === "saved" ? "Saved" : "Save changes"}
      </button>
      {status === "error" && <p className="text-sm font-semibold text-destructive">Could not save changes.</p>}
    </form>
  );
}

function Field({ name, label, defaultValue, type = "text" }: { name: string; label: string; defaultValue: string; type?: string }) {
  return (
    <label className="text-sm font-semibold text-foreground">
      {label}
      <input name={name} type={type} defaultValue={defaultValue} className="mt-2 w-full rounded-lg border border-border bg-secondary px-4 py-3 text-foreground outline-none transition placeholder:text-muted-foreground focus:border-accent focus:ring-2 focus:ring-accent/20" />
    </label>
  );
}
