import { NextRequest, NextResponse } from "next/server";
import mpeSnap from "@/data/mpe-t068-forense.json";

export const dynamic = "force-dynamic";

function decodeIp0040Posicional(rawStr: string) {
  const padded = (rawStr || "").padEnd(194, " ");
  const slices = [
    { pos: "001–011", py_slice: "[0:11]", len: 11, field: "CONTROL_HEADER", desc: "Timestamp juliano de atualização + Indicador de operação (A=Active) + Table Sub-ID", value: padded.slice(0, 11) },
    { pos: "012–030", py_slice: "[11:30]", len: 19, field: "ACCOUNT_RANGE_LOW", desc: "Faixa Inicial do BIN/PAN (19 dígitos preenchidos com zeros à direita)", value: padded.slice(11, 30) },
    { pos: "031–033", py_slice: "[30:33]", len: 3, field: "GCMS_PRODUCT_LOW", desc: "Código de Produto Licenciado Inicial (ex: MCS, MCG, MPL, MWE, MDB, MDP, CIR, MSI)", value: padded.slice(30, 33) },
    { pos: "034–052", py_slice: "[33:52]", len: 19, field: "ACCOUNT_RANGE_HIGH", desc: "Faixa Final do BIN/PAN (19 dígitos preenchidos com 9/zeros)", value: padded.slice(33, 52) },
    { pos: "053–055", py_slice: "[52:55]", len: 3, field: "GCMS_PRODUCT_HIGH", desc: "Código de Produto Licenciado Final", value: padded.slice(52, 55) },
    { pos: "056–057", py_slice: "[55:57]", len: 2, field: "CARD_PROGRAM_ID", desc: "Identificador de Programa / Subtipo (ex: MP, MC, MS)", value: padded.slice(55, 57) },
    { pos: "058–068", py_slice: "[57:68]", len: 11, field: "ISSUER_ICA_MEMBER_ID", desc: "Member ID / ICA do Banco Emissor (11 bytes)", value: padded.slice(57, 68) },
    { pos: "069–076", py_slice: "[68:76]", len: 8, field: "RESERVED_FLAGS", desc: "Indicadores internos de roteamento e parâmetros de tabela", value: padded.slice(68, 76) },
    { pos: "077–079", py_slice: "[76:79]", len: 3, field: "COUNTRY_CODE_ALPHA3", desc: "País do Emissor ISO 3166-1 Alpha-3 (ex: BRA, USA, ARG)", value: padded.slice(76, 79) },
    { pos: "080–082", py_slice: "[79:82]", len: 3, field: "COUNTRY_CODE_NUMERIC", desc: "País do Emissor ISO 3166-1 Numérico (ex: 076 = Brasil, 840 = EUA)", value: padded.slice(79, 82) },
    { pos: "083–083", py_slice: "[82:83]", len: 1, field: "ISSUER_REGION", desc: "Região Mastercard (A=USA, B=LAC/Brasil, C=Europe, D=AP, E=MEA, 1=Canada)", value: padded.slice(82, 83) },
    { pos: "084–194", py_slice: "[83:194]", len: 111, field: "EXTENDED_ROUTING_AND_FEES", desc: "Parâmetros de Brand Product, Moeda de Liquidação, Indicadores de Fast Funds e Tokenização", value: padded.slice(83, 194).trim() },
  ];
  return {
    raw_length: (rawStr || "").length,
    expected_length: 194,
    rdw_header_hex: (rawStr || "").length === 194 ? "00C20000" : ((rawStr || "").length).toString(16).toUpperCase().padStart(4, "0"),
    slices,
  };
}

function searchT068(tableId: string, query: string, limit = 25) {
  const snap = mpeSnap as any;
  const qUp = (query || "").trim().toUpperCase();

  if (tableId === "IP0040T1") {
    const allBins: any[] = [...(snap.bin_samples_bra || []), ...(snap.bin_samples_global || [])];
    const results: any[] = [];
    const qDigits = qUp.replace(/\D/g, "");

    for (const b of allBins) {
      if (!qUp) {
        results.push(b);
      } else if (qDigits && qDigits.length >= 6) {
        const padded = qDigits.padEnd(19, "0").slice(0, 19);
        if (
          (b.range_start <= padded && padded <= b.range_end) ||
          String(b.range_start || "").includes(qDigits) ||
          String(b.issuer_ica || "").includes(qDigits)
        ) {
          results.push(b);
        }
      } else if (
        String(b.product_start || "").toUpperCase().includes(qUp) ||
        String(b.country_alpha || "").toUpperCase().includes(qUp) ||
        String(b.issuer_ica || "").toUpperCase().includes(qUp) ||
        String(b.raw_record || "").toUpperCase().includes(qUp)
      ) {
        results.push(b);
      }
      if (results.length >= limit) break;
    }

    return {
      table_id: "IP0040T1",
      query,
      count: results.length,
      results: results.slice(0, limit),
    };
  }

  let samples: any[] = (snap.sample_records_by_table || {})[tableId] || [];
  if (qUp) {
    samples = samples.filter((s) => String(s.raw_ascii || "").toUpperCase().includes(qUp));
  }
  return {
    table_id: tableId,
    query,
    count: samples.length,
    results: samples.slice(0, limit),
  };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action") || "overview";
    const snap = mpeSnap as any;

    if (action === "overview") {
      const firstBin = (snap.bin_samples_bra || [{}])[0];
      return NextResponse.json({
        file_info: snap.file_info,
        physical_blocks_sample: snap.physical_blocks_sample,
        tables_catalog: snap.tables_catalog,
        sample_records_by_table: snap.sample_records_by_table,
        bin_samples_bra: (snap.bin_samples_bra || []).slice(0, 50),
        bin_samples_global: (snap.bin_samples_global || []).slice(0, 15),
        default_decoded_ip0040: decodeIp0040Posicional(firstBin?.raw_record || ""),
      });
    }

    if (action === "decode") {
      return NextResponse.json(decodeIp0040Posicional(searchParams.get("raw") || ""));
    }

    if (action === "search") {
      const tableId = searchParams.get("table_id") || "IP0040T1";
      const query = searchParams.get("query") || "";
      const limit = Number(searchParams.get("limit") || 25);
      return NextResponse.json(searchT068(tableId, query, limit));
    }

    return NextResponse.json({ error: `Ação inválida: ${action}` }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Falha ao executar motor forense MPE T068", detail: error?.message || String(error) },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const action = body.action || "search";

    if (action === "decode") {
      return NextResponse.json(decodeIp0040Posicional(String(body.raw || "")));
    }

    const tableId = body.table_id || "IP0040T1";
    const query = body.query || "";
    const limit = Number(body.limit || 25);
    return NextResponse.json(searchT068(tableId, query, limit));
  } catch (error: any) {
    return NextResponse.json(
      { error: "Falha ao processar operação forense MPE", detail: error?.message || String(error) },
      { status: 500 }
    );
  }
}
