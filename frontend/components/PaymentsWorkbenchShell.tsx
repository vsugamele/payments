'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Layers,
  ShieldCheck,
  Database,
  Calculator,
  FileText,
  Cpu,
  CheckCircle2,
  BookOpen,
  Terminal,
  Sparkles,
  Building2,
  CreditCard,
  Compass,
} from 'lucide-react';

export type GlobalBrandFilter = 'ALL' | 'visa' | 'mastercard' | 'elo' | 'amex';
export type GlobalRoleFilter = 'ambos' | 'adquirente' | 'emissor';

interface NavItem {
  id: string;
  label: string;
  badge?: string;
  href: string;
  matchTab?: string;
}

interface NavGroup {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  items: NavItem[];
}

const WORKBENCH_GROUPS: NavGroup[] = [
  {
    id: 'auth-sec',
    number: '01',
    title: 'Autorização & Segurança',
    subtitle: 'ISO 8583 · 3DS · Tokens · AES',
    items: [
      {
        id: 'nav-bitmap',
        label: 'Mapa de Bits (128b Auth × Clearing)',
        badge: 'ISO',
        href: '/compliance/outgoing?tab=bitmap',
        matchTab: 'bitmap',
      },
      {
        id: 'nav-campos',
        label: 'Catálogo de Campos ISO / PDS',
        badge: 'DEs',
        href: '/compliance/campos',
      },
      {
        id: 'nav-3ds',
        label: '3-D Secure 2.2 & CAVV v9',
        badge: 'CNP',
        href: '/compliance/3ds',
      },
      {
        id: 'nav-tokens',
        label: 'Tokenização (VTS / MDES / Elo)',
        badge: 'TKN',
        href: '/compliance/tokenizacao',
      },
      {
        id: 'nav-retentativas',
        label: 'Retentativas & MIT / CIT',
        href: '/compliance/retentativas',
      },
    ],
  },
  {
    id: 'clearing-outgoing',
    number: '02',
    title: 'Clearing & Outgoing',
    subtitle: 'Tabelas 168B/TLV · Fluxos · Lote Real',
    items: [
      {
        id: 'nav-tables',
        label: 'Tabelas de Outgoing (Separadas)',
        badge: '28+7',
        href: '/compliance/outgoing?tab=tables',
        matchTab: 'tables',
      },
      {
        id: 'nav-flows',
        label: '8 Fluxos Ponta a Ponta',
        badge: '8 FLX',
        href: '/compliance/outgoing?tab=flows',
        matchTab: 'flows',
      },
      {
        id: 'nav-matrix',
        label: 'Matriz Tabelas × 8 Fluxos',
        badge: 'M/C/O',
        href: '/compliance/outgoing?tab=matrix',
        matchTab: 'matrix',
      },
      {
        id: 'nav-sandbox',
        label: 'Sandbox de Gatilhos [C ➔ M]',
        badge: 'LIVE',
        href: '/compliance/outgoing?tab=sandbox',
        matchTab: 'sandbox',
      },
      {
        id: 'nav-validator',
        label: 'Parser Forense de Lote Real (PCI)',
        badge: '168B',
        href: '/compliance/outgoing?tab=validator',
        matchTab: 'validator',
      },
      {
        id: 'nav-industry',
        label: 'Setores (IATA · Hotel · Locadora)',
        badge: 'ADD',
        href: '/compliance/outgoing?tab=industry',
        matchTab: 'industry',
      },
    ],
  },
  {
    id: 'settlement-reports',
    number: '03',
    title: 'Liquidação & Reports',
    subtitle: 'T+0 Crítica · D+1 SLC/B3 · MCBS',
    items: [
      {
        id: 'nav-reports',
        label: 'Reports Diários (VSS / VCX / T112)',
        badge: '21 REP',
        href: '/compliance/outgoing?tab=reports',
        matchTab: 'reports',
      },
      {
        id: 'nav-conciliacao',
        label: 'Conciliação & Agenda SLC/B3',
        badge: 'D+1',
        href: '/compliance/conciliacao',
      },
      {
        id: 'nav-mcbs',
        label: 'Faturas MCBS (TN3A / GLB 12332.5)',
        badge: 'TN3A',
        href: '/mcbs',
      },
      {
        id: 'nav-mpe',
        label: 'Tabelas MPE / T068 Forense',
        href: '/compliance/mpe-forense',
      },
    ],
  },
  {
    id: 'interchange-pricing',
    number: '04',
    title: 'Intercâmbio & Pricing',
    subtitle: 'Simulador MDR · Downgrade R$ · Amex',
    items: [
      {
        id: 'nav-downgrade-amex',
        label: 'Calculadora Downgrade (R$) & Amex',
        badge: 'R$ + AX',
        href: '/compliance/outgoing?tab=downgrade_amex',
        matchTab: 'downgrade_amex',
      },
      {
        id: 'nav-simulador',
        label: 'Simulador de Intercâmbio & MDR',
        badge: 'CALC',
        href: '/simulador',
      },
      {
        id: 'nav-fees',
        label: 'Scheme Fees & 454 Billing Lines',
        badge: '454',
        href: '/compliance/fees',
      },
      {
        id: 'nav-tarifas-reais',
        label: 'Tarifas Curadas & Tetos BCB',
        badge: 'BCB',
        href: '/compliance/tarifas-reais',
      },
    ],
  },
  {
    id: 'governance-acervo',
    number: '05',
    title: 'Governança, Releases & Acervo',
    subtitle: 'Boletins 2027 · 40k Docs · Waivers',
    items: [
      {
        id: 'nav-boletins',
        label: 'Central de Boletins 3 Lentes + CSV',
        badge: '385',
        href: '/compliance/boletins',
      },
      {
        id: 'nav-acervo-plug',
        label: 'Acervo Plugado & 6 Filas (17k Campos)',
        badge: '6 FILAS',
        href: '/compliance/outgoing?tab=acervo',
        matchTab: 'acervo',
      },
      {
        id: 'nav-acervo-rag',
        label: 'Explorador RAG (40.129 Ativos)',
        badge: 'FTS5',
        href: '/acervo',
      },
      {
        id: 'nav-disputes',
        label: 'Disputas & Chargebacks (CE 3.0)',
        badge: 'CBK',
        href: '/compliance/outgoing?tab=disputes',
        matchTab: 'disputes',
      },
      {
        id: 'nav-programs',
        label: 'Programas (BRAM · VAMP · GDIP)',
        badge: '18 PRG',
        href: '/compliance/outgoing?tab=programs',
        matchTab: 'programs',
      },
      {
        id: 'nav-waivers',
        label: 'Gerador de Dossiê de Waiver & RCA',
        badge: 'RCA',
        href: '/compliance/outgoing?tab=waivers',
        matchTab: 'waivers',
      },
      {
        id: 'nav-education',
        label: 'Academy & Trilha Educativa',
        badge: '5 MÓD',
        href: '/compliance/outgoing?tab=education',
        matchTab: 'education',
      },
      {
        id: 'nav-admin',
        label: 'Cockpit Geral (Todos os Módulos)',
        href: '/admin',
      },
    ],
  },
];

