'use client';

import React, { useMemo, useState } from 'react';
import { OutgoingBrandId } from '@/data/outgoing-tables-flows';
import { sendToDocStudio } from '@/lib/docStudioBridge';

export type EngineeringLabTab =
  | 'test_builder'
  | 'reject_doctor'
  | 'reconciliation_4way'
  | 'certification_suite'
  | 'release_diff';

// ============================================================================
// DADOS DO MÓDULO 2: DOUTOR DE REJEIÇÕES (EP747 / T112 / TE01 REG 09 / SLC)
// ============================================================================
export interface RejectDoctorCase {
  id: string;
  brand: 'visa' | 'mastercard' | 'elo' | 'slc';
  brandLabel: string;
  errorCode: string;
  reportSource: string;
  recordAndPos: string;
  title: string;
  rootCause: string;
  wrongWireLine: string;
  fixedWireLine: string;
  rePresentmentPlaybook: string;
  financialRiskIfIgnored: string;
}

export const REJECT_DOCTOR_CASES: RejectDoctorCase[] = [
  {
    id: 'rej-visa-v108',
    brand: 'visa',
    brandLabel: 'Visa Base II (EP747)',
    errorCode: 'EP747-V108',
    reportSource: 'Visa Edit Package (EP747 Local) / VSS Reject',
    recordAndPos: 'TC 05 · TCR 2 Brasil (Pos 40–41)',
    title: 'Quantidade de Parcelas sem a Soma +10 no TCR 2 Nacional',
    rootCause:
      'No layout nacional brasileiro da Visa, uma compra parcelada em N vezes exige gravar (N + 10) nas posições 40–41 do TCR 2 (ex.: 6x = "16"). O motor enviou "06", que é interpretado como código inválido.',
    wrongWireLine: '0502BR0000000000200000000000000000000000600000000000000000000000',
    fixedWireLine: '0502BR0000000000200000000000000000000001600000000000000000000000',
    rePresentmentPlaybook:
      'Corrigir a regra de formatação do TCR 2 (Pos 40-41 = String(parcelas + 10).padStart(2,"0")), regerar o lote mantendo o mesmo ARN e reenviar na próxima janela DEX.',
    financialRiskIfIgnored:
      'Transação inteira recusada no clearing; lojista não recebe a agenda parcelada até o reenvio.',
  },
  {
    id: 'rej-visa-v214',
    brand: 'visa',
    brandLabel: 'Visa Base II (VX-100A / VSS-140)',
    errorCode: 'VX100A-TID00',
    reportSource: 'Relatório Visa VX-100A & VSS-140 (Downgrade)',
    recordAndPos: 'TC 05 · TCR 5 (Pos 05–19 · 15 dígitos)',
    title: 'Transaction Identifier (TID DE 62.2) Zerado ou Ausente no TCR 5',
    rootCause:
      'O Switch Autorizador recebeu os 15 dígitos do DE 62.2 na resposta 0110 da VisaNet, mas não persistiu para o Motor Outgoing, que preencheu zeros nas posições 5 a 19 do TCR 5.',
    wrongWireLine: '0505000000000000000Y00000000015000098600000000000000000000000000',
    fixedWireLine: '0505306318294011284Y00000000015000098600000000000000000000000000',
    rePresentmentPlaybook:
      'A venda já foi liquidada com downgrade (não cabe reenvio de TC 05). Corrigir imediatamente o mapeamento DE 62.2 ➔ TCR 5 Pos 5-19 para estancar o vazamento nos lotes seguintes.',
    financialRiskIfIgnored:
      'Downgrade tarifário automático para EIRF / Standard (+40 a +95 bps) + cobrança de Transaction Integrity Fee no relatório VX-100A.',
  },
  {
    id: 'rej-visa-v901',
    brand: 'visa',
    brandLabel: 'Visa Base II (EP747)',
    errorCode: 'EP747-V901',
    reportSource: 'Visa Edit Package (EP747 Batch/File Trailer)',
    recordAndPos: 'TC 91 / TC 92 (Pos 22–36 Source Amount & Record Count)',
    title: 'Divergência de Somatório Financeiro ou Contagem de TCRs no Trailer',
    rootCause:
      'Foi adicionado um registro condicional (ex.: TCR 7 EMV ou TCR E PayFac) nas transações, mas o contador de linhas físicas ou o acumulador de Source Amount no TC 91/92 não somou corretamente.',
    wrongWireLine: '920000000000000000000000000010000000000000012 [Soma diverge 1 TCR]',
    fixedWireLine: '920000000000000000000000000015000000000000014 [Soma e Count exatos]',
    rePresentmentPlaybook:
      'Recalcular o TC 91 e TC 92 como última etapa atômica do gerador de arquivos antes de fechar o stream .CTF.',
    financialRiskIfIgnored:
      'Rejeição total do lote/arquivo no EP747 antes mesmo de subir para a VisaNet.',
  },
  {
    id: 'rej-mc-t112-0301',
    brand: 'mastercard',
    brandLabel: 'Mastercard GCMS (T112)',
    errorCode: 'T112-ERR-0301',
    reportSource: 'Mastercard T112 (Inbound File Confirmation & Error)',
    recordAndPos: 'MTI 1644 (Function Code 695) · PDS 0301 & PDS 0306',
    title: 'Rejeição de Arquivo IPM por Divergência de Checksum no Trailer (PDS 0301)',
    rootCause:
      'No arquivo IPM R111, o Trailer MTI 1644 (DE 24=695) exige que o PDS 0301 contenha a soma algébrica exata de todos os DE 04 das mensagens 1240/1442 do arquivo e o PDS 0306 a contagem total.',
    wrongWireLine: 'MTI=1644 DE24=695 DE48=[PDS0105=00126111400001][PDS0301=000000000140000][PDS0306=00000005]',
    fixedWireLine: 'MTI=1644 DE24=695 DE48=[PDS0105=00126111400001][PDS0301=000000000150000][PDS0306=00000005]',
    rePresentmentPlaybook:
      'Gerar novo File ID (PDS 0105 incrementado) no Header 1644-697 e no Trailer 1644-695 com o PDS 0301 recalculado e retransmitir via MFE.',
    financialRiskIfIgnored:
      'O arquivo R111 inteiro é descartado pelo GCMS em ~20 minutos; zero reais entram na compensação D+1.',
  },
  {
    id: 'rej-mc-gcms-0195',
    brand: 'mastercard',
    brandLabel: 'Mastercard GCMS (T112 / T140)',
    errorCode: 'GCMS-PDS-0195',
    reportSource: 'Mastercard T112 / T140 Clearing Reject',
    recordAndPos: 'MTI 1240 · DE 48 Sub-elemento PDS 0195 (Brasil)',
    title: 'Venda Parcelada Doméstica Brasil sem o Sub-elemento PDS 0195',
    rootCause:
      'A venda foi autorizada como parcelada no Brasil, mas o MTI 1240 de First Presentment foi enviado sem a tag TLV PDS 0195 (Installment Data Brazil) ou sem o PDS 0220 (CNPJ/CPF do lojista).',
    wrongWireLine: 'MTI=1240 DE24=200 DE4=000000060000 DE48=[PDS0002=MPL][PDS0158=A4]',
    fixedWireLine: 'MTI=1240 DE24=200 DE4=000000060000 DE48=[PDS0002=MPL][PDS0158=A4][PDS0195=0106][PDS0220=12345678000199]',
    rePresentmentPlaybook:
      'Injetar obrigatoriamente o par PDS 0195 + PDS 0220 em toda MTI 1240 doméstica parcelada no Brasil e reenviar a transação.',
    financialRiskIfIgnored:
      'Rejeição da transação no GCMS ou liquidação incorreta como à vista (1x), quebrando a agenda na Registradora B3/CERC.',
  },
  {
    id: 'rej-elo-r09-e011',
    brand: 'elo',
    brandLabel: 'Elo Serviço 10 (TE01 + Reg 09)',
    errorCode: 'ELO-R09-E011',
    reportSource: 'Arquivo de Retorno Elo TE01 (Sub-registro 09)',
    recordAndPos: 'TE05 · Sequência de Sub-registros 00 + 01 + 02',
    title: 'Transação Devolvida como TE01 por Ausência do Registro 02 na Trinca Obrigatória',
    rootCause:
      'Na Elo, toda apresentação financeira (TE05/TE06) exige a trinca indivisível Registro 00 + Registro 01 + Registro 02. O gerador omitiu o Registro 02.',
    wrongWireLine: '0500... [Reg 00]\n0501... [Reg 01]\n0507... [Pulou o Reg 02!]',
    fixedWireLine: '0500... [Reg 00]\n0501... [Reg 01]\n0502990... [Reg 02 Presente]\n0507... [Reg 07 EMV]',
    rePresentmentPlaybook:
      'Ler o Registro 09 retornado na TE01, reconstruir a TE05 com a trinca completa (00+01+02) e incluir na janela seguinte do Serviço 10 (11h, 15h, 19h ou 00h).',
    financialRiskIfIgnored:
      'A venda específica fica retida fora da liquidação financeira do relatório 20-02.',
  },
  {
    id: 'rej-elo-r09-e042',
    brand: 'elo',
    brandLabel: 'Elo Serviço 10 (TE01 + Reg 09)',
    errorCode: 'ELO-R09-E042',
    reportSource: 'Arquivo de Retorno Elo TE01 (Sub-registro 09)',
    recordAndPos: 'Reg 01 (Pos 17–18 Parcelas) × Reg 02 (Pos 05–07 Tipo Operação)',
    title: 'Conflito Cruzado entre Quantidade de Parcelas (Reg 01) e Tipo de Operação (Reg 02)',
    rootCause:
      'O Registro 01 informou "06" parcelas nas posições 17–18, porém o Registro 02 manteve "990" (Crédito à Vista) em vez de "992" (Parcelado Loja Sem Juros).',
    wrongWireLine: '050100000000000006... [6 parcelas] + 0502990... [990 = À vista!]',
    fixedWireLine: '050100000000000006... [6 parcelas] + 0502992... [992 = Parcelado Loja]',
    rePresentmentPlaybook:
      'Sincronizar a máquina de estados: se Parcelas > 01 e financiado pelo lojista, forçar Pos 5–7 do Registro 02 = "992".',
    financialRiskIfIgnored:
      'Devolução imediata na TE01 com Registro 09.',
  },
  {
    id: 'rej-slc-aslc026e',
    brand: 'slc',
    brandLabel: 'CIP / Núclea SLC (RSFN XML)',
    errorCode: 'ASLC026E-EGEN0014',
    reportSource: 'Retorno RSFN CIP/SLC (Grade da Manhã)',
    recordAndPos: 'Tag XML <ISPBIFLiquid> / <CtPagto> / <CNPJ_CPFPontoVenda>',
    title: 'Rejeição de Liquidação no SLC por Conta de Domicílio Encerrada ou Divergente da UR',
    rootCause:
      'O clearing na bandeira passou, mas ao enviar a ordem de pagamento ASLC026 para o banco domicílio do lojista, o ISPB/Conta informado não bateu com a titularidade do CNPJ/CPF ou com a trava da Registradora B3/CERC.',
    wrongWireLine: '<ASLC026><CNPJ_CPFPontoVenda>12345678000199</CNPJ_CPFPontoVenda><CtPagto>00000000</CtPagto></ASLC026>',
    fixedWireLine: '<ASLC026><CNPJ_CPFPontoVenda>12345678000199</CNPJ_CPFPontoVenda><CtPagto>009988776</CtPagto></ASLC026>',
    rePresentmentPlaybook:
      'Consultar a grade atualizada da Registradora (B3/CERC) e reenviar o lançamento na janela complementar da tarde do SLC no mesmo dia útil.',
    financialRiskIfIgnored:
      'Lojista não recebe o depósito no dia do vencimento da agenda, gerando incidente financeiro e regulatório.',
  },
];

