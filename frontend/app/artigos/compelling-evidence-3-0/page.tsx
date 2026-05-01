import type { Metadata } from "next";
import { ArticleLayout } from "@/components/ArticleLayout";

export const metadata: Metadata = {
  title: "Compelling Evidence 3.0: Como a Visa Combate Fraude Amigável | VS Payments",
  description:
    "Guia técnico completo do Compelling Evidence 3.0 da Visa: critérios de elegibilidade, campos BASE II (DE 60 / PDS), reason codes 10.4 e 13.1, comparativo com CE 2.0 e fluxo prático de submissão.",
};

/* ─── Inline style helpers ───────────────────────────────────────────────── */

const S = {
  section: { marginBottom: "2.5rem" } as React.CSSProperties,
  h2: {
    fontSize: "1.15rem",
    fontWeight: 700,
    color: "#f1f5f9",
    marginBottom: "0.75rem",
    paddingBottom: "0.4rem",
    borderBottom: "1px solid rgba(255,255,255,0.07)",
  } as React.CSSProperties,
  h3: {
    fontSize: "0.95rem",
    fontWeight: 700,
    color: "#e2e8f0",
    marginBottom: "0.5rem",
    marginTop: "1.25rem",
  } as React.CSSProperties,
  p: {
    fontSize: "0.9rem",
    color: "#94a3b8",
    lineHeight: 1.8,
    marginBottom: "0.9rem",
  } as React.CSSProperties,
  li: {
    fontSize: "0.875rem",
    color: "#94a3b8",
    lineHeight: 1.75,
    marginBottom: "0.4rem",
    paddingLeft: "1rem",
    position: "relative" as const,
  },
  code: {
    fontFamily: "monospace",
    fontSize: "0.8rem",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "0.3rem",
    padding: "0.1rem 0.4rem",
    color: "#93c5fd",
  } as React.CSSProperties,
  callout: (color: string) => ({
    background: `${color}08`,
    border: `1px solid ${color}25`,
    borderRadius: "0.75rem",
    padding: "1.1rem 1.25rem",
    marginBottom: "1rem",
  }),
  tableWrap: {
    overflowX: "auto" as const,
    marginBottom: "1.25rem",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse" as const,
    fontSize: "0.8rem",
    background: "rgba(15,23,42,0.6)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "0.75rem",
    overflow: "hidden" as const,
  },
  th: {
    padding: "0.6rem 0.9rem",
    textAlign: "left" as const,
    fontSize: "0.67rem",
    fontWeight: 700,
    color: "#475569",
    textTransform: "uppercase" as const,
    letterSpacing: "0.06em",
    background: "rgba(255,255,255,0.03)",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
  },
  td: (highlight?: boolean) => ({
    padding: "0.6rem 0.9rem",
    color: highlight ? "#f1f5f9" : "#94a3b8",
    fontWeight: highlight ? 600 : 400,
    borderBottom: "1px solid rgba(255,255,255,0.04)",
    verticalAlign: "top" as const,
  }),
};

/* ─── Data ────────────────────────────────────────────────────────────────── */

const CRITERIA = [
  {
    n: "1",
    label: "Transação não disputada recente",
    desc: "Ao menos uma transação anterior, nos últimos 120 dias contados a partir da data da transação disputada, que: (a) não foi contestada pelo portador, (b) teve o mesmo número de cartão, (c) ocorreu no mesmo estabelecimento (mesmo Merchant ID) e (d) entregou o mesmo produto/serviço.",
    campo: "PDS Tag 75 — Prior Undisputed Transaction",
    cor: "#3b82f6",
  },
  {
    n: "2",
    label: "Correspondência de IP ou Device ID",
    desc: "A transação não disputada e a transação contestada devem compartilhar ao menos um identificador de dispositivo ou endereço IP. Esse dado é transmitido no PDS (DE 60) via campos de dados adicionais do lojista.",
    campo: "PDS Tag 72 — Device Fingerprint / IP Address",
    cor: "#8b5cf6",
  },
];

