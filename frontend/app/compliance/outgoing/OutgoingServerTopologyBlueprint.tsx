'use client';

import React, { useMemo, useState } from 'react';
import { OutgoingBrandId } from '@/data/outgoing-tables-flows';
import { sendToDocStudio } from '@/lib/docStudioBridge';

export type TopologyBrandFilter = 'all' | 'visa' | 'mastercard' | 'elo' | 'amex';
export type TopologyPhaseFilter = 'all' | 'online' | 'clearing' | 'settlement';
export type TopologyZoomLevel = 'c1_actors' | 'c2_servers' | 'c3_cables' | 'c4_failures';

export interface ServerNodeSpec {
  id: string;
  code: string;
  name: string;
  zoneId: 'z1_capture' | 'z2_acquirer' | 'z3_brand_edge' | 'z4_issuer' | 'z5_national_settlement';
  zoneLabel: string;
  phase: 'online' | 'clearing' | 'settlement' | 'both';
  brands: ('visa' | 'mastercard' | 'elo' | 'amex')[];
  vendorOrStandard: string;
  protocolSummary: string;
  portAndFraming: string;
  cryptoAndHsm: string;
  roleDescription: string;
  inboundData: string[];
  outboundData: string[];
  relatedOutgoingTables: { brand: OutgoingBrandId; tableId: string; label: string }[];
  slaAndLatency: string;
  failureModeAndRecovery: string;
  auditReportsAndLogs: string[];
}

export interface CableLinkSpec {
  id: string;
  code: string;
  fromServerId: string;
  fromLabel: string;
  toServerId: string;
  toLabel: string;
  phase: 'online' | 'clearing' | 'settlement';
  brands: ('visa' | 'mastercard' | 'elo' | 'amex')[];
  transportProtocol: string;
  portOrChannel: string;
  wireFraming: string;
  cryptoProtection: string;
  payloadsCarried: string[];
  timeoutOrSchedule: string;
  onFailureBehavior: string;
}

export interface FailureScenarioSpec {
  id: string;
  code: string;
  title: string;
  phase: 'online' | 'clearing' | 'settlement';
  severity: 'CRÍTICO' | 'ALTO' | 'FINANCEIRO';
  triggerPoint: string;
  affectedServers: string[];
  stepByStepReaction: string[];
  financialAndComplianceImpact: string;
  howToDetectInReports: string;
  howToPrevent: string;
}

export const TOPOLOGY_ZONES: {
  id: ServerNodeSpec['zoneId'];
  number: string;
  title: string;
  subtitle: string;
  pciScope: string;
  accentBorder: string;
  accentBg: string;
  accentBadge: string;
}[] = [
  {
    id: 'z1_capture',
    number: 'ZONA 1',
    title: 'Captura, Checkout & Borda do Lojista',
    subtitle: 'Terminais POS, SoftPOS (Tap on Phone), E-Commerce e 3DS Server (MPI)',
    pciScope: 'PCI-DSS P2PE / MPoC / TLS 1.3 Edge',
    accentBorder: 'border-sky-500/40',
    accentBg: 'bg-sky-950/15',
    accentBadge: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
  },
  {
    id: 'z2_acquirer',
    number: 'ZONA 2',
    title: 'Core da Adquirente / Processadora (PayFac & Host)',
    subtitle: 'API Gateway, Switch Autorizador ISO 8583, HSM Thales, Ledger, Motor Outgoing e Conciliação',
    pciScope: 'PCI-DSS CDE (Cardholder Data Environment)',
    accentBorder: 'border-blue-500/40',
    accentBg: 'bg-blue-950/15',
    accentBadge: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  },
  {
    id: 'z3_brand_edge',
    number: 'ZONA 3',
    title: 'Appliances de Borda & Malha das 4 Bandeiras',
    subtitle: 'Visa EAS & DEX/EP747 · Mastercard MIP & MFE · Elo STI & SFTP · Amex GNS & CAS · Token Vault',
    pciScope: 'MPLS / Circuito Dedicado Redundante',
    accentBorder: 'border-indigo-500/40',
    accentBg: 'bg-indigo-950/15',
    accentBadge: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
  },
  {
    id: 'z4_issuer',
    number: 'ZONA 4',
    title: 'Core do Banco Emissor & Processadora Emissora',
    subtitle: 'ACS 3DS, Switch Autorizador Emissor, HSM Emissor, Shadow Limit/Hold, Incoming Fatura e Disputas',
    pciScope: 'PCI-DSS CDE Emissor & Core Bancário',
    accentBorder: 'border-emerald-500/40',
    accentBg: 'bg-emerald-950/15',
    accentBadge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  },
  {
    id: 'z5_national_settlement',
    number: 'ZONA 5',
    title: 'Liquidação Financeira Nacional (RSFN / SPB / Bacen)',
    subtitle: 'Registradoras de Recebíveis (B3 / CERC / TAG), CIP / Núclea SLC e Banco Central (STR)',
    pciScope: 'RSFN / SPB · Certificado ICP-Brasil SEPRO',
    accentBorder: 'border-amber-500/40',
    accentBg: 'bg-amber-950/15',
    accentBadge: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  },
];

