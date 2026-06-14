import Image from "next/image";
import type { CSSProperties } from "react";
import {
  ArrowRight,
  Award,
  BadgeCheck,
  Clock,
  ExternalLink,
  Flame,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Snowflake,
  Star,
  Wrench,
  Zap
} from "lucide-react";
import { ContactForm } from "@/components/published/contact-form";
import { BRAND_COLOURS, HVAC_SERVICES } from "@/lib/constants";
import type { ClientSite, TemplateStyle } from "@/lib/types";
import { cn, formatCurrencyZar } from "@/lib/utils";

type HvacService = (typeof HVAC_SERVICES)[number];

type TemplateContext = {
  site: ClientSite;
  colour: string;
  foundedYears: number;
  whatsappHref: string;
  mapQuery: string;
  heroImage?: string;
  ownerImage?: string;
  gallery: string[];
};

export function HvacSite({ site }: { site: ClientSite }) {
  const colour = BRAND_COLOURS[site.brandColour]?.hex ?? BRAND_COLOURS.navy.hex;
  const context: TemplateContext = {
    site,
    colour,
    foundedYears: Math.max(new Date().getFullYear() - site.yearFounded, 1),
    whatsappHref: `https://wa.me/${site.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(
      `Hi ${site.businessName}, I need help with a service.`
    )}`,
    mapQuery: encodeURIComponent(site.address ?? `${site.businessName}, ${site.primaryCity}, South Africa`),
    heroImage: site.heroPhotoUrl ?? site.galleryPhotos[0],
    ownerImage: site.ownerPhotoUrl ?? site.galleryPhotos[1],
    gallery: site.galleryPhotos
  };

  const style = site.templateStyle ?? styleFromBrand(site.brandColour);

  if (style === "aireco-dark") return <DarkPremiumTemplate {...context} />;
  if (style === "razor-minimal") return <EditorialOrangeTemplate {...context} />;
  if (style === "coolair-blue") return <BlueCorporateTemplate {...context} />;
  if (style === "eircool-editorial") return <SoftOrangeTemplate {...context} />;
  return <DarkPremiumTemplate {...context} />;
}

function styleFromBrand(brandColour: ClientSite["brandColour"]): TemplateStyle {
  const styles: Record<ClientSite["brandColour"], TemplateStyle> = {
    amber: "aireco-dark",
    purple: "aireco-dark",
    red: "razor-minimal",
    navy: "coolair-blue",
    green: "eircool-editorial",
    teal: "eircool-editorial"
  };
  return styles[brandColour] ?? "aireco-dark";
}

function SoftOrangeTemplate(ctx: TemplateContext) {
  const { site, heroImage, ownerImage, gallery, foundedYears, whatsappHref } = ctx;

  return (
    <main className="min-h-screen bg-[#f6f5ed] text-[#111111]">
      <div className="bg-[radial-gradient(circle_at_12%_8%,#e8f7bd_0%,transparent_32%),linear-gradient(180deg,#fbfbf5_0%,#ffffff_56%,#edf3dd_100%)]">
        <TopBar ctx={ctx} tone="soft" />
        <section id="top" className="mx-auto grid max-w-7xl gap-8 px-5 py-12 lg:grid-cols-[0.9fr_1.1fr] lg:py-20">
          <div className="flex flex-col justify-center">
            <Kicker label="Top-tier local service" className="text-[#687143]" />
            <h1 className="mt-4 max-w-2xl text-5xl font-black leading-[0.95] tracking-normal md:text-7xl">
              Reliable service done right.
            </h1>
            <p className="mt-5 max-w-xl text-base font-semibold leading-7 text-[#4b4b4b]">{site.tagline}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <PrimaryLink href="#contact" label="Make an appointment" className="bg-[#687143] text-white" />
              <SecondaryLink href="#services" label="Services" className="border-[#687143] text-[#687143]" />
            </div>
            <div className="mt-8 grid max-w-lg grid-cols-3 gap-4">
              <Stat value={`${foundedYears}+`} label="Years active" />
              <Stat value={site.services.length ? `${site.services.length}+` : "Pending"} label="Plan types" />
              <Stat value={jobsCompletedValue(site)} label="Completed jobs" />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-[1fr_0.75fr]">
            <Photo src={heroImage} alt={`${site.businessName} service`} className="min-h-[520px] rounded-[0_80px_0_80px]" priority />
            <div className="grid gap-4">
              <Photo src={ownerImage} alt={site.ownerName} className="min-h-[245px] rounded-[22px]" />
              <RatingCard site={site} />
              <div className="rounded-[22px] bg-[#687143] p-5 text-white">
                <p className="text-4xl font-black">{jobsCompletedValue(site)}</p>
                <p className="mt-1 text-sm font-bold text-white/80">Completed jobs</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-4 px-5 py-14 lg:grid-cols-[0.85fr_1fr]">
          <div className="grid gap-4 sm:grid-cols-2">
            <FeatureCard icon={ShieldCheck} title="Customer centric approach" copy="Clear estimates, neat work, and follow-up care." accent="bg-[#687143] text-white" />
            <FeatureCard icon={Clock} title="24/7 emergency service" copy={site.hasEmergency ? "Urgent help when breakdowns cannot wait." : "Reliable scheduling for routine work."} />
            <FeatureCard icon={BadgeCheck} title="Experienced specialists" copy={site.certifications[0] ?? "Experienced local service specialists."} />
            <Photo src={gallery[0]} alt="Service project" className="min-h-[220px] rounded-[18px]" />
          </div>
          <section className="rounded-[24px] bg-white p-8">
            <Kicker label="About us" className="text-[#687143]" />
            <h2 className="mt-4 text-4xl font-black leading-tight">Creating reliable service experiences, one job at a time</h2>
            <p className="mt-5 leading-8 text-[#555555]">{site.aboutText}</p>
            <PrimaryLink href={whatsappHref} label="Chat on WhatsApp" className="mt-6 bg-[#687143] text-white" />
          </section>
        </section>

        <div className="mx-auto max-w-7xl px-5 pb-6">
          <ServicesMosaic ctx={ctx} accent="#687143" />
          <FaqAndContact ctx={ctx} accent="#687143" />
        </div>
      </div>
      <FloatingWhatsApp href={whatsappHref} colour="#687143" />
    </main>
  );
}

