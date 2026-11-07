'use client';

import React, { useMemo, useState } from 'react';
import { OUTGOING_BRANDS, OutgoingBrandId } from '@/data/outgoing-tables-flows';

export type BitmapViewMode = 'compare' | 'auth' | 'clearing';
export type BitmapPresetId =
  | 'pos_chip_vista'
  | 'parcelado_br'
  | 'ecom_3ds_token'
  | 'payfac_submerchant'
  | 'push_oct_p2p'
  | 'chargeback_dispute';

export interface BitSpec {
  bit: number;
  shortLabel: string;
  name: string;
  isoFormat: string;
  presenceScope: 'both' | 'auth_only' | 'clearing_only' | 'unused';
  authStatus: 'M' | 'C' | 'O' | '-';
  clearingStatus: 'M' | 'C' | 'O' | '-';
  authRole: string;
  clearingRoleByBrand: Record<
    OutgoingBrandId,
    {
      targetTableId?: string;
      targetLocation: string;
      clearingFormat: string;
      status: 'M' | 'C' | 'O' | '-';
      transformationRule: string;
    }
  >;
  activeInPresets: {
    auth: BitmapPresetId[];
    clearing: BitmapPresetId[];
  };
}

const ALL_PRESETS: BitmapPresetId[] = [
  'pos_chip_vista',
  'parcelado_br',
  'ecom_3ds_token',
  'payfac_submerchant',
  'push_oct_p2p',
  'chargeback_dispute',
];

const PURCHASE_PRESETS: BitmapPresetId[] = [
  'pos_chip_vista',
  'parcelado_br',
  'ecom_3ds_token',
  'payfac_submerchant',
  'push_oct_p2p',
];

export const BITMAP_PRESETS: {
  id: BitmapPresetId;
  title: string;
  subtitle: string;
  authMti: string;
  clearingRefByBrand: Record<OutgoingBrandId, string>;
}[] = [
  {
    id: 'pos_chip_vista',
    title: '1. Compra Presencial Chip EMV / NFC à Vista',
    subtitle: 'POS Entry 05/07 · Criptograma ARQC no DE 55 · Liquidação Doméstica BRL',
    authMti: '0100 / 0110',
    clearingRefByBrand: {
      visa: 'TC 05 (TCR 0 + TCR 1 + TCR 2 BR + TCR 5 + TCR 7)',
      elo: 'TE05 (Reg 00 + Reg 01 + Reg 02 + Reg 07)',
      mastercard: 'MTI 1240 / DE 24=200 (Base + DE 48 BR + DE 55 EMV)',
    },
  },
  {
    id: 'parcelado_br',
    title: '2. Compra Parcelada Brasil (2x a 12x)',
    subtitle: 'Parcelado Lojista sem Juros ou Emissor · Regra doméstica Brasil',
    authMti: '0100 / 0110',
    clearingRefByBrand: {
      visa: 'TC 05 (TCR 0 + TCR 1 + TCR 2 BR [pos 40-41=Parcelas+10] + TCR 5 + TCR D)',
      elo: 'TE05 (Reg 00 + Reg 01 [pos 54-59] + Reg 02 [pos 20-22=990/991])',
      mastercard: 'MTI 1240 / DE 24=200 (DE 48 PDS 0195 + PDS 0220)',
    },
  },
  {
    id: 'ecom_3ds_token',
    title: '3. E-Commerce Autenticado 3DS 2.2 + Token',
    subtitle: 'POS Entry 01/81 · CAVV/AAV + Directory Server ID + Token VTS/MDES/PTE',
    authMti: '0100 / 0110',
    clearingRefByBrand: {
      visa: 'TC 05 (TCR 0 + TCR 1 + TCR 2 BR + TCR 5 [CAVV/ECI] + TCR D)',
      elo: 'TE05 (Reg 00 + Reg 01 + Reg 02 [Token] + Reg 05 [CAVV/3DS])',
      mastercard: 'MTI 1240 / DE 24=200 (DE 48 PDS 0052/0184/0185 + PDS 0059/0207)',
    },
  },
  {
    id: 'payfac_submerchant',
    title: '4. Subcredenciador (PayFac) / Marketplace',
    subtitle: 'Facilitador de Pagamento + CNPJ/CPF e MCC do Estabelecimento Final',
    authMti: '0100 / 0110',
    clearingRefByBrand: {
      visa: 'TC 05 (TCR 0 + TCR 1 + TCR 2 BR + TCR 5 + TCR E [PayFac/Sub-Merchant])',
      elo: 'TE05 (Reg 00 + Reg 01 [CNPJ Subcred] + Reg 02 [Pos 59-72 & 140-161 EC Final])',
      mastercard: 'MTI 1240 / DE 24=200 (DE 48 PDS 0176 + PDS 0208 + PDS 0220)',
    },
  },
  {
    id: 'push_oct_p2p',
    title: '5. Transferência de Fundos / Push (OCT / P2P)',
    subtitle: 'Visa Direct OCT · Elo Código Proc 53 · Mastercard MoneySend',
    authMti: '0100 / 0200',
    clearingRefByBrand: {
      visa: 'TC 06 / TC 05 (TCR 0 + TCR 1 + TCR 2 BR + TCR 5 + TCR D [Format OC])',
      elo: 'TE05 Proc 53 (Reg 00 + Reg 01 + Reg 02 + Reg 03 [Remetente/Destinatário])',
      mastercard: 'MTI 1240 / DE 24=200 (DE 3=28xxxx + DE 48 Funding/Payment Service)',
    },
  },
  {
    id: 'chargeback_dispute',
    title: '6. Pós-Venda: Chargeback (1ª Disputa)',
    subtitle: 'Sem mensagem 0100 nova · Usa dados conciliados do Clearing Original',
    authMti: 'N/A (Pós-Venda)',
    clearingRefByBrand: {
      visa: 'TC 15 (TCR 0 [Reason Code] + TCR 1 + TCR 2 BR + TCR 5 [TID Original])',
      elo: 'TE15 (Reg 00 [Motivo Disputa] + Reg 01 + Reg 02)',
      mastercard: 'MTI 1442 / DE 24=450 (DE 25 Reason Code + DE 31 ARN + DE 63 + DE 72)',
    },
  },
];

