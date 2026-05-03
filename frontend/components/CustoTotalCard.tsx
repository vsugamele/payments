"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ShieldCheck,
  Info,
  ChevronDown,
  ChevronUp,
  Zap,
  CreditCard,
  Globe,
  Lock,
  Scale,
  ArrowRight,
} from "lucide-react";

// ─── Estrutura de Custos por IRD ─────────────────────────────────────────────
//
// Lógica central:
//
// O intercâmbio (IC) é pago pelo Adquirente ao Emissor via rede.
// O Scheme Fee é cobrado SEPARADAMENTE pela Bandeira ao Adquirente via MCBS.
//
// Por que HU e AU têm o mesmo intercâmbio base?
// A diferença REAL não é a taxa de IC — é o Scheme Fee "2AB3006" (Non-Auth Fee).
// Quando uma transação e-commerce NAO usa 3DS (HU), a Mastercard cobra 0.029%
// sobre o valor transacionado como penalidade, além de expor ao chargeback sem
// Liability Shift. Isso muda completamente o custo total para o Adquirente.
//
// Estrutura de custos por canal:
const CANAL_COST_MAP: Record<
  string,
  {
    label: string;
    icon: React.ElementType;
    color: string;
    ird: string;
    scheme_fee_code: string | null;
    scheme_fee_pct: number; // % sobre o valor transacionado
    scheme_fee_fixed: number; // valor fixo em R$
    scheme_fee_cap: number; // teto em R$ (0 = sem teto)
    scheme_fee_desc: string;
    liability_shift: boolean;
    chargeback_risk: "baixo" | "medio" | "alto" | "critico";
    porque: string; // explicação do POR QUÊ
  }
> = {
  fisico: {
    label: "Físico (Chip/POS)",
    icon: CreditCard,
    color: "#10b981",
    ird: "IA",
    scheme_fee_code: "2AB1006",
    scheme_fee_pct: 0,
    scheme_fee_fixed: 0.0272,
    scheme_fee_cap: 0,
    scheme_fee_desc: "Auth Acquirer Access Fee (2AB1006): R$ 0.0272 por autorização",
    liability_shift: true,
    chargeback_risk: "baixo",
    porque:
      "Transação presencial com chip EMV. O PIN ou assinatura autenticam o portador. A Mastercard cobra apenas o fee de roteamento de autorização (2AB1006), fixo por transação. Não há penalidade extra pois o risco de fraude é mínimo.",
  },
  contactless: {
    label: "Contactless (Tap & Go)",
    icon: Zap,
    color: "#6366f1",
    ird: "JA",
    scheme_fee_code: "2AB1706",
    scheme_fee_pct: 0,
    scheme_fee_fixed: 0.019,
    scheme_fee_cap: 0,
    scheme_fee_desc: "MC Contactless OBS Mapping (2AB1706): R$ 0.019 por autorização NFC",
    liability_shift: true,
    chargeback_risk: "baixo",
    porque:
      "Transação por aproximação (NFC). No Brasil, a taxa de intercâmbio é equivalente ao físico padrão (IRD JA = IA + 0%). O Scheme Fee adicional é o custo de mapeamento PAN/token contactless (2AB1706). Sem penalidade de risco.",
  },
  ecommerce_3ds: {
    label: "E-commerce com 3DS (AU)",
    icon: Lock,
    color: "#0ea5e9",
    ird: "AU",
    scheme_fee_code: "2AB1790",
    scheme_fee_pct: 0,
    scheme_fee_fixed: 0.015501,
    scheme_fee_cap: 0,
    scheme_fee_desc: "SecureCode AAV Validation (2AB1790): R$ 0.0155 por validação 3DS",
    liability_shift: true,
    chargeback_risk: "baixo",
    porque:
      "E-commerce autenticado via Mastercard Identity Check (3DS). A taxa de intercâmbio é igual ao físico base (IRD AU = IA + 0%), mas o Liability Shift protege o Adquirente de chargebacks por fraude. O Scheme Fee é apenas o custo de validação do AAV (token de autenticação). Custo TOTAL menor mesmo com 3DS.",
  },
  ecommerce: {
    label: "E-commerce SEM 3DS (HU)",
    icon: AlertTriangle,
    color: "#ef4444",
    ird: "HU",
    scheme_fee_code: "2AB3006",
    scheme_fee_pct: 0.029, // 0.029% sobre o valor = 0.00029 * valor
    scheme_fee_fixed: 0,
    scheme_fee_cap: 12.0,
    scheme_fee_desc:
      "Non-Auth Acquirer Fee (2AB3006): 0.029% do valor transacionado (cap R$ 12,00)",
    liability_shift: false,
    chargeback_risk: "critico",
    porque:
      "E-commerce SEM autenticação 3DS (ECI 07, UCAF vazio). A taxa de intercâmbio base é igual ao físico (IRD HU = IA + 0%), MAS a Mastercard cobra um Scheme Fee punitivo separado: 0.029% do valor (2AB3006). Em R$ 5.000, isso representa R$ 1,45 EXTRA além do intercâmbio. E sem Liability Shift: se houver fraude, o chargeback é 100% responsabilidade do Adquirente/Lojista.",
  },
  ecommerce_3ds_challenge: {
    label: "E-commerce 3DS Challenge (AV)",
    icon: ShieldCheck,
    color: "#f59e0b",
    ird: "AV",
    scheme_fee_code: "2AB1790",
    scheme_fee_pct: 0,
    scheme_fee_fixed: 0.015501,
    scheme_fee_cap: 0,
    scheme_fee_desc: "SecureCode AAV Validation (2AB1790): R$ 0.0155 por validação",
    liability_shift: true,
    chargeback_risk: "baixo",
    porque:
      "3DS com desafio ativo (biometria, OTP). O intercâmbio tem acréscimo de +0.40% sobre IA base (IRD AV), refletindo o custo maior de processamento de autenticação com interação humana. Porém Liability Shift garantido e sem Non-Auth Fee. O custo extra de IC é compensado pela eliminação do risco de chargeback.",
  },
  internacional: {
    label: "Internacional / Cross-border (SI/SU)",
    icon: Globe,
    color: "#dc2626",
    ird: "SI/SU",
    scheme_fee_code: "2AB1006",
    scheme_fee_pct: 0,
    scheme_fee_fixed: 0.5,
    scheme_fee_cap: 0,
    scheme_fee_desc:
      "Auth Acquirer Fee Internacional (2AB1006): R$ 0.50 por autorização cross-border",
    liability_shift: false,
    chargeback_risk: "alto",
    porque:
      "Emissor fora do Brasil. O Auth Fee sobe de R$ 0.0272 para R$ 0.50 por autorização (quase 20x mais caro). A taxa de intercâmbio também aumenta dramaticamente: IRD SU (sem 3DS) pode ultrapassar 3-4% dependendo do produto. Além disso, sem Liability Shift padrão para cross-border sem 3DS.",
  },
};

