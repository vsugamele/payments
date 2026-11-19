'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { sendToDocStudio } from '@/lib/docStudioBridge';

interface AcervoAiResponse {
  state: string;
  liveEngineConnected: boolean;
  query: string;
  totalCandidates: number;
  answer: string;
  evidence: {
    file: string;
    sha256: string;
    evidenceId?: string | null;
    isLiveFts?: boolean;
    physicalPage: number;
    unitLabel: string;
    excerpt: string;
    locator: string;
    alerts?: string[];
  }[];
  camposMatched: {
    bandeira: string;
    documento: string;
    arquivo?: string;
    edicao?: string;
    pagina: number;
    registro: string;
    de_pds: string;
    posicao: string;
    tamanho: string;
    formato: string;
    nome: string;
    valor?: string;
    descricao: string;
    sha256?: string;
    source?: string;
  }[];
  tarifasMatched: any[];
  regulatorioMatched: any[];
  scopeConflicts: {
    id: string;
    title: string;
    readingA: string;
    readingB: string;
    rule: string;
  }[];
  timingsMs?: {
    total: number;
    fts_match: number;
    rerank: number;
  };
}

export function AcervoAiGlobalDrawer() {
  const pathname = usePathname() || '/';
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [query, setQuery] = useState<string>('TCR 0 Transaction ID DE 62.2 Downgrade');
  const [bandeira, setBandeira] = useState<string>('ALL');
  const [papel, setPapel] = useState<'ambos' | 'adquirente' | 'emissor'>('ambos');
  const [tool, setTool] = useState<
    'all' | 'consultar_acervo' | 'consultar_campo' | 'consultar_tarifa' | 'regulatorio'
  >('all');
  const [activeResultTab, setActiveResultTab] = useState<
    'parecer' | 'pdfs' | 'campos' | 'tarifas'
  >('parecer');
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<AcervoAiResponse | null>(null);

  const executeQuery = async (
    customQuery?: string,
    customBrand?: string,
    customTool?: 'all' | 'consultar_acervo' | 'consultar_campo' | 'consultar_tarifa' | 'regulatorio'
  ) => {
    const qToRun = (customQuery ?? query).trim();
    if (!qToRun) return;
    setLoading(true);
    try {
      const res = await fetch('/api/acervo/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pergunta: qToRun,
          bandeira: (customBrand ?? bandeira) === 'ALL' ? undefined : customBrand ?? bandeira,
          papel,
          tool: customTool ?? tool,
          limite: 10,
        }),
      });
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error('Erro ao consultar IA do Acervo:', err);
    } finally {
      setLoading(false);
    }
  };

  // Listen for global event `open-acervo-ai-drawer` and Alt+A keyboard shortcut
  useEffect(() => {
    const onOpenEvent = (ev: Event) => {
      const custom = ev as CustomEvent<{ query?: string; bandeira?: string }>;
      setIsOpen(true);
      if (custom.detail?.bandeira) {
        setBandeira(custom.detail.bandeira);
      }
      if (custom.detail?.query) {
        setQuery(custom.detail.query);
        executeQuery(custom.detail.query, custom.detail.bandeira);
      } else if (!data) {
        executeQuery();
      }
    };

    const onKeyDown = (ev: KeyboardEvent) => {
      if (ev.altKey && ev.key.toLowerCase() === 'a') {
        ev.preventDefault();
        setIsOpen((prev) => {
          const next = !prev;
          if (next && !data) executeQuery();
          return next;
        });
      }
    };

    window.addEventListener('open-acervo-ai-drawer', onOpenEvent as EventListener);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('open-acervo-ai-drawer', onOpenEvent as EventListener);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [data, query, bandeira]);

  // Context-aware starter prompts based on current route
  const starterPrompts = pathname.includes('boletins')
    ? [
        'CAVV v9 AES 3DS 2.2 Release 26.1',
        'Elo Serviço 10 v26.2 Reg 08 CPF CNPJ Subcredenciado',
        'Visa Fee Schedule Brazil conversão USD para BRL maio 2026',
        'Mastercard PDS 0208 Payment Facilitator e GDIP',
      ]
    : pathname.includes('outgoing')
    ? [
        'TCR 0 e TCR 5 Posição do Transaction ID DE 62.2',
        'Mastercard IPM MTI 1240 PDS 0195 Parcelado Brasil',
        'Elo Registro 02 Parcelado e Código IBGE',
        'ARN 23 dígitos cálculo dígito verificador Luhn',
      ]
    : pathname.includes('produtos') || pathname.includes('mapa')
    ? [
        'Resolução BCB 304 teto intercâmbio débito 0,50% e pré-pago 0,70%',
        'Visa Product ID PID DE 62.23 e tabela ARDEF',
        'Mastercard MPE T068 GCMS Product ID PDS 0002',
        'Modalidades Elo 992 Parcelado Loja vs 993 Emissor',
      ]
    : [
        'TCR 0 Transaction ID DE 62.2 Downgrade EIRF',
        'Compelling Evidence 3.0 CE 3.0 regras 120 a 365 dias',
        'Resolução BCB 264 registradoras B3 CERC ASLC026',
        'DE 22 POS Entry Mode 051 071 810 Network Token',
      ];

  return (
    <>
      {/* Botão Flutuante Global no Canto Inferior Esquerdo (para não colidir com outros botões à direita) */}
      <button
        onClick={() => {
          setIsOpen(true);
          if (!data) executeQuery();
        }}
        title="Abrir IA Conectada ao Sistema de Acervo (Alt+A)"
        className="fixed bottom-5 left-5 z-50 px-4 py-2.5 rounded-full bg-slate-950 dark:bg-[#1F3FE0] hover:bg-blue-700 text-white border border-blue-400/40 text-xs font-black shadow-2xl flex items-center gap-2.5 transition-all"
      >
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span>🧠 IA + Acervo (40k PDFs · 17k Campos)</span>
        <span className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-white/15 font-mono text-[10px]">
          Alt+A
        </span>
      </button>

      {/* Slide-Over Drawer da IA do Acervo */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[100] flex justify-end bg-slate-950/50 backdrop-blur-[2px]"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="w-full max-w-[640px] h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header do Drawer */}
            <div className="px-5 py-4 bg-slate-950 text-white border-b border-slate-800 flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 font-mono text-[10px] font-black flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    {data?.liveEngineConnected
                      ? 'SQLITE FTS5 AO VIVO CONECTADO'
                      : 'ACERVO CANÔNICO PLUGADO'}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 font-mono text-[10px] font-bold">
                    40.129 Ativos · 17.106 Campos · 454 Tarifas · 385 Boletins
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-white">
                  🧠 Cérebro da IA Conectado ao Sistema de Acervo
                </h3>
                <p className="text-xs text-slate-400">
                  Consulta simultânea em <code>acervo.sqlite3</code> (FTS5), <code>campos.sqlite3</code> (17k campos), <code>tarifas.sqlite3</code> e boletins com governança de fontes.
                </p>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 shrink-0"
              >
                ✕ Fechar
              </button>
            </div>

            {/* Barra de Busca e Filtros dos 4 Motores */}
            <div className="p-4 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 space-y-3">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  executeQuery();
                }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Pergunte qualquer campo (DE 62.2, TCR 5, PDS 0195), boletim, tarifa ou regra..."
                  className="flex-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:border-[#1F3FE0]"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 rounded-xl bg-[#1F3FE0] hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-black shrink-0 shadow-sm"
                >
                  {loading ? 'Consultando…' : 'Consultar Acervo'}
                </button>
              </form>

              {/* Filtros Rápidos: Bandeira + Motor */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-1">
                  {(['ALL', 'visa', 'mastercard', 'elo', 'amex'] as const).map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => {
                        setBandeira(b);
                        executeQuery(query, b, tool);
                      }}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold border transition-all ${
                        bandeira === b
                          ? 'bg-[#1F3FE0] text-white border-[#1F3FE0]'
                          : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      {b === 'ALL' ? 'Todas' : b.toUpperCase()}
                    </button>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-1">
                  {[
                    { id: 'all', label: '4 Motores' },
                    { id: 'consultar_acervo', label: '📄 PDFs' },
                    { id: 'consultar_campo', label: '🧬 Campos' },
                    { id: 'consultar_tarifa', label: '💲 Tarifas' },
                  ].map((tm) => (
                    <button
                      key={tm.id}
                      type="button"
                      onClick={() => {
                        setTool(tm.id as any);
                        executeQuery(query, bandeira, tm.id as any);
                      }}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold border transition-all ${
                        tool === tm.id
                          ? 'bg-slate-900 dark:bg-blue-600 text-white border-slate-900 dark:border-blue-500'
                          : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      {tm.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chips de Consultas Contextuais */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="font-mono text-[10px] font-bold uppercase text-slate-400">
                  Sugestões:
                </span>
                {starterPrompts.map((sp) => (
                  <button
                    key={sp}
                    type="button"
                    onClick={() => {
                      setQuery(sp);
                      executeQuery(sp);
                    }}
                    className="px-2.5 py-1 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-[#1F3FE0] text-[11px] font-medium text-slate-700 dark:text-slate-300 truncate max-w-[260px]"
                  >
                    {sp}
                  </button>
                ))}
              </div>
            </div>

            {/* Sub-Abas de Resultados (Parecer IA | PDFs & Boletins | Campos SQLite | Tarifas & Reg) */}
            {data && (
              <div className="px-4 py-2 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { id: 'parecer', label: '🧠 Parecer IA' },
                    { id: 'pdfs', label: `📄 PDFs & Boletins (${data.evidence?.length || 0})` },
                    { id: 'campos', label: `🧬 Campos SQLite (${data.camposMatched?.length || 0})` },
                    {
                      id: 'tarifas',
                      label: `💲 Tarifas & BCB (${(data.tarifasMatched?.length || 0) + (data.regulatorioMatched?.length || 0)})`,
                    },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveResultTab(tab.id as any)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                        activeResultTab === tab.id
                          ? 'bg-[#1F3FE0] text-white border-[#1F3FE0]'
                          : 'bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {data.timingsMs && (
                  <span className="font-mono text-[10px] text-slate-400 shrink-0">
                    {data.timingsMs.total} ms
                  </span>
                )}
              </div>
            )}

            {/* Corpo Rolável dos Resultados */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {loading && (
                <div className="rounded-2xl border border-blue-200 dark:border-blue-500/30 bg-blue-50/50 dark:bg-blue-950/20 p-6 text-center space-y-2">
                  <div className="text-sm font-black text-[#1F3FE0] dark:text-blue-400">
                    Consultando acervo.sqlite3 (FTS5), campos.sqlite3 e tarifas.sqlite3…
                  </div>
                  <p className="text-xs text-slate-500">
                    Varrendo 40.129 ativos, 17.106 campos técnicos e 385 boletins com verificação de hash SHA-256.
                  </p>
                </div>
              )}

              {!loading && data && activeResultTab === 'parecer' && (
                <div className="space-y-4">
                  {/* Alerta de Conflito Explícito entre Fontes ("Nada é escolhido em silêncio") */}
                  {data.scopeConflicts && data.scopeConflicts.length > 0 && (
                    <div className="rounded-2xl border border-amber-300 dark:border-amber-500/40 bg-amber-50/80 dark:bg-amber-950/30 p-4 space-y-2">
                      <div className="text-xs font-black uppercase tracking-wider text-amber-800 dark:text-amber-300">
                        ⚠️ Governança de Fontes: Conflito Explícito Detectado (&ldquo;Nada é Escolhido em Silêncio&rdquo;)
                      </div>
                      {data.scopeConflicts.map((sc) => (
                        <div key={sc.id} className="text-xs text-amber-900 dark:text-amber-200 space-y-1">
                          <div className="font-bold">
                            {sc.id} — {sc.title}
                          </div>
                          <div>
                            • <strong>Leitura A:</strong> {sc.readingA} | <strong>Leitura B:</strong> {sc.readingB}
                          </div>
                          <div className="italic text-[11px]">{sc.rule}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Parecer Estruturado da IA */}
                  <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/80 p-4 space-y-3 text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line">
                    {data.answer}
                  </div>
                </div>
              )}

              {!loading && data && activeResultTab === 'pdfs' && (
                <div className="space-y-3">
                  {(data.evidence || []).map((ev, idx) => (
                    <div
                      key={idx}
                      className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/70 p-4 space-y-2"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-mono text-[11px] font-black text-[#1F3FE0] dark:text-blue-400">
                          {ev.locator}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {ev.isLiveFts && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-mono text-[10px] font-black">
                              LIVE SQLITE FTS5
                            </span>
                          )}
                          <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-mono text-[10px] font-bold text-slate-700 dark:text-slate-300">
                            {ev.unitLabel}
                          </span>
                        </div>
                      </div>
                      <div className="text-xs font-black text-slate-900 dark:text-white">
                        {ev.file}
                      </div>
                      <blockquote className="border-l-2 border-[#1F3FE0] pl-3 text-xs text-slate-700 dark:text-slate-300 italic leading-relaxed">
                        &ldquo;{ev.excerpt}&rdquo;
                      </blockquote>
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 font-mono text-[10px] text-slate-500">
                        <span>SHA-256: {String(ev.sha256 || '').slice(0, 16)}…</span>
                        {ev.evidenceId && <span>ID: {ev.evidenceId.slice(0, 18)}…</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!loading && data && activeResultTab === 'campos' && (
                <div className="space-y-2.5">
                  {(data.camposMatched || []).length === 0 ? (
                    <div className="text-xs text-slate-500 text-center py-6">
                      Nenhum campo específico retornado para este termo. Tente buscar por ex: <code>TCR 0</code>, <code>CAVV</code>, <code>0195</code>, <code>ARN</code>, <code>IBGE</code>.
                    </div>
                  ) : (
                    data.camposMatched.map((c, idx) => (
                      <div
                        key={idx}
                        className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950 p-3.5 space-y-1.5 text-xs"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-[#1F3FE0] dark:text-blue-300 font-mono text-[10px] font-black">
                            {c.bandeira} · {c.registro || 'Layout'}
                          </span>
                          <span className="font-mono text-[11px] font-bold text-slate-600 dark:text-slate-400">
                            Pos: {c.posicao || '-'} · Tam: {c.tamanho || '-'} · Formato: {c.formato || '-'}
                          </span>
                        </div>
                        <div className="font-black text-slate-900 dark:text-white">
                          {c.nome} {c.de_pds ? `(${c.de_pds})` : ''}
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                          {c.descricao}
                        </p>
                        <div className="font-mono text-[10px] text-slate-500 pt-1 border-t border-slate-200/70 dark:border-slate-800">
                          Fonte: {c.documento} (p. {c.pagina || 1}) · Origem: {c.source}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {!loading && data && activeResultTab === 'tarifas' && (
                <div className="space-y-3">
                  {(data.tarifasMatched || []).map((t, idx) => (
                    <div
                      key={`tar-${idx}`}
                      className="rounded-2xl border border-amber-200 dark:border-amber-500/30 bg-amber-50/50 dark:bg-amber-950/20 p-3.5 space-y-1 text-xs"
                    >
                      <div className="flex items-center justify-between font-mono text-[10px] font-black text-amber-800 dark:text-amber-300">
                        <span>{t.bandeira || 'BANDEIRA'} · TARIFA / BILLING LINE</span>
                        <span>{t.billing_line || t.event_id || t.codigo || 'FEE'}</span>
                      </div>
                      <div className="font-black text-slate-900 dark:text-white">
                        {t.nome_tarifa || t.titulo || t.nome || 'Linha de Tarifação'}
                      </div>
                      <div className="text-slate-700 dark:text-slate-300">
                        {t.valor || t.taxa || t.descricao_linha || t.resumo || JSON.stringify(t)}
                      </div>
                    </div>
                  ))}

                  {(data.regulatorioMatched || []).map((ob, idx) => (
                    <div
                      key={`reg-${idx}`}
                      className="rounded-2xl border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 p-3.5 space-y-1 text-xs"
                    >
                      <div className="font-mono text-[10px] font-black text-emerald-800 dark:text-emerald-300">
                        REGULATÓRIO BACEN / CMN · {ob.fonte_localizador}
                      </div>
                      <div className="font-black text-slate-900 dark:text-white">{ob.tema}</div>
                      <div className="text-slate-700 dark:text-slate-300">
                        {ob.acao_candidata_descritiva}
                      </div>
                    </div>
                  ))}

                  {(data.tarifasMatched?.length || 0) === 0 &&
                    (data.regulatorioMatched?.length || 0) === 0 && (
                      <div className="text-xs text-slate-500 text-center py-6">
                        Nenhuma tarifa ou norma específica encontrada para este filtro. Tente termos como <code>VSS</code>, <code>BRL</code>, <code>EIRF</code>, <code>GDIP</code>, <code>BCB 304</code>.
                      </div>
                    )}
                </div>
              )}
            </div>

            {/* Footer do Drawer: Enviar Parecer + Evidências para o Doc Studio (/editor) */}
            {data && (
              <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                <span className="text-[11px] font-mono text-slate-500">
                  {data.evidence?.length || 0} PDFs · {data.camposMatched?.length || 0} campos SQLite citados
                </span>
                <button
                  onClick={() => {
                    const evRows = (data.evidence || [])
                      .slice(0, 5)
                      .map(
                        (e) =>
                          `<li><strong>${e.file}</strong> (${e.unitLabel} · SHA-256 <code>${String(e.sha256 || '').slice(0, 12)}</code>): <em>"${e.excerpt}"</em></li>`
                      )
                      .join('');
                    const campoRows = (data.camposMatched || [])
                      .slice(0, 6)
                      .map(
                        (c) =>
                          `<tr><td>${c.bandeira}</td><td><code>${c.registro}</code></td><td><strong>${c.nome}</strong></td><td><code>${c.posicao}</code> (${c.tamanho})</td><td>${c.descricao}</td></tr>`
                      )
                      .join('');
                    sendToDocStudio({
                      mode: 'append_html',
                      title: `Parecer IA + Acervo — ${data.query}`,
                      sourceModule: 'Cérebro IA + Sistema de Acervo (SQLite FTS5)',
                      metadata: {
                        brand:
                          bandeira === 'visa' || bandeira === 'mastercard' || bandeira === 'elo'
                            ? bandeira
                            : 'geral',
                        brandName: bandeira.toUpperCase(),
                        referenceId: `ACERVO-AI-${Date.now().toString().slice(-5)}`,
                        category: 'Parecer Normativo c/ Lastro SQLite',
                        effectiveDate: '2026 / 2027',
                        riskLevel: data.scopeConflicts?.length ? 'Alto' : 'Médio',
                        executiveSummary: `Consulta unificada ao Sistema de Acervo para "${data.query}" com ${data.evidence?.length || 0} evidências documentais e ${data.camposMatched?.length || 0} campos catalogados.`,
                        recommendedAction: 'Validar paridade entre Autorização (0100/0110) e Clearing Outgoing.',
                      },
                      html: `
                        <h3>Parecer Técnico da IA &amp; Sistema de Acervo — ${data.query}</h3>
                        <h4>1. Evidências Documentais Verificadas (acervo.sqlite3)</h4>
                        <ul>${evRows}</ul>
                        ${
                          campoRows
                            ? `<h4>2. Campos Técnicos Catalogados (campos.sqlite3)</h4>
                               <table><thead><tr><th>Bandeira</th><th>Registro</th><th>Campo</th><th>Posição/Tam</th><th>Regra &amp; Impacto</th></tr></thead><tbody>${campoRows}</tbody></table>`
                            : ''
                        }
                      `,
                    });
                    setIsOpen(false);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-[#1F3FE0] hover:bg-blue-700 text-white text-xs font-black transition-all"
                >
                  📝 Enviar Parecer + Evidências para o Doc Studio (/editor)
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