// Cataloged key bits across ISO 8583 Authorization (0100/0110) and Clearing (MTI 1240 / Base II / Elo 26.2)
const KEY_BITS_CATALOG: Record<number, Omit<BitSpec, 'bit'>> = {
  1: {
    shortLabel: 'BMAP2',
    name: 'Bitmap Secundário (Bits 65 a 128)',
    isoFormat: 'b 64 (8 bytes binários / 16 hex)',
    presenceScope: 'both',
    authStatus: 'M',
    clearingStatus: 'M',
    authRole: 'Bit 1 = 1 indica a presença do segundo mapa de bits (DE 65 a DE 128) na mensagem 0100/0110.',
    clearingRoleByBrand: {
      visa: {
        targetTableId: 'visa-tcr0',
        targetLocation: 'Base II: Qualificador de TCRs (Pos 04: TCR 0..E)',
        clearingFormat: '1 byte por TCR',
        status: 'M',
        transformationRule: 'Na autorização VIP é o Bit 1; no Base II a expansão é controlada pela sequência de TCRs (TCR 0 a TCR E).',
      },
      elo: {
        targetTableId: 'elo-reg00',
        targetLocation: 'Liquidação: Subcódigo do Registro (Pos 03–04: 00 a 09)',
        clearingFormat: '2 bytes AN',
        status: 'M',
        transformationRule: 'Na autorização Elo ativa os bits 65–128; no arquivo de liquidação é substituído pelos sub-registros 00 a 09.',
      },
      mastercard: {
        targetTableId: 'mc-1240-base',
        targetLocation: 'MTI 1240 · Bit 001 (Secondary Bitmap)',
        clearingFormat: '8 bytes binários',
        status: 'M',
        transformationRule: 'Obrigatório [M] no MTI 1240 porque o DE 71 (Message Number) reside no bitmap secundário.',
      },
    },
    activeInPresets: { auth: PURCHASE_PRESETS, clearing: ALL_PRESETS },
  },
  2: {
    shortLabel: 'PAN',
    name: 'Primary Account Number (Número do Cartão / Token)',
    isoFormat: 'LLVAR n..19',
    presenceScope: 'both',
    authStatus: 'M',
    clearingStatus: 'M',
    authRole: 'Identifica o PAN do portador (ou Token de pagamento nas carteiras VTS/MDES/PTE) na autorização 0100.',
    clearingRoleByBrand: {
      visa: {
        targetTableId: 'visa-tcr0',
        targetLocation: 'TCR 0 · Pos 05–20 (Account Number)',
        clearingFormat: '16 AN (Alinhado à esquerda)',
        status: 'M',
        transformationRule: 'Copiado integralmente do DE 2 da 0100 para as posições 05–20 do TCR 0.',
      },
      elo: {
        targetTableId: 'elo-reg00',
        targetLocation: 'Registro 00 · Pos 05–23 (Número do Cartão)',
        clearingFormat: '19 N',
        status: 'M',
        transformationRule: 'Grava o PAN real no Reg 00 pos 05–23 (e, se tokenizado, o PAN Token vai no Reg 02 pos 23–41).',
      },
      mastercard: {
        targetTableId: 'mc-1240-base',
        targetLocation: 'MTI 1240 · DE 002 (Primary Account Number)',
        clearingFormat: 'LLVAR n..19',
        status: 'M',
        transformationRule: 'Mesmo DE 2 da autorização 0100; se houve token MDES, o Account Range real e Token Assurance vão no DE 48 PDS 0059/0207.',
      },
    },
    activeInPresets: { auth: PURCHASE_PRESETS, clearing: ALL_PRESETS },
  },
  3: {
    shortLabel: 'PROC',
    name: 'Processing Code (Código de Processamento)',
    isoFormat: 'n 6 ( Pos 1-2: Tipo Tx, Pos 3-4: Conta Orig, Pos 5-6: Conta Dest)',
    presenceScope: 'both',
    authStatus: 'M',
    clearingStatus: 'M',
    authRole: 'Define a operação na 0100: 00xxxx (Compra), 01xxxx (Saque), 20xxxx (Crédito/Estorno), 28/53xxxx (Transferência).',
    clearingRoleByBrand: {
      visa: {
        targetTableId: 'visa-tcr0',
        targetLocation: 'TCR 0 · Pos 01–02 (Transaction Code: TC 05, TC 06, TC 07)',
        clearingFormat: '2 N',
        status: 'M',
        transformationRule: 'DE 3 = 00xxxx vira TC 05 (Compra); DE 3 = 20xxxx vira TC 06 (Credit Voucher); DE 3 = 01xxxx vira TC 07 (Cash).',
      },
      elo: {
        targetTableId: 'elo-reg00',
        targetLocation: 'Registro 00 · Pos 01–02 (TE05/06) + Pos 24–25 (Cód. Processamento)',
        clearingFormat: '2 N (00 Compra, 01 Saque, 20 Crédito, 53 Transferência)',
        status: 'M',
        transformationRule: 'Se Pos 24–25 = 53 (Transferência), escala o Registro 03 de Condicional [C] para Obrigatório [M].',
      },
      mastercard: {
        targetTableId: 'mc-1240-base',
        targetLocation: 'MTI 1240 · DE 003 (Processing Code)',
        clearingFormat: 'n 6 (ex: 000000 Compra, 200000 Refund)',
        status: 'M',
        transformationRule: 'Mantido no DE 3 do MTI 1240 exatamente consistente com a natureza autorizada.',
      },
    },
    activeInPresets: { auth: PURCHASE_PRESETS, clearing: ALL_PRESETS },
  },
  4: {
    shortLabel: 'AMT-TX',
    name: 'Amount, Transaction (Valor da Transação)',
    isoFormat: 'n 12 (2 casas decimais implícitas, sem vírgula)',
    presenceScope: 'both',
    authStatus: 'M',
    clearingStatus: 'M',
    authRole: 'Valor bruto solicitado pelo estabelecimento na moeda local do terminal (DE 49).',
    clearingRoleByBrand: {
      visa: {
        targetTableId: 'visa-tcr0',
        targetLocation: 'TCR 0 · Pos 77–88 (Source Amount) + TCR 2 BR Pos 46–57 (Valor Nacional)',
        clearingFormat: '12 N (centavos implícitos)',
        status: 'M',
        transformationRule: 'Em compras domésticas BRL, o valor vai no TCR 0 pos 77–88 e no TCR 2 (BR) pos 46–57.',
      },
      elo: {
        targetTableId: 'elo-reg00',
        targetLocation: 'Registro 00 · Pos 63–74 (Valor da Transação)',
        clearingFormat: '12 N (centavos implícitos)',
        status: 'M',
        transformationRule: 'No parcelado lojista (990), informa o valor total da venda no Reg 00 pos 63–74 e o valor da 1ª parcela no Reg 02 pos 73–84.',
      },
      mastercard: {
        targetTableId: 'mc-1240-base',
        targetLocation: 'MTI 1240 · DE 004 (Amount, Transaction)',
        clearingFormat: 'n 12',
        status: 'M',
        transformationRule: 'Obrigatório [M] no MTI 1240; soma de todos os DE 4 do arquivo deve bater com o PDS 0301 do Trailer 1644-695.',
      },
    },
    activeInPresets: { auth: PURCHASE_PRESETS, clearing: ALL_PRESETS },
  },
  7: {
    shortLabel: 'TX-DT',
    name: 'Transmission Date & Time (MMDDhhmmss UTC)',
    isoFormat: 'n 10 (MMDDhhmmss)',
    presenceScope: 'auth_only',
    authStatus: 'M',
    clearingStatus: '-',
    authRole: 'Carimbo de tempo UTC exato do envio da mensagem online 0100 na rede de autorização.',
    clearingRoleByBrand: {
      visa: {
        targetTableId: 'visa-tcr0',
        targetLocation: 'Não existe no Base II (Substituído por Purchase Date Pos 55–58 e CPD no TC 90)',
        clearingFormat: 'N/A (Exclusivo Online)',
        status: '-',
        transformationRule: 'O horário de transmissão online não viaja como bit no clearing; apenas a data da compra (MMDD) vai no TCR 0 pos 55–58.',
      },
      elo: {
        targetTableId: 'elo-reg00',
        targetLocation: 'Não existe no Registro 00 (Apenas Data da Venda Pos 51–58 e Hora Pos 59–64)',
        clearingFormat: 'N/A (Exclusivo Online)',
        status: '-',
        transformationRule: 'Exclusivo da mensageria online 0100/0110 para controle de timeout de switch.',
      },
      mastercard: {
        targetTableId: 'mc-1240-base',
        targetLocation: 'Proibido no MTI 1240 (Exclusivo do CIS Online 0100/0110)',
        clearingFormat: 'N/A (Bit 7 = 0 no Clearing)',
        status: '-',
        transformationRule: 'No MTI 1240 o Bit 7 fica desligado (0); a data/hora local da compra viaja no DE 12 (YYMMDDhhmmss).',
      },
    },
    activeInPresets: { auth: PURCHASE_PRESETS, clearing: [] },
  },
  11: {
    shortLabel: 'STAN',
    name: 'System Trace Audit Number (NSU da Transação)',
    isoFormat: 'n 6 (Online) / n 12 (Liquidação Elo)',
    presenceScope: 'both',
    authStatus: 'M',
    clearingStatus: 'C',
    authRole: 'Número sequencial único (STAN / NSU) que identifica o par 0100/0110 na sessão de autorização.',
    clearingRoleByBrand: {
      visa: {
        targetTableId: 'visa-tcr0',
        targetLocation: 'Consolidado dentro do ARN (TCR 0 Pos 27–49) e TID (TCR 5 Pos 05–19)',
        clearingFormat: '23 N (ARN) / 15 N (TID)',
        status: 'C',
        transformationRule: 'Na Visa, a chave primária de conciliação no Base II passa a ser o ARN (23 dígitos) no TCR 0 e o TID (15 dígitos) no TCR 5.',
      },
      elo: {
        targetTableId: 'elo-reg01',
        targetLocation: 'Registro 01 · Pos 63–74 (NSU / Número Lógico da Transação)',
        clearingFormat: '12 N',
        status: 'M',
        transformationRule: 'Na Elo, o NSU da autorização é obrigatório [M] no Registro 01 pos 63–74 para conciliação ponta a ponta.',
      },
      mastercard: {
        targetTableId: 'mc-1240-base',
        targetLocation: 'Não vai como DE 11 no MTI 1240 (Substituído por DE 63 Lifecycle ID e DE 31 ARN)',
        clearingFormat: 'Bit 11 = 0 no MTI 1240',
        status: '-',
        transformationRule: 'No GCMS/IPM o Bit 11 é desligado; a conciliação usa o Banknet Reference Number no DE 63 e o ARN no DE 31.',
      },
    },
    activeInPresets: { auth: PURCHASE_PRESETS, clearing: PURCHASE_PRESETS },
  },
  12: {
    shortLabel: 'LOC-TM',
    name: 'Date and Time, Local Transaction (Data/Hora Local da Venda)',
    isoFormat: 'n 6 (hhmmss no 0100) ➔ n 12 (YYMMDDhhmmss no 1240)',
    presenceScope: 'both',
    authStatus: 'M',
    clearingStatus: 'M',
    authRole: 'No ISO 8583:1987 (0100), o DE 12 carrega a hora local (hhmmss) e o DE 13 a data (MMDD).',
    clearingRoleByBrand: {
      visa: {
        targetTableId: 'visa-tcr0',
        targetLocation: 'TCR 0 · Pos 55–58 (Purchase Date MMDD)',
        clearingFormat: '4 N (MMDD)',
        status: 'M',
        transformationRule: 'Data da compra obrigatória no TCR 0 pos 55–58; atraso > prazo de presentment gera downgrade de intercâmbio.',
      },
      elo: {
        targetTableId: 'elo-reg00',
        targetLocation: 'Registro 00 · Pos 51–58 (Data AAAAMMDD) + Pos 59–64 (Hora hhmmss)',
        clearingFormat: '8 N + 6 N',
        status: 'M',
        transformationRule: 'Obrigatório [M] no Registro 00; validado contra a janela de envio e regra de presentment tardio.',
      },
      mastercard: {
        targetTableId: 'mc-1240-base',
        targetLocation: 'MTI 1240 · DE 012 (Date and Time, Local Transaction)',
        clearingFormat: 'n 12 (YYMMDDhhmmss)',
        status: 'M',
        transformationRule: 'ATENÇÃO: Na autorização (ISO 87) o DE 12 tem 6 dígitos (hhmmss); no MTI 1240 (ISO 93) o DE 12 funde Data+Hora em 12 dígitos (YYMMDDhhmmss) e o DE 13 deixa de existir!',
      },
    },
    activeInPresets: { auth: PURCHASE_PRESETS, clearing: ALL_PRESETS },
  },
  13: {
    shortLabel: 'LOC-DT',
    name: 'Date, Effective / Local Transaction Date (MMDD)',
    isoFormat: 'n 4 (MMDD)',
    presenceScope: 'auth_only',
    authStatus: 'M',
    clearingStatus: '-',
    authRole: 'Data local (MMDD) da captura na mensagem 0100 (ISO 8583:1987).',
    clearingRoleByBrand: {
      visa: {
        targetTableId: 'visa-tcr0',
        targetLocation: 'Mapeado para TCR 0 · Pos 55–58 (Purchase Date MMDD)',
        clearingFormat: '4 N',
        status: 'M',
        transformationRule: 'Vai nas posições 55–58 do TCR 0.',
      },
      elo: {
        targetTableId: 'elo-reg00',
        targetLocation: 'Mapeado para Registro 00 · Pos 51–58 (AAAAMMDD)',
        clearingFormat: '8 N',
        status: 'M',
        transformationRule: 'Expandido para 8 dígitos (AAAAMMDD) nas posições 51–58 do Registro 00.',
      },
      mastercard: {
        targetTableId: 'mc-1240-base',
        targetLocation: 'Absorvido pelo DE 012 (YYMMDDhhmmss) no MTI 1240',
        clearingFormat: 'Bit 13 = 0 no MTI 1240',
        status: '-',
        transformationRule: 'Na ISO 8583:1993 (IPM), a data local foi incorporada aos 6 primeiros dígitos do DE 12 (YYMMDDhhmmss).',
      },
    },
    activeInPresets: { auth: PURCHASE_PRESETS, clearing: [] },
  },
  14: {
    shortLabel: 'EXP-DT',
    name: 'Date, Expiration (Data de Validade do Cartão YYMM)',
    isoFormat: 'n 4 (YYMM)',
    presenceScope: 'both',
    authStatus: 'C',
    clearingStatus: 'C',
    authRole: 'Validade do cartão (YYMM) enviada na autorização 0100.',
    clearingRoleByBrand: {
      visa: {
        targetTableId: 'visa-tcr0',
        targetLocation: 'Opcional / Não exigido no TCR 0 padrão (validado na autorização)',
        clearingFormat: 'N/A',
        status: 'O',
        transformationRule: 'Validado online no VIP; não é campo obrigatório do TCR 0.',
      },
      elo: {
        targetTableId: 'elo-reg07',
        targetLocation: 'Transportado apenas em tags EMV (5F24) quando aplicável',
        clearingFormat: 'Tag EMV',
        status: 'C',
        transformationRule: 'Não ocupa coluna fixa no Registro 00; validado na autorização.',
      },
      mastercard: {
        targetTableId: 'mc-1240-base',
        targetLocation: 'MTI 1240 · DE 014 (Date, Expiration)',
        clearingFormat: 'n 4 (YYMM)',
        status: 'C',
        transformationRule: 'Condicional [C] no MTI 1240 quando presente na leitura do cartão ou token.',
      },
    },
    activeInPresets: { auth: PURCHASE_PRESETS, clearing: ['pos_chip_vista', 'ecom_3ds_token'] },
  },
  18: {
    shortLabel: 'MCC-AU',
    name: 'Merchant Type / MCC na Autorização (ISO 87)',
    isoFormat: 'n 4',
    presenceScope: 'auth_only',
    authStatus: 'M',
    clearingStatus: '-',
    authRole: 'Código de ramo de atividade do lojista (MCC 4 dígitos) na mensagem de autorização 0100.',
    clearingRoleByBrand: {
      visa: {
        targetTableId: 'visa-tcr0',
        targetLocation: 'Mapeado para TCR 0 · Pos 133–136 (Merchant Category Code)',
        clearingFormat: '4 N',
        status: 'M',
        transformationRule: 'Copiado do DE 18 da 0100 para as posições 133–136 do TCR 0. Deve ser idêntico ao autorizado.',
      },
      elo: {
        targetTableId: 'elo-reg00',
        targetLocation: 'Mapeado para Registro 00 · Pos 99–102 (MCC do Ponto de Venda)',
        clearingFormat: '4 N',
        status: 'M',
        transformationRule: 'Copiado do DE 18 da 0100 para as posições 99–102 do Registro 00.',
      },
      mastercard: {
        targetTableId: 'mc-1240-base',
        targetLocation: 'MUDA DE BIT NO CLEARING: Vai para o DE 026 (Card Acceptor Business Code) no MTI 1240!',
        clearingFormat: 'Bit 18 = 0 ➔ Bit 26 = 1 (n 4)',
        status: '-',
        transformationRule: 'Pegadinha clássica de certificação Mastercard: na autorização (ISO 87) o MCC é o DE 18; no Clearing IPM (ISO 93 MTI 1240) o MCC muda para o DE 26!',
      },
    },
    activeInPresets: { auth: PURCHASE_PRESETS, clearing: [] },
  },
  22: {
    shortLabel: 'POS-EM',
    name: 'Point of Service Entry Mode / POS Data Code',
    isoFormat: 'n 3 (Auth 0100) ➔ an 12 (Clearing MTI 1240)',
    presenceScope: 'both',
    authStatus: 'M',
    clearingStatus: 'M',
    authRole: 'Indica como o cartão e a senha foram lidos (05=Chip, 07=Contactless, 01=Manual/E-Comm, 81=E-Comm, 10=COF).',
    clearingRoleByBrand: {
      visa: {
        targetTableId: 'visa-tcr0',
        targetLocation: 'TCR 0 · Pos 159–160 (POS Entry Mode) + Pos 158 (Term. Capability)',
        clearingFormat: '2 AN + 1 AN',
        status: 'M',
        transformationRule: 'Se Pos 159–160 = 05 ou 07 (Chip/NFC), o registro TCR 7 (EMV) torna-se Obrigatório [M].',
      },
      elo: {
        targetTableId: 'elo-reg00',
        targetLocation: 'Registro 00 · Pos 150–151 (Modo de Entrada no Terminal)',
        clearingFormat: '2 N (05 Chip, 07 NFC, 01/81 E-Comm)',
        status: 'M',
        transformationRule: 'Se Pos 150–151 = 05 ou 07, o Registro 07 (Chip EMV) torna-se Obrigatório [M].',
      },
      mastercard: {
        targetTableId: 'mc-1240-base',
        targetLocation: 'MTI 1240 · DE 022 (Point of Service Data Code — 12 posições AN)',
        clearingFormat: 'an 12 (SF1..SF12)',
        status: 'M',
        transformationRule: 'Na autorização CIS o DE 22 tem 3 dígitos (ex: 051); no MTI 1240 ele se expande para um código estruturado de 12 caracteres alfanuméricos detalhando capacidade de terminal, presença do portador e método de captura!',
      },
    },
    activeInPresets: { auth: PURCHASE_PRESETS, clearing: ALL_PRESETS },
  },
  23: {
    shortLabel: 'CSN',
    name: 'Card Sequence Number ( Application PAN Sequence Number — Tag 5F34)',
    isoFormat: 'n 3',
    presenceScope: 'both',
    authStatus: 'C',
    clearingStatus: 'C',
    authRole: 'Diferencia plásticos múltiplos emitidos para a mesma conta (Tag EMV 5F34) em transações com chip.',
    clearingRoleByBrand: {
      visa: {
        targetTableId: 'visa-tcr7',
        targetLocation: 'TCR 7 · Pos 07–09 (Card Sequence Number)',
        clearingFormat: '3 N',
        status: 'C',
        transformationRule: 'Obrigatório no TCR 7 quando o chip retornar a Tag 5F34 na autorização.',
      },
      elo: {
        targetTableId: 'elo-reg07',
        targetLocation: 'Registro 07 · Pos 16–18 (Número Sequencial do Cartão)',
        clearingFormat: '3 N',
        status: 'M',
        transformationRule: 'Obrigatório [M] no Registro 07 em toda transação com Chip EMV.',
      },
      mastercard: {
        targetTableId: 'mc-1240-emv-3ds',
        targetLocation: 'MTI 1240 · DE 023 (Card Sequence Number)',
        clearingFormat: 'n 3',
        status: 'C',
        transformationRule: 'Ativado no Bitmap do MTI 1240 sempre que DE 55 (Chip EMV) estiver presente.',
      },
    },
    activeInPresets: { auth: ['pos_chip_vista', 'parcelado_br'], clearing: ['pos_chip_vista', 'parcelado_br'] },
  },
  24: {
    shortLabel: 'FUNC',
    name: 'Function Code (Código de Função ISO 8583:1993)',
    isoFormat: 'n 3 (200=1º Presentment, 450=1º Chargeback, 697=Header, 695=Trailer)',
    presenceScope: 'clearing_only',
    authStatus: '-',
    clearingStatus: 'M',
    authRole: 'Não utilizado na autorização ISO 8583:1987 padrão.',
    clearingRoleByBrand: {
      visa: {
        targetTableId: 'visa-tcr0',
        targetLocation: 'Equivalente ao TC (05/06/15/90/92) + Reapresentação no TCR 0',
        clearingFormat: '2 N',
        status: 'M',
        transformationRule: 'Na Visa a função é determinada pelo Transaction Code (TC 05, TC 06, TC 15, TC 90, TC 92).',
      },
      elo: {
        targetTableId: 'elo-reg00',
        targetLocation: 'Equivalente ao Código TE (TE05, TE06, TE15, TE25, B0, BZ)',
        clearingFormat: '2 AN',
        status: 'M',
        transformationRule: 'Na Elo a função é determinada pelas posições 01–02 (TE05, TE06, TE15, etc.).',
      },
      mastercard: {
        targetTableId: 'mc-1240-base',
        targetLocation: 'MTI 1240 / 1442 / 1644 / 1740 · DE 024 (Function Code)',
        clearingFormat: 'n 3',
        status: 'M',
        transformationRule: 'Obrigatório [M] em 100% das mensagens IPM: 200 = First Presentment (1240), 205 = Second Presentment, 450 = First Chargeback (1442), 697 = Header (1644), 695 = Trailer (1644).',
      },
    },
    activeInPresets: { auth: [], clearing: ALL_PRESETS },
  },
  25: {
    shortLabel: 'RSN-CD',
    name: 'Message Reason Code (Código de Motivo de Apresentação / Disputa)',
    isoFormat: 'n 4',
    presenceScope: 'clearing_only',
    authStatus: '-',
    clearingStatus: 'C',
    authRole: 'Na ISO 87 (0100) o DE 25 é o POS Condition Code (2 dígitos); na ISO 93 (IPM) vira o Message Reason Code (4 dígitos).',
    clearingRoleByBrand: {
      visa: {
        targetTableId: 'visa-tcr0',
        targetLocation: 'TCR 0 (TC 15 / TC 10) · Reason Code de Disputa ou Fee Collection',
        clearingFormat: '2 a 4 AN',
        status: 'C',
        transformationRule: 'Obrigatório em Chargebacks (TC 15) e Fee Collections (TC 10/20).',
      },
      elo: {
        targetTableId: 'elo-reg00',
        targetLocation: 'Registro 00 (TE15 / TE10) · Código de Motivo de Disputa',
        clearingFormat: '4 N',
        status: 'C',
        transformationRule: 'Obrigatório em transações de Chargeback (TE15/TE16) e Ajuste (TE10/TE20).',
      },
      mastercard: {
        targetTableId: 'mc-1442-1740',
        targetLocation: 'MTI 1442 / 1740 · DE 025 (Message Reason Code)',
        clearingFormat: 'n 4 (ex: 4837, 4853, 4863)',
        status: 'C',
        transformationRule: 'Obrigatório [M] em Chargebacks (MTI 1442) e Fee Collections (MTI 1740) para informar o código normativo da disputa/tarifa.',
      },
    },
    activeInPresets: { auth: [], clearing: ['chargeback_dispute'] },
  },
  26: {
    shortLabel: 'MCC-CL',
    name: 'Card Acceptor Business Code (MCC no Clearing ISO 93)',
    isoFormat: 'n 4',
    presenceScope: 'clearing_only',
    authStatus: '-',
    clearingStatus: 'M',
    authRole: 'Na autorização 0100 o MCC viaja no DE 18; o Bit 26 no clearing assume o MCC na ISO 8583:1993.',
    clearingRoleByBrand: {
      visa: {
        targetTableId: 'visa-tcr0',
        targetLocation: 'TCR 0 · Pos 133–136 (Merchant Category Code)',
        clearingFormat: '4 N',
        status: 'M',
        transformationRule: 'Grava o MCC de 4 dígitos nas posições 133–136 do TCR 0.',
      },
      elo: {
        targetTableId: 'elo-reg00',
        targetLocation: 'Registro 00 · Pos 99–102 (MCC)',
        clearingFormat: '4 N',
        status: 'M',
        transformationRule: 'Grava o MCC de 4 dígitos nas posições 99–102 do Registro 00.',
      },
      mastercard: {
        targetTableId: 'mc-1240-base',
        targetLocation: 'MTI 1240 · DE 026 (Card Acceptor Business Code / MCC)',
        clearingFormat: 'n 4',
        status: 'M',
        transformationRule: 'Obrigatório [M] no MTI 1240; recebe o MCC de 4 dígitos que veio no DE 18 da autorização 0100.',
      },
    },
    activeInPresets: { auth: [], clearing: ALL_PRESETS },
  },
  31: {
    shortLabel: 'ARN',
    name: 'Acquirer Reference Data / ARN (23 Dígitos)',
    isoFormat: 'LLVAR n 23 (Indicador + BIN + Data Juliano + Sequencial + Dígito Verificador)',
    presenceScope: 'clearing_only',
    authStatus: '-',
    clearingStatus: 'M',
    authRole: 'Não existe na autorização 0100/0110! É gerado pelo motor de Outgoing do Credenciador na montagem do lote.',
    clearingRoleByBrand: {
      visa: {
        targetTableId: 'visa-tcr0',
        targetLocation: 'TCR 0 · Pos 27–49 (Acquirer Reference Number — 23 dígitos)',
        clearingFormat: '23 N',
        status: 'M',
        transformationRule: 'Obrigatório [M] em todo TCR 0: Pos 1 = 2 ou 7, Pos 2–7 = BIN Acquirer, Pos 8–11 = Data Juliana (YDDD), Pos 12–22 = Sequencial, Pos 23 = Módulo 10.',
      },
      elo: {
        targetTableId: 'elo-reg00',
        targetLocation: 'Registro 00 · Pos 28–50 (ARN / Número de Referência da Transação)',
        clearingFormat: '23 N',
        status: 'M',
        transformationRule: 'Obrigatório [M] no Registro 00 pos 28–50 para rastreabilidade de ciclo de vida e chargeback.',
      },
      mastercard: {
        targetTableId: 'mc-1240-base',
        targetLocation: 'MTI 1240 · DE 031 (Acquirer Reference Data — 23 dígitos)',
        clearingFormat: 'LLVAR n 23',
        status: 'M',
        transformationRule: 'Obrigatório [M] no MTI 1240 e preservado de forma imutável caso ocorra Chargeback (MTI 1442).',
      },
    },
    activeInPresets: { auth: [], clearing: ALL_PRESETS },
  },
  32: {
    shortLabel: 'ACQ-ID',
    name: 'Acquiring Institution Identification Code (BIN / Código do Credenciador)',
    isoFormat: 'LLVAR n..11',
    presenceScope: 'both',
    authStatus: 'M',
    clearingStatus: 'M',
    authRole: 'Identifica o BIN/ICA/Código da instituição credenciadora na autorização 0100.',
    clearingRoleByBrand: {
      visa: {
        targetTableId: 'visa-tcr0',
        targetLocation: 'Embutido no ARN (TCR 0 Pos 28–33) e no Header TC 90 (Pos 07–12 CIB)',
        clearingFormat: '6 N',
        status: 'M',
        transformationRule: 'Identifica o Acquirer CIB no TC 90 e nas posições 2–7 do ARN no TCR 0.',
      },
      elo: {
        targetTableId: 'elo-reg00',
        targetLocation: 'Header B0 · Pos 13–16 + Registro 00 · Pos 78–81 (Código do Credenciador)',
        clearingFormat: '4 N',
        status: 'M',
        transformationRule: 'Obrigatório [M] no Header B0 e no Registro 00 pos 78–81.',
      },
      mastercard: {
        targetTableId: 'mc-1240-base',
        targetLocation: 'MTI 1240 · DE 032 / DE 033 (Forwarding / Acquiring Institution ICA)',
        clearingFormat: 'LLVAR n..11',
        status: 'M',
        transformationRule: 'Identifica o ICA do Credenciador remetente no GCMS.',
      },
    },
    activeInPresets: { auth: PURCHASE_PRESETS, clearing: ALL_PRESETS },
  },
  35: {
    shortLabel: 'TRK2',
    name: 'Track 2 Data (Dados da Trilha 2 do Cartão / Equivalente Chip)',
    isoFormat: 'LLVAR z..37',
    presenceScope: 'auth_only',
    authStatus: 'C',
    clearingStatus: '-',
    authRole: 'Transporta a Trilha 2 na autorização 0100 para validação de CVV1/iCVV pelo Emissor.',
    clearingRoleByBrand: {
      visa: {
        targetTableId: 'visa-tcr0',
        targetLocation: 'PROIBIDO NO CLEARING (Regra PCI DSS — Dados Sensíveis de Autenticação)',
        clearingFormat: 'Proibido',
        status: '-',
        transformationRule: 'Jamais pode ser gravado em arquivos de Outgoing Base II.',
      },
      elo: {
        targetTableId: 'elo-reg00',
        targetLocation: 'PROIBIDO NO CLEARING (Regra PCI DSS)',
        clearingFormat: 'Proibido',
        status: '-',
        transformationRule: 'Dados completos de trilha nunca viajam na mensageria de liquidação.',
      },
      mastercard: {
        targetTableId: 'mc-1240-base',
        targetLocation: 'PROIBIDO NO MTI 1240 (Bit 35 = 0 por regra PCI DSS)',
        clearingFormat: 'Proibido',
        status: '-',
        transformationRule: 'Exclusivo da autorização online 0100.',
      },
    },
    activeInPresets: { auth: ['pos_chip_vista', 'parcelado_br'], clearing: [] },
  },
  37: {
    shortLabel: 'RRN',
    name: 'Retrieval Reference Number (Número de Referência de Captura)',
    isoFormat: 'an 12',
    presenceScope: 'both',
    authStatus: 'M',
    clearingStatus: 'C',
    authRole: 'Chave de referência de 12 caracteres gerada pelo adquirente na autorização 0100.',
    clearingRoleByBrand: {
      visa: {
        targetTableId: 'visa-tcr0',
        targetLocation: 'Substituído pelo ARN (23 pos no TCR 0) e TID (15 pos no TCR 5)',
        clearingFormat: '12 AN',
        status: 'C',
        transformationRule: 'Usado internamente para gerar o ARN; na Visa o TID (TCR 5) e o ARN (TCR 0) são as chaves mandatórias.',
      },
      elo: {
        targetTableId: 'elo-reg01',
        targetLocation: 'Conciliado com NSU (Reg 01 Pos 63–74) e ARN (Reg 00 Pos 28–50)',
        clearingFormat: '12 N',
        status: 'M',
        transformationRule: 'Mantém rastreabilidade direta com o NSU de 12 posições do Registro 01.',
      },
      mastercard: {
        targetTableId: 'mc-1240-base',
        targetLocation: 'MTI 1240 · DE 037 (Retrieval Reference Number — Opcional/Condicional)',
        clearingFormat: 'an 12',
        status: 'C',
        transformationRule: 'Pode ser enviado no DE 37 do MTI 1240 para conciliação com o comprovante do lojista.',
      },
    },
    activeInPresets: { auth: PURCHASE_PRESETS, clearing: ['pos_chip_vista', 'ecom_3ds_token'] },
  },
  38: {
    shortLabel: 'AUTH-CD',
    name: 'Approval / Authorization Identification Response (Código de Autorização)',
    isoFormat: 'an 6',
    presenceScope: 'both',
    authStatus: 'M',
    clearingStatus: 'M',
    authRole: 'Retornado pelo Banco Emissor na resposta 0110 (ex: "A12345" ou "049281") aprovando a venda.',
    clearingRoleByBrand: {
      visa: {
        targetTableId: 'visa-tcr0',
        targetLocation: 'TCR 0 · Pos 147–152 (Authorization Code)',
        clearingFormat: '6 AN',
        status: 'M',
        transformationRule: 'Obrigatório [M] no TCR 0 pos 147–152; deve ser idêntico ao retornado pelo emissor no DE 38 da 0110.',
      },
      elo: {
        targetTableId: 'elo-reg00',
        targetLocation: 'Registro 00 · Pos 141–146 (Código de Autorização)',
        clearingFormat: '6 AN',
        status: 'M',
        transformationRule: 'Obrigatório [M] no Registro 00 pos 141–146; ausência gera Chargeback imediato por falta de autorização.',
      },
      mastercard: {
        targetTableId: 'mc-1240-base',
        targetLocation: 'MTI 1240 · DE 038 (Approval Code)',
        clearingFormat: 'an 6',
        status: 'M',
        transformationRule: 'Obrigatório [M] no MTI 1240 para comprovar que o First Presentment foi previamente autorizado no 0110.',
      },
    },
    activeInPresets: { auth: PURCHASE_PRESETS, clearing: ALL_PRESETS },
  },
  39: {
    shortLabel: 'RESP-CD',
    name: 'Response Code (Código de Resposta da Autorização — ex: 00 Aprovado)',
    isoFormat: 'an 2',
    presenceScope: 'auth_only',
    authStatus: 'M',
    clearingStatus: '-',
    authRole: 'Retornado na 0110 indicando aprovação ("00", "10", "85") ou recusa ("05", "51", "54").',
    clearingRoleByBrand: {
      visa: {
        targetTableId: 'visa-tcr5',
        targetLocation: 'TCR 5 · Pos 45–46 (Authorization Response Code)',
        clearingFormat: '2 AN (ex: "00")',
        status: 'M',
        transformationRule: 'Na Visa, o código "00" da 0110 é copiado para o TCR 5 pos 45–46 para qualificação CPS (Custom Payment Service).',
      },
      elo: {
        targetTableId: 'elo-reg00',
        targetLocation: 'Implícito (Apenas transações aprovadas com DE 39 = 00 entram no TE05)',
        clearingFormat: 'N/A',
        status: '-',
        transformationRule: 'Transações negadas nunca são enviadas na liquidação.',
      },
      mastercard: {
        targetTableId: 'mc-1240-base',
        targetLocation: 'Não vai como DE 39 no MTI 1240 (Bit 39 = 0 no Clearing)',
        clearingFormat: 'Bit 39 = 0',
        status: '-',
        transformationRule: 'Exclusivo da resposta online 0110.',
      },
    },
    activeInPresets: { auth: PURCHASE_PRESETS, clearing: [] },
  },
  41: {
    shortLabel: 'TID',
    name: 'Card Acceptor Terminal Identification (Código do Terminal POS / TEF)',
    isoFormat: 'ans 8',
    presenceScope: 'both',
    authStatus: 'M',
    clearingStatus: 'C',
    authRole: 'Identifica o terminal físico (POS/Pinpad) ou lógico (E-Commerce) onde ocorreu a captura.',
    clearingRoleByBrand: {
      visa: {
        targetTableId: 'visa-tcr1',
        targetLocation: 'TCR 1 · Terminal ID / Additional Data',
        clearingFormat: '8 AN',
        status: 'C',
        transformationRule: 'Transportado nos dados complementares de captura.',
      },
      elo: {
        targetTableId: 'elo-reg01',
        targetLocation: 'Registro 01 · Pos 75–82 (Número Lógico do Terminal)',
        clearingFormat: '8 AN',
        status: 'M',
        transformationRule: 'Obrigatório [M] no Registro 01 pos 75–82 em todas as transações Elo.',
      },
      mastercard: {
        targetTableId: 'mc-1240-base',
        targetLocation: 'MTI 1240 · DE 041 (Card Acceptor Terminal ID)',
        clearingFormat: 'ans 8',
        status: 'C',
        transformationRule: 'Presente no MTI 1240 quando informado na autorização 0100.',
      },
    },
    activeInPresets: { auth: PURCHASE_PRESETS, clearing: PURCHASE_PRESETS },
  },
  42: {
    shortLabel: 'MID',
    name: 'Card Acceptor Identification Code (Código do Estabelecimento / MID)',
    isoFormat: 'ans 15',
    presenceScope: 'both',
    authStatus: 'M',
    clearingStatus: 'M',
    authRole: 'Identificador do estabelecimento comercial (Merchant ID / Ponto de Venda) no credenciador.',
    clearingRoleByBrand: {
      visa: {
        targetTableId: 'visa-tcr1',
        targetLocation: 'TCR 1 / TCR E (Sub-Merchant ID Pos 15–29 em PayFac)',
        clearingFormat: '15 AN',
        status: 'M',
        transformationRule: 'Em arranjo PayFac, o Sub-Merchant ID é obrigatório no TCR E pos 15–29.',
      },
      elo: {
        targetTableId: 'elo-reg01',
        targetLocation: 'Registro 01 · Pos 83–97 (Código do Ponto de Venda — 15 pos)',
        clearingFormat: '15 AN',
        status: 'M',
        transformationRule: 'Obrigatório [M] no Registro 01 pos 83–97.',
      },
      mastercard: {
        targetTableId: 'mc-1240-base',
        targetLocation: 'MTI 1240 · DE 042 (Card Acceptor ID Code / MID)',
        clearingFormat: 'ans 15',
        status: 'M',
        transformationRule: 'Obrigatório [M] no MTI 1240; se for Subcredenciador, o Submerchant ID vai também no DE 48 PDS 0208.',
      },
    },
    activeInPresets: { auth: PURCHASE_PRESETS, clearing: ALL_PRESETS },
  },
  43: {
    shortLabel: 'M-NAME',
    name: 'Card Acceptor Name & Location (Nome Fantasia, Cidade, UF e País do EC)',
    isoFormat: 'ans 40 (Auth) / LLVAR..99 (MTI 1240)',
    presenceScope: 'both',
    authStatus: 'M',
    clearingStatus: 'M',
    authRole: 'Nome do lojista (ex: "PF*LOJA EXEMPLO SAO PAULO BR") exibido no SMS/push da autorização.',
    clearingRoleByBrand: {
      visa: {
        targetTableId: 'visa-tcr0',
        targetLocation: 'TCR 0 · Pos 92–116 (Merchant Name 25B) + Pos 117–129 (City 13B) + Pos 130–132 (Country BR)',
        clearingFormat: '25 AN + 13 AN + 3 A',
        status: 'M',
        transformationRule: 'Desmembrado em 3 campos fixos no TCR 0 (Nome 92–116, Cidade 117–129, País 130–132). Em PayFac, deve usar prefixo "PF*Nome".',
      },
      elo: {
        targetTableId: 'elo-reg00',
        targetLocation: 'Reg 00 · Pos 104–128 (Nome 25B) + Pos 129–139 (Cidade 11B) + Reg 02 Pos 140–161 (EC Final)',
        clearingFormat: '25 AN + 11 AN',
        status: 'M',
        transformationRule: 'Obrigatório no Reg 00; quando houver Subcredenciador, o nome do lojista final é obrigatório também no Reg 02 pos 140–161.',
      },
      mastercard: {
        targetTableId: 'mc-1240-base',
        targetLocation: 'MTI 1240 · DE 043 (Card Acceptor Name/Location Estruturado com "\\")',
        clearingFormat: 'LLVAR ans..99 (Nome\\Endereço\\Cidade\\CEP+UF+BRA)',
        status: 'M',
        transformationRule: 'Obrigatório [M] no MTI 1240; é o descritor definitivo impresso na fatura do portador.',
      },
    },
    activeInPresets: { auth: PURCHASE_PRESETS, clearing: ALL_PRESETS },
  },
  48: {
    shortLabel: 'ADD-48',
    name: 'Additional Data — Private (Sub-elementos de Negócio, Parcelas, Brasil, 3DS & PayFac)',
    isoFormat: 'LLLVAR ans..999 (Tags TLV / PDS 0001 a PDS 0306)',
    presenceScope: 'both',
    authStatus: 'M',
    clearingStatus: 'M',
    authRole: 'Na autorização 0100 carrega dados privados da bandeira (TCC, CVV2, parcelamento, 3DS, subcredenciador).',
    clearingRoleByBrand: {
      visa: {
        targetTableId: 'visa-tcr2-br',
        targetLocation: 'Distribuído nos registros especializados: TCR 2 (BR), TCR D e TCR E',
        clearingFormat: 'Registros 168B dedicados',
        status: 'M',
        transformationRule: 'O que viaja em subcampos privados na 0100 é separado na Visa em TCR 2 BR (Parcelas/Liquidação Nacional), TCR D (Modalidades) e TCR E (PayFac).',
      },
      elo: {
        targetTableId: 'elo-reg02',
        targetLocation: 'Distribuído no Registro 01 (Parcelas/CNPJ) e Registro 02 (Tipo Op 990-995, Token, Subcred., IBGE)',
        clearingFormat: 'Registros 01 e 02 (168B)',
        status: 'M',
        transformationRule: 'Na Elo, os dados adicionais brasileiros viajam estruturados nas posições fixas dos Registros 01 e 02.',
      },
      mastercard: {
        targetTableId: 'mc-1240-brazil',
        targetLocation: 'MTI 1240 · DE 048 (Contêiner de PDS: 0195 Parcelado, 0220 CNPJ/CPF, 0176/0208 PayFac, 0185 3DS)',
        clearingFormat: 'LLLVAR (Sub-tags PDS 4 dígitos + Tam 3 dígitos + Valor)',
        status: 'M',
        transformationRule: 'Coração do Clearing Mastercard no Brasil: carrega PDS 0023, PDS 0158 (IRD), PDS 0195 (Parcelado Brasil), PDS 0220 (CNPJ/CPF), PDS 0176/0208 (PayFac) e PDS 0052/0184/0185 (3DS).',
      },
    },
    activeInPresets: { auth: PURCHASE_PRESETS, clearing: ALL_PRESETS },
  },
  49: {
    shortLabel: 'CURR',
    name: 'Currency Code, Transaction (Código de Moeda ISO 4217 — 986 = BRL)',
    isoFormat: 'n 3 (986 = Real Brasileiro)',
    presenceScope: 'both',
    authStatus: 'M',
    clearingStatus: 'M',
    authRole: 'Define a moeda da transação (986 para vendas domésticas no Brasil).',
    clearingRoleByBrand: {
      visa: {
        targetTableId: 'visa-tcr0',
        targetLocation: 'TCR 0 · Pos 89–91 (Source Currency = 986) + TCR 2 BR Pos 43–45 (Moeda Liq. = 986)',
        clearingFormat: '3 N (986)',
        status: 'M',
        transformationRule: 'Obrigatório [M] tanto no TCR 0 pos 89–91 quanto no TCR 2 (BR) pos 43–45.',
      },
      elo: {
        targetTableId: 'elo-reg00',
        targetLocation: 'Registro 00 · Pos 147–149 (Código da Moeda = 986)',
        clearingFormat: '3 N (986)',
        status: 'M',
        transformationRule: 'Obrigatório [M] nas posições 147–149 do Registro 00.',
      },
      mastercard: {
        targetTableId: 'mc-1240-base',
        targetLocation: 'MTI 1240 · DE 049 (Currency Code, Transaction = 986)',
        clearingFormat: 'n 3 (986)',
        status: 'M',
        transformationRule: 'Obrigatório [M] no MTI 1240.',
      },
    },
    activeInPresets: { auth: PURCHASE_PRESETS, clearing: ALL_PRESETS },
  },
  52: {
    shortLabel: 'PIN',
    name: 'Personal Identification Number (PIN Block Criptografado)',
    isoFormat: 'b 64 (8 bytes hex)',
    presenceScope: 'auth_only',
    authStatus: 'C',
    clearingStatus: '-',
    authRole: 'Bloco de senha (PIN Block ANSI X9.8 / ISO Format 0) validado pelo HSM do Emissor na 0100.',
    clearingRoleByBrand: {
      visa: {
        targetTableId: 'visa-tcr0',
        targetLocation: 'PROIBIDO NO CLEARING (Segurança Criptográfica / PCI)',
        clearingFormat: 'Proibido',
        status: '-',
        transformationRule: 'O PIN Block nunca sai da autorização online.',
      },
      elo: {
        targetTableId: 'elo-reg00',
        targetLocation: 'PROIBIDO NO CLEARING',
        clearingFormat: 'Proibido',
        status: '-',
        transformationRule: 'Apenas o indicador de captura de PIN vai no modo de entrada; o PIN Block é exclusivo da 0100.',
      },
      mastercard: {
        targetTableId: 'mc-1240-base',
        targetLocation: 'PROIBIDO NO MTI 1240 (Bit 52 = 0)',
        clearingFormat: 'Proibido',
        status: '-',
        transformationRule: 'Exclusivo da autorização online 0100.',
      },
    },
    activeInPresets: { auth: ['pos_chip_vista'], clearing: [] },
  },
  55: {
    shortLabel: 'EMV-55',
    name: 'Integrated Circuit Card (ICC) System Related Data (Tags EMV BER-TLV)',
    isoFormat: 'LLLVAR b..255 (Tags 9F26, 9F27, 9F10, 9F37, 9F36, 95, 9A, 9C, 5F2A, 82, 9F1A, 9F02, 9F03)',
    presenceScope: 'both',
    authStatus: 'C',
    clearingStatus: 'C',
    authRole: 'Transporta o criptograma ARQC (9F26) e tags do chip EMV na autorização 0100 (e ARPC 91 na 0110).',
    clearingRoleByBrand: {
      visa: {
        targetTableId: 'visa-tcr7',
        targetLocation: 'TCR 7 (Chip Card Transaction Data — Pos 05–168)',
        clearingFormat: '168 bytes posicionais fixos (desempacotados do TLV)',
        status: 'C',
        transformationRule: 'DIFERENÇA CRÍTICA: Na autorização 0100 as tags EMV viajam em TLV no DE 55; no Base II da Visa elas são desempacotadas em colunas fixas dentro do TCR 7 (ex: 9F26 vai na pos 56–71, 95 vai na pos 28–37, 9F36 vai na pos 52–55)!',
      },
      elo: {
        targetTableId: 'elo-reg07',
        targetLocation: 'Registro 07 (Dados de Transação com Chip — Pos 05–162)',
        clearingFormat: '168 bytes posicionais fixos',
        status: 'C',
        transformationRule: 'Na Elo, as tags EMV do DE 55 da autorização também são convertidas para posições fixas no Registro 07 (ex: Criptograma 9F26 nas pos 59–74, TVR 95 nas pos 29–38, IAD 9F10 nas pos 77–140).',
      },
      mastercard: {
        targetTableId: 'mc-1240-emv-3ds',
        targetLocation: 'MTI 1240 · DE 055 (Integrated Circuit Card Data em BER-TLV)',
        clearingFormat: 'LLLVAR BER-TLV',
        status: 'C',
        transformationRule: 'Na Mastercard, o DE 55 permanece em formato BER-TLV tanto na autorização 0100 quanto no Clearing MTI 1240!',
      },
    },
    activeInPresets: {
      auth: ['pos_chip_vista', 'parcelado_br'],
      clearing: ['pos_chip_vista', 'parcelado_br'],
    },
  },
  60: {
    shortLabel: 'POS-60',
    name: 'Additional POS Information / Advice Reason',
    isoFormat: 'LLLVAR ans..99',
    presenceScope: 'auth_only',
    authStatus: 'C',
    clearingStatus: '-',
    authRole: 'Dados adicionais de capacidade de terminal e comércio eletrônico na autorização 0100.',
    clearingRoleByBrand: {
      visa: {
        targetTableId: 'visa-tcr0',
        targetLocation: 'Mapeado para TCR 0 · Pos 158 (Terminal Capability) e Pos 164 (Moto/E-Comm Indicator)',
        clearingFormat: '1 AN + 1 AN',
        status: 'M',
        transformationRule: 'Decomposto nos indicadores de canal do TCR 0.',
      },
      elo: {
        targetTableId: 'elo-reg00',
        targetLocation: 'Mapeado para Registro 00 · Pos 152 (Capacidade Terminal) e Pos 140 (ECI)',
        clearingFormat: '1 AN',
        status: 'M',
        transformationRule: 'Decomposto nos indicadores do Registro 00.',
      },
      mastercard: {
        targetTableId: 'mc-1240-base',
        targetLocation: 'Absorvido pelas 12 posições do DE 022 no MTI 1240',
        clearingFormat: 'Bit 60 = 0 no MTI 1240',
        status: '-',
        transformationRule: 'No MTI 1240 todas as capacidades de terminal residem no DE 22 (12 caracteres).',
      },
    },
    activeInPresets: { auth: PURCHASE_PRESETS, clearing: [] },
  },
  62: {
    shortLabel: 'CPS-62',
    name: 'Custom Payment Service (CPS) / Transaction Identifier (TID 15 dígitos)',
    isoFormat: 'LLLVAR (DE 62.1 ACI + DE 62.2 Transaction Identifier 15 dígitos)',
    presenceScope: 'both',
    authStatus: 'M',
    clearingStatus: 'C',
    authRole: 'Na Visa (DE 62.2) retorna o Transaction Identifier (TID de 15 dígitos) que vincula autorização ao clearing.',
    clearingRoleByBrand: {
      visa: {
        targetTableId: 'visa-tcr5',
        targetLocation: 'TCR 5 · Pos 05–19 (Transaction Identifier — 15 dígitos) + Pos 20 (ACI)',
        clearingFormat: '15 N + 1 AN',
        status: 'M',
        transformationRule: 'Obrigatório [M] no TCR 5 pos 05–19: sem o TID retornado no DE 62.2 da 0110, a transação perde a qualificação CPS.',
      },
      elo: {
        targetTableId: 'elo-reg02',
        targetLocation: 'Identificadores de transação e token distribuídos no Registro 01 e Registro 02',
        clearingFormat: 'Posicional',
        status: 'M',
        transformationRule: 'Mapeado para os campos de rastreio do Registro 01 e 02.',
      },
      mastercard: {
        targetTableId: 'mc-1240-base',
        targetLocation: 'Na Mastercard o Lifecycle ID viaja no DE 063 (e não no DE 62)',
        clearingFormat: 'Ver DE 63',
        status: 'O',
        transformationRule: 'A Mastercard utiliza o DE 63 (Banknet Reference Number / Lifecycle ID) para cumprir esse papel.',
      },
    },
    activeInPresets: { auth: PURCHASE_PRESETS, clearing: ['pos_chip_vista', 'parcelado_br', 'ecom_3ds_token'] },
  },
  63: {
    shortLabel: 'LIFE-63',
    name: 'Network Data / Banknet Reference Number & Trace Lifecycle ID',
    isoFormat: 'LLLVAR ans..50 (9 chars Banknet Ref + 4 chars MMDD / 15 chars Trace ID)',
    presenceScope: 'both',
    authStatus: 'M',
    clearingStatus: 'M',
    authRole: 'Gerado pela rede da bandeira na autorização 0110 para identificar unicamente o ciclo de vida da transação.',
    clearingRoleByBrand: {
      visa: {
        targetTableId: 'visa-tcr5',
        targetLocation: 'Equivalente ao TID no TCR 5 · Pos 05–19',
        clearingFormat: '15 N',
        status: 'M',
        transformationRule: 'Cumprido pelo TID de 15 posições no TCR 5.',
      },
      elo: {
        targetTableId: 'elo-reg01',
        targetLocation: 'Equivalente ao NSU (Reg 01 Pos 63–74) + ARN (Reg 00 Pos 28–50)',
        clearingFormat: '12 N + 23 N',
        status: 'M',
        transformationRule: 'Garantido pela combinação NSU + ARN.',
      },
      mastercard: {
        targetTableId: 'mc-1240-base',
        targetLocation: 'MTI 1240 · DE 063 (Network Data / Lifecycle ID)',
        clearingFormat: 'LLLVAR ans..16',
        status: 'M',
        transformationRule: 'Obrigatório [M] no MTI 1240: deve conter exatamente o Banknet Reference Number + Date retornado pela Mastercard no DE 63 da resposta 0110!',
      },
    },
    activeInPresets: { auth: PURCHASE_PRESETS, clearing: ALL_PRESETS },
  },
  71: {
    shortLabel: 'MSG-NO',
    name: 'Message Number (Número Sequencial da Mensagem no Arquivo IPM)',
    isoFormat: 'n 8 (00000001 no Header 1644-697 até N no Trailer 1644-695)',
    presenceScope: 'clearing_only',
    authStatus: '-',
    clearingStatus: 'M',
    authRole: 'Não existe na autorização online (exclusivo de arquivos em lote ISO 8583:1993).',
    clearingRoleByBrand: {
      visa: {
        targetTableId: 'visa-tc91-92',
        targetLocation: 'Equivalente aos contadores de TCRs do TC 91 e TC 92',
        clearingFormat: '9 N / 15 N',
        status: 'M',
        transformationRule: 'No Base II o controle sequencial é feito pelos totalizadores de lote/arquivo (TC 91 e TC 92).',
      },
      elo: {
        targetTableId: 'elo-bz',
        targetLocation: 'Equivalente ao Total de Registros no Trailer BZ (Pos 09–16)',
        clearingFormat: '8 N',
        status: 'M',
        transformationRule: 'Controlado pelo contador total de linhas do Trailer BZ.',
      },
      mastercard: {
        targetTableId: 'mc-1240-base',
        targetLocation: 'MTI 1240 / 1442 / 1644 / 1740 · DE 071 (Message Number)',
        clearingFormat: 'n 8',
        status: 'M',
        transformationRule: 'Obrigatório [M] em todas as mensagens do arquivo IPM (motivo pelo qual o Bitmap Secundário Bit 1 está sempre ligado no MTI 1240).',
      },
    },
    activeInPresets: { auth: [], clearing: ALL_PRESETS },
  },
  72: {
    shortLabel: 'DATA-72',
    name: 'Data Record (Texto Livre de Disputa / Mensagem de Suporte)',
    isoFormat: 'LLLVAR ans..999',
    presenceScope: 'clearing_only',
    authStatus: '-',
    clearingStatus: 'C',
    authRole: 'Não utilizado na autorização 0100.',
    clearingRoleByBrand: {
      visa: {
        targetTableId: 'visa-tcr1',
        targetLocation: 'TCR 1 (TC 15 / TC 10) · Chargeback Member Message Text',
        clearingFormat: '50 AN',
        status: 'C',
        transformationRule: 'Transporta a justificativa textual da disputa ou fee collection.',
      },
      elo: {
        targetTableId: 'elo-reg01',
        targetLocation: 'Registro 01 / Texto de Disputa em TE15 / TE10',
        clearingFormat: 'AN',
        status: 'C',
        transformationRule: 'Usado nos fluxos de pós-venda (TE15/TE10).',
      },
      mastercard: {
        targetTableId: 'mc-1442-1740',
        targetLocation: 'MTI 1442 / 1740 · DE 072 (Data Record)',
        clearingFormat: 'LLLVAR ans..999',
        status: 'C',
        transformationRule: 'Obrigatório em diversos Reason Codes de Chargeback (MTI 1442) e Fee Collection (MTI 1740).',
      },
    },
    activeInPresets: { auth: [], clearing: ['chargeback_dispute'] },
  },
  94: {
    shortLabel: 'ORIG-94',
    name: 'Transaction Originator Institution ID Code (ICA Originador no Clearing)',
    isoFormat: 'LLVAR n..11',
    presenceScope: 'clearing_only',
    authStatus: '-',
    clearingStatus: 'M',
    authRole: 'Exclusivo da mensageria de Clearing ISO 8583:1993.',
    clearingRoleByBrand: {
      visa: {
        targetTableId: 'visa-tc90',
        targetLocation: 'TC 90 · Pos 07–12 (Originating CIB)',
        clearingFormat: '6 N',
        status: 'M',
        transformationRule: 'Identificado no Header TC 90.',
      },
      elo: {
        targetTableId: 'elo-b0',
        targetLocation: 'Header B0 · Pos 13–16 (Código do Credenciador Remetente)',
        clearingFormat: '4 N',
        status: 'M',
        transformationRule: 'Identificado no Header B0.',
      },
      mastercard: {
        targetTableId: 'mc-1240-base',
        targetLocation: 'MTI 1240 / 1442 / 1644 · DE 094 (Transaction Originator Institution ID)',
        clearingFormat: 'LLVAR n..11',
        status: 'M',
        transformationRule: 'Obrigatório [M] no IPM para identificar o membro originador da apresentação financeira.',
      },
    },
    activeInPresets: { auth: [], clearing: ALL_PRESETS },
  },
  104: {
    shortLabel: 'DS-104',
    name: 'Transaction-Specific Data (Datasets Subcredenciador, Parcelas, Companhia Aérea)',
    isoFormat: 'LLLVAR (TLV Datasets)',
    presenceScope: 'auth_only',
    authStatus: 'C',
    clearingStatus: '-',
    authRole: 'Transporta Datasets específicos de indústria, parcelamento ou PayFac na autorização 0100.',
    clearingRoleByBrand: {
      visa: {
        targetTableId: 'visa-tcre',
        targetLocation: 'Mapeado para TCR 2 (BR), TCR 3 (IATA), TCR D e TCR E (PayFac)',
        clearingFormat: 'TCRs de 168B',
        status: 'C',
        transformationRule: 'Os dados enviados no DE 104 durante a 0100 migram para os TCRs específicos (TCR 2, 3, D, E) no Base II.',
      },
      elo: {
        targetTableId: 'elo-reg02',
        targetLocation: 'Mapeado para Registro 02 (Subcredenciador), Registro 03 (P2P) e Registro 08 (IATA)',
        clearingFormat: 'Sub-registros 168B',
        status: 'C',
        transformationRule: 'Convertido para os sub-registros correspondentes na liquidação Elo.',
      },
      mastercard: {
        targetTableId: 'mc-1240-payfac-token',
        targetLocation: 'Mapeado para sub-elementos PDS no DE 048 ou MTI 1644 Addendum',
        clearingFormat: 'DE 48 PDS / MTI 1644',
        status: 'C',
        transformationRule: 'No Clearing IPM, todos esses atributos residem nos PDS do DE 48 ou no Addendum MTI 1644.',
      },
    },
    activeInPresets: {
      auth: ['parcelado_br', 'payfac_submerchant', 'push_oct_p2p'],
      clearing: [],
    },
  },
  126: {
    shortLabel: '3DS-126',
    name: '3-D Secure Authentication Data (CAVV, XID, ECI, Directory Server ID)',
    isoFormat: 'LLLVAR',
    presenceScope: 'auth_only',
    authStatus: 'C',
    clearingStatus: '-',
    authRole: 'Transporta o criptograma CAVV/AAV e dados 3DS 2.2 na autorização 0100.',
    clearingRoleByBrand: {
      visa: {
        targetTableId: 'visa-tcr5',
        targetLocation: 'TCR 5 · Pos 47–66 (CAVV 20B) + TCR 0 Pos 164 (ECI) + TCR D (3DS 2.x)',
        clearingFormat: '20 AN + 1 AN',
        status: 'C',
        transformationRule: 'O CAVV do DE 126.9 da 0100 deve ser gravado obrigatoriamente no TCR 5 pos 47–66 para garantir o Liability Shift.',
      },
      elo: {
        targetTableId: 'elo-reg05',
        targetLocation: 'Registro 05 · Pos 23–42 (XID) + Pos 43–82 (CAVV) + Pos 05–07 (ECI)',
        clearingFormat: 'Registro 05 (168B)',
        status: 'C',
        transformationRule: 'Escala o Registro 05 de Condicional [C] para Obrigatório [M] no arquivo de liquidação Elo.',
      },
      mastercard: {
        targetTableId: 'mc-1240-emv-3ds',
        targetLocation: 'MTI 1240 · DE 048 PDS 0052 (SLI) + PDS 0184 (DS ID) + PDS 0185 (AAV) + PDS 0186 (Program Protocol)',
        clearingFormat: 'DE 48 PDS TLV',
        status: 'C',
        transformationRule: 'No MTI 1240 os dados 3DS viajam dentro do DE 48 nas tags PDS 0052, 0184, 0185 e 0186.',
      },
    },
    activeInPresets: { auth: ['ecom_3ds_token'], clearing: [] },
  },
};

