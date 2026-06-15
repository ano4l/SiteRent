import { getGeminiMissingConfig, hasGeminiConfig } from "@/lib/gemini";

export type IntegrationStatus = "ready" | "attention" | "blocked";

export type EnvRequirement = {
  label: string;
  keys: string[];
  mode?: "all" | "any";
};

export type IntegrationReadinessItem = {
  id: string;
  group: string;
  title: string;
  description: string;
  status: IntegrationStatus;
  statusLabel: string;
  launchCritical: boolean;
  requirements: EnvRequirement[];
  missing: string[];
  evidence: string[];
  nextStep: string;
};

export type IntegrationReadinessSummary = {
  total: number;
  ready: number;
  attention: number;
  blocked: number;
  launchCriticalTotal: number;
  launchCriticalBlocked: number;
  launchReady: boolean;
  nextItems: IntegrationReadinessItem[];
};

function hasValue(key: string) {
  const value = process.env[key];
  return typeof value === "string" && value.trim().length > 0;
}

function isRequirementMet(requirement: EnvRequirement) {
  const mode = requirement.mode ?? "all";
  const present = requirement.keys.filter(hasValue);
  return mode === "any" ? present.length > 0 : present.length === requirement.keys.length;
}

function missingForRequirement(requirement: EnvRequirement) {
  if (isRequirementMet(requirement)) return [];
  return requirement.mode === "any" ? [requirement.label] : requirement.keys.filter((key) => !hasValue(key));
}

function buildItem({
  id,
  group,
  title,
  description,
  launchCritical = false,
  requirements,
  evidence,
  nextStep,
  readyLabel = "Ready",
  attentionLabel = "Needs verification",
  blockedLabel = "Missing configuration",
  statusOverride,
  missingOverride
}: {
  id: string;
  group: string;
  title: string;
  description: string;
  launchCritical?: boolean;
  requirements: EnvRequirement[];
  evidence: string[];
  nextStep: string;
  readyLabel?: string;
  attentionLabel?: string;
  blockedLabel?: string;
  statusOverride?: IntegrationStatus;
  missingOverride?: string[];
}): IntegrationReadinessItem {
  const missing = missingOverride ?? requirements.flatMap(missingForRequirement);
  const status = statusOverride ?? (missing.length ? (launchCritical ? "blocked" : "attention") : "ready");
  const statusLabel = status === "ready" ? readyLabel : status === "blocked" ? blockedLabel : attentionLabel;

  return {
    id,
    group,
    title,
    description,
    status,
    statusLabel,
    launchCritical,
    requirements,
    missing,
    evidence,
    nextStep
  };
}

