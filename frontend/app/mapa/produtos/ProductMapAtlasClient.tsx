'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { sendToDocStudio } from '@/lib/docStudioBridge';

export type ProductCategoryFilter =
  | 'ALL'
  | 'DEBITO_PREPAGO'
  | 'CREDITO_PF'
  | 'COMERCIAL_B2B'
  | 'ESPECIAL_PUSH';

export type ProductAtlasTab =
  | 'plastics_matrix'
  | 'wire_and_tables'
  | 'brazil_modalities'
  | 'sector_mcc';

export interface UnifiedProductSpec {
  id: string;
  tierOrder: number;
  category: Exclude<ProductCategoryFilter, 'ALL'>;
  categoryLabel: string;
  productFamilyName: string;
  fundingSource: 'Débito' | 'Pré-Pago' | 'Crédito PF' | 'Comercial / Corporativo' | 'Push / Especial';
  bacenRegulationCap: string;
  isRegulatedCap: boolean;
  typicalQualifiedInterchange: string;
  typicalDowngradeRate: string;
  visa: {
    pid: string;
    commercialName: string;
    tableSource: string;
    authAndOutgoingField: string;
    fpiExample: string;
  };
  mastercard: {
    brandProductCode: string;
    commercialName: string;
    tableSource: string;
    authAndOutgoingField: string;
    irdExample: string;
  };
  elo: {
    productCode: string;
    commercialName: string;
    tableSource: string;
    authAndOutgoingField: string;
    operationType: string;
  };
  amex: {
    productCode: string;
    commercialName: string;
    casRecordRef: string;
  };
  riskAndComplianceNotes: string;
  outgoingTableLink: { brand: 'visa' | 'mastercard' | 'elo'; tableId: string; label: string }[];
}

