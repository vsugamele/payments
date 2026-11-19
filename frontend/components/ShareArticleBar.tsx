"use client";

import { useState } from "react";
import { Check, Link2, Share2 } from "lucide-react";

export function ShareArticleBar({
  title,
  path,
}: {
  title: string;
  path?: string;
}) {
  const [copied, setCopied] = useState(false);

  const getFullUrl = () => {
    if (typeof window === "undefined") {
      return `https://vinicius-sugamele.com${path || ""}`;
    }
    return path ? `${window.location.origin}${path}` : window.location.href;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(getFullUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback silencioso caso o navegador bloqueie clipboard
    }
  };

  const handleLinkedIn = () => {
    const url = encodeURIComponent(getFullUrl());
    const summary = encodeURIComponent(title);
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${url}&title=${summary}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={handleCopy}
        className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 font-mono text-[11px] text-muted-foreground hover:text-foreground hover:border-foreground/40 transition-colors"
      >
        {copied ? <Check size={12} /> : <Link2 size={12} />}
        <span>{copied ? "Link copiado" : "Copiar link"}</span>
      </button>

      <button
        type="button"
        onClick={handleLinkedIn}
        className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 font-mono text-[11px] text-muted-foreground hover:text-foreground hover:border-foreground/40 transition-colors"
      >
        <Share2 size={12} />
        <span>Compartilhar no LinkedIn</span>
      </button>
    </div>
  );
}
