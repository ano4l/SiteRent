import { execFile } from "node:child_process";
import { createSign } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { z } from "zod";

const VERTEX_AI_API_BASE = "https://aiplatform.googleapis.com/v1";
const GOOGLE_OAUTH_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_STS_TOKEN_URL = "https://sts.googleapis.com/v1/token";
const IAM_CREDENTIALS_API_BASE = "https://iamcredentials.googleapis.com/v1";
const GOOGLE_CLOUD_SCOPE = "https://www.googleapis.com/auth/cloud-platform";
const execFileAsync = promisify(execFile);
const templateStyleKeys = ["aireco-dark", "eircool-editorial", "razor-minimal", "coolair-blue"] as const;
const websitePlanPropertyOrdering = [
  "summary",
  "templateStyle",
  "brand",
  "hero",
  "sections",
  "serviceCopy",
  "imagePrompts",
  "uiChangePlan",
  "implementationNotes"
] as const;
const websitePlanResponseSchema = {
  type: "object",
  description: "A practical SiteRent website creation plan for a South African service business.",
  required: websitePlanPropertyOrdering,
  propertyOrdering: websitePlanPropertyOrdering,
  properties: {
    summary: { type: "string", description: "One concise paragraph describing the website direction." },
    templateStyle: { type: "string", enum: templateStyleKeys, description: "The selected SiteRent starter template style." },
    brand: {
      type: "object",
      required: ["tone", "primaryColour", "accentColour", "typographyDirection"],
      propertyOrdering: ["tone", "primaryColour", "accentColour", "typographyDirection"],
      properties: {
        tone: { type: "string" },
        primaryColour: { type: "string", description: "Hex colour or clear colour name." },
        accentColour: { type: "string", description: "Hex colour or clear colour name." },
        typographyDirection: { type: "string" }
      }
    },
    hero: {
      type: "object",
      required: ["headline", "subheadline", "primaryCta", "secondaryCta"],
      propertyOrdering: ["headline", "subheadline", "primaryCta", "secondaryCta"],
      properties: {
        headline: { type: "string" },
        subheadline: { type: "string" },
        primaryCta: { type: "string" },
        secondaryCta: { type: "string" }
      }
    },
    sections: {
      type: "array",
      minItems: 3,
      items: {
        type: "object",
        required: ["key", "title", "purpose", "contentNotes"],
        propertyOrdering: ["key", "title", "purpose", "contentNotes"],
        properties: {
          key: { type: "string" },
          title: { type: "string" },
          purpose: { type: "string" },
          contentNotes: { type: "string" }
        }
      }
    },
    serviceCopy: {
      type: "array",
      minItems: 3,
      items: {
        type: "object",
        required: ["serviceKey", "headline", "description"],
        propertyOrdering: ["serviceKey", "headline", "description"],
        properties: {
          serviceKey: { type: "string" },
          headline: { type: "string" },
          description: { type: "string" }
        }
      }
    },
    imagePrompts: {
      type: "array",
      minItems: 2,
      items: {
        type: "object",
        required: ["slot", "prompt"],
        propertyOrdering: ["slot", "prompt"],
        properties: {
          slot: { type: "string" },
          prompt: { type: "string" }
        }
      }
    },
    uiChangePlan: {
      type: "array",
      minItems: 3,
      items: {
        type: "object",
        required: ["area", "change", "rationale"],
        propertyOrdering: ["area", "change", "rationale"],
        properties: {
          area: { type: "string" },
          change: { type: "string" },
          rationale: { type: "string" }
        }
      }
    },
    implementationNotes: {
      type: "array",
      minItems: 2,
      items: { type: "string" }
    }
  }
} as const;

export const aiWebsitePlanSchema = z.object({
  summary: z.string(),
  templateStyle: z.enum(templateStyleKeys),
  brand: z.object({
    tone: z.string(),
    primaryColour: z.string(),
    accentColour: z.string(),
    typographyDirection: z.string()
  }),
  hero: z.object({
    headline: z.string(),
    subheadline: z.string(),
    primaryCta: z.string(),
    secondaryCta: z.string()
  }),
  sections: z.array(
    z.object({
      key: z.string(),
      title: z.string(),
      purpose: z.string(),
      contentNotes: z.string()
    })
  ),
  serviceCopy: z.array(
    z.object({
      serviceKey: z.string(),
      headline: z.string(),
      description: z.string()
    })
  ),
  imagePrompts: z.array(
    z.object({
      slot: z.string(),
      prompt: z.string()
    })
  ),
  uiChangePlan: z.array(
    z.object({
      area: z.string(),
      change: z.string(),
      rationale: z.string()
    })
  ),
  implementationNotes: z.array(z.string())
});

