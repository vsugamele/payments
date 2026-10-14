export interface ToolCardMeta {
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
  iconName: string;
  color: string;
}

export interface ModuleCategoryMeta {
  category: string;
  subtitle: string;
  iconName: string;
  tools: ToolCardMeta[];
}

export const ADMIN_MODULE_CATEGORIES: ModuleCategoryMeta[] = [
  {
    category: "1. Simuladores & Motores Financeiros (Intercâmbio, MDR & Fee Schedule)",
    subtitle: "Cálculo determinístico de intercâmbio, cascata de downgrade, Scheme Fees MCBS/VSS e margem líquida de MDR.",
    iconName: "Calculator",
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
        iconName: "Cpu",
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
        iconName: "Calculator",
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
        iconName: "BarChart2",
        color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20"
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
        iconName: "DollarSign",
        color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
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
        iconName: "DollarSign",
        color: "text-purple-400 bg-purple-500/10 border-purple-500/20"
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
        iconName: "Scale",
        color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
      },
      {
        id: "compliance-intercambio",
        title: "Guia Normativo de Qualificação de Intercâmbio (IRD & FPI)",
        desc: "Regras de qualificação tarifária, tetos regulatórios Bacen e requisitos de captura para evitar downgrade.",
        whatItIs:
          "Dossiê técnico sobre como funcionam os indicadores de programa de tarifa (Visa FPI e Mastercard IRD), prazos máximos de envio ao clearing (Timeliness) e impactos da Resolução BCB 304.",
        features: [
          "Tabelas comparativas de IRDs Mastercard e Fee Program Indicators Visa",
          "Regras de Timeliness (D+1 vs D+3) que protegem a tarifa qualificada",
          "Mapeamento de tetos regulatórios em Débito e Pré-Pago"
        ],
        dataSources: ["mastercard-interchange.json", "elo-interchange.json", "Resolução BCB 304"],
        roles: ["Adquirente", "Emissor", "Subcredenciador"],
        keywords: ["intercambio", "ird", "fpi", "timeliness", "qualificacao"],
        url: "/compliance/intercambio",
        badge: "IRD & FPI",
        iconName: "DollarSign",
        color: "text-blue-400 bg-blue-500/10 border-blue-500/20"
      },
      {
        id: "compliance-downgrade",
        title: "Diagnóstico & Prevenção ao Downgrade Tarifário (EIRF / Standard)",
        desc: "Catálogo das causas técnicas que derrubam uma transação para a tarifa punitiva Standard ou EIRF.",
        whatItIs:
          "Manual de engenharia focado em eliminar vazamento de margem por downgrade de intercâmbio. Mostra quais campos ausentes ou inconsistentes entre autorização e clearing disparam tarifas punitivas.",
        features: [
          "Checklist dos 12 gatilhos clássicos de downgrade em transações presenciais e e-commerce",
          "Diferença de custo entre tarifa qualificada, EIRF (Visa) e Standard (Mastercard)",
          "Plano de ação de engenharia para blindar o motor de captura e remessa"
        ],
        dataSources: ["downgrade-rules.json", "Visa Base II & Mastercard GCMS Qualification Rules"],
        roles: ["Adquirente", "Subcredenciador", "Backoffice"],
        keywords: ["downgrade", "eirf", "standard", "penalidade", "vazamento"],
        url: "/compliance/downgrade",
        badge: "Anti-Downgrade",
        iconName: "AlertTriangle",
        color: "text-amber-400 bg-amber-500/10 border-amber-500/20"
      },
      {
        id: "compliance-fees",
        title: "Auditoria de Scheme Fees & Assessment de Bandeira",
        desc: "Análise de taxas de marca, processamento, conectividade, cross-border e faturamento VSS/MCBS.",
        whatItIs:
          "Visão executiva de todas as famílias de taxas cobradas pelas bandeiras além do intercâmbio (Assessment sobre TPV, processamento por transação, tarifas internacionais e taxas fixas de licenciamento).",
        features: [
          "Decomposição de custos variáveis por transação vs custos sobre volume (bps)",
          "Comparativo de estrutura de cobrança Visa VSS vs Mastercard MCBS",
          "Estratégias de conciliação e repasse contratual para subcredenciadores"
        ],
        dataSources: ["visa-billing.json", "mcbs-events.json"],
        roles: ["Adquirente", "Emissor", "Subcredenciador", "Backoffice"],
        keywords: ["scheme fees", "assessment", "vss", "mcbs", "fatura"],
        url: "/compliance/fees",
        badge: "Auditoria Fees",
        iconName: "DollarSign",
        color: "text-purple-400 bg-purple-500/10 border-purple-500/20"
      }
    ]
  },
  {
    category: "2. Engenharia de Arquivos, Mensageria, EMV & Clearing (GCMS, MPE, MCBS, Base II, VSS, Elo)",
    subtitle: "Decodificadores posicionais byte-a-byte, lote multi-linha, T068/RDW, EMV TVR bit-a-bit, 17.106 campos SQLite e 13.181 fees.",
    iconName: "Terminal",
    tools: [
      {
        id: "arquivos-central",
        title: "Sistema Completo: GCMS, MPE, MCBS, Base II, VSS & Elo",
        desc: "Decodificador byte-a-byte + Lote Multi-Linha, 17.106 campos SQLite e Simulador de Fatura com 2.267 eventos MCBS + 10.914 linhas Visa.",
        whatItIs:
          "A central definitiva de engenharia de arquivos das 3 bandeiras. Reúne em 4 abas: (1) Parser Studio Byte-a-Byte + Auditor de Lote Multi-Linha, (2) Explorador dos 17.106 campos de `campos.sqlite3` com Raio-X no hover, (3) Simulador de Fatura Mensal + Motor de 2.267 eventos MCBS Brasil e 10.914 linhas Visa VSS traduzidas em PT-BR, e (4) Catálogo dos 11 manuais técnicos.",
        features: [
          "Aba 1 (Parser Studio + Lote Multi-Linha): Inspecione cada byte ou cole um lote inteiro Base II / MPE / Elo para validar valores e downgrades",
          "Aba 2 (17.106 Campos): Busca por DE, PDS, Posição de Byte, TC/TCR ou Tabela MPE com Raio-X ao passar o mouse",
          "Aba 3 (Simulador de Fatura + 13.181 Fees): Projete o custo mensal da fatura MCBS/VSS e consulte todas as alíquotas com explicação em português",
          "Aba 4 (Arquitetura): Mapa completo dos 11 manuais técnicos indexados e matriz operacional de ponta a ponta"
        ],
        dataSources: [
          "campos.sqlite3 (17.106 registros)",
          "Manual MCBS - Billing - BRAZIL.pdf (2.267 eventos)",
          "Visa VSS Billing Lines (10.914 linhas)",
          "11 Manuais Técnicos 2026"
        ],
        roles: ["Adquirente", "Emissor", "Subcredenciador", "Backoffice"],
        keywords: ["gcms", "mpe", "mcbs", "base ii", "vss", "elo", "tc05", "tc46", "ip0040t1", "1740", "campos", "parser", "lote"],
        url: "/compliance/arquivos",
        badge: "17.106 Campos + Simulador Fatura",
        iconName: "Database",
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
        iconName: "Terminal",
        color: "text-purple-400 bg-purple-500/10 border-purple-500/20"
      },
      {
        id: "emv-tvr",
        title: "Decodificador EMV & TVR Bit-a-Bit (DE 55 Tag 95)",
        desc: "Analisador hexadecimal interativo dos 5 bytes (40 bits) do Terminal Verification Results (TVR) no chip EMV.",
        whatItIs:
          "Ferramenta de engenharia de terminal (POS/Pinpad) e autorização para decodificar em tempo real o valor hexadecimal da Tag 95 (TVR) dentro do DE 55. Revela cada bit ligado (Offline SDA/DDA failed, Expired Application, PIN Try Limit Exceeded, Floor Limit Exceeded).",
        features: [
          "Decodificação interativa bit-a-bit dos 5 bytes do TVR (Tag 95) a partir de qualquer string Hex",
          "Explicação do impacto de cada bit na decisão de aprovação/negação do Emissor",
          "Presets de cenários reais de falha de chip, fallback e PIN bloqueado"
        ],
        dataSources: ["EMVCo Book 3 Specification", "emv-tvr.json", "DE 55 Integrated Circuit Card System Data"],
        roles: ["Adquirente", "Emissor", "Subcredenciador"],
        keywords: ["emv", "tvr", "tag 95", "de 55", "chip", "pinpad", "hex", "bit"],
        url: "/compliance/emv",
        badge: "TVR 40-Bit Decoder",
        iconName: "Cpu",
        color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20"
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
        iconName: "Cpu",
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
        iconName: "Terminal",
        color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
      },
      {
        id: "comparativo",
        title: "Comparativo Arquitetural: Visa Base II vs Mastercard IPM vs Elo",
        desc: "De-para técnico lado a lado de estruturas de clearing, códigos de transação e relatórios de liquidação.",
        whatItIs:
          "Tabela de equivalência (De-Para) para arquitetos e engenheiros de pagamentos comparando como Visa (Base II TC/TCR), Mastercard (IPM MTI/DE/PDS) e Elo (Base II Elo) representam os mesmos eventos de compra, estorno, disputa e tarifa.",
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
        iconName: "Layers",
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
        dataSources: ["ISO 8583 Specification", "de-fields.json", "iso-impact-map.json"],
        roles: ["Adquirente", "Emissor", "Subcredenciador"],
        keywords: ["dicionario", "iso 8583", "de", "pds", "bit", "emv", "de 55"],
        url: "/compliance/campos",
        badge: "Dicionário DE/PDS",
        iconName: "Cpu",
        color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20"
      },
      {
        id: "visa-infra",
        title: "Infraestrutura VisaNet: Base I, Base II, EAS & VTS",
        desc: "Topologia técnica dos sistemas de autorização online (Base I), clearing batch (Base II), Extended Auth e STIP.",
        whatItIs:
          "Estudo arquitetural da infraestrutura global e nacional da Visa (VisaNet), detalhando a conexão via Extended Access Server (EAS), processamento Stand-In (STIP), janelas de corte do Base II e relatórios VSS.",
        features: [
          "Diferença operacional e técnica entre Base I (VIP Dual Message) e Base II (Clearing Batch)",
          "Funcionamento do Stand-In Processing (STIP) quando o emissor perde conectividade",
          "Integração nativa com Visa Token Service (VTS) e Visa Resolve Online (VROL)"
        ],
        dataSources: ["visa-infra.json", "visa-manual-detalhado.json", "VisaNet Technical Manuals"],
        roles: ["Adquirente", "Emissor", "Backoffice"],
        keywords: ["visanet", "base i", "base ii", "eas", "stip", "visa infra"],
        url: "/compliance/visa-infra",
        badge: "Arquitetura VisaNet",
        iconName: "Globe",
        color: "text-blue-400 bg-blue-500/10 border-blue-500/20"
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
        iconName: "Globe",
        color: "text-teal-400 bg-teal-500/10 border-teal-500/20"
      }
    ]
  },
  {
    category: "3. Produtos, Modalidades, MCCs, Tokenização & Credenciais (CIT/MIT, SoftPOS, Push Payments)",
    subtitle: "Explorador de MCCs, tokenização VTS/MDES, credenciais armazenadas, AFT/OCT, Quasi-Cash/Bets, DAF e cartões corporativos.",
    iconName: "Layers",
    tools: [
      {
        id: "mcc-explorer",
        title: "Explorador Completo de MCCs, Categorias & Regras de Risco",
        desc: "Busca em centenas de códigos MCC (ISO 18245) com classificação de intercâmbio, alto risco (BRAM) e incentivos.",
        whatItIs:
          "Motor de pesquisa de Merchant Category Codes (MCC). Identifica para cada ramo de atividade se há programa de incentivo de intercâmbio (ex.: Supermercados 5411, Postos 5541, Educação 8211/8299), exigência de registro prévio ou monitoramento de alto risco.",
        features: [
          "Busca instantânea por número do MCC (ex: 5411, 5812, 7995, 6051) ou nome do segmento em português",
          "Indicação de elegibilidade a programas de incentivo de intercâmbio e tetos especiais",
          "Sinalização de MCCs de Alto Risco (High-Risk / BRAM / GBPP) que exigem cadastro especial na bandeira"
        ],
        dataSources: ["mcc-list.json", "ISO 18245", "Tabelas de MCC Visa / Mastercard / Elo"],
        roles: ["Adquirente", "Emissor", "Subcredenciador", "Regulatório"],
        keywords: ["mcc", "5411", "7995", "segmento", "ramo", "de 18", "incentivo"],
        url: "/compliance/mcc",
        badge: "Catálogo MCC",
        iconName: "Search",
        color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
      },
      {
        id: "tokenizacao",
        title: "Tokenização de Rede (Visa VTS & Mastercard MDES)",
        desc: "Arquitetura de Network Tokens, criptogramas TAVV/DSRP, gestão de ciclo de vida (LCM) e benefício no intercâmbio.",
        whatItIs:
          "Guia técnico sobre substituição do PAN real por Tokens de Rede (EMV Payment Tokenization). Explica como carteiras NFC (Apple Pay, Google Pay) e cofres de e-commerce geram criptogramas dinâmicos, elevam a aprovação em +3% a +6% e evitam sobretaxas de credencial não-tokenizada.",
        features: [
          "Fluxo completo de Token Requestor, Token Service Provider (TSP) e validação de criptograma TAVV no Emissor",
          "Atualização automática de cartão expirado/reemitido via Token Lifecycle Management (sem perder recorrência)",
          "Diferença de Scheme Fees e Intercâmbio entre transações PAN vs Network Token"
        ],
        dataSources: ["EMV Payment Tokenization Spec", "Visa VTS / Mastercard MDES Guidelines"],
        roles: ["Adquirente", "Emissor", "Subcredenciador"],
        keywords: ["tokenizacao", "vts", "mdes", "token", "tavv", "dsrp", "apple pay", "google pay"],
        url: "/compliance/tokenizacao",
        badge: "VTS & MDES",
        iconName: "ShieldCheck",
        color: "text-blue-400 bg-blue-500/10 border-blue-500/20"
      },
      {
        id: "credenciais",
        title: "Credenciais Armazenadas (Stored Credentials: CIT vs MIT)",
        desc: "Regras obrigatórias para Card-on-File, assinaturas, recorrência e encadeamento via Transaction ID (TID).",
        whatItIs:
          "Especificação normativa do Stored Credential Framework das bandeiras. Mostra como sinalizar corretamente a primeira transação iniciada pelo portador (CIT — Cardholder Initiated) e as cobranças subsequentes iniciadas pelo lojista (MIT — Merchant Initiated) vinculadas pelo Network Transaction ID.",
        features: [
          "Mapeamento exato dos indicadores CIT Inicial vs MIT Subsequente (Unscheduled COF, Recurring, Installment)",
          "Obrigatoriedade de enviar o Transaction ID (TID / DE 48 PDS 0105 / Visa TCR 5) da primeira autorização",
          "Como evitar recusas do emissor (Response Code 57/62/82) e multas de não-conformidade em assinaturas"
        ],
        dataSources: ["stored-credentials.json", "Visa Stored Credential Mandate", "Mastercard CIT/MIT Rules"],
        roles: ["Adquirente", "Emissor", "Subcredenciador"],
        keywords: ["credenciais", "cit", "mit", "card on file", "cof", "recorrencia", "assinatura", "tid"],
        url: "/compliance/credenciais",
        badge: "CIT & MIT Framework",
        iconName: "Layers",
        color: "text-purple-400 bg-purple-500/10 border-purple-500/20"
      },
      {
        id: "daf",
        title: "DAF — Dynamic Authentication Framework & Exceções 3DS",
        desc: "Regras do programa brasileiro de Autenticação Dinâmica (DAF), Data Only e otimização de conversão no e-commerce.",
        whatItIs:
          "Análise detalhada do Dynamic Authentication Framework (DAF) e programas de otimização de autenticação no Brasil, explicando quando o emissor assume o risco silenciosamente e como equilibrar segurança antifraude com taxa de conversão.",
        features: [
          "Funcionamento do fluxo Frictionless vs Challenge vs Data Only no Brasil",
          "Regras de qualificação de intercâmbio associadas ao uso de autenticação dinâmica",
          "Boas práticas para emissores e credenciadoras maximizarem aprovação sem explodir fraude"
        ],
        dataSources: ["Regras DAF Brasil", "Manuais EMV 3DS & Identity Check"],
        roles: ["Adquirente", "Emissor", "Subcredenciador"],
        keywords: ["daf", "dynamic authentication", "data only", "3ds", "conversao"],
        url: "/compliance/daf",
        badge: "DAF & Conversão",
        iconName: "ShieldCheck",
        color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20"
      },
      {
        id: "aft-push",
        title: "AFT (Account Funding Transactions) & Carregamento de Contas",
        desc: "Regras técnicas para funding de carteiras digitais, contas de pagamento, corretoras e remessas.",
        whatItIs:
          "Dossiê técnico sobre Account Funding Transactions (AFT — quando um cartão é usado para carregar saldo em outra conta ou carteira, e não para comprar uma mercadoria comum). Detalha os indicadores obrigatórios de Processing Code e BAI (Business Application Identifier).",
        features: [
          "Preenchimento obrigatório de BAI (Business Application Identifier — ex: AA, BI, PP, FT) e dados do remetente/destinatário",
          "Regras de intercâmbio específicas para AFT e restrições de uso de cartão de crédito",
          "Obrigações de PLD/FT (Prevenção à Lavagem de Dinheiro) na mensagem ISO"
        ],
        dataSources: ["push-payments.json", "Visa Direct / AFT Guide", "Mastercard Funding Transactions Manual"],
        roles: ["Adquirente", "Emissor", "Subcredenciador", "Regulatório"],
        keywords: ["aft", "account funding", "bai", "carregamento", "carteira", "funding"],
        url: "/compliance/aft",
        badge: "AFT & BAI",
        iconName: "DollarSign",
        color: "text-blue-400 bg-blue-500/10 border-blue-500/20"
      },
      {
        id: "payouts",
        title: "Push Payments, OCT (Visa Direct) & Mastercard Send",
        desc: "Transferência instantânea de fundos para cartões (Original Credit Transactions / Fast Funds em até 30 min).",
        whatItIs:
          "Arquitetura de pagamentos reversos (Push Payments): como enviar dinheiro diretamente para o PAN de um cartão de débito/pré-pago/crédito usando Visa Direct (OCT) e Mastercard Send (Payment Transaction), com disponibilidade Fast Funds.",
        features: [
          "Estrutura da mensagem OCT (TC 06 / MTI 0200 Payment) e obrigação de disponibilização em até 30 minutos (Fast Funds)",
          "Casos de uso: saques de plataformas/marketplaces, sinistros de seguros, reembolsos instantâneos e P2P",
          "Tarifas de intercâmbio reverso e Scheme Fees de Visa Direct / MC Send"
        ],
        dataSources: ["push-payments.json", "Visa Direct Original Credit Transaction Manual", "Mastercard Send Spec"],
        roles: ["Adquirente", "Emissor", "Subcredenciador"],
        keywords: ["payouts", "push payments", "oct", "visa direct", "mastercard send", "fast funds", "tc 06"],
        url: "/compliance/payouts",
        badge: "Visa Direct & MC Send",
        iconName: "ArrowRight",
        color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
      },
      {
        id: "quasicash",
        title: "Quasi-Cash, Criptoativos & Apostas Regulamentadas (Bets / MCC 7995)",
        desc: "Regras de bloqueio de crédito em apostas no Brasil, MCCs 6051/7995 e exigências de registro de alto risco.",
        whatItIs:
          "Painel normativo para transações de Quasi-Cash (compra de moeda estrangeira, criptoativos, fichas) e Apostas de Quota Fixa (Bets — MCC 7995). Cobre a proibição regulatória de uso de cartão de crédito para apostas no Brasil (Portaria SPA/MF e ABECS) e controles de MCC 6051.",
        features: [
          "Regras de bloqueio de cartão de crédito e pré-pago de terceiros no MCC 7995 (Apostas/Bets no Brasil)",
          "Exigências de identificação de transação Quasi-Cash (MCC 6051 / 6012) e limites do emissor",
          "Prevenção a multas milionárias de BRAM / GBPP por miscoding de MCC em jogos e cripto"
        ],
        dataSources: ["quasicash-rules.json", "Portarias SPA/MF Bets", "Regras ABECS & Bandeiras MCC 7995/6051"],
        roles: ["Adquirente", "Emissor", "Subcredenciador", "Regulatório"],
        keywords: ["quasicash", "bets", "apostas", "7995", "6051", "cripto", "jogos"],
        url: "/compliance/quasicash",
        badge: "Bets 7995 & Quasi-Cash",
        iconName: "AlertTriangle",
        color: "text-amber-400 bg-amber-500/10 border-amber-500/20"
      },
      {
        id: "softpos",
        title: "SoftPOS / Tap to Phone (CPoC & MPoC)",
        desc: "Requisitos de certificação PCI MPoC, indicadores de terminal POS Entry Mode e regras de captura NFC em smartphones.",
        whatItIs:
          "Guia técnico para transformar celulares Android/iOS em terminais de captura contactless (Tap to Phone / SoftPOS) sem hardware adicional. Detalha os padrões PCI CPoC/MPoC, atestação de segurança e flags específicas na mensagem ISO 8583.",
        features: [
          "Sinalização correta de SoftPOS no DE 22 (POS Entry Mode 07/91), DE 60 e DE 48 para qualificar como Card Present",
          "Requisitos de segurança PCI MPoC (Mobile Payments on COTS) e captura de PIN em tela (PIN on Glass)",
          "Regras de Visa Tap to Phone e Mastercard Tap on Phone"
        ],
        dataSources: ["softpos.json", "PCI SSC MPoC Standard", "Visa Tap to Phone Implementation Guide"],
        roles: ["Adquirente", "Subcredenciador"],
        keywords: ["softpos", "tap to phone", "mpoc", "cpoc", "nfc", "celular", "pin on glass"],
        url: "/compliance/softpos",
        badge: "Tap to Phone & MPoC",
        iconName: "Terminal",
        color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20"
      },
      {
        id: "visa-business",
        title: "Soluções Comerciais, Cartões Corporativos & Dados Nível 2 / Nível 3",
        desc: "Qualificação de cartões B2B, Corporate, Purchasing, Agro e envio de dados fiscais (Level 2/3) em intercâmbio comercial.",
        whatItIs:
          "Dossiê sobre produtos comerciais e corporativos (Cartão Empresarial, Corporate, Purchasing, Frota e Agro). Explica a estrutura de intercâmbio diferenciada do segmento B2B e os dados aprimorados de fatura.",
        features: [
          "Regras de intercâmbio e qualificação para cartões Comerciais/Corporativos no Brasil",
          "Estrutura de dados adicionais (Enhanced Data Level 2 / Level 3) no clearing",
          "Casos de uso de pagamento a fornecedores B2B e capital de giro"
        ],
        dataSources: ["Tabelas Comerciais Visa / Mastercard / Elo"],
        roles: ["Adquirente", "Emissor", "Subcredenciador"],
        keywords: ["comercial", "corporativo", "b2b", "business", "agro", "level 2", "level 3"],
        url: "/compliance/visa-business",
        badge: "Cartões B2B & Corporate",
        iconName: "DollarSign",
        color: "text-blue-400 bg-blue-500/10 border-blue-500/20"
      }
    ]
  },
  {
    category: "4. Inteligência Regulatória, Releases (381), Cross-Border & Acervo (35.336 Manuais)",
    subtitle: "Motor de busca nos 35.336 documentos oficiais, radar de 381 boletins técnicos e governança de liquidação internacional.",
    iconName: "Database",
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
        iconName: "Cpu",
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
        iconName: "Globe",
        color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20"
      },
      {
        id: "cross-border",
        title: "Regras de Transações Cross-Border, DCC & Multi-Moeda",
        desc: "Arquitetura de transações internacionais, Dynamic Currency Conversion (DCC), ISA/Cross-Border Fees e localização de adquirente.",
        whatItIs:
          "Guia especializado nas regras de adquirência e emissão internacional: proibições de Cross-Border Acquiring sem licença local, regras de transparência em Dynamic Currency Conversion (DCC) e tarifas internacionais.",
        features: [
          "Regras de jurisdição do estabelecimento comercial (Merchant Location) vs país do adquirente",
          "Requisitos obrigatórios de transparência e marcação de DCC nos arquivos de clearing",
          "Impacto de tarifas Cross-Border (ISA Visa e Cross-Border Assessment Mastercard)"
        ],
        dataSources: ["cross-border.json", "Visa International Transaction Guide", "Mastercard Cross-Border Rules"],
        roles: ["Adquirente", "Emissor", "Subcredenciador", "Regulatório"],
        keywords: ["cross-border", "dcc", "internacional", "moeda", "isa", "fx"],
        url: "/compliance/cross-border",
        badge: "Cross-Border & DCC",
        iconName: "Globe",
        color: "text-blue-400 bg-blue-500/10 border-blue-500/20"
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
        iconName: "BookOpen",
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
        dataSources: ["consultas-publicas.json", "Resoluções BCB nº 150 e 304"],
        roles: ["Adquirente", "Emissor", "Subcredenciador", "Regulatório"],
        keywords: ["bacen", "consulta publica", "resolucao 304", "teto", "regulatorio"],
        url: "/consultas",
        badge: "Regulatório Bacen",
        iconName: "FileText",
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
        iconName: "Database",
        color: "text-slate-300 bg-slate-500/10 border-slate-500/20"
      }
    ]
  },
  {
    category: "5. Compliance, Riscos, BRAM, MATCH, PCI v4.0, Disputas & Conciliação CIP",
    subtitle: "PayFacs, conciliação 3-Way, CIP/SLC, BRAM, MATCH, PCI-DSS v4.0, TPE, retentativas, 3DS 2.2 e Chargebacks.",
    iconName: "ShieldCheck",
    tools: [
      {
        id: "subcredenciadores",
        title: "Arquitetura de Subcredenciadores (PayFac), Relatórios MCBS & Catálogo",
        desc: "Regras DE 48 SE 37, Dataset ID 56, Bit 43/58 Elo, backlog TN3A/AB111010 e inventário catalogo.xlsx (35.336 SHA256).",
        whatItIs:
          "Módulo especializado para Adquirentes que habilitam Subcredenciadores (PayFacs) e para próprios Subcredenciadores. Detalha o preenchimento obrigatório de identificação do sublojista nas 3 bandeiras, limites de volume anual e conciliação na CIP.",
        features: [
          "Especificação campo a campo: Mastercard DE 48 SE 37 / PDS 0208, Visa Dataset ID 56, Elo Bit 43/58/60",
          "Mapeamento de relatórios de faturamento MCBS e taxas de registro de PayFac (PFM)",
          "Explorador do inventário criptográfico `catalogo.xlsx` com 35.336 hashes SHA256"
        ],
        dataSources: ["subcredenciadores-catalogo.json", "Circular BCB 3.885 / Res. 150", "catalogo.xlsx"],
        roles: ["Adquirente", "Subcredenciador", "Regulatório"],
        keywords: ["payfac", "subcredenciador", "facilitador", "de 48", "se 37", "dataset 56", "catalogo"],
        url: "/compliance/subcredenciadores",
        badge: "PayFac + 35k SHA256",
        iconName: "ShieldCheck",
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
        iconName: "Scale",
        color: "text-amber-400 bg-amber-500/10 border-amber-500/20"
      },
      {
        id: "cip-slc",
        title: "Liquidação Centralizada CIP / SLC (Nuclea) & Mensagens ASLC",
        desc: "Funcionamento das grades de liquidação multilateral (ASLC022, ASLC023, ASLC033), domicílio bancário e registradoras.",
        whatItIs:
          "Módulo dedicado à infraestrutura brasileira de liquidação centralizada na CIP/Nuclea (SLC) e integração com registradoras de recebíveis (CERC, TAG, B3, Nuclea). Explica o fluxo de arquivos ASLC e liquidação no STR.",
        features: [
          "Fluxo operacional das grades de crédito (ASLC022), débito (ASLC023) e antecipação (ASLC033)",
          "Interação entre Adquirentes, Subcredenciadores, Instituições Domicílio e Registradoras de Recebíveis (Res. BCB 264)",
          "Janelas horárias de envio, aceite e liquidação financeira no STR"
        ],
        dataSources: ["Manuais Operacionais SLC/CIP Nuclea", "Resolução BCB 150 / 264"],
        roles: ["Adquirente", "Emissor", "Subcredenciador", "Backoffice"],
        keywords: ["cip", "slc", "nuclea", "aslc", "recebiveis", "registradora", "str"],
        url: "/compliance/cip",
        badge: "CIP / SLC Nuclea",
        iconName: "Scale",
        color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20"
      },
      {
        id: "bram",
        title: "BRAM & GBPP: Monitoramento de Risco da Marca e Multas",
        desc: "Regras do Mastercard Business Risk Assessment and Mitigation (BRAM) e Visa Global Brand Protection Program (GBPP).",
        whatItIs:
          "Dossiê crítico sobre as infrações mais graves do ecossistema de adquirência: transações ilegais, miscoding de MCC (ocultar apostas/adulto/cripto em MCC genérico), agregação não autorizada (laundering de sublojista) e venda de produtos proibidos.",
        features: [
          "Tabela de penalidades e multas de BRAM / GBPP (que chegam a centenas de milhares de dólares por ocorrência)",
          "Como auditar sublojistas para detectar Transaction Laundering e Miscoding de MCC",
          "Regras de cadastro prévio para farmácias online, jogos/apostas, conteúdo adulto e telemarketing"
        ],
        dataSources: ["bram-rules.json", "Mastercard BRAM Manual", "Visa GBPP Rules"],
        roles: ["Adquirente", "Subcredenciador", "Regulatório"],
        keywords: ["bram", "gbpp", "miscoding", "laundering", "multa", "alto risco"],
        url: "/compliance/bram",
        badge: "BRAM & GBPP",
        iconName: "AlertTriangle",
        color: "text-rose-400 bg-rose-500/10 border-rose-500/20"
      },
      {
        id: "match",
        title: "Sistema MATCH & VMAS: Banco de Lojistas Descredenciados",
        desc: "Códigos de razão MATCH (01 a 14), obrigatoriedade de consulta no onboarding e inclusão em até 5 dias úteis.",
        whatItIs:
          "Guia operacional do sistema MATCH (Member Alert to Control High-Risk Merchants) da Mastercard e VMAS da Visa. Detalha a obrigação de toda credenciadora consultar o CNPJ/CPF dos sócios antes de ativar um lojista e quando incluir um lojista fraudador.",
        features: [
          "Catálogo completo dos Reason Codes do MATCH (Account Data Compromise, Excessive Chargebacks, Fraud, Collusion, BRAM)",
          "Regras de responsabilidade solidária e multa para o adquirente que deixar de consultar ou incluir no MATCH",
          "Processo de apelação e remoção de registro indevido"
        ],
        dataSources: ["match-codes.json", "match-reasons.json", "Mastercard MATCH Manual"],
        roles: ["Adquirente", "Subcredenciador", "Regulatório"],
        keywords: ["match", "vmas", "terminated merchant", "onboarding", "descredenciado", "fraude"],
        url: "/compliance/match",
        badge: "MATCH & VMAS",
        iconName: "ShieldCheck",
        color: "text-amber-400 bg-amber-500/10 border-amber-500/20"
      },
      {
        id: "programas-monitoria",
        title: "Programas de Monitoramento de Fraude & Chargeback (VAMP, VFMP, VDMP, ECM, AFM)",
        desc: "Limiares de basis points (bps), contagem mínima de disputas, períodos de carência e planos de remediação.",
        whatItIs:
          "Calculadora e guia dos programas de monitoramento de bandeira: a unificação no novo Visa Acquirer Monitoring Program (VAMP) e os programas Mastercard Excessive Chargeback Merchant (ECM / HECM) e Excessive Fraud Merchant (EFM).",
        features: [
          "Tabela exata de thresholds (limiares em % e quantidade mínima de transações/disputas por mês)",
          "Como o novo Visa VAMP soma TC 40 (Fraude) + TC 15 (Disputas) em um único indicador",
          "Impacto de alertas de pré-disputa (RDR / Ethoca / CDRN) na redução do índice"
        ],
        dataSources: ["compliance-programs.json", "Visa VAMP Guide", "Mastercard Security Rules"],
        roles: ["Adquirente", "Emissor", "Subcredenciador", "Regulatório"],
        keywords: ["programas", "vamp", "vdmp", "vfmp", "ecm", "hecm", "efm", "tc 40"],
        url: "/compliance/programas",
        badge: "VAMP, ECM & EFM",
        iconName: "ShieldCheck",
        color: "text-blue-400 bg-blue-500/10 border-blue-500/20"
      },
      {
        id: "pci-v4",
        title: "PCI-DSS v4.0: Requisitos Técnicos, P2PE e Escopo de Dados",
        desc: "Mudanças obrigatórias do PCI-DSS v4.0, criptografia de ponta a ponta (P2PE), proteção de scripts de checkout e auditoria.",
        whatItIs:
          "Painel de conformidade de segurança da informação PCI-DSS v4.0 para adquirentes, subcredenciadores e lojistas. Destaca os novos controles obrigatórios contra skimming digital (Magecart / Requisito 6.4.3 e 11.6.1) e tokenização para redução de escopo.",
        features: [
          "Comparativo das mudanças críticas do PCI-DSS v3.2.1 para o v4.0",
          "Proteção de páginas de pagamento e-commerce contra injeção de scripts maliciosos",
          "Estratégias de desescopo usando Tokenização e criptografia DUKPT / P2PE"
        ],
        dataSources: ["pci-v4-changes.json", "PCI SSC Data Security Standard v4.0"],
        roles: ["Adquirente", "Emissor", "Subcredenciador", "Regulatório"],
        keywords: ["pci", "pci-dss", "v4.0", "p2pe", "seguranca", "criptografia"],
        url: "/compliance/pci",
        badge: "PCI-DSS v4.0",
        iconName: "Lock",
        color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
      },
      {
        id: "tpe-mastercard",
        title: "Mastercard TPE (Transaction Processing Excellence) & MAC Codes",
        desc: "Regras de qualidade de mensageria de autorização, Merchant Advice Codes (MAC) e prevenção a multas de processamento.",
        whatItIs:
          "Guia focado no programa Mastercard Transaction Processing Excellence (TPE) e nos Merchant Advice Codes (DE 48 PDS 0084 / MAC 01, 02, 03, 21), que instruem o adquirente quando retentar ou interromper cobranças recorrentes.",
        features: [
          "Significado operacional de cada Merchant Advice Code (MAC 01 New Account Info, MAC 02 Try Again Later, MAC 03 Do Not Try Again, MAC 21 Cancelled)",
          "Regras de higiene de dados na autorização que evitam taxas de Data Integrity",
          "Alinhamento entre DE 39 Response Code e MAC Code para motores de recorrência"
        ],
        dataSources: ["mastercard-tpe.json", "mac-codes.json", "Mastercard Authorization Manual"],
        roles: ["Adquirente", "Emissor", "Subcredenciador"],
        keywords: ["tpe", "mac", "merchant advice code", "pds 0084", "mastercard", "retentativa"],
        url: "/compliance/tpe",
        badge: "TPE & MAC Codes",
        iconName: "RefreshCw",
        color: "text-purple-400 bg-purple-500/10 border-purple-500/20"
      },
      {
        id: "retentativas",
        title: "Matriz de Retentativas & Response Codes (DE 39)",
        desc: "Regras do Visa Smart Retries e Mastercard TPE para evitar multas por excesso de tentativas em Hard Declines.",
        whatItIs:
          "Classificador normativo de códigos de retorno da autorização (ISO DE 39). Separa códigos de Hard Decline (proibido retentar imediatamente, sob pena de multa por tentativa nas bandeiras) de Soft Declines (permitido retentar dentro da janela regulamentar).",
        features: [
          "Classificação completa dos Response Codes DE 39 em Categorias 1, 2, 3 e 4",
          "Cálculo de exposição a multas de retentativa excessiva (acima de 15 tentativas em 30 dias)",
          "Recomendações de lógica de Smart Retry para motores de recorrência e e-commerce"
        ],
        dataSources: ["retentativas.json", "Visa Art. 2.11 Retry Rules", "Mastercard TPE Rules"],
        roles: ["Adquirente", "Emissor", "Subcredenciador"],
        keywords: ["retentativas", "retries", "de 39", "response code", "hard decline", "soft decline"],
        url: "/compliance/retentativas",
        badge: "Smart Retries",
        iconName: "RefreshCw",
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
        iconName: "ShieldCheck",
        color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
      },
      {
        id: "risco-operacional",
        title: "Gestão de Risco Financeiro, Colateral & Default no Arranjo",
        desc: "Arquitetura de garantias, risco de crédito do lojista/subcredenciador, chargeback futuro e liquidação garantida.",
        whatItIs:
          "Painel de engenharia de risco financeiro para adquirentes, subcredenciadores e emissores. Aborda o cálculo de exposição a chargebacks futuros (Delivery Delay / Parcelado), exigência de garantias pelas bandeiras e proteção contra insolvência.",
        features: [
          "Modelagem de exposição financeira por atraso de entrega (Delivery Lag) e vendas parceladas",
          "Mecanismos de trava de agenda de recebíveis na registradora e reserva financeira (Rolling Reserve)",
          "Regras de Settlement Risk das bandeiras e do Banco Central"
        ],
        dataSources: ["Resolução BCB 150", "Visa & Mastercard Credit Settlement Risk Rules"],
        roles: ["Adquirente", "Emissor", "Subcredenciador", "Backoffice"],
        keywords: ["risco", "colateral", "garantia", "rolling reserve", "insolvencia"],
        url: "/compliance/risco",
        badge: "Risco & Colateral",
        iconName: "AlertTriangle",
        color: "text-amber-400 bg-amber-500/10 border-amber-500/20"
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
        iconName: "DollarSign",
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
        dataSources: ["dispute-codes.json", "Visa Dispute Management Guidelines", "Mastercard Chargeback Guide"],
        roles: ["Adquirente", "Emissor", "Subcredenciador", "Backoffice", "Regulatório"],
        keywords: ["chargeback", "disputas", "vrol", "mcom", "ce 3.0", "compelling evidence", "1442", "10.4", "4837"],
        url: "/compliance/disputas",
        badge: "Disputas & CE 3.0",
        iconName: "AlertTriangle",
        color: "text-red-400 bg-red-500/10 border-red-500/20"
      },
      {
        id: "hub-compliance",
        title: "Hub Central Panorâmico de Compliance",
        desc: "Visão consolidada de todos os dossiês regulatórios, programas de bandeira e trilhas operacionais.",
        whatItIs:
          "Índice executivo de todos os módulos de compliance das bandeiras e do Banco Central, permitindo navegar rapidamente por tema regulatório.",
        features: [
          "Visão unificada de governança para Adquirentes, Emissores e Subcredenciadores",
          "Atalhos rápidos para cada subdomínio do rulebook",
          "Resumo executivo de obrigações regulatórias"
        ],
        dataSources: ["Visa Core Rules", "Mastercard Rules", "Regulamento Elo"],
        roles: ["Adquirente", "Emissor", "Subcredenciador", "Regulatório"],
        keywords: ["compliance", "hub", "rulebook", "central"],
        url: "/compliance",
        badge: "Central Compliance",
        iconName: "ShieldCheck",
        color: "text-blue-400 bg-blue-500/10 border-blue-500/20"
      }
    ]
  },
  {
    category: "6. Estúdio Executivo, Mapas Gráficos & Base de Conhecimento",
    subtitle: "Editor de pareceres técnicos com IA, atlas visual de liquidação, grafo de conceitos e artigos estratégicos.",
    iconName: "BookOpen",
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
        iconName: "FileText",
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
        iconName: "Globe",
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
        iconName: "Layers",
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
        dataSources: ["mapa-conhecimento.json", "Base Conceitual Bandeiras & Meios de Pagamento"],
        roles: ["Adquirente", "Emissor", "Subcredenciador", "Backoffice", "Regulatório"],
        keywords: ["grafo", "mapa", "conceitos", "conhecimento"],
        url: "/mapa",
        badge: "Grafo 39 Conceitos",
        iconName: "Globe",
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
        dataSources: ["trilhas.json", "Currículo Técnico de Meios de Pagamento"],
        roles: ["Adquirente", "Emissor", "Subcredenciador", "Backoffice", "Regulatório"],
        keywords: ["trilhas", "aprendizado", "treinamento", "estudo"],
        url: "/trilhas",
        badge: "Trilhas Guiadas",
        iconName: "BookOpen",
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
        iconName: "FileText",
        color: "text-slate-300 bg-slate-500/10 border-slate-500/20"
      }
    ]
  }
];

