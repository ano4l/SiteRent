import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: "var(--card)",
        "card-foreground": "var(--card-foreground)",
        secondary: "var(--secondary)",
        "secondary-foreground": "var(--secondary-foreground)",
        border: "var(--border)",
        ring: "var(--ring)",
        accent: "var(--accent)",
        "accent-foreground": "var(--accent-foreground)",
        destructive: "var(--destructive)",
        "chart-1": "var(--chart-1)",
        "chart-2": "var(--chart-2)",
        "chart-3": "var(--chart-3)",
        sidebar: "var(--sidebar)",
        "sidebar-foreground": "var(--sidebar-foreground)",
        "sidebar-accent": "var(--sidebar-accent)",
        "sidebar-border": "var(--sidebar-border)",
        success: "var(--success)",
        warning: "var(--warning)",
        "muted-foreground": "var(--muted-foreground)",
        // App (slate/blue) theme tokens
        "app-bg": "var(--app-bg)",
        "app-bg-soft": "var(--app-bg-soft)",
        "app-surface": "var(--app-surface)",
        "app-surface-strong": "var(--app-surface-strong)",
        "app-line": "var(--app-line)",
        "app-line-soft": "var(--app-line-soft)",
        "app-line-strong": "var(--app-line-strong)",
        "app-divider": "var(--app-divider)",
        "app-border-hover": "var(--app-border-hover)",
        // Admin (paper/ink) theme tokens
        "admin-ink": "var(--admin-ink)",
        "admin-muted": "var(--admin-muted)",
        "admin-paper": "var(--admin-paper)",
        "admin-surface": "var(--admin-surface)",
        "admin-line": "var(--admin-line)",
        "admin-line-soft": "var(--admin-line-soft)",
        "admin-accent": "var(--admin-accent)",
        // Brand mark
        "brand-mint": "var(--brand-mint)",
        "brand-green-300": "var(--brand-green-300)",
        "brand-green-500": "var(--brand-green-500)",
        "brand-green-700": "var(--brand-green-700)",
        // Admin legacy palette (kept for existing admin components)
        ink: "#111111",
        muted: "#6b6258",
        line: "#ded7cc",
        paper: "#f3eee6",
        mint: "#d9efdf",
        peach: "#f8d2be"
      },
      boxShadow: {
        soft: "0 18px 45px rgba(17, 17, 17, 0.08)",
        insetSoft: "inset 14px 0 42px rgba(255, 255, 255, 0.58)"
      }
    }
  },
  plugins: []
};

export default config;
