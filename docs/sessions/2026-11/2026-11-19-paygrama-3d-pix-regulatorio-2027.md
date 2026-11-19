# Sessão 2026-11-19 — Absorção Visual & Estrutural (Estilo Paygrama 3D + Sequência ms + Pix + Regulatório & Roadmap 2027+ + Perfil Editorial `/sobre`)

## Objetivo e Escopo
Absorver a arquitetura visual, a organização didática e os padrões de interação do laboratório `Paygrama` e do perfil editorial de referência (`fghisi.com.br`), combinando-os com a profundidade técnica e normativa do VS Payments Workbench e expandindo o escopo para cobrir **Pix (SPI / DICT / ISO 20022)**, **Pix Automático & Pix por Aproximação (NFC / JSR)**, **Devolução & MED 2.0 (Rastreio Multinível)**, **Open Finance (JSR FIDO2) & Drex**, e **Regras no Tempo & O Que Vem para 2027–2030** (incluindo o **Split Payment Tributário Automático da Reforma Tributária — LC 214/2025**).

## Arquivos Criados e Atualizados
1. `frontend/app/jornada/PaygramaInteractiveLab.tsx`:
   - **Passo `① Escolha o Cenário` (Pílulas Progressivas + Injeção de Falhas)**:
     - **8 Trilhas Interativas em Pílulas**:
       1. `1. Cartão (4 Bandeiras — 0100/0110)`: POS Chip EMV, Tap on Phone (SoftPOS NFC), E-Commerce 3DS 2.2 (Sem Desafio *Frictionless* vs Com Desafio no App com `CAVV v9 AES`) e Carteira Digital (Network Token `VTS/MDES/Elo`);
       2. `2. Liquidação & SLC/B3 (D+0 ➔ D+1)`: Outgoing (`.CTF` 168B, `.IPM` TLV, `.TXT` Serviço 10, `.CAS` 600B), crítica `T+0`, registro de Unidade de Recebível (`UR` na B3/CERC — Res. BCB 264) e compensação multilateral `ASLC026/028/031` na CIP/Núclea + STR/Bacen;
       3. `3. Contestação & CE 3.0`: Alerta Pré-Disputa (`Verifi RDR / Ethoca`), First Chargeback (`TC 15 / MTI 1442 / TE 15`), bloqueio automático por *Liability Shift* 3DS (`ECI 05/02`) e reversão com **Compelling Evidence 3.0** (2 compras históricas >120 dias com mesmo IP e Device ID);
       4. `4. Pix Instantâneo (SPI — pacs.008)`: Leitura de BR Code EMV®, consulta antifraude ao DICT, validação de Limite Noturno (`IN BCB 331`), liquidação bruta em tempo real nas Contas PI do Banco Central (`pacs.008`) e confirmação `pacs.002` / Bloqueio Cautelar de 72h (`Res. BCB 147`);
       5. `5. Pix Automático & NFC (2026/2027)`: Autorização única de mandato recorrente (`pain.009`), agendamento `D-2` (`pain.013`) com notificação push `D-1`, retentativas padronizadas e Pix por Aproximação NFC;
       6. `6. Devolução & MED 2.0`: Autoatendimento padronizado no app, notificação de infração no DICT e **grafo multinível do MED 2.0 (2026/2027)** rastreando e bloqueando recursos pulverizados nas Contas Nível 1, 2 e 3 com devolução via `pacs.004`;
       7. `7. Open Finance & Drex`: Iniciação de Pagamento via **Jornada Sem Redirecionamento (JSR — Res. BCB 396/406)** com assinatura biométrica `FIDO2 / WebAuthn` sem abrir o app bancário;
       8. `8. Boleto NPC & BolePix`: Emissão e registro online na Nova Plataforma de Cobrança (`ADDA101` na CIP/Núclea), DDA, Fator de Vencimento Febraban reiniciado em `22/02/2025 = 1000`, e liquidação via `SILOC (< R$ 250 mil em D+1)` vs `STR (>= R$ 250 mil em D+0 — Msg STR0039)`;
       9. `9. Abertura de Conta & BC Protege+`: Onboarding digital com Liveness 3D (`ISO/IEC 30107-3`), consulta à Receita Federal e ao sistema **BC Protege+** do Banco Central (bloqueio voluntário contra abertura de contas falsas), screening PLD/FT (`PEP / OFAC / CSNU` — Circular 3.978) e provisionamento de Conta PI no DICT + Cartão Virtual Tokenizado;
       10. `10. Regras no Tempo & 2027+`: Simulador de viagem no tempo (`2022 Pré-BCB 304` vs `2026 Visa BRL + CAVV v9` vs `2027+ Split Payment Tributário LC 214/2025 + Passkeys + Agentic Commerce`).
     - Cálculo automático e explicação inline do **Modelo de Arranjo** (*4 Partes*, *Subcredenciadora/PayFac*, *On-Us*, *3 Partes* e *Arranjo Pix SPI*).
     - Botão **"🔗 Copiar link deste cenário"** com sincronização de query params (`?track=...&fail=...&brand=...&mod=...&step=...&split2027=1`).
   - **Passo `② Siga as Mensagens` (Canvas Isométrico 3D em SVG Puro ⇄ Sequência Cronometrada em Milissegundos + Inspetor Sticky)**:
     - Projeção isométrica `30°` em SVG com ícones 3D vetoriais para Terminal POS, PayFac, Stack de Servidores Adquirente+HSM, Nuvem/Globo da Bandeira/SPI, Prédio Clássico do Banco Emissor e Câmara B3/CIP/STR, com pacote azul-cobalto (`#1F3FE0`) viajando entre os nós e autoplay (`▶ Reproduzir`).
     - Visão `Sequência (ms)` com coluna de latência (`0 ms`, `24 ms`, `48 ms`, `96 ms`, `340 ms`, `690 ms`) e badge `✉ RECEBE` no ator ativo.
     - Inspetor lateral com explicação em linguagem clara, acordeão **"Sobre esta etapa & Fonte Oficial"** e acordeão **"Campos técnicos da mensagem (N)"**.
   - **Passo `③ Para Onde Vai o Dinheiro` (Barra Proporcional Empilhada + Agenda de Recebíveis + Split Tributário 2027 + Anatomia de Identificadores + Comparativo 5 Meios)**:
     - Barra empilhada (`Lojista recebe`, `Intercâmbio Emissor`, `Tarifa Bandeira / SPI`, `Spread Adquirente`) e tabela de parcelas com recálculo instantâneo de antecipação para `D+1` (`ASLC031`).
     - **Simulador do Split Payment Tributário 2027+ (`LC 214/2025 — Arts. 31 a 35`)**: calcula o valor segregado para o Fisco (`CBS + IBS`), a base livre para cessão/antecipação na B3/CERC (`Art. 34`) e o líquido final do lojista.
     - **Anatomia Visual do Identificador**: decompositor colorido para o **ARN de 23 dígitos (c/ Luhn)** no cartão, **EndToEndId de 32 caracteres** no Pix e **Código de Barras de 44 dígitos Febraban** no Boleto.
     - **Quadro Comparativo Multi-Arranjo Lado a Lado**: compara prazo, intercâmbio, MDR e líquido para o mesmo valor em `Crédito Parcelado 6x`, `Crédito à Vista`, `Débito (Teto BCB 304)`, `Pix Instantâneo / NFC` e `Pix Automático`.
   - **Assistente Contextual Flutuante (`"💬 Pergunte ao Workbench"`)**:
     - Drawer flutuante no canto inferior direito com perguntas e respostas normativas que se adaptam automaticamente à trilha ativa (`1` a `10`) e campo de pergunta livre integrado a `/api/rag/ask_manuals`.
   - **Bloco `§ Regras Regulatórias (Banco Central), Pix & O Que Vem para 2027–2030`**:
     - Catálogo de 9 marcos regulatórios e técnicos separados em `🟢 Em Vigor Hoje`, `🚀 Cronograma 2026 / 2027` e `🔭 Horizonte 2028–2030` com botão `"Ver no tempo →"`.
