"use client";

import { useState } from "react";
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

type Lang = "pt" | "en";

const CONTENT = {
  pt: {
    eyebrow: "Currículo & Trajetória",
    intro:
      "Trabalho com meios de pagamento há mais de 16 anos, quase sempre no ponto em que a regra da bandeira encontra o sistema em produção e o fechamento financeiro. Hoje sou Head de Bandeiras na EcommIT, depois de passagens por Bandeira Elo, Getnet e Verifone / American Express.",
    downloadPdf: "Baixar currículo em PDF",
    location: "São Paulo, SP · Brasil",
    languagesLine: "Português, Inglês avançado e Espanhol profissional",
    guideHeading: "O que guia meu trabalho",
    guideParagraphs: [
      "Em meios de pagamento, quase todo problema caro nasce no espaço entre duas áreas que falam línguas diferentes. Um campo mal preenchido no DE 22 ou um identificador perdido entre a autorização e o arquivo noturno de clearing raramente derruba o sistema na hora — ele aparece semanas depois, escondido em uma queda de aprovação, em um downgrade silencioso de intercâmbio ou em uma multa de Data Integrity na fatura da bandeira.",
      "O meu papel ao longo desses anos tem sido justamente juntar as três pontas que costumam andar separadas: a leitura do regulamento e dos boletins semestrais (Visa, Mastercard, Elo, Amex e Banco Central), o detalhe técnico da mensagem e da certificação, e a conta que fecha no resultado financeiro da operação.",
      "Gosto de trabalhar com regra rastreável: citar o manual, a data de vigência e o que acontece na prática se a empresa não se mexer a tempo. Isso evita retrabalho de engenharia e dá previsibilidade para produto, risco e financeiro decidirem juntos.",
    ],
    pillarsEyebrow: "Atuação no dia a dia",
    pillarsHeading: "As três frentes que costumo conduzir juntas",
    pillars: [
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
    ],
    expEyebrow: "Histórico profissional",
    expHeading: "Experiência",
    experience: [
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
    ],
    ecoEyebrow: "Ecossistema",
    ecoHeading: "Instituições e parceiros com quem já atuei",
    ecosystem: [
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
    ],
    projEyebrow: "Entregas relevantes",
    projHeading: "Projetos que marcaram essa trajetória",
    projects: [
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
    ],
    eduEyebrow: "Formação",
    eduHeading: "Formação acadêmica e idiomas",
    education: [
      {
        meta: "2020 · PUCRS",
        title: "MBA em Liderança, Inovação e Gestão 3.0",
        desc: "Liderança funcional, gestão de produtos digitais e tomada de decisão em ambientes ágeis.",
      },
      {
        meta: "2011 · UNIP",
        title: "Gestão da Tecnologia da Informação",
        desc: "Engenharia de sistemas, governança de TI, bancos de dados e infraestrutura transacional.",
      },
    ],
    languages: [
      { lang: "Português", level: "Nativo", note: "Comunicação técnica e executiva" },
      { lang: "Inglês", level: "Avançado", note: "Reuniões com bandeiras e manuais" },
      { lang: "Espanhol", level: "Profissional", note: "Operações na América Latina" },
    ],
    skillsEyebrow: "Repertório técnico",
    skillsHeading: "Competências",
    skills: [
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
    ],
    readHeading: "Por onde começar a ler",
    readIntro:
      "Além do trabalho diário, escrevo notas sobre regulação, tarifas e bastidores do setor. Se quiser escolher três leituras rápidas:",
    reads: [
      {
        href: "/noticias/split-payment-reforma-tributaria-2027",
        title: "Split Payment da Reforma Tributária",
        note: "O que muda na liquidação e na agenda de recebíveis a partir de 2027.",
        cta: "Abrir",
      },
      {
        href: "/artigos/intercambio-guia-completo",
        title: "Intercâmbio: guia completo",
        note: "Como a cascata de cinco decisões define a tarifa de cada venda.",
        cta: "Abrir",
      },
      {
        href: "/jornada",
        title: "O Pagamento por Dentro",
        note: "Laboratório passo a passo com cartão, Pix, MED 2.0, boleto e regras 2027+.",
        cta: "Abrir",
      },
    ],
    talkHeading: "Para conversar",
    talkText:
      "Aberto a conversas sobre posições executivas ou estratégicas em adquirentes, subadquirentes, emissores, bancos, fintechs, bandeiras e processadoras no Brasil e na América Latina.",
    talkCta: "Chamar no LinkedIn",
  },
  en: {
    eyebrow: "Resume & Background",
    intro:
      "I have worked in card payments for over 16 years — usually at the exact intersection where card network rules meet production messaging and the P&L. Today I am Head of Card Schemes at EcommIT, after prior roles at Elo, Getnet, and Verifone / American Express.",
    downloadPdf: "Download Resume (PDF)",
    location: "São Paulo, Brazil",
    languagesLine: "Portuguese (Native), English (Advanced), Spanish (Business)",
    guideHeading: "What guides my work",
    guideParagraphs: [
      "In payments, most expensive problems happen in the gap between teams that speak different languages. A misformatted DE 22 field or a missing identifier between online authorization and overnight clearing rarely crashes a system immediately — it surfaces weeks later as a silent drop in approval rate, an interchange downgrade, or a Data Integrity assessment on the scheme invoice.",
      "My role over the years has been to bridge the three sides that often operate in silos: card network rulebooks and semi-annual releases (Visa, Mastercard, Elo, Amex, and Central Bank of Brazil), technical messaging and certifications, and the financial margin of the operation.",
      "I prefer traceable governance: citing the manual, effective date, and practical impact if a team misses a deadline. That avoids engineering rework and gives Product, Risk, and Finance a shared basis to decide.",
    ],
    pillarsEyebrow: "Day-to-day scope",
    pillarsHeading: "Three fronts I connect together",
    pillars: [
      {
        num: "01",
        title: "Authorization, Clearing & Settlement",
        desc: "ISO 8583 messaging, overnight clearing files (Base II, GCMS IPM, Elo Service 10, Amex CAS), receivables registration (B3/CERC), and end-to-end settlement reconciliation.",
      },
      {
        num: "02",
        title: "Approval Rate, Tokens & Authentication",
        desc: "3DS 2.2 rollouts, Network Tokens (VTS, MDES, Elo), Account Updater (VAU/ABU), decline root-cause analysis, and issuer performance alignment.",
      },
      {
        num: "03",
        title: "Fees, Releases & Scheme Governance",
        desc: "Semi-annual mandates and certifications (ADVT/L3, MTIP, TQS), MCBS and Visa VSS invoice audits, interchange qualification, waiver management, and monitoring programs (VAMP, ECP, BRAM).",
      },
    ],
    expEyebrow: "Career history",
    expHeading: "Experience",
    experience: [
      {
        role: "Head of Card Schemes",
        company: "EcommIT Integrated Solutions",
        period: "Oct 2023 – Present",
        duration: "Current",
        desc: "Lead technical and business relationships with Visa, Mastercard, Elo, and American Express. Serve as internal authority on network rules across Product, Engineering, Risk, and Operations — managing semi-annual releases, certifications (Visa ADVT/L3, Mastercard MTIP, Elo TQS, Amex), Data Integrity compliance, waivers, MCBS/VSS billing audits, Interchange strategy, and authorization-to-clearing incident resolution. Direct advisory and delivery for Checkout.com, Getnet, PicPay, Mercado Pago, Banco BS2, Banco Inter, Entrepay, and processors DXC Technology, AM53, and Payware.",
        tags: [
          "Visa",
          "Mastercard",
          "Elo",
          "Amex",
          "Data Integrity",
          "Mandates & Releases",
          "L3 / MTIP / TQS",
          "Interchange",
          "MCBS / VSS",
          "Waivers",
        ],
      },
      {
        role: "Operations Specialist (Performance & Troubleshooting)",
        company: "Elo (Card Scheme)",
        period: "Aug 2020 – Oct 2023",
        duration: "3 years",
        desc: "Consultative work maximizing approval rates and transaction stability across major Brazilian issuers (Bradesco, Banco do Brasil, Caixa), acquirers (Cielo, Getnet, Rede, Stone, PagBank), and processors. Led the buildout of the new Elo Acquirer Portal, root-cause investigations of declines and clearing mismatches, Elo TQS product certifications, and real-time operational analytics in Qlik Sense and Tableau.",
        tags: [
          "Elo Scheme",
          "Auth & Clearing",
          "Approval Performance",
          "Elo TQS",
          "Qlik Sense",
          "Tableau",
          "Elo Portal",
        ],
      },
      {
        role: "Senior Analyst / Settlement & Card Schemes Coordinator",
        company: "Getnet",
        period: "Sep 2017 – Oct 2020",
        duration: "3 years",
        desc: "Owned compliance, certifications (Visa ADVT, Mastercard M-TIP, Elo TQS, Amex), and mandatory release rollouts across Elo, Visa, Mastercard, Amex, and Hipercard. Led host certification for the dedicated processor/acquirer platform (Amadeus), quarterly regulatory reporting (QMR/GMR/EIR), MCBS/VSS invoice auditing with Finance, and strategic rollouts of 3DS 2.0, ABU/VAU (Account Updater), Network Tokenization (VTS/MDES), Contactless/HCE, QR Code, and Split/Marketplace.",
        tags: [
          "Getnet",
          "Scheme Compliance",
          "Amadeus Host",
          "3DS 2.0",
          "ABU / VAU",
          "VTS / MDES",
          "QMR / GMR",
          "MCBS / VSS",
        ],
      },
      {
        role: "Production & Business Analyst",
        company: "Verifone / American Express",
        period: "Aug 2009 – Sep 2017",
        duration: "8 years",
        desc: "Managed testing, certification, and EMV L2 homologation for POS capture solutions with Visa, Mastercard, American Express, issuers, and processors. Played a key role in migrating American Express global servers to Banco Bradesco (2014), designing corporate EDI processes, supporting the Multivan initiative, and maintaining POS, Contactless, gateway, and ISO 8583 operations.",
        tags: ["Amex", "Verifone", "EMV L2", "EDI", "ISO 8583", "Capture", "Multivan"],
      },
    ],
    ecoEyebrow: "Ecosystem",
    ecoHeading: "Institutions and partners served",
    ecosystem: [
      {
        title: "Acquirers, PayFacs & Fintechs",
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
        title: "Processors & Infrastructure",
        partners: ["DXC Technology", "AM53", "Payware", "Verifone", "Amadeus"],
      },
      {
        title: "Issuing Banks",
        partners: ["Banco Bradesco", "Banco do Brasil", "Caixa Econômica Federal"],
      },
      {
        title: "Card Schemes & Networks",
        partners: ["Elo", "American Express", "Visa", "Mastercard", "Hipercard"],
      },
    ],
    projEyebrow: "Selected work",
    projHeading: "Key initiatives",
    projects: [
      {
        title: "Release Governance, Data Integrity & Scheme Fee Control",
        company: "EcommIT",
        desc: "End-to-end management of semi-annual mandates, messaging integrity checks to prevent assessments, waiver negotiations, and MCBS/VSS & Interchange audits for acquirers, banks, and processors.",
      },
      {
        title: "New Elo Acquirer Portal & Approval Monitoring",
        company: "Elo",
        desc: "Built the Acquirer Portal and Qlik Sense / Tableau monitoring stack connecting issuers and acquirers to speed up decline troubleshooting.",
      },
      {
        title: "Amadeus Dedicated Acquirer / Processor Certification",
        company: "Getnet",
        desc: "Led host certification and network testing with card schemes to bring a dedicated processing platform live.",
      },
      {
        title: "ABU, VAU, Network Tokenization & 3DS 2.0 Rollout",
        company: "Getnet",
        desc: "Delivered Account Updater, VTS/MDES Network Tokens, and 3-D Secure 2.0 to reduce expired-card churn and secure liability shift.",
      },
      {
        title: "American Express Global Server Migration to Bradesco (2014)",
        company: "Verifone / American Express",
        desc: "Supported migration of Amex global hosts into Bradesco's infrastructure, establishing EDI flows and capture/settlement monitoring.",
      },
    ],
    eduEyebrow: "Education",
    eduHeading: "Academic background & languages",
    education: [
      {
        meta: "2020 · PUCRS",
        title: "MBA in Leadership, Innovation & Management 3.0",
        desc: "Functional leadership, digital product management, and agile decision-making.",
      },
      {
        meta: "2011 · UNIP",
        title: "B.S. in Information Technology Management",
        desc: "Systems engineering, IT governance, relational databases, and transaction infrastructure.",
      },
    ],
    languages: [
      { lang: "Portuguese", level: "Native", note: "Executive & technical fluency" },
      { lang: "English", level: "Advanced", note: "Global card scheme meetings & manuals" },
      { lang: "Spanish", level: "Professional", note: "Day-to-day LatAm operations" },
    ],
    skillsEyebrow: "Core stack",
    skillsHeading: "Competencies",
    skills: [
      {
        category: "Compliance & Certifications",
        items: [
          "Mandates & Releases",
          "Data Integrity",
          "Waiver Management",
          "Visa ADVT / L3",
          "Mastercard MTIP",
          "Elo TQS",
          "Amex Certifications",
        ],
      },
      {
        category: "Protocols & Messaging",
        items: [
          "ISO 8583 / ISO 20022",
          "Base II / IPM / T068",
          "EMV L2 & Contactless",
          "3DS 2.0 / 2.2",
          "Network Tokens (VTS/MDES/Elo)",
        ],
      },
      {
        category: "Fees & Billing",
        items: [
          "Interchange Qualification",
          "MCBS & Visa VSS Audits",
          "Scheme Fees Control",
          "Account Updater (VAU/ABU)",
          "Financial Viability",
        ],
      },
      {
        category: "Operations & Disputes",
        items: [
          "Authorization & Clearing",
          "SLC / CIP / Receivables",
          "Visa / MC / Elo Reason Codes",
          "VAMP / ECP / BRAM Programs",
          "Compelling Evidence 3.0",
        ],
      },
      {
        category: "Regulation & Instant Rails",
        items: [
          "BCB Res. 264 / 304 / 522",
          "Pix SPI / MED 2.0 / Automatic",
          "Open Finance (JSR)",
          "Brazil Tax Split (LC 214/2025)",
          "QMR / GMR / EIR Reporting",
        ],
      },
      {
        category: "Leadership & Tools",
        items: [
          "Cross-Functional Leadership",
          "Qlik Sense & Tableau",
          "SQL / DBeaver",
          "Advanced English",
          "Business Spanish",
        ],
      },
    ],
    readHeading: "Where to start reading",
    readIntro:
      "Outside day-to-day operations, I write practical notes (in Portuguese) on card schemes, regulation, and payment rails:",
    reads: [
      {
        href: "/noticias/split-payment-reforma-tributaria-2027",
        title: "Brazil Tax Reform Split Payment (LC 214/2025)",
        note: "What changes in settlement and receivables registration starting in 2027.",
        cta: "Read",
      },
      {
        href: "/artigos/intercambio-guia-completo",
        title: "Interchange: Complete Practical Guide",
        note: "How the five-step qualification waterfall determines transaction cost.",
        cta: "Read",
      },
      {
        href: "/jornada",
        title: "Payments Inside-Out Lab",
        note: "Interactive message-by-message lab covering cards, Pix, MED 2.0, boleto, and 2027 rules.",
        cta: "Open",
      },
    ],
    talkHeading: "Let's talk",
    talkText:
      "Open to executive and strategic roles across acquirers, payfacs, issuers, banks, fintechs, card schemes, and processors in Brazil and Latin America.",
    talkCta: "Message on LinkedIn",
  },
};

