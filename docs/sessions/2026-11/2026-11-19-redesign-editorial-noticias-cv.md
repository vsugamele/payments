# Sessão 2026-11-19 — Redesign Editorial (Cores Neutras, Menos Cara de IA, Home de Notícias e CV em Segunda Aba + Canto da Principal)

## Objetivo
Resolver o sistema de cores (eliminando gradientes neon, glows e fundos escuros vazando no modo claro), reduzir a estética e linguagem de "IA", transformar a página principal (`/`) em um hub editorial de notícias e análises de meios de pagamento mantendo o currículo acessível em um canto fixo da principal e em uma segunda aba dedicada (`/curriculo` e `/sobre`), incorporando o estilo de escrita claro e humano observado em `fghisi.com.br` combinado com a voz de Vinícius Sugamele.

## Arquivos Criados e Atualizados
- `frontend/app/layout.tsx`: carregamento das fontes `Inter` (UI/títulos), `Literata` (leitura editorial) e `DM_Mono` (datas, rótulos e códigos técnicos).
- `frontend/app/globals.css`: tokens editoriais limpos (papel `#fafafa`, cartões `#ffffff`, grafite `#222225` no claro; `#121214` / `#19191d` / `#f2f2f4` no escuro), botões sólidos em grafite sem glow neon, corpo de leitura `.article-body` em `Literata` e remoção de gradientes chamativos.
- `frontend/data/editorial-posts.ts`: base editorial com 5 notícias/notas comentadas ancoradas em normas reais do repositório (LC 214/2025 Split Payment, Visa Fee Schedule BRL + CAVV v9 AES maio/2026, Mastercard REG 2026.03 & Manual de Risco BCB 522, MED 2.0 Res. BCB 493/2025, Pix Automático & JSR Res. BCB 396/406/429) e índice unificado dos 5 artigos técnicos em `/artigos/*` + 4 temas.
- `frontend/components/HomeEditorialClient.tsx` e `frontend/app/page.tsx`: página principal editorial com cabeçalho limpo, assinatura do autor com atalho pro CV, busca em tempo real, 3 destaques com mini-figuras de dados, lista cronológica filtrável por tema, **card compacto do currículo no canto lateral direito (sticky)** + radar de consultas públicas, grid `Temas` 2×2 e faixa `Por onde começar` / `Também construo`.
- `frontend/app/noticias/page.tsx` e `frontend/app/noticias/[slug]/page.tsx`: arquivo e página completa de leitura de cada notícia/nota regulatória com síntese rápida, corpo em `Literata`, fonte normativa/vigência explícita e assinatura do autor.
- `frontend/components/CurriculoView.tsx`, `frontend/app/curriculo/page.tsx` e `frontend/app/sobre/page.tsx`: segunda aba dedicada ao currículo completo em prosa humana direta ("O que guia meu trabalho", 3 frentes de atuação, experiência completa EcommIT/Elo/Getnet/Verifone-Amex, ecossistema de parceiros, projetos, formação, competências, idiomas, "Por onde começar a ler" e contato).
- `frontend/components/Navbar.tsx`, `frontend/components/Footer.tsx`, `frontend/components/PaymentsWorkbenchShell.tsx`, `frontend/middleware.ts`: navegação limpa em abas (`Notícias`, `Currículo`, `Artigos`, `Consultas`, `Laboratório`), rodapé respeitando tema claro/escuro, liberação pública de `/curriculo`, `/noticias/*`, `/artigos/*`, `/consultas/*` e `/jornada` mantendo o Cockpit interno protegido por `vs_internal_pass=1`.
- `frontend/components/ArticleLayout.tsx`, `frontend/app/artigos/page.tsx`, `frontend/app/artigos/compelling-evidence-3-0/page.tsx`, `frontend/app/consultas/page.tsx`, `frontend/app/consultas/[slug]/page.tsx`, `frontend/app/jornada/page.tsx`, `frontend/app/jornada/PaygramaInteractiveLab.tsx`, `frontend/components/RagChat.tsx`: correção de cores hardcoded escuras em todas as páginas públicas e remoção de rótulos/visual de "Pergunte à IA / Cérebro Normativo".

## Validação
- `next typegen` e `tsc --noEmit` executados em `frontend/` com `TSC_EXIT=0` (19/11/2026).
- `next build` (produção Turbopack) executado em `frontend/` com `BUILD_EXIT=0` (`130/130` rotas estáticas/SSG geradas sem avisos de `metadataBase`).
- Auditoria visual ao vivo via browser em `http://localhost:3199` (1440×900 claro/escuro + 390×844 mobile) nas 7 rotas públicas principais (`/` + busca ao vivo, `/curriculo` + toggle `PT|EN`, `/guia`, `/noticias/aprovou-00-margem-sumiu-no-clearing`, `/artigos/intercambio-guia-completo` + TOC `Neste texto`, `/glossario`, `/leituras`): HTTP `200`, zero erros de rede/console, zero imagens quebradas. Correções pós-auditoria aplicadas: `overflow-x: auto` mobile em `.article-body table`, `/glossario` sempre com navbar editorial limpa, `resolvedTheme` no toggle de tema e `OwnerBar` compacto no mobile.

