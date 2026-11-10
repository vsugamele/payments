'use client';

import React, { useMemo, useState } from 'react';
import { OutgoingBrandId } from '@/data/outgoing-tables-flows';
import { sendToDocStudio } from '@/lib/docStudioBridge';

export interface DisputeScenarioSpec {
  id: string;
  categoryBadge: string;
  title: string;
  subtitle: string;
  codesByBrand: {
    visa: string;
    elo: string;
    mastercard: string;
  };
  incomingRecord: {
    visa: string;
    elo: string;
    mastercard: string;
  };
  outgoingRepresentmentRecord: {
    visa: string;
    elo: string;
    mastercard: string;
  };
  winningFieldsInOriginalOutgoing: string[];
  compellingEvidenceAndDefenseRules: string[];
  timeframesAndDeadlines: string;
}

export const DISPUTE_DECISION_TREE: DisputeScenarioSpec[] = [
  {
    id: 'fraud-cnp-3ds-ce3',
    categoryBadge: '1. Fraude CNP (E-Commerce)',
    title: 'Fraude Não Presencial (Card-Not-Present): Liability Shift 3DS 2.2 & Compelling Evidence 3.0',
    subtitle:
      'Quando o portador nega uma compra online. Desenho da defesa automática pelo Outgoing original (CAVV/ECI) ou pela reapresentação CE 3.0.',
    codesByBrand: {
      visa: 'Condition 10.4 — Other Fraud: Card-Absent Environment',
      elo: 'Motivo Fraude CNP (Ambiente Não Presencial)',
      mastercard: 'Reason Code 4837 — No Cardholder Authorization',
    },
    incomingRecord: {
      visa: 'Incoming Base II TC 15 (Dispute Financial) · TCR 0 + TCR 1 + TCR 5',
      elo: 'Incoming TE15 (Chargeback Recebido) · Registros 00, 01 e 02',
      mastercard: 'Incoming GCMS MTI 1442 (First Chargeback · Function Code 450) + PDS 0025',
    },
    outgoingRepresentmentRecord: {
      visa: 'Outgoing VROL / Base II Reapresentação (Dispute Response) + CE 3.0 Footprint Data',
      elo: 'Outgoing TE25 (Reapresentação de Disputa) · Registros 00, 01 e 02 com indicador documental',
      mastercard: 'Outgoing GCMS MTI 1240 (Second Presentment · Function Code 205 / 282) + PDS 0025 + PDS 0190',
    },
    winningFieldsInOriginalOutgoing: [
      'Visa TCR 5: ECI 05 (Totalmente Autenticado) ou ECI 06 (Tentativa) + CAVV válido + Directory Server Tx ID',
      'Elo Registro 02: CAVV (pos 17–58) + ECI (pos 59) + Versão 3DS 2.x (pos 60 = "2")',
      'Mastercard MTI 1240: DE 48 SE 42 (SLI 212 / 211) + UCAF / AAV + Directory Server Transaction ID (DE 48 SE 66)',
    ],
    compellingEvidenceAndDefenseRules: [
      'Defesa Nível 1 (Bloqueio Automático / Liability Shift 3DS): Se o Outgoing original (TC 05 / TE05 / MTI 1240) levou ECI 05/06 (Visa/Elo) ou SLI 212/211 (Mastercard) com CAVV/AAV válido, a responsabilidade da fraude já foi transferida para o Emissor.',
      'Defesa Nível 2 (Compelling Evidence 3.0 — CE 3.0 para transações sem 3DS): Apresentar 2 transações históricas anteriores do mesmo cartão, liquidadas há mais de 120 dias (e menos de 365 dias) sem relato de fraude (TC40/SAFE), onde pelo menos 2 elementos coincidam com a transação contestada (IP Address, Device ID/Fingerprint, User Account ID ou Shipping Address).',
    ],
    timeframesAndDeadlines:
      'Prazo de resposta do Adquirente (Representment): até 30 dias corridos na Visa/Elo e até 45 dias corridos na Mastercard a partir da data de processamento do 1º Chargeback.',
  },
  {
    id: 'fraud-cp-emv-chip',
    categoryBadge: '2. Fraude Presencial (Chip EMV / NFC)',
    title: 'Fraude Presencial com Chip EMV / Contactless: Proteção pelo TCR 7 / Reg 07 / DE 55',
    subtitle:
      'Como o envio correto dos dados criptográficos do chip no Outgoing original garante vitória imediata contra chargeback de fraude presencial.',
    codesByBrand: {
      visa: 'Condition 10.1 (EMV Liability Shift Counterfeit) & 10.2 (Non-Counterfeit)',
      elo: 'Motivo Fraude Presencial / Falsificação de Cartão com Chip',
      mastercard: 'Reason Code 4870 (Chip Liability Shift) & 4871 (Chip/PIN Liability Shift)',
    },
    incomingRecord: {
      visa: 'Incoming TC 15 (Condition 10.1 / 10.2)',
      elo: 'Incoming TE15 (Fraude Presencial)',
      mastercard: 'Incoming MTI 1442 (RC 4870 / 4871)',
    },
    outgoingRepresentmentRecord: {
      visa: 'Reapresentação comprovando envio de POS Entry 05/07 + TCR 7 completo no TC 05 original',
      elo: 'Outgoing TE25 referenciando o Registro 07 (ARQC + ATC + TVR) enviado no TE05 original',
      mastercard: 'Outgoing MTI 1240 (FC 205) comprovando DE 22 (Chip) + DE 55 (Tags EMV) no First Presentment',
    },
    winningFieldsInOriginalOutgoing: [
      'Visa TC 05: TCR 0 pos 158–159 = "05" ou "07" + Registro TCR 7 completo (Tags 9F26 ARQC, 9F36 ATC, 95 TVR, 9F10 IAD)',
      'Elo TE05: Registro 00 POS Entry Mode Chip + Registro 07 completo (pos 1–168)',
      'Mastercard MTI 1240: DE 22 / PDS 0023 indicando leitura de Chip + DE 55 com criptograma EMV íntegro',
    ],
    compellingEvidenceAndDefenseRules: [
      'Atenção Crítica de Engenharia: Se a transação foi capturada por Chip (POS Entry = 05/07), mas o motor de Outgoing esqueceu de anexar o registro EMV (TCR 7 / Reg 07 / DE 55) ou fez Fallback para trilha magnética (POS Entry 80/90) em cartão com chip funcional, a Adquirente perde o Liability Shift e assume 100% do prejuízo.',
    ],
    timeframesAndDeadlines:
      'Prazo de reapresentação: 30 dias (Visa/Elo) a 45 dias (Mastercard).',
  },
  {
    id: 'consumer-dispute-merchandise',
    categoryBadge: '3. Desacordo Comercial & Cancelamento',
    title: 'Desacordo Comercial, Mercadoria Não Recebida ou Recorrência Cancelada',
    subtitle:
      'Fluxo de reapresentação documental (TE25 / FC 205 / VROL) quando o portador alega não recebimento, defeito ou cobrança após cancelamento.',
    codesByBrand: {
      visa: 'Condition 13.1 (Merchandise/Services Not Received), 13.2 (Cancelled Recurring) & 13.3 (Not as Described)',
      elo: 'Motivo Desacordo Comercial / Mercadoria Não Entregue / Cancelamento',
      mastercard: 'Reason Code 4853 — Cardholder Dispute (Defective/Not as Described/Not Provided)',
    },
    incomingRecord: {
      visa: 'Incoming TC 15 (Condition 13.x)',
      elo: 'Incoming TE15 (Desacordo Comercial)',
      mastercard: 'Incoming MTI 1442 (Reason Code 4853)',
    },
    outgoingRepresentmentRecord: {
      visa: 'Dispute Response via VROL com comprovante de entrega assinado/rastreamento ou log de uso digital',
      elo: 'Outgoing TE25 (Registros 00, 01 e 02) + Anexo de comprovação de entrega no portal de disputas Elo',
      mastercard: 'Outgoing MTI 1240 (Function Code 205) + Mastercom Document Indicator (PDS 0025 / Ebids)',
    },
    winningFieldsInOriginalOutgoing: [
      'ARN (Acquirer Reference Number de 23 dígitos no TCR 0 / Reg 00 / PDS 0025) para rastreamento único',
      'Descritor correto do estabelecimento e Sub-Merchant (DE 43 + TCR E / PDS 0208 / Reg 02) para o portador reconhecer a compra na fatura',
    ],
    compellingEvidenceAndDefenseRules: [
      'Se o adquirente já emitiu um crédito/estorno (TC 06 / TE06 / MTI 1240 DE 3=20) antes do chargeback chegar, basta informar o ARN e a data de liquidação do crédito na reapresentação para anular a disputa instantaneamente (Credit Previously Issued).',
    ],
    timeframesAndDeadlines:
      'Prazo de reapresentação: 30 dias (Visa/Elo) e 45 dias (Mastercard).',
  },
  {
    id: 'processing-error-late-duplicate',
    categoryBadge: '4. Erro de Processamento & Prazo',
    title: 'Apresentação Tardia (Late Presentment) & Duplicidade de Liquidação',
    subtitle:
      'Disputas causadas diretamente por atraso no envio do arquivo de Outgoing ou reenvio duplicado do mesmo lote.',
    codesByBrand: {
      visa: 'Condition 12.1 (Late Presentment) & 12.6 (Duplicate Processing)',
      elo: 'Motivo Apresentação Fora do Prazo / Processamento Duplicado',
      mastercard: 'Reason Code 4842 (Late Presentment) & 4834 (Point-of-Interaction Error / Duplicate)',
    },
    incomingRecord: {
      visa: 'Incoming TC 15 (Condition 12.1 / 12.6)',
      elo: 'Incoming TE15 (Erro de Processamento)',
      mastercard: 'Incoming MTI 1442 (RC 4842 / 4834)',
    },
    outgoingRepresentmentRecord: {
      visa: 'Reapresentação somente se a conta do portador estava ativa/boa ou se as duas transações tiveram códigos de autorização (DE 38) e TIDs (DE 62.2) distintos',
      elo: 'Outgoing TE25 comprovando autorizações distintas (DE 38 diferentes) ou envio dentro do prazo regulamentar',
      mastercard: 'Outgoing MTI 1240 (FC 205) comprovando dois Trace IDs (DE 63) distintos em compras separadas',
    },
    winningFieldsInOriginalOutgoing: [
      'Data da Transação (Purchase Date / DE 12) × Data Central de Processamento (Central Processing Date ≤ prazo máximo)',
      'ARN único por transação + TID (DE 62.2) / Trace ID (PDS 0158) individualizados',
    ],
    compellingEvidenceAndDefenseRules: [
      'Regra de Ouro: Toda transação autorizada deve ser enviada no Outgoing em D+0 ou D+1 (nunca ultrapassar a janela de Timeliness de 7 a 10 dias). Em caso de reenvio de lote rejeitado, reenviar APENAS os registros que constaram no relatório de rejeição (VX-100A / TE01 Reg 09 / T112), nunca o arquivo inteiro já aceito.',
    ],
    timeframesAndDeadlines:
      'Janela ideal de envio do Outgoing: D+0 / D+1. Teto máximo antes de Late Presentment: 7 a 30 dias conforme modalidade e status da conta.',
  },
  {
    id: 'authorization-error-no-auth',
    categoryBadge: '5. Falha de Autorização',
    title: 'Transação Liquidada sem Autorização Válida ou Acima do Valor Autorizado',
    subtitle:
      'Quando o arquivo de Outgoing cobra uma transação que foi negada na 0110 (DE 39 != 00) ou cujo valor no clearing excede o valor autorizado.',
    codesByBrand: {
      visa: 'Condition 11.1 (Card Recovery Bulletin) & 11.3 (No Authorization)',
      elo: 'Motivo Ausência de Autorização Válida / Valor Excedente',
      mastercard: 'Reason Code 4808 — Authorization-Related Chargeback',
    },
    incomingRecord: {
      visa: 'Incoming TC 15 (Condition 11.3)',
      elo: 'Incoming TE15 (Falha de Autorização)',
      mastercard: 'Incoming MTI 1442 (Reason Code 4808)',
    },
    outgoingRepresentmentRecord: {
      visa: 'Reapresentação com prova do DE 62.2 (TID) e DE 38 (Auth Code) aprovados na 0110',
      elo: 'Outgoing TE25 apresentando o Código de Autorização (Reg 00 pos 93–98) e NSU válidos',
      mastercard: 'Outgoing MTI 1240 (FC 205) comprovando o DE 38 + DE 63 (Trace ID) aprovados no Banknet',
    },
    winningFieldsInOriginalOutgoing: [
      'Código de Autorização (DE 38 — 6 caracteres) idêntico ao retornado na 0110',
      'Valor de Liquidação (Source Amount / DE 4) menor ou igual ao valor autorizado (ou dentro da tolerância setorial permitida para Hotel/Locadora c/ indicador válido)',
    ],
    compellingEvidenceAndDefenseRules: [
      'Bloquear na origem qualquer captura cujo DE 39 na 0110 seja diferente de "00" (ou "10" para aprovação parcial pelo valor exato aprovado).',
    ],
    timeframesAndDeadlines:
      'Auditoria preventiva em T+0 antes do fechamento do arquivo de Outgoing.',
  },
];

