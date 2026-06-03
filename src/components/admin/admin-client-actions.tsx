"use client";

import { Ban, Pause, ReceiptText, RefreshCw, RotateCcw } from "lucide-react";
import { useState } from "react";

type AdminAction = "republish" | "pause" | "cancel" | "reactivate" | "refund";

export function AdminClientActions({ clientId }: { clientId: string }) {
  const [status, setStatus] = useState<string | null>(null);

  async function runAction(action: AdminAction) {
    setStatus(`${action}...`);
    const body =
      action === "refund"
        ? { clientId, action, amount: 300, reason: "Manual admin refund tracking" }
        : { clientId, action, reason: "Admin dashboard action" };

    const response = await fetch("/api/admin/client-action", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    setStatus(response.ok ? `${action} done` : `${action} failed`);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <ActionButton label="Republish" icon={RefreshCw} onClick={() => runAction("republish")} />
      <ActionButton label="Pause" icon={Pause} onClick={() => runAction("pause")} />
      <ActionButton label="Cancel" icon={Ban} onClick={() => runAction("cancel")} tone="danger" />
      <ActionButton label="Override" icon={RotateCcw} onClick={() => runAction("reactivate")} />
      <ActionButton label="Refund" icon={ReceiptText} onClick={() => runAction("refund")} />
      {status && <span className="min-w-20 text-xs font-semibold text-[#666666]">{status}</span>}
    </div>
  );
}

function ActionButton({
  label,
  icon: Icon,
  onClick,
  tone = "default"
}: {
  label: string;
  icon: typeof RefreshCw;
  onClick: () => void;
  tone?: "default" | "danger";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        tone === "danger"
          ? "inline-flex h-8 items-center gap-1.5 rounded-full border border-[#ffd8d8] bg-[#fff5f5] px-3 text-xs font-bold text-[#b42318] transition hover:bg-[#ffecec]"
          : "inline-flex h-8 items-center gap-1.5 rounded-full border border-admin-line-soft bg-admin-surface px-3 text-xs font-bold text-[#333333] transition hover:border-[#111111]"
      }
    >
      <Icon size={13} />
      {label}
    </button>
  );
}