function DarkPremiumTemplate(ctx: TemplateContext) {
  const { site, heroImage, ownerImage, gallery, foundedYears, whatsappHref, mapQuery } = ctx;
  const serviceLabels: HvacService[] = site.services
    .map((key) => HVAC_SERVICES.find((item) => item.key === key))
    .filter((service): service is HvacService => Boolean(service))
    .slice(0, 5);
  return (
    <main className="min-h-screen overflow-hidden bg-[#e63a12] text-[#151316]">
      <section id="top" className="relative mx-auto w-full max-w-[1520px] bg-[#fbfaf6] shadow-[0_40px_120px_rgba(20,14,11,0.22)]">
        <div className="absolute right-0 top-0 hidden h-[52vh] w-[31vw] bg-[#efedf2] lg:block" />
        <nav className="relative z-20 mx-auto flex max-w-[1280px] items-center justify-between gap-5 border-b border-[#ebe7e1] px-5 py-5 text-xs font-black uppercase tracking-[0.02em] md:px-8">
          <a href="#top" className="flex items-center gap-3">
            {site.logoUrl ? <Image src={site.logoUrl} alt="" width={38} height={38} className="h-10 w-10 rounded-md object-contain" /> : <span className="grid size-10 place-items-center rounded-sm bg-[#ff3d00] text-white"><Snowflake size={21} /></span>}
            <span className="text-sm tracking-normal">{site.businessName}</span>
          </a>
          <div className="hidden items-center gap-8 lg:flex">
            <a href="#services">Services</a>
            <a href="#proof">Reviews</a>
            <a href="#areas">Areas</a>
            <a href="#contact">Contact</a>
          </div>
          <div className="flex items-center gap-2">
            <a href={`tel:${site.phone}`} className="hidden rounded-sm bg-[#363441] px-4 py-3 text-white sm:inline-flex">{site.phone}</a>
            <a href="#contact" className="rounded-sm bg-[#ff3d00] px-4 py-3 text-white">Book now</a>
          </div>
        </nav>

        <div className="relative z-10 mx-auto grid max-w-[1280px] gap-10 px-5 pb-14 pt-8 md:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:pb-18">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.12em] text-[#2d55c5]">Service specialists in {site.primaryCity}</p>
            <h1 className="mt-5 max-w-4xl text-[clamp(2.8rem,5.9vw,5.9rem)] font-black uppercase leading-[0.9] tracking-normal">
              Trusted <span className="font-serif italic font-normal">service</span>
              <br />
              partner -
              <span className="font-serif italic font-normal"> over {foundedYears} years.</span>
            </h1>
            <p className="mt-5 max-w-2xl text-base font-semibold leading-7 text-[#585461]">{site.tagline} {site.aboutText}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href={`tel:${site.phone}`} className="inline-flex items-center gap-2 rounded-sm bg-[#ff3d00] px-5 py-3 text-sm font-black text-white">
                <Phone size={16} /> {site.phone}
              </a>
              <a href="#proof" className="inline-flex items-center gap-2 rounded-sm border border-[#c8c5ce] bg-white px-5 py-3 text-sm font-black">
                <Star size={16} className="fill-[#ff3d00] text-[#ff3d00]" /> {site.testimonials.length ? `${site.testimonials.length} testimonials` : "Review proof pending"}
              </a>
            </div>
            <div className="mt-8 grid gap-5 lg:grid-cols-[1fr_0.56fr]">
              <div className="grid grid-cols-3 gap-3">
                <Photo src={heroImage} alt={`${site.businessName} service work`} className="col-span-3 min-h-[330px] rounded-none md:col-span-2" priority />
                <div className="grid gap-3">
                  <HeroServiceTile icon={Flame} label={serviceLabelsFor(site, 2)[0] ?? "Service"} />
                  <HeroServiceTile icon={Snowflake} label={serviceLabelsFor(site, 2)[1] ?? "Support"} />
                </div>
              </div>
              <div className="grid gap-3 self-stretch">
                <BusinessMetric value={jobsCompletedValue(site)} label="completed jobs" />
                <BusinessMetric value={site.responseTime} label="average response" />
                <BusinessMetric value={site.hasGuarantee ? site.guaranteePeriod ?? "12 months" : "Quality"} label="workmanship guarantee" />
              </div>
            </div>
          </div>

          <aside className="grid content-start gap-6 lg:pt-2">
            <section className="grid gap-4 pt-2 text-center md:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              <ProofItem icon={ShieldCheck} title="Local service team" copy="Personal service from a team that cares about the finish." />
              <ProofItem icon={Award} title="Clear estimates" copy="Transparent options before any installation or repair begins." />
              <ProofItem icon={BadgeCheck} title="Service expertise" copy={site.certifications[0] ?? "Experienced specialists with clean workmanship."} />
            </section>
            <section className="border border-[#ded9d1] bg-white p-6 shadow-[0_24px_70px_rgba(27,22,31,0.10)]">
              <h2 className="text-center text-2xl font-black uppercase leading-none">
                Get expert help <span className="font-serif italic font-normal">today</span>
              </h2>
              <ContactForm clientId={site.id} brandColour="#ff3d00" />
            </section>
          </aside>
        </div>
      </section>

      <section id="services" className="mx-auto grid max-w-[1520px] gap-0 bg-[#34323d] text-white lg:grid-cols-[0.92fr_1.08fr]">
        <div className="px-6 py-14 md:px-12 lg:px-16">
          <p className="text-xs font-black uppercase text-[#ff6a35]">Your all-in-one</p>
          <h2 className="mt-3 max-w-lg text-4xl font-black uppercase leading-[0.95] md:text-5xl">
            Service solution for every customer.
          </h2>
          <p className="mt-6 max-w-md text-sm font-semibold leading-7 text-white/68">
            Discover one place for core services, proof, clear pricing cues, and fast contact routes.
          </p>
          <a href="#contact" className="mt-7 inline-flex rounded-sm bg-[#ff3d00] px-5 py-3 text-sm font-black text-white">Book an appointment now</a>
        </div>
        <div className="grid grid-cols-2 gap-px bg-white/18 p-px md:grid-cols-5 lg:self-end">
          {serviceLabels.map((service) => (
            <a key={service.key} href="#contact" className="grid min-h-36 place-items-center bg-[#34323d] p-5 text-center transition hover:bg-[#ff3d00]">
              <span>
                <Wrench className="mx-auto mb-4" />
                <span className="block text-xs font-black uppercase">{service.label}</span>
                {site.servicePrices[service.key] && <span className="mt-2 block text-xs text-white/64">From {formatCurrencyZar(Number(site.servicePrices[service.key]))}</span>}
              </span>
            </a>
          ))}
        </div>
      </section>

      <section id="proof" className="mx-auto grid max-w-[1520px] bg-[#fbfaf6] lg:grid-cols-[1fr_1fr]">
        <div className="px-6 py-16 md:px-12 lg:px-20">
          <h2 className="mx-auto max-w-xl text-center text-3xl font-black uppercase leading-[0.98] md:text-4xl">
            Showcase customer proof from real projects
          </h2>
          <div className="mt-5 flex justify-center gap-3">
            <span className="rounded-sm border border-[#d8d4cf] bg-white px-4 py-2 text-xs font-black">{site.testimonials.length ? `${site.testimonials.length} testimonials` : "Testimonials pending"}</span>
            <span className="rounded-sm border border-[#d8d4cf] bg-white px-4 py-2 text-xs font-black">{site.galleryPhotos.length ? `${site.galleryPhotos.length} project photos` : "Project photos pending"}</span>
          </div>
          <TestimonialsCompact site={site} />
        </div>
        <div className="border-t border-[#ebe7e1] px-6 py-16 md:px-12 lg:border-l lg:border-t-0 lg:px-20">
          <h2 className="max-w-md text-3xl font-black uppercase leading-[0.98] md:text-4xl">
            Services available for {site.primaryCity}&apos;s <span className="font-serif italic font-normal">customers</span>
          </h2>
          <div className="mt-10 grid grid-cols-2 gap-4 text-center text-sm font-black text-[#625d67] md:grid-cols-3">
            {serviceLabelsFor(site, 9).map((service) => (
              <span key={service} className="border border-[#ece8e3] bg-white px-3 py-4">{service}</span>
            ))}
          </div>
        </div>
      </section>

      <section id="areas" className="mx-auto grid max-w-[1520px] bg-[#fbfaf6] lg:grid-cols-[1fr_1fr]">
        <iframe title={`${site.businessName} service map`} src={`https://www.google.com/maps?q=${mapQuery}&output=embed`} className="min-h-[460px] w-full border-0 grayscale" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
        <div className="px-6 py-16 md:px-12 lg:px-20">
          <p className="text-xs font-black uppercase text-[#ff3d00]">Neighbourhood service</p>
          <h2 className="mt-3 max-w-lg text-4xl font-black uppercase leading-[0.96] md:text-5xl">
            {site.primaryCity}&apos;s areas we proudly serve
          </h2>
          <div className="mt-9 divide-y divide-[#ded9d1]">
            {site.suburbs.slice(0, 6).map((suburb) => (
              <a key={suburb} href="#contact" className="flex items-center justify-between py-4 text-sm font-black">
                {suburb}
                <ArrowRight size={16} />
              </a>
            ))}
          </div>
          <p className="mt-8 max-w-md text-xs font-semibold uppercase leading-6 text-[#8a8580]">
            {site.address ?? site.primaryCity} / response time {site.responseTime} / insured team / {site.hasGuarantee ? site.guaranteePeriod : "quality"} guarantee
          </p>
        </div>
      </section>

      <section id="contact" className="relative mx-auto grid max-w-[1520px] overflow-hidden bg-[#fbfaf6] lg:grid-cols-[0.92fr_1.08fr]">
        <div className="px-6 py-16 md:px-12 lg:px-20">
          <p className="text-xs font-black uppercase text-[#ff3d00]">Get help this week</p>
          <h2 className="mt-3 max-w-2xl text-4xl font-black uppercase leading-[0.95] md:text-6xl">
            Book your estimate with {site.businessName}
          </h2>
          <p className="mt-6 max-w-md text-sm font-semibold leading-7 text-[#5f5a55]">
            Tell us what you need and we&apos;ll come back with a clear next step, pricing cues, and the fastest available slot.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a href={`tel:${site.phone}`} className="inline-flex items-center gap-2 rounded-sm bg-[#ff3d00] px-5 py-3 text-sm font-black text-white"><Phone size={16} /> Call now</a>
            <a href={whatsappHref} className="inline-flex rounded-sm border border-[#151316] px-5 py-3 text-sm font-black">WhatsApp</a>
          </div>
          <Photo src={ownerImage} alt={`${site.businessName} service van`} className="mt-10 min-h-[360px] rounded-none" />
        </div>
        <div className="bg-[#34323d] px-6 py-16 text-white md:px-12 lg:px-20">
          <div className="mx-auto max-w-lg bg-[#fbfaf6] p-7 text-[#151316] shadow-[0_30px_80px_rgba(0,0,0,0.18)]">
            <h3 className="text-3xl font-black uppercase leading-none">Get a free quote</h3>
            <ContactForm clientId={site.id} brandColour="#ff3d00" />
          </div>
        </div>
      </section>

      <SiteFooter ctx={ctx} dark />
      <FloatingWhatsApp href={whatsappHref} colour="#ff6422" />
    </main>
  );
}

