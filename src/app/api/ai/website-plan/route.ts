import { NextResponse } from "next/server";
import { z } from "zod";
import { generateWebsitePlan, hasGeminiConfig } from "@/lib/gemini";

const websitePlanSchema = z.object({
  mode: z.enum(["create", "restyle", "copy-refresh"]).default("create"),
  businessContext: z.string().min(20).max(8000),
  currentWebsiteContext: z.string().max(8000).optional(),
  preferredTemplateStyle: z
    .enum(["aireco-dark", "eircool-editorial", "razor-minimal", "coolair-blue"])
    .optional()
});

export async function POST(request: Request) {
  const payload = websitePlanSchema.safeParse(await request.json());

  if (!payload.success) {
    return NextResponse.json({ error: "Invalid AI website plan payload" }, { status: 400 });
  }

  try {
    const plan = await generateWebsitePlan(payload.data);
    return NextResponse.json({
      ok: true,
      provider: hasGeminiConfig() ? "gemini" : "local",
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
