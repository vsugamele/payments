# Sessão 25/11/2026 — Pacote de SEO Técnico & Dados Estruturados (`www.vinicius-sugamele.com`)

## Escopo
Auditoria ao vivo e correção completa de SEO técnico e estruturado no repositório `vsugamele/payments` (`frontend/`).

## Problemas encontrados na auditoria ao vivo
1. **Conflito de host canônico (`www` vs. apex):** a Vercel redireciona `https://vinicius-sugamele.com/` com `308` para `https://www.vinicius-sugamele.com/`, mas `layout.tsx`, `sitemap.ts`, `robots.ts` e `feed.xml` apontavam para o host sem `www` (todas as 43 URLs do sitemap batiam em redirect `308`).
2. **Conflito `robots.txt` × `sitemap.xml`:** `robots.ts` continha `Disallow: /trilhas` enquanto `sitemap.ts` listava `/trilhas`, e não incluía `/regulatorio` na lista `Allow`.
3. **Ausência de `<link rel="canonical">`:** 0 páginas públicas emitiam canonical explícito; `/sobre` duplicava `<CurriculoView />` de `/curriculo`.
4. **Ausência de Schema.org (JSON-LD):** `0` scripts `application/ld+json` em todas as rotas.
5. **Títulos e descriptions excedendo limites da SERP:** notícias com até 105 caracteres no `<title>`, capítulos de guia com 90 caracteres e descriptions até 213 caracteres.

## Alterações aplicadas
- Criados `frontend/lib/seo.ts` (`SITE_URL = "https://www.vinicius-sugamele.com"`, `buildPageMetadata`, `buildArticleTitle`, `truncateSeo` e construtores Schema.org) e `frontend/components/JsonLd.tsx`.
- Alinhado host canônico `https://www.vinicius-sugamele.com` em `frontend/app/layout.tsx`, `frontend/app/robots.ts`, `frontend/app/sitemap.ts`, `frontend/app/feed.xml/route.ts` e `frontend/components/ShareArticleBar.tsx`.
- Liberado `/trilhas` e incluído `/regulatorio` em `frontend/app/robots.ts`; removido `/sobre` duplicado de `frontend/app/sitemap.ts` e apontado `canonical: "/curriculo"` em `frontend/app/sobre/page.tsx`.
- Injetado grafo global `Person` + `WebSite` em `frontend/app/layout.tsx` e JSON-LD específico (`NewsArticle`, `TechArticle`, `BreadcrumbList`, `WebApplication`, `Dataset`, `DefinedTermSet`, `ProfilePage`) + `alternates.canonical` + `title`/`description` enxutos em todas as rotas públicas (`/`, `/guia`, `/guia/[slug]`, `/trilhas`, `/jornada`, `/regulatorio`, `/curriculo`, `/sobre`, `/leituras`, `/glossario`, `/noticias`, `/noticias/[slug]`, `/consultas`, `/consultas/[slug]`, `/artigos` e os 5 artigos técnicos).

## Validação
- `git grep "https://vinicius-sugamele.com" -- frontend/`: `0` ocorrências restantes.
- `npx next typegen && npx tsc --noEmit` em `frontend/`: `TSC_EXIT=0`.
- Preservados intactos arquivos de outra tarefa (`JornadaClient.tsx`, `TermTooltip.tsx`, `2026-11-25-jornada-contraste-tema.md`).

## Próximo passo sugerido
- Reenviar `https://www.vinicius-sugamele.com/sitemap.xml` no Google Search Console e opcionalmente criar imagens OpenGraph dinâmicas por artigo/notícia (`opengraph-image.tsx` em `/noticias/[slug]` e `/regulatorio`).
