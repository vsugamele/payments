"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  Search,
  Calculator,
  ShieldAlert,
  DollarSign,
  Layers,
  Activity,
  FileText,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Info,
  TrendingUp,
  Coins,
  Lock,
  Scale,
  Building,
  Shuffle,
  Smartphone,
  ChevronRight,
  BookOpen
} from "lucide-react";

// --- DADOS ---

type Row = {
  criterio: string;
  mastercard: string;
  visa: string;
  elo: string;
  alerta?: "crit" | "warn" | "new" | null;
};

const comparativoGeral: Row[] = [
  {
    criterio: "Denominação oficial",
    mastercard: "Payment Facilitator (PF) / Facilitador de Pagamentos",
    visa: "Payment Facilitator (PF) / Master Merchant / Merchant Aggregator",
    elo: "Subcredenciador / Facilitador de Pagamento",
  },
  {
    criterio: "Descrição resumida",
    mastercard: "Provedor de serviços registrado por um adquirente para facilitar transações entre o adquirente e Subestabelecimentos (sub-ECs). Única categoria autorizada a possuir ou controlar fundos de liquidação (conforme AN 6495).",
    visa: "Agente terceiro que: (1) assina contrato de aceitação de EC em nome do adquirente e/ou (2) recebe e distribui recursos de liquidação em nome do sub-EC. Aplica-se globalmente a todos os ambientes (F2F, online, account-on-file).",
    elo: "Subcredenciador que capta transações em nome de estabelecimentos comerciais afiliados dentro dos Arranjos de Pagamento Elo.",
  },
  {
    criterio: "Processo de certificação",
    mastercard: "Registro do PF (Service Provider Registration) + onboarding + verificações de compliance com o Banco Central, acompanhado pelo setor jurídico da Mastercard.",
    visa: "Registro como TPA (Third-Party Agent) via PRM (Program Request Management) no Visa Access. Due diligence completo obrigatório ANTES do registro.",
    elo: "Processo com 5 trilhas obrigatórias: Negociação, Compliance/Segurança da Informação, SoftDescriptor, PVTE (ECs físicos) e CIP (se aplicável).",
    alerta: "warn",
  },
  {
    criterio: "Portal / Plataforma",
    mastercard: "Mastercard Connect -> My Company Manager -> Related Companies -> Manage Service Providers. PF pode demorar até 48h para ser ativado.",
    visa: "Visa Access -> Operations -> Program Request Management (PRM) no site visaonline.com. Brasil: PF deve celebrar acordo diretamente com a Visa ANTES de prestar qualquer serviço.",
    elo: "Seja um Facilitador via elo.com.br. Envio de dados e contrato assinado via e-mail corporativo (aceitacaofacilitadores@elo.com.br).",
  },
  {
    criterio: "Identificador emitido",
    mastercard: "PF ID (Payment Facilitator ID) - alfanumérico. Deve corresponder ao Company ID do Service Provider no Mastercard Connect.",
    visa: "Identificador exclusivo de PF emitido pela Visa, atribuído pelo adquirente a cada PF.",
    elo: "ID-Subcredenciador disponibilizado pela Elo após assinatura eletrônica do contrato.",
  },
  {
    criterio: "Validação pós-registro",
    mastercard: "Validação obrigatória em até 30 dias após o registro, e depois anualmente. Renovação automática (desregistrar antes de 30/junho para evitar cobrança).",
    visa: "Recertificação anual obrigatória de que as informações não sofreram alterações materiais. Informar a Visa imediatamente sobre qualquer mudança material.",
    elo: "Não detalhado especificamente nos manuais padrão da Elo analisados.",
  },
  {
    criterio: "Limite para contrato direto",
    mastercard: "USD 10.000.000 em volume anual combinado Mastercard + Maestro. Aumentado de USD 1M para USD 10M pela AN 6495 (vigente em 07/12/2023, BACEN 12/09/2023).",
    visa: "USD 1.000.000 em volume anual de transações Visa. Nota: Não aplicável ao Brasil (LAC) para exigência de contrato direto (regras locais de Marketplace).",
    elo: "Não há limite de volume explicitamente definido para contrato direto na Elo.",
    alerta: "new",
  },
  {
    criterio: "Quando o limite é superado",
    mastercard: "PF deve registrar-se como Network Enablement Partner (NEP). Sub-EC assina contrato diretamente com o adquirente. PF pode continuar gerenciando se exceções forem atendidas.",
    visa: "Adquirente deve celebrar contrato comercial direto com o sub-EC em até 2 anos. PF pode continuar prestando serviços de processamento/split.",
    elo: "Não aplicável.",
  },
  {
    criterio: "ID em Transações (Mensageria)",
    mastercard: "Autorização: DE 48 SE 37 SF1 (PF ID) e SF3 (Sponsored Merchant ID). Clearing: PDS 0208 SF1 deve corresponder exatamente ao DE 48.",
    visa: "Autorização: ID do PF + ID sub-EC obrigatórios. Clearing (BASE II): apenas ID do PF é obrigatório no record. Brasil pode enviar ID do PF + ID sub-EC ou CNPJ.",
    elo: "Não detalhado especificamente nos manuais padrão da Elo analisados (exige identificação do Subcredenciador na captura).",
  },
  {
    criterio: "Soft Descriptor / Nome",
    mastercard: "Formato OBRIGATORIO: [Nome do PF]*[Nome do sub-EC] (asterisco * como separador). Subfield 10 indica Entidade de Parcelamento (3=Facilitador).",
    visa: "Soft Descriptor OBRIGATÓRIO no recibo contendo o nome do PF e do sub-EC claramente identificados para reduzir chargebacks.",
    elo: "SoftDescriptor OBRIGATÓRIO. Trilha de homologação específica exigida pela Elo antes de ir para produção.",
    alerta: "new",
  },
  {
    criterio: "Prazos de Repasse (Brasil)",
    mastercard: "Remessas conforme ciclo normal de liquidação. Sem prazos máximos específicos de repasse definidos no regulamento geral da bandeira.",
    visa: "Região LAC (Brasil): Crédito: máximo 32 dias da data de processamento. Demais: máximo 5 dias. (CP 522 propõe D+0 para sub-ECs).",
    elo: "Repasse via liquidação centralizada CIP seguindo o prazo regulatório vigente do BACEN.",
  },
  {
    criterio: "Monitoramento de sub-ECs",
    mastercard: "Obrigatório uso de solução de monitoramento em e-commerce. Revisão mensal de no mínimo 5% dos novos sub-ECs integrados. Relatório trimestral (Formulário 1235).",
    visa: "PF deve garantir conformidade com as regras da Visa. Acesso obrigatório ao VMSS (Visa Merchant Screening Service) para checagem cadastral.",
    elo: "Envio DIÁRIO da base cadastral de todos os estabelecimentos que capturam transações Elo. Tratamento direto de divergências com o credenciador.",
    alerta: "crit",
  },
  {
    criterio: "PCI DSS / Segurança",
    mastercard: "Nível 1 (>300k tx/ano): ROC anual por QSA + ASV. Nível 2 (<=300k tx): SAQ anual. Attestation of Compliance (AOC) enviado para pcireports@mastercard.com.",
    visa: "PF deve garantir que os sub-ECs cumpram PCI DSS e PA-DSS em seus softwares e infraestruturas.",
    elo: "Trilha de Compliance e Segurança da Informação é requisito obrigatório na homologação para habilitação em produção.",
  },
  {
    criterio: "Cláusulas do Contrato",
    mastercard: "Contrato deve refletir que o PF atua como agente do adquirente identificado e não pode interferir no direito de rescisão das partes ou da bandeira.",
    visa: "Cláusulas de conformidade com as regras Visa, direito de rescisão imediata por fraude/justa causa, responsabilidade financeira do PF e proibição de sub-sub PFs.",
    elo: "O contrato com o subcredenciador deve contemplar todos os requerimentos de mensageria, segurança e liquidação da Elo.",
  },
];

