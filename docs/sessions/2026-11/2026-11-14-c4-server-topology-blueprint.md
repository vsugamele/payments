# Sessão 2026-11-14 — Blueprint C4 de Topologia de Servidores, HSM, Appliances & Cabos

## Escopo e Objetivo
Evoluir os diagramas de fluxo do sistema (que antes mostravam apenas os 5 macro-atores de negócio) para uma **Topologia Interativa de Servidores, Redes, HSM & Integrações de Bandeiras (Modelo C4 de Pagamentos em 4 Níveis de Zoom)**, integrada em `/compliance/outgoing?tab=flows` e `/arquitetura`.

## Arquivos Criados / Atualizados
- `frontend/app/compliance/outgoing/OutgoingServerTopologyBlueprint.tsx`:
  - **Zoom 1 (`c1_actors`)**: Cronologia Dual-Message em 4 etapas (`T+0s Autorização Online`, `D+0 Outgoing Batch`, `D+0/D+1 Clearing & Incoming`, `D+1/D+30 Registradora B3/CERC + CIP/SLC + STR/Bacen`).
  - **Zoom 2 (`c2_servers`)**: Topologia com **14 grupos de servidores e appliances** distribuídos nas **5 Zonas de Rede PCI-DSS & RSFN**:
    - *Zona 1 (Captura & Borda)*: Terminal POS/Pinpad (DUKPT/EMV), App SoftPOS + Servidor MPoC, Checkout E-Commerce + 3DS Server (`3DSS/MPI`).
    - *Zona 2 (Core Adquirente / Processadora — PCI CDE)*: Switch Autorizador ISO 8583, HSM Criptográfico (`Thales PayShield 10k` porta `:1500`), Motor Gerador de Outgoing (`.CTF` 168B, `.IPM` RDW 1014B, `.TXT` Serviço 10 168B, `.CAS` 600B) e Servidor de Conciliação/Fee Engine/GL.
    - *Zona 3 (Appliances de Borda & Malha das 4 Bandeiras — MPLS)*: Directory Server & Token Vault (`VTS / MDES / Elo Token`), **Visa EAS + Edit Package (`EP747`) & DEX**, **Mastercard MIP (Banknet) + MFE (`GCMS`)**, **Elo STI Switch + Gateway SFTP Serviço 10**, e **Amex GNS Switch + CAS Gateway**.
    - *Zona 4 (Core do Banco Emissor)*: Switch Autorizador Emissor + HSM Emissor (`MDK-AC ARQC/ARPC`, `PVK`, `CAVV Key`) + Shadow Limit/Hold, e Servidor Incoming (Shadow Posting Fatura) + Plataforma de Disputas (`VROL / MCOM / Elo Disputas`).
    - *Zona 5 (Liquidação Financeira Nacional — RSFN/SPB)*: Registradora de Recebíveis (`B3 / CERC / TAG` — Resolução BCB 264) e **CIP / Núclea (`SLC` grades `ASLC026/028/031`) + Banco Central (`STR`)**.
  - **Zoom 3 (`c3_cables`)**: Mapa técnico link-a-link (`CABO #01` a `CABO #13`) detalhando protocolo de transporte, porta TCP/SFTP/MQ, framing físico no cabo (`2B Big-Endian Length + EBCDIC`, `168B Fixed`, `4B RDW + 1014B Blocked`, `XML SPB ICP-Brasil`), chaves HSM e comportamento de falha.
  - **Zoom 4 (`c4_failures`)**: Simulador de 5 incidentes reais de produção (Timeout do Emissor com STIP/`0400`, falha de tradução de PIN Block no HSM, rejeição de Trailer no `EP747/T112/TE01 Reg 09`, perda silenciosa do `TID DE 62.2 / Banknet DE 63` com Downgrade, e rejeição de grade `ASLC026E` na CIP/SLC).
  - **Slide-Over Inspector Drawer**: Painel lateral ao clicar em qualquer servidor ou cabo, com pulo direto para as tabelas de Outgoing correspondentes e exportação para o Doc Studio.
- `frontend/app/compliance/outgoing/OutgoingClient.tsx`:
  - Integração da sub-aba `1️⃣ Topologia de Servidores, HSM & Cabos (Modelo C4)` na aba de Fluxos (`flows`) e suporte a deep-link `?brand=...&table=...`.
- `frontend/app/arquitetura/page.tsx`:
  - Inclusão do Blueprint C4 de Topologia de Servidores, HSM & Cabos lado a lado com o Grafo Interativo (`FlowDiagram`).

## Validação
- `npx tsc --noEmit` executado em `frontend/` com `TSC_EXIT=0` (zero erros de tipagem).
- Rotas `/compliance/outgoing?tab=flows` e `/arquitetura` verificadas no servidor Next.js local (`localhost:3000`).

