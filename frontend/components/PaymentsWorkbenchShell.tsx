'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  FileText,
  Sparkles,
} from 'lucide-react';
import { AcervoAiGlobalDrawer } from './AcervoAiGlobalDrawer';

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
    subtitle: 'ISO 8583 · EMV · 3DS · Tokens · AES',
    items: [
      {
        id: 'nav-jornada-3d',
        label: 'O Pagamento por Dentro (Lab 3D · Pix · 2027+)',
        badge: '3D + PIX',
        href: '/jornada',
      },
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
        id: 'nav-emv',
        label: 'Decodificador EMV (TVR Tag 95 · 40b)',
        badge: 'EMV',
        href: '/compliance/emv',
      },
      {
        id: 'nav-softpos',
        label: 'Tap to Phone (SoftPOS / MPoC)',
        badge: 'NFC',
        href: '/compliance/softpos',
      },
      {
        id: 'nav-linter',
        label: 'Linter & Validador ISO / IPM',
        href: '/compliance/linter',
      },
      {
        id: 'nav-retentativas',
        label: 'Retentativas & MIT / CIT (SCOF)',
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
        id: 'nav-eng-lab',
        label: 'Suíte Engenharia & QA (Massa · Rejects · 4-Way · Diff)',
        badge: '5 LABS',
        href: '/compliance/outgoing?tab=eng_lab',
        matchTab: 'eng_lab',
      },
      {
        id: 'nav-industry',
        label: 'Setores (IATA · Hotel · Locadora)',
        badge: 'ADD',
        href: '/compliance/outgoing?tab=industry',
        matchTab: 'industry',
      },
      {
        id: 'nav-subcredenciadores',
        label: 'Subcredenciadores & PayFac (PF/Sub)',
        href: '/compliance/subcredenciadores',
      },
      {
        id: 'nav-arquivos',
        label: 'Central de Arquivos & Layouts',
        href: '/compliance/arquivos',
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
        id: 'nav-settlement',
        label: 'Settlement D+0/D+1 & CIP',
        href: '/compliance/settlement',
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
      {
        id: 'nav-atlas-liquidacao',
        label: 'Atlas Gráfico VisaNet & MCBS',
        href: '/mapa/liquidacao',
      },
      {
        id: 'nav-payouts',
        label: 'Push Payments (Visa Direct / OCT / AFT)',
        href: '/compliance/payouts',
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
        id: 'nav-mapa-produtos',
        label: 'Mapa de Produtos (PID / MC / Elo / Amex)',
        badge: '4 BND',
        href: '/mapa/produtos',
      },
      {
        id: 'nav-downgrade-amex',
        label: 'Calculadora Downgrade (R$) & Amex',
        badge: 'R$ + AX',
        href: '/compliance/outgoing?tab=downgrade_amex',
        matchTab: 'downgrade_amex',
      },
      {
        id: 'nav-provisionamento',
        label: 'Motor de Provisionamento (141 Regras)',
        badge: '141',
        href: '/compliance/provisionamento',
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
        label: 'Tarifas Reais (1.128 Alíquotas + MCC)',
        badge: '1.128',
        href: '/compliance/tarifas-reais',
      },
      {
        id: 'nav-mdr',
        label: 'Anatomia do MDR & Split',
        href: '/mdr',
      },
      {
        id: 'nav-matrix-decisao',
        label: 'Matriz de Decisão (5 Passos)',
        href: '/matrix',
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
        label: 'Hub de Releases & Boletins (3 Lentes)',
        badge: '385',
        href: '/compliance/boletins',
      },
      {
        id: 'nav-acervo-rag',
        label: 'Hub do Acervo & Regulatório (40k PDFs)',
        badge: 'FTS5',
        href: '/acervo',
      },
      {
        id: 'nav-acervo-plug',
        label: 'Acervo Plugado & 6 Filas (17k Campos)',
        badge: '6 FILAS',
        href: '/compliance/outgoing?tab=acervo',
        matchTab: 'acervo',
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
        id: 'nav-doc-studio',
        label: 'Doc Studio & Editor Executivo RAG',
        badge: 'DOC',
        href: '/editor',
      },
      {
        id: 'nav-perfil-sobre',
        label: 'Perfil Executivo & Portfólio (/sobre)',
        badge: 'BIO',
        href: '/sobre',
      },
      {
        id: 'nav-compliance-hub',
        label: 'Cockpit de Compliance & Governança',
        href: '/compliance',
      },
      {
        id: 'nav-admin',
        label: 'Cockpit Geral (Todos os Módulos)',
        href: '/admin',
      },
    ],
  },
];

const PRIVATE_WORKBENCH_PREFIXES = [
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
  '/arquitetura',
  '/comparativo',
  '/validador',
  '/comparador',
  '/inspecao-tecnica',
  '/liquidacao',
  '/parcelado',
  '/mpe',
  '/scheme-fees',
];

