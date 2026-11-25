"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import {
  CreditCard, Building2, Activity, Landmark, ArrowRight,
  CheckCircle2, XCircle, AlertTriangle,
  Banknote, RotateCcw, Scale, Zap, Clock, BookOpen,
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
    cor: "#2563eb",
    accentTextClass: "text-blue-700 dark:text-blue-400",
    tempo: "< 100ms",
    ator: "Portador & Terminal",
    descricao: (
      <>
        O portador apresenta o cartão ao terminal físico (POS) ou informa os dados online. Neste momento, o Canal determina o nível de segurança e o custo de <TermTooltip term="Intercâmbio" definition="Taxa base paga pelo Adquirente ao Banco Emissor para custear os benefícios e riscos do cartão." /> da transação.
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
    publicPlaybooks: [
      { label: "Artigo: Visa VDCAP & Mastercard TAF/SCOF", href: "/artigos/vdcap-taf-scof" },
      { label: "Guia: Cartão Presencial & Online", href: "/guia/cartao" },
    ],
  },
  {
    id: "gateway",
    numero: "02",
    title: "Gateway",
    subtitulo: "Captura & ISO 8583",
    icon: Zap,
    cor: "#7c3aed",
    accentTextClass: "text-violet-700 dark:text-violet-400",
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
    publicPlaybooks: [
      { label: "Artigo: Passo a Passo de uma Transação", href: "/artigos/passo-a-passo-transacao" },
      { label: "Glossário: ISO 8583 & Campos", href: "/glossario" },
    ],
  },
  {
    id: "adquirente",
    numero: "03",
    title: "Adquirente",
    subtitulo: "Roteamento & Rede",
    icon: Building2,
    cor: "#b45309",
    accentTextClass: "text-amber-700 dark:text-amber-400",
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
    publicPlaybooks: [
      { label: "Guia: Cartão, Adquirente & Subcredenciador", href: "/guia/cartao" },
      { label: "Jornada por Produto: Caso Certo vs. Erro", href: "/trilhas" },
    ],
  },
  {
    id: "bandeira",
    numero: "04",
    title: "Bandeira",
    subtitulo: "Switch & STIP",
    icon: Activity,
    cor: "#047857",
    accentTextClass: "text-emerald-700 dark:text-emerald-400",
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
      "Certos MCCs são bloqueados por algumas Bandeiras em determinadas regiões (ex: gambling em países específicos).",
    ],
    playbooks: [{ label: "Lookup de Campos", href: "/compliance/campos" }],
    publicPlaybooks: [
      { label: "Artigo: Passo a Passo (Switch & STIP)", href: "/artigos/passo-a-passo-transacao" },
      { label: "Glossário Técnico", href: "/glossario" },
    ],
  },
  {
    id: "emissor",
    numero: "05",
    title: "Emissor",
    subtitulo: "Decisão & Score",
    icon: Landmark,
    cor: "#be185d",
    accentTextClass: "text-pink-700 dark:text-pink-400",
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
    publicPlaybooks: [
      { label: "Guia: Autorização & Response Codes", href: "/guia/cartao" },
      { label: "Jornada por Produto: Online & 3DS 2.2", href: "/trilhas" },
    ],
  },
  {
    id: "clearing",
    numero: "06",
    title: "Clearing",
    subtitulo: "Compensação Noturna",
    icon: RotateCcw,
    cor: "#0e7490",
    accentTextClass: "text-cyan-700 dark:text-cyan-400",
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
    publicPlaybooks: [
      { label: "Guia: Clearing, Outgoing & SLC/B3", href: "/guia/clearing" },
      { label: "Artigo: Guia Completo de Intercâmbio", href: "/artigos/intercambio-guia-completo" },
    ],
  },
  {
    id: "settlement",
    numero: "07",
    title: "Liquidação",
    subtitulo: "O Dinheiro Muda de Mão",
    icon: Banknote,
    cor: "#15803d",
    accentTextClass: "text-green-700 dark:text-green-400",
    tempo: "D+1 Débito / D+2 Crédito",
    ator: "Bandeira + Bancos Liquidantes",
    descricao: (
      <>
        A <TermTooltip term="Liquidação (Settlement)" definition="Transferência financeira efetiva entre as partes e conciliação final dos saldos." /> é a transferência financeira efetiva. A Bandeira atua como câmara multilateral. O Adquirente paga o Intercâmbio ao Emissor e a Scheme Fee à Bandeira. O que sobra (after-interchange) menos o spread do Adquirente é o líquido que o lojista recebe.
      </>
    ),
    equacao: [
      { label: "Valor da Venda", valor: "R$ 100,00", tom: "positivo" },
      { label: "(-) Intercâmbio (Emissor)", valor: "R$ 1,50", tom: "negativo" },
      { label: "(-) Scheme Fee (Bandeira)", valor: "R$ 0,20", tom: "alerta" },
      { label: "(-) Spread Adquirente", valor: "R$ 0,30", tom: "alerta" },
      { label: "(=) Líquido ao Lojista (MDR net)", valor: "R$ 98,00", tom: "positivo" },
    ],
    alertas: [
      "Chargebacks pós-liquidação forçam o Adquirente a devolver fundos já pagos. Cria risco de crédito.",
      "Crédito parcelado adia a liquidação → D+2 por parcela → lojista precisa de capital de giro.",
    ],
    playbooks: [{ label: "Simulador de Intercâmbio", href: "/simulador" }, { label: "Programas de Monitoramento", href: "/compliance/programas" }],
    publicPlaybooks: [
      { label: "Guia: Intercâmbio & Teto BCB 304", href: "/guia/intercambio" },
      { label: "Artigo: Como a Margem Some no Clearing", href: "/noticias/aprovou-00-margem-sumiu-no-clearing" },
    ],
  },
  {
    id: "disputa",
    numero: "08",
    title: "Disputa",
    subtitulo: "Chargeback (se fraude/contestação)",
    icon: Scale,
    cor: "#dc2626",
    accentTextClass: "text-red-700 dark:text-red-400",
    tempo: "30-120 dias",
    ator: "Portador → Emissor → Adquirente → Lojista",
    descricao: (
      <>
        Se o portador não reconhece a transação ou há problema com a mercadoria, inicia-se o ciclo de Disputa. O Emissor reporta a fraude via <TermTooltip term="TC40" definition="Reporte de Fraude (Transaction Code 40) gerado pelo Emissor à Bandeira." /> (alimentando <TermTooltip term="VAMP/EFM" definition="Programas de multas e monitoramento de chargeback das Bandeiras." />) e pode abrir um Chargeback formal. O Adquirente tem prazo para Representment com evidências. Se não resolvido, vai para Arbitration.
      </>
    ),
    fluxo: [
      { step: "TC40 Report", desc: "Emissor declara fraude. Alimenta VAMP/EFM do Adquirente.", cor: "#b45309" },
      { step: "First Chargeback", desc: "Emissor puxa o valor de volta da conta do Adquirente.", cor: "#dc2626" },
      { step: "Representment", desc: "Adquirente/Lojista envia evidências defensoras via DMAS/VROL.", cor: "#2563eb" },
      { step: "Pre-Arbitration", desc: "Emissor rejeita as evidências. Último estágio antes da Bandeira.", cor: "#b45309" },
      { step: "Arbitration", desc: "Bandeira decide. USD 150 (filing) + USD 250 (fee do perdedor).", cor: "#dc2626" },
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
    publicPlaybooks: [
      { label: "Artigo: Compelling Evidence 3.0 (Visa)", href: "/artigos/compelling-evidence-3-0" },
      { label: "Guia: Disputas & Chargebacks", href: "/guia/disputas" },
    ],
  },
];

