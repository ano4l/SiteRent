"use client";

import { FileText, Sparkles, UploadCloud } from "lucide-react";
import { useState } from "react";
import { TEMPLATE_STYLES } from "@/lib/constants";

const templateStyles = Object.entries(TEMPLATE_STYLES);

type AiPlan = {
  summary: string;
  templateStyle: string;
  hero: {
    headline: string;
    subheadline: string;
    primaryCta: string;
    secondaryCta: string;
  };
  uiChangePlan: Array<{
    area: string;
    change: string;
    rationale: string;
  }>;
  imagePrompts: Array<{
    slot: string;
    prompt: string;
  }>;
};

export function AiWebsiteStudio() {
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [plan, setPlan] = useState<AiPlan | null>(null);
  const [attachments, setAttachments] = useState<File[]>([]);

  async function onSubmit(formData: FormData) {
    setStatus("loading");
    attachments.forEach((file) => formData.append("attachments", file));
    const response = await fetch("/api/ai/website-plan", {
      method: "POST",
      body: formData
    });

    const result = await response.json();
    if (!response.ok) {
      setStatus("error");
      return;
    }

    setPlan(result.plan);
    setStatus("ready");
  }

  return (
    <section className="rounded-[32px] border border-admin-line bg-white p-6 shadow-[0_16px_38px_rgba(17,17,17,0.05)] xl:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-sm font-black text-ink">
            <Sparkles size={16} />
            Gemini website assistant
          </p>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-ink">Create or restyle a SiteRent website</h2>
          <p className="mt-1 max-w-3xl text-sm font-semibold leading-6 text-muted">
            Generate a structured plan for copy, layout, image prompts, and UI changes across the four starter template languages.
          </p>
        </div>
        <span className="rounded-full border border-admin-line-soft bg-admin-surface px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-[#7e7165]">
          Server-side Gemini
        </span>
      </div>

      <form action={onSubmit} className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="grid gap-4">
          <label className="text-sm font-bold text-ink">
            Mode
            <select name="mode" defaultValue="create" className="mt-2 h-11 w-full rounded-2xl border border-admin-line-soft bg-admin-surface px-4 outline-none transition focus:border-admin-accent focus:bg-white">
              <option value="create">Create website</option>
              <option value="restyle">Restyle website</option>
              <option value="copy-refresh">Copy refresh</option>
            </select>
          </label>
          <label className="text-sm font-bold text-ink">
            Template style
            <select name="preferredTemplateStyle" defaultValue="" className="mt-2 h-11 w-full rounded-2xl border border-admin-line-soft bg-admin-surface px-4 outline-none transition focus:border-admin-accent focus:bg-white">
              <option value="">Let Gemini choose</option>
              {templateStyles.map(([key, style]) => (
                <option key={key} value={key}>{style.label}</option>
              ))}
            </select>
          </label>
          <label className="text-sm font-bold text-ink">
            Current website notes
            <textarea name="currentWebsiteContext" className="mt-2 min-h-32 w-full rounded-2xl border border-admin-line-soft bg-admin-surface px-4 py-3 outline-none transition placeholder:text-[#a69a8c] focus:border-admin-accent focus:bg-white" placeholder="Optional notes about the existing website, photos, weak sections, or requested UI changes." />
          </label>
          <div className="rounded-2xl border border-admin-line-soft bg-admin-surface p-4">
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-admin-line bg-white px-4 py-6 text-center transition hover:border-admin-accent">
              <UploadCloud size={22} className="text-admin-accent" />
              <span className="mt-2 text-sm font-black text-ink">Attach reference files</span>
              <span className="mt-1 text-xs font-semibold leading-5 text-muted">Images, PDFs, markdown, text, or JSON. Up to 6 files.</span>
              <input
                type="file"
                className="sr-only"
                multiple
                accept="image/png,image/jpeg,image/webp,application/pdf,text/plain,text/markdown,application/json,.md,.txt,.json,.pdf"
                onChange={(event) => setAttachments(Array.from(event.target.files ?? []).slice(0, 6))}
              />
            </label>
            {attachments.length > 0 && (
              <div className="mt-3 grid gap-2">
                {attachments.map((file) => (
                  <div key={`${file.name}-${file.size}`} className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm font-bold text-ink">
                    <FileText size={15} className="text-muted" />
                    <span className="min-w-0 flex-1 truncate">{file.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid gap-4">
          <label className="text-sm font-bold text-ink">
            Business context
            <textarea
              name="businessContext"
              required
              minLength={20}
              className="mt-2 min-h-48 w-full rounded-2xl border border-admin-line-soft bg-admin-surface px-4 py-3 outline-none transition placeholder:text-[#a69a8c] focus:border-admin-accent focus:bg-white"
              placeholder="Example: HVAC installer in Cape Town, emergency repairs, family-owned, wants a premium orange template, targets homeowners in Bellville and Durbanville..."
            />
          </label>
          <button type="submit" className="inline-flex h-11 w-fit items-center gap-2 rounded-full bg-ink px-5 text-sm font-black text-white shadow-[0_12px_26px_rgba(17,17,17,0.16)] transition hover:bg-[#2b2b2b]">
            <Sparkles size={16} />
            {status === "loading" ? "Generating" : "Generate plan"}
          </button>
          {status === "error" && <p className="text-sm font-bold text-[#d92d20]">Gemini could not generate a plan.</p>}
        </div>
      </form>

      {plan && (
        <div className="mt-6 grid gap-4 rounded-[28px] border border-admin-line-soft bg-admin-surface p-5 lg:grid-cols-2 xl:p-6">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#8a8176]">Recommendation</p>
            <h3 className="mt-2 text-2xl font-black tracking-tight text-ink">{plan.templateStyle}</h3>
            <p className="mt-2 text-sm font-semibold leading-6 text-muted">{plan.summary}</p>
            <div className="mt-4 rounded-[22px] border border-admin-line-soft bg-white p-4 shadow-[0_10px_24px_rgba(17,17,17,0.04)]">
              <p className="text-sm font-black text-ink">{plan.hero.headline}</p>
              <p className="mt-2 text-sm leading-6 text-muted">{plan.hero.subheadline}</p>
            </div>
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#8a8176]">UI change plan</p>
            <div className="mt-2 grid gap-3">
              {plan.uiChangePlan.slice(0, 4).map((item) => (
                <article key={`${item.area}-${item.change}`} className="rounded-[20px] border border-admin-line-soft bg-white p-4 shadow-[0_10px_24px_rgba(17,17,17,0.04)]">
                  <p className="text-sm font-black text-ink">{item.area}</p>
                  <p className="mt-1 text-sm font-semibold text-muted">{item.change}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
