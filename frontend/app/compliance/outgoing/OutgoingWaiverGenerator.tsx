'use client';

import React, { useMemo, useState } from 'react';
import { OutgoingBrandId, OUTGOING_BRANDS } from '@/data/outgoing-tables-flows';
import { sendToDocStudio } from '@/lib/docStudioBridge';

export interface WaiverTemplatePreset {
  id: string;
  brand: OutgoingBrandId;
  programCode: string;
  title: string;
  assessmentRef: string;
  incidentWindow: string;
  fixDeployDate: string;
  affectedTxCount: string;
  penaltyAmount: string;
  rootCausePt: string;
  rootCauseEn: string;
  remediationEvidencePt: string;
  remediationEvidenceEn: string;
  preventiveControlsPt: string;
  preventiveControlsEn: string;
}

export const WAIVER_TEMPLATES: WaiverTemplatePreset[] = [
  {
    id: 'visa-tid-waiver',
    brand: 'visa',
    programCode: 'Visa Data Integrity (VSS-140 / TC 46)',
    title: 'Visa — Ausência Pontual de TID (DE 62.2) no TCR 5 após Atualização do Motor',
    assessmentRef: 'VSS-140 / V22120 — Data Integrity Assessment',
    incidentWindow: '02/10/2026 01:15 UTC até 06/10/2026 18:40 UTC',
    fixDeployDate: '06/10/2026 19:00 UTC (Release #4821)',
    affectedTxCount: '18.420 transações TC 05',
    penaltyAmount: 'US$ 18.420,00',
    rootCausePt:
      'Durante a atualização da camada de persistência do autorizador ISO 8583 (Release #4815), o subcampo DE 62.2 (Transaction Identifier de 15 dígitos retornado na mensagem 0110) sofreu truncamento na fila assíncrona que alimenta o gerador do arquivo Base II CTF, resultando no preenchimento com zeros nas posições 5–19 do registro TCR 5.',
    rootCauseEn:
      'During an update to the ISO 8583 authorization persistence layer (Release #4815), sub-element DE 62.2 (15-digit Transaction Identifier returned in the 0110 response) experienced a serialization truncation in the asynchronous queue feeding the Base II CTF builder, resulting in zero-filled values in positions 5–19 of the TCR 5 record.',
    remediationEvidencePt:
      'O hotfix #4821 restaurou o mapeamento integral dos 15 dígitos do DE 62.2 da 0110 para o TCR 5 em 06/10/2026. Os relatórios VCX (VX-100A / VX-204A) e VSS-130/140 de 07/10/2026 até a presente data comprovam 100,00% de presença válida do TID (0,00% de erro).',
    remediationEvidenceEn:
      'Hotfix #4821 restored the full 15-digit mapping from 0110 DE 62.2 to TCR 5 on 2026-10-06. Subsequent VCX (VX-100A / VX-204A) and VSS-130/140 reports from 2026-10-07 onwards confirm a 100.00% valid TID population rate (0.00% error rate).',
    preventiveControlsPt:
      '1. Regra bloqueante (Pre-Edit Linter) antes da transmissão do Base II CTF que impede o fechamento de lote caso qualquer TC 05 autorizado via VIP esteja com TID zerado.\n2. Alerta automatizado diário sobre o relatório VX-204A / VSS-140.',
    preventiveControlsEn:
      '1. Pre-transmission Base II CTF schema gate that blocks batch generation if any VIP-authorized TC 05 contains a zeroed TID.\n2. Automated daily monitoring alert tied to VX-204A / VSS-140 reports.',
  },
  {
    id: 'mc-gdip-traceid-waiver',
    brand: 'mastercard',
    programCode: 'Mastercard GDIP (Global Data Integrity Program)',
    title: 'Mastercard — Divergência de Trace ID (DE 63 ➔ PDS 0158) no MTI 1240',
    assessmentRef: 'MCBS Billing Event — GDIP Compliance Assessment / IP714010-AA',
    incidentWindow: '10/10/2026 até 14/10/2026 (Ciclos GCMS 001 a 004)',
    fixDeployDate: '14/10/2026 22:10 UTC (Patch GCMS-1240-v3)',
    affectedTxCount: '14.250 mensagens MTI 1240',
    penaltyAmount: 'US$ 15.000,00',
    rootCausePt:
      'Na conversão do construtor de mensagens MTI 1240 (First Presentment), os 4 dígitos finais de data (MMDD) do DE 63 da resposta 0110 foram substituídos pela data de liquidação em vez da data original da autorização dentro do subelemento PDS 0158, gerando apontamento no relatório IP714010-AA.',
    rootCauseEn:
      'In the MTI 1240 (First Presentment) message builder, the trailing 4-digit date (MMDD) of the 0110 DE 63 Network Data was inadvertently populated with the clearing date instead of the original authorization date inside PDS 0158, triggering exceptions in report IP714010-AA.',
    remediationEvidencePt:
      'O Patch GCMS-1240-v3 implantado em 14/10/2026 fixou a cópia imutável dos 13 caracteres originais do Trace ID da 0110 no PDS 0158. Os relatórios diários IP714010-AA e IP714010-BB a partir de 15/10/2026 registram 0 ocorrências de erro de Trace ID.',
    remediationEvidenceEn:
      'Patch GCMS-1240-v3 deployed on 2026-10-14 enforced an immutable copy of the original 13-character 0110 Trace ID into PDS 0158. Daily IP714010-AA and IP714010-BB reports from 2026-10-15 onwards show zero Trace ID exceptions.',
    preventiveControlsPt:
      '1. Validação bit-a-bit entre a tabela de log bruto da 0110 (DE 63) e o payload de saída MTI 1240 (PDS 0158).\n2. Conciliação automática diária do relatório IP714010-AA/BB no T+0.',
    preventiveControlsEn:
      '1. Automated byte-level assertion comparing raw 0110 log (DE 63) against outbound MTI 1240 payload (PDS 0158).\n2. Automated T+0 ingestion and alerting on IP714010-AA/BB reports.',
  },
  {
    id: 'mc-ecp-payfac-waiver',
    brand: 'mastercard',
    programCode: 'Mastercard ECP (Excessive Chargeback Program)',
    title: 'Mastercard — Agregação Indevida de Sub-Merchants por Falha no PDS 0208',
    assessmentRef: 'ECP Monthly Notification — MID PayFac Aggregation',
    incidentWindow: 'Competência Setembro/2026',
    fixDeployDate: '28/09/2026 (Release PayFac-Segregation-v2)',
    affectedTxCount: '118 chargebacks agregados (de 42 sub-merchants distintos)',
    penaltyAmount: 'US$ 4.000,00',
    rootCausePt:
      'O código individual do vendedor final (Sub-Merchant ID no PDS 0208) foi enviado com um identificador estático do Subcredenciador no MTI 1240, fazendo com que 118 disputas distribuídas entre 42 sub-merchants independentes fossem contabilizadas sob um único MID perante o ECP (nenhum sub-merchant individual ultrapassou 15 chargebacks no mês).',
    rootCauseEn:
      'The individual Sub-Merchant ID (PDS 0208) was populated with a static Payment Facilitator identifier in outbound MTI 1240 messages, causing 118 chargebacks across 42 distinct sub-merchants to be aggregated under a single MID for ECP calculation (no individual sub-merchant exceeded 15 chargebacks in the month).',
    remediationEvidencePt:
      'A segregação individual do PDS 0208 + PDS 0220 (CNPJ/CPF do Sub-Merchant) entrou em produção em 28/09/2026. A planilha auditada anexa comprova que a razão individual de cada sub-merchant permaneceu abaixo do piso do programa ECM.',
    remediationEvidenceEn:
      'Granular Sub-Merchant segregation in PDS 0208 + PDS 0220 (Sub-Merchant Tax ID) went live on 2026-09-28. The attached audited breakdown demonstrates that every individual sub-merchant remained well below the ECM program threshold.',
    preventiveControlsPt:
      '1. Regra de validação obrigatória que exige PDS 0176 + PDS 0208 distinto por CNPJ/CPF + PDS 0220 em 100% das capturas de Subcredenciadores.',
    preventiveControlsEn:
      '1. Mandatory validation rule enforcing distinct PDS 0208 per Sub-Merchant Tax ID (PDS 0220) whenever PDS 0176 is present.',
  },
  {
    id: 'elo-pef-3ds-waiver',
    brand: 'elo',
    programCode: 'Elo PEF (Programa de Excelência em Fraude)',
    title: 'Elo — Omissão de Indicador 3DS 2.2 no Registro 02 (Pos 60) em Compras Autenticadas',
    assessmentRef: 'Notificação Mensal PEF — Critério de Uso de 3DS < 10%',
    incidentWindow: 'Competência Outubro/2026',
    fixDeployDate: '25/10/2026 (Release Elo-26.2-Reg02)',
    affectedTxCount: '9.640 transações e-commerce autenticadas',
    penaltyAmount: 'R$ 10.000,00',
    rootCausePt:
      'Embora 34,8% das transações e-commerce do estabelecimento tenham sido autenticadas com sucesso via 3DS 2.2 na autorização, o mapeador da remessa TE05 (Versão 26.2) preencheu o CAVV nas posições 17–58 do Registro 02 mas deixou em branco a posição 60 (Versão do 3DS), impedindo a contabilização do índice de autenticação na apuração do PEF.',
    rootCauseEn:
      'Although 34.8% of the merchant e-commerce transactions were successfully authenticated via 3DS 2.2 during authorization, the TE05 clearing mapper populated the CAVV in Record 02 (positions 17–58) but left position 60 (3DS Version Indicator) blank, preventing those transactions from being counted toward the 10% 3DS threshold in the PEF program.',
    remediationEvidencePt:
      'A Release Elo-26.2-Reg02 corrigiu o preenchimento simultâneo das posições 17–58 (CAVV) e posição 60 ("2" = 3DS 2.x) no Registro 02. Os logs de autorização e os relatórios da Agenda E1 comprovam que o uso real de 3DS foi de 34,8% (acima do mínimo de 10% do PEF).',
    remediationEvidenceEn:
      'Release Elo-26.2-Reg02 fixed the simultaneous population of positions 17–58 (CAVV) and position 60 ("2" = 3DS 2.x) in Record 02. Authorization logs confirm an actual 3DS rate of 34.8% (well above the 10% PEF exemption threshold).',
    preventiveControlsPt:
      '1. Regra de integridade cruzada no Registro 02: sempre que houver CAVV nas posições 17–58, a posição 60 (Versão 3DS) é validada como obrigatória antes do envio.',
    preventiveControlsEn:
      '1. Cross-field validation rule on Record 02 requiring position 60 (3DS Version) whenever a CAVV is present in positions 17–58.',
  },
];

