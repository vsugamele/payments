# Sessão 2026-11-13 — Payments Intelligence Workbench 2.0 ("Paper & Precision" Design System)

## Escopo e Objetivo
Execução da nova arquitetura unificada **Payments Intelligence Workbench 2.0 (Padrão Stripe Docs / Adyen / Visa Developer)** para consolidar todas as ferramentas técnicas, catálogos, simuladores e bases do acervo em uma experiência limpa, progressiva e orientada à jornada cronológica de uma transação de pagamento.

## Entregas Realizadas

1. **App Shell Unificado (`frontend/components/PaymentsWorkbenchShell.tsx` + `frontend/app/layout.tsx`)**
   - **Top Global Context Bar Persistente**:
     - Seletor global de **Bandeira** (`Todas`, `Visa`, `Mastercard`, `Elo`, `Amex`) sincronizado via `localStorage` e evento `workbench-context-change`.
     - Seletor global de **Lente Operacional** (`Ambos`, `Adquirente / PayFac`, `Emissor`).
     - Indicadores ao vivo do Corpus (`40.129 Docs · 17.106 Campos PDF · 385 Releases`) e botão direto para a Busca Omnibox Global (`Ctrl+K`).
   - **Sidebar Esquerda Colapsável Organizada nas 5 Estações Cronológicas do Pagamento**:
     1. `01. Autorização & Segurança` (Mapa de Bits 128b, Catálogo Campos ISO/PDS, 3DS 2.2 & CAVV v9, Tokenização, Retentativas)
     2. `02. Clearing & Outgoing` (Tabelas Separadas 28+7, 8 Fluxos Ponta a Ponta, Matriz Tabelas × Fluxos, Sandbox C➔M, Parser Forense de Lote Real PCI, Setores IATA/Hotel/Locadora)
     3. `03. Liquidação & Reports` (Reports Diários VSS/VCX/T112, Conciliação SLC/B3, Faturas MCBS TN3A, Tabelas MPE Forense)
     4. `04. Intercâmbio & Pricing` (Calculadora Downgrade R$ & Amex, Simulador MDR, Scheme Fees 454 Billing Lines, Tarifas Curadas & Tetos BCB)
     5. `05. Governança, Releases & Acervo` (Central de Boletins 3 Lentes + CSV, Acervo Plugado & 6 Filas, Explorador RAG FTS5, Disputas CE 3.0, 18 Programas, Gerador Waiver & RCA, Academy 5 Módulos, Cockpit Geral)
   - Preservação das rotas públicas executivas (`/`, `/sobre`) sem sidebar técnica.

2. **Reestruturação de Navegação + Inspector Drawer no Outgoing (`frontend/app/compliance/outgoing/OutgoingClient.tsx`)**
   - Substituição do mural de 14 botões de topo por um **Seletor Limpo de 4 Estações Operacionais** (`📐 1. Engenharia de Mensageria & Lote`, `🏦 2. Liquidação, Reports & Pricing (R$)`, `🛡️ 3. Disputas, Programas & Waivers`, `🗄️ 4. Acervo PDF & Academy`) com sub-barra contextual enxuta.
   - Sincronização bidirecional com `?tab=...` na URL e com a Sidebar do `PaymentsWorkbenchShell`.
   - **Tabela Enxuta de 5 Colunas (`Visão Limpa`) + Slide-Over Inspector Drawer (`460px` à direita)**:
     - Clicar em qualquer bloco da Régua Posicional ou linha da Tabela de Campos abre o **Slide-Over Inspector Drawer** com terminal escuro isolado (`Wire / Byte Inspector`), definição técnica, regra Obrigatório `[M]` vs Condicional `[C]`, impacto de reject/downgrade, navegação `← Campo Anterior / Próximo Campo →` e botões de ação em 1 clique (`Simular Downgrade R$`, `Testar C ➔ M no Sandbox`, `Consultar nos 17.106 Campos PDF do Acervo`).

3. **Design System "Paper & Precision" (`frontend/app/globals.css`)**
   - Alinhamento numérico tabular (`font-variant-numeric: tabular-nums`) em todas as tabelas, réguas de bytes e blocos de código.
   - Classe `.dark-terminal` para manter blocos `<pre>` de inspeção de bytes/hex com contraste escuro (`#0f172a` / `#38bdf8`) sobre páginas editoriais claras (`#F8FAFC` / `#FFFFFF`).

## Arquivos Criados / Modificados
- `frontend/components/PaymentsWorkbenchShell.tsx` (novo)
- `frontend/app/layout.tsx` (modificado)
- `frontend/app/compliance/outgoing/OutgoingClient.tsx` (modificado)
- `frontend/app/globals.css` (modificado)
- `docs/sessions/2026-11/2026-11-13-workbench-2-0-design-system.md` (novo)

## Validação e Próximos Passos
- Verificação estática TypeScript (`npx tsc --noEmit`) sem erros.
- Terminologia revisada ("Mandate" / "Obrigatório", sem uso de "Mandato").
