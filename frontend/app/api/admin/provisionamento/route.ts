import { NextRequest, NextResponse } from "next/server";
import provData from "@/data/provisionamento-rules.json";
import mpeData from "@/data/mpe-t068-forense.json";

export const dynamic = "force-dynamic";

function lookupBinOffline(pan: string) {
  if (!pan) return null;
  const panClean = String(pan).replace(/\D/g, "");
  if (panClean.length < 6) return null;
  const padded = panClean.padEnd(19, "0").slice(0, 19);

  const mpe = mpeData as any;
  const allBins: any[] = [...(mpe.bin_samples_bra || []), ...(mpe.bin_samples_global || [])];
  const matches = allBins.filter((b) => b.range_start <= padded && padded <= b.range_end);
  if (matches.length > 0) {
    matches.sort((a, b) => {
      const aNonCir = ["CIR", "MSI"].includes(a.product_start) ? 0 : 1;
      const bNonCir = ["CIR", "MSI"].includes(b.product_start) ? 0 : 1;
      return bNonCir - aNonCir;
    });
    return matches[0];
  }
  return null;
}

function evalMcClause(varName: string, op: string, valRaw: string, ctx: Record<string, any>): { passed: boolean; expected: string } {
  const actual = ctx[varName];
  if (valRaw.startsWith('"') && valRaw.endsWith('"')) {
    const expected = valRaw.slice(1, -1);
    return { passed: actual === expected, expected };
  }
  const expectedNum = valRaw.includes(".") ? parseFloat(valRaw) : parseInt(valRaw, 10);
  const actNum = typeof actual === "number" ? actual : 0;
  let passed = false;
  if (op === "=") passed = actual === expectedNum;
  else if (op === ">=") passed = actNum >= expectedNum;
  else if (op === "<=") passed = actNum <= expectedNum;
  return { passed, expected: String(expectedNum) };
}

function evalMcExpression(expr: string, ctx: Record<string, any>): boolean {
  // Replace atomic (VAR OP VAL) with "true" or "false"
  let jsExpr = expr.replace(/\((\w+)\s*(=|>=|<=)\s*("[^"]+"|[\d.]+)\)/g, (_, v, op, valRaw) => {
    const res = evalMcClause(v, op, valRaw, ctx);
    return res.passed ? "true" : "false";
  });
  jsExpr = jsExpr.replace(/&/g, "&&").replace(/\|/g, "||");
  try {
    return Boolean(Function(`"use strict"; return (${jsExpr});`)());
  } catch {
    return false;
  }
}

function evalVisaAtomic(rawClause: string, varName: string, opPart: string, valPart: string, ctx: Record<string, any>): { passed: boolean; opLabel: string; expectedStr: string } {
  const actual = ctx[varName];
  const opClean = opPart.trim();
  const valClean = (valPart || "").trim();

  if (opClean === "IS NOT NULL") {
    return { passed: actual !== null && actual !== undefined && actual !== "", opLabel: "STATE", expectedStr: "IS NOT NULL" };
  }
  if (opClean === "IS EMPTY") {
    return { passed: actual === null || actual === undefined || actual === "", opLabel: "STATE", expectedStr: "IS EMPTY" };
  }
  if (opClean.startsWith("IN")) {
    const insideMatch = opClean.match(/IN\s*\(([^)]+)\)/i);
    const items = insideMatch
      ? insideMatch[1]
          .split(",")
          .map((s) => s.trim().replace(/^'|'$/g, ""))
      : [];
    const passed = actual !== null && actual !== undefined && items.includes(String(actual));
    return { passed, opLabel: "IN", expectedStr: opClean };
  }

  if (valClean.startsWith("'") && valClean.endsWith("'")) {
    const expected = valClean.slice(1, -1);
    const passed = opClean === "!=" ? actual !== expected : actual === expected;
    return { passed, opLabel: opClean, expectedStr: expected };
  }

  const numExpected = valClean.includes(".") ? parseFloat(valClean) : parseInt(valClean, 10);
  const actNum = typeof actual === "number" ? actual : parseFloat(String(actual || "0")) || 0;
  let passed = false;
  if (opClean === "=") passed = actual === numExpected || String(actual) === String(numExpected);
  else if (opClean === "!=") passed = actual !== numExpected;
  else if (opClean === ">=") passed = actNum >= numExpected;
  else if (opClean === "<=") passed = actNum <= numExpected;
  else if (opClean === ">") passed = actNum > numExpected;
  else if (opClean === "<") passed = actNum < numExpected;

  return { passed, opLabel: opClean, expectedStr: String(numExpected) };
}

