import Link from 'next/link';
import { Database, Network, DollarSign, Sparkles } from 'lucide-react';
import { AcervoOrganizedClient } from './AcervoOrganizedClient';

export const metadata = {
  title: 'Acervo Normativo & Jornada por Produto (Ensinar + Demonstrar) — VS Payments',
  description:
    'Aprenda por produto no modelo Ensinar + Demonstrar lado a lado e pesquise nos 4 bancos SQLite (40.129 ativos, 17.106 campos, 454 tarifas e 94 normas BCB).',
};

export default function AcervoPage() {
  return (
    <main className="bg-[#F8FAFC] dark:bg-background min-h-screen pb-24 text-foreground">
      {/* Header Editorial Limpo */}
      <section className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90">
        <div className="mx-auto max-w-7xl px-6 py-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800">
              <Database size={13} className="text-[#1F3FE0] dark:text-blue-400" />
              <span className="text-[11px] font-black uppercase tracking-wider text-[#1F3FE0] dark:text-blue-300">
                Jornada por Produto (Ensinar ⇄ Demonstrar) • 40.129 Ativos • 17.106 Campos • 454 Tarifas
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Central de Produtos, Aprendizado Guiado &amp; Acervo SQLite
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed">
              Escolha uma das <strong>4 caixinhas abaixo</strong>: aprenda por produto com explicação à esquerda e demonstração ao vivo à direita, ou pesquise diretamente nos 4 bancos SQLite (<code className="font-mono">acervo.sqlite3</code>, <code className="font-mono">campos.sqlite3</code>, <code className="font-mono">tarifas.sqlite3</code> e <code className="font-mono">boletins</code>).
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <Link
              href="/jornada"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold transition-all"
            >
              <Network size={14} />
              <span>Simulador 3D (10 Trilhas)</span>
            </Link>
            <Link
              href="/mapa/produtos"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-xs font-bold transition-all"
            >
              <DollarSign size={14} />
              <span>Mapa de Produtos (4 Bandeiras)</span>
            </Link>
            <Link
              href="/editor"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#1F3FE0] hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all"
            >
              <Sparkles size={14} />
              <span>Doc Studio com IA</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Conteúdo Organizado em Caixinhas (1 Modo Ativo por Vez) */}
      <section className="mx-auto max-w-7xl px-6 py-6">
        <AcervoOrganizedClient />
      </section>
    </main>
  );
}
