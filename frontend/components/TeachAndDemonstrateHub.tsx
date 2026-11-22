'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { sendToDocStudio } from '@/lib/docStudioBridge';

export type ProductBoxId =
  | 'cartao_presencial'
  | 'cartao_online_tokens'
  | 'clearing_liquidacao'
  | 'produtos_intercambio_faturas'
  | 'pix_boleto_openfinance'
  | 'disputas_releases_2027';

export interface TeachDemoLesson {
  id: string;
  stepBadge: string;
  title: string;
  shortHook: string;
  // LADO ESQUERDO: ENSINAR
  teach: {
    whatItIsPlain: string;
    whyItMatters: string;
    stepByStepFlow: { step: string; actor: string; action: string }[];
    commonDanger: string;
    normativeSource: string;
    acervoSearchQuery: string;
    brandFilter?: string;
  };
  // LADO DIREITO: DEMONSTRAR AO VIVO
  demonstrate: {
    normalLabel: string;
    errorLabel: string;
    normalState: {
      headline: string;
      statusBadge: string;
      wireOrDiagramTitle: string;
      wireLines: { tag: string; value: string; explanation: string; highlight?: 'good' | 'bad' | 'info' }[];
      financialOutcome: string;
    };
    errorState: {
      headline: string;
      statusBadge: string;
      wireOrDiagramTitle: string;
      wireLines: { tag: string; value: string; explanation: string; highlight?: 'good' | 'bad' | 'info' }[];
      financialOutcome: string;
    };
    deepDiveLinks: { label: string; href: string }[];
  };
}

export interface ProductBoxCategory {
  id: ProductBoxId;
  number: string;
  icon: string;
  title: string;
  subtitle: string;
  badge: string;
  lessons: TeachDemoLesson[];
}