export const SERVER_NODES: ServerNodeSpec[] = [
  // ZONA 1
  {
    id: 'srv-pos-pinpad',
    code: 'SRV-Z1-01',
    name: 'Terminal POS / Pinpad / TEF',
    zoneId: 'z1_capture',
    zoneLabel: 'Zona 1 · Captura & Borda',
    phase: 'online',
    brands: ['visa', 'mastercard', 'elo', 'amex'],
    vendorOrStandard: 'EMVCo L1/L2 Kernel · PCI PTS 5.x/6.x (Ingenico, PAX, Verifone)',
    protocolSummary: 'TLS 1.2/1.3 sobre 4G/Wi-Fi (ISO 8583 encapsulado ou JSON TEF)',
    portAndFraming: 'HTTPS :443 / Socket TLS :8443 · Payload EMV TLV (Tags 9F26, 9F27, 95, 9F36, 9F10)',
    cryptoAndHsm: 'Chave IPEK injetada em sala-cofre · Derivação DUKPT por transação (KSN 10B) · PIN Block ISO-0 (TDES) ou ISO-4 (AES)',
    roleDescription:
      'Lê o chip EMV com contato ou NFC (Contactless), negocia Application Cryptogram (ARQC) com o cartão, cifra o PIN digitado sob DUKPT e envia ao Gateway da Adquirente.',
    inboundData: ['Leitura do Chip/NFC (AID, PAN, Track 2 Equivalent)', 'Digitação de Senha pelo Portador (PIN)'],
    outboundData: [
      'DE 22 (POS Entry Mode: 051 Chip / 071 NFC)',
      'DE 52 (PIN Block cifrado sob DUKPT) + DE 53 (KSN)',
      'DE 55 (Tags EMV BER-TLV: 9F26 ARQC, 9F36 ATC, 95 TVR, 9F10 IAD)',
    ],
    relatedOutgoingTables: [
      { brand: 'visa', tableId: 'visa-tcr7', label: 'Visa TCR 7 (Dados EMV Chip)' },
      { brand: 'elo', tableId: 'elo-reg07', label: 'Elo Registro 07 (Dados EMV Chip)' },
      { brand: 'mastercard', tableId: 'mc-1240-emv-3ds', label: 'Mastercard DE 55 (EMV no MTI 1240)' },
    ],
    slaAndLatency: 'Leitura NFC < 400ms · Timeout total de tela aguardando host: 15s a 30s',
    failureModeAndRecovery:
      'Se a resposta 0110 não chegar ou se a escrita do script EMV (Tag 91 ARPC) no chip falhar no segundo toque, o POS dispara desfazimento automático (0400/0420) para estornar o Hold no Emissor.',
    auditReportsAndLogs: ['Log de Kernel EMV (TVR/TSI)', 'Relatório de Desfazimento Técnico (0400) no Switch'],
  },
  {
    id: 'srv-softpos-mpoc',
    code: 'SRV-Z1-02',
    name: 'App SoftPOS + Servidor de Atestação MPoC',
    zoneId: 'z1_capture',
    zoneLabel: 'Zona 1 · Captura & Borda',
    phase: 'online',
    brands: ['visa', 'mastercard', 'elo', 'amex'],
    vendorOrStandard: 'PCI MPoC (Mobile Payments on COTS) · Android Keystore / StrongBox',
    protocolSummary: 'mTLS 1.3 + Attestation Token JWT assinado pelo servidor MPoC',
    portAndFraming: 'HTTPS :443 REST/gRPC · Envelope JWE (JSON Web Encryption) + EMV Contactless Kernel',
    cryptoAndHsm: 'Chaves efêmeras ECDH + DUKPT AES-128 · Validação contínua de integridade do aparelho (Play Integrity / SafetyNet)',
    roleDescription:
      'Transforma smartphones Android/iOS comuns em terminais NFC sem hardware adicional. O Servidor de Atestação MPoC verifica a cada poucos minutos se o celular não possui root/hook antes de liberar chaves de captura.',
    inboundData: ['Aproximação NFC do Cartão ou Carteira Digital (Apple Pay / Google Pay)', 'PIN on Glass (quando acima do limite CVM)'],
    outboundData: [
      'Indicador Tap to Phone / SoftPOS para a Bandeira',
      'DE 55 Contactless + Form Factor Indicator',
    ],
    relatedOutgoingTables: [
      { brand: 'visa', tableId: 'visa-tcr0', label: 'Visa TCR 0 (POS Entry & Terminal Capability)' },
      { brand: 'elo', tableId: 'elo-reg02', label: 'Elo Registro 02 (Indicadores de Captura / Token)' },
      { brand: 'mastercard', tableId: 'mc-1240-base', label: 'Mastercard MTI 1240 (DE 22 + DE 61 POS Data)' },
    ],
    slaAndLatency: 'Atestação em background + autorização online < 1.8s',
    failureModeAndRecovery:
      'Se o dispositivo reprovar na checagem de integridade MPoC, o servidor revoga a chave imediatamente e bloqueia a captura antes de montar a 0100.',
    auditReportsAndLogs: ['MPoC Attestation Audit Log', 'Visa/Mastercard Tap to Phone Compliance Report'],
  },
  {
    id: 'srv-3ds-mpi',
    code: 'SRV-Z1-03',
    name: 'Checkout E-Commerce + 3DS Server (3DSS / MPI)',
    zoneId: 'z1_capture',
    zoneLabel: 'Zona 1 · Captura & Borda',
    phase: 'online',
    brands: ['visa', 'mastercard', 'elo', 'amex'],
    vendorOrStandard: 'EMV 3-D Secure 2.2.0 / 2.3.1 · 3DS SDK & Browser Flow',
    protocolSummary: 'HTTPS TLS 1.3 (JSON JWE/JWS assinado com certificado de Directory Server)',
    portAndFraming: 'HTTPS :443 · Mensagens AReq (Authentication Request) ➔ ARes ➔ CReq/CRes ➔ RReq/RRes',
    cryptoAndHsm: 'Certificados mTLS emitidos por Visa/Mastercard/Elo DS · Recebe o criptograma CAVV/AAV (20B/28B) e ECI',
    roleDescription:
      'Orquestra a autenticação pré-autorização no e-commerce. Coleta mais de 100 dados do navegador/aparelho, envia o AReq ao Directory Server da bandeira e devolve para a Adquirente o ECI (05/06 ou 02/01) + CAVV/AAV + Directory Server Transaction ID.',
    inboundData: ['Dados do Checkout, IP, Device Fingerprint, Histórico do Comprador, Cartão/Token'],
    outboundData: [
      'ECI (Electronic Commerce Indicator: 05/06 Visa/Elo, SLI 210/212 Mastercard)',
      'CAVV v7/v9 (Visa/Elo) ou AAV/UCAF (Mastercard)',
      '3DS Server Transaction ID & DS Transaction ID (UUID 36 pos)',
    ],
    relatedOutgoingTables: [
      { brand: 'visa', tableId: 'visa-tcr5', label: 'Visa TCR 5 (CAVV & ECI)' },
      { brand: 'visa', tableId: 'visa-tcrd', label: 'Visa TCR D (3DS 2.x Program Protocol)' },
      { brand: 'elo', tableId: 'elo-reg05', label: 'Elo Registro 05 (CAVV, ECI, XID 3DS)' },
      { brand: 'mastercard', tableId: 'mc-1240-emv-3ds', label: 'Mastercard PDS 0052, 0184, 0185, 0186 (3DS 2.x)' },
    ],
    slaAndLatency: 'Fluxo Frictionless (sem desafio): 300ms a 900ms · Fluxo Challenge (App do Banco): 10s a 45s',
    failureModeAndRecovery:
      'Se o Directory Server ou ACS não responder no tempo limite, pode aplicar Data Only ou Attempts (ECI 06 / SLI 212), mantendo shift de responsabilidade conforme regra da bandeira.',
    auditReportsAndLogs: ['3DS Authentication Log (AReq/ARes)', 'Relatório de Taxa de Conversão Frictionless vs Challenge'],
  },

  // ZONA 2
  {
    id: 'srv-auth-switch',
    code: 'SRV-Z2-01',
    name: 'Switch Autorizador ISO 8583 (Core Adquirente)',
    zoneId: 'z2_acquirer',
    zoneLabel: 'Zona 2 · Core Adquirente (PCI CDE)',
    phase: 'online',
    brands: ['visa', 'mastercard', 'elo', 'amex'],
    vendorOrStandard: 'DXC / AM53 / Payware / ACI Base24 / Motor Próprio High-Throughput',
    protocolSummary: 'Entrada gRPC/REST interna · Saída Socket TCP/IP Persistente ISO 8583:1987 (EBCDIC/ASCII)',
    portAndFraming: 'Sockets dedicados por bandeira · Framing: 2-Byte Big-Endian Length Header + MTI (0100/0110/0400/0800) + Bitmaps Primário/Secundário',
    cryptoAndHsm: 'Nunca abre PIN em claro: envia PIN Block DUKPT ao HSM (Porta 1500) e recebe PIN Block traduzido sob a ZPK da bandeira',
    roleDescription:
      'Coração em tempo real da Adquirente. Recebe a captura do POS/E-commerce, consulta a tabela de BINs para descobrir a bandeira/produto, chama o HSM para traduzir o PIN, consulta o Antifraude, abre o pacote ISO 8583 (0100) específico de cada bandeira e mantém o socket aberto com Visa EAS, Mastercard MIP, Elo STI e Amex GNS.',
    inboundData: ['Requisição de Venda do API Gateway', 'PIN Block traduzido pelo HSM', 'Score do Antifraude'],
    outboundData: [
      'MTI 0100 / 0110 (Autorização de Compra) e MTI 0400 / 0420 (Reversal / Desfazimento)',
      'MTI 0800 / 0810 (Network Management: Echo Test 30s, Sign-On, Key Exchange)',
      'Gravação no Ledger: TID (DE 62.2), Banknet Ref (DE 63), RRN (DE 37), AuthCode (DE 38)',
    ],
    relatedOutgoingTables: [
      { brand: 'visa', tableId: 'visa-tcr0', label: 'Visa TCR 0 (Auth Code, POS Entry, ARN)' },
      { brand: 'visa', tableId: 'visa-tcr5', label: 'Visa TCR 5 (Transaction Identifier 15 pos do DE 62.2)' },
      { brand: 'elo', tableId: 'elo-reg00', label: 'Elo Registro 00 (Cód. Autorização DE 38 & Valor)' },
      { brand: 'mastercard', tableId: 'mc-1240-base', label: 'Mastercard MTI 1240 (DE 38 + DE 63 Lifecycle ID)' },
    ],
    slaAndLatency: 'Processamento interno < 25ms · Timeout aguardando Bandeira/Emissor: 2.500ms a 3.000ms',
    failureModeAndRecovery:
      'Se a Bandeira não devolver o 0110 dentro da janela de timeout (~2.5s), o Switch gera imediatamente um MTI 0400/0420 (Time-Out Reversal) para garantir que o portador não fique com o limite preso.',
    auditReportsAndLogs: ['Trace ISO 8583 (0100/0110/0400)', 'Monitor de Echo Test (0800/0810) por Link'],
  },
  {
    id: 'srv-hsm-acquirer',
    code: 'SRV-Z2-02',
    name: 'HSM Criptográfico Adquirente (Thales PayShield 10k)',
    zoneId: 'z2_acquirer',
    zoneLabel: 'Zona 2 · Core Adquirente (PCI CDE)',
    phase: 'online',
    brands: ['visa', 'mastercard', 'elo', 'amex'],
    vendorOrStandard: 'Thales PayShield 10k / Futurex Vectera Plus · FIPS 140-3 Level 3 / PCI HSM',
    protocolSummary: 'Socket TCP/IP ou TLS interno na VLAN Criptográfica (Portas 1500 / 9000)',
    portAndFraming: 'Header 2B Length + Message Header + Host Command Code (CA, CI, CJ, G0, KQ, KW, A0)',
    cryptoAndHsm: 'LMK (Local Master Key) em hardware tamper-responsive · BDK (Base Derivation Key) p/ POS DUKPT · ZPK (Zone PIN Key) TDES/AES trocada com cada Bandeira',
    roleDescription:
      'Cofre criptográfico em hardware. Recebe do Switch Autorizador o PIN Block cifrado pelo POS (sob chave derivada da BDK via KSN) e o traduz em microssegundos dentro do chip seguro para a chave de zona (ZPK) da Visa, Mastercard, Elo ou Amex, sem que o PIN jamais exista em memória RAM comum.',
    inboundData: ['Comando Host CA/CI/G0 com PIN Block DUKPT + KSN + PAN + ZPK de destino'],
    outboundData: ['Resposta CB/CJ/G1 com PIN Block re-cifrado para o DE 52 da Bandeira (ISO-0 TDES ou ISO-4 AES)'],
    relatedOutgoingTables: [
      { brand: 'visa', tableId: 'visa-tcr0', label: 'Visa TCR 0 (Reflexo de captura autenticada por PIN)' },
      { brand: 'elo', tableId: 'elo-reg01', label: 'Elo Registro 01 (Capacidade de Entrada & Senha)' },
    ],
    slaAndLatency: '0.8ms a 3ms por tradução de PIN Block (até 2.500 CPS por appliance)',
    failureModeAndRecovery:
      'Se a ZPK estiver dessincronizada com a bandeira (erro de paridade ou troca dinâmica 0800), o HSM retorna código de erro (ex.: Error 10/11/24) ou a bandeira recusa com DE 39 = 55/96. Opera em cluster ativo-ativo.',
    auditReportsAndLogs: ['PayShield Audit Trail', 'Key Check Value (KCV) Ceremony Log'],
  },
  {
    id: 'srv-outgoing-batch',
    code: 'SRV-Z2-03',
    name: 'Servidor Gerador de Outgoing (Clearing Batch Engine)',
    zoneId: 'z2_acquirer',
    zoneLabel: 'Zona 2 · Core Adquirente (PCI CDE)',
    phase: 'clearing',
    brands: ['visa', 'mastercard', 'elo', 'amex'],
    vendorOrStandard: 'Motor Batch de Liquidação (Python/Java/Mainframe) integrado ao campos.sqlite3',
    protocolSummary: 'Leitura SQL/Kafka do Ledger ➔ Geração de Arquivos Posicionais/Blocked ➔ Envio via DEX / MFE / SFTP / CAS',
    portAndFraming: 'Visa: .CTF 168B Fixo · Elo: .TXT 168B Fixo · Mastercard: .IPM RDW 4B + Blocos 1014B · Amex: .CAS 600B Fixo',
    cryptoAndHsm: 'Mascaramento de logs (PCI Req 3.4), cálculo de Checksum de Lote e assinatura SHA-256 do arquivo físico',
    roleDescription:
      'Coleta todas as transações aprovadas (0110) e capturadas no dia, cruza com a tabela de BINs e regras de obrigatoriedade (M/C), gera o ARN (23 dígitos com dígito verificador Luhn), empilha os registros na ordem exata de cada bandeira e calcula os trailers financeiros antes de entregar aos appliances de transmissão.',
    inboundData: [
      'Transações capturadas do Ledger (PAN, Valor, DE 37 RRN, DE 38 AuthCode, DE 55 EMV, DE 62.2 TID / DE 63 Banknet)',
      'Regras de BIN, MCC, Parcelado Brasil e Subcredenciador (PayFac)',
    ],
    outboundData: [
      'Visa Base II (.CTF): TC 90 ➔ TC 05 (TCR 0, 1, 2 BR, 5, 7, D, E) ➔ TC 91 + TC 92',
      'Mastercard IPM (.IPM): MTI 1644 (697 Header) ➔ MTI 1240 (DEs + PDS Brasil) ➔ MTI 1644 (695 Trailer)',
      'Elo Serviço 10 (.TXT): Header B0 ➔ TE05/06 (Reg 00, 01, 02, 05, 07, 08) ➔ Trailer BZ',
      'Amex CAS (.CAS): TFH ➔ TAB ➔ TDR ➔ TAA ➔ TBT ➔ TFT',
    ],
    relatedOutgoingTables: [
      { brand: 'visa', tableId: 'visa-tc90', label: 'Visa TC 90 (File Header)' },
      { brand: 'visa', tableId: 'visa-tcr0', label: 'Visa TCR 0 (Base Financeira)' },
      { brand: 'visa', tableId: 'visa-tcr2-br', label: 'Visa TCR 2 Brasil (Parcelado Pos 40-41)' },
      { brand: 'elo', tableId: 'elo-b0', label: 'Elo Header B0 (Serviço 10)' },
      { brand: 'elo', tableId: 'elo-reg00', label: 'Elo Registro 00 + 01 + 02 (Trinca Obrigatória)' },
      { brand: 'mastercard', tableId: 'mc-1644-header', label: 'Mastercard MTI 1644-697 (Header)' },
      { brand: 'mastercard', tableId: 'mc-1240-brazil', label: 'Mastercard MTI 1240 Brasil (PDS 0195/0220)' },
    ],
    slaAndLatency: 'Janelas de corte: Elo 4x/dia (11h, 15h, 19h, 00h) · Visa e Mastercard múltiplos cortes diários antes do cutoff de clearing',
    failureModeAndRecovery:
      'Se o somatório financeiro do Trailer (TC 92 / BZ / PDS 0301) divergir 1 centavo da soma dos itens ou se faltar um registro obrigatório da trinca, o arquivo inteiro ou o lote é rejeitado na borda.',
    auditReportsAndLogs: ['Validador Forense de Lote Outgoing (Pré-Envio)', 'Hash SHA-256 & Manifesto de Remessa'],
  },
  {
    id: 'srv-recon-fee-engine',
    code: 'SRV-Z2-04',
    name: 'Servidor de Conciliação, Fee Engine & General Ledger (GL)',
    zoneId: 'z2_acquirer',
    zoneLabel: 'Zona 2 · Core Adquirente (PCI CDE)',
    phase: 'settlement',
    brands: ['visa', 'mastercard', 'elo', 'amex'],
    vendorOrStandard: 'Motor de Conciliação Financeira, Intercâmbio & Faturamento de Bandeira',
    protocolSummary: 'Ingestão SFTP/DEX/MFE de arquivos de retorno e relatórios de faturamento das bandeiras',
    portAndFraming: 'Parser de relatórios VSS (Visa), T112/T140/T461/MCBS (Mastercard), TE01/20-02 (Elo) e DFH/DFR (Amex)',
    cryptoAndHsm: 'Trilha de auditoria contábil imutável e conciliação centavo a centavo com as grades do SLC',
    roleDescription:
      'Recebe os arquivos de retorno das bandeiras minutos/horas após o envio do Outgoing. Confirma o que foi aceito, captura rejeições sintáticas para reprocessamento (re-presentment), audita se a tarifa de intercâmbio esperada bateu com a aplicada pela bandeira (detectando downgrades EIRF/Standard) e calcula o valor líquido a pagar aos lojistas e subcredenciadores.',
    inboundData: [
      'Visa: Edit Package EP747 Rejects + VSS-110/120/130/140 + VX-100A (Integrity Fee)',
      'Mastercard: T112 (File Error), T140 (Clearing Summary), T461 (Settlement) + MCBS TN3A',
      'Elo: Arquivo Crítica TE01 com Registro 09 + Relatório Financeiro 20-02',
    ],
    outboundData: [
      'Fila de Reprocessamento (Correção de Registros Rejeitados)',
      'Lançamentos Contábeis (GL) de Receita MDR, Custo de Intercâmbio e Scheme Fees',
      'Grades Financeiras para Registradora (B3/CERC) e CIP/SLC',
    ],
    relatedOutgoingTables: [
      { brand: 'visa', tableId: 'visa-tc91-92', label: 'Visa TC 91/92 (Totais Conciliados com VSS-110)' },
      { brand: 'elo', tableId: 'elo-reg09', label: 'Elo Registro 09 (Diagnóstico de Rejeição TE01)' },
      { brand: 'mastercard', tableId: 'mc-1644-trailer', label: 'Mastercard MTI 1644-695 (Conciliado com T112/T140)' },
    ],
    slaAndLatency: 'Processamento D+0 (rejeições T112/EP747/TE01) e D+1 às 06h00 (conciliação financeira pré-grade SLC)',
    failureModeAndRecovery:
      'Se uma rejeição (EP747 / T112 / Reg 09) não for tratada e reenviada dentro do prazo de presentment (tipicamente 5 a 7 dias), a venda caduca (Late Presentment) e a Adquirente assume o prejuízo ou sofre Chargeback imediato.',
    auditReportsAndLogs: ['Painel de Downgrades (EIRF / Standard)', 'Relatório de Batimento Outgoing vs VSS-110 / T140 / 20-02'],
  },

  // ZONA 3
  {
    id: 'srv-token-ds',
    code: 'SRV-Z3-01',
    name: 'Directory Server (DS) & Cofre de Tokens (VTS / MDES / Elo Token)',
    zoneId: 'z3_brand_edge',
    zoneLabel: 'Zona 3 · Borda & Malha das Bandeiras',
    phase: 'online',
    brands: ['visa', 'mastercard', 'elo', 'amex'],
    vendorOrStandard: 'Visa Token Service (VTS) · Mastercard Digital Enablement Service (MDES) · Elo Tokenização',
    protocolSummary: 'Integrado diretamente na malha de autorização (VIP / Banknet / Elo) + APIs REST mTLS',
    portAndFraming: 'Resolução em tempo real durante o trânsito da mensagem 0100 entre a Borda da Bandeira e o Emissor',
    cryptoAndHsm: 'Valida o criptograma do Token (TAVV / DSRP / UCAF) em HSM da Bandeira e substitui o DPAN pelo FPAN real para o Emissor',
    roleDescription:
      'Quando o portador paga com Apple Pay, Google Pay ou Cartão Salvo Tokenizado (Network Token), a Adquirente recebe e envia apenas o Token (DPAN). Na malha da bandeira, o VTS/MDES valida o criptograma TAVV, destokeniza (DPAN ➔ FPAN) para o Emissor aprovar e devolve o PAR (Payment Account Reference de 29 caracteres) para vínculo unificado.',
    inboundData: ['DPAN (Token 16 dígitos) + TAVV (Token Authentication Verification Value)'],
    outboundData: ['FPAN (PAN real enviado ao Emissor) + Status de Validação do Criptograma + PAR (29 pos)'],
    relatedOutgoingTables: [
      { brand: 'visa', tableId: 'visa-tcr5', label: 'Visa TCR 5 (Token Assurance & CAVV/TAVV)' },
      { brand: 'elo', tableId: 'elo-reg02', label: 'Elo Registro 02 (Indicador de Tokenização)' },
      { brand: 'mastercard', tableId: 'mc-1240-payfac-token', label: 'Mastercard PDS 0059 & PDS 0207 (MDES Token & PAR)' },
    ],
    slaAndLatency: 'Adiciona < 8ms na rota da autorização 0100',
    failureModeAndRecovery:
      'Se o TAVV estiver inválido ou expirado, a bandeira pode recusar na própria malha ou sinalizar falha de verificação criptográfica no campo de resultados para o Emissor.',
    auditReportsAndLogs: ['Token Requestor ID (TRID) Activity Report', 'PAR Mapping Log'],
  },
  {
    id: 'srv-visa-eas-dex',
    code: 'SRV-Z3-02',
    name: 'Visa EAS (Autorização VIP) + Edit Package (EP747) & DEX (Base II)',
    zoneId: 'z3_brand_edge',
    zoneLabel: 'Zona 3 · Borda & Malha das Bandeiras',
    phase: 'both',
    brands: ['visa'],
    vendorOrStandard: 'Visa Extended Access Server (EAS) + Visa Base II Edit Package (EP747) + Data Exchange (DEX)',
    protocolSummary: 'EAS: Socket TCP Persistente ISO 8583 EBCDIC · DEX/EP747: Transferência Batch Base II (.CTF 168B)',
    portAndFraming: 'Online: 2B Header + Base I (0100/0110) · Clearing: Blocos de registros de 168 bytes (TC 90 ➔ TC 05 ➔ TC 91/92)',
    cryptoAndHsm: 'ZPK Visa para PIN Block (DE 52) · Canal MPLS redundante homologado pela VisaNet',
    roleDescription:
      'Dupla de appliances oficiais da Visa na infraestrutura do participante. O EAS mantém a sessão TCP/IP sempre viva com o VisaNet VIP System para autorizações em milissegundos. O Edit Package (EP747) roda a validação sintática oficial da Visa sobre o arquivo Outgoing (.CTF) antes de o DEX transmitir o lote para o Base II e baixar os relatórios VSS.',
    inboundData: [
      'Online: Mensagens ISO 8583 0100 / 0400 vindas do Switch da Adquirente',
      'Batch: Arquivo Outgoing .CTF (TC 90, TC 05 TCR 0..E, TC 91, TC 92)',
    ],
    outboundData: [
      'Online: Resposta 0110 com DE 38 (AuthCode), DE 39 (Response Code) e DE 62.2 (Transaction Identifier 15 dígitos)',
      'Batch: Relatórios de Rejeição EP747 + Relatórios VSS-110, VSS-120, VSS-130, VSS-140 e VX-100A',
    ],
    relatedOutgoingTables: [
      { brand: 'visa', tableId: 'visa-tc90', label: 'Visa TC 90 (Validado pelo EP747)' },
      { brand: 'visa', tableId: 'visa-tcr0', label: 'Visa TCR 0 (Base II CTF)' },
      { brand: 'visa', tableId: 'visa-tcr5', label: 'Visa TCR 5 (DE 62.2 ➔ TID 15 pos)' },
      { brand: 'visa', tableId: 'visa-tc91-92', label: 'Visa TC 91/92 (Trailers Base II)' },
    ],
    slaAndLatency: 'EAS Online: RTT 60ms a 250ms · DEX Batch: Janelas de transmissão contínua ao longo do dia',
    failureModeAndRecovery:
      'Se o link primário do EAS cair, o Switch chaveia instantaneamente para o EAS secundário em outro datacenter. No batch, se o EP747 apontar erro fatal de Header/Trailer, o lote é barrado localmente antes de subir para a VisaNet.',
    auditReportsAndLogs: ['Relatório de Crítica EP747', 'Visa Settlement Service (VSS-110 / VSS-120 / VSS-140)', 'VX-100A Transaction Integrity'],
  },
  {
    id: 'srv-mc-mip-mfe',
    code: 'SRV-Z3-03',
    name: 'Mastercard MIP (Banknet) + MFE / MDS (GCMS IPM)',
    zoneId: 'z3_brand_edge',
    zoneLabel: 'Zona 3 · Borda & Malha das Bandeiras',
    phase: 'both',
    brands: ['mastercard'],
    vendorOrStandard: 'Mastercard Interface Processor (MIP) + Mastercard File Express (MFE) / Global Clearing (GCMS)',
    protocolSummary: 'MIP: Socket TCP Persistente ISO 8583 EBCDIC · MFE: Transferência Segura de Arquivos IPM (R111)',
    portAndFraming: 'Online: 2B Header + CIS/Banknet ISO 8583 · Clearing: 4B RDW (Record Descriptor Word) + Blocos de 1014 bytes (ISO 8583:1993)',
    cryptoAndHsm: 'ZPK Mastercard no MIP · Certificados e criptografia de transporte MFE rumo ao GCMS em St. Louis',
    roleDescription:
      'O MIP é o appliance físico/virtual da Mastercard instalado na borda da Adquirente/Emissor que conecta à rede global Banknet. Já o MFE (Mastercard File Express) é o gateway de arquivos que envia o lote Outgoing IPM (MTI 1644/1240) ao GCMS e recebe os arquivos de retorno T112, T140, T461 e faturas MCBS.',
    inboundData: [
      'Online: MTI 0100 / 0400 do Switch Autorizador',
      'Batch: Arquivo Outgoing IPM R111 (MTI 1644-697 ➔ MTI 1240 ➔ MTI 1644-695)',
    ],
    outboundData: [
      'Online: MTI 0110 com DE 38, DE 39 e DE 63 (Banknet Reference Number 9 chars + Data MMDD)',
      'Batch: T112 (Ack/Erro Sintático), T140 (Clearing Summary), T461 (Settlement) e TN3A (Billing)',
    ],
    relatedOutgoingTables: [
      { brand: 'mastercard', tableId: 'mc-1644-header', label: 'Mastercard MTI 1644-697 (File Header R111)' },
      { brand: 'mastercard', tableId: 'mc-1240-base', label: 'Mastercard MTI 1240 Base (First Presentment)' },
      { brand: 'mastercard', tableId: 'mc-1240-brazil', label: 'Mastercard MTI 1240 Brasil (PDS 0195/0220)' },
      { brand: 'mastercard', tableId: 'mc-1644-trailer', label: 'Mastercard MTI 1644-695 (File Trailer)' },
    ],
    slaAndLatency: 'MIP Online: RTT 50ms a 220ms · MFE Return T112: 15 a 45 minutos após o envio do R111',
    failureModeAndRecovery:
      'O MIP possui capacidade de Stand-In local/rede caso o Emissor não responda. No MFE, se o RDW de 4 bytes ou o blocamento de 1014B estiver corrompido, o GCMS rejeita o arquivo inteiro no relatório T112.',
    auditReportsAndLogs: ['Mastercard T112 (Inbound File Confirmation & Error)', 'T140 / T461 Financial Reconciliation', 'MCBS TN3A'],
  },
  {
    id: 'srv-elo-sti-sftp',
    code: 'SRV-Z3-04',
    name: 'Elo STI Switch Online + Gateway SFTP Serviço 10 (4 Janelas)',
    zoneId: 'z3_brand_edge',
    zoneLabel: 'Zona 3 · Borda & Malha das Bandeiras',
    phase: 'both',
    brands: ['elo'],
    vendorOrStandard: 'Elo Autorização ISO 8583 + Elo Portal / Gateway SFTP de Liquidação (Serviço 10 v26.2)',
    protocolSummary: 'Online: Socket TCP Dedicado ISO 8583 · Batch: SFTP / Connect:Direct em 4 janelas diárias (11h, 15h, 19h, 00h)',
    portAndFraming: 'Online: Header 2B + ISO 8583 · Batch: Registros posicionais fixos de 168 bytes (B0 ➔ 00/01/02/03/05/07/08 ➔ BZ)',
    cryptoAndHsm: 'ZPK Elo para tradução de PIN Block (DE 52) · Autenticação mTLS / SSH Key + PGP no canal SFTP',
    roleDescription:
      'Conecta a Adquirente à malha nacional da Elo. No online, trafega as autorizações 0100/0110 gerando o NSU Elo (12 posições). No clearing (Serviço 10), processa as 4 janelas diárias, valida se a trinca obrigatória (00+01+02) está íntegra e devolve rejeições parciais via TE01 com o Registro 09.',
    inboundData: [
      'Online: MTI 0100 / 0400 do Switch Autorizador',
      'Batch: Arquivo Remessa Serviço 10 (Header B0 + Transações TE05/TE06 + Trailer BZ)',
    ],
    outboundData: [
      'Online: MTI 0110 com DE 38, DE 39 e NSU da Bandeira',
      'Batch: Arquivo de Crítica TE01 contendo o Registro 09 + Relatórios Financeiros 20-02',
    ],
    relatedOutgoingTables: [
      { brand: 'elo', tableId: 'elo-b0', label: 'Elo Header B0 (Serviço 10)' },
      { brand: 'elo', tableId: 'elo-reg00', label: 'Elo Registro 00 (Dados Principais)' },
      { brand: 'elo', tableId: 'elo-reg01', label: 'Elo Registro 01 (Parcelas, NSU 12 pos, CNPJ/CPF)' },
      { brand: 'elo', tableId: 'elo-reg02', label: 'Elo Registro 02 (Tipo Operação 990-995 & Subcred.)' },
      { brand: 'elo', tableId: 'elo-reg09', label: 'Elo Registro 09 (Retorno de Erro na TE01)' },
    ],
    slaAndLatency: 'Online: RTT 40ms a 180ms · Batch: 4 janelas diárias fixas (11h00, 15h00, 19h00 e 00h00)',
    failureModeAndRecovery:
      'Diferente de rejeitar o arquivo todo por 1 transação ruim, se o Header B0 e o Trailer BZ baterem, a Elo acata as vendas válidas e devolve apenas as transações com erro como TE01 acompanhadas do Registro 09 indicando a posição exata.',
    auditReportsAndLogs: ['Arquivo de Retorno TE01 (Registro 09)', 'Relatório de Liquidação Elo 20-02'],
  },
  {
    id: 'srv-amex-gns-cas',
    code: 'SRV-Z3-05',
    name: 'Amex GNS Authorizer Switch + CAS Settlement Gateway',
    zoneId: 'z3_brand_edge',
    zoneLabel: 'Zona 3 · Borda & Malha das Bandeiras',
    phase: 'both',
    brands: ['amex'],
    vendorOrStandard: 'American Express Global Network Services (GNS) + CAS (Cardmember/Acquirer Settlement)',
    protocolSummary: 'Online: Socket TCP ISO 8583 (MTI 1100/1110) · Batch: SFTP / Connect:Direct CAS (600-Byte Fixed ASCII)',
    portAndFraming: 'Online: ISO 8583 GNS · Batch: Hierarquia TFH (File Header) ➔ TAB (Batch) ➔ TDR (Detail 600B) ➔ TAA ➔ TBT ➔ TFT',
    cryptoAndHsm: 'ZPK Amex + Validação CSC (4 dígitos / 3 dígitos) e SafeKey 3DS (20B CAVV)',
    roleDescription:
      'Integra credenciadores habilitados no arranjo American Express no Brasil. No online, obtém o Transaction ID de 15 dígitos da rede GNS. No clearing, transmite o arquivo CAS de 600 bytes por linha com o ARN Amex de 26 posições.',
    inboundData: ['Online: MTI 1100 · Batch: Arquivo Outgoing CAS (TFH / TAB / TDR / TFT)'],
    outboundData: ['Online: MTI 1110 (TID 15 pos) · Batch: Reconciliation File (DFH / DFR / DFT)'],
    relatedOutgoingTables: [
      { brand: 'visa', tableId: 'visa-tcr0', label: 'Comparativo na Aba 4ª Bandeira Amex (TFH/TDR/TFT)' },
    ],
    slaAndLatency: 'Online: RTT 90ms a 280ms · Batch: Janela diária CAS',
    failureModeAndRecovery:
      'Se o somatório dos registros TDR não bater com o TBT (Batch Trailer) ou TFT (File Trailer), o lote CAS é recusado no arquivo de retorno DFR.',
    auditReportsAndLogs: ['Amex CAS DFH/DFR Reconciliation Report'],
  },

  // ZONA 4
  {
    id: 'srv-issuer-auth-hsm',
    code: 'SRV-Z4-01',
    name: 'Switch Autorizador do Emissor + HSM Emissor + Core de Limite (Hold)',
    zoneId: 'z4_issuer',
    zoneLabel: 'Zona 4 · Core do Banco Emissor',
    phase: 'online',
    brands: ['visa', 'mastercard', 'elo', 'amex'],
    vendorOrStandard: 'Processadora Emissora (Pismo / Dock / Conductor / VisionPlus / Mainframe Banco) + Thales PayShield',
    protocolSummary: 'Socket TCP Persistente conectado ao EAS (Visa), MIP (Mastercard) e STI (Elo)',
    portAndFraming: 'Recebe MTI 0100 com FPAN real (já destokenizado pela bandeira), DE 52, DE 55 e dados 3DS/CAVV',
    cryptoAndHsm: 'HSM Emissor detém a MDK-AC (valida ARQC Tag 9F26 e gera ARPC Tag 91), PVK/CVK (valida PIN e CVV/iCVV) e CAVV Key (valida 3DS)',
    roleDescription:
      'Destino final da autorização online (0100). O Switch do Emissor chama seu próprio HSM para provar matematicamente que o chip EMV é autêntico (ARQC), que a senha digitada está correta e que o CAVV do 3DS é legítimo. Em seguida, consulta o saldo/limite do portador, cria a reserva financeira (Hold) e devolve DE 39 = 00 + DE 38 (Código de Autorização) + Tag 91 (ARPC).',
    inboundData: ['MTI 0100 vindo da Bandeira (FPAN + Valor + MCC + DE 52 PIN + DE 55 EMV + CAVV)'],
    outboundData: ['MTI 0110 (DE 39 = 00 Aprovado / 51 Sem Saldo / 05 Não Autorizado + DE 38 AuthCode + DE 55 Tag 91 ARPC)'],
    relatedOutgoingTables: [
      { brand: 'visa', tableId: 'visa-tcr0', label: 'Visa TCR 0 (Consome o DE 38 gerado pelo Emissor)' },
      { brand: 'visa', tableId: 'visa-tcr7', label: 'Visa TCR 7 (Preserva os dados EMV validados no HSM Emissor)' },
      { brand: 'mastercard', tableId: 'mc-1240-base', label: 'Mastercard MTI 1240 (DE 38 AuthCode obrigatório)' },
    ],
    slaAndLatency: 'Meta de resposta do Emissor: 150ms a 800ms (acima de ~2.000ms corre risco de cair em STIP da Bandeira)',
    failureModeAndRecovery:
      'Se o Core do Emissor demorar para responder, a Bandeira assume a resposta via STIP (Stand-In Processing) usando parâmetros pré-acordados e envia um Advice (0120/0121) depois que o Emissor voltar.',
    auditReportsAndLogs: ['Log de Validação ARQC/CAVV no HSM Emissor', 'Relatório de Autorizações em Stand-In (STIP)'],
  },
  {
    id: 'srv-issuer-incoming-disputes',
    code: 'SRV-Z4-02',
    name: 'Servidor Incoming do Emissor (Shadow Posting Fatura) & Plataforma de Disputas',
    zoneId: 'z4_issuer',
    zoneLabel: 'Zona 4 · Core do Banco Emissor',
    phase: 'clearing',
    brands: ['visa', 'mastercard', 'elo', 'amex'],
    vendorOrStandard: 'Motor de Incoming Clearing, Fatura de Cartões & Disputas (Visa VROL / Mastercard MCOM / Elo Disputas)',
    protocolSummary: 'Recebe os lotes Incoming processados pelas bandeiras (Base II Incoming / IPM Incoming / Elo Incoming)',
    portAndFraming: 'Mesma estrutura física de 168B (Visa/Elo) e 1014B RDW (Mastercard), enriquecida com a tarifa de intercâmbio calculada',
    cryptoAndHsm: 'Matching determinístico contra a base de Holds por TID/Banknet/NSU + RRN (DE 37) + AuthCode (DE 38)',
    roleDescription:
      'Recebe da Bandeira as vendas enviadas pela Adquirente no Outgoing. Faz o "casamento" (matching) com a reserva de limite (Hold) aberta na autorização 0100, baixa o Hold e transforma em lançamento definitivo na fatura do portador (ou débito em conta). Se houver fraude sem 3DS/Chip ou erro de processamento, aciona o VROL/MCOM/Elo para abrir Chargeback.',
    inboundData: ['Arquivos Incoming da Visa (TC 05), Mastercard (MTI 1240) e Elo (TE05/06)'],
    outboundData: [
      'Posting na Fatura do Portador (À vista ou Parcelado)',
      'Abertura de Disputa / Chargeback quando cabível: Visa TC 15 (VROL), Mastercard MTI 1442 (MCOM), Elo TE15',
    ],
    relatedOutgoingTables: [
      { brand: 'visa', tableId: 'visa-tcr1', label: 'Visa TCR 1 (Dados adicionais lidos na Fatura e Disputas)' },
      { brand: 'elo', tableId: 'elo-reg01', label: 'Elo Registro 01 (Parcelas e Ponto de Venda na Fatura)' },
      { brand: 'mastercard', tableId: 'mc-1442-1740', label: 'Mastercard MTI 1442 (First Chargeback gerado pelo Emissor)' },
    ],
    slaAndLatency: 'Processamento diário dos ciclos de Incoming + Prazo regulatório de Chargeback (tipicamente até 90/120 dias)',
    failureModeAndRecovery:
      'Se a Adquirente enviou o Outgoing sem o TID (DE 62.2) ou com AuthCode divergente, o Incoming do Emissor pode gerar "Unmatched Presentment" (lançamento duplicado temporário no limite do cliente ou abertura automática de disputa por ausência de autorização).',
    auditReportsAndLogs: ['Relatório de Matching Hold vs Incoming', 'Fila VROL / Mastercom MCOM / Elo Disputas'],
  },

  // ZONA 5
  {
    id: 'srv-registradora-b3',
    code: 'SRV-Z5-01',
    name: 'Registradora de Recebíveis de Cartão (B3 / CERC / TAG)',
    zoneId: 'z5_national_settlement',
    zoneLabel: 'Zona 5 · Liquidação Nacional (RSFN / SPB)',
    phase: 'settlement',
    brands: ['visa', 'mastercard', 'elo', 'amex'],
    vendorOrStandard: 'Infraestrutura de Registro (Resolução BCB nº 264 / Circular 3.952)',
    protocolSummary: 'APIs REST mTLS / Arquivos de Agenda de Unidades de Recebíveis (UR)',
    portAndFraming: 'JSON / XML Padronizado de Interoperabilidade entre Registradoras',
    cryptoAndHsm: 'Certificado Digital ICP-Brasil + Assinatura de Contratos de Gravame / Cessão',
    roleDescription:
      'Antes de pagar o lojista ou subcredenciador, a Adquirente registra diariamente as Unidades de Recebíveis (UR = CNPJ/CPF do lojista + Credenciadora + Arranjo/Bandeira + Data de Liquidação) na Registradora (B3/CERC/TAG) e consulta para qual domicílio bancário ou instituição financeira o valor deve ser direcionado (caso o lojista tenha antecipado ou dado a agenda em garantia).',
    inboundData: ['Constituição de UR pela Adquirente/Subcredenciador (vendas líquidas de MDR)'],
    outboundData: ['Grade de Domicílio e Gravames indicando quem tem direito a receber cada UR na CIP/SLC'],
    relatedOutgoingTables: [
      { brand: 'visa', tableId: 'visa-tcre', label: 'Visa TCR E (Identificação do Subcredenciador e CPF/CNPJ do Lojista)' },
      { brand: 'elo', tableId: 'elo-reg01', label: 'Elo Registro 01 (CNPJ/CPF do Estabelecimento Pos 128-141)' },
      { brand: 'mastercard', tableId: 'mc-1240-brazil', label: 'Mastercard PDS 0220 (CNPJ/CPF do Lojista no Brasil)' },
    ],
    slaAndLatency: 'Troca diária de arquivos de constituição e retorno de grade de trava antes da janela do SLC',
    failureModeAndRecovery:
      'Se o CNPJ/CPF do lojista estiver inválido desde a captura/Outgoing, a UR é rejeitada na Registradora e gera apontamento de conformidade perante o Banco Central.',
    auditReportsAndLogs: ['Relatório de Conciliação de Agenda de URs (B3 / CERC / TAG)'],
  },
  {
    id: 'srv-cip-slc-str',
    code: 'SRV-Z5-02',
    name: 'CIP / Núclea (SLC — Liquidação de Cartões) + Banco Central (STR)',
    zoneId: 'z5_national_settlement',
    zoneLabel: 'Zona 5 · Liquidação Nacional (RSFN / SPB)',
    phase: 'settlement',
    brands: ['visa', 'mastercard', 'elo', 'amex'],
    vendorOrStandard: 'Núclea (antiga CIP) — Sistema de Liquidação Diferida de Transferências Interbancárias de Cartões (SLC) + STR Bacen',
    protocolSummary: 'RSFN (Rede do Sistema Financeiro Nacional) · IBM MQ Series / Mensageria XML SPB',
    portAndFraming: 'Mensagens do Catálogo do SPB: ASLC026 (Crédito), ASLC028 (Débito), ASLC031 (Antecipação), LDL0001..',
    cryptoAndHsm: 'HSM SPB com Certificado ICP-Brasil cadeias SEPRO/Bacen (Criptografia e Assinatura Digital no padrão RSFN)',
    roleDescription:
      'Onde o dinheiro realmente muda de mãos no Brasil. As Bandeiras e Adquirentes enviam as grades financeiras para o SLC (Núclea). O SLC faz a compensação multilateral líquida (Net Settlement) entre Bancos Emissores, Credenciadoras, Subcredenciadores e Bancos Domicílio dos Lojistas, e liquida o saldo líquido nas Contas de Liquidação / Reservas Bancárias dentro do STR do Banco Central.',
    inboundData: [
      'Grades Financeiras das Bandeiras (baseadas no VSS-110 Visa, T461 Mastercard, 20-02 Elo)',
      'Grades de Pagamento ao Lojista/Subcredenciador (ASLC026 Crédito, ASLC028 Débito, ASLC031 Antecipação)',
    ],
    outboundData: [
      'Confirmação de Liquidação Efetivada no STR/Bacen (Débito no Banco Emissor ➔ Crédito na Adquirente ➔ Crédito no Banco do Lojista)',
    ],
    relatedOutgoingTables: [
      { brand: 'visa', tableId: 'visa-tcr2-br', label: 'Visa TCR 2 Brasil (Define Liquidação Nacional no SLC)' },
      { brand: 'elo', tableId: 'elo-reg02', label: 'Elo Registro 02 (Tipo de Operação Nacional 990-995)' },
      { brand: 'mastercard', tableId: 'mc-1240-brazil', label: 'Mastercard PDS 0195 (Fluxo de Liquidação Parcelado Brasil)' },
    ],
    slaAndLatency: 'Janelas diárias da manhã e tarde na grade oficial do SLC / STR (dias úteis bancários)',
    failureModeAndRecovery:
      'Se uma mensagem ASLC026/028 contiver ISPB/Agência/Conta ou CNPJ divergente, o SLC devolve rejeição parcial/total (ASLC026E) para reenvio na grade complementar do mesmo dia.',
    auditReportsAndLogs: ['Extrato de Liquidação Multilateral SLC (ASLC026/028/031)', 'Comprovante de Liquidação STR/Bacen'],
  },
];

