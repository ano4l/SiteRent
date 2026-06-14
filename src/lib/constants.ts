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

export const INDUSTRY_TEMPLATES = {
  plumbers: {
    label: "Plumbers",
    singular: "Plumbing",
    defaultTemplateStyle: "eircool-editorial",
    defaultBrandColour: "teal",
    serviceKeys: ["leak-repairs", "blocked-drains", "bathroom-plumbing", "emergency-plumbing"],
    defaultTagline: "Fast plumbing repairs, leak detection, and maintenance for local homes and businesses.",
    defaultAbout:
      "We help local customers solve plumbing problems quickly with clear communication, practical pricing, and tidy workmanship.",
    defaultCertifications: "Licensed plumber, insured workmanship"
  },
  "geyser-repair": {
    label: "Geyser repair",
    singular: "Geyser repair",
    defaultTemplateStyle: "coolair-blue",
    defaultBrandColour: "navy",
    serviceKeys: ["geyser-repairs", "geyser-installation", "burst-geysers", "valve-replacement"],
    defaultTagline: "Reliable geyser repairs, replacements, and urgent leak support.",
    defaultAbout:
      "We handle geyser faults, leaks, replacements, and safety checks with fast response times and clear next steps.",
    defaultCertifications: "Qualified hot-water technician, insured service team"
  },
  electrician: {
    label: "Electrician",
    singular: "Electrical",
    defaultTemplateStyle: "razor-minimal",
    defaultBrandColour: "amber",
    serviceKeys: ["fault-finding", "db-board-upgrades", "lighting-installation", "electrical-compliance"],
    defaultTagline: "Safe electrical repairs, installations, and compliance support.",
    defaultAbout:
      "We help homeowners and small businesses with dependable electrical work, from urgent faults to planned upgrades.",
    defaultCertifications: "Qualified electrician, compliance-ready workmanship"
  },
  locksmiths: {
    label: "Locksmiths",
    singular: "Locksmith",
    defaultTemplateStyle: "aireco-dark",
    defaultBrandColour: "purple",
    serviceKeys: ["lockouts", "lock-replacement", "rekeying", "security-locks"],
    defaultTagline: "Fast lockouts, lock replacements, and security upgrades.",
    defaultAbout:
      "We provide responsive locksmith help for homes, offices, and shops with secure work and straightforward pricing.",
    defaultCertifications: "Vetted locksmith, insured call-outs"
  },
  "pest-control": {
    label: "Pest control",
    singular: "Pest control",
    defaultTemplateStyle: "eircool-editorial",
    defaultBrandColour: "green",
    serviceKeys: ["cockroach-treatment", "rodent-control", "termite-treatment", "ant-control"],
    defaultTagline: "Practical pest control for homes, rentals, and businesses.",
    defaultAbout:
      "We identify pest issues, explain treatment options, and help customers protect their space with safe follow-up plans.",
    defaultCertifications: "Registered pest control operator, safe treatment methods"
  },
  roofing: {
    label: "Roofing",
    singular: "Roofing",
    defaultTemplateStyle: "razor-minimal",
    defaultBrandColour: "red",
    serviceKeys: ["roof-leak-repairs", "roof-waterproofing", "roof-inspection", "gutter-repairs"],
    defaultTagline: "Roof repairs, waterproofing, inspections, and gutter work.",
    defaultAbout:
      "We help property owners prevent water damage with practical roof repairs, waterproofing, and maintenance plans.",
    defaultCertifications: "Insured roofing team, waterproofing specialists"
  },
  hvac: {
    label: "HVAC",
    singular: "HVAC",
    defaultTemplateStyle: "coolair-blue",
    defaultBrandColour: "navy",
    serviceKeys: ["aircon-installation", "aircon-repairs", "maintenance", "ducting"],
    defaultTagline: "Fast, reliable air-conditioning repairs, installations, and maintenance.",
    defaultAbout:
      "We help homes and businesses stay comfortable with prompt HVAC repairs, planned maintenance, and clean installations.",
    defaultCertifications: "SAQCC registered technicians, insured service team"
  },
  solar: {
    label: "Solar",
    singular: "Solar",
    defaultTemplateStyle: "coolair-blue",
    defaultBrandColour: "amber",
    serviceKeys: ["solar-installation", "inverter-backup", "battery-storage", "solar-maintenance"],
    defaultTagline: "Solar, inverter, and backup power systems for homes and businesses.",
    defaultAbout:
      "We design, install, and maintain practical backup power systems that keep customers running through outages.",
    defaultCertifications: "Qualified solar installer, compliant installation team"
  },
  barbers: {
    label: "Barbers",
    singular: "Barber",
    defaultTemplateStyle: "aireco-dark",
    defaultBrandColour: "red",
    serviceKeys: ["haircuts", "fades", "beard-trims", "kids-cuts"],
    defaultTagline: "Sharp cuts, fades, and grooming with easy booking.",
    defaultAbout:
      "We give customers a clean grooming experience with reliable booking, consistent cuts, and a welcoming local shop.",
    defaultCertifications: "Experienced barbers, appointment-friendly service"
  },
  photographers: {
    label: "Photographers",
    singular: "Photography",
    defaultTemplateStyle: "eircool-editorial",
    defaultBrandColour: "purple",
    serviceKeys: ["portrait-photography", "event-photography", "wedding-photography", "product-photography"],
    defaultTagline: "Portraits, events, and brand photography with a polished booking flow.",
    defaultAbout:
      "We help people and businesses capture important moments with thoughtful planning, clean editing, and dependable delivery.",
    defaultCertifications: "Professional photographer, edited gallery delivery"
  }
} as const satisfies Record<
  string,
  {
    label: string;
    singular: string;
    defaultTemplateStyle: TemplateStyleKey;
    defaultBrandColour: BrandColourKey;
    serviceKeys: readonly string[];
    defaultTagline: string;
    defaultAbout: string;
    defaultCertifications: string;
  }
