import { WEEK_DAYS } from "@/lib/constants";
import type { ClientSite } from "@/lib/types";

export const sampleClientSite: ClientSite = {
  id: "sample",
  businessName: "Cape Climate Pros",
  tradingName: "Cape Climate Pros",
  tagline: "Fast air-conditioning repairs, installs, and maintenance.",
  ownerName: "Thabo Mokoena",
  yearFounded: 2016,
  businessTypes: ["HVAC", "Air-conditioning"],
  jobsCompleted: 1280,
  aboutText:
    "We help homes and small businesses stay comfortable with practical HVAC service, transparent pricing, and quick WhatsApp support.",
  services: ["aircon-installation", "aircon-repairs", "maintenance"],
  servicePrices: {
    "aircon-installation": "1800",
    "aircon-repairs": "650",
    maintenance: "450"
  },
  certifications: ["SANS compliant", "Certified installer"],
  isInsured: true,
  hasGuarantee: true,
  guaranteePeriod: "12 months",
  hasEmergency: true,
  offersFreeQuote: true,
  primaryCity: "Cape Town",
  address: "Cape Town, South Africa",
  suburbs: ["Bellville", "Durbanville", "Claremont", "Sea Point", "Observatory"],
  phone: "+27 21 555 0142",
  whatsapp: "+27215550142",
  email: "hello@capeclimate.example",
  responseTime: "Within 1 hour",
  hours: Object.fromEntries(
    WEEK_DAYS.map((day) => [day, { open: "08:00", close: "17:00", closed: day === "Sunday" }])
  ),
  facebookUrl: "https://facebook.com",
  instagramUrl: "https://instagram.com",
  templateStyle: "aireco-dark",
  brandColour: "teal",
  heroPhotoUrl: "https://images.pexels.com/photos/5463575/pexels-photo-5463575.jpeg?auto=compress&cs=tinysrgb&w=1400",
  ownerPhotoUrl: "https://images.pexels.com/photos/6471913/pexels-photo-6471913.jpeg?auto=compress&cs=tinysrgb&w=900",
  galleryPhotos: [
    "https://images.pexels.com/photos/5463582/pexels-photo-5463582.jpeg?auto=compress&cs=tinysrgb&w=900",
    "https://images.pexels.com/photos/5463585/pexels-photo-5463585.jpeg?auto=compress&cs=tinysrgb&w=900",
    "https://images.pexels.com/photos/6471911/pexels-photo-6471911.jpeg?auto=compress&cs=tinysrgb&w=900"
  ],
  testimonials: [
    {
      name: "M. Jacobs",
      suburb: "Bellville",
      quote: "Quick response, clear pricing, and the new unit works perfectly."
    },
    {
      name: "A. Patel",
      suburb: "Claremont",
      quote: "They arrived the same day and explained the repair before starting."
    },
    {
      name: "L. Williams",
      suburb: "Durbanville",
      quote: "Reliable maintenance team and easy to reach on WhatsApp."
    }
  ],
  subdomain: "cape-climate-pros"
};