function evalVisaExpression(expr: string, ctx: Record<string, any>): boolean {
  const tokenRe = /\((\w+)\s+(IN\s*\([^)]+\)|IS NOT NULL|IS EMPTY|>=|<=|>|<|=|!=)\s*('[^']*'|[\d.]+)?\)/g;
  let jsExpr = expr.replace(tokenRe, (full, v, opPart, valPart) => {
    const res = evalVisaAtomic(full, v, opPart, valPart || "", ctx);
    return res.passed ? "true" : "false";
  });
  jsExpr = jsExpr.replace(/&/g, "&&").replace(/\|/g, "||");
  try {
    return Boolean(Function(`"use strict"; return (${jsExpr});`)());
  } catch {
    return false;
  }
}

function evaluateClausesTrace(expr: string, ctx: Record<string, any>, isVisa = false) {
  const clauses: any[] = [];
  if (!isVisa) {
    const re = /\((\w+)\s*(=|>=|<=)\s*("[^"]+"|[\d.]+)\)/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(expr)) !== null) {
      const varName = m[1];
      const op = m[2];
      const valRaw = m[3];
      const actual = ctx[varName];
      const { passed, expected } = evalMcClause(varName, op, valRaw, ctx);
      clauses.push({
        raw: m[0],
        var: varName,
        op,
        expected,
        actual: actual === null || actual === undefined ? "NULL" : String(actual),
        passed,
      });
    }
  } else {
    const tokenRe = /\((\w+)\s+(IN\s*\([^)]+\)|IS NOT NULL|IS EMPTY|>=|<=|>|<|=|!=)\s*('[^']*'|[\d.]+)?\)/g;
    let m: RegExpExecArray | null;
    while ((m = tokenRe.exec(expr)) !== null) {
      const varName = m[1];
      const opPart = m[2];
      const valPart = m[3] || "";
      const actual = ctx[varName];
      const { passed, opLabel, expectedStr } = evalVisaAtomic(m[0], varName, opPart, valPart, ctx);
      clauses.push({
        raw: m[0],
        var: varName,
        op: opLabel,
        expected: expectedStr,
        actual: actual === null || actual === undefined ? "NULL" : String(actual),
        passed,
      });
    }
  }
  return clauses;
}

