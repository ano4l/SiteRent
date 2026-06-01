import { NextResponse } from "next/server";
import { getGracePeriodEnd } from "@/lib/billing";
import {
  buildPeachWebhookHeaderSignature,
  isPeachCancelledOrFailedResult,
  isPeachPendingResult,
  isPeachSuccessfulResult,
  verifyPeachSignature
} from "@/lib/peach";
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
  const merchantTransactionId = params.merchantTransactionId;
  const resultCode = params["result.code"] ?? params.result_code;
  const status = isPeachSuccessfulResult(resultCode)
    ? "complete"
    : isPeachPendingResult(resultCode)
      ? "pending"
      : isPeachCancelledOrFailedResult(resultCode)
        ? "failed"
        : "unknown";

  if (supabase) {
    const { data: checkoutEvent } = await supabase
      .from("billing_events")
      .select("client_id")
      .eq("provider", "peach")
      .eq("provider_payment_id", merchantTransactionId)
      .maybeSingle();

    const clientId = checkoutEvent?.client_id ?? params["customer.merchantCustomerId"] ?? null;

    await supabase.from("billing_events").insert({
      client_id: clientId,
      provider: "peach",
      event_type: "webhook",
      provider_payment_id: params.id ?? merchantTransactionId,
      amount: params.amount ? Number(params.amount) : null,
      status,
      payload: params
    });

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
  }

  return NextResponse.json({ ok: true });
}