const RISCO_BADGE = {
  baixo:   { label: "Risco Baixo",    cls: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  medio:   { label: "Risco Médio",    cls: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" },
  alto:    { label: "Risco Alto",     cls: "bg-orange-500/10 text-orange-400 border-orange-500/20" },
  critico: { label: "Risco Crítico",  cls: "bg-red-500/10 text-red-400 border-red-500/20" },
};

interface Props {
  valor: number;
  taxa_ic_pct: number;
  taxa_ic_brl: number;
  ird: string;
  canal: string; // 'fisico' | 'ecommerce' | 'ecommerce_3ds' | etc
  bandeira: string;
}

export function CustoTotalCard({ valor, taxa_ic_pct, taxa_ic_brl, ird, canal, bandeira }: Props) {
  const [showPorque, setShowPorque] = useState(false);

  const canalKey = canal in CANAL_COST_MAP ? canal : "fisico";
  const info = CANAL_COST_MAP[canalKey];
  const Icon = info.icon;

  // Calcula scheme fee
  const scheme_fee_pct_val = (info.scheme_fee_pct / 100) * valor;
  const scheme_fee = info.scheme_fee_pct > 0
    ? Math.min(scheme_fee_pct_val + info.scheme_fee_fixed, info.scheme_fee_cap > 0 ? info.scheme_fee_cap : Infinity)
    : info.scheme_fee_fixed;

  // MDR estimado mínimo (markup adquirente estimado em 0.4%)
  const markup_estimado = valor * 0.004;

  const custo_total = taxa_ic_brl + scheme_fee + markup_estimado;
  const mdr_estimado_pct = (custo_total / valor) * 100;

  const risco = RISCO_BADGE[info.chargeback_risk];

  if (bandeira !== "mastercard" && bandeira !== "maestro") return null;

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900/80 overflow-hidden mt-4">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-700/60"
        style={{ background: `${info.color}08` }}>
        <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: `${info.color}15`, border: `1px solid ${info.color}30` }}>
          <Icon size={18} style={{ color: info.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-white text-sm">Custo Total da Transação</p>
          <p className="text-xs text-slate-400">{info.label}</p>
        </div>
        <div className={`text-xs font-bold px-2.5 py-1 rounded-full border ${risco.cls}`}>
          {risco.label}
        </div>
      </div>

      {/* Breakdown de custos */}
      <div className="px-5 py-4 space-y-3">

        {/* Linha 1: Intercâmbio */}
        <div className="flex items-center justify-between py-2 border-b border-slate-800">
          <div>
            <p className="text-sm font-semibold text-slate-200">Intercâmbio (IC)</p>
            <p className="text-xs text-slate-500">IRD {ird} → {taxa_ic_pct.toFixed(4)}% × R$ {valor.toFixed(2)}</p>
          </div>
          <p className="text-sm font-bold text-red-300">– R$ {taxa_ic_brl.toFixed(4)}</p>
        </div>

        {/* Linha 2: Scheme Fee */}
        <div className="flex items-center justify-between py-2 border-b border-slate-800">
          <div className="flex-1 min-w-0 pr-4">
            <p className="text-sm font-semibold text-slate-200">Scheme Fee (MCBS)</p>
            <p className="text-xs text-slate-500 leading-relaxed">{info.scheme_fee_desc}</p>
          </div>
          <p className={`text-sm font-bold shrink-0 ${info.scheme_fee_pct > 0 ? "text-red-400" : "text-orange-300"}`}>
            – R$ {scheme_fee.toFixed(4)}
          </p>
        </div>

        {/* Linha 3: Markup Adquirente (estimado) */}
        <div className="flex items-center justify-between py-2 border-b border-slate-800">
          <div>
            <p className="text-sm font-semibold text-slate-200">Markup Adquirente</p>
            <p className="text-xs text-slate-500">Estimativa mínima de 0.40%</p>
          </div>
          <p className="text-sm font-bold text-yellow-300">– R$ {markup_estimado.toFixed(4)}</p>
        </div>

        {/* Total */}
        <div className="flex items-center justify-between pt-2">
          <div>
            <p className="text-base font-bold text-white">Custo Total Estimado</p>
            <p className="text-xs text-slate-400">MDR mínimo: ~{mdr_estimado_pct.toFixed(2)}%</p>
          </div>
          <p className="text-xl font-black text-red-300">– R$ {custo_total.toFixed(4)}</p>
        </div>

        {/* Liability Shift */}
        <div className={`flex items-center gap-2 text-xs px-3 py-2 rounded-lg border ${
          info.liability_shift
            ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-400"
            : "bg-red-500/5 border-red-500/20 text-red-400"
        }`}>
          {info.liability_shift ? <ShieldCheck size={13} /> : <AlertTriangle size={13} />}
          <span className="font-semibold">
            {info.liability_shift
              ? "Liability Shift ativo — chargeback por fraude é responsabilidade do Emissor"
              : "SEM Liability Shift — fraude é responsabilidade do Adquirente/Lojista"}
          </span>
        </div>
      </div>

      {/* Botão "Por que isso acontece?" */}
      <div className="border-t border-slate-700/60">
        <button
          onClick={() => setShowPorque(!showPorque)}
          className="w-full flex items-center justify-between px-5 py-3 text-xs font-bold text-blue-400 hover:bg-blue-500/5 transition-colors"
        >
          <span className="flex items-center gap-2">
            <Info size={13} />
            Por que o custo deste canal funciona assim?
          </span>
          {showPorque ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {showPorque && (
          <div className="px-5 pb-5">
            <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4">
              <p className="text-xs text-slate-300 leading-relaxed">{info.porque}</p>
              {!info.liability_shift && (
                <div className="mt-3 pt-3 border-t border-blue-500/20">
                  <p className="text-xs font-bold text-amber-400 mb-1">Impacto Financeiro do Chargeback:</p>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Em caso de disputa por fraude, o Adquirente devolve o valor integral ao portador (R$ {valor.toFixed(2)})
                    e ainda paga o Scheme Fee de chargeback (2CI201716 ≈ R$ 114,74 por representação).
                    O custo real de uma transação fraudada sem 3DS é drasticamente superior à taxa economizada.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Botão de Interligação: Ver Estratégia de Defesa (apenas sem Liability Shift) */}
      {!info.liability_shift && (
        <div className="border-t border-slate-700/60 px-5 py-3">
          <Link
            href={`/compliance/disputas?code=4837`}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all bg-red-500/10 hover:bg-red-500/15 text-red-400 border border-red-500/25"
          >
            <Scale size={13} />
            Ver Estratégia de Defesa para RC 4837 (Fraude CNP)
            <ArrowRight size={12} />
          </Link>
        </div>
      )}
    </div>
  );
}