export const CABLE_LINKS: CableLinkSpec[] = [
  {
    id: 'link-01',
    code: 'CABO #01',
    fromServerId: 'srv-pos-pinpad',
    fromLabel: 'POS / SoftPOS / Checkout',
    toServerId: 'srv-auth-switch',
    toLabel: 'API Gateway & Switch Autorizador',
    phase: 'online',
    brands: ['visa', 'mastercard', 'elo', 'amex'],
    transportProtocol: 'TLS 1.2 / 1.3 (HTTPS / Socket TLS)',
    portOrChannel: 'Porta :443 / :8443 (DMZ Pública ➔ CDE)',
    wireFraming: 'JSON REST ou ISO 8583 encapsulado + Tags EMV BER-TLV',
    cryptoProtection: 'PIN Block DUKPT (TDES/AES) + KSN (10B) + MPoC Attestation / 3DS CAVV',
    payloadsCarried: ['PAN / Token', 'Valor (BRL 986)', 'DE 22 Entry Mode', 'DE 52 PIN Block', 'DE 55 EMV', 'CAVV / ECI'],
    timeoutOrSchedule: 'Síncrono · Timeout de cliente: 15s',
    onFailureBehavior: 'Terminal desfaz localmente ou aguarda confirmação de sonda; nenhuma captura financeira é gerada.',
  },
  {
    id: 'link-02',
    code: 'CABO #02',
    fromServerId: 'srv-3ds-mpi',
    fromLabel: '3DS Server (3DSS / MPI)',
    toServerId: 'srv-token-ds',
    toLabel: 'Directory Server (DS) ➔ ACS Emissor',
    phase: 'online',
    brands: ['visa', 'mastercard', 'elo', 'amex'],
    transportProtocol: 'HTTPS mTLS 1.3 (EMV 3DS 2.2 Protocol)',
    portOrChannel: 'Porta :443 com Certificados de cliente DS',
    wireFraming: 'JSON assinado e cifrado (JWS / JWE) · Mensagens AReq / ARes',
    cryptoProtection: 'mTLS + Criptografia de SDK + Geração do CAVV v7/v9 AES ou AAV no HSM do ACS',
    payloadsCarried: ['Device Info (100+ campos)', 'AReq / ARes', 'CAVV / AAV (28 pos)', 'ECI (05/06 ou SLI 210/212)', 'DS Trans ID'],
    timeoutOrSchedule: 'Síncrono pré-autorização · SLA < 1.2s (Frictionless)',
    onFailureBehavior: 'Fallback para Attempts (ECI 06 / SLI 212) ou Data Only conforme política de risco do lojista.',
  },
  {
    id: 'link-03',
    code: 'CABO #03',
    fromServerId: 'srv-auth-switch',
    fromLabel: 'Switch Autorizador ISO 8583',
    toServerId: 'srv-hsm-acquirer',
    toLabel: 'HSM Adquirente (Thales PayShield 10k)',
    phase: 'online',
    brands: ['visa', 'mastercard', 'elo', 'amex'],
    transportProtocol: 'Raw TCP/IP ou TLS na VLAN Criptográfica',
    portOrChannel: 'Porta Host :1500 / :9000',
    wireFraming: '2-Byte Length Header + Comando ASCII PayShield (CA / CI / G0)',
    cryptoProtection: 'Tradução dentro de hardware FIPS 140-3 Level 3: de chave BDK (DUKPT) para ZPK (Bandeira) sob proteção da LMK',
    payloadsCarried: ['PIN Block de Entrada (DUKPT)', 'KSN (10B)', 'PAN (12 dígitos rightmost)', 'PIN Block de Saída (ZPK)'],
    timeoutOrSchedule: 'Síncrono · Latência < 2ms',
    onFailureBehavior: 'Se o HSM recusar (erro de paridade/formato), o Switch aborta a transação com DE 39 = 96/63 sem enviar à bandeira.',
  },
  {
    id: 'link-04',
    code: 'CABO #04',
    fromServerId: 'srv-auth-switch',
    fromLabel: 'Switch Autorizador ISO 8583',
    toServerId: 'srv-visa-eas-dex',
    toLabel: 'Visa EAS (Extended Access Server ➔ VIP)',
    phase: 'online',
    brands: ['visa'],
    transportProtocol: 'Socket TCP/IP Persistente em Link Dedicado MPLS/VPN',
    portOrChannel: 'Porta TCP dedicada EAS + Heartbeat 0800/0810 a cada 30s',
    wireFraming: '2-Byte Big-Endian Length + Header Base I + ISO 8583:1987 EBCDIC',
    cryptoProtection: 'DE 52 cifrado sob ZPK Visa + DE 55 ARQC + DE 126.9 CAVV',
    payloadsCarried: ['MTI 0100/0110', 'MTI 0400/0420 (Reversal)', 'DE 37 RRN', 'DE 38 AuthCode', 'DE 62.2 Transaction Identifier (15 dígitos)'],
    timeoutOrSchedule: 'Síncrono · Timeout estrito ~2.500ms',
    onFailureBehavior: 'Sem resposta em 2.5s: Switch dispara Auto-Reversal (0400) ou a VisaNet responde em Stand-In (STIP).',
  },
  {
    id: 'link-05',
    code: 'CABO #05',
    fromServerId: 'srv-auth-switch',
    fromLabel: 'Switch Autorizador ISO 8583',
    toServerId: 'srv-mc-mip-mfe',
    toLabel: 'Mastercard MIP (Interface Processor ➔ Banknet)',
    phase: 'online',
    brands: ['mastercard'],
    transportProtocol: 'Socket TCP/IP Persistente em Link Dedicado MPLS',
    portOrChannel: 'Porta TCP dedicada no appliance MIP local/remoto',
    wireFraming: '2-Byte Big-Endian Length + ISO 8583 CIS/Banknet EBCDIC',
    cryptoProtection: 'DE 52 cifrado sob ZPK Mastercard + DE 48 (SE 42/43 3DS) + DE 55 EMV',
    payloadsCarried: ['MTI 0100/0110', 'MTI 0400/0420', 'DE 38 AuthCode', 'DE 63 Network Data (Financial Network Code + Banknet Ref 9 pos + MMDD)'],
    timeoutOrSchedule: 'Síncrono · Timeout estrito ~2.500ms',
    onFailureBehavior: 'Failover imediato para MIP secundário ou resposta em Stand-In pelo MIP/Banknet.',
  },
  {
    id: 'link-06',
    code: 'CABO #06',
    fromServerId: 'srv-auth-switch',
    fromLabel: 'Switch Autorizador ISO 8583',
    toServerId: 'srv-elo-sti-sftp',
    toLabel: 'Elo STI Switch Online',
    phase: 'online',
    brands: ['elo'],
    transportProtocol: 'Socket TCP/IP Persistente em Link Dedicado Elo',
    portOrChannel: 'Porta TCP dedicada + Echo Test 0800/0810',
    wireFraming: '2-Byte Length Header + ISO 8583 Elo',
    cryptoProtection: 'DE 52 cifrado sob ZPK Elo + DE 55 EMV + Dados 3DS',
    payloadsCarried: ['MTI 0100/0110', 'MTI 0400/0420', 'DE 38 AuthCode', 'NSU Elo (12 posições) para conciliação no Registro 01'],
    timeoutOrSchedule: 'Síncrono · Timeout ~2.500ms',
    onFailureBehavior: 'Envio de desfazimento 0400/0420 em caso de queda ou timeout.',
  },
  {
    id: 'link-07',
    code: 'CABO #07',
    fromServerId: 'srv-visa-eas-dex',
    fromLabel: 'Borda Bandeiras (EAS / MIP / STI / GNS)',
    toServerId: 'srv-issuer-auth-hsm',
    toLabel: 'Switch Autorizador & HSM do Banco Emissor',
    phase: 'online',
    brands: ['visa', 'mastercard', 'elo', 'amex'],
    transportProtocol: 'Socket TCP/IP Persistente na Malha Emissora da Bandeira',
    portOrChannel: 'Appliance EAS / MIP / STI instalado na borda do Banco Emissor',
    wireFraming: '2-Byte Length Header + ISO 8583 Emissor (com FPAN já destokenizado pelo VTS/MDES)',
    cryptoProtection: 'PIN Block traduzido pela Bandeira para a ZPK do Emissor + ARQC EMV + CAVV',
    payloadsCarried: ['MTI 0100 (Entrada no Emissor)', 'MTI 0110 (Saída com DE 39, DE 38 AuthCode e DE 55 Tag 91 ARPC)'],
    timeoutOrSchedule: 'Síncrono · SLA do Emissor < 1.200ms',
    onFailureBehavior: 'Se o Emissor não responder a tempo, a Bandeira aprova/nega via STIP e envia Advice 0120 quando o Emissor retornar.',
  },
  {
    id: 'link-08',
    code: 'CABO #08',
    fromServerId: 'srv-outgoing-batch',
    fromLabel: 'Servidor Gerador de Outgoing',
    toServerId: 'srv-visa-eas-dex',
    toLabel: 'Visa Edit Package (EP747) & DEX (Base II)',
    phase: 'clearing',
    brands: ['visa'],
    transportProtocol: 'Execução Batch Local (EP747) + Transmissão Segura Visa DEX',
    portOrChannel: 'Canal de Arquivos DEX / Base II',
    wireFraming: 'Arquivo .CTF · Linhas fixas de 168 bytes (ASCII ou EBCDIC)',
    cryptoProtection: 'Canal autenticado Visa DEX + Checksums de lote (TC 91/92) e hash SHA-256',
    payloadsCarried: [
      'Envio: TC 90 ➔ TC 05 (TCR 0, TCR 1, TCR 2 BR, TCR 5, TCR 7, TCR D, TCR E) ➔ TC 91 + TC 92',
      'Retorno: Relatório de Rejeição EP747 + Relatórios VSS-110/120/130/140 + VX-100A',
    ],
    timeoutOrSchedule: 'Assíncrono em Lote · Múltiplas janelas diárias antes do cutoff Base II',
    onFailureBehavior: 'Erro de sintaxe barra a transação no EP747; ausência de TCR condicional ou TID gera downgrade no VSS-140 / VX-100A.',
  },
  {
    id: 'link-09',
    code: 'CABO #09',
    fromServerId: 'srv-outgoing-batch',
    fromLabel: 'Servidor Gerador de Outgoing',
    toServerId: 'srv-mc-mip-mfe',
    toLabel: 'Mastercard MFE (File Express) ➔ GCMS',
    phase: 'clearing',
    brands: ['mastercard'],
    transportProtocol: 'Mastercard File Express (MFE) / Connect:Direct',
    portOrChannel: 'Canal MFE dedicado rumo ao GCMS',
    wireFraming: 'Arquivo .IPM (R111) · 4-Byte RDW Big-Endian + Blocos físicos de 1014 bytes (ISO 8583:1993)',
    cryptoProtection: 'Criptografia de canal MFE + PDS 0301 (Amount Checksum) e PDS 0306 (Message Count) no Trailer',
    payloadsCarried: [
      'Envio: MTI 1644 (697 Header) ➔ MTI 1240 (200 First Presentment + PDS Brasil 0195/0220) ➔ MTI 1644 (695 Trailer)',
      'Retorno: T112 (Ack/Erro Sintático), T140 (Clearing), T461 (Settlement) e TN3A (Billing)',
    ],
    timeoutOrSchedule: 'Assíncrono em Lote · Retorno T112 em ~15 a 45 minutos',
    onFailureBehavior: 'Erro de blocamento 1014B ou PDS 0301 rejeita o arquivo no T112; falta de DE 63 ou PDS obrigatório causa rejeição de item ou downgrade IRD.',
  },
  {
    id: 'link-10',
    code: 'CABO #10',
    fromServerId: 'srv-outgoing-batch',
    fromLabel: 'Servidor Gerador de Outgoing',
    toServerId: 'srv-elo-sti-sftp',
    toLabel: 'Gateway SFTP Elo (Serviço 10)',
    phase: 'clearing',
    brands: ['elo'],
    transportProtocol: 'SFTP / Connect:Direct sobre Link Dedicado Elo',
    portOrChannel: 'Porta :22 SFTP · 4 Janelas Diárias (11h, 15h, 19h, 00h)',
    wireFraming: 'Arquivo .TXT · Linhas posicionais fixas de 168 bytes (Serviço 10 v26.2)',
    cryptoProtection: 'Chave SSH + PGP opcional + Controle sequencial de remessa no Header B0',
    payloadsCarried: [
      'Envio: Header B0 ➔ TE05/TE06 (Reg 00 + Reg 01 + Reg 02 + Reg 05/07/08) ➔ Trailer BZ',
      'Retorno: Arquivo de Crítica TE01 com Registro 09 + Relatório Financeiro 20-02',
    ],
    timeoutOrSchedule: 'Assíncrono · 4 Janelas Diárias (11h00, 15h00, 19h00, 00h00)',
    onFailureBehavior: 'Transações com erro voltam como TE01 acompanhadas do Registro 09 apontando o campo e o código de erro.',
  },
  {
    id: 'link-11',
    code: 'CABO #11',
    fromServerId: 'srv-visa-eas-dex',
    fromLabel: 'Clearing das Bandeiras (Base II / GCMS / Elo / CAS)',
    toServerId: 'srv-issuer-incoming-disputes',
    toLabel: 'Servidor Incoming & Fatura do Banco Emissor',
    phase: 'clearing',
    brands: ['visa', 'mastercard', 'elo', 'amex'],
    transportProtocol: 'DEX (Visa) / MFE (Mastercard) / SFTP (Elo & Amex) na perna do Emissor',
    portOrChannel: 'Canais de distribuição Incoming das Bandeiras para cada Emissor',
    wireFraming: 'Arquivos Incoming (168B Base II/Elo e 1014B IPM) já enriquecidos com o Intercâmbio calculado',
    cryptoProtection: 'Canais dedicados de borda do Emissor',
    payloadsCarried: [
      'Transações aceitas no Clearing para lançamento na fatura (Shadow Posting) e baixa do Hold',
      'Em sentido inverso (Emissor ➔ Bandeira): Chargebacks TC 15 / MTI 1442 / TE15',
    ],
    timeoutOrSchedule: 'Assíncrono Diário (Ciclos D+0 / D+1)',
    onFailureBehavior: 'Se o Incoming não encontrar o Hold correspondente no Emissor (por falta de TID/RRN/AuthCode), gera exceção de conciliação ou disputa.',
  },
  {
    id: 'link-12',
    code: 'CABO #12',
    fromServerId: 'srv-recon-fee-engine',
    fromLabel: 'Conciliação & Liquidação da Adquirente',
    toServerId: 'srv-registradora-b3',
    toLabel: 'Registradora de Recebíveis (B3 / CERC / TAG)',
    phase: 'settlement',
    brands: ['visa', 'mastercard', 'elo', 'amex'],
    transportProtocol: 'HTTPS mTLS 1.3 / SFTP de Unidades de Recebíveis (Resolução BCB 264)',
    portOrChannel: 'APIs/Arquivos de Registro e Consulta de Agenda',
    wireFraming: 'JSON / XML / Posicional de Constituição de UR',
    cryptoProtection: 'Certificado Digital ICP-Brasil',
    payloadsCarried: ['Constituição de UR (CNPJ/CPF Lojista + Bandeira + Data + Valor Líquido)', 'Retorno de Gravames / Cessão / Domicílio'],
    timeoutOrSchedule: 'Diário (D+0 noite / D+1 madrugada antes da grade do SLC)',
    onFailureBehavior: 'UR com documento inválido é rejeitada; pagamento segue a trava de domicílio informada pela Registradora.',
  },
  {
    id: 'link-13',
    code: 'CABO #13',
    fromServerId: 'srv-recon-fee-engine',
    fromLabel: 'Bandeiras & Adquirentes',
    toServerId: 'srv-cip-slc-str',
    toLabel: 'CIP / Núclea (SLC) ➔ Banco Central (STR)',
    phase: 'settlement',
    brands: ['visa', 'mastercard', 'elo', 'amex'],
    transportProtocol: 'RSFN (Rede do Sistema Financeiro Nacional) · IBM MQ Series',
    portOrChannel: 'Filas MQ Series SPB + STR Bacen',
    wireFraming: 'XML SPB Assinado Digitalmente (Catálogo de Mensagens do Bacen/Núclea)',
    cryptoProtection: 'HSM SPB · Certificado ICP-Brasil SEPRO (Criptografia + Assinatura Digital Assimétrica)',
    payloadsCarried: [
      'ASLC026 (Grade de Liquidação de Crédito)',
      'ASLC028 (Grade de Liquidação de Débito)',
      'ASLC031 (Grade de Antecipação)',
      'Ordem de Liquidação Multilateral Líquida no STR do Banco Central',
    ],
    timeoutOrSchedule: 'Grades Oficiais Diárias (Manhã e Complementar da Tarde em dias úteis)',
    onFailureBehavior: 'Erro de conta/ISPB retorna ASLC026E/028E para correção e reenvio na grade complementar.',
  },
];

