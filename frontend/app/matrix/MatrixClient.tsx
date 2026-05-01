'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  CreditCard, Wifi, Layers, ShieldCheck, ShieldX,
  AlertTriangle, CheckCircle2, XCircle, ArrowDown,
  Store, Zap, Building2, Scale, TrendingDown, ChevronRight,
  Phone, RefreshCw, Globe,
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────

type Network = 'visa' | 'mc';

// ── Network config ────────────────────────────────────────────────────────────

const NET = {
  visa: {
    label: 'Visa',
    color: '#3b82f6',
    bg: 'rgba(59,130,246,0.08)',
    border: 'rgba(59,130,246,0.25)',
    accent: 'text-blue-400',
    clearingFile: 'BASE II',
    authSystem: 'VisaNet / VIP',
    settlementSystem: 'VSS',
    feeMessage: 'TC10 no BASE II',
  },
  mc: {
    label: 'Mastercard',
    color: '#ef4444',
    bg: 'rgba(239,68,68,0.08)',
    border: 'rgba(239,68,68,0.25)',
    accent: 'text-red-400',
    clearingFile: 'IPM',
    authSystem: 'Banknet / Dual Message',
    settlementSystem: 'MCBS',
    feeMessage: 'MTI 1740 via GCMS',
  },
} as const;

// ── Cascade ───────────────────────────────────────────────────────────────────

const CASCADE = {
  visa: [
    {
      step: 1,
      label: 'Produto',
      sublabel: 'PID — Product ID',
      icon: CreditCard,
      color: '#6366f1',
      desc: 'O PID identifica o produto Visa no clearing e define o "teto" da taxa. Enviado pelo emissor no campo AFS da resposta de autorização.',
      values: [
        { v: 'Electron',           id: 'FE', badge: 'básico' },
        { v: 'Classic',            id: 'F^', badge: 'base' },
        { v: 'Gold',               id: 'FN', badge: 'médio' },
        { v: 'Platinum',           id: 'FP', badge: 'alto' },
        { v: 'Signature',          id: 'FS', badge: 'premium' },
        { v: 'Infinite',           id: 'FI', badge: 'premium+' },
        { v: 'Business',           id: 'FB', badge: 'corporativo' },
        { v: 'Débito Visa',        id: 'DV', badge: 'regulado' },
      ],
      campo: 'Field 61.5 (AFS — Account Funding Source) no BASE II',
      downgrade: 'PID ausente ou incorreto → taxa de fallback Classic (F^), independente do produto real.',
    },
    {
      step: 2,
      label: 'Canal',
      sublabel: 'POS Entry Mode — Field 22',
      icon: Layers,
      color: '#0ea5e9',
      desc: 'Como a transação foi capturada na VisaNet. Define modalidade de risco e, junto com o PID, determina a faixa de taxa.',
      values: [
        { v: 'Chip EMV',           id: '05', badge: 'preferencial' },
        { v: 'Contactless NFC',    id: '07', badge: 'preferencial' },
        { v: 'E-commerce',         id: '81', badge: 'risco CNP' },
        { v: 'Mag stripe',         id: '90', badge: 'risco alto' },
        { v: 'Fallback trilha',    id: '80', badge: 'penalizado' },
        { v: 'MOTO / Keyed',       id: '01', badge: 'risco alto' },
      ],
      campo: 'Field 22 (POS Entry Mode) no BASE II',
      downgrade: 'Field 22 = 80 (fallback) → taxa máxima de trilha + liability total no adquirente.',
    },
    {
      step: 3,
      label: 'Autenticação',
      sublabel: 'ECI — Field 61 do BASE II',
      icon: ShieldCheck,
      color: '#10b981',
      desc: 'Visa Secure (3DS 2.x). O ECI é determinado pelo ACS do emissor e deve ser preservado do gateway até o arquivo BASE II.',
      values: [
        { v: 'ECI 05 — autenticado', id: '05', badge: '−taxa + liability shift' },
        { v: 'ECI 06 — frictionless', id: '06', badge: 'shift parcial' },
        { v: 'ECI 07 — sem auth',    id: '07', badge: '+taxa, liability adq.' },
      ],
      campo: 'ECI → Field 61 (POS Data) | CAVV → Field 126.9 no BASE II',
      downgrade: 'CAVV enviado mas ECI ausente no BASE II → emissor classifica como ECI 07 na liquidação.',
    },
    {
      step: 4,
      label: 'MCC',
      sublabel: 'Field 26 — Card Acceptor Business Code',
      icon: Store,
      color: '#f59e0b',
      desc: 'Merchant Category Code — mesma tabela ISO 18245 nas duas bandeiras. MCCs de baixo risco têm taxa preferencial independente do produto.',
      values: [
        { v: '5411 Supermercados',  id: 'pref', badge: 'preferencial' },
        { v: '5541 Combustível',    id: 'pref', badge: 'preferencial' },
        { v: '8211 Educação',       id: 'pref', badge: 'preferencial' },
        { v: '9311 Governo',        id: 'esp',  badge: 'especial' },
        { v: '5999 Varejo geral',   id: 'std',  badge: 'padrão' },
      ],
      campo: 'Field 26 (Card Acceptor Business Code) no BASE II — ISO 18245',
      downgrade: 'MCC incorreto no cadastro do lojista = perde taxa preferencial + risco de compliance Visa.',
    },
    {
      step: 5,
      label: 'Status Regulatório',
      sublabel: 'BACEN Circular 3.887/2018',
      icon: Scale,
      color: '#8b5cf6',
      desc: 'Emissores regulados pelo BACEN têm teto de 0,50% na média ponderada do portfólio. O SETTL_FLAG no clearing indica se a transação entra no cálculo regulatório.',
      values: [
        { v: 'Regulado — grandes bancos', id: '≤0,50%', badge: 'teto BACEN' },
        { v: 'Não-regulado — fintechs',   id: 'livre',  badge: 'mercado' },
      ],
      campo: 'AFS / SETTL_FLAG — Field 61 no BASE II define o netting regulatório',
      downgrade: 'Simular produto regulado como não-regulado = projeção de custo incorreta no MDR.',
    },
  ],
  mc: [
    {
      step: 1,
      label: 'Produto',
      sublabel: 'Product Code — DE 63 Tag 2',
      icon: CreditCard,
      color: '#6366f1',
      desc: 'O Product Code identifica o produto Mastercard no IPM. Enviado pelo emissor no PDS Tag 2 dentro do DE 63 da mensagem de clearing.',
      values: [
        { v: 'Maestro',            id: 'MAE', badge: 'básico' },
        { v: 'Standard',           id: '101', badge: 'base' },
        { v: 'Gold / Enhanced',    id: '102', badge: 'médio' },
        { v: 'Platinum / World',   id: '103', badge: 'alto' },
        { v: 'World Elite',        id: '104', badge: 'premium' },
        { v: 'Corporate',          id: 'MCO', badge: 'corporativo' },
        { v: 'Pré-pago',           id: 'MPP', badge: 'regulado' },
        { v: 'Débito MC',          id: 'MDM', badge: 'regulado' },
      ],
      campo: 'DE 63 Tag 2 (Product Code / PDS) no IPM — identificado no clearing',
      downgrade: 'Product Code ausente no IPM → taxa de fallback Standard (101), independente do produto real.',
    },
    {
      step: 2,
      label: 'Canal',
      sublabel: 'POS Entry Mode — DE 22',
      icon: Layers,
      color: '#0ea5e9',
      desc: 'Como a transação foi capturada na Banknet. Mesma lógica da Visa, mas o campo é DE 22 no IPM e integrado com o Dual Message System.',
      values: [
        { v: 'Chip EMV',           id: '05', badge: 'preferencial' },
        { v: 'Contactless NFC',    id: '07', badge: 'preferencial' },
        { v: 'E-commerce',         id: '81', badge: 'risco CNP' },
        { v: 'Mag stripe',         id: '90', badge: 'risco alto' },
        { v: 'Fallback trilha',    id: '80', badge: 'penalizado' },
        { v: 'MOTO / Keyed',       id: '01', badge: 'risco alto' },
      ],
      campo: 'DE 22 (POS Entry Mode) no IPM',
      downgrade: 'DE 22 = 80 (fallback) → taxa máxima + liability total no adquirente. MC audita via MFMP.',
    },
    {
      step: 3,
      label: 'Autenticação',
      sublabel: 'ECI — DE 48 subfield 42',
      icon: ShieldCheck,
      color: '#10b981',
      desc: 'Mastercard Identity Check (3DS 2.x). O ECI e o AAV (equivalente MC ao CAVV Visa) devem chegar juntos no IPM. Campo é DE 48.42, não Field 61.',
      values: [
        { v: 'ECI 05 — autenticado', id: '05', badge: '−taxa + liability shift' },
        { v: 'ECI 06 — frictionless', id: '06', badge: 'shift parcial' },
        { v: 'ECI 07 — sem auth',    id: '07', badge: '+taxa, liability adq.' },
      ],
      campo: 'ECI → DE 48.42 | AAV (Accountholder Auth Value) → DE 48.43 no IPM',
      downgrade: 'ECI no DE 48.42 ausente ou AAV não transmitido → Non-Authentication Fee (2AB3006M) cobrado do adquirente.',
    },
    {
      step: 4,
      label: 'MCC',
      sublabel: 'DE 26 — Merchant Type',
      icon: Store,
      color: '#f59e0b',
      desc: 'Mesmo código ISO 18245 da Visa. A Mastercard chama de "Merchant Type" no DE 26 do IPM. MCCs preferenciais têm tratamento diferenciado no Interchange Rate Designator.',
      values: [
        { v: '5411 Supermercados',  id: 'pref', badge: 'preferencial' },
        { v: '5541 Combustível',    id: 'pref', badge: 'preferencial' },
        { v: '8211 Educação',       id: 'pref', badge: 'preferencial' },
        { v: '9311 Governo',        id: 'esp',  badge: 'especial' },
        { v: '5999 Varejo geral',   id: 'std',  badge: 'padrão' },
      ],
      campo: 'DE 26 (Merchant Type / MCC) no IPM — ISO 18245 (mesma tabela)',
      downgrade: 'MCC incorreto no IPM = perde IRD preferencial + risco de audit pelo MDMP.',
    },
    {
      step: 5,
      label: 'Status Regulatório',
      sublabel: 'BACEN Circular 3.887/2018',
      icon: Scale,
      color: '#8b5cf6',
      desc: 'Mesma regra BACEN. O SETTL_FLAG no DE 63 do IPM indica se a transação entra no cálculo do teto de 0,50%. Mastercard usa o IRD (Interchange Rate Designator) para mapear a taxa final.',
      values: [
        { v: 'Regulado — grandes bancos', id: '≤0,50%', badge: 'teto BACEN' },
        { v: 'Não-regulado — fintechs',   id: 'livre',  badge: 'mercado' },
      ],
      campo: 'SETTL_FLAG — DE 63 Tag 5 no IPM | IRD define a taxa aplicada pelo MCBS',
      downgrade: 'IRD incorreto no IPM = taxa errada cobrada + divergência na fatura MCBS.',
    },
  ],
};

