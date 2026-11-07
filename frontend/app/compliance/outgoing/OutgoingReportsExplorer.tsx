'use client';

import React, { useMemo, useState } from 'react';
import { OUTGOING_BRANDS, OutgoingBrandId } from '@/data/outgoing-tables-flows';
import { sendToDocStudio } from '@/lib/docStudioBridge';

export type ReportOperationalStatus = 'Obrigatório (M)' | 'Condicional (C)' | 'Opcional / Analítico (O)';
export type ReportCategory =
  | '1. Validação & Rejeição do Outgoing (T+0)'
  | '2. Confirmação de Ciclo & Inclusão (T+0)'
  | '3. Liquidação Financeira & Agenda (D+1 Tesouraria)'
  | '4. Intercâmbio, Tarifas & Data Integrity (D+1 / Mensal)';

export interface OutgoingReportSpec {
  id: string;
  brand: OutgoingBrandId;
  code: string;
  electronicFileCode: string;
  title: string;
  subtitle: string;
  category: ReportCategory;
  status: ReportOperationalStatus;
  frequencyAndTiming: string;
  targetTeam: string;
  sourceManual: {
    title: string;
    version: string;
    effectiveDate: string;
    pages: string;
  };
  whatItIs: string;
  whatInformationItContains: {
    blockTitle: string;
    fieldsOrMetrics: string[];
  }[];
  howItHelpsDayToDay: string[];
  whenMandatoryVsOptional: string;
  riskIfIgnored: string;
}

