"use client";

import { Save } from "lucide-react";
import { useState } from "react";
import type { DashboardClient } from "@/lib/dashboard-data";

export function TrackingSettingsForm({ client, mode }: { client: DashboardClient; mode: "facebook" | "settings" }) {
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  async function onSubmit(formData: FormData) {
    setStatus("saving");
    const response = await fetch("/api/dashboard/client", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientId: client.id,
        pixelId: formData.get("pixelId"),
        gaMeasurementId: formData.get("gaMeasurementId"),
        googlePlaceId: formData.get("googlePlaceId")
      })
    });
    setStatus(response.ok ? "saved" : "error");
  }

  return (
    <form action={onSubmit} className="grid gap-5 rounded-xl border border-border bg-card p-6 animate-in fade-in slide-in-from-bottom-4 duration-500 md:p-8">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.22em] text-accent">Tracking settings</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-foreground">{mode === "facebook" ? "Facebook" : "Settings"}</h1>
        <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-muted-foreground">Store tracking and review IDs for the published website.</p>
      </div>
      <Field name="pixelId" label="Facebook Pixel ID" defaultValue={client.pixel_id ?? ""} />
      <Field name="gaMeasurementId" label="GA4 measurement ID" defaultValue={client.ga_measurement_id ?? ""} />
      <Field name="googlePlaceId" label="Google Place ID" defaultValue={client.google_place_id ?? ""} />
      <button type="submit" className="inline-flex w-fit items-center gap-2 rounded-lg bg-accent px-5 py-3 text-sm font-bold text-accent-foreground shadow-[0_12px_26px_rgba(110,231,168,0.12)]">
        <Save size={16} />
        {status === "saving" ? "Saving" : status === "saved" ? "Saved" : "Save settings"}
      </button>
      {status === "error" && <p className="text-sm font-semibold text-destructive">Could not save settings.</p>}
    </form>
  );
}

function Field({ name, label, defaultValue }: { name: string; label: string; defaultValue: string }) {
  return (
    <label className="text-sm font-semibold text-foreground">
      {label}
      <input name={name} defaultValue={defaultValue} className="mt-2 w-full rounded-lg border border-border bg-secondary px-4 py-3 text-foreground outline-none transition placeholder:text-muted-foreground focus:border-accent focus:ring-2 focus:ring-accent/20" />
    </label>
  );
}