export const FAILURE_SCENARIOS: FailureScenarioSpec[] = [
  {
    id: 'fail-01-issuer-timeout',
    code: 'CENÁRIO #01 · ONLINE T+0s',
    title: 'Timeout do Switch do Emissor (> 2.5s) durante a Autorização 0100',
    phase: 'online',
    severity: 'CRÍTICO',
    triggerPoint: 'CABO #07 (Borda da Bandeira ➔ Switch Autorizador do Emissor)',
    affectedServers: ['srv-auth-switch', 'srv-visa-eas-dex', 'srv-mc-mip-mfe', 'srv-issuer-auth-hsm'],
    stepByStepReaction: [
      '1. O Switch da Adquirente envia a MTI 0100 normalmente pelo EAS/MIP/STI e inicia o cronômetro de ~2.500ms.',
      '2. O Core do Banco Emissor sofre lentidão ou queda e não devolve a MTI 0110 dentro do SLA da Bandeira.',
      '3. CAMINHO A (Com Stand-In STIP ativo): O servidor de Stand-In da Visa/Mastercard/Elo responde a 0110 em nome do Emissor (aprovando até o limite de piso STIP) e enfileira um Advice 0120 para avisar o Emissor assim que ele voltar.',
      '4. CAMINHO B (Sem STIP ou Timeout na Adquirente): O Switch da Adquirente estoura o timer de 2.5s, devolve erro ao POS e dispara imediatamente uma MTI 0400/0420 (Auto-Reversal) na rede para cancelar qualquer reserva tardia no Emissor.',
    ],
    financialAndComplianceImpact:
      'Se a Adquirente der timeout mas NÃO enviar a mensagem 0400/0420 (Reversal), o portador recebe "Transação Não Concluída" no POS, porém fica com o limite bloqueado (Hold fantasma) no aplicativo do banco.',
    howToDetectInReports:
      'Monitor de Taxa de Reversal (0400/0420) no Switch Autorizador e código de resposta STIP nos logs da Bandeira.',
    howToPrevent:
      'Manter timers sincronizados entre POS (15s), Switch Adquirente (2.5s) e EAS/MIP, com fila resiliente de 0420 (Reversal Advice) até receber 0430.',
  },
  {
    id: 'fail-02-hsm-pin-translation',
    code: 'CENÁRIO #02 · CRIPTOGRAFIA HSM',
    title: 'Falha de Tradução de PIN Block no HSM (Dessincronia de BDK ou ZPK)',
    phase: 'online',
    severity: 'CRÍTICO',
    triggerPoint: 'CABO #03 (Switch Autorizador ➔ HSM Thales PayShield 10k :1500)',
    affectedServers: ['srv-pos-pinpad', 'srv-auth-switch', 'srv-hsm-acquirer'],
    stepByStepReaction: [
      '1. O Pinpad cifra a senha do cliente com a chave derivada DUKPT (KSN) e envia no DE 52.',
      '2. O Switch Autorizador chama o comando CA/CI/G0 no HSM PayShield na porta 1500 para traduzir da BDK do terminal para a ZPK da Bandeira.',
      '3. Se o KSN pertencer a uma BDK não carregada no HSM, ou se a ZPK da bandeira estiver vencida/corrompida, o HSM devolve código de erro (ex.: PayShield Error 10/11/24) ou gera um PIN Block indecifrável pelo Emissor.',
      '4. A transação morre no Switch (DE 39 = 96 / 63) ou volta recusada pelo Emissor com DE 39 = 55 (Senha Inválida) mesmo com o cliente digitando a senha certa.',
    ],
    financialAndComplianceImpact:
      'Queda abrupta de aprovação em vendas presenciais com senha; múltiplas recusas DE 39 = 55 podem bloquear o cartão do portador no Emissor.',
    howToDetectInReports:
      'Alerta de Error Code != 00 no painel do Thales PayShield e pico de DE 39 = 55/63/96 por faixa de KSN ou por Bandeira.',
    howToPrevent:
      'Validar Key Check Value (KCV) em toda cerimônia de chave e automatizar a troca dinâmica de ZPK (MTI 0800/0810 Key Exchange).',
  },
  {
    id: 'fail-03-batch-trailer-reject',
    code: 'CENÁRIO #03 · CLEARING OUTGOING D+0',
    title: 'Divergência de Trailer ou Falta de Registro Obrigatório no Arquivo Outgoing',
    phase: 'clearing',
    severity: 'CRÍTICO',
    triggerPoint: 'CABOS #08, #09 e #10 (Motor Outgoing ➔ EP747 Visa / MFE Mastercard / SFTP Elo)',
    affectedServers: ['srv-outgoing-batch', 'srv-visa-eas-dex', 'srv-mc-mip-mfe', 'srv-elo-sti-sftp', 'srv-recon-fee-engine'],
    stepByStepReaction: [
      '1. O Motor Outgoing gera o arquivo da janela, mas ocorre um bug: uma venda Elo sai sem o Registro 02, ou o somatório financeiro do Trailer (TC 92 / PDS 0301 / BZ) diverge em R$ 0,01 da soma das transações.',
      '2. Na VISA: O Edit Package local (EP747) barra o lote imediatamente antes mesmo de transmitir pelo DEX para a VisaNet.',
      '3. Na MASTERCARD: O arquivo sobe via MFE, mas em ~20 minutos o GCMS devolve o arquivo T112 rejeitando o lote inteiro por erro de Trailer (PDS 0301/0306) ou blocamento RDW 1014B.',
      '4. Na ELO: Se o Header B0 e o Trailer BZ estiverem corretos, a Elo processa o lote e devolve apenas a venda sem o Registro 02 dentro do arquivo de retorno TE01 acompanhada do Registro 09.',
    ],
    financialAndComplianceImpact:
      'Atraso de 1 dia inteiro no recebimento financeiro da janela (milhões de reais não entram na grade do SLC do dia seguinte) e risco de Late Presentment se não reprocessado.',
    howToDetectInReports:
      'Relatórios de crítica imediata: Visa EP747 Error Report, Mastercard T112 Inbound Confirmation e Elo Arquivo TE01 (Registro 09).',
    howToPrevent:
      'Rodar o Parser & Validador Forense pré-envio (168B / RDW 1014B / Trinca 00+01+02 / Checksum de Trailer) antes de entregar o arquivo à pasta do DEX/MFE/SFTP.',
  },
  {
    id: 'fail-04-missing-lifecycle-id',
    code: 'CENÁRIO #04 · DOWNGRADE SILENCIOSO',
    title: 'Perda do Identificador de Ciclo (TID DE 62.2 / Banknet DE 63) entre o Switch e o Outgoing',
    phase: 'clearing',
    severity: 'FINANCEIRO',
    triggerPoint: 'Transição Zona 2 (Switch Autorizador ➔ Ledger ➔ Motor Gerador de Outgoing)',
    affectedServers: ['srv-auth-switch', 'srv-outgoing-batch', 'srv-recon-fee-engine', 'srv-issuer-incoming-disputes'],
    stepByStepReaction: [
      '1. Na autorização online (0110), a Visa devolve o Transaction Identifier (15 dígitos no DE 62.2) e a Mastercard devolve o Banknet Reference Number + Date (no DE 63).',
      '2. O banco de dados intermediário da Adquirente trunca esse campo ou o Motor Outgoing preenche zeros no TCR 5 (pos 5-19) / DE 63 do MTI 1240.',
      '3. O arquivo Outgoing NÃO é rejeitado sintaticamente (a venda é liquidada!), porém a Bandeira não consegue vincular perfeitamente o clearing à autorização original.',
      '4. A Bandeira rebaixa a tarifa da transação para EIRF / Standard (Downgrade de 35 a 110 bps) e cobra taxa de integridade no fechamento mensal.',
    ],
    financialAndComplianceImpact:
      'Vazamento silencioso de margem: o lote aprova 100%, mas o custo de intercâmbio sobe drasticamente no VSS-140 / T140 e o Emissor ganha vantagem em eventual disputa.',
    howToDetectInReports:
      'Relatório Visa VSS-140 + VX-100A (Transaction Integrity Fee) e Mastercard T140 (IRD de Downgrade aplicado vs esperado).',
    howToPrevent:
      'Auditar persistência ponta a ponta: todo registro capturado no Ledger só pode ir para o Outgoing se DE 62.2 (Visa), DE 63 (Mastercard) e NSU (Elo) estiverem preenchidos.',
  },
  {
    id: 'fail-05-slc-grade-rejection',
    code: 'CENÁRIO #05 · LIQUIDAÇÃO NACIONAL D+1',
    title: 'Rejeição de Grade na CIP/SLC (ASLC026E) ou Divergência de UR na Registradora B3',
    phase: 'settlement',
    severity: 'ALTO',
    triggerPoint: 'CABOS #12 e #13 (Adquirente ➔ Registradora B3/CERC ➔ CIP/SLC Núclea)',
    affectedServers: ['srv-recon-fee-engine', 'srv-registradora-b3', 'srv-cip-slc-str'],
    stepByStepReaction: [
      '1. O arquivo Outgoing já foi aceito pela Bandeira e o valor entre Emissor e Adquirente está certo na compensação multilateral.',
      '2. Na hora de liquidar a agenda para o Lojista/Subcredenciador via mensagem XML RSFN (ASLC026 Crédito / ASLC028 Débito), a conta de domicílio informada na Registradora está encerrada ou com CNPJ divergente.',
      '3. A Núclea (SLC) devolve a mensagem de erro ASLC026E / Dev. STR recusando aquele lançamento específico da grade da manhã.',
      '4. O motor de liquidação da Adquirente precisa capturar o retorno, atualizar o domicílio ou reenviar na janela complementar da tarde do SLC.',
    ],
    financialAndComplianceImpact:
      'Atraso no depósito (payout) na conta do lojista no dia do vencimento da parcela, gerando chamados críticos de conciliação.',
    howToDetectInReports:
      'Fila de retorno de mensagens RSFN (ASLC026E / ASLC028E / ASLC031E) e log de validação de URs da B3/CERC.',
    howToPrevent:
      'Validar CNPJ/CPF (PDS 0220 / Reg 01 / TCR E) já no cadastro do EC e sincronizar a grade de domicílio da Registradora antes de fechar o arquivo XML do SLC.',
  },
];

