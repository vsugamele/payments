"use client";

import { useState } from "react";
import { BookOpen } from "lucide-react";

interface RuleReferenceProps {
  manual: string;
  chapter?: string;   // legacy prop
  ruleId?: string;    // alias for chapter
  description?: string; // extra description
  label?: string;
}

export default function RuleReference({ manual, chapter, ruleId, description, label }: RuleReferenceProps) {
  const [show, setShow] = useState(false);
  const chapterText = chapter || ruleId || "";

  return (
    <span
      className="relative inline-flex items-center gap-1.5 align-middle mx-1"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <span className="inline-flex items-center gap-1 bg-code-bg/80 border border-border text-primary px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-widest cursor-help hover:bg-primary/10 transition-colors">
        <BookOpen size={10} />
        {label || "REGRA"}
      </span>

      {show && (
        <span
          className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 bg-code-bg border border-border rounded-lg shadow-xl p-3 text-left animate-in fade-in zoom-in-95"
        >
          <span className="block text-xs font-bold text-white mb-1 border-b border-border pb-1">
            Fonte Documental
          </span>
          <span className="block text-xs text-muted-foreground font-semibold mb-0.5">
            Manual: <span className="text-blue-400">{manual}</span>
          </span>
          {chapterText && (
            <span className="block text-[11px] text-muted-foreground leading-snug">
              Capítulo/Regra: <span className="text-white">{chapterText}</span>
            </span>
          )}
          {description && (
            <span className="block text-[11px] text-muted-foreground mt-1 leading-snug italic">
              {description}
            </span>
          )}
          {/* Seta do popover */}
          <span
            className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-code-bg border-r border-b border-border rotate-45"
          ></span>
        </span>
      )}
    </span>
  );
}