export const ALL_ADMIN_TOOLS: ToolCardMeta[] = ADMIN_MODULE_CATEGORIES.flatMap((c) => c.tools);

export interface QuickTechnicalItem {
  code: string;
  title: string;
  category: string;
  summary: string;
  url: string;
}

export const QUICK_TECHNICAL_SHORTCUTS: QuickTechnicalItem[] = [
  {
    code: "2AB1006",
    title: "Mastercard MCBS · Autorização Doméstica Card Present (BRL 0,0272)",
    category: "Evento MCBS",
    summary: "Cobrado do Adquirente por mensagem de autorização doméstica aprovada/processada no Brasil.",
    url: "/compliance/arquivos?tab=billing"
  },
  {
    code: "2AB1009",
    title: "Mastercard MCBS · Autorização Cross-Border / Internacional (BRL 0,1814)",
    category: "Evento MCBS",
    summary: "Cobrado do Adquirente quando o cartão é emitido fora do Brasil (SAMEA/APAC/Global).",
    url: "/compliance/arquivos?tab=billing"
  },
  {
    code: "5B1107045",
    title: "Visa VSS · Acquirer Marketing & Service Fee (Crédito Doméstico)",
    category: "Visa VSS Line",
    summary: "Taxa de serviço trimestral/mensal cobrada do Adquirente sobre o volume doméstico de crédito liquidado.",
    url: "/compliance/arquivos?tab=billing"
  },
  {
    code: "IP0040T1",
    title: "Tabela Mastercard MPE (194 Bytes) · Account Range & Roteamento de BIN",
    category: "Tabela MPE / T068",
    summary: "Define faixa inicial/final de BIN, GCMS Product ID (MCW/MPL/MDS), País (BRA/986) e regras de roteamento.",
    url: "/compliance/arquivos?tab=parser"
  },
  {
    code: "TC 05 · TCR 0",
    title: "Visa Base II · Draft Data Principal (168 Bytes)",
    category: "Layout Base II",
    summary: "Registro financeiro de compra no clearing Visa. Posição 168 define o Reimbursement Attribute (Qualificação vs Downgrade).",
    url: "/compliance/arquivos?tab=parser"
  },
  {
    code: "TC 46 · VSS-140",
    title: "Visa Base II · Relatório de Liquidação e Scheme Fees (168 Bytes)",
    category: "Liquidação Visa VSS",
    summary: "Transporta os totais financeiros do VSS-110, intercâmbio VSS-120 e encargos de bandeira VSS-140.",
    url: "/compliance/arquivos?tab=parser"
  },
  {
    code: "DE 48 · PDS 0158",
    title: "Mastercard IPM · Interchange Rate Designator (IRD)",
    category: "Campo ISO / IPM",
    summary: "Tag que carrega o código de 2 caracteres do IRD aplicado à transação no MTI 1240.",
    url: "/compliance/arquivos?tab=campos"
  },
  {
    code: "DE 48 · SE 37",
    title: "Mastercard / Visa Dataset 56 · Identificação de Subcredenciador (PayFac)",
    category: "Regra PayFac",
    summary: "Campos obrigatórios para enviar Payment Facilitator ID, Sub-Merchant ID e CNPJ do sublojista.",
    url: "/compliance/subcredenciadores"
  },
  {
    code: "DE 55 · Tag 95",
    title: "EMV Terminal Verification Results (TVR — 5 Bytes / 40 Bits)",
    category: "Chip EMV",
    summary: "Mapa de bits gerado pelo terminal POS indicando o status da autenticação offline, PIN e limites do chip.",
    url: "/compliance/emv"
  },
  {
    code: "MCC 7995 / 5411",
    title: "Explorador de MCCs (Supermercados 5411, Apostas/Bets 7995, Quasi-Cash 6051)",
    category: "Tabela MCC",
    summary: "Consulte alíquotas incentivadas por MCC e restrições regulatórias de alto risco (proibição de crédito em Bets).",
    url: "/compliance/mcc"
  }
];