export const OUTGOING_REPORTS: OutgoingReportSpec[] = [
  // ==========================================================================
  // VISA — RELATÓRIOS VCX (BASE II OUTGOING) & VSS (SETTLEMENT & INTERCHANGE)
  // ==========================================================================
  {
    id: 'visa-vx100a-vx204a',
    brand: 'visa',
    code: 'VX-100A / VX-204A',
    electronicFileCode: 'VCX Outgoing Exception & Return',
    title: 'Validation Exception Report (VX-100A) & Returned Transactions (VX-204A)',
    subtitle: 'Diagnóstico sintático linha a linha das transações de Outgoing rejeitadas pelo Edit Package / VisaNet Base II',
    category: '1. Validação & Rejeição do Outgoing (T+0)',
    status: 'Obrigatório (M)',
    frequencyAndTiming: 'Por ciclo de coleta (até 6x ao dia) · Imediatamente após o envio do CTF Outgoing',
    targetTeam: 'Operações de Clearing / Sustentação TI',
    sourceManual: {
      title: 'BASE II VCX Reports Reference Guide',
      version: 'Release 26.1',
      effectiveDate: '3 May 2026',
      pages: 'Págs. 20–43 (VX-100A) e 61–84 (VX-204A)',
    },
    whatItIs:
      'São os relatórios primários de crítica sintática do Outgoing na Visa. O VX-100A aponta exceções de validação na entrada do Base II, enquanto o VX-204A devolve a imagem exata não-formatada dos 168 bytes de cada TCR recusado acompanhada do Return Reason Code.',
    whatInformationItContains: [
      {
        blockTitle: 'Identificação da Falha e Localização no Lote',
        fieldsOrMetrics: [
          'CIB do Adquirente Remetente (Originating CIB) e Batch Number',
          'Transaction Code (TC 05, TC 06, TC 15, TC 25) e TCR específico onde ocorreu o erro (TCR 0, TCR 2 BR, TCR 5, TCR 7, TCR E)',
          'Return Reason Code / Edit Package Error Code indicando a posição exata que violou a regra',
        ],
      },
      {
        blockTitle: 'Imagem Bruta para Reprocessamento (VX-204A)',
        fieldsOrMetrics: [
          'Dump completo dos 168 bytes de todos os TCRs daquela transação (ARN, PAN mascarado, Valor, Data)',
          'Totalizador financeiro de transações rejeitadas que ficaram fora da liquidação do dia',
        ],
      },
    ],
    howItHelpsDayToDay: [
      'Permite à equipe de Operações identificar em minutos se uma falha de layout (ex: TCR 2 BR pos 40–41 sem somar +10 nas parcelas, ou TCR E sem CNPJ em PayFac) travou transações de alto valor.',
      'Fornece o ARN e a imagem dos 168 bytes para corrigir o campo e reenviar a transação na janela seguinte antes que estoure o prazo de Late Presentment.',
    ],
    whenMandatoryVsOptional:
      'Obrigatório [M] operacionalmente sempre que houver qualquer rejeição no lote Outgoing; sem ele, vendas aprovadas na 0100 e rejeitadas no Base II nunca são liquidadas ao lojista.',
    riskIfIgnored:
      'Perda financeira direta (transações aprovadas que nunca entram em liquidação), atraso de repasse ao EC e downgrade por apresentação tardia.',
  },
  {
    id: 'visa-vx111c-vx120f-vx220',
    brand: 'visa',
    code: 'VX-111C / VX-120F / VX-220',
    electronicFileCode: 'VCX Outgoing ITF & Collected Summary',
    title: 'Outgoing ITF Summary by Volume (VX-120F) & Collected Reconciliation (VX-220)',
    subtitle: 'Comprovante de recepção e batimento entre o arquivo CTF transmitido pelo Credenciador e o total coletado pelo CPD Visa',
    category: '2. Confirmação de Ciclo & Inclusão (T+0)',
    status: 'Obrigatório (M)',
    frequencyAndTiming: 'Diário (a cada corte do Central Processing Date — CPD)',
    targetTeam: 'Operações de Clearing & Conciliação Contábil',
    sourceManual: {
      title: 'BASE II VCX Reports Reference Guide',
      version: 'Release 26.1',
      effectiveDate: '3 May 2026',
      pages: 'Págs. 45–51 (VX-111C / VX-120F) e 85–98 (VX-210F / VX-220)',
    },
    whatItIs:
      'Conjunto de relatórios de controle de transmissão e coleta do Base II. Confirma quantos lotes, quantas transações financeiras (TC 05/06/07/15/25) e qual montante bruto foram efetivamente aceitos pelo switch da Visa no ciclo.',
    whatInformationItContains: [
      {
        blockTitle: 'Batimento de Lote (Enviado × Aceito × Rejeitado)',
        fieldsOrMetrics: [
          'Quantidade total de transações e soma de Source Amount do TC 91/92 enviado',
          'Quantidade e valor efetivamente aceitos (Collected) vs recusados (Rejected)',
          'Quebra por Settlement Service (NNSS Liquidação Nacional Brasil vs Internacional)',
        ],
      },
    ],
    howItHelpsDayToDay: [
      'Garante que 100% dos arquivos gerados pelo motor interno de Outgoing chegaram à Visa sem perda de lote (file drop) ou duplicidade.',
      'Serve de ponte entre o fechamento do motor de captura (T+0) e o relatório financeiro VSS-110 do dia seguinte (D+1).',
    ],
    whenMandatoryVsOptional:
      'Obrigatório [M] para o checklist diário de fechamento de processamento (controle SOX / auditoria de integridade de remessa).',
    riskIfIgnored:
      'Não detectar a queda de uma remessa inteira (lote não processado pela bandeira) a tempo de retransmitir no mesmo CPD.',
  },
  {
    id: 'visa-vss110-vss115',
    brand: 'visa',
    code: 'VSS-110 / VSS-110-C / VSS-115',
    electronicFileCode: 'TC 46 (Subgroups 1 & 2) · V22110',
    title: 'VisaNet Settlement Summary Report (VSS-110 & VSS-115)',
    subtitle: 'Relatório mestre de Tesouraria: posição líquida diária (Créditos − Débitos − Intercâmbio = Valor Líquido de Liquidação)',
    category: '3. Liquidação Financeira & Agenda (D+1 Tesouraria)',
    status: 'Obrigatório (M)',
    frequencyAndTiming: 'Diário (após o fechamento do CPD · disponível em texto e eletronicamente via TC 46 / Raw Data)',
    targetTeam: 'Tesouraria, Liquidação Financeira & Contabilidade',
    sourceManual: {
      title: 'VisaNet Settlement Service (VSS) – User Guide, Vol. 1 & Vol. 2',
      version: 'Release 26.1',
      effectiveDate: '18 April 2026',
      pages: 'Vol. 2 Págs. 50–80 (VSS-100-R / VSS-110-C / VSS-115) e Págs. 192–201 (TC 46 Sub 1/2)',
    },
    whatItIs:
      'É o documento financeiro oficial da Visa que determina quanto dinheiro entra ou sai da conta de liquidação do Adquirente/Emissor no dia. Consolida o valor bruto das vendas (Interchange Value), deduz a tarifa de intercâmbio, soma/subtrai disputas (Chargebacks) e informa o Net Settlement Amount.',
    whatInformationItContains: [
      {
        blockTitle: 'Demonstrativo Líquido de Liquidação (Aquisição vs Emissão)',
        fieldsOrMetrics: [
          'Gross Amount (Valor bruto das transações apresentadas no Outgoing / Incoming)',
          'Interchange Reimbursement Fee (IRF — total de intercâmbio pago pelo Adquirente ao Emissor)',
          'Visa Charges / Reimbursement Fees (quando liquidado no ciclo)',
          'Net Amount (Valor Líquido final com indicador CR = Crédito ou DB = Débito para batimento com SLC/CIP B3)',
        ],
      },
    ],
    howItHelpsDayToDay: [
      'A Tesouraria usa o VSS-110 todas as manhãs para validar o valor exato a liquidar na câmara (CIP / SLC B3 no Brasil ou banco liquidante em USD).',
      'Permite separar em segundos o quanto da variação diária de caixa veio de Vendas (Sales), Estornos (Credits), Chargebacks ou Reversões.',
    ],
    whenMandatoryVsOptional:
      'Estritamente Obrigatório [M] para qualquer participante liquidante Visa (Acquirer ou Issuer). Sua versão eletrônica em arquivo é o TC 46 (Subgrupos 1 e 2).',
    riskIfIgnored:
      'Divergência de caixa na liquidação interbancária (falta de fundos na janela da câmara ou erro na contabilização de repasse aos lojistas).',
  },
  {
    id: 'visa-vss120-vss130-v22120',
    brand: 'visa',
    code: 'VSS-120 / VSS-130 (V22120)',
    electronicFileCode: 'TC 46 (Subgroup 4) · Raw Data V22120',
    title: 'Interchange Value and Volume Report (VSS-120 & VSS-130)',
    subtitle: 'Auditoria analítica de Intercâmbio: quebra por programa tarifário (FPI), produto, modalidade e detecção de Downgrades',
    category: '4. Intercâmbio, Tarifas & Data Integrity (D+1 / Mensal)',
    status: 'Obrigatório (M)',
    frequencyAndTiming: 'Diário · Ingerido automaticamente via TC 46 Subgroup 4 ou arquivo V22120',
    targetTeam: 'Financeiro, Pricing / Intercâmbio & Engenharia de Clearing',
    sourceManual: {
      title: 'VisaNet Settlement Service (VSS) – User Guide, Vol. 1 & Vol. 2',
      version: 'Release 26.1',
      effectiveDate: '18 April 2026',
      pages: 'Vol. 1 Págs. 129–148 · Vol. 2 Págs. 81–102 (VSS-130), 207–218 (TC 46 Sub 4) e 365–412 (V22120)',
    },
    whatItIs:
      'É o relatório que abre a "caixa-preta" do intercâmbio da Visa. Enquanto o VSS-110 mostra apenas o total de intercâmbio descontado, o VSS-120 e o VSS-130 (e seu arquivo estruturado V22120 / TC 46 Sub 4) detalham exatamente em qual Fee Program Indicator (FPI) cada grupo de transações do Outgoing foi enquadrado.',
    whatInformationItContains: [
      {
        blockTitle: 'Qualificação Tarifária e Rate Designators (FPI)',
        fieldsOrMetrics: [
          'Fee Program Indicator (FPI) e descrição do programa de intercâmbio aplicado (ex: CPS Retail, E-Commerce Autenticado, Parcelado, Standard/Downgrade)',
          'Quantidade de transações, Valor Bruto (Interchange Value) e Valor Exato da Tarifa de Intercâmbio (IRF Amount)',
          'Alíquota percentual + tarifa fixa aplicada em cada linha de produto (Débito, Crédito Clássico, Platinum, Infinite, Empresarial, Agro)',
        ],
      },
    ],
    howItHelpsDayToDay: [
      'Identifica imediatamente se as transações enviadas no Outgoing sofreram DOWNGRADE de intercâmbio (ex: caíram na tarifa Standard/Não-Qualificada porque faltou o TID no TCR 5, o CAVV em 3DS ou porque foram enviadas fora do prazo).',
      'Permite recalcular a margem líquida (MDR − Intercâmbio efetivo) por lojista e auditar se a tabela aplicada pela Visa bate com o motor interno de intercâmbio.',
    ],
    whenMandatoryVsOptional:
      'Obrigatório [M] para conciliação de receita/custo de intercâmbio. A ingestão eletrônica via V22120 / TC 46 Subgroup 4 é indispensável para adquirentes.',
    riskIfIgnored:
      'Pagar milhões de reais a mais em intercâmbio por downgrades silenciosos de mensageria Outgoing sem perceber que um campo condicional deixou de ser preenchido.',
  },
  {
    id: 'visa-vss140-vss900',
    brand: 'visa',
    code: 'VSS-140 & VSS-900-PS',
    electronicFileCode: 'TC 46 (Subgroup 5 & 6) · Billing / Reconciliation',
    title: 'Visa Charges Report (VSS-140) & End-to-End Reconciliation (VSS-900)',
    subtitle: 'Auditoria de Scheme Fees / Billing Lines (VSS-140) e conciliação Autorização SMS × Base II Clearing (VSS-900)',
    category: '4. Intercâmbio, Tarifas & Data Integrity (D+1 / Mensal)',
    status: 'Condicional (C)',
    frequencyAndTiming: 'Diário / Ciclo de Faturamento (VSS-140) e Diário (VSS-900)',
    targetTeam: 'Compliance de Bandeiras, Financeiro & Controle de Custos',
    sourceManual: {
      title: 'VisaNet Settlement Service (VSS) – User Guide, Vol. 1 & Vol. 2',
      version: 'Release 26.1',
      effectiveDate: '18 April 2026',
      pages: 'Vol. 1 Págs. 112–127 (VSS-900) · Vol. 2 Págs. 110–168 (VSS-140 & VSS-900-PS)',
    },
    whatItIs:
      'O VSS-140 detalha todas as taxas da bandeira (Scheme Fees / Assessments / Penalidades de Data Integrity / Billing Lines de 9 caracteres como 5J42A3025) cobradas pela Visa. Já o VSS-900-PS cruza os dados de autorização (SMS) com o clearing (Base II).',
    whatInformationItContains: [
      {
        blockTitle: 'Detalhamento de Tarifas de Bandeira e Multas Técnicas (VSS-140)',
        fieldsOrMetrics: [
          'Billing Line Code, Jurisdição, Business Mode (Acquirer/Issuer) e Charge Type',
          'Volume tributável, alíquota unitária/percentual e valor cobrado pela Visa',
          'Identificação de cobranças por erro de integridade de dados, reprocessamento ou uso de serviços (3DS, Token, OCT)',
        ],
      },
    ],
    howItHelpsDayToDay: [
      'Permite auditar a fatura da bandeira e detectar imediatamente qualquer multa de Data Integrity ou cobrança de exceção gerada por erro no Outgoing.',
      'Cruza o que foi autorizado no dia D com o que foi efetivamente liquidado no Base II (evitando transações "órfãs" aprovadas e não capturadas).',
    ],
    whenMandatoryVsOptional:
      'Obrigatório para a área de Custos de Bandeira / Finanças; opcional para o time puramente técnico de plantão T+0.',
    riskIfIgnored:
      'Vazamento de margem por cobranças de bandeira ou multas recorrentes de Data Integrity não corrigidas na origem.',
  },

  // ==========================================================================
  // ELO — ARQUIVOS DE RETORNO, AGENDA DO CREDENCIADOR (E0-E9) & TARIFAS 26.2
  // ==========================================================================
  {
    id: 'elo-retorno-te01-reg09',
    brand: 'elo',
    code: 'Retorno Serviço 10 · TE01 (Reg 09)',
    electronicFileCode: 'Arquivo Retorno Liquidação (Rota 2) · TE01',
    title: 'Arquivo de Retorno de Rejeição Parcial (TE01 + Registro 09) e Rejeição Total',
    subtitle: 'Devolução pela Elo das transações enviadas no Outgoing (TE05/06/15/25) que falharam na validação de formato ou negócio',
    category: '1. Validação & Rejeição do Outgoing (T+0)',
    status: 'Obrigatório (M)',
    frequencyAndTiming: '4x ao dia (após cada janela de envio: 11h, 15h, 19h e 00h BRT)',
    targetTeam: 'Operações de Liquidação / Sustentação de Mensageria',
    sourceManual: {
      title: 'Manual de Mensageria de Liquidação, Transferência de Fundos e Reporte de Fraude Internacional',
      version: 'Versão 26.2',
      effectiveDate: '30/04/2026',
      pages: 'Págs. 15–21 (Janelas e Rejeição Parcial/Total) e Págs. 202–203 (TE01 Registro 09)',
    },
    whatItIs:
      'Quando o Credenciador envia o arquivo de Outgoing (Serviço 10, Rota 1), a Elo valida a sintaxe do lote. Se o Header B0 ou Trailer BZ estiverem corrompidos, ocorre Rejeição Total do arquivo. Se uma transação individual (ex: TE05) tiver erro em algum campo, a Elo processa o resto do lote e devolve apenas a transação com erro convertida em TE01 (pos 1–2 = 01), preservando os registros originais (00, 01, 02...) com o código do erro nas posições 166–168 e anexando o Registro 09 com o diagnóstico final.',
    whatInformationItContains: [
      {
        blockTitle: 'Diagnóstico Exato no Registro 09 e nas Posições 166–168',
        fieldsOrMetrics: [
          'Sub-registros originais (00, 01, 02, 05, 07, 08) com o Código de Erro específico gravado nos últimos 3 bytes (pos 166–168)',
          'Registro 09 · Pos 05–06: Código da TE Original recusada (ex: 05 = Compra, 06 = Crédito)',
          'Registro 09 · Pos 07–29: ARN original de 23 dígitos para localização imediata no banco de dados',
          'Registro 09 · Pos 165–168: Código de Erro Consolidado da transação',
        ],
      },
    ],
    howItHelpsDayToDay: [
      'Permite automatizar a fila de reprocessamento: o sistema lê o ARN no Registro 09 pos 07–29 e o código de erro nas pos 166–168 do sub-registro que falhou (ex: CEP inválido no Reg 01, falta de Código IBGE no Reg 02 ou falta de Reg 07 em transação chip), corrige e reenvia na próxima das 4 janelas do mesmo dia!',
    ],
    whenMandatoryVsOptional:
      'Obrigatório [M] em todas as 4 janelas diárias. Ignorar o retorno TE01 significa deixar transações aprovadas sem liquidação.',
    riskIfIgnored:
      'Perda financeira imediata (o lojista entregou o produto com autorização aprovada, mas o credenciador nunca recebe o valor da Elo se não corrigir e reenviar a TE01).',
  },
  {
    id: 'elo-agenda-credenciador-e1',
    brand: 'elo',
    code: 'Agenda Credenciador · Registro E1 (Inclusão)',
    electronicFileCode: 'Acquirer Schedule CSV/FMT · Record E0 + E1 + E9',
    title: 'Relatório de Inclusão de Movimento do Credenciador (Record Type "E1")',
    subtitle: 'Confirmação oficial de todas as transações do Outgoing aceitas pela Elo e agendadas para liquidação, com cálculo de intercâmbio',
    category: '2. Confirmação de Ciclo & Inclusão (T+0)',
    status: 'Obrigatório (M)',
    frequencyAndTiming: 'Diário (gerado após o processamento das janelas de liquidação)',
    targetTeam: 'Conciliação Operacional & Backoffice de Adquirência',
    sourceManual: {
      title: 'Elo Settlement Reports Manual 26.2',
      version: 'Version 26.2',
      effectiveDate: '30/04/2026',
      pages: 'Cap. 5 — Págs. 154–171 (5.5.2 Detail Record type "E1" - Inclusion of Movement)',
    },
    whatItIs:
      'É o relatório da Agenda do Credenciador (Capítulo 5 do Manual de Settlement Reports 26.2) que lista tudo o que foi aceito nas janelas de Outgoing e incluído na grade financeira da Elo, agrupado por Emissor, Produto, Código TE, Data de Vencimento (Due Date) e Tipo de Lançamento.',
    whatInformationItContains: [
      {
        blockTitle: 'Estrutura do Registro E1 (Inclusão de Movimento)',
        fieldsOrMetrics: [
          'Identificação do Emissor contraparte, Código de Produto Elo (Débito, Crédito, Agro, Corporativo, Carnê/Crediário) e Código TE (05, 06, 15, 25)',
          'Data do Movimento, Data de Vencimento / Liquidação programada (Due Date) e Número da Parcela',
          'Valor Bruto Incluído, Valor da Remuneração do Emissor (Intercâmbio calculado pela Elo) e Valor Líquido agendado',
        ],
      },
    ],
    howItHelpsDayToDay: [
      'Confirma que as transações enviadas no Outgoing (que não voltaram em TE01) foram efetivamente agendadas na câmara de liquidação da Elo.',
      'Permite conferir no próprio D+0/D+1 se o parcelamento enviado (990 Lojista vs 991 Emissor vs 993 Crediário) gerou as datas de vencimento (D+30, D+60...) esperadas.',
    ],
    whenMandatoryVsOptional:
      'Obrigatório [M] para conciliação diária entre o motor de Outgoing e a agenda de recebíveis do credenciador.',
    riskIfIgnored:
      'Divergência entre a agenda de pagamento prometida ao lojista/subcredenciador e a agenda real registrada pela bandeira Elo.',
  },
  {
    id: 'elo-agenda-credenciador-e2-e3',
    brand: 'elo',
    code: 'Agenda Credenciador · Registros E2 & E3',
    electronicFileCode: 'Acquirer Schedule CSV/FMT · Record E2 (Settlement) & E3 (Future Balance)',
    title: 'Relatório de Liquidação Diária (Record "E2") & Saldo Futuro / Agenda Aberta (Record "E3")',
    subtitle: 'Batimento de Tesouraria (o que liquida hoje no SLC/CIP B3) e estoque total de parcelas futuras a receber dos emissores',
    category: '3. Liquidação Financeira & Agenda (D+1 Tesouraria)',
    status: 'Obrigatório (M)',
    frequencyAndTiming: 'Diário (Manhã D+1 para batimento com a grade CIP / SLC B3)',
    targetTeam: 'Tesouraria, Risco de Liquidez & Contabilidade',
    sourceManual: {
      title: 'Elo Settlement Reports Manual 26.2',
      version: 'Version 26.2',
      effectiveDate: '30/04/2026',
      pages: 'Cap. 5 — Págs. 172–191 (5.5.4 Record "E2" Settlement & 5.5.5 Record "E3" Future Balance)',
    },
    whatItIs:
      'Enquanto o Registro E1 mostra o que entrou hoje na agenda, o Registro E2 mostra tudo o que está vencendo e liquidando financeiramente HOJE (compras à vista de ontem + parcelas de meses anteriores que vencem hoje), e o Registro E3 fotografa todo o Saldo Futuro (estoque de recebíveis a liquidar nos próximos meses).',
    whatInformationItContains: [
      {
        blockTitle: 'Registro E2 (Liquidação do Dia) & Registro E3 (Saldo Futuro)',
        fieldsOrMetrics: [
          'Record E2: Valor Bruto, Intercâmbio e Valor Líquido que será liquidado hoje no SLC/B3 por Emissor, Produto, TE e Data de Inclusão original',
          'Record E3: Posição completa da carteira futura (Future Balance) aberta por data de vencimento futura (Due Date), Emissor e Produto',
          'Record E9: Trailer de controle com a quantidade exata de linhas para validação de integridade do arquivo CSV/FMT',
        ],
      },
    ],
    howItHelpsDayToDay: [
      'O Registro E2 é o espelho exato da liquidação financeira na CIP/SLC B3 para a Tesouraria.',
      'O Registro E3 é indispensável no Brasil para lastrear antecipação de recebíveis, cessão de agenda (registradoras de recebíveis Bacen) e conciliação contábil do ativo circulante do adquirente.',
    ],
    whenMandatoryVsOptional:
      'Obrigatório [M] para Tesouraria e Contabilidade Regulatória (Bacen).',
    riskIfIgnored:
      'Furo de caixa na liquidação SLC/B3 ou erro no saldo de recebíveis de parcelado lojista (990) disponível para antecipação.',
  },
  {
    id: 'elo-tarifa-padrao-especial-cap6-cap7',
    brand: 'elo',
    code: 'Cap. 6 (Originador) & Cap. 7 (Standard / Special Fee)',
    electronicFileCode: 'Arquivos de Tarifas Elo (E0 + E1 + E9 · Versão 261)',
    title: 'Relatório do Participante Originador (Cap. 6) & Arquivos de Tarifa Padrão e Especial por CNPJ/PV (Cap. 7)',
    subtitle: 'Tabelas eletrônicas de Intercâmbio Padrão (MCC/Produto) e Especial (por Raiz de CNPJ/CPF/PV) + Remuneração do Emissor',
    category: '4. Intercâmbio, Tarifas & Data Integrity (D+1 / Mensal)',
    status: 'Recomendado / Condicional' as unknown as ReportOperationalStatus,
    frequencyAndTiming: 'Diário (Cap. 6 Remuneração/Taxas) e Atualização Cadastral / Diário (Cap. 7 Standard & Special Fee)',
    targetTeam: 'Pricing, Intercâmbio, Cadastro de Subcredenciadores & Financeiro',
    sourceManual: {
      title: 'Elo Settlement Reports Manual 26.2',
      version: 'Version 26.2',
      effectiveDate: '30/04/2026',
      pages: 'Cap. 6 (Págs. 199–211) e Cap. 7 (Págs. 212–304 — Standard Fee & Special Fee Version 261)',
    },
    whatItIs:
      'O Capítulo 6 detalha os valores por TE, a Remuneração do Emissor (Intercâmbio — E1) e as Tarifas/Impostos da Elo (E2). Já o Capítulo 7 traz os dois arquivos vitais para o motor de cálculo de intercâmbio: o Standard Fee File (taxas padrão por Produto, MCC e PF/PJ) e o Special Fee File (taxas diferenciadas por Raiz de CNPJ/CPF/Ponto de Venda, atualizado na Release 26.2 com validação de Subcredenciador).',
    whatInformationItContains: [
      {
        blockTitle: 'Remuneração de Intercâmbio, Tarifas Elo e Acordos Especiais por CNPJ',
        fieldsOrMetrics: [
          'Cap. 6 (E1/E2/E3): Montante por TE, Remuneração do Emissor (Intercâmbio) e Fees/Tributos da Elo',
          'Cap. 7 Standard Fee (E1): Alíquota percentual e teto fixo de intercâmbio por Produto, MCC, Modalidade e PF/PJ',
          'Cap. 7 Special Fee (E1 · Versão 261): Taxa especial vinculada à Raiz do CNPJ (alfanumérico) ou CPF do EC/Subcredenciado',
        ],
      },
    ],
    howItHelpsDayToDay: [
      'Garante que o motor de precificação do Credenciador saiba exatamente qual CNPJ possui taxa de intercâmbio especial aprovada na Elo.',
      'No caso de Subcredenciadores (item 7.4.1 do manual), valida se o CNPJ do lojista final enviado no Registro 02 do Outgoing recebeu o benefício da Tarifa Especial.',
    ],
    whenMandatoryVsOptional:
      'Condicional [C] / Altamente Recomendado: essencial para adquirentes que operam com tarifas especiais por segmento/CNPJ e subcredenciadores.',
    riskIfIgnored:
      'Cobrar MDR errado do lojista ou perder o benefício de tarifa especial de intercâmbio por divergência no envio do CNPJ no Outgoing.',
  },

  // ==========================================================================
  // MASTERCARD — RELATÓRIOS GCMS / IPM (T112, IP857, IP714, IP728, IP755, IP776)
  // ==========================================================================
  {
    id: 'mc-t112-ip857010',
    brand: 'mastercard',
    code: 'T112 · IP857010-AA / BB',
    electronicFileCode: 'Arquivo T112 (Outbound Syntax Error) · Report IP857010-AA',
    title: 'Error Detail: Input Sequence Report (IP857010-AA / BB & Arquivo T112)',
    subtitle: 'Rejeições fatais de Arquivo (File Level Reject) e de Transação (Message Level Reject MTI 1240) com diagnóstico PDS 0205',
    category: '1. Validação & Rejeição do Outgoing (T+0)',
    status: 'Obrigatório (M)',
    frequencyAndTiming: 'A cada um dos 6 cutoffs diários do GCMS · Logo após o envio do arquivo Outgoing R111',
    targetTeam: 'Operações de Clearing / Sustentação IPM',
    sourceManual: {
      title: 'Mastercard Network Processing Dual Message Clearing System Guide',
      version: 'Release 26.2',
      effectiveDate: '25 August 2026',
      pages: 'Págs. 2059–2078 (Tables 2125 a 2133 — IP857010-AA & IP857010-BB)',
    },
    whatItIs:
      'Quando o Credenciador transmite o arquivo Outgoing R111 para o GCMS, o validador de entrada analisa tanto o envelope (Header 1644-697 / Trailer 1644-695) quanto cada mensagem MTI 1240/1442/1740. O relatório IP857010-AA (e o arquivo eletrônico T112) devolve todas as rejeições de nível de arquivo (File Level) e de nível de mensagem (Message Level) com o sub-elemento PDS 0205.',
    whatInformationItContains: [
      {
        blockTitle: 'Diagnóstico de Rejeição Sintática e Devolução (PDS 0205)',
        fieldsOrMetrics: [
          'File ID (PDS 0105), Message Number (DE 71) e ARN (DE 31) da mensagem MTI 1240 rejeitada',
          'Número do Data Element (ex: DE 22, DE 43) ou PDS (ex: PDS 0195, PDS 0220) que causou a rejeição',
          'Error Code de 4 dígitos, severidade e imagem da mensagem recusada para correção e reenvio',
        ],
      },
    ],
    howItHelpsDayToDay: [
      'Mostra exatamente qual DE ou PDS quebrou a validação do GCMS (por exemplo, enviar MTI 1240 parcelado no Brasil sem o PDS 0195 ou com soma do Trailer 1644-695 divergente do PDS 0301).',
      'Permite corrigir e reenviar a mensagem MTI 1240 no cutoff seguinte do mesmo dia.',
    ],
    whenMandatoryVsOptional:
      'Obrigatório [M] em todos os 6 ciclos diários do GCMS.',
    riskIfIgnored:
      'Transações recusadas no T112 não entram em clearing nem em liquidação; se não forem corrigidas dentro da janela da tabela IP0012T1, o adquirente perde o direito de apresentação.',
  },
  {
    id: 'mc-ip714010-aa-bb',
    brand: 'mastercard',
    code: 'IP714010-AA & IP714010-BB',
    electronicFileCode: 'Report IP714010-AA (Accepted Errors) & IP714010-BB (Updated Merchant Values)',
    title: 'Acquirer Accepted Errors Detail (IP714010-AA) & Updated Merchant Values (IP714010-BB)',
    subtitle: 'O relatório mais estratégico para evitar multas: transações que o GCMS ACEITOU com erro (Warning) ou teve dados corrigidos pela rede',
    category: '1. Validação & Rejeição do Outgoing (T+0)',
    status: 'Obrigatório (M)',
    frequencyAndTiming: 'Diário (por ciclo de clearing do GCMS)',
    targetTeam: 'Compliance de Bandeiras (Data Integrity), Engenharia de Clearing & Cadastro EC',
    sourceManual: {
      title: 'Mastercard Network Processing Dual Message Clearing System Guide',
      version: 'Release 26.2',
      effectiveDate: '25 August 2026',
      pages: 'Págs. 2090–2100 (IP714010-AA Accepted Errors & IP714010-BB Updated Merchant Values)',
    },
    whatItIs:
      'Diferente do IP857010-AA (que mostra o que foi rejeitado), o IP714010-AA mostra transações que continham erros de preenchimento no Outgoing, mas que o GCMS ACEITOU (Accepted with Error) para não travar a liquidação financeira. Já o IP714010-BB mostra transações onde o GCMS alterou/sobrescreveu valores cadastrais do estabelecimento enviados pelo adquirente.',
    whatInformationItContains: [
      {
        blockTitle: 'Erros Aceitos (IP714010-AA) e Dados Sobrescritos pelo GCMS (IP714010-BB)',
        fieldsOrMetrics: [
          'IP714010-AA: DE / PDS com defeito não-fatal, código do erro aceito, ARN (DE 31) e impacto de conformidade',
          'IP714010-BB: Valor original enviado pelo Adquirente no MTI 1240 vs Novo Valor aplicado pelo GCMS (ex: MCC, Merchant ID, Nome/Localização ou Seller ID corrigido pela base central da Mastercard)',
        ],
      },
    ],
    howItHelpsDayToDay: [
      'É a principal ferramenta preventiva de Data Integrity: muitos times acham que "se liquidou, está certo", mas os erros listados no IP714010-AA geram cobrança de tarifa de não-conformidade no MCBS e downgrade de intercâmbio!',
      'O IP714010-BB permite sincronizar a base cadastral de lojistas/subcredenciadores do adquirente com a base oficial da Mastercard.',
    ],
    whenMandatoryVsOptional:
      'Obrigatório [M] para Governança de Data Integrity e prevenção de multas operacionais.',
    riskIfIgnored:
      'Acúmulo silencioso de multas mensais de Data Integrity e reclassificação compulsória de intercâmbio em milhares de transações que "passaram" na liquidação.',
  },
  {
    id: 'mc-ip727020-ip728010',
    brand: 'mastercard',
    code: 'IP727020-AA & IP728010-AA',
    electronicFileCode: 'Clearing Cycle Notification (IP727020) & Summary Reconciliation (IP728010)',
    title: 'Clearing Cycle Notification (IP727020-AA) & Summary Reconciliation Report (IP728010-AA)',
    subtitle: 'Comprovante de fechamento de cada um dos 6 ciclos do GCMS e batimento sintético (Enviado × Aceito × Rejeitado)',
    category: '2. Confirmação de Ciclo & Inclusão (T+0)',
    status: 'Obrigatório (M)',
    frequencyAndTiming: '6x ao dia (ao final de cada cutoff do GCMS)',
    targetTeam: 'Operações de Clearing & Conciliação Contábil',
    sourceManual: {
      title: 'Mastercard Network Processing Dual Message Clearing System Guide',
      version: 'Release 26.2',
      effectiveDate: '25 August 2026',
      pages: 'Págs. 2020–2029 (Tables 2111, 2112 e 2113 — IP727010, IP727020 e IP728010)',
    },
    whatItIs:
      'Relatórios de controle de ciclo do GCMS. O IP727020-AA notifica a conclusão do processamento de cada janela, e o IP728010-AA apresenta o quadro de conciliação resumido de todos os arquivos R111 enviados e T113/T140 recebidos naquele ciclo.',
    whatInformationItContains: [
      {
        blockTitle: 'Quadro Resumo de Conciliação do Ciclo (IP728010-AA)',
        fieldsOrMetrics: [
          'File ID (PDS 0105) de cada arquivo R111 processado no cutoff',
          'Contagem e Valor Total de mensagens apresentadas (MTI 1240, 1442, 1740)',
          'Contagem e Valor Total aceito para liquidação vs rejeitado no T112',
        ],
      },
    ],
    howItHelpsDayToDay: [
      'Garante visibilidade imediata ao final de cada janela de clearing sobre o que entrou no ciclo de liquidação do dia.',
      'Serve de base para o batimento automatizado entre os contadores do Trailer 1644-695 (PDS 0301 e PDS 0306) e o processado pela Mastercard.',
    ],
    whenMandatoryVsOptional:
      'Obrigatório [M] para o controle operacional diário de remessas IPM.',
    riskIfIgnored:
      'Perda de visibilidade sobre arquivos retidos ou processados fora da janela de corte esperada.',
  },
  {
    id: 'mc-ip776010-t461-t464',
    brand: 'mastercard',
    code: 'IP776010-AA / IP776020-AA (T461 / T464)',
    electronicFileCode: 'Arquivos T461 / T464 / T467 · Reports IP776010-AA a IP776030-AA',
    title: 'Settlement Advisement & Netting Reports (IP776010-AA / IP776020-AA / IP776030-AA)',
    subtitle: 'Aviso oficial de Liquidação Financeira para a Tesouraria: posição líquida por moeda (986 BRL / 840 USD) e conta de liquidação',
    category: '3. Liquidação Financeira & Agenda (D+1 Tesouraria)',
    status: 'Obrigatório (M)',
    frequencyAndTiming: 'Diário (gerado no fechamento da grade de liquidação)',
    targetTeam: 'Tesouraria, Liquidação Financeira & Contabilidade',
    sourceManual: {
      title: 'Mastercard Network Processing Dual Message Clearing System Guide',
      version: 'Release 26.2',
      effectiveDate: '25 August 2026',
      pages: 'Págs. 2081–2087 (Tables 2135, 2136 e 2137 — IP776010-AA, IP776020-AA e IP776030-AA)',
    },
    whatItIs:
      'É o equivalente Mastercard ao VSS-110 da Visa. Os relatórios da família IP776 (entregues nos arquivos de Settlement Advisement T461/T464) informam à Tesouraria do Adquirente/Emissor o valor líquido exato que será movimentado na câmara de liquidação doméstica (BRL 986) e internacional (USD 840).',
    whatInformationItContains: [
      {
        blockTitle: 'Posição Líquida de Liquidação por ICA e Moeda',
        fieldsOrMetrics: [
          'ICA de Liquidação, Moeda de Liquidação (986 BRL) e Data Efetiva de Liquidação (Value Date)',
          'Valor Bruto das Apresentações (Presentments), Estornos, Chargebacks e Fee Collections',
          'Total de Intercâmbio Líquido apurado no ciclo e Net Settlement Position (Crédito ou Débito)',
        ],
      },
    ],
    howItHelpsDayToDay: [
      'A Tesouraria utiliza o IP776010-AA / T464 todas as manhãs para conciliar a liquidação financeira com o banco liquidante e a grade nacional.',
    ],
    whenMandatoryVsOptional:
      'Estritamente Obrigatório [M] para Tesouraria e Liquidação Financeira.',
    riskIfIgnored:
      'Impossibilidade de conciliar o caixa liquidado pela bandeira com o faturamento capturado.',
  },
  {
    id: 'mc-ip755020-ip755120',
    brand: 'mastercard',
    code: 'IP755020-AA & IP755120-AA',
    electronicFileCode: 'Interchange Detail (IP755020-AA) & Clearing Detail (IP755120-AA)',
    title: 'Interchange Detail Report (IP755020-AA) & Clearing Detail Report (IP755120-AA)',
    subtitle: 'Auditoria completa de IRDs (Interchange Rate Designators), tarifas aplicadas por transação e detecção de Downgrade de Intercâmbio',
    category: '4. Intercâmbio, Tarifas & Data Integrity (D+1 / Mensal)',
    status: 'Obrigatório (M)',
    frequencyAndTiming: 'Diário (gerado por ciclo de clearing do GCMS)',
    targetTeam: 'Financeiro, Pricing / Intercâmbio & Engenharia de Clearing',
    sourceManual: {
      title: 'Mastercard Network Processing Dual Message Clearing System Guide',
      version: 'Release 26.2',
      effectiveDate: '25 August 2026',
      pages: 'Págs. 2043–2047 (IP755120-AA Clearing Detail) e Págs. 2115–2120 (IP755020-AA Interchange Detail)',
    },
    whatItIs:
      'O IP755020-AA (Interchange Detail Report) e o IP755120-AA (Clearing Detail Report) mostram exatamente como o GCMS tarifou as transações enviadas no Outgoing. Detalham o IRD (Interchange Rate Designator — PDS 0158), o programa de cartão, o volume e a comissão de intercâmbio paga em cada faixa.',
    whatInformationItContains: [
      {
        blockTitle: 'Detalhamento por IRD, Produto e Alíquota Efetiva (IP755020-AA)',
        fieldsOrMetrics: [
          'IRD (Interchange Rate Designator) solicitado pelo Adquirente vs IRD efetivamente atribuído pelo GCMS',
          'Código de Produto (GCMS Product ID), MCC (DE 26), País e Indicador Doméstico/Cross-Border',
          'Quantidade de transações, Valor Bruto, Alíquota (% + fixo da tabela T165) e Valor Total de Intercâmbio',
        ],
      },
    ],
    howItHelpsDayToDay: [
      'Revela imediatamente quando o GCMS rebaixou o IRD de uma transação (Downgrade na tabela T160) — por exemplo, quando o adquirente esperava uma tarifa de E-Commerce Autenticado ou Parcelado, mas caiu no IRD de tarifa cheia por falta de um sub-elemento PDS no DE 48 ou envio fora do prazo.',
      'Cruza com o IP755220-AA (ALM Reconciliation Report, págs. 2103–2105) para validar se cartões Black, World Elite ou Corporativos foram tarifados no tier correto de Account Range (IP0030T1).',
    ],
    whenMandatoryVsOptional:
      'Obrigatório [M] para a equipe de Intercâmbio / Receita e Conciliação Financeira.',
    riskIfIgnored:
      'Perda severa de margem financeira por downgrades de IRD não detectados na operação diária.',
  },
];

