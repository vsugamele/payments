import Link from "next/link";
import Image from "next/image";
import {
  MapPin,
  Mail,
  ExternalLink,
  GraduationCap,
  Briefcase,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  RefreshCw,
  ShieldCheck,
  Zap,
  Layers,
  Award,
  Globe2,
  Rocket,
  Flame,
  FileCheck,
} from "lucide-react";

const EXPERIENCE = [
  {
    role: "Head de Bandeiras",
    company: "EcommIT Integrated Solutions",
    period: "Out 2023 – Presente",
    duration: "2+ anos",
    desc: "Liderança no relacionamento técnico e de negócios com bandeiras (Visa, Mastercard, Elo, Amex). Responsável pela governança de releases semestrais, desenho de novos produtos, estratégia de intercâmbio, liquidação financeira e integração técnica de parceiros, gateways e credenciadores.",
    tags: ["Visa", "Mastercard", "Elo", "Amex", "Releases", "Intercâmbio", "MCBS", "VSS"],
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
    title: "Motor de Intercâmbio & Tarifação MCBS/VSS",
    company: "EcommIT",
    desc: "Construção de motor de cálculo de intercâmbio em cascata (waterfall) e auditoria de tarifas de processamento das bandeiras com 224k+ ranges de BINs.",
    icon: FileCheck,
  },
];

const PAYMENTS_SOLUTIONS = [
  {
    icon: TrendingUp,
    title: "1. Aumento da Taxa de Autorização & Smart Routing",
    summary: "Como maximizar a aprovação analisando o ecossistema de ponta a ponta.",
    details: [
      "Análise granular de taxa de aprovação por BIN, Banco Emissor (Itaú, Bradesco, Nubank, BB, Santander), Adquirente, Bandeira, Canal e MCC.",
      "Estruturação de Payment Routing por afinidade de emissor e regras de Cascading inteligente com fallback automático em timeouts ou erros sistêmicos.",
      "Experiência prática na Bandeira Elo e Getnet monitorando e depurando falhas de autorização entre adquirentes e processadoras em tempo real.",
    ],
  },
  {
    icon: RefreshCw,
    title: "2. Recorrência, Smart Retries & Combate ao Churn Involuntário",
    summary: "Recuperação de receita em assinaturas, trials, planos SaaS e DTC.",
    details: [
      "Classificação forense de Decline Codes (Hard vs. Soft Declines) evitando retentativas inúteis que geram custos e multas das bandeiras.",
      "Desenvolvimento de matrizes de Smart Retries sincronizadas com datas de maior liquidez salarial (5º e 20º dias úteis) e horários de menor fricção bancária.",
      "Parametrização estrita de transações CIT (Customer-Initiated) e MIT (Merchant-Initiated / Recorrência) nos campos técnicos ISO 8583 / IPM (Stored Credentials).",
    ],
  },
  {
    icon: Zap,
    title: "3. Network Tokens & Account Updater (VAU, ABU & Elo Token)",
    summary: "Eliminação de atrito na renovação e atualização automática de credenciais.",
    details: [
      "Implementação e homologação de projetos de Tokenização de Bandeira (VTS, MDES e Elo Token), gerando aumento comprovado de 2% a 4% nas taxas de aprovação.",
      "Configuração de fluxos automatizados de Visa Account Updater (VAU) e Mastercard Automatic Billing Updater (ABU) para atualizar cartões vencidos ou trocados sem interrupção para o cliente.",
      "Elegibilidade a tarifas de intercâmbio diferenciadas e programas de autenticação digital segura (ex: DAF).",
    ],
  },
  {
    icon: ShieldCheck,
    title: "4. Blindagem de Chargeback, Fraude & Programas de Monitoria",
    summary: "Controle rigoroso de limites para evitar multas e descredenciamento.",
    details: [
      "Monitoramento contínuo dos limiares de monitoria das bandeiras: Visa VDMP/VFMP (Early Warning 0.65% / Standard 0.90%) e Mastercard ECP/MDMP (1.50% / 2.00%).",
      "Implantação de 3DS 2.2 / 2.3 com Liability Shift para o emissor (ECI 05), garantindo proteção total contra chargebacks por fraude não reconhecida.",
      "Dossiês estruturados de representação e defesa rápida com Compelling Evidence 3.0 para reverter disputas comerciais indevidas.",
    ],
  },
  {
    icon: Layers,
    title: "5. Auditoria de Custos de Intercâmbio & Tarifas de Bandeira",
    summary: "Otimização da margem financeira da infraestrutura de pagamentos.",
    details: [
      "Domínio completo das matrizes de Intercâmbio Visa, Mastercard, Elo e Maestro, aplicando a lógica de cascata (waterfall) e caps regulatórios do Banco Central.",
      "Auditoria minuciosa das faturas de faturamento das bandeiras (Mastercard MCBS e Visa VSS), identificando Service IDs, taxas de processamento e cobranças indevidas.",
      "Estruturação de inteligência de custos para antecipação de recebíveis, split de pagamentos e modelagem de MDR.",
    ],
  },
];

