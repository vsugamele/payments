'use client';

import React, { useMemo, useState } from 'react';
import { sendToDocStudio } from '@/lib/docStudioBridge';

export interface DowngradeErrorScenario {
  id: string;
  brand: 'visa' | 'elo' | 'mastercard' | 'amex';
  title: string;
  modality: string;
  outgoingTrigger: string;
  qualifiedRatePct: number;
  qualifiedCapBrl: number | null;
  downgradedRatePct: number;
  downgradedTierName: string;
  qualifiedTierName: string;
  billingFeePerTxBrl: number;
  billingFeeCode: string;
  billingFeeName: string;
  chargebackExposurePct: number;
  reportDetected: string;
  normativeSource: string;
  technicalFix: string;
}

export const DOWNGRADE_SCENARIOS: DowngradeErrorScenario[] = [
  {
    id: 'visa-late-presentment-eirf',
    brand: 'visa',
    title: '1. Late Presentment (> D+3 dias da Autorização 0100/0110) — Queda p/ EIRF / Standard',
    modality: 'Crédito à Vista (Consumer / Platinum / Infinite)',
    outgoingTrigger: 'Data de Processamento Central (TCR 0 Pos 75–78) excede o prazo máximo de captura pós-autorização (0100/0110).',
    qualifiedRatePct: 1.52,
    qualifiedCapBrl: null,
    downgradedRatePct: 2.38,
    qualifiedTierName: 'Visa CPS Retail / E-Commerce Qualificado (1,52%)',
    downgradedTierName: 'Visa EIRF / Standard Non-Qualified (2,38%)',
    billingFeePerTxBrl: 0.18,
    billingFeeCode: 'VSS Fee Schedule · Data Integrity / EIRF Assessment',
    billingFeeName: 'Taxa de Processamento Não-Qualificado / Reclassificação VSS-130',
    chargebackExposurePct: 0.08,
    reportDetected: 'VSS-130 (Interchange Qualification Summary) + EP747A/B Raw Data',
    normativeSource: 'Visa Base II Clearing Interchange Formats + Tabela de Intercâmbio Visa Brasil (tarifas_curadas.json)',
    technicalFix: 'Enviar o lote TC 05 em D+0 (ou no máximo D+1) após a autorização 0110 e preservar o DE 62.2 (TID) no TCR 5 Pos 5–19.',
  },
  {
    id: 'visa-tcr2-br-parcelado',
    brand: 'visa',
    title: '2. Erro no TCR 2 Format BR (Pos 40–41 ≠ Parcelas + 10) em Compra Parcelada Lojista',
    modality: 'Crédito Parcelado Lojista 2–6x / 7–12x',
    outgoingTrigger: 'Enviar "06" em vez de "16" no TCR 2 BR Pos 40–41 ou omitir o registro nacional TCR 2 BR.',
    qualifiedRatePct: 1.95,
    qualifiedCapBrl: null,
    downgradedRatePct: 2.68,
    qualifiedTierName: 'Visa Parcelado Lojista CPS Qualificado (1,95%)',
    downgradedTierName: 'Rejeição VX-100A + Reapresentação em Atraso Standard (2,68%)',
    billingFeePerTxBrl: 0.25,
    billingFeeCode: 'VSS-140 / VCX Reject Re-presentment Fee (454 Billing Lines)',
    billingFeeName: 'Tarifa de Rejeição Sintática Base II + Reenvio fora de janela',
    chargebackExposurePct: 0.12,
    reportDetected: 'VCX VX-100A (Rejected Transactions) + VSS-130',
    normativeSource: 'Visa Base II TC 01–49 Manual (TCR 2 Brazil National Settlement Data, pág. 142)',
    technicalFix: 'Aplicar a fórmula obrigatória (Nº de Parcelas + 10) na posição 40–41 do TCR 2 BR ("12" para 2x até "22" para 12x).',
  },
  {
    id: 'mastercard-missing-trace-pds0158',
    brand: 'mastercard',
    title: '3. Ausência ou Zeramento do Trace ID (DE 63 ➔ PDS 0158 / DE 48) no MTI 1240',
    modality: 'Crédito à Vista / Parcelado Mastercard GCMS',
    outgoingTrigger: 'Não ecoar o Financial Network Data (DE 63 + DE 15 da 0110) para o PDS 0158 do MTI 1240 First Presentment.',
    qualifiedRatePct: 1.58,
    qualifiedCapBrl: null,
    downgradedRatePct: 2.49,
    qualifiedTierName: 'Mastercard IRD Qualificado Meritus / Data Rate I-II (1,58%)',
    downgradedTierName: 'Mastercard IRD Standard / Key-Entered Non-Qualified (2,49%)',
    billingFeePerTxBrl: 0.22,
    billingFeeCode: 'MCBS GLB 12332.5 (TN3A) · GDIP Edit Non-Compliance',
    billingFeeName: 'Global Data Integrity Program (GDIP) Lifecycle Trace Mismatch Fee',
    chargebackExposurePct: 0.05,
    reportDetected: 'IP714010-BB (Updated Merchant Values / IRD Downgrade) + TN3A Invoice',
    normativeSource: 'Mastercard Dual Message Clearing System Guide R26.2 + Manual de Preço Brasil m_BrazilFees_pt-br_10_6.pdf (06/10/2026)',
    technicalFix: 'Persistir os 9–16 bytes do DE 63 e os 4 dígitos do DE 15 da 0110 no banco do autorizador e injetá-los no PDS 0158 do MTI 1240.',
  },
  {
    id: 'elo-payfac-reg01-reg02',
    brand: 'elo',
    title: '4. Subcredenciador Elo sem Pareamento Reg 01 (CNPJ PayFac) + Reg 02 (Campos 140/150 EC Final)',
    modality: 'Subcredenciamento / Marketplace / PayFac (Elo R26.2 & R27.1)',
    outgoingTrigger: 'Enviar Registro 01 com identificação de Subcredenciador mas omitir o CPF/CNPJ Alfanumérico (Campo 150) do lojista final no Registro 02.',
    qualifiedRatePct: 1.48,
    qualifiedCapBrl: null,
    downgradedRatePct: 2.32,
    qualifiedTierName: 'Elo Intercâmbio Qualificado por MCC Validado (1,48%)',
    downgradedTierName: 'Rejeição TE01 Reg 09 + Reapresentação Fora de Prazo (2,32%)',
    billingFeePerTxBrl: 0.20,
    billingFeeCode: 'Elo Manual de Agendas Cap. 7 · Tarifa de Reprocessamento / Crítica',
    billingFeeName: 'Tarifa Operacional de Registro Rejeitado no TE01 Registro 09',
    chargebackExposurePct: 0.10,
    reportDetected: 'Arquivo de Retorno de Crítica TE01 (Registro 09) + Agenda Cap. 5/7',
    normativeSource: 'Manual de Mensageria de Liquidação Elo Versão 26.2 / 27.1 (Seção 2.7.2.2 e 2.7.2.3 — CNPJ Alfanumérico)',
    technicalFix: 'Garantir o envio conjunto de Reg 01 (Campo 45 CNPJ Subcredenciador) + Reg 02 (Campos 140/150 com dados cadastrais do EC final).',
  },
  {
    id: 'visa-3ds-cavv-missing',
    brand: 'visa',
    title: '5. E-Commerce Autenticado 3DS 2.2 sem Envio de ECI 05/02 + CAVV no Outgoing (TCR 5)',
    modality: 'E-Commerce / Cartão Não Presente (CNP)',
    outgoingTrigger: 'Autenticar 3DS 2.2 na autorização (Field 126.9 / CAVV v7 ou v9 AES), mas não transportar o CAVV e o ECI para o registro de clearing.',
    qualifiedRatePct: 1.62,
    qualifiedCapBrl: null,
    downgradedRatePct: 2.45,
    qualifiedTierName: 'Visa CPS E-Commerce 3DS Authenticated (1,62%)',
    downgradedTierName: 'Visa CNP Non-Authenticated Standard (2,45%)',
    billingFeePerTxBrl: 0.15,
    billingFeeCode: 'Visa Integrity / 3DS Consistency Check',
    billingFeeName: 'Diferencial de Processamento CNP Não-Autenticado',
    chargebackExposurePct: 0.65,
    reportDetected: 'VSS-130 + Relatório de Disputas Visa Resolve Online (Reason Code 10.4)',
    normativeSource: 'Visa Core Rules + AI 15765 / Item 4.2 (CAVV v9 AES) + Base II TCR 5 Spec',
    technicalFix: 'Mapear o ECI (05 ou 06/02) e os 20 bytes do CAVV para o registro complementar do Base II / MTI 1240 PDS 0052 / Elo Reg 02.',
  },
  {
    id: 'corporate-cedp-level3',
    brand: 'visa',
    title: '6. Cartão Corporativo / B2B sem Dados Comerciais Nível 2/3 (Visa CEDP / MC Commercial)',
    modality: 'Cartão Corporativo / Purchasing / Agro / Empresarial',
    outgoingTrigger: 'Capturar venda em cartão comercial sem enviar imposto destacado, código fiscal e itens de linha no TCR 3 / MTI 1644 Addendum.',
    qualifiedRatePct: 1.45,
    qualifiedCapBrl: null,
    downgradedRatePct: 2.55,
    qualifiedTierName: 'Commercial Enhanced Data Program (CEDP) Validated (1,45%)',
    downgradedTierName: 'Commercial Standard Non-Enhanced + CEDP Fee (2,55%)',
    billingFeePerTxBrl: 0.30,
    billingFeeCode: 'Visa CEDP Surcharge (0,05% + Billing Line B2B)',
    billingFeeName: 'Commercial Enhanced Data Program Participation Fee',
    chargebackExposurePct: 0.04,
    reportDetected: 'VSS-130 + Relatório de Qualificação B2B CEDP',
    normativeSource: 'Visa Commercial Enhanced Data Program (CEDP) Guide 2026 + Base II TC 01–49',
    technicalFix: 'Habilitar coleta de CNPJ comprador, valor de imposto e descritivo de item no gateway B2B e gerar o addendum comercial no D+0.',
  },
  {
    id: 'bcb-debito-prepago-cap',
    brand: 'mastercard',
    title: '7. Desvio de Classificação Débito vs Pré-Pago / Crédito (Teto Regulatório BCB 0,50% e 0,70%)',
    modality: 'Débito (Teto 0,50% / Máx 0,70%) & Pré-Pago (Teto 0,70%) — Res. BCB 150/304',
    outgoingTrigger: 'Classificar BIN de Débito ou Pré-Pago doméstico com código de produto/funding incorreto na tabela local MPE / IP0040T1.',
    qualifiedRatePct: 0.50,
    qualifiedCapBrl: null,
    downgradedRatePct: 0.70,
    qualifiedTierName: 'Teto Regulatório BCB Débito (0,50% média / 0,70% cap)',
    downgradedTierName: 'Aplicação do Teto Máximo / Pré-Pago Indevido (0,70%)',
    billingFeePerTxBrl: 0.05,
    billingFeeCode: 'Resolução BCB nº 304 / Tarifas Curadas BR',
    billingFeeName: 'Diferença de Provisionamento Contábil D+1 (Under-provisioning)',
    chargebackExposurePct: 0.01,
    reportDetected: 'MCBS IP728010 / VSS-120 vs Conciliação Interna MPE (IP0040T1)',
    normativeSource: 'Resolução BCB nº 150 e nº 304 + tarifas_curadas.json (Vigência 01/04/2023–2026)',
    technicalFix: 'Sincronizar diariamente a tabela de BINs/Parâmetros (Mastercard MPE T068 / IP0040T1, Visa ARDEF e Elo Tabela BIN Emissor R27.1).',
  },
  {
    id: 'amex-airline-taa-missing',
    brand: 'amex',
    title: '8. American Express Cia Aérea (MCC 3000–3299) sem Registro Addendum TAA (Bilhete 13 Dígitos)',
    modality: 'Companhias Aéreas IATA & Agências de Viagem (Amex GNS / CAS)',
    outgoingTrigger: 'Enviar o registro principal TDR de companhia aérea sem anexar o registro TAA com Ticket Number de 13 dígitos e Origin-Destination.',
    qualifiedRatePct: 1.75,
    qualifiedCapBrl: null,
    downgradedRatePct: 2.65,
    qualifiedTierName: 'Amex Airline CAPN / GNS Qualified Rate (1,75%)',
    downgradedTierName: 'Amex Non-Compliant Submission Tier + Reject (2,65%)',
    billingFeePerTxBrl: 0.35,
    billingFeeCode: 'Amex GNS Data Quality Non-Compliance Fee',
    billingFeeName: 'Penalidade por Submissão Aérea sem Dados de Itinerário (TAA)',
    chargebackExposurePct: 0.25,
    reportDetected: 'Amex EPA (Electronic Payment Advice) + Reject & Error Report',
    normativeSource: 'American Express Global Codes & Information Guide / GNS Clearing Spec (583 refs OPS-WORKSPACE-6)',
    technicalFix: 'Tornar o bloco TAA obrigatório no motor de saída sempre que MCC estiver entre 3000–3299 ou 4511.',
  },
];

