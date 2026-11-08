'use client';

import React, { useMemo, useState } from 'react';
import { OutgoingBrandId, OUTGOING_BRANDS } from '@/data/outgoing-tables-flows';
import { sendToDocStudio } from '@/lib/docStudioBridge';

export type ProgramFamilyId =
  | 'all'
  | 'data_integrity'
  | 'interchange_downgrade'
  | 'auth_retry'
  | 'fraud_dispute'
  | 'brand_merchant_risk';

export interface SchemeProgramLevel {
  levelName: string;
  threshold: string;
  penaltyOrImpact: string;
  severity: 'info' | 'warning' | 'critical';
}

export interface SchemeProgramItem {
  id: string;
  brand: OutgoingBrandId;
  code: string;
  name: string;
  family: Exclude<ProgramFamilyId, 'all'>;
  familyLabel: string;
  periodicity: string;
  mandatoryStatus: 'Monitoramento Obrigatório da Bandeira' | 'Qualificação Tarifária Automática';
  summary: string;
  formulaOrMetric: string;
  outgoingAndAuthConnection: string;
  fieldsAndTablesInvolved: string[];
  levels: SchemeProgramLevel[];
  preventionAndWaiverPlaybook: string[];
  officialSource: string;
}

export const PROGRAM_FAMILIES: {
  id: ProgramFamilyId;
  title: string;
  subtitle: string;
  badge: string;
}[] = [
  {
    id: 'all',
    title: 'Todos os Programas (Visão Geral)',
    subtitle: 'Catálogo completo de programas de Data Integrity, Intercâmbio, Autorização, Fraude, Disputas e Risco.',
    badge: '18 Programas',
  },
  {
    id: 'data_integrity',
    title: '1. Data Integrity & Qualidade de Mensageria',
    subtitle: 'Auditoria de consistência entre Autorização (0100/0110) e Outgoing (Base II / GCMS / Elo).',
    badge: 'Edit & Consistência',
  },
  {
    id: 'interchange_downgrade',
    title: '2. Qualificação de Intercâmbio & Downgrade',
    subtitle: 'Programas que definem se a transação recebe tarifa qualificada ou sofre downgrade (CPS, IRD, Produto).',
    badge: 'Fee & Intercâmbio',
  },
  {
    id: 'auth_retry',
    title: '3. Retentativas de Autorização & CIT/MIT',
    subtitle: 'Limites de retentativas após recusa definitiva, Merchant Advice Code (MAC) e Credenciais Armazenadas.',
    badge: 'Auth & Retry',
  },
  {
    id: 'fraud_dispute',
    title: '4. Monitoramento de Fraude & Chargeback',
    subtitle: 'Programas mensais de controle de razão de fraude e disputas sobre o volume liquidado no Outgoing.',
    badge: 'VAMP · ECP · EFM · PED/PEF',
  },
  {
    id: 'brand_merchant_risk',
    title: '5. Integridade de Marca, MCC & Subcredenciadores',
    subtitle: 'Controle de atividade proibida, MCC incorreto, lista restritiva MATCH e cadastro de PayFac.',
    badge: 'VIRP · BRAM · MATCH · QMAP',
  },
];

