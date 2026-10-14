import { NextResponse } from "next/server";
import arquivosBundle from "@/data/arquivos-bundle.json";
import mcbsData from "@/data/mcbs-billing-full.json";
import visaBillingData from "@/data/visa-billing-full.json";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const payload: Record<string, any> = {};
  searchParams.forEach((value, key) => {
    payload[key] = value;
  });
  if (!payload.action) payload.action = "overview";
  return handleArquivos(payload);
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    if (!body.action) body.action = "overview";
    return handleArquivos(body);
  } catch (err: any) {
    return NextResponse.json({ connected: false, error: err.message }, { status: 500 });
  }
}

function handleArquivos(payload: Record<string, any>) {
  const action = payload.action || "overview";
  const bundle = arquivosBundle as any;

  if (action === "overview") {
    return NextResponse.json(bundle.overview);
  }

  if (action === "get_layout") {
    const presetId = String(payload.preset_id || "visa_tc05_tcr0").trim();
    const layouts = bundle.layoutsByPreset || {};
    const layout = layouts[presetId] || layouts["visa_tc05_tcr0"];
    return NextResponse.json(layout);
  }

  if (action === "search_campos") {
    const campos: any[] = bundle.sampledCampos || [];
    const q = String(payload.q || "").trim().toLowerCase();
    const bandeira = String(payload.bandeira || "ALL").trim();
    const docId = String(payload.doc_id || "ALL").trim();
    const tipo = String(payload.tipo || "ALL").trim();
    const deClean = String(payload.de || "").replace(/\D/g, "");
    const pdsClean = String(payload.pds || "").replace(/\D/g, "");
    const posInt = payload.posicao ? parseInt(String(payload.posicao), 10) : NaN;
    const onlyPositional = payload.only_positional === true || payload.only_positional === "true" || payload.only_positional === "1";
    const limit = Math.min(Number(payload.limit || 80), 200);

    const matched = campos.filter((cp) => {
      if (bandeira && bandeira !== "ALL" && cp.bandeira !== bandeira) return false;
      if (docId && docId !== "ALL" && cp.doc_id !== docId) return false;
      if (tipo && tipo !== "ALL" && cp.tipo !== tipo) return false;
      if (deClean) {
        const cpDe = String(cp.de || "").replace(/\D/g, "");
        if (cpDe !== deClean && cpDe.replace(/^0+/, "") !== deClean.replace(/^0+/, "")) return false;
      }
      if (pdsClean) {
        const cpPds = String(cp.pds || "").replace(/\D/g, "");
        if (cpPds !== pdsClean && cpPds.padStart(4, "0") !== pdsClean.padStart(4, "0")) return false;
      }
      if (!isNaN(posInt)) {
        if (!cp.pos_inicio || !cp.pos_fim || cp.pos_inicio > posInt || cp.pos_fim < posInt) return false;
      }
      if (onlyPositional && (cp.pos_inicio == null || cp.pos_fim == null)) return false;
      if (q) {
        const hay = `${cp.nome || ""} ${cp.descricao || ""} ${cp.registro || ""} ${cp.valor || ""} ${cp.de || ""} ${cp.pds || ""}`.toLowerCase();
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

  if (action === "search_billing") {
    const q = String(payload.q || "").trim().toLowerCase();
    const brand = String(payload.brand || "ALL").trim();
    const role = String(payload.role || "ALL").trim();
    const serviceId = String(payload.service_id || "ALL").trim().toUpperCase();
    const limit = Math.min(Number(payload.limit || 60), 150);

    const mcbsList: any[] = Array.isArray(mcbsData) ? mcbsData : [];
    const visaList: any[] = Array.isArray(visaBillingData) ? visaBillingData : [];

    const results: any[] = [];
    let totalMcbsMatched = 0;
    let totalVisaMatched = 0;

    const mcbsServices = Array.from(
      new Set(mcbsList.map((item) => item.serviceId).filter(Boolean))
    ).sort();

    if (brand === "ALL" || brand === "Mastercard") {
      for (const item of mcbsList) {
        if (serviceId !== "ALL" && item.serviceId !== serviceId) continue;
        const billedTo = String(item.billedTo || "Adquirente / Emissor");
        if (role !== "ALL") {
          if (role === "Adquirente" && !billedTo.includes("Adquirente")) continue;
          if (role === "Emissor" && !billedTo.includes("Emissor")) continue;
        }
        if (q) {
          const hay = `${item.code || ""} ${item.name || ""} ${item.description || ""} ${item.serviceId || ""}`.toLowerCase();
          if (!hay.includes(q)) continue;
        }
        totalMcbsMatched++;
        if (results.length < limit) {
          results.push({
            bandeira: "Mastercard",
            sistema: "MCBS Billing Brazil (IPM 1740)",
            codigo: item.code,
            serviceId: item.serviceId,
            nome: item.name,
            quemPaga: billedTo,
            descricao: item.description,
            rates: item.rates || [],
            fonte: `${item.manual || "Manual MCBS - Billing - BRAZIL.pdf"} · p. ${item.page || "?"}`,
            reconciliacao: "Fatura MCBS / Arquivo IPM 1740 (Fee Collection)",
          });
        }
      }
    }

    if (brand === "ALL" || brand === "Visa") {
      for (const item of visaList) {
        const clientType = String(item["Client Type"] || "Both").toLowerCase();
        let quemPaga = "Adquirente / Emissor";
        if (clientType.includes("acquirer") && !clientType.includes("issuer")) {
          quemPaga = "Adquirente (Acquirer)";
        } else if (clientType.includes("issuer") && !clientType.includes("acquirer")) {
          quemPaga = "Emissor (Issuer)";
        }

        if (role !== "ALL") {
          if (role === "Adquirente" && !quemPaga.includes("Adquirente")) continue;
          if (role === "Emissor" && !quemPaga.includes("Emissor")) continue;
        }

        const bLine = String(item["Billing Line"] || "");
        const fName = String(item["Fee Name"] || "");
        const invDesc = String(item["Invoice Description"] || "");
        const longDesc = String(item["Long Description"] || "");
        const fCat = String(item["Fee category"] || "");

        if (q) {
          const hay = `${bLine} ${fName} ${invDesc} ${longDesc} ${fCat}`.toLowerCase();
          if (!hay.includes(q)) continue;
        }

        totalVisaMatched++;
        if (results.length < limit) {
          results.push({
            bandeira: "Visa",
            sistema: `Visa VSS Billing (${fCat || "Fee Guide"})`,
            codigo: bLine || fName.slice(0, 12),
            serviceId: String(item["Fee Group"] || "VSS"),
            nome: fName || invDesc,
            quemPaga,
            descricao: longDesc || invDesc,
            rates: [`Invoice: ${invDesc}`, `Vigência: ${item["Effective Start Date"] || "2026"}`],
            fonte: "Visa Billing Line Mapping & Fee Guide (Base Oficial)",
            reconciliacao: "Relatório VSS-140 / TC 46 Subgroup 4 & 5",
          });
        }
      }
    }

    return NextResponse.json({
      connected: true,
      totalMcbsMatched,
      totalVisaMatched,
      totalMatched: totalMcbsMatched + totalVisaMatched,
      mcbsServiceIds: mcbsServices.slice(0, 60),
      results,
    });
  }

  return NextResponse.json({ connected: false, error: `Ação desconhecida: ${action}` }, { status: 400 });
}
