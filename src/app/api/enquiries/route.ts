import { NextResponse } from "next/server";
import { z } from "zod";
import { getMissingSupabaseServiceConfig, productionConfigError } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const enquirySchema = z.object({
  clientId: z.string().min(1),
  name: z.string().min(2).max(120),
  phone: z.string().min(6).max(40),
  service: z.string().min(2).max(120),
  suburb: z.string().min(2).max(120),
  message: z.string().max(800).optional(),
  // Honeypot: must stay empty. A non-empty value means a bot filled the hidden
  // field. Accept any string at the schema level so we can silently 200 below.
  company: z.string().max(200).optional()
});

// Best-effort, per-instance rate limiter. For multi-instance/serverless
// deployments, back this with a durable store (e.g. Upstash/Redis).
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 5;
const rateLimitBuckets = new Map<string, number[]>();

function isRateLimited(key: string) {
  const now = Date.now();
  const recent = (rateLimitBuckets.get(key) ?? []).filter((ts) => now - ts < RATE_LIMIT_WINDOW_MS);
  recent.push(now);
  rateLimitBuckets.set(key, recent);
  return recent.length > RATE_LIMIT_MAX;
}

function getClientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}

export async function POST(request: Request) {
  const payload = enquirySchema.safeParse(await request.json());

  if (!payload.success) {
    return NextResponse.json({ error: "Invalid enquiry payload" }, { status: 400 });
  }

  // Honeypot triggered: pretend success so bots don't learn the field is checked.
  if (payload.data.company) {
    return NextResponse.json({ ok: true, receivedAt: new Date().toISOString() });
  }

  if (isRateLimited(getClientIp(request))) {
    return NextResponse.json({ error: "Too many requests. Please try again shortly." }, { status: 429 });
  }

  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    return NextResponse.json(
      productionConfigError(
        "Supabase service role is required before enquiries can be captured in production.",
        getMissingSupabaseServiceConfig()
      ),
      { status: 503 }
    );
  }

  // Only accept enquiries for a real, currently published client.
  const { data: client } = await supabase
    .from("clients")
    .select("id")
    .eq("id", payload.data.clientId)
    .eq("site_published", true)
    .maybeSingle();

  if (!client) {
    return NextResponse.json({ error: "Unknown or unpublished site" }, { status: 404 });
  }

  const { error } = await supabase.from("site_enquiries").insert({
    client_id: payload.data.clientId,
    name: payload.data.name,
    phone: payload.data.phone,
    service: payload.data.service,
    suburb: payload.data.suburb,
    message: payload.data.message ?? null,
    status: "new"
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, receivedAt: new Date().toISOString() });
}