export const SCHEME_PROGRAMS_CATALOG: SchemeProgramItem[] = [
  // =========================================================================
  // 1. DATA INTEGRITY & QUALIDADE DE MENSAGERIA
  // =========================================================================
  {
    id: 'visa-data-integrity',
    brand: 'visa',
    code: 'VDI / Base II Edit',
    name: 'Visa Data Integrity & Base II Edit Package Compliance',
    family: 'data_integrity',
    familyLabel: '1. Data Integrity & Mensageria',
    periodicity: 'Diário (por lote Base II) + Auditoria Mensal (VSS-140 / V22120)',
    mandatoryStatus: 'Monitoramento Obrigatório da Bandeira',
    summary:
      'Audita se os campos enviados na Autorização (0100/0110) foram preservados com exatidão no arquivo de Outgoing Base II (TCR 0, TCR 1, TCR 5, TCR E) e se os registros cumprem as regras sintáticas do Edit Package.',
    formulaOrMetric:
      'Taxa de Divergência Auth × Clearing = Transações sem match de TID (DE 62.2) / Total Liquidado TC 05 + Taxa de Rejeição VX-100A',
    outgoingAndAuthConnection:
      'Conecta diretamente o DE 62.2 (Transaction Identifier de 15 dígitos gerado pela Visa na 0110), DE 38 (Auth Code) e DE 22 (POS Entry Mode) às posições correspondentes do TCR 0 e TCR 5 no Outgoing.',
    fieldsAndTablesInvolved: [
      '0110 DE 62.2 (TID 15 díg.) ➔ TCR 0 / TCR 5',
      '0110 DE 38 (Auth Code) ➔ TCR 0 pos 149–154',
      '0100 DE 22 (POS Entry Mode) ➔ TCR 0 pos 158–160',
      'TCR E (PayFac ID + Sub-Merchant Tax ID)',
      'Relatórios: VX-100A, VX-120F e VSS-140 / TC 46',
    ],
    levels: [
      {
        levelName: 'Rejeição Sintática no Edit Package (T+0)',
        threshold: 'Erro de formato ou ausência de TCR obrigatório no lote Base II',
        penaltyOrImpact: 'Transação rejeitada no VX-100A / VX-120F (não liquidada até correção e reenvio)',
        severity: 'warning',
      },
      {
        levelName: 'Data Integrity Fee / Processamento sem TID ou Auth Code Válido',
        threshold: 'Envio de TC 05 sem DE 62.2 (TID) ou com divergência de valor/moeda sem indicador válido',
        penaltyOrImpact: 'Cobrança de Data Integrity Fee por transação no VSS-140 + Downgrade para EIRF',
        severity: 'critical',
      },
    ],
    preventionAndWaiverPlaybook: [
      'Persistir os 15 dígitos do DE 62.2 (Transaction Identifier) da resposta 0110 no banco transacional e torná-lo campo obrigatório na geração do TCR 0/TCR 5.',
      'Bloquear na pré-crítica interna (antes de gerar o CTF) qualquer transação aprovada sem DE 38 (Auth Code) válido ou com MCC divergente da autorização.',
      'Em caso de incidente sistêmico pontual entre autorização e clearing, documentar a janela exata, os ARNs afetados e protocolar pedido de Waiver técnico demonstrando a correção definitiva do motor.',
    ],
    officialSource: 'Visa Base II Clearing Interchange Formats & Visa Core Rules — Data Integrity',
  },
  {
    id: 'mc-gdip-compliance',
    brand: 'mastercard',
    code: 'GDIP / MPE Edit',
    name: 'Mastercard Global Data Integrity Program (GDIP) & GCMS Edit Compliance',
    family: 'data_integrity',
    familyLabel: '1. Data Integrity & Mensageria',
    periodicity: 'Diário (T112 / IP714010) + Faturamento Mensal MCBS',
    mandatoryStatus: 'Monitoramento Obrigatório da Bandeira',
    summary:
      'Monitora a integridade dos elementos ISO 8583 e subelementos PDS enviados na autorização (0100/0110) e no clearing (MTI 1240). Penaliza discrepâncias de Trace ID, Point of Service (DE 22/DE 61), subcredenciador sem PDS 0176/0208/0220 e erros aceitos com ressalva (IP714010-AA).',
    formulaOrMetric:
      'Transações com violação de regra de integridade (DE/PDS ausente, inválido ou divergente da 0110) auditadas pelo MPE/GCMS',
    outgoingAndAuthConnection:
      'Audita o pareamento entre o DE 63 (Network Data: Financial Network Code + Banknet Reference + Data Juliano da 0110) e o PDS 0158 do MTI 1240, além da consistência de DE 22, PDS 0023 e PDS 0195.',
    fieldsAndTablesInvolved: [
      '0110 DE 63 (Trace ID 9 pos) ➔ MTI 1240 PDS 0158',
      '0100 DE 22 / DE 61 ➔ MTI 1240 DE 22 + PDS 0023',
      'MTI 1240 PDS 0148 (Expoente da Moeda BRL=2)',
      'MTI 1240 PDS 0176 + PDS 0208 + PDS 0220 (PayFac)',
      'Relatórios: T112 (IP857010-AA) e IP714010-AA / IP714010-BB',
    ],
    levels: [
      {
        levelName: 'Accepted with Errors (IP714010-AA) / Updated Values (IP714010-BB)',
        threshold: 'Transação liquidada pelo GCMS com campo PDS inconsistente ou corrigido pela rede',
        penaltyOrImpact: 'Tarifa de processamento de erro + rebaixamento automático do IRD (PDS 0158)',
        severity: 'warning',
      },
      {
        levelName: 'GDIP Non-Compliance Assessment (Mensal no MCBS)',
        threshold: 'Reincidência sistemática de violação de integridade de dados (ex.: ausência de Trace ID ou PayFac ID)',
        penaltyOrImpact: 'Multa progressiva por transação ou lote faturada nos eventos MCBS da adquirente',
        severity: 'critical',
      },
    ],
    preventionAndWaiverPlaybook: [
      'Monitorar diariamente os relatórios IP714010-AA (Accepted Transactions with Errors) e IP714010-BB (Updated Merchant Values): eles avisam o erro antes da multa mensal no MCBS.',
      'Garantir que o construtor do MTI 1240 copie integralmente os 9 bytes do DE 63 da 0110 para o PDS 0158.',
      'Validar o preenchimento simultâneo do trio PDS 0176 + PDS 0208 + PDS 0220 sempre que o merchant for Subcredenciador.',
    ],
    officialSource: 'Mastercard Global Data Integrity Program Guide & GCMS Reference Manual 26.2',
  },
  {
    id: 'elo-qualidade-remessa',
    brand: 'elo',
    code: 'PQR / Crítica TE01',
    name: 'Programa de Qualidade de Remessa & Consistência Autorização × Liquidação Elo',
    family: 'data_integrity',
    familyLabel: '1. Data Integrity & Mensageria',
    periodicity: 'Diário (Arquivo de Retorno TE01 Reg 09) + Mensal',
    mandatoryStatus: 'Monitoramento Obrigatório da Bandeira',
    summary:
      'Valida a integridade posicional de todos os registros de 168 bytes enviados na remessa Elo (TE05, TE06, TE15, TE53) e o espelhamento fiel dos dados de autorização (NSU, Código de Autorização, Produto, Parcelas e Subcredenciador).',
    formulaOrMetric:
      'Volume de Registros Rejeitados no Retorno TE01 (Registro 09) + Transações com divergência de parcelamento (990–995) ou CNPJ de Subcredenciador',
    outgoingAndAuthConnection:
      'Se um campo condicional obrigatório no fluxo (ex.: CNPJ do Subcredenciador no Reg 01 pos 72–85 ou dados do EC Final no Reg 02 Campos 140/150) não for enviado, a bandeira devolve TE01 com Registro 09 (4 dígitos de erro) e bloqueia a liquidação no SLC.',
    fieldsAndTablesInvolved: [
      'Reg 00 pos 93–98 (Código de Autorização DE 38)',
      'Reg 01 pos 63–65 (Código do Produto Elo)',
      'Reg 01 pos 72–85 (CNPJ Subcredenciador) + Reg 02 Campos 140/150',
      'Reg 00/01/02 Tipo de Operação 990 a 995 (Parcelado/IATA)',
      'Relatório: Arquivo de Retorno TE01 com Registro 09',
    ],
    levels: [
      {
        levelName: 'Rejeição Parcial de Transação (TE01 + Registro 09)',
        threshold: '1 ou mais códigos de erro de 4 dígitos nas posições 19–66 do Registro 09',
        penaltyOrImpact: 'Transação excluída da Agenda Financeira E0–E9 e não liquidada na CIP/SLC até reenvio saneado',
        severity: 'warning',
      },
      {
        levelName: 'Rejeição Total de Lote (Erro de Header BZ / Trailer Z9)',
        threshold: 'Inconsistência na somatória de registros ou número de remessa duplicado',
        penaltyOrImpact: 'Lote inteiro recusado na janela T+0; risco de Late Presentment se não reenviado no mesmo ciclo',
        severity: 'critical',
      },
    ],
    preventionAndWaiverPlaybook: [
      'Automatizar a leitura do Arquivo de Retorno TE01 (Registro 09 pos 19–66) imediatamente após o envio da remessa para corrigir e reenviar no mesmo dia.',
      'Validar a regra de consistência de Parcelado (se Reg 00 pos 69 = P ou E, o Tipo de Operação 990/991/993/994 e a quantidade de parcelas no Reg 01 são 100% obrigatórios).',
    ],
    officialSource: 'Manual de Mensageria de Liquidação Elo — Versão 26.2 (Cap. 2, 3 e 4)',
  },

  // =========================================================================
  // 2. QUALIFICAÇÃO DE INTERCÂMBIO & DOWNGRADE
  // =========================================================================
  {
    id: 'visa-cps-fpi-downgrade',
    brand: 'visa',
    code: 'CPS / FPI / EIRF',
    name: 'Visa Custom Payment Service (CPS), Fee Program Indicator (FPI) & EIRF Downgrade',
    family: 'interchange_downgrade',
    familyLabel: '2. Qualificação de Intercâmbio & Downgrade',
    periodicity: 'Por transação no Clearing Base II (Auditado no VSS-130)',
    mandatoryStatus: 'Qualificação Tarifária Automática',
    summary:
      'Define a tarifa de intercâmbio (Interchange Reimbursement Fee) de cada transação no Base II. Transações que cumprem todos os requisitos de dados (TID, Auth Code, POS Entry Mode, CAVV/3DS) e de prazo (Timeliness) qualificam para taxas ótimas; falhas rebaixam a transação para EIRF (Electronic Interchange Reimbursement Fee) ou Standard.',
    formulaOrMetric:
      'Volume Liquidado em EIRF / Standard vs Volume Qualificado CPS (relatório VSS-130)',
    outgoingAndAuthConnection:
      'Para qualificar na melhor tarifa, o TC 05 precisa conter o DE 62.2 (TID da 0110), o FPI correto no TCR 0 pos 166–168 (ou TCR 5), o código de autorização válido e ser enviado dentro do prazo máximo de apresentação.',
    fieldsAndTablesInvolved: [
      'TCR 0 pos 166–168 (Fee Program Indicator — FPI)',
      'TCR 5 (Payment Service Data — TID, ACI, Validação CPS)',
      'TCR 2 BR pos 40–41 (Parcelas + 10 no Brasil)',
      'TCR 7 (Dados de Chip EMV quando POS Entry = 05)',
      'Relatórios: VSS-130 (Interchange) e VX-204A',
    ],
    levels: [
      {
        levelName: 'Qualificação Ótima (CPS / FPI Doméstico Brasil)',
        threshold: 'TID presente + Auth Code válido + Prazo D+0/D+1 + Dados de canal completos',
        penaltyOrImpact: 'Aplicação da menor alíquota de intercâmbio prevista na tabela oficial Visa Brasil',
        severity: 'info',
      },
      {
        levelName: 'Downgrade para EIRF / Standard Rate',
        threshold: 'Ausência de TID (DE 62.2), atraso de envio (Timeliness) ou inconsistência entre canal autorizado e liquidado',
        penaltyOrImpact: 'Aumento direto do custo de intercâmbio pago ao emissor (compressão da margem MDR da adquirente)',
        severity: 'critical',
      },
    ],
    preventionAndWaiverPlaybook: [
      'Cruzar diariamente o relatório VSS-130 com o FPI esperado pelo motor de precificação da adquirente.',
      'Nunca enviar TC 05 de transação EMV (POS 05/07) sem o registro TCR 7 ou sem o TID da autorização.',
    ],
    officialSource: 'Visa Base II Clearing Interchange Formats & Visa Brasil Interchange Schedule',
  },
  {
    id: 'mc-ird-qualification',
    brand: 'mastercard',
    code: 'IRD (PDS 0158)',
    name: 'Mastercard Interchange Rate Designator (IRD) Qualification & Downgrade Rules',
    family: 'interchange_downgrade',
    familyLabel: '2. Qualificação de Intercâmbio & Downgrade',
    periodicity: 'Por transação no GCMS (Auditado no IP728010 / IP714010-BB)',
    mandatoryStatus: 'Qualificação Tarifária Automática',
    summary:
      'O código IRD de 2 caracteres (dentro do PDS 0158) determina a alíquota exata de intercâmbio da transação no GCMS. Se o adquirente solicitar um IRD qualificado sem cumprir os critérios de Trace ID, prazo (Timeliness) ou campos mandatórios do canal, o GCMS sobrescreve o IRD para uma tarifa mais cara (relatório IP714010-BB).',
    formulaOrMetric:
      'Taxa de Rebaixamento de IRD = Transações com IRD alterado no IP714010-BB / Total Enviado no MTI 1240',
    outgoingAndAuthConnection:
      'Depende diretamente do preenchimento completo do PDS 0158 (incluindo o Trace ID de 9 bytes vindo do DE 63 da 0110), do PDS 0195 (Parcelado Brasil) e do respeito ao prazo de apresentação (DE 12 vs Data de Processamento GCMS).',
    fieldsAndTablesInvolved: [
      'MTI 1240 PDS 0158 (IRD + Trace ID DE 63)',
      'MTI 1240 PDS 0195 (Installment Data Brasil)',
      'MTI 1240 DE 55 (Dados EMV em transações Chip)',
      'Relatórios: IP714010-BB (Updated Merchant Values) e IP728010',
    ],
    levels: [
      {
        levelName: 'IRD Acatado (Qualificação Plena)',
        threshold: 'Critérios técnicos e prazo de envio atendidos no MTI 1240',
        penaltyOrImpact: 'Intercâmbio calculado exatamente conforme a tabela doméstica/internacional esperada',
        severity: 'info',
      },
      {
        levelName: 'IRD Sobrescrito pelo GCMS (Downgrade no IP714010-BB)',
        threshold: 'Falta de Trace ID, atraso > prazo do IRD ou ausência de PDS obrigatório',
        penaltyOrImpact: 'GCMS altera o IRD para Standard/Key-Entered, elevando o intercâmbio descontado no T461',
        severity: 'critical',
      },
    ],
    preventionAndWaiverPlaybook: [
      'Configurar alerta automático sobre o relatório IP714010-BB: toda linha ali representa perda financeira direta por downgrade de IRD.',
      'Garantir envio do arquivo MTI 1240 no mesmo dia (D+0) ou no máximo D+1 para não estourar a regra de Timeliness do IRD.',
    ],
    officialSource: 'Mastercard GCMS Reference Manual & Brazil Interchange Programs Guide',
  },
  {
    id: 'elo-qualificacao-intercambio',
    brand: 'elo',
    code: 'Prod 63 / 3DS / 990',
    name: 'Qualificação de Intercâmbio por Produto, Modalidade e Autenticação Elo',
    family: 'interchange_downgrade',
    familyLabel: '2. Qualificação de Intercâmbio & Downgrade',
    periodicity: 'Por transação na Remessa TE05 (Auditado nos Relatórios E1 e Cap. 6)',
    mandatoryStatus: 'Qualificação Tarifária Automática',
    summary:
      'Define o valor de intercâmbio devolvido no Registro E1 (posições 94–105 da Agenda do Credenciador) com base na combinação de Código do Produto (Reg 01 pos 63–65), Modalidade (Crédito/Débito/Parcelado 990–995), Canal de Captura e Autenticação 3DS (Reg 02 pos 60).',
    formulaOrMetric:
      'Taxa Efetiva de Intercâmbio = Valor do Intercâmbio (E1 pos 94–105) / Valor Bruto da Transação (E1 pos 81–92)',
    outgoingAndAuthConnection:
      'Exige que o Código do Produto recebido na autorização seja enviado no Registro 01 (pos 63–65) e que transações autenticadas levem o CAVV e o indicador 3DS 2.x no Registro 02 (pos 17–58 e pos 60).',
    fieldsAndTablesInvolved: [
      'Registro 01 pos 63–65 (Código do Produto Elo)',
      'Registro 00/01/02 Tipo de Operação 990–995',
      'Registro 02 pos 17–58 (CAVV) + pos 60 (Versão 3DS)',
      'Relatórios: Agenda do Credenciador E1 (Cap. 5) e Relatórios de Originador (Cap. 6)',
    ],
    levels: [
      {
        levelName: 'Qualificação por Produto e Canal',
        threshold: 'Produto Elo + Indicadores de Canal/3DS enviados corretamente nos Registros 00, 01 e 02',
        penaltyOrImpact: 'Aplicação correta do intercâmbio diferenciado por produto e segmento (MCC)',
        severity: 'info',
      },
      {
        levelName: 'Perda de Benefício Tarifário / Rejeição de Qualificador',
        threshold: 'Omissão do Código do Produto ou de indicadores de autenticação 3DS no Registro 02',
        penaltyOrImpact: 'Aplicação da tarifa cheia da modalidade sem redutor de segurança/produto',
        severity: 'warning',
      },
    ],
    preventionAndWaiverPlaybook: [
      'Conciliar diariamente a coluna de Intercâmbio do Registro E1 (pos 94–105) contra a tabela vigente Elo por MCC e Produto.',
    ],
    officialSource: 'Manual de Mensageria de Liquidação Elo 26.2 — Cap. 5 e 6',
  },

  // =========================================================================
  // 3. RETENTATIVAS DE AUTORIZAÇÃO & CREDENCIAIS ARMAZENADAS (CIT/MIT)
  // =========================================================================
  {
    id: 'visa-misuse-retry-citmit',
    brand: 'visa',
    code: 'Retry / CIT-MIT',
    name: 'Visa Misuse of Authorization System, Reattempt Rules & Stored Credential (CIT/MIT)',
    family: 'auth_retry',
    familyLabel: '3. Retentativas & CIT/MIT',
    periodicity: 'Tempo Real na Autorização + Auditoria Mensal no VSS-140',
    mandatoryStatus: 'Monitoramento Obrigatório da Bandeira',
    summary:
      'Proíbe retentativas de autorização após códigos de recusa definitiva (Category 1 — Do Not Retry, ex.: conta encerrada, cartão inválido) e limita retentativas nas demais recusas a no máximo 15 tentativas em 30 dias corridos. Também exige que toda transação recorrente/MIT referencie o TID (DE 62.2) da primeira transação CIT.',
    formulaOrMetric:
      'Tentativas em códigos Category 1 (tolerância zero) OU > 15 retentativas no mesmo PAN em 30 dias corridos',
    outgoingAndAuthConnection:
      'Para transações MIT (Merchant-Initiated Transaction), o TID original de 15 dígitos da primeira compra CIT deve ser armazenado e enviado na autorização subsequente e preservado no clearing Base II.',
    fieldsAndTablesInvolved: [
      '0110 DE 39 (Response Code — Category 1/2/3/4)',
      '0100/0110 DE 62.2 (Original Transaction Identifier em MIT)',
      'TCR 0 / TCR 5 (Indicadores de Stored Credential / Recorrência)',
      'Relatório: VSS-140 (Visa Charges — Misuse of Auth / Retry Fees)',
    ],
    levels: [
      {
        levelName: 'Category 1 Decline (Do Not Retry)',
        threshold: 'Qualquer retentativa após recusa Category 1 (ex.: DE 39 = 14, 41, 43, 54, R0, R1, R3)',
        penaltyOrImpact: 'Multa automática por tentativa indevida faturada no VSS-140',
        severity: 'critical',
      },
      {
        levelName: 'Excesso de Retentativas (> 15 em 30 dias)',
        threshold: '16ª tentativa ou superior para o mesmo cartão em janela móvel de 30 dias',
        penaltyOrImpact: 'Cobrança de Excessive Retry Fee por tentativa excedente no VSS-140',
        severity: 'warning',
      },
    ],
    preventionAndWaiverPlaybook: [
      'Implementar bloqueio automático (Circuit Breaker de Retentativa) no gateway/autorizador para códigos Category 1 e contador por PAN/Token limitado a 15 tentativas em 30 dias.',
      'Armazenar obrigatoriamente o DE 62.2 da primeira transação CIT junto ao token/cofre de recorrência para popular todas as MITs seguintes.',
    ],
    officialSource: 'Visa Core Rules — Authorization Reattempt & Stored Credential Transaction Framework',
  },
  {
    id: 'mc-excessive-auth-mac',
    brand: 'mastercard',
    code: 'MAC (DE 48 SE 84)',
    name: 'Mastercard Excessive Authorization Attempts & Merchant Advice Code (MAC) Rules',
    family: 'auth_retry',
    familyLabel: '3. Retentativas & CIT/MIT',
    periodicity: 'Tempo Real na 0110 + Faturamento Mensal no MCBS',
    mandatoryStatus: 'Monitoramento Obrigatório da Bandeira',
    summary:
      'Regula o comportamento de retentativa com base no Merchant Advice Code (MAC — DE 48 Subelemento 84 retornado na 0110) e exige a identificação correta de transações CIT/MIT no DE 48 SE 22 e no clearing MTI 1240.',
    formulaOrMetric:
      'Retentativas realizadas após MAC 03 (Do Not Try Again) ou MAC 21 (Cancelamento de Recorrência pelo Portador)',
    outgoingAndAuthConnection:
      'O autorizador deve ler o DE 48 SE 84 na resposta 0110 para impedir novas tentativas quando MAC = 03 ou 21, e o motor de Outgoing deve espelhar os indicadores CIT/MIT e o Trace ID original no MTI 1240.',
    fieldsAndTablesInvolved: [
      '0110 DE 48 SE 84 (Merchant Advice Code: 01, 02, 03, 21, 24)',
      '0100 DE 48 SE 22 (Multi-Purpose Merchant Indicator — CIT/MIT)',
      'MTI 1240 PDS 0158 (Trace ID)',
      'Relatório: Eventos de Excessive Auth Fee na fatura MCBS',
    ],
    levels: [
      {
        levelName: 'Retentativa após MAC 03 ou MAC 21',
        threshold: 'Nova tentativa enviada após o emissor retornar MAC 03 (Não tentar novamente) ou MAC 21 (Recorrência cancelada)',
        penaltyOrImpact: 'Multa por tentativa indevida cobrada no MCBS + degradação da taxa de aprovação do BIN adquirente',
        severity: 'critical',
      },
    ],
    preventionAndWaiverPlaybook: [
      'Fazer parse obrigatório do DE 48 SE 84 (MAC) na resposta 0110 e devolver instrução clara de "Do Not Retry" na API para o merchant/subcredenciador quando MAC = 03 ou 21.',
    ],
    officialSource: 'Mastercard Authorization Manual & Transaction Processing Rules (CIT/MIT & MAC)',
  },

  // =========================================================================
  // 4. MONITORAMENTO DE FRAUDE & CHARGEBACK
  // =========================================================================
  {
    id: 'visa-vamp',
    brand: 'visa',
    code: 'VAMP',
    name: 'Visa Acquirer Monitoring Program (VAMP — Consolidado Fraude TC40 + Disputas TC15)',
    family: 'fraud_dispute',
    familyLabel: '4. Fraude & Chargeback',
    periodicity: 'Mensal (Baseado nos registros TC 40, TC 15 e TC 05 do Base II)',
    mandatoryStatus: 'Monitoramento Obrigatório da Bandeira',
    summary:
      'Principal programa global da Visa para monitorar adquirentes e merchants. Calcula a razão combinada de notificações de fraude (TC 40) e disputas não-fraude (TC 15) dividida pelo total de transações liquidadas (TC 05), além de monitorar ataques de enumeração de cartões.',
    formulaOrMetric:
      'VAMP Ratio = (Transações Fraude TC 40 + Disputas TC 15) / Total de Transações Liquidadas (TC 05)',
    outgoingAndAuthConnection:
      'O denominador da fórmula vem diretamente do total de registros TC 05 liquidados no Outgoing Base II, e o numerador vem dos registros TC 40 (Fraud Reporting) e TC 15 (Dispute Financial). Se o adquirente envia descritores de merchant ou MIDs incorretos no TCR 0/TCR E, a concentração por merchant estoura o limite VAMP.',
    fieldsAndTablesInvolved: [
      'TC 05 (Denominador — Volume total liquidado no Base II)',
      'TC 15 (Disputas / Chargebacks recebidos)',
      'TC 40 (Notificações de Fraude do Emissor)',
      'TCR 0 / TCR E (Identificação correta do Merchant / Sub-Merchant)',
    ],
    levels: [
      {
        levelName: 'Adquirente — Above Standard',
        threshold: 'VAMP Ratio ≥ 0,50% (50 bps) e ≥ 1.500 transações (TC40 + TC15)',
        penaltyOrImpact: 'Multa de US$ 5.000 (Mês 1), US$ 10.000 (Mês 2), US$ 15.000 (Mês 3+) + Plano de Remediação',
        severity: 'warning',
      },
      {
        levelName: 'Adquirente — Excessive',
        threshold: 'VAMP Ratio ≥ 0,70% (70 bps) e ≥ 1.500 transações (TC40 + TC15)',
        penaltyOrImpact: 'Multa de US$ 10.000 (Mês 1), US$ 20.000 (Mês 2), US$ 30.000 (Mês 3+) + restrições operacionais',
        severity: 'critical',
      },
      {
        levelName: 'Merchant LAC / Enumeration Attack',
        threshold: 'Merchant ≥ 1,50% (150 bps) na região LAC OU Enumeração ≥ 2.000 bps / 300.000 tentativas',
        penaltyOrImpact: 'Multas de US$ 25.000 a US$ 75.000 se não remediado',
        severity: 'critical',
      },
    ],
    preventionAndWaiverPlaybook: [
      'Garantir que no fluxo de Subcredenciador (PayFac) cada sub-merchant tenha seu próprio identificador distinto no TCR E: agrupar vários sub-merchants sob um único ID genérico concentra todos os TC40/TC15 em um só "merchant" perante a Visa.',
      'Ativar 3DS 2.2 (TCR 5 CAVV/ECI 05) e Rapid Dispute Resolution (RDR / Verifi) para reduzir o numerador do VAMP.',
    ],
    officialSource: 'Visa Acquirer Monitoring Program (VAMP) Guide & Visa Core Rules',
  },
  {
    id: 'mc-ecp',
    brand: 'mastercard',
    code: 'ECP (ECM / HECM)',
    name: 'Mastercard Excessive Chargeback Program (ECP — ECM & HECM)',
    family: 'fraud_dispute',
    familyLabel: '4. Fraude & Chargeback',
    periodicity: 'Mensal (Por Merchant ID — DE 42 enviado no MTI 1240)',
    mandatoryStatus: 'Monitoramento Obrigatório da Bandeira',
    summary:
      'Monitora mensalmente cada estabelecimento (MID — DE 42) que ultrapassa simultaneamente o piso mínimo de quantidade de chargebacks (MTI 1442) e a razão máxima sobre as transações do mês anterior.',
    formulaOrMetric:
      'Chargeback Ratio (CBR) = Total de Chargebacks (MTI 1442 no mês T) / Total de Transações Aprovadas/Liquidadas (no mês T-1)',
    outgoingAndAuthConnection:
      'A apuração é feita por DE 42 (Card Acceptor ID Code) e, em caso de Subcredenciador, por PDS 0208 (Sub-Merchant ID) enviados no MTI 1240. Se o adquirente não segregar corretamente o PDS 0208 no Outgoing, todos os chargebacks caem na conta única do PayFac.',
    fieldsAndTablesInvolved: [
      'MTI 1240 DE 42 (Card Acceptor ID Code — MID)',
      'MTI 1240 PDS 0176 + PDS 0208 (Segregação de Sub-Merchant)',
      'MTI 1442 (First Chargeback recebido no Incoming GCMS)',
    ],
    levels: [
      {
        levelName: 'ECM — Excessive Chargeback Merchant',
        threshold: '≥ 100 chargebacks E razão CBR ≥ 1,50% (150 bps)',
        penaltyOrImpact: 'Multas mensais progressivas de US$ 1.000 (Mês 1) até US$ 10.000 (Mês 6+)',
        severity: 'warning',
      },
      {
        levelName: 'HECM — High Excessive Chargeback Merchant',
        threshold: '≥ 300 chargebacks E razão CBR ≥ 3,00% (300 bps)',
        penaltyOrImpact: 'Multas mensais de US$ 2.000 (Mês 1) até US$ 20.000 (Mês 6+) + obrigação de listagem no MATCH se encerrado',
        severity: 'critical',
      },
    ],
    preventionAndWaiverPlaybook: [
      'Auditar no MTI 1240 se todo sub-merchant possui código único no PDS 0208 para evitar contaminação cruzada de chargebacks.',
      'Monitorar internamente os MIDs que atingirem 0,90% de CBR e 70 chargebacks no dia 20 do mês para agir antes do fechamento mensal da Mastercard.',
    ],
    officialSource: 'Mastercard Security Rules and Procedures — Excessive Chargeback Program (ECP)',
  },
  {
    id: 'mc-efm',
    brand: 'mastercard',
    code: 'EFM',
    name: 'Mastercard Excessive Fraud Merchant Program (EFM — E-Commerce CNP)',
    family: 'fraud_dispute',
    familyLabel: '4. Fraude & Chargeback',
    periodicity: 'Mensal (Por Merchant ID em transações CNP)',
    mandatoryStatus: 'Monitoramento Obrigatório da Bandeira',
    summary:
      'Monitora estabelecimentos de e-commerce (Card Not Present) que apresentam alto volume financeiro de fraude reportada no SAFE combinada com baixa utilização de autenticação 3DS 2.x (< 10%).',
    formulaOrMetric:
      'Volume de Fraude SAFE ≥ US$ 50.000 + Taxa de Fraude ≥ 0,50% (50 bps) + Uso de 3DS < 10% do volume CNP',
    outgoingAndAuthConnection:
      'Para comprovar o uso de 3DS e ficar isento do EFM (acima de 10% ou 50% conforme faixa), os dados de autenticação 3DS (DE 48 SE 42 / UCAF / Directory Server Transaction ID) precisam ser enviados na autorização e preservados no clearing.',
    fieldsAndTablesInvolved: [
      '0100/1240 DE 48 SE 42 / SE 66 (Dados 3DS 2.x / UCAF)',
      'MTI 1240 DE 42 + PDS 0208 (Identificação do Merchant CNP)',
      'Notificações de Fraude SAFE (System to Avoid Fraud Effectively)',
    ],
    levels: [
      {
        levelName: 'Nível 1 (50 a 99 bps)',
        threshold: 'Fraude ≥ US$ 50k + Taxa ≥ 0,50% + 3DS < 10%',
        penaltyOrImpact: 'Multa de US$ 500 (Mês 1), US$ 1.000 (Mês 2), US$ 2.000 (Mês 3+)',
        severity: 'warning',
      },
      {
        levelName: 'Nível 2 (100 a 149 bps) & Nível 3 (≥ 150 bps)',
        threshold: 'Fraude ≥ US$ 50k + Taxa ≥ 1,00% / 1,50% + 3DS < 10%',
        penaltyOrImpact: 'Multas de US$ 1.000 a US$ 8.000/mês',
        severity: 'critical',
      },
    ],
    preventionAndWaiverPlaybook: [
      'Ativar 3DS 2.2 (Mastercard Identity Check) em pelo menos 10%+ das transações do merchant: elevar o índice de transações autenticadas retira imediatamente o estabelecimento do critério de entrada do EFM.',
    ],
    officialSource: 'Mastercard Security Rules and Procedures — Excessive Fraud Merchant (EFM)',
  },
  {
    id: 'elo-ped-pef',
    brand: 'elo',
    code: 'PED & PEF',
    name: 'Programas de Excelência em Disputas (PED) e em Fraude (PEF) Elo',
    family: 'fraud_dispute',
    familyLabel: '4. Fraude & Chargeback',
    periodicity: 'Mensal',
    mandatoryStatus: 'Monitoramento Obrigatório da Bandeira',
    summary:
      'Programas oficiais da Elo que monitoram mensalmente estabelecimentos e credenciadoras com excesso de disputas (TE15 — PED) ou excesso de fraude em compras não presenciais com baixo uso de 3DS (PEF).',
    formulaOrMetric:
      'PED: Taxa de Disputas > 1,49% (> 1.000 aprovadas e > 100 disputas) | PEF: Fraude ≥ R$ 150.000 + Taxa ≥ 0,50% + 3DS < 10%',
    outgoingAndAuthConnection:
      'A identificação do estabelecimento vem do Registro 00 (pos 45–59 EC) e, para subcredenciadores, do Registro 01 (pos 72–85 CNPJ Subcred) + Registro 02 (Campos 140/150 CPF/CNPJ do EC Final). A comprovação de 3DS vem do Registro 02 (pos 17–60).',
    fieldsAndTablesInvolved: [
      'Registro 00 pos 45–59 (Código do EC) + Registro 01 pos 72–85 (CNPJ Subcred)',
      'Registro 02 Campos 140/150 (Documento do EC Final)',
      'Registro 02 pos 17–58 (CAVV) + pos 60 (Versão 3DS 2.x)',
      'TE15 (Disputas / Chargebacks recebidos)',
    ],
    levels: [
      {
        levelName: 'PED — Alerta de Disputas',
        threshold: 'Taxa > 1,49% + > 100 disputas + > 1.000 transações no mês',
        penaltyOrImpact: 'Plano de ação em 30 dias; penalidade de até R$ 15.000+ se não remediado em 60 dias',
        severity: 'warning',
      },
      {
        levelName: 'PEF — Níveis 1 e 2 de Fraude CNP',
        threshold: 'Fraude ≥ R$ 150k + Taxa ≥ 0,50% (Nível 1) ou ≥ 1,00% (Nível 2) + 3DS < 10%',
        penaltyOrImpact: 'Penalidades mensais progressivas caso o uso de 3DS e a razão de fraude não sejam corrigidos',
        severity: 'critical',
      },
    ],
    preventionAndWaiverPlaybook: [
      'Garantir que o Registro 02 das transações e-commerce Elo sempre transporte o CAVV (pos 17–58) e o indicador de versão 3DS (pos 60) quando autenticadas.',
      'Segregar corretamente o CPF/CNPJ do vendedor final nos campos 140/150 do Registro 02.',
    ],
    officialSource: 'Manuais de Compliance, Disputas e Mensageria de Liquidação Elo 26.2',
  },

  // =========================================================================
  // 5. INTEGRIDADE DE MARCA, MCC & SUBCREDENCIADORES
  // =========================================================================
  {
    id: 'visa-virp',
    brand: 'visa',
    code: 'VIRP',
    name: 'Visa Integrity Risk Program (VIRP — Alto Risco, MCC & Brand Integrity)',
    family: 'brand_merchant_risk',
    familyLabel: '5. Marca, MCC & Subcredenciadores',
    periodicity: 'Contínuo (Monitoramento de Rede e Auditoria)',
    mandatoryStatus: 'Monitoramento Obrigatório da Bandeira',
    summary:
      'Monitora adquirentes e subcredenciadores quanto ao credenciamento de atividades proibidas ou de alto risco sem registro prévio (ex.: jogos/apostas MCC 7995 sem licença, conteúdo adulto, cripto/forex irregular) e quanto à veracidade do MCC e dos dados do merchant no TCR 0 e TCR E.',
    formulaOrMetric:
      'Auditoria de transações na rede Visa + Mistery Shopping + Consistência de MCC (DE 18 / TCR 0 pos 136–139)',
    outgoingAndAuthConnection:
      'Verifica se o MCC enviado no DE 18 e no TCR 0 corresponde à atividade real do site/loja e se os dados de nome, cidade, país e Sub-Merchant Tax ID (TCR E) permitem identificar sem ambiguidade o recebedor final.',
    fieldsAndTablesInvolved: [
      '0100 DE 18 / TCR 0 pos 136–139 (Merchant Category Code — MCC)',
      '0100 DE 43 / TCR 0 pos 84–121 (Merchant Name, City, Country)',
      'TCR E (Payment Facilitator ID + Sub-Merchant Name & Tax ID)',
    ],
    levels: [
      {
        levelName: 'Violação de Cadastro / MCC Incorreto (Miscoding)',
        threshold: 'Uso de MCC genérico para ocultar atividade de alto risco ou tarifação diferenciada',
        penaltyOrImpact: 'Multas de US$ 5.000 a US$ 100.000+ por violação e exigência de descredenciamento imediato',
        severity: 'critical',
      },
    ],
    preventionAndWaiverPlaybook: [
      'Realizar validação de URL/CNAE no onboarding do merchant e auditar periodicamente se o MCC cadastrado no autorizador e no Base II bate com o produto vendido.',
    ],
    officialSource: 'Visa Core Rules and Visa Product and Service Rules — VIRP',
  },
  {
    id: 'mc-bram-qmap-match',
    brand: 'mastercard',
    code: 'BRAM · QMAP · MATCH',
    name: 'Mastercard Brand Risk (BRAM), Quick MCC Assessment (QMAP) & Lista Restritiva MATCH',
    family: 'brand_merchant_risk',
    familyLabel: '5. Marca, MCC & Subcredenciadores',
    periodicity: 'Contínuo',
    mandatoryStatus: 'Monitoramento Obrigatório da Bandeira',
    summary:
      'Tríade de integridade da Mastercard: o BRAM pune práticas ilegais/enganosas à marca; o QMAP audita e multa o envio de MCC incorreto (DE 18 / DE 26); e o MATCH exige consulta prévia obrigatória antes de credenciar qualquer merchant e inclusão obrigatória quando um merchant é encerrado por fraude/chargeback.',
    formulaOrMetric:
      'Auditoria de MCC (QMAP), varredura de conteúdo/marca (BRAM) e conformidade de consulta/inclusão no MATCH (Reason Codes 01–13)',
    outgoingAndAuthConnection:
      'O QMAP e o BRAM auditam diretamente os campos DE 26 (Merchant Business Code / MCC no MTI 1240), DE 43 (Nome e Localidade do EC) e o trio de Subcredenciador (PDS 0176, PDS 0208 e PDS 0220 CNPJ/CPF).',
    fieldsAndTablesInvolved: [
      '0100 DE 18 ➔ MTI 1240 DE 26 (MCC)',
      'MTI 1240 DE 43 (Card Acceptor Name/Location)',
      'MTI 1240 PDS 0176 + PDS 0208 + PDS 0220 (PayFac & Sub-Merchant Tax ID)',
      'API / Portal MATCH (Reason Codes 01 a 13)',
    ],
    levels: [
      {
        levelName: 'QMAP — MCC Miscoding',
        threshold: 'MCC enviado no DE 18/DE 26 divergente da atividade real do estabelecimento',
        penaltyOrImpact: 'Multa de US$ 1.000 (1ª ocorrência) a US$ 5.000+ por reincidência + ajuste retroativo de intercâmbio',
        severity: 'warning',
      },
      {
        levelName: 'BRAM — Violação de Integridade da Marca (Cat 1 / Cat 2)',
        threshold: 'Processamento de atividade ilegal, proibida ou sem registro obrigatório de alto risco',
        penaltyOrImpact: 'Multas de US$ 5.000 a US$ 25.000+ por evento e bloqueio imediato do MID/Sub-Merchant',
        severity: 'critical',
      },
      {
        levelName: 'MATCH — Falha de Consulta no Onboarding ou de Inclusão na Rescisão',
        threshold: 'Credenciar merchant listado ou deixar de incluir merchant rescindido por HECM/Fraude em até 5 dias',
        penaltyOrImpact: 'Responsabilidade financeira integral sobre perdas e multas de não conformidade',
        severity: 'critical',
      },
    ],
    preventionAndWaiverPlaybook: [
      'Integrar a API do MATCH no fluxo de onboarding de estabelecimentos e sub-merchants antes de liberar a primeira transação.',
      'Validar que o DE 18 (Autorização) e o DE 26 (Clearing MTI 1240) usam exatamente a mesma tabela de MCC vinculada ao CNAE validado.',
    ],
    officialSource: 'Mastercard Security Rules and Procedures (BRAM, QMAP & MATCH Manual)',
  },
  {
    id: 'elo-per-subcredenciadores',
    brand: 'elo',
    code: 'PER & Subcred',
    name: 'Programa de Excelência em Risco (PER) & Governança de Subcredenciadores Elo',
    family: 'brand_merchant_risk',
    familyLabel: '5. Marca, MCC & Subcredenciadores',
    periodicity: 'Trimestral / Contínuo',
    mandatoryStatus: 'Monitoramento Obrigatório da Bandeira',
    summary:
      'Avalia o score combinado de risco operacional da credenciadora e fiscaliza o cumprimento das regras do arranjo aberto (BACEN / Elo) para Subcredenciadores, incluindo identificação obrigatória do CNPJ do Subcredenciador e do CPF/CNPJ do EC Final em toda remessa TE05/TE06.',
    formulaOrMetric:
      'Score combinado (Fraude + Disputas + Qualidade de Remessa + Conformidade Cadastral de Subcredenciadores)',
    outgoingAndAuthConnection:
      'Exige que 100% das transações capturadas por Subcredenciadores tragam o CNPJ no Registro 01 (pos 72–85) e os dados cadastrais do vendedor final no Registro 02 (Campos 140/150) para liquidação centralizada na CIP/SLC.',
    fieldsAndTablesInvolved: [
      'Registro 00 pos 60–63 (MCC)',
      'Registro 01 pos 72–85 (CNPJ do Subcredenciador)',
      'Registro 02 Campos 140 e 150 (Tipo de Pessoa + CPF/CNPJ do EC Final)',
    ],
    levels: [
      {
        levelName: 'PER — Risco Operacional Elevado / Omissão de Subcredenciador',
        threshold: 'Reincidência de envio de subcredenciador sem identificação do EC Final ou score PER acima do limite',
        penaltyOrImpact: 'Notificação formal e multa de até R$ 30.000+ após 90 dias sem regularização',
        severity: 'critical',
      },
    ],
    preventionAndWaiverPlaybook: [
      'Bloquear na camada de captura qualquer transação de Subcredenciador que não informe o CPF/CNPJ válido (11 ou 14 dígitos) do estabelecimento comercial final.',
    ],
    officialSource: 'Manual de Compliance Elo & Manual de Mensageria de Liquidação 26.2',
  },
];

