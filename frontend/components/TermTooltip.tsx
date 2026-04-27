"use client";

interface TermTooltipProps {
  term: string;
  definition: string;
}

export default function TermTooltip({ term, definition }: TermTooltipProps) {
  return (
    <span className="group relative inline-block cursor-help border-b border-dashed border-primary text-primary transition-colors hover:bg-primary/10">
      {term}
      <span className="opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-[280px] p-3 bg-input border border-border shadow-xl rounded-xl z-50 text-xs text-muted-foreground font-normal leading-relaxed text-left pointer-events-none">
        <strong className="block text-foreground font-bold mb-1">{term}</strong>
        {definition}
        
        {/* Triângulo direcional (Seta apontando para baixo) */}
        <span className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-input"></span>
        <span className="absolute top-full left-1/2 -translate-x-1/2 border-[9px] -mt-[1px] border-transparent border-t-border -z-10"></span>
      </span>
    </span>
  );
}
