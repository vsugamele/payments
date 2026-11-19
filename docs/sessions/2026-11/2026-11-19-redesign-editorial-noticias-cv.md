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
- `next build` (produção Turbopack) executado em `frontend/` com `BUILD_EXIT=0` (`122/122` rotas estáticas/SSG geradas sem erros, incluindo `/`, `/curriculo`, `/sobre`, `/noticias`, `/noticias/[slug]`, `/artigos`, `/consultas` e `/jornada`).

## Limites e Próximo Passo
- As notícias editoriais são estáticas em `frontend/data/editorial-posts.ts`, baseadas exclusivamente nas normas e consultas públicas já presentes no repositório. Para alimentação contínua de notícias externas no futuro, pode-se plugar um feed curado ou painel editorial no `/admin`.
