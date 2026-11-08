'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { sendToDocStudio } from '@/lib/docStudioBridge';

export type JumpTargetTab =
  | 'tables'
  | 'flows'
  | 'matrix'
  | 'sandbox'
  | 'bitmap'
  | 'reports'
  | 'programs';

export interface EducationLesson {
  id: string;
  moduleNumber: number;
  moduleTitle: string;
  lessonCode: string;
  title: string;
  level: 'Iniciante' | 'Intermediário' | 'Avançado / Especialista';
  duration: string;
  objective: string;
  plainExplanation: string[];
  brandComparison: {
    visa: string;
    elo: string;
    mastercard: string;
  };
  productionCase: {
    mistake: string;
    consequence: string;
    fix: string;
  };
  quiz: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
  practiceJump: {
    tab: JumpTargetTab;
    label: string;
  };
}

export const OUTGOING_EDUCATION_LESSONS: EducationLesson[] = [
  // MÓDULO 1
  {
    id: 'm1-l1',
    moduleNumber: 1,
    moduleTitle: 'Módulo 1 — Fundamentos do Arranjo & Dual Message (Autorização vs Outgoing)',
    lessonCode: 'Aula 1.1',
    title: 'Por que Autorizar (0100/0110) não movimenta dinheiro e o que é o Outgoing',
    level: 'Iniciante',
    duration: '8 min',
    objective:
      'Entender a diferença entre a mensagem online em tempo real (Autorização) e o arquivo em lote de liquidação (Outgoing / Clearing).',
    plainExplanation: [
      'No modelo Dual Message (padrão de Crédito e grande parte das capturas Visa, Mastercard e Elo), a compra acontece em dois momentos separados.',
      '1º Momento — Autorização (ISO 8583 MTI 0100 / 0110): ocorre em milissegundos enquanto o cliente está no checkout ou maquininha. Ela apenas pergunta ao Banco Emissor se o cartão é válido e bloqueia (sensibiliza) o limite do portador. Nenhum centavo sai do Emissor para a Adquirente nesse instante.',
      '2º Momento — Outgoing / Clearing (Base II, GCMS MTI 1240 ou Remessa Elo): no fim do dia (D+0), a Adquirente empacota todas as vendas aprovadas e capturadas em um arquivo estruturado e envia para a Bandeira. É esse arquivo de Outgoing que calcula o Intercâmbio e gera a ordem de pagamento na câmara de liquidação (SLC / CIP / B3) no dia seguinte (D+1).',
    ],
    brandComparison: {
      visa: 'Autorização via VIP (0100/0110) ➔ Outgoing via arquivo Base II CTF (Transação TC 05 para compra e TC 06 para estorno).',
      elo: 'Autorização ISO 8583 ➔ Outgoing via Arquivo de Remessa de Liquidação 26.2 (TE05 para compra à vista/parcelada e TE06 para crédito/estorno).',
      mastercard: 'Autorização via Banknet (0100/0110) ➔ Outgoing via arquivo GCMS / IPM usando mensagem ISO 8583 em lote MTI 1240 (First Presentment).',
    },
    productionCase: {
      mistake:
        'Transação aprovada na 0110 (DE 39 = 00), mas que por falha no job noturno da adquirente nunca foi incluída no arquivo de Outgoing.',
      consequence:
        'O lojista acha que vendeu, o limite do cliente fica preso por 7 a 15 dias até cair (expirar), e a adquirente nunca recebe o dinheiro do emissor. Se enviar depois do prazo (ex.: > 7 dias), sofre Late Presentment (Chargeback ou Downgrade).',
      fix: 'Conciliar diariamente o total de autorizações capturadas (0110 aprovadas) contra o total de registros gerados no Outgoing (TC 05 / TE05 / MTI 1240) antes do cutoff.',
    },
    quiz: {
      question:
        'O que acontece financeiramente se uma compra for aprovada na mensagem 0110 (DE 39 = 00), mas não for enviada no arquivo de Outgoing (Base II / GCMS / Elo)?',
      options: [
        'O valor é liquidado normalmente em D+1 porque a autorização 0110 já garante o repasse no SLC.',
        'Nenhum valor é liquidado pelo emissor; o limite do portador apenas fica sensibilizado temporariamente até expirar.',
        'A bandeira gera automaticamente o registro de clearing sem precisar do arquivo da adquirente.',
      ],
      correctIndex: 1,
      explanation:
        'Exato! No fluxo Dual Message, a autorização 0110 apenas reserva limite. A obrigação financeira de liquidação no SLC/B3 e na fatura do portador só nasce quando a adquirente envia o registro de Outgoing (TC 05 / TE05 / MTI 1240).',
    },
    practiceJump: {
      tab: 'flows',
      label: 'Ir para Aba 2: Ver o Diagrama dos 5 Atores (0100 ➔ Outgoing)',
    },
  },
  {
    id: 'm1-l2',
    moduleNumber: 1,
    moduleTitle: 'Módulo 1 — Fundamentos do Arranjo & Dual Message (Autorização vs Outgoing)',
    lessonCode: 'Aula 1.2',
    title: 'O Elo Sagrado entre Autorização e Outgoing: TID, Trace ID e Auth Code',
    level: 'Iniciante',
    duration: '10 min',
    objective:
      'Saber exatamente quais campos da resposta de autorização (0110) precisam ser gravados no banco de dados para alimentar o Outgoing.',
    plainExplanation: [
      'Quando a Bandeira e o Emissor recebem o seu arquivo de Outgoing à noite, como eles sabem que aquela cobrança realmente corresponde à autorização aprovada horas antes?',
      'Através dos identificadores de ciclo de vida gerados na resposta 0110! Se a sua adquirente descartar esses campos após aprovar a venda na maquininha, a transação chegará "órfã" no clearing.',
      'Uma transação órfã no Outgoing sofre duas punições imediatas: (1) perde a tarifa qualificada de intercâmbio (sofre Downgrade para EIRF / Standard) e (2) gera multa de Data Integrity (Visa Data Integrity / Mastercard GDIP).',
    ],
    brandComparison: {
      visa: 'DE 62.2 (Transaction Identifier — TID de 15 dígitos gerado pela Visa na 0110) + DE 38 (Auth Code 6 pos) ➔ Obrigatórios no TCR 0 / TCR 5.',
      elo: 'DE 38 (Código de Autorização 6 pos) + NSU/RRN + Código do Produto ➔ Obrigatórios no Registro 00 (pos 93–98) e Registro 01 (pos 63–65).',
      mastercard: 'DE 63 (Network Data: 3 bytes Rede + 6 bytes Banknet Ref + 4 dígitos Data Juliano da 0110) ➔ Obrigatório dentro do PDS 0158 (Trace ID) no MTI 1240.',
    },
    productionCase: {
      mistake:
        'O motor autorizador aprovou a compra e gravou apenas o NSU interno e o DE 38 (Auth Code), descartando o DE 62.2 da Visa e o DE 63 da Mastercard.',
      consequence:
        'Todas as transações liquidaram com Downgrade de Intercâmbio (EIRF / Standard) e geraram dezenas de milhares de dólares em multas de Data Integrity / GDIP no fim do mês.',
      fix: 'Persistir obrigatoriamente DE 37 (RRN), DE 38 (Auth Code), DE 62.2 (Visa TID) e DE 63 (Mastercard Trace ID) na tabela de transações aprovadas e injetá-los no gerador do Outgoing.',
    },
    quiz: {
      question:
        'Qual campo retornado na mensagem 0110 da Mastercard deve ser obrigatoriamente copiado para dentro do PDS 0158 na mensagem de clearing MTI 1240?',
      options: [
        'DE 63 (Network Data / Banknet Reference Number + Data)',
        'DE 102 (Account Identification 1)',
        'DE 52 (PIN Data)',
      ],
      correctIndex: 0,
      explanation:
        'Perfeito! O DE 63 retornado na 0110 contém o código da rede e o Banknet Reference Number que formam o Trace ID dentro do PDS 0158 no MTI 1240.',
    },
    practiceJump: {
      tab: 'bitmap',
      label: 'Ir para Aba 5: Inspecionar os Bits 38, 62 e 63 no Mapa de Bits',
    },
  },

  // MÓDULO 2
  {
    id: 'm2-l1',
    moduleNumber: 2,
    moduleTitle: 'Módulo 2 — Anatomia Física do Outgoing nas 3 Bandeiras',
    lessonCode: 'Aula 2.1',
    title: 'Registro Posicional de 168 Bytes (Visa/Elo) vs ISO 8583 + PDS TLV (Mastercard)',
    level: 'Intermediário',
    duration: '12 min',
    objective:
      'Compreender a estrutura física de bytes dos arquivos de Outgoing para ler qualquer layout de manual técnico sem dificuldade.',
    plainExplanation: [
      'Embora as três bandeiras cumpram o mesmo papel no Outgoing, elas usam duas arquiteturas físicas diferentes de arquivo:',
      '1. Arquitetura Posicional Fixa de 168 Bytes (Visa Base II e Elo Liquidação): Uma única transação é dividida em uma sequência vertical de linhas de exatos 168 caracteres ASCII. Na Visa elas se chamam TCRs (TCR 0, TCR 1, TCR 2, TCR 5, TCR 7, TCR E). Na Elo elas se chamam Registros (Registro 00, 01, 02, 07, 08, 09).',
      '2. Arquitetura ISO 8583 em Lote + PDS TLV (Mastercard GCMS / IPM): Cada transação é uma mensagem MTI 1240 que possui um Primary/Secondary Bitmap (bits 1 a 128) e empacota dezenas de atributos adicionais em formato Tag-Length-Value (TLV) chamados PDS (Private Data Sub-elements, como PDS 0148, PDS 0158, PDS 0195) dentro dos campos DE 48 e DE 62.',
    ],
    brandComparison: {
      visa: 'Linhas fixas de 168 bytes: Header TCR 90 ➔ Transação (TCR 0 + TCR 1 + TCR 2 BR + TCR 5 + TCR 7 + TCR E) ➔ Trailer TCR 91/92.',
      elo: 'Linhas fixas de 168 bytes: Header BZ ➔ Transação (Registro 00 + Registro 01 + Registro 02 + Registro 07/08) ➔ Trailer Z9.',
      mastercard: 'Registros blocados de 1014 bytes (RDW): Header MTI 1644 (F697) ➔ Transação MTI 1240 (Bitmap + DEs + PDS 0001..0220) ➔ Trailer MTI 1644 (F695).',
    },
    productionCase: {
      mistake:
        'Em uma compra presencial com Chip na Visa/Elo, o sistema gerou apenas a primeira linha (TCR 0 / Registro 00) e esqueceu as linhas complementares (TCR 1, TCR 5, TCR 7 / Registros 01, 02, 07).',
      consequence:
        'A transação inteira é rejeitada na crítica sintática (VX-100A / TE01 Registro 09) porque o bloco multi-registro está incompleto.',
      fix: 'Respeitar a sequência numérica ascendente obrigatória de registros para cada cenário de captura.',
    },
    quiz: {
      question:
        'Qual é o tamanho físico fixo de cada linha de registro (TCR na Visa / Registro 00..09 na Elo) no arquivo de Outgoing?',
      options: ['80 bytes', '168 bytes', '1024 bytes'],
      correctIndex: 1,
      explanation:
        'Correto! Tanto o Visa Base II CTF quanto o arquivo de Mensageria de Liquidação da Elo utilizam registros de tamanho fixo de 168 bytes ASCII.',
    },
    practiceJump: {
      tab: 'tables',
      label: 'Ir para Aba 1: Inspecionar Cada Tabela e o Simulador Visual 168B',
    },
  },
  {
    id: 'm2-l2',
    moduleNumber: 2,
    moduleTitle: 'Módulo 2 — Anatomia Física do Outgoing nas 3 Bandeiras',
    lessonCode: 'Aula 2.2',
    title: 'Obrigatório [M] vs Condicional [C]: O Perigo do Escalonamento [C ➔ M]',
    level: 'Intermediário',
    duration: '10 min',
    objective:
      'Dominar a regra mais importante para analistas e desenvolvedores: quando um campo marcado como Condicional [C] no manual se torna 100% Obrigatório [M].',
    plainExplanation: [
      'Um erro muito comum em projetos de engenharia de bandeiras é olhar a coluna "Status: C (Condicional)" no manual PDF e achar que o campo é opcional.',
      'No vocabulário das bandeiras, Condicional [C] significa: "Se a condição X acontecer na transação, este campo ou registro passa a ser 100% OBRIGATÓRIO [M]; se você não enviá-lo, a transação será rejeitada ou multada".',
      'Exemplos clássicos de escalonamento [C ➔ M]: (1) Se a compra tem Chip (POS Entry = 05 ou 07), a tabela EMV (TCR 7 / Reg 07 / DE 55) vira 100% Obrigatória; (2) Se a venda foi feita por um Subcredenciador (PayFac), a tabela/bloco de Subcredenciador (TCR E / Reg 01+02 / PDS 0176+0208+0220) vira 100% Obrigatória.',
    ],
    brandComparison: {
      visa: 'TCR 7 é [C] no manual geral, mas vira [M] em toda compra Chip; TCR E é [C], mas vira [M] em todo PayFac/Marketplace.',
      elo: 'Registro 07 é [C], mas vira [M] em Chip; CNPJ Subcred (Reg 01 pos 72–85) + Campos 140/150 (Reg 02) viram [M] em todo Subcredenciador.',
      mastercard: 'DE 55 é [C], mas vira [M] em Chip; PDS 0195 é [C], mas vira [M] em toda compra parcelada Brasil; PDS 0176/0208/0220 viram [M] em PayFac.',
    },
    productionCase: {
      mistake:
        'A equipe de desenvolvimento implementou apenas os campos marcados como [M] fixo no manual e deixou de fora os campos [C] de Parcelado e Subcredenciador.',
      consequence:
        'Vendas à vista de EC direto passavam, mas 100% das vendas parceladas e de subcredenciadores foram rejeitadas na bandeira.',
      fix: 'Mapear a matriz de gatilhos [C ➔ M] por fluxo operacional antes de codificar o gerador de Outgoing.',
    },
    quiz: {
      question:
        'O que significa quando um registro ou campo está classificado como Condicional [C] no manual de Outgoing da bandeira?',
      options: [
        'Que o adquirente pode escolher livremente se quer ou não implementar aquele campo.',
        'Que o campo só existe em ambiente de homologação.',
        'Que ele se torna 100% Obrigatório [M] sempre que o gatilho de negócio daquela condição estiver presente na transação.',
      ],
      correctIndex: 2,
      explanation:
        'Exato! Condicional [C] é uma obrigatoriedade disparada por regra: presente o gatilho (Chip, Parcelado, 3DS, PayFac, IATA), a presença do campo é mandatória.',
    },
    practiceJump: {
      tab: 'sandbox',
      label: 'Ir para Aba 4: Testar Gatilhos [C ➔ M] no Sandbox Interativo',
    },
  },

  // MÓDULO 3
  {
    id: 'm3-l1',
    moduleNumber: 3,
    moduleTitle: 'Módulo 3 — Regras Brasileiras no Outgoing (Parcelado, Subcredenciador & SLC)',
    lessonCode: 'Aula 3.1',
    title: 'Como Funciona o Parcelado Brasil nas 3 Bandeiras (Lojista s/ Juros vs Emissor)',
    level: 'Intermediário',
    duration: '12 min',
    objective:
      'Aprender a regra exata de preenchimento de compras parceladas domésticas no Brasil para Visa, Elo e Mastercard.',
    plainExplanation: [
      'O parcelado sem juros do lojista é uma especificidade crítica do mercado brasileiro. Cada bandeira criou campos dedicados no Outgoing para informar a modalidade do parcelamento, a quantidade total de parcelas e o valor da parcela:',
      '• Na Visa (TCR 2 Doméstico Brasil — Format BR): há uma regra famosa nas posições 40–41 (Installment Payment Count): deve-se somar +10 ao número de parcelas! Ou seja, uma compra em 3x é enviada como "13", em 6x como "16" e em 12x como "22".',
      '• Na Elo (Registros 00, 01 e 02): utiliza-se o indicador de movimentação no Reg 00 pos 69 ("P" para Parcelado Loja, "E" para Parcelado Emissor), a quantidade de parcelas no Reg 01 pos 66–67 e o Tipo de Operação 990 (Parcelado Loja) ou 991 (Parcelado Emissor) nos Registros 00, 01 e 02.',
      '• Na Mastercard (MTI 1240 — PDS 0195): envia-se o subelemento PDS 0195 onde o Subfield 2 define o tipo ("04" = Parcelado Lojista sem Juros; "03" = Parcelado Emissor com Juros) e o Subfield 3 informa o número total de parcelas (02 a 99).',
    ],
    brandComparison: {
      visa: 'TCR 2 BR: pos 40–41 = (Nº de Parcelas + 10) [ex.: 03x = "13"] + pos 14–25 (Valor da 1ª Parcela).',
      elo: 'Reg 00 pos 69 = "P"/"E" + Reg 01 pos 66–67 (Qtd Parcelas) + Tipo de Operação 990 (Loja) ou 991 (Emissor).',
      mastercard: 'MTI 1240 PDS 0195: SF1 (Plano) + SF2 ("04" Loja s/ juros ou "03" Emissor) + SF3 (Qtd Parcelas).',
    },
    productionCase: {
      mistake:
        'Na Visa Brasil, o desenvolvedor enviou "03" nas posições 40–41 do TCR 2 BR para uma compra parcelada em 3x (esquecendo de somar +10).',
      consequence:
        'A transação falha na crítica doméstica do Base II Brasil ou é liquidada com quantidade de parcelas incorreta na fatura e na agenda do lojista.',
      fix: 'Aplicar a fórmula oficial do manual Visa Brasil: pos 40–41 = Número de Parcelas + 10 (de "12" para 2x até "99").',
    },
    quiz: {
      question:
        'Em uma compra parcelada lojista em 6 vezes no Brasil, qual valor deve ser gravado nas posições 40–41 do registro TCR 2 (Format BR) da Visa?',
      options: ['06', '16 (6 parcelas + 10)', '60'],
      correctIndex: 1,
      explanation:
        'Correto! Na especificação nacional do TCR 2 BR da Visa, soma-se 10 ao número de parcelas nas posições 40–41: 6 + 10 = "16".',
    },
    practiceJump: {
      tab: 'flows',
      label: 'Ir para Aba 2: Inspecionar o Fluxo 02 (Compra Parcelada Brasil)',
    },
  },
  {
    id: 'm3-l2',
    moduleNumber: 3,
    moduleTitle: 'Módulo 3 — Regras Brasileiras no Outgoing (Parcelado, Subcredenciador & SLC)',
    lessonCode: 'Aula 3.2',
    title: 'Subcredenciadores (PayFac), Marketplaces e Liquidação Centralizada CIP/SLC',
    level: 'Avançado / Especialista',
    duration: '12 min',
    objective:
      'Garantir conformidade regulatória BACEN/CIP e das bandeiras no envio de transações capturadas por Subcredenciadores.',
    plainExplanation: [
      'No Brasil, por determinação do Banco Central (arranjos abertos e grade única da CIP/SLC/B3) e das próprias bandeiras, uma Adquirente que processa transações para um Subcredenciador (Payment Facilitator) ou Marketplace nunca pode ocultar quem é o vendedor final (Sub-Merchant).',
      'Em toda transação de Outgoing de um Subcredenciador, é obrigatório enviar: (1) o ID oficial do Subcredenciador registrado na bandeira, (2) o CNPJ do Subcredenciador e (3) o CPF ou CNPJ, nome, cidade e MCC do Estabelecimento Comercial Final.',
      'Além de permitir a liquidação correta e o registro de recebíveis (registradoras), essa segregação impede que disputas (chargebacks) e alertas de fraude de um sub-merchant contaminem todos os outros lojistas do Subcredenciador.',
    ],
    brandComparison: {
      visa: 'Registro TCR E (Payment Facilitator): PayFac ID (pos 5–15) + Sub-Merchant ID (pos 16–30) + Sub-Merchant Name & Tax ID (CPF/CNPJ).',
      elo: 'Registro 01 pos 72–85 (CNPJ do Subcredenciador 14 díg.) + Registro 02 Campos 140 (1=CPF, 2=CNPJ) e 150 (Documento do EC Final).',
      mastercard: 'MTI 1240: Trio obrigatório PDS 0176 (PayFac ID) + PDS 0208 (Sub-Merchant ID) + PDS 0220 (CNPJ/CPF do Sub-Merchant no Brasil).',
    },
    productionCase: {
      mistake:
        'Enviar transações de um Subcredenciador preenchendo o PDS 0176, mas omitindo o PDS 0208 (Sub-Merchant ID) ou o PDS 0220 (CNPJ/CPF).',
      consequence:
        'Rejeição no GCMS (T112) ou apontamento de violação no GDIP / BRAM, além de concentrar todos os chargebacks no CNPJ do Subcredenciador (estourando o programa ECP).',
      fix: 'Validar como regra atômica no gerador de Outgoing: se há indicador de Subcredenciador, o bloco completo do vendedor final é 100% obrigatório.',
    },
    quiz: {
      question:
        'No Outgoing da Elo (Versão 26.2), onde devem ser informados o CNPJ do Subcredenciador e o CPF/CNPJ do Estabelecimento Comercial Final?',
      options: [
        'Ambos vão apenas no Header BZ do arquivo.',
        'O CNPJ do Subcredenciador vai no Registro 01 (pos 72–85) e o CPF/CNPJ do EC Final vai no Registro 02 (Campos 140 e 150).',
        'Não é necessário enviar o documento do EC Final no Outgoing da Elo.',
      ],
      correctIndex: 1,
      explanation:
        'Perfeito! O Registro 01 leva o CNPJ de 14 dígitos do Subcredenciador (pos 72–85) e o Registro 02 identifica o EC Final nos campos 140 (Tipo de Pessoa) e 150 (CPF/CNPJ).',
    },
    practiceJump: {
      tab: 'flows',
      label: 'Ir para Aba 2: Inspecionar o Fluxo 04 (Subcredenciador / PayFac)',
    },
  },

  // MÓDULO 4
  {
    id: 'm4-l1',
    moduleNumber: 4,
    moduleTitle: 'Módulo 4 — Operação Diária, Relatórios (Reports) & Conciliação',
    lessonCode: 'Aula 4.1',
    title: 'O Ciclo Diário do Time de Operações: Da Crítica T+0 à Liquidação D+1 no SLC',
    level: 'Intermediário',
    duration: '12 min',
    objective:
      'Saber exatamente quais relatórios abrir em cada horário do dia para garantir 0% de perda financeira.',
    plainExplanation: [
      'Enviar o arquivo de Outgoing não encerra o trabalho da operação! Logo após o envio, a bandeira devolve uma sequência de relatórios (Reports) em 4 etapas:',
      '1. Etapa T+0 (Minutos após envio — Crítica Sintática): Verificar se o arquivo foi aceito ou se houve transações rejeitadas (`Visa VX-100A / VX-120F`, `Elo Retorno TE01 Registro 09`, `Mastercard T112 / IP857010-AA`). O que foi rejeitado aqui precisa ser corrigido e reenviado imediatamente.',
      '2. Etapa T+0 Fim do Ciclo (Coleta & Inclusão): Confirmar que todas as transações válidas entraram na janela financeira (`Visa VX-111C / VSS-110`, `Elo Agenda E0/E1`, `Mastercard IP728010`).',
      '3. Etapa D+1 Manhã (Tesouraria & Grade SLC/B3): Bater o valor líquido (Net Settlement) que será creditado na câmara CIP/SLC (`Visa VSS-120 / VSS-115`, `Elo Registros E2/E3`, `Mastercard IP776010 / T461`).',
      '4. Etapa D+1 / Mensal (Auditoria de Intercâmbio, Downgrades e Scheme Fees): Auditar se o intercâmbio aplicado bateu com o esperado e se houve multas ou downgrades (`Visa VSS-130 / VSS-140`, `Elo Cap. 6 & 7`, `Mastercard IP714010-BB & IP755020`).',
    ],
    brandComparison: {
      visa: 'Crítica: VX-100A / VX-120F ➔ Liquidação: VSS-110 / VSS-120 ➔ Intercâmbio: VSS-130 ➔ Tarifas/Multas: VSS-140 / TC 46.',
      elo: 'Crítica: Retorno TE01 (Reg 09) ➔ Transacional/Intercâmbio: Agenda E0/E1 ➔ Grade SLC: Agenda E2/E3 ➔ Tarifas: Cap. 6 & Cap. 7.',
      mastercard: 'Crítica: T112 (IP857010) + IP714010-AA/BB ➔ Reconciliação: IP728010 ➔ Liquidação: IP776010 (T461) ➔ Fatura: IP755020 (MCBS).',
    },
    productionCase: {
      mistake:
        'A equipe de operações só olhava o relatório de liquidação (VSS-120 / T461) na manhã seguinte, ignorando o relatório de erros aceitos com downgrade (IP714010-BB) e o de rejeição T+0.',
      consequence:
        'Transações com erro de IRD liquidavam todos os dias pagando 0,80% a mais de intercâmbio sem ninguém perceber porque o lote "não dava erro fatal".',
      fix: 'Incluir a leitura diária obrigatória do IP714010-AA/BB (Mastercard), VSS-130 (Visa) e E1/TE01 Reg 09 (Elo) no checklist operacional.',
    },
    quiz: {
      question:
        'Na Mastercard, qual relatório avisa que uma transação MTI 1240 foi aceita e liquidada, porém teve seu código de intercâmbio (IRD) rebaixado (sobrescrito) pelo GCMS?',
      options: [
        'T112 (IP857010-AA)',
        'IP714010-BB (Updated Merchant Values Report)',
        'MATCH Report',
      ],
      correctIndex: 1,
      explanation:
        'Exato! O T112 mostra o que foi rejeitado (não liquidado), enquanto o IP714010-BB mostra transações que foram aceitas mas tiveram o IRD ou valores alterados pelo GCMS (gerando downgrade de intercâmbio).',
    },
    practiceJump: {
      tab: 'reports',
      label: 'Ir para Aba 6: Explorar Todos os Relatórios (Reports) do Dia a Dia',
    },
  },

  // MÓDULO 5
  {
    id: 'm5-l1',
    moduleNumber: 5,
    moduleTitle: 'Módulo 5 — Programas de Bandeira, Multas de Data Integrity & Waivers',
    lessonCode: 'Aula 5.1',
    title: 'Como Diagnosticar Incidentes Autorização × Clearing e Estruturar um Waiver Vencedor',
    level: 'Avançado / Especialista',
    duration: '15 min',
    objective:
      'Aprender a metodologia executiva para estancar incidentes entre autorização e clearing, recuperar transações e aprovar Waivers junto às bandeiras.',
    plainExplanation: [
      'Quando ocorre um incidente técnico entre a camada de Autorização e o motor de Outgoing (por exemplo: um deploy que parou de gravar o TID DE 62.2 ou o Trace ID DE 63 por alguns dias, ou enviou MCC/POS Entry Mode divergente), dois impactos surgem: (1) risco de perda financeira imediata nas transações afetadas e (2) cobrança de multas de Data Integrity (Visa VSS-140 / Mastercard GDIP).',
      'O protocolo de resposta de alta performance segue 4 passos:',
      'Passo 1 — Contenção e Rastreabilidade Exata: Isolar a janela exata do incidente (data/hora inicial e final), listar os ARNs / NSUs afetados e corrigir o mapeamento no motor de Outgoing.',
      'Passo 2 — Saneamento e Reprocessamento Dentro da Janela: Para lotes rejeitados (VX-100A / T112 / TE01 Reg 09), recompor os campos a partir do log bruto da 0110 e reenviar antes de estourar o prazo de Timeliness.',
      'Passo 3 — Dossiê Técnico de Waiver: Ao submeter um pedido de Waiver (isenção de multa) para Visa, Mastercard ou Elo, a bandeira exige 4 evidências objetivas: (a) Causa-raiz técnica documentada (Root Cause Analysis), (b) Escopo exato delimitado (volume e período), (c) Evidência em produção de que o fix já foi implantado e a taxa de erro voltou a 0,00%, e (d) Controles preventivos adicionados (linter pré-envio / alerta em T+0).',
    ],
    brandComparison: {
      visa: 'Auditar eventos no VSS-140 / V22120 (TC 46) e submeter evidência de conformidade do DE 62.2 / TCR 0 via Visa Online.',
      elo: 'Auditar apontamentos de qualidade de remessa / PED / PEF / PER e apresentar plano de ação formal com evidência de lotes TE05 limpos.',
      mastercard: 'Auditar relatórios IP714010-AA/BB e eventos MCBS (GDIP / ECP / EFM) e protocolar evidência de correção do MTI 1240.',
    },
    productionCase: {
      mistake:
        'Pedir Waiver à bandeira apenas com justificativa comercial ("a multa ficou alta"), sem anexar a análise de causa-raiz (RCA), os ARNs corrigidos e a prova de que o erro caiu para zero.',
      consequence: 'Pedido de Waiver negado pelo comitê de compliance da bandeira.',
      fix: 'Estruturar o pedido técnico com RCA, janela exata do bug, hash/data do deploy corretivo e gráfico comprovando 0% de erro após a correção.',
    },
    quiz: {
      question:
        'Quais são os 4 pilares indispensáveis para aprovar um pedido de Waiver técnico de Data Integrity junto a uma bandeira?',
      options: [
        'Apenas solicitar desconto comercial ao gerente de conta.',
        'Causa-raiz técnica (RCA) + Escopo delimitado (janela/volume) + Evidência em produção de erro zerado após o fix + Controle preventivo implantado.',
        'Cancelar as transações dos lojistas e pedir estorno das tarifas.',
      ],
      correctIndex: 1,
      explanation:
        'Perfeito! Os comitês de compliance das bandeiras aprovam Waivers quando o adquirente comprova domínio técnico sobre a causa-raiz, correção definitiva em produção e prevenção contra reincidência.',
    },
    practiceJump: {
      tab: 'programs',
      label: 'Ir para Aba 7: Ver a Lista Completa dos 18 Programas das Bandeiras',
    },
  },
];