2. `frontend/app/page.tsx`, `frontend/app/jornada/page.tsx` e `frontend/app/compliance/outgoing/OutgoingClient.tsx`:
   - Na Home (`/`), adicionada a seção **"Em Destaque · Laboratórios Interativos Abertos"** com preview gráfico de barras empilhadas para o Simulador 3D (`/jornada`), preview de lote físico para o Workbench Outgoing 2.0 (`/compliance/outgoing`) e preview da Topologia C4 (`/arquitetura`).
   - Integração do `PaygramaInteractiveLab` em `/jornada` e na sub-aba `0️⃣ Laboratório 3D Isométrico, Pix, Regulatório & 2027+` de `/compliance/outgoing?tab=flows`.
3. `frontend/app/sobre/page.tsx` e `frontend/components/PaymentsWorkbenchShell.tsx`:
   - Upgrade editorial do perfil executivo (`/sobre`) com as seções **"O que guia meu trabalho"**, **"3 Princípios Inegociáveis"**, **"Como organizo os domínios de Meios de Pagamento (3 Linhas: Core & Liquidação, Canais & Conversão, Plataforma & Governança)"** e **"O que construo no VS Payments Workbench"** (cards com métricas em fonte monoespaçada).
4. **Unificação do Sistema de Acervo Dentro da IA (`frontend/lib/acervoAiBridge.ts`, `frontend/components/AcervoAiGlobalDrawer.tsx`, `frontend/app/api/acervo/search/route.ts`, `frontend/app/api/rag/ask_manuals/route.ts`, `frontend/app/api/editor/ai/route.ts`, `frontend/app/compliance/boletins/page.tsx`)**:
   - **Ponte Unificada de 4 Motores (`acervoAiBridge.ts`)**: Conecta simultaneamente:
     1. `acervo.sqlite3` FTS5 ao vivo via `retrieval.py` (`40.129` ativos com `SHA-256`, página física, `EVD-...` e validação de versão/OCR);
     2. `campos.sqlite3` ao vivo via `indice_campos/consultar_campos.py` (`17.106` campos extraídos de tabelas PDF) + as `35` tabelas de Outgoing (`OUTGOING_TABLES`);
     3. `tarifas.sqlite3` & `fee_schedule.sqlite3` ao vivo via `indice_tarifas/consultar_tarifas.py` (`454` billing lines VSS/MCBS e intercâmbio);
     4. `boletins-bundle.json` (`385` boletins) + `governanca-bundle.json` + auditoria de conflitos explícitos entre fontes (`scopeConflicts` — regra *"Nada é escolhido em silêncio"*).
   - **Drawer Global Onipresente (`AcervoAiGlobalDrawer.tsx`)**: Acessível de qualquer página do sistema pelo botão no topo da barra (`✨ IA + Acervo Alt+A`), pelo botão flutuante inferior esquerdo ou direto de cada card em `/compliance/boletins` (`🧠 Cruzar na IA do Acervo (SQLite)`), com 4 abas (`🧠 Parecer IA`, `📄 PDFs & Boletins`, `🧬 Campos SQLite`, `💲 Tarifas & BCB`) e exportação 1-clique para o Doc Studio (`/editor`).
   - **Copilot do Doc Studio (`/api/editor/ai`)**: Passa a injetar automaticamente as evidências reais do `acervo.sqlite3`, `campos.sqlite3` e `tarifas.sqlite3` tanto no prompt de IA quanto no gerador determinístico (*Regra do Novelo*).

## Validação
- `npx next typegen` e `npx tsc --noEmit` executados em `frontend/` com `TSC_EXIT=0`.

## Limites e Próximo Passo
- As alíquotas de MDR e antecipação D+1 no Passo `③` são parâmetros interativos de simulação (respeitando o teto regulatório de `0,50%` da Resolução BCB 304 no débito); para auditoria linha a linha de contratos reais, utilizar `/compliance/tarifas-reais` e `/mcbs`.
