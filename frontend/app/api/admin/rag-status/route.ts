import { NextResponse } from "next/server";
import ragSnapshot from "@/data/rag-status-snapshot.json";
import acervoIndex from "@/data/acervo-normativo-index.json";
import subcredCatalogo from "@/data/subcredenciadores-catalogo.json";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query") || "";
  return executeRagStatus(query);
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const query = body.query || "";
    return executeRagStatus(query);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

function executeRagStatus(query: string) {
  const t0 = performance.now();
  let customResult = null;

  if (query && query.trim()) {
    const qClean = query.trim().toLowerCase();
    const terms = qClean.split(/\s+/).filter((t) => t.length >= 2);
    const chunks = (acervoIndex as any).chunks || [];
    const cat = (subcredCatalogo as any).catalogo_master || {};
    const manuals = [...(cat.manuals || []), ...(cat.bulletins || [])];

    let hits = 0;
    for (const c of chunks) {
      const hay = `${c.topic || ""} ${c.file || ""} ${c.excerpt || ""} ${c.unitLabel || ""}`.toLowerCase();
      if (terms.some((t) => hay.includes(t))) hits++;
    }
    for (const m of manuals) {
      const hay = `${m.titulo || ""} ${m.arquivo || ""} ${m.bandeira || ""}`.toLowerCase();
      if (terms.some((t) => hay.includes(t))) hits++;
    }

    const dtMs = Math.max(0.08, Number((performance.now() - t0).toFixed(2)));
    customResult = {
      query: query.trim(),
      hits: Math.min(hits, 20),
      latencyMs: dtMs,
    };
  }

  return NextResponse.json({
    ...ragSnapshot,
    connected: true,
    customResult,
  });
}
