export const BRAND_COLOURS = {
  navy: { label: "Navy", hex: "#1e3a5f" },
  red: { label: "Red", hex: "#C0392B" },
  green: { label: "Green", hex: "#1A7A4A" },
  amber: { label: "Amber", hex: "#BA7517" },
  purple: { label: "Purple", hex: "#534AB7" },
  teal: { label: "Teal", hex: "#0F6E56" }
} as const;

export type BrandColourKey = keyof typeof BRAND_COLOURS;

export const TEMPLATE_STYLES = {
  "aireco-dark": {
    label: "Aireco dark",
    description: "Dark premium hero, orange booking CTAs, large technician photography.",
    accent: "#ff6422",
    canvas: "#171514"
  },
  "eircool-editorial": {
    label: "Eircool editorial",
    description: "Airy cream canvas, olive details, staggered image-led sections.",
    accent: "#687143",
    canvas: "#f6f5ed"
  },
  "razor-minimal": {
    label: "Razor minimal",
    description: "Ivory full-bleed pages, pill navigation, oversized type and service cards.",
    accent: "#ffd51a",
    canvas: "#fbf6f1"
  },
  "coolair-blue": {
    label: "CoolAir blue",
    description: "Blue corporate hero, trust cards, process-led conversion sections.",
    accent: "#4f83dc",
    canvas: "#edf4ff"
  }
} as const;

export type TemplateStyleKey = keyof typeof TEMPLATE_STYLES;

export const ONBOARDING_STEPS = [
  "Basics",
  "Services",
  "Branding",
  "Contact",
  "Payment",
  "Publish"
] as const;

export const HVAC_SERVICES = [
  {
    key: "aircon-installation",
    label: "Aircon installation",
    description: "New split-unit and commercial air-conditioning installations."
  },
  {
    key: "aircon-repairs",
    label: "Aircon repairs",
    description: "Fault finding, repairs, regassing, and urgent breakdown support."
  },
  {
    key: "maintenance",
    label: "Maintenance plans",
    description: "Scheduled cleaning, filter checks, and preventive maintenance."
  },
  {
    key: "ducting",
    label: "Ducting and ventilation",
    description: "Ventilation, extractor, and ducting work for homes and businesses."
  },
  {
    key: "plumbing",
    label: "Plumbing support",
    description: "General plumbing support where offered by the contractor."
  }
] as const;

export const WEEK_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday"
] as const;

export const RESPONSE_TIMES = [
  "Within 30 minutes",
  "Within 1 hour",
  "Same day",
  "Next business day"
] as const;
