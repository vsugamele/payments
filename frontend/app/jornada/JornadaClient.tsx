"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CreditCard, Wifi, Building2, Activity, Landmark, ArrowRight,
  CheckCircle2, XCircle, AlertTriangle, ChevronDown, ChevronUp,
  Banknote, RotateCcw, Scale, Shield, Zap, Clock, BookOpen,
} from "lucide-react";
import TermTooltip from "@/components/TermTooltip";

// ─── Dados das fases ──────────────────────────────────────────────────────────

const FASES = [
  {
    id: "apresentacao",
    numero: "01",
    title: "Apresentação",
    subtitulo: "Portador → Terminal",
    icon: CreditCard,
    cor: "#3b82f6",
    corBg: "rgba(59,130,246,0.08)",
    corBorder: "rgba(59,130,246,0.2)",
    tempo: "< 100ms",
    ator: "Portador & Terminal",
    descricao: (
      <>
        O portador presenta o cartão ao terminal físico (POS) ou informa os dados online. Neste momento, o Canal determina o nível de segurança e o custo de <TermTooltip term="Intercâmbio" definition="Taxa base paga pelo Adquirente ao Banco Emissor para custear os benefícios e riscos do cartão." /> da transação.
      </>
    ),
    canais: [
      { nome: "Chip + PIN", risco: "Mínimo", intercambio: "Menor" },
      { nome: "Contactless (NFC)", risco: "Baixo", intercambio: "Equivalente ao Chip" },
      { nome: "Fallback Magstripe", risco: "Médio", intercambio: "Maior" },
      { nome: "E-com s/ 3DS", risco: "Alto", intercambio: "Maior + Liability do Lojista" },
      { nome: "E-com c/ 3DS (ECI 05)", risco: "Baixo", intercambio: "Maior, mas Liability do Emissor" },
      { nome: "Apple Pay / Token", risco: "Mínimo", intercambio: "Equivalente ao Chip + DAF Shift" },
    ],
    campos: ["DE 22: POS Entry Mode", "PAN / Token (DPAN ou FPAN)", "CVV / iCVV / CAVV"],
    alertas: ["Fallback Magstripe contorna segurança do chip. É sinalizado pelas Bandeiras.", "Apple Pay com autenticação biométrica ativa DAF e elimina necessidade de 3DS separado."],
    playbooks: [{ label: "DAF & Tokenização", href: "/compliance/tokenizacao" }],
  },
  {
    id: "gateway",
    numero: "02",
    title: "Gateway",
    subtitulo: "Captura & ISO 8583",
    icon: Zap,
    cor: "#8b5cf6",
    corBg: "rgba(139,92,246,0.08)",
    corBorder: "rgba(139,92,246,0.2)",
    tempo: "< 200ms",
    ator: "Gateway / Sub-Adquirente",
    descricao: (
      <>
        O Gateway ou Sub-Adquirente recebe os dados brutos e os formata segundo o protocolo <TermTooltip term="ISO 8583" definition="Padrão global para sistemas que trocam transações eletrônicas." />, montando uma mensagem de Autorização (MTI 0100) com todos os campos obrigatórios para o roteamento correto.
      </>
    ),
    campos: [
      "MTI: 0100 (Authorization Request)",
      "DE 18: MCC (Merchant Category Code)",
      "DE 22: POS Entry Mode",
      "DE 41: Terminal ID",
      "DE 42: Merchant ID",
      "DE 48: Additional Data / PDS",
      "DE 61: POS Data Code",
    ],
    alertas: [
      "Preencher DE 18 (MCC) errado é uma das formas mais comuns de pagar intercâmbio mais alto do que o necessário.",
      "Campos DE 48/PDS incompletos causam downgrade de intercâmbio no Clearing.",
    ],
    playbooks: [{ label: "Lookup de Campos DE/PDS", href: "/compliance/campos" }],
  },
  {
    id: "adquirente",
    numero: "03",
    title: "Adquirente",
    subtitulo: "Roteamento & Rede",
    icon: Building2,
    cor: "#f59e0b",
    corBg: "rgba(245,158,11,0.08)",
    corBorder: "rgba(245,158,11,0.2)",
    tempo: "< 300ms",
    ator: "Adquirente",
    descricao: (
      <>
        O Adquirente é a instituição financeira que credenciou o lojista. Ele recebe a mensagem do Gateway, identifica a Bandeira pelo BIN/IIN do cartão e roteia via rede proprietária (VisaNet, Banknet). Também agrega as taxas <TermTooltip term="NABU" definition="Network Access and Brand Usage: tarifa base por transação cobrada pela marca independente de aprovação." /> / Scheme Fee sobre cada transação.
      </>
    ),
    campos: [
      "BIN/IIN lookup → identifica Emissor + Produto (PID)",
      "Roteamento: VisaNet para Visa | Banknet para Mastercard",
      "NABU / Scheme Fee aplicado por transação",
    ],
    alertas: [
      "O Adquirente é financeiramente responsável pelo portfólio. Lojistas com chargeback alto arrastam o Adquirente para ECP e VAMP.",
      "Transações internacionais geram Cross-Border Fee adicional da Bandeira (0.4 a 1%).",
    ],
    playbooks: [
      { label: "Programas de Monitoramento (VAMP/ECP)", href: "/compliance/programas" },
      { label: "Calculadora de Risco", href: "/compliance/risco" },
    ],
  },
  {
    id: "bandeira",
    numero: "04",
    title: "Bandeira",
    subtitulo: "Switch & STIP",
    icon: Activity,
    cor: "#10b981",
    corBg: "rgba(16,185,129,0.08)",
    corBorder: "rgba(16,185,129,0.2)",
    tempo: "< 500ms",
    ator: "Visa / Mastercard / Elo",
    descricao: (
      <>
        A Bandeira atua como câmara de switching. Verifica regras globais de aceitação (MCC bloqueado? Valor acima do Floor Limit?), encaminha ao Emissor correto e — se o Emissor estiver inacessível — ativa o <TermTooltip term="STIP" definition="Stand-In Processing: processamento de substituição, a marca responde em nome do emissor que está indisponível." />, aprovando ou recusando com parâmetros pré-definidos pelo banco.
      </>
    ),
    campos: [
      "Validação de regras de aceitação global",
      "Identificação do Emissor pelo BIN/IIN",
      "STIP: aprovação automática se Emissor offline",
      "Injeção de dados de roteamento na mensagem",
    ],
    alertas: [
      "STIP pode aprovar transações que o Emissor recusaria → risco de fraude aumenta.",
      "Certos MCCs são bloqueados por algunas Bandeiras em determinadas regiões (ex: gambling em países específicos).",
    ],
    playbooks: [{ label: "Lookup de Campos", href: "/compliance/campos" }],
  },
  {
    id: "emissor",
    numero: "05",
    title: "Emissor",
    subtitulo: "Decisão & Score",
    icon: Landmark,
    cor: "#ec4899",
    corBg: "rgba(236,72,153,0.08)",
    corBorder: "rgba(236,72,153,0.2)",
    tempo: "< 1.000ms",
    ator: "Banco Emissor",
    descricao: (
      <>
        O Banco Emissor é o coração da decisão. Verifica saldo/limite, executa modelos de fraude (ML + Velocity Checks) e, se 3DS estiver ativo, aciona o ACS (Access Control Server) para autenticar o portador. A resposta final é um <TermTooltip term="Response Code" definition="Código padronizado (DE 39) numérico que sinaliza se a transação foi aprovada (00), ou por que foi recusada." /> (DE 39) que percorre o caminho inverso.
      </>
    ),
    respostaCodes: [
      { code: "00", desc: "Approved", tipo: "sucesso" },
      { code: "01", desc: "Refer to Issuer", tipo: "aviso" },
      { code: "04", desc: "Pick-up (Hard Decline)", tipo: "erro" },
      { code: "05", desc: "Do Not Honor (Hard Decline)", tipo: "erro" },
      { code: "51", desc: "Insufficient Funds (Soft Decline)", tipo: "aviso" },
      { code: "57", desc: "Transaction Not Permitted", tipo: "erro" },
      { code: "96", desc: "System Error (Retry OK)", tipo: "aviso" },
    ],
    campos: [
      "Verificação de saldo/limite disponível",
      "Score de fraude (ML, Device Fingerprint, IP Geolocation)",
      "Consulta ao ACS p/ 3DS se configurado",
      "DE 39: Response Code (00 = Aprovado)",
      "DE 38: Authorization Code (se aprovado)",
    ],
    alertas: [
      "Hard Declines (RC 04, 05, 57) NUNCA devem ser retentados com os mesmos dados. Geram multas.",
      "Soft Declines (RC 51, 96) podem ser retentados após intervalo mínimo definido pelas Bandeiras.",
    ],
    playbooks: [{ label: "Lookup de Campos / Response Codes", href: "/compliance/campos" }],
  },
  {
    id: "clearing",
    numero: "06",
    title: "Clearing",
    subtitulo: "Compensação Noturna",
    icon: RotateCcw,
    cor: "#06b6d4",
    corBg: "rgba(6,182,212,0.08)",
    corBorder: "rgba(6,182,212,0.2)",
    tempo: "Processamento noturno",
    ator: "Bandeira (Câmara de Compensação)",
    descricao: (
      <>
        Após a Autorização, as transações capturadas passam pelo <TermTooltip term="Clearing" definition="Câmara de compensação onde arquivos diários são consolidados para reconciliação." /> — um processo noturno em lote onde a Bandeira reconcilia financeiramente todas as operações do dia. Na Mastercard, o arquivo é o IPM (TC46/TC05). Na Visa, o TC46. É aqui que os valores de Intercâmbio são calculados.
      </>
    ),
    campos: [
      "IPM / TC46: arquivo de clearing consolidado",
      "Cálculo do Intercâmbio (por produto PID + Canal + MCC)",
      "Validação de PDS preenchidos corretamente",
      "Detecção de transações fora do prazo de captura",
    ],
    alertas: [
      "PDS incompletos no IPM causam downgrade → Adquirente paga intercâmbio mais alto sem motivo.",
      "Transações não capturadas dentro do prazo (geralmente 3-7 dias) perdem a autorização.",
    ],
    playbooks: [{ label: "Lookup DE/PDS", href: "/compliance/campos" }, { label: "Simulador de Intercâmbio", href: "/simulador" }],
  },
  {
    id: "settlement",
    numero: "07",
    title: "Liquidação",
    subtitulo: "O Dinheiro Muda de Mão",
    icon: Banknote,
    cor: "#22c55e",
    corBg: "rgba(34,197,94,0.08)",
    corBorder: "rgba(34,197,94,0.2)",
    tempo: "D+1 Débito / D+2 Crédito",
    ator: "Bandeira + Bancos Liquidantes",
    descricao: (
      <>
        A <TermTooltip term="Liquidação (Settlement)" definition="Transferência financeira efetiva entre as partes e conciliação final dos saldos." /> é a transferência financeira efetiva. A Bandeira atua como câmara multilateral. O Adquirente paga o Intercâmbio ao Emissor e a Scheme Fee à Bandeira. O que sobra (after-interchange) menos o spread do Adquirente é o líquido que o lojista recebe.
      </>
    ),
    equacao: [
      { label: "Valor da Venda", valor: "R$ 100,00", cor: "#22c55e" },
      { label: "(-) Intercâmbio (Emissor)", valor: "R$ 1,50", cor: "#ef4444" },
      { label: "(-) Scheme Fee (Bandeira)", valor: "R$ 0,20", cor: "#f59e0b" },
      { label: "(-) Spread Adquirente", valor: "R$ 0,30", cor: "#f59e0b" },
      { label: "(=) Líquido ao Lojista (MDR net)", valor: "R$ 98,00", cor: "#22c55e" },
    ],
    alertas: [
      "Chargebacks pós-liquidação forçam o Adquirente a devolver fundos já pagos. Cria risco de crédito.",
      "Crédito parcelado adia a liquidação → D+2 por parcela → lojista precisa de capital de giro.",
    ],
    playbooks: [{ label: "Simulador de Intercâmbio", href: "/simulador" }, { label: "Programas de Monitoramento", href: "/compliance/programas" }],
  },
  {
    id: "disputa",
    numero: "08",
    title: "Disputa",
    subtitulo: "Chargeback (se fraude/contestação)",
    icon: Scale,
    cor: "#ef4444",
    corBg: "rgba(239,68,68,0.08)",
    corBorder: "rgba(239,68,68,0.2)",
    tempo: "30-120 dias",
    ator: "Portador → Emissor → Adquirente → Lojista",
    descricao: (
      <>
        Se o portador não reconhece a transação ou há problema com a mercadoria, inicia-se o ciclo de Disputa. O Emissor reporta a fraude via <TermTooltip term="TC40" definition="Reporte de Fraude (Transaction Code 40) gerado pelo Emissor à Bandeira." /> (alimentando <TermTooltip term="VAMP/EFM" definition="Programas de multas e monitoramento de chargeback das Bandeiras." />) e pode abrir um Chargeback formal. O Adquirente tem prazo para Representment com evidências. Se não resolvido, vai para Arbitration.
      </>
    ),
    fluxo: [
      { step: "TC40 Report", desc: "Emissor declara fraude. Alimenta VAMP/EFM do Adquirente.", cor: "#f59e0b" },
      { step: "First Chargeback", desc: "Emissor puxa o valor de volta da conta do Adquirente.", cor: "#ef4444" },
      { step: "Representment", desc: "Adquirente/Lojista envia evidências defensoras via DMAS/VROL.", cor: "#3b82f6" },
      { step: "Pre-Arbitration", desc: "Emissor rejeita as evidências. Último estágio antes da Bandeira.", cor: "#f59e0b" },
      { step: "Arbitration", desc: "Bandeira decide. USD 150 (filing) + USD 250 (fee do perdedor).", cor: "#ef4444" },
    ],
    alertas: [
      "TC40 impacta o índice VAMP antes de qualquer chargeback formal. Merchants com muitos TC40 podem ser monitorados antes de agirem.",
      "Nunca leve para Arbitration se o valor for abaixo de USD 500 sem evidência irrefutável.",
    ],
    playbooks: [
      { label: "Gestão de Disputas", href: "/compliance/disputas" },
      { label: "Programas VAMP / ECP", href: "/compliance/programas" },
      { label: "Calculadora de Risco", href: "/compliance/risco" },
    ],
  },
];

