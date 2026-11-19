'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Lock,
  Unlock,
  ShieldCheck,
  ArrowRight,
  Calculator,
  Terminal,
  Scale,
  FileText,
  Database,
  BookOpen,
  Layers,
  Globe,
  AlertTriangle,
  RefreshCw,
  LogOut,
  Cpu,
  BarChart2,
  DollarSign,
  Search,
  Eye,
  CheckCircle2,
  Filter,
  Command,
  Star,
  Sparkles,
} from 'lucide-react';
import {
  ADMIN_MODULE_CATEGORIES,
  ALL_ADMIN_TOOLS,
  ToolCardMeta,
} from '@/lib/adminModulesCatalog';
import { TeachAndDemonstrateHub } from '@/components/TeachAndDemonstrateHub';
import { PaygramaInteractiveLab } from '@/app/jornada/PaygramaInteractiveLab';
import { OutgoingServerTopologyBlueprint } from '@/app/compliance/outgoing/OutgoingServerTopologyBlueprint';
import ProductMapAtlasClient from '@/app/mapa/produtos/ProductMapAtlasClient';

const ICON_MAP: Record<string, any> = {
  Calculator,
  Terminal,
  Scale,
  FileText,
  Database,
  BookOpen,
  Layers,
  Globe,
  AlertTriangle,
  RefreshCw,
  Cpu,
  BarChart2,
  DollarSign,
  Search,
  ShieldCheck,
  Lock,
  ArrowRight,
};

const DEFAULT_PINNED_IDS = [
  'paygrama-3d-lab',
  'teach-demonstrate-hub',
  'outgoing-eng-lab-suite',
  'c4-server-topology',
  'unified-product-map',
  'outgoing-arquitetura',
  'editor',
  'boletins',
];

