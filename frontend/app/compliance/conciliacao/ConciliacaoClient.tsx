"use client";

import React, { useState } from "react";
import { 
  DollarSign, CheckCircle2, AlertTriangle, XCircle, 
  ArrowRight, RefreshCw, FileText, Layers, Building2,
  Scale, ShieldCheck, Download, Search, Sparkles, ExternalLink
} from "lucide-react";
import Link from "next/link";

interface ReconciliationScenario {
  id: string;
  name: string;
  badge: string;
  status: "reconciled" | "divergent" | "critical";
  description: string;
  totalCaptured: number;
  totalSettled: number;
  interchangeExpected: number;
  interchangeBilled: number;
  schemeFeesExpected: number;
  schemeFeesBilled: number;
  netDiff: number;
  rootCause: string;
  actionRequired: string;
  involvedReports: string[];
}

const SCENARIOS: ReconciliationScenario[] = [
  {
    id: "downgrade_divergence",
    name: "Divergência de Intercâmbio por Downgrade (VSS 110)",
    badge: "Divergência Tarifária · R$ 4.250",
    status: "divergent",
    description: "O sistema interno da adquirente provisionou taxas de intercâmbio com base no Tier Prime (1,45%), mas a Visa apurou a liquidação no Tier Standard (1,95%) por ausência de dados 3DS no clearing.",
    totalCaptured: 1000000.00,
    totalSettled: 1000000.00,
    interchangeExpected: 14500.00,
    interchangeBilled: 18750.00,
    schemeFeesExpected: 2500.00,
    schemeFeesBilled: 2500.00,
    netDiff: -4250.00,
    rootCause: "Falta de envio do CAVV no subcampo 22 do DE 048 na remessa Base II (TC 33). O VisaNet Settlement Service (VSS) aplicou a tarifa punitiva.",
    actionRequired: "Ajustar o mapper de mensageria da esteira de clearing para extrair o CAVV da autorização e auditar os lojistas do segmento e-commerce.",
    involvedReports: ["Visa VSS 110 (Summary)", "Visa VSS 120 (Interchange Detail)", "Base II TC 33 Draft Data"]
  },
  {
    id: "late_presentment",
    name: "Lote de Clearing Reprovado / Atrasado (Descasamento CIP)",
    badge: "Crítico · Grade CIP Travada",
    status: "critical",
    description: "Um lote de transações capturadas na sexta-feira à noite não foi transmitido a tempo da janela de corte (Cut-off time) da câmara, gerando descasamento financeiro de R$ 185.000 na grade de liquidação da CIP.",
    totalCaptured: 1185000.00,
    totalSettled: 1000000.00,
    interchangeExpected: 17775.00,
    interchangeBilled: 15000.00,
    schemeFeesExpected: 2962.50,
    schemeFeesBilled: 2500.00,
    netDiff: -185000.00,
    rootCause: "Falha de conexão SFTP na janela das 22h00 com o processador de clearing. As transações ficaram retidas e entraram em D+2 em vez de D+1.",
    actionRequired: "Acionar tesouraria para aporte de liquidez emergencial na conta de liquidação do Banco Central (STR) para não inadimplir os lojistas na grade da CIP.",
    involvedReports: ["Grade SLC / CIP", "Mastercard TN3A Daily Clearing", "Extrato de Conta STR Bacen"]
  },
  {
    id: "tpe_retries_fine",
    name: "Cobrança de Multa TPE na Fatura Mastercard MCBS",
    badge: "Multa de Rede · USD 1.450",
    status: "divergent",
    description: "A fatura mensal consolidada da Mastercard (MCBS) veio com valor superior ao previsto em virtude de multas do programa de excelência (TPE) por retentativas em cartões cancelados.",
    totalCaptured: 2500000.00,
    totalSettled: 2500000.00,
    interchangeExpected: 37500.00,
    interchangeBilled: 37500.00,
    schemeFeesExpected: 6250.00,
    schemeFeesBilled: 14370.00, // + R$ 8.120 (~ USD 1.450)
    netDiff: -8120.00,
    rootCause: "Motor de retry da adquirente disparou mais de 25 tentativas no mesmo cartão sob Response Code 05 (Do Not Honor), violando a regra TPE Category 3.",
    actionRequired: "Bloquear retentativas automáticas sob códigos Hard Decline na engine do gateway e contestar eventuais cobranças duplicadas via DMAS.",
    involvedReports: ["Mastercard MCBS Monthly Invoice", "Relatório de Billing T067", "Logs de Resposta DE 039"]
  },
  {
    id: "perfect_reconciliation",
    name: "Batimento Perfeito em 3 Pontas (Conforme)",
    badge: "100% Conciliado · Zero Dif",
    status: "reconciled",
    description: "Todas as transações capturadas batem exatamente com os relatórios de clearing das bandeiras e com o extrato de liquidação financeira na CIP e Banco Central.",
    totalCaptured: 5000000.00,
    totalSettled: 5000000.00,
    interchangeExpected: 75000.00,
    interchangeBilled: 75000.00,
    schemeFeesExpected: 12500.00,
    schemeFeesBilled: 12500.00,
    netDiff: 0.00,
    rootCause: "Fluxo 100% conforme: mensageria correta, 3DS autenticado, envio dentro do cut-off time e sem multas operacionais.",
    actionRequired: "Nenhuma ação corretiva. Liberar lote contábil para conciliação bancária e fechamento do razão contábil.",
    involvedReports: ["VSS 110", "Mastercard TN3A", "Grade SLC / CIP", "Extrato SPB"]
  }
];

