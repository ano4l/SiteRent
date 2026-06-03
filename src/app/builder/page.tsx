"use client";

import Link from "next/link";
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  FileText,
  ImageIcon,
  LayoutDashboard,
  MonitorCheck,
  Sparkles,
  UploadCloud,
  Wand2
} from "lucide-react";
import { type FormEvent, useMemo, useState } from "react";
import { TEMPLATE_STYLES } from "@/lib/constants";
import type { TemplateStyle } from "@/lib/types";
import { cn } from "@/lib/utils";

type AiPlan = {
  summary: string;
  templateStyle: TemplateStyle;
  brand: {
    tone: string;
    primaryColour: string;
    accentColour: string;
    typographyDirection: string;
  };
  hero: {
    headline: string;
    subheadline: string;
    primaryCta: string;
    secondaryCta: string;
  };
  sections: Array<{
    key: string;
    title: string;
    purpose: string;
    contentNotes: string;
  }>;
  serviceCopy: Array<{
    serviceKey: string;
    headline: string;
    description: string;
  }>;
  imagePrompts: Array<{
    slot: string;
    prompt: string;
  }>;
  uiChangePlan: Array<{
    area: string;
    change: string;
    rationale: string;
  }>;
  implementationNotes: string[];
};

type BuilderDraft = {
  businessName: string;
  primaryCity: string;
  serviceArea: string;
  contactName: string;
  phone: string;
  email: string;
  servicesAndProof: string;
  plan: AiPlan;
  createdAt: string;
  attachmentNames: string[];
};

const builderDraftStorageKey = "siterent-ai-builder-draft-v2";