export function CurriculoView() {
  const [lang, setLang] = useState<Lang>("pt");
  const t = CONTENT[lang];

  return (
    <main className="bg-background min-h-dvh pb-24">
      <div className="mx-auto max-w-4xl px-6">
        {/* ── Abertura Editorial & Toggle PT | EN ─────────────────────────── */}
        <header className="pt-14 pb-12 border-b border-border">
          <div className="flex items-center justify-between gap-4 mb-5">
            <p className="section-eyebrow">{t.eyebrow}</p>

            {/* Seletor discreto PT | EN */}
            <div
              role="group"
              aria-label="Idioma do currículo"
              className="inline-flex items-center rounded-full border border-border bg-card p-0.5 font-mono text-xs"
            >
              <button
                type="button"
                onClick={() => setLang("pt")}
                className={`px-3 py-1 rounded-full transition-colors ${
                  lang === "pt"
                    ? "bg-[var(--action-bg)] text-[var(--action-fg)] font-medium"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                PT
              </button>
              <button
                type="button"
                onClick={() => setLang("en")}
                className={`px-3 py-1 rounded-full transition-colors ${
                  lang === "en"
                    ? "bg-[var(--action-bg)] text-[var(--action-fg)] font-medium"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                EN
              </button>
            </div>
          </div>

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
                {t.intro}
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
                  <span>{t.downloadPdf}</span>
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
                  <MapPin size={12} /> {t.location}
                </span>
                <span>·</span>
                <span>{t.languagesLine}</span>
              </div>
            </div>

            {/* Retrato limpo */}
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

        {/* ── O que guia meu trabalho ─────────────────────────────────────── */}
        <section className="py-12 border-b border-border space-y-5 max-w-3xl">
          <h2 className="text-xl sm:text-2xl font-semibold text-foreground tracking-tight">
            {t.guideHeading}
          </h2>
          <div className="font-serif text-base text-[var(--body-text)] leading-[1.8] space-y-4">
            {t.guideParagraphs.map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
        </section>

        {/* ── 3 Frentes ───────────────────────────────────────────────────── */}
        <section className="py-12 border-b border-border space-y-6">
          <div>
            <p className="section-eyebrow mb-2">{t.pillarsEyebrow}</p>
            <h2 className="text-xl sm:text-2xl font-semibold text-foreground tracking-tight">
              {t.pillarsHeading}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {t.pillars.map((item) => (
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

        {/* ── Experiência ─────────────────────────────────────────────────── */}
        <section className="py-12 border-b border-border space-y-8">
          <div>
            <p className="section-eyebrow mb-2">{t.expEyebrow}</p>
            <h2 className="text-xl sm:text-2xl font-semibold text-foreground tracking-tight">
              {t.expHeading}
            </h2>
          </div>

          <div className="space-y-6">
            {t.experience.map((exp, idx) => (
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

        {/* ── Ecossistema ─────────────────────────────────────────────────── */}
        <section className="py-12 border-b border-border space-y-6">
          <div>
            <p className="section-eyebrow mb-2">{t.ecoEyebrow}</p>
            <h2 className="text-xl sm:text-2xl font-semibold text-foreground tracking-tight">
              {t.ecoHeading}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {t.ecosystem.map((group) => (
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
            <p className="section-eyebrow mb-2">{t.projEyebrow}</p>
            <h2 className="text-xl sm:text-2xl font-semibold text-foreground tracking-tight">
              {t.projHeading}
            </h2>
          </div>

          <div className="divide-y divide-border/80">
            {t.projects.map((proj) => (
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

        {/* ── Formação, Idiomas & Competências ────────────────────────────── */}
        <section className="py-12 border-b border-border space-y-10">
          <div className="space-y-5">
            <div>
              <p className="section-eyebrow mb-2">{t.eduEyebrow}</p>
              <h2 className="text-xl sm:text-2xl font-semibold text-foreground tracking-tight">
                {t.eduHeading}
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {t.education.map((ed) => (
                <div key={ed.title} className="editorial-card p-5 space-y-1.5">
                  <p className="font-mono text-xs text-muted-foreground">{ed.meta}</p>
                  <h3 className="text-sm font-semibold text-foreground">{ed.title}</h3>
                  <p className="font-serif text-sm text-muted-foreground leading-relaxed">
                    {ed.desc}
                  </p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {t.languages.map((item) => (
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
              <p className="section-eyebrow mb-2">{t.skillsEyebrow}</p>
              <h2 className="text-xl sm:text-2xl font-semibold text-foreground tracking-tight">
                {t.skillsHeading}
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {t.skills.map((group) => (
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
              {t.readHeading}
            </h2>
            <p className="font-serif text-sm text-muted-foreground leading-relaxed max-w-2xl">
              {t.readIntro}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {t.reads.map((item) => (
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
                    {item.cta} <ArrowRight size={12} />
                  </span>
                </Link>
              ))}
            </div>
          </div>

          <div className="editorial-card p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-1.5 max-w-xl">
              <h2 className="text-lg font-semibold text-foreground">{t.talkHeading}</h2>
              <p className="font-serif text-sm text-muted-foreground leading-relaxed">
                {t.talkText}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <a
                href="https://www.linkedin.com/in/vinicius-sugamele-41136617/"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary text-xs"
              >
                {t.talkCta}
              </a>
              <a href="mailto:vsugamele@gmail.com" className="btn-outline text-xs">
                vsugamele@gmail.com
              </a>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
