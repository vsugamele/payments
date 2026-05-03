"use client";

import { useState } from "react";
import { Clock, Database, ArrowRight, ChevronDown, Server, DollarSign, FileText, Zap } from "lucide-react";
import RuleReference from "@/components/RuleReference";
import TermTooltip from "@/components/TermTooltip";

type EventType = {
  time: string;
  label: string;
  phase: "D0" | "D1" | "D2" | "D3";
  what_happens: string;
  technical_detail: string;
  files?: string[];
  iso_fields?: Record<string, string>;
  risk_note?: string;
  manual?: string;
  manual_ref?: string;
};

const EVENTS_MC: EventType[] = [
  {
    time: "T+0ms", label: "Autorização (Online)", phase: "D0",
    what_happens: "O terminal envia a mensagem ISO 8583 0100/0200. O emissor responde com 0110/0210 (Response Code 00 = Aprovado).",
    technical_detail: "A autorização NÃO move dinheiro. Apenas reserva fundos (hold). O ARPC do emissor valida o ARQC do chip.",
    iso_fields: { "MTI": "0100 (Authorization Request)", "DE 39": "00 (Approved)", "DE 38": "Approval Code (6 chars)", "DE 55": "ICC Data (TVR, ARQC, ATC...)" },
    manual: "ISO 8583:1987", manual_ref: "Section 4: Message Type Indicators (MTI)"
  },
  {
    time: "T+5s a T+2h", label: "Captura / Apresentação", phase: "D0",
    what_happens: "O lojista envia a mensagem de captura (0220) confirmando o valor final da transação. Sem captura, a autorização expira.",
    technical_detail: "A captura é o gatilho real do clearing. Pode ser automática (online capture) ou batch (postos de gasolina, hotéis).",
    iso_fields: { "MTI": "0220 (Financial Transaction Request/Advice)", "DE 4": "Valor final capturado", "DE 37": "Retrieval Reference Number (RRN)", "DE 90": "Original Data Elements" },
    risk_note: "Se o lojista não capturar em até 7 dias (Visa) ou 30 dias (MC), a autorização expira e o lojista perde a venda.",
    manual: "Visa Core Rules", manual_ref: "Chapter 7: Transaction Processing — Capture"
  },
  {
    time: "D+0 Noite (22h-02h)", label: "Clearing / IPM / Base II", phase: "D1",
    what_happens: "O adquirente envia o arquivo de clearing para a bandeira. A Mastercard usa o IPM (Interchange Processing Messages) e a Visa usa o SMS/Base II.",
    technical_detail: "O arquivo é um conjunto de TCs (Transaction Codes). TC05 = Presentment. TC50 = Chargeback. TC46 = Settlement.",
    files: ["IPM (Mastercard): formato EBCDIC binário com múltiplos PDS e DE", "Base II (Visa): arquivo ASCII estruturado, lote diário", "Elo: formato próprio baseado no padrão ISO 8583 batch"],
    manual: "Mastercard Rules", manual_ref: "IPM Interface Processor Manual — TC Classification"
  },
  {
    time: "D+1 Manhã (06h-10h)", label: "Compensação (Bandeira → Banco)", phase: "D1",
    what_happens: "A bandeira calcula as posições líquidas de cada participante (emissor e adquirente). O valor do intercâmbio é debitado do adquirente e creditado ao emissor.",
    technical_detail: "A liquidação é MULTILATERAL LÍQUIDA. Não são transferências brutas individuais. A Mastercard usa o Banknet Settlement; Visa usa o Single Message System (SMS).",
    iso_fields: { "Intercâmbio": "Debitado do Adquirente (vai para o Emissor)", "Scheme Fee": "Debitado de ambos os lados para a Bandeira", "Net Position": "Valor final a receber/pagar por cada banco" },
    manual: "Visa Core Rules", manual_ref: "Chapter 8: Settlement — Net Settlement Calculation"
  },
  {
    time: "D+1 Tarde / D+2", label: "Liquidação (SPB / SWIFT)", phase: "D2",
    what_happens: "A liquidação financeira real ocorre via SPB (Sistema de Pagamentos Brasileiro) para transações locais ou via SWIFT para internacionais.",
    technical_detail: "Os bancos transferem fundos entre si com base na posição líquida calculada pela bandeira. No Brasil, o BACEN supervisiona este processo via SPB.",
    risk_note: "Transações internacionais em moeda estrangeira sofrem conversão cambial aqui. A taxa de câmbio usada é a do DCC ou da bandeira no D+1.",
    manual: "Resolução BCB Nº 150", manual_ref: "Art. 15: Liquidação de Arranjos de Pagamento"
  },
  {
    time: "D+2 a D+3", label: "Crédito ao Lojista (EFA)", phase: "D3",
    what_happens: "O adquirente repassa os fundos ao lojista. A Mastercard garante o EFA (Expedited Funds Availability) — fundos disponíveis em D+2 para débito e D+30 para crédito parcelado.",
    technical_detail: "O desconto do MDR (Merchant Discount Rate) é aplicado aqui. O lojista recebe o valor bruto menos o MDR (que inclui o intercâmbio + fee do adquirente).",
    iso_fields: { "EFA": "Expedited Funds Availability (garantia Mastercard)", "MDR": "Merchant Discount Rate (intercâmbio + spread do adquirente)", "D+2 Débito": "Padrão EFA para débito e pré-pago", "D+30 Parcelado": "Prazo para crédito parcelado lojista" },
    risk_note: "Se houver chargeback após o crédito ao lojista, o adquirente debita o MDR na próxima liquidação.",
    manual: "Mastercard Rules", manual_ref: "Section 7.2: Expedited Funds Availability (EFA)"
  },
];

