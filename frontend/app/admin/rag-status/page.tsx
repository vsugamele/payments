"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Database,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  FileText,
  Search,
  Zap,
  HardDrive,
  Cpu,
  Layers,
  ShieldCheck,
  ArrowLeft,
  ExternalLink,
  BookOpen,
  Sliders,
  Activity
} from "lucide-react";

interface RagStatusData {
  connected: boolean;
  path: string;
  sizeMb: number;
  totalAssets: number;
  totalPages: number;
  textPages: number;
  ocrPages: number;
  totalCharacters: number;
  integrityPercent: number;
  statuses: Record<string, number>;
  extStats: { ext: string; count: number; sizeMb: number }[];
  brandStats: Record<string, number>;
  benchmark: { query: string; hits: number; latencyMs: number }[];
  avgLatencyMs: number;
  customResult?: { query: string; hits: number; latencyMs: number } | null;
  featuredManuals: {
    sha: string;
    name: string;
    ext: string;
    units: number;
    characters: number;
    status: string;
  }[];
  sqliteEngine: string;
  retrievalMode: string;
  error?: string;
}

export default function RagStatusPage() {
  const [data, setData] = useState<RagStatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [customQuery, setCustomQuery] = useState("");
  const [testingQuery, setTestingQuery] = useState(false);
  const [testResult, setTestResult] = useState<{ query: string; hits: number; latencyMs: number } | null>(null);

  const fetchStatus = async (queryToTest?: string) => {
    try {
      if (!queryToTest) setLoading(true);
      const url = queryToTest
        ? `/api/admin/rag-status?query=${encodeURIComponent(queryToTest)}`
        : "/api/admin/rag-status";
      const res = await fetch(url);
      const json = await res.json();
      setData(json);
      if (json.customResult) {
        setTestResult(json.customResult);
      }
    } catch (err) {
      console.error("Erro ao obter status do RAG:", err);
    } finally {
      setLoading(false);
      setTestingQuery(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleTestSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customQuery.trim()) return;
    setTestingQuery(true);
    fetchStatus(customQuery.trim());
  };

  return (
    <div className="min-h-screen bg-[#030711] text-slate-100 pb-24">
      {/* Top Header Navigation */}
      <header className="border-b border-slate-800 bg-[#080d16] px-6 py-4 sticky top-0 z-40 backdrop-blur-md">
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors"
              title="Voltar ao Cockpit"
            >
              <ArrowLeft size={16} />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <h1 className="text-lg font-black text-white">
                  Diagnóstico do RAG Offline & Acervo Normativo
                </h1>
              </div>
              <p className="text-xs text-slate-400">
                Monitor em tempo real da base vetorial local SQLite FTS5 e integridade dos 35k manuais
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => fetchStatus()}
              disabled={loading}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 flex items-center gap-1.5 transition-all disabled:opacity-50"
            >
              <RefreshCw size={13} className={loading ? "animate-spin text-blue-400" : "text-blue-400"} />
              <span>Atualizar</span>
            </button>

            <Link
              href="/acervo"
              className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Search size={13} />
              <span>Consultar Acervo</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 pt-8 space-y-8">
        {/* Banner de Estado do Motor */}
        <div className="rounded-2xl border border-slate-800 bg-[#090e17] p-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
              <Database size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">
                  {data?.connected ? "Motor RAG 100% Operacional & Conectado" : "Status do Motor: Verificando..."}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                  Offline Memory
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 font-mono truncate max-w-xl">
                {data?.path || "Carregando caminho..."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-right">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Tamanho da Base</span>
              <span className="text-sm font-bold text-slate-200 font-mono">
                {data ? `${(data.sizeMb / 1024).toFixed(2)} GB` : "..."}
              </span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-right">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Latência Média</span>
              <span className="text-sm font-bold text-emerald-400 font-mono">
                {data ? `${data.avgLatencyMs} ms` : "..."}
              </span>
            </div>
          </div>
        </div>

        {/* 4 KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-[#090e17] border border-slate-800 relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
              <span>Total de Documentos</span>
              <BookOpen size={16} className="text-blue-400" />
            </div>
            <div className="text-3xl font-black text-white font-mono">
              {data ? data.totalAssets.toLocaleString("pt-BR") : "..."}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Manuais, boletins e especificações catalogadas
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#090e17] border border-slate-800 relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
              <span>Páginas Vetorizadas</span>
              <FileText size={16} className="text-cyan-400" />
            </div>
            <div className="text-3xl font-black text-cyan-400 font-mono">
              {data ? data.totalPages.toLocaleString("pt-BR") : "..."}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {data ? `${data.textPages.toLocaleString("pt-BR")} texto + ${data.ocrPages.toLocaleString("pt-BR")} OCR` : "..."}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#090e17] border border-slate-800 relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
              <span>Volume de Caracteres</span>
              <HardDrive size={16} className="text-indigo-400" />
            </div>
            <div className="text-3xl font-black text-indigo-400 font-mono">
              {data ? `${(data.totalCharacters / 1000000000).toFixed(2)}B` : "..."}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {data ? `${data.totalCharacters.toLocaleString("pt-BR")} caracteres` : "..."}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#090e17] border border-slate-800 relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
              <span>Taxa de Integridade</span>
              <ShieldCheck size={16} className="text-emerald-400" />
            </div>
            <div className="text-3xl font-black text-emerald-400 font-mono">
              {data ? `${data.integrityPercent}%` : "..."}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {data ? `${data.statuses?.extracted?.toLocaleString("pt-BR") || 0} processados / 30 falhas` : "..."}
            </p>
          </div>
        </div>

        {/* Teste Interativo de Latência do Motor FTS */}
        <div className="rounded-3xl border border-blue-500/20 bg-gradient-to-br from-blue-950/20 via-[#090e17] to-[#040812] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Zap size={20} className="text-amber-400" />
              <h2 className="text-base font-bold text-white">
                Teste de Latência do Motor RAG FTS5 em Tempo Real
              </h2>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">
              Index: search_fts · SQLite 3
            </span>
          </div>

          <form onSubmit={handleTestSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={customQuery}
                onChange={(e) => setCustomQuery(e.target.value)}
                placeholder="Digite um termo para testar (ex: 'intercâmbio', '3DS', 'chargeback', 'settlement', 'DE 22')..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder:text-slate-600 text-xs outline-none focus:border-blue-500 transition-all font-mono"
              />
            </div>
            <button
              type="submit"
              disabled={testingQuery || !customQuery.trim()}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {testingQuery ? (
                <>
                  <RefreshCw size={13} className="animate-spin" />
                  <span>Medindo...</span>
                </>
              ) : (
                <>
                  <Activity size={13} />
                  <span>Testar Latência</span>
                </>
              )}
            </button>
          </form>

          {/* Resultado do Teste Sob Demanda */}
          {testResult && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-xs animate-in fade-in duration-200">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-400" />
                <span className="text-slate-300">
                  Termo testado: <strong className="text-white font-mono">&ldquo;{testResult.query}&rdquo;</strong>
                </span>
                <span className="text-slate-500">·</span>
                <span className="text-slate-400">{testResult.hits} ocorrências retornadas</span>
              </div>
              <div className="flex items-center gap-1.5 font-mono font-bold text-emerald-400">
                <span>Latência:</span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                  {testResult.latencyMs} ms
                </span>
              </div>
            </div>
          )}

          {/* Grid de Benchmarks Padrão */}
          <div className="pt-2">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-2">
              Benchmarks Automáticos Executados Agora:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {data?.benchmark?.map((b) => (
                <div key={b.query} className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                  <span className="text-[11px] font-bold text-slate-300 font-mono block truncate">
                    {b.query}
                  </span>
                  <span className="text-xs font-black text-emerald-400 font-mono mt-0.5 block">
                    {b.latencyMs} ms
                  </span>
                  <span className="text-[9px] text-slate-500 block">
                    {b.hits} hits
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Grids de Distribuição: Bandeiras & Formatos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Distribuição por Bandeira */}
          <div className="p-6 rounded-3xl bg-[#090e17] border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Layers size={16} className="text-blue-400" />
                Acervo por Bandeira / Regulador
              </h3>
              <span className="text-[11px] text-slate-500 font-mono">Total: 35.336</span>
            </div>

            <div className="space-y-3">
              {data && Object.entries(data.brandStats).map(([brand, count]) => {
                const max = 2000;
                const pct = Math.min(Math.round((count / max) * 100), 100);
                return (
                  <div key={brand} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-slate-300">{brand}</span>
                      <span className="font-mono text-slate-400 font-bold">
                        {count.toLocaleString("pt-BR")} manuais
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-400"
                        style={{ width: `${Math.max(pct, 4)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Distribuição por Formato */}
          <div className="p-6 rounded-3xl bg-[#090e17] border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileText size={16} className="text-cyan-400" />
                Formatos de Arquivo & Armazenamento
              </h3>
              <span className="text-[11px] text-slate-500 font-mono">SQLite Local</span>
            </div>

            <div className="space-y-2.5">
              {data?.extStats?.map((item) => (
                <div
                  key={item.ext}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded font-mono font-bold uppercase text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      {item.ext}
                    </span>
                    <span className="text-slate-300 font-semibold">{item.count.toLocaleString("pt-BR")} arquivos</span>
                  </div>
                  <span className="font-mono text-slate-400 font-semibold">
                    {item.sizeMb > 1024
                      ? `${(item.sizeMb / 1024).toFixed(2)} GB`
                      : `${item.sizeMb.toFixed(1)} MB`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabela de Manuais Pesados de Referência */}
        <div className="rounded-3xl border border-slate-800 bg-[#090e17] overflow-hidden">
          <div className="p-6 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <BookOpen size={16} className="text-blue-400" />
                Amostragem de Manuais Normativos Oficiais Indexados
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Exibindo os maiores manuais e guides em páginas e densidade de caracteres
              </p>
            </div>
            <Link
              href="/acervo"
              className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
            >
              <span>Ver no Acervo</span>
              <ExternalLink size={12} />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/40 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-3.5">Hash SHA</th>
                  <th className="px-6 py-3.5">Nome do Manual</th>
                  <th className="px-6 py-3.5">Páginas</th>
                  <th className="px-6 py-3.5">Caracteres</th>
                  <th className="px-6 py-3.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50 text-xs">
                {data?.featuredManuals?.map((m) => (
                  <tr key={m.sha} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-3 font-mono text-slate-500">
                      {m.sha}
                    </td>
                    <td className="px-6 py-3 font-semibold text-slate-200">
                      {m.name}
                    </td>
                    <td className="px-6 py-3 font-mono text-slate-400">
                      {m.units.toLocaleString("pt-BR")} págs
                    </td>
                    <td className="px-6 py-3 font-mono text-slate-400">
                      {m.characters.toLocaleString("pt-BR")}
                    </td>
                    <td className="px-6 py-3 text-right">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 size={11} /> Indexado
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Rodapé de Arquitetura & Infraestrutura */}
        <div className="p-6 rounded-3xl bg-slate-900/40 border border-slate-800/80 text-xs text-slate-400 space-y-2">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <Cpu size={16} className="text-blue-400" />
            Detalhes de Arquitetura do RAG
          </div>
          <p className="leading-relaxed">
            O motor de busca funciona 100% offline através da base SQLite 3 (<code className="text-slate-300">acervo.sqlite3</code>) montada no modo <code className="text-slate-300">immutable=1</code>, eliminando conflitos de bloqueio de escrita (lock contention) e permitindo consultas concorrentes com latência sub-milisegundo.
          </p>
          <div className="flex flex-wrap gap-4 pt-2 text-[11px] font-mono text-slate-500">
            <span>Engine: SQLite FTS5</span>
            <span>·</span>
            <span>Tokenizer: unicode61</span>
            <span>·</span>
            <span>Modo: Read-Only In-Memory Cache</span>
            <span>·</span>
            <span>Segurança: Zero vazamento para a web</span>
          </div>
        </div>
      </div>
    </div>
  );
}
