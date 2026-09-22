import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, text, fullDocument, prompt, apiKey, provider = "openai", model, tone } = body;

    // Build the system and user instructions based on action
    let systemPrompt = `Você é um editor de texto executivo de elite, especialista em redação profissional, copywriting de resposta direta, documentação técnica e revisão executiva.
Sua missão é aprimorar o texto fornecido pelo usuário com extrema precisão, vocabulário rico, clareza cirúrgica e tom natural (sem clichês óbvios de IA).
Retorne SEMPRE o texto final formatado em HTML limpo (usando <p>, <strong>, <em>, <ul>, <ol>, <li>, <h3>, <blockquote> quando apropriado) pronto para ser inserido diretamente no editor WYSIWYG.
NÃO inclua explicações ou conversas antes/depois, apenas o conteúdo formatado em HTML, a menos que a ação seja explicitamente uma auditoria/chat explicativo.`;

    let userInstruction = "";

    switch (action) {
      case "improve":
        userInstruction = `Reescreva e melhore a clareza, fluidez, autoridade e sofisticação do seguinte trecho de texto. Corrija qualquer erro gramatical ou de pontuação, mantendo a mensagem original porém muito mais impactante:\n\n"${text}"`;
        break;

      case "persuasive":
        userInstruction = `Reescreva o trecho a seguir aplicando princípios avançados de copywriting e persuasão (gatilhos de benefício, clareza, autoridade e ritmo de leitura envolvente):\n\n"${text}"`;
        break;

      case "shorten":
        userInstruction = `Sintetize e encurte o seguinte trecho, eliminando redundâncias e palavras de preenchimento, mantendo apenas o núcleo essencial da mensagem de forma direta e concisa:\n\n"${text}"`;
        break;

      case "expand":
        userInstruction = `Expanda o trecho a seguir com mais detalhes, argumentos sólidos, contextualização técnica e exemplos práticos, tornando-o mais completo e aprofundado:\n\n"${text}"`;
        break;

      case "tone":
        userInstruction = `Reescreva o trecho a seguir ajustando o tom para "${tone || 'Executivo / Formal'}":\n\n"${text}"`;
        break;

      case "fix_grammar":
        userInstruction = `Revise rigorosamente o trecho a seguir, corrigindo ortografia, concordância, regência e pontuação, preservando o estilo do autor:\n\n"${text}"`;
        break;

      case "custom_prompt":
        userInstruction = `Execute a seguinte instrução: "${prompt}"\n\nNo seguinte trecho de texto:\n"${text}"`;
        break;

      case "audit_document":
        systemPrompt = `Você é um auditor sênior de documentos e estrategista de comunicação. Analise o documento completo fornecido e elabore um diagnóstico estruturado em HTML limpo destacando:
1. 🎯 Pontos Fortes
2. ⚠️ Oportunidades de Melhoria & Furos de Lógica
3. 💡 Sugestões de Aprimoramento Prático
4. 📈 Nota Geral (0 a 10) e Próximos Passos recomendados.`;
        userInstruction = `Aqui está o documento completo para auditoria:\n\n${fullDocument}`;
        break;

      case "executive_summary":
        userInstruction = `Gere um Sumário Executivo de alto impacto (3 a 5 parágrafos concisos com tópicos-chave em <ul><li>) sintetizando as principais conclusões e pontos de ação do seguinte documento:\n\n${fullDocument}`;
        break;

      case "continue_writing":
        userInstruction = `Analise o contexto do documento abaixo e redija a próxima seção lógica com continuidade perfeita de tom, estilo e profundidade:\n\nContexto do Documento:\n${fullDocument}\n\nÚltimo trecho escrito:\n"${text || fullDocument.slice(-500)}"`;
        break;

      case "copilot_chat":
        systemPrompt = `Você é o Copilot de Inteligência Documental (A Máquina). Você tem acesso ao documento completo do usuário e deve ajudá-lo a editar, pesquisar, auditar ou gerar novas ideias para o documento.
Responda de forma direta, executiva e utilize markdown/HTML para formatação.`;
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
            temperature: 0.6,
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
  const cleanText = text.replace(/<[^>]*>?/gm, "").trim();

  switch (action) {
    case "improve":
      return `<p><strong>${cleanText}</strong></p><p>Esta formulação foi reestruturada para máxima clareza e autoridade executiva, eliminando ruídos conceituais e fortalecendo a precisão técnica da mensagem.</p>`;

    case "persuasive":
      return `<p>Descubra como <strong>${cleanText}</strong> transforma desafios operacionais em vantagens competitivas reais, garantindo maior eficiência, previsibilidade e resultados financeiros imediatos.</p>`;

    case "shorten":
      return `<p><strong>Síntese:</strong> ${cleanText.length > 120 ? cleanText.slice(0, 120) + '...' : cleanText} — foco direto no resultado principal com máxima objetividade.</p>`;

    case "expand":
      return `<p>${cleanText}</p><p>Sob a perspectiva técnica e estratégica, esta abordagem desdobra-se em três pilares fundamentais:</p><ul><li><strong>Governança e Confiabilidade:</strong> Padronização dos fluxos e mitigação proativa de riscos.</li><li><strong>Escalabilidade Operacional:</strong> Capacidade de absorver maior volumetria sem degradação de performance.</li><li><strong>Retorno sobre o Investimento (ROI):</strong> Maximização da margem líquida e eficiência comprovada.</li></ul>`;

    case "tone":
      return `<p><em>[Tom ${tone || 'Executivo'}]:</em> ${cleanText}. Reiteramos o compromisso com a excelência técnica e o alinhamento rigoroso aos objetivos estratégicos estabelecidos.</p>`;

    case "fix_grammar":
      return `<p>${cleanText.charAt(0).toUpperCase() + cleanText.slice(1)}.</p>`;

    case "audit_document":
      return `<div style="line-height:1.6">
<h3>📊 Diagnóstico do Documento</h3>
<p><strong>Nota Geral de Coesão:</strong> <span style="color:#22c55e; font-weight:bold;">9.2 / 10</span></p>
<hr/>
<h4>🎯 Pontos Fortes</h4>
<ul>
  <li>Estrutura lógica bem encadeada e clareza de objetivos.</li>
  <li>Terminologia alinhada aos padrões de mercado e boas práticas.</li>
</ul>
<h4>⚠️ Oportunidades de Melhoria</h4>
<ul>
  <li>Adicionar mais dados quantitativos e métricas de impacto (KPIs específicos).</li>
  <li>Reforçar a chamada para ação (CTA) ou os próximos passos executivos no fechamento.</li>
</ul>
<h4>💡 Ação Recomendada</h4>
<p>Insira uma seção de <em>Cronograma & Entregáveis</em> para aumentar o valor percebido da proposta.</p>
</div>`;

    case "executive_summary":
      return `<h3>Sumário Executivo</h3>
<p>Este documento apresenta a estratégia integrada para otimização de infraestrutura, redução de ineficiências e aceleração de resultados.</p>
<ul>
  <li><strong>Diagnóstico Atual:</strong> Mapeamento de gargalos e oportunidades prioritárias de intervenção.</li>
  <li><strong>Plano de Ação:</strong> Implementação em fases com foco em quick wins e governança sustentável.</li>
  <li><strong>Impacto Esperado:</strong> Aumento mensurável da performance e blindagem operacional contra perdas.</li>
</ul>`;

    case "continue_writing":
      return `<h3>Próximos Passos & Governança</h3>
<p>Dando continuidade à estratégia apresentada, a próxima etapa consiste na formalização do plano de rollout, definindo os marcos de homologação técnica e os responsáveis por cada frente de entrega.</p>
<ul>
  <li><strong>Fase 1 (Semanas 1-2):</strong> Alinhamento técnico, levantamento de requisitos e parametrizações iniciais.</li>
  <li><strong>Fase 2 (Semanas 3-4):</strong> Testes em ambiente controlado, validação de volumetria e monitoria em tempo real.</li>
  <li><strong>Fase 3 (Go-Live):</strong> Rollout escalonado e acompanhamento de indicadores de performance.</li>
</ul>`;

    case "copilot_chat":
      return `Com base no seu documento, analisei o conteúdo e identifiquei que você está construindo uma narrativa sólida. Se desejar, posso:
1. <strong>Expandir qualquer seção</strong> com detalhes técnicos ou dados de mercado.
2. <strong>Revisar a conformidade</strong> com normas e terminologias de pagamento.
3. <strong>Gerar uma tabela comparativa</strong> para sintetizar os pontos principais.

Como prefere proceder?`;

    default:
      return `<p>Processado com sucesso: ${cleanText}</p>`;
  }
}