// ─── Componente ───────────────────────────────────────────────────────────────

export default function JornadaClient() {
  const [faseAtiva, setFaseAtiva] = useState<string>("apresentacao");

  const fase = FASES.find((f) => f.id === faseAtiva)!;
  const Icon = fase.icon;

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 1.5rem 6rem" }}>

      {/* ── Linha do Tempo ── */}
      <div style={{ marginBottom: "2.5rem" }}>
        {/* Desktop: horizontal scroll */}
        <div style={{
          display: "flex",
          gap: "0",
          overflowX: "auto",
          paddingBottom: "0.5rem",
          scrollbarWidth: "thin",
        }}>
          {FASES.map((f, i) => {
            const FIcon = f.icon;
            const isActive = faseAtiva === f.id;
            const isLast = i === FASES.length - 1;
            return (
              <div key={f.id} style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
                <button
                  onClick={() => setFaseAtiva(f.id)}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.875rem 1rem",
                    background: isActive ? f.corBg : "transparent",
                    border: `1px solid ${isActive ? f.cor : "transparent"}`,
                    borderRadius: "0.875rem",
                    cursor: "pointer",
                    transition: "all 0.15s",
                    minWidth: 90,
                  }}
                >
                  <div style={{
                    width: 40, height: 40,
                    borderRadius: "50%",
                    background: isActive ? f.cor : "rgba(255,255,255,0.05)",
                    border: `2px solid ${isActive ? f.cor : "rgba(255,255,255,0.08)"}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "all 0.15s",
                  }}>
                    <FIcon size={18} style={{ color: isActive ? "white" : "#475569" }} />
                  </div>
                  <div>
                    <div style={{
                      fontSize: "0.65rem",
                      fontWeight: 700,
                      color: isActive ? f.cor : "#475569",
                      textAlign: "center",
                      lineHeight: 1.2,
                    }}>
                      {f.numero}
                    </div>
                    <div style={{
                      fontSize: "0.7rem",
                      fontWeight: 600,
                      color: isActive ? "#f1f5f9" : "#64748b",
                      textAlign: "center",
                      whiteSpace: "nowrap",
                    }}>
                      {f.title}
                    </div>
                  </div>
                </button>
                {!isLast && (
                  <ArrowRight size={14} style={{ color: "#1e293b", flexShrink: 0, margin: "0 -2px" }} />
                )}
              </div>
            );
          })}
        </div>
        {/* Linha de progresso */}
        <div style={{ height: 2, background: "rgba(255,255,255,0.04)", borderRadius: 1, marginTop: "0.5rem" }}>
          <div style={{
            height: "100%",
            background: fase.cor,
            borderRadius: 1,
            width: `${((FASES.findIndex(f => f.id === faseAtiva) + 1) / FASES.length) * 100}%`,
            transition: "width 0.3s ease",
          }} />
        </div>
      </div>

      {/* ── Painel de Detalhe ── */}
      <div style={{
        background: "rgba(0,0,0,0.4)",
        border: `1px solid ${fase.corBorder}`,
        borderRadius: "1.25rem",
        overflow: "hidden",
      }}>
        {/* Header da fase */}
        <div style={{
          padding: "1.75rem 2rem",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
          background: fase.corBg,
        }}>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <div style={{
                width: 52, height: 52,
                borderRadius: "0.875rem",
                background: fase.cor,
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>
                <Icon size={26} style={{ color: "white" }} />
              </div>
              <div>
                <div style={{ fontSize: "0.7rem", fontWeight: 700, color: fase.cor, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.2rem" }}>
                  Fase {fase.numero} — {fase.subtitulo}
                </div>
                <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#f1f5f9", lineHeight: 1 }}>
                  {fase.title}
                </h2>
              </div>
            </div>
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "0.65rem", color: "#475569", textTransform: "uppercase", letterSpacing: "0.06em" }}>Timing</div>
                <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#94a3b8" }}>{fase.tempo}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "0.65rem", color: "#475569", textTransform: "uppercase", letterSpacing: "0.06em" }}>Ator</div>
                <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#94a3b8" }}>{fase.ator}</div>
              </div>
            </div>
          </div>

          <p style={{ marginTop: "1.25rem", fontSize: "0.9rem", color: "#94a3b8", lineHeight: 1.75, maxWidth: 780 }}>
            {fase.descricao}
          </p>
        </div>

        {/* Body */}
        <div style={{ padding: "1.75rem 2rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }} className="grid-cols-1 md:grid-cols-2">

          {/* Campos / Canal / Fluxo / Equação */}
          <div>
            {"canais" in fase && (
              <section>
                <h3 style={{ fontSize: "0.72rem", fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.875rem" }}>
                  Impacto por Canal
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {fase.canais!.map((c) => (
                    <div key={c.nome} style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
                      borderRadius: "0.5rem", padding: "0.625rem 0.875rem",
                    }}>
                      <span style={{ fontSize: "0.8rem", color: "#94a3b8", fontWeight: 600 }}>{c.nome}</span>
                      <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0 }}>
                        <span style={{ fontSize: "0.65rem", background: c.risco === "Mínimo" ? "rgba(34,197,94,0.1)" : c.risco === "Baixo" ? "rgba(34,197,94,0.07)" : c.risco === "Médio" ? "rgba(234,179,8,0.1)" : "rgba(239,68,68,0.1)", color: c.risco === "Mínimo" || c.risco === "Baixo" ? "#4ade80" : c.risco === "Médio" ? "#fbbf24" : "#f87171", padding: "0.1rem 0.4rem", borderRadius: "0.25rem", fontWeight: 600 }}>
                          {c.risco}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {"fluxo" in fase && (
              <section>
                <h3 style={{ fontSize: "0.72rem", fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.875rem" }}>
                  Ciclo de Disputa
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
                  {fase.fluxo!.map((step, i) => (
                    <div key={step.step} style={{ display: "flex", gap: "0.875rem" }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                        <div style={{ width: 28, height: 28, borderRadius: "50%", background: step.cor, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <span style={{ fontSize: "0.65rem", fontWeight: 800, color: "white" }}>{i + 1}</span>
                        </div>
                        {i < fase.fluxo!.length - 1 && <div style={{ width: 2, flex: 1, background: "rgba(255,255,255,0.06)", minHeight: 20, margin: "2px 0" }} />}
                      </div>
                      <div style={{ paddingBottom: "1rem" }}>
                        <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#f1f5f9", marginBottom: "0.2rem" }}>{step.step}</div>
                        <div style={{ fontSize: "0.75rem", color: "#64748b", lineHeight: 1.5 }}>{step.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {"equacao" in fase && (
              <section>
                <h3 style={{ fontSize: "0.72rem", fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.875rem" }}>
                  Equação MDR
                </h3>
                <div style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "0.875rem", padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {fase.equacao!.map((item, i) => (
                    <div key={item.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: i === fase.equacao!.length - 2 ? "0.625rem" : 0, borderBottom: i === fase.equacao!.length - 2 ? "1px solid rgba(255,255,255,0.08)" : "none" }}>
                      <span style={{ fontSize: "0.8rem", color: "#64748b" }}>{item.label}</span>
                      <span style={{ fontSize: "0.85rem", fontWeight: 700, color: item.cor, fontFamily: "var(--font-geist-mono)" }}>{item.valor}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {"respostaCodes" in fase && (
              <section>
                <h3 style={{ fontSize: "0.72rem", fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.875rem" }}>
                  Response Codes Principais (DE 39)
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                  {fase.respostaCodes!.map((rc) => (
                    <div key={rc.code} style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      {rc.tipo === "sucesso" ? <CheckCircle2 size={14} style={{ color: "#4ade80", flexShrink: 0 }} /> : rc.tipo === "erro" ? <XCircle size={14} style={{ color: "#f87171", flexShrink: 0 }} /> : <AlertTriangle size={14} style={{ color: "#fbbf24", flexShrink: 0 }} />}
                      <code style={{ fontSize: "0.72rem", fontWeight: 800, color: rc.tipo === "sucesso" ? "#4ade80" : rc.tipo === "erro" ? "#f87171" : "#fbbf24", background: "rgba(255,255,255,0.04)", padding: "0.1rem 0.4rem", borderRadius: "0.25rem", flexShrink: 0 }}>RC {rc.code}</code>
                      <span style={{ fontSize: "0.78rem", color: "#64748b" }}>{rc.desc}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {!("canais" in fase) && !("fluxo" in fase) && !("equacao" in fase) && !("respostaCodes" in fase) && "campos" in fase && (
              <section>
                <h3 style={{ fontSize: "0.72rem", fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.875rem" }}>
                  Campos Críticos
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                  {fase.campos!.map((c) => (
                    <div key={c} style={{ display: "flex", alignItems: "flex-start", gap: "0.625rem" }}>
                      <div style={{ width: 5, height: 5, borderRadius: "50%", background: fase.cor, flexShrink: 0, marginTop: "0.45rem" }} />
                      <code style={{ fontSize: "0.78rem", color: "#94a3b8", lineHeight: 1.5 }}>{c}</code>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Direita: campos (se não mostrou à esquerda) + alertas + links */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

            {"campos" in fase && ("canais" in fase || "fluxo" in fase || "equacao" in fase || "respostaCodes" in fase) && (
              <section>
                <h3 style={{ fontSize: "0.72rem", fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.875rem" }}>
                  Campos / Mensagens
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                  {fase.campos!.map((c) => (
                    <div key={c} style={{ display: "flex", alignItems: "flex-start", gap: "0.625rem" }}>
                      <div style={{ width: 5, height: 5, borderRadius: "50%", background: fase.cor, flexShrink: 0, marginTop: "0.45rem" }} />
                      <code style={{ fontSize: "0.78rem", color: "#94a3b8", lineHeight: 1.5, fontFamily: "var(--font-geist-mono)" }}>{c}</code>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Alertas */}
            <section>
              <h3 style={{ fontSize: "0.72rem", fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.875rem" }}>
                <Clock size={12} style={{ display: "inline", marginRight: 4 }} />
                Pontos de Atenção
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
                {fase.alertas.map((a, i) => (
                  <div key={i} style={{
                    display: "flex", gap: "0.75rem", alignItems: "flex-start",
                    background: "rgba(234,179,8,0.05)",
                    border: "1px solid rgba(234,179,8,0.15)",
                    borderRadius: "0.625rem",
                    padding: "0.75rem 1rem",
                  }}>
                    <AlertTriangle size={13} style={{ color: "#fbbf24", flexShrink: 0, marginTop: 2 }} />
                    <p style={{ fontSize: "0.8rem", color: "#a16207", lineHeight: 1.65 }}>{a}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Links */}
            <section>
              <h3 style={{ fontSize: "0.72rem", fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.875rem" }}>
                Ir mais fundo
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {fase.playbooks.map((p) => (
                  <Link
                    key={p.href}
                    href={p.href}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      background: fase.corBg,
                      border: `1px solid ${fase.corBorder}`,
                      borderRadius: "0.5rem",
                      padding: "0.625rem 0.875rem",
                      textDecoration: "none",
                      transition: "opacity 0.15s",
                    }}
                    className="hover:opacity-80"
                  >
                    <span style={{ fontSize: "0.8rem", fontWeight: 600, color: fase.cor }}>{p.label}</span>
                    <ArrowRight size={14} style={{ color: fase.cor }} />
                  </Link>
                ))}
                {/* Deep Link Acervo Normativo */}
                <Link
                  href="/acervo"
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px dashed rgba(255, 255, 255, 0.2)",
                    borderRadius: "0.5rem",
                    padding: "0.625rem 0.875rem",
                    textDecoration: "none",
                    transition: "all 0.15s",
                    marginTop: "0.5rem",
                  }}
                  className="hover:bg-white/10 hover:border-white/30 group"
                >
                  <span style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8rem", fontWeight: 600, color: "#e2e8f0" }}>
                    <BookOpen size={14} className="text-indigo-400" />
                    Manuais no Acervo
                  </span>
                  <ArrowRight size={14} style={{ color: "#94a3b8" }} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* ── Navegação entre fases ── */}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "1.25rem", gap: "1rem" }}>
        {FASES.findIndex(f => f.id === faseAtiva) > 0 ? (
          <button
            onClick={() => setFaseAtiva(FASES[FASES.findIndex(f => f.id === faseAtiva) - 1].id)}
            style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8rem", color: "#64748b", background: "none", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "0.5rem", padding: "0.5rem 1rem", cursor: "pointer" }}
          >
            ← Fase Anterior
          </button>
        ) : <div />}
        {FASES.findIndex(f => f.id === faseAtiva) < FASES.length - 1 ? (
          <button
            onClick={() => setFaseAtiva(FASES[FASES.findIndex(f => f.id === faseAtiva) + 1].id)}
            style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8rem", color: "#f1f5f9", background: fase.cor, border: "none", borderRadius: "0.5rem", padding: "0.5rem 1.25rem", cursor: "pointer", fontWeight: 600 }}
          >
            Próxima Fase →
          </button>
        ) : (
          <Link
            href="/compliance/disputas"
            style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8rem", color: "#f1f5f9", background: "#ef4444", borderRadius: "0.5rem", padding: "0.5rem 1.25rem", fontWeight: 600, textDecoration: "none" }}
          >
            Ver Playbook Completo de Disputas →
          </Link>
        )}
      </div>
    </div>
  );
}
