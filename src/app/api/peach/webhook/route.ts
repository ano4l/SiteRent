import { NextResponse } from "next/server";
import { getGracePeriodEnd } from "@/lib/billing";
import {
  buildPeachWebhookHeaderSignature,
  isPeachCancelledOrFailedResult,
  isPeachPendingResult,
  isPeachSuccessfulResult,
  verifyPeachSignature
} from "@/lib/peach";
import { getMissingSupabaseServiceConfig, productionConfigError } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

function normaliseWebhookParams(params: URLSearchParams) {
  const entries = Array.from(params.entries()).map(([key, value]) => [key.replace(/_/g, "."), value]);
  return Object.fromEntries(entries) as Record<string, string>;
}

export async function POST(request: Request) {
  const body = await request.text();
  const rawParams = Object.fromEntries(new URLSearchParams(body).entries()) as Record<string, string>;
  const params = normaliseWebhookParams(new URLSearchParams(body));
  const headers = request.headers;
  const signature = headers.get("x-webhook-signature");
  const timestamp = headers.get("x-webhook-timestamp");
  const webhookId = headers.get("x-webhook-id");

  const hasHeaderSignature = Boolean(signature && timestamp && webhookId);
  const validHeaderSignature = hasHeaderSignature
    ? buildPeachWebhookHeaderSignature({
        timestamp: timestamp as string,
        webhookId: webhookId as string,
        url: request.url,
        payload: body,
        secretToken: process.env.PEACH_SECRET_TOKEN
      }) === signature
    : false;

  const validBodySignature =
    verifyPeachSignature(rawParams, process.env.PEACH_SECRET_TOKEN) ||
    verifyPeachSignature(params, process.env.PEACH_SECRET_TOKEN);

  if (!validHeaderSignature && !validBodySignature) {
    return NextResponse.json({ error: "Invalid Peach Payments signature" }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    return NextResponse.json(
      productionConfigError(
        "Supabase service role is required before Peach webhooks can be processed in production.",
        getMissingSupabaseServiceConfig()
      ),
      { status: 503 }
    );
  }

  const merchantTransactionId = params.merchantTransactionId;
  const webhookEventId = params.id ?? merchantTransactionId;
  const resultCode = params["result.code"] ?? params.result_code;
  const status = isPeachSuccessfulResult(resultCode)
    ? "complete"
    : isPeachPendingResult(resultCode)
      ? "pending"
      : isPeachCancelledOrFailedResult(resultCode)
        ? "failed"
        : "unknown";

  // Idempotency: payment providers retry deliveries, so the same event can
  // arrive multiple times. Skip processing if we have already recorded a
  // webhook event with this provider payment id.
  if (webhookEventId) {
    const { data: existingWebhook } = await supabase
      .from("billing_events")
      .select("id")
      .eq("provider", "peach")
      .eq("event_type", "webhook")
      .eq("provider_payment_id", webhookEventId)
      .maybeSingle();

    if (existingWebhook) {
      return NextResponse.json({ ok: true, deduplicated: true });
    }
  }

  const { data: checkoutEvent } = await supabase
    .from("billing_events")
    .select("client_id")
    .eq("provider", "peach")
    .eq("provider_payment_id", merchantTransactionId)
    .maybeSingle();

  const clientId = checkoutEvent?.client_id ?? params["customer.merchantCustomerId"] ?? null;

  const { error: insertError } = await supabase.from("billing_events").insert({
    client_id: clientId,
    provider: "peach",
    event_type: "webhook",
    provider_payment_id: webhookEventId,
    amount: params.amount ? Number(params.amount) : null,
    status,
    payload: params
  });

  // Unique-constraint violation = a concurrent delivery already inserted this
  // event. Treat as a successful no-op rather than re-applying side effects.
  if (insertError) {
    if (insertError.code === "23505") {
      return NextResponse.json({ ok: true, deduplicated: true });
    }
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  if (clientId && status === "complete") {
    await supabase
      .from("clients")
      .update({
        subscription_status: "active",
        peach_registration_id: params.registrationId || undefined,
        payment_failed_at: null
      })
      .eq("id", clientId);
  }

  if (clientId && status === "failed") {
    await supabase
      .from("clients")
      .update({
        subscription_status: "past_due",
        payment_failed_at: new Date().toISOString(),
        subscription_ends_at: getGracePeriodEnd().toISOString()
      })
      .eq("id", clientId);
  }

  return NextResponse.json({ ok: true });
}
