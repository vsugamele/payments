"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Search,
  ArrowRight,
  FileDown,
  ExternalLink,
  Mail,
  MessageCircle,
  X,
} from "lucide-react";
import {
  EDITORIAL_POSTS,
  EDITORIAL_THEMES,
  type EditorialCategory,
  type EditorialNewsArticle,
} from "@/data/editorial-posts";

export interface ConsultaResumoItem {
  slug: string;
  bandeira: string;
  titulo: string;
  publicacao: string;
  vigencia: string;
}

const CATEGORIES: ("Todos" | EditorialCategory)[] = [
  "Todos",
  "Regulação",
  "Bandeiras",
  "Pix & BCB",
  "Intercâmbio",
  "Autorização & Risco",
];

function FeaturedVisual({ type }: { type?: EditorialNewsArticle["visualType"] }) {
  if (type === "split2027") {
    return (
      <div className="rounded-xl border border-border bg-muted/60 p-4 space-y-2.5">
        <div className="flex items-center justify-between font-mono text-[11px] text-muted-foreground">
          <span>LIQUIDAÇÃO · R$ 1.000</span>
          <span className="text-foreground font-medium">LC 214/2025</span>
        </div>
        {[
          { label: "Hoje (sem split)", lojista: 97.2, imposto: 0, mdr: 2.8, note: "97,2% livre p/ UR" },
          { label: "Split 2027+ (CBS)", lojista: 84.7, imposto: 12.5, mdr: 2.8, note: "84,7% livre p/ UR" },
        ].map((row) => (
          <div key={row.label} className="space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-medium text-foreground">{row.label}</span>
              <span className="font-mono text-muted-foreground">{row.note}</span>
            </div>
            <div className="h-2.5 w-full rounded-full overflow-hidden flex bg-border/60">
              <div style={{ width: `${row.lojista}%` }} className="bg-[#1e6b73]" />
              {row.imposto > 0 && (
                <div style={{ width: `${row.imposto}%` }} className="bg-[#c81e1e]" />
              )}
              <div style={{ width: `${row.mdr}%` }} className="bg-[#222225] dark:bg-zinc-400" />
            </div>
          </div>
        ))}
        <div className="flex flex-wrap gap-3 pt-0.5 font-mono text-[10px] text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <span className="size-2 rounded-full bg-[#1e6b73]" /> Lojista
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="size-2 rounded-full bg-[#c81e1e]" /> Tributo (Fisco)
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="size-2 rounded-full bg-[#222225] dark:bg-zinc-400" /> MDR
          </span>
        </div>
      </div>
    );
  }

  if (type === "visabrl") {
    return (
      <div className="rounded-xl border border-border bg-muted/60 p-4 space-y-2.5">
        <div className="flex items-center justify-between font-mono text-[11px] text-muted-foreground">
          <span>VISA BRASIL · RELEASE 26.1</span>
          <span className="text-foreground font-medium">01/05/2026</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg border border-border bg-card p-2.5">
            <div className="font-mono text-[10px] text-muted-foreground">ATÉ 30/04/2026</div>
            <div className="text-xs font-semibold text-foreground mt-0.5">Fatura VSS em USD</div>
            <div className="font-mono text-[11px] text-muted-foreground mt-1">CAVV v7 · 3DES</div>
          </div>
          <div className="rounded-lg border border-border bg-card p-2.5">
            <div className="font-mono text-[10px] text-[#1e6b73] dark:text-teal-400">DESDE 01/05/2026</div>
            <div className="text-xs font-semibold text-foreground mt-0.5">Fatura VSS em BRL</div>
            <div className="font-mono text-[11px] text-[#1f3fe0] dark:text-blue-400 mt-1">CAVV v9 · AES-128</div>
          </div>
        </div>
        <div className="font-mono text-[10px] text-muted-foreground">
          Ex.: TPA Visa · USD 5.000 → R$ 32.000
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-muted/60 p-4 space-y-2.5">
      <div className="flex items-center justify-between font-mono text-[11px] text-muted-foreground">
        <span>MASTERCARD · BCB 522</span>
        <span className="text-foreground font-medium">REG 2026.03</span>
      </div>
      <div className="grid grid-cols-4 gap-1.5 font-mono text-[11px]">
        {[
          { tier: "T1", note: "Baixo", tone: "bg-card text-foreground border-border" },
          { tier: "T2", note: "Atenção", tone: "bg-card text-foreground border-border" },
          { tier: "T3", note: "Cessão", tone: "bg-[#f2b01e]/15 text-[#9a6700] dark:text-amber-300 border-[#f2b01e]/40" },
          { tier: "T4", note: "Integral", tone: "bg-[#c81e1e]/10 text-[#c81e1e] dark:text-red-400 border-[#c81e1e]/30" },
        ].map((item) => (
          <div
            key={item.tier}
            className={`rounded-lg border px-2 py-2 text-center ${item.tone}`}
          >
            <div className="font-semibold">{item.tier}</div>
            <div className="text-[10px] opacity-80">{item.note}</div>
          </div>
        ))}
      </div>
      <div className="font-mono text-[10px] text-muted-foreground">
        Facilitadores: autorização BCB ou ≥ R$ 5 bi/ano
      </div>
    </div>
  );
}

export function HomeEditorialClient({
  consultasRecentes,
}: {
  consultasRecentes: ConsultaResumoItem[];
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<"Todos" | EditorialCategory>("Todos");

  const featuredPosts = useMemo(
    () => EDITORIAL_POSTS.filter((p) => p.featured).slice(0, 3),
    []
  );

  const filteredPosts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return EDITORIAL_POSTS.filter((post) => {
      const matchesCat = selectedCategory === "Todos" || post.category === selectedCategory;
      if (!matchesCat) return false;
      if (!q) return true;
      return `${post.title} ${post.summary} ${post.category} ${post.sourceNote || ""}`
        .toLowerCase()
        .includes(q);
    });
  }, [searchQuery, selectedCategory]);

  const postsByYear = useMemo(() => {
    const groups: Record<string, EditorialNewsArticle[]> = {};
    for (const post of filteredPosts) {
      if (!groups[post.year]) groups[post.year] = [];
      groups[post.year].push(post);
    }
    return Object.entries(groups).sort((a, b) => Number(b[0]) - Number(a[0]));
  }, [filteredPosts]);

  return (
    <main className="bg-background min-h-dvh pb-24">
      <div className="mx-auto max-w-6xl px-6">
        {/* ── Cabeçalho Editorial (sem gradiente, sem ruído) ──────────────── */}
        <header className="pt-14 pb-12 border-b border-border">
          <div className="max-w-3xl">
            <h1
              className="font-semibold text-foreground text-balance"
              style={{
                fontSize: "clamp(2.1rem, 4.4vw, 3.15rem)",
                lineHeight: 1.12,
                letterSpacing: "-0.03em",
              }}
            >
              Meios de pagamento, regras de bandeira e o que acontece entre o terminal e a liquidação.
            </h1>

            <p className="mt-5 font-serif text-base sm:text-lg text-muted-foreground leading-relaxed text-pretty">
              Notícias comentadas, mudanças regulatórias e bastidores de Visa, Mastercard, Elo,
              Amex, Pix e Banco Central — escritos a partir do dia a dia de quem acompanha essa
              engrenagem por dentro há mais de 16 anos.
            </p>

            {/* Assinatura do autor (atalho direto pro CV) + Busca */}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/curriculo"
                className="group inline-flex items-center gap-3 rounded-full border border-border bg-card pl-1.5 pr-4 py-1.5 hover:border-foreground/40 transition-colors"
              >
                <div className="relative size-9 rounded-full overflow-hidden border border-border shrink-0">
                  <Image
                    src="/vinicius_sugamele.jpg"
                    alt="Vinícius Sugamele"
                    fill
                    sizes="36px"
                    priority
                    className="object-cover object-top"
                  />
                </div>
                <div className="leading-tight">
                  <span className="block text-sm font-semibold text-foreground">
                    Vinícius Sugamele
                  </span>
                  <span className="block text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                    Currículo e trajetória →
                  </span>
                </div>
              </Link>

              <div className="relative flex-1 min-w-[230px] max-w-xs">
                <Search
                  size={15}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar notícias, normas ou temas"
                  aria-label="Buscar notícias, normas ou temas"
                  className="w-full rounded-full border border-border bg-card pl-9 pr-8 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground transition-colors"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    aria-label="Limpar busca"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              <a
                href="/Curriculo_Vinicius_Sugamele.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:border-foreground/40 transition-colors"
              >
                <FileDown size={14} />
                <span>CV em PDF</span>
              </a>
            </div>
          </div>
        </header>

        {/* ── Em Destaque (3 cards editoriais de notícias) ────────────────── */}
        <section className="py-12 border-b border-border">
          <div className="flex items-center justify-between mb-6">
            <p className="section-eyebrow">Em destaque</p>
            <Link
              href="/noticias"
              className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Todas as notícias →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredPosts.map((post) => (
              <Link
                key={post.slug}
                href={post.href}
                className="editorial-card group p-5 flex flex-col justify-between gap-4"
              >
                <div className="space-y-4">
                  <FeaturedVisual type={post.visualType} />
                  <div className="space-y-2">
                    <p className="font-mono text-xs text-muted-foreground">
                      {post.category} · {post.readTime}
                    </p>
                    <h2 className="text-base font-semibold text-foreground leading-snug group-hover:underline underline-offset-4 decoration-border">
                      {post.title}
                    </h2>
                    <p className="font-serif text-sm text-muted-foreground leading-relaxed text-pretty">
                      {post.summary}
                    </p>
                  </div>
                </div>
                <span className="font-mono text-xs text-foreground/80 group-hover:text-foreground inline-flex items-center gap-1">
                  Ler nota completa <ArrowRight size={12} />
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Bloco Principal 2 Colunas: Feed de Notícias + Canto do CV ───── */}
        <section className="py-12 border-b border-border">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Esquerda (8 cols): Notícias & Últimas Análises */}
            <div className="lg:col-span-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <p className="section-eyebrow">Notícias e últimas análises</p>
                <span className="font-mono text-xs text-muted-foreground">
                  {filteredPosts.length} {filteredPosts.length === 1 ? "texto" : "textos"}
                </span>
              </div>

              {/* Filtros em pílula */}
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => {
                  const active = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                        active
                          ? "bg-[var(--action-bg)] text-[var(--action-fg)] border-transparent"
                          : "bg-card text-muted-foreground border-border hover:text-foreground hover:border-foreground/30"
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>

              {/* Lista cronológica limpa */}
              {postsByYear.length === 0 ? (
                <div className="editorial-card p-8 text-center space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Nenhum texto encontrado para &ldquo;{searchQuery}&rdquo;.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory("Todos");
                    }}
                    className="btn-outline text-xs"
                  >
                    Limpar filtros
                  </button>
                </div>
              ) : (
                <div className="space-y-8 pt-2">
                  {postsByYear.map(([year, items]) => (
                    <div key={year} className="space-y-1">
                      <h3 className="font-mono text-xs font-medium text-muted-foreground pb-2 border-b border-border">
                        {year}
                      </h3>
                      <div className="divide-y divide-border/70">
                        {items.map((post) => (
                          <Link
                            key={post.slug}
                            href={post.href}
                            className="group py-4 flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-5 hover:bg-card/70 -mx-3 px-3 rounded-xl transition-colors"
                          >
                            <span className="font-mono text-xs text-muted-foreground w-16 shrink-0 tabular-nums">
                              {post.dateShort}
                            </span>
                            <div className="flex-1 min-w-0 space-y-1">
                              <div className="text-[15px] font-semibold text-foreground group-hover:underline underline-offset-4 decoration-border leading-snug">
                                {post.title}
                              </div>
                              <p className="font-serif text-sm text-muted-foreground leading-relaxed line-clamp-2">
                                {post.summary}
                              </p>
                            </div>
                            <span className="font-mono text-[11px] text-muted-foreground shrink-0">
                              {post.category} · {post.readTime}
                            </span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-2 flex flex-wrap items-center gap-5 text-sm font-medium">
                <Link
                  href="/noticias"
                  className="text-foreground underline underline-offset-4 decoration-border hover:decoration-foreground transition-colors"
                >
                  Ver todas as notícias →
                </Link>
                <Link
                  href="/artigos"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Arquivo de artigos técnicos →
                </Link>
              </div>
            </div>

            {/* Direita (4 cols): Canto do Currículo + Radar de Consultas */}
            <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-20">
              {/* Card Compacto do CV no canto da principal */}
              <div className="editorial-card p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <p className="section-eyebrow">Currículo</p>
                  <span className="font-mono text-[11px] text-muted-foreground">16+ anos</span>
                </div>

                <div className="flex items-center gap-3.5">
                  <div className="relative size-14 rounded-2xl overflow-hidden border border-border shrink-0">
                    <Image
                      src="/vinicius_sugamele.jpg"
                      alt="Vinícius Sugamele"
                      fill
                      sizes="56px"
                      className="object-cover object-top"
                    />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-base font-semibold text-foreground leading-tight">
                      Vinícius Sugamele
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Head de Bandeiras · EcommIT
                    </p>
                    <p className="text-xs text-muted-foreground">São Paulo, Brasil</p>
                  </div>
                </div>

                <p className="font-serif text-sm text-muted-foreground leading-relaxed text-pretty">
                  Trabalho no meio de campo entre bandeiras (Visa, Mastercard, Elo e Amex),
                  adquirentes, emissores e processadoras — traduzindo regras, releases, tarifas e
                  Data Integrity para o que produto, tecnologia e financeiro executam.
                </p>

                {/* Resumo cronológico compacto */}
                <div className="space-y-2 pt-1 border-t border-border text-xs">
                  {[
                    { period: "2023–atual", role: "Head de Bandeiras · EcommIT" },
                    { period: "2020–2023", role: "Operações & Performance · Elo" },
                    { period: "2017–2020", role: "Coord. Liquidação · Getnet" },
                    { period: "2009–2017", role: "Produção & EMV · Verifone / Amex" },
                  ].map((item) => (
                    <div key={item.period} className="flex items-baseline gap-2.5">
                      <span className="font-mono text-[11px] text-muted-foreground w-[70px] shrink-0 tabular-nums">
                        {item.period}
                      </span>
                      <span className="text-foreground/90 font-medium">{item.role}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-2.5 pt-1">
                  <Link
                    href="/curriculo"
                    className="btn-primary w-full inline-flex items-center justify-center gap-2 text-xs"
                  >
                    <span>Abrir currículo completo</span>
                    <ArrowRight size={14} />
                  </Link>

                  <div className="grid grid-cols-2 gap-2">
                    <a
                      href="/Curriculo_Vinicius_Sugamele.pdf"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-outline inline-flex items-center justify-center gap-1.5 text-xs py-2 px-3"
                    >
                      <FileDown size={13} />
                      <span>Baixar PDF</span>
                    </a>
                    <a
                      href="https://www.linkedin.com/in/vinicius-sugamele-41136617/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-outline inline-flex items-center justify-center gap-1.5 text-xs py-2 px-3"
                    >
                      <ExternalLink size={13} />
                      <span>LinkedIn</span>
                    </a>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border text-xs text-muted-foreground">
                    <a
                      href="https://wa.me/5511976546714?text=Ol%C3%A1%20Vin%C3%ADcius,%20vi%20seu%20site%20e%20gostaria%20de%20conversar."
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors"
                    >
                      <MessageCircle size={13} />
                      <span>(11) 97654-6714</span>
                    </a>
                    <a
                      href="mailto:vsugamele@gmail.com"
                      className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors"
                    >
                      <Mail size={13} />
                      <span>E-mail</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Bloco compacto de Consultas Públicas */}
              {consultasRecentes.length > 0 && (
                <div className="editorial-card p-5 space-y-3.5">
                  <div className="flex items-center justify-between">
                    <p className="section-eyebrow">Consultas públicas</p>
                    <Link
                      href="/consultas"
                      className="font-mono text-[11px] text-muted-foreground hover:text-foreground"
                    >
                      Ver todas →
                    </Link>
                  </div>
                  <div className="divide-y divide-border/70">
                    {consultasRecentes.slice(0, 3).map((c) => (
                      <Link
                        key={c.slug}
                        href={`/consultas/${c.slug}`}
                        className="block py-2.5 first:pt-0 last:pb-0 group"
                      >
                        <span className="font-mono text-[10px] uppercase text-muted-foreground">
                          {c.bandeira}
                        </span>
                        <p className="text-xs font-medium text-foreground group-hover:underline underline-offset-2 leading-snug mt-0.5">
                          {c.titulo}
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </aside>
          </div>
        </section>

        {/* ── Temas (Grid editorial 2x2) ──────────────────────────────────── */}
        <section className="py-12 border-b border-border">
          <p className="section-eyebrow mb-6">Temas</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {EDITORIAL_THEMES.map((theme) => {
              const items = theme.slugs
                .map((slug) => EDITORIAL_POSTS.find((p) => p.slug === slug))
                .filter((p): p is EditorialNewsArticle => Boolean(p));

              return (
                <div
                  key={theme.id}
                  className="editorial-card p-6 flex flex-col justify-between gap-4"
                >
                  <div className="space-y-3">
                    <div>
                      <h2 className="text-lg font-semibold text-foreground">{theme.title}</h2>
                      <p className="font-serif text-sm text-muted-foreground mt-1 leading-relaxed">
                        {theme.description}
                      </p>
                    </div>

                    <ul className="space-y-2 pt-2 border-t border-border/70">
                      {items.map((item) => (
                        <li key={item.slug}>
                          <Link
                            href={item.href}
                            className="text-sm text-foreground/90 hover:text-foreground hover:underline underline-offset-4 decoration-border transition-colors block leading-snug"
                          >
                            {item.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCategory(theme.categoryFilter);
                      window.scrollTo({ top: 480, behavior: "smooth" });
                    }}
                    className="self-start font-mono text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Filtrar por {theme.categoryFilter} →
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Faixa Inferior: Por onde começar + Também construo ─────────── */}
        <section className="pt-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-4">
              <p className="section-eyebrow">Por onde começar</p>
              <p className="font-serif text-sm text-muted-foreground leading-relaxed">
                Se você chegou agora e quer ler três textos que resumem o tipo de problema que
                acompanho no dia a dia:
              </p>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link
                    href="/noticias/split-payment-reforma-tributaria-2027"
                    className="font-semibold text-foreground underline underline-offset-4 decoration-border hover:decoration-foreground"
                  >
                    Split Payment da Reforma Tributária
                  </Link>
                  <span className="text-muted-foreground">
                    {" "}— o que muda na liquidação e na agenda de recebíveis.
                  </span>
                </li>
                <li>
                  <Link
                    href="/artigos/intercambio-guia-completo"
                    className="font-semibold text-foreground underline underline-offset-4 decoration-border hover:decoration-foreground"
                  >
                    Intercâmbio: guia completo
                  </Link>
                  <span className="text-muted-foreground">
                    {" "}— a cascata que decide quanto custa cada transação.
                  </span>
                </li>
                <li>
                  <Link
                    href="/artigos/quando-a-ia-responde-quem-realmente-sabe"
                    className="font-semibold text-foreground underline underline-offset-4 decoration-border hover:decoration-foreground"
                  >
                    Quando a IA responde, quem realmente sabe?
                  </Link>
                  <span className="text-muted-foreground">
                    {" "}— sobre repertório técnico e o risco de terceirizar o entendimento.
                  </span>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <p className="section-eyebrow">Também construo</p>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link
                    href="/jornada"
                    className="font-semibold text-foreground underline underline-offset-4 decoration-border hover:decoration-foreground"
                  >
                    O Pagamento por Dentro
                  </Link>
                  <span className="text-muted-foreground">
                    {" "}— simulador passo a passo de cartão, liquidação, contestação, Pix, MED 2.0,
                    boleto e regras 2027+.
                  </span>
                </li>
                <li>
                  <Link
                    href="/consultas"
                    className="font-semibold text-foreground underline underline-offset-4 decoration-border hover:decoration-foreground"
                  >
                    Radar de Consultas Públicas
                  </Link>
                  <span className="text-muted-foreground">
                    {" "}— resumos executivos e pontos de atenção das consultas de Visa, Mastercard e Elo.
                  </span>
                </li>
                <li>
                  <Link
                    href="/curriculo"
                    className="font-semibold text-foreground underline underline-offset-4 decoration-border hover:decoration-foreground"
                  >
                    Currículo &amp; Trajetória
                  </Link>
                  <span className="text-muted-foreground">
                    {" "}— 16+ anos em EcommIT, Bandeira Elo, Getnet e Verifone / American Express, com versão em PDF.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
