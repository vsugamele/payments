import { BulletinMetadata } from "./BulletinMetadataCard";
import { DocumentTemplate } from "./TemplateSelector";

export const MARKETPLACE_MASTER_METADATA: BulletinMetadata = {
  brand: "geral",
  brandName: "Dossiê Mestre Auditado • Multi-Bandeira & Bacen",
  title: "Guia Definitivo Auditado de Regras para Marketplaces & Subcredenciadores (PayFacs): Negócios, Engenharia Byte-a-Byte, Regulação, Custos e Penalidades",
  referenceId: "MKT-PF-BR-2026-V2-AUDITED",
  publicationDate: "18/10/2026",
  effectiveDate: "Vigência 2026 / Ciclo 2026–2027",
  keyExpirationDate: "Revisão Anual IPCA (01/03/2027) & VTS SDK (01/05/2027)",
  category: "Marketplaces • Subcredenciadores (PayFac) • Split de Pagamento • ISO 8583 / Base II / IPM • Bacen BCB 80, 150 & 264 • Custos & Multas",
  audience: [
    "Diretoria de Produto, Pagamentos & Novos Negócios (Marketplaces)",
    "Arquitetura & Engenharia de Mensageria (Switch ISO 8583 / Clearing)",
    "Subcredenciadores (PayFacs), Adquirentes & Gateways (TPS/ESO)",
    "Jurídico Regulatório (SPB/Bacen), Risco, PLD/FT & Compliance",
    "Finanças, Tesouraria, Conciliação de URs & Pricing (FP&A)",
  ],
  region: "Brasil (Doméstico & Cross-Border Foreign Retailer)",
  requirement: "Mandatório",
  riskLevel: "Crítico",
  tags: [
    "Marketplace Qualificado",
    "Subcredenciador / PayFac",
    "MCC 5262",
    "DE 43 PF*Seller (40 bytes)",
    "PDS 0208 / PDS 0178 (Table 619)",
    "Visa MVV & TC 05 TCR 0/1/5",
    "Elo Release 26.2 Reg 01/45",
    "CIP / SLC Grade Centralizada",
    "Registradoras (BCB 264)",
    "Visa Fee Schedule R$ 2026",
    "MCBS Data Integrity Ed. 13.2",
    "VAMP, BRAM & VROL",
  ],
  executiveSummary:
    "Compêndio executivo, técnico, regulatório e financeiro auditado sobre a operação de Marketplaces e Subcredenciadores (Payment Facilitators) no Brasil. Elimina ambiguidades entre Marketplace Qualificado, Subcredenciador (PayFac), Varejista 1P e Gateway Técnico (TPS/ESO); detalha as exigências do Banco Central (Resoluções BCB nº 80, nº 150 e nº 264, Liquidação Centralizada CIP/SLC e Trava de URs em Registradoras); especifica byte-a-byte os campos de autorização e clearing (DE 42, DE 43 com régua posicional, DE 48 SE 37, PDS 0208/0209/0178, Trace ID DE 63.2, Visa MVV/PF ID e Elo 26.2); demonstra um estudo numérico real de Unit Economics e Split; e consolida todas as tarifas e multas oficiais em Reais (R$).",
  recommendedAction:
    "Executar auditoria imediata em 4 frentes: (1) Enquadramento regulatório (Árvore de Decisão Seção 1.2) entre Marketplace Puro com split na Adquirente vs. Subcredenciador liquidante na CIP/SLC e Registradoras; (2) Validação byte-a-byte de DE 42, DE 43 ('PF*SELLER'), DE 48 (SE 37 / PDS 0208 / PDS 0178) e paridade de CEP/Trace ID entre Auth e Clearing para zerar multas mensais de R$ 5.000 a R$ 5.600 do MCBS Data Integrity; (3) Otimização de Captura Única vs. Captura Parcial frente às 5 faixas de ticket do Visa VSS 2026; e (4) Monitoramento contínuo do VAMP Ratio e varredura de URLs para evitar multas de R$ 65.000 a R$ 320.000 por URL (BL 5Z9965656).",
  versionHistory: [
    {
      version: "2026.5 (Audited Master)",
      date: "18/10/2026",
      description:
        "Auditoria forense completa: inclusão de Árvore de Decisão Regulatória, Régua Posicional Byte-a-Byte do DE 43 e PDS 0178, Simulação Numérica de Split (R$ 500), Fórmula Oficial do VAMP (TC40+TC15)/TC05, detalhamento exato dos eventos MCBS 2PN2104–2PN2410 e penalidades escalonadas Visa BL 5Z9965656/5Z9999105/5Z9999200.",
      isCurrent: true,
    },
    {
      version: "2026.4",
      date: "18/10/2026",
      description:
        "Consolidação inicial com preços reais do Visa Fee Schedule Brasil (BRL), eventos MCBS Ed. 13.2, De-Para Visa VSS 1→20 por Ticket Size e Elo Release 26.2.",
      isCurrent: false,
    },
    {
      version: "2026.1",
      date: "01/03/2026",
      description:
        "Migração oficial das tabelas de tarifas e multas Visa no Brasil de USD para BRL (R$) com cláusula de reajuste anual pelo IPCA em março.",
      isCurrent: false,
    },
  ],
  dateExplanations: [
    {
      date: "01/03/2026",
      event: "Vigência do Tarifário Nacional em BRL & Reajuste Anual IPCA (Visa VOIP)",
      impactType: "Go-Live",
      explanation:
        "Conversão definitiva das Billing Lines domésticas e multas de Third Party Agent / PF para Reais (R$), com atualização anual todo dia 1º de março pelo IPCA acumulado em 12 meses.",
    },
    {
      date: "Outubro/2026",
      event: "Fiscalização Estrita Elo Release 26.2 (Registro 01 Pos 45–58 CNPJ/CPF & Reg 45 IRQ)",
      impactType: "Deadline",
      explanation:
        "Obrigatoriedade de validação cruzada entre o documento fiscal do Seller (CNPJ 14 posições vs. CPF 11 posições no Registro 01) e a qualificação de MCC/IRQ nos lotes de liquidação.",
    },
    {
      date: "Ciclo Mensal (4º e 10º DU)",
      event: "Fechamento VOIP Visa & Faturamento MCBS Mastercard",
      impactType: "Transição",
      explanation:
        "Emissão da fatura oficial no 4º dia útil e liquidação financeira obrigatória no 10º dia útil de cada mês para cobranças de processamento, disputas VROL e multas de integridade.",
    },
    {
      date: "01/05/2027",
      event: "Nova Escala Global Visa Digital Enablement SDK / Token (Plataformas > USD 5B)",
      impactType: "Go-Live",
      explanation:
        "Entrada em vigor da nova faixa anual de R$ 5.168.000,00 (BL 5W2200013) para grandes habilitadores digitais e plataformas com volume anual elegível acima de USD 5 bilhões.",
    },
  ],
  customFields: [
    {
      id: "cf-1",
      label: "Teto Seller / Submerchant",
      value: "Máx. 10% do TPV no Marketplace ou USD 10M/ano por Bandeira em PayFac (Acima exige Direct Merchant Agreement)",
    },
    {
      id: "cf-2",
      label: "Registro Anual PayFac (BR)",
      value: "Visa PF/HRIPF: R$ 32.000,00 (BL 5Q6562026) • Mastercard MSP Créd: R$ 18.135,00 ini / R$ 9.067,50 ren (2SC1812/27)",
    },
    {
      id: "cf-3",
      label: "Multa Data Integrity (DE 42/43/48)",
      value: "R$ 5.000,00 a R$ 5.600,00 / mês por edit violado no MCBS (2PN2104 a 2PN2410)",
    },
    {
      id: "cf-4",
      label: "Multa Seller Proibido / URL",
      value: "1ª: R$ 65.000 • 2ª: R$ 160.000 • 3ª+: R$ 320.000 por URL • 4ª: Banimento (Visa BL 5Z9965656)",
    },
  ],
};

