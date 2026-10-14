import type {
  HealthResponse,
  VisaResult,
  McResult,
  VisaRule,
  McRule,
  SimForm,
  CalcResult,
} from "./types";
import provData from "@/data/provisionamento-rules.json";

// ─── Health & Reload ──────────────────────────────────────────────────────────
export async function fetchHealth(): Promise<HealthResponse> {
  const stats = (provData as any).stats || {};
  return {
    status: "ok",
    version: "2.5.0-deterministic",
    regras_mastercard: stats.mc_rules_count || 87,
    regras_maestro: stats.maestro_rules_count || 6,
    regras_visa: stats.visa_rules_count || 48,
    taxas_base: stats.base_rates_count || 103,
    loaded_at: Math.floor(Date.now() / 1000),
  };
}

export async function reloadTables(): Promise<HealthResponse> {
  return fetchHealth();
}

// ─── Regras ───────────────────────────────────────────────────────────────────
export async function fetchVisaRules(): Promise<{ total: number; regras: VisaRule[] }> {
  const rules = ((provData as any).visa_rules || []) as VisaRule[];
  return { total: rules.length, regras: rules };
}

export async function fetchMcRules(limit = 200): Promise<{ total: number; regras: McRule[] }> {
  const rules = ((provData as any).mc_rules || []).slice(0, limit) as McRule[];
  return { total: rules.length, regras: rules };
}

// ─── Helpers de mapeamento SimForm → Motor Determinístico ────────────────────
const CATEGORIA_TO_MCC: Record<string, number> = {
  supermercado: 5411,
  restaurante: 5812,
  combustivel: 5541,
  farmacia: 5912,
  educacao: 8299,
  governo: 9311,
  transporte: 4111,
  companhia_aerea: 4511,
  hotel: 7011,
  streaming: 4899,
  vestuario: 5651,
  eletronicos: 5732,
  atacado: 5300,
};

const VISA_PROD_TO_PID: Record<string, string> = {
  classic: "A",
  gold: "G",
  platinum: "P",
  signature: "S",
  infinite: "I^",
  empresarial: "K",
  corporativo: "C1",
  electron: "E",
};

const MC_TIER_MAP: Record<string, string> = {
  standard: "Consumer standard",
  gold: "Consumer gold",
  platinum: "Consumer platinum",
  black: "Consumer black",
  corporativo: "Commercial corporate",
  empresarial: "Commercial small business",
  debito: "Consumer standard",
};

// ─── Cálculo principal (100% interno via /api/admin/provisionamento) ─────────
export async function calcular(form: SimForm): Promise<CalcResult> {
  const valor = parseFloat(form.valor);
  if (isNaN(valor) || valor <= 0) throw new Error("Valor inválido");

  const mccResolved = form.mcc
    ? parseInt(form.mcc, 10)
    : form.categoria && CATEGORIA_TO_MCC[form.categoria]
    ? CATEGORIA_TO_MCC[form.categoria]
    : 5812;

  const parcelas = parseInt(form.parcelas, 10) || 1;

  if (form.bandeira === "visa") {
    const pid = VISA_PROD_TO_PID[form.produto_visa] || "P";
    const afs = form.afs === "debito" ? "D" : form.afs === "prepago" ? "P" : "C";
    let posEntryMode = "05";
    let eci = form.eci || "";

    if (form.canal_visa === "contactless" || form.canal_visa === "nfc") {
      posEntryMode = "07";
    } else if (form.canal_visa === "ecommerce_3ds") {
      posEntryMode = "81";
      if (!eci) eci = "05";
    } else if (form.canal_visa === "ecommerce_sem_3ds" || form.canal_visa === "ecommerce") {
      posEntryMode = "81";
      if (!eci) eci = "07";
    } else if (form.canal_visa === "recorrente" || form.canal_visa === "cof") {
      posEntryMode = "10";
      if (!eci) eci = "07";
    }

    const res = await fetch("/api/admin/provisionamento", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bandeira: "visa",
        valor,
        SETTL_FLAG: form.internacional ? "0" : "9",
        PID: pid,
        AFS: afs,
        ECI: eci,
        MCC: String(mccResolved),
        INST: parcelas,
        POS_ENTRY_MODE: posEntryMode,
        MANDATORY_DATA: "PRESENT",
        TIMELINESS: 0,
      }),
    });

    if (!res.ok) {
      throw new Error(`Erro ao calcular regra Visa (${res.status})`);
    }
    const data = await res.json();
    return {
      ...data,
      descriptor: data.descricao_regra || data.descriptor,
    } as VisaResult;
  }

  // Mastercard ou Maestro
  const isMaestro = form.bandeira === "maestro";
  const tier =
    form.pessoa === "juridica"
      ? "Commercial small business"
      : MC_TIER_MAP[form.tipo_cartao] || "Consumer platinum";

  let cardPresentId = 1;
  let paypassInd = 0;
  let ecsli = "";

  if (form.canal_mc === "contactless" || form.canal_mc === "nfc") {
    cardPresentId = 1;
    paypassInd = 1;
  } else if (form.canal_mc === "ecommerce_3ds") {
    cardPresentId = 0;
    paypassInd = 0;
    ecsli = "FRICTIONLESS";
  } else if (form.canal_mc === "ecommerce_sem_3ds" || form.canal_mc === "ecommerce") {
    cardPresentId = 0;
    paypassInd = 0;
    ecsli = "";
  }

  const res = await fetch("/api/admin/provisionamento", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      bandeira: isMaestro ? "maestro" : "mastercard",
      valor,
      pan: form.pan || "",
      PRODUCT_TYPE: isMaestro ? "DEBIT" : form.tipo_produto || "CREDIT",
      CARD_PROGRAM_ID: isMaestro ? "MSI" : undefined,
      tier,
      CARD_PRESENT_ID: cardPresentId,
      PAYPASS_IND: paypassInd,
      ECSLI: ecsli,
      MCC: mccResolved,
      INSTALLMENTS: parcelas,
      DOCUMENT_TYPE: form.pessoa === "juridica" ? 1 : 2,
      ACQR_COUNTRY_CODE: 76,
      ISSR_COUNTRY_CODE: form.internacional ? 840 : 76,
    }),
  });

  if (!res.ok) {
    throw new Error(`Erro ao calcular regra ${form.bandeira} (${res.status})`);
  }
  const data = await res.json();
  return data as McResult;
}

