"use client";

import { useEffect } from "react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en-ZA">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#f2f4f8",
          fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, sans-serif",
          color: "#111111"
        }}
      >
        <main style={{ maxWidth: 420, padding: 32, textAlign: "center" }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Something went wrong</h1>
          <p style={{ marginTop: 8, color: "#666666", lineHeight: 1.6 }}>
            A critical error occurred while loading the application. Please try again.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: 24,
              padding: "12px 20px",
              borderRadius: 12,
              border: "none",
              background: "#111111",
              color: "#ffffff",
              fontWeight: 600,
              cursor: "pointer"
            }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
