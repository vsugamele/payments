import SettlementClient from "./SettlementClient";
import TermTooltip from "@/components/TermTooltip";
import RuleReference from "@/components/RuleReference";
import Link from "next/link";
import { ChevronLeft, DollarSign, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Ciclo de Settlement & Clearing | VS Payments",
  description: "Entenda o que acontece de D+0 a D+3: Autorização, Captura, Clearing (IPM/Base II), Settlement (SPB/SWIFT) e Crédito ao Lojista (EFA). Referências normativas Mastercard, Visa e BCB.",
};

export default function SettlementPage() {
  return (
    <div className="bg-background min-h-screen pb-24">
      <div style={{ borderBottom: "1px solid var(--border)", background: "var(--code-bg)" }} className="py-6 px-6">
        <div className="mx-auto max-w-4xl">
          <Link href="/compliance" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ChevronLeft size={16} /> Voltar ao Hub de Compliance
          </Link>
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/25 text-amber-400 flex items-center justify-center shrink-0">
              <DollarSign size={22} />
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap mb-1">
                <h1 className="text-2xl font-bold text-foreground">Ciclo de Settlement & Clearing</h1>
                <RuleReference
                  manual="Mastercard Rules"
                  ruleId="Chapter 7: Settlement — Net Settlement"
                  description="Processo de clearing e liquidação multilateral líquida da Mastercard via Banknet Settlement."
                />
              </div>
              <p className="text-muted-foreground text-sm max-w-3xl leading-relaxed">
                A jornada da transação não termina na autorização. Após o "aprovado", existe um ciclo de{" "}
                <TermTooltip term="Clearing" definition="Processo de compensação onde as bandeiras consolidam todas as transações capturadas do dia, calculam as posições financeiras líquidas e enviam os arquivos (IPM/Base II) para movimentação dos fundos entre bancos." />{" "}
                e{" "}
                <TermTooltip term="Settlement" definition="Liquidação financeira efetiva — o momento em que os fundos saem de um banco e chegam ao outro, via SPB (Brasil) ou SWIFT (internacional), com base na posição líquida calculada no clearing." />{" "}
                que pode durar até D+3. Cada fase tem regras, arquivos e campos técnicos distintos.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-6 pt-10 space-y-12">

        {/* Phase summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { phase: "D+0", label: "Autorização & Captura", color: "#22d3ee", desc: "Aprovação online, reserva de fundos, arquivo de captura enviado." },
            { phase: "D+1", label: "Clearing (IPM/Base II)", color: "#a78bfa", desc: "Bandeira compensa as transações, calcula posições líquidas." },
            { phase: "D+2", label: "Settlement (SPB/SWIFT)", color: "#f59e0b", desc: "Fundos movimentados entre bancos via sistema de pagamentos." },
            { phase: "D+3", label: "EFA — Crédito Lojista", color: "#4ade80", desc: "Adquirente credita lojista (D+2 no débito, D+30 no parcelado)." },
          ].map(p => (
            <div key={p.phase} className="p-4 rounded-xl border" style={{ borderColor: `${p.color}25`, background: `${p.color}08` }}>
              <span className="font-mono text-lg font-black" style={{ color: p.color }}>{p.phase}</span>
              <p className="text-xs font-bold text-foreground mt-1 mb-1">{p.label}</p>
              <p className="text-[11px] text-muted-foreground leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>

        {/* Interactive Timeline */}
        <section>
          <div className="mb-6">
            <h2 className="text-lg font-bold text-foreground">Timeline Interativo</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Clique em cada etapa para ver os detalhes técnicos, campos ISO, arquivos de clearing e referências normativas.
            </p>
          </div>
          <SettlementClient />
        </section>

        {/* Cross-links */}
        <div className="flex flex-wrap gap-3">
          <Link href="/jornada" className="text-xs text-cyan-400 border border-cyan-500/20 bg-code-bg px-3 py-2 rounded-lg hover:text-cyan-300 transition-colors flex items-center gap-1.5">
            <ArrowRight size={12} /> Jornada da Transação (D+0 detalhado)
          </Link>
          <Link href="/compliance/emv" className="text-xs text-cyan-400 border border-cyan-500/20 bg-code-bg px-3 py-2 rounded-lg hover:text-cyan-300 transition-colors flex items-center gap-1.5">
            <ArrowRight size={12} /> Decodificador EMV TVR
          </Link>
          <Link href="/simulador" className="text-xs text-cyan-400 border border-cyan-500/20 bg-code-bg px-3 py-2 rounded-lg hover:text-cyan-300 transition-colors flex items-center gap-1.5">
            <ArrowRight size={12} /> Simulador de Intercâmbio
          </Link>
        </div>
      </div>
    </div>
  );
}
