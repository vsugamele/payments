"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Lock, Unlock, ShieldCheck, ArrowRight, Calculator,
  Terminal, Scale, FileText, Database, BookOpen,
  Layers, Globe, AlertTriangle, RefreshCw,
  LogOut, Cpu, BarChart2, DollarSign, Search,
  Eye, Sparkles, CheckCircle2, Filter, Sliders
} from "lucide-react";

interface ToolCard {
  id: string;
  title: string;
  desc: string;
  whatItIs: string;
  features: string[];
  dataSources: string[];
  roles: ("Adquirente" | "Emissor" | "Subcredenciador" | "Backoffice" | "Regulatório")[];
  keywords: string[];
  url: string;
  badge: string;
  icon: any;
  color: string;
}

const MODULES: { category: string; subtitle: string; icon: any; tools: ToolCard[] }[] = [
  {
    category: "1. Simuladores & Motores Financeiros",
    subtitle: "Cálculo determinístico de intercâmbio, cascata de downgrade, Scheme Fees MCBS/VSS e margem líquida de MDR.",
    icon: Calculator,
    tools: [
      {
        id: "provisionamento",
        title: "Motor Determinístico de Provisionamento & Trace de Cascata",
        desc: "Compilador booleano real, auditoria cláusula a cláusula da cascata, ajustes sobre IA e lookup de BIN.",
        whatItIs:
          "Motor que avalia uma transação contra todas as 141 regras normativas de intercâmbio (Visa, Mastercard e Elo) e mostra exatamente qual cláusula aprovou ou reprovou a qualificação tarifária (evitando cair em tarifa Standard/Penalidade sem saber o motivo).",
        features: [
          "Trace passo a passo mostrando por que uma transação qualificou ou sofreu downgrade",
          "Simulação de impacto financeiro no provisionamento contábil de intercâmbio",
          "Validação de BIN Range real e exigências de campos ISO (ECI, POS Entry Mode, Timeliness)"
        ],
        dataSources: ["engine/calculator.py", "141 Regras Normativas", "Tabelas de BIN IP0040T1 / Visa ARDEF"],
        roles: ["Adquirente", "Emissor", "Subcredenciador", "Backoffice"],
        keywords: ["provisionamento", "cascata", "downgrade", "calculator", "bin", "ird", "fpi"],
        url: "/compliance/provisionamento",
        badge: "141 Regras + Trace",
        icon: Cpu,
        color: "text-blue-400 bg-blue-500/10 border-blue-500/20"
      },
      {
        id: "simulador",
        title: "Simulador de Intercâmbio & Downgrade",
        desc: "Cálculo em tempo real de cascatas Visa, MC, Elo e projeção de sangramento financeiro em R$/mês.",
        whatItIs:
          "Simulador executivo e comercial para estimar o custo mensal de intercâmbio de uma carteira de transações e calcular quanto dinheiro é perdido por mês quando campos obrigatórios (como 3DS, Token ou liquidação em D+1) falham e geram downgrade.",
        features: [
          "Comparativo instantâneo entre Tarifa Qualificada (Ótima) vs Tarifa de Downgrade (Standard/EIRF)",
          "Projeção de perda financeira mensal e anual por volume transacionado (TPV)",
          "Simulação por modalidade (Crédito à Vista, Parcelado, Débito, Pré-Pago, Corporativo)"
        ],
        dataSources: ["Tabelas públicas Bacen/Bandeiras", "Regras de Qualificação Visa/MC/Elo"],
        roles: ["Adquirente", "Subcredenciador", "Backoffice"],
        keywords: ["simulador", "intercambio", "downgrade", "eirf", "standard", "tpv", "sangramento"],
        url: "/simulador",
        badge: "Cascata & Downgrade",
        icon: Calculator,
        color: "text-blue-400 bg-blue-500/10 border-blue-500/20"
      },
      {
        id: "matrix",
        title: "Matriz de Decisão de Intercâmbio (5 Passos)",
        desc: "Passo a passo por produto, canal de captura, autenticação e MCC para descobrir a alíquota exata.",
        whatItIs:
          "Árvore de decisão visual em 5 etapas (Bandeira → Produto do Cartão → Canal CP/CNP → Nível de Segurança/3DS → MCC do lojista) que determina qual IRD (Mastercard), FPI (Visa) ou Produto Elo será aplicado na liquidação.",
        features: [
          "Navegação guiada pelas 5 variáveis determinantes do intercâmbio",
          "Exibição dos campos técnicos exigidos na autorização (0100) e no clearing (1240/TC05)",
          "Mapeamento de tetos regulatórios do Bacen (0,50% Débito / 0,70% Pré-pago)"
        ],
        dataSources: ["Matriz de Qualificação Visa/MC/Elo", "Resolução BCB nº 304"],
        roles: ["Adquirente", "Emissor", "Subcredenciador"],
        keywords: ["matriz", "decisao", "ird", "fpi", "mcc", "cp", "cnp"],
        url: "/matrix",
        badge: "Decisão 5 Passos",
        icon: BarChart2,
        color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20"
      },
      {
        id: "mcbs",
        title: "Catálogo Executivo de Tarifas Mastercard MCBS",
        desc: "Catálogo estruturado de Scheme Fees, Service IDs e alíquotas aplicadas pela Mastercard no Brasil.",
        whatItIs:
          "Painel dedicado ao entendimento executivo do Mastercard Consolidated Billing System (MCBS), explicando como a fatura mensal/semanal da bandeira é organizada por Service ID (AB, NW, CA, TX, etc.), quem paga cada evento e como evitar multas operacionais.",
        features: [
          "Explicação detalhada dos grupos de serviço MCBS (Autorização, Clearing, Disputas, Conectividade)",
          "Separação clara entre eventos de Adquirente (Acquirer) e Emissor (Issuer)",
          "Guia de batimento entre relatórios de fatura e arquivo IPM MTI 1740"
        ],
        dataSources: ["Manual MCBS - Billing - BRAZIL.pdf", "GCMS Reference Manual (IPM 1740)"],
        roles: ["Adquirente", "Emissor", "Backoffice"],
        keywords: ["mcbs", "scheme fees", "mastercard", "1740", "fatura", "billing", "2ab", "2nw"],
        url: "/mcbs",
        badge: "Scheme Fees MCBS",
        icon: DollarSign,
        color: "text-purple-400 bg-purple-500/10 border-purple-500/20"
      },
      {
        id: "tarifas-reais",
        title: "Motor Real de Tabelas de Intercâmbio & Fee Schedule",
        desc: "1.128 alíquotas reais (Visa, MC, Elo), redução de fee por MCC Elo e 89 tabelas de artigos SQLite.",
        whatItIs:
          "Base consolidada com todas as 1.128 alíquotas oficiais de intercâmbio extraídas dos manuais vigentes de Visa, Mastercard e Elo no Brasil, incluindo regras especiais por MCC (Supermercados, Postos, Educação, Saúde, Governo) e parcelamento.",
        features: [
          "Busca instantânea nas 1.128 alíquotas reais por bandeira, produto, modalidade e MCC",
          "Simulador de incentivo/redução de intercâmbio Elo por segmento comercial",
          "Consulta às 89 tabelas normativas indexadas no banco de dados"
        ],
        dataSources: ["tarifas-reais-bundle.json", "Tabelas Oficiais de Intercâmbio Visa, MC e Elo 2026"],
        roles: ["Adquirente", "Emissor", "Subcredenciador", "Backoffice"],
        keywords: ["tarifas", "intercambio", "aliquotas", "mcc", "elo", "visa", "mastercard", "1128"],
        url: "/compliance/tarifas-reais",
        badge: "1.128 Alíquotas + MCC",
        icon: DollarSign,
        color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
      },
      {
        id: "mdr",
        title: "Anatomia do MDR & Split de Pagamento",
        desc: "Decomposição de custos entre Banco Emissor, Bandeira, Adquirente e Subcredenciador.",
        whatItIs:
          "Calculadora de Unit Economics de uma transação: decompõe a taxa MDR cobrada do lojista em Intercâmbio (receita do Emissor), Scheme Fees (receita da Bandeira), impostos (PIS/COFINS/ISS) e Net MDR (margem líquida do Adquirente/PayFac).",
        features: [
          "Visualização da fatia exata de cada participante do arranjo em R$ e %",
          "Simulação de compressão de margem quando ocorre downgrade de intercâmbio",
          "Análise de viabilidade de pricing para subcredenciadores e ofertas de MDR fixo"
        ],
        dataSources: ["Regras de Split de Liquidação CIP/SLC", "Estrutura Tributária e de Custos de Adquirência"],
        roles: ["Adquirente", "Subcredenciador", "Backoffice"],
        keywords: ["mdr", "split", "spread", "margem", "net mdr", "pricing"],
        url: "/mdr",
        badge: "Unit Economics & Spread",
        icon: Scale,
        color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
      }
    ]
  },
  {
    category: "2. Engenharia de Arquivos, Mensageria & Clearing (GCMS, MPE, MCBS, Base II, VSS, Elo)",
    subtitle: "Decodificadores posicionais byte-a-byte, laboratório binário T068/RDW, 17.106 campos SQLite e 13.181 eventos de faturamento.",
    icon: Terminal,
    tools: [
      {
        id: "arquivos-central",
        title: "Sistema Completo: GCMS, MPE, MCBS, Base II, VSS & Elo",
        desc: "Decodificador posicional byte-a-byte, explorador de 17.106 campos SQLite e motor de 2.267 eventos MCBS + 10.914 linhas Visa.",
        whatItIs:
          "A central definitiva de engenharia de arquivos das 3 bandeiras. Reúne em 4 abas: (1) Parser Studio Interativo byte-a-byte de linhas de 168/194/200/450 bytes, (2) Explorador dos 17.106 campos de `campos.sqlite3`, (3) Motor de Faturamento com 2.267 eventos MCBS Brasil + 10.914 linhas Visa VSS com explicação em português ao passar o mouse, e (4) Catálogo dos 11 manuais técnicos.",
        features: [
          "Aba 1 (Parser Studio): Cole ou edite linhas brutas de Visa TC05/TC46, MC IP0040T1 (194B), Elo B0/BZ e inspecione cada byte",
          "Aba 2 (17.106 Campos): Busca por DE, PDS, Posição de Byte, TC/TCR ou Tabela MPE com Raio-X ao passar o mouse",
          "Aba 3 (MCBS & Visa VSS): 2.267 eventos MCBS Brasil + 10.914 linhas Visa com explicação executiva em PT-BR e alíquotas limpas",
          "Aba 4 (Arquitetura): Mapa completo dos 11 manuais técnicos indexados e matriz operacional de ponta a ponta"
        ],
        dataSources: [
          "campos.sqlite3 (17.106 registros)",
          "Manual MCBS - Billing - BRAZIL.pdf (2.267 eventos)",
          "Visa VSS Billing Lines (10.914 linhas)",
          "11 Manuais Técnicos 2026 (Base II, IPM, MPE, VSS, Elo)"
        ],
        roles: ["Adquirente", "Emissor", "Subcredenciador", "Backoffice"],
        keywords: ["gcms", "mpe", "mcbs", "base ii", "vss", "elo", "tc05", "tc46", "ip0040t1", "1740", "campos", "parser"],
        url: "/compliance/arquivos",
        badge: "17.106 Campos + 13.181 Fees",
        icon: Database,
        color: "text-blue-400 bg-blue-500/10 border-blue-500/20"
      },
      {
        id: "mpe-forense",
        title: "Laboratório Forense MPE Binário (T068 / RDW 1014B) & BINs",
        desc: "Desblocador físico de 1.014 bytes (0x4040), cabeçalhos RDW Big-Endian, 268 tabelas IP0000T1 e dissecador 194B IP0040T1.",
        whatItIs:
          "Ambiente de engenharia reversa para o arquivo binário Mastercard Parameter Extract (MPE / T068). Explica e simula o desblocamento físico de registros de 1.014 bytes preenchidos com 0x4040 (EBCDIC space), leitura de Record Descriptor Words (RDW) e dissecação da tabela de BINs IP0040T1.",
        features: [
          "Simulador de desblocamento físico 1.014B + RDW Big-Endian usado nos mainframes/switches Mastercard",
          "Catálogo completo das 268 tabelas de parâmetros MPE governadas pelo índice IP0000T1",
          "Dissecador byte-a-byte dos 194 caracteres da tabela de BIN Range e Roteamento IP0040T1"
        ],
        dataSources: ["Mastercard Parameter Extract (MPE) Manual", "Tabelas T068 / IP0000T1 / IP0040T1 / IP0075T1"],
        roles: ["Adquirente", "Emissor", "Subcredenciador"],
        keywords: ["mpe", "t068", "rdw", "1014", "ip0040t1", "ip0000t1", "bin", "ebcdic", "mastercard"],
        url: "/compliance/mpe-forense",
        badge: "268 Tabelas + 1014B",
        icon: Terminal,
        color: "text-purple-400 bg-purple-500/10 border-purple-500/20"
      },
      {
        id: "gcms",
        title: "Arquitetura GCMS & Mensageria IPM (1240 / 1442 / 1644 / 1740)",
        desc: "Arquitetura do Global Clearing Management System, ciclo de mensagens IPM ISO 8583 e tabelas de qualificação.",
        whatItIs:
          "Guia arquitetural profundo do ecossistema de compensação da Mastercard (GCMS / IPM). Detalha como a mensagem de autorização Dual Message (0100/0110) se transforma no registro de clearing (MTI 1240), chargeback (1442), reconciliação (1644) e coleta de tarifas (1740).",
        features: [
          "Anatomia dos MTIs do IPM (1240 First Presentment, 1442 First Chargeback, 1644 Fee Collection/Recon, 1740 MCBS)",
          "Relação entre Data Elements (DE 22, DE 48, DE 63) e a determinação do IRD pelo GCMS",
          "Mapa de códigos de rejeição e validação sintática pré-edit"
        ],
        dataSources: ["GCMS Reference Manual (1.693 págs)", "IPM Clearing Formats"],
        roles: ["Adquirente", "Emissor", "Backoffice"],
        keywords: ["gcms", "ipm", "1240", "1442", "1644", "1740", "clearing", "mastercard"],
        url: "/compliance/gcms",
        badge: "Mastercard GCMS",
        icon: Cpu,
        color: "text-purple-400 bg-purple-500/10 border-purple-500/20"
      },
      {
        id: "linter",
        title: "Inspetor & Linter Visual ISO 8583 / Base II",
        desc: "Dissecação campo a campo de autorização e clearing com checagem automática de regras de compliance.",
        whatItIs:
          "Validador interativo (Linter) de payloads de transação. Verifica se a combinação de campos enviados na autorização e no clearing (MCC, POS Entry Mode, ECI 3DS, Token Indicator, Submerchant ID) viola alguma regra de bandeira ou causa downgrade automático.",
        features: [
          "Auditoria automática de consistência entre modo de entrada do chip/contactless/e-commerce e indicadores de segurança",
          "Alertas de risco de downgrade (EIRF / Standard) e multas de retentativa ou falta de dados de PayFac",
          "Presets de transações reais (Compra Chip, Contactless Apple Pay, E-commerce 3DS 2.2, Recorrência MIT/CIT)"
        ],
        dataSources: ["Regras de Qualificação Base II & IPM", "Visa Core Rules / Mastercard Rules"],
        roles: ["Adquirente", "Emissor", "Subcredenciador"],
        keywords: ["linter", "iso 8583", "validador", "payload", "de 22", "de 48", "tcr"],
        url: "/compliance/linter",
        badge: "Validador Raw",
        icon: Terminal,
        color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
      },
      {
        id: "comparativo",
        title: "Comparativo Arquitetural: Visa Base II vs Mastercard IPM vs Elo",
        desc: "De-para técnico lado a lado de estruturas de clearing, códigos de transação e relatórios de liquidação.",
        whatItIs:
          "Tabela de equivalência (De-Para) para arquitetos e engenheiros de pagamentos comparando como Visa (Base II TC/TCR), Mastercard (IPM MTI/DE/PDS) e Elo ( Cadoc/Base II Elo) representam os mesmos eventos de compra, estorno, disputa e tarifa.",
        features: [
          "Equivalência direta: TC 05 vs MTI 1240, TC 15 vs MTI 1442, VSS vs MCBS",
          "Comparação de estrutura física (Registros fixos de 168B em TCRs vs Mensagens ISO bitmapped variáveis)",
          "Diferenças críticas de janela de envio (Timeliness) e liquidação no Brasil"
        ],
        dataSources: ["Visa Base II Draft Data Manual", "Mastercard GCMS Manual", "Elo Processamento Manual"],
        roles: ["Adquirente", "Emissor", "Subcredenciador", "Backoffice"],
        keywords: ["comparativo", "base ii", "ipm", "de-para", "tc 05", "1240"],
        url: "/comparativo",
        badge: "Clearing Comparado",
        icon: Layers,
        color: "text-blue-400 bg-blue-500/10 border-blue-500/20"
      },
      {
        id: "campos-iso",
        title: "Dicionário Executivo de Campos ISO 8583 (DE & PDS)",
        desc: "Catálogo curado dos Data Elements e Private Data Sublements mais críticos para intercâmbio e compliance.",
        whatItIs:
          "Guia de referência rápida dos campos ISO 8583 e tags PDS que mais impactam o dia a dia de autorização, antifraude e intercâmbio, explicando em linguagem clara o que cada bit significa e o que acontece se for preenchido errado.",
        features: [
          "Explicação prática de DE 03, DE 18 (MCC), DE 22 (POS Entry), DE 39 (Response Code), DE 43, DE 48, DE 55 (EMV) e DE 61",
          "Impacto direto de cada campo na taxa de aprovação do emissor e no cálculo do intercâmbio",
          "Exemplos de preenchimento correto para transações presenciais e não-presenciais"
        ],
        dataSources: ["ISO 8583 Specification", "CIS / Base I / IPM Manuals"],
        roles: ["Adquirente", "Emissor", "Subcredenciador"],
        keywords: ["dicionario", "iso 8583", "de", "pds", "bit", "emv", "de 55"],
        url: "/compliance/campos",
        badge: "Dicionário DE/PDS",
        icon: Cpu,
        color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20"
      },
      {
        id: "jornada",
        title: "Jornada Ponta a Ponta da Transação",
        desc: "Ciclo visual completo do swipe/aproximação no POS até o clearing e a liquidação multilateral na CIP/STR.",
        whatItIs:
          "Mapa visual interativo que acompanha cada milissegundo da autorização online (D+0) e cada etapa do processamento batch de clearing, cálculo de intercâmbio, geração de grade SLC/CIP e liquidação financeira em reservas bancárias (D+1/D+2).",
        features: [
          "Linha do tempo interativa separando fluxo de Mensageria (Dados) vs Fluxo Financeiro (Dinheiro)",
          "Detalhamento do papel de cada ator (Portador, Lojista, Subcredenciador, Adquirente, Bandeira, Emissor, CIP, Bacen)",
          "Identificação exata de onde nascem o Intercâmbio, o MDR e os Scheme Fees"
        ],
        dataSources: ["Arquitetura SPB / CIP-SITRAF / SLC", "Fluxos Base I / Base II / CIS / GCMS"],
        roles: ["Adquirente", "Emissor", "Subcredenciador", "Backoffice", "Regulatório"],
        keywords: ["jornada", "fluxo", "cip", "slc", "autorizacao", "liquidacao", "pos"],
        url: "/jornada",
        badge: "Fluxo Ponta a Ponta",
        icon: Globe,
        color: "text-teal-400 bg-teal-500/10 border-teal-500/20"
      }
    ]
  },
  {
    category: "3. Inteligência Regulatória, Releases (381) & Acervo Normativo (35.336 Manuais)",
    subtitle: "Motor de busca nos 35.336 documentos oficiais, radar de 381 boletins técnicos e governança de liquidação internacional.",
    icon: Database,
    tools: [
      {
        id: "boletins",
        title: "Central de Boletins, Releases (381) & Motor de Comportamento",
        desc: "Simulador de impacto por perfil (3 Lentes), radar de 381 releases Visa/MC/Elo e dossiê criptográfico AES vs TDES.",
        whatItIs:
          "Central que analisa 381 boletins e mandatos de release (Visa Business News, Mastercard Announcements e Releases Elo) sob 3 lentes operacionais (Adquirente, Emissor e Subcredenciador), detalhando o que precisa ser desenvolvido em cada janela de release.",
        features: [
          "Filtro por perfil (3 Lentes): veja exatamente o que o Emissor ou o Adquirente precisa alterar no sistema",
          "Busca nos 381 boletins técnicos mapeados do acervo oficial",
          "Dossiê técnico de migração criptográfica (Key Block TR-31, DUKPT AES vs Triple DES)"
        ],
        dataSources: ["boletins-bundle.json (381 Releases)", "Mandatos Semestrais Visa / Mastercard / Elo"],
        roles: ["Adquirente", "Emissor", "Subcredenciador", "Regulatório"],
        keywords: ["boletins", "releases", "mandatos", "aes", "tdes", "tr-31", "381"],
        url: "/compliance/boletins",
        badge: "381 Releases + 3 Lentes",
        icon: Cpu,
        color: "text-amber-400 bg-amber-500/10 border-amber-500/20"
      },
      {
        id: "governanca-acervo",
        title: "Mapa de Liquidação Internacional (FX) & Governança do Acervo",
        desc: "Grafo auditado com 31 citações literais (FX/Multicurrency), conflitos TN3A/TC33 e cobertura de 28.918 arquivos.",
        whatItIs:
          "Painel de auditoria normativa sobre liquidação Cross-Border, conversão cambial (FX Multicurrency), IOF/Spread e conciliação de arquivos internacionais, apoiado por 31 citações literais extraídas diretamente dos manuais oficiais.",
        features: [
          "Grafo de regras de conversão de moeda entre Moeda da Transação (DE 49), Moeda de Liquidação (DE 50) e Moeda do Portador (DE 51)",
          "Análise de conflitos normativos e janelas de câmbio em transações internacionais",
          "Métricas de governança e cobertura documental dos diretórios do acervo"
        ],
        dataSources: ["governanca-bundle.json", "31 Citações Literais FX/Settlement", "28.918 Arquivos Auditados"],
        roles: ["Adquirente", "Emissor", "Backoffice", "Regulatório"],
        keywords: ["internacional", "fx", "cambio", "multicurrency", "cross-border", "tn3a", "tc33"],
        url: "/compliance/governanca-acervo",
        badge: "Grafo FX + Auditoria",
        icon: Globe,
        color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20"
      },
      {
        id: "acervo",
        title: "Acervo Normativo & Motor de Pesquisa RAG",
        desc: "Busca semântica e lexical em 35.336 manuais oficiais e 517.548 páginas da Visa, Mastercard, Elo e Bacen.",
        whatItIs:
          "Buscador direto e Copiloto IA sobre o acervo de 35.336 documentos normativos (manuais técnicos, tabelas de tarifas, boletins de release e resoluções do Banco Central), trazendo trechos oficiais com indicação do arquivo e página.",
        features: [
          "Busca instantânea por código de campo, artigo do regulamento, código de rejeição ou tema regulatório",
          "Filtro por bandeira (Visa, Mastercard, Elo, Bacen/SPB) e categoria documental",
          "Assistente RAG integrado para perguntas complexas com citação da fonte normativa"
        ],
        dataSources: ["acervo-normativo-index.json", "35.336 Documentos Oficiais (517.548 páginas)"],
        roles: ["Adquirente", "Emissor", "Subcredenciador", "Backoffice", "Regulatório"],
        keywords: ["acervo", "rag", "manuais", "busca", "pdf", "normativo", "35336"],
        url: "/acervo",
        badge: "35k Manuais RAG",
        icon: BookOpen,
        color: "text-amber-400 bg-amber-500/10 border-amber-500/20"
      },
      {
        id: "consultas",
        title: "Radar de Consultas Públicas & Regulação Bacen",
        desc: "Acompanhamento executivo de consultas regulatórias, tetos de intercâmbio e prazos de liquidação no Brasil.",
        whatItIs:
          "Painel de inteligência regulatória focado nas normas do Banco Central do Brasil (Resolução BCB nº 150, Resolução BCB nº 304, Consultas Públicas sobre Intercâmbio e Subcredenciamento) e seu impacto econômico nos emissores e credenciadoras.",
        features: [
          "Análise executiva dos tetos de intercâmbio (0,50% Débito e 0,70% Pré-Pago) e exceções",
          "Impacto regulatório nas grades da CIP/SLC e gestão de risco em arranjos abertos",
          "Histórico e linha do tempo das intervenções regulatórias no mercado brasileiro de cartões"
        ],
        dataSources: ["Resoluções BCB nº 150 e 304", "Editais de Consulta Pública Bacen"],
        roles: ["Adquirente", "Emissor", "Subcredenciador", "Regulatório"],
        keywords: ["bacen", "consulta publica", "resolucao 304", "teto", "regulatorio"],
        url: "/consultas",
        badge: "Regulatório Bacen",
        icon: FileText,
        color: "text-orange-400 bg-orange-500/10 border-orange-500/20"
      },
      {
        id: "rag-status",
        title: "Diagnóstico & Telemetria da Base RAG (SQLite FTS5)",
        desc: "Métricas de indexação, distribuição por bandeira, integridade SHA256 e teste ao vivo de latência.",
        whatItIs:
          "Painel de engenharia de dados que exibe a saúde do índice normativo (`rag_acervo.sqlite`), a distribuição exata dos 35.336 arquivos e 517.548 blocos por bandeira e tipo de arquivo, e permite testar queries em tempo real.",
        features: [
          "Inventário detalhado de documentos e páginas indexadas por bandeira (Mastercard, Visa, Elo, Bacen)",
          "Consola de teste de busca ao vivo com medição de tempo de resposta em milissegundos",
          "Verificação de integridade dos snapshots e bundles em produção"
        ],
        dataSources: ["rag-status-snapshot.json", "rag_acervo.sqlite (5.03 GB)"],
        roles: ["Backoffice", "Regulatório"],
        keywords: ["rag", "status", "sqlite", "fts5", "telemetria", "infra"],
        url: "/admin/rag-status",
        badge: "Telemetria RAG",
        icon: Database,
        color: "text-slate-300 bg-slate-500/10 border-slate-500/20"
      }
    ]
  },
  {
    category: "4. Compliance Operacional, Riscos, Disputas & Conciliação",
    subtitle: "Regras de PayFac/Subcredenciadores, conciliação financeira 3-Way, retentativas, 3DS 2.2, Chargebacks e Settlement.",
    icon: ShieldCheck,
    tools: [
      {
        id: "subcredenciadores",
        title: "Arquitetura de Subcredenciadores (PayFac), Relatórios MCBS & Catálogo",
        desc: "Regras DE 48 SE 37, Dataset ID 56, Bit 43/58 Elo, backlog TN3A/AB111010 e inventário catalogo.xlsx (35.336 SHA256).",
        whatItIs:
          "Módulo especializado para Adquirentes que habilitam Subcredenciadores (PayFacs) e para próprios Subcredenciadores. Detalha o preenchimento obrigatório de identificação do sublojista nas 3 bandeiras, limites de volume anual (USD 1M / R$ 5M) para migração a adquirente direto e conciliação na CIP.",
        features: [
          "Especificação campo a campo: Mastercard DE 48 SE 37 / PDS 0208, Visa Dataset ID 56, Elo Bit 43/58/60",
          "Mapeamento de relatórios de faturamento MCBS e taxas de registro de PayFac (PFM)",
          "Explorador do inventário criptográfico `catalogo.xlsx` com 35.336 hashes SHA256"
        ],
        dataSources: ["Regras de Payment Facilitator Visa/MC/Elo", "Circular BCB 3.885 / Res. 150", "catalogo.xlsx"],
        roles: ["Adquirente", "Subcredenciador", "Regulatório"],
        keywords: ["payfac", "subcredenciador", "facilitador", "de 48", "se 37", "dataset 56", "catalogo"],
        url: "/compliance/subcredenciadores",
        badge: "PayFac + 35k SHA256",
        icon: ShieldCheck,
        color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
      },
      {
        id: "conciliacao",
        title: "Playbook de Conciliação Financeira em 3 Pontas (3-Way Match)",
        desc: "Batimento entre Captura Interna vs Arquivos de Clearing/Relatórios VSS 110 & MCBS vs Liquidação CIP/STR.",
        whatItIs:
          "Metodologia operacional completa para tesouraria e backoffice baterem centavo por centavo o que foi capturado no switch de autorização contra os arquivos de clearing (Base II TC05 / IPM 1240), relatórios financeiros (VSS-110/120/140 e MCBS 1740) e as grades de liquidação da CIP (SLC).",
        features: [
          "Arquitetura de batimento em 3 pontas (Autorização x Clearing x Liquidação Financeira)",
          "Identificação de divergências clássicas: transação autorizada e não liquidada, rejeição sintática de lote e fee collection surpresa",
          "Guia de leitura conjunta dos relatórios Visa VSS-110, VSS-120, VSS-130 e VSS-140"
        ],
        dataSources: ["Visa VSS User Guide", "Mastercard Settlement Manual", "Grades SLC/CIP Nuclea"],
        roles: ["Adquirente", "Emissor", "Subcredenciador", "Backoffice"],
        keywords: ["conciliacao", "3-way", "vss-110", "vss-120", "vss-140", "slc", "cip", "batimento"],
        url: "/compliance/conciliacao",
        badge: "3-Way Batimento",
        icon: Scale,
        color: "text-amber-400 bg-amber-500/10 border-amber-500/20"
      },
      {
        id: "hub-compliance",
        title: "Hub Central de Compliance & Regras de Bandeira",
        desc: "Visão panorâmica executiva de todos os programas de monitoramento, tetos de fraude/chargeback e obrigações.",
        whatItIs:
          "Painel integrador das normas de compliance das bandeiras (VDMP/VFMP/VAMP da Visa, ECM/HECM/AFM da Mastercard e programas Elo), mostrando os limiares de basis points (bps) que disparam multas e planos de remediação.",
        features: [
          "Monitoramento de limiares de fraude e disputa (Visa VAMP e Mastercard ECM/AFM)",
          "Checklist de conformidade para credenciadoras e emissores",
          "Acesso rápido aos dossiês específicos de 3DS, Retentativas, Disputas e Settlement"
        ],
        dataSources: ["Visa Core Rules", "Mastercard Security Rules & Procedures"],
        roles: ["Adquirente", "Emissor", "Subcredenciador", "Regulatório"],
        keywords: ["compliance", "vamp", "vdmp", "vfmp", "ecm", "multas", "monitoria"],
        url: "/compliance",
        badge: "Central Compliance",
        icon: ShieldCheck,
        color: "text-blue-400 bg-blue-500/10 border-blue-500/20"
      },
      {
        id: "retentativas",
        title: "Matriz de Retentativas & Response Codes (DE 39)",
        desc: "Regras do Visa Smart Retries e Mastercard Transaction Processing Excellence (TPE) para evitar multas por excesso de tentativas.",
        whatItIs:
          "Classificador normativo de códigos de retorno da autorização (ISO DE 39). Separa códigos de Hard Decline (proibido retentar imediatamente, sob pena de multa por tentativa nas bandeiras) de Soft Declines (permitido retentar dentro da janela regulamentar).",
        features: [
          "Classificação completa dos Response Codes DE 39 em Categorias 1, 2, 3 e 4",
          "Cálculo de exposição a multas de retentativa excessiva (acima de 15 tentativas em 30 dias)",
          "Recomendações de lógica de Smart Retry para motores de recorrência e e-commerce"
        ],
        dataSources: ["Visa Art. 2.11 Retry Rules", "Mastercard TPE / Category Decline Rules"],
        roles: ["Adquirente", "Emissor", "Subcredenciador"],
        keywords: ["retentativas", "retries", "de 39", "response code", "hard decline", "soft decline", "tpe"],
        url: "/compliance/retentativas",
        badge: "Smart Retries",
        icon: RefreshCw,
        color: "text-rose-400 bg-rose-500/10 border-rose-500/20"
      },
      {
        id: "3ds",
        title: "3-D Secure 2.2, ECI & Liability Shift",
        desc: "Simulador de indicadores ECI (05/06/07 e 02/01/00), CAVV/AAV, Data Only e transferência de responsabilidade por fraude.",
        whatItIs:
          "Simulador técnico e jurídico do protocolo EMV 3DS 2.2. Demonstra quando ocorre o Liability Shift (transferência do prejuízo de chargeback de fraude do lojista/adquirente para o banco emissor) e como o 3DS destrava tarifas menores de intercâmbio no e-commerce.",
        features: [
          "Matriz completa de ECI Visa (05, 06, 07) e Mastercard (02, 01, 00 / UCAF) com status de Liability Shift",
          "Impacto do 3DS Autenticado vs Data Only na cascata de intercâmbio",
          "Regras de exceção para cartões corporativos e transações MIT (Merchant Initiated)"
        ],
        dataSources: ["EMV 3DS 2.2 Specification", "Visa 3DS / Mastercard Identity Check Rules"],
        roles: ["Adquirente", "Emissor", "Subcredenciador", "Regulatório"],
        keywords: ["3ds", "eci", "liability shift", "cavv", "aav", "identity check", "fraude"],
        url: "/compliance/3ds",
        badge: "Liability Shift",
        icon: ShieldCheck,
        color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
      },
      {
        id: "settlement",
        title: "Ciclo de Settlement & Liquidação Multilateral (D+0 a D+3)",
        desc: "Fluxo de compensação financeira entre bandeiras, grades SLC/CIP Nuclea e liquidação em conta STR no Banco Central.",
        whatItIs:
          "Explicação detalhada da arquitetura de liquidação financeira no Brasil (Arranjo Homologado pelo Bacen). Mostra o corte de janela (Cut-off), envio de arquivos de clearing, cálculo líquido multilateral e liquidação nas contas de reserva bancária no STR.",
        features: [
          "Cronograma hora a hora do ciclo D+0, D+1 e D+2 (débito vs crédito à vista vs parcelado)",
          "Diferença entre liquidação doméstica via CIP/SLC e liquidação internacional em USD",
          "Mecanismos de garantias, colateral e gestão de risco de liquidação do emissor/adquirente"
        ],
        dataSources: ["Regulamento CIP/SLC", "Manuais de Liquidação Nacional Visa / Mastercard / Elo"],
        roles: ["Adquirente", "Emissor", "Subcredenciador", "Backoffice"],
        keywords: ["settlement", "liquidacao", "str", "cip", "slc", "d+1", "d+2"],
        url: "/compliance/settlement",
        badge: "D+0 a D+3",
        icon: DollarSign,
        color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20"
      },
      {
        id: "disputas",
        title: "Gestão de Chargebacks, Disputas & Compelling Evidence 3.0",
        desc: "Ciclo de First Chargeback, Representment, Pré-Arbitragem, VROL/MCOM e regras de Compelling Evidence 3.0.",
        whatItIs:
          "Guia completo do ciclo de disputas (Visa Claims Resolution / VROL e Mastercard MCOM). Abrange os prazos fatais de cada fase, códigos de razão (Reason Codes 10.4, 13.1, 4837, 4853) e os requisitos técnicos do Compelling Evidence 3.0 para reverter fraudes amigáveis.",
        features: [
          "Fluxo completo: Retrieval/Collaboration → 1st Chargeback → Representment → Pre-Arbitration → Arbitration",
          "Requisitos de vínculo histórico (IP, Device ID, Shipping Address, Account ID) do Compelling Evidence 3.0",
          "Custos de tarifas de disputa (MCBS 1CA/2CA e Visa Dispute Fees) para quem perde o caso"
        ],
        dataSources: ["Visa Dispute Management Guidelines", "Mastercard Chargeback Guide (MCOM)"],
        roles: ["Adquirente", "Emissor", "Subcredenciador", "Backoffice", "Regulatório"],
        keywords: ["chargeback", "disputas", "vrol", "mcom", "ce 3.0", "compelling evidence", "1442"],
        url: "/compliance/disputas",
        badge: "Disputas & CE 3.0",
        icon: AlertTriangle,
        color: "text-red-400 bg-red-500/10 border-red-500/20"
      }
    ]
  },
  {
    category: "5. Estúdio Executivo, Mapas Gráficos & Base de Conhecimento",
    subtitle: "Editor de pareceres técnicos com IA, atlas visual de liquidação, grafo de conceitos e artigos estratégicos.",
    icon: Layers,
    tools: [
      {
        id: "editor",
        title: "Doc Studio: Editor de Pareceres Regulatórios com IA",
        desc: "Editor executivo com IA Copilot conectada ao acervo, comparador de releases e exportação formatada.",
        whatItIs:
          "Ambiente de redação de pareceres técnicos, notas executivas e memoriais descritivos de releases. Permite consultar o acervo normativo lateralmente e estruturar documentos prontos para diretoria, auditoria ou clientes.",
        features: [
          "Templates prontos para Parecer de Impacto de Boletim, Análise de Downgrade e Defesa Técnica",
          "Integração direta com o motor de pesquisa normativa",
          "Formatação limpa para impressão e exportação executiva"
        ],
        dataSources: ["Motor RAG 35.336 Manuais", "Templates Executivos de Meios de Pagamento"],
        roles: ["Adquirente", "Emissor", "Subcredenciador", "Regulatório"],
        keywords: ["editor", "parecer", "doc studio", "relatorio", "ia"],
        url: "/editor",
        badge: "Editor IA",
        icon: FileText,
        color: "text-purple-400 bg-purple-500/10 border-purple-500/20"
      },
      {
        id: "atlas-liquidacao",
        title: "Atlas Gráfico de Liquidação VisaNet & MCBS",
        desc: "Diagramas interativos de compensação, janelas de clearing e topologia de liquidação multilateral.",
        whatItIs:
          "Visualização arquitetural em alta resolução dos fluxos de liquidação VisaNet/Base II e Mastercard GCMS/MCBS, ideal para apresentações executivas, alinhamento de times de engenharia e treinamento de operações.",
        features: [
          "Diagramas interativos de fluxo de arquivos e janelas operacionais",
          "Mapeamento visual dos pontos de captura de tarifas e conciliação",
          "Visão comparativa entre fluxos domésticos (BRL) e cross-border (USD)"
        ],
        dataSources: ["Arquitetura VisaNet & Mastercard GCMS"],
        roles: ["Adquirente", "Emissor", "Backoffice"],
        keywords: ["atlas", "liquidacao", "diagrama", "visanet", "mcbs"],
        url: "/mapa/liquidacao",
        badge: "Atlas Gráfico",
        icon: Globe,
        color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20"
      },
      {
        id: "mapa-mcbs",
        title: "Guia Estrutural Hierárquico de Tarifas MCBS",
        desc: "Mapa visual da árvore de cobrança Mastercard: de Business Service Arrangements até Billing Event IDs.",
        whatItIs:
          "Decomposição visual da árvore hierárquica do faturamento Mastercard: explica como ICA → Activity → Service ID → Event ID se conectam na fatura e nos arquivos MTI 1740 / T461.",
        features: [
          "Navegação visual pela hierarquia ICA / Service ID / Event ID",
          "Explicação didática de Tiered Pricing vs Flat Rate vs Basis Points",
          "Exemplos práticos de leitura de fatura MCBS"
        ],
        dataSources: ["Manual MCBS - Billing - BRAZIL.pdf"],
        roles: ["Adquirente", "Emissor", "Backoffice"],
        keywords: ["mapa mcbs", "hierarquia", "ica", "service id", "fatura"],
        url: "/mapa/mcbs",
        badge: "Árvore MCBS",
        icon: Layers,
        color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20"
      },
      {
        id: "mapa-conhecimento",
        title: "Grafo Interativo do Conhecimento (39 Conceitos Conectados)",
        desc: "Rede visual mostrando como Autorização, Clearing, Intercâmbio, 3DS, Tokenização e Disputas se interligam.",
        whatItIs:
          "Grafo de conhecimento interativo com 39 conceitos fundamentais da indústria de cartões. Ao clicar em qualquer nó (ex: IRD, ECI, Base II, MCC, BIN), o grafo destaca todos os conceitos dependentes e explica a relação técnica entre eles.",
        features: [
          "Exploração visual de dependências entre mensageria, risco e finanças",
          "Fichas resumidas de cada um dos 39 conceitos-chave",
          "Links diretos para os simuladores e motores correspondentes"
        ],
        dataSources: ["Base Conceitual Bandeiras & Meios de Pagamento"],
        roles: ["Adquirente", "Emissor", "Subcredenciador", "Backoffice", "Regulatório"],
        keywords: ["grafo", "mapa", "conceitos", "conhecimento"],
        url: "/mapa",
        badge: "Grafo 39 Conceitos",
        icon: Globe,
        color: "text-blue-400 bg-blue-500/10 border-blue-500/20"
      },
      {
        id: "trilhas",
        title: "Trilhas Guiadas de Especialização em Bandeiras",
        desc: "Percursos estruturados do nível executivo até a engenharia profunda de clearing e intercâmbio.",
        whatItIs:
          "Módulos sequenciais de estudo e capacitação para dominar o ciclo completo de uma transação, precificação de intercâmbio, prevenção ao downgrade e gestão de faturas de bandeira.",
        features: [
          "Trilha de Fundamentos do Arranjo de Pagamento e Papel dos Atores",
          "Trilha de Engenharia de Intercâmbio e Prevenção ao Downgrade",
          "Trilha de Clearing, Conciliação e Scheme Fees"
        ],
        dataSources: ["Currículo Técnico de Meios de Pagamento"],
        roles: ["Adquirente", "Emissor", "Subcredenciador", "Backoffice", "Regulatório"],
        keywords: ["trilhas", "aprendizado", "treinamento", "estudo"],
        url: "/trilhas",
        badge: "Trilhas Guiadas",
        icon: BookOpen,
        color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
      },
      {
        id: "artigos",
        title: "Artigos Técnicos & Análises Estratégicas",
        desc: "Estudos aprofundados sobre DAF, Compelling Evidence 3.0, Tokenização, Tetos Regulatórios e Economia de Rede.",
        whatItIs:
          "Biblioteca de artigos autorais e análises técnicas profundas sobre as transformações mais recentes das bandeiras no Brasil e no mundo.",
        features: [
          "Estudos de caso reais sobre impacto de novas regras de bandeira",
          "Análises comparativas de rentabilidade para Emissores e Adquirentes",
          "Guias práticos de implementação regulatória"
        ],
        dataSources: ["Artigos Técnicos & Regulatórios"],
        roles: ["Adquirente", "Emissor", "Subcredenciador", "Regulatório"],
        keywords: ["artigos", "daf", "tokenizacao", "analises"],
        url: "/artigos",
        badge: "Artigos",
        icon: FileText,
        color: "text-slate-300 bg-slate-500/10 border-slate-500/20"
      }
    ]
  }
];