const REPORT_CATEGORIES: ('ALL' | ReportCategory)[] = [
  'ALL',
  '1. Validação & Rejeição do Outgoing (T+0)',
  '2. Confirmação de Ciclo & Inclusão (T+0)',
  '3. Liquidação Financeira & Agenda (D+1 Tesouraria)',
  '4. Intercâmbio, Tarifas & Data Integrity (D+1 / Mensal)',
];

export function OutgoingReportsExplorer({
  selectedBrand,
}: {
  selectedBrand: OutgoingBrandId;
}) {
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | ReportCategory>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | 'Obrigatório (M)' | 'Condicional (C)'>('ALL');
  const [selectedReportIdByBrand, setSelectedReportIdByBrand] = useState<Record<OutgoingBrandId, string>>({
    visa: 'visa-vx100a-vx204a',
    elo: 'elo-retorno-te01-reg09',
    mastercard: 'mc-t112-ip857010',
  });

  const brandMeta = OUTGOING_BRANDS[selectedBrand];

  const brandReports = useMemo(
    () => OUTGOING_REPORTS.filter((r) => r.brand === selectedBrand),
    [selectedBrand]
  );

  const filteredReports = useMemo(() => {
    return brandReports.filter((r) => {
      if (selectedCategory !== 'ALL' && r.category !== selectedCategory) return false;
      if (selectedStatus !== 'ALL') {
        if (selectedStatus === 'Obrigatório (M)' && r.status !== 'Obrigatório (M)') return false;
        if (selectedStatus === 'Condicional (C)' && r.status === 'Obrigatório (M)') return false;
      }
      return true;
    });
  }, [brandReports, selectedCategory, selectedStatus]);

  const activeReport = useMemo(() => {
    const targetId = selectedReportIdByBrand[selectedBrand];
    return (
      brandReports.find((r) => r.id === targetId) ||
      filteredReports[0] ||
      brandReports[0]
    );
  }, [brandReports, filteredReports, selectedBrand, selectedReportIdByBrand]);

  const timelineStages = [
    {
      time: 'ETAPA 1 · T+0 (Minutos após o Envio)',
      title: 'Crítica Sintática, Rejeições & Erros Aceitos',
      desc: 'Identificar e corrigir no mesmo dia transações que bateram e voltaram ou geraram warning.',
      byBrand: {
        visa: 'VX-100A (Validation Exception) + VX-204A (Returned 168B Images)',
        elo: 'Arquivo Retorno Serviço 10 (TE01 + Registro 09 com Cód. Erro)',
        mastercard: 'Arquivo T112 (IP857010-AA Rejects) + IP714010-AA (Accepted Errors)',
      },
      tone: 'border-rose-500/40 bg-rose-950/15 text-rose-300',
    },
    {
      time: 'ETAPA 2 · T+0 (Fechamento da Janela)',
      title: 'Confirmação de Coleta & Inclusão na Agenda',
      desc: 'Bater se 100% dos lotes enviados pelo motor interno entraram no ciclo da bandeira.',
      byBrand: {
        visa: 'VX-111C + VX-120F (ITF Summary) + VX-220 (Collected Reconciliation)',
        elo: 'Agenda do Credenciador · Registro E1 (Inclusão de Movimento)',
        mastercard: 'IP727020-AA (Cycle Notification) + IP728010-AA (Cycle Summary)',
      },
      tone: 'border-blue-500/40 bg-blue-950/15 text-blue-300',
    },
    {
      time: 'ETAPA 3 · D+1 Manhã (Tesouraria & SLC/B3)',
      title: 'Liquidação Financeira Líquida (Netting) & Saldo Futuro',
      desc: 'Conciliar o valor líquido exato que entra na conta de liquidação e o estoque futuro.',
      byBrand: {
        visa: 'VSS-110 / VSS-115 (Settlement Summary) + TC 46 Subgrupos 1 e 2',
        elo: 'Agenda do Credenciador · Registro E2 (Liquidação Hoje) + Registro E3 (Saldo Futuro)',
        mastercard: 'IP776010-AA / IP776020-AA (Arquivos T461 / T464 Settlement Advisement)',
      },
      tone: 'border-emerald-500/40 bg-emerald-950/15 text-emerald-300',
    },
    {
      time: 'ETAPA 4 · D+1 a Mensal (Receita & Compliance)',
      title: 'Auditoria de Intercâmbio, Downgrades & Scheme Fees',
      desc: 'Auditar qual FPI / IRD / Tarifa Especial foi aplicada e bloquear vazamento de margem.',
      byBrand: {
        visa: 'VSS-120 / VSS-130 (V22120 / TC 46 Sub 4 Intercâmbio) + VSS-140 (Charges)',
        elo: 'Cap. 6 (Remuneração Emissor E1/E2) + Cap. 7 (Standard & Special Fee por CNPJ)',
        mastercard: 'IP755020-AA (Interchange Detail IRD) + IP755120-AA + IP714010-BB',
      },
      tone: 'border-amber-500/40 bg-amber-950/15 text-amber-300',
    },
  ];

  return (
    <div className="space-y-6">
      {/* =====================================================================
          1. LINHA DO TEMPO OPERACIONAL: QUAIS REPORTS USAR EM CADA HORA DO DIA
         ===================================================================== */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 space-y-4 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-blue-400">
              📊 ESTEIRA DIÁRIA DE RELATÓRIOS & CONCILIAÇÃO DO OUTGOING (BACKOFFICE, TESOURARIA & INTERCÂMBIO)
            </span>
            <h3 className="text-lg sm:text-xl font-black text-white mt-0.5">
              Quais Relatórios Usar no Dia a Dia Após Enviar o Arquivo de Outgoing ({brandMeta.name})
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              O ciclo de Outgoing não termina quando o arquivo sai do adquirente: a operação depende de <strong>4 famílias de relatórios oficiais</strong> para tratar rejeições em T+0, confirmar a agenda, liquidar na câmara em D+1 e auditar downgrades de intercâmbio.
            </p>
          </div>
        </div>

        {/* 4 Etapas da Rotina Diária */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {timelineStages.map((st, idx) => (
            <div
              key={idx}
              className={`rounded-xl border p-3.5 flex flex-col justify-between gap-2.5 ${st.tone}`}
            >
              <div>
                <div className="font-mono text-[10px] font-black uppercase tracking-wider opacity-90">
                  {st.time}
                </div>
                <div className="text-sm font-black text-white mt-0.5">{st.title}</div>
                <p className="text-[11px] text-slate-300 mt-1 leading-snug">{st.desc}</p>
              </div>
              <div className="rounded-lg bg-slate-950/90 border border-slate-800 p-2 font-mono text-[11px] text-white">
                <span className="text-[9px] uppercase text-slate-400 block mb-0.5">
                  Relatórios {brandMeta.name}:
                </span>
                {st.byBrand[selectedBrand]}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* =====================================================================
          2. EXPLORADOR SEPARADO DE CADA RELATÓRIO (ESQUERDA: LISTA · DIREITA: FICHA)
         ===================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Coluna Esquerda (4 cols): Lista Separada de Relatórios da Bandeira */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-black uppercase tracking-wider text-white">
                Relatórios Oficiais · {brandMeta.name}
              </h4>
              <span className="text-xs font-mono text-slate-400">
                {filteredReports.length} relatórios
              </span>
            </div>

            {/* Filtro por Obrigatoriedade */}
            <div className="grid grid-cols-3 gap-1.5">
              {(['ALL', 'Obrigatório (M)', 'Condicional (C)'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setSelectedStatus(st)}
                  className={`py-1.5 px-2 rounded-lg text-[11px] font-bold border transition-all ${
                    selectedStatus === st
                      ? 'bg-blue-600 text-white border-blue-400'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  {st === 'ALL' ? 'Todos' : st === 'Obrigatório (M)' ? '[M] Obrigatórios' : '[C] Condicionais'}
                </button>
              ))}
            </div>

            {/* Filtro por Etapa / Categoria */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as 'ALL' | ReportCategory)}
              className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            >
              {REPORT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'ALL' ? 'Todas as Etapas do Dia a Dia (1 a 4)' : cat}
                </option>
              ))}
            </select>

            {/* Cards clicáveis de cada Relatório */}
            <div className="space-y-2 pt-1">
              {filteredReports.map((rep) => {
                const isSelected = activeReport?.id === rep.id;
                const isMand = rep.status === 'Obrigatório (M)';
                return (
                  <button
                    key={rep.id}
                    onClick={() =>
                      setSelectedReportIdByBrand((prev) => ({
                        ...prev,
                        [selectedBrand]: rep.id,
                      }))
                    }
                    className={`w-full text-left rounded-xl p-3.5 border transition-all flex flex-col gap-1.5 ${
                      isSelected
                        ? 'bg-blue-950/50 border-blue-400 shadow-lg shadow-blue-950/40'
                        : 'bg-slate-950/70 border-slate-800/90 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs font-black text-blue-300">
                        {rep.code}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-black border ${
                          isMand
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        }`}
                      >
                        {rep.status}
                      </span>
                    </div>
                    <div className="text-xs font-black text-white leading-snug">
                      {rep.title}
                    </div>
                    <div className="text-[11px] text-slate-400 line-clamp-2">
                      {rep.subtitle}
                    </div>
                    <div className="pt-1 flex items-center justify-between text-[10px] font-mono text-slate-400 border-t border-slate-800/80">
                      <span>{rep.category.split('(')[0].trim()}</span>
                      <span className="text-purple-300">{rep.targetTeam.split(',')[0]}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Coluna Direita (8 cols): Ficha Completa do Relatório Selecionado */}
        {activeReport && (
          <div className="lg:col-span-8 rounded-2xl border border-slate-800 bg-slate-900/80 p-6 space-y-5 shadow-xl">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-800 pb-4">
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-lg bg-blue-500/20 border border-blue-500/40 font-mono text-xs font-black text-blue-300">
                    {activeReport.code}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300">
                    Arquivo: {activeReport.electronicFileCode}
                  </span>
                  <span
                    className={`px-2.5 py-1 rounded-lg text-xs font-black border ${
                      activeReport.status === 'Obrigatório (M)'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    }`}
                  >
                    {activeReport.status}
                  </span>
                </div>

                <h3 className="text-xl font-black text-white pt-1">{activeReport.title}</h3>
                <p className="text-xs sm:text-sm text-slate-300">{activeReport.subtitle}</p>
              </div>

              <button
                onClick={() => {
                  const infoHtml = activeReport.whatInformationItContains
                    .map(
                      (b) =>
                        `<h4>${b.blockTitle}</h4><ul>${b.fieldsOrMetrics
                          .map((m) => `<li>${m}</li>`)
                          .join('')}</ul>`
                    )
                    .join('');
                  const helpHtml = activeReport.howItHelpsDayToDay
                    .map((h) => `<li>${h}</li>`)
                    .join('');
                  sendToDocStudio({
                    mode: 'append_html',
                    title: `Relatório de Outgoing & Conciliação — ${brandMeta.name} — ${activeReport.code}`,
                    sourceModule: 'Relatórios & Conciliação de Outgoing',
                    html: `
                      <h2>${brandMeta.name} — ${activeReport.code}: ${activeReport.title}</h2>
                      <p><strong>Arquivo / Layout Eletrônico:</strong> <code>${activeReport.electronicFileCode}</code></p>
                      <p><strong>Status Operacional:</strong> ${activeReport.status} · <strong>Janela/Frequência:</strong> ${activeReport.frequencyAndTiming}</p>
                      <p><strong>Fonte Normativa:</strong> ${activeReport.sourceManual.title} (${activeReport.sourceManual.version} · Vigência: ${activeReport.sourceManual.effectiveDate} · ${activeReport.sourceManual.pages})</p>
                      <h3>1. O Que É Este Relatório</h3>
                      <p>${activeReport.whatItIs}</p>
                      <h3>2. O Que Ele Traz de Informação</h3>
                      ${infoHtml}
                      <h3>3. Como Ajuda no Dia a Dia</h3>
                      <ul>${helpHtml}</ul>
                      <h3>4. Risco se Ignorado</h3>
                      <p>${activeReport.riskIfIgnored}</p>
                    `,
                    metadata: {
                      brand: selectedBrand,
                      brandName: brandMeta.name,
                      referenceId: activeReport.code,
                      category: activeReport.category,
                      effectiveDate: activeReport.sourceManual.effectiveDate,
                      executiveSummary: activeReport.whatItIs,
                    },
                  });
                }}
                className="px-3.5 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-xs font-bold text-blue-300 transition-all shrink-0"
              >
                📄 Exportar Relatório p/ Doc Studio
              </button>
            </div>

            {/* Metadados Operacionais (Janela, Time, Fonte Oficial) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="rounded-xl bg-slate-950/90 border border-slate-800 p-3">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  ⏰ Quando Recebe / Periodicidade
                </div>
                <div className="text-xs font-bold text-white mt-1">
                  {activeReport.frequencyAndTiming}
                </div>
              </div>
              <div className="rounded-xl bg-slate-950/90 border border-slate-800 p-3">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  👥 Time / Área Usuária no Dia a Dia
                </div>
                <div className="text-xs font-bold text-purple-300 mt-1">
                  {activeReport.targetTeam}
                </div>
              </div>
              <div className="rounded-xl bg-slate-950/90 border border-slate-800 p-3">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  📘 Fonte Normativa & Páginas
                </div>
                <div className="text-xs font-mono text-emerald-300 mt-1">
                  {activeReport.sourceManual.title} ({activeReport.sourceManual.pages})
                </div>
              </div>
            </div>

            {/* 1. O Que É Este Relatório */}
            <div className="rounded-xl bg-slate-950/90 border border-slate-800 p-4 space-y-1.5">
              <div className="text-xs font-black uppercase tracking-wider text-blue-400">
                1. O Que É Este Relatório e Seu Papel no Fluxo de Outgoing
              </div>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                {activeReport.whatItIs}
              </p>
            </div>

            {/* 2. O Que Cada Relatório Tem de Informação */}
            <div className="space-y-2.5">
              <div className="text-xs font-black uppercase tracking-wider text-blue-400">
                2. O Que Este Relatório Traz de Informação (Campos, Subgrupos e Métricas)
              </div>
              <div className="grid grid-cols-1 gap-3">
                {activeReport.whatInformationItContains.map((blk, i) => (
                  <div
                    key={i}
                    className="rounded-xl bg-slate-950/80 border border-slate-800 p-4 space-y-2"
                  >
                    <div className="text-xs font-black text-white">{blk.blockTitle}</div>
                    <ul className="space-y-1.5">
                      {blk.fieldsOrMetrics.map((m, j) => (
                        <li key={j} className="text-xs text-slate-300 flex items-start gap-2">
                          <span className="text-blue-400 font-bold">•</span>
                          <span>{m}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Como Ajuda no Dia a Dia + Regra de Obrigatoriedade + Risco */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl bg-emerald-950/20 border border-emerald-500/30 p-4 space-y-2">
                <div className="text-xs font-black uppercase tracking-wider text-emerald-300">
                  💡 3. Como Ajuda na Operação do Dia a Dia
                </div>
                <ul className="space-y-2">
                  {activeReport.howItHelpsDayToDay.map((h, i) => (
                    <li key={i} className="text-xs text-slate-200 leading-relaxed flex items-start gap-2">
                      <span className="text-emerald-400 font-black">✓</span>
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-3">
                <div className="rounded-xl bg-amber-950/20 border border-amber-500/30 p-3.5 space-y-1">
                  <div className="text-xs font-black uppercase tracking-wider text-amber-300">
                    📌 Quando é Obrigatório [M] vs Condicional / Opcional
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    {activeReport.whenMandatoryVsOptional}
                  </p>
                </div>

                <div className="rounded-xl bg-rose-950/25 border border-rose-500/30 p-3.5 space-y-1">
                  <div className="text-xs font-black uppercase tracking-wider text-rose-300">
                    ⚠️ Risco Financeiro / Operacional se Ignorado
                  </div>
                  <p className="text-xs text-rose-100 leading-relaxed">
                    {activeReport.riskIfIgnored}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