export function OutgoingWaiverGenerator() {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(WAIVER_TEMPLATES[0].id);
  const [language, setLanguage] = useState<'pt' | 'en'>('pt');
  const [copied, setCopied] = useState<boolean>(false);

  const activeTemplate = useMemo(() => {
    return WAIVER_TEMPLATES.find((t) => t.id === selectedTemplateId) ?? WAIVER_TEMPLATES[0];
  }, [selectedTemplateId]);

  const [customWindow, setCustomWindow] = useState<string>(WAIVER_TEMPLATES[0].incidentWindow);
  const [customFixDate, setCustomFixDate] = useState<string>(WAIVER_TEMPLATES[0].fixDeployDate);
  const [customTxCount, setCustomTxCount] = useState<string>(WAIVER_TEMPLATES[0].affectedTxCount);
  const [customPenalty, setCustomPenalty] = useState<string>(WAIVER_TEMPLATES[0].penaltyAmount);

  const handleSelectTemplate = (tpl: WaiverTemplatePreset) => {
    setSelectedTemplateId(tpl.id);
    setCustomWindow(tpl.incidentWindow);
    setCustomFixDate(tpl.fixDeployDate);
    setCustomTxCount(tpl.affectedTxCount);
    setCustomPenalty(tpl.penaltyAmount);
    setCopied(false);
  };

  const generatedDocumentText = useMemo(() => {
    const brandName = OUTGOING_BRANDS[activeTemplate.brand].name;
    if (language === 'pt') {
      return [
        `SOLICITAÇÃO TÉCNICA FORMAL DE WAIVER (ISENÇÃO DE PENALIDADE / REAVALIAÇÃO DE COMPLIANCE)`,
        `====================================================================================`,
        `Bandeira Destinatária : ${brandName}`,
        `Programa / Referência : ${activeTemplate.programCode} (${activeTemplate.assessmentRef})`,
        `Janela do Incidente   : ${customWindow}`,
        `Data da Correção      : ${customFixDate}`,
        `Escopo Delimitado     : ${customTxCount}`,
        `Valor em Pleito       : ${customPenalty}`,
        ``,
        `1. SUMÁRIO EXECUTIVO DO PLEITO`,
        `Submetemos o presente dossiê técnico de Root Cause Analysis (RCA) e evidência de remediação em produção para solicitar o Waiver (isenção) da penalidade referente ao programa ${activeTemplate.programCode}. O evento decorreu de uma divergência estritamente técnica e pontual no mapeamento entre a camada de Autorização e o arquivo de Outgoing (Clearing), sem qualquer impacto financeiro adverso aos portadores ou aos estabelecimentos comerciais, estando 100% solucionado em produção.`,
        ``,
        `2. ANÁLISE DE CAUSA-RAIZ TÉCNICA (ROOT CAUSE ANALYSIS — RCA)`,
        `${activeTemplate.rootCausePt}`,
        ``,
        `3. AÇÃO DE CONTENÇÃO & EVIDÊNCIA DE CORREÇÃO DEFINITIVA (0,00% DE ERRO PÓS-FIX)`,
        `${activeTemplate.remediationEvidencePt}`,
        ``,
        `4. CONTROLES PREVENTIVOS IMPLANTADOS (GOVERNANÇA DE DATA INTEGRITY)`,
        `${activeTemplate.preventiveControlsPt}`,
        ``,
        `5. CONCLUSÃO E PEDIDO`,
        `Considerando (i) a identificação imediata e transparente da causa-raiz, (ii) a comprovação objetiva pelos relatórios oficiais da bandeira de que a taxa de erro retornou a 0,00% após ${customFixDate} e (iii) a implantação de travas preventivas permanentes no motor de Outgoing, solicitamos respeitosamente o deferimento do Waiver integral para o valor de ${customPenalty}.`,
      ].join('\n');
    }

    return [
      `FORMAL TECHNICAL WAIVER REQUEST & ROOT CAUSE ANALYSIS (RCA) DOSSIER`,
      `===================================================================`,
      `Target Scheme         : ${brandName}`,
      `Program / Assessment  : ${activeTemplate.programCode} (${activeTemplate.assessmentRef})`,
      `Incident Window       : ${customWindow}`,
      `Production Fix Date   : ${customFixDate}`,
      `Impacted Scope        : ${customTxCount}`,
      `Waiver Amount Sought  : ${customPenalty}`,
      ``,
      `1. EXECUTIVE SUMMARY`,
      `We respectfully submit this technical Root Cause Analysis (RCA) and production remediation dossier requesting a full fee waiver under the ${activeTemplate.programCode}. The variance stemmed from an isolated, non-recurring technical mapping issue between the real-time Authorization layer and the batch Clearing (Outgoing) file builder, with zero adverse financial impact to cardholders or merchants, and has been 100% resolved in production.`,
      ``,
      `2. TECHNICAL ROOT CAUSE ANALYSIS (RCA)`,
      `${activeTemplate.rootCauseEn}`,
      ``,
      `3. REMEDIATION & PRODUCTION VERIFICATION (0.00% POST-FIX ERROR RATE)`,
      `${activeTemplate.remediationEvidenceEn}`,
      ``,
      `4. PERMANENT PREVENTIVE CONTROLS IMPLEMENTED`,
      `${activeTemplate.preventiveControlsEn}`,
      ``,
      `5. CONCLUSION & WAIVER REQUEST`,
      `Given (i) the transparent root cause isolation, (ii) objective verification via official scheme clearing reports confirming a 0.00% error rate following ${customFixDate}, and (iii) permanent pre-edit validation gates added to our clearing pipeline, we kindly request a full waiver of the ${customPenalty} assessment.`,
    ].join('\n');
  }, [activeTemplate, language, customWindow, customFixDate, customTxCount, customPenalty]);

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(generatedDocumentText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // ignore
    }
  };

  const handleExportWaiverToDocStudio = () => {
    const brandName = OUTGOING_BRANDS[activeTemplate.brand].name;
    sendToDocStudio({
      mode: 'append_html',
      title: `Dossiê Técnico de Waiver — ${activeTemplate.programCode}`,
      sourceModule: 'Gerador de Dossiê de Waiver & RCA',
      html: `
        <h2>Dossiê Técnico de Pedido de Waiver — ${activeTemplate.programCode}</h2>
        <p><strong>Bandeira:</strong> ${brandName} | <strong>Referência:</strong> ${activeTemplate.assessmentRef}</p>
        <p><strong>Janela do Incidente:</strong> ${customWindow} | <strong>Deploy Corretivo:</strong> ${customFixDate}</p>
        <p><strong>Escopo Afetado:</strong> ${customTxCount} | <strong>Valor Pleiteado:</strong> ${customPenalty}</p>
        <h3>1. Causa-Raiz Técnica (RCA)</h3>
        <p>${language === 'pt' ? activeTemplate.rootCausePt : activeTemplate.rootCauseEn}</p>
        <h3>2. Evidência de Correção em Produção (Taxa de Erro 0,00%)</h3>
        <p>${language === 'pt' ? activeTemplate.remediationEvidencePt : activeTemplate.remediationEvidenceEn}</p>
        <h3>3. Controles Preventivos Implantados</h3>
        <pre>${language === 'pt' ? activeTemplate.preventiveControlsPt : activeTemplate.preventiveControlsEn}</pre>
      `,
      metadata: {
        brand: activeTemplate.brand,
        brandName,
        referenceId: activeTemplate.programCode,
        category: 'Waiver & Root Cause Analysis',
        executiveSummary: activeTemplate.title,
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 space-y-5 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <span className="text-xs font-black uppercase tracking-wider text-blue-400">
              Engenharia de Defesa Técnica & Governança de Data Integrity
            </span>
            <h3 className="text-lg sm:text-xl font-black text-white">
              Gerador Automático de Dossiê de Waiver & Root Cause Analysis (RCA)
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-4xl leading-relaxed">
              Monte em segundos a fundamentação técnica completa (com os <strong>4 pilares exigidos pelos comitês de
              compliance da Visa, Mastercard e Elo</strong>: Causa-Raiz, Escopo Delimitado, Evidência de 0% de Erro
              Pós-Fix nos Reports e Controles Preventivos) em Português ou Inglês.
            </p>
          </div>

          {/* Seletor de Idioma */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setLanguage('pt')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                language === 'pt'
                  ? 'bg-blue-600 text-white border-blue-500'
                  : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-600'
              }`}
            >
              🇧🇷 Dossiê em Português
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                language === 'en'
                  ? 'bg-blue-600 text-white border-blue-500'
                  : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-600'
              }`}
            >
              🇺🇸 English (Global Committee)
            </button>
          </div>
        </div>

        {/* Seletor de Templates Reais de Waiver */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {WAIVER_TEMPLATES.map((tpl) => {
            const isSel = tpl.id === activeTemplate.id;
            return (
              <button
                key={tpl.id}
                onClick={() => handleSelectTemplate(tpl)}
                className={`rounded-xl p-3.5 text-left border transition-all flex flex-col justify-between gap-2 ${
                  isSel
                    ? 'bg-blue-950/50 border-blue-400 shadow-md'
                    : 'bg-slate-950/70 border-slate-800 hover:border-slate-600'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[11px] font-black text-blue-400 uppercase">
                      {tpl.brand}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 font-mono text-[10px] text-emerald-300">
                      {tpl.penaltyAmount}
                    </span>
                  </div>
                  <div className="text-xs font-black text-white leading-snug">{tpl.title}</div>
                </div>
                <div className="text-[11px] text-slate-400">{tpl.programCode}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Editor de Parâmetros do Caso + Carta Gerada */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Coluna Esquerda (5 cols): Parâmetros Customizáveis */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-800 bg-slate-900/90 p-5 space-y-4 shadow-xl">
          <div className="border-b border-slate-800 pb-3">
            <h4 className="text-sm font-black uppercase tracking-wider text-white">
              1. Parâmetros do Incidente & Escopo
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Personalize os dados abaixo para atualizar o dossiê ao lado em tempo real.
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Janela Exata do Incidente (Início e Fim)
              </label>
              <input
                type="text"
                value={customWindow}
                onChange={(e) => setCustomWindow(e.target.value)}
                className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Data / Release do Deploy Corretivo em Produção
              </label>
              <input
                type="text"
                value={customFixDate}
                onChange={(e) => setCustomFixDate(e.target.value)}
                className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Volume Delimitado de Transações Afetadas
              </label>
              <input
                type="text"
                value={customTxCount}
                onChange={(e) => setCustomTxCount(e.target.value)}
                className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Valor da Penalidade / Multa em Pleito de Waiver
              </label>
              <input
                type="text"
                value={customPenalty}
                onChange={(e) => setCustomPenalty(e.target.value)}
                className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white"
              />
            </div>
          </div>

          <div className="rounded-xl bg-emerald-950/15 border border-emerald-500/30 p-4 space-y-1.5 text-xs">
            <div className="font-black uppercase tracking-wider text-emerald-300">
              ✓ Checklist de Aprovação do Comitê da Bandeira
            </div>
            <p className="text-slate-200 leading-relaxed">
              • Causa-raiz técnica isolada em nível de campo/registro (`TCR`, `PDS`, `DE`).<br />
              • Janela temporal fechada com número de release corretivo.<br />
              • Comprovação pelos relatórios oficiais (`VX-100A`, `IP714010`, `TE01`) de erro zerado.<br />
              • Trava preventiva (`Pre-Edit Linter`) implementada.
            </p>
          </div>
        </div>

        {/* Coluna Direita (7 cols): Documento Oficial Pronto */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-800 bg-slate-900/90 p-5 space-y-4 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <h4 className="text-sm font-black uppercase tracking-wider text-white">
              2. Minuta Técnica Oficial Pronta ({language === 'pt' ? 'Português' : 'English'})
            </h4>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyText}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all"
              >
                {copied ? '✓ Copiado p/ Área de Transferência!' : '📋 Copiar Dossiê Completo'}
              </button>
              <button
                onClick={handleExportWaiverToDocStudio}
                className="px-3.5 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-xs font-bold text-blue-300 transition-all"
              >
                📄 Abrir no Doc Studio
              </button>
            </div>
          </div>

          <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">
            {generatedDocumentText}
          </pre>
        </div>
      </div>
    </div>
  );
}
