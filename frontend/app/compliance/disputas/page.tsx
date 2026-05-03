import AdvogadoDigitalClient from "./AdvogadoDigitalClient";
import { DmasTimeline } from "./DmasTimeline";
import { Scale, ChevronLeft, BadgeDollarSign } from "lucide-react";
import Link from "next/link";
import RuleReference from "@/components/RuleReference";

export const metadata = {
  title: "Advogado Digital de Disputas — VS Payments",
  description:
    "Ferramenta forense de chargebacks: escolha o Reason Code e receba prazo, estratégia de defesa, documentos obrigatórios e chance de reversão.",
};

interface Props {
  searchParams: Promise<{ code?: string }>;
}

export default async function DisputePage({ searchParams }: Props) {
  const params = await searchParams;
  const initialCode = params?.code;

  return (
    <div style={{ background: "#030711", minHeight: "100vh" }} className="pb-20">

      {/* ── Header ── */}
      <div
        className="dot-grid"
        style={{
          borderBottom: "1px solid #0f1a2e",
          background: "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(139,92,246,0.12) 0%, transparent 65%)",
          padding: "4rem 1.5rem 3rem",
        }}
      >
        <div className="mx-auto max-w-6xl">
          <Link
            href="/compliance"
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white mb-6 transition-colors"
          >
            <ChevronLeft size={14} /> Voltar ao Command Center
          </Link>

          <div className="flex items-start gap-4 mb-4">
            <div
              style={{
                width: 48, height: 48, borderRadius: "0.875rem", flexShrink: 0,
                background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.25)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <Scale size={22} style={{ color: "#a78bfa" }} />
            </div>
            <div>
              <p className="section-eyebrow mb-1">Inteligência Forense</p>
              <h1 className="font-bold text-white text-2xl md:text-3xl mb-2" style={{ letterSpacing: "-0.02em" }}>
                Advogado Digital de Disputas
              </h1>
              <p className="text-slate-400 text-sm leading-relaxed max-w-2xl">
                Selecione o Reason Code do chargeback e receba instantaneamente a estratégia de defesa,
                prazo de ação, documentos obrigatórios por prioridade e a taxa de reversão estimada.
                {initialCode && (
                  <span className="ml-1 text-orange-400 font-semibold">
                    Analisando RC {initialCode} — detectado no Simulador.
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Conteúdo Principal ── */}
      <div className="mx-auto max-w-6xl px-6 pt-10">
        <AdvogadoDigitalClient initialCode={initialCode} />

        {/* ── Grid: Custo da Arbitragem + Timeline DMAS ── */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Custo da Arbitragem */}
          <div
            style={{
              background: "rgba(239,68,68,0.04)", border: "1px solid rgba(239,68,68,0.15)",
              borderRadius: "1rem", padding: "1.5rem",
            }}
          >
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
              <BadgeDollarSign size={16} className="text-red-400" />
              O Custo Doloroso da Arbitragem
            </h3>
            <div className="space-y-3 text-sm">
              {[
                { label: "Filing Fee", value: "USD/EUR 150", desc: "Apenas para o caso ser lido pela bandeira" },
                { label: "Review Fee", value: "USD/EUR 250", desc: "Cobrado do perdedor da disputa" },
                { label: "Withdrawal Fee", value: "USD 100", desc: "Se desistir durante o Pre-Arb" },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0 mt-2" />
                  <div>
                    <span className="text-white font-semibold">{item.label}:</span>{" "}
                    <span className="font-mono text-red-300">{item.value}</span>
                    <p className="text-xs text-slate-500">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 rounded-lg border border-red-500/20 bg-red-500/5 text-xs text-red-300 leading-relaxed">
              <strong>Regra de Ouro:</strong> Nunca leve à Arbitragem se o valor for inferior a USD 500,
              a menos que tenha 100% de confiança na evidência.{" "}
              <RuleReference manual="Mastercard Chargeback Guide" chapter="Arbitration & Compliance" label="Ver manual" />
            </div>
          </div>

          {/* Timeline DMAS Interativa */}
          <DmasTimeline />
        </div>
      </div>
    </div>
  );
}
