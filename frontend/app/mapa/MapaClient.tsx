"use client";

import React, { useState, useMemo, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  BookOpen,
  ExternalLink,
  Wrench,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Layers,
  Table2,
  Network,
  Download,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Info,
  GitCommit,
  Compass,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  FileText,
  Activity,
} from "lucide-react";
import mapaData from "@/data/mapa-conhecimento.json";
import { sendToDocStudio } from "@/lib/docStudioBridge";

// ─── Tipos ────────────────────────────────────────────────────────────────────

type Categoria = (typeof mapaData.categorias)[number];
type NoData = (typeof mapaData.nos)[number];
type EdgeData = (typeof mapaData.arestas)[number];
type RotaGuiada = (typeof mapaData.rotasGuiadas)[number];

type EdgeKind = "dados" | "financeiro" | "calculo" | "compliance";

interface SimStep {
  step: number;
  edgeId: string;
  sourceId: string;
  targetId: string;
  fase: string;
  titulo: string;
  resumo: string;
  pacoteIso: string;
  impactoFinanceiro: string;
}

interface SimScenario {
  id: string;
  curto: string;
  titulo: string;
  subtitulo: string;
  bandeira: "Mastercard" | "Visa" | "Elo" | "Todas";
  cor: string;
  risco: "baixo" | "medio" | "alto" | "critico";
  waterfall: {
    bruto: string;
    mdr: string;
    liquidoLojista: string;
    intercambio: string;
    schemeFee: string;
    margemAdquirente: string;
    statusQualificacao: string;
  };
  steps: SimStep[];
}

const CENARIOS_SIMULACAO: SimScenario[] = [
  {
    id: "ecom-qualificado",
    curto: "1. E-com R$ 500 (Token + 3DS Qualificado)",
    titulo: "E-commerce R$ 500,00 (3x) · Tokenizado MDES + 3DS 2.2 (IRD AU Qualificado)",
    subtitulo: "Fluxo ideal CNP com Liability Shift ativo (ECI 02 / SLI 212) e clearing D+1 dentro da janela",
    bandeira: "Mastercard",
    cor: "#10b981",
    risco: "baixo",
    waterfall: {
      bruto: "R$ 500,00",
      mdr: "- R$ 16,00 (3,20%)",
      liquidoLojista: "R$ 484,00",
      intercambio: "- R$ 10,60 (2,12% · IRD AU)",
      schemeFee: "- R$ 1,20 (0,24% · MCBS)",
      margemAdquirente: "+ R$ 4,20 (+0,84%)",
      statusQualificacao: "Qualificado no Alvo (IRD AU) + Liability Shift Ativo",
    },
    steps: [
      {
        step: 1,
        edgeId: "R01",
        sourceId: "portador",
        targetId: "ec",
        fase: "D+0 · Checkout",
        titulo: "Portador Inicia Compra E-commerce com Credencial Tokenizada",
        resumo: "Portador finaliza compra de R$ 500,00 em 3x no checkout usando cartão salvo via Network Token (DPAN).",
        pacoteIso: "Checkout Payload · Valor = R$ 500,00 (3 parcelas) · Credencial = DPAN 5234.xxxx + Cryptogram TAVV",
        impactoFinanceiro: "Valor Bruto da Transação: R$ 500,00",
      },
      {
        step: 2,
        edgeId: "R21",
        sourceId: "3ds",
        targetId: "eci",
        fase: "D+0 · 3DS 2.2",
        titulo: "Autenticação EMV 3DS 2.2 Frictionless (ECI 02 / SLI 212)",
        resumo: "MPI/3DS Server envia telemetria de device ao ACS do Emissor, que aprova sem desafio e gera AAV/UCAF.",
        pacoteIso: "DE 48 SE 42 (SLI) = 212 (ECI 02 Full Auth) · DE 48 SE 43 (UCAF/AAV) = criptograma de 28 bytes",
        impactoFinanceiro: "Ativa Liability Shift (protege EC contra CBK de fraude) e habilita IRD eletrônico reduzido",
      },
      {
        step: 3,
        edgeId: "R05",
        sourceId: "adquirente",
        targetId: "bandeira",
        fase: "D+0 · Autorização",
        titulo: "Adquirente Roteia ISO 8583 0100 para a Bandeira",
        resumo: "Host do Adquirente monta mensagem 0100 com POS Entry Mode 81 (E-com/CoF), MCC do lojista e dados 3DS.",
        pacoteIso: "MTI 0100 · DE 02 = DPAN · DE 03 = 003000 · DE 04 = 000000050000 · DE 18 = 5311 · DE 22 = 810 · DE 48 = SLI 212",
        impactoFinanceiro: "Custo de processamento de autorização (Assessment MCBS ~R$ 0,04)",
      },
      {
        step: 4,
        edgeId: "R06",
        sourceId: "bandeira",
        targetId: "emissor",
        fase: "D+0 · Decisão Emissor",
        titulo: "Detokenização MDES & Aprovação 0110 pelo Emissor",
        resumo: "Mastercard traduz DPAN → FPAN no cofre MDES, valida TAVV/AAV e Emissor retorna aprovação DE 39 = 00.",
        pacoteIso: "MTI 0110 · DE 38 = A94F21 · DE 39 = 00 (Approved) · DE 63 = Banknet Ref Number + Banknet Date",
        impactoFinanceiro: "Reserva de limite de R$ 500,00 no cartão Black do portador",
      },
      {
        step: 5,
        edgeId: "R19",
        sourceId: "autorizacao",
        targetId: "clearing",
        fase: "D+1 · Clearing IPM",
        titulo: "Apresentação Single Message / Batch IPM em D+1",
        resumo: "Adquirente submete First Presentment (MTI 1240) em D+1 preservando Banknet Ref, SLI 212 e MCC.",
        pacoteIso: "IPM MTI 1240 · F024 = 200 · PDS 0158 = IRD AU · PDS 0052 = 212 · DE 63 idêntico ao 0110",
        impactoFinanceiro: "Qualifica tarifa alvo sem penalidade de timeliness",
      },
      {
        step: 6,
        edgeId: "R28",
        sourceId: "intercambio",
        targetId: "emissor",
        fase: "D+1 · Intercâmbio",
        titulo: "Cálculo e Crédito da Tarifa de Intercâmbio ao Emissor (2,12%)",
        resumo: "GCMS aplica tabela T068 para Tier Black Parcelado 2-6x Qualificado (IRD AU = 2,12%).",
        pacoteIso: "T068 Match: Tier Black × IRD AU × Parcelado 3x → Alíquota = 2,12% (R$ 10,60)",
        impactoFinanceiro: "Adquirente paga R$ 10,60 de Intercâmbio ao Emissor + R$ 1,20 de Scheme Fee à Bandeira",
      },
      {
        step: 7,
        edgeId: "R53",
        sourceId: "settlement",
        targetId: "cip-spb",
        fase: "Settlement · CIP/SLC",
        titulo: "Liquidação Doméstica via CIP/SLC & Repasse ao Lojista",
        resumo: "Câmara compensa posições líquidas: Emissor envia R$ 489,40; Adquirente retém MDR líquido e paga R$ 484,00 ao EC.",
        pacoteIso: "Relatório T067/T140 → Grade SLC/CIP (STR/SPB) → Crédito líquido EC = R$ 484,00",
        impactoFinanceiro: "Margem Líquida do Adquirente (Net MDR) = + R$ 4,20 (+0,84%)",
      },
    ],
  },
  {
    id: "ecom-downgrade-vamp",
    curto: "2. E-com s/ 3DS → Downgrade + VAMP",
    titulo: "E-commerce R$ 500,00 · Sem 3DS (ECI 07) + Clearing Tardio → Downgrade & Fraude VAMP",
    subtitulo: "Como a ausência de 3DS/DE 62.2 e o atraso no clearing causam margem negativa e multa no programa VAMP",
    bandeira: "Visa",
    cor: "#f87171",
    risco: "critico",
    waterfall: {
      bruto: "R$ 500,00",
      mdr: "- R$ 16,00 (3,20%)",
      liquidoLojista: "R$ 484,00 (Antes do CBK de R$ 500)",
      intercambio: "- R$ 14,75 (2,95% · Downgrade Standard)",
      schemeFee: "- R$ 2,65 (0,53% · VSS + Dispute/VAMP Fee)",
      margemAdquirente: "- R$ 1,40 (-0,28% · Margem Negativa)",
      statusQualificacao: "Downgrade Punitivo (+0,85% IC) + Sem Liability Shift (CBK 10.4)",
    },
    steps: [
      {
        step: 1,
        edgeId: "R01",
        sourceId: "portador",
        targetId: "ec",
        fase: "D+0 · Checkout Vulnerável",
        titulo: "Compra CNP em PAN Aberto e Sem Autenticação 3DS",
        resumo: "Transação submetida apenas com PAN digitado e CVV, sem Tokenização VTS e sem desafio 3DS.",
        pacoteIso: "DE 02 = FPAN 4984.xxxx · DE 22 = 01 (Manual/Keyed) · Campo 60.8 = ECI 07 (Non-Authenticated)",
        impactoFinanceiro: "Risco 100% no Lojista (EC) em caso de fraude CNP",
      },
      {
        step: 2,
        edgeId: "R05",
        sourceId: "adquirente",
        targetId: "bandeira",
        fase: "D+0 · Autorização VIP",
        titulo: "Autorização ECI 07 Aprovada na VisaNet (DE 62.2 Gerado)",
        resumo: "VisaNet VIP aprova 0110 e devolve DE 62.2 (Transaction Identifier de 15 dígitos), obrigatório no clearing.",
        pacoteIso: "MTI 0110 · DE 39 = 00 · DE 62.2 = 306123456789012 (CPS Qualification ID)",
        impactoFinanceiro: "Tarifa estimada na autorização: 2,10% (R$ 10,50) SE apresentada até D+4 com DE 62.2",
      },
      {
        step: 3,
        edgeId: "R19",
        sourceId: "autorizacao",
        targetId: "clearing",
        fase: "D+6 · Clearing Tardio",
        titulo: "Apresentação BASE II com Atraso (D+6) e Truncamento de DE 62.2",
        resumo: "Lojista demora 6 dias para capturar a venda e o sistema do adquirente omite o Transaction ID no TC 05.",
        pacoteIso: "BASE II TC 05 · CPD = D+6 (fora da janela de 4 dias) · Transaction ID (DE 62.2) = AUSENTE",
        impactoFinanceiro: "Perda imediata da elegibilidade CPS / Eletrônica",
      },
      {
        step: 4,
        edgeId: "R62",
        sourceId: "clearing",
        targetId: "downgrade",
        fase: "D+6 · Regra de Downgrade",
        titulo: "BASE II Reprova Qualificação e Dispara Downgrade Automático",
        resumo: "Motor de intercâmbio detecta falta de ciclo de vida (DE 62.2) + Timeliness expirado e rebaixa o Fee Program.",
        pacoteIso: "VSS/VCF Downgrade Flag = EPR / Standard Non-Qualified · Motivo: Missing Tran ID & Late Presentment",
        impactoFinanceiro: "Penalidade tarifária de +0,85 p.p. sobre o valor da venda",
      },
      {
        step: 5,
        edgeId: "R56",
        sourceId: "downgrade",
        targetId: "intercambio",
        fase: "D+6 · Erosão de Margem",
        titulo: "Intercâmbio Salta para 2,95% (R$ 14,75) e Inverte a Margem",
        resumo: "Como o MDR do lojista era fixo (3,20% = R$ 16,00), o salto do intercâmbio + scheme fee gera prejuízo líquido.",
        pacoteIso: "VSS-120 Interchange Report: R$ 14,75 (2,95%) debitados do Adquirente em favor do Emissor",
        impactoFinanceiro: "Net MDR do Adquirente cai de +R$ 4,25 para -R$ 1,40 (-0,28%)",
      },
      {
        step: 6,
        edgeId: "R31",
        sourceId: "fraude",
        targetId: "tc40",
        fase: "D+25 · Fraude & CBK",
        titulo: "Portador Contesta Compra → Emissor Envia TC40 e Chargeback 10.4",
        resumo: "Sem ECI 05/06, o Adquirente não tem defesa de Liability Shift e sofre débito integral do Chargeback 10.4.",
        pacoteIso: "Visa Claims Resolution (VCR) · Reason Code 10.4 (Other Fraud - Card Absent) + Aviso TC40",
        impactoFinanceiro: "Estorno de R$ 500,00 do Lojista + Dispute Fee de US$ 15 no VSS-140",
      },
      {
        step: 7,
        edgeId: "R32",
        sourceId: "tc40",
        targetId: "vamp",
        fase: "Mensal · Compliance VAMP",
        titulo: "Contabilização Dupla no Índice VAMP (Visa Acquirer Monitoring Program)",
        resumo: "A transação contamina o numerador unificado do VAMP (TC40 + Disputas Ciertas / TC05), aproximando multa por item.",
        pacoteIso: "VAMP Ratio = (TC40 + Disputas) ÷ Total TC05 · Limiar Abril/2026: ≥ 0,5% Adquirente Acima do Padrão",
        impactoFinanceiro: "Risco de Enforcement Fee de US$ 4 a US$ 10 por transação afetada",
      },
    ],
  },
  {
    id: "payfac-split-slc",
    curto: "3. PayFac R$ 1.000 (Split & CIP/SLC)",
    titulo: "Marketplace / Subcredenciador (PayFac) R$ 1.000,00 · Split & Grade Centralizada CIP/SLC",
    subtitulo: "Fluxo completo de subcredenciamento sob a Circular Bacen 3.682 com liquidação na câmara CIP/SLC",
    bandeira: "Mastercard",
    cor: "#f59e0b",
    risco: "baixo",
    waterfall: {
      bruto: "R$ 1.000,00",
      mdr: "- R$ 34,90 (3,49% cobrado pelo PayFac)",
      liquidoLojista: "R$ 965,10 (Creditado ao Sublojista via SLC)",
      intercambio: "- R$ 18,50 (1,85% ao Emissor)",
      schemeFee: "- R$ 4,00 (0,22% MCBS + 0,18% Sponsor Acquirer)",
      margemAdquirente: "+ R$ 12,40 (+1,24% Spread PayFac)",
      statusQualificacao: "Subcredenciamento Regular (PF ID + Sub-Merchant ID + Grade SLC)",
    },
    steps: [
      {
        step: 1,
        edgeId: "R01",
        sourceId: "portador",
        targetId: "ec",
        fase: "D+0 · Compra Marketplace",
        titulo: "Portador Compra R$ 1.000,00 em Vendedor (Sublojista) do Marketplace",
        resumo: "Transação iniciada no checkout transparente hospedado pelo Subcredenciador (PayFac).",
        pacoteIso: "Checkout PayFac · Valor Bruto = R$ 1.000,00 · Seller CNPJ vinculado ao Sub-Merchant ID",
        impactoFinanceiro: "Valor Bruto: R$ 1.000,00",
      },
      {
        step: 2,
        edgeId: "R02",
        sourceId: "ec",
        targetId: "subcredenciador",
        fase: "D+0 · Captura PayFac",
        titulo: "Subcredenciador Identifica PF ID, Sub-Merchant ID e MCC Real",
        resumo: "PayFac preenche obrigatoriamente o identificador de facilitador e os dados cadastrais do sublojista.",
        pacoteIso: "DE 18 = MCC 5651 · DE 43 = NomeFantasia*Sublojista · DE 48 PDS 0208 = PF ID + Sub-Merchant ID",
        impactoFinanceiro: "Evita multa BRAM por agregação opaca (laundering de MCC)",
      },
      {
        step: 3,
        edgeId: "R03",
        sourceId: "subcredenciador",
        targetId: "adquirente",
        fase: "D+0 · Patrocínio (Sponsor)",
        titulo: "Submissão via Adquirente Patrocinador para a Rede da Bandeira",
        resumo: "Adquirente valida que o sublojista não consta no MATCH e envia 0100 usando seu BIN/ICA licenciados.",
        pacoteIso: "MTI 0100 · DE 32 (Acquiring Institution ID) = ICA Adquirente · DE 39 = 00 (Aprovado)",
        impactoFinanceiro: "Take-rate de patrocínio do Adquirente: 0,18% (R$ 1,80)",
      },
      {
        step: 4,
        edgeId: "R46",
        sourceId: "clearing",
        targetId: "base2-ipm",
        fase: "D+1 · Clearing GCMS",
        titulo: "Processamento IPM no GCMS & Cálculo de Intercâmbio (1,85%)",
        resumo: "Bandeira processa arquivo IPM, calcula R$ 18,50 de intercâmbio para o Emissor e R$ 2,20 de fee MCBS.",
        pacoteIso: "GCMS IPM 1240 → Relatório T140 / T067 · Intercâmbio = R$ 18,50 · MCBS Fee = R$ 2,20",
        impactoFinanceiro: "Líquido apurado na Bandeira para a cadeia adquirente: R$ 979,30",
      },
      {
        step: 5,
        edgeId: "R53",
        sourceId: "settlement",
        targetId: "cip-spb",
        fase: "D+2 · Grade CIP/SLC",
        titulo: "Bandeira Envia Grade de Liquidação Doméstica para a CIP / SLC",
        resumo: "Por exigência do Bacen, a compensação interbancária ocorre de forma multilateral no SLC da CIP.",
        pacoteIso: "Arquivo de Grade Bandeira → CIP/SLC · Liquidação financeira via STR / SPB",
        impactoFinanceiro: "Compensação multilateral sem risco de crédito bilateral",
      },
      {
        step: 6,
        edgeId: "R54",
        sourceId: "cip-spb",
        targetId: "subcredenciador",
        fase: "Liquidação · Agenda",
        titulo: "Liquidação ao Subcredenciador e Crédito na Agenda do Sublojista",
        resumo: "SLC liquida os valores e concilia com a Registradora de Recebíveis (CERC/TAG/B3) para crédito ao Seller.",
        pacoteIso: "Mensagens ASLC025 / ASLC027 (CIP) · Líquido Sublojista = R$ 965,10 · Spread PayFac = R$ 12,40",
        impactoFinanceiro: "Spread Líquido PayFac = + R$ 12,40 (+1,24%) · Sublojista recebe R$ 965,10",
      },
    ],
  },
  {
    id: "presencial-debito-bacen",
    curto: "4. NFC Débito R$ 200 (Cap Bacen 0,50%)",
    titulo: "Presencial Contactless NFC Débito R$ 200,00 · Chip EMV (ARQC) + Teto Bacen (0,50%)",
    subtitulo: "Como a criptografia EMV presencial e a Resolução BCB 304 travam o intercâmbio de débito em 0,50%",
    bandeira: "Todas",
    cor: "#3b82f6",
    risco: "baixo",
    waterfall: {
      bruto: "R$ 200,00",
      mdr: "- R$ 2,38 (1,19% MDR Débito)",
      liquidoLojista: "R$ 197,62 (Liquidado em D+1)",
      intercambio: "- R$ 1,00 (0,50% · Teto Regulatório BCB 304)",
      schemeFee: "- R$ 0,28 (0,14% · Scheme Fee Débito)",
      margemAdquirente: "+ R$ 1,10 (+0,55%)",
      statusQualificacao: "Card Present EMV Contactless + Cap Regulatório BCB (0,50%)",
    },
    steps: [
      {
        step: 1,
        edgeId: "R01",
        sourceId: "portador",
        targetId: "ec",
        fase: "D+0 · Terminal POS",
        titulo: "Portador Aproxima Cartão/Carteira NFC no Terminal do Lojista",
        resumo: "Venda presencial de R$ 200,00 na função Débito à vista lida via antena NFC (EMV Contactless).",
        pacoteIso: "Terminal POS · Função = Débito · Valor = R$ 200,00 · Interface = Contactless ISO 14443",
        impactoFinanceiro: "Valor Bruto: R$ 200,00",
      },
      {
        step: 2,
        edgeId: "R51",
        sourceId: "pos-entry",
        targetId: "autorizacao",
        fase: "D+0 · POS Entry Mode",
        titulo: "Preenchimento do POS Entry Mode DE 22 = 07 (Contactless EMV)",
        resumo: "Terminal sinaliza na mensagem ISO 8583 que a leitura ocorreu via chip sem contato.",
        pacoteIso: "DE 22 (POS Entry Mode) = 071 (Contactless Chip + PIN/CDCVM) · DE 25 = 00",
        impactoFinanceiro: "Comprova presença física do cartão/dispositivo",
      },
      {
        step: 3,
        edgeId: "R12",
        sourceId: "emv",
        targetId: "autorizacao",
        fase: "D+0 · Criptograma ARQC",
        titulo: "Geração e Validação do Criptograma Dinâmico EMV (DE 55)",
        resumo: "Chip gera ARQC único por transação no DE 55; HSM do Emissor valida autenticidade e responde ARPC.",
        pacoteIso: "DE 55 TLV: Tag 9F26 (ARQC) · Tag 9F27 (CID) · Tag 9F36 (ATC) · Tag 9F10 (IAD)",
        impactoFinanceiro: "Blindagem contra clonagem presencial (Liability Shift EMV)",
      },
      {
        step: 4,
        edgeId: "R52",
        sourceId: "pos-entry",
        targetId: "intercambio",
        fase: "D+1 · Qualificação CP",
        titulo: "Qualificação na Tabela Eletrônica Presencial (Card Present)",
        resumo: "Presença de DE 22 = 07 + dados EMV no clearing garante enquadramento eletrônico pleno.",
        pacoteIso: "Clearing D+1 com indicador EMV Contactless íntegro",
        impactoFinanceiro: "Zero risco de downgrade técnico",
      },
      {
        step: 5,
        edgeId: "R55",
        sourceId: "bacen-reg",
        targetId: "intercambio",
        fase: "D+1 · Teto Bacen (BCB 304)",
        titulo: "Aplicação do Cap Regulatório do Banco Central (Máx. 0,50% no Débito)",
        resumo: "Resolução BCB nº 304 limita qualquer tarifa de intercâmbio doméstica de débito a 0,50% por transação.",
        pacoteIso: "Regra Bacen BCB 304: Intercâmbio Débito ≤ 0,50% (Pré-pago ≤ 0,70%)",
        impactoFinanceiro: "Intercâmbio travado em R$ 1,00 (0,50% de R$ 200,00)",
      },
      {
        step: 6,
        edgeId: "R28",
        sourceId: "intercambio",
        targetId: "emissor",
        fase: "D+1 · Liquidação Débito",
        titulo: "Repasse de R$ 1,00 ao Emissor e Liquidação D+1 ao Lojista",
        resumo: "Em D+1, Emissor recebe R$ 1,00 de intercâmbio, Bandeira recebe R$ 0,28 e Lojista recebe R$ 197,62.",
        pacoteIso: "Liquidação CIP/SLC D+1 · Crédito EC = R$ 197,62 · Net MDR Adquirente = +R$ 1,10",
        impactoFinanceiro: "Margem Líquida do Adquirente = + R$ 1,10 (+0,55%)",
      },
    ],
  },
];

// ─── Motor Dinâmico do Laboratório "What-If" no Grafo ─────────────────────────

interface WhatIfConfig {
  ambiente: "ecom" | "presencial" | "debito";
  bandeira: "Mastercard" | "Visa" | "Elo";
  tier: "premium" | "standard";
  valor: number;
  parcelas: 1 | 3 | 10;
  mdrPct: number;
  token: boolean;
  authForte: boolean;
  clearingIntegro: boolean;
  subcred: boolean;
  simularFraude: boolean;
}

const WHATIF_PRESETS: Record<string, WhatIfConfig> = {
  "ecom-qualificado": {
    ambiente: "ecom",
    bandeira: "Mastercard",
    tier: "premium",
    valor: 500,
    parcelas: 3,
    mdrPct: 3.2,
    token: true,
    authForte: true,
    clearingIntegro: true,
    subcred: false,
    simularFraude: false,
  },
  "ecom-downgrade-vamp": {
    ambiente: "ecom",
    bandeira: "Visa",
    tier: "premium",
    valor: 500,
    parcelas: 3,
    mdrPct: 3.2,
    token: false,
    authForte: false,
    clearingIntegro: false,
    subcred: false,
    simularFraude: true,
  },
  "payfac-split-slc": {
    ambiente: "ecom",
    bandeira: "Mastercard",
    tier: "standard",
    valor: 1000,
    parcelas: 3,
    mdrPct: 3.49,
    token: true,
    authForte: true,
    clearingIntegro: true,
    subcred: true,
    simularFraude: false,
  },
  "presencial-debito-bacen": {
    ambiente: "debito",
    bandeira: "Visa",
    tier: "premium",
    valor: 200,
    parcelas: 1,
    mdrPct: 1.19,
    token: true,
    authForte: true,
    clearingIntegro: true,
    subcred: false,
    simularFraude: false,
  },
};

function fmtBRL(v: number, showSign = false): string {
  const abs = Math.abs(v).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  if (!showSign) return `R$ ${abs}`;
  return v >= 0 ? `+ R$ ${abs}` : `- R$ ${abs}`;
}

function fmtPct(v: number, showSign = false): string {
  const s = Math.abs(v).toFixed(2).replace(".", ",") + "%";
  if (!showSign) return s;
  return v >= 0 ? `+${s}` : `-${s}`;
}

