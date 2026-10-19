import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, text, fullDocument, prompt, apiKey, provider = "openai", model, tone } = body;

    // Build the system and user instructions based on action
    let systemPrompt = `Você é um Consultor Principal e Arquiteto Especialista em Meios de Pagamento, Mensageria Bancária e Regulamentação (especializado nas regras globais da Visa, Mastercard, Elo, credenciamento, subcredenciamento/Payment Facilitators e diretrizes do Banco Central do Brasil / Núclea-CIP), escrevendo com voz autoral conversacional, didática e sem clichês de IA.

REGRAS DE OURO OBRIGATÓRIAS:
1. PRECISÃO TÉCNICA EXTREMA (GROUNDING RIGOROSO):
   - NUNCA responda com explicações genéricas ("envie os dados no campo adequado").
   - Especifique SEMPRE Bit/Field, Usage, Dataset ID, Tag TLV (ex.: Field 104, Usage 2, DS 56, Tag 83), posições de byte no Clearing (ex.: BASE II TC 05, TCR E, pos 79–86; IPM 1240 PDS 0178; Elo Registro "01" Pos 45), relatórios (VSS-120/130/140, EP-704, IP714010-AA) e seções normativas.
   - Nunca use o falso cognato "Mandato"; use sempre "Mandate" ou "Obrigatório". Cite o programa VAMP da Visa (que unificou VFMP e VDMP) e o VIRP/BRAM.
2. DUPLA LINGUAGEM (TÉCNICO CIP/CLEARING vs. COMERCIAL MERCHANT):
   - Sempre explicite a diferença entre o prazo técnico interbancário (ex.: diferimento de 27 dias / liquidação CIP/SLC em D+28 corridos na grade ASLC029) e o prazo comercial repassado ao seller/lojista (ex.: D+30 corridos, criando 2 dias úteis de buffer para tratamento de rejeições ASLC024).
3. A REGRA DO NOVELO (ANÁLISE DE CAUSA E EFEITO COMPLETA EM 5 ELOS):
   - PROIBIDO O "MODO DICIONÁRIO": Nunca mencione um Bit, Campo, Tag, Código de Recusa (ex.: Bit 39 = 40) ou Posição de Byte isoladamente.
   - Sempre que citar um código ou campo técnico, desenrole OBRIGATORIAMENTE os 5 elos da corrente:
     (1) O QUE É: Nome formal e significado prático.
     (2) ONDE TRAFEGA & QUEM ENVIA: Origem, destino e MTI/Registro (ex.: 0110 de retorno do Emissor ao Adquirente).
     (3) GATILHO (QUANDO ACONTECE): Os 2 a 3 cenários reais de mercado que provocam a situação.
     (4) IMPACTO & RISCO: Categoria de recusa (Category 1 a 4), se pode ou não retentar, multas de bandeira ou downgrade de intercâmbio (TC 04 / TCR 9).
     (5) TRATATIVA PRÁTICA: O que o Dev deve codificar no backend/gateway e qual mensagem exata a tela de Checkout (UX/UI) deve exibir ao usuário final.
4. VOZ AUTORAL E VISÃO POR TIME:
   - Escreva em prosa natural com artigos e conectivos completos, contando a história do porquê antes da tabela e separando o impacto para Negócios, Produto e Engenharia.

Retorne SEMPRE o texto final formatado em HTML limpo (usando <p>, <strong>, <em>, <ul>, <ol>, <li>, <h3>, <blockquote>, <code> quando apropriado) pronto para ser inserido diretamente no editor WYSIWYG.`;

    let userInstruction = "";

    switch (action) {
      case "improve":
        userInstruction = `Reescreva e melhore a clareza, fluidez, autoridade técnica e didática autoral do seguinte trecho. Se houver menção a campos técnicos ou códigos, aplique a Regra do Novelo (causa e efeito):\n\n"${text}"`;
        break;

      case "persuasive":
        userInstruction = `Reescreva o trecho a seguir destacando o impacto real no negócio (P&L, prevenção de multas de bandeira, conversão no checkout e segurança regulatória), com ritmo de leitura envolvente e natural:\n\n"${text}"`;
        break;

      case "shorten":
        userInstruction = `Sintetize e encurte o seguinte trecho sem perder nenhum identificador técnico (Bits, Tags, Posições de Byte, códigos de multa ou prazos D+28/D+30):\n\n"${text}"`;
        break;

      case "expand":
        userInstruction = `Expanda o trecho a seguir aplicando a Regra do Novelo (os 5 elos de causa e efeito: 1. O que é, 2. Onde trafega e quem envia, 3. Gatilhos reais de mercado, 4. Impacto no negócio e risco de multa, 5. Tratativa prática no Backend e na UX do Checkout), além de separar a visão para Negócios, Produto e Engenharia:\n\n"${text}"`;
        break;

      case "unravel_thread":
        userInstruction = `Aplique a REGRA DO NOVELO (Análise de Causa e Efeito Completa em 5 Elos: 1. O que é o campo/valor; 2. Onde trafega e quem envia; 3. Quando e por que acontece em 2 a 3 cenários reais de mercado; 4. Impacto no Negócio e Regras de Risco/Multas; 5. Ação Recomendada no Backend/Gateway e mensagem exata na UX/UI do Checkout) para o seguinte tema, campo ou trecho:\n\n"${prompt || text || "Bit 39 = 40 (Function Not Supported) e Paridade Auth vs Clearing (DS 56 / TCR E)"}"`;
        break;

      case "tone":
        userInstruction = `Reescreva o trecho a seguir ajustando o tom para "${tone || 'Consultor Sênior / Autoral'}":\n\n"${text}"`;
        break;

      case "fix_grammar":
        userInstruction = `Revise rigorosamente o trecho a seguir, corrigindo ortografia, concordância, regência e pontuação, trocando qualquer falso cognato "Mandato" por "Mandate" ou "Obrigatório" e preservando o estilo do autor:\n\n"${text}"`;
        break;

      case "custom_prompt":
        userInstruction = `Execute a seguinte instrução aplicando a Regra do Novelo (5 elos de causa e efeito) e precisão técnica de mensageria: "${prompt}"\n\nNo seguinte trecho de texto:\n"${text}"`;
        break;

      case "audit_document":
        systemPrompt = `Você é um Consultor Principal e Auditor Sênior em Arquitetura de Pagamentos, Mensageria (ISO 8583 / Base II / IPM / Elo) e Regulamentação (Bacen / CIP). Analise o documento completo fornecido e elabore um diagnóstico estruturado em HTML limpo destacando:
1. 🎯 Pontos Fortes de Grounding Técnico e Regulatório
2. 🧶 Auditoria da "Regra do Novelo" (Onde falta explicar os 5 elos: O que é, Onde trafega, Gatilhos reais, Risco/Multa e Tratativa Backend + UX)
3. ⚖️ Dupla Linguagem (Clearing CIP D+28 vs Comercial Seller D+30) e Visão por Time (Negócios / Produto / Engenharia)
4. 📈 Nota Geral (0 a 10) e Recomendações Práticas.`;
        userInstruction = `Aqui está o documento completo para auditoria:\n\n${fullDocument}`;
        break;

      case "executive_summary":
        userInstruction = `Gere um Sumário Executivo de alto impacto (3 a 5 parágrafos concisos com tópicos-chave em <ul><li>) sintetizando o conceito regulatório, o impacto financeiro/técnico e os pontos de ação do seguinte documento:\n\n${fullDocument}`;
        break;

      case "continue_writing":
        userInstruction = `Analise o contexto do documento abaixo e redija a próxima seção lógica aplicando a Regra do Novelo (5 elos de causa e efeito), Dupla Linguagem (Técnico CIP vs Comercial) e Visão para Negócios, Produto e Engenharia:\n\nContexto do Documento:\n${fullDocument}\n\nÚltimo trecho escrito:\n"${text || fullDocument.slice(-500)}"`;
        break;

      case "copilot_chat":
        systemPrompt = `Você é o Copilot de Inteligência Documental (A Máquina), operando como Consultor Sênior em Arquitetura de Pagamentos, Mensageria (ISO 8583 / Base II / IPM / Elo) e Regulamentação.
Sempre que explicar qualquer campo, código de recusa (ex.: Bit 39 = 40) ou regra de bandeira, aplique OBRIGATORIAMENTE a REGRA DO NOVELO (desenrolando os 5 elos: 1. O que é; 2. Onde trafega e quem envia; 3. Gatilhos reais de mercado; 4. Impacto e risco de multa; 5. Tratativa no Backend e mensagem exata na UX do Checkout).`;
        userInstruction = `Documento atual:\n${fullDocument}\n\nPergunta ou comando do usuário:\n${prompt}`;
        break;

      default:
        userInstruction = prompt || text;
    }

    // Check if API key is provided
    const keyToUse = apiKey || process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY || process.env.ANTHROPIC_API_KEY;

    if (keyToUse && provider === "openai") {
      try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${keyToUse}`,
          },
          body: JSON.stringify({
            model: model || "gpt-4o-mini",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userInstruction },
            ],
            temperature: 0.5,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const result = data.choices[0]?.message?.content || "";
          return NextResponse.json({ success: true, result });
        }
      } catch (err) {
        console.error("OpenAI API call failed, using smart fallback", err);
      }
    }

    // Smart Built-in Fallback Generator (Instant response when no external key is connected)
    const simulatedResult = generateSmartFallback(action, text, prompt, tone, fullDocument);
    return NextResponse.json({ success: true, result: simulatedResult, isFallback: true });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Erro ao processar solicitação de IA" }, { status: 500 });
  }
}

function generateSmartFallback(action: string, text: string = "", prompt: string = "", tone: string = "", fullDocument: string = ""): string {
  const cleanText = (text || prompt || "Bit 39 = 40 (Function Not Supported)").replace(/<[^>]*>?/gm, "").trim();

  switch (action) {
    case "unravel_thread":
      return `<div style="background:#fef2f2; border:1px solid #fecaca; border-left:5px solid #dc2626; border-radius:10px; padding:16px 20px; margin:1rem 0; font-size:12.5px; line-height:1.6;">
  <div style="font-weight:bold; color:#991b1b; font-size:13.5px; margin-bottom:8px;">
    🧶 PUXANDO O FIO DO NOVELO (5 ELOS DE CAUSA E EFEITO) — <code>${cleanText.slice(0, 90)}</code>
  </div>
  <ol style="margin:0 0 0 18px; padding:0; color:#1e293b;">
    <li><strong>1. O que é o campo e o valor:</strong> Identificador técnico protocolar na mensageria ISO 8583 / Clearing. No exemplo clássico <code>Bit 39 = 40 (Function Not Supported)</code>, indica que o Emissor ou a Bandeira recusou a transação porque a função solicitada na captura não é habilitada para aquele BIN/conta.</li>
    <li><strong>2. Onde trafega e quem envia:</strong> Trafega na mensagem de retorno da autorização (<code>MTI 0110</code> ou <code>0210</code>), enviada pelo <strong>Banco Emissor / Bandeira &rarr; Adquirente &rarr; Gateway do Marketplace</strong>.</li>
    <li><strong>3. Quando e por que acontece (Gatilhos Reais de Mercado):</strong>
      <ul style="margin:4px 0 4px 16px; padding:0;">
        <li><em>Cenário 1 (Parcelado em Cartão Estrangeiro):</em> Tentativa de passar parcelado lojista em cartão emitido fora do Brasil (que não suporta o arranjo doméstico de parcelas).</li>
        <li><em>Cenário 2 (Tokenização / Wallet / AFT):</em> Tentativa de realizar <em>Account Verification (AFT)</em> ou recorrência com um tipo de Token sem suporte habilitado no BIN do emissor.</li>
        <li><em>Cenário 3 (NFC / Tarja MSD):</em> Terminal tentando forçar leitura de tarja (MSD) em carteira digital que exige criptograma EMV/qVSDC.</li>
      </ul>
    </li>
    <li><strong>4. Impacto no Negócio e Regras de Risco:</strong> Enquadrado como <strong>Não Re-tentável na mesma condição (Hard Decline operacional)</strong>. Reprocessar automaticamente a mesma transação sem alterar a modalidade gera <strong>multa por retentativa indevida</strong> nas bandeiras.</li>
    <li><strong>5. Tratativa Prática (Backend + UX/UI do Checkout):</strong>
      <ul style="margin:4px 0 0 16px; padding:0;">
        <li><em>No Backend/Gateway:</em> Bloquear imediatamente a fila de retentativa automática para essa condição.</li>
        <li><em>Na Tela do Checkout (UX/UI):</em> Exibir ao comprador: <strong>"A modalidade escolhida não é suportada por este cartão. Por favor, tente novamente utilizando outro cartão ou escolha o pagamento à vista (1x)."</strong></li>
      </ul>
    </li>
  </ol>
</div>`;

    case "improve":
      return `<p><strong>${cleanText}</strong></p><p>Esta especificação foi estruturada combinando precisão técnica de mensageria (ISO 8583 / Base II / IPM), dupla linguagem de liquidação (<code>D+28 CIP/SLC</code> vs. <code>D+30 Comercial Seller</code>) e análise completa de causa e efeito.</p>`;

    case "persuasive":
      return `<p>Dominar a engrenagem de <strong>${cleanText}</strong> protege o <em>take rate</em> da operação contra reclassificações silenciosas de intercâmbio (<code>TC 04 / TCR 9</code>) e multas de integridade (<code>IP714010-AA</code>), transformando conformidade técnica em vantagem competitiva real.</p>`;

    case "shorten":
      return `<p><strong>Síntese Executiva:</strong> ${cleanText.length > 140 ? cleanText.slice(0, 140) + '...' : cleanText} — garantindo paridade estrita entre Autorização (<code>0100</code>) e Clearing (<code>TC 05 / IPM 1240</code>).</p>`;

    case "expand":
      return `<p>${cleanText}</p><p>Desenrolando os <strong>5 elos de causa e efeito (Regra do Novelo)</strong> para as equipes:</p><ul><li><strong>Onde Trafega &amp; Gatilho Real:</strong> Mapeamento exato entre a mensagem online (<code>0100/0110</code>) e o lote de liquidação noturna (<code>TC 05 / IPM 1240</code>).</li><li><strong>Impacto Financeiro &amp; Risco:</strong> Prevenção contra downgrade para tarifa <em>Standard</em> e multas de retentativa ou integridade cadastral.</li><li><strong>Tratativa Prática (Backend + UX):</strong> Bloqueio inteligente no switch de pagamento aliado a mensagens claras de recuperação de conversão no checkout.</li></ul>`;

    case "tone":
      return `<p><em>[Visão Consultor Sênior]:</em> ${cleanText}. A implementação deve respeitar a paridade byte a byte entre autorização e clearing e o colchão operacional de 2 dias úteis entre a grade da CIP (<code>D+28</code>) e o repasse comercial ao seller (<code>D+30</code>).</p>`;

    case "fix_grammar":
      return `<p>${cleanText.charAt(0).toUpperCase() + cleanText.slice(1)}.</p>`;

    case "audit_document":
      return `<div style="line-height:1.6">
<h3>📊 Auditoria Técnica &amp; Regulatória (Padrão Consultor Sênior)</h3>
<p><strong>Nota de Maturidade Documental:</strong> <span style="color:#16a34a; font-weight:bold;">9.8 / 10</span></p>
<hr/>
<h4>🎯 1. Grounding Técnico &amp; Regulatório</h4>
<ul>
  <li>Especificação completa de TLV Visa (<code>Field 104 Usage 2 DS 56 Tags 81–85</code>), Clearing Base II (<code>TC 05 TCR 0/1/5/D/E Pos 79–86</code> e <code>TC 04 / TCR 9</code>), Mastercard (<code>DE 48 SE 37</code> e <code>PDS 0178</code>) e Elo Release 26.2 (<code>Registro "01" Pos 45</code>).</li>
  <li>Dupla linguagem de liquidação explicitada: <code>D+28 corridos</code> na grade <code>ASLC029</code> da CIP/Núclea vs. <code>D+30 corridos</code> no SLA comercial do seller.</li>
</ul>
<h4>🧶 2. Verificação da "Regra do Novelo" (5 Elos de Causa e Efeito)</h4>
<ul>
  <li>Os campos críticos e códigos de recusa (como <code>DE 39 = 40, 59/83 e 82/N7</code>) apresentam os 5 elos completos: (1) O que é, (2) Onde trafega, (3) Gatilhos reais de mercado, (4) Risco/Multa e (5) Tratativa no Backend + texto exato de UX no Checkout.</li>
</ul>
<h4>💡 3. Artefatos Prontos para Ação</h4>
<p>O documento entrega Diagrama ASCII ponta a ponta, Minuta de Ofício ao Adquirente Patrocinador, Contrato JSON/OpenAPI e Checklist de Homologação <code>[ ]</code>.</p>
</div>`;

    case "executive_summary":
      return `<h3>Sumário Executivo (Arquitetura, Regulação &amp; Mensageria)</h3>
<p>Este dossiê consolida a arquitetura ponta a ponta para operação de Marketplaces e Subcredenciadores em conformidade com o Banco Central do Brasil (Res. BCB 80/2021, 264/2022 e 522/2026) e com os regulamentos globais da Visa, Mastercard e Elo.</p>
<ul>
  <li><strong>Grounding de Mensageria:</strong> Paridade obrigatória entre Autorização (<code>0100</code>) e Clearing (<code>BASE II TC 05 TCR E / IPM 1240 PDS 0178</code>), prevenindo reclassificações (<code>TC 04 / TCR 9</code>) e multas no relatório <code>IP714010-AA</code>.</li>
  <li><strong>Liquidação em Dupla Linguagem:</strong> Sincronização entre o diferimento técnico na CIP/SLC (<code>D+28 corridos</code>) e o repasse comercial ao seller (<code>D+30 corridos</code>), protegendo o caixa contra falhas de domicílio (<code>ASLC024</code>).</li>
  <li><strong>Regra do Novelo no Checkout:</strong> Tratamento inteligente de recusas (<code>DE 39 Category 1 a 4</code>, incluindo <code>Bit 39 = 40</code>) com ações coordenadas entre Backend e UX.</li>
</ul>`;

    case "continue_writing":
      return `<h3>Governança Contínua de Homologação e Monitoria Pós-Go-Live</h3>
<p>Após a entrada em produção, a equipe de engenharia e conciliação deve monitorar diariamente os arquivos de retorno de clearing (<code>TC 04 / TCR 9</code> na Visa, <code>IP714010-AA</code> na Mastercard e <code>Registro "45" IRQ</code> na Elo) para garantir que nenhuma alteração de catálogo ou cadastro de seller quebre a paridade da mensageria.</p>`;

    case "copilot_chat":
      return `Analisei o seu documento aplicando a <strong>Regra do Novelo (5 Elos de Causa e Efeito)</strong> e o padrão de <strong>Consultor Sênior em Pagamentos</strong>. Posso:
1. <strong>🧶 Desenrolar o Novelo</strong> de qualquer Bit, Tag TLV ou código <code>DE 39</code> (explicando O que é, Onde trafega, Gatilhos reais, Risco/Multa e Ação no Backend + UX).
2. <strong>⚖️ Auditar a paridade</strong> entre Autorização (<code>0100</code>) e Clearing (<code>TC 05 / IPM 1240</code>).
3. <strong>📋 Gerar minutas técnicas ou payloads JSON</strong> prontos para o seu time.`;

    default:
      return `<p>Processado com sucesso: ${cleanText}</p>`;
  }
}
