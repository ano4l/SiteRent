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

export type AiWebsiteAttachment = {
  name: string;
  mimeType: string;
  data?: string;
  text?: string;
};

type GenerateWebsitePlanInput = {
  mode: "create" | "restyle" | "copy-refresh";
  businessContext: string;
  currentWebsiteContext?: string;
  preferredTemplateStyle?: AiWebsitePlan["templateStyle"];
  attachments?: AiWebsiteAttachment[];
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
    throw new Error("GEMINI_API_KEY is required in production mode.");
  }

  const model = process.env.GEMINI_MODEL || "gemini-2.0-flash";
  const parts: Array<Record<string, unknown>> = [
    {
      text: buildWebsitePrompt(input)
    }
  ];

  for (const attachment of input.attachments ?? []) {
    if (attachment.text) {
      parts.push({
        text: `Attachment: ${attachment.name} (${attachment.mimeType})\n${attachment.text}`
      });
      continue;
    }

    if (attachment.data) {
      parts.push({
        inline_data: {
          mime_type: attachment.mimeType,
          data: attachment.data
        }
      });
    }
  }

  const response = await fetch(`${GEMINI_API_BASE}/models/${model}:generateContent?key=${apiKey}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts
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
You are the SiteRent website creation assistant for South African service-business website rentals.

Create a structured website creation or UI restyle plan that fits one of these four starter template styles:
- aireco-dark: black/dark hero, bold booking CTAs, large service photography, premium local-business feel.
- eircool-editorial: airy cream canvas, olive accents, staggered image blocks, calm editorial trust.
- razor-minimal: ivory full-page layout, pill navigation, oversized type, compact service cards.
- coolair-blue: blue corporate hero, trust signals, process cards, polished maintenance company feel.

Supported customer categories include plumbers, geyser repair, electricians, locksmiths, pest control, roofing, HVAC, solar, barbers, and photographers. Infer the correct category from the business context and avoid HVAC-specific wording unless the customer is actually HVAC.

Mode: ${input.mode}
Preferred template style: ${input.preferredTemplateStyle ?? "choose the best fit"}
Business context:
${input.businessContext}

Current website context:
${input.currentWebsiteContext ?? "No current website context supplied."}

Uploaded reference files:
${attachmentSummary(input.attachments)}

Return only valid JSON with:
summary, templateStyle, brand, hero, sections, serviceCopy, imagePrompts, uiChangePlan, implementationNotes.
Keep recommendations practical for a Next.js/Tailwind implementation and POPIA-aware South African small business websites.
`;
}

function attachmentSummary(attachments?: AiWebsiteAttachment[]) {
  if (!attachments?.length) return "No files uploaded.";

  return attachments
    .map((attachment, index) => {
      const readable = attachment.text ? "text extracted" : attachment.data ? "sent as inline media" : "metadata only";
      return `${index + 1}. ${attachment.name} (${attachment.mimeType}) - ${readable}`;
    })
    .join("\n");
}
