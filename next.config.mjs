/** @type {import('next').NextConfig} */

// Derive the Supabase storage host from env so optimized images are scoped to
// known sources instead of allowing any remote host.
const supabaseHost = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname;
  } catch {
    return null;
  }
})();

const remotePatterns = [];
remotePatterns.push(
  supabaseHost
    ? { protocol: "https", hostname: supabaseHost }
    : { protocol: "https", hostname: "*.supabase.co" }
);

// Next.js dev mode (HMR + eval source maps) requires 'unsafe-eval'; it is not
// included in production builds.
const scriptEval = process.env.NODE_ENV === "production" ? "" : " 'unsafe-eval'";

const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${scriptEval} https://www.googletagmanager.com https://connect.facebook.net`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://www.google-analytics.com https://*.google-analytics.com https://connect.facebook.net",
  "frame-src https://*.peachpayments.com",
  "form-action 'self' https://*.peachpayments.com",
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "object-src 'none'"
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }
];

const nextConfig = {
  images: {
    remotePatterns
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders
      }
    ];
  }
};

export default nextConfig;
