import { NextResponse } from "next/server";
import { z } from "zod";
import { generateWebsitePlan, hasGeminiConfig, type AiWebsiteAttachment } from "@/lib/gemini";

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

  if (!hasGeminiConfig()) {
    return NextResponse.json(
      {
        error: "Gemini is not configured for production.",
        missing: ["GEMINI_API_KEY"]
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
