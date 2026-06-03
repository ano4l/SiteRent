import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SiteRent",
    short_name: "SiteRent",
    description: "Website-as-a-Service for South African trade businesses.",
    start_url: "/",
    display: "standalone",
    background_color: "#fafafa",
    theme_color: "#111111",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml"
      }
    ]
  };
}
