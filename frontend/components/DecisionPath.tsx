"use client";

import Link from "next/link";
import type { CalcResult, SimForm } from "@/lib/types";
import { ArrowRight, Package, Radio, ShieldCheck, Tag, Landmark, ExternalLink } from "lucide-react";

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface Step {
  number: number;
  title: string;
  icon: React.ElementType;
  value: string;          // valor principal (ex: "Platinum (N^)")
  tag: string;            // rótulo de impacto (ex: "Premium", "Subsidiado")
  tagColor: string;       // cor do badge
  detail: string;         // uma frase explicativa
  fieldRef: string;       // referência ao campo técnico
}

// ─── Mapeamentos ──────────────────────────────────────────────────────────────

// ── Visa ──
const VISA_PRODUTO: Record<string, { label: string; tag: string; tagColor: string; detail: string }> = {
  classic:   { label: "Classic (F^)",             tag: "Tier base",      tagColor: "#3b82f6", detail: "Produto padrão — menor custo de intercâmbio da linha Visa." },
  gold:      { label: "Gold (P^)",                tag: "Intermediário",  tagColor: "#8b5cf6", detail: "Benefícios moderados — intercâmbio acima do Classic." },
  platinum:  { label: "Platinum (N^)",            tag: "Premium",        tagColor: "#a855f7", detail: "Milhas e benefícios elevados — emissor precisa cobrir o custo." },
  infinite:  { label: "Infinite (I^)",            tag: "Ultra premium",  tagColor: "#ef4444", detail: "Tier máximo Visa — maior intercâmbio da carteira consumer." },
  hnw:       { label: "Infinite Privilege (I1)",  tag: "Ultra premium",  tagColor: "#ef4444", detail: "High-net-worth — programa exclusivo, intercâmbio máximo." },
  signature: { label: "Signature (C^)",           tag: "Alto benefício", tagColor: "#f59e0b", detail: "Visa Signature — acima do Platinum, logo abaixo do Infinite." },
  electron:  { label: "Electron (L^)",            tag: "Pré-pago",       tagColor: "#10b981", detail: "Débito pré-pago — intercâmbio mais baixo da linha." },
  business:  { label: "Business (K^)",            tag: "Corporativo",    tagColor: "#f59e0b", detail: "Cartão de empresa — tabela commercial separada da consumer." },
  corporate: { label: "Corporate (S^)",           tag: "Corporativo",    tagColor: "#f59e0b", detail: "Visa Corporate — gestão de despesas B2B, tabela própria." },
  b2b:       { label: "B2B Virtual (X^)",         tag: "B2B",            tagColor: "#06b6d4", detail: "Cartão virtual para pagamentos B2B — tier de pagamento corporativo." },
  bndes:     { label: "BNDES (S6)",               tag: "Governo",        tagColor: "#10b981", detail: "Programa BNDES — intercâmbio subsidiado por política pública." },
  vale:      { label: "Vale Alim./Ref. (J3)",     tag: "Benefício",      tagColor: "#10b981", detail: "Vale alimentação/refeição — tabela regulada por legislação trabalhista." },
  agro:      { label: "Visa Agro (S4)",           tag: "Especializado",  tagColor: "#22c55e", detail: "Cartão agrícola — tabela diferenciada para o setor primário." },
};

// ── Mastercard ──
const MC_PRODUTO: Record<string, { label: string; tag: string; tagColor: string; detail: string }> = {
  standard: { label: "Standard (101)",         tag: "Tier base",      tagColor: "#3b82f6", detail: "Produto base MC — tabela de intercâmbio consumer padrão." },
  gold:     { label: "Gold / Enhanced (102)",  tag: "Intermediário",  tagColor: "#8b5cf6", detail: "Enhanced benefits — intercâmbio acima do Standard." },
  platinum: { label: "World / Platinum (103)", tag: "Premium",        tagColor: "#a855f7", detail: "Mastercard World — programa de benefícios premium." },
  black:    { label: "World Elite (104)",      tag: "Ultra premium",  tagColor: "#ef4444", detail: "Tier máximo MC — maior intercâmbio da linha consumer." },
};

