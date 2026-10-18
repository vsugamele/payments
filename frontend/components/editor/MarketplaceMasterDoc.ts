import { BulletinMetadata } from "./BulletinMetadataCard";
import { DocumentTemplate } from "./TemplateSelector";

export const MARKETPLACE_MASTER_METADATA: BulletinMetadata = {
  brand: "geral",
  brandName: "Dossiê Mestre Multi-Bandeira & Bacen",
  title: "Guia Definitivo de Regras para Marketplaces & Subcredenciadores (PayFacs): Negócios, Mensageria, Regulação, Custos e Penalidades",
  referenceId: "MKT-PF-BR-2026-V1",
  publicationDate: "18/10/2026",
  effectiveDate: "Vigência 2026 / Ciclo 2026–2027",
  keyExpirationDate: "Revisão Anual IPCA (Março/2027)",
  category: "Marketplaces • Subcredenciadores (PayFac) • Split de Pagamento • ISO 8583 / Base II / IPM • Bacen BCB 150 & 264 • Custos & Multas",
  audience: [
    "Diretoria de Produto & Pagamentos (Marketplaces)",
    "Arquitetura & Engenharia de Mensageria (Switch / Gateway)",
    "Subcredenciadores (PayFacs) & Adquirentes",
    "Jurídico Regulatório, Risco, PLD/FT & Compliance",
    "Finanças, Tesouraria, Conciliação & Pricing (FP&A)",
  ],
  region: "Brasil (Doméstico & Cross-Border Remittance)",
  requirement: "Mandatório",
  riskLevel: "Crítico",
  tags: [
    "Marketplace Qualificado",
    "Subcredenciador / PayFac",
    "MCC 5262",
    "DE 43 PF*Seller",
    "PDS 0208 / PDS 0178",
    "Visa MVV & TCR 5",
    "CIP / SLC Grade Centralizada",
    "Registradoras (BCB 264)",
    "Visa Fee Schedule R$",
    "MCBS Data Integrity",
    "VAMP & BRAM",
  ],
  executiveSummary:
    "Compêndio executivo, técnico, regulatório e financeiro sobre a operação de Marketplaces e Subcredenciadores (Payment Facilitators) no Brasil. Consolida as exigências do Banco Central (Resoluções BCB nº 150 e nº 264, Liquidação Centralizada CIP/SLC e Trava de Recebíveis), os requisitos de qualificação das bandeiras (Visa Core Rules, Mastercard Rules Cap. 7 e Elo Release 26.2), a especificação byte-a-byte de mensageria (DE 42, DE 43, DE 48 PDS 0208/0178, MVV e Split de Captura) e a tabela real de custos de registro, tarifas de processamento e multas de não-conformidade em Reais (R$).",
  recommendedAction:
    "Auditar imediatamente: (1) o enquadramento societário/regulatório entre Marketplace Comercial Puro e Subcredenciador participante do SLC/CIP; (2) o preenchimento estrito de DE 42, DE 43 ('PF*Seller') e DE 48 (PDS 0208/0178 e MVV) para eliminar multas mensais de R$ 5.000 a R$ 5.600 do Data Integrity; (3) a arquitetura de captura parcial (Split) frente ao novo tarifário Visa VSS 2026 por faixa de ticket; e (4) o bloqueio preventivo de URLs e sellers irregulares para evitar multas BRAM/Visa de R$ 65.000 a R$ 320.000 por URL.",
  versionHistory: [
    {
      version: "2026.4 (Master)",
      date: "18/10/2026",
      description:
        "Consolidação integral com preços reais do Visa Fee Schedule Brasil (BRL), eventos MCBS Ed. 13.2, De-Para Visa VSS 1→20 por Ticket Size, Elo Release 26.2 (segregação CNPJ/CPF) e regras de UR/Gravame da Resolução BCB nº 264.",
      isCurrent: true,
    },
    {
      version: "2026.1",
      date: "01/03/2026",
      description:
        "Migração oficial das tabelas de tarifas e multas Visa no Brasil de USD para BRL (R$) com cláusula de reajuste anual pelo IPCA em março.",
      isCurrent: false,
    },
    {
      version: "2024.2",
      date: "01/10/2024",
      description:
        "Revisão dos limites de monitoria de disputas e atualização das taxas de registro de Third Party Agents (PF, ISO, HRIPF, ESO).",
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
      event: "Fiscalização Estrita Elo Release 26.2 (Segregação PJ vs. PF & IRQ)",
      impactType: "Deadline",
      explanation:
        "Obrigatoriedade de validação cruzada entre o documento fiscal do Seller (CNPJ 14 dígitos vs. CPF 11 dígitos) e a qualificação de MCC/IRQ nos lotes de liquidação.",
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
      label: "Teto Seller Individual",
      value: "Máx. 10% do TPV do Marketplace ou USD 10M/ano (Acima disso exige contrato direto com Adquirente)",
    },
    {
      id: "cf-2",
      label: "Registro Anual PayFac (BR)",
      value: "Visa PF/HRIPF: R$ 32.000,00 (BL 5Q6562026) • Mastercard MSP: R$ 18.135,00 ini / R$ 9.067,50 ren (2SC1812)",
    },
    {
      id: "cf-3",
      label: "Multa Data Integrity (DE 42/43/48)",
      value: "R$ 5.000,00 a R$ 5.600,00 / mês por edit violado no MCBS (2PN2111, 2PN2113, 2PN2117, 2PN2118)",
    },
    {
      id: "cf-4",
      label: "Multa Seller Proibido / URL",
      value: "1ª Violação: R$ 65.000 • 2ª: R$ 160.000 • 3ª+: R$ 320.000 por URL identificada (Visa BL 5Z9965656)",
    },
  ],
};

