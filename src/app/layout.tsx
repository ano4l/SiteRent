import type { Metadata, Viewport } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-dm-sans"
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "SiteRent",
    template: "%s | SiteRent"
  },
  description: "Website-as-a-Service for South African trade businesses.",
  applicationName: "SiteRent",
  openGraph: {
    type: "website",
    siteName: "SiteRent",
    title: "SiteRent",
    description: "Website-as-a-Service for South African trade businesses."
  }
};

export const viewport: Viewport = {
  themeColor: "#111111",
  width: "device-width",
  initialScale: 1
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-ZA" className={dmSans.variable}>
      <body>{children}</body>
    </html>
  );
}