// ── Visa Canais ──
const VISA_CANAL: Record<string, { label: string; tag: string; tagColor: string; detail: string; auth: string }> = {
  fisico:        { label: "Chip & PIN",             tag: "Presencial seguro",   tagColor: "#10b981", detail: "DE 22=05 — EMV chip validado, risco mínimo de fraude.",          auth: "Chip EMV (ARQC)" },
  contactless:   { label: "Contactless NFC",        tag: "Equivalente ao chip", tagColor: "#10b981", detail: "DE 22=07 — iCVV gerado pelo chip, equivalente à inserção.",       auth: "iCVV Contactless" },
  ecommerce:     { label: "E-commerce s/ 3DS",      tag: "Risco do adquirente", tagColor: "#ef4444", detail: "DE 22=81 — sem autenticação, liability do lojista/adquirente.",   auth: "ECI 07 (sem auth)" },
  ecommerce_3ds: { label: "E-com + Visa Secure",    tag: "Liability shift",     tagColor: "#3b82f6", detail: "DE 22=81 + ECI 05 — CAVV em Field 126.9, risco passa ao emissor.", auth: "ECI 05 + CAVV" },
};

// ── MC Canais ──
const MC_CANAL: Record<string, { label: string; tag: string; tagColor: string; detail: string; auth: string }> = {
  fisico:        { label: "Chip & PIN",               tag: "Presencial seguro",   tagColor: "#10b981", detail: "DE 22=05 — EMV chip, menor taxa de fraude e intercâmbio.",           auth: "Chip EMV (ARQC)" },
  contactless:   { label: "Contactless NFC",          tag: "Equivalente ao chip", tagColor: "#10b981", detail: "DE 22=07 — iCVV via chip, equivalente ao chip na maioria das regras.", auth: "iCVV NFC" },
  ecommerce:     { label: "E-commerce s/ SecureCode", tag: "Risco do adquirente", tagColor: "#ef4444", detail: "Sem AAV — DE 48.42 vazio, liability no adquirente.",                  auth: "Sem SecureCode" },
  ecommerce_3ds: { label: "E-com + SecureCode",       tag: "Liability shift",     tagColor: "#3b82f6", detail: "AAV presente em DE 48.42 — risco transferido ao emissor.",             auth: "AAV (DE 48.42/43)" },
  qr:            { label: "QR Code",                  tag: "Digital",             tagColor: "#06b6d4", detail: "Pagamento por QR — tabela de aceitação digital.",                     auth: "QR token" },
};

// ── Categorias MCC ──
const CAT_MCC: Record<string, { label: string; tag: string; tagColor: string; detail: string }> = {
  restaurante: { label: "Restaurante (5812)",        tag: "Tier padrão",     tagColor: "#64748b", detail: "Alimentação fora de casa — sem benefício regulatório especial." },
  lanchonete:  { label: "Lanchonete (5814)",         tag: "Tier padrão",     tagColor: "#64748b", detail: "Fast food — mesma tabela base do segmento alimentação." },
  supermercado:{ label: "Supermercado (5411)",       tag: "Tier subsidiado", tagColor: "#10b981", detail: "Margens estreitas — Bandeiras e BACEN aplicam tier especial." },
  atacado:     { label: "Atacado (5300)",            tag: "Subsidiado",      tagColor: "#10b981", detail: "Atacarejo — similar ao supermercado, intercâmbio reduzido." },
  farmacia:    { label: "Farmácia (5912)",           tag: "Saúde",           tagColor: "#06b6d4", detail: "Segmento de saúde — tabela própria em algumas redes." },
  posto:       { label: "Combustível (5541/5542)",   tag: "Tier especial",   tagColor: "#22c55e", detail: "Margens de centavos — intercâmbio especial por resolução BACEN." },
  educacao:    { label: "Educação (8299)",           tag: "Subsidiado",      tagColor: "#10b981", detail: "Mensalidades e cursos — tier educacional diferenciado." },
  saude:       { label: "Saúde / Médico (8099)",     tag: "Saúde",           tagColor: "#06b6d4", detail: "Consultas e procedimentos — tabela saúde." },
  hotel:       { label: "Hotel/Hospedagem (7011)",   tag: "Viagens",         tagColor: "#f59e0b", detail: "Segmento de travel — pode ter tier premium em cartões travel." },
  transporte:  { label: "Transporte Público (4111)", tag: "Subsidiado",      tagColor: "#10b981", detail: "Modal público — intercâmbio reduzido por política de inclusão." },
  governo:     { label: "Governo (9311)",            tag: "Setor público",   tagColor: "#8b5cf6", detail: "Taxas governamentais — tabela especial para pagamentos públicos." },
  vestuario:   { label: "Vestuário (5621)",          tag: "Varejo",          tagColor: "#64748b", detail: "Moda e vestuário — tier de varejo padrão." },
  eletronico:  { label: "Eletrônico (5732)",         tag: "Varejo",          tagColor: "#64748b", detail: "Eletrônicos — varejo padrão, sem tratamento especial." },
};