interface Props {
  selectedBrand: OutgoingBrandId;
  onSelectBrand: (b: OutgoingBrandId) => void;
}

export function OutgoingProgramsExplorer({ selectedBrand, onSelectBrand }: Props) {
  const [selectedFamily, setSelectedFamily] = useState<ProgramFamilyId>('all');
  const [filterBrandMode, setFilterBrandMode] = useState<'all_brands' | 'selected_brand'>('all_brands');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProgramId, setSelectedProgramId] = useState<string>('visa-data-integrity');

  const filteredPrograms = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return SCHEME_PROGRAMS_CATALOG.filter((p) => {
      if (filterBrandMode === 'selected_brand' && p.brand !== selectedBrand) {
        return false;
      }
      if (selectedFamily !== 'all' && p.family !== selectedFamily) {
        return false;
      }
      if (!q) return true;
      return (
        p.code.toLowerCase().includes(q) ||
        p.name.toLowerCase().includes(q) ||
        p.summary.toLowerCase().includes(q) ||
        p.outgoingAndAuthConnection.toLowerCase().includes(q) ||
        p.fieldsAndTablesInvolved.some((f) => f.toLowerCase().includes(q))
      );
    });
  }, [selectedFamily, filterBrandMode, selectedBrand, searchQuery]);

  const activeProgram = useMemo(() => {
    return (
      filteredPrograms.find((p) => p.id === selectedProgramId) ??
      filteredPrograms[0] ??
      SCHEME_PROGRAMS_CATALOG[0]
    );
  }, [filteredPrograms, selectedProgramId]);

  const handleExportProgramToDocStudio = (prog: SchemeProgramItem) => {
    const brandName = OUTGOING_BRANDS[prog.brand].name;
    const levelsRows = prog.levels
      .map(
        (lv) =>
          `<tr><td><strong>${lv.levelName}</strong></td><td>${lv.threshold}</td><td>${lv.penaltyOrImpact}</td></tr>`
      )
      .join('');
    const playbookItems = prog.preventionAndWaiverPlaybook
      .map((item) => `<li>${item}</li>`)
      .join('');

    sendToDocStudio({
      mode: 'append_html',
      title: `Programa de Bandeira — ${prog.code}: ${prog.name}`,
      sourceModule: 'Lista de Programas das Bandeiras (Outgoing & Compliance)',
      html: `
        <h2>[${brandName}] ${prog.code} — ${prog.name}</h2>
        <p><strong>Família:</strong> ${prog.familyLabel} | <strong>Periodicidade:</strong> ${prog.periodicity}</p>
        <p><strong>O que é:</strong> ${prog.summary}</p>
        <p><strong>Métrica / Fórmula Oficial:</strong> <code>${prog.formulaOrMetric}</code></p>
        <p><strong>Conexão com Autorização e Outgoing:</strong> ${prog.outgoingAndAuthConnection}</p>
        <p><strong>Tabelas, Campos e Relatórios Envolvidos:</strong> ${prog.fieldsAndTablesInvolved.join(' · ')}</p>
        <h3>Thresholds, Níveis e Penalidades</h3>
        <table>
          <thead>
            <tr><th>Nível / Categoria</th><th>Gatilho / Threshold</th><th>Penalidade ou Impacto Financeiro</th></tr>
          </thead>
          <tbody>${levelsRows}</tbody>
        </table>
        <h3>Playbook de Prevenção Técnica & Waiver</h3>
        <ul>${playbookItems}</ul>
        <p><em>Fonte Normativa: ${prog.officialSource}</em></p>
      `,
      metadata: {
        brand: prog.brand,
        brandName,
        referenceId: prog.code,
        category: prog.familyLabel,
        executiveSummary: prog.summary,
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho Explicativo + Filtro por Família de Programa */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 space-y-5 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <span className="text-xs font-black uppercase tracking-wider text-blue-400">
              Catálogo Unificado de Programas das Bandeiras · Visa, Elo & Mastercard
            </span>
            <h3 className="text-lg sm:text-xl font-black text-white">
              Lista Completa de Programas: Data Integrity, Qualificação de Intercâmbio, Retentativas, Fraude & Disputas
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-4xl leading-relaxed">
              Veja exatamente como cada programa oficial das bandeiras é alimentado pelas tabelas do seu{' '}
              <strong>Outgoing (Clearing)</strong> e da sua <strong>Autorização (0100/0110)</strong>, quais campos causam
              downgrade ou multa e como blindar a operação.
            </p>
          </div>

          {/* Alternador: Ver Todas as Bandeiras vs Bandeira Selecionada */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => setFilterBrandMode('all_brands')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                filterBrandMode === 'all_brands'
                  ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                  : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-600'
              }`}
            >
              🌐 Todas as 3 Bandeiras (Comparado)
            </button>
            <button
              onClick={() => setFilterBrandMode('selected_brand')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                filterBrandMode === 'selected_brand'
                  ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                  : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-600'
              }`}
            >
              🎯 Apenas {OUTGOING_BRANDS[selectedBrand].name}
            </button>
          </div>
        </div>

        {/* Seletor das 5 Famílias de Programas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {PROGRAM_FAMILIES.map((fam) => {
            const isSel = selectedFamily === fam.id;
            return (
              <button
                key={fam.id}
                onClick={() => setSelectedFamily(fam.id)}
                className={`rounded-xl p-3.5 text-left border transition-all flex flex-col justify-between gap-1.5 ${
                  isSel
                    ? 'bg-blue-950/40 border-blue-400 shadow-md'
                    : 'bg-slate-950/70 border-slate-800 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-black text-white">{fam.title}</span>
                  <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 font-mono text-[10px] text-blue-300 shrink-0">
                    {fam.badge}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">{fam.subtitle}</p>
              </button>
            );
          })}
        </div>

        {/* Busca Rápida */}
        <div className="pt-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar programa por sigla, campo ou relatório (ex: GDIP, VAMP, CPS, IRD, PDS 0158, DE 62.2, MAC, ECP, EFM, PED, TCR E)..."
            className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Layout Mestre-Detalhe Limpo: Lista à Esquerda (4 cols) + Ficha Completa à Direita (8 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Coluna Esquerda: Lista dos Programas Filtrados */}
        <div className="lg:col-span-4 rounded-2xl border border-slate-800 bg-slate-900/90 p-4 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-black uppercase tracking-wider text-slate-300">
              Programas ({filteredPrograms.length})
            </span>
            <span className="text-[11px] text-slate-400">Clique para inspecionar</span>
          </div>

          <div className="space-y-2 max-h-[680px] overflow-y-auto pr-1">
            {filteredPrograms.map((prog) => {
              const isSelected = activeProgram?.id === prog.id;
              const bBadge =
                prog.brand === 'visa'
                  ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                  : prog.brand === 'elo'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  : 'bg-orange-500/20 text-orange-300 border-orange-500/30';

              return (
                <button
                  key={prog.id}
                  onClick={() => {
                    setSelectedProgramId(prog.id);
                    onSelectBrand(prog.brand);
                  }}
                  className={`w-full text-left rounded-xl p-3.5 border transition-all space-y-1.5 ${
                    isSelected
                      ? 'bg-blue-950/50 border-blue-400 shadow-md'
                      : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-black text-white">{prog.code}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${bBadge}`}>
                      {prog.brand.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-slate-100 leading-snug">{prog.name}</div>
                  <div className="text-[11px] text-slate-400">{prog.familyLabel}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Coluna Direita: Ficha Técnica do Programa Selecionado */}
        {activeProgram && (
          <div className="lg:col-span-8 rounded-2xl border border-slate-800 bg-slate-900/90 p-6 space-y-6 shadow-xl">
            {/* Cabeçalho do Programa */}
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-800 pb-4">
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-lg bg-blue-500/20 border border-blue-500/40 font-mono text-xs font-black text-blue-300">
                    {activeProgram.code}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs font-bold text-slate-200">
                    {OUTGOING_BRANDS[activeProgram.brand].name}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-xs font-bold text-emerald-300">
                    {activeProgram.familyLabel}
                  </span>
                </div>
                <h4 className="text-xl font-black text-white pt-1">{activeProgram.name}</h4>
                <div className="text-xs text-slate-400">
                  <strong>Periodicidade de Apuração:</strong> {activeProgram.periodicity} ·{' '}
                  <strong>Fonte:</strong> {activeProgram.officialSource}
                </div>
              </div>

              <button
                onClick={() => handleExportProgramToDocStudio(activeProgram)}
                className="px-3.5 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-xs font-bold text-blue-300 transition-all shrink-0"
              >
                📄 Exportar Programa p/ Doc Studio
              </button>
            </div>

            {/* Bloco 1: O Que É + Fórmula/Métrica */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl bg-slate-950/90 border border-slate-800 p-4 space-y-1.5">
                <div className="text-xs font-black uppercase tracking-wider text-blue-400">
                  1. O Que É e O Que a Bandeira Audita
                </div>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                  {activeProgram.summary}
                </p>
              </div>

              <div className="rounded-xl bg-slate-950/90 border border-slate-800 p-4 space-y-1.5">
                <div className="text-xs font-black uppercase tracking-wider text-amber-300">
                  2. Fórmula / Regra de Cálculo Oficial
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 font-mono text-xs text-cyan-300 leading-relaxed">
                  {activeProgram.formulaOrMetric}
                </div>
              </div>
            </div>

            {/* Bloco 2: Conexão Direta com o Outgoing & Campos Envolvidos */}
            <div className="rounded-xl bg-blue-950/15 border border-blue-500/30 p-4 space-y-3">
              <div className="text-xs font-black uppercase tracking-wider text-blue-300">
                3. Conexão Direta com Autorização (0100/0110) e Outgoing (Clearing)
              </div>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                {activeProgram.outgoingAndAuthConnection}
              </p>
              <div className="pt-1 flex flex-wrap gap-1.5">
                {activeProgram.fieldsAndTablesInvolved.map((f, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs text-cyan-300"
                  >
                    {f}
                  </span>
                ))}
              </div>
            </div>

            {/* Bloco 3: Níveis, Thresholds e Multas/Impactos */}
            <div className="space-y-2.5">
              <div className="text-xs font-black uppercase tracking-wider text-rose-300">
                4. Níveis de Enquadramento, Thresholds e Penalidades / Impacto Financeiro
              </div>
              <div className="space-y-2.5">
                {activeProgram.levels.map((lv, idx) => {
                  const borderStyle =
                    lv.severity === 'critical'
                      ? 'border-rose-500/40 bg-rose-950/15'
                      : lv.severity === 'warning'
                      ? 'border-amber-500/40 bg-amber-950/15'
                      : 'border-emerald-500/40 bg-emerald-950/15';
                  return (
                    <div key={idx} className={`rounded-xl border p-4 space-y-1.5 ${borderStyle}`}>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-xs font-black text-white">{lv.levelName}</span>
                        <span className="px-2.5 py-0.5 rounded bg-slate-950 border border-slate-800 font-mono text-xs text-amber-300">
                          Gatilho: {lv.threshold}
                        </span>
                      </div>
                      <p className="text-xs text-slate-200 leading-relaxed">
                        <strong>Impacto / Penalidade:</strong> {lv.penaltyOrImpact}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bloco 4: Playbook de Prevenção & Waiver */}
            <div className="rounded-xl bg-emerald-950/15 border border-emerald-500/30 p-4 space-y-2.5">
              <div className="text-xs font-black uppercase tracking-wider text-emerald-300">
                5. Playbook de Blindagem Técnica, Remediação & Pedido de Waiver
              </div>
              <ul className="space-y-2">
                {activeProgram.preventionAndWaiverPlaybook.map((step, idx) => (
                  <li key={idx} className="text-xs sm:text-sm text-slate-200 flex items-start gap-2 leading-relaxed">
                    <span className="text-emerald-400 font-black">✓</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