export const UNIFIED_PRODUCTS: UnifiedProductSpec[] = [
  {
    id: 'prod-01-debit',
    tierOrder: 1,
    category: 'DEBITO_PREPAGO',
    categoryLabel: 'Débito Regulamentado (Bacen)',
    productFamilyName: 'Débito à Vista (Consumer Debit)',
    fundingSource: 'Débito',
    bacenRegulationCap: 'Média Ponderada ≤ 0,50% · Teto Máximo por Transação ≤ 0,80% (Resolução BCB 304 / Circ. 3.887)',
    isRegulatedCap: true,
    typicalQualifiedInterchange: '0,50% (Teto máximo 0,80% em MCCs específicos)',
    typicalDowngradeRate: 'Limitado ao teto legal de 0,80% no débito doméstico PF',
    visa: {
      pid: 'PID = C (Electron / Visa Debit)',
      commercialName: 'Visa Débito / Electron (AID A0000000032010)',
      tableSource: 'Visa ARDEF + Tabelas Base II Doméstico Brasil',
      authAndOutgoingField: 'Online: DE 62.23 = C · Outgoing: TC 05 TCR 0 + TCR 2 BR + TCR 5',
      fpiExample: 'Consumer Debit Electronic (BR)',
    },
    mastercard: {
      brandProductCode: 'MDS / MAE (Debit Mastercard / Maestro)',
      commercialName: 'Debit Mastercard (MDS) & Maestro (MAE)',
      tableSource: 'MPE T068 + GCMS IP0040T1 (Account Range) & IP0091T1',
      authAndOutgoingField: 'Online: DE 48 · Outgoing: MTI 1240 PDS 0002 = MDS + PDS 0158 (IRD)',
      irdExample: 'IRD Doméstico Débito Brasil (Teto 0,50% / 0,80%)',
    },
    elo: {
      productCode: 'Cód. 002 (Elo Básico Débito)',
      commercialName: 'Elo Débito Nacional / Internacional',
      tableSource: 'Tabela de BINs Elo (Serviço de Atualização)',
      authAndOutgoingField: 'Online: DE 03 = 002000 · Outgoing: Reg 00 + Reg 01 + Reg 02 (Tipo Op = 991)',
      operationType: '991 (Compra Débito à Vista)',
    },
    amex: {
      productCode: 'N/A (Foco Crédito/Charge no BR)',
      commercialName: 'Arranjo Amex Brasil opera prioritariamente em Crédito',
      casRecordRef: 'TDR (Detail Record)',
    },
    riskAndComplianceNotes:
      'Exige validação criptográfica de Chip/NFC (DE 55) e/ou Senha (PIN Block DE 52) ou 3DS 2.2 Data/Challenge no Débito Sem Senha e-commerce.',
    outgoingTableLink: [
      { brand: 'visa', tableId: 'visa-tcr0', label: 'Visa TCR 0' },
      { brand: 'elo', tableId: 'elo-reg02', label: 'Elo Registro 02 (991)' },
      { brand: 'mastercard', tableId: 'mc-1240-base', label: 'Mastercard MTI 1240' },
    ],
  },
  {
    id: 'prod-02-prepaid',
    tierOrder: 2,
    category: 'DEBITO_PREPAGO',
    categoryLabel: 'Pré-Pago Regulamentado (Bacen)',
    productFamilyName: 'Cartão Pré-Pago Geral (Consumer Prepaid)',
    fundingSource: 'Pré-Pago',
    bacenRegulationCap: 'Teto Único ≤ 0,70% por transação doméstica (Resolução BCB 304)',
    isRegulatedCap: true,
    typicalQualifiedInterchange: '0,70% (Teto Regulatório BCB 304)',
    typicalDowngradeRate: 'Limitado ao teto regulatório de 0,70% para Pré-Pago PF doméstico',
    visa: {
      pid: 'PID = J3 (Visa Prepaid Consumer)',
      commercialName: 'Visa Pré-Pago Recarregável / Conta de Pagamento',
      tableSource: 'Visa ARDEF (Prepaid Indicator = P)',
      authAndOutgoingField: 'Online: DE 62.23 = J3 · Outgoing: TC 05 TCR 0 + TCR 5',
      fpiExample: 'Prepaid Consumer Domestic BR (0,70%)',
    },
    mastercard: {
      brandProductCode: 'MCP / MRG / MGP',
      commercialName: 'Mastercard Prepaid Consumer',
      tableSource: 'MPE T068 + GCMS IP0091T1 (Product Type = Prepaid)',
      authAndOutgoingField: 'Outgoing: MTI 1240 PDS 0002 = MCP + PDS 0158',
      irdExample: 'IRD Prepaid Domestic BR (0,70%)',
    },
    elo: {
      productCode: 'Cód. 012 / 072 (Elo Pré-Pago)',
      commercialName: 'Elo Pré-Pago Uso Geral',
      tableSource: 'Tabela de BINs Elo (Indicador Funding Pré-Pago)',
      authAndOutgoingField: 'Outgoing: Reg 00 + Reg 01 + Reg 02',
      operationType: '990 / 991 conforme captura do BIN Pré-Pago',
    },
    amex: {
      productCode: 'AXP-PRE',
      commercialName: 'Amex Prepaid / GlobalTravel',
      casRecordRef: 'TDR (600B)',
    },
    riskAndComplianceNotes:
      'Fintechs e Instituições de Pagamento (IPs) emissoras de cartões atrelados a contas de pagamento pré-pagas caem obrigatoriamente no teto de 0,70% desde abril/2023 (Resolução BCB 304).',
    outgoingTableLink: [
      { brand: 'visa', tableId: 'visa-tcr0', label: 'Visa TCR 0' },
      { brand: 'mastercard', tableId: 'mc-1240-base', label: 'Mastercard MTI 1240' },
    ],
  },
  {
    id: 'prod-03-classic-standard',
    tierOrder: 3,
    category: 'CREDITO_PF',
    categoryLabel: 'Crédito PF · Tier 1 (Entrada)',
    productFamilyName: 'Classic / Standard / Elo Básico Crédito',
    fundingSource: 'Crédito PF',
    bacenRegulationCap: 'Livre Mercado (Sem teto Bacen no Crédito)',
    isRegulatedCap: false,
    typicalQualifiedInterchange: '1,00% a 1,55% (À vista vs Parcelado)',
    typicalDowngradeRate: '1,85% a 2,15% (EIRF / Standard Downgrade)',
    visa: {
      pid: 'PID = F (Visa Classic)',
      commercialName: 'Visa Classic Crédito',
      tableSource: 'Visa ARDEF + Tables 3-12 a 3-38',
      authAndOutgoingField: 'DE 62.23 = F · Outgoing: TC 05 TCR 0 + TCR 2 BR + TCR 5',
      fpiExample: 'Consumer Credit Electronic / Installment',
    },
    mastercard: {
      brandProductCode: 'MCC (Mastercard Standard)',
      commercialName: 'Mastercard Standard Crédito',
      tableSource: 'GCMS IP0091T1 (Product MCC) + Table 76',
      authAndOutgoingField: 'MTI 1240 PDS 0002 = MCC + PDS 0158 (IRD)',
      irdExample: 'IRD Core / Electronic Consumer',
    },
    elo: {
      productCode: 'Cód. 001 (Elo Básico Crédito)',
      commercialName: 'Elo Básico / Nacional Crédito',
      tableSource: 'Tabela de BINs Elo',
      authAndOutgoingField: 'Reg 00 + Reg 01 + Reg 02 (990 À vista / 992 Parc. Loja)',
      operationType: '990 (Crédito à Vista) / 992 (Parcelado Loja)',
    },
    amex: {
      productCode: 'AX-GRN / BLU',
      commercialName: 'American Express Green / Blue',
      casRecordRef: 'TDR Pos 1-600',
    },
    riskAndComplianceNotes:
      'Maior volume em quantidade de cartões no Brasil; sensível a downgrade caso a Adquirente perca o TID (DE 62.2) ou envie atrasado (Late Presentment).',
    outgoingTableLink: [
      { brand: 'visa', tableId: 'visa-tcr0', label: 'Visa TCR 0' },
      { brand: 'visa', tableId: 'visa-tcr5', label: 'Visa TCR 5 (TID)' },
      { brand: 'mastercard', tableId: 'mc-1240-base', label: 'Mastercard MTI 1240' },
    ],
  },
  {
    id: 'prod-04-gold-mais',
    tierOrder: 4,
    category: 'CREDITO_PF',
    categoryLabel: 'Crédito PF · Tier 2 (Intermediário)',
    productFamilyName: 'Gold / Elo Mais',
    fundingSource: 'Crédito PF',
    bacenRegulationCap: 'Livre Mercado (Sem teto Bacen no Crédito)',
    isRegulatedCap: false,
    typicalQualifiedInterchange: '1,30% a 1,80% (Conforme MCC e Parcelas)',
    typicalDowngradeRate: '1,95% a 2,25% (EIRF / Standard)',
    visa: {
      pid: 'PID = G (Visa Gold)',
      commercialName: 'Visa Gold Crédito',
      tableSource: 'Visa ARDEF (PID G)',
      authAndOutgoingField: 'DE 62.23 = G · Outgoing: TC 05 TCR 0 + TCR 5',
      fpiExample: 'Gold Consumer Credit Electronic',
    },
    mastercard: {
      brandProductCode: 'MCG (Mastercard Gold)',
      commercialName: 'Mastercard Gold',
      tableSource: 'GCMS IP0091T1 (Product MCG)',
      authAndOutgoingField: 'MTI 1240 PDS 0002 = MCG + PDS 0158',
      irdExample: 'IRD Gold Consumer',
    },
    elo: {
      productCode: 'Cód. 070 (Elo Mais)',
      commercialName: 'Elo Mais Crédito',
      tableSource: 'Tabela de BINs Elo (Produto 070)',
      authAndOutgoingField: 'Reg 00 + Reg 01 + Reg 02',
      operationType: '990 / 992',
    },
    amex: {
      productCode: 'AX-GLD',
      commercialName: 'American Express Gold Card',
      casRecordRef: 'TDR Pos 1-600',
    },
    riskAndComplianceNotes:
      'Alíquota intermediária entre o Classic/Standard e o Platinum; muito utilizado em carteiras bancárias de renda média.',
    outgoingTableLink: [
      { brand: 'visa', tableId: 'visa-tcr0', label: 'Visa TCR 0' },
      { brand: 'elo', tableId: 'elo-reg00', label: 'Elo Registro 00' },
    ],
  },
  {
    id: 'prod-05-platinum-grafite',
    tierOrder: 5,
    category: 'CREDITO_PF',
    categoryLabel: 'Crédito PF · Tier 3 (Affluent)',
    productFamilyName: 'Platinum / Elo Grafite',
    fundingSource: 'Crédito PF',
    bacenRegulationCap: 'Livre Mercado (Sem teto Bacen no Crédito)',
    isRegulatedCap: false,
    typicalQualifiedInterchange: '1,55% a 2,05% (Conforme MCC e Parcelas)',
    typicalDowngradeRate: '2,15% a 2,40% (Downgrade)',
    visa: {
      pid: 'PID = P (Visa Platinum)',
      commercialName: 'Visa Platinum',
      tableSource: 'Visa ARDEF (PID P)',
      authAndOutgoingField: 'DE 62.23 = P · Outgoing: TC 05 TCR 0 + TCR 5',
      fpiExample: 'Platinum Consumer Credit',
    },
    mastercard: {
      brandProductCode: 'MPL (Mastercard Platinum)',
      commercialName: 'Mastercard Platinum',
      tableSource: 'GCMS IP0091T1 (Product MPL)',
      authAndOutgoingField: 'MTI 1240 PDS 0002 = MPL + PDS 0158',
      irdExample: 'IRD Platinum Consumer',
    },
    elo: {
      productCode: 'Cód. 071 (Elo Grafite)',
      commercialName: 'Elo Grafite',
      tableSource: 'Tabela de BINs Elo (Produto 071)',
      authAndOutgoingField: 'Reg 00 + Reg 01 + Reg 02',
      operationType: '990 / 992',
    },
    amex: {
      productCode: 'AX-PLT (TPC)',
      commercialName: 'The Platinum Card (TPC)',
      casRecordRef: 'TDR Pos 1-600',
    },
    riskAndComplianceNotes:
      'Forte presença em bancos digitais e emissores tradicionais; exige precificação de MDR calibrada por mix de produtos para não comprimir o spread da Adquirente.',
    outgoingTableLink: [
      { brand: 'visa', tableId: 'visa-tcr0', label: 'Visa TCR 0' },
      { brand: 'mastercard', tableId: 'mc-1240-base', label: 'Mastercard MTI 1240' },
    ],
  },
  {
    id: 'prod-06-signature-world',
    tierOrder: 6,
    category: 'CREDITO_PF',
    categoryLabel: 'Crédito PF · Tier 4 (Alta Renda)',
    productFamilyName: 'Visa Signature / Mastercard World / Elo Nanquim',
    fundingSource: 'Crédito PF',
    bacenRegulationCap: 'Livre Mercado (Sem teto Bacen no Crédito)',
    isRegulatedCap: false,
    typicalQualifiedInterchange: '1,75% a 2,20%',
    typicalDowngradeRate: '2,25% a 2,50%',
    visa: {
      pid: 'PID = N (Visa Signature)',
      commercialName: 'Visa Signature',
      tableSource: 'Visa ARDEF (PID N)',
      authAndOutgoingField: 'DE 62.23 = N · Outgoing: TC 05 TCR 0 + TCR 5',
      fpiExample: 'Signature Consumer Credit',
    },
    mastercard: {
      brandProductCode: 'MCW (Mastercard World)',
      commercialName: 'Mastercard World',
      tableSource: 'GCMS IP0091T1 (Product MCW)',
      authAndOutgoingField: 'MTI 1240 PDS 0002 = MCW + PDS 0158',
      irdExample: 'IRD High Value / World',
    },
    elo: {
      productCode: 'Cód. 046 (Elo Nanquim)',
      commercialName: 'Elo Nanquim',
      tableSource: 'Tabela de BINs Elo (Produto 046)',
      authAndOutgoingField: 'Reg 00 + Reg 01 + Reg 02',
      operationType: '990 / 992',
    },
    amex: {
      productCode: 'AX-PLT-HS',
      commercialName: 'Amex Platinum High-Spend',
      casRecordRef: 'TDR Pos 1-600',
    },
    riskAndComplianceNotes:
      'Introduzido pela Visa (`PID N`) como degrau entre o Platinum (`P`) e o Infinite (`I`); o motor de provisionamento da Adquirente deve mapear `N` separadamente de `P` e `I`.',
    outgoingTableLink: [
      { brand: 'visa', tableId: 'visa-tcr5', label: 'Visa TCR 5' },
      { brand: 'mastercard', tableId: 'mc-1240-base', label: 'Mastercard MTI 1240' },
    ],
  },
  {
    id: 'prod-07-infinite-black-diners',
    tierOrder: 7,
    category: 'CREDITO_PF',
    categoryLabel: 'Crédito PF · Tier 5 (Premium / Black)',
    productFamilyName: 'Visa Infinite / Mastercard Black (World Elite) / Elo Diners Club',
    fundingSource: 'Crédito PF',
    bacenRegulationCap: 'Livre Mercado (Sem teto Bacen no Crédito)',
    isRegulatedCap: false,
    typicalQualifiedInterchange: '1,90% a 2,40% (Ticket médio elevado e maior IC)',
    typicalDowngradeRate: '2,40% a 2,65%',
    visa: {
      pid: 'PID = I (Visa Infinite) / I1 (Infinite Privilege)',
      commercialName: 'Visa Infinite & Visa Infinite Privilege (I1)',
      tableSource: 'Visa ARDEF (PID I / I1)',
      authAndOutgoingField: 'DE 62.23 = I ou I1 · Outgoing: TC 05 TCR 0 + TCR 5',
      fpiExample: 'Infinite / Infinite Privilege Consumer Credit',
    },
    mastercard: {
      brandProductCode: 'MWE (Mastercard Black / World Elite)',
      commercialName: 'Mastercard Black™ (World Elite no GCMS)',
      tableSource: 'GCMS IP0091T1 (Product MWE)',
      authAndOutgoingField: 'MTI 1240 PDS 0002 = MWE + PDS 0158',
      irdExample: 'IRD World Elite / Black Consumer',
    },
    elo: {
      productCode: 'Cód. 047 (Elo Diners Club)',
      commercialName: 'Elo Diners Club Internacional',
      tableSource: 'Tabela de BINs Elo (Produto 047)',
      authAndOutgoingField: 'Reg 00 + Reg 01 + Reg 02',
      operationType: '990 / 992',
    },
    amex: {
      productCode: 'AX-CEN',
      commercialName: 'American Express Centurion / TPC Metal',
      casRecordRef: 'TDR Pos 1-600',
    },
    riskAndComplianceNotes:
      'Representa o topo de custo de intercâmbio para a Adquirente em vendas de consumo. Em e-commerce, enviar 3DS 2.2 (TCR 5/D, PDS 0185, Reg 05) e Tokenização evita downgrades caríssimos.',
    outgoingTableLink: [
      { brand: 'visa', tableId: 'visa-tcr5', label: 'Visa TCR 5' },
      { brand: 'elo', tableId: 'elo-reg05', label: 'Elo Registro 05 (3DS)' },
      { brand: 'mastercard', tableId: 'mc-1240-emv-3ds', label: 'Mastercard 3DS & EMV' },
    ],
  },
  {
    id: 'prod-08-business-pme',
    tierOrder: 8,
    category: 'COMERCIAL_B2B',
    categoryLabel: 'Comercial PME (Small Business)',
    productFamilyName: 'Cartão Empresarial / Small Business (Crédito & Débito PJ)',
    fundingSource: 'Comercial / Corporativo',
    bacenRegulationCap: 'Cartões Corporativos/Empresariais possuem regras específicas de intercâmbio comercial',
    isRegulatedCap: false,
    typicalQualifiedInterchange: '1,45% a 2,10%',
    typicalDowngradeRate: '2,20% a 2,55%',
    visa: {
      pid: 'PID = K1 / B (Visa Business)',
      commercialName: 'Visa Empresarial / Small Business',
      tableSource: 'Visa ARDEF (Commercial Card Level)',
      authAndOutgoingField: 'DE 62.23 = K1 · Outgoing: TC 05 TCR 0 + TCR E (B2B/PayFac)',
      fpiExample: 'Commercial Business Credit',
    },
    mastercard: {
      brandProductCode: 'MCB / MBS (Mastercard Businesscard)',
      commercialName: 'Mastercard Empresarial / Business',
      tableSource: 'GCMS IP0091T1 (Product MCB)',
      authAndOutgoingField: 'MTI 1240 PDS 0002 = MCB + PDS 0158',
      irdExample: 'IRD Commercial Small Business',
    },
    elo: {
      productCode: 'Cód. 050 (Elo Empresarial)',
      commercialName: 'Elo Empresarial / Mais Empresarial',
      tableSource: 'Tabela de BINs Elo (Produto 050)',
      authAndOutgoingField: 'Reg 00 + Reg 01 + Reg 02',
      operationType: '990 / 992',
    },
    amex: {
      productCode: 'AX-BIZ',
      commercialName: 'Amex Business Gold / Platinum',
      casRecordRef: 'TDR Pos 1-600',
    },
    riskAndComplianceNotes:
      'Essencial diferenciar cartão Pessoa Física (PF) de Pessoa Jurídica (PJ/Comercial) no motor de provisionamento de intercâmbio.',
    outgoingTableLink: [
      { brand: 'visa', tableId: 'visa-tcre', label: 'Visa TCR E' },
      { brand: 'mastercard', tableId: 'mc-1240-base', label: 'Mastercard MTI 1240' },
    ],
  },
  {
    id: 'prod-09-corporate-purchasing',
    tierOrder: 9,
    category: 'COMERCIAL_B2B',
    categoryLabel: 'Corporativo Grande Porte & B2B',
    productFamilyName: 'Corporate, Purchasing (Compras B2B) & Fleet (Frota)',
    fundingSource: 'Comercial / Corporativo',
    bacenRegulationCap: 'Livre Mercado B2B (Permite Enhanced Data Nível 2 / Nível 3)',
    isRegulatedCap: false,
    typicalQualifiedInterchange: '1,65% a 2,35% (Com incentivo para dados Nível 2/3)',
    typicalDowngradeRate: '2,45% a 2,75% (Standard Commercial)',
    visa: {
      pid: 'PID = K (Corporate) / S (Purchasing)',
      commercialName: 'Visa Corporate (K) & Visa Purchasing / VPA (S)',
      tableSource: 'Visa ARDEF + Commercial Enhanced Data',
      authAndOutgoingField: 'DE 62.23 = K ou S · Outgoing: TC 05 TCR 0 + TCR 3 / TCR E',
      fpiExample: 'Commercial Corporate / Purchasing B2B',
    },
    mastercard: {
      brandProductCode: 'MCO (Corporate) / MPU (Purchasing) / MFL (Fleet)',
      commercialName: 'Mastercard Corporate, Purchasing & Fleet',
      tableSource: 'GCMS IP0091T1 + Addendum MTI 1644',
      authAndOutgoingField: 'MTI 1240 PDS 0002 = MCO/MPU + MTI 1644 (Dados Nível 2/3)',
      irdExample: 'IRD Commercial Corporate / Large Market',
    },
    elo: {
      productCode: 'Cód. 051 / 052 (Elo Corporativo / Compras)',
      commercialName: 'Elo Corporativo & Elo Compras',
      tableSource: 'Tabela de BINs Elo',
      authAndOutgoingField: 'Reg 00 + Reg 01 + Reg 02 + Reg 08 (Viagens Corporativas)',
      operationType: '990 / 992',
    },
    amex: {
      productCode: 'AX-CORP / CPC',
      commercialName: 'Amex Corporate Card & Corporate Purchasing (CPC)',
      casRecordRef: 'TDR + TAA (Addendum)',
    },
    riskAndComplianceNotes:
      'Muito utilizado em passagens aéreas corporativas (IATA) e compras B2B; exige envio de registros de adendo (TCR 3, MTI 1644, Reg 08) quando o MCC é aéreo/hotel/auto.',
    outgoingTableLink: [
      { brand: 'visa', tableId: 'visa-tcr3', label: 'Visa TCR 3 (Setorial)' },
      { brand: 'elo', tableId: 'elo-reg08', label: 'Elo Registro 08 (IATA)' },
      { brand: 'mastercard', tableId: 'mc-1644-addendum', label: 'Mastercard MTI 1644 Addendum' },
    ],
  },
  {
    id: 'prod-10-agro-bndes',
    tierOrder: 10,
    category: 'ESPECIAL_PUSH',
    categoryLabel: 'Agronegócio & Fomento Brasil',
    productFamilyName: 'Cartão Agro / Safra / BNDES',
    fundingSource: 'Push / Especial',
    bacenRegulationCap: 'Regras e MCCs restritos de Insumos, Maquinário e Custeio Agrícola',
    isRegulatedCap: false,
    typicalQualifiedInterchange: '0,80% a 1,35% (Programa Setorial Agro)',
    typicalDowngradeRate: 'Recusa ou reclassificação se usado fora de MCC habilitado',
    visa: {
      pid: 'PID = F2 / K2 (Visa Agro)',
      commercialName: 'Visa Agro (Custeio & Investimento)',
      tableSource: 'Visa ARDEF + Tabelas Agro Brasil',
      authAndOutgoingField: 'TC 05 TCR 0 + TCR 2 Brasil',
      fpiExample: 'Brazil Agro Program',
    },
    mastercard: {
      brandProductCode: 'MAG (Mastercard Agro)',
      commercialName: 'Mastercard Agro',
      tableSource: 'GCMS IP0091T1',
      authAndOutgoingField: 'MTI 1240 + PDS Brasil',
      irdExample: 'IRD Agro Domestic BR',
    },
    elo: {
      productCode: 'Cód. 020 / 021 (Elo Agro / BNDES)',
      commercialName: 'Elo Agro & Cartão BNDES Elo',
      tableSource: 'Tabela de BINs Elo (Produto 020)',
      authAndOutgoingField: 'Reg 00 + Reg 01 + Reg 02',
      operationType: '990 / 992 / 994 (Financiamento)',
    },
    amex: {
      productCode: 'N/A',
      commercialName: 'Não aplicável',
      casRecordRef: '-',
    },
    riskAndComplianceNotes:
      'Opera com trava de MCC (Allowlist de estabelecimentos agrícolas, veterinários e tratores/insumos).',
    outgoingTableLink: [
      { brand: 'visa', tableId: 'visa-tcr2-br', label: 'Visa TCR 2 Brasil' },
      { brand: 'elo', tableId: 'elo-reg02', label: 'Elo Registro 02' },
    ],
  },
  {
    id: 'prod-11-push-oct-aft',
    tierOrder: 11,
    category: 'ESPECIAL_PUSH',
    categoryLabel: 'Push Payments & Funding (P2P / Cash-In)',
    productFamilyName: 'Visa Direct (OCT / AFT) · Mastercard Send · Elo Proc 53',
    fundingSource: 'Push / Especial',
    bacenRegulationCap: 'Tarifas específicas de Disbursement (OCT) e Account Funding (AFT)',
    isRegulatedCap: false,
    typicalQualifiedInterchange: 'Tarifa fixa ou % reduzido de OCT/AFT conforme caso de uso (P2P, Gaming, Payout)',
    typicalDowngradeRate: 'Rejeição no Clearing se faltar dados do Remetente/Beneficiário',
    visa: {
      pid: 'OCT (TC 06 / Proc 26) & AFT (TC 05 / Proc 10)',
      commercialName: 'Visa Direct (Original Credit Transaction & Account Funding)',
      tableSource: 'Visa Direct Technical Specification + Base II',
      authAndOutgoingField: 'Outgoing: TC 06 (OCT) ou TC 05 (AFT) + TCR 0 + TCR D (BAI/Sender)',
      fpiExample: 'Visa Direct OCT / AFT Program',
    },
    mastercard: {
      brandProductCode: 'Mastercard Send (PT / FT)',
      commercialName: 'Mastercard Send Payment & Funding Transaction',
      tableSource: 'Mastercard Send & GCMS IPM',
      authAndOutgoingField: 'MTI 1240 com Processing Code 28/18 + PDS de Sender/Recipient',
      irdExample: 'IRD MoneySend / Funding',
    },
    elo: {
      productCode: 'Processing Code 53 (Transferência de Fundos)',
      commercialName: 'Elo Transferência P2P / Crediário CSB/DSB',
      tableSource: 'Manual de Liquidação Elo Serviço 10 (v26.2)',
      authAndOutgoingField: 'Trinca 00 + 01 + 02 + Registro 03 OBRIGATÓRIO (Remetente e Destinatário)',
      operationType: 'Proc 53 + Registro 03',
    },
    amex: {
      productCode: 'AX-DISB',
      commercialName: 'Amex Disbursement',
      casRecordRef: 'TDR Credit',
    },
    riskAndComplianceNotes:
      'Regra de Ouro (PLD/FT): em qualquer OCT, AFT ou Proc 53, os campos de Nome, Documento (CPF/CNPJ) e Conta do Remetente e Beneficiário viram 100% OBRIGATÓRIOS (Visa TCR D, Elo Registro 03, Mastercard PDS).',
    outgoingTableLink: [
      { brand: 'visa', tableId: 'visa-tcrd', label: 'Visa TCR D (OCT/AFT)' },
      { brand: 'elo', tableId: 'elo-reg03', label: 'Elo Registro 03 (Proc 53)' },
    ],
  },
];