>;

export type IndustryTemplateKey = keyof typeof INDUSTRY_TEMPLATES;

export const ONBOARDING_STEPS = [
  "Basics",
  "Services",
  "Branding",
  "Contact",
  "Payment",
  "Publish"
] as const;

export const SERVICE_CATALOG = [
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
  },
  {
    key: "leak-repairs",
    label: "Leak repairs",
    description: "Trace leaks, repair pipework, and stop recurring water damage."
  },
  {
    key: "blocked-drains",
    label: "Blocked drains",
    description: "Clear blocked sinks, toilets, showers, and stormwater lines."
  },
  {
    key: "bathroom-plumbing",
    label: "Bathroom plumbing",
    description: "Install and repair toilets, taps, basins, showers, and mixers."
  },
  {
    key: "emergency-plumbing",
    label: "Emergency plumbing",
    description: "Urgent plumbing call-outs for leaks, bursts, and breakdowns."
  },
  {
    key: "geyser-repairs",
    label: "Geyser repairs",
    description: "Fix faulty elements, thermostats, leaks, pressure valves, and poor hot water."
  },
  {
    key: "geyser-installation",
    label: "Geyser installation",
    description: "Replace and install electric geysers with compliant fittings."
  },
  {
    key: "burst-geysers",
    label: "Burst geysers",
    description: "Rapid response for burst geysers, leaks, and water damage risk."
  },
  {
    key: "valve-replacement",
    label: "Valve replacement",
    description: "Replace pressure, safety, vacuum breaker, and shut-off valves."
  },
  {
    key: "fault-finding",
    label: "Fault finding",
    description: "Diagnose tripping circuits, faulty plugs, lights, and intermittent electrical issues."
  },
  {
    key: "db-board-upgrades",
    label: "DB board upgrades",
    description: "Upgrade distribution boards, breakers, surge protection, and labeling."
  },
  {
    key: "lighting-installation",
    label: "Lighting installation",
    description: "Install indoor, outdoor, security, and energy-saving lighting."
  },
  {
    key: "electrical-compliance",
    label: "Electrical compliance",
    description: "Compliance checks, certificates, and remedial electrical work."
  },
  {
    key: "lockouts",
    label: "Emergency lockouts",
    description: "Help customers regain access to homes, offices, and shops."
  },
  {
    key: "lock-replacement",
    label: "Lock replacement",
    description: "Replace damaged, worn, or insecure door and gate locks."
  },
  {
    key: "rekeying",
    label: "Rekeying",
    description: "Change lock keys without replacing the full lock hardware."
  },
  {
    key: "security-locks",
    label: "Security locks",
    description: "Install higher-security locks, cylinders, and access hardware."
  },
  {
    key: "cockroach-treatment",
    label: "Cockroach treatment",
    description: "Targeted treatment for kitchens, cupboards, and recurring infestations."
  },
  {
    key: "rodent-control",
    label: "Rodent control",
    description: "Inspection, baiting, sealing advice, and follow-up rodent treatment."
  },
  {
    key: "termite-treatment",
    label: "Termite treatment",
    description: "Termite inspections and treatment plans for affected properties."
  },
  {
    key: "ant-control",
    label: "Ant control",
    description: "Treat ants at entry points, nests, and high-activity areas."
  },
  {
    key: "roof-leak-repairs",
    label: "Roof leak repairs",
    description: "Find and repair leaks around flashing, tiles, sheets, and joins."
  },
  {
    key: "roof-waterproofing",
    label: "Roof waterproofing",
    description: "Waterproof flat roofs, parapets, joints, and problem areas."
  },
  {
    key: "roof-inspection",
    label: "Roof inspection",
    description: "Assess roofs before rain, sale, maintenance, or insurance work."
  },
  {
    key: "gutter-repairs",
    label: "Gutter repairs",
    description: "Clean, repair, seal, and align gutters and downpipes."
  },
  {
    key: "solar-installation",
    label: "Solar installation",
    description: "Install solar panels, inverters, and backup power systems."
  },
  {
    key: "inverter-backup",
    label: "Inverter backup",
    description: "Backup power systems for lights, Wi-Fi, security, and essentials."
  },
  {
    key: "battery-storage",
    label: "Battery storage",
    description: "Battery upgrades, sizing advice, and backup runtime planning."
  },
  {
    key: "solar-maintenance",
    label: "Solar maintenance",
    description: "Inspect, clean, monitor, and maintain solar and inverter systems."
  },
  {
    key: "haircuts",
    label: "Haircuts",
    description: "Classic and modern cuts with easy appointment booking."
  },
  {
    key: "fades",
    label: "Fades",
    description: "Skin fades, taper fades, and detailed finishing."
  },
  {
    key: "beard-trims",
    label: "Beard trims",
    description: "Beard shaping, trimming, and grooming services."
  },
  {
    key: "kids-cuts",
    label: "Kids cuts",
    description: "Friendly haircut appointments for younger customers."
  },
  {
    key: "portrait-photography",
    label: "Portrait photography",
    description: "Personal, family, team, and professional portrait sessions."
  },
  {
    key: "event-photography",
    label: "Event photography",
    description: "Capture parties, launches, corporate events, and celebrations."
  },
  {
    key: "wedding-photography",
    label: "Wedding photography",
    description: "Wedding coverage, couple portraits, and edited galleries."
  },
  {
    key: "product-photography",
    label: "Product photography",
    description: "Clean product images for websites, ecommerce, and social campaigns."
  }
] as const;

export const HVAC_SERVICES = SERVICE_CATALOG;

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
