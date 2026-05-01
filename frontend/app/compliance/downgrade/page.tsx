import Link from "next/link";
import type { Metadata } from "next";
import {
  ChevronLeft, TrendingDown, AlertTriangle, CheckCircle2, XCircle,
  ArrowRight, FileText, Shield, Calculator,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Downgrade de Intercâmbio — Causas, Custo e Prevenção | VS Payments",
  description:
    "Entenda o que causa o downgrade silencioso no clearing (BASE II / IPM), quanto custa em BRL e como os 7 gatilhos técnicos podem ser eliminados.",
};

// ─── Dados ────────────────────────────────────────────────────────────────────

interface Gatilho {
  id: number;
  titulo: string;
  arquivo: "BASE II" | "IPM" | "Ambos";
  campo: string;
  descricao: string;
  exemplo: string;
  prevencao: string;
  custo: "Alto" | "Médio" | "Baixo";
}

const GATILHOS: Gatilho[] = [
  {
    id: 1,
    titulo: "ECI ausente ou incorreto no e-commerce",
    arquivo: "Ambos",
    campo: "Visa: Field 61 (ECI) + Field 126.9 (CAVV) | MC: DE 48.42 + DE 48.43",
    descricao:
      "Transação de e-commerce enviada sem o ECI (Electronic Commerce Indicator) ou sem o CAVV/AAV correspondente. A Bandeira não consegue confirmar o nível de autenticação e reclassifica para o tier CNP não autenticado.",
    exemplo:
      "Visa Platinum e-com com 3DS → taxa normal 1,64%. Sem ECI 05 no arquivo de clearing → downgrade para Non-Authenticated = 2,40%.",
    prevencao:
      "Injetar ECI e CAVV no arquivo de clearing a partir dos dados retornados pelo MPI. Nunca usar o ECI da autorização sem verificar se chegou no arquivo de clearing.",
    custo: "Alto",
  },
  {
    id: 2,
    titulo: "PDS incompleto ou ausente no IPM",
    arquivo: "IPM",
    campo: "DE 48 — PDS (Private Data Subelements)",
    descricao:
      "O IPM da Mastercard exige uma série de Private Data Subelements (PDS) no DE 48. Campos obrigatórios ausentes ou mal formatados fazem o sistema de clearing reclassificar a transação para um tier genérico.",
    exemplo:
      "MC World E-com c/ SecureCode → taxa normal 1,50%. DE 48.42 (UCAF) vazio no arquivo TC46 → reclassificado para Non-Authenticated = 2,15%.",
    prevencao:
      "Auditar os PDS obrigatórios do DE 48 no arquivo gerado pelo gateway. Validar PDS 7 (MCC), PDS 37 (token indicator) e PDS 42 (UCAF ECI) antes de enviar o arquivo.",
    custo: "Alto",
  },
  {
    id: 3,
    titulo: "AFS incorreto no BASE II (Visa)",
    arquivo: "BASE II",
    campo: "Field 61.5 — Account Funding Source (AFS)",
    descricao:
      "O AFS no Field 61 posição 5 identifica se é crédito (C), débito (D), pré-pago (P), etc. Se esse campo chegar em branco ou com valor padrão errado, a Visa não consegue aplicar o tier correto de produto.",
    exemplo:
      "Visa Platinum (C) → taxa normal 1,64%. AFS chegou como 'D' (débito) no clearing → tier de débito = 1,20% mas com PID de crédito = inconsistência, aplicado tier punitivo.",
    prevencao:
      "O gateway deve preservar o AFS retornado na autorização. Não sobrescrever o campo no arquivo de clearing.",
    custo: "Médio",
  },
  {
    id: 4,
    titulo: "Captura fora do prazo",
    arquivo: "Ambos",
    campo: "Transaction Date vs Capture Date",
    descricao:
      "Cada Bandeira define um prazo máximo para captura após autorização (geralmente 3–7 dias para e-commerce, 1–3 dias para loja física). Captura fora do prazo faz a transação entrar em tier de 'late presentment'.",
    exemplo:
      "Autorização em D+0, captura em D+8 (e-commerce). Taxa normal: 1,64%. Taxa de late presentment: até 3% ou flat fee adicional.",
    prevencao:
      "Configurar alerta automático de captura pendente. Implementar processo de capture automático no fim do dia para transações de e-commerce.",
    custo: "Médio",
  },
  {
    id: 5,
    titulo: "Fallback Magstripe sinalizado como Chip",
    arquivo: "Ambos",
    campo: "DE 22 — POS Entry Mode",
    descricao:
      "Quando um terminal lê a tarja (fallback) mas envia DE 22=05 (chip), a inconsistência é detectada no clearing. A Bandeira aplica um tier punitivo de fallback + potencial chargeback por fraude.",
    exemplo:
      "DE 22=05 no arquivo mas CVV da tarja no DE 35 → inconsistência detectada → tier fallback = +0,5–1,0% acima do tier chip.",
    prevencao:
      "Gateway deve enviar DE 22=80 (magstripe) quando ocorrer fallback. Nunca mascarar o canal real de captura.",
    custo: "Alto",
  },
  {
    id: 6,
    titulo: "MCC incorreto ou ausente",
    arquivo: "Ambos",
    campo: "DE 18 — Merchant Category Code",
    descricao:
      "Um MCC errado pode remover o lojista de um tier subsidiado (combustível 5541, supermercado 5411) ou aplicar um tier mais caro. É um dos erros mais comuns de onboarding.",
    exemplo:
      "Posto de combustível com MCC 5999 (Miscellaneous) → taxa padrão 1,64% em vez do tier especial 0,50% do MCC 5541.",
    prevencao:
      "Auditar o MCC no credenciamento. Usar a tabela de MCCs em /compliance/mcc. Revisar o MCC ao trocar de atividade.",
    custo: "Alto",
  },
  {
    id: 7,
    titulo: "Falta do Token Indicator / DPAN Flag",
    arquivo: "Ambos",
    campo: "Visa: DE 48.33 TAF | MC: DE 48.33 TAVV",
    descricao:
      "Transações via Apple Pay / Google Pay (DPAN) têm taxa equivalente ao Chip presencial por causa do DAF (Digital Authentication Framework). Se o Token Indicator chegar ausente no clearing, o DAF não é reconhecido e a transação é tratada como e-commerce comum.",
    exemplo:
      "Apple Pay em loja (NFC) → taxa chip = 0,80%. Sem TAF no DE 48 no clearing → tratado como CNP padrão = 1,64%.",
    prevencao:
      "Gateway deve replicar o TAF da autorização no arquivo de clearing. Validar a presença do TAF no arquivo gerado.",
    custo: "Médio",
  },
];

