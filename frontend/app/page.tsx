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
  Calendar,
  Building2,
  Send,
  MessageCircle,
  Phone,
  BarChart3,
  Network
} from "lucide-react";

export const metadata = {
  title: "Vinícius Sugamele — Payments & Billing Specialist · Head de Bandeiras",
  description: "Profissional com mais de 16 anos de experiência em meios de pagamento: EcommIT, Bandeira Elo, Getnet e American Express. Especialista em governança de bandeiras, autorização, intercâmbio, billing recorrente e chargebacks.",
};

const METRICS = [
  {
    value: "16+",
    unit: "Anos",
    label: "Experiência Executiva",
    desc: "Elo, Getnet, Amex, EcommIT & Verifone em liderança de meios de pagamento.",
  },
  {
    value: "224k+",
    unit: "BINs",
    label: "Faixas Modeladas",
    desc: "Mapeamento algorítmico de cascata de intercâmbio e auditoria de faturas MCBS e VSS.",
  },
  {
    value: "+3.8%",
    unit: "Aprovação",
    label: "Ganho Médio",
    desc: "Otimização em projetos de Network Tokens (VTS/MDES), Smart Retries e mensageria.",
  },
  {
    value: "30+",
    unit: "Players",
    label: "Ecossistema Atendido",
    desc: "Adquirentes, bancos emissores, bandeiras globais e processadoras de mercado.",
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
    duration: "2+ anos",
    desc: "Liderança no relacionamento técnico e de negócios com bandeiras (Visa, Mastercard, Elo, Amex). Responsável pela governança de releases semestrais, desenho de novos produtos, estratégia de intercâmbio, liquidação financeira e integração técnica. Atendimento direto a grandes parceiros e instituições como Checkout.com, Getnet, PicPay, Mercado Pago, Banco BS2, Banco Inter e Entrepay, além de processadoras de pagamento líderes de mercado como DXC Technology, AM53 e Payware.",
    tags: [
      "Checkout.com",
      "Getnet",
      "PicPay",
      "Mercado Pago",
      "Banco Inter",
      "Banco BS2",
      "Entrepay",
      "DXC",
      "AM53",
      "Payware",
      "Visa",
      "Mastercard",
      "Elo",
      "Amex",
      "Releases",
      "Intercâmbio",
    ],
  },
  {
    role: "Especialista de Operações",
    company: "Bandeira Elo",
    period: "Ago 2020 – Out 2023",
    duration: "3 anos",
    desc: "Multiplicador de soluções e serviços da Elo para adquirentes e processadoras. Desenvolvimento do novo Portal Elo, monitoramento e troubleshooting de autorização e liquidação, facilitador entre Emissores (Bradesco, BB, Caixa), Credenciadores (Cielo, Getnet, Rede, Stone, PagBank) e Processadoras, otimização contínua de taxas de aprovação.",
    tags: ["Bandeira Elo", "Autorização", "Liquidação", "Qlik Sense", "Tableau", "Troubleshooting", "Portal Elo"],
  },
  {
    role: "Analista Sênior / Coordenador de Liquidação",
    company: "Getnet",
    period: "Set 2017 – Out 2020",
    duration: "3 anos",
    desc: "Responsável pelo desenvolvimento, homologação e rollout de projetos de Release das Bandeiras (Elo, Visa, Mastercard, Amex, Hipercard). Liderança em projetos estratégicos: QR Code, 3DS 2.0, ABU/VAU (Account Updater), Marketplace, Tokenização de Bandeira, Emissão e Consulta de BIN.",
    tags: ["3DS 2.0", "ABU / VAU", "Tokenização", "Getnet", "Releases", "Marketplace", "Consulta BIN"],
  },
  {
    role: "Analista de Produção / Negócios",
    company: "Verifone / American Express",
    period: "Ago 2009 – Set 2017",
    duration: "8 anos",
    desc: "Homologação de implementações, criação do processo EDI, implementação de monitorias de autorização/captura. Participação na migração dos servidores globais da Amex para o Bradesco (2014) e no projeto Multivan. Suporte operacional a terminais POS, gateways e processamento ISO 8583.",
    tags: ["Amex", "EDI", "ISO 8583", "Autorização", "Processamento", "Multivan"],
  },
];

