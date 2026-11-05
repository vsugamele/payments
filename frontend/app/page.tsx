import Image from "next/image";
import {
  MapPin,
  Mail,
  ExternalLink,
  GraduationCap,
  Briefcase,
  CheckCircle2,
  TrendingUp,
  RefreshCw,
  ShieldCheck,
  Zap,
  Layers,
  Award,
  Rocket,
  Flame,
  FileCheck,
  FileDown,
  Globe2,
  Building2,
  Send,
  MessageCircle,
} from "lucide-react";

export const metadata = {
  title: "Vinícius Sugamele — Especialista & Head de Bandeiras · Meios de Pagamento",
  description:
    "Especialista em gestão de bandeiras e meios de pagamento com mais de 16 anos de experiência (EcommIT, Bandeira Elo, Getnet e Verifone / American Express). Atuação direta em compliance de bandeiras, certificações L3/MTIP/TQS, mandates, Data Integrity, intercâmbio e liquidação.",
};

const METRICS = [
  {
    value: "16+",
    unit: "Anos",
    label: "Experiência em Pagamentos",
    desc: "EcommIT, Bandeira Elo, Getnet e Verifone / American Express na gestão de bandeiras e operações.",
  },
  {
    value: "4",
    unit: "Bandeiras",
    label: "Compliance & Certificações",
    desc: "Atuação direta com Visa (ADVT/L3), Mastercard (MTIP), Elo (TQS) e American Express.",
  },
  {
    value: "+3.8%",
    unit: "Aprovação",
    label: "Ganho Médio em Conversão",
    desc: "Otimização em projetos de Network Tokens (VTS/MDES/Elo), 3DS, Account Updater e mensageria.",
  },
  {
    value: "30+",
    unit: "Players",
    label: "Ecossistema Atendido",
    desc: "Adquirentes, subadquirentes, bancos emissores, bandeiras globais e processadoras.",
  },
];

const ECOSYSTEM = [
  {
    title: "Adquirência, Subadquirência & Fintechs",
    badge: "Atendimento & Governança",
    partners: [
      { name: "Checkout.com", highlight: true },
      { name: "Getnet", highlight: true },
      { name: "PicPay", highlight: true },
      { name: "Mercado Pago", highlight: true },
      { name: "Banco Inter", highlight: true },
      { name: "Banco BS2", highlight: true },
      { name: "Entrepay", highlight: true },
      { name: "Cielo", highlight: false },
      { name: "Rede", highlight: false },
      { name: "Stone", highlight: false },
      { name: "PagBank", highlight: false },
    ],
  },
  {
    title: "Processadoras de Pagamento & Infraestrutura",
    badge: "Mensageria & Core",
    partners: [
      { name: "DXC Technology", highlight: true },
      { name: "AM53", highlight: true },
      { name: "Payware", highlight: true },
      { name: "Verifone", highlight: false },
      { name: "Amadeus", highlight: false },
    ],
  },
  {
    title: "Bancos Emissores & Liquidação",
    badge: "Autorização & Clearing",
    partners: [
      { name: "Banco Bradesco", highlight: true },
      { name: "Banco do Brasil", highlight: true },
      { name: "Caixa Econômica Federal", highlight: true },
    ],
  },
  {
    title: "Bandeiras & Arranjos de Pagamento",
    badge: "Releases & Rulebook",
    partners: [
      { name: "Bandeira Elo", highlight: true },
      { name: "American Express", highlight: true },
      { name: "Visa", highlight: true },
      { name: "Mastercard", highlight: true },
      { name: "Hipercard", highlight: false },
    ],
  },
];

