"use client";

import { useState, useMemo } from "react";
import { Search, ChevronDown, ChevronRight, X } from "lucide-react";
import glossarioData from "@/data/glossario.json";

function Highlight({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;
  const safe = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${safe})`, "gi"));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark
            key={i}
            className="bg-[#f2b01e]/30 text-foreground rounded px-0.5"
          >
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
}

export default function GlossarioClient() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("Todas");
  const [expanded, setExpanded] = useState<string | null>(null);

  const categories = useMemo(() => {
    const cats = new Set(glossarioData.map((i) => i.categoria));
    return ["Todas", ...Array.from(cats).sort()];
  }, []);

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    return glossarioData.filter((item) => {
      const matchesCategory =
        selectedCategory === "Todas" || item.categoria === selectedCategory;
      if (!matchesCategory) return false;
      if (!q) return true;
      return (
        item.termo.toLowerCase().includes(q) ||
        (item.sigla?.toLowerCase().includes(q) ?? false) ||
        item.definicao.toLowerCase().includes(q) ||
        (item.impacto?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [search, selectedCategory]);

  return (
    <div className="space-y-8">
      {/* Busca e filtros */}
      <section className="space-y-4">
        <div className="relative max-w-xl">
          <Search
            size={15}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar termo, sigla ou conceito (ex.: 3DS, IRD, Base II, VAMP, BRAM)..."
            aria-label="Buscar no glossário"
            className="w-full rounded-full border border-border bg-card pl-10 pr-9 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground transition-colors"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              aria-label="Limpar busca"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => {
            const active = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  active
                    ? "bg-[var(--action-bg)] text-[var(--action-fg)] border-transparent"
                    : "bg-card text-muted-foreground border-border hover:text-foreground hover:border-foreground/30"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        <p className="font-mono text-xs text-muted-foreground">
          {filteredItems.length === glossarioData.length
            ? `${glossarioData.length} termos cadastrados`
            : `${filteredItems.length} de ${glossarioData.length} termos`}
        </p>
      </section>

      {/* Grid editorial de termos */}
      {filteredItems.length === 0 ? (
        <div className="editorial-card p-10 text-center space-y-3">
          <p className="text-sm text-muted-foreground">
            Nenhum termo encontrado para os filtros atuais.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setSelectedCategory("Todas");
            }}
            className="btn-outline text-xs"
          >
            Limpar filtros
          </button>
        </div>
      ) : (
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredItems.map((item) => {
            const isExpanded = expanded === item.termo;
            const shortDef =
              item.definicao.length > 155
                ? `${item.definicao.substring(0, 155)}…`
                : item.definicao;

            return (
              <article
                key={item.termo}
                className="editorial-card p-5 flex flex-col justify-between gap-4"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="text-base font-semibold text-foreground leading-snug">
                      <Highlight text={item.termo} query={search} />
                      {item.sigla && (
                        <span className="ml-2 font-mono text-xs font-normal px-2 py-0.5 rounded-full bg-muted border border-border text-muted-foreground">
                          <Highlight text={item.sigla} query={search} />
                        </span>
                      )}
                    </h2>
                  </div>

                  <p className="font-mono text-[11px] text-muted-foreground">
                    {item.categoria}
                  </p>

                  <p className="font-serif text-sm text-[var(--body-text)] leading-relaxed">
                    <Highlight
                      text={isExpanded ? item.definicao : shortDef}
                      query={search}
                    />
                  </p>

                  {isExpanded && item.impacto && (
                    <div className="rounded-xl bg-muted/70 border border-border p-3.5 space-y-1">
                      <p className="font-mono text-[10px] uppercase text-muted-foreground">
                        Na prática
                      </p>
                      <p className="font-serif text-sm text-foreground/90 leading-relaxed">
                        {item.impacto}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-border gap-2">
                  <div className="flex flex-wrap gap-1">
                    {item.bandeiras.slice(0, 4).map((b) => (
                      <span
                        key={b}
                        className="px-2 py-0.5 rounded-full font-mono text-[10px] bg-muted border border-border text-muted-foreground"
                      >
                        {b}
                      </span>
                    ))}
                  </div>

                  {(item.definicao.length > 155 || item.impacto) && (
                    <button
                      type="button"
                      onClick={() => setExpanded(isExpanded ? null : item.termo)}
                      className="inline-flex items-center gap-1 font-mono text-xs text-foreground hover:opacity-75 transition-opacity shrink-0"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronDown size={13} /> Fechar
                        </>
                      ) : (
                        <>
                          Ler mais <ChevronRight size={13} />
                        </>
                      )}
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </section>
      )}
    </div>
  );
}