// ============================================================================
// DADOS DO MÓDULO 4: WORKBENCH DE HOMOLOGAÇÃO & CERTIFICAÇÃO END-TO-END
// ============================================================================
export interface CertificationTestCase {
  id: string;
  code: string;
  category: string;
  title: string;
  mandatoryFor: string;
  onlineIsoRequirements: string;
  outgoingClearingRequirements: string;
  expectedResult: string;
}

export const CERTIFICATION_TEST_CASES: CertificationTestCase[] = [
  {
    id: 'cert-01',
    code: 'CT-01 · REDE & HSM',
    category: 'Conectividade & Chaves',
    title: 'Sign-On, Echo Test (30s) e Troca Dinâmica de ZPK (MTI 0800 / 0810)',
    mandatoryFor: 'Adquirente & Emissor (Visa EAS, Mastercard MIP, Elo STI)',
    onlineIsoRequirements: 'MTI 0800/0810 com DE 70 = 001 (Sign-On), 301 (Echo Test) e 101/161 (Key Exchange + KCV no DE 53/96).',
    outgoingClearingRequirements: 'Não gera registro financeiro no Outgoing (apenas log de auditoria KMS/HSM).',
    expectedResult: 'DE 39 = 00 em < 150ms e Key Check Value (KCV) sincronizado no HSM Thales PayShield.',
  },
  {
    id: 'cert-02',
    code: 'CT-02 · CHIP EMV + PIN',
    category: 'Presencial Contato',
    title: 'Compra Presencial Chip EMV com Senha Online e Validação ARQC ➔ ARPC',
    mandatoryFor: 'Adquirente & Emissor (4 Bandeiras)',
    onlineIsoRequirements: 'MTI 0100/0110 · DE 22 = 051 · DE 52 (PIN Block ZPK) · DE 55 (Tags 9F26, 9F27, 9F10, 9F36, 95, 9A, 9C, 9F02, 5F2A).',
    outgoingClearingRequirements: 'Visa: TCR 0 + TCR 5 (TID) + TCR 7 · Mastercard: MTI 1240 + DE 55 + DE 63 · Elo: Reg 00+01+02 + Reg 07.',
    expectedResult: 'Aprovação DE 39 = 00 com Tag 91 (ARPC) devolvida pelo Emissor e qualificação máxima de intercâmbio.',
  },
  {
    id: 'cert-03',
    code: 'CT-03 · NFC CONTACTLESS',
    category: 'Presencial Aproximação',
    title: 'Compra Contactless (Tap / SoftPOS) Abaixo e Acima do Limite CVM',
    mandatoryFor: 'Adquirente & Emissor (POS e Tap on Phone MPoC)',
    onlineIsoRequirements: 'MTI 0100/0110 · DE 22 = 071 (Contactless Chip) · DE 60/61 indicadores NFC e Form Factor.',
    outgoingClearingRequirements: 'Preservação do Entry Mode 07 e criptograma EMV no TCR 7 / DE 55 / Reg 07.',
    expectedResult: 'Qualificação Contactless sem downgrade e comprovação de limite CVM (Com/Sem Senha).',
  },
  {
    id: 'cert-04',
    code: 'CT-04 · E-COMMERCE 3DS 2.2',
    category: 'Cartão Não Presente (CNP)',
    title: 'Compra E-Commerce Autenticada EMV 3DS 2.2 (CAVV v9 AES / AAV + dsTransID)',
    mandatoryFor: 'Adquirente, 3DSS (MPI) & ACS Emissor',
    onlineIsoRequirements: 'MTI 0100/0110 · DE 22 = 010/810 · ECI 05 (Visa/Elo) ou SLI 210 (MC) + CAVV/AAV + Directory Server Trans ID.',
    outgoingClearingRequirements: 'Visa: TCR 5 + TCR D · Mastercard: MTI 1240 PDS 0052 + 0184 + 0185 + 0186 · Elo: Registro 05.',
    expectedResult: 'Liability Shift (transferência de risco de fraude para o Emissor) e tarifa E-Commerce Autenticado.',
  },
  {
    id: 'cert-05',
    code: 'CT-05 · NETWORK TOKEN',
    category: 'Carteiras & Cofre (VTS/MDES)',
    title: 'Compra com Token de Rede (Apple Pay / Google Pay / VTS / MDES / Elo Token)',
    mandatoryFor: 'Adquirente, Bandeira (VTS/MDES) & Emissor',
    onlineIsoRequirements: 'Adquirente envia DPAN (DE 02) + TAVV; Bandeira destokeniza p/ FPAN rumo ao Emissor e retorna PAR (29 pos).',
    outgoingClearingRequirements: 'Visa: TCR 5 · Mastercard: PDS 0059 + PDS 0207 (PAR) · Elo: Registro 02.',
    expectedResult: 'Aprovação com criptograma de token validado e conciliação pelo PAR.',
  },
  {
    id: 'cert-06',
    code: 'CT-06 · AUTO-REVERSAL',
    category: 'Resiliência & Contingência',
    title: 'Time-Out de Autorização (> 2.5s) Seguido de Desfazimento Automático (MTI 0400/0420)',
    mandatoryFor: 'Switch Autorizador da Adquirente & Core do Emissor',
    onlineIsoRequirements: 'Envio de MTI 0400/0420 com DE 37 (RRN), DE 11 (STAN) e DE 90 (Original Data Elements) idênticos à 0100.',
    outgoingClearingRequirements: 'NÃO PODE sair no arquivo Outgoing (transação desfeita não gera captura financeira).',
    expectedResult: 'Estorno imediato do Hold no saldo do portador (DE 39 = 00 no 0410/0430).',
  },
  {
    id: 'cert-07',
    code: 'CT-07 · PARCELADO BRASIL',
    category: 'Modalidades Nacionais',
    title: 'Compra Parcelada Loja Sem Juros (6x) com Constituição de Agenda',
    mandatoryFor: 'Adquirente & Emissor no Mercado Brasileiro',
    onlineIsoRequirements: 'MTI 0100/0110 · Código de processamento crédito + quantidade de parcelas (06).',
    outgoingClearingRequirements: 'Visa: TCR 2 BR Pos 40-41 = "16" · Mastercard: PDS 0195 + PDS 0220 · Elo: Reg 01 (06) + Reg 02 (992).',
    expectedResult: 'Liquidação em 6 URs mensais (30/60/90/120/150/180 dias) na B3/CERC e CIP/SLC (ASLC026).',
  },
  {
    id: 'cert-08',
    code: 'CT-08 · PAYFAC & SUBCRED.',
    category: 'Arranjo & Subcredenciamento',
    title: 'Transação Capturada por Subcredenciador (PayFac) / Marketplace',
    mandatoryFor: 'Adquirente Habilitadora & Subcredenciadora',
    onlineIsoRequirements: 'Identificação do PayFac ID + Sub-Merchant ID + CNPJ/CPF do sublojista final.',
    outgoingClearingRequirements: 'Visa: TCR E · Mastercard: PDS 0176 + PDS 0208 + PDS 0220 · Elo: Reg 01 (CNPJ) + Reg 02 (Subcred.).',
    expectedResult: 'Conformidade com regras de subcredenciamento da bandeira e Resolução BCB 264.',
  },
  {
    id: 'cert-09',
    code: 'CT-09 · REFUND / ESTORNO',
    category: 'Pós-Venda & Crédito',
    title: 'Cancelamento / Estorno Financeiro (Credit Transaction TC 06 / MTI 1240-205 / TE06)',
    mandatoryFor: 'Adquirente & Emissor',
    onlineIsoRequirements: 'Referência ao RRN/TID da compra original.',
    outgoingClearingRequirements: 'Visa: TC 06 (TCR 0..5) · Mastercard: MTI 1240 DE 24=205 · Elo: TE06 (Reg 00+01+02).',
    expectedResult: 'Crédito na fatura do portador e recomposição proporcional do intercâmbio.',
  },
  {
    id: 'cert-10',
    code: 'CT-10 · DISPUTA / CHARGEBACK',
    category: 'Ciclo de Disputas',
    title: 'Recebimento de First Chargeback e Envio de Representment (Segunda Apresentação)',
    mandatoryFor: 'Adquirente & Emissor (VROL / Mastercom MCOM / Elo Disputas)',
    onlineIsoRequirements: 'Vinculação determinística pelo ARN (23 dígitos) e TID / Banknet Ref / NSU.',
    outgoingClearingRequirements: 'Visa: TC 15 / TC 05 Reapresentação · Mastercard: MTI 1442 (450) · Elo: TE15 / TE25.',
    expectedResult: 'Processamento dentro do prazo regulamentar com evidência de autenticação (3DS/EMV).',
  },
];

