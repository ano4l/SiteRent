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