export const MARKETPLACE_MASTER_TEMPLATE: DocumentTemplate = {
  id: "dossie_marketplace_2026",
  name: "🛒 Dossiê Mestre: Regras para Marketplaces & Subcredenciadores (Negócios, Técnica, Regulação, Custos & Multas)",
  description:
    "Guia executivo completo (360º) sobre Marketplaces e PayFacs no Brasil: modelos de negócio, Bacen/CIP/Registradoras, mensageria ISO 8583/Base II/IPM, split, tarifas em R$ e multas.",
  category: "Pagamentos",
  defaultTitle: "Dossiê Mestre — Regras de Marketplace & Subcredenciadores (Negócios, Técnica, Regulação, Custos e Penalidades)",
  content: `<h1>DOSSIÊ MESTRE: REGRAS PARA MARKETPLACES & SUBCREDENCIADORES (PAYFACS) NO BRASIL</h1>
<p style="color:#64748b; font-size:0.95rem; margin-top:-0.5rem; margin-bottom:1.25rem;">
  <strong>Compêndio Executivo 360º:</strong> Estratégia de Negócios • Regulamentação Bacen/CIP/Registradoras • Engenharia de Mensageria (ISO 8583 / Base II / IPM / Elo 26.2) • Custos Oficiais em R$ • Programas de Monitoria & Penalidades
</p>
<hr/>

<!-- PAINEL EXECUTIVO DE ABERTURA -->
<div style="background:#0f2c59; color:#ffffff; border-radius:14px; padding:22px 24px; margin:1.5rem 0; font-family:system-ui, -apple-system, sans-serif; box-shadow:0 10px 25px rgba(15,44,89,0.18);">
  <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:16px; border-bottom:1px solid rgba(255,255,255,0.15); padding-bottom:14px; margin-bottom:16px;">
    <div>
      <span style="background:#2563eb; color:#ffffff; font-size:10px; font-weight:800; padding:3px 9px; border-radius:4px; text-transform:uppercase; letter-spacing:0.6px;">
        Manual de Arquitetura, Compliance & Finanças • Edição 2026
      </span>
      <h3 style="margin:8px 0 4px 0; font-size:19px; font-weight:800; color:#ffffff;">
        Ecossistema de Marketplaces, Plataformas Multi-Seller e Facilitadores de Pagamento
      </h3>
      <span style="font-size:12px; color:#93c5fd;">
        Fontes Rastreáveis: Resolução BCB nº 150/2021 e nº 264/2022 • Visa Core Rules & Fee Schedule BR 2026 • Mastercard Rules Cap. 7 & MCBS Ed. 13.2 • Elo Release 26.2
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
      <span style="color:#cbd5e1; font-size:11px; display:block;">R$ 18.135 ini / R$ 9.067 ren (MC)</span>
    </div>
    <div style="background:rgba(255,255,255,0.07); padding:10px 12px; border-radius:8px; border:1px solid rgba(255,255,255,0.1);">
      <span style="color:#93c5fd; font-size:10px; text-transform:uppercase; font-weight:bold; display:block;">Teto Seller s/ Contrato Direto</span>
      <span style="font-size:14px; font-weight:800; color:#ffffff;">&le; 10% do TPV</span>
      <span style="color:#cbd5e1; font-size:11px; display:block;">ou máx. USD 10 Milhões / ano</span>
    </div>
    <div style="background:rgba(255,255,255,0.07); padding:10px 12px; border-radius:8px; border:1px solid rgba(255,255,255,0.1);">
      <span style="color:#93c5fd; font-size:10px; text-transform:uppercase; font-weight:bold; display:block;">Multa Erro DE 42 / 43 / 48</span>
      <span style="font-size:14px; font-weight:800; color:#fbbf24;">R$ 5.000–5.600/mês</span>
      <span style="color:#cbd5e1; font-size:11px; display:block;">MCBS Data Integrity (2PN2111–2125)</span>
    </div>
    <div style="background:rgba(255,255,255,0.07); padding:10px 12px; border-radius:8px; border:1px solid rgba(255,255,255,0.1);">
      <span style="color:#93c5fd; font-size:10px; text-transform:uppercase; font-weight:bold; display:block;">Multa Seller / URL Ilegal</span>
      <span style="font-size:14px; font-weight:800; color:#f87171;">R$ 65k a R$ 320k</span>
      <span style="color:#cbd5e1; font-size:11px; display:block;">Por URL violadora (BL 5Z9965656)</span>
    </div>
  </div>
</div>

<!-- =====================================================================
     SEÇÃO 1: MODELOS DE NEGÓCIO & ENQUADRAMENTO NAS BANDEIRAS
     ===================================================================== -->
<h2>1. Visão de Negócios: Marketplace Qualificado vs. Subcredenciador (PayFac) vs. Gateway</h2>
<p>
  O primeiro erro estratégico de muitas operações digitais é tratar todo "split de pagamentos entre lojistas" como se fosse a mesma figura jurídica e operacional. Tanto para o <strong>Banco Central do Brasil (Bacen)</strong> quanto para os regulamentos globais das bandeiras (<strong>Visa Core Rules</strong>, <strong>Mastercard Rules</strong> e <strong>Regulamento Elo</strong>), existem <strong>quatro figuras distintas</strong>, cada uma com direitos de precificação, exigências de mensageria e obrigações de liquidação completamente diferentes:
</p>

<table style="width:100%; border-collapse:collapse; margin:1.5rem 0; font-size:12.5px; border:1px solid #cbd5e1; border-radius:10px; overflow:hidden;">
  <thead>
    <tr style="background:#0f2c59; color:#ffffff;">
      <th style="padding:10px 12px; text-align:left; width:18%;">Modelo Operacional</th>
      <th style="padding:10px 12px; text-align:left; width:26%;">Definição & Experiência de Compra</th>
      <th style="padding:10px 12px; text-align:left; width:20%;">Quem Aparece na Fatura (DE 43) e MCC</th>
      <th style="padding:10px 12px; text-align:left; width:18%;">Fluxo Financeiro (Liquidação)</th>
      <th style="padding:10px 12px; text-align:left; width:18%;">Risco de Chargeback & Fraude</th>
    </tr>
  </thead>
  <tbody>
    <tr style="background:#ffffff; border-bottom:1px solid #e2e8f0;">
      <td style="padding:10px 12px; font-weight:bold; color:#1e40af;">1. Marketplace Qualificado<br/><span style="font-size:11px; font-weight:normal; color:#64748b;">(Qualifying Marketplace)</span></td>
      <td style="padding:10px 12px; color:#1e293b;">Plataforma digital única (app/site) que reúne múltiplos <em>sellers</em> (3P), controla o carrinho unificado, checkout, políticas de entrega, devolução e atendimento ao consumidor.</td>
      <td style="padding:10px 12px; color:#1e293b;">Marca do <strong>Marketplace</strong> em destaque no <code>DE 43</code>. Pode operar com <strong>MCC 5262</strong> (Marketplaces Online) ou MCC da categoria principal mediante registro de <strong>MVV / Marketplace ID</strong>.</td>
      <td style="padding:10px 12px; color:#1e293b;">Recebe da credenciadora ou liquida via split para os sellers descontando comissão mercantil (<em>Take Rate</em> + MDR).</td>
      <td style="padding:10px 12px; color:#dc2626; font-weight:600;">100% do Marketplace perante a Bandeira e o Portador.</td>
    </tr>
    <tr style="background:#f8fafc; border-bottom:1px solid #e2e8f0;">
      <td style="padding:10px 12px; font-weight:bold; color:#7e22ce;">2. Subcredenciador / PayFac<br/><span style="font-size:11px; font-weight:normal; color:#64748b;">(Payment Facilitator — PF)</span></td>
      <td style="padding:10px 12px; color:#1e293b;">Instituição participante do arranjo que habilita sublojistas (<em>submerchants</em>) independentes (cada um com seu próprio site, loja física ou link) para aceitar cartões sob o contrato mestre com um Adquirente.</td>
      <td style="padding:10px 12px; color:#1e293b;">Formato obrigatório <code>PF*NOME_SELLER</code> no <code>DE 43</code>. <strong>Proibido usar MCC único:</strong> cada submerchant deve trafegar seu próprio MCC real e <code>DE 42</code> exclusivo.</td>
      <td style="padding:10px 12px; color:#1e293b;">Liquidação <strong>obrigatória na Grade Centralizada (CIP / SLC)</strong> e registro de agendas em Registradora (CERC/TAG/B3/Nuclea).</td>
      <td style="padding:10px 12px; color:#dc2626; font-weight:600;">Solidário entre Subcredenciador e Adquirente Patrocinador.</td>
    </tr>
    <tr style="background:#ffffff; border-bottom:1px solid #e2e8f0;">
      <td style="padding:10px 12px; font-weight:bold; color:#047857;">3. Varejista 1P / Merchant of Record<br/><span style="font-size:11px; font-weight:normal; color:#64748b;">(Estabelecimento Direto)</span></td>
      <td style="padding:10px 12px; color:#1e293b;">A plataforma compra e revende a mercadoria em nome próprio (emite NF-e integral da venda ao comprador final). Não há intermediação de terceiros na transação de cartão.</td>
      <td style="padding:10px 12px; color:#1e293b;">Nome do Varejista no <code>DE 43</code> e MCC do seu CNAE principal. Não utiliza campos de PF ID nem Submerchant Data.</td>
      <td style="padding:10px 12px; color:#1e293b;">Liquidação direta Credenciadora &rarr; Conta Domicílio do Varejista. Pagamento a fornecedores ocorre fora do arranjo (contas a pagar).</td>
      <td style="padding:10px 12px; color:#1e293b;">100% do Estabelecimento Comercial (EC).</td>
    </tr>
    <tr style="background:#f8fafc;">
      <td style="padding:10px 12px; font-weight:bold; color:#475569;">4. Gateway / Orquestrador Técnico<br/><span style="font-size:11px; font-weight:normal; color:#64748b;">(PSP Técnico / TPS / ESO)</span></td>
      <td style="padding:10px 12px; color:#1e293b;">Provedor puramente tecnológico que roteia a transação usando o código de estabelecimento (MID) que cada seller contratou diretamente com a Adquirente.</td>
      <td style="padding:10px 12px; color:#1e293b;">Nome do Seller direto no <code>DE 43</code>. O Gateway é registrado apenas como <strong>TPS / ESO / DSE</strong> (sem PF ID financeiro).</td>
      <td style="padding:10px 12px; color:#1e293b;"><strong>Não toca no dinheiro.</strong> A Adquirente liquida direto na conta de cada Seller.</td>
      <td style="padding:10px 12px; color:#1e293b;">Do Seller direto (com responsabilidade técnica PCI-DSS do Gateway).</td>
    </tr>
  </tbody>
</table>

<h3>1.1. Os 6 Critérios Obrigatórios para Enquadramento como "Marketplace Qualificado" (Visa & Mastercard)</h3>
<p>
  Para que uma plataforma possa operar sob as regras especiais de <strong>Marketplace</strong> (utilizando o <strong>MCC 5262</strong>, realizando captura única para carrinhos com múltiplos vendedores e exibindo sua própria marca no descritor), as bandeiras exigem o cumprimento cumulativo de <strong>6 requisitos mandatórios</strong>:
</p>
<ol>
  <li><strong>Interface e Checkout Unificados:</strong> Todos os produtos ou serviços de terceiros (<em>sellers</em>/<em>retailers</em>) devem ser exibidos em um site ou aplicativo operado sob a marca do Marketplace, com fluxo de checkout e pagamento integralmente controlados pelo Marketplace.</li>
  <li><strong>Transparência Contratual e Atendimento ao Portador:</strong> O nome do Marketplace deve estar visível de forma proeminente antes, durante e após a compra, e o Marketplace deve atuar como ponto central de suporte ao consumidor para cancelamentos, devoluções e entregas.</li>
  <li><strong>Responsabilidade Financeira Primária (Liability):</strong> O Marketplace assume responsabilidade financeira total e irrevogável por <strong>100% dos Chargebacks (Disputas)</strong>, <strong>Reembolsos (Refunds)</strong> e <strong>Multas de Conformidade</strong> gerados por qualquer <em>seller</em> hospedado em sua plataforma, sendo proibido transferir ao portador o ônus de cobrar diretamente um <em>seller</em> inadimplente.</li>
  <li><strong>Liquidação Exclusiva via Marketplace ou Adquirente Patrocinador:</strong> O pagamento das vendas aos <em>sellers</em> deve ser realizado exclusivamente pelo Marketplace (ou pelo Adquirente em nome do Marketplace), sendo vedado o repasse de fundos para terceiros não cadastrados como o <em>seller</em> real da mercadoria.</li>
  <li><strong>Registro Formal na Bandeira (MVV / Marketplace ID):</strong> O Adquirente deve registrar formalmente o Marketplace junto à Visa (recebendo um <strong>MVV — Merchant Verification Value</strong> ou <strong>Marketplace ID</strong>) e à Mastercard (registro de <strong>Marketplace / Payment Facilitator</strong>).</li>
  <li><strong>Teto Comercial por Seller (High-Volume Submerchant Threshold):</strong> Um único <em>seller</em> (ou grupo econômico de <em>sellers</em>) <strong>não pode representar mais de 10% do volume anual (TPV) do Marketplace</strong> nem ultrapassar o limite de <strong>USD 10.000.000,00 (dez milhões de dólares) anuais</strong> sem possuir um contrato de credenciamento direto tripartite (<em>Direct Merchant Agreement</em>) com o Adquirente patrocinador.</li>
</ol>

<h3>1.2. Unit Economics do Marketplace: Take Rate Comercial vs. MDR Financeiro e Reforma Tributária</h3>
<div style="background:#f0fdf4; border:1px solid #bbf7d0; border-left:5px solid #16a34a; border-radius:12px; padding:16px 20px; margin:1.25rem 0;">
  <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px; color:#15803d; font-weight:bold; font-size:0.95rem;">
    <span>📈</span>
    <span>EQUAÇÃO FINANCEIRA DO MARKETPLACE (TAKE RATE + SPREAD DE PAGAMENTOS)</span>
  </div>
  <p style="margin:0 0 8px 0; color:#1e293b; font-size:0.9rem; line-height:1.6;">
    Em negócios de Marketplace e Subcredenciamento, a margem bruta da plataforma é composta por três motores financeiros independentes:
  </p>
  <p style="margin:0; font-family:monospace; background:#ffffff; border:1px solid #86efac; padding:10px 14px; border-radius:8px; color:#065f46; font-size:0.85rem;">
    Receita Líquida Plataforma = [Take Rate Comercial (%) &times; GMV] + [(MDR Cobrado do Seller &minus; Intercâmbio &minus; Scheme Fees &minus; Custo Adquirente) &times; TPV] + [Spread de Antecipação de Recebíveis (RAV) em D+1 / D+2]
  </p>
</div>
<ul>
  <li><strong>Segregação Contábil para Evitar Bitributação (PIS/COFINS/ISS e Split Payment IBS/CBS):</strong> O Marketplace nunca deve reconhecer como receita própria o valor bruto da mercadoria pertencente ao <em>seller</em> (GMV). Na contabilidade e no fluxo de liquidação, o valor pertencente ao <em>seller</em> deve transitar em rubrica patrimonial transitória (<em>Valores a Repassar a Terceiros</em>), tributando-se exclusivamente a comissão de intermediação (<em>Take Rate</em>) e a receita financeira/MDR retida.</li>
  <li><strong>Vínculo com o Documento Fiscal na Mensageria:</strong> Na autorização e no clearing com split, a identificação correta do <code>CNPJ/CPF</code> de cada <em>seller</em> respalda perante a Receita Federal (Declaração de Operações Liquidadas com Moeda Eletrônica — <strong>DIMP</strong>) que a receita comercial pertence ao vendedor final e não ao intermediador.</li>
</ul>

<!-- =====================================================================
     SEÇÃO 2: REGULAMENTAÇÃO BRASILEIRA (BACEN, CIP/SLC & REGISTRADORAS)
     ===================================================================== -->
<h2>2. Regulamentação Brasileira: Banco Central (BCB 150), CIP/SLC e Registradoras (BCB 264)</h2>
<p>
  O Brasil possui o arcabouço regulatório mais rigoroso do mundo para intermediadores e subcredenciadores de pagamento. Operar um Marketplace com split próprio sem observar as normas do <strong>Banco Central do Brasil (Bacen)</strong> e do <strong>Conselho Monetário Nacional (CMN)</strong> expõe a empresa e seus administradores a processos administrativos sancionadores, bloqueio de liquidação e passivos milionários de dupla liquidação de recebíveis.
</p>

<table style="width:100%; border-collapse:collapse; margin:1.5rem 0; font-size:12.5px; border:1px solid #cbd5e1; border-radius:10px; overflow:hidden;">
  <thead>
    <tr style="background:#1e293b; color:#ffffff;">
      <th style="padding:10px 12px; text-align:left; width:22%;">Norma Regulatória</th>
      <th style="padding:10px 12px; text-align:left; width:24%;">Escopo & Regra Obrigatória</th>
      <th style="padding:10px 12px; text-align:left; width:30%;">Impacto Prático no Marketplace / Subcredenciador</th>
      <th style="padding:10px 12px; text-align:left; width:24%;">Consequência do Descumprimento</th>
    </tr>
  </thead>
  <tbody>
    <tr style="background:#ffffff; border-bottom:1px solid #e2e8f0;">
      <td style="padding:10px 12px; font-weight:bold; color:#0f2c59;">Resolução BCB nº 150/2021<br/><span style="font-size:11px; color:#64748b;">(Antiga Circular 3.682/2013)</span></td>
      <td style="padding:10px 12px; color:#1e293b;">Regulamenta os Arranjos de Pagamento e define formalmente a figura do <strong>Subcredenciador</strong> como participante que habilita usuários finais recebedores para aceitação de instrumento de pagamento.</td>
      <td style="padding:10px 12px; color:#1e293b;">Obriga o Subcredenciador a aderir formalmente às regras de cada arranjo (Visa, Mastercard, Elo), submeter-se aos controles de risco da Credenciadora e segregar recursos de terceiros (proibição de usar saldo de sellers para capital de giro próprio).</td>
      <td style="padding:10px 12px; color:#dc2626; font-weight:600;">Descredenciamento compulsório pela Bandeira/Adquirente e sanção do Bacen por atuação irregular no SPB.</td>
    </tr>
    <tr style="background:#f8fafc; border-bottom:1px solid #e2e8f0;">
      <td style="padding:10px 12px; font-weight:bold; color:#0f2c59;">Liquidação Centralizada CIP / Nuclea (SLC)<br/><span style="font-size:11px; color:#64748b;">(Grade Centralizada do SPB)</span></td>
      <td style="padding:10px 12px; color:#1e293b;">Todo Subcredenciador que participa do fluxo financeiro de liquidação deve liquidar as obrigações aos sublojistas na <strong>Câmara Interbancária de Pagamentos (SLC/CIP)</strong> via arquivos <code>ASLC029</code> (Crédito), <code>ASLC031</code> (Débito) e <code>ASLC033</code> (Antecipação).</td>
      <td style="padding:10px 12px; color:#1e293b;">
        <strong>A Grande Distinção Jurídica:</strong><br/>
        &bull; <strong>Subcredenciador Financeiro:</strong> Obrigado a liquidar na CIP/SLC.<br/>
        &bull; <strong>Marketplace de Comércio Eletrônico Puro:</strong> Quando todos os sellers vendem exclusivamente dentro do ambiente digital do Marketplace, pode operar via split direto na Adquirente (onde a própria Adquirente liquida para cada seller na CIP) ou sob mandato mercantil específico, evitando o custo de conexão direta à CIP.
      </td>
      <td style="padding:10px 12px; color:#dc2626; font-weight:600;">Multa diária de câmara de liquidação, rejeição de grades bancárias e bloqueio operacional pela Credenciadora.</td>
    </tr>
    <tr style="background:#ffffff; border-bottom:1px solid #e2e8f0;">
      <td style="padding:10px 12px; font-weight:bold; color:#0f2c59;">Resolução CMN nº 4.734 &amp; Resolução BCB nº 264/2022<br/><span style="font-size:11px; color:#64748b;">(Registradoras de Recebíveis: CERC, TAG, B3, Nuclea)</span></td>
      <td style="padding:10px 12px; color:#1e293b;">Obriga o registro diário das <strong>Unidades de Recebíveis (URs)</strong> de cada <em>seller/submerchant</em> (identificadas por <code>CNPJ/CPF + Bandeira + Subcredenciador + Data</code>) e o cumprimento estrito dos contratos de <strong>Gravame (Garantia)</strong> e <strong>Cessão (Troca de Titularidade)</strong>.</td>
      <td style="padding:10px 12px; color:#1e293b;">Antes de pagar qualquer <em>seller</em> ou antecipar valores no split, o motor financeiro do Marketplace/Subcredenciador deve consumir o arquivo de <strong>Domicílio de Liquidação</strong> da Registradora. Se o <em>seller</em> cedeu sua agenda a um banco externo, o pagamento deve ir para a conta indicada pela Registradora.</td>
      <td style="padding:10px 12px; color:#dc2626; font-weight:600;"><strong>Risco de Dupla Liquidação (Pagar 2x):</strong> quem paga ao seller ignorando uma trava de gravame ativa na registradora é obrigado a indenizar integralmente a instituição financeira credora.</td>
    </tr>
    <tr style="background:#f8fafc;">
      <td style="padding:10px 12px; font-weight:bold; color:#0f2c59;">Teto Regulatório de Intercâmbio (Cap Bacen)<br/><span style="font-size:11px; color:#64748b;">(Res. BCB nº 150 / BCB nº 246)</span></td>
      <td style="padding:10px 12px; color:#1e293b;">Limita a Tarifa de Intercâmbio (TIC) doméstica a no máximo <strong>0,50%</strong> nas transações de <strong>Débito</strong> e <strong>0,70%</strong> nas transações de <strong>Cartão Pré-Pago</strong>.</td>
      <td style="padding:10px 12px; color:#1e293b;">Em contratos do tipo <em>Interchange++</em> (Custo de Intercâmbio + Taxa de Bandeira + Spread do Adquirente), o Marketplace deve auditar os arquivos <code>VSS-120/130</code> e <code>IP755020-AA</code> para garantir que cartões pré-pagos e débito não sejam tarifados como crédito (1,50%–2,10%).</td>
      <td style="padding:10px 12px; color:#d97706; font-weight:600;">Erosão oculta de margem de <strong>80 a 140 bps</strong> sobre todo o volume de pré-pago/débito da plataforma.</td>
    </tr>
  </tbody>
</table>

<!-- =====================================================================
     SEÇÃO 3: ENGENHARIA TÉCNICA DE MENSAGERIA (ISO 8583, BASE II, IPM & ELO)
     ===================================================================== -->
<h2>3. Engenharia Técnica: Fluxo de Dados, Split de Captura e Campos Obrigatórios (ISO 8583 / Clearing)</h2>
<p>
  Na camada técnica de engenharia, toda transação de Marketplace ou Subcredenciador atravessa duas fases críticas: a <strong>Autorização Online em Tempo Real (ISO 8583 — 0100/0110)</strong> e a <strong>Apresentação Financeira / Clearing em Lote (Visa Base II TC 05, Mastercard IPM MTI 1240 e Elo Arquivo de Liquidação 26.2)</strong>. A rastreabilidade de <em>quem envia</em> e <em>quem recebe</em> cada byte determina tanto a taxa de aprovação quanto a isenção de multas.
</p>

<h3>3.1. Mapa de Atores e Fluxo de Dados vs. Fluxo Financeiro</h3>
<div data-layout="dual-cards" class="dual-cards-grid" style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin:1.25rem 0; font-family:system-ui, -apple-system, sans-serif;">
  <div style="background:#eff6ff; border:1px solid #bfdbfe; border-left:5px solid #2563eb; border-radius:12px; padding:16px;">
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
      <strong style="color:#1e40af; font-size:13.5px; text-transform:uppercase;">📡 Fluxo Técnico de Mensageria (Ida e Volta)</strong>
      <span style="background:#2563eb; color:#ffffff; font-size:10px; font-weight:bold; padding:2px 8px; border-radius:99px;">ISO 8583 &amp; Clearing</span>
    </div>
    <ol style="margin:0; padding-left:18px; font-size:12px; color:#1e293b; line-height:1.65;">
      <li><strong>Checkout do Marketplace / Subcredenciador:</strong> Captura PAN ou Network Token, monta o payload do carrinho, define o <code>Submerchant ID</code>, o <code>MCC</code>, o <code>CNPJ/CPF</code> do seller e o descritor dinâmico <code>DE 43</code>.</li>
      <li><strong>Adquirente / Credenciadora:</strong> Valida se o <code>PF ID</code> / <code>MVV</code> está ativo, injeta os subcampos proprietários no <code>DE 48</code> / <code>DE 62</code> / <code>DE 104</code> e transmite à Bandeira.</li>
      <li><strong>Bandeira (VisaNet / Banknet / Elo):</strong> Executa os edits de integridade em tempo real e no clearing (ex.: <em>Edit 30</em>, <em>Data Integrity</em>, validação de <em>PF ID</em>), calcula o Intercâmbio (<code>IRD</code> / <code>FPI</code> / <code>IRQ</code>) e roteia ao Emissor.</li>
      <li><strong>Banco Emissor:</strong> Avalia o score de fraude combinando <code>PF ID + Submerchant ID + 3DS/DAF</code>, retorna <code>DE 39</code> no <code>0110</code> e imprime o <code>DE 43</code> na fatura do portador.</li>
    </ol>
  </div>

  <div style="background:#faf5ff; border:1px solid #e9d5ff; border-left:5px solid #9333ea; border-radius:12px; padding:16px;">
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
      <strong style="color:#6b21a8; font-size:13.5px; text-transform:uppercase;">💰 Fluxo Financeiro &amp; Liquidação do Split</strong>
      <span style="background:#9333ea; color:#ffffff; font-size:10px; font-weight:bold; padding:2px 8px; border-radius:99px;">VSS / MCBS / SLC</span>
    </div>
    <ol style="margin:0; padding-left:18px; font-size:12px; color:#1e293b; line-height:1.65;">
      <li><strong>Emissor &rarr; Bandeira &rarr; Adquirente:</strong> O Emissor transfere o valor da compra já descontado da <strong>Tarifa de Intercâmbio</strong>.</li>
      <li><strong>Bandeira &larr; Adquirente/Emissor:</strong> A Bandeira debita mensalmente as <strong>Scheme Fees</strong> no <code>VSS-140 / VOIP</code> e na fatura <code>MCBS</code>.</li>
      <li><strong>Adquirente &rarr; Marketplace / Sellers:</strong> Na arquitetura de <em>Split na Adquirente</em>, a própria Adquirente já divide a liquidação na CIP/SLC entre a conta do Marketplace (comissão) e as URs de cada Seller.</li>
      <li><strong>Subcredenciador &rarr; CIP/SLC &rarr; Sellers:</strong> Na arquitetura de <em>Subcredenciador</em>, o PayFac recebe da Adquirente, registra as URs na Registradora (BCB 264) e envia a grade <code>ASLC029/031</code> para liquidar aos Sellers respeitando eventuais travas de gravame.</li>
    </ol>
  </div>
</div>

<h3>3.2. Arquitetura Técnica do Split em Carrinho Multi-Seller: Captura Única vs. Múltiplas Capturas Parciais</h3>
<p>
  Quando um consumidor compra em um único carrinho de <strong>R$ 300,00</strong> contendo itens de <strong>3 Sellers diferentes</strong> (Seller A = R$ 100, Seller B = R$ 120, Seller C = R$ 80), a engenharia de pagamentos precisa escolher entre dois padrões arquiteturais de mensageria:
</p>

<table style="width:100%; border-collapse:collapse; margin:1.25rem 0; font-size:12.5px; border:1px solid #cbd5e1; border-radius:10px; overflow:hidden;">
  <thead>
    <tr style="background:#0f2c59; color:#ffffff;">
      <th style="padding:10px 12px; text-align:left; width:22%;">Padrão de Engenharia</th>
      <th style="padding:10px 12px; text-align:left; width:28%;">Comportamento na Autorização (0100) e Clearing (TC 05 / IPM 1240)</th>
      <th style="padding:10px 12px; text-align:left; width:25%;">Quem Pode Usar &amp; Requisitos</th>
      <th style="padding:10px 12px; text-align:left; width:25%;">Impacto em Custos de Bandeira &amp; Conciliação</th>
    </tr>
  </thead>
  <tbody>
    <tr style="background:#ffffff; border-bottom:1px solid #e2e8f0;">
      <td style="padding:10px 12px; font-weight:bold; color:#047857;">Padrão A: Autorização Única + Clearing Único + Split via Ledger/UR<br/><span style="font-size:11px; font-weight:normal; color:#64748b;">(Recomendado para Marketplace Qualificado)</span></td>
      <td style="padding:10px 12px; color:#1e293b;">Envia <strong>1 mensagem 0100</strong> de R$ 300,00 e <strong>1 registro de clearing</strong> de R$ 300,00 sob o <code>MCC 5262</code> e o <code>MVV/Marketplace ID</code> da plataforma. O motor de split divide o valor na agenda financeira interna/Adquirente em 3 recebíveis (R$ 100, R$ 120 e R$ 80).</td>
      <td style="padding:10px 12px; color:#1e293b;">Exclusivo para <strong>Marketplaces Qualificados</strong> registrados nas bandeiras (onde o checkout e a entrega são geridos pela plataforma).</td>
      <td style="padding:10px 12px; color:#047857; font-weight:600;">&bull; Paga apenas <strong>1 tarifa fixa por item</strong> na bandeira.<br/>&bull; Mantém o ticket cheio (R$ 300 &approx; USD 55), caindo na faixa <code>&gt;$50</code> do Visa VSS 2026.<br/>&bull; O portador vê 1 único lançamento de R$ 300 na fatura.</td>
    </tr>
    <tr style="background:#f8fafc;">
      <td style="padding:10px 12px; font-weight:bold; color:#1e40af;">Padrão B: 1 Pré-Autorização + <em>N</em> Capturas Parciais de Clearing<br/><span style="font-size:11px; font-weight:normal; color:#64748b;">(Multiple Partial Captures por Seller)</span></td>
      <td style="padding:10px 12px; color:#1e293b;">Envia <strong>1 pré-autorização (0100)</strong> de R$ 300,00 (com indicador de <em>Partial Shipment / Multiple Clearing</em>) e submete <strong>3 registros distintos de clearing</strong> (R$ 100, R$ 120 e R$ 80), cada um com o <code>DE 42 (Submerchant ID)</code>, <code>MCC</code>, <code>DE 43 (PF*Seller)</code> e <code>CNPJ</code> individual de cada seller, vinculados pelo mesmo <code>Trace ID / Lifecycle ID (DE 62.2 / PDS 0158)</code>.</td>
      <td style="padding:10px 12px; color:#1e293b;">Obrigatório quando os sellers possuem <strong>MCCs diferentes</strong> sob um Subcredenciador (PayFac) ou quando os itens são faturados e despachados separadamente por cada seller.</td>
      <td style="padding:10px 12px; color:#d97706; font-weight:600;">&bull; Multiplica por <strong>3x as tarifas por item de clearing</strong> (Base II / IPM).<br/>&bull; Reduz o ticket médio de cada captura, alterando a faixa do novo <strong>Visa VSS 2026 (De-Para 1&rarr;20)</strong>.<br/>&bull; Exige preenchimento perfeito de <em>Multiple Clearing Sequence Number</em> para não tomar multa de <em>Misuse of Auth</em>.</td>
    </tr>
  </tbody>
</table>

<h3>3.3. Dicionário Técnico Byte-a-Byte de Campos Obrigatórios (Mastercard, Visa e Elo)</h3>
<p>
  A tabela abaixo consolida todos os elementos de dados (<code>DE</code>), subelementos (<code>SE / PDS</code>) e posições de registros de clearing extraídos da nossa base técnica oficial (<code>manuais_tecnicos.db</code> e guias 2026) que um Marketplace ou Subcredenciador deve implementar:
</p>

<table style="width:100%; border-collapse:collapse; margin:1.25rem 0; font-size:12px; border:1px solid #cbd5e1; border-radius:10px; overflow:hidden;">
  <thead>
    <tr style="background:#0f2c59; color:#ffffff;">
      <th style="padding:9px 10px; text-align:left; width:11%;">Bandeira</th>
      <th style="padding:9px 10px; text-align:left; width:18%;">Campo / Registro &amp; Posição</th>
      <th style="padding:9px 10px; text-align:left; width:14%;">Formato &amp; Presença</th>
      <th style="padding:9px 10px; text-align:left; width:35%;">Regra de Preenchimento (Quem Envia &rarr; Quem Recebe)</th>
      <th style="padding:9px 10px; text-align:left; width:22%;">Auditoria &amp; Multa por Erro</th>
    </tr>
  </thead>
  <tbody>
    <tr style="background:#ffffff; border-bottom:1px solid #e2e8f0;">
      <td style="padding:9px 10px; font-weight:bold; color:#b45309;">Mastercard</td>
      <td style="padding:9px 10px; font-family:monospace; font-weight:bold; color:#0f172a;">DE 48 SE 37<br/>PDS 0208 (IPM)</td>
      <td style="padding:9px 10px; font-family:monospace;">n ...11<br/><span style="background:#dcfce7; color:#166534; padding:1px 6px; border-radius:4px; font-size:10px; font-weight:bold;">Obrigatório</span></td>
      <td style="padding:9px 10px; color:#1e293b;"><strong>Payment Facilitator ID (PF ID):</strong> Identificador numérico de até 11 dígitos atribuído pela Mastercard ao Subcredenciador ou Marketplace. Enviado pelo Adquirente no <code>0100</code> (SE 37 SF 1) e no clearing <code>IPM 1240</code> (PDS 0208).</td>
      <td style="padding:9px 10px; color:#dc2626; font-weight:600;"><code>MCBS 2PN2111</code>: <strong>R$ 5.600,00 / mês</strong> por DE 48 inválido ou ausente.</td>
    </tr>
    <tr style="background:#f8fafc; border-bottom:1px solid #e2e8f0;">
      <td style="padding:9px 10px; font-weight:bold; color:#b45309;">Mastercard</td>
      <td style="padding:9px 10px; font-family:monospace; font-weight:bold; color:#0f172a;">DE 48 SE 37<br/>PDS 0178 (Table 619)</td>
      <td style="padding:9px 10px; font-family:monospace;">ans ...201<br/>(Pos 1–3 e 4–201)<br/><span style="background:#dcfce7; color:#166534; padding:1px 6px; border-radius:4px; font-size:10px; font-weight:bold;">Obrigatório</span></td>
      <td style="padding:9px 10px; color:#1e293b;"><strong>Alternate Merchant / Submerchant Data:</strong> Carrega os dados cadastrais reais do seller no clearing IPM: <code>Submerchant ID</code>, Endereço comercial, Cidade, UF, CEP (Postal Code), País (<code>BRA</code>) e <code>CNPJ/CPF</code> do sublojista.</td>
      <td style="padding:9px 10px; color:#dc2626; font-weight:600;"><code>MCBS 2PN2104 / 2PN2119 / 2PN2121</code>: <strong>R$ 5.000 a R$ 5.600 / mês</strong> (CEP/Endereço inválido ou "UNKNOWN").</td>
    </tr>
    <tr style="background:#ffffff; border-bottom:1px solid #e2e8f0;">
      <td style="padding:9px 10px; font-weight:bold; color:#b45309;">Mastercard</td>
      <td style="padding:9px 10px; font-family:monospace; font-weight:bold; color:#0f172a;">DE 42<br/>(Pos 161 IP714010-AA)</td>
      <td style="padding:9px 10px; font-family:monospace;">ans 15<br/><span style="background:#dcfce7; color:#166534; padding:1px 6px; border-radius:4px; font-size:10px; font-weight:bold;">Obrigatório</span></td>
      <td style="padding:9px 10px; color:#1e293b;"><strong>Card Acceptor ID Code (Submerchant MID):</strong> Deve identificar <strong>univocamente cada sublojista</strong> (vedado usar o mesmo código genérico do PayFac para todos os sellers). Composição típica: código do PF + ID único do Seller.</td>
      <td style="padding:9px 10px; color:#dc2626; font-weight:600;"><code>MCBS 2PN2106 / 2PN2117</code>: <strong>R$ 5.600,00 / mês</strong> por DE 42 genérico ou em branco.</td>
    </tr>
    <tr style="background:#f8fafc; border-bottom:1px solid #e2e8f0;">
      <td style="padding:9px 10px; font-weight:bold; color:#1e40af;">Visa / MC / Elo</td>
      <td style="padding:9px 10px; font-family:monospace; font-weight:bold; color:#0f172a;">DE 43 (Auth)<br/>TC 05 TCR 0 Pos 92–116<br/>IPM Pos 176–272</td>
      <td style="padding:9px 10px; font-family:monospace;">ans 40 (Auth)<br/>ans 25 (Base II)<br/><span style="background:#dcfce7; color:#166534; padding:1px 6px; border-radius:4px; font-size:10px; font-weight:bold;">Obrigatório</span></td>
      <td style="padding:9px 10px; color:#1e293b;"><strong>Card Acceptor Name/Location (Soft Descriptor):</strong><br/>&bull; <strong>PayFac:</strong> <code>PREFIXO*NOME_SELLER</code> (3–12 chars prefixo + <code>*</code> + nome do sublojista até pos 22; Cidade pos 24–36; País pos 38–40).<br/>&bull; <strong>Marketplace:</strong> Nome da Plataforma + identificação do pedido/seller. Deve ser idêntico entre Auth e Clearing.</td>
      <td style="padding:9px 10px; color:#dc2626; font-weight:600;"><code>MCBS 2PN2113</code> (Auth: <strong>R$ 5.600/mês</strong>), <code>2PN2118</code> (Clearing: <strong>R$ 5.600/mês</strong>) e <code>2PN2120</code> (Divergência Auth&times;Clearing: <strong>R$ 5.000/mês</strong>).</td>
    </tr>
    <tr style="background:#ffffff; border-bottom:1px solid #e2e8f0;">
      <td style="padding:9px 10px; font-weight:bold; color:#1e40af;">Visa</td>
      <td style="padding:9px 10px; font-family:monospace; font-weight:bold; color:#0f172a;">DE 62.4 / DE 104<br/>TC 05 TCR 0, 1 e 5</td>
      <td style="padding:9px 10px; font-family:monospace;">an 10 (MVV)<br/>n 11 (PF ID)<br/>ans 15 (Sub-ID)<br/><span style="background:#dcfce7; color:#166534; padding:1px 6px; border-radius:4px; font-size:10px; font-weight:bold;">Obrigatório</span></td>
      <td style="padding:9px 10px; color:#1e293b;"><strong>MVV (Merchant Verification Value) + Payment Facilitator / Marketplace ID + Sub-Merchant ID &amp; Tax ID:</strong> Identifica o Marketplace Qualificado ou PayFac na VisaNet, junto com o <code>CNPJ/CPF</code> do seller no registro nacional (<em>Brazil National Settlement Draft Data</em>) e o <code>Foreign Retailer Indicator</code> para sellers internacionais.</td>
      <td style="padding:9px 10px; color:#dc2626; font-weight:600;">Downgrade imediato de tarifa de intercâmbio e multa de Third Party Agent não registrado (<code>BL 5Q6562026</code> / <code>5Z9965656</code>).</td>
    </tr>
    <tr style="background:#f8fafc;">
      <td style="padding:9px 10px; font-weight:bold; color:#047857;">Elo (26.2)</td>
      <td style="padding:9px 10px; font-family:monospace; font-weight:bold; color:#0f172a;">Registros 00, 01, 02 e Registro 45 (Pos 159–166)</td>
      <td style="padding:9px 10px; font-family:monospace;">1.000 bytes (Posicional)<br/>an 8 (IRQ)<br/><span style="background:#dcfce7; color:#166534; padding:1px 6px; border-radius:4px; font-size:10px; font-weight:bold;">Obrigatório</span></td>
      <td style="padding:9px 10px; color:#1e293b;"><strong>Identificação do Subcredenciador, CPF/CNPJ do Sublojista e IRQ:</strong> Na <strong>Release Elo 26.2</strong>, é obrigatória a segregação estrita entre Seller Pessoa Jurídica (<code>CNPJ 14 dígitos</code>) e Seller Pessoa Física (<code>CPF 11 dígitos</code>), vedando o uso de MCCs exclusivos de PJ para sublojistas PF. O <code>Registro 45</code> retorna o <strong>IRQ</strong> recalculado.</td>
      <td style="padding:9px 10px; color:#dc2626; font-weight:600;">Rejeição de lote de liquidação e reclassificação retroativa de intercâmbio no <code>Registro 45</code>.</td>
    </tr>
  </tbody>
</table>

<!-- =====================================================================
     SEÇÃO 4: MCC, INTERCÂMBIO E O IMPACTO DO SPLIT NO VISA VSS 2026
     ===================================================================== -->
<h2>4. Governança de MCC, Qualificação de Intercâmbio e o Custo Oculto do Split no VSS 2026</h2>

<h3>4.1. Regra do MCC 5262 (Marketplaces) vs. MCC Individual por Seller</h3>
<ul>
  <li><strong>Quando o MCC 5262 é permitido (e vantajoso):</strong> Apenas para <strong>Marketplaces Qualificados</strong> devidamente registrados na Visa e Mastercard. Permite que um carrinho contendo itens de vestuário (<code>5651</code>), eletrônicos (<code>5732</code>) e cosméticos (<code>5977</code>) de 3 sellers distintos seja autorizado e liquidado em uma <strong>única transação com MCC 5262</strong> (ou com o MCC da categoria predominante do Marketplace).</li>
  <li><strong>Quando o MCC individual por Seller é obrigatório:</strong> Para qualquer <strong>Subcredenciador / Payment Facilitator (PayFac)</strong> que fornece maquininha (POS), link de pagamento ou checkout transparente para lojistas independentes. Nesse modelo, usar um MCC genérico configura violação grave de integridade de dados (<code>MCBS 2PN2112 / 2PN2116 / 2PN2400 / 2PN2402</code> — multa mensal de <strong>R$ 5.000 a R$ 5.600</strong> mais cobrança retroativa da diferença de intercâmbio).</li>
  <li><strong>Proibição de Arbitragem de MCC (MCC Masking):</strong> Se um Subcredenciador cadastrar um <em>seller</em> de alto risco ou de intercâmbio cheio sob um MCC incentivado (como supermercados <code>5411</code>, educação <code>8299</code> ou utilidade pública <code>4900</code>), a bandeira aplica multa de <em>True Merchant / BRAM</em> e recalcula todo o intercâmbio retroativo.</li>
</ul>

<h3>4.2. Como o Split de Captura Impacta o Faturamento Visa VSS 2026 (De-Para 1&rarr;20 por Faixa de Ticket)</h3>
<p>
  Em 2026, a Visa reestruturou globalmente <strong>53 linhas clássicas de processamento (Base I, Base II e SMS)</strong>, explodindo cada linha em <strong>20 novas Billing Lines</strong> segmentadas por Canal (<code>CP</code> vs. <code>CNP</code>), Produto (<code>Debit/Prepaid</code> vs. <code>Credit</code>) e <strong>5 Faixas de Ticket Médio em USD</strong>:
</p>

<table style="width:100%; border-collapse:collapse; margin:1.25rem 0; font-size:12px; border:1px solid #cbd5e1; border-radius:10px; overflow:hidden;">
  <thead>
    <tr style="background:#1e3a8a; color:#ffffff;">
      <th style="padding:9px 12px; text-align:left;">Faixa de Ticket (USD)</th>
      <th style="padding:9px 12px; text-align:left;">Equivalente Aprox. (BRL @ 6,46)</th>
      <th style="padding:9px 12px; text-align:left;">Exemplo de Código Base II (CNP Crédito)</th>
      <th style="padding:9px 12px; text-align:left;">Linha Espelho de Desconto</th>
      <th style="padding:9px 12px; text-align:left;">Efeito do Split de Clearing por Seller</th>
    </tr>
  </thead>
  <tbody>
    <tr style="background:#ffffff; border-bottom:1px solid #e2e8f0;">
      <td style="padding:8px 12px; font-weight:bold; color:#0f2c59;">Faixa 1: $0.00 &ndash; $2.00</td>
      <td style="padding:8px 12px;">Até R$ 12,90</td>
      <td style="padding:8px 12px; font-family:monospace; color:#1e40af; font-weight:bold;">2E0150AA14</td>
      <td style="padding:8px 12px; font-family:monospace; color:#047857;">2E0150AA99</td>
      <td style="padding:8px 12px; color:#334155;">Micro-tickets e split de frete/comissão avulsa caem nesta faixa.</td>
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
      <td style="padding:8px 12px; color:#334155;">Ticket médio típico de e-commerce brasileiro em captura única.</td>
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

<div style="background:#fffbeb; border:1px solid #fde68a; border-left:5px solid #d97706; border-radius:12px; padding:14px 18px; margin:1.25rem 0;">
  <strong style="color:#b45309; font-size:13px;">⚠️ Regra de Ouro para Engenharia de Custos no Split:</strong>
  <p style="margin:4px 0 0 0; font-size:12.5px; color:#1e293b; line-height:1.6;">
    Sempre que o modelo regulatório e tributário permitir operar como <strong>Marketplace Qualificado com Captura Única no Base II/IPM</strong> (realizando o split apenas na camada de liquidação / URs das Registradoras e CIP), a plataforma economiza <strong>(N &minus; 1) tarifas fixas de clearing por carrinho</strong>, onde <em>N</em> é o número médio de sellers por pedido.
  </p>
</div>

<!-- =====================================================================
     SEÇÃO 5: ESTRUTURA COMPLETA DE CUSTOS E REGISTROS NO BRASIL (R$)
     ===================================================================== -->
<h2>5. Estrutura Oficial de Custos, Registros e Tarifas no Brasil (Preços Reais 2026 em R$)</h2>
<p>
  Todos os valores abaixo foram extraídos diretamente da base oficial do <strong>Visa Fee Schedule Brasil 2026 (<code>feeschedule.visaonline.com</code> — Perfil BRAZIL, LAT.AM.)</strong> e do <strong>Manual MCBS Brasil Ed. 13.2 da Mastercard</strong>. Na Visa Brasil, as faturas são emitidas no portal <strong>VOIP</strong> no <strong>4º dia útil</strong> com vencimento no <strong>10º dia útil</strong> em Reais (<code>R$</code>), sujeitas a reajuste anual pelo <strong>IPCA todo dia 1º de março</strong> e <em>gross-up</em> de impostos.
</p>

<table style="width:100%; border-collapse:collapse; margin:1.5rem 0; font-size:12px; border:1px solid #cbd5e1; border-radius:10px; overflow:hidden;">
  <thead>
    <tr style="background:#065f46; color:#ffffff;">
      <th style="padding:9px 10px; text-align:left; width:12%;">Bandeira</th>
      <th style="padding:9px 10px; text-align:left; width:16%;">Billing Line / Event ID</th>
      <th style="padding:9px 10px; text-align:left; width:28%;">Nome Oficial da Tarifa &amp; Escopo</th>
      <th style="padding:9px 10px; text-align:left; width:22%;">Valor Oficial no Brasil (R$ / USD)</th>
      <th style="padding:9px 10px; text-align:left; width:22%;">Periodicidade &amp; Quem Paga</th>
    </tr>
  </thead>
  <tbody>
    <tr style="background:#ffffff; border-bottom:1px solid #e2e8f0;">
      <td style="padding:8px 10px; font-weight:bold; color:#1e40af;">Visa</td>
      <td style="padding:8px 10px; font-family:monospace; font-weight:bold;">BL 5Q6562026<br/>BL 5Q6562028</td>
      <td style="padding:8px 10px; color:#0f172a;"><strong>Third Party Agent Registration &amp; Renewal (PF / HRIPF / ISO / SDWO / DCV):</strong> Registro inicial e renovação anual de Payment Facilitator, High-Risk Internet PF e ISO.</td>
      <td style="padding:8px 10px; font-weight:bold; color:#047857;">R$ 32.000,00<br/><span style="font-size:10.5px; color:#64748b; font-weight:normal;">(Histórico: USD 5,000)</span></td>
      <td style="padding:8px 10px; color:#334155;">No registro inicial + Anual (Por Agente/PayFac registrado pelo Adquirente).</td>
    </tr>
    <tr style="background:#f8fafc; border-bottom:1px solid #e2e8f0;">
      <td style="padding:8px 10px; font-weight:bold; color:#1e40af;">Visa</td>
      <td style="padding:8px 10px; font-family:monospace; font-weight:bold;">BL 5Q6562026<br/>BL 5Q6562029</td>
      <td style="padding:8px 10px; color:#0f172a;"><strong>Third Party Agent Registration (ESO / TPS):</strong> Registro inicial e renovação anual de Gateways, Cofres e Terceiros Tecnológicos.</td>
      <td style="padding:8px 10px; font-weight:bold; color:#047857;">R$ 6.500,00<br/><span style="font-size:10.5px; color:#64748b; font-weight:normal;">(Histórico: USD 1,000)</span></td>
      <td style="padding:8px 10px; color:#334155;">No registro inicial + Anual (Por ESO / TPS).</td>
    </tr>
    <tr style="background:#ffffff; border-bottom:1px solid #e2e8f0;">
      <td style="padding:8px 10px; font-weight:bold; color:#1e40af;">Visa</td>
      <td style="padding:8px 10px; font-family:monospace; font-weight:bold;">BL 5Q6562026</td>
      <td style="padding:8px 10px; color:#0f172a;"><strong>Third Party Agent Portfolio / BIN Transfer:</strong> Transferência de agente/PayFac resultante de venda de carteira ou migração de BIN entre dois adquirentes.</td>
      <td style="padding:8px 10px; font-weight:bold; color:#047857;">R$ 3.200,00<br/><span style="font-size:10.5px; color:#64748b; font-weight:normal;">(Isento em caso de fusão societária)</span></td>
      <td style="padding:8px 10px; color:#334155;">Por transferência (Cobrado do Adquirente recebedor).</td>
    </tr>
    <tr style="background:#f8fafc; border-bottom:1px solid #e2e8f0;">
      <td style="padding:8px 10px; font-weight:bold; color:#b45309;">Mastercard</td>
      <td style="padding:8px 10px; font-family:monospace; font-weight:bold;">MCBS 2SC1812<br/>MCBS 2SC1827</td>
      <td style="padding:8px 10px; color:#0f172a;"><strong>Global Member Service Provider (MSP / PayFac) Registration &amp; Renewal:</strong> Registro inicial e renovação anual de Subcredenciador / MSP Crédito.</td>
      <td style="padding:8px 10px; font-weight:bold; color:#047857;">Inicial: R$ 18.135,00<br/>Renovação: R$ 9.067,50</td>
      <td style="padding:8px 10px; color:#334155;">Inicial + Anual (Faturado ao Membro Principal / Adquirente).</td>
    </tr>
    <tr style="background:#ffffff; border-bottom:1px solid #e2e8f0;">
      <td style="padding:8px 10px; font-weight:bold; color:#b45309;">Mastercard</td>
      <td style="padding:8px 10px; font-family:monospace; font-weight:bold;">MCBS 2FL1892<br/>MCBS 2FL1897</td>
      <td style="padding:8px 10px; color:#0f172a;"><strong>MSP Debit / Maestro Registration &amp; Renewal:</strong> Registro inicial e renovação anual para suporte a programas de Débito/Maestro.</td>
      <td style="padding:8px 10px; font-weight:bold; color:#047857;">Inicial: R$ 9.068,00<br/>Renovação: R$ 5.441,00</td>
      <td style="padding:8px 10px; color:#334155;">Inicial + Anual (Membro Principal / Adquirente).</td>
    </tr>
    <tr style="background:#f8fafc; border-bottom:1px solid #e2e8f0;">
      <td style="padding:8px 10px; font-weight:bold; color:#b45309;">Mastercard</td>
      <td style="padding:8px 10px; font-family:monospace; font-weight:bold;">MCBS 2NB00011<br/>MCBS 2NB0016</td>
      <td style="padding:8px 10px; color:#0f172a;"><strong>MATCH™ (Member Alert to Control High-Risk Merchants):</strong> Base obrigatória para checagem de antecedentes de cada Seller antes do onboarding.</td>
      <td style="padding:8px 10px; font-weight:bold; color:#047857;">Fixo: R$ 3.200,00 / trim<br/>API: R$ 0,20 / consulta</td>
      <td style="padding:8px 10px; color:#334155;">Trimestral + Por consulta de Seller no onboarding (Adquirente/PayFac).</td>
    </tr>
    <tr style="background:#ffffff; border-bottom:1px solid #e2e8f0;">
      <td style="padding:8px 10px; font-weight:bold; color:#1e40af;">Visa</td>
      <td style="padding:8px 10px; font-family:monospace; font-weight:bold;">BL 5D0210234<br/>BL 5W2221009</td>
      <td style="padding:8px 10px; color:#0f172a;"><strong>Account Name Inquiry (ANI) &amp; Credential Update (OBO):</strong> Validação de titularidade de conta/cartão e atualização de credencial salva no cofre do Marketplace.</td>
      <td style="padding:8px 10px; font-weight:bold; color:#047857;">ANI: R$ 0,32 / consulta<br/>OBO: R$ 0,10 / update</td>
      <td style="padding:8px 10px; color:#334155;">Por evento de verificação de cartão no checkout/cofre.</td>
    </tr>
    <tr style="background:#f8fafc; border-bottom:1px solid #e2e8f0;">
      <td style="padding:8px 10px; font-weight:bold; color:#b45309;">Mastercard</td>
      <td style="padding:8px 10px; font-family:monospace; font-weight:bold;">MCBS 2SC6602</td>
      <td style="padding:8px 10px; color:#0f172a;"><strong>Automatic Billing Updater (ABU) Merchant Matches:</strong> Atualização automática de cartões vencidos/reemitidos no cofre do Marketplace (assianturas/1-click).</td>
      <td style="padding:8px 10px; font-weight:bold; color:#047857;">R$ 0,13 por match<br/><span style="font-size:10.5px; color:#64748b; font-weight:normal;">(Faixa 1 a 100.000 matches)</span></td>
      <td style="padding:8px 10px; color:#334155;">Mensal por cartão atualizado com sucesso.</td>
    </tr>
    <tr style="background:#ffffff;">
      <td style="padding:8px 10px; font-weight:bold; color:#1e40af;">Visa</td>
      <td style="padding:8px 10px; font-family:monospace; font-weight:bold;">BL 5W2200013<br/>BL 5W2221007</td>
      <td style="padding:8px 10px; color:#0f172a;"><strong>Visa Token Service (VTS) Direct Certification &amp; TLCM:</strong> Taxa única de certificação direta de Token Requestor (Ecomm &amp; COF) e assinatura mensal TLCM.</td>
      <td style="padding:8px 10px; font-weight:bold; color:#047857;">Cert. Ecomm: R$ 323.000<br/>TLCM: R$ 3.234 / mês<br/><span style="font-size:10.5px; color:#dc2626; font-weight:bold;">(05/2027 SDK &gt;$5B: R$ 5,168M/ano)</span></td>
      <td style="padding:8px 10px; color:#334155;">Opcional se consumir token via Adquirente; cobrado em conexão direta (Direct TR).</td>
    </tr>
  </tbody>
</table>

<!-- =====================================================================
     SEÇÃO 6: PENALIDADES, MULTAS DE INTEGRIDADE, DISPUTAS E MONITORIA
     ===================================================================== -->
<h2>6. Mapa Completo de Penalidades, Multas de Dados, Disputas e Programas de Monitoria</h2>
<p>
  O maior risco financeiro de um Marketplace ou Subcredenciador reside no fato de que <strong>as bandeiras monitoram os limites de fraude e chargeback em dois níveis simultâneos</strong>: (1) no nível individual de cada <em>Seller/Submerchant</em> e (2) no nível agregado do <em>Payment Facilitator / Marketplace ID</em>. Além disso, qualquer falha na formatação dos campos de sublojista aciona multas automáticas mensais.
</p>

<h3>6.1. Multas de Integridade de Mensageria (Mastercard Data Integrity Monitoring Program — MCBS)</h3>
<p>
  Auditadas mensalmente nos relatórios <code>IP714010-AA (Acquirer Accepted Errors Detail Report)</code> e <code>IP714010-BB</code>, cobradas diretamente na fatura MCBS do Adquirente e repassadas contratualmente ao Subcredenciador/Marketplace:
</p>

<table style="width:100%; border-collapse:collapse; margin:1.25rem 0; font-size:12px; border:1px solid #fecaca; border-radius:10px; overflow:hidden;">
  <thead>
    <tr style="background:#991b1b; color:#ffffff;">
      <th style="padding:9px 10px; text-align:left; width:15%;">Código MCBS</th>
      <th style="padding:9px 10px; text-align:left; width:28%;">Nome do Evento de Penalidade</th>
      <th style="padding:9px 10px; text-align:left; width:39%;">Causa-Raiz Técnica na Mensageria do Marketplace / PayFac</th>
      <th style="padding:9px 10px; text-align:left; width:18%;">Multa Mensal (R$)</th>
    </tr>
  </thead>
  <tbody>
    <tr style="background:#ffffff; border-bottom:1px solid #fee2e2;">
      <td style="padding:8px 10px; font-family:monospace; font-weight:bold; color:#991b1b;">2PN2111</td>
      <td style="padding:8px 10px; font-weight:bold; color:#0f172a;">Additional Data Field (DE 48) Invalid or Improper</td>
      <td style="padding:8px 10px; color:#334155;">Envio de <code>DE 48</code> com <code>PF ID (SE 37 / PDS 0208)</code> não registrado, mal formatado ou ausente em transação de Subcredenciador.</td>
      <td style="padding:8px 10px; font-weight:bold; color:#dc2626;">R$ 5.600,00 / mês</td>
    </tr>
    <tr style="background:#fef2f2; border-bottom:1px solid #fee2e2;">
      <td style="padding:8px 10px; font-family:monospace; font-weight:bold; color:#991b1b;">2PN2113<br/>2PN2118</td>
      <td style="padding:8px 10px; font-weight:bold; color:#0f172a;">Invalid DE 43 Card Acceptor Name/Location (Auth &amp; Clearing)</td>
      <td style="padding:8px 10px; color:#334155;">Descritor <code>DE 43</code> fora do padrão <code>PF*NOME_SELLER</code>, sem nome do seller, com caracteres inválidos ou cidade/país incorretos.</td>
      <td style="padding:8px 10px; font-weight:bold; color:#dc2626;">R$ 5.600,00 / mês<br/><span style="font-size:10px; font-weight:normal;">(por fase: Auth e Clearing)</span></td>
    </tr>
    <tr style="background:#ffffff; border-bottom:1px solid #fee2e2;">
      <td style="padding:8px 10px; font-family:monospace; font-weight:bold; color:#991b1b;">2PN2117<br/>2PN2106</td>
      <td style="padding:8px 10px; font-weight:bold; color:#0f172a;">Invalid Card Acceptor ID (DE 42 Not Unique)</td>
      <td style="padding:8px 10px; color:#334155;">Uso de um <code>DE 42 (Merchant ID)</code> único/genérico para múltiplos sublojistas, impedindo a identificação individual do Seller.</td>
      <td style="padding:8px 10px; font-weight:bold; color:#dc2626;">R$ 5.600,00 / mês</td>
    </tr>
    <tr style="background:#fef2f2; border-bottom:1px solid #fee2e2;">
      <td style="padding:8px 10px; font-family:monospace; font-weight:bold; color:#991b1b;">2PN2104<br/>2PN2119<br/>2PN2121</td>
      <td style="padding:8px 10px; font-weight:bold; color:#0f172a;">Invalid or Blank Postal Code / Invalid Street Address</td>
      <td style="padding:8px 10px; color:#334155;">CEP do Seller em branco/zerado no <code>PDS 0178</code> ou preenchimento da palavra <code>"UNKNOWN"</code> no endereço comercial do sublojista.</td>
      <td style="padding:8px 10px; font-weight:bold; color:#dc2626;">R$ 5.000,00 a<br/>R$ 5.600,00 / mês</td>
    </tr>
    <tr style="background:#ffffff; border-bottom:1px solid #fee2e2;">
      <td style="padding:8px 10px; font-family:monospace; font-weight:bold; color:#991b1b;">2PN2120<br/>2PN2410</td>
      <td style="padding:8px 10px; font-weight:bold; color:#0f172a;">Clearing Data Integrity — POS Auth vs. Clearing Mismatch</td>
      <td style="padding:8px 10px; color:#334155;">Divergência entre os dados cadastrais/CEP/MCC enviados na mensagem de Autorização (<code>0100</code>) e os enviados no Clearing (<code>IPM 1240</code>).</td>
      <td style="padding:8px 10px; font-weight:bold; color:#dc2626;">R$ 5.000,00 a<br/>R$ 5.600,00 / mês</td>
    </tr>
    <tr style="background:#fef2f2;">
      <td style="padding:8px 10px; font-family:monospace; font-weight:bold; color:#991b1b;">2PN2110<br/>2PN2402</td>
      <td style="padding:8px 10px; font-weight:bold; color:#0f172a;">E-Commerce Processing Invalid / Debit Invalid Merchant Type</td>
      <td style="padding:8px 10px; color:#334155;">Subcampos de comércio eletrônico (ECI / Segurança) inválidos ou combinação ilegal entre <code>MCC</code> e <code>TCC (Transaction Category Code)</code>.</td>
      <td style="padding:8px 10px; font-weight:bold; color:#dc2626;">R$ 5.000,00 a<br/>R$ 5.600,00 / mês</td>
    </tr>
  </tbody>
</table>

<h3>6.2. Multas de Compliance, Sellers Ilegais (BRAM / High-Brand Risk), Auditoria e Disputas VROL (Visa &amp; Mastercard)</h3>

<table style="width:100%; border-collapse:collapse; margin:1.25rem 0; font-size:12px; border:1px solid #cbd5e1; border-radius:10px; overflow:hidden;">
  <thead>
    <tr style="background:#0f172a; color:#ffffff;">
      <th style="padding:9px 10px; text-align:left; width:14%;">Bandeira &amp; Código</th>
      <th style="padding:9px 10px; text-align:left; width:26%;">Programa / Infração Regulatória</th>
      <th style="padding:9px 10px; text-align:left; width:36%;">Regra de Disparo &amp; Como Calcula</th>
      <th style="padding:9px 10px; text-align:left; width:24%;">Penalidade Oficial no Brasil (R$)</th>
    </tr>
  </thead>
  <tbody>
    <tr style="background:#ffffff; border-bottom:1px solid #e2e8f0;">
      <td style="padding:8px 10px; font-family:monospace; font-weight:bold; color:#1e40af;">Visa<br/>BL 5Z9965656</td>
      <td style="padding:8px 10px; font-weight:bold; color:#0f172a;">Acquirer Non-Compliance Assessments (Sponsored Merchant URL / Gambling / High-Risk)</td>
      <td style="padding:8px 10px; color:#334155;">Disparado quando um Marketplace ou PayFac processa transações para uma <strong>URL de submerchant não registrada, atividade ilegal, produto falsificado, farmácia sem licença ou apostas (Gambling) sem autorização regulatória</strong>.</td>
      <td style="padding:8px 10px; font-weight:bold; color:#dc2626;">
        &bull; 1ª Violação: <strong>R$ 65.000,00 / URL</strong><br/>
        &bull; 2ª Violação (12m): <strong>R$ 160.000,00 / URL</strong><br/>
        &bull; 3ª+ Violação (12m): <strong>R$ 320.000,00 / URL</strong>
      </td>
    </tr>
    <tr style="background:#f8fafc; border-bottom:1px solid #e2e8f0;">
      <td style="padding:8px 10px; font-family:monospace; font-weight:bold; color:#1e40af;">Visa<br/>BL 5Z9999105<br/>a 5Z9999194</td>
      <td style="padding:8px 10px; font-weight:bold; color:#0f172a;">Client &amp; Third Party Agent Facilities Inspections (AMP Audit)</td>
      <td style="padding:8px 10px; color:#334155;">Taxa de auditoria trimestral quando o Adquirente ou seu Payment Facilitator entra no programa de monitoramento (<em>Acquirer Monitoring Program</em>) ou revisão de segurança PIN/Fraude.</td>
      <td style="padding:8px 10px; font-weight:bold; color:#dc2626;">
        &bull; AMP Audit: <strong>R$ 65.000,00 / trim</strong><br/>
        &bull; PIN Field Review: <strong>R$ 65.000,00 / trim</strong><br/>
        &bull; Fraud Reporting: <strong>R$ 16.000,00</strong>
      </td>
    </tr>
    <tr style="background:#ffffff; border-bottom:1px solid #e2e8f0;">
      <td style="padding:8px 10px; font-family:monospace; font-weight:bold; color:#1e40af;">Visa<br/>BL 5Z9965657<br/>BL 5Z9999200</td>
      <td style="padding:8px 10px; font-weight:bold; color:#0f172a;">Daily Non-Compliance &amp; Collateral Delinquency Assessment</td>
      <td style="padding:8px 10px; color:#334155;">Atraso no cumprimento de determinação de compliance ou na constituição de garantias financeiras (colateral) exigidas pela bandeira. Cobra o <strong>maior valor</strong> entre a diária fixa e o percentual sobre o colateral pendente.</td>
      <td style="padding:8px 10px; font-weight:bold; color:#dc2626;">
        &bull; Dias 1 a 15: <strong>R$ 650,00/dia</strong> (ou 0,2%/dia)<br/>
        &bull; &gt; 15 dias: <strong>R$ 3.200,00/dia</strong> (ou 0,5%/dia)
      </td>
    </tr>
    <tr style="background:#f8fafc; border-bottom:1px solid #e2e8f0;">
      <td style="padding:8px 10px; font-family:monospace; font-weight:bold; color:#b45309;">Mastercard<br/>MCBS 2PN2008<br/>MCBS 2SC1424</td>
      <td style="padding:8px 10px; font-weight:bold; color:#0f172a;">BRAM (Business Risk Assessment and Mitigation) &amp; FMP On-Site MSP Review</td>
      <td style="padding:8px 10px; color:#334155;">Violação de proteção à marca (venda de itens proibidos/ilegais por submerchant no ecossistema Mastercard) e auditoria presencial bienal obrigatória de nível 2 no MSP/PayFac.</td>
      <td style="padding:8px 10px; font-weight:bold; color:#dc2626;">
        &bull; FMP Level 2 MSP Review: <strong>R$ 33.900,00</strong><br/>
        &bull; BRAM Assessment: Escalonado por gravidade/volume (USD 25k a USD 200k+)
      </td>
    </tr>
    <tr style="background:#ffffff; border-bottom:1px solid #e2e8f0;">
      <td style="padding:8px 10px; font-family:monospace; font-weight:bold; color:#b45309;">Mastercard<br/>MCBS 2SC1380<br/>a 2SC1387</td>
      <td style="padding:8px 10px; font-weight:bold; color:#0f172a;">Excessive Chargeback Program (CMM &amp; ECM)</td>
      <td style="padding:8px 10px; color:#334155;">
        &bull; <strong>CMM (Chargeback Monitored Merchant):</strong> &ge; 100 CBs/mês e ratio &ge; 1,00% (100 bps).<br/>
        &bull; <strong>ECM (Excessive Chargeback Merchant):</strong> &ge; 100 CBs/mês e ratio &ge; 1,50% (150 bps). Inclui taxa de relatório por merchant, multa de violação e ressarcimento ao emissor (<em>Issuer Recovery</em>).
      </td>
      <td style="padding:8px 10px; font-weight:bold; color:#dc2626;">Taxa progressiva mensal por mês em violação + recuperação por disputa excedente.</td>
    </tr>
    <tr style="background:#f8fafc;">
      <td style="padding:8px 10px; font-family:monospace; font-weight:bold; color:#1e40af;">Visa<br/>BL 5H4010111<br/>BL 5H4010101<br/>BL 5M6104600</td>
      <td style="padding:8px 10px; font-weight:bold; color:#0f172a;">Custos Operacionais de Disputa (Chargeback), Pré-Arbitragem e Arbitragem no VROL</td>
      <td style="padding:8px 10px; color:#334155;">Cobrados por evento no <strong>Visa Resolve Online (VROL)</strong>. Se o seller/merchant ultrapassar os thresholds de fraude CNP, incide a sobretaxa <em>Visa Dispute Incremental Fee</em> sobre cada disputa.</td>
      <td style="padding:8px 10px; font-weight:bold; color:#dc2626;">
        &bull; Disputa recebida: <strong>R$ 10,35</strong><br/>
        &bull; Incremental CNP Fraud: <strong>+ R$ 12,00</strong><br/>
        &bull; Resposta tardia (21–30d): <strong>R$ 10,06 a R$ 12,36</strong><br/>
        &bull; Arbitragem (Filing): <strong>R$ 2.900,00</strong><br/>
        &bull; Recurso (Appeal): <strong>R$ 5.751,00</strong><br/>
        &bull; Penalidade Técnica: <strong>R$ 1.500,00</strong>
      </td>
    </tr>
  </tbody>
</table>

<!-- =====================================================================
     SEÇÃO 7: BLINDAGEM CONTRA RISCO DE CONTAMINAÇÃO CRUZADA & PLAYBOOK
     ===================================================================== -->
<h2>7. Blindagem contra Contaminação Cruzada (Cross-Default), KYB de Sellers e Arquitetura de Escrow</h2>
<p>
  Em um Marketplace ou Subcredenciador, o maior perigo operacional é a <strong>Contaminação Cruzada do PF ID / MVV</strong>: se uma quadrilha cadastrar 5 lojas falsas para passar cartões clonados (<em>auto-financiamento / bust-out</em>) ou vender produtos inexistentes sem entrega, o índice agregado de fraude/chargeback do Subcredenciador dispara no <strong>VAMP (Visa Acquirer Monitoring Program)</strong> e no <strong>Mastercard ECP/EFM</strong>, podendo resultar na suspensão do código mestre da plataforma inteira.
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
          <li><strong>Validação Automática CNAE &times; MCC &times; Natureza Jurídica:</strong> Bloquear atribuição de MCC de PJ para vendedores PF (conformidade Elo 26.2).</li>
          <li><strong>Web Crawler de URL e Catálogo:</strong> Varredura contínua de palavras-chave proibidas (BRAM / Visa High-Brand Risk) para evitar a multa de R$ 65.000/URL.</li>
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
          <li><strong>Compensação Automática Cross-Balance:</strong> Cláusula contratual permitindo abater chargebacks e multas VROL (R$ 10,35–22,35) de vendas futuras do mesmo seller.</li>
        </ul>
      </td>
      <td style="width:50%; padding:14px; background:#fef2f2; border:1px solid #fecaca; vertical-align:top;">
        <strong style="color:#b91c1c; font-size:0.9rem;">🔴 4. GOVERNANÇA DE DESMEMBRAMENTO (TETO 10% / USD 10M)</strong>
        <ul style="margin:8px 0 0 16px; padding:0; font-size:0.84rem; color:#7f1d1d; line-height:1.55;">
          <li><strong>Monitor de Concentração por Seller:</strong> Alerta automático quando qualquer seller atingir <strong>7% do TPV do Marketplace</strong> ou <strong>USD 7M/ano</strong>.</li>
          <li><strong>Migração para Direct Merchant Agreement:</strong> Acima de 10% do TPV ou USD 10M/ano, formalizar contrato tripartite direto entre Seller, Adquirente e Bandeira, mantendo a orquestração técnica no Marketplace sem violar o teto de PayFac.</li>
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
      <th style="padding:9px 10px; text-align:center; width:14%;">Prioridade</th>
    </tr>
  </thead>
  <tbody>
    <tr style="background:#ffffff; border-bottom:1px solid #e2e8f0;">
      <td style="padding:8px 10px; font-weight:bold; color:#1e40af;">1. Regulatório</td>
      <td style="padding:8px 10px; font-weight:bold; color:#0f172a;">Enquadramento SLC/CIP &amp; Registradora</td>
      <td style="padding:8px 10px; color:#334155;">Definir se o split ocorre direto na Adquirente (Marketplace Puro) ou via Subcredenciador próprio integrado à CIP (<code>ASLC029/031</code>) e Registradoras (CERC/TAG/B3/Nuclea — Res. BCB 264).</td>
      <td style="padding:8px 10px; text-align:center;"><span style="background:#fee2e2; color:#991b1b; font-weight:bold; padding:2px 8px; border-radius:99px; font-size:10px;">CRÍTICO</span></td>
    </tr>
    <tr style="background:#f8fafc; border-bottom:1px solid #e2e8f0;">
      <td style="padding:8px 10px; font-weight:bold; color:#1e40af;">2. Bandeiras</td>
      <td style="padding:8px 10px; font-weight:bold; color:#0f172a;">Registro de PF ID / MVV / Marketplace ID</td>
      <td style="padding:8px 10px; color:#334155;">Confirmar registro ativo de Third Party Agent na Visa (<code>BL 5Q6562026</code> — R$ 32.000) e MSP/PF na Mastercard (<code>MCBS 2SC1812</code> — R$ 18.135) junto à credenciadora patrocinadora.</td>
      <td style="padding:8px 10px; text-align:center;"><span style="background:#fee2e2; color:#991b1b; font-weight:bold; padding:2px 8px; border-radius:99px; font-size:10px;">CRÍTICO</span></td>
    </tr>
    <tr style="background:#ffffff; border-bottom:1px solid #e2e8f0;">
      <td style="padding:8px 10px; font-weight:bold; color:#7e22ce;">3. Mensageria</td>
      <td style="padding:8px 10px; font-weight:bold; color:#0f172a;">Auditoria de DE 42, DE 43 e DE 48</td>
      <td style="padding:8px 10px; color:#334155;">Validar nos logs <code>0100</code>, <code>TC 05</code> e <code>IPM 1240</code>: <code>DE 42</code> único por seller, <code>DE 43</code> no padrão <code>PF*SELLER</code> sem caracteres inválidos, e <code>PDS 0208 + PDS 0178</code> com CEP e endereço reais (zero ocorrências no <code>IP714010-AA</code>).</td>
      <td style="padding:8px 10px; text-align:center;"><span style="background:#fee2e2; color:#991b1b; font-weight:bold; padding:2px 8px; border-radius:99px; font-size:10px;">CRÍTICO</span></td>
    </tr>
    <tr style="background:#f8fafc; border-bottom:1px solid #e2e8f0;">
      <td style="padding:8px 10px; font-weight:bold; color:#7e22ce;">4. Cadastro</td>
      <td style="padding:8px 10px; font-weight:bold; color:#0f172a;">Segregação PJ (CNPJ) vs. PF (CPF) Elo 26.2</td>
      <td style="padding:8px 10px; color:#334155;">Impedir que vendedores cadastrados com CPF recebam MCCs exclusivos de Pessoa Jurídica nos lotes de liquidação Elo e Mastercard.</td>
      <td style="padding:8px 10px; text-align:center;"><span style="background:#fef3c7; color:#92400e; font-weight:bold; padding:2px 8px; border-radius:99px; font-size:10px;">ALTA</span></td>
    </tr>
    <tr style="background:#ffffff; border-bottom:1px solid #e2e8f0;">
      <td style="padding:8px 10px; font-weight:bold; color:#047857;">5. Pricing</td>
      <td style="padding:8px 10px; font-weight:bold; color:#0f172a;">Otimização de Captura Único vs. Parcial</td>
      <td style="padding:8px 10px; color:#334155;">Priorizar captura única sob <code>MCC 5262</code> quando operar como Marketplace Qualificado, reduzindo a multiplicação de tarifas por item nas 5 faixas de ticket do Visa VSS 2026.</td>
      <td style="padding:8px 10px; text-align:center;"><span style="background:#dbeafe; color:#1e40af; font-weight:bold; padding:2px 8px; border-radius:99px; font-size:10px;">ALTA</span></td>
    </tr>
    <tr style="background:#f8fafc;">
      <td style="padding:8px 10px; font-weight:bold; color:#b45309;">6. Risco &amp; PLD</td>
      <td style="padding:8px 10px; font-weight:bold; color:#0f172a;">Termo de Adesão do Seller &amp; Escrow</td>
      <td style="padding:8px 10px; color:#334155;">Incluir nos Termos de Uso do Seller: mandato de liquidação, autorização de consulta em registradoras, retenção de reserva (<em>Rolling Reserve</em>) e débito automático de disputas e multas de bandeira.</td>
      <td style="padding:8px 10px; text-align:center;"><span style="background:#dcfce7; color:#166534; font-weight:bold; padding:2px 8px; border-radius:99px; font-size:10px;">MANDATÓRIO</span></td>
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
