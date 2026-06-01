export const PLATFORM_DOMAIN = process.env.NEXT_PUBLIC_PLATFORM_DOMAIN || "siterent.co.za";

export const RESERVED_SUBDOMAINS = new Set([
  "www",
  "admin",
  "app",
  "api",
  "dashboard",
  "support",
  "billing",
  "mail",
  "email",
  "ftp",
  "cdn",
  "assets",
  "status",
  "help",
  "login",
  "auth",
  "peach"
]);

export function isValidSubdomain(value: string) {
  return /^[a-z0-9](?:[a-z0-9-]{1,61}[a-z0-9])$/.test(value) && !RESERVED_SUBDOMAINS.has(value);
}

export function getSiteUrl(subdomain: string) {
  return `https://${subdomain}.${PLATFORM_DOMAIN}`;
}

export function getCustomDomainInstructions(domain: string) {
  return {
    type: "CNAME",
    host: "www",
    value: PLATFORM_DOMAIN,
    apex: {
      type: "A",
      host: "@",
      value: "76.76.21.21"
    },
    note: `Point www.${domain} to ${PLATFORM_DOMAIN}. Apex domains can use Vercel's A record value.`
  };
}