const EXPERIENCE = [
  {
    role: "Head de Bandeiras",
    company: "EcommIT Integrated Solutions",
    period: "Out 2023 – Presente",
    duration: "Atual",
    desc: "Liderança no relacionamento técnico e de negócios com Visa, Mastercard, Elo e American Express. Referência em regras de bandeira para os times de Produto, Tecnologia, Riscos e Operações, conduzindo a governança de mandates/releases semestrais, certificações técnicas (Visa ADVT/L3, Mastercard MTIP, Elo TQS e Amex), prevenção de multas em Data Integrity, aprovação de waivers, controle de tarifas (MCBS/VSS), estratégia de Interchange e resolução de incidentes entre autorização e clearing. Atendimento direto a instituições como Checkout.com, Getnet, PicPay, Mercado Pago, Banco BS2, Banco Inter e Entrepay, além das processadoras DXC Technology, AM53 e Payware.",
    tags: [
      "Visa",
      "Mastercard",
      "Elo",
      "Amex",
      "Data Integrity",
      "Mandates & Releases",
      "Certificações L3 / MTIP",
      "Interchange",
      "Tarifas MCBS / VSS",
      "Waivers",
      "Checkout.com",
      "Getnet",
      "PicPay",
      "Mercado Pago",
      "Banco Inter",
      "Banco BS2",
      "DXC",
      "AM53",
      "Payware",
    ],
  },
  {
    role: "Especialista de Operações (Performance & Troubleshooting)",
    company: "Bandeira Elo",
    period: "Ago 2020 – Out 2023",
    duration: "3 anos",
    desc: "Atuação consultiva para maximização de taxas de aprovação e estabilidade transacional entre Emissores (Bradesco, Banco do Brasil, Caixa), Credenciadores (Cielo, Getnet, Rede, Stone, PagBank) e Processadoras. Liderança no desenvolvimento do novo Portal Elo para Adquirentes, investigação de causas-raiz de recusas e divergências entre autorização e liquidação, homologação de novos produtos (Elo TQS) e monitoramento em tempo real via Qlik Sense e Tableau.",
    tags: [
      "Bandeira Elo",
      "Autorização & Clearing",
      "Performance de Aprovação",
      "Elo TQS",
      "Qlik Sense",
      "Tableau",
      "Troubleshooting",
      "Portal Elo",
    ],
  },
  {
    role: "Analista Sênior / Coordenador de Liquidação & Bandeiras",
    company: "Getnet",
    period: "Set 2017 – Out 2020",
    duration: "3 anos",
    desc: "Gestão completa de compliance, homologação, certificação (Visa ADVT, Mastercard M-TIP, Elo TQS e Amex) e rollout dos Releases Mandatórios das bandeiras Elo, Visa, Mastercard, Amex e Hipercard. Condução técnica da criação e certificação da processadora/adquirente dedicada (Amadeus), entrega dos reportes trimestrais regulatórios às bandeiras (QMR/GMR/EIR), auditoria técnica de faturas (MCBS/VSS) junto ao Financeiro e liderança em projetos estratégicos: 3DS 2.0, ABU/VAU (Account Updater), Tokenização de Bandeira (VTS/MDES), Contactless/HCE, QR Code e Split/Marketplace.",
    tags: [
      "Getnet",
      "Compliance de Bandeiras",
      "Releases & Mandates",
      "Certificação Host Amadeus",
      "3DS 2.0",
      "ABU / VAU",
      "Tokenização VTS/MDES",
      "QMR / GMR",
      "MCBS / VSS",
    ],
  },
  {
    role: "Analista de Produção / Negócios",
    company: "Verifone / American Express",
    period: "Ago 2009 – Set 2017",
    duration: "8 anos",
    desc: "Condução de testes, homologação e certificação de soluções de captura e EMV L2 junto a Visa, Mastercard, American Express, emissores e processadoras. Participação chave na migração dos servidores globais da American Express para o Banco Bradesco (2014), criação do processo de EDI corporativo, atuação no projeto Multivan e suporte operacional a terminais POS, Contactless, gateways e mensageria ISO 8583.",
    tags: ["Amex", "Verifone", "EMV L2", "EDI", "ISO 8583", "Autorização & Captura", "Multivan"],
  },
];