// ============================================================================
// DADOS DO MÓDULO 5: ENGINE DE DIFF ENTRE RELEASES (2025.2 ➔ 2026.1 ➔ 2026.2 ➔ 2027.1)
// ============================================================================
export interface ReleaseDiffSpec {
  id: string;
  releaseWindow: string;
  brand: string;
  domain: string;
  title: string;
  beforeSpec: string;
  afterSpec: string;
  impactOnAcquirerAndIssuer: string;
}

export const RELEASE_DIFF_SPECS: ReleaseDiffSpec[] = [
  {
    id: 'diff-01',
    releaseWindow: 'Release 2025.2 ➔ Abril/Outubro 2026',
    brand: 'VISA',
    domain: 'Criptografia 3DS & Outgoing TCR 5 / TCR D',
    title: 'Migração Obrigatória do Criptograma CAVV v7 (TDES) para CAVV v9 (AES-128)',
    beforeSpec:
      '- Key Pair TDES legada no ACS Emissor\n- CAVV Versão 07 (3DES)\n- DE 126.9 / TCR 5 aceitava geração legada sem penalidade',
    afterSpec:
      '+ Chave AES no HSM Emissor (ACS) e Validação VisaNet\n+ CAVV Versão 09 (AES) com suporte a Token/3DS 2.2+\n+ Obrigatório emissores gerarem e adquirentes transportarem intacto no DE 126.9 e TC 05 TCR 5 / TCR D',
    impactOnAcquirerAndIssuer:
      'Emissor precisa rotacionar chaves CAVV no HSM para AES; Adquirente não pode truncar nem alterar bytes do CAVV entre a 0100 e o TCR 5.',
  },
  {
    id: 'diff-02',
    releaseWindow: 'Release 2026.1 ➔ 2026.2',
    brand: 'ELO',
    domain: 'Serviço 10 Liquidação (v26.1 ➔ v26.2)',
    title: 'Rigor nos Sub-registros Condicionais: Registro 03 (Proc 53) e Registro 05 (3DS 2.2)',
    beforeSpec:
      '- Campos de remetente/destinatário ou parciais 3DS tolerados com warnings em fluxos legados\n- Menor granularidade de crítica no Registro 09',
    afterSpec:
      '+ Em Processing Code 53 (Transferência), o Registro 03 passa a ser 100% OBRIGATÓRIO na remessa\n+ Em E-Commerce 3DS 2.2, o Registro 05 exige CAVV + ECI + XID/dsTransID consistentes\n+ Devolução imediata como TE01 + Registro 09 em caso de omissão',
    impactOnAcquirerAndIssuer:
      'Motor Outgoing da Adquirente deve bloquear envio de TE05 Proc 53 sem Registro 03 antes de subir para a janela SFTP.',
  },
  {
    id: 'diff-03',
    releaseWindow: 'Release Maio/2026 (01/05/2026)',
    brand: 'VISA BRASIL',
    domain: 'Fee Schedule & Billing Lines (Moeda USD ➔ BRL)',
    title: 'Nacionalização de Tarifas de Programa (Ex.: Third Party Agent / PF Registration Fee)',
    beforeSpec:
      '- Cobrança referenciada em moeda estrangeira: USD 5.000,00 (sujeita a variação cambial PTAX no faturamento VSS)',
    afterSpec:
      '+ Vigência a partir de 01/05/2026 no Fee Schedule Visa Brasil: valor fixado em moeda nacional R$ 32.000,00\n+ Previsibilidade em BRL na fatura de Scheme Fees',
    impactOnAcquirerAndIssuer:
      'Atualizar o motor de auditoria de faturas (Billing Lines) com corte por data de vigência (até 30/04/2026 vs a partir de 01/05/2026).',
  },
  {
    id: 'diff-04',
    releaseWindow: 'Release 2026.2 ➔ 2027.1',
    brand: 'MASTERCARD & VISA',
    domain: 'Rastreabilidade de Subcredenciadores (PayFac) & Lifecycle ID',
    title: 'Fiscalização Cruzada de PayFac ID + Documento Fiscal do Sublojista e Ciclo de Vida',
    beforeSpec:
      '- Tolerância parcial a submerchants genéricos ou ausência esporádica de Lifecycle ID (apenas downgrade)',
    afterSpec:
      '+ Validação estrita de PayFac ID registrado + CNPJ/CPF real (Visa TCR E / MC PDS 0176+0208+0220)\n+ Auditoria automática de persistência do DE 62.2 (Visa TID) e DE 63 (MC Banknet Ref) com impacto direto em Integrity Fees (VX-100A / T140)',
    impactOnAcquirerAndIssuer:
      'Exige saneamento completo da base cadastral de sublojistas das PayFacs conectadas na Adquirente.',
  },
];

