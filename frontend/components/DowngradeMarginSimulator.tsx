"use client";

import React, { useState, useMemo } from "react";
import { 
  AlertTriangle, TrendingDown, DollarSign, ShieldAlert, 
  ArrowRight, CheckCircle2, XCircle, RefreshCw, Layers,
  Building, CreditCard, ChevronRight, Zap, Info, ExternalLink
} from "lucide-react";
import Link from "next/link";

interface ScenarioConfig {
  id: string;
  name: string;
  badge: string;
  bandeira: "Visa" | "Mastercard" | "Elo" | "Multibandeira";
  ruleRef: string;
  description: string;
  cause: string;
  fieldsInvolved: string[];
  normalBps: number;
  downgradeBps: number;
  fixedPenaltyBrlPerTx: number;
  unprotectedChargebackPct: number;
  mitigation: string;
}

const SCENARIOS: ScenarioConfig[] = [
  {
    id: "3ds_downgrade",
    name: "E-Commerce sem 3DS (No-Auth Downgrade)",
    badge: "Crítico · E-Commerce",
    bandeira: "Multibandeira",
    ruleRef: "Visa Core Rules 5.3 / MC Rules 5.11 / Elo 24.1",
    description: "Transações capturadas no e-commerce sem autenticação 3-D Secure perdem o desconto de intercâmbio de autenticação segura e perdem o Liability Shift.",
    cause: "Ausência de autenticação 3DS (ECI 07) ou ausência de CAVV/AAV no DE 048 subcampo 22.",
    fieldsInvolved: ["DE 022 (POS Entry = 81)", "DE 048 (Sem CAVV)", "DE 039", "ECI = 07"],
    normalBps: 155, // 1.55%
    downgradeBps: 205, // 2.05% (+50 bps)
    fixedPenaltyBrlPerTx: 0,
    unprotectedChargebackPct: 0.65, // 0.65% de chargeback não contestável
    mitigation: "Habilitar autenticação 3DS 2.2/2.3 com suporte a Frictionless e DAF (Delegated Authentication Framework)."
  },
  {
    id: "elo_26_2",
    name: "Elo 26.2 — Classificação Errada PJ vs PF",
    badge: "Regulatório · Básico vs Corporate",
    bandeira: "Elo",
    ruleRef: "Circular Elo 26.2 / MPE Tabela de Intercâmbio",
    description: "Transações de cartões Corporativos/Empresariais processadas sob parâmetros de Pessoa Física geram estorno automático de clearing e reclassificação forçada.",
    cause: "Cadastro desatualizado de BIN ranges ou adquirente não informando a natureza correta da pessoa jurídica na captura.",
    fieldsInvolved: ["BIN Range Elo", "DE 042 (MID)", "DE 043 (MCC)", "T068 Clearing Table"],
    normalBps: 130, // 1.30%
    downgradeBps: 245, // 2.45% (+115 bps)
    fixedPenaltyBrlPerTx: 1.20, // Taxa de reprocessamento manual por clearing
    unprotectedChargebackPct: 0.10,
    mitigation: "Atualizar a tabela de BINs Elo semanalmente e validar o tipo de cartão antes do envio do arquivo MPE de clearing."
  },
  {
    id: "excessive_retries",
    name: "Retentativas Abusivas (Visa Art 2.11 / MC TPE)",
    badge: "Multas de Rede · Cat 3 Declines",
    bandeira: "Multibandeira",
    ruleRef: "Visa Core Rules Art. 2.11 / Mastercard TPE Manual Section 4",
    description: "Disparo automático em lote de autorizações após recusas irrecuperáveis (Response Code 51, 54, 05) além do limite de 15 a 35 tentativas em 24h.",
    cause: "Motores de retentativa inteligentes descalibrados retentando transações com código 51 (Insuf. Funds) ou 05 (Do Not Honor) indefinidamente.",
    fieldsInvolved: ["DE 039 (Response Code)", "DE 011 (STAN)", "DE 037 (RRN)", "Trace Audit TPE"],
    normalBps: 160,
    downgradeBps: 160, // O intercâmbio não sobe diretamente, mas entra multa pesada em Scheme Fee
    fixedPenaltyBrlPerTx: 2.75, // USD 0.50 ~ R$ 2.75 por autorização excedente
    unprotectedChargebackPct: 0,
    mitigation: "Implementar matriz de Response Codes com bloqueio imediato de hard declines e janela exponencial de retry para soft declines."
  },
  {
    id: "late_presentment",
    name: "Clearing Tardio (Late Presentment > 7 dias)",
    badge: "Operacional · Base II & IPM",
    bandeira: "Multibandeira",
    ruleRef: "Visa Base II Clearing Manual / MC GCMS Release 24.Q4",
    description: "Remessas de liquidação enviadas após a janela máxima de apresentação geram downgrade automático para o Tier Standard e expõem a chargebacks irrevogáveis.",
    cause: "Falha na esteira de transmissão SFTP de arquivos TC 33 (Visa) ou IPM (Mastercard) acumulando lotes de fins de semana e feriados.",
    fieldsInvolved: ["TC 33 / Base II Record", "IPM First Presentment", "PDS 0158 (IRD)", "FPI / Fee Program"],
    normalBps: 145,
    downgradeBps: 215, // +70 bps
    fixedPenaltyBrlPerTx: 3.50, // Tarifa de exceção de clearing
    unprotectedChargebackPct: 0.40, // Reason Code 4834 / RC 74
    mitigation: "Automatizar ingestão de clearing intraday D+0 com redundância e alerta de timeout para lotes pendentes."
  }
];