const KEY_PROJECTS = [
  {
    title: "Novo Portal Elo & Monitoramento Operacional",
    company: "Bandeira Elo",
    desc: "Desenvolvimento da plataforma centralizada de monitoria de autorização e liquidação em Qlik Sense e Tableau, conectando emissores e credenciadores para troubleshooting em tempo real.",
    icon: Rocket,
  },
  {
    title: "Implantação de ABU, VAU e 3DS 2.0",
    company: "Getnet",
    desc: "Rollout do Automatic Billing Updater da Mastercard, Visa Account Updater e protocolo 3-D Secure 2.0, reduzindo perdas em cartões vencidos e garantindo liability shift.",
    icon: Zap,
  },
  {
    title: "Migração Global Amex para o Bradesco (2014)",
    company: "American Express / Verifone",
    desc: "Participação ativa na migração de infraestrutura de servidores globais para o datacenter do Bradesco, arquitetando processos EDI e monitoramento de captura.",
    icon: Flame,
  },
  {
    title: "Governança de Releases & Intercâmbio",
    company: "EcommIT",
    desc: "Gestão executiva de cronogramas mandatórios semestrais de bandeiras e auditoria de modelos de intercâmbio e clearing para dezenas de instituições financeiras.",
    icon: FileCheck,
  },
  {
    title: "Certificação & Homologação de Adquirência Amadeus",
    company: "Getnet",
    desc: "Condução técnica da criação, certificação e homologação de processadora e adquirente dedicada, garantindo conectividade e liquidação sem falhas.",
    icon: Globe2,
  },
];

const PAYMENTS_SOLUTIONS = [
  {
    icon: TrendingUp,
    title: "1. Engenharia de Autorização & Smart Routing",
    summary: "Maximização de aprovação com inteligência de mensageria e compliance.",
    details: [
      "Aplicação de protocolos de autenticação avançada (Visa DAF e Mastercard DAA), integrando 3DS na primeira compra e Network Tokens nas recorrências.",
      "Formatação rigorosa de POS Entry Mode evitando que transações seguras sofram downgrade tarifário ou recusas indevidas.",
      "Otimização de aprovações em Stand-In Processing (STIP) durante períodos de instabilidade de emissores e roteamento inteligente por bandeira.",
    ],
  },
  {
    icon: RefreshCw,
    title: "2. Recorrência, Smart Retries & Combate ao Churn",
    summary: "Recuperação de faturamento legítimo respeitando rigorosamente o rulebook.",
    details: [
      "Classificação precisa de motivos de recusa (Soft vs. Hard Declines), garantindo total aderência às regras do Visa Art. 2.11 e Mastercard TPE.",
      "Criação de cadências de retry sincronizadas com períodos de liquidez salarial e janelas horárias de maior aprovação bancária.",
      "Eliminação de atrito com validação de contas via Zero-Dollar Verification sem gerar cobranças fantasma no extrato do portador.",
    ],
  },
  {
    icon: Zap,
    title: "3. Network Tokens & Account Updater (VAU / ABU)",
    summary: "Continuidade de billing e proteção de dados em conformidade com as bandeiras.",
    details: [
      "Homologação de soluções de Tokenização de Rede (Visa Token Service, MDES e Elo Token), aumentando a taxa de aprovação em até 4 pontos percentuais.",
      "Fluxos contínuos de atualização automática de credenciais (Account Updater) para cartões expirados ou reemitidos.",
      "Qualificação para tiers diferenciados de intercâmbio destinados a credenciais tokenizadas seguras.",
    ],
  },
  {
    icon: ShieldCheck,
    title: "4. Gestão de Chargebacks, Fraude & Monitoria",
    summary: "Proteção contra programas punitivos e preservação de receita.",
    details: [
      "Controle preventivo de limites de fraude e contestação para manter a operação longe dos programas punitivos (Visa VAMP e Mastercard ECP).",
      "Implementação de 3DS 2.2 / 2.3 com Liability Shift para transferência de responsabilidade de fraude ao emissor.",
      "Estruturação de dossiês de defesa técnica de chargeback com evidências robustas e conformidade regulatória.",
    ],
  },
  {
    icon: Layers,
    title: "5. Governança de Intercâmbio & Tarifas de Rede",
    summary: "Otimização de custos operacionais e margem de adquirência.",
    details: [
      "Domínio completo das matrizes de Intercâmbio de Visa, Mastercard, Elo e Amex, assegurando o correto enquadramento tarifário por canal e segmento.",
      "Auditoria minuciosa das faturas consolidadas de rede (VSS e MCBS), identificando cobranças indevidas de serviços e tarifas de exceção.",
      "Modelagem estratégica de custos de processamento para adquirentes, subadquirentes e grandes plataformas.",
    ],
  },
];