const REASON_CODES = [
  {
    code: "10.4",
    name: "Other Fraud — Card Absent",
    desc: "Portador alega que nunca autorizou a transação (CNP fraud). CE 3.0 é elegível quando o lojista consegue provar que o portador realizou transações idênticas anteriores sem disputa.",
    limite: "120 dias",
    cor: "#ef4444",
  },
  {
    code: "13.1",
    name: "Merchandise / Services Not Received",
    desc: "Portador alega não ter recebido o bem ou serviço. CE 3.0 é elegível quando o lojista comprova entrega no mesmo endereço/device em transações anteriores do mesmo portador.",
    limite: "120 dias",
    cor: "#f59e0b",
  },
];

const COMPARATIVO = [
  { aspecto: "Versão",               ce20: "CE 2.0 (até Out/2023)",    ce30: "CE 3.0 (Nov/2023 em diante)" },
  { aspecto: "Transações requeridas", ce20: "2 anteriores não disputadas", ce30: "1 anterior não disputada" },
  { aspecto: "Janela temporal",      ce20: "365 dias",                  ce30: "120 dias" },
  { aspecto: "Evidência de device",  ce20: "Não obrigatória",           ce30: "Obrigatória (IP ou Device ID)" },
  { aspecto: "Reason codes",         ce20: "10.4 apenas",               ce30: "10.4 e 13.1" },
  { aspecto: "Prazo de resposta",    ce20: "30 dias corridos",          ce30: "30 dias corridos (sem alteração)" },
  { aspecto: "Campos BASE II",       ce20: "PDS Tag 73/74",             ce30: "PDS Tag 72/75 (novos tags)" },
];

const CAMPOS_BASE_II = [
  { campo: "DE 60",    nome: "Additional POS Information",   uso: "Contém o PDS completo em sub-tags" },
  { campo: "Tag 72",   nome: "Device ID / IP Address",       uso: "Fingerprint do dispositivo OU IP da sessão autenticada" },
  { campo: "Tag 75",   nome: "Prior Undisputed Transaction",  uso: "Data, ARN ou RRN da transação não disputada de referência" },
  { campo: "Tag 76",   nome: "Merchandise / Service Type",    uso: "Tipo de produto entregue — necessário para RC 13.1" },
  { campo: "DE 22.1",  nome: "POS Entry Mode",                uso: "CNP (01/81/91) obrigatório — CE 3.0 é exclusivo para e-commerce" },
  { campo: "DE 61.5",  nome: "AFS (Auth Financial Sequence)", uso: "Identificação do produto Visa para validação do intercâmbio pós-CE" },
];

const ERROS_COMUNS = [
  { erro: "Tag 75 ausente ou malformada",     impacto: "Disputa é negada automaticamente — CE 3.0 não pode ser reconhecida pela Visa sem o ARN/RRN da prior transaction" },
  { erro: "Janela > 120 dias",               impacto: "Transação anterior fora da janela não conta — lojistas que usavam CE 2.0 (365 dias) precisam ajustar o lookback" },
  { erro: "Device ID diferente, IP ausente", impacto: "Critério 2 não atendido. Sem nenhum identificador de dispositivo compartilhado, a evidência é inválida" },
  { erro: "RC fora de escopo",               impacto: "CE 3.0 não se aplica a 10.5 (Visa Fraud Monitoring) nem a 12.x ou 13.2+" },
  { erro: "Prior transaction no mesmo ARN",  impacto: "A transação de referência não pode ser a própria transação disputada nem uma que já foi contestada" },
];

/* ─── Page ────────────────────────────────────────────────────────────────── */