function ArmyBoldTemplate(ctx: TemplateContext) {
  const { site, heroImage, ownerImage, gallery, whatsappHref } = ctx;

  return (
    <main className="bg-white text-[#090909]">
      <section id="top" className="relative overflow-hidden bg-[linear-gradient(180deg,#caeff8_0%,#ffffff_52%)]">
        <div className="absolute inset-x-0 bottom-0 h-40 bg-[#234d20]" />
        <TopBar ctx={ctx} tone="army" />
        <div className="relative mx-auto grid max-w-7xl gap-8 px-5 pb-12 pt-16 lg:grid-cols-[1fr_420px]">
          <div>
            <Kicker label={`Bring reliable service to ${site.primaryCity}`} className="text-[#002f75]" />
            <h1 className="mt-4 max-w-3xl font-black uppercase leading-[0.88] tracking-normal text-[#070707] text-5xl md:text-7xl">
              Quality local services in {site.primaryCity}
            </h1>
            <p className="mt-5 max-w-xl text-sm font-bold leading-7">{site.tagline}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <PrimaryLink href="#contact" label="Get a quote" className="bg-[#b00020] text-white" />
              <SecondaryLink href="#services" label="View services" className="border-[#072f78] text-[#072f78]" />
            </div>
          </div>
          <div className="rounded-[14px] bg-[#8ae2e6] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.18)]">
            <h2 className="text-center text-2xl font-black uppercase">Schedule your service today</h2>
            <ContactForm clientId={site.id} brandColour="#052f79" />
          </div>
          <div className="relative col-span-full min-h-[360px]">
            <Photo src={heroImage} alt={`${site.businessName} home service`} className="absolute inset-x-0 bottom-0 min-h-[380px] rounded-none" priority />
            <div className="absolute bottom-5 left-5 rounded-md bg-white p-4 shadow-xl">
              <p className="text-2xl font-black">{site.businessName}</p>
              <p className="text-sm font-bold text-[#b00020]">{site.phone}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-5 py-12 md:grid-cols-3">
        <FeatureCard icon={BadgeCheck} title="Supporting local pros" copy="Neighbourhood service with a real local team." />
        <FeatureCard icon={ShieldCheck} title="Quality work guaranteed" copy={site.hasGuarantee ? `${site.guaranteePeriod ?? "Workmanship"} guarantee.` : "Clean installs and tested repairs."} />
        <FeatureCard icon={Award} title="Affordable pricing" copy="Transparent pricing before the work begins." />
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-12 lg:grid-cols-[0.8fr_1fr]">
        <Photo src={ownerImage} alt={site.ownerName} className="min-h-[380px] rounded-[8px]" />
        <div className="self-center">
          <Kicker label={`About ${site.businessName}`} className="text-[#b00020]" />
          <h2 className="mt-3 max-w-xl font-black uppercase leading-[0.95] text-5xl">Trusted by {compact(site.jobsCompleted)}+ home owners</h2>
          <p className="mt-6 leading-8 text-[#363636]">{site.aboutText}</p>
          <PrimaryLink href="#contact" label="Book now" className="mt-6 bg-[#052f79] text-white" />
        </div>
      </section>

      <section className="bg-[#b00020] py-16 text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 lg:grid-cols-[1fr_0.9fr]">
          <div>
            <Kicker label={`About ${site.businessName}`} className="text-white/70" />
            <h2 className="mt-3 max-w-2xl font-black uppercase leading-[0.95] text-5xl">
              Providing reliable local services
            </h2>
            <ul className="mt-7 grid gap-3 text-sm font-bold">
              <li>{site.testimonials.length ? "Customer testimonials supplied" : "Testimonials ready to add"}</li>
              <li>{site.jobsCompleted ? `${compact(site.jobsCompleted)}+ completed jobs` : "Completed job count pending"}</li>
              <li>{site.hasGuarantee ? "Guaranteed work" : "Workmanship details pending"}</li>
            </ul>
          </div>
          <Photo src={gallery[1]} alt="Service project" className="min-h-[320px] rounded-[18px]" />
        </div>
      </section>

      <ArmyServices ctx={ctx} />
      <SiteFooter ctx={ctx} dark />
      <FloatingWhatsApp href={whatsappHref} colour="#b00020" />
    </main>
  );
}

