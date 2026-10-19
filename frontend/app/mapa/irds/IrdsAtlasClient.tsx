"use client";

import React, { useState, useMemo, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Network,
  Table2,
  Database,
  Tag,
  FileText,
  Download,
  Calculator,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Layers,
  Sparkles,
  ExternalLink,
  Filter,
} from "lucide-react";
import mastercardInterchange from "@/data/mastercard-interchange.json";
import tabelasFees from "@/data/tabelas-intercambio-fees.json";
import gcmsTables from "@/data/gcms-tables.json";
import t068Forense from "@/data/mpe-t068-forense.json";
import downgradeRules from "@/data/downgrade-rules.json";
import { sendToDocStudio } from "@/lib/docStudioBridge";

// ─── Tipos de Dados ──────────────────────────────────────────────────────────

type IntercambioRow = (typeof tabelasFees.intercambio)[number];
type GcmsTableItem = (typeof gcmsTables)[number];

interface IrdGraphNode {
  id: string;
  code: string;
  label: string;
  sublabel: string;
  lane: 1 | 2 | 3 | 4 | 5;
  x: number;
  y: number;
  brand: "Mastercard" | "Visa" | "Elo" | "Todas";
  kind: "gatilho" | "gcms_table" | "ird_mc" | "fpi_visa" | "output";
  risk: "baixo" | "medio" | "alto" | "critico";
  typicalRate: string;
  isoTrigger: string;
  gcmsRef: string;
  description: string;
  filterToken?: string;
}

interface IrdGraphEdge {
  id: string;
  from: string;
  to: string;
  label: string;
  condition: string;
  kind: "qualificado" | "padrao" | "downgrade" | "lookup";
  brand: "Mastercard" | "Visa" | "Elo" | "Todas";
}

// ─── Nós do Grafo de Qualificação de IRDs, FPIs e Tabelas GCMS ───────────────

const IRD_GRAPH_NODES: IrdGraphNode[] = [
  // Coluna 1: Gatilhos na Mensagem ISO 8583 / Clearing
  {
    id: "G_BIN",
    code: "DE 02 / BIN",
    label: "BIN, Account Range & PID",
    sublabel: "Funding (Créd/Déb/Pré) + Tier",
    lane: 1,
    x: 120,
    y: 120,
    brand: "Todas",
    kind: "gatilho",
    risk: "baixo",
    typicalRate: "0,50% a 2,45%",
    isoTrigger: "DE 02 (PAN/DPAN 6-11 dígitos) · Visa PID (F^, P^, N^, C^, I^, I1^)",
    gcmsRef: "IP0030T1 (Account Range) · IP0091T1 (Card Program)",
    description:
      "Identifica a origem do plástico (Doméstico vs. Cross-Border LAC/Global), a fonte de funding (Débito Teto 0,50%, Pré-Pago Teto 0,70%, Crédito Livre) e a variante (Standard/Classic vs. Black/Infinite).",
  },
  {
    id: "G_POS",
    code: "DE 22 + DE 61",
    label: "Modo de Entrada & Captura",
    sublabel: "Chip 05 · NFC 07 · E-com 81 · Dig 01",
    lane: 1,
    x: 120,
    y: 260,
    brand: "Todas",
    kind: "gatilho",
    risk: "medio",
    typicalRate: "Define trilha CP vs. CNP",
    isoTrigger: "DE 22 (POS Entry Mode 051/071/810/010) + DE 61 (POS Data)",
    gcmsRef: "IP0006T1 (Data Element Features) · T164",
    description:
      "Separa o mundo Card Present (Chip EMV 05 e Contactless NFC 07, que acionam IRDs IA/JA/VF/VG) do mundo Card Not Present (E-commerce/CoF 81 e Digitado/Fallback 01).",
  },
  {
    id: "G_3DS",
    code: "DE 48 / ECI / DE 55",
    label: "Prova Criptográfica (3DS / ARQC)",
    sublabel: "SLI 212 / ECI 05 vs. ECI 07",
    lane: 1,
    x: 120,
    y: 400,
    brand: "Todas",
    kind: "gatilho",
    risk: "alto",
    typicalRate: "Economia de 15 a 50 bps",
    isoTrigger: "DE 48 SE 42 (SLI 212/211 vs 210) · DE 48 SE 43 (AAV) · Visa Pos 60.8 (ECI 05/07) · DE 55 (ARQC)",
    gcmsRef: "IP0007T1 (Subfield Features) · T160",
    description:
      "No E-commerce, a presença de 3DS 2.2 autenticado (SLI 212 / ECI 02 ou ECI 05) qualifica a transação para IRD AU/AV/AW (reduzido) e transfere o risco de fraude (Liability Shift) ao Emissor.",
  },
  {
    id: "G_MCC",
    code: "DE 18 / MCC",
    label: "MCC & Segmento Econômico",
    sublabel: "SprMkt · GovSvc · GenEx · CommT",
    lane: 1,
    x: 120,
    y: 540,
    brand: "Todas",
    kind: "gatilho",
    risk: "baixo",
    typicalRate: "0,30% a 2,35%",
    isoTrigger: "DE 18 (Merchant Type / MCC 4 dígitos) · PDS 0176 (Submerchant)",
    gcmsRef: "T161 (Interchange Program Group) · Visa Tabela 5-3",
    description:
      "Mapeia o código de atividade do lojista (ex: 5411 Supermercados, 4111 Transporte, 4814 Telecom, 9399 Governo) para tabelas incentivadas ou tetos fixos (Cap).",
  },
  {
    id: "G_PARC",
    code: "PDS 0191 / D+1",
    label: "Parcelas & Janela de Clearing",
    sublabel: "1x vs. 2-6x vs. 7-12x · D+1 vs. D+6",
    lane: 1,
    x: 120,
    y: 680,
    brand: "Todas",
    kind: "gatilho",
    risk: "alto",
    typicalRate: "+15 a +65 bps por faixa",
    isoTrigger: "PDS 0191 / DE 48 (Installments) · DE 62.2 (TID) / DE 63 (Banknet Ref) · Janela D+1",
    gcmsRef: "IP0012T1 (Life Cycle Time Frame) · T160 (Compliance)",
    description:
      "Define o escalonamento por número de parcelas (À Vista IA/JA/AU/HU → 2 a 6x IV/JV/AV/HV → 7 a 21x IW/JW/AW/HW) e valida se o clearing ocorreu dentro do prazo regulamentar com chave de autorização íntegra.",
  },

  // Coluna 2: Tabelas Físicas GCMS / MPE (T068) & Motor de Regras
  {
    id: "T_IP0030",
    code: "IP0030T1 + IP0091T1",
    label: "Tabelas de Range BIN & Produto",
    sublabel: "MPE T068 · 1014-byte blocks",
    lane: 2,
    x: 380,
    y: 160,
    brand: "Mastercard",
    kind: "gcms_table",
    risk: "baixo",
    typicalRate: "Lookup Primário BIN",
    isoTrigger: "Chave: BIN Low / BIN High (6 a 11 dígitos) → Product Code & Country",
    gcmsRef: "IP0030T1 · IP0091T1 · IP0020T1 (ICA)",
    description:
      "Tabelas distribuídas no arquivo diário MPE (T068) que vinculam o número do cartão ao Emissor, país de emissão, código de produto GCMS (ex: MCS, MPG, MPB, MDG, MPR) e habilitação do programa.",
    filterToken: "IP0030T1",
  },
  {
    id: "T_T161_T162",
    code: "T161 + T162",
    label: "Grupos de MCC & Participação",
    sublabel: "SprMkt, GovSvc, GenEx, CommT, MM",
    lane: 2,
    x: 380,
    y: 330,
    brand: "Mastercard",
    kind: "gcms_table",
    risk: "baixo",
    typicalRate: "Enquadramento Setorial",
    isoTrigger: "Chave: DE 18 (MCC) + ICA Participante → Program Group ID",
    gcmsRef: "T161 (Program Group) · T162 (Participation)",
    description:
      "T161 agrupa os MCCs em segmentos tarifários (Supermercados, Governo, Atacadistas, Despesas Gerais, Micro Merchant, Transporte) e T162 valida se o ICA do Adquirente está habilitado no programa.",
    filterToken: "T161",
  },
  {
    id: "T_T164_IP0008",
    code: "T164 + IP0008T1",
    label: "Definição de IRD & Atributos PDS",
    sublabel: "Validação PDS 0158 no IPM 1240",
    lane: 2,
    x: 380,
    y: 500,
    brand: "Mastercard",
    kind: "gcms_table",
    risk: "medio",
    typicalRate: "Qualificador de Mensagem",
    isoTrigger: "PDS 0158 (Interchange Rate Designator) + Subcampos DE 48",
    gcmsRef: "T164 (IRD Definition) · IP0008T1 (PDS Attributes)",
    description:
      "Valida a sintaxe dos Private Data Subelements (PDS 0158, 0176, 0191) no registro IPM MTI 1240 e confere os critérios técnicos exigidos para cada código de IRD.",
    filterToken: "T164",
  },
  {
    id: "T_T160_IP0012",
    code: "T160 + IP0012T1",
    label: "Regras de Compliance & Downgrade",
    sublabel: "Late Presentment & Dados Faltantes",
    lane: 2,
    x: 380,
    y: 660,
    brand: "Todas",
    kind: "gcms_table",
    risk: "critico",
    typicalRate: "Penalidade +15 a +65 bps",
    isoTrigger: "Delta (Clearing Date - Auth Date) > Prazo ou Ausência de DE 63 / DE 62.2",
    gcmsRef: "T160 (Compliance Rules) · IP0012T1 (Time Frame)",
    description:
      "Audita se a transação cumpriu a janela temporal (IP0012T1) e os campos obrigatórios da autorização (0110). Se falhar, T160 rebaixa automaticamente o IRD para EIRF / Standard (IRD 80).",
    filterToken: "T160",
  },

  // Coluna 3: Famílias de IRD Mastercard (Brasil & Cross-border)
  {
    id: "IRD_VF_VG",
    code: "IRD VF / VG / IA (Déb/Pré)",
    label: "Débito & Pré-Pago Regulado",
    sublabel: "Teto BCB Res. 150 (0,50% / 0,70%)",
    lane: 3,
    x: 660,
    y: 95,
    brand: "Mastercard",
    kind: "ird_mc",
    risk: "baixo",
    typicalRate: "0,50% (Déb) · 0,70% (Pré)",
    isoTrigger: "Funding = Debit (DMC/Maestro) ou Prepaid · Qualquer canal doméstico",
    gcmsRef: "Table 76 · IRD VF / VG / VH / VI",
    description:
      "Transações domésticas de Débito (teto legal de 0,50% pela Res. BCB 150/2021) e Pré-Pago (teto legal de 0,70%). Em MCCs incentivados (GovSvc, GenEx, SprMkt) podem ter alíquotas ainda menores ou teto em centavos.",
    filterToken: "IRD VF",
  },
  {
    id: "IRD_IA_JA",
    code: "IRD IA / JÁ",
    label: "Físico À Vista (Chip IA & NFC JÁ)",
    sublabel: "Card Present 1x Qualificado",
    lane: 3,
    x: 660,
    y: 215,
    brand: "Mastercard",
    kind: "ird_mc",
    risk: "baixo",
    typicalRate: "0,95% a 2,10%",
    isoTrigger: "DE 22 = 05 (Chip → IRD IA) ou DE 22 = 07 (Contactless → IRD JÁ) · 1x",
    gcmsRef: "Table 76 · Consumer & Commercial Credit CP",
    description:
      "Designadores base para compras presenciais à vista com leitura de Chip EMV (IA) ou aproximação Contactless (JÁ) e criptograma ARQC válido no DE 55.",
    filterToken: "IRD IA",
  },
  {
    id: "IRD_IV_JW",
    code: "IRD IV/IW & JV/JW",
    label: "Físico Parcelado (Chip & NFC)",
    sublabel: "IV/JV (2 a 6x) · IW/JW (7 a 21x)",
    lane: 3,
    x: 660,
    y: 335,
    brand: "Mastercard",
    kind: "ird_mc",
    risk: "medio",
    typicalRate: "1,35% a 2,42%",
    isoTrigger: "DE 22 = 05/07 + Parcelas 2-6x (IV/JV) ou 7-21x (IW/JW)",
    gcmsRef: "Table 76 · Installments CP",
    description:
      "Escalonamento de intercâmbio para parcelamento lojista presencial. A faixa de 2 a 6 parcelas aciona IV (Chip) ou JV (NFC); de 7 a 21 parcelas aciona IW (Chip) ou JW (NFC).",
    filterToken: "IRD IV",
  },
  {
    id: "IRD_AU_AV_AW",
    code: "IRD AU / AV / AW",
    label: "E-commerce Autenticado 3DS 2.2",
    sublabel: "AU (1x) · AV (2-6x) · AW (7-21x)",
    lane: 3,
    x: 660,
    y: 455,
    brand: "Mastercard",
    kind: "ird_mc",
    risk: "baixo",
    typicalRate: "1,15% a 2,25%",
    isoTrigger: "DE 22 = 81 + DE 48 SE 42 (SLI) = 212/211 + AAV válido",
    gcmsRef: "Table 76 · CNP Authenticated",
    description:
      "Melhor qualificação para transações online (Card Not Present). Exige autenticação EMV 3DS 2.2 (Identity Check) com criptograma UCAF/AAV preservado no clearing D+1.",
    filterToken: "IRD AU",
  },
  {
    id: "IRD_HU_HV_HW",
    code: "IRD HU / HV / HW",
    label: "E-commerce Não Autenticado (s/ 3DS)",
    sublabel: "HU (1x) · HV (2-6x) · HW (7-21x)",
    lane: 3,
    x: 660,
    y: 575,
    brand: "Mastercard",
    kind: "ird_mc",
    risk: "alto",
    typicalRate: "1,55% a 2,45%",
    isoTrigger: "DE 22 = 81 + DE 48 SE 42 (SLI) = 210 (ECI 07 Sem 3DS)",
    gcmsRef: "Table 76 · CNP Others (Non-Authenticated)",
    description:
      "Aplicado quando o checkout e-commerce processa apenas com autorização direta (sem 3DS). Cobra prêmio de risco elevado (+20 a +45 bps sobre AU/AV/AW) e mantém risco de fraude no EC.",
    filterToken: "IRD HU",
  },
  {
    id: "IRD_EIRF_80",
    code: "IRD 80 / EIRF + Cross",
    label: "Downgrade EIRF / Cross-Border",
    sublabel: "Clearing Tardio D+6 / Sem TID / PI-SI",
    lane: 3,
    x: 660,
    y: 695,
    brand: "Mastercard",
    kind: "ird_mc",
    risk: "critico",
    typicalRate: "2,25% a 2,65%",
    isoTrigger: "Clearing fora da janela, ausência de DE 63 Banknet Ref, ou Cross-Border (PI/PA/PU/SI/SA/SU)",
    gcmsRef: "T160 Downgrade / Intraregional & Interregional",
    description:
      "Reclassificação punitiva quando a transação perde dados obrigatórios de ciclo de vida (DE 63) ou atrasa a captura (Late Presentment), caindo na faixa teto EIRF/Standard.",
    filterToken: "IRD",
  },

  // Coluna 4: Programas & Tabelas Visa (BASE II FPI) & Elo
  {
    id: "VISA_DEB_T",
    code: "TABLE 3-12 a 3-14",
    label: "Visa Débito (SPUR1 / COBAN / Cap)",
    sublabel: "PID F^, L^, P^, N^, C^, I^ · Teto BCB",
    lane: 4,
    x: 940,
    y: 150,
    brand: "Visa",
    kind: "fpi_visa",
    risk: "baixo",
    typicalRate: "0,50% (Cap R$ 0,05 COBAN)",
    isoTrigger: "Visa Debit Consumer/Commercial · FPI SPUR1 / SPUR2 / CARNE",
    gcmsRef: "Visa Fee Schedule BR · Tables 3-12, 3-13, 3-14",
    description:
      "Tabelas de débito doméstico Visa Brasil. Aplicam alíquota base de 0,50% respeitando a Res. BCB 150, com programas específicos para correspondente bancário (COBAN com teto de R$ 0,05) e Carnê.",
    filterToken: "TABLE 3-12",
  },
  {
    id: "VISA_SEG_T",
    code: "TABLE 3-15 a 3-19",
    label: "Visa Segmentos Incentivados",
    sublabel: "Supermarket · Gas/Pharm · Emerging",
    lane: 4,
    x: 940,
    y: 330,
    brand: "Visa",
    kind: "fpi_visa",
    risk: "baixo",
    typicalRate: "0,70% a 1,85%",
    isoTrigger: "MCC enquadrado na Tabela 5-3 (NNSS Criteria) + Captura Qualificada",
    gcmsRef: "Visa Fee Schedule BR · Tables 3-15 a 3-19 & 3-24 a 3-28",
    description:
      "Programas setoriais da Visa para Supermercados (3-15/3-24), Postos, Lojas de Departamento e Farmácias (3-16/3-25), Turismo/Telemarketing (3-17/3-26) e Mercados Emergentes (3-18/3-19).",
    filterToken: "Supermarket",
  },
  {
    id: "VISA_GEN_T",
    code: "TABLE 3-20 a 3-38",
    label: "Visa Other Merchants & Parcelado",
    sublabel: "CLS (F^) · GLD (P^) · PLT (N^) · SIG (C^) · INF (I^)",
    lane: 4,
    x: 940,
    y: 510,
    brand: "Visa",
    kind: "fpi_visa",
    risk: "medio",
    typicalRate: "1,10% a 2,35%",
    isoTrigger: "Visa Credit À Vista e Parcelado (2-6x / 7-12x) · CP vs. CNP (3DS ECI 05 vs ECI 07)",
    gcmsRef: "Visa Fee Schedule BR · Tables 3-20 a 3-38",
    description:
      "Tabelas gerais de crédito Visa Brasil escalonadas pelo Product ID (Classic F^ até Infinite Privilege I1^), número de parcelas e presença de autenticação 3DS (CVV2/ECI 05).",
    filterToken: "Other Merchants",
  },
  {
    id: "ELO_T",
    code: "ELO TABELAS + 381 MCCs",
    label: "Elo Intercâmbio & Redução Fee",
    sublabel: "Débito, Mais, Grafite, Nanquim, Agro",
    lane: 4,
    x: 940,
    y: 670,
    brand: "Elo",
    kind: "fpi_visa",
    risk: "baixo",
    typicalRate: "0,30% a 2,45%",
    isoTrigger: "BIN Elo (5067, 5090, 6504) + 21 Segmentos MCC + 381 MCCs Redução Fee",
    gcmsRef: "tabela_intercambio_Elo.xlsx + Tabela_fee_elo_v2.xlsx",
    description:
      "Estrutura tarifária Elo cobrindo PF, PJ, Benefícios, Corporativo e Agro, com descontos específicos para Atacadistas, Supermercados, Emergentes e Serviços Governamentais (Cap R$ 0,35).",
    filterToken: "Elo",
  },

  // Coluna 5: Tabela Mestre de Alíquotas & Liquidação Financeira
  {
    id: "OUT_T165",
    code: "T165 / FEE SCHEDULE",
    label: "Tabela Mestre de Alíquotas (T165)",
    sublabel: "Cálculo: (% × Valor) + Fixo ≤ Cap",
    lane: 5,
    x: 1210,
    y: 280,
    brand: "Todas",
    kind: "output",
    risk: "baixo",
    typicalRate: "2.103 Regras Ativas",
    isoTrigger: "Cruzamento final: (IRD ou FPI) + Product Code + Segmento MCC + Parcelas",
    gcmsRef: "GCMS T165 (Interchange Rates) · Visa Fee Schedule · Elo Matrix",
    description:
      "Motor tarifário final onde o designador qualificado (IRD / FPI) é convertido em alíquota percentual (%), tarifa fixa em BRL ou teto máximo (Cap), gerando o valor exato de intercâmbio da transação.",
    filterToken: "T165",
  },
  {
    id: "OUT_SETTLE",
    code: "VSS-120 / DE 50 / ASLC",
    label: "Liquidação & Conciliação de IC",
    sublabel: "Crédito ao Emissor / Débito ao Adquirente",
    lane: 5,
    x: 1210,
    y: 520,
    brand: "Todas",
    kind: "output",
    risk: "baixo",
    typicalRate: "Settlement D+1 / Grade",
    isoTrigger: "Visa VSS-120 / VSS-110 (TC 46) · MC IPM T140 / T461 · CIP SLC (ASLC029/031)",
    gcmsRef: "T168 (FX) · VSS Vol. 1 & 2 · MCBS T145",
    description:
      "Dedução automática do intercâmbio no encontro de contas entre Adquirente e Emissor. Auditável linha a linha nos relatórios VSS-120 (Visa) e nos arquivos de retorno IPM/T461 (Mastercard).",
  },
];

