import { z } from "zod";

const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta";

export const aiWebsitePlanSchema = z.object({
  summary: z.string(),
  templateStyle: z.enum(["aireco-dark", "eircool-editorial", "razor-minimal", "coolair-blue"]),
  brand: z.object({
    tone: z.string(),
    primaryColour: z.string(),
    accentColour: z.string(),
    typographyDirection: z.string()
  }),
  hero: z.object({
    headline: z.string(),
    subheadline: z.string(),
    primaryCta: z.string(),
    secondaryCta: z.string()
  }),
  sections: z.array(
    z.object({
      key: z.string(),
      title: z.string(),
      purpose: z.string(),
      contentNotes: z.string()
    })
  ),
  serviceCopy: z.array(
    z.object({
      serviceKey: z.string(),
      headline: z.string(),
      description: z.string()
    })
  ),
  imagePrompts: z.array(
    z.object({
      slot: z.string(),
      prompt: z.string()
    })
  ),
  uiChangePlan: z.array(
    z.object({
      area: z.string(),
      change: z.string(),
      rationale: z.string()
    })
  ),
  implementationNotes: z.array(z.string())
});

export type AiWebsitePlan = z.infer<typeof aiWebsitePlanSchema>;

type GenerateWebsitePlanInput = {
  mode: "create" | "restyle" | "copy-refresh";
  businessContext: string;
  currentWebsiteContext?: string;
  preferredTemplateStyle?: AiWebsitePlan["templateStyle"];
};

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
  error?: {
    message?: string;
  };
};

export function hasGeminiConfig() {
  return Boolean(process.env.GEMINI_API_KEY);
}

export async function generateWebsitePlan(input: GenerateWebsitePlanInput): Promise<AiWebsitePlan> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return localWebsitePlan(input);
  }

  const model = process.env.GEMINI_MODEL || "gemini-2.0-flash";
  const response = await fetch(`${GEMINI_API_BASE}/models/${model}:generateContent?key=${apiKey}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: buildWebsitePrompt(input)
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.55,
        maxOutputTokens: 4096,
        response_mime_type: "application/json"
      }
    })
  });

  const result = (await response.json()) as GeminiResponse;
  if (!response.ok) {
    throw new Error(result.error?.message ?? "Gemini request failed");
  }

  const text = result.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("") ?? "";
  const parsed = aiWebsitePlanSchema.safeParse(JSON.parse(text));
  if (!parsed.success) {
    throw new Error("Gemini returned an invalid website plan");
  }

  return parsed.data;
}

function buildWebsitePrompt(input: GenerateWebsitePlanInput) {
  return `
You are the SiteRent website creation assistant for South African HVAC website rentals.

Create a structured website creation or UI restyle plan that fits one of these four starter template styles:
- aireco-dark: black/dark hero, orange booking CTAs, large HVAC photography, premium service feel.
- eircool-editorial: airy cream canvas, olive accents, staggered image blocks, calm editorial trust.
- razor-minimal: ivory full-page layout, pill navigation, oversized type, compact service cards.
- coolair-blue: blue corporate hero, trust signals, process cards, polished maintenance company feel.

Mode: ${input.mode}
Preferred template style: ${input.preferredTemplateStyle ?? "choose the best fit"}
Business context:
${input.businessContext}

Current website context:
${input.currentWebsiteContext ?? "No current website context supplied."}

Return only valid JSON with:
summary, templateStyle, brand, hero, sections, serviceCopy, imagePrompts, uiChangePlan, implementationNotes.
Keep recommendations practical for a Next.js/Tailwind implementation and POPIA-aware South African small business websites.
`;
}

function localWebsitePlan(input: GenerateWebsitePlanInput): AiWebsitePlan {
  const templateStyle = input.preferredTemplateStyle ?? "aireco-dark";
  return {
    summary: "Local AI fallback plan. Configure GEMINI_API_KEY to generate tailored website plans.",
    templateStyle,
    brand: {
      tone: "Trustworthy, fast, and local",
      primaryColour: "#ff5b18",
      accentColour: "#111111",
      typographyDirection: "Bold modern sans-serif with compact operational UI copy"
    },
    hero: {
      headline: "Reliable HVAC service built for local homes and businesses",
      subheadline: "Fast repairs, clear pricing, and professional installation support.",
      primaryCta: "Schedule your service",
      secondaryCta: "View services"
    },
    sections: [
      {
        key: "services",
        title: "HVAC services",
        purpose: "Show the core services clearly.",
        contentNotes: "Use service cards with pricing and emergency emphasis."
      },
      {
        key: "trust",
        title: "Why choose us",
        purpose: "Build confidence before contact.",
        contentNotes: "Highlight guarantees, insurance, certifications, and response time."
      },
      {
        key: "contact",
        title: "Get a free quote",
        purpose: "Capture leads.",
        contentNotes: "Keep the enquiry form short and include WhatsApp."
      }
    ],
    serviceCopy: [],
    imagePrompts: [
      {
        slot: "hero",
        prompt: "Professional HVAC technician repairing an outdoor air conditioning unit at a South African home, bright natural light, premium commercial photography."
      }
    ],
    uiChangePlan: [
      {
        area: "Hero",
        change: "Use the selected template language with a strong CTA and trust metric.",
        rationale: "Improves first-screen conversion."
      }
    ],
    implementationNotes: [
      "Server-side Gemini fallback is active because GEMINI_API_KEY is not configured.",
      "Use the generated templateStyle to map into the published-site renderer."
    ]
  };
}