const comparativoMarketplace: Row[] = [
  {
    criterio: "Definição de Marketplace",
    mastercard: "Subcategoria de PF. Plataforma que oferece bens/serviços de múltiplos vendedores, facilita transações e recebe pagamentos em nome deles. Registrado como Service Provider.",
    visa: "Modelo de negócio que conecta compradores e vendedores. Deve ser aprovado pela Visa. Acordo direto com a Visa é OBRIGATÓRIO para operar no Brasil.",
    elo: "Subcredenciador que opera conectando múltiplos estabelecimentos (vendedores), aplicando o fluxo de captura de transações.",
  },
  {
    criterio: "Transações Presenciais (CP)",
    mastercard: "Permitido transações Card-Present (físicas) para Marketplace com registro adequado e controle de conformidade do adquirente.",
    visa: "PROIBIDO: Marketplace NÃO pode processar transações presenciais em nome de terceiros. Exceção: somente se o próprio Marketplace for o vendedor legal da mercadoria.",
    elo: "Permitido desde que as credenciais e homologação PVTE (estabelecimentos físicos) estejam ativas.",
    alerta: "crit",
  },
  {
    criterio: "Split de Pagamento",
    mastercard: "Permitido, desde que a identificação de cada sub-EC seja mantida nas transações e toda a mensageria de clearing esteja correta.",
    visa: "Permitido. Cada sub-EC vendedor deve ser identificado e pago dentro dos prazos da região LAC (32 dias crédito, 5 dias débito/outros no Brasil).",
    elo: "Permitido, com liquidação final via CIP respeitando as regras de agenda do Banco Central.",
  },
  {
    criterio: "MCCs Proibidos / Restrições",
    mastercard: "MCCs de alto risco sob programas como BRAM/QMAP. Jogos de azar (gambling) requerem aprovação explícita e registro especial.",
    visa: "MCCs Proibidos para PFs e Marketplaces: 5912 (Farmácias online), 7841 (Indicação de farmácias online) e Outbound Telemarketers (telemarketing ativo).",
    elo: "Restrições padrão de risco sob análise de compliance e segurança do credenciador Elo.",
    alerta: "warn",
  },
  {
    criterio: "Staged Digital Wallet (SDWO)",
    mastercard: "Staged Digital Wallet Operator (SDWO) é proibido como sub-EC de PF, salvo sob condições estritas de volume anual (USD 10M).",
    visa: "Categoria separada. SDWO não pode operar como sub-EC de um PF comum. DWO Identifier exclusivo emitido pela Visa é obrigatório em autorizações e clearing.",
    elo: "Não detalhado especificamente nos manuais padrão analisados.",
  },
  {
    criterio: "DWO Identifier (Vigência BR)",
    mastercard: "Não aplicável.",
    visa: "Vigência a partir de 18 de ABRIL de 2026 no Brasil (Visa Business News AI15262). A não conformidade pode resultar na rejeição das transações pela Visa.",
    elo: "Não aplicável.",
    alerta: "crit",
  },
  {
    criterio: "Ramp Provider (Fiat-to-Crypto)",
    mastercard: "Sem definição específica ou identificador próprio nos manuais analisados.",
    visa: "Nova entidade sob AI15262. Facilita conversão de fiat para cripto. Deve obter identificador exclusivo da Visa (ID# 0031031) desde outubro de 2025.",
    elo: "Não aplicável.",
    alerta: "new",
  },
];