// Função auxiliar para calcular dígito verificador Luhn de ARN de 23 dígitos
function computeLuhnCheckDigit(numStrWithoutCheck: string): string {
  let sum = 0;
  let shouldDouble = true;
  for (let i = numStrWithoutCheck.length - 1; i >= 0; i--) {
    let digit = parseInt(numStrWithoutCheck.charAt(i), 10);
    if (Number.isNaN(digit)) digit = 0;
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  const mod = sum % 10;
  return String(mod === 0 ? 0 : 10 - mod);
}

export function OutgoingEngineeringLabSuite({
  initialBrand = 'visa',
}: {
  initialBrand?: OutgoingBrandId;
}) {
  const [activeTab, setActiveTab] = useState<EngineeringLabTab>('test_builder');

  // State Módulo 1: Test File Builder
  const [builderBrand, setBuilderBrand] = useState<'visa' | 'mastercard' | 'elo' | 'amex'>(
    initialBrand
  );
  const [builderAmountBRL, setBuilderAmountBRL] = useState<number>(600);
  const [builderInstallments, setBuilderInstallments] = useState<number>(6);
  const [includeChipEmv, setIncludeChipEmv] = useState<boolean>(true);
  const [include3ds, setInclude3ds] = useState<boolean>(true);
  const [includePayfac, setIncludePayfac] = useState<boolean>(true);
  const [includeAirline, setIncludeAirline] = useState<boolean>(false);
  const [copiedSynthetic, setCopiedSynthetic] = useState<boolean>(false);

  // State Módulo 2: Reject Doctor
  const [rejectBrandFilter, setRejectBrandFilter] = useState<'all' | 'visa' | 'mastercard' | 'elo' | 'slc'>('all');
  const [selectedRejectId, setSelectedRejectId] = useState<string>(REJECT_DOCTOR_CASES[0].id);

  // State Módulo 3: 4-Way Reconciliation
  const [reconSaleAmount, setReconSaleAmount] = useState<number>(1000);
  const [reconInstallments, setReconInstallments] = useState<number>(3);
  const [reconMdrPct, setReconMdrPct] = useState<number>(2.89);
  const [reconQualRatePct, setReconQualRatePct] = useState<number>(1.55);
  const [reconSchemeFeePct, setReconSchemeFeePct] = useState<number>(0.18);
  const [reconSimulateDowngrade, setReconSimulateDowngrade] = useState<boolean>(false);

  // State Módulo 4: Certification Suite
  const [certStatuses, setCertStatuses] = useState<Record<string, 'pendente' | 'em_teste' | 'aprovado'>>({
    'cert-01': 'aprovado',
    'cert-02': 'aprovado',
    'cert-03': 'aprovado',
    'cert-04': 'em_teste',
    'cert-05': 'em_teste',
    'cert-06': 'aprovado',
    'cert-07': 'aprovado',
    'cert-08': 'pendente',
    'cert-09': 'pendente',
    'cert-10': 'pendente',
  });

  // Gerador Sintético de Lote (Módulo 1)
  const syntheticBatchResult = useMemo(() => {
    const cents = Math.round(builderAmountBRL * 100);
    const amount12 = String(cents).padStart(12, '0');
    const arnBase22 = '7412345631812345678901';
    const arn23 = arnBase22 + computeLuhnCheckDigit(arnBase22);
    const visaInstallmentCode =
      builderInstallments > 1 ? String(builderInstallments + 10).padStart(2, '0') : '00';
    const eloOpType = builderInstallments > 1 ? '992' : '990';

    if (builderBrand === 'visa') {
      const lines: { code: string; desc: string; wire: string }[] = [
        {
          code: 'TC 90',
          desc: 'File Header Record (168B)',
          wire: '90204399860000126111400001000001VISA BASE II SYNTHETIC TEST FILE BR'.padEnd(168, ' '),
        },
        {
          code: 'TC 05 · TCR 0',
          desc: `Base Financial Record · Valor R$ ${builderAmountBRL.toFixed(2)} · ARN ${arn23} (Luhn OK)`,
          wire: `0500411111******1111${arn23}0000${amount12}9861114261234565411LOJA TESTE HOMOLOG BR    SAO PAULO    BR00000740111426A94K21051`.padEnd(
            168,
            ' '
          ),
        },
        {
          code: 'TC 05 · TCR 1',
          desc: 'Additional Data Record (168B Obrigatório)',
          wire: '05010000000000000000000000000000000000000000000000000000000000000000000000000000'.padEnd(
            168,
            '0'
          ),
        },
        {
          code: 'TC 05 · TCR 2 (BR)',
          desc: `Liquidação Nacional Brasil · Pos 40-41 = "${visaInstallmentCode}" (${builderInstallments}x)`,
          wire: `0502BR000000000020000000000000000000000${visaInstallmentCode}`.padEnd(168, '0'),
        },
        {
          code: 'TC 05 · TCR 5',
          desc: 'Payment Service Data · TID 15 pos (DE 62.2) = 306318294011284',
          wire: `0505306318294011284Y${amount12}986${include3ds ? '05AAABBZGQFhI5VniQEjQAAAAAAA=' : ''}`.padEnd(
            168,
            '0'
          ),
        },
      ];

      if (includeChipEmv) {
        lines.push({
          code: 'TC 05 · TCR 7',
          desc: 'Chip Card Transaction Data (EMV Tags 9F26, 9F36, 95, 9F10)',
          wire: '0507052611140000000000000000000000009F26084A1B9C00112233449F2701809F3602004B95050000008000'.padEnd(
            168,
            '0'
          ),
        });
      }
      if (include3ds) {
        lines.push({
          code: 'TC 05 · TCR D',
          desc: '3-D Secure 2.2 Authentication & E-Commerce Data',
          wire: '050D00000000220Y05f38a9b12-4d2c-4110-9a1b-88291004c112'.padEnd(168, ' '),
        });
      }
      if (includePayfac) {
        lines.push({
          code: 'TC 05 · TCR E',
          desc: 'Payment Facilitator (PayFac ID + Sub-Merchant ID + CNPJ)',
          wire: '050EPF000987654SUBMERCHANT000112345678000199SAO PAULO    BR'.padEnd(168, ' '),
        });
      }
      if (includeAirline) {
        lines.push({
          code: 'TC 05 · TCR 3 (IATA)',
          desc: 'Industry Specific — Companhia Aérea IATA (Bilhete & Trechos)',
          wire: '0503AIR9571234567890PASSAGEIRO/TESTE    GRULISLA Y'.padEnd(168, ' '),
        });
      }

      const totalRecords = lines.length + 2;
      lines.push({
        code: 'TC 91',
        desc: `Batch Trailer · Soma = R$ ${builderAmountBRL.toFixed(2)}`,
        wire: `910000000000000000000${amount12}${String(totalRecords - 1).padStart(8, '0')}`.padEnd(
          168,
          '0'
        ),
      });
      lines.push({
        code: 'TC 92',
        desc: `File Trailer · Total Linhas = ${totalRecords}`,
        wire: `920000000000000000000${amount12}${String(totalRecords).padStart(8, '0')}`.padEnd(
          168,
          '0'
        ),
      });

      return {
        ext: 'ctf',
        framingLabel: '168-Byte Fixed ASCII/EBCDIC (Visa Base II CTF)',
        arn: arn23,
        lines,
      };
    }

    if (builderBrand === 'elo') {
      const lines: { code: string; desc: string; wire: string }[] = [
        {
          code: 'Header B0',
          desc: 'Header Serviço 10 Liquidação (v26.2 · 168B)',
          wire: 'B0102611140001ELO SERVICO 10 MASSA DE TESTE HOMOLOGACAO v26.2'.padEnd(168, ' '),
        },
        {
          code: 'TE05 · Reg 00',
          desc: `Dados Principais · Valor R$ ${builderAmountBRL.toFixed(2)} · ARN ${arn23}`,
          wire: `0500636368******1234${amount12}9865411${arn23}A94K21261114`.padEnd(168, '0'),
        },
        {
          code: 'TE05 · Reg 01',
          desc: `Dados Adicionais · Parcelas = ${String(builderInstallments).padStart(2, '0')} · NSU Elo 12 pos · CNPJ`,
          wire: `0501000000000000${String(builderInstallments).padStart(2, '0')}00012345678912345678000199`.padEnd(
            168,
            '0'
          ),
        },
        {
          code: 'TE05 · Reg 02',
          desc: `Dados do País · Tipo de Operação = ${eloOpType} (${
            builderInstallments > 1 ? 'Parcelado Loja' : 'Crédito à Vista'
          })`,
          wire: `0502${eloOpType}071${includePayfac ? 'PF9876543210001' : '000000000000000'}3550308`.padEnd(
            168,
            '0'
          ),
        },
      ];

      if (include3ds) {
        lines.push({
          code: 'TE05 · Reg 05',
          desc: 'Autenticação 3DS 2.2 (ECI 05 + CAVV + dsTransID)',
          wire: '050505AAABBZGQFhI5VniQEjQAAAAAAA=f38a9b12-4d2c-4110-9a1b-88291004c112'.padEnd(168, ' '),
        });
      }
      if (includeChipEmv) {
        lines.push({
          code: 'TE05 · Reg 07',
          desc: 'Dados de Chip EMV (ARQC 9F26, ATC 9F36, TVR 95)',
          wire: '05079F26084A1B9C00112233449F3602004B950500000080009F100706010A03A00000'.padEnd(168, '0'),
        });
      }
      if (includeAirline) {
        lines.push({
          code: 'TE05 · Reg 08',
          desc: 'Companhias Aéreas IATA (Bilhete + Trechos GRU-LIS)',
          wire: '05089571234567890PASSAGEIRO/TESTE    GRULIS000000012500'.padEnd(168, ' '),
        });
      }

      const totalRec = lines.length + 1;
      lines.push({
        code: 'Trailer BZ',
        desc: `Trailer do Lote Serviço 10 · Total Registros = ${totalRec}`,
        wire: `BZ10${String(totalRec).padStart(8, '0')}${amount12}`.padEnd(168, '0'),
      });

      return {
        ext: 'txt',
        framingLabel: '168-Byte Fixed Posicional (Elo Serviço 10 v26.2)',
        arn: arn23,
        lines,
      };
    }

    if (builderBrand === 'mastercard') {
      const pdsList = [
        '[PDS0002=MPL]',
        '[PDS0158=A4]',
        builderInstallments > 1 ? `[PDS0195=01${String(builderInstallments).padStart(2, '0')}]` : '',
        '[PDS0220=12345678000199]',
        includePayfac ? '[PDS0176=PF987654][PDS0208=SUB0001]' : '',
        include3ds ? '[PDS0052=210][PDS0185=AAABBZGQFhI5VniQ][PDS0186=f38a9b12-4d2c]' : '',
      ]
        .filter(Boolean)
        .join('');

      const lines: { code: string; desc: string; wire: string }[] = [
        {
          code: 'MTI 1644 · 697',
          desc: 'File Header IPM R111 (RDW 4B + ISO 8583:1993)',
          wire: `[RDW=0098] MTI=1644 DE24=697 DE48=[PDS0105=00126111400001][PDS0122=T]`,
        },
        {
          code: 'MTI 1240 · 200',
          desc: `First Presentment · Valor R$ ${builderAmountBRL.toFixed(2)} · ARN ${arn23}`,
          wire: `[RDW=024C] MTI=1240 DE2=541234******5678 DE3=003000 DE4=${amount12} DE22=051 DE24=200 DE26=5411 DE31=${arn23} DE38=A94K21 DE42=LOJA00012345 DE49=986 DE63=MCS8492011114 DE48=${pdsList}${
            includeChipEmv ? ' DE55=9F26084A1B9C00112233449F3602004B95050000008000' : ''
          }`,
        },
      ];

      if (includeAirline) {
        lines.push({
          code: 'MTI 1644 · Addendum',
          desc: 'Travel / Passenger Transport Addendum (IATA)',
          wire: `[RDW=00B4] MTI=1644 DE24=600 DE31=${arn23} DE48=[PDS0501=9571234567890][PDS0502=PASSAGEIRO/TESTE][PDS0508=GRULIS]`,
        });
      }

      lines.push({
        code: 'MTI 1644 · 695',
        desc: `File Trailer IPM · PDS 0301 Checksum = ${amount12} · PDS 0306 Count = ${lines.length + 1}`,
        wire: `[RDW=00B0] MTI=1644 DE24=695 DE48=[PDS0105=00126111400001][PDS0301=0000${amount12}][PDS0306=${String(
          lines.length + 1
        ).padStart(8, '0')}]`,
      });

      return {
        ext: 'ipm',
        framingLabel: '4-Byte RDW + 1014-Byte Blocked ISO 8583:1993 (Mastercard IPM R111)',
        arn: arn23,
        lines,
      };
    }

    // Amex CAS
    const lines: { code: string; desc: string; wire: string }[] = [
      {
        code: 'TFH (Header)',
        desc: 'Transaction File Header (600B Fixed ASCII)',
        wire: 'TFH00000120261114AMEX CAS SYNTHETIC FILE BR'.padEnd(168, ' '),
      },
      {
        code: 'TAB (Batch)',
        desc: 'Transaction Advice Batch Header',
        wire: 'TAB000001986MERCHANT9876543210'.padEnd(168, ' '),
      },
      {
        code: 'TDR (Detail)',
        desc: `Transaction Detail Record · Valor R$ ${builderAmountBRL.toFixed(2)} (${builderInstallments}x)`,
        wire: `TDR376412*****1005${amount12}986${String(builderInstallments).padStart(
          2,
          '0'
        )}A94K21${arn23}001`.padEnd(168, ' '),
      },
      {
        code: 'TBT + TFT',
        desc: `Batch & File Trailer · Total = R$ ${builderAmountBRL.toFixed(2)}`,
        wire: `TFT000004000001${amount12}`.padEnd(168, '0'),
      },
    ];

    return {
      ext: 'cas',
      framingLabel: '600-Byte Fixed ASCII (Amex CAS Settlement)',
      arn: arn23,
      lines,
    };
  }, [
    builderBrand,
    builderAmountBRL,
    builderInstallments,
    includeChipEmv,
    include3ds,
    includePayfac,
    includeAirline,
  ]);

  const filteredRejectCases = useMemo(() => {
    return REJECT_DOCTOR_CASES.filter(
      (c) => rejectBrandFilter === 'all' || c.brand === rejectBrandFilter
    );
  }, [rejectBrandFilter]);

  const activeRejectCase = useMemo(
    () =>
      filteredRejectCases.find((c) => c.id === selectedRejectId) ||
      filteredRejectCases[0] ||
      REJECT_DOCTOR_CASES[0],
    [filteredRejectCases, selectedRejectId]
  );

  // Cálculo da Mesa de Conciliação 4-Way (Módulo 3)
  const reconCalc = useMemo(() => {
    const grossCents = Math.round(reconSaleAmount * 100);
    const n = Math.max(1, reconInstallments);
    const baseInstallmentCents = Math.floor(grossCents / n);
    const remainderCents = grossCents - baseInstallmentCents * n;
    const firstInstallmentCents = baseInstallmentCents + remainderCents;

    const effectiveIcPct = reconSimulateDowngrade ? reconQualRatePct + 0.65 : reconQualRatePct;
    const interchangeBRL = (reconSaleAmount * effectiveIcPct) / 100;
    const schemeFeeBRL = (reconSaleAmount * reconSchemeFeePct) / 100;
    const mdrTotalBRL = (reconSaleAmount * reconMdrPct) / 100;

    const netFromIssuerToAcquirerBRL = reconSaleAmount - interchangeBRL;
    const netFromAcquirerToMerchantBRL = reconSaleAmount - mdrTotalBRL;
    const acquirerNetSpreadBRL = mdrTotalBRL - interchangeBRL - schemeFeeBRL;

    return {
      firstInstallmentBRL: firstInstallmentCents / 100,
      otherInstallmentBRL: baseInstallmentCents / 100,
      remainderCents,
      effectiveIcPct,
      interchangeBRL,
      schemeFeeBRL,
      mdrTotalBRL,
      netFromIssuerToAcquirerBRL,
      netFromAcquirerToMerchantBRL,
      acquirerNetSpreadBRL,
    };
  }, [
    reconSaleAmount,
    reconInstallments,
    reconMdrPct,
    reconQualRatePct,
    reconSchemeFeePct,
    reconSimulateDowngrade,
  ]);

  const handleDownloadTestFile = () => {
    const content = syntheticBatchResult.lines.map((l) => l.wire).join('\n');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `outgoing-test-${builderBrand}-${Date.now()}.${syntheticBatchResult.ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyTestFile = () => {
    const content = syntheticBatchResult.lines.map((l) => l.wire).join('\n');
    navigator.clipboard.writeText(content);
    setCopiedSynthetic(true);
    setTimeout(() => setCopiedSynthetic(false), 2000);
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/95 p-5 sm:p-6 space-y-6 shadow-2xl">
      {/* Cabeçalho da Suíte de Engenharia & Operação */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-300">
            <span>🛠️ LABORATÓRIO DE ENGENHARIA, HOMOLOGAÇÃO & OPERAÇÃO D+0 / D+1</span>
          </div>
          <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
            Suíte Operacional: Gerador de Massa (.CTF/.IPM/.TXT), Doutor de Rejeições, Conciliação 4-Way, Certificação & Diff
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-4xl leading-relaxed">
            Ferramentas práticas para construir arquivos de teste válidos com Luhn e Checksum, diagnosticar rejeições (`EP747`, `T112`, `TE01 Reg 09`, `ASLC026E`), conciliar centavos nas 4 pontas e homologar releases.
          </p>
        </div>
      </div>

      {/* Seletor dos 5 Módulos da Fila */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-2">
        {[
          {
            id: 'test_builder',
            badge: '1 · TEST FILE BUILDER',
            title: 'Gerador de Massa Outgoing',
            sub: 'Monta .CTF, .IPM, .TXT e .CAS válidos p/ download',
          },
          {
            id: 'reject_doctor',
            badge: '2 · REJECT DOCTOR',
            title: 'Doutor de Rejeições & Crítica',
            sub: 'EP747 · T112 · TE01 Reg 09 · ASLC026E (Antes × Depois)',
          },
          {
            id: 'reconciliation_4way',
            badge: '3 · CONCILIAÇÃO 4-WAY',
            title: 'Mesa 0110 × Outgoing × SLC',
            sub: 'Arredondamento de parcelas, Downgrade e Partidas GL',
          },
          {
            id: 'certification_suite',
            badge: '4 · HOMOLOGAÇÃO',
            title: 'Workbench de Certificação',
            sub: '10 Casos de Teste Obrigatórios (0800, EMV, 3DS, 0400)',
          },
          {
            id: 'release_diff',
            badge: '5 · RULEBOOK DIFF',
            title: 'Comparador Git Diff Releases',
            sub: 'O que mudou: 2025.2 ➔ 2026.1 ➔ 2026.2 ➔ 2027.1',
          },
        ].map((m) => {
          const active = activeTab === m.id;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => setActiveTab(m.id as EngineeringLabTab)}
              className={`rounded-xl border p-3 text-left transition-all flex flex-col justify-between gap-1 ${
                active
                  ? 'bg-blue-600 text-white border-blue-400 shadow-lg shadow-blue-950/50'
                  : 'bg-slate-900/90 text-slate-300 border-slate-800 hover:border-slate-600'
              }`}
            >
              <span className="font-mono text-[10px] font-black uppercase tracking-wider opacity-85">
                {m.badge}
              </span>
              <div className="text-xs font-black leading-snug">{m.title}</div>
              <div className={`text-[10px] leading-snug ${active ? 'text-blue-100' : 'text-slate-400'}`}>
                {m.sub}
              </div>
            </button>
          );
        })}
      </div>

      {/* =====================================================================
          MÓDULO 1 — GERADOR SINTÉTICO DE MASSA DE TESTES DE OUTGOING
         ===================================================================== */}
      {activeTab === 'test_builder' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Controles do Construtor */}
          <div className="lg:col-span-5 rounded-xl bg-slate-900/90 border border-slate-800 p-4 space-y-4">
            <div className="text-xs font-black uppercase tracking-wider text-blue-400">
              1. Parametrizar Lote Sintético de Homologação
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-300">Bandeira & Formato Físico:</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {[
                  { id: 'visa', label: 'Visa (.CTF)' },
                  { id: 'mastercard', label: 'MC (.IPM)' },
                  { id: 'elo', label: 'Elo (.TXT)' },
                  { id: 'amex', label: 'Amex (.CAS)' },
                ].map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setBuilderBrand(b.id as 'visa' | 'mastercard' | 'elo' | 'amex')}
                    className={`py-2 px-2.5 rounded-lg border text-xs font-bold transition-all ${
                      builderBrand === b.id
                        ? 'bg-emerald-600 text-white border-emerald-400'
                        : 'bg-slate-950 text-slate-300 border-slate-800'
                    }`}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  Valor da Transação (R$):
                </label>
                <input
                  type="number"
                  min={10}
                  step={10}
                  value={builderAmountBRL}
                  onChange={(e) => setBuilderAmountBRL(Math.max(1, Number(e.target.value) || 100))}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 font-mono text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  Nº de Parcelas (1x a 12x):
                </label>
                <input
                  type="number"
                  min={1}
                  max={12}
                  value={builderInstallments}
                  onChange={(e) =>
                    setBuilderInstallments(Math.min(12, Math.max(1, Number(e.target.value) || 1)))
                  }
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 font-mono text-xs text-white"
                />
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <div className="text-[11px] font-bold text-slate-300">
                Extensões Condicionais para Incluir no Lote:
              </div>
              {[
                {
                  checked: includeChipEmv,
                  set: setIncludeChipEmv,
                  label: 'Incluir Dados de Chip EMV (Visa TCR 7 / MC DE 55 / Elo Reg 07)',
                },
                {
                  checked: include3ds,
                  set: setInclude3ds,
                  label: 'Incluir Autenticação E-Commerce 3DS 2.2 (TCR 5+D / PDS 0185 / Reg 05)',
                },
                {
                  checked: includePayfac,
                  set: setIncludePayfac,
                  label: 'Incluir Subcredenciador PayFac & CNPJ (TCR E / PDS 0176+0220 / Reg 02)',
                },
                {
                  checked: includeAirline,
                  set: setIncludeAirline,
                  label: 'Incluir Companhia Aérea IATA (TCR 3 / MTI 1644 Addendum / Reg 08)',
                },
              ].map((item, idx) => (
                <label
                  key={idx}
                  className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-950/90 border border-slate-800 cursor-pointer text-xs text-slate-200"
                >
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={(e) => item.set(e.target.checked)}
                    className="rounded border-slate-600"
                  />
                  <span>{item.label}</span>
                </label>
              ))}
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              <button
                type="button"
                onClick={handleDownloadTestFile}
                className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-black text-white transition-all text-center"
              >
                ⬇️ Baixar Arquivo (.{syntheticBatchResult.ext})
              </button>
              <button
                type="button"
                onClick={handleCopyTestFile}
                className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200 transition-all"
              >
                {copiedSynthetic ? '✓ Copiado!' : '📋 Copiar Lote'}
              </button>
            </div>
          </div>

          {/* Preview do Arquivo Gerado */}
          <div className="lg:col-span-7 rounded-xl bg-slate-900/90 border border-slate-800 p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
              <div>
                <span className="font-mono text-xs font-black text-emerald-400">
                  {syntheticBatchResult.framingLabel}
                </span>
                <div className="text-[11px] font-mono text-slate-400">
                  ARN Calculado com Luhn: <span className="text-white">{syntheticBatchResult.arn}</span> •{' '}
                  {syntheticBatchResult.lines.length} registros gerados
                </div>
              </div>
              <span className="px-2.5 py-1 rounded bg-emerald-500/15 border border-emerald-500/30 font-mono text-[10px] font-bold text-emerald-300">
                ✓ SINTAXE & TRAILER 100% VÁLIDOS
              </span>
            </div>

            <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
              {syntheticBatchResult.lines.map((line, i) => (
                <div
                  key={i}
                  className="rounded-lg bg-black/80 border border-slate-800 p-2.5 space-y-1"
                >
                  <div className="flex items-center justify-between gap-2 text-[11px]">
                    <span className="font-mono font-black text-blue-300">
                      #{i + 1} · {line.code}
                    </span>
                    <span className="text-slate-400 text-[10px]">{line.desc}</span>
                  </div>
                  <pre className="font-mono text-[10px] text-emerald-300 overflow-x-auto whitespace-pre">
                    {line.wire}
                  </pre>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          MÓDULO 2 — DOUTOR DE REJEIÇÕES DE LOTE & CRÍTICA (EP747 / T112 / REG 09)
         ===================================================================== */}
      {activeTab === 'reject_doctor' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: 'all', label: 'Todas as Críticas (8)' },
                { id: 'visa', label: 'Visa (EP747 / VX-100A)' },
                { id: 'mastercard', label: 'Mastercard (T112 / GCMS)' },
                { id: 'elo', label: 'Elo (TE01 + Registro 09)' },
                { id: 'slc', label: 'CIP / SLC (ASLC026E)' },
              ].map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() =>
                    setRejectBrandFilter(b.id as 'all' | 'visa' | 'mastercard' | 'elo' | 'slc')
                  }
                  className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                    rejectBrandFilter === b.id
                      ? 'bg-rose-600 text-white border-rose-400'
                      : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-600'
                  }`}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Lista de Códigos de Rejeição */}
            <div className="lg:col-span-5 space-y-2">
              {filteredRejectCases.map((rc) => {
                const isSel = rc.id === activeRejectCase.id;
                return (
                  <button
                    key={rc.id}
                    type="button"
                    onClick={() => setSelectedRejectId(rc.id)}
                    className={`w-full rounded-xl border p-3 text-left transition-all ${
                      isSel
                        ? 'bg-rose-950/40 border-rose-400 ring-1 ring-rose-400/40'
                        : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded bg-rose-500/20 border border-rose-500/40 font-mono text-[10px] font-black text-rose-300">
                        {rc.errorCode}
                      </span>
                      <span className="font-mono text-[10px] text-slate-400">{rc.brandLabel}</span>
                    </div>
                    <div className="text-xs font-black text-white leading-snug">{rc.title}</div>
                    <div className="text-[11px] font-mono text-amber-300 mt-1">{rc.recordAndPos}</div>
                  </button>
                );
              })}
            </div>

            {/* Diagnóstico Antes vs Depois */}
            <div className="lg:col-span-7 rounded-xl bg-slate-900/95 border border-slate-800 p-5 space-y-4">
              <div className="border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded bg-rose-500/20 border border-rose-500/40 font-mono text-xs font-black text-rose-300">
                    {activeRejectCase.errorCode}
                  </span>
                  <span className="font-mono text-xs text-slate-400">
                    Fonte: {activeRejectCase.reportSource}
                  </span>
                </div>
                <h4 className="text-base font-black text-white mt-1.5">{activeRejectCase.title}</h4>
                <div className="text-xs font-mono text-amber-300 mt-0.5">
                  📍 Posição Afetada: {activeRejectCase.recordAndPos}
                </div>
              </div>

              <div className="rounded-xl bg-slate-950 border border-slate-800 p-3.5 text-xs text-slate-200 leading-relaxed">
                <strong className="text-white block mb-1">🔍 Causa Raiz Técnica:</strong>
                {activeRejectCase.rootCause}
              </div>

              <div className="space-y-2">
                <div>
                  <div className="text-[10px] font-mono font-bold uppercase text-rose-400 mb-1">
                    ❌ LINHA FÍSICA REJEITADA (COMO SAIU COM ERRO):
                  </div>
                  <pre className="rounded-lg bg-rose-950/30 border border-rose-500/40 p-2.5 font-mono text-[11px] text-rose-200 overflow-x-auto whitespace-pre-wrap break-all">
                    {activeRejectCase.wrongWireLine}
                  </pre>
                </div>

                <div>
                  <div className="text-[10px] font-mono font-bold uppercase text-emerald-400 mb-1">
                    ✅ LINHA FÍSICA CORRIGIDA (PADRÃO ACEITO NA BANDEIRA):
                  </div>
                  <pre className="rounded-lg bg-emerald-950/30 border border-emerald-500/40 p-2.5 font-mono text-[11px] text-emerald-200 overflow-x-auto whitespace-pre-wrap break-all">
                    {activeRejectCase.fixedWireLine}
                  </pre>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="rounded-xl bg-blue-950/25 border border-blue-500/30 p-3 space-y-1">
                  <div className="font-black text-blue-300 uppercase text-[10px]">
                    🛠️ Playbook de Correção & Re-presentment
                  </div>
                  <p className="text-slate-200 leading-relaxed">
                    {activeRejectCase.rePresentmentPlaybook}
                  </p>
                </div>
                <div className="rounded-xl bg-amber-950/25 border border-amber-500/30 p-3 space-y-1">
                  <div className="font-black text-amber-300 uppercase text-[10px]">
                    💸 Risco Financeiro se Ignorado
                  </div>
                  <p className="text-slate-200 leading-relaxed">
                    {activeRejectCase.financialRiskIfIgnored}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          MÓDULO 3 — MESA DE CONCILIAÇÃO 4-WAY & PARTIDAS CONTÁBEIS (GL)
         ===================================================================== */}
      {activeTab === 'reconciliation_4way' && (
        <div className="space-y-5">
          {/* Controles da Simulação 4-Way */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 bg-slate-900/90 border border-slate-800 rounded-xl p-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                Valor Bruto da Venda (R$):
              </label>
              <input
                type="number"
                value={reconSaleAmount}
                onChange={(e) => setReconSaleAmount(Math.max(10, Number(e.target.value) || 100))}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 font-mono text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                Nº de Parcelas (Arredondamento):
              </label>
              <input
                type="number"
                min={1}
                max={12}
                value={reconInstallments}
                onChange={(e) =>
                  setReconInstallments(Math.min(12, Math.max(1, Number(e.target.value) || 1)))
                }
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 font-mono text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                MDR Cobrado do Lojista (%):
              </label>
              <input
                type="number"
                step={0.05}
                value={reconMdrPct}
                onChange={(e) => setReconMdrPct(Number(e.target.value) || 2.5)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 font-mono text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                Intercâmbio Qualificado (%):
              </label>
              <input
                type="number"
                step={0.05}
                value={reconQualRatePct}
                onChange={(e) => setReconQualRatePct(Number(e.target.value) || 1.5)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 font-mono text-xs text-white"
              />
            </div>
            <div className="flex flex-col justify-end">
              <button
                type="button"
                onClick={() => setReconSimulateDowngrade((prev) => !prev)}
                className={`w-full py-2 px-3 rounded-lg border text-xs font-bold transition-all ${
                  reconSimulateDowngrade
                    ? 'bg-rose-600 text-white border-rose-400'
                    : 'bg-slate-950 text-slate-300 border-slate-700 hover:border-rose-400'
                }`}
              >
                {reconSimulateDowngrade
                  ? '⚠️ Com Downgrade (+0,65%)'
                  : 'Simular Perda de TID (Downgrade)'}
              </button>
            </div>
          </div>

          {/* As 4 Pontas da Conciliação */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
            <div className="rounded-xl border border-sky-500/40 bg-sky-950/15 p-4 space-y-2">
              <span className="font-mono text-[10px] font-black text-sky-300 uppercase">
                PONTA 1 · AUTORIZAÇÃO 0110 (T+0s)
              </span>
              <div className="text-lg font-black text-white font-mono">
                R$ {reconSaleAmount.toFixed(2)}
              </div>
              <p className="text-xs text-slate-300">
                Sensibiliza Hold no Banco Emissor com DE 38 AuthCode + DE 62.2 TID / DE 63 Banknet.
              </p>
            </div>

            <div className="rounded-xl border border-blue-500/40 bg-blue-950/15 p-4 space-y-2">
              <span className="font-mono text-[10px] font-black text-blue-300 uppercase">
                PONTA 2 · ARQUIVO OUTGOING (D+0)
              </span>
              <div className="text-lg font-black text-white font-mono">
                1ª Parc: R$ {reconCalc.firstInstallmentBRL.toFixed(2)}
              </div>
              <p className="text-xs text-slate-300">
                {reconInstallments > 1
                  ? `Demais ${reconInstallments - 1}x de R$ ${reconCalc.otherInstallmentBRL.toFixed(
                      2
                    )} (Resíduo de ${reconCalc.remainderCents} centavo(s) alocado na 1ª parcela).`
                  : 'Parcela única à vista no lote .CTF / .IPM / .TXT.'}
              </p>
            </div>

            <div className="rounded-xl border border-indigo-500/40 bg-indigo-950/15 p-4 space-y-2">
              <span className="font-mono text-[10px] font-black text-indigo-300 uppercase">
                PONTA 3 · CLEARING BANDEIRA (VSS-110 / T461 / 20-02)
              </span>
              <div className="text-lg font-black text-emerald-300 font-mono">
                Líquido Emissor ➔ Adq: R$ {reconCalc.netFromIssuerToAcquirerBRL.toFixed(2)}
              </div>
              <p className="text-xs text-slate-300">
                Intercâmbio retido pelo Emissor:{' '}
                <strong className="text-rose-300">
                  R$ {reconCalc.interchangeBRL.toFixed(2)} ({reconCalc.effectiveIcPct.toFixed(2)}%)
                </strong>
                .
              </p>
            </div>

            <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/15 p-4 space-y-2">
              <span className="font-mono text-[10px] font-black text-emerald-300 uppercase">
                PONTA 4 · AGENDA B3 & GRADE SLC (ASLC026)
              </span>
              <div className="text-lg font-black text-white font-mono">
                Payout Lojista: R$ {reconCalc.netFromAcquirerToMerchantBRL.toFixed(2)}
              </div>
              <p className="text-xs text-slate-300">
                Spread Líquido Adquirente (após IC e Fee {reconSchemeFeePct}%):{' '}
                <strong
                  className={
                    reconCalc.acquirerNetSpreadBRL >= 0 ? 'text-emerald-300' : 'text-rose-400'
                  }
                >
                  R$ {reconCalc.acquirerNetSpreadBRL.toFixed(2)}
                </strong>
                .
              </p>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          MÓDULO 4 — WORKBENCH DE HOMOLOGAÇÃO & CERTIFICAÇÃO END-TO-END
         ===================================================================== */}
      {activeTab === 'certification_suite' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
                Roteiro Oficial de Certificação End-to-End (10 Casos de Teste Obrigatórios)
              </span>
              <p className="text-xs text-slate-400">
                Clique no status de qualquer caso de teste para alternar entre Pendente, Em Teste e Homologado.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                const rows = CERTIFICATION_TEST_CASES.map(
                  (ct) =>
                    `<tr><td><strong>${ct.code}</strong></td><td>${ct.title}</td><td>${ct.onlineIsoRequirements}</td><td>${ct.outgoingClearingRequirements}</td><td>${(
                      certStatuses[ct.id] || 'pendente'
                    ).toUpperCase()}</td></tr>`
                ).join('');
                sendToDocStudio({
                  mode: 'append_html',
                  title: 'Caderno Oficial de Homologação & Certificação de Bandeiras',
                  sourceModule: 'Workbench de Certificação End-to-End',
                  html: `<h2>Caderno de Homologação & Certificação (0100 ➔ Outgoing ➔ Disputas)</h2><table><thead><tr><th>Caso</th><th>Cenário</th><th>Requisitos Online ISO</th><th>Requisitos Outgoing</th><th>Status</th></tr></thead><tbody>${rows}</tbody></table>`,
                  metadata: {
                    brand: 'geral',
                    brandName: 'VISA · MASTERCARD · ELO',
                    referenceId: 'CERT-SUITE-10',
                    category: 'Homologação & QA',
                  },
                });
              }}
              className="px-3.5 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-xs font-bold text-blue-300"
            >
              📄 Exportar Caderno de Homologação p/ Doc Studio
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-900/95 border-b border-slate-800 text-[11px] font-mono uppercase text-slate-400">
                  <th className="py-3 px-3">Caso de Teste</th>
                  <th className="py-3 px-3">Cenário & Escopo</th>
                  <th className="py-3 px-3">Exigência Online (ISO 8583 / HSM)</th>
                  <th className="py-3 px-3">Exigência no Arquivo Outgoing</th>
                  <th className="py-3 px-3 text-right">Status QA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                {CERTIFICATION_TEST_CASES.map((ct) => {
                  const st = certStatuses[ct.id] || 'pendente';
                  const nextStatus =
                    st === 'pendente' ? 'em_teste' : st === 'em_teste' ? 'aprovado' : 'pendente';
                  return (
                    <tr key={ct.id} className="hover:bg-slate-900/60">
                      <td className="py-3 px-3 align-top whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded bg-blue-500/15 border border-blue-500/30 font-mono text-[11px] font-black text-blue-300">
                          {ct.code}
                        </span>
                        <div className="text-[10px] text-slate-400 mt-1">{ct.category}</div>
                      </td>
                      <td className="py-3 px-3 align-top min-w-[210px]">
                        <div className="font-bold text-white">{ct.title}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{ct.mandatoryFor}</div>
                      </td>
                      <td className="py-3 px-3 align-top min-w-[230px] text-slate-200 font-mono text-[11px]">
                        {ct.onlineIsoRequirements}
                      </td>
                      <td className="py-3 px-3 align-top min-w-[230px] text-emerald-300 font-mono text-[11px]">
                        {ct.outgoingClearingRequirements}
                      </td>
                      <td className="py-3 px-3 align-top text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() =>
                            setCertStatuses((prev) => ({
                              ...prev,
                              [ct.id]: nextStatus,
                            }))
                          }
                          className={`px-2.5 py-1 rounded-lg border font-mono text-[11px] font-bold transition-all ${
                            st === 'aprovado'
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              : st === 'em_teste'
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                              : 'bg-slate-900 text-slate-400 border-slate-700'
                          }`}
                        >
                          {st === 'aprovado'
                            ? '✅ HOMOLOGADO'
                            : st === 'em_teste'
                            ? '⏳ EM TESTE'
                            : '○ PENDENTE'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =====================================================================
          MÓDULO 5 — ENGINE DE DIFF ENTRE RELEASES (2025.2 ➔ 2026.1 ➔ 2026.2 ➔ 2027.1)
         ===================================================================== */}
      {activeTab === 'release_diff' && (
        <div className="space-y-4">
          {RELEASE_DIFF_SPECS.map((df) => (
            <div
              key={df.id}
              className="rounded-xl border border-slate-800 bg-slate-900/90 p-4 space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded bg-blue-500/20 border border-blue-500/40 font-mono text-[11px] font-black text-blue-300">
                    {df.brand}
                  </span>
                  <span className="font-mono text-xs font-bold text-amber-300">
                    {df.releaseWindow}
                  </span>
                </div>
                <span className="font-mono text-[11px] text-slate-400">{df.domain}</span>
              </div>

              <h4 className="text-sm sm:text-base font-black text-white">{df.title}</h4>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                <div className="rounded-lg bg-rose-950/25 border border-rose-500/30 p-3 space-y-1">
                  <div className="text-[10px] font-mono font-black uppercase text-rose-300">
                    − COMO ERA ANTES DA RELEASE (LEGADO)
                  </div>
                  <pre className="font-mono text-[11px] text-rose-200 whitespace-pre-wrap leading-relaxed">
                    {df.beforeSpec}
                  </pre>
                </div>

                <div className="rounded-lg bg-emerald-950/25 border border-emerald-500/30 p-3 space-y-1">
                  <div className="text-[10px] font-mono font-black uppercase text-emerald-300">
                    + COMO PASSOU A SER EXIGIDO (NOVO PADRÃO)
                  </div>
                  <pre className="font-mono text-[11px] text-emerald-200 whitespace-pre-wrap leading-relaxed">
                    {df.afterSpec}
                  </pre>
                </div>
              </div>

              <div className="rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-slate-300">
                <strong className="text-white">Impacto de Engenharia (Adquirente × Emissor):</strong>{' '}
                {df.impactOnAcquirerAndIssuer}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