export const BRAZIL_MODALITIES_MAP = [
  {
    code: 'MOD-01',
    name: 'Débito à Vista',
    procCodeIso: 'DE 03 = 002000',
    visaOutgoing: 'TC 05 · TCR 0 + TCR 1 + TCR 2 (BR) + TCR 5 (+ TCR 7 se Chip/NFC)',
    mastercardOutgoing: 'MTI 1240 · DE 24=200 · PDS 0002=MDS/MAE · Sem PDS 0195',
    eloOutgoing: 'TE05 · Reg 00 + Reg 01 (Parcelas=00) + Reg 02 (Tipo Op = 991)',
    settlementRule: 'Liquidação D+1 na Grade de Débito da CIP/SLC (ASLC028)',
  },
  {
    code: 'MOD-02',
    name: 'Crédito à Vista (1x)',
    procCodeIso: 'DE 03 = 003000 (Sem parcelas)',
    visaOutgoing: 'TC 05 · TCR 0 + TCR 1 + TCR 2 (Pos 40-41 = Brancos/00) + TCR 5',
    mastercardOutgoing: 'MTI 1240 · DE 24=200 · PDS 0002=MCC..MWE · Sem PDS 0195',
    eloOutgoing: 'TE05 · Reg 00 + Reg 01 (Parcelas=01) + Reg 02 (Tipo Op = 990)',
    settlementRule: 'Liquidação D+30 (ou D+1/D+2 antecipado via ASLC031) na Grade ASLC026',
  },
  {
    code: 'MOD-03',
    name: 'Parcelado Loja (Sem Juros · 2x a 12x)',
    procCodeIso: 'DE 03 = 003000 + Dados de Parcelamento no DE 48 / DE 63 / DE 126',
    visaOutgoing: 'TC 05 · TCR 2 Brasil OBRIGATÓRIO: Pos 40–41 = (Nº de Parcelas + 10). Ex.: 3x = "13", 6x = "16", 12x = "22"',
    mastercardOutgoing: 'MTI 1240 · DE 48 com PDS 0195 OBRIGATÓRIO (Plano + Quantidade de Parcelas)',
    eloOutgoing: 'TE05 · Reg 01 (Pos 17-18 = Nº Parcelas) + Reg 02 (Pos 5-7 Tipo Op = 992)',
    settlementRule: 'Constitui N Unidades de Recebíveis (30/60/90.. dias) na B3/CERC e liquida no SLC (ASLC026)',
  },
  {
    code: 'MOD-04',
    name: 'Parcelado Emissor (Com Juros do Banco)',
    procCodeIso: 'DE 03 = 003800 / Indicador Emissor',
    visaOutgoing: 'TC 05 · TCR 2 Brasil (Indicador de Parcelado Emissor)',
    mastercardOutgoing: 'MTI 1240 · PDS 0195 com código de plano financiador Emissor',
    eloOutgoing: 'TE05 · Reg 01 (Nº Parcelas) + Reg 02 (Tipo Op = 993)',
    settlementRule: 'Lojista recebe à vista (D+30 único) e o Portador paga parcelado com juros na fatura do Emissor',
  },
  {
    code: 'MOD-05',
    name: 'Crediário no Cartão (Simulação Prévia)',
    procCodeIso: 'Consulta de Simulação + Autorização 0100 Crediário',
    visaOutgoing: 'TC 05 · TCR 2 Brasil + TCR D (Indicadores de Crediário)',
    mastercardOutgoing: 'MTI 1240 · PDS específicos de financiamento de longo prazo',
    eloOutgoing: 'TE05 · Reg 01 + Reg 02 (Tipo Op = 994) + Reg 03 quando aplicável',
    settlementRule: 'Liquidação rápida ao lojista; contrato de crédito amortizado até 24x/48x no Emissor',
  },
];

