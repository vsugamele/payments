"use client";

import { useRef, useState, useEffect } from "react";
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
    // Se está no terço inferior da viewport → abre para cima
    setPos(rect.top > window.innerHeight * 0.6 ? "above" : "above");
    // Se está muito perto da borda direita → alinha à direita
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
          transition-all duration-200
          absolute mb-2 w-[290px]
          p-3.5 bg-[#0a1120] border border-slate-700/80 shadow-2xl shadow-black/60
          rounded-xl z-[9999] text-xs text-slate-300 font-normal leading-relaxed text-left
          pointer-events-none
          ${pos === "above" ? "bottom-full" : "top-full mt-2"}
          ${alignRight ? "right-0" : "left-1/2 -translate-x-1/2"}
        `}
        style={{ backdropFilter: "blur(12px)" }}
      >
        {/* Título */}
        <strong className="block text-white font-bold mb-1.5 text-[11px] uppercase tracking-wider" style={{ color: "#60a5fa" }}>
          {term}
        </strong>

        {/* Definição */}
        <span className="text-slate-300">{definition}</span>

        {/* Link para o Glossário (quando existe) */}
        {glossarioEntry && (
          <span
            className="pointer-events-auto mt-2.5 pt-2 border-t border-slate-700/60 flex items-center gap-1 text-[10px] font-semibold"
            style={{ color: "#60a5fa" }}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
            <Link href="/glossario" className="hover:underline">
              Ver no Glossário
            </Link>
          </span>
        )}

        {/* Seta inferior */}
        {pos === "above" && !alignRight && (
          <>
            <span className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-[#0a1120]" />
            <span className="absolute top-full left-1/2 -translate-x-1/2 border-[9px] -mt-[1px] border-transparent border-t-slate-700/80 -z-10" />
          </>
        )}
        {pos === "above" && alignRight && (
          <>
            <span className="absolute top-full right-3 border-8 border-transparent border-t-[#0a1120]" />
            <span className="absolute top-full right-3 border-[9px] -mt-[1px] border-transparent border-t-slate-700/80 -z-10" />
          </>
        )}
      </span>
    </span>
  );
}
