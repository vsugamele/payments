"use client";

import { useState, useMemo } from "react";
import { CheckCircle2, XCircle, AlertTriangle, Info, ChevronDown, ChevronUp, Shield, ArrowRight } from "lucide-react";
import Link from "next/link";

// ─── Tipos ────────────────────────────────────────────────────────────────────

type LiabilityTipo = "Emissor" | "Lojista" | "Compartilhado" | "Lojista (parcial)" | "Emissor (se 3DS inicial)";
type FiltroTipo = "Todos" | "CP" | "CNP";

interface Canal {
  id: string;
  nome: string;
  tipo: "CP" | "CNP";
  grupo: string;
  de22: string;
  eci: string | null;
  riscoScore: number;          // 1 (mínimo) a 5 (máximo)
  intercambioRelativo: number; // 1 (menor) a 5 (maior)
  intercambioLabel: string;
  liability: LiabilityTipo;
  liabilityCondicao: string;
  autenticacao: string[];
  requisitos: string[];
  programasRisco: string[];
  alertas: string[];
  recomendacao: string;
  referencia: string;
  cor: string;
}

// ─── Dados ────────────────────────────────────────────────────────────────────

const CANAIS: Canal[] = [
  {
    id: "chip-pin",
    nome: "Chip + PIN",
    tipo: "CP",
    grupo: "Card-Present",
    de22: "05",
    eci: null,
    riscoScore: 1,
    intercambioRelativo: 1,
    intercambioLabel: "Mínimo",
    liability: "Emissor",
    liabilityCondicao: "Sempre. O chip criptografado + PIN atestam posse e conhecimento. Vitória do Emissor em qualquer fraude.",
    autenticacao: ["Chip EMV (criptograma único)", "PIN verificado offline no ICC"],
    requisitos: ["Terminal EMV certificado", "POS com teclado para PIN"],
    programasRisco: [],
    alertas: [
      "Mesmo Chip+PIN pode ter fraude: shimming (leitura passiva do chip). Porém é extremamente raro e não muda o Liability.",
    ],
    recomendacao: "Canal ideal para alto volume em loja física. Menor custo de intercâmbio + Liability protegido.",
    referencia: "EMVCo Chip Specification / ISO 8583 DE 22 = 05",
    cor: "#22c55e",
  },
  {
    id: "chip-assinatura",
    nome: "Chip + Assinatura",
    tipo: "CP",
    grupo: "Card-Present",
    de22: "05",
    eci: null,
    riscoScore: 2,
    intercambioRelativo: 2,
    intercambioLabel: "Baixo",
    liability: "Emissor",
    liabilityCondicao: "O Emissor mantém Liability pois o chip gerou criptograma válido. Assinatura é verificação complementar.",
    autenticacao: ["Chip EMV (criptograma único)", "Assinatura (CVM = Signature)"],
    requisitos: ["Terminal EMV certificado", "Slot de tela/caneta ou papel de assinatura"],
    programasRisco: [],
    alertas: [
      "Assinatura é o método de CVM mais fraco. Um cartão roubado com chip pode ser usado em terminais que aceitam assinatura sem questionar.",
      "Em alguns países (ex: EUA historicamente), Chip+Assinatura foi o padrão. No Brasil, Chip+PIN é obrigatório para cartões domésticos.",
    ],
    recomendacao: "Evitar quando possível. PIN é mais seguro. Aceitável para lojistas com público idoso ou acessibilidade especial.",
    referencia: "EMVCo Chip Spec — CVM List",
    cor: "#86efac",
  },
  {
    id: "contactless-abaixo",
    nome: "Contactless NFC (≤ Threshold)",
    tipo: "CP",
    grupo: "Card-Present",
    de22: "07",
    eci: null,
    riscoScore: 2,
    intercambioRelativo: 2,
    intercambioLabel: "Equivalente ao Chip",
    liability: "Emissor",
    liabilityCondicao: "O Token/Criptograma NFC é tecnicamente equivalente ao chip. Emissor assume Liability.",
    autenticacao: ["Criptograma NFC de uso único (ARQC)", "No CVM (abaixo do threshold)"],
    requisitos: ["Terminal NFC/contactless", "Limite abaixo do threshold (geralmente R$ 200–300 no Brasil)"],
    programasRisco: [],
    alertas: [
      "Abaixo do threshold: sem PIN. Cartões perdidos/roubados podem ser usados para transações pequenas sem bloqueio.",
      "As Bandeiras definem thresholds por país. O Emissor pode configurar um threshold menor no perfil do cartão.",
    ],
    recomendacao: "Altamente recomendado para varejo rápido (farmácia, fast food, transporte). Melhor experiência + segurança equivalente ao chip.",
    referencia: "Mastercard Contactless Rules / Visa Tap to Pay Spec",
    cor: "#4ade80",
  },
  {
    id: "contactless-acima",
    nome: "Contactless NFC (> Threshold)",
    tipo: "CP",
    grupo: "Card-Present",
    de22: "07",
    eci: null,
    riscoScore: 1,
    intercambioRelativo: 2,
    intercambioLabel: "Equivalente ao Chip",
    liability: "Emissor",
    liabilityCondicao: "Criptograma NFC + PIN ou biometria do device. Proteção máxima. Liability do Emissor.",
    autenticacao: ["Criptograma NFC de uso único (ARQC)", "PIN no terminal ou biometria no dispositivo (Apple/Google Pay)"],
    requisitos: ["Terminal NFC", "Valor acima do threshold de CVM"],
    programasRisco: [],
    alertas: [
      "Quando via Apple Pay / Google Pay acima do threshold, a biometria do device substitui o PIN com segurança equivalente ou superior.",
    ],
    recomendacao: "Estimular este canal em checkouts de alto valor em loja. Segurança máxima com experiência fluida.",
    referencia: "EMVCo Contactless Spec / Visa DAF",
    cor: "#4ade80",
  },
  {
    id: "fallback-magstripe",
    nome: "Fallback Magstripe",
    tipo: "CP",
    grupo: "Card-Present",
    de22: "80 ou 90",
    eci: null,
    riscoScore: 4,
    intercambioRelativo: 4,
    intercambioLabel: "Elevado",
    liability: "Compartilhado",
    liabilityCondicao: "Depende da origem do fallback. Se o terminal falhou (não leu o chip), o Adquirente pode ser responsabilizado. Se o cartão não tem chip, o Emissor mantém parte do risco.",
    autenticacao: ["Leitura da tarja magnética", "PIN ou Assinatura (dependendo do terminal)"],
    requisitos: ["Terminal com leitor de tarja"],
    programasRisco: ["BRAM (Mastercard)", "VIRP (Visa)"],
    alertas: [
      "Alta incidência de Fallback pode indicar terminais com leitores de chip comprometidos. Bandeiras monitoram e alertam Adquirentes.",
      "Adquirentes com taxa de Fallback acima de 10% podem receber enquadramento em programas de integridade operacional.",
      "CVV da tarja é diferente do iCVV do chip. Clonagem via skimmer captura o CVV da tarja — mas não o criptograma do chip.",
    ],
    recomendacao: "Canal de last resort. Monitorar ativamente. Alta taxa de Fallback = sinal de alerta para fraude em terminais.",
    referencia: "ISO 8583 DE 22 = 80/90 / Mastercard Chip Rules",
    cor: "#f97316",
  },
  {
    id: "ecom-sem-3ds",
    nome: "E-commerce sem 3DS",
    tipo: "CNP",
    grupo: "Card-Not-Present",
    de22: "01",
    eci: "07",
    riscoScore: 5,
    intercambioRelativo: 4,
    intercambioLabel: "Alto",
    liability: "Lojista",
    liabilityCondicao: "100% do Lojista. Sem autenticação, qualquer fraude (Chargeback 10.4/4837) é responsabilidade do lojista sem direito de defesa robusta.",
    autenticacao: ["Nenhuma autenticação de segundo fator"],
    requisitos: ["Apenas PAN + CVV + validade"],
    programasRisco: ["VAMP (Visa)", "EFM (Mastercard)", "ECP (se chargeback alto)"],
    alertas: [
      "ECI 07 = sem autenticação. Em caso de fraude, NENHUMA defesa de Liability é possível.",
      "Implementar 3DS é obrigatório para lojistas com alto volume CNP no Brasil (Resolução BCB + exigência das Bandeiras).",
      "Lojistas EFM que ignoram 3DS recebem multas crescentes da Mastercard mensalmente.",
    ],
    recomendacao: "EVITAR. Substituir por 3DS Frictionless o quanto antes. A perda recorrente de chargebacks supera qualquer melhoria de conversão.",
    referencia: "Visa Core Rules — Condition 10.4 / Mastercard EFM Rules",
    cor: "#ef4444",
  },
  {
    id: "ecom-3ds-frictionless",
    nome: "E-commerce 3DS Frictionless",
    tipo: "CNP",
    grupo: "Card-Not-Present",
    de22: "01",
    eci: "05 (Visa) / 02 (MC)",
    riscoScore: 2,
    intercambioRelativo: 4,
    intercambioLabel: "Alto (mesmo sem 3DS)",
    liability: "Emissor",
    liabilityCondicao: "ECI 05/02 garante Liability Shift completo para o Emissor. Lojista está protegido mesmo em frictionless.",
    autenticacao: ["3DS v2.x — autenticação silenciosa pelo ACS", "Device fingerprint, IP, histórico do portador", "Sem interrupção do checkout (frictionless)"],
    requisitos: ["MPI integrado", "SDK 3DS v2.x", "Merchant Plugin (MPI) certificado"],
    programasRisco: [],
    alertas: [
      "Frictionless = ACS aprovou sem desafiar o portador. Depende da qualidade do modelo de risco do Emissor.",
      "Taxas de fricionless variam muito por Emissor (de 40% a 90%). Emissores com ACS ruim aumentam o atrito desnecessariamente.",
      "Mesmo frictionless, o ECI 05 garante o Liability Shift. Não há diferença legal para o lojista.",
    ],
    recomendacao: "Canal ideal para CNP. Melhor conversão (sem atrito) + Liability protegido. Implementar 3DS v2.x é a prioridade #1 para e-commerce.",
    referencia: "EMVCo 3DS Core Spec v2.2 / Visa VCR Condition 10.4",
    cor: "#22c55e",
  },
  {
    id: "ecom-3ds-challenge",
    nome: "E-commerce 3DS Challenge",
    tipo: "CNP",
    grupo: "Card-Not-Present",
    de22: "01",
    eci: "05 (Visa) / 02 (MC)",
    riscoScore: 1,
    intercambioRelativo: 4,
    intercambioLabel: "Alto (mesmo sem 3DS)",
    liability: "Emissor",
    liabilityCondicao: "ECI 05/02 + challenge completado. Proteção máxima. O portador provou posse ativa do dispositivo/acesso ao banco.",
    autenticacao: ["3DS v2.x — ACS requisitou Challenge", "OTP via SMS/app bancário ou biometria", "Portador completou o desafio ativamente"],
    requisitos: ["MPI integrado", "SDK 3DS v2.x com suporte a challenge flow"],
    programasRisco: [],
    alertas: [
      "Challenge aumenta o atrito no checkout. Taxas de abandono de 10-25% são relatadas em desafios mal implementados.",
      "3DS v2.x reduziu muito o volume de challenges vs v1.x. Challenges ocorrem em transações de maior risco.",
      "Friendly Fraud fica praticamente impossível após Challenge. O portador não pode negar uma transação que ele mesmo autenticou via biometria.",
    ],
    recomendacao: "Aceitar o Challenge como proteção adicional em transações de alto valor ou risco. Otimizar o flow de UX para minimizar abandono.",
    referencia: "EMVCo 3DS Spec v2.2 — Challenge Flow",
    cor: "#4ade80",
  },
  {
    id: "moto",
    nome: "MOTO (Mail Order / Telephone Order)",
    tipo: "CNP",
    grupo: "Card-Not-Present",
    de22: "01 ou 08",
    eci: "07",
    riscoScore: 5,
    intercambioRelativo: 5,
    intercambioLabel: "Máximo",
    liability: "Lojista",
    liabilityCondicao: "100% do Lojista. Não há 3DS em MOTO. Qualquer fraude é responsabilidade integral do lojista.",
    autenticacao: ["Nenhuma — apenas PAN, CVV e validade informados verbalmente/por escrito"],
    requisitos: ["Virtual Terminal para digitação manual do operador", "MOTO flag no DE 22"],
    programasRisco: ["VAMP (Visa)", "EFM (Mastercard)"],
    alertas: [
      "MOTO é o canal de maior risco porque nem 3DS é aplicável. Não há autenticação robusta possível.",
      "Interceptação da ligação ou e-mail fornece todos os dados necessários para fraude.",
      "Intercâmbio MOTO é tipicamente o mais alto das Bandeiras. Custo + Risco = canal a ser minimizado.",
    ],
    recomendacao: "Usar apenas quando indispensável (ex: centrais de atendimento sem alternativa digital). Implementar verificações extras: CVV2, tokenização pós-captura.",
    referencia: "Visa/Mastercard Card-Not-Present Rules — MOTO",
    cor: "#ef4444",
  },
  {
    id: "mit-recorrencia-fixa",
    nome: "MIT — Recorrência Fixa (COF)",
    tipo: "CNP",
    grupo: "Card-Not-Present",
    de22: "10 (Recurring)",
    eci: "07 (sem 3DS subsequente)",
    riscoScore: 3,
    intercambioRelativo: 3,
    intercambioLabel: "Médio",
    liability: "Lojista (parcial)",
    liabilityCondicao: "A transação inicial com 3DS protege o lojista na primeira cobrança. Subsequentes (MIT) sem 3DS ficam com Liability do lojista. CE 3.0 pode proteger em chargebacks de fraude subsequentes.",
    autenticacao: ["Consentimento do portador na transação inicial (CIT)", "MIT subsequentes usam credencial armazenada (COF)", "Sem 3DS nas recorrências subsequentes"],
    requisitos: ["Registro da transação inicial como CIT (Customer Initiated)", "Armazenar: PAN (ou Network Token) + referência de autorização original", "Valor e data fixos"],
    programasRisco: ["EFM se alta taxa de fraude nas recorrências"],
    alertas: [
      "Se a transação inicial NÃO teve 3DS, toda a cadeia de recorrência fica exposta.",
      "Portadores frequentemente alegam não reconhecer cobranças recorrentes (Friendly Fraud). Mantenha log de todas as MITs com STAMP da cobrança original.",
      "Network Token reduzi enormemente o churn involuntário em recorrências — cartão vencido é atualizado automaticamente.",
    ],
    recomendacao: "Usar Network Tokens para recorrência. Implementar 3DS na transação inicial. Manter histórico para defesa via CE 3.0.",
    referencia: "Visa/Mastercard Credential-on-File Rules / SCOF/MIT Framework",
    cor: "#fbbf24",
  },
  {
    id: "mit-recorrencia-variavel",
    nome: "MIT — Recorrência Variável (SCOF)",
    tipo: "CNP",
    grupo: "Card-Not-Present",
    de22: "10 (Recurring)",
    eci: "07",
    riscoScore: 3,
    intercambioRelativo: 3,
    intercambioLabel: "Médio",
    liability: "Lojista (parcial)",
    liabilityCondicao: "Similar ao MIT fixo. Sem 3DS nas cobranças variáveis. Valor/data variáveis aumentam a probabilidade de contestação pelo portador.",
    autenticacao: ["CITI — consentimento na transação inicial", "Subsequentes sem desafio"],
    requisitos: ["SCOF flag na mensagem ISO", "Referência ao CITI original", "Valor pode variar a cada cobrança"],
    programasRisco: ["EFM se alta taxa de fraude"],
    alertas: [
      "Cobranças com valor variável são as mais contestadas como Friendly Fraud. O portador alega 'não reconheço esse valor'.",
      "Comunicação prévia ao portador sobre o valor a ser cobrado reduz contestações em 40-60%.",
    ],
    recomendacao: "Notificar o portador antes de cada cobrança variável. Fornecer mecanismo de cancelamento fácil. Usar Network Token para evitar churn.",
    referencia: "Visa/Mastercard SCOF Rules",
    cor: "#fbbf24",
  },
  {
    id: "carteira-digital-dpan",
    nome: "Apple Pay / Google Pay (DPAN)",
    tipo: "CNP",
    grupo: "Tokenizado",
    de22: "07 (via NFC) ou 01 (e-com)",
    eci: "05/02 via DAF",
    riscoScore: 1,
    intercambioRelativo: 2,
    intercambioLabel: "Equivalente ao Chip (CP) / Frictionless (CNP)",
    liability: "Emissor",
    liabilityCondicao: "DAF (Digital Authentication Framework) ativo. Autenticação biométrica do device é reconhecida pelas Bandeiras como equivalente ao 3DS. Liability é do Emissor.",
    autenticacao: ["Face ID / Touch ID / PIN do device", "Criptograma do DPAN (Token único por device)", "DAF ativo → TAF injetado na mensagem"],
    requisitos: ["Aceitar pagamentos via Apple Pay / Google Pay", "Gateway certificado para VTS/MDES", "TAF flag no DE 48"],
    programasRisco: [],
    alertas: [
      "TAF ausente no DE 48 = DAF não reconhecido = Liability NÃO transferido. É um erro técnico de configuração de gateway muito comum.",
      "DPAN é vinculado ao device. Se o portador perde o celular e o apaga remotamente, o DPAN é desativado sem afetar o cartão original.",
    ],
    recomendacao: "Canal ideal para mobile checkout e loja física. Segurança máxima + Liability protegido + conversão superior (sem digitação).",
    referencia: "Visa DAF Framework / VTS Technical Spec / Mastercard MDES",
    cor: "#22c55e",
  },
  {
    id: "network-token",
    nome: "Network Token (Recorrência Tokenizada)",
    tipo: "CNP",
    grupo: "Tokenizado",
    de22: "01",
    eci: "05/02 (se gerado com 3DS inicial)",
    riscoScore: 2,
    intercambioRelativo: 3,
    intercambioLabel: "Médio (melhor aprovação)",
    liability: "Emissor (se 3DS inicial)",
    liabilityCondicao: "Se a transação inicial de provisão do Token teve 3DS, o Liability é do Emissor para cobranças subsequentes autenticadas via Token. TIDI obrigatório para manter a cadeia.",
    autenticacao: ["Token gerado via VTS (Visa) ou MDES (Mastercard)", "Válido até expiração do Token (renovado automaticamente)", "TIDI nas MITs subsequentes"],
    requisitos: ["Integração com VTS ou MDES", "TIDI corretamente preenchido nas recorrências", "3DS na transação inicial de provisão"],
    programasRisco: [],
    alertas: [
      "TIDI ausente nas recorrências quebra a cadeia de Liability Shift. Cobrança subsequente sem TIDI = ECI 07 implícito.",
      "Network Token se atualiza automaticamente quando o cartão vence. Churn involuntário de assinaturas cai 10-15%.",
      "Aprovação de Network Tokens é 3-8% maior que PAN estático — Emissores confiam mais em transações tokenizadas.",
    ],
    recomendacao: "Melhor opção para assinaturas e recorrência de alto valor. Combina segurança + aprovação + redução de churn.",
    referencia: "EMVCo Token Spec / VTS & MDES Technical Guides",
    cor: "#818cf8",
  },
];

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function RiscoBar({ score }: { score: number }) {
  const cores = ["#22c55e", "#4ade80", "#fbbf24", "#f97316", "#ef4444"];
  return (
    <div style={{ display: "flex", gap: 3 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          style={{
            width: 12, height: 12,
            borderRadius: "0.2rem",
            background: i <= score ? cores[score - 1] : "rgba(255,255,255,0.06)",
            transition: "background 0.15s",
          }}
        />
      ))}
    </div>
  );
}