export type AiWebsitePlan = z.infer<typeof aiWebsitePlanSchema>;

export type AiWebsiteAttachment = {
  name: string;
  mimeType: string;
  data?: string;
  text?: string;
};

type GenerateWebsitePlanInput = {
  mode: "create" | "restyle" | "copy-refresh";
  businessContext: string;
  currentWebsiteContext?: string;
  preferredTemplateStyle?: AiWebsitePlan["templateStyle"];
  attachments?: AiWebsiteAttachment[];
};

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
  error?: {
    message?: string;
  };
};

type GeminiRuntimeConfig = {
  model: string;
  projectId: string;
  location: string;
};

type AdcCredentials = {
  type?: string;
  client_id?: string;
  client_secret?: string;
  refresh_token?: string;
  quota_project_id?: string;
  project_id?: string;
  private_key?: string;
  client_email?: string;
  token_uri?: string;
};

type VercelWifConfig = {
  projectId: string;
  projectNumber: string;
  serviceAccountEmail: string;
  poolId: string;
  providerId: string;
};

type OAuthTokenResponse = {
  access_token?: string;
  expires_in?: number;
  token_type?: string;
  error?: string;
  error_description?: string;
};

type IamAccessTokenResponse = {
  accessToken?: string;
  expireTime?: string;
  error?: {
    message?: string;
  };
};

type CachedToken = {
  token: string;
  expiresAt: number;
};

let cachedVertexToken: CachedToken | null = null;

export function hasGeminiConfig() {
  return Boolean(resolveGeminiConfigSync());
}

export function getGeminiMissingConfig() {
  return [
    "Vertex AI project plus local ADC, a Google credentials file, or Vercel GCP Workload Identity Federation variables"
  ];
}

export async function generateWebsitePlan(input: GenerateWebsitePlanInput): Promise<AiWebsitePlan> {
  const config = await resolveGeminiConfig();
  if (!config) {
    throw new Error("Gemini is not configured. Connect Vertex AI ADC with a Google Cloud project.");
  }

  const body = buildGenerateContentBody(input);
  const response = await callVertexAi(config, body);

  const result = (await response.json()) as GeminiResponse;
  if (!response.ok) {
    throw new Error(result.error?.message ?? "Gemini request failed");
  }

  const text = result.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("") ?? "";
  if (!text.trim()) {
    throw new Error("Gemini returned an empty website plan");
  }

  const parsed = aiWebsitePlanSchema.safeParse(parseJsonResponse(text));
  if (!parsed.success) {
    const issues = parsed.error.issues
      .slice(0, 4)
      .map((issue) => `${issue.path.join(".") || "root"}: ${issue.message}`)
      .join("; ");
    throw new Error(`Gemini returned an invalid website plan: ${issues}`);
  }

  return parsed.data;
}

function buildGenerateContentBody(input: GenerateWebsitePlanInput) {
  const parts: Array<Record<string, unknown>> = [
    {
      text: buildWebsitePrompt(input)
    }
  ];

  for (const attachment of input.attachments ?? []) {
    if (attachment.text) {
      parts.push({
        text: `Attachment: ${attachment.name} (${attachment.mimeType})\n${attachment.text}`
      });
      continue;
    }

    if (attachment.data) {
      parts.push({
        inline_data: {
          mime_type: attachment.mimeType,
          data: attachment.data
        }
      });
    }
  }

  const generationConfig = {
    temperature: 0.45,
    maxOutputTokens: 4096,
    responseMimeType: "application/json",
    responseSchema: websitePlanResponseSchema
  };

  return {
    contents: [
      {
        role: "user",
        parts
      }
    ],
    generation_config: generationConfig
  };
}

async function callVertexAi(config: GeminiRuntimeConfig, body: Record<string, unknown>) {
  const accessToken = await getVertexAccessToken();
  const encodedModel = encodeURIComponent(config.model);
  return fetch(
    `${VERTEX_AI_API_BASE}/projects/${encodeURIComponent(config.projectId)}/locations/${encodeURIComponent(config.location)}/publishers/google/models/${encodedModel}:generateContent`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    }
  );
}

