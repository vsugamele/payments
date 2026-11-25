"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import glossarioData from "@/data/glossario.json";

interface TermTooltipProps {
  term: string;
  definition: string;
}

export default function TermTooltip({ term, definition }: TermTooltipProps) {
  const spanRef = useRef<HTMLSpanElement>(null);
  const [pos, setPos] = useState<"above" | "below">("above");
  const [alignRight, setAlignRight] = useState(false);

  // Verifica se o termo existe no glossário para gerar deep link
  const glossarioEntry = glossarioData.find(
    g => g.termo.toLowerCase() === term.toLowerCase() || g.sigla?.toLowerCase() === term.toLowerCase()
  );

  const updatePosition = () => {
    if (!spanRef.current) return;
    const rect = spanRef.current.getBoundingClientRect();
    setPos(rect.top < 180 ? "below" : "above");
    setAlignRight(rect.left > window.innerWidth - 320);
  };

  return (
    <span
      ref={spanRef}
      onMouseEnter={updatePosition}
      className="group relative inline-block cursor-help border-b border-dashed border-primary/60 text-primary transition-colors hover:border-primary hover:bg-primary/8"
    >
      {term}
      <span
        className={`
          opacity-0 invisible group-hover:opacity-100 group-hover:visible
          transition-opacity duration-150
          absolute w-[290px]
          p-3.5 bg-card border border-[var(--border-strong)] shadow-xl
          rounded-xl z-50 text-xs text-[var(--body-text)] font-normal leading-relaxed text-left
          pointer-events-none
          ${pos === "above" ? "bottom-full mb-2" : "top-full mt-2"}
          ${alignRight ? "right-0" : "left-1/2 -translate-x-1/2"}
        `}
      >
        {/* Título */}
        <strong className="block font-mono font-semibold mb-1 text-[11px] uppercase tracking-wider text-primary">
          {term}
        </strong>

        {/* Definição */}
        <span className="text-[var(--body-text)]">{definition}</span>

        {/* Link para o Glossário (quando existe) */}
        {glossarioEntry && (
          <span className="pointer-events-auto mt-2.5 pt-2 border-t border-border flex items-center gap-1.5 text-[11px] font-semibold text-primary">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
            <Link href="/glossario" className="hover:underline">
              Ver no Glossário
            </Link>
          </span>
        )}
      </span>
    </span>
  );
}
