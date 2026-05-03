"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import {
  Activity, Menu, X, Sun, Moon, ChevronDown,
  BookOpen, Map, Route, BookMarked, TrendingDown,
  Calculator, LayoutTemplate, BarChart2,
  ShieldCheck, Search, Radio, Globe, Archive, FileText, AlertTriangle, DollarSign,
} from "lucide-react";
import { useTheme } from "next-themes";
import GlobalSearch from "@/components/GlobalSearch";

// ── Nav groups ──────────────────────────────────────────────────────────────

type NavItem = { href: string; label: string; desc: string; icon: React.ElementType };
type NavGroup = { key: string; label: string; items: NavItem[] };

const NAV_GROUPS: NavGroup[] = [
  {
    key: "aprender",
    label: "Aprender",
    items: [
      { href: "/mdr",        label: "Fluxo de Dinheiro",    desc: "Como o MDR se divide entre emissor e rede",   icon: TrendingDown },
      { href: "/chargeback", label: "Chargeback",           desc: "Ciclo de disputa, reason codes e liability",  icon: AlertTriangle },
      { href: "/trilhas",    label: "Trilhas",              desc: "4 trilhas guiadas: do ISO à Visa Deep Dive",  icon: BookOpen },
      { href: "/mapa",       label: "Mapa do Conhecimento", desc: "Grafo interativo com 39+ conceitos ligados",   icon: Map },
      { href: "/jornada",    label: "Jornada da Transação", desc: "Ciclo completo do POS ao settlement",         icon: Route },
      { href: "/glossario",  label: "Glossário",            desc: "Termos, siglas e definições do ecossistema",  icon: BookMarked },
    ],
  },
  {
    key: "ferramentas",
    label: "Ferramentas",
    items: [
      { href: "/simulador",   label: "Simulador",      desc: "Calcule intercâmbio Visa, MC e Maestro",     icon: Calculator },
      { href: "/matrix",      label: "Matriz",         desc: "Decisão de taxa: produto, canal, auth, MCC", icon: BarChart2 },
      { href: "/arquitetura", label: "Arquitetura",    desc: "Diagrama interativo com tour guiado",        icon: LayoutTemplate },
      { href: "/comparativo", label: "Comparativo",    desc: "BASE II vs IPM, VTS vs MDES lado a lado",   icon: BarChart2 },
    ],
  },
  {
    key: "referencia",
    label: "Referência",
    items: [
      { href: "/compliance",  label: "Compliance",    desc: "VAMP, ECP, MCC, 3DS, disputas e mais",      icon: ShieldCheck },
      { href: "/mcbs",        label: "MCBS",          desc: "Tarifas Mastercard BR — Service IDs reais", icon: DollarSign },
      { href: "/consultas",   label: "Consultas",     desc: "Lookup de campos DE, PDS e regras",         icon: Search },
      { href: "/canais",      label: "Canais",        desc: "POS, e-commerce, contactless, QR",          icon: Radio },
      { href: "/ecossistema", label: "Ecossistema",   desc: "Atores, fluxos e relacionamentos",          icon: Globe },
      { href: "/acervo",      label: "Acervo",        desc: "Biblioteca normativa e docs oficiais",      icon: Archive },
      { href: "/artigos",     label: "Artigos",       desc: "Análises técnicas e tutoriais práticos",    icon: FileText },
    ],
  },
];

const FLAT_LINKS = [
  { href: "/",      label: "Início" },
  { href: "/sobre", label: "Sobre"  },
];

// ── Dropdown ────────────────────────────────────────────────────────────────

