import { NextResponse } from "next/server";
import { z } from "zod";
import { INDUSTRY_TEMPLATES, SERVICE_CATALOG } from "@/lib/constants";
import { isWaasTestMode } from "@/lib/env";
import { generateWebsitePlan, getGeminiMissingConfig, hasGeminiConfig, type AiWebsiteAttachment } from "@/lib/gemini";

export const runtime = "nodejs";

const websitePlanSchema = z.object({
  mode: z.enum(["create", "restyle", "copy-refresh"]).default("create"),
  businessContext: z.string().min(20).max(8000),
  currentWebsiteContext: z.string().max(8000).optional(),
  preferredTemplateStyle: z
    .enum(["aireco-dark", "eircool-editorial", "razor-minimal", "coolair-blue"])
    .optional()
});

const MAX_AI_ATTACHMENTS = 6;
const MAX_AI_ATTACHMENT_BYTES = 8 * 1024 * 1024;
const textMimeTypes = new Set(["text/plain", "text/markdown", "application/json"]);
const inlineMimeTypes = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "application/pdf"
]);

export async function POST(request: Request) {
  let parsedRequest: Awaited<ReturnType<typeof parseWebsitePlanRequest>>;
  try {
    parsedRequest = await parseWebsitePlanRequest(request);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid AI attachment payload" },
      { status: 400 }
    );
  }

  const payload = websitePlanSchema.safeParse(parsedRequest.fields);

  if (!payload.success) {
    return NextResponse.json({ error: "Invalid AI website plan payload" }, { status: 400 });
  }

  if (isWaasTestMode() && !hasGeminiConfig()) {
    return NextResponse.json({
      ok: true,
      provider: "gemini",
      mode: "test",
      plan: buildTestPlan(payload.data)
    });
  }

  if (!hasGeminiConfig()) {
    return NextResponse.json(
      {
        error: "Gemini is not configured.",
        missing: getGeminiMissingConfig()
      },
      { status: 503 }
    );
  }

  try {
    const plan = await generateWebsitePlan({
      ...payload.data,
      attachments: parsedRequest.attachments
    });
    return NextResponse.json({
      ok: true,
      provider: "gemini",
      plan
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to generate website plan"
      },
      { status: 500 }
    );
  }
}

function buildTestPlan(payload: z.infer<typeof websitePlanSchema>) {
  const templateStyle = payload.preferredTemplateStyle ?? "coolair-blue";
  const context = payload.businessContext.split("\n").find(Boolean)?.replace(/^Business name:\s*/i, "").trim();
  const businessName = context && context.length > 2 ? context : "BrightSpark Electricians";
  const industry = inferTestIndustry(payload.businessContext);
  const template = INDUSTRY_TEMPLATES[industry];
  const services = template.serviceKeys
    .map((key) => SERVICE_CATALOG.find((service) => service.key === key))
    .filter((service): service is (typeof SERVICE_CATALOG)[number] => Boolean(service))
    .slice(0, 3);

  return {
    summary: `Test-mode plan for ${businessName}: prioritize a clear ${template.singular.toLowerCase()} promise, local proof, contact CTAs, and mobile-first trust blocks.`,
    templateStyle,
    brand: {
      tone: "Confident, practical, locally trusted",
      primaryColour: "#0b2d57",
      accentColour: "#4f83dc",
      typographyDirection: "Bold operational headings with compact, readable body copy"
    },
    hero: {
      headline: `${businessName} service, ready when customers need it.`,
      subheadline: template.defaultTagline,
      primaryCta: "Book a service",
      secondaryCta: "View services"
    },
    sections: [
      {
        key: "hero",
        title: "Service-first hero",
        purpose: "Tell visitors what the business fixes and where it works.",
        contentNotes: "Use one primary CTA, one WhatsApp route, and local availability proof."
      },
      {
        key: "services",
        title: "Core services",
        purpose: "Make the offer scannable on mobile.",
        contentNotes: "Show the highest-intent services as short cards with direct enquiry routes."
      },
      {
        key: "proof",
        title: "Trust proof",
        purpose: "Reduce hesitation before enquiry.",
        contentNotes: "Place reviews, certifications, response time, and project photos before the contact form."
      }
    ],
    serviceCopy: services.map((service) => ({
      serviceKey: service.key,
      headline: service.label,
      description: service.description
    })),
    imagePrompts: [
      {
        slot: "hero",
        prompt: `Bright South African ${template.singular.toLowerCase()} business owner helping a customer in a clean, realistic local setting.`
      },
      {
        slot: "gallery",
        prompt: `Before-and-after ${template.singular.toLowerCase()} work details with tidy finishes and trustworthy proof.`
      }
    ],
    uiChangePlan: [
      {
        area: "Mobile hero",
        change: "Keep the headline, phone CTA, and WhatsApp CTA visible in the first viewport.",
        rationale: "Most service visitors arrive on mobile and need an immediate contact path."
      },
      {
        area: "Proof stack",
        change: "Move reviews and certifications above long service descriptions.",
        rationale: "Trust proof should appear before visitors are asked to submit a form."
      },
      {
        area: "Contact section",
        change: "Use large touch targets and compact fields.",
        rationale: "Short, thumb-friendly forms improve completion rates on phones."
      }
    ],
    implementationNotes: [
      "Generated in SiteRent test mode without calling Gemini.",
      "Use this plan to exercise the onboarding and dashboard flows locally."
    ]
  };
}

function inferTestIndustry(context: string): keyof typeof INDUSTRY_TEMPLATES {
  const lower = context.toLowerCase();
  for (const [key, template] of Object.entries(INDUSTRY_TEMPLATES) as Array<[keyof typeof INDUSTRY_TEMPLATES, (typeof INDUSTRY_TEMPLATES)[keyof typeof INDUSTRY_TEMPLATES]]>) {
    const words = [key, template.label, template.singular, ...template.serviceKeys].join(" ").toLowerCase().split(/\s+/);
    if (words.some((word) => word.length > 4 && lower.includes(word))) return key;
  }
  return "electrician";
}

async function parseWebsitePlanRequest(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";

  if (!contentType.includes("multipart/form-data")) {
    return {
      fields: await request.json(),
      attachments: [] as AiWebsiteAttachment[]
    };
  }

  const formData = await request.formData();
  const fields = {
    mode: formData.get("mode"),
    preferredTemplateStyle: emptyToUndefined(formData.get("preferredTemplateStyle")),
    businessContext: formData.get("businessContext"),
    currentWebsiteContext: emptyToUndefined(formData.get("currentWebsiteContext"))
  };
  const files = formData
    .getAll("attachments")
    .filter((value): value is File => value instanceof File && value.size > 0)
    .slice(0, MAX_AI_ATTACHMENTS);
  const attachments = await Promise.all(files.map(readAiAttachment));

  return { fields, attachments };
}

function emptyToUndefined(value: FormDataEntryValue | null) {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

async function readAiAttachment(file: File): Promise<AiWebsiteAttachment> {
  if (file.size > MAX_AI_ATTACHMENT_BYTES) {
    throw new Error(`${file.name} is larger than the 8MB AI attachment limit.`);
  }

  if (textMimeTypes.has(file.type)) {
    return {
      name: file.name,
      mimeType: file.type,
      text: (await file.text()).slice(0, 12000)
    };
  }

  if (!inlineMimeTypes.has(file.type)) {
    throw new Error(`${file.name} is not a supported AI attachment type.`);
  }

  return {
    name: file.name,
    mimeType: file.type,
    data: Buffer.from(await file.arrayBuffer()).toString("base64")
  };
}