export interface AmexOutgoingTableSpec {
  code: string;
  name: string;
  category: string;
  status: 'Obrigatório [M]' | 'Condicional [C]';
  equivalentVisa: string;
  equivalentElo: string;
  equivalentMc: string;
  whatItIs: string;
  whenMandatoryRule: string;
  keyFields: { posOrTag: string; name: string; format: string; status: 'M' | 'C'; rule: string }[];
}

export const AMEX_OUTGOING_TABLES: AmexOutgoingTableSpec[] = [
  {
    code: 'TFH / 1644-697',
    name: 'Transaction File Header (TFH — Amex CAS / GNS)',
    category: 'Envelope de Arquivo',
    status: 'Obrigatório [M]',
    equivalentVisa: 'TC 90 File Header',
    equivalentElo: 'Header A0 / B0',
    equivalentMc: 'MTI 1644 (FC 697)',
    whatItIs: 'Registro de abertura física do arquivo de remessa Amex (CAS / GDF ou GNS ISO 8583). Identifica o credenciador remetente, data de geração, sequência do lote e versão da especificação.',
    whenMandatoryRule: 'Obrigatório (1 por arquivo físico enviado à rede American Express).',
    keyFields: [
      { posOrTag: 'Record ID', name: 'Record Type Identifier ("TFH")', format: 'AN 3', status: 'M', rule: 'Fixo "TFH" no formato CAS/GDF ou MTI 1644 FC 697 no GNS.' },
      { posOrTag: 'Submitter ID', name: 'Submitting Acquirer / Processor ID', format: 'N 10', status: 'M', rule: 'Código oficial do credenciador/processadora habilitado na Amex.' },
      { posOrTag: 'File Date & Seq', name: 'File Creation Date (YYYYMMDD) + Sequence', format: 'N 14', status: 'M', rule: 'Impede duplicidade de arquivo na recepção Amex.' },
    ],
  },
  {
    code: 'TAB',
    name: 'Transaction Advice Batch Header (TAB — Lote por SE Number)',
    category: 'Envelope de Lote',
    status: 'Obrigatório [M]',
    equivalentVisa: 'Lote lógico antes do TC 91',
    equivalentElo: 'Agrupador PV / Lojista',
    equivalentMc: 'DE 42 Merchant Batch',
    whatItIs: 'Abre um lote de transações pertencentes a um Estabelecimento Comercial (identificado pelo SE Number — Service Establishment de 10 dígitos na Amex) e define a moeda de liquidação.',
    whenMandatoryRule: 'Obrigatório antes de qualquer grupo de registros TDR.',
    keyFields: [
      { posOrTag: 'SE Number', name: 'Service Establishment Number', format: 'N 10', status: 'M', rule: 'Identificador cadastral do estabelecimento ou submerchant na Amex.' },
      { posOrTag: 'Batch Currency', name: 'Submission Currency Code', format: 'N 3', status: 'M', rule: '"986" para liquidação doméstica em Reais (BRL).' },
      { posOrTag: 'MCC', name: 'Merchant Category Code', format: 'N 4', status: 'M', rule: 'Se 3000–3299 (Aéreo), exige TAA em cada TDR do lote.' },
    ],
  },
  {
    code: 'TDR / MTI 1240',
    name: 'Transaction Detail Record (TDR — Registro Base da Venda)',
    category: 'Base Financeira Obrigatória',
    status: 'Obrigatório [M]',
    equivalentVisa: 'TC 05 / TC 06 (TCR 0 + TCR 1 + TCR 5)',
    equivalentElo: 'TE05 / TE06 Registro 00 + 01',
    equivalentMc: 'MTI 1240 (FC 200)',
    whatItIs: 'Coração financeiro da captura Amex. Carrega o PAN de 15 dígitos (iniciado por 34 ou 37), valor bruto, data da transação, código de aprovação de 6 posições, Amex Transaction ID (15 dígitos da autorização 1110), Point of Service Data Code (12 posições) e número de parcelas.',
    whenMandatoryRule: 'Obrigatório em 100% das compras e créditos capturados.',
    keyFields: [
      { posOrTag: 'Cardmember Acct (DE 2)', name: 'Amex PAN (15 dígitos — 34xxxx / 37xxxx)', format: 'N 15', status: 'M', rule: 'Validado por dígito Luhn; no Brasil também suporta Network Token Amex.' },
      { posOrTag: 'Transaction ID (DE 31/62)', name: '15-Digit Amex Transaction Identifier (TID)', format: 'N 15', status: 'M', rule: 'Deve ser copiado sem alteração da resposta de autorização 1110.' },
      { posOrTag: 'POS Data Code (DE 22)', name: 'Point of Service Data Code (12 chars)', format: 'AN 12', status: 'M', rule: 'Detalha capacidade do terminal, presença do cartão/portador, EMV e 3DS SafeKey.' },
      { posOrTag: 'Installment Plan', name: 'Plan Type & Number of Installments', format: 'N 2', status: 'C', rule: 'Obrigatório em vendas parceladas no Brasil (02 a 12+ parcelas).' },
    ],
  },
  {
    code: 'TAA',
    name: 'Transaction Airline Addendum (TAA — Passagem Aérea IATA)',
    category: 'Setorial & Companhias Aéreas',
    status: 'Condicional [C]',
    equivalentVisa: 'TC 05 TCR 3 (Format AI)',
    equivalentElo: 'Registro 08 (Cias Aéreas) + 992/995',
    equivalentMc: 'MTI 1644 / PDS 0501–0525',
    whatItIs: 'Registro complementar de itinerário aéreo. Informa o número do bilhete IATA de 13 dígitos, nome do passageiro, companhia transportadora (2 letras IATA), trechos de voo (Origin-Destination) e taxa de embarque.',
    whenMandatoryRule: 'Escalado de [C] para Obrigatório [M] sempre que o MCC for de Companhia Aérea (3000–3299 ou 4511).',
    keyFields: [
      { posOrTag: 'Ticket Number', name: 'IATA Airline Ticket Number', format: 'N 13', status: 'M', rule: '3 dígitos da cia aérea + 10 dígitos do bilhete.' },
      { posOrTag: 'Passenger Name', name: 'Passenger Name (SOBRENOME/NOME)', format: 'AN 20', status: 'M', rule: 'Usado pelo emissor Amex na fatura corporativa e prevenção a fraude.' },
      { posOrTag: 'Routing Legs 1–4', name: 'Airport Origin / Destination Codes + Carrier + Class', format: 'AN 24', status: 'M', rule: 'Códigos IATA de 3 letras (ex.: GRU-MIA, CGH-SDU).' },
    ],
  },
  {
    code: 'TLA / TRA',
    name: 'Lodging & Car Rental Addendum (Hotelaria & Locadoras)',
    category: 'Setorial & Companhias Aéreas',
    status: 'Condicional [C]',
    equivalentVisa: 'TCR 3 (Formats HL & CA)',
    equivalentElo: 'Campos Setoriais Reg 01/02',
    equivalentMc: 'PDS 0535+ (Lodging) / PDS 0560+ (Auto)',
    whatItIs: 'Detalha diárias de hospedagem (Check-in, Check-out, Folio Number, Daily Room Rate) ou locação de veículos (Rental Agreement Number, Return City/Date, Extra Charges).',
    whenMandatoryRule: 'Obrigatório para MCCs de Hotelaria (3501–3999, 7011) e Locadoras de Veículos (3351–3441, 7512).',
    keyFields: [
      { posOrTag: 'Check-In / Pick-Up', name: 'Start Date of Service (YYYYMMDD)', format: 'N 8', status: 'M', rule: 'Data de entrada no hotel ou retirada do veículo.' },
      { posOrTag: 'Folio / Agreement', name: 'Hotel Folio or Rental Agreement Number', format: 'AN 12', status: 'M', rule: 'Chave primária para defesa de disputas de No-Show ou cobrança extra.' },
    ],
  },
  {
    code: 'TPF / Submerchant',
    name: 'Payment Facilitator / OptBlue / Aggregator Submerchant Record',
    category: 'Modalidades & Subcredenciadores',
    status: 'Condicional [C]',
    equivalentVisa: 'TCR E (Payment Facilitator)',
    equivalentElo: 'Reg 01 (CNPJ PayFac) + Reg 02 (Campos 140/150)',
    equivalentMc: 'PDS 0176 + PDS 0208 + PDS 0220',
    whatItIs: 'Identifica o subcredenciador (Aggregator / PayFac) e os dados completos do estabelecimento comercial final (Submerchant ID, CNPJ/CPF, Nome Fantasia, Cidade, UF e CEP).',
    whenMandatoryRule: 'Obrigatório sempre que a transação for originada por um Subcredenciador ou Marketplace.',
    keyFields: [
      { posOrTag: 'Aggregator ID', name: 'Payment Facilitator / Aggregator Identifier', format: 'AN 15', status: 'M', rule: 'Código do subcredenciador registrado na Amex.' },
      { posOrTag: 'Submerchant Tax ID', name: 'CNPJ / CPF do Estabelecimento Final', format: 'AN 14', status: 'M', rule: 'Compatível com o novo padrão de CNPJ Alfanumérico Brasil.' },
      { posOrTag: 'Submerchant Name & City', name: 'DBA Name + City + Postal Code', format: 'AN 38', status: 'M', rule: 'Exibido na fatura do portador Amex no formato PF*LOJA.' },
    ],
  },
  {
    code: 'TBT & TFT',
    name: 'Transaction Batch Trailer (TBT) & File Trailer (TFT)',
    category: 'Envelope de Arquivo',
    status: 'Obrigatório [M]',
    equivalentVisa: 'TC 91 (Batch) & TC 92 (File)',
    equivalentElo: 'Trailer BZ / Z9',
    equivalentMc: 'MTI 1644 (FC 695)',
    whatItIs: 'Registros fechadores de lote e de arquivo. Contêm a contagem exata de registros TDR e a soma financeira líquida/bruta para batimento imediato na recepção Amex.',
    whenMandatoryRule: 'Obrigatório ao final de cada lote (TBT) e no encerramento do arquivo (TFT).',
    keyFields: [
      { posOrTag: 'Record / Tx Count', name: 'Total Detail Records Count', format: 'N 8', status: 'M', rule: 'Deve bater exatamente com a quantidade de registros TDR enviados.' },
      { posOrTag: 'Total Amount', name: 'Net / Gross Submission Amount', format: 'N 15', status: 'M', rule: 'Qualquer divergência de centavos rejeita o lote inteiro no EPA Reject Report.' },
    ],
  },
];

