import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthenticatedUserId } from "@/lib/client-auth";
import { hasSupabaseBrowserConfig } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const republishSchema = z.object({
  clientId: z.string().min(1)
});

export async function POST(request: Request) {
  const payload = republishSchema.safeParse(await request.json());

  if (!payload.success) {
    return NextResponse.json({ error: "Invalid re-publish payload" }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return NextResponse.json({
      ok: true,
      mode: "local",
      republishedAt: new Date().toISOString()
    });
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
      site_published: true,
      published_at: new Date().toISOString()
    })
    .eq("id", payload.data.clientId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await supabase.from("billing_events").insert({
    client_id: payload.data.clientId,
    event_type: "site_republished",
    status: "published",
    payload: {}
  });

  return NextResponse.json({
    ok: true,
    republishedAt: new Date().toISOString()
  });
}