type MccException = {
  mcc: string;
  descricao: string;
  mastercard: boolean;
  visa: boolean;
  observacao: string;
};

const mccExceptions: MccException[] = [
  { mcc: "4900", descricao: "Serviços Públicos e Utilidades (água, luz, tel)", mastercard: true, visa: true, observacao: "Utilidades gerais" },
  { mcc: "6012", descricao: "Inst. Financeiras - Venda de Dinheiro e Serviços", mastercard: true, visa: true, observacao: "Bancos, parcelamentos" },
  { mcc: "6051", descricao: "Quase-Dinheiro, Compra de Moeda, Cripto/Exchanges", mastercard: false, visa: true, observacao: "Visa isenta exchanges/cripto; Mastercard exige contrato direto se volume > USD 10M" },
  { mcc: "6513", descricao: "Operadores de Edifícios (imóveis, aluguéis)", mastercard: true, visa: true, observacao: "Imóveis residenciais" },
  { mcc: "8011", descricao: "Médicos - Clínicas e Consultórios", mastercard: true, visa: true, observacao: "Serviços médicos" },
  { mcc: "8050", descricao: "Casas de Repouso e Cuidados de Longo Prazo", mastercard: true, visa: true, observacao: "Saúde continuada" },
  { mcc: "8062", descricao: "Hospitais", mastercard: true, visa: true, observacao: "Hospitais gerais e especiais" },
  { mcc: "8099", descricao: "Serviços de Saúde - Outros", mastercard: true, visa: true, observacao: "Laboratórios, exames" },
  { mcc: "8211", descricao: "Escolas Primárias e Secundárias", mastercard: true, visa: true, observacao: "Ensino básico" },
  { mcc: "8220", descricao: "Faculdades, Universidades e Escolas Técnicas", mastercard: true, visa: true, observacao: "Ensino superior" },
  { mcc: "8241", descricao: "Escolas por Correspondência", mastercard: true, visa: true, observacao: "EAD" },
  { mcc: "8244", descricao: "Escolas de Comércio e Secretariado", mastercard: true, visa: true, observacao: "Cursos profissionais" },
  { mcc: "8249", descricao: "Escolas Vocacionais e Técnicas", mastercard: true, visa: true, observacao: "Formação técnica" },
  { mcc: "8299", descricao: "Escolas e Serviços Educacionais - Outros", mastercard: true, visa: true, observacao: "Cursos diversos" },
  { mcc: "9311", descricao: "Tributos e Impostos Governamentais", mastercard: true, visa: true, observacao: "Taxas e impostos" },
  { mcc: "9211", descricao: "Custas Judiciais (Pensões Alimentícias)", mastercard: false, visa: true, observacao: "Visa isenta; Mastercard exige contrato se passar de USD 10M" },
  { mcc: "9222", descricao: "Multas Governamentais", mastercard: false, visa: true, observacao: "Visa isenta; Mastercard exige contrato se passar de USD 10M" },
  { mcc: "9223", descricao: "Fianças Governamentais", mastercard: false, visa: true, observacao: "Visa isenta; Mastercard exige contrato se passar de USD 10M" },
];