export const PRODUCT_TEACH_DEMO_CATEGORIES: ProductBoxCategory[] = [
  {
    id: 'cartao_presencial',
    number: '01',
    icon: '💳',
    title: 'Cartão Presencial (Chip, NFC & Tap on Phone)',
    subtitle: 'Como a maquininha conversa com o chip EMV, protege a senha no HSM e aprova em 1s',
    badge: 'CP · EMV & NFC',
    lessons: [
      {
        id: 'cp-chip-arqc',
        stepBadge: 'Lição 1.1',
        title: 'Chip EMV & Criptograma ARQC / ARPC (Por que o chip não se clona)',
        shortHook: 'A conversa secreta entre o chip do cartão e o HSM do banco emissor',
        teach: {
          whatItIsPlain:
            'Diferente da antiga tarja magnética (que tinha um número fixo fácil de copiar), o chip EMV é um minicomputador que gera uma assinatura criptográfica única para cada compra chamada ARQC (Authorization Request Cryptogram).',
          whyItMatters:
            'Se alguém interceptar os dados da compra na maquininha e tentar repetir a mesma mensagem 1 segundo depois, o banco emissor recusa porque o contador do chip (ATC) e o desafio aleatório da maquininha (Unpredictable Number) mudaram.',
          stepByStepFlow: [
            { step: '1', actor: 'Maquininha (POS)', action: 'Gera um número aleatório (Tag 9F37) e pede ao chip para assinar a compra.' },
            { step: '2', actor: 'Chip do Cartão', action: 'Calcula o criptograma ARQC (Tag 9F26) usando sua chave secreta interna e o contador ATC (Tag 9F36).' },
            { step: '3', actor: 'Adquirente ➔ Bandeira', action: 'Empacota as tags EMV no campo DE 55 da mensagem ISO 8583 (0100) e envia ao Emissor.' },
            { step: '4', actor: 'HSM do Emissor', action: 'Recalcula o ARQC no hardware criptográfico, aprova (DE 39=00) e devolve o ARPC (Tag 91) para o chip validar o banco.' },
          ],
          commonDanger:
            'Cortar ou truncar tags do DE 55 na captura online ou omitir o TCR 7 (Dados de Chip) no arquivo de Outgoing noturno: gera Downgrade de intercâmbio e perda de proteção contra chargeback de fraude.',
          normativeSource: 'EMVCo Book 3 + Visa Base I DE 55 / Base II TC 05 TCR 7 + Elo Reg 07',
          acervoSearchQuery: 'TCR 7 EMV ARQC 9F26 Unpredictable Number DE 55',
          brandFilter: 'ALL',
        },
        demonstrate: {
          normalLabel: '✅ Com Chip EMV Completo (DE 55 + TCR 7)',
          errorLabel: '❌ Fallback Tarja / Sem TCR 7 no Outgoing',
          normalState: {
            headline: 'Autenticação dinâmica EMV validada no HSM do Emissor',
            statusBadge: '✓ APROVADA · INTERCÂMBIO ÓTIMO',
            wireOrDiagramTitle: 'Inspeção Lado a Lado: Mensagem 0100 + Outgoing TCR 7',
            wireLines: [
              { tag: 'DE 22 (POS Entry Mode)', value: '051 (Chip EMV + PIN)', explanation: 'Informa leitura física de chip com capacidade de PIN.', highlight: 'good' },
              { tag: 'DE 55 · Tag 9F26 (ARQC)', value: '8F11C2D4A900B112', explanation: 'Criptograma único de 8 bytes gerado pelo chip para esta compra.', highlight: 'good' },
              { tag: 'DE 55 · Tag 95 (TVR)', value: '0000008000 (40 bits)', explanation: 'Terminal Verification Results sem falhas de autenticação offline.', highlight: 'good' },
              { tag: 'Outgoing · TCR 7 / Reg 07', value: 'TxType=05 · TermCap=E0F8C8 · ATC=0042', explanation: 'Comprova no clearing noturno que a compra foi com Chip EMV.', highlight: 'good' },
            ],
            financialOutcome: 'Qualifica na tarifa plena de Chip Presencial e protege o lojista contra chargeback de cartão falsificado (10.1 / 4870).',
          },
          errorState: {
            headline: 'Leitura caiu para Tarja (Fallback DE 22 = 801) ou TCR 7 foi omitido no Outgoing',
            statusBadge: '⚠ RISCO DE RECUSA / DOWNGRADE +65 bps',
            wireOrDiagramTitle: 'Inspeção Lado a Lado: Falha de Paridade EMV',
            wireLines: [
              { tag: 'DE 22 (POS Entry Mode)', value: '801 (Fallback Tarja Magnética)', explanation: 'Chip falhou e terminal leu a trilha magnética: maioria dos emissores brasileiros bloqueia por regra antifraude.', highlight: 'bad' },
              { tag: 'DE 55 (Dados EMV)', value: '(AUSENTE)', explanation: 'Sem criptograma ARQC para o HSM do emissor validar.', highlight: 'bad' },
              { tag: 'Outgoing · TCR 7 / Reg 07', value: '(NÃO ENVIADO NO LOTE)', explanation: 'Mesmo se autorizou como 051, faltar o TCR 7 no Outgoing rebaixa o intercâmbio para EIRF/Standard!', highlight: 'bad' },
            ],
            financialOutcome: 'Perca de até +65 bps em Downgrade de intercâmbio ou liability total do lojista em caso de fraude presencial.',
          },
          deepDiveLinks: [
            { label: 'Decodificador EMV 40 bits (Tag 95)', href: '/compliance/emv' },
            { label: 'Ver Tabela TCR 7 / Reg 07 no Outgoing', href: '/compliance/outgoing?tab=tables' },
          ],
        },
      },
      {
        id: 'cp-pin-hsm',
        stepBadge: 'Lição 1.2',
        title: 'Senha (PIN Block) & Tradução no HSM (DUKPT ➔ ZPK)',
        shortHook: 'Como a senha de 4 ou 6 dígitos viaja do teclado até o banco sem nunca ficar em aberto',
        teach: {
          whatItIsPlain:
            'Quando o cliente digita a senha no pinpad, ela é imediatamente combinada com parte do número do cartão e criptografada em um bloco de 8 ou 16 bytes chamado PIN Block (DE 52).',
          whyItMatters:
            'Nenhum servidor da adquirente ou da bandeira pode ver a senha em texto puro. Quando o pacote chega na adquirente, ela envia o PIN Block para o hardware HSM (Thales PayShield), que traduz da chave da maquininha (DUKPT) para a chave da bandeira (ZPK) dentro de um cofre físico.',
          stepByStepFlow: [
            { step: '1', actor: 'Pinpad POS', action: 'Deriva uma chave única por transação (DUKPT + KSN de 10 bytes) e gera o PIN Block.' },
            { step: '2', actor: 'Switch Adquirente', action: 'Chama o comando CA na porta :1500 do HSM passando o PIN Block, o KSN e a chave ZPK da bandeira.' },
            { step: '3', actor: 'HSM Adquirente', action: 'Descriptografa e re-criptografa em < 2ms na memória blindada FIPS 140-2 Nível 3.' },
            { step: '4', actor: 'HSM do Emissor', action: 'Compara com o PVV/Offset gravado para o cliente e aprova.' },
          ],
          commonDanger:
            'Dessincronismo de chave ZPK (mensagem 0800 Key Exchange) entre a Adquirente e a Bandeira: o HSM do emissor recebe o PIN Block embaralhado e recusa todas as vendas com DE 39 = 55 (Senha Incorreta)!',
          normativeSource: 'PCI PIN Security v3.1 + ISO 9564 (Formatos 0 e 4 AES) + Mensagem 0800',
          acervoSearchQuery: 'PIN Block DE 52 DUKPT ZPK Key Exchange 0800',
          brandFilter: 'ALL',
        },
        demonstrate: {
          normalLabel: '✅ Tradução HSM Sincronizada (0800 OK)',
          errorLabel: '❌ Chave ZPK Dessincronizada (Recusa 55 em Massa)',
          normalState: {
            headline: 'HSM traduz DUKPT ➔ ZPK com KCV idêntico entre Adquirente e Bandeira',
            statusBadge: '✓ PIN VALIDADO · DE 39 = 00',
            wireOrDiagramTitle: 'Fluxo Criptográfico no Cabo (DE 52 + DE 53)',
            wireLines: [
              { tag: 'Pinpad ➔ Adquirente (KSN)', value: 'FFFF9876543210E00042', explanation: 'Key Serial Number indicando qual chave única DUKPT foi usada.', highlight: 'info' },
              { tag: 'Comando HSM PayShield', value: 'CMD=CA · Resp=CB00 (Sucesso)', explanation: 'Traduziu da BDK do terminal para a ZPK da bandeira sem expor o PIN.', highlight: 'good' },
              { tag: 'DE 52 (PIN Data)', value: 'A94F81C022E17B04', explanation: 'PIN Block criptografado sob a ZPK ativa da sessão.', highlight: 'good' },
              { tag: 'DE 39 (Resposta Emissor)', value: '00 (Approved)', explanation: 'HSM do banco conferiu o PIN com sucesso.', highlight: 'good' },
            ],
            financialOutcome: 'Transação presencial autenticada por senha com risco mínimo de contestação.',
          },
          errorState: {
            headline: 'Rotação 0800 falhou: Adquirente criptografou com ZPK antiga',
            statusBadge: '✕ RECUSA FALSA DE 39 = 55 (SENHA INCORRETA)',
            wireOrDiagramTitle: 'Falha de Sincronismo de Chave de Zona (ZPK)',
            wireLines: [
              { tag: 'Status Chave ZPK', value: 'KCV Adquirente ≠ KCV Bandeira', explanation: 'A bandeira rotacionou a chave de sessão e a adquirente manteve a anterior.', highlight: 'bad' },
              { tag: 'HSM Bandeira / Emissor', value: 'Erro de Paridade / PVV Mismatch', explanation: 'O PIN digitado pelo cliente estava certo, mas a tradução gerou bloco inválido.', highlight: 'bad' },
              { tag: 'DE 39 (Resposta Emissor)', value: '55 (Incorrect PIN) / 96 (System Error)', explanation: 'Cliente recebe "Senha Incorreta" no visor mesmo digitando certo (3x bloqueia o cartão!).', highlight: 'bad' },
            ],
            financialOutcome: 'Queda abrupta de conversão presencial; exige comando imediato de Key Exchange (MTI 0800 DE 70 = 101/161).',
          },
          deepDiveLinks: [
            { label: 'Ver Topologia C4 do HSM PayShield (:1500)', href: '/arquitetura' },
            { label: 'Mapa de Bits ISO 8583 (DE 52 e DE 53)', href: '/compliance/outgoing?tab=bitmap' },
          ],
        },
      },
      {
        id: 'cp-softpos-nfc',
        stepBadge: 'Lição 1.3',
        title: 'Tap on Phone (SoftPOS / MPoC) & Contactless CVM',
        shortHook: 'Como transformar um celular comum em maquininha certificada pelas bandeiras',
        teach: {
          whatItIsPlain:
            'No Tap on Phone (SoftPOS), o lojista recebe pagamentos por aproximação (NFC) diretamente no próprio smartphone Android ou iPhone, sem precisar de hardware POS dedicado.',
          whyItMatters:
            'Como o celular tem tela sensível ao toque conectada à internet, o padrão PCI MPoC (Mobile Payments on COTS) exige atestação constante do aparelho em nuvem e criptografia imediata do toque na tela.',
          stepByStepFlow: [
            { step: '1', actor: 'Servidor MPoC', action: 'Verifica se o celular não tem Root/Jailbreak nem apps de captura de tela antes de liberar a antena NFC.' },
            { step: '2', actor: 'Cartão / Carteira NFC', action: 'Transmite o criptograma contactless em < 300ms.' },
            { step: '3', actor: 'Regra de CVM', action: 'Abaixo do limite Contactless sem senha (R$ 200), não pede PIN; acima (ou em Apple/Google Pay com FaceID), envia o indicador CVM correto.' },
          ],
          commonDanger:
            'Esquecer de enviar o indicador de terminal Tap to Phone / MPoC na autorização e no Outgoing: as bandeiras exigem identificação específica para monitorar performance e fraude de SoftPOS.',
          normativeSource: 'PCI MPoC Standard v1.0 + Visa Tap to Phone Framework + Mastercard Tap on Phone',
          acervoSearchQuery: 'Tap to Phone SoftPOS Contactless CVM POS Entry Mode 071',
          brandFilter: 'ALL',
        },
        demonstrate: {
          normalLabel: '✅ SoftPOS Identificado + CVM Biometria/PIN',
          errorLabel: '❌ SoftPOS Enviado como POS Comum Sem Indicador',
          normalState: {
            headline: 'Transação NFC com indicador Tap to Phone e CVM validado',
            statusBadge: '✓ CONFORMIDADE PCI MPoC',
            wireOrDiagramTitle: 'Campos Obrigatórios do Tap on Phone',
            wireLines: [
              { tag: 'DE 22 (POS Entry Mode)', value: '071 (Contactless EMV)', explanation: 'Leitura via antena NFC usando protocolo EMV Contactless.', highlight: 'good' },
              { tag: 'Tag 9F34 (CVM Results)', value: '010002 / CDCVM (Biometria Celular)', explanation: 'Comprova se o portador autenticou no dispositivo (Apple/Google Pay) ou com PIN.', highlight: 'good' },
              { tag: 'Indicador SoftPOS', value: 'Terminal Type = MPoC / Tap to Phone', explanation: 'Identifica captura em dispositivo móvel COTS homologado.', highlight: 'good' },
            ],
            financialOutcome: 'Aprovação rápida na fila e conformidade com os programas Tap to Phone das 4 bandeiras.',
          },
          errorState: {
            headline: 'Omissão do indicador SoftPOS ou falha de sinalização CDCVM',
            statusBadge: '⚠ RECUSA POR LIMITE CONTACTLESS / NON-COMPLIANCE',
            wireOrDiagramTitle: 'Erro de Sinalização CVM em Carteira Digital',
            wireLines: [
              { tag: 'Compra Apple Pay R$ 450', value: 'Enviada sem flag CDCVM (Consumer Device CVM)', explanation: 'O cliente já autenticou com FaceID no iPhone, mas o terminal não avisou o emissor.', highlight: 'bad' },
              { tag: 'Decisão do Emissor', value: 'DE 39 = 65 / Solicita Senha ou Recusa', explanation: 'O banco acha que foi aproximação de plástico acima de R$ 200 sem senha e nega.', highlight: 'bad' },
            ],
            financialOutcome: 'Perda de vendas de ticket médio alto em carteiras digitais (Apple Pay / Google Pay / Samsung Pay).',
          },
          deepDiveLinks: [
            { label: 'Guia Completo Tap to Phone (SoftPOS)', href: '/compliance/softpos' },
            { label: 'Simular Tap on Phone no Lab 3D', href: '/jornada?track=cartao' },
          ],
        },
      },
    ],
  },
  {
    id: 'cartao_online_tokens',
    number: '02',
    icon: '🔐',
    title: 'Cartão Online (3DS 2.2, Tokens, Passkeys & Recorrência)',
    subtitle: 'Como aprovar mais no e-commerce, eliminar fraude CNP e transferir o risco para o emissor',
    badge: 'CNP · 3DS & VTS/MDES',
    lessons: [
      {
        id: 'cnp-3ds-cavv9',
        stepBadge: 'Lição 2.1',
        title: '3-D Secure 2.2 & Criptograma CAVV v9 (AES) — O Escudo contra Chargeback',
        shortHook: 'Como autenticar o comprador online sem derrubar a conversão do checkout',
        teach: {
          whatItIsPlain:
            'No antigo 3DS 1.0, o cliente sempre era redirecionado para uma página do banco e desistia da compra. No 3DS 2.2, o checkout envia mais de 100 dados do aparelho (IP, Device ID, histórico) em background: em ~85% dos casos o banco aprova silenciosamente (Frictionless) sem o cliente perceber!',
          whyItMatters:
            'Quando o banco autentica (seja silenciosamente ou com biometria no app), ele devolve o ECI 05 (Visa/Elo) ou ECI 02 (Mastercard) e o criptograma CAVV v9. Isso ativa o Liability Shift: se a compra for fraude, o prejuízo é do Banco Emissor, nunca do Lojista!',
          stepByStepFlow: [
            { step: '1', actor: 'Checkout + 3DS Server', action: 'Coleta fingerprint do dispositivo e envia AReq ao Directory Server da bandeira.' },
            { step: '2', actor: 'ACS do Banco Emissor', action: 'Avalia o risco: se baixo, retorna ARes Status=Y (Frictionless) com o criptograma CAVV v9 (AES-128).' },
            { step: '3', actor: 'Autorização 0100', action: 'Adquirente envia a 0100 anexando o ECI e o CAVV v9.' },
            { step: '4', actor: 'Outgoing D+0 (TCR 5 / Reg 02)', action: 'Adquirente grava o ECI, o CAVV e o Directory Server Transaction ID no lote noturno.' },
          ],
          commonDanger:
            'Autenticar no 3DS 2.2 na autorização, mas esquecer de enviar o ECI e o CAVV no arquivo de Outgoing (TCR 5 / PDS 0052 / Elo Reg 02): o lojista perde o Liability Shift quando chega o chargeback!',
          normativeSource: 'EMV® 3DS 2.2 + Visa Release 26.1 (CAVV v9 AES) + Manual Elo 3DS',
          acervoSearchQuery: '3DS 2.2 CAVV v9 AES ECI 05 Liability Shift TCR 5',
          brandFilter: 'ALL',
        },
        demonstrate: {
          normalLabel: '✅ 3DS 2.2 Frictionless + CAVV v9 no Outgoing',
          errorLabel: '❌ Sem 3DS (ECI 07) ou CAVV Omitido no Clearing',
          normalState: {
            headline: 'Compra autenticada com CAVV v9 (AES) e preservada até o Outgoing',
            statusBadge: '✓ LIABILITY SHIFT ATIVO (LOJISTA BLINDADO)',
            wireOrDiagramTitle: 'Paridade 3DS: Autorização 0100 ➔ Outgoing TCR 5 / Reg 02',
            wireLines: [
              { tag: '3DS ARes (transStatus)', value: 'Y (Frictionless — Sem Desafio)', explanation: 'Cliente aprovado em 140ms sem sair da tela da loja.', highlight: 'good' },
              { tag: 'ECI (Electronic Commerce Ind.)', value: '05 (Visa/Elo) | 02 (Mastercard)', explanation: 'Comprova autenticação completa pelo emissor.', highlight: 'good' },
              { tag: 'CAVV Versão 9 (AES-128)', value: '09A7F4C21190E8B344D1...', explanation: 'Novo criptograma padrão AES exigido nos releases 2026+.', highlight: 'good' },
              { tag: 'Outgoing (TCR 5 / Reg 02)', value: 'ECI=05 + CAVV + DS Trans ID gravados', explanation: 'Garante bloqueio automático no VROL/MCOM se houver disputa 10.4/4837.', highlight: 'good' },
            ],
            financialOutcome: '+4% a +7% de aprovação no emissor e R$ 0,00 de perda por chargeback de fraude CNP.',
          },
          errorState: {
            headline: 'Venda enviada sem 3DS (ECI 07) ou CAVV perdido na montagem do lote',
            statusBadge: '✕ RISCO TOTAL DO LOJISTA + MENOR APROVAÇÃO',
            wireOrDiagramTitle: 'Quebra de Proteção no E-Commerce',
            wireLines: [
              { tag: 'ECI Enviado', value: '07 (Non-Authenticated E-Commerce)', explanation: 'Emissores aplicam filtro antifraude severo (alta taxa de recusa falsa DE 39=05/59).', highlight: 'bad' },
              { tag: 'Disputa 10.4 / 4837', value: 'Débito Imediato ao Lojista (TC 15 / 1442)', explanation: 'Sem ECI 05/02 no Outgoing, o lojista assume 100% da fraude + Dispute Fee.', highlight: 'bad' },
            ],
            financialOutcome: 'Perda do valor integral do produto + frete + tarifa de chargeback e impacto no índice VAMP / ECP.',
          },
          deepDiveLinks: [
            { label: 'Laboratório 3-D Secure 2.2 & CAVV v9', href: '/compliance/3ds' },
            { label: 'Testar E-Commerce 3DS no Simulador 3D', href: '/jornada?track=cartao&mod=credito_1x' },
          ],
        },
      },
      {
        id: 'cnp-network-tokens',
        stepBadge: 'Lição 2.2',
        title: 'Tokenização de Bandeira (VTS / MDES / Elo) & Account Updater (VAU/ABU)',
        shortHook: 'Como substituir os 16 dígitos do cartão por um Token que nunca vence quando o plástico é trocado',
        teach: {
          whatItIsPlain:
            'Quando uma loja salva o número real do cartão (FPAN), se o cliente perder a carteira ou o cartão vencer, a cobrança do mês seguinte falha. Com o Network Token (Visa VTS, Mastercard MDES, Elo Token), a bandeira troca o PAN por um DPAN vinculado a um criptograma dinâmico (TAVV).',
          whyItMatters:
            'Se o banco emitir um cartão novo para o cliente, o cofre da bandeira atualiza o vínculo por trás dos panos automaticamente! Além disso, o emissor sabe que o token pertence àquela loja específica e aprova em média +3,5% a mais.',
          stepByStepFlow: [
            { step: '1', actor: 'Lojista / Gateway', action: 'Solicita o provisionamento do Token passando o PAN ao Token Service (VTS / MDES / Elo).' },
            { step: '2', actor: 'Cofre da Bandeira', action: 'Valida com o Emissor e devolve o DPAN (16 dígitos do Token) + Token Requestor ID (11 dígitos).' },
            { step: '3', actor: 'A Cada Compra (0100)', action: 'O Gateway pede um criptograma único TAVV para aquele valor e envia o DPAN no DE 02.' },
            { step: '4', actor: 'Switch da Bandeira', action: 'Faz a detokenização (DPAN ➔ FPAN real), valida o TAVV e entrega ao Emissor com selo de confiança.' },
          ],
          commonDanger:
            'Enviar um Network Token no DE 02 mas esquecer de preencher o criptograma TAVV ou mandar DE 22 como digitação manual (012) em vez de credencial/token (810): a bandeira recusa por falha de validação criptográfica do token!',
          normativeSource: 'EMV® Payment Tokenisation + Visa VTS / Mastercard MDES / Elo Token Specs',
          acervoSearchQuery: 'Network Token VTS MDES Token Requestor ID TAVV DPAN',
          brandFilter: 'ALL',
        },
        demonstrate: {
          normalLabel: '✅ Network Token DPAN + Criptograma TAVV',
          errorLabel: '❌ PAN Estático Salvo em Cofre Próprio (Vencido)',
          normalState: {
            headline: 'Token de Bandeira atualizado automaticamente e autenticado com TAVV',
            statusBadge: '✓ +3,8% APROVAÇÃO · ZERO CHURN DE VENCIMENTO',
            wireOrDiagramTitle: 'Mensageria com Network Token (DPAN + TRID + TAVV)',
            wireLines: [
              { tag: 'DE 02 (Primary Account Number)', value: '400000******9821 (DPAN Token)', explanation: 'Token de 16 dígitos restrito ao Merchant/Token Requestor.', highlight: 'good' },
              { tag: 'Token Requestor ID (TRID)', value: '40112233445 (11 dígitos)', explanation: 'Identifica qual carteira ou e-commerce gerou o token (vai p/ Outgoing!).', highlight: 'good' },
              { tag: 'TAVV (Token Auth Value)', value: 'Criptograma dinâmico validado na rede', explanation: 'Impede que um token vazado seja usado em outro site.', highlight: 'good' },
            ],
            financialOutcome: 'Aumento imediato de conversão, isenção de tarifas de PAN manual e retenção de assinantes.',
          },
          errorState: {
            headline: 'Cartão físico do cliente foi reemitido pelo banco: cobrança no FPAN antigo falha',
            statusBadge: '✕ RECUSA DE 39 = 54 (EXPIRED CARD) / 14',
            wireOrDiagramTitle: 'Falha de Renovação sem Network Token / VAU / ABU',
            wireLines: [
              { tag: 'DE 02 (FPAN Antigo)', value: '453211******8842 (Plástico Cancelado)', explanation: 'O cliente trocou o plástico por perda ou vencimento.', highlight: 'bad' },
              { tag: 'DE 39 (Resposta Emissor)', value: '54 (Expired Card) ou 43 (Stolen Card)', explanation: 'Hard Decline: o lojista perde a venda e precisa pedir novo cartão ao cliente.', highlight: 'bad' },
            ],
            financialOutcome: 'Perda de receita recorrente (Churn Involuntário) e risco de multa se o gateway retentar códigos Hard Decline.',
          },
          deepDiveLinks: [
            { label: 'Central de Tokenização (VTS / MDES / Elo)', href: '/compliance/tokenizacao' },
            { label: 'Retentativas & Credencial Salva (CIT / MIT)', href: '/compliance/retentativas' },
          ],
        },
      },
    ],
  },
  {
    id: 'clearing_liquidacao',
    number: '03',
    icon: '📦',
    title: 'Clearing, Outgoing & Liquidação (Base II, IPM, Serviço 10 & SLC)',
    subtitle: 'Como a autorização vira arquivo noturno (168B/TLV), Unidade de Recebível na B3 e dinheiro no STR',
    badge: 'D+0 Outgoing ➔ D+1 CIP',
    lessons: [
      {
        id: 'clr-outgoing-files',
        stepBadge: 'Lição 3.1',
        title: 'Por que a Autorização (0100) Não Move Dinheiro: Os 4 Arquivos de Outgoing',
        shortHook: 'Entenda de uma vez por todas o modelo Dual-Message e a estrutura de 168 bytes / TLV',
        teach: {
          whatItIsPlain:
            'Quando a maquininha mostra "APROVADO", nenhum centavo saiu do banco emissor ainda: a mensagem 0100/0110 apenas bloqueou o limite do cliente. Para receber o dinheiro, a adquirente precisa enviar à noite o Arquivo de Outgoing (Clearing D+0) contendo todos os detalhes fiscais, de parcelamento e de segurança da venda.',
          whyItMatters:
            'Cada bandeira exige uma gramática física diferente no arquivo de Outgoing: Visa Base II (.CTF) e Elo Serviço 10 (.TXT) usam registros posicionais fixos de 168 bytes; Mastercard GCMS (.IPM) usa blocos binários TLV com prefixo RDW (1014 bytes); e Amex (.CAS) usa registros de 600 bytes.',
          stepByStepFlow: [
            { step: '1', actor: 'Motor Outgoing (D+0)', action: 'Agrupa as vendas capturadas, gera o ARN de 23 dígitos (com dígito Luhn) e monta Header + Transações + Trailer.' },
            { step: '2', actor: 'Appliance da Bandeira', action: 'Valida a sintaxe em T+0 (Visa EP747, Mastercard T112, Elo TE01 Reg 09). Se houver erro grave, rejeita o registro.' },
            { step: '3', actor: 'Câmara da Bandeira', action: 'Qualifica a tarifa de intercâmbio (IRD/PID), gera os relatórios financeiros (VSS-120 / T140 / 20-02) e envia o Incoming ao Emissor.' },
          ],
          commonDanger:
            'Omitir o Transaction ID (DE 62.2 / Banknet DE 63) que veio na autorização 0110 ou errar o centavo residual da 1ª parcela no parcelado brasileiro: gera Downgrade de intercâmbio ou rejeição dura do lote!',
          normativeSource: 'Visa Base II TC 05–92 + Mastercard GCMS IPM MTI 1240 + Elo Serviço 10 v26.2',
          acervoSearchQuery: 'Outgoing Base II TCR 0 IPM 1240 Elo Servico 10 Registro 00',
          brandFilter: 'ALL',
        },
        demonstrate: {
          normalLabel: '✅ Outgoing Íntegro (ARN Luhn + TID + 1ª Parcela)',
          errorLabel: '❌ Outgoing com Erro de Centavos ou Sem TID',
          normalState: {
            headline: 'Encadeamento perfeito de registros obrigatórios e condicionais no lote D+0',
            statusBadge: '✓ ACEITO NO EP747 / T112 / REG 09',
            wireOrDiagramTitle: 'Comparativo das 4 Bandeiras para a Mesma Venda (R$ 100,00 em 3x)',
            wireLines: [
              { tag: 'Visa Base II (.CTF · 168B)', value: 'TC 90 ➔ TC 05 (TCR 0 + TCR 1 + TCR 2 BR + TCR 5/7) ➔ TC 91/92', explanation: '1ª parcela = R$ 33,34 (absorve R$ 0,01 residual) + 2x de R$ 33,33 no TCR 2 BR.', highlight: 'good' },
              { tag: 'Mastercard GCMS (.IPM · TLV)', value: '1644-697 ➔ MTI 1240 (Func 200 + PDS 0158 + PDS 0195) ➔ 1644-695', explanation: 'PDS 0195 carrega o cronograma de parcelas e PDS 0158 preserva o Banknet Reference.', highlight: 'good' },
              { tag: 'Elo Serviço 10 (.TXT · 168B)', value: 'Reg B0 ➔ TE 05 (Reg 00 + 01 + 02 + 07 + 08) ➔ Reg BZ', explanation: 'Reg 02 traz o código IBGE de 7 dígitos, CAVV v9 e valor da 1ª parcela.', highlight: 'good' },
            ],
            financialOutcome: 'Lote processado na 1ª janela noturna e liquidado na grade matinal da CIP em D+1 sem penalidades.',
          },
          errorState: {
            headline: 'Divisão de R$ 100,00 em 3x enviada como 3x R$ 33,33 (Soma R$ 99,99 ≠ R$ 100,00)',
            statusBadge: '✕ HARD REJECT D+0 (EP747-R088 / T112 / REG 09)',
            wireOrDiagramTitle: 'Crítica Matemática no Edit Package da Bandeira',
            wireLines: [
              { tag: 'Valor Total (TCR 0 / Reg 00)', value: '000000010000 (R$ 100,00)', explanation: 'Valor bruto total declarado no registro base.', highlight: 'info' },
              { tag: 'Parcelas (TCR 2 BR / PDS 0195)', value: '1ª=33,33 + 2ª=33,33 + 3ª=33,33 (Soma = R$ 99,99)', explanation: 'Faltou alocar o R$ 0,01 residual na 1ª parcela!', highlight: 'bad' },
              { tag: 'Retorno Crítica T+0', value: 'REJECT: Installment Sum Mismatch', explanation: 'A bandeira recusa a transação; o adquirente não recebe do emissor até corrigir e reenviar em D+1.', highlight: 'bad' },
            ],
            financialOutcome: 'Atraso de caixa para a adquirente e risco de downgrade por tempestividade se passar de D+2/D+3.',
          },
          deepDiveLinks: [
            { label: 'Explorar as 35 Tabelas de Outgoing Separadas', href: '/compliance/outgoing?tab=tables' },
            { label: 'Gerar Arquivo Sintético (.CTF/.IPM/.TXT) & Doutor Rejects', href: '/compliance/outgoing?tab=eng_lab' },
          ],
        },
      },
      {
        id: 'clr-b3-cip-slc',
        stepBadge: 'Lição 3.2',
        title: 'Registradoras de Recebíveis (B3 / CERC) & Grade CIP/SLC (ASLC026/028/031)',
        shortHook: 'O caminho do dinheiro entre o Banco Emissor, a CIP/Núclea, o STR do Bacen e a conta do Lojista',
        teach: {
          whatItIsPlain:
            'No Brasil, o dinheiro das vendas de cartão não vai direto do banco emissor para o lojista. Primeiro a adquirente registra a Unidade de Recebível (UR) na Registradora (B3, CERC ou TAG — Resolução BCB 264) e depois liquida tudo de forma centralizada na CIP/Núclea (Sistema de Liquidação Centralizada - SLC).',
          whyItMatters:
            'Se o lojista pegou um empréstimo no Banco X dando suas vendas de cartão em garantia (gravame/cessão fiduciária na B3), a registradora avisa a adquirente às 06h00 da manhã para enviar o arquivo ASLC026 pagando diretamente ao Banco X em vez da conta original do lojista!',
          stepByStepFlow: [
            { step: '1', actor: 'Adquirente (D+0/D+1)', action: 'Constitui e atualiza o valor líquido da UR (CNPJ + Bandeira + Data) na Registradora (B3/CERC).' },
            { step: '2', actor: 'Registradora (06h00)', action: 'Devolve o arquivo de efeitos de contrato informando o domicílio bancário e eventuais travas/cessões.' },
            { step: '3', actor: 'CIP / Núclea (SLC)', action: 'Recebe os arquivos XML ASLC026 (Crédito), ASLC028 (Débito) e ASLC031 (Antecipação) e faz o Netting multilateral.' },
            { step: '4', actor: 'STR (Banco Central)', action: 'Liquida os saldos líquidos em Reserva Bancária às 08h30 e credita o banco domicílio do lojista.' },
          ],
          commonDanger:
            'Enviar na grade ASLC026 uma conta domicílio diferente da trava de cessão ativa na registradora B3/CERC: a CIP/Núclea rejeita a linha no arquivo de erro ASLC026E!',
          normativeSource: 'Resolução BCB nº 264/2022 + Catálogo de Arquivos SLC/Núclea (ASLC026/028/031)',
          acervoSearchQuery: 'Resolucao BCB 264 Unidade de Recebivel ASLC026 CIP SLC',
          brandFilter: 'ALL',
        },
        demonstrate: {
          normalLabel: '✅ UR Validada na B3 + Liquidação ASLC026 às 08h30',
          errorLabel: '❌ Divergência de Gravame B3 (Erro ASLC026E na CIP)',
          normalState: {
            headline: 'Conciliação 4-Way perfeita entre Outgoing, Retorno Bandeira, UR B3 e Grade SLC',
            statusBadge: '✓ LIQUIDADO NA 1ª JANELA STR (08H30)',
            wireOrDiagramTitle: 'Fluxo Financeiro na Grade Multilateral SLC/CIP',
            wireLines: [
              { tag: 'Unidade de Recebível (UR)', value: 'CNPJ 12.345.678/0001-99 · VISA · Crédito · Venc D+30', explanation: 'Registrada na B3 conforme Resolução BCB 264.', highlight: 'good' },
              { tag: 'Arquivo SLC Enviado', value: 'ASLC026 (Crédito) / ASLC028 (Débito) / ASLC031 (Antecip.)', explanation: 'XML assinado digitalmente com certificado ICP-Brasil na RSFN.', highlight: 'good' },
              { tag: 'Liquidação STR (Bacen)', value: 'Emissor deposita líq. IC ➔ Adquirente repassa líq. MDR ao EC', explanation: 'Crédito definitivo na conta domicílio do lojista.', highlight: 'good' },
            ],
            financialOutcome: 'Zero falha operacional de liquidação e conciliação contábil 100% fechada.',
          },
          errorState: {
            headline: 'Adquirente enviou conta antiga do lojista, ignorando cessão ativa na B3',
            statusBadge: '✕ REJEIÇÃO CIP · ARQUIVO ASLC026E',
            wireOrDiagramTitle: 'Bloqueio de Grade por Conflito de Titularidade/Domicílio',
            wireLines: [
              { tag: 'Instrução Registradora B3', value: 'Gravame Ativo: Pagar 100% no ISPB Credor 60701190', explanation: 'Lojista cedeu a UR em operação de antecipação/crédito.', highlight: 'info' },
              { tag: 'XML ASLC026 Enviado', value: 'ISPB Domicílio Antigo ≠ ISPB do Gravame', explanation: 'Motor de agenda não processou o arquivo matinal da registradora.', highlight: 'bad' },
              { tag: 'Retorno CIP/Núclea', value: 'ASLC026E — Erro E042 (Domicílio Inválido p/ UR)', explanation: 'Pagamento bloqueado; exige reprocessamento na janela vespertina.', highlight: 'bad' },
            ],
            financialOutcome: 'Atraso no pagamento ao credor/lojista e risco regulatório perante o Banco Central (Res. BCB 264).',
          },
          deepDiveLinks: [
            { label: 'Mesa de Conciliação 4-Way (Auth × Outgoing × Retorno × SLC)', href: '/compliance/outgoing?tab=eng_lab' },
            { label: 'Painel de Liquidação CIP/SLC & Grades', href: '/compliance/conciliacao' },
          ],
        },
      },
    ],
  },
  {
    id: 'produtos_intercambio_faturas',
    number: '04',
    icon: '💰',
    title: 'Produtos, Intercâmbio, MDR & Faturas (MCBS / VSS)',
    subtitle: 'Onde nasce o código do plástico (PID/Brand Product), tetos do Bacen (BCB 304) e auditoria de faturas',
    badge: 'PID · BCB 304 · MCBS',
    lessons: [
      {
        id: 'prd-pid-bcb304',
        stepBadge: 'Lição 4.1',
        title: 'Mapa de Produtos das 4 Bandeiras & Teto Regulatório do Bacen (Res. BCB 304)',
        shortHook: 'Por que um cartão Débito paga no máximo 0,50%, um Pré-Pago 0,70% e um Infinite/Black é livre',
        teach: {
          whatItIsPlain:
            'Cada cartão emitido pertence a um produto específico codificado em 2 ou 3 letras nas tabelas de BINs das bandeiras (ex.: Visa Classic = C, Platinum = P, Infinite = I, Débito = VD; Mastercard Standard = MCC, Black = MCB, Pré-Pago = MPR; Elo Mais = 070, Nanquim = 071).',
          whyItMatters:
            'Pela Resolução BCB nº 304/2023 do Banco Central, qualquer transação de Débito tem intercâmbio limitado a 0,50% e qualquer cartão Pré-Pago é limitado a 0,70%. Já os cartões de Crédito Puro (Classic a Infinite/Black) e Corporativos operam em Livre Mercado, variando conforme a categoria do plástico, o MCC e o número de parcelas.',
          stepByStepFlow: [
            { step: '1', actor: 'Tabelas de BIN (ARDEF / MPE T068)', action: 'Mapeiam as faixas de 8 dígitos (BIN) para o código de produto (PID / Brand Product) e indicador de funding (Débito, Pré-Pago ou Crédito).' },
            { step: '2', actor: 'Autorização (DE 62.23 / PDS 0002)', action: 'A bandeira devolve o código oficial do produto do cartão na resposta 0110.' },
            { step: '3', actor: 'Cálculo Waterfall de Intercâmbio', action: 'Cruza Produto + Modalidade + Parcelas + Canal + MCC para aplicar o teto BCB 304 ou a alíquota da tabela de crédito.' },
          ],
          commonDanger:
            'Tratar cartão Pré-Pago como se fosse Crédito Puro na precificação de MDR ou não atualizar semanalmente a tabela de BINs (ARDEF / MPE T068): gera erro de provisionamento financeiro de intercâmbio.',
          normativeSource: 'Resolução BCB nº 304/2023 + Tabelas Visa ARDEF / Mastercard MPE T068 / Elo BINs',
          acervoSearchQuery: 'Resolucao BCB 304 teto intercambio debito 0,50 pre-pago 0,70 Product ID',
          brandFilter: 'ALL',
        },
        demonstrate: {
          normalLabel: '✅ Enquadramento Correto por Produto & Teto BCB 304',
          errorLabel: '❌ Downgrade de Intercâmbio (EIRF / Standard)',
          normalState: {
            headline: 'Identificação exata do PID/Brand Product e qualificação na tarifa ótima',
            statusBadge: '✓ TARIFA ÓTIMA QUALIFICADA',
            wireOrDiagramTitle: 'Comparativo de Intercâmbio por Tipo de Plástico (Venda de R$ 200,00)',
            wireLines: [
              { tag: 'Débito (Visa VD / MC Maestro / Elo 001)', value: 'Intercâmbio = 0,50% (R$ 1,00)', explanation: 'Travado pelo teto regulatório da Resolução BCB 304/2023.', highlight: 'good' },
              { tag: 'Pré-Pago (Visa VP / MC MPR / Elo 065)', value: 'Intercâmbio = 0,70% (R$ 1,40)', explanation: 'Travado pelo teto regulatório de 0,70% para contas pré-pagas.', highlight: 'good' },
              { tag: 'Crédito Infinite / Black (1x Qualificado)', value: 'Intercâmbio = ~1,80% a 2,10% (Livre Mercado)', explanation: 'Qualificado com Lifecycle ID (TID/Banknet) e envio em D+0.', highlight: 'info' },
            ],
            financialOutcome: 'Margem líquida (Spread MDR - Intercâmbio - Scheme Fee) preservada centavo a centavo.',
          },
          errorState: {
            headline: 'Perda de campo obrigatório no Outgoing derruba a transação para a faixa punitiva',
            statusBadge: '⚠ DOWNGRADE EIRF / STANDARD (+45 a +95 bps)',
            wireOrDiagramTitle: 'Como nasce o prejuízo invisível do Downgrade',
            wireLines: [
              { tag: 'Intercâmbio Esperado (Qualificado)', value: '1,55% (R$ 3,10 em venda de R$ 200)', explanation: 'Usado pelo time comercial para precificar o MDR do lojista.', highlight: 'info' },
              { tag: 'Falha no Outgoing D+0', value: 'TID ausente / Envio após D+3 / MCC divergente', explanation: 'Bandeira desclassifica o programa CPS / Merit.', highlight: 'bad' },
              { tag: 'Intercâmbio Cobrado no VSS-120 / T140', value: '2,25% EIRF / Standard (R$ 4,50)', explanation: 'A adquirente perde R$ 1,40 de margem líquida nesta única venda!', highlight: 'bad' },
            ],
            financialOutcome: 'Em R$ 100 milhões/mês com 8% de downgrade, a perda silenciosa passa de R$ 52.000/mês.',
          },
          deepDiveLinks: [
            { label: 'Abrir Atlas Unificado de Produtos das 4 Bandeiras', href: '/mapa/produtos' },
            { label: 'Calculadora Financeira de Downgrade (R$) & Amex', href: '/compliance/outgoing?tab=downgrade_amex' },
          ],
        },
      },
      {
        id: 'prd-mcbs-vss-brl',
        stepBadge: 'Lição 4.2',
        title: 'Faturas das Bandeiras (Visa VSS & Mastercard MCBS) e a Conversão USD ➔ BRL',
        shortHook: 'Como auditar os códigos de cobrança (Billing Lines) que as bandeiras debitam da adquirente/emissor',
        teach: {
          whatItIsPlain:
            'Além do intercâmbio (que vai do adquirente para o emissor), as próprias bandeiras cobram tarifas de uso da rede, processamento de autorização, clearing, tokenização e programas de monitoria através dos relatórios Visa VSS-110/140 (TC 46) e Mastercard MCBS (TN3A / MTI 1740).',
          whyItMatters:
            'Em 01/05/2026 (Release 26.1), a Visa converteu toda a tabela de tarifas domésticas do Brasil (Visa Fee Schedule Brazil) de Dólar (USD) para Reais (BRL), eliminando a variação cambial PTAX nas faturas nacionais.',
          stepByStepFlow: [
            { step: '1', actor: 'Eventos Transacionais', action: 'Cada autorização (0100), clearing (TC 05/1240), consulta ou retentativa incrementa um contador de Billing Event.' },
            { step: '2', actor: 'Relatórios VSS / MCBS', action: 'A bandeira consolida a volumetria por código de tarifa (Jurisdiction + Event ID + Fee Tier) e debita na grade de liquidação.' },
            { step: '3', actor: 'Auditoria Financeira', action: 'Cruza a quantidade faturada pela bandeira com os logs internos do switch autorizador e do Outgoing.' },
          ],
          commonDanger:
            'Pagar faturas MCBS/VSS sem auditar linhas de "Integrity Fee / Misuse of Auth / Excess Retry": muitas vezes um único lojista mal configurado em loop de retentativa gera dezenas de milhares de reais em multas de bandeira.',
          normativeSource: 'Visa Brazil Fee Schedule (01/05/2026 BRL) + Mastercard Consolidated Billing System (MCBS)',
          acervoSearchQuery: 'Visa Fee Schedule Brazil BRL VSS-110 MCBS billing line',
          brandFilter: 'ALL',
        },
        demonstrate: {
          normalLabel: '✅ Fatura Auditada em BRL (Zero Multa Integrity)',
          errorLabel: '❌ Cobrança Punitiva por Retentativa / Ghost Auth',
          normalState: {
            headline: 'Auditoria de Billing Lines domésticas em BRL batendo 100% com o volume do Switch',
            statusBadge: '✓ CONCILIADO · ZERO PENALIDADE',
            wireOrDiagramTitle: 'Exemplo de Linhas Auditadas (VSS-110 / MCBS)',
            wireLines: [
              { tag: 'Visa Domestic Auth Fee (BRL)', value: 'Tarifado em Reais (BRL fixo desde 01/05/2026)', explanation: 'Sem descasamento cambial PTAX entre o custo da bandeira e o MDR em R$.', highlight: 'good' },
              { tag: 'Data Integrity / GDIP', value: 'R$ 0,00 (100% paridade TID / Banknet)', explanation: 'Nenhuma transação penalizada por falta de dados obrigatórios.', highlight: 'good' },
            ],
            financialOutcome: 'Previsibilidade total de take-rate e controle fino do custo por transação.',
          },
          errorState: {
            headline: 'Loop de retentativa em Hard Decline (DE 39 = 04/14/57) dispara multa na fatura',
            statusBadge: '✕ PENALIDADE RETRY / MISUSE FEE',
            wireOrDiagramTitle: 'Impacto de Retentativas Indevidas na Fatura da Bandeira',
            wireLines: [
              { tag: 'Comportamento do Gateway', value: '25 tentativas seguidas no mesmo cartão recusado com DE 39=14', explanation: 'Viola o limite máximo de retentativas permitido pelas bandeiras.', highlight: 'bad' },
              { tag: 'Linha na Fatura VSS / MCBS', value: 'Category 1 Retry Fee / Excessive Auth Fee', explanation: 'Cobrança por tentativa excedente debitada direto no settlement da adquirente.', highlight: 'bad' },
            ],
            financialOutcome: 'Erosão direta do EBITDA da operação; exige bloqueio automático de Hard Declines no switch.',
          },
          deepDiveLinks: [
            { label: 'Auditor de Faturas MCBS (TN3A) & Billing Lines', href: '/mcbs' },
            { label: 'Catálogo das 454 Linhas de Scheme Fees', href: '/compliance/fees' },
          ],
        },
      },
    ],
  },
  {
    id: 'pix_boleto_openfinance',
    number: '05',
    icon: '⚡',
    title: 'Pix (SPI/DICT), Pix Automático, NFC, MED 2.0 & Boleto NPC',
    subtitle: 'Liquidação instantânea no Banco Central (pacs.008), recorrência, rastreio multinível e SILOC vs STR',
    badge: 'SPI · MED 2.0 · NPC',
    lessons: [
      {
        id: 'pix-spi-dict',
        stepBadge: 'Lição 5.1',
        title: 'Como o Pix Liquida em 1 Segundo no Banco Central (BR Code ➔ DICT ➔ SPI pacs.008)',
        shortHook: 'A diferença estrutural entre a liquidação instantânea nas Contas PI e o ciclo D+1/D+30 do cartão',
        teach: {
          whatItIsPlain:
            'No cartão, a autorização é instantânea mas o dinheiro só muda de banco no dia seguinte (ou em 30 dias) em lote. No Pix, a mensagem e o dinheiro viajam juntos: o Sistema de Pagamentos Instantâneos (SPI) do Banco Central debita a Conta PI do banco pagador e credita a Conta PI do banco recebedor na mesma fração de segundo!',
          whyItMatters:
            'Tudo acontece sobre o padrão global XML ISO 20022 (mensagens pacs.008 para envio, pacs.002 para confirmação e pacs.004 para devolução), precedido por uma consulta ultrarrápida ao DICT (diretório de chaves do Bacen) que também devolve o histórico antifraude daquela chave.',
          stepByStepFlow: [
            { step: '1', actor: 'App Pagador ➔ DICT', action: 'Lê o QR Code (BR Code EMV®) ou chave e consulta o DICT para obter ISPB, conta e alertas de fraude.' },
            { step: '2', actor: 'PSP Pagador', action: 'Valida biometria, checa o Limite Noturno (IN BCB 331 — R$ 1.000 das 20h às 06h), debita o cliente e gera o EndToEndId (32 caracteres).' },
            { step: '3', actor: 'SPI (Banco Central)', action: 'Recebe o XML pacs.008 assinado na RSFN e transfere o saldo entre as Contas PI dos dois bancos.' },
            { step: '4', actor: 'PSP Recebedor', action: 'Credita o lojista (ou aplica Bloqueio Cautelar de 72h se suspeitar de golpe em PF), devolve pacs.002 e dispara o Webhook.' },
          ],
          commonDanger:
            'Não validar a assinatura do Webhook ou liberar mercadoria apenas pelo comprovante em tela do celular (sem aguardar o pacs.002 com status ACSC e conferência do EndToEndId).',
          normativeSource: 'Regulamento do Pix (Res. BCB nº 1/2020) + Catálogo de Mensagens SPI (ISO 20022)',
          acervoSearchQuery: 'Pix SPI DICT pacs.008 pacs.002 Bloqueio Cautelar Limite Noturno',
          brandFilter: 'ALL',
        },
        demonstrate: {
          normalLabel: '✅ Pix Liquidado no SPI em 920ms (pacs.002 ACSC)',
          errorLabel: '❌ Bloqueio Noturno (IN 331) ou Cautelar 72h (Res. 147)',
          normalState: {
            headline: 'Liquidação Bruta em Tempo Real (LBTR) concluída nas Contas PI do Bacen',
            statusBadge: '✓ LIQUIDADO EM 920 ms (IRREVOGÁVEL)',
            wireOrDiagramTitle: 'Anatomia da Mensagem ISO 20022 no SPI',
            wireLines: [
              { tag: 'EndToEndId (32 caracteres)', value: 'E60701190202611191042a9f8c7d6e5b', explanation: 'E + ISPB Pagador (8d) + Data/Hora UTC (12d) + Sequencial único (11c).', highlight: 'good' },
              { tag: 'Mensagem Envio (SPI)', value: 'pacs.008.001.08 (FIToFICustomerCreditTransfer)', explanation: 'Movimenta reserva direto na Conta PI do Banco Central.', highlight: 'good' },
              { tag: 'Mensagem Confirmação', value: 'pacs.002.001.10 · Status = ACSC', explanation: 'AcceptedSettlementCompleted: dinheiro disponível na conta do lojista.', highlight: 'good' },
            ],
            financialOutcome: 'Lojista recebe em D+0 (< 1,5s) com custo de ~0,35% (versus ~1,13% no débito e ~2,45% no crédito).',
          },
          errorState: {
            headline: 'Motor antifraude do PSP Recebedor retém o crédito por até 72h (Bloqueio Cautelar)',
            statusBadge: '⚠ BLOQUEIO CAUTELAR 72H (RES. BCB 147)',
            wireOrDiagramTitle: 'Proteção Regulatória contra Conta Laranja no Recebimento',
            wireLines: [
              { tag: 'Gatilho Antifraude Recebedor', value: 'Conta PF recebendo Pix atípico / Alerta no DICT', explanation: 'Resolução BCB 147 obriga o PSP recebedor a reter preventivamente.', highlight: 'bad' },
              { tag: 'Ação na Conta Destino', value: 'Saldo bloqueado por até 72 horas para análise', explanation: 'Se confirmada fraude, devolve via pacs.004 antes que o golpista saque.', highlight: 'info' },
            ],
            financialOutcome: 'Evita o esvaziamento imediato da conta e viabiliza a recuperação de fundos pelo MED.',
          },
          deepDiveLinks: [
            { label: 'Simular Pix SPI, Limite Noturno e Cautelar em 3D', href: '/jornada?track=pix_spi' },
            { label: 'Simular Boleto NPC (SILOC < 250k vs STR >= 250k)', href: '/jornada?track=boleto_npc' },
          ],
        },
      },
      {
        id: 'pix-auto-nfc-med2',
        stepBadge: 'Lição 5.2',
        title: 'Pix Automático (Recorrência), Pix por Aproximação (NFC JSR) & Novo MED 2.0 (2026/2027)',
        shortHook: 'As 3 grandes evoluções do Pix que mudam assinaturas, maquininhas e combate a golpes',
        teach: {
          whatItIsPlain:
            '(1) O Pix Automático permite cobrar mensalidades (streaming, escolas, SaaS) com uma única aprovação inicial do cliente no app do banco; (2) O Pix por Aproximação permite pagar encostando o celular na maquininha via Jornada Sem Redirecionamento (JSR / FIDO2); e (3) O MED 2.0 passa a rastrear e bloquear o dinheiro de golpes além da 1ª conta laranja!',
          whyItMatters:
            'Juntas, essas três frentes trazem o Pix para os dois territórios onde o cartão ainda reinava sozinho (recorrência automática e tap presencial em 1 segundo), enquanto o MED 2.0 fecha a brecha da pulverização rápida entre contas laranja.',
          stepByStepFlow: [
            { step: '1', actor: 'Pix Automático (pain.009/013)', action: 'Cliente autoriza o mandato 1x; empresa agenda a cobrança em D-2, banco avisa em D-1 e liquida às 06h00 do vencimento.' },
            { step: '2', actor: 'Pix NFC (JSR Open Finance)', action: 'Carteira digital usa chave biométrica FIDO2 do aparelho para iniciar o Pix na maquininha sem abrir o app do banco.' },
            { step: '3', actor: 'MED 2.0 (Grafo Multinível)', action: 'Quando a vítima contesta pelo autoatendimento no app, o sistema rastreia os saltos seguintes no SPI e bloqueia as contas níveis 1, 2 e 3.' },
          ],
          commonDanger:
            'No Pix Automático, não tratar as notificações de revogação de mandato (pain.014) ou não configurar a política de retentativas padronizadas para falta de saldo no dia do vencimento.',
          normativeSource: 'Resoluções BCB nº 396, 406 e 429 + Agenda Evolutiva MED 2.0 (2026/2027)',
          acervoSearchQuery: 'Pix Automatico JSR Open Finance FIDO2 MED 2.0',
          brandFilter: 'ALL',
        },
        demonstrate: {
          normalLabel: '✅ MED 2.0 (Rastreio em Grafo Níveis 1, 2 e 3)',
          errorLabel: '❌ MED 1.0 Antigo (Restrito à 1ª Conta Já Zerada)',
          normalState: {
            headline: 'Grafo do MED 2.0 alcança o dinheiro pulverizado para a 2ª e 3ª contas laranja',
            statusBadge: '✓ BLOQUEIO EM CASCATA · DEVOLUÇÃO pacs.004',
            wireOrDiagramTitle: 'Como o MED 2.0 vence a pulverização por bots',
            wireLines: [
              { tag: 'Abertura (Autoatendimento App)', value: 'POST /infraction-reports no DICT em T+0', explanation: 'Fluxo digital padronizado em todos os bancos sem depender de call center.', highlight: 'good' },
              { tag: 'Salto #1 (1ª Conta Laranja)', value: 'Transferiu R$ 1.200 de R$ 1.500 para outras 2 contas em 12s', explanation: 'No MED 1.0 antigo, só sobrariam R$ 300 bloqueados aqui.', highlight: 'info' },
              { tag: 'Salto #2 e #3 (Grafo MED 2.0)', value: 'Ordem de bloqueio propagada para os ISPBs de destino!', explanation: 'Bloqueia os R$ 1.200 nas contas seguintes e devolve tudo via pacs.004.', highlight: 'good' },
            ],
            financialOutcome: 'Recuperação real de valores para a vítima e desarticulação da rede de contas de passagem.',
          },
          errorState: {
            headline: 'Limitação do modelo antigo (MED 1.0): bloqueio enxergava apenas o 1º salto',
            statusBadge: '✕ SALDO R$ 0,00 NA 1ª CONTA (ESVAZIADA)',
            wireOrDiagramTitle: 'Por que o Banco Central criou o MED 2.0 e o BC Protege+',
            wireLines: [
              { tag: '1ª Conta Recebedora', value: 'Saldo = R$ 0,00 após 15 segundos do golpe', explanation: 'Script automatizado do fraudador já havia pulado para outro banco.', highlight: 'bad' },
              { tag: 'Resultado MED 1.0', value: 'Infração Procedente, mas sem fundos para devolver', explanation: 'Apenas marcava o CPF da 1ª conta no DICT.', highlight: 'bad' },
            ],
            financialOutcome: 'Prejuízo ficava com a vítima; por isso o MED 2.0 multinível + BC Protege+ são marcos de 2026/2027.',
          },
          deepDiveLinks: [
            { label: 'Simular Pix Automático & NFC em 3D', href: '/jornada?track=pix_auto_nfc' },
            { label: 'Simular Grafo do MED 2.0 em 3D', href: '/jornada?track=med_seguranca' },
          ],
        },
      },
    ],
  },
  {
    id: 'disputas_releases_2027',
    number: '06',
    icon: '📜',
    title: 'Disputas (CE 3.0), Releases Semestrais & Reforma 2027 (Split LC 214)',
    subtitle: 'Como reverter chargebacks com Compelling Evidence 3.0, auditar boletins e preparar o Split Tributário 2027',
    badge: 'CE 3.0 · 26.2 ➔ 2027+',
    lessons: [
      {
        id: 'gov-split-tributario-2027',
        stepBadge: 'Lição 6.1',
        title: 'O Que Vem em 2027: Split Payment Tributário Automático da Reforma (LC 214/2025 — CBS & IBS)',
        shortHook: 'A maior mudança de engenharia da história dos meios de pagamento no Brasil explicada passo a passo',
        teach: {
          whatItIsPlain:
            'Pelos Artigos 31 a 35 da Lei Complementar nº 214/2025 (Reforma Tributária do Consumo), as adquirentes, subcredenciadoras e bancos do Pix passarão a separar automaticamente, no momento da liquidação financeira de cada venda, a fatia do imposto (CBS federal a partir de 2027 e IBS estadual/municipal gradualmente) enviando-a direto ao Fisco!',
          whyItMatters:
            'Isso muda toda a arquitetura de captura, clearing e antecipação de recebíveis: (1) a transação de pagamento precisará carregar o vínculo com a chave da NF-e/NFC-e; e (2) pelo Art. 34 da LC 214/2025, a parcela referente à CBS/IBS não faz parte do valor livre que o lojista pode antecipar ou ceder nas registradoras B3/CERC!',
          stepByStepFlow: [
            { step: '1', actor: 'Captura (POS / Checkout / Pix)', action: 'Vincula os dados do documento fiscal eletrônico (Chave de 44 dígitos da NFC-e/NF-e) ao payload da transação.' },
            { step: '2', actor: 'Consulta Calculadora CBS/IBS', action: 'O motor de liquidação consulta o sistema da Receita Federal / Comitê Gestor do IBS para verificar quanto de imposto resta recolher naquela operação (descontando créditos anteriores da cadeia).' },
            { step: '3', actor: 'Segregação na Liquidação (Split)', action: 'A adquirente/PSP transfere a fatia de CBS/IBS direto para o Fisco e credita o saldo líquido de MDR e de tributo na conta do lojista.' },
          ],
          commonDanger:
            'Calcular o limite de antecipação de recebíveis D+1 sobre o valor bruto menos MDR sem descontar a parcela do Split Tributário (Art. 34 da LC 214/2025): gera exposição de crédito descoberta para o banco/adquirente financiador.',
          normativeSource: 'Lei Complementar nº 214/2025 (Artigos 31 a 35 — Split Payment Inteligente e Simplificado)',
          acervoSearchQuery: 'Split Payment Reforma Tributaria LC 214 CBS IBS liquidacao',
          brandFilter: 'ALL',
        },
        demonstrate: {
          normalLabel: '✅ Liquidação 2027+ com Split Payment Tributário (LC 214)',
          errorLabel: '❌ Modelo Tradicional Antigo (Sem Segregação na Fonte)',
          normalState: {
            headline: 'Segregação automática de CBS/IBS na liquidação e proteção da base de cessão B3/CERC',
            statusBadge: '✓ CONFORMIDADE LC 214/2025 (2027+)',
            wireOrDiagramTitle: 'Exemplo Financeiro de Venda de R$ 1.000,00 com Split Tributário Inteligente',
            wireLines: [
              { tag: 'Chave NFC-e Vinculada', value: '35271112345678000199650010000123451000123458', explanation: 'Documento fiscal amarrado ao identificador da transação.', highlight: 'good' },
              { tag: 'Fatia MDR (Intercâmbio + Bandeira + Adq)', value: 'R$ 24,50 (2,45%)', explanation: 'Remuneração da cadeia de meios de pagamento.', highlight: 'info' },
              { tag: 'Fatia Split Tributário (CBS/IBS Líquido)', value: 'R$ 125,00 (Segregado direto p/ Receita / Comitê IBS)', explanation: 'Quita o débito fiscal daquela nota automaticamente na liquidação.', highlight: 'good' },
              { tag: 'Base Livre p/ Cessão B3 & Líquido EC', value: 'R$ 850,50 (Creditado ao Lojista / Antecipável)', explanation: 'Art. 34 LC 214: apenas o líquido pós-tributo integra a UR disponível p/ cessão.', highlight: 'good' },
            ],
            financialOutcome: 'Elimina sonegação na cadeia e exige motores de liquidação e registradoras preparados para o Split Fiscal.',
          },
          errorState: {
            headline: 'Antecipar recebível sobre R$ 975,50 sem reservar os R$ 125,00 do Split Tributário',
            statusBadge: '✕ DESCASAMENTO DE GARANTIA (ART. 34 LC 214)',
            wireOrDiagramTitle: 'Risco de Crédito na Antecipação sem Motor de Split 2027',
            wireLines: [
              { tag: 'Valor Antecipado Erroneamente', value: 'Baseado em R$ 975,50 (Bruto - MDR)', explanation: 'Ignorou que na data da liquidação o Fisco tem preferência legal sobre a CBS/IBS.', highlight: 'bad' },
              { tag: 'Retenção Legal na Liquidação', value: 'R$ 125,00 vão p/ o Fisco antes do banco cessionário', explanation: 'O banco financiador recebe menos do que antecipou!', highlight: 'bad' },
            ],
            financialOutcome: 'Adequação obrigatória dos motores de agenda, risco e cessão de recebíveis para a transição 2026/2027.',
          },
          deepDiveLinks: [
            { label: 'Simular Split Tributário 2027 no Lab 3D', href: '/jornada?track=regras_2027_tempo&split2027=1' },
            { label: 'Hub de Releases & Boletins (Governança de Fontes)', href: '/compliance/boletins' },
          ],
        },
      },
      {
        id: 'gov-ce3-vamp',
        stepBadge: 'Lição 6.2',
        title: 'Compelling Evidence 3.0 (CE 3.0) & Programas de Monitoria (Visa VAMP / Mastercard ECP)',
        shortHook: 'Como reverter chargebacks de "auto-fraude" provando o vínculo histórico de IP e Device ID',
        teach: {
          whatItIsPlain:
            'Mais de 60% dos chargebacks de fraude no mundo digital são "Friendly Fraud" (o próprio dono do cartão comprou, recebeu o produto/jogo/streaming e depois clicou em "Não reconheço a compra" no app do banco). Com a regra Compelling Evidence 3.0 (CE 3.0), a Visa e a Mastercard criaram uma fórmula matemática que obriga o emissor a devolver o dinheiro ao lojista!',
          whyItMatters:
            'Se o lojista apresentar o ARN de pelo menos 2 compras anteriores daquele mesmo cartão (feitas entre 120 e 365 dias antes da disputa e que nunca sofreram chargeback) onde pelo menos 2 dados batem com a compra contestada — sendo 1 obrigatoriamente o IP Address ou o Device ID — a reversão é automática e o chargeback sai da conta do lojista.',
          stepByStepFlow: [
            { step: '1', actor: 'Emissor (TC 15 / 1442)', action: 'Abre o First Chargeback de fraude CNP (Visa 10.4 / Mastercard 4837).' },
            { step: '2', actor: 'Lojista + Adquirente', action: 'Buscam no banco de dados 2 compras históricas (>120 dias e <365 dias) do mesmo PAN sem disputa.' },
            { step: '3', actor: 'Motor CE 3.0 (VROL / MCOM)', action: 'Compara os atributos (Device ID + IP Address + User Account / Endereço). Se der match, inverte a responsabilidade a favor do lojista!' },
          ],
          commonDanger:
            'Não gravar o IP Address, o Device Fingerprint e o ARN das vendas aprovadas por pelo menos 365 dias no banco de dados do checkout: quando o chargeback chega 4 meses depois, o lojista não tem os dados para montar a defesa CE 3.0!',
          normativeSource: 'Visa Compelling Evidence 3.0 + Visa VAMP (antigos VFMP/VDMP) + Mastercard ECP',
          acervoSearchQuery: 'Compelling Evidence 3.0 CE 3.0 VAMP 10.4 Device ID 120 365',
          brandFilter: 'ALL',
        },
        demonstrate: {
          normalLabel: '✅ Defesa CE 3.0 com 2 Compras Históricas (>120d)',
          errorLabel: '❌ Sem Histórico de Device ID / IP (Perda do Chargeback)',
          normalState: {
            headline: 'Vínculo matemático comprovado: VROL/MCOM reverte o chargeback a favor do lojista',
            statusBadge: '✓ CHARGEBACK REVERTIDO (LIABILITY SHIFT CE 3.0)',
            wireOrDiagramTitle: 'Dossiê Compelling Evidence 3.0 Aceito pela Bandeira',
            wireLines: [
              { tag: 'Compra Contestada (D+0)', value: 'ARN 74532116323000012345672 · IP 189.40.12.8 · Device=iPhone15_A91', explanation: 'Cliente alegou não reconhecer a compra de R$ 450,00.', highlight: 'info' },
              { tag: 'Compra Histórica #1 (Há 145 dias)', value: 'ARN 74532115180000099182731 · Mesmo IP + Mesmo Device ID', explanation: 'Mais de 120 dias atrás e nunca contestada pelo titular.', highlight: 'good' },
              { tag: 'Compra Histórica #2 (Há 190 dias)', value: 'ARN 74532115210000044519283 · Mesmo IP + Mesmo Device ID', explanation: 'Segunda prova histórica válida: cumpre 100% do requisito CE 3.0!', highlight: 'good' },
            ],
            financialOutcome: 'Lojista recupera 100% do valor da venda e protege seu índice no programa Visa VAMP.',
          },
          errorState: {
            headline: 'Lojista envia apenas print de nota fiscal ou compras com menos de 120 dias',
            statusBadge: '✕ DEFESA RECUSADA · PERDA FINANCEIRA + VAMP',
            wireOrDiagramTitle: 'Por que defesas antigas em PDF falham sem CE 3.0',
            wireLines: [
              { tag: 'Evidência Enviada', value: 'Apenas NF-e + 1 compra feita há 45 dias', explanation: 'Compras com menos de 120 dias ainda estão dentro da janela de fraude e não valem p/ CE 3.0.', highlight: 'bad' },
              { tag: 'Veredito VROL / MCOM', value: 'Prejuízo mantido no Lojista + Contagem no VAMP/ECP', explanation: 'Se o índice VAMP ultrapassar o limiar da Visa, gera multa por transação.', highlight: 'bad' },
            ],
            financialOutcome: 'Perda do produto + valor da venda + tarifa de disputa.',
          },
          deepDiveLinks: [
            { label: 'Árvore de Decisão de Disputas & CE 3.0', href: '/compliance/outgoing?tab=disputes' },
            { label: 'Programas de Monitoria (VAMP / ECP / BRAM)', href: '/compliance/outgoing?tab=programs' },
          ],
        },
      },
    ],
  },
];