function buildWhatIfScenario(
  cfg: WhatIfConfig,
  presetId: string | null
): SimScenario & {
  aliquotaAlvoPct: number;
  aliquotaRealPct: number;
  perdaEvitavelReais: number;
  perda10kTransacoes: string;
  alertaDiagnostico: string;
} {
  const valor = Math.max(10, Number.isFinite(cfg.valor) ? cfg.valor : 500);
  const parcelas = cfg.ambiente === "debito" ? 1 : cfg.parcelas;
  const mdrPct = Math.max(0.3, Number.isFinite(cfg.mdrPct) ? cfg.mdrPct : 3.2);

  // 1. Cálculo da Alíquota Alvo (Qualificada) vs Alíquota Real Aplicada
  let aliquotaAlvoPct = 0.5;
  let aliquotaRealPct = 0.5;
  let irdLabel = "Cap Bacen 0,50%";

  if (cfg.ambiente === "debito") {
    aliquotaAlvoPct = 0.5;
    aliquotaRealPct = 0.5; // Teto regulatório Bacen BCB 304 trava o débito em 0,50%
    irdLabel = "Cap Bacen BCB 304 (Máx. 0,50%)";
  } else if (cfg.ambiente === "presencial") {
    const base =
      cfg.tier === "premium"
        ? parcelas === 1
          ? 1.62
          : parcelas === 3
          ? 1.92
          : 2.22
        : parcelas === 1
        ? 1.15
        : parcelas === 3
        ? 1.48
        : 1.75;
    aliquotaAlvoPct = base;
    const penSemEmv = cfg.authForte ? 0 : 0.42;
    const penDowngrade = cfg.clearingIntegro ? 0 : 0.68;
    aliquotaRealPct = Number((base + penSemEmv + penDowngrade).toFixed(2));
    irdLabel =
      !cfg.clearingIntegro
        ? cfg.bandeira === "Mastercard"
          ? "Downgrade Standard (Atraso/Sem Ref)"
          : "Downgrade EPR / Standard"
        : !cfg.authForte
        ? "Keyed / Sem Chip EMV (DE 55 ausente)"
        : cfg.bandeira === "Mastercard"
        ? "IRD IA/JA (Card Present EMV)"
        : "CPS Card Present Qualified";
  } else {
    // E-commerce (CNP)
    const base =
      cfg.tier === "premium"
        ? parcelas === 1
          ? 1.82
          : parcelas === 3
          ? 2.12
          : 2.42
        : parcelas === 1
        ? 1.38
        : parcelas === 3
        ? 1.68
        : 1.95;
    aliquotaAlvoPct = base;
    const penSemToken = cfg.token ? 0 : 0.1;
    const penSem3ds = cfg.authForte ? 0 : 0.28;
    const penDowngrade = cfg.clearingIntegro ? 0 : 0.57;
    aliquotaRealPct = Number((base + penSemToken + penSem3ds + penDowngrade).toFixed(2));
    irdLabel =
      !cfg.clearingIntegro
        ? cfg.bandeira === "Mastercard"
          ? "Downgrade Standard / HU (Clearing Tardio)"
          : "Downgrade Standard / EPR (Sem DE 62.2)"
        : !cfg.authForte
        ? cfg.bandeira === "Mastercard"
          ? "IRD Non-Auth (ECI 07 Sem 3DS)"
          : "CNP Non-Authenticated (ECI 07)"
        : cfg.bandeira === "Mastercard"
        ? "IRD AU Qualificado (3DS + Token)"
        : "CPS E-com Auth Qualified (ECI 05)";
  }

  // 2. Scheme Fee + Sponsor Fee + Dispute Fee
  const schemePct = cfg.ambiente === "debito" ? 0.14 : 0.24;
  const sponsorPct = cfg.subcred ? 0.18 : 0;
  const disputeFeeReais = cfg.simularFraude && !cfg.authForte ? 75.0 : 0; // ~US$ 15 Dispute/VAMP Fee se não houver Liability Shift

  const mdrReais = valor * (mdrPct / 100);
  const liquidoLojistaReais = valor - mdrReais;
  const icAlvoReais = valor * (aliquotaAlvoPct / 100);
  const icRealReais = valor * (aliquotaRealPct / 100);
  const schemeAndSponsorPct = schemePct + sponsorPct;
  const schemeAndSponsorReais = valor * (schemeAndSponsorPct / 100) + disputeFeeReais;

  const margemReais = mdrReais - icRealReais - schemeAndSponsorReais;
  const margemPct = (margemReais / valor) * 100;

  const perdaEvitavelReais = Math.max(0, icRealReais - icAlvoReais + disputeFeeReais);
  const perda10kTransacoes = fmtBRL(perdaEvitavelReais * 10000);

  // 3. Construção Dinâmica do Caminho Passo a Passo no Grafo SVG (R01..R62)
  const rawSteps: Omit<SimStep, "step">[] = [];

  // Passo A: Iniciação da Compra (R01)
  rawSteps.push({
    edgeId: "R01",
    sourceId: "portador",
    targetId: "ec",
    fase: "D+0 · Checkout / POS",
    titulo:
      cfg.ambiente === "ecom"
        ? `Portador Inicia Compra E-commerce (${parcelas}x)`
        : cfg.ambiente === "debito"
        ? "Portador Aproxima Cartão Débito no Terminal POS"
        : `Portador Inicia Compra Presencial Crédito (${parcelas}x)`,
    resumo: `Venda de ${fmtBRL(valor)} (${parcelas}x) com cartão ${cfg.bandeira} (${cfg.tier === "premium" ? "Black/Infinite" : "Gold/Standard"}).`,
    pacoteIso: `DE 04 = ${fmtBRL(valor)} (${parcelas}x) · Moeda DE 49 = 986 (BRL) · Tier = ${cfg.tier.toUpperCase()}`,
    impactoFinanceiro: `Valor Bruto: ${fmtBRL(valor)} · MDR Contratado: ${fmtPct(mdrPct)} (${fmtBRL(mdrReais)})`,
  });

  // Passo B: Captura (Subcredenciador R02+R03 vs Adquirente Direto R04)
  if (cfg.subcred) {
    rawSteps.push({
      edgeId: "R02",
      sourceId: "ec",
      targetId: "subcredenciador",
      fase: "D+0 · Captura PayFac",
      titulo: "Captura via Subcredenciador (PayFac) com Identificação de Sublojista",
      resumo: "PayFac injeta obrigatoriamente PF ID, Sub-Merchant ID e MCC real do vendedor para conformidade BRAM.",
      pacoteIso: "DE 18 = MCC Real · DE 43 = PayFac*Sublojista · DE 48 PDS 0208 = PF ID + Sub-Merchant ID",
      impactoFinanceiro: "Habilita split regulado na grade CIP/SLC (Circular Bacen 3.682)",
    });
    rawSteps.push({
      edgeId: "R03",
      sourceId: "subcredenciador",
      targetId: "adquirente",
      fase: "D+0 · Patrocínio",
      titulo: "Submissão ao Adquirente Patrocinador (Sponsor Acquirer)",
      resumo: "Adquirente valida sublojista contra lista MATCH e encapsula a transação sob seu BIN/ICA de rede.",
      pacoteIso: "MTI 0100 · DE 32 = ICA/BIN Adquirente Patrocinador · Screening MATCH = OK",
      impactoFinanceiro: `Custo de Patrocínio (Sponsor Take Rate 0,18%): - ${fmtBRL(valor * 0.0018)}`,
    });
  } else {
    rawSteps.push({
      edgeId: "R04",
      sourceId: "ec",
      targetId: "adquirente",
      fase: "D+0 · Captura Direta",
      titulo: "Captura Direta pelo Adquirente (Full Acquirer)",
      resumo: "Estabelecimento Comercial submete a venda diretamente ao host do Adquirente credenciador.",
      pacoteIso: `MTI 0100 · DE 42 = Merchant ID · DE 18 = MCC 5311 · DE 22 = ${cfg.ambiente === "ecom" ? (cfg.token ? "810" : "010") : cfg.authForte ? "071" : "012"}`,
      impactoFinanceiro: "Sem intermediário PayFac (100% do Net MDR fica no Adquirente)",
    });
  }

  // Passo C: Credencial (Tokenização R13 vs PAN Aberto R08)
  if (cfg.token) {
    rawSteps.push({
      edgeId: "R13",
      sourceId: "tokenizacao",
      targetId: "dpan",
      fase: "D+0 · Token de Rede",
      titulo: `Credencial Protegida por Network Token (${cfg.bandeira === "Visa" ? "VTS" : "MDES"} DPAN)`,
      resumo: "Substitui o FPAN real por um DPAN de escopo restrito acompanhado de criptograma dinâmico TAVV.",
      pacoteIso: `DE 02 = DPAN Tokenizado · Criptograma TAVV presente · Token Requestor ID válido`,
      impactoFinanceiro:
        cfg.ambiente === "ecom"
          ? "Evita sobretaxa de PAN aberto (+0,10 p.p.) e eleva taxa de aprovação do Emissor"
          : "Proteção criptográfica de credencial ativa",
    });
  } else {
    rawSteps.push({
      edgeId: "R08",
      sourceId: "portador",
      targetId: "pan",
      fase: "D+0 · PAN Aberto",
      titulo: "Tráfego em FPAN Aberto (Sem Tokenização de Rede VTS/MDES)",
      resumo: "O número real do cartão (DE 02) trafega sem tokenização, aumentando risco de exposição e custo CNP.",
      pacoteIso: "DE 02 = FPAN 16 dígitos em aberto · Sem criptograma TAVV de Token Service",
      impactoFinanceiro:
        cfg.ambiente === "ecom"
          ? `Penalidade por ausência de Token em CNP: +0,10 p.p. (- ${fmtBRL(valor * 0.001)})`
          : "Credencial primária exposta no fluxo de captura",
    });
  }

  // Passo D: Autenticação (3DS R21 / EMV R12 vs Sem Autenticação R51)
  if (cfg.ambiente === "ecom") {
    if (cfg.authForte) {
      rawSteps.push({
        edgeId: "R21",
        sourceId: "3ds",
        targetId: "eci",
        fase: "D+0 · EMV 3DS 2.2",
        titulo: `Autenticação 3DS 2.2 Aprovada (${cfg.bandeira === "Visa" ? "ECI 05 + CAVV" : "ECI 02 / SLI 212 + AAV"})`,
        resumo: "ACS do Emissor autentica o portador e devolve prova criptográfica, ativando Liability Shift.",
        pacoteIso:
          cfg.bandeira === "Visa"
            ? "Campo 60.8 = ECI 05 · DE 126.9 = CAVV (20 bytes) · 3DS Directory Server Tran ID"
            : "DE 48 SE 42 (SLI) = 212 (ECI 02) · DE 48 SE 43 (UCAF/AAV) = Criptograma Emissor",
        impactoFinanceiro: "🛡️ Liability Shift ATIVO + Qualifica tarifa autenticada (-0,28 p.p. de economia)",
      });
    } else {
      rawSteps.push({
        edgeId: "R51",
        sourceId: "pos-entry",
        targetId: "autorizacao",
        fase: "D+0 · Sem 3DS (ECI 07)",
        titulo: "Submissão E-commerce Sem Autenticação 3DS (ECI 07 / SLI 210)",
        resumo: "Transação enviada sem prova de autenticação do portador; Lojista assume 100% do risco de fraude.",
        pacoteIso:
          cfg.bandeira === "Visa"
            ? "DE 22 = 01/81 · Campo 60.8 = ECI 07 (Non-Authenticated) · Sem CAVV"
            : "DE 22 = 010/810 · DE 48 SE 42 (SLI) = 210 (ECI 07 Non-Auth) · Sem AAV",
        impactoFinanceiro: `⚠️ SEM Liability Shift + Sobretaxa CNP Não-Autenticado (+0,28 p.p. = - ${fmtBRL(valor * 0.0028)})`,
      });
    }
  } else {
    if (cfg.authForte) {
      rawSteps.push({
        edgeId: "R12",
        sourceId: "emv",
        targetId: "autorizacao",
        fase: "D+0 · Chip EMV / NFC",
        titulo: "Autenticação Criptográfica EMV Presencial (ARQC no DE 55)",
        resumo: "Chip gera criptograma único ARQC validado pelo HSM do Emissor, garantindo presença física.",
        pacoteIso: "DE 22 = 071/051 (Chip/Contactless) · DE 55 = Tags TLV 9F26 (ARQC), 9F27, 9F36 (ATC)",
        impactoFinanceiro: "🛡️ Liability Shift EMV Ativo + Menor tarifa presencial da tabela",
      });
    } else {
      rawSteps.push({
        edgeId: "R51",
        sourceId: "pos-entry",
        targetId: "autorizacao",
        fase: "D+0 · Digitado / Fallback",
        titulo: "Captura Presencial Sem Criptograma EMV (DE 22 = 01 Keyed / 80 Fallback)",
        resumo: "Ausência do DE 55 (ARQC) desqualifica a tarifa de chip presencial e transfere risco de fraude ao EC.",
        pacoteIso: "DE 22 = 012 (PAN Key-Entered) · DE 55 = AUSENTE (Sem ARQC)",
        impactoFinanceiro: `⚠️ Penalidade por ausência de Chip EMV: +0,42 p.p. (- ${fmtBRL(valor * 0.0042)})`,
      });
    }
  }

  // Passo E: Roteamento Autorização D+0 (R05 -> R06)
  rawSteps.push({
    edgeId: "R05",
    sourceId: "adquirente",
    targetId: "bandeira",
    fase: "D+0 · Autorização 0100",
    titulo: `Roteamento ISO 8583 0100 para ${cfg.bandeira === "Visa" ? "VisaNet VIP" : cfg.bandeira === "Mastercard" ? "Mastercard Dual Message" : "Rede Elo"}`,
    resumo: "Adquirente transmite a requisição de autorização online para a rede da Bandeira.",
    pacoteIso: `MTI 0100 · DE 04 = ${fmtBRL(valor)} · DE 11 STAN · DE 37 RRN · DE 18 MCC`,
    impactoFinanceiro: "Processamento online em milissegundos",
  });

  rawSteps.push({
    edgeId: "R06",
    sourceId: "bandeira",
    targetId: "emissor",
    fase: "D+0 · Aprovação 0110",
    titulo: "Aprovação 0110 pelo Emissor & Geração do ID de Ciclo de Vida",
    resumo: "Emissor valida saldo/risco, aprova (DE 39 = 00) e Bandeira carimba o identificador obrigatório para o clearing.",
    pacoteIso:
      cfg.bandeira === "Visa"
        ? "MTI 0110 · DE 39 = 00 · DE 38 = AuthCode · DE 62.2 = Transaction ID (15 dígitos)"
        : "MTI 0110 · DE 39 = 00 · DE 38 = AuthCode · DE 63 = Banknet Ref Number + Banknet Date",
    impactoFinanceiro: `Reserva de ${fmtBRL(valor)} aprovada pelo Emissor`,
  });

  // Passo F: Clearing D+1 vs Downgrade D+6 (R19 -> [R62 -> R56] ou [R22 / R52 / R55])
  if (cfg.clearingIntegro) {
    rawSteps.push({
      edgeId: "R19",
      sourceId: "autorizacao",
      targetId: "clearing",
      fase: "D+1 · Clearing no Prazo",
      titulo: `Apresentação em Lote D+1 com Ciclo de Vida Íntegro (${cfg.bandeira === "Visa" ? "BASE II TC 05" : "GCMS IPM 1240"})`,
      resumo: "Adquirente envia o clearing dentro de 24h preservando integralmente o identificador da autorização.",
      pacoteIso:
        cfg.bandeira === "Visa"
          ? "BASE II TC 05 em D+1 · DE 62.2 Transaction ID preservado · Qualificação CPS mantida"
          : `IPM MTI 1240 em D+1 · DE 63 Banknet Ref preservado · PDS 0158 = ${irdLabel}`,
      impactoFinanceiro: "Zero penalidade de Timeliness / Integridade no Clearing",
    });

    if (cfg.ambiente === "debito") {
      rawSteps.push({
        edgeId: "R55",
        sourceId: "bacen-reg",
        targetId: "intercambio",
        fase: "D+1 · Teto Bacen BCB 304",
        titulo: "Aplicação do Teto Regulatório do Banco Central (0,50% no Débito)",
        resumo: "Resolução BCB nº 304 trava o intercâmbio doméstico de débito em no máximo 0,50%, independente do Tier.",
        pacoteIso: `Cap Regulatório BCB 304: Alíquota Débito = 0,50% (${fmtBRL(icRealReais)})`,
        impactoFinanceiro: `Intercâmbio travado em ${fmtBRL(icRealReais)} (0,50%)`,
      });
    } else if (cfg.ambiente === "ecom" && cfg.authForte) {
      rawSteps.push({
        edgeId: "R22",
        sourceId: "eci",
        targetId: "intercambio",
        fase: "D+1 · Tarifa Qualificada",
        titulo: `Qualificação na Alíquota Alvo (${fmtPct(aliquotaRealPct)} · ${irdLabel})`,
        resumo: "Combinação de ECI autenticado + Clearing D+1 garante a menor linha tarifária do segmento.",
        pacoteIso: `Tabela T068 / Fee Program: ${irdLabel} → Alíquota = ${fmtPct(aliquotaRealPct)}`,
        impactoFinanceiro: `Intercâmbio otimizado: - ${fmtBRL(icRealReais)}`,
      });
    } else {
      rawSteps.push({
        edgeId: "R52",
        sourceId: "pos-entry",
        targetId: "intercambio",
        fase: "D+1 · Enquadramento IC",
        titulo: `Enquadramento Tarifário (${fmtPct(aliquotaRealPct)} · ${irdLabel})`,
        resumo: "Motor da Bandeira calcula a tarifa de intercâmbio conforme o modo de entrada e autenticação.",
        pacoteIso: `Enquadramento: ${irdLabel} → Alíquota = ${fmtPct(aliquotaRealPct)} (${fmtBRL(icRealReais)})`,
        impactoFinanceiro: `Intercâmbio apurado: - ${fmtBRL(icRealReais)}`,
      });
    }
  } else {
    // Clearing Tardio D+6 ou Truncamento de DE 62.2 / DE 63 -> Desvia para R62 -> R56 (Downgrade!)
    rawSteps.push({
      edgeId: "R19",
      sourceId: "autorizacao",
      targetId: "clearing",
      fase: "D+6 · Clearing c/ Falha",
      titulo: "Apresentação Tardia (D+6) ou Truncamento do ID da Autorização (DE 62.2 / DE 63)",
      resumo: "Captura enviada fora da janela máxima (Timeliness) ou sem o identificador de ciclo de vida do 0110.",
      pacoteIso:
        cfg.bandeira === "Visa"
          ? "BASE II TC 05 em D+6 · DE 62.2 (Transaction ID) = AUSENTE / TRUNCADO"
          : "IPM MTI 1240 em D+6 · DE 63 (Banknet Reference) divergente da autorização 0110",
      impactoFinanceiro: "Gatilho imediato de reprovação na qualificação eletrônica",
    });

    rawSteps.push({
      edgeId: "R62",
      sourceId: "clearing",
      targetId: "downgrade",
      fase: "D+6 · Regra de Downgrade",
      titulo: "Gatilho de Downgrade Automático no Motor da Bandeira",
      resumo: "A Bandeira rebaixa a transação para a tabela punitiva (Standard / EPR / IRD HU).",
      pacoteIso: `Downgrade Triggered: Alíquota salta de ${fmtPct(aliquotaAlvoPct)} para ${fmtPct(aliquotaRealPct)}`,
      impactoFinanceiro: `🚨 Penalidade de Downgrade: - ${fmtBRL(icRealReais - icAlvoReais)} extras nesta venda`,
    });

    rawSteps.push({
      edgeId: "R56",
      sourceId: "downgrade",
      targetId: "intercambio",
      fase: "D+6 · Erosão de Margem",
      titulo: `Aplicação da Tarifa Majorada de Downgrade (${fmtPct(aliquotaRealPct)})`,
      resumo: "O intercâmbio punitivo corrói diretamente o Net MDR do Adquirente/Subcredenciador.",
      pacoteIso: `Relatório VSS-120 / T140: Intercâmbio Debitado = ${fmtBRL(icRealReais)} (${fmtPct(aliquotaRealPct)})`,
      impactoFinanceiro: `Intercâmbio Punitivo: - ${fmtBRL(icRealReais)} (Alvo seria ${fmtBRL(icAlvoReais)})`,
    });
  }

  // Passo G: Repasse ao Emissor e Liquidação CIP/SLC (R28 -> R53 [-> R54])
  rawSteps.push({
    edgeId: "R28",
    sourceId: "intercambio",
    targetId: "emissor",
    fase: "Settlement · Repasse IC",
    titulo: `Crédito da Tarifa de Intercâmbio (${fmtBRL(icRealReais)}) ao Emissor`,
    resumo: "A Bandeira debita o intercâmbio do Adquirente e credita integralmente o banco Emissor do cartão.",
    pacoteIso: `Fluxo Financeiro IC: Adquirente paga ${fmtBRL(icRealReais)} (${fmtPct(aliquotaRealPct)}) → Emissor recebe`,
    impactoFinanceiro: `Receita do Emissor nesta venda: + ${fmtBRL(icRealReais)}`,
  });

  rawSteps.push({
    edgeId: "R53",
    sourceId: "settlement",
    targetId: "cip-spb",
    fase: "Settlement · CIP/SLC",
    titulo: "Compensação e Liquidação Doméstica via Grade CIP / SLC",
    resumo: "Posições multilaterais são liquidadas via STR/SPB na Câmara Interbancária de Pagamentos.",
    pacoteIso: `Grade SLC/CIP · Líquido Lojista = ${fmtBRL(liquidoLojistaReais)} · Net MDR = ${fmtBRL(margemReais, true)}`,
    impactoFinanceiro: `Resultado Operacional Adquirente/PayFac: ${fmtBRL(margemReais, true)} (${fmtPct(margemPct, true)})`,
  });

  if (cfg.subcred) {
    rawSteps.push({
      edgeId: "R54",
      sourceId: "cip-spb",
      targetId: "subcredenciador",
      fase: "Liquidação · Split PayFac",
      titulo: "Liquidação da Agenda do Sublojista na Câmara CIP/SLC",
      resumo: "SLC liquida os recebíveis do sublojista conciliados com a Registradora (ASLC025/027).",
      pacoteIso: `ASLC025/027 · Crédito Sublojista = ${fmtBRL(liquidoLojistaReais)} · Spread PayFac = ${fmtBRL(margemReais, true)}`,
      impactoFinanceiro: `Sublojista recebe ${fmtBRL(liquidoLojistaReais)} · PayFac retém ${fmtBRL(margemReais, true)}`,
    });
  }

  // Passo H: Simulação de Contestação de Fraude / Chargeback / VAMP (quando simularFraude = true)
  if (cfg.simularFraude) {
    if (cfg.authForte) {
      rawSteps.push({
        edgeId: "R23",
        sourceId: "eci",
        targetId: "chargeback",
        fase: "Pós-Venda · Defesa Ativa",
        titulo: "🛡️ Contestação de Fraude Bloqueada por Liability Shift (3DS / EMV)",
        resumo: "Portador alega não reconhecer a compra, mas a presença de ECI 05/02 ou ARQC transfere o ônus ao Emissor.",
        pacoteIso:
          cfg.bandeira === "Visa"
            ? "VCR Automatic Liability Shift Rule (Reason 10.4 Blocked by ECI 05 + CAVV)"
            : "Mastercom Collaboration / CBK 4837 Blocked by SLI 212 (ECI 02 Full Auth)",
        impactoFinanceiro: "Perda por Chargeback no Lojista/Adquirente = R$ 0,00 (Emissor absorve a fraude)",
      });
    } else {
      rawSteps.push({
        edgeId: "R31",
        sourceId: "fraude",
        targetId: "tc40",
        fase: "D+25 · Fraude & CBK",
        titulo: `🚨 Emissor Reporta Fraude (TC40/SAFE) e Abre Chargeback de ${fmtBRL(valor)}`,
        resumo: "Sem autenticação 3DS/EMV (ECI 07 / Keyed), não há Liability Shift: Lojista sofre débito integral da venda.",
        pacoteIso:
          cfg.bandeira === "Visa"
            ? "Aviso de Fraude TC40 + Chargeback VCR Reason Code 10.4 (Card-Absent Fraud)"
            : "Reporte SAFE + Chargeback IPM Reason Code 4837 (No Cardholder Authorization)",
        impactoFinanceiro: `Estorno integral de ${fmtBRL(valor)} do Lojista + Dispute Fee de R$ 75,00`,
      });

      rawSteps.push({
        edgeId: cfg.bandeira === "Visa" ? "R32" : "R33",
        sourceId: "tc40",
        targetId: cfg.bandeira === "Visa" ? "vamp" : "ecp",
        fase: "Mensal · Compliance",
        titulo:
          cfg.bandeira === "Visa"
            ? "Contaminação do Índice Unificado VAMP (Visa Acquirer Monitoring Program)"
            : "Contaminação do Programa ECP / EFM (Mastercard Excessive Chargeback)",
        resumo: "A fraude e a disputa entram no numerador de monitoria da Bandeira, gerando risco de multa por item.",
        pacoteIso:
          cfg.bandeira === "Visa"
            ? "VAMP Ratio = (TC40 + Disputas) ÷ Total TC05 · Limiar Adquirente ≥ 0,5%"
            : "ECP / EFM Ratio mensal · Risco de Assessment em USD no relatório MCBS",
        impactoFinanceiro: "Custo de Disputa (-R$ 75,00) + Risco de multa de US$ 4 a US$ 10 por item no VAMP/ECP",
      });
    }
  }

  const steps: SimStep[] = rawSteps.map((s, idx) => ({
    ...s,
    step: idx + 1,
  }));

  const isNegative = margemReais < 0 || (cfg.simularFraude && !cfg.authForte);
  const hasPenalty = perdaEvitavelReais > 0.01;
  const cor = isNegative ? "#f87171" : hasPenalty ? "#f59e0b" : "#10b981";
  const risco: "baixo" | "medio" | "alto" | "critico" = isNegative
    ? "critico"
    : hasPenalty
    ? "alto"
    : "baixo";

  const ambNome =
    cfg.ambiente === "ecom"
      ? `E-com ${parcelas}x`
      : cfg.ambiente === "debito"
      ? "Presencial Débito"
      : `Presencial Crédito ${parcelas}x`;

  const alertaDiagnostico =
    perdaEvitavelReais > 0.01
      ? `⚠️ Perda evitável de ${fmtBRL(perdaEvitavelReais)} nesta transação (${perda10kTransacoes} a cada 10.000 vendas) por ${
          !cfg.clearingIntegro
            ? "Downgrade de Clearing (D+6 / Sem ID)"
            : !cfg.authForte
            ? "falta de autenticação 3DS/EMV"
            : "ausência de Tokenização DPAN"
        }. Ative as chaves verdes ao lado para simular a recuperação de margem!`
      : cfg.simularFraude && cfg.authForte
      ? `🛡️ Simulação de Fraude Ativa: Graças ao 3DS/EMV ligado, o Liability Shift bloqueou o Chargeback de ${fmtBRL(valor)} na ligação R23!`
      : `✅ Configuração Otimizada: Menor alíquota de intercâmbio (${fmtPct(aliquotaRealPct)}) atingida sem vazamento de margem.`;

  return {
    id: presetId || "what-if-custom",
    curto: `${ambNome} · ${fmtBRL(valor)} (${cfg.bandeira})`,
    titulo: `Simulação What-If: ${ambNome} ${fmtBRL(valor)} · ${cfg.bandeira} (${cfg.tier === "premium" ? "Black/Infinite" : "Standard"})`,
    subtitulo: `${irdLabel} · Token ${cfg.token ? "ON" : "OFF"} · 3DS/EMV ${cfg.authForte ? "ON" : "OFF"} · Clearing ${cfg.clearingIntegro ? "D+1 OK" : "D+6 Downgrade"}${cfg.subcred ? " · PayFac CIP/SLC" : ""}`,
    bandeira: cfg.bandeira,
    cor,
    risco,
    aliquotaAlvoPct,
    aliquotaRealPct,
    perdaEvitavelReais,
    perda10kTransacoes,
    alertaDiagnostico,
    waterfall: {
      bruto: fmtBRL(valor),
      mdr: `- ${fmtBRL(mdrReais)} (${fmtPct(mdrPct)})`,
      liquidoLojista:
        cfg.simularFraude && !cfg.authForte
          ? `${fmtBRL(liquidoLojistaReais)} (Estornado p/ R$ 0 no CBK!)`
          : fmtBRL(liquidoLojistaReais),
      intercambio: `- ${fmtBRL(icRealReais)} (${fmtPct(aliquotaRealPct)} · ${irdLabel.split(" ")[0]})`,
      schemeFee: `- ${fmtBRL(schemeAndSponsorReais)} (${fmtPct(schemeAndSponsorPct)}${disputeFeeReais > 0 ? " + R$ 75 CBK" : ""})`,
      margemAdquirente: `${fmtBRL(margemReais, true)} (${fmtPct(margemPct, true)})`,
      statusQualificacao: irdLabel,
    },
    steps,
  };
}