const cp522Rules: Row[] = [
  {
    criterio: "Escopo e Base Legal",
    mastercard: "Resolução BCB Nº 522/2025 regulamenta o modelo no Brasil. Mastercard submeteu 5 manuais focando em risco de crédito, liquidez, processamento e segurança.",
    visa: "Resolução BCB Nº 522/2025 regulamenta. Visa submeteu 3 manuais focando em liquidação para subcredenciadores, riscos financeiros e critérios de participação.",
    elo: "Resolução BCB Nº 522/2025 regulamenta. Elo submeteu 1 manual integrando novas taxas, PER e responsabilidade residual de repasse.",
  },
  {
    criterio: "Threshold de Participação",
    mastercard: "Volume anual de R$ 5.000.000.000 (5 bilhões) no arranjo. Tiers T1 (menor risco) a T4 (maior risco) com obrigações escalonadas.",
    visa: "Volume anual de R$ 5.000.000.000 (5 bilhões) no arranjo. 180 dias para conformidade total com o Sistema de Liquidação Centralizado (SLC/CIP).",
    elo: "Volume anual de R$ 5.000.000.000 (5 bilhões). Participação obrigatória no modelo centralizado para os subcredenciadores que excederem o limiar.",
  },
  {
    criterio: "Exigências de Entrada",
    mastercard: "Registro obrigatório no Banco Central antes de operar. Classificação de risco inicial pela bandeira e adquirente. Auditoria periódica obrigatória.",
    visa: "Acordo direto com a Visa é MANDATÓRIO no Brasil antes de processar qualquer transação comercial.",
    elo: "Cobrança da nova Tarifa de Adesão: R$ 688.737,36 de pagamento único no arranjo no momento da assinatura do contrato.",
    alerta: "crit",
  },
  {
    criterio: "Liquidação SLC/CIP",
    mastercard: "SLC via CIP obrigatório para PFs acima do limiar, garantindo rastreabilidade do trânsito de fundos e vedação de operações não conformes.",
    visa: "SLC/CIP obrigatório após 180 dias do estouro do limite. Liquidação direta ao sub-EC via CIP, mitigando o risco de retenção inadequada.",
    elo: "Uso obrigatório da CIP. Adquirente deixa de ser responsável pelo risco de repasse do subcredenciador na CIP (conforme CP 522).",
    alerta: "warn",
  },
  {
    criterio: "Segregação e Garantias",
    mastercard: "Segregação patrimonial obrigatória entre fundos próprios do PF e fundos destinados ao pagamento de sub-ECs.",
    visa: "CONTA ESCROW obrigatória para reter recebíveis + CESSÃO FIDUCIÁRIA de recebíveis como garantia adicional para proteger sub-ECs em caso de insolvência do PF.",
    elo: "Programa de Eleição de Recebíveis (PER) estendido a subcredenciadores. Sub-ECs elegem recebíveis específicos para cessão fiduciária.",
    alerta: "new",
  },
  {
    criterio: "Prazos de Repasse propostos",
    mastercard: "Normalmente D+1 para débito e ciclo padrão para crédito. A regulamentação do BACEN pode forçar prazos menores.",
    visa: "Visa propõe D+0 para repasse ao sub-EC após a implementação do modelo centralizado (SLC/CIP). Prazo atual é de 32 dias crédito e 5 dias débito.",
    elo: "Elo estabelece prazo de 30 dias para a recomposição de garantias financeiras no arranjo caso ocorram anomalias.",
    alerta: "new",
  },
  {
    criterio: "Responsabilidade pelo Repasse",
    mastercard: "Adquirente (IAP) permanece responsável residual pelo compliance do PF, mas a classificação T1-T4 ajusta o nível de supervisão.",
    visa: "Adquirente responde pelo compliance do PF e celebra acordos diretos. Escrow e cessão fiduciária protegem o sub-EC e limitam o risco da adquirente.",
    elo: "MUDANÇA SIGNIFICATIVA: O Credenciador deixa de ser responsável pelo risco de repasse do subcredenciador ao sub-EC na CIP. Risco passa ao próprio Subcredenciador.",
    alerta: "crit",
  },
  {
    criterio: "Envio de Informações",
    mastercard: "Controle via Relatório Trimestral de Atividade (Formulário 1235) enviado via Mastercard Connect.",
    visa: "Declarações semestrais de volume (em 30/04 e 31/10) enviadas à Visa e ao BACEN. Auditoria Visa a qualquer momento.",
    elo: "Envio DIÁRIO da base cadastral de estabelecimentos comerciais (ECs) para monitoramento do arranjo e repasse de informações ao BACEN.",
  },
  {
    criterio: "Novas Tarifas Operacionais",
    mastercard: "Não aplicável sob a ótica de taxas específicas de CP 522 nos manuais analisados.",
    visa: "Não aplicável sob a ótica de taxas específicas de CP 522 nos manuais analisados.",
    elo: "Tarifa mensal TES (Tarifa de Emissão e Suporte) baseada no rating de risco da entidade (Rating A: 0,009%; B: 0,019%; C: 0,039%; D: 0,059% ao mês).",
    alerta: "new",
  },
];

type V2Rule = {
  categoria: string;
  requisito: string;
  visa: boolean;
  mastercard: boolean;
  elo: boolean;
  amex: boolean;
  nota: string;
};

const v2Rules: V2Rule[] = [
  {
    categoria: "GESTÃO DE RISCO",
    requisito: "Relativização da Responsabilidade Residual do IAP (Credenciador)",
    visa: true,
    mastercard: true,
    elo: true,
    amex: true,
    nota: "Todos incluem: IAP não é o último responsável residual automático.",
  },
  {
    categoria: "GESTÃO DE RISCO",
    requisito: "Cessão fiduciária obrigatória dos recebíveis ao IAP",
    visa: true,
    mastercard: false,
    elo: false,
    amex: false,
    nota: "EXCLUSIVIDADE VISA: sub-EC cede recebíveis como garantia ao IAP.",
  },
  {
    categoria: "GESTÃO DE RISCO",
    requisito: "Conta Escrow obrigatória para sub-ECs",
    visa: true,
    mastercard: false,
    elo: false,
    amex: false,
    nota: "EXCLUSIVIDADE VISA: retenção dos recebíveis em conta segregada.",
  },
  {
    categoria: "GESTÃO DE RISCO",
    requisito: "Cobrança de tarifa por risco (TES)",
    visa: false,
    mastercard: false,
    elo: true,
    amex: false,
    nota: "EXCLUSIVIDADE ELO: tarifa mensal baseada em rating (A-D) sobre o volume transacionado.",
  },
  {
    categoria: "GESTÃO DE RISCO",
    requisito: "Reporte de liquidação fora do SLC",
    visa: true,
    mastercard: true,
    elo: true,
    amex: true,
    nota: "Todos exigem reporte caso a liquidação ocorra fora da CIP.",
  },
  {
    categoria: "CHARGEBACK",
    requisito: "Vedação de abertura de Falência e Insolvência Civil por sub-EC",
    visa: true,
    mastercard: true,
    elo: true,
    amex: true,
    nota: "Proibido credenciamento de estabelecimentos em processo falimentar.",
  },
  {
    categoria: "CHARGEBACK",
    requisito: "Vedação de abertura de Recuperação Judicial (RJ) por sub-EC",
    visa: false,
    mastercard: true,
    elo: false,
    amex: false,
    nota: "EXCLUSIVIDADE MASTERCARD: sub-EC em RJ não pode ser credenciado.",
  },
  {
    categoria: "CHARGEBACK",
    requisito: "Prazo máximo de abertura de disputa: 180 dias",
    visa: true,
    mastercard: true,
    elo: true,
    amex: true,
    nota: "Prazo regulatório unificado para abertura de chargebacks.",
  },
  {
    categoria: "PLD-CFT",
    requisito: "Transmissão de dados cadastrais completos dos usuários finais",
    visa: true,
    mastercard: true,
    elo: true,
    amex: true,
    nota: "Exigência de KYC e envio dos dados de sub-ECs e portadores.",
  },
  {
    categoria: "PLD-CFT",
    requisito: "Comunicação de reports de atividades suspeitas ao COAF",
    visa: true,
    mastercard: true,
    elo: true,
    amex: false,
    nota: "AMEX: única bandeira que não exige comunicação ao COAF no escopo desta regulamentação.",
  },
  {
    categoria: "SUBCREDENCIADOR",
    requisito: "Vedação ao credenciamento de sub-ECs High Risk",
    visa: true,
    mastercard: false,
    elo: false,
    amex: false,
    nota: "EXCLUSIVIDADE VISA: proibe credenciamento de sub-ECs listados em alto risco.",
  },
  {
    categoria: "TARIFAS",
    requisito: "Criação de novas tarifas no arranjo em Consulta Pública",
    visa: false,
    mastercard: false,
    elo: true,
    amex: true,
    nota: "Somente Elo (Adesão de R$ 688k + TES) e Amex regulamentaram tarifas na CP 522.",
  },
];

