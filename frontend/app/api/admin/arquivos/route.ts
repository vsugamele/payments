import { NextResponse } from "next/server";
import arquivosBundle from "@/data/arquivos-bundle.json";
import mcbsData from "@/data/mcbs-billing-full.json";
import visaBillingData from "@/data/visa-billing-full.json";

export const dynamic = "force-dynamic";

const VISA_CAT_PT: Record<string, string> = {
  "Service Fees": "Taxa de Serviço / Assessment de Volume (TPV)",
  "Network Fees and VisaNet Processing Charges": "Processamento de Rede VisaNet (Base I / Base II)",
  "International Transaction Fees": "Tarifas de Transação Internacional (Cross-Border / ISA)",
  "Visa Direct": "Push Payments & Transferências (Visa Direct / OCT / AFT)",
  "Client Services - Implementation": "Serviços de Implementação, Homologação & Certificação",
  "Client Services - Ongoing Support": "Suporte Operacional Contínuo & Diretório de Clientes",
  "Advisory Services": "Consultoria Executiva Visa (VCA) & Treinamento",
  "Acceptance Solutions": "Soluções de Aceitação, Tap to Phone, Cybersource & Gateways",
  "Consumer Products": "Produtos de Consumo & Benefícios de Cartão",
  "Issuing Solutions": "Soluções para Emissores (Processamento, Cartões & Contas)",
  "Payment and Platform Products": "Produtos de Plataforma, Tokenização (VTS) & Click to Pay",
  "Platform Services": "Serviços de Plataforma, APIs & Conectividade",
  "Risk and Security Intelligence Solutions": "Risco, Prevenção à Fraude, 3DS & Segurança",
  "Visa Commercial Solutions": "Soluções Comerciais, Corporativas & B2B",
  "PLUS - Visa ATM": "Rede de Saques & Caixas Eletrônicos (Visa PLUS ATM)",
  "Non-compliance Assessments": "Multas de Não-Conformidade, Retentativas & Programas (VAMP)",
  "Member to Member Fees": "Taxas Interbancárias Membro-a-Membro",
  "Other": "Outras Tarifas Operacionais Visa"
};