const SKILLS = [
  { category: "Protocolos & Padrões", items: ["ISO 8583", "EMV Contactless", "PCI DSS", "PIN Security", "3DS 2.0 / 2.2", "Network Tokens (VTS/MDES/Elo)"] },
  { category: "Recorrência & Billing", items: ["Smart Retries", "Dunning Flow", "Account Updater (VAU/ABU)", "CIT vs MIT", "Involuntary Churn Recovery", "Payment Routing"] },
  { category: "Produtos & Operações", items: ["Crédito / Débito / Pré-pago", "Subscrições & SaaS", "QR Code / Pix", "Split de Pagamento", "Roteamento / Cascata", "Marketplace"] },
  { category: "Disputas & Compliance", items: ["Reason Codes Visa & MC", "VFMP / VDMP / ECP", "Compelling Evidence 3.0", "MATCH Pro / BRAM", "Liability Shift", "VROL / MCOM"] },
  { category: "Bandeiras & Ecossistema", items: ["Bandeira Elo", "Visa", "Mastercard", "American Express", "Maestro", "Hipercard", "Regulatório Bacen"] },
  { category: "Dados & Ferramentas", items: ["Qlik Sense", "Tableau", "FastAPI / Python", "SQL / DBeaver / PostgREST", "Supabase", "Git"] },
];

const LANGUAGES = [
  { lang: "Português", level: "Nativo", desc: "Comunicação executiva e técnica fluente" },
  { lang: "Inglês", level: "Avançado", desc: "Negociação com bandeiras globais e documentação técnica" },
  { lang: "Espanhol", level: "Intermediário", desc: "Compreensão e comunicação profissional para América Latina" },
];

export const metadata = {
  title: "Sobre — Vinícius Sugamele · Payments & Billing Expert",
  description: "Head de Bandeiras com 16+ anos de experiência em meios de pagamento: Elo, Visa, Mastercard, Amex, Getnet. Especialista em otimização de autorização, billing recorrente, intercâmbio e chargebacks.",
};