function BlueCorporateTemplate(ctx: TemplateContext) {
  const { site, heroImage, ownerImage, foundedYears, whatsappHref } = ctx;

  return (
    <main className="bg-white text-[#101820]">
      <div className="bg-[#0a3d74] text-white">
        <TopBar ctx={ctx} tone="blue" />
        <section className="relative mx-auto grid min-h-[640px] max-w-7xl gap-8 px-5 py-16 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="relative z-10 self-center">
              <Kicker label="Local service, every time" className="text-white/80" />
              <h1 className="mt-4 max-w-2xl text-5xl font-black leading-[1.02] md:text-7xl">
                Your trusted service experts, ready to help
              </h1>
              <p className="mt-5 max-w-xl text-base font-semibold leading-8 text-white/82">{site.tagline}</p>
              <div className="mt-7 flex flex-wrap gap-3">
                <PrimaryLink href="#contact" label="Schedule your service" className="bg-[#ff5b18] text-white" />
                <SecondaryLink href="#services" label="Learn more" className="border-white text-white" />
              </div>
              <div className="mt-9 grid max-w-xl grid-cols-4 gap-5 text-sm font-bold text-white/75">
                {serviceLabelsFor(site, 4).map((service) => <span key={service}>{service}</span>)}
              </div>
            </div>
            <Photo src={heroImage} alt="Service project" className="absolute inset-0 min-h-full rounded-none opacity-45" priority />
            <div className="relative z-10 self-end justify-self-end rounded-md bg-white p-4 text-[#101820] shadow-2xl">
              <div className="flex items-center gap-3">
                <Star className="fill-[#ff5b18] text-[#ff5b18]" size={20} />
                <p className="font-black">Trust proof</p>
              </div>
              <p className="mt-1 text-sm font-semibold text-[#5c6670]">{site.testimonials.length ? `${site.testimonials.length} testimonials supplied` : "Testimonials pending"}</p>
            </div>
          </section>
      </div>

      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-16 lg:grid-cols-[0.85fr_1fr]">
        <div className="relative">
          <Photo src={ownerImage} alt={site.ownerName} className="min-h-[420px] rounded-[12px]" />
          <div className="absolute left-5 top-5 rounded-md bg-white p-5 shadow-xl">
            <p className="text-4xl font-black">{foundedYears}+</p>
            <p className="text-sm font-semibold">Years of experience</p>
          </div>
        </div>
        <div className="self-center">
          <Kicker label="About us" className="text-[#ff5b18]" />
          <h2 className="mt-3 text-5xl font-black leading-tight">The experts you can trust for local service needs</h2>
          <p className="mt-5 leading-8 text-[#4d5965]">{site.aboutText}</p>
          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            <Badge label="Your trusted service partner" />
            <Badge label="Reliable local help" />
          </div>
          <PrimaryLink href={`tel:${site.phone}`} label={`Call us: ${site.phone}`} className="mt-7 bg-[#ff5b18] text-white" />
        </div>
      </section>

      <section className="bg-[#0877cc] py-16 text-white">
        <div className="mx-auto max-w-7xl px-5 text-center">
          <Kicker label="How it works" className="text-white/70" />
          <h2 className="mt-3 text-4xl font-black">A simple and hassle-free process</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-4">
            <StepCard number="01" title="Schedule a consultation" blue />
            <StepCard number="02" title="Get a customized plan" active />
            <StepCard number="03" title="Customer satisfaction" blue />
            <StepCard number="04" title="Professional installation" blue />
          </div>
        </div>
      </section>

      <AwardsCoupons ctx={ctx} accent="#ff5b18" />
      <FaqAndContact ctx={ctx} accent="#0877cc" />
      <SiteFooter ctx={ctx} />
      <FloatingWhatsApp href={whatsappHref} colour="#0877cc" />
    </main>
  );
}