const PUBLIC_FALLBACK_LINKS: Record<ProductBoxId, { label: string; href: string }[]> = {
  cartao_presencial: [
    { label: 'Ver Cartão Presencial em 3D no Laboratório', href: '/jornada?track=cartao' },
    { label: 'Ler Capítulo 01 no Guia', href: '/guia#cartao' },
  ],
  cartao_online_tokens: [
    { label: 'Simular Fluxo Online e 3DS no Laboratório 3D', href: '/jornada?track=cartao' },
    { label: 'Ler Capítulo 04 (Disputas e 3DS) no Guia', href: '/guia#disputas' },
  ],
  clearing_liquidacao: [
    { label: 'Ver Clearing, B3 e SLC em 3D no Laboratório', href: '/jornada?track=clearing_slc' },
    { label: 'Ler Capítulo 02 (Clearing e SLC) no Guia', href: '/guia#clearing' },
  ],
  produtos_intercambio_faturas: [
    { label: 'Simular Divisão do Dinheiro e MDR no Laboratório', href: '/jornada?track=cartao' },
    { label: 'Ler Capítulo 03 (Intercâmbio e BCB 304) no Guia', href: '/guia#intercambio' },
  ],
  pix_boleto_openfinance: [
    { label: 'Ver Pix SPI, JSR, MED 2.0 e Boleto no Laboratório 3D', href: '/jornada?track=pix_spi' },
    { label: 'Ler Capítulos 05 a 07 no Guia', href: '/guia#pix' },
  ],
  disputas_releases_2027: [
    { label: 'Ver Split Tributário 2027+ e CE 3.0 no Laboratório 3D', href: '/jornada?track=regras_2027_tempo' },
    { label: 'Ler Capítulo 09 (Reforma 2027) no Guia', href: '/guia#reforma-2027' },
  ],
};

