import IntercambioClient from "./IntercambioClient";
import RuleReference from "@/components/RuleReference";
import Link from "next/link";
import { ChevronLeft, Landmark, TrendingDown, Info, Calculator } from "lucide-react";

export const metadata = {
  title: "Playbook de Intercâmbio: IRDs e Custos | VS Payments",
  description: "Dicionário normativo das taxas de intercâmbio (IRDs). Consulte os tetos do BACEN, programas de Master/Visa/Elo, e regras de downgrade como EIRF.",
};

export default function IntercambioPage() {
  return (
    <div className="bg-background min-h-screen pb-24">
      {/* Header */}
      <div style={{ borderBottom: "1px solid var(--border)", background: "var(--code-bg)" }} className="py-6 px-6">
        <div className="mx-auto max-w-5xl">
          <Link href="/compliance" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
            <ChevronLeft size={16} /> Voltar ao Hub de Compliance
          </Link>
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/15 border border-blue-500/25 text-blue-400 flex items-center justify-center shrink-0">
              <Landmark size={22} />
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap mb-1">
                <h1 className="text-2xl font-bold text-foreground">Playbook Normativo de Intercâmbio</h1>
                <RuleReference
                  manual="Bandeiras & BACEN"
                  ruleId="Resolução BCB Nº 150/2021 + Interchange Manuals"
                  description="Consolidação das regras de custo de captação (IRDs), tetos regulatórios brasileiros e punições de clearing (Downgrades)."
                />
              </div>
              <p className="text-muted-foreground text-sm max-w-3xl leading-relaxed">
                Este é o Dicionário Base das bandeiras. Entenda exatamente o que compõe o custo de intercâmbio (Merchant Discount Rate), 
                os tetos para produtos regulados (Débito e Pré-pago), os pesados custos de funding em cartões Black/Infinite, 
                e as armadilhas sistêmicas que causam "Downgrade" da sua taxa, como falhas em transações e-commerce ou atraso no Clearing.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 pt-10 space-y-12">
        {/* Context pills */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              icon: Landmark,
              color: "#3b82f6",
              bg: "rgba(59,130,246,0.08)",
              border: "rgba(59,130,246,0.2)",
              title: "A Margem da Adquirente",
              desc: "O Intercâmbio é a maior parcela da MDR (taxa da maquininha). Ele é pago pela Adquirente ao Banco Emissor (Itaú, Nubank). Entender os IRDs é a única forma de precificar seu cliente com lucro real.",
            },
            {
              icon: Info,
              color: "#a78bfa",
              bg: "rgba(167,139,250,0.08)",
              border: "rgba(167,139,250,0.2)",
              title: "Teto Regulatório (Débito)",
              desc: "A Res. BACEN Nº 150/2021 impõe um teto de 0.50% para cartões de débito e 0.70% para pré-pagos. Produtos corporativos e cartões de crédito operam em livre mercado (sem teto).",
            },
            {
              icon: TrendingDown,
              color: "#ef4444",
              bg: "rgba(239,68,68,0.08)",
              border: "rgba(239,68,68,0.2)",
              title: "O Perigo do Downgrade",
              desc: "Se a transação falhar nos critérios de segurança (sem CVV) ou demorar para ser liquidada (Late Presentment), ela cai na cascata de 'EIRF', a taxa de punição máxima da rede.",
            },
          ].map(card => {
            const Icon = card.icon;
            return (
              <div key={card.title} className="p-5 rounded-xl border" style={{ background: card.bg, borderColor: card.border }}>
                <div className="flex items-center gap-2 mb-2">
                  <Icon size={16} style={{ color: card.color }} />
                  <h3 className="font-bold text-sm" style={{ color: card.color }}>{card.title}</h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{card.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Decoder / Client */}
        <section>
          <div className="mb-6">
            <h2 className="text-lg font-bold text-foreground">Dicionário de Taxas e Produtos</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Explore as tabelas normativas, os programas de monitoria e os critérios técnicos que ativam cada taxa nas principais bandeiras.
            </p>
          </div>
          <IntercambioClient />
        </section>

        {/* What's next */}
        <div className="p-6 rounded-2xl border border-border bg-code-bg">
          <h3 className="font-bold text-foreground mb-4">Simulação Avançada</h3>
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
            A teoria mostrada acima reflete as manuais normativos. Para testar o impacto real dessas regras e IRDs no cálculo cruzado com o MCC (Ramo de Atividade) e com o Canal (E-commerce / Físico), utilize o Simulador Interativo.
          </p>
          <div className="flex gap-3 flex-wrap">
            <Link href="/simulador" className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 border border-blue-500/20 px-4 py-2.5 rounded-lg transition-colors font-semibold">
              <Calculator size={16} /> Ir para o Motor de Simulação
            </Link>
            <Link href="/compliance/settlement" className="inline-flex items-center gap-2 text-sm text-emerald-400 hover:text-emerald-300 border border-emerald-500/20 px-4 py-2.5 rounded-lg transition-colors font-semibold">
              Ver Prazos de Liquidação (Clearing)
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