export function simulateTransaction(payload: Record<string, any>) {
  const data = provData as any;
  let scheme = String(payload.bandeira || "mastercard").toLowerCase();
  const valor = Number(payload.valor || 150.0);
  const pan = String(payload.pan || "").trim();

  const binInfo = pan ? lookupBinOffline(pan) : null;

  if (scheme === "mastercard" || scheme === "maestro") {
    const mccVal = payload.MCC;
    const mccInt = mccVal !== null && mccVal !== undefined && mccVal !== "" && mccVal !== 0 && mccVal !== "0" ? parseInt(String(mccVal), 10) : null;
    let productType = String(payload.PRODUCT_TYPE || "CREDIT").toUpperCase();
    let cardProgramId = payload.CARD_PROGRAM_ID || (scheme === "maestro" ? "MSI" : null);
    let tier = String(payload.tier || "Consumer standard");
    let issrCountry = parseInt(String(payload.ISSR_COUNTRY_CODE ?? 76), 10);
    const acqrCountry = parseInt(String(payload.ACQR_COUNTRY_CODE ?? 76), 10);

    if (binInfo) {
      const prod = String(binInfo.product_start || "").toUpperCase();
      if (prod === "CIR" || prod === "MSI") {
        scheme = "maestro";
        cardProgramId = "MSI";
      } else {
        scheme = "mastercard";
      }
      const prodMap: Record<string, [string, string]> = {
        MCS: ["CREDIT", "Consumer standard"],
        MCG: ["CREDIT", "Consumer gold"],
        MPL: ["CREDIT", "Consumer platinum"],
        MWE: ["CREDIT", "Consumer black"],
        MDB: ["DEBIT", "Consumer standard"],
        MDP: ["PREPAID", "Consumer standard"],
      };
      if (prodMap[prod]) {
        [productType, tier] = prodMap[prod];
      }
      const cNum = parseInt(String(binInfo.country_num || "76"), 10);
      issrCountry = isNaN(cNum) ? (binInfo.country_alpha === "BRA" ? 76 : 840) : cNum;
    }

    const maestroSegMap: Record<number, string> = {
      5411: "SPR_MKT", 5422: "SPR_MKT", 5451: "SPR_MKT", 5462: "SPR_MKT",
      5499: "SPR_MKT", 5300: "WHOLE", 5199: "WHOLE", 5912: "WHOLE",
      9406: "LOT", 9311: "GOV_SVC", 9222: "GOV_SVC", 9399: "GOV_SVC",
      4111: "COMM_T", 4784: "COMM_T", 4121: "COMM_T",
      4813: "GEN_EX", 4814: "GEN_EX", 4900: "GEN_EX",
      742: "MM", 1799: "MM", 5697: "MM", 7230: "MM",
      7538: "MM", 8011: "MM", 8021: "MM", 8099: "MM",
    };
    const segmentMaestro = payload.SEGMENT || (mccInt ? maestroSegMap[mccInt] || null : null);

    const ctx: Record<string, any> = {
      ACQR_COUNTRY_CODE: acqrCountry,
      ISSR_COUNTRY_CODE: issrCountry,
      PRODUCT_TYPE: productType,
      CARD_PROGRAM_ID: cardProgramId,
      CARD_PRESENT_ID: parseInt(String(payload.CARD_PRESENT_ID ?? 1), 10),
      PAYPASS_IND: parseInt(String(payload.PAYPASS_IND ?? 0), 10),
      ECSLI: payload.ECSLI || null,
      MCC: mccInt,
      PROC_CODE: parseInt(String(payload.PROC_CODE ?? 0), 10),
      TXN_AMOUNT: valor,
      INSTALLMENTS: parseInt(String(payload.INSTALLMENTS ?? 1), 10),
      DOCUMENT_TYPE: parseInt(String(payload.DOCUMENT_TYPE ?? 2), 10),
      ENTRY_MODE: payload.ENTRY_MODE || null,
      SEGMENT: segmentMaestro,
    };

    if (scheme === "maestro" || cardProgramId === "MSI") {
      const rules: any[] = data.maestro_rules || [];
      const cascata: any[] = [];
      let matched: any = null;

      for (const r of rules) {
        const hit = evalMcExpression(r.expression, ctx);
        cascata.push({
          priority: r.priority,
          rule_id: String(r.rule_id),
          ird: r.pseudo_ird,
          description: r.description || "",
          expression: r.expression,
          result: hit,
          clauses: evaluateClausesTrace(r.expression, ctx, false),
        });
        if (hit && !matched) {
          matched = r;
          break;
        }
      }

      if (!matched) {
        return {
          sucesso: false,
          bandeira: "maestro",
          erro: "Nenhuma regra Maestro enquadrada para o contexto informado.",
          ctx,
          bin_info: binInfo,
          cascata,
        };
      }

      const ratePct = Number(matched.rate_pct);
      let taxa = Number((valor * (ratePct / 100.0)).toFixed(4));
      const capBrl = matched.cap_brl;
      let capAplicado = false;
      if (capBrl && taxa > Number(capBrl)) {
        taxa = Number(capBrl);
        capAplicado = true;
      }

      return {
        sucesso: true,
        bandeira: "maestro",
        rule_id: String(matched.rule_id),
        ird: matched.pseudo_ird,
        descricao_regra: matched.description || "",
        prioridade: matched.priority,
        expression: matched.expression,
        segment: segmentMaestro || "Base",
        tier,
        rate_pct: Number(ratePct.toFixed(4)),
        rate_resolution: {
          mode: "MAESTRO_DIRECT",
          base_ia_pct: Number(ratePct.toFixed(4)),
          adjustment_pct: 0.0,
          cap_brl: capBrl,
        },
        valor_transacao: valor,
        taxa_intercambio: Number(taxa.toFixed(4)),
        taxa_intercambio_fmt: `R$ ${taxa.toFixed(4)}`,
        cap_aplicado: capAplicado,
        ctx,
        bin_info: binInfo,
        cascata,
      };
    } else {
      const rules: any[] = data.mc_rules || [];
      const cascata: any[] = [];
      let matched: any = null;

      for (const r of rules) {
        const hit = evalMcExpression(r.expression, ctx);
        cascata.push({
          priority: r.priority,
          rule_id: String(r.rule_id),
          ird: r.ird,
          description: r.description || "",
          expression: r.expression,
          result: hit,
          clauses: evaluateClausesTrace(r.expression, ctx, false),
        });
        if (hit && !matched) {
          matched = r;
          break;
        }
      }

      if (!matched) {
        return {
          sucesso: false,
          bandeira: "mastercard",
          erro: "Nenhuma regra Mastercard encontrada na cascata.",
          ctx,
          bin_info: binInfo,
          cascata,
        };
      }

      const ird = matched.ird;
      const mccSegRow = (data.mcc_to_segment || []).find((row: any) => Number(row.mcc) === mccInt);
      const segment = mccInt && mccSegRow ? mccSegRow.segment : "Base";

      const findBaseRate = (i: string, t: string, s: string): number | undefined => {
        const found = (data.base_rates || []).find((r: any) => r.ird === i && r.tier === t && r.segment === s);
        return found ? Number(found.rate_pct) : undefined;
      };
      const findAdj = (i: string, s: string): number | undefined => {
        const found = (data.adjustments || []).find((r: any) => r.ird === i && r.segment === s);
        return found ? Number(found.adjustment_pct) : undefined;
      };

      const adjIrdBase: Record<string, string> = data.mappings?.adjustment_ird_base || {};
      let ratePct = findBaseRate(ird, tier, segment);
      let resMode = "DIRECT_BASE_RATE";
      let baseIaPct = ratePct;
      let adjPct = 0.0;

      if (ratePct === undefined) {
        const baseIrd = adjIrdBase[ird];
        if (baseIrd) {
          baseIaPct = findBaseRate(baseIrd, tier, segment) ?? findBaseRate(baseIrd, tier, "Base");
          if (baseIaPct !== undefined) {
            adjPct = findAdj(ird, segment) ?? findAdj(ird, "Base") ?? 0.0;
            ratePct = baseIaPct + adjPct;
            resMode = `ADJUSTMENT_OVER_${baseIrd}`;
          }
        }
      }

      if (ratePct === undefined) {
        for (const segFb of ["Other", "Base"]) {
          const fbVal = findBaseRate(ird, tier, segFb);
          if (fbVal !== undefined) {
            ratePct = fbVal;
            baseIaPct = fbVal;
            resMode = `FALLBACK_SEGMENT_${segFb.toUpperCase()}`;
            break;
          }
        }
      }

      if (ratePct === undefined) {
        return {
          sucesso: false,
          bandeira: "mastercard",
          ird,
          erro: `Taxa não localizada para IRD=${ird}, Tier=${tier}, Segment=${segment}`,
          ctx,
          bin_info: binInfo,
          cascata,
        };
      }

      const taxa = Number((valor * (ratePct / 100.0)).toFixed(4));
      return {
        sucesso: true,
        bandeira: "mastercard",
        rule_id: String(matched.rule_id),
        ird,
        descricao_regra: matched.description || "",
        prioridade: matched.priority,
        expression: matched.expression,
        segment,
        tier,
        rate_pct: Number(ratePct.toFixed(4)),
        rate_resolution: {
          mode: resMode,
          base_ia_pct: baseIaPct !== undefined ? Number(baseIaPct.toFixed(4)) : null,
          adjustment_pct: Number(adjPct.toFixed(4)),
        },
        valor_transacao: valor,
        taxa_intercambio: taxa,
        taxa_intercambio_fmt: `R$ ${taxa.toFixed(4)}`,
        cap_aplicado: false,
        ctx,
        bin_info: binInfo,
        cascata,
      };
    }
  } else {
    // Visa
    const mandatoryRaw = payload.MANDATORY_DATA;
    const mandatoryData = mandatoryRaw === undefined || mandatoryRaw === null ? "PRESENT" : String(mandatoryRaw).trim() || null;

    const ctx: Record<string, any> = {
      AMOUNT: valor,
      SETTL_FLAG: String(payload.SETTL_FLAG || "9").trim(),
      PID: String(payload.PID || "F^").trim(),
      AFS: String(payload.AFS || "C").trim(),
      ECI: String(payload.ECI || "").trim() || null,
      MCC: String(payload.MCC || "").trim() || null,
      INST: parseInt(String(payload.INST ?? 1), 10),
      POS_ENTRY_MODE: String(payload.POS_ENTRY_MODE || "05").trim(),
      SPI: String(payload.SPI || "").trim() || null,
      BAI: String(payload.BAI || "").trim() || null,
      SUBTYPE: String(payload.SUBTYPE || "").trim() || null,
      TRAN_CODE: String(payload.TRAN_CODE || "").trim() || null,
      TCQ: String(payload.TCQ || "").trim() || null,
      TAD: String(payload.TAD || "").trim() || null,
      MVV: String(payload.MVV || "").trim() || null,
      ISS_REG: String(payload.ISS_REG || "").trim() || null,
      TIMELINESS: parseInt(String(payload.TIMELINESS ?? 0), 10),
      MANDATORY_DATA: mandatoryData,
      RESP_CODE: String(payload.RESP_CODE || "").trim() || null,
    };

    const rules: any[] = data.visa_rules || [];
    const cascata: any[] = [];
    let matched: any = null;

    for (const r of rules) {
      const hit = evalVisaExpression(r.expression, ctx);
      cascata.push({
        priority: r.priority,
        rule_id: String(r.rule_id),
        ird: String(r.rule_id),
        description: r.descriptor || "",
        expression: r.expression,
        result: hit,
        rate_corrupted: Boolean(r.rate_corrupted),
        clauses: evaluateClausesTrace(r.expression, ctx, true),
      });
      if (hit && !matched) {
        matched = r;
        break;
      }
    }

    if (!matched) {
      return {
        sucesso: false,
        bandeira: "visa",
        erro: "Nenhuma regra Visa enquadrada para os parâmetros técnicos informados.",
        ctx,
        cascata,
      };
    }

    const ratePct = Number(matched.rate_pct);
    const fixedFee = Number(matched.fixed_fee);
    const capFee = Number(matched.cap_fee);
    let taxa = Number((valor * (ratePct / 100.0)).toFixed(4)) + fixedFee;
    let capAplicado = false;
    if (capFee > 0 && taxa > capFee) {
      taxa = capFee;
      capAplicado = true;
    }

    const aviso = matched.rate_corrupted
      ? `ATENÇÃO: A taxa da regra '${matched.rule_id}' está sinalizada como rate_corrupted=true na planilha original (célula formatada como data em vez de número).`
      : null;

    return {
      sucesso: true,
      bandeira: "visa",
      rule_id: String(matched.rule_id),
      ird: String(matched.rule_id),
      descricao_regra: matched.descriptor || "",
      accounting_sign: matched.accounting_sign || "DR",
      prioridade: matched.priority,
      expression: matched.expression,
      segment: ctx.MCC || "Geral",
      tier: `PID=${ctx.PID} / AFS=${ctx.AFS}`,
      rate_pct: Number(ratePct.toFixed(4)),
      fixed_fee: fixedFee,
      cap_fee: capFee,
      rate_resolution: {
        mode: "VISA_CLEARING_RULE",
        base_ia_pct: Number(ratePct.toFixed(4)),
        fixed_fee: fixedFee,
        cap_fee: capFee,
        rate_corrupted: Boolean(matched.rate_corrupted),
      },
      valor_transacao: valor,
      taxa_intercambio: Number(taxa.toFixed(4)),
      taxa_intercambio_fmt: `R$ ${taxa.toFixed(4)}`,
      cap_aplicado: capAplicado,
      aviso,
      ctx,
      cascata,
    };
  }
}

