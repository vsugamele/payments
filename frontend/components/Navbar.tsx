"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X, Sun, Moon, FileDown } from "lucide-react";
import { useTheme } from "next-themes";

const PRIVATE_WORKBENCH_PREFIXES = [
  "/compliance",
  "/acervo",
  "/simulador",
  "/admin",
  "/mapa",
  "/mcbs",
  "/mdr",
  "/billing",
  "/chargeback",
  "/editor",
  "/arquitetura",
  "/comparativo",
  "/validador",
  "/comparador",
  "/inspecao-tecnica",
  "/liquidacao",
  "/parcelado",
  "/mpe",
  "/scheme-fees",
];

const HYBRID_PUBLIC_PREFIXES = ["/jornada", "/consultas", "/trilhas"];

const NAV_TABS = [
  { href: "/", label: "Notícias", match: (p: string) => p === "/" || p.startsWith("/noticias") },
  { href: "/guia", label: "Guia", match: (p: string) => p === "/guia" || p.startsWith("/guia/") },
  { href: "/trilhas", label: "Por Produto", match: (p: string) => p === "/trilhas" },
  { href: "/jornada", label: "Laboratório", match: (p: string) => p === "/jornada" },
  { href: "/artigos", label: "Artigos", match: (p: string) => p === "/artigos" || p.startsWith("/artigos/") },
  { href: "/glossario", label: "Glossário", match: (p: string) => p === "/glossario" },
  { href: "/curriculo", label: "Currículo", match: (p: string) => p === "/curriculo" || p === "/sobre" },
];

export function Navbar() {
  const pathname = usePathname() || "/";
  const { resolvedTheme, setTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const toggleTheme = () => setTheme(resolvedTheme === "dark" ? "light" : "dark");

  useEffect(() => {
    if (typeof window !== "undefined" && window.top && window.self !== window.top) {
      window.top.location.href = window.location.href;
    }
    if (typeof document !== "undefined") {
      setIsOwner(
        document.cookie.split(";").some((c) => c.trim().startsWith("vs_internal_pass=1"))
      );
    }
  }, [pathname]);

  const isPrivateWorkbench = PRIVATE_WORKBENCH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
  const isHybridRoute = HYBRID_PUBLIC_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  // Nas rotas privadas (ou híbridas quando o proprietário está logado), o PaymentsWorkbenchShell assume o topo
  if (isPrivateWorkbench || (isHybridRoute && isOwner)) {
    return null;
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 h-16">
        {/* Marca tipográfica limpa */}
        <Link
          href="/"
          className="text-[15px] tracking-tight text-foreground hover:opacity-80 transition-opacity"
        >
          <span className="font-semibold">vinícius</span>
          <span className="font-normal text-muted-foreground"> sugamele</span>
        </Link>

        {/* Abas principais no desktop */}
        <nav aria-label="Navegação principal" className="hidden md:flex items-center gap-1">
          {NAV_TABS.map((tab) => {
            const active = tab.match(pathname);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`px-3.5 py-1.5 rounded-full text-sm transition-colors ${
                  active
                    ? "bg-muted text-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>

        {/* Controles discretos à direita */}
        <div className="hidden md:flex items-center gap-2.5">
          <a
            href="/Curriculo_Vinicius_Sugamele.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:border-foreground/40 transition-colors"
          >
            <FileDown size={13} />
            <span>CV (PDF)</span>
          </a>

          <button
            type="button"
            onClick={toggleTheme}
            className="size-9 rounded-full border border-border bg-card text-muted-foreground hover:text-foreground hover:border-foreground/40 flex items-center justify-center transition-colors"
            aria-label="Alternar tema claro e escuro"
          >
            <Sun size={15} className="hidden dark:block" />
            <Moon size={15} className="block dark:hidden" />
          </button>
        </div>

        {/* Mobile */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            type="button"
            onClick={toggleTheme}
            className="size-9 rounded-full border border-border bg-card text-muted-foreground flex items-center justify-center"
            aria-label="Alternar tema"
          >
            <Sun size={15} className="hidden dark:block" />
            <Moon size={15} className="block dark:hidden" />
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((v) => !v)}
            className="size-9 rounded-full border border-border bg-card text-foreground flex items-center justify-center"
            aria-label={mobileMenuOpen ? "Fechar menu" : "Abrir menu"}
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Dropdown mobile */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-border bg-background px-6 py-4 space-y-3">
          <div className="flex flex-col space-y-1">
            {NAV_TABS.map((tab) => {
              const active = tab.match(pathname);
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2 rounded-xl text-sm ${
                    active
                      ? "bg-muted text-foreground font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab.label}
                </Link>
              );
            })}
          </div>

          <div className="pt-3 border-t border-border">
            <a
              href="/Curriculo_Vinicius_Sugamele.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline w-full inline-flex items-center justify-center gap-2 text-xs"
            >
              <FileDown size={14} />
              <span>Baixar currículo em PDF</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
