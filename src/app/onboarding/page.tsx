"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, CheckCircle2, Clock, Globe2, ImageIcon, MonitorCheck, Rocket, Sparkles, Upload } from "lucide-react";
import { BRAND_COLOURS, INDUSTRY_TEMPLATES, ONBOARDING_STEPS, RESPONSE_TIMES, SERVICE_CATALOG, TEMPLATE_STYLES, WEEK_DAYS } from "@/lib/constants";
import type { TemplateStyle } from "@/lib/types";
import { cn, slugifySubdomain } from "@/lib/utils";

type IndustryTemplate = keyof typeof INDUSTRY_TEMPLATES;

type TestimonialInput = {
  name: string;
  suburb: string;
  quote: string;
};

type HoursInput = Record<
  string,
  {
    open: string;
    close: string;
    closed: boolean;
  }
>;

type FormState = {
  businessType: IndustryTemplate;
  tradingName: string;
  tagline: string;
  ownerName: string;
  yearFounded: string;
  jobsCompleted: string;
  aboutText: string;
  services: string[];
  servicePrices: Record<string, string>;
  customServices: { key: string; label: string; price?: string }[];
  certifications: string;
  isInsured: boolean;
  hasGuarantee: boolean;
  guaranteePeriod: string;
  hasEmergency: boolean;
  offersFreeQuote: boolean;
  primaryCity: string;
  address: string;
  suburbs: string;
  testimonials: TestimonialInput[];
  phone: string;
  whatsapp: string;
  email: string;
  responseTime: string;
  hours: HoursInput;
  facebookUrl: string;
  instagramUrl: string;
  pixelId: string;
  visualDirection: string;
  templateStyle: TemplateStyle;
  brandColour: keyof typeof BRAND_COLOURS;
  logoUrl: string;
  heroPhotoUrl: string;
  ownerPhotoUrl: string;
  subdomain: string;
  customDomain: string;
  terms: boolean;
};

type AiBuilderDraft = {
  businessName?: string;
  primaryCity?: string;
  serviceArea?: string;
  contactName?: string;
  phone?: string;
  email?: string;
  servicesAndProof?: string;
  visualDirection?: string;
  plan?: {
    summary?: string;
    templateStyle?: string;
    hero?: {
      headline?: string;
      subheadline?: string;
    };
    serviceCopy?: Array<{
      serviceKey?: string;
      headline?: string;
      description?: string;
    }>;
    uiChangePlan?: Array<{
      area?: string;
      change?: string;
    }>;
  };
};

const emptyTestimonials: TestimonialInput[] = [
  { name: "", suburb: "", quote: "" },
  { name: "", suburb: "", quote: "" },
  { name: "", suburb: "", quote: "" }
];

const defaultHours: HoursInput = Object.fromEntries(
  WEEK_DAYS.map((day) => [day, { open: "08:00", close: "17:00", closed: day === "Sunday" }])
);

const initialState: FormState = {
  businessType: "hvac",
  tradingName: "",
  tagline: "",
  ownerName: "",
  yearFounded: "",
  jobsCompleted: "",
  aboutText: "",
  services: [],
  servicePrices: {},
  customServices: [],
  certifications: "",
  isInsured: true,
  hasGuarantee: false,
  guaranteePeriod: "12 months",
  hasEmergency: false,
  offersFreeQuote: true,
  primaryCity: "",
  address: "",
  suburbs: "",
  testimonials: emptyTestimonials,
  phone: "",
  whatsapp: "",
  email: "",
  responseTime: RESPONSE_TIMES[1],
  hours: defaultHours,
  facebookUrl: "",
  instagramUrl: "",
  pixelId: "",
  visualDirection: "",
  templateStyle: "aireco-dark",
  brandColour: "navy",
  logoUrl: "",
  heroPhotoUrl: "",
  ownerPhotoUrl: "",
  subdomain: "",
  customDomain: "",
  terms: false
};

const localStorageKey = "siterent-onboarding-v2";
const legacyLocalStorageKeys = ["siterent-onboarding-v1"];
const aiBuilderDraftStorageKey = "siterent-ai-builder-draft-v2";

function isIndustryTemplate(value: unknown): value is IndustryTemplate {
  return typeof value === "string" && value in INDUSTRY_TEMPLATES;
}

function coerceFormState(value?: Partial<FormState>) {
  const form = { ...initialState, ...value };
  if (!isIndustryTemplate(form.businessType)) form.businessType = "hvac";
  if (!(form.templateStyle in TEMPLATE_STYLES)) form.templateStyle = "aireco-dark";
  return form;
}

function inferIndustryTemplate(draft: AiBuilderDraft): IndustryTemplate {
  const text = [
    draft.businessName,
    draft.servicesAndProof,
    draft.visualDirection,
    draft.plan?.summary,
    draft.plan?.hero?.headline,
    draft.plan?.hero?.subheadline,
    ...(draft.plan?.serviceCopy?.map((item) => `${item.serviceKey ?? ""} ${item.headline ?? ""} ${item.description ?? ""}`) ?? [])
  ].join(" ").toLowerCase();

  for (const [key, template] of Object.entries(INDUSTRY_TEMPLATES) as Array<[IndustryTemplate, (typeof INDUSTRY_TEMPLATES)[IndustryTemplate]]>) {
    const haystack = [key, template.label, template.singular, ...template.serviceKeys].join(" ").toLowerCase();
    if (haystack.split(/\s+/).some((word) => word.length > 4 && text.includes(word))) return key;
  }

  return "hvac";
}

function servicesFromAiDraft(draft: AiBuilderDraft, industry: IndustryTemplate) {
  const text = [
    draft.servicesAndProof,
    draft.plan?.summary,
    draft.plan?.hero?.headline,
    ...(draft.plan?.serviceCopy?.map((item) => `${item.serviceKey ?? ""} ${item.headline ?? ""} ${item.description ?? ""}`) ?? [])
  ].join(" ").toLowerCase();

  const selected = SERVICE_CATALOG
    .filter((service) => {
      const labelWords = service.label.toLowerCase().split(/\s+/);
      return text.includes(service.key) || labelWords.some((word) => word.length > 4 && text.includes(word));
    })
    .map((service) => service.key);

  return selected.length ? selected : [...INDUSTRY_TEMPLATES[industry].serviceKeys];
}