const PRESETS = [
  {
    id: "mc_cp_supermercado_bin",
    title: "Mastercard CP Supermercado (Lookup BIN Real 222763)",
    badge: "Mastercard → IRD IA",
    params: {
      bandeira: "mastercard",
      valor: 250.0,
      pan: "2227631234567890",
      PRODUCT_TYPE: "CREDIT",
      tier: "Consumer platinum",
      CARD_PRESENT_ID: 1,
      PAYPASS_IND: 0,
      ECSLI: "",
      MCC: 5411,
      INSTALLMENTS: 1,
      DOCUMENT_TYPE: 2,
      ACQR_COUNTRY_CODE: 76,
      ISSR_COUNTRY_CODE: 76,
    },
  },
  {
    id: "mc_cnp_3ds_frictionless",
    title: "Mastercard E-commerce 3DS Frictionless (Ajuste AU sobre IA)",
    badge: "Mastercard → IRD AU",
    params: {
      bandeira: "mastercard",
      valor: 400.0,
      pan: "",
      PRODUCT_TYPE: "CREDIT",
      tier: "Consumer black",
      CARD_PRESENT_ID: 0,
      PAYPASS_IND: 0,
      ECSLI: "FRICTIONLESS",
      MCC: 5812,
      INSTALLMENTS: 1,
      DOCUMENT_TYPE: 2,
      ACQR_COUNTRY_CODE: 76,
      ISSR_COUNTRY_CODE: 76,
    },
  },
  {
    id: "mc_cnp_unauthenticated",
    title: "Mastercard E-commerce Sem 3DS (Ajuste HU sobre IA)",
    badge: "Mastercard → IRD HU",
    params: {
      bandeira: "mastercard",
      valor: 400.0,
      pan: "",
      PRODUCT_TYPE: "CREDIT",
      tier: "Consumer standard",
      CARD_PRESENT_ID: 0,
      PAYPASS_IND: 0,
      ECSLI: "",
      MCC: 5732,
      INSTALLMENTS: 1,
      DOCUMENT_TYPE: 2,
      ACQR_COUNTRY_CODE: 76,
      ISSR_COUNTRY_CODE: 76,
    },
  },
  {
    id: "mc_contactless_parcelado",
    title: "Mastercard Contactless Parcelado 4x (Ajuste JV sobre IA)",
    badge: "Mastercard → IRD JV",
    params: {
      bandeira: "mastercard",
      valor: 600.0,
      pan: "",
      PRODUCT_TYPE: "CREDIT",
      tier: "Consumer gold",
      CARD_PRESENT_ID: 1,
      PAYPASS_IND: 1,
      ECSLI: "",
      MCC: 5621,
      INSTALLMENTS: 4,
      DOCUMENT_TYPE: 2,
      ACQR_COUNTRY_CODE: 76,
      ISSR_COUNTRY_CODE: 76,
    },
  },
  {
    id: "maestro_gov_cap",
    title: "Maestro Débito Serviço Governamental (Teto R$ 0,70 Aplicado)",
    badge: "Maestro → Teto Cap",
    params: {
      bandeira: "maestro",
      valor: 500.0,
      pan: "",
      PRODUCT_TYPE: "DEBIT",
      CARD_PROGRAM_ID: "MSI",
      CARD_PRESENT_ID: 1,
      PAYPASS_IND: 0,
      MCC: 9311,
      INSTALLMENTS: 1,
      DOCUMENT_TYPE: 2,
      ACQR_COUNTRY_CODE: 76,
      ISSR_COUNTRY_CODE: 76,
    },
  },
  {
    id: "visa_infinite_3ds",
    title: "Visa Infinite E-commerce 3DS Autenticado (ECI 05 / PEM 81)",
    badge: "Visa → BR-ECOM-INF-SEC",
    params: {
      bandeira: "visa",
      valor: 800.0,
      SETTL_FLAG: "9",
      PID: "I^",
      AFS: "C",
      ECI: "05",
      MCC: "5812",
      INST: 1,
      POS_ENTRY_MODE: "81",
      MANDATORY_DATA: "PRESENT",
      TIMELINESS: 0,
    },
  },
  {
    id: "visa_non_qual_downgrade",
    title: "Visa Downgrade Non-Qualified (MANDATORY_DATA Ausente)",
    badge: "Visa → BR-NON-QUAL",
    params: {
      bandeira: "visa",
      valor: 800.0,
      SETTL_FLAG: "9",
      PID: "I^",
      AFS: "C",
      ECI: "",
      MCC: "5812",
      INST: 1,
      POS_ENTRY_MODE: "81",
      MANDATORY_DATA: "",
      TIMELINESS: 2,
    },
  },
];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action") || "overview";
    const data = provData as any;

    if (action === "overview") {
      const defaultSim = simulateTransaction(PRESETS[0].params);
      return NextResponse.json({
        stats: data.stats,
        ird_diagnostics: data.ird_diagnostics,
        mc_rules: data.mc_rules,
        maestro_rules: data.maestro_rules,
        visa_rules: data.visa_rules,
        mcc_to_segment: data.mcc_to_segment,
        mappings: data.mappings,
        presets: PRESETS,
        default_simulation: defaultSim,
      });
    }

    if (action === "simulate") {
      const raw = searchParams.get("payload") || "{}";
      return NextResponse.json(simulateTransaction(JSON.parse(raw)));
    }

    return NextResponse.json({ error: `Ação inválida: ${action}` }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Falha ao executar motor de provisionamento", detail: error?.message || String(error) },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    return NextResponse.json(simulateTransaction(body));
  } catch (error: any) {
    return NextResponse.json(
      { error: "Falha ao simular transação no motor", detail: error?.message || String(error) },
      { status: 500 }
    );
  }
}
