'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { sendToDocStudio } from '@/lib/docStudioBridge';

export type LabTrackId =
  | 'cartao'
  | 'clearing_slc'
  | 'contestacao_ce3'
  | 'pix_spi'
  | 'pix_auto_nfc'
  | 'med_seguranca'
  | 'open_finance_drex'
  | 'regras_2027_tempo';

export type IsometricNodeId =
  | 'pos_client'
  | 'sub_payfac'
  | 'acquirer_psp'
  | 'network_spi'
  | 'issuer_receiver'
  | 'slc_b3_str';

export interface TechnicalFieldKV {
  code: string;
  name: string;
  value: string;
  note: string;
}

export interface LabMessageStep {
  stepNo: number;
  stageTitle: string;
  elapsedLabel: string;
  codeBadge: string;
  title: string;
  fromNode: IsometricNodeId;
  toNode: IsometricNodeId;
  fromLabel: string;
  toLabel: string;
  status: 'normal' | 'warning' | 'error';
  systemHops: string;
  plainExplanation: string;
  deepDiveTitle: string;
  deepDiveNormative: string;
  normativeSource: string;
  fields: TechnicalFieldKV[];
}

export interface RegulatoryMilestone {
  id: string;
  era: 'em_vigor' | 'chegando_2027' | 'horizonte_2028_2030';
  badge: string;
  effectiveDate: string;
  normCode: string;
  title: string;
  tracksAffected: LabTrackId[];
  whatChangesInPractice: string;
  technicalImpact: string;
  financialImpact: string;
  officialSource: string;
}

const ISOMETRIC_COORDS: Record<
  IsometricNodeId,
  { x: number; y: number; glyph: 'terminal' | 'payfac' | 'acquirer' | 'network' | 'issuer' | 'chamber' }
> = {
  pos_client: { x: 145, y: 125, glyph: 'terminal' },
  sub_payfac: { x: 280, y: 65, glyph: 'payfac' },
  acquirer_psp: { x: 335, y: 185, glyph: 'acquirer' },
  network_spi: { x: 545, y: 130, glyph: 'network' },
  issuer_receiver: { x: 430, y: 315, glyph: 'issuer' },
  slc_b3_str: { x: 635, y: 295, glyph: 'chamber' },
};

const REGULATORY_MILESTONES: RegulatoryMilestone[] = [
  {
    id: 'reg-bcb-304',
    era: 'em_vigor',
    badge: 'EM VIGOR',
    effectiveDate: 'Desde 01/04/2023',
    normCode: 'Resolução BCB nº 304/2023',
    title: 'Teto do Intercâmbio no Débito (0,50%) e no Pré-Pago (0,70%)',
    tracksAffected: ['cartao', 'clearing_slc', 'regras_2027_tempo'],
    whatChangesInPractice:
      'Limita a tarifa de intercâmbio recebida pelo Emissor a no máximo 0,50% por transação de Débito (com média ponderada trimestral de até 0,50%; exceções corporativas/governo até 0,80%) e a 0,70% em qualquer cartão Pré-Pago.',
    technicalImpact:
      'O código de produto enviado na autorização (Visa PID DE 62.23, Mastercard PDS 0002, Elo Cód. Produto Reg 00) e no arquivo de Outgoing define se a transação cai no teto regulado ou em Crédito Livre Mercado.',
    financialImpact:
      'Reduziu drasticamente o custo de aceitação do débito e pré-pago para o comércio e nivelou a competição entre bancos tradicionais e fintechs emissoras de contas pré-pagas.',
    officialSource: 'Banco Central do Brasil — Resolução BCB nº 304 (20/03/2023)',
  },
  {
    id: 'reg-lei-14690',
    era: 'em_vigor',
    badge: 'EM VIGOR',
    effectiveDate: 'Desde 03/01/2024',
    normCode: 'Lei nº 14.690/2023 + Res. CMN 5.112',
    title: 'Juros do Rotativo e Parcelamento de Fatura Limitados a 100% da Dívida Original',
    tracksAffected: ['cartao', 'regras_2027_tempo'],
    whatChangesInPractice:
      'O total cobrado a título de juros e encargos financeiros no crédito rotativo e no parcelamento de fatura não pode ultrapassar o valor original da dívida (teto de 100%). Também instituiu a portabilidade gratuita do saldo devedor da fatura.',
    technicalImpact:
      'Sistemas de core bancário e processadoras emissoras precisam rastrear o principal histórico de cada ciclo de fatura para travar a capitalização de juros exatamente quando encargos acumulados = 100% do principal.',
    financialImpact:
      'Pressionou o risco de crédito dos emissores em faixas de menor renda e acelerou a discussão regulatória sobre o reequilíbrio entre rotativo e parcelado sem juros.',
    officialSource: 'Planalto / CMN — Lei Federal nº 14.690/2023 (Art. 28)',
  },
  {
    id: 'reg-bcb-264',
    era: 'em_vigor',
    badge: 'EM VIGOR',
    effectiveDate: 'Desde 07/06/2021 (Aperfeiçoada 2023–2026)',
    normCode: 'Resolução BCB nº 264/2022',
    title: 'Registro Obrigatório de Recebíveis de Cartão (URs na B3, CERC e TAG)',
    tracksAffected: ['clearing_slc', 'cartao', 'regras_2027_tempo'],
    whatChangesInPractice:
      'Toda adquirente e subcredenciadora é obrigada a registrar a agenda de recebíveis do lojista como Unidades de Recebíveis (UR = CNPJ/CPF + Bandeira + Modalidade + Data de Liquidação) em registradora autorizada pelo Bacen.',
    technicalImpact:
      'Antes de montar a grade ASLC026/028/031 para a CIP/Núclea, o motor de liquidação precisa consultar os contratos de cessão/gravame retornados pela registradora para direcionar o pagamento ao banco credor ou ao domicílio do lojista.',
    financialImpact:
      'Quebrou a "trava bancária" exclusiva e permitiu ao lojista antecipar ou dar seus recebíveis em garantia em qualquer instituição financeira.',
    officialSource: 'Banco Central do Brasil — Resolução BCB nº 264 (25/11/2022)',
  },
  {
    id: 'reg-visa-brl-cavv9',
    era: 'em_vigor',
    badge: 'RELEASE 26.1',
    effectiveDate: '01/05/2026',
    normCode: 'Visa Brazil Fee Schedule BRL + 3DS 2.2 CAVV v9 AES',
    title: 'Conversão das Tarifas Visa no Brasil de USD para BRL & Migração CAVV v7 (3DES) ➔ v9 (AES)',
    tracksAffected: ['cartao', 'clearing_slc', 'contestacao_ce3', 'regras_2027_tempo'],
    whatChangesInPractice:
      'Billing lines domésticas do relatório VSS-110/120 passaram a ser tarifadas diretamente em Reais (BRL), eliminando variação cambial PTAX nas faturas domésticas. Em paralelo, o criptograma 3DS 2.2 migrou para CAVV versão 9 (AES-128).',
    technicalImpact:
      'HSMs emissores (ACS) e validadores de Outgoing (TCR 5 / Reg 02) devem suportar Key Block AES TR-31 para CAVV v9, e motores de auditoria de fatura VSS/MCBS devem conciliar alíquotas fixas em BRL.',
    financialImpact:
      'Previsibilidade orçamentária em BRL para emissores e adquirentes brasileiros e redução de downgrade por falha de validação criptográfica 3DS.',
    officialSource: 'Visa Business News / Visa Fee Schedule Brazil (Maio/2026)',
  },
  {
    id: 'reg-pix-auto-nfc-2026',
    era: 'chegando_2027',
    badge: '2026 / 2027',
    effectiveDate: 'Escala Nacional 2026 ➔ 2027',
    normCode: 'Resoluções BCB nº 396, 406 e 429',
    title: 'Pix Automático (Recorrência B2C) & Pix por Aproximação (NFC / Carteiras Digitais)',
    tracksAffected: ['pix_auto_nfc', 'pix_spi', 'open_finance_drex', 'regras_2027_tempo'],
    whatChangesInPractice:
      'O Pix Automático permite cobranças recorrentes (assinaturas, escolas, streaming, utilities, SaaS) mediante autorização única do pagador no app do banco, sem precisar ler QR Code todo mês. Já o Pix por Aproximação leva o Pix para o NFC do celular na maquininha via Jornada Sem Redirecionamento (JSR) do Open Finance.',
    technicalImpact:
      'Exige mensageria ISO 20022 de mandato e agendamento (pain.013 / pacs.008 agendado D-2 a D-1 com retentativas padronizadas) no Pix Automático, e vínculo criptográfico FIDO2/Passkey entre carteira digital (ITP) e detentora de conta na JSR.',
    financialImpact:
      'Concorre frontalmente com o cartão de crédito em assinaturas (MIT/SCOF) e com o débito presencial na maquininha, a custo fração do MDR tradicional.',
    officialSource: 'Banco Central do Brasil — Regulamento do Pix & Open Finance (JSR)',
  },
  {
    id: 'reg-med-20-2027',
    era: 'chegando_2027',
    badge: 'MANDATO 2026/2027',
    effectiveDate: 'Implantação Completa 2026 ➔ 2027',
    normCode: 'Evolução do Regulamento Pix — MED 2.0 (Grafo Multinível)',
    title: 'MED 2.0: Autoatendimento 100% Digital & Rastreio Automático Além da 1ª Conta Laranja',
    tracksAffected: ['med_seguranca', 'pix_spi', 'regras_2027_tempo'],
    whatChangesInPractice:
      'O Mecanismo Especial de Devolução (MED) deixa de bloquear apenas a 1ª conta recebedora (que fraudadores esvaziavam em segundos) e passa a rastrear e bloquear recursos automaticamente ao longo das camadas seguintes do grafo de transferências no SPI.',
    technicalImpact:
      'Integração obrigatória de botão padronizado de contestação Pix no app de todos os PSPs, propagação automática de bloqueio cautelar em cascata entre múltiplos ISPBs e compartilhamento estruturado de evidências de fraude no DICT.',
    financialImpact:
      'Aumenta drasticamente a taxa de recuperação de valores em golpes/fraudes Pix e exige motores antifraude comportamentais em tempo real nos PSPs recebedores.',
    officialSource: 'Banco Central do Brasil — Agenda Evolutiva de Segurança do Pix (MED 2.0)',
  },
  {
    id: 'reg-split-tributario-2027',
    era: 'chegando_2027',
    badge: 'MARCO 2027+',
    effectiveDate: 'Transição 2026 ➔ Operação CBS 2027+',
    normCode: 'Lei Complementar nº 214/2025 (Arts. 31 a 35 — Split Payment Tributário)',
    title: 'Split Payment Tributário Automático da Reforma Tributária (IBS / CBS) na Liquidação',
    tracksAffected: ['clearing_slc', 'cartao', 'pix_spi', 'regras_2027_tempo'],
    whatChangesInPractice:
      'Maior mudança estrutural de engenharia de pagamentos da década no Brasil: adquirentes, subcredenciadoras e PSPs do Pix passarão a segregar automaticamente, no ato da liquidação financeira da transação, a parcela correspondente aos novos tributos (CBS federal a partir de 2027 e IBS estadual/municipal gradualmente) vinculando o pagamento ao documento fiscal eletrônico (NF-e / NFC-e).',
    technicalImpact:
      'Novos campos obrigatórios na captura, no Outgoing e na liquidação (Chave da NF-e/NFC-e ou código de tributação + consulta/conciliação com o Comitê Gestor do IBS e Receita Federal) para dividir o fluxo líquido entre Fisco e Lojista antes do crédito em conta.',
    financialImpact:
      'Altera o cálculo de capital de giro e de antecipação de recebíveis (já que o valor passível de cessão/antecipação passa a ser líquido do tributo segregado no Split Payment).',
    officialSource: 'Planalto — Lei Complementar nº 214/2025 (Reforma Tributária do Consumo)',
  },
  {
    id: 'reg-click-to-pay-passkeys-2027',
    era: 'chegando_2027',
    badge: 'MANDATO 2027',
    effectiveDate: 'Releases 2026.2 ➔ 2027.2',
    normCode: 'Visa / Mastercard / Elo — Click to Pay + Biometria Passkeys (FIDO2) + Fim do PAN Manual',
    title: '100% Tokenização E-Commerce, Click to Pay & Autenticação Biométrica Nativa (Payment Passkeys)',
    tracksAffected: ['cartao', 'contestacao_ce3', 'regras_2027_tempo'],
    whatChangesInPractice:
      'Convergência de Network Tokens (VTS/MDES/Elo), Click to Pay (EMV® Secure Remote Commerce) e Payment Passkeys (FIDO2/WebAuthn) para eliminar a digitação manual de 16 dígitos (PAN) e códigos OTP por SMS no checkout online.',
    technicalImpact:
      'Envio combinado de DPAN (Token) + TAVV/Cryptogram + 3DS 2.2/2.3 delegado com Passkey biométrica do dispositivo (Visa DAF / Mastercard DAA / Token Authentication), garantindo Liability Shift com zero redirecionamento para app bancário.',
    financialImpact:
      'Eleva a conversão de aprovação no e-commerce em +3% a +6% e derruba fraudes CNP para patamares próximos ao mundo físico (EMV Chip).',
    officialSource: 'EMVCo SRC / Visa & Mastercard 2027 Digital Commerce Roadmap',
  },
  {
    id: 'reg-pix-garantido-agentic-2028',
    era: 'horizonte_2028_2030',
    badge: '2028 ➔ 2030',
    effectiveDate: 'Horizonte 2028–2030',
    normCode: 'Agenda BC# + Agentic Commerce (Visa Intelligent Commerce / MC Agent Pay) + Drex',
    title: 'Pix Garantido/Parcelado, Comércio por Agentes de IA (Agentic Payments) & Liquidação Drex',
    tracksAffected: ['pix_auto_nfc', 'open_finance_drex', 'cartao', 'regras_2027_tempo'],
    whatChangesInPractice:
      'Três convergências para 2028+: (1) Padronização regulatória do Pix Parcelado/Garantido com garantia de crédito do PSP emissor e liquidação ao lojista; (2) Agentic Commerce, onde agentes de IA compram em nome do consumidor usando Network Tokens programáveis com limite, MCC e validade restritos; (3) Liquidação interbancária e colateralização instantânea via infraestrutura Drex.',
    technicalImpact:
      'Credenciais tokenizadas com metadados de delegação para Agentes de IA (Cryptographic Consent Proof no DE 48/62/TLV) e liquidação DvP (Delivery versus Payment) programável.',
    financialImpact:
      'Redefine a disputa pelo parcelado brasileiro (hoje ~50% do volume de cartões) e inaugura o checkout autônomo máquina-para-máquina (M2M / AI-to-Merchant).',
    officialSource: 'Banco Central do Brasil (Agenda BC#) / Visa & Mastercard Agentic Commerce Specs',
  },
];

const TRACK_META: Record<
  LabTrackId,
  {
    shortLabel: string;
    badge: string;
    title: string;
    subtitle: string;
    defaultAmount: number;
    actorLabels: Record<IsometricNodeId, { name: string; role: string }>;
    failures: { id: string; label: string; impactSummary: string }[];
  }