## Limites e Próximos Passos
- Os dados de portas e topologia refletem a arquitetura padrão de mercado para adquirentes/processadoras e bandeiras no Brasil (Visa Base I/Base II, Mastercard Banknet/GCMS, Elo STI/Serviço 10, Amex GNS/CAS e RSFN/SLC).
- **Refinamentos implementados na sequência**:
  1. **Packet Tracer (Simulador Salto a Salto #01 a #10 com Wire Dump Real)**: Novo modo `PACKET TRACE` mostrando o frame físico de entrada no cabo (`Request Wire Dump`), a transformação interna executada pelo Servidor/HSM (`Inside the Box`) e o frame de saída (`Response Wire Dump`), desde o POS/3DS até o XML `ASLC026` no STR/Bacen.
  2. **Expansão para 17 Servidores/Appliances**: Inclusão do **Motor de Subcredenciadora / PayFac & Split (`SRV-Z2-05`)**, **Servidor KMS, Key Loader (Sala-Cofre TR-34) & Rotação Dinâmica `0800` (`SRV-Z2-06`)** e **Motor Stand-In Processing (`STIP`) & Fila de Advice `0120/0121` (`SRV-Z3-06`)**.
  3. **Lente de Rota Crítica por Cenário Operacional (`activeFlowId`)**: Sincronização automática com o fluxo selecionado na aba `Fluxos` de `/compliance/outgoing`, iluminando com o selo `🎯 ROTA ATIVA` os servidores e cabos exatos daquele cenário.
  4. **Wire Dump Real no Slide-Over Inspector de Cabos**: Clicar em qualquer cabo (`CABO #01` a `CABO #13`) exibe os dumps reais de Request e Response no protocolo daquele link.
  5. **Catálogo & Mapa Unificado de Produtos das 4 Bandeiras (`/mapa/produtos` — `ProductMapAtlasClient.tsx`)**:
     - **Mapa 1**: Matriz de Equivalência de Plásticos & Tiers (`Visa PID` × `Mastercard Brand Product` × `Elo Cód. Produto` × `Amex`) com enquadramento no teto regulatório Bacen (Resolução BCB 304: Débito `0,50% / 0,80%` e Pré-Pago `0,70%`) vs Livre Mercado e Slide-Over Inspector Drawer.
     - **Mapa 2**: Onde o código de produto nasce (`ARDEF`, `MPE T068`, `GCMS IP0040T1/IP0091T1`, `Tabela BINs Elo`) e trafega (`DE 62.23`, `PDS 0002/0158`, `Reg 00/02`, `CAS TDR`).
     - **Mapa 3**: Mapa de Modalidades Transacionais Brasileiras (`Débito à Vista`, `Crédito 1x`, `Parcelado Loja TCR 2 BR / PDS 0195 / 992`, `Parcelado Emissor 993`, `Crediário 994`).
     - **Mapa 4**: Mapa Setorial por MCC & Addenda (`Companhias Aéreas IATA`, `Hotelaria`, `Locadoras`, `Supermercados 5411`, `Postos/Trânsito`).
  6. **Suíte de Engenharia, Homologação & Operação de Produção (`frontend/app/compliance/outgoing/OutgoingEngineeringLabSuite.tsx` — `/compliance/outgoing?tab=eng_lab`)**:
     - **Módulo 1 (`test_builder` — Gerador Sintético de Massa de Testes `.CTF`, `.IPM`, `.TXT` e `.CAS`)**: Construtor interativo de arquivos de lote de Outgoing a partir de parâmetros de negócio (Bandeira, Cenário EMV/3DS/PayFac/IATA/Refund, Valor R$, Parcelas, MCC, CNPJ/CPF Submerchant, TID/Banknet e Auth Code), com cálculo automático de dígito verificador **Luhn no ARN de 23 dígitos**, montagem dos registros condicionais (`TCR 2 BR`, `TCR 3`, `TCR 5`, `TCR 7`, `TCR D`, `TCR E`, `PDS 0195/0208/0220`, `Reg 01/02/05/07/08`, `CAS TAA`) e somatório exato de **Header/Trailer (`TC 90/91/92`, `1644-697/695`, `B0/BZ`, `TFH/TFT`)**, com download direto do arquivo `.ctf`, `.ipm`, `.txt` ou `.cas`.
     - **Módulo 2 (`reject_doctor` — Doutor de Rejeições de Lote & Crítica `EP747 / T112 / TE01 Reg 09 / ASLC026E`)**: Catálogo interativo de códigos reais de rejeição com posição física exata, causa raiz, comparativo **Antes (Linha Errada) × Depois (Linha Corrigida)** e playbook de reapresentação D+1.
     - **Módulo 3 (`reconciliation_4way` — Mesa de Conciliação Financeira 4-Way)**: Simulador financeiro cruzando `Autorização 0110` × `Outgoing D+0` × `Retorno Bandeira (VSS-120 / T140 / 20-02)` × `Grade SLC/CIP (ASLC026)`, com cálculo de resíduo de centavos na 1ª parcela (`R$ 0,01`), impacto de Downgrade (`EIRF / Standard`), líquido Emissor ➔ Adquirente na CIP e repasse Adquirente ➔ Lojista (MDR e Spread líquido).
     - **Módulo 4 (`certification_suite` — Workbench de Homologação & Certificação End-to-End `CT-01` a `CT-10`)**: Checklist interativo dos 10 casos de teste obrigatórios nos simuladores oficiais (`Visa VTS`, `Mastercard MAS/NIUM`, `Elo Simulador`) com envio de Laudo de Homologação para o Doc Studio (`/editor`).
     - **Módulo 5 (`release_diff` — Motor de Diff de Releases `2025.2 ➔ 2026.1 ➔ 2026.2 ➔ 2027.1`)**: Comparador estilo `Git Diff` (`Antes [-]` vs `Depois [+]`) para mudanças de layout e tarifas (`CAVV v7 ➔ v9 AES`, `Elo Serviço 10 v26.1 ➔ v26.2`, `Visa Fee Schedule USD ➔ BRL 01/05/2026`, e `PayFac + Lifecycle ID`).