export const MARKETPLACE_MASTER_TEMPLATE: DocumentTemplate = {
  id: "dossie_marketplace_2026",
  name: "🛒 Dossiê Mestre Auditado: Regras para Marketplaces & Subcredenciadores (Negócios, Técnica, Regulação, Custos & Multas)",
  description:
    "Guia executivo completo e auditado (360º) sobre Marketplaces e PayFacs no Brasil: modelos de negócio, árvore de decisão Bacen/CIP/Registradoras, régua byte-a-byte ISO 8583/Base II/IPM/Elo 26.2, simulação financeira de split, tarifas oficiais em R$ e multas.",
  category: "Pagamentos",
  defaultTitle: "Dossiê Mestre Auditado — Regras de Marketplace & Subcredenciadores (Negócios, Técnica, Regulação, Custos e Penalidades)",
  content: `<h1>DOSSIÊ MESTRE AUDITADO: REGRAS PARA MARKETPLACES &amp; SUBCREDENCIADORES (PAYFACS) NO BRASIL</h1>
<p style="color:#64748b; font-size:0.95rem; margin-top:-0.5rem; margin-bottom:1.25rem;">
  <strong>Compêndio Executivo &amp; Forense 360º:</strong> Modelos de Negócio &amp; Árvore de Decisão • Regulamentação Bacen (BCB 80, 150 e 264), CIP/SLC e Registradoras • Engenharia Byte-a-Byte (ISO 8583, Base II, IPM e Elo 26.2) • Simulação Numérica de Split • Custos Oficiais em R$ • Programas de Monitoria (VAMP, ECP, BRAM) &amp; Penalidades
</p>
<hr/>

<!-- PAINEL EXECUTIVO DE ABERTURA -->
<div style="background:#0f2c59; color:#ffffff; border-radius:14px; padding:22px 24px; margin:1.5rem 0; font-family:system-ui, -apple-system, sans-serif; box-shadow:0 10px 25px rgba(15,44,89,0.18);">
  <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:16px; border-bottom:1px solid rgba(255,255,255,0.15); padding-bottom:14px; margin-bottom:16px;">
    <div>
      <span style="background:#2563eb; color:#ffffff; font-size:10px; font-weight:800; padding:3px 9px; border-radius:4px; text-transform:uppercase; letter-spacing:0.6px;">
        Manual de Arquitetura, Compliance &amp; Finanças • Edição Auditada 2026
      </span>
      <h3 style="margin:8px 0 4px 0; font-size:19px; font-weight:800; color:#ffffff;">
        Ecossistema de Marketplaces, Plataformas Multi-Seller e Facilitadores de Pagamento
      </h3>
      <span style="font-size:12px; color:#93c5fd;">
        Fontes Verificadas: Res. BCB nº 80/2021, nº 150/2021 e nº 264/2022 • Visa Core Rules &amp; Fee Schedule BR 2026 • Mastercard Rules Cap. 7, DMC Guide (Aug/2026) &amp; MCBS Ed. 13.2 • Elo Release 26.2
      </span>
    </div>
    <span style="background:#dc2626; color:#ffffff; font-size:11px; font-weight:800; padding:5px 12px; border-radius:99px; white-space:nowrap;">
      Obrigatório / Mandate
    </span>
  </div>

  <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:12px; font-size:12px;">
    <div style="background:rgba(255,255,255,0.07); padding:10px 12px; border-radius:8px; border:1px solid rgba(255,255,255,0.1);">
      <span style="color:#93c5fd; font-size:10px; text-transform:uppercase; font-weight:bold; display:block;">Registro Anual PayFac</span>
      <span style="font-size:14px; font-weight:800; color:#ffffff;">R$ 32.000 (Visa)</span>
      <span style="color:#cbd5e1; font-size:11px; display:block;">R$ 18.135 ini / R$ 9.067,50 ren (MC)</span>
    </div>
    <div style="background:rgba(255,255,255,0.07); padding:10px 12px; border-radius:8px; border:1px solid rgba(255,255,255,0.1);">
      <span style="color:#93c5fd; font-size:10px; text-transform:uppercase; font-weight:bold; display:block;">Teto Seller s/ Contrato Direto</span>
      <span style="font-size:14px; font-weight:800; color:#ffffff;">&le; 10% do TPV</span>
      <span style="color:#cbd5e1; font-size:11px; display:block;">ou máx. USD 10 Milhões / ano</span>
    </div>
    <div style="background:rgba(255,255,255,0.07); padding:10px 12px; border-radius:8px; border:1px solid rgba(255,255,255,0.1);">
      <span style="color:#93c5fd; font-size:10px; text-transform:uppercase; font-weight:bold; display:block;">Multa Erro DE 42 / 43 / 48</span>
      <span style="font-size:14px; font-weight:800; color:#fbbf24;">R$ 5.000–5.600/mês</span>
      <span style="color:#cbd5e1; font-size:11px; display:block;">MCBS Data Integrity (2PN2104–2410)</span>
    </div>
    <div style="background:rgba(255,255,255,0.07); padding:10px 12px; border-radius:8px; border:1px solid rgba(255,255,255,0.1);">
      <span style="color:#93c5fd; font-size:10px; text-transform:uppercase; font-weight:bold; display:block;">Multa Seller / URL Ilegal</span>
      <span style="font-size:14px; font-weight:800; color:#f87171;">R$ 65k a R$ 320k</span>
      <span style="color:#cbd5e1; font-size:11px; display:block;">Por URL violadora (BL 5Z9965656)</span>
    </div>
  </div>
</div>

<!-- =====================================================================
     SEÇÃO 1: MODELOS DE NEGÓCIO & ÁRVORE DE DECISÃO REGULATÓRIA
     ===================================================================== -->
<h2>1. Visão de Negócios: As 4 Figuras Operacionais e Como Não Confundi-las</h2>
<p>
  O erro mais caro em operações digitais no Brasil é tratar qualquer plataforma que faz "split de pagamento" como a mesma figura jurídica e técnica. Para o <strong>Banco Central do Brasil (Bacen)</strong> e para os manuais das bandeiras (<strong>Visa Core Rules Section 5.2</strong>, <strong>Mastercard Rules Chapter 7</strong> e <strong>Regulamento Elo</strong>), existem <strong>quatro arquiteturas completamente distintas</strong>. A escolha entre elas altera quem aparece na fatura do cartão, qual MCC é enviado, quem responde por chargebacks e se a empresa precisa ou não liquidar via Câmara Interbancária de Pagamentos (CIP/SLC):
</p>

<table style="width:100%; border-collapse:collapse; margin:1.5rem 0; font-size:12px; border:1px solid #cbd5e1; border-radius:10px; overflow:hidden;">
  <thead>
    <tr style="background:#0f2c59; color:#ffffff;">
      <th style="padding:10px 12px; text-align:left; width:17%;">Figura Operacional</th>
      <th style="padding:10px 12px; text-align:left; width:24%;">O Que É na Prática (Jornada do Comprador)</th>
      <th style="padding:10px 12px; text-align:left; width:21%;">Regra de Descritor (DE 43) e MCC</th>
      <th style="padding:10px 12px; text-align:left; width:20%;">Fluxo do Dinheiro (Liquidação &amp; CIP)</th>
      <th style="padding:10px 12px; text-align:left; width:18%;">Dono do Risco (Chargeback &amp; Multas)</th>
    </tr>
  </thead>
  <tbody>
    <tr style="background:#ffffff; border-bottom:1px solid #e2e8f0;">
      <td style="padding:10px 12px; font-weight:bold; color:#1e40af;">1. Marketplace Qualificado<br/><span style="font-size:11px; font-weight:normal; color:#64748b;">(Qualifying Marketplace)</span></td>
      <td style="padding:10px 12px; color:#1e293b;">App ou site único de e-commerce onde múltiplos vendedores (<em>sellers 3P</em>) anunciam produtos, mas o comprador faz 1 único checkout sob a marca, garantia de entrega e SAC da plataforma.</td>
      <td style="padding:10px 12px; color:#1e293b;">Nome do <strong>Marketplace</strong> no <code>DE 43</code>. Permite usar <strong>MCC 5262</strong> (Marketplaces Online) em captura única para carrinho multi-seller, desde que registrado com <strong>MVV / Marketplace ID</strong>.</td>
      <td style="padding:10px 12px; color:#1e293b;">Pode fazer o split direto na Adquirente (que liquida para cada seller na CIP) ou atuar como Subcredenciador próprio.</td>
      <td style="padding:10px 12px; color:#dc2626; font-weight:600;">100% do Marketplace perante a Bandeira, Adquirente e Consumidor.</td>
    </tr>
    <tr style="background:#f8fafc; border-bottom:1px solid #e2e8f0;">
      <td style="padding:10px 12px; font-weight:bold; color:#7e22ce;">2. Subcredenciador / PayFac<br/><span style="font-size:11px; font-weight:normal; color:#64748b;">(Payment Facilitator — PF / MSP)</span></td>
      <td style="padding:10px 12px; color:#1e293b;">Participante do arranjo que habilita sublojistas independentes (cada um com seu próprio site, app, link de pagamento ou maquininha POS) sob um contrato mestre com uma Adquirente patrocinadora.</td>
      <td style="padding:10px 12px; color:#1e293b;">Obrigatoriamente <code>PREFIXO*SELLER</code> no <code>DE 43</code>. <strong>Proibido usar MCC 5262 ou MCC genérico:</strong> cada sublojista deve enviar seu próprio <strong>MCC real</strong> e um <code>DE 42</code> exclusivo.</td>
      <td style="padding:10px 12px; color:#1e293b;">Recebe da Adquirente e é <strong>obrigado a liquidar na Grade Centralizada da CIP/SLC</strong> e registrar URs nas Registradoras (Res. BCB 264).</td>
      <td style="padding:10px 12px; color:#dc2626; font-weight:600;">Responsabilidade solidária entre PayFac e Adquirente Patrocinador.</td>
    </tr>
    <tr style="background:#ffffff; border-bottom:1px solid #e2e8f0;">
      <td style="padding:10px 12px; font-weight:bold; color:#047857;">3. Varejista 1P (Loja Própria)<br/><span style="font-size:11px; font-weight:normal; color:#64748b;">(Merchant of Record Direto)</span></td>
      <td style="padding:10px 12px; color:#1e293b;">A empresa vende estoque próprio e emite a Nota Fiscal (NF-e) integral em seu próprio CNPJ para o consumidor final. Não há terceiros vendendo na transação.</td>
      <td style="padding:10px 12px; color:#1e293b;">Nome da Loja no <code>DE 43</code> e MCC da sua atividade principal. Não preenche <code>PF ID</code> nem <code>PDS 0178/0208</code>.</td>
      <td style="padding:10px 12px; color:#1e293b;">Adquirente liquida 100% na conta bancária do Varejista. Fornecedores são pagos via contas a pagar comum (TED/Pix/Boleto).</td>
      <td style="padding:10px 12px; color:#1e293b;">100% do Estabelecimento Comercial (EC).</td>
    </tr>
    <tr style="background:#f8fafc;">
      <td style="padding:10px 12px; font-weight:bold; color:#475569;">4. Gateway / Orquestrador Técnico<br/><span style="font-size:11px; font-weight:normal; color:#64748b;">(PSP Técnico / TPS / ESO / DSE)</span></td>
      <td style="padding:10px 12px; color:#1e293b;">Provedor puramente tecnológico de API/Checkout que roteia a transação usando o código de afiliação (MID) que cada lojista contratou diretamente com a Adquirente.</td>
      <td style="padding:10px 12px; color:#1e293b;">Nome do Lojista direto no <code>DE 43</code>. O Gateway é registrado apenas como agente tecnológico (<strong>ESO / TPS</strong> na Visa; <strong>DSE</strong> na Mastercard).</td>
      <td style="padding:10px 12px; color:#1e293b;"><strong>Jamais toca no fluxo financeiro.</strong> A Adquirente liquida diretamente na conta bancária de cada Lojista.</td>
      <td style="padding:10px 12px; color:#1e293b;">Risco financeiro é do Lojista direto; Gateway responde por segurança PCI-DSS.</td>
    </tr>
  </tbody>
</table>

<h3>1.1. Os 6 Requisitos Obrigatórios para Enquadramento como "Marketplace Qualificado" e a Nuance da Regra dos 10% / USD 10M</h3>
<p>
  Tanto a Visa (<em>Visa Core Rules — Qualifying Marketplace Criteria</em>) quanto a Mastercard (<em>Mastercard Rules Chapter 7 — Marketplaces</em>) determinam que, para uma plataforma usufruir do <strong>MCC 5262</strong>, realizar captura única para carrinhos com múltiplos vendedores e apresentar sua própria marca no descritor, ela precisa cumprir cumulativamente <strong>6 condições</strong>:
</p>
<ol>
  <li><strong>Interface, Domínio e Checkout Unificados:</strong> Todos os vendedores terceiros (<em>sellers / retailers</em>) oferecem seus produtos dentro do site ou aplicativo operado sob a marca do Marketplace, que controla 100% da experiência de pagamento.</li>
  <li><strong>Proeminência de Marca e Atendimento Centralizado (SAC):</strong> O consumidor identifica claramente que está comprando no Marketplace, e o Marketplace é o responsável contratual direto perante o portador por entregas, atrasos, devoluções, reembolsos e resolução de reclamações.</li>
  <li><strong>Assunção Integral de Passivo Financeiro (Full Liability):</strong> O Marketplace responde financeiramente por <strong>100% dos Chargebacks, Estornos (Refunds) e Assessments</strong> gerados pelas vendas de qualquer <em>seller</em> em sua plataforma, não podendo alegar insolvência do <em>seller</em> para recusar um débito de disputa.</li>
  <li><strong>Liquidação Restrita aos Sellers Originais:</strong> O repasse financeiro da venda só pode ser liquidado para o <em>seller</em> que efetivamente vendeu o bem ou serviço na plataforma (sendo proibido usar o arranjo para transferências P2P ou pagamento de terceiros estranhos à compra).</li>
  <li><strong>Registro Prévio na Bandeira pelo Adquirente Patrocinador:</strong> O Adquirente deve registrar formalmente a plataforma como Marketplace/PF na Visa (atribuindo um <strong>MVV — Merchant Verification Value</strong> e/ou <strong>Payment Facilitator / Marketplace ID de 11 dígitos</strong>) e na Mastercard (registro de <strong>MSP / Payment Facilitator / Marketplace</strong>).</li>
  <li><strong>Regra de Concentração e Teto Anual de Volume (A Diferença Exata entre PayFac e Marketplace):</strong>
    <ul>
      <li><strong>No modelo de Subcredenciador / Payment Facilitator (PF):</strong> Qualquer sublojista (<em>Sponsored Merchant / Submerchant</em>) que ultrapassar <strong>USD 10.000.000,00 (dez milhões de dólares) em volume anual por bandeira</strong> deixa obrigatoriamente de ser um sublojista genérico e precisa celebrar um <strong>Direct Merchant Agreement (Contrato de Credenciamento Direto Tripartite)</strong> com o Adquirente patrocinador (ainda que continue operando tecnicamente via o PayFac).</li>
      <li><strong>No modelo de Marketplace Qualificado:</strong> Nenhum <em>seller</em> individual (ou grupo econômico) pode representar mais de <strong>10% do volume anual transacionado (TPV) do Marketplace</strong> sem auditoria e registro individualizado junto ao Adquirente/Bandeira; além disso, se o Marketplace operar modelo híbrido (<strong>1P Estoque Próprio + 3P Sellers Terceiros</strong>), recomenda-se segregar o MID/MVV de varejo 1P (MCC da categoria) do MID/MVV de intermediação 3P (<code>MCC 5262</code>) para evitar contaminação contábil (DIMP) e tarifária.</li>
    </ul>
  </li>
</ol>

<h3>1.2. Árvore de Decisão Executiva: Em Qual Modelo Sua Operação se Enquadra?</h3>
<div style="background:#f8fafc; border:1px solid #cbd5e1; border-left:5px solid #0f2c59; border-radius:12px; padding:16px 20px; margin:1.25rem 0; font-size:12.5px; line-height:1.65;">
  <strong style="color:#0f2c59; font-size:13.5px; display:block; margin-bottom:8px;">🧭 RESPONDA ESTAS 4 PERGUNTAS PARA DEFINIR SUA ARQUITETURA REGULATÓRIA E TÉCNICA:</strong>
  <p style="margin:0 0 6px 0;"><strong>Pergunta 1 — O dinheiro dos sellers passa pela conta bancária / titularidade transitória da sua empresa antes de chegar ao seller?</strong><br/>
  &bull; <strong>NÃO</strong> (a própria Adquirente divide o pagamento no motor de split dela e deposita direto na conta de cada seller e a comissão na sua conta): Você opera como <strong>Marketplace Comercial com Split na Adquirente</strong> (não precisa se homologar na CIP/SLC nem contratar Registradora diretamente, pois a Adquirente faz isso).<br/>
  &bull; <strong>SIM</strong> (a Adquirente deposita o bolo total na sua conta de liquidação e você repassa aos sellers): Você é regulatoriamente um <strong>Subcredenciador (Res. BCB nº 150/2021)</strong> e <strong>precisa</strong> liquidar via <strong>CIP/SLC</strong> e registrar URs em <strong>Registradora (Res. BCB nº 264/2022)</strong>.</p>
  <p style="margin:0 0 6px 0;"><strong>Pergunta 2 — Os sellers vendem dentro do seu site/app unificado ou cada seller tem seu próprio site/loja independente?</strong><br/>
  &bull; <strong>Dentro do seu site/app unificado</strong> (com seu checkout e SAC): Você pode se registrar como <strong>Marketplace Qualificado (MCC 5262)</strong>.<br/>
  &bull; <strong>Em sites/lojas próprias de cada seller</strong> (você fornece o checkout, link ou POS): Você é estritamente um <strong>Payment Facilitator (PayFac)</strong> e <strong>jamais</strong> pode usar o MCC 5262 — deve enviar o MCC real de cada sublojista e <code>PF*SELLER</code> no <code>DE 43</code>.</p>
  <p style="margin:0;"><strong>Pergunta 3 — Seu volume acumulado como Subcredenciador nos últimos 12 meses ultrapassou R$ 500.000.000,00 (quinhentos milhões de reais)?</strong><br/>
  &bull; <strong>SIM:</strong> Pela <strong>Resolução BCB nº 80/2021 e nº 150/2021</strong>, é obrigatório requerer <strong>Autorização de Funcionamento como Instituição de Pagamento (IP)</strong> perante o Banco Central do Brasil, manter patrimônio líquido regulatório mínimo e estrutura formal de governança, PLD/FT e auditoria.</p>
</div>

<!-- =====================================================================
     SEÇÃO 2: REGULAMENTAÇÃO BRASILEIRA (BACEN, CIP/SLC & REGISTRADORAS)
     ===================================================================== -->
<h2>2. Regulamentação Brasileira: Banco Central (BCB 80 e 150), CIP/SLC e Registradoras de Recebíveis (BCB 264)</h2>
<p>
  No Brasil, o fluxo financeiro pós-captura é regulado pelo <strong>Banco Central do Brasil (Bacen)</strong> e pelo <strong>Conselho Monetário Nacional (CMN)</strong>. Diferentemente dos EUA ou Europa — onde um PayFac recebe os fundos em uma conta <em>For Benefit Of (FBO)</em> em banco comercial e faz transferências ACH internas —, no Brasil o Subcredenciador faz parte da infraestrutura do <strong>Sistema de Pagamentos Brasileiro (SPB)</strong>.
</p>

<table style="width:100%; border-collapse:collapse; margin:1.5rem 0; font-size:12px; border:1px solid #cbd5e1; border-radius:10px; overflow:hidden;">
  <thead>
    <tr style="background:#1e293b; color:#ffffff;">
      <th style="padding:10px 12px; text-align:left; width:20%;">Norma Oficial</th>
      <th style="padding:10px 12px; text-align:left; width:26%;">Regra &amp; Obrigatoriedade</th>
      <th style="padding:10px 12px; text-align:left; width:32%;">Como Funciona na Prática Técnica &amp; Financeira</th>
      <th style="padding:10px 12px; text-align:left; width:22%;">Penalidade / Risco Jurídico</th>
    </tr>
  </thead>
  <tbody>
    <tr style="background:#ffffff; border-bottom:1px solid #e2e8f0;">
      <td style="padding:10px 12px; font-weight:bold; color:#0f2c59;">Resolução BCB nº 150/2021 &amp; Res. BCB nº 80/2021<br/><span style="font-size:11px; color:#64748b;">(Arranjos &amp; Instituições de Pagamento)</span></td>
      <td style="padding:10px 12px; color:#1e293b;">Define o <strong>Subcredenciador</strong> como participante que habilita recebedores finais para aceitar cartões. Exige autorização do Bacen quando o volume anual (12 meses) atinge <strong>R$ 500 milhões</strong>.</td>
      <td style="padding:10px 12px; color:#1e293b;">Os recursos pertencentes aos <em>sellers</em> constituem <strong>patrimônio separado</strong> (Lei nº 12.865/2013): não respondem por dívidas do Subcredenciador, não podem ser objeto de penhora/arresto por credores da plataforma e não podem financiar capital de giro próprio.</td>
      <td style="padding:10px 12px; color:#dc2626; font-weight:600;">Processo Administrativo Sancionador (PAS) no Bacen, inabilitação de diretores e descredenciamento imediato pelas bandeiras.</td>
    </tr>
    <tr style="background:#f8fafc; border-bottom:1px solid #e2e8f0;">
      <td style="padding:10px 12px; font-weight:bold; color:#0f2c59;">Liquidação Centralizada CIP / Nuclea (SLC)<br/><span style="font-size:11px; color:#64748b;">(Grade Única de Liquidação)</span></td>
      <td style="padding:10px 12px; color:#1e293b;">Todo Subcredenciador com fluxo financeiro próprio deve liquidar os repasses aos sublojistas através do <strong>Sistema de Liquidação Diferida das Transferências Interbancárias de Ordens de Crédito (SILOC / SLC — CIP)</strong>.</td>
      <td style="padding:10px 12px; color:#1e293b;">
        A troca de arquivos com a CIP/Nuclea ocorre via:<br/>
        &bull; <code>ASLC029</code>: Grade de Liquidação de <strong>Crédito</strong>.<br/>
        &bull; <code>ASLC031</code>: Grade de Liquidação de <strong>Débito</strong>.<br/>
        &bull; <code>ASLC033</code>: Grade de Liquidação de <strong>Antecipação de Recebíveis</strong>.<br/>
        <em>Exceção:</em> Transações cujos recebedores possuem conta de pagamento na própria instituição (liquidação intrabancária / <em>on-us</em> informada à registradora) ou split executado diretamente pela Adquirente.
      </td>
      <td style="padding:10px 12px; color:#dc2626; font-weight:600;">Multa operacional por falha de grade na CIP e suspensão da licença de subcredenciamento pela Adquirente.</td>
    </tr>
    <tr style="background:#ffffff; border-bottom:1px solid #e2e8f0;">
      <td style="padding:10px 12px; font-weight:bold; color:#0f2c59;">Res. CMN nº 4.734/2019 &amp; Res. BCB nº 264/2022<br/><span style="font-size:11px; color:#64748b;">(Registradoras: CERC, TAG, B3, Nuclea)</span></td>
      <td style="padding:10px 12px; color:#1e293b;">Obriga o registro diário de todas as <strong>Unidades de Recebíveis (URs)</strong> constituídas pelas vendas de cada <em>seller</em> e a obediência às ordens de <strong>Ônus (Gravame)</strong> e <strong>Troca de Titularidade (Cessão)</strong>.</td>
      <td style="padding:10px 12px; color:#1e293b;">
        <strong>Chave Primária da UR:</strong><br/>
        <code>[CNPJ ou CPF do Seller] + [CNPJ do Subcredenciador] + [Código do Arranjo (ex: VCC, MCC, ECC, VDC, MDC, EDC)] + [Data de Liquidação]</code>.<br/>
        Todo dia útil antes de enviar a grade <code>ASLC</code>, o Subcredenciador deve ler o arquivo de retorno da Registradora contendo o <strong>Domicílio Bancário Atualizado</strong> (onde o valor livre e o valor gravado devem ser depositados).
      </td>
      <td style="padding:10px 12px; color:#dc2626; font-weight:600;"><strong>Passivo de Dupla Liquidação:</strong> se o seller travou a agenda com um banco na registradora e o Marketplace pagar na conta antiga do seller, terá que pagar novamente ao banco credor.</td>
    </tr>
    <tr style="background:#f8fafc;">
      <td style="padding:10px 12px; font-weight:bold; color:#0f2c59;">Teto de Intercâmbio Débito e Pré-Pago<br/><span style="font-size:11px; color:#64748b;">(Res. BCB nº 150 / BCB nº 246)</span></td>
      <td style="padding:10px 12px; color:#1e293b;">Teto regulatório máximo de Tarifa de Intercâmbio (TIC) doméstica de <strong>0,50% no Débito</strong> e <strong>0,70% no Pré-Pago</strong>.</td>
      <td style="padding:10px 12px; color:#1e293b;">Muitos emissores emitem cartões com função múltipla ou pré-pagos que são capturados como "Crédito à vista" no checkout do e-commerce. O motor de conciliação do Marketplace deve cruzar a tabela de <strong>BIN Ranges</strong> com os relatórios <code>VSS-120/130</code> (Visa) e <code>IP755120-AA</code> (Mastercard, <code>PDS 0146/0147</code> e <code>PDS 0158 SF 4 IRD</code>) para garantir a aplicação do teto de 0,50% / 0,70%.</td>
      <td style="padding:10px 12px; color:#d97706; font-weight:600;">Perda financeira silenciosa de <strong>0,80% a 1,40%</strong> sobre todo o volume de cartões pré-pagos e débito.</td>
    </tr>
  </tbody>
</table>

<!-- =====================================================================
     SEÇÃO 3: ENGENHARIA TÉCNICA DE MENSAGERIA BYTE-A-BYTE
     ===================================================================== -->
<h2>3. Engenharia Técnica Byte-a-Byte: Autorização (ISO 8583) e Clearing (Base II, IPM e Elo 26.2)</h2>
<p>
  Para que não reste nenhuma dúvida na implementação do Switch ISO 8583, do Gateway ou da conciliação de arquivos de clearing, detalhamos abaixo o fluxo completo de <strong>quem envia</strong>, <strong>quem recebe</strong>, <strong>como cada campo é estruturado byte a byte</strong> e <strong>quais validações (edits) as bandeiras executam</strong>.
</p>

<h3>3.1. Régua Posicional Exata do Descritor Dinâmico (<code>DE 43</code>) — Autorização vs. Clearing</h3>
<p>
  O campo <strong><code>DE 43 (Card Acceptor Name/Location)</code></strong> é o campo mais auditado pelas bandeiras em transações de Subcredenciadores e Marketplaces. Na mensagem de Autorização ISO 8583 (<code>0100</code>), ele possui tamanho fixo de <strong>40 bytes (<code>ans 40</code>)</strong> divididos em 3 regiões obrigatórias separadas por espaços:
</p>

<div style="background:#0f172a; color:#f8fafc; border-radius:12px; padding:16px 20px; margin:1.25rem 0; font-family:ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size:11.5px; line-height:1.6; overflow-x:auto;">
  <div style="color:#93c5fd; font-weight:bold; margin-bottom:6px;">RÉGUA POSICIONAL DE 40 BYTES — DE 43 NA AUTORIZAÇÃO (0100 VISA / MASTERCARD / ELO):</div>
  <div style="color:#64748b;">Posição:  01234567890123456789012  23  24567890123456  37  3890</div>
  <div style="color:#fbbf24;">Estrutura: [NOME DO PF*SELLER (22)] [_] [CIDADE (13)  ] [_] [PAÍS(3)]</div>
  <div style="color:#4ade80; margin-top:4px;">Exemplo 1 (PayFac):      "MPAGO*LOJADOMARIO     " + " " + "SAO PAULO    " + " " + "BRA"</div>
  <div style="color:#38bdf8;">Exemplo 2 (Marketplace): "MERCADOLIVRE*CASAECIA " + " " + "OSASCO       " + " " + "BRA"</div>
</div>

<ul>
  <li><strong>Regra do Prefixo e Asterisco (Posições 1 a 22 na Autorização / Posições 92 a 116 [25 bytes] no Visa Base II TC 05 TCR 0):</strong>
    <ul>
      <li>O prefixo abreviado do Subcredenciador (PayFac) deve ter entre <strong>3 e 12 caracteres</strong> (ex.: <code>MPAGO</code>, <code>PAGSEG</code>, <code>STONE</code>, <code>VINDI</code>), seguido imediatamente pelo caractere asterisco (<code>*</code> — <code>0x2A</code> em ASCII / <code>0x5C</code> em EBCDIC) e pelo <strong>nome fantasia real do Submerchant/Seller</strong>.</li>
      <li><strong>Proibições que acionam multa automática de R$ 5.600,00/mês (<code>MCBS 2PN2113</code> na Auth e <code>2PN2118</code> no Clearing):</strong> enviar apenas o nome do PayFac sem o asterisco e sem o nome do seller; enviar caracteres especiais inválidos ou deixar somente espaços após o asterisco; ou preencher a palavra <code>"UNKNOWN"</code>.</li>
    </ul>
  </li>
  <li><strong>Como o <code>DE 43</code> se transforma no Clearing IPM da Mastercard (<code>MTI 1240</code> / Relatório <code>IP755120-AA</code> p. 2043):</strong>
    <ul>
      <li>No arquivo de clearing IPM, o <code>DE 43</code> deixa de ter 40 bytes planos e passa a ser estruturado em <strong>6 Subcampos (Subfields 1 a 6)</strong> (ocupando as posições <code>176 a 274</code> nos relatórios <code>IP755120-AA</code> e <code>IP714010-AA</code>):
        <code>SF 1</code> = Nome (<code>PF*SELLER</code>), <code>SF 2</code> = Endereço de Rua do Seller, <code>SF 3</code> = Cidade do Seller (<code>SF 1+2+3</code> = 83 bytes, pos 176–258), <code>SF 4</code> = CEP / Postal Code do Seller (10 bytes, pos 259–268), <code>SF 5</code> = UF / Subdivision Code (3 bytes, pos 269–271, ex.: <code>SP </code>) e <code>SF 6</code> = Código do País (3 bytes, pos 272–274, <code>BRA</code>).</li>
      <li><strong>Atenção à Multa Dupla de Divergência (<code>MCBS 2PN2120</code> — R$ 5.000/mês e <code>2PN2410</code> — R$ 5.600/mês):</strong> O CEP e a Cidade/Nome enviados no <code>0100</code> devem coincidir exatamente com os enviados no <code>IPM 1240</code>!</li>
    </ul>
  </li>
</ul>

<h3>3.2. Dicionário Completo Auditado de Campos Técnicos (Mastercard, Visa e Elo 26.2)</h3>
<p>
  A tabela abaixo apresenta todos os campos obrigatórios verificados diretamente nos manuais oficiais (<em>Mastercard Dual Message Clearing System Guide 25 Aug 2026</em>, <em>Visa Base I &amp; Base II Technical Specifications</em> e <em>Manual de Liquidação Elo Release 26.2</em>):
</p>

<table style="width:100%; border-collapse:collapse; margin:1.25rem 0; font-size:11.5px; border:1px solid #cbd5e1; border-radius:10px; overflow:hidden;">
  <thead>
    <tr style="background:#0f2c59; color:#ffffff;">
      <th style="padding:9px 10px; text-align:left; width:10%;">Bandeira</th>
      <th style="padding:9px 10px; text-align:left; width:19%;">Campo / PDS / Registro &amp; Posição Exata</th>
      <th style="padding:9px 10px; text-align:left; width:13%;">Formato &amp; Tamanho</th>
      <th style="padding:9px 10px; text-align:left; width:36%;">Especificação Funcional (Quem Envia &rarr; Quem Recebe &amp; Regra)</th>
      <th style="padding:9px 10px; text-align:left; width:22%;">Auditoria &amp; Penalidade Oficial</th>
    </tr>
  </thead>
  <tbody>
    <tr style="background:#ffffff; border-bottom:1px solid #e2e8f0;">
      <td style="padding:9px 10px; font-weight:bold; color:#b45309;">Mastercard</td>
      <td style="padding:9px 10px; font-family:monospace; font-weight:bold; color:#0f172a;">Auth: DE 48 SE 37 SF 1<br/>IPM: PDS 0208</td>
      <td style="padding:9px 10px; font-family:monospace;">n ...11<br/>(Até 11 dígitos)</td>
      <td style="padding:9px 10px; color:#1e293b;"><strong>Payment Facilitator ID (PF ID):</strong> Código numérico atribuído pela Mastercard ao Subcredenciador/Marketplace no registro MSP (<code>2SC1812</code>). Enviado pela Adquirente no <code>0100</code> e no <code>IPM 1240</code>.</td>
      <td style="padding:9px 10px; color:#dc2626; font-weight:600;"><code>MCBS 2PN2111</code> (p. 367): <strong>R$ 5.600,00 / mês</strong> por DE 48 inválido ou PF ID não registrado.</td>
    </tr>
    <tr style="background:#f8fafc; border-bottom:1px solid #e2e8f0;">
      <td style="padding:9px 10px; font-weight:bold; color:#b45309;">Mastercard</td>
      <td style="padding:9px 10px; font-family:monospace; font-weight:bold; color:#0f172a;">Auth: DE 48 SE 37 SF 2<br/>IPM: PDS 0209</td>
      <td style="padding:9px 10px; font-family:monospace;">n ...11<br/>(Até 11 dígitos)</td>
      <td style="padding:9px 10px; color:#1e293b;"><strong>Independent Sales Organization ID (ISO ID):</strong> Preenchido quando há um ISO/Parceiro Comercial intermediando a prospecção junto ao Adquirente/PayFac.</td>
      <td style="padding:9px 10px; color:#dc2626; font-weight:600;"><code>MCBS 2PN2111</code>: <strong>R$ 5.600,00 / mês</strong> se populado com ID inexistente na base Mastercard.</td>
    </tr>
    <tr style="background:#ffffff; border-bottom:1px solid #e2e8f0;">
      <td style="padding:9px 10px; font-weight:bold; color:#b45309;">Mastercard</td>
      <td style="padding:9px 10px; font-family:monospace; font-weight:bold; color:#0f172a;">Auth: DE 48 SE 37 SF 3<br/>Auth/IPM: DE 42<br/>(Pos 161–175 Rel. IP)</td>
      <td style="padding:9px 10px; font-family:monospace;">ans 15<br/>(15 posições)</td>
      <td style="padding:9px 10px; color:#1e293b;"><strong>Submerchant ID &amp; Card Acceptor ID Code (<code>DE 42</code>):</strong> Identifica univocamente o Seller/Submerchant. É estritamente proibido enviar o mesmo <code>DE 42</code> genérico para vendedores distintos.</td>
      <td style="padding:9px 10px; color:#dc2626; font-weight:600;"><code>MCBS 2PN2117</code> (p. 369): <strong>R$ 5.600,00 / mês</strong> quando o DE 42 não identifica univocamente o sublojista; <code>2PN2106</code> se em branco.</td>
    </tr>
    <tr style="background:#f8fafc; border-bottom:1px solid #e2e8f0;">
      <td style="padding:9px 10px; font-weight:bold; color:#b45309;">Mastercard</td>
      <td style="padding:9px 10px; font-family:monospace; font-weight:bold; color:#0f172a;">IPM: PDS 0178<br/>(Table 619, p. 683)<br/>SF 1 (Pos 1–3)<br/>SF 2 (Pos 4–201)</td>
      <td style="padding:9px 10px; font-family:monospace;">SF 1: an-3<br/>SF 2: b-198<br/>(Total 201 bytes)</td>
      <td style="padding:9px 10px; color:#1e293b;"><strong>Alternate Merchant Name and Location (Submerchant Data):</strong><br/>&bull; <code>SF 1 (Pos 1–3)</code>: <em>Character Set Indicator</em>.<br/>&bull; <code>SF 2 (Pos 4–201)</code>: <em>Acceptor Description Data</em> contendo Nome, Endereço completo, Cidade, UF, CEP (Postal Code), País (<code>BRA</code>) e identificação fiscal do sublojista.</td>
      <td style="padding:9px 10px; color:#dc2626; font-weight:600;"><code>2PN2104 / 2PN2119</code> (CEP inválido: <strong>R$ 5.600/mês</strong>) e <code>2PN2121 / 2PN2125</code> (Endereço inválido ou "UNKNOWN": <strong>R$ 5.000/mês</strong>).</td>
    </tr>
    <tr style="background:#ffffff; border-bottom:1px solid #e2e8f0;">
      <td style="padding:9px 10px; font-weight:bold; color:#b45309;">Mastercard</td>
      <td style="padding:9px 10px; font-family:monospace; font-weight:bold; color:#0f172a;">Auth/IPM: DE 63 SF 2<br/>(Pos 527–541 Rel. IP)</td>
      <td style="padding:9px 10px; font-family:monospace;">ans 15<br/>(15 posições)</td>
      <td style="padding:9px 10px; color:#1e293b;"><strong>Trace ID (Lifecycle ID):</strong> Gerado pela Mastercard na autorização (<code>0110</code>). Quando um carrinho multi-seller é liquidado em <strong>múltiplas capturas parciais (Split no Clearing)</strong>, todas as apresentações <code>1240</code> filhas devem preservar o exato <code>DE 63 SF 2</code> da autorização mãe.</td>
      <td style="padding:9px 10px; color:#dc2626; font-weight:600;"><code>MCBS 2PN2409</code> (p. 378 — <em>Trace ID Error</em>) + downgrade de intercâmbio por apresentação órfã.</td>
    </tr>
    <tr style="background:#f8fafc; border-bottom:1px solid #e2e8f0;">
      <td style="padding:9px 10px; font-weight:bold; color:#1e40af;">Visa</td>
      <td style="padding:9px 10px; font-family:monospace; font-weight:bold; color:#0f172a;">Auth: DE 62.4 / DE 104<br/>Base II: TC 05 TCR 0, TCR 1 e TCR 5</td>
      <td style="padding:9px 10px; font-family:monospace;">MVV: an 10<br/>PF ID: n 11<br/>Sub-ID: ans 15</td>
      <td style="padding:9px 10px; color:#1e293b;"><strong>Visa MVV + Payment Facilitator / Marketplace ID + Sub-Merchant Tax ID:</strong><br/>&bull; <code>MVV (10 pos)</code>: comprova o registro de Qualifying Marketplace.<br/>&bull; <code>PF ID (11 dígitos)</code> + <code>Sub-Merchant ID (15 pos)</code> + <code>CNPJ/CPF</code> no registro nacional do Base II.<br/>&bull; <code>Foreign Retailer Indicator</code>: obrigatório quando o seller está domiciliado fora do Brasil.</td>
      <td style="padding:9px 10px; color:#dc2626; font-weight:600;">Perda imediata da qualificação de Marketplace + Multa <code>BL 5Z9965656</code> (<strong>R$ 65.000 a R$ 320.000 / URL</strong>).</td>
    </tr>
    <tr style="background:#ffffff;">
      <td style="padding:9px 10px; font-weight:bold; color:#047857;">Elo (26.2)</td>
      <td style="padding:9px 10px; font-family:monospace; font-weight:bold; color:#0f172a;">Reg "00" (Principal)<br/>Reg "01" Pos 45–58<br/>Reg "02" (Subcred.)<br/>Reg "45" Pos 159–166</td>
      <td style="padding:9px 10px; font-family:monospace;">Reg 01: A 14<br/>(CNPJ/CPF)<br/>Reg 45: an 8 (IRQ)</td>
      <td style="padding:9px 10px; color:#1e293b;"><strong>Segregação Estrita PJ vs. PF &amp; Retorno de IRQ (Manual Liquidação Elo 26.2, p. 82):</strong><br/>&bull; <code>Registro "01" (Pos 45, 14 bytes)</code>: transporta o <code>CNPJ (14 dígitos)</code> ou <code>CPF (11 dígitos)</code> do Seller.<br/>&bull; <code>Registro "02"</code>: identifica o Subcredenciador e os dados do sublojista.<br/>&bull; <strong>Regra 26.2:</strong> vendedores PF (CPF) são bloqueados em MCCs exclusivos de PJ. O <code>Registro "45" (Pos 159–166)</code> devolve o <strong>IRQ</strong> recalculado.</td>
      <td style="padding:9px 10px; color:#dc2626; font-weight:600;">Rejeição técnica do registro no lote de liquidação ou reclassificação automática para tarifa de intercâmbio cheia.</td>
    </tr>
  </tbody>
</table>

<!-- =====================================================================
     SEÇÃO 4: ARQUITETURA DO SPLIT E SIMULAÇÃO NUMÉRICA PASSO A PASSO
     ===================================================================== -->
<h2>4. Arquitetura do Split e Simulação Financeira Real (R$ 500,00 em Carrinho com 2 Sellers)</h2>
<p>
  Para eliminar qualquer dúvida sobre como o dinheiro, as taxas de bandeira e o intercâmbio se comportam em uma venda real de Marketplace, veja abaixo a comparação exata entre os <strong>dois padrões de engenharia de captura</strong> e a demonstração contábil centavo a centavo.
</p>

<h3>4.1. Comparativo Técnico: Padrão A (Captura Única) vs. Padrão B (Múltiplas Capturas Parciais no Clearing)</h3>
<table style="width:100%; border-collapse:collapse; margin:1.25rem 0; font-size:12px; border:1px solid #cbd5e1; border-radius:10px; overflow:hidden;">
  <thead>
    <tr style="background:#0f2c59; color:#ffffff;">
      <th style="padding:9px 10px; text-align:left; width:20%;">Dimensão</th>
      <th style="padding:9px 10px; text-align:left; width:40%;">Padrão A: Autorização Única + Clearing Único + Split na Liquidação/UR<br/><span style="font-size:10.5px; font-weight:normal; color:#93c5fd;">(Exclusivo para Marketplace Qualificado — MCC 5262)</span></th>
      <th style="padding:9px 10px; text-align:left; width:40%;">Padrão B: 1 Autorização + <em>N</em> Capturas Parciais de Clearing<br/><span style="font-size:10.5px; font-weight:normal; color:#93c5fd;">(Obrigatório quando cada Seller usa MCC próprio / PayFac)</span></th>
    </tr>
  </thead>
  <tbody>
    <tr style="background:#ffffff; border-bottom:1px solid #e2e8f0;">
      <td style="padding:9px 10px; font-weight:bold; color:#0f172a;">Como trafega na Bandeira</td>
      <td style="padding:9px 10px; color:#1e293b;">Envia <strong>1 mensagem 0100</strong> pelo valor total do carrinho (R$ 500) e <strong>1 único registro de clearing</strong> (<code>TC 05</code> / <code>IPM 1240</code>) de R$ 500 sob o <code>MCC 5262</code> e o <code>MVV</code> do Marketplace.</td>
      <td style="padding:9px 10px; color:#1e293b;">Envia <strong>1 pré-autorização 0100</strong> de R$ 500 e apresenta <strong>2 registros separados de clearing</strong>: um de R$ 300 (Seller A, MCC 5732, CNPJ A) e outro de R$ 200 (Seller B, MCC 5651, CNPJ B), amarrados pelo mesmo <code>Trace ID</code> e <em>Multiple Clearing Sequence Number</em>.</td>
    </tr>
    <tr style="background:#f8fafc; border-bottom:1px solid #e2e8f0;">
      <td style="padding:9px 10px; font-weight:bold; color:#0f172a;">Experiência na Fatura do Portador</td>
      <td style="padding:9px 10px; color:#1e293b;">O comprador vê <strong>1 único lançamento de R$ 500,00</strong> (ou parcelas de R$ 500) com o nome do Marketplace (menor índice de chargeback por confusão).</td>
      <td style="padding:9px 10px; color:#1e293b;">O comprador vê <strong>2 lançamentos separados</strong> na fatura (<code>PF*SELLER_A R$ 300</code> e <code>PF*SELLER_B R$ 200</code>), embora tenha feito apenas 1 checkout.</td>
    </tr>
    <tr style="background:#ffffff; border-bottom:1px solid #e2e8f0;">
      <td style="padding:9px 10px; font-weight:bold; color:#0f172a;">Impacto no Novo Visa VSS 2026 (De-Para 1&rarr;20)</td>
      <td style="padding:9px 10px; color:#047857; font-weight:600;">Paga <strong>1 única tarifa de clearing Base II</strong> e permanece na <strong>Faixa 5 (&gt; USD 50 / &gt; R$ 323,40 — código <code>2E0150AA18</code>)</strong>.</td>
      <td style="padding:9px 10px; color:#d97706; font-weight:600;">Paga <strong>2x a tarifa fixa por item de clearing</strong> e ambos os sub-pedidos caem para a <strong>Faixa 4 (USD 15.01–50.00 / R$ 97–323,40 — código <code>2E0150AA17</code>)</strong>.</td>
    </tr>
    <tr style="background:#f8fafc;">
      <td style="padding:9px 10px; font-weight:bold; color:#0f172a;">Onde ocorre a divisão (Split)</td>
      <td style="padding:9px 10px; color:#1e293b;">No motor de agenda/split da Adquirente ou do Subcredenciador, que gera as URs separadas por CNPJ do Seller nas Registradoras e liquida na CIP/SLC.</td>
      <td style="padding:9px 10px; color:#1e293b;">Já nasce dividido desde o arquivo de clearing enviado à bandeira (cada captura já carrega o <code>DE 42</code> e o <code>CNPJ</code> do respectivo seller).</td>
    </tr>
  </tbody>
</table>

<h3>4.2. Demonstração Numérica Completa (Walkthrough de R$ 500,00 — Passo a Passo)</h3>
<div style="background:#f0fdf4; border:1px solid #bbf7d0; border-left:5px solid #16a34a; border-radius:12px; padding:16px 20px; margin:1.25rem 0; font-size:12px; line-height:1.65;">
  <strong style="color:#15803d; font-size:13.5px; display:block; margin-bottom:8px;">🧮 EXEMPLO REAL AUDITÁVEL: COMPRA DE R$ 500,00 NO CRÉDITO À VISTA (2 SELLERS)</strong>
  <p style="margin:0 0 8px 0; color:#1e293b;">
    <strong>Cenário:</strong> O comprador paga <strong>R$ 500,00</strong> com cartão de crédito Mastercard Platinum em um Marketplace. O carrinho contém:
    <strong>Seller A (Eletrônicos) = R$ 300,00 (60%)</strong> e <strong>Seller B (Acessórios) = R$ 200,00 (40%)</strong>. O Marketplace cobra de cada seller uma comissão total de <strong>14,00%</strong> (sendo <strong>11,00% de Take Rate Comercial</strong> + <strong>3,00% de MDR de Pagamento</strong>).
  </p>
  <ol style="margin:0; padding-left:18px; color:#0f172a;">
    <li><strong>Etapa 1 — Desconto na Fonte pelo Banco Emissor (Intercâmbio):</strong><br/>
      O Emissor aprova R$ 500,00 e retém a <strong>Tarifa de Intercâmbio (TIC)</strong> (ex.: <code>1,70% = R$ 8,50</code>). O Emissor envia para a câmera de compensação da Bandeira <strong>R$ 491,50</strong>.</li>
    <li><strong>Etapa 2 — Cobrança das Taxas de Bandeira (Scheme Fees no VSS / MCBS):</strong><br/>
      A Bandeira cobra do Adquirente as taxas de processamento e volume (ex.: Assessment + Auth + Clearing + Cross-referencing &approx; <code>0,22% = R$ 1,10</code>). Custo direto Bandeira + Emissor = <strong>R$ 9,60 (1,92%)</strong>.</li>
    <li><strong>Etapa 3 — Margem do Adquirente Patrocinador:</strong><br/>
      O Adquirente retém seu spread de processamento/subcredenciamento (ex.: <code>0,18% = R$ 0,90</code>). Custo total de adquirência (<em>Interchange++</em>) = <strong>R$ 10,50 (2,10% sobre R$ 500,00)</strong>. Valor líquido entregue pela Adquirente ao ecossistema do Marketplace = <strong>R$ 489,50</strong>.</li>
    <li><strong>Etapa 4 — Split das Unidades de Recebíveis (URs na Registradora e Liquidação CIP/SLC):</strong><br/>
      &bull; <strong>UR do Seller A (Bruto R$ 300,00 &minus; 14% [R$ 42,00]):</strong> Recebe <strong>R$ 258,00 líquidos</strong> na sua conta domicílio via grade <code>ASLC029</code>.<br/>
      &bull; <strong>UR do Seller B (Bruto R$ 200,00 &minus; 14% [R$ 28,00]):</strong> Recebe <strong>R$ 172,00 líquidos</strong> na sua conta domicílio via grade <code>ASLC029</code>.<br/>
      &bull; <strong>Soma Repassada aos Sellers:</strong> <code>R$ 258,00 + R$ 172,00 = R$ 430,00</code>.</li>
    <li><strong>Etapa 5 — Receita Líquida e Segregação Fiscal do Marketplace:</strong><br/>
      Dos <strong>R$ 489,50</strong> líquidos que vieram da Adquirente, após pagar <strong>R$ 430,00</strong> aos Sellers, sobram exatamente <strong>R$ 59,50 (11,90% do GMV)</strong> no caixa do Marketplace, compostos por:<br/>
      &bull; <strong>Receita de Intermediação Comercial (Take Rate 11%):</strong> <code>R$ 55,00</code> (tributada por ISS/PIS/COFINS com emissão de NFSe contra os Sellers A e B).<br/>
      &bull; <strong>Ganho Líquido de Spread de Pagamentos (MDR 3,00% [R$ 15,00] &minus; Custo Interchange++ 2,10% [R$ 10,50]):</strong> <code>+ R$ 4,50 (90 bps de margem financeira líquida)</code>!</li>
  </ol>
</div>

<h3>4.3. Tabela das 5 Faixas de Ticket do Novo Visa VSS 2026 (De-Para 1&rarr;20)</h3>
<p>
  Em 2026, a Visa desmembrou 53 linhas clássicas de processamento (Base I, Base II e SMS) em <strong>1.160 códigos</strong> segmentados por Canal (<code>CP</code> vs. <code>CNP</code>), Produto (<code>Debit/Prepaid</code> vs. <code>Credit</code>) e <strong>5 Faixas de Ticket Médio em USD</strong>:
</p>

<table style="width:100%; border-collapse:collapse; margin:1.25rem 0; font-size:12px; border:1px solid #cbd5e1; border-radius:10px; overflow:hidden;">
  <thead>
    <tr style="background:#1e3a8a; color:#ffffff;">
      <th style="padding:9px 12px; text-align:left;">Faixa de Ticket (USD)</th>
      <th style="padding:9px 12px; text-align:left;">Equivalente Aprox. (BRL @ 6,46)</th>
      <th style="padding:9px 12px; text-align:left;">Exemplo Código Base II (CNP Crédito)</th>
      <th style="padding:9px 12px; text-align:left;">Linha Espelho de Desconto</th>
      <th style="padding:9px 12px; text-align:left;">Impacto do Split no Base II</th>
    </tr>
  </thead>
  <tbody>
    <tr style="background:#ffffff; border-bottom:1px solid #e2e8f0;">
      <td style="padding:8px 12px; font-weight:bold; color:#0f2c59;">Faixa 1: $0.00 &ndash; $2.00</td>
      <td style="padding:8px 12px;">Até R$ 12,90</td>
      <td style="padding:8px 12px; font-family:monospace; color:#1e40af; font-weight:bold;">2E0150AA14</td>
      <td style="padding:8px 12px; font-family:monospace; color:#047857;">2E0150AA99</td>
      <td style="padding:8px 12px; color:#334155;">Micro-tickets, gorjetas e split de frete avulso.</td>
    </tr>
    <tr style="background:#f8fafc; border-bottom:1px solid #e2e8f0;">
      <td style="padding:8px 12px; font-weight:bold; color:#0f2c59;">Faixa 2: $2.01 &ndash; $5.00</td>
      <td style="padding:8px 12px;">R$ 12,91 a R$ 32,30</td>
      <td style="padding:8px 12px; font-family:monospace; color:#1e40af; font-weight:bold;">2E0150AA15</td>
      <td style="padding:8px 12px; font-family:monospace; color:#047857;">2E0150AA99</td>
      <td style="padding:8px 12px; color:#334155;">Sub-pedidos pequenos gerados por desmembramento de carrinho.</td>
    </tr>
    <tr style="background:#ffffff; border-bottom:1px solid #e2e8f0;">
      <td style="padding:8px 12px; font-weight:bold; color:#0f2c59;">Faixa 3: $5.01 &ndash; $15.00</td>
      <td style="padding:8px 12px;">R$ 32,31 a R$ 97,00</td>
      <td style="padding:8px 12px; font-family:monospace; color:#1e40af; font-weight:bold;">2E0150AA16</td>
      <td style="padding:8px 12px; font-family:monospace; color:#047857;">2E0150AA99</td>
      <td style="padding:8px 12px; color:#334155;">Faixa mais comum quando um carrinho de R$ 250 é dividido em 4 sellers.</td>
    </tr>
    <tr style="background:#f8fafc; border-bottom:1px solid #e2e8f0;">
      <td style="padding:8px 12px; font-weight:bold; color:#0f2c59;">Faixa 4: $15.01 &ndash; $50.00</td>
      <td style="padding:8px 12px;">R$ 97,01 a R$ 323,40</td>
      <td style="padding:8px 12px; font-family:monospace; color:#1e40af; font-weight:bold;">2E0150AA17</td>
      <td style="padding:8px 12px; font-family:monospace; color:#047857;">2E0150AA99</td>
      <td style="padding:8px 12px; color:#334155;">Ticket médio típico de e-commerce brasileiro.</td>
    </tr>
    <tr style="background:#ffffff;">
      <td style="padding:8px 12px; font-weight:bold; color:#0f2c59;">Faixa 5: &gt; $50.00</td>
      <td style="padding:8px 12px;">Acima de R$ 323,40</td>
      <td style="padding:8px 12px; font-family:monospace; color:#1e40af; font-weight:bold;">2E0150AA18</td>
      <td style="padding:8px 12px; font-family:monospace; color:#047857;">2E0150AA99</td>
      <td style="padding:8px 12px; color:#334155;">Carrinhos consolidados de alto valor (sem split no Base II).</td>
    </tr>
  </tbody>
</table>

<!-- =====================================================================
     SEÇÃO 5: ESTRUTURA OFICIAL DE CUSTOS E REGISTROS NO BRASIL (R$)
     ===================================================================== -->
<h2>5. Estrutura Oficial de Custos, Registros e Tarifas no Brasil (Preços Auditados 2026 em R$)</h2>
<p>
  Todos os valores abaixo foram verificados diretamente no <strong>Visa Fee Schedule Brasil 2026 (<code>feeschedule.visaonline.com</code> — Perfil BRAZIL, LAT.AM.)</strong> e no <strong>Manual MCBS Brasil Ed. 13.2 da Mastercard</strong>. Na Visa Brasil, as faturas são emitidas no portal <strong>VOIP</strong> no <strong>4º dia útil</strong> com liquidação obrigatória no <strong>10º dia útil</strong> em Reais (<code>R$</code>), com cláusula de reajuste anual pelo <strong>IPCA todo dia 1º de março</strong>.
</p>

<table style="width:100%; border-collapse:collapse; margin:1.5rem 0; font-size:12px; border:1px solid #cbd5e1; border-radius:10px; overflow:hidden;">
  <thead>
    <tr style="background:#065f46; color:#ffffff;">
      <th style="padding:9px 10px; text-align:left; width:11%;">Bandeira</th>
      <th style="padding:9px 10px; text-align:left; width:17%;">Billing Line / Event ID</th>
      <th style="padding:9px 10px; text-align:left; width:30%;">Nome Oficial da Tarifa &amp; Escopo</th>
      <th style="padding:9px 10px; text-align:left; width:20%;">Valor Oficial no Brasil (R$)</th>
      <th style="padding:9px 10px; text-align:left; width:22%;">Periodicidade &amp; Quem Paga</th>
    </tr>
  </thead>
  <tbody>
    <tr style="background:#ffffff; border-bottom:1px solid #e2e8f0;">
      <td style="padding:8px 10px; font-weight:bold; color:#1e40af;">Visa</td>
      <td style="padding:8px 10px; font-family:monospace; font-weight:bold;">BL 5Q6562026<br/>BL 5Q6562027<br/>BL 5Q6562028</td>
      <td style="padding:8px 10px; color:#0f172a;"><strong>Third Party Agent Fees — Initial Registration &amp; Annual Renewal (PF / HRIPF / ISO / SDWO / DCV):</strong> Registro inicial e renovação anual de Payment Facilitator, High-Risk Internet PF, ISO, Staged Digital Wallet Operator e Dynamic Currency Conversion.</td>
      <td style="padding:8px 10px; font-weight:bold; color:#047857;">R$ 32.000,00<br/><span style="font-size:10.5px; color:#64748b; font-weight:normal;">(Por Agente / Ano)</span></td>
      <td style="padding:8px 10px; color:#334155;">No registro inicial + Renovação Anual (Cobrado do Adquirente patrocinador).</td>
    </tr>
    <tr style="background:#f8fafc; border-bottom:1px solid #e2e8f0;">
      <td style="padding:8px 10px; font-weight:bold; color:#1e40af;">Visa</td>
      <td style="padding:8px 10px; font-family:monospace; font-weight:bold;">BL 5Q6562026<br/>BL 5Q6562029</td>
      <td style="padding:8px 10px; color:#0f172a;"><strong>Third Party Agent Registration &amp; Renewal (ESO / TPS):</strong> Registro inicial e renovação anual para Encryption Support Organization e Third Party Servicer (Gateways e Cofres).</td>
      <td style="padding:8px 10px; font-weight:bold; color:#047857;">R$ 6.500,00<br/><span style="font-size:10.5px; color:#64748b; font-weight:normal;">(Por Agente / Ano)</span></td>
      <td style="padding:8px 10px; color:#334155;">No registro inicial + Renovação Anual.</td>
    </tr>
    <tr style="background:#ffffff; border-bottom:1px solid #e2e8f0;">
      <td style="padding:8px 10px; font-weight:bold; color:#1e40af;">Visa</td>
      <td style="padding:8px 10px; font-family:monospace; font-weight:bold;">BL 5Q6562026<br/>BL 5Q6562028</td>
      <td style="padding:8px 10px; color:#0f172a;"><strong>Third Party Agent Transfer (BIN Transfer / Portfolio Sale):</strong> Transferência de registro de agente/PayFac entre dois clientes por venda de carteira ou migração de BIN.</td>
      <td style="padding:8px 10px; font-weight:bold; color:#047857;">R$ 3.200,00<br/><span style="font-size:10.5px; color:#64748b; font-weight:normal;">(Isento em fusão ou mesma holding)</span></td>
      <td style="padding:8px 10px; color:#334155;">Por evento de transferência (Cobrado do Adquirente recebedor).</td>
    </tr>
    <tr style="background:#f8fafc; border-bottom:1px solid #e2e8f0;">
      <td style="padding:8px 10px; font-weight:bold; color:#b45309;">Mastercard</td>
      <td style="padding:8px 10px; font-family:monospace; font-weight:bold;">MCBS 2SC1812<br/>MCBS 2SC1827</td>
      <td style="padding:8px 10px; color:#0f172a;"><strong>Global Member Service Provider (MSP / PayFac) Registration &amp; Renewal Fees (p. 427):</strong> Registro inicial e renovação anual de Subcredenciador / MSP para programas Mastercard / Cirrus / Maestro.</td>
      <td style="padding:8px 10px; font-weight:bold; color:#047857;">Inicial: R$ 18.135,00<br/>Renovação: R$ 9.067,50</td>
      <td style="padding:8px 10px; color:#334155;">Inicial + Anual (Cobrado do Membro Principal / Adquirente).</td>
    </tr>
    <tr style="background:#ffffff; border-bottom:1px solid #e2e8f0;">
      <td style="padding:8px 10px; font-weight:bold; color:#b45309;">Mastercard</td>
      <td style="padding:8px 10px; font-family:monospace; font-weight:bold;">MCBS 2FL1892<br/>MCBS 2FL1897</td>
      <td style="padding:8px 10px; color:#0f172a;"><strong>Member Service Provider (MSP) Debit Registration &amp; Renewal Fees (p. 100):</strong> Registro inicial e renovação anual específico de MSP Débito.</td>
      <td style="padding:8px 10px; font-weight:bold; color:#047857;">Inicial: R$ 9.068,00<br/>Renovação: R$ 5.441,00</td>
      <td style="padding:8px 10px; color:#334155;">Inicial + Anual (Membro Principal / Adquirente).</td>
    </tr>
    <tr style="background:#f8fafc; border-bottom:1px solid #e2e8f0;">
      <td style="padding:8px 10px; font-weight:bold; color:#b45309;">Mastercard</td>
      <td style="padding:8px 10px; font-family:monospace; font-weight:bold;">MCBS 2NB00011<br/>MCBS 2NB0016</td>
      <td style="padding:8px 10px; color:#0f172a;"><strong>MATCH™ (Member Alert to Control High-Risk Merchants — p. 318–319):</strong> Assinatura trimestral do sistema MATCH/MOST e taxa por consulta via API no onboarding de cada Seller.</td>
      <td style="padding:8px 10px; font-weight:bold; color:#047857;">Fixo: R$ 3.200,00 / trim<br/>API: R$ 0,20 / consulta<br/><span style="font-size:10px; color:#64748b; font-weight:normal;">(Faixa 1 a 999 consultas)</span></td>
      <td style="padding:8px 10px; color:#334155;">Trimestral + Por consulta de Seller no KYB.</td>
    </tr>
    <tr style="background:#ffffff; border-bottom:1px solid #e2e8f0;">
      <td style="padding:8px 10px; font-weight:bold; color:#1e40af;">Visa</td>
      <td style="padding:8px 10px; font-family:monospace; font-weight:bold;">BL 5D0210234<br/>BL 5W2221009<br/>BL 5Z9965900</td>
      <td style="padding:8px 10px; color:#0f172a;"><strong>Account Name Inquiry (ANI), OBO Credential Update &amp; VCEH Pushed Token:</strong> Validação de titularidade da conta, atualização de cartão em cofre e push de token para carteira do Marketplace.</td>
      <td style="padding:8px 10px; font-weight:bold; color:#047857;">ANI: R$ 0,32 / consulta<br/>OBO: R$ 0,10 / update<br/>Pushed Token: R$ 0,50</td>
      <td style="padding:8px 10px; color:#334155;">Mensal por evento (VCEH Implementation: R$ 162.000 único).</td>
    </tr>
    <tr style="background:#f8fafc; border-bottom:1px solid #e2e8f0;">
      <td style="padding:8px 10px; font-weight:bold; color:#b45309;">Mastercard</td>
      <td style="padding:8px 10px; font-family:monospace; font-weight:bold;">MCBS 2SC6602</td>
      <td style="padding:8px 10px; color:#0f172a;"><strong>Automatic Billing Updater (ABU) Acquirer Merchant Matches (p. 434):</strong> Atualização automática mensal de cartões salvos no cofre do Marketplace (Tier 1 a 100.000 matches).</td>
      <td style="padding:8px 10px; font-weight:bold; color:#047857;">R$ 0,13 por match</td>
      <td style="padding:8px 10px; color:#334155;">Mensal por credencial atualizada.</td>
    </tr>
    <tr style="background:#ffffff;">
      <td style="padding:8px 10px; font-weight:bold; color:#1e40af;">Visa</td>
      <td style="padding:8px 10px; font-family:monospace; font-weight:bold;">BL 5W2200013<br/>BL 5W2221007</td>
      <td style="padding:8px 10px; color:#0f172a;"><strong>Visa Token Service (VTS) Direct Certification &amp; TLCM:</strong> Certificação direta de Token Requestor e gestão de ciclo de vida de tokens.</td>
      <td style="padding:8px 10px; font-weight:bold; color:#047857;">Cert. Ecomm: R$ 323.000<br/>TLCM: R$ 3.234 / mês<br/><span style="font-size:10.5px; color:#dc2626; font-weight:bold;">(05/2027 SDK &gt;$5B: R$ 5.168.000/ano)</span></td>
      <td style="padding:8px 10px; color:#334155;">Apenas para conexão direta (isento se usar cofre/token via Adquirente).</td>
    </tr>
  </tbody>
</table>

<!-- =====================================================================
     SEÇÃO 6: PENALIDADES, MULTAS DE DADOS, DISPUTAS VROL E MONITORIA (VAMP/ECP/BRAM)
     ===================================================================== -->
<h2>6. Mapa Auditado de Penalidades, Multas de Dados (MCBS), Disputas VROL e Monitoria (VAMP / ECP / BRAM)</h2>

<h3>6.1. Como Funciona o Novo Programa Unificado VAMP (Visa Acquirer Monitoring Program) e o Mastercard ECP</h3>
<p>
  A Visa unificou os antigos programas de fraude (VFMP) e de disputas (VDMP) em um único programa global: o <strong>VAMP (Visa Acquirer Monitoring Program)</strong>. No modelo de Subcredenciador/Marketplace, a bandeira mede o indicador simultaneamente sobre a <strong>carteira agregada do Adquirente/PayFac</strong> e sobre <strong>cada Merchant/Submerchant individual</strong>:
</p>
<div style="background:#fef2f2; border:1px solid #fecaca; border-left:5px solid #dc2626; border-radius:12px; padding:14px 18px; margin:1rem 0; font-size:12px; line-height:1.6;">
  <strong style="color:#991b1b; font-size:13px; display:block; margin-bottom:4px;">📐 FÓRMULA OFICIAL DO VAMP RATIO (CONTAGEM MENSAL DE TRANSAÇÕES):</strong>
  <code style="display:block; background:#ffffff; border:1px solid #fca5a5; padding:8px 12px; border-radius:6px; color:#7f1d1d; font-weight:bold; margin:6px 0;">
    VAMP Ratio (%) = [ Avisos de Fraude (TC 40) + Disputas Não-Fraude (TC 15 Códigos 11, 12 e 13) ] &divide; [ Total de Transações Liquidadas (TC 05) ]
  </code>
  <ul style="margin:6px 0 0 0; padding-left:18px; color:#1e293b;">
    <li><strong>Sem Dupla Contagem:</strong> Uma disputa de fraude (<code>TC 15</code> Reason Code 10.x) já gera um aviso <code>TC 40</code>; portanto, a Visa contabiliza apenas o <code>TC 40</code> + as disputas de desacordo comercial/autorização/processamento (Códigos 11, 12 e 13).</li>
    <li><strong>Limites (Thresholds) Oficiais:</strong> Para o <strong>Merchant / Submerchant individual</strong>, o limite <em>Excessive</em> é de <strong>&ge; 1,50% (150 bps)</strong> (reduzindo conforme calendário regional para 0,90%). Para o <strong>Portfólio do Adquirente/PayFac</strong>, o nível <em>Above Standard</em> inicia em <strong>0,50% (50 bps)</strong> (caindo para 0,30%) e <em>Excessive</em> em <strong>0,70% (70 bps)</strong> (caindo para 0,50%).</li>
    <li><strong>No Mastercard Excessive Chargeback Program (ECP — <code>MCBS 2SC1380 a 2SC1387</code>):</strong> O Submerchant entra em <strong>CMM (Chargeback Monitored Merchant)</strong> ao atingir <strong>&ge; 100 chargebacks/mês E ratio &ge; 1,00% (100 bps)</strong>, e em <strong>ECM (Excessive Chargeback Merchant)</strong> ao atingir <strong>&ge; 100 chargebacks/mês E ratio &ge; 1,50% (150 bps)</strong>.</li>
  </ul>
</div>

<h3>6.2. Multas Mensais de Integridade de Mensageria (Mastercard Data Integrity Monitoring Program — MCBS Ed. 13.2)</h3>
<p>
  Auditadas mensalmente nos relatórios <code>IP714010-AA (Acquirer Accepted Errors Detail Report)</code> e <code>IP714010-BB</code> (páginas 366 a 379 do Manual MCBS Brasil Ed. 13.2):
</p>

<table style="width:100%; border-collapse:collapse; margin:1.25rem 0; font-size:11.5px; border:1px solid #fecaca; border-radius:10px; overflow:hidden;">
  <thead>
    <tr style="background:#991b1b; color:#ffffff;">
      <th style="padding:9px 10px; text-align:left; width:14%;">Código MCBS &amp; Pág.</th>
      <th style="padding:9px 10px; text-align:left; width:28%;">Nome Oficial do Evento no Manual MCBS</th>
      <th style="padding:9px 10px; text-align:left; width:40%;">O Que Dispara a Multa no Marketplace / Subcredenciador</th>
      <th style="padding:9px 10px; text-align:left; width:18%;">Multa Mensal Oficial</th>
    </tr>
  </thead>
  <tbody>
    <tr style="background:#ffffff; border-bottom:1px solid #fee2e2;">
      <td style="padding:8px 10px; font-family:monospace; font-weight:bold; color:#991b1b;">2PN2111<br/><span style="font-size:10px; color:#64748b;">(pág. 367)</span></td>
      <td style="padding:8px 10px; font-weight:bold; color:#0f172a;">Additional Data Field (DE 48) Invalid or Improper</td>
      <td style="padding:8px 10px; color:#334155;"><code>DE 48</code> contendo valores inválidos/impróprios, como <code>PF ID (SE 37 / PDS 0208)</code> ausente, mal formatado ou não registrado na Mastercard.</td>
      <td style="padding:8px 10px; font-weight:bold; color:#dc2626;">R$ 5.600,00 / mês</td>
    </tr>
    <tr style="background:#fef2f2; border-bottom:1px solid #fee2e2;">
      <td style="padding:8px 10px; font-family:monospace; font-weight:bold; color:#991b1b;">2PN2113 (p.368)<br/>2PN2118 (p.369)</td>
      <td style="padding:8px 10px; font-weight:bold; color:#0f172a;">Invalid DE 43 Card Acceptor Name/Location (Auth &amp; Clearing)</td>
      <td style="padding:8px 10px; color:#334155;"><code>DE 43</code> ausente ou fora do formato <code>PF*NOME_SELLER</code> na Autorização (<code>2PN2113</code>) ou no Clearing IPM (<code>2PN2118</code>).</td>
      <td style="padding:8px 10px; font-weight:bold; color:#dc2626;">R$ 5.600,00 / mês<br/><span style="font-size:10px; font-weight:normal;">(cada evento)</span></td>
    </tr>
    <tr style="background:#ffffff; border-bottom:1px solid #fee2e2;">
      <td style="padding:8px 10px; font-family:monospace; font-weight:bold; color:#991b1b;">2PN2117 (p.369)<br/>2PN2106 (p.366)</td>
      <td style="padding:8px 10px; font-weight:bold; color:#0f172a;">Clearing Data Integrity — Invalid Card Acceptor ID (DE 42)</td>
      <td style="padding:8px 10px; color:#334155;"><code>DE 42</code> não identifica univocamente cada sublojista/local no Clearing (<code>2PN2117</code>) ou está em branco/inválido na Autorização (<code>2PN2106</code>).</td>
      <td style="padding:8px 10px; font-weight:bold; color:#dc2626;">R$ 5.600,00 / mês<br/><span style="font-size:10px; font-weight:normal;">(2PN2106: por Tier)</span></td>
    </tr>
    <tr style="background:#fef2f2; border-bottom:1px solid #fee2e2;">
      <td style="padding:8px 10px; font-family:monospace; font-weight:bold; color:#991b1b;">2PN2104 (p.366)<br/>2PN2119 (p.369)<br/>2PN2403 (p.377)</td>
      <td style="padding:8px 10px; font-weight:bold; color:#0f172a;">Invalid or Blank Country / Postal Code (Auth, Clearing &amp; Debit)</td>
      <td style="padding:8px 10px; color:#334155;">Código de país ou CEP do Seller inválido/em branco na Autorização (<code>2PN2104</code>), no Clearing (<code>2PN2119</code>) ou no Débito (<code>2PN2403</code>).</td>
      <td style="padding:8px 10px; font-weight:bold; color:#dc2626;">2PN2104/2119: R$ 5.600/mês<br/>2PN2403: R$ 5.000/mês</td>
    </tr>
    <tr style="background:#ffffff; border-bottom:1px solid #fee2e2;">
      <td style="padding:8px 10px; font-family:monospace; font-weight:bold; color:#991b1b;">2PN2121 (p.370)<br/>2PN2125 (p.371)</td>
      <td style="padding:8px 10px; font-weight:bold; color:#0f172a;">Clearing Data Integrity — Invalid Address / Street Address</td>
      <td style="padding:8px 10px; color:#334155;">Preenchimento da palavra <code>"UNKNOWN"</code> ou caracteres inválidos no endereço de rua do Seller (<code>DE 43 SF 2</code> / <code>PDS 0178</code>).</td>
      <td style="padding:8px 10px; font-weight:bold; color:#dc2626;">R$ 5.000,00 / mês<br/><span style="font-size:10px; font-weight:normal;">(cada evento)</span></td>
    </tr>
    <tr style="background:#fef2f2; border-bottom:1px solid #fee2e2;">
      <td style="padding:8px 10px; font-family:monospace; font-weight:bold; color:#991b1b;">2PN2120 (p.370)<br/>2PN2410 (p.379)</td>
      <td style="padding:8px 10px; font-weight:bold; color:#0f172a;">POS Auth vs. Clearing Mismatch &amp; Auth Postal Code Mismatch</td>
      <td style="padding:8px 10px; color:#334155;">Dados enviados na Autorização não batem com o Clearing (<code>2PN2120</code>) ou o CEP enviado na Autorização difere do CEP enviado no Clearing (<code>2PN2410</code>).</td>
      <td style="padding:8px 10px; font-weight:bold; color:#dc2626;">2PN2120: R$ 5.000/mês<br/>2PN2410: R$ 5.600/mês</td>
    </tr>
    <tr style="background:#ffffff;">
      <td style="padding:8px 10px; font-family:monospace; font-weight:bold; color:#991b1b;">2PN2110 (p.367)<br/>2PN2402 (p.377)<br/>2PN2409 (p.378)</td>
      <td style="padding:8px 10px; font-weight:bold; color:#0f172a;">E-Commerce Invalid / Debit Invalid Merchant Type / Trace ID</td>
      <td style="padding:8px 10px; color:#334155;">Campos de e-commerce em branco/inválidos (<code>2PN2110</code>), combinação inválida de MCC + TCC no débito (<code>2PN2402</code>) ou perda do <code>Trace ID</code> no clearing de capturas parciais (<code>2PN2409</code>).</td>
      <td style="padding:8px 10px; font-weight:bold; color:#dc2626;">2PN2110: R$ 5.600/mês<br/>2PN2402: R$ 5.000/mês<br/>2PN2409: por Tier</td>
    </tr>
  </tbody>
</table>

<h3>6.3. Multas de Compliance, Sellers Proibidos (URL / BRAM), Inspeções AMP e Custos de Disputa VROL</h3>
<table style="width:100%; border-collapse:collapse; margin:1.25rem 0; font-size:11.5px; border:1px solid #cbd5e1; border-radius:10px; overflow:hidden;">
  <thead>
    <tr style="background:#0f172a; color:#ffffff;">
      <th style="padding:9px 10px; text-align:left; width:15%;">Bandeira &amp; Código</th>
      <th style="padding:9px 10px; text-align:left; width:25%;">Programa / Evento Oficial</th>
      <th style="padding:9px 10px; text-align:left; width:36%;">Gatilho Exato &amp; Regra de Escalonamento</th>
      <th style="padding:9px 10px; text-align:left; width:24%;">Penalidade Oficial no Brasil (R$)</th>
    </tr>
  </thead>
  <tbody>
    <tr style="background:#ffffff; border-bottom:1px solid #e2e8f0;">
      <td style="padding:8px 10px; font-family:monospace; font-weight:bold; color:#1e40af;">Visa<br/>BL 5Z9965656</td>
      <td style="padding:8px 10px; font-weight:bold; color:#0f172a;">Acquirer Non-Compliance Assessments (Sponsored Merchant URL / Gambling / High-Brand Risk)</td>
      <td style="padding:8px 10px; color:#334155;">Processamento para URL de merchant ou <em>sponsored merchant (seller)</em> irregular, produto proibido/falsificado, apostas sem licença ou excesso de créditos (&gt;5% threshold não corrigido por até 3 meses).</td>
      <td style="padding:8px 10px; font-weight:bold; color:#dc2626;">
        &bull; 1ª Violação: <strong>R$ 65.000 / URL</strong><br/>
        &bull; 2ª (12m): <strong>R$ 160.000 / URL</strong><br/>
        &bull; 3ª+ (12m): <strong>R$ 320.000 / URL</strong><br/>
        &bull; 4ª (12m): <strong>Desqualificação permanente</strong><br/>
        &bull; Créditos &gt;5%: <strong>R$ 320 / crédito</strong>
      </td>
    </tr>
    <tr style="background:#f8fafc; border-bottom:1px solid #e2e8f0;">
      <td style="padding:8px 10px; font-family:monospace; font-weight:bold; color:#1e40af;">Visa<br/>BL 5Z9999105<br/>a 5Z9999194</td>
      <td style="padding:8px 10px; font-weight:bold; color:#0f172a;">Client and Agent Facilities Inspections (AMP Audit &amp; Non-Compliance)</td>
      <td style="padding:8px 10px; color:#334155;">Inspeção e auditoria trimestral quando o Adquirente ou Terceiro Agente (PayFac) entra no <em>Acquirer Monitoring Program (AMP)</em> ou falha no reporte de fraude (FRS).</td>
      <td style="padding:8px 10px; font-weight:bold; color:#dc2626;">
        &bull; AMP Audit Fee: <strong>R$ 65.000 / trim</strong><br/>
        &bull; AMP Non-Compliance: <strong>R$ 162.000</strong><br/>
        &bull; PIN Field Review: <strong>R$ 65.000 / trim</strong><br/>
        &bull; FRS Penalty: <strong>R$ 65.000 / trim</strong>
      </td>
    </tr>
    <tr style="background:#ffffff; border-bottom:1px solid #e2e8f0;">
      <td style="padding:8px 10px; font-family:monospace; font-weight:bold; color:#1e40af;">Visa<br/>BL 5Z9965657<br/>BL 5Z9999200</td>
      <td style="padding:8px 10px; font-weight:bold; color:#0f172a;">Issuer / Acquirer Non-Compliance &amp; Collateral Delinquency Assessments</td>
      <td style="padding:8px 10px; color:#334155;">Atraso diário na entrega de colateral/garantia exigida pela Visa ou violação regulatória não corrigida após 30 dias da notificação inicial.</td>
      <td style="padding:8px 10px; font-weight:bold; color:#dc2626;">
        &bull; Dias 1–15: <strong>R$ 650/dia</strong> (ou 0,2%/dia)<br/>
        &bull; &gt;15 dias: <strong>R$ 3.200/dia</strong> (ou 0,5%/dia)<br/>
        &bull; Identificação inicial: <strong>R$ 323.000</strong><br/>
        &bull; Sem ação em 30d: <strong>+ R$ 162.000</strong><br/>
        &bull; Meses 4–5: <strong>R$ 162.000 / mês</strong><br/>
        &bull; Mês 6+: <strong>R$ 363.000 / mês</strong>
      </td>
    </tr>
    <tr style="background:#f8fafc; border-bottom:1px solid #e2e8f0;">
      <td style="padding:8px 10px; font-family:monospace; font-weight:bold; color:#b45309;">Mastercard<br/>MCBS 2PN2008<br/>MCBS 2SC1424</td>
      <td style="padding:8px 10px; font-weight:bold; color:#0f172a;">BRAM (Business Risk Assessment and Mitigation — p. 366) &amp; FMP Level 2 On-Site MSP Review (p. 424)</td>
      <td style="padding:8px 10px; color:#334155;"><code>2PN2008</code>: venda de produtos ilegais ou que causem dano reputacional à marca Mastercard por submerchant. <code>2SC1424</code>: revisão presencial bienal de nível 2 no MSP/PayFac.</td>
      <td style="padding:8px 10px; font-weight:bold; color:#dc2626;">
        &bull; FMP Level 2 MSP Review: <strong>R$ 33.900,00</strong><br/>
        &bull; BRAM (<code>2PN2008</code>): Taxa variável severa por volume/gravidade
      </td>
    </tr>
    <tr style="background:#ffffff;">
      <td style="padding:8px 10px; font-family:monospace; font-weight:bold; color:#1e40af;">Visa<br/>BL 5H4010111<br/>BL 5H4010101<br/>BL 5H4010170</td>
      <td style="padding:8px 10px; font-weight:bold; color:#0f172a;">VROL Dispute Fees, Other Services &amp; Arbitration Case Filing Fees</td>
      <td style="padding:8px 10px; color:#334155;">Tarifas por evento de disputa (chargeback) no Visa Resolve Online (VROL), upload de evidências, resposta por prazo (Tier 2/3), disputa expirada e abertura de Arbitragem/Compliance.</td>
      <td style="padding:8px 10px; font-weight:bold; color:#dc2626;">
        &bull; Disputa submetida: <strong>R$ 10,35</strong><br/>
        &bull; Incremental CNP Fraud: <strong>+ R$ 12,00</strong><br/>
        &bull; Resposta 21–25d (T2): <strong>R$ 10,06</strong><br/>
        &bull; Resposta 26–30d (T3): <strong>R$ 12,36</strong><br/>
        &bull; Expirada (&gt;30d): <strong>R$ 29,00</strong><br/>
        &bull; Upload imagem VROL: <strong>R$ 8,63</strong><br/>
        &bull; Arbitragem (Filing): <strong>R$ 2.900,00</strong><br/>
        &bull; Appeal: <strong>R$ 5.751,00</strong> | Pen. Técnica: <strong>R$ 1.500,00</strong>
      </td>
    </tr>
  </tbody>
</table>

<!-- =====================================================================
     SEÇÃO 7: BLINDAGEM CONTRA RISCO DE CONTAMINAÇÃO CRUZADA & PLAYBOOK
     ===================================================================== -->
<h2>7. Blindagem contra Contaminação Cruzada (Cross-Default), KYB de Sellers e Arquitetura de Escrow</h2>
<p>
  Em um Marketplace ou Subcredenciador, o maior perigo operacional é a <strong>Contaminação Cruzada do PF ID / MVV</strong>: se uma quadrilha cadastrar lojas falsas para passar cartões clonados (<em>auto-financiamento / bust-out</em>) ou vender produtos sem entrega, o índice agregado de fraude/chargeback do Subcredenciador dispara no <strong>VAMP</strong> e no <strong>Mastercard ECP/EFM</strong>, podendo suspender o código mestre da plataforma inteira.
</p>

<table style="width:100%; border-collapse:collapse; margin:1.5rem 0; font-size:0.875rem; border:2px solid #059669; border-radius:10px; overflow:hidden;">
  <thead>
    <tr style="background:#065f46; color:#ffffff;">
      <th colspan="2" style="padding:12px; text-align:center; font-size:0.95rem; font-weight:bold;">
        MATRIZ DE BLINDAGEM OPERACIONAL &amp; FINANCEIRA DO MARKETPLACE (2x2)
      </th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="width:50%; padding:14px; background:#ecfdf5; border:1px solid #a7f3d0; vertical-align:top;">
        <strong style="color:#047857; font-size:0.9rem;">🟢 1. ONBOARDING &amp; KYB RIGOROSO (Prevenção na Entrada)</strong>
        <ul style="margin:8px 0 0 16px; padding:0; font-size:0.84rem; color:#064e3b; line-height:1.55;">
          <li><strong>Consulta Obrigatória ao MATCH™ / VMAS:</strong> Checar CNPJ e CPF dos sócios via API (<code>MCBS 2NB0016</code> — R$ 0,20) antes de liberar a 1ª venda.</li>
          <li><strong>Validação Automática CNAE &times; MCC &times; Natureza Jurídica:</strong> Bloquear atribuição de MCC de PJ para vendedores PF (conformidade Elo 26.2 Registro 01).</li>
          <li><strong>Web Crawler de URL e Catálogo:</strong> Varredura contínua de palavras-chave proibidas (BRAM / Visa High-Brand Risk) para evitar a multa de R$ 65.000 a R$ 320.000/URL.</li>
        </ul>
      </td>
      <td style="width:50%; padding:14px; background:#eff6ff; border:1px solid #bfdbfe; vertical-align:top;">
        <strong style="color:#1e40af; font-size:0.9rem;">🔵 2. ENGENHARIA DE AUTORIZAÇÃO &amp; 3DS SELETIVO</strong>
        <ul style="margin:8px 0 0 16px; padding:0; font-size:0.84rem; color:#1e3a8a; line-height:1.55;">
          <li><strong>Roteamento Dinâmico de 3DS 2.2 / DAF:</strong> Acionar autenticação com <em>Liability Shift</em> (ECI 05/02) sempre que o carrinho contiver sellers recém-cadastrados (&lt; 60 dias) ou itens de alta liquidez (eletrônicos/gift cards).</li>
          <li><strong>Network Tokens + VAU/ABU:</strong> Tokenizar cartões salvos na carteira do Marketplace para ganhar de +2% a +4% em aprovação e reduzir tarifas de CNP.</li>
          <li><strong>Stop-Retry Inteligente no DE 39:</strong> Bloquear retentativas após códigos restritos (59, 82, 83, 14, 41, 43).</li>
        </ul>
      </td>
    </tr>
    <tr>
      <td style="width:50%; padding:14px; background:#fffbeb; border:1px solid #fde68a; vertical-align:top;">
        <strong style="color:#b45309; font-size:0.9rem;">🟡 3. ESCROW LOGÍSTICO &amp; RESERVA DE LIQUIDAÇÃO</strong>
        <ul style="margin:8px 0 0 16px; padding:0; font-size:0.84rem; color:#92400e; line-height:1.55;">
          <li><strong>Liquidação Vinculada ao Tracking de Entrega:</strong> Só liberar a agenda financeira (ou permitir antecipação de recebíveis) após confirmação de postagem/entrega pelo transportador.</li>
          <li><strong>Rolling Reserve Dinâmico (5% a 15% por 30–90 dias):</strong> Retenção contratual de colchão de garantia para sellers com aumento súbito de TPV (<em>velocity spike</em>).</li>
          <li><strong>Compensação Automática Cross-Balance:</strong> Cláusula contratual permitindo abater chargebacks e tarifas VROL (R$ 10,35 a R$ 22,35) de vendas futuras do mesmo seller.</li>
        </ul>
      </td>
      <td style="width:50%; padding:14px; background:#fef2f2; border:1px solid #fecaca; vertical-align:top;">
        <strong style="color:#b91c1c; font-size:0.9rem;">🔴 4. GOVERNANÇA DE DESMEMBRAMENTO (TETO 10% / USD 10M)</strong>
        <ul style="margin:8px 0 0 16px; padding:0; font-size:0.84rem; color:#7f1d1d; line-height:1.55;">
          <li><strong>Monitor de Concentração por Seller:</strong> Alerta automático quando qualquer seller atingir <strong>7% do TPV do Marketplace</strong> ou <strong>USD 7M/ano</strong>.</li>
          <li><strong>Migração para Direct Merchant Agreement:</strong> Acima de 10% do TPV ou USD 10M/ano por bandeira, formalizar contrato tripartite direto entre Seller, Adquirente e Bandeira, mantendo a orquestração técnica no Marketplace sem violar o teto de Subcredenciador.</li>
        </ul>
      </td>
    </tr>
  </tbody>
</table>

<!-- =====================================================================
     SEÇÃO 8: CHECKLIST EXECUTIVO DE HOMOLOGAÇÃO & AUDITORIA 360º
     ===================================================================== -->
<h2>8. Checklist Mestre de Homologação &amp; Auditoria 360º (Do Contrato ao Switch ISO)</h2>

<table style="width:100%; border-collapse:collapse; margin:1.25rem 0; font-size:12px; border:1px solid #cbd5e1; border-radius:10px; overflow:hidden;">
  <thead>
    <tr style="background:#0f2c59; color:#ffffff;">
      <th style="padding:9px 10px; text-align:left; width:14%;">Pilar</th>
      <th style="padding:9px 10px; text-align:left; width:26%;">Item de Verificação Obrigatória</th>
      <th style="padding:9px 10px; text-align:left; width:46%;">Critério Técnico / Regulatório de Aceite</th>
      <th style="padding:9px 10px; text-align:center; width:14%;">Classificação</th>
    </tr>
  </thead>
  <tbody>
    <tr style="background:#ffffff; border-bottom:1px solid #e2e8f0;">
      <td style="padding:8px 10px; font-weight:bold; color:#1e40af;">1. Regulatório</td>
      <td style="padding:8px 10px; font-weight:bold; color:#0f172a;">Enquadramento SLC/CIP, Registradora &amp; Teto BCB 80</td>
      <td style="padding:8px 10px; color:#334155;">Definir se o split ocorre direto na Adquirente (Marketplace Puro) ou via Subcredenciador próprio integrado à CIP (<code>ASLC029/031/033</code>) e Registradoras (CERC/TAG/B3/Nuclea — Res. BCB 264). Monitorar teto de R$ 500M/12m para licença de IP.</td>
      <td style="padding:8px 10px; text-align:center;"><span style="background:#fee2e2; color:#991b1b; font-weight:bold; padding:2px 8px; border-radius:99px; font-size:10px;">OBRIGATÓRIO</span></td>
    </tr>
    <tr style="background:#f8fafc; border-bottom:1px solid #e2e8f0;">
      <td style="padding:8px 10px; font-weight:bold; color:#1e40af;">2. Bandeiras</td>
      <td style="padding:8px 10px; font-weight:bold; color:#0f172a;">Registro de PF ID / MVV / Marketplace ID</td>
      <td style="padding:8px 10px; color:#334155;">Confirmar registro ativo de Third Party Agent na Visa (<code>BL 5Q6562026</code> — R$ 32.000) e MSP/PF na Mastercard (<code>MCBS 2SC1812</code> — R$ 18.135) junto à credenciadora patrocinadora.</td>
      <td style="padding:8px 10px; text-align:center;"><span style="background:#fee2e2; color:#991b1b; font-weight:bold; padding:2px 8px; border-radius:99px; font-size:10px;">OBRIGATÓRIO</span></td>
    </tr>
    <tr style="background:#ffffff; border-bottom:1px solid #e2e8f0;">
      <td style="padding:8px 10px; font-weight:bold; color:#7e22ce;">3. Mensageria</td>
      <td style="padding:8px 10px; font-weight:bold; color:#0f172a;">Auditoria de DE 42, DE 43, DE 48 e DE 63.2</td>
      <td style="padding:8px 10px; color:#334155;">Validar nos logs <code>0100</code>, <code>TC 05</code> e <code>IPM 1240</code>: <code>DE 42</code> único por seller, <code>DE 43</code> no padrão <code>PF*SELLER</code> (40 bytes na Auth e 6 subcampos no IPM com CEP idêntico) e <code>PDS 0208 + PDS 0178</code> completos (zero erros no <code>IP714010-AA</code>).</td>
      <td style="padding:8px 10px; text-align:center;"><span style="background:#fee2e2; color:#991b1b; font-weight:bold; padding:2px 8px; border-radius:99px; font-size:10px;">OBRIGATÓRIO</span></td>
    </tr>
    <tr style="background:#f8fafc; border-bottom:1px solid #e2e8f0;">
      <td style="padding:8px 10px; font-weight:bold; color:#7e22ce;">4. Cadastro</td>
      <td style="padding:8px 10px; font-weight:bold; color:#0f172a;">Segregação PJ (CNPJ) vs. PF (CPF) Elo 26.2</td>
      <td style="padding:8px 10px; color:#334155;">Validar posição 45 (14 bytes) do <code>Registro "01"</code> da Elo 26.2 e impedir que vendedores cadastrados com CPF recebam MCCs exclusivos de Pessoa Jurídica.</td>
      <td style="padding:8px 10px; text-align:center;"><span style="background:#fef3c7; color:#92400e; font-weight:bold; padding:2px 8px; border-radius:99px; font-size:10px;">MANDATE 26.2</span></td>
    </tr>
    <tr style="background:#ffffff; border-bottom:1px solid #e2e8f0;">
      <td style="padding:8px 10px; font-weight:bold; color:#047857;">5. Pricing</td>
      <td style="padding:8px 10px; font-weight:bold; color:#0f172a;">Otimização de Captura Única vs. Parcial</td>
      <td style="padding:8px 10px; color:#334155;">Priorizar captura única sob <code>MCC 5262</code> quando operar como Marketplace Qualificado, evitando multiplicar tarifas fixas por item nas 5 faixas de ticket do Visa VSS 2026.</td>
      <td style="padding:8px 10px; text-align:center;"><span style="background:#dbeafe; color:#1e40af; font-weight:bold; padding:2px 8px; border-radius:99px; font-size:10px;">ALTA ECONOMIA</span></td>
    </tr>
    <tr style="background:#f8fafc;">
      <td style="padding:8px 10px; font-weight:bold; color:#b45309;">6. Risco &amp; Jurídico</td>
      <td style="padding:8px 10px; font-weight:bold; color:#0f172a;">Termo de Adesão do Seller, Procuração &amp; Escrow</td>
      <td style="padding:8px 10px; color:#334155;">Incluir nos Termos de Uso do Seller: procuração mercantil para liquidação, autorização de consulta/registro em registradoras (BCB 264), retenção de reserva (<em>Rolling Reserve</em>) e débito automático de disputas e multas de bandeira.</td>
      <td style="padding:8px 10px; text-align:center;"><span style="background:#dcfce7; color:#166534; font-weight:bold; padding:2px 8px; border-radius:99px; font-size:10px;">OBRIGATÓRIO</span></td>
    </tr>
  </tbody>
</table>

<div style="border-left:5px solid #2563eb; background:#eff6ff; padding:16px 20px; border-radius:0 12px 12px 0; margin:1.5rem 0;">
  <strong style="color:#1e40af; font-size:14px;">💡 Dica Interativa do Doc Studio (EcommIT):</strong>
  <p style="margin:6px 0 0 0; font-size:13px; line-height:1.6; color:#1e293b;">
    Você pode editar qualquer parágrafo ou tabela deste dossiê diretamente nesta folha A4, clicar nos botões superiores <strong>Motor de Campos</strong> (para inserir fichas técnicas adicionais do <code>DE 48 PDS 0208</code>, <code>DE 43</code> ou <code>Visa MVV</code>) ou <strong>Tarifas &amp; Campos (30k)</strong> (para consultar ao vivo qualquer uma das 13.181 linhas de faturamento MCBS/Visa e 17.106 campos posicionais) e exportar em <strong>PDF A4 Executivo</strong> ou <strong>Microsoft Word (.DOCX)</strong>.
  </p>
</div>`,
};