const SKILLS = [
  { category: "Protocolos & Padrões", items: ["ISO 8583", "EMV Contactless", "PCI DSS", "3DS 2.0 / 2.2", "Network Tokens (VTS/MDES/Elo)"] },
  { category: "Recorrência & Billing", items: ["Smart Retries", "Account Updater (VAU/ABU)", "CIT vs MIT", "Involuntary Churn Recovery", "Payment Routing"] },
  { category: "Produtos & Operações", items: ["Crédito / Débito / Pré-pago", "Subscrições & SaaS", "QR Code / Pix", "Split de Pagamento", "Marketplace"] },
  { category: "Disputas & Compliance", items: ["Reason Codes Visa & MC", "Programas de Monitoria (VAMP/ECP)", "Liability Shift", "VROL / MCOM"] },
  { category: "Bandeiras & Ecossistema", items: ["Bandeira Elo", "Visa", "Mastercard", "American Express", "Hipercard", "Regulatório Bacen"] },
  { category: "Dados & Ferramentas", items: ["Qlik Sense", "Tableau", "Python / FastAPI", "SQL / DBeaver", "Git"] },
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
                  alt="Vinícius Sugamele - Payments & Billing Specialist"
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
                  Payments & Billing Specialist
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
              
              <p className="mb-5 text-sm sm:text-base text-muted-foreground font-medium italic">
                &ldquo;A liderança em pagamentos é a ponte estratégica entre a infraestrutura técnica dos arranjos e o crescimento financeiro sustentável do negócio.&rdquo;
              </p>

              {/* Badges de Contato & Localização */}
              <div className="flex flex-wrap gap-2.5 mb-6">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-lg border border-border">
                  <MapPin size={13} className="text-blue-500" />
                  São Paulo, Brasil
                </div>

                <a
                  href="https://wa.me/5511996280159?text=Ol%C3%A1%20Vin%C3%ADcius,%20vi%20seu%20perfil%20executivo%20e%20gostaria%20de%20conversar."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 px-3 py-1.5 rounded-lg border border-emerald-500/20 transition-colors"
                >
                  <MessageCircle size={13} className="text-emerald-400" />
                  (11) 99628-0159
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
                Head de Bandeiras na <strong>EcommIT Integrated Solutions</strong> (com suporte a instituições e parceiros como <em>Checkout.com, Getnet, PicPay, Mercado Pago, Banco Inter, Banco BS2, Entrepay, DXC, AM53 e Payware</em>), com sólido histórico em posições estratégicas na <strong>Bandeira Elo</strong>, <strong>Getnet</strong> e <strong>Verifone / American Express</strong>. Especialista em relacionamento com arranjos de pagamento, engenharia de autorização, governança de releases semestrais, billing recorrente, tokenização de rede e modelos de intercâmbio. MBA em Liderança, Inovação e Gestão 3.0 pela PUCRS.
              </p>

              {/* Botões de Ação */}
              <div className="flex flex-wrap gap-3 mt-6">
                <a
                  href="https://wa.me/5511996280159?text=Ol%C3%A1%20Vin%C3%ADcius,%20vi%20seu%20perfil%20executivo%20e%20gostaria%20de%20conversar."
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
        {/* ── Introdução Executiva & Posicionamento ──────────────────────────── */}
        <section className="pt-16">
          <div className="rounded-2xl border border-border bg-card p-6 md:p-8 space-y-4">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Award className="text-blue-500" size={20} />
              Visão Geral & Atuação no Mercado
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Com mais de 16 anos dedicado integralmente à indústria de pagamentos, atuo no alinhamento de alto nível entre as regras operacionais das bandeiras globais e locais (Visa, Mastercard, Elo, American Express), as necessidades tecnológicas das adquirentes e processadoras e a viabilidade econômica das empresas que dependem de transações eletrônicas em larga escala.
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Minha experiência abrange desde a governança de mandatórios técnicos e homologações de rede até a consultoria de produto para aumento contínuo de conversão, redução de custos de processamento e estruturação de governança de compliance com foco rigoroso nas diretrizes dos arranjos e regulamentações do Banco Central do Brasil.
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
            Relacionamento executivo, homologações de rede e governança operacional desenvolvidos diretamente com os principais agentes da indústria financeira:
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
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-4">
                  {e.desc}
                </p>
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
              <h2 className="font-bold text-foreground text-2xl">Destaques de Projetos & Inovação</h2>
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

        {/* ── Soluções & Domínio em Payments & Billing ───────────────────────── */}
        <section id="solucoes" className="pt-16">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
              <Zap size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-blue-500">Especialidades Técnicas & Negócios</p>
              <h2 className="font-bold text-foreground text-2xl">
                Como Atuo nos Desafios de Payments & Billing
              </h2>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mb-8 max-w-3xl leading-relaxed">
            Metodologias e práticas consolidadas ao longo de 16 anos atuando diretamente no coração das bandeiras, adquirentes e processadoras:
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
                <h3 className="font-bold text-foreground text-xs uppercase tracking-wider mb-3 text-blue-500">
                  {s.category}
                </h3>
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
                Foco em liderança de produtos digitais, inovação corporativa, agilidade e transformação de processos.
              </p>
              <p className="text-[11px] text-muted-foreground mt-3 font-mono">Conclusão: 2020</p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6">
              <p className="font-bold text-foreground text-sm mb-1">Gestão da Tecnologia da Informação</p>
              <p className="text-xs text-blue-500 font-semibold">UNIP — Universidade Paulista</p>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                Engenharia de sistemas, governança de TI, bancos de dados relacionais e telecomunicações financeiras.
              </p>
              <p className="text-[11px] text-muted-foreground mt-3 font-mono">Conclusão: 2011</p>
            </div>
          </div>

          {/* Idiomas */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { lang: "Português", level: "Nativo", desc: "Comunicação executiva e técnica fluente" },
              { lang: "Inglês", level: "Avançado", desc: "Negociação com bandeiras globais e documentação técnica" },
              { lang: "Espanhol", level: "Intermediário", desc: "Compreensão e comunicação profissional para LatAm" },
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
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                Vamos Conversar sobre Pagamentos?
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Disponível para trocas profissionais, projetos de consultoria estratégica, palestras e discussões sobre o futuro do ecossistema de meios de pagamento.
              </p>
              <div className="flex flex-wrap justify-center gap-3 pt-3">
                <a
                  href="https://wa.me/5511996280159?text=Ol%C3%A1%20Vin%C3%ADcius,%20vi%20seu%20perfil%20executivo%20e%20gostaria%20de%20conversar."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-3 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all"
                >
                  <MessageCircle size={15} />
                  WhatsApp Direto ((11) 99628-0159)
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