function IntercambioBar({ value }: { value: number }) {
  return (
    <div style={{ display: "flex", gap: 3 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          style={{
            width: 12, height: 12,
            borderRadius: "0.2rem",
            background: i <= value ? "#60a5fa" : "rgba(255,255,255,0.06)",
          }}
        />
      ))}
    </div>
  );
}

function LiabilityBadge({ tipo }: { tipo: LiabilityTipo }) {
  const conf = ({
    Emissor: { bg: "rgba(34,197,94,0.1)", text: "#4ade80", border: "rgba(34,197,94,0.25)", icon: CheckCircle2 },
    Lojista: { bg: "rgba(239,68,68,0.1)", text: "#f87171", border: "rgba(239,68,68,0.25)", icon: XCircle },
    Compartilhado: { bg: "rgba(234,179,8,0.1)", text: "#fbbf24", border: "rgba(234,179,8,0.25)", icon: AlertTriangle },
    "Lojista (parcial)": { bg: "rgba(249,115,22,0.1)", text: "#fb923c", border: "rgba(249,115,22,0.25)", icon: AlertTriangle },
  } as Record<string, { bg: string; text: string; border: string; icon: typeof CheckCircle2 }>)[tipo] ?? { bg: "rgba(100,116,139,0.1)", text: "#94a3b8", border: "rgba(100,116,139,0.25)", icon: AlertTriangle };
  const Ico = conf.icon;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: "0.35rem",
      fontSize: "0.7rem", fontWeight: 700,
      background: conf.bg, color: conf.text, border: `1px solid ${conf.border}`,
      padding: "0.2rem 0.55rem", borderRadius: "9999px",
    }}>
      <Ico size={11} /> {tipo}
    </span>
  );
}

