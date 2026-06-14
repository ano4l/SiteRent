import { WEEK_DAYS } from "@/lib/constants";
import type { ClientSite } from "@/lib/types";

export const TEST_CLIENT_ID = "00000000-0000-4000-8000-000000000001";
export const TEST_USER_ID = "00000000-0000-4000-8000-000000000002";
export const TEST_SUBDOMAIN = "brightspark-electricians";

export function getTestClientSite(subdomain = TEST_SUBDOMAIN): ClientSite {
  return {
    id: TEST_CLIENT_ID,
    businessName: "BrightSpark Electricians",
    tradingName: "BrightSpark Electricians",
    tagline: "Safe electrical repairs, installations, and compliance support across Cape Town.",
    ownerName: "Sam Rivera",
    yearFounded: 2018,
    businessTypes: ["Electrical"],
    jobsCompleted: 640,
    aboutText:
      "BrightSpark Electricians helps homeowners, landlords, and small businesses with dependable electrical fault finding, upgrades, lighting, and compliance-ready work.",
    services: ["fault-finding", "db-board-upgrades", "lighting-installation", "electrical-compliance"],
    servicePrices: {
      "fault-finding": "550",
      "db-board-upgrades": "1800",
      "lighting-installation": "450",
      "electrical-compliance": "1200"
    },
    certifications: ["Qualified electrician", "Insured service team"],
    isInsured: true,
    hasGuarantee: true,
    guaranteePeriod: "12 months",
    hasEmergency: true,
    offersFreeQuote: true,
    primaryCity: "Cape Town",
    address: "12 Bree Street, Cape Town",
    suburbs: ["Sea Point", "Claremont", "Gardens", "Durbanville", "Bellville"],
    phone: "+27 21 555 0198",
    whatsapp: "+27 82 555 0198",
    email: "hello@brightspark.example",
    responseTime: "Same day",
    hours: Object.fromEntries(
      WEEK_DAYS.map((day) => [day, { open: "08:00", close: "17:00", closed: day === "Sunday" }])
    ),
    facebookUrl: "https://facebook.com/brightsparkelectricians",
    instagramUrl: "https://instagram.com/brightsparkelectricians",
    pixelId: "1234567890",
    gaMeasurementId: "G-TESTMODE",
    templateStyle: "razor-minimal",
    brandColour: "amber",
    logoUrl: "/icon.svg",
    heroPhotoUrl: "/icon.svg",
    ownerPhotoUrl: "/icon.svg",
    galleryPhotos: ["/icon.svg", "/icon.svg", "/icon.svg"],
    testimonials: [
      {
        name: "Nadia K.",
        suburb: "Claremont",
        quote: "They traced the fault quickly and had our office power stable before lunch."
      },
      {
        name: "Thabo M.",
        suburb: "Sea Point",
        quote: "Clear pricing, neat work, and a friendly team."
      }
    ],
    subdomain,
    customDomain: "brightsparkelectricians.co.za"
  };
}
