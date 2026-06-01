"use client";

import { ImagePlus, Trash2 } from "lucide-react";
import { useState } from "react";
import type { DashboardClient } from "@/lib/dashboard-data";

export function PhotosManager({ client }: { client: DashboardClient }) {
  const [photos, setPhotos] = useState(client.gallery_photos ?? []);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  async function persist(nextPhotos: string[]) {
    setStatus("saving");
    const response = await fetch("/api/dashboard/client", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId: client.id, galleryPhotos: nextPhotos })
    });
    setStatus(response.ok ? "saved" : "error");
  }

  async function onUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || photos.length >= 6) return;

    setStatus("saving");
    const formData = new FormData();
    formData.set("file", file);
    formData.set("type", "gallery");
    formData.set("clientId", client.id);

    const response = await fetch("/api/uploads", { method: "POST", body: formData });
    const result = await response.json();
    if (!response.ok || !result.url) {
      setStatus("error");
      return;
    }

    const nextPhotos = [...photos, result.url].slice(0, 6);
    setPhotos(nextPhotos);
    await persist(nextPhotos);
  }

  async function removePhoto(photo: string) {
    const nextPhotos = photos.filter((item) => item !== photo);
    setPhotos(nextPhotos);
    await persist(nextPhotos);
  }

  return (
    <section className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="rounded-[24px] border border-white/74 bg-white/72 p-6 shadow-[0_22px_60px_rgba(15,23,42,0.08)] ring-1 ring-white/70 backdrop-blur-2xl md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent">Media library</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground">Website media</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Upload job photos, proof assets, and gallery images that make the published website feel real and trustworthy.</p>
          </div>
          <span className="rounded-md border border-border bg-secondary px-3 py-1.5 text-xs font-bold text-muted-foreground">{photos.length}/6 gallery photos</span>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <MediaStat title="Gallery readiness" value={photos.length >= 3 ? "Ready" : "Needs photos"} copy={photos.length >= 3 ? "Enough proof for launch" : "Add at least 3 recent jobs"} />
          <MediaStat title="Recommended size" value="1600px+" copy="Wide, sharp photos crop best" />
          <MediaStat title="Website use" value="Hero + gallery" copy="Service proof and trust sections" />
        </div>

        <label className="mt-6 flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-[22px] border border-dashed border-slate-300 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] px-6 py-8 text-center transition hover:border-blue-300 hover:bg-white">
          <span className="grid size-14 place-items-center rounded-2xl bg-blue-50 text-blue-700 shadow-sm">
            <ImagePlus size={24} />
          </span>
          <span className="mt-4 text-base font-semibold text-foreground">{photos.length >= 6 ? "Gallery full" : "Upload a gallery photo"}</span>
          <span className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">Use real project, team, equipment, or before-and-after images. JPG, PNG, and WebP are supported.</span>
          <input type="file" accept="image/*" onChange={onUpload} className="sr-only" disabled={photos.length >= 6} />
        </label>
      </div>

      <div className="rounded-[24px] border border-white/74 bg-white/72 p-6 shadow-[0_22px_60px_rgba(15,23,42,0.08)] ring-1 ring-white/70 backdrop-blur-2xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-foreground">Gallery assets</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">These images can appear in the public proof and project sections.</p>
          </div>
          <p className="text-sm font-semibold text-muted-foreground">{status === "saving" ? "Saving..." : status === "saved" ? "Saved." : status === "error" ? "Could not save photos." : `${photos.length}/6 photos`}</p>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {photos.map((photo) => (
            <article key={photo} className="overflow-hidden rounded-[20px] border border-white/74 bg-white shadow-sm ring-1 ring-white/70">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo} alt="" className="aspect-[4/3] w-full object-cover" />
              <button type="button" onClick={() => removePhoto(photo)} className="flex w-full items-center justify-center gap-2 px-3 py-3 text-sm font-bold text-destructive transition hover:bg-destructive/10">
                <Trash2 size={16} />
                Remove
              </button>
            </article>
          ))}
          {Array.from({ length: Math.max(6 - photos.length, 0) }).map((_, index) => (
            <label key={`empty-${index}`} className="flex aspect-[4/3] cursor-pointer flex-col items-center justify-center rounded-[20px] border border-dashed border-slate-300 bg-white/54 p-5 text-center transition hover:border-blue-300 hover:bg-white">
              <ImagePlus size={22} className="text-muted-foreground" />
              <span className="mt-3 text-sm font-semibold text-foreground">Empty slot</span>
              <span className="mt-1 text-xs text-muted-foreground">Add proof photo</span>
              <input type="file" accept="image/*" onChange={onUpload} className="sr-only" disabled={photos.length >= 6} />
            </label>
          ))}
        </div>
      </div>
    </section>
  );
}

function MediaStat({ title, value, copy }: { title: string; value: string; copy: string }) {
  return (
    <div className="rounded-2xl border border-white/70 bg-white/62 p-4 shadow-sm">
      <p className="text-sm font-semibold text-muted-foreground">{title}</p>
      <p className="mt-2 text-xl font-bold text-foreground">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{copy}</p>
    </div>
  );
}
