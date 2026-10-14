import { NextRequest, NextResponse } from "next/server";
import subcredData from "@/data/subcredenciadores-catalogo.json";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action") || "overview";
    const q = (searchParams.get("q") || "").trim().toLowerCase();

    if (action === "overview") {
      return NextResponse.json(subcredData);
    }

    if (action === "search_catalogo") {
      const cat = (subcredData as any).catalogo_master || {};
      let allItems: any[] = [...(cat.manuals || []), ...(cat.bulletins || [])];
      if (q) {
        allItems = allItems.filter(
          (it) =>
            String(it.titulo || "").toLowerCase().includes(q) ||
            String(it.arquivo || "").toLowerCase().includes(q) ||
            String(it.bandeira || "").toLowerCase().includes(q) ||
            String(it.tipo || "").toLowerCase().includes(q)
        );
      }
      return NextResponse.json({
        count: allItems.length,
        items: allItems.slice(0, 150),
      });
    }

    return NextResponse.json(subcredData);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Falha ao carregar módulo de Subcredenciadores & Catálogo", detail: error?.message || String(error) },
      { status: 500 }
    );
  }
}