const ALL_TOOLS: ToolCard[] = MODULES.flatMap((m) => m.tools);

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  // Cockpit Interactive Controls
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("ALL");
  const [detailedView, setDetailedView] = useState<boolean>(false);
  const [hoveredTool, setHoveredTool] = useState<ToolCard>(ALL_TOOLS[6] || ALL_TOOLS[0]);

  useEffect(() => {
    const hasCookie = document.cookie.split(";").some((c) => c.trim().startsWith("vs_internal_pass=1"));
    setIsAuthenticated(hasCookie);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.trim() === "vs2026") {
      document.cookie = "vs_internal_pass=1; path=/; max-age=2592000; SameSite=Lax";
      setIsAuthenticated(true);
      setErrorMsg("");
      window.location.href = "/admin";
    } else {
      setErrorMsg("Chave de acesso incorreta. Tente novamente.");
    }
  };

  const handleLogout = () => {
    document.cookie = "vs_internal_pass=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    window.location.href = "/?logout=1";
  };

  const filteredModules = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return MODULES.map((mod) => {
      const tools = mod.tools.filter((t) => {
        if (selectedRole !== "ALL" && !t.roles.includes(selectedRole as any)) {
          return false;
        }
        if (!q) return true;
        const hay = `${t.title} ${t.desc} ${t.whatItIs} ${t.badge} ${t.url} ${t.features.join(" ")} ${t.dataSources.join(" ")} ${t.keywords.join(" ")}`.toLowerCase();
        return hay.includes(q);
      });
      return { ...mod, tools };
    }).filter((mod) => mod.tools.length > 0);
  }, [searchQuery, selectedRole]);

  const totalVisibleTools = useMemo(
    () => filteredModules.reduce((acc, m) => acc + m.tools.length, 0),
    [filteredModules]
  );

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-[#030711] flex items-center justify-center text-slate-500 text-xs">
        Carregando Cockpit...
      </div>
    );
  }

  // ── Tela de Autenticação para o Proprietário ──
  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-[#030711] flex items-center justify-center p-6">
        <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-[#090e17] p-8 shadow-2xl relative overflow-hidden">
          <div className="text-center space-y-3 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-blue-600/10 border border-blue-500/20 text-blue-400 mx-auto flex items-center justify-center">
              <Lock size={26} />
            </div>
            <h1 className="text-xl font-bold text-white">
              Cockpit do Proprietário
            </h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              Área de acesso restrito de Vinícius Sugamele. O público externo visualiza apenas o seu currículo oficial.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                Chave de Acesso Pessoal
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite sua chave secreta..."
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder:text-slate-600 text-sm outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/60 transition-all font-mono"
                autoFocus
              />
              {errorMsg && (
                <p className="text-xs text-red-400 mt-2 font-medium">
                  {errorMsg}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl font-bold text-xs bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center gap-2 shadow-md shadow-blue-600/30 transition-all"
            >
              <Unlock size={14} />
              <span>Desbloquear Cockpit</span>
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-800/80 text-center">
            <Link
              href="/"
              className="text-xs text-slate-500 hover:text-slate-300 transition-colors inline-flex items-center gap-1.5"
            >
              <span>Voltar ao Currículo Público</span>
              <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // ── Painel Desbloqueado: Command Center Executivo ──
  return (
    <main className="min-h-screen bg-[#030711] pb-24">
      {/* Header do Cockpit */}
      <div className="border-b border-slate-800 bg-[#080d16]/95 px-6 py-5 sticky top-0 z-40 backdrop-blur-md">
        <div className="mx-auto max-w-7xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 font-mono">
                Command Center Proprietário · 31 Módulos Operacionais Ativos
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-black text-white">
              Cockpit Privado & Central de Engenharia de Bandeiras
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Passe o mouse sobre qualquer módulo abaixo para inspecionar em detalhes do que se trata, quais bancos/manuais alimentam a ferramenta e o que você simula lá dentro.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setDetailedView(!detailedView)}
              className={`px-3.5 py-2 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all ${
                detailedView
                  ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/20"
                  : "bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-200"
              }`}
            >
              <Eye size={14} className={detailedView ? "text-white" : "text-blue-400"} />
              <span>{detailedView ? "Visão Raio-X Ativa (Todos Expandidos)" : "Expandir Raio-X em Todos os Cards"}</span>
            </button>

            <Link
              href="/"
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 flex items-center gap-2 transition-all"
            >
              <Globe size={13} className="text-blue-400" />
              <span>Ver Home Pública</span>
            </Link>

            <button
              onClick={handleLogout}
              className="px-3.5 py-2 rounded-xl bg-red-950/30 hover:bg-red-900/40 border border-red-500/30 text-xs font-semibold text-red-300 flex items-center gap-2 transition-all"
              title="Bloquear e voltar ao modo público"
            >
              <LogOut size={13} />
              <span>Bloquear / Sair</span>
            </button>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="mx-auto max-w-7xl px-6 pt-8 space-y-8">
        {/* Atalhos Diretos para o Sistema de Arquivos & Motores Principais */}
        <div className="rounded-3xl border border-slate-800 bg-gradient-to-r from-blue-950/25 via-[#0a101d] to-purple-950/20 p-5 md:p-6 space-y-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                <Database size={24} />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-base font-extrabold text-white">
                    Infraestrutura Unificada: Acervo Normativo + Sistemas de Arquivos (GCMS, MPE, MCBS, Base II, VSS & Elo)
                  </span>
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-mono">
                    ● 100% Online
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  <strong>35.336 manuais</strong> (517.548 páginas) · <strong>17.106 campos posicionais/ISO</strong> (`campos.sqlite3`) · <strong>2.267 eventos MCBS Brasil</strong> + <strong>10.914 linhas Visa VSS</strong> · <strong>1.128 alíquotas de intercâmbio</strong> · <strong>381 boletins de release</strong>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <Link
                href="/compliance/arquivos?tab=parser"
                className="px-3 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-xs font-bold text-blue-300 flex items-center gap-1.5 transition-all"
              >
                <Terminal size={13} />
                <span>Parser Byte-a-Byte</span>
              </Link>
              <Link
                href="/compliance/arquivos?tab=campos"
                className="px-3 py-2 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/40 text-xs font-bold text-cyan-300 flex items-center gap-1.5 transition-all"
              >
                <Database size={13} />
                <span>17.106 Campos SQLite</span>
              </Link>
              <Link
                href="/compliance/arquivos?tab=billing"
                className="px-3 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-xs font-bold text-purple-300 flex items-center gap-1.5 transition-all"
              >
                <DollarSign size={13} />
                <span>Motor MCBS & Visa VSS</span>
              </Link>
              <Link
                href="/acervo"
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Search size={13} />
                <span>Buscar nos 35k Manuais</span>
              </Link>
            </div>
          </div>

          {/* Barra de Busca Rápida & Filtro por Papel no Arranjo */}
          <div className="pt-4 border-t border-slate-800/80 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-xl">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filtrar ferramentas por tema, arquivo ou código (ex: MCBS, 1740, TC 05, IP0040T1, 3DS, PayFac, CE 3.0)..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#030711] border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-slate-400 hover:text-white"
                >
                  Limpar
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] text-slate-400 mr-1 flex items-center gap-1">
                <Filter className="w-3 h-3" /> Filtrar por Visão:
              </span>
              {[
                { id: "ALL", label: "Todos (31)" },
                { id: "Adquirente", label: "Adquirente / Credenciadora" },
                { id: "Emissor", label: "Banco Emissor" },
                { id: "Subcredenciador", label: "Subcredenciador (PayFac)" },
                { id: "Backoffice", label: "Conciliação & Backoffice" },
                { id: "Regulatório", label: "Regulatório & Releases" }
              ].map((role) => (
                <button
                  key={role.id}
                  onClick={() => setSelectedRole(role.id)}
                  className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all border ${
                    selectedRole === role.id
                      ? "bg-blue-600/20 border-blue-500 text-blue-300"
                      : "bg-slate-900/90 border-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {role.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* =====================================================================
            PAINEL DE INSPEÇÃO EM TEMPO REAL AO PASSAR O MOUSE (RAIO-X DO MÓDULO)
           ===================================================================== */}
        {hoveredTool && (
          <div className="rounded-2xl border border-blue-500/35 bg-gradient-to-r from-[#071124] via-[#090f1d] to-[#0d0b20] p-5 shadow-xl transition-all">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3 mb-4">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/20 border border-blue-500/40 text-blue-300 text-[10px] font-bold uppercase tracking-wider">
                  <Eye className="w-3.5 h-3.5" /> Raio-X do Módulo Selecionado (Passe o mouse nos cards abaixo)
                </span>
                <span className="text-sm font-extrabold text-white">
                  {hoveredTool.title}
                </span>
                <span className="text-[11px] font-mono px-2.5 py-0.5 rounded bg-slate-900 text-emerald-300 border border-emerald-500/30">
                  {hoveredTool.badge}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {hoveredTool.roles.map((r) => (
                  <span
                    key={r}
                    className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-[10px] font-semibold text-slate-300"
                  >
                    {r}
                  </span>
                ))}
                <Link
                  href={hoveredTool.url}
                  className="ml-2 px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold inline-flex items-center gap-1.5 transition-colors"
                >
                  <span>Abrir Módulo</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 text-xs">
              {/* Col 1: Do que se trata */}
              <div className="lg:col-span-5 bg-[#030711]/90 border border-slate-800/90 rounded-xl p-4 space-y-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
                  Do que se trata este módulo
                </div>
                <p className="text-slate-200 leading-relaxed">
                  {hoveredTool.whatItIs}
                </p>
              </div>

              {/* Col 2: O que você faz lá dentro */}
              <div className="lg:col-span-4 bg-[#030711]/90 border border-slate-800/90 rounded-xl p-4 space-y-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                  O que você consulta & simula lá dentro
                </div>
                <ul className="space-y-1.5 text-slate-300">
                  {hoveredTool.features.map((feat, i) => (
                    <li key={i} className="flex items-start gap-2 leading-snug">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Col 3: Bases & Manuais Conectados */}
              <div className="lg:col-span-3 bg-[#030711]/90 border border-slate-800/90 rounded-xl p-4 space-y-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-purple-400">
                  Bases, Tabelas & Fontes Oficiais
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {hoveredTool.dataSources.map((src, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/25 font-mono text-[11px] text-purple-200"
                    >
                      {src}
                    </span>
                  ))}
                </div>
                <div className="pt-2 border-t border-slate-800/80 text-[11px] font-mono text-slate-400">
                  Rota: <span className="text-blue-400">{hoveredTool.url}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Lista de Categorias e Módulos */}
        {filteredModules.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-[#090e17] p-12 text-center space-y-3">
            <p className="text-sm font-bold text-white">
              Nenhum módulo encontrado para &ldquo;{searchQuery}&rdquo; no filtro selecionado.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedRole("ALL");
              }}
              className="px-4 py-2 rounded-xl bg-blue-600 text-xs font-bold text-white"
            >
              Limpar Filtros ({ALL_TOOLS.length} módulos disponíveis)
            </button>
          </div>
        ) : (
          filteredModules.map((mod, idx) => {
            const CatIcon = mod.icon;
            return (
              <section key={idx} className="space-y-4">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-2 pb-2 border-b border-slate-800/80">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <CatIcon size={18} className="text-blue-400" />
                      <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                        {mod.category}
                      </h2>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{mod.subtitle}</p>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500">
                    {mod.tools.length} {mod.tools.length === 1 ? "módulo" : "módulos"}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {mod.tools.map((tool) => {
                    const ToolIcon = tool.icon;
                    const isHovered = hoveredTool?.id === tool.id;
                    return (
                      <Link
                        key={tool.id}
                        href={tool.url}
                        onMouseEnter={() => setHoveredTool(tool)}
                        className={`group p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                          isHovered
                            ? "bg-[#0d1526] border-blue-500/60 shadow-lg shadow-blue-950/30"
                            : "bg-[#090e17] border-slate-800/90 hover:border-blue-500/40 hover:bg-[#0c1320]"
                        }`}
                      >
                        <div className="space-y-2.5">
                          <div className="flex items-center justify-between gap-2">
                            <div
                              className={`w-9 h-9 rounded-xl flex items-center justify-center border ${tool.color} group-hover:scale-105 transition-transform`}
                            >
                              <ToolIcon size={16} />
                            </div>
                            <span className="text-[10px] font-mono px-2.5 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800">
                              {tool.badge}
                            </span>
                          </div>

                          <h3 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
                            {tool.title}
                          </h3>

                          <p className="text-xs text-slate-300 leading-relaxed">
                            {tool.desc}
                          </p>

                          {/* Detalhamento extra exibido ao passar o mouse no card OU quando o modo Raio-X está ativo */}
                          <div
                            className={`space-y-2.5 pt-2.5 border-t border-slate-800/80 transition-all ${
                              detailedView || isHovered ? "block" : "hidden group-hover:block"
                            }`}
                          >
                            <div className="bg-[#030711]/90 border border-slate-800/80 rounded-xl p-3">
                              <div className="text-[10px] font-bold uppercase tracking-wider text-blue-400 mb-1">
                                Do que se trata:
                              </div>
                              <p className="text-[11px] text-slate-200 leading-relaxed">
                                {tool.whatItIs}
                              </p>
                            </div>

                            <div className="space-y-1">
                              <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                                O que você faz aqui:
                              </div>
                              {tool.features.map((f, fIdx) => (
                                <div key={fIdx} className="text-[11px] text-slate-300 flex items-start gap-1.5 leading-snug">
                                  <span className="text-emerald-400 font-bold">•</span>
                                  <span>{f}</span>
                                </div>
                              ))}
                            </div>

                            <div className="flex flex-wrap gap-1 pt-1">
                              {tool.dataSources.map((src, sIdx) => (
                                <span
                                  key={sIdx}
                                  className="px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 font-mono text-[10px] text-purple-300"
                                >
                                  {src}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="pt-2.5 border-t border-slate-800/60 flex items-center justify-between gap-2">
                          <div className="flex flex-wrap gap-1">
                            {tool.roles.slice(0, 3).map((r) => (
                              <span
                                key={r}
                                className="px-1.5 py-0.5 rounded bg-slate-900/90 border border-slate-800 text-[9px] text-slate-400"
                              >
                                {r}
                              </span>
                            ))}
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] text-blue-400 font-semibold shrink-0">
                            <span>Abrir</span>
                            <ArrowRight
                              size={12}
                              className="group-hover:translate-x-1 transition-all"
                            />
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </section>
            );
          })
        )}
      </div>
    </main>
  );
}
