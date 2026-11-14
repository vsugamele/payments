'use client';

import React, { useMemo, useState } from 'react';
import { OutgoingBrandId } from '@/data/outgoing-tables-flows';
import { sendToDocStudio } from '@/lib/docStudioBridge';

export type TopologyBrandFilter = 'all' | 'visa' | 'mastercard' | 'elo' | 'amex';
export type TopologyPhaseFilter = 'all' | 'online' | 'clearing' | 'settlement';
export type TopologyZoomLevel =
  | 'c1_actors'
  | 'c2_servers'
  | 'c2_packet_trace'
  | 'c3_cables'
  | 'c4_failures';

export interface PacketHopSpec {
  hopNumber: number;
  code: string;
  phase: 'online' | 'clearing' | 'settlement';
  title: string;
  fromServerCode: string;
  fromServerName: string;
  toServerCode: string;
  toServerName: string;
  cableCode: string;
  latencyOrWindow: string;
  whatChangesInsideServer: string;
  wireRequestDump: string;
  wireResponseDump: string;
  criticalFieldsToAudit: string[];
}

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
  {
    id: 'srv-payfac-split',
    code: 'SRV-Z2-05',
    name: 'Motor de Subcredenciadora (PayFac), Marketplace & Split de Pagamento',
    zoneId: 'z2_acquirer',
    zoneLabel: 'Zona 2 · Core Adquirente (PCI CDE)',
    phase: 'both',
    brands: ['visa', 'mastercard', 'elo', 'amex'],
    vendorOrStandard: 'Motor de Subcredenciamento (Circular BCB 3.885 / Regras PayFac Visa/Mastercard/Elo)',
    protocolSummary: 'APIs REST internas + Enriquecimento de Cadastro de Sublojista (CNPJ/CPF, MCC, Endereço, PayFac ID)',
    portAndFraming: 'Injeta dados do Subcredenciador na Autorização (DE 43 / DE 48 / DE 126) e no Lote Outgoing',
    cryptoAndHsm: 'Segregação de agenda de recebíveis por CNPJ/CPF do Sublojista para registro na B3/CERC e liquidação no SLC',
    roleDescription:
      'Governa transações capturadas por Subcredenciadores (PayFacs) e Marketplaces. Garante que tanto na autorização online quanto no arquivo Outgoing saiam o ID da Subcredenciadora registrado na bandeira e o CPF/CNPJ real do sublojista final, além de calcular o Split de MDR e repasse.',
    inboundData: ['Cadastro do Sublojista (CNPJ/CPF, CEP, Cidade, MCC)', 'PayFac ID / Sponsored Merchant ID', 'Regras de Split'],
    outboundData: [
      'Visa: TCR E (Payment Facilitator ID + Sub-Merchant ID + Documento Fiscal)',
      'Mastercard: MTI 1240 DE 48 com PDS 0176 (Payment Facilitator) + PDS 0208 (Sub-Merchant) + PDS 0220 (CNPJ/CPF)',
      'Elo: Registro 02 (Campos de Subcredenciador) + Registro 01 (CNPJ/CPF do Ponto de Venda)',
    ],
    relatedOutgoingTables: [
      { brand: 'visa', tableId: 'visa-tcre', label: 'Visa TCR E (PayFac & Subcredenciador)' },
      { brand: 'elo', tableId: 'elo-reg02', label: 'Elo Registro 02 (Dados do Subcredenciador)' },
      { brand: 'mastercard', tableId: 'mc-1240-payfac-token', label: 'Mastercard PDS 0176 & PDS 0208 (PayFac)' },
    ],
    slaAndLatency: 'Enriquecimento síncrono < 5ms na 0100 e batch diário no Outgoing',
    failureModeAndRecovery:
      'Se o PayFac ID não estiver registrado na Bandeira ou faltar o TCR E / PDS 0176 / Reg 02, a Bandeira aplica multa de BRAM/GBPP ou rejeita a transação no clearing.',
    auditReportsAndLogs: ['Relatório de Conformidade de Subcredenciadores', 'Batimento de Split vs Agenda Registradora'],
  },
  {
    id: 'srv-kms-keyloader',
    code: 'SRV-Z2-06',
    name: 'Servidor KMS, Key Loader (Sala-Cofre) & Rotação Dinâmica 0800',
    zoneId: 'z2_acquirer',
    zoneLabel: 'Zona 2 · Core Adquirente (PCI CDE)',
    phase: 'online',
    brands: ['visa', 'mastercard', 'elo', 'amex'],
    vendorOrStandard: 'PCI PIN Security / ANSI X9.24 TR-31 & TR-34 · Thales / Futurex Key Management System',
    protocolSummary: 'Injeção Remota de Chaves (RKL TR-34) nos Pinpads + Troca Online de ZPK via MTI 0800/0810',
    portAndFraming: 'Key Blocks TR-31 (AES/TDES) + Mensagens ISO 8583 MTI 0800 (DE 70 = 101/161 Key Exchange + DE 53/DE 96)',
    cryptoAndHsm: 'Custódia Dual Control & Split Knowledge de ZMK (Zone Master Key), BDK (Base Derivation Key) e ZPK (Zone PIN Key)',
    roleDescription:
      'Responsável pelo ciclo de vida das chaves criptográficas. Injeta a chave inicial DUKPT (IPEK derivada da BDK) nos terminais POS/Pinpads e executa a rotação periódica da ZPK (Zone PIN Key) com a Visa, Mastercard e Elo sem derrubar o tráfego de produção.',
    inboundData: ['Cerimônia de Chaves (Custodiantes 1, 2 e 3) + Pedidos de Rotação MTI 0800 da Bandeira'],
    outboundData: ['IPEK injetada no Pinpad + Nova ZPK ativa sob LMK no HSM Thales PayShield + Key Check Value (KCV)'],
    relatedOutgoingTables: [
      { brand: 'visa', tableId: 'visa-tcr0', label: 'Visa TCR 0 (Integridade de captura com senha)' },
    ],
    slaAndLatency: 'Rotação de ZPK (0800/0810) executada em < 150ms sem perda de pacotes',
    failureModeAndRecovery:
      'Se o KCV (Key Check Value) calculado no HSM divergir do enviado pela Bandeira no 0800, o KMS faz rollback imediato para a ZPK anterior e dispara alerta crítico de SOC/Criptografia.',
    auditReportsAndLogs: ['Relatório de Auditoria PCI PIN Security', 'Log de Troca de Chaves 0800/0810 (KCV Match)'],
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
  {
    id: 'srv-brand-stip',
    code: 'SRV-Z3-06',
    name: 'Motor Stand-In Processing (STIP) & Fila de Advice 0120 / 0121',
    zoneId: 'z3_brand_edge',
    zoneLabel: 'Zona 3 · Borda & Malha das Bandeiras',
    phase: 'online',
    brands: ['visa', 'mastercard', 'elo', 'amex'],
    vendorOrStandard: 'Visa STIP / CAS · Mastercard Stand-In · Elo Stand-In Processing',
    protocolSummary: 'Interceptação automática na malha da Bandeira em caso de Timeout/Indisponibilidade do Emissor',
    portAndFraming: 'Responde MTI 0110 para a Adquirente e enfileira MTI 0120 (Authorization Advice) para o Emissor',
    cryptoAndHsm: 'HSM da própria Bandeira pode validar CVV/iCVV, ARQC EMV e CAVV em Stand-In quando o Emissor delega as chaves (On-Behalf Services)',
    roleDescription:
      'Garante alta disponibilidade do arranjo mesmo quando o Banco Emissor cai ou sofre manutenção. Se o Switch do Emissor não responder à 0100 dentro de ~1.5s a 2.0s, o STIP da Bandeira avalia parâmetros de risco/limite por BIN e responde a 0110 para a Adquirente. Assim que o Emissor volta ao ar, o STIP drena a fila enviando MTI 0120 (Advice) para recompor o saldo/Hold.',
    inboundData: ['MTI 0100 que sofreu Timeout ou recusa de link na perna do Emissor'],
    outboundData: [
      'Para a Adquirente: MTI 0110 (Aprovada/Negada em Stand-In, com TID/Banknet/NSU normal)',
      'Para o Emissor (após recuperação): Fila de MTI 0120 / 0121 (Stand-In Advice)',
    ],
    relatedOutgoingTables: [
      { brand: 'visa', tableId: 'visa-tcr0', label: 'Visa TCR 0 (Authorization Source Code = STIP)' },
      { brand: 'mastercard', tableId: 'mc-1240-base', label: 'Mastercard MTI 1240 ( Presentment de venda aprovada em STIP)' },
    ],
    slaAndLatency: 'Acionamento automático após ~1.500ms a 2.000ms sem resposta do Emissor',
    failureModeAndRecovery:
      'Vendas aprovadas em STIP têm proteção garantida à Adquirente desde que enviadas corretamente no Outgoing dentro do prazo.',
    auditReportsAndLogs: ['Relatório de Transações em Stand-In (STIP)', 'Fila de Drenagem de Advices 0120/0121'],
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

export const PACKET_HOPS: PacketHopSpec[] = [
  {
    hopNumber: 1,
    code: 'SALTO #01 · CAPTURA ➔ GATEWAY/SWITCH',
    phase: 'online',
    title: 'Terminal POS / SoftPOS / Checkout envia Captura Cifrada para o Switch da Adquirente',
    fromServerCode: 'SRV-Z1-01',
    fromServerName: 'Terminal POS / Pinpad / Checkout',
    toServerCode: 'SRV-Z2-01',
    toServerName: 'Switch Autorizador ISO 8583',
    cableCode: 'CABO #01',
    latencyOrWindow: '15ms a 45ms (TLS 1.3)',
    whatChangesInsideServer:
      'O API Gateway termina o TLS 1.3, valida o certificado mTLS / Attestation MPoC e entrega o payload ao Switch Autorizador, que identifica o BIN e prepara a tradução de senha.',
    wireRequestDump:
      'TLS1.3 POST /v1/authorize | MTI=0100 DE2=411111******1111 DE3=003000 DE4=000000015000 (R$ 150,00) DE22=051 (Chip+PIN) DE52=A94F81C02B7E1190 (DUKPT) DE53=FFFF9876540000E00001 (KSN) DE55=9F26084A1B9C00112233449F270180950500000080009F3602004B',
    wireResponseDump:
      'ACK Interno gRPC ➔ Switch inicia Roteamento por BIN (411111 = Visa Crédito Doméstico Brasil · Moeda 986)',
    criticalFieldsToAudit: ['DE 22 (POS Entry Mode)', 'DE 52 + DE 53 (PIN Block DUKPT + KSN)', 'DE 55 (Tags EMV 9F26, 95, 9F36)'],
  },
  {
    hopNumber: 2,
    code: 'SALTO #02 · AUTENTICAÇÃO 3DS 2.2 (E-COMMERCE)',
    phase: 'online',
    title: '3DS Server (MPI) autentica junto ao Directory Server (DS) e ACS do Emissor',
    fromServerCode: 'SRV-Z1-03',
    fromServerName: 'Checkout + 3DS Server (3DSS)',
    toServerCode: 'SRV-Z3-01',
    toServerName: 'Directory Server (DS) ➔ ACS Emissor',
    cableCode: 'CABO #02',
    latencyOrWindow: '350ms a 900ms (Frictionless)',
    whatChangesInsideServer:
      'O ACS do Emissor avalia o risco do device/portador, aprova sem desafio (Frictionless) ou via biometria no App e assina o criptograma CAVV v7/v9 (Visa/Elo) ou AAV (Mastercard) no HSM Emissor.',
    wireRequestDump:
      'JWE/JSON AReq {"messageType":"AReq","messageVersion":"2.2.0","acctNumber":"411111******1111","purchaseAmount":"15000","purchaseCurrency":"986","deviceChannel":"02","browserIP":"177.84.12.9"}',
    wireResponseDump:
      'JWE/JSON ARes {"messageType":"ARes","transStatus":"Y","eci":"05","authenticationValue":"AAABBZGQFhI5VniQEjQAAAAAAA=","dsTransID":"f38a9b12-4d2c-4110-9a1b-88291004c112"}',
    criticalFieldsToAudit: ['ECI (05/06 ou SLI 210/212)', 'CAVV / AAV (28 chars Base64 / 40 Hex)', 'dsTransID (UUID 36 pos)'],
  },
  {
    hopNumber: 3,
    code: 'SALTO #03 · TRADUÇÃO DE PIN BLOCK NO HSM (:1500)',
    phase: 'online',
    title: 'Switch Autorizador chama o HSM Thales PayShield 10k para traduzir DUKPT ➔ ZPK',
    fromServerCode: 'SRV-Z2-01',
    fromServerName: 'Switch Autorizador ISO 8583',
    toServerCode: 'SRV-Z2-02',
    toServerName: 'HSM Adquirente (Thales PayShield 10k)',
    cableCode: 'CABO #03',
    latencyOrWindow: '1.2ms (Socket Interno :1500)',
    whatChangesInsideServer:
      'Dentro do módulo físico FIPS 140-3 Level 3, o PayShield deriva a chave da transação a partir da BDK + KSN, decifra o PIN Block do terminal e o re-cifra imediatamente sob a ZPK ativa da Bandeira.',
    wireRequestDump:
      'LEN=0042 HDR=0001 CMD="G0" BDK=U1A9982... ZPK_DEST=U8B7712... KSN_DESC=609 KSN=FFFF9876540000E00001 PINBLOCK_IN=A94F81C02B7E1190 FMT_IN=01 FMT_OUT=01 PAN12=111111111111',
    wireResponseDump:
      'LEN=001E HDR=0001 RSP="G1" ERR="00" (OK) PIN_LEN=04 PINBLOCK_ZPK_OUT=7C3E9011B482FA05 FMT_OUT=01',
    criticalFieldsToAudit: ['Error Code "00" no comando G1/CB/CJ', 'Sincronia do KCV da ZPK com a Bandeira'],
  },
  {
    hopNumber: 4,
    code: 'SALTO #04 · SWITCH ➔ APPLIANCE DE BORDA (EAS / MIP / STI)',
    phase: 'online',
    title: 'Switch Autorizador dispara MTI 0100 pelo Socket TCP Persistente da Bandeira',
    fromServerCode: 'SRV-Z2-01',
    fromServerName: 'Switch Autorizador ISO 8583',
    toServerCode: 'SRV-Z3-02',
    toServerName: 'Visa EAS / Mastercard MIP / Elo STI',
    cableCode: 'CABO #04',
    latencyOrWindow: '40ms a 110ms (MPLS Dedicado)',
    whatChangesInsideServer:
      'O appliance de borda (EAS/MIP/STI) valida o framing de 2 bytes Big-Endian e o header da rede, registra o timestamp de entrada na malha global (VIP/Banknet/Elo) e roteia ao cofre de tokens e ao Emissor.',
    wireRequestDump:
      'LEN=014A [2B Big-Endian] + HDR_VIP=16010200... + MTI=F0F1F0F0 (0100 EBCDIC) + BITMAP=F23E448128E09000 + DE2=411111******1111 + DE4=000000015000 + DE11=849201 + DE22=051 + DE37=631810849201 + DE42=000123456789012 + DE49=986 + DE52=7C3E9011B482FA05 + DE55=9F26084A1B...',
    wireResponseDump:
      'Aguardando retorno 0110 do Emissor (SLA máximo no socket: 2.500ms)',
    criticalFieldsToAudit: ['DE 11 (STAN)', 'DE 37 (RRN 12 pos)', 'DE 42 (Merchant ID)', 'DE 49 (986 BRL)'],
  },
  {
    hopNumber: 5,
    code: 'SALTO #05 · DETOKENIZAÇÃO NA MALHA (VTS / MDES / ELO TOKEN)',
    phase: 'online',
    title: 'Cofre de Tokens da Bandeira valida TAVV e converte DPAN ➔ FPAN para o Emissor',
    fromServerCode: 'SRV-Z3-02',
    fromServerName: 'Malha VIP / Banknet / Elo',
    toServerCode: 'SRV-Z3-01',
    toServerName: 'Cofre VTS / MDES / Elo Token',
    cableCode: 'CABO #07',
    latencyOrWindow: '4ms a 8ms (In-Flight na Bandeira)',
    whatChangesInsideServer:
      'Se a compra veio de Apple Pay, Google Pay ou Token COF, o VTS/MDES valida o criptograma dinâmico TAVV no HSM da Bandeira, substitui o Token (DPAN) pelo cartão real (FPAN) no DE 2 e anexa o PAR (29 chars).',
    wireRequestDump:
      'IN-FLIGHT 0100: DPAN=498765******9012 + TAVV=8F9102A4... + TRID=40010030273 (Apple Pay / Wallet)',
    wireResponseDump:
      'OUT-TO-ISSUER 0100: FPAN=411111******1111 (Real) + TokenAssurance=05 + PAR=V0010013820194827162534891023 + TAVV_Validation=PASS',
    criticalFieldsToAudit: ['PAR (29 caracteres alfanuméricos)', 'Resultado de validação do TAVV', 'TRID (Token Requestor ID)'],
  },
  {
    hopNumber: 6,
    code: 'SALTO #06 · APROVAÇÃO NO EMISSOR + HSM EMISSOR (0110)',
    phase: 'online',
    title: 'Switch do Emissor valida ARQC/PIN/CAVV no HSM, sensibiliza Hold e devolve 0110',
    fromServerCode: 'SRV-Z3-02',
    fromServerName: 'Borda da Bandeira (EAS / MIP / STI)',
    toServerCode: 'SRV-Z4-01',
    toServerName: 'Switch Autorizador + HSM do Emissor',
    cableCode: 'CABO #07',
    latencyOrWindow: '180ms a 650ms (RTT Emissor)',
    whatChangesInsideServer:
      'O HSM do Emissor valida o ARQC EMV com a chave MDK-AC, calcula o ARPC (Tag 91) para o chip confirmar que a resposta veio do banco real, verifica o PIN com a PVK, reserva o saldo (Hold) e a Bandeira anexa o TID (DE 62.2) / Banknet Ref (DE 63).',
    wireRequestDump:
      '0100 EMISSOR: FPAN=411111******1111 | Valor=R$ 150,00 | ARQC=4A1B9C0011223344 | ATC=004B | PIN_ISSUER_ZPK=91B2C3D4E5F60718',
    wireResponseDump:
      '0110 APROVADA: DE38="A94K21" (AuthCode) | DE39="00" (Approved) | DE55_Tag91="88F1029A44B10010" (ARPC) | Visa DE62.2="306318294011284" (TID 15 pos) | MC DE63="MCS84920121114" (Banknet + MMDD)',
    criticalFieldsToAudit: [
      'DE 39 = 00',
      'DE 38 (AuthCode 6 chars)',
      'Visa DE 62.2 (TID 15 dígitos)',
      'Mastercard DE 63 (Banknet Ref + MMDD)',
      'Elo NSU (12 dígitos)',
    ],
  },
  {
    hopNumber: 7,
    code: 'SALTO #07 · MOTOR OUTGOING ➔ APPLIANCE DE CLEARING (D+0)',
    phase: 'clearing',
    title: 'Servidor Gerador de Outgoing empacota o Lote Físico (.CTF / .IPM / .TXT / .CAS)',
    fromServerCode: 'SRV-Z2-03',
    fromServerName: 'Servidor Gerador de Outgoing',
    toServerCode: 'SRV-Z3-02',
    toServerName: 'Visa EP747/DEX · MC MFE/GCMS · Elo SFTP',
    cableCode: 'CABO #08',
    latencyOrWindow: 'Janelas Batch D+0 (11h, 15h, 19h, 00h)',
    whatChangesInsideServer:
      'O Motor Outgoing lê a 0110 capturada no Ledger, calcula o ARN de 23 dígitos (com dígito Luhn), monta os registros de 168B (Visa/Elo) ou 1014B RDW (Mastercard) preservando o TID/Banknet/NSU e fecha o Trailer com checksum.',
    wireRequestDump:
      'VISA .CTF (168B):\n' +
      '9000412345... [TC 90 Header]\n' +
      '0500411111******111174123456318123456789012...000000015000986...A94K21 [TC 05 TCR 0]\n' +
      '0502...BR...1201... [TC 05 TCR 2 Brasil]\n' +
      '0505306318294011284... [TC 05 TCR 5 com TID 15 pos]\n' +
      '050705...004B...4A1B9C0011223344 [TC 05 TCR 7 EMV]\n' +
      '9200...000000000015000 [TC 92 File Trailer]',
    wireResponseDump:
      'EP747 / MFE T112 / Elo SFTP: "FILE ACCEPTED · 0 SYNTAX ERRORS · SHA-256 VERIFIED"',
    criticalFieldsToAudit: [
      'ARN (23 dígitos com Luhn válido)',
      'Persistência exata do TID (TCR 5) / Banknet (DE 63) / NSU (Reg 01)',
      'Batimento centavo a centavo do Trailer (TC 92 / PDS 0301 / BZ)',
    ],
  },
  {
    hopNumber: 8,
    code: 'SALTO #08 · BANDEIRA ➔ INCOMING DO EMISSOR & CONCILIAÇÃO',
    phase: 'clearing',
    title: 'Bandeira calcula o Intercâmbio Oficial e entrega o Incoming ao Banco Emissor',
    fromServerCode: 'SRV-Z3-02',
    fromServerName: 'Visa Base II / Mastercard GCMS / Elo',
    toServerCode: 'SRV-Z4-02',
    toServerName: 'Servidor Incoming & Fatura do Emissor',
    cableCode: 'CABO #11',
    latencyOrWindow: 'Ciclos Overnight D+0 / D+1',
    whatChangesInsideServer:
      'O Base II / GCMS / Elo qualifica o Fee Program / IRD da transação, gera os relatórios financeiros para a Adquirente (VSS-110/140, T140/T461, 20-02) e entrega o arquivo Incoming para o Emissor dar baixa no Hold e postar na fatura.',
    wireRequestDump:
      'INCOMING EMISSOR: ARN=74123456318123456789012 | TID=306318294011284 | AuthCode=A94K21 | Gross=R$ 150,00 | Interchange=R$ 2,32 (1.55%Qualified) | Net_Issuer=R$ 147,68',
    wireResponseDump:
      'EMISSOR SHADOW POSTING: Hold #849201 Matched & Released ➔ Lançado na Fatura do Portador (Sem Disputa)',
    criticalFieldsToAudit: ['Qualificação da Tarifa (Qualified vs Downgrade EIRF)', 'Taxa de Matching Hold vs Incoming no Emissor'],
  },
  {
    hopNumber: 9,
    code: 'SALTO #09 · CONSTITUIÇÃO DE AGENDA NA REGISTRADORA (B3 / CERC / TAG)',
    phase: 'settlement',
    title: 'Adquirente registra a Unidade de Recebível (UR) e consulta travas/gravames',
    fromServerCode: 'SRV-Z2-04',
    fromServerName: 'Servidor de Conciliação & Liquidação',
    toServerCode: 'SRV-Z5-01',
    toServerName: 'Registradora de Recebíveis (B3 / CERC / TAG)',
    cableCode: 'CABO #12',
    latencyOrWindow: 'Madrugada D+1 (Pré-Grade SLC)',
    whatChangesInsideServer:
      'A Registradora valida o CNPJ/CPF do lojista/sublojista, atualiza o valor líquido da UR (Credenciadora + Arranjo + Data de Vencimento) e devolve para qual banco/conta (domicílio ou credor de trava) o pagamento deve ir.',
    wireRequestDump:
      'JSON/XML UR_CONSTITUICAO: {"cnpjCredenciadora":"01027058000191","cnpjUsuarioFinal":"12345678000199","codArranjo":"VISA_CRED","dtLiquidacao":"2026-12-14","vlrLiquidoConstituido":145.50}',
    wireResponseDump:
      'GRADE DOMICÍLIO B3/CERC: {"statusUR":"VALIDA","indGravame":"NAO","ispbDomicilio":"60701190","agencia":"0001","conta":"998877-6"}',
    criticalFieldsToAudit: ['CNPJ/CPF válido no PDS 0220 / Reg 01 / TCR E', 'Aplicação correta de gravames/cessões de agenda'],
  },
  {
    hopNumber: 10,
    code: 'SALTO #10 · LIQUIDAÇÃO FINANCEIRA NA CIP/SLC (NÚCLEA) & STR/BACEN',
    phase: 'settlement',
    title: 'Grades RSFN XML (ASLC026 / ASLC028 / ASLC031) liquidam o dinheiro no Banco Central',
    fromServerCode: 'SRV-Z2-04',
    fromServerName: 'Adquirente & Bandeiras (via RSFN)',
    toServerCode: 'SRV-Z5-02',
    toServerName: 'CIP / Núclea (SLC) ➔ Banco Central (STR)',
    cableCode: 'CABO #13',
    latencyOrWindow: 'Grade Oficial da Manhã SLC / STR',
    whatChangesInsideServer:
      'A Núclea (SLC) compensa multilateralmente todos os débitos dos Bancos Emissores contra os créditos das Adquirentes e envia a ordem líquida (LDL) para o STR do Banco Central transferir Reservas Bancárias e creditar a conta do Lojista.',
    wireRequestDump:
      '<DOC xmlns="http://www.bcb.gov.br/SPB/ASLC026.xsd">\n' +
      '  <BCMSG><IdentdEmissor>01027058</IdentdEmissor><IdentdDestinatario>04391007</IdentdDestinatario></BCMSG>\n' +
      '  <SISMSG><ASLC026><CodMsg>ASLC026</CodMsg><CNPJBaseCreddr>01027058</CNPJBaseCreddr><CNPJ_CPFPontoVenda>12345678000199</CNPJ_CPFPontoVenda><ISPBIF Liquid>60701190</ISPBIF Liquid><VlrLanc>145.50</VlrLanc></ASLC026></SISMSG>\n' +
      '</DOC>',
    wireResponseDump:
      'RSFN ASLC026R1 + STR LDL0004R2: "LIQUIDAÇÃO EFETIVADA NO STR · RESERVAS BANCÁRIAS TRANSFERIDAS"',
    criticalFieldsToAudit: ['Assinatura ICP-Brasil SEPRO', 'Ausência de rejeição ASLC026E / ASLC028E', 'Conciliação GL vs Extrato SLC'],
  },
];

export const FLOW_SCENARIO_HIGHLIGHTS: Record<
  string,
  {
    flowTitle: string;
    criticalServerIds: string[];
    criticalCableIds: string[];
    architecturalFocus: string;
  }
> = {
  'flow-1-pos-chip': {
    flowTitle: 'Fluxo 01 · Compra Presencial Chip EMV / NFC (Contato & Contactless)',
    criticalServerIds: [
      'srv-pos-pinpad',
      'srv-auth-switch',
      'srv-hsm-acquirer',
      'srv-visa-eas-dex',
      'srv-mc-mip-mfe',
      'srv-elo-sti-sftp',
      'srv-issuer-auth-hsm',
      'srv-outgoing-batch',
    ],
    criticalCableIds: ['link-01', 'link-03', 'link-04', 'link-05', 'link-06', 'link-07', 'link-08', 'link-09', 'link-10'],
    architecturalFocus:
      'Foco em DUKPT ➔ ZPK no HSM PayShield (:1500), validação do ARQC/ARPC no HSM Emissor e transporte íntegro do DE 55 para o Visa TCR 7 / Elo Reg 07 / Mastercard DE 55 no MTI 1240.',
  },
  'flow-2-ecommerce-3ds': {
    flowTitle: 'Fluxo 02 · E-Commerce Autenticado com EMV 3DS 2.2 (CAVV / AAV)',
    criticalServerIds: [
      'srv-3ds-mpi',
      'srv-token-ds',
      'srv-auth-switch',
      'srv-visa-eas-dex',
      'srv-mc-mip-mfe',
      'srv-elo-sti-sftp',
      'srv-issuer-auth-hsm',
      'srv-outgoing-batch',
    ],
    criticalCableIds: ['link-01', 'link-02', 'link-04', 'link-05', 'link-06', 'link-07', 'link-08', 'link-09', 'link-10'],
    architecturalFocus:
      'Foco no Caminho 3DS (3DSS ➔ Directory Server ➔ ACS Emissor) gerando ECI + CAVV/AAV + dsTransID e sua persistência obrigatória no Visa TCR 5 + TCR D, Elo Reg 05 e Mastercard PDS 0052/0185/0186.',
  },
  'flow-3-parcelado': {
    flowTitle: 'Fluxo 03 · Compra Parcelada Loja (Sem Juros) & Emissor no Brasil',
    criticalServerIds: [
      'srv-pos-pinpad',
      'srv-auth-switch',
      'srv-outgoing-batch',
      'srv-visa-eas-dex',
      'srv-mc-mip-mfe',
      'srv-elo-sti-sftp',
      'srv-registradora-b3',
      'srv-cip-slc-str',
    ],
    criticalCableIds: ['link-01', 'link-08', 'link-09', 'link-10', 'link-12', 'link-13'],
    architecturalFocus:
      'Foco nas extensões nacionais brasileiras: Visa TCR 2 Brasil (Pos 40-41 = Parcelas+10), Mastercard PDS 0195 (Installment Data Brasil), Elo Reg 01 + Reg 02 (990-995) e liquidação de agendas na B3/CERC e CIP/SLC.',
  },
  'flow-4-token': {
    flowTitle: 'Fluxo 04 · Carteiras Digitais (Apple Pay / Google Pay) & Network Token (VTS / MDES)',
    criticalServerIds: [
      'srv-softpos-mpoc',
      'srv-3ds-mpi',
      'srv-token-ds',
      'srv-auth-switch',
      'srv-issuer-auth-hsm',
      'srv-outgoing-batch',
    ],
    criticalCableIds: ['link-01', 'link-04', 'link-05', 'link-06', 'link-07', 'link-08', 'link-09', 'link-10'],
    architecturalFocus:
      'Foco no Cofre de Tokens na Zona 3 (VTS / MDES / Elo Token) validando o criptograma TAVV em trânsito, destokenizando DPAN ➔ FPAN para o Emissor e gravando o PAR (29 pos) no TCR 5 / PDS 0207 / Reg 02.',
  },
  'flow-5-payfac': {
    flowTitle: 'Fluxo 05 · Subcredenciador (PayFac), Marketplace & Split de Pagamento',
    criticalServerIds: [
      'srv-payfac-split',
      'srv-auth-switch',
      'srv-outgoing-batch',
      'srv-recon-fee-engine',
      'srv-registradora-b3',
      'srv-cip-slc-str',
    ],
    criticalCableIds: ['link-08', 'link-09', 'link-10', 'link-12', 'link-13'],
    architecturalFocus:
      'Foco no Servidor PayFac & Split (SRV-Z2-05) injetando o PayFac ID e o CNPJ/CPF do sublojista no Visa TCR E, Mastercard PDS 0176 + PDS 0208 + PDS 0220 e Elo Reg 01 + Reg 02, até a UR na B3/CERC e grade ASLC026.',
  },
  'flow-6-chargeback': {
    flowTitle: 'Fluxo 06 · Disputa, First Chargeback & Representment (Pós-Venda)',
    criticalServerIds: [
      'srv-issuer-incoming-disputes',
      'srv-visa-eas-dex',
      'srv-mc-mip-mfe',
      'srv-elo-sti-sftp',
      'srv-recon-fee-engine',
    ],
    criticalCableIds: ['link-08', 'link-09', 'link-10', 'link-11'],
    architecturalFocus:
      'Foco no fluxo reverso iniciado pela Plataforma de Disputas do Emissor (Visa VROL TC 15, Mastercard MCOM MTI 1442-450, Elo TE15) utilizando o ARN de 23 dígitos e o TID/Banknet/NSU.',
  },
};

export function OutgoingServerTopologyBlueprint({
  initialBrand = 'all',
  activeFlowId,
  onSelectTable,
}: {
  initialBrand?: TopologyBrandFilter;
  activeFlowId?: string;
  onSelectTable?: (brand: OutgoingBrandId, tableId: string) => void;
}) {
  const [zoomLevel, setZoomLevel] = useState<TopologyZoomLevel>('c2_servers');
  const [brandFilter, setBrandFilter] = useState<TopologyBrandFilter>(initialBrand);
  const [phaseFilter, setPhaseFilter] = useState<TopologyPhaseFilter>('all');
  const [selectedServer, setSelectedServer] = useState<ServerNodeSpec | null>(null);
  const [selectedCable, setSelectedCable] = useState<CableLinkSpec | null>(null);
  const [selectedFailureId, setSelectedFailureId] = useState<string>(FAILURE_SCENARIOS[0].id);
  const [selectedHopIdx, setSelectedHopIdx] = useState<number>(0);
  const [scenarioLensId, setScenarioLensId] = useState<string>(activeFlowId || 'all');

  React.useEffect(() => {
    if (activeFlowId && FLOW_SCENARIO_HIGHLIGHTS[activeFlowId]) {
      setScenarioLensId(activeFlowId);
    }
  }, [activeFlowId]);

  const activeScenarioHighlight = useMemo(() => {
    if (scenarioLensId === 'all') return null;
    return FLOW_SCENARIO_HIGHLIGHTS[scenarioLensId] || null;
  }, [scenarioLensId]);

  const activeHop = useMemo(
    () => PACKET_HOPS[selectedHopIdx] || PACKET_HOPS[0],
    [selectedHopIdx]
  );

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
        {/* 5 Níveis de Zoom C4 + Packet Tracer */}
        <div className="xl:col-span-6 space-y-1.5">
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
            1. Nível de Zoom da Arquitetura (Modelo C4 + Packet Tracer)
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
            {[
              { id: 'c1_actors', code: 'ZOOM 1', label: '5 Atores & Tempos' },
              { id: 'c2_servers', code: 'ZOOM 2', label: '17 Servidores (PCI)' },
              { id: 'c2_packet_trace', code: 'PACKET TRACE', label: 'Salto a Salto (Wire)' },
              { id: 'c3_cables', code: 'ZOOM 3', label: '13 Cabos & HSM' },
              { id: 'c4_failures', code: 'ZOOM 4', label: 'Simulador Queda' },
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

      {/* Barra de Lente de Cenário Operacional (Sincronizada com os Fluxos de Outgoing) */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3 space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-300">
            🎯 4. Destacar Rota Crítica por Cenário Operacional (Ilumina os Servidores & Cabos Exatos do Fluxo)
          </span>
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'all', label: 'Malha Completa (17 Servidores)' },
              { id: 'flow-1-pos-chip', label: '01 · POS Chip EMV + PIN' },
              { id: 'flow-2-ecommerce-3ds', label: '02 · E-Commerce 3DS 2.2' },
              { id: 'flow-3-parcelado', label: '03 · Parcelado Brasil' },
              { id: 'flow-4-token', label: '04 · Token VTS / MDES' },
              { id: 'flow-5-payfac', label: '05 · Subcredenciador PayFac' },
              { id: 'flow-6-chargeback', label: '06 · Disputa / Chargeback' },
            ].map((sc) => {
              const active = scenarioLensId === sc.id;
              return (
                <button
                  key={sc.id}
                  type="button"
                  onClick={() => setScenarioLensId(sc.id)}
                  className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold transition-all ${
                    active
                      ? 'bg-amber-500 text-slate-950 border-amber-300 font-black shadow-sm'
                      : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-amber-500/40'
                  }`}
                >
                  {sc.label}
                </button>
              );
            })}
          </div>
        </div>

        {activeScenarioHighlight && (
          <div className="rounded-lg bg-amber-950/25 border border-amber-500/40 px-3.5 py-2.5 flex flex-col md:flex-row md:items-center md:justify-between gap-2 text-xs">
            <div>
              <span className="font-mono font-black text-amber-300 mr-2">
                [{activeScenarioHighlight.flowTitle}]
              </span>
              <span className="text-slate-200">{activeScenarioHighlight.architecturalFocus}</span>
            </div>
            <span className="px-2.5 py-1 rounded bg-amber-500/20 border border-amber-500/40 font-mono text-[10px] font-bold text-amber-200 shrink-0">
              {activeScenarioHighlight.criticalServerIds.length} Servidores &{' '}
              {activeScenarioHighlight.criticalCableIds.length} Cabos Destacados
            </span>
          </div>
        )}
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
                      const isCriticalInScenario =
                        activeScenarioHighlight?.criticalServerIds.includes(srv.id) ?? false;
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
                              : isCriticalInScenario
                              ? 'bg-amber-950/25 border-amber-400/80 ring-1 ring-amber-400/40 shadow-md'
                              : 'bg-slate-950/90 border-slate-800 hover:border-blue-500/50 hover:bg-slate-900/90'
                          }`}
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-1.5">
                                <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 font-mono text-[10px] font-black text-blue-300">
                                  {srv.code}
                                </span>
                                {isCriticalInScenario && (
                                  <span className="px-1.5 py-0.5 rounded bg-amber-500 text-slate-950 font-mono text-[9px] font-black">
                                    🎯 ROTA ATIVA
                                  </span>
                                )}
                              </div>
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
          PACKET TRACER — SIMULADOR SALTO A SALTO NO CABO COM WIRE DUMP REAL
         ===================================================================== */}
      {zoomLevel === 'c2_packet_trace' && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
                Packet Tracer · Jornada Física do Pacote em 10 Saltos (Do POS/3DS até o STR do Banco Central)
              </span>
              <p className="text-xs text-slate-400">
                Clique em qualquer Salto (#01 a #10) ou use os botões de avanço para ver o frame exato que entra no cabo, o que o Servidor/HSM transforma por dentro e o que sai.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedHopIdx((prev) => Math.max(0, prev - 1))}
                disabled={selectedHopIdx === 0}
                className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-40 border border-slate-700 text-xs font-bold text-slate-200"
              >
                ◀ Salto Anterior
              </button>
              <span className="px-2.5 py-1 rounded bg-blue-600/20 border border-blue-500/40 font-mono text-xs font-black text-blue-300">
                Salto #{activeHop.hopNumber} / {PACKET_HOPS.length}
              </span>
              <button
                type="button"
                onClick={() => setSelectedHopIdx((prev) => Math.min(PACKET_HOPS.length - 1, prev + 1))}
                disabled={selectedHopIdx === PACKET_HOPS.length - 1}
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-xs font-bold text-white"
              >
                Próximo Salto ▶
              </button>
            </div>
          </div>

          {/* Fita Conectada dos 10 Saltos */}
          <div className="flex flex-wrap items-center gap-1.5">
            {PACKET_HOPS.map((hop, idx) => {
              const isSel = idx === selectedHopIdx;
              return (
                <React.Fragment key={hop.hopNumber}>
                  <button
                    type="button"
                    onClick={() => setSelectedHopIdx(idx)}
                    className={`rounded-xl px-3 py-2 border text-left transition-all ${
                      isSel
                        ? 'bg-emerald-600 text-white border-emerald-300 shadow-lg shadow-emerald-950/60 scale-[1.02]'
                        : 'bg-slate-900/90 border-slate-800 text-slate-300 hover:border-emerald-500/50'
                    }`}
                  >
                    <div className="font-mono text-[10px] font-black">
                      #{String(hop.hopNumber).padStart(2, '0')} · {hop.cableCode}
                    </div>
                    <div className="text-[11px] font-bold truncate max-w-[155px]">
                      {hop.fromServerCode} ➔ {hop.toServerCode}
                    </div>
                  </button>
                  {idx < PACKET_HOPS.length - 1 && (
                    <span className="text-slate-600 font-bold text-xs">➔</span>
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Inspector do Salto Selecionado */}
          <div className="rounded-2xl border border-emerald-500/40 bg-slate-900/90 p-5 space-y-4 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/40 font-mono text-xs font-black text-emerald-300">
                    {activeHop.code}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 font-mono text-[11px] text-cyan-300">
                    {activeHop.cableCode} • {activeHop.latencyOrWindow}
                  </span>
                </div>
                <h4 className="text-base sm:text-lg font-black text-white mt-1.5">
                  {activeHop.title}
                </h4>
              </div>

              <div className="flex items-center gap-2 font-mono text-xs">
                <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-blue-300">
                  De: {activeHop.fromServerName}
                </span>
                <span className="text-emerald-400 font-black">➔</span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-emerald-300">
                  Para: {activeHop.toServerName}
                </span>
              </div>
            </div>

            {/* 3 Colunas: Wire Request ➔ O que muda dentro do Servidor ➔ Wire Response */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              <div className="lg:col-span-4 rounded-xl bg-black/80 border border-slate-800 p-3.5 space-y-2">
                <div className="text-[11px] font-mono font-black uppercase tracking-wider text-cyan-400">
                  📥 1. Frame de Entrada no Cabo (Request Wire Dump)
                </div>
                <pre className="font-mono text-[11px] text-cyan-200 whitespace-pre-wrap break-all leading-relaxed">
                  {activeHop.wireRequestDump}
                </pre>
              </div>

              <div className="lg:col-span-4 rounded-xl bg-blue-950/20 border border-blue-500/30 p-3.5 flex flex-col justify-between gap-3">
                <div className="space-y-2">
                  <div className="text-[11px] font-mono font-black uppercase tracking-wider text-blue-300">
                    ⚙️ 2. Transformação Dentro do Servidor / HSM
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    {activeHop.whatChangesInsideServer}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800/80 space-y-1">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-amber-300">
                    🔍 Campos Críticos para Auditar neste Salto:
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {activeHop.criticalFieldsToAudit.map((cf, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded bg-slate-950 border border-amber-500/30 font-mono text-[10px] text-amber-200"
                      >
                        {cf}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-4 rounded-xl bg-black/80 border border-slate-800 p-3.5 space-y-2">
                <div className="text-[11px] font-mono font-black uppercase tracking-wider text-emerald-400">
                  📤 3. Frame de Saída / Resposta (Response Wire Dump)
                </div>
                <pre className="font-mono text-[11px] text-emerald-300 whitespace-pre-wrap break-all leading-relaxed">
                  {activeHop.wireResponseDump}
                </pre>
              </div>
            </div>
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

                {(() => {
                  const matchedHop = PACKET_HOPS.find((h) => h.cableCode === selectedCable.code);
                  if (!matchedHop) return null;
                  return (
                    <div className="rounded-xl bg-black/80 border border-slate-800 p-4 space-y-2.5">
                      <div className="text-[11px] font-black uppercase tracking-wider text-cyan-300">
                        5. Wire Dump Real no Cabo ({matchedHop.code})
                      </div>
                      <div>
                        <div className="text-[10px] font-mono text-cyan-400 mb-1">
                          📥 REQUEST FRAME NO CABO:
                        </div>
                        <pre className="rounded-lg bg-slate-950 border border-slate-800 p-2.5 font-mono text-[10px] text-cyan-200 whitespace-pre-wrap break-all">
                          {matchedHop.wireRequestDump}
                        </pre>
                      </div>
                      <div>
                        <div className="text-[10px] font-mono text-emerald-400 mb-1">
                          📤 RESPONSE FRAME NO CABO:
                        </div>
                        <pre className="rounded-lg bg-slate-950 border border-slate-800 p-2.5 font-mono text-[10px] text-emerald-300 whitespace-pre-wrap break-all">
                          {matchedHop.wireResponseDump}
                        </pre>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