const HYBRID_PUBLIC_PREFIXES = ['/jornada', '/consultas', '/glossario'];

export function PaymentsWorkbenchShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || '/';
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarViewMode, setSidebarViewMode] = useState<'product_boxes' | 'technical_stations'>('product_boxes');
  const [globalBrand, setGlobalBrand] = useState<GlobalBrandFilter>('ALL');
  const [globalRole, setGlobalRole] = useState<GlobalRoleFilter>('ambos');
  const [currentTabParam, setCurrentTabParam] = useState<string>('tables');
  const [isOwner, setIsOwner] = useState(false);

  const isPrivateWorkbench = PRIVATE_WORKBENCH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
  const isHybridRoute = HYBRID_PUBLIC_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
  const isWorkbenchRoute = isPrivateWorkbench || (isHybridRoute && isOwner);

  // Carrega Bandeira, Papel e cookie de proprietário ao montar
  useEffect(() => {
    if (typeof window === 'undefined') return;
    setIsOwner(
      document.cookie.split(';').some((c) => c.trim().startsWith('vs_internal_pass=1'))
    );
    const savedBrand = localStorage.getItem('vs_workbench_brand') as GlobalBrandFilter | null;
    const savedRole = localStorage.getItem('vs_workbench_role') as GlobalRoleFilter | null;
    if (savedBrand && ['ALL', 'visa', 'mastercard', 'elo', 'amex'].includes(savedBrand)) {
      setGlobalBrand(savedBrand);
    }
    if (savedRole && ['ambos', 'adquirente', 'emissor'].includes(savedRole)) {
      setGlobalRole(savedRole);
    }
  }, [pathname]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const sp = new URLSearchParams(window.location.search);
    const t = sp.get('tab');
    if (t) setCurrentTabParam(t);

    // Re-emite o contexto global quando a rota muda para sincronizar a página recém-aberta
    const timer = setTimeout(() => {
      window.dispatchEvent(
        new CustomEvent('workbench-context-change', {
          detail: { brand: globalBrand, role: globalRole },
        })
      );
    }, 60);

    const onPop = () => {
      const spNow = new URLSearchParams(window.location.search);
      setCurrentTabParam(spNow.get('tab') || 'tables');
    };
    const onTabSync = (ev: Event) => {
      const custom = ev as CustomEvent<{ tab?: string; brand?: GlobalBrandFilter }>;
      if (custom.detail?.tab) setCurrentTabParam(custom.detail.tab);
      if (custom.detail?.brand) {
        setGlobalBrand(custom.detail.brand);
        localStorage.setItem('vs_workbench_brand', custom.detail.brand);
      }
    };
    window.addEventListener('popstate', onPop);
    window.addEventListener('outgoing-tab-changed', onTabSync as EventListener);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('popstate', onPop);
      window.removeEventListener('outgoing-tab-changed', onTabSync as EventListener);
    };
  }, [pathname, globalBrand, globalRole]);

  const handleSelectGlobalBrand = (brand: GlobalBrandFilter) => {
    setGlobalBrand(brand);
    if (typeof window !== 'undefined') {
      localStorage.setItem('vs_workbench_brand', brand);
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
      localStorage.setItem('vs_workbench_role', role);
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
          BARRA SUPERIOR ÚNICA DE CONTEXTO GLOBAL DO WORKBENCH (TOP-0)
         ===================================================================== */}
      <div className="sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-xs">
        <div className="max-w-[1680px] mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
          {/* Esquerda: Logo VS Portfólio + Botão Sidebar + Identidade do Workbench */}
          <div className="flex items-center gap-2.5">
            <Link
              href="/"
              className="flex items-center gap-2 pr-2.5 border-r border-slate-200 dark:border-slate-800 group"
              title="Voltar ao Site Editorial Principal"
            >
              <div className="w-7 h-7 rounded-lg bg-[#222225] dark:bg-zinc-100 flex items-center justify-center text-white dark:text-zinc-900 font-semibold text-xs transition-opacity group-hover:opacity-85">
                VS
              </div>
              <span className="hidden md:inline text-xs font-semibold text-slate-700 dark:text-slate-200 group-hover:text-foreground">
                Início
              </span>
            </Link>

            <button
              onClick={() => setSidebarCollapsed((prev) => !prev)}
              className="p-1.5 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:border-blue-500 text-slate-700 dark:text-slate-200 transition-all flex items-center gap-1.5 text-xs font-bold"
              title={sidebarCollapsed ? 'Expandir Menu de Estações' : 'Recolher Menu Lateral'}
            >
              {sidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
              <span className="hidden sm:inline">
                {sidebarCollapsed ? 'Abrir Menu (5 Estações)' : '5 Estações'}
              </span>
            </button>

            <div className="hidden 2xl:flex items-center gap-2 border-l border-slate-200 dark:border-slate-800 pl-3">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-xs font-black tracking-tight text-slate-800 dark:text-slate-100">
                Workbench 2.0
              </span>
              <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                40.129 Docs · 17.106 Campos PDF · 385 Releases
              </span>
            </div>
          </div>

          {/* Centro: Seletor Global Persistente de Bandeira & Papel */}
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

          {/* Direita: IA + Acervo + Doc Studio + Busca Ctrl+K + Tema */}
          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                window.dispatchEvent(
                  new CustomEvent('open-acervo-ai-drawer', {
                    detail: {
                      bandeira: globalBrand === 'ALL' ? undefined : globalBrand,
                    },
                  })
                )
              }
              className="px-3 py-1.5 rounded-xl bg-[#1F3FE0] hover:bg-blue-700 text-white text-xs font-black flex items-center gap-1.5 shadow-xs transition-all"
              title="Abrir IA Conectada ao Sistema de Acervo (Alt+A)"
            >
              <Sparkles size={13} />
              <span>IA + Acervo</span>
              <kbd className="hidden md:inline-block px-1 py-0.5 rounded bg-white/15 font-mono text-[10px]">
                Alt+A
              </kbd>
            </button>

            <Link
              href="/editor"
              className="hidden xl:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:border-slate-400 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-all"
              title="Abrir Doc Studio & Editor Executivo"
            >
              <FileText size={13} />
              <span>Doc Studio</span>
            </Link>

            <button
              onClick={() => window.dispatchEvent(new Event('open-global-command-palette'))}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:border-blue-500 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2 transition-all"
            >
              <Search size={13} className="text-blue-600" />
              <span className="hidden sm:inline">Buscar Tabela, Campo ou PDF</span>
              <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono text-[10px]">
                Ctrl+K
              </kbd>
            </button>

            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-blue-500 transition-colors"
              aria-label="Alternar tema"
              title="Alternar Tema Claro (Paper & Precision) / Escuro"
            >
              <Sun size={14} className="hidden dark:block text-amber-400" />
              <Moon size={14} className="block dark:hidden text-slate-700" />
            </button>
          </div>
        </div>
      </div>

      {/* =====================================================================
          CORPO DO WORKBENCH: SIDEBAR ESQUERDA (5 ESTAÇÕES) + PALCO CENTRAL
         ===================================================================== */}
      <div className="flex-1 flex max-w-[1680px] w-full mx-auto">
        {/* Sidebar Esquerda: Modo Por Produto (Caixinhas Ensinar + Demonstrar) vs 5 Estações Técnicas */}
        {!sidebarCollapsed && (
          <aside className="hidden lg:block w-[286px] shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-3.5 space-y-4 sticky top-[53px] self-start max-h-[calc(100vh-55px)] overflow-y-auto">
            {/* Toggle de Organização do Menu: Por Produto (Caixinhas) vs 5 Estações (Engenharia) */}
            <div className="rounded-2xl bg-slate-100 dark:bg-slate-950 p-1 border border-slate-200 dark:border-slate-800 grid grid-cols-2 gap-1">
              <button
                onClick={() => setSidebarViewMode('product_boxes')}
                className={`py-1.5 px-2 rounded-xl text-[11px] font-black transition-all ${
                  sidebarViewMode === 'product_boxes'
                    ? 'bg-[#1F3FE0] text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                🎓 Por Produto
              </button>
              <button
                onClick={() => setSidebarViewMode('technical_stations')}
                className={`py-1.5 px-2 rounded-xl text-[11px] font-black transition-all ${
                  sidebarViewMode === 'technical_stations'
                    ? 'bg-[#1F3FE0] text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                🛠️ 5 Estações
              </button>
            </div>

            {sidebarViewMode === 'product_boxes' ? (
              <div className="space-y-2.5">
                <div className="px-1">
                  <div className="font-mono text-[10px] font-black uppercase tracking-wider text-[#1F3FE0] dark:text-blue-400">
                    Jornada Ensinar + Demonstrar
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                    Escolha o produto para aprender o conceito ou testar ao vivo:
                  </p>
                </div>

                {[
                  {
                    icon: '💳',
                    num: '01',
                    title: 'Cartão Presencial (Chip & NFC)',
                    desc: 'EMV ARQC/ARPC, PIN HSM (:1500) & SoftPOS Tap on Phone',
                    teachHref: '/acervo',
                    demoHref: '/jornada?track=cartao',
                    tools: [
                      { label: 'Decodificador EMV (40b)', href: '/compliance/emv' },
                      { label: 'Tap to Phone (SoftPOS)', href: '/compliance/softpos' },
                    ],
                  },
                  {
                    icon: '🔐',
                    num: '02',
                    title: 'Cartão Online (3DS & Tokens)',
                    desc: '3DS 2.2 CAVV v9, VTS/MDES, Passkeys & Recorrência MIT',
                    teachHref: '/trilhas',
                    demoHref: '/compliance/3ds',
                    tools: [
                      { label: 'Network Tokens (VTS/MDES)', href: '/compliance/tokenizacao' },
                      { label: 'Retentativas & MIT/CIT', href: '/compliance/retentativas' },
                    ],
                  },
                  {
                    icon: '📦',
                    num: '03',
                    title: 'Clearing, Outgoing & CIP/SLC',
                    desc: '35 Tabelas (.CTF/.IPM/.TXT), Registradora B3 & ASLC026',
                    teachHref: '/compliance/outgoing?tab=education',
                    demoHref: '/compliance/outgoing?tab=tables',
                    tools: [
                      { label: 'Suíte QA & Gerador .CTF/.IPM', href: '/compliance/outgoing?tab=eng_lab' },
                      { label: 'Topologia C4 (17 Servidores)', href: '/arquitetura' },
                    ],
                  },
                  {
                    icon: '💰',
                    num: '04',
                    title: 'Produtos, Preço MDR & Faturas',
                    desc: 'Visa PID, MC Brand Product, Teto BCB 304, Downgrade & MCBS',
                    teachHref: '/mapa/produtos',
                    demoHref: '/compliance/outgoing?tab=downgrade_amex',
                    tools: [
                      { label: 'Simulador MDR & Intercâmbio', href: '/simulador' },
                      { label: 'Faturas MCBS & Scheme Fees', href: '/mcbs' },
                    ],
                  },
                  {
                    icon: '⚡',
                    num: '05',
                    title: 'Pix (SPI), NFC, MED 2.0 & Boleto',
                    desc: 'pacs.008, DICT, Pix Automático, Grafo MED 2.0 & SILOC/STR',
                    teachHref: '/jornada?track=pix_spi',
                    demoHref: '/jornada?track=med_seguranca',
                    tools: [
                      { label: 'Pix Automático & NFC (JSR)', href: '/jornada?track=pix_auto_nfc' },
                      { label: 'Boleto NPC (SILOC vs STR)', href: '/jornada?track=boleto_npc' },
                    ],
                  },
                  {
                    icon: '📜',
                    num: '06',
                    title: 'Disputas CE 3.0 & Reforma 2027',
                    desc: 'Chargebacks, VAMP/ECP, Boletins & Split Tributário LC 214',
                    teachHref: '/compliance/boletins',
                    demoHref: '/jornada?track=regras_2027_tempo&split2027=1',
                    tools: [
                      { label: 'Árvore Disputas & CE 3.0', href: '/compliance/outgoing?tab=disputes' },
                      { label: 'Doc Studio & Editor IA', href: '/editor' },
                    ],
                  },
                ].map((box) => (
                  <div
                    key={box.num}
                    className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/70 p-3 space-y-2 hover:border-[#1F3FE0] transition-all"
                  >
                    <div className="flex items-center justify-between gap-1.5">
                      <span className="text-xs font-black text-slate-900 dark:text-white">
                        {box.icon} {box.num}. {box.title}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                      {box.desc}
                    </p>

                    {/* Dupla Ação Lado a Lado: 1. Ensinar | 2. Demonstrar */}
                    <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                      <Link
                        href={box.teachHref}
                        className="px-2 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/70 hover:bg-blue-100 border border-blue-200 dark:border-blue-800 text-[10px] font-black text-[#1F3FE0] dark:text-blue-300 text-center"
                      >
                        📘 1. Ensinar
                      </Link>
                      <Link
                        href={box.demoHref}
                        className="px-2 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-800 text-[10px] font-black text-emerald-700 dark:text-emerald-300 text-center"
                      >
                        🔬 2. Demonstrar
                      </Link>
                    </div>

                    {/* Atalhos Rápidos do Produto */}
                    <div className="flex flex-col gap-1 pt-1 border-t border-slate-200/60 dark:border-slate-800/80">
                      {box.tools.map((tl) => (
                        <Link
                          key={tl.href}
                          href={tl.href}
                          className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:text-[#1F3FE0] dark:hover:text-blue-400 flex items-center justify-between"
                        >
                          <span className="truncate">• {tl.label}</span>
                          <span className="font-mono text-[10px]">→</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              WORKBENCH_GROUPS.map((group) => (
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
            ))
            )}
          </aside>
        )}

        {/* Palco Central */}
        <div className="flex-1 min-w-0">{children}</div>
      </div>

      {/* Drawer Global da IA Conectada ao Sistema de Acervo (acervo.sqlite3 + campos.sqlite3 + tarifas.sqlite3) */}
      <AcervoAiGlobalDrawer />
    </div>
  );
}