const EVENTS_VISA: EventType[] = [
  {
    time: "T+0ms", label: "Autorização (Visa SMS)", phase: "D0",
    what_happens: "O terminal envia ISO 8583 0100. A Visa processa via VisaNet/SMS (Single Message System). Para débito, o SMS aprova E captura em uma só mensagem.",
    technical_detail: "Visão Visa: crédito usa Dual Message (0100/0110 + 0220). Débito usa Single Message (0200/0210) — captura instantânea. O CPS (Custom Payment Service) valida o IRD.",
    iso_fields: { "MTI": "0100 (Auth) ou 0200 (Financial SMS)", "DE 39": "00 (Approved)", "DE 38": "Approval Code", "DE 44": "Additional Response Data (Visa CPS)" },
    manual: "Visa Core Rules", manual_ref: "Chapter 1: VisaNet — Single Message System"
  },
  {
    time: "T+5s a T+24h", label: "Captura / Apresentação (Base II)", phase: "D0",
    what_happens: "O adquirente transmite o arquivo Base II (lote diário) para a VisaNet. Cada transação de crédito apresentada no Base II é um 'Transaction Code 05 Record'.",
    technical_detail: "Base II é arquivo ASCII com campos de comprimento fixo. Diferença-chave do IPM (Mastercard): Base II é mais simples, sem o conceito de PDS (Private Data Subelement).",
    files: ["Base II: formato ASCII, lote diário, enviado até 23:59 GMT-3", "VisaNet Global Clearing: consolida BASE II de todos os adquirentes", "Elo: formato próprio, diferente do Base II"],
    risk_note: "Janela de captura Visa: 7 dias para crédito. Após esse prazo, a autorização expira e a Visa não garante o pagamento.",
    manual: "Visa Core Rules", manual_ref: "Chapter 5: BASE II — Transaction Presentment"
  },
  {
    time: "D+1 Manhã (06h-10h)", label: "Compensação (VisaNet Settlement)", phase: "D1",
    what_happens: "A VisaNet calcula posições líquidas. O intercambio é creditado ao Banco Emissor e debitado do Adquirente. Visa usa o método de Multilateral Net Settlement.",
    technical_detail: "Diferente da Mastercard (Banknet): a Visa consolida via VisaNet Central. O CPS Score de cada transação determina a taxa de intercambio qualificada (CPS/Retail, CPS/E-com, etc).",
    iso_fields: { "CPS": "Custom Payment Service — qualifica a taxa de intercambio", "IRD": "Interchange Rate Designator — código da taxa aplicada", "Net Settlement": "Compensação multilateral líquida" },
    manual: "Visa Core Rules", manual_ref: "Chapter 8: Settlement — VisaNet Net Settlement"
  },
  {
    time: "D+1 Tarde / D+2", label: "Liquidação (SPB / SWIFT)", phase: "D2",
    what_happens: "Mesma infraestrutura SPB para transações locais. Visa usa SWIFT para liquidações internacionais. A Visa não tem o conceito de EFA (Expedited Funds Availability) da Mastercard.",
    technical_detail: "Prazo Visa: crédito ao lojista geralmente em D+1 a D+2. A Visa não define um prazo padrão EFA — o contrato com o adquirente define o prazo de repasse.",
    risk_note: "Visa não tem EFA obrigatório. O prazo de crédito ao lojista é contratual entre lojista e adquirente.",
    manual: "Visa Core Rules", manual_ref: "Chapter 8: Settlement — Settlement Timing"
  },
];


const PHASE_CONFIG = {
  D0: { label: "D+0 (Dia da Transação)", color: "#22d3ee", bg: "rgba(34,211,238,0.08)", border: "rgba(34,211,238,0.2)" },
  D1: { label: "D+1 (Clearing)",        color: "#a78bfa", bg: "rgba(167,139,250,0.08)", border: "rgba(167,139,250,0.2)" },
  D2: { label: "D+2 (Settlement)",      color: "#f59e0b", bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.2)" },
  D3: { label: "D+3 (Crédito Lojista)", color: "#4ade80", bg: "rgba(74,222,128,0.08)", border: "rgba(74,222,128,0.2)" },
};