// ── Matrix tables ─────────────────────────────────────────────────────────────

type MatrixRow = {
  produto: string; pid: string;
  chip: string; nfc: string;
  ecomm05: string; ecomm07: string;
  moto: string; mag: string;
  regulado: boolean;
};

const MATRIX: Record<Network, MatrixRow[]> = {
  visa: [
    { produto: 'Débito Visa',  pid: 'DV',  chip: '0,40%', nfc: '0,40%', ecomm05: '0,50%', ecomm07: '0,50%', moto: '—',     mag: '0,50%', regulado: true  },
    { produto: 'Electron',     pid: 'FE',  chip: '0,36%', nfc: '0,36%', ecomm05: '0,50%', ecomm07: '0,50%', moto: '—',     mag: '0,50%', regulado: true  },
    { produto: 'Classic',      pid: 'F^',  chip: '0,36%', nfc: '0,36%', ecomm05: '0,50%', ecomm07: '0,80%', moto: '0,80%', mag: '0,80%', regulado: true  },
    { produto: 'Gold',         pid: 'FN',  chip: '0,50%', nfc: '0,50%', ecomm05: '0,65%', ecomm07: '1,10%', moto: '1,10%', mag: '1,10%', regulado: false },
    { produto: 'Platinum',     pid: 'FP',  chip: '1,20%', nfc: '1,20%', ecomm05: '1,40%', ecomm07: '1,80%', moto: '1,80%', mag: '1,80%', regulado: false },
    { produto: 'Signature',    pid: 'FS',  chip: '1,50%', nfc: '1,50%', ecomm05: '1,70%', ecomm07: '2,20%', moto: '2,20%', mag: '2,20%', regulado: false },
    { produto: 'Infinite',     pid: 'FI',  chip: '1,80%', nfc: '1,80%', ecomm05: '2,00%', ecomm07: '2,50%', moto: '2,50%', mag: '2,50%', regulado: false },
    { produto: 'Business',     pid: 'FB',  chip: '0,90%', nfc: '0,90%', ecomm05: '1,00%', ecomm07: '1,40%', moto: '1,40%', mag: '1,40%', regulado: false },
  ],
  mc: [
    { produto: 'Débito MC',        pid: 'MDM', chip: '0,40%', nfc: '0,40%', ecomm05: '0,50%', ecomm07: '0,50%', moto: '—',     mag: '0,50%', regulado: true  },
    { produto: 'Maestro',          pid: 'MAE', chip: '0,36%', nfc: '0,36%', ecomm05: '—',     ecomm07: '—',     moto: '—',     mag: '0,50%', regulado: true  },
    { produto: 'Standard',         pid: '101', chip: '0,36%', nfc: '0,36%', ecomm05: '0,50%', ecomm07: '0,80%', moto: '0,80%', mag: '0,80%', regulado: true  },
    { produto: 'Gold / Enhanced',  pid: '102', chip: '0,50%', nfc: '0,50%', ecomm05: '0,65%', ecomm07: '1,10%', moto: '1,10%', mag: '1,10%', regulado: false },
    { produto: 'Platinum / World', pid: '103', chip: '1,20%', nfc: '1,20%', ecomm05: '1,40%', ecomm07: '1,80%', moto: '1,80%', mag: '1,80%', regulado: false },
    { produto: 'World Elite',      pid: '104', chip: '1,80%', nfc: '1,80%', ecomm05: '2,00%', ecomm07: '2,50%', moto: '2,50%', mag: '2,50%', regulado: false },
    { produto: 'Corporate',        pid: 'MCO', chip: '0,90%', nfc: '0,90%', ecomm05: '1,00%', ecomm07: '1,40%', moto: '1,40%', mag: '1,40%', regulado: false },
    { produto: 'Pré-pago',         pid: 'MPP', chip: '0,40%', nfc: '0,40%', ecomm05: '0,50%', ecomm07: '0,50%', moto: '—',     mag: '0,50%', regulado: true  },
  ],
};

// ── Parcelamento ──────────────────────────────────────────────────────────────

type ParcRow = { produto: string; pid: string; vista: string; parc2a6: string; parc7a12: string };

const PARCELAMENTO: Record<Network, ParcRow[]> = {
  visa: [
    { produto: 'Classic',   pid: 'F^', vista: '0,36%', parc2a6: '0,50%', parc7a12: '0,65%' },
    { produto: 'Gold',      pid: 'FN', vista: '0,50%', parc2a6: '0,68%', parc7a12: '0,88%' },
    { produto: 'Platinum',  pid: 'FP', vista: '1,20%', parc2a6: '1,45%', parc7a12: '1,75%' },
    { produto: 'Signature', pid: 'FS', vista: '1,50%', parc2a6: '1,75%', parc7a12: '2,10%' },
    { produto: 'Infinite',  pid: 'FI', vista: '1,80%', parc2a6: '2,10%', parc7a12: '2,60%' },
    { produto: 'Business',  pid: 'FB', vista: '0,90%', parc2a6: '1,05%', parc7a12: '1,25%' },
  ],
  mc: [
    { produto: 'Standard',         pid: '101', vista: '0,36%', parc2a6: '0,50%', parc7a12: '0,65%' },
    { produto: 'Gold / Enhanced',  pid: '102', vista: '0,50%', parc2a6: '0,68%', parc7a12: '0,88%' },
    { produto: 'Platinum / World', pid: '103', vista: '1,20%', parc2a6: '1,45%', parc7a12: '1,75%' },
    { produto: 'World Elite',      pid: '104', vista: '1,80%', parc2a6: '2,10%', parc7a12: '2,60%' },
    { produto: 'Corporate',        pid: 'MCO', vista: '0,90%', parc2a6: '1,05%', parc7a12: '1,25%' },
  ],
};