export function OutgoingServerTopologyBlueprint({
  initialBrand = 'all',
  onSelectTable,
}: {
  initialBrand?: TopologyBrandFilter;
  onSelectTable?: (brand: OutgoingBrandId, tableId: string) => void;
}) {
  const [zoomLevel, setZoomLevel] = useState<TopologyZoomLevel>('c2_servers');
  const [brandFilter, setBrandFilter] = useState<TopologyBrandFilter>(initialBrand);
  const [phaseFilter, setPhaseFilter] = useState<TopologyPhaseFilter>('all');
  const [selectedServer, setSelectedServer] = useState<ServerNodeSpec | null>(null);
  const [selectedCable, setSelectedCable] = useState<CableLinkSpec | null>(null);
  const [selectedFailureId, setSelectedFailureId] = useState<string>(FAILURE_SCENARIOS[0].id);

  const filteredServers = useMemo(() => {
    return SERVER_NODES.filter((srv) => {
      if (brandFilter !== 'all' && !srv.brands.includes(brandFilter)) return false;
      if (phaseFilter !== 'all' && srv.phase !== 'both' && srv.phase !== phaseFilter) return false;
      return true;
    });
  }, [brandFilter, phaseFilter]);

  const filteredCables = useMemo(() => {
    return CABLE_LINKS.filter((c) => {
      if (brandFilter !== 'all' && !c.brands.includes(brandFilter)) return false;
      if (phaseFilter !== 'all' && c.phase !== phaseFilter) return false;
      return true;
    });
  }, [brandFilter, phaseFilter]);

  const activeFailure = useMemo(
    () => FAILURE_SCENARIOS.find((f) => f.id === selectedFailureId) || FAILURE_SCENARIOS[0],
    [selectedFailureId]
  );

  const handleExportTopologyToDocStudio = () => {
    const serverRows = filteredServers
      .map(
        (s) =>
          `<tr><td><strong>${s.code}</strong></td><td>${s.name}</td><td>${s.zoneLabel}</td><td>${s.protocolSummary}</td><td>${s.cryptoAndHsm}</td></tr>`
      )
      .join('');
    const cableRows = filteredCables
      .map(
        (c) =>
          `<tr><td><strong>${c.code}</strong></td><td>${c.fromLabel} ➔ ${c.toLabel}</td><td>${c.transportProtocol} (${c.portOrChannel})</td><td>${c.wireFraming}</td><td>${c.onFailureBehavior}</td></tr>`
      )
      .join('');

    sendToDocStudio({
      mode: 'append_html',
      title: `Blueprint de Topologia de Servidores & Integrações (${brandFilter.toUpperCase()})`,
      sourceModule: 'Topologia de Servidores, Redes & Integrações (Modelo C4)',
      html: `
        <h2>Blueprint de Topologia de Servidores, Redes & Integrações (${brandFilter.toUpperCase()})</h2>
        <p>Mapeamento físico e lógico de onde cada servidor reside, como se conecta, protocolos de transporte, criptografia HSM e pontos de auditoria.</p>
        <h3>1. Inventário de Servidores & Appliances por Zona PCI-DSS</h3>
        <table>
          <thead>
            <tr><th>Código</th><th>Servidor / Appliance</th><th>Zona de Rede</th><th>Protocolo</th><th>Criptografia / HSM</th></tr>
          </thead>
          <tbody>${serverRows}</tbody>
        </table>
        <h3>2. Mapa de Cabos, Portas & Framing Físico</h3>
        <table>
          <thead>
            <tr><th>Cabo</th><th>De ➔ Para</th><th>Transporte & Porta</th><th>Framing no Cabo</th><th>Comportamento em Falha</th></tr>
          </thead>
          <tbody>${cableRows}</tbody>
        </table>
      `,
      metadata: {
        brand:
          brandFilter === 'visa' || brandFilter === 'elo' || brandFilter === 'mastercard'
            ? brandFilter
            : 'geral',
        brandName: brandFilter.toUpperCase(),
        referenceId: 'C4-SERVER-TOPOLOGY',
        category: 'Infraestrutura & Integrações',
        effectiveDate: '2026',
        executiveSummary:
          'Topologia completa em 5 Zonas de Rede PCI-DSS cobrindo Captura, Core Adquirente, Appliances de Borda das Bandeiras (EAS/DEX/MIP/MFE/STI/CAS), Core do Emissor e Liquidação Nacional (Registradora B3/CERC + CIP/SLC + STR/Bacen).',
      },
    });
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/95 p-5 sm:p-6 space-y-6 shadow-2xl">
      {/* Cabeçalho Editorial & Barra de Controles de Zoom C4 */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-blue-500/10 border border-blue-500/30 text-[10px] font-mono font-bold uppercase tracking-widest text-blue-300">
            <span>🖧 BLUEPRINT DE ENGENHARIA · MODELO C4 DE INFRAESTRUTURA DE PAGAMENTOS</span>
          </div>
          <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
            Onde Cada Servidor Fica, Como Se Conecta e O Que Passa em Cada Cabo
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-4xl leading-relaxed">
            Navegue pelos <strong>4 níveis de zoom</strong> para enxergar desde os 5 atores de negócio até cada{' '}
            <strong>servidor interno, HSM Thales PayShield, appliances de borda das bandeiras (EAS, DEX/EP747, MIP, MFE, STI, CAS)</strong> e a malha nacional <strong>RSFN / CIP SLC / Banco Central</strong>. Clique em qualquer servidor ou cabo para abrir o <strong>Inspector Drawer</strong>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleExportTopologyToDocStudio}
            className="px-3.5 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-xs font-bold text-blue-300 transition-all"
          >
            📄 Exportar Topologia p/ Doc Studio
          </button>
        </div>
      </div>

      {/* Barra de Seleção: 4 Níveis de Zoom + Filtro de Bandeira + Filtro de Fase */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-3 bg-slate-900/80 border border-slate-800 rounded-xl p-3">
        {/* 4 Níveis de Zoom C4 */}
        <div className="xl:col-span-6 space-y-1.5">
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
            1. Nível de Zoom da Arquitetura (Modelo C4)
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            {[
              { id: 'c1_actors', code: 'ZOOM 1', label: '5 Atores & Tempos' },
              { id: 'c2_servers', code: 'ZOOM 2', label: 'Topologia Servidores' },
              { id: 'c3_cables', code: 'ZOOM 3', label: 'Cabos, Portas & HSM' },
              { id: 'c4_failures', code: 'ZOOM 4', label: 'Simulador de Queda' },
            ].map((z) => {
              const active = zoomLevel === z.id;
              return (
                <button
                  key={z.id}
                  type="button"
                  onClick={() => setZoomLevel(z.id as TopologyZoomLevel)}
                  className={`px-2.5 py-2 rounded-lg border text-left transition-all ${
                    active
                      ? 'bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-950/50'
                      : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-600'
                  }`}
                >
                  <div className="font-mono text-[10px] font-black opacity-80">{z.code}</div>
                  <div className="text-xs font-bold truncate">{z.label}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Filtro de Bandeira */}
        <div className="xl:col-span-3 space-y-1.5">
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
            2. Filtrar Malha por Bandeira
          </div>
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'all', label: 'Todas (4)' },
              { id: 'visa', label: 'Visa' },
              { id: 'mastercard', label: 'Mastercard' },
              { id: 'elo', label: 'Elo' },
              { id: 'amex', label: 'Amex' },
            ].map((b) => {
              const active = brandFilter === b.id;
              return (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setBrandFilter(b.id as TopologyBrandFilter)}
                  className={`px-2.5 py-2 rounded-lg border text-xs font-bold transition-all ${
                    active
                      ? 'bg-emerald-600 text-white border-emerald-400'
                      : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-600'
                  }`}
                >
                  {b.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Filtro de Fase */}
        <div className="xl:col-span-3 space-y-1.5">
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
            3. Filtrar por Momento / Etapa
          </div>
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'all', label: 'Ponta a Ponta' },
              { id: 'online', label: 'Online (T+0s)' },
              { id: 'clearing', label: 'Outgoing (D+0)' },
              { id: 'settlement', label: 'SLC / B3 (D+1)' },
            ].map((p) => {
              const active = phaseFilter === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPhaseFilter(p.id as TopologyPhaseFilter)}
                  className={`px-2.5 py-2 rounded-lg border text-xs font-bold transition-all ${
                    active
                      ? 'bg-purple-600 text-white border-purple-400'
                      : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-600'
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* =====================================================================
          ZOOM 1 — VISÃO DE ARRANJO & CRONOLOGIA (5 ATORES + LINHA DO TEMPO)
         ===================================================================== */}
      {zoomLevel === 'c1_actors' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-blue-400">
              Zoom 1 · Arquitetura Macro do Arranjo de Pagamento (Dual-Message System)
            </span>
            <button
              type="button"
              onClick={() => setZoomLevel('c2_servers')}
              className="text-xs font-bold text-emerald-400 hover:text-emerald-300"
            >
              Abrir Servidores por dentro (Ir para Zoom 2) ➔
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {[
              {
                time: 'ETAPA 1 · T + 0 Segundos (Síncrono)',
                title: 'Captura, 3DS, Token & Autorização Online (0100/0110)',
                actors: 'Portador ➔ EC/PayFac ➔ Switch Adquirente ➔ Bandeira ➔ Banco Emissor',
                whatHappens:
                  'Valida criptograma EMV (ARQC), traduz senha no HSM (DUKPT ➔ ZPK), destokeniza DPAN ➔ FPAN e reserva o limite (Hold) no Emissor.',
                keyArtifacts: [
                  'DE 37 (RRN 12 pos)',
                  'DE 38 (AuthCode 6 pos)',
                  'Visa DE 62.2 (TID 15 pos)',
                  'Mastercard DE 63 (Banknet Ref 9 pos + MMDD)',
                  'Elo NSU (12 pos)',
                ],
                tone: 'border-sky-500/40 bg-sky-950/15',
              },
              {
                time: 'ETAPA 2 · D + 0 Corte Batch (Assíncrono)',
                title: 'Geração, Validação & Envio do Arquivo de Outgoing',
                actors: 'Ledger Adquirente ➔ Motor Outgoing ➔ Appliances EP747 / MFE / SFTP / CAS',
                whatHappens:
                  'Enriquece as vendas capturadas com regras de BIN/MCC/Parcelado, gera o ARN (23 dígitos), empilha os registros físicos e transmite para a Bandeira.',
                keyArtifacts: [
                  'Visa Base II (.CTF 168B: TC 90 ➔ TC 05 ➔ TC 92)',
                  'Mastercard IPM (.IPM 1014B RDW: MTI 1644 ➔ 1240)',
                  'Elo Serviço 10 (.TXT 168B: B0 ➔ 00+01+02 ➔ BZ)',
                  'Amex CAS (.CAS 600B: TFH ➔ TDR ➔ TFT)',
                ],
                tone: 'border-blue-500/40 bg-blue-950/15',
              },
              {
                time: 'ETAPA 3 · D + 0 / D + 1 Madrugada',
                title: 'Clearing na Bandeira, Retorno de Crítica & Incoming Emissor',
                actors: 'Base II / GCMS / Elo ➔ Conciliação Adquirente & Shadow Posting Emissor',
                whatHappens:
                  'A Bandeira valida cada registro, calcula a tarifa oficial de intercâmbio (IRD / Fee Program), devolve rejeições sintáticas para a Adquirente e envia o Incoming para o Emissor lançar na fatura.',
                keyArtifacts: [
                  'Visa: EP747 + VSS-110/120/140 + VX-100A',
                  'Mastercard: T112 + T140 + T461 + MCBS TN3A',
                  'Elo: Crítica TE01 (Registro 09) + Rel. 20-02',
                ],
                tone: 'border-indigo-500/40 bg-indigo-950/15',
              },
              {
                time: 'ETAPA 4 · D + 1 / D + 30 (Financeiro & Pós-Venda)',
                title: 'Registradora (B3/CERC), Liquidação CIP/SLC & Disputas',
                actors: 'Adquirente & Bandeiras ➔ B3/CERC ➔ CIP/SLC (Núclea) ➔ STR/Bacen',
                whatHappens:
                  'Constitui as Unidades de Recebíveis (UR) na Registradora, compensa os saldos multilaterais no SLC via mensagens RSFN XML e liquida em reservas bancárias no Banco Central.',
                keyArtifacts: [
                  'Grades RSFN: ASLC026 (Crédito), ASLC028 (Débito), ASLC031 (Antecipação)',
                  'Pós-venda / Disputas: Visa VROL (TC 15), Mastercard MCOM (1442), Elo (TE15)',
                ],
                tone: 'border-amber-500/40 bg-amber-950/15',
              },
            ].map((stage, i) => (
              <div
                key={i}
                className={`rounded-xl border p-4 flex flex-col justify-between gap-3 ${stage.tone}`}
              >
                <div className="space-y-2">
                  <span className="inline-block px-2 py-0.5 rounded bg-slate-950/80 border border-slate-800 font-mono text-[10px] font-bold text-blue-300">
                    {stage.time}
                  </span>
                  <h4 className="text-sm font-black text-white leading-snug">{stage.title}</h4>
                  <div className="text-[11px] font-mono text-emerald-300">{stage.actors}</div>
                  <p className="text-xs text-slate-300 leading-relaxed">{stage.whatHappens}</p>
                </div>

                <div className="pt-2 border-t border-slate-800/80 space-y-1">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                    Chaves & Arquivos Gerados:
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {stage.keyArtifacts.map((art, k) => (
                      <span
                        key={k}
                        className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 font-mono text-[10px] text-slate-200"
                      >
                        {art}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =====================================================================
          ZOOM 2 — TOPOLOGIA DE SERVIDORES, HSM & APPLIANCES (5 ZONAS DE REDE PCI)
         ===================================================================== */}
      {zoomLevel === 'c2_servers' && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-xs font-bold text-slate-300">
              Exibindo <span className="text-white font-black">{filteredServers.length} servidores/appliances</span> distribuídos nas{' '}
              <span className="text-blue-400 font-black">5 Zonas de Rede PCI-DSS & RSFN</span>. Clique em qualquer servidor para inspecionar portas, HSM, protocolos e tabelas.
            </div>
            <button
              type="button"
              onClick={() => setZoomLevel('c3_cables')}
              className="text-xs font-bold text-blue-400 hover:text-blue-300"
            >
              Ver Mapa de Cabos & Portas (Zoom 3) ➔
            </button>
          </div>

          <div className="space-y-4">
            {TOPOLOGY_ZONES.map((zone) => {
              const zoneServers = filteredServers.filter((s) => s.zoneId === zone.id);
              if (zoneServers.length === 0) return null;

              return (
                <div
                  key={zone.id}
                  className={`rounded-2xl border ${zone.accentBorder} ${zone.accentBg} p-4 space-y-3`}
                >
                  {/* Cabeçalho da Zona de Rede */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-md border font-mono text-[11px] font-black ${zone.accentBadge}`}>
                        {zone.number}
                      </span>
                      <h4 className="text-sm sm:text-base font-black text-white">{zone.title}</h4>
                      <span className="text-xs text-slate-400 hidden md:inline">• {zone.subtitle}</span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded bg-slate-950 border border-slate-800 font-mono text-[10px] text-slate-300">
                      🛡️ {zone.pciScope}
                    </span>
                  </div>

                  {/* Cards de Servidores dentro da Zona */}
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                    {zoneServers.map((srv) => {
                      const isSel = selectedServer?.id === srv.id;
                      return (
                        <div
                          key={srv.id}
                          onClick={() => {
                            setSelectedCable(null);
                            setSelectedServer(srv);
                          }}
                          className={`cursor-pointer rounded-xl border p-3.5 transition-all flex flex-col justify-between gap-3 ${
                            isSel
                              ? 'bg-blue-950/60 border-blue-400 ring-2 ring-blue-400/40 shadow-lg'
                              : 'bg-slate-950/90 border-slate-800 hover:border-blue-500/50 hover:bg-slate-900/90'
                          }`}
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between gap-2">
                              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 font-mono text-[10px] font-black text-blue-300">
                                {srv.code}
                              </span>
                              <div className="flex items-center gap-1">
                                {srv.brands.map((b) => (
                                  <span
                                    key={b}
                                    className="px-1.5 py-0.5 rounded bg-slate-900 text-[9px] font-mono uppercase font-bold text-slate-300 border border-slate-800"
                                  >
                                    {b}
                                  </span>
                                ))}
                              </div>
                            </div>

                            <div className="text-xs sm:text-sm font-black text-white leading-snug">
                              {srv.name}
                            </div>

                            <div className="text-[11px] font-mono text-cyan-300 bg-slate-900/90 border border-slate-800/90 rounded-lg px-2.5 py-1.5">
                              🔌 {srv.protocolSummary}
                            </div>

                            <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                              {srv.roleDescription}
                            </p>
                          </div>

                          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                            <span className="text-[10px] font-mono text-emerald-300 truncate">
                              🔐 {srv.cryptoAndHsm.split('·')[0]}
                            </span>
                            <span className="px-2.5 py-1 rounded-lg bg-blue-600/20 text-blue-300 border border-blue-500/30 text-[10px] font-bold shrink-0">
                              Inspecionar Servidor ➔
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =====================================================================
          ZOOM 3 — MALHA DE CABOS, PORTAS, PROTOCOLOS & CRIPTOGRAFIA (LINK-BY-LINK)
         ===================================================================== */}
      {zoomLevel === 'c3_cables' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-blue-400">
                Zoom 3 · Engenharia de Cabo, Transporte, Framing & Criptografia ({filteredCables.length} Conexões)
              </span>
              <p className="text-xs text-slate-400">
                Clique em qualquer linha para abrir o Inspector do Cabo com os comandos HSM, tamanho do header e comportamento de timeout.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-900/95 border-b border-slate-800 text-[11px] font-mono uppercase text-slate-400">
                  <th className="py-3 px-3">Cabo</th>
                  <th className="py-3 px-3">Origem ➔ Destino (Servidores)</th>
                  <th className="py-3 px-3">Protocolo & Porta</th>
                  <th className="py-3 px-3">Framing Físico no Cabo</th>
                  <th className="py-3 px-3">Criptografia / HSM</th>
                  <th className="py-3 px-3 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                {filteredCables.map((cable) => {
                  const isSel = selectedCable?.id === cable.id;
                  return (
                    <tr
                      key={cable.id}
                      onClick={() => {
                        setSelectedServer(null);
                        setSelectedCable(cable);
                      }}
                      className={`cursor-pointer transition-colors ${
                        isSel ? 'bg-blue-950/40' : 'hover:bg-slate-900/70'
                      }`}
                    >
                      <td className="py-3 px-3 align-top whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded bg-blue-500/15 border border-blue-500/30 font-mono text-[11px] font-black text-blue-300">
                          {cable.code}
                        </span>
                        <div className="mt-1 text-[10px] font-mono uppercase text-slate-400">
                          {cable.phase === 'online'
                            ? '⚡ Online T+0s'
                            : cable.phase === 'clearing'
                            ? '📦 Clearing D+0'
                            : '🏦 Liquidação D+1'}
                        </div>
                      </td>
                      <td className="py-3 px-3 align-top min-w-[230px]">
                        <div className="font-bold text-white">{cable.fromLabel}</div>
                        <div className="text-emerald-400 font-mono text-[11px] my-0.5">
                          ➔ {cable.toLabel}
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {cable.brands.map((b) => (
                            <span
                              key={b}
                              className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 font-mono text-[9px] uppercase text-slate-300"
                            >
                              {b}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-3 align-top min-w-[190px]">
                        <div className="font-mono font-bold text-cyan-300">{cable.transportProtocol}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{cable.portOrChannel}</div>
                      </td>
                      <td className="py-3 px-3 align-top min-w-[210px] text-slate-200 font-mono text-[11px]">
                        {cable.wireFraming}
                      </td>
                      <td className="py-3 px-3 align-top min-w-[210px] text-slate-300">
                        {cable.cryptoProtection}
                      </td>
                      <td className="py-3 px-3 align-top text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedServer(null);
                            setSelectedCable(cable);
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/30 text-[11px] font-bold transition-all"
                        >
                          Inspecionar Cabo ➔
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
          ZOOM 4 — SIMULADOR DE FALHA, TIMEOUT & CONTINGÊNCIA NA TOPOLOGIA
         ===================================================================== */}
      {zoomLevel === 'c4_failures' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-2.5">
            {FAILURE_SCENARIOS.map((sc) => {
              const isSel = sc.id === activeFailure.id;
              return (
                <button
                  key={sc.id}
                  type="button"
                  onClick={() => setSelectedFailureId(sc.id)}
                  className={`rounded-xl border p-3 text-left transition-all flex flex-col justify-between gap-2 ${
                    isSel
                      ? 'bg-rose-950/40 border-rose-400 ring-2 ring-rose-500/30'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="font-mono text-[10px] font-black text-rose-300">{sc.code}</span>
                      <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-200 font-mono text-[9px] font-bold">
                        {sc.severity}
                      </span>
                    </div>
                    <div className="text-xs font-black text-white leading-snug">{sc.title}</div>
                  </div>
                  <div className="text-[10px] font-mono text-slate-400 truncate">{sc.triggerPoint}</div>
                </button>
              );
            })}
          </div>

          {/* Detalhe do Incidente Selecionado */}
          <div className="rounded-2xl border border-rose-500/40 bg-slate-900/90 p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <span className="font-mono text-xs font-black text-rose-400">{activeFailure.code}</span>
                <h4 className="text-base sm:text-lg font-black text-white">{activeFailure.title}</h4>
                <div className="text-xs font-mono text-amber-300 mt-0.5">
                  ⚡ Ponto de Falha: {activeFailure.triggerPoint}
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {activeFailure.affectedServers.map((srvId) => {
                  const srvObj = SERVER_NODES.find((s) => s.id === srvId);
                  if (!srvObj) return null;
                  return (
                    <button
                      key={srvId}
                      type="button"
                      onClick={() => {
                        setSelectedCable(null);
                        setSelectedServer(srvObj);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-blue-950 border border-slate-700 hover:border-blue-400 text-[11px] font-mono text-blue-300 transition-all"
                    >
                      🖧 {srvObj.code}: {srvObj.name.split('(')[0].trim()} ➔
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              <div className="lg:col-span-7 space-y-2">
                <div className="text-xs font-black uppercase tracking-wider text-blue-300">
                  Reação Passo a Passo dos Servidores na Malha
                </div>
                <div className="space-y-2">
                  {activeFailure.stepByStepReaction.map((st, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl bg-slate-950/90 border border-slate-800 p-3 text-xs text-slate-200 leading-relaxed"
                    >
                      {st}
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-5 space-y-3">
                <div className="rounded-xl bg-rose-950/25 border border-rose-500/30 p-3.5 space-y-1">
                  <div className="text-[11px] font-black uppercase tracking-wider text-rose-300">
                    💸 Impacto Financeiro & Regulatório
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    {activeFailure.financialAndComplianceImpact}
                  </p>
                </div>

                <div className="rounded-xl bg-amber-950/25 border border-amber-500/30 p-3.5 space-y-1">
                  <div className="text-[11px] font-black uppercase tracking-wider text-amber-300">
                    🔍 Onde Auditar / Detectar nos Relatórios
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    {activeFailure.howToDetectInReports}
                  </p>
                </div>

                <div className="rounded-xl bg-emerald-950/25 border border-emerald-500/30 p-3.5 space-y-1">
                  <div className="text-[11px] font-black uppercase tracking-wider text-emerald-300">
                    🛡️ Engenharia de Prevenção (Best Practice)
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    {activeFailure.howToPrevent}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          SLIDE-OVER INSPECTOR DRAWER (PARA SERVIDOR OU CABO SELECIONADO)
         ===================================================================== */}
      {(selectedServer || selectedCable) && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-slate-950 border-l border-slate-800 h-full overflow-y-auto p-6 space-y-5 shadow-2xl">
            <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <span className="px-2.5 py-0.5 rounded bg-blue-500/15 border border-blue-500/30 font-mono text-[11px] font-black text-blue-300">
                  {selectedServer
                    ? `INSPECTOR DE SERVIDOR · ${selectedServer.code}`
                    : `INSPECTOR DE CABO · ${selectedCable?.code}`}
                </span>
                <h3 className="text-lg font-black text-white mt-1.5">
                  {selectedServer
                    ? selectedServer.name
                    : `${selectedCable?.fromLabel} ➔ ${selectedCable?.toLabel}`}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {selectedServer ? selectedServer.zoneLabel : selectedCable?.transportProtocol}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedServer(null);
                  setSelectedCable(null);
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-slate-300"
              >
                ✕ Fechar
              </button>
            </div>

            {selectedServer && (
              <div className="space-y-4 text-xs">
                {/* Bloco 1: Fabricante / Padrão & Papel */}
                <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-4 space-y-2">
                  <div className="text-[11px] font-black uppercase tracking-wider text-blue-400">
                    1. Papel Arquitetural & Padrão de Mercado
                  </div>
                  <div className="font-mono text-slate-300">
                    <strong>Tecnologia / Appliance:</strong> {selectedServer.vendorOrStandard}
                  </div>
                  <p className="text-slate-200 leading-relaxed">{selectedServer.roleDescription}</p>
                </div>

                {/* Bloco 2: Protocolo, Porta & Framing */}
                <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-4 space-y-2">
                  <div className="text-[11px] font-black uppercase tracking-wider text-cyan-400">
                    2. Protocolo, Porta & Framing Físico no Cabo
                  </div>
                  <div className="font-mono text-cyan-300">{selectedServer.protocolSummary}</div>
                  <div className="text-slate-300 leading-relaxed">{selectedServer.portAndFraming}</div>
                  <div className="text-slate-400 font-mono text-[11px]">
                    ⏱️ SLA / Latência Típica: {selectedServer.slaAndLatency}
                  </div>
                </div>

                {/* Bloco 3: Criptografia & HSM */}
                <div className="rounded-xl bg-emerald-950/20 border border-emerald-500/30 p-4 space-y-1.5">
                  <div className="text-[11px] font-black uppercase tracking-wider text-emerald-300">
                    3. Criptografia, Chaves & Segurança (PCI-DSS / HSM)
                  </div>
                  <p className="text-slate-200 leading-relaxed">{selectedServer.cryptoAndHsm}</p>
                </div>

                {/* Bloco 4: Entradas, Saídas & Tabelas de Outgoing Conectadas */}
                <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-4 space-y-3">
                  <div className="text-[11px] font-black uppercase tracking-wider text-purple-300">
                    4. Dados que Entram, Saem & Tabelas de Outgoing Governadas
                  </div>
                  <div>
                    <div className="font-bold text-slate-300 mb-1">📥 Entrada (Inbound):</div>
                    <ul className="list-disc list-inside space-y-1 text-slate-300">
                      {selectedServer.inboundData.map((d, i) => (
                        <li key={i}>{d}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="font-bold text-slate-300 mb-1">📤 Saída (Outbound):</div>
                    <ul className="list-disc list-inside space-y-1 text-slate-300">
                      {selectedServer.outboundData.map((d, i) => (
                        <li key={i}>{d}</li>
                      ))}
                    </ul>
                  </div>

                  {selectedServer.relatedOutgoingTables.length > 0 && (
                    <div className="pt-2 border-t border-slate-800 space-y-1.5">
                      <div className="font-bold text-blue-300">
                        🔗 Pular direto para a Tabela de Outgoing impactada por este servidor:
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedServer.relatedOutgoingTables.map((rt, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              if (onSelectTable) {
                                onSelectTable(rt.brand, rt.tableId);
                              }
                              setSelectedServer(null);
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/30 font-mono text-[11px] font-bold transition-all"
                          >
                            {rt.label} ➔
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Bloco 5: Modo de Falha & Relatórios de Auditoria */}
                <div className="rounded-xl bg-rose-950/25 border border-rose-500/30 p-4 space-y-2">
                  <div className="text-[11px] font-black uppercase tracking-wider text-rose-300">
                    5. Comportamento em Queda / Erro & Relatórios de Auditoria
                  </div>
                  <p className="text-slate-200 leading-relaxed">
                    {selectedServer.failureModeAndRecovery}
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {selectedServer.auditReportsAndLogs.map((rep, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded bg-slate-950 border border-rose-500/30 font-mono text-[10px] text-rose-200"
                      >
                        📋 {rep}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {selectedCable && (
              <div className="space-y-4 text-xs">
                <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-4 space-y-2">
                  <div className="text-[11px] font-black uppercase tracking-wider text-cyan-400">
                    1. Protocolo de Transporte, Porta & Framing no Cabo
                  </div>
                  <div className="font-mono text-white">
                    <strong>Transporte:</strong> {selectedCable.transportProtocol}
                  </div>
                  <div className="font-mono text-cyan-300">
                    <strong>Porta / Canal:</strong> {selectedCable.portOrChannel}
                  </div>
                  <div className="font-mono text-slate-200">
                    <strong>Framing Físico:</strong> {selectedCable.wireFraming}
                  </div>
                  <div className="font-mono text-amber-300">
                    <strong>SLA / Janela:</strong> {selectedCable.timeoutOrSchedule}
                  </div>
                </div>

                <div className="rounded-xl bg-emerald-950/20 border border-emerald-500/30 p-4 space-y-1.5">
                  <div className="text-[11px] font-black uppercase tracking-wider text-emerald-300">
                    2. Proteção Criptográfica & Chaves HSM neste Link
                  </div>
                  <p className="text-slate-200 leading-relaxed">{selectedCable.cryptoProtection}</p>
                </div>

                <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-4 space-y-2">
                  <div className="text-[11px] font-black uppercase tracking-wider text-blue-300">
                    3. Mensagens, Registros & Campos que Trafegam neste Cabo
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-slate-200">
                    {selectedCable.payloadsCarried.map((p, i) => (
                      <li key={i}>{p}</li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-xl bg-rose-950/25 border border-rose-500/30 p-4 space-y-1.5">
                  <div className="text-[11px] font-black uppercase tracking-wider text-rose-300">
                    4. O que Acontece se este Cabo Cair ou Dar Timeout?
                  </div>
                  <p className="text-slate-200 leading-relaxed">{selectedCable.onFailureBehavior}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
