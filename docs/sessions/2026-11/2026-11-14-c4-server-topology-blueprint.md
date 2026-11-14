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
- Próximo passo opcional: permitir filtrar no próprio cabo um exemplo de pacote hexadecimal real (`0100/0110` vs registro de clearing) lado a lado.