function enrichVisaLinePt(item: any, quemPaga: string) {
  const bLine = String(item["Billing Line"] || "").trim();
  const fName = String(item["Fee Name"] || "").trim();
  const invDesc = String(item["Invoice Description"] || "").trim();
  const longDesc = String(item["Long Description"] || "").trim();
  const fCat = String(item["Fee category"] || "Service Fees").trim();
  const fGroup = String(item["Fee Group"] || "VSS").trim();
  const startDate = String(item["Effective Start Date"] || "2026").trim();

  const catPt = VISA_CAT_PT[fCat] || `Serviço Visa (${fCat})`;
  const textLower = `${fName} ${invDesc} ${longDesc} ${fGroup}`.toLowerCase();

  let modalityPt = "Geral (Crédito / Débito / Pré-pago)";
  if (textLower.includes("credit")) modalityPt = "Modalidade Crédito";
  else if (textLower.includes("debit")) modalityPt = "Modalidade Débito";
  else if (textLower.includes("prepaid")) modalityPt = "Modalidade Pré-Pago";
  else if (textLower.includes("commercial") || textLower.includes("corporate")) modalityPt = "Cartões Comerciais / Corporativos";

  let explicacaoPt = `Linha oficial de faturamento Visa (${bLine}) da família "${catPt}" (${fGroup}), cobrada de ${quemPaga} na modalidade ${modalityPt}.`;
  let gatilhoPt = `Apurado pelo VisaNet Settlement Service (VSS) no relatório VSS-140 / registro Base II TC 46 (Vigência: ${startDate}).`;

  if (textLower.includes("marketing fee") || fGroup.includes("Card Service Fees")) {
    explicacaoPt = `Taxa de Serviço e Marketing Visa (${bLine}) cobrada de ${quemPaga} (${modalityPt}) sobre o volume doméstico liquidado (TPV). Compõe o Assessment Fee trimestral/mensal da bandeira.`;
    gatilhoPt = `Incide sobre o volume total de pagamentos domésticos e saques liquidados no Base II (TC 05 / TC 07), reportado no VSS-140.`;
  } else if (textLower.includes("international") || textLower.includes("cross-border") || textLower.includes("isa") || textLower.includes("multi-currency")) {
    explicacaoPt = `Tarifa de Transação Internacional / Cross-Border Visa (${bLine}) aplicada a ${quemPaga} quando o país do emissor do cartão difere do país do estabelecimento comercial ou há conversão de moeda.`;
    gatilhoPt = `Disparada em transações com Country Code divergente entre Emissor e Adquirente ou liquidação multi-moeda (NDSC/FX) no Base II.`;
  } else if (textLower.includes("token") || textLower.includes("vts")) {
    explicacaoPt = `Tarifa de Tokenização / Visa Token Service (${bLine}) aplicada a ${quemPaga} pelo provisionamento, gestão de ciclo de vida ou transação com credencial tokenizada de rede.`;
    gatilhoPt = `Disparada no uso do VTS (Token Requestor / Cryptogram TAVV) em carteiras digitais ou cofres COF.`;
  } else if (textLower.includes("stip") || textLower.includes("stand-in")) {
    explicacaoPt = `Taxa de Processamento Stand-In (STIP — ${bLine}): cobrada quando o host do Emissor fica indisponível ou dá timeout e a própria Visa aprova/nega a autorização (Base I) em nome do banco.`;
    gatilhoPt = `Disparada por timeout (Response Code 91) ou indisponibilidade do link do Emissor com ativação do STIP no VisaNet Base I.`;
  } else if (textLower.includes("misuse") || textLower.includes("integrity") || textLower.includes("retry") || textLower.includes("reattempt")) {
    explicacaoPt = `Penalidade de Integridade do Sistema / Retentativa Excessiva (${bLine}) cobrada de ${quemPaga} quando transações negadas com códigos definitivos (Hard Decline) ou dados inválidos são reenviadas repetidamente na rede VisaNet.`;
    gatilhoPt = `Disparada por violação da regra Visa Smart Retries (excesso de 15 retentativas em 30 dias no mesmo PAN ou retentativa após código Categoria 1).`;
  } else if (textLower.includes("dispute") || textLower.includes("chargeback") || textLower.includes("vrol") || textLower.includes("order insight") || textLower.includes(" arbitration")) {
    explicacaoPt = `Tarifa de Gestão de Disputas, Chargeback ou Resolução Prévia (${bLine}) cobrada de ${quemPaga} pelo processamento de contestações no Visa Resolve Online (VROL) ou consultas Order Insight / Verifi.`;
    gatilhoPt = `Disparada na abertura de disputa (TC 15), reapresentação, pré-arbitragem ou consulta preventiva de transação (Order Insight).`;
  } else if (textLower.includes("3ds") || textLower.includes("secure") || textLower.includes("authentication") || textLower.includes("risk") || textLower.includes("fraud")) {
    explicacaoPt = `Tarifa de Autenticação 3-D Secure, Antifraude e Inteligência de Risco (${bLine}) aplicada a ${quemPaga} pelo uso de ferramentas de autenticação EMV 3DS, Visa Advanced Authorization (VAA) ou scoring de risco.`;
    gatilhoPt = `Disparada por requisição autenticada no diretório 3DS ou avaliação de score de risco no Base I.`;
  } else if (textLower.includes("visa direct") || textLower.includes("oct") || textLower.includes("aft") || textLower.includes("fast funds")) {
    explicacaoPt = `Tarifa de Push Payment / Visa Direct (${bLine}) aplicada a ${quemPaga} em transações de transferência rápida de fundos (OCT — Original Credit Transaction) ou carregamento de conta (AFT).`;
    gatilhoPt = `Disparada no envio de mensagens de crédito direto (OCT / TC 06) ou Account Funding via Visa Direct.`;
  } else if (textLower.includes("authorization") || textLower.includes("clearing") || textLower.includes("settlement")) {
    explicacaoPt = `Tarifa de Processamento de Autorização (Base I) e Clearing/Liquidação (Base II) (${bLine}) cobrada de ${quemPaga} por transação ou arquivo trafegado na rede VisaNet.`;
    gatilhoPt = `Apurada por mensagem de autorização (0100/0110) ou registro de clearing (TC 05 / TC 06 / TC 07) processado na janela diária.`;
  }

  return {
    serviceLabelPt: `${catPt} · ${fGroup}`,
    explicacaoPt,
    gatilhoPt,
    rates: [
      `Fatura VSS: ${invDesc || fName}`,
      `Modalidade: ${modalityPt}`,
      `Vigência Oficial: ${startDate}`
    ]
  };
}

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
          const hay = `${item.code || ""} ${item.name || ""} ${item.description || ""} ${item.serviceId || ""} ${item.explicacaoPt || ""} ${item.serviceLabelPt || ""}`.toLowerCase();
          if (!hay.includes(q)) continue;
        }
        totalMcbsMatched++;
        if (results.length < limit) {
          results.push({
            bandeira: "Mastercard",
            sistema: "MCBS Billing Brazil (IPM 1740)",
            codigo: item.code,
            serviceId: item.serviceId,
            serviceLabelPt: item.serviceLabelPt || `Grupo MCBS (${item.serviceId})`,
            nome: item.name,
            quemPaga: billedTo,
            descricao: item.description,
            explicacaoPt: item.explicacaoPt || `Tarifa operacional MCBS (${item.serviceId}) cobrada de ${billedTo}.`,
            gatilhoPt: item.gatilhoPt || "Apurado no ciclo de faturamento MCBS / arquivo IPM 1740.",
            rates: item.rates || [],
            fonte: `${item.manual || "Manual MCBS - Billing - BRAZIL.pdf"} · p. ${item.page || "?"}`,
            reconciliacao: "Fatura MCBS / Arquivo IPM 1740 (Fee Collection — DE 25=28, DE 63)",
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
        const fGroup = String(item["Fee Group"] || "VSS");

        if (q) {
          const hay = `${bLine} ${fName} ${invDesc} ${longDesc} ${fCat} ${fGroup}`.toLowerCase();
          if (!hay.includes(q)) continue;
        }

        totalVisaMatched++;
        if (results.length < limit) {
          const ptInfo = enrichVisaLinePt(item, quemPaga);
          results.push({
            bandeira: "Visa",
            sistema: `Visa VSS Billing (${fCat || "Fee Guide"})`,
            codigo: bLine || fName.slice(0, 12),
            serviceId: fGroup,
            serviceLabelPt: ptInfo.serviceLabelPt,
            nome: fName || invDesc,
            quemPaga,
            descricao: longDesc || invDesc,
            explicacaoPt: ptInfo.explicacaoPt,
            gatilhoPt: ptInfo.gatilhoPt,
            rates: ptInfo.rates,
            fonte: "Visa Billing Line Mapping & Fee Guide (Base Oficial 2026)",
            reconciliacao: "Relatório VSS-140 / Registro Base II TC 46 Subgroup 4 & 5",
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
