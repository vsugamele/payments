import Link from "next/link";
import { ArrowLeft, Terminal, ShieldAlert, Cpu, Database, CheckCircle2 } from "lucide-react";
import { LinterClient } from "./LinterClient";

export const metadata = {
  title: "Inspetor & Linter Visual ISO 8583 / Base II — Compliance Payments",
  description: "Audite mensagens raw de autorização e clearing em tempo real contra as regras de release e downgrade de bandeiras.",
};

export default function LinterPage() {
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
              href="/compliance/campos"
              className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              Dicionário de Campos ISO
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
              <Terminal size={24} style={{ color: "#3b82f6" }} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="section-eyebrow">Motor de Auditoria em Tempo Real</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold font-mono">
                  ISO 8583 · Base II · IPM
                </span>
              </div>
              <h1 className="font-bold text-white mb-3" style={{ fontSize: "clamp(1.6rem, 4vw, 2.4rem)", lineHeight: 1.1 }}>
                Inspetor & Linter Visual <br className="hidden md:block"/> de Mensagens de Cartão
              </h1>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-3xl">
                Cole logs de autorização ou registros de clearing para dissecar cada campo (DE, PDS, TLV) e detectar violações de compliance, penalidades de retentativa e perdas silenciosas de margem (downgrade tarifário) antes do envio para a bandeira.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Laboratório Interativo (Linter Client) ── */}
      <section className="mx-auto max-w-6xl px-6 py-10">
        <LinterClient />
      </section>

      {/* ── Links de Aprofundamento ── */}
      <section className="mx-auto max-w-6xl px-6 pt-6 border-t border-slate-900">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
          Conexões com Manuais & Regras Operacionais
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            href="/compliance/downgrade"
            className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 hover:bg-slate-900 transition-all group"
          >
            <div className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors mb-1">
              Manual de Downgrade Tarifário
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Entenda os critérios exatos que fazem uma transação cair do Tier Prime para o Standard.
            </p>
          </Link>
          <Link
            href="/compliance/retentativas"
            className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 hover:bg-slate-900 transition-all group"
          >
            <div className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors mb-1">
              Políticas de Retentativa (Response Codes)
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Matriz completa de códigos de recusa permitidos vs multas por retentativas em cartões cancelados.
            </p>
          </Link>
          <Link
            href="/compliance/conciliacao"
            className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 hover:bg-slate-900 transition-all group"
          >
            <div className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors mb-1">
              Playbook de Conciliação Financeira
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Batimento centavo a centavo entre relatórios VSS 110, faturas MCBS e liquidação CIP/Bacen.
            </p>
          </Link>
        </div>
      </section>
    </main>
  );
}