interface RaioXFieldRow {
  id: string;
  campo: string;
  nome: string;
  edgeId: string;
  req0100: {
    codigo: string;
    detalhe: string;
  };
  resp0110: {
    codigo: string;
    detalhe: string;
    ator: string;
  };
  clearing1240: {
    codigo: string;
    detalhe: string;
  };
  status: "ok" | "alerta" | "downgrade";
  statusLabel: string;
  impactoRegra: string;
}

function buildRaioXFields(
  cfg: WhatIfConfig,
  sc: ReturnType<typeof buildWhatIfScenario>
): RaioXFieldRow[] {
  const isEcom = cfg.ambiente === "ecom";
  const isDebito = cfg.ambiente === "debito";
  const isVisa = cfg.bandeira === "Visa";
  const isMC = cfg.bandeira === "Mastercard";

  const clearingMsg = isVisa
    ? "BASE II TC 05 (TCR 0/1/5/7)"
    : isMC
    ? "IPM 1240 (First Presentment)"
    : "Arquivo Liquidação Elo";

  const tidLabel = isVisa
    ? "DE 62.2 (Transaction ID 15 díg.)"
    : isMC
    ? "DE 63 (Banknet Ref 9 chars + MMDD)"
    : "NSU Elo + Ciclo ID";

  const irdField = isVisa
    ? "Fee Program Indicator (FPI)"
    : isMC
    ? "PDS 0158 (Interchange Rate Designator)"
    : "Tabela Intercâmbio Elo";

  return [
    {
      id: "rx-de02",
      campo: "DE 02 + DE 48 SE 33",
      nome: "Credencial (FPAN vs Network Token DPAN + TAVV)",
      edgeId: cfg.token ? "R13" : "R08",
      req0100: cfg.token
        ? {
            codigo: "DE 02 = DPAN (Token 16 díg.) + TAVV",
            detalhe: `Adquirente envia Token de Rede (${isVisa ? "VTS" : isMC ? "MDES" : "Elo Token"}) + criptograma dinâmico TAVV e Token Requestor ID.`,
          }
        : {
            codigo: "DE 02 = FPAN (16 díg. aberto)",
            detalhe: isEcom
              ? "Cartão digitado ou salvo em cofre proprietário sem tokenização de bandeira."
              : "PAN lido diretamente do cartão físico.",
          },
      resp0110: cfg.token
        ? {
            codigo: "Detokenização DPAN → FPAN + Assurance Level",
            detalhe: `Cofre da Bandeira (${isVisa ? "VTS" : isMC ? "MDES" : "Elo"}) valida o TAVV, entrega o FPAN real ao Emissor e devolve nível de confiança na 0110.`,
            ator: "Bandeira → Emissor",
          }
        : {
            codigo: "DE 02 = FPAN (Sem Cofre de Rede)",
            detalhe: "Emissor recebe FPAN aberto; em CNP aplica score mais rígido (+risco de falso-positivo).",
            ator: "Emissor",
          },
      clearing1240: cfg.token
        ? {
            codigo: `${clearingMsg}: DPAN + Token Ind.`,
            detalhe: "Clearing referencia o DPAN e qualifica para benefício tarifário de credencial tokenizada.",
          }
        : {
            codigo: `${clearingMsg}: FPAN Aberto`,
            detalhe: isEcom
              ? "Sem indicador de Token de Rede; elegível apenas a tarifa não-tokenizada."
              : "Apresentação padrão com FPAN.",
          },
      status: cfg.token ? "ok" : "alerta",
      statusLabel: cfg.token ? "🟢 Tokenizado (Ótimo)" : "⚠️ FPAN Aberto (-Aprovação)",
      impactoRegra: cfg.token
        ? "Aumenta aprovação do Emissor em +3% a +5% e cumpre requisito de segurança para menor tarifa de Intercâmbio."
        : "Em CNP, trafegar FPAN aberto reduz aprovação e expõe a transação a sobretaxa/downgrade de credencial não tokenizada.",
    },
    {
      id: "rx-de22",
      campo: "DE 22 + DE 61",
      nome: "POS Entry Mode (Modo de Captura & Capacidade do Terminal)",
      edgeId: isEcom ? "R08" : "R01",
      req0100: {
        codigo: isEcom
          ? cfg.token
            ? "DE 22 = 010 / 810 (COF / Token E-com)"
            : "DE 22 = 012 / 812 (PAN Digitado CNP)"
          : cfg.token
          ? "DE 22 = 071 (Contactless NFC EMV)"
          : "DE 22 = 051 (Chip EMV Contato)",
        detalhe: isEcom
          ? "Identifica transação Card-Not-Present (E-commerce) e capacidade de captura de segurança."
          : "Identifica leitura física presencial via Chip EMV ou aproximação NFC.",
      },
      resp0110: {
        codigo: "DE 22 Validado pelo Switch",
        detalhe: "Switch da Bandeira registra o modo de entrada original da autorização para auditoria no Clearing.",
        ator: "Switch Bandeira",
      },
      clearing1240: cfg.clearingIntegro
        ? {
            codigo: "DE 22 Idêntico à 0100 (Espelhado)",
            detalhe: "Host de captura preserva o exato POS Entry Mode autorizado em D+0.",
          }
        : {
            codigo: "🔴 DE 22 Divergente (Ex.: 012 Manual)",
            detalhe: "Host da Adquirente/PayFac alterou ou rebaixou o POS Entry Mode ao montar o arquivo de clearing.",
          },
      status: cfg.clearingIntegro ? "ok" : "downgrade",
      statusLabel: cfg.clearingIntegro ? "🟢 Espelhado Íntegro" : "🔴 Divergente (Downgrade)",
      impactoRegra:
        "Se o DE 22 do Clearing divergir do DE 22 autorizado na 0100, o motor da bandeira rebaixa automaticamente a transação para a tarifa Standard / Key-Entered.",
    },
    {
      id: "rx-3ds-emv",
      campo: isEcom ? "DE 48 SE 42 / Campo 60.8 (SLI / ECI)" : "DE 55 (Tags EMV ARQC / IAD)",
      nome: isEcom
        ? "Autenticação EMV 3DS 2.2 (SLI / ECI + Criptograma CAVV/AAV)"
        : "Criptograma de Chip EMV Presencial (ARQC → ARPC)",
      edgeId: isEcom ? (cfg.authForte ? "R12" : "R08") : "R11",
      req0100: isEcom
        ? cfg.authForte
          ? {
              codigo: isVisa ? "Campo 60.8 ECI = 05 + CAVV 20B" : "DE 48 SE 42 SLI = 212 + AAV (UCAF)",
              detalhe: "Prova criptográfica gerada pelo ACS do Emissor no fluxo EMV 3DS 2.2 frictionless/challenge.",
            }
          : {
              codigo: isVisa ? "Campo 60.8 ECI = 07 (Não Autenticado)" : "DE 48 SE 42 SLI = 210 (Sem 3DS)",
              detalhe: "Transação enviada sem autenticação 3DS; risco de fraude permanece 100% com Lojista/Adquirente.",
            }
        : cfg.authForte
        ? {
            codigo: "DE 55 = 9F26 (ARQC) + 9F10 (IAD) + 9F36",
            detalhe: "Criptograma dinâmico gerado pelo chip EMV no terminal POS + PIN Block (DE 52).",
          }
        : {
            codigo: "🔴 DE 55 Ausente (Fallback Trilha POS 901)",
            detalhe: "Leitura por tarja magnética em cartão que possui chip EMV (Technical Fallback).",
          },
      resp0110: isEcom
        ? {
            codigo: cfg.authForte ? "CAVV/AAV Validated (Liability Shift ON)" : "Aprovado Sem Liability Shift",
            detalhe: cfg.authForte
              ? "Emissor valida criptograma 3DS e assume a responsabilidade financeira contra fraude (10.4 / 4837)."
              : "Emissor aprova crédito, mas não concede Liability Shift de fraude.",
            ator: "ACS / Emissor",
          }
        : {
            codigo: cfg.authForte ? "DE 55 Tag 91 = ARPC (Chip Validado)" : "Aprovado sob Risco de Fallback",
            detalhe: cfg.authForte
              ? "HSM do Emissor valida o ARQC e devolve o ARPC para o chip confirmar autenticidade."
              : "Sem validação de criptograma de chip EMV.",
            ator: "HSM Emissor",
          },
      clearing1240:
        cfg.authForte && cfg.clearingIntegro
          ? {
              codigo: isEcom
                ? `${clearingMsg}: SLI 212 / ECI 05 + CAVV`
                : `${clearingMsg}: Dados EMV TCR 07 / DE 55`,
              detalhe: "Indicador de autenticação forte espelhado integralmente na apresentação D+1.",
            }
          : cfg.authForte && !cfg.clearingIntegro
          ? {
              codigo: "🔴 SLI / ECI / CAVV Truncado no Clearing!",
              detalhe: "A autorização teve 3DS/EMV em D+0, mas o Host omitiu o indicador no lote de Clearing D+1.",
            }
          : {
              codigo: isEcom ? "SLI 210 / ECI 07 (Sem 3DS)" : "Sem Tags EMV (Fallback)",
              detalhe: "Apresentação sem prova de autenticação forte.",
            },
      status: cfg.authForte && cfg.clearingIntegro ? "ok" : !cfg.authForte ? "alerta" : "downgrade",
      statusLabel:
        cfg.authForte && cfg.clearingIntegro
          ? "🟢 Autenticado + Liability Shift"
          : !cfg.authForte
          ? "⚠️ Sem 3DS/EMV (Sem Shift)"
          : "🔴 Truncado no Clearing",
      impactoRegra: cfg.authForte
        ? "Garante a menor alíquota de Intercâmbio e bloqueia Chargeback de Fraude (Liability Shift para o Emissor), desde que espelhado no Clearing."
        : "Sem 3DS/Chip EMV, a alíquota de Intercâmbio sobe e qualquer contestação de fraude vira perda direta + contagem no VAMP/ECP.",
    },
    {
      id: "rx-de38-39",
      campo: "DE 38 + DE 39",
      nome: "Código de Autorização (Auth ID Response) & Action Code",
      edgeId: "R07",
      req0100: {
        codigo: "Ausente na 0100 (Solicitado ao Emissor)",
        detalhe: "A mensagem 0100 pede aprovação para DE 04 = " + fmtBRL(cfg.valor) + " (DE 49 = 986 BRL).",
      },
      resp0110: {
        codigo: 'DE 39 = "00" (Aprovado) · DE 38 = "A84F92"',
        detalhe: "Gerado pelo Host do Emissor na 0110 confirmando reserva de limite (Open-to-Buy) do portador.",
        ator: "Host Emissor",
      },
      clearing1240: cfg.clearingIntegro
        ? {
            codigo: 'DE 38 = "A84F92" (Espelhado Exato)',
            detalhe: "Enviado na apresentação D+1 comprovando que a captura corresponde a uma autorização válida.",
          }
        : {
            codigo: '🔴 DE 38 = "000000" / Divergente',
            detalhe: "Código de autorização zerado ou corrompido pelo sistema de captura.",
          },
      status: cfg.clearingIntegro ? "ok" : "downgrade",
      statusLabel: cfg.clearingIntegro ? "🟢 Espelhado Íntegro" : "🔴 Auth Code Inválido",
      impactoRegra:
        "Apresentar clearing sem o DE 38 exato da 0110 gera Downgrade imediato de intercâmbio e expõe a Adquirente a Chargeback técnico de falta de autorização (Visa 11.3 / MC 4808).",
    },
    {
      id: "rx-tid-de63",
      campo: tidLabel,
      nome: "Identificador Único de Ciclo de Vida (Elo entre Autorização e Clearing)",
      edgeId: cfg.clearingIntegro ? "R21" : "R29",
      req0100: {
        codigo: "DE 11 STAN + DE 37 RRN (Origem Adquirente)",
        detalhe: "A Adquirente envia seu número sequencial (STAN/RRN), mas o ID global da Bandeira ainda não existe.",
      },
      resp0110: {
        codigo: isVisa
          ? 'DE 62.2 TID = "306281490218472" (15 díg.)'
          : isMC
          ? 'DE 63 = "MCC849201" + Data "1019"'
          : 'NSU Elo = "948201948201"',
        detalhe:
          "Nascido no Switch da Bandeira no milissegundo da autorização e devolvido na 0110. DEVE ser gravado no banco da Adquirente.",
        ator: "Switch Bandeira → 0110",
      },
      clearing1240: cfg.clearingIntegro
        ? {
            codigo: `${clearingMsg} (D+1): ID 100% Espelhado`,
            detalhe: "Auto-matching perfeito em D+1 entre o log de autorização (0110) e a apresentação financeira.",
          }
        : {
            codigo: `🔴 ${clearingMsg} (D+6): ID Omitido / Atrasado`,
            detalhe:
              "Host truncou o DE 62.2 / DE 63 ou enviou a captura após a janela máxima de tempestividade (Late Presentment).",
          },
      status: cfg.clearingIntegro ? "ok" : "downgrade",
      statusLabel: cfg.clearingIntegro ? "🟢 Matching D+1 OK" : "🔴 Elo Quebrado / Downgrade",
      impactoRegra:
        "Principal causa de vazamento de margem no Brasil: se o DE 62.2 (Visa) ou DE 63 (MC) for truncado ou enviado fora do prazo (D+1), a bandeira aplica tarifa de penalidade (Standard / EIRF), encarecendo +45 a +65 bps!",
    },
    {
      id: "rx-payfac",
      campo: "DE 43 + DE 18 (MCC) + PDS 0176 / PF ID",
      nome: "Identificação do Estabelecimento, MCC e Subcredenciador (PayFac)",
      edgeId: cfg.subcred ? "R03" : "R01",
      req0100: cfg.subcred
        ? {
            codigo: 'DE 43 = "PF*LOJA SUB" + PF ID + Sub-Merchant ID',
            detalhe:
              "Modelo Subcredenciador: envia ID do Facilitador (PF ID), código e CNPJ do Sub-lojista e MCC real (DE 18).",
          }
        : {
            codigo: 'DE 43 = "LOJA DIRETA" + MID + MCC (DE 18)',
            detalhe: "Credenciamento direto na Adquirente com Merchant ID e MCC do lojista.",
          },
      resp0110: {
        codigo: "Cadastro de Merchant / MCC Validado",
        detalhe: "Switch verifica regularidade do MID / PF ID e se o MCC é elegível ao programa de intercâmbio.",
        ator: "Switch Bandeira",
      },
      clearing1240:
        cfg.subcred && !cfg.clearingIntegro
          ? {
              codigo: "🔴 PF ID / CNPJ Sub-lojista Ausente no Lote",
              detalhe: "Clearing enviado sem desmembrar o Sub-Merchant ID ou com MCC divergente da 0100.",
            }
          : {
              codigo: cfg.subcred
                ? "PDS 0176/0208 (PF ID + CNPJ Sub-EC) + MCC OK"
                : "MID Direto + MCC Espelhado + Grade CIP/SLC",
              detalhe: "Dados cadastrais íntegros para o clearing da bandeira e para o arquivo de liquidação CIP/SLC.",
            },
      status: cfg.subcred && !cfg.clearingIntegro ? "downgrade" : "ok",
      statusLabel:
        cfg.subcred && !cfg.clearingIntegro
          ? "🔴 Falha Cadastro PayFac"
          : cfg.subcred
          ? "🟢 PayFac + CIP/SLC OK"
          : "🟢 EC Direto OK",
      impactoRegra: cfg.subcred
        ? "No subcredenciamento, a consistência do PF ID + CNPJ do Sub-lojista entre 0100, Clearing e grade CIP/SLC é obrigatória pelas bandeiras e pela Res. BCB 150."
        : "O MCC (DE 18) deve ser idêntico na autorização e no clearing para qualificar a tabela setorial de intercâmbio.",
    },
    {
      id: "rx-ird",
      campo: irdField,
      nome: "Qualificador Final da Tarifa de Intercâmbio (Cálculo em D+1)",
      edgeId: sc.perdaEvitavelReais > 0.01 ? "R29" : isDebito ? "R55" : "R28",
      req0100: {
        codigo: "Insumos enviados na 0100 (Não há IRD fixo na 0100)",
        detalhe: `Alíquota Alvo se todos os requisitos forem cumpridos: ${fmtPct(sc.aliquotaAlvoPct)} (${fmtBRL((cfg.valor * sc.aliquotaAlvoPct) / 100)}).`,
      },
      resp0110: {
        codigo: "Elegibilidade Preliminar Registrada",
        detalhe: "Bandeira carimba no log da 0110 se houve Token, 3DS/EMV e aprovação eletrônica.",
        ator: "Motor Bandeira",
      },
      clearing1240: {
        codigo: `${sc.waterfall.statusQualificacao} → ${fmtPct(sc.aliquotaRealPct)}`,
        detalhe:
          sc.perdaEvitavelReais > 0.01
            ? `🔴 Rebaixado no Clearing! Custo subiu para ${fmtBRL((cfg.valor * sc.aliquotaRealPct) / 100)} (+${fmtBRL(sc.perdaEvitavelReais)} por venda / +${sc.perda10kTransacoes} em 10k vendas).`
            : `✅ Qualificação máxima confirmada no arquivo ${isVisa ? "VSS-120 / TC 05" : isMC ? "T140 / IPM" : "Elo"}: ${fmtBRL((cfg.valor * sc.aliquotaRealPct) / 100)}.`,
      },
      status: sc.perdaEvitavelReais > 0.01 ? "downgrade" : "ok",
      statusLabel:
        sc.perdaEvitavelReais > 0.01
          ? `🔴 Downgrade (+${(sc.aliquotaRealPct - sc.aliquotaAlvoPct).toFixed(2)}%)`
          : `🟢 Qualificado (${fmtPct(sc.aliquotaRealPct)})`,
      impactoRegra:
        "O Intercâmbio NUNCA é cobrado na autorização (0100/0110): ele é calculado exclusivamente no Clearing (D+1) cruzando a 0110 com o arquivo de apresentação.",
    },
  ];
}

const EDGE_KIND_META: Record<
  EdgeKind,
  { label: string; short: string; color: string; bg: string; border: string; dashed?: boolean }
> = {
  dados: {
    label: "Fluxo de Dados & Mensageria",
    short: "Dados / ISO",
    color: "#80ddc6",
    bg: "rgba(128, 221, 198, 0.14)",
    border: "rgba(128, 221, 198, 0.35)",
  },
  calculo: {
    label: "Regra de Cálculo & Qualificação",
    short: "Cálculo IC",
    color: "#b6a0f2",
    bg: "rgba(182, 160, 242, 0.14)",
    border: "rgba(182, 160, 242, 0.35)",
    dashed: true,
  },
  financeiro: {
    label: "Fluxo Financeiro & Liquidação",
    short: "Financeiro",
    color: "#f59e0b",
    bg: "rgba(245, 158, 11, 0.14)",
    border: "rgba(245, 158, 11, 0.35)",
  },
  compliance: {
    label: "Monitoria, Disputa & Compliance",
    short: "Compliance",
    color: "#f87171",
    bg: "rgba(248, 113, 113, 0.14)",
    border: "rgba(248, 113, 113, 0.35)",
    dashed: true,
  },
};

const SUBDOMINIO_LABELS: Record<string, string> = {
  autorizacao: "Autorização (D+0)",
  clearing: "Clearing / Apresentação (D+1)",
  liquidacao: "Settlement / Liquidação",
  intercambio: "Tarifa de Intercâmbio",
  pricing: "Pricing, MDR & Billing",
  chargeback: "Disputas & Chargebacks",
  fraude: "Fraude & Reporte (TC40/SAFE)",
  seguranca: "Segurança, EMV, 3DS & Token",
  compliance: "Compliance, Programas & Regulação",
  operacoes: "Operações & Infraestrutura",
  governanca: "Governança & Rulebook",
};

const SWIMLANES = [
  { y: 35, h: 175, title: "CAMADA 1 · ATORES DO ARRANJO, SUBCREDENCIAMENTO & REGULAÇÃO (BACEN / CIP)", color: "#3b82f6" },
  { y: 220, h: 195, title: "CAMADA 2 · DADOS DO CARTÃO, MENSAGERIA ISO 8583, TOKENIZAÇÃO & 3DS", color: "#10b981" },
  { y: 425, h: 120, title: "CAMADA 3 · CICLO DE VIDA TRANSACIONAL (D+0 AUTORIZAÇÃO → D+1 CLEARING → SETTLEMENT → DISPUTAS)", color: "#8b5cf6" },
  { y: 555, h: 190, title: "CAMADA 4 · ECONOMIA DA TRANSAÇÃO (MDR, INTERCÂMBIO, IRD, TIERS, DOWNGRADES & BILLING MCBS)", color: "#f59e0b" },
  { y: 755, h: 175, title: "CAMADA 5 · MOTORES DE BANDEIRA (VISANET/VSS/VCF, GCMS/MPE T068, ELO) & PROGRAMAS (VAMP/ECP/MATCH)", color: "#06b6d4" },
];

interface BrandEquivalenceSpec {
  titulo: string;
  visa: { codigo: string; mensageria: string; regra: string; deepLink: string };
  mastercard: { codigo: string; mensageria: string; regra: string; deepLink: string };
  elo: { codigo: string; mensageria: string; regra: string; deepLink: string };
}

