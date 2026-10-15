"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Lock, Unlock, ShieldCheck, ArrowRight, Calculator,
  Terminal, Scale, FileText, Database, BookOpen,
  Layers, Globe, AlertTriangle, RefreshCw,
  LogOut, Cpu, BarChart2, DollarSign, Search,
  Eye, CheckCircle2, Filter, Command
} from "lucide-react";
import {
  ADMIN_MODULE_CATEGORIES,
  ALL_ADMIN_TOOLS,
  ToolCardMeta
} from "@/lib/adminModulesCatalog";

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
  ArrowRight
};

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  // Cockpit Interactive Controls
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("ALL");
  const [detailedView, setDetailedView] = useState<boolean>(false);
  const [hoveredTool, setHoveredTool] = useState<ToolCardMeta>(
    ALL_ADMIN_TOOLS.find((t) => t.id === "arquivos-central") || ALL_ADMIN_TOOLS[0]
  );

  useEffect(() => {
    const hasCookie = document.cookie.split(";").some((c) => c.trim().startsWith("vs_internal_pass=1"));
    setIsAuthenticated(hasCookie);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.trim() === "vs2026") {
      document.cookie = "vs_internal_pass=1; path=/; max-age=2592000; SameSite=Lax";
      setIsAuthenticated(true);
      setErrorMsg("");
      window.location.href = "/admin";
    } else {
      setErrorMsg("Chave de acesso incorreta. Tente novamente.");
    }
  };

  const handleLogout = () => {
    document.cookie = "vs_internal_pass=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    window.location.href = "/?logout=1";
  };

  const filteredModules = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return ADMIN_MODULE_CATEGORIES.map((mod) => {
      const tools = mod.tools.filter((t) => {
        if (selectedRole !== "ALL" && !t.roles.includes(selectedRole as any)) {
          return false;
        }
        if (!q) return true;
        const hay = `${t.title} ${t.desc} ${t.whatItIs} ${t.badge} ${t.url} ${t.features.join(" ")} ${t.dataSources.join(" ")} ${t.keywords.join(" ")}`.toLowerCase();
        return hay.includes(q);
      });
      return { ...mod, tools };
    }).filter((mod) => mod.tools.length > 0);
  }, [searchQuery, selectedRole]);

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-[#030711] flex items-center justify-center text-slate-500 text-xs">
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
            <h1 className="text-xl font-bold text-white">
              Cockpit do Proprietário
            </h1>
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
                <p className="text-xs text-red-400 mt-2 font-medium">
                  {errorMsg}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl font-bold text-xs bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center gap-2 shadow-md shadow-blue-600/30 transition-all"
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

  // ── Painel Desbloqueado: Command Center Executivo (50+ Ferramentas) ──
  return (
    <main className="min-h-screen bg-[#030711] pb-24">
      {/* Header do Cockpit */}
      <div className="border-b border-slate-800 bg-[#080d16]/95 px-6 py-5 sticky top-0 z-40 backdrop-blur-md">
        <div className="mx-auto max-w-7xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 font-mono">
                Command Center Proprietário · {ALL_ADMIN_TOOLS.length} Módulos Operacionais Ativos
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-black text-white">
              Cockpit Privado & Central Completa de Engenharia de Bandeiras
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Passe o mouse sobre qualquer um dos {ALL_ADMIN_TOOLS.length} módulos abaixo para inspecionar em detalhes do que se trata, quais bancos/manuais alimentam a ferramenta e o que você simula lá dentro.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/editor"
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/25 transition-all"
            >
              <FileText size={14} />
              <span>Doc Studio (Criar Documentos)</span>
            </Link>

            <button
              onClick={() => window.dispatchEvent(new Event("open-command-palette"))}
              className="px-3.5 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-xs font-bold text-purple-200 flex items-center gap-2 transition-all"
            >
              <Command size={14} className="text-purple-400" />
              <span>Busca Universal</span>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-950 text-[10px] font-mono text-purple-300 border border-purple-500/30">
                Ctrl+K
              </kbd>
            </button>

            <button
              onClick={() => setDetailedView(!detailedView)}
              className={`px-3.5 py-2 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all ${
                detailedView
                  ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/20"
                  : "bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-200"
              }`}
            >
              <Eye size={14} className={detailedView ? "text-white" : "text-blue-400"} />
              <span>{detailedView ? "Visão Raio-X Ativa (Todos Expandidos)" : "Expandir Raio-X em Todos os Cards"}</span>
            </button>

            <Link
              href="/"
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 flex items-center gap-2 transition-all"
            >
              <Globe size={13} className="text-blue-400" />
              <span>Ver Home Pública</span>
            </Link>

            <button
              onClick={handleLogout}
              className="px-3.5 py-2 rounded-xl bg-red-950/30 hover:bg-red-900/40 border border-red-500/30 text-xs font-semibold text-red-300 flex items-center gap-2 transition-all"
              title="Bloquear e voltar ao modo público"
            >
              <LogOut size={13} />
              <span>Bloquear / Sair</span>
            </button>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="mx-auto max-w-7xl px-6 pt-8 space-y-8">
        {/* Atalhos Diretos para o Sistema de Arquivos & Motores Principais */}
        <div className="rounded-3xl border border-slate-800 bg-gradient-to-r from-blue-950/25 via-[#0a101d] to-purple-950/20 p-5 md:p-6 space-y-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                <Database size={24} />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-base font-extrabold text-white">
                    Infraestrutura Unificada: Acervo Normativo + Sistemas de Arquivos (GCMS, MPE, MCBS, Base II, VSS & Elo)
                  </span>
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-mono">
                    ● {ALL_ADMIN_TOOLS.length} Ferramentas Online
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  <strong>35.336 manuais</strong> (517.548 páginas) · <strong>17.106 campos posicionais/ISO</strong> (`campos.sqlite3`) · <strong>2.267 eventos MCBS Brasil</strong> + <strong>10.914 linhas Visa VSS</strong> · <strong>1.128 alíquotas de intercâmbio</strong> · <strong>381 boletins de release</strong>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <Link
                href="/editor"
                className="px-3 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-xs font-bold text-emerald-300 flex items-center gap-1.5 transition-all"
              >
                <FileText size={13} />
                <span>Editor de Documentos (IA)</span>
              </Link>
              <Link
                href="/compliance/arquivos?tab=parser"
                className="px-3 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-xs font-bold text-blue-300 flex items-center gap-1.5 transition-all"
              >
                <Terminal size={13} />
                <span>Parser + Lote Multi-Linha</span>
              </Link>
              <Link
                href="/compliance/arquivos?tab=campos"
                className="px-3 py-2 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/40 text-xs font-bold text-cyan-300 flex items-center gap-1.5 transition-all"
              >
                <Database size={13} />
                <span>17.106 Campos SQLite</span>
              </Link>
              <Link
                href="/compliance/arquivos?tab=billing"
                className="px-3 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-xs font-bold text-purple-300 flex items-center gap-1.5 transition-all"
              >
                <DollarSign size={13} />
                <span>Simulador Fatura MCBS & VSS</span>
              </Link>
              <Link
                href="/acervo"
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Search size={13} />
                <span>Buscar nos 35k Manuais</span>
              </Link>
            </div>
          </div>

          {/* Barra de Busca Rápida & Filtro por Papel no Arranjo */}
          <div className="pt-4 border-t border-slate-800/80 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-xl">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filtrar entre os 50+ módulos por tema, arquivo ou código (ex: MCBS, EMV, TVR, BRAM, MATCH, Bets, 7995, PayFac, CIT/MIT)..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#030711] border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-slate-400 hover:text-white"
                >
                  Limpar
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] text-slate-400 mr-1 flex items-center gap-1">
                <Filter className="w-3 h-3" /> Filtrar por Visão:
              </span>
              {[
                { id: "ALL", label: `Todos (${ALL_ADMIN_TOOLS.length})` },
                { id: "Adquirente", label: "Adquirente / Credenciadora" },
                { id: "Emissor", label: "Banco Emissor" },
                { id: "Subcredenciador", label: "Subcredenciador (PayFac)" },
                { id: "Backoffice", label: "Conciliação & Backoffice" },
                { id: "Regulatório", label: "Regulatório & Releases" }
              ].map((role) => (
                <button
                  key={role.id}
                  onClick={() => setSelectedRole(role.id)}
                  className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all border ${
                    selectedRole === role.id
                      ? "bg-blue-600/20 border-blue-500 text-blue-300"
                      : "bg-slate-900/90 border-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {role.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* =====================================================================
            PAINEL DE INSPEÇÃO EM TEMPO REAL AO PASSAR O MOUSE (RAIO-X DO MÓDULO)
           ===================================================================== */}
        {hoveredTool && (
          <div className="rounded-2xl border border-blue-500/35 bg-gradient-to-r from-[#071124] via-[#090f1d] to-[#0d0b20] p-5 shadow-xl transition-all">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3 mb-4">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/20 border border-blue-500/40 text-blue-300 text-[10px] font-bold uppercase tracking-wider">
                  <Eye className="w-3.5 h-3.5" /> Raio-X do Módulo Selecionado (Passe o mouse nos cards abaixo)
                </span>
                <span className="text-sm font-extrabold text-white">
                  {hoveredTool.title}
                </span>
                <span className="text-[11px] font-mono px-2.5 py-0.5 rounded bg-slate-900 text-emerald-300 border border-emerald-500/30">
                  {hoveredTool.badge}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {hoveredTool.roles.map((r) => (
                  <span
                    key={r}
                    className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-[10px] font-semibold text-slate-300"
                  >
                    {r}
                  </span>
                ))}
                <Link
                  href={hoveredTool.url}
                  className="ml-2 px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold inline-flex items-center gap-1.5 transition-colors"
                >
                  <span>Abrir Módulo</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 text-xs">
              {/* Col 1: Do que se trata */}
              <div className="lg:col-span-5 bg-[#030711]/90 border border-slate-800/90 rounded-xl p-4 space-y-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
                  Do que se trata este módulo
                </div>
                <p className="text-slate-200 leading-relaxed">
                  {hoveredTool.whatItIs}
                </p>
              </div>

              {/* Col 2: O que você faz lá dentro */}
              <div className="lg:col-span-4 bg-[#030711]/90 border border-slate-800/90 rounded-xl p-4 space-y-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                  O que você consulta & simula lá dentro
                </div>
                <ul className="space-y-1.5 text-slate-300">
                  {hoveredTool.features.map((feat, i) => (
                    <li key={i} className="flex items-start gap-2 leading-snug">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Col 3: Bases & Manuais Conectados */}
              <div className="lg:col-span-3 bg-[#030711]/90 border border-slate-800/90 rounded-xl p-4 space-y-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-purple-400">
                  Bases, Tabelas & Fontes Oficiais
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {hoveredTool.dataSources.map((src, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/25 font-mono text-[11px] text-purple-200"
                    >
                      {src}
                    </span>
                  ))}
                </div>
                <div className="pt-2 border-t border-slate-800/80 text-[11px] font-mono text-slate-400">
                  Rota: <span className="text-blue-400">{hoveredTool.url}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Lista de Categorias e Módulos */}
        {filteredModules.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-[#090e17] p-12 text-center space-y-3">
            <p className="text-sm font-bold text-white">
              Nenhum módulo encontrado para &ldquo;{searchQuery}&rdquo; no filtro selecionado.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedRole("ALL");
              }}
              className="px-4 py-2 rounded-xl bg-blue-600 text-xs font-bold text-white"
            >
              Limpar Filtros ({ALL_ADMIN_TOOLS.length} módulos disponíveis)
            </button>
          </div>
        ) : (
          filteredModules.map((mod, idx) => {
            const CatIcon = ICON_MAP[mod.iconName] || Layers;
            return (
              <section key={idx} className="space-y-4">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-2 pb-2 border-b border-slate-800/80">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <CatIcon size={18} className="text-blue-400" />
                      <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                        {mod.category}
                      </h2>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{mod.subtitle}</p>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500">
                    {mod.tools.length} {mod.tools.length === 1 ? "módulo" : "módulos"}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {mod.tools.map((tool) => {
                    const ToolIcon = ICON_MAP[tool.iconName] || Cpu;
                    const isHovered = hoveredTool?.id === tool.id;
                    return (
                      <Link
                        key={tool.id}
                        href={tool.url}
                        onMouseEnter={() => setHoveredTool(tool)}
                        className={`group p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                          isHovered
                            ? "bg-[#0d1526] border-blue-500/60 shadow-lg shadow-blue-950/30"
                            : "bg-[#090e17] border-slate-800/90 hover:border-blue-500/40 hover:bg-[#0c1320]"
                        }`}
                      >
                        <div className="space-y-2.5">
                          <div className="flex items-center justify-between gap-2">
                            <div
                              className={`w-9 h-9 rounded-xl flex items-center justify-center border ${tool.color} group-hover:scale-105 transition-transform`}
                            >
                              <ToolIcon size={16} />
                            </div>
                            <span className="text-[10px] font-mono px-2.5 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800">
                              {tool.badge}
                            </span>
                          </div>

                          <h3 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
                            {tool.title}
                          </h3>

                          <p className="text-xs text-slate-300 leading-relaxed">
                            {tool.desc}
                          </p>

                          {/* Detalhamento extra exibido ao passar o mouse no card OU quando o modo Raio-X está ativo */}
                          <div
                            className={`space-y-2.5 pt-2.5 border-t border-slate-800/80 transition-all ${
                              detailedView || isHovered ? "block" : "hidden group-hover:block"
                            }`}
                          >
                            <div className="bg-[#030711]/90 border border-slate-800/80 rounded-xl p-3">
                              <div className="text-[10px] font-bold uppercase tracking-wider text-blue-400 mb-1">
                                Do que se trata:
                              </div>
                              <p className="text-[11px] text-slate-200 leading-relaxed">
                                {tool.whatItIs}
                              </p>
                            </div>

                            <div className="space-y-1">
                              <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                                O que você faz aqui:
                              </div>
                              {tool.features.map((f, fIdx) => (
                                <div key={fIdx} className="text-[11px] text-slate-300 flex items-start gap-1.5 leading-snug">
                                  <span className="text-emerald-400 font-bold">•</span>
                                  <span>{f}</span>
                                </div>
                              ))}
                            </div>

                            <div className="flex flex-wrap gap-1 pt-1">
                              {tool.dataSources.map((src, sIdx) => (
                                <span
                                  key={sIdx}
                                  className="px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 font-mono text-[10px] text-purple-300"
                                >
                                  {src}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="pt-2.5 border-t border-slate-800/60 flex items-center justify-between gap-2">
                          <div className="flex flex-wrap gap-1">
                            {tool.roles.slice(0, 3).map((r) => (
                              <span
                                key={r}
                                className="px-1.5 py-0.5 rounded bg-slate-900/90 border border-slate-800 text-[9px] text-slate-400"
                              >
                                {r}
                              </span>
                            ))}
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] text-blue-400 font-semibold shrink-0">
                            <span>Abrir</span>
                            <ArrowRight
                              size={12}
                              className="group-hover:translate-x-1 transition-all"
                            />
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </section>
            );
          })
        )}
      </div>
    </main>
  );
}