export function TeachAndDemonstrateHub() {
  const [selectedBoxId, setSelectedBoxId] = useState<ProductBoxId>('cartao_presencial');
  const [selectedLessonIdx, setSelectedLessonIdx] = useState<number>(0);
  const [demoStateMode, setDemoStateMode] = useState<'normal' | 'error'>('normal');
  const [isOwner, setIsOwner] = useState<boolean>(false);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      setIsOwner(
        document.cookie.split(';').some((c) => c.trim().startsWith('vs_internal_pass=1'))
      );
    }
  }, []);

  const activeCategory =
    PRODUCT_TEACH_DEMO_CATEGORIES.find((c) => c.id === selectedBoxId) ||
    PRODUCT_TEACH_DEMO_CATEGORIES[0];

  const safeLessonIdx = Math.min(selectedLessonIdx, activeCategory.lessons.length - 1);
  const activeLesson = activeCategory.lessons[safeLessonIdx] || activeCategory.lessons[0];
  const activeDemo =
    demoStateMode === 'normal'
      ? activeLesson.demonstrate.normalState
      : activeLesson.demonstrate.errorState;

  return (
    <div className="space-y-6">
      {/* =====================================================================
          1. MENU EM CAIXINHAS POR PRODUTO / TEMA (6 CAIXINHAS LIMPAS)
         ===================================================================== */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/95 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <div className="font-mono text-[11px] font-black uppercase tracking-widest text-[#1F3FE0] dark:text-blue-400">
              JORNADA DE APRENDIZADO POR PRODUTO · MÉTODO ENSINAR + DEMONSTRAR
            </div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
              Escolha a caixinha do produto que você quer aprender e ver funcionando lado a lado
            </h2>
          </div>
          <span className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-800 font-mono text-xs font-bold text-[#1F3FE0] dark:text-blue-300 self-start sm:self-auto">
            6 Domínios · Esquerda Ensina ⇄ Direita Demonstra
          </span>
        </div>

        {/* Grade de 6 Caixinhas de Produto */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {PRODUCT_TEACH_DEMO_CATEGORIES.map((cat) => {
            const isSelected = cat.id === selectedBoxId;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedBoxId(cat.id);
                  setSelectedLessonIdx(0);
                  setDemoStateMode('normal');
                }}
                className={`rounded-2xl p-4 text-left border transition-all flex flex-col justify-between gap-2.5 ${
                  isSelected
                    ? 'bg-[#1F3FE0] text-white border-[#1F3FE0] shadow-md shadow-blue-600/20'
                    : 'bg-slate-50/80 dark:bg-slate-950/80 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:border-[#1F3FE0]'
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-black">
                      {cat.icon} {cat.number}.
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-bold ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {cat.badge}
                    </span>
                  </div>
                  <div className="text-sm font-black leading-snug">{cat.title}</div>
                  <p
                    className={`text-[11px] leading-relaxed ${
                      isSelected ? 'text-blue-100' : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {cat.subtitle}
                  </p>
                </div>

                <div
                  className={`font-mono text-[11px] font-bold pt-1 border-t ${
                    isSelected
                      ? 'border-white/20 text-white'
                      : 'border-slate-200/70 dark:border-slate-800 text-[#1F3FE0] dark:text-blue-400'
                  }`}
                >
                  {cat.lessons.length} etapas práticas (Ensinar + Demonstrar) →
                </div>
              </button>
            );
          })}
        </div>

        {/* Barra de Lições / Sub-Tópicos do Produto Ativo */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[11px] font-bold uppercase text-slate-500">
              Etapas deste produto:
            </span>
            {activeCategory.lessons.map((les, idx) => {
              const active = idx === safeLessonIdx;
              return (
                <button
                  key={les.id}
                  onClick={() => {
                    setSelectedLessonIdx(idx);
                    setDemoStateMode('normal');
                  }}
                  className={`px-3.5 py-2 rounded-full text-xs font-bold border transition-all flex items-center gap-2 ${
                    active
                      ? 'bg-slate-900 dark:bg-blue-600 text-white border-slate-900 dark:border-blue-500 shadow-xs'
                      : 'bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-[#1F3FE0]'
                  }`}
                >
                  <span className="font-mono text-[10px] opacity-80">{les.stepBadge}</span>
                  <span>{les.title}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* =====================================================================
          2. PALCO LADO A LADO: ESQUERDA = ENSINAR (CONCEITO) ⇄ DIREITA = DEMONSTRAR (PRÁTICA)
         ===================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* CAIXINHA ESQUERDA (6 COLUNAS): 📘 ETAPA 1 — ENSINAR */}
        <div className="lg:col-span-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/95 p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            {/* Cabeçalho da Caixinha Ensinar */}
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-950 text-[#1F3FE0] dark:text-blue-300 font-mono text-xs font-black">
                  📘 1. ENSINAR
                </span>
                <span className="font-mono text-xs font-bold text-slate-500">
                  {activeLesson.stepBadge} · Explicação Didática
                </span>
              </div>
              <button
                type="button"
                onClick={() =>
                  window.dispatchEvent(
                    new CustomEvent('open-acervo-ai-drawer', {
                      detail: {
                        query: activeLesson.teach.acervoSearchQuery,
                        bandeira: activeLesson.teach.brandFilter,
                      },
                    })
                  )
                }
                className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/80 hover:bg-blue-100 border border-blue-200 dark:border-blue-700 text-[11px] font-bold text-[#1F3FE0] dark:text-blue-300 transition-all cursor-pointer"
              >
                {isOwner ? '🧠 Ver nos PDFs do Acervo' : '✨ Perguntar à IA sobre esta regra'}
              </button>
            </div>

            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-snug">
                {activeLesson.title}
              </h3>
              <p className="text-xs font-semibold text-[#1F3FE0] dark:text-blue-400 mt-0.5">
                {activeLesson.shortHook}
              </p>
            </div>

            {/* Bloco A: O que é em linguagem simples */}
            <div className="rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200/80 dark:border-slate-800 p-4 space-y-2">
              <div className="font-mono text-[10px] font-black uppercase tracking-wider text-slate-500">
                O QUE É (SEM JARGÃO SOLTO)
              </div>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                {activeLesson.teach.whatItIsPlain}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pt-1 border-t border-slate-200/60 dark:border-slate-800/80">
                <strong>Por que isso importa:</strong> {activeLesson.teach.whyItMatters}
              </p>
            </div>

            {/* Bloco B: Passo a Passo em Caixinhas Numeradas */}
            <div className="space-y-2">
              <div className="font-mono text-[10px] font-black uppercase tracking-wider text-slate-500">
                COMO FUNCIONA PASSO A PASSO (1 ➔ {activeLesson.teach.stepByStepFlow.length})
              </div>
              <div className="space-y-2">
                {activeLesson.teach.stepByStepFlow.map((st) => (
                  <div
                    key={st.step}
                    className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 flex items-start gap-3"
                  >
                    <span className="w-6 h-6 rounded-full bg-[#1F3FE0] text-white font-mono text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
                      {st.step}
                    </span>
                    <div className="text-xs">
                      <div className="font-black text-slate-900 dark:text-white">{st.actor}</div>
                      <div className="text-slate-600 dark:text-slate-300 leading-relaxed mt-0.5">
                        {st.action}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bloco C: Onde mora o perigo */}
            <div className="rounded-2xl border border-amber-300/80 dark:border-amber-500/30 bg-amber-50/70 dark:bg-amber-950/25 p-3.5 space-y-1">
              <div className="font-mono text-[10px] font-black uppercase tracking-wider text-amber-800 dark:text-amber-300">
                ⚠️ ONDE MORA O PERIGO (ERRO MAIS COMUM EM PRODUÇÃO)
              </div>
              <p className="text-xs text-amber-950 dark:text-amber-200 leading-relaxed">
                {activeLesson.teach.commonDanger}
              </p>
            </div>
          </div>

          {/* Rodapé: Fonte Oficial */}
          <div className="rounded-xl bg-slate-100/80 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3.5 py-2.5 font-mono text-[11px] text-slate-600 dark:text-slate-400">
            <strong>Norma / Manual Oficial:</strong> {activeLesson.teach.normativeSource}
          </div>
        </div>

        {/* CAIXINHA DIREITA (6 COLUNAS): 🔬 ETAPA 2 — DEMONSTRAR AO VIVO */}
        <div className="lg:col-span-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/95 p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            {/* Cabeçalho da Caixinha Demonstrar + Toggle Certo vs Errado */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-mono text-xs font-black">
                  🔬 2. DEMONSTRAR
                </span>
                <span className="font-mono text-xs font-bold text-slate-500">
                  Inspeção Prática Lado a Lado
                </span>
              </div>

              {isOwner && (
                <button
                  type="button"
                  onClick={() => {
                    sendToDocStudio({
                      mode: 'append_html',
                      title: `${activeLesson.stepBadge} — ${activeLesson.title}`,
                      sourceModule: 'Guia Ensinar + Demonstrar',
                      metadata: {
                        brand: 'geral',
                        brandName: activeCategory.badge,
                        referenceId: activeLesson.id,
                        category: activeCategory.title,
                        effectiveDate: '2026 / 2027',
                        riskLevel: 'Médio',
                        executiveSummary: activeLesson.teach.whatItIsPlain,
                        recommendedAction: activeLesson.teach.commonDanger,
                      },
                      html: `
                        <h3>${activeLesson.stepBadge}: ${activeLesson.title}</h3>
                        <p><strong>O que é:</strong> ${activeLesson.teach.whatItIsPlain}</p>
                        <p><strong>Por que importa:</strong> ${activeLesson.teach.whyItMatters}</p>
                        <p><strong>Erro comum a evitar:</strong> ${activeLesson.teach.commonDanger}</p>
                        <p><strong>Fonte Oficial:</strong> ${activeLesson.teach.normativeSource}</p>
                      `,
                    });
                  }}
                  className="px-3 py-1 rounded-full bg-slate-900 dark:bg-slate-800 text-white text-[11px] font-bold hover:opacity-90 cursor-pointer"
                >
                  📝 Enviar p/ Doc Studio
                </button>
              )}
            </div>

            {/* Botões de Alternância 1-Clique: Caso Certo (✅) vs Caso com Erro (❌) */}
            <div className="space-y-1.5">
              <div className="font-mono text-[10px] font-black uppercase tracking-wider text-slate-500">
                CLIQUE PARA COMPARAR O COMPORTAMENTO NO SISTEMA:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  onClick={() => setDemoStateMode('normal')}
                  className={`p-3 rounded-2xl border text-left text-xs font-black transition-all ${
                    demoStateMode === 'normal'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-emerald-500'
                  }`}
                >
                  {activeLesson.demonstrate.normalLabel}
                </button>
                <button
                  onClick={() => setDemoStateMode('error')}
                  className={`p-3 rounded-2xl border text-left text-xs font-black transition-all ${
                    demoStateMode === 'error'
                      ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-rose-500'
                  }`}
                >
                  {activeLesson.demonstrate.errorLabel}
                </button>
              </div>
            </div>

            {/* Banner de Status da Demonstração */}
            <div
              className={`rounded-2xl border p-3.5 flex flex-wrap items-center justify-between gap-2 ${
                demoStateMode === 'normal'
                  ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-500/30'
                  : 'bg-rose-50/80 dark:bg-rose-950/30 border-rose-200 dark:border-rose-500/30'
              }`}
            >
              <div className="text-xs font-bold text-slate-900 dark:text-white">
                {activeDemo.headline}
              </div>
              <span
                className={`px-2.5 py-0.5 rounded-full font-mono text-[10px] font-black uppercase ${
                  demoStateMode === 'normal'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-rose-600 text-white'
                }`}
              >
                {activeDemo.statusBadge}
              </span>
            </div>

            {/* Caixinhas dos Campos / Mensagens Demonstradas */}
            <div className="space-y-2">
              <div className="font-mono text-[10px] font-black uppercase tracking-wider text-slate-500">
                {activeDemo.wireOrDiagramTitle}
              </div>
              <div className="space-y-2">
                {activeDemo.wireLines.map((wl, i) => (
                  <div
                    key={i}
                    className={`rounded-2xl border p-3 text-xs space-y-1 ${
                      wl.highlight === 'bad'
                        ? 'border-rose-300 dark:border-rose-500/40 bg-rose-50/60 dark:bg-rose-950/25'
                        : wl.highlight === 'good'
                        ? 'border-emerald-300 dark:border-emerald-500/30 bg-emerald-50/40 dark:bg-emerald-950/20'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/70'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-mono font-black text-slate-900 dark:text-white">
                        {wl.tag}
                      </span>
                      <code
                        className={`px-2 py-0.5 rounded font-mono text-[11px] font-bold ${
                          wl.highlight === 'bad'
                            ? 'bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-200'
                            : 'bg-blue-100 dark:bg-blue-900/50 text-[#1F3FE0] dark:text-blue-200'
                        }`}
                      >
                        {wl.value}
                      </code>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                      {wl.explanation}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Impacto Financeiro / Operacional */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-900 text-white p-3.5 space-y-1">
              <div className="font-mono text-[10px] font-black uppercase tracking-wider text-cyan-400">
                💰 RESULTADO FINANCEIRO &amp; OPERACIONAL DESTE CENÁRIO
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">
                {activeDemo.financialOutcome}
              </p>
            </div>
          </div>

          {/* Botões de Aprofundamento Prático */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
            <span className="font-mono text-[10px] font-bold uppercase text-slate-400">
              Testar na ferramenta completa:
            </span>
            <div className="flex flex-wrap gap-2">
              {(isOwner
                ? activeLesson.demonstrate.deepDiveLinks
                : PUBLIC_FALLBACK_LINKS[activeCategory.id]
              ).map((lnk) => (
                <Link
                  key={lnk.href}
                  href={lnk.href}
                  className="px-3.5 py-1.5 rounded-full bg-[#1F3FE0] hover:bg-blue-700 text-white text-xs font-bold transition-all"
                >
                  {lnk.label} →
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