function formFromAiDraft(draft: AiBuilderDraft, current: FormState): FormState {
  const businessType = inferIndustryTemplate(draft);
  const template = INDUSTRY_TEMPLATES[businessType];
  const businessName = draft.businessName?.trim() || current.tradingName;
  const templateStyle =
    draft.plan?.templateStyle && draft.plan.templateStyle in TEMPLATE_STYLES
      ? (draft.plan.templateStyle as TemplateStyle)
      : template.defaultTemplateStyle;
  const aiVisualDirection = [
    draft.visualDirection,
    ...(draft.plan?.uiChangePlan?.map((item) => [item.area, item.change].filter(Boolean).join(": ")) ?? [])
  ].filter(Boolean).join("\n");

  return {
    ...current,
    businessType,
    tradingName: businessName,
    tagline: draft.plan?.hero?.subheadline?.trim() || template.defaultTagline,
    ownerName: draft.contactName?.trim() || current.ownerName,
    aboutText: draft.plan?.summary?.trim() || draft.servicesAndProof?.trim() || template.defaultAbout,
    services: servicesFromAiDraft(draft, businessType),
    certifications: current.certifications || template.defaultCertifications,
    primaryCity: draft.primaryCity?.trim() || current.primaryCity,
    suburbs: draft.serviceArea?.trim() || current.suburbs,
    phone: draft.phone?.trim() || current.phone,
    whatsapp: draft.phone?.trim() || current.whatsapp,
    email: draft.email?.trim() || current.email,
    visualDirection: aiVisualDirection || current.visualDirection,
    templateStyle,
    brandColour: template.defaultBrandColour,
    subdomain: businessName ? slugifySubdomain(businessName) : current.subdomain
  };
}

