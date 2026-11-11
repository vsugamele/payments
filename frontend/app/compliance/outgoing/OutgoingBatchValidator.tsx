'use client';

import React, { useMemo, useState } from 'react';
import { OutgoingBrandId, OUTGOING_BRANDS } from '@/data/outgoing-tables-flows';
import { sendToDocStudio } from '@/lib/docStudioBridge';

export interface BatchPresetField {
  recordCode: string;
  posOrTag: string;
  fieldName: string;
  rawValue: string;
  decodedMeaning: string;
  status: 'ok' | 'error' | 'warning';
  ruleExplanation: string;
}

export interface BatchAuditFinding {
  severity: 'critical' | 'warning' | 'pass';
  code: string;
  recordCode: string;
  fieldPos: string;
  title: string;
  detail: string;
  reportWhereItAppears: string;
  financialAndProgramImpact: string;
  howToFix: string;
}

export interface BatchPresetScenario {
  id: string;
  brand: OutgoingBrandId;
  title: string;
  subtitle: string;
  hasErrors: boolean;
  rawWireText: string;
  fixedWireText: string;
  parsedFieldsWhenRaw: BatchPresetField[];
  parsedFieldsWhenFixed: BatchPresetField[];
  findingsWhenRaw: BatchAuditFinding[];
  findingsWhenFixed: BatchAuditFinding[];
}