export default function CE30Page() {
  return (
    <ArticleLayout
      title="Compelling Evidence 3.0: Como a Visa Combate Fraude Amigável"
      tag="Técnico"
      tagColor="rgba(59,130,246,0.12)"
      tagText="#60a5fa"
      date="28 de abril de 2026"
      readTime="10 min"
    >

      {/* 1 — Contexto */}
      <section style={S.section}>
        <h2 style={S.h2}>O que é Compelling Evidence 3.0?</h2>
        <p style={S.p}>
          Lançado em novembro de 2023 (Visa Rules Update Oct/2023), o{" "}
          <strong style={{ color: "#f1f5f9" }}>Compelling Evidence 3.0 (CE 3.0)</strong> é o
          framework da Visa que permite ao lojista reverter chargebacks de <em>friendly fraud</em>{" "}
          — situações em que o portador nega ter feito a compra, mas na verdade a reconhece.
        </p>
        <p style={S.p}>
          A lógica central é simples: se o portador já realizou transações idênticas no mesmo
          estabelecimento, com o mesmo dispositivo, e nunca as contestou — ele muito provavelmente
          conhece o lojista e está usando o chargeback de má-fé. CE 3.0 torna essa prova mais
          acessível, reduzindo de 2 para 1 o número de transações de referência necessárias.
        </p>
        <div style={S.callout("#3b82f6")}>
          <p style={{ ...S.p, marginBottom: 0, color: "#93c5fd" }}>
            <strong>Friendly fraud</strong> é hoje responsável por estimados 35–40% de todos os
            chargebacks em e-commerce B2C. CE 3.0 é a resposta mais direta da Visa para reduzir
            esse custo operacional sobre os adquirentes e sub-adquirentes.
          </p>
        </div>
      </section>

      {/* 2 — Critérios */}
      <section style={S.section}>
        <h2 style={S.h2}>Os 2 critérios de elegibilidade</h2>
        <p style={S.p}>
          Para invocar CE 3.0, o lojista deve atender <strong style={{ color: "#f1f5f9" }}>ambos</strong> os critérios
          abaixo. O não-atendimento de qualquer um invalida a defesa.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {CRITERIA.map((c) => (
            <div
              key={c.n}
              style={{
                display: "flex",
                gap: "1rem",
                background: "rgba(15,23,42,0.7)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: "0.75rem",
                padding: "1rem 1.25rem",
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: `${c.cor}20`,
                  border: `1px solid ${c.cor}40`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <span style={{ fontSize: "0.75rem", fontWeight: 800, color: c.cor }}>{c.n}</span>
              </div>
              <div>
                <p style={{ fontSize: "0.88rem", fontWeight: 700, color: "#f1f5f9", marginBottom: "0.3rem" }}>
                  {c.label}
                </p>
                <p style={{ ...S.p, marginBottom: "0.5rem" }}>{c.desc}</p>
                <span style={S.code}>{c.campo}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3 — Reason Codes */}
      <section style={S.section}>
        <h2 style={S.h2}>Reason codes elegíveis</h2>
        <p style={S.p}>
          CE 3.0 é válido <strong style={{ color: "#f1f5f9" }}>apenas</strong> para os dois reason
          codes abaixo. Qualquer outro código não se beneficia deste framework — use a defesa
          padrão de representment.
        </p>
        <div style={{ display: "grid", gap: "0.75rem", gridTemplateColumns: "1fr 1fr" }}>
          {REASON_CODES.map((r) => (
            <div
              key={r.code}
              style={{
                background: `${r.cor}08`,
                border: `1px solid ${r.cor}25`,
                borderRadius: "0.75rem",
                padding: "1rem 1.25rem",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                <span
                  style={{
                    fontFamily: "monospace",
                    fontSize: "0.78rem",
                    fontWeight: 800,
                    color: r.cor,
                    background: `${r.cor}15`,
                    border: `1px solid ${r.cor}30`,
                    borderRadius: "0.375rem",
                    padding: "0.15rem 0.5rem",
                  }}
                >
                  RC {r.code}
                </span>
                <span style={{ fontSize: "0.75rem", color: "#64748b" }}>Janela: {r.limite}</span>
              </div>
              <p style={{ fontSize: "0.8rem", fontWeight: 700, color: "#f1f5f9", marginBottom: "0.35rem" }}>
                {r.name}
              </p>
              <p style={{ ...S.p, marginBottom: 0, fontSize: "0.8rem" }}>{r.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 4 — Campos BASE II */}
      <section style={S.section}>
        <h2 style={S.h2}>Campos BASE II relevantes</h2>
        <p style={S.p}>
          CE 3.0 exige que o adquirente transmita campos específicos no arquivo de clearing
          BASE II (Visa Settlement Service — VSS). A ausência de qualquer campo marcado como
          obrigatório resulta em rejeição automática da defesa durante o processamento.
        </p>
        <div style={S.tableWrap}>
          <table style={S.table}>
            <thead>
              <tr>
                {["Campo", "Nome", "Uso em CE 3.0"].map((h) => (
                  <th key={h} style={S.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CAMPOS_BASE_II.map((row, i) => (
                <tr key={i}>
                  <td style={S.td(true)}>
                    <span style={S.code}>{row.campo}</span>
                  </td>
                  <td style={S.td(true)}>{row.nome}</td>
                  <td style={S.td()}>{row.uso}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={S.callout("#f59e0b")}>
          <p style={{ ...S.p, marginBottom: 0, color: "#fcd34d", fontSize: "0.82rem" }}>
            <strong>Atenção:</strong> O PDS (Private Data Subelement) fica em{" "}
            <span style={S.code}>DE 60</span> no formato TLV. Cada Tag é um sub-campo de 2 bytes
            para o tipo e comprimento variável. Sub-adquirentes precisam garantir que o gateway
            repasse essas tags ao adquirente, que por sua vez as inclui no BASE II.
          </p>
        </div>
      </section>

      {/* 5 — CE 2.0 vs CE 3.0 */}
      <section style={S.section}>
        <h2 style={S.h2}>CE 2.0 × CE 3.0: o que mudou?</h2>
        <div style={S.tableWrap}>
          <table style={S.table}>
            <thead>
              <tr>
                {["Aspecto", "CE 2.0", "CE 3.0"].map((h) => (
                  <th key={h} style={S.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARATIVO.map((row, i) => (
                <tr key={i}>
                  <td style={{ ...S.td(true), fontSize: "0.78rem" }}>{row.aspecto}</td>
                  <td style={{ ...S.td(), color: "#64748b", fontSize: "0.78rem" }}>{row.ce20}</td>
                  <td style={{ ...S.td(), color: "#4ade80", fontSize: "0.78rem" }}>{row.ce30}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 6 — Fluxo de submissão */}
      <section style={S.section}>
        <h2 style={S.h2}>Fluxo prático de submissão</h2>
        <p style={S.p}>
          Quando um chargeback RC 10.4 ou 13.1 chega ao adquirente, o processo de resposta
          via CE 3.0 segue as etapas abaixo. O prazo total é de <strong style={{ color: "#f1f5f9" }}>30 dias corridos</strong>{" "}
          a partir da data de notificação do chargeback.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
          {[
            {
              n: "1",
              title: "Recebimento e triagem do chargeback",
              desc: "Verificar o RC. Apenas 10.4 e 13.1 elegíveis. Se for outro código, seguir fluxo padrão de representment.",
              cor: "#6366f1",
            },
            {
              n: "2",
              title: "Busca da prior undisputed transaction",
              desc: "No banco de transações do lojista: buscar transações com mesmo PAN, mesmo MID, dentro dos últimos 120 dias, que não foram contestadas. Registrar ARN ou RRN.",
              cor: "#3b82f6",
            },
            {
              n: "3",
              title: "Verificação do critério de device/IP",
              desc: "Cruzar o Device ID ou IP da transação disputada com o(s) da(s) prior transaction(s). Se não houver correspondência, CE 3.0 não é viável — avaliar representment comum.",
              cor: "#0ea5e9",
            },
            {
              n: "4",
              title: "Preenchimento dos campos PDS (DE 60)",
              desc: "Montar o pacote de dados com Tag 72 (Device/IP), Tag 75 (prior transaction) e Tag 76 (tipo de mercadoria, se RC 13.1). Submeter via plataforma de disputas do adquirente.",
              cor: "#10b981",
            },
            {
              n: "5",
              title: "Transmissão no BASE II",
              desc: "O adquirente gera o arquivo de representment com o DE 60/PDS completo e o envia no ciclo de clearing da Visa (VSS). A Visa processa e notifica o emissor.",
              cor: "#22c55e",
            },
          ].map((s) => (
            <div
              key={s.n}
              style={{
                display: "flex",
                gap: "1rem",
                alignItems: "flex-start",
                background: "rgba(15,23,42,0.7)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: "0.75rem",
                padding: "0.875rem 1.1rem",
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: `${s.cor}18`,
                  border: `1px solid ${s.cor}35`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <span style={{ fontSize: "0.68rem", fontWeight: 800, color: s.cor }}>{s.n}</span>
              </div>
              <div>
                <p style={{ fontSize: "0.85rem", fontWeight: 700, color: "#f1f5f9", marginBottom: "0.2rem" }}>
                  {s.title}
                </p>
                <p style={{ ...S.p, marginBottom: 0, fontSize: "0.8rem" }}>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7 — Erros comuns */}
      <section style={S.section}>
        <h2 style={S.h2}>Erros comuns e seus impactos</h2>
        <div style={S.tableWrap}>
          <table style={S.table}>
            <thead>
              <tr>
                {["Erro", "Impacto"].map((h) => (
                  <th key={h} style={S.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ERROS_COMUNS.map((row, i) => (
                <tr key={i}>
                  <td style={{ ...S.td(true), color: "#fca5a5", fontSize: "0.78rem", whiteSpace: "nowrap" as const }}>
                    {row.erro}
                  </td>
                  <td style={{ ...S.td(), fontSize: "0.78rem" }}>{row.impacto}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 8 — Quando NÃO usar */}
      <section style={S.section}>
        <h2 style={S.h2}>Quando CE 3.0 não se aplica</h2>
        <p style={S.p}>
          CE 3.0 é poderoso, mas tem escopo bem definido. Os cenários abaixo exigem abordagem diferente:
        </p>
        <ul style={{ paddingLeft: 0, listStyle: "none", margin: 0 }}>
          {[
            "Transações presenciais (POS físico) — CE 3.0 é exclusivo para CNP/e-commerce.",
            "RC 10.5 (Visa Fraud Monitoring Program) — chargeback originado por programa de monitoramento, não contesta.",
            "RC 11.x, 12.x — erros de processamento e autorização. Use representment com comprovante de autorização.",
            "Portador foi vítima de fraude real (account takeover, card-not-present genuíno) — CE 3.0 não deve ser invocado.",
            "Lojista sem sistema de Device Fingerprinting — sem o dado de device/IP não é possível atender o Critério 2.",
          ].map((item, i) => (
            <li
              key={i}
              style={{
                ...S.li,
                display: "flex",
                gap: "0.6rem",
                marginBottom: "0.5rem",
                paddingLeft: 0,
              }}
            >
              <span style={{ color: "#ef4444", flexShrink: 0, fontSize: "0.75rem", marginTop: "0.25rem" }}>✕</span>
              <span style={{ fontSize: "0.85rem", color: "#94a3b8", lineHeight: 1.7 }}>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* 9 — Resumo operacional */}
      <section style={S.section}>
        <div
          style={{
            background: "rgba(37,99,235,0.06)",
            border: "1px solid rgba(37,99,235,0.2)",
            borderRadius: "0.875rem",
            padding: "1.4rem 1.6rem",
          }}
        >
          <h3 style={{ ...S.h3, marginTop: 0, color: "#93c5fd" }}>Checklist operacional para adquirentes</h3>
          <ul style={{ paddingLeft: 0, listStyle: "none", margin: 0 }}>
            {[
              "Garantir que o gateway transmite Device ID e IP de sessão nos campos PDS (DE 60 Tag 72)",
              "Armazenar ARN/RRN de todas as transações CNP para consulta no lookback de 120 dias",
              "Configurar triage automatizada de chargebacks para identificar RC 10.4 e 13.1 elegíveis",
              "Validar que o Merchant ID está padronizado entre transações (evitar IDs divergentes por filial)",
              "Submeter o arquivo BASE II com DE 60 completo dentro das 30 janelas após notificação",
              "Monitorar taxa de reversão por CE 3.0 — benchmarks acima de 60% indicam boa coleta de dados",
            ].map((item, i) => (
              <li
                key={i}
                style={{
                  display: "flex",
                  gap: "0.6rem",
                  marginBottom: "0.45rem",
                }}
              >
                <span style={{ color: "#4ade80", flexShrink: 0, fontSize: "0.75rem", marginTop: "0.25rem" }}>✓</span>
                <span style={{ fontSize: "0.85rem", color: "#94a3b8", lineHeight: 1.7 }}>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

    </ArticleLayout>
  );
}