export default function FacilitadoresClient() {
  const [activeTab, setActiveTab] = useState<"geral" | "marketplace" | "mcc" | "cp522" | "v2">("geral");
  const [mccSearch, setMccSearch] = useState("");
  
  // States calculadora Elo TES
  const [eloVolume, setEloVolume] = useState<number>(10000000); // R$ 10.000.000 padrão
  const [eloRating, setEloRating] = useState<"A" | "B" | "C" | "D">("B");

  const ratingRates = {
    A: 0.00009, // 0,009%
    B: 0.00019, // 0,019%
    C: 0.00039, // 0,039%
    D: 0.00059, // 0,059%
  };

  const computeEloFees = () => {
    const monthlyTES = eloVolume * ratingRates[eloRating];
    const annualTES = monthlyTES * 12;
    const flatAdesao = 688737.36;
    const firstYearTotal = flatAdesao + annualTES;

    return {
      monthlyTES,
      annualTES,
      flatAdesao,
      firstYearTotal
    };
  };

  const { monthlyTES, annualTES, flatAdesao, firstYearTotal } = computeEloFees();

  const filteredMccs = mccExceptions.filter(
    (item) =>
      item.mcc.includes(mccSearch) ||
      item.descricao.toLowerCase().includes(mccSearch.toLowerCase()) ||
      item.observacao.toLowerCase().includes(mccSearch.toLowerCase())
  );

  const getAlertaBadge = (tipo: Row["alerta"]) => {
    if (!tipo) return null;
    if (tipo === "crit") {
      return (
        <span className="inline-flex items-center gap-1 text-[8px] font-bold bg-red-500/10 border border-red-500/25 text-red-400 px-1.5 py-0.5 rounded">
          <ShieldAlert size={10} /> CRÍTICO
        </span>
      );
    }
    if (tipo === "warn") {
      return (
        <span className="inline-flex items-center gap-1 text-[8px] font-bold bg-amber-500/10 border border-amber-500/25 text-amber-400 px-1.5 py-0.5 rounded">
          <AlertCircle size={10} /> ATENÇÃO
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[8px] font-bold bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 px-1.5 py-0.5 rounded">
        <CheckCircle2 size={10} /> NOVO / EXCLUSIVO
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-[#030711] text-slate-100 pb-24">
      {/* Glow de fundo */}
      <div
        aria-hidden
        className="absolute top-0 left-0 right-0 h-[500px] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(99,102,241,0.12) 0%, transparent 80%), radial-gradient(ellipse 40% 40% at 80% 20%, rgba(139,92,246,0.06) 0%, transparent 60%)",
        }}
      />

      <div className="mx-auto max-w-7xl px-6 py-12 pt-28 relative z-10">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
          <Link href="/" className="hover:text-slate-300 transition-colors">Início</Link>
          <span>/</span>
          <Link href="/comparativo" className="hover:text-slate-300 transition-colors">Comparativo</Link>
          <span>/</span>
          <span className="text-slate-300 font-medium">Facilitadores e Regulação</span>
        </div>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold tracking-wide uppercase mb-3">
              <Lock size={12} /> Compliance & Regulatório
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              Regras de Facilitadores & <span className="text-indigo-400">CP 522 BACEN</span>
            </h1>
            <p className="text-slate-400 text-sm mt-3 max-w-3xl leading-relaxed">
              Mapeamento regulatório avançado baseado no manual de regras de adquirentes e nas resoluções vigentes do Banco Central do Brasil (Res. BCB 522/2025). Compare limites de volume, exceções de MCCs, regras de split, e as novas tarifas Elo.
            </p>
          </div>
          
          <Link 
            href="/comparativo"
            className="inline-flex items-center gap-2 text-xs bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-850 px-4 py-2.5 rounded-xl transition-all font-semibold shrink-0"
          >
            <ChevronLeft size={14} /> Voltar para BASE II vs IPM
          </Link>
        </div>

        {/* Grid de Informações Rápidas e Alertas Críticos */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          <div className="bg-[#0b1329]/60 border border-slate-900 rounded-2xl p-5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 text-amber-400">
              <ShieldAlert size={20} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Urgente: DWO Identifier</h3>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Visa AI15262 exige o envio de identificadores exclusivos para Staged Digital Wallets (SDWO) a partir de <strong>18 de abril de 2026</strong> sob risco de rejeição imediata de transações.
              </p>
            </div>
          </div>

          <div className="bg-[#0b1329]/60 border border-slate-900 rounded-2xl p-5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0 text-red-400">
              <DollarSign size={20} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Nova Adesão Elo CP 522</h3>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                A Elo cobra uma tarifa fixa de adesão ao arranjo de <strong>R$ 688.737,36</strong> para novos subcredenciadores, além de taxas mensais baseadas em ratings de risco (TES).
              </p>
            </div>
          </div>

          <div className="bg-[#0b1329]/60 border border-slate-900 rounded-2xl p-5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0 text-indigo-400">
              <Coins size={20} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Aumento de Limite AN 6495</h3>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Mastercard aumentou o threshold para contrato direto de <strong>USD 1M para USD 10M</strong>. Acima desse volume anual combinado, o sub-EC assina contrato direto com o adquirente.
              </p>
            </div>
          </div>
        </div>

        {/* Navegação de Abas */}
        <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-slate-900 mb-8 overflow-x-auto gap-1">
          {[
            { id: "geral", label: "Comparativo Geral", icon: Layers },
            { id: "marketplace", label: "Marketplace, SDWO & Ramp", icon: Shuffle },
            { id: "mcc", label: "MCCs de Exceção", icon: Search },
            { id: "cp522", label: "Consulta CP 522 BACEN", icon: Activity },
            { id: "v2", label: "Matriz CP 522 V2", icon: FileText },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 text-xs font-bold px-4 py-3 rounded-xl whitespace-nowrap transition-all uppercase tracking-wider ${
                  active
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/10"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/50"
                }`}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Conteúdo das Abas */}
        <div className="space-y-8">
          
          {/* ABA 1: COMPARATIVO GERAL */}
          {activeTab === "geral" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-2 text-xs text-indigo-400 font-semibold mb-2">
                <Info size={14} /> Comparativo básico de regras para Payment Facilitators nas três principais bandeiras.
              </div>
              
              <div className="overflow-x-auto rounded-2xl border border-slate-900 bg-[#070d19]/40">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-900 bg-slate-950/80">
                      <th className="px-6 py-4 font-bold text-slate-400 uppercase tracking-wider w-[220px]">Critério</th>
                      <th className="px-6 py-4 font-bold text-red-400 uppercase tracking-wider w-[280px]">Mastercard</th>
                      <th className="px-6 py-4 font-bold text-blue-400 uppercase tracking-wider w-[280px]">Visa</th>
                      <th className="px-6 py-4 font-bold text-emerald-400 uppercase tracking-wider w-[280px]">Elo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900/60">
                    {comparativoGeral.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-950/20 transition-colors">
                        <td className="px-6 py-4 font-semibold text-slate-300 align-top flex flex-col gap-2">
                          {row.criterio}
                          {row.alerta && getAlertaBadge(row.alerta)}
                        </td>
                        <td className="px-6 py-4 text-slate-400 leading-relaxed align-top">{row.mastercard}</td>
                        <td className="px-6 py-4 text-slate-400 leading-relaxed align-top">{row.visa}</td>
                        <td className="px-6 py-4 text-slate-400 leading-relaxed align-top">{row.elo}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* ABA 2: MARKETPLACE, SDWO & RAMP */}
          {activeTab === "marketplace" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-400 leading-relaxed">
                <strong>Atenção operacional Visa:</strong> O modelo de marketplace na Visa possui restrições severas. A captura de transações presenciais (Card-Present) em nome de terceiros é expressamente <strong>proibida</strong> pela Visa (sendo permitida apenas se a plataforma for a vendedora jurídica dos itens).
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-900 bg-[#070d19]/40">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-900 bg-slate-950/80">
                      <th className="px-6 py-4 font-bold text-slate-400 uppercase tracking-wider w-[220px]">Critério</th>
                      <th className="px-6 py-4 font-bold text-red-400 uppercase tracking-wider w-[280px]">Mastercard</th>
                      <th className="px-6 py-4 font-bold text-blue-400 uppercase tracking-wider w-[280px]">Visa</th>
                      <th className="px-6 py-4 font-bold text-emerald-400 uppercase tracking-wider w-[280px]">Elo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900/60">
                    {comparativoMarketplace.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-950/20 transition-colors">
                        <td className="px-6 py-4 font-semibold text-slate-300 align-top flex flex-col gap-2">
                          {row.criterio}
                          {row.alerta && getAlertaBadge(row.alerta)}
                        </td>
                        <td className="px-6 py-4 text-slate-400 leading-relaxed align-top">{row.mastercard}</td>
                        <td className="px-6 py-4 text-slate-400 leading-relaxed align-top">{row.visa}</td>
                        <td className="px-6 py-4 text-slate-400 leading-relaxed align-top">{row.elo}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* ABA 3: MCCS DE EXCEÇÃO */}
          {activeTab === "mcc" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-white font-bold text-lg">Buscador de MCCs de Exceção</h3>
                  <p className="text-slate-400 text-xs mt-1">
                    Estes MCCs estão isentos da obrigatoriedade de contrato direto com o adquirente, mesmo que o volume anual do subestabelecimento exceda os limites da bandeira (Visa: USD 1M / MC: USD 10M).
                  </p>
                </div>
                
                {/* Campo de Busca */}
                <div className="relative w-full md:w-80">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 pointer-events-none">
                    <Search size={14} />
                  </span>
                  <input
                    type="text"
                    placeholder="Buscar por MCC ou descrição..."
                    value={mccSearch}
                    onChange={(e) => setMccSearch(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              {/* Tabela de Exceções de MCC */}
              <div className="overflow-x-auto rounded-2xl border border-slate-900 bg-[#070d19]/40">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-900 bg-slate-950/80">
                      <th className="px-6 py-4 font-bold text-slate-400 uppercase tracking-wider w-[100px]">MCC</th>
                      <th className="px-6 py-4 font-bold text-slate-400 uppercase tracking-wider w-[240px]">Descrição</th>
                      <th className="px-6 py-4 font-bold text-red-400 uppercase tracking-wider text-center w-[120px]">Mastercard (14)</th>
                      <th className="px-6 py-4 font-bold text-blue-400 uppercase tracking-wider text-center w-[120px]">Visa (18)</th>
                      <th className="px-6 py-4 font-bold text-slate-400 uppercase tracking-wider">Diferença / Observação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900/60">
                    {filteredMccs.length > 0 ? (
                      filteredMccs.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-950/20 transition-colors">
                          <td className="px-6 py-4 font-mono font-bold text-white align-top">{item.mcc}</td>
                          <td className="px-6 py-4 text-slate-300 font-medium align-top">{item.descricao}</td>
                          <td className="px-6 py-4 text-center align-top">
                            {item.mastercard ? (
                              <span className="inline-flex items-center justify-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">ISENTO</span>
                            ) : (
                              <span className="inline-flex items-center justify-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-500 border border-slate-700">EXIGE CT</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-center align-top">
                            {item.visa ? (
                              <span className="inline-flex items-center justify-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">ISENTO</span>
                            ) : (
                              <span className="inline-flex items-center justify-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-500 border border-slate-700">EXIGE CT</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-slate-400 leading-relaxed align-top">{item.observacao}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                          Nenhum MCC encontrado para a busca "{mccSearch}".
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* ABA 4: CONSULTA PÚBLICA CP 522 */}
          {activeTab === "cp522" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8"
            >
              
              {/* Tabela Regulamentação CP 522 */}
              <div className="lg:col-span-8 space-y-6">
                <div>
                  <h3 className="text-white font-bold text-lg">Impactos da Consulta Pública CP 522 / Res. BCB 522/2025</h3>
                  <p className="text-slate-400 text-xs mt-1">
                    Análise técnica dos 9 documentos normativos submetidos pelas bandeiras para regulamentar subcredenciadores no Sistema Financeiro Nacional.
                  </p>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-slate-900 bg-[#070d19]/40">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-900 bg-slate-950/80">
                        <th className="px-6 py-4 font-bold text-slate-400 uppercase tracking-wider w-[180px]">Requisito CP 522</th>
                        <th className="px-6 py-4 font-bold text-red-400 uppercase tracking-wider w-[240px]">Mastercard (5 docs)</th>
                        <th className="px-6 py-4 font-bold text-blue-400 uppercase tracking-wider w-[240px]">Visa (3 docs)</th>
                        <th className="px-6 py-4 font-bold text-emerald-400 uppercase tracking-wider w-[240px]">Elo (1 doc)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900/60">
                      {cp522Rules.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-950/20 transition-colors">
                          <td className="px-6 py-4 font-semibold text-slate-300 align-top flex flex-col gap-2">
                            {row.criterio}
                            {row.alerta && getAlertaBadge(row.alerta)}
                          </td>
                          <td className="px-6 py-4 text-slate-400 leading-relaxed align-top">{row.mastercard}</td>
                          <td className="px-6 py-4 text-slate-400 leading-relaxed align-top">{row.visa}</td>
                          <td className="px-6 py-4 text-slate-400 leading-relaxed align-top">{row.elo}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Widget Calculadora Elo TES */}
              <div className="lg:col-span-4 space-y-6">
                <div className="bg-[#0b1329]/80 border border-slate-850 rounded-[2rem] p-6 space-y-6 sticky top-28">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase mb-2">
                      <Calculator size={10} /> Simulador Financeiro Elo CP 522
                    </div>
                    <h3 className="text-white font-bold text-md">Calculadora de Custos TES</h3>
                    <p className="text-slate-400 text-[11px] mt-1.5 leading-relaxed">
                      Simule o custo operacional da nova Tarifa de Emissão e Suporte (TES) cobrada mensalmente pela Elo, além do custo de adesão.
                    </p>
                  </div>

                  {/* Volume Mensal */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex justify-between">
                      <span>Volume Mensal Elo (R$)</span>
                      <span className="text-indigo-400 font-mono">R$ {eloVolume.toLocaleString("pt-BR")}</span>
                    </label>
                    <input
                      type="range"
                      min={1000000}
                      max={100000000}
                      step={1000000}
                      value={eloVolume}
                      onChange={(e) => setEloVolume(Number(e.target.value))}
                      className="w-full accent-indigo-500"
                    />
                    <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                      <span>R$ 1M</span>
                      <span>R$ 50M</span>
                      <span>R$ 100M</span>
                    </div>
                  </div>

                  {/* Rating de Risco */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Rating de Risco do Subcredenciador
                    </label>
                    <div className="grid grid-cols-4 bg-slate-950 p-1 rounded-xl border border-slate-800">
                      {(["A", "B", "C", "D"] as const).map((r) => (
                        <button
                          key={r}
                          onClick={() => setEloRating(r)}
                          className={`py-2 text-[10px] font-bold rounded-lg transition-all ${
                            eloRating === r
                              ? "bg-indigo-600 text-white"
                              : "text-slate-500 hover:text-slate-300"
                          }`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                    <div className="flex justify-between text-[9px] text-slate-500 px-1">
                      <span>A: 0,009%</span>
                      <span>B: 0,019%</span>
                      <span>C: 0,039%</span>
                      <span>D: 0,059%</span>
                    </div>
                  </div>

                  {/* Resultados */}
                  <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-900 space-y-3 font-mono text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>TES Mensal ({ (ratingRates[eloRating] * 100).toFixed(3) }%):</span>
                      <span className="text-white font-bold">R$ {monthlyTES.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>TES Anualizado:</span>
                      <span className="text-white font-bold">R$ {annualTES.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="border-t border-slate-900 my-2 pt-2 flex justify-between text-slate-400">
                      <span>Tarifa Adesão (Única):</span>
                      <span className="text-emerald-400 font-bold">R$ {flatAdesao.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="border-t border-slate-900 my-2 pt-2 flex justify-between text-sm">
                      <span className="text-slate-300 font-sans font-semibold">Custo 1º Ano (Adesão + TES):</span>
                      <span className="text-indigo-400 font-bold">R$ {firstYearTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                  </div>

                  <div className="text-[10px] text-slate-500 leading-normal flex items-start gap-1">
                    <Info size={12} className="shrink-0 text-slate-400 mt-0.5" />
                    <span>A TES é recalculada mensalmente com base no volume financeiro total liquidado e no rating de risco atribuído ao subcredenciador pelo credenciador Elo.</span>
                  </div>
                </div>
              </div>

            </motion.div>
          )}

          {/* ABA 5: MATRIZ CP 522 V2 */}
          {activeTab === "v2" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-2 text-xs text-indigo-400 font-semibold mb-2">
                <Info size={14} /> Mapeamento de exclusividades e alinhamento de requisitos regulatórios entre as quatro maiores bandeiras operando no Brasil sob o escopo da CP 522 do BACEN.
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-900 bg-[#070d19]/40">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-900 bg-slate-950/80">
                      <th className="px-6 py-4 font-bold text-slate-400 uppercase tracking-wider w-[140px]">Categoria</th>
                      <th className="px-6 py-4 font-bold text-slate-400 uppercase tracking-wider w-[240px]">Requisito / Tema</th>
                      <th className="px-6 py-4 font-bold text-blue-400 uppercase tracking-wider text-center w-[90px]">Visa</th>
                      <th className="px-6 py-4 font-bold text-red-400 uppercase tracking-wider text-center w-[90px]">Mastercard</th>
                      <th className="px-6 py-4 font-bold text-emerald-400 uppercase tracking-wider text-center w-[90px]">Elo</th>
                      <th className="px-6 py-4 font-bold text-orange-400 uppercase tracking-wider text-center w-[90px]">Amex</th>
                      <th className="px-6 py-4 font-bold text-slate-400 uppercase tracking-wider">Nota / Detalhe</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900/60">
                    {v2Rules.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-950/20 transition-colors">
                        <td className="px-6 py-4 font-semibold text-slate-500 align-top">{row.categoria}</td>
                        <td className="px-6 py-4 font-semibold text-slate-300 align-top">{row.requisito}</td>
                        <td className="px-6 py-4 text-center align-top">
                          {row.visa ? (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">✓</span>
                          ) : (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-800 text-slate-500 border border-slate-700">✕</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center align-top">
                          {row.mastercard ? (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">✓</span>
                          ) : (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-800 text-slate-500 border border-slate-700">✕</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center align-top">
                          {row.elo ? (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">✓</span>
                          ) : (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-800 text-slate-500 border border-slate-700">✕</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center align-top">
                          {row.amex ? (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">✓</span>
                          ) : (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-800 text-slate-500 border border-slate-700">✕</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-slate-400 leading-relaxed align-top">{row.nota}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

        </div>

        {/* Links de navegação rodapé */}
        <div className="mt-12 pt-8 border-t border-slate-900 flex flex-wrap gap-x-8 gap-y-4 text-xs font-semibold">
          <Link href="/compliance" className="text-indigo-400 hover:underline flex items-center gap-1">
            <ShieldAlert size={12} /> Ir para Hub de Compliance <ChevronRight size={10} />
          </Link>
          <Link href="/comparativo" className="text-indigo-400 hover:underline flex items-center gap-1">
            <Shuffle size={12} /> Ver Comparação de Clearing <ChevronRight size={10} />
          </Link>
          <Link href="/compliance/match" className="text-indigo-400 hover:underline flex items-center gap-1">
            <Lock size={12} /> MATCH Pro Simulator <ChevronRight size={10} />
          </Link>
          <Link href="/compliance/cip" className="text-indigo-400 hover:underline flex items-center gap-1">
            <Building size={12} /> Fluxo de Liquidação CIP / SPB <ChevronRight size={10} />
          </Link>
        </div>

      </div>
    </div>
  );
}