export const SECTOR_MCC_MAP = [
  {
    sector: 'Companhias Aéreas (IATA)',
    mccs: '3000 a 3299 e 4511',
    interchangeBehavior: 'Regra especial de passagem aérea e validação estrita de dados de voo',
    visaAddendum: 'TCR 3 Aéreo OBRIGATÓRIO (Bilhete, Passageiro, Trechos IATA, Stopover)',
    mastercardAddendum: 'MTI 1644 Addendum Aéreo OBRIGATÓRIO vinculado ao MTI 1240',
    eloAddendum: 'Registro 08 OBRIGATÓRIO (Bilhete, CIA, Aeroportos Origem/Destino, Taxa Embarque)',
  },
  {
    sector: 'Hotelaria & Hospedagem',
    mccs: '3500 a 3999 e 7011',
    interchangeBehavior: 'Suporta Autorização Incremental, Pré-Autorização e No-Show',
    visaAddendum: 'TCR 3 Lodging + TCR 5 (Market Specific Authorization Data = H)',
    mastercardAddendum: 'MTI 1644 Lodging Addendum (Folio, Check-in, Check-out, Diária)',
    eloAddendum: 'Campos de Pré-Autorização e Complemento nos Registros 00/01/02',
  },
  {
    sector: 'Locadoras de Veículos',
    mccs: '3351 a 3499 e 7512',
    interchangeBehavior: 'Exige dados de contrato de locação, retirada e devolução',
    visaAddendum: 'TCR 3 Auto Rental + TCR 5 (Market Specific = A)',
    mastercardAddendum: 'MTI 1644 Car Rental Addendum',
    eloAddendum: 'Registros 00/01/02 com identificador de contrato',
  },
  {
    sector: 'Supermercados & Atacarejos',
    mccs: '5411',
    interchangeBehavior: 'Faixa de Intercâmbio Incentivada (Everyday Spend / Supermarket Program)',
    visaAddendum: 'Qualificado automaticamente pelo MCC 5411 no TCR 0 (Pos 27-30)',
    mastercardAddendum: 'Qualificado via DE 26 (MCC 5411) gerando IRD de Supermercado',
    eloAddendum: 'Qualificado pelo MCC 5411 no Registro 00 (Pos 37-40)',
  },
  {
    sector: 'Postos de Combustível & Pedágios',
    mccs: '5541, 5542, 4784, 4111',
    interchangeBehavior: 'Programas de baixo ticket / Trânsito Rápido Contactless (MIT / Sem Senha)',
    visaAddendum: 'TCR 0 + TCR 7 (Contactless Transit / Fuel)',
    mastercardAddendum: 'MTI 1240 (Transit / Contactless Program)',
    eloAddendum: 'Reg 00 + Reg 02 + Reg 07 (NFC Trânsito)',
  },
];