type AdminWorkspaceTab =
  | 'teach_demo'
  | 'lab_3d_pix'
  | 'topology_c4'
  | 'product_atlas'
  | 'modules_catalog';

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Top-level 5 Boxes inside /admin
  const [activeAdminTab, setActiveAdminTab] = useState<AdminWorkspaceTab>('teach_demo');

  // Catalog Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>(
    ADMIN_MODULE_CATEGORIES[0]?.category || 'ALL'
  );
  const [pinnedIds, setPinnedIds] = useState<string[]>(DEFAULT_PINNED_IDS);
  const [selectedToolForCompare, setSelectedToolForCompare] = useState<ToolCardMeta>(
    ALL_ADMIN_TOOLS[0]
  );

  useEffect(() => {
    const hasCookie = document.cookie
      .split(';')
      .some((c) => c.trim().startsWith('vs_internal_pass=1'));
    setIsAuthenticated(hasCookie);
    try {
      const savedPins = localStorage.getItem('vs_admin_pinned');
      if (savedPins) {
        const parsed = JSON.parse(savedPins);
        if (Array.isArray(parsed) && parsed.length > 0) setPinnedIds(parsed);
      }
      const savedRole = localStorage.getItem('vs_workbench_role');
      if (savedRole === 'adquirente') setSelectedRole('Adquirente');
      else if (savedRole === 'emissor') setSelectedRole('Emissor');
    } catch {
      // ignore
    }

    const onContextChange = (ev: Event) => {
      const custom = ev as CustomEvent<{ brand?: string; role?: string }>;
      if (custom.detail?.role === 'adquirente') setSelectedRole('Adquirente');
      else if (custom.detail?.role === 'emissor') setSelectedRole('Emissor');
      else if (custom.detail?.role === 'ambos') setSelectedRole('ALL');
    };
    window.addEventListener('workbench-context-change', onContextChange as EventListener);
    return () => {
      window.removeEventListener('workbench-context-change', onContextChange as EventListener);
    };
  }, []);

  const togglePin = (e: React.MouseEvent, toolId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setPinnedIds((prev) => {
      const next = prev.includes(toolId)
        ? prev.filter((id) => id !== toolId)
        : [toolId, ...prev];
      try {
        localStorage.setItem('vs_admin_pinned', JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.trim() === 'vs2026') {
      document.cookie = 'vs_internal_pass=1; path=/; max-age=2592000; SameSite=Lax';
      setIsAuthenticated(true);
      setErrorMsg('');
      window.location.href = '/admin';
    } else {
      setErrorMsg('Chave de acesso incorreta. Tente novamente.');
    }
  };

  const handleLogout = () => {
    document.cookie =
      'vs_internal_pass=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    window.location.href = '/?logout=1';
  };

  const filteredModules = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return ADMIN_MODULE_CATEGORIES.filter((mod) => {
      if (!q && selectedCategory !== 'ALL' && mod.category !== selectedCategory) {
        return false;
      }
      return true;
    })
      .map((mod) => {
        const tools = mod.tools.filter((t) => {
          if (selectedRole !== 'ALL' && !t.roles.includes(selectedRole as any)) {
            return false;
          }
          if (!q) return true;
          const hay =
            `${t.title} ${t.desc} ${t.whatItIs} ${t.badge} ${t.url} ${t.features.join(' ')} ${t.dataSources.join(' ')} ${t.keywords.join(' ')}`.toLowerCase();
          return hay.includes(q);
        });
        return { ...mod, tools };
      })
      .filter((mod) => mod.tools.length > 0);
  }, [searchQuery, selectedRole, selectedCategory]);

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#030711] flex items-center justify-center text-slate-500 text-xs">
        Carregando Cockpit...
      </div>
    );
  }

  // ── Tela de Autenticação para o Proprietário ──
  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-[#030711] flex items-center justify-center p-6">
        <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-[#090e17] p-8 shadow-2xl relative overflow-hidden">
          <div className="text-center space-y-3 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-blue-600/10 border border-blue-500/20 text-blue-400 mx-auto flex items-center justify-center">
              <Lock size={26} />
            </div>
            <h1 className="text-xl font-bold text-white">Cockpit do Proprietário</h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              Área de acesso restrito de Vinícius Sugamele. O público externo visualiza apenas o seu currículo oficial.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                Chave de Acesso Pessoal
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite sua chave secreta..."
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder:text-slate-600 text-sm outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/60 transition-all font-mono"
                autoFocus
              />
              {errorMsg && (
                <p className="text-xs text-red-400 mt-2 font-medium">{errorMsg}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl font-bold text-xs bg-[#1F3FE0] hover:bg-blue-600 text-white flex items-center justify-center gap-2 shadow-md shadow-blue-600/30 transition-all"
            >
              <Unlock size={14} />
              <span>Desbloquear Cockpit</span>
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-800/80 text-center">
            <Link
              href="/"
              className="text-xs text-slate-500 hover:text-slate-300 transition-colors inline-flex items-center gap-1.5"
            >
              <span>Voltar ao Currículo Público</span>
              <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // ── 5 Caixinhas Principais do Cockpit /admin ──
  const topBoxes: {
    id: AdminWorkspaceTab;
    icon: string;
    badge: string;
    title: string;
    desc: string;
  }[] = [
    {
      id: 'teach_demo',
      icon: '🎓',
      badge: 'ENSINAR ⇄ DEMONSTRAR',
      title: '1. Jornada por Produto (Lado a Lado)',
      desc: '6 caixinhas de produtos: explicação simples à esquerda e comparação Certo (✅) vs Errado (❌) à direita.',
    },
    {
      id: 'lab_3d_pix',
      icon: '🌐',
      badge: '10 TRILHAS · 3D',
      title: '2. O Pagamento por Dentro (3D, Pix & 2027)',
      desc: 'Simulador 3D isométrico e sequência (ms): Cartão, Outgoing, Pix SPI, MED 2.0, Boleto e Split LC 214.',
    },
    {
      id: 'topology_c4',
      icon: '🖥️',
      badge: '17 SERVIDORES',
      title: '3. Topologia C4 (Servidores, HSM & Cabos)',
      desc: 'Onde cada servidor passa, se conecta e traduz chaves nas 5 zonas PCI/RSFN + 10-Hop Packet Tracer.',
    },
    {
      id: 'product_atlas',
      icon: '🗺️',
      badge: '26 PRODUTOS',
      title: '4. Mapa de Produtos (4 Bandeiras & BCB 304)',
      desc: 'Visa PID × MC Brand Product × Elo × Amex, onde nasce no BIN (ARDEF/MPE) e modalidades.',
    },
    {
      id: 'modules_catalog',
      icon: '🧰',
      badge: `${ALL_ADMIN_TOOLS.length} MÓDULOS`,
      title: '5. Catálogo Geral de Ferramentas (Lado a Lado)',
      desc: 'Menu por categoria à esquerda e ficha completa Ensinar + Simular de todas as ferramentas à direita.',
    },
  ];

  return (
    <main className="min-h-screen bg-[#F8FAFC] dark:bg-[#030711] pb-24 text-slate-900 dark:text-slate-100">
      {/* Header Limpo do Cockpit (Sem colisão sticky, com IA do Acervo integrada) */}
      <section className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#080d16]">
        <div className="mx-auto max-w-7xl px-6 py-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 font-mono text-[11px] font-black text-emerald-700 dark:text-emerald-300">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                COMMAND CENTER PROPRIETÁRIO · {ALL_ADMIN_TOOLS.length} MÓDULOS ATIVOS
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 font-mono text-[11px] font-bold text-[#1F3FE0] dark:text-blue-300">
                40.129 Docs SQLite · 17.106 Campos · 454 Tarifas · 385 Boletins
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Cockpit Executivo &amp; Laboratório Integrado de Pagamentos
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-3xl">
              Escolha uma das <strong>5 caixinhas abaixo</strong> para navegar por Produto (<em>Ensinar ⇄ Demonstrar</em>), rodar o Simulador 3D, inspecionar a Topologia de Servidores C4, consultar o Mapa de Produtos ou abrir qualquer uma das {ALL_ADMIN_TOOLS.length} ferramentas.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() =>
                window.dispatchEvent(
                  new CustomEvent('open-acervo-ai-drawer', {
                    detail: { query: 'TCR 0 Transaction ID DE 62.2 Downgrade' },
                  })
                )
              }
              className="px-3.5 py-2 rounded-full bg-[#1F3FE0] hover:bg-blue-700 text-white text-xs font-black flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Sparkles size={14} />
              <span>🧠 Abrir IA + Acervo (4 SQLites)</span>
            </button>

            <Link
              href="/editor"
              className="px-3.5 py-2 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all"
            >
              <FileText size={14} />
              <span>Doc Studio</span>
            </Link>

            <Link
              href="/sobre"
              className="px-3.5 py-2 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 hover:border-[#1F3FE0] text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-all"
            >
              <Globe size={13} className="text-[#1F3FE0]" />
              <span>Perfil (/sobre)</span>
            </Link>

            <button
              onClick={handleLogout}
              className="px-3.5 py-2 rounded-full bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 border border-rose-200 dark:border-rose-500/30 text-xs font-bold text-rose-700 dark:text-rose-300 flex items-center gap-1.5 transition-all"
              title="Bloquear e voltar ao modo público"
            >
              <LogOut size={13} />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </section>

      {/* Corpo do Cockpit */}
      <div className="mx-auto max-w-7xl px-6 pt-6 space-y-6">
        {/* =====================================================================
            AS 5 CAIXINHAS PRINCIPAIS DO COCKPIT /ADMIN (1 VISÃO LIMPA POR VEZ)
           ===================================================================== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {topBoxes.map((b) => {
            const active = activeAdminTab === b.id;
            return (
              <button
                key={b.id}
                onClick={() => setActiveAdminTab(b.id)}
                className={`rounded-2xl p-4 text-left border transition-all flex flex-col justify-between gap-2 ${
                  active
                    ? 'bg-[#1F3FE0] text-white border-[#1F3FE0] shadow-md shadow-blue-600/20'
                    : 'bg-white dark:bg-slate-900/90 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:border-[#1F3FE0]'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-1.5">
                    <span className="text-base">{b.icon}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full font-mono text-[9.5px] font-bold ${
                        active
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {b.badge}
                    </span>
                  </div>
                  <div className="text-xs sm:text-sm font-black leading-snug">{b.title}</div>
                </div>
                <p
                  className={`text-[11px] leading-snug ${
                    active ? 'text-blue-100' : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {b.desc}
                </p>
              </button>
            );
          })}
        </div>

        {/* =====================================================================
            CAIXINHA 1: JORNADA POR PRODUTO (ENSINAR ESQUERDA ⇄ DEMONSTRAR DIREITA)
           ===================================================================== */}
        {activeAdminTab === 'teach_demo' && <TeachAndDemonstrateHub />}

        {/* =====================================================================
            CAIXINHA 2: LABORATÓRIO 3D ISOMÉTRICO, SEQUÊNCIA (MS), PIX & 2027+
           ===================================================================== */}
        {activeAdminTab === 'lab_3d_pix' && <PaygramaInteractiveLab />}

        {/* =====================================================================
            CAIXINHA 3: TOPOLOGIA C4 DE 17 SERVIDORES, HSM PAYSHIELD & CABOS
           ===================================================================== */}
        {activeAdminTab === 'topology_c4' && (
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-950 p-4 sm:p-6">
            <OutgoingServerTopologyBlueprint initialBrand="elo" />
          </div>
        )}

        {/* =====================================================================
            CAIXINHA 4: MAPA UNIFICADO DE PRODUTOS DAS 4 BANDEIRAS & TETOS BCB 304
           ===================================================================== */}
        {activeAdminTab === 'product_atlas' && <ProductMapAtlasClient />}

        {/* =====================================================================
            CAIXINHA 5: CATÁLOGO DE MÓDULOS ORGANIZADO LADO A LADO (MENU ESQUERDA ⇄ CARDS + RAIO-X DIREITA)
           ===================================================================== */}
        {activeAdminTab === 'modules_catalog' && (
          <div className="space-y-6">
            {/* Barra de Favoritos Fixados (★) + Busca & Filtro por Papel */}
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/95 p-5 space-y-4 shadow-xs">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-xl">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar entre os 55+ módulos por produto, tabela ou código (ex: Outgoing, 3DS, Pix, MCBS, EMV, CE 3.0, PayFac)..."
                    className="w-full pl-10 pr-4 py-2 rounded-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-[#1F3FE0] focus:outline-none"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white"
                    >
                      Limpar
                    </button>
                  )}
                </div>

                {/* Pílulas de Papel no Arranjo */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] font-bold text-slate-500 mr-1 flex items-center gap-1">
                    <Filter className="w-3 h-3" /> Papel:
                  </span>
                  {[
                    { id: 'ALL', label: `Todos (${ALL_ADMIN_TOOLS.length})` },
                    { id: 'Adquirente', label: 'Adquirente' },
                    { id: 'Emissor', label: 'Emissor' },
                    { id: 'Subcredenciador', label: 'PayFac / Sub' },
                    { id: 'Backoffice', label: 'Conciliação' },
                    { id: 'Regulatório', label: 'Regulatório' },
                  ].map((role) => (
                    <button
                      key={role.id}
                      onClick={() => setSelectedRole(role.id)}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition-all border ${
                        selectedRole === role.id
                          ? 'bg-[#1F3FE0] border-[#1F3FE0] text-white'
                          : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {role.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Favoritos Fixados no Topo */}
              {pinnedIds.length > 0 && !searchQuery && (
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                      <Star size={13} className="fill-amber-400 text-amber-400" />
                      Favoritos Fixados para Acesso Diário ({pinnedIds.length})
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Clique na estrela ★ de qualquer módulo para fixar/desafixar
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                    {pinnedIds
                      .map((id) => ALL_ADMIN_TOOLS.find((t) => t.id === id))
                      .filter((t): t is ToolCardMeta => Boolean(t))
                      .map((tool) => (
                        <Link
                          key={`pin-${tool.id}`}
                          href={tool.url}
                          onMouseEnter={() => setSelectedToolForCompare(tool)}
                          className="group rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/70 hover:border-[#1F3FE0] p-3 flex items-center justify-between gap-2 transition-all"
                        >
                          <div className="min-w-0">
                            <div className="text-xs font-black text-slate-900 dark:text-white group-hover:text-[#1F3FE0] dark:group-hover:text-blue-400 truncate">
                              {tool.title}
                            </div>
                            <div className="font-mono text-[10px] text-slate-500 truncate">
                              {tool.badge} · {tool.url}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => togglePin(e, tool.id)}
                            className="p-1 text-amber-500 hover:bg-amber-500/10 rounded-lg shrink-0"
                            title="Desafixar"
                          >
                            <Star size={13} className="fill-amber-400" />
                          </button>
                        </Link>
                      ))}
                  </div>
                </div>
              )}
            </div>

            {/* PALCO LADO A LADO: ESQUERDA = MENU DE CATEGORIAS (4 COLS) ⇄ DIREITA = MÓDULOS + FICHA ENSINAR/DEMONSTRAR (8 COLS) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Coluna Esquerda (4 cols): Menu Vertical de Categorias em Caixinhas */}
              <div className="lg:col-span-4 space-y-2.5 lg:sticky lg:top-4">
                <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/95 p-4 space-y-2 shadow-xs">
                  <div className="flex items-center justify-between px-1 pb-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="font-mono text-[11px] font-black uppercase tracking-wider text-slate-500">
                      Categorias de Módulos
                    </span>
                    <button
                      onClick={() => setSelectedCategory('ALL')}
                      className={`font-mono text-[11px] font-bold ${
                        selectedCategory === 'ALL'
                          ? 'text-[#1F3FE0] underline'
                          : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      Ver Todas ({ALL_ADMIN_TOOLS.length})
                    </button>
                  </div>

                  {ADMIN_MODULE_CATEGORIES.map((cat) => {
                    const active = !searchQuery && selectedCategory === cat.category;
                    return (
                      <button
                        key={cat.category}
                        onClick={() => {
                          setSearchQuery('');
                          setSelectedCategory(cat.category);
                          if (cat.tools[0]) setSelectedToolForCompare(cat.tools[0]);
                        }}
                        className={`w-full rounded-2xl p-3 text-left border transition-all flex items-start justify-between gap-2 ${
                          active
                            ? 'bg-[#1F3FE0] text-white border-[#1F3FE0] shadow-sm'
                            : 'bg-slate-50/80 dark:bg-slate-950/70 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:border-[#1F3FE0]'
                        }`}
                      >
                        <div className="space-y-0.5 min-w-0">
                          <div className="text-xs font-black leading-snug">
                            {cat.category}
                          </div>
                          <div
                            className={`text-[11px] line-clamp-1 ${
                              active ? 'text-blue-100' : 'text-slate-500'
                            }`}
                          >
                            {cat.subtitle}
                          </div>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-bold shrink-0 ${
                            active
                              ? 'bg-white/20 text-white'
                              : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {cat.tools.length}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Coluna Direita (8 cols): Raio-X Lado a Lado (Ensinar ⇄ Demonstrar) do Módulo em Foco + Grade de Cards da Categoria */}
              <div className="lg:col-span-8 space-y-5">
                {/* Ficha Lado a Lado (Ensinar ⇄ Demonstrar) do Módulo Selecionado */}
                {selectedToolForCompare && (
                  <div className="rounded-3xl border-2 border-[#1F3FE0]/40 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-md space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-[#1F3FE0] dark:text-blue-300 font-mono text-[10px] font-black">
                            RAIO-X LADO A LADO · {selectedToolForCompare.badge}
                          </span>
                          <span className="font-mono text-[11px] text-slate-500">
                            {selectedToolForCompare.url}
                          </span>
                        </div>
                        <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-1">
                          {selectedToolForCompare.title}
                        </h3>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            window.dispatchEvent(
                              new CustomEvent('open-acervo-ai-drawer', {
                                detail: {
                                  query: `${selectedToolForCompare.title} ${selectedToolForCompare.keywords.slice(0, 3).join(' ')}`,
                                },
                              })
                            )
                          }
                          className="px-3 py-1.5 rounded-full border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950 text-[#1F3FE0] dark:text-blue-300 text-xs font-bold"
                        >
                          🧠 Consultar no Acervo
                        </button>
                        <Link
                          href={selectedToolForCompare.url}
                          className="px-4 py-1.5 rounded-full bg-[#1F3FE0] hover:bg-blue-700 text-white text-xs font-black inline-flex items-center gap-1.5"
                        >
                          <span>Abrir Ferramenta</span>
                          <ArrowRight size={13} />
                        </Link>
                      </div>
                    </div>

                    {/* Duas Caixinhas Lado a Lado: 1. O que ensina e resolve | 2. O que demonstra e bases conectadas */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/70 p-4 space-y-2">
                        <div className="font-mono text-[10px] font-black uppercase tracking-wider text-[#1F3FE0] dark:text-blue-400">
                          📘 1. O QUE ENSINA &amp; QUAL PROBLEMA RESOLVE
                        </div>
                        <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
                          {selectedToolForCompare.whatItIs}
                        </p>
                        <div className="flex flex-wrap gap-1 pt-2">
                          {selectedToolForCompare.roles.map((r) => (
                            <span
                              key={r}
                              className="px-2 py-0.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-300"
                            >
                              Papel: {r}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/70 p-4 space-y-2.5">
                        <div className="font-mono text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                          🔬 2. O QUE VOCÊ DEMONSTRA &amp; FONTES SQLITE
                        </div>
                        <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-200">
                          {selectedToolForCompare.features.map((feat, i) => (
                            <li key={i} className="flex items-start gap-1.5 leading-snug">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                              <span>{feat}</span>
                            </li>
                          ))}
                        </ul>
                        <div className="flex flex-wrap gap-1 pt-1 border-t border-slate-200/70 dark:border-slate-800">
                          {selectedToolForCompare.dataSources.map((src, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800 font-mono text-[10px] text-[#1F3FE0] dark:text-blue-300"
                            >
                              {src}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Grade de Cards Limpos da Categoria Selecionada */}
                {filteredModules.map((mod) => (
                  <div key={mod.category} className="space-y-3">
                    <div className="flex items-center justify-between px-1">
                      <h2 className="text-sm font-black uppercase tracking-wider text-slate-800 dark:text-white">
                        {mod.category}
                      </h2>
                      <span className="font-mono text-xs text-slate-500">
                        {mod.tools.length} ferramentas
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      {mod.tools.map((tool) => {
                        const ToolIcon = ICON_MAP[tool.iconName] || Cpu;
                        const isSelected = selectedToolForCompare?.id === tool.id;
                        const isPinned = pinnedIds.includes(tool.id);

                        return (
                          <div
                            key={tool.id}
                            onMouseEnter={() => setSelectedToolForCompare(tool)}
                            onClick={() => setSelectedToolForCompare(tool)}
                            className={`rounded-2xl border p-4 transition-all flex flex-col justify-between gap-3 cursor-pointer ${
                              isSelected
                                ? 'bg-blue-50/40 dark:bg-blue-950/30 border-[#1F3FE0] shadow-xs'
                                : 'bg-white dark:bg-slate-900/90 border-slate-200 dark:border-slate-800 hover:border-[#1F3FE0]'
                            }`}
                          >
                            <div className="space-y-2">
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 text-[#1F3FE0] dark:text-blue-400 flex items-center justify-center">
                                    <ToolIcon size={15} />
                                  </div>
                                  <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 font-mono text-[10px] font-bold text-slate-700 dark:text-slate-300">
                                    {tool.badge}
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  onClick={(e) => togglePin(e, tool.id)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-amber-500"
                                  title="Fixar nos Favoritos"
                                >
                                  <Star
                                    size={13}
                                    className={isPinned ? 'fill-amber-400 text-amber-400' : ''}
                                  />
                                </button>
                              </div>

                              <h3 className="text-sm font-black text-slate-900 dark:text-white leading-snug">
                                {tool.title}
                              </h3>
                              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                                {tool.desc}
                              </p>
                            </div>

                            <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                              <span className="font-mono text-[10px] text-slate-400 truncate">
                                {tool.url}
                              </span>
                              <Link
                                href={tool.url}
                                onClick={(e) => e.stopPropagation()}
                                className="px-3 py-1 rounded-full bg-[#1F3FE0] hover:bg-blue-700 text-white text-xs font-bold inline-flex items-center gap-1 shrink-0"
                              >
                                <span>Abrir</span>
                                <ArrowRight size={11} />
                              </Link>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
