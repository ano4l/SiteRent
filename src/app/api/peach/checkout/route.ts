import { NextResponse } from "next/server";
import { z } from "zod";
import { MONTHLY_PLAN_AMOUNT } from "@/lib/billing";
import {
  buildPeachSignature,
  createPeachMerchantTransactionId,
  createPeachNonce,
  getPeachCheckoutUrl,
  hasPeachCheckoutConfig
} from "@/lib/peach";
import { getMissingSupabaseServiceConfig, hasSupabaseBrowserConfig, isWaasTestMode, productionConfigError } from "@/lib/env";
import { getAuthenticatedUserId } from "@/lib/client-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { TEST_CLIENT_ID } from "@/lib/test-data";

const checkoutSchema = z.object({
  clientId: z.string().uuid().optional(),
  businessName: z.string().min(1),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  amount: z.number().positive().default(MONTHLY_PLAN_AMOUNT)
});

export async function POST(request: Request) {
  const payload = checkoutSchema.safeParse(await request.json());

  if (!payload.success) {
    return NextResponse.json({ error: "Invalid checkout payload" }, { status: 400 });
  }

  if (isWaasTestMode()) {
    return NextResponse.json({
      ok: true,
      mode: "local",
      clientId: payload.data.clientId ?? TEST_CLIENT_ID,
      message: "Test mode: Peach checkout was treated as successful."
    });
  }

  if (!payload.data.clientId) {
    return NextResponse.json({ error: "Client ID is required before checkout can start." }, { status: 400 });
  }

  if (!hasPeachCheckoutConfig()) {
    return NextResponse.json(
      {
        error: "Peach Payments credentials are required before checkout can start in production.",
        missing: ["PEACH_ENTITY_ID", "PEACH_SECRET_TOKEN"]
      },
      { status: 503 }
    );
  }

  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin;
  const merchantTransactionId = createPeachMerchantTransactionId();
  const nonce = createPeachNonce();
  const auxData = JSON.stringify({
    clientId: payload.data.clientId,
    product: "siterent-monthly"
  });

  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    return NextResponse.json(
      productionConfigError(
        "Supabase service role is required before checkout can start in production.",
        getMissingSupabaseServiceConfig()
      ),
      { status: 503 }
    );
  }

  const userId = hasSupabaseBrowserConfig() ? await getAuthenticatedUserId() : null;
  if (hasSupabaseBrowserConfig() && !userId) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const clientQuery = supabase
    .from("clients")
    .select("id,business_name,email,phone")
    .eq("id", payload.data.clientId);

  if (userId) {
    clientQuery.eq("user_id", userId);
  }

  const { data: client } = await clientQuery.maybeSingle();

  if (!client) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }

  const draftFields: Record<string, string | number | undefined> = {
    "authentication.entityId": process.env.PEACH_ENTITY_ID,
    merchantTransactionId,
    merchantInvoiceId: merchantTransactionId,
    amount: payload.data.amount.toFixed(2),
    currency: "ZAR",
    paymentType: "DB",
    nonce,
    shopperResultUrl: `${origin}/api/peach/result`,
    cancelUrl: `${origin}/peach/cancel`,
    notificationUrl: `${origin}/api/peach/webhook`,
    "customer.merchantCustomerId": client.id,
    "customer.email": client.email || payload.data.email || undefined,
    "customer.phone": client.phone || payload.data.phone || undefined,
    "customer.givenName": (client.business_name ?? payload.data.businessName).slice(0, 48),
    "customer.surname": "Customer",
    createRegistration: "true",
    "standingInstruction.type": "RECURRING",
    "standingInstruction.mode": "INITIAL",
    "standingInstruction.recurringType": "SUBSCRIPTION",
    "standingInstruction.frequency": "30",
    "customParameters[auxData]": auxData
  };

  const fields = Object.fromEntries(
    Object.entries(draftFields).filter(([, value]) => value !== undefined && value !== "")
  ) as Record<string, string | number>;
  const signature = buildPeachSignature(fields, process.env.PEACH_SECRET_TOKEN);
  const signedFields = { ...fields, signature };

  await supabase.from("billing_events").insert({
    client_id: payload.data.clientId,
    provider: "peach",
    event_type: "checkout_created",
    provider_payment_id: merchantTransactionId,
    amount: payload.data.amount,
    status: "pending",
    payload: {
      merchant_transaction_id: merchantTransactionId,
      sandbox: process.env.PEACH_SANDBOX !== "false"
    }
  });

  return NextResponse.json({
    ok: true,
    mode: process.env.PEACH_SANDBOX === "false" ? "live" : "sandbox",
    url: getPeachCheckoutUrl(),
    method: "POST",
    fields: signedFields
  });
}
