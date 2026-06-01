import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const enquirySchema = z.object({
  clientId: z.string(),
  name: z.string().min(2).max(120),
  phone: z.string().min(6).max(40),
  service: z.string().min(2).max(120),
  suburb: z.string().min(2).max(120),
  message: z.string().max(800).optional()
});

export async function POST(request: Request) {
  const payload = enquirySchema.safeParse(await request.json());

  if (!payload.success) {
    return NextResponse.json({ error: "Invalid enquiry payload" }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    return NextResponse.json({ ok: true, mode: "local", receivedAt: new Date().toISOString() });
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