// ─── Arestas do Grafo de Qualificação de IRDs ────────────────────────────────

const IRD_GRAPH_EDGES: IrdGraphEdge[] = [
  { id: "E01", from: "G_BIN", to: "T_IP0030", label: "Lookup BIN 6-11 díg", condition: "Identifica Funding + Tier no MPE T068", kind: "lookup", brand: "Todas" },
  { id: "E02", from: "G_POS", to: "T_T164_IP0008", label: "DE 22 (05/07/81/01)", condition: "Separa CP (Chip/NFC) de CNP (E-com)", kind: "lookup", brand: "Todas" },
  { id: "E03", from: "G_3DS", to: "T_T164_IP0008", label: "SLI 212 / ECI 05 / ARQC", condition: "Valida criptograma 3DS ou EMV", kind: "qualificado", brand: "Todas" },
  { id: "E04", from: "G_MCC", to: "T_T161_T162", label: "DE 18 (MCC 4 díg)", condition: "Enquadra segmento (SprMkt, GovSvc, GenEx...)", kind: "lookup", brand: "Todas" },
  { id: "E05", from: "G_PARC", to: "T_T160_IP0012", label: "PDS 0191 + Data Auth", condition: "Checa faixa de parcelas e janela D+1", kind: "lookup", brand: "Todas" },

  // Da Coluna 2 para IRDs Mastercard (Coluna 3)
  { id: "E06", from: "T_IP0030", to: "IRD_VF_VG", label: "Debit / Prepaid BR", condition: "Teto Regulatório BCB Res. 150 (0,50% / 0,70%)", kind: "qualificado", brand: "Mastercard" },
  { id: "E07", from: "T_T164_IP0008", to: "IRD_IA_JA", label: "CP 1x (POS 05/07)", condition: "Presencial à vista c/ ARQC → IRD IA ou JÁ", kind: "qualificado", brand: "Mastercard" },
  { id: "E08", from: "T_T164_IP0008", to: "IRD_IV_JW", label: "CP Parcelado (2-21x)", condition: "Presencial parcelado → IV/JV (2-6x) ou IW/JW (7-21x)", kind: "padrao", brand: "Mastercard" },
  { id: "E09", from: "T_T164_IP0008", to: "IRD_AU_AV_AW", label: "CNP + 3DS (SLI 212)", condition: "E-com autenticado → AU (1x), AV (2-6x) ou AW (7-21x)", kind: "qualificado", brand: "Mastercard" },
  { id: "E10", from: "T_T164_IP0008", to: "IRD_HU_HV_HW", label: "CNP s/ 3DS (SLI 210)", condition: "E-com sem 3DS → HU (1x), HV (2-6x) ou HW (7-21x)", kind: "downgrade", brand: "Mastercard" },
  { id: "E11", from: "T_T160_IP0012", to: "IRD_EIRF_80", label: "Clearing Tardio / s/ DE 63", condition: "Perda de qualificação → Downgrade EIRF / IRD 80", kind: "downgrade", brand: "Mastercard" },

  // Da Coluna 3 para Programas Visa / Elo (Coluna 4) ou direto p/ T165
  { id: "E12", from: "T_IP0030", to: "VISA_DEB_T", label: "Visa Debit PID", condition: "Tabelas 3-12 a 3-14 (SPUR1 / COBAN)", kind: "qualificado", brand: "Visa" },
  { id: "E13", from: "T_T161_T162", to: "VISA_SEG_T", label: "MCC Tabela 5-3", condition: "Tabelas 3-15 a 3-19 (Supermarket, Gas, Emerging)", kind: "qualificado", brand: "Visa" },
  { id: "E14", from: "T_T164_IP0008", to: "VISA_GEN_T", label: "Visa Credit CP/CNP", condition: "Tabelas 3-20 a 3-38 por PID (F^ a I1^) e Parcelas", kind: "padrao", brand: "Visa" },
  { id: "E15", from: "T_T161_T162", to: "ELO_T", label: "BIN Elo + Segmento", condition: "Tabelas Elo PF/PJ/Agro + 381 MCCs Redução", kind: "qualificado", brand: "Elo" },

  // Da Coluna 3 e 4 para Output T165 e Settlement (Coluna 5)
  { id: "E16", from: "IRD_VF_VG", to: "OUT_T165", label: "Aplica 0,50% / 0,70%", condition: "Respeita teto BCB ou Cap setorial", kind: "qualificado", brand: "Mastercard" },
  { id: "E17", from: "IRD_IA_JA", to: "OUT_T165", label: "Busca Taxa Base CP", condition: "Cruza IRD IA/JÁ × Tier × Segmento em T165", kind: "qualificado", brand: "Mastercard" },
  { id: "E18", from: "IRD_IV_JW", to: "OUT_T165", label: "Busca Taxa Parcelada CP", condition: "Cruza IRD IV/IW/JV/JW × Tier × Segmento", kind: "padrao", brand: "Mastercard" },
  { id: "E19", from: "IRD_AU_AV_AW", to: "OUT_T165", label: "Busca Taxa 3DS Reduzida", condition: "Cruza IRD AU/AV/AW × Tier × Segmento em T165", kind: "qualificado", brand: "Mastercard" },
  { id: "E20", from: "IRD_HU_HV_HW", to: "OUT_T165", label: "Busca Taxa CNP Alta", condition: "Cruza IRD HU/HV/HW × Tier (Prêmio de risco)", kind: "downgrade", brand: "Mastercard" },
  { id: "E21", from: "IRD_EIRF_80", to: "OUT_T165", label: "Aplica Taxa Punitiva", condition: "Reclassifica para alíquota teto Standard/EIRF", kind: "downgrade", brand: "Mastercard" },
  { id: "E22", from: "VISA_DEB_T", to: "OUT_T165", label: "Alíquota Débito Visa", condition: "0,50% ou Cap R$ 0,05 (COBAN)", kind: "qualificado", brand: "Visa" },
  { id: "E23", from: "VISA_SEG_T", to: "OUT_T165", label: "Alíquota Incentivada", condition: "Taxa diferenciada por MCC Visa", kind: "qualificado", brand: "Visa" },
  { id: "E24", from: "VISA_GEN_T", to: "OUT_T165", label: "Alíquota Crédito Visa", condition: "Escalonada por PID (Classic a Infinite) e Parcelas", kind: "padrao", brand: "Visa" },
  { id: "E25", from: "ELO_T", to: "OUT_T165", label: "Alíquota Oficial Elo", condition: "Taxa Base ou Cap por Segmento Elo", kind: "qualificado", brand: "Elo" },
  { id: "E26", from: "OUT_T165", to: "OUT_SETTLE", label: "Gera Intercâmbio R$", condition: "Liquida no VSS-120 (Visa) / IPM DE 50 (MC) / SLC", kind: "qualificado", brand: "Todas" },
];

// ─── Componente Principal ────────────────────────────────────────────────────

