import { NextResponse } from "next/server";
import { z } from "zod";
import { getCustomDomainInstructions, getSiteUrl, isValidSubdomain, PLATFORM_DOMAIN } from "@/lib/domains";
import { queuePublishConfirmationEmail } from "@/lib/email/publish-confirmation";
import { getMissingSupabaseServiceConfig, hasSupabaseBrowserConfig, isWaasTestMode, productionConfigError } from "@/lib/env";
import { getAuthenticatedUserId } from "@/lib/client-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { addDomainToVercelProject } from "@/lib/vercel";
import { slugifySubdomain } from "@/lib/utils";

const publishSchema = z.object({
  clientId: z.string().uuid(),
  subdomain: z.string().min(3).max(63),
  customDomain: z.string().optional(),
  visualDirection: z.string().max(2000).optional(),
  acceptedTerms: z.literal(true)
});

export async function POST(request: Request) {
  const payload = publishSchema.safeParse(await request.json());

  if (!payload.success) {
    return NextResponse.json({ error: "Invalid publish payload" }, { status: 400 });
  }

  const subdomain = slugifySubdomain(payload.data.subdomain);
  if (!isValidSubdomain(subdomain)) {
    return NextResponse.json({ error: "Invalid or reserved subdomain" }, { status: 400 });
  }

  if (isWaasTestMode()) {
    const customDomain = payload.data.customDomain?.trim() || null;
    return NextResponse.json({
      ok: true,
      mode: "test",
      siteUrl: getSiteUrl(subdomain),
      dashboardUrl: "/dashboard",
      customDomain,
      customDomainInstructions: customDomain ? getCustomDomainInstructions(customDomain) : null,
      vercelDomain: {
        configured: false,
        skippedReason: "Test mode: Vercel domain registration was skipped."
      },
      email: {
        queued: false,
        dashboardUrl: "/dashboard",
        buttonLabel: "Open dashboard",
        skippedReason: "Test mode: Gemini website-ready email was simulated but not sent."
      }
    });
  }

  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    return NextResponse.json(
      productionConfigError("Supabase is required before a website can be published in production.", getMissingSupabaseServiceConfig()),
      { status: 503 }
    );
  }

  const siteUrl = getSiteUrl(subdomain);
  const customDomain = payload.data.customDomain?.trim() || null;
  const customDomainInstructions = customDomain ? getCustomDomainInstructions(customDomain) : null;
  let vercelDomain:
    | Awaited<ReturnType<typeof addDomainToVercelProject>>
    | { configured: false; skippedReason: string } = {
    configured: false,
    skippedReason: "No custom domain requested."
  };
  let clientEmail: string | null = null;
  let businessName = "Your website";

  const userId = hasSupabaseBrowserConfig() ? await getAuthenticatedUserId() : null;
  if (hasSupabaseBrowserConfig() && !userId) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const clientQuery = supabase
    .from("clients")
    .select("id,business_name,trading_name,email,next_billing_date")
    .eq("id", payload.data.clientId);

  if (userId) {
    clientQuery.eq("user_id", userId);
  }

  const { data: client } = await clientQuery.maybeSingle();

  if (!client) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }

  const { data: existing } = await supabase
    .from("clients")
    .select("id")
    .eq("subdomain", subdomain)
    .neq("id", payload.data.clientId)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ error: "Subdomain is already taken" }, { status: 409 });
  }

  clientEmail = client?.email ?? null;
  businessName = client?.business_name ?? client?.trading_name ?? businessName;

  const updateQuery = supabase
    .from("clients")
    .update({
      subdomain,
      custom_domain: customDomain,
      site_published: true,
      published_at: new Date().toISOString()
    })
    .eq("id", payload.data.clientId);

  if (userId) {
    updateQuery.eq("user_id", userId);
  }

  const { error } = await updateQuery;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await supabase.from("billing_events").insert({
    client_id: payload.data.clientId,
    event_type: "site_published",
    status: "published",
    payload: {
      site_url: siteUrl,
      custom_domain: customDomain,
      platform_domain: PLATFORM_DOMAIN,
      visual_direction: payload.data.visualDirection ?? null,
      gemini_build_status: "ready_for_generation"
    }
  });

  if (customDomain) {
    try {
      vercelDomain = await addDomainToVercelProject(customDomain);
    } catch (error) {
      vercelDomain = {
        configured: false,
        skippedReason: error instanceof Error ? error.message : "Unable to register custom domain."
      };
    }
  }

  const email = await queuePublishConfirmationEmail({
    clientId: payload.data.clientId,
    businessName,
    recipient: clientEmail,
    siteUrl,
    dashboardUrl: "/dashboard",
    visualDirection: payload.data.visualDirection
  });

  return NextResponse.json({
    ok: true,
    siteUrl,
    dashboardUrl: "/dashboard",
    customDomain,
    customDomainInstructions,
    vercelDomain,
    email
  });
}