> = {
  cartao: {
    shortLabel: '1. Cartão (4 Bandeiras)',
    badge: '0100/0110',
    title: 'Cartão: Autorização Online, 3DS 2.2, Tokens & Captura',
    subtitle:
      'Em menos de 1,2 segundo, a compra sai da maquininha ou checkout, atravessa criptografia HSM, antifraude, switch da bandeira e motor de decisão do emissor.',
    defaultAmount: 180.0,
    actorLabels: {
      pos_client: { name: 'PAX S920 / Checkout', role: 'canal de captura' },
      sub_payfac: { name: 'PayFac / Gateway', role: 'subcredenciadora' },
      acquirer_psp: { name: 'Adquirente + HSM', role: 'credenciadora' },
      network_spi: { name: 'Visa / MC / Elo / Amex', role: 'bandeira (switch)' },
      issuer_receiver: { name: 'Banco Emissor', role: 'autorizador & ACS' },
      slc_b3_str: { name: 'Agenda Recebíveis', role: 'captura D+0' },
    },
    failures: [
      {
        id: 'none',
        label: '✓ Nenhuma falha',
        impactSummary: 'Aprovada (DE 39 = 00). Código de autorização gerado e captura confirmada.',
      },
      {
        id: 'saldo_51',
        label: 'Saldo / limite insuficiente (51)',
        impactSummary: 'Recusada pelo Emissor com DE 39 = 51 (Soft Decline). Permite retentativa inteligente.',
      },
      {
        id: 'fraude_59',
        label: 'Suspeita de fraude (59 / 05)',
        impactSummary: 'Bloqueada pelo motor antifraude do Emissor. Sem 3DS/Token, o atrito derruba a conversão.',
      },
      {
        id: 'timeout_stip',
        label: 'Emissor fora do ar (STIP)',
        impactSummary: 'Emissor não respondeu em 1.800ms. Bandeira assume via Stand-In Processing (STIP) e envia Advice 0120.',
      },
      {
        id: 'reversal_0400',
        label: 'Resposta perdida na rede (0400)',
        impactSummary: 'Timeout de socket na volta: Adquirente dispara Desfazimento Automático MTI 0400 para liberar o limite do portador.',
      },
    ],
  },
  clearing_slc: {
    shortLabel: '2. Liquidação & SLC/B3',
    badge: 'D+0 ➔ D+1',
    title: 'Clearing & Liquidação: Outgoing (.CTF/.IPM/.TXT) ➔ Registradora B3 ➔ CIP/SLC ➔ STR',
    subtitle:
      'Como a autorização vira dinheiro real: geração do arquivo de Outgoing D+0, registro da Unidade de Recebível (Res. BCB 264), grade ASLC026 na CIP/Núclea e liquidação no STR do Banco Central.',
    defaultAmount: 1200.0,
    actorLabels: {
      pos_client: { name: 'Lojista (EC)', role: 'domicílio bancário' },
      sub_payfac: { name: 'Motor Outgoing D+0', role: '.CTF / .IPM / .TXT' },
      acquirer_psp: { name: 'Adquirente', role: 'liquidante CIP' },
      network_spi: { name: 'Bandeira (Base II/GCMS)', role: 'clearing & fee' },
      issuer_receiver: { name: 'Banco Emissor', role: 'devedor no STR' },
      slc_b3_str: { name: 'B3 + CIP/SLC + STR', role: 'registradora & Bacen' },
    },
    failures: [
      {
        id: 'none',
        label: '✓ Nenhuma falha',
        impactSummary: 'Lote aceito sem críticas, UR validada na B3 e liquidada na 1ª janela da CIP/STR às 08h30.',
      },
      {
        id: 'downgrade_tid',
        label: 'Perda do TID / Banknet (Downgrade)',
        impactSummary: 'Campo DE 62.2 / DE 63 omitido no Outgoing: transação sofre Downgrade para EIRF/Standard (+65 bps).',
      },
      {
        id: 'reject_trailer',
        label: 'Erro de Trailer / Luhn (Reject D+0)',
        impactSummary: 'Crítica EP747 / T112 / TE01 Reg 09 rejeita o registro em T+0. Exige correção e reenvio em D+1.',
      },
      {
        id: 'slc_gravame',
        label: 'Divergência de Gravame B3 (ASLC026E)',
        impactSummary: 'UR possuía cessão fiduciária ativa para outro banco: CIP rejeita linha com erro ASLC026E.',
      },
    ],
  },
  contestacao_ce3: {
    shortLabel: '3. Contestação & CE 3.0',
    badge: 'CBK / CE 3.0',
    title: 'Contestação, Chargeback, Compelling Evidence 3.0 & Pre-Dispute (RDR)',
    subtitle:
      'O que acontece quando o portador não reconhece a compra na fatura: alerta pré-disputa, First Chargeback (TC 15 / 1442 / TE15), reversão com Compelling Evidence 3.0 e Liability Shift.',
    defaultAmount: 450.0,
    actorLabels: {
      pos_client: { name: 'Portador / App', role: 'contesta na fatura' },
      sub_payfac: { name: 'Lojista (Dossiê CE 3.0)', role: 'evidências & logs' },
      acquirer_psp: { name: 'Adquirente Disputas', role: 'defesa & reapres.' },
      network_spi: { name: 'VROL / MCOM / Elo', role: 'motor de disputas' },
      issuer_receiver: { name: 'Emissor Backoffice', role: 'abre chargeback' },
      slc_b3_str: { name: 'Débito/Crédito SLC', role: 'ajuste financeiro' },
    },
    failures: [
      {
        id: 'none',
        label: '✓ Defesa CE 3.0 Vencedora',
        impactSummary: 'Lojista apresenta 2 compras históricas não disputadas (>120 dias) com mesmo IP/Device ID. Chargeback revertido!',
      },
      {
        id: 'sem_3ds_perda',
        label: 'Sem 3DS e sem evidência (Perda)',
        impactSummary: 'Transação ECI 07 sem 3DS e sem histórico CE 3.0: lojista perde o valor da venda + Dispute Fee.',
      },
      {
        id: 'liability_shift_3ds',
        label: 'Bloqueio automático por 3DS (ECI 05)',
        impactSummary: 'Compra autenticada com 3DS 2.2 (CAVV v9): VROL/MCOM bloqueia o chargeback de fraude (Liability do Emissor).',
      },
    ],
  },
  pix_spi: {
    shortLabel: '4. Pix Instantâneo (SPI)',
    badge: 'pacs.008',
    title: 'Pix por Dentro: BR Code, Consulta DICT, Mensagem ISO 20022 (pacs.008) & Liquidação no SPI',
    subtitle:
      'Da leitura do QR Code ou chave Pix até o crédito definitivo na conta do recebedor em menos de 1,5 segundo, liquidando centavo a centavo nas Contas PI dentro do Banco Central.',
    defaultAmount: 250.0,
    actorLabels: {
      pos_client: { name: 'App Pagador', role: 'lê QR / digita chave' },
      sub_payfac: { name: 'DICT (Bacen)', role: 'diretório de chaves' },
      acquirer_psp: { name: 'PSP Pagador', role: 'debita & assina XML' },
      network_spi: { name: 'SPI (Banco Central)', role: 'liquida Contas PI' },
      issuer_receiver: { name: 'PSP Recebedor', role: 'credita lojista' },
      slc_b3_str: { name: 'Webhook Lojista', role: 'baixa pedido < 2s' },
    },
    failures: [
      {
        id: 'none',
        label: '✓ Nenhuma falha',
        impactSummary: 'Chave resolvida no DICT, pacs.008 liquidado no SPI em 920ms e confirmação pacs.002 entregue.',
      },
      {
        id: 'chave_inexistente',
        label: 'Chave não existe no DICT (404)',
        impactSummary: 'DICT retorna HTTP 404 Not Found. Transação interrompida antes de debitar a conta do pagador.',
      },
      {
        id: 'limite_noturno',
        label: 'Acima do limite noturno (R$ 1.000)',
        impactSummary: 'Pix às 22h15 acima do limite noturno padrão (IN BCB 331): bloqueado no PSP Pagador.',
      },
      {
        id: 'bloqueio_cautelar',
        label: 'Bloqueio cautelar (72h — Res. 147)',
        impactSummary: 'SPI liquida, mas o motor antifraude do PSP Recebedor retém o valor por até 72h para análise de fraude.',
      },
    ],
  },
  pix_auto_nfc: {
    shortLabel: '5. Pix Automático & NFC',
    badge: '2026 / 2027',
    title: 'Pix Automático (Recorrência B2C) & Pix por Aproximação (NFC via Open Finance JSR)',
    subtitle:
      'Como o Pix entra no território das assinaturas recorrentes (streaming, escolas, SaaS) com autorização única (pain.013) e no pagamento por aproximação NFC na maquininha.',
    defaultAmount: 89.9,
    actorLabels: {
      pos_client: { name: 'Cliente (App / NFC)', role: 'autoriza 1x c/ biometria' },
      sub_payfac: { name: 'Carteira / ITP (JSR)', role: 'iniciador FIDO2' },
      acquirer_psp: { name: 'PSP Recebedor (Empresa)', role: 'agenda cobrança D-2' },
      network_spi: { name: 'SPI / Open Finance', role: 'roteia pain.013/pacs.008' },
      issuer_receiver: { name: 'Banco do Cliente', role: 'provisiona & debita' },
      slc_b3_str: { name: 'Conciliação SaaS/EC', role: 'confirmação D+0' },
    },
    failures: [
      {
        id: 'none',
        label: '✓ Nenhuma falha',
        impactSummary: 'Mandato ativo: cobrança agendada em D-2, notificada ao cliente em D-1 e liquidada às 06h00 do vencimento.',
      },
      {
        id: 'saldo_retentativa',
        label: 'Sem saldo na 1ª tentativa (Retry Pix Auto)',
        impactSummary: 'Sem saldo às 06h00: PSP executa retentativa padronizada intra-dia/D+1 conforme regra do mandato.',
      },
      {
        id: 'revogacao_mandato',
        label: 'Cliente cancelou autorização no app',
        impactSummary: 'Pagador revogou o mandato do Pix Automático antes do vencimento (pain.014). Cobrança recusada.',
      },
    ],
  },
  med_seguranca: {
    shortLabel: '6. Devolução & MED 2.0',
    badge: 'MED 2.0',
    title: 'Devolução Pix, MED 2.0 (Rastreio Multinível de Contas Laranja) & BC Protege+',
    subtitle:
      'A engenharia de defesa contra golpes no Pix: abertura de notificação de infração no DICT, bloqueio cautelar e o novo grafo multinível do MED 2.0 (2026/2027) que rastreia o dinheiro além da 1ª conta.',
    defaultAmount: 1500.0,
    actorLabels: {
      pos_client: { name: 'Vítima (Autoatendimento)', role: 'aciona MED no app' },
      sub_payfac: { name: 'PSP da Vítima', role: 'registra infração DICT' },
      acquirer_psp: { name: 'DICT + Grafo MED 2.0', role: 'rastreia saltos SPI' },
      network_spi: { name: 'Conta Nível 1 (Laranja)', role: 'bloqueio parcial' },
      issuer_receiver: { name: 'Contas Nível 2 e 3', role: 'bloqueio em cascata' },
      slc_b3_str: { name: 'pacs.004 Devolução', role: 'estorno p/ vítima' },
    },
    failures: [
      {
        id: 'none',
        label: '✓ MED 2.0 com Rastreio Multinível',
        impactSummary: 'Fraudador pulverizou para 2 contas seguintes, mas o grafo MED 2.0 bloqueou o saldo nos níveis 1 e 2 e devolveu via pacs.004.',
      },
      {
        id: 'saque_esvaziado',
        label: 'MED 1.0 Antigo (1ª conta já zerada)',
        impactSummary: 'No modelo antigo (restrito ao 1º salto), a conta nível 1 já havia transferido o saldo em 15 segundos, frustrando a recuperação.',
      },
    ],
  },
  open_finance_drex: {
    shortLabel: '7. Open Finance & Drex',
    badge: 'JSR / DREX',
    title: 'Open Finance (Iniciação de Pagamento JSR sem Redirecionamento) & Liquidação Tokenizada',
    subtitle:
      'Como o Iniciador de Transação de Pagamento (ITP) vincula a biometria FIDO2 do aparelho uma única vez e dispara pagamentos diretos da conta bancária sem sair do checkout.',
    defaultAmount: 320.0,
    actorLabels: {
      pos_client: { name: 'Cliente (Biometria)', role: 'assina FIDO2 Passkey' },
      sub_payfac: { name: 'Checkout Lojista', role: 'aciona ITP via SDK' },
      acquirer_psp: { name: 'Iniciador (ITP)', role: 'POST /pix/payments' },
      network_spi: { name: 'Diretório Open Finance', role: 'mTLS & FAPI certificados' },
      issuer_receiver: { name: 'Detentora de Conta', role: 'valida FIDO2 & debita' },
      slc_b3_str: { name: 'Liquidação SPI / Drex', role: 'crédito instantâneo' },
    },
    failures: [
      {
        id: 'none',
        label: '✓ Jornada Sem Redirecionamento (JSR)',
        impactSummary: 'Biometria FIDO2 validada localmente em 1,4s sem abrir o app do banco. Conversão +28% maior que o redirect antigo.',
      },
      {
        id: 'consent_expired',
        label: 'Vínculo JSR expirado / limite excedido',
        impactSummary: 'Valor acima do limite do vínculo JSR: Detentora solicita step-up com redirecionamento seguro ao app.',
      },
    ],
  },
  regras_2027_tempo: {
    shortLabel: '8. Regras no Tempo & 2027+',
    badge: '2021 ➔ 2030',
    title: 'Regras no Tempo & Radar 2027–2030: Split Tributário (LC 214), MED 2.0, Passkeys & Agentic AI',
    subtitle:
      'Simule a mesma operação em diferentes épocas regulatórias (2021, 2023, 2026, 2027 e 2028+) e veja exatamente como as leis do Banco Central, a Reforma Tributária e os mandatos das bandeiras alteram mensagens e dinheiro.',
    defaultAmount: 500.0,
    actorLabels: {
      pos_client: { name: 'Consumidor / Agente IA', role: 'inicia pagamento' },
      sub_payfac: { name: 'Checkout + NF-e/NFC-e', role: 'vínculo fiscal LC 214' },
      acquirer_psp: { name: 'Adquirente / PSP', role: 'motor Split Tributário' },
      network_spi: { name: 'Bandeira / SPI Bacen', role: 'clearing & liquidação' },
      issuer_receiver: { name: 'Receita / Comitê IBS', role: 'recebe CBS/IBS D+0' },
      slc_b3_str: { name: 'Conta Lojista', role: 'recebe líquido fiscal' },
    },
    failures: [
      {
        id: 'none',
        label: '✓ Era 2027+ (Split Tributário + Passkey)',
        impactSummary: 'Transação autenticada via Passkey FIDO2 e liquidada com segregação automática de CBS/IBS (LC 214/2025) na fonte.',
      },
      {
        id: 'era_2022_pre_cap',
        label: 'Comparar com Era 2022 (Pré-BCB 304)',
        impactSummary: 'Sem teto único de 0,50%/0,70% no débito/pré-pago, sem CAVV v9 AES e sem Split Tributário automático.',
      },
    ],
  },
};

