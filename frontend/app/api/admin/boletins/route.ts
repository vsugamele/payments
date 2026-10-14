import { NextResponse } from "next/server";
import boletinsBundle from "@/data/boletins-bundle.json";

export const dynamic = "force-dynamic";

const CRIT_ORDEM: Record<string, number> = { baixo: 1, medio: 2, alto: 3 };
const CRIT_NOME: Record<number, string> = { 1: "Baixo", 2: "Medio", 3: "Alto" };

function projetarPerfil(boletim: any, perfil: { papeis: string[]; produtos: string[]; bandeiras: string[]; regioes: string[] }) {
  const g = boletim.gatilhos || {};
  const motivos: string[] = [];

  const bandeiraOk = !perfil.bandeiras.length || perfil.bandeiras.includes(boletim.bandeira);
  const regiaoOk = !perfil.regioes.length || boletim.regiao === "Global" || perfil.regioes.includes(boletim.regiao);

  const gatPapeis: string[] = g.papeis || [];
  const papeisMatch = gatPapeis.filter((p) => perfil.papeis.includes(p)).sort();

  const produtosGatilho: string[] = g.produtos || [];
  const produtosMatch = produtosGatilho.filter((p) => perfil.produtos.includes(p)).sort();

  let impacta = "Sim";
  if (!bandeiraOk) {
    impacta = "Nao";
    motivos.push(`Bandeira ${boletim.bandeira} fora do perfil.`);
  } else if (!regiaoOk) {
    impacta = "Nao";
    motivos.push(`Regiao ${boletim.regiao} fora do perfil.`);
  } else if (perfil.papeis.length > 0 && papeisMatch.length === 0) {
    impacta = "Nao";
    motivos.push("Nenhum papel do perfil e atingido por este boletim.");
  } else {
    if (papeisMatch.length > 0) {
      motivos.push(`Papel(is) atingido(s): ${papeisMatch.join(", ")}.`);
    }
    if (produtosGatilho.length === 0) {
      impacta = "Sim";
      motivos.push("Boletim sem gatilho de produto especifico — aplica-se ao papel.");
    } else if (produtosMatch.length > 0) {
      impacta = "Sim";
      motivos.push(`Opera produto(s)-gatilho: ${produtosMatch.join(", ")}.`);
    } else if (perfil.produtos.length > 0) {
      impacta = "Nao";
      motivos.push(`Gatilho exige ${JSON.stringify(produtosGatilho)}; perfil nao os opera.`);
    } else {
      impacta = "Avaliar";
      motivos.push(`Gatilho exige ${JSON.stringify(produtosGatilho)} — confirmar no perfil.`);
    }
  }

  const base = CRIT_ORDEM[String(boletim.criticidade_base || "baixo").toLowerCase()] || 1;
  let crit = base;
  if (impacta === "Sim" && produtosMatch.length > 0) {
    crit = Math.min(3, base + 1);
    motivos.push("Criticidade elevada por operar produto-gatilho.");
  }

  const acoes: Record<string, string[]> = {};
  if (impacta !== "Nao") {
    const rawAcoes = boletim.acoes || {};
    if (papeisMatch.length > 0) {
      for (const p of papeisMatch) {
        if (rawAcoes[p] && rawAcoes[p].length > 0) {
          acoes[p] = rawAcoes[p];
        }
      }
    } else {
      for (const [k, v] of Object.entries(rawAcoes)) {
        if (Array.isArray(v) && v.length > 0) {
          acoes[k] = v as string[];
        }
      }
    }
  }

  return {
    boletim: boletim.id,
    perfil,
    impacta,
    motivos,
    criticidade: CRIT_NOME[crit] || "Baixo",
    acoes,
    vigencia: boletim.vigencia || [],
    verificar: boletim.verificar || [],
    boletim_dados: boletim,
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const payload: Record<string, any> = {};
  searchParams.forEach((value, key) => {
    payload[key] = value;
  });
  if (!payload.action) payload.action = "overview";
  return handleBoletins(payload);
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    if (!body.action) body.action = "overview";
    return handleBoletins(body);
  } catch (err: any) {
    return NextResponse.json({ connected: false, error: err.message }, { status: 500 });
  }
}

function handleBoletins(payload: Record<string, any>) {
  const action = payload.action || "overview";
  const bundle = boletinsBundle as any;

  if (action === "overview") {
    return NextResponse.json({
      connected: true,
      stats: bundle.stats,
      boletins: bundle.boletins,
      campos: bundle.campos,
      glossario: bundle.glossario,
      aesSpecMarkdown: bundle.aesSpecMarkdown,
      releaseCycles: bundle.releaseCycles,
    });
  }

  if (action === "projetar") {
    const parseArr = (val: any, fallback: string[], lower = false) => {
      if (!val) return fallback;
      const arr = Array.isArray(val) ? val : String(val).split(",");
      return arr
        .map((s) => (lower ? String(s).trim().toLowerCase() : String(s).trim()))
        .filter((s) => s && s !== "ALL");
    };

    const perfil = {
      papeis: parseArr(payload.papeis, ["emissor"], true),
      produtos: parseArr(payload.produtos, [], true),
      bandeiras: parseArr(payload.bandeiras, [], false),
      regioes: parseArr(payload.regioes, ["Brasil", "LAC", "Global"], false),
    };

    const projecoes = (bundle.boletins || []).map((b: any) => projetarPerfil(b, perfil));
    return NextResponse.json({
      connected: true,
      perfil,
      projecoes,
    });
  }

  if (action === "search_releases") {
    const releases: any[] = bundle.allReleases || [];
    const q = String(payload.q || "").trim().toLowerCase();
    const bandeira = String(payload.bandeira || "ALL").trim();
    const releaseFilter = String(payload.release || "ALL").trim();
    const criticidade = String(payload.criticidade || "ALL").trim();
    const apenasImpactoBr = payload.apenas_impacto_br === true || payload.apenas_impacto_br === "true" || payload.apenas_impacto_br === "1";
    const limit = Math.min(Number(payload.limit || 80), 200);

    const matched = releases.filter((item) => {
      if (bandeira !== "ALL" && String(item.bandeira || "").toLowerCase() !== bandeira.toLowerCase()) return false;
      if (releaseFilter !== "ALL" && item.release !== releaseFilter) return false;
      if (criticidade !== "ALL" && !String(item.criticidade || "").toLowerCase().includes(criticidade.toLowerCase())) return false;
      if (apenasImpactoBr && !["sim", "condicional"].includes(String(item.impacta_brasil || "").toLowerCase())) return false;
      if (q) {
        const hay = `${item.identificacao || ""} ${item.titulo || ""} ${item.resumo || ""} ${item.parecer_tecnico || ""} ${item.area_impactada || ""} ${item.assunto || ""}`.toLowerCase();
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