export function OutgoingDowngradeAndAmex() {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(DOWNGRADE_SCENARIOS[0].id);
  const [monthlyTpvBrl, setMonthlyTpvBrl] = useState<number>(25000000); // R$ 25 milhões/mês
  const [avgTicketBrl, setAvgTicketBrl] = useState<number>(250); // R$ 250
  const [affectedVolumePct, setAffectedVolumePct] = useState<number>(12); // 12% do volume com falha
  const [selectedAmexCode, setSelectedAmexCode] = useState<string>(AMEX_OUTGOING_TABLES[2].code);

  const scenario = useMemo(
    () => DOWNGRADE_SCENARIOS.find((s) => s.id === selectedScenarioId) ?? DOWNGRADE_SCENARIOS[0],
    [selectedScenarioId]
  );

  const selectedAmexTable = useMemo(
    () => AMEX_OUTGOING_TABLES.find((t) => t.code === selectedAmexCode) ?? AMEX_OUTGOING_TABLES[0],
    [selectedAmexCode]
  );

  const calc = useMemo(() => {
    const affectedTpvBrl = monthlyTpvBrl * (affectedVolumePct / 100);
    const affectedTxCount = Math.max(1, Math.round(affectedTpvBrl / Math.max(1, avgTicketBrl)));

    const qualifiedInterchangeBrl = affectedTpvBrl * (scenario.qualifiedRatePct / 100);
    const downgradedInterchangeBrl = affectedTpvBrl * (scenario.downgradedRatePct / 100);
    const monthlyDowngradeLossBrl = Math.max(0, downgradedInterchangeBrl - qualifiedInterchangeBrl);

    const monthlySchemeFeesBrl = affectedTxCount * scenario.billingFeePerTxBrl;
    const monthlyChargebackRiskBrl = affectedTpvBrl * (scenario.chargebackExposurePct / 100);

    const totalMonthlyImpactBrl =
      monthlyDowngradeLossBrl + monthlySchemeFeesBrl + monthlyChargebackRiskBrl;
    const totalAnnualImpactBrl = totalMonthlyImpactBrl * 12;

    return {
      affectedTpvBrl,
      affectedTxCount,
      qualifiedInterchangeBrl,
      downgradedInterchangeBrl,
      monthlyDowngradeLossBrl,
      monthlySchemeFeesBrl,
      monthlyChargebackRiskBrl,
      totalMonthlyImpactBrl,
      totalAnnualImpactBrl,
      spreadBps: Math.round((scenario.downgradedRatePct - scenario.qualifiedRatePct) * 100),
    };
  }, [monthlyTpvBrl, avgTicketBrl, affectedVolumePct, scenario]);

  const handleExportToDocStudio = () => {
    sendToDocStudio({
      mode: 'append_html',
      title: `Business Case & Impacto de Downgrade Outgoing — ${scenario.title}`,
      sourceModule: 'Calculadora de Downgrade & Multas Outgoing',
      html: `
        <h2>Memória de Cálculo Financeiro — Downgrade & Data Integrity no Outgoing</h2>
        <p><strong>Cenário Operacional:</strong> ${scenario.title}</p>
        <p><strong>Gatilho Técnico no Outgoing:</strong> ${scenario.outgoingTrigger}</p>
        <p><strong>Fonte Normativa:</strong> ${scenario.normativeSource}</p>
        <table>
          <thead>
            <tr><th>Indicador</th><th>Valor Calculado</th></tr>
          </thead>
          <tbody>
            <tr><td>TPV Mensal da Carteira</td><td>R$ ${monthlyTpvBrl.toLocaleString('pt-BR')}</td></tr>
            <tr><td>Volume Afetado (${affectedVolumePct}%)</td><td>R$ ${calc.affectedTpvBrl.toLocaleString('pt-BR')} (${calc.affectedTxCount.toLocaleString('pt-BR')} transações)</td></tr>
            <tr><td>Tarifa Qualificada vs Downgrade</td><td>${scenario.qualifiedRatePct.toFixed(2)}% ➔ ${scenario.downgradedRatePct.toFixed(2)}% (+${calc.spreadBps} bps)</td></tr>
            <tr><td>Perda Mensal por Downgrade de Intercâmbio</td><td><strong>R$ ${calc.monthlyDowngradeLossBrl.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></td></tr>
            <tr><td>Multas / Billing Lines (${scenario.billingFeeCode})</td><td><strong>R$ ${calc.monthlySchemeFeesBrl.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></td></tr>
            <tr><td>Exposição a Chargeback / Liability Shift</td><td><strong>R$ ${calc.monthlyChargebackRiskBrl.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></td></tr>
            <tr><td><strong>IMPACTO TOTAL MENSAL / ANUAL</strong></td><td><strong>R$ ${calc.totalMonthlyImpactBrl.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} / mês (R$ ${calc.totalAnnualImpactBrl.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} / ano)</strong></td></tr>
          </tbody>
        </table>
        <p><strong>Correção Definitiva Recomendada:</strong> ${scenario.technicalFix}</p>
      `,
      metadata: {
        brand: scenario.brand === 'amex' ? 'visa' : scenario.brand,
        brandName: scenario.brand.toUpperCase(),
        referenceId: scenario.id.toUpperCase(),
        category: 'Cálculo Financeiro de Downgrade & Data Integrity',
        executiveSummary: `Impacto anual estimado de R$ ${calc.totalAnnualImpactBrl.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      },
    });
  };

  return (
    <div className="space-y-8">
      {/* ===================================================================== */}
      {/* BLOCO 1: CALCULADORA FINANCEIRA DE DOWNGRADE, INTERCÂMBIO & MULTAS    */}
      {/* ===================================================================== */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 space-y-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-xs font-black text-emerald-300">
                💰 Conectado ao Índice de Tarifas Curadas & 454 Billing Lines
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 border border-blue-500/40 text-xs font-bold text-blue-300">
                Res. BCB 150/304 + Visa Fee Schedule + Mastercard Brazil Fees 06/10/2026
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-white pt-1">
              Calculadora Financeira de Downgrade de Intercâmbio, Data Integrity & Multas no Outgoing (`R$`)
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-4xl leading-relaxed">
              Simule em <strong>Reais (`R$`)</strong> quanto um erro técnico no arquivo de Outgoing custa por mês e por ano somando as <strong>3 camadas de perda</strong>: (1) <strong>Downgrade de Intercâmbio</strong> (`CPS/IRD Qualificado ➔ EIRF/Standard`), (2) <strong>Scheme Fees / Data Integrity Billing Lines</strong> e (3) <strong>Perda de Liability Shift em Disputas</strong>.
            </p>
          </div>

          <button
            onClick={handleExportToDocStudio}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black shadow-md transition-all shrink-0"
          >
            📄 Exportar Memória de Cálculo p/ Doc Studio & Waiver
          </button>
        </div>

        {/* Seletores de Cenário + Parâmetros de Volume */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Coluna Esquerda (5 cols): 8 Cenários Reais */}
          <div className="lg:col-span-5 space-y-2.5">
            <div className="text-xs font-black uppercase tracking-wider text-slate-300">
              1. Selecione a Falha de Outgoing Auditada (8 Casos Reais):
            </div>
            <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
              {DOWNGRADE_SCENARIOS.map((sc) => {
                const active = sc.id === scenario.id;
                const spread = (sc.downgradedRatePct - sc.qualifiedRatePct).toFixed(2);
                return (
                  <button
                    key={sc.id}
                    onClick={() => setSelectedScenarioId(sc.id)}
                    className={`w-full rounded-xl p-3.5 text-left border transition-all ${
                      active
                        ? 'bg-blue-950/60 border-blue-400 shadow-md'
                        : 'bg-slate-950/70 border-slate-800 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs font-black uppercase text-blue-400">
                        {sc.brand.toUpperCase()} · {sc.modality.split('(')[0]}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-rose-500/20 border border-rose-500/30 font-mono text-[11px] font-bold text-rose-300">
                        +{spread}% Downgrade
                      </span>
                    </div>
                    <div className="text-xs sm:text-sm font-black text-white mt-1 leading-snug">
                      {sc.title}
                    </div>
                    <div className="text-xs text-slate-400 mt-1 line-clamp-2">{sc.outgoingTrigger}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Coluna Direita (7 cols): Parâmetros + Resultado Financeiro Detalhado */}
          <div className="lg:col-span-7 space-y-5">
            {/* Sliders / Inputs de Volume */}
            <div className="rounded-xl bg-slate-950/90 border border-slate-800 p-4 space-y-4">
              <div className="text-xs font-black uppercase tracking-wider text-blue-400">
                2. Parâmetros de Volume da Carteira (Ajuste p/ Calcular em Tempo Real)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 block">
                    TPV Mensal Total (R$)
                  </label>
                  <input
                    type="number"
                    value={monthlyTpvBrl}
                    step={1000000}
                    min={100000}
                    onChange={(e) => setMonthlyTpvBrl(Math.max(0, Number(e.target.value)))}
                    className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 font-mono text-sm font-bold text-white"
                  />
                  <div className="flex gap-1.5 pt-1">
                    {[5000000, 25000000, 100000000].map((v) => (
                      <button
                        key={v}
                        onClick={() => setMonthlyTpvBrl(v)}
                        className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-[11px] text-slate-300 hover:border-blue-400"
                      >
                        R$ {v / 1000000}M
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 block">
                    Ticket Médio (R$)
                  </label>
                  <input
                    type="number"
                    value={avgTicketBrl}
                    step={25}
                    min={10}
                    onChange={(e) => setAvgTicketBrl(Math.max(1, Number(e.target.value)))}
                    className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 font-mono text-sm font-bold text-white"
                  />
                  <div className="flex gap-1.5 pt-1">
                    {[80, 250, 850].map((v) => (
                      <button
                        key={v}
                        onClick={() => setAvgTicketBrl(v)}
                        className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-[11px] text-slate-300 hover:border-blue-400"
                      >
                        R$ {v}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 block">
                    % do Volume Afetado ({affectedVolumePct}%)
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={100}
                    value={affectedVolumePct}
                    onChange={(e) => setAffectedVolumePct(Number(e.target.value))}
                    className="w-full accent-blue-500 mt-2"
                  />
                  <div className="flex justify-between text-[11px] font-mono text-slate-400">
                    <span>1%</span>
                    <span className="text-cyan-300 font-bold">
                      R$ {(calc.affectedTpvBrl / 1000000).toFixed(2)}M ({calc.affectedTxCount.toLocaleString('pt-BR')} tx)
                    </span>
                    <span>100%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Cards de Resultado em Reais (R$) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="rounded-xl bg-slate-950/90 border border-slate-800 p-4">
                <div className="text-xs font-semibold text-slate-400">1. Perda Mensal Downgrade</div>
                <div className="text-xl font-black text-amber-300 mt-1">
                  R$ {calc.monthlyDowngradeLossBrl.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  {scenario.qualifiedRatePct.toFixed(2)}% ➔ {scenario.downgradedRatePct.toFixed(2)}% (+{calc.spreadBps} bps)
                </div>
              </div>

              <div className="rounded-xl bg-slate-950/90 border border-slate-800 p-4">
                <div className="text-xs font-semibold text-slate-400">2. Multas / Billing Lines</div>
                <div className="text-xl font-black text-rose-300 mt-1">
                  R$ {calc.monthlySchemeFeesBrl.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  R$ {scenario.billingFeePerTxBrl.toFixed(2)} × {calc.affectedTxCount.toLocaleString('pt-BR')} tx
                </div>
              </div>

              <div className="rounded-xl bg-slate-950/90 border border-slate-800 p-4">
                <div className="text-xs font-semibold text-slate-400">3. Risco Disputa / Liability</div>
                <div className="text-xl font-black text-purple-300 mt-1">
                  R$ {calc.monthlyChargebackRiskBrl.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Exposição de {scenario.chargebackExposurePct.toFixed(2)}% s/ lote
                </div>
              </div>

              <div className="rounded-xl bg-rose-950/35 border border-rose-500/50 p-4">
                <div className="text-xs font-black uppercase tracking-wider text-rose-300">
                  Impacto Total (Mês / Ano)
                </div>
                <div className="text-xl font-black text-white mt-1">
                  R$ {calc.totalMonthlyImpactBrl.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}/mês
                </div>
                <div className="text-xs font-bold text-rose-300 mt-1">
                  R$ {calc.totalAnnualImpactBrl.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} / ano
                </div>
              </div>
            </div>

            {/* Ficha Técnica Normativa do Cenário */}
            <div className="rounded-xl bg-slate-950/90 border border-slate-800 p-4 space-y-3 text-xs">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
                <span className="font-black text-white text-sm">{scenario.title}</span>
                <span className="px-2.5 py-0.5 rounded bg-blue-500/20 border border-blue-500/30 font-mono text-blue-300 font-bold">
                  {scenario.billingFeeCode}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="rounded-lg bg-emerald-950/20 border border-emerald-500/30 p-3">
                  <div className="font-bold text-emerald-300">Tier Qualificado Esperado:</div>
                  <div className="text-white font-semibold mt-0.5">{scenario.qualifiedTierName}</div>
                  <div className="font-mono text-emerald-400 mt-1">
                    Custo Mensal: R$ {calc.qualifiedInterchangeBrl.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>
                <div className="rounded-lg bg-rose-950/20 border border-rose-500/30 p-3">
                  <div className="font-bold text-rose-300">Tier Aplicado no Downgrade:</div>
                  <div className="text-white font-semibold mt-0.5">{scenario.downgradedTierName}</div>
                  <div className="font-mono text-rose-400 mt-1">
                    Custo Mensal: R$ {calc.downgradedInterchangeBrl.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 pt-1">
                <div>
                  <strong className="text-blue-400">Relatório Diário que Aponta:</strong>{' '}
                  <span className="text-slate-200">{scenario.reportDetected}</span>
                </div>
                <div>
                  <strong className="text-amber-300">Fonte Normativa & Vigência:</strong>{' '}
                  <span className="text-slate-200">{scenario.normativeSource}</span>
                </div>
                <div>
                  <strong className="text-emerald-400">Plano de Correção Técnica no Outgoing:</strong>{' '}
                  <span className="text-slate-200">{scenario.technicalFix}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* BLOCO 2: 4ª BANDEIRA NO OUTGOING — AMERICAN EXPRESS (AMEX GNS / CAS)  */}
      {/* ===================================================================== */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 space-y-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-xs font-black text-cyan-300">
                💳 4ª Bandeira Integrada · American Express (GNS / Global Codes / CAS)
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300">
                583 Referências Normativas Amex no OPS-WORKSPACE-6
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-white pt-1">
              Arquitetura de Outgoing American Express (`TFH` · `TAB` · `TDR / MTI 1240` · `TAA` · `TPF` · `TBT/TFT`)
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-4xl leading-relaxed">
              Mapa completo dos registros de submissão e liquidação da <strong>American Express</strong> e equivalência direta com <strong>Visa Base II</strong>, <strong>Elo 27.1</strong> e <strong>Mastercard IPM</strong>, cobrindo cartões de 15 dígitos (`34/37`), `SE Number`, `15-digit Amex TID`, `POS Data Code (12 posições)`, `SafeKey 3DS` e adendos setoriais (`TAA` Aéreo e `TLA/TRA` Hotelaria/Locadoras).
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Lista das 7 Tabelas Amex */}
          <div className="lg:col-span-5 space-y-2">
            <div className="text-xs font-black uppercase tracking-wider text-slate-300 mb-2">
              Registros de Outgoing American Express (Clique p/ Inspecionar):
            </div>
            {AMEX_OUTGOING_TABLES.map((tb) => {
              const active = tb.code === selectedAmexTable.code;
              return (
                <button
                  key={tb.code}
                  onClick={() => setSelectedAmexCode(tb.code)}
                  className={`w-full rounded-xl p-3.5 text-left border transition-all ${
                    active
                      ? 'bg-cyan-950/50 border-cyan-400 shadow-md'
                      : 'bg-slate-950/70 border-slate-800 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-black text-cyan-300">{tb.code}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-bold border ${
                        tb.status.includes('[M]')
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      }`}
                    >
                      {tb.status}
                    </span>
                  </div>
                  <div className="text-xs sm:text-sm font-black text-white mt-1">{tb.name}</div>
                  <div className="text-[11px] text-slate-400 mt-1">{tb.category}</div>
                </button>
              );
            })}
          </div>

          {/* Detalhe da Tabela Amex Selecionada + De-Para 4 Bandeiras */}
          <div className="lg:col-span-7 rounded-xl bg-slate-950/90 border border-slate-800 p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <span className="font-mono text-xs font-black text-cyan-400">{selectedAmexTable.code}</span>
                <h4 className="text-base sm:text-lg font-black text-white">{selectedAmexTable.name}</h4>
              </div>
              <span className="px-3 py-1 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-xs font-black text-cyan-300">
                {selectedAmexTable.status}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">{selectedAmexTable.whatItIs}</p>

            <div className="rounded-lg bg-slate-900 border border-slate-800 p-3 text-xs">
              <strong className="text-amber-300">Regra de Obrigatoriedade (Mandate / Condicional):</strong>{' '}
              <span className="text-slate-200">{selectedAmexTable.whenMandatoryRule}</span>
            </div>

            {/* Equivalência Cruzada 4 Bandeiras */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="rounded-lg bg-slate-900/80 border border-slate-800 p-2.5 text-xs">
                <div className="text-slate-400 font-semibold">Equivalente Visa Base II</div>
                <div className="font-mono font-bold text-blue-300 mt-0.5">{selectedAmexTable.equivalentVisa}</div>
              </div>
              <div className="rounded-lg bg-slate-900/80 border border-slate-800 p-2.5 text-xs">
                <div className="text-slate-400 font-semibold">Equivalente Elo 27.1</div>
                <div className="font-mono font-bold text-amber-300 mt-0.5">{selectedAmexTable.equivalentElo}</div>
              </div>
              <div className="rounded-lg bg-slate-900/80 border border-slate-800 p-2.5 text-xs">
                <div className="text-slate-400 font-semibold">Equivalente Mastercard IPM</div>
                <div className="font-mono font-bold text-rose-300 mt-0.5">{selectedAmexTable.equivalentMc}</div>
              </div>
            </div>

            {/* Campos Chave */}
            <div className="space-y-2">
              <div className="text-xs font-black uppercase tracking-wider text-slate-300">
                Campos Críticos do Registro ({selectedAmexTable.code}):
              </div>
              <div className="space-y-2">
                {selectedAmexTable.keyFields.map((kf, i) => (
                  <div key={i} className="rounded-lg bg-slate-900/90 border border-slate-800 p-3 space-y-1 text-xs">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-700 font-mono font-bold text-cyan-300">
                          {kf.posOrTag}
                        </span>
                        <span className="font-bold text-white">{kf.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-slate-400">{kf.format}</span>
                        <span
                          className={`px-2 py-0.5 rounded font-bold ${
                            kf.status === 'M'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-amber-500/20 text-amber-300'
                          }`}
                        >
                          [{kf.status}]
                        </span>
                      </div>
                    </div>
                    <p className="text-slate-300">{kf.rule}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