export function PaygramaInteractiveLab() {
  const [activeTrack, setActiveTrack] = useState<LabTrackId>('cartao');
  const [amount, setAmount] = useState<number>(180.0);
  const [operation, setOperation] = useState<'compra' | 'estorno' | 'recorrencia' | 'crossborder'>('compra');
  const [channel, setChannel] = useState<'pos_chip' | 'softpos_nfc' | 'ecom_3ds' | 'wallet_token'>('pos_chip');
  const [threeDsChallenge, setThreeDsChallenge] = useState<'frictionless' | 'challenge'>('frictionless');
  const [modality, setModality] = useState<'debito' | 'credito_1x' | 'parcelado'>('credito_1x');
  const [installments, setInstallments] = useState<number>(6);
  const [brand, setBrand] = useState<'visa' | 'mastercard' | 'elo' | 'amex'>('visa');
  const [issuerName, setIssuerName] = useState<string>('Itaú');
  const [acquirerName, setAcquirerName] = useState<string>('Getnet');
  const [acquiringModel, setAcquiringModel] = useState<'direto_4p' | 'payfac_sub' | 'on_us' | 'tres_partes'>('direto_4p');
  const [showParticipantsAccordion, setShowParticipantsAccordion] = useState<boolean>(false);
  const [injectedFailure, setInjectedFailure] = useState<string>('none');

  // Time-travel era selector for track 8 (and global filter)
  const [selectedEraDate, setSelectedEraDate] = useState<string>('2027-06-01');
  const [eraFilter, setEraFilter] = useState<'ALL' | 'em_vigor' | 'chegando_2027' | 'horizonte_2028_2030'>('ALL');

  // Step 2: View mode & Player
  const [diagramMode, setDiagramMode] = useState<'arquitetura' | 'sequencia'>('arquitetura');
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [expandAboutStep, setExpandAboutStep] = useState<boolean>(true);
  const [expandTechFields, setExpandTechFields] = useState<boolean>(true);

  // Step 3: Money & D+1 Anticipation
  const [anticipateToD1, setAnticipateToD1] = useState<boolean>(false);
  const [monthlyAnticipationRate, setMonthlyAnticipationRate] = useState<number>(1.89);

  // Switch track defaults cleanly
  const handleSelectTrack = (t: LabTrackId) => {
    setActiveTrack(t);
    setAmount(TRACK_META[t].defaultAmount);
    setInjectedFailure('none');
    setCurrentStepIdx(0);
    setIsPlaying(false);
  };

  // Build dynamic message steps for the active track & scenario
  const steps: LabMessageStep[] = useMemo(() => {
    const amtCents = Math.round(amount * 100)
      .toString()
      .padStart(12, '0');
    const brandLabel =
      brand === 'visa'
        ? 'Visa (VisaNet)'
        : brand === 'mastercard'
        ? 'Mastercard (Banknet)'
        : brand === 'elo'
        ? 'Elo (STI)'
        : 'Amex (GNS)';

    if (activeTrack === 'cartao') {
      const entryMode =
        channel === 'pos_chip'
          ? '051 (Chip EMV + PIN)'
          : channel === 'softpos_nfc'
          ? '071 (Contactless NFC MPoC)'
          : channel === 'wallet_token'
          ? '071 / 810 (Network Token DPAN)'
          : '810 (E-Commerce Credential / 3DS)';

      const list: LabMessageStep[] = [];

      if (channel === 'ecom_3ds') {
        list.push({
          stepNo: 1,
          stageTitle: 'ETAPA 1 · AUTENTICAÇÃO 3-D SECURE 2.2 (EMVCo)',
          elapsedLabel: '0 ms',
          codeBadge: threeDsChallenge === 'frictionless' ? 'AReq/ARes · ECI 05' : 'CReq/CRes · Desafio App',
          title:
            threeDsChallenge === 'frictionless'
              ? '3DS 2.2 Frictionless (Aprovação Silenciosa c/ CAVV v9)'
              : '3DS 2.2 Challenge (Push Biometria no App do Emissor)',
          fromNode: 'pos_client',
          toNode: 'issuer_receiver',
          fromLabel: 'Checkout 3DSS',
          toLabel: `${issuerName} (ACS)`,
          status: 'normal',
          systemHops: `Checkout Browser/SDK ➔ 3DS Server (3DSS) ➔ Directory Server (${brand.toUpperCase()}) ➔ ACS (${issuerName})`,
          plainExplanation:
            threeDsChallenge === 'frictionless'
              ? `O checkout envia mais de 100 sinais do dispositivo (IP, Device ID, histórico) ao servidor ACS do ${issuerName}. Como o risco é baixo, o banco autentica silenciosamente sem interromper o cliente e devolve o criptograma CAVV v9 (AES-128).`
              : `O ACS do ${issuerName} detecta compra atípica e envia desafio CReq para o cliente confirmar com FaceID/Biometria no app do banco. Após confirmar, gera o criptograma CAVV v9.`,
          deepDiveTitle: 'Liability Shift (Transferência de Responsabilidade de Fraude)',
          deepDiveNormative:
            'Quando o Emissor retorna ECI 05 (Visa/Elo) ou ECI 02 (Mastercard) acompanhado do CAVV/AAV de 28 bytes (codificado em Base64 ou Hex no DE 126.9 / DE 48 PDS 43), a responsabilidade financeira por eventual chargeback de fraude (10.4 / 4837) passa do Lojista para o Banco Emissor.',
          normativeSource: 'EMV® 3-D Secure Protocol v2.2.0 + Visa Core Rules / Manual Elo 3DS',
          fields: [
            { code: 'messageType', name: 'Mensagem JSON EMV 3DS', value: 'AReq ➔ ARes (v2.2.0)', note: 'TLS 1.3 mTLS' },
            { code: 'transStatus', name: 'Resultado Autenticação', value: threeDsChallenge === 'frictionless' ? 'Y (Frictionless)' : 'C ➔ Y (Challenge OK)', note: 'Autenticado' },
            { code: 'ECI', name: 'Electronic Commerce Indicator', value: brand === 'mastercard' ? '02 (Autenticado)' : '05 (Autenticado)', note: 'Garante Liability Shift' },
            { code: 'CAVV v9', name: 'Cardholder Auth Verification Value', value: '09A7F4C21190E8B344D1...', note: 'Criptograma AES-128' },
            { code: 'dsTransID', name: 'UUID Directory Server', value: 'f3c8e1a0-72b1-4d9a-9c0e-182736455661', note: 'Vai p/ Outgoing TCR 5' },
          ],
        });
      }

      list.push({
        stepNo: list.length + 1,
        stageTitle: 'ETAPA 2 · CAPTURA & PEDIDO DE AUTORIZAÇÃO (ISO 8583)',
        elapsedLabel: channel === 'ecom_3ds' ? '140 ms' : '0 ms',
        codeBadge: '0100 · Pedido de autorização',
        title: '0100 · Pedido de autorização enviado pelo terminal/canal',
        fromNode: 'pos_client',
        toNode: acquiringModel === 'payfac_sub' ? 'sub_payfac' : 'acquirer_psp',
        fromLabel: channel === 'pos_chip' ? 'PAX S920 (POS)' : 'Checkout / SoftPOS',
        toLabel: acquiringModel === 'payfac_sub' ? 'PayFac (Sub)' : acquirerName,
        status: 'normal',
        systemHops: `App de Pagamento ➔ TLS 1.3 (mTLS) ➔ Gateway de Captura ➔ Switch ISO 8583 (${acquirerName})`,
        plainExplanation: `O cliente ${
          channel === 'pos_chip'
            ? 'insere o cartão com chip e digita a senha (PIN Block DUKPT)'
            : channel === 'softpos_nfc'
            ? 'aproxima o cartão/celular no SoftPOS NFC'
            : 'confirma a compra online'
        }. O terminal monta a mensagem ISO 8583 MTI 0100 pedindo autorização de R$ ${amount.toFixed(2)} em ${
          modality === 'debito' ? 'Débito' : modality === 'credito_1x' ? 'Crédito à vista' : `Crédito Parcelado ${installments}x`
        }.`,
        deepDiveTitle: 'Anatomia da Mensagem ISO 8583 (0100 Request)',
        deepDiveNormative:
          'Toda mensagem ISO 8583 inicia com 4 dígitos de MTI (0100 = Authorization Request) seguidos do Bitmap primário/secundário (64 ou 128 bits) que indica quais Data Elements (DEs) estão presentes no payload.',
        normativeSource: 'ISO 8583-1 + Especificação Técnica de Mensageria Online das Bandeiras',
        fields: [
          { code: 'MTI', name: 'Message Type Indicator', value: '0100', note: 'Pedido de Autorização' },
          { code: 'Bitmap', name: 'Mapa de Bits Hex', value: '7234058020C18004', note: 'Bits ativos na mensagem' },
          { code: 'DE 02', name: 'PAN / Network Token', value: channel === 'wallet_token' ? '400000******9821 (DPAN Token)' : '453211******8842 (FPAN)', note: 'Identificador do cartão' },
          { code: 'DE 03', name: 'Processing Code', value: modality === 'debito' ? '002000 (Compra Débito)' : '003000 (Compra Crédito)', note: 'Tipo de operação' },
          { code: 'DE 04', name: 'Valor da Transação', value: amtCents, note: `R$ ${amount.toFixed(2)} em centavos` },
          { code: 'DE 22', name: 'POS Entry Mode', value: entryMode, note: 'Modo de captura e PIN' },
          { code: 'DE 48 / 112', name: 'Parcelamento Brasil', value: modality === 'parcelado' ? `Parcelado Loja ${String(installments).padStart(2, '0')}x` : 'À Vista (01x)', note: 'Condição comercial' },
        ],
      });

      if (acquiringModel === 'payfac_sub') {
        list.push({
          stepNo: list.length + 1,
          stageTitle: 'ETAPA 2B · ENRIQUECIMENTO DE SUBCREDENCIADORA (PAYFAC)',
          elapsedLabel: '24 ms',
          codeBadge: '0100 · Enriquecido c/ PF ID',
          title: '0100 · Subcredenciadora injeta CNPJ do Sublojista e PF ID',
          fromNode: 'sub_payfac',
          toNode: 'acquirer_psp',
          fromLabel: 'PayFac / Sub',
          toLabel: acquirerName,
          status: 'normal',
          systemHops: `Switch PayFac ➔ Motor de Split & Cadastro Submerchant ➔ Link Dedicado ➔ Autorizador (${acquirerName})`,
          plainExplanation:
            'Como o lojista opera via Subcredenciadora (PayFac), ela injeta na mensagem o Payment Facilitator ID, o CNPJ/CPF real do sublojista, o MCC e o CEP/Código IBGE antes de repassar à Adquirente liquidante.',
          deepDiveTitle: 'Obrigatoriedade de Identificação do Subcredenciado',
          deepDiveNormative:
            'As bandeiras exigem que o nome fantasia no DE 43 siga o formato <PF*NOME SUBLOJISTA> e que o documento fiscal (CNPJ/CPF) e o Submerchant ID sejam enviados tanto na autorização quanto no Outgoing (Visa TCR 0/1/5, Mastercard PDS 0208, Elo Reg 08).',
          normativeSource: 'Manual de Subcredenciadores Visa / Mastercard AN 4910 / Elo Serviço 10 Reg 08',
          fields: [
            { code: 'DE 42', name: 'Card Acceptor ID Code', value: 'PF901122334455', note: 'MID do Sublojista' },
            { code: 'DE 43', name: 'Nome no Extrato (DBA)', value: 'PF*LOJA MODELO SP BRA', note: 'Prefixo PF* obrigatório' },
            { code: 'DE 48 / 104', name: 'Payment Facilitator ID & CNPJ', value: 'PFID=10928374 · CNPJ=12345678000199', note: 'Rastreabilidade Bacen/BRAM' },
          ],
        });
      }

      list.push({
        stepNo: list.length + 1,
        stageTitle: 'ETAPA 3 · CRIPTOGRAFIA HSM & ROTEAMENTO À BANDEIRA',
        elapsedLabel: '48 ms',
        codeBadge: '0100 · Encaminhada à bandeira',
        title: `0100 · ${acquirerName} traduz PIN no HSM e envia à ${brandLabel}`,
        fromNode: 'acquirer_psp',
        toNode: 'network_spi',
        fromLabel: acquirerName,
        toLabel: brandLabel,
        status: 'normal',
        systemHops: `Switch Autorizador (${acquirerName}) ➔ HSM Thales PayShield 10k (Comando CA: DUKPT ➔ ZPK) ➔ Appliance MPLS (${brand.toUpperCase()})`,
        plainExplanation: `A adquirente (${acquirerName}) chama seu módulo criptográfico HSM em < 4ms para traduzir o PIN Block da chave do terminal (DUKPT) para a chave de zona da bandeira (ZPK), consulta a tabela de BINs (ARDEF/MPE T068) e dispara o pacote pela malha MPLS para a ${brandLabel}.`,
        deepDiveTitle: 'Tradução Criptográfica HSM (Zero PIN em Claro)',
        deepDiveNormative:
          'Pelo requisito PCI PIN Security, a senha do portador jamais existe em texto aberto na memória RAM do servidor da adquirente. O comando CA do HSM descriptografa sob a BDK e re-criptografa sob a ZPK dentro do hardware blindado FIPS 140-2 Nível 3.',
        normativeSource: 'PCI PIN Security Requirements v3.1 + Visa EAS / Mastercard MIP Specs',
        fields: [
          { code: 'DE 32', name: 'Acquiring Institution ID', value: '00419283', note: 'BIN/ICA da Adquirente' },
          { code: 'DE 52', name: 'PIN Block Traduzido (ZPK)', value: 'A94F81C022E17B04', note: 'ISO 9564 Formato 0 / 4 AES' },
          { code: 'DE 55', name: 'Bloco EMV TLV', value: '9F26(ARQC)=8F11C2D4A900B112 · 95(TVR)=0000008000', note: 'Criptograma do Chip' },
        ],
      });

      list.push({
        stepNo: list.length + 1,
        stageTitle: 'ETAPA 4 · SWITCHING DA BANDEIRA & ROTEAMENTO AO EMISSOR',
        elapsedLabel: '96 ms',
        codeBadge: injectedFailure === 'timeout_stip' ? 'STIP · Timeout Emissor' : '0100 · Encaminhada ao emissor',
        title:
          injectedFailure === 'timeout_stip'
            ? `Timeout do ${issuerName}: ${brandLabel} aciona Stand-In Processing (STIP)`
            : `0100 · ${brandLabel} carimba Lifecycle ID (TID/Banknet) e entrega ao ${issuerName}`,
        fromNode: 'network_spi',
        toNode: 'issuer_receiver',
        fromLabel: brandLabel,
        toLabel: issuerName,
        status: injectedFailure === 'timeout_stip' ? 'warning' : 'normal',
        systemHops: `Switch Central (${brandLabel}) ➔ Detokenização Vault (se Token) ➔ Score de Risco da Rede ➔ Link MPLS Emissor (${issuerName})`,
        plainExplanation:
          injectedFailure === 'timeout_stip'
            ? `O link do ${issuerName} não respondeu dentro do SLA de 1.800ms. Para não perder a venda na fila do caixa, o motor Stand-In (STIP) da ${brandLabel} avalia os limites delegados pelo banco e aprova em nome do emissor!`
            : `A ${brandLabel} gera o identificador único global do ciclo de vida da transação (Visa Transaction ID DE 62.2 / Mastercard Banknet Reference DE 63), calcula um score de fraude em tempo real na rede e entrega ao ${issuerName}.`,
        deepDiveTitle: 'O Elo de Ouro: Transaction ID (DE 62.2) & Banknet Reference (DE 63)',
        deepDiveNormative:
          'Este identificador gerado pelo switch da bandeira na autorização PRECISA ser gravado no banco de dados da adquirente e devolvido intacto no arquivo de Outgoing (TCR 0 / IPM PDS 0158 / Elo Reg 00). Se for perdido, a bandeira aplica Downgrade de intercâmbio e tarifa de integridade (GDIP).',
        normativeSource: 'Visa Base I / Base II Data Integrity + Mastercard GCMS Reference Manual',
        fields: [
          {
            code: brand === 'mastercard' ? 'DE 63' : 'DE 62.2',
            name: 'Lifecycle ID (TID / Banknet)',
            value: brand === 'mastercard' ? 'MCC918273 · 1114' : '306198374620194',
            note: 'Obrigatório preservar p/ Outgoing',
          },
          { code: 'DE 48 / 62.23', name: 'Product ID (PID) Identificado', value: modality === 'debito' ? 'VD (Visa Debit — Teto BCB 304)' : 'I (Visa Infinite)', note: 'Define tabela de intercâmbio' },
          { code: 'Network Score', name: 'Score Antifraude da Bandeira', value: '14 / 99 (Baixo Risco)', note: 'Injetado p/ auxiliar Emissor' },
        ],
      });

      const respCode =
        injectedFailure === 'saldo_51'
          ? '51 (Saldo Insuficiente)'
          : injectedFailure === 'fraude_59'
          ? '59 (Suspeita de Fraude)'
          : '00 (Aprovada)';

      list.push({
        stepNo: list.length + 1,
        stageTitle: 'ETAPA 5 · DECISÃO DO EMISSOR & RESPOSTA (0110)',
        elapsedLabel: injectedFailure === 'timeout_stip' ? '1.820 ms' : '340 ms',
        codeBadge:
          injectedFailure === 'saldo_51'
            ? '0110 · Recusada (51)'
            : injectedFailure === 'fraude_59'
            ? '0110 · Recusada (59)'
            : '0110 · Aprovada (00)',
        title:
          injectedFailure === 'saldo_51'
            ? `0110 · ${issuerName} recusa por limite/saldo insuficiente (DE 39 = 51)`
            : injectedFailure === 'fraude_59'
            ? `0110 · ${issuerName} bloqueia por regra antifraude (DE 39 = 59)`
            : `0110 · ${issuerName} valida ARQC no HSM, reserva limite e aprova (DE 39 = 00)`,
        fromNode: 'issuer_receiver',
        toNode: 'acquirer_psp',
        fromLabel: issuerName,
        toLabel: acquirerName,
        status: injectedFailure === 'saldo_51' || injectedFailure === 'fraude_59' ? 'error' : 'normal',
        systemHops: `HSM Emissor (Valida ARQC/PIN/CAVV) ➔ Motor Antifraude ML ➔ Core Ledger (Shadow Hold) ➔ Bandeira ➔ ${acquirerName}`,
        plainExplanation:
          injectedFailure === 'saldo_51'
            ? `O core bancário do ${issuerName} verificou o saldo/limite disponível do portador e constatou valor insuficiente para R$ ${amount.toFixed(2)}. Retorna MTI 0110 com DE 39 = 51.`
            : injectedFailure === 'fraude_59'
            ? `O motor antifraude do ${issuerName} reprovou o score da transação e retornou MTI 0110 com DE 39 = 59 (Suspected Fraud).`
            : `O HSM do ${issuerName} confere o criptograma ARQC do chip (e gera o ARPC de resposta na Tag 91), sensibiliza o limite do cliente (Shadow Hold) e retorna MTI 0110 Aprovada (DE 39 = 00, Auth Code = 849201).`,
        deepDiveTitle: 'Hard Decline vs Soft Decline (Regras de Retentativa)',
        deepDiveNormative:
          'Códigos como 51 (Insufficient Funds) ou 91 (Issuer Inoperative) são Soft Declines e permitem retentativa espaçada. Já códigos como 04, 14, 41, 43, 57 ou Category 1 (Mastercard AN 3440 / Visa Retry Rules) nunca devem ser retentados automaticamente sob pena de tarifa punitiva por excesso de retentativas.',
        normativeSource: 'Visa Core Rules (Retry Logic) / Mastercard Transaction Processing Rules',
        fields: [
          { code: 'MTI', name: 'Message Type Indicator', value: '0110', note: 'Resposta de Autorização' },
          { code: 'DE 38', name: 'Authorization ID Response', value: injectedFailure === 'saldo_51' || injectedFailure === 'fraude_59' ? '(vazio)' : '849201', note: 'Código de 6 posições' },
          { code: 'DE 39', name: 'Response Code', value: respCode, note: 'Decisão final do Emissor' },
          { code: 'DE 55 (Tag 91)', name: 'Issuer Auth Data (ARPC)', value: '33A8F019C2004E110000', note: 'Autentica o banco perante o Chip' },
        ],
      });

      if (injectedFailure === 'reversal_0400') {
        list.push({
          stepNo: list.length + 1,
          stageTitle: 'ETAPA 6 · FALHA DE REDE & DESFAZIMENTO AUTOMÁTICO (0400/0420)',
          elapsedLabel: '1.950 ms',
          codeBadge: '0400 · Auto-Reversal',
          title: `0400 · Queda de conexão com o POS: ${acquirerName} estorna o limite em tempo real`,
          fromNode: 'acquirer_psp',
          toNode: 'issuer_receiver',
          fromLabel: acquirerName,
          toLabel: issuerName,
          status: 'error',
          systemHops: `Timeout Timer (${acquirerName}) ➔ Fila SAF (Store-and-Forward) ➔ MTI 0400/0420 ➔ ${brandLabel} ➔ ${issuerName} (Libera Hold)`,
          plainExplanation:
            'A resposta 0110 não chegou à maquininha por queda de sinal 4G. Para que o cliente não fique com o limite preso no cartão sem o cupom impresso, a adquirente dispara imediatamente o Desfazimento Automático (MTI 0400) referenciando o DE 90 original.',
          deepDiveTitle: 'Por que o Auto-Reversal (0400) evita multa de Data Integrity?',
          deepDiveNormative:
            'Autorizações aprovadas que nunca são capturadas nem revertidas via 0400 geram "Ghost Authorizations" (limite bloqueado por 7 a 30 dias no emissor) e disparam a tarifa Visa Misuse of Authorization System Fee / Mastercard Authorization Integrity Fee.',
          normativeSource: 'ISO 8583 Reversal Advice (0400/0420) + Visa Authorization Integrity Rules',
          fields: [
            { code: 'MTI', name: 'Message Type Indicator', value: '0400', note: 'Acquirer Reversal Request' },
            { code: 'DE 39', name: 'Reversal Reason', value: '68 (Response Received Too Late)', note: 'Timeout no terminal' },
            { code: 'DE 90', name: 'Original Data Elements', value: '0100 · STAN 481920 · 1119104215', note: 'Chave exata da 0100 original' },
          ],
        });
      } else if (injectedFailure !== 'saldo_51' && injectedFailure !== 'fraude_59') {
        list.push({
          stepNo: list.length + 1,
          stageTitle: 'ETAPA 6 · CONFIRMAÇÃO DE CAPTURA & AGENDA DE RECEBÍVEIS',
          elapsedLabel: '690 ms',
          codeBadge: '0220 · Captura & Agenda',
          title: '0220 · Comprovante impresso, venda capturada e agendada para o Outgoing D+0',
          fromNode: 'acquirer_psp',
          toNode: 'slc_b3_str',
          fromLabel: acquirerName,
          toLabel: 'Fila Outgoing & Agenda EC',
          status: 'normal',
          systemHops: `Confirmação POS (0220) ➔ Ledger de Captura (${acquirerName}) ➔ Agenda de Recebíveis (UR B3/CERC) ➔ Fila Outgoing D+0`,
          plainExplanation: `O terminal recebe o código 849201, imprime o comprovante e confirma a captura. A venda entra na Agenda de Recebíveis do lojista e na fila do lote noturno de Outgoing (${
            brand === 'visa' ? 'Base II .CTF' : brand === 'mastercard' ? 'GCMS .IPM' : brand === 'elo' ? 'Serviço 10 .TXT' : 'CAS .CAS'
          }).`,
          deepDiveTitle: 'Transição do Mundo Online (Real-Time) para o Mundo Batch (Clearing D+0)',
          deepDiveNormative:
            'No modelo Dual-Message (crédito e débito com bandeira), a autorização 0100/0110 apenas reserva o limite. O dinheiro só se move quando a adquirente inclui a transação capturada no arquivo de Outgoing dentro da janela de cutoff do dia.',
          normativeSource: 'Visa Base II Clearing Overview / Mastercard IPM Clearing Guide / Elo Serviço 10',
          fields: [
            { code: 'Status Captura', name: 'Estado no Switch', value: 'CAPTURED_READY_FOR_OUTGOING', note: 'Elegível ao cutoff das 21h00' },
            { code: 'ARN (23 dígitos)', name: 'Acquirer Reference Number', value: '74532116323000012345672', note: 'Com dígito verificador Luhn' },
            { code: 'Tabela Outgoing', name: 'Registro que será gerado', value: brand === 'visa' ? 'TC 05 (TCR 0 + TCR 1 + TCR 2 BR + TCR 5/7)' : brand === 'mastercard' ? 'MTI 1240 (Func 200 + PDS 0195)' : 'TE 05 (Reg 00 + 01 + 02 + 07)', note: '168 bytes / TLV' },
          ],
        });
      }

      return list;
    }

    if (activeTrack === 'clearing_slc') {
      return [
        {
          stepNo: 1,
          stageTitle: 'ETAPA 1 · GERAÇÃO DO ARQUIVO DE OUTGOING (D+0 · 21H00)',
          elapsedLabel: 'D+0 · 21h00',
          codeBadge: brand === 'visa' ? 'Base II .CTF (168B)' : brand === 'mastercard' ? 'GCMS .IPM (TLV)' : 'Serviço 10 .TXT (168B)',
          title:
            injectedFailure === 'downgrade_tid'
              ? 'Outgoing D+0 gerado SEM o Lifecycle ID (DE 62.2 / Banknet DE 63)'
              : 'Motor de Clearing empacota as vendas capturadas no layout físico da bandeira',
          fromNode: 'sub_payfac',
          toNode: 'network_spi',
          fromLabel: `Motor Outgoing (${acquirerName})`,
          toLabel: brandLabel,
          status: injectedFailure === 'downgrade_tid' ? 'warning' : 'normal',
          systemHops: `Staging DB ➔ Construtor de Lote (.CTF 168B / .IPM RDW 1014B / .TXT 168B) ➔ Appliance DEX / MFE / SFTP ➔ ${brandLabel}`,
          plainExplanation:
            injectedFailure === 'downgrade_tid'
              ? 'O lote foi gerado, mas um bug de integração deixou o Transaction ID (TCR 5 / PDS 0158 / Reg 02) zerado. A bandeira aceitará a venda, mas aplicará Downgrade de intercâmbio!'
              : `Às 21h00, o motor varre todas as compras capturadas, calcula o ARN de 23 dígitos com Luhn, monta os registros condicionais (parcelado Brasil, EMV, 3DS, Subcredenciado) e fecha a soma exata do Trailer.`,
          deepDiveTitle: 'Regras de Ouro do Arquivo Físico de Outgoing',
          deepDiveNormative:
            'No parcelado brasileiro, a soma das parcelas deve bater centavo a centavo com o valor total da venda: qualquer resíduo de divisão (ex.: R$ 100,00 ÷ 3 = R$ 33,34 + 33,33 + 33,33) deve ser alocado obrigatoriamente na 1ª parcela (TCR 2 BR / PDS 0195 / Reg 02).',
          normativeSource: 'Visa Base II TC 05 to TC 92 / Mastercard IPM Manual / Elo Serviço 10 v26.2',
          fields: [
            { code: 'Header', name: 'Cabeçalho de Lote', value: brand === 'visa' ? 'TC 90' : brand === 'mastercard' ? 'MTI 1644 (Func 697)' : 'Registro B0', note: 'Identifica remessa e data' },
            { code: 'Transação Base', name: 'Registro Financeiro', value: brand === 'visa' ? 'TC 05 TCR 0 + TCR 1 + TCR 2 BR' : brand === 'mastercard' ? 'MTI 1240 + PDS 0195' : 'TE 05 Reg 00 + 01 + 02', note: `Valor R$ ${amount.toFixed(2)}` },
            { code: 'Lifecycle ID', name: 'TID / Banknet Reference', value: injectedFailure === 'downgrade_tid' ? '000000000000000 (AUSENTE!)' : '306198374620194', note: injectedFailure === 'downgrade_tid' ? 'Causa Downgrade EIRF!' : 'Qualifica CPS / Ótimo' },
            { code: 'Trailer', name: 'Fechamento Matemático', value: brand === 'visa' ? 'TC 91 + TC 92' : brand === 'mastercard' ? 'MTI 1644 (Func 695)' : 'Registro BZ', note: 'Soma total e qtd linhas' },
          ],
        },
        {
          stepNo: 2,
          stageTitle: 'ETAPA 2 · CRÍTICA T+0 & QUALIFICAÇÃO DE INTERCÂMBIO NA BANDEIRA',
          elapsedLabel: 'D+0 · 22h15',
          codeBadge:
            injectedFailure === 'reject_trailer'
              ? 'REJECT · EP747 / T112 / Reg 09'
              : injectedFailure === 'downgrade_tid'
              ? 'DOWNGRADE · EIRF / Standard'
              : 'VSS-120 / T140 · Ótimo',
          title:
            injectedFailure === 'reject_trailer'
              ? 'Bandeira rejeita registro no relatório de crítica (EP747 / T112 / TE01 Reg 09)'
              : 'Bandeira valida sintaxe, calcula o Intercâmbio (IRD/PID) e gera o Incoming do Emissor',
          fromNode: 'network_spi',
          toNode: 'issuer_receiver',
          fromLabel: brandLabel,
          toLabel: `${issuerName} (Incoming)`,
          status: injectedFailure === 'reject_trailer' ? 'error' : injectedFailure === 'downgrade_tid' ? 'warning' : 'normal',
          systemHops: `Edit Package (EP747 / MFE / Crítica Elo) ➔ Motor de Intercâmbio (IRD/PID + BCB 304) ➔ Arquivo Incoming D+1 (${issuerName})`,
          plainExplanation:
            injectedFailure === 'reject_trailer'
              ? 'O validador da bandeira encontrou erro de dígito Luhn no ARN ou divergência de soma no Trailer e devolveu o arquivo/registro no relatório de rejeição T+0. O dinheiro não entrará na grade de amanhã até ser corrigido!'
              : `A câmara de compensação da ${brandLabel} valida cada byte, enquadra a tarifa de intercâmbio (${
                  injectedFailure === 'downgrade_tid' ? 'rebaixada para EIRF/Standard por falta do TID' : 'tarifa ótima qualificada'
                }), emite os relatórios financeiros (VSS-110/120, T140/T461, Rel. 20-02) e envia o arquivo Incoming para o ${issuerName} lançar na fatura do cliente.`,
          deepDiveTitle: 'Como a Bandeira Calcula o Intercâmbio (Cascata IRD)',
          deepDiveNormative:
            'O motor da bandeira cruza: (1) Produto do BIN (PID/Brand Product), (2) Modalidade e Nº de Parcelas, (3) MCC do Lojista, (4) Canal/Segurança (Chip, Token, 3DS) e (5) Tempestividade (envio em até D+2). Se faltar qualquer requisito obrigatório daquele IRD, a transação cai na cascata para a faixa penalizada.',
          normativeSource: 'Visa Brazil IRF Guide / Mastercard GCMS Interchange Manual / Tabela Intercâmbio Elo',
          fields: [
            { code: 'Report Crítica', name: 'Relatório de Aceite/Erro', value: brand === 'visa' ? 'EP747 / VX-100A' : brand === 'mastercard' ? 'IPM T112 / T140' : 'TE01 Reg 09 / Rel. 20-02', note: 'Gerado em T+0 / D+1' },
            { code: 'IRD / Fee Tier', name: 'Qualificação de Intercâmbio', value: injectedFailure === 'downgrade_tid' ? 'EIRF / Standard (+65 bps)' : 'CPS Retail / Qualificado Ótimo', note: 'Impacta margem líquida' },
          ],
        },
        {
          stepNo: 3,
          stageTitle: 'ETAPA 3 · REGISTRO DE RECEBÍVEIS (UR NA B3 / CERC — RES. BCB 264)',
          elapsedLabel: 'D+1 · 06h00',
          codeBadge: 'Res. BCB 264 · UR B3/CERC',
          title: 'Adquirente atualiza a Unidade de Recebível (UR) e consulta travas/gravames na Registradora',
          fromNode: 'acquirer_psp',
          toNode: 'slc_b3_str',
          fromLabel: acquirerName,
          toLabel: 'Registradora (B3 / CERC)',
          status: 'normal',
          systemHops: `Motor de Agenda (${acquirerName}) ➔ API Registradora (B3 / CERC / TAG) ➔ Retorno de Contratos de Cessão / Gravame`,
          plainExplanation:
            'Antes de enviar a ordem de pagamento para a CIP/Núclea, a adquirente atualiza o valor constituído da Unidade de Recebível (UR = CNPJ + Bandeira + Data de Vencimento) na Registradora e recebe a instrução de domicílio bancário (ou do banco credor, caso o lojista tenha antecipado ou dado a UR em garantia).',
          deepDiveTitle: 'Unidade de Recebível (UR) e Interoperabilidade entre Registradoras',
          deepDiveNormative:
            'Pela Resolução BCB nº 264/2022, a adquirente deve liquidar a UR estritamente na conta domicílio informada pelo arquivo de efeitos de contrato retornado pela registradora no ciclo matinal.',
          normativeSource: 'Resolução BCB nº 264/2022 + Manual Operacional SLC/Registradoras',
          fields: [
            { code: 'Chave da UR', name: 'Identificador Único da Agenda', value: `CNPJ 12.345.678/0001-99 · ${brand.toUpperCase()} · Crédito`, note: 'Agrupado por data de liquidação' },
            { code: 'Status Gravame', name: 'Efeito de Contrato', value: injectedFailure === 'slc_gravame' ? 'CESSÃO FIDUCIÁRIA ATIVA (Divergente)' : 'Livre — Domicílio Original do Lojista', note: 'Valida titularidade' },
          ],
        },
        {
          stepNo: 4,
          stageTitle: 'ETAPA 4 · GRADE SLC/CIP (ASLC026/028/031) & LIQUIDAÇÃO NO STR (BACEN)',
          elapsedLabel: 'D+1 · 08h30',
          codeBadge: injectedFailure === 'slc_gravame' ? 'REJECT · ASLC026E' : 'ASLC026 + STR (LDL)',
          title:
            injectedFailure === 'slc_gravame'
              ? 'CIP/Núclea rejeita instrução no arquivo ASLC026E por divergência de domicílio/gravame'
              : 'Compensação multilateral na CIP/SLC e liquidação em reserva bancária no STR (Banco Central)',
          fromNode: 'slc_b3_str',
          toNode: 'pos_client',
          fromLabel: 'CIP/SLC + STR (Bacen)',
          toLabel: 'Banco Domicílio Lojista',
          status: injectedFailure === 'slc_gravame' ? 'error' : 'normal',
          systemHops: `Grade XML ASLC026/028 (RSFN) ➔ Netting Multilateral CIP/Núclea ➔ Mensagem LDL no STR (Bacen) ➔ Crédito Conta Lojista`,
          plainExplanation:
            injectedFailure === 'slc_gravame'
              ? 'A grade ASLC026 enviou conta domicílio diferente da trava ativa na registradora B3. A CIP/Núclea devolve arquivo de erro ASLC026E e bloqueia a liquidação daquela linha até conciliação na janela vespertina.'
              : 'A CIP/Núclea faz o encontro de contas multilateral (Netting): o Banco Emissor deposita o valor líquido de intercâmbio na reserva no STR (Banco Central), a Adquirente recebe sua posição e a CIP credita o banco domicílio do lojista!',
          deepDiveTitle: 'Arquivos da Grade SLC (Núclea / CIP)',
          deepDiveNormative:
            'No arranjo doméstico brasileiro, a liquidação centralizada opera via RSFN com os arquivos XML assinados com certificado ICP-Brasil: ASLC026 (Crédito), ASLC028 (Débito) e ASLC031 (Antecipação pós-contratada).',
          normativeSource: 'Catálogo de Serviços e Arquivos do Sistema de Pagamentos Brasileiro (SPB / SLC Núclea)',
          fields: [
            { code: 'Arquivo Grade', name: 'Mensagem SPB / SLC', value: modality === 'debito' ? 'ASLC028 (Débito D+1)' : anticipateToD1 ? 'ASLC031 (Antecipação D+1)' : 'ASLC026 (Crédito)', note: 'Assinatura ICP-Brasil' },
            { code: 'Janela STR', name: 'Liquidação Reserva Bancária', value: '1ª Janela Matinal (08h30 BRT)', note: 'Liquidação irrevogável no Bacen' },
          ],
        },
      ];
    }

    if (activeTrack === 'contestacao_ce3') {
      return [
        {
          stepNo: 1,
          stageTitle: 'ETAPA 1 · CONTESTAÇÃO DO PORTADOR & FILTRO PRÉ-DISPUTA (RDR / VERIFI / ETHOCA)',
          elapsedLabel: 'D+15',
          codeBadge: 'VROL / MCOM · Alerta',
          title: 'Portador contesta compra no app do banco; rede verifica 3DS e regras de Pre-Dispute',
          fromNode: 'pos_client',
          toNode: 'issuer_receiver',
          fromLabel: 'Portador (App Banco)',
          toLabel: `${issuerName} ➔ VROL/MCOM`,
          status: 'normal',
          systemHops: `App Emissor (${issuerName}) ➔ Backoffice de Disputas ➔ API VROL (Visa) / MCOM (Mastercard) / Elo Disputas`,
          plainExplanation:
            'O titular do cartão abre o app do banco e clica em "Não reconheço esta compra". O sistema do emissor submete a abertura da disputa ao motor central da bandeira (Visa Resolve Online - VROL ou Mastercard Mastercom - MCOM).',
          deepDiveTitle: 'Bloqueio Automático na Bandeira quando há 3DS 2.2 (Liability Shift)',
          deepDiveNormative:
            'Se a transação original foi autenticada com 3DS 2.2 (ECI 05/02 + CAVV válido) ou via Visa DAF / Token biométrico, o próprio VROL/MCOM impede que o emissor transfira o prejuízo de fraude CNP (Código 10.4 / 4837) para o adquirente/lojista.',
          normativeSource: 'Visa Dispute Management Guidelines / Mastercard Chargeback Guide',
          fields: [
            { code: 'Reason Code', name: 'Código de Disputa', value: brand === 'visa' ? '10.4 (Other Fraud — Card-Absent)' : brand === 'mastercard' ? '4837 (No Cardholder Authorization)' : 'Cód. 4837 / Fraude CNP', note: 'Fraude não presencial' },
            { code: 'ARN Vinculado', name: 'Transação Original', value: '74532116323000012345672', note: 'Chave de conciliação' },
          ],
        },
        {
          stepNo: 2,
          stageTitle: 'ETAPA 2 · FIRST CHARGEBACK (TC 15 / MTI 1442 / TE 15)',
          elapsedLabel: 'D+16',
          codeBadge: injectedFailure === 'liability_shift_3ds' ? 'BLOQUEADO · ECI 05 (3DS)' : 'TC 15 / 1442 · Débito CBK',
          title:
            injectedFailure === 'liability_shift_3ds'
              ? 'VROL/MCOM bloqueia o Chargeback de fraude porque a compra tinha 3DS 2.2 (ECI 05)'
              : 'Bandeira debita a Adquirente no Incoming (TC 15 / 1442) e abre prazo de defesa',
          fromNode: 'network_spi',
          toNode: 'acquirer_psp',
          fromLabel: brandLabel,
          toLabel: acquirerName,
          status: injectedFailure === 'liability_shift_3ds' ? 'normal' : 'warning',
          systemHops: `VROL/MCOM ➔ Registro de Chargeback (TC 15 / MTI 1442 / Elo TE 15) ➔ Débito na Grade SLC ➔ Portal Disputas (${acquirerName})`,
          plainExplanation:
            injectedFailure === 'liability_shift_3ds'
              ? 'Como a compra possuía criptograma CAVV v9 e ECI 05 gravados no Outgoing original, a bandeira barra o chargeback na origem: o lojista não sofre nenhum débito!'
              : `A bandeira envia o registro de First Chargeback no arquivo Incoming da ${acquirerName}, debitando provisoriamente R$ ${amount.toFixed(2)} e abrindo a janela regulamentar (30 dias Visa / 45 dias MC) para reapresentação.`,
          deepDiveTitle: 'Impacto nos Programas de Monitoria (VAMP / ECP)',
          deepDiveNormative:
            'Mesmo quando o lojista vence a reapresentação depois, a abertura do First Chargeback e o aviso de fraude (TC 40 / SAFE) já contabilizam nos índices dos programas Visa Acquirer Monitoring Program (VAMP) e Mastercard Excessive Chargeback Program (ECP). Por isso o uso de 3DS, Tokens e Verifi RDR é vital.',
          normativeSource: 'Visa VAMP Program Guide (2025/2026) / Mastercard Security Rules Chap. 8',
          fields: [
            { code: 'Registro Incoming', name: 'Layout de Débito CBK', value: brand === 'visa' ? 'TC 15 (Chargeback)' : brand === 'mastercard' ? 'MTI 1442 (Func 450)' : 'TE 15 (Chargeback)', note: `Débito de R$ ${amount.toFixed(2)}` },
            { code: 'Prazo de Defesa', name: 'Janela de Representment', value: brand === 'visa' ? '30 dias corridos (VROL)' : '45 dias corridos (MCOM)', note: 'Para submeter evidências' },
          ],
        },
        {
          stepNo: 3,
          stageTitle: 'ETAPA 3 · REAPRESENTAÇÃO COM COMPELLING EVIDENCE 3.0 (CE 3.0)',
          elapsedLabel: 'D+20',
          codeBadge: injectedFailure === 'sem_3ds_perda' ? 'SEM EVIDÊNCIA · Perda' : 'CE 3.0 · 2a Reapresentação',
          title:
            injectedFailure === 'sem_3ds_perda'
              ? 'Lojista não possui vínculo histórico CE 3.0: Chargeback encerrado com perda financeira'
              : 'Adquirente submete 2 compras históricas não disputadas (>120 dias) com mesmo IP e Device ID (CE 3.0)',
          fromNode: 'acquirer_psp',
          toNode: 'network_spi',
          fromLabel: `${acquirerName} + Lojista`,
          toLabel: `${brandLabel} (CE 3.0 Engine)`,
          status: injectedFailure === 'sem_3ds_perda' ? 'error' : 'normal',
          systemHops: `Dossiê CE 3.0 (Lojista) ➔ Portal Disputas (${acquirerName}) ➔ TC 05 Reapresentação / MCOM Second Presentment ➔ ${issuerName}`,
          plainExplanation:
            injectedFailure === 'sem_3ds_perda'
              ? 'Sem 3DS na compra original e sem pelo menos 2 transações históricas válidas para Compelling Evidence 3.0, o lojista aceita o chargeback para não pagar a multa maior de Pré-Arbitragem.'
              : 'Para provar que foi o próprio titular quem comprou (Friendly Fraud), o lojista envia via CE 3.0 o ARN de 2 compras anteriores do mesmo cartão (feitas entre 120 e 365 dias atrás e nunca contestadas) onde pelo menos 2 elementos coincidem com a compra contestada (IP Address, Device ID/Fingerprint, User Account ID ou Endereço de Entrega)!',
          deepDiveTitle: 'A Regra Matemática do Compelling Evidence 3.0 (Visa & Mastercard)',
          deepDiveNormative:
            'No CE 3.0, se o adquirente comprovar 2 transações históricas do mesmo PAN (entre 120 e 365 dias antes da disputa, sem TC 40/SAFE nem TC 15) compartilhando >= 2 atributos (sendo 1 obrigatoriamente IP Address ou Device ID/Fingerprint), o Liability Shift se inverte a favor do lojista e a reversão é mandatória.',
          normativeSource: 'Visa Compelling Evidence 3.0 Specification / Mastercard First-Party Trust Program',
          fields: [
            { code: 'Histórico #1 (ARN)', name: 'Compra Anterior (>120d)', value: 'ARN 74532115180000099182731 (Há 145 dias — Sem Disputa)', note: 'Match: Device ID + IP + Conta' },
            { code: 'Histórico #2 (ARN)', name: 'Compra Anterior (>120d)', value: 'ARN 74532115210000044519283 (Há 180 dias — Sem Disputa)', note: 'Match: Device ID + IP + Conta' },
            { code: 'Decisão CE 3.0', name: 'Veredito da Bandeira', value: injectedFailure === 'sem_3ds_perda' ? 'INSUFFICIENT_EVIDENCE (Perda)' : 'CE3_QUALIFIED — Reversão Mandatória R$ ' + amount.toFixed(2), note: 'Crédito devolvido na SLC' },
          ],
        },
      ];
    }

    if (activeTrack === 'pix_spi') {
      return [
        {
          stepNo: 1,
          stageTitle: 'ETAPA 1 · LEITURA DO BR CODE (EMV®) & CONSULTA AO DICT (BACEN)',
          elapsedLabel: '0 ms',
          codeBadge: injectedFailure === 'chave_inexistente' ? 'DICT · 404 Not Found' : 'GET /entries/{chave} · DICT',
          title:
            injectedFailure === 'chave_inexistente'
              ? 'Chave Pix não encontrada no DICT do Banco Central (HTTP 404)'
              : 'App do pagador lê o QR Code / Chave e consulta o DICT do Banco Central',
          fromNode: 'pos_client',
          toNode: 'sub_payfac',
          fromLabel: 'App Pagador (PSP)',
          toLabel: 'DICT (Banco Central)',
          status: injectedFailure === 'chave_inexistente' ? 'error' : 'normal',
          systemHops: `App Bancário ➔ API PSP Pagador ➔ RSFN (mTLS ICP-Brasil) ➔ DICT (Banco Central do Brasil)`,
          plainExplanation:
            injectedFailure === 'chave_inexistente'
              ? 'O DICT respondeu que a chave informada não está vinculada a nenhuma conta ativa no SFN. O fluxo para aqui sem movimentar nenhum centavo.'
              : 'Quando você lê um QR Code Pix (padrão EMV® BR Code) ou digita uma chave (CPF, CNPJ, E-mail, Celular ou EVP), seu banco consulta em < 80ms o DICT do Banco Central para descobrir o ISPB do banco recebedor, a agência/conta, o nome do titular e as estatísticas antifraude daquela chave.',
          deepDiveTitle: 'Estatísticas Antifraude do DICT (Marcações de Golpe e MED)',
          deepDiveNormative:
            'A resposta da consulta ao DICT traz contadores históricos de notificações de infração (fraude/golpe) e pedidos de MED associados àquela chave e àquele CPF/CNPJ nos últimos meses, alimentando o motor de risco do PSP Pagador antes mesmo da confirmação.',
          normativeSource: 'Manual Operacional do DICT — Banco Central do Brasil',
          fields: [
            { code: 'Payload BR Code', name: 'TLV EMV® QRCPS-MPM', value: '00020126580014br.gov.bcb.pix0136123e4567-e89b...6304A1B2', note: 'Tag 26 = GUI br.gov.bcb.pix + CRC16' },
            { code: 'ISPB Recebedor', name: 'Identificador SPB (8 dígitos)', value: '60701190 (Itaú) / 18236120 (Nubank)', note: 'Roteamento na RSFN' },
            { code: 'EndToEndId', name: 'ID Único Gerado pelo PSP', value: 'E60701190202611191042a9f8c7d6e5b', note: 'E + ISPB(8) + YYYYMMDDHHMM + 11 chars' },
          ],
        },
        ...(injectedFailure === 'chave_inexistente'
          ? []
          : [
              {
                stepNo: 2,
                stageTitle: 'ETAPA 2 · MOTOR ANTIFRAUDE, LIMITE NOTURNO & DÉBITO NA CONTA DO PAGADOR',
                elapsedLabel: '180 ms',
                codeBadge:
                  injectedFailure === 'limite_noturno' ? 'BLOQUEADO · Limite Noturno' : 'Antifraude + Débito Conta',
                title:
                  injectedFailure === 'limite_noturno'
                    ? 'Transação barrada pelo Limite Noturno do Pix (R$ 1.000 das 20h às 06h — IN BCB 331)'
                    : 'PSP Pagador valida limite de horário, score antifraude e debita a conta corrente',
                fromNode: 'pos_client',
                toNode: 'acquirer_psp',
                fromLabel: 'Titular Pagador',
                toLabel: 'Core PSP Pagador',
                status: injectedFailure === 'limite_noturno' ? 'error' : 'normal',
                systemHops: `Biometria App ➔ Motor Antifraude Pix (Limites IN BCB 331 + Score DICT) ➔ Core Ledger (Débito Conta Pagador)`,
                plainExplanation:
                  injectedFailure === 'limite_noturno'
                    ? 'Como a operação ocorreu no período noturno (20h às 06h) e o valor excede o limite padrão de R$ 1.000,00 para pessoas físicas sem cadastro prévio do favorecido, o PSP Pagador recusa o envio.'
                    : `O cliente autentica com biometria no celular. O PSP Pagador verifica que o valor de R$ ${amount.toFixed(2)} está dentro do limite diurno/noturno, aprova no antifraude e debita o saldo da conta.`,
                deepDiveTitle: 'Regras de Limite por Período e Gestão pelo Usuário no App',
                deepDiveNormative:
                  'Pelas Instruções Normativas do Banco Central, solicitações de redução de limite Pix devem ser acatadas imediatamente pelo banco, enquanto pedidos de aumento de limite exigem carência mínima de 24 a 48 horas para proteger o cliente sob coação ou roubo de aparelho.',
                normativeSource: 'Instrução Normativa BCB nº 331/2022 & Resolução BCB nº 1/2020',
                fields: [
                  { code: 'Horário & Faixa', name: 'Janela Regulatória', value: injectedFailure === 'limite_noturno' ? '22h15 (Noturno — Teto R$ 1.000)' : '10h42 (Diurno — Limite Normal)', note: 'Regra de proteção Bacen' },
                  { code: 'Score Antifraude', name: 'Avaliação DICT + Device', value: 'APROVADO (0 alertas de infração na chave)', note: 'Tempo máximo < 300ms' },
                ],
              } as LabMessageStep,
              ...(injectedFailure === 'limite_noturno'
                ? []
                : [
                    {
                      stepNo: 3,
                      stageTitle: 'ETAPA 3 · LIQUIDAÇÃO BRUTA EM TEMPO REAL NO SPI (ISO 20022 pacs.008)',
                      elapsedLabel: '540 ms',
                      codeBadge: 'pacs.008 · Liquidação SPI',
                      title: 'PSP Pagador envia XML ISO 20022 pacs.008 via RSFN; Banco Central liquida nas Contas PI',
                      fromNode: 'acquirer_psp',
                      toNode: 'network_spi',
                      fromLabel: 'PSP Pagador',
                      toLabel: 'SPI (Banco Central)',
                      status: 'normal',
                      systemHops: `Gateway SPI (PSP Pagador) ➔ Assinatura XML (ICP-Brasil) ➔ RSFN ➔ Motor SPI (Bacen — Contas PI)`,
                      plainExplanation: `Diferente do cartão (que acumula vendas para liquidar em lote no dia seguinte na CIP), no Pix o Banco Central move o dinheiro na hora: o SPI debita R$ ${amount.toFixed(2)} da Conta de Pagamentos Instantâneos (Conta PI) do banco pagador e credita a Conta PI do banco recebedor em milissegundos!`,
                      deepDiveTitle: 'O Padrão Global ISO 20022 no SPI (pacs.008.001.08)',
                      deepDiveNormative:
                        'O SPI opera 24×7×365 usando mensagens XML ISO 20022 trafegadas na Rede do Sistema Financeiro Nacional (RSFN). A mensagem pacs.008 (FIToFICustomerCreditTransfer) carrega o EndToEndId, o TxId do QR Code, os ISPBs e o valor com liquidação final e irrevogável.',
                      normativeSource: 'Catálogo de Mensagens do SPI (Banco Central do Brasil — ISO 20022)',
                      fields: [
                        { code: 'MsgDefIdr', name: 'Mensagem ISO 20022', value: 'pacs.008.001.08', note: 'Ordem de pagamento instantâneo' },
                        { code: 'IntrBkSttlmAmt', name: 'Valor Liquidado Conta PI', value: `BRL ${amount.toFixed(2)}`, note: 'Liquidação bruta em tempo real (LBTR)' },
                        { code: 'SttlmMtd', name: 'Método de Liquidação', value: 'CLRG (SPI Banco Central)', note: 'Irrevogável após pacs.002' },
                      ],
                    } as LabMessageStep,
                    {
                      stepNo: 4,
                      stageTitle: 'ETAPA 4 · ACEITE DO RECEBEDOR (pacs.002) & CRÉDITO / WEBHOOK AO LOJISTA',
                      elapsedLabel: '920 ms',
                      codeBadge:
                        injectedFailure === 'bloqueio_cautelar'
                          ? 'pacs.002 · Bloqueio Cautelar 72h'
                          : 'pacs.002 · Liquidado (< 1s)',
                      title:
                        injectedFailure === 'bloqueio_cautelar'
                          ? 'SPI liquida, mas PSP Recebedor aplica Bloqueio Cautelar de até 72h por suspeita de fraude'
                          : 'PSP Recebedor credita a conta do lojista, devolve pacs.002 ao SPI e dispara Webhook',
                      fromNode: 'network_spi',
                      toNode: 'issuer_receiver',
                      fromLabel: 'SPI (Banco Central)',
                      toLabel: 'PSP Recebedor ➔ Lojista',
                      status: injectedFailure === 'bloqueio_cautelar' ? 'warning' : 'normal',
                      systemHops: `SPI (Bacen) ➔ PSP Recebedor (Valida Conta & Antifraude Recebedor) ➔ pacs.002 (ACSC) ➔ Push & Webhook Lojista`,
                      plainExplanation:
                        injectedFailure === 'bloqueio_cautelar'
                          ? 'O PSP Recebedor confirmou a liquidação no SPI, mas seu motor antifraude detectou comportamento atípico (Pessoa Física recebendo valor fora de padrão) e acionou o Bloqueio Cautelar (Res. BCB 147), retendo o saldo por até 72 horas para análise.'
                          : 'O banco do lojista recebe o pacs.008 do Banco Central, credita o saldo imediatamente na conta do recebedor, responde pacs.002 (Status ACSC = AcceptedSettlementCompleted) e avisa o e-commerce/PDV via Webhook para liberar o pedido!',
                      deepDiveTitle: 'SLA Máximo do Pix no SPI (Percentil 99 < 2 segundos)',
                      deepDiveNormative:
                        'O Regulamento do Pix exige que 99% das transações sejam concluídas ponta a ponta em até 5 segundos (na prática a mediana do SPI fica abaixo de 1,2 segundo).',
                      normativeSource: 'Manual de Tempos do Pix + Resolução BCB nº 147 (Bloqueio Cautelar)',
                      fields: [
                        { code: 'MsgDefIdr', name: 'Confirmação ISO 20022', value: 'pacs.002.001.10', note: 'Payment Status Report' },
                        { code: 'TxSts', name: 'Status da Liquidação', value: injectedFailure === 'bloqueio_cautelar' ? 'ACSC + Cautelar Hold (72h)' : 'ACSC (AcceptedSettlementCompleted)', note: 'Dinheiro na conta do recebedor' },
                      ],
                    } as LabMessageStep,
                  ]),
            ]),
      ];
    }

    if (activeTrack === 'pix_auto_nfc') {
      return [
        {
          stepNo: 1,
          stageTitle: 'ETAPA 1 · AUTORIZAÇÃO PRÉVIA DO MANDATO (PIX AUTOMÁTICO / JSR NFC)',
          elapsedLabel: 'Adesão (1x)',
          codeBadge: 'pain.009 / Vínculo JSR',
          title: 'Cliente autoriza a recorrência (Pix Automático) ou vincula carteira NFC com biometria FIDO2',
          fromNode: 'pos_client',
          toNode: 'issuer_receiver',
          fromLabel: 'Cliente (Biometria)',
          toLabel: 'Banco do Cliente',
          status: 'normal',
          systemHops: `Checkout Assinatura / Wallet NFC ➔ Pedido de Mandato (pain.009 / JSR FIDO2) ➔ App Banco do Cliente (Aceite 1x)`,
          plainExplanation:
            'No Pix Automático, o cliente aprova uma única vez a autorização de débito recorrente (definindo valor máximo opcional e periodicidade mensal/anual). Já no Pix por Aproximação (NFC), ele vincula sua conta à carteira digital via Jornada Sem Redirecionamento (JSR) com chave criptográfica FIDO2 do aparelho.',
          deepDiveTitle: 'Como o Pix Automático substitui o Boleto e o Cartão Salvo (MIT)',
          deepDiveNormative:
            'Mais de 60 milhões de brasileiros não possuem limite de cartão de crédito suficiente para assinaturas anuais/mensais. O Pix Automático cria um mandato nativo gerenciável dentro do app de qualquer banco participante do SPI.',
          normativeSource: 'Resolução BCB nº 429 + Manual de Fluxos do Pix Automático',
          fields: [
            { code: 'MandateId', name: 'Identificador do Mandato', value: 'MND-2026-9918273645', note: 'Autorização ativa no banco do pagador' },
            { code: 'Periodicidade & Teto', name: 'Regra Autorizada pelo Cliente', value: `Mensal · Teto R$ ${(amount * 1.2).toFixed(2)}`, note: 'Auditável pelo cliente no app' },
          ],
        },
        {
          stepNo: 2,
          stageTitle: 'ETAPA 2 · AGENDAMENTO DA COBRANÇA RECORRENTE (D-2 A D-1)',
          elapsedLabel: 'Vencimento D-2',
          codeBadge: injectedFailure === 'revogacao_mandato' ? 'pain.014 · Mandato Cancelado' : 'pain.013 · Instrução D-2',
          title:
            injectedFailure === 'revogacao_mandato'
              ? 'Cobrança recusada porque o cliente cancelou o mandato no app antes do vencimento'
              : 'PSP da empresa envia instrução de cobrança (pain.013) e banco notifica o cliente na véspera',
          fromNode: 'acquirer_psp',
          toNode: 'issuer_receiver',
          fromLabel: 'PSP Recebedor (Empresa)',
          toLabel: 'Banco do Cliente',
          status: injectedFailure === 'revogacao_mandato' ? 'error' : 'normal',
          systemHops: `Motor de Billing (Empresa) ➔ PSP Recebedor ➔ Mensagem ISO 20022 (pain.013) ➔ Banco do Pagador (Push D-1)`,
          plainExplanation:
            injectedFailure === 'revogacao_mandato'
              ? 'Como o consumidor tem direito regulatório de cancelar o Pix Automático a qualquer momento no app do seu banco, a tentativa de agendamento retorna cancelada.'
              : 'Dois dias antes do vencimento da mensalidade, o PSP da empresa envia a instrução de cobrança ao banco do cliente. Na véspera (D-1), o banco envia uma notificação push transparente: "Amanhã será debitado seu Pix Automático de R$ ' +
                amount.toFixed(2) +
                '".',
          deepDiveTitle: 'Transparência e Direito de Cancelamento até a Véspera',
          deepDiveNormative:
            'O regulamento do Banco Central garante proteção total ao consumidor: ele visualiza todas as assinaturas ativas num painel único do seu banco e pode pausar ou cancelar uma cobrança agendada até as 23h59 do dia anterior ao débito.',
          normativeSource: 'Regulamento do Pix — Seção Pix Automático (Banco Central do Brasil)',
          fields: [
            { code: 'MsgDefIdr', name: 'Instrução de Cobrança', value: 'pain.013 / pacs.008 Agendado', note: 'Enviado entre D-10 e D-2' },
            { code: 'Status Mandato', name: 'Validação no Banco Pagador', value: injectedFailure === 'revogacao_mandato' ? 'REVOKED_BY_PAYER' : 'ACTIVE_SCHEDULED', note: 'Notificação push enviada em D-1' },
          ],
        },
        ...(injectedFailure === 'revogacao_mandato'
          ? []
          : [
              {
                stepNo: 3,
                stageTitle: 'ETAPA 3 · LIQUIDAÇÃO AUTOMÁTICA ÀS 06H00 DO VENCIMENTO (OU RETENTATIVA)',
                elapsedLabel: 'Dia D · 06h00',
                codeBadge: injectedFailure === 'saldo_retentativa' ? 'Retry Intra-dia / D+1' : 'pacs.008 · Liquidado D+0',
                title:
                  injectedFailure === 'saldo_retentativa'
                    ? 'Sem saldo às 06h00: motor executa retentativa automática padronizada assim que entra saldo'
                    : 'Liquidação automática no SPI às 06h00 e baixa instantânea da assinatura na empresa',
                fromNode: 'issuer_receiver',
                toNode: 'slc_b3_str',
                fromLabel: 'Banco Pagador ➔ SPI',
                toLabel: 'PSP Empresa (Webhook)',
                status: injectedFailure === 'saldo_retentativa' ? 'warning' : 'normal',
                systemHops: `Job Matinal Banco Pagador ➔ pacs.008 no SPI (Bacen) ➔ Crédito PSP Empresa ➔ Webhook Renovação SaaS`,
                plainExplanation:
                  injectedFailure === 'saldo_retentativa'
                    ? 'Às 06h00 o cliente ainda não tinha saldo suficiente. Seguindo a política de retentativas do mandato, o sistema agenda nova tentativa intra-dia/D+1 e liquida assim que o salário cai na conta!'
                    : `Na manhã do vencimento, sem que o cliente precise abrir o app ou copiar código, o pagamento é liquidado no SPI e a empresa recebe o dinheiro em D+0 com confirmação automática!`,
                deepDiveTitle: 'Economia de Custos: Pix Automático vs Cartão de Crédito Recorrente',
                deepDiveNormative:
                  'Enquanto uma recorrência em cartão de crédito paga ~1,6% a 2,2% de intercâmbio + scheme fees e leva 30 dias para liquidar sem custo de antecipação, o Pix Automático liquida em D+0 sem intercâmbio de cartão.',
                normativeSource: 'Banco Central do Brasil — Especificação Técnica Pix Automático',
                fields: [
                  { code: 'Liquidação', name: 'Prazo de Recebimento', value: 'D+0 (Imediato no Vencimento)', note: 'Zero custo de antecipação D+30' },
                  { code: 'Política Retry', name: 'Retentativas Permitidas', value: 'Até 3 tentativas em 7 dias (conforme acordo)', note: 'Reduz churn involuntário' },
                ],
              } as LabMessageStep,
            ]),
      ];
    }

    if (activeTrack === 'med_seguranca') {
      return [
        {
          stepNo: 1,
          stageTitle: 'ETAPA 1 · CONTESTAÇÃO NO APP (AUTOATENDIMENTO MED 2.0) & NOTIFICAÇÃO NO DICT',
          elapsedLabel: 'T+0 min',
          codeBadge: 'MED 2.0 · Infração DICT',
          title: 'Vítima aciona o botão padronizado de contestação Pix no app; PSP cria Notificação de Infração no DICT',
          fromNode: 'pos_client',
          toNode: 'sub_payfac',
          fromLabel: 'Vítima (App Banco)',
          toLabel: 'PSP Pagador ➔ DICT',
          status: 'normal',
          systemHops: `Botão Contestação Pix (App) ➔ API PSP Pagador ➔ POST /infraction-reports (DICT Banco Central)`,
          plainExplanation:
            'Ao perceber que caiu em um golpe ou teve o aparelho invadido, o cliente usa o autoatendimento padronizado do MED 2.0 dentro do próprio aplicativo bancário (sem depender de fila de call center) para contestar o Pix.',
          deepDiveTitle: 'O Fim do Atrito de Atendimento na Abertura do MED 2.0',
          deepDiveNormative:
            'Com a atualização regulatória do MED 2.0 (2026/2027), todos os participantes do Pix são obrigados a disponibilizar um fluxo digital 100% padronizado de autoatendimento no extrato do Pix, reduzindo o tempo entre o golpe e o bloqueio de horas para minutos.',
          normativeSource: 'Banco Central do Brasil — Regulamento do Pix (Mecanismo Especial de Devolução 2.0)',
          fields: [
            { code: 'InfractionType', name: 'Motivo Regulatório', value: 'FRAUD / SCAM (Golpe ou Invasão de Conta)', note: 'Prazo: até 80 dias da transação' },
            { code: 'EndToEndId Original', name: 'Transação Contestada', value: 'E60701190202611191042a9f8c7d6e5b', note: `Valor R$ ${amount.toFixed(2)}` },
          ],
        },
        {
          stepNo: 2,
          stageTitle: 'ETAPA 2 · GRAFO DE RASTREIO MULTINÍVEL (ALÉM DA 1ª CONTA LARANJA)',
          elapsedLabel: 'T+2 min',
          codeBadge: injectedFailure === 'saque_esvaziado' ? 'MED 1.0 · 1ª Conta Zerada' : 'MED 2.0 · Bloqueio Multinível',
          title:
            injectedFailure === 'saque_esvaziado'
              ? 'No modelo antigo (MED 1.0), o bloqueio atingia apenas a 1ª conta, que já havia sido esvaziada em 15s'
              : 'Grafo do MED 2.0 rastreia as transferências subsequentes no SPI e bloqueia recursos nas Contas Nível 1, 2 e 3',
          fromNode: 'acquirer_psp',
          toNode: 'issuer_receiver',
          fromLabel: 'Grafo MED 2.0 (SPI/DICT)',
          toLabel: 'Contas Nível 1, 2 e 3',
          status: injectedFailure === 'saque_esvaziado' ? 'error' : 'normal',
          systemHops: `DICT Infraction Engine ➔ Grafo de Saltos SPI (Conta Nível 1 ➔ Conta Nível 2 ➔ Conta Nível 3) ➔ Bloqueio em Cascata`,
          plainExplanation:
            injectedFailure === 'saque_esvaziado'
              ? 'Na primeira geração do MED, apenas a conta que recebeu o Pix diretamente da vítima podia sofrer bloqueio. Quadrilhas usavam bots para pulverizar o dinheiro para 3 outras contas em segundos.'
              : 'Com o MED 2.0, o mecanismo segue o rastro do dinheiro pelo grafo do SPI: mesmo que a 1ª conta laranja tenha transferido R$ 1.500 para outras duas contas em bancos diferentes, o sistema propaga a ordem de bloqueio cautelar para as contas seguintes na cadeia!',
          deepDiveTitle: 'Como funciona o Rastreamento em Grafo do MED 2.0',
          deepDiveNormative:
            'O motor do Banco Central correlaciona os EndToEndIds de saída que ocorreram logo após o crédito suspeito, identificando o caminho da pulverização e instruindo os PSPs de destino a bloquear os saldos remanescentes até a decisão da análise de fraude (7 dias).',
          normativeSource: 'Banco Central do Brasil — Especificação Técnica MED 2.0 (Rastreamento de Recursos)',
          fields: [
            { code: 'Salto #1 (ISPB A)', name: '1ª Conta Recebedora', value: injectedFailure === 'saque_esvaziado' ? 'Saldo R$ 0,00 (Esvaziada em 14s)' : 'Bloqueado R$ 300,00 remanescentes', note: 'Conta inicial' },
            { code: 'Salto #2 e #3 (ISPBs B/C)', name: 'Contas de Pulverização', value: injectedFailure === 'saque_esvaziado' ? 'Não alcançadas pelo MED 1.0' : `Bloqueado R$ ${(amount - 300).toFixed(2)} no 2º e 3º saltos`, note: 'Exclusivo MED 2.0 (2026/2027)' },
          ],
        },
        {
          stepNo: 3,
          stageTitle: 'ETAPA 3 · PROCEDÊNCIA DA FRAUDE & ESTORNO VIA pacs.004 NO SPI',
          elapsedLabel: 'Até D+7',
          codeBadge: injectedFailure === 'saque_esvaziado' ? 'Frustrado · Sem Saldo' : 'pacs.004 · Devolução MED',
          title:
            injectedFailure === 'saque_esvaziado'
              ? 'Notificação procedente, mas sem saldo recuperado; conta laranja é marcada no DICT e encerrada'
              : 'Fraude confirmada: PSPs executam devolução automática via mensagem ISO 20022 pacs.004 para a vítima',
          fromNode: 'issuer_receiver',
          toNode: 'pos_client',
          fromLabel: 'PSPs Recebedores ➔ SPI',
          toLabel: 'Conta da Vítima',
          status: injectedFailure === 'saque_esvaziado' ? 'warning' : 'normal',
          systemHops: `Fechamento Infração DICT (PROCEDENTE) ➔ Mensagem ISO 20022 pacs.004 (Código MD06 / SL02) ➔ SPI ➔ Crédito Vítima`,
          plainExplanation:
            injectedFailure === 'saque_esvaziado'
              ? 'Mesmo sem saldo na conta nível 1, o CPF/CNPJ do fraudador recebe marcação definitiva de fraude no DICT (visível para todos os bancos do Brasil) e monitoria para bloqueio de novas chaves.'
              : `Confirmada a fraude em até 7 dias, os valores bloqueados nos níveis da cadeia são devolvidos diretamente para a conta da vítima através de mensagens ISO 20022 pacs.004 com código de devolução de MED!`,
          deepDiveTitle: 'Mensagem pacs.004 (PaymentReturn) e Débitos Parciais Futuros',
          deepDiveNormative:
            'Quando o saldo bloqueado é menor que o valor total do golpe, o regulamento autoriza devoluções parciais sucessivas (pacs.004) durante até 90 dias sempre que novos créditos entrarem na conta do fraudador.',
          normativeSource: 'Catálogo de Mensagens do SPI (pacs.004) & Regulamento do Pix',
          fields: [
            { code: 'MsgDefIdr', name: 'Mensagem de Estorno SPI', value: 'pacs.004.001.09', note: 'PaymentReturn ISO 20022' },
            { code: 'RtrRsnInf', name: 'Código de Motivo MED', value: 'BE08 /FRAD (Devolução por Fraude MED)', note: 'Vinculado ao EndToEndId original' },
          ],
        },
      ];
    }

    if (activeTrack === 'open_finance_drex') {
      return [
        {
          stepNo: 1,
          stageTitle: 'ETAPA 1 · JORNADA SEM REDIRECIONAMENTO (JSR) & ASSINATURA PASSKEY FIDO2',
          elapsedLabel: '0 ms',
          codeBadge: 'FIDO2 / WebAuthn · JSR',
          title: 'Cliente autentica com FaceID/Biometria no próprio checkout ou aproximação NFC sem abrir o app do banco',
          fromNode: 'pos_client',
          toNode: 'acquirer_psp',
          fromLabel: 'Aparelho do Cliente',
          toLabel: 'Iniciador (ITP)',
          status: 'normal',
          systemHops: `Secure Enclave / TEE (FIDO2 Passkey) ➔ SDK Checkout / Carteira NFC ➔ Servidor ITP (Iniciador Open Finance)`,
          plainExplanation:
            'Na antiga jornada do Open Finance, o cliente sofria com 6 telas de redirecionamento entre navegador e app do banco. Com a Jornada Sem Redirecionamento (JSR — Res. BCB 396/406), o aparelho assina criptograficamente o pagamento com a chave FIDO2 vinculada ao chip de segurança do celular em 1 toque!',
          deepDiveTitle: 'Segurança Criptográfica FIDO2 / WebAuthn na JSR',
          deepDiveNormative:
            'A chave privada FIDO2 nunca sai do hardware seguro do smartphone (Secure Enclave no iOS / StrongBox no Android). O banco detentor da conta valida a assinatura pública junto com os certificados mTLS FAPI do Diretório do Open Finance.',
          normativeSource: 'Resoluções BCB nº 396 e 406/2024 + Especificação Técnica JSR Open Finance Brasil',
          fields: [
            { code: 'Protocolo', name: 'Padrão de Autenticação', value: 'FIDO2 / WebAuthn + OAuth2 FAPI 1.0 Advanced', note: 'Zero senha / Zero redirect' },
            { code: 'EnrollmentId', name: 'Vínculo de Dispositivo JSR', value: 'urn:brasil:openfinance:enrollment:88192031', note: 'Autorizado previamente no banco' },
          ],
        },
        {
          stepNo: 2,
          stageTitle: 'ETAPA 2 · CHAMADA DE INICIAÇÃO DE PAGAMENTO (POST /pix/payments)',
          elapsedLabel: '260 ms',
          codeBadge:
            injectedFailure === 'consent_expired' ? '422 · Step-Up Exigido' : 'POST /open-banking/payments/v4',
          title:
            injectedFailure === 'consent_expired'
              ? 'Valor excede o teto do vínculo JSR: Detentora solicita Step-Up no app do banco'
              : 'ITP envia ordem de pagamento assinada em JWS via mTLS direto à instituição detentora da conta',
          fromNode: 'acquirer_psp',
          toNode: 'issuer_receiver',
          fromLabel: 'Iniciador (ITP)',
          toLabel: `Detentora (${issuerName})`,
          status: injectedFailure === 'consent_expired' ? 'warning' : 'normal',
          systemHops: `API ITP ➔ Validação Certificado Diretório Open Finance (ICP-Brasil) ➔ POST /payments/v4/pix/payments (${issuerName})`,
          plainExplanation:
            injectedFailure === 'consent_expired'
              ? 'Como o valor da compra ultrapassou o limite por transação configurado para a JSR sem redirecionamento, a detentora responde exigindo confirmação rápida no app do banco.'
              : `O Iniciador (ITP) monta o JWT assinado (JWS) com os dados do favorecido e a prova biométrica FIDO2 e chama diretamente a API de Iniciação de Pagamento do ${issuerName}.`,
          deepDiveTitle: 'Governança de Certificados no Diretório do Open Finance Brasil',
          deepDiveNormative:
            'Toda chamada entre ITP e Detentora exige certificado digital padrão Open Finance Brasil (BRSEAL para assinatura JWS do payload e BRWAC para canal mTLS), garantindo não-repúdio ponta a ponta.',
          normativeSource: 'Open Finance Brasil — Padrões de Segurança FAPI & API Pagamentos v4',
          fields: [
            { code: 'Endpoint', name: 'API Open Finance v4', value: 'POST /open-banking/payments/v4/pix/payments', note: 'Assinado com BRSEAL (JWS)' },
            { code: 'localInstrument', name: 'Instrumento de Iniciação', value: 'JSR (Jornada Sem Redirecionamento)', note: `Valor BRL ${amount.toFixed(2)}` },
          ],
        },
        {
          stepNo: 3,
          stageTitle: 'ETAPA 3 · LIQUIDAÇÃO INSTANTÂNEA NO SPI & CONFIRMAÇÃO WEBHOOK',
          elapsedLabel: '890 ms',
          codeBadge: 'pacs.008 · Liquidado',
          title: 'Detentora debita a conta, liquida via SPI (ou camada tokenizada Drex) e confirma ao ITP/Lojista',
          fromNode: 'issuer_receiver',
          toNode: 'slc_b3_str',
          fromLabel: `${issuerName} ➔ SPI`,
          toLabel: 'Conta do Lojista',
          status: 'normal',
          systemHops: `Core Detentora (${issuerName}) ➔ pacs.008 SPI (Bacen) ➔ Crédito Lojista ➔ Webhook ITP (Status ACSC)`,
          plainExplanation:
            'A instituição detentora da conta valida a assinatura FIDO2, debita o cliente e liquida imediatamente no SPI. Em menos de 1 segundo o checkout recebe o callback de pagamento concluído!',
          deepDiveTitle: 'Por que a JSR transforma o Checkout Mobile e o Tap on Phone',
          deepDiveNormative:
            'Ao remover a troca de aplicativo no celular, a taxa de abandono de carrinho cai drasticamente, permitindo que carteiras digitais (Apple Wallet, Google Wallet, carteiras de adquirentes e superapps) iniciem Pix por aproximação NFC em qualquer maquininha.',
          normativeSource: 'Banco Central do Brasil — Cronograma Pix por Aproximação & Open Finance',
          fields: [
            { code: 'Status API', name: 'Estado na Detentora', value: 'ACSC (Liquidação Concluída)', note: 'Callback Webhook entregue ao ITP' },
            { code: 'Tempo Total', name: 'Latência Ponta a Ponta', value: '890 ms (Sem abrir app bancário)', note: 'Experiência 1-Click / Tap' },
          ],
        },
      ];
    }

    // Track 8: Regras no Tempo & 2027+ (Split Tributário LC 214, Passkeys, Agentic AI)
    const isPre2023Era = injectedFailure === 'era_2022_pre_cap' || selectedEraDate < '2023-04-01';
    return [
      {
        stepNo: 1,
        stageTitle: isPre2023Era
          ? 'ETAPA 1 (ERA 2022) · CHECKOUT COM PAN MANUAL & SEM PASSKEY / SEM VÍNCULO FISCAL'
          : 'ETAPA 1 (ERA 2027+) · CHECKOUT CLICK TO PAY / PASSKEY FIDO2 + VÍNCULO NF-e (LC 214/2025)',
        elapsedLabel: '0 ms',
        codeBadge: isPre2023Era ? 'PAN Manual · Sem NF-e' : 'Token Passkey + Chave NF-e',
        title: isPre2023Era
          ? 'Em 2022: Cartão digitado manualmente (FPAN), 3DS com redirect lento e zero vínculo fiscal na captura'
          : 'Em 2027+: Pagamento iniciado via Network Token + Passkey Biométrica (ou Agente IA) vinculado à NFC-e/NF-e',
        fromNode: 'pos_client',
        toNode: 'sub_payfac',
        fromLabel: isPre2023Era ? 'Checkout 2022' : 'Checkout / Agente IA 2027',
        toLabel: 'Captura + Documento Fiscal',
        status: isPre2023Era ? 'warning' : 'normal',
        systemHops: isPre2023Era
          ? `Formulário PAN 16 dígitos ➔ Gateway ➔ Autorizador`
          : `Click to Pay / Agentic Token (DPAN + FIDO2 Passkey) ➔ Vinculação Chave NFC-e/NF-e (LC 214/2025) ➔ Captura`,
        plainExplanation: isPre2023Era
          ? 'Em 2022, a transação trafegava apenas os dados financeiros do cartão, sem chave de documento fiscal para Split Tributário e com criptograma 3DS legado (CAVV v7 3DES).'
          : 'A partir do cronograma 2027+ (Reforma Tributária LC 214/2025 + Mandatos Globais das Bandeiras), a captura associa o identificador da operação fiscal (NF-e/NFC-e e alíquota CBS/IBS) diretamente ao payload da transação tokenizada!',
        deepDiveTitle: 'Artigos 31 a 35 da Lei Complementar nº 214/2025 (Split Payment na Captura)',
        deepDiveNormative:
          'A LC 214/2025 determina que os prestadores de serviços de pagamento eletrônico (adquirentes, subcredenciadoras e bancos no Pix/Cartão) devem vincular os dados do documento fiscal eletrônico aos instrumentos de pagamento para viabilizar a segregação automática da CBS e do IBS na liquidação.',
        normativeSource: 'Lei Complementar nº 214/2025 (Arts. 31–35) + Roadmap Bandeiras 2027.1',
        fields: [
          {
            code: 'Credencial',
            name: 'Formato do Cartão/Meio',
            value: isPre2023Era ? 'FPAN 16 dígitos em aberto + CVV estático' : 'DPAN Network Token + TAVV + FIDO2 Passkey',
            note: isPre2023Era ? 'Maior risco de fraude CNP' : 'Mandato E-Commerce 2027',
          },
          {
            code: 'Vínculo Fiscal',
            name: 'Dados Reforma Tributária (LC 214)',
            value: isPre2023Era ? '(Não existia em 2022)' : 'Chave NFC-e 3527111234567800019965001... · CBS/IBS',
            note: 'Obrigatório p/ Split Tributário 2027+',
          },
        ],
      },
      {
        stepNo: 2,
        stageTitle: isPre2023Era
          ? 'ETAPA 2 (ERA 2022) · INTERCÂMBIO PRÉ-BCB 304 & TARIFAS VISA EM DÓLAR (USD)'
          : 'ETAPA 2 (ERA 2027+) · TETO BCB 304, TARIFAS EM BRL & CAVV v9 AES-128',
        elapsedLabel: '310 ms',
        codeBadge: isPre2023Era ? 'Pré-BCB 304 · Fees USD' : 'Teto BCB 304 · Fees BRL',
        title: isPre2023Era
          ? 'Em 2022: Pré-Pago cobrava até ~1,20% de intercâmbio e faturas domésticas Visa oscilavam com o Dólar'
          : 'Em 2027+: Débito travado em 0,50%, Pré-Pago em 0,70% (BCB 304), Fee Schedule em BRL e Elo Serviço 10 v27.1',
        fromNode: 'acquirer_psp',
        toNode: 'network_spi',
        fromLabel: acquirerName,
        toLabel: brandLabel,
        status: 'normal',
        systemHops: `Switch Autorizador ➔ Validação Criptográfica (AES-128 TR-31) ➔ Enquadramento Regulatório BCB 304 ➔ ${brandLabel}`,
        plainExplanation: isPre2023Era
          ? 'Antes de abril de 2023, cartões pré-pagos não tinham teto regulatório de 0,70% e o débito operava com média ponderada de 0,50% mas teto individual de 0,80%. Além disso, as linhas de billing da Visa eram expressas em USD.'
          : 'Com a Resolução BCB 304 consolidada e a conversão da tabela Visa para BRL (maio/2026), o custo de intercâmbio e de scheme fees é 100% previsível em Reais, e o layout Outgoing exige identificação fiscal completa de subcredenciados.',
        deepDiveTitle: 'Como a Linha do Tempo Regulatória Muda o Mesmo Pagamento',
        deepDiveNormative:
          'Uma mesma compra de R$ 500,00 em cartão pré-pago gerava até R$ 6,00 de intercâmbio em 2022; sob a Resolução BCB 304, gera exatamente R$ 3,50 (0,70%), uma economia direta de 41,6% no custo base.',
        normativeSource: 'Resolução BCB nº 304/2023 + Visa Fee Schedule Brazil BRL (01/05/2026)',
        fields: [
          {
            code: 'Cap Débito / Pré',
            name: 'Teto Regulatório Bacen',
            value: isPre2023Era ? 'Débito até 0,80% · Pré-Pago Livre (~1,20%)' : 'Débito máx 0,50% · Pré-Pago máx 0,70% (Res. BCB 304)',
            note: 'Muda este caso!',
          },
          {
            code: 'Moeda Scheme Fees',
            name: 'Faturamento Doméstico Bandeira',
            value: isPre2023Era ? 'USD (Convertido pela PTAX diária)' : 'BRL Fixo (Sem variação cambial desde 05/2026)',
            note: 'Muda este caso!',
          },
        ],
      },
      {
        stepNo: 3,
        stageTitle: isPre2023Era
          ? 'ETAPA 3 (ERA 2022) · LIQUIDAÇÃO TRADICIONAL INTEGRAL PARA A CONTA DO LOJISTA'
          : 'ETAPA 3 (ERA 2027+) · LIQUIDAÇÃO COM SPLIT PAYMENT TRIBUTÁRIO AUTOMÁTICO (CBS / IBS)',
        elapsedLabel: 'Liquidação',
        codeBadge: isPre2023Era ? '100% Líquido Lojista' : 'Split LC 214 · Fisco + Lojista',
        title: isPre2023Era
          ? 'Em 2022: Adquirente liquidava o valor líquido de MDR integralmente para o lojista recolher impostos depois'
          : 'Em 2027+: Motor de Liquidação segrega automaticamente a parcela de CBS/IBS para o Fisco e credita o saldo líquido ao lojista',
        fromNode: 'acquirer_psp',
        toNode: 'slc_b3_str',
        fromLabel: `Motor Liquidação (${acquirerName})`,
        toLabel: isPre2023Era ? 'Conta Lojista' : 'Comitê IBS / Receita + Lojista',
        status: 'normal',
        systemHops: isPre2023Era
          ? `Outgoing ➔ Grade SLC ➔ Conta Domicílio Lojista`
          : `Motor Split Payment (Consulta Alíquota/Crédito no Sistema CBS/IBS) ➔ Segregação Tributo p/ Fisco + Líquido p/ Lojista`,
        plainExplanation: isPre2023Era
          ? 'No modelo anterior à Reforma Tributária, 100% do valor líquido do MDR ia para a conta do estabelecimento comercial, que apurava PIS/COFINS/ICMS/ISS no mês seguinte.'
          : 'No modelo do Split Payment da Reforma Tributária (LC 214/2025), o próprio sistema de liquidação consulta o sistema central da Receita Federal / Comitê Gestor do IBS: se o imposto ainda não foi quitado na nota, a parcela exata da CBS/IBS vai direto para o cofre público e o restante vai para a conta do lojista!',
        deepDiveTitle: 'Impacto do Split Payment Tributário nas Registradoras (B3/CERC) e na Antecipação',
        deepDiveNormative:
          'Pelo Art. 34 da LC 214/2025, nas operações de antecipação ou cessão de recebíveis, o valor referente ao IBS e à CBS não integra o patrimônio disponível para cessão ao banco financiador, devendo ser segregado a favor da administração tributária.',
        normativeSource: 'Lei Complementar nº 214/2025 — Art. 31 a 35 (Split Payment Inteligente e Simplificado)',
        fields: [
          {
            code: 'Parcela Tributária',
            name: 'Segregação Automática CBS/IBS',
            value: isPre2023Era ? 'R$ 0,00 na liquidação (recolhido via DARF mensal)' : `Segregado na fonte conforme alíquota CBS/IBS da NF-e`,
            note: 'Revolução na liquidação 2027+',
          },
          {
            code: 'Base Antecipável (UR)',
            name: 'Valor Livre p/ Cessão B3/CERC',
            value: isPre2023Era ? 'Bruto menos MDR' : 'Bruto menos MDR e menos CBS/IBS retido no Split',
            note: 'Impacto direto em risco e crédito',
          },
        ],
      },
    ];
  }, [
    activeTrack,
    amount,
    brand,
    channel,
    threeDsChallenge,
    modality,
    installments,
    issuerName,
    acquirerName,
    acquiringModel,
    injectedFailure,
    anticipateToD1,
    selectedEraDate,
  ]);

  // Keep currentStepIdx within bounds
  const safeStepIdx = Math.min(currentStepIdx, Math.max(0, steps.length - 1));
  const currentStep = steps[safeStepIdx] || steps[0];

  // Autoplay interval
  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setCurrentStepIdx((prev) => {
        if (prev + 1 >= steps.length) {
          setIsPlaying(false);
          return 0;
        }
        return prev + 1;
      });
    }, 2200);
    return () => clearInterval(timer);
  }, [isPlaying, steps.length]);

  // Compute Arrangement Model summary
  const arrangementModelInfo = useMemo(() => {
    if (activeTrack === 'pix_spi' || activeTrack === 'pix_auto_nfc' || activeTrack === 'med_seguranca') {
      return {
        badge: 'Arranjo Pix (Banco Central — SPI)',
        desc: 'Liquidação Bruta em Tempo Real (LBTR) direto nas Contas PI no Banco Central: Pagador ➔ PSP Pagador ➔ SPI (Bacen) ➔ PSP Recebedor ➔ Lojista.',
      };
    }
    if (activeTrack === 'open_finance_drex') {
      return {
        badge: 'Open Finance Brasil (ITP + Detentora)',
        desc: 'Iniciador de Transação de Pagamento (ITP) aciona a conta do cliente via API padronizada FAPI/JSR sem intermediário de cartão.',
      };
    }
    if (brand === 'amex' || acquiringModel === 'tres_partes') {
      return {
        badge: 'Modelo de 3 Partes / GNS',
        desc: 'A bandeira acumula ou licencia diretamente os papéis de emissão e credenciamento, sem separação clássica de intercâmbio bilateral.',
      };
    }
    if (acquiringModel === 'payfac_sub') {
      return {
        badge: 'Modelo com Subcredenciadora (PayFac — 5 Atores)',
        desc: 'Portador ➔ Subcredenciadora (PayFac) ➔ Adquirente Liquidante ➔ Bandeira ➔ Banco Emissor. A Adquirente liquida na CIP para a PayFac, que faz o split ao sublojista.',
      };
    }
    if (acquiringModel === 'on_us') {
      return {
        badge: 'Modelo On-Us (Mesmo Conglomerado)',
        desc: 'Cartão do Emissor utilizado na Adquirente do próprio grupo financeiro (ex.: Itaú × Rede, Santander × Getnet, Bradesco/BB × Cielo).',
      };
    }
    return {
      badge: 'Modelo Clássico de 4 Partes',
      desc: `Portador (${issuerName}) ➔ Lojista credenciado direto na ${acquirerName} ➔ Bandeira (${brand.toUpperCase()}) ➔ Banco Emissor (${issuerName}).`,
    };
  }, [activeTrack, brand, acquiringModel, issuerName, acquirerName]);

  // Step 3: Financial Breakdown & Receivables Schedule
  const moneyBreakdown = useMemo(() => {
    const isPix = activeTrack === 'pix_spi' || activeTrack === 'pix_auto_nfc' || activeTrack === 'med_seguranca' || activeTrack === 'open_finance_drex';
    if (isPix) {
      const pspFeePct = activeTrack === 'pix_auto_nfc' ? 0.45 : 0.35;
      const spiCost = 0.01;
      const pspFee = Number(((amount * pspFeePct) / 100).toFixed(2));
      const merchantNet = Number((amount - pspFee).toFixed(2));
      return {
        isPix: true,
        gross: amount,
        mdrPct: pspFeePct,
        mdrTotal: pspFee,
        interchangePct: 0,
        interchangeValue: 0,
        schemeFeePct: 0.01,
        schemeFeeValue: spiCost,
        acquirerSpreadPct: Number((pspFeePct - 0.01).toFixed(2)),
        acquirerSpreadValue: Number(Math.max(0, pspFee - spiCost).toFixed(2)),
        merchantNetD30: merchantNet,
        merchantNetD1: merchantNet,
        anticipationCost: 0,
        rows: [
          {
            parcela: 'Única (D+0)',
            when: 'Em < 1,5 segundo (SPI)',
            gross: amount,
            mdr: pspFee,
            netNormal: merchantNet,
            netAnticipated: merchantNet,
          },
        ],
      };
    }

    // Card Economics (Respecting BCB 304 on Debit and Downgrade if injected)
    const isDowngrade = injectedFailure === 'downgrade_tid';
    const baseInterchangePct =
      modality === 'debito'
        ? 0.5 // Teto Resolução BCB 304
        : modality === 'credito_1x'
        ? isDowngrade
          ? 2.15
          : 1.55
        : isDowngrade
        ? 2.45
        : 1.85;

    const schemeFeePct = 0.18;
    const acquirerSpreadPct = modality === 'debito' ? 0.45 : modality === 'credito_1x' ? 0.72 : 0.85;
    const mdrPct = Number((baseInterchangePct + schemeFeePct + acquirerSpreadPct).toFixed(2));

    const interchangeValue = Number(((amount * baseInterchangePct) / 100).toFixed(2));
    const schemeFeeValue = Number(((amount * schemeFeePct) / 100).toFixed(2));
    const mdrTotal = Number(((amount * mdrPct) / 100).toFixed(2));
    const acquirerSpreadValue = Number((mdrTotal - interchangeValue - schemeFeeValue).toFixed(2));
    const merchantNetNormal = Number((amount - mdrTotal).toFixed(2));

    const numInst = modality === 'debito' || modality === 'credito_1x' ? 1 : installments;
    const baseGrossSlice = Math.floor((amount / numInst) * 100) / 100;
    const grossResidual = Number((amount - baseGrossSlice * numInst).toFixed(2));

    const rows = Array.from({ length: numInst }, (_, idx) => {
      const pNo = idx + 1;
      const g = pNo === 1 ? Number((baseGrossSlice + grossResidual).toFixed(2)) : baseGrossSlice;
      const m = Number(((g * mdrPct) / 100).toFixed(2));
      const netNorm = Number((g - m).toFixed(2));
      const monthsToAnticipate = modality === 'debito' ? 0 : pNo;
      const discountFactor = monthsToAnticipate > 0 ? (monthlyAnticipationRate / 100) * monthsToAnticipate : 0;
      const netAnt = Number(Math.max(0, netNorm * (1 - discountFactor)).toFixed(2));
      return {
        parcela: `${pNo}ª de ${numInst}`,
        when: modality === 'debito' ? 'D+1 (08h30)' : `D+${pNo * 30}`,
        gross: g,
        mdr: m,
        netNormal: netNorm,
        netAnticipated: netAnt,
      };
    });

    const totalNetNormal = Number(rows.reduce((acc, r) => acc + r.netNormal, 0).toFixed(2));
    const totalNetAnticipated = Number(rows.reduce((acc, r) => acc + r.netAnticipated, 0).toFixed(2));
    const anticipationCost = Number((totalNetNormal - totalNetAnticipated).toFixed(2));

    return {
      isPix: false,
      gross: amount,
      mdrPct,
      mdrTotal,
      interchangePct: baseInterchangePct,
      interchangeValue,
      schemeFeePct,
      schemeFeeValue,
      acquirerSpreadPct,
      acquirerSpreadValue,
      merchantNetD30: totalNetNormal,
      merchantNetD1: totalNetAnticipated,
      anticipationCost,
      rows,
    };
  }, [activeTrack, amount, modality, installments, injectedFailure, monthlyAnticipationRate]);

  const filteredMilestones = useMemo(() => {
    return REGULATORY_MILESTONES.filter((m) => {
      if (eraFilter !== 'ALL' && m.era !== eraFilter) return false;
      if (activeTrack !== 'regras_2027_tempo' && !m.tracksAffected.includes(activeTrack)) return false;
      return true;
    });
  }, [eraFilter, activeTrack]);

  const trackMeta = TRACK_META[activeTrack];
  const hasFailure = injectedFailure !== 'none';

  return (
    <div className="space-y-6">
      {/* =====================================================================
          PASSO 1 — ESCOLHA O CENÁRIO (ESTILO PAYGRAMA: PÍLULAS + INJETAR FALHA)
         ===================================================================== */}
      <section className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 sm:p-7 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <span className="w-7 h-7 rounded-full bg-[#1F3FE0] text-white font-mono text-xs font-black flex items-center justify-center shadow-sm">
              1
            </span>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                Escolha o cenário e o arranjo de pagamento
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Selecione entre Cartão (4 Bandeiras), Liquidação SLC/B3, Disputas CE 3.0, Pix (SPI), Pix Automático/NFC, MED 2.0, Open Finance e Regras 2027+
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sendToDocStudio({
                mode: 'append_html',
                title: `Simulação Guiada — ${trackMeta.title}`,
                sourceModule: 'Laboratório O Pagamento por Dentro (/jornada)',
                metadata: {
                  brand: brand === 'amex' ? 'geral' : brand,
                  brandName: brand.toUpperCase(),
                  referenceId: `LAB-${activeTrack.toUpperCase()}`,
                  category: 'Jornada & Regulatório 2027',
                  effectiveDate: '2026–2027',
                  riskLevel: hasFailure ? 'Alto' : 'Baixo',
                  executiveSummary: trackMeta.subtitle,
                  recommendedAction: `Modelo: ${arrangementModelInfo.badge} · Cenário: ${injectedFailure}`,
                },
                html: `
                  <h3>Simulação de Fluxo — ${trackMeta.title}</h3>
                  <p><strong>Arranjo:</strong> ${arrangementModelInfo.badge} — ${arrangementModelInfo.desc}</p>
                  <p><strong>Valor Simulado:</strong> R$ ${amount.toFixed(2)} · <strong>Status:</strong> ${injectedFailure}</p>
                  <ol>
                    ${steps
                      .map(
                        (s) =>
                          `<li><strong>[${s.elapsedLabel}] ${s.codeBadge} — ${s.title}</strong> (${s.fromLabel} ➔ ${s.toLabel}): ${s.plainExplanation}</li>`
                      )
                      .join('')}
                  </ol>
                `,
              });
            }}
            className="px-3.5 py-2 rounded-full bg-slate-900 dark:bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all self-start sm:self-auto"
          >
            📝 Exportar Cenário p/ Doc Studio
          </button>
        </div>

        {/* 8 Abas Horizontais em Pílulas (Estilo Paygrama) */}
        <div className="flex flex-wrap items-center gap-2" role="tablist">
          {(Object.keys(TRACK_META) as LabTrackId[]).map((tId) => {
            const meta = TRACK_META[tId];
            const active = activeTrack === tId;
            return (
              <button
                key={tId}
                onClick={() => handleSelectTrack(tId)}
                className={`px-4 py-2 rounded-full text-xs font-bold border transition-all flex items-center gap-2 ${
                  active
                    ? 'bg-[#1F3FE0] text-white border-[#1F3FE0] shadow-md shadow-blue-600/20'
                    : 'bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-[#1F3FE0]'
                }`}
              >
                <span>{meta.shortLabel}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-full font-mono text-[10px] ${
                    active
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {meta.badge}
                </span>
              </button>
            );
          })}
        </div>

        {/* Controles Progressivos em Pílulas */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 pt-2">
          {/* Valor R$ */}
          <div className="lg:col-span-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/70 p-3.5">
            <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Valor da Operação (R$)
            </label>
            <div className="flex items-center gap-2">
              <span className="text-sm font-mono font-bold text-slate-500">R$</span>
              <input
                type="number"
                step="10"
                min="1"
                value={amount}
                onChange={(e) => setAmount(Math.max(1, Number(e.target.value) || 100))}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 font-mono text-sm font-black text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Controles específicos de Cartão / Clearing / Disputas */}
          {(activeTrack === 'cartao' || activeTrack === 'clearing_slc' || activeTrack === 'contestacao_ce3' || activeTrack === 'regras_2027_tempo') && (
            <div className="lg:col-span-9 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/70 p-3.5 space-y-3">
              <div className="flex flex-wrap items-center gap-4">
                {/* Bandeira */}
                <div className="space-y-1">
                  <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                    Bandeira
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {(['visa', 'mastercard', 'elo', 'amex'] as const).map((b) => (
                      <button
                        key={b}
                        onClick={() => setBrand(b)}
                        className={`px-3 py-1 rounded-full text-xs font-bold border transition-all ${
                          brand === b
                            ? 'bg-[#1F3FE0] text-white border-[#1F3FE0]'
                            : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                        }`}
                      >
                        {b === 'visa' ? 'Visa' : b === 'mastercard' ? 'Mastercard' : b === 'elo' ? 'Elo' : 'Amex'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Canal */}
                <div className="space-y-1">
                  <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                    Canal de Captura
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { id: 'pos_chip', label: 'Maquininha (Chip)' },
                      { id: 'softpos_nfc', label: 'Tap on Phone (NFC)' },
                      { id: 'ecom_3ds', label: 'E-Commerce (3DS 2.2)' },
                      { id: 'wallet_token', label: 'Carteira Digital (Token)' },
                    ].map((c) => (
                      <button
                        key={c.id}
                        onClick={() => {
                          setChannel(c.id as any);
                          setCurrentStepIdx(0);
                        }}
                        className={`px-3 py-1 rounded-full text-xs font-bold border transition-all ${
                          channel === c.id
                            ? 'bg-[#1F3FE0] text-white border-[#1F3FE0]'
                            : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                        }`}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Se E-Commerce 3DS: Revela Sem Desafio vs Com Desafio */}
                {channel === 'ecom_3ds' && (
                  <div className="space-y-1">
                    <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                      Autenticação 3DS 2.2
                    </div>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => setThreeDsChallenge('frictionless')}
                        className={`px-3 py-1 rounded-full text-xs font-bold border ${
                          threeDsChallenge === 'frictionless'
                            ? 'bg-emerald-600 text-white border-emerald-500'
                            : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                        }`}
                      >
                        Sem desafio (Frictionless)
                      </button>
                      <button
                        onClick={() => setThreeDsChallenge('challenge')}
                        className={`px-3 py-1 rounded-full text-xs font-bold border ${
                          threeDsChallenge === 'challenge'
                            ? 'bg-amber-600 text-white border-amber-500'
                            : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                        }`}
                      >
                        Com desafio no app
                      </button>
                    </div>
                  </div>
                )}

                {/* Modalidade */}
                <div className="space-y-1">
                  <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                    Modalidade
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { id: 'debito', label: 'Débito (Teto BCB 304)' },
                      { id: 'credito_1x', label: 'Crédito à vista' },
                      { id: 'parcelado', label: 'Parcelado Loja' },
                    ].map((m) => (
                      <button
                        key={m.id}
                        onClick={() => setModality(m.id as any)}
                        className={`px-3 py-1 rounded-full text-xs font-bold border transition-all ${
                          modality === m.id
                            ? 'bg-[#1F3FE0] text-white border-[#1F3FE0]'
                            : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Se Parcelado: Revela número de parcelas */}
                {modality === 'parcelado' && (
                  <div className="space-y-1">
                    <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                      Parcelas
                    </div>
                    <div className="flex gap-1">
                      {[2, 3, 6, 10, 12].map((n) => (
                        <button
                          key={n}
                          onClick={() => setInstallments(n)}
                          className={`px-2.5 py-1 rounded-full font-mono text-xs font-bold border ${
                            installments === n
                              ? 'bg-[#1F3FE0] text-white border-[#1F3FE0]'
                              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                          }`}
                        >
                          {n}x
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Se Aba 8 (Regras no Tempo): Seletor de Data & Época Regulatória */}
          {activeTrack === 'regras_2027_tempo' && (
            <div className="lg:col-span-12 rounded-2xl border border-blue-200 dark:border-blue-500/30 bg-blue-50/60 dark:bg-blue-950/20 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="space-y-1">
                <div className="text-[10px] font-mono font-black uppercase tracking-wider text-[#1F3FE0] dark:text-blue-400">
                  ⏳ Máquina do Tempo Regulatória & de Releases (2021 ➔ 2030)
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300">
                  Escolha a data de vigência ou clique em uma época para ver o que muda nas mensagens e na liquidação:
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="date"
                  value={selectedEraDate}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSelectedEraDate(val);
                    setInjectedFailure(val < '2023-04-01' ? 'era_2022_pre_cap' : 'none');
                  }}
                  className="rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 font-mono text-xs font-bold text-slate-900 dark:text-white"
                />
                {[
                  { label: 'Era 2022 (Pré-BCB 304)', date: '2022-06-01', fail: 'era_2022_pre_cap' },
                  { label: 'Era 2026 (Visa BRL + CAVV v9)', date: '2026-06-01', fail: 'none' },
                  { label: 'Era 2027+ (Split Tributário LC 214 + Passkeys)', date: '2027-06-01', fail: 'none' },
                ].map((era) => (
                  <button
                    key={era.date}
                    onClick={() => {
                      setSelectedEraDate(era.date);
                      setInjectedFailure(era.fail);
                      setCurrentStepIdx(0);
                    }}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                      selectedEraDate === era.date
                        ? 'bg-[#1F3FE0] text-white border-[#1F3FE0]'
                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    {era.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Acordeão: Quem Participa + Cálculo Automático do Modelo (4 Partes, PayFac, On-Us, 3 Partes, SPI) */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/60 p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-black text-slate-800 dark:text-slate-200">
                Quem participa deste arranjo:
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/80 border border-blue-300 dark:border-blue-500/40 text-xs font-bold text-[#1F3FE0] dark:text-blue-300">
                {arrangementModelInfo.badge}
              </span>
              <span className="text-xs text-slate-600 dark:text-slate-400">
                — {arrangementModelInfo.desc}
              </span>
            </div>
            <button
              onClick={() => setShowParticipantsAccordion((p) => !p)}
              className="text-xs font-bold text-[#1F3FE0] dark:text-blue-400 hover:underline"
            >
              {showParticipantsAccordion ? '▴ Ocultar participantes' : '▾ Customizar Emissor, Adquirente e Modelo'}
            </button>
          </div>

          {showParticipantsAccordion && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-slate-200 dark:border-slate-800">
              <div>
                <div className="text-[10px] font-mono font-bold uppercase text-slate-500 mb-1.5">
                  Banco Emissor / PSP
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {['Itaú', 'Nubank', 'Bradesco', 'Banco do Brasil', 'Inter', 'Santander'].map((em) => (
                    <button
                      key={em}
                      onClick={() => setIssuerName(em)}
                      className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                        issuerName === em
                          ? 'bg-[#1F3FE0] text-white border-[#1F3FE0]'
                          : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-[10px] font-mono font-bold uppercase text-slate-500 mb-1.5">
                  Adquirente / Credenciadora
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {['Getnet', 'Cielo', 'Rede', 'Stone', 'PagBank', 'Checkout.com'].map((acq) => (
                    <button
                      key={acq}
                      onClick={() => setAcquirerName(acq)}
                      className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                        acquirerName === acq
                          ? 'bg-[#1F3FE0] text-white border-[#1F3FE0]'
                          : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      {acq}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-[10px] font-mono font-bold uppercase text-slate-500 mb-1.5">
                  Modelo de Credenciamento
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { id: 'direto_4p', label: 'Direto (4 Partes)' },
                    { id: 'payfac_sub', label: 'Por Subcredenciadora (PayFac)' },
                    { id: 'on_us', label: 'On-Us' },
                    { id: 'tres_partes', label: '3 Partes' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      onClick={() => {
                        setAcquiringModel(m.id as any);
                        setCurrentStepIdx(0);
                      }}
                      className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                        acquiringModel === m.id
                          ? 'bg-[#1F3FE0] text-white border-[#1F3FE0]'
                          : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Linha de Pílulas: INJETAR FALHA (Estilo Paygrama) */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              ⚡ Injetar falha ou variação no cenário:
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {trackMeta.failures.map((f) => {
              const isSelected = injectedFailure === f.id;
              const isNormal = f.id === 'none';
              return (
                <button
                  key={f.id}
                  onClick={() => {
                    setInjectedFailure(f.id);
                    setCurrentStepIdx(0);
                  }}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all ${
                    isSelected
                      ? isNormal
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-rose-600 text-white border-rose-600 shadow-sm'
                      : 'bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-400'
                  }`}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Resumo "O que é este cenário" */}
        <div className="rounded-2xl bg-slate-100/80 dark:bg-slate-950/90 border border-slate-200/80 dark:border-slate-800 px-4 py-3 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
          <span className="font-mono font-bold uppercase text-[10px] text-slate-500 block mb-0.5">
            O QUE É ESTE CENÁRIO
          </span>
          <strong>{trackMeta.title}.</strong> {trackMeta.subtitle}
        </div>
      </section>

      {/* =====================================================================
          PASSO 2 — SIGA AS MENSAGENS (SPLIT 70% DIAGRAMA 3D ISOMÉTRICO / SEQUÊNCIA + 30% INSPETOR)
         ===================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Painel Esquerdo (~70% -> 8 colunas): Canvas Isométrico 3D ou Sequência ms */}
        <section className="lg:col-span-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/95 p-5 sm:p-6 shadow-sm space-y-4">
          {/* Header com Número 2 + Toggle Arquitetura 3D | Sequência */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-full bg-[#1F3FE0] text-white font-mono text-xs font-black flex items-center justify-center">
                2
              </span>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                Siga as mensagens passo a passo
              </h3>
            </div>

            <div className="inline-flex rounded-full border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 p-1">
              <button
                onClick={() => setDiagramMode('arquitetura')}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  diagramMode === 'arquitetura'
                    ? 'bg-[#1F3FE0] text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Arquitetura 3D
              </button>
              <button
                onClick={() => setDiagramMode('sequencia')}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  diagramMode === 'sequencia'
                    ? 'bg-[#1F3FE0] text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Sequência (ms)
              </button>
            </div>
          </div>

          {/* Barra Player: Anterior | 1 de N | Próximo | Reproduzir */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              disabled={safeStepIdx === 0}
              onClick={() => {
                setIsPlaying(false);
                setCurrentStepIdx((p) => Math.max(0, p - 1));
              }}
              className="px-3.5 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 disabled:opacity-40 text-xs font-bold text-slate-700 dark:text-slate-200"
            >
              ‹ Anterior
            </button>
            <span className="px-2 font-mono text-xs font-bold text-slate-600 dark:text-slate-400">
              {safeStepIdx + 1} de {steps.length}
            </span>
            <button
              disabled={safeStepIdx >= steps.length - 1}
              onClick={() => {
                setIsPlaying(false);
                setCurrentStepIdx((p) => Math.min(steps.length - 1, p + 1));
              }}
              className="px-3.5 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 disabled:opacity-40 text-xs font-bold text-slate-700 dark:text-slate-200"
            >
              Próximo ›
            </button>
            <button
              onClick={() => setIsPlaying((p) => !p)}
              className={`px-4 py-1.5 rounded-full text-xs font-black transition-all ${
                isPlaying
                  ? 'bg-rose-600 text-white'
                  : 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 hover:opacity-90'
              }`}
            >
              {isPlaying ? '⏸ Pausar' : '▶ Reproduzir'}
            </button>
          </div>

          {/* Faixa de Resultado (Outcome Banner — Verde Concluído ou Vermelho/Âmbar Falha) */}
          {(() => {
            const activeFailureObj =
              trackMeta.failures.find((f) => f.id === injectedFailure) || trackMeta.failures[0];
            const isOk = injectedFailure === 'none';
            return (
              <div
                className={`rounded-2xl border px-4 py-2.5 flex flex-wrap items-center gap-2.5 text-xs ${
                  isOk
                    ? 'bg-emerald-50/90 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-500/30 text-emerald-900 dark:text-emerald-200'
                    : 'bg-rose-50/90 dark:bg-rose-950/30 border-rose-200 dark:border-rose-500/30 text-rose-900 dark:text-rose-200'
                }`}
              >
                <span
                  className={`px-2.5 py-0.5 rounded-full font-mono text-[10px] font-black uppercase border ${
                    isOk
                      ? 'bg-white dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border-emerald-300'
                      : 'bg-white dark:bg-rose-900/60 text-rose-700 dark:text-rose-300 border-rose-300'
                  }`}
                >
                  {isOk ? '✓ CONCLUÍDO' : '⚠ CENÁRIO COM FALHA / EXCEÇÃO'}
                </span>
                <span className="font-medium">{activeFailureObj.impactSummary}</span>
              </div>
            );
          })()}

          {/* MODO A: ARQUITETURA ISOMÉTRICA 3D EM SVG PURO (ESTILO PAYGRAMA) */}
          {diagramMode === 'arquitetura' && currentStep && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-[#fcfcfd] dark:bg-slate-950 overflow-hidden p-2">
                <svg
                  viewBox="0 0 760 400"
                  className="w-full h-auto select-none"
                  role="img"
                  aria-label="Diagrama Isométrico 3D da Rede de Pagamentos"
                >
                  <defs>
                    <marker
                      id="isoArrowActive"
                      viewBox="0 0 10 10"
                      refX="8"
                      refY="5"
                      markerWidth="6"
                      markerHeight="6"
                      orient="auto-start-reverse"
                    >
                      <path d="M 0 1 L 10 5 L 0 9 z" fill="#1F3FE0" />
                    </marker>
                    <marker
                      id="isoArrowErr"
                      viewBox="0 0 10 10"
                      refX="8"
                      refY="5"
                      markerWidth="6"
                      markerHeight="6"
                      orient="auto-start-reverse"
                    >
                      <path d="M 0 1 L 10 5 L 0 9 z" fill="#E11D48" />
                    </marker>
                  </defs>

                  {/* Grade Isométrica Diagonal 30° no Fundo */}
                  <g className="opacity-35 dark:opacity-15" stroke="#cbd5e1" strokeWidth="1">
                    {[-200, -100, 0, 100, 200, 300, 400, 500, 600, 700].map((offset) => (
                      <React.Fragment key={offset}>
                        <line x1={offset} y1={0} x2={offset + 420} y2={400} />
                        <line x1={offset + 420} y1={0} x2={offset} y2={400} />
                      </React.Fragment>
                    ))}
                  </g>

                  {/* Conexões Tracejadas de Fundo entre todos os passos do cenário */}
                  {steps.map((st, idx) => {
                    const from = ISOMETRIC_COORDS[st.fromNode];
                    const to = ISOMETRIC_COORDS[st.toNode];
                    const isCurrent = idx === safeStepIdx;
                    if (isCurrent) return null;
                    return (
                      <line
                        key={`bg-line-${st.stepNo}`}
                        x1={from.x}
                        y1={from.y}
                        x2={to.x}
                        y2={to.y}
                        stroke="#94a3b8"
                        strokeOpacity={0.35}
                        strokeWidth="1.75"
                        strokeDasharray="5 5"
                      />
                    );
                  })}

                  {/* Seta Ativa do Passo Atual + Pílula Flutuante Azul Cobalto */}
                  {(() => {
                    const from = ISOMETRIC_COORDS[currentStep.fromNode];
                    const to = ISOMETRIC_COORDS[currentStep.toNode];
                    const midX = (from.x + to.x) / 2;
                    const midY = (from.y + to.y) / 2 - 18;
                    const isErr = currentStep.status === 'error';
                    const strokeColor = isErr ? '#E11D48' : '#1F3FE0';
                    const pillWidth = Math.max(195, Math.min(310, currentStep.codeBadge.length * 8 + 40));

                    return (
                      <g>
                        <line
                          x1={from.x}
                          y1={from.y}
                          x2={to.x}
                          y2={to.y}
                          stroke={strokeColor}
                          strokeWidth="3"
                          strokeDasharray="7 5"
                          markerEnd={isErr ? 'url(#isoArrowErr)' : 'url(#isoArrowActive)'}
                        />
                        {/* Sombra da Pílula Flutuante */}
                        <rect
                          x={midX - pillWidth / 2}
                          y={midY - 14}
                          width={pillWidth}
                          height={28}
                          rx={8}
                          fill={strokeColor}
                        />
                        <text
                          x={midX}
                          y={midY + 4}
                          textAnchor="middle"
                          fill="#ffffff"
                          fontSize="11.5"
                          fontWeight="800"
                          fontFamily="monospace"
                        >
                          {currentStep.codeBadge}
                        </text>
                      </g>
                    );
                  })()}

                  {/* Nós Isométricos 3D (Maquininha, PayFac, Stack Servidores Adquirente, Nuvem Bandeira/SPI, Prédio Banco Emissor, Registradora/CIP) */}
                  {(Object.keys(ISOMETRIC_COORDS) as IsometricNodeId[]).map((nodeId) => {
                    const coord = ISOMETRIC_COORDS[nodeId];
                    const labelMeta = trackMeta.actorLabels[nodeId];
                    const isFrom = currentStep.fromNode === nodeId;
                    const isTo = currentStep.toNode === nodeId;
                    const isActive = isFrom || isTo;
                    const strokeMain = isActive ? '#1F3FE0' : '#475569';
                    const fillTop = isActive ? '#DBEAFE' : '#F8FAFC';
                    const fillSide = isActive ? '#BFDBFE' : '#E2E8F0';

                    return (
                      <g
                        key={nodeId}
                        transform={`translate(${coord.x}, ${coord.y})`}
                        className="transition-all duration-300"
                      >
                        {/* Halo de Pulso quando Ativo */}
                        {isActive && (
                          <ellipse
                            cx="0"
                            cy="8"
                            rx="46"
                            ry="24"
                            fill="#1F3FE0"
                            fillOpacity="0.10"
                            stroke="#1F3FE0"
                            strokeWidth="1.2"
                            strokeDasharray="3 3"
                          />
                        )}

                        {/* Glifos Isométricos 3D Vetoriais */}
                        {coord.glyph === 'terminal' && (
                          <g stroke={strokeMain} strokeWidth="1.8" strokeLinejoin="round">
                            {/* Base Isométrica da Maquininha POS */}
                            <polygon points="0,-24 30,-8 0,8 -30,-8" fill={fillTop} />
                            <polygon points="-30,-8 0,8 0,18 -30,2" fill={fillSide} />
                            <polygon points="0,8 30,-8 30,2 0,18" fill={fillTop} />
                            {/* Visor Isométrico */}
                            <polygon points="0,-19 16,-10 4,-3 -12,-12" fill="#93C5FD" />
                            {/* Teclado Pinpad (Pontos) */}
                            <circle cx="-4" cy="-2" r="1.3" fill={strokeMain} />
                            <circle cx="0" cy="0" r="1.3" fill={strokeMain} />
                            <circle cx="4" cy="2" r="1.3" fill={strokeMain} />
                          </g>
                        )}

                        {coord.glyph === 'payfac' && (
                          <g stroke={strokeMain} strokeWidth="1.8" strokeLinejoin="round">
                            {/* Bloco Isométrico Gateway / PayFac */}
                            <polygon points="0,-24 28,-10 0,4 -28,-10" fill={fillTop} />
                            <polygon points="-28,-10 0,4 0,18 -28,4" fill={fillSide} />
                            <polygon points="0,4 28,-10 28,4 0,18" fill={fillTop} />
                            <circle cx="-12" cy="-1" r="2" fill={strokeMain} />
                            <circle cx="-5" cy="3" r="2" fill={strokeMain} />
                          </g>
                        )}

                        {coord.glyph === 'acquirer' && (
                          <g stroke={strokeMain} strokeWidth="1.8" strokeLinejoin="round">
                            {/* Stack 3D de 3 Servidores Empilhados (Adquirente + HSM) */}
                            {[14, 0, -14].map((dy, layerIdx) => (
                              <g key={layerIdx} transform={`translate(0, ${dy})`}>
                                <polygon points="0,-22 32,-6 0,10 -32,-6" fill={fillTop} />
                                <polygon points="-32,-6 0,10 0,20 -32,4" fill={fillSide} />
                                <polygon points="0,10 32,-6 32,4 0,20" fill={fillTop} />
                                <circle cx="-18" cy="1" r="1.6" fill={strokeMain} />
                                <circle cx="-11" cy="5" r="1.6" fill={strokeMain} />
                              </g>
                            ))}
                          </g>
                        )}

                        {coord.glyph === 'network' && (
                          <g stroke={strokeMain} strokeWidth="1.8" strokeLinejoin="round">
                            {/* Nuvem + Globo Isométrico da Bandeira / SPI */}
                            <path
                              d="M -22,6 C -32,6 -34,-8 -22,-11 C -18,-24 4,-26 12,-14 C 26,-16 32,-2 22,6 Z"
                              fill={fillTop}
                            />
                            <circle cx="0" cy="-4" r="10" fill="none" />
                            <ellipse cx="0" cy="-4" rx="5" ry="10" fill="none" />
                            <line x1="-10" y1="-4" x2="10" y2="-4" />
                          </g>
                        )}

                        {coord.glyph === 'issuer' && (
                          <g stroke={strokeMain} strokeWidth="1.8" strokeLinejoin="round">
                            {/* Prédio Clássico Isométrico 3D com Colunas (Banco Emissor) */}
                            {/* Base */}
                            <polygon points="0,4 34,20 0,36 -34,20" fill={fillSide} />
                            {/* Colunas */}
                            <rect x="-22" y="-6" width="5" height="22" fill={fillTop} />
                            <rect x="-8" y="-2" width="5" height="22" fill={fillTop} />
                            <rect x="6" y="-2" width="5" height="22" fill={fillTop} />
                            <rect x="18" y="-6" width="5" height="22" fill={fillTop} />
                            {/* Telhado Frontão Isométrico */}
                            <polygon points="0,-30 36,-10 0,6 -36,-10" fill={fillSide} />
                            <polygon points="0,-36 36,-10 0,-4 -36,-10" fill={fillTop} />
                          </g>
                        )}

                        {coord.glyph === 'chamber' && (
                          <g stroke={strokeMain} strokeWidth="1.8" strokeLinejoin="round">
                            {/* Câmara Registradora B3 / CIP SLC / Cofre Bacen */}
                            <polygon points="0,-24 30,-9 0,6 -30,-9" fill={fillTop} />
                            <polygon points="-30,-9 0,6 0,24 -30,9" fill={fillSide} />
                            <polygon points="0,6 30,-9 30,9 0,24" fill={fillTop} />
                            <circle cx="14" cy="7" r="5" fill={fillSide} />
                          </g>
                        )}

                        {/* Rótulos do Nó (Nome + Papel) */}
                        <text
                          x="0"
                          y="48"
                          textAnchor="middle"
                          fontSize="12"
                          fontWeight="800"
                          fill={isActive ? '#1F3FE0' : '#1e293b'}
                        >
                          {labelMeta.name}
                        </text>
                        <text
                          x="0"
                          y="62"
                          textAnchor="middle"
                          fontSize="10.5"
                          fill="#64748b"
                        >
                          {labelMeta.role}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* Rodapé do Canvas Isométrico: Título do Passo + Hops de Sistemas + Bolinhas 1..N */}
              <div className="space-y-2.5 pt-1">
                <div>
                  <div className="font-mono text-sm font-black text-slate-900 dark:text-white">
                    {currentStep.title}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {currentStep.systemHops}
                  </div>
                </div>

                {/* Bolinhas Numeradas 1..N (Estilo Paygrama) */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {steps.map((st, idx) => {
                    const active = idx === safeStepIdx;
                    return (
                      <button
                        key={st.stepNo}
                        onClick={() => {
                          setIsPlaying(false);
                          setCurrentStepIdx(idx);
                        }}
                        className={`w-7 h-7 rounded-full font-mono text-xs font-black border transition-all flex items-center justify-center ${
                          active
                            ? 'bg-slate-900 dark:bg-[#1F3FE0] text-white border-slate-900 dark:border-[#1F3FE0] scale-105'
                            : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:border-[#1F3FE0]'
                        }`}
                      >
                        {st.stepNo}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* MODO B: DIAGRAMA DE SEQUÊNCIA CRONOMETRADO EM MILISSEGUNDOS (ESTILO PAYGRAMA) */}
          {diagramMode === 'sequencia' && currentStep && (
            <div className="space-y-4">
              {/* Cabeçalho dos Participantes com Envelope Verde Flutuante */}
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 pt-4">
                {(Object.keys(ISOMETRIC_COORDS) as IsometricNodeId[]).map((nodeId) => {
                  const meta = trackMeta.actorLabels[nodeId];
                  const isReceiver = currentStep.toNode === nodeId;
                  const isSender = currentStep.fromNode === nodeId;
                  return (
                    <div
                      key={nodeId}
                      className={`relative rounded-2xl border p-2.5 text-center transition-all ${
                        isReceiver
                          ? 'border-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/30 shadow-xs'
                          : isSender
                          ? 'border-[#1F3FE0] bg-blue-50/60 dark:bg-blue-950/30'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/60'
                      }`}
                    >
                      {isReceiver && (
                        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-mono font-black shadow-xs">
                          ✉ RECEBE
                        </div>
                      )}
                      <div className="text-xs font-black text-slate-900 dark:text-white truncate">
                        {meta.name}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate">{meta.role}</div>
                    </div>
                  );
                })}
              </div>

              {/* Linhas de Mensagens com Coluna de Milissegundos à Esquerda */}
              <div className="divide-y divide-slate-100 dark:divide-slate-800/80 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                {steps.map((st, idx) => {
                  const active = idx === safeStepIdx;
                  const prevStage = idx > 0 ? steps[idx - 1].stageTitle : null;
                  const showStageHeader = st.stageTitle !== prevStage;

                  return (
                    <React.Fragment key={st.stepNo}>
                      {showStageHeader && (
                        <div className="bg-slate-100/90 dark:bg-slate-950 px-4 py-1.5 font-mono text-[10px] font-black uppercase tracking-wider text-slate-500">
                          {st.stageTitle}
                        </div>
                      )}
                      <button
                        onClick={() => {
                          setIsPlaying(false);
                          setCurrentStepIdx(idx);
                        }}
                        className={`w-full px-4 py-3 text-left transition-all flex items-center justify-between gap-3 ${
                          active
                            ? 'bg-blue-50/80 dark:bg-blue-950/40'
                            : 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-16 shrink-0 text-right font-mono">
                            <div className="text-xs font-black text-slate-800 dark:text-slate-200">
                              #{st.stepNo}
                            </div>
                            <div className="text-[11px] text-slate-500">{st.elapsedLabel}</div>
                          </div>

                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span
                                className={`px-2.5 py-0.5 rounded-full font-mono text-xs font-black ${
                                  active
                                    ? st.status === 'error'
                                      ? 'bg-rose-600 text-white'
                                      : 'bg-[#1F3FE0] text-white'
                                    : 'bg-slate-100 dark:bg-slate-800 text--[#1F3FE0] dark:text-blue-300'
                                }`}
                              >
                                {st.codeBadge}
                              </span>
                              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                {st.fromLabel} → {st.toLabel}
                              </span>
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                              {st.title}
                            </div>
                          </div>
                        </div>

                        <span className="font-mono text-xs font-bold text-[#1F3FE0] dark:text-blue-400 shrink-0">
                          {active ? '● Ativo' : 'Ver →'}
                        </span>
                      </button>
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          )}
        </section>

        {/* Painel Direito Sticky (~30% -> 4 colunas): Inspetor da Mensagem e Campos Técnicos */}
        {currentStep && (
          <aside className="lg:col-span-4 lg:sticky lg:top-4 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/95 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-500">
                PASSO {currentStep.stepNo} DE {steps.length} · {currentStep.elapsedLabel}
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full font-mono text-[10px] font-black uppercase border ${
                  currentStep.status === 'error'
                    ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-300'
                    : currentStep.status === 'warning'
                    ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-300'
                    : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300'
                }`}
              >
                {currentStep.status === 'error'
                  ? '✕ FALHA / REJECT'
                  : currentStep.status === 'warning'
                  ? '⚠ EXCEÇÃO / DOWNGRADE'
                  : '✓ NORMAL'}
              </span>
            </div>

            <div>
              <h4 className="font-mono text-base sm:text-lg font-black text-slate-900 dark:text-white leading-snug">
                {currentStep.codeBadge}
              </h4>
              <div className="text-xs font-bold text-slate-500 mt-0.5">
                {currentStep.fromLabel} → {currentStep.toLabel}
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {currentStep.plainExplanation}
            </p>

            {/* Acordeão 1: Sobre esta etapa & Norma Oficial */}
            <div className="border-t border-slate-200 dark:border-slate-800 pt-3">
              <button
                onClick={() => setExpandAboutStep((p) => !p)}
                className="w-full text-left flex items-center justify-between text-xs font-black text-[#1F3FE0] dark:text-blue-400"
              >
                <span>
                  {expandAboutStep ? '▾' : '▸'} Sobre esta etapa: {currentStep.deepDiveTitle}
                </span>
              </button>
              {expandAboutStep && (
                <div className="mt-2 space-y-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  <p>{currentStep.deepDiveNormative}</p>
                  <div className="rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2.5 font-mono text-[11px] text-slate-500">
                    <strong>Fonte Oficial:</strong> {currentStep.normativeSource}
                  </div>
                </div>
              )}
            </div>

            {/* Acordeão 2: Campos técnicos da mensagem (N) */}
            <div className="border-t border-slate-200 dark:border-slate-800 pt-3">
              <button
                onClick={() => setExpandTechFields((p) => !p)}
                className="w-full text-left flex items-center justify-between text-xs font-black text-slate-900 dark:text-white"
              >
                <span>
                  {expandTechFields ? '▾' : '▸'} Campos técnicos da mensagem ({currentStep.fields.length})
                </span>
              </button>
              {expandTechFields && (
                <div className="mt-2.5 space-y-2">
                  {currentStep.fields.map((f, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950 p-2.5 text-xs space-y-0.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono font-black text-[#1F3FE0] dark:text-blue-400">
                          {f.code}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">{f.note}</span>
                      </div>
                      <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                        {f.name}
                      </div>
                      <div className="font-mono text-xs text-slate-900 dark:text-emerald-300 break-all">
                        {f.value}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </aside>
        )}
      </div>

      {/* =====================================================================
          PASSO 3 — PARA ONDE VAI O DINHEIRO & AGENDA DE RECEBÍVEIS (COM ANTECIPAÇÃO D+1)
         ===================================================================== */}
      <section className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/95 p-5 sm:p-7 shadow-sm space-y-5">
        <div className="flex items-center gap-2.5">
          <span className="w-7 h-7 rounded-full bg-[#1F3FE0] text-white font-mono text-xs font-black flex items-center justify-center">
            3
          </span>
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
              Para onde vai o dinheiro e quando o lojista recebe
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Divisão econômica da transação de R$ {amount.toFixed(2)} e simulação da Agenda de Recebíveis (normal vs antecipada para D+1)
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Coluna Esquerda (5 cols): Barra Proporcional Empilhada (Estilo Paygrama) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Barra Empilhada */}
            {(() => {
              const netVal = anticipateToD1 ? moneyBreakdown.merchantNetD1 : moneyBreakdown.merchantNetD30;
              const netPct = Math.max(5, (netVal / moneyBreakdown.gross) * 100);
              const icPct = (moneyBreakdown.interchangeValue / moneyBreakdown.gross) * 100;
              const feePct = (moneyBreakdown.schemeFeeValue / moneyBreakdown.gross) * 100;
              const acqPct = Math.max(0.5, 100 - netPct - icPct - feePct);

              return (
                <>
                  <div className="h-4 w-full rounded-full overflow-hidden flex bg-slate-200 dark:bg-slate-800">
                    <div
                      style={{ width: `${netPct}%` }}
                      className="bg-emerald-600 h-full transition-all"
                      title="Lojista recebe"
                    />
                    {icPct > 0 && (
                      <div
                        style={{ width: `${icPct}%` }}
                        className="bg-[#1F3FE0] h-full transition-all"
                        title="Intercâmbio (Emissor)"
                      />
                    )}
                    <div
                      style={{ width: `${feePct}%` }}
                      className="bg-amber-500 h-full transition-all"
                      title="Tarifa Bandeira / SPI"
                    />
                    <div
                      style={{ width: `${acqPct}%` }}
                      className="bg-slate-600 h-full transition-all"
                      title="Adquirente / Antecipação"
                    />
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                        Lojista recebe {anticipateToD1 && !moneyBreakdown.isPix ? '(Antecipado D+1)' : ''}
                      </span>
                      <span className="font-mono font-black text-slate-900 dark:text-white">
                        R$ {netVal.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#1F3FE0]" />
                        {moneyBreakdown.isPix
                          ? 'Intercâmbio Emissor (Isento no Pix)'
                          : `Intercâmbio (${issuerName} — ${moneyBreakdown.interchangePct.toFixed(2)}%)`}
                      </span>
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                        R$ {moneyBreakdown.interchangeValue.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                        {moneyBreakdown.isPix
                          ? 'Custo Liquidação SPI (Banco Central)'
                          : `Tarifa da Bandeira (${brand.toUpperCase()} — ${moneyBreakdown.schemeFeePct.toFixed(2)}%)`}
                      </span>
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                        R$ {moneyBreakdown.schemeFeeValue.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                        <span className="w-2.5 h-2.5 rounded-full bg-slate-600" />
                        {moneyBreakdown.isPix
                          ? 'Tarifa PSP Recebedor (Pix PJ)'
                          : `Spread ${acquirerName} (${moneyBreakdown.acquirerSpreadPct.toFixed(2)}%)`}
                      </span>
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                        R$ {moneyBreakdown.acquirerSpreadValue.toFixed(2)}
                      </span>
                    </div>

                    {anticipateToD1 && !moneyBreakdown.isPix && moneyBreakdown.anticipationCost > 0 && (
                      <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800 text-amber-700 dark:text-amber-400">
                        <span className="font-bold">
                          Custo de Antecipação p/ D+1 ({monthlyAnticipationRate}% a.m.)
                        </span>
                        <span className="font-mono font-black">
                          - R$ {moneyBreakdown.anticipationCost.toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="text-[11px] text-slate-500 pt-1">
                    MDR total de R$ {moneyBreakdown.mdrTotal.toFixed(2)} ({moneyBreakdown.mdrPct.toFixed(2)}%).{' '}
                    {modality === 'debito' && !moneyBreakdown.isPix
                      ? 'Enquadrado no teto regulatório de 0,50% da Resolução BCB 304/2023.'
                      : ''}
                  </div>
                </>
              );
            })()}
          </div>

          {/* Coluna Direita (7 cols): Agenda de Recebíveis + Checkbox "Antecipar tudo para D+1" */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-mono text-xs font-black uppercase tracking-wider text-slate-500">
                AGENDA DE RECEBÍVEIS & GRADE DE LIQUIDAÇÃO
              </span>

              {!moneyBreakdown.isPix && modality !== 'debito' && (
                <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800 dark:text-slate-200">
                  <input
                    type="checkbox"
                    checked={anticipateToD1}
                    onChange={(e) => setAnticipateToD1(e.target.checked)}
                    className="rounded border-slate-300 text-[#1F3FE0] focus:ring-[#1F3FE0]"
                  />
                  <span>Antecipar tudo para D+1 ({monthlyAnticipationRate}% a.m.)</span>
                </label>
              )}
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950 text-slate-500 font-mono text-[11px] border-b border-slate-200 dark:border-slate-800">
                    <th className="py-2.5 px-3">Parcela</th>
                    <th className="py-2.5 px-3">Quando</th>
                    <th className="py-2.5 px-3 text-right">Bruto</th>
                    <th className="py-2.5 px-3 text-right">MDR / Taxa</th>
                    <th className="py-2.5 px-3 text-right">
                      {anticipateToD1 && !moneyBreakdown.isPix ? 'Antecipado (D+1)' : 'Líquido'}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                  {moneyBreakdown.rows.map((r, i) => (
                    <tr key={i} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                      <td className="py-2 px-3 font-bold text-slate-800 dark:text-slate-200">{r.parcela}</td>
                      <td className="py-2 px-3 text-slate-600 dark:text-slate-400">
                        {anticipateToD1 && !moneyBreakdown.isPix ? 'D+1 (ASLC031)' : r.when}
                      </td>
                      <td className="py-2 px-3 text-right text-slate-800 dark:text-slate-200">
                        R$ {r.gross.toFixed(2)}
                      </td>
                      <td className="py-2 px-3 text-right text-rose-600 dark:text-rose-400">
                        R$ {r.mdr.toFixed(2)}
                      </td>
                      <td className="py-2 px-3 text-right font-black text-emerald-700 dark:text-emerald-400">
                        R$ {(anticipateToD1 && !moneyBreakdown.isPix ? r.netAnticipated : r.netNormal).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 font-mono font-black text-slate-900 dark:text-white">
                    <td className="py-2.5 px-3" colSpan={2}>
                      Total
                    </td>
                    <td className="py-2.5 px-3 text-right">R$ {moneyBreakdown.gross.toFixed(2)}</td>
                    <td className="py-2.5 px-3 text-right text-rose-600">
                      R$ {moneyBreakdown.mdrTotal.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-right text-emerald-700 dark:text-emerald-400">
                      R${' '}
                      {(anticipateToD1 && !moneyBreakdown.isPix
                        ? moneyBreakdown.merchantNetD1
                        : moneyBreakdown.merchantNetD30
                      ).toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          § REGRAS VIGENTES, REGULATÓRIO BACEN & O QUE VEM PARA 2027–2030
         ===================================================================== */}
      <section className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/95 p-5 sm:p-7 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-full bg-[#1F3FE0] text-white font-mono text-xs font-black flex items-center justify-center">
              §
            </span>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                Regras Regulatórias (Banco Central), Pix & O Que Vem para 2027–2030
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Normas em vigor hoje, cronograma confirmado 2026/2027 (Split Tributário LC 214, MED 2.0, Pix Automático/NFC, Passkeys) e horizonte 2028+
              </p>
            </div>
          </div>

          {/* Filtro por Época */}
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'ALL', label: 'Todas as Épocas (9)' },
              { id: 'em_vigor', label: '🟢 Em Vigor Hoje' },
              { id: 'chegando_2027', label: '🚀 Cronograma 2026 / 2027' },
              { id: 'horizonte_2028_2030', label: '🔭 Horizonte 2028–2030' },
            ].map((ef) => (
              <button
                key={ef.id}
                onClick={() => setEraFilter(ef.id as any)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                  eraFilter === ef.id
                    ? 'bg-[#1F3FE0] text-white border-[#1F3FE0]'
                    : 'bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                }`}
              >
                {ef.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMilestones.map((m) => {
            const is2027 = m.era === 'chegando_2027';
            const isFuture = m.era === 'horizonte_2028_2030';
            return (
              <div
                key={m.id}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/70 p-4 flex flex-col justify-between gap-3 hover:border-[#1F3FE0] transition-all"
              >
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-1.5">
                    <span
                      className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-black uppercase border ${
                        is2027
                          ? 'bg-blue-100 dark:bg-blue-950 text-[#1F3FE0] dark:text-blue-300 border-blue-300'
                          : isFuture
                          ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border-purple-300'
                          : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-300'
                      }`}
                    >
                      {m.badge}
                    </span>
                    <span className="font-mono text-[10px] font-bold text-slate-500">
                      {m.effectiveDate}
                    </span>
                  </div>

                  <div className="font-mono text-[11px] font-bold text-[#1F3FE0] dark:text-blue-400">
                    {m.normCode}
                  </div>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white leading-snug">
                    {m.title}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {m.whatChangesInPractice}
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-200/80 dark:border-slate-800 text-[11px]">
                  <div>
                    <strong className="text-slate-800 dark:text-slate-200">Impacto Técnico:</strong>{' '}
                    <span className="text-slate-600 dark:text-slate-400">{m.technicalImpact}</span>
                  </div>
                  <div>
                    <strong className="text-slate-800 dark:text-slate-200">Impacto Financeiro:</strong>{' '}
                    <span className="text-slate-600 dark:text-slate-400">{m.financialImpact}</span>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="font-mono text-[10px] text-slate-500 truncate max-w-[200px]">
                      {m.officialSource}
                    </span>
                    <button
                      onClick={() => {
                        setActiveTrack('regras_2027_tempo');
                        setCurrentStepIdx(0);
                      }}
                      className="text-xs font-bold text-[#1F3FE0] dark:text-blue-400 hover:underline shrink-0"
                    >
                      Ver no tempo →
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