export default function SobrePage() {
  return (
    <main className="bg-background pb-24">

      {/* ── Hero bio ──────────────────────────────────────────────────────────── */}
      <section
        className="dot-grid relative overflow-hidden"
        style={{
          background: "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(37,99,235,0.18) 0%, transparent 70%)",
          borderBottom: "1px solid var(--border)",
          padding: "5.5rem 1.5rem 4.5rem",
        }}
      >
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-[auto_1fr] items-center">
            
            {/* Foto Oficial Vinícius Sugamele */}
            <div className="relative group mx-auto md:mx-0">
              <div className="absolute -inset-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 rounded-3xl blur opacity-40 group-hover:opacity-75 transition duration-500" />
              <div className="relative w-44 h-52 sm:w-48 sm:h-56 rounded-2xl overflow-hidden border-2 border-blue-500/30 shadow-2xl bg-slate-900">
                <Image
                  src="/vinicius_sugamele.jpg"
                  alt="Vinícius Sugamele - Payments & Billing Specialist"
                  fill
                  sizes="(max-width: 768px) 176px, 192px"
                  priority
                  className="object-cover object-top"
                />
              </div>
            </div>

            {/* Info */}
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="section-eyebrow">Payments & Billing Specialist</span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  16+ Anos de Experiência
                </span>
              </div>

              <h1
                className="font-black text-foreground mb-2"
                style={{ fontSize: "clamp(2rem, 4.5vw, 3rem)", lineHeight: 1.1 }}
              >
                Vinícius Sugamele
              </h1>
              
              <p className="mb-5 text-sm sm:text-base text-muted-foreground font-medium italic">
                &ldquo;A inovação em pagamentos é a ponte entre a infraestrutura técnica e o crescimento financeiro do negócio.&rdquo;
              </p>

              {/* Badges de Contato & LinkedIn */}
              <div className="flex flex-wrap gap-3 mb-6">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/40 px-3 py-1.5 rounded-lg border border-border">
                  <MapPin size={13} className="text-primary" />
                  São Paulo, Brasil
                </div>
                
                <a
                  href="mailto:vsugamele@gmail.com"
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-blue-400 bg-muted/40 px-3 py-1.5 rounded-lg border border-border hover:border-blue-500/40 transition-colors"
                >
                  <Mail size={13} className="text-primary" />
                  vsugamele@gmail.com
                </a>

                <a
                  href="https://www.linkedin.com/in/vinicius-sugamele-41136617/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 px-3.5 py-1.5 rounded-lg shadow-sm transition-all"
                >
                  <ExternalLink size={13} />
                  linkedin.com/in/vinicius-sugamele-41136617
                </a>
              </div>

              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-3xl">
                Head de Bandeiras na <strong>EcommIT Integrated Solutions</strong>, com passagens estratégicas por <strong>Bandeira Elo</strong>, <strong>Getnet</strong> e <strong>Verifone / American Express</strong>. Especialista em engenharia de pagamentos, otimização de taxas de autorização, arquitetura de billing e recorrência, mitigação de chargebacks, tokenização de bandeira (VTS/MDES/Elo) e auditoria de intercâmbio/MCBS. MBA em Liderança, Inovação e Gestão 3.0 pela PUCRS.
              </p>

              <div className="flex flex-wrap gap-3 mt-6">
                <a
                  href="https://www.linkedin.com/in/vinicius-sugamele-41136617/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary inline-flex items-center gap-2"
                >
                  <ExternalLink size={15} />
                  Conectar no LinkedIn
                </a>
                <Link href="/billing" className="btn-outline inline-flex items-center gap-2">
                  Ver Suite de Billing & Otimização
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-6">

        {/* ── Seção Especial: Como resolvo os desafios de Payments & Billing ──── */}
        <section className="pt-16">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Award size={20} />
            </div>
            <div>
              <p className="section-eyebrow">Domínio Operacional & Estratégico</p>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                Como Resolvo os Desafios de Payments & Billing
              </h2>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-8 max-w-3xl">
            Soluções práticas desenvolvidas ao longo de 16 anos atuando diretamente no coração das bandeiras, adquirentes e processadoras:
          </p>

          <div className="grid grid-cols-1 gap-5">
            {PAYMENTS_SOLUTIONS.map((sol, i) => {
              const Icon = sol.icon;
              return (
                <div
                  key={i}
                  className="rounded-2xl border border-border bg-card p-6 relative overflow-hidden transition-all hover:border-blue-500/30"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0 mt-1">
                      <Icon size={24} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base font-bold text-foreground mb-1">{sol.title}</h3>
                      <p className="text-xs text-primary font-medium mb-3">{sol.summary}</p>
                      <ul className="space-y-2">
                        {sol.details.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-xs text-muted-foreground leading-relaxed">
                            <CheckCircle2 size={14} className="text-emerald-400 mt-0.5 shrink-0" />
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

        {/* ── Key Milestones & Projects ───────────────────────────────────────── */}
        <section className="pt-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Rocket size={16} />
            </div>
            <div>
              <p className="section-eyebrow">Histórico Comprovado</p>
              <h2 className="font-bold text-foreground text-xl">Destaques de Projetos & Inovação</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {KEY_PROJECTS.map((proj, idx) => {
              const Icon = proj.icon;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-border bg-card p-5 flex items-start gap-3.5 hover:border-blue-500/30 transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0 mt-0.5">
                    <Icon size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-sm mb-0.5">{proj.title}</h3>
                    <p className="text-[11px] font-semibold text-primary mb-1.5">{proj.company}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{proj.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Experience ─────────────────────────────────────────────────────── */}
        <section className="pt-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Briefcase size={16} />
            </div>
            <h2 className="font-bold text-foreground text-xl">Trajetória Profissional</h2>
          </div>

          <div className="space-y-5">
            {EXPERIENCE.map((e, i) => (
              <div
                key={i}
                className="rounded-2xl border border-border bg-card p-6 relative overflow-hidden"
              >
                {i === 0 && (
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500" />
                )}
                <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                  <div>
                    <h3 className="font-bold text-foreground text-base">{e.role}</h3>
                    <p className="text-xs font-semibold text-primary mt-0.5">{e.company}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-mono text-muted-foreground">{e.period}</p>
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

        {/* ── Education ──────────────────────────────────────────────────────── */}
        <section className="pt-14">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <GraduationCap size={16} />
            </div>
            <h2 className="font-bold text-foreground text-xl">Formação Acadêmica</h2>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[
              {
                title: "MBA — Liderança, Inovação e Gestão 3.0",
                institution: "PUCRS",
                year: "2020",
                desc: "Foco em liderança de produtos digitais, inovação corporativa e frameworks ágeis.",
              },
              {
                title: "Gestão da Tecnologia da Informação",
                institution: "UNIP — Universidade Paulista",
                year: "2011",
                desc: "Engenharia de sistemas, governança de TI, bancos de dados e telecomunicações financeiras.",
              },
            ].map((ed) => (
              <div
                key={ed.title}
                className="rounded-2xl border border-border bg-card p-5"
              >
                <p className="font-bold text-foreground text-sm mb-1">{ed.title}</p>
                <p className="text-xs text-primary font-medium">{ed.institution}</p>
                <p className="text-[11px] text-muted-foreground/80 mt-1.5">{ed.desc}</p>
                <p className="text-[11px] text-muted-foreground mt-2 font-mono">Conclusão: {ed.year}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Skills ─────────────────────────────────────────────────────────── */}
        <section className="pt-14">
          <h2 className="font-bold text-foreground text-xl mb-6">
            Matriz de Competências
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SKILLS.map((s) => (
              <div
                key={s.category}
                className="rounded-2xl border border-border bg-card p-5"
              >
                <p className="section-eyebrow mb-3">{s.category}</p>
                <ul className="space-y-2">
                  {s.items.map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <CheckCircle2 size={13} className="text-cyan-400 shrink-0" />
                      <span className="text-xs text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* ── Languages ──────────────────────────────────────────────────────── */}
        <section className="pt-14">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Globe2 size={16} />
            </div>
            <h2 className="font-bold text-foreground text-xl">Idiomas</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {LANGUAGES.map((l) => (
              <div
                key={l.lang}
                className="p-5 rounded-2xl bg-card border border-border space-y-1 text-center sm:text-left"
              >
                <p className="font-bold text-foreground text-sm">{l.lang}</p>
                <p className="text-xs font-semibold text-primary">{l.level}</p>
                <p className="text-[11px] text-muted-foreground/80 leading-relaxed pt-1">{l.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Contact CTA ────────────────────────────────────────────────────── */}
        <section className="pt-16">
          <div className="rounded-3xl border border-blue-500/20 bg-gradient-to-br from-blue-600/10 via-indigo-600/5 to-transparent p-8 sm:p-10 text-center">
            <h2 className="font-bold text-foreground text-xl sm:text-2xl mb-3">
              Vamos conversar sobre a sua operação de pagamentos?
            </h2>
            <p className="text-muted-foreground text-sm max-w-xl mx-auto mb-6 leading-relaxed">
              Otimização de aprovação, implantação de orquestração, dunning, compliance de bandeiras e auditoria de intercâmbio.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <a
                href="https://www.linkedin.com/in/vinicius-sugamele-41136617/"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary inline-flex items-center gap-2"
              >
                <ExternalLink size={15} />
                LinkedIn de Vinícius Sugamele
              </a>
              <a href="mailto:vsugamele@gmail.com" className="btn-outline inline-flex items-center gap-2">
                <Mail size={15} />
                vsugamele@gmail.com
              </a>
            </div>
          </div>
        </section>

      </div>
    </main>
  );
}
