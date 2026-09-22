export interface DocumentTemplate {
  id: string;
  name: string;
  description: string;
  category: "Geral" | "Pagamentos" | "Copywriting" | "Técnico" | "Jurídico";
  defaultTitle: string;
  content: string;
}

export const DOCUMENT_TEMPLATES: DocumentTemplate[] = [
  {
    id: "blank",
    name: "Documento em Branco",
    description: "Comece a escrever do zero com uma folha A4 limpa e moderna.",
    category: "Geral",
    defaultTitle: "Novo Documento",
    content: "<h1>Título do Documento</h1><p>Comece a digitar seu texto aqui ou use o Copilot de IA para gerar as primeiras ideias...</p>",
  },
  {
    id: "proposta_pagamentos",
    name: "Proposta de Consultoria em Pagamentos",
    description: "Estrutura executiva completa para propostas de otimização de autorização, adquirência e billing.",
    category: "Pagamentos",
    defaultTitle: "Proposta Executiva — Otimização de Infraestrutura de Pagamentos",
    content: `<h1>PROPOSTA EXECUTIVA: OTIMIZAÇÃO DE MEIOS DE PAGAMENTO & BILLING</h1>
<p><strong>Cliente:</strong> [Nome da Empresa / Parceiro]</p>
<p><strong>Data:</strong> [Data Atual] | <strong>Responsável Técnico:</strong> Vinícius Sugamele</p>
<hr/>
<h2>1. Sumário Executivo & Diagnóstico Atual</h2>
<p>Esta proposta visa estruturar e implementar alavancas de engenharia transacional para maximizar a taxa de aprovação de pagamentos, mitigar o churn involuntário e auditar os custos de processamento e intercâmbio.</p>
<ul>
  <li><strong>Taxa de Aprovação Atual:</strong> Identificada oportunidade de ganho de 2 a 4 pontos percentuais através de Network Tokens e Smart Routing.</li>
  <li><strong>Recusas Técnicas:</strong> Mapeamento de gargalos em códigos de retorno (código 05 - Do Not Honor e parâmetros de POS Entry Mode DE 22).</li>
  <li><strong>Recuperação de Churn:</strong> Estruturação de Smart Retries e Account Updater automatizado (VAU/ABU).</li>
</ul>

<h2>2. Escopo dos Serviços</h2>
<h3>Fase 1: Auditoria Transacional & Higienização de Mensageria</h3>
<p>Análise forense dos logs de autorização ISO 8583, identificação de causas-raiz de recusas e parametrização correta das flags de CIT (Customer-Initiated) vs. MIT (Merchant-Initiated).</p>

<h3>Fase 2: Implantação de Network Tokens & 3DS 2.2</h3>
<p>Rollout de tokenização de bandeira (VTS, MDES e Elo Token) e autenticação segura com garantia de <em>Liability Shift</em> (ECI 05) para blindagem contra chargebacks indevidos.</p>

<h3>Fase 3: Motor de Smart Retries & Gestão de Dunning</h3>
<p>Desenvolvimento de matriz de retentativas sincronizadas com janelas de maior liquidez e horários de menor fricção bancária.</p>

<h2>3. Cronograma & Entregáveis</h2>
<ul>
  <li><strong>Semana 1 a 2:</strong> Diagnóstico de base de dados e emissão do Relatório de Oportunidades.</li>
  <li><strong>Semana 3 a 4:</strong> Parametrizações técnicas e início dos testes controlados A/B.</li>
  <li><strong>Semana 5 em diante:</strong> Monitoria contínua em dashboard analítico e reporte executivo de ROI.</li>
</ul>

<h2>4. Investimento & Condições Comerciais</h2>
<p>Modelo de remuneração baseado em taxa fixa de assessoria técnica combinada com percentual sobre a receita recuperada (Success Fee).</p>`,
  },
  {
    id: "prd_integracao",
    name: "Especificação Técnica (PRD de Pagamentos)",
    description: "Documento de requisitos de produto para engenharia de integração com adquirentes e gateways.",
    category: "Técnico",
    defaultTitle: "PRD — Arquitetura de Roteamento & Gateway de Pagamentos",
    content: `<h1>PRODUCT REQUIREMENTS DOCUMENT (PRD)</h1>
<h2>Módulo de Roteamento Inteligente & Orquestração de Pagamentos</h2>
<p><strong>Autor:</strong> Equipe de Arquitetura de Pagamentos | <strong>Status:</strong> Em Revisão Técnica</p>
<hr/>
<h2>1. Objetivo do Produto</h2>
<p>Construir uma camada agnóstica de orquestração de pagamentos que roteie transações com base no menor custo de intercâmbio, maior probabilidade de aprovação e fallback automático em caso de instabilidade do adquirente primário.</p>

<h2>2. Requisitos Funcionais</h2>
<ul>
  <li><strong>Roteamento Dinâmico por BIN:</strong> O motor deve consultar a tabela de faixas de BIN e identificar o emissor e bandeira antes de despachar a autorização.</li>
  <li><strong>Cascata e Fallback (Stand-In):</strong> Se o processador primário retornar timeout (91) ou erro de sistema (96), disparar retentativa imediata no processador secundário em até 800ms.</li>
  <li><strong>Network Token Integration:</strong> Suportar requisições com Token Cryptogram e flags de e-commerce seguro (DE 22 = 81).</li>
</ul>

<h2>3. Fluxo de Tratamento de Decline Codes</h2>
<blockquote>
<strong>Hard Declines:</strong> Códigos 14 (Cartão Inválido), 41 (Cartão Perdido), 43 (Cartão Roubado) e 54 (Cartão Vencido) NÃO devem ser reenviados.<br/>
<strong>Soft Declines:</strong> Códigos 51 (Saldo Insuficiente), 05 (Do Not Honor genérico) e 91 (Timeout) entram no fluxo de Smart Retries.
</blockquote>

<h2>4. Critérios de Aceite & Métricas de Sucesso</h2>
<ul>
  <li>Latência total de autorização inferior a 1.2 segundos no percentil 95 (p95).</li>
  <li>Zero perda de transações em quedas de rede de adquirentes parceiros.</li>
  <li>Aumento comprovado de ao menos 3% na taxa global de aprovação da plataforma.</li>
</ul>`,
  },
  {
    id: "auditoria_intercambio",
    name: "Relatório de Auditoria de Intercâmbio (MCBS/VSS)",
    description: "Laudo técnico de conciliação tarifária e custos de bandeiras para instituições de pagamento.",
    category: "Pagamentos",
    defaultTitle: "Relatório Técnico — Auditoria de Tarifas de Bandeira e Intercâmbio",
    content: `<h1>RELATÓRIO DE AUDITORIA DE INTERCÂMBIO & TARIFAS DE BANDEIRA</h1>
<p><strong>Auditoria Técnica:</strong> Análise de Faturas Mastercard (MCBS) e Visa (VSS)</p>
<p><strong>Período Auditado:</strong> Último Trimestre Operacional</p>
<hr/>
<h2>1. Visão Geral dos Custos Transacionais</h2>
<p>Esta auditoria examinou a conformidade das tarifas aplicadas pela adquirente e bandeiras em relação às tabelas públicas oficiais e aos limites regulatórios estabelecidos pela Resolução BCB nº 150.</p>

<h2>2. Principais Achados & Divergências Mapeadas</h2>
<ul>
  <li><strong>Cobrança Indevida de Service IDs:</strong> Identificada incidência duplicada de tarifas de liquidação transfronteiriça em compras domésticas com cartões emitidos no Brasil.</li>
  <li><strong>Inaplicabilidade do Cap de Débito:</strong> Transações de cartão de débito sem autenticação foram tarifadas acima do limite regulatório médio de 0,50%.</li>
  <li><strong>Elegibilidade a Tarifas Diferenciadas de Token:</strong> Volume significativo de transações elegíveis a incentivos tarifários por Tokenização que não foram usufruídos por falta de preenchimento do campo de mensageria correspondente.</li>
</ul>

<h2>3. Economia Financeira Estimada</h2>
<p>A correção dos parâmetros de mensageria e o pedido de ressarcimento formal junto à processadora representa uma redução de custo operacional projetada de <strong>R$ 85.000 a R$ 140.000 / mês</strong>.</p>

<h2>4. Recomendações e Plano de Ação</h2>
<ol>
  <li>Adequação imediata dos campos de envio de transações com Token nos gateways.</li>
  <li>Envio de notificação técnica à credenciadora solicitando ajuste retroativo dos Service IDs contestados.</li>
  <li>Implantação de rotina de conciliação automatizada mensal baseada na tabela de intercâmbio em cascata.</li>
</ol>`,
  },
  {
    id: "copy_vsl",
    name: "Roteiro de VSL / Copywriting de Alta Conversão",
    description: "Estrutura mestre para roteiros de vídeo de vendas e cartas de resposta direta com ganchos e mecanismo.",
    category: "Copywriting",
    defaultTitle: "Roteiro de VSL — Mecanismo Único & Oferta Irresistível",
    content: `<h1>ROTEIRO DE VSL (VIDEO SALES LETTER)</h1>
<h2>Produto: [Nome da Solução] | Público-Alvo: [Avatar / Tomador de Decisão]</h2>
<hr/>
<h2>1. O Gancho (0:00 a 0:45) — O Padrão Oculto</h2>
<p><em>[Cena: Visual direto e intrigante]</em></p>
<p>"Se você gerencia uma operação digital hoje, existe uma chance de 38% de que você esteja perdendo milhares de reais toda semana... não porque seus clientes não querem comprar, mas por causa de um 'fantasma' silencioso que os gateways e adquirentes nunca te contam."</p>

<h2>2. A História & O Vilão Comum (0:45 a 3:00)</h2>
<p>Apresentação do problema real: como a maioria das recusas bancárias não tem relação com falta de limite, mas sim com mensageria desatualizada e regras cegas de inteligência artificial dos bancos emissores.</p>

<h2>3. Revelação do Mecanismo Único (3:00 a 6:00)</h2>
<p>Apresentação do conceito inovador que resolve o problema na causa-raiz (ex.: Engenharia de Mensageria Inteligente + Dunning Sincronizado).</p>
<ul>
  <li><strong>Prova 1:</strong> Estudo de caso real com aumento imediato de conversão.</li>
  <li><strong>Prova 2:</strong> Comparativo do método tradicional vs. o Novo Método.</li>
</ul>

<h2>4. A Oferta & Chamada para Ação (CTA)</h2>
<p>Apresentação dos entregáveis, garantia de resultado e chamada direta para agendamento de diagnóstico técnico.</p>`,
  },
];
