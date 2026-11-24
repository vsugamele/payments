'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  Search,
  ZoomIn,
  ZoomOut,
  Maximize2,
  X,
  ExternalLink,
  Sparkles,
  FileText,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Network,
  LayoutGrid,
  Filter,
  Scale,
} from 'lucide-react';
import mapaDataRaw from '@/data/mapa-regulatorio-cartao.json';
import { sendToDocStudio } from '@/lib/docStudioBridge';

export interface RegulatorioAto {
  id: string;
  l: string;
  org: string;
  tipo: string;
  data: string;
  em: string;
  temas: string[];
  pap: string;
  sit: string;
  pri: string;
  ori: string;
  obs?: string;
  lig?: string;
  at?: string;
  url?: string;
  fr?: string;
  ob?: [string, string][];
  vg?: string;
  ca?: { altera: string[]; por: string[] };
}

export interface RegulatorioTema {
  nome: string;
  grupo: string;
  ids: string[];
}

interface MapaDataset {
  atos: RegulatorioAto[];
  temas: RegulatorioTema[];
  gerado: string;
}

const DATA = mapaDataRaw as unknown as MapaDataset;

const ROLE_FILTERS = [
  'Todos',
  'emissor',
  'credenciador',
  'subcredenciador',
  'instituidor',
  'registradora',
  'IP',
];