// Build full 1..128 array so the user sees the true 128-bit grid (Primary 1-64 + Secondary 65-128)
const FULL_128_BITS: BitSpec[] = Array.from({ length: 128 }, (_, idx) => {
  const bit = idx + 1;
  const cat = KEY_BITS_CATALOG[bit];
  if (cat) {
    return { bit, ...cat };
  }
  return {
    bit,
    shortLabel: `DE ${String(bit).padStart(3, '0')}`,
    name: `Data Element ${bit} (Reservado / Específico de Rede)`,
    isoFormat: 'ISO 8583 Standard',
    presenceScope: 'unused',
    authStatus: '-',
    clearingStatus: '-',
    authRole: 'Bit inativo (0) nos fluxos padrão de compra doméstica.',
    clearingRoleByBrand: {
      visa: {
        targetLocation: 'Não utilizado neste fluxo (Bit = 0)',
        clearingFormat: '-',
        status: '-',
        transformationRule: 'Permanece zerado (0) no mapa de bits.',
      },
      elo: {
        targetLocation: 'Não utilizado neste fluxo (Bit = 0)',
        clearingFormat: '-',
        status: '-',
        transformationRule: 'Permanece zerado (0) no mapa de bits.',
      },
      mastercard: {
        targetLocation: 'Não utilizado neste fluxo (Bit = 0)',
        clearingFormat: '-',
        status: '-',
        transformationRule: 'Permanece zerado (0) no mapa de bits do MTI 1240.',
      },
    },
    activeInPresets: { auth: [], clearing: [] },
  };
});