function EditorialOrangeTemplate(ctx: TemplateContext) {
  const { site, gallery, whatsappHref } = ctx;

  return (
    <main className="bg-[#cfc3bd] py-10 text-[#230005] md:py-16">
      <div className="mx-auto w-[min(92vw,1440px)] bg-[#fffaf7] shadow-[0_34px_90px_rgba(35,0,5,0.12)]">
        <TopBar ctx={ctx} tone="editorial" />
        <section className="grid gap-8 px-8 py-14 lg:grid-cols-[1.15fr_0.85fr] lg:px-24">
          <div>
            <p className="text-xs font-bold text-[#800018]">/ Services we offer</p>
            <h1 className="mt-5 max-w-3xl text-6xl font-medium leading-[0.92] tracking-normal md:text-8xl">
              Certified Excellence
            </h1>
          </div>
          <div className="self-center">
            <p className="max-w-md text-sm font-semibold leading-7 text-[#4d4a50]">{site.tagline}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <PrimaryLink href={`tel:${site.phone}`} label="Call for booking" className="bg-[#ffd51a] text-[#230005]" />
              <SecondaryLink href="#services" label="View all services" className="border-[#800018] text-[#800018]" />
            </div>
          </div>
          <div className="col-span-full grid gap-5 sm:grid-cols-5">
            {gallery.map((photo, index) => (
              <Photo key={photo} src={photo} alt={`Service work ${index + 1}`} className="min-h-[260px] rounded-[10px]" priority={index === 0} />
            ))}
            <Photo src={ctx.heroImage} alt="Service project" className="min-h-[260px] rounded-[10px] sm:col-span-2" />
          </div>
        </section>

        <section className="bg-[#230005] px-8 py-16 text-white lg:px-24">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1fr]">
            <div>
              <h2 className="text-4xl font-black uppercase leading-tight">Your all-in-one service solution</h2>
              <PrimaryLink href="#contact" label="Book a service" className="mt-6 bg-[#ffd51a] text-[#230005]" />
            </div>
            <p className="leading-8 text-white/72">{site.aboutText}</p>
          </div>
          <div className="mt-10 grid gap-3 sm:grid-cols-5">
            {serviceLabelsFor(site, 5).map((item) => (
              <div key={item} className="grid min-h-28 place-items-center border border-white/35 p-4 text-center text-xs font-black uppercase">
                <Snowflake className="mb-3" />
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-10 px-8 py-16 lg:grid-cols-[1fr_0.9fr] lg:px-16">
          <div>
            <h2 className="text-center text-4xl font-black uppercase leading-tight">
              Showcase customer proof from real projects
            </h2>
            <TestimonialsCompact site={site} />
          </div>
          <div>
            <h2 className="text-4xl font-black uppercase leading-tight">
              Services available for {site.primaryCity}&apos;s customers
            </h2>
            <div className="mt-8 grid grid-cols-3 gap-4 text-center text-sm font-black text-[#6a6570]">
              {serviceLabelsFor(site, 6).map((service) => (
                <span key={service} className="border border-[#ece8e3] py-4">{service}</span>
              ))}
            </div>
          </div>
        </section>

        <FaqAndContact ctx={ctx} accent="#800018" />
        <SiteFooter ctx={ctx} dark />
      </div>
      <FloatingWhatsApp href={whatsappHref} colour="#800018" />
    </main>
  );
}

function TopBar({ ctx, tone }: { ctx: TemplateContext; tone: "soft" | "dark" | "army" | "blue" | "editorial" }) {
  const { site } = ctx;
  const dark = tone === "dark";
  const army = tone === "army";
  const blue = tone === "blue";
  const editorial = tone === "editorial";
  const bg = dark ? "bg-[#171514] text-white" : blue ? "bg-white/95 text-[#101820]" : army ? "bg-white text-[#050505]" : editorial ? "bg-[#fffaf7] text-[#230005]" : "bg-white/85 text-[#111111]";
  const accent = dark ? "bg-[#ff6422]" : blue ? "bg-[#4f83dc]" : army ? "bg-[#b00020]" : editorial ? "bg-[#ffd51a] text-[#230005]" : "bg-[#687143]";

  return (
    <nav className={cn("relative z-20 mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 text-sm font-bold", bg)}>
      <a href="#top" className="flex items-center gap-3">
        {site.logoUrl ? <Image src={site.logoUrl} alt="" width={34} height={34} className="h-9 w-9 rounded-md object-contain" /> : <Snowflake size={28} className={dark ? "text-[#ff6422]" : "text-current"} />}
        <span className={cn("text-xl", army && "uppercase", editorial && "font-serif text-2xl")}>{site.businessName}</span>
      </a>
      <div className="hidden items-center gap-7 lg:flex">
        <a href="#services">Services</a>
        <a href="#areas">Areas</a>
        <a href="#contact">Contact</a>
      </div>
      <a href={`tel:${site.phone}`} className={cn("inline-flex items-center gap-2 rounded-md px-4 py-2 text-white", accent)}>
        <Phone size={16} /> {editorial ? "Book now" : "Call us"}
      </a>
    </nav>
  );
}

function ServicesMosaic({ ctx, accent }: { ctx: TemplateContext; accent: string }) {
  const { site, gallery } = ctx;
  return (
    <section id="services" className="mt-4 rounded-[24px] bg-white p-6 md:p-8">
      <div className="grid gap-8 lg:grid-cols-[0.65fr_1.35fr]">
        <div>
          <Kicker label="Our projects" style={{ color: accent }} />
          <h2 className="mt-3 text-4xl font-black leading-tight">From request to completion, our service projects</h2>
          <PrimaryLink href="#contact" label="Schedule your service" className="mt-6 text-white" style={{ backgroundColor: accent }} />
        </div>
        <div className="grid auto-rows-[180px] grid-cols-2 gap-3 md:grid-cols-4">
          {gallery.concat(gallery).slice(0, 5).map((photo, index) => (
            <Photo key={`${photo}-${index}`} src={photo} alt={`Service project ${index + 1}`} className={cn("rounded-[14px]", index === 1 && "md:row-span-2", index === 4 && "md:col-span-2")} />
          ))}
        </div>
      </div>
      <ServiceCards site={site} accent={accent} />
    </section>
  );
}

function ArmyServices({ ctx }: { ctx: TemplateContext }) {
  const { site, gallery } = ctx;
  return (
    <section id="services" className="bg-[linear-gradient(180deg,#f5f5f5_0%,#ffffff_55%,#d9f4ff_100%)] py-16">
      <div className="mx-auto max-w-7xl px-5 text-center">
        <Snowflake className="mx-auto text-[#052f79]" size={42} />
        <h2 className="mt-4 font-black uppercase leading-tight text-5xl">Our local services</h2>
        <p className="mx-auto mt-4 max-w-3xl text-sm font-semibold leading-7 text-[#4d4d4d]">{site.tagline}</p>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {site.services.slice(0, 3).map((key, index) => {
            const service = HVAC_SERVICES.find((item) => item.key === key);
            return (
              <article key={key} className="group relative min-h-[280px] overflow-hidden rounded-[6px] text-left text-white">
                <Photo src={gallery[index]} alt={service?.label ?? key} className="absolute inset-0 min-h-full rounded-none" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                <div className="absolute inset-x-5 bottom-5 flex items-end justify-between gap-4">
                  <div>
                    <h3 className="text-2xl font-black uppercase">{service?.label ?? key}</h3>
                    <p className="mt-1 text-sm text-white/75">View service</p>
                  </div>
                  <span className="grid size-10 place-items-center rounded-full bg-[#b00020]"><ArrowRight size={18} /></span>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function FaqAndContact({ ctx, accent }: { ctx: TemplateContext; accent: string }) {
  const { site, mapQuery } = ctx;
  return (
    <section id="contact" className="mt-4 grid gap-4 rounded-[24px] bg-white p-6 md:p-8 lg:grid-cols-[1fr_0.9fr]">
      <div>
        <Kicker label="Frequently asked questions" style={{ color: accent }} />
        <h2 className="mt-3 text-4xl font-black leading-tight">Got questions? We have answers.</h2>
        <div className="mt-6 grid gap-3">
          {[
            "How quickly can you help?",
            "How do I know which service I need?",
            "Do you offer emergency support?",
            "What happens after I request a quote?"
          ].map((question, index) => (
            <details key={question} className={cn("rounded-[14px] bg-[#f6f6f6] p-4", index === 1 && "text-white")} style={index === 1 ? { backgroundColor: accent } : undefined}>
              <summary className="cursor-pointer text-sm font-black">{question}</summary>
              <p className="mt-3 text-sm leading-6 opacity-80">We inspect the issue, explain the options, and give a clear quote before work starts.</p>
            </details>
          ))}
        </div>
      </div>
      <div className="grid gap-4">
        <ContactForm clientId={site.id} brandColour={accent} />
        <div className="rounded-lg border border-line bg-white p-5">
          <h3 className="text-2xl font-black">Contact details</h3>
          <div className="mt-5 grid gap-3 text-sm font-semibold text-muted">
            <p className="flex gap-3"><Phone /> {site.phone}</p>
            <p className="flex gap-3"><Mail /> {site.email}</p>
            <p className="flex gap-3"><MapPin /> {site.address ?? site.primaryCity}</p>
          </div>
          <iframe title={`${site.businessName} map`} src={`https://www.google.com/maps?q=${mapQuery}&output=embed`} className="mt-6 aspect-video w-full rounded-md border border-line" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
        </div>
      </div>
    </section>
  );
}

function AwardsCoupons({ ctx, accent }: { ctx: TemplateContext; accent: string }) {
  return (
    <section className="bg-white py-16">
      <div className="mx-auto max-w-7xl px-5 text-center">
        <Kicker label="Service proof" style={{ color: accent }} />
        <h2 className="mt-3 text-4xl font-black">Trust and service details</h2>
        <div className="mx-auto mt-10 grid max-w-4xl gap-6 md:grid-cols-3">
          {["Client proof", "Service specialists", "Certified local team"].map((label, index) => (
            <article key={label} className={cn("rounded-full border border-[#ddd6ce] p-8", index === 1 && "text-white")} style={index === 1 ? { backgroundColor: accent } : undefined}>
              <Award className="mx-auto" />
              <p className="mt-4 text-sm font-black">{label}</p>
              <p className="mt-2 text-xs opacity-70">Details supplied during onboarding.</p>
            </article>
          ))}
        </div>
        <div className="mt-16">
          <Kicker label="Offers" style={{ color: accent }} />
          <h2 className="mt-3 text-3xl font-black">Service options</h2>
          <div className="mx-auto mt-8 grid max-w-4xl gap-4 md:grid-cols-3">
            {["Repair requests", "Emergency support", "New installations"].map((title) => (
              <article key={title} className="rounded-lg bg-[#fff3ec] p-6">
                <Snowflake className="mx-auto" style={{ color: accent }} />
                <h3 className="mt-4 text-xl font-black">{title}</h3>
                <p className="mt-4 inline-flex rounded-md bg-white px-5 py-3 text-sm font-black" style={{ color: accent }}>Quote on request</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ServiceCards({ site, accent }: { site: ClientSite; accent: string }) {
  return (
    <div className="mt-8 grid gap-4 md:grid-cols-3">
      {site.services.slice(0, 6).map((serviceKey) => {
        const service = HVAC_SERVICES.find((item) => item.key === serviceKey);
        if (!service) return null;
        return (
          <article key={service.key} className="rounded-[18px] border border-line bg-white p-5 shadow-[0_14px_34px_rgba(0,0,0,0.06)]">
            <Wrench style={{ color: accent }} size={24} />
            <h3 className="mt-4 text-xl font-black">{service.label}</h3>
            <p className="mt-2 leading-7 text-muted">{service.description}</p>
            {site.servicePrices[service.key] && <p className="mt-4 font-black">From {formatCurrencyZar(Number(site.servicePrices[service.key]))}</p>}
          </article>
        );
      })}
    </div>
  );
}

function TestimonialsCompact({ site }: { site: ClientSite }) {
  if (!site.testimonials.length) {
    return (
      <div className="mt-8 rounded-lg border border-[#ece8e3] bg-white p-5 text-center text-sm font-bold text-[#625d67]">
        Testimonials can be added from onboarding or the dashboard once real customer proof is available.
      </div>
    );
  }

  return (
    <div className="mt-8 grid gap-5 md:grid-cols-2">
      {site.testimonials.slice(0, 2).map((testimonial) => (
        <article key={`${testimonial.name}-${testimonial.suburb}`} className="text-left">
          <div className="flex gap-1 text-[#ff3b08]">{Array.from({ length: 5 }).map((_, index) => <Star key={index} size={14} className="fill-current" />)}</div>
          <p className="mt-4 text-lg leading-7">&ldquo;{testimonial.quote}&rdquo;</p>
          <p className="mt-4 text-sm font-serif italic">- {testimonial.name}</p>
        </article>
      ))}
    </div>
  );
}

function SiteFooter({ ctx, dark = false }: { ctx: TemplateContext; dark?: boolean }) {
  const { site } = ctx;
  return (
    <footer className={cn("px-5 py-10", dark ? "bg-[#191919] text-white" : "bg-[#f5f5f5] text-[#111111]")}>
      <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-[1fr_1fr_1fr]">
        <div>
          <p className="text-2xl font-black">{site.businessName}</p>
          <p className="mt-3 max-w-sm text-sm leading-7 opacity-70">{site.tagline}</p>
        </div>
        <div className="grid gap-2 text-sm font-semibold opacity-80">
          <a href="#services">Services</a>
          <a href="#areas">Areas</a>
          <a href="./privacy">Privacy policy</a>
        </div>
        <div className="grid gap-2 text-sm font-semibold opacity-80">
          <span>{site.phone}</span>
          <span>{site.email}</span>
          <span>{site.address ?? site.primaryCity}</span>
          {(site.facebookUrl || site.instagramUrl) && (
            <span className="mt-2 flex gap-3">
              {site.facebookUrl && <SocialLink href={site.facebookUrl} label="Facebook" />}
              {site.instagramUrl && <SocialLink href={site.instagramUrl} label="Instagram" />}
            </span>
          )}
        </div>
      </div>
    </footer>
  );
}

function Photo({ src, alt, className, priority = false }: { src?: string; alt: string; className?: string; priority?: boolean }) {
  return (
    <div className={cn("relative overflow-hidden bg-[#dddddd]", className)}>
      {src ? (
        <Image src={src} alt={alt} fill sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover transition duration-700 hover:scale-[1.03]" priority={priority} />
      ) : (
        <div className="absolute inset-0 grid place-items-center bg-[linear-gradient(135deg,#f8fafc,#e5e7eb)] p-6 text-center text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
          Production image pending
        </div>
      )}
    </div>
  );
}

function PrimaryLink({ href, label, className, style }: { href: string; label: string; className?: string; style?: CSSProperties }) {
  return (
    <a href={href} style={style} className={cn("inline-flex w-fit items-center gap-2 rounded-md px-5 py-3 text-sm font-black shadow-[0_12px_24px_rgba(0,0,0,0.12)]", className)}>
      {label} <ArrowRight size={16} />
    </a>
  );
}

function SecondaryLink({ href, label, className }: { href: string; label: string; className?: string }) {
  return <a href={href} className={cn("inline-flex w-fit items-center gap-2 rounded-md border px-5 py-3 text-sm font-black", className)}>{label}</a>;
}

function Kicker({ label, className, style }: { label: string; className?: string; style?: CSSProperties }) {
  return <p style={style} className={cn("text-xs font-black uppercase tracking-normal", className)}>{label}</p>;
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="text-4xl font-black">{value}</p>
      <p className="mt-1 text-xs font-semibold opacity-70">{label}</p>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, copy, accent }: { icon: typeof ShieldCheck; title: string; copy: string; accent?: string }) {
  return (
    <article className={cn("rounded-[16px] bg-white p-5 shadow-[0_12px_26px_rgba(0,0,0,0.06)]", accent)}>
      <Icon size={25} />
      <h3 className="mt-4 text-lg font-black">{title}</h3>
      <p className="mt-2 text-sm font-semibold leading-6 opacity-72">{copy}</p>
    </article>
  );
}

function Progress({ label, value }: { label: string; value: string }) {
  return (
    <div className="mt-6">
      <div className="mb-2 flex justify-between text-sm font-black">
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <div className="h-2 rounded-full bg-[#eadfd7]">
        <div className="h-2 rounded-full bg-[#ff6422]" style={{ width: value }} />
      </div>
    </div>
  );
}

function StepCard({ number, title, active = false, dark = false, blue = false }: { number: string; title: string; active?: boolean; dark?: boolean; blue?: boolean }) {
  return (
    <article className={cn("rounded-md p-5 text-left", active ? "bg-[#ff6422] text-white" : dark ? "bg-white/8 text-white" : blue ? "bg-white/10 text-white" : "bg-white")}>
      <div className="grid size-12 place-items-center rounded-full bg-white/15 text-lg font-black">{number}</div>
      <h3 className="mt-4 text-lg font-black">{title}</h3>
      <p className="mt-2 text-sm leading-6 opacity-72">We keep every step simple, clear, and professionally managed.</p>
    </article>
  );
}

function ProofItem({ icon: Icon, title, copy }: { icon: typeof ShieldCheck; title: string; copy: string }) {
  return (
    <article className="text-center">
      <div className="mx-auto grid size-11 place-items-center rounded-full bg-white text-[#2d55c5] shadow-[0_14px_34px_rgba(27,22,31,0.08)]">
        <Icon size={21} />
      </div>
      <h3 className="mt-4 text-sm font-black">{title}</h3>
      <p className="mx-auto mt-2 max-w-[14rem] text-xs font-semibold leading-5 text-[#67626d]">{copy}</p>
    </article>
  );
}

function BusinessMetric({ value, label }: { value: string; label: string }) {
  return (
    <div className="border border-[#ded9d1] bg-white px-4 py-5">
      <p className="text-2xl font-black uppercase leading-none">{value}</p>
      <p className="mt-2 text-xs font-black uppercase tracking-[0.12em] text-[#77716b]">{label}</p>
    </div>
  );
}

function HeroServiceTile({ icon: Icon, label }: { icon: typeof Snowflake; label: string }) {
  return (
    <div className="grid min-h-[155px] place-items-center bg-[#34323d] p-5 text-center text-white">
      <span>
        <Icon className="mx-auto mb-4 text-[#ff6a35]" size={34} />
        <span className="block text-xs font-black uppercase tracking-[0.14em]">{label}</span>
        <span className="mt-2 block text-[11px] font-semibold uppercase text-white/55">Repair / install / maintain</span>
      </span>
    </div>
  );
}

function RatingCard({ site }: { site: ClientSite }) {
  return (
    <div className="rounded-[18px] bg-white p-5 shadow-[0_14px_34px_rgba(0,0,0,0.08)]">
      <p className="text-sm font-black">Trust proof</p>
      <div className="mt-2 flex gap-1 text-[#ff5b18]">{Array.from({ length: 5 }).map((_, index) => <Star key={index} size={16} />)}</div>
      <p className="mt-3 text-3xl font-black">{site.testimonials.length || "Pending"}</p>
      <p className="text-xs font-semibold text-muted">{site.testimonials.length ? "testimonials supplied" : "Add real testimonials when ready"}</p>
    </div>
  );
}

function Badge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-[#f5f7fb] px-4 py-2 text-sm font-black">
      <BadgeCheck size={16} className="text-[#ff5b18]" />
      {label}
    </span>
  );
}

function SocialLink({ href, label }: { href: string; label: string }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1">
      {label}
      <ExternalLink size={13} />
    </a>
  );
}

function FloatingWhatsApp({ href, colour }: { href: string; colour: string }) {
  return (
    <a href={href} className="fixed bottom-5 right-5 z-30 rounded-full px-5 py-3 text-sm font-black text-white shadow-[0_18px_42px_rgba(0,0,0,0.24)]" style={{ backgroundColor: colour }}>
      WhatsApp
    </a>
  );
}

function compact(value: number) {
  if (value >= 1000) return `${Math.round(value / 100) / 10}K`;
  return String(value);
}

function jobsCompletedValue(site: ClientSite) {
  return site.jobsCompleted > 0 ? `${compact(site.jobsCompleted)}+` : "Pending";
}

function serviceLabelsFor(site: ClientSite, limit: number) {
  const labels = site.services
    .map((key) => HVAC_SERVICES.find((item) => item.key === key)?.label ?? key)
    .filter(Boolean)
    .slice(0, limit);

  return labels.length ? labels : ["Services pending"];
}