// ─── Função construtora de steps ─────────────────────────────────────────────

function buildSteps(form: SimForm, result: CalcResult): Step[] {
  const isVisa = form.bandeira === "visa";

  // ── Step 1: Produto ──────────────────────────────────────────────────────
  const produtoKey = isVisa ? form.produto_visa : form.tipo_cartao;
  const produtoMap = isVisa ? VISA_PRODUTO : MC_PRODUTO;
  const prodInfo = produtoMap[produtoKey] ?? {
    label: produtoKey,
    tag: "Desconhecido",
    tagColor: "#64748b",
    detail: "Produto não identificado na tabela de mapeamento.",
  };
  const prodFieldRef = isVisa
    ? "Field 61.5 — AFS (Visa BASE II)"
    : "DE 63 Tag 2 — Product Code (MC IPM)";

  // ── Step 2: Canal ────────────────────────────────────────────────────────
  const canalKey = isVisa ? form.canal_visa : form.canal_mc;
  const canalMap = isVisa ? VISA_CANAL : MC_CANAL;
  const canalInfo = canalMap[canalKey] ?? {
    label: canalKey,
    tag: "Canal não mapeado",
    tagColor: "#64748b",
    detail: "Canal de captura não identificado.",
    auth: "N/D",
  };
  const canalFieldRef = isVisa
    ? "DE 22 — POS Entry Mode (ISO 8583)"
    : "DE 22 — POS Entry Mode (ISO 8583)";

  // ── Step 3: Autenticação ─────────────────────────────────────────────────
  const authValue = canalInfo.auth;
  const is3DS = canalKey === "ecommerce_3ds";
  const isChip = canalKey === "fisico" || canalKey === "contactless";
  const authTag = is3DS
    ? "Liability shift"
    : isChip
    ? "Chip verificado"
    : "Sem autenticação";
  const authTagColor = is3DS ? "#3b82f6" : isChip ? "#10b981" : "#ef4444";
  const authDetail = is3DS
    ? isVisa
      ? "ECI 05 + CAVV em Field 126.9 — emissor absorve fraude aprovada."
      : "AAV em DE 48.42/43 — emissor absorve fraude aprovada."
    : isChip
    ? "Chip EMV valida o portador fisicamente — risco residual mínimo."
    : isVisa
    ? "ECI 07 — sem CAVV, adquirente arca com chargebacks de fraude."
    : "Sem AAV — adquirente/lojista respondem por chargebacks de fraude.";
  const authFieldRef = isVisa
    ? is3DS ? "Field 126.9 — CAVV (Visa BASE II)" : "Field 61 — POS Data Code"
    : is3DS ? "DE 48.42 — ECI / DE 48.43 — AAV (MC IPM)" : "DE 22 — POS Entry Mode";

  // ── Step 4: MCC / Segmento ───────────────────────────────────────────────
  const catKey = form.categoria;
  const mccManual = form.mcc;
  const catInfo = catKey && CAT_MCC[catKey]
    ? CAT_MCC[catKey]
    : mccManual
    ? { label: `MCC ${mccManual}`, tag: "Tier direto", tagColor: "#64748b", detail: `MCC ${mccManual} informado manualmente — regra aplicada diretamente.` }
    : { label: "Sem MCC / padrão", tag: "Geral", tagColor: "#475569", detail: "Nenhuma categoria especial — tabela de intercâmbio geral aplicada." };
  const mccFieldRef = "DE 18 — MCC (ISO 8583)";

  // ── Step 5: Status Regulatório ───────────────────────────────────────────
  const rate = result.rate_pct ?? 0;
  const capAplicado = result.cap_aplicado;
  const isRegulado = capAplicado || rate <= 0.5;
  const regTag = isRegulado ? "Regulado BACEN" : "Não regulado";
  const regColor = isRegulado ? "#10b981" : "#64748b";
  const regDetail = isRegulado
    ? `BACEN Circular 3.887/2018 — cap de 0,50% para emissores regulados. SETTL_FLAG ativo no ${isVisa ? "Field 61" : "DE 63 Tag 5"}.`
    : "Emissor não regulado pelo BACEN — tabela privada da Bandeira sem cap de 0,50%.";
  const regFieldRef = isVisa
    ? "Field 61 — SETTL_FLAG (Visa)"
    : "DE 63 Tag 5 — Settlement flag (MC IPM)";

  return [
    {
      number: 1,
      title: "Produto",
      icon: Package,
      value: prodInfo.label,
      tag: prodInfo.tag,
      tagColor: prodInfo.tagColor,
      detail: prodInfo.detail,
      fieldRef: prodFieldRef,
    },
    {
      number: 2,
      title: "Canal",
      icon: Radio,
      value: canalInfo.label,
      tag: canalInfo.tag,
      tagColor: canalInfo.tagColor,
      detail: canalInfo.detail,
      fieldRef: canalFieldRef,
    },
    {
      number: 3,
      title: "Autenticação",
      icon: ShieldCheck,
      value: authValue,
      tag: authTag,
      tagColor: authTagColor,
      detail: authDetail,
      fieldRef: authFieldRef,
    },
    {
      number: 4,
      title: "MCC / Segmento",
      icon: Tag,
      value: catInfo.label,
      tag: catInfo.tag,
      tagColor: catInfo.tagColor,
      detail: catInfo.detail,
      fieldRef: mccFieldRef,
    },
    {
      number: 5,
      title: "Regulatório",
      icon: Landmark,
      value: isRegulado ? "BACEN 3.887/2018" : "Tabela privada",
      tag: regTag,
      tagColor: regColor,
      detail: regDetail,
      fieldRef: regFieldRef,
    },
  ];
}

