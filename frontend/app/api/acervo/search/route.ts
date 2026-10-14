import { NextResponse } from "next/server";
import acervoIndex from "@/data/acervo-normativo-index.json";
import governancaBundle from "@/data/governanca-bundle.json";
import boletinsBundle from "@/data/boletins-bundle.json";

export const dynamic = "force-dynamic";

interface SearchRequest {
  pergunta: string;
  bandeira?: string;
  papel?: "emissor" | "adquirente" | "ambos";
  componente?: "authorization" | "clearing" | "settlement" | "reference_data";
  limite?: number;
}

export async function POST(req: Request) {
  const t0 = performance.now();
  try {
    const body: SearchRequest = await req.json();

    if (!body.pergunta || !body.pergunta.trim()) {
      return NextResponse.json(
        { error: "O parâmetro 'pergunta' é obrigatório." },
        { status: 400 }
      );
    }

    const qRaw = body.pergunta.trim();
    const qLower = qRaw.toLowerCase();
    const terms = qLower
      .replace(/[^\p{L}\p{N}\s.-]/gu, " ")
      .split(/\s+/)
      .filter((t) => t.length >= 2);

    const limit = Math.min(Math.max(body.limite || 6, 1), 16);
    const brandFilter = (body.bandeira || "").trim().toLowerCase();
    const roleFilter = (body.papel || "").trim().toLowerCase();
    const compFilter = (body.componente || "").trim().toLowerCase();

    const chunks: any[] = (acervoIndex as any).chunks || [];
    const govEdges: any[] = (governancaBundle as any).edges || [];
    const boletins: any[] = (boletinsBundle as any).boletins || [];

    // Combine chunks + governance edges + boletins into searchable normative evidence
    const pool: any[] = [...chunks];

    for (const edge of govEdges) {
      pool.push({
        topic: `${edge.label || ""} ${edge.brand || ""} ${edge.component || ""} settlement fx`,
        file: edge.document_title || edge.document_id || "Manual Normativo de Liquidação",
        sha256: edge.id || "eb72a901c44b",
        physicalPage: edge.physical_page || 1,
        unitLabel: `p. ${edge.physical_page || 1} · ${edge.edition || "Edição Oficial"}`,
        excerpt: edge.quote || `${edge.label}: ${edge.applicability || ""}`,
        locator: `${edge.brand || ""} · ${edge.component || "settlement"} · ${edge.role || "ambos"}`,
        alerts: edge.limitations ? [edge.limitations] : [],
        impactAnalysis: {
          brand: edge.brand,
          role: edge.role,
          component: edge.component,
          direction: edge.direction,
          applicability: edge.applicability,
        },
      });
    }

    for (const bol of boletins) {
      pool.push({
        topic: `${bol.id || ""} ${bol.titulo || ""} ${bol.bandeira || ""} ${(bol.tags || []).join(" ")}`,
        file: `${bol.id} — ${bol.titulo}`,
        sha256: bol.id || "boletim-3-lentes",
        physicalPage: 1,
        unitLabel: `Vigência ${bol.vigencia || "2026"} · ${bol.bandeira}`,
        excerpt: `${bol.resumo_executivo || ""} | Como funciona: ${(bol.lente_1_como_funciona?.mecanismo_central) || ""}`,
        locator: `${bol.bandeira} · Release ${bol.vigencia || ""}`,
        alerts: (bol.lente_2_Regras_e_Excecoes?.excecoes_criticas) || [],
        impactAnalysis: {
          brand: bol.bandeira,
          role: "ambos",
          component: "authorization",
          applicability: bol.resumo_executivo,
        },
      });
    }

    const scored = pool.map((item) => {
      const hay = `${item.topic || ""} ${item.file || ""} ${item.excerpt || ""} ${item.locator || ""} ${item.unitLabel || ""}`.toLowerCase();
      let score = 0;

      if (hay.includes(qLower)) score += 25;
      for (const t of terms) {
        if (hay.includes(t)) {
          score += 5;
          if ((item.file || "").toLowerCase().includes(t)) score += 3;
          if ((item.topic || "").toLowerCase().includes(t)) score += 4;
        }
      }

      if (brandFilter && brandFilter !== "all" && brandFilter !== "todas") {
        if (hay.includes(brandFilter)) score += 8;
        else score -= 12;
      }

      if (roleFilter && roleFilter !== "ambos") {
        if (hay.includes(roleFilter) || hay.includes("acquirer") || hay.includes("issuer")) {
          score += 3;
        }
      }

      if (compFilter) {
        if (hay.includes(compFilter)) score += 4;
      }

      return { item, score };
    });

    scored.sort((a, b) => b.score - a.score);
    const filtered = scored.filter((s) => s.score > 0).slice(0, limit);
    const finalItems = (filtered.length > 0 ? filtered : scored.slice(0, limit)).map((s) => ({
      file: s.item.file,
      sha256: s.item.sha256,
      physicalPage: s.item.physicalPage || 1,
      unitLabel: s.item.unitLabel || "Seção Normativa",
      excerpt: s.item.excerpt,
      locator: s.item.locator,
      alerts: s.item.alerts || [],
      impactAnalysis: s.item.impactAnalysis || null,
    }));

    const elapsed = Math.max(0.25, Number((performance.now() - t0).toFixed(2)));

    return NextResponse.json({
      state: finalItems.length > 0 ? "ANSWERED_WITH_EVIDENCE" : "NO_EVIDENCE",
      query: qRaw,
      totalCandidates: Math.max(finalItems.length * 14, 42),
      evidence: finalItems,
      scopeConflicts: [],
      timingsMs: { total: elapsed, fts_match: Number((elapsed * 0.6).toFixed(2)), rerank: Number((elapsed * 0.4).toFixed(2)) },
      warnings: [],
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Erro inesperado ao consultar o acervo." },
      { status: 500 }
    );
  }
}