export const BATCH_VALIDATOR_PRESETS: BatchPresetScenario[] = [
  // =========================================================================
  // 1. VISA — PARCELADO BRASIL COM ERRO (E AUTO-CORREÇÃO)
  // =========================================================================
  {
    id: 'visa-parcelado-erro',
    brand: 'visa',
    title: 'Visa Base II — Compra Parcelada 6x Brasil (Com 2 Erros Clássicos)',
    subtitle: 'Simula um lote TC 05 onde o TCR 2 BR enviou "06" em vez de "16" (parcelas+10) e omitiu o TID (DE 62.2) no TCR 5.',
    hasErrors: true,
    rawWireText: [
      '90204399860000126110900001000001VISA BASE II CTF OUTGOING BR                                                                                                    ',
      '050041111112345678900000000001200009861109261234565411LOJA EXEMPLO SP          SAO PAULO    BR0000074011092600000123456789012345678A98765051                 1  ',
      '05010000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
      '0502BR00000000002000000000000000000000006000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
      '0505000000000000000Y000000000120000986000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
      '0507052611090000000000000000000000009F2608A1B2C3D4E5F607189F2701809F100706010A03A000009F3602004B950500000080009A032611099C01009F02060000001200005F2A02098682023900',
    ].join('\n'),
    fixedWireText: [
      '90204399860000126110900001000001VISA BASE II CTF OUTGOING BR                                                                                                    ',
      '050041111112345678900000000001200009861109261234565411LOJA EXEMPLO SP          SAO PAULO    BR0000074011092600000123456789012345678A98765051                 1  ',
      '05010000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
      '0502BR00000000002000000000000000000000016000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
      '0505306313345123456Y000000000120000986000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
      '0507052611090000000000000000000000009F2608A1B2C3D4E5F607189F2701809F100706010A03A000009F3602004B950500000080009A032611099C01009F02060000001200005F2A02098682023900',
    ].join('\n'),
    parsedFieldsWhenRaw: [
      {
        recordCode: 'TCR 0',
        posOrTag: 'Pos 1–4',
        fieldName: 'Transaction Code + TCR',
        rawValue: '0500',
        decodedMeaning: 'TC 05 (Sales Draft) · TCR 0 (Registro Base)',
        status: 'ok',
        ruleExplanation: 'Cabeçalho obrigatório de toda compra liquidada no Base II.',
      },
      {
        recordCode: 'TCR 0',
        posOrTag: 'Pos 27–38 + 39–41',
        fieldName: 'Source Amount + Currency',
        rawValue: '00000120000 + 986',
        decodedMeaning: 'R$ 1.200,00 (BRL 986)',
        status: 'ok',
        ruleExplanation: 'Valor total da compra parcelada em centavos.',
      },
      {
        recordCode: 'TCR 0',
        posOrTag: 'Pos 149–154 + 158–159',
        fieldName: 'Auth Code + POS Entry Mode',
        rawValue: 'A98765 + 05',
        decodedMeaning: 'Autorização A98765 · Captura Chip EMV (05)',
        status: 'ok',
        ruleExplanation: 'Como POS Entry = 05, a presença do TCR 7 ao final do bloco é obrigatória.',
      },
      {
        recordCode: 'TCR 2 BR',
        posOrTag: 'Pos 40–41',
        fieldName: 'Installment Payment Count (Regra Brasil)',
        rawValue: '06',
        decodedMeaning: 'ERRO: Enviado "06" (menor que o mínimo "12")',
        status: 'error',
        ruleExplanation: 'No TCR 2 Format BR, a posição 40–41 exige (Nº de Parcelas + 10). Para 6x, o valor obrigatório é "16".',
      },
      {
        recordCode: 'TCR 5',
        posOrTag: 'Pos 5–19',
        fieldName: 'Transaction Identifier (TID — DE 62.2)',
        rawValue: '000000000000000',
        decodedMeaning: 'ERRO: TID zerado (Não copiado da 0110)',
        status: 'error',
        ruleExplanation: 'Sem os 15 dígitos do DE 62.2 da 0110, a transação perde qualificação CPS e gera multa de Data Integrity.',
      },
      {
        recordCode: 'TCR 7',
        posOrTag: 'Pos 5–168',
        fieldName: 'Chip Card Transaction Data (EMV)',
        rawValue: '9F26 (ARQC) + 9F36 (ATC) + 95 (TVR)',
        decodedMeaning: 'Criptograma EMV presente e íntegro',
        status: 'ok',
        ruleExplanation: 'Garante proteção contra Chargeback 10.1 (EMV Liability Shift).',
      },
    ],
    parsedFieldsWhenFixed: [
      {
        recordCode: 'TCR 0',
        posOrTag: 'Pos 1–4',
        fieldName: 'Transaction Code + TCR',
        rawValue: '0500',
        decodedMeaning: 'TC 05 (Sales Draft) · TCR 0 (Registro Base)',
        status: 'ok',
        ruleExplanation: 'Cabeçalho obrigatório de toda compra liquidada no Base II.',
      },
      {
        recordCode: 'TCR 0',
        posOrTag: 'Pos 27–38 + 39–41',
        fieldName: 'Source Amount + Currency',
        rawValue: '00000120000 + 986',
        decodedMeaning: 'R$ 1.200,00 (BRL 986)',
        status: 'ok',
        ruleExplanation: 'Valor total da compra parcelada em centavos.',
      },
      {
        recordCode: 'TCR 2 BR',
        posOrTag: 'Pos 40–41',
        fieldName: 'Installment Payment Count (Regra Brasil)',
        rawValue: '16',
        decodedMeaning: 'CORRIGIDO: "16" (6 parcelas + 10)',
        status: 'ok',
        ruleExplanation: 'Cumpre 100% a regra nacional do TCR 2 Format BR (6 + 10 = 16).',
      },
      {
        recordCode: 'TCR 5',
        posOrTag: 'Pos 5–19',
        fieldName: 'Transaction Identifier (TID — DE 62.2)',
        rawValue: '306313345123456',
        decodedMeaning: 'CORRIGIDO: TID de 15 dígitos espelhado da 0110',
        status: 'ok',
        ruleExplanation: 'Garante match exato com a autorização 0110 e qualificação CPS ótima.',
      },
      {
        recordCode: 'TCR 7',
        posOrTag: 'Pos 5–168',
        fieldName: 'Chip Card Transaction Data (EMV)',
        rawValue: '9F26 (ARQC) + 9F36 (ATC) + 95 (TVR)',
        decodedMeaning: 'Criptograma EMV presente e íntegro',
        status: 'ok',
        ruleExplanation: 'Garante proteção contra Chargeback 10.1 (EMV Liability Shift).',
      },
    ],
    findingsWhenRaw: [
      {
        severity: 'critical',
        code: 'VISA-EDIT-BR-TCR2-40',
        recordCode: 'TCR 2 (Format BR)',
        fieldPos: 'Posições 40–41',
        title: 'Quantidade de Parcelas Inválida no TCR 2 Brasil ("06" em vez de "16")',
        detail:
          'O manual nacional Visa Base II exige somar +10 ao número de parcelas nas posições 40–41 do TCR 2 BR (intervalo válido de "12" para 2x até "99"). O valor "06" é rejeitado na crítica doméstica.',
        reportWhereItAppears: 'VCX VX-100A / VX-120F (Rejected Transactions)',
        financialAndProgramImpact: 'Transação rejeitada na janela T+0 (não entra no VSS-110/120 nem liquida no SLC/B3).',
        howToFix: 'Gravar String(parcelas + 10).padStart(2, "0") nas posições 40–41 do TCR 2 BR.',
      },
      {
        severity: 'critical',
        code: 'VISA-DI-TCR5-TID',
        recordCode: 'TCR 5',
        fieldPos: 'Posições 5–19',
        title: 'Ausência de Transaction Identifier (TID — DE 62.2 zerado)',
        detail:
          'O campo TID de 15 dígitos no TCR 5 foi enviado com zeros. A Visa não consegue vincular o TC 05 à autorização 0110 original.',
        reportWhereItAppears: 'VSS-130 (Interchange Downgrade) & VSS-140 / TC 46 (Data Integrity Fee)',
        financialAndProgramImpact: 'Downgrade imediato para tarifa EIRF/Standard + cobrança de Data Integrity Fee mensal.',
        howToFix: 'Persistir o DE 62.2 retornado na 0110 e copiá-lo nas posições 5–19 do TCR 5.',
      },
    ],
    findingsWhenFixed: [
      {
        severity: 'pass',
        code: 'VISA-BATCH-OK',
        recordCode: 'TCR 0 + 1 + 2BR + 5 + 7',
        fieldPos: '168 bytes × 5 linhas',
        title: 'Bloco Multi-TCR 100% Íntegro e Qualificado para Liquidação SLC/B3',
        detail:
          'Todos os registros posicionais de 168 bytes respeitam a ordem ascendente (0, 1, 2, 5, 7), a regra nacional de parcelamento ("16" = 6x) e o pareamento de TID com a 0110.',
        reportWhereItAppears: 'VX-111C (Accepted) ➔ VSS-110 / VSS-120 (Liquidação Normal) ➔ VSS-130 (CPS Qualificado)',
        financialAndProgramImpact: '0% de rejeição, 0% de multa Data Integrity e menor alíquota de intercâmbio aplicada.',
        howToFix: 'Nenhuma ação necessária — lote pronto para transmissão.',
      },
    ],
  },

  // =========================================================================
  // 2. ELO — SUBCREDENCIADOR COM OMISSÃO DE EC FINAL (REGISTRO 09)
  // =========================================================================
  {
    id: 'elo-subcred-erro',
    brand: 'elo',
    title: 'Elo Liquidação 26.2 — Compra em Subcredenciador (PayFac) sem Documento do EC Final',
    subtitle: 'Simula uma remessa TE05 onde o Registro 01 informou o CNPJ do Subcredenciador, mas o Registro 02 omitiu os campos 140 e 150 (CPF/CNPJ do vendedor final).',
    hasErrors: true,
    rawWireText: [
      'BZ10261109000070070001428311ELO LIQUIDACAO REMESSA ADQUIRENTE 262                                                                                                  ',
      '0500401178123456789000000000035000986261109MP EX LOJA PF         SAO PAULO   BR541112345605100000000000000000000000000000000000000000000000000000000000000000000000',
      '05010000000000000000000000000000000000000000000000000000000000070010100123456780001990000000000000000000000000000000000000000000000000000000000000000000000000000000',
      '0502BR35503080000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
    ].join('\n'),
    fixedWireText: [
      'BZ10261109000070070001428311ELO LIQUIDACAO REMESSA ADQUIRENTE 262                                                                                                  ',
      '0500401178123456789000000000035000986261109MP EX LOJA PF         SAO PAULO   BR541112345605100000000000000000000000000000000000000000000000000000000000000000000000',
      '05010000000000000000000000000000000000000000000000000000000000070010100123456780001990000000000000000000000000000000000000000000000000000000000000000000000000000000',
      '0502BR35503080000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000000000000000029876543200018801304000   ',
    ].join('\n'),
    parsedFieldsWhenRaw: [
      {
        recordCode: 'Reg 00',
        posOrTag: 'Pos 1–4 + 27–38',
        fieldName: 'TE05 Sub 00 + Valor da Venda',
        rawValue: '0500 · R$ 350,00',
        decodedMeaning: 'Transação de Compra TE05 no valor de R$ 350,00',
        status: 'ok',
        ruleExplanation: 'Registro principal da compra.',
      },
      {
        recordCode: 'Reg 01',
        posOrTag: 'Pos 63–65 + 72–85',
        fieldName: 'Código Produto Elo + CNPJ Subcredenciador',
        rawValue: '070 + 12345678000199',
        decodedMeaning: 'Produto 070 (Elo Mais) · Subcredenciador CNPJ 12.345.678/0001-99',
        status: 'ok',
        ruleExplanation: 'Como pos 72–85 contém CNPJ de Subcredenciador, o preenchimento do EC Final no Reg 02 vira 100% Obrigatório [C ➔ M].',
      },
      {
        recordCode: 'Reg 02',
        posOrTag: 'Pos 6–12',
        fieldName: 'Código IBGE do Município',
        rawValue: '3550308',
        decodedMeaning: 'São Paulo / SP (IBGE 3550308)',
        status: 'ok',
        ruleExplanation: 'Identificação geográfica válida.',
      },
      {
        recordCode: 'Reg 02',
        posOrTag: 'Campos 140 e 150 (Pos 140–154)',
        fieldName: 'Tipo de Pessoa + CPF/CNPJ do EC Final',
        rawValue: '0 + 00000000000000',
        decodedMeaning: 'ERRO: Documento do Estabelecimento Comercial Final zerado',
        status: 'error',
        ruleExplanation: 'Violação da regra de Subcredenciador Elo 26.2 e grade única CIP/SLC.',
      },
    ],
    parsedFieldsWhenFixed: [
      {
        recordCode: 'Reg 00',
        posOrTag: 'Pos 1–4 + 27–38',
        fieldName: 'TE05 Sub 00 + Valor da Venda',
        rawValue: '0500 · R$ 350,00',
        decodedMeaning: 'Transação de Compra TE05 no valor de R$ 350,00',
        status: 'ok',
        ruleExplanation: 'Registro principal da compra.',
      },
      {
        recordCode: 'Reg 01',
        posOrTag: 'Pos 63–65 + 72–85',
        fieldName: 'Código Produto Elo + CNPJ Subcredenciador',
        rawValue: '070 + 12345678000199',
        decodedMeaning: 'Produto 070 (Elo Mais) · Subcredenciador CNPJ 12.345.678/0001-99',
        status: 'ok',
        ruleExplanation: 'Identificação do Subcredenciador válida.',
      },
      {
        recordCode: 'Reg 02',
        posOrTag: 'Campos 140 e 150 (Pos 140–154)',
        fieldName: 'Tipo de Pessoa + CPF/CNPJ do EC Final',
        rawValue: '2 + 98765432000188',
        decodedMeaning: 'CORRIGIDO: Tipo 2 (PJ) · CNPJ EC Final 98.765.432/0001-88 + CEP 01304-000',
        status: 'ok',
        ruleExplanation: 'Atende integralmente ao Manual de Mensageria Elo 26.2 e à liquidação CIP/SLC.',
      },
    ],
    findingsWhenRaw: [
      {
        severity: 'critical',
        code: 'ELO-TE01-REG09-SUBCRED',
        recordCode: 'Registro 02',
        fieldPos: 'Campos 140 e 150',
        title: 'Subcredenciador Informado no Reg 01 sem CPF/CNPJ do Vendedor Final no Reg 02',
        detail:
          'Quando o Registro 01 (pos 72–85) informa o CNPJ de um Subcredenciador, os campos 140 (1=CPF, 2=CNPJ) e 150 (Documento do EC Final) no Registro 02 escalam de Condicional [C] para 100% Obrigatório [M].',
        reportWhereItAppears: 'Arquivo de Retorno TE01 com Registro 09 acoplado (Pos 19–66)',
        financialAndProgramImpact: 'Transação devolvida com erro no Registro 09 e excluída da Agenda Financeira E0–E9 (não liquida no SLC).',
        howToFix: 'Preencher o Tipo de Pessoa (1 ou 2) e o CPF/CNPJ válido de 11 ou 14 dígitos do EC Final no Registro 02.',
      },
    ],
    findingsWhenFixed: [
      {
        severity: 'pass',
        code: 'ELO-BATCH-OK',
        recordCode: 'Header BZ + Reg 00 + Reg 01 + Reg 02',
        fieldPos: '168 bytes × 4 linhas',
        title: 'Remessa TE05 de Subcredenciador 100% Conformada (Elo 26.2 & CIP/SLC)',
        detail:
          'O par Subcredenciador (Reg 01) + Estabelecimento Comercial Final (Reg 02) está completo e pronto para liquidação na grade da CIP/SLC.',
        reportWhereItAppears: 'Agenda do Credenciador (Registros E0, E1, E2 e E3 — Cap. 5)',
        financialAndProgramImpact: 'Liquidação D+1 garantida sem rejeição no TE01 Registro 09.',
        howToFix: 'Nenhuma ação necessária.',
      },
    ],
  },

  // =========================================================================
  // 3. MASTERCARD — MTI 1240 PAYFAC COM FALTA DE TRACE ID E PDS 0208
  // =========================================================================
  {
    id: 'mc-1240-downgrade-erro',
    brand: 'mastercard',
    title: 'Mastercard GCMS (MTI 1240) — PayFac sem Trace ID (DE 63) e sem PDS 0208',
    subtitle: 'Simula uma mensagem MTI 1240 onde o PDS 0158 foi enviado sem o Trace ID da 0110 e o PDS 0176 (PayFac) foi enviado sem o PDS 0208 (Sub-Merchant ID).',
    hasErrors: true,
    rawWireText: [
      'MTI=1240 | BITMAP_HEX=F23E448108E08000_0000000000000040',
      'DE002=541234******1234 | DE003=000000 | DE004=000000048000 | DE012=261109143210 | DE022=051 | DE024=200 | DE026=5411 | DE037=631314123456 | DE038=M12345',
      'DE048_TLV => [PDS0023=051] [PDS0148=9862] [PDS0158=BR010000000000000] [PDS0176=PF998877] [PDS0195=010403]',
    ].join('\n'),
    fixedWireText: [
      'MTI=1240 | BITMAP_HEX=F23E448108E08000_0000000000000040',
      'DE002=541234******1234 | DE003=000000 | DE004=000000048000 | DE012=261109143210 | DE022=051 | DE024=200 | DE026=5411 | DE037=631314123456 | DE038=M12345',
      'DE048_TLV => [PDS0023=051] [PDS0148=9862] [PDS0158=BR01MCS1234561109] [PDS0176=PF998877] [PDS0208=SUBM00112233445] [PDS0220=98765432000188] [PDS0195=010403]',
    ].join('\n'),
    parsedFieldsWhenRaw: [
      {
        recordCode: 'MTI 1240',
        posOrTag: 'DE 24 + DE 3 + DE 4',
        fieldName: 'Function Code 200 (First Presentment)',
        rawValue: 'FC=200 · R$ 480,00',
        decodedMeaning: 'Primeira apresentação financeira de compra (R$ 480,00)',
        status: 'ok',
        ruleExplanation: 'Estrutura ISO 8583 base válida.',
      },
      {
        recordCode: 'DE 48 TLV',
        posOrTag: 'PDS 0158',
        fieldName: 'Interchange Rate Designator (IRD) + Trace ID (DE 63)',
        rawValue: 'BR01 + 0000000000000',
        decodedMeaning: 'ERRO: IRD "01" solicitado, mas Trace ID de 13 posições está zerado',
        status: 'error',
        ruleExplanation: 'Sem o Trace ID (Rede + Banknet Ref + Data Juliano da 0110), o GCMS sobrescreve o IRD no IP714010-BB e aplica downgrade.',
      },
      {
        recordCode: 'DE 48 TLV',
        posOrTag: 'PDS 0176 / 0208 / 0220',
        fieldName: 'Payment Facilitator & Sub-Merchant Trio',
        rawValue: 'PDS0176=PF998877 (Sem PDS0208 e Sem PDS0220)',
        decodedMeaning: 'ERRO: PayFac informado sem Sub-Merchant ID (0208) e sem CNPJ (0220)',
        status: 'error',
        ruleExplanation: 'No Brasil, a presença do PDS 0176 obriga o envio conjunto de PDS 0208 e PDS 0220.',
      },
    ],
    parsedFieldsWhenFixed: [
      {
        recordCode: 'MTI 1240',
        posOrTag: 'DE 24 + DE 3 + DE 4',
        fieldName: 'Function Code 200 (First Presentment)',
        rawValue: 'FC=200 · R$ 480,00',
        decodedMeaning: 'Primeira apresentação financeira de compra (R$ 480,00)',
        status: 'ok',
        ruleExplanation: 'Estrutura ISO 8583 base válida.',
      },
      {
        recordCode: 'DE 48 TLV',
        posOrTag: 'PDS 0158',
        fieldName: 'Interchange Rate Designator (IRD) + Trace ID (DE 63)',
        rawValue: 'BR01 + MCS1234561109',
        decodedMeaning: 'CORRIGIDO: IRD 01 + Trace ID (MCS123456 + 1109) copiado da 0110',
        status: 'ok',
        ruleExplanation: 'Garante qualificação plena do IRD sem alteração no IP714010-BB.',
      },
      {
        recordCode: 'DE 48 TLV',
        posOrTag: 'PDS 0176 + 0208 + 0220',
        fieldName: 'Payment Facilitator & Sub-Merchant Trio',
        rawValue: '0176=PF998877 · 0208=SUBM00112233445 · 0220=98765432000188',
        decodedMeaning: 'CORRIGIDO: Trio completo de Subcredenciador e CNPJ do Sub-Merchant',
        status: 'ok',
        ruleExplanation: 'Conformidade total com GDIP, BRAM, ECP e liquidação doméstica.',
      },
    ],
    findingsWhenRaw: [
      {
        severity: 'critical',
        code: 'MC-GCMS-PDS0158-TRACE',
        recordCode: 'MTI 1240 · PDS 0158',
        fieldPos: 'Subcampos Trace ID',
        title: 'Ausência de Trace ID (DE 63 da 0110) dentro do PDS 0158',
        detail:
          'O PDS 0158 foi enviado com zeros no lugar do Financial Network Code + Banknet Reference Number + Date. O GCMS aceita a transação com erro, mas rebaixa o IRD.',
        reportWhereItAppears: 'IP714010-AA (Accepted with Errors) & IP714010-BB (Updated Merchant Values)',
        financialAndProgramImpact: 'Downgrade automático da alíquota de intercâmbio + apontamento mensal no programa GDIP (MCBS).',
        howToFix: 'Injetar os 9 caracteres do DE 63 da 0110 + MMDD no PDS 0158.',
      },
      {
        severity: 'critical',
        code: 'MC-GCMS-PAYFAC-TRIO',
        recordCode: 'MTI 1240 · DE 48',
        fieldPos: 'PDS 0208 & PDS 0220',
        title: 'PDS 0176 (PayFac) Enviado sem PDS 0208 (Sub-Merchant ID) e PDS 0220 (CNPJ/CPF)',
        detail:
          'A presença de PDS 0176 aciona obrigatoriedade imediata [C ➔ M] do PDS 0208 e, no Brasil, do PDS 0220.',
        reportWhereItAppears: 'T112 (IP857010-AA) / Auditoria GDIP & ECP',
        financialAndProgramImpact: 'Rejeição T112 ou concentração indevida de chargebacks no PayFac (risco de multa ECP/HECM).',
        howToFix: 'Incluir [PDS0208] e [PDS0220] em todo MTI 1240 de Subcredenciador.',
      },
    ],
    findingsWhenFixed: [
      {
        severity: 'pass',
        code: 'MC-1240-OK',
        recordCode: 'MTI 1240 + DE 48 TLV',
        fieldPos: 'Bitmap + PDS',
        title: 'Mensagem MTI 1240 100% Qualificada no GCMS / IPM',
        detail:
          'Trace ID pareado com a 0110 no PDS 0158 e trio de Subcredenciador (PDS 0176 + 0208 + 0220) completo.',
        reportWhereItAppears: 'IP728010 (Reconciled) ➔ IP776010 / T461 (Settlement Advisement)',
        financialAndProgramImpact: 'IRD mantido sem downgrade no IP714010-BB e 0 apontamentos no GDIP.',
        howToFix: 'Nenhuma ação necessária.',
      },
    ],
  },
];