## Rodada 2 (19/11/2026 — Limpeza de Artigos, CV Bilíngue PT/EN, Glossário Público e Feed RSS)
- `frontend/app/artigos/intercambio-guia-completo/page.tsx`: corrigido erro factual sobre teto BCB (teto de `0,50%` no débito e `0,70%` no pré-pago pelas Resoluções BCB 246/2022 e 304/2023 desde 01/04/2023; crédito em livre mercado), removidas cores azuis antigas e trocados links privados por rotas públicas.
- `frontend/app/artigos/quando-a-ia-responde-quem-realmente-sabe/page.tsx`: removidos banners azul/roxo com `<Sparkles />` apontando para `/editor` (rota privada), alinhando o artigo ao visual editorial e redirecionando o convite ao debate para o LinkedIn.
- `frontend/components/ShareArticleBar.tsx`, `frontend/components/ArticleLayout.tsx` e `frontend/app/noticias/[slug]/page.tsx`: adicionados botões limpos de `Copiar link` e `Compartilhar no LinkedIn`.
- `frontend/components/CurriculoView.tsx`: adicionado seletor `PT | EN` completo para alternar todo o currículo entre Português e Inglês.
- `frontend/app/glossario/page.tsx` e `frontend/app/glossario/GlossarioClient.tsx`: redesign completo no tema papel/grafite, liberado para público em `middleware.ts`, `Navbar.tsx`, `PaymentsWorkbenchShell.tsx`, `HomeEditorialClient.tsx` e `Footer.tsx`.
- `frontend/app/feed.xml/route.ts`: criado feed RSS 2.0 público das notícias e artigos.

## Rodadas 3, 4 e 5 (19/11/2026 — Série "Na prática, por que quebrou?", `/guia`, `/leituras`, Sumário Lateral, SEO, JSON de Notícias e Conferência Visual)
- `frontend/data/editorial-posts.ts`, `frontend/data/noticias-extras.json` e `docs/editorial/como-publicar-noticia.md`: adicionadas 3 notas autorais da série *"Na prática, por que quebrou?"* (downgrade silencioso no clearing, queda de aprovação pós-release e leitura de faturas MCBS/VSS + waivers) + fluxo simplificado de publicação via JSON sem editar TSX.
- `frontend/data/guia-pagamentos.ts` e `frontend/app/guia/page.tsx`: Guia Geral de Pagamentos escrito em 6 capítulos (Cartão, Clearing/SLC/B3, Intercâmbio/MDR, Chargeback/CE 3.0, Pix/MED 2.0, Reforma 2027) com fontes oficiais e links diretos ao Laboratório `/jornada`.
- `frontend/app/leituras/page.tsx`: curadoria em 3 prateleiras (Normas do BCB com links oficiais, Manuais técnicos das bandeiras e Livros de operação/liderança).
- `frontend/components/ArticleToc.tsx`, `frontend/components/ArticleLayout.tsx`, `frontend/app/artigos/vdcap-taf-scof/page.tsx` e `frontend/app/artigos/passo-a-passo-transacao/page.tsx`: sumário lateral automático (`Neste texto`) nos artigos longos + remoção das últimas bordas `#0f172a` e fontes legadas.
- `frontend/app/layout.tsx`, `frontend/app/sitemap.ts`, `frontend/app/robots.ts` e `frontend/middleware.ts`: `metadataBase` configurado (`https://vinicius-sugamele.com`), `sitemap.xml` e `robots.txt` expondo apenas rotas públicas (mantendo `/admin` e `/compliance/*` bloqueados para indexação).

## Rodada 6 (19/11/2026 — `/guia/[slug]` em 9 Capítulos, `proxy.ts` Next 16, Capa OG 1200×630 e Posts Prontos para LinkedIn)
- `frontend/data/guia-pagamentos.ts`, `frontend/app/guia/page.tsx` e `frontend/app/guia/[slug]/page.tsx`: Guia expandido para 9 capítulos (adicionados Boleto NPC/SILOC/STR, Open Finance JSR e Abertura de Conta/KYC/BC Protege+) com URL própria por capítulo (`/guia/cartao`, `/guia/intercambio`, `/guia/pix`, `/guia/boleto`, `/guia/reforma-2027` etc.), navegação Anterior/Próximo, botão de compartilhamento e sitemap atualizado.
- `frontend/proxy.ts` (removendo `frontend/middleware.ts`): migração para a convenção oficial `proxy.ts` do Next.js 16, liberando `/guia/*` e `/opengraph-image`.
- `frontend/app/opengraph-image.tsx` e `frontend/app/layout.tsx`: capa editorial Open Graph 1200×630 gerada estaticamente em papel/grafite para compartilhamentos limpos no LinkedIn e WhatsApp.
- Conferido `Curriculo_Vinicius_Sugamele.pdf` em `frontend/public/` (05/11/2026, mais recente que `Curriculo_Vinicius_Sugamele_26.pdf` de 28/08/2026 na raiz — mantido o mais novo).
- `docs/editorial/posts-linkedin-prontos.md`: 3 posts prontos para publicação no LinkedIn a partir das notas e do Guia.

## Limites e Próximo Passo
- As notícias editoriais são estáticas em `frontend/data/editorial-posts.ts`, baseadas exclusivamente nas normas e consultas públicas já presentes no repositório. Para alimentação contínua de notícias externas no futuro, pode-se plugar um feed curado ou painel editorial no `/admin`.