export default function BuilderPage() {
  const [businessName, setBusinessName] = useState("");
  const [primaryCity, setPrimaryCity] = useState("");
  const [serviceArea, setServiceArea] = useState("");
  const [contactName, setContactName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [servicesAndProof, setServicesAndProof] = useState("");
  const [mode, setMode] = useState<"create" | "restyle" | "copy-refresh">("create");
  const [preferredTemplateStyle, setPreferredTemplateStyle] = useState<TemplateStyle | "">("coolair-blue");
  const [currentWebsiteContext, setCurrentWebsiteContext] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [provider, setProvider] = useState<"gemini" | null>(null);
  const [plan, setPlan] = useState<AiPlan | null>(null);
  const [attachments, setAttachments] = useState<File[]>([]);

  const businessContext = useMemo(() => {
    return [
      `Business name: ${businessName}`,
      `Primary city: ${primaryCity}`,
      `Service area: ${serviceArea}`,
      `Contact person: ${contactName}`,
      `Phone: ${phone}`,
      `Email: ${email}`,
      `Services, trust proof, and positioning: ${servicesAndProof}`
    ].filter(Boolean).join("\n");
  }, [businessName, contactName, email, phone, primaryCity, serviceArea, servicesAndProof]);

  async function generatePlan(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    const requestBody = new FormData();
    requestBody.set("mode", mode);
    if (preferredTemplateStyle) requestBody.set("preferredTemplateStyle", preferredTemplateStyle);
    requestBody.set("businessContext", businessContext);
    if (currentWebsiteContext) requestBody.set("currentWebsiteContext", currentWebsiteContext);
    attachments.forEach((file) => requestBody.append("attachments", file));

    const response = await fetch("/api/ai/website-plan", {
      method: "POST",
      body: requestBody
    });

    const result = await response.json();
    if (!response.ok) {
      setStatus("error");
      return;
    }

    setPlan(result.plan);
    setProvider(result.provider);
    setStatus("ready");
  }

  function continueToOnboarding() {
    if (!plan) return;

    const draft: BuilderDraft = {
      businessName,
      primaryCity,
      serviceArea,
      contactName,
      phone,
      email,
      servicesAndProof,
      plan,
      createdAt: new Date().toISOString(),
      attachmentNames: attachments.map((file) => file.name)
    };

    window.localStorage.setItem(builderDraftStorageKey, JSON.stringify(draft));
    window.location.assign("/onboarding?fromBuilder=1");
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_16%_12%,rgba(219,234,254,0.78),transparent_30%),radial-gradient(circle_at_88%_14%,rgba(204,251,241,0.58),transparent_32%),linear-gradient(135deg,var(--app-bg)_0%,var(--app-bg-soft)_100%)] p-5 text-foreground md:p-8">
      <div className="ui-enter mx-auto min-h-[calc(100vh-4rem)] max-w-7xl overflow-hidden rounded-[28px] border border-white/80 bg-white shadow-[0_32px_90px_rgba(15,23,42,0.14)]">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-app-line-soft px-6 py-5 md:px-8">
          <Link href="/" className="flex items-center gap-3 text-lg font-bold">
            <SiteRentBuilderMark />
            SiteRent
          </Link>
          <div className="flex flex-wrap gap-2">
            <Link href="/onboarding" className="inline-flex items-center gap-2 rounded-xl border border-app-line bg-white px-4 py-2.5 text-sm font-semibold text-foreground transition hover:border-app-line-strong">
              Manual onboarding
            </Link>
            <Link href="/dashboard" className="inline-flex items-center gap-2 rounded-xl border border-app-line bg-app-surface px-4 py-2.5 text-sm font-semibold text-foreground transition hover:bg-white">
              <LayoutDashboard className="size-4" />
              Dashboard
            </Link>
          </div>
        </header>

        <section className="grid gap-0 lg:grid-cols-[440px_minmax(0,1fr)]">
          <aside className="border-b border-app-line-soft bg-app-surface-strong p-6 lg:border-b-0 lg:border-r lg:p-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-muted-foreground shadow-sm">
              <Sparkles className="size-4 text-blue-600" />
              AI website builder
            </div>
            <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight">Generate the first useful website draft.</h1>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              This builder creates a structured website plan, then hands the draft into onboarding so the user can confirm details and publish.
            </p>

            <form onSubmit={generatePlan} className="mt-7 space-y-4">
              <Field label="Business name" value={businessName} onChange={setBusinessName} required />
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Primary city" value={primaryCity} onChange={setPrimaryCity} required />
                <Field label="Contact person" value={contactName} onChange={setContactName} />
              </div>
              <Field label="Suburbs or service area" value={serviceArea} onChange={setServiceArea} />
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Phone" value={phone} onChange={setPhone} />
                <Field label="Email" value={email} onChange={setEmail} type="email" />
              </div>
              <Textarea
                label="Services and proof"
                value={servicesAndProof}
                onChange={setServicesAndProof}
                minLength={20}
                required
                placeholder="Services, guarantees, certifications, response time, tone, ideal customers."
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block text-sm font-semibold text-foreground">
                  Mode
                  <select value={mode} onChange={(event) => setMode(event.target.value as typeof mode)} className="mt-2 h-12 w-full rounded-xl border border-app-line bg-white px-4 text-sm outline-none transition hover:border-app-border-hover focus:border-app-line-strong focus:ring-4 focus:ring-app-line-strong/10">
                    <option value="create">Create website</option>
                    <option value="restyle">Restyle website</option>
                    <option value="copy-refresh">Copy refresh</option>
                  </select>
                </label>
                <label className="block text-sm font-semibold text-foreground">
                  Style
                  <select value={preferredTemplateStyle} onChange={(event) => setPreferredTemplateStyle(event.target.value as TemplateStyle | "")} className="mt-2 h-12 w-full rounded-xl border border-app-line bg-white px-4 text-sm outline-none transition hover:border-app-border-hover focus:border-app-line-strong focus:ring-4 focus:ring-app-line-strong/10">
                    <option value="">Let AI choose</option>
                    {Object.entries(TEMPLATE_STYLES).map(([key, style]) => (
                      <option key={key} value={key}>{style.label}</option>
                    ))}
                  </select>
                </label>
              </div>
              <Textarea
                label="Existing website notes"
                value={currentWebsiteContext}
                onChange={setCurrentWebsiteContext}
                placeholder="Optional: paste weak copy, design complaints, old site notes, or customer requests."
              />
              <AiAttachmentPicker files={attachments} onChange={setAttachments} />
              <button
                type="submit"
                disabled={status === "loading"}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-foreground px-5 py-3.5 text-sm font-bold text-white shadow-[0_18px_34px_rgba(15,23,42,0.18)] transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Wand2 className="size-4" />
                {status === "loading" ? "Generating plan..." : "Generate website plan"}
              </button>
              <div role="status" aria-live="polite">
                {status === "error" && <p className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">The AI builder could not generate a plan. Check the details and retry.</p>}
              </div>
            </form>
          </aside>

          <section className="p-6 md:p-8">
            {plan ? (
              <PlanResult plan={plan} provider={provider} onContinue={continueToOnboarding} />
            ) : (
              <BuilderEmptyState />
            )}
          </section>
        </section>
      </div>
    </main>
  );
}