function getBrandEquivalence(subdominio?: string): BrandEquivalenceSpec {
  switch (subdominio) {
    case "intercambio":
      return {
        titulo: "Qualificação de Intercâmbio (FPI vs. IRD vs. Matriz Elo)",
        visa: {
          codigo: "FPI + PID (F^, P^, N^, C^, I^)",
          mensageria: "BASE II TC 05 · Pos 60.8 ECI + DE 62.2 TID",
          regra: "866 regras (Tables 3-12 a 3-38 + 326 MCCs NNSS). Falta de TID gera Downgrade EIRF.",
          deepLink: "/mapa/irds?brand=Visa&mode=tables",
        },
        mastercard: {
          codigo: "IRD (PDS 0158 · IA, JÁ, AU, AV, AW, VF)",
          mensageria: "IPM 1240 · DE 63 Banknet Ref + DE 48 SE 42 SLI",
          regra: "820 regras (Table 76 + GCMS T164/T165 + 76 MCCs). Clearing tardio cai em IRD 80.",
          deepLink: "/mapa/irds?brand=Mastercard&mode=tables",
        },
        elo: {
          codigo: "Faixa BIN + 21 Segmentos MCC",
          mensageria: "Elo ISO 8583 / Base 2 · NSU + ECI",
          regra: "417 regras oficiais + 381 MCCs de Redução Fee (Caps R$ 0,35 em Governo, 0,36% Supermercado).",
          deepLink: "/mapa/irds?brand=Elo&mode=tables",
        },
      };
    case "autorizacao":
    case "seguranca":
      return {
        titulo: "Autorização Online (D+0), 3DS 2.2 & Criptograma",
        visa: {
          codigo: "VIP System · MTI 0100 / 0110",
          mensageria: "DE 62.2 (Transaction ID 15 díg) + Pos 126.9 CAVV + ECI 05/06/07",
          regra: "ECI 05 ativa Liability Shift (Regra 10.4) e tarifa CP/3DS reduzida.",
          deepLink: "/mapa/irds?brand=Visa&node=VISA_GEN_T",
        },
        mastercard: {
          codigo: "Banknet CIS · MTI 0100 / 0110",
          mensageria: "DE 63 (Banknet Ref 9 chars + Data) + DE 48 SE 42 (SLI 212/211/210) + SE 43 AAV",
          regra: "SLI 212 qualifica IRDs AU/AV/AW (-32 bps vs HU/HV/HW) e protege contra CBK 4837.",
          deepLink: "/mapa/irds?brand=Mastercard&node=IRD_AU_AV_AW",
        },
        elo: {
          codigo: "Switch Elo · MTI 0100 / 0110",
          mensageria: "DE 55 EMV ARQC + Protocolo 3DS 2.2 Elo + Tokenização DPAN",
          regra: "Autenticação EMV/3DS diferencia taxa presencial vs. CNP e garante troca de responsabilidade.",
          deepLink: "/mapa/irds?brand=Elo&node=ELO_T",
        },
      };
    case "clearing":
    case "liquidacao":
      return {
        titulo: "Clearing em Lote (D+1), FX & Liquidação (CIP / Cross-Border)",
        visa: {
          codigo: "BASE II (TC 05 / TC 06) + VSS-110/120/130",
          mensageria: "EPX / Edit Package · DE 4 (Tx) → DE 6 (Billing) · Cut-off 07h05 GMT",
          regra: "Liquidação doméstica via CIP SLC (VISC) e internacional em USD/EUR com FPA no VSS.",
          deepLink: "/mapa/liquidacao?brand=visa&edge=V04",
        },
        mastercard: {
          codigo: "GCMS IPM (MTI 1240) + T140 / T461",
          mensageria: "Blocos físicos de 1014B (0x4040) · DE 4 → DE 5 (Settlement) → DE 6 (Billing)",
          regra: "Janelas MPE T068 (IP0030T1, T164, T165, T168 FX); doméstica no SLC (MASC) e cross-border T461.",
          deepLink: "/mapa/liquidacao?brand=mastercard&edge=M03",
        },
        elo: {
          codigo: "Liquidação Elo / B3 + CIP SLC",
          mensageria: "Arquivos de compensação Elo + Grades ASLC029 (Crédito) e ASLC031 (Débito)",
          regra: "Compensação multilateral doméstica na CIP/SILOC com janelas diárias de liquidação.",
          deepLink: "/mapa/irds?brand=Elo&mode=gcms",
        },
      };
    case "scheme_fees":
      return {
        titulo: "Faturamento da Bandeira (Scheme Fees / Assessments)",
        visa: {
          codigo: "Visa GMR / VIC Billing + VSS-110",
          mensageria: "Jurisdiction Code + Fee Program + Eventos de Autorização/Clearing/Disputa",
          regra: "Cobrança de Volume Assessment, International Acquiring/Service Fee e eventos de rede.",
          deepLink: "/mapa/liquidacao?brand=visa&edge=V14",
        },
        mastercard: {
          codigo: "MCBS (Billing System) · Arquivo T145",
          mensageria: "ICA + Billing Event 014833.X + Tier Progressivo + Reversão R39",
          regra: "Auditável no Atlas MCBS (/mapa/mcbs) com 15 relações literais (R01–R15) e fatura consolidada.",
          deepLink: "/mapa/mcbs?edge=R01",
        },
        elo: {
          codigo: "Faturamento Elo (Tabela Fee Elo v2)",
          mensageria: "Assessments por volume, conectividade, tokenização e processamento de disputas",
          regra: "381 MCCs contam com política específica de redução de fee e intercâmbio.",
          deepLink: "/mapa/irds?brand=Elo&mode=mccs",
        },
      };
    default:
      return {
        titulo: "Disputas, Chargebacks, Fraude & Monitoria (VAMP / ECP)",
        visa: {
          codigo: "VROL · TC 15 (Disputa) + TC 40 (Fraude)",
          mensageria: "Códigos 10.1 a 13.9 · Visa Acquirer Monitoring Program (VAMP Unificado Abr/2025)",
          regra: "Soma TC 40 + TC 15 sobre vendas CNP (TC 05); teto 1,5% EC e 0,5% Adquirente.",
          deepLink: "/mapa/liquidacao?brand=visa&edge=V10",
        },
        mastercard: {
          codigo: "Mastercom · MTI 1442 (CBK) + SAFE",
          mensageria: "Códigos 4837 (Fraude), 4853 (Desacordo) · ECP (Excessive Chargeback) + EFM",
          regra: "Alerta com ≥ 100 CBKs e ≥ 1,0% a 1,5% de razão sobre vendas do mês anterior.",
          deepLink: "/mapa/liquidacao?brand=mastercard&edge=M08",
        },
        elo: {
          codigo: "Plataforma de Disputas Elo",
          mensageria: "Ciclo de 1º Chargeback, Reapresentação e Arbitragem doméstica",
          regra: "Prazos e códigos alinhados ao mercado brasileiro com proteção via EMV e 3DS.",
          deepLink: "/mapa/irds?brand=Elo",
        },
      };
  }
}

// ─── Componente Principal ─────────────────────────────────────────────────────