interface Props {
  selectedBrand: OutgoingBrandId;
}

export function OutgoingDisputesExplorer({ selectedBrand }: Props) {
  const [selectedDisputeId, setSelectedDisputeId] = useState<string>(
    DISPUTE_DECISION_TREE[0].id
  );

  const activeScenario = useMemo(() => {
    return (
      DISPUTE_DECISION_TREE.find((d) => d.id === selectedDisputeId) ??
      DISPUTE_DECISION_TREE[0]
    );
  }, [selectedDisputeId]);

  const handleExportDisputeToDocStudio = (sc: DisputeScenarioSpec) => {
    const winningItems = sc.winningFieldsInOriginalOutgoing
      .map((w) => `<li>${w}</li>`)
      .join('');
    const rulesItems = sc.compellingEvidenceAndDefenseRules
      .map((r) => `<li>${r}</li>`)
      .join('');

    sendToDocStudio({
      mode: 'append_html',
      title: `Árvore de Disputa & Representment — ${sc.title}`,
      sourceModule: 'Árvore de Decisão de Disputas / Chargebacks no Outgoing',
      html: `
        <h2>${sc.categoryBadge} — ${sc.title}</h2>
        <p>${sc.subtitle}</p>
        <h3>Códigos de Razão por Bandeira</h3>
        <ul>
          <li><strong>Visa:</strong> ${sc.codesByBrand.visa}</li>
          <li><strong>Elo:</strong> ${sc.codesByBrand.elo}</li>
          <li><strong>Mastercard:</strong> ${sc.codesByBrand.mastercard}</li>
        </ul>
        <h3>Mensageria de Incoming (1º Chargeback) × Outgoing (Representment)</h3>
        <table>
          <thead>
            <tr><th>Bandeira</th><th>Incoming (1º Chargeback)</th><th>Outgoing (2ª Apresentação / Representment)</th></tr>
          </thead>
          <tbody>
            <tr><td><strong>Visa</strong></td><td>${sc.incomingRecord.visa}</td><td>${sc.outgoingRepresentmentRecord.visa}</td></tr>
            <tr><td><strong>Elo</strong></td><td>${sc.incomingRecord.elo}</td><td>${sc.outgoingRepresentmentRecord.elo}</td></tr>
            <tr><td><strong>Mastercard</strong></td><td>${sc.incomingRecord.mastercard}</td><td>${sc.outgoingRepresentmentRecord.mastercard}</td></tr>
          </tbody>
        </table>
        <h3>Campos do Outgoing Original que Garantem Vitória / Liability Shift</h3>
        <ul>${winningItems}</ul>
        <h3>Regras de Defesa & Compelling Evidence</h3>
        <ul>${rulesItems}</ul>
        <p><strong>Prazos e SLA:</strong> ${sc.timeframesAndDeadlines}</p>
      `,
      metadata: {
        brand: selectedBrand,
        brandName: 'Visa · Elo · Mastercard',
        referenceId: sc.id.toUpperCase(),
        category: 'Disputas & Representment no Outgoing',
        executiveSummary: sc.subtitle,
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
              Ciclo Completo de Disputas na Liquidação · TC 15/05 · TE15/TE25 · MTI 1442/1240
            </span>
            <h3 className="text-lg sm:text-xl font-black text-white">
              Árvore de Decisão de Disputas, Chargebacks & Reapresentação (Representment) no Outgoing
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-4xl leading-relaxed">
              Veja para cada família de disputa quais registros chegam no <strong>Incoming (1º Chargeback)</strong>,
              quais registros saem no seu <strong>Outgoing de Reapresentação (2nd Presentment)</strong> e quais campos
              da venda original (<strong>CAVV 3DS, CE 3.0, TCR 7 EMV, TID/Trace ID</strong>) garantem vitória técnica.
            </p>
          </div>

          <button
            onClick={() => handleExportDisputeToDocStudio(activeScenario)}
            className="px-3.5 py-2.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-xs font-bold text-blue-300 transition-all shrink-0"
          >
            📄 Exportar Árvore p/ Doc Studio
          </button>
        </div>

        {/* Seletor das 5 Famílias de Disputa */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          {DISPUTE_DECISION_TREE.map((sc) => {
            const isSel = sc.id === activeScenario.id;
            return (
              <button
                key={sc.id}
                onClick={() => setSelectedDisputeId(sc.id)}
                className={`rounded-xl p-3.5 text-left border transition-all flex flex-col justify-between gap-2 ${
                  isSel
                    ? 'bg-blue-950/50 border-blue-400 shadow-md'
                    : 'bg-slate-950/70 border-slate-800 hover:border-slate-600'
                }`}
              >
                <div className="font-mono text-[11px] font-black text-blue-400">
                  {sc.categoryBadge}
                </div>
                <div className="text-xs font-bold text-white leading-snug">{sc.title}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Detalhe do Cenário de Disputa Selecionado */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 space-y-6 shadow-xl">
        <div className="border-b border-slate-800 pb-4 space-y-1">
          <span className="text-xs font-black uppercase tracking-wider text-blue-400">
            {activeScenario.categoryBadge}
          </span>
          <h4 className="text-xl font-black text-white">{activeScenario.title}</h4>
          <p className="text-xs sm:text-sm text-slate-300">{activeScenario.subtitle}</p>
        </div>

        {/* Comparativo 3 Bandeiras: Código + Incoming + Outgoing Representment */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {[
            {
              id: 'visa',
              label: 'VISA (Base II & VROL)',
              border: 'border-blue-500/35',
              code: activeScenario.codesByBrand.visa,
              inc: activeScenario.incomingRecord.visa,
              out: activeScenario.outgoingRepresentmentRecord.visa,
            },
            {
              id: 'elo',
              label: 'ELO (Liquidação 26.2 — TE15 / TE25)',
              border: 'border-amber-500/35',
              code: activeScenario.codesByBrand.elo,
              inc: activeScenario.incomingRecord.elo,
              out: activeScenario.outgoingRepresentmentRecord.elo,
            },
            {
              id: 'mastercard',
              label: 'MASTERCARD (GCMS — MTI 1442 / 1240)',
              border: 'border-orange-500/35',
              code: activeScenario.codesByBrand.mastercard,
              inc: activeScenario.incomingRecord.mastercard,
              out: activeScenario.outgoingRepresentmentRecord.mastercard,
            },
          ].map((b) => (
            <div
              key={b.id}
              className={`rounded-xl bg-slate-950/90 border ${b.border} p-4 space-y-3`}
            >
              <div className="text-xs font-black text-white border-b border-slate-800 pb-2">
                {b.label}
              </div>
              <div className="space-y-1">
                <div className="text-[11px] font-bold text-rose-400">Código da Disputa:</div>
                <div className="font-mono text-xs text-white">{b.code}</div>
              </div>
              <div className="space-y-1">
                <div className="text-[11px] font-bold text-amber-400">
                  📥 Como Chega no Incoming (1º Chargeback):
                </div>
                <div className="text-xs text-slate-200 leading-relaxed">{b.inc}</div>
              </div>
              <div className="space-y-1">
                <div className="text-[11px] font-bold text-emerald-400">
                  📤 Como Sai no Outgoing (2ª Apresentação / Representment):
                </div>
                <div className="text-xs text-slate-200 leading-relaxed">{b.out}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Campos do Outgoing Original que Garantem Vitória + Regras CE 3.0 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-xl bg-emerald-950/15 border border-emerald-500/30 p-4 space-y-2.5">
            <div className="text-xs font-black uppercase tracking-wider text-emerald-300">
              1. Campos do Outgoing Original que Garantem Liability Shift / Defesa
            </div>
            <ul className="space-y-2">
              {activeScenario.winningFieldsInOriginalOutgoing.map((wf, idx) => (
                <li key={idx} className="text-xs text-slate-200 flex items-start gap-2 leading-relaxed">
                  <span className="text-emerald-400 font-black">✓</span>
                  <span>{wf}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl bg-blue-950/15 border border-blue-500/30 p-4 space-y-2.5">
            <div className="text-xs font-black uppercase tracking-wider text-blue-300">
              2. Regras de Reapresentação, Compelling Evidence 3.0 & Prazos
            </div>
            <ul className="space-y-2">
              {activeScenario.compellingEvidenceAndDefenseRules.map((rule, idx) => (
                <li key={idx} className="text-xs text-slate-200 flex items-start gap-2 leading-relaxed">
                  <span className="text-blue-400 font-black">•</span>
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
            <div className="pt-2 border-t border-slate-800 text-xs text-amber-300 font-semibold">
              ⏱ {activeScenario.timeframesAndDeadlines}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