// ─── Componente ───────────────────────────────────────────────────────────────

interface Props {
  form: SimForm;
  result: CalcResult;
}

export function DecisionPath({ form, result }: Props) {
  if (!result.sucesso) return null;

  const steps = buildSteps(form, result);
  const rate = result.rate_pct ?? 0;
  const isVisa = form.bandeira === "visa";
  const ruleId = isVisa
    ? (result as { rule_id?: string }).rule_id
    : (result as { ird?: string }).ird;

  return (
    <div
      style={{
        background: "#0d1117",
        border: "1px solid #1e293b",
        borderRadius: "0.875rem",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "1rem 1.25rem",
          borderBottom: "1px solid #1e293b",
          background: "rgba(59,130,246,0.04)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "0.5rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
          <div
            style={{
              width: 28, height: 28,
              borderRadius: "0.5rem",
              background: "rgba(59,130,246,0.12)",
              border: "1px solid rgba(59,130,246,0.25)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <span style={{ fontSize: "0.75rem" }}>🔍</span>
          </div>
          <div>
            <p style={{ fontSize: "0.8rem", fontWeight: 700, color: "#f1f5f9", lineHeight: 1 }}>
              Por que esta taxa?
            </p>
            <p style={{ fontSize: "0.68rem", color: "#475569", marginTop: "0.2rem" }}>
              Caminho de decisão de 5 passos da cascata de intercâmbio
            </p>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          {ruleId && (
            <code
              style={{
                fontSize: "0.68rem",
                background: "rgba(59,130,246,0.1)",
                border: "1px solid rgba(59,130,246,0.2)",
                color: "#93c5fd",
                padding: "0.2rem 0.5rem",
                borderRadius: "0.3rem",
                fontWeight: 700,
              }}
            >
              {ruleId}
            </code>
          )}
          <Link
            href="/matrix"
            style={{
              display: "flex", alignItems: "center", gap: "0.3rem",
              fontSize: "0.68rem", color: "#475569", textDecoration: "none",
            }}
            className="hover:text-slate-300 transition-colors"
          >
            Ver Matriz <ExternalLink size={10} />
          </Link>
        </div>
      </div>

      {/* Steps */}
      <div style={{ padding: "1.25rem" }}>
        {/* Desktop: horizontal */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "0",
            overflowX: "auto",
            paddingBottom: "0.25rem",
          }}
          className="hidden lg:flex"
        >
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isLast = idx === steps.length - 1;
            return (
              <div key={step.number} style={{ display: "flex", alignItems: "flex-start", flexShrink: 0 }}>
                {/* Step card */}
                <div
                  style={{
                    width: 168,
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid #1e293b",
                    borderRadius: "0.75rem",
                    padding: "0.875rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5rem",
                  }}
                >
                  {/* Number + icon */}
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <div
                      style={{
                        width: 22, height: 22,
                        borderRadius: "50%",
                        background: `${step.tagColor}18`,
                        border: `1px solid ${step.tagColor}40`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <span style={{ fontSize: "0.6rem", fontWeight: 800, color: step.tagColor }}>
                        {step.number}
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                      <Icon size={11} style={{ color: "#475569" }} />
                      <span style={{ fontSize: "0.62rem", fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                        {step.title}
                      </span>
                    </div>
                  </div>

                  {/* Value */}
                  <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "#e2e8f0", lineHeight: 1.25 }}>
                    {step.value}
                  </p>

                  {/* Tag */}
                  <span
                    style={{
                      display: "inline-block",
                      fontSize: "0.6rem",
                      fontWeight: 700,
                      color: step.tagColor,
                      background: `${step.tagColor}12`,
                      border: `1px solid ${step.tagColor}30`,
                      padding: "0.15rem 0.45rem",
                      borderRadius: "9999px",
                      width: "fit-content",
                    }}
                  >
                    {step.tag}
                  </span>

                  {/* Detail */}
                  <p style={{ fontSize: "0.63rem", color: "#475569", lineHeight: 1.55 }}>
                    {step.detail}
                  </p>

                  {/* Field ref */}
                  <code style={{ fontSize: "0.55rem", color: "#334155", lineHeight: 1.4 }}>
                    {step.fieldRef}
                  </code>
                </div>

                {/* Arrow connector */}
                {!isLast && (
                  <div
                    style={{
                      display: "flex", alignItems: "center",
                      paddingTop: "1.5rem",
                      margin: "0 4px",
                    }}
                  >
                    <ArrowRight size={14} style={{ color: "#1e293b" }} />
                  </div>
                )}
              </div>
            );
          })}

          {/* Final: Rate badge */}
          <div style={{ display: "flex", alignItems: "flex-start" }}>
            <div
              style={{
                margin: "0 4px",
                display: "flex", alignItems: "center",
                paddingTop: "1.5rem",
              }}
            >
              <ArrowRight size={14} style={{ color: "#1e293b" }} />
            </div>
            <div
              style={{
                width: 110,
                background: "rgba(16,185,129,0.06)",
                border: "1px solid rgba(16,185,129,0.25)",
                borderRadius: "0.75rem",
                padding: "0.875rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.375rem",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
              }}
            >
              <span style={{ fontSize: "0.6rem", fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Intercâmbio
              </span>
              <span style={{ fontSize: "1.5rem", fontWeight: 800, color: "#4ade80", lineHeight: 1 }}>
                {rate.toFixed(4)}%
              </span>
              <span style={{ fontSize: "0.6rem", color: "#34d399" }}>
                {form.bandeira.toUpperCase()} · {ruleId ?? "—"}
              </span>
            </div>
          </div>
        </div>

        {/* Mobile: vertical list */}
        <div className="flex flex-col gap-3 lg:hidden">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid #1e293b",
                  borderRadius: "0.75rem",
                  padding: "0.875rem",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", marginBottom: "0.5rem" }}>
                  <div
                    style={{
                      width: 24, height: 24,
                      borderRadius: "50%",
                      background: `${step.tagColor}18`,
                      border: `1px solid ${step.tagColor}40`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <span style={{ fontSize: "0.65rem", fontWeight: 800, color: step.tagColor }}>{step.number}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                    <Icon size={12} style={{ color: "#475569" }} />
                    <span style={{ fontSize: "0.65rem", fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.06em" }}>{step.title}</span>
                  </div>
                  <span
                    style={{
                      marginLeft: "auto",
                      fontSize: "0.6rem", fontWeight: 700, color: step.tagColor,
                      background: `${step.tagColor}12`, border: `1px solid ${step.tagColor}30`,
                      padding: "0.1rem 0.4rem", borderRadius: "9999px",
                    }}
                  >
                    {step.tag}
                  </span>
                </div>
                <p style={{ fontSize: "0.78rem", fontWeight: 700, color: "#e2e8f0", marginBottom: "0.25rem" }}>{step.value}</p>
                <p style={{ fontSize: "0.7rem", color: "#64748b", lineHeight: 1.5, marginBottom: "0.25rem" }}>{step.detail}</p>
                <code style={{ fontSize: "0.6rem", color: "#334155" }}>{step.fieldRef}</code>
              </div>
            );
          })}

          {/* Rate */}
          <div
            style={{
              background: "rgba(16,185,129,0.06)",
              border: "1px solid rgba(16,185,129,0.25)",
              borderRadius: "0.75rem",
              padding: "1rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span style={{ fontSize: "0.75rem", color: "#34d399" }}>Intercâmbio calculado</span>
            <span style={{ fontSize: "1.5rem", fontWeight: 800, color: "#4ade80" }}>{rate.toFixed(4)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