function parseJsonResponse(text: string) {
  const trimmed = text.trim();
  const withoutFence = trimmed.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();

  try {
    return JSON.parse(withoutFence);
  } catch {
    const start = withoutFence.indexOf("{");
    const end = withoutFence.lastIndexOf("}");
    if (start >= 0 && end > start) {
      return JSON.parse(withoutFence.slice(start, end + 1));
    }
    throw new Error("Gemini returned invalid JSON");
  }
}

function resolveGeminiConfigSync(): GeminiRuntimeConfig | null {
  const adc = readAdcCredentials();
  const wif = getVercelWifConfig();
  const projectId = getVertexProjectIdSync(adc);
  if (projectId && (adc || wif)) {
    return {
      model: getGeminiModel(),
      projectId,
      location: getVertexLocation()
    };
  }

  return null;
}

async function resolveGeminiConfig(): Promise<GeminiRuntimeConfig | null> {
  const config = resolveGeminiConfigSync();
  if (config) return config;

  const projectId = await getGcloudProjectId();
  if (!projectId) return null;

  return {
    model: getGeminiModel(),
    projectId,
    location: getVertexLocation()
  };
}

function getGeminiModel() {
  const vertexModel = readEnv("GEMINI_VERTEX_MODEL");
  const sharedModel = readEnv("GEMINI_MODEL");
  if (vertexModel) return vertexModel;
  return sharedModel && sharedModel !== "gemini-2.0-flash" ? sharedModel : "gemini-3.5-flash";
}

function getVertexLocation() {
  return readEnv("GOOGLE_CLOUD_LOCATION") ?? readEnv("GEMINI_VERTEX_LOCATION") ?? "global";
}

function getVertexProjectIdSync(adc?: AdcCredentials | null) {
  return readEnv("GEMINI_VERTEX_PROJECT")
    ?? readEnv("GOOGLE_CLOUD_PROJECT")
    ?? readEnv("GCP_PROJECT_ID")
    ?? readEnv("GCLOUD_PROJECT")
    ?? adc?.quota_project_id?.trim()
    ?? adc?.project_id?.trim()
    ?? null;
}

async function getVertexAccessToken() {
  const now = Date.now();
  if (cachedVertexToken && cachedVertexToken.expiresAt - now > 60_000) {
    return cachedVertexToken.token;
  }

  const adc = readAdcCredentials();
  if (adc?.type === "authorized_user") {
    return refreshAuthorizedUserToken(adc);
  }

  if (adc?.type === "service_account") {
    return refreshServiceAccountToken(adc);
  }

  const vercelWif = getVercelWifConfig();
  if (vercelWif) {
    return refreshVercelWifToken(vercelWif);
  }

  return getGcloudAccessToken();
}

async function refreshAuthorizedUserToken(adc: AdcCredentials) {
  if (!adc.client_id || !adc.client_secret || !adc.refresh_token) {
    throw new Error("Vertex AI ADC user credentials are incomplete. Re-run gcloud auth application-default login.");
  }

  const response = await fetch(adc.token_uri ?? GOOGLE_OAUTH_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      client_id: adc.client_id,
      client_secret: adc.client_secret,
      refresh_token: adc.refresh_token,
      grant_type: "refresh_token"
    })
  });
  const result = (await response.json()) as OAuthTokenResponse;

  if (!response.ok || !result.access_token) {
    throw new Error(result.error_description ?? result.error ?? "Unable to refresh Vertex AI ADC access token.");
  }

  cacheVertexToken(result);
  return result.access_token;
}

async function refreshServiceAccountToken(adc: AdcCredentials) {
  if (!adc.client_email || !adc.private_key) {
    throw new Error("Vertex AI service account credentials are incomplete.");
  }

  const tokenUrl = adc.token_uri ?? GOOGLE_OAUTH_TOKEN_URL;
  const nowSeconds = Math.floor(Date.now() / 1000);
  const assertionHeader = encodeBase64Url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const assertionPayload = encodeBase64Url(JSON.stringify({
    iss: adc.client_email,
    scope: GOOGLE_CLOUD_SCOPE,
    aud: tokenUrl,
    exp: nowSeconds + 3600,
    iat: nowSeconds
  }));
  const unsignedAssertion = `${assertionHeader}.${assertionPayload}`;
  const signer = createSign("RSA-SHA256");
  signer.update(unsignedAssertion);
  signer.end();
  const signature = signer.sign(adc.private_key);
  const assertion = `${unsignedAssertion}.${encodeBase64Url(signature)}`;

  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion
    })
  });
  const result = (await response.json()) as OAuthTokenResponse;

  if (!response.ok || !result.access_token) {
    throw new Error(result.error_description ?? result.error ?? "Unable to refresh Vertex AI service account access token.");
  }

  cacheVertexToken(result);
  return result.access_token;
}

