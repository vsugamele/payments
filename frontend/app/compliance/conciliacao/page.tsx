import Link from "next/link";
import { ArrowLeft, Scale, DollarSign, FileText, CheckCircle2, ShieldAlert } from "lucide-react";
import { ConciliacaoClient } from "./ConciliacaoClient";
import { ExecutiveBusinessTriad } from "@/components/ExecutiveBusinessTriad";

export const metadata = {
  title: "Playbook de Conciliação Financeira: VSS 110, MCBS & CIP — VS Payments",
  description: "Roteiro canônico de batimento em três pontas: Captura interna vs Relatórios de Bandeira (VSS 110 / MCBS) vs Liquidação CIP e Banco Central.",
};

export default function ConciliacaoPage() {
  return (
    <main className="bg-background pb-24">
      {/* Header Playbook */}
      <section
        className="dot-grid"
        style={{
          background: "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(37,99,235,0.08) 0%, transparent 70%)",
          padding: "4rem 1.5rem 3.5rem",
          borderBottom: "1px solid #0f172a",
        }}
      >
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center gap-3 mb-4">
            <Link
              href="/compliance"
              style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", fontSize: "0.8rem", color: "var(--muted-foreground)" }}
              className="hover:text-white transition-colors"
            >
              <ArrowLeft size={13} /> Voltar para Compliance
            </Link>
            <span className="text-slate-600">/</span>
            <Link
              href="/mapa/liquidacao"
              className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              Atlas de Liquidação VisaNet & MCBS
            </Link>
          </div>

          <div className="flex flex-col md:flex-row items-start gap-6">
            <div
              style={{
                width: 52, height: 52,
                borderRadius: "1rem",
                background: "rgba(37,99,235,0.1)",
                border: "1px solid rgba(37,99,235,0.2)",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Scale size={24} style={{ color: "#3b82f6" }} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="section-eyebrow">Playbook de Tesouraria & Reconciliação</span>
                <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-bold font-mono">
                  Batimento em 3 Pontas · D+0 a D+3
                </span>
              </div>
              <h1 className="font-bold text-white mb-3" style={{ fontSize: "clamp(1.6rem, 4vw, 2.4rem)", lineHeight: 1.1 }}>
                Playbook de Conciliação Financeira <br className="hidden md:block"/> VSS 110, MCBS & CIP/Bacen
              </h1>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-3xl">
                O guia auditável de reconciliação para adquirentes e subadquirentes. Aprenda a cruzar os relatórios oficiais de clearing (VSS 110/120 da Visa e TN3A/MCBS da Mastercard) com a liquidação multilateral na CIP e no Banco Central, estancando vazamentos de margem centavo a centavo.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Tríade Executiva de Negócios ── */}
      <section className="mx-auto max-w-6xl px-6 pt-8">
        <ExecutiveBusinessTriad
          topic="Conciliação Financeira & Batimento em Três Pontas"
          subtitle="O processo diário que impede que a diferença entre o que o sistema acha que processou e o que a bandeira cobrou vire um rombo contábil."
          whatIsIt={{
            lead: "A conciliação em três pontas é a conferência cruzada entre: 1) Captura interna (POS/Gateway), 2) Clearing da bandeira (VSS 110 / MCBS) e 3) Liquidação bancária (CIP / Bacen STR).",
            explanation: "As adquirentes autorizam transações em tempo real, mas o dinheiro só é compensado no dia seguinte em lotes multilaterais. Se houver divergência de intercâmbio (downgrade) ou multas na fatura de rede, apenas o batimento em 3 pontas aponta a discrepância antes do fechamento do mês.",
            analogy: "É como auditar um restaurante comparando os pedidos feitos na mesa, o relatório do caixa do garçom e o extrato bancário onde o dinheiro caiu: se faltar um real em qualquer uma das três pontas, alguém pagou a conta errada."
          }}
          painOwner={{
            primaryRole: "Head de Conciliação Financeira, Controller & Diretor de Tesouraria",
            affectedEntities: ["Adquirentes", "Subadquirentes", "Grandes Lojistas / Marketplaces", "Instituições de Pagamento"],
            operationalImpact: "Se a equipe não identificar divergências dentro de 60 a 75 dias, o direito de abrir disputa operacional (DMAS na Mastercard ou VROL na Visa) preclui e a empresa assume o prejuízo integral."
          }}
          financialPrice={{
            directPenalty: "Vazamento cumulativo de centavos que atinge dezenas de milhares de reais por mês",
            schemeFeesFine: "Tarifas de rede duplicadas ou penalidades operacionais não identificadas",
            annualBleedingEstimate: "R$ 480.000 a R$ 2.400.000 / ano em perda invisível para adquirentes médias",
            consequence: "Apontamento grave de auditoria externa (SOX / Big Four), descasamento de saldo no razão contábil e risco de autuação do Banco Central."
          }}
        />
      </section>

      {/* ── Plataforma de Conciliação Interativa ── */}
      <section className="mx-auto max-w-6xl px-6 py-6">
        <ConciliacaoClient />
      </section>

      {/* ── Navegação de Aprofundamento ── */}
      <section className="mx-auto max-w-6xl px-6 pt-10 border-t border-slate-900">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
          Ferramentas & Mapas Relacionados
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            href="/mapa/liquidacao"
            className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 hover:bg-slate-900 transition-all group"
          >
            <div className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors mb-1">
              Atlas de Liquidação VisaNet & MCBS
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Diagramas interativos completos de ciclos D+0 a D+3 e fluxos multilaterais.
            </p>
          </Link>
          <Link
            href="/compliance/linter"
            className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 hover:bg-slate-900 transition-all group"
          >
            <div className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors mb-1">
              Inspetor & Linter Visual ISO 8583
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Valide e depure cada campo de autorização e clearing em tempo real.
            </p>
          </Link>
          <Link
            href="/simulador"
            className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 hover:bg-slate-900 transition-all group"
          >
            <div className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors mb-1">
              Simulador de Intercâmbio & Downgrade
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Calcule taxas e projete o sangramento financeiro de downgrades em tempo real.
            </p>
          </Link>
        </div>
      </section>
    </main>
  );
}