function getRiscoBadgeClass(risco: string) {
  if (risco === "Mínimo") {
    return "bg-emerald-500/12 text-emerald-800 dark:text-emerald-300 border border-emerald-500/25";
  }
  if (risco === "Baixo") {
    return "bg-teal-500/12 text-teal-800 dark:text-teal-300 border border-teal-500/25";
  }
  if (risco === "Médio") {
    return "bg-amber-500/14 text-amber-900 dark:text-amber-300 border border-amber-500/30";
  }
  return "bg-red-500/12 text-red-800 dark:text-red-300 border border-red-500/25";
}

function getEquacaoTomClass(tom: string) {
  if (tom === "positivo") return "text-emerald-700 dark:text-emerald-400";
  if (tom === "negativo") return "text-red-700 dark:text-red-400";
  return "text-amber-700 dark:text-amber-400";
}

// ─── Componente ───────────────────────────────────────────────────────────────

const subscribeNoop = () => () => {};
const getOwnerSnapshot = () =>
  typeof document !== "undefined" &&
  document.cookie.split(";").some((c) => c.trim().startsWith("vs_internal_pass=1"));
const getServerOwnerSnapshot = () => false;

export default function JornadaClient() {
  const [faseAtiva, setFaseAtiva] = useState<string>("apresentacao");
  const isOwner = useSyncExternalStore(subscribeNoop, getOwnerSnapshot, getServerOwnerSnapshot);

  const faseIndex = FASES.findIndex((f) => f.id === faseAtiva);
  const fase = FASES[faseIndex] ?? FASES[0];
  const Icon = fase.icon;
  const activePlaybooks = isOwner ? fase.playbooks : fase.publicPlaybooks;

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 pb-20">

      {/* ── Linha do Tempo ── */}
      <div className="mb-8">
        <div
          className="flex items-center gap-0.5 overflow-x-auto pb-2"
          style={{ scrollbarWidth: "thin" }}
        >
          {FASES.map((f, i) => {
            const FIcon = f.icon;
            const isActive = faseAtiva === f.id;
            const isLast = i === FASES.length - 1;
            return (
              <div key={f.id} className="flex items-center shrink-0">
                <button
                  type="button"
                  onClick={() => setFaseAtiva(f.id)}
                  className={`group flex flex-col items-center gap-2 px-3.5 py-3 rounded-xl border transition-colors cursor-pointer min-w-[92px] ${
                    isActive
                      ? "bg-card shadow-xs"
                      : "bg-transparent border-transparent hover:bg-muted/70"
                  }`}
                  style={
                    isActive
                      ? {
                          borderColor: `color-mix(in srgb, ${f.cor} 45%, var(--border))`,
                          backgroundColor: `color-mix(in srgb, ${f.cor} 7%, var(--card))`,
                        }
                      : undefined
                  }
                >
                  <div
                    className={`size-10 rounded-full flex items-center justify-center transition-colors border-2 ${
                      isActive ? "" : "bg-muted border-border text-muted-foreground group-hover:text-foreground"
                    }`}
                    style={
                      isActive
                        ? {
                            backgroundColor: f.cor,
                            borderColor: f.cor,
                            color: "#ffffff",
                          }
                        : undefined
                    }
                  >
                    <FIcon size={18} />
                  </div>
                  <div className="text-center">
                    <div
                      className={`font-mono text-[11px] font-semibold leading-tight tabular-nums ${
                        isActive ? f.accentTextClass : "text-muted-foreground"
                      }`}
                    >
                      {f.numero}
                    </div>
                    <div
                      className={`text-xs font-semibold whitespace-nowrap ${
                        isActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                      }`}
                    >
                      {f.title}
                    </div>
                  </div>
                </button>
                {!isLast && (
                  <ArrowRight size={14} className="text-muted-foreground/45 shrink-0 mx-0.5" />
                )}
              </div>
            );
          })}
        </div>

        {/* Linha de progresso */}
        <div className="h-1 bg-border rounded-full mt-2 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              backgroundColor: fase.cor,
              width: `${((faseIndex + 1) / FASES.length) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* ── Painel de Detalhe ── */}
      <div
        className="bg-card border border-border rounded-2xl overflow-hidden shadow-xs"
        style={{
          borderTopWidth: "3px",
          borderTopColor: fase.cor,
        }}
      >
        {/* Header da fase */}
        <div
          className="px-6 py-6 sm:px-8 sm:py-7 border-b border-border"
          style={{
            backgroundColor: `color-mix(in srgb, ${fase.cor} 5%, var(--card))`,
          }}
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div
                className="size-12 sm:size-13 rounded-xl flex items-center justify-center shrink-0 shadow-xs"
                style={{ backgroundColor: fase.cor, color: "#ffffff" }}
              >
                <Icon size={24} />
              </div>
              <div>
                <div className={`font-mono text-[11px] font-semibold uppercase tracking-wider mb-1 ${fase.accentTextClass}`}>
                  Fase {fase.numero} — {fase.subtitulo}
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-foreground leading-tight tracking-tight text-balance">
                  {fase.title}
                </h2>
              </div>
            </div>

            <div className="flex flex-wrap gap-6 sm:text-right">
              <div>
                <div className="font-mono text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Timing
                </div>
                <div className="text-sm font-semibold text-foreground tabular-nums mt-0.5">
                  {fase.tempo}
                </div>
              </div>
              <div>
                <div className="font-mono text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Ator
                </div>
                <div className="text-sm font-semibold text-foreground mt-0.5">
                  {fase.ator}
                </div>
              </div>
            </div>
          </div>

          <p className="mt-5 text-[0.94rem] text-[var(--body-text)] leading-relaxed max-w-3xl text-pretty">
            {fase.descricao}
          </p>
        </div>

        {/* Body */}
        <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* Coluna Esquerda: Canal / Fluxo / Equação / Response Codes / Campos Críticos */}
          <div>
            {"canais" in fase && fase.canais && (
              <section>
                <h3 className="section-eyebrow mb-3.5">
                  Impacto por Canal
                </h3>
                <div className="flex flex-col gap-2">
                  {fase.canais.map((c) => (
                    <div
                      key={c.nome}
                      className="flex items-center justify-between gap-3 rounded-lg bg-muted/60 border border-border px-3.5 py-2.5"
                    >
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-foreground leading-snug">
                          {c.nome}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5 leading-snug">
                          {c.intercambio}
                        </div>
                      </div>
                      <span
                        className={`shrink-0 text-[11px] font-semibold px-2 py-0.5 rounded-md ${getRiscoBadgeClass(c.risco)}`}
                      >
                        {c.risco}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {"fluxo" in fase && fase.fluxo && (
              <section>
                <h3 className="section-eyebrow mb-3.5">
                  Ciclo de Disputa
                </h3>
                <div className="flex flex-col">
                  {fase.fluxo.map((step, i) => (
                    <div key={step.step} className="flex gap-3.5">
                      <div className="flex flex-col items-center shrink-0">
                        <div
                          className="size-7 rounded-full flex items-center justify-center shrink-0"
                          style={{ backgroundColor: step.cor, color: "#ffffff" }}
                        >
                          <span className="font-mono text-xs font-bold tabular-nums">{i + 1}</span>
                        </div>
                        {i < fase.fluxo!.length - 1 && (
                          <div className="w-0.5 flex-1 bg-border min-h-[20px] my-1" />
                        )}
                      </div>
                      <div className="pb-4">
                        <div className="text-sm font-semibold text-foreground mb-0.5">
                          {step.step}
                        </div>
                        <div className="text-xs text-muted-foreground leading-relaxed text-pretty">
                          {step.desc}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {"equacao" in fase && fase.equacao && (
              <section>
                <h3 className="section-eyebrow mb-3.5">
                  Equação MDR
                </h3>
                <div className="bg-muted/60 border border-border rounded-xl p-4 sm:p-5 flex flex-col gap-2.5">
                  {fase.equacao.map((item, i) => {
                    const isBeforeTotal = i === fase.equacao!.length - 2;
                    const isTotal = i === fase.equacao!.length - 1;
                    return (
                      <div
                        key={item.label}
                        className={`flex justify-between items-center gap-3 ${
                          isBeforeTotal ? "pb-2.5 border-b border-border" : ""
                        }`}
                      >
                        <span
                          className={`text-sm ${
                            isTotal ? "font-semibold text-foreground" : "text-[var(--body-text)]"
                          }`}
                        >
                          {item.label}
                        </span>
                        <span
                          className={`font-mono text-sm font-semibold tabular-nums shrink-0 ${getEquacaoTomClass(item.tom)}`}
                        >
                          {item.valor}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {"respostaCodes" in fase && fase.respostaCodes && (
              <section>
                <h3 className="section-eyebrow mb-3.5">
                  Response Codes Principais (DE 39)
                </h3>
                <div className="flex flex-col gap-2">
                  {fase.respostaCodes.map((rc) => (
                    <div
                      key={rc.code}
                      className="flex items-center gap-2.5 rounded-lg bg-muted/60 border border-border px-3 py-2"
                    >
                      {rc.tipo === "sucesso" ? (
                        <CheckCircle2 size={15} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                      ) : rc.tipo === "erro" ? (
                        <XCircle size={15} className="text-red-600 dark:text-red-400 shrink-0" />
                      ) : (
                        <AlertTriangle size={15} className="text-amber-600 dark:text-amber-400 shrink-0" />
                      )}
                      <code
                        className={`font-mono text-xs font-bold px-1.5 py-0.5 rounded shrink-0 tabular-nums ${
                          rc.tipo === "sucesso"
                            ? "bg-emerald-500/12 text-emerald-800 dark:text-emerald-300"
                            : rc.tipo === "erro"
                            ? "bg-red-500/12 text-red-800 dark:text-red-300"
                            : "bg-amber-500/14 text-amber-900 dark:text-amber-300"
                        }`}
                      >
                        RC {rc.code}
                      </code>
                      <span className="text-sm text-[var(--body-text)]">{rc.desc}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {!("canais" in fase) && !("fluxo" in fase) && !("equacao" in fase) && !("respostaCodes" in fase) && "campos" in fase && fase.campos && (
              <section>
                <h3 className="section-eyebrow mb-3.5">
                  Campos Críticos
                </h3>
                <div className="flex flex-col gap-2">
                  {fase.campos.map((c) => (
                    <div key={c} className="flex items-start gap-2.5">
                      <span
                        className="size-1.5 rounded-full shrink-0 mt-2"
                        style={{ backgroundColor: fase.cor }}
                      />
                      <code className="font-mono text-xs sm:text-[0.8125rem] text-foreground leading-relaxed">
                        {c}
                      </code>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Coluna Direita: campos (se não mostrou à esquerda) + alertas + links */}
          <div className="flex flex-col gap-6">

            {"campos" in fase && fase.campos && ("canais" in fase || "fluxo" in fase || "equacao" in fase || "respostaCodes" in fase) && (
              <section>
                <h3 className="section-eyebrow mb-3.5">
                  Campos / Mensagens
                </h3>
                <div className="flex flex-col gap-2">
                  {fase.campos.map((c) => (
                    <div key={c} className="flex items-start gap-2.5">
                      <span
                        className="size-1.5 rounded-full shrink-0 mt-2"
                        style={{ backgroundColor: fase.cor }}
                      />
                      <code className="font-mono text-xs sm:text-[0.8125rem] text-foreground leading-relaxed">
                        {c}
                      </code>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Alertas */}
            <section>
              <h3 className="section-eyebrow mb-3.5 flex items-center gap-1.5">
                <Clock size={12} className="shrink-0" />
                Pontos de Atenção
              </h3>
              <div className="flex flex-col gap-2.5">
                {fase.alertas.map((a, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 rounded-xl bg-amber-500/8 dark:bg-amber-500/12 border border-amber-500/25 px-4 py-3"
                  >
                    <AlertTriangle size={15} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-950 dark:text-amber-100 leading-relaxed text-pretty">
                      {a}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* Links */}
            <section>
              <h3 className="section-eyebrow mb-3.5">
                Ir mais fundo
              </h3>
              <div className="flex flex-col gap-2">
                {activePlaybooks.map((p) => (
                  <Link
                    key={p.href}
                    href={p.href}
                    className="group flex items-center justify-between gap-2 rounded-lg border px-3.5 py-2.5 transition-opacity hover:opacity-85"
                    style={{
                      backgroundColor: `color-mix(in srgb, ${fase.cor} 7%, var(--card))`,
                      borderColor: `color-mix(in srgb, ${fase.cor} 28%, var(--border))`,
                    }}
                  >
                    <span className={`text-sm font-semibold ${fase.accentTextClass}`}>
                      {p.label}
                    </span>
                    <ArrowRight size={15} className={`${fase.accentTextClass} shrink-0 transition-transform group-hover:translate-x-0.5`} />
                  </Link>
                ))}
                {/* Deep Link Acervo (owner) ou Mapa Regulatório (público) */}
                <Link
                  href={isOwner ? "/acervo" : "/regulatorio"}
                  className="group flex items-center justify-between gap-2 rounded-lg bg-muted/60 border border-dashed border-[var(--border-strong)] px-3.5 py-2.5 transition-colors hover:bg-muted hover:border-foreground/40 mt-1"
                >
                  <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <BookOpen size={15} className="text-muted-foreground group-hover:text-foreground transition-colors" />
                    {isOwner ? "Manuais no Acervo" : "Mapa Regulatório (202 Atos BCB/CMN)"}
                  </span>
                  <ArrowRight size={15} className="text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
                </Link>
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* ── Navegação entre fases ── */}
      <div className="flex items-center justify-between mt-5 gap-4">
        {faseIndex > 0 ? (
          <button
            type="button"
            onClick={() => setFaseAtiva(FASES[faseIndex - 1].id)}
            className="inline-flex items-center gap-2 text-sm font-medium text-foreground bg-card border border-border hover:bg-muted rounded-lg px-4 py-2 transition-colors cursor-pointer"
          >
            ← Fase Anterior
          </button>
        ) : <div />}

        {faseIndex < FASES.length - 1 ? (
          <button
            type="button"
            onClick={() => setFaseAtiva(FASES[faseIndex + 1].id)}
            className="inline-flex items-center gap-2 text-sm font-semibold rounded-lg px-5 py-2 transition-opacity hover:opacity-90 cursor-pointer"
            style={{ backgroundColor: fase.cor, color: "#ffffff" }}
          >
            Próxima Fase →
          </button>
        ) : (
          <Link
            href={isOwner ? "/compliance/disputas" : "/guia/disputas"}
            className="inline-flex items-center gap-2 text-sm font-semibold rounded-lg px-5 py-2 transition-opacity hover:opacity-90"
            style={{ backgroundColor: "#dc2626", color: "#ffffff" }}
          >
            {isOwner ? "Ver Playbook Completo de Disputas →" : "Ler Guia Completo de Disputas →"}
          </Link>
        )}
      </div>
    </div>
  );
}
