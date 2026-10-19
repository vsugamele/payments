import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
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

  if (action === "download") {
    const fileId = String(payload.file || "").trim();
    const catalogo: any[] = (tabelasCache as any).arquivos_catalogo || [];
    const entry = catalogo.find((item) => item.id === fileId || item.nome === fileId);

    if (!entry) {
      return NextResponse.json(
        { connected: false, error: `Arquivo não encontrado no catálogo: ${fileId}` },
        { status: 404 }
      );
    }

    const repoRoot = path.resolve(process.cwd(), "..");
    const fullPath = path.resolve(repoRoot, entry.rel_path);

    if (!fullPath.startsWith(repoRoot) || !fs.existsSync(fullPath)) {
      return NextResponse.json(
        { connected: false, error: `Arquivo físico não localizado em disco: ${entry.rel_path}` },
        { status: 404 }
      );
    }

    const fileBuffer = fs.readFileSync(fullPath);
    const safeFilename = encodeURIComponent(entry.nome).replace(/['()]/g, escape);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${entry.nome.replace(/[^\x20-\x7E]/g, "_")}"; filename*=UTF-8''${safeFilename}`,
        "Content-Length": String(fileBuffer.length),
      },
    });
  }

  if (action === "search_intercambio") {
    const ic: any[] = (tabelasCache as any).intercambio || [];
    const q = String(payload.q || "").trim().toLowerCase();
    const bandeira = String(payload.bandeira || "ALL").trim();
    const modalidade = String(payload.modalidade || "ALL").trim();
    const tipoRegra = String(payload.tipo_regra || "ALL").trim();
    const limit = Math.min(Number(payload.limit || 250), 2500);

    const matched = ic.filter((row) => {
      if (bandeira !== "ALL" && String(row.bandeira || "").toLowerCase() !== bandeira.toLowerCase()) return false;
      if (modalidade !== "ALL" && String(row.modalidade || "").toLowerCase() !== modalidade.toLowerCase()) return false;
      if (tipoRegra !== "ALL" && String(row.tipo_regra || "Taxa Base").toLowerCase() !== tipoRegra.toLowerCase()) return false;
      if (q) {
        const hay = `${row.tabela || ""} ${row.programa || ""} ${row.parcelas || ""} ${row.captura || ""} ${row.produto_ird || ""} ${row.segmento || ""} ${row.tipo_regra || ""}`.toLowerCase();
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