// ── IRD Mastercard ────────────────────────────────────────────────────────────

type IRDRow = { ird: string; desc: string; prodCode: string; canal: string; rate: string; obs?: string };

const IRD_TABLE: IRDRow[] = [
  { ird: 'IA', desc: 'Debit Merit',                prodCode: 'MDM / MAE', canal: 'Chip / NFC',      rate: '0,40%' },
  { ird: 'HU', desc: 'Debit e-commerce regulado',  prodCode: 'MDM',       canal: 'E-comm ECI 05',   rate: '0,50%' },
  { ird: 'AU', desc: 'Merit I (Standard)',          prodCode: '101',       canal: 'Chip EMV',         rate: '0,36%' },
  { ird: 'JA', desc: 'Enhanced Merit II',           prodCode: '102',       canal: 'Chip / NFC',      rate: '0,50%' },
  { ird: 'GB', desc: 'World Interchange',           prodCode: '103',       canal: 'Chip / NFC',      rate: '1,20%' },
  { ird: 'GC', desc: 'World Elite',                 prodCode: '104',       canal: 'Chip / NFC',      rate: '1,80%' },
  { ird: 'AB', desc: 'Merit I e-comm sem auth',     prodCode: '101',       canal: 'E-comm ECI 07',   rate: '0,80%', obs: 'Non-Auth Fee 2AB3006M' },
  { ird: 'CB', desc: 'Corporate Card',              prodCode: 'MCO',       canal: 'Chip / NFC',      rate: '0,90%' },
  { ird: 'WB', desc: 'Prepaid Debit',               prodCode: 'MPP',       canal: 'Chip / NFC',      rate: '0,40%' },
  { ird: 'FB', desc: 'Fallback (penalidade)',        prodCode: 'todos',     canal: 'Fallback DE22=80', rate: 'max+fee', obs: 'Auditado pelo MFMP' },
];

// ── Tokenização ───────────────────────────────────────────────────────────────

const TOKEN_MECHANISMS = [
  {
    name: 'VTS — Visa Token Service',
    network: 'visa' as Network,
    color: '#3b82f6',
    icon: RefreshCw,
    field: 'Field 126 — DPAN Indicator | Field 61 — Token Assurance Level',
    desc: 'Transação com token (DPAN) em vez de PAN. O ACS do emissor pode conceder ECI 05 sem friction quando o device binding (Apple Pay/Google Pay) é forte.',
    impact: 'ECI 05 automático → taxa preferencial + liability shift sem OTP',
    rateTag: '↓ taxa',
    rateColor: '#10b981',
  },
  {
    name: 'VDCAP — Visa Digital Commerce App',
    network: 'visa' as Network,
    color: '#3b82f6',
    icon: CreditCard,
    field: 'Field 61.5 — AFS com token flag | Field 126.1 — Token Type',
    desc: 'Token provisionado em wallet. O PID do token é herdado do PAN original — um Infinite DPAN mantém PID FI e taxa correspondente.',
    impact: 'Preserva PID premium + nível de autenticação elevado = sem downgrade de produto',
    rateTag: '= taxa produto',
    rateColor: '#6366f1',
  },
  {
    name: 'TAF — Token Authentication Framework',
    network: 'mc' as Network,
    color: '#ef4444',
    icon: RefreshCw,
    field: 'DE 48.42 — ECI | DE 48.43 — AAV com Token Assurance Level',
    desc: 'Equivalente MC ao VDCAP. Token provisionado via MDES (Mastercard Digital Enablement Service). AAV gerado pelo emissor com assurance level do token.',
    impact: 'ECI 05 via token MDES → IRD preferencial + liability shift automático',
    rateTag: '↓ taxa',
    rateColor: '#10b981',
  },
  {
    name: 'SCOF — Stored Credential on File',
    network: 'mc' as Network,
    color: '#ef4444',
    icon: Globe,
    field: 'DE 48 subfield 22 — Stored Credential Indicator | DE 48.42 — ECI',
    desc: 'Credential on file tokenizada para recorrência e assinaturas. MC distingue cardholder-initiated (CIT) de merchant-initiated (MIT) para definir o IRD.',
    impact: 'IRD correto para recorrência → sem downgrade silencioso em cobranças mensais',
    rateTag: '= taxa correta',
    rateColor: '#6366f1',
  },
];

// ── MCCs ──────────────────────────────────────────────────────────────────────

const MCC_GROUPS = [
  { grupo: 'Alimentação', color: '#10b981', mccs: [
    { code: '5411', nome: 'Supermercados' }, { code: '5412', nome: 'Mini-mercados' },
    { code: '5451', nome: 'Laticínios' },    { code: '5499', nome: 'Misc. Food' },
  ]},
  { grupo: 'Combustível & Transporte', color: '#f59e0b', mccs: [
    { code: '5541', nome: 'Postos (sem loja)' }, { code: '5542', nome: 'Fuel Dispensers' },
    { code: '4111', nome: 'Transporte urbano' }, { code: '4131', nome: 'Bus Lines' },
  ]},
  { grupo: 'Saúde & Educação', color: '#6366f1', mccs: [
    { code: '5912', nome: 'Farmácias' },    { code: '8099', nome: 'Saúde geral' },
    { code: '8211', nome: 'Escolas' },      { code: '8220', nome: 'Universidades' },
  ]},
  { grupo: 'Governo & Utilidades', color: '#8b5cf6', mccs: [
    { code: '9311', nome: 'Impostos' },   { code: '9222', nome: 'Multas gov.' },
    { code: '4900', nome: 'Utilities' },  { code: '4814', nome: 'Telecom' },
  ]},
  { grupo: 'Hospedagem & Turismo', color: '#ec4899', mccs: [
    { code: '7011', nome: 'Hotéis e Resorts' }, { code: '7012', nome: 'Apartamentos' },
    { code: '3501', nome: 'Hilton / cadeia' },   { code: '7032', nome: 'Campings' },
  ]},
  { grupo: 'Refeições & Delivery', color: '#f97316', mccs: [
    { code: '5812', nome: 'Restaurantes' }, { code: '5814', nome: 'Fast Food' },
    { code: '5811', nome: 'Caterers' },     { code: '7922', nome: 'Shows / Eventos' },
  ]},
  { grupo: 'Varejo & E-commerce', color: '#14b8a6', mccs: [
    { code: '5311', nome: 'Lojas Depto.' }, { code: '5651', nome: 'Vestuário' },
    { code: '5732', nome: 'Eletrônicos' },  { code: '5945', nome: 'Brinquedos' },
  ]},
  { grupo: 'Viagens & Aéreo', color: '#0ea5e9', mccs: [
    { code: '4511', nome: 'Companhias Aéreas' }, { code: '4722', nome: 'Agências de Viagem' },
    { code: '7512', nome: 'Locadoras' },          { code: '4112', nome: 'Ferroviário' },
  ]},
];

// ── Downgrades ────────────────────────────────────────────────────────────────

type DowngradeItem = { trigger: string; impacto: string; campo: { visa: string; mc: string }; fix: string; severity: 'critical' | 'high' | 'medium' };