const KEY_PROJECTS = [
  {
    title: "Governança de Releases, Data Integrity & Tarifas",
    company: "EcommIT",
    desc: "Gestão executiva de mandates semestrais, prevenção de multas de Data Integrity, condução de waivers e controle de tarifas de bandeiras (MCBS/VSS) e Interchange para adquirentes, bancos e processadoras.",
    icon: FileCheck,
  },
  {
    title: "Novo Portal Elo & Performance de Autorização",
    company: "Bandeira Elo",
    desc: "Liderança no desenvolvimento do novo Portal Elo para Adquirentes e estruturação da monitoria de autorização e liquidação em Qlik Sense e Tableau, elevando taxas de aprovação entre emissores e credenciadores.",
    icon: Rocket,
  },
  {
    title: "Certificação & Homologação de Adquirência Amadeus",
    company: "Getnet",
    desc: "Condução técnica da criação, certificação host e homologação de processadora e adquirente dedicada junto às bandeiras, garantindo conectividade e liquidação sem falhas.",
    icon: Globe2,
  },
  {
    title: "Implantação de ABU, VAU, Tokenização e 3DS 2.0",
    company: "Getnet",
    desc: "Rollout de Mastercard ABU, Visa Account Updater (VAU), Tokenização de Rede (VTS/MDES) e protocolo 3-D Secure 2.0, reduzindo perdas em cartões expirados e garantindo liability shift.",
    icon: Zap,
  },
  {
    title: "Migração Global Amex para o Bradesco (2014)",
    company: "American Express / Verifone",
    desc: "Participação ativa na migração dos servidores globais da American Express para a infraestrutura do Bradesco, estruturando processos EDI e monitoria de captura e liquidação.",
    icon: Flame,
  },
];

const PAYMENTS_SOLUTIONS = [
  {
    icon: ShieldCheck,
    title: "1. Compliance de Bandeiras, Mandates & Governança de Data Integrity",
    summary: "Tradução dos requisitos das marcas em planos de ação executáveis por Produto, Tecnologia e Operações.",
    details: [
      "Gestão ponta a ponta dos releases semestrais e mandates de Visa, Mastercard, Elo e Amex, conduzindo certificações L3 / ADVT, MTIP e TQS dentro dos prazos regulatórios.",
      "Atuação preventiva em Data Integrity na mensageria de autorização e clearing, evitando multas operacionais e conduzindo pedidos de waiver junto às bandeiras.",
      "Resolução estruturada de incidentes entre autorização, captura e liquidação sem impacto financeiro para estabelecimentos e parceiros.",
    ],
  },
  {
    icon: Layers,
    title: "2. Controle de Tarifas de Bandeiras (MCBS / VSS) & Interchange",
    summary: "Visão financeira e orçamentária aplicada à proteção de margem e redução de custos de processamento.",
    details: [
      "Auditoria e controle sistemático das faturas consolidadas de rede (Mastercard MCBS e Visa VSS), identificando cobranças indevidas e tarifas de exceção.",
      "Gestão das regras de qualificação de Interchange por produto, canal e MCC, prevenindo downgrades tarifários.",
      "Análise de viabilidade econômico-financeira para apoiar decisões sobre novos modelos de captura, roteamento e processamento.",
    ],
  },
  {
    icon: TrendingUp,
    title: "3. Engenharia de Autorização, Captura & Performance",
    summary: "Maximização de taxas de aprovação com qualidade de mensageria ISO 8583 / ISO 20022.",
    details: [
      "Diagnóstico de recusas por código de retorno, qualidade de preenchimento de campos mandatórios (DE 22, DE 48, DE 61) e alinhamento com grandes emissores.",
      "Integração de autenticação 3DS 2.0/2.2, Network Tokens (VTS, MDES, Elo Token) e Account Updater (VAU/ABU) para ganho real de conversão.",
      "Acompanhamento de Stand-In Processing (STIP), disponibilidade transacional e conciliação de clearing (Base II / IPM / T068).",
    ],
  },
  {
    icon: RefreshCw,
    title: "4. Prevenção a Fraudes, Disputas & Programas de Monitoria",
    summary: "Proteção da operação contra programas punitivos e preservação de receita.",
    details: [
      "Monitoramento preventivo de índices de fraude e chargeback para manter adquirentes e subadquirentes fora de programas punitivos (Visa VAMP/VDMP/VFMP e Mastercard ECP).",
      "Aplicação das regras de Liability Shift, Compelling Evidence 3.0 e fluxos de resolução de disputas (VROL / MCOM).",
      "Trabalho integrado com as áreas de Chargeback, Fraudes, Riscos, Compliance e Operações.",
    ],
  },
];

