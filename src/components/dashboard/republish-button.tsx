"use client";

import { RefreshCw } from "lucide-react";
import { useState } from "react";

export function RepublishButton({ clientId }: { clientId: string }) {
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const publishingPaused = process.env.NEXT_PUBLIC_PUBLISHING_PAUSED !== "false";

  async function republish() {
    if (publishingPaused) return;

    setStatus("saving");
    const response = await fetch("/api/publish/republish", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId })
    });
    setStatus(response.ok ? "saved" : "error");
  }

  return (
    <button
      type="button"
      onClick={republish}
      disabled={publishingPaused || status === "saving"}
      className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-3 text-sm font-bold text-accent-foreground shadow-[0_12px_26px_rgba(110,231,168,0.12)] disabled:opacity-60"
    >
      <RefreshCw size={16} />
      {publishingPaused ? "Launch paused" : status === "saving" ? "Launching" : status === "saved" ? "Launched" : "Launch update"}
    </button>
  );
}
