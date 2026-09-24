"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Copy,
  Check,
  FileText,
  Sparkles,
  Eye,
  Layers,
} from "lucide-react";

function LinkedInIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
    </svg>
  );
}

const TOTAL_SLIDES = 9;
const SLIDES = Array.from({ length: TOTAL_SLIDES }, (_, i) => ({
  id: i + 1,
  src: `/carousel/slide_0${i + 1}.png`,
  title: [
    "Capa: Quando a IA responde, quem realmente sabe?",
    "A Ilusão da Facilidade",
    "A Perda do Atrito Cognitivo",
    "A Falsa Sensação de Domínio",
    "O Risco Real: Ilusão de Competência",
    "A Armadilha Invisível",
    "Onde a IA Não Consegue Ir",
    "5 Perguntas para Líderes",
    "Conclusão: Onde Vive o Diferencial",
  ][i],
}));

const POST_COPIES = [
  {
    label: "Gancho 1: Provocativo & Estratégico (Recomendado)",
    text: `A Inteligência Artificial já lê um boletim de bandeira de 80 páginas em 4 segundos e resume o impacto operacional para a sua adquirente.

Isso é extraordinário.

Mas me faça uma resposta honesta:

Quando a IA responde... quem realmente sabe?

A indústria de pagamentos foi construída no que eu chamo de "atrito cognitivo":
• Abrir documentações densas
• Rastrear campos ISO 8583 e tags EMV
• Errar a interpretação de uma regra de clearing
• Debater com profissionais mais experientes até a engrenagem fazer sentido

Era trabalhoso. Mas era exatamente esse atrito que criava intuição técnica e repertório duradouro.

Hoje, um profissional júnior recebe uma síntese perfeita em segundos.
O risco silencioso? A ferramenta substitui o aprendizado antes que o fundamento seja construído.

A IA sabe correlacionar dados do passado.
Ela não carrega a responsabilidade quando uma liquidação falha às 3h da manhã.

👉 Preparei um carrossel visual com o ensaio completo e 5 perguntas que todo líder de pagamentos deveria fazer ao seu time hoje.

Deslize os slides abaixo ⤵

Como você tem visto isso na prática? A IA está acelerando a formação ou criando atalhos perigosos? Deixe sua visão nos comentários.

#MeiosDePagamento #Pagamentos #InteligenciaArtificial #Tecnologia #Liderança #Inovacao`,
  },
  {
    label: "Gancho 2: Foco em Carreira & Formação Técnica",
    text: `Estamos formando especialistas ou apenas bons operadores de prompt?

Se você tirasse a IA da sua equipe hoje, quanto conhecimento técnico continuaria vivo na empresa e quanto desapareceria ao fechar a aba do navegador?

No carrossel anexo, fiz uma reflexão honesta sobre o impacto da IA na formação técnica em meios de pagamento:
- Por que a ausência de atrito cognitivo impede a memória duradoura
- A ilusão de competência: saber a resposta vs. entender o mecanismo
- Onde a IA é imbatível e onde o discernimento humano continua insubstituível

Deslize para ver o ensaio visual completo 📊

Qual a sua opinião sobre o equilíbrio entre velocidade e profundidade técnica?

#Pagamentos #Carreira #IA #Fintech #Tecnologia #Formacao`,
  },
  {
    label: "Gancho 3: Direto para Executivos & Tomadores de Decisão",
    text: `Qual é o risco de colocar a governança de regras de bandeira na mão de quem domina o prompt, mas não domina o arranjo?

A IA é uma aliada espetacular de produtividade. Mas ela tem uma armadilha sutil: ela gera respostas com a mesma eloquência quando está certa e quando está alucinando um detalhe crítico de liquidação.

O diferencial de uma operação de pagamentos de alto nível nunca será quem sabe perguntar melhor para a IA.
Será quem tem bagagem técnica para saber quando a resposta dela NÃO é boa o suficiente.

Confira no carrossel de 9 páginas as 5 perguntas de governança técnica que todo executivo deveria levar para a mesa de diretoria.

Baixe ou visualize os slides abaixo ⤵

#GovTech #Pagamentos #Fintech #Compliance #Estrategia #IA`,
  },
];