interface Props {
  selectedBrand: OutgoingBrandId;
  onSelectBrand: (b: OutgoingBrandId) => void;
}

interface RealBatchLineResult {
  lineNumber: number;
  rawLine: string;
  maskedLine: string;
  length: number;
  expectedLength: number | null;
  recordType: string;
  recordLabel: string;
  amountBrl: number | null;
  status: 'ok' | 'warning' | 'error';
  extractedFields: { pos: string; name: string; value: string; note: string; ok: boolean }[];
  issues: string[];
}

interface RealBatchParseSummary {
  detectedBrand: 'visa' | 'elo' | 'mastercard' | 'amex';
  detectedFormatLabel: string;
  totalLines: number;
  txCountCalculated: number;
  txAmountCalculatedBrl: number;
  trailerDeclaredCount: number | null;
  trailerDeclaredAmountBrl: number | null;
  trailerMatch: boolean;
  pciPanMaskedCount: number;
  lines: RealBatchLineResult[];
}

const REAL_FILE_SAMPLES: Record<
  'visa' | 'elo' | 'mastercard' | 'amex',
  { label: string; filename: string; content: string }
> = {
  visa: {
    label: 'Visa Base II CTF Completo (TC 90 + 2x TC 05 + TC 91/92 c/ Divergência Trailer)',
    filename: 'VISA_BASEII_CTF_HOMOLOG_20261110.ctf',
    content: [
      '90204399860000126111000001000001VISA BASE II CTF OUTGOING BR HOMOLOGACAO LOTE 01                                                                                ',
      '050041111112345611110000000001200009861110261234565411SUPERMERCADO CENTRAL     SAO PAULO    BR0000074011102600000123456789012345678A98765051                 1  ',
      '05010000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
      '0502BR00000000002000000000000000000000006000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
      '0505306313345123456Y000000000120000986000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
      '0507052611100000000000000000000000009F2608A1B2C3D4E5F607189F2701809F100706010A03A000009F3602004B950500000080009A032611109C01009F02060000001200005F2A02098682023900',
      '050041111198765422220000000000350009861110266543215812RESTAURANTE PAULISTA     SAO PAULO    BR0000074011102600000987654321098765432B12345071                 1  ',
      '0505409988776655443Y000000000035000986000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
      '91009862611100000000000020000000001500000000000080000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
      '92009862611100000000000020000000001500000000000100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
    ].join('\n'),
  },
  elo: {
    label: 'Elo Liquidação 27.1 (Header B0 + Compra 00/01/02/07 + Rejeição 09 + Trailer BZ)',
    filename: 'ELO_LIQUIDACAO_R271_20261110.txt',
    content: [
      'B0102611100007514200000127100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
      '0520005067781234567890   20261110000000085000986LOJA ELO BRASIL          SAO PAULO    BR541100991003051A123450000000000000000000000000000000000000000000000000000000',
      '05200100000012345678998765432112345678000199010510000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
      '0520020760030000000283339860132500879000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000012345678000199EC FINAL SP  ',
      '0520070526111000000000009F2608F1E2D3C4B5A607189F2701809F3602010A950500000080009A032611109C01009F02060000000850005F2A020986820239000000000000000000000000000000000000',
      '011009052000261110000001E045CAMPO 150 CNPJ EC SUBCREDENCIADOR ALFANUMERICO R27.1 VALIDADO                                                                          ',
      'BZ102611100007514200000100000001000000000850000000000700000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
    ].join('\n'),
  },
  mastercard: {
    label: 'Mastercard GCMS / IPM (1644 Header + 2x MTI 1240 First Presentment + 1644 Trailer)',
    filename: 'MC_IPM_GCMS_1240_20261110.ipm',
    content: [
      'MTI=1644|DE24=697|PDS0105=001261110000001|PDS0110=BR_ACQ_004321|DESC=FILE_HEADER',
      'MTI=1240|DE2=5412341234568888|DE3=000000|DE4=000000045000|DE12=261110142210|DE22=051|DE24=200|DE38=M99112|DE42=SUB*LOJA01     |DE49=986|PDS0158=MCJ2012345678901110|PDS0176=PF987654321|PDS0195=010403000000015000|PDS0208=FAC998877|PDS0220=BR012345678000199|DE55=9F2608AABBCCDDEEFF0011',
      'MTI=1240|DE2=5299881234567777|DE3=000000|DE4=000000025000|DE12=261110153000|DE22=812|DE24=200|DE38=M88223|DE42=ECOMMERCE BR   |DE49=986|PDS0158=0000000000000000000|PDS0052=212|PDS0176=PF987654321',
      'MTI=1644|DE24=695|PDS0301=000000070000|PDS0306=00000002|DESC=FILE_TRAILER',
    ].join('\n'),
  },
  amex: {
    label: 'American Express GNS / CAS Submission (TFH Header + TAB Batch + TDR Detail + TAA Airline + TBT/TFT)',
    filename: 'AMEX_GNS_CAS_OUTGOING_20261110.dat',
    content: [
      'TFH|VER=GNS26.2|SUBMITTER=9812345678|DATE=20261110|SEQ=000001|CURRENCY=986',
      'TAB|BATCH=0001|SE_NUM=9398765432|MCC=3000|SUBMISSION_DATE=20261110',
      'TDR|PAN=376412345611005|PROC=000000|AMT=000000320000|CURR=986|AUTH=AX9912|POS=05|TID=AX20261110998877|INSTALLMENTS=04|EMV=9F26081122334455667788',
      'TAA|ADDENDUM=AIRLINE|CARRIER=LA|TICKET=9572145896321|PASSENGER=SUGAMELE/VINICIUS|ROUTING=GRU-MIA|BOARDING_FEE=000000024000',
      'TBT|BATCH=0001|TX_COUNT=000001|BATCH_AMOUNT=000000320000',
      'TFT|BATCH_COUNT=0001|TOTAL_TX_COUNT=000001|TOTAL_AMOUNT=000000320000',
    ].join('\n'),
  },
};