const WORKBENCH_PATH_PREFIXES = [
  '/compliance',
  '/acervo',
  '/simulador',
  '/admin',
  '/mapa',
  '/mcbs',
  '/mdr',
  '/billing',
  '/chargeback',
  '/trilhas',
  '/editor',
  '/consultas',
  '/glossario',
  '/arquitetura',
  '/comparativo',
  '/jornada',
];

export function PaymentsWorkbenchShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || '/';
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [globalBrand, setGlobalBrand] = useState<GlobalBrandFilter>('ALL');
  const [globalRole, setGlobalRole] = useState<GlobalRoleFilter>('ambos');
  const [currentTabParam, setCurrentTabParam] = useState<string>('tables');

  const isWorkbenchRoute = WORKBENCH_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const sp = new URLSearchParams(window.location.search);
    const t = sp.get('tab');
    if (t) setCurrentTabParam(t);

    const onPop = () => {
      const spNow = new URLSearchParams(window.location.search);
      setCurrentTabParam(spNow.get('tab') || 'tables');
    };
    const onTabSync = (ev: Event) => {
      const custom = ev as CustomEvent<{ tab?: string; brand?: GlobalBrandFilter }>;
      if (custom.detail?.tab) setCurrentTabParam(custom.detail.tab);
      if (custom.detail?.brand) setGlobalBrand(custom.detail.brand);
    };
    window.addEventListener('popstate', onPop);
    window.addEventListener('outgoing-tab-changed', onTabSync as EventListener);
    return () => {
      window.removeEventListener('popstate', onPop);
      window.removeEventListener('outgoing-tab-changed', onTabSync as EventListener);
    };
  }, [pathname]);

  const handleSelectGlobalBrand = (brand: GlobalBrandFilter) => {
    setGlobalBrand(brand);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('workbench-context-change', {
          detail: { brand, role: globalRole },
        })
      );
    }
  };

  const handleSelectGlobalRole = (role: GlobalRoleFilter) => {
    setGlobalRole(role);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('workbench-context-change', {
          detail: { brand: globalBrand, role },
        })
      );
    }
  };

  const handleNavigateItem = (item: NavItem, e: React.MouseEvent) => {
    if (item.matchTab && pathname === '/compliance/outgoing') {
      e.preventDefault();
      setCurrentTabParam(item.matchTab);
      window.history.replaceState(null, '', `/compliance/outgoing?tab=${item.matchTab}`);
      window.dispatchEvent(
        new CustomEvent('workbench-navigate-outgoing-tab', {
          detail: { tab: item.matchTab },
        })
      );
    } else if (item.matchTab) {
      setCurrentTabParam(item.matchTab);
    }
  };

  if (!isWorkbenchRoute) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100">
      {/* =====================================================================
          BARRA SUPERIOR DE CONTEXTO GLOBAL DO WORKBENCH (PERSISTENTE)
         ===================================================================== */}
      <div className="sticky top-[57px] z-40 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-xs">
        <div className="max-w-[1680px] mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
          {/* Esquerda: Botão Sidebar + Identidade do Workbench */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarCollapsed((prev) => !prev)}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:border-blue-500 text-slate-700 dark:text-slate-200 transition-all flex items-center gap-1.5 text-xs font-bold"
              title={sidebarCollapsed ? 'Expandir Menu de Estações' : 'Recolher Menu Lateral'}
            >
              {sidebarCollapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
              <span className="hidden sm:inline">
                {sidebarCollapsed ? 'Abrir Menu (5 Estações)' : 'Estações'}
              </span>
            </button>

            <div className="hidden xl:flex items-center gap-2 border-l border-slate-200 dark:border-slate-800 pl-3">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-xs font-black tracking-tight text-slate-800 dark:text-slate-100">
                Payments Workbench 2.0
              </span>
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                40.129 Docs · 17.106 Campos PDF · 385 Releases
              </span>
            </div>
          </div>

          {/* Centro: Seletor Global de Bandeira & Papel */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Filtro Global de Bandeira */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 px-2 hidden md:inline">
                Bandeira:
              </span>
              {(
                [
                  { id: 'ALL', label: 'Todas' },
                  { id: 'visa', label: 'Visa' },
                  { id: 'mastercard', label: 'Mastercard' },
                  { id: 'elo', label: 'Elo' },
                  { id: 'amex', label: 'Amex' },
                ] as const
              ).map((b) => {
                const active = globalBrand === b.id;
                return (
                  <button
                    key={b.id}
                    onClick={() => handleSelectGlobalBrand(b.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      active
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800'
                    }`}
                  >
                    {b.label}
                  </button>
                );
              })}
            </div>

            {/* Filtro Global de Papel */}
            <div className="hidden lg:flex items-center gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 px-2">
                Lente:
              </span>
              {(
                [
                  { id: 'ambos', label: 'Ambos' },
                  { id: 'adquirente', label: 'Adquirente / PayFac' },
                  { id: 'emissor', label: 'Emissor' },
                ] as const
              ).map((r) => {
                const active = globalRole === r.id;
                return (
                  <button
                    key={r.id}
                    onClick={() => handleSelectGlobalRole(r.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      active
                        ? 'bg-slate-900 dark:bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800'
                    }`}
                  >
                    {r.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Direita: Atalhos Rápidos + Busca Ctrl+K */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.dispatchEvent(new Event('open-global-command-palette'))}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:border-blue-500 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2 transition-all"
            >
              <Search size={13} className="text-blue-600" />
              <span className="hidden sm:inline">Ir para Tabela, Campo ou Report</span>
              <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono text-[10px]">
                Ctrl+K
              </kbd>
            </button>
          </div>
        </div>
      </div>

      {/* =====================================================================
          CORPO DO WORKBENCH: SIDEBAR ESQUERDA (5 ESTAÇÕES) + PALCO CENTRAL
         ===================================================================== */}
      <div className="flex-1 flex max-w-[1680px] w-full mx-auto">
        {/* Sidebar Esquerda das 5 Estações do Ciclo da Transação */}
        {!sidebarCollapsed && (
          <aside className="hidden lg:block w-[272px] shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-4 space-y-5 sticky top-[110px] self-start max-h-[calc(100vh-115px)] overflow-y-auto">
            {WORKBENCH_GROUPS.map((group) => (
              <div key={group.id} className="space-y-1.5">
                <div className="px-2 pb-1 border-b border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[11px] font-black text-blue-600 dark:text-blue-400">
                      {group.number}.
                    </span>
                    <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-100">
                      {group.title}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
                    {group.subtitle}
                  </p>
                </div>

                <div className="space-y-0.5 pt-0.5">
                  {group.items.map((item) => {
                    const isOutgoingRoute = pathname === '/compliance/outgoing';
                    const isActive = item.matchTab
                      ? isOutgoingRoute && currentTabParam === item.matchTab
                      : pathname === item.href;

                    return (
                      <Link
                        key={item.id}
                        href={item.href}
                        onClick={(e) => handleNavigateItem(item, e)}
                        className={`group flex items-center justify-between gap-2 px-2.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                          isActive
                            ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-black border-l-3 border-blue-600'
                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900'
                        }`}
                      >
                        <span className="truncate">{item.label}</span>
                        {item.badge && (
                          <span
                            className={`px-1.5 py-0.5 rounded font-mono text-[10px] font-bold shrink-0 ${
                              isActive
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </aside>
        )}

        {/* Palco Central */}
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}