const SKILLS = [
  {
    category: "Compliance & Certificações",
    items: ["Mandates & Releases", "Data Integrity", "Gestão de Waivers", "Visa ADVT / L3", "Mastercard MTIP", "Elo TQS", "Certificações Amex"],
  },
  {
    category: "Protocolos & Mensageria",
    items: ["ISO 8583 / ISO 20022", "Base II / IPM / T068", "EMV L2 & Contactless", "3DS 2.0 / 2.2", "Network Tokens (VTS/MDES/Elo)"],
  },
  {
    category: "Tarifas, Finanças & Billing",
    items: ["Interchange Qualification", "Faturas MCBS & Visa VSS", "Scheme Fees Control", "Account Updater (VAU/ABU)", "Viabilidade Financeira"],
  },
  {
    category: "Produtos & Operações",
    items: ["Captura & Processamento", "Autorização & Clearing", "QR Code / Pix", "Split & Marketplace", "Reportes Trimestrais (QMR/GMR)"],
  },
  {
    category: "Disputas & Riscos",
    items: ["Reason Codes Visa/MC/Elo", "Programas VAMP / ECP", "Liability Shift", "Prevenção a Multas", "VROL / MCOM"],
  },
  {
    category: "Liderança & Ferramentas",
    items: ["Liderança Funcional & Ágil", "Qlik Sense & Tableau", "SQL / DBeaver", "Inglês Avançado", "Espanhol para Negócios"],
  },
];

