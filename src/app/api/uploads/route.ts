import { NextResponse } from "next/server";
import { getMissingSupabaseServiceConfig, hasSupabaseBrowserConfig, isWaasTestMode, productionConfigError } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { slugifySubdomain } from "@/lib/utils";

const uploadBuckets = {
  logo: "logos",
  hero: "hero-photos",
  owner: "owner-photos",
  gallery: "gallery-photos"
} as const;

type UploadType = keyof typeof uploadBuckets;

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

// Allowlist of accepted MIME types per upload kind. Logos may be vector (SVG).
const allowedMimeTypes: Record<UploadType, string[]> = {
  logo: ["image/png", "image/svg+xml", "image/jpeg", "image/webp"],
  hero: ["image/png", "image/jpeg", "image/webp"],
  owner: ["image/png", "image/jpeg", "image/webp"],
  gallery: ["image/png", "image/jpeg", "image/webp"]
};

function isUploadType(value: FormDataEntryValue | null): value is UploadType {
  return typeof value === "string" && value in uploadBuckets;
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");
  const type = formData.get("type");
  const requestedClientId = String(formData.get("clientId") ?? "");

  if (!(file instanceof File) || !isUploadType(type)) {
    return NextResponse.json({ error: "Invalid upload payload" }, { status: 400 });
  }

  if (file.size === 0 || file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ error: "File must be between 1 byte and 5MB" }, { status: 400 });
  }

  if (!allowedMimeTypes[type].includes(file.type)) {
    return NextResponse.json({ error: "Unsupported file type" }, { status: 415 });
  }

  const supabase = createSupabaseAdminClient();
  const safeName = slugifySubdomain(file.name.replace(/\.[^.]+$/, "")) || "upload";
  const extension = (file.name.includes(".") ? file.name.split(".").pop() : "bin")
    ?.toLowerCase()
    .replace(/[^a-z0-9]/g, "") || "bin";

  if (isWaasTestMode()) {
    return NextResponse.json({
      ok: true,
      mode: "test",
      url: `/icon.svg?testUpload=${Date.now()}-${safeName}.${extension}`
    });
  }

  if (!supabase) {
    return NextResponse.json(
      productionConfigError("Supabase Storage is required before uploads can be accepted in production.", getMissingSupabaseServiceConfig()),
      { status: 503 }
    );
  }

  // Authenticated mode: require a signed-in user and scope the upload to a
  // client row they own. This prevents anonymous uploads and writing into
  // another tenant's storage prefix.
  let ownerScope = requestedClientId;
  if (hasSupabaseBrowserConfig()) {
    const user = (await createSupabaseServerClient().auth.getUser()).data.user;
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    if (requestedClientId) {
      const { data: ownedClient } = await supabase
        .from("clients")
        .select("id")
        .eq("id", requestedClientId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (!ownedClient) {
        return NextResponse.json({ error: "Client not found or access denied" }, { status: 403 });
      }
      ownerScope = requestedClientId;
    } else {
      // No client row yet (early onboarding): scope path to the user id.
      ownerScope = user.id;
    }
  }

  const path = `${ownerScope}/${Date.now()}-${safeName}.${extension}`;

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
