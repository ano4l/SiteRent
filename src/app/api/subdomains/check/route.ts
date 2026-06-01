import { NextResponse } from "next/server";
import { z } from "zod";
import { isValidSubdomain } from "@/lib/domains";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { slugifySubdomain } from "@/lib/utils";

const querySchema = z.object({
  subdomain: z.string().min(3).max(63)
});

export async function GET(request: Request) {
  const url = new URL(request.url);
  const parsed = querySchema.safeParse({ subdomain: url.searchParams.get("subdomain") ?? "" });

  if (!parsed.success) {
    return NextResponse.json({ available: false, error: "Invalid subdomain" }, { status: 400 });
  }

  const subdomain = slugifySubdomain(parsed.data.subdomain);
  const valid = isValidSubdomain(subdomain);
  const supabase = createSupabaseAdminClient();
  let exists = false;

  if (supabase) {
    const { data } = await supabase.from("clients").select("id").eq("subdomain", subdomain).maybeSingle();
    exists = Boolean(data);
  }

  return NextResponse.json({
    subdomain,
    available: valid && !exists,
    valid
  });
}
