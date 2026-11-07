'use client';

import React, { useMemo, useState } from 'react';
import {
  OUTGOING_BRANDS,
  OUTGOING_TABLES,
  OutgoingBrandId,
  OutgoingFieldSpec,
  OutgoingFlowSpec,
  OutgoingTableSpec,
} from '@/data/outgoing-tables-flows';

// ============================================================================
// 1. BLUEPRINT VISUAL DA ARQUITETURA FÍSICA DO ARQUIVO (ESTILO MC/VISA DEV)
// ============================================================================
export function OutgoingArchitectureBlueprint({
  brand,
  onSelectTable,
}: {
  brand: OutgoingBrandId;
  onSelectTable: (brand: OutgoingBrandId, tableId: string) => void;
}) {
  const blueprints: Record<
    OutgoingBrandId,
    {
      protocolBadge: string;
      framingTitle: string;
      framingSubtitle: string;
      layers: {
        stage: string;
        role: string;
        status: 'M' | 'C';
        color: string;
        nodes: { tableId: string; code: string; label: string; bytesOrFormat: string; status: 'M' | 'C' }[];
      }[];
      wireAnatomy: { seg: string; size: string; desc: string; tone: string }[];
    }
  > = {
    visa: {
      protocolBadge: 'VISA DEVELOPER BLUEPRINT · BASE II CTF (168-BYTE FIXED ASCII/EBCDIC)',
      framingTitle: 'Arquitetura Contígua de Transaction Component Records (TCR 0 a TCR E)',
      framingSubtitle:
        'Cada transação financeira (TC 05 / TC 06 / TC 15 / TC 25) é fatiada em registros físicos de 168 bytes empilhados em ordem crescente de TCR.',
      layers: [
        {
          stage: '1. Envelope de Abertura',
          role: 'Identifica o CIB do Processador Remetente, data de processamento e versão do Edit Package.',
          status: 'M',
          color: 'border-blue-500/40 bg-blue-950/20',
          nodes: [
            { tableId: 'visa-tc90', code: 'TC 90', label: 'File Header Record', bytesOrFormat: '168 bytes [M]', status: 'M' },
          ],
        },
        {
          stage: '2. Espinha Dorsal Obrigatória (Core Transaction)',
          role: 'Presente em 100% das compras e créditos domésticos no Brasil.',
          status: 'M',
          color: 'border-emerald-500/40 bg-emerald-950/20',
          nodes: [
            { tableId: 'visa-tcr0', code: 'TCR 0', label: 'Dados Financeiros, PAN, MCC, ARN & Intercâmbio', bytesOrFormat: '168 bytes [M]', status: 'M' },
            { tableId: 'visa-tcr1', code: 'TCR 1', label: 'Dados Adicionais, Endereço EC & Disputa', bytesOrFormat: '168 bytes [M]', status: 'M' },
            { tableId: 'visa-tcr2-br', code: 'TCR 2 (BR)', label: 'Liquidação Nacional Brasil (Pos 40-41 = Parcelas+10)', bytesOrFormat: '168 bytes [M no BR]', status: 'M' },
            { tableId: 'visa-tcr5', code: 'TCR 5', label: 'Payment Service Data (TID 15 pos, CAVV, MVV, CPS)', bytesOrFormat: '168 bytes [M]', status: 'M' },
          ],
        },
        {
          stage: '3. Extensões Condicionais de Canal, Segurança & Ramo',
          role: 'Injetadas no lote apenas quando o gatilho operacional da transação exigir.',
          status: 'C',
          color: 'border-amber-500/40 bg-amber-950/15',
          nodes: [
            { tableId: 'visa-tcr7', code: 'TCR 7', label: 'Chip Card EMV (ARQC, TVR, ATC, IAD)', bytesOrFormat: '168 bytes [C: Chip/NFC]', status: 'C' },
            { tableId: 'visa-tcrd', code: 'TCR D', label: 'Crediário, Recorrência, OCT/AFT & 3DS 2.x', bytesOrFormat: '168 bytes [C: Mod.]', status: 'C' },
            { tableId: 'visa-tcre', code: 'TCR E', label: 'PayFac / Subcredenciador, Marketplace & B2B', bytesOrFormat: '168 bytes [C: PayFac]', status: 'C' },
            { tableId: 'visa-tcr3', code: 'TCR 3', label: 'Indústria Específica (Companhia Aérea IATA, Hotel, Auto)', bytesOrFormat: '168 bytes [C: Setorial]', status: 'C' },
            { tableId: 'visa-tc10-20', code: 'TC 10 / 20', label: 'Fee Collection & Funds Disbursement', bytesOrFormat: '168 bytes [C: Ajuste]', status: 'C' },
          ],
        },
        {
          stage: '4. Fechamento e Checksum de Lote/Arquivo',
          role: 'Totaliza contagem de TCRs, valores financeiros (Source Amount) e encerra o CTF.',
          status: 'M',
          color: 'border-purple-500/40 bg-purple-950/20',
          nodes: [
            { tableId: 'visa-tc91-92', code: 'TC 91 + TC 92', label: 'Batch Trailer & File Trailer', bytesOrFormat: '168 bytes [M]', status: 'M' },
          ],
        },
      ],
      wireAnatomy: [
        { seg: 'Pos 01–02', size: '2B', desc: 'TC (05/06/15/25/90/91/92)', tone: 'bg-blue-500/20 border-blue-500/40 text-blue-200' },
        { seg: 'Pos 03', size: '1B', desc: 'TC Qualifier (0)', tone: 'bg-slate-800 border-slate-700 text-slate-300' },
        { seg: 'Pos 04', size: '1B', desc: 'TCR Number (0,1,2,3,5,7,D,E)', tone: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-200' },
        { seg: 'Pos 05–166', size: '162B', desc: 'Payload Posicional Específico do TCR (PAN/ARN/BRL/TID/EMV/PayFac)', tone: 'bg-indigo-500/20 border-indigo-500/40 text-indigo-200' },
        { seg: 'Pos 167–168', size: '2B', desc: 'Reservado / Rejeição Base II', tone: 'bg-amber-500/20 border-amber-500/40 text-amber-200' },
      ],
    },
    elo: {
      protocolBadge: 'ELO PORTAL DO DESENVOLVEDOR · SERVIÇO 10 LIQUIDAÇÃO (26.2 · 168 BYTES)',
      framingTitle: 'Arquitetura de Sub-Registros Posicionais (00 a 09) em 4 Janelas Diárias',
      framingSubtitle:
        'A trinca 00 + 01 + 02 é sempre obrigatória em qualquer TE05/TE06/TE15/TE25; os sub-registros 03, 05, 07 e 08 entram sob gatilho operacional.',
      layers: [
        {
          stage: '1. Header de Arquivo (Rota 1 = Credenciador → Bandeira)',
          role: 'Abre uma das 4 janelas diárias (11h, 15h, 19h ou 00h) do Serviço 10.',
          status: 'M',
          color: 'border-amber-500/40 bg-amber-950/20',
          nodes: [
            { tableId: 'elo-b0', code: 'Header B0', label: 'Pos 1-2 = B0 · Serviço 10 · Remessa · Versão 26.2', bytesOrFormat: '168 bytes [M]', status: 'M' },
          ],
        },
        {
          stage: '2. Trinca Base Obrigatória (Sempre Presente na TE05 / TE06)',
          role: 'Se faltar qualquer um dos registros 00, 01 ou 02, a transação inteira é recusada.',
          status: 'M',
          color: 'border-emerald-500/40 bg-emerald-950/20',
          nodes: [
            { tableId: 'elo-reg00', code: 'Registro 00', label: 'Dados Principais (PAN, Valor, MCC, ARN, Cód. Autorização)', bytesOrFormat: '168 bytes [M]', status: 'M' },
            { tableId: 'elo-reg01', code: 'Registro 01', label: 'Dados Adicionais (Parcelas, NSU 12 pos, Ponto Venda, CNPJ/CPF)', bytesOrFormat: '168 bytes [M]', status: 'M' },
            { tableId: 'elo-reg02', code: 'Registro 02', label: 'Dados do País (Tipo Operação 990-995, Token, Subcred., IBGE)', bytesOrFormat: '168 bytes [M]', status: 'M' },
          ],
        },
        {
          stage: '3. Sub-Registros Condicionais por Canal & Modalidade',
          role: 'Acoplados imediatamente após o Registro 02 conforme o tipo da operação.',
          status: 'C',
          color: 'border-blue-500/40 bg-blue-950/20',
          nodes: [
            { tableId: 'elo-reg03', code: 'Registro 03', label: 'Transferência de Fundos (Proc 53 · P2P / CSB / DSB)', bytesOrFormat: '168 bytes [C: Proc 53]', status: 'C' },
            { tableId: 'elo-reg05', code: 'Registro 05', label: 'Serviço de Pagamento (3DS 2.2 · CAVV · XID · ECI)', bytesOrFormat: '168 bytes [C: E-Comm]', status: 'C' },
            { tableId: 'elo-reg07', code: 'Registro 07', label: 'Dados de Chip EMV (Criptograma 9F26, TVR, ATC, IAD)', bytesOrFormat: '168 bytes [C: Chip/NFC]', status: 'C' },
            { tableId: 'elo-reg08', code: 'Registro 08', label: 'Companhias Aéreas IATA (Bilhete, Trechos & Taxa Embarque)', bytesOrFormat: '168 bytes [C: IATA]', status: 'C' },
          ],
        },
        {
          stage: '4. Fechamento BZ & Retorno de Rejeição Parcial (TE01)',
          role: 'Trailer BZ fecha o lote; caso haja erro sintático, a Elo devolve a transação como TE01 com o Registro 09.',
          status: 'M',
          color: 'border-purple-500/40 bg-purple-950/20',
          nodes: [
            { tableId: 'elo-bz', code: 'Trailer BZ', label: 'Totalizador de Registros e Valor Total das Transações', bytesOrFormat: '168 bytes [M]', status: 'M' },
            { tableId: 'elo-reg09', code: 'Registro 09 (TE01)', label: 'Diagnóstico de Rejeição (TE Original + Código de Erro)', bytesOrFormat: '168 bytes [C: Rejeição]', status: 'C' },
          ],
        },
      ],
      wireAnatomy: [
        { seg: 'Pos 01–02', size: '2B', desc: 'Código TE (05/06/15/25/B0/BZ)', tone: 'bg-amber-500/20 border-amber-500/40 text-amber-200' },
        { seg: 'Pos 03–04', size: '2B', desc: 'Subcódigo (00, 01, 02, 03, 05, 07, 08, 09)', tone: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-200' },
        { seg: 'Pos 05–165', size: '161B', desc: 'Campos de Negócio Posicionais (00 + 01 + 02 + Extensões)', tone: 'bg-blue-500/20 border-blue-500/40 text-blue-200' },
        { seg: 'Pos 166–168', size: '3B', desc: 'Reservado / Código de Erro por Sub-registro', tone: 'bg-rose-500/20 border-rose-500/40 text-rose-200' },
      ],
    },
    mastercard: {
      protocolBadge: 'MASTERCARD DEVELOPERS BLUEPRINT · GCMS / IPM (ISO 8583:1993 · 1014B BLOCKED)',
      framingTitle: 'Arquitetura Orientada a Bitmaps (DE 1–128) + Sub-elementos TLV (PDS 0001–0306)',
      framingSubtitle:
        'Em vez de múltiplos registros de 168B, a Mastercard consolida a apresentação financeira na mensagem MTI 1240 (Function Code 200) com blocos PDS dinâmicos.',
      layers: [
        {
          stage: '1. File Header IPM (MTI 1644 / Function Code 697)',
          role: 'Abre o arquivo lógico R111 no GCMS identificando o File ID (PDS 0105) e o Originator ICA.',
          status: 'M',
          color: 'border-emerald-500/40 bg-emerald-950/20',
          nodes: [
            { tableId: 'mc-1644-header', code: 'MTI 1644 · 697', label: 'File Header (PDS 0105 File ID + Originator ICA)', bytesOrFormat: 'ISO 8583 [M]', status: 'M' },
          ],
        },
        {
          stage: '2. Núcleo Obrigatório First Presentment (MTI 1240 / DE 24=200)',
          role: 'Data Elements mandatórios em qualquer apresentação financeira doméstica no Brasil.',
          status: 'M',
          color: 'border-blue-500/40 bg-blue-950/20',
          nodes: [
            { tableId: 'mc-1240-base', code: 'MTI 1240 Base', label: 'DEs Obrigatórios (DE 2, 3, 4, 12, 22, 24=200, 26, 31, 38, 42, 43, 49, 63, 71)', bytesOrFormat: 'Bitmap Base [M]', status: 'M' },
            { tableId: 'mc-1240-brazil', code: 'MTI 1240 Brasil', label: 'DE 48 Brasil: PDS 0220 (CNPJ/CPF), PDS 0195 (Parcelado), PDS 0183, PDS 0027', bytesOrFormat: 'DE 48 TLV [M no BR]', status: 'M' },
          ],
        },
        {
          stage: '3. Blocos Condicionais de Segurança, Arranjo & Setor',
          role: 'Ativados via bit no Bitmap (DE 55) ou sub-tags PDS no DE 48, além do Addendum MTI 1644.',
          status: 'C',
          color: 'border-amber-500/40 bg-amber-950/15',
          nodes: [
            { tableId: 'mc-1240-emv-3ds', code: 'DE 55 + PDS 3DS', label: 'Chip EMV (DE 55 Tags TLV) & 3DS 2.2 (PDS 0052, 0184, 0185, 0186)', bytesOrFormat: 'DE 55 / DE 48 [C]', status: 'C' },
            { tableId: 'mc-1240-payfac-token', code: 'PDS PayFac & MDES', label: 'PayFac (PDS 0176 + PDS 0208) & Token MDES (PDS 0059 + PDS 0207)', bytesOrFormat: 'DE 48 TLV [C]', status: 'C' },
            { tableId: 'mc-1644-addendum', code: 'MTI 1644 Addendum', label: 'Detalhe Setorial (Companhia Aérea IATA, Hotelaria, Locadora)', bytesOrFormat: 'MTI 1644 [C]', status: 'C' },
            { tableId: 'mc-1442-1740', code: 'MTI 1442 / 1740', label: 'First Chargeback (1442-450) & Fee Collection (1740-700)', bytesOrFormat: 'Pós-Venda [C]', status: 'C' },
          ],
        },
        {
          stage: '4. File Trailer & Reconciliação Financeira (MTI 1644 / Function Code 695)',
          role: 'Valida o checksum financeiro (PDS 0301 Amount + PDS 0306 Count) de todo o arquivo.',
          status: 'M',
          color: 'border-purple-500/40 bg-purple-950/20',
          nodes: [
            { tableId: 'mc-1644-trailer', code: 'MTI 1644 · 695', label: 'File Trailer (PDS 0105 + PDS 0301 Checksum + PDS 0306 Count)', bytesOrFormat: 'ISO 8583 [M]', status: 'M' },
          ],
        },
      ],
      wireAnatomy: [
        { seg: 'RDW (4B)', size: '4B Bin', desc: 'Tamanho Big-Endian da mensagem dentro do bloco de 1014B', tone: 'bg-slate-800 border-slate-700 text-slate-300' },
        { seg: 'MTI (4B)', size: '4B', desc: '1240 / 1442 / 1644 / 1740', tone: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-200' },
        { seg: 'Bitmaps (16B)', size: '128 bits', desc: 'Mapa Binário indicando quais DEs (1 a 128) estão presentes', tone: 'bg-blue-500/20 border-blue-500/40 text-blue-200' },
        { seg: 'DEs Fixos/LLVAR', size: 'Var', desc: 'DE 2, 3, 4, 12, 22, 24, 31, 38, 42, 43, 49, 63, 71', tone: 'bg-indigo-500/20 border-indigo-500/40 text-indigo-200' },
        { seg: 'DE 48 (PDS TLV)', size: 'LLLVAR', desc: 'Sub-elementos Tag(4)+Len(3)+Val (PDS 0195, 0220, 0176, 0185...)', tone: 'bg-amber-500/20 border-amber-500/40 text-amber-200' },
        { seg: 'DE 55 (EMV TLV)', size: 'LLLVAR', desc: 'Tags BER-TLV EMV (9F26, 9F27, 95, 9F36, 9F10)', tone: 'bg-purple-500/20 border-purple-500/40 text-purple-200' },
      ],
    },
  };

  const bp = blueprints[brand];

  return (
    <div className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-950 via-slate-900/95 to-slate-950 p-5 shadow-2xl space-y-5">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-blue-500/10 border border-blue-500/30 text-[10px] font-mono font-bold uppercase tracking-widest text-blue-300 mb-1.5">
            <span>⚡ {bp.protocolBadge}</span>
          </div>
          <h3 className="text-base sm:text-lg font-black text-white">
            {bp.framingTitle}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">{bp.framingSubtitle}</p>
        </div>

        <div className="flex items-center gap-2 text-[11px] shrink-0">
          <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-bold">
            [M] Obrigatório no Lote
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 font-bold">
            [C] Condicional (Sob Gatilho)
          </span>
        </div>
      </div>

      {/* Anatomia do Wire (Frame Físico na Rede) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400">
          <span>Anatomia Física do Registro na Rede (Wire Frame Layout)</span>
          <span className="font-mono text-slate-500">Clique em qualquer camada abaixo para inspecionar a tabela</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2">
          {bp.wireAnatomy.map((w, i) => (
            <div
              key={i}
              className={`rounded-xl border p-2.5 flex flex-col justify-between ${w.tone}`}
            >
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="font-mono text-[11px] font-black">{w.seg}</span>
                <span className="px-1.5 py-0.5 rounded bg-black/30 font-mono text-[10px]">{w.size}</span>
              </div>
              <div className="text-[11px] leading-snug opacity-90">{w.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Pipeline Arquitetural em 4 Camadas */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
        {bp.layers.map((layer, idx) => (
          <div
            key={idx}
            className={`rounded-xl border p-3.5 flex flex-col justify-between gap-3 ${layer.color}`}
          >
            <div className="space-y-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-black text-white">{layer.stage}</span>
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                    layer.status === 'M'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  {layer.status === 'M' ? 'MANDATORY' : 'CONDITIONAL'}
                </span>
              </div>
              <p className="text-[11px] text-slate-300 leading-snug">{layer.role}</p>
            </div>

            <div className="space-y-1.5">
              {layer.nodes.map((node) => (
                <button
                  key={node.tableId}
                  onClick={() => onSelectTable(brand, node.tableId)}
                  className="w-full text-left rounded-lg bg-slate-950/90 hover:bg-slate-900 border border-slate-800 hover:border-blue-400/60 p-2 transition-all group"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-mono text-xs font-black text-blue-300 group-hover:text-blue-200">
                      {node.code}
                    </span>
                    <span
                      className={`font-mono text-[10px] px-1.5 py-0.5 rounded ${
                        node.status === 'M'
                          ? 'bg-emerald-500/15 text-emerald-300'
                          : 'bg-amber-500/15 text-amber-300'
                      }`}
                    >
                      {node.bytesOrFormat}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-300 truncate mt-0.5">{node.label}</div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// 2. INTERACTIVE PAYLOAD / WIRE INSPECTOR (ESTILO VISA & MASTERCARD DEVELOPER)
// ============================================================================
export function InteractiveWireInspector({
  table,
  highlightedFieldNo,
  onSelectField,
}: {
  table: OutgoingTableSpec;
  highlightedFieldNo: string | null;
  onSelectField: (fieldNo: string | null) => void;
}) {
  const [inspectorMode, setInspectorMode] = useState<'wire' | 'json'>('wire');

  const activeField: OutgoingFieldSpec = useMemo(() => {
    if (highlightedFieldNo) {
      const found = table.fields.find((f) => f.fieldNo === highlightedFieldNo);
      if (found) return found;
    }
    return table.fields[0];
  }, [table, highlightedFieldNo]);

  // Synthesize a realistic wire dump line or TLV dump from the table's fields
  const wireSegments = useMemo(() => {
    return table.fields.map((f) => {
      const cleanEx = (f.example || '').split('(')[0].replace(/['"]/g, '').trim() || f.fieldNo;
      const padded =
        cleanEx.length > 18 ? cleanEx.slice(0, 18) : cleanEx.padEnd(Math.min(14, Math.max(4, cleanEx.length)), ' ');
      return {
        fieldNo: f.fieldNo,
        name: f.name,
        pos: f.pos,
        status: f.status,
        sample: padded,
        rawExample: f.example,
      };
    });
  }, [table]);

  return (
    <div className="rounded-xl bg-slate-950 border border-slate-800 overflow-hidden shadow-lg">
      {/* Top Bar estilo Developer Portal */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-slate-900/90 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-mono text-xs font-black uppercase tracking-wider text-white">
            Developer Payload & Wire Inspector — {table.code}
          </span>
          <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-slate-300">
            {table.sizeSpec}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setInspectorMode('wire')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-bold transition-all ${
              inspectorMode === 'wire'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {table.brand === 'mastercard' ? 'BITMAP & PDS TLV MAP' : '168-BYTE WIRE TAPE'}
          </button>
          <button
            onClick={() => setInspectorMode('json')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-bold transition-all ${
              inspectorMode === 'json'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            DECODED SPEC JSON
          </button>
        </div>
      </div>

      {/* Corpo Split-Pane estilo Visa/Mastercard Developer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-800">
        {/* Esquerda: Fita Wire Interativa ou Bitmap/PDS */}
        <div className="lg:col-span-7 p-4 space-y-3">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>
              {table.brand === 'mastercard'
                ? 'Clique em qualquer Data Element (DE) ou tag PDS/EMV no pacote:'
                : 'Clique em qualquer segmento posicional da fita de 168 bytes:'}
            </span>
            <span className="font-mono text-[10px] text-blue-400">
              Verde = [M] Obrigatório · Âmbar = [C] Condicional
            </span>
          </div>

          {inspectorMode === 'wire' ? (
            <>
              {/* Fita de Segmentos Clicáveis */}
              <div className="flex flex-wrap gap-1.5">
                {wireSegments.map((seg) => {
                  const isSel = activeField?.fieldNo === seg.fieldNo;
                  const isMand = seg.status === 'M';
                  return (
                    <button
                      key={seg.fieldNo}
                      onClick={() => onSelectField(seg.fieldNo)}
                      className={`px-2.5 py-1.5 rounded-lg border text-left transition-all font-mono ${
                        isSel
                          ? 'bg-blue-600/30 border-blue-400 ring-2 ring-blue-400/50 text-white'
                          : isMand
                          ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200 hover:border-emerald-400'
                          : 'bg-amber-950/30 border-amber-500/30 text-amber-200 hover:border-amber-400'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 text-[10px]">
                        <span className="font-black">{seg.pos}</span>
                        <span
                          className={`px-1 rounded text-[9px] font-bold ${
                            isMand ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                          }`}
                        >
                          {seg.status}
                        </span>
                      </div>
                      <div className="text-[11px] font-bold truncate max-w-[150px] mt-0.5">
                        {seg.name}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Simulação da Linha Física / Stream na Rede */}
              <div className="rounded-lg bg-black/70 border border-slate-800 p-3 font-mono text-xs overflow-x-auto">
                <div className="text-[10px] text-slate-500 mb-1.5 flex items-center justify-between">
                  <span>RAW WIRE STREAM ({table.code})</span>
                  <span>Posição Selecionada: {activeField?.pos}</span>
                </div>
                <div className="flex items-center gap-0.5 whitespace-nowrap py-1">
                  {wireSegments.map((seg) => {
                    const isSel = activeField?.fieldNo === seg.fieldNo;
                    return (
                      <span
                        key={seg.fieldNo}
                        onClick={() => onSelectField(seg.fieldNo)}
                        title={`${seg.pos} — ${seg.name}`}
                        className={`cursor-pointer px-1.5 py-1 rounded transition-all ${
                          isSel
                            ? 'bg-blue-500 text-slate-950 font-black shadow-md'
                            : seg.status === 'M'
                            ? 'bg-emerald-950/50 text-emerald-300 hover:bg-emerald-900/60'
                            : 'bg-amber-950/50 text-amber-300 hover:bg-amber-900/60'
                        }`}
                      >
                        {seg.sample}
                      </span>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <pre className="rounded-lg bg-black/70 border border-slate-800 p-3 font-mono text-[11px] text-emerald-300 overflow-x-auto max-h-64">
              {JSON.stringify(
                {
                  tableCode: table.code,
                  brand: table.brand.toUpperCase(),
                  presenceStatus: table.presenceStatus,
                  sizeSpec: table.sizeSpec,
                  selectedField: activeField,
                },
                null,
                2
              )}
            </pre>
          )}
        </div>

        {/* Direita: Painel de Diagnóstico do Campo Selecionado */}
        <div className="lg:col-span-5 p-4 bg-slate-950/80 flex flex-col justify-between gap-3">
          {activeField && (
            <>
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-bold text-blue-400">
                    Campo #{activeField.fieldNo} · {activeField.pos}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-black border ${
                      activeField.status === 'M'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    }`}
                  >
                    {activeField.status === 'M' ? '[M] OBRIGATÓRIO' : '[C] CONDICIONAL'}
                  </span>
                </div>

                <h4 className="text-sm font-black text-white">{activeField.name}</h4>

                <div className="flex flex-wrap gap-2 text-[11px] font-mono">
                  <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                    Tamanho: {activeField.size}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-purple-300">
                    Formato: {activeField.format}
                  </span>
                </div>

                <div className="rounded-lg bg-slate-900/90 border border-slate-800 p-2.5 text-xs text-slate-200 leading-relaxed">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
                    Regra de Obrigatoriedade / Condição
                  </div>
                  {activeField.conditionRule}
                </div>

                <div className="rounded-lg bg-slate-900/50 border border-slate-800/70 p-2.5 text-xs text-slate-300 leading-relaxed">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
                    Especificação Funcional & Exemplo
                  </div>
                  <p>{activeField.description}</p>
                  <div className="mt-1.5 font-mono text-[11px] text-emerald-300">
                    Valor Exemplo: {activeField.example}
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-rose-950/25 border border-rose-500/30 p-2.5 text-xs text-rose-200">
                <div className="text-[10px] font-black uppercase tracking-wider text-rose-400 mb-0.5">
                  ⚠️ Impacto de Erro / Ausência na Validação da Bandeira
                </div>
                {activeField.failureImpact}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 3. DIAGRAMA DE SEQUÊNCIA EM RAIAS (5-PARTY SWIMLANE — VISA/MC DEVELOPER)
// ============================================================================
export function InteractiveSwimlaneDiagram({
  brand,
  flow,
  onSelectTable,
}: {
  brand: OutgoingBrandId;
  flow: OutgoingFlowSpec;
  onSelectTable: (brand: OutgoingBrandId, tableId: string) => void;
}) {
  const bMeta = OUTGOING_BRANDS[brand];
  const bFlow = flow.byBrand[brand];
  const [selectedStepIdx, setSelectedStepIdx] = useState<number>(0);

  const actors = [
    { id: 'cardholder', icon: '💳', name: '1. Portador / Checkout', sub: 'Cartão / NFC / App 3DS' },
    { id: 'merchant', icon: '🏪', name: '2. Estabelecimento / PayFac', sub: 'POS / TEF / Subcredenciador' },
    { id: 'acquirer', icon: '🏦', name: '3. Credenciador (Outgoing)', sub: 'Host Captura & Motor Clearing' },
    {
      id: 'network',
      icon: '🌐',
      name: `4. Rede ${bMeta.name}`,
      sub:
        brand === 'visa'
          ? 'VisaNet Base II & Edit Package'
          : brand === 'elo'
          ? 'Elo Serviço 10 (4 Janelas)'
          : 'Mastercard GCMS / IPM R111',
    },
    { id: 'issuer', icon: '🏛️', name: '5. Banco Emissor & SLC/B3', sub: 'Posting Fatura & Liquidação BRL' },
  ];

  const activeRecord = bFlow.recordSequence[selectedStepIdx] || bFlow.recordSequence[0];

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/90 p-5 space-y-5 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-800 pb-3">
        <div>
          <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-blue-400">
            DIAGRAMA DE SEQUÊNCIA DUAL-MESSAGE (5 ATORES · ESTILO VISA / MASTERCARD DEVELOPERS)
          </div>
          <h4 className="text-sm sm:text-base font-black text-white">
            Jornada da Mensagem: Autorização (Dia D) ➔ Pacote Outgoing ({bMeta.name}) ➔ Emissor & Liquidação
          </h4>
        </div>
        <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300">
          {bFlow.recordSequence.length} registros encadeados no lote
        </span>
      </div>

      {/* Cabeçalho das 5 Raias (Actors) */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {actors.map((act, i) => (
          <div
            key={act.id}
            className={`rounded-xl border p-2.5 text-center ${
              i === 2 || i === 3
                ? 'bg-blue-950/25 border-blue-500/40'
                : 'bg-slate-900/80 border-slate-800'
            }`}
          >
            <div className="text-base mb-0.5">{act.icon}</div>
            <div className="text-[11px] font-black text-white leading-tight">{act.name}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">{act.sub}</div>
          </div>
        ))}
      </div>

      {/* Três Fases Cronológicas do Dual Message System */}
      <div className="space-y-3">
        {/* FASE 1: AUTORIZAÇÃO ONLINE */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-3.5">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <span className="px-2 py-0.5 rounded bg-purple-500/20 border border-purple-500/30 text-[10px] font-mono font-bold text-purple-300">
              FASE 1 · ONLINE REAL-TIME (ISO 8583 0100 / 0110)
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              Gera os chaves de conciliação que serão obrigatórias no Outgoing
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
            {bFlow.authToClearingDePara.slice(0, 3).map((dp, idx) => (
              <div
                key={idx}
                className="rounded-lg bg-slate-950/90 border border-slate-800/80 p-2.5 flex flex-col justify-between"
              >
                <div className="font-mono text-[11px] font-bold text-purple-300">{dp.authField}</div>
                <div className="text-[11px] text-slate-400 my-1">➔ persiste para o Outgoing em:</div>
                <div className="font-mono text-[11px] font-bold text-emerald-300">
                  {dp.outgoingTable} · {dp.outgoingField}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FASE 2: MONTAGEM E TRANSMISSÃO DO PACOTE OUTGOING (INTERATIVO) */}
        <div className="rounded-xl border border-blue-500/40 bg-blue-950/15 p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="px-2.5 py-0.5 rounded bg-blue-500/20 border border-blue-500/40 text-[10px] font-mono font-bold text-blue-300">
              FASE 2 · REMESSA DE LIQUIDACÃO OUTGOING (CREDenciador ➔ {bMeta.name.toUpperCase()})
            </span>
            <span className="text-[11px] text-slate-300">
              Clique em cada registro da fila para inspecionar seu papel ou abrir seu layout completo:
            </span>
          </div>

          {/* Pipeline Horizontal de Registros no Arquivo */}
          <div className="flex flex-wrap items-center gap-2">
            {bFlow.recordSequence.map((step, idx) => {
              const isSelected = idx === selectedStepIdx;
              const isMand = step.statusInFlow === 'Obrigatório no Fluxo';
              const isEnv = step.statusInFlow === 'Envelope do Lote';
              return (
                <React.Fragment key={`${step.tableId}-${step.order}`}>
                  <button
                    onClick={() => setSelectedStepIdx(idx)}
                    className={`rounded-xl px-3 py-2 border text-left transition-all ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-300 shadow-lg shadow-blue-950/60 scale-[1.02]'
                        : isMand
                        ? 'bg-slate-950/90 border-emerald-500/40 text-emerald-200 hover:border-emerald-400'
                        : isEnv
                        ? 'bg-slate-950/90 border-slate-700 text-slate-300 hover:border-slate-500'
                        : 'bg-slate-950/90 border-amber-500/40 text-amber-200 hover:border-amber-400'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-[10px] font-mono">
                      <span className="opacity-75">#{step.order}</span>
                      <span className="font-black">{step.tableCode}</span>
                    </div>
                    <div className="text-[11px] font-bold truncate max-w-[160px]">
                      {step.tableName}
                    </div>
                  </button>
                  {idx < bFlow.recordSequence.length - 1 && (
                    <span className="text-slate-500 font-bold text-xs">➔</span>
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Detalhe do Passo Selecionado na Sequência */}
          {activeRecord && (
            <div className="rounded-xl bg-slate-950/95 border border-slate-800 p-3.5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono text-xs font-black">
                    Passo #{activeRecord.order}: {activeRecord.tableCode}
                  </span>
                  <span className="text-sm font-black text-white">{activeRecord.tableName}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      activeRecord.statusInFlow === 'Obrigatório no Fluxo'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : activeRecord.statusInFlow === 'Envelope do Lote'
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {activeRecord.statusInFlow}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{activeRecord.roleInFlow}</p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {activeRecord.keyValuesInFlow.map((kv, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 font-mono text-[11px] text-emerald-300"
                    >
                      {kv}
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={() => onSelectTable(brand, activeRecord.tableId)}
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white transition-all shrink-0"
              >
                Abrir Layout de {activeRecord.tableCode} →
              </button>
            </div>
          )}
        </div>

        {/* FASE 3: LIQUIDAÇÃO E COMPENSAÇÃO */}
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/10 p-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs">
          <div className="space-y-0.5">
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/30 text-[10px] font-mono font-bold text-emerald-300">
              FASE 3 · VALIDAÇÃO SINTÁTICA, INTERCÂMBIO & LIQUIDAÇÃO (SLC / CIP B3)
            </span>
            <p className="text-slate-300 pt-1">
              {brand === 'visa'
                ? 'O Edit Package valida sintaxe de cada TCR; a VisaNet calcula a tarifa de intercâmbio, gera o Incoming ao Emissor e envia a posição líquida em BRL (moeda 986) para liquidação doméstica.'
                : brand === 'elo'
                ? 'A Elo valida cada sub-registro (00 a 08) na janela correspondente; eventuais recusas parciais voltam como TE01 + Registro 09, e as transações aceitas seguem para compensação financeira.'
                : 'O GCMS valida a sintaxe do arquivo R111 (gerando T112 PDS 0205 se houver erro), qualifica o IRD de intercâmbio, roteia o Incoming T113/T140 ao Emissor e liquida na grade doméstica BRL.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 4. SANDBOX DE GATILHOS [C] ➔ [M] & SIMULADOR DE LOTE (ESTILO DEV PLAYGROUND)
// ============================================================================
export function InteractiveRuleSandbox({
  selectedBrand,
  onSelectTable,
}: {
  selectedBrand: OutgoingBrandId;
  onSelectTable: (brand: OutgoingBrandId, tableId: string) => void;
}) {
  const [flags, setFlags] = useState({
    domesticBrazil: true,
    installments: true,
    chipEmv: true,
    ecom3ds: false,
    tokenized: false,
    payfacSubmerchant: true,
    airlineIata: false,
    pushPaymentOct: false,
    chargebackDispute: false,
  });

  const toggleFlag = (key: keyof typeof flags) => {
    setFlags((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const flagDefinitions: { key: keyof typeof flags; label: string; desc: string; badge: string }[] = [
    {
      key: 'domesticBrazil',
      label: 'Liquidação Doméstica Brasil (BRL 986)',
      desc: 'Transação capturada e liquidada em Reais (BRL) no território nacional.',
      badge: 'BR · 986',
    },
    {
      key: 'installments',
      label: 'Compra Parcelada (2x a 12x / Crediário)',
      desc: 'Parcelado Lojista sem juros ou Parcelado Emissor / Crediário.',
      badge: 'PARCELADO',
    },
    {
      key: 'chipEmv',
      label: 'Captura Chip EMV Contato ou Contactless NFC',
      desc: 'POS Entry Mode 05 ou 07 com geração de criptograma EMV ARQC.',
      badge: 'EMV · 05/07',
    },
    {
      key: 'ecom3ds',
      label: 'E-Commerce Autenticado (3DS 2.2 / CAVV /AAV)',
      desc: 'Transação Card-Not-Present com autenticação 3-D Secure 2.2.',
      badge: '3DS 2.2',
    },
    {
      key: 'tokenized',
      label: 'Token de Pagamento (VTS / MDES / Elo PTE)',
      desc: 'Credencial tokenizada via Apple Pay, Google Pay ou Cofre de Token.',
      badge: 'TOKEN',
    },
    {
      key: 'payfacSubmerchant',
      label: 'Subcredenciador (PayFac) / Marketplace',
      desc: 'Captura intermediada por Facilitador de Pagamento ou Agregador.',
      badge: 'PAYFAC',
    },
    {
      key: 'airlineIata',
      label: 'Companhia Aérea / Agência IATA',
      desc: 'MCC 3000–3350 ou 4511 com emissão de bilhete aéreo e taxa de embarque.',
      badge: 'IATA',
    },
    {
      key: 'pushPaymentOct',
      label: 'Transferência de Fundos / Push Payment (OCT / P2P)',
      desc: 'Visa Direct OCT/AFT, Elo Código Proc. 53 ou Mastercard MoneySend.',
      badge: 'OCT / P2P',
    },
    {
      key: 'chargebackDispute',
      label: 'Pós-Venda: Disputa / Chargeback ou Fee Collection',
      desc: 'Ciclo de contestação (TC 15 / TE15 / MTI 1442) ou ajuste financeiro.',
      badge: 'DISPUTA',
    },
  ];

  // Evaluate which tables become Mandatory [M] vs Omitted for the selected brand
  const evaluatedTables = useMemo(() => {
    const brandTables = OUTGOING_TABLES.filter((t) => t.brand === selectedBrand);

    return brandTables.map((t) => {
      let state: 'MANDATORY_BASE' | 'ESCALATED_TO_MANDATORY' | 'OMITTED' = 'OMITTED';
      let reason = 'Não aplicável para os gatilhos selecionados.';
      const escalatedFields: { field: string; rule: string }[] = [];

      // Always mandatory headers, trailers, and core records
      if (
        ['visa-tc90', 'visa-tcr0', 'visa-tcr1', 'visa-tcr5', 'visa-tc91-92'].includes(t.id) ||
        ['elo-b0', 'elo-reg00', 'elo-reg01', 'elo-reg02', 'elo-bz'].includes(t.id) ||
        ['mc-1644-header', 'mc-1240-base', 'mc-1644-trailer'].includes(t.id)
      ) {
        state = 'MANDATORY_BASE';
        reason = 'Tabela estrutural sempre obrigatória [M] em qualquer arquivo de Outgoing.';
      }

      // Brazil domestic & installments
      if (t.id === 'visa-tcr2-br' || t.id === 'mc-1240-brazil') {
        if (flags.domesticBrazil || flags.installments) {
          state = 'ESCALATED_TO_MANDATORY';
          reason = flags.installments
            ? 'Obrigatória [M] para Liquidação Nacional Brasil e transporte do número de parcelas.'
            : 'Obrigatória [M] para Liquidação Doméstica em BRL (Moeda 986) e CNPJ/CPF do EC.';
        }
      }

      // Chip EMV
      if (t.id === 'visa-tcr7' || t.id === 'elo-reg07') {
        if (flags.chipEmv) {
          state = 'ESCALATED_TO_MANDATORY';
          reason = 'Condicional [C] escalada para Obrigatória [M] porque a captura foi via Chip EMV / NFC (POS Entry Mode 05/07).';
        }
      }

      // 3DS / E-Commerce
      if (t.id === 'elo-reg05') {
        if (flags.ecom3ds) {
          state = 'ESCALATED_TO_MANDATORY';
          reason = 'Condicional [C] escalada para Obrigatória [M] para transportar CAVV, ECI e Directory Server Transaction ID do 3DS 2.2.';
        }
      }

      if (t.id === 'mc-1240-emv-3ds') {
        if (flags.chipEmv || flags.ecom3ds) {
          state = 'ESCALATED_TO_MANDATORY';
          reason =
            flags.chipEmv && flags.ecom3ds
              ? 'Obrigatória [M] para transportar DE 55 (EMV) e PDS 0052/0184/0185 (3DS 2.2).'
              : flags.chipEmv
              ? 'Obrigatória [M] para transportar o bloco DE 55 (Tags EMV do Chip).'
              : 'Obrigatória [M] para transportar os sub-elementos PDS 0052, 0184, 0185 e 0186 (3DS 2.2).';
        }
      }

      // TCR D (Installments / OCT / 3DS)
      if (t.id === 'visa-tcrd') {
        if (flags.installments || flags.pushPaymentOct || flags.ecom3ds) {
          state = 'ESCALATED_TO_MANDATORY';
          reason = 'Condicional [C] escalada para Obrigatória [M] por envolver Parcelamento/Crediário, OCT/AFT ou dados estendidos 3DS.';
        }
      }

      // PayFac / Token
      if (t.id === 'visa-tcre') {
        if (flags.payfacSubmerchant) {
          state = 'ESCALATED_TO_MANDATORY';
          reason = 'Condicional [C] escalada para Obrigatória [M] por envolver Subcredenciador (Payment Facilitator) ou Marketplace.';
        }
      }

      if (t.id === 'mc-1240-payfac-token') {
        if (flags.payfacSubmerchant || flags.tokenized) {
          state = 'ESCALATED_TO_MANDATORY';
          reason = 'Condicional [C] escalada para Obrigatória [M] para transportar PDS 0176/0208 (PayFac) e/ou PDS 0059/0207 (Token MDES).';
        }
      }

      // Airline IATA
      if (t.id === 'visa-tcr3' || t.id === 'elo-reg08' || t.id === 'mc-1644-addendum') {
        if (flags.airlineIata) {
          state = 'ESCALATED_TO_MANDATORY';
          reason = 'Condicional [C] escalada para Obrigatória [M] para Companhias Aéreas IATA (bilhete, passageiro, trechos e taxa de embarque).';
        }
      }

      // Push Payment / OCT / P2P
      if (t.id === 'elo-reg03') {
        if (flags.pushPaymentOct) {
          state = 'ESCALATED_TO_MANDATORY';
          reason = 'Condicional [C] escalada para Obrigatória [M] porque o Código de Processamento é 53 (Transferência de Fundos).';
        }
      }

      // Disputes & Fee Collection
      if (t.id === 'visa-tc10-20' || t.id === 'mc-1442-1740' || t.id === 'elo-reg09') {
        if (flags.chargebackDispute) {
          state = 'ESCALATED_TO_MANDATORY';
          reason = 'Ativada para fluxos de Pós-Venda (Chargeback, Fee Collection ou Diagnóstico de Rejeição TE01).';
        }
      }

      // Specific Conditional Fields that turn Mandatory inside active tables
      if (state !== 'OMITTED') {
        if (flags.installments) {
          if (t.id === 'visa-tcr2-br') {
            escalatedFields.push({
              field: 'Pos 38–39 (Tipo Parcelado) & Pos 40–41 (Qtd Parcelas + 10)',
              rule: 'De [C] para [M]: ex. 03 parcelas grava "13" nas posições 40–41.',
            });
          }
          if (t.id === 'elo-reg01') {
            escalatedFields.push({
              field: 'Pos 54–56 (Qtd Parcelas) & Pos 57–59 (Número da Parcela)',
              rule: 'De [C] para [M]: obrigatório quando Reg 02 pos 20–22 = 990, 991 ou 993.',
            });
          }
          if (t.id === 'elo-reg02') {
            escalatedFields.push({
              field: 'Pos 20–22 (Tipo de Operação = 990 Lojista / 991 Emissor / 993 Crediário)',
              rule: 'Define a regra de cálculo e liquidação do parcelado na Elo.',
            });
          }
          if (t.id === 'mc-1240-brazil') {
            escalatedFields.push({
              field: 'DE 48 · PDS 0195 (Installment Data Brazil: SF2=04/03 + SF3=Parcelas)',
              rule: 'De [C] para [M]: obrigatório em toda compra parcelada doméstica na Mastercard.',
            });
          }
        }
        if (flags.payfacSubmerchant) {
          if (t.id === 'elo-reg02') {
            escalatedFields.push({
              field: 'Pos 59–72 (CPF/CNPJ Subcredenciado) & Pos 140–161 (EC Final)',
              rule: 'De [C] para [M]: obrigatório quando há Subcredenciador no Registro 01 pos 139–153.',
            });
          }
          if (t.id === 'visa-tcre') {
            escalatedFields.push({
              field: 'Pos 07–14 (PayFac ID) & Pos 15–29 (Sub-Merchant ID) & Pos 93–106 (CNPJ)',
              rule: 'De [C] para [M]: identifica o Facilitador e o lojista final na Visa.',
            });
          }
        }
        if (flags.tokenized && t.id === 'elo-reg02') {
          escalatedFields.push({
            field: 'Pos 23–41 (PAN Token) & Pos 46–56 (Token Requestor ID)',
            rule: 'De [C] para [M]: obrigatório quando a transação foi capturada via Token PTE.',
          });
        }
      }

      return {
        table: t,
        state,
        reason,
        escalatedFields,
      };
    });
  }, [selectedBrand, flags]);

  const activeStack = evaluatedTables.filter((e) => e.state !== 'OMITTED');
  const omittedStack = evaluatedTables.filter((e) => e.state === 'OMITTED');

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 space-y-4 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2 border-b border-slate-800 pb-4">
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-blue-400">
              ⚡ SANDBOX INTERATIVO DE REGRAS (ESTILO VISA / MASTERCARD DEVELOPER PLAYGROUND)
            </span>
            <h3 className="text-lg sm:text-xl font-black text-white mt-0.5">
              Simulador de Gatilhos: Veja Quais Tabelas e Campos [C] Viram Obrigatórios [M]
            </h3>
            <p className="text-xs text-slate-400">
              Ligue ou desligue as características da transação abaixo para montar em tempo real a pilha exata de tabelas de Outgoing exigida pela bandeira.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs font-black text-emerald-300">
              {activeStack.length} Tabelas Exigidas no Lote
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-mono text-slate-400">
              {omittedStack.length} Omitidas
            </span>
          </div>
        </div>

        {/* Botões de Gatilho (Toggles) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {flagDefinitions.map((f) => {
            const isOn = flags[f.key];
            return (
              <button
                key={f.key}
                onClick={() => toggleFlag(f.key)}
                className={`rounded-xl p-3 text-left border transition-all flex items-start justify-between gap-2 ${
                  isOn
                    ? 'bg-blue-950/40 border-blue-400 shadow-md shadow-blue-950/30'
                    : 'bg-slate-950/70 border-slate-800/90 opacity-70 hover:opacity-100'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-4 h-4 rounded flex items-center justify-center text-[10px] font-black ${
                        isOn ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      {isOn ? '✓' : ''}
                    </span>
                    <span className="text-xs font-black text-white">{f.label}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 pl-6 leading-snug">{f.desc}</p>
                </div>
                <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 font-mono text-[10px] text-blue-300 shrink-0">
                  {f.badge}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Resultado da Simulação: Pilha Exigida no Lote vs Tabelas Omitidas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 rounded-2xl border border-slate-800 bg-slate-900/80 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-black uppercase tracking-wider text-emerald-300">
              ✅ Pilha de Tabelas Exigida no Arquivo de Outgoing ({OUTGOING_BRANDS[selectedBrand].name})
            </h4>
            <span className="text-xs font-mono text-slate-400">
              Ordem exata de gravação física
            </span>
          </div>

          <div className="space-y-3">
            {activeStack.map((item, idx) => (
              <div
                key={item.table.id}
                className={`rounded-xl border p-4 space-y-2.5 ${
                  item.state === 'MANDATORY_BASE'
                    ? 'bg-slate-950/90 border-emerald-500/30'
                    : 'bg-amber-950/15 border-amber-500/40'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-slate-900 border border-slate-700 font-mono text-xs font-black text-blue-300 flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="font-mono text-xs font-black text-white px-2 py-0.5 rounded bg-slate-800">
                      {item.table.code}
                    </span>
                    <span className="text-sm font-black text-white">{item.table.title}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded text-[10px] font-black border ${
                        item.state === 'MANDATORY_BASE'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      }`}
                    >
                      {item.state === 'MANDATORY_BASE'
                        ? '[M] SEMPRE OBRIGATÓRIA'
                        : '[C ➔ M] ESCALADA P/ OBRIGATÓRIA'}
                    </span>
                    <button
                      onClick={() => onSelectTable(selectedBrand, item.table.id)}
                      className="px-2.5 py-1 rounded-lg bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/40 text-[11px] font-bold text-blue-300"
                    >
                      Ver Layout →
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-300">{item.reason}</p>

                {item.escalatedFields.length > 0 && (
                  <div className="rounded-lg bg-slate-900/90 border border-amber-500/30 p-2.5 space-y-1.5">
                    <div className="text-[10px] font-black uppercase tracking-wider text-amber-300">
                      Campos Condicionais [C] desta tabela que viraram Obrigatórios [M] nesta simulação:
                    </div>
                    {item.escalatedFields.map((ef, i) => (
                      <div key={i} className="text-xs flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                        <span className="font-mono font-bold text-white">{ef.field}:</span>
                        <span className="text-slate-300">{ef.rule}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Coluna Direita: Tabelas que NÃO devem ser enviadas */}
        <div className="lg:col-span-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-5 space-y-3">
          <h4 className="text-sm font-black uppercase tracking-wider text-slate-400">
            ⏸️ Tabelas Omitidas neste Cenário ({omittedStack.length})
          </h4>
          <p className="text-xs text-slate-400">
            Estas tabelas são condicionais e <strong>não devem ser enviadas</strong> com os gatilhos atuais (enviar registros vazios sem gatilho gera rejeição sintática na bandeira):
          </p>
          <div className="space-y-2">
            {omittedStack.map((item) => (
              <div
                key={item.table.id}
                className="rounded-xl bg-slate-950/70 border border-slate-800/80 p-3 flex items-center justify-between gap-2 opacity-75"
              >
                <div>
                  <div className="font-mono text-xs font-bold text-slate-300">{item.table.code}</div>
                  <div className="text-[11px] text-slate-500">{item.table.title}</div>
                </div>
                <button
                  onClick={() => onSelectTable(selectedBrand, item.table.id)}
                  className="text-[11px] font-mono text-blue-400 hover:underline shrink-0"
                >
                  Inspecionar
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
