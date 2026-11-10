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

export function OutgoingBatchValidator({ selectedBrand, onSelectBrand }: Props) {
  const [selectedPresetId, setSelectedPresetId] = useState<string>(
    BATCH_VALIDATOR_PRESETS[0].id
  );
  const [isAutoFixed, setIsAutoFixed] = useState<boolean>(false);

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
      {/* Cabeçalho + Seletor de Cenários de Lote */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 space-y-5 shadow-xl">
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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
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