export function ConciliacaoClient() {
  const [selectedId, setSelectedId] = useState<string>("downgrade_divergence");
  const [activeTab, setActiveTab] = useState<"simulator" | "playbook" | "reports">("simulator");

  const scenario = SCENARIOS.find((s) => s.id === selectedId) || SCENARIOS[0];

  const formatBRL = (val: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);

  return (
    <div className="space-y-8">
      {/* ── Switcher de Abas Superiores ── */}
      <div className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-900/80 border border-slate-800 w-fit">
        <button
          onClick={() => setActiveTab("simulator")}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === "simulator"
              ? "bg-blue-600 text-white shadow-md shadow-blue-900/40"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Scale size={14} />
          <span>Simulador de Batimento em 3 Pontas</span>
        </button>
        <button
          onClick={() => setActiveTab("playbook")}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === "playbook"
              ? "bg-blue-600 text-white shadow-md shadow-blue-900/40"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <FileText size={14} />
          <span>Playbook Operacional Passo a Passo</span>
        </button>
        <button
          onClick={() => setActiveTab("reports")}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === "reports"
              ? "bg-blue-600 text-white shadow-md shadow-blue-900/40"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Layers size={14} />
          <span>Dicionário de Relatórios (VSS / MCBS / CIP)</span>
        </button>
      </div>

      {/* ── ABA 1: SIMULADOR DE BATIMENTO ── */}
      {activeTab === "simulator" && (
        <div className="space-y-6">
          {/* Seletor de Cenários */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Sparkles size={14} className="text-amber-400" />
                Cenários Reais de Produção & Divergências de Conciliação
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                Selecione para auditar
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {SCENARIOS.map((s) => {
                const isSelected = s.id === selectedId;
                return (
                  <button
                    key={s.id}
                    onClick={() => setSelectedId(s.id)}
                    className={`p-4 rounded-xl text-left border transition-all ${
                      isSelected
                        ? s.status === "reconciled"
                          ? "bg-emerald-950/40 border-emerald-500/60 shadow-lg shadow-emerald-950/30"
                          : "bg-red-950/40 border-red-500/60 shadow-lg shadow-red-950/30"
                        : "bg-slate-900/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className={`text-[10px] font-bold ${
                        s.status === "reconciled" ? "text-emerald-400" : "text-red-400"
                      }`}>
                        {s.badge}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-white line-clamp-2">
                      {s.name}
                    </h4>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cartão de Auditoria do Cenário Selecionado */}
          <div className="rounded-2xl border border-slate-800 bg-[#090e17] p-6 md:p-8 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                    scenario.status === "reconciled"
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                      : "bg-red-500/10 text-red-400 border border-red-500/30"
                  }`}>
                    {scenario.status === "reconciled" ? "Status: Conciliado" : "Status: Divergência Detectada"}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">ID: {scenario.id}</span>
                </div>
                <h3 className="text-xl font-bold text-white">
                  {scenario.name}
                </h3>
                <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
                  {scenario.description}
                </p>
              </div>

              {/* Box de Diferença Líquida */}
              <div className={`p-4 rounded-xl border text-right shrink-0 ${
                scenario.netDiff === 0 
                  ? "bg-emerald-950/20 border-emerald-500/30" 
                  : "bg-red-950/30 border-red-500/40"
              }`}>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                  Divergência de Fechamento
                </span>
                <span className={`text-2xl font-black font-mono ${
                  scenario.netDiff === 0 ? "text-emerald-400" : "text-red-400"
                }`}>
                  {formatBRL(scenario.netDiff)}
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  {scenario.netDiff === 0 ? "Batimento Perfeito" : "Sangramento a Regularizar"}
                </span>
              </div>
            </div>

            {/* A Matriz dos 3 Pilares de Batimento */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Ponta 1: Captura Interna */}
              <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
                <span className="text-[10px] font-mono uppercase text-blue-400 font-bold block mb-1">
                  Ponta 1 · Captura / Gateway
                </span>
                <div className="text-lg font-bold text-white font-mono">
                  {formatBRL(scenario.totalCaptured)}
                </div>
                <div className="space-y-1 mt-3 pt-3 border-t border-slate-800 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>IC Previsto:</span>
                    <span className="font-mono text-slate-300">{formatBRL(scenario.interchangeExpected)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Scheme Fee Prev.:</span>
                    <span className="font-mono text-slate-300">{formatBRL(scenario.schemeFeesExpected)}</span>
                  </div>
                </div>
              </div>

              {/* Ponta 2: Faturamento da Bandeira */}
              <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
                <span className="text-[10px] font-mono uppercase text-purple-400 font-bold block mb-1">
                  Ponta 2 · Clearing Bandeira (VSS / MCBS)
                </span>
                <div className="text-lg font-bold text-white font-mono">
                  {formatBRL(scenario.totalSettled)}
                </div>
                <div className="space-y-1 mt-3 pt-3 border-t border-slate-800 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>IC Faturado:</span>
                    <span className={`font-mono ${scenario.interchangeBilled !== scenario.interchangeExpected ? "text-red-400 font-bold" : "text-slate-300"}`}>
                      {formatBRL(scenario.interchangeBilled)}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Scheme Fee Faturado:</span>
                    <span className={`font-mono ${scenario.schemeFeesBilled !== scenario.schemeFeesExpected ? "text-red-400 font-bold" : "text-slate-300"}`}>
                      {formatBRL(scenario.schemeFeesBilled)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Ponta 3: Liquidação Bancária (CIP/STR) */}
              <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
                <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold block mb-1">
                  Ponta 3 · Liquidação Bacen / CIP
                </span>
                <div className={`text-lg font-bold font-mono ${
                  scenario.totalSettled !== scenario.totalCaptured ? "text-red-400" : "text-white"
                }`}>
                  {formatBRL(scenario.totalSettled - scenario.interchangeBilled - scenario.schemeFeesBilled)}
                </div>
                <div className="space-y-1 mt-3 pt-3 border-t border-slate-800 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Grade de Pagamento:</span>
                    <span className="font-mono text-emerald-300">Grade SLC D+1</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Status na Câmara:</span>
                    <span className="font-mono text-slate-300">
                      {scenario.status === "critical" ? "Pendente / Reprovado" : "Liquidado em Conta STR"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Detalhes Técnicos e Ação Corretiva */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4 border-t border-slate-800">
              <div className="p-4 rounded-xl bg-black/40 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                  <AlertTriangle size={14} />
                  <span>Diagnóstico da Causa Raiz</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {scenario.rootCause}
                </p>
                <div className="pt-2">
                  <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1">
                    Relatórios Auditados:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {scenario.involvedReports.map((r, i) => (
                      <span key={i} className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {r}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-black/40 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                  <CheckCircle2 size={14} />
                  <span>Plano de Ação Corretiva</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {scenario.actionRequired}
                </p>
                <div className="pt-2">
                  <Link
                    href="/compliance/linter"
                    className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 font-bold transition-colors"
                  >
                    <span>Abrir Inspetor de Mensagens ISO para debugar campos</span>
                    <ArrowRight size={12} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── ABA 2: PLAYBOOK OPERACIONAL PASSO A PASSO ── */}
      {activeTab === "playbook" && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl border border-slate-800 bg-[#090e17] space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white mb-2">
                Protocolo Canônico de Conciliação em 4 Etapas
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed max-w-3xl">
                O roteiro padrão adotado pelas maiores adquirentes e fintechs brasileiras para garantir que 100% dos centavos processados cheguem à conta de liquidação sem sangramento operacional.
              </p>
            </div>

            <div className="space-y-4">
              {/* Etapa 1 */}
              <div className="p-5 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-blue-500/40 transition-all space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold font-mono text-sm">
                      1
                    </div>
                    <h4 className="text-sm font-bold text-white">
                      Batimento Transacional (Captura vs Clearing Base II / IPM)
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                    Janela: D+0 a D+1
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed pl-11">
                  Cruze os registros de autorização (logs 0100/0110) com os registros de apresentação contidos nos arquivos de clearing remetidos (Visa Edit Package / TC 33 e Mastercard IPM First Presentment). Identifique transações autorizadas não capturadas (Unpresented Auth) ou transações duplicadas (Duplicate Presentment).
                </p>
              </div>

              {/* Etapa 2 */}
              <div className="p-5 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-purple-500/40 transition-all space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold font-mono text-sm">
                      2
                    </div>
                    <h4 className="text-sm font-bold text-white">
                      Batimento de Intercâmbio & Detecção de Downgrades
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                    Janela: D+1 (Manhã)
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed pl-11">
                  Compare o intercâmbio estimado pelo seu motor de precificação contra o campo <code>IRD</code> (Mastercard PDS 0158) ou <code>FPI</code> (Visa VSS 120). Qualquer diferença aponta downgrade tarifário (ex: ausência de CAVV 3DS, late presentment ou erro de MCC).
                </p>
              </div>

              {/* Etapa 3 */}
              <div className="p-5 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-amber-500/40 transition-all space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold font-mono text-sm">
                      3
                    </div>
                    <h4 className="text-sm font-bold text-white">
                      Auditoria de Tarifas de Rede (Scheme Fees & Multas MCBS)
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                    Janela: Mensal (D+5)
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed pl-11">
                  Valide a fatura consolidada mensal de bandeira (Mastercard MCBS e Visa VSS 210). Verifique se cobranças de retentativa abusiva (TPE), taxas de cross-border ou penalidades de compliance foram lançadas indevidamente para abrir disputa (DMAS) dentro do prazo limite de 60 dias.
                </p>
              </div>

              {/* Etapa 4 */}
              <div className="p-5 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-emerald-500/40 transition-all space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold font-mono text-sm">
                      4
                    </div>
                    <h4 className="text-sm font-bold text-white">
                      Liquidação Líquida Multilateral (CIP / Bacen STR)
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                    Janela: D+2
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed pl-11">
                  Confira se o saldo líquido apurado no clearing bate com a grade de liquidação do Sistema de Liquidação de Cartões (SLC) da CIP e se o débito/crédito na Conta de Liquidação do Banco Central (STR) ocorreu sem insuficiência de saldo.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── ABA 3: DICIONÁRIO DE RELATÓRIOS ── */}
      {activeTab === "reports" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* VisaNet Reports */}
            <div className="p-6 rounded-2xl border border-slate-800 bg-[#090e17] space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold">V</div>
                <h3 className="text-sm font-bold text-white">Relatórios Visa (Base II / VSS)</h3>
              </div>
              <ul className="space-y-3 text-xs text-slate-400">
                <li className="p-3 rounded-xl bg-slate-900/50 border border-slate-800">
                  <strong className="text-slate-200 block mb-0.5">VSS-110 (Financial Settlement Summary)</strong>
                  Relatório oficial de fechamento diário da Visa contendo a posição líquida multilateral de débito/crédito da adquirente.
                </li>
                <li className="p-3 rounded-xl bg-slate-900/50 border border-slate-800">
                  <strong className="text-slate-200 block mb-0.5">VSS-120 (Interchange Detail Report)</strong>
                  Apresenta cada transação com o FPI (Fee Program Indicator) aplicado, permitindo identificar downgrades.
                </li>
                <li className="p-3 rounded-xl bg-slate-900/50 border border-slate-800">
                  <strong className="text-slate-200 block mb-0.5">TC 33 / Draft Data</strong>
                  Arquivo com a massa bruta de transações de clearing enviadas pela adquirente para processamento no Base II.
                </li>
              </ul>
            </div>

            {/* Mastercard Reports */}
            <div className="p-6 rounded-2xl border border-slate-800 bg-[#090e17] space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">M</div>
                <h3 className="text-sm font-bold text-white">Relatórios Mastercard (GCMS / MCBS)</h3>
              </div>
              <ul className="space-y-3 text-xs text-slate-400">
                <li className="p-3 rounded-xl bg-slate-900/50 border border-slate-800">
                  <strong className="text-slate-200 block mb-0.5">TN3A / Daily Reconciliation Report</strong>
                  Espelho diário de conciliação do GCMS com todas as transações, IRD aplicado e valores de intercâmbio.
                </li>
                <li className="p-3 rounded-xl bg-slate-900/50 border border-slate-800">
                  <strong className="text-slate-200 block mb-0.5">MCBS Monthly Billing Invoice</strong>
                  A fatura unificada de tarifas de rede (Scheme Fees), assessings de volume e penalidades do programa TPE.
                </li>
                <li className="p-3 rounded-xl bg-slate-900/50 border border-slate-800">
                  <strong className="text-slate-200 block mb-0.5">IPM First Presentment (T112)</strong>
                  Arquivo de remessa contendo a mensagem ISO-IPM com os dados de captura e credenciais de autorização.
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
