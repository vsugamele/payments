import { NextResponse } from "next/server";
import boletinsBundle from "@/data/boletins-bundle.json";

export const dynamic = "force-dynamic";

const CRIT_ORDEM: Record<string, number> = { baixo: 1, medio: 2, alto: 3 };
const CRIT_NOME: Record<number, string> = { 1: "Baixo", 2: "Medio", 3: "Alto" };

export interface ConflitoFonteItem {
  tipo: "CLASSIFICACAO_VS_HEADER" | "CRUZAMENTO_BOLETINS_MESMO_CAMPO";
  campo_ou_escopo: string;
  fonte_a: string;
  fonte_b: string;
  regra: string;
}

export interface IntegridadeFontesResult {
  conflitos_abertos: ConflitoFonteItem[];
  tem_conflito: boolean;
  fonte_unica: boolean;
  requer_aviso_fonte: boolean;
  aviso_fonte_unica: string | null;
  dado_vencido: boolean;
  etapa_travada: boolean;
  motivo_trava: string | null;
  ultima_vigencia: string | null;
  dias_ate_ultima_vigencia: number | null;
}

function normFieldKey(texto: string): string {
  return String(texto || "")
    .toUpperCase()
    .replace(/[\s/_\-.]/g, "")
    .replace(/DE(\d{1,3})/g, (_, d: string) => `DE${d.padStart(3, "0")}`);
}

function parseIsoDateSafe(raw: string): Date | null {
  const m = String(raw || "").trim().match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return null;
  const dt = new Date(`${m[1]}-${m[2]}-${m[3]}T00:00:00Z`);
  return Number.isNaN(dt.getTime()) ? null : dt;
}

function auditarIntegridadeFontes(
  boletim: any,
  todosBoletins: any[],
  nowRef: Date = new Date()
): IntegridadeFontesResult {
  const conflitos: ConflitoFonteItem[] = [];
  const cls = String(boletim?.classificacao || "").trim();
  const act = String(boletim?.action_indicator || "").trim();
  const clsLow = cls.toLowerCase();
  const actLow = act.toLowerCase();

  if (actLow.includes("mandat") && (clsLow.includes("condicional") || clsLow.includes("opcional"))) {
    conflitos.push({
      tipo: "CLASSIFICACAO_VS_HEADER",
      campo_ou_escopo: "Classificação × Action Indicator Oficial",
      fonte_a: `Cabeçalho da Bandeira (${boletim?.fonte || "Boletim Oficial"}): "${act}"`,
      fonte_b: `Triagem Operacional (${boletim?.id}): "${cls}" (${boletim?.gatilhos?.condicao || "aplicável conforme perfil/opt-in"})`,
      regra: "Nada é escolhido em silêncio: exibir ambas as leituras antes de classificar obrigatoriedade.",
    });
  } else if ((actLow.includes("opcional") || actLow.includes("optional")) && clsLow.includes("mandat")) {
    conflitos.push({
      tipo: "CLASSIFICACAO_VS_HEADER",
      campo_ou_escopo: "Classificação × Action Indicator Oficial",
      fonte_a: `Cabeçalho da Bandeira: "${act}"`,
      fonte_b: `Triagem Operacional: "${cls}"`,
      regra: "Divergência explícita entre cabeçalho oficial e classificação interna.",
    });
  }

  const camposAtuais = new Map<string, string>();
  for (const c of boletim?.lentes?.tecnica?.campos || []) {
    if (c) camposAtuais.set(normFieldKey(c), String(c));
  }

  for (const outro of todosBoletins || []) {
    if (!outro || outro.id === boletim?.id) continue;
    const inter: string[] = [];
    for (const oc of outro?.lentes?.tecnica?.campos || []) {
      const k = normFieldKey(oc);
      if (camposAtuais.has(k)) {
        inter.push(camposAtuais.get(k)!);
      }
    }
    if (inter.length > 0) {
      const outroCls = String(outro.classificacao || "").trim();
      const meusPapeis = [...(boletim?.gatilhos?.papeis || [])].sort().join(",");
      const outroPapeis = [...(outro?.gatilhos?.papeis || [])].sort().join(",");
      if (outroCls !== cls || meusPapeis !== outroPapeis) {
        conflitos.push({
          tipo: "CRUZAMENTO_BOLETINS_MESMO_CAMPO",
          campo_ou_escopo: inter.join(", "),
          fonte_a: `${boletim.id} (${cls} · papéis: ${meusPapeis || "n/d"})`,
          fonte_b: `${outro.id} (${outroCls} · papéis: ${outroPapeis || "n/d"})`,
          regra: "Dois normativos alteram/referenciam o mesmo código técnico com escopo ou papel distinto.",
        });
      }
    }
  }

  const fonteDoc = String(boletim?.fonte || "").trim();
  const fonteRegra = String(boletim?.lentes?.normativa?.fonte_regra || "").trim();
  const temMultiplasFontes =
    fonteDoc.includes("+") ||
    fonteRegra.includes(";") ||
    (Boolean(fonteDoc) && Boolean(fonteRegra) && fonteDoc.toLowerCase() !== fonteRegra.toLowerCase());

  const verificarLista: string[] = Array.isArray(boletim?.verificar) ? boletim.verificar : [];
  const fonteUnica = !temMultiplasFontes;
  let avisoFonteUnica: string | null = null;
  if (fonteUnica) {
    avisoFonteUnica = `Fonte documental única (${fonteDoc || "sem manual secundário cruzado"}) — avisar antes de homologar em produção.`;
  } else if (verificarLista.length > 0) {
    avisoFonteUnica = `${verificarLista.length} item(ns) com lacuna aberta em \`verificar\` aguardando batimento contra manual base.`;
  }

  const datasValidas: Array<{ dt: Date; iso: string; detalhe: string }> = [];
  if (Array.isArray(boletim?.vigencia)) {
    for (const v of boletim.vigencia) {
      const parsed = parseIsoDateSafe(v?.data);
      if (parsed) {
        datasValidas.push({
          dt: parsed,
          iso: String(v.data).slice(0, 10),
          detalhe: String(v.detalhe || ""),
        });
      }
    }
  } else if (typeof boletim?.vigencia === "string") {
    const parsed = parseIsoDateSafe(boletim.vigencia);
    if (parsed) {
      datasValidas.push({ dt: parsed, iso: boletim.vigencia.slice(0, 10), detalhe: boletim.release || "" });
    }
  }

  let dadoVencido = false;
  let etapaTravada = false;
  let motivoTrava: string | null = null;
  let ultimaVigencia: string | null = null;
  let diasAteUltimaVigencia: number | null = null;

  if (datasValidas.length > 0) {
    datasValidas.sort((a, b) => a.dt.getTime() - b.dt.getTime());
    const finalVig = datasValidas[datasValidas.length - 1];
    ultimaVigencia = finalVig.iso;
    const utcToday = Date.UTC(nowRef.getUTCFullYear(), nowRef.getUTCMonth(), nowRef.getUTCDate());
    diasAteUltimaVigencia = Math.floor((finalVig.dt.getTime() - utcToday) / 86_400_000);
    if (diasAteUltimaVigencia < 0) {
      dadoVencido = true;
      if (verificarLista.length > 0 || !Array.isArray(boletim?.vigencia)) {
        etapaTravada = true;
        motivoTrava = `Vigência ${ultimaVigencia} já ultrapassada há ${Math.abs(
          diasAteUltimaVigencia
        )} dia(s) com pendência normativa aberta — emissão de parecer/homologação travada até revalidação.`;
      }
    }
  }

  return {
    conflitos_abertos: conflitos,
    tem_conflito: conflitos.length > 0,
    fonte_unica: fonteUnica,
    requer_aviso_fonte: fonteUnica || verificarLista.length > 0,
    aviso_fonte_unica: avisoFonteUnica,
    dado_vencido: dadoVencido,
    etapa_travada: etapaTravada,
    motivo_trava: motivoTrava,
    ultima_vigencia: ultimaVigencia,
    dias_ate_ultima_vigencia: diasAteUltimaVigencia,
  };
}