const PHASE_ICONS = { D0: Zap, D1: Database, D2: DollarSign, D3: DollarSign };

export default function SettlementClient() {
  const [expanded, setExpanded] = useState<string | null>("T+0ms");
  const [scheme, setScheme] = useState<"mastercard" | "visa">("mastercard");

  const EVENTS = scheme === "mastercard" ? EVENTS_MC : EVENTS_VISA;
  const schemeColor = scheme === "mastercard" ? "#f97316" : "#3b82f6";
  const schemeName = scheme === "mastercard" ? "Mastercard (IPM)" : "Visa (Base II)";

  return (
    <div className="space-y-4">

      {/* ── Toggle Bandeira ── */}
      <div className="flex gap-1.5 p-1 bg-black/30 rounded-xl border border-slate-800 self-start w-fit mb-2">
        {(["mastercard", "visa"] as const).map(s => (
          <button
            key={s}
            onClick={() => { setScheme(s); setExpanded(null); }}
            className="px-4 py-1.5 rounded-lg text-xs font-bold transition-all"
            style={{
              background: scheme === s ? (s === "mastercard" ? "rgba(249,115,22,0.2)" : "rgba(59,130,246,0.2)") : "transparent",
              color: scheme === s ? (s === "mastercard" ? "#fb923c" : "#60a5fa") : "#64748b",
              border: scheme === s ? `1px solid ${s === "mastercard" ? "#f9741630" : "#3b82f630"}` : "1px solid transparent",
            }}
          >
            {s === "mastercard" ? "🔴 Mastercard (IPM)" : "🔵 Visa (Base II)"}
          </button>
        ))}
      </div>

      {EVENTS.map(ev => {
        const { color, bg, border } = PHASE_CONFIG[ev.phase];
        const isOpen = expanded === ev.time;
        const PhaseIcon = PHASE_ICONS[ev.phase];

        return (
          <div
            key={ev.time}
            className="rounded-2xl border overflow-hidden transition-all"
            style={{ borderColor: isOpen ? border : "var(--border)", background: isOpen ? bg : "var(--code-bg)" }}
          >
            <button
              onClick={() => setExpanded(isOpen ? null : ev.time)}
              className="w-full flex items-center gap-4 px-5 py-4 text-left"
            >
              {/* Timeline dot */}
              <div className="flex flex-col items-center shrink-0">
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: `${color}20`, border: `1px solid ${color}40` }}>
                  <PhaseIcon size={14} style={{ color }} />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-bold" style={{ color }}>{ev.time}</span>
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider"
                    style={{ background: `${color}15`, color, border: `1px solid ${color}25` }}
                  >
                    {ev.phase}
                  </span>
                </div>
                <p className="font-bold text-foreground text-sm mt-0.5">{ev.label}</p>
              </div>

              <ChevronDown
                size={16}
                className="shrink-0 text-muted-foreground transition-transform"
                style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
              />
            </button>

            {isOpen && (
              <div className="px-5 pb-5 pt-1 space-y-4 border-t border-border/40 animate-in fade-in duration-200">
                <p className="text-sm text-muted-foreground leading-relaxed">{ev.what_happens}</p>

                <div className="bg-background/60 rounded-xl p-4 border border-border/60">
                  <p className="text-xs font-bold text-foreground mb-1.5 flex items-center gap-1.5">
                    <Server size={11} style={{ color }} />
                    Detalhe Técnico
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{ev.technical_detail}</p>
                </div>

                {ev.iso_fields && (
                  <div className="bg-background/60 rounded-xl overflow-hidden border border-border/60">
                    <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground px-4 py-2 border-b border-border/40 flex items-center gap-1.5">
                      <FileText size={11} /> Campos / Conceitos Chave
                    </p>
                    {Object.entries(ev.iso_fields).map(([k, v]) => (
                      <div key={k} className="flex gap-3 px-4 py-2.5 border-b border-border/30 last:border-0 text-xs">
                        <span className="font-mono font-bold shrink-0 w-32" style={{ color }}>{k}</span>
                        <span className="text-muted-foreground">{v}</span>
                      </div>
                    ))}
                  </div>
                )}

                {ev.files && (
                  <div className="space-y-1.5">
                    <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground flex items-center gap-1.5"><Database size={11} />Arquivos de Clearing</p>
                    {ev.files.map(f => (
                      <div key={f} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <ArrowRight size={11} className="mt-0.5 shrink-0" style={{ color }} />
                        {f}
                      </div>
                    ))}
                  </div>
                )}

                {ev.risk_note && (
                  <div className="flex gap-2 p-3 rounded-xl border border-amber-500/25 bg-amber-500/8 text-xs text-amber-300">
                    <span className="shrink-0">⚠️</span>
                    {ev.risk_note}
                  </div>
                )}

                {ev.manual && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Referência normativa:</span>
                    <RuleReference manual={ev.manual} ruleId={ev.manual_ref || ""} description={ev.what_happens} />
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