function computeHexBitmap(bitsActive: boolean[]): { primaryHex: string; secondaryHex: string; binary64Primary: string; binary64Secondary: string } {
  const toHexChunk = (slice64: boolean[]) => {
    let hex = '';
    for (let i = 0; i < 64; i += 4) {
      const nibble =
        (slice64[i] ? 8 : 0) +
        (slice64[i + 1] ? 4 : 0) +
        (slice64[i + 2] ? 2 : 0) +
        (slice64[i + 3] ? 1 : 0);
      hex += nibble.toString(16).toUpperCase();
    }
    return hex.replace(/(.{2})/g, '$1 ').trim();
  };

  const pSlice = bitsActive.slice(0, 64);
  const sSlice = bitsActive.slice(64, 128);

  return {
    primaryHex: toHexChunk(pSlice),
    secondaryHex: toHexChunk(sSlice),
    binary64Primary: pSlice.map((b) => (b ? '1' : '0')).join(''),
    binary64Secondary: sSlice.map((b) => (b ? '1' : '0')).join(''),
  };
}

export function OutgoingBitmapExplorer({
  selectedBrand,
  onSelectTable,
}: {
  selectedBrand: OutgoingBrandId;
  onSelectTable: (brand: OutgoingBrandId, tableId: string) => void;
}) {
  const [viewMode, setViewMode] = useState<BitmapViewMode>('compare');
  const [selectedPreset, setSelectedPreset] = useState<BitmapPresetId>('parcelado_br');
  const [selectedBitNumber, setSelectedBitNumber] = useState<number>(55);
  const [onlyCatalogedBits, setOnlyCatalogedBits] = useState<boolean>(false);

  const brandMeta = OUTGOING_BRANDS[selectedBrand];
  const presetObj = BITMAP_PRESETS.find((p) => p.id === selectedPreset) || BITMAP_PRESETS[0];

  const authBitsActive = useMemo(
    () => FULL_128_BITS.map((b) => b.activeInPresets.auth.includes(selectedPreset)),
    [selectedPreset]
  );

  // In Clearing: for Mastercard it's the true MTI 1240 bitmap; for Visa/Elo it lights up every bit that maps to an active Outgoing TCR/Sub-registro or is active in clearing!
  const clearingBitsActive = useMemo(
    () =>
      FULL_128_BITS.map((b) => {
        if (selectedBrand === 'mastercard') {
          return b.activeInPresets.clearing.includes(selectedPreset);
        }
        // For Visa and Elo, highlight bits whose data travels in the Outgoing Clearing records for this preset
        return (
          b.activeInPresets.clearing.includes(selectedPreset) ||
          (b.activeInPresets.auth.includes(selectedPreset) &&
            b.clearingRoleByBrand[selectedBrand].status !== '-')
        );
      }),
    [selectedBrand, selectedPreset]
  );

  const authHex = useMemo(() => computeHexBitmap(authBitsActive), [authBitsActive]);
  const clearingHex = useMemo(() => computeHexBitmap(clearingBitsActive), [clearingBitsActive]);

  const activeBitSpec = useMemo(
    () => FULL_128_BITS.find((b) => b.bit === selectedBitNumber) || FULL_128_BITS[1],
    [selectedBitNumber]
  );

  const displayedBits = useMemo(() => {
    if (onlyCatalogedBits) {
      return FULL_128_BITS.filter((b) => b.presenceScope !== 'unused');
    }
    return FULL_128_BITS;
  }, [onlyCatalogedBits]);

  return (
    <div className="space-y-6">
      {/* =====================================================================
          CABEÇALHO E SELETOR DE MODO DO MAPA DE BITS (AUTH × CLEARING)
         ===================================================================== */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 space-y-5 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-blue-400">
              🧮 ARQUITETURA DE MAPA DE BITS (ISO 8583 BITMAP 1–128: AUTORIZAÇÃO × CLEARING OUTGOING)
            </span>
            <h3 className="text-lg sm:text-xl font-black text-white mt-0.5">
              Mapa de Bits da Autorização (0100/0110) vs Mapa de Bits e Registros do Clearing ({brandMeta.name})
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Compare exatamente quais bits ligam na <strong>Autorização Online (0100/0110)</strong>, quais ligam no <strong>Clearing (MTI 1240)</strong>, quais mudam de bit (ex: <code>DE 18 ➔ DE 26</code>) e como cada bit vira <code>TCR 0..E</code> na Visa ou <code>Registro 00..09</code> na Elo.
            </p>
          </div>

          {/* 3 Modos de Visualização */}
          <div className="flex flex-wrap gap-1.5 shrink-0">
            <button
              onClick={() => setViewMode('compare')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                viewMode === 'compare'
                  ? 'bg-blue-600 text-white border-blue-400 shadow-lg shadow-blue-950/50'
                  : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-blue-500/40'
              }`}
            >
              ⇄ Comparado (Auth × Clearing)
            </button>
            <button
              onClick={() => setViewMode('auth')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                viewMode === 'auth'
                  ? 'bg-purple-600 text-white border-purple-400 shadow-lg shadow-purple-950/50'
                  : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-purple-500/40'
              }`}
            >
              ⚡ Só Autorização (0100 / 0110)
            </button>
            <button
              onClick={() => setViewMode('clearing')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                viewMode === 'clearing'
                  ? 'bg-emerald-600 text-white border-emerald-400 shadow-lg shadow-emerald-950/50'
                  : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-emerald-500/40'
              }`}
            >
              📦 Só Clearing / Outgoing
            </button>
          </div>
        </div>

        {/* Seletor de Cenário (6 Presets que recalculam o Bitmap Hexadecimal e Binário) */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="font-bold uppercase tracking-wider text-slate-300">
              1. Escolha o Cenário para Calcular o Mapa de Bits (Hexadecimal & Binário) em Tempo Real:
            </span>
            <button
              onClick={() => setOnlyCatalogedBits((prev) => !prev)}
              className={`px-3 py-1 rounded-lg border font-mono text-[11px] font-bold transition-all ${
                onlyCatalogedBits
                  ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {onlyCatalogedBits
                ? 'Mostrando Apenas os 23 Bits de Negócio (Clique p/ Grade Completa 128 Bits)'
                : 'Mostrando Grade Completa 128 Bits (Clique p/ Filtrar Só Bits Ativos)'}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {BITMAP_PRESETS.map((pr) => {
              const isSel = pr.id === selectedPreset;
              return (
                <button
                  key={pr.id}
                  onClick={() => setSelectedPreset(pr.id)}
                  className={`rounded-xl p-3 text-left border transition-all flex flex-col justify-between gap-1.5 ${
                    isSel
                      ? 'bg-blue-950/50 border-blue-400 shadow-md shadow-blue-950/40'
                      : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="text-xs font-black text-white">{pr.title}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{pr.subtitle}</div>
                  </div>
                  <div className="pt-1 border-t border-slate-800/80 flex items-center justify-between gap-2 text-[10px] font-mono">
                    <span className="text-purple-300">Auth: {pr.authMti}</span>
                    <span className="text-emerald-300 truncate">{pr.clearingRefByBrand[selectedBrand]}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Painel Duplo do Bitmap Calculado em Hexadecimal (Autorização vs Clearing) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Card Bitmap da Autorização (0100/0110) */}
          <div className="rounded-xl bg-slate-950 border border-purple-500/30 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono text-[11px] font-black">
                ⚡ BITMAP DA AUTORIZAÇÃO ONLINE ({presetObj.authMti})
              </span>
              <span className="font-mono text-xs text-purple-300 font-bold">
                {authBitsActive.filter(Boolean).length} bits ligados (= 1)
              </span>
            </div>
            <div className="space-y-1 font-mono text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-slate-900/90 border border-slate-800 rounded-lg px-3 py-1.5">
                <span className="text-[10px] text-slate-400">PRIMARY BITMAP (Bits 01–64 Hex):</span>
                <span className="text-purple-300 font-black tracking-wider">{authHex.primaryHex}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-slate-900/90 border border-slate-800 rounded-lg px-3 py-1.5">
                <span className="text-[10px] text-slate-400">SECONDARY BITMAP (Bits 65–128 Hex):</span>
                <span className="text-purple-300 font-black tracking-wider">{authHex.secondaryHex}</span>
              </div>
            </div>
          </div>

          {/* Card Bitmap / Vetor do Clearing (Outgoing) */}
          <div className="rounded-xl bg-slate-950 border border-emerald-500/30 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[11px] font-black">
                📦 {selectedBrand === 'mastercard' ? 'BITMAP DO CLEARING (MTI 1240 / 1442 IPM)' : `MAPA DE BITS TRANSPORTADOS NO OUTGOING (${brandMeta.name})`}
              </span>
              <span className="font-mono text-xs text-emerald-300 font-bold">
                {clearingBitsActive.filter(Boolean).length} bits mapeados (= 1)
              </span>
            </div>
            <div className="space-y-1 font-mono text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-slate-900/90 border border-slate-800 rounded-lg px-3 py-1.5">
                <span className="text-[10px] text-slate-400">PRIMARY BITMAP (Bits 01–64 Hex):</span>
                <span className="text-emerald-300 font-black tracking-wider">{clearingHex.primaryHex}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-slate-900/90 border border-slate-800 rounded-lg px-3 py-1.5">
                <span className="text-[10px] text-slate-400">SECONDARY BITMAP (Bits 65–128 Hex):</span>
                <span className="text-emerald-300 font-black tracking-wider">{clearingHex.secondaryHex}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================================
          CORPO PRINCIPAL: GRADE DE 128 BITS (ESQUERDA) + INSPETOR DO BIT (DIREITA)
         ===================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Coluna Esquerda (7 cols): Grade Visual de 128 Bits */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-800 bg-slate-900/80 p-5 space-y-4 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <h4 className="text-sm font-black uppercase tracking-wider text-white">
                Grade Interativa de Bits (DE 001 a DE 128)
              </h4>
              <p className="text-[11px] text-slate-400">
                Clique em qualquer bit abaixo para ver sua regra na Autorização (0100/0110) e seu destino exato no Clearing ({brandMeta.name}).
              </p>
            </div>

            {/* Legenda de Cores */}
            <div className="flex flex-wrap gap-1.5 text-[10px] font-bold">
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-300">
                🟢 Ambos (Auth + Clearing)
              </span>
              <span className="px-2 py-0.5 rounded bg-purple-500/20 border border-purple-500/40 text-purple-300">
                🟣 Só Autorização (0100/0110)
              </span>
              <span className="px-2 py-0.5 rounded bg-blue-500/20 border border-blue-500/40 text-blue-300">
                🔵 Só Clearing (Outgoing)
              </span>
            </div>
          </div>

          {/* Grid dos Bits */}
          <div
            className={`grid gap-1.5 ${
              onlyCatalogedBits
                ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4'
                : 'grid-cols-4 sm:grid-cols-8'
            }`}
          >
            {displayedBits.map((b) => {
              const inAuth = authBitsActive[b.bit - 1];
              const inClear = clearingBitsActive[b.bit - 1];
              const isSelected = b.bit === selectedBitNumber;

              let cellStyle = 'bg-slate-950/50 border-slate-800/70 text-slate-600 opacity-55 hover:opacity-100';
              let badgeText = '0';

              if (viewMode === 'compare') {
                if (inAuth && inClear) {
                  cellStyle = 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200';
                  badgeText = 'AUTH+CLR';
                } else if (inAuth && !inClear) {
                  cellStyle = 'bg-purple-950/40 border-purple-500/50 text-purple-200';
                  badgeText = 'SÓ AUTH';
                } else if (!inAuth && inClear) {
                  cellStyle = 'bg-blue-950/40 border-blue-500/50 text-blue-200';
                  badgeText = 'SÓ CLR';
                }
              } else if (viewMode === 'auth') {
                if (inAuth) {
                  cellStyle = 'bg-purple-950/50 border-purple-400/60 text-purple-100';
                  badgeText = `1 [${b.authStatus}]`;
                }
              } else {
                if (inClear) {
                  cellStyle = 'bg-emerald-950/50 border-emerald-400/60 text-emerald-100';
                  badgeText = `1 [${b.clearingRoleByBrand[selectedBrand].status}]`;
                }
              }

              return (
                <button
                  key={b.bit}
                  onClick={() => setSelectedBitNumber(b.bit)}
                  className={`rounded-xl p-2 border text-left transition-all flex flex-col justify-between ${cellStyle} ${
                    isSelected ? 'ring-2 ring-white scale-[1.03] opacity-100 shadow-lg z-10' : ''
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 font-mono text-[10px]">
                    <span className="font-black">#{String(b.bit).padStart(3, '0')}</span>
                    <span className="px-1 rounded bg-black/40 text-[8px] font-bold">{badgeText}</span>
                  </div>
                  <div className="font-mono text-[11px] font-black truncate mt-1">
                    {b.shortLabel}
                  </div>
                  {onlyCatalogedBits && (
                    <div className="text-[10px] opacity-80 truncate mt-0.5">{b.name}</div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Coluna Direita (5 cols): Inspetor Detalhado do Bit Selecionado (Auth vs Clearing) */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-800 bg-slate-900/90 p-5 space-y-4 lg:sticky lg:top-4 shadow-2xl">
          <div className="border-b border-slate-800 pb-3 space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-blue-500/20 border border-blue-500/40 font-mono text-xs font-black text-blue-300">
                BIT / DE #{String(activeBitSpec.bit).padStart(3, '0')} · {activeBitSpec.shortLabel}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300">
                {activeBitSpec.isoFormat}
              </span>
            </div>
            <h4 className="text-base sm:text-lg font-black text-white">{activeBitSpec.name}</h4>
          </div>

          {/* Bloco 1: Comportamento na Autorização Online (0100 / 0110) */}
          <div className="rounded-xl bg-purple-950/20 border border-purple-500/30 p-4 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-purple-300">
                ⚡ 1. Na Autorização Online (ISO 8583: 0100 / 0110)
              </span>
              <span className="px-2 py-0.5 rounded bg-purple-500/20 font-mono text-[11px] font-black text-purple-200">
                Status Auth: [{activeBitSpec.authStatus}] · Bit = {authBitsActive[activeBitSpec.bit - 1] ? '1 (Ativo)' : '0 (Inativo)'}
              </span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed">{activeBitSpec.authRole}</p>
          </div>

          {/* Bloco 2: Comportamento no Clearing / Outgoing da Bandeira Selecionada */}
          <div className="rounded-xl bg-emerald-950/20 border border-emerald-500/30 p-4 space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-emerald-300">
                📦 2. No Clearing / Outgoing ({brandMeta.name})
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 font-mono text-[11px] font-black text-emerald-200">
                Status Clearing: [{activeBitSpec.clearingRoleByBrand[selectedBrand].status}]
              </span>
            </div>

            <div className="rounded-lg bg-slate-950/90 border border-slate-800 p-2.5 space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Destino Físico no Arquivo de Outgoing ({brandMeta.name}):
              </div>
              <div className="font-mono text-xs font-black text-emerald-300">
                {activeBitSpec.clearingRoleByBrand[selectedBrand].targetLocation}
              </div>
              <div className="font-mono text-[11px] text-slate-400">
                Formato no Clearing: {activeBitSpec.clearingRoleByBrand[selectedBrand].clearingFormat}
              </div>
            </div>

            <div className="text-xs text-slate-200 leading-relaxed">
              <strong className="text-amber-300">Regra de Transformação (Auth ➔ Clearing): </strong>
              {activeBitSpec.clearingRoleByBrand[selectedBrand].transformationRule}
            </div>

            {activeBitSpec.clearingRoleByBrand[selectedBrand].targetTableId && (
              <button
                onClick={() =>
                  onSelectTable(
                    selectedBrand,
                    activeBitSpec.clearingRoleByBrand[selectedBrand].targetTableId!
                  )
                }
                className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all"
              >
                Abrir Tabela de Destino no Outgoing ({activeBitSpec.clearingRoleByBrand[selectedBrand].targetLocation.split('·')[0].trim()}) →
              </button>
            )}
          </div>

          {/* Bloco 3: Comparativo Rápido desse mesmo Bit nas 3 Bandeiras */}
          <div className="rounded-xl bg-slate-950/90 border border-slate-800 p-3.5 space-y-2">
            <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Onde o Bit #{String(activeBitSpec.bit).padStart(3, '0')} ({activeBitSpec.shortLabel}) aterrissa em cada bandeira:
            </div>
            <div className="space-y-1.5 text-[11px]">
              <div className="flex items-start justify-between gap-2 border-b border-slate-800/70 pb-1">
                <span className="font-bold text-blue-400 shrink-0">Visa Base II:</span>
                <span className="font-mono text-slate-300 text-right">
                  {activeBitSpec.clearingRoleByBrand.visa.targetLocation}
                </span>
              </div>
              <div className="flex items-start justify-between gap-2 border-b border-slate-800/70 pb-1">
                <span className="font-bold text-amber-400 shrink-0">Elo 26.2:</span>
                <span className="font-mono text-slate-300 text-right">
                  {activeBitSpec.clearingRoleByBrand.elo.targetLocation}
                </span>
              </div>
              <div className="flex items-start justify-between gap-2">
                <span className="font-bold text-emerald-400 shrink-0">Mastercard IPM:</span>
                <span className="font-mono text-slate-300 text-right">
                  {activeBitSpec.clearingRoleByBrand.mastercard.targetLocation}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
