type VercelDomainResult =
  | { configured: false; skippedReason: string }
  | { configured: true; domain: string; verified?: boolean };

export function hasVercelDomainConfig() {
  return Boolean(process.env.VERCEL_API_TOKEN && process.env.VERCEL_PROJECT_ID);
}

export async function addDomainToVercelProject(domain: string): Promise<VercelDomainResult> {
  if (!hasVercelDomainConfig()) {
    return {
      configured: false,
      skippedReason: "Vercel domain credentials are not configured."
    };
  }

  const response = await fetch(`https://api.vercel.com/v10/projects/${process.env.VERCEL_PROJECT_ID}/domains`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.VERCEL_API_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ name: domain })
  });

  if (!response.ok && response.status !== 409) {
    const error = await response.text();
    throw new Error(error || "Unable to add domain to Vercel project");
  }

  const payload = response.status === 409 ? {} : ((await response.json()) as { verified?: boolean });

  return {
    configured: true,
    domain,
    verified: payload.verified
  };
}