const CUSTO_COLOR = {
  Alto:  { bg: "rgba(239,68,68,0.1)",   text: "#f87171",   border: "rgba(239,68,68,0.25)" },
  Médio: { bg: "rgba(234,179,8,0.1)",   text: "#fbbf24",   border: "rgba(234,179,8,0.25)" },
  Baixo: { bg: "rgba(16,185,129,0.1)",  text: "#4ade80",   border: "rgba(16,185,129,0.25)" },
};

const ARQUIVO_COLOR = {
  "BASE II": { bg: "rgba(59,130,246,0.1)",   text: "#60a5fa",   border: "rgba(59,130,246,0.25)" },
  "IPM":     { bg: "rgba(168,85,247,0.1)",   text: "#c084fc",   border: "rgba(168,85,247,0.25)" },
  "Ambos":   { bg: "rgba(100,116,139,0.1)",  text: "#94a3b8",   border: "rgba(100,116,139,0.25)" },
};

// ─── Página ───────────────────────────────────────────────────────────────────

export default function DowngradePage() {
  return (
    <div className="bg-background min-h-screen pb-24">

      {/* ── Header ── */}
      <div style={{ borderBottom: "1px solid var(--border)", background: "var(--code-bg)" }} className="py-6 px-6">
        <div className="mx-auto max-w-5xl">
          <Link
            href="/compliance"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ChevronLeft size={16} /> Voltar ao Hub de Compliance
          </Link>

          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-red-500/15 border border-red-500/25 flex items-center justify-center shrink-0 text-red-400">
              <TrendingDown size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-2">
                Downgrade de Intercâmbio
              </h1>
              <p className="text-muted-foreground text-sm max-w-3xl leading-relaxed">
                O <strong>downgrade</strong> é o reclassificação silenciosa da taxa de intercâmbio durante o{" "}
                <strong>clearing</strong> (BASE II ou IPM), quando campos obrigatórios estão ausentes ou incorretos.
                Ele nunca aparece na autorização — só na reconciliação financeira, semanas depois.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 pt-10 space-y-12">

        {/* ── Callout: O que é downgrade ── */}
        <section>
          <div
            style={{
              background: "rgba(239,68,68,0.05)",
              border: "1px solid rgba(239,68,68,0.2)",
              borderRadius: "1rem",
              padding: "1.5rem 1.75rem",
            }}
          >
            <div className="flex items-start gap-3 mb-4">
              <AlertTriangle size={18} className="text-red-400 shrink-0 mt-0.5" />
              <h2 className="text-base font-bold text-foreground">
                O downgrade acontece no clearing, não na autorização
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-muted-foreground">
              <div>
                <p className="font-semibold text-foreground mb-1">Autorização (D+0)</p>
                <p className="leading-relaxed text-sm">
                  A autorização aprova ou recusa com base em limite e fraude.{" "}
                  <strong>O intercâmbio não é calculado aqui.</strong>{" "}
                  A transação pode passar com RC 00 e ainda sofrer downgrade depois.
                </p>
              </div>
              <div>
                <p className="font-semibold text-foreground mb-1">Clearing (D+1/D+2)</p>
                <p className="leading-relaxed text-sm">
                  O clearing consolida os arquivos (BASE II / IPM). É aqui que a Bandeira lê cada campo e decide
                  qual tier aplicar. <strong>Campos errados ou ausentes = downgrade.</strong>
                </p>
              </div>
              <div>
                <p className="font-semibold text-foreground mb-1">Settlement (D+2/D+3)</p>
                <p className="leading-relaxed text-sm">
                  O valor de intercâmbio já com o tier rebaixado é debitado do Adquirente. O lojista nunca vê —
                  é uma perda silenciosa na margem da Adquirente.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Custo real do downgrade ── */}
        <section>
          <h2 className="text-lg font-bold text-foreground mb-4">
            Exemplo de impacto financeiro
          </h2>
          <div className="overflow-x-auto">
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "0.83rem",
                background: "var(--code-bg)",
                border: "1px solid var(--border)",
                borderRadius: "0.75rem",
                overflow: "hidden",
              }}
            >
              <thead>
                <tr style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid var(--border)" }}>
                  {["Cenário", "Produto", "Canal", "Taxa Normal", "Taxa Downgraded", "Impacto / R$ 10k"].map((h) => (
                    <th key={h} style={{ padding: "0.75rem 1rem", textAlign: "left", fontSize: "0.68rem", fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ["ECI ausente",       "Visa Platinum",    "E-com + 3DS",       "1,6400%", "2,4000%", "+R$ 76,00"],
                  ["PDS incompleto",    "MC World",         "E-com SecureCode",  "1,5000%", "2,1500%", "+R$ 65,00"],
                  ["MCC errado",        "Visa Classic",     "Combustível (5541)","0,5000%", "1,5000%", "+R$ 100,00"],
                  ["Late capture",      "MC Standard",      "Físico chip",       "0,7000%", "2,0000%", "+R$ 130,00"],
                  ["TAF ausente",       "Visa Signature",   "Apple Pay NFC",     "0,8000%", "1,6400%", "+R$ 84,00"],
                ].map(([cenario, produto, canal, normal, down, impacto], i) => (
                  <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <td style={{ padding: "0.75rem 1rem", fontWeight: 600, color: "#f87171" }}>{cenario}</td>
                    <td style={{ padding: "0.75rem 1rem", color: "#94a3b8" }}>{produto}</td>
                    <td style={{ padding: "0.75rem 1rem", color: "#94a3b8" }}>{canal}</td>
                    <td style={{ padding: "0.75rem 1rem", color: "#4ade80", fontFamily: "monospace", fontWeight: 700 }}>{normal}</td>
                    <td style={{ padding: "0.75rem 1rem", color: "#f87171", fontFamily: "monospace", fontWeight: 700 }}>{down}</td>
                    <td style={{ padding: "0.75rem 1rem", color: "#fbbf24", fontFamily: "monospace", fontWeight: 700 }}>{impacto}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground mt-2 pl-1">
            * Valores de referência para intercâmbio BR. Taxas reais dependem do produto, emissor e tabela vigente.
          </p>
        </section>

        {/* ── 7 Gatilhos ── */}
        <section>
          <h2 className="text-lg font-bold text-foreground mb-6">
            Os 7 gatilhos de downgrade
          </h2>
          <div className="space-y-4">
            {GATILHOS.map((g) => {
              const custoCfg = CUSTO_COLOR[g.custo];
              const arquivoCfg = ARQUIVO_COLOR[g.arquivo];
              return (
                <div
                  key={g.id}
                  style={{
                    background: "var(--code-bg)",
                    border: "1px solid var(--border)",
                    borderRadius: "0.875rem",
                    overflow: "hidden",
                  }}
                >
                  {/* Row header */}
                  <div
                    style={{
                      padding: "1rem 1.25rem",
                      display: "flex",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: "0.75rem",
                      borderBottom: "1px solid rgba(255,255,255,0.05)",
                    }}
                  >
                    <div
                      style={{
                        width: 28, height: 28,
                        borderRadius: "50%",
                        background: "rgba(239,68,68,0.1)",
                        border: "1px solid rgba(239,68,68,0.2)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <span style={{ fontSize: "0.68rem", fontWeight: 800, color: "#f87171" }}>{g.id}</span>
                    </div>
                    <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "#f1f5f9", flex: 1 }}>
                      {g.titulo}
                    </span>
                    <span
                      style={{
                        fontSize: "0.62rem", fontWeight: 700, padding: "0.15rem 0.5rem",
                        borderRadius: "0.25rem",
                        background: arquivoCfg.bg, color: arquivoCfg.text, border: `1px solid ${arquivoCfg.border}`,
                        letterSpacing: "0.04em",
                      }}
                    >
                      {g.arquivo}
                    </span>
                    <span
                      style={{
                        fontSize: "0.62rem", fontWeight: 700, padding: "0.15rem 0.5rem",
                        borderRadius: "0.25rem",
                        background: custoCfg.bg, color: custoCfg.text, border: `1px solid ${custoCfg.border}`,
                      }}
                    >
                      Custo {g.custo}
                    </span>
                  </div>

                  {/* Body */}
                  <div
                    style={{
                      padding: "1.25rem",
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr 1fr",
                      gap: "1.25rem",
                    }}
                    className="grid-cols-1 md:grid-cols-3"
                  >
                    <div>
                      <p style={{ fontSize: "0.65rem", fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.5rem" }}>
                        Campo afetado
                      </p>
                      <code style={{ fontSize: "0.72rem", color: "#818cf8", lineHeight: 1.6 }}>{g.campo}</code>
                      <p style={{ fontSize: "0.8rem", color: "#64748b", lineHeight: 1.7, marginTop: "0.75rem" }}>{g.descricao}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: "0.65rem", fontWeight: 700, color: "#f87171", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.5rem" }}>
                        Exemplo de impacto
                      </p>
                      <div
                        style={{
                          background: "rgba(239,68,68,0.05)",
                          border: "1px solid rgba(239,68,68,0.12)",
                          borderRadius: "0.5rem",
                          padding: "0.75rem",
                          fontSize: "0.78rem",
                          color: "#94a3b8",
                          lineHeight: 1.65,
                        }}
                      >
                        {g.exemplo}
                      </div>
                    </div>
                    <div>
                      <p style={{ fontSize: "0.65rem", fontWeight: 700, color: "#4ade80", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.5rem" }}>
                        Como prevenir
                      </p>
                      <div
                        style={{
                          background: "rgba(34,197,94,0.04)",
                          border: "1px solid rgba(34,197,94,0.12)",
                          borderRadius: "0.5rem",
                          padding: "0.75rem",
                          fontSize: "0.78rem",
                          color: "#94a3b8",
                          lineHeight: 1.65,
                        }}
                      >
                        {g.prevencao}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Checklist de auditoria ── */}
        <section>
          <h2 className="text-lg font-bold text-foreground mb-4">
            Checklist de auditoria anti-downgrade
          </h2>
          <div
            style={{
              background: "var(--code-bg)",
              border: "1px solid var(--border)",
              borderRadius: "0.875rem",
              padding: "1.5rem",
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
              {[
                { ok: true,  campo: "ECI + CAVV/AAV presentes em todas transações CNP autenticadas" },
                { ok: true,  campo: "DE 22 reflete o canal real de captura (nunca mascarar fallback)" },
                { ok: true,  campo: "MCC auditado no credenciamento e mantido atualizado" },
                { ok: true,  campo: "Captura enviada dentro do SLA (máx 3 dias CP, 7 dias CNP)" },
                { ok: true,  campo: "AFS (Field 61.5) preservado da autorização no arquivo BASE II" },
                { ok: true,  campo: "TAF/Token Indicator presente para transações DPAN (Apple/Google Pay)" },
                { ok: true,  campo: "PDS do DE 48 validados antes de enviar o IPM à Mastercard" },
                { ok: false, campo: "Reconciliação financeira comparando intercâmbio esperado vs cobrado" },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "0.625rem" }}>
                  {item.ok
                    ? <CheckCircle2 size={15} style={{ color: "#4ade80", flexShrink: 0, marginTop: 2 }} />
                    : <XCircle    size={15} style={{ color: "#f87171", flexShrink: 0, marginTop: 2 }} />
                  }
                  <span style={{ fontSize: "0.82rem", color: item.ok ? "#94a3b8" : "#f87171", lineHeight: 1.6 }}>
                    {item.campo}
                    {!item.ok && (
                      <span style={{ marginLeft: "0.4rem", fontSize: "0.65rem", fontWeight: 700, color: "#f59e0b" }}>
                        → ponto cego mais comum
                      </span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Como detectar downgrades no arquivo ── */}
        <section>
          <h2 className="text-lg font-bold text-foreground mb-4">
            Como detectar downgrades na reconciliação
          </h2>
          <div
            style={{
              background: "rgba(59,130,246,0.04)",
              border: "1px solid rgba(59,130,246,0.2)",
              borderRadius: "0.875rem",
              padding: "1.5rem",
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div>
                <p className="font-semibold text-blue-300 mb-3 flex items-center gap-2">
                  <FileText size={15} /> No BASE II (Visa)
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex gap-2"><span className="text-blue-400 font-bold">→</span> Compare o IRD (Interchange Rate Designator) do TC46 com o IRD esperado para aquele PID + canal</li>
                  <li className="flex gap-2"><span className="text-blue-400 font-bold">→</span> Procure registros TC46 com IRD "NON-QUALIFIED" ou "STANDARD"</li>
                  <li className="flex gap-2"><span className="text-blue-400 font-bold">→</span> Filtre Field 61 vazio em transações com DE 22=01 (e-commerce)</li>
                  <li className="flex gap-2"><span className="text-blue-400 font-bold">→</span> Compare taxa cobrada pelo VSS com o simulador para o mesmo conjunto de parâmetros</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold text-purple-300 mb-3 flex items-center gap-2">
                  <FileText size={15} /> No IPM (Mastercard)
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex gap-2"><span className="text-purple-400 font-bold">→</span> Verifique o IRD no TC46/TC05 — qualquer IRD diferente do esperado é suspeito</li>
                  <li className="flex gap-2"><span className="text-purple-400 font-bold">→</span> Cruze o DE 48.42 (ECI) com o canal de captura — e-com sem ECI = downgrade garantido</li>
                  <li className="flex gap-2"><span className="text-purple-400 font-bold">→</span> Compare a fee cobrada no MTI 1740 com a tabela MCBS para o Service ID correspondente</li>
                  <li className="flex gap-2"><span className="text-purple-400 font-bold">→</span> Audite o DE 63 Tag 2 (Product Code) — inconsistência com o BIN = tier incorreto</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ── CTAs ── */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/matrix"
            style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              background: "rgba(59,130,246,0.07)", border: "1px solid rgba(59,130,246,0.2)",
              borderRadius: "0.875rem", padding: "1.25rem 1.5rem", textDecoration: "none",
            }}
            className="hover:opacity-80 transition-opacity"
          >
            <div>
              <div style={{ fontSize: "0.68rem", fontWeight: 700, color: "#60a5fa", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.25rem" }}>Guia Completo</div>
              <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "#f1f5f9" }}>Matriz de Intercâmbio</div>
              <div style={{ fontSize: "0.75rem", color: "#64748b" }}>5 passos da cascata de decisão</div>
            </div>
            <ArrowRight size={16} style={{ color: "#60a5fa", flexShrink: 0 }} />
          </Link>

          <Link
            href="/simulador"
            style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              background: "rgba(16,185,129,0.07)", border: "1px solid rgba(16,185,129,0.2)",
              borderRadius: "0.875rem", padding: "1.25rem 1.5rem", textDecoration: "none",
            }}
            className="hover:opacity-80 transition-opacity"
          >
            <div>
              <div style={{ fontSize: "0.68rem", fontWeight: 700, color: "#34d399", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.25rem" }}>Ferramenta</div>
              <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "#f1f5f9" }}>Simulador</div>
              <div style={{ fontSize: "0.75rem", color: "#64748b" }}>"Por que esta taxa?" — debug panel</div>
            </div>
            <ArrowRight size={16} style={{ color: "#34d399", flexShrink: 0 }} />
          </Link>

          <Link
            href="/compliance/campos"
            style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              background: "rgba(139,92,246,0.07)", border: "1px solid rgba(139,92,246,0.2)",
              borderRadius: "0.875rem", padding: "1.25rem 1.5rem", textDecoration: "none",
            }}
            className="hover:opacity-80 transition-opacity"
          >
            <div>
              <div style={{ fontSize: "0.68rem", fontWeight: 700, color: "#a78bfa", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.25rem" }}>Referência</div>
              <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "#f1f5f9" }}>Campos DE/PDS</div>
              <div style={{ fontSize: "0.75rem", color: "#64748b" }}>Lookup completo ISO 8583</div>
            </div>
            <ArrowRight size={16} style={{ color: "#a78bfa", flexShrink: 0 }} />
          </Link>
        </section>

      </div>
    </div>
  );
}
