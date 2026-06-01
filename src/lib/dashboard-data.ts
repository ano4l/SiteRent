import { hasSupabaseBrowserConfig } from "@/lib/env";
import { sampleClientSite } from "@/lib/sample-data";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type DashboardClient = {
  id: string;
  business_name: string | null;
  trading_name: string | null;
  tagline: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  primary_city: string | null;
  address: string | null;
  subdomain: string | null;
  custom_domain: string | null;
  site_published: boolean;
  published_at: string | null;
  subscription_status: string;
  next_billing_date: string | null;
  payment_failed_at: string | null;
  subscription_ends_at: string | null;
  gallery_photos: string[];
  ga_measurement_id: string | null;
  pixel_id: string | null;
  google_place_id?: string | null;
  template_style?: string | null;
};

export type DashboardData = {
  client: DashboardClient;
  mode: "supabase" | "local";
  isAuthenticated: boolean;
  hasWebsite: boolean;
};

export async function getDashboardData(): Promise<DashboardData> {
  const localClient = {
    id: sampleClientSite.id,
    business_name: sampleClientSite.businessName,
    trading_name: sampleClientSite.tradingName,
    tagline: sampleClientSite.tagline,
    phone: sampleClientSite.phone,
    whatsapp: sampleClientSite.whatsapp,
    email: sampleClientSite.email,
    primary_city: sampleClientSite.primaryCity,
    address: sampleClientSite.address ?? null,
    subdomain: sampleClientSite.subdomain ?? null,
    custom_domain: null,
    site_published: true,
    published_at: new Date().toISOString(),
    subscription_status: "active",
    next_billing_date: null,
    payment_failed_at: null,
    subscription_ends_at: null,
    gallery_photos: sampleClientSite.galleryPhotos,
    ga_measurement_id: null,
    pixel_id: sampleClientSite.pixelId ?? null,
    google_place_id: null,
    template_style: sampleClientSite.templateStyle ?? "aireco-dark"
  };

  const admin = createSupabaseAdminClient();
  if (!admin || !hasSupabaseBrowserConfig()) {
    return { client: localClient, mode: "local", isAuthenticated: false, hasWebsite: true };
  }

  const user = (await createSupabaseServerClient().auth.getUser()).data.user;
  if (!user) {
    return { client: localClient, mode: "local", isAuthenticated: false, hasWebsite: true };
  }

  const { data } = await admin
    .from("clients")
    .select(
      "id,business_name,trading_name,tagline,phone,whatsapp,email,primary_city,address,subdomain,custom_domain,site_published,published_at,subscription_status,next_billing_date,payment_failed_at,subscription_ends_at,gallery_photos,ga_measurement_id,pixel_id,google_place_id,template_style"
    )
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return {
    client: (data as DashboardClient | null) ?? {
      ...localClient,
      id: "new",
      business_name: null,
      trading_name: null,
      tagline: null,
      phone: null,
      whatsapp: null,
      email: null,
      primary_city: null,
      address: null,
      subdomain: null,
      site_published: false,
      published_at: null,
      subscription_status: "not_started",
      gallery_photos: [],
      pixel_id: null,
      template_style: null
    },
    mode: data ? "supabase" : "local",
    isAuthenticated: true,
    hasWebsite: Boolean(data)
  };
}
