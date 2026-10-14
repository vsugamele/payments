import { NextResponse } from "next/server";
import tarifasBundle from "@/data/tarifas-reais-bundle.json";
import tabelasCache from "@/data/tabelas-intercambio-fees.json";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const payload: Record<string, any> = {};
  searchParams.forEach((value, key) => {
    payload[key] = value;
  });
  if (!payload.action) payload.action = "overview";
  return handleTarifas(payload);
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    if (!body.action) body.action = "overview";
    return handleTarifas(body);
  } catch (err: any) {
    return NextResponse.json({ connected: false, error: err.message }, { status: 500 });
  }
}

function handleTarifas(payload: Record<string, any>) {
  const action = payload.action || "overview";

  if (action === "overview") {
    return NextResponse.json(tarifasBundle);
  }

  if (action === "search_intercambio") {
    const ic: any[] = (tabelasCache as any).intercambio || [];
    const q = String(payload.q || "").trim().toLowerCase();
    const bandeira = String(payload.bandeira || "ALL").trim();
    const modalidade = String(payload.modalidade || "ALL").trim();
    const limit = Math.min(Number(payload.limit || 100), 250);

    const matched = ic.filter((row) => {
      if (bandeira !== "ALL" && String(row.bandeira || "").toLowerCase() !== bandeira.toLowerCase()) return false;
      if (modalidade !== "ALL" && String(row.modalidade || "").toLowerCase() !== modalidade.toLowerCase()) return false;
      if (q) {
        const hay = `${row.tabela || ""} ${row.programa || ""} ${row.parcelas || ""} ${row.captura || ""} ${row.produto_ird || ""} ${row.segmento || ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    return NextResponse.json({
      connected: true,
      totalMatches: matched.length,
      results: matched.slice(0, limit),
    });
  }

  return NextResponse.json({ connected: false, error: `Ação desconhecida: ${action}` }, { status: 400 });
}