export default function MapaClient() {
  // Filtros e estados de navegação
  const [busca, setBusca] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>("");
  const [bandeiraFiltro, setBandeiraFiltro] = useState<string>("");
  const [papelFiltro, setPapelFiltro] = useState<string>("");
  const [subdominioFiltro, setSubdominioFiltro] = useState<string>("");
  const [kindFiltro, setKindFiltro] = useState<string>("");
  const [rotaAtiva, setRotaAtiva] = useState<string | null>(null);

  // Seleções e modos de visualização
  const [focusNodeId, setFocusNodeId] = useState<string | null>("intercambio");
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>("R28");
  const [inspectMode, setInspectMode] = useState<"node" | "edge">("node");
  const [edgeDetailTab, setEdgeDetailTab] = useState<"payload" | "nodes" | "compare" | "tools">("payload");
  const [viewMode, setViewMode] = useState<"graph" | "matrix" | "raiox">("graph");
  const [didatico, setDidatico] = useState<boolean>(true);
  const [showLanes, setShowLanes] = useState<boolean>(true);
  const [efeitoBorboleta, setEfeitoBorboleta] = useState<boolean>(true);

  // Estados do Simulador Visual de Transação Passo a Passo & Laboratório What-If
  const [simScenarioId, setSimScenarioId] = useState<string | null>(null);
  const [simStepIdx, setSimStepIdx] = useState<number>(0);
  const [simAutoPlay, setSimAutoPlay] = useState<boolean>(false);
  const [whatIf, setWhatIf] = useState<WhatIfConfig>(WHATIF_PRESETS["ecom-qualificado"]);

  // Estado de Zoom e Pan do SVG
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const dragRef = useRef<{ startX: number; startY: number; panX: number; panY: number } | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Mapas de acesso rápido
  const catMap = useMemo(
    () => Object.fromEntries(mapaData.categorias.map((c) => [c.id, c])),
    []
  );
  const nodeMap = useMemo(
    () => new Map<string, NoData>(mapaData.nos.map((n) => [n.id, n])),
    []
  );
  const edgeMap = useMemo(
    () => new Map<string, EdgeData>(mapaData.arestas.map((e) => [e.id, e])),
    []
  );

  // Filtragem de arestas (como no Atlas de Liquidação Internacional)
  const visibleEdges = useMemo(() => {
    const q = busca.trim().toLowerCase();
    return mapaData.arestas.filter((e) => {
      const sourceNode = nodeMap.get(e.source);
      const targetNode = nodeMap.get(e.target);
      if (!sourceNode || !targetNode) return false;

      if (rotaAtiva && !(e.routeGroup || []).includes(rotaAtiva)) {
        return false;
      }

      if (
        categoriaFiltro &&
        sourceNode.categoria !== categoriaFiltro &&
        targetNode.categoria !== categoriaFiltro
      ) {
        return false;
      }

      if (
        bandeiraFiltro &&
        e.brand !== bandeiraFiltro &&
        e.brand !== "Todas" &&
        sourceNode.bandeira !== bandeiraFiltro &&
        targetNode.bandeira !== bandeiraFiltro
      ) {
        return false;
      }

      if (
        papelFiltro &&
        e.role !== papelFiltro &&
        e.role !== "ambos" &&
        sourceNode.papel !== papelFiltro &&
        targetNode.papel !== papelFiltro
      ) {
        return false;
      }

      if (
        subdominioFiltro &&
        e.subdominio !== subdominioFiltro &&
        sourceNode.subdominio !== subdominioFiltro &&
        targetNode.subdominio !== subdominioFiltro
      ) {
        return false;
      }

      if (kindFiltro && e.kind !== kindFiltro) {
        return false;
      }

      if (q) {
        const haystack = [
          e.id,
          e.label,
          e.direction,
          e.rule,
          e.exceptions,
          e.payload,
          sourceNode.label,
          sourceNode.descricao,
          ...(sourceNode.camposTecnicos || []),
          targetNode.label,
          targetNode.descricao,
          ...(targetNode.camposTecnicos || []),
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      return true;
    });
  }, [
    busca,
    categoriaFiltro,
    bandeiraFiltro,
    papelFiltro,
    subdominioFiltro,
    kindFiltro,
    rotaAtiva,
    nodeMap,
  ]);

  // Filtragem de nós visíveis
  const visibleNodes = useMemo(() => {
    const q = busca.trim().toLowerCase();
    const edgeNodeIds = new Set(visibleEdges.flatMap((e) => [e.source, e.target]));

    return mapaData.nos.filter((n) => {
      // Se há rota ativa, mostra apenas os nós das arestas da rota
      if (rotaAtiva) {
        return edgeNodeIds.has(n.id);
      }

      if (categoriaFiltro && n.categoria !== categoriaFiltro && !edgeNodeIds.has(n.id)) {
        return false;
      }

      if (
        bandeiraFiltro &&
        n.bandeira !== bandeiraFiltro &&
        n.bandeira !== "Todas" &&
        !edgeNodeIds.has(n.id)
      ) {
        return false;
      }

      if (
        papelFiltro &&
        n.papel !== papelFiltro &&
        n.papel !== "ambos" &&
        !edgeNodeIds.has(n.id)
      ) {
        return false;
      }

      if (subdominioFiltro && n.subdominio !== subdominioFiltro && !edgeNodeIds.has(n.id)) {
        return false;
      }

      if (kindFiltro && !edgeNodeIds.has(n.id)) {
        return false;
      }

      if (q) {
        const nodeMatches = [
          n.id,
          n.label,
          n.descricao,
          n.analogy,
          n.impacto,
          n.quemEnvia,
          n.quemRecebe,
          n.comoCalcula,
          ...(n.camposTecnicos || []),
        ]
          .join(" ")
          .toLowerCase()
          .includes(q);
        return nodeMatches || edgeNodeIds.has(n.id);
      }

      return true;
    });
  }, [
    busca,
    categoriaFiltro,
    bandeiraFiltro,
    papelFiltro,
    subdominioFiltro,
    kindFiltro,
    rotaAtiva,
    visibleEdges,
  ]);

  // Efeito Borboleta: calcula nós a montante (upstream) e a jusante (downstream) do focusNodeId
  const butterflySet = useMemo(() => {
    if (!focusNodeId || !efeitoBorboleta) return null;
    const impacted = new Set<string>([focusNodeId]);
    const directUpstream = new Set<string>();
    const downstream = new Set<string>();

    // BFS para encontrar toda a cadeia a jusante (downstream)
    const queue = [focusNodeId];
    while (queue.length > 0) {
      const curr = queue.shift()!;
      for (const e of visibleEdges) {
        if (e.source === curr && !impacted.has(e.target)) {
          impacted.add(e.target);
          downstream.add(e.target);
          queue.push(e.target);
        }
      }
    }

    // Vizinhos diretos a montante (quem alimenta este nó)
    for (const e of visibleEdges) {
      if (e.target === focusNodeId) {
        impacted.add(e.source);
        directUpstream.add(e.source);
      }
    }

    return { all: impacted, upstream: directUpstream, downstream };
  }, [focusNodeId, efeitoBorboleta, visibleEdges]);

  // Lista de ligações no painel inferior central (filtrada pelo foco se houver nó focado)
  const listedEdges = useMemo(() => {
    if (!focusNodeId) return visibleEdges;
    const direct = visibleEdges.filter(
      (e) => e.source === focusNodeId || e.target === focusNodeId
    );
    return direct.length > 0 ? direct : visibleEdges;
  }, [visibleEdges, focusNodeId]);

  // Nó e Aresta atualmente inspecionados no painel direito
  const activeNode = useMemo(() => {
    if (focusNodeId && nodeMap.has(focusNodeId)) return nodeMap.get(focusNodeId)!;
    return visibleNodes[0] || mapaData.nos[0];
  }, [focusNodeId, nodeMap, visibleNodes]);

  const activeEdge = useMemo(() => {
    if (selectedEdgeId && edgeMap.has(selectedEdgeId)) return edgeMap.get(selectedEdgeId)!;
    return listedEdges[0] || visibleEdges[0] || mapaData.arestas[0];
  }, [selectedEdgeId, edgeMap, listedEdges, visibleEdges]);

  // Conexões de entrada e saída do activeNode
  const activeNodeConnections = useMemo(() => {
    if (!activeNode) return { incoming: [], outgoing: [] };
    const incoming = mapaData.arestas
      .filter((e) => e.target === activeNode.id)
      .map((e) => ({ edge: e, node: nodeMap.get(e.source)! }))
      .filter((x) => Boolean(x.node));
    const outgoing = mapaData.arestas
      .filter((e) => e.source === activeNode.id)
      .map((e) => ({ edge: e, node: nodeMap.get(e.target)! }))
      .filter((x) => Boolean(x.node));
    return { incoming, outgoing };
  }, [activeNode, nodeMap]);

  // ─── Estado Derivado do Simulador de Transação Passo a Passo & What-If ─────
  const whatIfComputedScenario = useMemo(() => {
    return buildWhatIfScenario(whatIf, simScenarioId || "what-if-custom");
  }, [whatIf, simScenarioId]);

  const activeScenario = useMemo(() => {
    if (!simScenarioId) return null;
    return whatIfComputedScenario;
  }, [simScenarioId, whatIfComputedScenario]);

  const raioXFields = useMemo(() => {
    return buildRaioXFields(whatIf, whatIfComputedScenario);
  }, [whatIf, whatIfComputedScenario]);

  const activeSimStep = useMemo(() => {
    if (!activeScenario) return null;
    return activeScenario.steps[simStepIdx] || activeScenario.steps[0] || null;
  }, [activeScenario, simStepIdx]);

  const simEdgeStepMap = useMemo(() => {
    const map = new Map<string, number>();
    if (!activeScenario) return map;
    for (const s of activeScenario.steps) {
      map.set(s.edgeId, s.step);
    }
    return map;
  }, [activeScenario]);

  const simNodeSet = useMemo(() => {
    const set = new Set<string>();
    if (!activeScenario) return set;
    for (const s of activeScenario.steps) {
      set.add(s.sourceId);
      set.add(s.targetId);
    }
    return set;
  }, [activeScenario]);

  const applySimStepSelection = useCallback(
    (scenario: SimScenario, stepIndex: number) => {
      const stepObj = scenario.steps[stepIndex];
      if (!stepObj) return;
      setSelectedEdgeId(stepObj.edgeId);
      setFocusNodeId(stepObj.targetId);
      setInspectMode("edge");
      setEdgeDetailTab("payload");
    },
    []
  );

  const handleSelectScenario = useCallback(
    (scenarioId: string) => {
      if (simScenarioId === scenarioId) {
        setSimScenarioId(null);
        setSimAutoPlay(false);
        return;
      }
      const presetCfg = WHATIF_PRESETS[scenarioId] || whatIf;
      const sc = buildWhatIfScenario(presetCfg, scenarioId);
      // Limpa filtros restritivos para garantir que todos os nós e arestas do cenário estejam visíveis
      setBusca("");
      setCategoriaFiltro("");
      setBandeiraFiltro("");
      setPapelFiltro("");
      setSubdominioFiltro("");
      setKindFiltro("");
      setRotaAtiva(null);
      setWhatIf(presetCfg);
      setSimScenarioId(scenarioId);
      setSimStepIdx(0);
      setSimAutoPlay(false);
      applySimStepSelection(sc, 0);
    },
    [simScenarioId, whatIf, applySimStepSelection]
  );

  const handleUpdateWhatIf = useCallback(
    (partial: Partial<WhatIfConfig>, focusEdgeIds?: string[]) => {
      setSimAutoPlay(false);
      const nextCfg: WhatIfConfig = { ...whatIf, ...partial };
      if (partial.ambiente === "debito") {
        nextCfg.parcelas = 1;
        if (whatIf.ambiente !== "debito") nextCfg.mdrPct = 1.19;
      } else if (partial.ambiente && whatIf.ambiente === "debito") {
        nextCfg.mdrPct = nextCfg.parcelas === 1 ? 2.69 : 3.2;
      }
      setWhatIf(nextCfg);
      setSimScenarioId("what-if-custom");

      const nextSc = buildWhatIfScenario(nextCfg, "what-if-custom");
      let targetIdx = Math.min(simStepIdx, nextSc.steps.length - 1);
      if (focusEdgeIds && focusEdgeIds.length > 0) {
        const foundIdx = nextSc.steps.findIndex((s) =>
          focusEdgeIds.includes(s.edgeId)
        );
        if (foundIdx >= 0) targetIdx = foundIdx;
      }
      setSimStepIdx(targetIdx);
      applySimStepSelection(nextSc, targetIdx);
    },
    [whatIf, simStepIdx, applySimStepSelection]
  );

  const handleGoToSimStep = useCallback(
    (idx: number) => {
      if (!activeScenario) return;
      const bounded = (idx + activeScenario.steps.length) % activeScenario.steps.length;
      setSimStepIdx(bounded);
      applySimStepSelection(activeScenario, bounded);
    },
    [activeScenario, applySimStepSelection]
  );

  useEffect(() => {
    if (!simAutoPlay || !activeScenario) return;
    const timer = window.setInterval(() => {
      setSimStepIdx((prev) => {
        const next = (prev + 1) % activeScenario.steps.length;
        applySimStepSelection(activeScenario, next);
        return next;
      });
    }, 3400);
    return () => window.clearInterval(timer);
  }, [simAutoPlay, activeScenario, applySimStepSelection]);

  // ─── Ponte Direta para o Doc Studio (/editor) ──────────────────────────────

  const handleSendScenarioToDocStudio = useCallback(() => {
    const sc = activeScenario || whatIfComputedScenario;
    const wf = sc.waterfall;
    const stepsRows = sc.steps
      .map(
        (s) => `
        <tr>
          <td><strong>#${s.step} · ${s.fase}</strong><br/><code>${s.edgeId}</code></td>
          <td><strong>${s.titulo}</strong><br/>${s.resumo}</td>
          <td><code>${s.pacoteIso}</code></td>
          <td>${s.impactoFinanceiro}</td>
        </tr>`
      )
      .join("");

    const html = `
      <h2>Simulação Ponta a Ponta: ${sc.titulo}</h2>
      <p><strong>Resumo do Cenário:</strong> ${sc.subtitulo}</p>
      <h3>1. Decomposição Financeira da Transação (Waterfall R$)</h3>
      <table>
        <thead>
          <tr>
            <th>Componente Econômico</th>
            <th>Valor / Alíquota</th>
            <th>Quem Paga → Quem Recebe</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Valor Bruto da Compra</strong></td>
            <td><strong>${wf.bruto}</strong></td>
            <td>Portador → Fluxo Transacional</td>
          </tr>
          <tr>
            <td><strong>MDR Total Cobrado do Lojista</strong></td>
            <td>${wf.mdr}</td>
            <td>Lojista (EC) → Adquirente / Subcredenciador</td>
          </tr>
          <tr>
            <td><strong>Tarifa de Intercâmbio (Issuer Fee)</strong></td>
            <td><strong>${wf.intercambio}</strong></td>
            <td>Adquirente → Emissor (Issuer)</td>
          </tr>
          <tr>
            <td><strong>Taxas de Bandeira (Scheme Fees)</strong></td>
            <td>${wf.schemeFee}</td>
            <td>Adquirente → Bandeira (${sc.bandeira})</td>
          </tr>
          <tr>
            <td><strong>Valor Líquido Repassado ao Lojista</strong></td>
            <td>${wf.liquidoLojista}</td>
            <td>Liquidação via CIP/SLC → Lojista (EC)</td>
          </tr>
          <tr>
            <td><strong>Margem Líquida (Net MDR Adquirente/PayFac)</strong></td>
            <td><strong>${wf.margemAdquirente}</strong></td>
            <td>Resultado Operacional (${wf.statusQualificacao})</td>
          </tr>
        </tbody>
      </table>
      <h3>2. Rastreabilidade Técnica Passo a Passo (D+0 → Clearing → Settlement)</h3>
      <table>
        <thead>
          <tr>
            <th>Etapa / Ligação</th>
            <th>Ação no Ecossistema</th>
            <th>Payload ISO 8583 / Clearing / Settlement</th>
            <th>Impacto Financeiro & Risco</th>
          </tr>
        </thead>
        <tbody>
          ${stepsRows}
        </tbody>
      </table>
    `;

    const normBrand =
      sc.bandeira === "Visa"
        ? "visa"
        : sc.bandeira === "Mastercard"
        ? "mastercard"
        : sc.bandeira === "Elo"
        ? "elo"
        : "geral";

    const normRisk =
      sc.risco === "critico" || sc.risco === "alto"
        ? "Alto"
        : sc.risco === "medio"
        ? "Médio"
        : "Baixo";

    sendToDocStudio({
      mode: "full_dossier",
      title: `Parecer de Simulação Transacional — ${sc.curto}`,
      sourceModule: "Atlas Interativo (/mapa) · Simulador de Transação",
      html,
      metadata: {
        brand: normBrand,
        brandName: sc.bandeira,
        referenceId: `SIM-${sc.id.toUpperCase()}`,
        category: "Simulação Ponta a Ponta (ISO 8583 + Intercâmbio + Liquidação)",
        riskLevel: normRisk,
        executiveSummary: `${sc.titulo}. Status: ${wf.statusQualificacao}. Margem Líquida: ${wf.margemAdquirente}.`,
        recommendedAction:
          sc.risco === "critico"
            ? "Implementar autenticação EMV 3DS 2.2 + Tokenização de Rede (VTS/MDES) e garantir submissão de clearing até D+1 com preservação integral do DE 62.2 / DE 63 para eliminar downgrades e exposição ao VAMP."
            : "Manter monitoramento contínuo da qualificação de IRD/Fee Program nos arquivos de retorno (T140/VSS-120) e conciliação diária com a grade CIP/SLC.",
      },
    });
  }, [activeScenario, whatIfComputedScenario]);

  const handleSendRaioXToDocStudio = useCallback(() => {
    const sc = whatIfComputedScenario;
    const rowsHtml = raioXFields
      .map(
        (r) => `
        <tr>
          <td><strong>${r.campo}</strong><br/><small>${r.nome} (<code>${r.edgeId}</code>)</small></td>
          <td><code>${r.req0100.codigo}</code><br/><small>${r.req0100.detalhe}</small></td>
          <td><code>${r.resp0110.codigo}</code><br/><small>${r.resp0110.detalhe}</small></td>
          <td><code>${r.clearing1240.codigo}</code><br/><small>${r.clearing1240.detalhe}</small></td>
          <td><strong>${r.statusLabel}</strong><br/><small>${r.impactoRegra}</small></td>
        </tr>`
      )
      .join("");

    const html = `
      <h2>Raio-X Diff de Mensageria: Autorização (0100 → 0110) × Clearing (D+1)</h2>
      <p><strong>Configuração Auditada:</strong> ${sc.titulo} · <strong>Bandeira:</strong> ${whatIf.bandeira} · <strong>Status de Qualificação:</strong> ${sc.waterfall.statusQualificacao}</p>
      <blockquote><strong>Diagnóstico Executivo:</strong> ${sc.alertaDiagnostico}</blockquote>
      <h3>Matriz Comparativa de Ciclo de Vida dos Campos (0100 → 0110 → Clearing)</h3>
      <table>
        <thead>
          <tr>
            <th>Data Element / Campo</th>
            <th>1. Auth Request (MTI 0100 · D+0)</th>
            <th>2. Auth Response (MTI 0110 · D+0)</th>
            <th>3. Clearing / Apresentação (D+1)</th>
            <th>Status & Regra de Qualificação</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>
    `;

    const normBrand =
      whatIf.bandeira === "Visa"
        ? "visa"
        : whatIf.bandeira === "Mastercard"
        ? "mastercard"
        : "elo";

    sendToDocStudio({
      mode: "full_dossier",
      title: `Raio-X Diff ISO 8583 (0100 → 0110 → Clearing) — ${whatIf.bandeira}`,
      sourceModule: "Atlas Interativo (/mapa) · Raio-X Diff de Mensageria",
      html,
      metadata: {
        brand: normBrand,
        brandName: whatIf.bandeira,
        referenceId: `RAIOX-${whatIf.bandeira.toUpperCase()}-${whatIf.ambiente.toUpperCase()}`,
        category: "Auditoria de Mensageria ISO 8583 & Clearing D+1",
        riskLevel: sc.perdaEvitavelReais > 0.01 ? "Alto" : "Baixo",
        executiveSummary: sc.alertaDiagnostico,
        recommendedAction:
          "Garantir espelhamento bit-a-bit entre os dados retornados na 0110 (DE 38, DE 62.2 / DE 63, SLI/ECI) e o lote de Clearing D+1 (IPM 1240 / BASE II TC 05).",
      },
    });
  }, [whatIf, whatIfComputedScenario, raioXFields]);

  const handleSendNodeToDocStudio = useCallback(
    (node: NoData) => {
      const cat = catMap[node.categoria];
      const camposHtml = (node.camposTecnicos || [])
        .map((c) => `<li><code>${c}</code></li>`)
        .join("");

      const html = `
        <h2>Ficha Técnica de Conceito: ${node.label}</h2>
        <p><strong>Camada Arquitetural:</strong> ${cat?.label || node.categoria} · <strong>Bandeira/Rede:</strong> ${node.bandeira} · <strong>Subdomínio:</strong> ${SUBDOMINIO_LABELS[node.subdominio] || node.subdominio}</p>
        ${node.analogy ? `<blockquote><strong>Tradução Executiva (Analogia):</strong> “${node.analogy}”</blockquote>` : ""}
        <h3>1. Definição Técnica & Papel na Arquitetura</h3>
        <p>${node.descricao}</p>
        <h3>2. Protocolo de Rastreabilidade (Quem Envia → Quem Recebe → Como Calcula)</h3>
        <table>
          <thead>
            <tr>
              <th>Dimensão</th>
              <th>Especificação no Arranjo</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Quem Envia (Origem)</strong></td>
              <td>${node.quemEnvia}</td>
            </tr>
            <tr>
              <td><strong>Quem Recebe (Destino)</strong></td>
              <td>${node.quemRecebe}</td>
            </tr>
            <tr>
              <td><strong>Como Calcula / Regra</strong></td>
              <td><strong>${node.comoCalcula}</strong></td>
            </tr>
          </tbody>
        </table>
        ${node.impacto ? `<h3>3. Efeito Borboleta & Impacto Financeiro/Operacional</h3><p>${node.impacto}</p>` : ""}
        ${node.excecoes ? `<h3>4. Exceções, Limites & Armadilhas</h3><p>${node.excecoes}</p>` : ""}
        ${camposHtml ? `<h3>5. Campos ISO 8583, PDS, Tabelas & Arquivos Relacionados</h3><ul>${camposHtml}</ul>` : ""}
      `;

      const bLower = (node.bandeira || "").toLowerCase();
      const normBrand: "visa" | "mastercard" | "elo" | "geral" =
        bLower === "visa"
          ? "visa"
          : bLower === "mastercard"
          ? "mastercard"
          : bLower === "elo"
          ? "elo"
          : "geral";

      sendToDocStudio({
        mode: "full_dossier",
        title: `Ficha Técnica — ${node.label} (${node.bandeira})`,
        sourceModule: "Atlas Interativo (/mapa) · Inspetor de Conceito",
        html,
        metadata: {
          brand: normBrand,
          brandName: node.bandeira,
          referenceId: `NODE-${node.id.toUpperCase()}`,
          category: cat?.label || node.categoria,
          riskLevel: "Médio",
          executiveSummary: `${node.label}: ${node.descricao}`,
          recommendedAction: node.comoCalcula,
        },
      });
    },
    [catMap]
  );

  const handleSendEdgeToDocStudio = useCallback(
    (edge: EdgeData) => {
      const fromNode = nodeMap.get(edge.source);
      const toNode = nodeMap.get(edge.target);
      const meta = EDGE_KIND_META[(edge.kind as EdgeKind) || "dados"] || EDGE_KIND_META.dados;

      const html = `
        <h2>Evidência de Relação Técnica [${edge.id}]: ${edge.label}</h2>
        <p><strong>Fluxo:</strong> ${fromNode?.label || edge.source} → ${toNode?.label || edge.target} (${edge.direction})</p>
        <p><strong>Natureza:</strong> ${meta.label} · <strong>Bandeira:</strong> ${edge.brand} · <strong>Janela/Timing:</strong> ${edge.timing}</p>
        <h3>1. Regra de Negócio e Comportamento Técnico</h3>
        <p>${edge.rule}</p>
        ${edge.exceptions ? `<h3>2. Exceções, Riscos de Downgrade ou Penalidades</h3><p>${edge.exceptions}</p>` : ""}
        <h3>3. Evidência Técnica (Payload ISO 8583 / Clearing / Relatórios)</h3>
        <pre><code>${edge.payload}</code></pre>
      `;

      const bLower = (edge.brand || "").toLowerCase();
      const normBrand: "visa" | "mastercard" | "elo" | "geral" =
        bLower === "visa"
          ? "visa"
          : bLower === "mastercard"
          ? "mastercard"
          : bLower === "elo"
          ? "elo"
          : "geral";

      sendToDocStudio({
        mode: "full_dossier",
        title: `Regra Técnica ${edge.id} — ${edge.label}`,
        sourceModule: "Atlas Interativo (/mapa) · Inspetor de Ligação",
        html,
        metadata: {
          brand: normBrand,
          brandName: edge.brand,
          referenceId: edge.id,
          category: meta.label,
          riskLevel: edge.kind === "compliance" ? "Alto" : "Médio",
          executiveSummary: `${edge.id} (${fromNode?.label} → ${toNode?.label}): ${edge.rule}`,
          recommendedAction: edge.exceptions || edge.payload,
        },
      });
    },
    [nodeMap]
  );

  // ─── Ações de Navegação ─────────────────────────────────────────────────────

  const handleSelectNode = useCallback(
    (nodeId: string) => {
      if (focusNodeId === nodeId && inspectMode === "node") {
        // Segundo clique limpa o foco de isolamento, mantendo a inspeção
        setFocusNodeId(null);
        return;
      }
      setFocusNodeId(nodeId);
      setInspectMode("node");
      // Seleciona também a primeira aresta conectada a este nó para deixar pronta na aba de relação
      const connected = visibleEdges.find(
        (e) => e.source === nodeId || e.target === nodeId
      );
      if (connected) setSelectedEdgeId(connected.id);
    },
    [focusNodeId, inspectMode, visibleEdges]
  );

  const handleSelectEdge = useCallback((edgeId: string) => {
    setSelectedEdgeId(edgeId);
    setInspectMode("edge");
    setEdgeDetailTab("payload");
  }, []);

  const handleSelectRoute = useCallback(
    (rota: RotaGuiada) => {
      if (rotaAtiva === rota.id) {
        setRotaAtiva(null);
        return;
      }
      setSimScenarioId(null);
      setSimAutoPlay(false);
      setBusca("");
      setCategoriaFiltro("");
      setBandeiraFiltro("");
      setPapelFiltro("");
      setSubdominioFiltro("");
      setKindFiltro("");
      setRotaAtiva(rota.id);
      setSelectedEdgeId(rota.focoEdge);
      const edge = edgeMap.get(rota.focoEdge);
      if (edge) {
        setFocusNodeId(edge.source);
      }
      setInspectMode("edge");
      setZoom(1);
      setPan({ x: 0, y: 0 });
    },
    [rotaAtiva, edgeMap]
  );

  const handleClearFilters = useCallback(() => {
    setSimScenarioId(null);
    setSimAutoPlay(false);
    setBusca("");
    setCategoriaFiltro("");
    setBandeiraFiltro("");
    setPapelFiltro("");
    setSubdominioFiltro("");
    setKindFiltro("");
    setRotaAtiva(null);
    setFocusNodeId(null);
    setSelectedEdgeId("R28");
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  const handleExportJson = useCallback(() => {
    const blob = new Blob([JSON.stringify(mapaData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "atlas-conceitos-ecossistema.json";
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  // ─── Geometria de Curvas SVG das Arestas ────────────────────────────────────

  const computeEdgeGeometry = useCallback(
    (e: EdgeData) => {
      const a = nodeMap.get(e.source);
      const b = nodeMap.get(e.target);
      if (!a || !b) return null;

      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const len = Math.hypot(dx, dy) || 1;

      // Raio de recuo para não sobrepor a pílula do nó
      const padStart = 36;
      const padEnd = 40;
      const x1 = a.x + (dx / len) * padStart;
      const y1 = a.y + (dy / len) * padStart;
      const x2 = b.x - (dx / len) * padEnd;
      const y2 = b.y - (dy / len) * padEnd;

      // Offset para arestas irmãs entre o mesmo par de nós
      const siblings = visibleEdges.filter(
        (x) =>
          (x.source === e.source && x.target === e.target) ||
          (x.source === e.target && x.target === e.source)
      );
      const idx = siblings.findIndex((x) => x.id === e.id);
      const baseCurve = siblings.length > 1 ? (idx - (siblings.length - 1) / 2) * 34 : 18;

      const mx = (x1 + x2) / 2 - (dy / len) * baseCurve;
      const my = (y1 + y2) / 2 + (dx / len) * baseCurve;

      // Ponto médio na curva quadrática (t = 0.5)
      const labelX = 0.25 * x1 + 0.5 * mx + 0.25 * x2;
      const labelY = 0.25 * y1 + 0.5 * my + 0.25 * y2;

      return {
        path: `M ${x1.toFixed(1)},${y1.toFixed(1)} Q ${mx.toFixed(1)},${my.toFixed(1)} ${x2.toFixed(1)},${y2.toFixed(1)}`,
        labelX,
        labelY,
      };
    },
    [nodeMap, visibleEdges]
  );

  // ─── Controles de Pan / Zoom no SVG ─────────────────────────────────────────

  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    const target = e.target as HTMLElement;
    if (target.closest("[data-node-id],[data-edge-id]")) return;
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      panX: pan.x,
      panY: pan.y,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!dragRef.current || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const scaleX = 1260 / rect.width;
    const scaleY = 960 / rect.height;
    setPan({
      x: dragRef.current.panX + (e.clientX - dragRef.current.startX) * scaleX,
      y: dragRef.current.panY + (e.clientY - dragRef.current.startY) * scaleY,
    });
  };

  const handlePointerUp = () => {
    dragRef.current = null;
  };

  const handleWheel = (e: React.WheelEvent<SVGSVGElement>) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.12 : 0.89;
    setZoom((z) => Math.max(0.55, Math.min(2.6, Number((z * factor).toFixed(2)))));
  };

  const activeRouteObj = useMemo(
    () => mapaData.rotasGuiadas.find((r) => r.id === rotaAtiva) || null,
    [rotaAtiva]
  );

  return (
    <div className="flex flex-col w-full h-full bg-[#11131a] text-[#e9ecf6] select-none overflow-hidden">
      {/* ── Barra de Escopo & Ações Rápidas (Padrão Atlas de Liquidação) ─────── */}
      <div className="flex items-center justify-between gap-4 px-5 py-2 bg-[#1c1d2b] border-b border-[#30364b] text-xs shrink-0 flex-wrap">
        <div className="flex items-center gap-2.5 text-[#c5cbe0]">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[#80ddc6] font-semibold text-[11px]">
            ● Rastreabilidade Ativa
          </span>
          <span className="hidden xl:inline">
            Protocolo <b>Quem Envia → Quem Recebe → Como Calcula</b> · {mapaData.nos.length} conceitos e{" "}
            {mapaData.arestas.length} ligações técnicas mapeadas
          </span>
          {activeRouteObj && (
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold"
              style={{
                background: `${activeRouteObj.cor}20`,
                border: `1px solid ${activeRouteObj.cor}60`,
                color: activeRouteObj.cor,
              }}
            >
              <Compass size={12} />
              Rota: {activeRouteObj.titulo}
              <button
                onClick={() => setRotaAtiva(null)}
                className="ml-1 hover:opacity-75 underline"
              >
                (sair)
              </button>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Toggle Modo Didático */}
          <button
            onClick={() => setDidatico((d) => !d)}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border text-[11px] font-bold transition-all cursor-pointer ${
              didatico
                ? "bg-blue-500/20 border-blue-400/50 text-blue-300"
                : "bg-[#202432] border-[#30364b] text-[#9ba4ba]"
            }`}
            title="Exibe analogias práticas e curiosidades junto com a especificação técnica"
          >
            <Sparkles size={12} />
            Modo Didático: {didatico ? "ON" : "OFF"}
          </button>

          {/* Toggle Efeito Borboleta */}
          <button
            onClick={() => setEfeitoBorboleta((b) => !b)}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border text-[11px] font-bold transition-all cursor-pointer ${
              efeitoBorboleta
                ? "bg-emerald-500/20 border-emerald-400/50 text-[#80ddc6]"
                : "bg-[#202432] border-[#30364b] text-[#9ba4ba]"
            }`}
            title="Destaca automaticamente toda a cadeia de impacto a montante e a jusante do nó focado"
          >
            🦋 Efeito Borboleta: {efeitoBorboleta ? "ON" : "OFF"}
          </button>

          {/* Alternador Grafo vs Matriz vs Raio-X ISO */}
          <div className="inline-flex rounded-lg bg-[#151822] p-0.5 border border-[#30364b]">
            <button
              onClick={() => setViewMode("graph")}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                viewMode === "graph"
                  ? "bg-[#273e39] text-[#80ddc6]"
                  : "text-[#9ba4ba] hover:text-white"
              }`}
            >
              <Network size={12} />
              Grafo
            </button>
            <button
              onClick={() => setViewMode("matrix")}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                viewMode === "matrix"
                  ? "bg-[#273e39] text-[#80ddc6]"
                  : "text-[#9ba4ba] hover:text-white"
              }`}
            >
              <Table2 size={12} />
              Matriz ({visibleNodes.length})
            </button>
            <button
              onClick={() => setViewMode("raiox")}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                viewMode === "raiox"
                  ? "bg-[#273e39] text-[#80ddc6]"
                  : "text-[#9ba4ba] hover:text-white"
              }`}
              title="Comparador lado a lado do ciclo de vida dos campos: Autorização Request (0100) → Response (0110) → Clearing D+1 (IPM 1240 / BASE II TC 05)"
            >
              <GitCommit size={12} />
              Raio-X ISO (0100→0110→Clearing)
            </button>
          </div>

          <button
            onClick={handleExportJson}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#202432] hover:border-[#80ddc6] border border-[#30364b] text-[11px] text-[#e9ecf6] transition-all cursor-pointer"
          >
            <Download size={12} />
            Exportar JSON
          </button>
        </div>
      </div>

      {/* ── Workspace de 3 Colunas (Estilo Liquidação Internacional) ────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[285px_minmax(440px,1fr)_430px] flex-1 min-h-0 overflow-hidden">
        {/* ════════════════════════════════════════════════════════════════════
            COLUNA 1 (ESQUERDA): JORNADAS GUIADAS, BUSCA & FILTROS FACETADOS
           ════════════════════════════════════════════════════════════════════ */}
        <aside className="bg-[#191c26] border-r border-[#30364b] p-4 overflow-y-auto flex flex-col gap-4 min-h-0">
          {/* 1. Rotas Rápidas / Jornadas Guiadas */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#80ddc6] flex items-center gap-1.5">
                <Compass size={13} />
                Jornadas Guiadas
              </h2>
              {rotaAtiva && (
                <button
                  onClick={() => setRotaAtiva(null)}
                  className="text-[10px] text-[#9ba4ba] hover:text-white underline cursor-pointer"
                >
                  Ver todas
                </button>
              )}
            </div>
            <div className="grid gap-1.5">
              {mapaData.rotasGuiadas.map((rota) => {
                const isActive = rotaAtiva === rota.id;
                return (
                  <button
                    key={rota.id}
                    onClick={() => handleSelectRoute(rota)}
                    className={`w-full text-left px-2.5 py-2 rounded-lg border transition-all cursor-pointer ${
                      isActive
                        ? "bg-[#252b3d] border-[#80ddc6] shadow-[inset_3px_0_0_#80ddc6]"
                        : "bg-[#202432] border-[#30364b] hover:border-[#80ddc6]/60"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-semibold text-[#e9ecf6] leading-tight">
                        {rota.titulo}
                      </span>
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ background: rota.cor }}
                      />
                    </div>
                    <span className="block text-[10px] text-[#9ba4ba] mt-0.5 leading-snug">
                      {rota.subtitulo}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Busca Textual */}
          <div>
            <label
              htmlFor="atlas-search"
              className="block text-[11px] font-medium text-[#9ba4ba] mb-1"
            >
              Buscar conceito, campo ISO, tabela ou regra
            </label>
            <div className="relative">
              <Search
                size={13}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#9ba4ba] pointer-events-none"
              />
              <input
                id="atlas-search"
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Ex.: DE 22, PDS 0158, VAMP, T068, IRD…"
                className="w-full pl-8 pr-3 py-2 rounded-lg bg-[#11131a] border border-[#30364b] text-xs text-[#e9ecf6] placeholder:text-[#64708a] focus:outline-none focus:border-[#80ddc6]"
              />
            </div>
          </div>

          {/* 3. Pills de Categoria */}
          <div>
            <span className="block text-[11px] font-medium text-[#9ba4ba] mb-1.5">
              Camada Conceitual (Categoria)
            </span>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setCategoriaFiltro("")}
                className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all cursor-pointer ${
                  categoriaFiltro === ""
                    ? "bg-[#273e39] border-[#80ddc6] text-[#80ddc6]"
                    : "bg-[#11131a] border-[#30364b] text-[#9ba4ba] hover:text-white"
                }`}
              >
                Todas ({mapaData.nos.length})
              </button>
              {mapaData.categorias.map((cat) => {
                const active = categoriaFiltro === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setCategoriaFiltro(active ? "" : cat.id)}
                    style={{
                      borderColor: active ? cat.cor : cat.corBorda,
                      background: active ? cat.corFundo : "#11131a",
                      color: active ? cat.cor : "#b0b8cc",
                    }}
                    className="px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all cursor-pointer hover:opacity-90"
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Filtros Facetados (Dropdowns como em Liquidação Internacional) */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] text-[#9ba4ba] mb-1">
                Bandeira / Rede
              </label>
              <select
                value={bandeiraFiltro}
                onChange={(e) => setBandeiraFiltro(e.target.value)}
                className="w-full px-2 py-1.5 rounded-lg bg-[#202432] border border-[#30364b] text-xs text-[#e9ecf6] focus:outline-none focus:border-[#80ddc6]"
              >
                <option value="">Todas</option>
                <option value="Visa">Visa</option>
                <option value="Mastercard">Mastercard</option>
                <option value="Elo">Elo</option>
                <option value="Bacen">Bacen / CIP / SPB</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] text-[#9ba4ba] mb-1">
                Papel no Arranjo
              </label>
              <select
                value={papelFiltro}
                onChange={(e) => setPapelFiltro(e.target.value)}
                className="w-full px-2 py-1.5 rounded-lg bg-[#202432] border border-[#30364b] text-xs text-[#e9ecf6] focus:outline-none focus:border-[#80ddc6]"
              >
                <option value="">Todos</option>
                <option value="adquirente">Adquirente</option>
                <option value="emissor">Emissor</option>
                <option value="bandeira">Bandeira</option>
                <option value="subcredenciador">Subcredenciador</option>
                <option value="lojista">Lojista (EC)</option>
                <option value="portador">Portador</option>
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-[11px] text-[#9ba4ba] mb-1">
                Subdomínio do Rulebook (Ciclo)
              </label>
              <select
                value={subdominioFiltro}
                onChange={(e) => setSubdominioFiltro(e.target.value)}
                className="w-full px-2 py-1.5 rounded-lg bg-[#202432] border border-[#30364b] text-xs text-[#e9ecf6] focus:outline-none focus:border-[#80ddc6]"
              >
                <option value="">Todos os subdomínios</option>
                {Object.entries(SUBDOMINIO_LABELS).map(([k, label]) => (
                  <option key={k} value={k}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-[11px] text-[#9ba4ba] mb-1">
                Natureza da Relação (Fluxo)
              </label>
              <select
                value={kindFiltro}
                onChange={(e) => setKindFiltro(e.target.value)}
                className="w-full px-2 py-1.5 rounded-lg bg-[#202432] border border-[#30364b] text-xs text-[#e9ecf6] focus:outline-none focus:border-[#80ddc6]"
              >
                <option value="">Todas as naturezas</option>
                <option value="dados">Fluxo de Dados & Mensageria (ISO/Clearing)</option>
                <option value="calculo">Regra de Cálculo & Qualificação (IC/IRD)</option>
                <option value="financeiro">Fluxo Financeiro (Tarifa/Settlement)</option>
                <option value="compliance">Monitoria, Disputa & Penalidade</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleClearFilters}
            className="w-full py-2 px-3 rounded-lg bg-[#202432] hover:bg-[#282d3e] border border-[#30364b] hover:border-[#80ddc6] text-xs font-semibold text-[#e9ecf6] flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <RotateCcw size={13} />
            Limpar filtros e foco
          </button>

          {/* 5. Estado da Curadoria & Métricas do Ecossistema */}
          <div className="p-3.5 rounded-xl bg-[#11131a] border border-[#30364b] text-xs space-y-1.5 mt-auto">
            <div className="text-[10px] font-bold uppercase tracking-widest text-[#80ddc6] mb-1">
              Métricas do Atlas
            </div>
            <div className="flex justify-between">
              <span className="text-[#9ba4ba]">Conceitos visíveis</span>
              <b className="text-[#e9ecf6]">
                {visibleNodes.length} / {mapaData.nos.length}
              </b>
            </div>
            <div className="flex justify-between">
              <span className="text-[#9ba4ba]">Ligações mapeadas</span>
              <b className="text-[#80ddc6]">
                {visibleEdges.length} / {mapaData.arestas.length}
              </b>
            </div>
            <div className="flex justify-between">
              <span className="text-[#9ba4ba]">Jornadas guiadas</span>
              <b className="text-[#b6a0f2]">{mapaData.rotasGuiadas.length} trilhas</b>
            </div>
            <div className="flex justify-between">
              <span className="text-[#9ba4ba]">Cobertura de arranjos</span>
              <b className="text-[#f6c775]">Visa · MC · Elo · CIP</b>
            </div>
            <p className="text-[11px] text-[#7c869e] pt-1.5 border-t border-[#222738] leading-relaxed">
              Clique em um <b>nó</b> para ver a ficha completa do conceito e ativar o{" "}
              <span className="text-[#80ddc6]">Efeito Borboleta</span>, ou clique em uma{" "}
              <b>ligação</b> para auditar campos ISO e regras de cálculo.
            </p>
          </div>
        </aside>

        {/* ════════════════════════════════════════════════════════════════════
            COLUNA 2 (CENTRO): GRAFO INTERATIVO SVG + LISTA DE LIGAÇÕES E REGRAS
           ════════════════════════════════════════════════════════════════════ */}
        <main className="p-4 flex flex-col gap-3 min-w-0 min-h-0 overflow-y-auto bg-[#11131a]">
          {/* Barra de Ferramentas do Grafo */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div>
              <h2 className="text-sm font-bold text-[#e9ecf6] m-0 flex items-center gap-2">
                Mapa de Arquitetura & Relações do Ecossistema
                {focusNodeId && nodeMap.get(focusNodeId) && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#273e39] text-[#80ddc6] text-[11px] font-semibold">
                    Foco: {nodeMap.get(focusNodeId)!.label}
                    <button
                      onClick={() => setFocusNodeId(null)}
                      className="ml-1 text-[10px] hover:underline"
                    >
                      ×
                    </button>
                  </span>
                )}
              </h2>
              <div className="text-[11px] text-[#9ba4ba]">
                {visibleNodes.length} conceitos ativos · {visibleEdges.length} de{" "}
                {mapaData.arestas.length} ligações ·{" "}
                {inspectMode === "node"
                  ? `Inspecionando conceito: ${activeNode?.label}`
                  : `Inspecionando relação: ${activeEdge?.id} (${activeEdge?.label})`}
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setShowLanes((s) => !s)}
                className={`px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-all cursor-pointer ${
                  showLanes
                    ? "bg-[#202432] border-[#80ddc6]/50 text-[#80ddc6]"
                    : "bg-[#191c26] border-[#30364b] text-[#9ba4ba]"
                }`}
              >
                <Layers size={12} className="inline mr-1" />
                Camadas
              </button>
              <button
                onClick={() => setZoom((z) => Math.max(0.55, Number((z / 1.18).toFixed(2))))}
                className="px-2.5 py-1 rounded-lg bg-[#202432] hover:border-[#80ddc6] border border-[#30364b] text-xs cursor-pointer"
                aria-label="Diminuir zoom"
              >
                <ZoomOut size={13} />
              </button>
              <button
                onClick={() => {
                  setZoom(1);
                  setPan({ x: 0, y: 0 });
                }}
                className="px-2.5 py-1 rounded-lg bg-[#202432] hover:border-[#80ddc6] border border-[#30364b] text-[11px] font-medium cursor-pointer"
              >
                <Maximize2 size={11} className="inline mr-1" />
                Enquadrar
              </button>
              <button
                onClick={() => setZoom((z) => Math.min(2.6, Number((z * 1.18).toFixed(2))))}
                className="px-2.5 py-1 rounded-lg bg-[#202432] hover:border-[#80ddc6] border border-[#30364b] text-xs cursor-pointer"
                aria-label="Aumentar zoom"
              >
                <ZoomIn size={13} />
              </button>
            </div>
          </div>

          {/* ── Simulador Visual de Transação Passo a Passo + Laboratório What-If ─ */}
          <div className="rounded-xl bg-[#191c26] border border-[#30364b] p-3 space-y-2.5 shrink-0">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-[#80ddc6] text-[10px] font-extrabold uppercase tracking-wider">
                  <Activity size={12} />
                  Laboratório &quot;What-If&quot; &amp; Trace no Grafo (D+0 → Liquidação)
                </span>
                <span className="text-[11px] text-[#9ba4ba] hidden sm:inline">
                  Escolha um preset ou altere as chaves (Token, 3DS, Clearing D+1 vs D+6, PayFac, Fraude) para ver a rota do grafo e o Waterfall R$ mudarem ao vivo:
                </span>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  onClick={() =>
                    setViewMode((v) => (v === "raiox" ? "graph" : "raiox"))
                  }
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-bold transition-all cursor-pointer ${
                    viewMode === "raiox"
                      ? "bg-purple-500/25 border-purple-400 text-purple-200"
                      : "bg-[#202432] hover:border-purple-400/60 border-[#30364b] text-[#b6a0f2]"
                  }`}
                  title="Alternar entre o Grafo e o Comparador Lado a Lado 0100 → 0110 → Clearing D+1"
                >
                  🔬 {viewMode === "raiox" ? "Voltar ao Grafo" : "Raio-X Diff ISO (0100→0110→Clearing)"}
                </button>
                {!activeScenario ? (
                  <button
                    onClick={() => handleSelectScenario("ecom-qualificado")}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#273e39] hover:bg-[#314e48] border border-[#80ddc6] text-[11px] font-bold text-[#80ddc6] transition-all cursor-pointer"
                  >
                    🧪 Abrir Laboratório What-If
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleSendScenarioToDocStudio}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-[#80ddc6]/60 text-[11px] font-bold text-[#80ddc6] transition-all cursor-pointer"
                      title="Exporta a simulação completa (Waterfall R$ + Tabela Passo a Passo ISO 8583) para o Doc Studio"
                    >
                      <FileText size={12} />
                      Gerar Parecer da Simulação no Doc Studio
                    </button>
                    <button
                      onClick={() => {
                        setSimScenarioId(null);
                        setSimAutoPlay(false);
                      }}
                      className="px-2 py-1 rounded-lg bg-[#202432] hover:bg-[#2a3042] border border-[#30364b] text-[11px] text-[#9ba4ba] hover:text-white cursor-pointer"
                    >
                      Fechar Simulação ×
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Botões dos 4 Cenários (Presets Rápidos) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-1.5">
              {CENARIOS_SIMULACAO.map((sc) => {
                const isSelected = simScenarioId === sc.id;
                return (
                  <button
                    key={sc.id}
                    onClick={() => handleSelectScenario(sc.id)}
                    className={`text-left px-2.5 py-2 rounded-lg border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                      isSelected
                        ? "bg-[#232b3e] border-[#80ddc6] shadow-[inset_3px_0_0_#80ddc6]"
                        : "bg-[#12151f] border-[#293044] hover:border-[#80ddc6]/60"
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="text-[11px] font-bold text-[#e9ecf6] truncate">
                        {sc.curto}
                      </div>
                      <div className="text-[10px] text-[#9ba4ba] truncate">
                        Preset · Margem: <b style={{ color: sc.cor }}>{sc.waterfall.margemAdquirente}</b>
                      </div>
                    </div>
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ background: sc.cor }}
                    />
                  </button>
                );
              })}
            </div>

            {/* Painel Expandido do Laboratório What-If quando um Cenário está Ativo */}
            {activeScenario && activeSimStep && (
              <div className="pt-2.5 border-t border-[#2a3045] space-y-2.5">
                {/* 1. Controles de Parâmetros da Venda + 5 Chaves Técnicas de Rota */}
                <div className="p-2.5 rounded-xl bg-[#121622] border border-[#2c334a] space-y-2.5">
                  <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-2 text-[11px]">
                    {/* Ambiente */}
                    <div>
                      <label className="block text-[9.5px] uppercase tracking-wider text-[#9ba4ba] mb-1">
                        Modalidade / Canal
                      </label>
                      <select
                        value={whatIf.ambiente}
                        onChange={(e) =>
                          handleUpdateWhatIf(
                            { ambiente: e.target.value as WhatIfConfig["ambiente"] },
                            ["R01", "R21", "R12", "R55"]
                          )
                        }
                        className="w-full px-2 py-1 rounded-lg bg-[#191c26] border border-[#30364b] text-xs text-[#e9ecf6] font-semibold focus:outline-none focus:border-[#80ddc6]"
                      >
                        <option value="ecom">E-commerce (CNP)</option>
                        <option value="presencial">Presencial Crédito (CP)</option>
                        <option value="debito">Presencial Débito (Cap BCB)</option>
                      </select>
                    </div>

                    {/* Bandeira */}
                    <div>
                      <label className="block text-[9.5px] uppercase tracking-wider text-[#9ba4ba] mb-1">
                        Bandeira do Arranjo
                      </label>
                      <select
                        value={whatIf.bandeira}
                        onChange={(e) =>
                          handleUpdateWhatIf(
                            { bandeira: e.target.value as WhatIfConfig["bandeira"] },
                            ["R05", "R06"]
                          )
                        }
                        className="w-full px-2 py-1 rounded-lg bg-[#191c26] border border-[#30364b] text-xs text-[#e9ecf6] font-semibold focus:outline-none focus:border-[#80ddc6]"
                      >
                        <option value="Mastercard">Mastercard (GCMS/T068)</option>
                        <option value="Visa">Visa (VisaNet/BASE II)</option>
                        <option value="Elo">Elo (Arranjo BR)</option>
                      </select>
                    </div>

                    {/* Tier do Cartão */}
                    <div>
                      <label className="block text-[9.5px] uppercase tracking-wider text-[#9ba4ba] mb-1">
                        Tier / Produto do BIN
                      </label>
                      <select
                        value={whatIf.tier}
                        onChange={(e) =>
                          handleUpdateWhatIf(
                            { tier: e.target.value as WhatIfConfig["tier"] },
                            ["R28"]
                          )
                        }
                        className="w-full px-2 py-1 rounded-lg bg-[#191c26] border border-[#30364b] text-xs text-[#e9ecf6] font-semibold focus:outline-none focus:border-[#80ddc6]"
                      >
                        <option value="premium">Black / Infinite / Nanquim</option>
                        <option value="standard">Gold / Platinum / Classic</option>
                      </select>
                    </div>

                    {/* Valor Bruto R$ */}
                    <div>
                      <label className="block text-[9.5px] uppercase tracking-wider text-[#9ba4ba] mb-1">
                        Valor da Venda (R$)
                      </label>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min={10}
                          step={50}
                          value={whatIf.valor}
                          onChange={(e) =>
                            handleUpdateWhatIf({
                              valor: Math.max(10, Number(e.target.value) || 100),
                            })
                          }
                          className="w-full px-2 py-1 rounded-lg bg-[#191c26] border border-[#30364b] text-xs text-[#80ddc6] font-bold focus:outline-none focus:border-[#80ddc6]"
                        />
                      </div>
                    </div>

                    {/* Parcelas */}
                    <div>
                      <label className="block text-[9.5px] uppercase tracking-wider text-[#9ba4ba] mb-1">
                        Parcelamento
                      </label>
                      <select
                        value={whatIf.ambiente === "debito" ? 1 : whatIf.parcelas}
                        disabled={whatIf.ambiente === "debito"}
                        onChange={(e) => {
                          const p = Number(e.target.value) as 1 | 3 | 10;
                          const suggestedMdr = p === 1 ? 2.69 : p === 3 ? 3.2 : 3.89;
                          handleUpdateWhatIf({ parcelas: p, mdrPct: suggestedMdr }, ["R28"]);
                        }}
                        className="w-full px-2 py-1 rounded-lg bg-[#191c26] border border-[#30364b] text-xs text-[#e9ecf6] font-semibold disabled:opacity-50 focus:outline-none focus:border-[#80ddc6]"
                      >
                        <option value={1}>1x (À Vista)</option>
                        <option value={3}>2 a 6x (Simular 3x)</option>
                        <option value={10}>7 a 12x (Simular 10x)</option>
                      </select>
                    </div>

                    {/* MDR Contratado (%) */}
                    <div>
                      <label className="block text-[9.5px] uppercase tracking-wider text-[#9ba4ba] mb-1">
                        MDR Cobrado EC (%)
                      </label>
                      <input
                        type="number"
                        min={0.5}
                        max={15}
                        step={0.1}
                        value={whatIf.mdrPct}
                        onChange={(e) =>
                          handleUpdateWhatIf({
                            mdrPct: Math.max(0.3, Number(e.target.value) || 1.0),
                          })
                        }
                        className="w-full px-2 py-1 rounded-lg bg-[#191c26] border border-[#30364b] text-xs text-amber-300 font-bold focus:outline-none focus:border-[#80ddc6]"
                      />
                    </div>
                  </div>

                  {/* 5 Chaves Técnicas que Mudam a Rota do Grafo Ao Vivo */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-1.5 pt-1">
                    {/* Chave 1: Tokenização */}
                    <button
                      onClick={() =>
                        handleUpdateWhatIf(
                          { token: !whatIf.token },
                          !whatIf.token ? ["R13"] : ["R08"]
                        )
                      }
                      className={`px-2.5 py-1.5 rounded-lg border text-left transition-all cursor-pointer flex items-center justify-between gap-2 ${
                        whatIf.token
                          ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-200"
                          : "bg-amber-500/10 border-amber-500/35 text-amber-200"
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="text-[10.5px] font-bold truncate">
                          🔐 Tokenização (DPAN)
                        </div>
                        <div className="text-[9.5px] opacity-80 truncate">
                          {whatIf.token ? "ON · R13 (VTS/MDES)" : "OFF · R08 (PAN Aberto)"}
                        </div>
                      </div>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold ${
                          whatIf.token
                            ? "bg-emerald-500 text-slate-950"
                            : "bg-amber-500/30 text-amber-200"
                        }`}
                      >
                        {whatIf.token ? "ON" : "OFF"}
                      </span>
                    </button>

                    {/* Chave 2: 3DS 2.2 / Chip EMV */}
                    <button
                      onClick={() =>
                        handleUpdateWhatIf(
                          { authForte: !whatIf.authForte },
                          !whatIf.authForte ? ["R21", "R12"] : ["R51"]
                        )
                      }
                      className={`px-2.5 py-1.5 rounded-lg border text-left transition-all cursor-pointer flex items-center justify-between gap-2 ${
                        whatIf.authForte
                          ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-200"
                          : "bg-rose-500/15 border-rose-500/40 text-rose-200"
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="text-[10.5px] font-bold truncate">
                          🛡️ {whatIf.ambiente === "ecom" ? "3DS 2.2 (ECI 02/05)" : "Chip EMV (DE 55 ARQC)"}
                        </div>
                        <div className="text-[9.5px] opacity-80 truncate">
                          {whatIf.authForte
                            ? "ON · Liability Shift Ativo"
                            : "OFF · ECI 07 / Sem Auth"}
                        </div>
                      </div>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold ${
                          whatIf.authForte
                            ? "bg-emerald-500 text-slate-950"
                            : "bg-rose-500 text-white"
                        }`}
                      >
                        {whatIf.authForte ? "ON" : "OFF"}
                      </span>
                    </button>

                    {/* Chave 3: Clearing D+1 Íntegro vs Downgrade D+6 */}
                    <button
                      onClick={() =>
                        handleUpdateWhatIf(
                          { clearingIntegro: !whatIf.clearingIntegro },
                          !whatIf.clearingIntegro ? ["R19", "R22", "R52"] : ["R62", "R56"]
                        )
                      }
                      className={`px-2.5 py-1.5 rounded-lg border text-left transition-all cursor-pointer flex items-center justify-between gap-2 ${
                        whatIf.clearingIntegro
                          ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-200"
                          : "bg-rose-500/20 border-rose-500/50 text-rose-200"
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="text-[10.5px] font-bold truncate">
                          ⏱️ Clearing &amp; Ciclo ID
                        </div>
                        <div className="text-[9.5px] opacity-80 truncate">
                          {whatIf.clearingIntegro
                            ? "D+1 OK · DE 62.2/63 Íntegro"
                            : "D+6 / Sem ID → Downgrade!"}
                        </div>
                      </div>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold ${
                          whatIf.clearingIntegro
                            ? "bg-emerald-500 text-slate-950"
                            : "bg-rose-500 text-white"
                        }`}
                      >
                        {whatIf.clearingIntegro ? "D+1" : "D+6"}
                      </span>
                    </button>

                    {/* Chave 4: Subcredenciador (PayFac) */}
                    <button
                      onClick={() =>
                        handleUpdateWhatIf(
                          { subcred: !whatIf.subcred },
                          !whatIf.subcred ? ["R02", "R54"] : ["R04"]
                        )
                      }
                      className={`px-2.5 py-1.5 rounded-lg border text-left transition-all cursor-pointer flex items-center justify-between gap-2 ${
                        whatIf.subcred
                          ? "bg-blue-500/20 border-blue-400/50 text-blue-200"
                          : "bg-[#191c26] border-[#30364b] text-[#9ba4ba]"
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="text-[10.5px] font-bold truncate">
                          🏪 Subcredenciador
                        </div>
                        <div className="text-[9.5px] opacity-80 truncate">
                          {whatIf.subcred
                            ? "PayFac ON · Split CIP/SLC"
                            : "OFF · Adquirente Direto"}
                        </div>
                      </div>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold ${
                          whatIf.subcred
                            ? "bg-blue-400 text-slate-950"
                            : "bg-[#252b3d] text-[#9ba4ba]"
                        }`}
                      >
                        {whatIf.subcred ? "ON" : "OFF"}
                      </span>
                    </button>

                    {/* Chave 5: Simular Contestação de Fraude / Chargeback / VAMP */}
                    <button
                      onClick={() =>
                        handleUpdateWhatIf(
                          { simularFraude: !whatIf.simularFraude },
                          !whatIf.simularFraude ? ["R23", "R31", "R32", "R33"] : ["R01"]
                        )
                      }
                      className={`px-2.5 py-1.5 rounded-lg border text-left transition-all cursor-pointer flex items-center justify-between gap-2 ${
                        whatIf.simularFraude
                          ? whatIf.authForte
                            ? "bg-indigo-500/20 border-indigo-400/50 text-indigo-200"
                            : "bg-rose-500/25 border-rose-400 text-rose-100"
                          : "bg-[#191c26] border-[#30364b] text-[#9ba4ba]"
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="text-[10.5px] font-bold truncate">
                          🚨 Simular Fraude / CBK
                        </div>
                        <div className="text-[9.5px] opacity-80 truncate">
                          {whatIf.simularFraude
                            ? whatIf.authForte
                              ? "Bloqueado (Liability Shift)"
                              : "CBK 10.4/4837 + VAMP/ECP!"
                            : "OFF · Sem Contestação"}
                        </div>
                      </div>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold ${
                          whatIf.simularFraude
                            ? whatIf.authForte
                              ? "bg-indigo-400 text-slate-950"
                              : "bg-rose-500 text-white"
                            : "bg-[#252b3d] text-[#9ba4ba]"
                        }`}
                      >
                        {whatIf.simularFraude ? "ON" : "OFF"}
                      </span>
                    </button>
                  </div>

                  {/* Diagnóstico de Impacto What-If */}
                  <div
                    className={`px-3 py-1.5 rounded-lg border text-[11px] flex items-center justify-between gap-2 flex-wrap ${
                      activeScenario.perdaEvitavelReais > 0.01
                        ? "bg-rose-500/10 border-rose-500/35 text-rose-200"
                        : "bg-emerald-500/10 border-emerald-500/30 text-emerald-200"
                    }`}
                  >
                    <span>{activeScenario.alertaDiagnostico}</span>
                    <div className="flex items-center gap-2 flex-wrap shrink-0">
                      <span className="font-mono text-[10.5px]">
                        IC Alvo: <b>{fmtPct(activeScenario.aliquotaAlvoPct)}</b> → Aplicado:{" "}
                        <b>{fmtPct(activeScenario.aliquotaRealPct)}</b>
                      </span>
                      <Link
                        href={`/mapa/irds?brand=${whatIf.bandeira}&mode=tables`}
                        className="px-2 py-0.5 rounded bg-[#273e39] hover:bg-[#314e48] border border-[#80ddc6]/40 text-[#80ddc6] text-[10px] font-bold"
                      >
                        📊 Ver IRD nas 2.103 Tabelas ↗
                      </Link>
                      <Link
                        href="/simulador"
                        className="px-2 py-0.5 rounded bg-[#202432] hover:border-[#80ddc6] border border-[#30364b] text-[#e9ecf6] text-[10px] font-semibold"
                      >
                        🧮 Simulador IC ↗
                      </Link>
                      <Link
                        href={`/mapa/liquidacao?brand=${whatIf.bandeira === "Visa" ? "visa" : "mastercard"}`}
                        className="px-2 py-0.5 rounded bg-[#202432] hover:border-[#80ddc6] border border-[#30364b] text-[#b6a0f2] text-[10px] font-semibold"
                      >
                        🌍 Liquidação ↗
                      </Link>
                    </div>
                  </div>
                </div>

                {/* 2. Waterfall Financeiro em R$ */}
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-1.5 text-[11px]">
                  <div className="p-2 rounded-lg bg-[#11131a] border border-[#282e42]">
                    <span className="block text-[9px] uppercase tracking-wider text-[#9ba4ba]">
                      Valor Bruto Compra
                    </span>
                    <b className="text-xs text-[#e9ecf6]">{activeScenario.waterfall.bruto}</b>
                  </div>
                  <div className="p-2 rounded-lg bg-[#11131a] border border-[#282e42]">
                    <span className="block text-[9px] uppercase tracking-wider text-[#9ba4ba]">
                      MDR Cobrado (EC)
                    </span>
                    <b className="text-xs text-amber-300">{activeScenario.waterfall.mdr}</b>
                  </div>
                  <div className="p-2 rounded-lg bg-[#11131a] border border-[#282e42]">
                    <span className="block text-[9px] uppercase tracking-wider text-[#9ba4ba]">
                      Intercâmbio (→ Emissor)
                    </span>
                    <b className="text-xs text-purple-300">{activeScenario.waterfall.intercambio}</b>
                  </div>
                  <div className="p-2 rounded-lg bg-[#11131a] border border-[#282e42]">
                    <span className="block text-[9px] uppercase tracking-wider text-[#9ba4ba]">
                      Scheme / Sponsor Fee
                    </span>
                    <b className="text-xs text-cyan-300">{activeScenario.waterfall.schemeFee}</b>
                  </div>
                  <div className="p-2 rounded-lg bg-[#11131a] border border-[#282e42]">
                    <span className="block text-[9px] uppercase tracking-wider text-[#9ba4ba]">
                      Líquido Repassado EC
                    </span>
                    <b className="text-xs text-[#e9ecf6]">{activeScenario.waterfall.liquidoLojista}</b>
                  </div>
                  <div
                    className="p-2 rounded-lg border"
                    style={{
                      background: `${activeScenario.cor}14`,
                      borderColor: `${activeScenario.cor}55`,
                    }}
                  >
                    <span className="block text-[9px] uppercase tracking-wider text-[#c5cbe0]">
                      Net MDR (Margem Adq.)
                    </span>
                    <b className="text-xs" style={{ color: activeScenario.cor }}>
                      {activeScenario.waterfall.margemAdquirente}
                    </b>
                  </div>
                </div>

                {/* 3. Controles do Player Passo a Passo + Cartão do Passo Atual */}
                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-2.5 p-2.5 rounded-xl bg-[#121622] border border-[#30364b]">
                  <div className="flex items-center gap-1.5 flex-wrap shrink-0">
                    <button
                      onClick={() => {
                        setSimAutoPlay(false);
                        handleGoToSimStep(simStepIdx - 1);
                      }}
                      className="px-2 py-1 rounded-lg bg-[#202432] hover:border-[#80ddc6] border border-[#30364b] text-xs text-[#e9ecf6] cursor-pointer flex items-center gap-1"
                      title="Passo anterior"
                    >
                      <SkipBack size={12} />
                      Ant.
                    </button>
                    <button
                      onClick={() => setSimAutoPlay((a) => !a)}
                      className={`px-2.5 py-1 rounded-lg border text-xs font-bold cursor-pointer flex items-center gap-1 ${
                        simAutoPlay
                          ? "bg-amber-500/20 border-amber-400 text-amber-300"
                          : "bg-[#273e39] border-[#80ddc6] text-[#80ddc6]"
                      }`}
                    >
                      {simAutoPlay ? <Pause size={12} /> : <Play size={12} />}
                      {simAutoPlay ? "Pausar" : "Auto-Play"}
                    </button>
                    <button
                      onClick={() => {
                        setSimAutoPlay(false);
                        handleGoToSimStep(simStepIdx + 1);
                      }}
                      className="px-2 py-1 rounded-lg bg-[#202432] hover:border-[#80ddc6] border border-[#30364b] text-xs text-[#e9ecf6] cursor-pointer flex items-center gap-1"
                      title="Próximo passo"
                    >
                      Próx.
                      <SkipForward size={12} />
                    </button>

                    {/* Pílulas numeradas 1..N */}
                    <div className="flex items-center gap-1 ml-1 flex-wrap">
                      {activeScenario.steps.map((s, idx) => {
                        const active = idx === simStepIdx;
                        return (
                          <button
                            key={s.step}
                            onClick={() => {
                              setSimAutoPlay(false);
                              handleGoToSimStep(idx);
                            }}
                            className={`px-2 py-0.5 rounded-md text-[11px] font-mono font-bold border transition-all cursor-pointer ${
                              active
                                ? "bg-[#80ddc6] text-[#0f172a] border-[#80ddc6]"
                                : "bg-[#191c26] text-[#9ba4ba] border-[#30364b] hover:text-white"
                            }`}
                            title={`${s.fase}: ${s.titulo}`}
                          >
                            #{s.step} {s.edgeId}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Resumo e Pacote ISO do Passo Atual */}
                  <div className="flex-1 min-w-0 text-xs border-t xl:border-t-0 xl:border-l border-[#282e42] pt-2 xl:pt-0 xl:pl-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-1.5 py-0.5 rounded bg-[#273e39] text-[#80ddc6] font-mono text-[10px] font-bold">
                        PASSO #{activeSimStep.step}/{activeScenario.steps.length} · {activeSimStep.fase} · {activeSimStep.edgeId}
                      </span>
                      <b className="text-[#e9ecf6]">{activeSimStep.titulo}</b>
                    </div>
                    <p className="text-[11px] text-[#c5cbe0] mt-0.5 mb-1">
                      {activeSimStep.resumo}
                    </p>
                    <div className="flex items-center justify-between gap-2 flex-wrap font-mono text-[10.5px] bg-[#0d111a] px-2.5 py-1 rounded border border-[#252c3f]">
                      <span className="text-[#80ddc6] truncate">{activeSimStep.pacoteIso}</span>
                      <span className="text-[#f6c775] font-sans font-semibold shrink-0">
                        {activeSimStep.impactoFinanceiro}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Legenda de Fluxos */}
          <div className="flex items-center justify-between gap-3 flex-wrap text-[11px] text-[#9ba4ba] px-1">
            <div className="flex items-center gap-4 flex-wrap">
              {(Object.entries(EDGE_KIND_META) as [EdgeKind, (typeof EDGE_KIND_META)[EdgeKind]][]).map(
                ([key, meta]) => (
                  <button
                    key={key}
                    onClick={() => setKindFiltro(kindFiltro === key ? "" : key)}
                    className={`inline-flex items-center gap-1.5 cursor-pointer transition-opacity ${
                      kindFiltro && kindFiltro !== key ? "opacity-40" : "opacity-100"
                    }`}
                  >
                    <span
                      className="inline-block w-2.5 h-2.5 rounded-full"
                      style={{ background: meta.color }}
                    />
                    <span>{meta.label}</span>
                  </button>
                )
              )}
            </div>
            <span className="text-[10px] text-[#73819c]">
              Dica: Clique numa seta ou linha da lista abaixo para ver o payload técnico
            </span>
          </div>

          {/* VISÃO 1: GRAFO INTERATIVO SVG */}
          {viewMode === "graph" ? (
            <div
              className="border border-[#30364b] rounded-2xl relative overflow-hidden shrink-0"
              style={{
                background:
                  "radial-gradient(ellipse at 48% 35%, #23253a 0%, #141822 72%)",
                height: "min(56vh, 590px)",
                minHeight: 410,
              }}
            >
              <svg
                ref={svgRef}
                viewBox="0 0 1260 960"
                className="w-full h-full block touch-none"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                onWheel={handleWheel}
                role="img"
                aria-label="Atlas Interativo do Ecossistema de Pagamentos"
              >
                <defs>
                  <marker
                    id="arrow-dados"
                    viewBox="0 0 10 10"
                    refX="8.5"
                    refY="5"
                    markerWidth="5.5"
                    markerHeight="5.5"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#80ddc6" />
                  </marker>
                  <marker
                    id="arrow-calculo"
                    viewBox="0 0 10 10"
                    refX="8.5"
                    refY="5"
                    markerWidth="5.5"
                    markerHeight="5.5"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#b6a0f2" />
                  </marker>
                  <marker
                    id="arrow-financeiro"
                    viewBox="0 0 10 10"
                    refX="8.5"
                    refY="5"
                    markerWidth="5.5"
                    markerHeight="5.5"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#f59e0b" />
                  </marker>
                  <marker
                    id="arrow-compliance"
                    viewBox="0 0 10 10"
                    refX="8.5"
                    refY="5"
                    markerWidth="5.5"
                    markerHeight="5.5"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#f87171" />
                  </marker>
                </defs>

                <g
                  transform={`translate(${pan.x} ${pan.y}) translate(630 480) scale(${zoom}) translate(-630 -480)`}
                >
                  {/* Swimlanes Horizontais de Arquitetura */}
                  {showLanes &&
                    SWIMLANES.map((lane, idx) => (
                      <g key={idx}>
                        <rect
                          x={20}
                          y={lane.y}
                          width={1220}
                          height={lane.h}
                          rx={14}
                          fill={`${lane.color}07`}
                          stroke={`${lane.color}22`}
                          strokeDasharray="6 6"
                        />
                        <text
                          x={36}
                          y={lane.y + 18}
                          fill={`${lane.color}99`}
                          fontSize={10}
                          fontWeight={700}
                          letterSpacing="1.2px"
                        >
                          {lane.title}
                        </text>
                      </g>
                    ))}

                  {/* Arestas (Ligações) */}
                  {visibleEdges.map((e) => {
                    const geom = computeEdgeGeometry(e);
                    if (!geom) return null;
                    const kindMeta =
                      EDGE_KIND_META[(e.kind as EdgeKind) || "dados"] ||
                      EDGE_KIND_META.dados;
                    const isSelected = selectedEdgeId === e.id;
                    const simStepNumber = simEdgeStepMap.get(e.id);
                    const isCurrentSimEdge = activeSimStep?.edgeId === e.id;
                    const isDirectFocus =
                      focusNodeId &&
                      (e.source === focusNodeId || e.target === focusNodeId);
                    const isButterflyEdge =
                      butterflySet &&
                      butterflySet.all.has(e.source) &&
                      butterflySet.all.has(e.target);

                    let opacity = 0.45;
                    if (activeScenario) {
                      opacity = isCurrentSimEdge
                        ? 1
                        : simStepNumber
                        ? 0.88
                        : 0.08;
                    } else if (isSelected) {
                      opacity = 1;
                    } else if (focusNodeId && butterflySet) {
                      opacity = isDirectFocus ? 0.95 : isButterflyEdge ? 0.65 : 0.1;
                    }

                    const strokeWidth = isCurrentSimEdge
                      ? 4.2
                      : simStepNumber
                      ? 3.0
                      : isSelected
                      ? 3.4
                      : isDirectFocus
                      ? 2.5
                      : 1.7;

                    return (
                      <g
                        key={e.id}
                        data-edge-id={e.id}
                        onClick={() => handleSelectEdge(e.id)}
                        className="cursor-pointer"
                      >
                        <path
                          d={geom.path}
                          fill="none"
                          stroke={isCurrentSimEdge ? "#80ddc6" : kindMeta.color}
                          strokeWidth={strokeWidth}
                          opacity={opacity}
                          strokeDasharray={
                            kindMeta.dashed && !isSelected && !simStepNumber
                              ? "5 4"
                              : undefined
                          }
                          markerEnd={`url(#arrow-${e.kind || "dados"})`}
                        />
                        {/* Hitbox larga transparente para facilitar o clique */}
                        <path
                          d={geom.path}
                          fill="none"
                          stroke="transparent"
                          strokeWidth={16}
                        >
                          <title>{`${e.id} · ${e.label} (${e.direction})`}</title>
                        </path>

                        {/* Badge de código na aresta quando em simulação, selecionada ou conectada ao nó focado */}
                        {(simStepNumber || isSelected || isDirectFocus) && (
                          <g transform={`translate(${geom.labelX}, ${geom.labelY})`}>
                            <rect
                              x={simStepNumber ? -26 : -18}
                              y={-9}
                              width={simStepNumber ? 52 : 36}
                              height={18}
                              rx={5}
                              fill={
                                isCurrentSimEdge
                                  ? "#80ddc6"
                                  : simStepNumber
                                  ? "#132a2e"
                                  : isSelected
                                  ? "#101720"
                                  : "#181d2a"
                              }
                              stroke={isCurrentSimEdge ? "#ffffff" : kindMeta.color}
                              strokeWidth={isCurrentSimEdge || isSelected ? 1.8 : 1}
                            />
                            <text
                              y={3.5}
                              textAnchor="middle"
                              fill={isCurrentSimEdge ? "#0f172a" : kindMeta.color}
                              fontSize={9.5}
                              fontWeight={800}
                            >
                              {simStepNumber ? `#${simStepNumber}·${e.id}` : e.id}
                            </text>
                          </g>
                        )}
                      </g>
                    );
                  })}

                  {/* Nós (Conceitos) */}
                  {visibleNodes.map((n) => {
                    const cat: Categoria | undefined = catMap[n.categoria];
                    const cor = cat?.cor || "#80ddc6";
                    const isFocused = focusNodeId === n.id;
                    const isSimEndpoint =
                      activeSimStep &&
                      (activeSimStep.sourceId === n.id ||
                        activeSimStep.targetId === n.id);
                    const isInSimScenario = simNodeSet.has(n.id);
                    const isEdgeEndpoint =
                      inspectMode === "edge" &&
                      activeEdge &&
                      (activeEdge.source === n.id || activeEdge.target === n.id);
                    const isDimmed = activeScenario
                      ? !isInSimScenario
                      : focusNodeId &&
                        butterflySet &&
                        !butterflySet.all.has(n.id) &&
                        !isEdgeEndpoint;
                    const isUpstream = butterflySet?.upstream.has(n.id);
                    const isDownstream = butterflySet?.downstream.has(n.id);

                    const pillW = Math.max(114, n.label.length * 7.2 + 28);
                    const pillH = 34;

                    return (
                      <g
                        key={n.id}
                        data-node-id={n.id}
                        transform={`translate(${n.x}, ${n.y})`}
                        onClick={() => handleSelectNode(n.id)}
                        className="cursor-pointer"
                        style={{
                          opacity: isDimmed ? 0.16 : 1,
                          transition: "opacity 0.2s ease",
                        }}
                      >
                        {/* Halo externo quando selecionado ou endpoint da ligação/simulação ativa */}
                        {(isSimEndpoint || isFocused || isEdgeEndpoint) && (
                          <rect
                            x={-pillW / 2 - 5}
                            y={-pillH / 2 - 5}
                            width={pillW + 10}
                            height={pillH + 10}
                            rx={13}
                            fill="none"
                            stroke={isSimEndpoint || isFocused ? "#80ddc6" : cor}
                            strokeWidth={isSimEndpoint ? 2.8 : 2}
                            strokeDasharray={
                              isEdgeEndpoint && !isFocused && !isSimEndpoint
                                ? "4 3"
                                : undefined
                            }
                            opacity={0.95}
                          />
                        )}

                        {/* Corpo do Nó */}
                        <rect
                          x={-pillW / 2}
                          y={-pillH / 2}
                          width={pillW}
                          height={pillH}
                          rx={10}
                          fill={isSimEndpoint || isFocused ? "#1e3536" : "#181e2c"}
                          stroke={isSimEndpoint || isFocused ? "#80ddc6" : cor}
                          strokeWidth={isSimEndpoint || isFocused ? 2.5 : 1.6}
                        />

                        {/* Ponto indicador da categoria */}
                        <circle
                          cx={-pillW / 2 + 12}
                          cy={0}
                          r={4}
                          fill={cor}
                        />

                        {/* Label Principal do Conceito */}
                        <text
                          x={5}
                          y={4}
                          textAnchor="middle"
                          fill="#f1f5f9"
                          fontSize={11.5}
                          fontWeight={700}
                        >
                          {n.label}
                        </text>

                        {/* Tag de papel no Efeito Borboleta */}
                        {efeitoBorboleta && focusNodeId && (isFocused || isUpstream || isDownstream) && (
                          <g transform={`translate(0, ${-pillH / 2 - 10})`}>
                            <rect
                              x={-38}
                              y={-8}
                              width={76}
                              height={14}
                              rx={4}
                              fill={
                                isFocused
                                  ? "#065f46"
                                  : isUpstream
                                  ? "#1e3a8a"
                                  : "#581c87"
                              }
                            />
                            <text
                              y={2}
                              textAnchor="middle"
                              fill="#ffffff"
                              fontSize={8.5}
                              fontWeight={700}
                            >
                              {isFocused
                                ? "● NÓ FOCADO"
                                : isUpstream
                                ? "← A MONTANTE"
                                : "→ A JUSANTE"}
                            </text>
                          </g>
                        )}

                        <title>{`${n.label} (${cat?.label || n.categoria}) — Clique para inspecionar`}</title>
                      </g>
                    );
                  })}
                </g>
              </svg>

              {/* Dica no rodapé do canvas */}
              <div className="absolute bottom-2.5 left-3.5 text-[10px] text-[#8a96b0] bg-[#11131a]/80 px-2.5 py-1 rounded-md border border-[#30364b]/60 pointer-events-none">
                Clique em um <b>Conceito</b> (caixa) ou <b>Ligação</b> (seta R01..R62) · Arraste o fundo para mover · Scroll do mouse para zoom
              </div>
            </div>
          ) : viewMode === "matrix" ? (
            /* VISÃO 2: MATRIZ EXECUTIVA QUEM ENVIA × QUEM RECEBE × COMO CALCULA */
            <div className="border border-[#30364b] rounded-2xl bg-[#191c26] overflow-auto max-h-[56vh]">
              <table className="w-full border-collapse text-left text-xs">
                <thead className="sticky top-0 bg-[#202432] border-b border-[#30364b] text-[11px] uppercase text-[#9ba4ba]">
                  <tr>
                    <th className="p-3">Conceito</th>
                    <th className="p-3">Camada / Bandeira</th>
                    <th className="p-3">Quem Envia (Origem)</th>
                    <th className="p-3">Quem Recebe (Destino)</th>
                    <th className="p-3">Como Calcula / Regra</th>
                    <th className="p-3">Campos Técnicos</th>
                    <th className="p-3 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#282d3e]">
                  {visibleNodes.map((n) => {
                    const cat = catMap[n.categoria];
                    const isFocused = activeNode?.id === n.id;
                    return (
                      <tr
                        key={n.id}
                        onClick={() => {
                          setFocusNodeId(n.id);
                          setInspectMode("node");
                        }}
                        className={`cursor-pointer transition-colors ${
                          isFocused ? "bg-[#25313a]" : "hover:bg-[#222736]"
                        }`}
                      >
                        <td className="p-3 font-bold text-[#e9ecf6] whitespace-nowrap">
                          <span
                            className="inline-block w-2 h-2 rounded-full mr-2"
                            style={{ background: cat?.cor || "#80ddc6" }}
                          />
                          {n.label}
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded bg-[#11131a] border border-[#30364b] text-[10px] text-[#80ddc6]">
                            {n.bandeira}
                          </span>
                          <div className="text-[10px] text-[#9ba4ba] mt-1">
                            {SUBDOMINIO_LABELS[n.subdominio] || n.subdominio}
                          </div>
                        </td>
                        <td className="p-3 text-[11px] text-[#c5cbe0] max-w-[200px]">
                          {n.quemEnvia}
                        </td>
                        <td className="p-3 text-[11px] text-[#c5cbe0] max-w-[200px]">
                          {n.quemRecebe}
                        </td>
                        <td className="p-3 text-[11px] text-[#e9ecf6] max-w-[260px]">
                          {n.comoCalcula}
                        </td>
                        <td className="p-3 font-mono text-[10px] text-[#b6a0f2] max-w-[180px]">
                          {(n.camposTecnicos || []).slice(0, 3).join(" · ")}
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={(ev) => {
                              ev.stopPropagation();
                              setFocusNodeId(n.id);
                              setInspectMode("node");
                              setViewMode("graph");
                            }}
                            className="px-2.5 py-1 rounded bg-[#273e39] text-[#80ddc6] text-[11px] font-semibold hover:opacity-90 cursor-pointer"
                          >
                            Ver no Grafo
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            /* VISÃO 3: RAIO-X DIFF DE MENSAGERIA (0100 → 0110 → CLEARING D+1) */
            <div className="border border-[#30364b] rounded-2xl bg-[#191c26] overflow-hidden flex flex-col max-h-[60vh]">
              {/* Barra Superior Interativa do Raio-X Diff */}
              <div className="p-3 bg-[#131722] border-b border-[#30364b] flex flex-col gap-2.5 shrink-0">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded bg-purple-500/20 border border-purple-400/40 text-purple-200 text-[10px] font-extrabold uppercase tracking-wider">
                        🔬 Raio-X Diff de Ciclo de Vida ISO 8583 &amp; Clearing
                      </span>
                      <span className="text-xs font-bold text-[#e9ecf6]">
                        1. Auth Request (0100) → 2. Auth Response (0110) → 3. Apresentação D+1 (
                        {whatIf.bandeira === "Visa"
                          ? "BASE II TC 05"
                          : whatIf.bandeira === "Mastercard"
                          ? "IPM 1240"
                          : "Liquidação Elo"}
                        )
                      </span>
                    </div>
                    <p className="text-[11px] text-[#9ba4ba] mt-0.5 m-0">
                      Compare quais campos nascem na autorização, quais voltam do Emissor/Bandeira na{" "}
                      <code className="text-[#80ddc6]">0110</code> e quais{" "}
                      <b className="text-rose-300">devem ser espelhados em D+1</b> para evitar Downgrade de Intercâmbio:
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      onClick={handleSendRaioXToDocStudio}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-[#80ddc6]/60 text-[11px] font-bold text-[#80ddc6] transition-all cursor-pointer"
                    >
                      <FileText size={12} />
                      Exportar Raio-X Diff para o Doc Studio (/editor)
                    </button>
                    <button
                      onClick={() => setViewMode("graph")}
                      className="px-2.5 py-1.5 rounded-lg bg-[#202432] hover:border-[#80ddc6] border border-[#30364b] text-[11px] font-semibold text-[#e9ecf6] cursor-pointer"
                    >
                      Ver no Grafo SVG
                    </button>
                  </div>
                </div>

                {/* Controles Rápidos para Testar Mutações de Campos direto no Raio-X */}
                <div className="flex items-center justify-between gap-2 flex-wrap pt-1.5 border-t border-[#262c40] text-[11px]">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <select
                      value={whatIf.bandeira}
                      onChange={(e) =>
                        handleUpdateWhatIf({
                          bandeira: e.target.value as WhatIfConfig["bandeira"],
                        })
                      }
                      className="px-2 py-1 rounded bg-[#191c26] border border-[#30364b] text-[11px] text-[#80ddc6] font-bold cursor-pointer"
                    >
                      <option value="Mastercard">Bandeira: Mastercard (IPM 1240 / DE 63)</option>
                      <option value="Visa">Bandeira: Visa (BASE II TC 05 / DE 62.2)</option>
                      <option value="Elo">Bandeira: Elo (Arranjo BR)</option>
                    </select>

                    <select
                      value={whatIf.ambiente}
                      onChange={(e) =>
                        handleUpdateWhatIf({
                          ambiente: e.target.value as WhatIfConfig["ambiente"],
                        })
                      }
                      className="px-2 py-1 rounded bg-[#191c26] border border-[#30364b] text-[11px] text-[#e9ecf6] font-semibold cursor-pointer"
                    >
                      <option value="ecom">Canal: E-commerce (CNP)</option>
                      <option value="presencial">Canal: Presencial Crédito (CP)</option>
                      <option value="debito">Canal: Presencial Débito</option>
                    </select>

                    <button
                      onClick={() => handleUpdateWhatIf({ token: !whatIf.token })}
                      className={`px-2 py-1 rounded border text-[10.5px] font-bold cursor-pointer ${
                        whatIf.token
                          ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-200"
                          : "bg-amber-500/10 border-amber-500/35 text-amber-200"
                      }`}
                    >
                      Token DPAN: {whatIf.token ? "ON (R13)" : "OFF (FPAN)"}
                    </button>

                    <button
                      onClick={() => handleUpdateWhatIf({ authForte: !whatIf.authForte })}
                      className={`px-2 py-1 rounded border text-[10.5px] font-bold cursor-pointer ${
                        whatIf.authForte
                          ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-200"
                          : "bg-rose-500/15 border-rose-500/40 text-rose-200"
                      }`}
                    >
                      {whatIf.ambiente === "ecom" ? "3DS 2.2 (SLI/ECI)" : "Chip EMV (DE 55)"}:{" "}
                      {whatIf.authForte ? "ON" : "OFF"}
                    </button>

                    <button
                      onClick={() =>
                        handleUpdateWhatIf({ clearingIntegro: !whatIf.clearingIntegro })
                      }
                      className={`px-2 py-1 rounded border text-[10.5px] font-bold cursor-pointer ${
                        whatIf.clearingIntegro
                          ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-200"
                          : "bg-rose-500/20 border-rose-500/50 text-rose-200"
                      }`}
                    >
                      Espelhamento D+1:{" "}
                      {whatIf.clearingIntegro ? "🟢 Íntegro" : "🔴 Truncado / D+6 (Downgrade)"}
                    </button>

                    <button
                      onClick={() => handleUpdateWhatIf({ subcred: !whatIf.subcred })}
                      className={`px-2 py-1 rounded border text-[10.5px] font-bold cursor-pointer ${
                        whatIf.subcred
                          ? "bg-purple-500/15 border-purple-500/40 text-purple-200"
                          : "bg-[#202432] border-[#30364b] text-[#9ba4ba]"
                      }`}
                    >
                      PayFac (PF ID): {whatIf.subcred ? "ON" : "OFF"}
                    </button>
                  </div>

                  <span
                    className={`font-mono text-[10.5px] px-2 py-0.5 rounded border ${
                      whatIfComputedScenario.perdaEvitavelReais > 0.01
                        ? "bg-rose-500/15 border-rose-500/40 text-rose-200"
                        : "bg-emerald-500/15 border-emerald-500/40 text-emerald-200"
                    }`}
                  >
                    IC Alvo: <b>{fmtPct(whatIfComputedScenario.aliquotaAlvoPct)}</b> → Aplicado:{" "}
                    <b>{fmtPct(whatIfComputedScenario.aliquotaRealPct)}</b>
                  </span>
                </div>
              </div>

              {/* Tabela Lado a Lado: 0100 vs 0110 vs Clearing D+1 */}
              <div className="overflow-auto flex-1">
                <table className="w-full border-collapse text-left text-xs">
                  <thead className="sticky top-0 bg-[#202432] border-b border-[#30364b] text-[10.5px] uppercase text-[#9ba4ba] z-10">
                    <tr>
                      <th className="p-3 min-w-[175px]">Campo ISO / PDS</th>
                      <th className="p-3 min-w-[210px] border-l border-[#2d3348] text-cyan-300">
                        1. Auth Request (MTI 0100 · D+0)
                        <span className="block text-[9.5px] font-normal text-[#9ba4ba] normal-case">
                          Adquirente → Bandeira → Emissor
                        </span>
                      </th>
                      <th className="p-3 min-w-[210px] border-l border-[#2d3348] text-purple-300">
                        2. Auth Response (MTI 0110 · D+0)
                        <span className="block text-[9.5px] font-normal text-[#9ba4ba] normal-case">
                          Emissor / Switch Bandeira → Adquirente
                        </span>
                      </th>
                      <th className="p-3 min-w-[220px] border-l border-[#2d3348] text-amber-300">
                        3. Clearing / Apresentação (D+1)
                        <span className="block text-[9.5px] font-normal text-[#9ba4ba] normal-case">
                          Lote{" "}
                          {whatIf.bandeira === "Visa"
                            ? "BASE II TC 05"
                            : whatIf.bandeira === "Mastercard"
                            ? "IPM 1240"
                            : "Elo"}{" "}
                          → Qualificação IC
                        </span>
                      </th>
                      <th className="p-3 min-w-[215px] border-l border-[#2d3348]">
                        Diagnóstico &amp; Impacto no Intercâmbio
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#282d3e]">
                    {raioXFields.map((row) => {
                      const isSelected = selectedEdgeId === row.edgeId;
                      return (
                        <tr
                          key={row.id}
                          onClick={() => handleSelectEdge(row.edgeId)}
                          className={`cursor-pointer transition-colors align-top ${
                            row.status === "downgrade"
                              ? "bg-rose-950/20 hover:bg-rose-950/35"
                              : isSelected
                              ? "bg-[#25313a]"
                              : "hover:bg-[#222736]"
                          }`}
                        >
                          {/* Coluna 0: Identificação do Campo */}
                          <td className="p-3">
                            <div className="font-mono font-bold text-[#80ddc6] text-[11.5px]">
                              {row.campo}
                            </div>
                            <div className="text-[11px] text-[#e9ecf6] font-medium mt-0.5 leading-snug">
                              {row.nome}
                            </div>
                            <div className="mt-1.5 flex items-center gap-1.5">
                              <span className="px-1.5 py-0.5 rounded bg-[#11131a] border border-[#30364b] font-mono text-[10px] text-[#b6a0f2]">
                                Ligação {row.edgeId}
                              </span>
                              <button
                                onClick={(ev) => {
                                  ev.stopPropagation();
                                  handleSelectEdge(row.edgeId);
                                  setViewMode("graph");
                                }}
                                className="px-1.5 py-0.5 rounded bg-[#273e39] text-[#80ddc6] text-[10px] font-semibold hover:opacity-90 cursor-pointer"
                              >
                                Ver seta ↗
                              </button>
                            </div>
                          </td>

                          {/* Coluna 1: MTI 0100 */}
                          <td className="p-3 border-l border-[#262b3d]">
                            <code className="block font-mono text-[11px] font-bold text-cyan-200 bg-[#111420] px-2 py-1 rounded border border-cyan-500/25 mb-1">
                              {row.req0100.codigo}
                            </code>
                            <p className="text-[11px] text-[#c5cbe0] leading-relaxed m-0">
                              {row.req0100.detalhe}
                            </p>
                          </td>

                          {/* Coluna 2: MTI 0110 */}
                          <td className="p-3 border-l border-[#262b3d]">
                            <code className="block font-mono text-[11px] font-bold text-purple-200 bg-[#141224] px-2 py-1 rounded border border-purple-500/25 mb-1">
                              {row.resp0110.codigo}
                            </code>
                            <p className="text-[11px] text-[#c5cbe0] leading-relaxed m-0">
                              {row.resp0110.detalhe}
                            </p>
                            <span className="inline-block mt-1 text-[9.5px] uppercase tracking-wider text-purple-300/80 font-semibold">
                              Origem: {row.resp0110.ator}
                            </span>
                          </td>

                          {/* Coluna 3: Clearing D+1 */}
                          <td className="p-3 border-l border-[#262b3d]">
                            <code
                              className={`block font-mono text-[11px] font-bold px-2 py-1 rounded border mb-1 ${
                                row.status === "downgrade"
                                  ? "bg-rose-950/60 text-rose-200 border-rose-500/50"
                                  : row.status === "alerta"
                                  ? "bg-amber-950/40 text-amber-200 border-amber-500/40"
                                  : "bg-emerald-950/40 text-emerald-200 border-emerald-500/35"
                              }`}
                            >
                              {row.clearing1240.codigo}
                            </code>
                            <p className="text-[11px] text-[#c5cbe0] leading-relaxed m-0">
                              {row.clearing1240.detalhe}
                            </p>
                          </td>

                          {/* Coluna 4: Status & Impacto */}
                          <td className="p-3 border-l border-[#262b3d]">
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-[10.5px] font-extrabold mb-1 ${
                                row.status === "downgrade"
                                  ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                                  : row.status === "alerta"
                                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                                  : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                              }`}
                            >
                              {row.statusLabel}
                            </span>
                            <p className="text-[11px] text-[#cbd5e1] leading-relaxed m-0">
                              {row.impactoRegra}
                            </p>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── Lista Sincronizada de Ligações e Regras (Padrão Liquidação Internacional) ── */}
          <section className="border border-[#30364b] rounded-xl bg-[#191c26] overflow-hidden flex-1 flex flex-col min-h-[210px]">
            <div className="px-3.5 py-2.5 border-b border-[#30364b] flex items-center justify-between gap-2 bg-[#1d212d]">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#e9ecf6] m-0 flex items-center gap-1.5">
                <GitCommit size={14} className="text-[#80ddc6]" />
                Ligações, Fluxos e Regras Mapeadas ({listedEdges.length})
              </h3>
              <span className="text-[11px] text-[#9ba4ba]">
                {focusNodeId && nodeMap.get(focusNodeId)
                  ? `Filtrado pelas conexões diretas de: ${nodeMap.get(focusNodeId)!.label}`
                  : "Mostrando todas as ligações visíveis · Clique para auditar"}
              </span>
            </div>

            <div className="overflow-y-auto divide-y divide-[#262b3d] max-h-[250px]">
              {listedEdges.length > 0 ? (
                listedEdges.map((e) => {
                  const fromNode = nodeMap.get(e.source);
                  const toNode = nodeMap.get(e.target);
                  const meta =
                    EDGE_KIND_META[(e.kind as EdgeKind) || "dados"] ||
                    EDGE_KIND_META.dados;
                  const isActive =
                    selectedEdgeId === e.id && inspectMode === "edge";

                  return (
                    <button
                      key={e.id}
                      onClick={() => handleSelectEdge(e.id)}
                      className={`w-full text-left px-3.5 py-2.5 flex items-center justify-between gap-3 transition-colors cursor-pointer ${
                        isActive
                          ? "bg-[#263142] shadow-[inset_3px_0_0_#80ddc6]"
                          : "hover:bg-[#222736]"
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-[#e9ecf6] truncate">
                          <span className="font-mono text-[#80ddc6] mr-1.5">
                            {e.id}
                          </span>
                          {e.label}
                        </div>
                        <div className="text-[11px] text-[#9ba4ba] truncate mt-0.5">
                          <span className="text-[#cbd5e1] font-medium">
                            {fromNode?.label}
                          </span>{" "}
                          →{" "}
                          <span className="text-[#cbd5e1] font-medium">
                            {toNode?.label}
                          </span>{" "}
                          · {e.brand} · {e.timing}
                        </div>
                      </div>

                      <span
                        className="px-2 py-0.5 rounded text-[10px] font-bold shrink-0"
                        style={{
                          background: meta.bg,
                          color: meta.color,
                          border: `1px solid ${meta.border}`,
                        }}
                      >
                        {meta.short}
                      </span>
                    </button>
                  );
                })
              ) : (
                <div className="p-6 text-center text-xs text-[#9ba4ba]">
                  Nenhuma ligação corresponde aos filtros atuais. Clique em{" "}
                  <b>Limpar filtros e foco</b> na barra esquerda.
                </div>
              )}
            </div>
          </section>
        </main>

        {/* ════════════════════════════════════════════════════════════════════
            COLUNA 3 (DIREITA): PAINEL DE RASTREABILIDADE & INSPEÇÃO PROFUNDA
           ════════════════════════════════════════════════════════════════════ */}
        <section
          aria-label="Painel de Rastreabilidade e Detalhes"
          className="bg-[#191c26] border-l border-[#30364b] p-4 overflow-y-auto flex flex-col gap-3.5 min-h-0"
        >
          {/* Seletor de Modo: Inspecionar Conceito (Nó) vs Relação (Ligação) */}
          <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-[#11131a] border border-[#30364b] shrink-0">
            <button
              onClick={() => setInspectMode("node")}
              className={`py-1.5 px-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                inspectMode === "node"
                  ? "bg-[#273e39] text-[#80ddc6] border border-[#80ddc6]/40"
                  : "text-[#9ba4ba] hover:text-white"
              }`}
            >
              <span>🔵 Conceito</span>
              <span className="truncate max-w-[95px] font-normal opacity-80">
                ({activeNode?.label})
              </span>
            </button>
            <button
              onClick={() => setInspectMode("edge")}
              className={`py-1.5 px-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                inspectMode === "edge"
                  ? "bg-[#273e39] text-[#80ddc6] border border-[#80ddc6]/40"
                  : "text-[#9ba4ba] hover:text-white"
              }`}
            >
              <span>🔗 Relação</span>
              <span className="font-mono font-normal opacity-80">
                ({activeEdge?.id})
              </span>
            </button>
          </div>

          {/* ──────────────────────────────────────────────────────────────────
              MODO A: FICHA COMPLETA DO CONCEITO (NÓ SELECIONADO)
             ────────────────────────────────────────────────────────────────── */}
          {inspectMode === "node" && activeNode && (
            <div className="space-y-3.5">
              {/* Cabeçalho do Conceito */}
              <div>
                <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
                  <span
                    className="px-2 py-0.5 rounded text-[10px] font-bold uppercase"
                    style={{
                      background: catMap[activeNode.categoria]?.corFundo,
                      color: catMap[activeNode.categoria]?.cor,
                      border: `1px solid ${catMap[activeNode.categoria]?.corBorda}`,
                    }}
                  >
                    {catMap[activeNode.categoria]?.label}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-[#202432] border border-[#30364b] text-[10px] font-semibold text-[#80ddc6]">
                    Bandeira: {activeNode.bandeira}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-[#202432] border border-[#30364b] text-[10px] text-[#b6a0f2]">
                    {SUBDOMINIO_LABELS[activeNode.subdominio] || activeNode.subdominio}
                  </span>
                </div>

                <h2 className="text-lg font-bold text-[#e9ecf6] leading-snug m-0">
                  {activeNode.label}
                </h2>
              </div>

              {/* Explicação Didática (Analogia + Sabia?) */}
              {didatico && activeNode.analogy && (
                <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-400/30 space-y-1.5">
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-blue-300 flex items-center gap-1.5">
                    <span>💡</span> Tradução Didática (Analogia)
                  </div>
                  <p className="text-xs text-blue-100 italic leading-relaxed m-0">
                    “{activeNode.analogy}”
                  </p>
                  {activeNode.curiosidade && (
                    <p className="text-[11px] text-blue-200/80 pt-1.5 border-t border-blue-400/20 m-0">
                      <b>Nota de Mercado:</b> {activeNode.curiosidade}
                    </p>
                  )}
                </div>
              )}

              {/* Definição Técnica */}
              <div className="p-3 rounded-xl bg-[#202432] border border-[#30364b]">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#9ba4ba] mb-1">
                  Definição Técnica & Arquitetura
                </div>
                <p className="text-xs text-[#e9ecf6] leading-relaxed m-0">
                  {activeNode.descricao}
                </p>
              </div>

              {/* Protocolo de Rastreabilidade (Quem Envia / Quem Recebe / Como Calcula) */}
              <div className="p-3.5 rounded-xl bg-[#141822] border border-[#30364b] space-y-2.5">
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#80ddc6] flex items-center gap-1.5">
                  <CheckCircle2 size={12} />
                  Protocolo de Rastreabilidade (Domínio)
                </div>

                <dl className="grid grid-cols-[95px_1fr] gap-x-2.5 gap-y-2 text-xs m-0">
                  <dt className="text-[#9ba4ba] font-medium">Quem envia</dt>
                  <dd className="text-[#e9ecf6] m-0">{activeNode.quemEnvia}</dd>

                  <dt className="text-[#9ba4ba] font-medium">Quem recebe</dt>
                  <dd className="text-[#e9ecf6] m-0">{activeNode.quemRecebe}</dd>

                  <dt className="text-[#9ba4ba] font-medium">Como calcula</dt>
                  <dd className="text-[#80ddc6] font-medium m-0">
                    {activeNode.comoCalcula}
                  </dd>
                </dl>
              </div>

              {/* Efeito Borboleta / Impacto & Exceções */}
              {activeNode.impacto && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#80ddc6] mb-1">
                    🦋 Efeito Borboleta (Impacto no Ecossistema)
                  </div>
                  <p className="text-xs text-emerald-100 leading-relaxed m-0">
                    {activeNode.impacto}
                  </p>
                </div>
              )}

              {activeNode.excecoes && (
                <div className="p-3 rounded-xl bg-amber-500/10 border-l-2 border-[#f6c775] text-xs text-[#f3dcb3] leading-relaxed">
                  <b className="block text-[10px] uppercase tracking-wider text-[#f6c775] mb-0.5">
                    ⚠️ Exceções, Limites & Armadilhas
                  </b>
                  {activeNode.excecoes}
                </div>
              )}

              {/* Campos Técnicos / Mensageria / Arquivos */}
              {activeNode.camposTecnicos && activeNode.camposTecnicos.length > 0 && (
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#9ba4ba] mb-1.5">
                    Campos ISO 8583, PDS, Tabelas & Arquivos
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {activeNode.camposTecnicos.map((c, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 rounded-md bg-[#101720] border border-[#30364b] font-mono text-[11px] text-[#80ddc6]"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* ⚔️ Confronto Visa × Mastercard × Elo */}
              {(() => {
                const cmp = getBrandEquivalence(activeNode.subdominio);
                return (
                  <div className="p-3 rounded-xl bg-[#141822] border border-[#30364b] space-y-2">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#f6c775]">
                        ⚔️ Confronto Visa × Mastercard × Elo
                      </span>
                      <span className="text-[10px] text-[#9ba4ba] truncate">
                        {cmp.titulo}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-[11px]">
                      <div className="p-2 rounded-lg bg-[#191d2b] border border-blue-500/30">
                        <div className="flex items-center justify-between gap-2">
                          <b className="text-blue-300">🟦 VISA: {cmp.visa.codigo}</b>
                          <Link
                            href={cmp.visa.deepLink}
                            className="text-[10px] text-[#80ddc6] font-bold hover:underline shrink-0"
                          >
                            Ver no Atlas ↗
                          </Link>
                        </div>
                        <div className="font-mono text-[10px] text-blue-200/80 mt-0.5">
                          {cmp.visa.mensageria}
                        </div>
                        <p className="text-[10.5px] text-[#c5cbe0] mt-0.5 mb-0">
                          {cmp.visa.regra}
                        </p>
                      </div>

                      <div className="p-2 rounded-lg bg-[#191d2b] border border-amber-500/30">
                        <div className="flex items-center justify-between gap-2">
                          <b className="text-amber-300">🟧 MASTERCARD: {cmp.mastercard.codigo}</b>
                          <Link
                            href={cmp.mastercard.deepLink}
                            className="text-[10px] text-[#80ddc6] font-bold hover:underline shrink-0"
                          >
                            Ver no Atlas ↗
                          </Link>
                        </div>
                        <div className="font-mono text-[10px] text-amber-200/80 mt-0.5">
                          {cmp.mastercard.mensageria}
                        </div>
                        <p className="text-[10.5px] text-[#c5cbe0] mt-0.5 mb-0">
                          {cmp.mastercard.regra}
                        </p>
                      </div>

                      <div className="p-2 rounded-lg bg-[#191d2b] border border-emerald-500/30">
                        <div className="flex items-center justify-between gap-2">
                          <b className="text-emerald-300">🟩 ELO: {cmp.elo.codigo}</b>
                          <Link
                            href={cmp.elo.deepLink}
                            className="text-[10px] text-[#80ddc6] font-bold hover:underline shrink-0"
                          >
                            Ver no Atlas ↗
                          </Link>
                        </div>
                        <div className="font-mono text-[10px] text-emerald-200/80 mt-0.5">
                          {cmp.elo.mensageria}
                        </div>
                        <p className="text-[10.5px] text-[#c5cbe0] mt-0.5 mb-0">
                          {cmp.elo.regra}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Conexões Diretas A Montante e A Jusante (Navegáveis) */}
              <div className="grid grid-cols-1 gap-2.5 pt-1">
                {activeNodeConnections.incoming.length > 0 && (
                  <div className="p-2.5 rounded-xl bg-[#141822] border border-[#282e42]">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-blue-300 mb-1.5">
                      ⬅️ Alimentado por ({activeNodeConnections.incoming.length} a montante)
                    </div>
                    <div className="flex flex-col gap-1">
                      {activeNodeConnections.incoming.map(({ edge, node }) => (
                        <div
                          key={edge.id}
                          className="flex items-center justify-between gap-2 text-[11px] p-1.5 rounded-lg bg-[#191c26] hover:bg-[#232838]"
                        >
                          <button
                            onClick={() => handleSelectNode(node.id)}
                            className="font-semibold text-[#e9ecf6] hover:text-[#80ddc6] text-left truncate cursor-pointer"
                          >
                            {node.label}{" "}
                            <span className="text-[#9ba4ba] font-normal">
                              ({edge.label})
                            </span>
                          </button>
                          <button
                            onClick={() => handleSelectEdge(edge.id)}
                            className="px-1.5 py-0.5 rounded bg-[#273e39] text-[#80ddc6] font-mono text-[10px] shrink-0 cursor-pointer"
                          >
                            {edge.id}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeNodeConnections.outgoing.length > 0 && (
                  <div className="p-2.5 rounded-xl bg-[#141822] border border-[#282e42]">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-purple-300 mb-1.5">
                      ➡️ Impacta / Envia para ({activeNodeConnections.outgoing.length} a jusante)
                    </div>
                    <div className="flex flex-col gap-1">
                      {activeNodeConnections.outgoing.map(({ edge, node }) => (
                        <div
                          key={edge.id}
                          className="flex items-center justify-between gap-2 text-[11px] p-1.5 rounded-lg bg-[#191c26] hover:bg-[#232838]"
                        >
                          <button
                            onClick={() => handleSelectNode(node.id)}
                            className="font-semibold text-[#e9ecf6] hover:text-[#80ddc6] text-left truncate cursor-pointer"
                          >
                            {node.label}{" "}
                            <span className="text-[#9ba4ba] font-normal">
                              ({edge.label})
                            </span>
                          </button>
                          <button
                            onClick={() => handleSelectEdge(edge.id)}
                            className="px-1.5 py-0.5 rounded bg-[#273e39] text-[#80ddc6] font-mono text-[10px] shrink-0 cursor-pointer"
                          >
                            {edge.id}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Botões de Ação / Módulos Práticos + Ponte Doc Studio */}
              <div className="flex flex-col gap-2 pt-2 border-t border-[#30364b]">
                <Link
                  href={`/mapa/irds?brand=${activeNode.bandeira !== "Todas" ? activeNode.bandeira : "Mastercard"}`}
                  className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/40 text-xs font-bold text-amber-200 transition-all"
                >
                  <span className="flex items-center gap-2">
                    <span>📊</span>
                    Abrir no Atlas de IRDs &amp; 2.103 Tabelas (/mapa/irds)
                  </span>
                  <ArrowRight size={14} />
                </Link>

                <button
                  onClick={() => handleSendNodeToDocStudio(activeNode)}
                  className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-blue-500/15 hover:bg-blue-500/25 border border-blue-400/40 text-xs font-bold text-blue-200 transition-all cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <FileText size={14} className="text-[#80ddc6]" />
                    Gerar Parecer do Conceito no Doc Studio (/editor)
                  </span>
                  <ArrowRight size={14} />
                </button>

                {activeNode.ferramenta && (
                  <Link
                    href={activeNode.ferramenta.href}
                    className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[#273e39] hover:bg-[#2f4b45] border border-[#80ddc6]/40 text-xs font-bold text-[#80ddc6] transition-all"
                  >
                    <span className="flex items-center gap-2">
                      <Wrench size={14} />
                      Abrir Ferramenta: {activeNode.ferramenta.label}
                    </span>
                    <ArrowRight size={14} />
                  </Link>
                )}

                <div className="grid grid-cols-2 gap-2">
                  {activeNode.trilha && (
                    <Link
                      href={`/trilhas/${activeNode.trilha.id}/${activeNode.trilha.licao}`}
                      className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#202432] hover:border-[#80ddc6] border border-[#30364b] text-xs font-semibold text-[#e9ecf6] transition-all"
                    >
                      <BookOpen size={13} className="text-[#b6a0f2]" />
                      <span className="truncate">Aula da Trilha</span>
                    </Link>
                  )}
                  {activeNode.glossario && (
                    <Link
                      href={`/glossario?q=${encodeURIComponent(activeNode.glossario)}`}
                      className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#202432] hover:border-[#80ddc6] border border-[#30364b] text-xs font-semibold text-[#e9ecf6] transition-all"
                    >
                      <ExternalLink size={13} className="text-[#80ddc6]" />
                      <span>Ver no Glossário</span>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ──────────────────────────────────────────────────────────────────
              MODO B: FICHA DE EVIDÊNCIA & REGRA DA LIGAÇÃO (ARESTA R01..R62)
             ────────────────────────────────────────────────────────────────── */}
          {inspectMode === "edge" && activeEdge && (
            <div className="space-y-3.5">
              {(() => {
                const meta =
                  EDGE_KIND_META[(activeEdge.kind as EdgeKind) || "dados"] ||
                  EDGE_KIND_META.dados;
                const fromNode = nodeMap.get(activeEdge.source);
                const toNode = nodeMap.get(activeEdge.target);
                const edgeCmp = getBrandEquivalence(activeEdge.subdominio);

                return (
                  <>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1.5">
                        <span
                          className="px-2 py-0.5 rounded text-[10px] font-bold"
                          style={{
                            background: meta.bg,
                            color: meta.color,
                            border: `1px solid ${meta.border}`,
                          }}
                        >
                          {meta.label}
                        </span>
                        <span className="font-mono text-xs font-bold text-[#80ddc6]">
                          · {activeEdge.id}
                        </span>
                      </div>

                      <h2 className="text-lg font-bold text-[#e9ecf6] leading-snug m-0">
                        {activeEdge.label}
                      </h2>

                      {/* Botões de Origem → Destino */}
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        {fromNode && (
                          <button
                            onClick={() => handleSelectNode(fromNode.id)}
                            className="px-2.5 py-1 rounded-lg bg-[#202432] hover:border-[#80ddc6] border border-[#30364b] text-xs font-semibold text-[#e9ecf6] cursor-pointer"
                          >
                            {fromNode.label}
                          </button>
                        )}
                        <ArrowRight size={14} className="text-[#80ddc6]" />
                        {toNode && (
                          <button
                            onClick={() => handleSelectNode(toNode.id)}
                            className="px-2.5 py-1 rounded-lg bg-[#202432] hover:border-[#80ddc6] border border-[#30364b] text-xs font-semibold text-[#e9ecf6] cursor-pointer"
                          >
                            {toNode.label}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Callout Principal da Regra */}
                    <div className="p-3 rounded-xl bg-[#252836] border border-[#363c52] text-xs text-[#e9ecf6] leading-relaxed">
                      {activeEdge.rule}
                    </div>

                    {/* Metadados Técnicos (Padrão dl.meta do Liquidação Internacional) */}
                    <dl className="grid grid-cols-[100px_1fr] gap-x-3 gap-y-2 text-xs p-3.5 rounded-xl bg-[#141822] border border-[#30364b] m-0">
                      <dt className="text-[#9ba4ba]">Bandeira / Rede</dt>
                      <dd className="text-[#e9ecf6] font-semibold m-0">
                        {activeEdge.brand}
                      </dd>

                      <dt className="text-[#9ba4ba]">Camada / Ciclo</dt>
                      <dd className="text-[#b6a0f2] font-medium m-0">
                        {SUBDOMINIO_LABELS[activeEdge.subdominio] ||
                          activeEdge.subdominio}
                      </dd>

                      <dt className="text-[#9ba4ba]">Papel dominante</dt>
                      <dd className="text-[#e9ecf6] capitalize m-0">
                        {activeEdge.role}
                      </dd>

                      <dt className="text-[#9ba4ba]">Janela / Timing</dt>
                      <dd className="text-[#80ddc6] font-medium m-0">
                        {activeEdge.timing}
                      </dd>

                      <dt className="text-[#9ba4ba]">Enviar → Receber</dt>
                      <dd className="text-[#e9ecf6] m-0">{activeEdge.direction}</dd>
                    </dl>

                    {/* Exceções e Limites */}
                    {activeEdge.exceptions && (
                      <div className="p-3 rounded-xl bg-[#2c2520] border-l-2 border-[#f6c775] text-xs text-[#ebd1a7] leading-relaxed">
                        <b className="block text-[10px] uppercase tracking-wider text-[#f6c775] mb-0.5">
                          ⚠️ Exceção / Risco de Downgrade ou Multa
                        </b>
                        {activeEdge.exceptions}
                      </div>
                    )}

                    {/* Abas de Evidência / Payload / Comparativo (Estilo Liquidação Internacional) */}
                    <div>
                      <div className="flex gap-1.5 flex-wrap mb-2">
                        <button
                          onClick={() => setEdgeDetailTab("payload")}
                          className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border cursor-pointer ${
                            edgeDetailTab === "payload"
                              ? "bg-[#202432] border-[#80ddc6] text-[#80ddc6]"
                              : "bg-[#141822] border-[#30364b] text-[#9ba4ba]"
                          }`}
                        >
                          Payload & Campos
                        </button>
                        <button
                          onClick={() => setEdgeDetailTab("compare")}
                          className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border cursor-pointer ${
                            edgeDetailTab === "compare"
                              ? "bg-[#202432] border-[#f6c775] text-[#f6c775]"
                              : "bg-[#141822] border-[#30364b] text-[#9ba4ba]"
                          }`}
                        >
                          ⚔️ Visa × MC × Elo
                        </button>
                        <button
                          onClick={() => setEdgeDetailTab("nodes")}
                          className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border cursor-pointer ${
                            edgeDetailTab === "nodes"
                              ? "bg-[#202432] border-[#80ddc6] text-[#80ddc6]"
                              : "bg-[#141822] border-[#30364b] text-[#9ba4ba]"
                          }`}
                        >
                          Origem × Destino
                        </button>
                        <button
                          onClick={() => setEdgeDetailTab("tools")}
                          className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border cursor-pointer ${
                            edgeDetailTab === "tools"
                              ? "bg-[#202432] border-[#80ddc6] text-[#80ddc6]"
                              : "bg-[#141822] border-[#30364b] text-[#9ba4ba]"
                          }`}
                        >
                          Atlas & Simuladores
                        </button>
                      </div>

                      {edgeDetailTab === "payload" && (
                        <blockquote className="m-0 p-3 rounded-xl bg-[#101720] border-l-2 border-[#80ddc6] font-mono text-[11px] text-[#d8dfee] whitespace-pre-wrap leading-relaxed">
                          {activeEdge.payload}
                        </blockquote>
                      )}

                      {edgeDetailTab === "compare" && (
                        <div className="space-y-1.5 text-[11px]">
                          <div className="p-2 rounded-lg bg-[#101720] border border-blue-500/30">
                            <div className="flex items-center justify-between gap-2">
                              <b className="text-blue-300">🟦 VISA: {edgeCmp.visa.codigo}</b>
                              <Link
                                href={edgeCmp.visa.deepLink}
                                className="text-[10px] text-[#80ddc6] font-bold hover:underline"
                              >
                                Abrir ↗
                              </Link>
                            </div>
                            <div className="font-mono text-[10px] text-blue-200/80 mt-0.5">
                              {edgeCmp.visa.mensageria}
                            </div>
                            <p className="text-[10.5px] text-[#c5cbe0] mt-0.5 mb-0">
                              {edgeCmp.visa.regra}
                            </p>
                          </div>

                          <div className="p-2 rounded-lg bg-[#101720] border border-amber-500/30">
                            <div className="flex items-center justify-between gap-2">
                              <b className="text-amber-300">🟧 MASTERCARD: {edgeCmp.mastercard.codigo}</b>
                              <Link
                                href={edgeCmp.mastercard.deepLink}
                                className="text-[10px] text-[#80ddc6] font-bold hover:underline"
                              >
                                Abrir ↗
                              </Link>
                            </div>
                            <div className="font-mono text-[10px] text-amber-200/80 mt-0.5">
                              {edgeCmp.mastercard.mensageria}
                            </div>
                            <p className="text-[10.5px] text-[#c5cbe0] mt-0.5 mb-0">
                              {edgeCmp.mastercard.regra}
                            </p>
                          </div>

                          <div className="p-2 rounded-lg bg-[#101720] border border-emerald-500/30">
                            <div className="flex items-center justify-between gap-2">
                              <b className="text-emerald-300">🟩 ELO: {edgeCmp.elo.codigo}</b>
                              <Link
                                href={edgeCmp.elo.deepLink}
                                className="text-[10px] text-[#80ddc6] font-bold hover:underline"
                              >
                                Abrir ↗
                              </Link>
                            </div>
                            <div className="font-mono text-[10px] text-emerald-200/80 mt-0.5">
                              {edgeCmp.elo.mensageria}
                            </div>
                            <p className="text-[10.5px] text-[#c5cbe0] mt-0.5 mb-0">
                              {edgeCmp.elo.regra}
                            </p>
                          </div>
                        </div>
                      )}

                      {edgeDetailTab === "nodes" && (
                        <div className="space-y-2">
                          {fromNode && (
                            <div className="p-2.5 rounded-xl bg-[#101720] border border-[#30364b] text-xs">
                              <div className="text-[10px] font-bold uppercase text-[#80ddc6]">
                                Origem: {fromNode.label}
                              </div>
                              <p className="text-[11px] text-[#c5cbe0] mt-1 mb-1.5">
                                {fromNode.comoCalcula}
                              </p>
                              <button
                                onClick={() => handleSelectNode(fromNode.id)}
                                className="text-[11px] text-[#80ddc6] hover:underline cursor-pointer"
                              >
                                Abrir ficha completa de {fromNode.label} →
                              </button>
                            </div>
                          )}
                          {toNode && (
                            <div className="p-2.5 rounded-xl bg-[#101720] border border-[#30364b] text-xs">
                              <div className="text-[10px] font-bold uppercase text-[#b6a0f2]">
                                Destino: {toNode.label}
                              </div>
                              <p className="text-[11px] text-[#c5cbe0] mt-1 mb-1.5">
                                {toNode.comoCalcula}
                              </p>
                              <button
                                onClick={() => handleSelectNode(toNode.id)}
                                className="text-[11px] text-[#80ddc6] hover:underline cursor-pointer"
                              >
                                Abrir ficha completa de {toNode.label} →
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {edgeDetailTab === "tools" && (
                        <div className="flex flex-col gap-2">
                          <Link
                            href="/mapa/irds"
                            className="flex items-center justify-between p-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/40 text-xs text-amber-200 font-bold"
                          >
                            <span>📊 Ir para Atlas de IRDs &amp; 2.103 Tabelas (/mapa/irds)</span>
                            <ArrowRight size={13} />
                          </Link>
                          {fromNode?.ferramenta && (
                            <Link
                              href={fromNode.ferramenta.href}
                              className="flex items-center justify-between p-2.5 rounded-xl bg-[#202432] hover:border-[#80ddc6] border border-[#30364b] text-xs text-[#80ddc6] font-semibold"
                            >
                              <span>
                                🔧 {fromNode.ferramenta.label} ({fromNode.label})
                              </span>
                              <ArrowRight size={13} />
                            </Link>
                          )}
                          {toNode?.ferramenta &&
                            toNode.ferramenta.href !== fromNode?.ferramenta?.href && (
                              <Link
                                href={toNode.ferramenta.href}
                                className="flex items-center justify-between p-2.5 rounded-xl bg-[#202432] hover:border-[#80ddc6] border border-[#30364b] text-xs text-[#80ddc6] font-semibold"
                              >
                                <span>
                                  🔧 {toNode.ferramenta.label} ({toNode.label})
                                </span>
                                <ArrowRight size={13} />
                              </Link>
                            )}
                          <Link
                            href="/mapa/liquidacao"
                            className="flex items-center justify-between p-2.5 rounded-xl bg-[#141822] hover:border-[#80ddc6] border border-[#30364b] text-xs text-[#e9ecf6]"
                          >
                            <span>🌍 Ir para Atlas de Liquidação Internacional (31 regras)</span>
                            <ArrowRight size={13} />
                          </Link>
                          <Link
                            href="/mapa/mcbs"
                            className="flex items-center justify-between p-2.5 rounded-xl bg-[#141822] hover:border-[#80ddc6] border border-[#30364b] text-xs text-[#e9ecf6]"
                          >
                            <span>🧾 Ir para Atlas MCBS Faturamento (15 regras)</span>
                            <ArrowRight size={13} />
                          </Link>
                        </div>
                      )}
                    </div>

                    {/* Ponte Direta para o Doc Studio (/editor) */}
                    <div className="pt-2 border-t border-[#30364b]">
                      <button
                        onClick={() => handleSendEdgeToDocStudio(activeEdge)}
                        className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-blue-500/15 hover:bg-blue-500/25 border border-blue-400/40 text-xs font-bold text-blue-200 transition-all cursor-pointer"
                      >
                        <span className="flex items-center gap-2">
                          <FileText size={14} className="text-[#80ddc6]" />
                          Gerar Parecer da Regra {activeEdge.id} no Doc Studio (/editor)
                        </span>
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  </>
                );
              })()}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