function normStr(s: string): string {
  return String(s || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function formatIsoDate(s?: string): string {
  if (!s) return '—';
  const m = s.match(/^(\d{4})-(\d{2})(?:-(\d{2}))?/);
  if (!m) return s;
  return `${m[3] ? `${m[3]}/` : ''}${m[2]}/${m[1]}`;
}

function slugifyId(id: string): string {
  return `a-${id.toLowerCase().replace(/_/g, '-')}`;
}

function idToLabel(id: string, byId: Record<string, RegulatorioAto>): string {
  if (byId[id]) return byId[id].l;
  const parts = id.split('_');
  const map: Record<string, string> = {
    BCB: 'Res. BCB',
    CMN: 'Res. CMN',
    INBCB: 'IN BCB',
    CONJ: 'Res. Conjunta',
    LEI: 'Lei',
    LC: 'LC',
  };
  return `${map[parts[0]] || parts[0]} ${parts[1] || ''}${parts[2] ? `/${parts[2]}` : ''}`.trim();
}

// Layout constants for interactive Pan/Zoom tree
const RW = 290;
const RH = 132;
const TX = 390;
const TW = 350;
const TH = 82;
const TG = 20;
const LX = TX + TW + 88;
const LW = 340;
const LH = 80;
const LG = 14;

export default function MapaRegulatorioClient() {
  const [viewMode, setViewMode] = useState<'mapa' | 'lista'>('mapa');
  const [isOwner, setIsOwner] = useState(false);

  // Filters
  const [groups, setGroups] = useState<Record<string, boolean>>({
    'Núcleo cartões': true,
    Transversal: true,
    Contexto: false,
  });
  const [showRevoked, setShowRevoked] = useState(false);
  const [onlyBrandLinked, setOnlyBrandLinked] = useState(false);
  const [roleFilter, setRoleFilter] = useState<string>('Todos');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedListTema, setSelectedListTema] = useState<string>('TODOS');

  // Interactive tree state
  const [openTemas, setOpenTemas] = useState<Set<string>>(
    () => new Set(['Arranjos e regras dos instituidores', 'Subcredenciamento e liquidação centralizada'])
  );
  const [seenIds, setSeenIds] = useState<Set<string>>(() => new Set());
  const [activeAto, setActiveAto] = useState<RegulatorioAto | null>(null);
  const [activeTemaName, setActiveTemaName] = useState<string>('');

  // Pan & Zoom camera
  const vpRef = useRef<HTMLDivElement>(null);
  const [cam, setCam] = useState<{ x: number; y: number; k: number }>({ x: 32, y: 40, k: 0.82 });
  const dragRef = useRef<{
    dragging: boolean;
    moved: boolean;
    startX: number;
    startY: number;
    origX: number;
    origY: number;
  }>({ dragging: false, moved: false, startX: 0, startY: 0, origX: 0, origY: 0 });

  const byId = useMemo(() => {
    const map: Record<string, RegulatorioAto> = {};
    for (const a of DATA.atos) map[a.id] = a;
    return map;
  }, []);

  // Load owner cookie, localStorage progress & hash route
  useEffect(() => {
    if (typeof document !== 'undefined') {
      setIsOwner(
        document.cookie.split(';').some((c) => c.trim().startsWith('vs_internal_pass=1'))
      );
    }
    try {
      const savedSeen = localStorage.getItem('vs_mr_seen');
      if (savedSeen) setSeenIds(new Set(JSON.parse(savedSeen)));
    } catch {
      // ignore
    }
    if (typeof window !== 'undefined') {
      if (window.innerWidth < 900) {
        setViewMode('lista');
      }
      const hash = window.location.hash.slice(1);
      if (hash.startsWith('a-')) {
        const key = hash.replace(/^a-/, '');
        const found = DATA.atos.find((a) => a.id.toLowerCase().replace(/_/g, '-') === key);
        if (found) {
          setActiveAto(found);
          setActiveTemaName(found.temas[0] || '');
          setOpenTemas((prev) => new Set([...prev, found.temas[0] || '']));
        }
      }
    }
  }, []);

  const isAtoVisible = useCallback(
    (a: RegulatorioAto) => {
      if (!showRevoked && a.pri === 'Histórico') return false;
      if (onlyBrandLinked && !a.lig) return false;
      if (roleFilter !== 'Todos' && !normStr(a.pap).includes(normStr(roleFilter))) return false;
      if (searchQuery.trim()) {
        const terms = normStr(searchQuery).trim().split(/\s+/).filter(Boolean);
        const hay = normStr(
          `${a.l} ${a.id} ${a.em} ${a.temas.join(' ')} ${a.lig || ''} ${a.at || ''} ${a.pap} ${a.fr || ''} ${(a.ob || []).map((o) => o.join(' ')).join(' ')}`
        );
        if (!terms.every((t) => hay.includes(t))) return false;
      }
      return true;
    },
    [showRevoked, onlyBrandLinked, roleFilter, searchQuery]
  );

  const isTemaVisible = useCallback(
    (t: RegulatorioTema) => {
      if (t.grupo === 'Histórico') return showRevoked;
      return groups[t.grupo] !== false;
    },
    [groups, showRevoked]
  );

  const visibleTemasWithAtos = useMemo(() => {
    return DATA.temas
      .filter((t) => (searchQuery.trim() ? true : isTemaVisible(t)))
      .map((t) => ({
        tema: t,
        atos: t.ids.map((id) => byId[id]).filter((a): a is RegulatorioAto => Boolean(a) && isAtoVisible(a)),
      }))
      .filter((entry) => entry.atos.length > 0);
  }, [byId, isTemaVisible, isAtoVisible, searchQuery]);

  const totalUniqueVisibleAtos = useMemo(() => {
    const s = new Set<string>();
    visibleTemasWithAtos.forEach((entry) => entry.atos.forEach((a) => s.add(a.id)));
    return s;
  }, [visibleTemasWithAtos]);

  const seenVisibleCount = useMemo(() => {
    let count = 0;
    totalUniqueVisibleAtos.forEach((id) => {
      if (seenIds.has(id)) count++;
    });
    return count;
  }, [totalUniqueVisibleAtos, seenIds]);

  const openAto = useCallback(
    (ato: RegulatorioAto, temaNome?: string) => {
      const targetTema = temaNome || ato.temas[0] || '';
      setActiveAto(ato);
      setActiveTemaName(targetTema);
      if (targetTema) {
        setOpenTemas((prev) => new Set([...prev, targetTema]));
      }
      setSeenIds((prev) => {
        const next = new Set(prev);
        next.add(ato.id);
        try {
          localStorage.setItem('vs_mr_seen', JSON.stringify([...next]));
        } catch {
          // ignore
        }
        return next;
      });
      if (typeof window !== 'undefined') {
        const h = `#${slugifyId(ato.id)}`;
        if (window.location.hash !== h) {
          window.history.replaceState(null, '', h);
        }
      }
    },
    []
  );

  const jumpToId = useCallback(
    (id: string) => {
      const target = byId[id];
      if (!target) return;
      if (target.pri === 'Histórico' && !showRevoked) setShowRevoked(true);
      const t = DATA.temas.find((x) => x.ids.includes(id));
      if (t && t.grupo !== 'Histórico' && groups[t.grupo] === false) {
        setGroups((prev) => ({ ...prev, [t.grupo]: true }));
      }
      openAto(target, t?.nome || target.temas[0]);
    },
    [byId, showRevoked, groups, openAto]
  );

  const openNextUnseen = useCallback(() => {
    for (const { tema, atos } of visibleTemasWithAtos) {
      for (const a of atos) {
        if (!seenIds.has(a.id)) {
          openAto(a, tema.nome);
          return;
        }
      }
    }
    if (visibleTemasWithAtos[0]?.atos[0]) {
      openAto(visibleTemasWithAtos[0].atos[0], visibleTemasWithAtos[0].tema.nome);
    }
  }, [visibleTemasWithAtos, seenIds, openAto]);

  // Compute interactive tree layout coordinates
  const treeLayout = useMemo(() => {
    let y = 0;
    const tpos: {
      tema: RegulatorioTema;
      atos: RegulatorioAto[];
      y: number;
      isOpen: boolean;
      bh: number;
    }[] = [];

    visibleTemasWithAtos.forEach(({ tema, atos }) => {
      const isOpen = searchQuery.trim().length > 0 || openTemas.has(tema.nome);
      const ch = isOpen ? atos.length * (LH + LG) - LG : 0;
      const bh = Math.max(TH, ch);
      tpos.push({ tema, atos, y, isOpen, bh });
      y += bh + TG + (isOpen ? 16 : 0);
    });

    const totalH = Math.max(RH, y - TG);
    const ry = Math.max(0, totalH / 2 - RH / 2);
    const totalW = LX + LW + 60;

    const edges: { d: string; active: boolean }[] = [];
    tpos.forEach(({ tema, atos, y: ty, isOpen }) => {
      const mx1 = (RW + TX) / 2;
      edges.push({
        d: `M${RW},${ry + RH / 2} C${mx1},${ry + RH / 2} ${mx1},${ty + TH / 2} ${TX},${ty + TH / 2}`,
        active: isOpen,
      });
      if (isOpen) {
        atos.forEach((a, i) => {
          const ly = ty + i * (LH + LG);
          const mx2 = (TX + TW + LX) / 2;
          edges.push({
            d: `M${TX + TW},${ty + TH / 2} C${mx2},${ty + TH / 2} ${mx2},${ly + LH / 2} ${LX},${ly + LH / 2}`,
            active: activeAto?.id === a.id,
          });
        });
      }
    });

    return { tpos, ry, totalW, totalH: totalH + 60, edges };
  }, [visibleTemasWithAtos, openTemas, searchQuery, activeAto]);

  const fitCamera = useCallback(() => {
    const vp = vpRef.current;
    if (!vp) return;
    const rect = vp.getBoundingClientRect();
    const panelW = activeAto && rect.width > 900 ? 480 : 0;
    const availW = Math.max(320, rect.width - panelW - 48);
    const availH = Math.max(320, rect.height - 80);
    const scale = Math.max(0.42, Math.min(0.95, Math.min(availW / treeLayout.totalW, availH / treeLayout.totalH)));
    const x = Math.max(20, 24 + (availW - treeLayout.totalW * scale) / 2);
    const y = treeLayout.totalH * scale > availH ? 24 : 24 + (availH - treeLayout.totalH * scale) / 2;
    setCam({ x, y, k: scale });
  }, [activeAto, treeLayout.totalW, treeLayout.totalH]);

  const zoomBy = (factor: number) => {
    const vp = vpRef.current;
    const cx = vp ? vp.clientWidth / 2 : 400;
    const cy = vp ? vp.clientHeight / 2 : 300;
    setCam((prev) => {
      const k = Math.max(0.25, Math.min(1.85, prev.k * factor));
      const x = cx - (cx - prev.x) * (k / prev.k);
      const y = cy - (cy - prev.y) * (k / prev.k);
      return { x, y, k };
    });
  };

  // Current list inside active tema for prev/next buttons
  const currentTemaList = useMemo(() => {
    if (!activeAto) return [];
    const entry = visibleTemasWithAtos.find((x) => x.tema.nome === activeTemaName);
    return entry ? entry.atos : [activeAto];
  }, [activeAto, activeTemaName, visibleTemasWithAtos]);

  const currentIdx = activeAto ? currentTemaList.findIndex((a) => a.id === activeAto.id) : -1;

  // List view filtered acts
  const listViewEntries = useMemo(() => {
    if (selectedListTema === 'TODOS') return visibleTemasWithAtos;
    return visibleTemasWithAtos.filter((e) => e.tema.nome === selectedListTema);
  }, [visibleTemasWithAtos, selectedListTema]);

  const totalNucleo = useMemo(
    () => DATA.atos.filter((a) => a.pri === 'Núcleo cartões').length,
    []
  );
  const totalBrandLinked = useMemo(
    () => DATA.atos.filter((a) => Boolean(a.lig)).length,
    []
  );

  const openAiForAto = (ato: RegulatorioAto) => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('open-acervo-ai-drawer', {
          detail: {
            query: `${ato.l} — ${ato.fr || ato.em.slice(0, 120)}`,
          },
        })
      );
    }
  };

  const handleSendToDocStudio = (ato: RegulatorioAto) => {
    const obligationsHtml = (ato.ob || [])
      .map((o) => `<li><strong>${o[0]}:</strong> ${o[1]}</li>`)
      .join('');
    sendToDocStudio({
      mode: 'append_html',
      title: `Análise Regulatória — ${ato.l}`,
      sourceModule: 'Mapa Regulatório do Cartão',
      metadata: {
        brand: 'geral',
        brandName: ato.org,
        referenceId: ato.id,
        category: ato.temas.join(' · '),
        effectiveDate: ato.vg || formatIsoDate(ato.data),
        riskLevel: ato.pri === 'Núcleo cartões' ? 'Alto' : 'Médio',
        executiveSummary: ato.fr || ato.em,
        recommendedAction: ato.at || 'Acompanhar vigência e impacto nos regulamentos das bandeiras.',
      },
      html: `
        <h2>${ato.l} (${ato.org})</h2>
        <p><strong>Ementa:</strong> ${ato.em}</p>
        ${ato.fr ? `<p><strong>Resumo em 1 frase:</strong> ${ato.fr}</p>` : ''}
        ${obligationsHtml ? `<h3>Principais Obrigações</h3><ul>${obligationsHtml}</ul>` : ''}
        ${ato.vg ? `<p><strong>Vigência e transição:</strong> ${ato.vg}</p>` : ''}
        ${ato.lig ? `<p><strong>Ligação com regras de bandeira:</strong> ${ato.lig}</p>` : ''}
        ${ato.at ? `<p><strong>Ponto de atenção:</strong> ${ato.at}</p>` : ''}
        ${ato.url ? `<p><strong>Fonte oficial:</strong> <a href="${ato.url}">${ato.url}</a></p>` : ''}
      `,
    });
  };

  return (
    <div className="min-h-dvh bg-background text-foreground pb-16">
      {/* ── Cabeçalho Editorial + Hierarquia Normativa ─────────────────────── */}
      <section className="border-b border-border bg-card/60">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 py-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft size={13} /> Início
              </Link>
              <span className="text-border">·</span>
              <span className="px-2.5 py-0.5 rounded-full font-mono text-[11px] font-semibold bg-primary/10 text-primary border border-primary/25">
                Mapa Regulatório do Cartão
              </span>
              <span className="px-2.5 py-0.5 rounded-full font-mono text-[11px] text-muted-foreground bg-muted border border-border">
                Corte: {DATA.gerado}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  window.dispatchEvent(
                    new CustomEvent('open-acervo-ai-drawer', {
                      detail: {
                        query:
                          'Res. BCB 150, Res. BCB 522/2025 subcredenciadores, Res. BCB 264 recebíveis e LC 214/2025 Split Payment',
                      },
                    })
                  )
                }
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer"
              >
                <Sparkles size={13} />
                <span>{isOwner ? 'Consultar no Acervo IA (SQLite)' : 'Perguntar à IA sobre normas'}</span>
              </button>
              <Link
                href="/jornada?track=regras_2027_tempo"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-background hover:border-foreground/40 text-xs font-medium text-foreground transition-colors"
              >
                <span>Ver Regras no Tempo (Lab 3D) →</span>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
            <div className="lg:col-span-7 space-y-3">
              <h1
                className="font-semibold text-foreground text-balance"
                style={{
                  fontSize: 'clamp(1.75rem, 3.6vw, 2.55rem)',
                  lineHeight: 1.12,
                  letterSpacing: '-0.025em',
                }}
              >
                Quem regula o cartão no Brasil
              </h1>
              <p className="font-serif text-sm sm:text-base text-muted-foreground leading-relaxed text-pretty max-w-2xl">
                Cada lei, resolução do CMN e norma do Banco Central que impacta emissão,
                credenciamento, subcredenciamento e liquidação — conectada diretamente às regras de
                Visa, Mastercard e Elo, com obrigações por papel e cadeia de alterações.
              </p>

              {/* Cadeia hierárquica */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1 font-mono text-xs">
                {['Lei', 'CMN', 'BCB', 'Bandeira', 'Participante'].map((step, i) => (
                  <React.Fragment key={step}>
                    <span
                      className={`px-2.5 py-1 rounded-lg border ${
                        step === 'Bandeira'
                          ? 'bg-primary text-primary-foreground border-primary font-semibold'
                          : 'bg-background text-foreground border-border'
                      }`}
                    >
                      {step}
                    </span>
                    {i < 4 && <span className="text-muted-foreground">→</span>}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* KPIs + Switcher de Visualização */}
            <div className="lg:col-span-5 space-y-3">
              <div className="grid grid-cols-3 gap-2.5">
                <div className="rounded-xl border border-border bg-background p-3">
                  <div className="font-mono text-xl font-bold text-foreground tabular-nums">
                    {DATA.atos.length}
                  </div>
                  <div className="text-[11px] text-muted-foreground">atos mapeados</div>
                </div>
                <div className="rounded-xl border border-border bg-background p-3">
                  <div className="font-mono text-xl font-bold text-primary tabular-nums">
                    {totalNucleo}
                  </div>
                  <div className="text-[11px] text-muted-foreground">núcleo cartões</div>
                </div>
                <div className="rounded-xl border border-border bg-background p-3">
                  <div className="font-mono text-xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                    {totalBrandLinked}
                  </div>
                  <div className="text-[11px] text-muted-foreground">ligados a bandeira</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setViewMode('mapa')}
                  className={`flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
                    viewMode === 'mapa'
                      ? 'bg-foreground text-background border-foreground'
                      : 'bg-background text-foreground border-border hover:border-foreground/40'
                  }`}
                >
                  <Network size={14} />
                  <span>Mapa Visual (Árvore)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('lista')}
                  className={`flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
                    viewMode === 'lista'
                      ? 'bg-foreground text-background border-foreground'
                      : 'bg-background text-foreground border-border hover:border-foreground/40'
                  }`}
                >
                  <LayoutGrid size={14} />
                  <span>Caixinhas &amp; Filtros</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Barra Unificada de Busca, Filtros e Progresso ──────────────────── */}
      <section className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 py-3 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Busca */}
          <div className="relative flex-1 max-w-md">
            <Search
              size={14}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar número, tema, bandeira ou regra (ex.: 522, subcredenciador, 264, AI16456)…"
              className="w-full rounded-xl border border-border bg-card pl-9 pr-8 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="Limpar busca"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Filtros de Grupo & Bandeira */}
          <div className="flex flex-wrap items-center gap-1.5">
            {(['Núcleo cartões', 'Transversal', 'Contexto'] as const).map((g) => {
              const active = groups[g] !== false;
              const label = g === 'Núcleo cartões' ? 'Núcleo' : g;
              return (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGroups((prev) => ({ ...prev, [g]: !active }))}
                  className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                    active
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-card text-muted-foreground border-border hover:text-foreground'
                  }`}
                >
                  {label}
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => setShowRevoked((p) => !p)}
              className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                showRevoked
                  ? 'bg-amber-600 text-white border-amber-600'
                  : 'bg-card text-muted-foreground border-border hover:text-foreground'
              }`}
            >
              Revogadas
            </button>

            <button
              type="button"
              onClick={() => setOnlyBrandLinked((p) => !p)}
              className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                onlyBrandLinked
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-card text-muted-foreground border-border hover:text-foreground'
              }`}
            >
              Só c/ Bandeira
            </button>

            <div className="h-4 w-px bg-border mx-1 hidden sm:block" />

            {/* Progresso + Próximo ato */}
            <span className="font-mono text-[11px] text-muted-foreground tabular-nums px-1">
              {seenVisibleCount}/{totalUniqueVisibleAtos.size} vistos
            </span>
            <button
              type="button"
              onClick={openNextUnseen}
              className="px-3 py-1.5 rounded-lg bg-foreground text-background hover:opacity-90 text-xs font-semibold transition-opacity cursor-pointer"
            >
              Próximo ato →
            </button>
          </div>
        </div>
      </section>

      {/* ── MODO 1: MAPA VISUAL INTERATIVO (PAN & ZOOM COM CURVAS BÉZIER) ──── */}
      {viewMode === 'mapa' ? (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 pt-5">
          <div className="relative rounded-2xl border border-border bg-card overflow-hidden h-[72dvh] min-h-[540px] select-none">
            {/* Subtle dot-grid background */}
            <div
              ref={vpRef}
              onWheel={(e) => {
                e.preventDefault();
                const rect = vpRef.current?.getBoundingClientRect();
                if (!rect) return;
                const cx = e.clientX - rect.left;
                const cy = e.clientY - rect.top;
                const f = Math.exp(-e.deltaY * 0.0014);
                setCam((prev) => {
                  const k = Math.max(0.25, Math.min(1.85, prev.k * f));
                  return {
                    x: cx - (cx - prev.x) * (k / prev.k),
                    y: cy - (cy - prev.y) * (k / prev.k),
                    k,
                  };
                });
              }}
              onPointerDown={(e) => {
                if ((e.target as HTMLElement).closest('button')) return;
                dragRef.current = {
                  dragging: true,
                  moved: false,
                  startX: e.clientX,
                  startY: e.clientY,
                  origX: cam.x,
                  origY: cam.y,
                };
              }}
              onPointerMove={(e) => {
                if (!dragRef.current.dragging) return;
                const dx = e.clientX - dragRef.current.startX;
                const dy = e.clientY - dragRef.current.startY;
                if (Math.hypot(dx, dy) > 4) dragRef.current.moved = true;
                setCam((prev) => ({
                  ...prev,
                  x: dragRef.current.origX + dx,
                  y: dragRef.current.origY + dy,
                }));
              }}
              onPointerUp={() => {
                dragRef.current.dragging = false;
              }}
              onPointerLeave={() => {
                dragRef.current.dragging = false;
              }}
              className="w-full h-full overflow-hidden cursor-grab active:cursor-grabbing relative"
              style={{
                backgroundImage:
                  'radial-gradient(circle, color-mix(in srgb, var(--border) 85%, transparent) 1px, transparent 1px)',
                backgroundSize: '22px 22px',
              }}
            >
              <div
                style={{
                  transform: `translate(${cam.x}px, ${cam.y}px) scale(${cam.k})`,
                  transformOrigin: '0 0',
                  position: 'relative',
                  width: treeLayout.totalW,
                  height: treeLayout.totalH,
                }}
              >
                {/* Curvas Bézier */}
                <svg
                  width={treeLayout.totalW}
                  height={treeLayout.totalH}
                  className="absolute inset-0 pointer-events-none"
                >
                  {treeLayout.edges.map((edge, idx) => (
                    <path
                      key={idx}
                      d={edge.d}
                      fill="none"
                      stroke={edge.active ? 'var(--primary)' : 'var(--border)'}
                      strokeWidth={edge.active ? 2.2 : 1.4}
                      strokeOpacity={edge.active ? 0.85 : 0.9}
                    />
                  ))}
                </svg>

                {/* Nó Raiz */}
                <div
                  style={{ left: 0, top: treeLayout.ry, width: RW, minHeight: RH }}
                  className="absolute rounded-2xl border-2 border-foreground bg-foreground text-background p-5 shadow-md flex flex-col justify-center"
                >
                  <span className="font-mono text-[10px] uppercase tracking-wider opacity-75">
                    Levantamento · 19/11/2026
                  </span>
                  <strong className="text-lg font-semibold leading-tight mt-1">
                    Regulação do Cartão
                  </strong>
                  <span className="font-mono text-xs opacity-80 mt-2">
                    {totalUniqueVisibleAtos.size} atos · {visibleTemasWithAtos.length} temas visíveis
                  </span>
                </div>

                {/* Nós de Tema e Folhas de Atos */}
                {treeLayout.tpos.map(({ tema, atos, y, isOpen }) => {
                  const brandCount = atos.filter((a) => Boolean(a.lig)).length;
                  const seenTemaCount = atos.filter((a) => seenIds.has(a.id)).length;
                  const gLabel = tema.grupo === 'Núcleo cartões' ? 'Núcleo' : tema.grupo;

                  return (
                    <React.Fragment key={tema.nome}>
                      <button
                        type="button"
                        onClick={() => {
                          setOpenTemas((prev) => {
                            const next = new Set(prev);
                            if (next.has(tema.nome)) next.delete(tema.nome);
                            else next.add(tema.nome);
                            return next;
                          });
                        }}
                        style={{ left: TX, top: y, width: TW, minHeight: TH }}
                        className={`absolute rounded-2xl border p-3.5 text-left transition-colors flex items-center gap-3 cursor-pointer shadow-xs ${
                          isOpen
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-background text-foreground border-border hover:border-primary/60'
                        }`}
                      >
                        <span
                          className={`size-9 rounded-xl font-mono text-xs font-bold flex items-center justify-center shrink-0 tabular-nums ${
                            isOpen ? 'bg-white/20 text-white' : 'bg-muted text-foreground'
                          }`}
                        >
                          {atos.length}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div
                            className={`font-mono text-[10px] uppercase tracking-wider ${
                              isOpen ? 'text-primary-foreground/80' : 'text-muted-foreground'
                            }`}
                          >
                            {gLabel} · {brandCount} c/ bandeira
                          </div>
                          <div className="text-xs font-semibold leading-snug line-clamp-2 mt-0.5">
                            {tema.nome}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="font-mono text-sm font-bold">{isOpen ? '×' : '+'}</div>
                          <div
                            className={`font-mono text-[10px] tabular-nums ${
                              isOpen ? 'text-primary-foreground/80' : 'text-muted-foreground'
                            }`}
                          >
                            {seenTemaCount}/{atos.length}
                          </div>
                        </div>
                      </button>

                      {isOpen &&
                        atos.map((a, idx) => {
                          const ly = y + idx * (LH + LG);
                          const isCur = activeAto?.id === a.id && activeTemaName === tema.nome;
                          const isSeen = seenIds.has(a.id);

                          return (
                            <button
                              key={`${tema.nome}-${a.id}`}
                              type="button"
                              onClick={() => openAto(a, tema.nome)}
                              style={{ left: LX, top: ly, width: LW, minHeight: LH }}
                              className={`absolute rounded-xl border p-3 text-left transition-colors cursor-pointer shadow-2xs flex flex-col justify-between ${
                                isCur
                                  ? 'bg-primary/10 border-primary ring-2 ring-primary/30'
                                  : 'bg-background border-border hover:border-foreground/50'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-mono text-xs font-bold text-foreground truncate">
                                  {a.l}
                                </span>
                                <div className="flex items-center gap-1 shrink-0">
                                  {a.lig && (
                                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/25 text-emerald-700 dark:text-emerald-300 font-mono text-[9.5px] font-semibold">
                                      bandeira
                                    </span>
                                  )}
                                  {isSeen && (
                                    <span className="font-mono text-[10px] text-primary font-semibold">
                                      ✓
                                    </span>
                                  )}
                                </div>
                              </div>
                              <p className="text-[11px] text-muted-foreground line-clamp-2 leading-snug mt-1">
                                {a.fr || a.em}
                              </p>
                            </button>
                          );
                        })}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>

            {/* Controles de Zoom */}
            <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-background/95 border border-border rounded-xl p-1 shadow-sm">
              <button
                type="button"
                onClick={() => zoomBy(1 / 1.2)}
                aria-label="Diminuir zoom"
                className="p-1.5 rounded-lg hover:bg-muted text-foreground cursor-pointer"
              >
                <ZoomOut size={15} />
              </button>
              <button
                type="button"
                onClick={() => zoomBy(1.2)}
                aria-label="Aumentar zoom"
                className="p-1.5 rounded-lg hover:bg-muted text-foreground cursor-pointer"
              >
                <ZoomIn size={15} />
              </button>
              <button
                type="button"
                onClick={fitCamera}
                className="px-2.5 py-1 rounded-lg hover:bg-muted text-xs font-medium text-foreground inline-flex items-center gap-1 cursor-pointer"
              >
                <Maximize2 size={12} />
                <span>Ajustar</span>
              </button>
            </div>

            {/* Dica de uso discreta */}
            <div className="hidden md:block absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full bg-background/90 border border-border text-[11px] text-muted-foreground pointer-events-none">
              Clique num tema para expandir · clique num ato para ver obrigações e ligação com bandeiras · arraste para mover
            </div>
          </div>
        </section>
      ) : (
        /* ── MODO 2: CAIXINHAS POR TEMA & PAPEL (LEITURA RÁPIDA / MOBILE) ── */
        <section className="mx-auto max-w-7xl px-5 sm:px-6 pt-6 space-y-5">
          {/* Filtro por Papel Impactado */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center gap-1 font-mono text-[11px] text-muted-foreground mr-1">
              <Filter size={12} /> Papel impactado:
            </span>
            {ROLE_FILTERS.map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => setRoleFilter(role)}
                className={`px-2.5 py-1 rounded-full border text-xs font-medium transition-colors cursor-pointer ${
                  roleFilter === role
                    ? 'bg-foreground text-background border-foreground'
                    : 'bg-card text-muted-foreground border-border hover:text-foreground'
                }`}
              >
                {role === 'Todos' ? 'Todos os papéis' : role}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Menu de Temas à Esquerda */}
            <aside className="lg:col-span-4 rounded-2xl border border-border bg-card p-3 space-y-1 max-h-[70dvh] overflow-y-auto">
              <button
                type="button"
                onClick={() => setSelectedListTema('TODOS')}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                  selectedListTema === 'TODOS'
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted text-foreground'
                }`}
              >
                <span>Todos os temas visíveis</span>
                <span className="font-mono text-[11px] tabular-nums">
                  {totalUniqueVisibleAtos.size}
                </span>
              </button>

              {visibleTemasWithAtos.map(({ tema, atos }) => {
                const active = selectedListTema === tema.nome;
                return (
                  <button
                    key={tema.nome}
                    type="button"
                    onClick={() => setSelectedListTema(tema.nome)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                      active
                        ? 'bg-primary text-primary-foreground font-semibold'
                        : 'hover:bg-muted text-foreground'
                    }`}
                  >
                    <span className="truncate">{tema.nome}</span>
                    <span
                      className={`font-mono text-[10px] px-1.5 py-0.5 rounded-full shrink-0 tabular-nums ${
                        active ? 'bg-white/20 text-white' : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {atos.length}
                    </span>
                  </button>
                );
              })}
            </aside>

            {/* Grade de Atos à Direita */}
            <div className="lg:col-span-8 space-y-6">
              {listViewEntries.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center space-y-2">
                  <p className="text-sm font-semibold text-foreground">
                    Nenhum ato encontrado com esses filtros.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setRoleFilter('Todos');
                      setOnlyBrandLinked(false);
                      setSelectedListTema('TODOS');
                    }}
                    className="text-xs text-primary font-semibold hover:underline cursor-pointer"
                  >
                    Limpar filtros
                  </button>
                </div>
              ) : (
                listViewEntries.map(({ tema, atos }) => (
                  <div key={tema.nome} className="space-y-3">
                    <div className="flex items-center justify-between gap-2 border-b border-border pb-2">
                      <div>
                        <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                          {tema.grupo}
                        </span>
                        <h2 className="text-base font-semibold text-foreground">{tema.nome}</h2>
                      </div>
                      <span className="font-mono text-xs text-muted-foreground tabular-nums">
                        {atos.length} {atos.length === 1 ? 'ato' : 'atos'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {atos.map((a) => (
                        <button
                          key={`${tema.nome}-${a.id}`}
                          type="button"
                          onClick={() => openAto(a, tema.nome)}
                          className="text-left rounded-2xl border border-border bg-card hover:border-primary/50 p-4 transition-colors flex flex-col justify-between gap-3 cursor-pointer"
                        >
                          <div className="space-y-1.5">
                            <div className="flex flex-wrap items-center justify-between gap-1.5">
                              <span className="font-mono text-xs font-bold text-foreground">
                                {a.l}
                              </span>
                              <div className="flex items-center gap-1">
                                {a.lig && (
                                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/25 text-emerald-700 dark:text-emerald-300 font-mono text-[10px] font-semibold">
                                    bandeira
                                  </span>
                                )}
                                {seenIds.has(a.id) && (
                                  <CheckCircle2 size={13} className="text-primary" />
                                )}
                              </div>
                            </div>
                            <p className="font-serif text-xs sm:text-sm text-foreground/90 leading-relaxed line-clamp-3">
                              {a.fr || a.em}
                            </p>
                          </div>

                          <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/60 font-mono text-[10px] text-muted-foreground">
                            <span>
                              {a.org} · {formatIsoDate(a.data)}
                            </span>
                            <span className="text-primary font-semibold">Ver detalhes →</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      )}

      {/* ── Painel Lateral de Detalhe do Ato (Slide-Over) ──────────────────── */}
      {activeAto && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-[1px]"
          onClick={() => setActiveAto(null)}
        >
          <aside
            aria-label="Detalhe do ato normativo"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[560px] h-dvh bg-background border-l border-border shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header do Painel */}
            <div className="px-5 py-3.5 border-b border-border bg-card flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-mono text-[11px] text-muted-foreground truncate">
                  {activeTemaName} · ato {Math.max(1, currentIdx + 1)} de {currentTemaList.length}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveAto(null)}
                aria-label="Fechar painel"
                className="px-2.5 py-1 rounded-lg border border-border bg-background hover:bg-muted text-xs font-medium text-foreground cursor-pointer"
              >
                Fechar ✕
              </button>
            </div>

            {/* Corpo Rolável */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              <div className="space-y-2.5">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="px-2.5 py-0.5 rounded-full font-mono text-[10px] font-semibold bg-primary/10 text-primary border border-primary/25">
                    {activeAto.pri === 'Núcleo cartões' ? 'Núcleo cartões' : activeAto.pri}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full font-mono text-[10px] border ${
                      activeAto.sit === 'Revogada'
                        ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/25'
                        : 'bg-muted text-muted-foreground border-border'
                    }`}
                  >
                    {activeAto.sit}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full font-mono text-[10px] bg-muted text-muted-foreground border border-border">
                    {activeAto.ori}
                  </span>
                </div>

                <h2 className="text-xl font-semibold text-foreground">{activeAto.l}</h2>
                <p className="font-serif text-sm text-muted-foreground leading-relaxed">
                  {activeAto.em}
                </p>
              </div>

              {/* Ações 1-Clique (IA + Doc Studio + Link Oficial) */}
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => openAiForAto(activeAto)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 cursor-pointer"
                >
                  <Sparkles size={13} />
                  <span>{isOwner ? 'Cruzar na IA + SQLite' : 'Perguntar à IA'}</span>
                </button>
                {isOwner && (
                  <button
                    type="button"
                    onClick={() => handleSendToDocStudio(activeAto)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border bg-card hover:bg-muted text-xs font-semibold text-foreground cursor-pointer"
                  >
                    <FileText size={13} className="text-emerald-600 dark:text-emerald-400" />
                    <span>Enviar p/ Doc Studio</span>
                  </button>
                )}
                {activeAto.url && (
                  <a
                    href={activeAto.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border bg-card hover:border-foreground/40 text-xs font-medium text-foreground"
                  >
                    <span>
                      {activeAto.url.includes('bcb.gov.br')
                        ? 'Ficha no BCB'
                        : 'Texto oficial'}
                    </span>
                    <ExternalLink size={12} />
                  </a>
                )}
              </div>

              {/* Leitura Técnica Estruturada */}
              {activeAto.fr && (
                <section className="rounded-2xl border border-border bg-card p-4 space-y-4">
                  <div className="flex items-center justify-between gap-2 border-b border-border pb-2">
                    <span className="inline-flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-wider text-primary">
                      <Scale size={13} /> Leitura Técnica
                    </span>
                    <span className="font-mono text-[10px] text-muted-foreground">
                      Resumo operacional · não substitui texto oficial
                    </span>
                  </div>

                  <div className="space-y-1">
                    <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                      Em uma frase
                    </p>
                    <p className="font-serif text-sm text-foreground leading-relaxed font-medium">
                      {activeAto.fr}
                    </p>
                  </div>

                  {activeAto.ob && activeAto.ob.length > 0 && (
                    <div className="space-y-2">
                      <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                        Principais obrigações por papel
                      </p>
                      <ul className="space-y-2">
                        {activeAto.ob.map(([papel, desc], idx) => (
                          <li
                            key={idx}
                            className="rounded-xl border border-border bg-background p-3 text-xs space-y-1"
                          >
                            <span className="inline-block px-2 py-0.5 rounded bg-muted font-mono text-[10px] font-semibold text-foreground">
                              {papel}
                            </span>
                            <p className="text-foreground/90 leading-relaxed">{desc}</p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {activeAto.vg && (
                    <div className="space-y-1">
                      <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                        Vigência e transição
                      </p>
                      <p className="text-xs text-foreground/90 leading-relaxed">{activeAto.vg}</p>
                    </div>
                  )}

                  {activeAto.ca &&
                    (activeAto.ca.altera.length > 0 || activeAto.ca.por.length > 0) && (
                      <div className="space-y-2 pt-2 border-t border-border">
                        <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                          Cadeia da norma (clique para navegar)
                        </p>
                        {activeAto.ca.altera.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="font-mono text-[10px] text-muted-foreground mr-1">
                              Altera:
                            </span>
                            {activeAto.ca.altera.map((cid) =>
                              byId[cid] ? (
                                <button
                                  key={cid}
                                  type="button"
                                  onClick={() => jumpToId(cid)}
                                  className="px-2 py-0.5 rounded-md border border-primary/30 bg-primary/10 text-primary font-mono text-[11px] font-medium hover:bg-primary/20 cursor-pointer"
                                >
                                  {idToLabel(cid, byId)}
                                </button>
                              ) : (
                                <span
                                  key={cid}
                                  className="px-2 py-0.5 rounded-md border border-border bg-muted text-muted-foreground font-mono text-[11px]"
                                >
                                  {idToLabel(cid, byId)}
                                </span>
                              )
                            )}
                          </div>
                        )}
                        {activeAto.ca.por.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="font-mono text-[10px] text-muted-foreground mr-1">
                              Alterada por:
                            </span>
                            {activeAto.ca.por.map((cid) =>
                              byId[cid] ? (
                                <button
                                  key={cid}
                                  type="button"
                                  onClick={() => jumpToId(cid)}
                                  className="px-2 py-0.5 rounded-md border border-primary/30 bg-primary/10 text-primary font-mono text-[11px] font-medium hover:bg-primary/20 cursor-pointer"
                                >
                                  {idToLabel(cid, byId)}
                                </button>
                              ) : (
                                <span
                                  key={cid}
                                  className="px-2 py-0.5 rounded-md border border-border bg-muted text-muted-foreground font-mono text-[11px]"
                                >
                                  {idToLabel(cid, byId)}
                                </span>
                              )
                            )}
                          </div>
                        )}
                      </div>
                    )}
                </section>
              )}

              {/* Ligação com Regras de Bandeira */}
              {(activeAto.lig || activeAto.pri === 'Núcleo cartões') && (
                <section className="rounded-2xl border border-emerald-500/25 bg-emerald-500/5 p-4 space-y-1.5">
                  <h3 className="font-mono text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                    Ligação com regras de bandeira (Visa · Mastercard · Elo)
                  </h3>
                  <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed">
                    {activeAto.lig ||
                      'Sem relação documentada no acervo atual de manuais e boletins das bandeiras.'}
                  </p>
                </section>
              )}

              {/* Ponto de Atenção */}
              {activeAto.at && (
                <section className="rounded-2xl border border-amber-500/25 bg-amber-500/5 p-4 space-y-1.5">
                  <h3 className="font-mono text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                    Ponto de atenção e acompanhamento
                  </h3>
                  <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed">
                    {activeAto.at}
                  </p>
                </section>
              )}

              {/* Ficha Completa */}
              <section className="rounded-2xl border border-border bg-card p-4 space-y-2">
                <h3 className="font-mono text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Ficha normativa
                </h3>
                <dl className="grid grid-cols-3 gap-y-2 text-xs">
                  <dt className="text-muted-foreground">Órgão</dt>
                  <dd className="col-span-2 font-medium text-foreground">{activeAto.org}</dd>
                  <dt className="text-muted-foreground">Tipo</dt>
                  <dd className="col-span-2 font-medium text-foreground">{activeAto.tipo}</dd>
                  <dt className="text-muted-foreground">Data</dt>
                  <dd className="col-span-2 font-mono text-foreground">
                    {formatIsoDate(activeAto.data)}
                  </dd>
                  <dt className="text-muted-foreground">Temas</dt>
                  <dd className="col-span-2 text-foreground">{activeAto.temas.join('; ')}</dd>
                  <dt className="text-muted-foreground">Papéis</dt>
                  <dd className="col-span-2 text-foreground">
                    {activeAto.pap || 'Não atribuído'}
                  </dd>
                </dl>
              </section>
            </div>

            {/* Rodapé de Navegação Anterior / Próximo */}
            <div className="px-5 py-3 border-t border-border bg-card flex items-center justify-between gap-2">
              <button
                type="button"
                disabled={currentIdx <= 0}
                onClick={() => {
                  if (currentIdx > 0) openAto(currentTemaList[currentIdx - 1], activeTemaName);
                }}
                className="px-3 py-2 rounded-xl border border-border bg-background hover:bg-muted disabled:opacity-40 text-xs font-medium text-foreground inline-flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft size={13} /> Anterior
              </button>
              <button
                type="button"
                onClick={() => {
                  if (currentIdx >= 0 && currentIdx < currentTemaList.length - 1) {
                    openAto(currentTemaList[currentIdx + 1], activeTemaName);
                  } else {
                    openNextUnseen();
                  }
                }}
                className="px-3.5 py-2 rounded-xl bg-foreground text-background hover:opacity-90 text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
              >
                <span>
                  {currentIdx >= 0 && currentIdx < currentTemaList.length - 1
                    ? 'Próximo neste tema'
                    : 'Próximo não visto'}
                </span>
                <ArrowRight size={13} />
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