function PlanResult({ plan, provider, onContinue }: { plan: AiPlan; provider: "gemini" | null; onContinue: () => void }) {
  const template = TEMPLATE_STYLES[plan.templateStyle] ?? TEMPLATE_STYLES["aireco-dark"];

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[24px] border border-white/74 bg-white/72 shadow-[0_22px_60px_rgba(15,23,42,0.08)] ring-1 ring-white/70">
        <div className="grid gap-0 xl:grid-cols-[1fr_360px]">
          <div className="p-6 md:p-7">
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                <Bot className="size-3.5" />
                {provider === "gemini" ? "Gemini plan" : "AI plan"}
              </span>
              <span className="rounded-full bg-app-surface px-3 py-1 text-xs font-bold text-muted-foreground">{template.label}</span>
            </div>
            <h2 className="mt-5 text-3xl font-bold tracking-tight">{plan.hero.headline}</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground">{plan.hero.subheadline}</p>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-muted-foreground">{plan.summary}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button type="button" onClick={onContinue} className="inline-flex items-center gap-2 rounded-xl bg-foreground px-5 py-3 text-sm font-bold text-white transition hover:bg-black">
                Use this draft in onboarding
                <ArrowRight className="size-4" />
              </button>
              <Link href={`/onboarding?template=${plan.templateStyle}`} className="inline-flex items-center gap-2 rounded-xl border border-app-line bg-white px-5 py-3 text-sm font-bold text-foreground transition hover:border-app-line-strong">
                Open onboarding manually
              </Link>
            </div>
          </div>
          <div className="border-t border-white/70 bg-app-surface p-5 xl:border-l xl:border-t-0">
            <TemplateMiniPreview plan={plan} />
          </div>
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <section className="rounded-[24px] border border-white/74 bg-white/72 p-6 shadow-[0_22px_60px_rgba(15,23,42,0.08)] ring-1 ring-white/70">
          <SectionTitle icon={MonitorCheck} title="Page structure" />
          <div className="mt-4 grid gap-3">
            {plan.sections.slice(0, 5).map((section) => (
              <article key={section.key} className="rounded-2xl border border-app-line bg-white p-4">
                <p className="font-bold text-foreground">{section.title}</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">{section.contentNotes}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-[24px] border border-white/74 bg-white/72 p-6 shadow-[0_22px_60px_rgba(15,23,42,0.08)] ring-1 ring-white/70">
          <SectionTitle icon={ImageIcon} title="Images and implementation" />
          <div className="mt-4 space-y-3">
            {plan.imagePrompts.slice(0, 3).map((image) => (
              <div key={image.slot} className="rounded-2xl border border-app-line bg-app-surface-strong p-4">
                <p className="text-sm font-bold capitalize text-foreground">{image.slot}</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">{image.prompt}</p>
              </div>
            ))}
            {plan.uiChangePlan.slice(0, 3).map((item) => (
              <div key={`${item.area}-${item.change}`} className="rounded-2xl border border-app-line bg-white p-4">
                <p className="text-sm font-bold text-foreground">{item.area}</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">{item.change}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function BuilderEmptyState() {
  return (
    <div className="grid min-h-[680px] place-items-center">
      <div className="max-w-2xl text-center">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-foreground text-white">
          <Wand2 className="size-6" />
        </span>
        <h2 className="mt-5 text-3xl font-bold tracking-tight">Your plan will appear here.</h2>
        <p className="mt-3 text-sm leading-7 text-muted-foreground">
          Generate a site direction, review the structure, then continue into onboarding with the business name, city, services, template, and contact details already filled.
        </p>
        <div className="mt-6 grid gap-3 text-left md:grid-cols-3">
          {["Template direction", "Hero copy", "Onboarding draft"].map((item) => (
            <div key={item} className="rounded-2xl border border-app-line bg-app-surface-strong p-4 text-sm font-semibold">
              <CheckCircle2 className="mb-3 size-5 text-blue-600" />
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AiAttachmentPicker({ files, onChange }: { files: File[]; onChange: (files: File[]) => void }) {
  return (
    <div className="rounded-2xl border border-app-line bg-white p-4">
      <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-app-line bg-app-surface-strong px-4 py-6 text-center transition hover:border-app-line-strong">
        <UploadCloud className="size-6 text-blue-600" />
        <span className="mt-2 text-sm font-bold text-foreground">Upload AI references</span>
        <span className="mt-1 text-xs leading-5 text-muted-foreground">Images, PDFs, markdown, text, or JSON. Up to 6 files, 8MB each.</span>
        <input
          type="file"
          className="sr-only"
          multiple
          accept="image/png,image/jpeg,image/webp,application/pdf,text/plain,text/markdown,application/json,.md,.txt,.json,.pdf"
          onChange={(event) => onChange(Array.from(event.target.files ?? []).slice(0, 6))}
        />
      </label>
      {files.length > 0 && (
        <div className="mt-3 grid gap-2">
          {files.map((file) => (
            <div key={`${file.name}-${file.size}`} className="flex items-center gap-3 rounded-xl bg-app-surface px-3 py-2 text-sm">
              <FileText className="size-4 text-muted-foreground" />
              <span className="min-w-0 flex-1 truncate font-semibold text-foreground">{file.name}</span>
              <span className="text-xs text-muted-foreground">{Math.max(file.size / 1024 / 1024, 0.01).toFixed(2)} MB</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TemplateMiniPreview({ plan }: { plan: AiPlan }) {
  const template = TEMPLATE_STYLES[plan.templateStyle] ?? TEMPLATE_STYLES["aireco-dark"];

  return (
    <div className="overflow-hidden rounded-2xl border border-white/80 bg-white shadow-sm">
      <div className="p-5 text-white" style={{ background: `linear-gradient(135deg,${template.canvas},${template.accent})` }}>
        <div className="flex items-center justify-between text-xs font-bold">
          <span>{template.label}</span>
          <span className="rounded-full bg-white/20 px-3 py-1">{plan.hero.primaryCta}</span>
        </div>
        <h3 className="mt-12 text-3xl font-black leading-tight">{plan.hero.headline}</h3>
        <p className="mt-3 text-sm text-white/78">{plan.hero.subheadline}</p>
      </div>
      <div className="grid gap-3 p-4">
        {plan.sections.slice(0, 3).map((section) => (
          <div key={section.key} className="rounded-xl bg-app-surface p-3">
            <p className="text-sm font-bold">{section.title}</p>
            <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">{section.purpose}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function SectionTitle({ icon: Icon, title }: { icon: typeof MonitorCheck; title: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="grid size-10 place-items-center rounded-xl bg-app-surface text-foreground">
        <Icon className="size-5" />
      </span>
      <h2 className="text-xl font-bold tracking-tight">{title}</h2>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", required = false }: { label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean }) {
  return (
    <label className="block text-sm font-semibold text-foreground">
      {label}
      <input
        type={type}
        required={required}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-12 w-full rounded-xl border border-app-line bg-white px-4 text-sm outline-none transition hover:border-app-border-hover focus:border-app-line-strong focus:ring-4 focus:ring-app-line-strong/10"
      />
    </label>
  );
}

function Textarea({ label, value, onChange, required = false, minLength, placeholder }: { label: string; value: string; onChange: (value: string) => void; required?: boolean; minLength?: number; placeholder?: string }) {
  return (
    <label className="block text-sm font-semibold text-foreground">
      {label}
      <textarea
        required={required}
        minLength={minLength}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 min-h-28 w-full rounded-xl border border-app-line bg-white px-4 py-3 text-sm outline-none transition placeholder:text-muted-foreground hover:border-app-border-hover focus:border-app-line-strong focus:ring-4 focus:ring-app-line-strong/10"
      />
    </label>
  );
}

function SiteRentBuilderMark() {
  return (
    <span className="grid size-9 shrink-0 grid-cols-2 gap-1 rounded-lg bg-brand-mint p-1">
      <span className="rounded-[4px] bg-brand-green-500" />
      <span className="rounded-[4px] bg-brand-green-300" />
      <span className="rounded-[4px] bg-brand-green-300" />
      <span className="rounded-[4px] bg-brand-green-700" />
    </span>
  );
}
