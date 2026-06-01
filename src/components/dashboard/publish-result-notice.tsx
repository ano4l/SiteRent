"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, X } from "lucide-react";

const publishResultStorageKey = "siterent-last-publish-result";

type PublishResult = {
  siteUrl?: string;
  customDomain?: string | null;
  customDomainInstructions?: {
    type: string;
    host: string;
    value: string;
    apex?: {
      type: string;
      host: string;
      value: string;
    };
    note?: string;
  } | null;
};

export function PublishResultNotice() {
  const [result, setResult] = useState<PublishResult | null>(null);

  useEffect(() => {
    const raw = window.localStorage.getItem(publishResultStorageKey);
    if (!raw) return;

    try {
      setResult(JSON.parse(raw) as PublishResult);
    } catch {
      window.localStorage.removeItem(publishResultStorageKey);
    }
  }, []);

  if (!result) return null;

  return (
    <section className="rounded-xl border border-success/30 bg-success/10 p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex gap-4">
          <CheckCircle2 className="mt-1 text-success" size={26} />
          <div>
            <h2 className="text-xl font-black text-foreground">Website published</h2>
            {result.siteUrl && (
              <Link href={result.siteUrl} className="mt-2 inline-block font-bold text-success">
                {result.siteUrl}
              </Link>
            )}
            {result.customDomainInstructions && (
              <div className="mt-4 rounded-lg bg-card p-4 text-sm font-semibold text-muted-foreground">
                <p className="text-foreground">Custom domain DNS</p>
                <p className="mt-2">
                  {result.customDomainInstructions.type} {result.customDomainInstructions.host} → {result.customDomainInstructions.value}
                </p>
                {result.customDomainInstructions.apex && (
                  <p>
                    {result.customDomainInstructions.apex.type} {result.customDomainInstructions.apex.host} → {result.customDomainInstructions.apex.value}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            window.localStorage.removeItem(publishResultStorageKey);
            setResult(null);
          }}
          className="rounded-lg bg-secondary p-2 text-muted-foreground transition hover:text-foreground"
          aria-label="Dismiss publish notice"
        >
          <X size={16} />
        </button>
      </div>
    </section>
  );
}
