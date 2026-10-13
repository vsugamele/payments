#!/usr/bin/env python3
"""
Motor Determinístico de Provisionamento & Auditoria de Cascata (Visa, Mastercard, Maestro)
Integra a lógica de engine/calculator.py, engine/loader.py, scripts/diagnose_irds.py e scripts/analyze_adjustments.py
com snapshot local (frontend/data/provisionamento-rules.json) e trace atômico cláusula-a-cláusula.
"""
import sys
import os
import json
import re
from typing import Dict, Any, List, Optional

sys.stdout.reconfigure(encoding="utf-8")

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
RULES_JSON_PATH = os.path.join(BASE_DIR, "frontend", "data", "provisionamento-rules.json")
MPE_JSON_PATH = os.path.join(BASE_DIR, "frontend", "data", "mpe-t068-forense.json")


def load_prov_data() -> Dict[str, Any]:
    with open(RULES_JSON_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def lookup_bin_offline_or_live(pan: str) -> Optional[Dict[str, Any]]:
    if not pan:
        return None
    pan_clean = re.sub(r"\D", "", str(pan))
    if len(pan_clean) < 6:
        return None
    padded = pan_clean.ljust(19, "0")[:19]

    # 1. Try local MPE T068 JSON snapshot first (<1ms)
    if os.path.exists(MPE_JSON_PATH):
        try:
            with open(MPE_JSON_PATH, "r", encoding="utf-8") as f:
                mpe_data = json.load(f)
            all_bins = mpe_data.get("bin_samples_bra", []) + mpe_data.get("bin_samples_global", [])
            matches = [
                b for b in all_bins
                if b["range_start"] <= padded <= b["range_end"]
            ]
            if matches:
                # Prioritize non-CIR products
                matches.sort(key=lambda x: (0 if x.get("product_start") in ("CIR", "MSI") else 1, x.get("product_start", "")), reverse=True)
                return matches[0]
        except Exception:
            pass

    # 2. Fallback to engine.loader.lookup_mpe_bin if available
    try:
        sys.path.insert(0, BASE_DIR)
        from engine.loader import lookup_mpe_bin
        return lookup_mpe_bin(pan_clean)
    except Exception:
        return None


def _compile_mc_expr(expr: str):
    py = expr.replace("&", " and ").replace("|", " or ")
    py = re.sub(r'\((\w+)="([^"]+)"\)', r"(ctx.get('\1') == '\2')", py)
    py = re.sub(r'\((\w+)>=([\d.]+)\)', r"(ctx.get('\1', 0) >= \2)", py)
    py = re.sub(r'\((\w+)<=([\d.]+)\)', r"(ctx.get('\1', 0) <= \2)", py)
    py = re.sub(r'\((\w+)=(\d+)\)', r"(ctx.get('\1') == \2)", py)
    return compile(py, "<mc_expr>", "eval")


def _compile_visa_expr(expr: str):
    py = expr
    py = re.sub(r'\((\w+) IS NOT NULL\)', r"(ctx.get('\1') not in (None, ''))", py)
    py = re.sub(r'\((\w+) IS EMPTY\)', r"(ctx.get('\1') in (None, ''))", py)

    def _replace_in(m: re.Match) -> str:
        var = m.group(1)
        items = m.group(2)
        return f"(ctx.get('{var}') in ({items}))"

    py = re.sub(r"\((\w+) IN \(([^)]+)\)\)", _replace_in, py)
    py = re.sub(r'\((\w+) >= ([\d.]+)\)', r"(ctx.get('\1', 0) >= \2)", py)
    py = re.sub(r'\((\w+) <= ([\d.]+)\)', r"(ctx.get('\1', 0) <= \2)", py)
    py = re.sub(r'\((\w+) > ([\d.]+)\)', r"(ctx.get('\1', 0) > \2)", py)
    py = re.sub(r'\((\w+) < ([\d.]+)\)', r"(ctx.get('\1', 0) < \2)", py)
    py = re.sub(r"\((\w+)='([^']+)'\)", r"(ctx.get('\1') == '\2')", py)
    py = re.sub(r"\((\w+)!='([^']+)'\)", r"(ctx.get('\1') != '\2')", py)
    py = re.sub(r'\((\w+)=(\d+)\)', r"(ctx.get('\1') == \2)", py)
    py = py.replace("&", " and ").replace("|", " or ")
    return compile(py, "<visa_expr>", "eval")


def evaluate_clauses_trace(expr: str, ctx: Dict[str, Any], is_visa: bool = False) -> List[Dict[str, Any]]:
    """
    Decompõe uma expressão booleana em cláusulas atômicas para exibir na UI
    exatamente quais variáveis passaram (TRUE) ou falharam (FALSE).
    """
    clauses = []
    if not is_visa:
        # Patterns in MC/Maestro: (VAR="VAL"), (VAR>=NUM), (VAR<=NUM), (VAR=NUM)
        for m in re.finditer(r'\((\w+)\s*(=|>=|<=)\s*("[^"]+"|[\d.]+)\)', expr):
            var, op, val_raw = m.group(1), m.group(2), m.group(3)
            actual = ctx.get(var)
            if val_raw.startswith('"') and val_raw.endswith('"'):
                expected = val_raw.strip('"')
                passed = (actual == expected)
            else:
                expected = float(val_raw) if "." in val_raw else int(val_raw)
                act_num = actual if isinstance(actual, (int, float)) else 0
                if op == "=":
                    passed = (actual == expected)
                elif op == ">=":
                    passed = (act_num >= expected)
                elif op == "<=":
                    passed = (act_num <= expected)
                else:
                    passed = False
            clauses.append({
                "raw": m.group(0),
                "var": var,
                "op": op,
                "expected": str(expected),
                "actual": "NULL" if actual is None else str(actual),
                "passed": bool(passed),
            })
    else:
        # Patterns in Visa: (VAR IN (...)), (VAR='VAL'), (VAR!='VAL'), (VAR >= NUM), (VAR IS NOT NULL), (VAR IS EMPTY)
        token_re = re.compile(
            r"\((\w+)\s+(IN\s*\([^)]+\)|IS NOT NULL|IS EMPTY|>=|<=|>|<|=|!=)\s*('[^']*'|[\d.]+)?\)"
        )
        for m in token_re.finditer(expr):
            var = m.group(1)
            op_part = m.group(2).strip()
            val_part = (m.group(3) or "").strip()
            actual = ctx.get(var)
            passed = False
            expected_str = val_part.strip("'")

            try:
                sub_compiled = _compile_visa_expr(m.group(0))
                passed = bool(eval(sub_compiled, {"__builtins__": {}}, {"ctx": ctx}))
            except Exception:
                passed = False

            if op_part.startswith("IN"):
                expected_str = op_part
                op_label = "IN"
            elif op_part in ("IS NOT NULL", "IS EMPTY"):
                expected_str = op_part
                op_label = "STATE"
            else:
                op_label = op_part

            clauses.append({
                "raw": m.group(0),
                "var": var,
                "op": op_label,
                "expected": expected_str,
                "actual": "NULL" if actual is None else str(actual),
                "passed": passed,
            })
    return clauses


def simulate_transaction(payload: Dict[str, Any]) -> Dict[str, Any]:
    data = load_prov_data()
    scheme = str(payload.get("bandeira", "mastercard")).lower()
    valor = float(payload.get("valor", 150.0))
    pan = str(payload.get("pan", "")).strip()

    bin_info = None
    if pan:
        bin_info = lookup_bin_offline_or_live(pan)

    if scheme in ("mastercard", "maestro"):
        # Build MC/Maestro context
        mcc_val = payload.get("MCC")
        mcc_int = int(mcc_val) if mcc_val not in (None, "", 0, "0") else None
        product_type = str(payload.get("PRODUCT_TYPE", "CREDIT")).upper()
        card_program_id = payload.get("CARD_PROGRAM_ID") or ("MSI" if scheme == "maestro" else None)
        tier = str(payload.get("tier", "Consumer standard"))
        issr_country = int(payload.get("ISSR_COUNTRY_CODE", 76))
        acqr_country = int(payload.get("ACQR_COUNTRY_CODE", 76))

        if bin_info:
            prod = str(bin_info.get("product_start", "")).upper()
            if prod in ("CIR", "MSI"):
                scheme = "maestro"
                card_program_id = "MSI"
            else:
                scheme = "mastercard"
            prod_map = {
                "MCS": ("CREDIT", "Consumer standard"),
                "MCG": ("CREDIT", "Consumer gold"),
                "MPL": ("CREDIT", "Consumer platinum"),
                "MWE": ("CREDIT", "Consumer black"),
                "MDB": ("DEBIT", "Consumer standard"),
                "MDP": ("PREPAID", "Consumer standard"),
            }
            if prod in prod_map:
                product_type, tier = prod_map[prod]
            try:
                issr_country = int(bin_info.get("country_num") or 76)
            except Exception:
                issr_country = 76 if bin_info.get("country_alpha") == "BRA" else 840

        # Maestro segment helper
        maestro_seg_map = {
            5411: "SPR_MKT", 5422: "SPR_MKT", 5451: "SPR_MKT", 5462: "SPR_MKT",
            5499: "SPR_MKT", 5300: "WHOLE", 5199: "WHOLE", 5912: "WHOLE",
            9406: "LOT", 9311: "GOV_SVC", 9222: "GOV_SVC", 9399: "GOV_SVC",
            4111: "COMM_T", 4784: "COMM_T", 4121: "COMM_T",
            4813: "GEN_EX", 4814: "GEN_EX", 4900: "GEN_EX",
            742: "MM", 1799: "MM", 5697: "MM", 7230: "MM",
            7538: "MM", 8011: "MM", 8021: "MM", 8099: "MM",
        }
        segment_maestro = payload.get("SEGMENT") or (maestro_seg_map.get(mcc_int) if mcc_int else None)

        ctx = {
            "ACQR_COUNTRY_CODE": acqr_country,
            "ISSR_COUNTRY_CODE": issr_country,
            "PRODUCT_TYPE": product_type,
            "CARD_PROGRAM_ID": card_program_id,
            "CARD_PRESENT_ID": int(payload.get("CARD_PRESENT_ID", 1)),
            "PAYPASS_IND": int(payload.get("PAYPASS_IND", 0)),
            "ECSLI": payload.get("ECSLI") or None,
            "MCC": mcc_int,
            "PROC_CODE": int(payload.get("PROC_CODE", 0)),
            "TXN_AMOUNT": valor,
            "INSTALLMENTS": int(payload.get("INSTALLMENTS", 1)),
            "DOCUMENT_TYPE": int(payload.get("DOCUMENT_TYPE", 2)),
            "ENTRY_MODE": payload.get("ENTRY_MODE") or None,
            "SEGMENT": segment_maestro,
        }

        if scheme == "maestro" or card_program_id == "MSI":
            rules = data["maestro_rules"]
            cascata = []
            matched = None
            for r in rules:
                comp = _compile_mc_expr(r["expression"])
                try:
                    hit = bool(eval(comp, {"__builtins__": {}}, {"ctx": ctx}))
                except Exception:
                    hit = False
                cascata.append({
                    "priority": r["priority"],
                    "rule_id": str(r["rule_id"]),
                    "ird": r["pseudo_ird"],
                    "description": r.get("description", ""),
                    "expression": r["expression"],
                    "result": hit,
                    "clauses": evaluate_clauses_trace(r["expression"], ctx, is_visa=False),
                })
                if hit and matched is None:
                    matched = r
                    break

            if not matched:
                return {
                    "sucesso": False,
                    "bandeira": "maestro",
                    "erro": "Nenhuma regra Maestro enquadrada para o contexto informado.",
                    "ctx": ctx,
                    "bin_info": bin_info,
                    "cascata": cascata,
                }

            rate_pct = float(matched["rate_pct"])
            taxa = round(valor * (rate_pct / 100.0), 4)
            cap_brl = matched.get("cap_brl")
            cap_aplicado = False
            if cap_brl and taxa > float(cap_brl):
                taxa = float(cap_brl)
                cap_aplicado = True

            return {
                "sucesso": True,
                "bandeira": "maestro",
                "rule_id": str(matched["rule_id"]),
                "ird": matched["pseudo_ird"],
                "descricao_regra": matched.get("description", ""),
                "prioridade": matched["priority"],
                "expression": matched["expression"],
                "segment": segment_maestro or "Base",
                "tier": tier,
                "rate_pct": round(rate_pct, 4),
                "rate_resolution": {
                    "mode": "MAESTRO_DIRECT",
                    "base_ia_pct": round(rate_pct, 4),
                    "adjustment_pct": 0.0,
                    "cap_brl": cap_brl,
                },
                "valor_transacao": valor,
                "taxa_intercambio": round(taxa, 4),
                "taxa_intercambio_fmt": f"R$ {taxa:.4f}",
                "cap_aplicado": cap_aplicado,
                "ctx": ctx,
                "bin_info": bin_info,
                "cascata": cascata,
            }

        else:
            # Mastercard
            rules = data["mc_rules"]
            cascata = []
            matched = None
            for r in rules:
                comp = _compile_mc_expr(r["expression"])
                try:
                    hit = bool(eval(comp, {"__builtins__": {}}, {"ctx": ctx}))
                except Exception:
                    hit = False
                cascata.append({
                    "priority": r["priority"],
                    "rule_id": str(r["rule_id"]),
                    "ird": r["ird"],
                    "description": r.get("description", ""),
                    "expression": r["expression"],
                    "result": hit,
                    "clauses": evaluate_clauses_trace(r["expression"], ctx, is_visa=False),
                })
                if hit and matched is None:
                    matched = r
                    break

            if not matched:
                return {
                    "sucesso": False,
                    "bandeira": "mastercard",
                    "erro": "Nenhuma regra Mastercard encontrada na cascata.",
                    "ctx": ctx,
                    "bin_info": bin_info,
                    "cascata": cascata,
                }

            ird = matched["ird"]
            mcc_seg_lookup = {int(row["mcc"]): row["segment"] for row in data["mcc_to_segment"]}
            segment = mcc_seg_lookup.get(mcc_int, "Base") if mcc_int else "Base"

            base_rates = {(row["ird"], row["tier"], row["segment"]): float(row["rate_pct"]) for row in data["base_rates"]}
            adjustments = {(row["ird"], row["segment"]): float(row["adjustment_pct"]) for row in data["adjustments"]}
            adj_ird_base = data["mappings"]["adjustment_ird_base"]

            rate_pct = base_rates.get((ird, tier, segment))
            res_mode = "DIRECT_BASE_RATE"
            base_ia_pct = rate_pct
            adj_pct = 0.0

            if rate_pct is None:
                base_ird = adj_ird_base.get(ird)
                if base_ird:
                    base_ia_pct = base_rates.get((base_ird, tier, segment))
                    if base_ia_pct is None:
                        base_ia_pct = base_rates.get((base_ird, tier, "Base"))
                    if base_ia_pct is not None:
                        adj_pct = adjustments.get((ird, segment), adjustments.get((ird, "Base"), 0.0))
                        rate_pct = base_ia_pct + adj_pct
                        res_mode = f"ADJUSTMENT_OVER_{base_ird}"

            if rate_pct is None:
                for seg_fb in ("Other", "Base"):
                    fb_val = base_rates.get((ird, tier, seg_fb))
                    if fb_val is not None:
                        rate_pct = fb_val
                        base_ia_pct = fb_val
                        res_mode = f"FALLBACK_SEGMENT_{seg_fb.upper()}"
                        break

            if rate_pct is None:
                return {
                    "sucesso": False,
                    "bandeira": "mastercard",
                    "ird": ird,
                    "erro": f"Taxa não localizada para IRD={ird}, Tier={tier}, Segment={segment}",
                    "ctx": ctx,
                    "bin_info": bin_info,
                    "cascata": cascata,
                }

            taxa = round(valor * (rate_pct / 100.0), 4)
            return {
                "sucesso": True,
                "bandeira": "mastercard",
                "rule_id": str(matched["rule_id"]),
                "ird": ird,
                "descricao_regra": matched.get("description", ""),
                "prioridade": matched["priority"],
                "expression": matched["expression"],
                "segment": segment,
                "tier": tier,
                "rate_pct": round(rate_pct, 4),
                "rate_resolution": {
                    "mode": res_mode,
                    "base_ia_pct": round(base_ia_pct, 4) if base_ia_pct is not None else None,
                    "adjustment_pct": round(adj_pct, 4),
                },
                "valor_transacao": valor,
                "taxa_intercambio": taxa,
                "taxa_intercambio_fmt": f"R$ {taxa:.4f}",
                "cap_aplicado": False,
                "ctx": ctx,
                "bin_info": bin_info,
                "cascata": cascata,
            }

    else:
        # Visa calculation
        mandatory_raw = payload.get("MANDATORY_DATA")
        mandatory_data = "PRESENT" if mandatory_raw is None else (str(mandatory_raw).strip() or None)
        ctx = {
            "AMOUNT": valor,
            "SETTL_FLAG": str(payload.get("SETTL_FLAG") or "9").strip(),
            "PID": str(payload.get("PID") or "F^").strip(),
            "AFS": str(payload.get("AFS") or "C").strip(),
            "ECI": str(payload.get("ECI") or "").strip() or None,
            "MCC": str(payload.get("MCC") or "").strip() or None,
            "INST": int(payload.get("INST", 1)),
            "POS_ENTRY_MODE": str(payload.get("POS_ENTRY_MODE") or "05").strip(),
            "SPI": str(payload.get("SPI") or "").strip() or None,
            "BAI": str(payload.get("BAI") or "").strip() or None,
            "SUBTYPE": str(payload.get("SUBTYPE") or "").strip() or None,
            "TRAN_CODE": str(payload.get("TRAN_CODE") or "").strip() or None,
            "TCQ": str(payload.get("TCQ") or "").strip() or None,
            "TAD": str(payload.get("TAD") or "").strip() or None,
            "MVV": str(payload.get("MVV") or "").strip() or None,
            "ISS_REG": str(payload.get("ISS_REG") or "").strip() or None,
            "TIMELINESS": int(payload.get("TIMELINESS", 0)),
            "MANDATORY_DATA": mandatory_data,
            "RESP_CODE": str(payload.get("RESP_CODE") or "").strip() or None,
        }

        rules = data["visa_rules"]
        cascata = []
        matched = None
        for r in rules:
            comp = _compile_visa_expr(r["expression"])
            try:
                hit = bool(eval(comp, {"__builtins__": {}}, {"ctx": ctx}))
            except Exception:
                hit = False
            cascata.append({
                "priority": r["priority"],
                "rule_id": str(r["rule_id"]),
                "ird": str(r["rule_id"]),
                "description": r.get("descriptor", ""),
                "expression": r["expression"],
                "result": hit,
                "rate_corrupted": bool(r.get("rate_corrupted", False)),
                "clauses": evaluate_clauses_trace(r["expression"], ctx, is_visa=True),
            })
            if hit and matched is None:
                matched = r
                break

        if not matched:
            return {
                "sucesso": False,
                "bandeira": "visa",
                "erro": "Nenhuma regra Visa enquadrada para os parâmetros técnicos informados.",
                "ctx": ctx,
                "cascata": cascata,
            }

        rate_pct = float(matched["rate_pct"])
        fixed_fee = float(matched["fixed_fee"])
        cap_fee = float(matched["cap_fee"])
        taxa = round(valor * (rate_pct / 100.0), 4) + fixed_fee
        cap_aplicado = False
        if cap_fee > 0 and taxa > cap_fee:
            taxa = cap_fee
            cap_aplicado = True

        aviso = None
        if matched.get("rate_corrupted"):
            aviso = (
                f"ATENÇÃO: A taxa da regra '{matched['rule_id']}' está sinalizada como rate_corrupted=true "
                "na planilha original (célula formatada como data em vez de número)."
            )

        return {
            "sucesso": True,
            "bandeira": "visa",
            "rule_id": str(matched["rule_id"]),
            "ird": str(matched["rule_id"]),
            "descricao_regra": matched.get("descriptor", ""),
            "accounting_sign": matched.get("accounting_sign", "DR"),
            "prioridade": matched["priority"],
            "expression": matched["expression"],
            "segment": ctx["MCC"] or "Geral",
            "tier": f"PID={ctx['PID']} / AFS={ctx['AFS']}",
            "rate_pct": round(rate_pct, 4),
            "fixed_fee": fixed_fee,
            "cap_fee": cap_fee,
            "rate_resolution": {
                "mode": "VISA_CLEARING_RULE",
                "base_ia_pct": round(rate_pct, 4),
                "fixed_fee": fixed_fee,
                "cap_fee": cap_fee,
                "rate_corrupted": bool(matched.get("rate_corrupted", False)),
            },
            "valor_transacao": valor,
            "taxa_intercambio": round(taxa, 4),
            "taxa_intercambio_fmt": f"R$ {taxa:.4f}",
            "cap_aplicado": cap_aplicado,
            "aviso": aviso,
            "ctx": ctx,
            "cascata": cascata,
        }


PRESETS = [
    {
        "id": "mc_cp_supermercado_bin",
        "title": "Mastercard CP Supermercado (Lookup BIN Real 222763)",
        "badge": "Mastercard → IRD IA",
        "params": {
            "bandeira": "mastercard",
            "valor": 250.0,
            "pan": "2227631234567890",
            "PRODUCT_TYPE": "CREDIT",
            "tier": "Consumer platinum",
            "CARD_PRESENT_ID": 1,
            "PAYPASS_IND": 0,
            "ECSLI": "",
            "MCC": 5411,
            "INSTALLMENTS": 1,
            "DOCUMENT_TYPE": 2,
            "ACQR_COUNTRY_CODE": 76,
            "ISSR_COUNTRY_CODE": 76,
        }
    },
    {
        "id": "mc_cnp_3ds_frictionless",
        "title": "Mastercard E-commerce 3DS Frictionless (Ajuste AU sobre IA)",
        "badge": "Mastercard → IRD AU",
        "params": {
            "bandeira": "mastercard",
            "valor": 400.0,
            "pan": "",
            "PRODUCT_TYPE": "CREDIT",
            "tier": "Consumer black",
            "CARD_PRESENT_ID": 0,
            "PAYPASS_IND": 0,
            "ECSLI": "FRICTIONLESS",
            "MCC": 5812,
            "INSTALLMENTS": 1,
            "DOCUMENT_TYPE": 2,
            "ACQR_COUNTRY_CODE": 76,
            "ISSR_COUNTRY_CODE": 76,
        }
    },
    {
        "id": "mc_cnp_unauthenticated",
        "title": "Mastercard E-commerce Sem 3DS (Ajuste HU sobre IA)",
        "badge": "Mastercard → IRD HU",
        "params": {
            "bandeira": "mastercard",
            "valor": 400.0,
            "pan": "",
            "PRODUCT_TYPE": "CREDIT",
            "tier": "Consumer standard",
            "CARD_PRESENT_ID": 0,
            "PAYPASS_IND": 0,
            "ECSLI": "",
            "MCC": 5732,
            "INSTALLMENTS": 1,
            "DOCUMENT_TYPE": 2,
            "ACQR_COUNTRY_CODE": 76,
            "ISSR_COUNTRY_CODE": 76,
        }
    },
    {
        "id": "mc_contactless_parcelado",
        "title": "Mastercard Contactless Parcelado 4x (Ajuste JV sobre IA)",
        "badge": "Mastercard → IRD JV",
        "params": {
            "bandeira": "mastercard",
            "valor": 600.0,
            "pan": "",
            "PRODUCT_TYPE": "CREDIT",
            "tier": "Consumer gold",
            "CARD_PRESENT_ID": 1,
            "PAYPASS_IND": 1,
            "ECSLI": "",
            "MCC": 5621,
            "INSTALLMENTS": 4,
            "DOCUMENT_TYPE": 2,
            "ACQR_COUNTRY_CODE": 76,
            "ISSR_COUNTRY_CODE": 76,
        }
    },
    {
        "id": "maestro_gov_cap",
        "title": "Maestro Débito Serviço Governamental (Teto R$ 0,70 Aplicado)",
        "badge": "Maestro → Teto Cap",
        "params": {
            "bandeira": "maestro",
            "valor": 500.0,
            "pan": "",
            "PRODUCT_TYPE": "DEBIT",
            "CARD_PROGRAM_ID": "MSI",
            "CARD_PRESENT_ID": 1,
            "PAYPASS_IND": 0,
            "MCC": 9311,
            "INSTALLMENTS": 1,
            "DOCUMENT_TYPE": 2,
            "ACQR_COUNTRY_CODE": 76,
            "ISSR_COUNTRY_CODE": 76,
        }
    },
    {
        "id": "visa_infinite_3ds",
        "title": "Visa Infinite E-commerce 3DS Autenticado (ECI 05 / PEM 81)",
        "badge": "Visa → BR-ECOM-INF-SEC",
        "params": {
            "bandeira": "visa",
            "valor": 800.0,
            "SETTL_FLAG": "9",
            "PID": "I^",
            "AFS": "C",
            "ECI": "05",
            "MCC": "5812",
            "INST": 1,
            "POS_ENTRY_MODE": "81",
            "MANDATORY_DATA": "PRESENT",
            "TIMELINESS": 0,
        }
    },
    {
        "id": "visa_non_qual_downgrade",
        "title": "Visa Downgrade Non-Qualified (MANDATORY_DATA Ausente)",
        "badge": "Visa → BR-NON-QUAL",
        "params": {
            "bandeira": "visa",
            "valor": 800.0,
            "SETTL_FLAG": "9",
            "PID": "I^",
            "AFS": "C",
            "ECI": "",
            "MCC": "5812",
            "INST": 1,
            "POS_ENTRY_MODE": "81",
            "MANDATORY_DATA": "",
            "TIMELINESS": 2,
        }
    },
]


def main():
    action = sys.argv[1] if len(sys.argv) > 1 else "overview"
    data = load_prov_data()

    if action == "overview":
        default_sim = simulate_transaction(PRESETS[0]["params"])
        print(json.dumps({
            "stats": data["stats"],
            "ird_diagnostics": data["ird_diagnostics"],
            "mc_rules": data["mc_rules"],
            "maestro_rules": data["maestro_rules"],
            "visa_rules": data["visa_rules"],
            "mcc_to_segment": data["mcc_to_segment"],
            "mappings": data["mappings"],
            "presets": PRESETS,
            "default_simulation": default_sim,
        }, ensure_ascii=False))
    elif action == "simulate":
        raw_json = sys.argv[2] if len(sys.argv) > 2 else "{}"
        payload = json.loads(raw_json)
        res = simulate_transaction(payload)
        print(json.dumps(res, ensure_ascii=False))


if __name__ == "__main__":
    main()