async function refreshVercelWifToken(config: VercelWifConfig) {
  const subjectToken = await getVercelOidcSubjectToken();
  const audience = `//iam.googleapis.com/projects/${config.projectNumber}/locations/global/workloadIdentityPools/${config.poolId}/providers/${config.providerId}`;
  const stsResponse = await fetch(GOOGLE_STS_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:token-exchange",
      audience,
      scope: GOOGLE_CLOUD_SCOPE,
      requested_token_type: "urn:ietf:params:oauth:token-type:access_token",
      subject_token_type: "urn:ietf:params:oauth:token-type:jwt",
      subject_token: subjectToken
    })
  });
  const stsResult = (await stsResponse.json()) as OAuthTokenResponse;

  if (!stsResponse.ok || !stsResult.access_token) {
    throw new Error(stsResult.error_description ?? stsResult.error ?? "Unable to exchange the Vercel OIDC token for Google STS credentials.");
  }

  const impersonationResponse = await fetch(
    `${IAM_CREDENTIALS_API_BASE}/projects/-/serviceAccounts/${encodeURIComponent(config.serviceAccountEmail)}:generateAccessToken`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${stsResult.access_token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        scope: [GOOGLE_CLOUD_SCOPE],
        lifetime: "3600s"
      })
    }
  );
  const impersonationResult = (await impersonationResponse.json()) as IamAccessTokenResponse;

  if (!impersonationResponse.ok || !impersonationResult.accessToken) {
    throw new Error(impersonationResult.error?.message ?? "Unable to impersonate the Vertex AI service account.");
  }

  cachedVertexToken = {
    token: impersonationResult.accessToken,
    expiresAt: impersonationResult.expireTime ? Date.parse(impersonationResult.expireTime) : Date.now() + 3600 * 1000
  };
  return impersonationResult.accessToken;
}

async function getVercelOidcSubjectToken() {
  try {
    const { getVercelOidcToken } = await import("@vercel/oidc");
    return getVercelOidcToken();
  } catch {
    throw new Error("Unable to read the Vercel OIDC token. This auth path only works inside a Vercel deployment with OIDC enabled.");
  }
}

async function getGcloudAccessToken() {
  const token = await runGcloud(["auth", "print-access-token"]);
  if (!token) {
    throw new Error("Unable to read a Vertex AI access token from ADC or gcloud.");
  }

  cachedVertexToken = {
    token,
    expiresAt: Date.now() + 50 * 60 * 1000
  };
  return token;
}

async function getGcloudProjectId() {
  const projectId = await runGcloud(["config", "get-value", "project"]);
  return projectId && projectId !== "(unset)" ? projectId : null;
}

function getVercelWifConfig(): VercelWifConfig | null {
  const projectId = readEnv("GCP_PROJECT_ID") ?? readEnv("GOOGLE_CLOUD_PROJECT") ?? readEnv("GEMINI_VERTEX_PROJECT");
  const projectNumber = readEnv("GCP_PROJECT_NUMBER");
  const serviceAccountEmail = readEnv("GCP_SERVICE_ACCOUNT_EMAIL");
  const poolId = readEnv("GCP_WORKLOAD_IDENTITY_POOL_ID");
  const providerId = readEnv("GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID");

  if (!projectId || !projectNumber || !serviceAccountEmail || !poolId || !providerId) {
    return null;
  }

  return {
    projectId,
    projectNumber,
    serviceAccountEmail,
    poolId,
    providerId
  };
}

async function runGcloud(args: string[]) {
  for (const command of ["gcloud.cmd", "gcloud"]) {
    try {
      const { stdout } = await execFileAsync(command, args, {
        encoding: "utf8",
        timeout: 10_000,
        windowsHide: true
      });
      const output = String(stdout).trim();
      if (output) return output;
    } catch {
      // Try the next command name so Windows and POSIX environments both work.
    }
  }
  return null;
}

