import { NextResponse } from "next/server";
import { z } from "zod";
import { getSubscriptionPeriodEnd } from "@/lib/billing";
import { getMissingSupabaseServiceConfig, hasSupabaseBrowserConfig, isPublishingPaused, isWaasTestMode, productionConfigError } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const actionSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("republish"), clientId: z.string().min(1) }),
  z.object({ action: z.literal("pause"), clientId: z.string().min(1), reason: z.string().optional() }),
  z.object({ action: z.literal("cancel"), clientId: z.string().min(1), reason: z.string().optional() }),
  z.object({ action: z.literal("reactivate"), clientId: z.string().min(1), reason: z.string().optional() }),
  z.object({ action: z.literal("refund"), clientId: z.string().min(1), amount: z.number().positive(), reason: z.string().optional() })
]);

export async function POST(request: Request) {
  const payload = actionSchema.safeParse(await request.json());

  if (!payload.success) {
    return NextResponse.json({ error: "Invalid admin action payload" }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  const now = new Date().toISOString();

  if (isWaasTestMode()) {
    return NextResponse.json({
      ok: true,
      mode: "test",
      action: payload.data.action,
      completedAt: now
    });
  }

  if (!supabase) {
    return NextResponse.json(
      productionConfigError(
        "Supabase service role is required before admin client actions can run in production.",
        getMissingSupabaseServiceConfig()
      ),
      { status: 503 }
    );
  }

  if (hasSupabaseBrowserConfig()) {
    const user = (await createSupabaseServerClient().auth.getUser()).data.user;
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { data: adminUser } = await supabase
      .from("admin_users")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!adminUser) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }
  }

  const { clientId, action } = payload.data;

  if (action === "republish") {
    if (isPublishingPaused()) {
      return NextResponse.json(
        {
          error: "Publishing is paused for this rollout. Admin re-publish is disabled until publishing is re-enabled.",
          code: "PUBLISHING_PAUSED"
        },
        { status: 503 }
      );
    }

    const { error } = await supabase
      .from("clients")
      .update({ site_published: true, published_at: now })
      .eq("id", clientId);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (action === "pause") {
    const { error } = await supabase
      .from("clients")
      .update({ subscription_status: "paused" })
      .eq("id", clientId);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (action === "cancel") {
    const periodEnd = getSubscriptionPeriodEnd();
    const { error } = await supabase
      .from("clients")
      .update({ subscription_status: "cancelled", subscription_ends_at: periodEnd.toISOString() })
      .eq("id", clientId);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (action === "reactivate") {
    const { error } = await supabase
      .from("clients")
      .update({
        subscription_status: "active",
        payment_failed_at: null,
        subscription_ends_at: null
      })
      .eq("id", clientId);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const amount = action === "refund" ? payload.data.amount : null;
  await supabase.from("billing_events").insert({
    client_id: clientId,
    event_type: `admin_${action}`,
    amount,
    status: action === "refund" ? "refunded" : "completed",
    payload: {
      reason: "reason" in payload.data ? payload.data.reason : undefined,
      completed_at: now
    }
  });

  return NextResponse.json({
    ok: true,
    action,
    completedAt: now
  });
}
