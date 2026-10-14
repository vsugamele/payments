"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  LayoutDashboard, LogOut, Search, X, ArrowRight,
  Terminal, DollarSign, Cpu, ShieldCheck, Eye, Command
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { ALL_ADMIN_TOOLS, QUICK_TECHNICAL_SHORTCUTS } from "@/lib/adminModulesCatalog";

export function OwnerBar() {
  const [isOwner, setIsOwner] = useState(false);
  const [openPalette, setOpenPalette] = useState(false);
  const [query, setQuery] = useState("");
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const checkCookie = () => {
      const hasCookie =
        typeof document !== "undefined" &&
        document.cookie.split(";").some((c) => c.trim().startsWith("vs_internal_pass=1"));
      setIsOwner(hasCookie);
    };
    checkCookie();
  }, [pathname]);

  // Listen for Ctrl+K / Cmd+K or custom event "open-command-palette"
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpenPalette((prev) => !prev);
      } else if (e.key === "Escape") {
        setOpenPalette(false);
      }
    };
    const onCustomOpen = () => setOpenPalette(true);

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("open-command-palette", onCustomOpen);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("open-command-palette", onCustomOpen);
    };
  }, []);

  const matchedShortcuts = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return QUICK_TECHNICAL_SHORTCUTS.slice(0, 6);
    return QUICK_TECHNICAL_SHORTCUTS.filter((item) =>
      `${item.code} ${item.title} ${item.category} ${item.summary}`.toLowerCase().includes(q)
    );
  }, [query]);

  const matchedTools = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ALL_ADMIN_TOOLS.slice(0, 12);
    return ALL_ADMIN_TOOLS.filter((t) =>
      `${t.title} ${t.desc} ${t.whatItIs} ${t.badge} ${t.url} ${t.keywords.join(" ")} ${t.dataSources.join(" ")}`
        .toLowerCase()
        .includes(q)
    ).slice(0, 18);
  }, [query]);

  if (!isOwner) return null;

  return (
    <>
      {/* Floating Owner Pill (shown on all pages so Ctrl+K is always 1 click away) */}
      <div className="fixed bottom-4 left-4 z-50 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="flex items-center gap-2 p-1.5 pl-3 rounded-full bg-slate-900/95 border border-emerald-500/40 backdrop-blur-md shadow-2xl text-xs text-white">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-bold text-[11px] text-emerald-300 font-mono hidden sm:inline">
            Proprietário
          </span>

          <button
            onClick={() => setOpenPalette(true)}
            className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold text-[10px] flex items-center gap-1.5 transition-all"
            title="Busca Rápida Universal (Ctrl + K)"
          >
            <Search size={11} className="text-blue-400" />
            <span>Busca Rápida</span>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-950 text-[9px] font-mono text-slate-400 border border-slate-800">
              Ctrl+K
            </kbd>
          </button>

          {pathname !== "/admin" && (
            <Link
              href="/admin"
              className="px-2.5 py-1 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] flex items-center gap-1 transition-all"
            >
              <LayoutDashboard size={11} />
              <span>Cockpit ({ALL_ADMIN_TOOLS.length})</span>
            </Link>
          )}

          <button
            onClick={() => {
              document.cookie = "vs_internal_pass=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
              window.location.href = "/?logout=1";
            }}
            className="p-1 rounded-full text-slate-400 hover:text-red-400 hover:bg-white/10 transition-colors"
            title="Bloquear e voltar ao modo público"
          >
            <LogOut size={12} />
          </button>
        </div>
      </div>

      {/* Global Command Palette Modal (Ctrl+K) */}
      {openPalette && (
        <div
          className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-sm flex items-start justify-center pt-16 px-4"
          onClick={() => setOpenPalette(false)}
        >
          <div
            className="w-full max-w-3xl rounded-2xl bg-[#070d19] border border-blue-500/40 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search Input Header */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-800 bg-[#040811]">
              <Command className="w-4 h-4 text-blue-400 shrink-0" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Digite qualquer código (2AB1006, IP0040T1, TC 05, DE 48, Tag 95, MCC 7995) ou nome de ferramenta..."
                className="flex-1 bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none font-mono"
                autoFocus
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="text-xs text-slate-400 hover:text-white px-2 py-0.5"
                >
                  Limpar
                </button>
              )}
              <button
                onClick={() => setOpenPalette(false)}
                className="p-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Results Body */}
            <div className="max-h-[70vh] overflow-y-auto p-4 space-y-5 divide-y divide-slate-800/80">
              {/* Section 1: Technical Code Shortcuts */}
              {matchedShortcuts.length > 0 && (
                <div className="space-y-2">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-purple-400 px-1">
                    Atalhos de Códigos Técnicos (MCBS, Visa VSS, MPE, Base II & ISO 8583)
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {matchedShortcuts.map((item, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setOpenPalette(false);
                          router.push(item.url);
                        }}
                        className="text-left p-3 rounded-xl bg-[#0b1324] hover:bg-blue-950/50 border border-slate-800 hover:border-blue-500/40 transition-all group"
                      >
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="px-2 py-0.5 rounded bg-purple-500/15 border border-purple-500/30 font-mono text-xs font-bold text-purple-300">
                            {item.code}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">{item.category}</span>
                        </div>
                        <div className="text-xs font-bold text-white group-hover:text-blue-300">
                          {item.title}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">
                          {item.summary}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Section 2: Matched Admin & Compliance Modules */}
              <div className="pt-4 space-y-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-blue-400 px-1">
                  Módulos & Ferramentas do Cockpit ({matchedTools.length} de {ALL_ADMIN_TOOLS.length})
                </div>
                {matchedTools.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400">
                    Nenhum módulo encontrado para &ldquo;{query}&rdquo;.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {matchedTools.map((tool) => (
                      <button
                        key={tool.id}
                        onClick={() => {
                          setOpenPalette(false);
                          router.push(tool.url);
                        }}
                        className="w-full text-left p-3.5 rounded-xl bg-[#09101f] hover:bg-blue-950/40 border border-slate-800/90 hover:border-blue-500/50 transition-all flex items-start justify-between gap-4 group"
                      >
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-bold text-white group-hover:text-blue-300">
                              {tool.title}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 font-mono text-[10px] text-emerald-300">
                              {tool.badge}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-300 leading-relaxed">
                            {tool.whatItIs}
                          </p>
                          <div className="flex flex-wrap items-center gap-1.5 pt-1">
                            {tool.dataSources.slice(0, 3).map((src, idx) => (
                              <span
                                key={idx}
                                className="px-1.5 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 font-mono text-[9px] text-purple-300"
                              >
                                {src}
                              </span>
                            ))}
                            <span className="text-[10px] font-mono text-slate-500 ml-1">
                              {tool.url}
                            </span>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 shrink-0 mt-1" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-4 py-2.5 bg-[#040811] border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <span>
                Pressione <kbd className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 font-mono text-slate-300">ESC</kbd> para fechar ou clique em qualquer item para navegar
              </span>
              <Link
                href="/admin"
                onClick={() => setOpenPalette(false)}
                className="text-blue-400 hover:underline font-semibold"
              >
                Ir para o Cockpit Completo ({ALL_ADMIN_TOOLS.length} Ferramentas) →
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