interface Props {
  onJumpToTab: (tab: JumpTargetTab) => void;
}

const STORAGE_KEY = 'vs_outgoing_edu_completed_v1';

export function OutgoingEducationTrack({ onJumpToTab }: Props) {
  const [selectedLessonId, setSelectedLessonId] = useState<string>(
    OUTGOING_EDUCATION_LESSONS[0].id
  );
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [selectedQuizAnswer, setSelectedQuizAnswer] = useState<Record<string, number>>({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setCompletedIds(parsed);
      }
    } catch {
      // ignore
    }
  }, []);

  const toggleLessonCompleted = (id: string) => {
    setCompletedIds((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const activeLesson = useMemo(() => {
    return (
      OUTGOING_EDUCATION_LESSONS.find((l) => l.id === selectedLessonId) ??
      OUTGOING_EDUCATION_LESSONS[0]
    );
  }, [selectedLessonId]);

  const activeIndex = OUTGOING_EDUCATION_LESSONS.findIndex(
    (l) => l.id === activeLesson.id
  );
  const prevLesson = activeIndex > 0 ? OUTGOING_EDUCATION_LESSONS[activeIndex - 1] : null;
  const nextLesson =
    activeIndex < OUTGOING_EDUCATION_LESSONS.length - 1
      ? OUTGOING_EDUCATION_LESSONS[activeIndex + 1]
      : null;

  const progressPct = Math.round(
    (completedIds.length / OUTGOING_EDUCATION_LESSONS.length) * 100
  );

  const chosenQuizOption = selectedQuizAnswer[activeLesson.id];
  const isQuizAnswered = chosenQuizOption !== undefined;
  const isQuizCorrect = chosenQuizOption === activeLesson.quiz.correctIndex;

  const handleExportLessonToDocStudio = (lesson: EducationLesson) => {
    const paragraphs = lesson.plainExplanation.map((p) => `<p>${p}</p>`).join('');
    sendToDocStudio({
      mode: 'append_html',
      title: `${lesson.lessonCode} — ${lesson.title}`,
      sourceModule: 'Trilha Educativa de Outgoing & Bandeiras',
      html: `
        <h2>${lesson.moduleTitle}</h2>
        <h3>${lesson.lessonCode}: ${lesson.title} (${lesson.level})</h3>
        <p><strong>Objetivo:</strong> ${lesson.objective}</p>
        ${paragraphs}
        <h4>Comparativo nas 3 Bandeiras</h4>
        <ul>
          <li><strong>Visa:</strong> ${lesson.brandComparison.visa}</li>
          <li><strong>Elo:</strong> ${lesson.brandComparison.elo}</li>
          <li><strong>Mastercard:</strong> ${lesson.brandComparison.mastercard}</li>
        </ul>
        <h4>Caso Real de Produção (Erro × Correção)</h4>
        <p><strong>Erro Clássico:</strong> ${lesson.productionCase.mistake}</p>
        <p><strong>Consequência:</strong> ${lesson.productionCase.consequence}</p>
        <p><strong>Como Corrigir:</strong> ${lesson.productionCase.fix}</p>
      `,
      metadata: {
        brand: 'geral',
        brandName: 'Visa · Elo · Mastercard',
        referenceId: lesson.lessonCode,
        category: 'Trilha Educativa',
        executiveSummary: lesson.objective,
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho da Trilha + Barra de Progresso */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 space-y-4 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-black uppercase tracking-wider text-blue-400">
              Academia Prática de Engenharia de Bandeiras · Do Zero ao Especialista
            </span>
            <h3 className="text-lg sm:text-xl font-black text-white">
              Trilha Educativa Guiada: Autorização, Outgoing, Liquidação, Reports & Programas de Compliance
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-4xl leading-relaxed">
              Estude passo a passo nos <strong>5 módulos estruturados</strong> abaixo. Cada aula traz a explicação
              direta, o comparativo entre <strong>Visa, Elo e Mastercard</strong>, um caso real de produção, quiz de
              fixação e link direto para testar no simulador.
            </p>
          </div>

          {/* Card de Progresso do Aluno */}
          <div className="rounded-xl bg-slate-950 border border-slate-800 p-4 min-w-[240px] space-y-2 shrink-0">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-300">Seu Progresso na Trilha</span>
              <span className="font-mono text-emerald-400">
                {completedIds.length}/{OUTGOING_EDUCATION_LESSONS.length} aulas ({progressPct}%)
              </span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Layout Mestre-Detalhe: Currículo dos 5 Módulos à Esquerda (4 cols) + Aula Ativa à Direita (8 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Coluna Esquerda: Índice das Aulas */}
        <div className="lg:col-span-4 rounded-2xl border border-slate-800 bg-slate-900/90 p-4 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-black uppercase tracking-wider text-slate-300">
              Currículo (5 Módulos)
            </span>
            <span className="text-[11px] text-slate-400">Passo a passo</span>
          </div>

          <div className="space-y-2">
            {OUTGOING_EDUCATION_LESSONS.map((lesson) => {
              const isSelected = lesson.id === activeLesson.id;
              const isDone = completedIds.includes(lesson.id);
              return (
                <button
                  key={lesson.id}
                  onClick={() => setSelectedLessonId(lesson.id)}
                  className={`w-full text-left rounded-xl p-3.5 border transition-all space-y-1.5 ${
                    isSelected
                      ? 'bg-blue-950/50 border-blue-400 shadow-md'
                      : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-black text-blue-400">
                      {lesson.lessonCode} · Mód. {lesson.moduleNumber}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        isDone
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : 'bg-slate-900 text-slate-400 border-slate-800'
                      }`}
                    >
                      {isDone ? '✓ Concluída' : lesson.duration}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-white leading-snug">{lesson.title}</div>
                  <div className="text-[11px] text-slate-400">{lesson.level}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Coluna Direita: Conteúdo da Aula Selecionada */}
        <div className="lg:col-span-8 rounded-2xl border border-slate-800 bg-slate-900/90 p-6 space-y-6 shadow-xl">
          {/* Cabeçalho da Aula */}
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-800 pb-4">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-lg bg-blue-500/20 border border-blue-500/40 font-mono text-xs font-black text-blue-300">
                  {activeLesson.lessonCode}
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs font-bold text-slate-200">
                  {activeLesson.level}
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300">
                  ⏱ {activeLesson.duration}
                </span>
              </div>
              <div className="text-xs font-bold text-blue-400 pt-1">
                {activeLesson.moduleTitle}
              </div>
              <h4 className="text-xl font-black text-white">{activeLesson.title}</h4>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                <strong>Objetivo da Aula:</strong> {activeLesson.objective}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                onClick={() => toggleLessonCompleted(activeLesson.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                  completedIds.includes(activeLesson.id)
                    ? 'bg-emerald-600 text-white border-emerald-500'
                    : 'bg-slate-950 text-slate-200 border-slate-700 hover:border-emerald-400'
                }`}
              >
                {completedIds.includes(activeLesson.id)
                  ? '✓ Aula Concluída'
                  : 'Marcar como Concluída'}
              </button>
              <button
                onClick={() => handleExportLessonToDocStudio(activeLesson)}
                className="px-3.5 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-xs font-bold text-blue-300 transition-all"
              >
                📄 Exportar Aula
              </button>
            </div>
          </div>

          {/* 1. Explicação Passo a Passo */}
          <div className="rounded-xl bg-slate-950/90 border border-slate-800 p-5 space-y-3">
            <div className="text-xs font-black uppercase tracking-wider text-blue-400">
              1. Explicação Passo a Passo (Em Português Claro)
            </div>
            <div className="space-y-3">
              {activeLesson.plainExplanation.map((para, idx) => (
                <p key={idx} className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                  {para}
                </p>
              ))}
            </div>
          </div>

          {/* 2. Como Funciona nas 3 Bandeiras */}
          <div className="space-y-2.5">
            <div className="text-xs font-black uppercase tracking-wider text-blue-400">
              2. Como Funciona na Prática em Cada Bandeira (Visa × Elo × Mastercard)
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="rounded-xl bg-slate-950 border border-blue-500/30 p-4 space-y-1.5">
                <div className="text-xs font-black text-blue-400">VISA (Base II CTF)</div>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {activeLesson.brandComparison.visa}
                </p>
              </div>
              <div className="rounded-xl bg-slate-950 border border-amber-500/30 p-4 space-y-1.5">
                <div className="text-xs font-black text-amber-400">ELO (Liquidação 26.2)</div>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {activeLesson.brandComparison.elo}
                </p>
              </div>
              <div className="rounded-xl bg-slate-950 border border-orange-500/30 p-4 space-y-1.5">
                <div className="text-xs font-black text-orange-400">MASTERCARD (GCMS / IPM)</div>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {activeLesson.brandComparison.mastercard}
                </p>
              </div>
            </div>
          </div>

          {/* 3. Caso Real de Produção: Erro Clássico vs Solução */}
          <div className="rounded-xl bg-amber-950/15 border border-amber-500/30 p-5 space-y-3">
            <div className="text-xs font-black uppercase tracking-wider text-amber-300">
              3. Caso Real de Produção: Erro Clássico × Como Evitar
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="rounded-lg bg-slate-950/90 border border-slate-800 p-3.5 space-y-1">
                <div className="text-xs font-bold text-rose-400">❌ O Erro Comum</div>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {activeLesson.productionCase.mistake}
                </p>
              </div>
              <div className="rounded-lg bg-slate-950/90 border border-slate-800 p-3.5 space-y-1">
                <div className="text-xs font-bold text-amber-400">⚠️ Consequência Financeira</div>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {activeLesson.productionCase.consequence}
                </p>
              </div>
              <div className="rounded-lg bg-slate-950/90 border border-slate-800 p-3.5 space-y-1">
                <div className="text-xs font-bold text-emerald-400">✅ A Regra de Engenharia</div>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {activeLesson.productionCase.fix}
                </p>
              </div>
            </div>
          </div>

          {/* 4. Quiz Rápido de Fixação */}
          <div className="rounded-xl bg-slate-950 border border-slate-800 p-5 space-y-3.5">
            <div className="text-xs font-black uppercase tracking-wider text-purple-400">
              4. Teste Rápido de Fixação (1 Pergunta Prática)
            </div>
            <p className="text-xs sm:text-sm font-bold text-white">
              {activeLesson.quiz.question}
            </p>
            <div className="space-y-2">
              {activeLesson.quiz.options.map((opt, idx) => {
                const isPicked = chosenQuizOption === idx;
                const isRightOption = idx === activeLesson.quiz.correctIndex;
                let btnClass = 'bg-slate-900 border-slate-800 text-slate-200 hover:border-slate-600';
                if (isQuizAnswered) {
                  if (isRightOption) {
                    btnClass = 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold';
                  } else if (isPicked && !isRightOption) {
                    btnClass = 'bg-rose-500/20 border-rose-500 text-rose-300';
                  }
                }
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedQuizAnswer((prev) => ({ ...prev, [activeLesson.id]: idx }));
                      if (idx === activeLesson.quiz.correctIndex && !completedIds.includes(activeLesson.id)) {
                        toggleLessonCompleted(activeLesson.id);
                      }
                    }}
                    className={`w-full text-left p-3.5 rounded-xl border text-xs transition-all flex items-center justify-between gap-3 ${btnClass}`}
                  >
                    <span>
                      <strong>{String.fromCharCode(65 + idx)}.</strong> {opt}
                    </span>
                    {isQuizAnswered && isRightOption && (
                      <span className="font-mono text-xs font-black">✓ Correta</span>
                    )}
                  </button>
                );
              })}
            </div>
            {isQuizAnswered && (
              <div
                className={`p-3.5 rounded-xl border text-xs leading-relaxed ${
                  isQuizCorrect
                    ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-200'
                    : 'bg-amber-950/20 border-amber-500/40 text-amber-200'
                }`}
              >
                <strong>Gabarito Comentado:</strong> {activeLesson.quiz.explanation}
              </div>
            )}
          </div>

          {/* Rodapé da Aula: Praticar na Ferramenta + Navegação Anterior/Próxima */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800">
            <button
              onClick={() => onJumpToTab(activeLesson.practiceJump.tab)}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md transition-all"
            >
              🔬 Praticar Agora: {activeLesson.practiceJump.label}
            </button>

            <div className="flex items-center gap-2">
              {prevLesson && (
                <button
                  onClick={() => setSelectedLessonId(prevLesson.id)}
                  className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-600 text-xs font-bold text-slate-300"
                >
                  ← {prevLesson.lessonCode}
                </button>
              )}
              {nextLesson && (
                <button
                  onClick={() => setSelectedLessonId(nextLesson.id)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm"
                >
                  Próxima Aula ({nextLesson.lessonCode}) →
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