export default function ProductMapAtlasClient() {
  const [activeTab, setActiveTab] = useState<ProductAtlasTab>('plastics_matrix');
  const [categoryFilter, setCategoryFilter] = useState<ProductCategoryFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<UnifiedProductSpec | null>(null);

  const filteredProducts = useMemo(() => {
    return UNIFIED_PRODUCTS.filter((p) => {
      if (categoryFilter !== 'ALL' && p.category !== categoryFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          p.productFamilyName.toLowerCase().includes(q) ||
          p.visa.pid.toLowerCase().includes(q) ||
          p.visa.commercialName.toLowerCase().includes(q) ||
          p.mastercard.brandProductCode.toLowerCase().includes(q) ||
          p.mastercard.commercialName.toLowerCase().includes(q) ||
          p.elo.productCode.toLowerCase().includes(q) ||
          p.elo.commercialName.toLowerCase().includes(q) ||
          p.amex.commercialName.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [categoryFilter, searchQuery]);

  const handleExportProductMapToDocStudio = () => {
    const rows = filteredProducts
      .map(
        (p) =>
          `<tr>
            <td><strong>${p.productFamilyName}</strong> (${p.fundingSource})</td>
            <td>${p.visa.pid} — ${p.visa.commercialName}</td>
            <td>${p.mastercard.brandProductCode} — ${p.mastercard.commercialName}</td>
            <td>${p.elo.productCode} — ${p.elo.commercialName}</td>
            <td>${p.amex.commercialName}</td>
            <td>${p.bacenRegulationCap}</td>
            <td>${p.typicalQualifiedInterchange}</td>
          </tr>`
      )
      .join('');

    sendToDocStudio({
      mode: 'append_html',
      title: 'Mapa Unificado de Produtos (Visa PID × Mastercard Brand Product × Elo × Amex)',
      sourceModule: 'Catálogo & Mapa de Produtos (4 Bandeiras)',
      html: `
        <h2>Mapa Unificado de Produtos de Cartão & Modalidades (4 Bandeiras)</h2>
        <p>Cruzamento oficial entre Visa PID, Mastercard GCMS Brand Product (IP0091T1/T068), Código de Produto Elo, American Express, Tetos Regulatórios BCB 304 e campos no arquivo de Outgoing.</p>
        <table>
          <thead>
            <tr>
              <th>Família / Funding</th>
              <th>Visa (PID)</th>
              <th>Mastercard (Brand Product)</th>
              <th>Elo (Cód. Produto)</th>
              <th>Amex</th>
              <th>Regulação Bacen</th>
              <th>Faixa Intercâmbio</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      `,
      metadata: {
        brand: 'geral',
        brandName: 'VISA · MASTERCARD · ELO · AMEX',
        referenceId: 'PRODUCT-MAP-4-BRANDS',
        category: 'Mapa de Produtos & Intercâmbio',
        effectiveDate: '2026',
        executiveSummary:
          'Equivalência completa de plásticos, funding, tetos regulatórios Bacen (0,50% Débito / 0,70% Pré-Pago), modalidades de parcelamento Brasil e adendos setoriais.',
      },
    });
  };

  return (
    <div className="max-w-[1650px] mx-auto p-4 sm:p-6 space-y-6">
      {/* Cabeçalho Editorial */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950/95 p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-300">
              <span>💳 CATÁLOGO & MAPA UNIFICADO DE PRODUTOS · 4 BANDEIRAS (VISA × MASTERCARD × ELO × AMEX)</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Equivalência de Plásticos (PID / Brand Product / Cód. Elo), Tetos Bacen, Modalidades & Setores
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-4xl leading-relaxed">
              Cruze lado a lado como cada bandeira codifica seus produtos nas tabelas técnicas (<strong>Visa ARDEF & PID</strong>,{' '}
              <strong>Mastercard MPE T068 & GCMS IP0091T1</strong>, <strong>Tabela de BINs Elo</strong> e <strong>Amex CAS</strong>), onde esse código trafega na autorização e no arquivo de Outgoing, e qual teto ou faixa de intercâmbio se aplica.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleExportProductMapToDocStudio}
              className="px-3.5 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-xs font-bold text-blue-300 transition-all"
            >
              📄 Exportar Mapa de Produtos p/ Doc Studio
            </button>
            <Link
              href="/mapa/irds"
              className="px-3.5 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-xs font-bold text-amber-300 transition-all"
            >
              Abrir Atlas de 2.103 IRDs ➔
            </Link>
          </div>
        </div>

        {/* Seletor das 4 Lentes do Mapa de Produtos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {[
            {
              id: 'plastics_matrix',
              badge: 'MAPA 1 · 11 FAMÍLIAS',
              title: 'Equivalência de Plásticos & Tiers (4 Bandeiras)',
              sub: 'Visa PID × MC Brand Product × Elo Cód. × Amex + Teto Bacen',
            },
            {
              id: 'wire_and_tables',
              badge: 'MAPA 2 · TABELAS & CABO',
              title: 'Onde o Produto Nasce e Trafega no Arquivo',
              sub: 'ARDEF / T068 / IP0091T1 ➔ 0100 ➔ Outgoing ➔ VSS/T140',
            },
            {
              id: 'brazil_modalities',
              badge: 'MAPA 3 · MODALIDADES BR',
              title: 'Produtos Transacionais & Parcelado Brasil',
              sub: 'Débito, Crédito 1x, Parcelado Loja (TCR 2 / PDS 0195 / 992), Crediário',
            },
            {
              id: 'sector_mcc',
              badge: 'MAPA 4 · SETORIAL & MCC',
              title: 'Mapa Setorial (IATA, Hotel, Auto, Agro, Supermercado)',
              sub: 'Gatilhos de MCC que exigem TCR 3, MTI 1644 ou Registro 08',
            },
          ].map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as ProductAtlasTab)}
                className={`rounded-xl border p-3.5 text-left transition-all flex flex-col justify-between gap-1.5 ${
                  active
                    ? 'bg-blue-600 text-white border-blue-400 shadow-lg shadow-blue-950/50'
                    : 'bg-slate-900/90 text-slate-300 border-slate-800 hover:border-slate-600'
                }`}
              >
                <span className="font-mono text-[10px] font-black uppercase tracking-wider opacity-85">
                  {tab.badge}
                </span>
                <div className="text-xs sm:text-sm font-black leading-snug">{tab.title}</div>
                <div className={`text-[11px] leading-snug ${active ? 'text-blue-100' : 'text-slate-400'}`}>
                  {tab.sub}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* =====================================================================
          MAPA 1 — MATRIZ DE EQUIVALÊNCIA DE PLÁSTICOS & TIERS (4 BANDEIRAS)
         ===================================================================== */}
      {activeTab === 'plastics_matrix' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-950/95 p-5 space-y-4 shadow-xl">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 border-b border-slate-800 pb-4">
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: 'ALL', label: 'Todos os Produtos (11)' },
                { id: 'DEBITO_PREPAGO', label: '🛡️ Débito & Pré-Pago (Teto Bacen)' },
                { id: 'CREDITO_PF', label: '💳 Crédito PF (Classic ao Black/Infinite)' },
                { id: 'COMERCIAL_B2B', label: '🏢 Empresarial, Corporate & Purchasing' },
                { id: 'ESPECIAL_PUSH', label: '🌾 Agro, BNDES & Push (OCT/AFT/Send)' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategoryFilter(cat.id as ProductCategoryFilter)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                    categoryFilter === cat.id
                      ? 'bg-emerald-600 text-white border-emerald-400'
                      : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-600'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar PID (F, G, P, N, I, C, J3), MPL, MWE, Nanquim, 071..."
              className="w-full lg:w-80 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-400"
            />
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-900/95 border-b border-slate-800 text-[11px] font-mono uppercase text-slate-400">
                  <th className="py-3 px-3">Família / Tier & Funding</th>
                  <th className="py-3 px-3 text-blue-300">Visa (PID)</th>
                  <th className="py-3 px-3 text-emerald-300">Mastercard (Brand Product)</th>
                  <th className="py-3 px-3 text-amber-300">Elo (Cód. Produto)</th>
                  <th className="py-3 px-3 text-cyan-300">Amex</th>
                  <th className="py-3 px-3">Regulação Bacen & IC Típico</th>
                  <th className="py-3 px-3 text-right">Inspector</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                {filteredProducts.map((prod) => (
                  <tr
                    key={prod.id}
                    onClick={() => setSelectedProduct(prod)}
                    className="cursor-pointer hover:bg-slate-900/70 transition-colors"
                  >
                    <td className="py-3.5 px-3 align-top min-w-[210px]">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 font-mono text-[10px] font-bold text-slate-300">
                          #{prod.tierOrder} · {prod.fundingSource}
                        </span>
                        {prod.isRegulatedCap && (
                          <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/40 font-mono text-[9px] font-black text-emerald-300">
                            TETO BCB 304
                          </span>
                        )}
                      </div>
                      <div className="font-black text-white text-xs sm:text-sm">
                        {prod.productFamilyName}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{prod.categoryLabel}</div>
                    </td>

                    <td className="py-3.5 px-3 align-top min-w-[185px]">
                      <span className="inline-block px-2 py-0.5 rounded bg-blue-500/15 border border-blue-500/30 font-mono text-[11px] font-black text-blue-300">
                        {prod.visa.pid}
                      </span>
                      <div className="text-slate-200 font-medium mt-1">{prod.visa.commercialName}</div>
                    </td>

                    <td className="py-3.5 px-3 align-top min-w-[195px]">
                      <span className="inline-block px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 font-mono text-[11px] font-black text-emerald-300">
                        {prod.mastercard.brandProductCode}
                      </span>
                      <div className="text-slate-200 font-medium mt-1">
                        {prod.mastercard.commercialName}
                      </div>
                    </td>

                    <td className="py-3.5 px-3 align-top min-w-[185px]">
                      <span className="inline-block px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 font-mono text-[11px] font-black text-amber-300">
                        {prod.elo.productCode}
                      </span>
                      <div className="text-slate-200 font-medium mt-1">{prod.elo.commercialName}</div>
                    </td>

                    <td className="py-3.5 px-3 align-top min-w-[150px]">
                      <span className="inline-block px-2 py-0.5 rounded bg-cyan-500/15 border border-cyan-500/30 font-mono text-[10px] font-bold text-cyan-300">
                        {prod.amex.productCode}
                      </span>
                      <div className="text-slate-300 text-[11px] mt-1">{prod.amex.commercialName}</div>
                    </td>

                    <td className="py-3.5 px-3 align-top min-w-[220px]">
                      <div className="font-mono font-bold text-emerald-300">
                        IC Qualificado: {prod.typicalQualifiedInterchange}
                      </div>
                      <div className="font-mono text-[11px] text-rose-300 mt-0.5">
                        Downgrade: {prod.typicalDowngradeRate}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                        {prod.bacenRegulationCap}
                      </div>
                    </td>

                    <td className="py-3.5 px-3 align-top text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedProduct(prod);
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/30 text-[11px] font-bold transition-all"
                      >
                        Inspecionar ➔
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =====================================================================
          MAPA 2 — ONDE O PRODUTO NASCE E TRAFEGA NO ARQUIVO (TABELAS & CABO)
         ===================================================================== */}
      {activeTab === 'wire_and_tables' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[
            {
              brand: 'VISA (Base I & Base II CTF 168B)',
              accent: 'border-blue-500/40 bg-blue-950/15',
              badge: 'PID DE 2 CARACTERES (F, G, P, N, I, I1, C, J3, K, S)',
              steps: [
                '1. Tabela de BIN / Range (Descoberta): Arquivo ARDEF (Account Range Definition) define o intervalo de BIN, Funding (Credit/Debit/Prepaid) e o Product ID (PID).',
                '2. Autorização Online (0100/0110): O PID trafega no subcampo DE 62.23 (Product ID) e o identificador de ciclo de vida vem no DE 62.2 (TID 15 dígitos).',
                '3. Arquivo Outgoing (.CTF 168B): Gravado na espinha dorsal TC 05 TCR 0 + TCR 2 Brasil + TCR 5 (Payment Service Data).',
                '4. Relatório de Qualificação e Fatura: Relatório VSS-140 (Interchange Qualification) mostra o FPI (Fee Program Indicator) aplicado por produto e o VX-100A aponta downgrades.',
              ],
            },
            {
              brand: 'MASTERCARD (Banknet CIS & GCMS IPM 1014B)',
              accent: 'border-emerald-500/40 bg-emerald-950/15',
              badge: 'BRAND PRODUCT DE 3 LETRAS (MCC, MCG, MPL, MCW, MWE, MDS, MCB, MCO)',
              steps: [
                '1. Tabela de Parâmetros (Descoberta): No online usa o arquivo MPE T068; no clearing GCMS usa as tabelas IP0040T1 (Account Range) e IP0091T1 (Licensed Product ID).',
                '2. Autorização Online (0100/0110): Identificado pelo Account Range e devolvido junto ao DE 63 (Banknet Reference Number 9 pos + MMDD).',
                '3. Arquivo Outgoing (.IPM R111): Dentro da mensagem MTI 1240, o produto vai no DE 48 tag PDS 0002 (GCMS Product Identifier) e a tarifa pretendida no PDS 0158 (IRD de 2 caracteres).',
                '4. Relatório de Qualificação e Fatura: Arquivo T140 (Clearing Summary) confirma o IRD aceito por produto; fatura mensal vem no MCBS TN3A.',
              ],
            },
            {
              brand: 'ELO (STI Online & Serviço 10 — 168B)',
              accent: 'border-amber-500/40 bg-amber-950/15',
              badge: 'CÓDIGO DE PRODUTO DE 3 DÍGITOS (001, 002, 070, 071, 046, 047, 050, 020)',
              steps: [
                '1. Tabela de BINs Elo (Descoberta): Arquivo posicional de ranges da Elo vincula cada faixa de BIN ao Código de Produto de 3 dígitos e à modalidade (Crédito, Débito, Pré-Pago, Agro).',
                '2. Autorização Online (0100/0110): Switch valida o BIN e devolve o NSU Elo (12 posições) e o Código de Autorização (DE 38).',
                '3. Arquivo Outgoing (Serviço 10 v26.2): Composto pela trinca obrigatória Registro 00 (PAN, Valor, MCC, ARN) + Registro 01 (Parcelas, NSU, CNPJ) + Registro 02 (Tipo de Operação 990 a 995 e Cód. Produto).',
                '4. Relatório de Qualificação e Crítica: Erros voltam como TE01 com Registro 09; conciliação financeira sai no relatório 20-02.',
              ],
            },
            {
              brand: 'AMERICAN EXPRESS (GNS Switch & CAS 600B)',
              accent: 'border-cyan-500/40 bg-cyan-950/15',
              badge: 'PRODUCT / CARDMEMBER TIER (GREEN, GOLD, PLATINUM TPC, CENTURION, CORP)',
              steps: [
                '1. Descoberta de Range (BIN 34 / 37): Identifica se o cartão é emitido no Brasil ou no exterior (Cross-Border) e a linha Consumer vs Corporate.',
                '2. Autorização Online (MTI 1100/1110): Gera o Transaction ID Amex de 15 posições na malha GNS.',
                '3. Arquivo Outgoing CAS (600B Fixo): Hierarquia TFH (Header) ➔ TAB (Batch) ➔ TDR (Transaction Detail Record 600B com ARN de 26 posições) ➔ TFT (Trailer).',
                '4. Relatório de Conciliação: Retornado nos arquivos DFH / DFR / DFT.',
              ],
            },
          ].map((b, idx) => (
            <div
              key={idx}
              className={`rounded-2xl border p-5 space-y-3 ${b.accent}`}
            >
              <div className="space-y-1 border-b border-slate-800/80 pb-3">
                <span className="font-mono text-[10px] font-black text-blue-300 uppercase tracking-wider">
                  {b.badge}
                </span>
                <h3 className="text-base font-black text-white">{b.brand}</h3>
              </div>
              <div className="space-y-2 text-xs text-slate-200 leading-relaxed">
                {b.steps.map((st, i) => (
                  <div
                    key={i}
                    className="rounded-xl bg-slate-950/90 border border-slate-800 p-3"
                  >
                    {st}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* =====================================================================
          MAPA 3 — MODALIDADES TRANSACIONAIS BRASILEIRAS (PARCELADO, DÉBITO, CREDIÁRIO)
         ===================================================================== */}
      {activeTab === 'brazil_modalities' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-950/95 p-5 space-y-4 shadow-xl">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
              Mapa 3 · Como Cada Modalidade Transacional Brasileira Muda os Registros no Outgoing
            </span>
            <p className="text-xs text-slate-400 mt-0.5">
              No Brasil, um mesmo plástico (ex.: Visa Platinum ou Mastercard Black) pode operar em 5 modalidades diferentes de captura e liquidação.
            </p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-900/95 border-b border-slate-800 text-[11px] font-mono uppercase text-slate-400">
                  <th className="py-3 px-3">Modalidade Brasil</th>
                  <th className="py-3 px-3">ISO 8583 (Online)</th>
                  <th className="py-3 px-3 text-blue-300">Visa Outgoing (.CTF)</th>
                  <th className="py-3 px-3 text-emerald-300">Mastercard Outgoing (.IPM)</th>
                  <th className="py-3 px-3 text-amber-300">Elo Outgoing (Serviço 10)</th>
                  <th className="py-3 px-3">Liquidação B3 / CIP SLC</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                {BRAZIL_MODALITIES_MAP.map((m) => (
                  <tr key={m.code} className="hover:bg-slate-900/60">
                    <td className="py-3.5 px-3 align-top font-black text-white min-w-[180px]">
                      <span className="block font-mono text-[10px] text-blue-400 mb-0.5">{m.code}</span>
                      {m.name}
                    </td>
                    <td className="py-3.5 px-3 align-top font-mono text-cyan-300 min-w-[160px]">
                      {m.procCodeIso}
                    </td>
                    <td className="py-3.5 px-3 align-top text-slate-200 min-w-[230px]">
                      {m.visaOutgoing}
                    </td>
                    <td className="py-3.5 px-3 align-top text-slate-200 min-w-[230px]">
                      {m.mastercardOutgoing}
                    </td>
                    <td className="py-3.5 px-3 align-top text-slate-200 min-w-[230px]">
                      {m.eloOutgoing}
                    </td>
                    <td className="py-3.5 px-3 align-top text-emerald-300 font-medium min-w-[220px]">
                      {m.settlementRule}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =====================================================================
          MAPA 4 — MAPA SETORIAL POR MCC & ADDENDA RECORDS
         ===================================================================== */}
      {activeTab === 'sector_mcc' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-950/95 p-5 space-y-4 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-amber-400">
                Mapa 4 · Produtos Verticais por MCC & Registros de Adendo Obrigatórios
              </span>
              <p className="text-xs text-slate-400 mt-0.5">
                Determinados MCCs alteram a tabela de intercâmbio e tornam obrigatórios os registros de indústria (TCR 3, MTI 1644 Addendum, Registro 08).
              </p>
            </div>
            <Link
              href="/compliance/outgoing?tab=industry"
              className="px-3 py-1.5 rounded-lg bg-blue-600/20 border border-blue-500/30 text-xs font-bold text-blue-300"
            >
              Inspecionar Layouts de Indústria no Outgoing ➔
            </Link>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-900/95 border-b border-slate-800 text-[11px] font-mono uppercase text-slate-400">
                  <th className="py-3 px-3">Vertical / Setor</th>
                  <th className="py-3 px-3">Faixa de MCC (DE 18 / 26)</th>
                  <th className="py-3 px-3">Impacto no Intercâmbio</th>
                  <th className="py-3 px-3 text-blue-300">Visa Base II</th>
                  <th className="py-3 px-3 text-emerald-300">Mastercard IPM</th>
                  <th className="py-3 px-3 text-amber-300">Elo Serviço 10</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                {SECTOR_MCC_MAP.map((s, i) => (
                  <tr key={i} className="hover:bg-slate-900/60">
                    <td className="py-3.5 px-3 align-top font-black text-white min-w-[180px]">
                      {s.sector}
                    </td>
                    <td className="py-3.5 px-3 align-top font-mono font-bold text-amber-300 min-w-[140px]">
                      MCC {s.mccs}
                    </td>
                    <td className="py-3.5 px-3 align-top text-slate-200 min-w-[210px]">
                      {s.interchangeBehavior}
                    </td>
                    <td className="py-3.5 px-3 align-top text-slate-200 min-w-[220px]">
                      {s.visaAddendum}
                    </td>
                    <td className="py-3.5 px-3 align-top text-slate-200 min-w-[220px]">
                      {s.mastercardAddendum}
                    </td>
                    <td className="py-3.5 px-3 align-top text-slate-200 min-w-[220px]">
                      {s.eloAddendum}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =====================================================================
          SLIDE-OVER INSPECTOR DRAWER DO PRODUTO SELECIONADO
         ===================================================================== */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-slate-950 border-l border-slate-800 h-full overflow-y-auto p-6 space-y-5 shadow-2xl">
            <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <span className="px-2.5 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 font-mono text-[11px] font-black text-emerald-300">
                  INSPECTOR DE PRODUTO · TIER #{selectedProduct.tierOrder} ({selectedProduct.fundingSource})
                </span>
                <h3 className="text-lg font-black text-white mt-1.5">
                  {selectedProduct.productFamilyName}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">{selectedProduct.categoryLabel}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProduct(null)}
                className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-slate-300"
              >
                ✕ Fechar
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Bloco 1: Regulação Bacen & Faixa de Intercâmbio */}
              <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-4 space-y-2">
                <div className="text-[11px] font-black uppercase tracking-wider text-emerald-400">
                  1. Enquadramento Regulatório (Bacen) & Faixa Tarifária
                </div>
                <div className="text-slate-200">
                  <strong>Regra Banco Central:</strong> {selectedProduct.bacenRegulationCap}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <div className="rounded-lg bg-emerald-950/30 border border-emerald-500/30 p-2.5">
                    <div className="text-[10px] font-mono uppercase text-emerald-300">
                      Intercâmbio Qualificado Típico
                    </div>
                    <div className="font-mono text-sm font-black text-white mt-0.5">
                      {selectedProduct.typicalQualifiedInterchange}
                    </div>
                  </div>
                  <div className="rounded-lg bg-rose-950/30 border border-rose-500/30 p-2.5">
                    <div className="text-[10px] font-mono uppercase text-rose-300">
                      Em Caso de Downgrade (EIRF / Standard)
                    </div>
                    <div className="font-mono text-sm font-black text-rose-200 mt-0.5">
                      {selectedProduct.typicalDowngradeRate}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bloco 2: Equivalência Técnica nas 4 Bandeiras */}
              <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-4 space-y-3">
                <div className="text-[11px] font-black uppercase tracking-wider text-blue-400">
                  2. Códigos Oficiais de Produto & Tabelas de Origem nas 4 Bandeiras
                </div>

                <div className="space-y-2.5">
                  <div className="rounded-lg bg-slate-950 border border-blue-500/30 p-3 space-y-1">
                    <div className="font-mono font-black text-blue-300">
                      VISA · {selectedProduct.visa.pid} ({selectedProduct.visa.commercialName})
                    </div>
                    <div className="text-slate-300">
                      <strong>Tabela Fonte:</strong> {selectedProduct.visa.tableSource}
                    </div>
                    <div className="text-slate-300 font-mono text-[11px]">
                      <strong>No Cabo:</strong> {selectedProduct.visa.authAndOutgoingField}
                    </div>
                  </div>

                  <div className="rounded-lg bg-slate-950 border border-emerald-500/30 p-3 space-y-1">
                    <div className="font-mono font-black text-emerald-300">
                      MASTERCARD · {selectedProduct.mastercard.brandProductCode} ({selectedProduct.mastercard.commercialName})
                    </div>
                    <div className="text-slate-300">
                      <strong>Tabela Fonte:</strong> {selectedProduct.mastercard.tableSource}
                    </div>
                    <div className="text-slate-300 font-mono text-[11px]">
                      <strong>No Cabo:</strong> {selectedProduct.mastercard.authAndOutgoingField}
                    </div>
                  </div>

                  <div className="rounded-lg bg-slate-950 border border-amber-500/30 p-3 space-y-1">
                    <div className="font-mono font-black text-amber-300">
                      ELO · {selectedProduct.elo.productCode} ({selectedProduct.elo.commercialName})
                    </div>
                    <div className="text-slate-300">
                      <strong>Tabela Fonte:</strong> {selectedProduct.elo.tableSource}
                    </div>
                    <div className="text-slate-300 font-mono text-[11px]">
                      <strong>No Cabo:</strong> {selectedProduct.elo.authAndOutgoingField}
                    </div>
                  </div>

                  <div className="rounded-lg bg-slate-950 border border-cyan-500/30 p-3 space-y-1">
                    <div className="font-mono font-black text-cyan-300">
                      AMERICAN EXPRESS · {selectedProduct.amex.productCode} ({selectedProduct.amex.commercialName})
                    </div>
                    <div className="text-slate-300 font-mono text-[11px]">
                      <strong>Arquivo CAS:</strong> {selectedProduct.amex.casRecordRef}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bloco 3: Notas de Compliance e Pulo para Tabelas de Outgoing */}
              <div className="rounded-xl bg-amber-950/20 border border-amber-500/30 p-4 space-y-3">
                <div className="text-[11px] font-black uppercase tracking-wider text-amber-300">
                  3. Regra Operacional & Tabelas de Outgoing Conectadas
                </div>
                <p className="text-slate-200 leading-relaxed">
                  {selectedProduct.riskAndComplianceNotes}
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  {selectedProduct.outgoingTableLink.map((lnk, i) => (
                    <Link
                      key={i}
                      href={`/compliance/outgoing?tab=tables&brand=${lnk.brand}&table=${lnk.tableId}`}
                      className="px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/30 font-mono text-[11px] font-bold transition-all"
                    >
                      Abrir {lnk.label} no Outgoing ➔
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
