import Link from "next/link";
import type { Metadata } from "next";
import { ChevronLeft, Network, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Rede CIP/SPB — Câmara Interbancária | VS Payments",
  description:
    "Entenda como o SPB (Sistema de Pagamentos Brasileiro) e a CIP (Câmara Interbancária de Pagamentos) liquidam financeiramente as transações de cartão.",
};

export default function CIPPage() {
  return (
    <div className="bg-background min-h-screen pb-24">

      {/* Header */}
      <div style={{ borderBottom: "1px solid var(--border)", background: "var(--code-bg)" }} className="py-6 px-6">
        <div className="mx-auto max-w-4xl">
          <Link
            href="/compliance"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ChevronLeft size={16} /> Voltar ao Hub de Compliance
          </Link>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center shrink-0 text-emerald-400">
              <Network size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-2">Rede CIP / SPB</h1>
              <p className="text-muted-foreground text-sm max-w-3xl leading-relaxed">
                O <strong>SPB (Sistema de Pagamentos Brasileiro)</strong> é a infraestrutura regulada pelo BCB para
                liquidação financeira final. A <strong>CIP (Câmara Interbancária de Pagamentos)</strong> é a câmara
                multilateral onde os saldos líquidos entre Emissores e Adquirentes são compensados diariamente.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-6 pt-10 space-y-10">

        {/* Fluxo de liquidação */}
        <section>
          <h2 className="text-lg font-bold text-foreground mb-5">Fluxo de liquidação via CIP</h2>
          <div className="space-y-3">
            {[
              {
                step: "1",
                title: "Clearing Bandeira (D+1)",
                desc: "Visa (VSS) e Mastercard (GCMS) consolidam os arquivos de clearing (BASE II / IPM) e calculam os saldos líquidos multilaterais entre cada par Emissor↔Adquirente.",
                color: "#3b82f6",
              },
              {
                step: "2",
                title: "Mensagem de liquidação para o SPB",
                desc: "A Bandeira envia mensagens de liquidação ao SPB via STR (Sistema de Transferência de Reservas), instrução de transferência de reservas bancárias.",
                color: "#8b5cf6",
              },
              {
                step: "3",
                title: "CIP — compensação multilateral",
                desc: "A CIP processa os lançamentos multi-laterais: o Adquirente que pagou o intercâmbio ao Emissor e a Scheme Fee à Bandeira. Valores são netted antes de movimentar reservas.",
                color: "#06b6d4",
              },
              {
                step: "4",
                title: "STR — liquidação final",
                desc: "Liquidação irrevogável nas reservas bancárias no BCB. D+1 para débito, D+2 para crédito (ou D+2/D+30 para crédito parcelado).",
                color: "#10b981",
              },
              {
                step: "5",
                title: "Repasse ao Lojista",
                desc: "Após a liquidação no SPB, o Adquirente repassa ao lojista o valor líquido (MDR net). Recebíveis registrados na CIP conforme Resolução BCB 4.734.",
                color: "#22c55e",
              },
            ].map((s) => (
              <div
                key={s.step}
                style={{
                  display: "flex", gap: "1rem", alignItems: "flex-start",
                  background: "var(--code-bg)", border: "1px solid var(--border)",
                  borderRadius: "0.75rem", padding: "1rem 1.25rem",
                }}
              >
                <div
                  style={{
                    width: 32, height: 32,
                    borderRadius: "50%",
                    background: `${s.color}15`,
                    border: `1px solid ${s.color}35`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <span style={{ fontSize: "0.72rem", fontWeight: 800, color: s.color }}>{s.step}</span>
                </div>
                <div>
                  <p style={{ fontSize: "0.88rem", fontWeight: 700, color: "#f1f5f9", marginBottom: "0.3rem" }}>{s.title}</p>
                  <p style={{ fontSize: "0.8rem", color: "#64748b", lineHeight: 1.65 }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Prazos de liquidação */}
        <section>
          <h2 className="text-lg font-bold text-foreground mb-4">Prazos por modalidade</h2>
          <div className="overflow-x-auto">
            <table
              style={{
                width: "100%", borderCollapse: "collapse",
                fontSize: "0.83rem", background: "var(--code-bg)",
                border: "1px solid var(--border)", borderRadius: "0.75rem", overflow: "hidden",
              }}
            >
              <thead>
                <tr style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid var(--border)" }}>
                  {["Modalidade", "Prazo para Adquirente", "Prazo para Lojista", "Regulação"].map((h) => (
                    <th key={h} style={{ padding: "0.75rem 1rem", textAlign: "left", fontSize: "0.68rem", fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ["Débito",           "D+1",          "D+1",         "BCB Res. 3.682"],
                  ["Crédito à vista",  "D+2",          "D+30",        "BCB Res. 3.682"],
                  ["Crédito parcelado","D+2 por parcela","D+30 por parcela","BCB + contrato"],
                  ["Pré-pago",         "D+1",          "D+1",         "BCB Res. 4.282"],
                  ["PIX",              "Imediato",     "Imediato",    "BCB Res. 1 (PIX)"],
                ].map(([mod, acq, loj, reg], i) => (
                  <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <td style={{ padding: "0.75rem 1rem", fontWeight: 600, color: "#f1f5f9" }}>{mod}</td>
                    <td style={{ padding: "0.75rem 1rem", color: "#4ade80", fontFamily: "monospace" }}>{acq}</td>
                    <td style={{ padding: "0.75rem 1rem", color: "#fbbf24", fontFamily: "monospace" }}>{loj}</td>
                    <td style={{ padding: "0.75rem 1rem", color: "#64748b", fontSize: "0.75rem" }}>{reg}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Recebíveis */}
        <section>
          <div
            style={{
              background: "rgba(16,185,129,0.04)", border: "1px solid rgba(16,185,129,0.18)",
              borderRadius: "0.875rem", padding: "1.25rem 1.5rem",
            }}
          >
            <h3 className="text-sm font-bold text-emerald-300 mb-2">Registro de Recebíveis (Res. BCB 4.734)</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Desde 2021, todos os recebíveis de cartão devem ser registrados na CIP (ou Cerc/TAG). Isso cria um
              ativo financeiro negociável que o lojista pode antecipar. O Adquirente informa os recebíveis futuros e
              a CIP garante que somente um cedente possa comprometer o mesmo recebível.
            </p>
          </div>
        </section>

        {/* CTAs */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/compliance/settlement"
            style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              background: "rgba(6,182,212,0.07)", border: "1px solid rgba(6,182,212,0.2)",
              borderRadius: "0.875rem", padding: "1.25rem 1.5rem", textDecoration: "none",
            }}
            className="hover:opacity-80 transition-opacity"
          >
            <div>
              <div style={{ fontSize: "0.68rem", fontWeight: 700, color: "#22d3ee", textTransform: "uppercase", marginBottom: "0.25rem" }}>Aprofundar</div>
              <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "#f1f5f9" }}>Arquivos IPM / BASE II</div>
              <div style={{ fontSize: "0.75rem", color: "#64748b" }}>TC46, TC05, VSS e GCMS</div>
            </div>
            <ArrowRight size={16} style={{ color: "#22d3ee" }} />
          </Link>
          <Link
            href="/jornada"
            style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              background: "rgba(34,197,94,0.07)", border: "1px solid rgba(34,197,94,0.2)",
              borderRadius: "0.875rem", padding: "1.25rem 1.5rem", textDecoration: "none",
            }}
            className="hover:opacity-80 transition-opacity"
          >
            <div>
              <div style={{ fontSize: "0.68rem", fontWeight: 700, color: "#4ade80", textTransform: "uppercase", marginBottom: "0.25rem" }}>Ciclo completo</div>
              <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "#f1f5f9" }}>Jornada da Transação</div>
              <div style={{ fontSize: "0.75rem", color: "#64748b" }}>Autorização → Clearing → Settlement</div>
            </div>
            <ArrowRight size={16} style={{ color: "#4ade80" }} />
          </Link>
        </section>

      </div>
    </div>
  );
}