export function DowngradeMarginSimulator() {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>("3ds_downgrade");
  const [monthlyVolume, setMonthlyVolume] = useState<number>(10000000); // R$ 10M default
  const [affectedPct, setAffectedPct] = useState<number>(30); // 30% do volume afetado
  const [averageTicket, setAverageTicket] = useState<number>(200); // R$ 200 por transação
  const [acquirerMarginBps, setAcquirerMarginBps] = useState<number>(45); // 0.45% de margem líquida alvo

  const scenario = useMemo(() => {
    return SCENARIOS.find((s) => s.id === selectedScenarioId) || SCENARIOS[0];
  }, [selectedScenarioId]);

  // Cálculos financeiros
  const calculations = useMemo(() => {
    const affectedVolume = monthlyVolume * (affectedPct / 100);
    const totalTransactions = monthlyVolume / averageTicket;
    const affectedTransactions = affectedVolume / averageTicket;

    const deltaBps = scenario.downgradeBps - scenario.normalBps;
    const interChangeBleedingMonthly = (affectedVolume * deltaBps) / 10000;
    const penaltyFeesMonthly = affectedTransactions * scenario.fixedPenaltyBrlPerTx;
    const chargebackLossMonthly = (affectedVolume * scenario.unprotectedChargebackPct) / 100;

    const totalBleedingMonthly = interChangeBleedingMonthly + penaltyFeesMonthly + chargebackLossMonthly;
    const totalBleedingAnnual = totalBleedingMonthly * 12;

    // Margem bruta esperada da adquirente nesse volume afetado
    const expectedAcquirerMarginMonthly = (monthlyVolume * acquirerMarginBps) / 10000;
    const marginErosionPct = expectedAcquirerMarginMonthly > 0 
      ? (totalBleedingMonthly / expectedAcquirerMarginMonthly) * 100 
      : 0;

    const netRemainingMarginBps = acquirerMarginBps - (totalBleedingMonthly / monthlyVolume) * 10000;

    return {
      affectedVolume,
      totalTransactions,
      affectedTransactions,
      deltaBps,
      interChangeBleedingMonthly,
      penaltyFeesMonthly,
      chargebackLossMonthly,
      totalBleedingMonthly,
      totalBleedingAnnual,
      expectedAcquirerMarginMonthly,
      marginErosionPct,
      netRemainingMarginBps
    };
  }, [monthlyVolume, affectedPct, averageTicket, acquirerMarginBps, scenario]);

  const formatBRL = (val: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);

  return (
    <div className="rounded-2xl border border-red-950/60 bg-[#0a0e17] overflow-hidden shadow-2xl mt-12 mb-12">
      {/* Header do Simulador */}
      <div className="border-b border-red-900/30 bg-gradient-to-r from-red-950/40 via-slate-900/50 to-slate-900/80 p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold uppercase tracking-wider mb-3">
              <AlertTriangle size={14} className="text-red-400" />
              Simulador de Sangramento Financeiro & Downgrade
            </div>
            <h2 className="text-2xl font-black text-white">
              Calculadora de Perda de Margem & Multas Operacionais
            </h2>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Descubra exatamente quanto dinheiro sua operação ou adquirente está queimando por falhas de enquadramento de regras, ausência de 3DS ou erros de clearing.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/compliance/downgrade"
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-300 flex items-center gap-2 transition-all"
            >
              <span>Manual de Downgrade</span>
              <ExternalLink size={13} />
            </Link>
          </div>
        </div>

        {/* Abas de Cenários */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
          {SCENARIOS.map((s) => {
            const isSelected = s.id === selectedScenarioId;
            return (
              <button
                key={s.id}
                onClick={() => setSelectedScenarioId(s.id)}
                className={`p-4 rounded-xl text-left transition-all border ${
                  isSelected
                    ? "bg-red-950/40 border-red-500/60 shadow-lg shadow-red-950/30"
                    : "bg-slate-900/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900"
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700/60">
                    {s.bandeira}
                  </span>
                  <span className={`text-[10px] font-bold ${isSelected ? "text-red-400" : "text-slate-500"}`}>
                    {s.badge}
                  </span>
                </div>
                <h4 className={`text-xs font-bold ${isSelected ? "text-white" : "text-slate-300"} line-clamp-2`}>
                  {s.name}
                </h4>
              </button>
            );
          })}
        </div>
      </div>

      {/* Conteúdo Principal: Controles + Resultados */}
      <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Painel Esquerdo: Controles & Sliders (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 space-y-5">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Layers size={14} className="text-blue-400" />
              Parâmetros de Portfólio
            </h3>

            {/* Volume Mensal */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="text-slate-400 font-medium">Volume Total Mensal (TPV)</span>
                <span className="font-mono font-bold text-white text-sm">
                  {formatBRL(monthlyVolume)}
                </span>
              </div>
              <input
                type="range"
                min={500000}
                max={50000000}
                step={500000}
                value={monthlyVolume}
                onChange={(e) => setMonthlyVolume(Number(e.target.value))}
                className="w-full accent-red-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
                <span>R$ 500k</span>
                <span>R$ 10M</span>
                <span>R$ 50M</span>
              </div>
            </div>

            {/* % Afetado pelo Downgrade */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="text-slate-400 font-medium">% do Volume Afetado pela Falha</span>
                <span className="font-mono font-bold text-red-400 text-sm">
                  {affectedPct}% ({formatBRL(calculations.affectedVolume)})
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={100}
                step={1}
                value={affectedPct}
                onChange={(e) => setAffectedPct(Number(e.target.value))}
                className="w-full accent-red-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
                <span>1% (Isolado)</span>
                <span>30% (Médio)</span>
                <span>100% (Sistêmico)</span>
              </div>
            </div>

            {/* Ticket Médio */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="text-slate-400 font-medium">Ticket Médio por Transação</span>
                <span className="font-mono font-bold text-white text-sm">
                  {formatBRL(averageTicket)}
                </span>
              </div>
              <input
                type="range"
                min={30}
                max={1500}
                step={10}
                value={averageTicket}
                onChange={(e) => setAverageTicket(Number(e.target.value))}
                className="w-full accent-blue-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
              <span className="text-[10px] text-slate-500 block mt-1">
                Aproximadamente {Math.round(calculations.affectedTransactions).toLocaleString("pt-BR")} transações afetadas/mês.
              </span>
            </div>

            {/* Margem Alvo da Adquirente */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="text-slate-400 font-medium">Sua Margem Líquida Alvo (Markup)</span>
                <span className="font-mono font-bold text-emerald-400 text-sm">
                  {acquirerMarginBps} bps ({(acquirerMarginBps / 100).toFixed(2)}%)
                </span>
              </div>
              <input
                type="range"
                min={10}
                max={120}
                step={5}
                value={acquirerMarginBps}
                onChange={(e) => setAcquirerMarginBps(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
            </div>
          </div>

          {/* Ficha da Regra Selecionada */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
              <Info size={14} />
              <span>Diagnóstico Técnico da Falha</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              <strong className="text-slate-200">Causa Raiz:</strong> {scenario.cause}
            </p>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                Campos no PDS / ISO Monitorados
              </span>
              <div className="flex flex-wrap gap-1.5">
                {scenario.fieldsInvolved.map((f, i) => (
                  <span key={i} className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    {f}
                  </span>
                ))}
              </div>
            </div>
            <div className="pt-2 border-t border-slate-800/80">
              <span className="text-[11px] font-bold text-slate-300 block mb-1">
                Ação Corretiva Imediata:
              </span>
              <p className="text-xs text-emerald-400/90 leading-relaxed">
                {scenario.mitigation}
              </p>
            </div>
          </div>
        </div>

        {/* Painel Direito: Métricas de Sangramento (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card Gigante de Sangramento */}
          <div className="rounded-2xl border border-red-500/30 bg-gradient-to-br from-red-950/40 via-red-900/20 to-black p-6 relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-red-400">
                  Prejuízo Total Estimado
                </span>
                <div className="text-3xl md:text-4xl font-black text-white font-mono mt-1">
                  {formatBRL(calculations.totalBleedingMonthly)}
                  <span className="text-sm font-normal text-red-300 ml-2">/ mês</span>
                </div>
              </div>
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-2.5 text-right">
                <span className="text-[10px] font-bold uppercase text-red-400 block">Impacto Anualizado</span>
                <span className="text-lg font-black text-red-200 font-mono">
                  {formatBRL(calculations.totalBleedingAnnual)}
                </span>
              </div>
            </div>

            {/* Gráfico de Impacto na Margem */}
            <div className="pt-4 border-t border-red-900/40 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300 font-medium">Erosão da Margem Líquida da Adquirente</span>
                <span className={`font-mono font-bold ${calculations.marginErosionPct >= 100 ? "text-red-400" : "text-amber-400"}`}>
                  {calculations.marginErosionPct.toFixed(1)}% evaporada
                </span>
              </div>

              {/* Barra de progresso */}
              <div className="h-3 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800 flex">
                <div 
                  className="bg-emerald-500 h-full transition-all duration-500"
                  style={{ width: `${Math.max(0, Math.min(100, 100 - calculations.marginErosionPct))}%` }}
                  title="Margem restante"
                />
                <div 
                  className="bg-red-600 h-full transition-all duration-500"
                  style={{ width: `${Math.min(100, calculations.marginErosionPct)}%` }}
                  title="Margem consumida pelo downgrade"
                />
              </div>

              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Margem Inicial: <strong>+{acquirerMarginBps} bps</strong></span>
                <span>
                  Margem Efetiva Pós-Downgrade:{" "}
                  <strong className={calculations.netRemainingMarginBps < 0 ? "text-red-400 font-mono" : "text-emerald-400 font-mono"}>
                    {calculations.netRemainingMarginBps > 0 ? "+" : ""}{calculations.netRemainingMarginBps.toFixed(1)} bps
                  </strong>
                </span>
              </div>

              {calculations.netRemainingMarginBps < 0 && (
                <div className="p-3 rounded-lg bg-red-900/30 border border-red-500/30 text-xs text-red-200 flex items-center gap-2 mt-2">
                  <XCircle size={16} className="text-red-400 shrink-0" />
                  <span>
                    <strong>Operação no Prejuízo:</strong> O custo de intercâmbio e multas superou a receita da adquirente. Cada transação processada drena capital da empresa.
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Decomposição do Sangramento em 3 Pilares */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Pilar 1: Delta de Intercâmbio */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                1. Aumento de IC (Bps)
              </span>
              <div className="text-lg font-bold text-white font-mono">
                {calculations.deltaBps > 0 ? `+${calculations.deltaBps} bps` : "0 bps"}
              </div>
              <span className="text-xs text-red-400 font-mono block mt-1">
                {formatBRL(calculations.interChangeBleedingMonthly)}/mês
              </span>
              <p className="text-[10px] text-slate-500 mt-2">
                Salto de {(scenario.normalBps / 100).toFixed(2)}% para {(scenario.downgradeBps / 100).toFixed(2)}% de taxa repassada ao emissor.
              </p>
            </div>

            {/* Pilar 2: Multas de Rede / Scheme Fees */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                2. Tarifas & Multas de Rede
              </span>
              <div className="text-lg font-bold text-white font-mono">
                {scenario.fixedPenaltyBrlPerTx > 0 ? `R$ ${scenario.fixedPenaltyBrlPerTx.toFixed(2)} / tx` : "R$ 0,00"}
              </div>
              <span className="text-xs text-red-400 font-mono block mt-1">
                {formatBRL(calculations.penaltyFeesMonthly)}/mês
              </span>
              <p className="text-[10px] text-slate-500 mt-2">
                Cobrança de excesso de retentativas ou reprocessamento no faturamento VSS / MCBS.
              </p>
            </div>

            {/* Pilar 3: Risco de Chargeback sem Defesa */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                3. Perda de Liability Shift
              </span>
              <div className="text-lg font-bold text-white font-mono">
                {scenario.unprotectedChargebackPct > 0 ? `${scenario.unprotectedChargebackPct.toFixed(2)}% do GMV` : "0.00%"}
              </div>
              <span className="text-xs text-red-400 font-mono block mt-1">
                {formatBRL(calculations.chargebackLossMonthly)}/mês
              </span>
              <p className="text-[10px] text-slate-500 mt-2">
                Chargebacks de fraude amigável e roubo de cartão assumidos 100% pelo lojista/adquirente.
              </p>
            </div>
          </div>

          {/* Comparativo Lado a Lado: Conforme vs Downgrade */}
          <div className="p-5 rounded-xl bg-slate-900/30 border border-slate-800">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
              <CheckCircle2 size={14} className="text-emerald-400" />
              Comparativo de Custos por Transação de {formatBRL(averageTicket)}
            </h4>
            <div className="grid grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-3.5 rounded-lg bg-emerald-950/20 border border-emerald-500/20">
                <span className="text-[10px] font-bold uppercase text-emerald-400 block mb-1">Fluxo Conforme (Com 3DS / No Prazo)</span>
                <div className="text-sm font-bold text-white">
                  {formatBRL((averageTicket * scenario.normalBps) / 10000)}
                </div>
                <span className="text-[10px] text-slate-400 block mt-1">IC {(scenario.normalBps / 100).toFixed(2)}% · Sem multas</span>
              </div>
              <div className="p-3.5 rounded-lg bg-red-950/30 border border-red-500/30">
                <span className="text-[10px] font-bold uppercase text-red-400 block mb-1">Fluxo com Downgrade / Falha</span>
                <div className="text-sm font-bold text-red-300">
                  {formatBRL((averageTicket * scenario.downgradeBps) / 10000 + scenario.fixedPenaltyBrlPerTx)}
                </div>
                <span className="text-[10px] text-red-400/80 block mt-1">
                  IC {(scenario.downgradeBps / 100).toFixed(2)}% + Multa
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
