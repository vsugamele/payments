"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Lock, Unlock, ShieldCheck, ArrowRight, Calculator, 
  Terminal, Scale, FileText, Database, BookOpen, 
  Layers, Globe, AlertTriangle, ExternalLink, RefreshCw,
  LogOut, CheckCircle2, Cpu, BarChart2, DollarSign, Search
} from "lucide-react";

interface ToolCard {
  title: string;
  desc: string;
  url: string;
  badge: string;
  icon: any;
  color: string;
}

const MODULES: { category: string; icon: any; tools: ToolCard[] }[] = [
  {
    category: "1. Simuladores & Motores Financeiros",
    icon: Calculator,
    tools: [
      {
        title: "Simulador de Intercâmbio & Downgrade",
        desc: "Cálculo em tempo real de cascatas Visa, MC, Elo e projeção de sangramento financeiro em R$/mês.",
        url: "/simulador",
        badge: "Cascata & Downgrade",
        icon: Calculator,
        color: "text-blue-400 bg-blue-500/10 border-blue-500/20"
      },
      {
        title: "Matriz de Decisão de Intercâmbio",
        desc: "Passo a passo por produto, canal de captura, autenticação e MCC.",
        url: "/matrix",
        badge: "Decisão 5 Passos",
        icon: BarChart2,
        color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20"
      },
      {
        title: "Tarifas Mastercard MCBS",
        desc: "Catálogo completo de Scheme Fees e Service IDs reais aplicados no Brasil.",
        url: "/mcbs",
        badge: "Scheme Fees",
        icon: DollarSign,
        color: "text-purple-400 bg-purple-500/10 border-purple-500/20"
      },
      {
        title: "Anatomia do MDR & Split",
        desc: "Decomposição de custos entre Banco Emissor, Bandeira e Adquirente.",
        url: "/mdr",
        badge: "Spread",
        icon: Scale,
        color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
      }
    ]
  },
  {
    category: "2. Inteligência Regulatória & Acervo Normativo",
    icon: Database,
    tools: [
      {
        title: "Acervo Normativo & RAG Offline",
        desc: "Busca semântica em 35.336 manuais oficiais e 517k blocos da Visa, MC, Elo e Bacen.",
        url: "/acervo",
        badge: "35k Manuais RAG",
        icon: BookOpen,
        color: "text-amber-400 bg-amber-500/10 border-amber-500/20"
      },
      {
        title: "Consultas Públicas das Bandeiras",
        desc: "Acompanhamento executivo de consultas regulatórias abertas e encerradas de Visa, MC e Elo.",
        url: "/consultas",
        badge: "Regulatório",
        icon: FileText,
        color: "text-orange-400 bg-orange-500/10 border-orange-500/20"
      },
      {
        title: "Status da Base RAG Local",
        desc: "Métricas de indexação SQLite FTS e diagnóstico do motor de busca offline.",
        url: "/admin/rag-status",
        badge: "Infra",
        icon: Database,
        color: "text-slate-400 bg-slate-500/10 border-slate-500/20"
      }
    ]
  },
  {
    category: "3. Engenharia de Mensageria & Clearing",
    icon: Terminal,
    tools: [
      {
        title: "Inspetor & Linter Visual ISO 8583 / Base II",
        desc: "Dissecação campo a campo de autorização e clearing com checagem de regras de compliance.",
        url: "/compliance/linter",
        badge: "Validador Raw",
        icon: Terminal,
        color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
      },
      {
        title: "Comparativo Base II vs IPM",
        desc: "Arquitetura de clearing e mensageria VisaNet x Mastercard lado a lado.",
        url: "/comparativo",
        badge: "Clearing Comparado",
        icon: Layers,
        color: "text-blue-400 bg-blue-500/10 border-blue-500/20"
      },
      {
        title: "Dicionário de Campos ISO (DE & PDS)",
        desc: "Lookup de elementos de dados da ISO 8583 e impactos no intercâmbio.",
        url: "/compliance/campos",
        badge: "Dicionário DE",
        icon: Cpu,
        color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20"
      },
      {
        title: "Jornada da Transação",
        desc: "Ciclo completo do POS/Pinpad ao clearing e liquidação multilateral.",
        url: "/jornada",
        badge: "Fluxo Visual",
        icon: Globe,
        color: "text-teal-400 bg-teal-500/10 border-teal-500/20"
      }
    ]
  },
  {
    category: "4. Compliance, Riscos & Conciliação",
    icon: ShieldCheck,
    tools: [
      {
        title: "Playbook de Conciliação Financeira",
        desc: "Batimento em 3 pontas: Captura interna vs Relatórios VSS 110 / MCBS vs Liquidação CIP e Bacen.",
        url: "/compliance/conciliacao",
        badge: "3-Way Batimento",
        icon: Scale,
        color: "text-amber-400 bg-amber-500/10 border-amber-500/20"
      },
      {
        title: "Hub Central de Compliance",
        desc: "Visão panorâmica de todos os 25+ tópicos regulatórios de bandeiras e adquirentes.",
        url: "/compliance",
        badge: "Central Compliance",
        icon: ShieldCheck,
        color: "text-blue-400 bg-blue-500/10 border-blue-500/20"
      },
      {
        title: "Matriz de Retentativas & Response Codes",
        desc: "Regras do Visa Art. 2.11 e Mastercard TPE para Soft vs Hard Declines.",
        url: "/compliance/retentativas",
        badge: "Smart Retries",
        icon: RefreshCw,
        color: "text-rose-400 bg-rose-500/10 border-rose-500/20"
      },
      {
        title: "3-D Secure & Liability Shift",
        desc: "Simulador de valores ECI e proteção jurídica contra contestação por fraude.",
        url: "/compliance/3ds",
        badge: "Liability Shift",
        icon: ShieldCheck,
        color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
      },
      {
        title: "Ciclo de Settlement & Liquidação",
        desc: "O que acontece de D+0 a D+3 entre bandeiras, câmaras de compensação e STR Bacen.",
        url: "/compliance/settlement",
        badge: "D+0 a D+3",
        icon: DollarSign,
        color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20"
      },
      {
        title: "Gestão de Chargebacks & Disputas",
        desc: "Ciclo de pré-arbitragem, VROL, MCOM e Reason Codes.",
        url: "/compliance/disputas",
        badge: "Disputas",
        icon: AlertTriangle,
        color: "text-red-400 bg-red-500/10 border-red-500/20"
      }
    ]
  },
  {
    category: "5. Estúdio & Mapas Arquiteturais",
    icon: Layers,
    tools: [
      {
        title: "Doc Studio: Editor de Pareceres com IA",
        desc: "Editor executivo com IA Copilot, diff de releases e exportação em DOCX e PDF.",
        url: "/editor",
        badge: "Editor IA",
        icon: FileText,
        color: "text-purple-400 bg-purple-500/10 border-purple-500/20"
      },
      {
        title: "Atlas de Liquidação VisaNet & MCBS",
        desc: "Diagramas interativos de compensação e liquidação multilateral.",
        url: "/mapa/liquidacao",
        badge: "Atlas Gráfico",
        icon: Globe,
        color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20"
      },
      {
        title: "Guia Estrutural de Tarifas MCBS",
        desc: "Mapa visual hierárquico do sistema de faturamento Mastercard.",
        url: "/mapa/mcbs",
        badge: "Mapa MCBS",
        icon: Layers,
        color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20"
      },
      {
        title: "Mapa do Conhecimento",
        desc: "Grafo interativo com 39 conceitos conectados de meios de pagamento.",
        url: "/mapa",
        badge: "Grafo 39 Conceitos",
        icon: Globe,
        color: "text-blue-400 bg-blue-500/10 border-blue-500/20"
      },
      {
        title: "Trilhas de Aprendizado",
        desc: "Módulos guiados do básico aos conceitos avançados de bandeiras.",
        url: "/trilhas",
        badge: "Trilhas",
        icon: BookOpen,
        color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
      },
      {
        title: "Artigos Técnicos & Estratégicos",
        desc: "Análises aprofundadas sobre DAF, Compelling Evidence 3.0 e regulação.",
        url: "/artigos",
        badge: "Artigos",
        icon: FileText,
        color: "text-slate-300 bg-slate-500/10 border-slate-500/20"
      }
    ]
  }
];

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    // Checa se o cookie vs_internal_pass está ativo
    const hasCookie = document.cookie.split(";").some((c) => c.trim().startsWith("vs_internal_pass=1"));
    setIsAuthenticated(hasCookie);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.trim() === "vs2026") {
      // Grava cookie com validade de 30 dias
      document.cookie = "vs_internal_pass=1; path=/; max-age=2592000; SameSite=Lax";
      setIsAuthenticated(true);
      setErrorMsg("");
    } else {
      setErrorMsg("Chave de acesso incorreta. Tente novamente.");
    }
  };

  const handleLogout = () => {
    document.cookie = "vs_internal_pass=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    window.location.href = "/?logout=1";
  };

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

  // ── Painel Desbloqueado: Todas as Ferramentas ──
  return (
    <main className="min-h-screen bg-[#030711] pb-24">
      {/* Header do Cockpit */}
      <div className="border-b border-slate-800 bg-[#080d16] px-6 py-6 sticky top-0 z-40 backdrop-blur-md">
        <div className="mx-auto max-w-6xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 font-mono">
                Modo Proprietário Desbloqueado
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-black text-white">
              Cockpit Privado & Central de Ferramentas
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Acesso irrestrito a todos os motores, RAG, simuladores e consultas. Para visitantes externos, o site exibe apenas o seu currículo.
            </p>
          </div>

          <div className="flex items-center gap-3">
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

      {/* Conteúdo: Lista de Módulos */}
      <div className="mx-auto max-w-6xl px-6 pt-10 space-y-10">
        {/* Banner de Status RAG em Tempo Real */}
        <div className="rounded-3xl border border-slate-800 bg-gradient-to-r from-blue-950/20 via-[#0a101d] to-[#040812] p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
              <Database size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">Acervo Normativo & RAG Offline</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                  ● 35.336 Manuais (5.0 GB)
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                517.548 páginas indexadas em SQLite FTS5 com latência sub-milisegundo (~0.2ms)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/admin/rag-status"
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-2 transition-all"
            >
              <Cpu size={14} className="text-emerald-400" />
              <span>Ver Diagnóstico RAG</span>
            </Link>

            <Link
              href="/acervo"
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
            >
              <Search size={14} />
              <span>Buscar no Acervo</span>
            </Link>
          </div>
        </div>

        {MODULES.map((mod, idx) => {
          const CatIcon = mod.icon;
          return (
            <section key={idx} className="space-y-4">
              <div className="flex items-center gap-2.5 pb-2 border-b border-slate-800/80">
                <CatIcon size={18} className="text-blue-400" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  {mod.category}
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {mod.tools.map((tool, tIdx) => {
                  const ToolIcon = tool.icon;
                  return (
                    <Link
                      key={tIdx}
                      href={tool.url}
                      className="group p-5 rounded-2xl bg-[#090e17] border border-slate-800/90 hover:border-blue-500/40 hover:bg-[#0c1320] transition-all flex flex-col justify-between space-y-3"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${tool.color} group-hover:scale-105 transition-transform`}>
                            <ToolIcon size={16} />
                          </div>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                            {tool.badge}
                          </span>
                        </div>
                        <h3 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
                          {tool.title}
                        </h3>
                        <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                          {tool.desc}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                        <span className="truncate max-w-[180px]">{tool.url}</span>
                        <ArrowRight size={12} className="text-slate-600 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}
