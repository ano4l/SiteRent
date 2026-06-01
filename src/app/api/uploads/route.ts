import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { slugifySubdomain } from "@/lib/utils";

const uploadBuckets = {
  logo: "logos",
  hero: "hero-photos",
  owner: "owner-photos",
  gallery: "gallery-photos"
} as const;

type UploadType = keyof typeof uploadBuckets;

function isUploadType(value: FormDataEntryValue | null): value is UploadType {
  return typeof value === "string" && value in uploadBuckets;
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");
  const type = formData.get("type");
  const clientId = String(formData.get("clientId") ?? "local-client");

  if (!(file instanceof File) || !isUploadType(type)) {
    return NextResponse.json({ error: "Invalid upload payload" }, { status: 400 });
  }

  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "File exceeds 5MB limit" }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  const safeName = slugifySubdomain(file.name.replace(/\.[^.]+$/, "")) || "upload";
  const extension = file.name.includes(".") ? file.name.split(".").pop() : "bin";
  const path = `${clientId}/${Date.now()}-${safeName}.${extension}`;

  if (!supabase) {
    return NextResponse.json({
      ok: true,
      mode: "local",
      url: `/uploads/local/${path}`
    });
  }

  const bucket = uploadBuckets[type];
  const buffer = Buffer.from(await file.arrayBuffer());
  const { error } = await supabase.storage.from(bucket).upload(path, buffer, {
    contentType: file.type || "application/octet-stream",
    upsert: true
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);

  return NextResponse.json({
    ok: true,
    url: data.publicUrl
  });
}