const DOWNGRADES: DowngradeItem[] = [
  {
    trigger: 'ECI ausente ou incorreto no clearing',
    impacto: 'Classificado como ECI 07 — taxa máxima + sem liability shift',
    campo: { visa: 'Field 61 no BASE II', mc: 'DE 48.42 no IPM' },
    fix: 'Mapear o ECI retornado pelo ACS diretamente para o campo de clearing. Validar no pipeline antes do envio.',
    severity: 'critical',
  },
  {
    trigger: 'CAVV/AAV presente mas não enviado no clearing',
    impacto: 'Autenticação 3DS ignorada — emissor trata como não-autenticado',
    campo: { visa: 'Field 126.9 (CAVV) no BASE II', mc: 'DE 48.43 (AAV) no IPM' },
    fix: 'Garantir que gateway 3DS e processador de clearing estão em sincronia. CAVV/AAV deve estar no mesmo arquivo.',
    severity: 'critical',
  },
  {
    trigger: 'POS Entry Mode = 80 (fallback de chip)',
    impacto: 'Taxa máxima de trilha + liability total no adquirente',
    campo: { visa: 'Field 22 no BASE II', mc: 'DE 22 no IPM' },
    fix: 'Terminal deve recusar transação se chip falhar 3× sem fallback autorizado. Nunca enviar 80 sem aprovação da bandeira.',
    severity: 'critical',
  },
  {
    trigger: 'PID / Product Code ausente no clearing',
    impacto: 'Fallback para Classic (Visa F^) ou Standard (MC 101) — perde taxa do produto real',
    campo: { visa: 'Field 61.5 AFS no BASE II', mc: 'DE 63 Tag 2 no IPM' },
    fix: 'Emissor popula AFS/Product Code na resposta de autorização. Adquirente deve preservar o campo no arquivo de clearing.',
    severity: 'high',
  },
  {
    trigger: 'MCC incorreto cadastrado pelo lojista',
    impacto: 'Perde taxa preferencial de categoria + risco de compliance',
    campo: { visa: 'Field 26 no BASE II', mc: 'DE 26 no IPM' },
    fix: 'Validar MCC no onboarding contra CNAE real do lojista. Ambas as bandeiras auditam periodicamente.',
    severity: 'high',
  },
  {
    trigger: 'CVV2 ausente em transação CNP',
    impacto: 'Transação vai para taxa de risco alto — sem AVS/CVV match',
    campo: { visa: 'Field 44 (CVV2 result code) no BASE II', mc: 'DE 48 subfield CVV result no IPM' },
    fix: 'Sempre coletar e transmitir CVV2. Resultado do match deve estar no arquivo de clearing.',
    severity: 'high',
  },
  {
    trigger: 'Token DPAN sem assurance level no clearing',
    impacto: 'VTS/MDES token tratado como PAN comum — perde benefício de ECI automático',
    campo: { visa: 'Field 126.1 Token Type + Field 61 Token Assurance', mc: 'DE 48.42 ECI + DE 48.43 AAV com token flag' },
    fix: 'Preservar Token Assurance Level do provisionamento até o arquivo de clearing. Não truncar campos de token.',
    severity: 'high',
  },
  {
    trigger: 'Pre-auth sem capture / completion fora do prazo',
    impacto: 'Fee de pre-auth cobrado + possível recusa no settlement',
    campo: { visa: 'Field 22 Transaction Status no BASE II', mc: 'DE 61.7 = 4 (pre-auth) no IPM' },
    fix: 'Enviar capture dentro de 30 dias. Valor do capture ≤ valor pré-autorizado.',
    severity: 'medium',
  },
  {
    trigger: 'Parcelamento sem indicador de installment no clearing',
    impacto: 'Transação classificada como à vista — perde identificação de parcelamento lojista',
    campo: { visa: 'Field 54 (Additional Amounts) no BASE II', mc: 'DE 48 subfield 95 no IPM' },
    fix: 'Enviar número de parcelas e valor da parcela no campo correto. Essencial para reconciliação de MDR parcelado.',
    severity: 'medium',
  },
  {
    trigger: 'Arquivo de clearing enviado após a janela D+1',
    impacto: 'Recusa ou late presentment fee no settlement',
    campo: { visa: 'BASE II — janela até 23:59 UTC D+1', mc: 'IPM — janela até 23:59 UTC D+1' },
    fix: 'Monitorar janela de transmissão. Resubmissão aceita até D+30 para disputas, mas late fee pode ser cobrado.',
    severity: 'medium',
  },
];

const severityConfig = {
  critical: { label: 'Crítico', bg: 'bg-red-500/10', border: 'border-red-500/25', text: 'text-red-400', dot: 'bg-red-500' },
  high:     { label: 'Alto',    bg: 'bg-amber-500/10', border: 'border-amber-500/25', text: 'text-amber-400', dot: 'bg-amber-500' },
  medium:   { label: 'Médio',   bg: 'bg-blue-500/10', border: 'border-blue-500/25', text: 'text-blue-400', dot: 'bg-blue-500' },
};

// ── Rate color ────────────────────────────────────────────────────────────────

function rateColor(rate: string) {
  if (rate === '—') return 'text-muted-foreground/40 bg-transparent';
  if (rate === 'max+fee') return 'text-red-400 bg-red-500/10';
  const n = parseFloat(rate.replace(',', '.'));
  if (isNaN(n)) return 'text-muted-foreground/40 bg-transparent';
  if (n <= 0.50) return 'text-green-400 bg-green-500/10';
  if (n <= 1.00) return 'text-amber-400 bg-amber-500/10';
  if (n <= 1.80) return 'text-orange-400 bg-orange-500/10';
  return 'text-red-400 bg-red-500/10';
}

// ── TOC ───────────────────────────────────────────────────────────────────────