export default function HomePage() {
  return (
    <main className="bg-background min-h-screen pb-24">
      {/* ── Hero Executivo ─────────────────────────────────────────────────── */}
      <section
        id="sobre"
        className="relative overflow-hidden border-b border-border"
        style={{
          background: "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(37,99,235,0.15) 0%, transparent 70%)",
          padding: "5rem 1.5rem 4rem",
        }}
      >
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-[auto_1fr] items-center">
            {/* Foto Oficial Vinícius Sugamele */}
            <div className="relative group mx-auto md:mx-0">
              <div className="absolute -inset-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 rounded-3xl blur opacity-40 group-hover:opacity-75 transition duration-500" />
              <div className="relative w-44 h-52 sm:w-52 sm:h-60 rounded-2xl overflow-hidden border-2 border-blue-500/30 shadow-2xl bg-slate-900">
                <Image
                  src="/vinicius_sugamele.jpg"
                  alt="Vinícius Sugamele - Especialista & Head de Bandeiras"
                  fill
                  sizes="(max-width: 768px) 176px, 208px"
                  priority
                  className="object-cover object-top"
                />
              </div>
            </div>

            {/* Informações Principais */}
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  Head de Bandeiras · Payments Specialist
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  16+ Anos de Experiência
                </span>
              </div>

              <h1
                className="font-black text-foreground mb-2"
                style={{ fontSize: "clamp(2.2rem, 5vw, 3.2rem)", lineHeight: 1.1, letterSpacing: "-0.02em" }}
              >
                Vinícius Sugamele
              </h1>

              <p className="mb-5 text-sm sm:text-base text-muted-foreground font-medium">
                Especialista em gestão de bandeiras e meios de pagamento — traduzo os requisitos de{" "}
                <strong className="text-foreground">Visa, Mastercard, Elo e Amex</strong> em planos de ação que produto,
                tecnologia e operações conseguem executar.
              </p>

              {/* Badges de Contato & Localização */}
              <div className="flex flex-wrap gap-2.5 mb-6">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-lg border border-border">
                  <MapPin size={13} className="text-blue-500" />
                  São Paulo, Brasil
                </div>

                <a
                  href="https://wa.me/5511976546714?text=Ol%C3%A1%20Vin%C3%ADcius,%20vi%20seu%20curr%C3%ADculo%20e%20gostaria%20de%20conversar."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 px-3 py-1.5 rounded-lg border border-emerald-500/20 transition-colors"
                >
                  <MessageCircle size={13} className="text-emerald-400" />
                  (11) 97654-6714
                </a>

                <a
                  href="mailto:vsugamele@gmail.com"
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-blue-400 bg-muted/50 px-3 py-1.5 rounded-lg border border-border hover:border-blue-500/40 transition-colors"
                >
                  <Mail size={13} className="text-blue-500" />
                  vsugamele@gmail.com
                </a>

                <a
                  href="https://www.linkedin.com/in/vinicius-sugamele-41136617/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 px-3.5 py-1.5 rounded-lg shadow-sm transition-all"
                >
                  <ExternalLink size={13} />
                  LinkedIn
                </a>
              </div>

              {/* Bio Resumida */}
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-3xl">
                Atuação direta com <strong>Visa, Mastercard, Elo e American Express</strong> em compliance de bandeiras,
                certificações (L3/ADVT, MTIP, TQS), mandates/releases, controle de tarifas (MCBS/VSS), Interchange e
                governança de <strong>Data Integrity</strong>. Hoje Head de Bandeiras na{" "}
                <strong>EcommIT Integrated Solutions</strong>, com trajetória consolidada na{" "}
                <strong>Bandeira Elo</strong>, <strong>Getnet</strong> e{" "}
                <strong>Verifone / American Express</strong>. MBA em Liderança, Inovação e Gestão 3.0 pela PUCRS.
              </p>

              {/* Botões de Ação */}
              <div className="flex flex-wrap gap-3 mt-6">
                <a
                  href="https://wa.me/5511976546714?text=Ol%C3%A1%20Vin%C3%ADcius,%20vi%20seu%20curr%C3%ADculo%20e%20gostaria%20de%20conversar."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-2 shadow-md shadow-emerald-600/30 transition-all"
                >
                  <MessageCircle size={14} />
                  Falar no WhatsApp
                </a>

                <a
                  href="https://www.linkedin.com/in/vinicius-sugamele-41136617/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 rounded-xl font-bold text-xs bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-2 shadow-md shadow-blue-600/30 transition-all"
                >
                  <ExternalLink size={14} />
                  Conectar no LinkedIn
                </a>

                <a
                  href="/Curriculo_Vinicius_Sugamele.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 rounded-xl font-bold text-xs bg-muted hover:bg-muted/80 text-foreground border border-border flex items-center gap-2 transition-all"
                >
                  <FileDown size={14} className="text-blue-500" />
                  Baixar Currículo em PDF
                </a>

                <a
                  href="mailto:vsugamele@gmail.com"
                  className="px-4 py-2.5 rounded-xl font-bold text-xs bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-2 transition-all"
                >
                  <Mail size={14} />
                  Enviar E-mail
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Métricas Executivas de Impacto ─────────────────────────────────── */}
      <section className="border-b border-border bg-card/40 backdrop-blur-sm py-8">
        <div className="mx-auto max-w-5xl px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {METRICS.map((m, idx) => (
              <div key={idx} className="relative group">
                <div className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-400">
                  {m.value}
                </div>
                <div className="text-xs font-bold text-foreground mt-0.5">{m.label}</div>
                <div className="text-[11px] text-muted-foreground mt-1 leading-snug">{m.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-6">
        {/* ── Sobre (Estrutura Direta: Quem Sou + Hoje + Antes + Transversal) ── */}
        <section className="pt-16">
          <div className="rounded-2xl border border-border bg-card p-6 md:p-8 space-y-4">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Award className="text-blue-500" size={20} />
              Sobre
            </h2>

            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Sou especialista em gestão de bandeiras e meios de pagamento, com mais de 16 anos de atuação direta com{" "}
              <strong className="text-foreground">Visa, Mastercard, Elo e American Express</strong> em compliance de
              bandeiras, certificações, mandates e governança de <strong className="text-foreground">Data Integrity</strong>.
              Sou referência em regras de bandeira para os times técnicos e de negócios: traduzo os requisitos das
              marcas em planos de ação que produto, tecnologia e operações conseguem executar.
            </p>

            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Hoje, na <strong className="text-foreground">EcommIT</strong>, atuo como{" "}
              <strong className="text-foreground">Head de Bandeiras</strong> atendendo adquirentes, subadquirentes,
              bancos e processadoras (<em>Checkout.com, Getnet, PicPay, Mercado Pago, Banco Inter, Banco BS2, Entrepay, DXC, AM53 e Payware</em>).
              Alguns resultados e frentes sob minha liderança:
            </p>

            <ul className="space-y-2.5 pl-1">
              {[
                "Gestão das regras de bandeira, releases semestrais e projetos de captura e processamento, conduzindo certificações L3 / ADVT Visa, MTIP Mastercard, TQS Elo e Amex dentro dos prazos regulatórios.",
                "Atuação preventiva em Data Integrity e qualidade de mensageria entre autorização e clearing, evitando multas operacionais e conduzindo a aprovação de waivers junto às bandeiras.",
                "Estruturação do controle e auditoria das tarifas das bandeiras (Visa VSS e Mastercard MCBS) e projetos de qualificação de Interchange, gerando economia direta e proteção de margem para a operação.",
                "Resolução de incidentes críticos entre autorização, captura e liquidação (clearing), preservando a continuidade operacional sem impacto financeiro para os estabelecimentos e parceiros.",
              ].map((bullet, i) => (
                <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  <CheckCircle2 size={15} className="text-blue-500 mt-0.5 shrink-0" />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>

            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed pt-1">
              Antes, na <strong className="text-foreground">Bandeira Elo</strong>, atuei por 3 anos na gestão de
              performance, operações e troubleshooting de autorização e liquidação entre grandes Emissores (
              <em>Bradesco, Banco do Brasil e Caixa</em>) e Credenciadores (
              <em>Cielo, Rede, Getnet, Stone e PagBank</em>), além de liderar o desenvolvimento do novo Portal Elo para
              Adquirentes. Na <strong className="text-foreground">Getnet</strong>, conduzi a gestão de compliance e
              releases mandatórios com Visa, Mastercard, Elo, Amex e Hipercard, os projetos de certificação host da
              processadora/adquirente dedicada (<em>Amadeus</em>), a entrega dos reportes trimestrais às bandeiras (
              <em>QMR/GMR/EIR</em>), a auditoria de faturas (<em>MCBS/VSS</em>) junto ao Financeiro e o rollout de{" "}
              <strong className="text-foreground">
                3DS 2.0, Tokenização de Bandeira (VTS/MDES), Account Updater (ABU/VAU), QR Code e Marketplace
              </strong>
              . Na <strong className="text-foreground">Verifone / American Express</strong>, participei da migração
              global dos servidores da Amex para o Bradesco e da implantação dos processos de EDI, captura e
              certificação EMV L2.
            </p>

            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Trabalho de forma transversal com{" "}
              <strong className="text-foreground">
                Produtos, Captura, Processamento, Financeiro, Operações, Compliance, Chargeback, Fraudes,
                Infraestrutura e NOC
              </strong>
              , com liderança funcional, visão financeira de impacto e práticas ágeis (MBA em Liderança, Inovação e
              Gestão 3.0 — PUCRS). Atuo com inglês e espanhol no dia a dia.
            </p>

            <p className="text-xs sm:text-sm text-blue-400 font-semibold leading-relaxed">
              Busco oportunidades em adquirentes, subadquirentes, emissores, bancos, fintechs, bandeiras e
              processadoras, no Brasil e na América Latina.
            </p>
          </div>
        </section>

        {/* ── Ecossistema de Atuação & Parceiros ─────────────────────────────── */}
        <section id="ecossistema" className="pt-16">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
              <Building2 size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-blue-500">Autoridade & Ecossistema</p>
              <h2 className="font-bold text-foreground text-2xl">Instituições & Parceiros Atendidos</h2>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mb-8 max-w-3xl leading-relaxed">
            Relacionamento executivo, homologações de rede e governança operacional desenvolvidos diretamente com os
            principais agentes da indústria financeira:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {ECOSYSTEM.map((cat, i) => (
              <div
                key={i}
                className="rounded-2xl border border-border bg-card p-6 flex flex-col justify-between hover:border-blue-500/30 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <h3 className="font-bold text-foreground text-sm">{cat.title}</h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      {cat.badge}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {cat.partners.map((p) => (
                      <span
                        key={p.name}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                          p.highlight
                            ? "bg-blue-500/10 border-blue-500/30 text-blue-400 font-bold"
                            : "bg-muted/70 border-border text-muted-foreground"
                        }`}
                      >
                        {p.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Trajetória Profissional ────────────────────────────────────────── */}
        <section id="experiencia" className="pt-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
              <Briefcase size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-blue-500">Histórico de Carreira</p>
              <h2 className="font-bold text-foreground text-2xl">Trajetória Profissional</h2>
            </div>
          </div>

          <div className="space-y-6">
            {EXPERIENCE.map((e, i) => (
              <div
                key={i}
                className="rounded-2xl border border-border bg-card p-6 md:p-7 relative overflow-hidden transition-all hover:border-blue-500/40"
              >
                {i === 0 && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500" />
                )}
                <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                  <div>
                    <h3 className="font-bold text-foreground text-lg">{e.role}</h3>
                    <p className="text-xs font-semibold text-blue-500 mt-0.5">{e.company}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-mono text-muted-foreground font-semibold">{e.period}</p>
                    <p className="text-[11px] text-muted-foreground/70">{e.duration}</p>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-4">{e.desc}</p>
                <div className="flex flex-wrap gap-1.5">
                  {e.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-muted border border-border text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Projetos Estratégicos & Inovação ───────────────────────────────── */}
        <section id="projetos" className="pt-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
              <Rocket size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-blue-500">Entregas de Alto Impacto</p>
              <h2 className="font-bold text-foreground text-2xl">Destaques de Projetos & Resultados</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {KEY_PROJECTS.map((proj, idx) => {
              const Icon = proj.icon;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-border bg-card p-6 flex items-start gap-4 hover:border-blue-500/30 transition-all"
                >
                  <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 shrink-0 mt-0.5">
                    <Icon size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-sm mb-1">{proj.title}</h3>
                    <p className="text-[11px] font-bold text-blue-500 mb-2">{proj.company}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{proj.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Soluções & Domínio em Gestão de Bandeiras & Pagamentos ─────────── */}
        <section id="solucoes" className="pt-16">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
              <Zap size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-blue-500">
                Especialidades Técnicas & Negócios
              </p>
              <h2 className="font-bold text-foreground text-2xl">Frentes de Atuação Executiva e Técnica</h2>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mb-8 max-w-3xl leading-relaxed">
            Práticas consolidadas ao longo de mais de 16 anos atuando diretamente entre bandeiras, adquirentes,
            emissores e processadoras:
          </p>

          <div className="grid grid-cols-1 gap-5">
            {PAYMENTS_SOLUTIONS.map((sol, i) => {
              const Icon = sol.icon;
              return (
                <div
                  key={i}
                  className="rounded-2xl border border-border bg-card p-6 relative overflow-hidden transition-all hover:border-blue-500/40"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 shrink-0 mt-1">
                      <Icon size={24} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base font-bold text-foreground mb-1">{sol.title}</h3>
                      <p className="text-xs text-blue-500 font-medium mb-3">{sol.summary}</p>
                      <ul className="space-y-2">
                        {sol.details.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-xs text-muted-foreground leading-relaxed">
                            <CheckCircle2 size={14} className="text-emerald-500 mt-0.5 shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Matriz de Competências ─────────────────────────────────────────── */}
        <section id="competencias" className="pt-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
              <Layers size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-blue-500">Skills & Ferramentas</p>
              <h2 className="font-bold text-foreground text-2xl">Matriz de Competências</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SKILLS.map((s) => (
              <div
                key={s.category}
                className="rounded-2xl border border-border bg-card p-5 hover:border-blue-500/30 transition-all"
              >
                <h3 className="font-bold text-xs uppercase tracking-wider mb-3 text-blue-500">{s.category}</h3>
                <div className="flex flex-wrap gap-1.5">
                  {s.items.map((item) => (
                    <span
                      key={item}
                      className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-muted border border-border text-muted-foreground"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Formação Acadêmica & Idiomas ───────────────────────────────────── */}
        <section id="formacao" className="pt-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
              <GraduationCap size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-blue-500">Educação Contínua</p>
              <h2 className="font-bold text-foreground text-2xl">Formação Acadêmica & Idiomas</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
            <div className="rounded-2xl border border-border bg-card p-6">
              <p className="font-bold text-foreground text-sm mb-1">MBA — Liderança, Inovação e Gestão 3.0</p>
              <p className="text-xs text-blue-500 font-semibold">PUCRS — Pontifícia Universidade Católica do RS</p>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                Foco em liderança funcional, gestão de produtos, agilidade e tomada de decisão orientada a resultados.
              </p>
              <p className="text-[11px] text-muted-foreground mt-3 font-mono">Conclusão: 2020</p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6">
              <p className="font-bold text-foreground text-sm mb-1">Gestão da Tecnologia da Informação</p>
              <p className="text-xs text-blue-500 font-semibold">UNIP — Universidade Paulista</p>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                Engenharia de sistemas, governança de TI, bancos de dados relacionais e infraestrutura transacional.
              </p>
              <p className="text-[11px] text-muted-foreground mt-3 font-mono">Conclusão: 2011</p>
            </div>
          </div>

          {/* Idiomas */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { lang: "Português", level: "Nativo", desc: "Comunicação executiva e técnica fluente" },
              {
                lang: "Inglês",
                level: "Avançado",
                desc: "Negociação direta com bandeiras globais e documentação técnica",
              },
              {
                lang: "Espanhol",
                level: "Profissional",
                desc: "Atuação no dia a dia com equipes e operações na América Latina",
              },
            ].map((idm) => (
              <div key={idm.lang} className="p-4 rounded-xl bg-card border border-border">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-foreground">{idm.lang}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-500 font-semibold">
                    {idm.level}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground">{idm.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Box de Contato Direto ─────────────────────────────────────────── */}
        <section id="contato" className="pt-20">
          <div className="rounded-3xl border border-blue-500/30 bg-gradient-to-br from-blue-950/30 via-slate-900 to-black p-8 md:p-12 text-center relative overflow-hidden">
            <div className="max-w-2xl mx-auto space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider">
                <Send size={12} />
                Contato Direto
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white">Vamos Conversar sobre Pagamentos?</h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Disponível para posições estratégicas e executivas em adquirentes, subadquirentes, emissores, bancos,
                fintechs, bandeiras e processadoras no Brasil e na América Latina.
              </p>
              <div className="flex flex-wrap justify-center gap-3 pt-3">
                <a
                  href="https://wa.me/5511976546714?text=Ol%C3%A1%20Vin%C3%ADcius,%20vi%20seu%20curr%C3%ADculo%20e%20gostaria%20de%20conversar."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-3 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all"
                >
                  <MessageCircle size={15} />
                  WhatsApp Direto ((11) 97654-6714)
                </a>
                <a
                  href="mailto:vsugamele@gmail.com"
                  className="px-5 py-3 rounded-xl font-bold text-xs bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all"
                >
                  <Mail size={15} />
                  Enviar E-mail (vsugamele@gmail.com)
                </a>
                <a
                  href="https://www.linkedin.com/in/vinicius-sugamele-41136617/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-3 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 flex items-center gap-2 transition-all"
                >
                  <ExternalLink size={15} />
                  Mensagem no LinkedIn
                </a>
                <a
                  href="/Curriculo_Vinicius_Sugamele.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-3 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-2 transition-all"
                >
                  <FileDown size={15} />
                  Baixar Currículo (PDF)
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
