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
    description: "New split-unit and commercial air-conditioning installations.",
    startingPrice: 4500
  },
  {
    key: "aircon-repairs",
    label: "Aircon repairs",
    description: "Fault finding, repairs, regassing, and urgent breakdown support.",
    startingPrice: 650
  },
  {
    key: "maintenance",
    label: "Maintenance plans",
    description: "Scheduled cleaning, filter checks, and preventive maintenance.",
    startingPrice: 450
  },
  {
    key: "ducting",
    label: "Ducting and ventilation",
    description: "Ventilation, extractor, and ducting work for homes and businesses.",
    startingPrice: 1800
  },
  {
    key: "plumbing",
    label: "Plumbing support",
    description: "General plumbing support where offered by the contractor.",
    startingPrice: 550
  },
  {
    key: "leak-repairs",
    label: "Leak repairs",
    description: "Trace leaks, repair pipework, and stop recurring water damage.",
    startingPrice: 550
  },
  {
    key: "blocked-drains",
    label: "Blocked drains",
    description: "Clear blocked sinks, toilets, showers, and stormwater lines.",
    startingPrice: 650
  },
  {
    key: "bathroom-plumbing",
    label: "Bathroom plumbing",
    description: "Install and repair toilets, taps, basins, showers, and mixers.",
    startingPrice: 850
  },
  {
    key: "emergency-plumbing",
    label: "Emergency plumbing",
    description: "Urgent plumbing call-outs for leaks, bursts, and breakdowns.",
    startingPrice: 750
  },
  {
    key: "geyser-repairs",
    label: "Geyser repairs",
    description: "Fix faulty elements, thermostats, leaks, pressure valves, and poor hot water.",
    startingPrice: 750
  },
  {
    key: "geyser-installation",
    label: "Geyser installation",
    description: "Replace and install electric geysers with compliant fittings.",
    startingPrice: 2800
  },
  {
    key: "burst-geysers",
    label: "Burst geysers",
    description: "Rapid response for burst geysers, leaks, and water damage risk.",
    startingPrice: 950
  },
  {
    key: "valve-replacement",
    label: "Valve replacement",
    description: "Replace pressure, safety, vacuum breaker, and shut-off valves.",
    startingPrice: 550
  },
  {
    key: "fault-finding",
    label: "Fault finding",
    description: "Diagnose tripping circuits, faulty plugs, lights, and intermittent electrical issues.",
    startingPrice: 550
  },
  {
    key: "db-board-upgrades",
    label: "DB board upgrades",
    description: "Upgrade distribution boards, breakers, surge protection, and labeling.",
    startingPrice: 1800
  },
  {
    key: "lighting-installation",
    label: "Lighting installation",
    description: "Install indoor, outdoor, security, and energy-saving lighting.",
    startingPrice: 450
  },
  {
    key: "electrical-compliance",
    label: "Electrical compliance",
    description: "Compliance checks, certificates, and remedial electrical work.",
    startingPrice: 1200
  },
  {
    key: "lockouts",
    label: "Emergency lockouts",
    description: "Help customers regain access to homes, offices, and shops.",
    startingPrice: 450
  },
  {
    key: "lock-replacement",
    label: "Lock replacement",
    description: "Replace damaged, worn, or insecure door and gate locks.",
    startingPrice: 550
  },
  {
    key: "rekeying",
    label: "Rekeying",
    description: "Change lock keys without replacing the full lock hardware.",
    startingPrice: 350
  },
  {
    key: "security-locks",
    label: "Security locks",
    description: "Install higher-security locks, cylinders, and access hardware.",
    startingPrice: 850
  },
  {
    key: "cockroach-treatment",
    label: "Cockroach treatment",
    description: "Targeted treatment for kitchens, cupboards, and recurring infestations.",
    startingPrice: 450
  },
  {
    key: "rodent-control",
    label: "Rodent control",
    description: "Inspection, baiting, sealing advice, and follow-up rodent treatment.",
    startingPrice: 550
  },
  {
    key: "termite-treatment",
    label: "Termite treatment",
    description: "Termite inspections and treatment plans for affected properties.",
    startingPrice: 1500
  },
  {
    key: "ant-control",
    label: "Ant control",
    description: "Treat ants at entry points, nests, and high-activity areas.",
    startingPrice: 400
  },
  {
    key: "roof-leak-repairs",
    label: "Roof leak repairs",
    description: "Find and repair leaks around flashing, tiles, sheets, and joins.",
    startingPrice: 850
  },
  {
    key: "roof-waterproofing",
    label: "Roof waterproofing",
    description: "Waterproof flat roofs, parapets, joints, and problem areas.",
    startingPrice: 2500
  },
  {
    key: "roof-inspection",
    label: "Roof inspection",
    description: "Assess roofs before rain, sale, maintenance, or insurance work.",
    startingPrice: 650
  },
  {
    key: "gutter-repairs",
    label: "Gutter repairs",
    description: "Clean, repair, seal, and align gutters and downpipes.",
    startingPrice: 750
  },
  {
    key: "solar-installation",
    label: "Solar installation",
    description: "Install solar panels, inverters, and backup power systems.",
    startingPrice: 35000
  },
  {
    key: "inverter-backup",
    label: "Inverter backup",
    description: "Backup power systems for lights, Wi-Fi, security, and essentials.",
    startingPrice: 18000
  },
  {
    key: "battery-storage",
    label: "Battery storage",
    description: "Battery upgrades, sizing advice, and backup runtime planning.",
    startingPrice: 22000
  },
  {
    key: "solar-maintenance",
    label: "Solar maintenance",
    description: "Inspect, clean, monitor, and maintain solar and inverter systems.",
    startingPrice: 950
  },
  {
    key: "haircuts",
    label: "Haircuts",
    description: "Classic and modern cuts with easy appointment booking.",
    startingPrice: 150
  },
  {
    key: "fades",
    label: "Fades",
    description: "Skin fades, taper fades, and detailed finishing.",
    startingPrice: 180
  },
  {
    key: "beard-trims",
    label: "Beard trims",
    description: "Beard shaping, trimming, and grooming services.",
    startingPrice: 90
  },
  {
    key: "kids-cuts",
    label: "Kids cuts",
    description: "Friendly haircut appointments for younger customers.",
    startingPrice: 120
  },
  {
    key: "portrait-photography",
    label: "Portrait photography",
    description: "Personal, family, team, and professional portrait sessions.",
    startingPrice: 1200
  },
  {
    key: "event-photography",
    label: "Event photography",
    description: "Capture parties, launches, corporate events, and celebrations.",
    startingPrice: 3500
  },
  {
    key: "wedding-photography",
    label: "Wedding photography",
    description: "Wedding coverage, couple portraits, and edited galleries.",
    startingPrice: 9500
  },
  {
    key: "product-photography",
    label: "Product photography",
    description: "Clean product images for websites, ecommerce, and social campaigns.",
    startingPrice: 1500
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

export type DemoBusiness = {
  tradingName: string;
  ownerName: string;
  yearFounded: string;
  jobsCompleted: string;
  primaryCity: string;
  address: string;
  suburbs: string;
  phone: string;
  whatsapp: string;
  email: string;
  responseTime: (typeof RESPONSE_TIMES)[number];
  hasEmergency: boolean;
  hasGuarantee: boolean;
  guaranteePeriod: string;
  visualDirection: string;
  testimonials: { name: string; suburb: string; quote: string }[];
};

// Realistic, fully editable sample businesses used to populate the demo
// onboarding flow per niche. These act as the starter template content while
// Gemini generation is not yet connected.
export const DEMO_BUSINESSES: Record<IndustryTemplateKey, DemoBusiness> = {
  plumbers: {
    tradingName: "FlowFix Plumbing",
    ownerName: "Daniel Mokoena",
    yearFounded: "2015",
    jobsCompleted: "1 200+",
    primaryCity: "Johannesburg",
    address: "48 Rivonia Road, Sandton",
    suburbs: "Sandton, Randburg, Fourways, Midrand, Bryanston",
    phone: "+27 11 555 0142",
    whatsapp: "+27 82 555 0142",
    email: "hello@flowfix.example",
    responseTime: "Within 1 hour",
    hasEmergency: true,
    hasGuarantee: true,
    guaranteePeriod: "12 months",
    visualDirection: "Clean, reassuring, mobile-first with a 24/7 emergency call CTA and clear up-front pricing.",
    testimonials: [
      { name: "Lerato D.", suburb: "Fourways", quote: "Found a hidden leak fast and stopped the damage the same morning." },
      { name: "Pieter V.", suburb: "Randburg", quote: "Fair quote, neat work, and they cleaned up after themselves." },
      { name: "Aisha M.", suburb: "Midrand", quote: "Sorted a blocked drain that two other plumbers gave up on." }
    ]
  },
  "geyser-repair": {
    tradingName: "HotWater Heroes",
    ownerName: "Sipho Dlamini",
    yearFounded: "2017",
    jobsCompleted: "900+",
    primaryCity: "Durban",
    address: "21 Florida Road, Morningside",
    suburbs: "Morningside, Umhlanga, Berea, Westville, Glenwood",
    phone: "+27 31 555 0188",
    whatsapp: "+27 83 555 0188",
    email: "service@hotwaterheroes.example",
    responseTime: "Within 1 hour",
    hasEmergency: true,
    hasGuarantee: true,
    guaranteePeriod: "24 months",
    visualDirection: "Trust-led blue layout with burst-geyser emergency CTA and insurance claim support messaging.",
    testimonials: [
      { name: "Nomsa K.", suburb: "Umhlanga", quote: "Burst geyser at 6am, they were there before 8 and handled the insurance paperwork." },
      { name: "Rajesh P.", suburb: "Westville", quote: "Replaced our geyser quickly with a clear warranty." },
      { name: "Megan S.", suburb: "Glenwood", quote: "Honest advice, no upselling, hot water restored same day." }
    ]
  },
  electrician: {
    tradingName: "BrightSpark Electricians",
    ownerName: "Sam Rivera",
    yearFounded: "2018",
    jobsCompleted: "640+",
    primaryCity: "Cape Town",
    address: "12 Bree Street, Cape Town",
    suburbs: "Sea Point, Claremont, Gardens, Durbanville, Bellville",
    phone: "+27 21 555 0198",
    whatsapp: "+27 82 555 0198",
    email: "hello@brightspark.example",
    responseTime: "Same day",
    hasEmergency: true,
    hasGuarantee: true,
    guaranteePeriod: "12 months",
    visualDirection: "Modern, trustworthy, mobile-first, with safety proof above the contact form and a direct call CTA.",
    testimonials: [
      { name: "Nadia K.", suburb: "Claremont", quote: "They arrived the same day and had our office power stable before lunch." },
      { name: "Thabo M.", suburb: "Sea Point", quote: "Clear pricing, neat work, and a friendly team." },
      { name: "Ruan P.", suburb: "Durbanville", quote: "The maintenance plan has saved us from two breakdowns already." }
    ]
  },
  locksmiths: {
    tradingName: "KeyGuard Locksmiths",
    ownerName: "Marco Pereira",
    yearFounded: "2016",
    jobsCompleted: "2 000+",
    primaryCity: "Pretoria",
    address: "9 Park Street, Hatfield",
    suburbs: "Hatfield, Brooklyn, Menlyn, Centurion, Lynnwood",
    phone: "+27 12 555 0170",
    whatsapp: "+27 84 555 0170",
    email: "help@keyguard.example",
    responseTime: "Within 30 minutes",
    hasEmergency: true,
    hasGuarantee: true,
    guaranteePeriod: "6 months",
    visualDirection: "Bold, security-focused dark layout with a prominent 24/7 lockout CTA and fast-response promise.",
    testimonials: [
      { name: "Chloe B.", suburb: "Brooklyn", quote: "Locked out at midnight and back inside within 25 minutes." },
      { name: "Tebogo L.", suburb: "Centurion", quote: "Re-keyed our whole office without replacing a single lock. Saved us a fortune." },
      { name: "Hannah W.", suburb: "Menlyn", quote: "Professional, vetted, and they explained every security option." }
    ]
  },
  "pest-control": {
    tradingName: "GreenShield Pest Control",
    ownerName: "Thandi Nkosi",
    yearFounded: "2014",
    jobsCompleted: "3 500+",
    primaryCity: "Johannesburg",
    address: "77 Jan Smuts Avenue, Rosebank",
    suburbs: "Rosebank, Parktown, Melville, Greenside, Linden",
    phone: "+27 11 555 0125",
    whatsapp: "+27 82 555 0125",
    email: "bookings@greenshield.example",
    responseTime: "Same day",
    hasEmergency: false,
    hasGuarantee: true,
    guaranteePeriod: "3 months",
    visualDirection: "Calm, clean editorial layout emphasising family- and pet-safe treatments with follow-up guarantee.",
    testimonials: [
      { name: "Vusi M.", suburb: "Melville", quote: "Cleared a stubborn cockroach problem and the follow-up was included." },
      { name: "Sarah J.", suburb: "Greenside", quote: "Safe for our pets and kids, and the rodents are finally gone." },
      { name: "Andre F.", suburb: "Linden", quote: "Thorough inspection, clear plan, no nasty surprises." }
    ]
  },
  roofing: {
    tradingName: "Apex Roofing & Waterproofing",
    ownerName: "Johan Botha",
    yearFounded: "2012",
    jobsCompleted: "850+",
    primaryCity: "Cape Town",
    address: "5 Voortrekker Road, Bellville",
    suburbs: "Bellville, Durbanville, Brackenfell, Kuils River, Parow",
    phone: "+27 21 555 0156",
    whatsapp: "+27 83 555 0156",
    email: "quotes@apexroofing.example",
    responseTime: "Same day",
    hasEmergency: true,
    hasGuarantee: true,
    guaranteePeriod: "5 years",
    visualDirection: "Strong, dependable layout with before/after proof, free inspection CTA, and a workmanship guarantee badge.",
    testimonials: [
      { name: "Elize K.", suburb: "Durbanville", quote: "Stopped a leak before the winter rains and waterproofed the whole roof." },
      { name: "Sizwe N.", suburb: "Brackenfell", quote: "Detailed inspection report and honest pricing on the repair." },
      { name: "Tom R.", suburb: "Parow", quote: "Five-year guarantee gave us real peace of mind." }
    ]
  },
  hvac: {
    tradingName: "CoolBreeze Air Conditioning",
    ownerName: "Riaan van Wyk",
    yearFounded: "2013",
    jobsCompleted: "1 600+",
    primaryCity: "Johannesburg",
    address: "33 Main Reef Road, Roodepoort",
    suburbs: "Roodepoort, Krugersdorp, Northcliff, Honeydew, Florida",
    phone: "+27 11 555 0133",
    whatsapp: "+27 82 555 0133",
    email: "service@coolbreeze.example",
    responseTime: "Same day",
    hasEmergency: false,
    hasGuarantee: true,
    guaranteePeriod: "12 months",
    visualDirection: "Polished corporate-blue layout with maintenance-plan upsell and SAQCC-registered trust signals.",
    testimonials: [
      { name: "Karabo M.", suburb: "Northcliff", quote: "Installed two split units cleanly and the rooms cool down in minutes." },
      { name: "Dineo P.", suburb: "Honeydew", quote: "Annual service plan keeps our office comfortable all summer." },
      { name: "Greg S.", suburb: "Florida", quote: "Quick repair, fair price, and they explained the fault clearly." }
    ]
  },
  solar: {
    tradingName: "SunPower Solar Solutions",
    ownerName: "Naledi Sithole",
    yearFounded: "2019",
    jobsCompleted: "420+",
    primaryCity: "Pretoria",
    address: "14 Lynnwood Road, Lynnwood",
    suburbs: "Lynnwood, Waterkloof, Faerie Glen, Garsfontein, Moreleta Park",
    phone: "+27 12 555 0111",
    whatsapp: "+27 84 555 0111",
    email: "info@sunpower.example",
    responseTime: "Next business day",
    hasEmergency: false,
    hasGuarantee: true,
    guaranteePeriod: "10 years",
    visualDirection: "Premium, savings-focused layout with backup-during-loadshedding messaging and a free site assessment CTA.",
    testimonials: [
      { name: "Willem D.", suburb: "Waterkloof", quote: "No more loadshedding stress, the backup kicks in seamlessly." },
      { name: "Lindiwe Z.", suburb: "Garsfontein", quote: "Clear savings breakdown and a tidy, professional installation." },
      { name: "Brian C.", suburb: "Moreleta Park", quote: "Sized our system perfectly, the batteries last right through outages." }
    ]
  },
  barbers: {
    tradingName: "Fade Lab Barbershop",
    ownerName: "Junaid Adams",
    yearFounded: "2020",
    jobsCompleted: "8 000+",
    primaryCity: "Cape Town",
    address: "88 Long Street, Cape Town",
    suburbs: "City Bowl, Woodstock, Observatory, Sea Point, Gardens",
    phone: "+27 21 555 0144",
    whatsapp: "+27 82 555 0144",
    email: "book@fadelab.example",
    responseTime: "Same day",
    hasEmergency: false,
    hasGuarantee: false,
    guaranteePeriod: "12 months",
    visualDirection: "Bold dark grooming aesthetic with easy online booking, gallery of cuts, and walk-in availability.",
    testimonials: [
      { name: "Kyle M.", suburb: "Woodstock", quote: "Best fade in the city, and booking online takes ten seconds." },
      { name: "Sive N.", suburb: "Observatory", quote: "Consistent cut every single time, great vibe in the shop." },
      { name: "Daniel P.", suburb: "Sea Point", quote: "Took my son for his first cut, super friendly and patient." }
    ]
  },
  photographers: {
    tradingName: "Lumen Studio Photography",
    ownerName: "Aria Naidoo",
    yearFounded: "2018",
    jobsCompleted: "500+",
    primaryCity: "Durban",
    address: "3 Lighthouse Road, Umhlanga",
    suburbs: "Umhlanga, Ballito, La Lucia, Durban North, Morningside",
    phone: "+27 31 555 0166",
    whatsapp: "+27 83 555 0166",
    email: "studio@lumen.example",
    responseTime: "Next business day",
    hasEmergency: false,
    hasGuarantee: false,
    guaranteePeriod: "12 months",
    visualDirection: "Elegant editorial gallery-led layout with portfolio grid, package pricing, and a simple booking enquiry.",
    testimonials: [
      { name: "Priya R.", suburb: "Ballito", quote: "Our wedding gallery was stunning and delivered earlier than promised." },
      { name: "Mark D.", suburb: "Durban North", quote: "Professional product shots that lifted our online store instantly." },
      { name: "Zanele M.", suburb: "La Lucia", quote: "Made our whole family relax, the portraits are gorgeous." }
    ]
  }
};
