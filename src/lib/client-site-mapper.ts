import { BRAND_COLOURS, TEMPLATE_STYLES, WEEK_DAYS } from "@/lib/constants";
import type { ClientSite, OperatingHours, TemplateStyle, Testimonial } from "@/lib/types";

type ClientRow = Record<string, unknown>;

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function asRecord(value: unknown): Record<string, string> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, item]) => [key, String(item ?? "")])
  );
}

function asTestimonials(value: unknown): Testimonial[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const row = item as Record<string, unknown>;
      return {
        name: String(row.name ?? ""),
        suburb: String(row.suburb ?? ""),
        quote: String(row.quote ?? "")
      };
    })
    .filter((item): item is Testimonial => Boolean(item?.name && item.quote));
}

function asHours(value: unknown): OperatingHours {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as OperatingHours;
  }

  return Object.fromEntries(
    WEEK_DAYS.map((day) => [day, { open: "08:00", close: "17:00", closed: day === "Sunday" }])
  );
}

function asTemplateStyle(value: unknown): TemplateStyle {
  const legacyStyles: Record<string, TemplateStyle> = {
    "soft-orange": "aireco-dark",
    "dark-premium": "aireco-dark",
    "army-bold": "razor-minimal",
    "blue-corporate": "coolair-blue",
    "editorial-orange": "eircool-editorial"
  };
  const style = String(value ?? "aireco-dark");
  return style in TEMPLATE_STYLES
    ? (style as TemplateStyle)
    : legacyStyles[style] ?? "aireco-dark";
}

export function mapClientRowToSite(row: ClientRow): ClientSite {
  const brandColour = String(row.brand_colour ?? "navy");

  return {
    id: String(row.id),
    businessName: String(row.business_name ?? row.trading_name ?? "HVAC Business"),
    tradingName: String(row.trading_name ?? row.business_name ?? "HVAC Business"),
    tagline: String(row.tagline ?? "Reliable HVAC service with clear pricing."),
    ownerName: String(row.owner_name ?? ""),
    yearFounded: Number(row.year_founded ?? new Date().getFullYear()),
    businessTypes: asStringArray(row.business_types),
    jobsCompleted: Number(row.jobs_completed ?? 0),
    aboutText: String(row.about_text ?? ""),
    services: asStringArray(row.services),
    servicePrices: asRecord(row.service_prices),
    certifications: asStringArray(row.certifications),
    isInsured: Boolean(row.is_insured),
    hasGuarantee: Boolean(row.has_guarantee),
    guaranteePeriod: row.guarantee_period ? String(row.guarantee_period) : undefined,
    hasEmergency: Boolean(row.has_emergency),
    offersFreeQuote: Boolean(row.offers_free_quote),
    primaryCity: String(row.primary_city ?? ""),
    address: row.address ? String(row.address) : undefined,
    suburbs: asStringArray(row.suburbs),
    phone: String(row.phone ?? ""),
    whatsapp: String(row.whatsapp ?? ""),
    email: String(row.email ?? ""),
    responseTime: String(row.response_time ?? "Same day"),
    hours: asHours(row.hours),
    facebookUrl: row.facebook_url ? String(row.facebook_url) : undefined,
    instagramUrl: row.instagram_url ? String(row.instagram_url) : undefined,
    pixelId: row.pixel_id ? String(row.pixel_id) : undefined,
    gaMeasurementId: row.ga_measurement_id ? String(row.ga_measurement_id) : undefined,
    templateStyle: asTemplateStyle(row.template_style),
    brandColour: brandColour in BRAND_COLOURS ? (brandColour as keyof typeof BRAND_COLOURS) : "navy",
    logoUrl: row.logo_url ? String(row.logo_url) : undefined,
    heroPhotoUrl: row.hero_photo_url ? String(row.hero_photo_url) : undefined,
    ownerPhotoUrl: row.owner_photo_url ? String(row.owner_photo_url) : undefined,
    galleryPhotos: asStringArray(row.gallery_photos),
    testimonials: asTestimonials(row.testimonials),
    subdomain: row.subdomain ? String(row.subdomain) : undefined,
    customDomain: row.custom_domain ? String(row.custom_domain) : undefined
  };
}
