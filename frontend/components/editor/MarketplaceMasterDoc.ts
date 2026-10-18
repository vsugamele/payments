import { BulletinMetadata } from "./BulletinMetadataCard";
import { DocumentTemplate } from "./TemplateSelector";

export const MARKETPLACE_MASTER_METADATA: BulletinMetadata = {
  brand: "geral",
  brandName: "Guia Autoral & Dossiê Técnico • Vinícius Sugamele",
  title: "A Anatomia Completa dos Marketplaces e Subcredenciadores no Brasil: A História, os Porquês, a Engenharia Byte a Byte, a Regulação e a Conta Real",
  referenceId: "MKT-PF-BR-2026-V3-MASTERCLASS",
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
    "Mais do que uma tabela de códigos, este documento ensina de ponta a ponta como funciona um Marketplace e um Subcredenciador (Payment Facilitator) no Brasil. Explica a origem histórica de cada regra do Banco Central (Resoluções BCB nº 80, nº 150 e nº 264, CIP/SLC e Registradoras) e das bandeiras (Visa, Mastercard e Elo); mostra por que confundir Marketplace Qualificado com PayFac destrói a conversão ou gera multas pesadas; disseca a mensageria real da autorização ao clearing noturno (DE 42, DE 43, DE 48 SE 37, PDS 0208/0178, Trace ID e Elo 26.2); abre a conta centavo a centavo de uma venda com split; e detalha todas as tarifas e penalidades oficiais em Reais (R$).",
  recommendedAction:
    "Ler a explicação de cada bloco antes de aplicar as tabelas: (1) Definir o enquadramento societário e financeiro entre Marketplace com Split na Adquirente vs. Subcredenciador liquidante na CIP/SLC; (2) Auditar nos logs de produção se o DE 42, o DE 43 ('PF*SELLER'), o DE 48 (PDS 0208/0178) e o CEP estão idênticos entre Autorização e Clearing para estancar multas mensais de R$ 5.000 a R$ 5.600; (3) Revisar a arquitetura de captura única vs. parcial frente às 5 faixas de ticket do Visa VSS 2026; e (4) Blindar o PF ID/MVV contra contaminação cruzada no VAMP e multas de R$ 65.000 a R$ 320.000 por URL.",
  versionHistory: [
    {
      version: "2026.6 (Masterclass Autoral)",
      date: "18/10/2026",
      description:
        "Reescrita completa em formato de aula técnica e estratégica profunda: contexto histórico dos porquês regulatórios e de bandeira, explicação didática do fluxo de autorização vs. clearing, anatomia do split, unit economics e tabelas 100% auditadas.",
      isCurrent: true,
    },
    {
      version: "2026.5 (Audited Master)",
      date: "18/10/2026",
      description:
        "Auditoria forense de dados com régua posicional de 40 bytes do DE 43, PDS 0178 Table 619, simulação numérica de split de R$ 500 e fórmula oficial do VAMP.",
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
  name: "🛒 Dossiê Mestre (Aula Completa): Regras para Marketplaces & Subcredenciadores (Negócios, Técnica, Regulação, Custos & Multas)",
  description:
    "Guia autoral profundo e didático sobre Marketplaces e PayFacs no Brasil: a história e o porquê de cada regra, como funciona o fluxo no Bacen/CIP/Registradoras, a engenharia byte a byte ISO 8583/Base II/IPM/Elo 26.2, a conta real do split e todas as tarifas e multas em R$.",
  category: "Pagamentos",
  defaultTitle: "A Anatomia Completa dos Marketplaces e Subcredenciadores no Brasil: Negócios, Engenharia, Regulação, Custos e Penalidades",
  content: `<h1>A ANATOMIA COMPLETA DOS MARKETPLACES E SUBCREDENCIADORES NO BRASIL</h1>
<p style="color:#64748b; font-size:0.95rem; margin-top:-0.5rem; margin-bottom:1.25rem;">
  <strong>Por Vinícius Sugamele • Guia Definitivo de Arquitetura, Regulação e Finanças (Edição 2026):</strong> A história por trás das regras, como a engrenagem funciona por baixo do capô, o que cada campo da mensageria faz, onde moram os custos ocultos e como blindar a operação contra multas milionárias.
</p>
<hr/>

<!-- PAINEL EXECUTIVO DE ABERTURA -->
<div style="background:#0f2c59; color:#ffffff; border-radius:14px; padding:22px 24px; margin:1.5rem 0; font-family:system-ui, -apple-system, sans-serif; box-shadow:0 10px 25px rgba(15,44,89,0.18);">
  <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:16px; border-bottom:1px solid rgba(255,255,255,0.15); padding-bottom:14px; margin-bottom:16px;">
    <div>
      <span style="background:#2563eb; color:#ffffff; font-size:10px; font-weight:800; padding:3px 9px; border-radius:4px; text-transform:uppercase; letter-spacing:0.6px;">
        Masterclass Técnica &amp; Regulatória • Meios de Pagamento no Brasil
      </span>
      <h3 style="margin:8px 0 4px 0; font-size:19px; font-weight:800; color:#ffffff;">
        Como Operam Marketplaces, Plataformas Multi-Seller e Subcredenciadores (PayFacs)
      </h3>
      <span style="font-size:12px; color:#93c5fd;">
        Baseado nas fontes primárias: Resoluções BCB nº 80/2021, nº 150/2021 e nº 264/2022 • Visa Core Rules &amp; Fee Schedule Brasil 2026 • Mastercard Rules Cap. 7, DMC Guide (Ago/2026) &amp; MCBS Ed. 13.2 • Elo Release 26.2
      </span>
    </div>
    <span style="background:#dc2626; color:#ffffff; font-size:11px; font-weight:800; padding:5px 12px; border-radius:99px; white-space:nowrap;">
      Leitura Obrigatória
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

<div style="background:#eff6ff; border:1px solid #bfdbfe; border-left:5px solid #2563eb; border-radius:12px; padding:18px 22px; margin:1.5rem 0;">
  <div style="display:flex; align-items:center; gap:8px; margin-bottom:8px; color:#1e40af; font-weight:bold; font-size:0.95rem;">
    <span>🎯</span>
    <span>POR QUE ESTE DOCUMENTO EXISTE (E COMO LER CADA SEÇÃO)</span>
  </div>
  <p style="margin:0; color:#1e293b; font-size:0.92rem; line-height:1.7;">
    Quando alguém monta um Marketplace ou uma operação de subcredenciamento no Brasil, normalmente esbarra em três mundos que quase nunca conversam entre si: o <strong>time comercial/produto</strong> (que só quer colocar o split no ar rápido e cobrar comissão), o <strong>time jurídico/regulatório</strong> (preocupado com Banco Central, CIP e Receita Federal) e o <strong>time de engenharia de pagamentos</strong> (que precisa preencher bits e bytes na mensageria ISO 8583 e nos arquivos de clearing sem tomar multa da bandeira).<br/><br/>
    Se você olhar apenas uma tabela de campos técnicos sem entender <strong>por que</strong> aquela regra foi criada, qualquer exceção de negócio vai fazer sua equipe tomar a decisão errada. Por isso, este guia foi escrito para explicar <strong>a história por trás de cada regra, como o mecanismo funciona na prática e qual é a conta financeira exata</strong> de cada decisão.
  </p>
</div>

<!-- =====================================================================
     SEÇÃO 1: A HISTÓRIA E OS MODELOS DE NEGÓCIO
     ===================================================================== -->
<h2>1. A Origem do Problema: Por Que Bandeiras e Banco Central Criaram Regras Diferentes para Marketplaces e Subcredenciadores?</h2>

<p>
  Para entender as regras atuais da Visa, da Mastercard, da Elo e do Banco Central, precisamos voltar alguns anos no tempo e olhar para o que acontecia no mercado brasileiro no início da explosão do e-commerce e das fintechs de pagamento.
</p>
<p>
  Naquela época, para um pequeno lojista aceitar cartão de crédito, ele precisava passar por um processo burocrático que levava semanas junto às grandes adquirentes tradicionais. Foi aí que empreendedores perceberam uma oportunidade óbvia: abrir uma única empresa, fazer <strong>um único contrato de estabelecimento comercial (MID)</strong> com a adquirente e deixar que milhares de vendedores menores passassem suas vendas por dentro daquele mesmo contrato mestre. Depois que a adquirente depositava todo o dinheiro na conta bancária dessa empresa intermediadora, ela descontava a sua taxa e fazia transferências bancárias (TEDs) para cada vendedor.
</p>
<p>
  No começo, parecia genial. Só que esse modelo — conhecido na época como <strong>"Agregador Opaco"</strong> ou <strong>"Factoring de Cartão"</strong> — criou quatro problemas gravíssimos para o sistema financeiro:
</p>
<ol>
  <li><strong>Cegueira total para os Bancos Emissores:</strong> Quando o comprador passava o cartão em 50 lojas diferentes que usavam o mesmo agregador, o banco emissor (Itaú, Bradesco, Nubank, Banco do Brasil) enxergava na mensagem de autorização <code>0100</code> exatamente o mesmo código de lojista (<code>DE 42</code>) e o mesmo ramo de atividade (<code>MCC</code>). Se uma única loja dentre aquelas 5.000 fosse fraudulenta, o banco emissor não conseguia bloquear apenas a loja fraudadora: ou ele bloqueava o agregador inteiro (derrubando 4.999 lojas honestas), ou deixava a fraude passar.</li>
  <li><strong>Explosão de Chargebacks por Confusão na Fatura:</strong> O consumidor comprava um tênis na <em>"Loja do Mário"</em>, mas na fatura do cartão aparecia o nome da empresa intermediadora (ex.: <em>"PAGAMENTOS DIGITAIS LTDA"</em>). O cliente olhava a fatura, não reconhecia aquele nome, ligava para o banco e abria um chargeback por desacordo ou fraude (<em>"Não reconheço esta compra"</em>).</li>
  <li><strong>Lavagem de Transações (Transaction Laundering):</strong> Sites ilegais — venda de produtos falsificados, cassinos sem licença, farmácias clandestinas, esquemas de pirâmide — se escondiam atrás do CNPJ do agregador. Para a bandeira e para a adquirente, parecia que quem estava vendendo era uma empresa de tecnologia legítima.</li>
  <li><strong>Risco Sistêmico de Quebra e Penhora (Dinheiro Misturado):</strong> Como a adquirente depositava 100% do dinheiro das vendas na conta corrente comum do agregador, aquele dinheiro se misturava com o patrimônio da própria empresa. Vários agregadores começaram a usar o dinheiro que deveria ser repassado aos lojistas em D+30 para pagar folha salarial, marketing ou cobrir prejuízos. Quando um agregador sofria um bloqueio judicial trabalhista/tributário ou ia à falência, milhares de lojistas que já tinham entregado a mercadoria ficavam no calote.</li>
</ol>

<p>
  Foi para acabar com esses quatro problemas de uma vez por todas que o <strong>Banco Central do Brasil</strong> e as <strong>Bandeiras (Visa, Mastercard e Elo)</strong> fecharam o cerco e dividiram o mercado em <strong>quatro figuras jurídicas e técnicas muito bem delimitadas</strong>. Entender a diferença entre elas é o passo número um de qualquer projeto:
</p>

<h3>1.1. As 4 Figuras do Mercado Explicadas em Detalhe</h3>

<ul>
  <li>
    <strong>Figura 1 — O Subcredenciador / Payment Facilitator (PayFac ou MSP):</strong><br/>
    Imagine empresas como PagSeguro, Mercado Pago (quando vende maquininha ou checkout para sites de terceiros), Stone/Ton, Pagar.me, Vindi ou Asaas. Nesse modelo, o Subcredenciador assina um contrato mestre com uma Adquirente patrocinadora, mas ele habilita <strong>sublojistas independentes</strong> — cada um com seu próprio site, seu próprio balcão, sua própria marca e seu próprio ramo de atividade.<br/>
    <em>O que a regra exige dele?</em> Como cada sublojista é um negócio separado, o PayFac <strong>é proibido de usar um MCC único</strong>. Se o Submerchant A é uma padaria (<code>MCC 5462</code>) e o Submerchant B é uma loja de roupas (<code>MCC 5651</code>), o PayFac tem que mandar o MCC real de cada um, criar um código único (<code>DE 42</code>) para cada sublojista e estampar na fatura do cartão a combinação <code>PREFIXO*NOME_DA_LOJA</code> no campo <code>DE 43</code>. E no fluxo do dinheiro, por tocar nos recursos dos lojistas, ele é obrigado pelo Banco Central a liquidar tudo por dentro da câmara centralizada da CIP (SLC) e registrar as agendas nas Registradoras de Recebíveis.
  </li>
  <li style="margin-top:0.6rem;">
    <strong>Figura 2 — O Marketplace Qualificado (Qualifying Marketplace):</strong><br/>
    Agora pense na Amazon, no Mercado Livre (dentro do app/site do Mercado Livre), na Magazine Luiza ou na Shopee. Aqui a dinâmica de compra é outra: o consumidor entra em <strong>um único site ou aplicativo</strong>, coloca no mesmo carrinho de compras três produtos de três vendedores diferentes (<em>sellers 3P</em>) e paga tudo de uma vez só, num único clique. Se o produto atrasar ou vier com defeito, o cliente reclama na plataforma do Marketplace, e é o Marketplace quem garante a devolução do dinheiro.<br/>
    <em>Por que as bandeiras criaram uma regra especial para ele?</em> Pense comigo: se num único carrinho de R$ 300 você tem uma camiseta (<code>MCC 5651</code>), um livro (<code>MCC 5942</code>) e uma panela (<code>MCC 5722</code>), qual MCC você manda na mensagem de autorização <code>0100</code> se você só quer fazer uma única cobrança no cartão do cliente? Seria impossível mandar três MCCs diferentes na mesma autorização! Se o Marketplace fosse obrigado a quebrar a compra em 3 autorizações separadas no momento do clique, o antifraude do banco emissor veria 3 cobranças seguidas em milissegundos, bloquearia o cartão achando que é ataque de <em>card testing</em>, ou aprovaria duas compras e negaria a terceira (deixando o carrinho quebrado pela metade!).<br/>
    Para resolver exatamente essa dor de conversão, a Visa e a Mastercard criaram a figura do <strong>Qualifying Marketplace</strong> e o código especial <strong><code>MCC 5262 (Marketplaces Online)</code></strong>. Quando o Marketplace cumpre os 6 requisitos de qualificação e é registrado na bandeira (recebendo um <strong>MVV</strong> na Visa e um <strong>Marketplace ID</strong> na Mastercard), ele ganha o direito de passar o carrinho inteiro em <strong>uma única autorização com o MCC 5262</strong> e colocar a sua própria marca em destaque na fatura do cliente.
  </li>
  <li style="margin-top:0.6rem;">
    <strong>Figura 3 — O Varejista Direto (1P / Merchant of Record):</strong><br/>
    É a operação de varejo clássico: a própria plataforma comprou a mercadoria da indústria, estocou no seu galpão, vendeu para o consumidor final e emitiu a Nota Fiscal (NF-e) de 100% do valor em seu próprio CNPJ. Aqui não existe intermediação nem split perante o sistema de pagamentos: o dinheiro sai da adquirente e cai 100% livre na conta corrente da loja.
  </li>
  <li style="margin-top:0.6rem;">
    <strong>Figura 4 — O Gateway / Orquestrador Puramente Tecnológico (PSP Técnico / TPS / ESO):</strong><br/>
    É o provedor de tecnologia (como um cofre de cartões ou roteador de pagamento) que apenas transmite os dados técnicos da transação, mas usa o contrato e o código de afiliação (MID) que cada lojista assinou diretamente com a Cielo, Rede, Getnet ou Adyen. Como o Gateway <strong>nunca toca em um centavo do dinheiro</strong> (a adquirente liquida direto na conta de cada lojista), ele não sofre incidência das regras do Banco Central de CIP/SLC nem de Registradoras, precisando apenas manter certificação de segurança <strong>PCI-DSS</strong> e registro de agente tecnológico nas bandeiras (<strong>ESO/TPS</strong> na Visa; <strong>DSE</strong> na Mastercard).
  </li>
</ul>

<table style="width:100%; border-collapse:collapse; margin:1.5rem 0; font-size:12px; border:1px solid #cbd5e1; border-radius:10px; overflow:hidden;">
  <thead>
    <tr style="background:#0f2c59; color:#ffffff;">
      <th style="padding:10px 12px; text-align:left; width:17%;">Modelo Operacional</th>
      <th style="padding:10px 12px; text-align:left; width:24%;">Onde o Cliente Compra</th>
      <th style="padding:10px 12px; text-align:left; width:21%;">Regra de Fatura (DE 43) e MCC</th>
      <th style="padding:10px 12px; text-align:left; width:20%;">Caminho do Dinheiro (Liquidação)</th>
      <th style="padding:10px 12px; text-align:left; width:18%;">Quem Paga o Chargeback</th>
    </tr>
  </thead>
  <tbody>
    <tr style="background:#ffffff; border-bottom:1px solid #e2e8f0;">
      <td style="padding:10px 12px; font-weight:bold; color:#1e40af;">1. Marketplace Qualificado<br/><span style="font-size:11px; font-weight:normal; color:#64748b;">(Qualifying Marketplace)</span></td>
      <td style="padding:10px 12px; color:#1e293b;">Dentro do site/app único do Marketplace, com checkout, entrega e SAC controlados pela plataforma.</td>
      <td style="padding:10px 12px; color:#1e293b;">Marca do <strong>Marketplace</strong> no <code>DE 43</code>. Pode usar <strong>MCC 5262</strong> em captura única mediante registro de <strong>MVV / Marketplace ID</strong>.</td>
      <td style="padding:10px 12px; color:#1e293b;">Split executado direto na Adquirente (que liquida na CIP) ou via estrutura própria de Subcredenciador.</td>
      <td style="padding:10px 12px; color:#dc2626; font-weight:600;">100% o Marketplace (mesmo se o seller sumir).</td>
    </tr>
    <tr style="background:#f8fafc; border-bottom:1px solid #e2e8f0;">
      <td style="padding:10px 12px; font-weight:bold; color:#7e22ce;">2. Subcredenciador / PayFac<br/><span style="font-size:11px; font-weight:normal; color:#64748b;">(Payment Facilitator — PF)</span></td>
      <td style="padding:10px 12px; color:#1e293b;">No site próprio, app, link ou maquininha de cada sublojista independente.</td>
      <td style="padding:10px 12px; color:#1e293b;">Obrigatório <code>PREFIXO*SELLER</code> no <code>DE 43</code>. <strong>Proibido usar MCC 5262:</strong> cada seller trafega seu <strong>MCC real</strong> e <code>DE 42</code> único.</td>
      <td style="padding:10px 12px; color:#1e293b;">Liquidação <strong>obrigatória na Grade Centralizada (CIP/SLC)</strong> e registro diário nas Registradoras (BCB 264).</td>
      <td style="padding:10px 12px; color:#dc2626; font-weight:600;">Solidário entre o PayFac e a Adquirente Patrocinadora.</td>
    </tr>
    <tr style="background:#ffffff; border-bottom:1px solid #e2e8f0;">
      <td style="padding:10px 12px; font-weight:bold; color:#047857;">3. Varejista 1P<br/><span style="font-size:11px; font-weight:normal; color:#64748b;">(Merchant of Record)</span></td>
      <td style="padding:10px 12px; color:#1e293b;">Na loja própria (venda de estoque próprio com NF-e integral da loja).</td>
      <td style="padding:10px 12px; color:#1e293b;">Nome da Loja no <code>DE 43</code> e MCC do seu CNAE principal. Sem PF ID.</td>
      <td style="padding:10px 12px; color:#1e293b;">Liquidação direta da Adquirente para a conta bancária do Varejista.</td>
      <td style="padding:10px 12px; color:#1e293b;">100% o Varejista.</td>
    </tr>
    <tr style="background:#f8fafc;">
      <td style="padding:10px 12px; font-weight:bold; color:#475569;">4. Gateway Técnico<br/><span style="font-size:11px; font-weight:normal; color:#64748b;">(PSP / TPS / ESO / DSE)</span></td>
      <td style="padding:10px 12px; color:#1e293b;">No site do lojista, usando o contrato direto que o lojista tem com a Adquirente.</td>
      <td style="padding:10px 12px; color:#1e293b;">Nome do Lojista direto no <code>DE 43</code>. Registrado apenas como agente tecnológico (<strong>ESO/TPS</strong>).</td>
      <td style="padding:10px 12px; color:#1e293b;"><strong>Não toca no dinheiro.</strong> A Adquirente paga direto ao Lojista.</td>
      <td style="padding:10px 12px; color:#1e293b;">O Lojista direto.</td>
    </tr>
  </tbody>
</table>

<h3>1.2. A Regra dos 6 Critérios de Qualificação e o Limite dos 10% / USD 10 Milhões (Explicado sem Mistério)</h3>
<p>
  Muita gente ouve falar da <em>"regra dos 10%"</em> ou do <em>"teto de 10 milhões de dólares"</em> e mistura os dois conceitos. Vamos separar com precisão cirúrgica o que os manuais da Visa (<em>Visa Core Rules Section 5.2</em>) e da Mastercard (<em>Mastercard Rules Chapter 7</em>) determinam:
</p>
<ol>
  <li><strong>Os 5 Pilares Operacionais do Marketplace Qualificado:</strong> Para usar o <code>MCC 5262</code> e fazer captura única de múltiplos sellers, a plataforma precisa: (i) exibir todos os sellers sob seu próprio site/app e checkout; (ii) manter sua marca visível e ser a responsável direta pelo atendimento ao consumidor, entregas e devoluções; (iii) assumir <strong>100% da responsabilidade financeira</strong> por disputas (chargebacks), estornos e multas; (iv) repassar o dinheiro exclusivamente aos sellers que realizaram a venda; e (v) estar formalmente registrada pelo seu Adquirente junto à bandeira com um <strong>MVV / Marketplace ID</strong>.</li>
  <li><strong>O Teto Comercial de Volume por Sublojista (USD 10 Milhões/ano vs. 10% do TPV):</strong>
    <ul>
      <li><strong>Por que esse teto existe?</strong> As bandeiras não querem que uma grande rede varejista (digamos, uma rede que fatura R$ 200 milhões por ano) opere "escondida" como um simples sublojista dentro de um PayFac sem passar pelo crivo de compliance e contrato direto com a Adquirente e a Bandeira.</li>
      <li><strong>No Subcredenciador (PayFac):</strong> Sempre que um <em>Submerchant</em> atingir <strong>USD 10.000.000,00 (dez milhões de dólares) em volume anual por bandeira</strong>, ele atinge o status de <em>High-Volume Submerchant</em>. A partir desse momento, é obrigatório assinar um <strong>Direct Merchant Agreement (Contrato de Credenciamento Direto Tripartite)</strong> entre o Lojista, o Adquirente Patrocinador e a Bandeira. Ele pode até continuar usando a tecnologia e o split do PayFac, mas juridicamente passa a ter contrato direto e código individualizado auditado.</li>
      <li><strong>No Marketplace Qualificado:</strong> Um único <em>seller</em> (ou grupo econômico) <strong>não pode concentrar mais de 10% do volume anual (TPV) do Marketplace</strong> sem ter esse credenciamento direto reportado. Além disso, se o seu Marketplace for <strong>Híbrido (vende estoque próprio 1P e também vende produtos de terceiros 3P)</strong>, a melhor prática contábil, tributária e de bandeira é manter <strong>dois códigos de afiliação (MIDs) distintos</strong>: um MID com o MCC da sua atividade principal para as vendas 1P (onde você emite NF-e do produto) e outro MID com <code>MCC 5262</code> e <code>MVV</code> para a intermediação 3P.</li>
    </ul>
  </li>
</ol>

<div style="background:#f8fafc; border:1px solid #cbd5e1; border-left:5px solid #0f2c59; border-radius:12px; padding:16px 20px; margin:1.25rem 0; font-size:12.5px; line-height:1.65;">
  <strong style="color:#0f2c59; font-size:13.5px; display:block; margin-bottom:8px;">🧭 COMO DECIDIR A ARQUITETURA DA SUA OPERAÇÃO EM 3 PERGUNTAS:</strong>
  <p style="margin:0 0 8px 0;"><strong>1. "Eu quero ter um Marketplace, mas não quero virar uma instituição liquidante na CIP nem contratar Registradora. Isso é possível?"</strong><br/>
  <strong>Sim, é perfeitamente possível e é o caminho mais inteligente para 90% dos Marketplaces de nicho.</strong> Basta contratar o <strong>Motor de Split direto na sua Adquirente</strong> (ou em um Subcredenciador já homologado). Nesse desenho, você manda a instrução de divisão via API para a Adquirente dizendo: <em>"Desta venda de R$ 500, R$ 430 pertencem ao CNPJ do Seller A e R$ 70 são a minha comissão"</em>. A própria Adquirente registra a UR do Seller A na registradora e liquida os R$ 430 na conta do Seller A via CIP/SLC, depositando apenas os R$ 70 de comissão na sua conta. Como o dinheiro do seller nunca entrou na sua conta bancária, você <strong>não</strong> vira Subcredenciador perante o Bacen!</p>
  <p style="margin:0 0 8px 0;"><strong>2. "Quando eu sou obrigado a virar Subcredenciador (PayFac) de fato?"</strong><br/>
  Quando você decide que a Adquirente vai depositar <strong>100% do dinheiro bruto (os R$ 500 inteiros) na sua conta de liquidação</strong> para que o seu próprio sistema financeiro guarde esse saldo e faça os pagamentos aos sellers depois. No instante em que o dinheiro de terceiros transita pela sua conta, você assume o papel regulatório de <strong>Subcredenciador (Resolução BCB nº 150/2021)</strong> e é obrigado a integrar com a <strong>CIP/SLC</strong> e com uma <strong>Registradora (CERC, TAG, B3 ou Nuclea)</strong>.</p>
  <p style="margin:0;"><strong>3. "E quando eu preciso pedir autorização formal ao Banco Central para funcionar como Instituição de Pagamento (IP)?"</strong><br/>
  Pelas <strong>Resoluções BCB nº 80/2021 e nº 150/2021</strong>, enquanto o seu Subcredenciador movimentar menos de <strong>R$ 500.000.000,00 (quinhentos milhões de reais) acumulados nos últimos 12 meses</strong>, você participa do arranjo sem precisar de autorização prévia de funcionamento do Bacen (embora já seja obrigado a cumprir todas as regras de CIP, Registradoras e Bandeiras). Bateu R$ 500 milhões em 12 meses, o pedido de autorização como Instituição de Pagamento na modalidade Subcredenciador passa a ser obrigatório.</p>
</div>

<!-- TRÍADE POR TIME: SEÇÃO 1 -->
<div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:12px; margin:1.25rem 0; font-size:12px; line-height:1.55;">
  <div style="background:#eff6ff; border:1px solid #bfdbfe; border-top:4px solid #2563eb; border-radius:10px; padding:12px 14px;">
    <strong style="color:#1e40af; display:block; margin-bottom:6px; font-size:12.5px;">💼 Para o Time de Negócios &amp; Risco</strong>
    <p style="margin:0; color:#1e293b;">
      Decida antes de assinar com a Adquirente se você vai operar com <strong>Split na Adquirente</strong> (sem custo fixo de CIP/Registradora) ou como <strong>Subcredenciador Próprio</strong>. Se o seu Marketplace for híbrido (vende estoque próprio 1P e vendedores 3P), exija <strong>2 contratos/MIDs separados</strong> na Adquirente para não misturar receita de mercadoria (ICMS/IBS) com receita de intermediação (ISS/CBS).
    </p>
  </div>
  <div style="background:#f5f3ff; border:1px solid #ddd6fe; border-top:4px solid #7c3aed; border-radius:10px; padding:12px 14px;">
    <strong style="color:#5b21b6; display:block; margin-bottom:6px; font-size:12.5px;">🧭 Para o Time de Produto (PMs)</strong>
    <p style="margin:0; color:#1e293b;">
      Para usar o <code>MCC 5262</code> (carrinho multi-seller em 1 clique), a jornada do comprador precisa acontecer 100% dentro do seu app/site: o cliente não pode ser redirecionado para o site do seller, e o botão de "Pedir Reembolso / Ajuda" precisa abrir o SAC do seu Marketplace. Além disso, crie um dashboard interno que avise quando um seller chegar a <strong>7% do TPV</strong> ou <strong>USD 7M/ano</strong>.
    </p>
  </div>
  <div style="background:#ecfdf5; border:1px solid #a7f3d0; border-top:4px solid #059669; border-radius:10px; padding:12px 14px;">
    <strong style="color:#065f46; display:block; margin-bottom:6px; font-size:12.5px;">⚙️ Para o Time Técnico (Engenharia)</strong>
    <p style="margin:0; color:#1e293b;">
      Nunca chumbem um único código de estabelecimento (<code>MID / DE 42</code>) hardcoded no gateway. A tabela de pedido (<code>orders</code>) precisa distinguir itens <code>1P</code> de itens <code>3P</code> e vincular cada item do carrinho ao <code>seller_id</code>, <code>submerchant_id (DE 42)</code>, <code>mcc</code>, <code>tax_id (CPF/CNPJ)</code> e <code>postal_code (CEP)</code> daquele vendedor.
    </p>
  </div>
</div>

<!-- =====================================================================
     SEÇÃO 2: REGULAMENTAÇÃO BRASILEIRA EXPLICADA A FUNDO
     ===================================================================== -->
<h2>2. A Regulação do Banco Central Explicada por Dentro: BCB 150, Grade da CIP (SLC) e Registradoras (BCB 264)</h2>

<p>
  Se você conversar com um executivo de pagamentos nos Estados Unidos ou na Europa, ele vai te dizer que lá fora um PayFac abre uma conta bancária especial chamada <em>FBO (For Benefit Of)</em> e distribui o dinheiro para os lojistas por transferência comum. <strong>No Brasil, isso é estritamente proibido.</strong> Vamos entender como funcionam as três engrenagens regulatórias brasileiras e por que cada uma delas existe.
</p>

<h3>2.1. O Patrimônio Separado (Lei nº 12.865/2013 e Resolução BCB nº 150/2021)</h3>
<p>
  Pela legislação brasileira do Sistema de Pagamentos Brasileiro (SPB), todo valor capturado em uma transação de cartão que pertence ao vendedor final (<em>usuário final recebedor</em>) constitui <strong>patrimônio separado</strong>. Isso significa que aquele saldo não pode ser misturado com o caixa operacional do Subcredenciador ou do Marketplace, não pode ser usado para financiar capital de giro da plataforma e — o mais importante — não pode responder por dívidas trabalhistas, fiscais ou bancárias do intermediador.
</p>

<h3>2.2. Como Funciona a Liquidação Centralizada na CIP / Nuclea (SLC)</h3>
<p>
  Para garantir que nenhum Subcredenciador retenha indevidamente o dinheiro dos lojistas ou faça transferências por fora do monitoramento do SPB, o Banco Central determinou a <strong>Liquidação Centralizada na Câmara Interbancária de Pagamentos (CIP — hoje Nuclea, através do sistema SLC)</strong>.
</p>
<p>
  Funciona assim na prática diária de tesouraria:
</p>
<ol>
  <li>A Bandeira (Visa, Mastercard ou Elo) apura no clearing noturno quanto a Adquirente tem para receber dos Bancos Emissores.</li>
  <li>A Adquirente paga ao Subcredenciador pela grade da CIP.</li>
  <li>Por sua vez, o Subcredenciador gera diariamente três arquivos padronizados para a CIP/SLC informando quanto precisa pagar na conta bancária de cada sublojista:
    <ul>
      <li><strong>Arquivo <code>ASLC029</code>:</strong> Grade de liquidação das vendas de <strong>Cartão de Crédito</strong> (no vencimento normal de 30 dias ou parcelado).</li>
      <li><strong>Arquivo <code>ASLC031</code>:</strong> Grade de liquidação das vendas de <strong>Cartão de Débito</strong> (normalmente em D+1).</li>
      <li><strong>Arquivo <code>ASLC033</code>:</strong> Grade de liquidação das operações de <strong>Antecipação de Recebíveis</strong> (quando o seller pede para receber antes do prazo original).</li>
    </ul>
  </li>
  <li>No horário da grade bancária da manhã, o banco liquidante contratado pelo Subcredenciador debita a conta de liquidação e a CIP distribui automaticamente os valores para a conta domicílio de cada seller em qualquer banco do país.</li>
</ol>

<h3>2.3. A Revolução das Registradoras de Recebíveis (Resolução CMN nº 4.734 e Resolução BCB nº 264/2022) e o Perigo da "Dupla Liquidação"</h3>
<p>
  Até 2021, quando um lojista vendia R$ 100.000 parcelados na maquininha ou num Marketplace, aquela agenda de recebíveis ficava "invisível" para o resto do sistema financeiro. Se o lojista quisesse pegar um empréstimo mais barato em outro banco usando suas vendas de cartão como garantia, ele esbarrava na famosa "trava bancária" ou, em casos de fraude, cedia a mesma venda duas vezes para dois bancos diferentes.
</p>
<p>
  Com a <strong>Resolução CMN nº 4.734/2019</strong> e a <strong>Resolução BCB nº 264/2022</strong>, o Banco Central obrigou todos os Adquirentes e Subcredenciadores a se conectarem a uma <strong>Entidade Registradora de Recebíveis autorizada (CERC, TAG, B3 ou Nuclea)</strong> e criou o conceito da <strong>Unidade de Recebível (UR)</strong>.
</p>
<p>
  <strong>O que é uma Unidade de Recebível (UR)?</strong> Em vez de registrar milhão por milhão de transações isoladas (NSU por NSU), o sistema soma todas as vendas daquele mesmo vendedor que vencem no mesmo dia, na mesma bandeira, e cria uma "caixinha" única identificada por 4 chaves obrigatórias:
</p>
<div style="background:#0f172a; color:#38bdf8; padding:12px 16px; border-radius:8px; font-family:monospace; font-size:12px; margin:0.75rem 0;">
  Chave da UR = [CNPJ ou CPF do Seller] + [CNPJ da Credenciadora/Subcredenciadora] + [Código do Arranjo (VCC, MCC, ECC, VDC, MDC, EDC)] + [Data de Liquidação]
</div>
<p>
  <strong>Onde mora o perigo mortal da Dupla Liquidação (Pagar Duas Vezes)?</strong><br/>
  Imagine que o <em>Seller A</em> tem uma UR de <strong>R$ 50.000,00</strong> de vendas Visa Crédito (<code>VCC</code>) agendada para cair no dia 25/11 na sua plataforma. No dia 10/11, esse Seller A vai até um banco ou FIDC externo, dá um <em>Opt-in</em> (autorização de consulta da agenda) e faz uma operação de crédito dando aquela UR de R$ 50.000 como garantia (<strong>Ônus/Gravame</strong>) ou vendendo o recebível (<strong>Cessão/Troca de Titularidade</strong>).<br/>
  No mesmo instante, a Registradora (ex.: CERC ou TAG) grava uma trava naquela UR e envia um arquivo eletrônico para o seu Subcredenciador dizendo: <em>"Atenção: no dia 25/11, os R$ 50.000 do Seller A não pertencem mais à conta bancária dele; você é obrigado a liquidar esse valor na conta nº 9999 do Banco Credor X"</em>.<br/>
  Se o sistema de tesouraria ou de split do seu Marketplace tiver uma falha de integração, ignorar o arquivo de domicílio da Registradora (ou permitir que o Seller A antecipe esses mesmos R$ 50.000 dentro do seu próprio portal!) e depositar o dinheiro na conta antiga do Seller A, <strong>a lei brasileira obriga o Subcredenciador a tirar R$ 50.000 do próprio caixa e pagar novamente ao Banco Credor X</strong>. Por isso, nenhum motor de split ou antecipação no Brasil pode liberar um centavo sem antes consultar a trava da UR na Registradora!
</p>

<table style="width:100%; border-collapse:collapse; margin:1.5rem 0; font-size:12px; border:1px solid #cbd5e1; border-radius:10px; overflow:hidden;">
  <thead>
    <tr style="background:#1e293b; color:#ffffff;">
      <th style="padding:10px 12px; text-align:left; width:20%;">Pilar Regulatório</th>
      <th style="padding:10px 12px; text-align:left; width:26%;">Norma Oficial do Bacen</th>
      <th style="padding:10px 12px; text-align:left; width:32%;">Obrigação Operacional Diária</th>
      <th style="padding:10px 12px; text-align:left; width:22%;">O Que Acontece se Descumprir</th>
    </tr>
  </thead>
  <tbody>
    <tr style="background:#ffffff; border-bottom:1px solid #e2e8f0;">
      <td style="padding:10px 12px; font-weight:bold; color:#0f2c59;">Segregação Patrimonial &amp; Licença de IP</td>
      <td style="padding:10px 12px; color:#1e293b;">Lei nº 12.865/2013, Res. BCB nº 80/2021 e Res. BCB nº 150/2021</td>
      <td style="padding:10px 12px; color:#1e293b;">Manter recursos de sellers segregados do caixa próprio e requerer autorização de Instituição de Pagamento ao atingir <strong>R$ 500M em 12 meses</strong>.</td>
      <td style="padding:10px 12px; color:#dc2626; font-weight:600;">Processo Sancionador no Bacen, inabilitação de administradores e corte imediato de acesso ao arranjo.</td>
    </tr>
    <tr style="background:#f8fafc; border-bottom:1px solid #e2e8f0;">
      <td style="padding:10px 12px; font-weight:bold; color:#0f2c59;">Grade Centralizada CIP / Nuclea (SLC)</td>
      <td style="padding:10px 12px; color:#1e293b;">Resolução BCB nº 150/2021 e Manual Operacional do SLC</td>
      <td style="padding:10px 12px; color:#1e293b;">Liquidar repasses aos sublojistas exclusivamente pelas grades <code>ASLC029</code> (Crédito), <code>ASLC031</code> (Débito) e <code>ASLC033</code> (Antecipação).</td>
      <td style="padding:10px 12px; color:#dc2626; font-weight:600;">Multa operacional de câmara e suspensão do contrato pela Adquirente Patrocinadora.</td>
    </tr>
    <tr style="background:#ffffff; border-bottom:1px solid #e2e8f0;">
      <td style="padding:10px 12px; font-weight:bold; color:#0f2c59;">Registro e Trava de Recebíveis (URs)</td>
      <td style="padding:10px 12px; color:#1e293b;">Res. CMN nº 4.734/2019 e Res. BCB nº 264/2022</td>
      <td style="padding:10px 12px; color:#1e293b;">Atualizar diariamente as URs por CNPJ/CPF do Seller na CERC/TAG/B3/Nuclea e acatar ordens de gravame/cessão antes de liquidar ou antecipar.</td>
      <td style="padding:10px 12px; color:#dc2626; font-weight:600;"><strong>Dupla Liquidação (Pagar 2x):</strong> indenização integral obrigatória ao banco detentor da trava.</td>
    </tr>
    <tr style="background:#f8fafc;">
      <td style="padding:10px 12px; font-weight:bold; color:#0f2c59;">Teto de Intercâmbio (Débito e Pré-Pago)</td>
      <td style="padding:10px 12px; color:#1e293b;">Res. BCB nº 150/2021 e Res. BCB nº 246/2022</td>
      <td style="padding:10px 12px; color:#1e293b;">Auditar nos arquivos <code>VSS-120/130</code> e <code>IP755120-AA</code> se o intercâmbio respeita o teto máximo de <strong>0,50% no Débito</strong> e <strong>0,70% no Pré-Pago</strong>.</td>
      <td style="padding:10px 12px; color:#d97706; font-weight:600;">Sobrecusto oculto de <strong>80 a 140 bps</strong> quando cartões pré-pagos são tarifados como crédito cheio.</td>
    </tr>
  </tbody>
</table>

<!-- TRÍADE POR TIME: SEÇÃO 2 -->
<div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:12px; margin:1.25rem 0; font-size:12px; line-height:1.55;">
  <div style="background:#eff6ff; border:1px solid #bfdbfe; border-top:4px solid #2563eb; border-radius:10px; padding:12px 14px;">
    <strong style="color:#1e40af; display:block; margin-bottom:6px; font-size:12.5px;">💼 Para o Time de Negócios &amp; Tesouraria</strong>
    <p style="margin:0; color:#1e293b;">
      Se a operação for Subcredenciadora, é obrigatório contratar um <strong>Banco Liquidante</strong> (participante do STR/CIP) e uma <strong>Registradora (CERC, TAG, B3 ou Nuclea)</strong>. Nunca permita que o time financeiro faça PIX ou TED manual da conta da empresa para pagar vendas de cartão aos sellers fora da grade da CIP.
    </p>
  </div>
  <div style="background:#f5f3ff; border:1px solid #ddd6fe; border-top:4px solid #7c3aed; border-radius:10px; padding:12px 14px;">
    <strong style="color:#5b21b6; display:block; margin-bottom:6px; font-size:12.5px;">🧭 Para o Time de Produto (PMs)</strong>
    <p style="margin:0; color:#1e293b;">
      Na tela de "Antecipação de Recebíveis" ou "Alteração de Conta Bancária" do Portal do Seller, o botão de antecipar <strong>não pode</strong> liberar o dinheiro na hora sem antes consultar via API na Registradora se aquela UR já não foi dada em garantia (gravame) pelo seller a outro banco. Além disso, o valor registrado na UR já deve ser <strong>líquido da comissão</strong> do Marketplace.
    </p>
  </div>
  <div style="background:#ecfdf5; border:1px solid #a7f3d0; border-top:4px solid #059669; border-radius:10px; padding:12px 14px;">
    <strong style="color:#065f46; display:block; margin-bottom:6px; font-size:12.5px;">⚙️ Para o Time Técnico (Engenharia)</strong>
    <p style="margin:0; color:#1e293b;">
      Construir a rotina diária que agrega os NSUs aprovados na chave quádrupla da UR (<code>CPF/CNPJ Seller + CNPJ Sub + Arranjo + Data</code>), envia o arquivo de constituição de agenda para a Registradora, consome o arquivo de retorno de <strong>troca de titularidade/domicílio por ônus/cessão</strong> e só então gera os lotes <code>ASLC029</code>, <code>ASLC031</code> e <code>ASLC033</code> para a CIP.
    </p>
  </div>
</div>

<!-- =====================================================================
     SEÇÃO 3: PORTAL, CADASTRO DE SELLER, AUTORIZAÇÃO E CLEARING EXPLICADOS
     ===================================================================== -->
<h2>3. Como Tudo Funciona na Vida Real: Portal de Cadastro, Onboarding do Seller, Autorização (0100) e Clearing Noturno</h2>

<p>
  Aqui está o ponto que mais gera confusão quando colocamos os times de Negócios, Produto e Engenharia na mesma sala. Quando alguém lê nos manuais das bandeiras sobre <code>PF ID</code>, <code>MVV</code>, <code>Submerchant ID (DE 42)</code>, <code>DE 43</code> e <code>Registro "01"</code>, a primeira pergunta que todo mundo faz é:
</p>
<blockquote style="background:#fffbeb; border-left:5px solid #f59e0b; padding:12px 18px; margin:1rem 0; color:#78350f; font-style:italic; font-size:0.9rem;">
  "Espera aí: existe um portal na internet onde a gente cadastra o Marketplace e os Sellers? Nós precisamos cadastrar cada Seller na Visa, na Mastercard e na Elo antes de ele fazer a primeira venda, ou nós mandamos os dados do Seller direto dentro da mensagem da autorização na hora da compra?"
</blockquote>
<p>
  Se essa pergunta não ficar 100% clara, o Time de Produto desenha telas inúteis e o Time de Engenharia procura APIs que não existem. A verdade é que o ciclo se divide em <strong>quatro momentos completamente separados</strong> — e a regra de cadastro do Seller na <strong>Visa e Mastercard</strong> é diferente da regra da <strong>Elo</strong> e da <strong>Adquirente/Registradora</strong>. Vamos destrinchar cada um dos 4 momentos:
</p>

<h3>3.1. Momento 0 — O Cadastro da Plataforma (Marketplace ou PayFac) nos Portais das Bandeiras (Feito 1 Única Vez)</h3>
<p>
  Você não pode simplesmente inventar um número de <code>PF ID</code> ou sair usando o <code>MCC 5262</code> por conta própria. Antes de passar a primeira transação em produção, a sua plataforma precisa ser registrada oficialmente nas bandeiras.
</p>
<p>
  <strong>Quem entra no portal da bandeira para fazer esse cadastro?</strong> Não é o Marketplace diretamente! Quem tem acesso aos portais restritos das bandeiras é a sua <strong>Adquirente Patrocinadora (Credenciadora)</strong>. O fluxo acontece assim:
</p>
<ul>
  <li><strong>No Portal da Mastercard (<em>Mastercard Connect &rarr; My Company Manager / Third Party Registration — TPR / Abacus</em>):</strong> O time de Risco e Credenciamento da sua Adquirente faz login no Mastercard Connect, abre um processo de registro de <em>Payment Facilitator (PF)</em> ou <em>Marketplace</em> em nome do seu CNPJ, anexa seu dossiê de compliance e recolhe a taxa inicial (<code>MCBS 2SC1812</code> — R$ 18.135,00). Quando a Mastercard aprova, o portal gera o seu <strong><code>Payment Facilitator ID (PF ID)</code> oficial de até 11 dígitos</strong>. A Adquirente te entrega esse número para parametrizar no sistema.</li>
  <li><strong>No Portal da Visa (<em>Visa Online — VOL &rarr; Third Party Agent Registration System — TPARS / VMORC</em>):</strong> A sua Adquirente entra no Visa Online, registra a sua empresa como <em>Payment Facilitator</em> ou <em>Qualifying Marketplace (MCC 5262)</em> e recolhe a taxa anual (<code>BL 5Q6562026</code> — R$ 32.000,00). A Visa aprova o registro, gera o seu <strong><code>Visa PF ID / Agent Unique ID</code> (11 dígitos)</strong> e, para Marketplaces Qualificados ou acordos especiais, provisiona na tabela da VisaNet o seu <strong><code>MVV (Merchant Verification Value)</code> de 10 posições alfanuméricas</strong>.</li>
  <li><strong>No Portal da Elo:</strong> A Adquirente habilita o CNPJ da sua plataforma como Subcredenciador no portal operacional da Elo, liberando o seu código de participante para enviar arquivos de sublojistas e liquidação.</li>
</ul>

<h3>3.2. Momento 1 — O Cadastro de Cada Seller (Onboarding): Onde É Portal/API e Onde É Automático?</h3>
<p>
  Agora imagine que o seu Marketplace já está no ar e hoje, às 10h da manhã, a <em>"Loja do Mário"</em> acabou de se cadastrar para vender na sua plataforma. <strong>Onde você precisa cadastrar a Loja do Mário antes de ela vender o primeiro produto?</strong> Olhe a diferença entre os quatro lugares:
</p>
<ol>
  <li>
    <strong>Na Visa e na Mastercard (Sublojistas abaixo de USD 10M/ano): NÃO existe cadastro manual prévio no portal da bandeira!</strong><br/>
    Muita gente se surpreende com isso, mas o modelo de PayFac e Marketplace foi criado pelas bandeiras justamente para permitir <strong>onboarding instantâneo (em minutos)</strong>. Você <strong>não</strong> precisa entrar num portal da Visa ou da Mastercard e digitar o CNPJ da Loja do Mário para esperar a bandeira aprovar antes de ela vender!<br/>
    <em>O que você faz em relação à Visa e à Mastercard no momento do onboarding do Seller?</em> Apenas duas coisas:
    <ul>
      <li><strong>Consulta à Lista Restritiva (API MATCH™ na Mastercard e VMAS na Visa):</strong> O seu sistema (ou a API de onboarding da sua Adquirente) faz uma chamada automática ao <strong>MATCH</strong> (<code>MCBS 2NB0016</code> — R$ 0,20 por consulta) passando o CNPJ da Loja do Mário e o CPF dos sócios para garantir que eles não foram banidos por fraude no passado.</li>
      <li><strong>Geração do Código Único Interno (<code>Submerchant ID / DE 42</code>):</strong> O seu sistema cria um ID único de até 15 caracteres para a Loja do Mário (ex.: <code>SELLER000098412</code>). A Visa e a Mastercard vão conhecer a Loja do Mário <strong>dinamicamente ("on-the-fly")</strong> quando a primeira transação dela passar carregando esse ID no <code>DE 42</code>, o nome no <code>DE 43</code> e os dados cadastrais no <code>DE 48 / PDS 0178 / TC 05</code>! (Além disso, uma vez por trimestre, a Adquirente sobe no portal da bandeira uma planilha/relatório consolidado da carteira ativa).</li>
    </ul>
  </li>
  <li style="margin-top:0.5rem;">
    <strong>Na Elo (Atenção: AQUI EXISTE Arquivo/API de Cadastro Prévio do Seller!):</strong><br/>
    Diferente da Visa e da Mastercard, a <strong>Elo</strong> possui uma base cadastral centralizada de sublojistas alimentada pelo <strong>Arquivo de Manutenção da Base Cadastral de Sublojistas (Registros <code>"01"</code>, <code>"02"</code> e <code>"04"</code>)</strong> — que a maioria das Adquirentes expõe para você através de uma <strong>API REST de Cadastro de Sublojista</strong>.<br/>
    Quando a Loja do Mário entra na plataforma, o seu sistema chama a API de Cadastro (que gera o <code>Registro "01"</code> na Elo) enviando o CNPJ ou CPF (Posição 45, 14 bytes), a Razão Social, o Fantasia, o Endereço/CEP e o <code>MCC</code>. E é exatamente nesse momento do cadastro que entra a <strong>trava obrigatória da Elo Release 26.2</strong>: se o vendedor se cadastrou como Pessoa Física (CPF de 11 dígitos) e o seu sistema tentar atribuir a ele um <code>MCC</code> exclusivo de Pessoa Jurídica, a Elo rejeita o cadastro do vendedor!
  </li>
  <li style="margin-top:0.5rem;">
    <strong>Na Adquirente Patrocinadora (Se você usa o Motor de Split da Adquirente):</strong><br/>
    Se você contratou o split da própria Adquirente (Cielo, Rede, Getnet, Stone, Adyen, Pagar.me), o seu backend chama a <strong>API de Onboarding / Criação de Recebedor (<em>Recipient / Submerchant API</em>)</strong> da Adquirente assim que o seller termina o cadastro. Essa API cadastra o CNPJ/CPF, o MCC, o endereço e a conta bancária do seller dentro da Adquirente e te devolve o <code>recipient_id / submerchant_id</code> que você usará nas chamadas de pagamento e split.
  </li>
  <li style="margin-top:0.5rem;">
    <strong>Na Registradora (CERC, TAG, B3 ou Nuclea) e na CIP:</strong><br/>
    O CPF/CNPJ do Seller e a conta bancária dele (domicílio) são cadastrados para que, assim que a primeira venda acontecer, as <strong>Unidades de Recebíveis (URs)</strong> sejam registradas em nome do CPF/CNPJ daquele seller.
  </li>
</ol>

<table style="width:100%; border-collapse:collapse; margin:1.25rem 0; font-size:11.5px; border:1px solid #cbd5e1; border-radius:10px; overflow:hidden;">
  <thead>
    <tr style="background:#1e293b; color:#ffffff;">
      <th style="padding:9px 10px; text-align:left; width:18%;">Ator / Sistema</th>
      <th style="padding:9px 10px; text-align:left; width:27%;">Cadastro da Plataforma (Feito 1 Vez no Início)</th>
      <th style="padding:9px 10px; text-align:left; width:28%;">Cadastro de Cada Novo Seller (No Onboarding)</th>
      <th style="padding:9px 10px; text-align:left; width:27%;">Na Hora da Venda (Autorização 0100 &amp; Clearing)</th>
    </tr>
  </thead>
  <tbody>
    <tr style="background:#ffffff; border-bottom:1px solid #e2e8f0;">
      <td style="padding:8px 10px; font-weight:bold; color:#1e40af;">Visa</td>
      <td style="padding:8px 10px; color:#1e293b;">Adquirente registra no portal <strong>Visa Online (TPARS / VMORC)</strong> &rarr; gera <code>Visa PF ID</code> e <code>MVV</code> (R$ 32.000/ano).</td>
      <td style="padding:8px 10px; color:#1e293b;"><strong>Não cadastra seller manualmente no portal.</strong> Faz screening <strong>VMAS</strong> e gera o <code>Submerchant ID (DE 42)</code> interno.</td>
      <td style="padding:8px 10px; color:#1e293b;">Envia os dados do seller <strong>dentro da transação</strong> (<code>DE 42</code>, <code>DE 43</code>, <code>DE 62/104</code> no <code>0100</code> e <code>TC 05 TCR 0/1/5</code> no Base II).</td>
    </tr>
    <tr style="background:#f8fafc; border-bottom:1px solid #e2e8f0;">
      <td style="padding:8px 10px; font-weight:bold; color:#b45309;">Mastercard</td>
      <td style="padding:8px 10px; color:#1e293b;">Adquirente registra no portal <strong>Mastercard Connect (TPR / Abacus)</strong> &rarr; gera <code>PF ID</code> de 11 dígitos (R$ 18.135 ini).</td>
      <td style="padding:8px 10px; color:#1e293b;"><strong>Não cadastra seller manualmente no portal.</strong> Consulta API <strong>MATCH™</strong> (R$ 0,20) e gera <code>DE 42</code> único do seller.</td>
      <td style="padding:8px 10px; color:#1e293b;">Envia os dados do seller <strong>dentro da transação</strong> (<code>DE 42</code>, <code>DE 43</code>, <code>DE 48 SE 37</code> no <code>0100</code> e <code>PDS 0208/0178</code> no <code>IPM 1240</code>).</td>
    </tr>
    <tr style="background:#ffffff; border-bottom:1px solid #e2e8f0;">
      <td style="padding:8px 10px; font-weight:bold; color:#047857;">Elo (26.2)</td>
      <td style="padding:8px 10px; color:#1e293b;">Adquirente habilita o CNPJ do Subcredenciador no <strong>Portal Operacional Elo</strong>.</td>
      <td style="padding:8px 10px; color:#1e293b;"><strong>Exige envio prévio na Base Cadastral (<code>Registro "01"</code>, <code>"02"</code>, <code>"04"</code>)</strong> validando CPF vs. CNPJ (Pos 45) contra o <code>MCC</code>.</td>
      <td style="padding:8px 10px; color:#1e293b;">Envia <code>DE 42 / DE 43</code> na autorização e registros <code>"00"</code>, <code>"01"</code> e <code>"02"</code> na liquidação (recebendo <code>IRQ</code> no <code>Reg "45"</code>).</td>
    </tr>
    <tr style="background:#f8fafc;">
      <td style="padding:8px 10px; font-weight:bold; color:#0f2c59;">Adquirente, CIP &amp; Registradora</td>
      <td style="padding:8px 10px; color:#1e293b;">Contrato comercial + homologação de API/arquivos + vínculo com CERC/TAG/B3/Nuclea e CIP/SLC.</td>
      <td style="padding:8px 10px; color:#1e293b;">Chama <strong>API de Criação de Recebedor/Seller</strong> na Adquirente com CNPJ/CPF, CNAE/MCC, CEP e Conta Bancária.</td>
      <td style="padding:8px 10px; color:#1e293b;">Envia regra de split da transação &rarr; gera URs na Registradora &rarr; liquida pelas grades <code>ASLC029/031/033</code> na CIP.</td>
    </tr>
  </tbody>
</table>

<h3>3.3. Momento 2 e Momento 3 — Os Dois Atos da Venda: Autorização em Milissegundos (0100) vs. Clearing Noturno (1240 / TC 05)</h3>
<p>
  Agora que o Seller já passou pelo onboarding, o comprador entra no site às 14h32 e clica em "Comprar". Nos sistemas de <strong>Mensagem Dupla (Dual Message System)</strong> usados no Brasil pela Visa, Mastercard e Elo, essa compra acontece em <strong>dois atos completamente separados no tempo e na tecnologia</strong>:
</p>
<ul>
  <li><strong>Ato 1 — A Autorização Online em Tempo Real (<code>ISO 8583 — Mensagem 0100 / Resposta 0110</code>):</strong> Acontece às 14h32, no exato segundo do clique. É um pacote leve e rápido que viaja do Checkout &rarr; Gateway/Adquirente &rarr; Bandeira &rarr; Banco Emissor e volta em menos de 1 segundo. <strong>Atenção a este ponto: na autorização, nenhum centavo sai do lugar!</strong> Ela serve apenas para o Banco Emissor checar se o cartão é válido, se não parece fraude, sensibilizar o limite do cliente e devolver o código de aprovação (<code>DE 38</code>) e o identificador de ciclo de vida (<code>Trace ID — DE 63.2 / TID</code>).</li>
  <li><strong>Ato 2 — A Apresentação Financeira ou Clearing em Lote (<code>Visa Base II TC 05</code>, <code>Mastercard IPM MTI 1240</code> e <code>Arquivo de Liquidação Elo 26.2</code>):</strong> Acontece horas depois (geralmente na janela noturna). Aqui a Adquirente empacota todas as vendas confirmadas do dia em grandes arquivos posicionais recheados de dados fiscais, endereço completo do sublojista (<code>PDS 0178</code> / <code>TCR 1/5</code> / <code>Reg 01</code>) e indicadores de parcelamento, e envia para a Bandeira. <strong>É somente no Clearing que a Bandeira calcula a Tarifa de Intercâmbio, gera a obrigação financeira e roda os robôs de auditoria de integridade de dados (Data Integrity)!</strong></li>
</ul>

<h3>3.4. Por Que Cada Campo de Sublojista Existe e Como Ele Deve Ser Preenchido Byte a Byte</h3>
<p>
  Como vimos no Momento 1, na Visa e na Mastercard você não cadastrou o Seller manualmente no portal da bandeira antes da venda. Por isso, <strong>é a própria mensagem da transação (<code>0100</code> e <code>1240 / TC 05</code>) que apresenta o Seller para o Banco Emissor e para a Bandeira!</strong> Quando a mensagem chega lá, o sistema faz quatro perguntas técnicas:
</p>
<ol>
  <li><strong>"Quem é o intermediador responsável por esta operação?"</strong> &rarr; Respondido pelo <strong><code>PF ID (Payment Facilitator ID)</code></strong> de até 11 dígitos no campo <code>DE 48 SE 37 SF 1</code> (Autorização Mastercard), no <code>PDS 0208</code> (Clearing IPM Mastercard), no <code>DE 62 / TC 05</code> (Visa) e no <code>Registro 02</code> (Elo).</li>
  <li><strong>"Qual é o código único do vendedor (seller) lá na ponta?"</strong> &rarr; Respondido pelo <strong><code>DE 42 (Card Acceptor ID Code / Submerchant ID)</code></strong> de 15 posições alfanuméricas (<code>ans 15</code>).<br/>
    <em>Por que jamais você pode mandar o mesmo <code>DE 42</code> genérico para todos os seus sellers?</em> Porque os motores antifraude dos bancos emissores constroem a reputação histórica de fraude e aprovação combinando o par <code>[PF ID + DE 42]</code>. Se você mandar o mesmo <code>DE 42</code> para 10.000 vendedores, basta um único golpista começar a passar cartões clonados na sua plataforma para o banco emissor enxergar um pico de fraude naquele <code>DE 42</code> e <strong>bloquear as aprovações da sua plataforma inteira</strong>! Além disso, a Mastercard multa automaticamente em <strong>R$ 5.600,00 por mês (evento <code>MCBS 2PN2117</code>)</strong> quem usa um <code>DE 42</code> que não identifica univocamente cada sublojista.</li>
  <li><strong>"O que vai aparecer impresso na fatura e na notificação do celular do cliente?"</strong> &rarr; Respondido pelo <strong><code>DE 43 (Card Acceptor Name/Location — Dynamic Soft Descriptor)</code></strong>.<br/>
    Na mensagem de Autorização (<code>0100</code>), o <code>DE 43</code> tem exatamente <strong>40 posições fixas (<code>ans 40</code>)</strong>. Veja na régua abaixo como cada posição precisa ser montada sem errar um único espaço em branco:</li>
</ol>

<div style="background:#0f172a; color:#f8fafc; border-radius:12px; padding:16px 20px; margin:1.25rem 0; font-family:ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size:11.5px; line-height:1.65; overflow-x:auto;">
  <div style="color:#93c5fd; font-weight:bold; margin-bottom:6px;">RÉGUA POSICIONAL DE 40 BYTES DO DE 43 NA AUTORIZAÇÃO (0100 VISA / MASTERCARD / ELO):</div>
  <div style="color:#94a3b8;">Posições:  01234567890123456789012   23   24567890123456   37   3890</div>
  <div style="color:#fbbf24;">Blocos:    [PREFIXO*NOME_SELLER  ]  [ ]  [CIDADE_SELLER]  [ ]  [PAÍS]</div>
  <div style="color:#4ade80; margin-top:4px;">PayFac:    "MPAGO*LOJADOMARIO     " + " " + "SAO PAULO    " + " " + "BRA"</div>
  <div style="color:#38bdf8;">Mktplace:  "MERCADOLIVRE*PED98412 " + " " + "OSASCO       " + " " + "BRA"</div>
  <div style="color:#cbd5e1; margin-top:6px; border-top:1px solid #334155; padding-top:6px;">
    <strong>Como esse mesmo DE 43 vira 6 subcampos no Clearing IPM Mastercard (Relatório IP755120-AA pág. 2043):</strong><br/>
    Pos 176–258 (83 bytes): SF 1 (Nome PF*Seller) + SF 2 (Endereço Rua) + SF 3 (Cidade)<br/>
    Pos 259–268 (10 bytes): SF 4 (CEP / Postal Code do Seller — ex: "01310100  ")<br/>
    Pos 269–271 (03 bytes): SF 5 (UF / Subdivision Code — ex: "SP ")<br/>
    Pos 272–274 (03 bytes): SF 6 (Código de País ISO Alpha-3 — "BRA")
  </div>
</div>

<p>
  <strong>Cuidado com a armadilha mais comum entre Autorização e Clearing no <code>DE 43</code> e no CEP:</strong><br/>
  Muitas equipes de engenharia preenchem o CEP e a cidade corretamente na mensagem de Autorização (<code>0100</code>), mas, na hora de gerar o lote noturno de Clearing (<code>IPM 1240</code>), o sistema de backoffice puxa o CEP da sede do próprio Marketplace ou manda <code>"00000000"</code> / <code>"UNKNOWN"</code> no endereço do seller. Quando o robô do <em>Mastercard Data Integrity Monitoring Program</em> cruza a autorização com o clearing no relatório <code>IP714010-AA</code>, ele dispara até <strong>quatro multas mensais simultâneas</strong>: <code>2PN2104</code> (CEP inválido na Auth — R$ 5.600), <code>2PN2119</code> (CEP inválido no Clearing — R$ 5.600), <code>2PN2121/2125</code> (Endereço "UNKNOWN" ou inválido — R$ 5.000) e <code>2PN2410</code> (Divergência entre o CEP da Autorização e o CEP do Clearing — R$ 5.600)!
</p>

<ol start="4">
  <li><strong>"Quem é juridicamente o dono daquela venda perante o Fisco e qual é a natureza dele (CNPJ vs. CPF)?"</strong> &rarr; Respondido pelo <strong><code>PDS 0178 (Table 619, pág. 683 do DMC Guide)</code></strong> na Mastercard, pelos registros nacionais <strong><code>TC 05 TCR 0/1/5</code></strong> na Visa e pelo <strong><code>Registro "01" (Posição 45, 14 bytes)</code></strong> na <strong>Elo Release 26.2</strong>.<br/>
    <em>Por que a Elo criou uma trava tão dura na Release 26.2 para CPF vs. CNPJ?</em> Porque no Brasil existem tabelas de intercâmbio incentivadas (mais baratas) pensadas para segmentos empresariais específicos (como supermercados, atacadistas, clínicas médicas ou instituições de ensino). Durante anos, alguns subcredenciadores cadastraram vendedores informais (Pessoa Física com CPF) usando MCCs exclusivos de grandes Pessoas Jurídicas para pagar menos tarifa de intercâmbio ao emissor. Com a Release 26.2, a Elo cruza os 14 bytes do campo <code>CNPJ ou CPF</code> (no Registro 01, pág. 82 do manual de liquidação) com o <code>MCC</code>: se for um CPF de 11 dígitos tentando usar um MCC restrito a PJ, o motor da Elo rejeita o registro ou recalcula automaticamente a tarifa de intercâmbio para o teto cheio, devolvendo o novo código <strong>IRQ (Interchange Rate Qualifier, 8 posições)</strong> nas posições <code>159 a 166 do Registro "45"</code>!</li>
</ol>

<table style="width:100%; border-collapse:collapse; margin:1.5rem 0; font-size:11.5px; border:1px solid #cbd5e1; border-radius:10px; overflow:hidden;">
  <thead>
    <tr style="background:#0f2c59; color:#ffffff;">
      <th style="padding:9px 10px; text-align:left; width:10%;">Bandeira</th>
      <th style="padding:9px 10px; text-align:left; width:19%;">Campo / PDS / Registro &amp; Posição</th>
      <th style="padding:9px 10px; text-align:left; width:13%;">Formato &amp; Tamanho</th>
      <th style="padding:9px 10px; text-align:left; width:36%;">O Que Faz &amp; Como Preencher (Quem Envia &rarr; Quem Recebe)</th>
      <th style="padding:9px 10px; text-align:left; width:22%;">Multa Oficial se Errar</th>
    </tr>
  </thead>
  <tbody>
    <tr style="background:#ffffff; border-bottom:1px solid #e2e8f0;">
      <td style="padding:9px 10px; font-weight:bold; color:#b45309;">Mastercard</td>
      <td style="padding:9px 10px; font-family:monospace; font-weight:bold; color:#0f172a;">Auth: DE 48 SE 37 SF 1<br/>IPM: PDS 0208</td>
      <td style="padding:9px 10px; font-family:monospace;">n ...11<br/>(Até 11 dígitos)</td>
      <td style="padding:9px 10px; color:#1e293b;"><strong>Payment Facilitator ID (PF ID):</strong> Identificador oficial do Subcredenciador/Marketplace registrado na Mastercard. Se houver um ISO comercial intermediário, o ID do ISO vai no <code>SF 2 / PDS 0209</code>.</td>
      <td style="padding:9px 10px; color:#dc2626; font-weight:600;"><code>MCBS 2PN2111</code> (p. 367): <strong>R$ 5.600,00 / mês</strong> por DE 48 inválido ou PF ID não registrado.</td>
    </tr>
    <tr style="background:#f8fafc; border-bottom:1px solid #e2e8f0;">
      <td style="padding:9px 10px; font-weight:bold; color:#b45309;">Mastercard</td>
      <td style="padding:9px 10px; font-family:monospace; font-weight:bold; color:#0f172a;">Auth: DE 48 SE 37 SF 3<br/>Auth/IPM: DE 42<br/>(Pos 161–175 Rel. IP)</td>
      <td style="padding:9px 10px; font-family:monospace;">ans 15<br/>(15 posições)</td>
      <td style="padding:9px 10px; color:#1e293b;"><strong>Submerchant ID &amp; Card Acceptor ID (<code>DE 42</code>):</strong> Código único e exclusivo de cada seller. Permite que o banco emissor aprove ou bloqueie um seller específico sem afetar os demais.</td>
      <td style="padding:9px 10px; color:#dc2626; font-weight:600;"><code>MCBS 2PN2117</code> (p. 369): <strong>R$ 5.600,00 / mês</strong> por DE 42 genérico/repetido; <code>2PN2106</code> se em branco.</td>
    </tr>
    <tr style="background:#ffffff; border-bottom:1px solid #e2e8f0;">
      <td style="padding:9px 10px; font-weight:bold; color:#b45309;">Mastercard</td>
      <td style="padding:9px 10px; font-family:monospace; font-weight:bold; color:#0f172a;">IPM: PDS 0178<br/>(Table 619, p. 683)<br/>SF 1 (Pos 1–3)<br/>SF 2 (Pos 4–201)</td>
      <td style="padding:9px 10px; font-family:monospace;">SF 1: an-3<br/>SF 2: b-198<br/>(Total 201 bytes)</td>
      <td style="padding:9px 10px; color:#1e293b;"><strong>Alternate Merchant / Submerchant Data:</strong> Transporta no clearing o conjunto de caracteres (<code>SF 1</code>) e os dados cadastrais completos do sublojista (<code>SF 2</code>: Nome, Rua, Cidade, UF, CEP, País <code>BRA</code> e CNPJ/CPF).</td>
      <td style="padding:9px 10px; color:#dc2626; font-weight:600;"><code>2PN2104 / 2PN2119</code> (CEP inválido: <strong>R$ 5.600/mês</strong>) e <code>2PN2121 / 2PN2125</code> (Rua inválida ou "UNKNOWN": <strong>R$ 5.000/mês</strong>).</td>
    </tr>
    <tr style="background:#f8fafc; border-bottom:1px solid #e2e8f0;">
      <td style="padding:9px 10px; font-weight:bold; color:#b45309;">Mastercard</td>
      <td style="padding:9px 10px; font-family:monospace; font-weight:bold; color:#0f172a;">Auth/IPM: DE 63 SF 2<br/>(Pos 527–541 Rel. IP)</td>
      <td style="padding:9px 10px; font-family:monospace;">ans 15<br/>(15 posições)</td>
      <td style="padding:9px 10px; color:#1e293b;"><strong>Trace ID (Lifecycle ID):</strong> Identificador do ciclo de vida gerado na autorização (<code>0110</code>). Quando 1 autorização é dividida em várias capturas parciais de clearing (split), todas devem repetir este mesmo Trace ID.</td>
      <td style="padding:9px 10px; color:#dc2626; font-weight:600;"><code>MCBS 2PN2409</code> (p. 378 — <em>Trace ID Error</em>) + downgrade de tarifa de intercâmbio.</td>
    </tr>
    <tr style="background:#ffffff; border-bottom:1px solid #e2e8f0;">
      <td style="padding:9px 10px; font-weight:bold; color:#1e40af;">Visa</td>
      <td style="padding:9px 10px; font-family:monospace; font-weight:bold; color:#0f172a;">Auth: DE 62.4 / DE 104<br/>Base II: TC 05 TCR 0, TCR 1 e TCR 5</td>
      <td style="padding:9px 10px; font-family:monospace;">MVV: an 10<br/>PF ID: n 11<br/>Sub-ID: ans 15</td>
      <td style="padding:9px 10px; color:#1e293b;"><strong>MVV + Payment Facilitator / Marketplace ID + Sub-Merchant Tax ID:</strong> Identifica o Marketplace Qualificado (<code>MVV</code>) ou PayFac (<code>PF ID</code> de 11 dígitos), o <code>CNPJ/CPF</code> do seller no Brasil e o <code>Foreign Retailer Indicator</code> quando o seller é estrangeiro.</td>
      <td style="padding:9px 10px; color:#dc2626; font-weight:600;">Perda do enquadramento de Marketplace + Multa <code>BL 5Z9965656</code> (<strong>R$ 65.000 a R$ 320.000 / URL</strong>).</td>
    </tr>
    <tr style="background:#f8fafc;">
      <td style="padding:9px 10px; font-weight:bold; color:#047857;">Elo (26.2)</td>
      <td style="padding:9px 10px; font-family:monospace; font-weight:bold; color:#0f172a;">Reg "00" (Principal)<br/>Reg "01" Pos 45–58<br/>Reg "02" (Subcred.)<br/>Reg "45" Pos 159–166</td>
      <td style="padding:9px 10px; font-family:monospace;">Reg 01: A 14<br/>(CNPJ/CPF)<br/>Reg 45: an 8 (IRQ)</td>
      <td style="padding:9px 10px; color:#1e293b;"><strong>Segregação PJ vs. PF &amp; Retorno de IRQ (Manual Liquidação Elo 26.2, p. 82):</strong> O <code>Registro "01" (Pos 45, 14 bytes)</code> exige o CNPJ (14 dígitos) ou CPF (11 dígitos) do seller e impede que CPFs usem MCCs exclusivos de PJ. O <code>Registro "45"</code> retorna o <strong>IRQ</strong> recalculado.</td>
      <td style="padding:9px 10px; color:#dc2626; font-weight:600;">Rejeição técnica do lote ou recálculo automático para intercâmbio cheio no <code>Registro 45</code>.</td>
    </tr>
  </tbody>
</table>

<!-- TRÍADE POR TIME: SEÇÃO 3 -->
<div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:12px; margin:1.25rem 0; font-size:12px; line-height:1.55;">
  <div style="background:#eff6ff; border:1px solid #bfdbfe; border-top:4px solid #2563eb; border-radius:10px; padding:12px 14px;">
    <strong style="color:#1e40af; display:block; margin-bottom:6px; font-size:12.5px;">💼 Para o Time de Negócios &amp; Operações</strong>
    <p style="margin:0; color:#1e293b;">
      Cobre da Adquirente Patrocinadora os números oficiais do <code>PF ID</code> (Mastercard) e do <code>Agent Unique ID / MVV</code> (Visa) gerados nos portais <em>Mastercard Connect</em> e <em>Visa Online</em> antes do Go-Live. Além disso, defina junto ao Marketing o prefixo curto da marca (3 a 7 letras + <code>*</code>) para caber nos 22 bytes do nome na fatura.
    </p>
  </div>
  <div style="background:#f5f3ff; border:1px solid #ddd6fe; border-top:4px solid #7c3aed; border-radius:10px; padding:12px 14px;">
    <strong style="color:#5b21b6; display:block; margin-bottom:6px; font-size:12.5px;">🧭 Para o Time de Produto (Onboarding)</strong>
    <p style="margin:0; color:#1e293b;">
      No formulário de cadastro do Seller, torne obrigatórios: (1) validação do CEP nos Correios (proibindo CEPs zerados); (2) campo de "Nome na Fatura" limitado a 14 caracteres ASCII sem acento; e (3) trava automática que esconde categorias (MCCs) empresariais quando o vendedor seleciona cadastro por <strong>CPF</strong> (evitando rejeição na Elo 26.2).
    </p>
  </div>
  <div style="background:#ecfdf5; border:1px solid #a7f3d0; border-top:4px solid #059669; border-radius:10px; padding:12px 14px;">
    <strong style="color:#065f46; display:block; margin-bottom:6px; font-size:12.5px;">⚙️ Para o Time Técnico (Engenharia)</strong>
    <p style="margin:0; color:#1e293b;">
      Salve um <strong>snapshot imutável</strong> do endereço, CEP, cidade, UF, MCC e <code>DE 42</code> do seller no momento da autorização (<code>0100</code>), juntamente com o <code>Trace ID (DE 63.2)</code> retornado na <code>0110</code>. Quando o job noturno montar o arquivo de clearing (<code>IPM 1240</code> / <code>TC 05</code>), leia desse snapshot para garantir paridade de 100% e zero multa no <code>IP714010-AA</code>.
    </p>
  </div>
</div>

<!-- =====================================================================
     SEÇÃO 4: A ARQUITETURA DO SPLIT, A CONTA REAL E O NOVO VISA VSS 2026
     ===================================================================== -->
<h2>4. A Engenharia Financeira do Split: Captura Única vs. Captura Parcial e a Conta Real de R$ 500,00</h2>

<p>
  Agora que entendemos os papéis e os campos da mensageria, vamos responder à dúvida mais importante de arquitetura e finanças: <strong>quando o cliente faz uma compra com produtos de dois ou mais sellers no mesmo carrinho, onde exatamente nós devemos dividir (fazer o split) essa transação?</strong>
</p>
<p>
  Existem dois lugares completamente diferentes onde você pode fazer essa divisão, e a escolha entre eles muda drasticamente o seu custo com a bandeira, especialmente depois da mudança global que a Visa implementou em 2026 no relatório <code>VSS-140</code> (o chamado <strong>De-Para 1&rarr;20 por Faixa de Ticket</strong>).
</p>

<h3>4.1. Os Dois Desenhos de Engenharia de Split</h3>
<ul>
  <li>
    <strong>Desenho A — Autorização Única + Clearing Único + Split apenas na Liquidação/UR (O Desenho Campeão para Marketplace Qualificado):</strong><br/>
    O consumidor compra R$ 500,00 (sendo R$ 300 do Seller A e R$ 200 do Seller B). Você manda <strong>uma única mensagem <code>0100</code> de R$ 500,00</strong> e, à noite, manda <strong>um único registro de clearing (<code>TC 05</code> ou <code>IPM 1240</code>) de R$ 500,00</strong> usando o <code>MCC 5262</code> e o <code>MVV</code> do seu Marketplace. Para a bandeira e para a fatura do cartão do cliente, existiu apenas <strong>uma transação de R$ 500,00</strong>.<br/>
    <em>E como os sellers recebem separado?</em> Paralelamente ao clearing, o seu sistema manda a instrução de split para o motor de agenda da Adquirente (ou do seu Subcredenciador), que cria duas Unidades de Recebíveis (URs) separadas nas Registradoras e liquida R$ 258 para o CNPJ do Seller A e R$ 172 para o CNPJ do Seller B na CIP/SLC!<br/>
    <em>Por que esse desenho é muito mais barato?</em> Porque a bandeira cobra tarifas de processamento de rede <strong>por registro de clearing apresentado</strong>. Se um carrinho tem 4 sellers e você manda 1 único registro de clearing, você paga <strong>1 tarifa de clearing</strong>.
  </li>
  <li style="margin-top:0.6rem;">
    <strong>Desenho B — 1 Pré-Autorização + <em>N</em> Capturas Parciais no Clearing (Multiple Partial Captures):</strong><br/>
    Você manda <strong>1 pré-autorização (<code>0100</code>) de R$ 500,00</strong> para garantir o limite total do cartão do cliente. Porém, na hora de fazer o clearing noturno, você quebra aquela autorização mãe em <strong>2 registros separados de clearing</strong>: um <code>TC 05 / 1240</code> de R$ 300,00 (com o <code>DE 42</code>, o <code>MCC</code> e o <code>CNPJ</code> do Seller A) e outro <code>TC 05 / 1240</code> de R$ 200,00 (com o <code>DE 42</code>, o <code>MCC</code> e o <code>CNPJ</code> do Seller B), amarrando os dois pelo mesmo <code>Trace ID (DE 63.2)</code> e pelo contador de sequência (<em>Multiple Clearing Sequence Number</em>: captura 1 de 2, captura 2 de 2).<br/>
    <em>Quando você é obrigado a usar esse Desenho B?</em> Em duas situações: (1) quando você não é um Marketplace Qualificado sob o MCC 5262 e precisa aplicar o MCC individual de cada seller para apurar o intercâmbio exato de cada categoria; ou (2) quando os produtos são despachados em datas muito distantes e você só quer capturar financeiramente a parte de cada seller quando a mercadoria dele for enviada.
  </li>
</ul>

<h3>4.2. O Efeito do Split no Novo Tarifário Visa VSS 2026 (De-Para 1&rarr;20 por Faixa de Ticket)</h3>
<p>
  Até 2025, a Visa cobrava o processamento de rede (Base I e Base II) através de linhas tarifárias únicas por transação, independentemente de a compra ser de R$ 15 ou de R$ 500. Em 2026, a Visa reestruturou globalmente <strong>53 linhas clássicas de faturamento</strong>, transformando cada uma delas em <strong>20 novas Billing Lines (totalizando 1.160 códigos novos)</strong> divididas por Canal (Presencial <code>CP</code> vs. Online <code>CNP</code>), Produto (Débito/Pré-Pago vs. Crédito) e <strong>5 Faixas de Ticket Médio em Dólar (USD)</strong>:
</p>

<table style="width:100%; border-collapse:collapse; margin:1.25rem 0; font-size:12px; border:1px solid #cbd5e1; border-radius:10px; overflow:hidden;">
  <thead>
    <tr style="background:#1e3a8a; color:#ffffff;">
      <th style="padding:9px 12px; text-align:left;">Faixa de Ticket (USD)</th>
      <th style="padding:9px 12px; text-align:left;">Equivalente Aprox. (BRL @ 6,46)</th>
      <th style="padding:9px 12px; text-align:left;">Exemplo Código Base II (CNP Crédito)</th>
      <th style="padding:9px 12px; text-align:left;">Linha Espelho de Desconto</th>
      <th style="padding:9px 12px; text-align:left;">O Que Acontece Quando Você Quebra o Carrinho no Base II</th>
    </tr>
  </thead>
  <tbody>
    <tr style="background:#ffffff; border-bottom:1px solid #e2e8f0;">
      <td style="padding:8px 12px; font-weight:bold; color:#0f2c59;">Faixa 1: $0.00 &ndash; $2.00</td>
      <td style="padding:8px 12px;">Até R$ 12,90</td>
      <td style="padding:8px 12px; font-family:monospace; color:#1e40af; font-weight:bold;">2E0150AA14</td>
      <td style="padding:8px 12px; font-family:monospace; color:#047857;">2E0150AA99</td>
      <td style="padding:8px 12px; color:#334155;">Se você separar o frete ou a comissão num registro de clearing próprio, ele cai nesta faixa de micro-ticket.</td>
    </tr>
    <tr style="background:#f8fafc; border-bottom:1px solid #e2e8f0;">
      <td style="padding:8px 12px; font-weight:bold; color:#0f2c59;">Faixa 2: $2.01 &ndash; $5.00</td>
      <td style="padding:8px 12px;">R$ 12,91 a R$ 32,30</td>
      <td style="padding:8px 12px; font-family:monospace; color:#1e40af; font-weight:bold;">2E0150AA15</td>
      <td style="padding:8px 12px; font-family:monospace; color:#047857;">2E0150AA99</td>
      <td style="padding:8px 12px; color:#334155;">Itens baratos desmembrados de um carrinho grande geram cobrança individual aqui.</td>
    </tr>
    <tr style="background:#ffffff; border-bottom:1px solid #e2e8f0;">
      <td style="padding:8px 12px; font-weight:bold; color:#0f2c59;">Faixa 3: $5.01 &ndash; $15.00</td>
      <td style="padding:8px 12px;">R$ 32,31 a R$ 97,00</td>
      <td style="padding:8px 12px; font-family:monospace; color:#1e40af; font-weight:bold;">2E0150AA16</td>
      <td style="padding:8px 12px; font-family:monospace; color:#047857;">2E0150AA99</td>
      <td style="padding:8px 12px; color:#334155;">Um carrinho de R$ 240 dividido entre 4 sellers (R$ 60 cada) paga 4x a tarifa desta faixa 3.</td>
    </tr>
    <tr style="background:#f8fafc; border-bottom:1px solid #e2e8f0;">
      <td style="padding:8px 12px; font-weight:bold; color:#0f2c59;">Faixa 4: $15.01 &ndash; $50.00</td>
      <td style="padding:8px 12px;">R$ 97,01 a R$ 323,40</td>
      <td style="padding:8px 12px; font-family:monospace; color:#1e40af; font-weight:bold;">2E0150AA17</td>
      <td style="padding:8px 12px; font-family:monospace; color:#047857;">2E0150AA99</td>
      <td style="padding:8px 12px; color:#334155;">Faixa onde cai a maioria dos pedidos consolidados de e-commerce no Brasil.</td>
    </tr>
    <tr style="background:#ffffff;">
      <td style="padding:8px 12px; font-weight:bold; color:#0f2c59;">Faixa 5: &gt; $50.00</td>
      <td style="padding:8px 12px;">Acima de R$ 323,40</td>
      <td style="padding:8px 12px; font-family:monospace; color:#1e40af; font-weight:bold;">2E0150AA18</td>
      <td style="padding:8px 12px; font-family:monospace; color:#047857;">2E0150AA99</td>
      <td style="padding:8px 12px; color:#334155;">Carrinhos acima de R$ 323,40 processados em captura única pagam apenas 1 item aqui.</td>
    </tr>
  </tbody>
</table>

<h3>4.3. A Conta Real Aberta Centavo por Centavo (Exemplo de R$ 500,00 com 2 Sellers)</h3>
<p>
  Vamos abrir o livro contábil de uma venda real para ver exatamente para onde vai cada real pago pelo consumidor e como o Marketplace ganha dinheiro em duas camadas (na comissão comercial e no spread financeiro de pagamentos), sem cair no erro de bitributação fiscal:
</p>

<div style="background:#f0fdf4; border:1px solid #bbf7d0; border-left:5px solid #16a34a; border-radius:12px; padding:18px 22px; margin:1.25rem 0; font-size:12.5px; line-height:1.7;">
  <strong style="color:#15803d; font-size:14px; display:block; margin-bottom:8px;">🧮 ANATOMIA FINANCEIRA DE UMA VENDA DE R$ 500,00 (CRÉDITO À VISTA — 2 SELLERS)</strong>
  <p style="margin:0 0 10px 0; color:#1e293b;">
    Imagine que o cliente passou um cartão Mastercard Platinum de <strong>R$ 500,00</strong> no seu Marketplace comprando dois itens: um fone de ouvido do <strong>Seller A por R$ 300,00 (60% do carrinho)</strong> e uma mochila do <strong>Seller B por R$ 200,00 (40% do carrinho)</strong>. No contrato comercial que você assinou com seus sellers, você cobra uma taxa total de <strong>14,00%</strong> sobre cada venda — sendo <strong>11,00% de Comissão de Intermediação (Take Rate Comercial)</strong> e <strong>3,00% de Taxa de Processamento de Pagamento (MDR)</strong>. Veja o caminho do dinheiro:
  </p>
  <ol style="margin:0; padding-left:18px; color:#0f172a;">
    <li><strong>No Banco Emissor (Retenção do Intercâmbio na Fonte):</strong><br/>
      O banco que emitiu o cartão do comprador debita R$ 500,00 da fatura do cliente, mas não entrega R$ 500,00 para a bandeira. Ele já retém na fonte a <strong>Tarifa de Intercâmbio (TIC)</strong> — digamos, <code>1,70% = R$ 8,50</code> — para remunerar o risco de crédito e o programa de pontos do cartão. O Emissor envia para a compensação da Bandeira <strong>R$ 491,50</strong>.</li>
    <li><strong>Na Bandeira (Cobrança das Scheme Fees no VSS / MCBS):</strong><br/>
      Pelo uso dos trilhos da rede, a Bandeira fatura contra a Adquirente as taxas de volume (<em>Assessment / Marketing Fee</em>), taxa de autorização e taxa de clearing (aproximadamente <code>0,22% = R$ 1,10</code>). Somando Emissor (R$ 8,50) + Bandeira (R$ 1,10), o custo puro de rede da transação foi de <strong>R$ 9,60 (1,92%)</strong>.</li>
    <li><strong>Na Adquirente Patrocinadora (Margem de Adquirência):</strong><br/>
      A Adquirente cobra o seu spread de processamento (digamos, <code>0,18% = R$ 0,90</code>). Portanto, o custo total de adquirência no modelo <em>Interchange++</em> foi de <strong>R$ 10,50 (2,10% sobre R$ 500,00)</strong>. A Adquirente entrega para a liquidação do ecossistema do Marketplace exatamente <strong>R$ 489,50 líquidos</strong>.</li>
    <li><strong>Na Liquidação das URs de Cada Seller (via Registradora e CIP/SLC):</strong><br/>
      &bull; O <strong>Seller A</strong> vendeu R$ 300,00. Descontando os 14% contratados (R$ 42,00), a UR dele recebe <strong>R$ 258,00 líquidos</strong> na sua conta bancária.<br/>
      &bull; O <strong>Seller B</strong> vendeu R$ 200,00. Descontando os 14% contratados (R$ 28,00), a UR dele recebe <strong>R$ 172,00 líquidos</strong> na sua conta bancária.<br/>
      &bull; Total depositado nas contas dos dois sellers: <code>R$ 258,00 + R$ 172,00 = R$ 430,00</code>.</li>
    <li><strong>No Caixa e na Contabilidade do Marketplace (Onde Você Ganha e Como Não Pagar Imposto Errado):</strong><br/>
      Dos <strong>R$ 489,50</strong> que saíram da Adquirente, depois de entregar <strong>R$ 430,00</strong> aos sellers, sobraram líquidos na conta do Marketplace <strong>R$ 59,50 (11,90% do GMV)</strong>. Olhe como esses R$ 59,50 são formados:<br/>
      &bull; <strong>R$ 55,00 (11,00% de R$ 500)</strong> são a sua <strong>Receita de Intermediação Comercial (Take Rate)</strong>.<br/>
      &bull; <strong>R$ 4,50 (+0,90% / +90 bps sobre R$ 500)</strong> são o seu <strong>Lucro Financeiro de Pagamentos</strong>, porque você cobrou 3,00% de MDR dos sellers (R$ 15,00) e pagou apenas 2,10% de custo total (R$ 10,50) para a Adquirente/Bandeira/Emissor!<br/>
      &bull; <strong>A Regra de Ouro Tributária (DIMP e Reforma Tributária IBS/CBS):</strong> O seu Marketplace <strong>nunca</strong> pode emitir nota fiscal nem contabilizar como receita bruta os R$ 500,00 inteiros (pois R$ 430,00 pertencem aos sellers e apenas transitaram patrimonialmente). Quem emite a NF-e da mercadoria para o consumidor final são os Sellers A (R$ 300) e B (R$ 200); o Marketplace emite apenas Nota Fiscal de Serviço (NFSe) contra os sellers sobre a comissão retida, evitando pagar PIS/COFINS/ISS sobre o dinheiro alheio!</li>
  </ol>
</div>

<!-- TRÍADE POR TIME: SEÇÃO 4 -->
<div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:12px; margin:1.25rem 0; font-size:12px; line-height:1.55;">
  <div style="background:#eff6ff; border:1px solid #bfdbfe; border-top:4px solid #2563eb; border-radius:10px; padding:12px 14px;">
    <strong style="color:#1e40af; display:block; margin-bottom:6px; font-size:12.5px;">💼 Para o Time de Negócios &amp; Finanças</strong>
    <p style="margin:0; color:#1e293b;">
      Negocie com a Adquirente o contrato no modelo <strong>Interchange++</strong> (custo aberto de intercâmbio + bandeira + spread fixo da adquirente) em vez de MDR fechado flat. No contrato do seller, separe claramente a <strong>Taxa de Intermediação</strong> da <strong>Taxa de Processamento</strong> e emita NFSe apenas sobre os seus R$ 59,50.
    </p>
  </div>
  <div style="background:#f5f3ff; border:1px solid #ddd6fe; border-top:4px solid #7c3aed; border-radius:10px; padding:12px 14px;">
    <strong style="color:#5b21b6; display:block; margin-bottom:6px; font-size:12.5px;">🧭 Para o Time de Produto (Checkout &amp; Extrato)</strong>
    <p style="margin:0; color:#1e293b;">
      No Portal do Seller, exiba o extrato de cada venda aberto em 3 colunas: <code>Valor Bruto da Venda (R$ 300)</code>, <code>(-) Comissão &amp; Taxa de Pagamento (R$ 42)</code> e <code>(=) Valor Líquido da Agenda/UR (R$ 258)</code>. Se o cliente cancelar apenas o item do Seller A (R$ 300), o estorno deve abater proporcionalmente apenas a UR do Seller A.
    </p>
  </div>
  <div style="background:#ecfdf5; border:1px solid #a7f3d0; border-top:4px solid #059669; border-radius:10px; padding:12px 14px;">
    <strong style="color:#065f46; display:block; margin-bottom:6px; font-size:12.5px;">⚙️ Para o Time Técnico (Motor de Split)</strong>
    <p style="margin:0; color:#1e293b;">
      Trate sempre o <strong>arredondamento de centavos</strong> no split (ex.: R$ 100 divididos por 3 sellers = R$ 33,33 + R$ 33,33 + R$ 33,34): a soma das partes enviadas no array <code>split_rules</code> da API tem que bater <strong>exatamente até o último centavo</strong> com o <code>amount</code> capturado no clearing, ou a Adquirente rejeita a liquidação inteira.
    </p>
  </div>
</div>

<!-- =====================================================================
     SEÇÃO 5: CUSTOS E REGISTROS OFICIAIS DAS BANDEIRAS NO BRASIL (R$)
     ===================================================================== -->
<h2>5. Quanto Custa Registrar e Operar nas Bandeiras no Brasil? (Preços Reais Auditados 2026 em R$)</h2>

<p>
  Uma das maiores dificuldades de quem monta o plano financeiro (<em>business plan</em>) de um Marketplace ou Subcredenciador no Brasil sempre foi descobrir os preços reais cobrados pelas bandeiras, porque historicamente esses valores ficavam escondidos em manuais em dólar restritos aos bancos e adquirentes.
</p>
<p>
  Em <strong>1º de março de 2026</strong>, a Visa do Brasil concluiu a nacionalização completa da sua tabela de tarifas e multas (<em>Visa Brazil Fee Schedule — VOIP</em>) para <strong>Reais (<code>R$</code>)</strong>, estabelecendo que todas as cobranças domésticas são faturadas no portal VOIP no <strong>4º dia útil de cada mês</strong>, vencem no <strong>10º dia útil</strong> e sofrem reajuste automático anual pelo <strong>IPCA todo dia 1º de março</strong>. Da mesma forma, a Mastercard publica seus preços oficiais em Reais no <strong>Manual MCBS Brasil (Edição 13.2)</strong>.
</p>
<p>
  Veja abaixo quanto custa cada licença, registro de agente e ferramenta de prevenção/cofre, e <strong>por que</strong> cada uma dessas cobranças existe:
</p>

<table style="width:100%; border-collapse:collapse; margin:1.5rem 0; font-size:12px; border:1px solid #cbd5e1; border-radius:10px; overflow:hidden;">
  <thead>
    <tr style="background:#065f46; color:#ffffff;">
      <th style="padding:9px 10px; text-align:left; width:11%;">Bandeira</th>
      <th style="padding:9px 10px; text-align:left; width:17%;">Código Oficial na Fatura</th>
      <th style="padding:9px 10px; text-align:left; width:32%;">O Que É Esta Cobrança e Por Que Ela É Exigida</th>
      <th style="padding:9px 10px; text-align:left; width:19%;">Valor Oficial no Brasil (R$)</th>
      <th style="padding:9px 10px; text-align:left; width:21%;">Quando e De Quem É Cobrado</th>
    </tr>
  </thead>
  <tbody>
    <tr style="background:#ffffff; border-bottom:1px solid #e2e8f0;">
      <td style="padding:8px 10px; font-weight:bold; color:#1e40af;">Visa</td>
      <td style="padding:8px 10px; font-family:monospace; font-weight:bold;">BL 5Q6562026<br/>BL 5Q6562027<br/>BL 5Q6562028</td>
      <td style="padding:8px 10px; color:#0f172a;"><strong>Registro Inicial e Renovação Anual de Agente (PF / HRIPF / ISO / SDWO / DCV):</strong> É a licença obrigatória para existir oficialmente como Payment Facilitator, High-Risk Internet PF, ISO ou Carteira Digital na VisaNet e receber seu código PF ID / MVV.</td>
      <td style="padding:8px 10px; font-weight:bold; color:#047857;">R$ 32.000,00<br/><span style="font-size:10.5px; color:#64748b; font-weight:normal;">(Por Agente / Ano)</span></td>
      <td style="padding:8px 10px; color:#334155;">No credenciamento inicial e a cada renovação anual (faturado contra a Adquirente patrocinadora e repassado ao PayFac).</td>
    </tr>
    <tr style="background:#f8fafc; border-bottom:1px solid #e2e8f0;">
      <td style="padding:8px 10px; font-weight:bold; color:#1e40af;">Visa</td>
      <td style="padding:8px 10px; font-family:monospace; font-weight:bold;">BL 5Q6562026<br/>BL 5Q6562029</td>
      <td style="padding:8px 10px; color:#0f172a;"><strong>Registro Inicial e Renovação Anual de Gateway / Cofre (ESO / TPS):</strong> Para empresas que atuam apenas como provedor tecnológico (sem tocar no dinheiro), armazenando ou roteando dados de cartão.</td>
      <td style="padding:8px 10px; font-weight:bold; color:#047857;">R$ 6.500,00<br/><span style="font-size:10.5px; color:#64748b; font-weight:normal;">(Por Agente / Ano)</span></td>
      <td style="padding:8px 10px; color:#334155;">No registro inicial e na renovação anual.</td>
    </tr>
    <tr style="background:#ffffff; border-bottom:1px solid #e2e8f0;">
      <td style="padding:8px 10px; font-weight:bold; color:#1e40af;">Visa</td>
      <td style="padding:8px 10px; font-family:monospace; font-weight:bold;">BL 5Q6562026<br/>BL 5Q6562028</td>
      <td style="padding:8px 10px; color:#0f172a;"><strong>Transferência de Agente / Carteira (BIN Transfer / Portfolio Sale):</strong> Quando o PayFac troca de Adquirente patrocinadora ou vende sua carteira para outra instituição.</td>
      <td style="padding:8px 10px; font-weight:bold; color:#047857;">R$ 3.200,00<br/><span style="font-size:10.5px; color:#64748b; font-weight:normal;">(Grátis em fusão/mesma holding)</span></td>
      <td style="padding:8px 10px; color:#334155;">Por evento de transferência (cobrado da Adquirente recebedora).</td>
    </tr>
    <tr style="background:#f8fafc; border-bottom:1px solid #e2e8f0;">
      <td style="padding:8px 10px; font-weight:bold; color:#b45309;">Mastercard</td>
      <td style="padding:8px 10px; font-family:monospace; font-weight:bold;">MCBS 2SC1812<br/>MCBS 2SC1827</td>
      <td style="padding:8px 10px; color:#0f172a;"><strong>Global Member Service Provider (MSP / PayFac) Registration &amp; Renewal (pág. 427):</strong> Licença oficial na Mastercard para operar como Subcredenciador/Marketplace em programas Mastercard, Cirrus e Maestro.</td>
      <td style="padding:8px 10px; font-weight:bold; color:#047857;">Inicial: R$ 18.135,00<br/>Renovação: R$ 9.067,50</td>
      <td style="padding:8px 10px; color:#334155;">No registro inicial (<code>2SC1812</code>) e na renovação anual (<code>2SC1827</code>) por Adquirente patrocinadora.</td>
    </tr>
    <tr style="background:#ffffff; border-bottom:1px solid #e2e8f0;">
      <td style="padding:8px 10px; font-weight:bold; color:#b45309;">Mastercard</td>
      <td style="padding:8px 10px; font-family:monospace; font-weight:bold;">MCBS 2FL1892<br/>MCBS 2FL1897</td>
      <td style="padding:8px 10px; color:#0f172a;"><strong>MSP Debit Registration &amp; Renewal Fees (pág. 100):</strong> Taxa específica quando o registro do MSP é dedicado ao arranjo de Débito/Maestro.</td>
      <td style="padding:8px 10px; font-weight:bold; color:#047857;">Inicial: R$ 9.068,00<br/>Renovação: R$ 5.441,00</td>
      <td style="padding:8px 10px; color:#334155;">Inicial + Anual.</td>
    </tr>
    <tr style="background:#f8fafc; border-bottom:1px solid #e2e8f0;">
      <td style="padding:8px 10px; font-weight:bold; color:#b45309;">Mastercard</td>
      <td style="padding:8px 10px; font-family:monospace; font-weight:bold;">MCBS 2NB00011<br/>MCBS 2NB0016</td>
      <td style="padding:8px 10px; color:#0f172a;"><strong>Sistema MATCH™ (Member Alert to Control High-Risk Merchants — pág. 318–319):</strong> É a "lista negra" global da Mastercard. Antes de aprovar o cadastro de qualquer novo Seller no seu Marketplace/PayFac, você é obrigado a consultar o CNPJ dele e o CPF dos sócios no MATCH para saber se ele já foi banido por fraude por outro adquirente.</td>
      <td style="padding:8px 10px; font-weight:bold; color:#047857;">Fixo: R$ 3.200,00 / trim<br/>API: R$ 0,20 / consulta<br/><span style="font-size:10px; color:#64748b; font-weight:normal;">(Tier 1 a 999 consultas)</span></td>
      <td style="padding:8px 10px; color:#334155;">Assinatura trimestral + R$ 0,20 por seller consultado via API no onboarding.</td>
    </tr>
    <tr style="background:#ffffff; border-bottom:1px solid #e2e8f0;">
      <td style="padding:8px 10px; font-weight:bold; color:#1e40af;">Visa / MC</td>
      <td style="padding:8px 10px; font-family:monospace; font-weight:bold;">BL 5D0210234<br/>BL 5W2221009<br/>MCBS 2SC6602</td>
      <td style="padding:8px 10px; color:#0f172a;"><strong>Serviços de Cofre, Verificação de Titular (ANI) e Atualizador Automático de Cartão (ABU / OBO):</strong> Quando um cliente salva o cartão para compra com 1-clique no Marketplace e o cartão vence ou é reemitido pelo banco, o ABU/VAU atualiza o número automaticamente sem perder a venda.</td>
      <td style="padding:8px 10px; font-weight:bold; color:#047857;">ANI: R$ 0,32 / consulta<br/>OBO: R$ 0,10 / update<br/>ABU MC: R$ 0,13 / match</td>
      <td style="padding:8px 10px; color:#334155;">Mensal por cartão verificado ou atualizado com sucesso no cofre.</td>
    </tr>
    <tr style="background:#f8fafc;">
      <td style="padding:8px 10px; font-weight:bold; color:#1e40af;">Visa</td>
      <td style="padding:8px 10px; font-family:monospace; font-weight:bold;">BL 5W2200013<br/>BL 5W2221007</td>
      <td style="padding:8px 10px; color:#0f172a;"><strong>Certificação Direta no Visa Token Service (VTS) &amp; SDK Digital Enablement:</strong> Apenas se o Marketplace decidir se conectar diretamente à Visa como <em>Token Requestor</em> próprio (se usar a tokenização pronta da Adquirente, você não paga esta certificação direta).</td>
      <td style="padding:8px 10px; font-weight:bold; color:#047857;">Cert. Ecomm: R$ 323.000<br/>TLCM: R$ 3.234 / mês<br/><span style="font-size:10.5px; color:#dc2626; font-weight:bold;">(05/2027 SDK &gt;$5B: R$ 5.168.000/ano)</span></td>
      <td style="padding:8px 10px; color:#334155;">Taxa única de certificação direta + mensalidade de gestão de ciclo de vida (TLCM).</td>
    </tr>
  </tbody>
</table>

<!-- =====================================================================
     SEÇÃO 6: OS PROGRAMAS DE MONITORIA (VAMP / ECP / BRAM) E AS MULTAS REAIS
     ===================================================================== -->
<h2>6. A Malha Fina das Bandeiras: Como Funcionam o VAMP, o ECP, o BRAM e Todas as Multas em Reais (R$)</h2>

<p>
  Aqui chegamos ao ponto onde muitas operações de Marketplace e Subcredenciamento quebram financeiramente por desconhecimento técnico. Quando você opera debaixo de um <code>PF ID</code> ou <code>MVV</code>, as bandeiras te fiscalizam por três radares independentes que rodam todos os meses:
</p>
<ol>
  <li><strong>Radar 1 — O Radar de Fraude e Chargeback (Visa VAMP e Mastercard ECP/EFM):</strong> Mede se os seus sellers estão gerando um volume excessivo de fraudes e contestações para os bancos emissores.</li>
  <li><strong>Radar 2 — O Radar de Qualidade e Integridade de Dados (Mastercard Data Integrity Monitoring Program):</strong> Mede se o seu switch/gateway está preenchendo algum campo obrigatório (como <code>DE 42</code>, <code>DE 43</code>, <code>DE 48</code> ou CEP) fora do padrão técnico.</li>
  <li><strong>Radar 3 — O Radar de Crime e Risco à Marca (Mastercard BRAM e Visa High-Brand Risk / Sponsored Merchant URL):</strong> Robôs de varredura web (<em>web crawlers</em>) e compras misteriosas das bandeiras que vasculham se algum seller hospedado no seu Marketplace ou PayFac está vendendo produtos falsificados, IPTV pirata, remédios proibidos ou apostas ilegais.</li>
</ol>

<h3>6.1. Entendendo a Nova Fórmula Unificada do VAMP (Visa Acquirer Monitoring Program)</h3>
<p>
  Historicamente, a Visa tinha dois programas separados: um que olhava só para avisos de fraude (VFMP — baseado nos registros <code>TC 40</code> enviados pelos emissores) e outro que olhava só para disputas/chargebacks (VDMP — baseado nos registros <code>TC 15</code>). Recentemente, a Visa extinguiu a separação entre os dois e criou o <strong>VAMP (Visa Acquirer Monitoring Program)</strong>, unificando fraude e disputa numa única conta mensal:
</p>

<div style="background:#fef2f2; border:1px solid #fecaca; border-left:5px solid #dc2626; border-radius:12px; padding:16px 20px; margin:1.25rem 0; font-size:12.5px; line-height:1.65;">
  <strong style="color:#991b1b; font-size:13.5px; display:block; margin-bottom:6px;">📐 COMO A VISA CALCULA O SEU ÍNDICE NO VAMP TODO MÊS:</strong>
  <code style="display:block; background:#ffffff; border:1px solid #fca5a5; padding:10px 14px; border-radius:8px; color:#7f1d1d; font-weight:bold; font-size:12.5px; margin:8px 0;">
    VAMP Ratio (%) = [ Total de Fraudes Reportadas (TC 40) + Disputas Não-Fraude (TC 15 Códigos 11, 12 e 13) ] &divide; [ Total de Vendas Liquidadas no Mês (TC 05) ]
  </code>
  <p style="margin:6px 0 6px 0; color:#1e293b;">
    <strong>Por que a fórmula soma <code>TC 40</code> com <code>TC 15 Não-Fraude</code>?</strong> Porque quando um portador liga para o banco dizendo que o cartão foi clonado, o banco emissor registra um aviso de fraude (<code>TC 40</code>) e também abre um chargeback de fraude (<code>TC 15</code> código 10.4). Para não contar a mesma transação duas vezes, a Visa pega todos os avisos de fraude (<code>TC 40</code>) e soma apenas com os chargebacks que <strong>não</strong> são de fraude (ou seja, Código 11 = Erro de Autorização, Código 12 = Erro de Processamento e Código 13 = Desacordo Comercial, como mercadoria não entregue ou com defeito!), dividindo tudo pelo total de compras capturadas no mês (<code>TC 05</code>).
  </p>
  <ul style="margin:0; padding-left:18px; color:#1e293b;">
    <li><strong>A Regra no Marketplace:</strong> Se um seller atrasar entregas e gerar centenas de chargebacks de desacordo comercial (Código 13.1), <strong>isso agora entra direto na mesma conta do VAMP junto com a fraude!</strong></li>
    <li><strong>Os Tetos (Thresholds) que Disparam Multa e Auditoria:</strong> No nível individual do <em>Merchant / Submerchant</em>, o teto <em>Excessive</em> é de <strong>1,50% (150 bps)</strong> (com cronograma de redução para 0,90%). Já no nível da carteira inteira do <em>Adquirente / PayFac</em>, o alerta <em>Above Standard</em> começa em <strong>0,50% (50 bps)</strong> (caindo para 0,30%) e o nível crítico <em>Excessive</em> bate em <strong>0,70% (70 bps)</strong> (caindo para 0,50%).</li>
    <li><strong>E como funciona na Mastercard (Excessive Chargeback Program — ECP, eventos <code>2SC1380 a 2SC1387</code>)?</strong> Na Mastercard, um sublojista entra na categoria <strong>CMM (Chargeback Monitored Merchant)</strong> quando acumula pelo menos <strong>100 chargebacks no mês E índice &ge; 1,00% (100 bps)</strong>, e sobe para a categoria crítica <strong>ECM (Excessive Chargeback Merchant)</strong> quando atinge <strong>100 chargebacks no mês E índice &ge; 1,50% (150 bps)</strong>.</li>
  </ul>
</div>

<h3>6.2. A Tabela Completa de Multas Mensais por Erro de Mensageria (Mastercard Data Integrity — MCBS Ed. 13.2)</h3>
<p>
  Diferente das multas de fraude, as multas do <em>Data Integrity Monitoring Program</em> não dependem de reclamação do portador: o próprio sistema central da Mastercard analisa todas as mensagens de autorização e todos os lotes de clearing que você enviou no mês, lista os erros no relatório <code>IP714010-AA</code> e debita automaticamente na fatura MCBS do Adquirente entre <strong>R$ 5.000,00 e R$ 5.600,00 por mês para cada regra violada</strong>:
</p>

<table style="width:100%; border-collapse:collapse; margin:1.25rem 0; font-size:11.5px; border:1px solid #fecaca; border-radius:10px; overflow:hidden;">
  <thead>
    <tr style="background:#991b1b; color:#ffffff;">
      <th style="padding:9px 10px; text-align:left; width:14%;">Código MCBS &amp; Pág.</th>
      <th style="padding:9px 10px; text-align:left; width:28%;">Nome Oficial da Penalidade</th>
      <th style="padding:9px 10px; text-align:left; width:40%;">O Erro Técnico Exato Que Dispara a Cobrança</th>
      <th style="padding:9px 10px; text-align:left; width:18%;">Multa Mensal Oficial</th>
    </tr>
  </thead>
  <tbody>
    <tr style="background:#ffffff; border-bottom:1px solid #fee2e2;">
      <td style="padding:8px 10px; font-family:monospace; font-weight:bold; color:#991b1b;">2PN2111<br/><span style="font-size:10px; color:#64748b;">(pág. 367)</span></td>
      <td style="padding:8px 10px; font-weight:bold; color:#0f172a;">Additional Data Field (DE 48) Invalid or Improper</td>
      <td style="padding:8px 10px; color:#334155;">Enviar transação de Subcredenciador sem o <code>PF ID</code> válido no <code>DE 48 SE 37 / PDS 0208</code> ou popular subcampos com códigos não registrados na Mastercard.</td>
      <td style="padding:8px 10px; font-weight:bold; color:#dc2626;">R$ 5.600,00 / mês</td>
    </tr>
    <tr style="background:#fef2f2; border-bottom:1px solid #fee2e2;">
      <td style="padding:8px 10px; font-family:monospace; font-weight:bold; color:#991b1b;">2PN2113 (p.368)<br/>2PN2118 (p.369)</td>
      <td style="padding:8px 10px; font-weight:bold; color:#0f172a;">Invalid DE 43 Card Acceptor Name/Location (Auth &amp; Clearing)</td>
      <td style="padding:8px 10px; color:#334155;">Descritor <code>DE 43</code> fora do padrão <code>PF*NOME_SELLER</code>, sem o nome real do seller ou mal formatado na Autorização (<code>2PN2113</code>) e no Clearing (<code>2PN2118</code>).</td>
      <td style="padding:8px 10px; font-weight:bold; color:#dc2626;">R$ 5.600,00 / mês<br/><span style="font-size:10px; font-weight:normal;">(cada fase)</span></td>
    </tr>
    <tr style="background:#ffffff; border-bottom:1px solid #fee2e2;">
      <td style="padding:8px 10px; font-family:monospace; font-weight:bold; color:#991b1b;">2PN2117 (p.369)<br/>2PN2106 (p.366)</td>
      <td style="padding:8px 10px; font-weight:bold; color:#0f172a;">Invalid Card Acceptor ID (DE 42 Not Unique / Blank)</td>
      <td style="padding:8px 10px; color:#334155;">Usar o mesmo código <code>DE 42</code> genérico para múltiplos sellers diferentes no Clearing (<code>2PN2117</code>) ou deixar o <code>DE 42</code> em branco na Autorização (<code>2PN2106</code>).</td>
      <td style="padding:8px 10px; font-weight:bold; color:#dc2626;">R$ 5.600,00 / mês<br/><span style="font-size:10px; font-weight:normal;">(2PN2106: por Tier)</span></td>
    </tr>
    <tr style="background:#fef2f2; border-bottom:1px solid #fee2e2;">
      <td style="padding:8px 10px; font-family:monospace; font-weight:bold; color:#991b1b;">2PN2104 (p.366)<br/>2PN2119 (p.369)<br/>2PN2403 (p.377)</td>
      <td style="padding:8px 10px; font-weight:bold; color:#0f172a;">Invalid or Blank Country / Postal Code (Auth, Clearing &amp; Debit)</td>
      <td style="padding:8px 10px; color:#334155;">CEP ou país do seller em branco/zerado na Autorização (<code>2PN2104</code>), no Clearing (<code>2PN2119</code>) ou no Débito (<code>2PN2403</code>).</td>
      <td style="padding:8px 10px; font-weight:bold; color:#dc2626;">2PN2104/2119: R$ 5.600/mês<br/>2PN2403: R$ 5.000/mês</td>
    </tr>
    <tr style="background:#ffffff; border-bottom:1px solid #fee2e2;">
      <td style="padding:8px 10px; font-family:monospace; font-weight:bold; color:#991b1b;">2PN2121 (p.370)<br/>2PN2125 (p.371)</td>
      <td style="padding:8px 10px; font-weight:bold; color:#0f172a;">Clearing Data Integrity — Invalid Address / Street Address</td>
      <td style="padding:8px 10px; color:#334155;">Escrever a palavra <code>"UNKNOWN"</code> ou caracteres inválidos no endereço de rua do sublojista (<code>DE 43 SF 2 / PDS 0178</code>).</td>
      <td style="padding:8px 10px; font-weight:bold; color:#dc2626;">R$ 5.000,00 / mês<br/><span style="font-size:10px; font-weight:normal;">(cada evento)</span></td>
    </tr>
    <tr style="background:#fef2f2; border-bottom:1px solid #fee2e2;">
      <td style="padding:8px 10px; font-family:monospace; font-weight:bold; color:#991b1b;">2PN2120 (p.370)<br/>2PN2410 (p.379)</td>
      <td style="padding:8px 10px; font-weight:bold; color:#0f172a;">POS Auth vs. Clearing Mismatch &amp; Auth Postal Code Mismatch</td>
      <td style="padding:8px 10px; color:#334155;">Divergência entre os dados enviados no <code>0100</code> e no <code>1240</code> (<code>2PN2120</code>) ou envio de um CEP na Autorização diferente do CEP enviado no Clearing (<code>2PN2410</code>).</td>
      <td style="padding:8px 10px; font-weight:bold; color:#dc2626;">2PN2120: R$ 5.000/mês<br/>2PN2410: R$ 5.600/mês</td>
    </tr>
    <tr style="background:#ffffff;">
      <td style="padding:8px 10px; font-family:monospace; font-weight:bold; color:#991b1b;">2PN2110 (p.367)<br/>2PN2402 (p.377)<br/>2PN2409 (p.378)</td>
      <td style="padding:8px 10px; font-weight:bold; color:#0f172a;">E-Commerce Invalid / Debit Invalid Merchant Type / Trace ID</td>
      <td style="padding:8px 10px; color:#334155;">Subcampos de e-commerce inválidos (<code>2PN2110</code>), combinação ilegal de MCC + TCC no débito (<code>2PN2402</code>) ou perda do <code>Trace ID</code> em capturas parciais de split (<code>2PN2409</code>).</td>
      <td style="padding:8px 10px; font-weight:bold; color:#dc2626;">2PN2110: R$ 5.600/mês<br/>2PN2402: R$ 5.000/mês<br/>2PN2409: por Tier</td>
    </tr>
  </tbody>
</table>

<h3>6.3. As Multas Pesadas de Compliance, Sellers Proibidos (URL / BRAM), Auditoria AMP e Custos de Disputa VROL</h3>
<p>
  Enquanto os erros de formatação de campos custam cerca de R$ 5.600 por mês, deixar um vendedor ilegal operar dentro da sua plataforma ou cair em auditoria compulsória de risco gera penalidades que chegam às centenas de milhares de reais:
</p>

<table style="width:100%; border-collapse:collapse; margin:1.25rem 0; font-size:11.5px; border:1px solid #cbd5e1; border-radius:10px; overflow:hidden;">
  <thead>
    <tr style="background:#0f172a; color:#ffffff;">
      <th style="padding:9px 10px; text-align:left; width:15%;">Bandeira &amp; Código</th>
      <th style="padding:9px 10px; text-align:left; width:25%;">Programa / Evento Oficial</th>
      <th style="padding:9px 10px; text-align:left; width:36%;">Por Que Dispara &amp; Como Funciona a Escala de Punição</th>
      <th style="padding:9px 10px; text-align:left; width:24%;">Penalidade Oficial no Brasil (R$)</th>
    </tr>
  </thead>
  <tbody>
    <tr style="background:#ffffff; border-bottom:1px solid #e2e8f0;">
      <td style="padding:8px 10px; font-family:monospace; font-weight:bold; color:#1e40af;">Visa<br/>BL 5Z9965656</td>
      <td style="padding:8px 10px; font-weight:bold; color:#0f172a;">Acquirer Non-Compliance Assessments (Sponsored Merchant URL / Gambling / High-Brand Risk)</td>
      <td style="padding:8px 10px; color:#334155;">Acontece quando a Visa identifica que um <em>sponsored merchant (seller)</em> está operando uma URL não declarada ou vendendo produtos falsificados, pirataria, apostas sem licença regulatória ou gerando mais de 5% de estornos (<em>credits</em>) sem correção. A multa é aplicada <strong>por URL identificada</strong> dentro de uma janela móvel de 12 meses.</td>
      <td style="padding:8px 10px; font-weight:bold; color:#dc2626;">
        &bull; 1ª Violação: <strong>R$ 65.000 / URL</strong><br/>
        &bull; 2ª (em 12m): <strong>R$ 160.000 / URL</strong><br/>
        &bull; 3ª+ (em 12m): <strong>R$ 320.000 / URL</strong><br/>
        &bull; 4ª (em 12m): <strong>Banimento permanente do PayFac</strong><br/>
        &bull; Créditos &gt;5%: <strong>R$ 320 / crédito</strong>
      </td>
    </tr>
    <tr style="background:#f8fafc; border-bottom:1px solid #e2e8f0;">
      <td style="padding:8px 10px; font-family:monospace; font-weight:bold; color:#1e40af;">Visa<br/>BL 5Z9999105<br/>a 5Z9999194</td>
      <td style="padding:8px 10px; font-weight:bold; color:#0f172a;">Client and Agent Facilities Inspections (AMP Audit &amp; Non-Compliance)</td>
      <td style="padding:8px 10px; color:#334155;">Quando os índices de risco estouram e a Visa coloca o Adquirente ou seu Agente (PayFac) sob inspeção trimestral do <em>Acquirer Monitoring Program (AMP)</em> ou auditoria de reporte de fraude (FRS).</td>
      <td style="padding:8px 10px; font-weight:bold; color:#dc2626;">
        &bull; Taxa Auditoria AMP: <strong>R$ 65.000 / trim</strong><br/>
        &bull; Multa AMP Non-Compliance: <strong>R$ 162.000</strong><br/>
        &bull; PIN Security Review: <strong>R$ 65.000 / trim</strong><br/>
        &bull; Multa FRS Trimestral: <strong>R$ 65.000 / trim</strong>
      </td>
    </tr>
    <tr style="background:#ffffff; border-bottom:1px solid #e2e8f0;">
      <td style="padding:8px 10px; font-family:monospace; font-weight:bold; color:#1e40af;">Visa<br/>BL 5Z9965657<br/>BL 5Z9999200</td>
      <td style="padding:8px 10px; font-weight:bold; color:#0f172a;">Issuer / Acquirer Non-Compliance &amp; Collateral Delinquency Assessments</td>
      <td style="padding:8px 10px; color:#334155;">Cobrado quando a bandeira exige um depósito de garantia (colateral) por aumento de risco e a instituição atrasa o aporte, ou quando uma violação regulatória grave passa de 30 dias sem solução.</td>
      <td style="padding:8px 10px; font-weight:bold; color:#dc2626;">
        &bull; Atraso Dias 1–15: <strong>R$ 650/dia</strong> (ou 0,2%/dia)<br/>
        &bull; Atraso &gt;15 dias: <strong>R$ 3.200/dia</strong> (ou 0,5%/dia)<br/>
        &bull; Multa Inicial: <strong>R$ 323.000</strong> (+R$ 162k 30d)<br/>
        &bull; Meses 4–5: <strong>R$ 162.000 / mês</strong><br/>
        &bull; Mês 6 em diante: <strong>R$ 363.000 / mês</strong>
      </td>
    </tr>
    <tr style="background:#f8fafc; border-bottom:1px solid #e2e8f0;">
      <td style="padding:8px 10px; font-family:monospace; font-weight:bold; color:#b45309;">Mastercard<br/>MCBS 2PN2008<br/>MCBS 2SC1424</td>
      <td style="padding:8px 10px; font-weight:bold; color:#0f172a;">BRAM (Business Risk Assessment and Mitigation — pág. 366) &amp; FMP Level 2 MSP Review (pág. 424)</td>
      <td style="padding:8px 10px; color:#334155;">O programa <strong>BRAM (<code>2PN2008</code>)</strong> é o equivalente da Mastercard para punir vendas ilegais, lavagem de transação ou fraude contra o consumidor praticada por submerchants. Já o <code>2SC1424</code> cobra a auditoria presencial bienal obrigatória de nível 2 no MSP/PayFac.</td>
      <td style="padding:8px 10px; font-weight:bold; color:#dc2626;">
        &bull; Auditoria Presencial MSP (<code>2SC1424</code>): <strong>R$ 33.900,00</strong><br/>
        &bull; Multa BRAM (<code>2PN2008</code>): Escalonada por gravidade e volume
      </td>
    </tr>
    <tr style="background:#ffffff;">
      <td style="padding:8px 10px; font-family:monospace; font-weight:bold; color:#1e40af;">Visa<br/>BL 5H4010111<br/>BL 5H4010101<br/>BL 5H4010170</td>
      <td style="padding:8px 10px; font-weight:bold; color:#0f172a;">Custos Operacionais de Cada Disputa (Chargeback) e Arbitragem no VROL</td>
      <td style="padding:8px 10px; color:#334155;">Além de perder o valor da mercadoria quando sofre um chargeback, cada disputa aberta no <em>Visa Resolve Online (VROL)</em> gera uma tarifa operacional. Se o seller estourar o limite de fraude CNP, incide mais R$ 12,00 de sobretaxa por disputa. E atenção: tentar defender um caso perdido até a Arbitragem final da Visa custa caro!</td>
      <td style="padding:8px 10px; font-weight:bold; color:#dc2626;">
        &bull; Disputa recebida: <strong>R$ 10,35</strong><br/>
        &bull; Sobretaxa CNP Fraud: <strong>+ R$ 12,00</strong><br/>
        &bull; Resposta em 21–25d (T2): <strong>R$ 10,06</strong><br/>
        &bull; Resposta em 26–30d (T3): <strong>R$ 12,36</strong><br/>
        &bull; Deixar expirar (&gt;30d): <strong>R$ 29,00</strong><br/>
        &bull; Upload de doc/imagem: <strong>R$ 8,63</strong><br/>
        &bull; Abrir Arbitragem: <strong>R$ 2.900,00</strong><br/>
        &bull; Recurso (Appeal): <strong>R$ 5.751,00</strong> | Pen. Técnica: <strong>R$ 1.500,00</strong>
      </td>
    </tr>
  </tbody>
</table>

<!-- TRÍADE POR TIME: SEÇÃO 6 -->
<div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:12px; margin:1.25rem 0; font-size:12px; line-height:1.55;">
  <div style="background:#eff6ff; border:1px solid #bfdbfe; border-top:4px solid #2563eb; border-radius:10px; padding:12px 14px;">
    <strong style="color:#1e40af; display:block; margin-bottom:6px; font-size:12.5px;">💼 Para o Time de Negócios &amp; Jurídico</strong>
    <p style="margin:0; color:#1e293b;">
      Inclua nos Termos de Uso do Seller a cobrança de uma <strong>Taxa de Processamento de Disputa (ex.: R$ 25 a R$ 35 por chargeback)</strong> para cobrir o custo do VROL (<code>R$ 10,35 + R$ 12,00</code>) e nunca leve disputas de baixo valor para a Arbitragem da Visa (que custa <strong>R$ 2.900,00</strong> por caso).
    </p>
  </div>
  <div style="background:#f5f3ff; border:1px solid #ddd6fe; border-top:4px solid #7c3aed; border-radius:10px; padding:12px 14px;">
    <strong style="color:#5b21b6; display:block; margin-bottom:6px; font-size:12.5px;">🧭 Para o Time de Produto (Risco &amp; SAC)</strong>
    <p style="margin:0; color:#1e293b;">
      Como o <strong>VAMP</strong> agora soma Fraude (<code>TC 40</code>) com Desacordo Comercial (<code>TC 15</code> cód. 13), um seller que atrasa entregas destrói o índice de risco da plataforma tanto quanto um fraudador. Crie um botão de <strong>Reembolso Rápido (Rapid Dispute Resolution / Verifi / Ethoca)</strong> antes de o cliente abrir chargeback no banco.
    </p>
  </div>
  <div style="background:#ecfdf5; border:1px solid #a7f3d0; border-top:4px solid #059669; border-radius:10px; padding:12px 14px;">
    <strong style="color:#065f46; display:block; margin-bottom:6px; font-size:12.5px;">⚙️ Para o Time Técnico (Monitoramento)</strong>
    <p style="margin:0; color:#1e293b;">
      Automatize a ingestão diária dos arquivos de fraude (<code>TC 40</code> / <code>SAFE</code>) e chargeback (<code>TC 15</code> / <code>IPM 1442</code>) agrupados por <code>submerchant_id (DE 42)</code>. Se qualquer seller ultrapassar <strong>0,80% de VAMP Ratio</strong> ou <strong>3% de estornos</strong>, o sistema deve pausar automaticamente o checkout e o saque daquele seller.
    </p>
  </div>
</div>

<!-- =====================================================================
     SEÇÃO 7: COMO PROTEGER A OPERAÇÃO NA PRÁTICA (CONTAMINAÇÃO CRUZADA E ESCROW)
     ===================================================================== -->
<h2>7. O Risco de Contaminação Cruzada e Como Blindar o Seu Marketplace ou PayFac na Prática</h2>

<p>
  Depois de ver como funcionam os radares das bandeiras, fica fácil entender qual é o pesadelo número um de qualquer diretor de risco de um Marketplace ou Subcredenciador: a <strong>Contaminação Cruzada do Código Mestre (<code>PF ID / MVV</code>)</strong>.
</p>
<p>
  Imagine que você tem 8.000 sellers honestos vendendo todos os dias na sua plataforma. Numa sexta-feira à noite, uma quadrilha abre 3 cadastros usando CNPJs de laranjas (empresas recém-compradas), anuncia smartphones com 40% de desconto ou passa centenas de cartões clonados nas próprias lojas, pede antecipação de recebíveis na segunda-feira e desaparece. Trinta dias depois, chovem 2.500 chargebacks de fraude e mercadoria não entregue. Esses 2.500 chargebacks entram direto no numerador do <strong>VAMP</strong> e do <strong>Mastercard ECP</strong> do seu <code>PF ID</code>, estouram o limite de 0,50% / 0,70% da carteira e fazem a Adquirente ou a Bandeira travar a liquidação da plataforma inteira!
</p>
<p>
  Como as maiores operações do Brasil (Mercado Livre, Shopee, iFood, grandes PayFacs) blindam a sua arquitetura para que isso nunca aconteça? Através de quatro barreiras sincronizadas:
</p>

<table style="width:100%; border-collapse:collapse; margin:1.5rem 0; font-size:0.875rem; border:2px solid #059669; border-radius:10px; overflow:hidden;">
  <thead>
    <tr style="background:#065f46; color:#ffffff;">
      <th colspan="2" style="padding:12px; text-align:center; font-size:0.95rem; font-weight:bold;">
        OS 4 PILARES DE BLINDAGEM OPERACIONAL &amp; FINANCEIRA DO MARKETPLACE
      </th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="width:50%; padding:15px; background:#ecfdf5; border:1px solid #a7f3d0; vertical-align:top;">
        <strong style="color:#047857; font-size:0.92rem;">🟢 1. BARREIRA DE ENTRADA (KYB, MATCH &amp; VARREDURA DE URL)</strong>
        <p style="margin:6px 0; font-size:0.84rem; color:#064e3b; line-height:1.55;">
          O filtro começa antes de o seller vender o primeiro real:
        </p>
        <ul style="margin:0 0 0 16px; padding:0; font-size:0.84rem; color:#064e3b; line-height:1.55;">
          <li><strong>Consulta automatizada ao MATCH™ (<code>2NB0016</code> — R$ 0,20):</strong> Verificar se o CNPJ ou o CPF dos sócios já foi desligado por fraude em outra credenciadora.</li>
          <li><strong>Trava Cadastral CNAE &times; MCC &times; Natureza Jurídica:</strong> Se o seller se cadastrou com CPF (Pessoa Física), o sistema bloqueia automaticamente MCCs exclusivos de PJ (cumprindo a Release Elo 26.2).</li>
          <li><strong>Monitoramento de URL e Catálogo:</strong> Robô interno que impede o seller de alterar a vitrine depois de aprovado para vender itens proibidos (evitando a multa de R$ 65.000 a R$ 320.000 por URL da <code>BL 5Z9965656</code>).</li>
        </ul>
      </td>
      <td style="width:50%; padding:15px; background:#eff6ff; border:1px solid #bfdbfe; vertical-align:top;">
        <strong style="color:#1e40af; font-size:0.92rem;">🔵 2. BARREIRA NA AUTORIZAÇÃO (3DS SELETIVO &amp; STOP-RETRY)</strong>
        <p style="margin:6px 0; font-size:0.84rem; color:#1e3a8a; line-height:1.55;">
          Nem toda compra deve passar sem autenticação, e nem toda compra precisa de fricção:
        </p>
        <ul style="margin:0 0 0 16px; padding:0; font-size:0.84rem; color:#1e3a8a; line-height:1.55;">
          <li><strong>3DS 2.2 / DAF Seletivo por Risco do Seller:</strong> Se o seller tem menos de 60 dias de casa ou vende produtos de altíssima liquidez (celulares, informática, gift cards), o roteador aciona obrigatoriamente o <strong>3DS 2.2 / Visa DAF</strong> para transferir o risco de fraude (<em>Liability Shift</em> — ECI 05/02) para o Banco Emissor.</li>
          <li><strong>Network Tokens + ABU/OBO:</strong> Para clientes recorrentes da plataforma, usar Token de Rede reduz recusas falsas em 2% a 4%.</li>
          <li><strong>Trava de Retentativa no <code>DE 39</code>:</strong> Se o emissor negar com código <code>59, 82, 83, 14, 41 ou 43</code>, bloquear retentativas automáticas na hora.</li>
        </ul>
      </td>
    </tr>
    <tr>
      <td style="width:50%; padding:15px; background:#fffbeb; border:1px solid #fde68a; vertical-align:top;">
        <strong style="color:#b45309; font-size:0.92rem;">🟡 3. BARREIRA NO DINHEIRO (ESCROW LOGÍSTICO &amp; RESERVA)</strong>
        <p style="margin:6px 0; font-size:0.84rem; color:#92400e; line-height:1.55;">
          O golpista só ganha dinheiro se conseguir sacar antes de o chargeback chegar:
        </p>
        <ul style="margin:0 0 0 16px; padding:0; font-size:0.84rem; color:#92400e; line-height:1.55;">
          <li><strong>Liquidação Amarrada ao Código de Rastreio (Escrow):</strong> A agenda do seller só fica elegível para antecipação ou saque depois que a transportadora confirma via API que o pacote foi entregue ao comprador.</li>
          <li><strong>Trava de Velocity Spike + Rolling Reserve:</strong> Se um seller que vendia R$ 5 mil/mês de repente passa R$ 80 mil num fim de semana, o motor retém automaticamente um colchão de segurança (<em>Rolling Reserve</em> de 10% a 20%) por 30 a 60 dias.</li>
          <li><strong>Débito Cruzado Contratual:</strong> Cláusula permitindo descontar as disputas e a tarifa de R$ 10,35 a R$ 22,35 do VROL das vendas futuras daquele seller.</li>
        </ul>
      </td>
      <td style="width:50%; padding:15px; background:#fef2f2; border:1px solid #fecaca; vertical-align:top;">
        <strong style="color:#b91c1c; font-size:0.92rem;">🔴 4. BARREIRA DE CONCENTRAÇÃO (TETO 10% / USD 10M)</strong>
        <p style="margin:6px 0; font-size:0.84rem; color:#7f1d1d; line-height:1.55;">
          Impede que um seller gigante coloque a operação fora de compliance:
        </p>
        <ul style="margin:0 0 0 16px; padding:0; font-size:0.84rem; color:#7f1d1d; line-height:1.55;">
          <li><strong>Régua de Alerta em 70% do Limite:</strong> Disparar alerta automático para a equipe comercial/compliance quando qualquer seller atingir <strong>7% do TPV do Marketplace</strong> ou <strong>USD 7 Milhões/ano</strong> em uma bandeira.</li>
          <li><strong>Transição Suave para Direct Merchant Agreement:</strong> Ao chegar perto dos 10% do TPV ou USD 10M/ano, formalizar o contrato tripartite direto entre o Seller e a Adquirente sem precisar tirá-lo da experiência tecnológica do Marketplace.</li>
        </ul>
      </td>
    </tr>
  </tbody>
</table>

<!-- =====================================================================
     SEÇÃO 8: CHECKLIST EXECUTIVO DE AUDITORIA E HOMOLOGAÇÃO 360º
     ===================================================================== -->
<h2>8. O Checklist Definitivo de Homologação e Auditoria (Para Revisar Antes de Ir para Produção)</h2>
<p>
  Use a tabela abaixo como roteiro de verificação prática entre os times de Produto, Engenharia, Jurídico e Finanças para garantir que nenhuma ponta ficou solta:
</p>

<table style="width:100%; border-collapse:collapse; margin:1.25rem 0; font-size:12px; border:1px solid #cbd5e1; border-radius:10px; overflow:hidden;">
  <thead>
    <tr style="background:#0f2c59; color:#ffffff;">
      <th style="padding:9px 10px; text-align:left; width:14%;">Frente</th>
      <th style="padding:9px 10px; text-align:left; width:25%;">O Que Auditar</th>
      <th style="padding:9px 10px; text-align:left; width:47%;">Como Confirmar Que Está 100% Certo</th>
      <th style="padding:9px 10px; text-align:center; width:14%;">Classificação</th>
    </tr>
  </thead>
  <tbody>
    <tr style="background:#ffffff; border-bottom:1px solid #e2e8f0;">
      <td style="padding:8px 10px; font-weight:bold; color:#1e40af;">1. Regulatório (Bacen)</td>
      <td style="padding:8px 10px; font-weight:bold; color:#0f172a;">Fluxo Financeiro, CIP/SLC e Registradoras</td>
      <td style="padding:8px 10px; color:#334155;">Confirmar se o split é liquidado diretamente pela Adquirente para cada seller ou, caso o dinheiro passe pela conta da plataforma (Subcredenciador), se as grades <code>ASLC029/031/033</code> na CIP e a leitura diária de URs/gravames na CERC/TAG/B3/Nuclea (Res. BCB 264) estão ativas.</td>
      <td style="padding:8px 10px; text-align:center;"><span style="background:#fee2e2; color:#991b1b; font-weight:bold; padding:2px 8px; border-radius:99px; font-size:10px;">OBRIGATÓRIO</span></td>
    </tr>
    <tr style="background:#f8fafc; border-bottom:1px solid #e2e8f0;">
      <td style="padding:8px 10px; font-weight:bold; color:#1e40af;">2. Bandeiras</td>
      <td style="padding:8px 10px; font-weight:bold; color:#0f172a;">Licenças PF ID / MVV / Marketplace ID</td>
      <td style="padding:8px 10px; color:#334155;">Exigir da Adquirente patrocinadora o comprovante de registro ativo de Third Party Agent na Visa (<code>BL 5Q6562026</code> — R$ 32.000) e MSP/PayFac na Mastercard (<code>MCBS 2SC1812</code> — R$ 18.135), com os códigos oficiais de <code>PF ID</code> e <code>MVV</code> homologados.</td>
      <td style="padding:8px 10px; text-align:center;"><span style="background:#fee2e2; color:#991b1b; font-weight:bold; padding:2px 8px; border-radius:99px; font-size:10px;">OBRIGATÓRIO</span></td>
    </tr>
    <tr style="background:#ffffff; border-bottom:1px solid #e2e8f0;">
      <td style="padding:8px 10px; font-weight:bold; color:#7e22ce;">3. Engenharia ISO &amp; Clearing</td>
      <td style="padding:8px 10px; font-weight:bold; color:#0f172a;">Paridade Byte a Byte (DE 42, DE 43, DE 48 e DE 63.2)</td>
      <td style="padding:8px 10px; color:#334155;">Inspecionar um lote real de <code>0100</code>, <code>TC 05</code> e <code>IPM 1240</code>: verificar se cada seller tem um <code>DE 42</code> exclusivo, se o <code>DE 43</code> respeita a régua de 40 bytes (<code>PF*SELLER</code>), se o CEP da autorização é idêntico ao CEP do clearing e se o relatório mensal <code>IP714010-AA</code> está zerado.</td>
      <td style="padding:8px 10px; text-align:center;"><span style="background:#fee2e2; color:#991b1b; font-weight:bold; padding:2px 8px; border-radius:99px; font-size:10px;">OBRIGATÓRIO</span></td>
    </tr>
    <tr style="background:#f8fafc; border-bottom:1px solid #e2e8f0;">
      <td style="padding:8px 10px; font-weight:bold; color:#7e22ce;">4. Cadastro &amp; Elo 26.2</td>
      <td style="padding:8px 10px; font-weight:bold; color:#0f172a;">Trava de Natureza Fiscal PJ (CNPJ) vs. PF (CPF)</td>
      <td style="padding:8px 10px; color:#334155;">Garantir que o <code>Registro "01" (Pos 45, 14 bytes)</code> da Elo e o <code>PDS 0178</code> da Mastercard recebam o documento fiscal correto do seller e que o sistema impeça sellers com CPF de usarem MCCs exclusivos de Pessoa Jurídica.</td>
      <td style="padding:8px 10px; text-align:center;"><span style="background:#fef3c7; color:#92400e; font-weight:bold; padding:2px 8px; border-radius:99px; font-size:10px;">MANDATE 26.2</span></td>
    </tr>
    <tr style="background:#ffffff; border-bottom:1px solid #e2e8f0;">
      <td style="padding:8px 10px; font-weight:bold; color:#047857;">5. Finanças &amp; Tributário</td>
      <td style="padding:8px 10px; font-weight:bold; color:#0f172a;">Captura Única (VSS 2026) &amp; Segregação DIMP</td>
      <td style="padding:8px 10px; color:#334155;">Operar com captura única sob <code>MCC 5262</code> sempre que enquadrado como Marketplace Qualificado (economizando tarifas por item nas 5 faixas do Visa VSS 2026) e tributar apenas a receita de comissão/spread, mantendo o valor do seller em conta patrimonial transitória.</td>
      <td style="padding:8px 10px; text-align:center;"><span style="background:#dbeafe; color:#1e40af; font-weight:bold; padding:2px 8px; border-radius:99px; font-size:10px;">ALTA ECONOMIA</span></td>
    </tr>
    <tr style="background:#f8fafc;">
      <td style="padding:8px 10px; font-weight:bold; color:#b45309;">6. Jurídico (Termos Seller)</td>
      <td style="padding:8px 10px; font-weight:bold; color:#0f172a;">Contrato de Adesão do Vendedor (Seller Terms)</td>
      <td style="padding:8px 10px; color:#334155;">Incluir cláusulas expressas de: outorga/procuração mercantil para receber e dar quitação, autorização de consulta e registro de agenda em registradoras, retenção de reserva de risco (<em>Rolling Reserve</em>), liberação condicionada à entrega (<em>Escrow</em>) e compensação automática de chargebacks e multas de bandeira.</td>
      <td style="padding:8px 10px; text-align:center;"><span style="background:#dcfce7; color:#166534; font-weight:bold; padding:2px 8px; border-radius:99px; font-size:10px;">OBRIGATÓRIO</span></td>
    </tr>
  </tbody>
</table>

<div style="border-left:5px solid #2563eb; background:#eff6ff; padding:16px 20px; border-radius:0 12px 12px 0; margin:1.5rem 0;">
  <strong style="color:#1e40af; font-size:14px;">💡 Dica Prática do Doc Studio (EcommIT):</strong>
  <p style="margin:6px 0 0 0; font-size:13px; line-height:1.6; color:#1e293b;">
    Este documento é 100% vivo e editável dentro do seu <strong>Doc Studio (<code>/editor</code>)</strong>. Você pode clicar em qualquer parágrafo ou tabela para adaptar ao caso de um cliente específico, usar os botões <strong>Motor de Campos</strong> e <strong>Tarifas &amp; Campos (30k)</strong> na barra superior para anexar fichas técnicas extras direto da nossa base SQLite/JSON, e exportar na hora em <strong>PDF Executivo A4</strong> ou <strong>Word (.DOCX)</strong>.
  </p>
</div>`,
};
