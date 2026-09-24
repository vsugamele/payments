export interface DocumentTemplate {
  id: string;
  name: string;
  description: string;
  category: "Geral" | "Pagamentos" | "Copywriting" | "Técnico" | "Jurídico" | "Artigos";
  defaultTitle: string;
  content: string;
}

export const DOCUMENT_TEMPLATES: DocumentTemplate[] = [
  {
    id: "artigo_ia_conhecimento",
    name: "Artigo: Quando a IA responde, quem realmente sabe?",
    description: "Ensaio analítico sobre a perda do atrito cognitivo, a ilusão de competência e a urgência de governança de conhecimento em pagamentos.",
    category: "Artigos",
    defaultTitle: "Quando a IA responde, quem realmente sabe?",
    content: `<h1>Quando a IA responde, quem realmente sabe?</h1>
<p style="color:#64748b; font-size:0.95rem; margin-top:-0.5rem; margin-bottom:1.25rem;">
  <strong>Ensaio Estratégico:</strong> Inteligência Artificial, Engenharia Cognitiva & Governança em Pagamentos • <strong>Tempo de Leitura:</strong> 6 min
</p>
<hr/>

<div style="background:#eff6ff; border:1px solid #bfdbfe; border-left:5px solid #2563eb; border-radius:12px; padding:18px 22px; margin:1.5rem 0;">
  <div style="display:flex; align-items:center; gap:8px; margin-bottom:8px; color:#1e40af; font-weight:bold; font-size:0.95rem; letter-spacing:0.5px;">
    <span>💡</span>
    <span>A PROVOCAÇÃO CENTRAL</span>
  </div>
  <p style="margin:0; color:#1e293b; font-size:0.95rem; line-height:1.65; font-weight:500;">
    A Inteligência Artificial já mudou a forma como trabalhamos — e, na indústria de pagamentos, não é diferente. Hoje, uma IA consegue ler um boletim de bandeira, resumir uma alteração, interpretar uma regra, comparar documentos e até sugerir quais áreas podem ser impactadas. Isso é extraordinário. Mas surge um risco sobre o qual talvez estejamos falando pouco: <strong>o que acontece quando a IA começa a substituir não apenas o trabalho operacional, mas também parte do processo de aprendizado e construção de conhecimento das pessoas?</strong>
  </p>
</div>

<h2>1. A Ilusão da Facilidade: O Atalho do Prompt</h2>
<p>Imagine um profissional júnior entrando hoje na indústria de pagamentos.</p>
<p>Antes, para entender uma alteração de bandeira, ele precisava abrir o boletim de dezenas de páginas, procurar a regra relacionada, entender o fluxo de autorização, clearing ou settlement, identificar campos e mensagens envolvidos, discutir com profissionais mais experientes e, muitas vezes, errar a interpretação até realmente compreender como aquela engrenagem funcionava.</p>
<p>Esse processo era trabalhoso. Mas era exatamente o que construía conhecimento, intuição técnica e bagagem duradoura.</p>
<p>Hoje existe um caminho muito mais curto:</p>

<div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:12px 18px; margin:1.25rem 0; font-family:monospace; color:#0f172a; font-size:0.9rem;">
  💬 <em>“IA, leia esse boletim e me diga o impacto operacional para a nossa adquirente.”</em>
</div>

<p>Em segundos, temos uma resposta extremamente bem escrita, estruturada e aparentemente convincente. E é justamente aí que mora o risco.</p>

<table style="width:100%; border-collapse:collapse; margin:1.5rem 0; font-size:0.875rem; border:1px solid #cbd5e1; border-radius:10px; overflow:hidden;">
  <thead>
    <tr style="background:#0f2c59; color:#ffffff;">
      <th style="padding:12px 14px; text-align:left; font-weight:bold; border:1px solid #1e3a8a; width:22%;">Dimensão</th>
      <th style="padding:12px 14px; text-align:left; font-weight:bold; border:1px solid #1e3a8a; width:39%;">Formação Tradicional (Atrito Cognitivo)</th>
      <th style="padding:12px 14px; text-align:left; font-weight:bold; border:1px solid #1e3a8a; width:39%;">Ciclo do Prompt Rápido (Assistido por IA)</th>
    </tr>
  </thead>
  <tbody>
    <tr style="background:#f8fafc;">
      <td style="padding:10px 14px; border:1px solid #cbd5e1; font-weight:bold; color:#0f2c59;">Processo de Estudo</td>
      <td style="padding:10px 14px; border:1px solid #cbd5e1;">Leitura da documentação original, rastreamento de campos e subcampos ISO 8583.</td>
      <td style="padding:10px 14px; border:1px solid #cbd5e1;">Prompt imediato; leitura passiva de uma síntese em tópicos.</td>
    </tr>
    <tr style="background:#ffffff;">
      <td style="padding:10px 14px; border:1px solid #cbd5e1; font-weight:bold; color:#0f2c59;">Relação com o Erro</td>
      <td style="padding:10px 14px; border:1px solid #cbd5e1;">O erro inicial gerava debate com seniores e consolidava a arquitetura na memória.</td>
      <td style="padding:10px 14px; border:1px solid #cbd5e1;">A resposta aparentemente perfeita inibe o questionamento e gera falsa certeza.</td>
    </tr>
    <tr style="background:#f8fafc;">
      <td style="padding:10px 14px; border:1px solid #cbd5e1; font-weight:bold; color:#0f2c59;">Visão de Conjunto</td>
      <td style="padding:10px 14px; border:1px solid #cbd5e1;">Conexão sistêmica entre captura, mensageria, conciliação e liquidação final.</td>
      <td style="padding:10px 14px; border:1px solid #cbd5e1;">Respostas isoladas e desconectadas da realidade do legado tecnológico da empresa.</td>
    </tr>
    <tr style="background:#ffffff;">
      <td style="padding:10px 14px; border:1px solid #cbd5e1; font-weight:bold; color:#0f2c59;">Subproduto Real</td>
      <td style="padding:10px 14px; border:1px solid #cbd5e1; color:#16a34a; font-weight:bold;">Profissionais capazes de conceber soluções novas e diagnosticar falhas complexas.</td>
      <td style="padding:10px 14px; border:1px solid #cbd5e1; color:#dc2626; font-weight:bold;">Profissionais eficientes para obter respostas, mas despreparados para construí-las.</td>
    </tr>
  </tbody>
</table>

<div style="background:#fffbeb; border:1px solid #fde68a; border-left:5px solid #d97706; border-radius:12px; padding:18px 22px; margin:1.5rem 0;">
  <div style="display:flex; align-items:center; gap:8px; margin-bottom:8px; color:#b45309; font-weight:bold; font-size:0.95rem;">
    <span>⚠️</span>
    <span>A PRIMEIRA ARMADILHA: FORMA VS. DOMÍNIO REAL</span>
  </div>
  <p style="margin:0; color:#1e293b; font-size:0.92rem; line-height:1.65;">
    <strong>Uma resposta bem escrita não significa necessariamente uma resposta correta.</strong> E talvez exista um segundo problema ainda mais difícil de perceber: <strong>uma boa entrega também não significa necessariamente domínio do assunto.</strong>
  </p>
</div>

<h2>2. A Ilusão de Competência e o Teste da Segunda Pergunta</h2>
<p>Um profissional pode produzir excelentes análises, apresentações e respostas utilizando Inteligência Artificial. Para seu gestor, supervisor ou até mesmo para seus pares, ele pode demonstrar uma aparente profundidade técnica muito maior do que aquela que realmente possui.</p>
<p>Enquanto a IA estiver disponível para ajudá-lo, talvez essa diferença nem seja percebida.</p>
<p>O problema aparece quando a discussão sai do roteiro pré-fabricado:</p>

<ul>
  <li>Quando alguém faz <strong>a segunda pergunta</strong>, exigindo detalhamento de arquitetura.</li>
  <li>Depois <strong>a terceira pergunta</strong>, buscando correlação com o fluxo financeiro.</li>
  <li>Quando é necessário <strong>conectar aquela regra com outro processo interno</strong> da empresa.</li>
  <li>Quando surge uma <strong>exceção operacional</strong> ou fallback não previsto.</li>
  <li>Quando é preciso <strong>defender uma interpretação técnica</strong> perante a auditoria da bandeira.</li>
  <li>Ou quando ninguém sabe exatamente qual é a resposta e o profissional precisa <strong>construir uma hipótese a partir da sua própria experiência</strong>.</li>
</ul>

<p>É nesse momento que <strong>conhecimento, repertório, criatividade e capacidade de raciocínio técnico</strong> começam a fazer a verdadeira diferença.</p>

<div style="background:#0f172a; color:#f8fafc; border:1px solid #334155; border-radius:14px; padding:20px 24px; margin:1.5rem 0; box-shadow:0 4px 15px rgba(0,0,0,0.15);">
  <div style="color:#38bdf8; font-weight:bold; font-size:1rem; margin-bottom:8px; letter-spacing:0.5px;">
    🛡️ O IMPACTO NA EVOLUÇÃO PROFISSIONAL
  </div>
  <p style="margin:0; color:#cbd5e1; font-size:0.92rem; line-height:1.65;">
    Conhecimento técnico não serve apenas para responder perguntas prontas. Ele permite <strong>fazer conexões, questionar uma regra, perceber uma inconsistência, imaginar impactos que não estavam explícitos no documento, propor caminhos alternativos, antecipar problemas</strong> e participar de uma discussão profunda sem precisar interrompê-la para consultar uma ferramenta a cada nova frase.<br/><br/>
    Se toda dificuldade imediatamente vira um prompt, existe o risco real de que parte desse processo cognitivo simplesmente deixe de acontecer.
  </p>
</div>

<h2>3. Em Pagamentos, a Teoria Vira Prejuízo Imediato</h2>
<p>Em ambientes como o de meios de pagamento, essa questão ganha uma dimensão crítica. Uma interpretação equivocada de uma regra de bandeira não termina necessariamente em um documento errado — <strong>ela pode virar uma implementação errada em ambiente de produção</strong>.</p>
<p>As consequências práticas de análises cegas incluem:</p>

<ul>
  <li>Interpretar incorretamente uma data limite de vigência ou janela de transição.</li>
  <li>Confundir regras aplicáveis na <strong>autorização online</strong> com parâmetros exclusivos de <strong>clearing (compensação)</strong>.</li>
  <li>Não perceber que determinado subcampo (DE 22, DE 48, DE 60) precisa ser enviado ou recebido.</li>
  <li>Ignorar condições específicas de elegibilidade tarifária ou programas de segurança (3DS, Token, BRAM, MATCH).</li>
  <li>Não identificar necessidade obrigatória de homologação ou recadastro junto à bandeira.</li>
  <li>Interpretar incorretamente uma obrigação de compliance regulatório.</li>
  <li>Ou, pior: <strong>concluir que determinado boletim não impacta a empresa quando, na realidade, impacta diretamente</strong>.</li>
</ul>

<table style="width:100%; border-collapse:collapse; margin:1.5rem 0; font-size:0.875rem; border:1px solid #cbd5e1; border-radius:10px; overflow:hidden;">
  <thead>
    <tr style="background:#0f2c59; color:#ffffff;">
      <th style="padding:11px 14px; text-align:left; font-weight:bold; border:1px solid #1e3a8a; width:22%;">Domínio Crítico</th>
      <th style="padding:11px 14px; text-align:left; font-weight:bold; border:1px solid #1e3a8a; width:28%;">O Que a IA Sintetiza</th>
      <th style="padding:11px 14px; text-align:left; font-weight:bold; border:1px solid #1e3a8a; width:25%;">O Ponto Cego Oculto</th>
      <th style="padding:11px 14px; text-align:left; font-weight:bold; border:1px solid #1e3a8a; width:25%;">Impacto Financeiro / Operacional</th>
    </tr>
  </thead>
  <tbody>
    <tr style="background:#f8fafc;">
      <td style="padding:10px 14px; border:1px solid #cbd5e1; font-weight:bold; color:#0f2c59;">Cronograma de Chaves CAPK</td>
      <td style="padding:10px 14px; border:1px solid #cbd5e1;">"A validade da chave foi estendida pela bandeira até 2036."</td>
      <td style="padding:10px 14px; border:1px solid #cbd5e1;">O adquirente precisa sincronizar o TMS e emissores precisam requerer novos certificados.</td>
      <td style="padding:10px 14px; border:1px solid #cbd5e1; color:#dc2626; font-weight:bold;">Transações recusadas nos terminais por falha de autenticação offline do chip.</td>
    </tr>
    <tr style="background:#ffffff;">
      <td style="padding:10px 14px; border:1px solid #cbd5e1; font-weight:bold; color:#0f2c59;">Incentivos Tarifários & Intercâmbio</td>
      <td style="padding:10px 14px; border:1px solid #cbd5e1;">"Redução de tarifa anunciada para compras sem fricção."</td>
      <td style="padding:10px 14px; border:1px solid #cbd5e1;">Exigência de preenchimento de flags específicas de token e ECI 05 para evitar downgrade.</td>
      <td style="padding:10px 14px; border:1px solid #cbd5e1; color:#dc2626; font-weight:bold;">Perda silenciosa de margem operacional e cobrança retroativa no clearing.</td>
    </tr>
    <tr style="background:#f8fafc;">
      <td style="padding:10px 14px; border:1px solid #cbd5e1; font-weight:bold; color:#0f2c59;">Compliance de Disputas & Chargebacks</td>
      <td style="padding:10px 14px; border:1px solid #cbd5e1;">"Atualização nos fluxos de contestação de compras não reconhecidas."</td>
      <td style="padding:10px 14px; border:1px solid #cbd5e1;">Novos prazos rígidos de pré-arbitragem e envio de evidências obrigatórias.</td>
      <td style="padding:10px 14px; border:1px solid #cbd5e1; color:#dc2626; font-weight:bold;">Penalidades financeiras diretas por perda de prazo de defesa regulatória.</td>
    </tr>
  </tbody>
</table>

<p>Alguns desses erros podem aparecer meses depois, na forma de <strong>non-compliance, penalidades das bandeiras, aumento de custos, perda de receita ou impacto operacional severo</strong>.</p>

<h2>4. Potencializar vs. Substituir Conhecimento</h2>
<p>Quem conhece profundamente determinado assunto consegue utilizar IA como um multiplicador sem precedentes:</p>
<ul>
  <li>Lê a resposta do modelo e confronta imediatamente com a documentação oficial.</li>
  <li>Percebe interpretações equivocadas ou excessivamente genéricas.</li>
  <li>Identifica exceções de fluxo que o modelo desconsiderou.</li>
  <li>Sabe exatamente quando é mandatório voltar à fonte primária e auditar o manual técnico.</li>
</ul>

<p>Mas e quem ainda está formando esse conhecimento? Como um profissional júnior — ou até mesmo pleno ou sênior que não domina aquele tema específico — identifica que a resposta da IA está errada?</p>
<p>Esse profissional corre o risco de começar a confiar na ferramenta antes de desenvolver conhecimento suficiente para <strong>questionar a própria ferramenta</strong>.</p>
<p>E surge o paradoxo central:</p>

<div style="background:#eff6ff; border:1px solid #bfdbfe; border-left:5px solid #2563eb; border-radius:12px; padding:16px 20px; margin:1.25rem 0;">
  <p style="margin:0; color:#1e40af; font-size:0.95rem; line-height:1.65; font-weight:bold;">
    "Quanto mais usamos IA para evitar o esforço de construir conhecimento, menos preparados ficamos para validar aquilo que a própria IA produz."
  </p>
</div>

<p>Não acredito que a solução seja reduzir o uso de Inteligência Artificial. Muito pelo contrário. A IA pode ser uma das maiores ferramentas de produtividade que já tivemos. Mas existe uma diferença monumental entre:</p>
<ol>
  <li><strong>Usar IA para potencializar conhecimento existente</strong> (alavanca técnica).</li>
  <li><strong>Usar IA para substituir a construção do conhecimento</strong> (muleta cognitiva).</li>
</ol>
<p><strong>IA sem conhecimento especializado para fazer a curadoria cria uma falsa sensação de segurança.</strong> Alguém precisa avaliar não apenas se a resposta parece correta, mas se a fonte é adequada, se a interpretação faz sentido dentro daquele fluxo, se existem documentos complementares, exceções e impactos sistêmicos não descritos.</p>

<h2>5. As Perguntas Urgentes de Governança para as Empresas</h2>
<p>A discussão dentro das organizações de pagamentos precisa evoluir. A pergunta não deveria ser apenas: <em>“Como podemos usar IA para ganhar produtividade?”</em></p>
<p>As lideranças precisam colocar na mesa perguntas mais profundas e desconfortáveis:</p>

<div style="background:#f0fdf4; border:1px solid #bbf7d0; border-left:5px solid #16a34a; border-radius:12px; padding:18px 22px; margin:1.5rem 0;">
  <div style="display:flex; align-items:center; gap:8px; margin-bottom:10px; color:#15803d; font-weight:bold; font-size:0.95rem;">
    <span>📋</span>
    <span>DIRETRIZES DE GOVERNANÇA DE CONHECIMENTO</span>
  </div>
  <ul style="margin:0; padding-left:1.25rem; color:#1e293b; font-size:0.92rem; line-height:1.7;">
    <li><strong>Quem está validando aquilo que a IA está produzindo?</strong> Essa pessoa realmente domina o assunto ou apenas domina a ferramenta?</li>
    <li><strong>Se retirarmos a IA dessa discussão, quanto desse conhecimento continua vivo dentro da empresa?</strong> Quanto existe realmente na organização e quanto está apenas sendo temporariamente acessado via API externa?</li>
    <li><strong>Quais análises podem ser feitas exclusivamente com apoio de IA</strong> e quais precisam obrigatoriamente de revisão humana especializada?</li>
    <li><strong>Como garantir que os profissionais em início de carreira continuem desenvolvendo profundidade</strong>, repertório e senso crítico mesmo tendo respostas instantâneas à disposição?</li>
    <li><strong>Até que ponto a empresa está disposta a colocar sua operação, seu compliance e seu resultado financeiro na confiança de uma IA sem curadoria técnica por trás?</strong></li>
  </ul>
</div>

<h2>6. Conclusão: Onde Vive o Verdadeiro Diferencial</h2>
<p>A IA continuará evoluindo em velocidade impressionante. E certamente fará cada vez mais parte do nosso trabalho diário na indústria de pagamentos.</p>
<p>Mas talvez o verdadeiro diferencial competitivo não esteja em quem sabe perguntar melhor para uma IA.</p>
<p><strong>Pode estar em quem possui conhecimento, bagagem e discernimento suficientes para saber quando a resposta dela não é boa o bastante.</strong></p>

<div style="background:linear-gradient(135deg, rgba(37,99,235,0.08) 0%, rgba(124,58,237,0.08) 100%); border:1.5px solid #818cf8; border-radius:14px; padding:20px 24px; margin:1.5rem 0; text-align:center;">
  <h3 style="margin:0 0 8px 0; color:#4338ca; font-size:1.05rem; font-weight:bold;">💬 COMO VOCÊS ESTÃO ENXERGANDO ISSO NO DIA A DIA?</h3>
  <p style="margin:0 auto 10px auto; color:#1e293b; font-size:0.925rem; line-height:1.6; max-width:650px;">
    A IA está acelerando a formação dos profissionais ou criando uma dependência antes que eles desenvolvam conhecimento suficiente para caminhar sozinhos?<br/>
    <strong>E dentro das empresas: quem está fazendo a curadoria técnica da IA?</strong>
  </p>
  <p style="margin:0; font-size:0.85rem; color:#6366f1; font-weight:bold;">Compartilhe sua reflexão com seus pares e lideranças do ecossistema de pagamentos.</p>
</div>`,
  },
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
    id: "boletim_parecer_tecnico",
    name: "Parecer Técnico — Boletim de Bandeira (Mastercard / Visa / Elo)",
    description: "Estrutura corporativa completa para análise e parecer executivo de boletins mandatórios e operacionais de bandeiras.",
    category: "Pagamentos",
    defaultTitle: "Parecer Técnico — GLB 10362.3: Atualização de Chaves Públicas M/Chip (Mastercard)",
    content: `<h1>PARECER TÉCNICO: ATUALIZAÇÃO DE CHAVES PÚBLICAS M/CHIP (GLB 10362.3)</h1>
<p style="font-size:0.9rem; color:#64748b;"><strong>Bandeira:</strong> Mastercard® | <strong>Referência Regulatória:</strong> GLB 10362.3 (EMVCo Notice Bulletin No. 30)</p>
<hr/>

<h2>1. Sumário Executivo & Diagnóstico Técnico</h2>
<p>A Mastercard anunciou a prorrogação oficial da data de validade da <strong>Chave Pública do Sistema de Pagamentos de 1.984 bits (Índice 6)</strong> para o ecossistema M/Chip por mais um ano, passando de <strong>31 de Dezembro de 2035 para 31 de Dezembro de 2036</strong>.</p>
<p>O valor binário da chave (módulo e expoente público) permanece exatamente o mesmo. Esta atualização segue as diretrizes da EMVCo para manutenção do ciclo de vida das chaves de sistema, assegurando que as chaves de emissores certificadas sob esta raiz permaneçam válidas para autenticação offline em terminais POS e caixas eletrônicos (ATM).</p>

<h2>2. Contexto Criptográfico & Padrões EMVCo</h2>
<p>No protocolo EMV (M/Chip Contact e Contactless), a autenticação offline de cartões (SDA, DDA e CDA) depende da verificação de certificados digitais baseados em criptografia assimétrica RSA. O terminal de pagamento precisa ter carregado em sua memória protegida o conjunto operacional de Chaves Públicas da Autoridade Certificadora da Bandeira (<strong>CAPK — CA Public Keys</strong>).</p>
<p>Com a expiração anterior da chave de 1.408 bits, o conjunto operacional da Mastercard é composto exclusivamente pela chave de <strong>1.984 bits</strong>. A avaliação periódica de poder computacional conduzida pela EMVCo concluiu que o comprimento de 1.984 bits mantém margem de segurança criptográfica adequada para suportar operações comerciais com segurança até o final de 2036.</p>

<h2>3. Especificação das Chaves Públicas Mastercard</h2>
<p>Abaixo, a comparação entre a configuração vigente e a atualização que entra em vigor em <strong>01/11/2026</strong>:</p>

<table style="width:100%; border-collapse:collapse; margin:14px 0; font-size:13px; text-align:left; border:1px solid #cbd5e1; border-radius:8px; overflow:hidden;">
  <thead>
    <tr style="background:#1e3a8a; color:#ffffff;">
      <th style="padding:10px 12px; font-weight:600;">Índice (Key Index)</th>
      <th style="padding:10px 12px; font-weight:600;">Expoente Público</th>
      <th style="padding:10px 12px; font-weight:600;">Comprimento (RSA)</th>
      <th style="padding:10px 12px; font-weight:600;">Validade Anterior</th>
      <th style="padding:10px 12px; font-weight:600;">Nova Validade Efetiva</th>
    </tr>
  </thead>
  <tbody>
    <tr style="border-bottom:1px solid #e2e8f0; background:#f8fafc;">
      <td style="padding:10px 12px; font-family:monospace; font-weight:bold; color:#1e40af;">06 (hex)</td>
      <td style="padding:10px 12px; font-family:monospace;">3</td>
      <td style="padding:10px 12px; font-weight:bold;">1.984 bits</td>
      <td style="padding:10px 12px; color:#64748b; text-decoration:line-through;">31/12/2035</td>
      <td style="padding:10px 12px; font-weight:bold; color:#16a34a;">31/12/2036</td>
    </tr>
  </tbody>
</table>

<div style="border-left:4px solid #f59e0b; background:#fffbeb; padding:12px 16px; border-radius:0 10px 10px 0; margin:12px 0; font-size:13px; color:#92400e;">
  ⚠️ <strong>Nota Técnica de Engenharia:</strong> Como o valor binário da chave permanece inalterado, não há necessidade de gerar novos pares de chaves assimétricas imediatas, apenas sincronizar as tabelas de data de expiração e certificados autoassinados no gerenciamento de chaves.
</div>

<h2>4. Impacto Operacional por Agente da Cadeia</h2>

<h3>A. Adquirentes, Subadquirentes e Gateways</h3>
<ul>
  <li><strong>Carga de Tabelas CAPK em Terminais:</strong> Garantir que os sistemas de TMS (Terminal Management System) e os kernels EMV instalados no parque de POS/mPOS/SmartPOS reconheçam a data de expiração 31/12/2036 para o índice 6 da Mastercard.</li>
  <li><strong>Mitigação de Recusas Indevidas:</strong> Se um terminal mantiver a data anterior gravada de forma estrita em hardware seguro, cartões emitidos futuramente com certificados que ultrapassem 2035 poderiam sofrer falha de autenticação offline (fallback ou declínio). A atualização preventiva elimina esse risco.</li>
  <li><strong>Download de Guias:</strong> O manual atualizado está disponível no portal <em>Mastercard Connect &gt; Technical Resource Center &gt; Guides &gt; Payment System Public Keys for M/Chip Contact and Contactless</em>.</li>
</ul>

<h3>B. Emissores de Cartão e Bureaus de Personalização</h3>
<ul>
  <li><strong>Certificação de Chaves de Emissor:</strong> A partir de 01/11/2026, os emissores poderão solicitar à Autoridade Certificadora da Mastercard a emissão de certificados de chaves públicas de emissor com validade estendida até 31/12/2036.</li>
  <li><strong>Limites de Tamanho de Chave RSA:</strong> Relembra-se que a Mastercard não certifica chaves públicas de emissor com tamanho inferior a 1.408 bits (conforme GLB 12623.1) e o limite máximo para emissores é de 1.976 bits (conforme Anexo D1 do Livro 2 EMV).</li>
</ul>

<h3>C. Processadoras & Fornecedores de Software de Terminal (L2 Kernel)</h3>
<ul>
  <li>Acesso ao portal <em>Mastercard Public Key Certification Service (MPKCS)</em> via Key Management Portal para obter o certificado autoassinado (.cer) atualizado.</li>
  <li>Homologação em ambiente de testes de regressão de transações de contato e por aproximação (NFC).</li>
</ul>

<h2>5. Cronograma de Ações & Recomendações</h2>

<table style="width:100%; border-collapse:collapse; margin:14px 0; font-size:13px; text-align:left; border:1px solid #cbd5e1; border-radius:8px; overflow:hidden;">
  <thead>
    <tr style="background:#0f172a; color:#ffffff;">
      <th style="padding:9px 12px;">Data / Janela</th>
      <th style="padding:9px 12px;">Ação Recomendada</th>
      <th style="padding:9px 12px;">Responsável</th>
      <th style="padding:9px 12px;">Status</th>
    </tr>
  </thead>
  <tbody>
    <tr style="border-bottom:1px solid #e2e8f0; background:#f8fafc;">
      <td style="padding:9px 12px; font-weight:bold;">22/09/2026</td>
      <td style="padding:9px 12px;">Publicação oficial do Boletim GLB 10362.3 e notificação às equipes de engenharia.</td>
      <td style="padding:9px 12px;">Compliance / Regulação</td>
      <td style="padding:9px 12px;"><span style="display:inline-block; background:#dcfce7; color:#166534; padding:2px 6px; border-radius:4px; font-size:10px; font-weight:bold;">CONCLUÍDO</span></td>
    </tr>
    <tr style="border-bottom:1px solid #e2e8f0;">
      <td style="padding:9px 12px; font-weight:bold;">Até 25/10/2026</td>
      <td style="padding:9px 12px;">Download do certificado no Mastercard Connect e conferência nas tabelas de CAPK do TMS.</td>
      <td style="padding:9px 12px;">Engenharia de Terminais / TMS</td>
      <td style="padding:9px 12px;"><span style="display:inline-block; background:#dbeafe; color:#1e40af; padding:2px 6px; border-radius:4px; font-size:10px; font-weight:bold;">EM ANDAMENTO</span></td>
    </tr>
    <tr style="border-bottom:1px solid #e2e8f0; background:#f8fafc;">
      <td style="padding:9px 12px; font-weight:bold; color:#16a34a;">01/11/2026</td>
      <td style="padding:9px 12px;">Entrada em vigor do suporte a certificações com vigência até 31/12/2036 no portal MPKCS.</td>
      <td style="padding:9px 12px;">Mastercard / Emissores</td>
      <td style="padding:9px 12px;"><span style="display:inline-block; background:#fef3c7; color:#92400e; padding:2px 6px; border-radius:4px; font-size:10px; font-weight:bold;">PROGRAMADO</span></td>
    </tr>
    <tr>
      <td style="padding:9px 12px; font-weight:bold;">31/12/2036</td>
      <td style="padding:9px 12px;">Data limite de expiração da chave pública Mastercard de 1.984 bits (Índice 6).</td>
      <td style="padding:9px 12px;">Ecossistema Global EMV</td>
      <td style="padding:9px 12px;"><span style="display:inline-block; background:#f1f5f9; color:#475569; padding:2px 6px; border-radius:4px; font-size:10px; font-weight:bold;">VIGÊNCIA</span></td>
    </tr>
  </tbody>
</table>

<h2>6. Parecer Técnico Conclusivo</h2>
<div style="border-left:4px solid #10b981; background:#ecfdf5; padding:14px 18px; border-radius:0 12px 12px 0; margin:16px 0;">
  <strong style="color:#065f46; font-size:14px;">✅ Conclusão & Avaliação de Impacto Regulatório</strong>
  <p style="margin:6px 0 0 0; font-size:13.5px; line-height:1.6; color:#064e3b;">
    A mudança possui <strong>baixo risco operacional</strong> e <strong>impacto técnico favorável</strong>, permitindo estender o ciclo de vida dos cartões emitidos e preservando a infraestrutura existente de terminais. Recomenda-se apenas a rotina padrão de sincronização de tabelas CAPK nas próximas janelas de release de software dos adquirentes e a ciência dos times de personalização de cartões.
  </p>
</div>`,
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
