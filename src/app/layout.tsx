import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SiteRent",
  description: "Website-as-a-Service for South African trade businesses."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-ZA">
      <body>{children}</body>
    </html>
  );
}
