'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { BookOpen, Lock, ExternalLink, ArrowRight } from 'lucide-react';
import manuais from '@/data/manuais.json';
import AcervoExplorer from './AcervoExplorer';
import OutgoingAcervoConnector from '../compliance/outgoing/OutgoingAcervoConnector';
import { TeachAndDemonstrateHub } from '@/components/TeachAndDemonstrateHub';

const MANUAIS_COM_VIEWER = new Set(['mc-interchange-detalhado', 'vi-interchange-detalhado']);

type AcervoTabId = 'teach_demo' | 'sqlite_4motors' | 'rag_parecer' | 'manuais_cards';

export function AcervoOrganizedClient() {
  const [activeTab, setActiveTab] = useState<AcervoTabId>('teach_demo');
  const [manualBrandFilter, setManualBrandFilter] = useState<string>('ALL');

  const boxes: {
    id: AcervoTabId;
    icon: string;
    badge: string;
    title: string;
    desc: string;
  }[] = [
    {
      id: 'teach_demo',
      icon: '🎓',
      badge: 'LADO A LADO',
      title: '1. Guia por Produto (Ensinar + Demonstrar)',
      desc: 'Aprenda cada produto em caixinhas: explicação simples à esquerda e demonstração ao vivo à direita.',
    },
    {
      id: 'sqlite_4motors',
      icon: '🔎',
      badge: '4 SQLITES',
      title: '2. Busca nos 4 Bancos (40k PDFs & 17k Campos)',
      desc: 'Pesquise campos (TCR, PDS, Reg), tarifas e páginas de PDF com hash SHA-256 nos bancos locais.',
    },
    {
      id: 'rag_parecer',
      icon: '🧠',
      badge: 'PARECER IA',
      title: '3. Perguntar ao Cérebro Normativo (RAG)',
      desc: 'Faça uma pergunta aberta e receba um parecer estruturado citando manual e página física.',
    },
    {
      id: 'manuais_cards',
      icon: '📚',
      badge: 'GUIAS',
      title: '4. Biblioteca de Manuais Estruturados',
      desc: 'Navegue pelos capítulos resumidos dos principais guias de intercâmbio, clearing e disputas.',
    },
  ];

  const filteredManuais = manuais.filter((m) => {
    if (manualBrandFilter === 'ALL') return true;
    return m.bandeira.toLowerCase().includes(manualBrandFilter.toLowerCase());
  });

  return (
    <div className="space-y-6">
      {/* 4 Caixinhas Superiores de Organização (Exibe apenas 1 modo por vez para não poluir a tela) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {boxes.map((b) => {
          const active = activeTab === b.id;
          return (
            <button
              key={b.id}
              onClick={() => setActiveTab(b.id)}
              className={`rounded-2xl p-4 text-left border transition-all flex flex-col justify-between gap-2 ${
                active
                  ? 'bg-[#1F3FE0] text-white border-[#1F3FE0] shadow-md shadow-blue-600/20'
                  : 'bg-white dark:bg-slate-900/90 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:border-[#1F3FE0]'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-base">{b.icon}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-bold ${
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
                className={`text-[11px] leading-relaxed ${
                  active ? 'text-blue-100' : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {b.desc}
              </p>
            </button>
          );
        })}
      </div>

      {/* MODO 1: GUIA POR PRODUTO (ENSINAR ESQUERDA ⇄ DEMONSTRAR DIREITA) */}
      {activeTab === 'teach_demo' && <TeachAndDemonstrateHub />}

      {/* MODO 2: BUSCA UNIFICADA NOS 4 BANCOS SQLITE */}
      {activeTab === 'sqlite_4motors' && <OutgoingAcervoConnector />}

      {/* MODO 3: PERGUNTAR AO CÉREBRO NORMATIVO RAG */}
      {activeTab === 'rag_parecer' && (
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 shadow-xs space-y-4">
          <div>
            <div className="font-mono text-[11px] font-black uppercase tracking-wider text-[#1F3FE0] dark:text-blue-400">
              CONSULTA DIRETA AO CÉREBRO NORMATIVO
            </div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white">
              Pergunte em linguagem natural e receba parecer com fontes do Acervo
            </h2>
          </div>
          <AcervoExplorer />
        </div>
      )}

      {/* MODO 4: BIBLIOTECA DE MANUAIS ESTRUTURADOS EM CAIXINHAS LADO A LADO */}
      {activeTab === 'manuais_cards' && (
        <div className="space-y-5">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white">
                Manuais com Capítulos Estruturados por Bandeira
              </h2>
              <p className="text-xs text-slate-500">
                Filtre pela bandeira e veja os capítulos lado a lado
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {['ALL', 'Visa', 'Mastercard', 'Elo'].map((b) => (
                <button
                  key={b}
                  onClick={() => setManualBrandFilter(b)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                    manualBrandFilter === b
                      ? 'bg-[#1F3FE0] text-white border-[#1F3FE0]'
                      : 'bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  {b === 'ALL' ? 'Todas as Bandeiras' : b}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {filteredManuais.map((manual) => (
              <div
                key={manual.id}
                className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/95 p-6 flex flex-col justify-between gap-5 shadow-xs"
              >
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 font-mono text-[11px] font-black text-[#1F3FE0] dark:text-blue-300">
                        {manual.bandeira}
                      </span>
                      <span className="font-mono text-xs text-slate-500">{manual.versao}</span>
                    </div>
                    {MANUAIS_COM_VIEWER.has(manual.id) && (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 font-mono text-[10px] font-black text-emerald-700 dark:text-emerald-300">
                        ✦ LEITOR COMPLETO
                      </span>
                    )}
                  </div>

                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-snug">
                    {manual.titulo}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {manual.descricao}
                  </p>

                  {/* Caixinhas dos Capítulos */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                    {manual.capitulos.map((cap, i) => (
                      <div
                        key={i}
                        className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/70 p-3 space-y-1"
                      >
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
                          <ArrowRight size={12} className="text-[#1F3FE0] shrink-0" />
                          <span>{cap.nome}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                          {cap.resumo}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() =>
                      window.dispatchEvent(
                        new CustomEvent('open-acervo-ai-drawer', {
                          detail: {
                            query: `${manual.bandeira} ${manual.titulo}`,
                            bandeira: manual.bandeira.toLowerCase(),
                          },
                        })
                      )
                    }
                    className="px-3.5 py-2 rounded-full border border-slate-200 dark:border-slate-700 hover:border-[#1F3FE0] text-xs font-bold text-slate-700 dark:text-slate-200"
                  >
                    🧠 Consultar este Manual na IA
                  </button>

                  {MANUAIS_COM_VIEWER.has(manual.id) ? (
                    <Link
                      href={`/acervo/${manual.id}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#1F3FE0] hover:bg-blue-700 text-white text-xs font-bold"
                    >
                      <BookOpen size={14} /> Ler na Plataforma →
                    </Link>
                  ) : manual.isPremium ? (
                    <button
                      onClick={() => setActiveTab('sqlite_4motors')}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-700 dark:text-amber-300 text-xs font-bold"
                    >
                      <Lock size={13} /> Buscar Trechos no SQLite →
                    </button>
                  ) : (
                    <button
                      onClick={() => setActiveTab('sqlite_4motors')}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-slate-900 dark:bg-slate-800 text-white text-xs font-bold"
                    >
                      <ExternalLink size={14} /> Ver Páginas no SQLite →
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
