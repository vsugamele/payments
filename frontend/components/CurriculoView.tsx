import Image from "next/image";
import Link from "next/link";
import {
  MapPin,
  Mail,
  ExternalLink,
  FileDown,
  MessageCircle,
  ArrowRight,
} from "lucide-react";

const EXPERIENCE = [
  {
    role: "Head de Bandeiras",
    company: "EcommIT Integrated Solutions",
    period: "Out 2023 – Presente",
    duration: "Atual",
    desc: "Liderança no relacionamento técnico e de negócios com Visa, Mastercard, Elo e American Express. Referência em regras de bandeira para Produto, Tecnologia, Riscos e Operações, conduzindo releases semestrais, certificações técnicas (Visa ADVT/L3, Mastercard MTIP, Elo TQS e Amex), prevenção de multas em Data Integrity, pedidos de waiver, controle de tarifas (MCBS e VSS), qualificação de Interchange e resolução de incidentes entre autorização e clearing. Atendimento direto a instituições como Checkout.com, Getnet, PicPay, Mercado Pago, Banco BS2, Banco Inter e Entrepay, além das processadoras DXC Technology, AM53 e Payware.",
    tags: [
      "Visa",
      "Mastercard",
      "Elo",
      "Amex",
      "Data Integrity",
      "Mandates & Releases",
      "Certificações L3 / MTIP / TQS",
      "Interchange",
      "MCBS / VSS",
      "Waivers",
    ],
  },
  {
    role: "Especialista de Operações (Performance & Troubleshooting)",
    company: "Bandeira Elo",
    period: "Ago 2020 – Out 2023",
    duration: "3 anos",
    desc: "Atuação consultiva para elevar taxas de aprovação e estabilidade transacional entre Emissores (Bradesco, Banco do Brasil, Caixa), Credenciadores (Cielo, Getnet, Rede, Stone, PagBank) e Processadoras. Liderança no desenvolvimento do novo Portal Elo para Adquirentes, investigação de causas-raiz de recusas e divergências entre autorização e liquidação, homologação de produtos (Elo TQS) e acompanhamento em Qlik Sense e Tableau.",
    tags: [
      "Bandeira Elo",
      "Autorização & Clearing",
      "Performance de Aprovação",
      "Elo TQS",
      "Qlik Sense",
      "Tableau",
      "Portal Elo",
    ],
  },
  {
    role: "Analista Sênior / Coordenador de Liquidação & Bandeiras",
    company: "Getnet",
    period: "Set 2017 – Out 2020",
    duration: "3 anos",
    desc: "Gestão de compliance, homologação, certificações (Visa ADVT, Mastercard M-TIP, Elo TQS e Amex) e rollout dos Releases Obrigatórios das bandeiras Elo, Visa, Mastercard, Amex e Hipercard. Condução técnica da criação e certificação da processadora/adquirente dedicada (Amadeus), entrega dos reportes trimestrais às bandeiras (QMR/GMR/EIR), auditoria técnica de faturas (MCBS e VSS) junto ao Financeiro e condução de projetos como 3DS 2.0, ABU/VAU (Account Updater), Tokenização de Bandeira (VTS/MDES), Contactless/HCE, QR Code e Split/Marketplace.",
    tags: [
      "Getnet",
      "Compliance de Bandeiras",
      "Host Amadeus",
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
    desc: "Testes, homologação e certificação de soluções de captura e EMV L2 junto a Visa, Mastercard, American Express, emissores e processadoras. Participação direta na migração dos servidores globais da American Express para o Banco Bradesco (2014), criação do processo de EDI corporativo, atuação no projeto Multivan e suporte operacional a terminais POS, Contactless, gateways e mensageria ISO 8583.",
    tags: ["Amex", "Verifone", "EMV L2", "EDI", "ISO 8583", "Captura", "Multivan"],
  },
];

const ECOSYSTEM = [
  {
    title: "Adquirência, Subadquirência e Fintechs",
    partners: [
      "Checkout.com",
      "Getnet",
      "PicPay",
      "Mercado Pago",
      "Banco Inter",
      "Banco BS2",
      "Entrepay",
      "Cielo",
      "Rede",
      "Stone",
      "PagBank",
    ],
  },
  {
    title: "Processadoras e Infraestrutura",
    partners: ["DXC Technology", "AM53", "Payware", "Verifone", "Amadeus"],
  },
  {
    title: "Bancos Emissores",
    partners: ["Banco Bradesco", "Banco do Brasil", "Caixa Econômica Federal"],
  },
  {
    title: "Bandeiras e Arranjos",
    partners: ["Bandeira Elo", "American Express", "Visa", "Mastercard", "Hipercard"],
  },
];

const KEY_PROJECTS = [
  {
    title: "Governança de Releases, Data Integrity e Tarifas",
    company: "EcommIT",
    desc: "Condução dos releases semestrais, prevenção de multas de integridade na mensageria, negociação de waivers e auditoria de faturas MCBS/VSS e Interchange para adquirentes, bancos e processadoras.",
  },
  {
    title: "Novo Portal Elo e Monitoramento de Autorização",
    company: "Bandeira Elo",
    desc: "Desenvolvimento do Portal Elo para Adquirentes e estruturação dos painéis de autorização e liquidação em Qlik Sense e Tableau para investigação rápida de recusas entre emissores e credenciadores.",
  },
  {
    title: "Certificação da Processadora / Adquirente Amadeus",
    company: "Getnet",
    desc: "Condução técnica da certificação host e homologação junto às bandeiras para entrada em operação de uma processadora dedicada.",
  },
  {
    title: "Rollout de ABU, VAU, Tokenização e 3DS 2.0",
    company: "Getnet",
    desc: "Implantação de Account Updater, Network Tokens (VTS/MDES) e autenticação 3DS 2.0 para reduzir perdas por cartão vencido e assegurar proteção de liability shift.",
  },
  {
    title: "Migração Global da American Express para o Bradesco (2014)",
    company: "Verifone / American Express",
    desc: "Participação na migração dos servidores globais da Amex para a infraestrutura do Bradesco, estruturando fluxos EDI e monitoria de captura e liquidação.",
  },
];

const SKILLS = [
  {
    category: "Compliance & Certificações",
    items: [
      "Mandates & Releases",
      "Data Integrity",
      "Gestão de Waivers",
      "Visa ADVT / L3",
      "Mastercard MTIP",
      "Elo TQS",
      "Certificações Amex",
    ],
  },
  {
    category: "Protocolos & Mensageria",
    items: [
      "ISO 8583 / ISO 20022",
      "Base II / IPM / T068",
      "EMV L2 & Contactless",
      "3DS 2.0 / 2.2",
      "Network Tokens (VTS/MDES/Elo)",
    ],
  },
  {
    category: "Tarifas & Billing",
    items: [
      "Qualificação de Intercâmbio",
      "Faturas MCBS & Visa VSS",
      "Scheme Fees",
      "Account Updater (VAU/ABU)",
      "Viabilidade Financeira",
    ],
  },
  {
    category: "Operações & Disputas",
    items: [
      "Autorização & Clearing",
      "SLC / CIP / Recebíveis",
      "Reason Codes Visa/MC/Elo",
      "Programas VAMP / ECP / BRAM",
      "Compelling Evidence 3.0",
    ],
  },
  {
    category: "Regulação & Novos Arranjos",
    items: [
      "Resoluções BCB 264 / 304 / 522",
      "Pix SPI / MED 2.0 / Automático",
      "Open Finance (JSR)",
      "Split Tributário (LC 214/2025)",
      "Reportes QMR / GMR / EIR",
    ],
  },
  {
    category: "Gestão & Ferramentas",
    items: [
      "Liderança Funcional",
      "Qlik Sense & Tableau",
      "SQL / DBeaver",
      "Inglês Avançado",
      "Espanhol Profissional",
    ],
  },
];

export function CurriculoView() {
  return (
    <main className="bg-background min-h-dvh pb-24">
      <div className="mx-auto max-w-4xl px-6">
        {/* ── Abertura Editorial & Dados de Contato ───────────────────────── */}
        <header className="pt-14 pb-12 border-b border-border">
          <p className="section-eyebrow mb-4">Currículo &amp; Trajetória</p>

          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-8 items-start">
            <div className="space-y-5">
              <h1
                className="font-semibold text-foreground"
                style={{
                  fontSize: "clamp(2.1rem, 4.5vw, 3rem)",
                  lineHeight: 1.1,
                  letterSpacing: "-0.03em",
                }}
              >
                Vinícius Sugamele
              </h1>

              <p className="font-serif text-lg text-foreground/90 leading-relaxed text-pretty">
                Trabalho com meios de pagamento há mais de 16 anos, quase sempre no ponto em que a
                regra da bandeira encontra o sistema em produção e o fechamento financeiro. Hoje
                sou Head de Bandeiras na EcommIT, depois de passagens por Bandeira Elo, Getnet e
                Verifone / American Express.
              </p>

              {/* Contatos limpos */}
              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                <a
                  href="/Curriculo_Vinicius_Sugamele.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary inline-flex items-center gap-2 text-xs"
                >
                  <FileDown size={14} />
                  <span>Baixar currículo em PDF</span>
                </a>
                <a
                  href="https://www.linkedin.com/in/vinicius-sugamele-41136617/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-outline inline-flex items-center gap-1.5 text-xs"
                >
                  <ExternalLink size={13} />
                  <span>LinkedIn</span>
                </a>
                <a
                  href="https://wa.me/5511976546714?text=Ol%C3%A1%20Vin%C3%ADcius,%20vi%20seu%20curr%C3%ADculo%20e%20gostaria%20de%20conversar."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-outline inline-flex items-center gap-1.5 text-xs"
                >
                  <MessageCircle size={13} />
                  <span>(11) 97654-6714</span>
                </a>
                <a
                  href="mailto:vsugamele@gmail.com"
                  className="btn-outline inline-flex items-center gap-1.5 text-xs"
                >
                  <Mail size={13} />
                  <span>vsugamele@gmail.com</span>
                </a>
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-1 font-mono text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin size={12} /> São Paulo, SP · Brasil
                </span>
                <span>·</span>
                <span>Português, Inglês avançado e Espanhol profissional</span>
              </div>
            </div>

            {/* Retrato limpo, sem halo neon */}
            <div className="relative w-36 h-44 sm:w-44 sm:h-52 rounded-2xl overflow-hidden border border-border bg-muted shrink-0">
              <Image
                src="/vinicius_sugamele.jpg"
                alt="Vinícius Sugamele"
                fill
                sizes="(max-width: 768px) 144px, 176px"
                priority
                className="object-cover object-top"
              />
            </div>
          </div>
        </header>

        {/* ── O que guia meu trabalho (Prosa humana direta) ───────────────── */}
        <section className="py-12 border-b border-border space-y-5 max-w-3xl">
          <h2 className="text-xl sm:text-2xl font-semibold text-foreground tracking-tight">
            O que guia meu trabalho
          </h2>
          <div className="font-serif text-base text-[var(--body-text)] leading-[1.8] space-y-4">
            <p>
              Em meios de pagamento, quase todo problema caro nasce no espaço entre duas áreas que
              falam línguas diferentes. Um campo mal preenchido no <code>DE 22</code> ou um
              identificador perdido entre a autorização e o arquivo noturno de clearing raramente
              derruba o sistema na hora — ele aparece semanas depois, escondido em uma queda de
              aprovação, em um downgrade silencioso de intercâmbio ou em uma multa de Data
              Integrity na fatura da bandeira.
            </p>
            <p>
              O meu papel ao longo desses anos tem sido justamente juntar as três pontas que
              costumam andar separadas: a leitura do regulamento e dos boletins semestrais (Visa,
              Mastercard, Elo, Amex e Banco Central), o detalhe técnico da mensagem e da
              certificação, e a conta que fecha no resultado financeiro da operação.
            </p>
            <p>
              Gosto de trabalhar com regra rastreável: citar o manual, a data de vigência e o que
              acontece na prática se a empresa não se mexer a tempo. Isso evita retrabalho de
              engenharia e dá previsibilidade para produto, risco e financeiro decidirem juntos.
            </p>
          </div>
        </section>

        {/* ── Como organizo a operação (3 frentes limpas) ─────────────────── */}
        <section className="py-12 border-b border-border space-y-6">
          <div>
            <p className="section-eyebrow mb-2">Atuação no dia a dia</p>
            <h2 className="text-xl sm:text-2xl font-semibold text-foreground tracking-tight">
              As três frentes que costumo conduzir juntas
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                num: "01",
                title: "Autorização, Clearing e Liquidação",
                desc: "Mensageria ISO 8583, arquivos noturnos (Base II, GCMS IPM, Elo Serviço 10 e Amex CAS), registro de recebíveis na B3/CERC e conciliação entre captura e liquidação.",
              },
              {
                num: "02",
                title: "Conversão, Tokens e Autenticação",
                desc: "Projetos de 3DS 2.2, Network Tokens (VTS, MDES e Elo), Account Updater (VAU e ABU), tratamento de recusas e estabilidade transacional junto aos grandes emissores.",
              },
              {
                num: "03",
                title: "Tarifas, Releases e Risco",
                desc: "Governança de releases semestrais, certificações (ADVT/L3, MTIP, TQS), auditoria de faturas MCBS e VSS, qualificação de Interchange, waivers e programas de monitoria (VAMP, ECP, BRAM).",
              },
            ].map((item) => (
              <div key={item.num} className="editorial-card p-5 space-y-2.5">
                <span className="font-mono text-xs text-muted-foreground">{item.num}</span>
                <h3 className="text-base font-semibold text-foreground leading-snug">
                  {item.title}
                </h3>
                <p className="font-serif text-sm text-muted-foreground leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Trajetória Profissional ─────────────────────────────────────── */}
        <section className="py-12 border-b border-border space-y-8">
          <div>
            <p className="section-eyebrow mb-2">Histórico profissional</p>
            <h2 className="text-xl sm:text-2xl font-semibold text-foreground tracking-tight">
              Experiência
            </h2>
          </div>

          <div className="space-y-6">
            {EXPERIENCE.map((exp, idx) => (
              <div key={idx} className="editorial-card p-6 sm:p-7 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1.5">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">{exp.role}</h3>
                    <p className="text-sm font-medium text-muted-foreground mt-0.5">
                      {exp.company}
                    </p>
                  </div>
                  <div className="font-mono text-xs text-muted-foreground sm:text-right shrink-0">
                    <span>{exp.period}</span>
                    <span className="mx-1.5">·</span>
                    <span>{exp.duration}</span>
                  </div>
                </div>

                <p className="font-serif text-sm sm:text-[15px] text-[var(--body-text)] leading-[1.78]">
                  {exp.desc}
                </p>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {exp.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 rounded-full font-mono text-[11px] bg-muted border border-border text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Instituições e Parceiros Atendidos ──────────────────────────── */}
        <section className="py-12 border-b border-border space-y-6">
          <div>
            <p className="section-eyebrow mb-2">Ecossistema</p>
            <h2 className="text-xl sm:text-2xl font-semibold text-foreground tracking-tight">
              Instituições e parceiros com quem já atuei
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {ECOSYSTEM.map((group) => (
              <div key={group.title} className="editorial-card p-5 space-y-3">
                <h3 className="text-sm font-semibold text-foreground">{group.title}</h3>
                <div className="flex flex-wrap gap-1.5">
                  {group.partners.map((partner) => (
                    <span
                      key={partner}
                      className="px-2.5 py-1 rounded-full text-xs bg-muted border border-border text-foreground/90"
                    >
                      {partner}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Projetos Marcantes ──────────────────────────────────────────── */}
        <section className="py-12 border-b border-border space-y-6">
          <div>
            <p className="section-eyebrow mb-2">Entregas relevantes</p>
            <h2 className="text-xl sm:text-2xl font-semibold text-foreground tracking-tight">
              Projetos que marcaram essa trajetória
            </h2>
          </div>

          <div className="divide-y divide-border/80">
            {KEY_PROJECTS.map((proj) => (
              <div
                key={proj.title}
                className="py-5 first:pt-0 last:pb-0 grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-6"
              >
                <div className="sm:col-span-4">
                  <h3 className="text-sm font-semibold text-foreground leading-snug">
                    {proj.title}
                  </h3>
                  <p className="font-mono text-xs text-muted-foreground mt-1">{proj.company}</p>
                </div>
                <p className="sm:col-span-8 font-serif text-sm text-[var(--body-text)] leading-relaxed">
                  {proj.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Formação & Competências ─────────────────────────────────────── */}
        <section className="py-12 border-b border-border space-y-10">
          <div className="space-y-5">
            <div>
              <p className="section-eyebrow mb-2">Formação</p>
              <h2 className="text-xl sm:text-2xl font-semibold text-foreground tracking-tight">
                Formação acadêmica e idiomas
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="editorial-card p-5 space-y-1.5">
                <p className="font-mono text-xs text-muted-foreground">2020 · PUCRS</p>
                <h3 className="text-sm font-semibold text-foreground">
                  MBA em Liderança, Inovação e Gestão 3.0
                </h3>
                <p className="font-serif text-sm text-muted-foreground leading-relaxed">
                  Liderança funcional, gestão de produtos digitais e tomada de decisão em ambientes
                  ágeis.
                </p>
              </div>
              <div className="editorial-card p-5 space-y-1.5">
                <p className="font-mono text-xs text-muted-foreground">2011 · UNIP</p>
                <h3 className="text-sm font-semibold text-foreground">
                  Gestão da Tecnologia da Informação
                </h3>
                <p className="font-serif text-sm text-muted-foreground leading-relaxed">
                  Engenharia de sistemas, governança de TI, bancos de dados e infraestrutura
                  transacional.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { lang: "Português", level: "Nativo", note: "Comunicação técnica e executiva" },
                { lang: "Inglês", level: "Avançado", note: "Reuniões com bandeiras e manuais" },
                { lang: "Espanhol", level: "Profissional", note: "Operações na América Latina" },
              ].map((item) => (
                <div key={item.lang} className="editorial-card p-4 space-y-1">
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm font-semibold text-foreground">{item.lang}</span>
                    <span className="font-mono text-[11px] text-muted-foreground">
                      {item.level}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{item.note}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <p className="section-eyebrow mb-2">Repertório técnico</p>
              <h2 className="text-xl sm:text-2xl font-semibold text-foreground tracking-tight">
                Competências
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {SKILLS.map((group) => (
                <div key={group.category} className="editorial-card p-5 space-y-3">
                  <h3 className="font-mono text-xs font-medium uppercase text-muted-foreground">
                    {group.category}
                  </h3>
                  <ul className="space-y-1.5 text-sm text-foreground/90">
                    {group.items.map((skill) => (
                      <li key={skill}>{skill}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Por onde começar a ler + Para conversar ─────────────────────── */}
        <section className="pt-12 space-y-10">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground tracking-tight">
              Por onde começar a ler
            </h2>
            <p className="font-serif text-sm text-muted-foreground leading-relaxed max-w-2xl">
              Além do trabalho diário, escrevo notas sobre regulação, tarifas e bastidores do setor.
              Se quiser escolher três leituras rápidas:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  href: "/noticias/split-payment-reforma-tributaria-2027",
                  title: "Split Payment da Reforma Tributária",
                  note: "O que muda na liquidação e na agenda de recebíveis a partir de 2027.",
                },
                {
                  href: "/artigos/intercambio-guia-completo",
                  title: "Intercâmbio: guia completo",
                  note: "Como a cascata de cinco decisões define a tarifa de cada venda.",
                },
                {
                  href: "/jornada",
                  title: "O Pagamento por Dentro",
                  note: "Laboratório passo a passo com cartão, Pix, MED 2.0, boleto e regras 2027+.",
                },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="editorial-card group p-5 flex flex-col justify-between gap-3"
                >
                  <div className="space-y-1.5">
                    <h3 className="text-sm font-semibold text-foreground group-hover:underline underline-offset-4">
                      {item.title}
                    </h3>
                    <p className="font-serif text-xs text-muted-foreground leading-relaxed">
                      {item.note}
                    </p>
                  </div>
                  <span className="font-mono text-xs text-muted-foreground group-hover:text-foreground inline-flex items-center gap-1">
                    Abrir <ArrowRight size={12} />
                  </span>
                </Link>
              ))}
            </div>
          </div>

          <div className="editorial-card p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-1.5 max-w-xl">
              <h2 className="text-lg font-semibold text-foreground">Para conversar</h2>
              <p className="font-serif text-sm text-muted-foreground leading-relaxed">
                Aberto a conversas sobre posições executivas ou estratégicas em adquirentes,
                subadquirentes, emissores, bancos, fintechs, bandeiras e processadoras no Brasil e
                na América Latina.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <a
                href="https://www.linkedin.com/in/vinicius-sugamele-41136617/"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary text-xs"
              >
                Chamar no LinkedIn
              </a>
              <a
                href="mailto:vsugamele@gmail.com"
                className="btn-outline text-xs"
              >
                vsugamele@gmail.com
              </a>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
