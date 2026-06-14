import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthenticatedUserId } from "@/lib/client-auth";
import { getMissingSupabaseServiceConfig, hasSupabaseBrowserConfig, isWaasTestMode, productionConfigError } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const updateSchema = z.object({
  clientId: z.string(),
  businessName: z.string().min(1).max(120).optional(),
  tagline: z.string().max(180).optional(),
  phone: z.string().max(40).optional(),
  whatsapp: z.string().max(40).optional(),
  email: z.string().email().optional().or(z.literal("")),
  primaryCity: z.string().max(80).optional(),
  address: z.string().max(240).optional(),
  customDomain: z.string().max(120).optional(),
  gaMeasurementId: z.string().max(40).optional(),
  pixelId: z.string().max(80).optional(),
  googlePlaceId: z.string().max(160).optional(),
  templateStyle: z
    .enum(["aireco-dark", "eircool-editorial", "razor-minimal", "coolair-blue"])
    .optional(),
  galleryPhotos: z.array(z.string().min(1)).max(6).optional()
});

export async function PATCH(request: Request) {
  const payload = updateSchema.safeParse(await request.json());

  if (!payload.success) {
    return NextResponse.json({ error: "Invalid client update payload" }, { status: 400 });
  }

  if (isWaasTestMode()) {
    return NextResponse.json({ ok: true, mode: "test", savedAt: new Date().toISOString() });
  }

  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    return NextResponse.json(
      productionConfigError("Supabase is required before dashboard updates can be saved in production.", getMissingSupabaseServiceConfig()),
      { status: 503 }
    );
  }

  const data = payload.data;
  if (hasSupabaseBrowserConfig()) {
    const userId = await getAuthenticatedUserId();
    const { data: ownedClient } = await supabase
      .from("clients")
      .select("id")
      .eq("id", data.clientId)
      .eq("user_id", userId)
      .maybeSingle();

    if (!ownedClient) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }
  }

  const { error } = await supabase
    .from("clients")
    .update({
      business_name: data.businessName,
      trading_name: data.businessName,
      tagline: data.tagline,
      phone: data.phone,
      whatsapp: data.whatsapp,
      email: data.email,
      primary_city: data.primaryCity,
      address: data.address,
      custom_domain: data.customDomain,
      ga_measurement_id: data.gaMeasurementId,
      pixel_id: data.pixelId,
      google_place_id: data.googlePlaceId,
      template_style: data.templateStyle,
      gallery_photos: data.galleryPhotos
    })
    .eq("id", data.clientId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, savedAt: new Date().toISOString() });
}
