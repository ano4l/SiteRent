import { NextResponse } from "next/server";
import { z } from "zod";
import { getSubscriptionPeriodEnd } from "@/lib/billing";
import { getAuthenticatedUserId } from "@/lib/client-auth";
import { getMissingSupabaseServiceConfig, hasSupabaseBrowserConfig, isWaasTestMode, productionConfigError } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const cancelSchema = z.object({
  clientId: z.string().min(1),
  reason: z.string().optional()
});

export async function POST(request: Request) {
  const payload = cancelSchema.safeParse(await request.json());

  if (!payload.success) {
    return NextResponse.json({ error: "Invalid cancellation payload" }, { status: 400 });
  }

  const periodEnd = getSubscriptionPeriodEnd();
  const supabase = createSupabaseAdminClient();

  if (isWaasTestMode()) {
    return NextResponse.json({
      ok: true,
      mode: "test",
      subscriptionEndsAt: periodEnd.toISOString()
    });
  }

  if (!supabase) {
    return NextResponse.json(
      productionConfigError(
        "Supabase service role is required before subscriptions can be cancelled in production.",
        getMissingSupabaseServiceConfig()
      ),
      { status: 503 }
    );
  }

  if (hasSupabaseBrowserConfig()) {
    const userId = await getAuthenticatedUserId();
    const { data: ownedClient } = await supabase
      .from("clients")
      .select("id")
      .eq("id", payload.data.clientId)
      .eq("user_id", userId)
      .maybeSingle();

    if (!ownedClient) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }
  }

  const { error } = await supabase
    .from("clients")
    .update({
      subscription_status: "cancelled",
      subscription_ends_at: periodEnd.toISOString()
    })
    .eq("id", payload.data.clientId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await supabase.from("billing_events").insert({
    client_id: payload.data.clientId,
    event_type: "cancellation_requested",
    status: "cancelled",
    payload: {
      reason: payload.data.reason,
      subscription_ends_at: periodEnd.toISOString()
    }
  });

  return NextResponse.json({
    ok: true,
    subscriptionEndsAt: periodEnd.toISOString()
  });
}
