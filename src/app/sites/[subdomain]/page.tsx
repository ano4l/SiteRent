import type { Metadata } from "next";
import Script from "next/script";
import { HvacSite } from "@/components/published/hvac-site";
import { mapClientRowToSite } from "@/lib/client-site-mapper";
import { getSiteUrl } from "@/lib/domains";
import { sampleClientSite } from "@/lib/sample-data";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { ClientSite } from "@/lib/types";

type PublishedSitePageProps = {
  params: {
    subdomain: string;
  };
  searchParams?: {
    template?: string;
  };
};

async function getSite(subdomain: string) {
  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return sampleClientSite;
  }

  const { data } = await supabase
    .from("clients")
    .select("*")
    .eq("subdomain", subdomain)
    .eq("site_published", true)
    .maybeSingle();

  return data ? mapClientRowToSite(data) : null;
}

async function getSiteStatus(subdomain: string) {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return { suspended: false };

  const { data } = await supabase
    .from("clients")
    .select("subscription_status,subscription_ends_at")
    .eq("subdomain", subdomain)
    .eq("site_published", true)
    .maybeSingle();

  if (!data) return { suspended: false };

  const end = data.subscription_ends_at ? new Date(data.subscription_ends_at).getTime() : null;
  const isPastEnd = end ? end < Date.now() : false;

  return {
    suspended: ["past_due", "cancelled", "paused"].includes(data.subscription_status ?? "") && isPastEnd
  };
}

export async function generateMetadata({ params }: PublishedSitePageProps): Promise<Metadata> {
  const site = (await getSite(params.subdomain)) ?? sampleClientSite;
  const url = getCanonicalUrl(site, params.subdomain);

  return {
    title: `${site.businessName} - HVAC & Plumbing in ${site.primaryCity}`,
    description: site.tagline,
    alternates: {
      canonical: url
    },
    openGraph: {
      title: `${site.businessName} - HVAC & Plumbing in ${site.primaryCity}`,
      description: site.tagline,
      url,
      images: site.heroPhotoUrl ? [{ url: site.heroPhotoUrl }] : undefined,
      type: "website"
    }
  };
}

export default async function PublishedSitePage({ params, searchParams }: PublishedSitePageProps) {
  const site = await getSite(params.subdomain);
  const status = await getSiteStatus(params.subdomain);

  if (!site) {
    return (
      <main className="grid min-h-screen place-items-center bg-paper px-5 text-ink">
        <section className="max-w-md rounded-lg border border-line bg-white p-6 text-center shadow-soft">
          <h1 className="text-3xl font-bold">Site not found</h1>
          <p className="mt-2 text-muted">This SiteRent website is not published yet.</p>
        </section>
      </main>
    );
  }

  if (status.suspended) {
    return (
      <main className="grid min-h-screen place-items-center bg-paper px-5 text-ink">
        <section className="max-w-md rounded-lg border border-line bg-white p-6 text-center shadow-soft">
          <h1 className="text-3xl font-bold">Website temporarily unavailable</h1>
          <p className="mt-2 text-muted">This SiteRent website is paused. Please contact the business directly.</p>
        </section>
      </main>
    );
  }

  return (
    <>
      <TrackingScripts site={site} />
      <JsonLd site={site} subdomain={params.subdomain} />
      <HvacSite site={withTemplatePreview(site, searchParams?.template)} />
    </>
  );
}

function withTemplatePreview(site: ClientSite, template?: string) {
  const templates = ["aireco-dark", "eircool-editorial", "razor-minimal", "coolair-blue"];
  if (!template || !templates.includes(template)) return site;
  return { ...site, templateStyle: template as ClientSite["templateStyle"] };
}

function getCanonicalUrl(site: ClientSite, subdomain: string) {
  return site.customDomain ? `https://${site.customDomain}` : getSiteUrl(site.subdomain ?? subdomain);
}

function TrackingScripts({ site }: { site: ClientSite }) {
  return (
    <>
      {site.gaMeasurementId && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(site.gaMeasurementId)}`} strategy="afterInteractive" />
          <Script id={`ga4-${site.id}`} strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', ${JSON.stringify(site.gaMeasurementId)});
            `}
          </Script>
        </>
      )}
      {site.pixelId && (
        <>
          <Script id={`meta-pixel-${site.id}`} strategy="afterInteractive">
            {`
              !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
              n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}
              (window, document,'script','https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', ${JSON.stringify(site.pixelId)});
              fbq('track', 'PageView');
            `}
          </Script>
          <noscript>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img height="1" width="1" style={{ display: "none" }} src={`https://www.facebook.com/tr?id=${encodeURIComponent(site.pixelId)}&ev=PageView&noscript=1`} alt="" />
          </noscript>
        </>
      )}
    </>
  );
}

function JsonLd({ site, subdomain }: { site: ClientSite; subdomain: string }) {
  const url = getCanonicalUrl(site, subdomain);
  const sameAs = [site.facebookUrl, site.instagramUrl].filter(Boolean);
  const schema = {
    "@context": "https://schema.org",
    "@type": "HomeAndConstructionBusiness",
    "@id": `${url}#business`,
    name: site.businessName,
    url,
    image: site.heroPhotoUrl ?? site.logoUrl,
    logo: site.logoUrl,
    telephone: site.phone,
    email: site.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: site.address,
      addressLocality: site.primaryCity,
      addressCountry: "ZA"
    },
    areaServed: site.suburbs.map((suburb) => ({
      "@type": "Place",
      name: suburb
    })),
    openingHoursSpecification: Object.entries(site.hours).map(([day, hours]) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: day,
      opens: hours.closed ? undefined : hours.open,
      closes: hours.closed ? undefined : hours.close
    })),
    priceRange: "R",
    sameAs
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }}
    />
  );
}