function cacheVertexToken(result: OAuthTokenResponse) {
  if (!result.access_token) return;

  cachedVertexToken = {
    token: result.access_token,
    expiresAt: Date.now() + (result.expires_in ?? 3600) * 1000
  };
}

function readAdcCredentials() {
  const inlineCredentials = readInlineAdcCredentials();
  if (inlineCredentials) return inlineCredentials;

  const filePath = getAdcCredentialsPath();
  if (!filePath) return null;

  try {
    return normalizeAdcCredentials(JSON.parse(readFileSync(filePath, "utf8")) as AdcCredentials);
  } catch {
    return null;
  }
}

function readInlineAdcCredentials() {
  const rawCredentials = readEnv("GOOGLE_APPLICATION_CREDENTIALS_JSON")
    ?? readEnv("GOOGLE_CLOUD_CREDENTIALS_JSON")
    ?? readEnv("GEMINI_VERTEX_CREDENTIALS_JSON");
  const base64Credentials = readEnv("GOOGLE_APPLICATION_CREDENTIALS_BASE64")
    ?? readEnv("GOOGLE_CLOUD_CREDENTIALS_BASE64")
    ?? readEnv("GEMINI_VERTEX_CREDENTIALS_BASE64");
  const raw = rawCredentials ?? (base64Credentials ? Buffer.from(base64Credentials, "base64").toString("utf8") : null);

  if (!raw) return null;

  try {
    return normalizeAdcCredentials(JSON.parse(raw) as AdcCredentials);
  } catch {
    return null;
  }
}

function normalizeAdcCredentials(credentials: AdcCredentials) {
  return {
    ...credentials,
    private_key: credentials.private_key?.replace(/\\n/g, "\n")
  };
}

function getAdcCredentialsPath() {
  const explicitPath = readEnv("GOOGLE_APPLICATION_CREDENTIALS");
  if (explicitPath && existsSync(explicitPath)) return explicitPath;

  const candidates = [
    process.env.APPDATA ? path.join(process.env.APPDATA, "gcloud", "application_default_credentials.json") : null,
    path.join(homedir(), ".config", "gcloud", "application_default_credentials.json")
  ].filter((candidate): candidate is string => Boolean(candidate));

  return candidates.find((candidate) => existsSync(candidate)) ?? null;
}

function encodeBase64Url(value: string | Buffer) {
  return Buffer.from(value).toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function readEnv(key: string) {
  const value = process.env[key];
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : undefined;
}

function buildWebsitePrompt(input: GenerateWebsitePlanInput) {
  return `
You are the SiteRent website creation assistant for South African service-business website rentals.

Create the first practical AI build plan for a customer website. The customer has chosen what the website should look like during onboarding, and their notes are binding creative direction. Do not ask for more information; make a concrete, publishable first-pass plan that can be turned into a hosted SiteRent website and emailed back to the customer when ready.

Fit the plan to one of these four starter template styles:
- aireco-dark: black/dark hero, bold booking CTAs, large service photography, premium local-business feel.
- eircool-editorial: airy cream canvas, olive accents, staggered image blocks, calm editorial trust.
- razor-minimal: ivory full-page layout, pill navigation, oversized type, compact service cards.
- coolair-blue: blue corporate hero, trust signals, process cards, polished maintenance company feel.

Supported customer categories include plumbers, geyser repair, electricians, locksmiths, pest control, roofing, HVAC, solar, barbers, and photographers. Infer the correct category from the business context and avoid HVAC-specific wording unless the customer is actually HVAC.

Mode: ${input.mode}
Preferred template style: ${input.preferredTemplateStyle ?? "choose the best fit"}
Business context:
${input.businessContext}

Current website context:
${input.currentWebsiteContext ?? "No current website context supplied."}

Uploaded reference files:
${attachmentSummary(input.attachments)}

Follow the provided response schema exactly.
Keep recommendations practical for a Next.js/Tailwind implementation, mobile-first conversion, customer dashboard follow-up, and POPIA-aware South African small business websites.
`;
}

function attachmentSummary(attachments?: AiWebsiteAttachment[]) {
  if (!attachments?.length) return "No files uploaded.";

  return attachments
    .map((attachment, index) => {
      const readable = attachment.text ? "text extracted" : attachment.data ? "sent as inline media" : "metadata only";
      return `${index + 1}. ${attachment.name} (${attachment.mimeType}) - ${readable}`;
    })
    .join("\n");
}