// ─── MCBS (Grupos de Service IDs Reais para /mcbs) ───────────────────────────
const MCBS_SERVICE_GROUPS = [
  {
    id: "AA / AB",
    label: "Autorização Doméstica, Tokenização & 3DS (Banknet)",
    quem: "Adquirente & Emissor",
    coleta: "Semanal via IPM 1740",
    color: "#3b82f6",
    bg: "rgba(59,130,246,0.08)",
    border: "rgba(59,130,246,0.25)",
    icon: "Zap",
    desc: "Eventos de processamento de autorização na Banknet (MTI 0100/0110), escalonados em 5 faixas de valor em BRL, validação de criptograma 3DS (CAVV/AAV) e mapeamento de tokens MDES.",
    eventos: [
      { code: "2AB1006A", nome: "Auth Processing Tier 1 (até BRL 15,00)", valor: "BRL 0,0272", unidade: "por transação", obs: "Crédito/Débito doméstico" },
      { code: "2AB1006B", nome: "Auth Processing Tier 2 (BRL 15,01 a 35,00)", valor: "BRL 0,0465", unidade: "por transação", obs: "Crédito/Débito doméstico" },
      { code: "2AB1006C", nome: "Auth Processing Tier 3 (BRL 35,01 a 60,00)", valor: "BRL 0,0680", unidade: "por transação", obs: "Crédito/Débito doméstico" },
      { code: "2AB1006D", nome: "Auth Processing Tier 4 (BRL 60,01 a 90,00)", valor: "BRL 0,0910", unidade: "por transação", obs: "Crédito/Débito doméstico" },
      { code: "2AB1006E", nome: "Auth Processing Tier 5 (acima de BRL 90,00)", valor: "BRL 0,1170", unidade: "por transação", obs: "Teto de faixa auth doméstica" },
      { code: "2AB1790", nome: "Identity Check (3DS) CAVV Validation", valor: "BRL 0,0155", unidade: "por autenticação", obs: "Cobrado por validação AAV/CAVV" },
      { code: "2AB1706", nome: "MDES Contactless Token Mapping (NFC)", valor: "BRL 0,0190", unidade: "por txn NFC", obs: "Tradução DPAN → FPAN na Banknet" },
      { code: "2AB2600", nome: "MDES Lite / Card-on-File Token Transaction", valor: "0,02% (0.0002/BRL)", unidade: "sobre volume BRL", obs: "Recorrência e COF tokenizado" },
    ],
  },
  {
    id: "AN",
    label: "Integridade da Rede, E-Commerce Sem 3DS & Retentativas",
    quem: "Adquirente",
    coleta: "Semanal / Mensal via IPM 1740",
    color: "#ef4444",
    bg: "rgba(239,68,68,0.08)",
    border: "rgba(239,68,68,0.25)",
    icon: "AlertTriangle",
    desc: "Penalidades e tarifas sobre transações Card-Not-Present (CNP) não autenticadas, excesso de retentativas em Category 1/3 declines e Account Testing.",
    eventos: [
      { code: "2AB3006M", nome: "CNP Unauthenticated Transaction Fee (Sem 3DS)", valor: "0,029% (cap BRL 12,00)", unidade: "sobre valor da txn", obs: "Incide quando ECI/UCAF não autenticado" },
      { code: "2AN3500", nome: "Transaction Processing Excellence (Excessive Retry)", valor: "BRL 0,35 a 1,45", unidade: "por retentativa excedente", obs: ">15 tentativas em 30 dias no mesmo PAN" },
      { code: "2AN3100", nome: "Nominal Amount Authorization Integrity ($0 / ZDA)", valor: "BRL 0,1250", unidade: "por verificação falha", obs: "Uso incorreto de Account Verification" },
    ],
  },
  {
    id: "AV / BU",
    label: "Serviços de Conta, AVS & Automated Billing Updater (ABU)",
    quem: "Emissor & Adquirente",
    coleta: "Mensal via MCBS",
    color: "#8b5cf6",
    bg: "rgba(139,92,246,0.08)",
    border: "rgba(139,92,246,0.25)",
    icon: "RefreshCw",
    desc: "Atualização automática de cartões expirados ou substituídos (ABU) para evitar declínio em recorrência e consultas de verificação de endereço (AVS).",
    eventos: [
      { code: "2BU6600", nome: "ABU Account Update — Issuer Match Fee", valor: "BRL 0,0464", unidade: "por registro (mín. BRL 4.400/mês)", obs: "Atualização de credencial COF" },
      { code: "2BU6610", nome: "ABU Acquirer Inquiry Match", valor: "BRL 0,0950", unidade: "por conta atualizada", obs: "Cobrado do adquirente/subcredenciador" },
      { code: "2AV3006", nome: "Address Verification Service (AVS) Doméstico", valor: "BRL 0,0287", unidade: "por consulta", obs: "Cross-border: BRL 0,1913" },
    ],
  },
  {
    id: "CF",
    label: "Conectividade MIP, Tráfego GCMS & File Transfer",
    quem: "Participante Principal (ICA)",
    coleta: "Semanal / Mensal via IPM 1740",
    color: "#10b981",
    bg: "rgba(16,185,129,0.08)",
    border: "rgba(16,185,129,0.25)",
    icon: "Wifi",
    desc: "Tarifação por volume de bytes transmitidos nos arquivos de clearing IPM (T112/T113), tabelas de parâmetros MPE (T067/T068) e portas MIP.",
    eventos: [
      { code: "2CF1001", nome: "GCMS File Transmission (Clearing Bytes)", valor: "BRL 0,0000143", unidade: "por byte (mín. BRL 1.375/sem)", obs: "7 faixas regressivas por volume" },
      { code: "2CF2001", nome: "MPE Parameter Extract Distribution (T068)", valor: "BRL 1.850,00", unidade: "mensal por endpoint", obs: "Distribuição diária/full de BINs" },
    ],
  },
  {
    id: "C2 / A8",
    label: "Disputas (Chargebacks MCOM) & Compliance Regulatório (AML/PF)",
    quem: "Adquirente & Emissor",
    coleta: "Mensal / Anual via MCBS",
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.08)",
    border: "rgba(245,158,11,0.25)",
    icon: "Shield",
    desc: "Processamento de First Chargeback (MTI 1442), Second Presentment (MTI 1240), arbitragem MasterCom, registro de Subcredenciadores (PayFac) e AML.",
    eventos: [
      { code: "2CI201716", nome: "MasterCom Dispute Processing (Chargeback / Reapresentação)", valor: "BRL 114,74", unidade: "por item disputado", obs: "Incide na abertura e reapresentação" },
      { code: "2PF0100", nome: "Payment Facilitator (Subcredenciador) Annual Registration", valor: "USD 500,00", unidade: "anual por Subcredenciador", obs: "Convertido pela taxa QMR vigente" },
      { code: "2A81000S", nome: "AML / ACAMS Risk Assessment Compliance", valor: "BRL 16.000,00", unidade: "anual (Principal Member)", obs: "Affiliate Member: BRL 7.200/ano" },
    ],
  },
];

export async function fetchMcbsFees(): Promise<{ grupos: typeof MCBS_SERVICE_GROUPS }> {
  return { grupos: MCBS_SERVICE_GROUPS };
}