function TipoBadge({ tipo }: { tipo: "CP" | "CNP" }) {
  return (
    <span style={{
      fontSize: "0.62rem", fontWeight: 800,
      background: tipo === "CP" ? "rgba(59,130,246,0.12)" : "rgba(168,85,247,0.12)",
      color: tipo === "CP" ? "#60a5fa" : "#c084fc",
      border: `1px solid ${tipo === "CP" ? "rgba(59,130,246,0.25)" : "rgba(168,85,247,0.25)"}`,
      padding: "0.15rem 0.5rem", borderRadius: "0.25rem",
      letterSpacing: "0.06em",
    }}>
      {tipo}
    </span>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CanaisClient() {
  const [filtro, setFiltro] = useState<FiltroTipo>("Todos");
  const [expandido, setExpandido] = useState<string | null>(null);
  const [ordenar, setOrdenar] = useState<"risco" | "intercambio" | "nome">("risco");

  const canaisFiltrados = useMemo(() => {
    let lista = CANAIS.filter((c) =>
      filtro === "Todos" ? true : filtro === "CP" ? c.tipo === "CP" : c.tipo === "CNP" || c.grupo === "Tokenizado"
    );
    if (ordenar === "risco") lista = [...lista].sort((a, b) => a.riscoScore - b.riscoScore);
    if (ordenar === "intercambio") lista = [...lista].sort((a, b) => a.intercambioRelativo - b.intercambioRelativo);
    if (ordenar === "nome") lista = [...lista].sort((a, b) => a.nome.localeCompare(b.nome));
    return lista;
  }, [filtro, ordenar]);

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 1.5rem 6rem" }}>

      {/* ── Controles ── */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem" }}>
        {/* Filtro Tipo */}
        <div style={{ display: "flex", gap: "0.4rem" }}>
          {(["Todos", "CP", "CNP"] as FiltroTipo[]).map((f) => (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              style={{
                fontSize: "0.78rem", fontWeight: 700, padding: "0.45rem 1rem",
                borderRadius: "0.5rem",
                border: filtro === f ? (f === "CP" ? "1px solid rgba(59,130,246,0.5)" : f === "CNP" ? "1px solid rgba(168,85,247,0.5)" : "1px solid rgba(255,255,255,0.2)") : "1px solid rgba(255,255,255,0.07)",
                background: filtro === f ? (f === "CP" ? "rgba(59,130,246,0.12)" : f === "CNP" ? "rgba(168,85,247,0.12)" : "rgba(255,255,255,0.07)") : "rgba(255,255,255,0.03)",
                color: filtro === f ? (f === "CP" ? "#60a5fa" : f === "CNP" ? "#c084fc" : "#e2e8f0") : "#64748b",
                cursor: "pointer",
              }}
            >
              {f === "Todos" ? "Todos os Canais" : f === "CP" ? "Card-Present (CP)" : "Card-Not-Present (CNP)"}
            </button>
          ))}
        </div>
        {/* Ordenar */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ fontSize: "0.72rem", color: "#475569" }}>Ordenar:</span>
          {[{ k: "risco", l: "Risco" }, { k: "intercambio", l: "Intercâmbio" }, { k: "nome", l: "A-Z" }].map((o) => (
            <button
              key={o.k}
              onClick={() => setOrdenar(o.k as "risco" | "intercambio" | "nome")}
              style={{
                fontSize: "0.72rem", fontWeight: 600, padding: "0.3rem 0.65rem",
                borderRadius: "0.375rem",
                border: ordenar === o.k ? "1px solid rgba(99,102,241,0.4)" : "1px solid rgba(255,255,255,0.07)",
                background: ordenar === o.k ? "rgba(99,102,241,0.12)" : "rgba(255,255,255,0.03)",
                color: ordenar === o.k ? "#818cf8" : "#64748b",
                cursor: "pointer",
              }}
            >
              {o.l}
            </button>
          ))}
        </div>
      </div>

      {/* ── Legenda ── */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "1.5rem", marginBottom: "1.5rem", padding: "1rem 1.25rem", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "0.75rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <div style={{ display: "flex", gap: 3 }}>{[1,2,3,4,5].map(i => <div key={i} style={{ width: 10, height: 10, borderRadius: "0.2rem", background: "#22c55e" }} />)}</div>
          <span style={{ fontSize: "0.7rem", color: "#64748b" }}>← Risco Mínimo / Máximo →</span>
          <div style={{ display: "flex", gap: 3 }}>{[1,2,3,4,5].map(i => <div key={i} style={{ width: 10, height: 10, borderRadius: "0.2rem", background: "#ef4444" }} />)}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <div style={{ display: "flex", gap: 3 }}>{[1,2,3,4,5].map(i => <div key={i} style={{ width: 10, height: 10, borderRadius: "0.2rem", background: "#60a5fa" }} />)}</div>
          <span style={{ fontSize: "0.7rem", color: "#64748b" }}>← Intercâmbio Menor / Maior →</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <LiabilityBadge tipo="Emissor" />
          <LiabilityBadge tipo="Lojista" />
          <LiabilityBadge tipo="Compartilhado" />
        </div>
      </div>

      {/* ── Grade de cards ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
        {/* Header de colunas */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr 1fr 1.5fr 1fr",
          gap: "1rem",
          padding: "0.5rem 1.25rem",
          fontSize: "0.65rem", fontWeight: 700, color: "#334155",
          textTransform: "uppercase", letterSpacing: "0.08em",
        }}>
          <div>Canal</div>
          <div>Risco de Fraude</div>
          <div>Intercâmbio</div>
          <div>Liability (Fraude)</div>
          <div>DE 22 / ECI</div>
        </div>

        {canaisFiltrados.map((canal) => {
          const isExp = expandido === canal.id;
          return (
            <div
              key={canal.id}
              style={{
                background: isExp ? `rgba(${canal.cor === "#22c55e" ? "34,197,94" : canal.cor === "#ef4444" ? "239,68,68" : canal.cor === "#fbbf24" ? "251,191,36" : canal.cor === "#f97316" ? "249,115,22" : canal.cor === "#818cf8" ? "129,140,248" : "74,222,128"},0.03)` : "rgba(0,0,0,0.3)",
                border: `1px solid ${isExp ? canal.cor + "40" : "rgba(255,255,255,0.06)"}`,
                borderRadius: "0.875rem",
                overflow: "hidden",
                transition: "all 0.15s",
              }}
            >
              {/* Row principal */}
              <button
                onClick={() => setExpandido(isExp ? null : canal.id)}
                style={{
                  width: "100%", display: "grid",
                  gridTemplateColumns: "2fr 1fr 1fr 1.5fr 1fr",
                  gap: "1rem",
                  padding: "1rem 1.25rem",
                  background: "none", border: "none", cursor: "pointer",
                  alignItems: "center",
                  textAlign: "left",
                }}
              >
                {/* Nome */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: canal.cor, flexShrink: 0 }} />
                    <span style={{ fontSize: "0.88rem", fontWeight: 700, color: "#f1f5f9" }}>{canal.nome}</span>
                    <TipoBadge tipo={canal.tipo as "CP" | "CNP"} />
                  </div>
                  <span style={{ fontSize: "0.7rem", color: "#475569", paddingLeft: "1.1rem" }}>{canal.grupo}</span>
                </div>
                {/* Risco */}
                <div><RiscoBar score={canal.riscoScore} /></div>
                {/* Intercâmbio */}
                <div>
                  <IntercambioBar value={canal.intercambioRelativo} />
                  <span style={{ fontSize: "0.65rem", color: "#475569", marginTop: "0.25rem", display: "block" }}>{canal.intercambioLabel}</span>
                </div>
                {/* Liability */}
                <div><LiabilityBadge tipo={canal.liability} /></div>
                {/* DE22 / ECI */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                  <code style={{ fontSize: "0.7rem", color: "#94a3b8", background: "rgba(255,255,255,0.04)", padding: "0.1rem 0.35rem", borderRadius: "0.25rem", display: "inline-block" }}>
                    DE22: {canal.de22}
                  </code>
                  {canal.eci && (
                    <code style={{ fontSize: "0.7rem", color: "#818cf8", background: "rgba(99,102,241,0.08)", padding: "0.1rem 0.35rem", borderRadius: "0.25rem", display: "inline-block" }}>
                      ECI: {canal.eci}
                    </code>
                  )}
                </div>
              </button>

              {/* Detalhe expandido */}
              {isExp && (
                <div style={{
                  borderTop: "1px solid rgba(255,255,255,0.05)",
                  padding: "1.5rem 1.25rem",
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: "1.5rem",
                }} className="grid-cols-1 md:grid-cols-3">
                  {/* Liability detalhado */}
                  <div>
                    <div style={{ fontSize: "0.68rem", fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.625rem" }}>
                      <Shield size={11} style={{ display: "inline", marginRight: 4 }} />Liability Detalhado
                    </div>
                    <p style={{ fontSize: "0.8rem", color: "#64748b", lineHeight: 1.7 }}>{canal.liabilityCondicao}</p>

                    <div style={{ marginTop: "1rem" }}>
                      <div style={{ fontSize: "0.68rem", fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.5rem" }}>Autenticação</div>
                      {canal.autenticacao.map((a, i) => (
                        <div key={i} style={{ display: "flex", gap: "0.5rem", marginBottom: "0.3rem" }}>
                          <div style={{ width: 5, height: 5, borderRadius: "50%", background: canal.cor, flexShrink: 0, marginTop: 6 }} />
                          <span style={{ fontSize: "0.78rem", color: "#94a3b8" }}>{a}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Requisitos + Programas */}
                  <div>
                    <div style={{ fontSize: "0.68rem", fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.625rem" }}>Requisitos Técnicos</div>
                    {canal.requisitos.map((r, i) => (
                      <div key={i} style={{ display: "flex", gap: "0.5rem", marginBottom: "0.3rem" }}>
                        <CheckCircle2 size={12} style={{ color: "#475569", flexShrink: 0, marginTop: 3 }} />
                        <span style={{ fontSize: "0.78rem", color: "#94a3b8" }}>{r}</span>
                      </div>
                    ))}

                    {canal.programasRisco.length > 0 && (
                      <div style={{ marginTop: "1rem" }}>
                        <div style={{ fontSize: "0.68rem", fontWeight: 700, color: "#ef4444", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.5rem" }}>Programas de Risco Associados</div>
                        {canal.programasRisco.map((p) => (
                          <span key={p} style={{ display: "inline-block", fontSize: "0.7rem", fontWeight: 700, background: "rgba(239,68,68,0.1)", color: "#f87171", border: "1px solid rgba(239,68,68,0.2)", padding: "0.2rem 0.5rem", borderRadius: "0.25rem", marginRight: "0.35rem", marginBottom: "0.3rem" }}>
                            {p}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Alertas + Recomendação */}
                  <div>
                    <div style={{ fontSize: "0.68rem", fontWeight: 700, color: "#ca8a04", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.625rem" }}>
                      <AlertTriangle size={11} style={{ display: "inline", marginRight: 4 }} />Alertas
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1rem" }}>
                      {canal.alertas.map((a, i) => (
                        <div key={i} style={{ fontSize: "0.75rem", color: "#a16207", lineHeight: 1.6, background: "rgba(234,179,8,0.06)", border: "1px solid rgba(234,179,8,0.12)", borderRadius: "0.5rem", padding: "0.5rem 0.75rem" }}>
                          {a}
                        </div>
                      ))}
                    </div>

                    <div>
                      <div style={{ fontSize: "0.68rem", fontWeight: 700, color: "#34d399", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.375rem" }}>Recomendação</div>
                      <p style={{ fontSize: "0.78rem", color: "#4b5563", lineHeight: 1.65 }}>{canal.recomendacao}</p>
                    </div>

                    <div style={{ marginTop: "0.875rem", display: "flex", alignItems: "center", gap: "0.375rem" }}>
                      <Info size={11} style={{ color: "#4f46e5", flexShrink: 0 }} />
                      <span style={{ fontSize: "0.68rem", color: "#4f46e5", fontWeight: 600 }}>{canal.referencia}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── CTA Inferior ── */}
      <div style={{ marginTop: "3rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }} className="grid-cols-1 md:grid-cols-2">
        <Link href="/compliance/tokenizacao" style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: "rgba(139,92,246,0.07)", border: "1px solid rgba(139,92,246,0.2)",
          borderRadius: "0.875rem", padding: "1.25rem 1.5rem", textDecoration: "none",
        }}>
          <div>
            <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#a78bfa", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.25rem" }}>Playbook Completo</div>
            <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "#f1f5f9" }}>DAF & Tokenização</div>
            <div style={{ fontSize: "0.78rem", color: "#64748b" }}>Liability Shift, VTS, MDES</div>
          </div>
          <ArrowRight size={18} style={{ color: "#a78bfa" }} />
        </Link>
        <Link href="/jornada" style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: "rgba(16,185,129,0.07)", border: "1px solid rgba(16,185,129,0.2)",
          borderRadius: "0.875rem", padding: "1.25rem 1.5rem", textDecoration: "none",
        }}>
          <div>
            <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#34d399", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.25rem" }}>Mapa Interativo</div>
            <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "#f1f5f9" }}>Jornada da Transação</div>
            <div style={{ fontSize: "0.78rem", color: "#64748b" }}>8 fases do ciclo completo</div>
          </div>
          <ArrowRight size={18} style={{ color: "#34d399" }} />
        </Link>
      </div>
    </div>
  );
}