const SECTIONS = [
  { id: 'cascade',      label: 'A Cascata' },
  { id: 'matrix',       label: 'Produto × Canal' },
  { id: 'parcelamento', label: 'Parcelamento' },
  { id: 'tokenizacao',  label: 'Tokenização' },
  { id: 'mcc',          label: 'MCCs' },
  { id: 'ird',          label: 'IRD / Designators' },
  { id: 'bacen',        label: 'BACEN 3.887' },
  { id: 'downgrade',    label: 'Anti-Downgrade' },
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function MatrixClient() {
  const [net, setNet] = useState<Network>('visa');
  const cfg = NET[net];
  const cascade = CASCADE[net];

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-6 py-12 pt-28">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
            <Link href="/" className="hover:text-foreground">Início</Link>
            <span>/</span>
            <span className="text-foreground">Matriz de Intercâmbio</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-3">
            Matriz de <span className="text-primary">Intercâmbio</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl leading-relaxed mb-6">
            5 variáveis determinam a taxa que o adquirente paga ao emissor.
            Selecione a bandeira para ver campos, PIDs e lógica específicos.
          </p>

          {/* Network switcher */}
          <div className="flex items-center gap-3 mb-6">
            <span className="text-xs text-muted-foreground font-semibold uppercase tracking-widest">Bandeira:</span>
            <div className="flex rounded-xl border border-border overflow-hidden">
              {(['visa', 'mc'] as Network[]).map((n) => {
                const c = NET[n];
                const active = net === n;
                return (
                  <button
                    key={n}
                    onClick={() => setNet(n)}
                    className="px-6 py-2.5 text-sm font-bold transition-all"
                    style={active
                      ? { background: c.color, color: '#fff' }
                      : { color: 'var(--muted-foreground)', background: 'transparent' }
                    }
                  >
                    {c.label}
                  </button>
                );
              })}
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground ml-2">
              <span>Clearing: <strong className="text-foreground">{cfg.clearingFile}</strong></span>
              <span>Fee msg: <strong className="text-foreground font-mono">{cfg.feeMessage}</strong></span>
              <span>Settlement: <strong className="text-foreground">{cfg.settlementSystem}</strong></span>
            </div>
          </div>

          {/* Rate legend */}
          <div className="flex flex-wrap gap-2">
            {[
              { label: '≤ 0,50%', color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
              { label: '0,51–1,00%', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
              { label: '1,01–1,80%', color: '#f97316', bg: 'rgba(249,115,22,0.1)' },
              { label: '> 1,80%', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
            ].map(({ label, color, bg }) => (
              <div key={label} className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold"
                style={{ background: bg, color }}>
                <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                {label}
              </div>
            ))}
            <div className="rounded-lg px-3 py-1.5 text-xs text-muted-foreground bg-muted/30">
              * Taxas indicativas BR — variam por emissor e negociação
            </div>
          </div>
        </div>

        <div className="flex gap-10 items-start">

          {/* TOC */}
          <aside className="hidden xl:block w-44 shrink-0 sticky top-28 space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Seções</p>
            {SECTIONS.map((s) => (
              <a key={s.id} href={`#${s.id}`}
                className="block text-sm text-muted-foreground hover:text-foreground transition-colors py-1">
                {s.label}
              </a>
            ))}
            {/* Network quick-switch in sidebar */}
            <div className="pt-4 border-t border-border mt-4 space-y-2">
              {(['visa', 'mc'] as Network[]).map((n) => (
                <button key={n} onClick={() => setNet(n)}
                  className="block w-full text-left text-xs py-1 transition-colors"
                  style={{ color: net === n ? NET[n].color : 'var(--muted-foreground)' }}>
                  {net === n ? '● ' : '○ '}{NET[n].label}
                </button>
              ))}
              <div className="pt-2 space-y-1.5">
                <Link href="/simulador"   className="block text-xs text-primary hover:underline">→ Simular taxa</Link>
                <Link href="/mdr"         className="block text-xs text-primary hover:underline">→ Fluxo MDR</Link>
                <Link href="/comparativo" className="block text-xs text-primary hover:underline">→ Visa × MC</Link>
              </div>
            </div>
          </aside>

          {/* Content */}
          <div className="flex-1 space-y-14 min-w-0">

            {/* ── Cascade ──────────────────────────────────────────── */}
            <section id="cascade" className="scroll-mt-24">
              <h2 className="text-lg font-bold text-foreground mb-1 flex items-center gap-2">
                <span className="w-1 h-5 rounded-full bg-primary inline-block" />
                A Cascata de Decisão —{' '}
                <span style={{ color: cfg.color }}>{cfg.label}</span>
              </h2>
              <p className="text-sm text-muted-foreground mb-4 ml-3">
                Campos e nomenclatura específicos da {cfg.label} ({cfg.clearingFile}).
              </p>

              <div className="space-y-3">
                {cascade.map((step, idx) => {
                  const Icon = step.icon;
                  const isLast = idx === cascade.length - 1;
                  return (
                    <div key={step.step}>
                      <div className="rounded-xl border border-border overflow-hidden">
                        <div className="flex items-start gap-4 p-4"
                          style={{ background: `${step.color}07` }}>
                          <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-black text-white shrink-0"
                            style={{ background: step.color }}>
                            {step.step}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Icon size={14} style={{ color: step.color }} />
                              <span className="font-bold text-foreground text-sm">{step.label}</span>
                              <span className="text-xs text-muted-foreground">— {step.sublabel}</span>
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed mb-3">{step.desc}</p>

                            {/* Values */}
                            <div className="flex flex-wrap gap-2 mb-3">
                              {step.values.map((v) => (
                                <div key={v.v}
                                  className="flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs"
                                  style={{ borderColor: `${step.color}30`, background: `${step.color}08` }}>
                                  <span className="font-mono font-bold text-[10px]"
                                    style={{ color: step.color }}>{v.id}</span>
                                  <span className="text-foreground font-medium">{v.v}</span>
                                  <span className="font-mono text-[9px] px-1.5 py-0.5 rounded-full"
                                    style={{ background: `${step.color}20`, color: step.color }}>{v.badge}</span>
                                </div>
                              ))}
                            </div>

                            {/* Campo específico da bandeira */}
                            <div className="text-[10px] rounded-md px-2.5 py-1.5 mb-2 inline-flex items-center gap-1.5"
                              style={{ background: `${cfg.color}10`, border: `1px solid ${cfg.color}25` }}>
                              <span className="font-bold" style={{ color: cfg.color }}>{cfg.label}:</span>
                              <span className="font-mono text-muted-foreground">{step.campo}</span>
                            </div>

                            {/* Downgrade */}
                            <div className="flex items-start gap-1.5 rounded-lg bg-red-500/6 border border-red-500/15 px-3 py-2 text-[11px] text-red-400/80">
                              <AlertTriangle size={11} className="mt-0.5 shrink-0" />
                              <span><strong>Downgrade:</strong> {step.downgrade}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      {!isLast && (
                        <div className="flex justify-center py-1">
                          <ArrowDown size={16} className="text-border" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Result box */}
              <div className="mt-4 rounded-xl border p-5"
                style={{ borderColor: `${cfg.color}30`, background: `${cfg.color}05` }}>
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown size={15} style={{ color: cfg.color }} />
                  <span className="text-sm font-bold text-foreground">
                    Taxa {cfg.label} = f(Produto/{net === 'visa' ? 'PID' : 'Product Code'}, Canal/DE 22, ECI/{net === 'visa' ? 'Field 61' : 'DE 48.42'}, MCC, Regulatório)
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  A taxa é determinada no <strong className="text-foreground">{cfg.clearingFile}</strong> —
                  não na autorização. Qualquer campo ausente ou incorreto nesse arquivo
                  gera <span className="text-red-400 font-semibold">downgrade silencioso</span>.
                </p>
              </div>
            </section>

            {/* ── Matrix ───────────────────────────────────────────── */}
            <section id="matrix" className="scroll-mt-24">
              <h2 className="text-lg font-bold text-foreground mb-1 flex items-center gap-2">
                <span className="w-1 h-5 rounded-full bg-primary inline-block" />
                Produto × Canal —{' '}
                <span style={{ color: cfg.color }}>{cfg.label}</span>
              </h2>
              <p className="text-sm text-muted-foreground mb-4 ml-3">
                {net === 'visa'
                  ? 'PIDs Visa (Campo AFS) × modalidade de captura. Taxas indicativas BR.'
                  : 'Product Codes MC (DE 63 Tag 2) × modalidade de captura. Taxas indicativas BR.'}
              </p>

              <div className="mb-3 p-3 rounded-lg text-xs"
                style={{ background: `${cfg.color}08`, borderLeft: `3px solid ${cfg.color}` }}>
                <strong style={{ color: cfg.color }}>
                  {net === 'visa' ? 'Visa PID' : 'MC Product Code'}:
                </strong>{' '}
                {net === 'visa'
                  ? 'identificador de produto no Field 61.5 (AFS) do BASE II. Emissores regulados (BACEN 3.887) têm teto de 0,50% na média.'
                  : 'identificador no DE 63 Tag 2 do IPM. IRD (Interchange Rate Designator) mapeia Product Code + canal → taxa final. Teto BACEN 0,50% para regulados.'}
              </div>

              <div className="overflow-x-auto rounded-xl border border-border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/40">
                      <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        Produto
                      </th>
                      <th className="text-center px-3 py-3 text-xs font-bold uppercase tracking-wider"
                        style={{ color: cfg.color }}>
                        {net === 'visa' ? 'PID' : 'Code'}
                      </th>
                      <th className="text-center px-3 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        <div className="flex flex-col items-center gap-0.5">
                          <CreditCard size={11} /><span>Chip</span>
                          <span className="text-[9px] opacity-60 font-mono">05</span>
                        </div>
                      </th>
                      <th className="text-center px-3 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        <div className="flex flex-col items-center gap-0.5">
                          <Wifi size={11} /><span>NFC</span>
                          <span className="text-[9px] opacity-60 font-mono">07</span>
                        </div>
                      </th>
                      <th className="text-center px-3 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        <div className="flex flex-col items-center gap-0.5">
                          <ShieldCheck size={11} className="text-green-400" /><span>E-comm</span>
                          <span className="text-[9px] opacity-60 font-mono">ECI 05</span>
                        </div>
                      </th>
                      <th className="text-center px-3 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        <div className="flex flex-col items-center gap-0.5">
                          <ShieldX size={11} className="text-red-400" /><span>E-comm</span>
                          <span className="text-[9px] opacity-60 font-mono">ECI 07</span>
                        </div>
                      </th>
                      <th className="text-center px-3 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        <div className="flex flex-col items-center gap-0.5">
                          <Phone size={11} className="text-orange-400" /><span>MOTO</span>
                          <span className="text-[9px] opacity-60 font-mono">01</span>
                        </div>
                      </th>
                      <th className="text-center px-3 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        <div className="flex flex-col items-center gap-0.5">
                          <AlertTriangle size={11} className="text-red-400" /><span>Mag</span>
                          <span className="text-[9px] opacity-60 font-mono">90/80</span>
                        </div>
                      </th>
                      <th className="text-center px-3 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider w-20">
                        Regulado
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {MATRIX[net].map((row, i) => (
                      <tr key={i} className={`border-b border-border/60 ${i % 2 === 0 ? '' : 'bg-muted/15'}`}>
                        <td className="px-4 py-3 font-semibold text-foreground text-sm">{row.produto}</td>
                        <td className="px-3 py-3 text-center">
                          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded"
                            style={{ color: cfg.color, background: `${cfg.color}15` }}>{row.pid}</span>
                        </td>
                        {[row.chip, row.nfc, row.ecomm05, row.ecomm07, row.moto, row.mag].map((rate, j) => (
                          <td key={j} className="px-3 py-3 text-center">
                            <span className={`text-xs font-bold tabular-nums px-2.5 py-1 rounded-lg ${rateColor(rate)}`}>
                              {rate}
                            </span>
                          </td>
                        ))}
                        <td className="px-3 py-3 text-center">
                          {row.regulado
                            ? <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/12 text-green-400 font-semibold">Sim</span>
                            : <span className="text-xs px-2 py-0.5 rounded-full bg-muted/40 text-muted-foreground font-semibold">Não</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Delta cards */}
              <div className="mt-4 grid sm:grid-cols-3 gap-3">
                {[
                  { title: 'Custo de não usar 3DS', icon: ShieldX, color: '#ef4444', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)',
                    desc: net === 'visa'
                      ? 'Classic (F^) regulado: ECI 07 (0,80%) vs ECI 05 (0,50%) = +0,30 p.p. Em 1M txns de R$100 = R$300k/mês a mais.'
                      : 'Standard (101) regulado: ECI 07 (0,80%) vs ECI 05 (0,50%) = +0,30 p.p. Cobrado via Non-Auth Fee 2AB3006M no MCBS.' },
                  { title: 'Premium vs base', icon: CreditCard, color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)',
                    desc: net === 'visa'
                      ? 'Infinite (FI) chip (1,80%) vs Classic (F^) chip (0,36%) = +1,44 p.p. Razão para emissores lançarem produtos premium.'
                      : 'World Elite (104) chip (1,80%) vs Standard (101) chip (0,36%) = +1,44 p.p. Fee cobrado via MCBS MTI 1740.' },
                  { title: 'MOTO vs E-commerce 3DS', icon: Phone, color: '#f97316', bg: 'rgba(249,115,22,0.08)', border: 'rgba(249,115,22,0.2)',
                    desc: net === 'visa'
                      ? 'Classic MOTO (0,80%) vs Classic e-comm ECI 05 (0,50%) = +0,30 p.p. + sem liability shift. MOTO não suporta 3DS.'
                      : 'Standard MOTO (0,80%) vs Standard e-comm ECI 05 (0,50%) = +0,30 p.p. + sem liability shift. IRD AB vs AU.' },
                ].map(({ title, icon: Icon, color, bg, border, desc }) => (
                  <div key={title} className="rounded-xl border p-4" style={{ background: bg, borderColor: border }}>
                    <div className="flex items-center gap-2 mb-2">
                      <Icon size={13} style={{ color }} />
                      <span className="text-xs font-bold text-foreground">{title}</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* ── Parcelamento ─────────────────────────────────────── */}
            <section id="parcelamento" className="scroll-mt-24">
              <h2 className="text-lg font-bold text-foreground mb-1 flex items-center gap-2">
                <span className="w-1 h-5 rounded-full bg-primary inline-block" />
                Parcelamento —{' '}
                <span style={{ color: cfg.color }}>{cfg.label}</span>
              </h2>
              <p className="text-sm text-muted-foreground mb-4 ml-3">
                Parcelamento lojista (sem juros ao portador) afeta o intercâmbio no Brasil.
                Débito e pré-pago regulados não parcelam — teto BACEN se aplica independente.
              </p>

              <div className="mb-3 p-3 rounded-lg text-xs bg-amber-500/8 border border-amber-500/20">
                <strong className="text-amber-400">Campo técnico:</strong>{' '}
                {net === 'visa'
                  ? 'Field 54 (Additional Amounts) no BASE II indica número de parcelas. Field 26 (MCC) + PID + parcelas determinam o rate qualifier de parcelamento.'
                  : 'DE 48 subfield 95 (Installment Data) no IPM indica número de parcelas. O IRD de parcelamento difere do IRD à vista para o mesmo Product Code.'}
              </div>

              <div className="overflow-x-auto rounded-xl border border-border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/40">
                      <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Produto</th>
                      <th className="text-center px-3 py-3 text-xs font-bold uppercase tracking-wider" style={{ color: cfg.color }}>
                        {net === 'visa' ? 'PID' : 'Code'}
                      </th>
                      <th className="text-center px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        <div className="flex flex-col items-center gap-0.5">
                          <span>À Vista</span>
                          <span className="text-[9px] opacity-60">chip/NFC</span>
                        </div>
                      </th>
                      <th className="text-center px-4 py-3 text-xs font-bold text-amber-400 uppercase tracking-wider">
                        <div className="flex flex-col items-center gap-0.5">
                          <span>2× – 6×</span>
                          <span className="text-[9px] opacity-60">parcelado</span>
                        </div>
                      </th>
                      <th className="text-center px-4 py-3 text-xs font-bold text-orange-400 uppercase tracking-wider">
                        <div className="flex flex-col items-center gap-0.5">
                          <span>7× – 12×</span>
                          <span className="text-[9px] opacity-60">parcelado</span>
                        </div>
                      </th>
                      <th className="text-center px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        Delta 7–12×
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {PARCELAMENTO[net].map((row, i) => {
                      const delta = (parseFloat(row.parc7a12.replace(',', '.')) - parseFloat(row.vista.replace(',', '.'))).toFixed(2).replace('.', ',');
                      return (
                        <tr key={i} className={`border-b border-border/60 ${i % 2 === 0 ? '' : 'bg-muted/15'}`}>
                          <td className="px-4 py-3 font-semibold text-foreground text-sm">{row.produto}</td>
                          <td className="px-3 py-3 text-center">
                            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded"
                              style={{ color: cfg.color, background: `${cfg.color}15` }}>{row.pid}</span>
                          </td>
                          <td className="px-3 py-3 text-center">
                            <span className={`text-xs font-bold tabular-nums px-2.5 py-1 rounded-lg ${rateColor(row.vista)}`}>{row.vista}</span>
                          </td>
                          <td className="px-3 py-3 text-center">
                            <span className={`text-xs font-bold tabular-nums px-2.5 py-1 rounded-lg ${rateColor(row.parc2a6)}`}>{row.parc2a6}</span>
                          </td>
                          <td className="px-3 py-3 text-center">
                            <span className={`text-xs font-bold tabular-nums px-2.5 py-1 rounded-lg ${rateColor(row.parc7a12)}`}>{row.parc7a12}</span>
                          </td>
                          <td className="px-3 py-3 text-center">
                            <span className="text-xs font-bold tabular-nums px-2 py-0.5 rounded text-orange-400 bg-orange-500/10">
                              +{delta} p.p.
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 grid sm:grid-cols-2 gap-3">
                <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle size={13} className="text-amber-400" />
                    <span className="text-xs font-bold text-foreground">Impacto no MDR</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    O adquirente repassa o custo de parcelamento no MDR. Infinite 7–12× (2,60%) vs à vista (1,80%) = +0,80 p.p. de custo de intercâmbio que o lojista paga indiretamente via MDR maior.
                  </p>
                </div>
                <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 size={13} className="text-blue-400" />
                    <span className="text-xs font-bold text-foreground">Parcelamento Emissor vs Lojista</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Parcelamento emissor (juros ao portador) usa taxa à vista de intercâmbio — o risco de crédito das parcelas fica com o emissor, não com o lojista. O campo técnico diferencia os dois tipos.
                  </p>
                </div>
              </div>
            </section>

            {/* ── Tokenização ──────────────────────────────────────── */}
            <section id="tokenizacao" className="scroll-mt-24">
              <h2 className="text-lg font-bold text-foreground mb-1 flex items-center gap-2">
                <span className="w-1 h-5 rounded-full bg-primary inline-block" />
                Tokenização e Intercâmbio
              </h2>
              <p className="text-sm text-muted-foreground mb-4 ml-3">
                Tokens (DPAN) não são apenas segurança — afetam diretamente o ECI e a taxa de intercâmbio.
                VTS (Visa) e MDES/TAF (Mastercard) funcionam de forma distinta no clearing.
              </p>

              <div className="grid md:grid-cols-2 gap-4">
                {TOKEN_MECHANISMS.filter((t) => t.network === net).map((t) => {
                  const Icon = t.icon;
                  return (
                    <div key={t.name} className="rounded-xl border border-border overflow-hidden">
                      <div className="px-4 py-3 flex items-center gap-2"
                        style={{ background: `${t.color}08`, borderBottom: `1px solid ${t.color}20` }}>
                        <Icon size={14} style={{ color: t.color }} />
                        <span className="text-sm font-bold text-foreground">{t.name}</span>
                        <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full"
                          style={{ background: `${t.rateColor}15`, color: t.rateColor }}>
                          {t.rateTag}
                        </span>
                      </div>
                      <div className="p-4 space-y-3">
                        <div className="text-[10px] font-mono px-2.5 py-1.5 rounded"
                          style={{ background: `${t.color}08`, border: `1px solid ${t.color}15` }}>
                          <span className="font-bold" style={{ color: t.color }}>Campo: </span>
                          <span className="text-muted-foreground">{t.field}</span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">{t.desc}</p>
                        <div className="flex items-start gap-1.5 rounded-lg px-3 py-2 text-xs"
                          style={{ background: `${t.rateColor}10`, border: `1px solid ${t.rateColor}20` }}>
                          <CheckCircle2 size={11} className="mt-0.5 shrink-0" style={{ color: t.rateColor }} />
                          <span style={{ color: t.rateColor }}>{t.impact}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Token vs PAN comparison */}
              <div className="mt-4 rounded-xl border border-border overflow-hidden">
                <div className="px-4 py-3 bg-muted/30 border-b border-border">
                  <span className="text-sm font-bold text-foreground">
                    DPAN (Token) vs PAN — Impacto no Clearing ({cfg.label})
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border bg-muted/20">
                        <th className="text-left px-4 py-2.5 font-bold text-muted-foreground uppercase tracking-wider">Cenário</th>
                        <th className="text-center px-3 py-2.5 font-bold text-muted-foreground uppercase tracking-wider">Identificador</th>
                        <th className="text-center px-3 py-2.5 font-bold text-muted-foreground uppercase tracking-wider">ECI</th>
                        <th className="text-center px-3 py-2.5 font-bold text-muted-foreground uppercase tracking-wider">Taxa Classic/Std</th>
                        <th className="text-left px-3 py-2.5 font-bold text-muted-foreground uppercase tracking-wider">Liability</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { cenario: 'PAN + 3DS frictionless', id: 'PAN', eci: '06', taxa: '0,50%', liability: 'Parcial emissor', tcolor: 'text-green-400' },
                        { cenario: 'PAN + sem autenticação', id: 'PAN', eci: '07', taxa: '0,80%', liability: 'Adquirente', tcolor: 'text-red-400' },
                        { cenario: 'DPAN (wallet) + device binding', id: net === 'visa' ? 'DPAN/VTS' : 'DPAN/MDES', eci: '05', taxa: '0,50%', liability: 'Shift para emissor', tcolor: 'text-green-400' },
                        { cenario: 'DPAN sem assurance level', id: net === 'visa' ? 'DPAN/VTS' : 'DPAN/MDES', eci: '07*', taxa: '0,80%', liability: 'Adquirente', tcolor: 'text-red-400' },
                      ].map((r, i) => (
                        <tr key={i} className={`border-b border-border/50 ${i % 2 === 0 ? '' : 'bg-muted/10'}`}>
                          <td className="px-4 py-2.5 text-foreground font-medium">{r.cenario}</td>
                          <td className="px-3 py-2.5 text-center font-mono font-bold" style={{ color: cfg.color }}>{r.id}</td>
                          <td className="px-3 py-2.5 text-center font-mono font-bold text-foreground">{r.eci}</td>
                          <td className={`px-3 py-2.5 text-center font-bold tabular-nums ${r.tcolor}`}>{r.taxa}</td>
                          <td className="px-3 py-2.5 text-muted-foreground">{r.liability}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="px-4 py-2.5 bg-muted/10 text-[10px] text-muted-foreground border-t border-border">
                  * DPAN sem assurance level → bandeira trata como PAN sem autenticação. Campo de token assurance deve ser preservado até o {cfg.clearingFile}.
                </div>
              </div>
            </section>

            {/* ── MCCs ─────────────────────────────────────────────── */}
            <section id="mcc" className="scroll-mt-24">
              <h2 className="text-lg font-bold text-foreground mb-1 flex items-center gap-2">
                <span className="w-1 h-5 rounded-full bg-primary inline-block" />
                MCCs com Tratamento Preferencial
              </h2>
              <p className="text-sm text-muted-foreground mb-4 ml-3">
                ISO 18245 — mesma tabela em Visa e Mastercard.{' '}
                {net === 'visa' ? 'Campo Field 26 no BASE II.' : 'Campo DE 26 no IPM.'}
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                {MCC_GROUPS.map((g) => (
                  <div key={g.grupo} className="rounded-xl border border-border overflow-hidden">
                    <div className="px-4 py-3 flex items-center gap-2"
                      style={{ background: `${g.color}08`, borderBottom: `1px solid ${g.color}25` }}>
                      <Store size={13} style={{ color: g.color }} />
                      <span className="text-sm font-bold text-foreground">{g.grupo}</span>
                    </div>
                    <div className="divide-y divide-border/40">
                      {g.mccs.map((m) => (
                        <div key={m.code} className="flex items-center gap-3 px-4 py-2.5">
                          <span className="font-mono text-xs font-bold w-12 shrink-0" style={{ color: g.color }}>{m.code}</span>
                          <span className="text-sm text-muted-foreground">{m.nome}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* ── IRD / Designators ────────────────────────────────── */}
            <section id="ird" className="scroll-mt-24">
              <h2 className="text-lg font-bold text-foreground mb-1 flex items-center gap-2">
                <span className="w-1 h-5 rounded-full bg-primary inline-block" />
                {net === 'visa' ? 'Rate Qualifiers — Visa BASE II' : 'IRD — Interchange Rate Designator (Mastercard)'}
              </h2>
              <p className="text-sm text-muted-foreground mb-4 ml-3">
                {net === 'visa'
                  ? 'A Visa não usa siglas IRD — a taxa é determinada pelo conjunto PID + Canal + ECI no BASE II. O Rate Qualifier é derivado, não um campo separado.'
                  : 'O IRD é um código de 2 letras no IPM (DE 63) que identifica qual tabela de intercâmbio o MCBS vai usar para cobrar. Cada combinação Product Code + Canal + ECI gera um IRD diferente.'}
              </p>

              {net === 'mc' ? (
                <>
                  <div className="mb-3 p-3 rounded-lg text-xs bg-red-500/8 border border-red-500/20">
                    <strong className="text-red-400">Campo técnico MC:</strong>{' '}
                    IRD presente no DE 63 Tag 7 do IPM. Verificar na fatura MCBS se o IRD cobrado bate com o esperado para o Product Code + Canal da transação.
                  </div>
                  <div className="overflow-x-auto rounded-xl border border-border">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border bg-muted/40">
                          <th className="text-center px-3 py-3 text-xs font-bold uppercase tracking-wider" style={{ color: '#ef4444' }}>IRD</th>
                          <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Descrição</th>
                          <th className="text-center px-3 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Product Code</th>
                          <th className="text-left px-3 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Canal</th>
                          <th className="text-center px-3 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Taxa</th>
                          <th className="text-left px-3 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Obs.</th>
                        </tr>
                      </thead>
                      <tbody>
                        {IRD_TABLE.map((row, i) => (
                          <tr key={i} className={`border-b border-border/60 ${i % 2 === 0 ? '' : 'bg-muted/15'}`}>
                            <td className="px-3 py-3 text-center">
                              <span className="font-mono text-sm font-black px-2.5 py-1 rounded bg-red-500/15 text-red-400">{row.ird}</span>
                            </td>
                            <td className="px-4 py-3 text-foreground font-medium text-sm">{row.desc}</td>
                            <td className="px-3 py-3 text-center">
                              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-red-500/10 text-red-400">{row.prodCode}</span>
                            </td>
                            <td className="px-3 py-3 text-muted-foreground text-xs">{row.canal}</td>
                            <td className="px-3 py-3 text-center">
                              <span className={`text-xs font-bold tabular-nums px-2.5 py-1 rounded-lg ${rateColor(row.rate)}`}>{row.rate}</span>
                            </td>
                            <td className="px-3 py-3 text-xs text-muted-foreground/70 italic">{row.obs ?? '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-3 p-3 rounded-lg text-xs bg-muted/20 border border-border text-muted-foreground">
                    <strong className="text-foreground">Como usar:</strong> Ao auditar a fatura MCBS, compare o IRD de cada linha com o Product Code (DE 63 Tag 2) e Canal (DE 22) da transação. IRD inesperado = downgrade ou erro de cadastro.
                  </div>
                </>
              ) : (
                <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle2 size={14} className="text-blue-400" />
                    <span className="text-sm font-bold text-foreground">Como auditar taxas Visa no BASE II</span>
                  </div>
                  <div className="space-y-2 text-xs text-muted-foreground">
                    {[
                      { k: 'Passo 1', v: 'Extraia o PID do Field 61.5 (AFS) de cada transação no BASE II' },
                      { k: 'Passo 2', v: 'Cruce com o Field 22 (POS Entry Mode) para identificar o canal' },
                      { k: 'Passo 3', v: 'Verifique o ECI no Field 61 (para e-commerce) — ECI 05 deve ter taxa menor' },
                      { k: 'Passo 4', v: 'Compare a taxa cobrada pelo VSS com a tabela PID × Canal desta página' },
                      { k: 'Passo 5', v: 'Divergência = downgrade silencioso. Abra dispute com a Visa via File Dispute System' },
                    ].map(({ k, v }) => (
                      <div key={k} className="flex gap-3">
                        <span className="font-bold text-blue-400 shrink-0 w-14">{k}</span>
                        <span>{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* ── BACEN ────────────────────────────────────────────── */}
            <section id="bacen" className="scroll-mt-24">
              <h2 className="text-lg font-bold text-foreground mb-1 flex items-center gap-2">
                <span className="w-1 h-5 rounded-full bg-primary inline-block" />
                BACEN Circular 3.887/2018
              </h2>
              <p className="text-sm text-muted-foreground mb-4 ml-3">
                Regra única para ambas as bandeiras no Brasil — o campo de clearing que implementa é diferente.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="rounded-xl border border-green-500/25 bg-green-500/5 p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-green-500/15 flex items-center justify-center">
                      <Building2 size={14} className="text-green-400" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-foreground">Emissores Regulados</div>
                      <div className="text-xs text-muted-foreground">Grandes bancos — &gt; 10M contas ativas</div>
                    </div>
                  </div>
                  <div className="space-y-2 text-xs">
                    {[
                      { k: 'Teto', v: '0,50% média ponderada do portfólio', h: true },
                      { k: 'Campo', v: net === 'visa' ? 'AFS / SETTL_FLAG — Field 61 BASE II' : 'SETTL_FLAG — DE 63 Tag 5 IPM' },
                      { k: 'Identificador', v: net === 'visa' ? 'PID com flag regulado no AFS' : 'IRD com categoria regulada' },
                      { k: 'Exemplos', v: 'Itaú, Bradesco, BB, Caixa, Santander' },
                    ].map(({ k, v, h }) => (
                      <div key={k} className={`flex gap-2 ${h ? 'p-2 rounded-lg bg-green-500/10 border border-green-500/20' : ''}`}>
                        <span className="text-muted-foreground shrink-0 w-24">{k}:</span>
                        <span className={`font-semibold ${h ? 'text-green-400' : 'text-foreground'}`}>{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-xl border border-amber-500/25 bg-amber-500/5 p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center">
                      <Zap size={14} className="text-amber-400" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-foreground">Emissores Não-Regulados</div>
                      <div className="text-xs text-muted-foreground">Fintechs, co-brand, nicho</div>
                    </div>
                  </div>
                  <div className="space-y-2 text-xs">
                    {[
                      { k: 'Teto', v: 'Sem cap — negociado com bandeira', h: true },
                      { k: 'Prática', v: '1,0% a 2,5% em crédito premium' },
                      { k: 'Campo', v: net === 'visa' ? 'PID premium sem flag regulado' : 'IRD com categoria não-regulada' },
                      { k: 'Exemplos', v: 'Nubank, C6, Inter, co-brand premium' },
                    ].map(({ k, v, h }) => (
                      <div key={k} className={`flex gap-2 ${h ? 'p-2 rounded-lg bg-amber-500/10 border border-amber-500/20' : ''}`}>
                        <span className="text-muted-foreground shrink-0 w-24">{k}:</span>
                        <span className={`font-semibold ${h ? 'text-amber-400' : 'text-foreground'}`}>{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* ── Anti-Downgrade ───────────────────────────────────── */}
            <section id="downgrade" className="scroll-mt-24">
              <h2 className="text-lg font-bold text-foreground mb-1 flex items-center gap-2">
                <span className="w-1 h-5 rounded-full bg-primary inline-block" />
                Guia Anti-Downgrade
              </h2>
              <p className="text-sm text-muted-foreground mb-4 ml-3">
                Campos específicos de cada bandeira destacados — o campo errado é sempre diferente entre {NET.visa.label} e {NET.mc.label}.
              </p>

              <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400/90">
                <strong>Downgrade silencioso:</strong> acontece no clearing. O lojista não vê,
                o adquirente descobre na fatura. A bandeira selecionada ({cfg.label}) usa{' '}
                <strong>{cfg.clearingFile}</strong> — os campos abaixo são específicos desse formato.
              </div>

              <div className="space-y-3">
                {DOWNGRADES.map((d, i) => {
                  const cfg2 = severityConfig[d.severity];
                  const campoAtual = net === 'visa' ? d.campo.visa : d.campo.mc;
                  return (
                    <div key={i} className={`rounded-xl border p-4 ${cfg2.bg} ${cfg2.border}`}>
                      <div className="flex items-start gap-3">
                        <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${cfg2.dot}`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="text-sm font-bold text-foreground">{d.trigger}</div>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${cfg2.bg} border ${cfg2.border} ${cfg2.text}`}>
                              {cfg2.label}
                            </span>
                          </div>
                          <div className="flex items-start gap-1.5 mb-2 text-xs">
                            <XCircle size={12} className="text-red-400 mt-0.5 shrink-0" />
                            <span className="text-muted-foreground">{d.impacto}</span>
                          </div>
                          {/* Campo específico da bandeira selecionada */}
                          <div className="font-mono text-[10px] mb-2 px-2.5 py-1.5 rounded inline-flex items-center gap-1.5"
                            style={{ background: `${cfg.color}10`, border: `1px solid ${cfg.color}25` }}>
                            <span className="font-bold" style={{ color: cfg.color }}>{cfg.label}:</span>
                            <span className="text-muted-foreground">{campoAtual}</span>
                          </div>
                          <div className="flex items-start gap-1.5 text-xs">
                            <CheckCircle2 size={12} className="text-green-400 mt-0.5 shrink-0" />
                            <span className="text-muted-foreground leading-relaxed">{d.fix}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Monitoring */}
              <div className="mt-6 rounded-xl border border-primary/20 bg-primary/5 p-5">
                <div className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                  <Zap size={14} className="text-primary" />
                  O que monitorar em tempo real — {cfg.label} ({cfg.clearingFile})
                </div>
                <div className="grid sm:grid-cols-2 gap-3 text-xs">
                  {[
                    { campo: net === 'visa' ? 'ECI rate (Field 61)' : 'ECI rate (DE 48.42)', meta: '> 70% ECI 05 em e-commerce', alerta: '< 50% = pipeline 3DS com problema' },
                    { campo: 'Fallback rate', meta: '< 0,1% em terminais chip', alerta: '> 0,5% = parque de terminais com problema' },
                    { campo: net === 'visa' ? 'PID completeness (AFS)' : 'Product Code (DE 63)', meta: '100% dos clearings com campo', alerta: 'Qualquer ausência = taxa errada' },
                    { campo: net === 'visa' ? 'Token assurance (Field 126)' : 'Token assurance (DE 48.43)', meta: '> 80% DPAN com assurance level', alerta: 'DPAN sem assurance = sem benefício de ECI' },
                    { campo: net === 'visa' ? 'BASE II timing' : 'IPM timing', meta: '100% enviados até D+1 23:59 UTC', alerta: 'D+2+ = risco de late presentment fee' },
                    { campo: net === 'visa' ? 'IRD discrepancy (VSS)' : 'IRD discrepancy (MCBS)', meta: '0 divergências entre esperado e cobrado', alerta: 'Qualquer desvio = downgrade silencioso' },
                  ].map(({ campo, meta, alerta }) => (
                    <div key={campo} className="rounded-lg bg-muted/25 p-3">
                      <div className="font-bold text-foreground mb-1">{campo}</div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <CheckCircle2 size={10} className="text-green-400 shrink-0" />
                        <span className="text-muted-foreground">{meta}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <AlertTriangle size={10} className="text-amber-400 shrink-0" />
                        <span className="text-amber-400/80">{alerta}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Footer */}
            <div className="pt-4 border-t border-border flex flex-wrap gap-4 text-sm">
              <Link href="/simulador"   className="text-primary hover:underline flex items-center gap-1">Simular intercâmbio <ChevronRight size={12} /></Link>
              <Link href="/mdr"         className="block text-xs text-primary hover:underline flex items-center gap-1">Fluxo MDR <ChevronRight size={12} /></Link>
              <Link href="/comparativo" className="text-primary hover:underline flex items-center gap-1">Comparativo V×MC <ChevronRight size={12} /></Link>
              <Link href="/mcbs"        className="text-primary hover:underline flex items-center gap-1">Fees MCBS <ChevronRight size={12} /></Link>
              <Link href="/artigos/vdcap-taf-scof" className="text-primary hover:underline flex items-center gap-1">Artigo: VDCAP/TAF <ChevronRight size={12} /></Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