function Dropdown({ group, pathname }: { group: NavGroup; pathname: string }) {
  const [open, setOpen] = useState(false);
  const closeRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isGroupActive = group.items.some((i) => pathname.startsWith(i.href));

  const handleEnter = () => {
    if (closeRef.current) clearTimeout(closeRef.current);
    setOpen(true);
  };
  const handleLeave = () => {
    closeRef.current = setTimeout(() => setOpen(false), 120);
  };

  // cols: 1 for ≤3 items, 2 for more
  const cols = group.items.length > 3 ? 2 : 1;

  return (
    <div
      className="relative"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <button
        className={`flex items-center gap-1 rounded-lg px-3.5 py-1.5 text-sm font-medium transition-all ${
          isGroupActive || open
            ? "bg-foreground/5 text-foreground"
            : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
        }`}
      >
        {group.label}
        <ChevronDown
          size={13}
          className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50 rounded-xl border border-border bg-background/95 backdrop-blur-md shadow-2xl p-2"
          style={{ width: cols === 2 ? 460 : 260 }}
        >
          <div className={`grid gap-0.5 ${cols === 2 ? "grid-cols-2" : "grid-cols-1"}`}>
            {group.items.map((item) => {
              const Icon = item.icon;
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-start gap-3 rounded-lg p-3 transition-colors ${
                    active
                      ? "bg-primary/8 text-foreground"
                      : "hover:bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <div className="mt-0.5 shrink-0 w-7 h-7 rounded-md bg-muted flex items-center justify-center">
                    <Icon size={14} className={active ? "text-primary" : "text-muted-foreground"} />
                  </div>
                  <div className="min-w-0">
                    <div className={`text-sm font-semibold leading-none mb-1 ${active ? "text-foreground" : ""}`}>
                      {item.label}
                    </div>
                    <div className="text-xs text-muted-foreground/80 leading-snug truncate">
                      {item.desc}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Navbar ──────────────────────────────────────────────────────────────────

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <div className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-violet-600">
            <Activity size={16} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold leading-none text-foreground">VS Payments</p>
            <p className="mt-1 text-[10px] leading-none text-muted-foreground">
              Meios de Pagamento & Inovação
            </p>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-0.5">
          {/* Início */}
          <Link
            href="/"
            className={`rounded-lg px-3.5 py-1.5 text-sm font-medium transition-all ${
              isActive("/")
                ? "bg-foreground/5 text-foreground"
                : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
            }`}
          >
            Início
          </Link>

          {/* Dropdowns */}
          {NAV_GROUPS.map((g) => (
            <Dropdown key={g.key} group={g} pathname={pathname} />
          ))}

          {/* Sobre */}
          <Link
            href="/sobre"
            className={`rounded-lg px-3.5 py-1.5 text-sm font-medium transition-all ${
              isActive("/sobre")
                ? "bg-foreground/5 text-foreground"
                : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
            }`}
          >
            Sobre
          </Link>
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-4">
          <GlobalSearch />
          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 text-muted-foreground hover:text-foreground rounded-lg transition-colors"
              aria-label="Alternar tema"
            >
              {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          )}
          <Link href="/simulador" className="btn-primary py-2 px-5">
            Acessar Simulador
          </Link>
        </div>

        {/* Mobile toggle */}
        <div className="flex items-center gap-2 md:hidden">
          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 text-muted-foreground rounded-lg transition-colors"
            >
              {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          )}
          <button
            onClick={() => setOpen(!open)}
            className="p-2 rounded-lg transition-colors text-muted-foreground"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-border bg-background px-4 py-4 space-y-1">
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className={`block rounded-lg px-3 py-2.5 text-sm font-medium ${
              isActive("/") ? "bg-foreground/5 text-foreground" : "text-muted-foreground"
            }`}
          >
            Início
          </Link>

          {NAV_GROUPS.map((g) => (
            <div key={g.key}>
              <button
                onClick={() => setMobileExpanded(mobileExpanded === g.key ? null : g.key)}
                className="w-full flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground"
              >
                {g.label}
                <ChevronDown
                  size={13}
                  className={`transition-transform ${mobileExpanded === g.key ? "rotate-180" : ""}`}
                />
              </button>
              {mobileExpanded === g.key && (
                <div className="ml-3 mt-0.5 space-y-0.5 border-l border-border pl-3">
                  {g.items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="block rounded-md px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}

          <Link
            href="/sobre"
            onClick={() => setOpen(false)}
            className="block rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground"
          >
            Sobre
          </Link>

          <div className="pt-3">
            <Link
              href="/simulador"
              onClick={() => setOpen(false)}
              className="btn-primary block text-center"
            >
              Acessar Simulador
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
