"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Binary,
  Search,
  Database,
  Cpu,
  HardDrive,
  FileCode2,
  Layers,
  CheckCircle2,
  Sparkles,
  CreditCard,
} from "lucide-react";

export default function MpeForensePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"bins" | "blocos" | "catalogo" | "amostras">("bins");

  // BIN Search & 194-byte positional decoder state
  const [binQuery, setBinQuery] = useState("");
  const [binResults, setBinResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [rawIp0040, setRawIp0040] = useState("");
  const [decodedIp0040, setDecodedIp0040] = useState<any>(null);

  // Table catalog search
  const [tableSearch, setTableSearch] = useState("");
  const [selectedSampleTable, setSelectedSampleTable] = useState("IP0016T1");

  useEffect(() => {
    fetch("/api/admin/mpe-forense?action=overview")
      .then((r) => r.json())
      .then((res) => {
        setData(res);
        setBinResults(res.bin_samples_bra || []);
        const firstRaw = res.bin_samples_bra?.[0]?.raw_record || "";
        setRawIp0040(firstRaw);
        setDecodedIp0040(res.default_decoded_ip0040);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleBinSearch = async (qOverride?: string) => {
    const q = qOverride !== undefined ? qOverride : binQuery;
    setSearching(true);
    try {
      const res = await fetch("/api/admin/mpe-forense", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "search", table_id: "IP0040T1", query: q, limit: 40 }),
      });
      const json = await res.json();
      setBinResults(json.results || []);
    } finally {
      setSearching(false);
    }
  };

  const handleDecodeRaw = async (rawText: string) => {
    setRawIp0040(rawText);
    const res = await fetch("/api/admin/mpe-forense", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "decode", raw: rawText }),
    });
    const json = await res.json();
    setDecodedIp0040(json);
  };

  const filteredTables = useMemo(() => {
    if (!data?.tables_catalog) return [];
    const q = tableSearch.trim().toLowerCase();
    if (!q) return data.tables_catalog;
    return data.tables_catalog.filter(
      (t: any) =>
        t.table_id.toLowerCase().includes(q) ||
        t.desc.toLowerCase().includes(q)
    );
  }, [data, tableSearch]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070b14] text-slate-100 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-slate-400 font-mono">
            Desblocando stream binário 1.014B / RDW Big-Endian (`engine/parser.py`)...
          </p>
        </div>
      </div>
    );
  }

  const info = data?.file_info || {};

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 text-xs text-purple-400 hover:text-purple-300 mb-2 font-mono"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Voltar ao Cockpit do Proprietário
            </Link>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                <Binary className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
                  Laboratório Forense MPE Binário (`T068 / RDW 1014B`) & Lookup de BIN
                </h1>
                <p className="text-sm text-slate-400 mt-0.5">
                  Inspeção física do arquivo `{info.filename}` ({info.file_size_mb} MB), desblocador de 1.014 bytes (`0x4040`), cabeçalhos RDW e catálogo integral das 268 tabelas `IP0000T1`.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/compliance/provisionamento"
              className="px-3.5 py-2 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-medium hover:bg-blue-500/20 transition"
            >
              ← Motor de Provisionamento
            </Link>
            <Link
              href="/compliance/arquivos"
              className="px-3.5 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium hover:bg-emerald-500/20 transition"
            >
              17.106 Campos SQLite →
            </Link>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
            <div className="text-xs text-slate-400">Arquivo Físico T068</div>
            <div className="text-xl font-bold text-purple-400 font-mono mt-1">{info.file_size_mb} MB</div>
            <div className="text-[11px] text-slate-500 mt-0.5">{Number(info.file_size_bytes || 0).toLocaleString()} bytes</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
            <div className="text-xs text-slate-400">Blocos Físicos (1.014B)</div>
            <div className="text-xl font-bold text-blue-400 font-mono mt-1">
              {Number(info.total_physical_blocks || 0).toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">1.012B Payload + 2B `0x4040`</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
            <div className="text-xs text-slate-400">Tabelas em `IP0000T1`</div>
            <div className="text-xl font-bold text-emerald-400 font-mono mt-1">
              {info.total_tables_ip0000t1 || 268}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Índice mestre do MPE</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
            <div className="text-xs text-slate-400">Cabeçalho Lógico</div>
            <div className="text-xl font-bold text-amber-400 font-mono mt-1">84 Bytes</div>
            <div className="text-[11px] text-slate-500 mt-0.5">4B RDW (`00500000`) + 80B Hdr</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
            <div className="text-xs text-slate-400">Registro `IP0040T1`</div>
            <div className="text-xl font-bold text-cyan-400 font-mono mt-1">194 Bytes</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Faixas de BIN 19 dígitos</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
            <div className="text-xs text-slate-400">Trailer de Bloco</div>
            <div className="text-xl font-bold text-rose-400 font-mono mt-1">0x40 0x40</div>
            <div className="text-[11px] text-slate-500 mt-0.5">EBCDIC Spaces (`@@` ASCII)</div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
          {[
            { id: "bins", label: "1. Lookup Forense de BINs (`IP0040T1`) & Dissecador 194B", icon: CreditCard },
            { id: "blocos", label: "2. Blocagem Física 1.014 Bytes & RDW Big-Endian", icon: HardDrive },
            { id: "catalogo", label: "3. Catálogo Integral `IP0000T1` (268 Tabelas)", icon: Database },
            { id: "amostras", label: "4. Registros Extraídos (`IP0006T1`, `IP0008T1`, `IP0016T1`)", icon: FileCode2 },
          ].map((t) => {
            const Icon = t.icon;
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold transition ${
                  active
                    ? "bg-purple-600 text-white shadow-lg shadow-purple-600/20"
                    : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                }`}
              >
                <Icon className="w-4 h-4" />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* TAB 1: BIN SEARCH & 194-BYTE POSITIONAL DECODER */}
        {activeTab === "bins" && (
          <div className="space-y-6">
            {/* Positional 194-Byte Decoder */}
            <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-400" /> Dissecador Posicional `IP0040T1` (194 Bytes — Issuer Account Range)
                  </h2>
                  <p className="text-xs text-slate-400">
                    Cole qualquer linha bruta de 194 bytes da tabela `IP0040T1` ou clique em &ldquo;Dissecar Registro&rdquo; na tabela abaixo.
                  </p>
                </div>
                <span className="text-xs font-mono px-2.5 py-1 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
                  RDW: 0x00C20000 (194 bytes payload)
                </span>
              </div>

              <div className="flex flex-col md:flex-row gap-2">
                <input
                  type="text"
                  value={rawIp0040}
                  onChange={(e) => setRawIp0040(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-amber-300"
                />
                <button
                  onClick={() => handleDecodeRaw(rawIp0040)}
                  className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shrink-0"
                >
                  Decodificar Fatias Posicionais
                </button>
              </div>

              {decodedIp0040?.slices && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {decodedIp0040.slices.map((s: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                          <span className="text-purple-400 font-bold">Pos {s.pos} ({s.len}B)</span>
                          <span className="text-slate-500">{s.py_slice}</span>
                        </div>
                        <div className="text-xs font-bold text-white">{s.field}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{s.desc}</div>
                      </div>
                      <div className="mt-2 pt-2 border-t border-slate-900 font-mono text-xs text-emerald-400 break-all">
                        {s.value || "(espaços)"}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* BIN Search Bar & Table */}
            <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-white">
                    Varredura na Tabela `IP0040T1` (BINs Brasil `BRA/076` & Global no arquivo `T068`)
                  </h3>
                  <p className="text-xs text-slate-400">
                    Pesquise por PAN/BIN (ex: `222763`, `514945`), código de produto (`MPL`, `MWE`, `MCS`, `MDB`, `MDP`), ICA ou país (`BRA`, `USA`).
                  </p>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                  <input
                    type="text"
                    placeholder="Ex: 222763, MWE, MPL, MDB, BRA..."
                    value={binQuery}
                    onChange={(e) => setBinQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleBinSearch()}
                    className="w-full md:w-72 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-mono"
                  />
                  <button
                    onClick={() => handleBinSearch()}
                    disabled={searching}
                    className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shrink-0"
                  >
                    {searching ? "Varrendo T068..." : "Buscar BIN"}
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {["", "222763", "MWE", "MPL", "MCG", "MCS", "MDB", "MDP", "USA"].map((tag) => (
                  <button
                    key={tag || "ALL"}
                    onClick={() => {
                      setBinQuery(tag);
                      handleBinSearch(tag);
                    }}
                    className="px-2.5 py-1 rounded bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] font-mono text-slate-300"
                  >
                    {tag ? `Filtro: ${tag}` : "Todos Brasil (BRA)"}
                  </button>
                ))}
              </div>

              <div className="overflow-x-auto max-h-[520px] overflow-y-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="sticky top-0 bg-slate-950 z-10">
                    <tr className="border-b border-slate-800 text-slate-400">
                      <th className="p-3 font-mono">Faixa Inicial (19d)</th>
                      <th className="p-3 font-mono">Faixa Final (19d)</th>
                      <th className="p-3 font-mono">Produto</th>
                      <th className="p-3 font-mono">Prog ID</th>
                      <th className="p-3 font-mono">ICA Emissor</th>
                      <th className="p-3 font-mono">País</th>
                      <th className="p-3 font-mono">Região</th>
                      <th className="p-3 text-right">Ação Forense</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/70">
                    {binResults.map((b, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/30">
                        <td className="p-3 font-mono text-slate-200">{b.range_start}</td>
                        <td className="p-3 font-mono text-slate-200">{b.range_end}</td>
                        <td className="p-3 font-mono font-bold text-emerald-400">{b.product_start}</td>
                        <td className="p-3 font-mono text-blue-300">{b.card_program_id}</td>
                        <td className="p-3 font-mono text-amber-300">{b.issuer_ica}</td>
                        <td className="p-3 font-mono text-slate-300">
                          {b.country_alpha} ({b.country_num})
                        </td>
                        <td className="p-3 font-mono text-purple-300">Reg {b.region}</td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleDecodeRaw(b.raw_record)}
                            className="px-2.5 py-1 rounded bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 text-[11px] font-mono"
                          >
                            Dissecar 194B ↑
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PHYSICAL BLOCKING 1014B & RDW */}
        {activeTab === "blocos" && (
          <div className="space-y-6">
            <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-4">
              <h2 className="text-lg font-bold text-white">
                Anatomia Física do Stream `MPE T068` (`engine/parser.py`)
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                O arquivo físico de parâmetros da Mastercard (`{info.filename}`) é transmitido via Global File Transfer em blocos fixos de <strong>1.014 bytes</strong>. Os primeiros <strong>1.012 bytes</strong> contêm o fluxo contínuo de registros lógicos variáveis e os últimos <strong>2 bytes</strong> de cada bloco físico contêm o trailer de blocagem <code>0x40 0x40</code> (dois espaços em EBCDIC, exibidos como <code>@@</code> em ASCII). Após remover os trailers de 2 bytes e concatenar os blocos de 1.012 bytes, cada registro lógico começa com uma <strong>RDW (Record Descriptor Word) de 4 bytes Big-Endian</strong> onde os bytes <code>[2:4]</code> indicam o tamanho exato do payload.
              </p>

              {/* File Header 84 bytes */}
              {info.file_header && (
                <div className="p-4 rounded-lg bg-slate-950 border border-amber-500/30 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-amber-400">
                      Registro #0 — File Header (`REPLACEMENT FILE` • 84 bytes totais)
                    </span>
                    <span className="font-mono text-slate-400">
                      RDW Hex: {info.file_header.rdw_hex} (Payload = {info.file_header.record_len} bytes)
                    </span>
                  </div>
                  <div className="p-2.5 rounded bg-slate-900 font-mono text-xs text-emerald-300 break-all">
                    {info.file_header.raw_ascii}
                  </div>
                </div>
              )}

              {/* First 4 Physical Blocks */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(data?.physical_blocks_sample || []).map((blk: any) => (
                  <div
                    key={blk.block_number}
                    className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-purple-400 font-mono">
                        Bloco Físico #{blk.block_number} (Bytes {blk.byte_offset_start}–{blk.byte_offset_end})
                      </span>
                      <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20 font-mono text-[11px]">
                        Trailer 2B: 0x{blk.trailer_hex} ({blk.trailer_ascii})
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500 uppercase font-semibold">
                      Hex Dump Inicial (Primeiros 48 bytes do bloco):
                    </div>
                    <div className="p-2 rounded bg-slate-900 font-mono text-[11px] text-blue-300 break-all">
                      {blk.hex_preview}
                    </div>
                    <div className="text-[10px] text-slate-500 uppercase font-semibold">
                      Payload ASCII (Primeiros 240 bytes de 1.012B):
                    </div>
                    <div className="p-2 rounded bg-slate-900 font-mono text-[11px] text-slate-300 break-all">
                      {blk.ascii_preview}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: 268 TABLES CATALOG (IP0000T1) */}
        {activeTab === "catalogo" && (
          <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-white">
                  Catálogo Mestre `IP0000T1` — 268 Tabelas de Parâmetros Extraídas do `T068`
                </h2>
                <p className="text-xs text-slate-400">
                  Cada linha de `IP0000T1` (259 bytes) define o `Table ID`, descrição, tamanho do registro (`Rec Len`), quantidade declarada e offsets de chave.
                </p>
              </div>
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Filtrar por IP0040T1, BIN, PDS, CURRENCY..."
                  value={tableSearch}
                  onChange={(e) => setTableSearch(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white"
                />
              </div>
            </div>

            <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="sticky top-0 bg-slate-950 z-10">
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="p-3 font-mono">Table ID</th>
                    <th className="p-3">Descrição Oficial no `IP0000T1`</th>
                    <th className="p-3 font-mono">Rec Len (Bytes)</th>
                    <th className="p-3 font-mono">Rec Count</th>
                    <th className="p-3 font-mono">Subheader Off</th>
                    <th className="p-3 font-mono">Data Offset</th>
                    <th className="p-3 font-mono">Key Length</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70">
                  {filteredTables.map((t: any, i: number) => (
                    <tr key={`${t.table_id}-${i}`} className="hover:bg-slate-800/30">
                      <td className="p-3 font-mono font-bold text-purple-400">{t.table_id}</td>
                      <td className="p-3 font-semibold text-slate-200">{t.desc}</td>
                      <td className="p-3 font-mono text-emerald-400">{t.rec_len} B</td>
                      <td className="p-3 font-mono text-blue-300">{t.rec_count_declared}</td>
                      <td className="p-3 font-mono text-slate-400">{t.subheader_offset}</td>
                      <td className="p-3 font-mono text-slate-400">{t.data_offset}</td>
                      <td className="p-3 font-mono text-amber-300">{t.key_length}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: SAMPLE EXTRACTED RECORDS */}
        {activeTab === "amostras" && (
          <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-4">
            <div className="flex flex-wrap gap-2">
              {[
                { id: "IP0016T1", label: "IP0016T1 — Brand Product Table" },
                { id: "IP0017T1", label: "IP0017T1 — Currency Code & Exp" },
                { id: "IP0006T1", label: "IP0006T1 — Data Element Features" },
                { id: "IP0008T1", label: "IP0008T1 — PDS Features" },
                { id: "IP0011T1", label: "IP0011T1 — Valid MTI-DE24-DE25" },
                { id: "IP0001T1", label: "IP0001T1 — Default Run Options" },
              ].map((tb) => (
                <button
                  key={tb.id}
                  onClick={() => setSelectedSampleTable(tb.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold ${
                    selectedSampleTable === tb.id
                      ? "bg-purple-600 text-white"
                      : "bg-slate-950 text-slate-400 border border-slate-800"
                  }`}
                >
                  {tb.label}
                </button>
              ))}
            </div>

            <div className="space-y-2 max-h-[560px] overflow-y-auto">
              {(data?.sample_records_by_table?.[selectedSampleTable] || []).map(
                (rec: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>
                        Registro #{idx + 1} • Table: <strong className="text-purple-400">{rec.table_id}</strong> • Ctrl: {rec.header_ctrl}
                      </span>
                      <span>
                        RDW: <strong className="text-blue-400">0x{rec.rdw_hex}</strong> ({rec.rec_len} bytes)
                      </span>
                    </div>
                    <div className="p-2 rounded bg-slate-900 text-emerald-300 break-all">
                      {rec.raw_ascii}
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