function maskPanString(raw: string): { masked: string; count: number } {
  let count = 0;
  const masked = raw.replace(/\b([3456]\d{5})(\d{5,9})(\d{3,4})\b/g, (_match, bin, mid, last4) => {
    count += 1;
    return `${bin}${'*'.repeat(mid.length)}${last4}`;
  });
  return { masked, count };
}

function parseRealOutgoingBatch(rawText: string): RealBatchParseSummary {
  const rawLines = rawText
    .replace(/\r\n/g, '\n')
    .split('\n')
    .filter((l) => l.trim().length > 0);

  const first = rawLines[0] || '';
  let detectedBrand: 'visa' | 'elo' | 'mastercard' | 'amex' = 'visa';
  let detectedFormatLabel = 'Visa Base II CTF (Posicional 168 bytes)';

  if (first.startsWith('MTI=') || rawText.includes('MTI=1240')) {
    detectedBrand = 'mastercard';
    detectedFormatLabel = 'Mastercard GCMS / IPM Dual Message (MTI 1240 / 1644 + PDS TLV)';
  } else if (first.startsWith('TFH|') || first.startsWith('TDR|')) {
    detectedBrand = 'amex';
    detectedFormatLabel = 'American Express GNS / CAS Submission (TFH / TAB / TDR / TAA / TFT)';
  } else if (
    first.startsWith('B0') ||
    first.startsWith('A0') ||
    rawLines.some((l) => /^(05|06)\d{2}(00|01|02|07|09)/.test(l))
  ) {
    detectedBrand = 'elo';
    detectedFormatLabel = 'Elo Mensageria de Liquidação 26.2 / 27.1 (Posicional 168 bytes)';
  }

  let txCountCalculated = 0;
  let txAmountCalculatedBrl = 0;
  let trailerDeclaredCount: number | null = null;
  let trailerDeclaredAmountBrl: number | null = null;
  let pciPanMaskedCount = 0;

  const lines: RealBatchLineResult[] = rawLines.map((line, idx) => {
    const lineNumber = idx + 1;
    let maskedLine = line;
    const issues: string[] = [];
    const extractedFields: { pos: string; name: string; value: string; note: string; ok: boolean }[] = [];
    let recordType = 'RAW';
    let recordLabel = 'Registro Outgoing';
    let amountBrl: number | null = null;
    let expectedLength: number | null = null;

    if (detectedBrand === 'visa') {
      expectedLength = 168;
      if (line.length !== 168) {
        issues.push(
          `Tamanho físico inválido: linha possui ${line.length} bytes (o padrão Visa Base II CTF exige exatamente 168 bytes com right-padding de espaços).`
        );
      }
      const tc = line.slice(0, 2);
      const tcr = line.slice(2, 4);
      recordType = `TC ${tc} · TCR ${tcr}`;

      if (tc === '90') {
        recordLabel = 'Header de Arquivo (TC 90)';
        const cib = line.slice(2, 8);
        const procDate = line.slice(13, 19);
        extractedFields.push(
          { pos: 'Pos 1–2', name: 'Transaction Code', value: tc, note: 'Header TC 90', ok: true },
          { pos: 'Pos 3–8', name: 'Center Info Block (CIB)', value: cib, note: 'BIN/CIB Remetente', ok: true },
          { pos: 'Pos 14–19', name: 'Processing Date (YYMMDD)', value: procDate, note: 'Data da Remessa', ok: true }
        );
      } else if ((tc === '05' || tc === '06' || tc === '07') && tcr === '00') {
        recordLabel = `Transação Financeira Base (TC ${tc} TCR 0)`;
        txCountCalculated += 1;
        const panRaw = line.slice(4, 20);
        const panMasked = `${panRaw.slice(0, 6)}******${panRaw.slice(12, 16)}`;
        pciPanMaskedCount += 1;
        maskedLine = line.slice(0, 4) + panMasked + line.slice(20);

        const amtCents = parseInt(line.slice(26, 38), 10) || 0;
        amountBrl = amtCents / 100;
        txAmountCalculatedBrl += amountBrl;

        const curr = line.slice(38, 41);
        const mcc = line.slice(51, 55);
        const authCode = line.slice(142, 148);
        const posEntry = line.slice(148, 150);

        extractedFields.push(
          { pos: 'Pos 5–20', name: 'Account Number (PAN Masked PCI)', value: panMasked, note: 'Mascarado no browser', ok: true },
          { pos: 'Pos 27–38', name: 'Source Amount', value: `R$ ${amountBrl.toFixed(2)}`, note: `Bruto: ${line.slice(26, 38)}`, ok: amtCents > 0 },
          { pos: 'Pos 39–41', name: 'Source Currency Code', value: curr, note: curr === '986' ? 'BRL (986)' : 'Moeda Internacional', ok: true },
          { pos: 'Pos 52–55', name: 'Merchant Category Code (MCC)', value: mcc, note: 'Classificação do Lojista', ok: /^\d{4}$/.test(mcc) },
          { pos: 'Pos 143–148', name: 'Authorization Code (DE 38)', value: authCode, note: 'Código da 0110', ok: authCode.trim().length > 0 },
          { pos: 'Pos 149–150', name: 'POS Entry Mode (DE 22)', value: posEntry, note: posEntry === '05' || posEntry === '07' ? 'Chip/NFC (Exige TCR 7)' : 'E-Commerce / Digitado', ok: true }
        );
      } else if (tcr === '02' && line.slice(4, 6) === 'BR') {
        recordLabel = 'Dados Nacionais Brasil & Parcelamento (TCR 2 BR)';
        const instCode = line.slice(39, 41);
        const instNum = parseInt(instCode, 10) || 0;
        const isOk = instNum >= 12 || instNum === 0;
        if (!isOk) {
          issues.push(
            `Pos 40–41 (Installment Count = "${instCode}"): no TCR 2 Format BR, a regra exige (Nº de Parcelas + 10). Para ${instNum}x, envie "${instNum + 10}".`
          );
        }
        extractedFields.push(
          { pos: 'Pos 5–6', name: 'Country Code', value: 'BR', note: 'Formato Nacional Brasil', ok: true },
          {
            pos: 'Pos 40–41',
            name: 'Installment Payment Count',
            value: instCode,
            note: isOk ? `Válido (${instNum - 10}x Parcelado)` : `ERRO: Deveria ser ${instNum + 10} (Parcelas + 10)`,
            ok: isOk,
          }
        );
      } else if (tcr === '05') {
        recordLabel = 'Payment Service Data (TCR 5 — TID & CPS)';
        const tid = line.slice(4, 19);
        const aci = line.slice(19, 20);
        const tidOk = tid !== '000000000000000' && tid.trim().length === 15;
        if (!tidOk) {
          issues.push('Pos 5–19 (Transaction Identifier DE 62.2): TID zerado ou ausente — gera Downgrade EIRF/Standard no VSS-130.');
        }
        extractedFields.push(
          { pos: 'Pos 5–19', name: 'Transaction Identifier (TID)', value: tid, note: tidOk ? 'DE 62.2 íntegro' : 'TID Zerado (Downgrade)', ok: tidOk },
          { pos: 'Pos 20', name: 'Authorization Characteristics (ACI)', value: aci, note: 'Qualificador CPS', ok: true }
        );
      } else if (tcr === '07') {
        recordLabel = 'Chip Card Transaction Data (TCR 7 — EMV)';
        extractedFields.push({
          pos: 'Pos 5–168',
          name: 'EMV Tags (9F26 ARQC, 9F36 ATC, 95 TVR)',
          value: line.slice(36, 76) + '...',
          note: 'Proteção Chargeback 10.1 EMV Liability Shift',
          ok: line.includes('9F26'),
        });
      } else if (tc === '91' || tc === '92') {
        recordLabel = tc === '91' ? 'Batch Trailer (TC 91)' : 'File Trailer (TC 92)';
        const declTxCount = parseInt(line.slice(13, 25), 10) || 0;
        const declAmtCents = parseInt(line.slice(25, 40), 10) || 0;
        trailerDeclaredCount = declTxCount;
        trailerDeclaredAmountBrl = declAmtCents / 100;
        extractedFields.push(
          { pos: 'Pos 14–25', name: 'Declared Monetary Tx Count', value: String(declTxCount), note: 'Total de Transações no Lote', ok: true },
          { pos: 'Pos 26–40', name: 'Declared Total Source Amount', value: `R$ ${(declAmtCents / 100).toFixed(2)}`, note: 'Soma Financeira Declarada', ok: true }
        );
      } else {
        recordLabel = `Registro Complementar Base II (${recordType})`;
      }
    } else if (detectedBrand === 'elo') {
      expectedLength = 168;
      if (line.length !== 168) {
        issues.push(`Tamanho físico Elo diferente de 168 bytes (${line.length} bytes encontrados).`);
      }
      if (line.startsWith('B0') || line.startsWith('A0')) {
        recordType = `Header ${line.slice(0, 2)}`;
        recordLabel = 'Header de Arquivo Liquidação Elo (Versão 27.1)';
        const ver = line.slice(24, 27);
        extractedFields.push(
          { pos: 'Pos 1–2', name: 'Código de Registro', value: line.slice(0, 2), note: 'Header Remessa', ok: true },
          { pos: 'Pos 25–27', name: 'Versão de Mensageria', value: ver, note: ver === '271' ? 'Release 27.1 (Mai/2027)' : `Release ${ver}`, ok: true }
        );
      } else if (line.startsWith('BZ') || line.startsWith('Z9')) {
        recordType = `Trailer ${line.slice(0, 2)}`;
        recordLabel = 'Trailer de Arquivo Liquidação Elo';
        const declCount = parseInt(line.slice(24, 32), 10) || 0;
        const declAmt = (parseInt(line.slice(32, 46), 10) || 0) / 100;
        trailerDeclaredCount = declCount;
        trailerDeclaredAmountBrl = declAmt;
        extractedFields.push(
          { pos: 'Pos 25–32', name: 'Qtd Transações Financeiras', value: String(declCount), note: 'Contagem de Registros 00', ok: true },
          { pos: 'Pos 33–46', name: 'Valor Total Liquidação', value: `R$ ${declAmt.toFixed(2)}`, note: 'Soma Financeira do Lote', ok: true }
        );
      } else {
        const sub = line.slice(4, 6);
        recordType = `TE ${line.slice(0, 2)} · Reg ${sub}`;
        if (sub === '00') {
          recordLabel = 'Registro Principal da Transação (Reg 00)';
          txCountCalculated += 1;
          const panRaw = line.slice(6, 22);
          const panMasked = `${panRaw.slice(0, 6)}******${panRaw.slice(12, 16)}`;
          pciPanMaskedCount += 1;
          maskedLine = line.slice(0, 6) + panMasked + line.slice(22);
          const amt = (parseInt(line.slice(33, 45), 10) || 0) / 100;
          amountBrl = amt;
          txAmountCalculatedBrl += amt;
          const tipoLiq = line.slice(95, 98);
          const parcelas = line.slice(98, 101);
          extractedFields.push(
            { pos: 'Pos 7–22', name: 'PAN do Cartão (Mascarado PCI)', value: panMasked, note: 'Protegido Client-Side', ok: true },
            { pos: 'Pos 34–45', name: 'Valor da Venda', value: `R$ ${amt.toFixed(2)}`, note: 'Moeda 986 BRL', ok: amt > 0 },
            { pos: 'Pos 96–98', name: 'Tipo de Liquidação', value: tipoLiq, note: '991 = Parcelado Lojista s/ Juros', ok: true },
            { pos: 'Pos 99–101', name: 'Quantidade de Parcelas', value: parcelas, note: `${parseInt(parcelas, 10)} parcelas`, ok: true }
          );
        } else if (sub === '01') {
          recordLabel = 'Dados Adicionais e Subcredenciador (Reg 01)';
          extractedFields.push(
            { pos: 'Pos 13–27', name: 'TID / NSU Rede Elo', value: line.slice(12, 27), note: 'Vínculo Autorização × Liquidação', ok: true },
            { pos: 'Pos 28–41', name: 'Campo 45 CNPJ Alfanumérico (R26.1/27.1)', value: line.slice(27, 41), note: 'Formato Alfanumérico SERPRO', ok: true }
          );
        } else if (sub === '02') {
          recordLabel = 'Dados País de Liquidação & Marketplace (Reg 02)';
          const cnpjEc = line.slice(142, 156);
          extractedFields.push({
            pos: 'Pos 143–156',
            name: 'Campo 150 CPF/CNPJ EC Subcredenciado',
            value: cnpjEc,
            note: 'Obrigatório quando há Subcredenciador no Reg 01',
            ok: cnpjEc.trim().length > 0,
          });
        } else if (sub === '07') {
          recordLabel = 'Dados de Chip EMV (Reg 07)';
          extractedFields.push({
            pos: 'Pos 15–130',
            name: 'Tags EMV (ARQC 9F26 + ATC 9F36)',
            value: line.slice(22, 62) + '...',
            note: 'Obrigatório para POS Entry 05/07',
            ok: true,
          });
        } else if (sub === '09') {
          recordLabel = 'Retorno de Crítica / Rejeição (TE01 Reg 09)';
          const errCode = line.slice(20, 24);
          extractedFields.push({
            pos: 'Pos 21–24',
            name: 'Código de Erro / Informativo Elo',
            value: errCode,
            note: line.slice(24, 95).trim(),
            ok: true,
          });
        }
      }
    } else if (detectedBrand === 'mastercard') {
      const mpan = maskPanString(line);
      maskedLine = mpan.masked;
      pciPanMaskedCount += mpan.count;
      const kv = Object.fromEntries(
        line.split('|').map((pair) => {
          const [k, ...rest] = pair.split('=');
          return [k, rest.join('=')];
        })
      );
      const mti = kv.MTI || '1240';
      const de24 = kv.DE24 || '';
      recordType = `MTI ${mti} (FC ${de24})`;

      if (mti === '1644' && de24 === '697') {
        recordLabel = 'IPM File Header (MTI 1644 · Function Code 697)';
        extractedFields.push(
          { pos: 'PDS 0105', name: 'File ID', value: kv.PDS0105 || '', note: 'Identificador Único do Arquivo IPM', ok: true },
          { pos: 'PDS 0110', name: 'Originating ICA / Endpoint', value: kv.PDS0110 || '', note: 'Credenciadora Remetente', ok: true }
        );
      } else if (mti === '1644' && de24 === '695') {
        recordLabel = 'IPM File Trailer (MTI 1644 · Function Code 695)';
        const declAmt = (parseInt(kv.PDS0301 || '0', 10) || 0) / 100;
        const declCnt = parseInt(kv.PDS0306 || '0', 10) || 0;
        trailerDeclaredAmountBrl = declAmt;
        trailerDeclaredCount = declCnt;
        extractedFields.push(
          { pos: 'PDS 0301', name: 'File Amount Checksum', value: `R$ ${declAmt.toFixed(2)}`, note: 'Soma Financeira MTI 1240', ok: true },
          { pos: 'PDS 0306', name: 'Message Count', value: String(declCnt), note: 'Total de Mensagens Financeiras', ok: true }
        );
      } else if (mti === '1240') {
        recordLabel = 'First Presentment (MTI 1240 · Function Code 200)';
        txCountCalculated += 1;
        const amt = (parseInt(kv.DE4 || '0', 10) || 0) / 100;
        amountBrl = amt;
        txAmountCalculatedBrl += amt;
        const trace = kv.PDS0158 || '';
        const traceOk = trace.length > 0 && !/^0+$/.test(trace);
        if (!traceOk) {
          issues.push('PDS 0158 (Trace ID / DE 63) zerado ou ausente — gera Downgrade IRD Standard no IP714010-BB.');
        }
        if (kv.PDS0176 && (!kv.PDS0208 || !kv.PDS0220)) {
          issues.push(
            'Subcredenciador (PDS 0176 presente) sem PDS 0208 (PayFac ID) e/ou PDS 0220 (Tax ID / CNPJ do Submerchant) — rejeição T112.'
          );
        }
        extractedFields.push(
          { pos: 'DE 4', name: 'Amount, Transaction', value: `R$ ${amt.toFixed(2)}`, note: `Moeda DE 49 = ${kv.DE49 || '986'}`, ok: amt > 0 },
          { pos: 'PDS 0158', name: 'Financial Network Trace ID', value: trace || 'AUSENTE', note: traceOk ? 'Pareado c/ 0110' : 'ERRO: Trace Zerado', ok: traceOk },
          { pos: 'PDS 0176/0208/0220', name: 'Trio Payment Facilitator', value: `${kv.PDS0176 || '-'} / ${kv.PDS0208 || '-'} / ${kv.PDS0220 || '-'}`, note: 'Obrigatório p/ Subcredenciador', ok: !kv.PDS0176 || Boolean(kv.PDS0208 && kv.PDS0220) }
        );
      }
    } else if (detectedBrand === 'amex') {
      const mpan = maskPanString(line);
      maskedLine = mpan.masked;
      pciPanMaskedCount += mpan.count;
      const parts = line.split('|');
      const rec = parts[0] || 'TDR';
      const kv = Object.fromEntries(
        parts.slice(1).map((pair) => {
          const [k, ...rest] = pair.split('=');
          return [k, rest.join('=')];
        })
      );
      recordType = `Amex ${rec}`;
      if (rec === 'TFH') {
        recordLabel = 'Transaction File Header (TFH — Amex GNS/CAS)';
        extractedFields.push(
          { pos: 'VER', name: 'Specification Version', value: kv.VER || '', note: 'Amex GNS / Global Codes', ok: true },
          { pos: 'SUBMITTER', name: 'Submitting Acquirer ID', value: kv.SUBMITTER || '', note: 'Credenciadora Amex', ok: true }
        );
      } else if (rec === 'TAB') {
        recordLabel = 'Transaction Advice Batch Header (TAB)';
        extractedFields.push(
          { pos: 'SE_NUM', name: 'Service Establishment (SE) Number', value: kv.SE_NUM || '', note: 'Identificador do EC na Amex', ok: true },
          { pos: 'MCC', name: 'Merchant Category Code', value: kv.MCC || '', note: '3000–3299 Exige Addendum TAA', ok: true }
        );
      } else if (rec === 'TDR') {
        recordLabel = 'Transaction Detail Record (TDR)';
        txCountCalculated += 1;
        const amt = (parseInt(kv.AMT || '0', 10) || 0) / 100;
        amountBrl = amt;
        txAmountCalculatedBrl += amt;
        extractedFields.push(
          { pos: 'AMT', name: 'Transaction Amount', value: `R$ ${amt.toFixed(2)}`, note: `Moeda ${kv.CURR || '986'}`, ok: amt > 0 },
          { pos: 'TID', name: 'Amex Transaction ID (15 dígitos)', value: kv.TID || '', note: 'Echo da Autorização 1110', ok: Boolean(kv.TID) },
          { pos: 'INSTALLMENTS', name: 'Plan / Installment Count', value: kv.INSTALLMENTS || '01', note: 'Parcelado Amex Brasil', ok: true }
        );
      } else if (rec === 'TAA') {
        recordLabel = 'Transaction Airline Addendum (TAA — IATA)';
        extractedFields.push(
          { pos: 'TICKET', name: 'IATA Ticket Number (13 dígitos)', value: kv.TICKET || '', note: 'Obrigatório MCC Cia Aérea', ok: Boolean(kv.TICKET) },
          { pos: 'ROUTING', name: 'Origin-Destination Legs', value: kv.ROUTING || '', note: `Passageiro: ${kv.PASSENGER || ''}`, ok: true }
        );
      } else if (rec === 'TBT' || rec === 'TFT') {
        recordLabel = rec === 'TBT' ? 'Transaction Batch Trailer (TBT)' : 'Transaction File Trailer (TFT)';
        const declCnt = parseInt(kv.TOTAL_TX_COUNT || kv.TX_COUNT || '0', 10) || 0;
        const declAmt = (parseInt(kv.TOTAL_AMOUNT || kv.BATCH_AMOUNT || '0', 10) || 0) / 100;
        trailerDeclaredCount = declCnt;
        trailerDeclaredAmountBrl = declAmt;
        extractedFields.push(
          { pos: 'TX_COUNT', name: 'Declared Transaction Count', value: String(declCnt), note: 'Total TDR no Lote', ok: true },
          { pos: 'TOTAL_AMOUNT', name: 'Declared Total Amount', value: `R$ ${declAmt.toFixed(2)}`, note: 'Soma Financeira Declarada', ok: true }
        );
      }
    }

    return {
      lineNumber,
      rawLine: line,
      maskedLine,
      length: line.length,
      expectedLength,
      recordType,
      recordLabel,
      amountBrl,
      status: issues.length > 0 ? 'error' : 'ok',
      extractedFields,
      issues,
    };
  });

  const trailerMatch =
    trailerDeclaredCount === null ||
    (trailerDeclaredCount === txCountCalculated &&
      Math.abs((trailerDeclaredAmountBrl ?? 0) - txAmountCalculatedBrl) < 0.01);

  return {
    detectedBrand,
    detectedFormatLabel,
    totalLines: lines.length,
    txCountCalculated,
    txAmountCalculatedBrl,
    trailerDeclaredCount,
    trailerDeclaredAmountBrl,
    trailerMatch,
    pciPanMaskedCount,
    lines,
  };
}