export function LinkedInCarouselViewer() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [copiedHook, setCopiedHook] = useState<number | null>(null);
  const [selectedHookTab, setSelectedHookTab] = useState(0);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % TOTAL_SLIDES);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + TOTAL_SLIDES) % TOTAL_SLIDES);
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedHook(index);
    setTimeout(() => setCopiedHook(null), 2500);
  };

  return (
    <div className="my-10 p-5 sm:p-8 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-2xl relative overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold tracking-wide uppercase mb-2">
            <LinkedInIcon /> Carrossel Visual para LinkedIn
          </div>
          <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Formato Carrossel (Documento PDF)
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
            Pronto para postar no LinkedIn como <strong>Documento</strong> (PDF 4:5 vertical).
            Gera navegação nativa de slides com alta taxa de retenção no feed.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <a
            href="/Carrossel_LinkedIn_Quando_a_IA_responde.pdf"
            download="Carrossel_LinkedIn_Quando_a_IA_responde.pdf"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-blue-500/25 transition-all transform active:scale-95"
          >
            <Download size={16} />
            <span>Baixar Carrossel PDF</span>
          </a>
        </div>
      </div>

      {/* Main Content: Slide Viewer + Post Copy Generator */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Slide Viewer (5 cols) */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="relative w-full max-w-[340px] sm:max-w-[380px] aspect-[4/5] rounded-2xl overflow-hidden bg-slate-950 border-2 border-slate-800 shadow-2xl group">
            {/* Current Slide Image */}
            <Image
              src={SLIDES[currentSlide].src}
              alt={SLIDES[currentSlide].title}
              fill
              className="object-cover select-none"
              priority
            />

            {/* Navigation Arrows */}
            <button
              onClick={prevSlide}
              aria-label="Slide anterior"
              className="absolute left-2 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-slate-950/70 hover:bg-blue-600 text-white backdrop-blur-md border border-white/10 transition-all opacity-80 hover:opacity-100 shadow-lg"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={nextSlide}
              aria-label="Próximo slide"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-slate-950/70 hover:bg-blue-600 text-white backdrop-blur-md border border-white/10 transition-all opacity-80 hover:opacity-100 shadow-lg"
            >
              <ChevronRight size={20} />
            </button>

            {/* Top Indicator */}
            <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-[11px] font-bold text-slate-300 border border-white/10">
              Slide {currentSlide + 1} de {TOTAL_SLIDES}
            </div>
          </div>

          {/* Slide Description & Thumbnail Dots */}
          <div className="mt-3 text-center w-full max-w-[380px]">
            <p className="text-xs font-semibold text-slate-300 truncate">
              {SLIDES[currentSlide].title}
            </p>
            {/* Dots */}
            <div className="flex items-center justify-center gap-1.5 mt-3">
              {SLIDES.map((slide, idx) => (
                <button
                  key={slide.id}
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-2 rounded-full transition-all ${
                    idx === currentSlide
                      ? "w-6 bg-blue-500"
                      : "w-2 bg-slate-700 hover:bg-slate-500"
                  }`}
                  aria-label={`Ir para o slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right: LinkedIn Post Copies & How-To (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Post Tabs */}
          <div className="bg-slate-950/70 rounded-2xl border border-slate-800 p-5">
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles size={14} className="text-blue-400" />
                Texto do Post (Copy Mestre para LinkedIn)
              </span>
              <button
                onClick={() => copyToClipboard(POST_COPIES[selectedHookTab].text, selectedHookTab)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all"
              >
                {copiedHook === selectedHookTab ? (
                  <>
                    <Check size={14} className="text-emerald-300" />
                    <span>Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy size={14} />
                    <span>Copiar Post</span>
                  </>
                )}
              </button>
            </div>

            {/* Hook Selector Tabs */}
            <div className="flex flex-wrap gap-2 mb-4">
              {POST_COPIES.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedHookTab(idx)}
                  className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all ${
                    selectedHookTab === idx
                      ? "bg-blue-500/20 text-blue-400 border border-blue-500/40"
                      : "bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200"
                  }`}
                >
                  Opção {idx + 1}
                </button>
              ))}
            </div>

            <p className="text-[11px] text-blue-300 font-medium mb-2">
              {POST_COPIES[selectedHookTab].label}
            </p>

            {/* Code / Preformatted Text box */}
            <div className="relative">
              <textarea
                readOnly
                value={POST_COPIES[selectedHookTab].text}
                rows={11}
                className="w-full p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs sm:text-[13px] text-slate-200 font-mono leading-relaxed resize-none focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Quick Guide: How to Post */}
          <div className="p-4 rounded-xl bg-blue-950/30 border border-blue-900/50 flex flex-col gap-2">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-wide flex items-center gap-1.5">
              <FileText size={14} /> Como postar no LinkedIn em 3 passos:
            </span>
            <ol className="text-xs text-slate-300 space-y-1.5 list-decimal list-inside leading-relaxed">
              <li>
                Clique no botão azul acima e baixe o arquivo <strong>PDF do Carrossel</strong>.
              </li>
              <li>
                No LinkedIn, clique em <strong>Começar publicação</strong> e selecione o ícone de <strong>Documento</strong> (ícone de página/PDF).
              </li>
              <li>
                Suba o PDF, dê o título <em>&quot;Quando a IA responde, quem realmente sabe?&quot;</em> e cole o texto copiado acima no corpo do post.
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
