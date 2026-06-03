import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type PrivacyPageProps = {
  params: {
    subdomain: string;
  };
};

async function getPrivacyBusiness(subdomain: string) {
  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return {
      businessName: "This business",
      email: "the business"
    };
  }

  const { data } = await supabase
    .from("clients")
    .select("business_name,trading_name,email")
    .eq("subdomain", subdomain)
    .eq("site_published", true)
    .maybeSingle();

  return {
    businessName: data?.business_name ?? data?.trading_name ?? "This business",
    email: data?.email ?? "the business"
  };
}

export default async function PrivacyPage({ params }: PrivacyPageProps) {
  const business = await getPrivacyBusiness(params.subdomain);

  return (
    <main className="min-h-screen bg-paper px-5 py-12 text-ink">
      <article className="mx-auto max-w-3xl rounded-lg border border-line bg-white p-8 shadow-soft">
        <h1 className="text-3xl font-bold">Privacy policy</h1>
        <p className="mt-4 leading-8 text-muted">
          {business.businessName} respects your privacy and handles enquiry information in line with South African POPIA principles.
          Information submitted through this website is used to respond to service requests and customer enquiries.
        </p>
        <p className="mt-4 leading-8 text-muted">
          To request access, correction, or deletion of your information, contact {business.email}.
        </p>
      </article>
    </main>
  );
}
