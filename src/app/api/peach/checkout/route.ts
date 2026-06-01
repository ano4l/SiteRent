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
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

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

  if (!hasPeachCheckoutConfig()) {
    return NextResponse.json({
      ok: true,
      mode: "local",
      message: "Peach Payments credentials are not configured. Local payment is treated as successful."
    });
  }

  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin;
  const merchantTransactionId = createPeachMerchantTransactionId();
  const nonce = createPeachNonce();
  const auxData = JSON.stringify({
    clientId: payload.data.clientId,
    product: "siterent-monthly"
  });

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
    "customer.merchantCustomerId": payload.data.clientId,
    "customer.email": payload.data.email || undefined,
    "customer.phone": payload.data.phone || undefined,
    "customer.givenName": payload.data.businessName.slice(0, 48),
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

  const supabase = createSupabaseAdminClient();
  if (supabase) {
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
  }

  return NextResponse.json({
    ok: true,
    mode: process.env.PEACH_SANDBOX === "false" ? "live" : "sandbox",
    url: getPeachCheckoutUrl(),
    method: "POST",
    fields: signedFields
  });
}