export function getIntegrationReadiness(): IntegrationReadinessItem[] {
  const peachConfigured = hasValue("PEACH_ENTITY_ID") && hasValue("PEACH_SECRET_TOKEN");
  const peachSandbox = process.env.PEACH_SANDBOX !== "false";
  const emailConfigured = hasValue("RESEND_API_KEY") || hasValue("SENDGRID_API_KEY");
  const ga4Configured = hasValue("GA4_PROPERTY_ID") && hasValue("GA4_CLIENT_EMAIL") && hasValue("GA4_PRIVATE_KEY");
  const geminiConfigured = hasGeminiConfig();

  return [
    buildItem({
      id: "platform-runtime",
      group: "Core",
      title: "Platform URLs and routing",
      description: "Public origins and the client subdomain base used by auth redirects, canonical URLs, DNS instructions, and published-site links.",
      launchCritical: true,
      requirements: [
        { label: "Public app origin", keys: ["NEXT_PUBLIC_SITE_URL"] },
        { label: "Client subdomain base", keys: ["NEXT_PUBLIC_PLATFORM_DOMAIN"] }
      ],
      evidence: ["Root metadata uses the public URL.", "Domain helpers generate platform and client-site URLs."],
      nextStep: "Set the deployed HTTPS origin and the production platform domain before inviting real customers.",
      readyLabel: "Routes ready"
    }),
    buildItem({
      id: "supabase-core",
      group: "Core",
      title: "Supabase Auth, database, and storage",
      description: "The product data plane for sessions, clients, onboarding progress, uploads, billing events, enquiries, and admin authorization.",
      launchCritical: true,
      requirements: [
        { label: "Supabase URL", keys: ["NEXT_PUBLIC_SUPABASE_URL"] },
        { label: "Supabase browser key", keys: ["NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "NEXT_PUBLIC_SUPABASE_ANON_KEY"], mode: "any" },
        { label: "Supabase service role", keys: ["SUPABASE_SERVICE_ROLE_KEY"] }
      ],
      evidence: ["Protected pages and APIs fail closed through middleware.", "Admin and dashboard loaders read authenticated Supabase records."],
      nextStep: "Create the Supabase project, apply both migrations, then add the first admin user row.",
      readyLabel: "Data plane ready"
    }),
    buildItem({
      id: "gemini-ai",
      group: "AI",
      title: "Gemini website planning",
      description: "AI website planning for the builder, admin studio, and dashboard assistant, including file and image context.",
      launchCritical: true,
      requirements: [
        { label: "Vertex AI project", keys: ["GOOGLE_CLOUD_PROJECT", "GCP_PROJECT_ID", "GEMINI_VERTEX_PROJECT"], mode: "any" },
        { label: "Local ADC or Vercel WIF credentials", keys: ["GOOGLE_APPLICATION_CREDENTIALS", "GOOGLE_APPLICATION_CREDENTIALS_JSON", "GOOGLE_APPLICATION_CREDENTIALS_BASE64", "GCP_PROJECT_NUMBER", "GCP_SERVICE_ACCOUNT_EMAIL", "GCP_WORKLOAD_IDENTITY_POOL_ID", "GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID"], mode: "any" }
      ],
      evidence: ["The AI route uses live Gemini through Vertex AI only.", "Vercel production can authenticate keylessly through OIDC Workload Identity Federation.", "Attachment validation limits size and accepted MIME types."],
      nextStep: "Connect local ADC or Vercel OIDC Workload Identity Federation, keep the model pinned, and run one create-site and one restyle request in staging.",
      readyLabel: "AI configured",
      statusOverride: geminiConfigured ? "ready" : undefined,
      missingOverride: geminiConfigured ? [] : getGeminiMissingConfig()
    }),
    buildItem({
      id: "peach-billing",
      group: "Revenue",
      title: "Peach checkout and webhooks",
      description: "Hosted checkout signing, shopper result handling, webhook signature verification, idempotent billing events, and subscription-state updates.",
      launchCritical: true,
      requirements: [
        { label: "Peach entity ID", keys: ["PEACH_ENTITY_ID"] },
        { label: "Peach secret token", keys: ["PEACH_SECRET_TOKEN"] }
      ],
      evidence: ["Checkout fields are signed server-side.", "Webhook duplicate deliveries are deduped by provider payment ID."],
      nextStep: peachConfigured && peachSandbox
        ? "Run a sandbox checkout and webhook replay; only set PEACH_SANDBOX=false after Peach live credentials are approved."
        : "Add Peach sandbox credentials and replay at least one success, pending, failed, and duplicate webhook.",
      readyLabel: peachSandbox ? "Sandbox configured" : "Live configured",
      attentionLabel: "Sandbox needs testing",
      statusOverride: peachConfigured && peachSandbox ? "attention" : undefined
    }),
    buildItem({
      id: "vercel-domains",
      group: "Publishing",
      title: "Vercel domain automation",
      description: "Custom-domain registration support for published client sites after a site is ready to go live.",
      requirements: [
        { label: "Vercel API token", keys: ["VERCEL_API_TOKEN"] },
        { label: "Vercel project ID", keys: ["VERCEL_PROJECT_ID"] }
      ],
      evidence: ["Publish flow can return DNS instructions when domain automation is unavailable.", "Domain registration helper skips safely when credentials are missing."],
      nextStep: "Add Vercel credentials, configure wildcard domains, then test one custom-domain registration in staging.",
      readyLabel: "Domain API ready"
    }),
    buildItem({
      id: "transactional-email",
      group: "Lifecycle",
      title: "Transactional email provider",
      description: "Delivery path for publish confirmations, billing notices, failed-payment recovery, and support handoffs.",
      requirements: [
        { label: "Resend or SendGrid API key", keys: ["RESEND_API_KEY", "SENDGRID_API_KEY"], mode: "any" }
      ],
      evidence: ["Publish confirmation events are queued from production publish actions.", "Email provider selection is environment-driven."],
      nextStep: emailConfigured
        ? "Send one real provider test email, store provider message IDs, and connect failed-payment notifications."
        : "Choose Resend or SendGrid, verify the sending domain, and wire delivery for queued email events.",
      readyLabel: "Provider key present",
      attentionLabel: "Provider missing"
    }),
    buildItem({
      id: "analytics-reporting",
      group: "Insights",
      title: "GA4 reporting credentials",
      description: "Server-side reporting credentials for future traffic charts, source breakdowns, and conversion reporting in the client dashboard.",
      requirements: [
        { label: "GA4 property ID", keys: ["GA4_PROPERTY_ID"] },
        { label: "GA4 service account email", keys: ["GA4_CLIENT_EMAIL"] },
        { label: "GA4 private key", keys: ["GA4_PRIVATE_KEY"] }
      ],
      evidence: ["Published sites inject client-level GA4 measurement IDs.", "Dashboard traffic surfaces stay honest until reporting data is connected."],
      nextStep: ga4Configured
        ? "Enable the Analytics Data API and test a read-only report for one published client site."
        : "Create the GA4 property and service account when you are ready to replace awaiting-data traffic panels.",
      readyLabel: "Reporting API ready",
      attentionLabel: "Reporting pending"
    }),
    buildItem({
      id: "runtime-hardening",
      group: "Trust",
      title: "Runtime hardening and access gates",
      description: "Security headers, CSP, auth middleware, admin authorization, upload ownership checks, and public route exceptions.",
      requirements: [],
      evidence: ["CSP and security headers are configured in next.config.mjs.", "Protected pages and production APIs are gated in src/middleware.ts."],
      nextStep: "Keep running typecheck, lint, build, and the route smoke script before every provider rollout.",
      readyLabel: "Code gate ready"
    })
  ];
}

export function getIntegrationReadinessSummary(items = getIntegrationReadiness()): IntegrationReadinessSummary {
  const ready = items.filter((item) => item.status === "ready").length;
  const attention = items.filter((item) => item.status === "attention").length;
  const blocked = items.filter((item) => item.status === "blocked").length;
  const launchCritical = items.filter((item) => item.launchCritical);
  const launchCriticalBlocked = launchCritical.filter((item) => item.status === "blocked").length;
  const nextItems = items
    .filter((item) => item.status !== "ready")
    .sort((a, b) => {
      if (a.status !== b.status) return a.status === "blocked" ? -1 : 1;
      return Number(b.launchCritical) - Number(a.launchCritical);
    });

  return {
    total: items.length,
    ready,
    attention,
    blocked,
    launchCriticalTotal: launchCritical.length,
    launchCriticalBlocked,
    launchReady: launchCriticalBlocked === 0,
    nextItems
  };
}
