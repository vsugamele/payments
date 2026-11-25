# Sessão 2026-11-25 — Ajuste de contraste e tema em `/jornada`

## Objetivo
Corrigir o contraste quebrado no painel de detalhes das 8 fases em `/jornada` (`JornadaClient.tsx`), que usava cores inline legadas de modo escuro (`rgba(0,0,0,0.4)` e textos cinza/branco fixos) sobre o tema claro Editorial Grafite.

## Arquivos alterados
- `frontend/app/jornada/JornadaClient.tsx` — substituídos estilos inline escuros por tokens semânticos (`bg-card`, `bg-muted`, `border-border`, `text-foreground`, `text-[var(--body-text)]`, `text-muted-foreground`, `section-eyebrow`), cores de fase acessíveis (WCAG AA) em claro e escuro, grid responsivo corrigido no mobile, exibição do impacto de intercâmbio por canal, limpeza de imports não usados e correção de typos (`apresenta`, `algumas`).
- `frontend/components/TermTooltip.tsx` — substituído fundo escuro fixo (`bg-[#0a1120]` + `text-slate-300`, que colidia com overrides de `globals.css` no tema claro) por tokens semânticos (`bg-card`, `border-[var(--border-strong)]`, `text-[var(--body-text)]`) e corrigida lógica de posicionamento vertical (`above`/`below`).

## Validação
- `npx tsc --noEmit` em `frontend/`: zero erros em `JornadaClient.tsx` e `TermTooltip.tsx` (foram observados apenas erros pré-existentes em 4 arquivos de `frontend/app/artigos/`, preservados intactos por pertencerem a outra tarefa).
- `npx eslint app/jornada/JornadaClient.tsx components/TermTooltip.tsx`: passou sem erros ou warnings (exit code 0).

## Limites e próximo passo
- Validação visual em navegador local não executada nesta sessão; conferir `/jornada` nos temas claro e escuro após recarregar o servidor dev.
- Outros 25 arquivos modificados pré-existentes no working tree foram preservados sem alteração.

## Complemento & Publicação (25/11/2026)
- Adicionados links públicos (`publicPlaybooks`, `/regulatorio` e `/guia/disputas`) para visitantes sem sessão proprietária em `JornadaClient.tsx`, mantendo os links internos (`/compliance/*`, `/simulador`, `/acervo`) para o proprietário logado.
- Validado `npx tsc --noEmit` (`0` erros globais) + `eslint` e publicado em `origin/main` (Vercel Production).