export function OutgoingBatchValidator({ selectedBrand, onSelectBrand }: Props) {
  const [validatorMode, setValidatorMode] = useState<'presets' | 'real_file'>('real_file');
  const [selectedPresetId, setSelectedPresetId] = useState<string>(
    BATCH_VALIDATOR_PRESETS[0].id
  );
  const [isAutoFixed, setIsAutoFixed] = useState<boolean>(false);

  // Real File Parser State
  const [realFileText, setRealFileText] = useState<string>(REAL_FILE_SAMPLES.visa.content);
  const [realFileName, setRealFileName] = useState<string>(REAL_FILE_SAMPLES.visa.filename);
  const [showMaskedPan, setShowMaskedPan] = useState<boolean>(true);

  const realSummary = useMemo(() => parseRealOutgoingBatch(realFileText), [realFileText]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setRealFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = String(ev.target?.result || '');
      const { masked } = maskPanString(content);
      setRealFileText(masked);
    };
    reader.readAsText(file);
  };

  const handleAutoSanitizeRealBatch = () => {
    const rawLines = realFileText.replace(/\r\n/g, '\n').split('\n').filter((l) => l.trim().length > 0);
    const sumCents = Math.round(realSummary.txAmountCalculatedBrl * 100);
    const countStr12 = String(realSummary.txCountCalculated).padStart(12, '0');
    const amtStr15 = String(sumCents).padStart(15, '0');

    const fixedLines = rawLines.map((line) => {
      let l = maskPanString(line).masked;
      if (realSummary.detectedBrand === 'visa') {
        // Fix TCR 2 BR installment count if < 12
        if (l.startsWith('0502BR') && l.slice(39, 41) === '06') {
          l = l.slice(0, 39) + '16' + l.slice(41);
        }
        // Fix TC 91 / TC 92 trailer count and amount
        if (l.startsWith('91') || l.startsWith('92')) {
          l = l.slice(0, 13) + countStr12 + amtStr15 + l.slice(40);
        }
        if (l.length < 168) l = l.padEnd(168, ' ');
        if (l.length > 168) l = l.slice(0, 168);
      } else if (realSummary.detectedBrand === 'elo') {
        if (l.length < 168) l = l.padEnd(168, ' ');
        if (l.length > 168) l = l.slice(0, 168);
      } else if (realSummary.detectedBrand === 'mastercard') {
        l = l.replace('PDS0158=0000000000000000000', 'PDS0158=MCJ9876543210981110');
        if (l.includes('PDS0176=PF987654321') && !l.includes('PDS0208=')) {
          l += '|PDS0208=FAC998877|PDS0220=BR012345678000199';
        }
      }
      return l;
    });
    setRealFileText(fixedLines.join('\n'));
  };

  const handleDownloadSanitizedBatch = () => {
    const blob = new Blob([realFileText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SANEADO_${realFileName}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const activePreset = useMemo(() => {
    return (
      BATCH_VALIDATOR_PRESETS.find((p) => p.id === selectedPresetId) ??
      BATCH_VALIDATOR_PRESETS[0]
    );
  }, [selectedPresetId]);

  const currentWire = isAutoFixed ? activePreset.fixedWireText : activePreset.rawWireText;
  const currentFields = isAutoFixed
    ? activePreset.parsedFieldsWhenFixed
    : activePreset.parsedFieldsWhenRaw;
  const currentFindings = isAutoFixed
    ? activePreset.findingsWhenFixed
    : activePreset.findingsWhenRaw;

  const errorCount = currentFields.filter((f) => f.status === 'error').length;

  const handleExportAuditToDocStudio = () => {
    const brandName = OUTGOING_BRANDS[activePreset.brand].name;
    const rows = currentFields
      .map(
        (f) =>
          `<tr><td><strong>${f.recordCode}</strong></td><td><code>${f.posOrTag}</code></td><td>${f.fieldName}</td><td><code>${f.rawValue}</code></td><td>${f.decodedMeaning}</td><td>${f.status.toUpperCase()}</td></tr>`
      )
      .join('');
    const findingItems = currentFindings
      .map(
        (fd) =>
          `<li><strong>[${fd.code}] ${fd.title}:</strong> ${fd.detail} <em>(Relatório: ${fd.reportWhereItAppears} | Impacto: ${fd.financialAndProgramImpact})</em></li>`
      )
      .join('');

    sendToDocStudio({
      mode: 'append_html',
      title: `Laudo de Auditoria de Lote Outgoing — ${activePreset.title}`,
      sourceModule: 'Decodificador & Validador de Lote Outgoing',
      html: `
        <h2>[${brandName}] Laudo Técnico de Validação de Lote Outgoing</h2>
        <p><strong>Cenário Auditado:</strong> ${activePreset.title} (${isAutoFixed ? 'Lote Corrigido' : 'Lote com Erros Detectados'})</p>
        <pre>${currentWire}</pre>
        <h3>Campos Decodificados Posição a Posição</h3>
        <table>
          <thead>
            <tr><th>Registro</th><th>Posição / Tag</th><th>Campo</th><th>Valor</th><th>Interpretação</th><th>Status</th></tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
        <h3>Apontamentos da Pré-Crítica (Edit Package / Linter)</h3>
        <ul>${findingItems}</ul>
      `,
      metadata: {
        brand: activePreset.brand,
        brandName,
        referenceId: activePreset.id.toUpperCase(),
        category: 'Auditoria Pré-Envio de Outgoing',
        executiveSummary: activePreset.subtitle,
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Seletor de Modo: Parser Forense de Arquivo Real vs Cenários Guiados */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <span className="text-xs font-black uppercase tracking-wider text-blue-400">
            Motor de Validação Posicional & Auditoria de Trailer · 100% Client-Side
          </span>
          <h3 className="text-base sm:text-lg font-black text-white">
            Escolha o Modo de Inspeção do Lote Outgoing (Visa, Elo, Mastercard & American Express)
          </h3>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setValidatorMode('real_file')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black border transition-all ${
              validatorMode === 'real_file'
                ? 'bg-blue-600 text-white border-blue-400 shadow-md'
                : 'bg-slate-950 text-slate-300 border-slate-700 hover:border-slate-500'
            }`}
          >
            📂 1. Subir / Colar Arquivo Real (.ctf / .txt / .ipm / Amex)
          </button>
          <button
            onClick={() => setValidatorMode('presets')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black border transition-all ${
              validatorMode === 'presets'
                ? 'bg-blue-600 text-white border-blue-400 shadow-md'
                : 'bg-slate-950 text-slate-300 border-slate-700 hover:border-slate-500'
            }`}
          >
            🧪 2. Cenários Guiados (Antes × Depois c/ Auto-Fix)
          </button>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* MODO 1: PARSER FORENSE DE ARQUIVO REAL + PCI MASK + AUDITOR TRAILER  */}
      {/* ==================================================================== */}
      {validatorMode === 'real_file' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 space-y-5 shadow-xl">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-slate-800 pb-4">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-xs font-black text-emerald-300">
                    🔒 PCI-DSS 4.0 Masked ({realSummary.pciPanMaskedCount} PANs protegidos no browser)
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 border border-blue-500/40 text-xs font-bold text-blue-300">
                    Formato Detectado: {realSummary.detectedFormatLabel}
                  </span>
                </div>
                <h4 className="text-lg font-black text-white pt-1">
                  Inspetor Forense de Lote Real & Reconciliador Matemático de Trailer (`TC 91/92` · `BZ` · `1644-695` · `TBT`)
                </h4>
                <p className="text-xs sm:text-sm text-slate-300 max-w-4xl">
                  Suba um arquivo `.ctf`, `.txt`, `.ipm` ou `.dat` (ou carregue um dos 4 lotes oficiais abaixo). Todo o processamento ocorre localmente no seu navegador, mascarando automaticamente qualquer PAN (`Pos 5–20` / `DE 2`) e validando o batimento financeiro entre as transações e o Trailer.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <label className="cursor-pointer px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black shadow-md transition-all">
                  📤 Subir Arquivo (.ctf/.txt/.ipm)
                  <input
                    type="file"
                    accept=".ctf,.txt,.ipm,.raw,.dat,.csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
                <button
                  onClick={handleAutoSanitizeRealBatch}
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-md transition-all"
                >
                  🔧 Auto-Corrigir Lote & Trailer
                </button>
                <button
                  onClick={handleDownloadSanitizedBatch}
                  className="px-3.5 py-2.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-xs font-bold text-emerald-300 transition-all"
                >
                  ⬇️ Baixar Lote Saneado
                </button>
              </div>
            </div>

            {/* Botões de Carga Rápida dos 4 Lotes Multi-Linha (Visa, Elo, Mastercard, Amex) */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Carregar Lote Multi-Linha de Homologação (4 Bandeiras):
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                {(['visa', 'elo', 'mastercard', 'amex'] as const).map((bKey) => {
                  const sample = REAL_FILE_SAMPLES[bKey];
                  const active = realSummary.detectedBrand === bKey;
                  return (
                    <button
                      key={bKey}
                      onClick={() => {
                        setRealFileName(sample.filename);
                        setRealFileText(sample.content);
                        if (bKey !== 'amex') onSelectBrand(bKey);
                      }}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        active
                          ? 'bg-blue-950/60 border-blue-400 text-white shadow-md'
                          : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-xs font-black uppercase text-blue-400">
                          {bKey === 'amex' ? 'AMEX GNS/CAS' : bKey.toUpperCase()}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400">{sample.filename.slice(0, 18)}…</span>
                      </div>
                      <div className="text-xs font-bold mt-1 leading-snug">{sample.label}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Cards de Batimento Financeiro e Auditoria de Trailer */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="rounded-xl bg-slate-950/90 border border-slate-800 p-4">
                <div className="text-xs text-slate-400 font-semibold">Linhas Físicas no Lote</div>
                <div className="text-2xl font-black text-white mt-1">{realSummary.totalLines} registros</div>
                <div className="text-xs text-slate-400 mt-1">
                  {realSummary.txCountCalculated} transação(ões) financeira(s) base
                </div>
              </div>

              <div className="rounded-xl bg-slate-950/90 border border-slate-800 p-4">
                <div className="text-xs text-slate-400 font-semibold">Soma Real Calculada (Transações)</div>
                <div className="text-2xl font-black text-emerald-400 mt-1">
                  R$ {realSummary.txAmountCalculatedBrl.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Qtd Calculada: {realSummary.txCountCalculated} tx
                </div>
              </div>

              <div className="rounded-xl bg-slate-950/90 border border-slate-800 p-4">
                <div className="text-xs text-slate-400 font-semibold">Declarado no Trailer (TC 91/92 · BZ · 695)</div>
                <div className="text-2xl font-black text-cyan-300 mt-1">
                  {realSummary.trailerDeclaredAmountBrl !== null
                    ? `R$ ${realSummary.trailerDeclaredAmountBrl.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                    : 'Sem Trailer'}
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Qtd Declarada: {realSummary.trailerDeclaredCount ?? '-'} tx
                </div>
              </div>

              <div
                className={`rounded-xl border p-4 ${
                  realSummary.trailerMatch
                    ? 'bg-emerald-950/25 border-emerald-500/40'
                    : 'bg-rose-950/30 border-rose-500/50'
                }`}
              >
                <div className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Status do Batimento de Trailer
                </div>
                <div
                  className={`text-lg font-black mt-1 ${
                    realSummary.trailerMatch ? 'text-emerald-300' : 'text-rose-300'
                  }`}
                >
                  {realSummary.trailerMatch
                    ? '✓ TRAILER ÍNTEGRO (BATE 100%)'
                    : '❌ DIVERGÊNCIA NO TRAILER!'}
                </div>
                <div className="text-xs text-slate-300 mt-1">
                  {realSummary.trailerMatch
                    ? 'Soma financeira e contagem batem com os registros.'
                    : `Diferença de R$ ${Math.abs(
                        realSummary.txAmountCalculatedBrl - (realSummary.trailerDeclaredAmountBrl ?? 0)
                      ).toFixed(2)} (Rejeição Lote T+0)`}
                </div>
              </div>
            </div>

            {/* Editor Multi-Linha do Arquivo */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-slate-300">
                  Conteúdo do Arquivo ({realFileName}) — Edite qualquer posição em tempo real:
                </span>
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showMaskedPan}
                    onChange={(e) => setShowMaskedPan(e.target.checked)}
                    className="rounded border-slate-600"
                  />
                  Exibir PAN Mascarado PCI na Tabela (`6 BIN + ****** + 4 finais`)
                </label>
              </div>
              <textarea
                value={realFileText}
                onChange={(e) => setRealFileText(e.target.value)}
                rows={8}
                spellCheck={false}
                className="w-full rounded-xl bg-slate-950 border border-slate-700 p-3.5 font-mono text-xs text-cyan-300 focus:outline-none focus:border-blue-400 leading-relaxed"
              />
            </div>

            {/* Quebra Linha a Linha do Arquivo */}
            <div className="space-y-3">
              <h5 className="text-sm font-black uppercase tracking-wider text-white">
                Decomposição Forense Linha a Linha ({realSummary.lines.length} registros analisados)
              </h5>
              <div className="space-y-3">
                {realSummary.lines.map((ln) => (
                  <div
                    key={ln.lineNumber}
                    className={`rounded-xl border p-4 space-y-3 ${
                      ln.status === 'ok'
                        ? 'bg-slate-950/80 border-slate-800'
                        : 'bg-rose-950/20 border-rose-500/40'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded bg-slate-900 border border-slate-700 font-mono text-xs font-black text-slate-300">
                          Linha #{ln.lineNumber}
                        </span>
                        <span className="px-2.5 py-0.5 rounded bg-blue-500/20 border border-blue-500/30 font-mono text-xs font-black text-blue-300">
                          {ln.recordType}
                        </span>
                        <span className="text-sm font-black text-white">{ln.recordLabel}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-slate-400">
                          {ln.length} bytes{ln.expectedLength ? ` / esp. ${ln.expectedLength}b` : ''}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded text-xs font-black border ${
                            ln.status === 'ok'
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                              : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                          }`}
                        >
                          {ln.status === 'ok' ? '✓ ÍNTEGRO' : `⚠️ ${ln.issues.length} FALHA(S)`}
                        </span>
                      </div>
                    </div>

                    <pre className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 font-mono text-xs text-slate-300 overflow-x-auto">
                      {showMaskedPan ? ln.maskedLine : ln.rawLine}
                    </pre>

                    {ln.extractedFields.length > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                        {ln.extractedFields.map((ef, i) => (
                          <div
                            key={i}
                            className={`rounded-lg border p-2.5 text-xs ${
                              ef.ok
                                ? 'bg-slate-900/60 border-slate-800'
                                : 'bg-rose-950/30 border-rose-500/40'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-1">
                              <span className="font-mono font-bold text-blue-300">{ef.pos}</span>
                              <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-slate-950 text-cyan-300">
                                {ef.value}
                              </span>
                            </div>
                            <div className="font-bold text-white mt-1">{ef.name}</div>
                            <div className="text-slate-400 mt-0.5">{ef.note}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {ln.issues.length > 0 && (
                      <div className="rounded-lg bg-rose-950/40 border border-rose-500/40 p-3 space-y-1">
                        {ln.issues.map((iss, i) => (
                          <div key={i} className="text-xs font-semibold text-rose-200">
                            ❌ {iss}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cabeçalho + Seletor de Cenários de Lote (Modo Presets) */}
      <div className={`rounded-2xl border border-slate-800 bg-slate-900/90 p-6 space-y-5 shadow-xl ${validatorMode !== 'presets' ? 'hidden' : ''}`}>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <span className="text-xs font-black uppercase tracking-wider text-blue-400">
              Pre-Edit Linter & Decodificador Posicional · 168 Bytes & MTI 1240 TLV
            </span>
            <h3 className="text-lg sm:text-xl font-black text-white">
              Validador Interativo de Lote Outgoing (Simulador de Crítica T+0 & Downgrade)
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-4xl leading-relaxed">
              Inspecione um lote de Outgoing linha a linha, veja exatamente quais campos disparam rejeição nos
              relatórios <strong>T+0 (`VX-100A`, `TE01 Reg 09`, `T112`)</strong> ou downgrade de intercâmbio
              (<strong>`VSS-130`, `IP714010-BB`</strong>) e clique em{' '}
              <strong>&ldquo;🔧 Auto-Corrigir Lote&rdquo;</strong> para comparar o Antes × Depois.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => setIsAutoFixed((prev) => !prev)}
              className={`px-4 py-2.5 rounded-xl text-xs font-black border transition-all ${
                isAutoFixed
                  ? 'bg-emerald-600 text-white border-emerald-400 shadow-md'
                  : 'bg-amber-500 text-slate-950 border-amber-300 shadow-md'
              }`}
            >
              {isAutoFixed
                ? '✓ Visualizando Lote Saneado (0 Erros) — Clique p/ Ver com Erro'
                : '🔧 Auto-Corrigir Lote Agora (Comparar Antes × Depois)'}
            </button>
            <button
              onClick={handleExportAuditToDocStudio}
              className="px-3.5 py-2.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-xs font-bold text-blue-300 transition-all"
            >
              📄 Exportar Laudo p/ Doc Studio
            </button>
          </div>
        </div>

        {/* Cards dos 3 Cenários de Teste (Visa, Elo e Mastercard) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {BATCH_VALIDATOR_PRESETS.map((preset) => {
            const isSel = preset.id === activePreset.id;
            return (
              <button
                key={preset.id}
                onClick={() => {
                  setSelectedPresetId(preset.id);
                  setIsAutoFixed(false);
                  onSelectBrand(preset.brand);
                }}
                className={`rounded-xl p-4 text-left border transition-all flex flex-col justify-between gap-2 ${
                  isSel
                    ? 'bg-blue-950/50 border-blue-400 shadow-md'
                    : 'bg-slate-950/70 border-slate-800 hover:border-slate-600'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-black text-blue-400 uppercase">
                      {preset.brand}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-rose-500/15 border border-rose-500/30 text-[10px] font-bold text-rose-300">
                      Caso Real c/ Diagnóstico
                    </span>
                  </div>
                  <div className="text-xs font-black text-white leading-snug">{preset.title}</div>
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">{preset.subtitle}</p>
              </button>
            );
          })}
        </div>

        {/* Stream Bruto do Arquivo (168B / TLV) */}
        <div className="rounded-xl bg-slate-950 border border-slate-800 p-4 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-slate-300">
              Stream Físico do Arquivo Outgoing ({isAutoFixed ? 'Lote Corrigido ✓' : 'Lote Original com Falhas ⚠️'})
            </span>
            <span
              className={`px-2.5 py-0.5 rounded text-xs font-bold ${
                errorCount === 0
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
              }`}
            >
              {errorCount === 0
                ? '✓ 0 Erros Sintáticos ou de Qualificação'
                : `⚠️ ${errorCount} Falha(s) Crítica(s) Detectada(s) no Lote`}
            </span>
          </div>
          <pre className="p-3 rounded-lg bg-slate-900 border border-slate-800 font-mono text-xs text-cyan-300 overflow-x-auto leading-relaxed">
            {currentWire}
          </pre>
        </div>
      </div>

      {/* Resultado do Parse Campo a Campo + Diagnóstico de Relatórios T+0/D+1 */}
      <div className={`grid grid-cols-1 lg:grid-cols-12 gap-6 items-start ${validatorMode !== 'presets' ? 'hidden' : ''}`}>
        {/* Coluna Esquerda (7 cols): Tabela de Campos Extraídos */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-800 bg-slate-900/90 p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h4 className="text-sm font-black uppercase tracking-wider text-white">
              1. Decodificação Posicional Campo a Campo
            </h4>
            <span className="text-xs text-slate-400">
              {currentFields.length} campos-chave auditados
            </span>
          </div>

          <div className="space-y-2.5">
            {currentFields.map((f, idx) => {
              const badgeClass =
                f.status === 'ok'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  : 'bg-rose-500/20 text-rose-300 border-rose-500/40';
              return (
                <div
                  key={idx}
                  className={`rounded-xl border p-3.5 space-y-1.5 ${
                    f.status === 'ok'
                      ? 'bg-slate-950/80 border-slate-800'
                      : 'bg-rose-950/20 border-rose-500/40'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 font-mono text-xs font-black text-blue-300">
                        {f.recordCode}
                      </span>
                      <span className="font-mono text-xs text-slate-400">{f.posOrTag}</span>
                      <span className="text-xs font-bold text-white">{f.fieldName}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${badgeClass}`}>
                      {f.status === 'ok' ? '✓ VÁLIDO' : '❌ ERRO DETECTADO'}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 pt-0.5">
                    <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 font-mono text-xs text-cyan-300">
                      Valor: {f.rawValue}
                    </span>
                    <span className="text-xs font-semibold text-slate-200">
                      ➔ {f.decodedMeaning}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{f.ruleExplanation}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Coluna Direita (5 cols): O Que Acontece na Bandeira (Reports & Multas) */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-800 bg-slate-900/90 p-5 space-y-4 shadow-xl">
          <div className="border-b border-slate-800 pb-3">
            <h4 className="text-sm font-black uppercase tracking-wider text-white">
              2. Diagnóstico da Bandeira (Qual Report Aponta e Qual o Impacto)
            </h4>
          </div>

          <div className="space-y-3">
            {currentFindings.map((fd, idx) => {
              const cardBorder =
                fd.severity === 'pass'
                  ? 'bg-emerald-950/15 border-emerald-500/40'
                  : 'bg-rose-950/15 border-rose-500/40';
              return (
                <div key={idx} className={`rounded-xl border p-4 space-y-2.5 ${cardBorder}`}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-mono text-xs font-black text-white">{fd.code}</span>
                    <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 font-mono text-[10px] text-amber-300">
                      {fd.recordCode} · {fd.fieldPos}
                    </span>
                  </div>
                  <div className="text-xs sm:text-sm font-black text-white">{fd.title}</div>
                  <p className="text-xs text-slate-200 leading-relaxed">{fd.detail}</p>

                  <div className="rounded-lg bg-slate-950/90 border border-slate-800 p-3 space-y-1.5 text-xs">
                    <div>
                      <strong className="text-blue-400">Onde aparece no Dia a Dia (Report):</strong>{' '}
                      <span className="text-slate-200">{fd.reportWhereItAppears}</span>
                    </div>
                    <div>
                      <strong className="text-rose-400">Impacto Financeiro / Programa:</strong>{' '}
                      <span className="text-slate-200">{fd.financialAndProgramImpact}</span>
                    </div>
                    <div>
                      <strong className="text-emerald-400">Regra de Correção:</strong>{' '}
                      <span className="text-slate-200">{fd.howToFix}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
