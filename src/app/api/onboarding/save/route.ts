import { NextResponse } from "next/server";
import { z } from "zod";
import { getMissingSupabaseServiceConfig, hasSupabaseBrowserConfig, productionConfigError } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const payloadSchema = z.object({
  clientId: z.string().uuid().optional(),
  currentStep: z.number().int().min(1).max(6),
  data: z.object({
    tradingName: z.string().optional(),
    tagline: z.string().optional(),
    ownerName: z.string().optional(),
    yearFounded: z.string().optional(),
    jobsCompleted: z.string().optional(),
    aboutText: z.string().optional(),
    services: z.array(z.string()).optional(),
    servicePrices: z.record(z.string()).optional(),
    certifications: z.string().optional(),
    isInsured: z.boolean().optional(),
    hasGuarantee: z.boolean().optional(),
    guaranteePeriod: z.string().optional(),
    hasEmergency: z.boolean().optional(),
    offersFreeQuote: z.boolean().optional(),
    primaryCity: z.string().optional(),
    address: z.string().optional(),
    suburbs: z.string().optional(),
    testimonials: z
      .array(
        z.object({
          name: z.string(),
          suburb: z.string(),
          quote: z.string()
        })
      )
      .optional(),
    phone: z.string().optional(),
    whatsapp: z.string().optional(),
    email: z.string().email().optional().or(z.literal("")),
    responseTime: z.string().optional(),
    hours: z.record(z.object({ open: z.string(), close: z.string(), closed: z.boolean() })).optional(),
    facebookUrl: z.string().optional(),
    instagramUrl: z.string().optional(),
    pixelId: z.string().optional(),
    templateStyle: z.enum(["aireco-dark", "eircool-editorial", "razor-minimal", "coolair-blue"]).optional(),
    brandColour: z.string().optional(),
    logoUrl: z.string().optional(),
    heroPhotoUrl: z.string().optional(),
    ownerPhotoUrl: z.string().optional(),
    subdomain: z.string().optional(),
    customDomain: z.string().optional(),
    terms: z.boolean().optional()
  })
});

export async function POST(request: Request) {
  const payload = payloadSchema.safeParse(await request.json());

  if (!payload.success) {
    return NextResponse.json({ error: "Invalid onboarding payload" }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return NextResponse.json(
      productionConfigError("Supabase is required before onboarding can save in production.", getMissingSupabaseServiceConfig()),
      { status: 503 }
    );
  }

  const authUser = hasSupabaseBrowserConfig()
    ? (await createSupabaseServerClient().auth.getUser()).data.user
    : null;

  if (hasSupabaseBrowserConfig() && !authUser) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  if (payload.data.clientId && authUser) {
    const { data: ownedClient } = await supabase
      .from("clients")
      .select("id")
      .eq("id", payload.data.clientId)
      .eq("user_id", authUser.id)
      .maybeSingle();

    if (!ownedClient) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }
  }

  const data = payload.data.data;
  const clientValues = {
    user_id: authUser?.id ?? null,
    business_name: data.tradingName,
    trading_name: data.tradingName,
    tagline: data.tagline,
    owner_name: data.ownerName,
    year_founded: data.yearFounded ? Number(data.yearFounded) : null,
    jobs_completed: data.jobsCompleted ? Number(data.jobsCompleted) : null,
    about_text: data.aboutText,
    services: data.services ?? [],
    service_prices: data.servicePrices ?? {},
    certifications: data.certifications
      ? data.certifications.split(",").map((item) => item.trim()).filter(Boolean)
      : [],
    is_insured: data.isInsured ?? false,
    has_guarantee: data.hasGuarantee ?? false,
    guarantee_period: data.guaranteePeriod,
    has_emergency: data.hasEmergency ?? false,
    offers_free_quote: data.offersFreeQuote ?? true,
    primary_city: data.primaryCity,
    address: data.address,
    suburbs: data.suburbs ? data.suburbs.split(",").map((item) => item.trim()).filter(Boolean) : [],
    testimonials: data.testimonials?.filter((item) => item.name || item.suburb || item.quote) ?? [],
    phone: data.phone,
    whatsapp: data.whatsapp,
    email: data.email,
    response_time: data.responseTime,
    hours: data.hours ?? {},
    facebook_url: data.facebookUrl,
    instagram_url: data.instagramUrl,
    pixel_id: data.pixelId,
    template_style: data.templateStyle ?? "aireco-dark",
    brand_colour: data.brandColour ?? "navy",
    logo_url: data.logoUrl,
    hero_photo_url: data.heroPhotoUrl,
    owner_photo_url: data.ownerPhotoUrl,
    subdomain: data.subdomain || null,
    custom_domain: data.customDomain || null
  };

  const clientQuery = payload.data.clientId
    ? supabase
        .from("clients")
        .update(clientValues)
        .eq("id", payload.data.clientId)
        .eq("user_id", authUser?.id ?? null)
        .select("id")
        .single()
    : supabase.from("clients").insert(clientValues).select("id").single();

  const { data: client, error: clientError } = await clientQuery;

  if (clientError || !client) {
    return NextResponse.json({ error: clientError?.message ?? "Unable to save client" }, { status: 500 });
  }

  const completedSteps = Array.from({ length: payload.data.currentStep }, (_, index) => index + 1);
  const { error: progressError } = await supabase.from("onboarding_progress").upsert({
    client_id: client.id,
    current_step: payload.data.currentStep,
    completed_steps: completedSteps,
    last_saved_at: new Date().toISOString()
  });

  if (progressError) {
    return NextResponse.json({ error: progressError.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    clientId: client.id,
    savedAt: new Date().toISOString(),
    currentStep: payload.data.currentStep
  });
}