function suggestedServicePrices(serviceKeys: readonly string[], existing: Record<string, string> = {}) {
  const prices: Record<string, string> = {};
  for (const key of serviceKeys) {
    if (existing[key]) {
      prices[key] = existing[key];
      continue;
    }
    const service = SERVICE_CATALOG.find((item) => item.key === key);
    prices[key] = service ? String(service.startingPrice) : "";
  }
  return prices;
}

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(initialState);
  const [clientId, setClientId] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [submitStatus, setSubmitStatus] = useState<"idle" | "submitting" | "submitted" | "error">("idle");
  const [subdomainStatus, setSubdomainStatus] = useState<"idle" | "checking" | "available" | "taken" | "invalid">("idle");

  const percent = Math.round(((step + 1) / ONBOARDING_STEPS.length) * 100);
  const theme = BRAND_COLOURS[form.brandColour];
  const industryTemplate = INDUSTRY_TEMPLATES[form.businessType];
  const recommendedServices = useMemo(() => {
    const keys = new Set([...industryTemplate.serviceKeys, ...form.services]);
    return SERVICE_CATALOG.filter((service) => keys.has(service.key));
  }, [form.services, industryTemplate.serviceKeys]);
  const activationTasks = [
    { label: "Business identity", done: Boolean(form.tradingName && form.ownerName) },
    { label: "Service area", done: Boolean(form.services.length && form.primaryCity) },
    { label: "Live contact route", done: Boolean(form.phone && form.email) },
    { label: "Hostable address", done: Boolean(form.subdomain) }
  ];

  const previewTitle = useMemo(() => {
    const city = form.primaryCity || "your city";
    return `${form.tradingName || "Your Service Business"} in ${city}`;
  }, [form.primaryCity, form.tradingName]);

  useEffect(() => {
    const saved = window.localStorage.getItem(localStorageKey) ?? legacyLocalStorageKeys
      .map((key) => window.localStorage.getItem(key))
      .find(Boolean);
    if (!saved) return;

    try {
      const payload = JSON.parse(saved) as { form?: FormState; step?: number; clientId?: string };
      if (payload.form) {
        setForm(coerceFormState(payload.form));
      }
      if (typeof payload.step === "number") setStep(Math.min(Math.max(payload.step, 0), 5));
      if (payload.clientId) setClientId(payload.clientId);
      setSaveStatus("saved");
    } catch {
      window.localStorage.removeItem(localStorageKey);
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fromBuilder = params.get("fromBuilder") === "1";
    const requestedTemplate = params.get("template");
    const requestedStep = Number(params.get("step"));

    if (params.get("demo") === "1") {
      params.delete("demo");
      const nextQuery = params.toString();
      window.history.replaceState(null, "", nextQuery ? `/onboarding?${nextQuery}` : "/onboarding");
    }

    if (fromBuilder) {
      const draftJson = window.localStorage.getItem(aiBuilderDraftStorageKey);
      if (draftJson) {
        try {
          const draft = JSON.parse(draftJson) as AiBuilderDraft;
          const nextForm = formFromAiDraft(draft, initialState);
          setForm(nextForm);
          setStep(0);
          setSaveStatus("saved");
          window.localStorage.setItem(localStorageKey, JSON.stringify({ form: nextForm, step: 0, clientId: null }));
          window.localStorage.removeItem(aiBuilderDraftStorageKey);
        } catch {
          window.localStorage.removeItem(aiBuilderDraftStorageKey);
        }
      }
    }

    if (requestedTemplate && requestedTemplate in TEMPLATE_STYLES) {
      update("templateStyle", requestedTemplate as TemplateStyle);
    }
    if (Number.isInteger(requestedStep) && requestedStep >= 0 && requestedStep < ONBOARDING_STEPS.length) {
      setStep(requestedStep);
    }
  }, []);

  useEffect(() => {
    if (step !== 5 || form.subdomain.length < 3) {
      setSubdomainStatus("idle");
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      setSubdomainStatus("checking");
      try {
        const response = await fetch(`/api/subdomains/check?subdomain=${encodeURIComponent(form.subdomain)}`, {
          signal: controller.signal
        });
        const payload = (await response.json()) as { available?: boolean };
        setSubdomainStatus(payload.available ? "available" : "taken");
      } catch {
        if (!controller.signal.aborted) setSubdomainStatus("invalid");
      }
    }, 350);

    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [form.subdomain, step]);

  function update<Key extends keyof FormState>(key: Key, value: FormState[Key]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function updateHour(day: string, field: keyof HoursInput[string], value: string | boolean) {
    setForm((current) => ({
      ...current,
      hours: {
        ...current.hours,
        [day]: {
          ...current.hours[day],
          [field]: value
        }
      }
    }));
  }

  function applyIndustryTemplate(key: IndustryTemplate) {
    const template = INDUSTRY_TEMPLATES[key];
    setForm((current) => ({
      ...current,
      businessType: key,
      tagline: current.tagline || template.defaultTagline,
      aboutText: current.aboutText || template.defaultAbout,
      services: [...template.serviceKeys],
      certifications: current.certifications || template.defaultCertifications,
      templateStyle: template.defaultTemplateStyle,
      brandColour: template.defaultBrandColour,
      servicePrices: suggestedServicePrices(template.serviceKeys, current.servicePrices)
    }));
  }

  function addCustomService(label: string, price?: string) {
    const key = slugifySubdomain(label).replace(/[^a-z0-9\-]/g, "");
    const exists = form.customServices.some((s) => s.key === key) || SERVICE_CATALOG.some((s) => s.key === key);
    const uniqueKey = exists ? `${key}-${Date.now().toString().slice(-4)}` : key;
    setForm((current) => ({
      ...current,
      customServices: [...current.customServices, { key: uniqueKey, label, price }],
      services: [...current.services, uniqueKey],
      servicePrices: { ...current.servicePrices, [uniqueKey]: price ?? "" }
    }));
  }

  function removeCustomService(key: string) {
    setForm((current) => ({
      ...current,
      customServices: current.customServices.filter((s) => s.key !== key),
      services: current.services.filter((s) => s !== key),
      servicePrices: Object.fromEntries(Object.entries(current.servicePrices).filter(([k]) => k !== key))
    }));
  }

  function updateTestimonial(index: number, field: keyof TestimonialInput, value: string) {
    setForm((current) => ({
      ...current,
      testimonials: current.testimonials.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      )
    }));
  }

  function toggleService(service: string) {
    setForm((current) => ({
      ...current,
      services: current.services.includes(service)
        ? current.services.filter((item) => item !== service)
        : [...current.services, service]
    }));
  }

  function validateCurrentStep() {
    const missing: string[] = [];
    if (step === 0) {
      if (!form.tradingName) missing.push("Trading name");
      if (!form.aboutText) missing.push("About paragraph");
    }
    if (step === 1) {
      if (form.services.length === 0) missing.push("At least one service");
      if (!form.primaryCity) missing.push("Primary city");
      if (!form.suburbs) missing.push("Suburbs served");
    }
    if (step === 3) {
      if (!form.phone) missing.push("Primary phone");
      if (!form.whatsapp) missing.push("WhatsApp number");
      if (!form.email) missing.push("Business email");
    }
    if (step === 5) {
      if (!form.subdomain) missing.push("Subdomain");
      if (subdomainStatus === "taken") missing.push("Available subdomain");
      if (!form.terms) missing.push("Terms checkbox");
    }
    setErrors(missing);
    return missing.length === 0;
  }

  async function saveProgress(nextStep: number, data: FormState = form) {
    setSaveStatus("saving");
    window.localStorage.setItem(localStorageKey, JSON.stringify({ form: data, step, clientId }));

    const response = await fetch("/api/onboarding/save", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        clientId: clientId && clientId !== "local-client" ? clientId : undefined,
        currentStep: nextStep,
        data
      })
    });

    if (!response.ok) {
      setSaveStatus("error");
      return false;
    }

    const payload = (await response.json()) as { clientId?: string };
    const nextClientId = payload.clientId ?? clientId;
    if (nextClientId) setClientId(nextClientId);
    window.localStorage.setItem(localStorageKey, JSON.stringify({ form: data, step: nextStep, clientId: nextClientId }));
    setSaveStatus("saved");
    return true;
  }

  async function continueStep() {
    if (!validateCurrentStep()) return;

    const nextForm =
      step === 0 && !form.subdomain && form.tradingName
        ? { ...form, subdomain: slugifySubdomain(form.tradingName) }
        : form;

    if (nextForm !== form) setForm(nextForm);

    const saved = await saveProgress(step + 1, nextForm);
    if (!saved) return;

    if (step < ONBOARDING_STEPS.length - 1) {
      setStep((current) => current + 1);
    }
  }

  async function submitBuildRequest() {
    if (!validateCurrentStep()) return;

    setSubmitStatus("submitting");
    const saved = await saveProgress(6);
    if (!saved) {
      setSubmitStatus("error");
      setSaveStatus("error");
      return;
    }

    setSubmitStatus("submitted");
    window.localStorage.removeItem(localStorageKey);
    window.location.assign("/dashboard");
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_12%_10%,rgba(219,234,254,0.86),transparent_30%),radial-gradient(circle_at_88%_12%,rgba(204,251,241,0.52),transparent_32%),linear-gradient(135deg,#f2f4f8_0%,#eef2f6_100%)] p-3 text-foreground sm:p-5 md:p-8">
      <div className="ui-enter mx-auto grid min-h-[calc(100vh-1.5rem)] max-w-7xl overflow-hidden rounded-[22px] border border-white/80 bg-white shadow-[0_32px_90px_rgba(15,23,42,0.14)] sm:min-h-[calc(100vh-2.5rem)] md:rounded-[28px] lg:grid-cols-[250px_minmax(0,1fr)_420px]">
        <aside className="border-b border-[#edf0f4] bg-white p-4 sm:p-6 lg:border-b-0 lg:border-r">
          <Link href="/dashboard" className="flex items-center gap-3 text-lg font-bold">
            <SiteRentOnboardingMark />
            SiteRent
          </Link>
          <div className="mt-8 lg:mt-16">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Create website</p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight">Build request</h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">Capture the website direction, contact details, and draft address. Publishing is paused while Supabase production setup is restored.</p>
          </div>
          <div className="mt-8 flex gap-3">
            {ONBOARDING_STEPS.map((label, index) => (
              <span key={label} className={cn("h-1.5 flex-1 rounded-full transition-all duration-500", index <= step ? "bg-foreground" : "bg-[#e5e7eb]")} />
            ))}
          </div>
          <div className="mt-3 text-sm font-medium text-muted-foreground">{percent}% complete</div>
          <nav className="mt-6 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] lg:mt-8 lg:block lg:space-y-2 lg:overflow-visible lg:pb-0 [&::-webkit-scrollbar]:hidden">
            {ONBOARDING_STEPS.map((label, index) => (
              <button
                key={label}
                type="button"
                onClick={() => index <= step && setStep(index)}
                className={cn(
                  "pressable flex shrink-0 items-center gap-2 rounded-full px-3 py-2.5 text-left text-sm font-medium transition hover:bg-[#f4f6f8] lg:w-full lg:shrink lg:gap-3 lg:rounded-xl",
                  index === step && "bg-[#f4f6f8] text-foreground",
                  index < step && "text-blue-700",
                  index > step && "text-muted-foreground"
                )}
              >
                <span className={cn("grid size-6 place-items-center rounded-full border text-xs", index <= step ? "border-foreground text-foreground" : "border-border")}>
                  {index < step ? <Check size={13} /> : index + 1}
                </span>
                {label}
              </button>
            ))}
          </nav>
          <div className="mt-6 rounded-xl bg-[#f4f6f8] p-3 lg:mt-8">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">First-value checklist</p>
            <div className="mt-3 space-y-2">
              {activationTasks.map((task) => (
                <div key={task.label} className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                  <span className={cn("grid size-5 place-items-center rounded-full", task.done ? "bg-emerald-100 text-emerald-700" : "bg-white text-muted-foreground")}>
                    {task.done ? <Check size={12} /> : null}
                  </span>
                  {task.label}
                </div>
              ))}
            </div>
          </div>
          <p className="mt-3 rounded-xl bg-[#f4f6f8] p-3 text-xs font-medium leading-5 text-muted-foreground">
            {saveStatus === "idle" && "Progress saves when you continue."}
            {saveStatus === "saving" && "Saving progress..."}
            {saveStatus === "saved" && (submitStatus === "submitted" ? "Build request submitted." : "Progress saved.")}
            {saveStatus === "error" && "Could not save. Please retry."}
          </p>
        </aside>

          <section className="stagger overflow-hidden border-[#edf0f4] bg-white p-4 sm:p-6 md:p-10 lg:border-r">
            <OnboardingMomentum step={step} percent={percent} />
            {errors.length > 0 && (
              <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-800">
                Please complete: {errors.join(", ")}.
              </div>
            )}
            {step === 0 && (
              <div className="space-y-4">
                <StepTitle title="Business basics" copy="Pick the closest business type to load a ready-made starter template, then edit any detail to match the business." />
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {(Object.entries(INDUSTRY_TEMPLATES) as Array<[IndustryTemplate, (typeof INDUSTRY_TEMPLATES)[IndustryTemplate]]>).map(([key, template]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => applyIndustryTemplate(key)}
                      className={cn(
                        "rounded-2xl border bg-white p-4 text-left transition hover:-translate-y-0.5 hover:border-[#111827] hover:shadow-[0_14px_34px_rgba(15,23,42,0.08)]",
                        form.businessType === key ? "border-[#111827] ring-2 ring-[#111827]/10" : "border-[#e5e7eb]"
                      )}
                    >
                      <span className="text-sm font-bold text-foreground">{template.label}</span>
                      <span className="mt-2 block text-xs leading-5 text-muted-foreground">{template.defaultTagline}</span>
                    </button>
                  ))}
                </div>
                <TextInput label="Trading name" value={form.tradingName} onChange={(value) => update("tradingName", value)} />
                <TextInput label="Tagline" value={form.tagline} onChange={(value) => update("tagline", value)} />
                <div className="grid gap-4 md:grid-cols-3">
                  <TextInput label="Owner name" value={form.ownerName} onChange={(value) => update("ownerName", value)} />
                  <TextInput label="Year founded" value={form.yearFounded} onChange={(value) => update("yearFounded", value)} />
                  <TextInput label="Jobs completed" value={form.jobsCompleted} onChange={(value) => update("jobsCompleted", value)} />
                </div>
                <TextArea label="About paragraph" value={form.aboutText} onChange={(value) => update("aboutText", value)} />
              </div>
            )}

            {step === 1 && (
              <div className="space-y-5">
                <StepTitle title="Services, trust and area" copy={`Choose the ${industryTemplate.label.toLowerCase()} services, proof points, and areas this business covers.`} />
                <div className="grid gap-3 md:grid-cols-2">
                  {recommendedServices.map((service) => {
                    const serviceInputId = `service-${service.key}`;
                    const priceInputId = `service-price-${service.key}`;

                    return (
                      <div key={service.key} className="rounded-lg border border-border bg-background p-4 transition hover:border-[#c7c7c7]">
                        <div className="flex items-start gap-3">
                          <input
                            id={serviceInputId}
                            type="checkbox"
                            checked={form.services.includes(service.key)}
                            onChange={() => toggleService(service.key)}
                            className="mt-1"
                          />
                          <span className="min-w-0 flex-1">
                            <label htmlFor={serviceInputId} className="block font-semibold">{service.label}</label>
                            <span className="block text-sm leading-6 text-muted-foreground">{service.description}</span>
                            <label htmlFor={priceInputId} className="sr-only">Starting price for {service.label}</label>
                            <input
                              id={priceInputId}
                              className="mt-3 h-10 w-full rounded-lg border border-border bg-card px-3 text-sm outline-none transition focus:border-foreground focus:ring-2 focus:ring-ring/20"
                              placeholder="Starting price, e.g. 650"
                              value={form.servicePrices[service.key] ?? ""}
                              onChange={(event) =>
                                setForm((current) => ({
                                  ...current,
                                  servicePrices: { ...current.servicePrices, [service.key]: event.target.value }
                                }))
                              }
                            />
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  {form.customServices.map((service) => (
                    <div key={service.key} className="rounded-lg border border-border bg-background p-4 transition hover:border-[#c7c7c7]">
                      <div className="flex items-start gap-3">
                        <input
                          id={`service-${service.key}`}
                          type="checkbox"
                          checked={form.services.includes(service.key)}
                          onChange={() => toggleService(service.key)}
                          className="mt-1"
                        />
                        <span className="min-w-0 flex-1">
                          <label htmlFor={`service-${service.key}`} className="block font-semibold">{service.label}</label>
                          <span className="block text-sm leading-6 text-muted-foreground">Custom service added for this business.</span>
                          <input
                            className="mt-3 h-10 w-full rounded-lg border border-border bg-card px-3 text-sm outline-none transition focus:border-foreground focus:ring-2 focus:ring-ring/20"
                            placeholder="Starting price"
                            value={form.servicePrices[service.key] ?? service.price ?? ""}
                            onChange={(event) =>
                              setForm((current) => ({
                                ...current,
                                servicePrices: { ...current.servicePrices, [service.key]: event.target.value }
                              }))
                            }
                          />
                          <button type="button" onClick={() => removeCustomService(service.key)} className="mt-3 text-xs font-bold text-red-700">
                            Remove custom service
                          </button>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <AddCustomService onAdd={addCustomService} />
                <div className="grid gap-4 md:grid-cols-2">
                  <TextInput label="Primary city" value={form.primaryCity} onChange={(value) => update("primaryCity", value)} />
                  <TextInput label="Business address" value={form.address} onChange={(value) => update("address", value)} />
                </div>
                <TextInput label="Suburbs served" value={form.suburbs} onChange={(value) => update("suburbs", value)} />
                <TextInput label="Certifications" value={form.certifications} onChange={(value) => update("certifications", value)} />
                <ToggleGrid form={form} update={update} />
                {form.hasGuarantee && (
                  <TextInput label="Guarantee period" value={form.guaranteePeriod} onChange={(value) => update("guaranteePeriod", value)} />
                )}
                <div className="rounded-lg border border-border bg-background p-4">
                  <h2 className="font-semibold">Testimonials</h2>
                  <div className="mt-4 grid gap-4">
                    {form.testimonials.map((testimonial, index) => (
                      <div key={index} className="grid gap-3 rounded-lg bg-secondary p-3 md:grid-cols-3">
                        <input
                          className="h-10 rounded-lg border border-border bg-card px-3 text-sm outline-none transition focus:border-foreground focus:ring-2 focus:ring-ring/20"
                          placeholder="Client name"
                          value={testimonial.name}
                          onChange={(event) => updateTestimonial(index, "name", event.target.value)}
                        />
                        <input
                          className="h-10 rounded-lg border border-border bg-card px-3 text-sm outline-none transition focus:border-foreground focus:ring-2 focus:ring-ring/20"
                          placeholder="Suburb"
                          value={testimonial.suburb}
                          onChange={(event) => updateTestimonial(index, "suburb", event.target.value)}
                        />
                        <textarea
                          rows={3}
                          className="h-20 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none transition focus:border-foreground focus:ring-2 focus:ring-ring/20"
                          placeholder="Quote"
                          value={testimonial.quote}
                          onChange={(event) => updateTestimonial(index, "quote", event.target.value)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5">
                <StepTitle title="Website look and notes" copy="Choose the visual direction and add any notes that shape the website. These guide the AI build once connected." />
                <div className="grid gap-3 md:grid-cols-2">
                  {Object.entries(TEMPLATE_STYLES).map(([key, style]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => update("templateStyle", key as TemplateStyle)}
                      className={cn(
                        "overflow-hidden rounded-xl border bg-card text-left transition hover:-translate-y-0.5 hover:border-[#c7c7c7] hover:shadow-[0_16px_34px_rgba(17,17,17,0.08)]",
                        form.templateStyle === key ? "border-foreground ring-2 ring-ring/30" : "border-border"
                      )}
                    >
                      <span className="block h-24 p-3" style={{ background: templatePreviewBackground(key as TemplateStyle) }}>
                        <span className="inline-flex rounded-full bg-white/90 px-3 py-1 text-[11px] font-black uppercase tracking-normal text-ink">
                          Full bleed
                        </span>
                      </span>
                      <span className="block p-4">
                        <span className="block text-base font-semibold">{style.label}</span>
                        <span className="mt-1 block text-sm font-medium leading-6 text-muted-foreground">{style.description}</span>
                      </span>
                    </button>
                  ))}
                </div>
                <div className="grid gap-3 md:grid-cols-3">
                  <UploadField label="Logo PNG/SVG" uploadType="logo" value={form.logoUrl} clientId={clientId} onUploaded={(url) => update("logoUrl", url)} />
                  <UploadField label="Hero photo" uploadType="hero" value={form.heroPhotoUrl} clientId={clientId} onUploaded={(url) => update("heroPhotoUrl", url)} />
                  <UploadField label="Owner photo" uploadType="owner" value={form.ownerPhotoUrl} clientId={clientId} onUploaded={(url) => update("ownerPhotoUrl", url)} />
                </div>
                <TextArea label="Website notes (used for AI build)" value={form.visualDirection} onChange={(value) => update("visualDirection", value)} />
                <StepTitle title="Brand colour" copy="This still controls small accents in the dashboard and generated metadata." />
                <div className="grid gap-3 sm:grid-cols-3">
                  {Object.entries(BRAND_COLOURS).map(([key, colour]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => update("brandColour", key as keyof typeof BRAND_COLOURS)}
                      className={cn(
                        "flex items-center gap-3 rounded-lg border bg-card p-3 text-left font-semibold transition hover:border-[#c7c7c7]",
                        form.brandColour === key ? "border-foreground ring-2 ring-ring/30" : "border-border"
                      )}
                    >
                      <span className="size-8 rounded-md" style={{ backgroundColor: colour.hex }} />
                      {colour.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <StepTitle title="Contact" copy="Set the channels, response promise, and operating hours shown across the site." />
                <div className="grid gap-4 md:grid-cols-3">
                  <TextInput label="Primary phone" value={form.phone} onChange={(value) => update("phone", value)} />
                  <TextInput label="WhatsApp number" value={form.whatsapp} onChange={(value) => update("whatsapp", value)} />
                  <TextInput label="Business email" value={form.email} onChange={(value) => update("email", value)} />
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  <TextInput label="Facebook URL" value={form.facebookUrl} onChange={(value) => update("facebookUrl", value)} />
                  <TextInput label="Instagram URL" value={form.instagramUrl} onChange={(value) => update("instagramUrl", value)} />
                  <TextInput label="Facebook Pixel ID" value={form.pixelId} onChange={(value) => update("pixelId", value)} />
                </div>
                <label className="block text-sm font-semibold">
                  Response time
                  <select
                    className="mt-2 h-10 w-full rounded-lg border border-border bg-card px-3 text-sm outline-none transition focus:border-foreground focus:ring-2 focus:ring-ring/20"
                    value={form.responseTime}
                    onChange={(event) => update("responseTime", event.target.value)}
                  >
                    {RESPONSE_TIMES.map((time) => (
                      <option key={time}>{time}</option>
                    ))}
                  </select>
                </label>
                <div className="grid gap-2 md:grid-cols-2">
                  {WEEK_DAYS.map((day) => (
                    <div key={day} className="grid grid-cols-2 items-center gap-2 rounded-lg border border-border bg-background p-3 text-sm sm:grid-cols-[1fr_84px_84px_70px]">
                      <span className="font-semibold">{day}</span>
                      <input
                        className="h-9 rounded-lg border border-border bg-card px-2 text-sm outline-none disabled:bg-secondary"
                        value={form.hours[day]?.open ?? "08:00"}
                        disabled={form.hours[day]?.closed}
                        onChange={(event) => updateHour(day, "open", event.target.value)}
                      />
                      <input
                        className="h-9 rounded-lg border border-border bg-card px-2 text-sm outline-none disabled:bg-secondary"
                        value={form.hours[day]?.close ?? "17:00"}
                        disabled={form.hours[day]?.closed}
                        onChange={(event) => updateHour(day, "close", event.target.value)}
                      />
                      <label className="flex items-center gap-1 text-xs font-semibold text-muted-foreground">
                        <input
                          type="checkbox"
                          checked={form.hours[day]?.closed ?? false}
                          onChange={(event) => updateHour(day, "closed", event.target.checked)}
                        />
                        Closed
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="grid gap-5 md:grid-cols-2">
                <div className="relative min-h-80 overflow-hidden rounded-xl border border-border bg-secondary p-4">
                  <PreviewCard title={previewTitle} theme={theme.hex} form={form} />
                </div>
                <div className="rounded-xl border border-border bg-background p-5">
                  <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-800">
                    <MonitorCheck size={14} /> Draft review
                  </div>
                  <h2 className="text-2xl font-bold">Review before submission</h2>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    The site will stay in draft mode for now. No billing checkout, custom-domain registration, or public publish action will run during this phase.
                  </p>
                  <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                    <li>Included: saved Supabase client draft</li>
                    <li>Included: AI website plan and dashboard review</li>
                    <li>Paused: billing, DNS, and public publishing</li>
                  </ul>
                  <button type="button" onClick={continueStep} className="mt-6 w-full rounded-lg bg-accent px-4 py-3 font-semibold text-accent-foreground">
                    Continue to final check
                  </button>
                  <p className="mt-4 text-sm text-muted-foreground">Publishing can be re-enabled later with the production feature flag.</p>
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-5">
                <StepTitle title="Submit build request" copy="Reserve the preferred draft address and save the request for dashboard review. Publishing is paused for now." />
                <PreviewCard title={previewTitle} theme={theme.hex} form={form} />
                <div>
                  <TextInput label="Preferred SiteRent address" value={form.subdomain} onChange={(value) => update("subdomain", slugifySubdomain(value))} suffix=".siterent.co.za" />
                  <p className="mt-2 text-sm font-semibold text-muted-foreground">
                    {subdomainStatus === "idle" && "Enter at least 3 characters to check availability."}
                    {subdomainStatus === "checking" && "Checking availability..."}
                    {subdomainStatus === "available" && "This subdomain is available."}
                    {subdomainStatus === "taken" && "This subdomain is already taken or reserved."}
                    {subdomainStatus === "invalid" && "Could not check availability. Please retry."}
                  </p>
                </div>
                <TextInput label="Custom domain" value={form.customDomain} onChange={(value) => update("customDomain", value)} />
                {form.customDomain && (
                  <div className="rounded-lg border border-border bg-secondary p-4 text-sm text-muted-foreground">
                    DNS setup for {form.customDomain} will wait until publishing is re-enabled.
                  </div>
                )}
                <label className="flex items-start gap-3 rounded-lg border border-border bg-background p-4 text-sm">
                  <input type="checkbox" checked={form.terms} onChange={(event) => update("terms", event.target.checked)} className="mt-1" />
                  <span>I confirm these details are ready for SiteRent to build from, without publishing the website yet.</span>
                </label>
                <button
                  type="button"
                  disabled={!form.terms || subdomainStatus === "taken"}
                  onClick={submitBuildRequest}
                  className="rounded-lg bg-accent px-5 py-3 font-semibold text-accent-foreground disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {submitStatus === "submitting" ? "Saving request..." : "Submit build request"}
                </button>
                {submitStatus === "error" && <p className="text-sm font-semibold text-red-700">Could not save the build request. Please check Supabase and retry.</p>}
              </div>
            )}

            {step !== 4 && (
              <div className="mt-8 flex justify-between">
                <button
                  type="button"
                  disabled={step === 0}
                  onClick={() => setStep((current) => Math.max(0, current - 1))}
                  className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 font-semibold transition hover:border-[#c7c7c7] disabled:opacity-40"
                >
                  <ArrowLeft size={16} /> Back
                </button>
                {step < 5 && (
                  <button type="button" onClick={continueStep} className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 font-semibold text-accent-foreground">
                    Continue <ArrowRight size={16} />
                  </button>
                )}
              </div>
            )}
          </section>

          <aside className="relative hidden overflow-hidden bg-[linear-gradient(135deg,#fbfbfc_0%,#eef2f6_100%)] p-6 lg:block">
              <div className="absolute right-[-110px] top-16 h-72 w-72 rounded-full bg-blue-100/60 blur-3xl" />
              <div className="absolute bottom-16 left-[-90px] h-72 w-72 rounded-full bg-emerald-100/60 blur-3xl" />
              <div className="relative rounded-[24px] border border-white/80 bg-white/86 p-5 shadow-[0_28px_80px_rgba(15,23,42,0.12)] backdrop-blur-xl">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Live preview</p>
                  <h2 className="mt-1 text-lg font-semibold">Website draft</h2>
                </div>
                <MonitorCheck className="size-5 text-muted-foreground" />
              </div>
              <PreviewCard title={previewTitle} theme={theme.hex} form={form} compact />
              <Link href="/dashboard" className="mt-4 inline-flex w-full items-center justify-center rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm font-semibold text-foreground transition hover:border-[#c7c7c7]">
                Return to dashboard
              </Link>
              </div>
              <div className="relative mt-6 rounded-[24px] border border-white/80 bg-white/76 p-5 shadow-[0_24px_70px_rgba(15,23,42,0.10)] backdrop-blur-xl">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">What happens next</p>
                <div className="mt-4 space-y-3">
                  {["AI prepares your first draft", "You submit the build request", "Dashboard tracks the draft"].map((item, index) => (
                    <div key={item} className="flex items-center gap-3 rounded-xl bg-[#f4f6f8] p-3 text-sm font-medium">
                      <span className="grid size-7 place-items-center rounded-full bg-white text-xs font-bold">{index + 1}</span>
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </aside>
      </div>
    </main>
  );
}

function AddCustomService({ onAdd }: { onAdd: (label: string, price?: string) => void }) {
  const [label, setLabel] = useState("");
  const [price, setPrice] = useState("");

  return (
    <div className="flex w-full flex-col gap-2 rounded-2xl border border-[#e5e7eb] bg-[#f8fafc] p-3 sm:flex-row sm:items-center">
      <input className="h-10 flex-1 rounded-lg border border-border bg-card px-3 text-sm" placeholder="Add a custom service" value={label} onChange={(event) => setLabel(event.target.value)} />
      <input className="h-10 w-full rounded-lg border border-border bg-card px-3 text-sm sm:w-32" placeholder="Price" value={price} onChange={(event) => setPrice(event.target.value)} />
      <button
        type="button"
        onClick={() => {
          if (!label.trim()) return;
          onAdd(label.trim(), price.trim());
          setLabel("");
          setPrice("");
        }}
        className="rounded-lg bg-foreground px-4 py-2 text-sm font-semibold text-white"
      >
        Add
      </button>
    </div>
  );
}

function SiteRentOnboardingMark() {
  return (
    <span className="grid size-9 shrink-0 grid-cols-2 gap-1 rounded-lg bg-[#dff8ed] p-1">
      <span className="rounded-[4px] bg-[#1ecb7b]" />
      <span className="rounded-[4px] bg-[#48e0a0]" />
      <span className="rounded-[4px] bg-[#48e0a0]" />
      <span className="rounded-[4px] bg-[#0bb665]" />
    </span>
  );
}

function StepTitle({ title, copy }: { title: string; copy: string }) {
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-foreground">{title}</h1>
      <p className="mt-2 max-w-2xl text-base leading-7 text-muted-foreground">{copy}</p>
    </div>
  );
}

function OnboardingMomentum({ step, percent }: { step: number; percent: number }) {
  const cues = [
    "Start with the business promise so the draft has a real point of view.",
    "Add only the services and locations needed to generate a credible first page.",
    "Pick a style and add proof assets. You can improve media later.",
    "Make contact frictionless before you worry about advanced settings.",
    "Review the working draft before submission.",
    "Choose the preferred address and submit the build request."
  ];

  return (
    <div className="mb-6 grid gap-3 rounded-2xl border border-[#e6edf5] bg-[#f8fafc] p-4 md:grid-cols-[1fr_auto] md:items-center">
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white text-blue-700 shadow-sm">
          {step >= 5 ? <Rocket className="size-5" /> : <Sparkles className="size-5" />}
        </span>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">Best-practice onboarding</p>
          <p className="mt-1 text-sm font-semibold leading-6 text-foreground">{cues[step] ?? cues[0]}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm font-bold text-foreground shadow-sm">
        <Globe2 className="size-4 text-emerald-700" />
        {percent}% to launch
      </div>
    </div>
  );
}

function TextInput({
  label,
  value,
  onChange,
  suffix
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  suffix?: string;
}) {
  return (
    <label className="block text-sm font-semibold text-foreground">
      {label}
      <div className="mt-2 flex h-12 overflow-hidden rounded-xl border border-[#d9dee5] bg-white transition duration-200 hover:border-[#b8c0cc] focus-within:border-[#111827] focus-within:ring-4 focus-within:ring-[#111827]/10">
        <input className="w-full bg-transparent px-4 text-sm outline-none" value={value} onChange={(event) => onChange(event.target.value)} />
        {suffix && <span className="border-l border-border bg-secondary px-3 py-2 text-sm text-muted-foreground">{suffix}</span>}
      </div>
    </label>
  );
}

function TextArea({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block text-sm font-semibold text-foreground">
      {label}
      <textarea className="mt-2 min-h-32 w-full rounded-xl border border-[#d9dee5] bg-white px-4 py-3 text-sm outline-none transition duration-200 hover:border-[#b8c0cc] focus:border-[#111827] focus:ring-4 focus:ring-[#111827]/10" value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function ToggleGrid({ form, update }: { form: FormState; update: <Key extends keyof FormState>(key: Key, value: FormState[Key]) => void }) {
  const toggles: Array<[keyof FormState, string]> = [
    ["isInsured", "Insured"],
    ["hasGuarantee", "Guarantee"],
    ["hasEmergency", "Emergency support"],
    ["offersFreeQuote", "Free quote"]
  ];
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {toggles.map(([key, label]) => (
        <label key={key} className="pressable flex items-center gap-3 rounded-xl border border-[#e5e7eb] bg-[#f8fafc] p-3 text-sm font-semibold transition hover:border-[#111827] hover:bg-white">
          <input type="checkbox" checked={Boolean(form[key])} onChange={(event) => update(key, event.target.checked as never)} />
          {label}
        </label>
      ))}
    </div>
  );
}

function UploadField({
  label,
  uploadType,
  value,
  clientId,
  onUploaded,
  required = false
}: {
  label: string;
  uploadType: "logo" | "hero" | "owner";
  value: string;
  clientId: string | null;
  onUploaded: (url: string) => void;
  required?: boolean;
}) {
  const [previewUrl, setPreviewUrl] = useState("");
  const [status, setStatus] = useState<"idle" | "uploading" | "done" | "error">("idle");

  async function uploadFile(file: File) {
    if (file.size > 5 * 1024 * 1024) {
      setStatus("error");
      return;
    }

    setPreviewUrl(URL.createObjectURL(file));
    setStatus("uploading");
    const body = new FormData();
    body.append("file", file);
    body.append("type", uploadType);
    if (clientId) body.append("clientId", clientId);

    const response = await fetch("/api/uploads", {
      method: "POST",
      body
    });

    if (!response.ok) {
      setStatus("error");
      return;
    }

    const payload = (await response.json()) as { url: string };
    onUploaded(payload.url);
    setStatus("done");
  }

  return (
    <label className="pressable flex min-h-40 cursor-pointer flex-col justify-between rounded-2xl border border-dashed border-[#cfd6df] bg-[#f8fafc] p-4 text-sm font-semibold transition hover:border-[#111827] hover:bg-white">
      <input
        type="file"
        className="sr-only"
        accept={uploadType === "logo" ? "image/png,image/svg+xml" : "image/*"}
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void uploadFile(file);
        }}
      />
      <span className="flex items-center gap-2">
        <Upload size={18} />
        {label}
        {required && <span className="text-red-700">*</span>}
      </span>
      {previewUrl || value ? (
        <span className="mt-4 flex items-center gap-2 rounded-xl bg-white p-3 text-muted-foreground shadow-sm">
          {previewUrl ? <img src={previewUrl} alt="" className="size-10 rounded object-cover" /> : <ImageIcon size={18} />}
          {status === "uploading" ? "Uploading..." : "Uploaded"}
        </span>
      ) : (
        <span className="mt-4 text-muted-foreground">PNG/SVG up to 5MB</span>
      )}
      {status === "error" && <span className="mt-2 text-red-700">Upload failed or file is too large.</span>}
    </label>
  );
}

function templatePreviewBackground(style: TemplateStyle) {
  const backgrounds: Record<TemplateStyle, string> = {
    "aireco-dark": "linear-gradient(135deg,#171514 0%,#171514 58%,#ff6422 58%,#ff6422 100%)",
    "eircool-editorial": "radial-gradient(circle at 14% 16%,#e7f9b8 0%,transparent 34%),linear-gradient(135deg,#fbfbf5 0%,#ffffff 58%,#687143 58%,#687143 100%)",
    "razor-minimal": "linear-gradient(135deg,#fffaf7 0%,#fffaf7 62%,#ffd51a 62%,#ffd51a 80%,#230005 80%,#230005 100%)",
    "coolair-blue": "linear-gradient(135deg,#0b2d57 0%,#0b2d57 56%,#4f83dc 56%,#4f83dc 100%)"
  };
  return backgrounds[style];
}

function PreviewCard({ title, theme, form, compact = false }: { title: string; theme: string; form: FormState; compact?: boolean }) {
  const firstTestimonial = form.testimonials.find((testimonial) => testimonial.quote);
  const selectedTemplate = TEMPLATE_STYLES[form.templateStyle];
  const accent = selectedTemplate?.accent ?? theme;

  return (
    <div className="micro-card overflow-hidden rounded-2xl border border-white/80 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.10)]">
      <div className="p-5 text-white" style={{ background: templatePreviewBackground(form.templateStyle) }}>
        <div className="flex items-center justify-between gap-3 text-sm font-semibold">
          <span>{form.tradingName || "Your Service Business"}</span>
          <span className="rounded-full bg-white/20 px-3 py-1">{form.responseTime}</span>
        </div>
        <h2 className={cn("mt-8 font-bold", compact ? "text-2xl" : "text-3xl")}>{title}</h2>
        <p className="mt-2 text-white/80">{form.tagline || "Reliable service with clear pricing."}</p>
      </div>
      <div className="grid gap-3 p-5 text-sm">
        <div className="flex items-center justify-between rounded-lg bg-secondary p-3">
          <span className="font-bold">{selectedTemplate?.label ?? "Starter style"}</span>
          <span className="size-4 rounded-full" style={{ backgroundColor: accent }} />
        </div>
        <div className="rounded-lg bg-secondary p-3">
          {form.jobsCompleted || "100+"} jobs completed - {form.primaryCity || "Primary city"}
        </div>
        <div className="flex flex-wrap gap-2">
          {form.suburbs
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean)
            .slice(0, 5)
            .map((suburb) => (
              <span key={suburb} className="rounded-full border border-border px-3 py-1 text-xs">
                {suburb}
              </span>
            ))}
        </div>
        {firstTestimonial && (
          <div className="rounded-lg border border-border p-3 text-muted-foreground">
            <CheckCircle2 className="mb-2 text-emerald-600" size={18} />
            &ldquo;{firstTestimonial.quote}&rdquo;
          </div>
        )}
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock size={16} />
          {form.hours.Monday?.closed ? "Hours added" : `${form.hours.Monday?.open} - ${form.hours.Monday?.close}`}
        </div>
      </div>
    </div>
  );
}
