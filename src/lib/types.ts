import type { BrandColourKey, TemplateStyleKey } from "@/lib/constants";

export type TemplateStyle = TemplateStyleKey;

export type Testimonial = {
  name: string;
  suburb: string;
  quote: string;
};

export type OperatingHours = Record<
  string,
  {
    open: string;
    close: string;
    closed?: boolean;
  }
>;

export type ClientSite = {
  id: string;
  businessName: string;
  tradingName: string;
  tagline: string;
  ownerName: string;
  yearFounded: number;
  businessTypes: string[];
  jobsCompleted: number;
  aboutText: string;
  services: string[];
  servicePrices: Record<string, string>;
  certifications: string[];
  isInsured: boolean;
  hasGuarantee: boolean;
  guaranteePeriod?: string;
  hasEmergency: boolean;
  offersFreeQuote: boolean;
  primaryCity: string;
  address?: string;
  suburbs: string[];
  phone: string;
  whatsapp: string;
  email: string;
  responseTime: string;
  hours: OperatingHours;
  facebookUrl?: string;
  instagramUrl?: string;
  pixelId?: string;
  gaMeasurementId?: string;
  templateStyle?: TemplateStyle;
  brandColour: BrandColourKey;
  logoUrl?: string;
  heroPhotoUrl?: string;
  ownerPhotoUrl?: string;
  galleryPhotos: string[];
  testimonials: Testimonial[];
  subdomain?: string;
  customDomain?: string;
};