export default function IrdsAtlasClient() {
  const [activeMode, setActiveMode] = useState<"graph" | "tables" | "mccs" | "gcms">("graph");

  // Estado do Simulador de Qualificação Ao Vivo (no Grafo e nas Tabelas)
  const [simBrand, setSimBrand] = useState<"Mastercard" | "Visa" | "Elo">("Mastercard");
  const [simModalidade, setSimModalidade] = useState<"Crédito" | "Débito" | "Pré-pago">("Crédito");
  const [simTier, setSimTier] = useState<"standard" | "gold" | "platinum" | "black" | "corporate">("platinum");
  const [simCanal, setSimCanal] = useState<"cp_chip" | "cp_nfc" | "cnp_3ds" | "cnp_no3ds">("cnp_3ds");
  const [simParcelas, setSimParcelas] = useState<"1x" | "2a6x" | "7a12x">("2a6x");
  const [simSegmento, setSimSegmento] = useState<"Base" | "SprMkt" | "GovSvc" | "GenEx" | "CommT" | "Whole">("Base");
  const [simLateClearing, setSimLateClearing] = useState<boolean>(false);
  const [simValor, setSimValor] = useState<number>(500);

  // Estado do Grafo SVG
  const [selectedNodeId, setSelectedNodeId] = useState<string>("IRD_AU_AV_AW");
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const dragRef = useRef<{ startX: number; startY: number; panX: number; panY: number } | null>(null);

  // Estado de Filtros da Aba 2 (2.103 Tabelas de Intercâmbio)
  const [tableSearch, setTableSearch] = useState<string>("");
  const [tableBrand, setTableBrand] = useState<string>("");
  const [tableModalidade, setTableModalidade] = useState<string>("");
  const [tableTipoRegra, setTableTipoRegra] = useState<string>("");
  const [tableSegmento, setTableSegmento] = useState<string>("");
  const [tableIrdFilter, setTableIrdFilter] = useState<string>("");
  const [selectedTableRowIdx, setSelectedTableRowIdx] = useState<number>(0);

  // Estado de Filtros da Aba 3 (MCCs & PIDs)
  const [mccSearch, setMccSearch] = useState<string>("");
  const [mccBrandTab, setMccBrandTab] = useState<"mastercard" | "visa" | "elo">("mastercard");

  // Estado da Aba 4 (GCMS & T068 Forense)
  const [gcmsSearch, setGcmsSearch] = useState<string>("");
  const [selectedGcmsTable, setSelectedGcmsTable] = useState<string>("T165");

  // Leitura de query params (?ird=AU, ?mode=tables, ?brand=Mastercard)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const qMode = params.get("mode");
    const qIrd = params.get("ird");
    const qBrand = params.get("brand");
    const qNode = params.get("node");
    if (qMode === "tables" || qMode === "mccs" || qMode === "gcms" || qMode === "graph") {
      setActiveMode(qMode);
    }
    if (qBrand === "Mastercard" || qBrand === "Visa" || qBrand === "Elo") {
      setSimBrand(qBrand);
      setTableBrand(qBrand);
    }
    if (qIrd) {
      setTableIrdFilter(qIrd);
    }
    if (qNode && IRD_GRAPH_NODES.some((n) => n.id === qNode)) {
      setSelectedNodeId(qNode);
    }
  }, []);

  // ─── Cálculo de Qualificação do Simulador de IRD ───────────────────────────

  const qualificationResult = useMemo(() => {
    const activeNodes = new Set<string>(["G_BIN", "G_POS", "G_3DS", "G_MCC", "G_PARC", "OUT_T165", "OUT_SETTLE"]);
    const activeEdges = new Set<string>(["E01", "E02", "E03", "E04", "E05", "E26"]);

    let irdCode = "";
    let irdFamilyNodeId = "";
    let targetTable = "";
    let ratePct = 1.65;
    let optimalRatePct = 1.65;
    let capBrl: number | null = null;
    let statusLabel = "";
    let explanation = "";

    if (simBrand === "Mastercard") {
      activeNodes.add("T_IP0030");
      activeNodes.add("T_T161_T162");
      activeNodes.add("T_T164_IP0008");
      activeNodes.add("T_T160_IP0012");

      if (simModalidade === "Débito" || simModalidade === "Pré-pago") {
        irdFamilyNodeId = "IRD_VF_VG";
        activeNodes.add("IRD_VF_VG");
        activeEdges.add("E06");
        activeEdges.add("E16");
        irdCode = simCanal === "cp_nfc" ? "IRD VG" : simCanal.startsWith("cnp") ? "IRD VI / VH" : "IRD VF / IA";
        targetTable = "Mastercard Table 76 (Debit / Prepaid BCB Cap)";
        ratePct = simModalidade === "Débito" ? (simSegmento === "SprMkt" ? 0.35 : 0.5) : 0.7;
        optimalRatePct = ratePct;
        if (simSegmento === "GenEx") capBrl = 0.9;
        statusLabel = `Teto Regulatório BCB Res. 150/2021 (${ratePct.toFixed(2).replace(".", ",")}%)`;
        explanation = `Cartões de ${simModalidade} operam sob limite legal do Banco Central (${ratePct.toFixed(2).replace(".", ",")}%), acionando os designadores ${irdCode} na Tabela 76.`;
      } else if (simLateClearing) {
        irdFamilyNodeId = "IRD_EIRF_80";
        activeNodes.add("IRD_EIRF_80");
        activeEdges.add("E11");
        activeEdges.add("E21");
        irdCode = "IRD 80 / EIRF (Downgrade)";
        targetTable = "GCMS T160 Technical Downgrade / EIRF";
        optimalRatePct = simTier === "black" ? 1.95 : simTier === "platinum" ? 1.68 : 1.42;
        ratePct = simTier === "black" ? 2.45 : simTier === "platinum" ? 2.3 : 2.15;
        statusLabel = "DOWNGRADE TÉCNICO (Clearing Tardio / Sem DE 63)";
        explanation =
          "Como o clearing ocorreu fora da janela D+1 (IP0012T1) ou sem o DE 63 (Banknet Ref) da 0110, a tabela T160 rejeita o IRD original e reclassifica para EIRF/Standard.";
      } else if (simCanal === "cp_chip" || simCanal === "cp_nfc") {
        if (simParcelas === "1x") {
          irdFamilyNodeId = "IRD_IA_JA";
          activeNodes.add("IRD_IA_JA");
          activeEdges.add("E07");
          activeEdges.add("E17");
          irdCode = simCanal === "cp_nfc" ? "IRD JÁ" : "IRD IA";
          targetTable = "Mastercard Table 76 (Card Present Non-Installments)";
          const baseByTier = simTier === "black" ? 1.9 : simTier === "platinum" ? 1.55 : simTier === "gold" ? 1.35 : 1.1;
          const segDiscount = simSegmento === "SprMkt" ? -0.2 : simSegmento === "GenEx" ? -0.45 : simSegmento === "CommT" ? -0.35 : 0;
          ratePct = Math.max(0.5, Number((baseByTier + segDiscount).toFixed(2)));
          optimalRatePct = ratePct;
          statusLabel = `Qualificado Presencial À Vista (${irdCode})`;
          explanation = `Leitura presencial via ${simCanal === "cp_nfc" ? "Contactless NFC (DE 22=07)" : "Chip EMV (DE 22=05)"} com criptograma ARQC íntegro no DE 55.`;
        } else {
          irdFamilyNodeId = "IRD_IV_JW";
          activeNodes.add("IRD_IV_JW");
          activeEdges.add("E08");
          activeEdges.add("E18");
          const isLong = simParcelas === "7a12x";
          irdCode = simCanal === "cp_nfc" ? (isLong ? "IRD JW" : "IRD JV") : isLong ? "IRD IW" : "IRD IV";
          targetTable = `Mastercard Table 76 (Card Present Installments ${isLong ? "7-21x" : "2-6x"})`;
          const baseByTier = simTier === "black" ? 2.18 : simTier === "platinum" ? 1.85 : simTier === "gold" ? 1.65 : 1.45;
          const parcAdd = isLong ? 0.22 : 0;
          const segDiscount = simSegmento === "SprMkt" ? -0.18 : 0;
          ratePct = Number((baseByTier + parcAdd + segDiscount).toFixed(2));
          optimalRatePct = ratePct;
          statusLabel = `Qualificado Presencial Parcelado (${irdCode})`;
          explanation = `Transação presencial parcelada (${simParcelas === "2a6x" ? "2 a 6x" : "7 a 12x"}) no canal ${simCanal === "cp_nfc" ? "Contactless" : "Chip EMV"}.`;
        }
      } else {
        // E-commerce (CNP)
        const isLong = simParcelas === "7a12x";
        const isInstallment = simParcelas !== "1x";
        const optBase = simTier === "black" ? 1.98 : simTier === "platinum" ? 1.68 : simTier === "gold" ? 1.5 : 1.3;
        const optParc = !isInstallment ? 0 : isLong ? 0.32 : 0.16;
        optimalRatePct = Number((optBase + optParc).toFixed(2));

        if (simCanal === "cnp_3ds") {
          irdFamilyNodeId = "IRD_AU_AV_AW";
          activeNodes.add("IRD_AU_AV_AW");
          activeEdges.add("E09");
          activeEdges.add("E19");
          irdCode = !isInstallment ? "IRD AU" : isLong ? "IRD AW" : "IRD AV";
          targetTable = "Mastercard Table 76 (CNP Authenticated 3DS 2.2)";
          ratePct = optimalRatePct;
          statusLabel = `Qualificado no Alvo 3DS (${irdCode})`;
          explanation = `Autenticação EMV 3DS 2.2 válida (DE 48 SE 42 SLI = 212 + AAV) garante o menor intercâmbio CNP (${irdCode}) e Liability Shift contra fraude.`;
        } else {
          irdFamilyNodeId = "IRD_HU_HV_HW";
          activeNodes.add("IRD_HU_HV_HW");
          activeEdges.add("E10");
          activeEdges.add("E20");
          irdCode = !isInstallment ? "IRD HU" : isLong ? "IRD HW" : "IRD HV";
          targetTable = "Mastercard Table 76 (CNP Others — Sem 3DS)";
          ratePct = Number((optimalRatePct + 0.32).toFixed(2));
          statusLabel = `Sobretaxa de Risco Sem 3DS (${irdCode})`;
          explanation = `Ausência de autenticação 3DS (SLI 210 / ECI 07) desloca a transação de AU/AV/AW para ${irdCode}, adicionando +32 bps de custo de intercâmbio.`;
        }
      }
    } else if (simBrand === "Visa") {
      activeNodes.add("T_IP0030");
      activeNodes.add("T_T161_T162");
      activeNodes.add("T_T164_IP0008");
      const pidMap: Record<string, string> = {
        standard: "PID F^ (Classic)",
        gold: "PID P^ (Gold)",
        platinum: "PID N^ (Platinum)",
        black: "PID I^ (Infinite)",
        corporate: "PID K^ (Corporate)",
      };
      const pidLabel = pidMap[simTier] || "PID N^ (Platinum)";

      if (simModalidade === "Débito") {
        irdFamilyNodeId = "VISA_DEB_T";
        activeNodes.add("VISA_DEB_T");
        activeEdges.add("E12");
        activeEdges.add("E22");
        irdCode = `${pidLabel} · SPUR1 DB`;
        targetTable = "Visa TABLE 3-12 / 3-13 (Debit Consumer Products)";
        ratePct = 0.5;
        optimalRatePct = 0.5;
        statusLabel = "Qualificado Visa Débito (TABLE 3-12 · 0,50%)";
        explanation = "Transação de débito Visa enquadrada no programa Special Purchase Top-Up (SPUR1 DB) respeitando o teto de 0,50% do BCB.";
      } else if (simSegmento !== "Base" && !simLateClearing) {
        irdFamilyNodeId = "VISA_SEG_T";
        activeNodes.add("VISA_SEG_T");
        activeEdges.add("E13");
        activeEdges.add("E23");
        irdCode = `${pidLabel} · Segmento ${simSegmento}`;
        targetTable = "Visa TABLE 3-15 a 3-19 (Supermarket / Gas / Emerging)";
        ratePct = simSegmento === "SprMkt" ? 1.05 : 1.25;
        optimalRatePct = ratePct;
        statusLabel = `Qualificado Programa Setorial Visa (${targetTable})`;
        explanation = "MCC do estabelecimento qualificado nos critérios NNSS (Tabela 5-3), garantindo tarifa diferenciada por segmento.";
      } else {
        irdFamilyNodeId = "VISA_GEN_T";
        activeNodes.add("VISA_GEN_T");
        activeEdges.add("E14");
        activeEdges.add("E24");
        irdCode = `${pidLabel} · ${simLateClearing ? "EIRF Downgrade" : simCanal === "cnp_no3ds" ? "CNP ECI 07" : "Qualificado ECI 05 / CP"}`;
        targetTable = "Visa TABLE 3-20 / 3-29 (Other Merchants Fee Program)";
        const baseVisa = simTier === "black" ? 2.02 : simTier === "platinum" ? 1.72 : simTier === "gold" ? 1.52 : 1.28;
        const parcVisa = simParcelas === "1x" ? 0 : simParcelas === "2a6x" ? 0.18 : 0.34;
        optimalRatePct = Number((baseVisa + parcVisa).toFixed(2));
        ratePct = simLateClearing
          ? Number((optimalRatePct + 0.45).toFixed(2))
          : simCanal === "cnp_no3ds"
          ? Number((optimalRatePct + 0.28).toFixed(2))
          : optimalRatePct;
        statusLabel = simLateClearing
          ? "Downgrade BASE II (Sem DE 62.2 TID ou Fora do Prazo)"
          : simCanal === "cnp_no3ds"
          ? "Visa CNP Sem 3DS (ECI 07)"
          : `Qualificado Visa (${pidLabel})`;
        explanation =
          "Precificação escalonada pelo Product ID (PID F^ a I^) combinada com o indicador de autenticação eletrônica (Pos 60.8 ECI) e preservação do DE 62.2 (Transaction ID) no TC 05.";
      }
    } else {
      // Elo
      activeNodes.add("T_T161_T162");
      irdFamilyNodeId = "ELO_T";
      activeNodes.add("ELO_T");
      activeEdges.add("E15");
      activeEdges.add("E25");
      irdCode = `Elo ${simModalidade} · ${simTier.toUpperCase()}`;
      targetTable = "Tabela Oficial Elo Brasil + 381 MCCs Redução";
      if (simModalidade === "Débito") {
        ratePct = simSegmento === "SprMkt" ? 0.36 : simSegmento === "GovSvc" ? 0.0 : 0.5;
        optimalRatePct = ratePct;
        if (simSegmento === "GovSvc") capBrl = 0.35;
      } else {
        const baseElo = simTier === "black" ? 2.1 : simTier === "platinum" ? 1.5 : 1.2;
        optimalRatePct = baseElo;
        ratePct = simCanal === "cnp_no3ds" || simLateClearing ? Number((baseElo + 0.35).toFixed(2)) : baseElo;
      }
      statusLabel = `Enquadramento Elo (${irdCode})`;
      explanation =
        "Elo aplica tabelas específicas por faixa de BIN (Elo Mais, Grafite, Nanquim, Empresarial) e descontos diretos para Supermercados (0,36% Débito), Atacadistas (0,30%) e Governo (Cap R$ 0,35).";
    }

    const rawFeeBrl = (simValor * ratePct) / 100;
    const finalFeeBrl = capBrl !== null ? Math.min(rawFeeBrl, capBrl) : rawFeeBrl;
    const optimalFeeBrl = capBrl !== null ? Math.min((simValor * optimalRatePct) / 100, capBrl) : (simValor * optimalRatePct) / 100;
    const lossPerTxBrl = Math.max(0, finalFeeBrl - optimalFeeBrl);

    return {
      activeNodes,
      activeEdges,
      irdFamilyNodeId,
      irdCode,
      targetTable,
      ratePct,
      optimalRatePct,
      capBrl,
      finalFeeBrl,
      optimalFeeBrl,
      lossPerTxBrl,
      loss10kBrl: lossPerTxBrl * 10000,
      statusLabel,
      explanation,
    };
  }, [simBrand, simModalidade, simTier, simCanal, simParcelas, simSegmento, simLateClearing, simValor]);

  const selectedNode = useMemo(
    () => IRD_GRAPH_NODES.find((n) => n.id === selectedNodeId) || IRD_GRAPH_NODES[0],
    [selectedNodeId]
  );

  // ─── Filtro das 2.103 Linhas da Tabela de Intercâmbio ──────────────────────

  const filteredIntercambioRows = useMemo(() => {
    const q = tableSearch.trim().toLowerCase();
    return tabelasFees.intercambio.filter((row) => {
      if (tableBrand && row.bandeira !== tableBrand) return false;
      if (tableModalidade && row.modalidade !== tableModalidade) return false;
      if (tableTipoRegra && row.tipo_regra !== tableTipoRegra) return false;
      if (tableSegmento && !row.segmento.toLowerCase().includes(tableSegmento.toLowerCase())) return false;
      if (tableIrdFilter && !row.produto_ird.toLowerCase().includes(tableIrdFilter.toLowerCase()) && !row.tabela.toLowerCase().includes(tableIrdFilter.toLowerCase()) && !row.programa.toLowerCase().includes(tableIrdFilter.toLowerCase())) {
        return false;
      }
      if (q) {
        const hay = `${row.bandeira} ${row.modalidade} ${row.tipo_regra} ${row.tabela} ${row.programa} ${row.parcelas} ${row.captura} ${row.produto_ird} ${row.segmento}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [tableSearch, tableBrand, tableModalidade, tableTipoRegra, tableSegmento, tableIrdFilter]);

  const selectedTableRow: IntercambioRow | undefined =
    filteredIntercambioRows[selectedTableRowIdx] || filteredIntercambioRows[0];

  // Cálculo em R$ para uma linha da tabela real
  const computeRowBrl = useCallback(
    (row: IntercambioRow, amount: number) => {
      const aliq = Number(row.aliquota_pct || 0);
      const fixPart = Number(row.valor_fixo_brl || 0);
      const tetoPart = row.teto_brl !== null && row.teto_brl !== undefined ? Number(row.teto_brl) : 0;
      const pctPart = ((isNaN(aliq) ? 0 : aliq) / 100) * amount;
      let total = pctPart + (isNaN(fixPart) ? 0 : fixPart);
      if (!isNaN(tetoPart) && tetoPart > 0) {
        total = Math.min(total, tetoPart);
      }
      const effPct = amount > 0 ? (total / amount) * 100 : 0;
      return { total, effPct, aliq: isNaN(aliq) ? 0 : aliq };
    },
    []
  );

  // ─── Pan & Zoom no Grafo SVG (com suporte a Scroll Wheel!) ─────────────────

  const handleWheel = useCallback((e: React.WheelEvent<SVGSVGElement>) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.12 : 1 / 1.12;
    setZoom((z) => Math.max(0.55, Math.min(2.6, Number((z * factor).toFixed(2)))));
  }, []);

  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    const target = e.target as HTMLElement;
    if (target.closest("[data-node-id]")) return;
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      panX: pan.x,
      panY: pan.y,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!dragRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const scaleX = 1360 / rect.width;
    const scaleY = 780 / rect.height;
    setPan({
      x: dragRef.current.panX + (e.clientX - dragRef.current.startX) * scaleX,
      y: dragRef.current.panY + (e.clientY - dragRef.current.startY) * scaleY,
    });
  };

  const handlePointerUp = () => {
    dragRef.current = null;
  };

  // Exportar Parecer de IRD / Tabela para o Doc Studio (/editor)
  const handleSendNodeToDocStudio = useCallback(
    (node: IrdGraphNode) => {
      const html = `
        <h2>Especificação Técnica de Qualificação Tarifária: ${node.code} — ${node.label}</h2>
        <p><strong>Bandeira:</strong> ${node.brand} · <strong>Camada:</strong> ${node.sublabel} · <strong>Faixa Típica:</strong> ${node.typicalRate}</p>
        <h3>1. Função no Motor de Qualificação de Intercâmbio</h3>
        <p>${node.description}</p>
        <h3>2. Gatilho de Mensageria ISO 8583 / Clearing & Tabelas Físicas</h3>
        <table>
          <thead>
            <tr><th>Dimensão</th><th>Regra Verificada</th></tr>
          </thead>
          <tbody>
            <tr><td><strong>Gatilho ISO 8583 / Clearing</strong></td><td><code>${node.isoTrigger}</code></td></tr>
            <tr><td><strong>Tabela GCMS / MPE / Fee Schedule</strong></td><td><code>${node.gcmsRef}</code></td></tr>
            <tr><td><strong>Cenário Simulado Atual (${simBrand})</strong></td><td>${qualificationResult.irdCode} → Alíquota ${qualificationResult.ratePct.toFixed(2).replace(".", ",")}% (R$ ${qualificationResult.finalFeeBrl.toFixed(2).replace(".", ",")} em compra de R$ ${simValor.toFixed(2).replace(".", ",")})</td></tr>
          </tbody>
        </table>
      `;
      sendToDocStudio({
        mode: "full_dossier",
        title: `Qualificação IRD/Tabela — ${node.code} (${node.label})`,
        sourceModule: "Atlas de IRDs & Tabelas (/mapa/irds)",
        html,
        metadata: {
          brand: node.brand === "Visa" ? "visa" : node.brand === "Mastercard" ? "mastercard" : node.brand === "Elo" ? "elo" : "geral",
          brandName: node.brand,
          referenceId: node.id,
          category: "Qualificação de Intercâmbio (IRD / FPI / T165)",
          riskLevel: node.risk === "critico" || node.risk === "alto" ? "Alto" : "Médio",
          executiveSummary: `${node.code} (${node.label}): ${node.description}`,
          recommendedAction: `Validar preenchimento de ${node.isoTrigger} e conciliar na tabela ${node.gcmsRef}.`,
        },
      });
    },
    [simBrand, simValor, qualificationResult]
  );

  const handleSendRowToDocStudio = useCallback(
    (row: IntercambioRow) => {
      const calc = computeRowBrl(row, simValor);
      const html = `
        <h2>Memória de Cálculo de Alíquota de Intercâmbio — ${row.bandeira} (${row.produto_ird})</h2>
        <p><strong>Tabela:</strong> ${row.tabela} · <strong>Programa:</strong> ${row.programa} · <strong>Fonte:</strong> <code>${row.fonte}</code></p>
        <table>
          <thead>
            <tr><th>Parâmetro</th><th>Especificação Oficial</th></tr>
          </thead>
          <tbody>
            <tr><td><strong>Bandeira / Modalidade</strong></td><td>${row.bandeira} · ${row.modalidade} (${row.tipo_regra})</td></tr>
            <tr><td><strong>Designador (IRD / PID)</strong></td><td><code>${row.produto_ird}</code></td></tr>
            <tr><td><strong>Segmento / MCC</strong></td><td>${row.segmento}</td></tr>
            <tr><td><strong>Canal de Captura & Parcelas</strong></td><td>${row.captura} · ${row.parcelas}</td></tr>
            <tr><td><strong>Alíquota Percentual (%)</strong></td><td><strong>${calc.aliq.toFixed(2).replace(".", ",")}%</strong></td></tr>
            <tr><td><strong>Tarifa Fixa / Teto (Cap)</strong></td><td>Fixo: ${row.valor_fixo_brl ? `R$ ${Number(row.valor_fixo_brl).toFixed(2)}` : "N/A"} · Teto (Cap): ${row.teto_brl ? `R$ ${Number(row.teto_brl).toFixed(2)}` : "Sem teto"}</td></tr>
            <tr><td><strong>Simulação para Ticket de R$ ${simValor.toFixed(2).replace(".", ",")}</strong></td><td><strong>R$ ${calc.total.toFixed(2).replace(".", ",")}</strong> (Taxa Efetiva: ${calc.effPct.toFixed(2).replace(".", ",")}%)</td></tr>
          </tbody>
        </table>
      `;
      sendToDocStudio({
        mode: "full_dossier",
        title: `Alíquota ${row.bandeira} — ${row.produto_ird} (${row.segmento})`,
        sourceModule: "Atlas de IRDs & Tabelas (/mapa/irds)",
        html,
        metadata: {
          brand: row.bandeira.toLowerCase() === "visa" ? "visa" : row.bandeira.toLowerCase() === "mastercard" ? "mastercard" : "elo",
          brandName: row.bandeira,
          referenceId: `${row.tabela}-${row.segmento}`,
          category: `Tabela de Intercâmbio (${row.modalidade})`,
          riskLevel: "Médio",
          executiveSummary: `${row.bandeira} ${row.produto_ird} (${row.segmento}): ${row.aliquota_pct}% (${row.tabela})`,
          recommendedAction: `Conferir enquadramento de captura (${row.captura}) e segmento (${row.segmento}) no clearing D+1.`,
        },
      });
    },
    [computeRowBrl, simValor]
  );

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "calc(100vh - 54px)",
        background: "#0b0e17",
        color: "#e2e8f0",
        overflow: "hidden",
      }}
    >
      {/* ─── Barra Superior: Seletor de Modo + Simulador de Qualificação Ao Vivo ─── */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          borderBottom: "1px solid #1e293b",
          background: "#0f1422",
          flexShrink: 0,
        }}
      >
        {/* Linha 1: Abas de Modo + KPIs Rápidos */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "8px 16px",
            gap: "12px",
            flexWrap: "wrap",
            borderBottom: "1px solid #1e293b",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
            <button
              onClick={() => setActiveMode("graph")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 12px",
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: 700,
                background: activeMode === "graph" ? "rgba(16, 185, 129, 0.16)" : "#151c2c",
                color: activeMode === "graph" ? "#34d399" : "#94a3b8",
                border: activeMode === "graph" ? "1px solid rgba(16, 185, 129, 0.45)" : "1px solid #263147",
                cursor: "pointer",
              }}
            >
              <Network size={14} /> 1. Árvore & Grafo de Qualificação IRD / FPI
            </button>
            <button
              onClick={() => setActiveMode("tables")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 12px",
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: 700,
                background: activeMode === "tables" ? "rgba(59, 130, 246, 0.18)" : "#151c2c",
                color: activeMode === "tables" ? "#60a5fa" : "#94a3b8",
                border: activeMode === "tables" ? "1px solid rgba(59, 130, 246, 0.45)" : "1px solid #263147",
                cursor: "pointer",
              }}
            >
              <Table2 size={14} /> 2. Tabelas Oficiais Vivas (2.103 Alíquotas)
            </button>
            <button
              onClick={() => setActiveMode("mccs")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 12px",
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: 700,
                background: activeMode === "mccs" ? "rgba(168, 85, 247, 0.18)" : "#151c2c",
                color: activeMode === "mccs" ? "#c084fc" : "#94a3b8",
                border: activeMode === "mccs" ? "1px solid rgba(168, 85, 247, 0.45)" : "1px solid #263147",
                cursor: "pointer",
              }}
            >
              <Tag size={14} /> 3. Cruzamento MCC × Segmentos × PIDs (423 Regras)
            </button>
            <button
              onClick={() => setActiveMode("gcms")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 12px",
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: 700,
                background: activeMode === "gcms" ? "rgba(245, 158, 11, 0.18)" : "#151c2c",
                color: activeMode === "gcms" ? "#fbbf24" : "#94a3b8",
                border: activeMode === "gcms" ? "1px solid rgba(245, 158, 11, 0.45)" : "1px solid #263147",
                cursor: "pointer",
              }}
            >
              <Database size={14} /> 4. Tabelas Físicas GCMS / MPE (T068 · 268 Tabelas)
            </button>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "11px" }}>
            <span
              style={{
                padding: "3px 9px",
                borderRadius: "999px",
                background: "rgba(16, 185, 129, 0.12)",
                border: "1px solid rgba(16, 185, 129, 0.3)",
                color: "#34d399",
                fontWeight: 700,
              }}
            >
              ● 2.103 Regras Reais Conectadas (Visa 866 · MC 820 · Elo 417)
            </span>
            <Link
              href="/simulador"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                padding: "4px 10px",
                borderRadius: "6px",
                background: "rgba(59, 130, 246, 0.14)",
                border: "1px solid rgba(59, 130, 246, 0.35)",
                color: "#93c5fd",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              <Calculator size={12} /> Abrir Simulador IC Completo ↗
            </Link>
          </div>
        </div>

        {/* Linha 2: Barra de Simulação "Qual IRD / Tabela Cai?" Ao Vivo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "8px 16px",
            gap: "10px",
            flexWrap: "wrap",
            background: "linear-gradient(90deg, rgba(16,185,129,0.07) 0%, rgba(59,130,246,0.06) 50%, rgba(15,20,34,0.95) 100%)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "11px", fontWeight: 800, color: "#34d399", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              ⚡ Motor IRD Ao Vivo:
            </span>

            <select
              value={simBrand}
              onChange={(e) => setSimBrand(e.target.value as "Mastercard" | "Visa" | "Elo")}
              style={{ background: "#141b2d", color: "#f8fafc", border: "1px solid #2e3b52", borderRadius: "6px", padding: "4px 8px", fontSize: "11.5px", fontWeight: 700 }}
            >
              <option value="Mastercard">Mastercard (IRDs Table 76)</option>
              <option value="Visa">Visa (PIDs & Tables 3-12 a 3-38)</option>
              <option value="Elo">Elo (Segmentos & 381 MCCs)</option>
            </select>

            <select
              value={simModalidade}
              onChange={(e) => setSimModalidade(e.target.value as "Crédito" | "Débito" | "Pré-pago")}
              style={{ background: "#141b2d", color: "#f8fafc", border: "1px solid #2e3b52", borderRadius: "6px", padding: "4px 8px", fontSize: "11.5px" }}
            >
              <option value="Crédito">Crédito</option>
              <option value="Débito">Débito (Teto BCB 0,50%)</option>
              <option value="Pré-pago">Pré-Pago (Teto BCB 0,70%)</option>
            </select>

            <select
              value={simTier}
              onChange={(e) => setSimTier(e.target.value as "standard" | "gold" | "platinum" | "black" | "corporate")}
              style={{ background: "#141b2d", color: "#f8fafc", border: "1px solid #2e3b52", borderRadius: "6px", padding: "4px 8px", fontSize: "11.5px" }}
            >
              <option value="standard">Standard / Classic (PID F^)</option>
              <option value="gold">Gold / Mais (PID P^)</option>
              <option value="platinum">Platinum / Grafite (PID N^)</option>
              <option value="black">Black / Infinite / Nanquim (PID I^)</option>
              <option value="corporate">Corporativo / Empresarial</option>
            </select>

            <select
              value={simCanal}
              onChange={(e) => setSimCanal(e.target.value as "cp_chip" | "cp_nfc" | "cnp_3ds" | "cnp_no3ds")}
              style={{ background: "#141b2d", color: "#f8fafc", border: "1px solid #2e3b52", borderRadius: "6px", padding: "4px 8px", fontSize: "11.5px" }}
            >
              <option value="cp_chip">Presencial Chip (DE 22=05)</option>
              <option value="cp_nfc">Contactless NFC (DE 22=07)</option>
              <option value="cnp_3ds">E-commerce 3DS 2.2 (SLI 212 / ECI 05)</option>
              <option value="cnp_no3ds">E-commerce SEM 3DS (SLI 210 / ECI 07)</option>
            </select>

            <select
              value={simParcelas}
              onChange={(e) => setSimParcelas(e.target.value as "1x" | "2a6x" | "7a12x")}
              style={{ background: "#141b2d", color: "#f8fafc", border: "1px solid #2e3b52", borderRadius: "6px", padding: "4px 8px", fontSize: "11.5px" }}
            >
              <option value="1x">À Vista (1x)</option>
              <option value="2a6x">Parcelado 2x a 6x</option>
              <option value="7a12x">Parcelado 7x a 12x</option>
            </select>

            <select
              value={simSegmento}
              onChange={(e) => setSimSegmento(e.target.value as "Base" | "SprMkt" | "GovSvc" | "GenEx" | "CommT" | "Whole")}
              style={{ background: "#141b2d", color: "#f8fafc", border: "1px solid #2e3b52", borderRadius: "6px", padding: "4px 8px", fontSize: "11.5px" }}
            >
              <option value="Base">MCC Geral (Base)</option>
              <option value="SprMkt">Supermercados (SprMkt · 5411)</option>
              <option value="GovSvc">Governo (GovSvc · 9399)</option>
              <option value="GenEx">Despesas Gerais / Telecom (GenEx · 4814)</option>
              <option value="CommT">Transporte / Pedágio (CommT · 4111)</option>
              <option value="Whole">Atacadistas (Whole · 5300)</option>
            </select>

            <button
              onClick={() => setSimLateClearing((v) => !v)}
              style={{
                padding: "4px 9px",
                borderRadius: "6px",
                fontSize: "11px",
                fontWeight: 700,
                background: simLateClearing ? "rgba(239, 68, 68, 0.2)" : "#141b2d",
                color: simLateClearing ? "#fca5a5" : "#94a3b8",
                border: simLateClearing ? "1px solid rgba(239, 68, 68, 0.5)" : "1px solid #2e3b52",
                cursor: "pointer",
              }}
            >
              {simLateClearing ? "⚠️ Clearing Tardio D+6 (Downgrade EIRF Ativo)" : "⏱️ Simular Atraso Clearing D+6"}
            </button>

            <div style={{ display: "inline-flex", alignItems: "center", gap: "4px", background: "#141b2d", border: "1px solid #2e3b52", borderRadius: "6px", padding: "2px 8px" }}>
              <span style={{ fontSize: "11px", color: "#94a3b8" }}>Ticket R$:</span>
              <input
                type="number"
                min={1}
                step={50}
                value={simValor}
                onChange={(e) => setSimValor(Math.max(1, Number(e.target.value) || 100))}
                style={{ width: "68px", background: "transparent", border: "none", color: "#34d399", fontWeight: 800, fontSize: "12px", outline: "none" }}
              />
            </div>
          </div>

          {/* Resultado Instantâneo da Qualificação */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <div
              onClick={() => {
                if (qualificationResult.irdFamilyNodeId) {
                  setSelectedNodeId(qualificationResult.irdFamilyNodeId);
                }
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "4px 12px",
                borderRadius: "8px",
                background: simLateClearing || simCanal === "cnp_no3ds" ? "rgba(239, 68, 68, 0.14)" : "rgba(16, 185, 129, 0.14)",
                border: simLateClearing || simCanal === "cnp_no3ds" ? "1px solid rgba(239, 68, 68, 0.4)" : "1px solid rgba(16, 185, 129, 0.4)",
                cursor: "pointer",
              }}
            >
              <span style={{ fontSize: "11px", color: "#cbd5e1" }}>Designador:</span>
              <strong style={{ fontSize: "12.5px", color: simLateClearing || simCanal === "cnp_no3ds" ? "#fca5a5" : "#34d399" }}>
                {qualificationResult.irdCode}
              </strong>
              <span style={{ color: "#475569" }}>|</span>
              <strong style={{ fontSize: "12.5px", color: "#f8fafc" }}>
                {qualificationResult.ratePct.toFixed(2).replace(".", ",")}% (R$ {qualificationResult.finalFeeBrl.toFixed(2).replace(".", ",")})
              </strong>
              {qualificationResult.lossPerTxBrl > 0.01 && (
                <span style={{ fontSize: "11px", color: "#fca5a5", fontWeight: 700 }}>
                  · Vazamento: -R$ {qualificationResult.lossPerTxBrl.toFixed(2).replace(".", ",")}/tx (-R$ {qualificationResult.loss10kBrl.toLocaleString("pt-BR", { minimumFractionDigits: 0 })} em 10k txs)
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Corpo Principal: Área Central + Inspetor Lateral Direito ─── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) 410px",
          flex: 1,
          minHeight: 0,
          overflow: "hidden",
        }}
      >
        {/* ─── Área Central (Muda conforme activeMode) ─── */}
        <div style={{ display: "flex", flexDirection: "column", minHeight: 0, overflow: "hidden", padding: "14px" }}>
          {activeMode === "graph" && (
            <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0, gap: "10px" }}>
              {/* Toolbar do Grafo */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#f8fafc" }}>
                    Árvore de Decisão e Qualificação: ISO 8583 → Tabelas GCMS/MPE (T068) → IRD / FPI → T165
                  </h2>
                  <p style={{ margin: "2px 0 0", fontSize: "11.5px", color: "#94a3b8" }}>
                    {qualificationResult.statusLabel} — {qualificationResult.explanation}
                  </p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <button
                    onClick={() => {
                      const codeToken = qualificationResult.irdCode.split(" ")[1] || "";
                      setTableBrand(simBrand);
                      setTableIrdFilter(codeToken);
                      setActiveMode("tables");
                    }}
                    style={{
                      padding: "5px 10px",
                      borderRadius: "7px",
                      fontSize: "11.5px",
                      fontWeight: 700,
                      background: "rgba(59, 130, 246, 0.16)",
                      border: "1px solid rgba(59, 130, 246, 0.4)",
                      color: "#93c5fd",
                      cursor: "pointer",
                    }}
                  >
                    📊 Filtrar {qualificationResult.irdCode} nas 2.103 Tabelas →
                  </button>
                  <button
                    onClick={() => setZoom((z) => Math.max(0.6, Number((z - 0.15).toFixed(2))))}
                    style={{ padding: "5px 8px", borderRadius: "6px", background: "#161f33", border: "1px solid #29354d", color: "#cbd5e1", cursor: "pointer" }}
                    title="Diminuir Zoom"
                  >
                    <ZoomOut size={14} />
                  </button>
                  <button
                    onClick={() => {
                      setZoom(1);
                      setPan({ x: 0, y: 0 });
                    }}
                    style={{ padding: "5px 9px", borderRadius: "6px", background: "#161f33", border: "1px solid #29354d", color: "#cbd5e1", fontSize: "11px", cursor: "pointer" }}
                  >
                    <RotateCcw size={12} style={{ display: "inline", marginRight: 4 }} /> Enquadrar ({Math.round(zoom * 100)}%)
                  </button>
                  <button
                    onClick={() => setZoom((z) => Math.min(2.4, Number((z + 0.15).toFixed(2))))}
                    style={{ padding: "5px 8px", borderRadius: "6px", background: "#161f33", border: "1px solid #29354d", color: "#cbd5e1", cursor: "pointer" }}
                    title="Aumentar Zoom"
                  >
                    <ZoomIn size={14} />
                  </button>
                </div>
              </div>

              {/* Canvas SVG Interativo */}
              <div
                style={{
                  flex: 1,
                  minHeight: 0,
                  borderRadius: "14px",
                  border: "1px solid #1e293b",
                  background: "radial-gradient(ellipse at 50% 40%, #161f35 0%, #0b0f1a 75%)",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <svg
                  viewBox="0 0 1360 780"
                  style={{ width: "100%", height: "100%", display: "block", touchAction: "none", cursor: "grab" }}
                  onWheel={handleWheel}
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerCancel={handlePointerUp}
                >
                  <defs>
                    <marker id="ird-arrow-active" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                      <path d="M 0 0 L 10 5 L 0 10 z" fill="#34d399" />
                    </marker>
                    <marker id="ird-arrow-down" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                      <path d="M 0 0 L 10 5 L 0 10 z" fill="#f87171" />
                    </marker>
                    <marker id="ird-arrow-muted" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                      <path d="M 0 0 L 10 5 L 0 10 z" fill="#475569" />
                    </marker>
                  </defs>

                  <g transform={`translate(${pan.x} ${pan.y}) translate(680 390) scale(${zoom}) translate(-680 -390)`}>
                    {/* Raias Arquiteturais (5 Colunas) */}
                    {[
                      { x: 20, w: 205, title: "1. GATILHOS ISO 8583 / CAPTURA", sub: "DE 02 · DE 18 · DE 22 · DE 48 · DE 55", color: "#38bdf8" },
                      { x: 265, w: 230, title: "2. TABELAS GCMS / MPE (T068)", sub: "IP0030T1 · T161 · T164 · T160", color: "#fbbf24" },
                      { x: 535, w: 250, title: "3. DESIGNADORES IRD MASTERCARD", sub: "PDS 0158 · Tabela 76 (IA/JA/AU/HU/EIRF)", color: "#34d399" },
                      { x: 820, w: 245, title: "4. PROGRAMAS VISA (FPI) & ELO", sub: "PIDs F^ a I^ · Tabelas 3-12 a 3-38 · Elo", color: "#a78bfa" },
                      { x: 1100, w: 235, title: "5. TABELA T165 & LIQUIDAÇÃO", sub: "Alíquota % + Fixo ≤ Cap · VSS-120 / IPM", color: "#f472b6" },
                    ].map((lane, idx) => (
                      <g key={idx}>
                        <rect
                          x={lane.x}
                          y={18}
                          width={lane.w}
                          height={740}
                          rx={12}
                          fill="rgba(15, 23, 42, 0.48)"
                          stroke="rgba(51, 65, 85, 0.45)"
                          strokeDasharray="4 4"
                        />
                        <text x={lane.x + lane.w / 2} y={40} textAnchor="middle" fill={lane.color} fontSize="10.5" fontWeight="800" letterSpacing="0.8">
                          {lane.title}
                        </text>
                        <text x={lane.x + lane.w / 2} y={55} textAnchor="middle" fill="#64748b" fontSize="9.5">
                          {lane.sub}
                        </text>
                      </g>
                    ))}

                    {/* Arestas do Grafo */}
                    {IRD_GRAPH_EDGES.map((edge) => {
                      const a = IRD_GRAPH_NODES.find((n) => n.id === edge.from);
                      const b = IRD_GRAPH_NODES.find((n) => n.id === edge.to);
                      if (!a || !b) return null;
                      const isActive = qualificationResult.activeEdges.has(edge.id);
                      const isDowngrade = edge.kind === "downgrade";
                      const x1 = a.x + 88;
                      const y1 = a.y;
                      const x2 = b.x - 88;
                      const y2 = b.y;
                      const mx = (x1 + x2) / 2;
                      const my = (y1 + y2) / 2;
                      const d = `M ${x1},${y1} C ${mx},${y1} ${mx},${y2} ${x2},${y2}`;
                      const strokeColor = isActive
                        ? isDowngrade
                          ? "#f87171"
                          : "#34d399"
                        : "#334155";
                      const marker = isActive
                        ? isDowngrade
                          ? "url(#ird-arrow-down)"
                          : "url(#ird-arrow-active)"
                        : "url(#ird-arrow-muted)";

                      return (
                        <g key={edge.id} style={{ opacity: isActive ? 1 : 0.32 }}>
                          <path
                            d={d}
                            fill="none"
                            stroke={strokeColor}
                            strokeWidth={isActive ? 2.8 : 1.4}
                            strokeDasharray={isDowngrade ? "6 4" : undefined}
                            markerEnd={marker}
                          />
                          {isActive && (
                            <g transform={`translate(${mx}, ${my})`}>
                              <rect
                                x={-62}
                                y={-10}
                                width={124}
                                height={19}
                                rx={6}
                                fill="#0f172a"
                                stroke={strokeColor}
                                strokeWidth={1}
                              />
                              <text x={0} y={3} textAnchor="middle" fill="#f8fafc" fontSize="9.2" fontWeight="700">
                                {edge.label}
                              </text>
                            </g>
                          )}
                        </g>
                      );
                    })}

                    {/* Nós do Grafo (Cards/Pílulas Ricas) */}
                    {IRD_GRAPH_NODES.map((node) => {
                      const isActive = qualificationResult.activeNodes.has(node.id);
                      const isSelected = selectedNodeId === node.id;
                      const isTargetIrd = qualificationResult.irdFamilyNodeId === node.id;
                      const borderColor = isSelected
                        ? "#38bdf8"
                        : isTargetIrd
                        ? node.risk === "critico" || node.risk === "alto"
                          ? "#f87171"
                          : "#34d399"
                        : isActive
                        ? "#475569"
                        : "#1e293b";
                      const bgFill = isTargetIrd
                        ? node.risk === "critico" || node.risk === "alto"
                          ? "#3b1822"
                          : "#11332b"
                        : isSelected
                        ? "#172542"
                        : "#131b2e";

                      return (
                        <g
                          key={node.id}
                          data-node-id={node.id}
                          transform={`translate(${node.x}, ${node.y})`}
                          onClick={() => setSelectedNodeId(node.id)}
                          style={{ cursor: "pointer", opacity: isActive || isSelected ? 1 : 0.42 }}
                        >
                          <rect
                            x={-92}
                            y={-36}
                            width={184}
                            height={72}
                            rx={10}
                            fill={bgFill}
                            stroke={borderColor}
                            strokeWidth={isSelected || isTargetIrd ? 2.6 : 1.4}
                          />
                          {/* Badge Código Superior */}
                          <rect
                            x={-84}
                            y={-29}
                            width={108}
                            height={16}
                            rx={4}
                            fill={isTargetIrd ? "rgba(16,185,129,0.22)" : "rgba(56,189,248,0.14)"}
                          />
                          <text x={-30} y={-18} textAnchor="middle" fill={isTargetIrd ? "#6ee7b7" : "#7dd3fc"} fontSize="9.2" fontWeight="800">
                            {node.code}
                          </text>
                          {/* Badge Taxa Típica */}
                          <text x={82} y={-18} textAnchor="end" fill="#fbbf24" fontSize="8.8" fontWeight="700">
                            {node.typicalRate.slice(0, 14)}
                          </text>
                          {/* Título Principal */}
                          <text x={-82} y={1} fill="#f8fafc" fontSize="10.8" fontWeight="700">
                            {node.label.length > 26 ? node.label.slice(0, 25) + "…" : node.label}
                          </text>
                          {/* Subtítulo */}
                          <text x={-82} y={17} fill="#94a3b8" fontSize="9.2">
                            {node.sublabel.length > 30 ? node.sublabel.slice(0, 29) + "…" : node.sublabel}
                          </text>
                          {isTargetIrd && (
                            <text x={-82} y={30} fill={node.risk === "critico" || node.risk === "alto" ? "#fca5a5" : "#34d399"} fontSize="8.8" fontWeight="800">
                              ★ QUALIFICADO NO SIMULADOR ({qualificationResult.ratePct.toFixed(2).replace(".", ",")}%)
                            </text>
                          )}
                        </g>
                      );
                    })}
                  </g>
                </svg>

                <div
                  style={{
                    position: "absolute",
                    bottom: 10,
                    left: 14,
                    fontSize: "11px",
                    color: "#94a3b8",
                    background: "rgba(15, 23, 42, 0.85)",
                    padding: "4px 10px",
                    borderRadius: "6px",
                    border: "1px solid #1e293b",
                    pointerEvents: "none",
                  }}
                >
                  Use a roda do mouse (scroll) para zoom · Arraste o fundo para mover · Clique em qualquer IRD, Tabela GCMS ou Programa Visa para inspecionar e filtrar as 2.103 alíquotas
                </div>
              </div>
            </div>
          )}

          {activeMode === "tables" && (
            <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0, gap: "10px" }}>
              {/* Barra de Filtros da Tabela de 2.103 Regras */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1.6fr repeat(5, 1fr) auto",
                  gap: "8px",
                  background: "#131b2e",
                  padding: "10px 12px",
                  borderRadius: "10px",
                  border: "1px solid #1e293b",
                  alignItems: "center",
                }}
              >
                <div style={{ position: "relative" }}>
                  <Search size={14} style={{ position: "absolute", left: 10, top: 9, color: "#64748b" }} />
                  <input
                    value={tableSearch}
                    onChange={(e) => {
                      setTableSearch(e.target.value);
                      setSelectedTableRowIdx(0);
                    }}
                    placeholder="Buscar IRD (IA, AU, HU, IV), PID (F^, I^), Tabela (3-12, 76), Segmento…"
                    style={{
                      width: "100%",
                      padding: "6px 10px 6px 30px",
                      background: "#0b0f1a",
                      border: "1px solid #29354d",
                      borderRadius: "7px",
                      color: "#f8fafc",
                      fontSize: "12px",
                    }}
                  />
                </div>

                <select
                  value={tableBrand}
                  onChange={(e) => {
                    setTableBrand(e.target.value);
                    setSelectedTableRowIdx(0);
                  }}
                  style={{ background: "#0b0f1a", color: "#e2e8f0", border: "1px solid #29354d", borderRadius: "7px", padding: "6px 8px", fontSize: "11.5px" }}
                >
                  <option value="">Todas as Bandeiras (2.103)</option>
                  <option value="Visa">Visa (866 regras)</option>
                  <option value="Mastercard">Mastercard (820 regras)</option>
                  <option value="Elo">Elo (417 regras)</option>
                </select>

                <select
                  value={tableModalidade}
                  onChange={(e) => {
                    setTableModalidade(e.target.value);
                    setSelectedTableRowIdx(0);
                  }}
                  style={{ background: "#0b0f1a", color: "#e2e8f0", border: "1px solid #29354d", borderRadius: "7px", padding: "6px 8px", fontSize: "11.5px" }}
                >
                  <option value="">Todas Modalidades</option>
                  <option value="Crédito">Crédito</option>
                  <option value="Débito">Débito</option>
                  <option value="Pré-pago">Pré-pago</option>
                </select>

                <select
                  value={tableTipoRegra}
                  onChange={(e) => {
                    setTableTipoRegra(e.target.value);
                    setSelectedTableRowIdx(0);
                  }}
                  style={{ background: "#0b0f1a", color: "#e2e8f0", border: "1px solid #29354d", borderRadius: "7px", padding: "6px 8px", fontSize: "11.5px" }}
                >
                  <option value="">Todos Tipos de Regra</option>
                  <option value="Taxa Base">Taxa Base (1.128)</option>
                  <option value="Acréscimo (+)">Acréscimo (+) (594)</option>
                  <option value="Desconto (-)">Desconto (-) (251)</option>
                  <option value="Large Ticket (Fixo + %)">Large Ticket (Fixo + %)</option>
                  <option value="Teto Fixo (Cap)">Teto Fixo (Cap)</option>
                </select>

                <select
                  value={tableIrdFilter}
                  onChange={(e) => {
                    setTableIrdFilter(e.target.value);
                    setSelectedTableRowIdx(0);
                  }}
                  style={{ background: "#0b0f1a", color: "#e2e8f0", border: "1px solid #29354d", borderRadius: "7px", padding: "6px 8px", fontSize: "11.5px" }}
                >
                  <option value="">Todos IRDs / PIDs / Tabelas</option>
                  <optgroup label="Mastercard IRDs (Table 76)">
                    <option value="IRD IA">IRD IA (Físico Chip 1x)</option>
                    <option value="IRD JÁ">IRD JÁ (Contactless 1x)</option>
                    <option value="IRD AU">IRD AU (E-com 3DS 1x)</option>
                    <option value="IRD HU">IRD HU (E-com s/ 3DS 1x)</option>
                    <option value="IRD AV">IRD AV (E-com 3DS 2-6x)</option>
                    <option value="IRD HV">IRD HV (E-com s/ 3DS 2-6x)</option>
                    <option value="IRD IV">IRD IV (Físico Chip 2-6x)</option>
                    <option value="IRD JV">IRD JV (Contactless 2-6x)</option>
                    <option value="IRD AW">IRD AW (E-com 3DS 7-21x)</option>
                    <option value="IRD HW">IRD HW (E-com s/ 3DS 7-21x)</option>
                    <option value="IRD IW">IRD IW (Físico Chip 7-21x)</option>
                    <option value="IRD JW">IRD JW (Contactless 7-21x)</option>
                    <option value="IRD VF">IRD VF / VG / VH / VI (Déb/Pré)</option>
                  </optgroup>
                  <optgroup label="Visa PIDs & Tabelas">
                    <option value="PID F^">PID F^ (Visa Classic)</option>
                    <option value="PID P^">PID P^ (Visa Gold)</option>
                    <option value="PID N^">PID N^ (Visa Platinum)</option>
                    <option value="PID C^">PID C^ (Visa Signature)</option>
                    <option value="PID I^">PID I^ (Visa Infinite)</option>
                    <option value="TABLE 3-12">TABLE 3-12 (Débito SPUR1)</option>
                    <option value="Supermarket">Supermarket Fee Program</option>
                    <option value="Other Merchants">Other Merchants Fee Program</option>
                  </optgroup>
                </select>

                <select
                  value={tableSegmento}
                  onChange={(e) => {
                    setTableSegmento(e.target.value);
                    setSelectedTableRowIdx(0);
                  }}
                  style={{ background: "#0b0f1a", color: "#e2e8f0", border: "1px solid #29354d", borderRadius: "7px", padding: "6px 8px", fontSize: "11.5px" }}
                >
                  <option value="">Todos Segmentos MCC</option>
                  <option value="Base">Base / Geral</option>
                  <option value="SprMkt">SprMkt (Supermercados MC)</option>
                  <option value="GovSvc">GovSvc (Governo MC)</option>
                  <option value="GenEx">GenEx (Despesas Gerais MC)</option>
                  <option value="CommT">CommT (Transporte MC)</option>
                  <option value="Whole">Whole (Atacadistas MC)</option>
                  <option value="MM">MM (Micro Merchant MC)</option>
                  <option value="Supermercados">Supermercados (Elo/Visa)</option>
                </select>

                <button
                  onClick={() => {
                    setTableSearch("");
                    setTableBrand("");
                    setTableModalidade("");
                    setTableTipoRegra("");
                    setTableSegmento("");
                    setTableIrdFilter("");
                    setSelectedTableRowIdx(0);
                  }}
                  style={{
                    padding: "6px 10px",
                    borderRadius: "7px",
                    background: "#1e293b",
                    border: "1px solid #334155",
                    color: "#cbd5e1",
                    fontSize: "11.5px",
                    cursor: "pointer",
                  }}
                >
                  Limpar ({filteredIntercambioRows.length})
                </button>
              </div>

              {/* Tabela Interativa com Cálculo em R$ em Tempo Real */}
              <div
                style={{
                  flex: 1,
                  minHeight: 0,
                  overflow: "auto",
                  borderRadius: "10px",
                  border: "1px solid #1e293b",
                  background: "#0f1523",
                }}
              >
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11.5px" }}>
                  <thead>
                    <tr style={{ position: "sticky", top: 0, background: "#161f33", color: "#94a3b8", textAlign: "left", zIndex: 2 }}>
                      <th style={{ padding: "9px 10px", borderBottom: "1px solid #263147" }}>Bandeira</th>
                      <th style={{ padding: "9px 10px", borderBottom: "1px solid #263147" }}>Mod. / Regra</th>
                      <th style={{ padding: "9px 10px", borderBottom: "1px solid #263147" }}>Tabela / Programa</th>
                      <th style={{ padding: "9px 10px", borderBottom: "1px solid #263147" }}>Designador (IRD / PID)</th>
                      <th style={{ padding: "9px 10px", borderBottom: "1px solid #263147" }}>Segmento MCC</th>
                      <th style={{ padding: "9px 10px", borderBottom: "1px solid #263147" }}>Captura & Parcelas</th>
                      <th style={{ padding: "9px 10px", borderBottom: "1px solid #263147", textAlign: "right" }}>Alíquota %</th>
                      <th style={{ padding: "9px 10px", borderBottom: "1px solid #263147", textAlign: "right" }}>Fixo / Cap</th>
                      <th style={{ padding: "9px 10px", borderBottom: "1px solid #263147", textAlign: "right", color: "#34d399" }}>
                        Custo p/ R$ {simValor}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredIntercambioRows.slice(0, 350).map((row, idx) => {
                      const isSel = idx === selectedTableRowIdx;
                      const calc = computeRowBrl(row, simValor);
                      const brandColor =
                        row.bandeira === "Visa" ? "#60a5fa" : row.bandeira === "Mastercard" ? "#fbbf24" : "#34d399";
                      return (
                        <tr
                          key={idx}
                          onClick={() => setSelectedTableRowIdx(idx)}
                          style={{
                            cursor: "pointer",
                            background: isSel ? "rgba(56, 189, 248, 0.14)" : idx % 2 === 0 ? "#0f1523" : "#12192b",
                            borderBottom: "1px solid #1e293b",
                          }}
                        >
                          <td style={{ padding: "8px 10px", fontWeight: 700, color: brandColor }}>{row.bandeira}</td>
                          <td style={{ padding: "8px 10px" }}>
                            <span style={{ color: "#f8fafc", fontWeight: 600 }}>{row.modalidade}</span>
                            <div style={{ fontSize: "10px", color: "#64748b" }}>{row.tipo_regra}</div>
                          </td>
                          <td style={{ padding: "8px 10px" }}>
                            <strong style={{ color: "#cbd5e1" }}>{row.tabela}</strong>
                            <div style={{ fontSize: "10px", color: "#64748b", maxWidth: "210px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {row.programa}
                            </div>
                          </td>
                          <td style={{ padding: "8px 10px" }}>
                            <code
                              style={{
                                padding: "2px 6px",
                                borderRadius: "5px",
                                background: "rgba(16, 185, 129, 0.12)",
                                color: "#6ee7b7",
                                fontWeight: 700,
                                fontSize: "11px",
                              }}
                            >
                              {row.produto_ird}
                            </code>
                          </td>
                          <td style={{ padding: "8px 10px", fontWeight: 600, color: "#e2e8f0" }}>{row.segmento}</td>
                          <td style={{ padding: "8px 10px", fontSize: "10.5px", color: "#94a3b8" }}>
                            <div>{row.captura}</div>
                            <div style={{ color: "#64748b" }}>{row.parcelas}</div>
                          </td>
                          <td style={{ padding: "8px 10px", textAlign: "right", fontWeight: 800, color: "#f8fafc", fontFamily: "Consolas, monospace" }}>
                            {calc.aliq.toFixed(2).replace(".", ",")}%
                          </td>
                          <td style={{ padding: "8px 10px", textAlign: "right", fontSize: "10.5px", color: "#94a3b8", fontFamily: "Consolas, monospace" }}>
                            {row.valor_fixo_brl ? `+R$ ${Number(row.valor_fixo_brl).toFixed(2)}` : ""}
                            {row.teto_brl ? `Cap R$ ${Number(row.teto_brl).toFixed(2)}` : !row.valor_fixo_brl ? "—" : ""}
                          </td>
                          <td style={{ padding: "8px 10px", textAlign: "right", fontWeight: 800, color: "#34d399", fontFamily: "Consolas, monospace" }}>
                            R$ {calc.total.toFixed(2).replace(".", ",")}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {filteredIntercambioRows.length > 350 && (
                  <div style={{ padding: "10px", textAlign: "center", fontSize: "11px", color: "#94a3b8", background: "#161f33" }}>
                    Exibindo as primeiras 350 de {filteredIntercambioRows.length} regras filtradas. Use a busca ou filtros acima para refinar.
                  </div>
                )}
              </div>
            </div>
          )}

          {activeMode === "mccs" && (
            <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0, gap: "10px" }}>
              {/* Barra de Busca de MCC / PID */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "10px",
                  background: "#131b2e",
                  padding: "10px 14px",
                  borderRadius: "10px",
                  border: "1px solid #1e293b",
                  flexWrap: "wrap",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1 }}>
                  <Search size={15} style={{ color: "#94a3b8" }} />
                  <input
                    value={mccSearch}
                    onChange={(e) => setMccSearch(e.target.value)}
                    placeholder="Digite um código MCC (ex: 4111, 4814, 5411, 5968, 8220) ou nome do segmento…"
                    style={{
                      width: "100%",
                      maxWidth: "460px",
                      padding: "6px 10px",
                      background: "#0b0f1a",
                      border: "1px solid #29354d",
                      borderRadius: "7px",
                      color: "#f8fafc",
                      fontSize: "12px",
                    }}
                  />
                </div>
                <div style={{ display: "flex", gap: "6px" }}>
                  <button
                    onClick={() => setMccBrandTab("mastercard")}
                    style={{
                      padding: "6px 12px",
                      borderRadius: "7px",
                      fontSize: "11.5px",
                      fontWeight: 700,
                      background: mccBrandTab === "mastercard" ? "rgba(245,158,11,0.18)" : "#0b0f1a",
                      color: mccBrandTab === "mastercard" ? "#fbbf24" : "#94a3b8",
                      border: mccBrandTab === "mastercard" ? "1px solid rgba(245,158,11,0.45)" : "1px solid #29354d",
                      cursor: "pointer",
                    }}
                  >
                    Mastercard Segmentos (76 MCCs + 7 Siglas)
                  </button>
                  <button
                    onClick={() => setMccBrandTab("visa")}
                    style={{
                      padding: "6px 12px",
                      borderRadius: "7px",
                      fontSize: "11.5px",
                      fontWeight: 700,
                      background: mccBrandTab === "visa" ? "rgba(59,130,246,0.18)" : "#0b0f1a",
                      color: mccBrandTab === "visa" ? "#60a5fa" : "#94a3b8",
                      border: mccBrandTab === "visa" ? "1px solid rgba(59,130,246,0.45)" : "1px solid #29354d",
                      cursor: "pointer",
                    }}
                  >
                    Visa Critérios NNSS (326 MCCs + 21 PIDs)
                  </button>
                  <button
                    onClick={() => setMccBrandTab("elo")}
                    style={{
                      padding: "6px 12px",
                      borderRadius: "7px",
                      fontSize: "11.5px",
                      fontWeight: 700,
                      background: mccBrandTab === "elo" ? "rgba(16,185,129,0.18)" : "#0b0f1a",
                      color: mccBrandTab === "elo" ? "#34d399" : "#94a3b8",
                      border: mccBrandTab === "elo" ? "1px solid rgba(16,185,129,0.45)" : "1px solid #29354d",
                      cursor: "pointer",
                    }}
                  >
                    Elo Segmentos & Redução Fee (381 MCCs)
                  </button>
                </div>
              </div>

              <div style={{ flex: 1, minHeight: 0, overflow: "auto", display: "grid", gridTemplateColumns: "1fr 340px", gap: "12px" }}>
                {/* Lista Principal de MCCs da Bandeira Selecionada */}
                <div style={{ borderRadius: "10px", border: "1px solid #1e293b", background: "#0f1523", overflow: "auto" }}>
                  {mccBrandTab === "mastercard" && (
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11.5px" }}>
                      <thead>
                        <tr style={{ position: "sticky", top: 0, background: "#161f33", color: "#94a3b8", textAlign: "left" }}>
                          <th style={{ padding: "9px 12px", borderBottom: "1px solid #263147" }}>MCC (DE 18)</th>
                          <th style={{ padding: "9px 12px", borderBottom: "1px solid #263147" }}>Segmento GCMS (T161)</th>
                          <th style={{ padding: "9px 12px", borderBottom: "1px solid #263147" }}>Descrição Oficial Mastercard</th>
                          <th style={{ padding: "9px 12px", borderBottom: "1px solid #263147" }}>Ação</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tabelasFees.mastercard_mcc_segmentos
                          .filter(
                            (m) =>
                              !mccSearch.trim() ||
                              `${m.mcc} ${m.categoria} ${m.descricao}`.toLowerCase().includes(mccSearch.toLowerCase())
                          )
                          .map((m, i) => (
                            <tr key={i} style={{ borderBottom: "1px solid #1e293b" }}>
                              <td style={{ padding: "8px 12px", fontWeight: 800, color: "#fbbf24", fontFamily: "Consolas, monospace" }}>
                                {m.mcc}
                              </td>
                              <td style={{ padding: "8px 12px", fontWeight: 700, color: "#34d399" }}>{m.categoria}</td>
                              <td style={{ padding: "8px 12px", color: "#cbd5e1" }}>{m.descricao}</td>
                              <td style={{ padding: "8px 12px" }}>
                                <button
                                  onClick={() => {
                                    setTableBrand("Mastercard");
                                    setTableSearch(m.categoria.split(" ")[0]);
                                    setActiveMode("tables");
                                  }}
                                  style={{
                                    padding: "3px 8px",
                                    borderRadius: "5px",
                                    fontSize: "10.5px",
                                    background: "rgba(59,130,246,0.15)",
                                    border: "1px solid rgba(59,130,246,0.4)",
                                    color: "#93c5fd",
                                    cursor: "pointer",
                                  }}
                                >
                                  Ver Tarifas →
                                </button>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  )}

                  {mccBrandTab === "visa" && (
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11.5px" }}>
                      <thead>
                        <tr style={{ position: "sticky", top: 0, background: "#161f33", color: "#94a3b8", textAlign: "left" }}>
                          <th style={{ padding: "9px 12px", borderBottom: "1px solid #263147" }}>MCC Início / Fim</th>
                          <th style={{ padding: "9px 12px", borderBottom: "1px solid #263147" }}>Tabela NNSS</th>
                          <th style={{ padding: "9px 12px", borderBottom: "1px solid #263147" }}>Programa / Categoria de Edição Visa</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tabelasFees.visa_mcc_criterios
                          .filter(
                            (m) =>
                              !mccSearch.trim() ||
                              `${m.mcc_inicio} ${m.mcc_fim} ${m.tabela} ${m.categoria} ${m.criterios}`.toLowerCase().includes(mccSearch.toLowerCase())
                          )
                          .map((m, i) => (
                            <tr key={i} style={{ borderBottom: "1px solid #1e293b" }}>
                              <td style={{ padding: "8px 12px", fontWeight: 800, color: "#60a5fa", fontFamily: "Consolas, monospace" }}>
                                {m.mcc_inicio}
                                {m.mcc_fim ? ` – ${m.mcc_fim}` : ""}
                              </td>
                              <td style={{ padding: "8px 12px", fontWeight: 700, color: "#cbd5e1" }}>{m.tabela}</td>
                              <td style={{ padding: "8px 12px", color: "#94a3b8" }}>
                                <strong style={{ color: "#e2e8f0" }}>{m.categoria}</strong>
                                <div style={{ fontSize: "10px" }}>{m.criterios}</div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  )}

                  {mccBrandTab === "elo" && (
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11.5px" }}>
                      <thead>
                        <tr style={{ position: "sticky", top: 0, background: "#161f33", color: "#94a3b8", textAlign: "left" }}>
                          <th style={{ padding: "9px 12px", borderBottom: "1px solid #263147" }}>MCC</th>
                          <th style={{ padding: "9px 12px", borderBottom: "1px solid #263147" }}>Débito (71 Ant → Novo)</th>
                          <th style={{ padding: "9px 12px", borderBottom: "1px solid #263147" }}>Créd. Vista (70 Ant → Novo)</th>
                          <th style={{ padding: "9px 12px", borderBottom: "1px solid #263147" }}>Parc 2-6x / 7-12x</th>
                          <th style={{ padding: "9px 12px", borderBottom: "1px solid #263147" }}>Crediário (330) / Carnê (377)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tabelasFees.elo_mcc_reducao
                          .filter((m) => !mccSearch.trim() || m.mcc.toLowerCase().includes(mccSearch.toLowerCase()))
                          .slice(0, 200)
                          .map((m, i) => (
                            <tr key={i} style={{ borderBottom: "1px solid #1e293b", fontFamily: "Consolas, monospace" }}>
                              <td style={{ padding: "8px 12px", fontWeight: 800, color: "#34d399" }}>MCC {m.mcc}</td>
                              <td style={{ padding: "8px 12px", color: "#cbd5e1" }}>
                                {m.fee_debito_71_antigo}% → <strong style={{ color: "#34d399" }}>{m.fee_debito_71_novo}%</strong>
                              </td>
                              <td style={{ padding: "8px 12px", color: "#cbd5e1" }}>
                                {m.fee_cred_vista_70_antigo}% → <strong style={{ color: "#60a5fa" }}>{m.fee_cred_vista_70_novo}%</strong>
                              </td>
                              <td style={{ padding: "8px 12px", color: "#cbd5e1" }}>
                                {m.fee_parc_2_6_novo}% / {m.fee_parc_7_12_novo}%
                              </td>
                              <td style={{ padding: "8px 12px", color: "#fbbf24" }}>
                                {m.fee_crediario_330_novo}% / {m.fee_carne_377_novo}%
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  )}
                </div>

                {/* Coluna Auxiliar: Dicionário de Siglas Mastercard + 21 PIDs Visa */}
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", overflow: "auto" }}>
                  <div style={{ background: "#131b2e", border: "1px solid #1e293b", borderRadius: "10px", padding: "12px" }}>
                    <h3 style={{ margin: "0 0 8px", fontSize: "12.5px", fontWeight: 800, color: "#fbbf24" }}>
                      Siglas de Segmentos Mastercard (Table 76)
                    </h3>
                    <div style={{ display: "grid", gap: "6px" }}>
                      {tabelasFees.mastercard_codigos.map((c, i) => (
                        <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: "11.5px", padding: "5px 8px", background: "#0b0f1a", borderRadius: "6px" }}>
                          <code style={{ color: "#34d399", fontWeight: 700 }}>{c.sigla}</code>
                          <span style={{ color: "#cbd5e1" }}>{c.descricao}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ background: "#131b2e", border: "1px solid #1e293b", borderRadius: "10px", padding: "12px" }}>
                    <h3 style={{ margin: "0 0 8px", fontSize: "12.5px", fontWeight: 800, color: "#60a5fa" }}>
                      Catálogo Oficial de 21 PIDs Visa Brasil
                    </h3>
                    <div style={{ display: "grid", gap: "5px", maxHeight: "340px", overflow: "auto" }}>
                      {tabelasFees.visa_pids.map((p, i) => (
                        <div
                          key={i}
                          onClick={() => {
                            setTableBrand("Visa");
                            setTableIrdFilter(`PID ${p.pid}`);
                            setActiveMode("tables");
                          }}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            fontSize: "11px",
                            padding: "5px 8px",
                            background: "#0b0f1a",
                            borderRadius: "6px",
                            cursor: "pointer",
                            border: "1px solid transparent",
                          }}
                        >
                          <code style={{ color: "#60a5fa", fontWeight: 800 }}>PID {p.pid}</code>
                          <span style={{ color: "#e2e8f0" }}>{p.produto}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeMode === "gcms" && (
            <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0, gap: "10px", overflow: "auto" }}>
              {/* Cabeçalho Forense do Arquivo Real T068 */}
              <div
                style={{
                  background: "linear-gradient(90deg, rgba(245,158,11,0.12) 0%, rgba(19,27,46,0.95) 100%)",
                  border: "1px solid rgba(245,158,11,0.35)",
                  borderRadius: "10px",
                  padding: "12px 16px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "12px",
                }}
              >
                <div>
                  <div style={{ fontSize: "10.5px", fontWeight: 800, color: "#fbbf24", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    Extrato Físico MPE / GCMS Parameter Extract (T068)
                  </div>
                  <h3 style={{ margin: "2px 0", fontSize: "14px", color: "#f8fafc" }}>
                    Arquivo: <code>{t068Forense.file_info.filename}</code> ({t068Forense.file_info.file_size_mb} MB · {t068Forense.file_info.total_physical_blocks.toLocaleString("pt-BR")} blocos de {t068Forense.file_info.block_size} bytes)
                  </h3>
                  <div style={{ fontSize: "11px", color: "#94a3b8", fontFamily: "Consolas, monospace" }}>
                    Header ASCII: {t068Forense.file_info.file_header.raw_ascii.trim()} · Trailer: 0x{t068Forense.file_info.trailer_hex} ({t068Forense.file_info.trailer_ebcdic_desc})
                  </div>
                </div>
                <input
                  value={gcmsSearch}
                  onChange={(e) => setGcmsSearch(e.target.value)}
                  placeholder="Filtrar tabela (ex: T165, T164, IP0030T1, IP0008T1)…"
                  style={{
                    width: "280px",
                    padding: "6px 10px",
                    background: "#0b0f1a",
                    border: "1px solid #29354d",
                    borderRadius: "7px",
                    color: "#f8fafc",
                    fontSize: "12px",
                  }}
                />
              </div>

              {/* Grid de Tabelas Funcionais GCMS + Amostra Forense de Blocos Físicos */}
              <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: "12px", flex: 1, minHeight: 0, overflow: "auto" }}>
                {/* Lista das Tabelas Mestre GCMS (T165, T164, T161, IP0030T1...) */}
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", overflow: "auto", paddingRight: "4px" }}>
                  <h4 style={{ margin: 0, fontSize: "12px", color: "#94a3b8", textTransform: "uppercase" }}>
                    Tabelas de Qualificação, Roteamento e Clearing GCMS ({gcmsTables.length} Tabelas Chave)
                  </h4>
                  {gcmsTables
                    .filter(
                      (t) =>
                        !gcmsSearch.trim() ||
                        `${t.table} ${t.name} ${t.description} ${t.usage}`.toLowerCase().includes(gcmsSearch.toLowerCase())
                    )
                    .map((t: GcmsTableItem) => {
                      const isSel = selectedGcmsTable === t.table;
                      return (
                        <div
                          key={t.table}
                          onClick={() => setSelectedGcmsTable(t.table)}
                          style={{
                            padding: "10px 12px",
                            borderRadius: "9px",
                            background: isSel ? "rgba(245, 158, 11, 0.14)" : "#131b2e",
                            border: isSel ? "1px solid rgba(245, 158, 11, 0.5)" : "1px solid #1e293b",
                            cursor: "pointer",
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                            <span style={{ fontWeight: 800, color: "#fbbf24", fontSize: "13px", fontFamily: "Consolas, monospace" }}>
                              {t.table} — {t.name}
                            </span>
                            <span style={{ fontSize: "10.5px", padding: "2px 7px", borderRadius: "4px", background: "#0b0f1a", color: "#38bdf8" }}>
                              {t.usage}
                            </span>
                          </div>
                          <p style={{ margin: "0 0 6px", fontSize: "11.5px", color: "#cbd5e1" }}>{t.description}</p>
                          <div style={{ fontSize: "11px", color: "#34d399", marginBottom: "6px" }}>
                            <strong>Impacto Operacional:</strong> {t.impact}
                          </div>
                          <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
                            {t.fields.map((f, idx) => (
                              <code
                                key={idx}
                                style={{
                                  fontSize: "10px",
                                  padding: "2px 6px",
                                  borderRadius: "4px",
                                  background: "#0b0f1a",
                                  border: "1px solid #263147",
                                  color: "#94a3b8",
                                }}
                              >
                                {f}
                              </code>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                </div>

                {/* Catálogo Físico IP0000T1 + Blocos 1014 bytes do arquivo T068 */}
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", overflow: "auto" }}>
                  <div style={{ background: "#131b2e", border: "1px solid #1e293b", borderRadius: "10px", padding: "12px" }}>
                    <h4 style={{ margin: "0 0 8px", fontSize: "12px", color: "#fbbf24", textTransform: "uppercase" }}>
                      Amostra de Blocos Físicos (1012B Payload + 2B Trailer 0x4040)
                    </h4>
                    {t068Forense.physical_blocks_sample.slice(0, 3).map((b) => (
                      <div
                        key={b.block_number}
                        style={{
                          marginBottom: "8px",
                          padding: "8px",
                          background: "#0b0f1a",
                          borderRadius: "7px",
                          border: "1px solid #1e293b",
                          fontFamily: "Consolas, monospace",
                          fontSize: "10.5px",
                        }}
                      >
                        <div style={{ color: "#38bdf8", fontWeight: 700, marginBottom: "3px" }}>
                          Bloco #{b.block_number} · Bytes {b.byte_offset_start}–{b.byte_offset_end} · Trailer: 0x{b.trailer_hex} (&quot;{b.trailer_ascii}&quot;)
                        </div>
                        <div style={{ color: "#cbd5e1", wordBreak: "break-all", marginBottom: "4px" }}>
                          {b.ascii_preview}
                        </div>
                        <div style={{ color: "#64748b", wordBreak: "break-all", fontSize: "9.5px" }}>
                          HEX: {b.hex_preview}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ background: "#131b2e", border: "1px solid #1e293b", borderRadius: "10px", padding: "12px", flex: 1, overflow: "auto" }}>
                    <h4 style={{ margin: "0 0 8px", fontSize: "12px", color: "#34d399", textTransform: "uppercase" }}>
                      Catálogo Extraído do Registro IP0000T1 ({t068Forense.tables_catalog.length} Tabelas)
                    </h4>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px", fontFamily: "Consolas, monospace" }}>
                      <thead>
                        <tr style={{ textAlign: "left", color: "#94a3b8", borderBottom: "1px solid #263147" }}>
                          <th style={{ padding: "5px" }}>Table ID</th>
                          <th style={{ padding: "5px" }}>Descrição</th>
                          <th style={{ padding: "5px", textAlign: "right" }}>Rec Len</th>
                        </tr>
                      </thead>
                      <tbody>
                        {t068Forense.tables_catalog
                          .filter(
                            (tc) =>
                              !gcmsSearch.trim() ||
                              `${tc.table_id} ${tc.desc}`.toLowerCase().includes(gcmsSearch.toLowerCase())
                          )
                          .slice(0, 80)
                          .map((tc, i) => (
                            <tr key={i} style={{ borderBottom: "1px solid #1e293b" }}>
                              <td style={{ padding: "5px", color: "#fbbf24", fontWeight: 700 }}>{tc.table_id}</td>
                              <td style={{ padding: "5px", color: "#cbd5e1" }}>{tc.desc.trim()}</td>
                              <td style={{ padding: "5px", textAlign: "right", color: "#94a3b8" }}>{tc.rec_len}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ─── Coluna Direita: Inspetor Forense de IRD / Alíquota / Tabela ─── */}
        <aside
          style={{
            borderLeft: "1px solid #1e293b",
            background: "#0f1422",
            padding: "16px",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "14px",
          }}
        >
          {activeMode === "tables" && selectedTableRow ? (
            <>
              <div>
                <div style={{ fontSize: "10px", fontWeight: 800, color: "#60a5fa", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  Inspetor de Alíquota Oficial · {selectedTableRow.bandeira}
                </div>
                <h3 style={{ margin: "4px 0", fontSize: "16px", color: "#f8fafc" }}>
                  {selectedTableRow.produto_ird}
                </h3>
                <div style={{ fontSize: "12px", color: "#94a3b8" }}>
                  {selectedTableRow.tabela} · {selectedTableRow.programa}
                </div>
              </div>

              <button
                onClick={() => handleSendRowToDocStudio(selectedTableRow)}
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  borderRadius: "8px",
                  background: "rgba(16, 185, 129, 0.16)",
                  border: "1px solid rgba(16, 185, 129, 0.45)",
                  color: "#34d399",
                  fontWeight: 700,
                  fontSize: "12px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                }}
              >
                <FileText size={14} /> Gerar Memória de Cálculo no Doc Studio (/editor)
              </button>

              {/* Card Financeiro da Linha Selecionada */}
              {(() => {
                const calc = computeRowBrl(selectedTableRow, simValor);
                return (
                  <div
                    style={{
                      background: "#141c2f",
                      border: "1px solid #263147",
                      borderRadius: "10px",
                      padding: "12px",
                    }}
                  >
                    <div style={{ fontSize: "11px", color: "#94a3b8", marginBottom: "8px" }}>
                      Simulação para Ticket de <strong>R$ {simValor.toFixed(2).replace(".", ",")}</strong>:
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                      <div style={{ background: "#0b0f1a", padding: "8px 10px", borderRadius: "7px" }}>
                        <div style={{ fontSize: "10px", color: "#64748b" }}>Alíquota Nominal</div>
                        <div style={{ fontSize: "16px", fontWeight: 800, color: "#f8fafc" }}>
                          {calc.aliq.toFixed(2).replace(".", ",")}%
                        </div>
                      </div>
                      <div style={{ background: "#0b0f1a", padding: "8px 10px", borderRadius: "7px" }}>
                        <div style={{ fontSize: "10px", color: "#64748b" }}>Intercâmbio em R$</div>
                        <div style={{ fontSize: "16px", fontWeight: 800, color: "#34d399" }}>
                          R$ {calc.total.toFixed(2).replace(".", ",")}
                        </div>
                      </div>
                    </div>
                    {(selectedTableRow.valor_fixo_brl || selectedTableRow.teto_brl) && (
                      <div style={{ marginTop: "8px", fontSize: "11px", color: "#fbbf24" }}>
                        {selectedTableRow.valor_fixo_brl ? `Adicional Fixo: R$ ${Number(selectedTableRow.valor_fixo_brl).toFixed(2)} ` : ""}
                        {selectedTableRow.teto_brl ? `· Teto Máximo (Cap): R$ ${Number(selectedTableRow.teto_brl).toFixed(2)}` : ""}
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Metadados da Regra */}
              <div style={{ background: "#141c2f", border: "1px solid #1e293b", borderRadius: "10px", padding: "12px", fontSize: "12px" }}>
                <div style={{ display: "grid", gap: "8px" }}>
                  <div>
                    <span style={{ color: "#64748b", fontSize: "11px", display: "block" }}>Modalidade & Tipo de Regra</span>
                    <strong style={{ color: "#e2e8f0" }}>
                      {selectedTableRow.modalidade} · {selectedTableRow.tipo_regra}
                    </strong>
                  </div>
                  <div>
                    <span style={{ color: "#64748b", fontSize: "11px", display: "block" }}>Segmento Econômico (MCC)</span>
                    <strong style={{ color: "#34d399" }}>{selectedTableRow.segmento}</strong>
                  </div>
                  <div>
                    <span style={{ color: "#64748b", fontSize: "11px", display: "block" }}>Condição de Captura & Canal</span>
                    <span style={{ color: "#cbd5e1" }}>{selectedTableRow.captura}</span>
                  </div>
                  <div>
                    <span style={{ color: "#64748b", fontSize: "11px", display: "block" }}>Faixa de Parcelamento</span>
                    <span style={{ color: "#cbd5e1" }}>{selectedTableRow.parcelas}</span>
                  </div>
                  <div>
                    <span style={{ color: "#64748b", fontSize: "11px", display: "block" }}>Planilha / Fonte Auditável</span>
                    <code style={{ color: "#93c5fd", fontSize: "11px" }}>{selectedTableRow.fonte}</code>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Inspetor do Nó Selecionado no Grafo de IRDs */}
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                  <span
                    style={{
                      fontSize: "10.5px",
                      fontWeight: 800,
                      padding: "2px 8px",
                      borderRadius: "5px",
                      background: "rgba(56, 189, 248, 0.14)",
                      color: "#38bdf8",
                    }}
                  >
                    {selectedNode.code}
                  </span>
                  <span style={{ fontSize: "11px", color: "#94a3b8" }}>{selectedNode.brand}</span>
                </div>
                <h3 style={{ margin: "6px 0 2px", fontSize: "16px", color: "#f8fafc" }}>{selectedNode.label}</h3>
                <div style={{ fontSize: "12px", color: "#94a3b8" }}>{selectedNode.sublabel}</div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                <button
                  onClick={() => handleSendNodeToDocStudio(selectedNode)}
                  style={{
                    padding: "8px 10px",
                    borderRadius: "8px",
                    background: "rgba(16, 185, 129, 0.16)",
                    border: "1px solid rgba(16, 185, 129, 0.45)",
                    color: "#34d399",
                    fontWeight: 700,
                    fontSize: "11.5px",
                    cursor: "pointer",
                  }}
                >
                  📄 Parecer no Doc Studio
                </button>
                <button
                  onClick={() => {
                    if (selectedNode.filterToken) {
                      setTableIrdFilter(selectedNode.filterToken);
                      if (selectedNode.brand !== "Todas") setTableBrand(selectedNode.brand);
                    }
                    setActiveMode("tables");
                  }}
                  style={{
                    padding: "8px 10px",
                    borderRadius: "8px",
                    background: "rgba(59, 130, 246, 0.16)",
                    border: "1px solid rgba(59, 130, 246, 0.45)",
                    color: "#93c5fd",
                    fontWeight: 700,
                    fontSize: "11.5px",
                    cursor: "pointer",
                  }}
                >
                  📊 Ver Alíquotas na Tabela
                </button>
              </div>

              <div style={{ background: "#141c2f", border: "1px solid #1e293b", borderRadius: "10px", padding: "12px", fontSize: "12px", lineHeight: 1.55 }}>
                <div style={{ fontSize: "10.5px", fontWeight: 800, color: "#34d399", textTransform: "uppercase", marginBottom: "4px" }}>
                  Regra de Qualificação & Papel no Arranjo
                </div>
                <p style={{ margin: 0, color: "#cbd5e1" }}>{selectedNode.description}</p>
              </div>

              <div style={{ background: "#141c2f", border: "1px solid #1e293b", borderRadius: "10px", padding: "12px", fontSize: "11.5px" }}>
                <div style={{ marginBottom: "8px" }}>
                  <span style={{ color: "#64748b", fontSize: "10.5px", display: "block" }}>Gatilho ISO 8583 / Clearing</span>
                  <code style={{ color: "#6ee7b7", fontSize: "11px" }}>{selectedNode.isoTrigger}</code>
                </div>
                <div style={{ marginBottom: "8px" }}>
                  <span style={{ color: "#64748b", fontSize: "10.5px", display: "block" }}>Tabela Física GCMS / MPE / Fee Schedule</span>
                  <code style={{ color: "#fbbf24", fontSize: "11px" }}>{selectedNode.gcmsRef}</code>
                </div>
                <div>
                  <span style={{ color: "#64748b", fontSize: "10.5px", display: "block" }}>Faixa Tarifária Observada</span>
                  <strong style={{ color: "#f8fafc" }}>{selectedNode.typicalRate}</strong>
                </div>
              </div>

              {/* Catálogo Rápido de IRDs Domésticos vs Cross-Border (de mastercard-interchange.json) */}
              <div style={{ background: "#141c2f", border: "1px solid #1e293b", borderRadius: "10px", padding: "12px" }}>
                <div style={{ fontSize: "11px", fontWeight: 800, color: "#fbbf24", textTransform: "uppercase", marginBottom: "8px" }}>
                  Dicionário Rápido de IRDs Mastercard (Doméstico & Cross-Border)
                </div>
                <div style={{ display: "grid", gap: "6px", maxHeight: "240px", overflow: "auto" }}>
                  {[
                    ...mastercardInterchange.irds_base.brasil,
                    ...mastercardInterchange.irds_base.intraregional_lac,
                    ...mastercardInterchange.irds_base.interregional_global,
                  ].map((ird, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        setTableBrand("Mastercard");
                        setTableIrdFilter(`IRD ${ird.id.split(" ")[0]}`);
                        setActiveMode("tables");
                      }}
                      style={{
                        padding: "6px 8px",
                        borderRadius: "6px",
                        background: "#0b0f1a",
                        border: "1px solid #1e293b",
                        cursor: "pointer",
                        fontSize: "11px",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700 }}>
                        <code style={{ color: "#34d399" }}>IRD {ird.id}</code>
                        <span style={{ color: "#94a3b8", fontSize: "10px" }}>{ird.canal}</span>
                      </div>
                      <div style={{ color: "#e2e8f0", fontWeight: 600, marginTop: "2px" }}>{ird.nome}</div>
                      <div style={{ color: "#64748b", fontSize: "10px", marginTop: "2px" }}>{ird.regra_acionamento}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cascatas de Downgrade (de downgrade-rules.json) */}
              <div style={{ background: "#141c2f", border: "1px solid #1e293b", borderRadius: "10px", padding: "12px" }}>
                <div style={{ fontSize: "11px", fontWeight: 800, color: "#f87171", textTransform: "uppercase", marginBottom: "8px" }}>
                  Gatilhos Clássicos de Downgrade (EIRF / Standard)
                </div>
                <div style={{ display: "grid", gap: "6px" }}>
                  {downgradeRules.map((rule) => (
                    <div key={rule.id} style={{ padding: "6px 8px", borderRadius: "6px", background: "#0b0f1a", borderLeft: "2px solid #ef4444", fontSize: "11px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, color: "#fca5a5" }}>
                        <span>{rule.name}</span>
                        <span>+{(rule.impact_pct * 100).toFixed(0)} bps</span>
                      </div>
                      <div style={{ color: "#94a3b8", fontSize: "10px", marginTop: "2px" }}>{rule.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </aside>
      </div>
    </div>
  );
}