function projetarPerfil(
  boletim: any,
  perfil: { papeis: string[]; produtos: string[]; bandeiras: string[]; regioes: string[] },
  todosBoletins: any[] = []
) {
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

  const integridade = auditarIntegridadeFontes(boletim, todosBoletins);

  return {
    boletim: boletim.id,
    perfil,
    impacta,
    motivos,
    criticidade: CRIT_NOME[crit] || "Baixo",
    acoes,
    vigencia: boletim.vigencia || [],
    verificar: boletim.verificar || [],
    integridade_fontes: integridade,
    boletim_dados: {
      ...boletim,
      integridade_fontes: integridade,
    },
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
    const rawBoletins: any[] = bundle.boletins || [];
    const boletinsComIntegridade = rawBoletins.map((b) => ({
      ...b,
      integridade_fontes: auditarIntegridadeFontes(b, rawBoletins),
    }));
    const integridadeResumo = {
      conflitosAbertos: boletinsComIntegridade.filter((b) => b.integridade_fontes.tem_conflito).length,
      fontesUnicasOuLacunas: boletinsComIntegridade.filter((b) => b.integridade_fontes.requer_aviso_fonte).length,
      travasVigenciaVencida: boletinsComIntegridade.filter((b) => b.integridade_fontes.etapa_travada).length,
    };

    return NextResponse.json({
      connected: true,
      stats: {
        ...(bundle.stats || {}),
        integridadeResumo,
      },
      boletins: boletinsComIntegridade,
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

    const rawBoletins: any[] = bundle.boletins || [];
    const projecoes = rawBoletins.map((b: any) => projetarPerfil(b, perfil, rawBoletins));
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

    const enrichedSlice = matched.slice(0, limit).map((item) => ({
      ...item,
      integridade_fontes: auditarIntegridadeFontes(
        {
          ...item,
          id: item.identificacao || item.id,
          fonte: item.identificacao ? `Planilha Consolidada (${item.identificacao})` : "Radar de Releases",
        },
        []
      ),
    }));

    return NextResponse.json({
      connected: true,
      totalMatches: matched.length,
      results: enrichedSlice,
    });
  }

  return NextResponse.json({ connected: false, error: `Ação desconhecida: ${action}` }, { status: 400 });
}
