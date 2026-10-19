import os
import sys
import json
import sqlite3
from pathlib import Path

FRONTEND_DIR = Path(__file__).resolve().parent.parent
REPO_ROOT = FRONTEND_DIR.parent
TABELAS_DIR = REPO_ROOT / "Tabelas"
CACHE_JSON = FRONTEND_DIR / "data" / "tabelas-intercambio-fees.json"
BUNDLE_JSON = FRONTEND_DIR / "data" / "tarifas-reais-bundle.json"

BASE_LOCAL = Path(r"C:\Users\vsuga\Documents\Codex\2026-10-02\task\base_bandeiras_local")
TARIFAS_DB = BASE_LOCAL / "indice_tarifas" / "tarifas.sqlite3"
TARIFAS_CURADAS = BASE_LOCAL / "indice_tarifas" / "tarifas_curadas.json"


def _num_or_none(val):
    if isinstance(val, (int, float)):
        return round(float(val), 6)
    return None


def build_cache_if_needed(force=False):
    if CACHE_JSON.exists() and not force:
        return json.loads(CACHE_JSON.read_text(encoding="utf-8"))

    import openpyxl
    out = {
        "intercambio": [],
        "scheme_fees_planilhas": [],
        "elo_mcc_reducao": [],
        "elo_fee_legenda": [],
        "elo_raizes_sample": [],
        "visa_pids": [],
        "visa_mcc_criterios": [],
        "mastercard_mcc_segmentos": [],
        "mastercard_codigos": [],
        "elo_mcc_segmentos": [],
        "elo_anotacao": "",
        "arquivos_catalogo": []
    }

    # =========================================================================
    # 1. Visa Intercâmbio (tabela_Intercambio Visa.xlsx)
    # =========================================================================
    f_visa = TABELAS_DIR / "tabela_Intercambio Visa.xlsx"
    if f_visa.exists():
        wb_v = openpyxl.load_workbook(f_visa, read_only=True, data_only=True)

        if "Classificação Cartão" in wb_v.sheetnames:
            for r in list(wb_v["Classificação Cartão"].iter_rows(values_only=True))[1:]:
                if r and r[0]:
                    out["visa_pids"].append({
                        "pid": str(r[0]).strip(),
                        "produto": str(r[1] or "").strip()
                    })

        if "MCC" in wb_v.sheetnames:
            for r in list(wb_v["MCC"].iter_rows(values_only=True))[1:]:
                if not r or not any(r):
                    continue
                out["visa_mcc_criterios"].append({
                    "criterios": str(r[0] or "").strip(),
                    "tabela": str(r[1] or "").strip(),
                    "categoria": str(r[2] or "").strip(),
                    "mcc_inicio": str(r[3] or "").strip(),
                    "mcc_fim": str(r[4] or "").strip() if len(r) > 4 and r[4] is not None else ""
                })

        if "Débito" in wb_v.sheetnames:
            # Corrigido de [2:] para [1:] para não pular a primeira linha de dados (F^ CLS SPUR1 DB)
            for r in list(wb_v["Débito"].iter_rows(values_only=True))[1:]:
                if not r or len(r) < 6 or r[5] is None:
                    continue
                rate = r[5]
                if not isinstance(rate, (int, float)):
                    continue
                pct = round(float(rate), 4)
                pid_str = str(r[3] or "").strip()
                desc_str = str(r[4] or "").strip()
                prod_ird = f"PID {pid_str} · {desc_str}".strip(" ·") if pid_str else desc_str
                out["intercambio"].append({
                    "bandeira": "Visa",
                    "modalidade": "Débito",
                    "tipo_regra": "Taxa Base",
                    "tabela": str(r[1] or "").strip(),
                    "programa": str(r[2] or "").strip(),
                    "parcelas": "À Vista",
                    "captura": str(r[0] or "Geral").strip(),
                    "produto_ird": prod_ird,
                    "segmento": "Débito",
                    "aliquota_pct": pct,
                    "valor_fixo_brl": None,
                    "teto_brl": round(float(r[6]), 4) if len(r) > 6 and isinstance(r[6], (int, float)) else None,
                    "fonte": "tabela_Intercambio Visa.xlsx (Aba Débito)"
                })

        if "Crédito" in wb_v.sheetnames:
            for r in list(wb_v["Crédito"].iter_rows(values_only=True))[1:]:
                if not r or len(r) < 8 or r[7] is None:
                    continue
                rate = r[7]
                if not isinstance(rate, (int, float)):
                    continue
                pct = round(float(rate), 4)
                out["intercambio"].append({
                    "bandeira": "Visa",
                    "modalidade": "Crédito",
                    "tipo_regra": "Taxa Base",
                    "tabela": str(r[1] or "").strip(),
                    "programa": str(r[2] or "").strip(),
                    "parcelas": str(r[3] or "À Vista").strip(),
                    "captura": str(r[4] or "").strip(),
                    "produto_ird": f"PID {r[5] or ''} · {r[6] or ''}".strip(" ·"),
                    "segmento": str(r[0] or "").strip(),
                    "aliquota_pct": pct,
                    "valor_fixo_brl": None,
                    "teto_brl": round(float(r[8]), 4) if len(r) > 8 and isinstance(r[8], (int, float)) else None,
                    "fonte": "tabela_Intercambio Visa.xlsx (Aba Crédito)"
                })
        wb_v.close()

    # =========================================================================
    # 2. Mastercard Intercâmbio (tabela_Intercambio Master.xlsx)
    # =========================================================================
    f_mc = TABELAS_DIR / "tabela_Intercambio Master.xlsx"
    if f_mc.exists():
        wb_m = openpyxl.load_workbook(f_mc, read_only=True, data_only=True)

        if "MCC" in wb_m.sheetnames:
            for r in list(wb_m["MCC"].iter_rows(values_only=True))[1:]:
                if not r or not any(r):
                    continue
                out["mastercard_mcc_segmentos"].append({
                    "mcc": str(r[0] or "").strip(),
                    "categoria": str(r[1] or "").strip(),
                    "descricao": str(r[2] or "").strip() if len(r) > 2 else ""
                })

        if "Codigos" in wb_m.sheetnames:
            for r in list(wb_m["Codigos"].iter_rows(values_only=True))[1:]:
                if not r or not r[0]:
                    continue
                out["mastercard_codigos"].append({
                    "sigla": str(r[0] or "").strip(),
                    "descricao": str(r[1] or "").strip() if len(r) > 1 else ""
                })

        if "Debito e Credito" in wb_m.sheetnames:
            for r in list(wb_m["Debito e Credito"].iter_rows(values_only=True))[1:]:
                if not r or not any(r) or len(r) < 8:
                    continue
                base_val = r[7] if len(r) > 7 else None
                inc_val = r[8] if len(r) > 8 else None
                dec_val = r[9] if len(r) > 9 else None

                if isinstance(base_val, (int, float)):
                    tipo_regra = "Taxa Base"
                    pct = round(float(base_val), 4)
                elif isinstance(inc_val, (int, float)):
                    tipo_regra = "Acréscimo (+)"
                    pct = round(float(inc_val), 4)
                elif isinstance(dec_val, (int, float)):
                    tipo_regra = "Desconto (-)"
                    pct = round(float(dec_val), 4)
                elif any(str(x).strip().upper() == "N/A" for x in (base_val, inc_val, dec_val) if x is not None):
                    tipo_regra = "N/A (Não Aplicável)"
                    pct = "N/A"
                else:
                    continue

                cobranca = str(r[1] or "").strip()
                mod = "Débito" if ("debit" in cobranca.lower() or "maestro" in cobranca.lower()) else "Crédito"
                teto = round(float(r[10]), 4) if len(r) > 10 and isinstance(r[10], (int, float)) else None

                out["intercambio"].append({
                    "bandeira": "Mastercard",
                    "modalidade": mod,
                    "tipo_regra": tipo_regra,
                    "tabela": str(r[0] or "").strip(),
                    "programa": f"{cobranca} — {r[2] or ''}".strip(" —"),
                    "parcelas": str(r[3] or "").strip(),
                    "captura": str(r[3] or "").strip(),
                    "produto_ird": f"IRD {r[4] or ''} ({r[5] or ''})".strip(),
                    "segmento": str(r[6] or "").strip(),
                    "aliquota_pct": pct,
                    "valor_fixo_brl": None,
                    "teto_brl": teto,
                    "fonte": "tabela_Intercambio Master.xlsx (Aba Debito e Credito)"
                })

        if "Large Ticket" in wb_m.sheetnames:
            for r in list(wb_m["Large Ticket"].iter_rows(values_only=True))[1:]:
                if not r or not any(r) or len(r) < 7:
                    continue
                if not isinstance(r[6], (int, float)) and not isinstance(r[5], (int, float)):
                    continue
                fixo_brl = round(float(r[5]), 4) if isinstance(r[5], (int, float)) else None
                pct = round(float(r[6]), 4) if isinstance(r[6], (int, float)) else 0.0
                out["intercambio"].append({
                    "bandeira": "Mastercard",
                    "modalidade": "Crédito",
                    "tipo_regra": "Large Ticket (Fixo + %)",
                    "tabela": f"Table {r[0]}".strip(),
                    "programa": str(r[1] or "").strip(),
                    "parcelas": str(r[2] or "").strip(),
                    "captura": str(r[2] or "").strip(),
                    "produto_ird": f"IRD {r[3] or ''} ({r[4] or ''})".strip(),
                    "segmento": str(r[4] or "").strip(),
                    "aliquota_pct": pct,
                    "valor_fixo_brl": fixo_brl,
                    "teto_brl": None,
                    "fonte": "tabela_Intercambio Master.xlsx (Aba Large Ticket)"
                })
        wb_m.close()

    # =========================================================================
    # 3. Elo Intercâmbio (tabela_intercambio_ Elo.xlsx)
    # =========================================================================
    f_elo = TABELAS_DIR / "tabela_intercambio_ Elo.xlsx"
    if f_elo.exists():
        wb_e = openpyxl.load_workbook(f_elo, read_only=True, data_only=True)

        if "Anotação" in wb_e.sheetnames:
            notes = []
            for r in wb_e["Anotação"].iter_rows(values_only=True):
                for c in r:
                    if c:
                        notes.append(str(c).strip())
            out["elo_anotacao"] = " ".join(notes)

        if "MCC" in wb_e.sheetnames:
            for r in list(wb_e["MCC"].iter_rows(values_only=True))[1:]:
                if not r or not r[0]:
                    continue
                out["elo_mcc_segmentos"].append({
                    "segmento": " ".join(str(r[0] or "").split()),
                    "mccs": " ".join(str(r[1] or "").split()),
                    "tabelas_pertencentes": " ".join(str(r[2] or "").split()) if len(r) > 2 else ""
                })

        if "Debito" in wb_e.sheetnames:
            for r in list(wb_e["Debito"].iter_rows(values_only=True))[1:]:
                if not r or not any(r) or len(r) < 6:
                    continue
                has_rate = isinstance(r[5], (int, float))
                has_cap = len(r) > 6 and isinstance(r[6], (int, float))
                if not has_rate and not has_cap:
                    continue
                pct = round(float(r[5]), 4) if has_rate else 0.0
                tipo_regra = "Taxa Base" if has_rate else "Teto Fixo (Cap)"
                out["intercambio"].append({
                    "bandeira": "Elo",
                    "modalidade": "Débito",
                    "tipo_regra": tipo_regra,
                    "tabela": str(r[1] or "Débito").strip(),
                    "programa": f"{r[2] or ''} — {r[3] or ''}".strip(" —"),
                    "parcelas": "À Vista",
                    "captura": "Presencial / Geral",
                    "produto_ird": f"Elo Débito {r[2] or 'PF/PJ'}".strip(),
                    "segmento": str(r[3] or "Geral").strip(),
                    "aliquota_pct": pct,
                    "valor_fixo_brl": None,
                    "teto_brl": round(float(r[6]), 4) if has_cap else None,
                    "fonte": "tabela_intercambio_ Elo.xlsx (Aba Debito)"
                })

        if "Credito" in wb_e.sheetnames:
            for r in list(wb_e["Credito"].iter_rows(values_only=True))[1:]:
                if not r or not any(r) or len(r) < 8:
                    continue
                base_val = r[7] if len(r) > 7 else None
                inc_val = r[8] if len(r) > 8 else None
                dec_val = r[9] if len(r) > 9 else None

                if isinstance(base_val, (int, float)):
                    tipo_regra = "Taxa Base"
                    pct = round(float(base_val), 4)
                elif isinstance(inc_val, (int, float)):
                    tipo_regra = "Acréscimo (+)"
                    pct = round(float(inc_val), 4)
                elif isinstance(dec_val, (int, float)):
                    tipo_regra = "Desconto (-)"
                    pct = round(float(dec_val), 4)
                else:
                    tipo_regra = "Informativo"
                    pct = "Consulte Manual"

                teto = round(float(r[10]), 4) if len(r) > 10 and isinstance(r[10], (int, float)) else None
                out["intercambio"].append({
                    "bandeira": "Elo",
                    "modalidade": str(r[0] or "Crédito").strip(),
                    "tipo_regra": tipo_regra,
                    "tabela": str(r[2] or "").strip(),
                    "programa": str(r[4] or r[2] or "").strip(),
                    "parcelas": str(r[6] or "Geral").strip(),
                    "captura": str(r[4] or "Geral").strip(),
                    "produto_ird": f"{r[5] or ''} ({r[1] or ''})".strip(),
                    "segmento": str(r[3] or "Geral").strip(),
                    "aliquota_pct": pct,
                    "valor_fixo_brl": None,
                    "teto_brl": teto,
                    "fonte": "tabela_intercambio_ Elo.xlsx (Aba Credito)"
                })
        wb_e.close()

    # =========================================================================
    # 4. Elo Redução de Fee por MCC, Legenda e Amostra Raízes CNPJ (Tabela_fee_elo_v2.xlsx)
    # =========================================================================
    f_elo_fee = TABELAS_DIR / "Tabela_fee_elo_v2.xlsx"
    if f_elo_fee.exists():
        wb_ef = openpyxl.load_workbook(f_elo_fee, read_only=True, data_only=True)

        if "Legenda" in wb_ef.sheetnames:
            for r in list(wb_ef["Legenda"].iter_rows(values_only=True)):
                vals = [str(c).strip() for c in r if c is not None and str(c).strip()]
                if len(vals) == 2 and vals[0] not in ("Campo", "Abas do arquivo"):
                    out["elo_fee_legenda"].append({
                        "campo": vals[0],
                        "descricao": vals[1]
                    })

        sh_name = "MCCs (Padrão) - redução fee"
        if sh_name in wb_ef.sheetnames:
            rows_ef = list(wb_ef[sh_name].iter_rows(values_only=True))
            for r in rows_ef[2:]:
                if not r or len(r) < 18 or r[1] is None:
                    continue
                bnd_71 = _num_or_none(r[2])
                mkt_71 = _num_or_none(r[3])
                bnd_70 = _num_or_none(r[4])
                mkt_70 = _num_or_none(r[5])
                bnd_72 = _num_or_none(r[6])
                mkt_72_26 = _num_or_none(r[7])
                mkt_72_712 = _num_or_none(r[8])
                bnd_72_1321 = _num_or_none(r[9])
                mkt_72_1321 = _num_or_none(r[10])
                bnd_330 = _num_or_none(r[11]) if len(r) > 11 else None
                mkt_330 = _num_or_none(r[12]) if len(r) > 12 else None
                bnd_377 = _num_or_none(r[13]) if len(r) > 13 else None
                mkt_377 = _num_or_none(r[14]) if len(r) > 14 else None

                out["elo_mcc_reducao"].append({
                    "mcc": str(r[1]).strip(),
                    "fee_bnd_71": bnd_71,
                    "fee_mkt_71": mkt_71,
                    "fee_debito_71_antigo": round((bnd_71 or 0) + (mkt_71 or 0), 4) if (bnd_71 is not None or mkt_71 is not None) else bnd_71,
                    "fee_debito_71_novo": _num_or_none(r[15]),
                    "fee_bnd_70": bnd_70,
                    "fee_mkt_70": mkt_70,
                    "fee_cred_vista_70_antigo": round((bnd_70 or 0) + (mkt_70 or 0), 4) if (bnd_70 is not None or mkt_70 is not None) else bnd_70,
                    "fee_cred_vista_70_novo": _num_or_none(r[16]),
                    "fee_bnd_72": bnd_72,
                    "fee_mkt_72_26": mkt_72_26,
                    "fee_mkt_72_712": mkt_72_712,
                    "fee_bnd_72_1321": bnd_72_1321,
                    "fee_mkt_72_1321": mkt_72_1321,
                    "fee_parc_2_6_antigo": round((bnd_72 or 0) + (mkt_72_26 or 0), 4) if (bnd_72 is not None or mkt_72_26 is not None) else None,
                    "fee_parc_2_6_novo": _num_or_none(r[17]),
                    "fee_parc_7_12_antigo": round((bnd_72 or 0) + (mkt_72_712 or 0), 4) if (bnd_72 is not None or mkt_72_712 is not None) else None,
                    "fee_parc_7_12_novo": _num_or_none(r[18]) if len(r) > 18 else None,
                    "fee_parc_13_21_antigo": round((bnd_72_1321 or 0) + (mkt_72_1321 or 0), 4) if (bnd_72_1321 is not None or mkt_72_1321 is not None) else None,
                    "fee_parc_13_21_novo": _num_or_none(r[19]) if len(r) > 19 else None,
                    "fee_bnd_330": bnd_330,
                    "fee_mkt_330": mkt_330,
                    "fee_crediario_330_novo": _num_or_none(r[20]) if len(r) > 20 else None,
                    "fee_bnd_377": bnd_377,
                    "fee_mkt_377": mkt_377,
                    "fee_carne_377_novo": _num_or_none(r[21]) if len(r) > 21 else None,
                    "fonte": "Tabela_fee_elo_v2.xlsx (MCCs Padrão - Redução Fee)"
                })

        sh_raizes = "Raízes (Especial) - redução fee"
        if sh_raizes in wb_ef.sheetnames:
            for r in wb_ef[sh_raizes].iter_rows(min_row=3, max_row=152, values_only=True):
                if not r or len(r) < 18 or r[1] is None:
                    continue
                bnd_71 = _num_or_none(r[2])
                mkt_71 = _num_or_none(r[3])
                bnd_70 = _num_or_none(r[4])
                mkt_70 = _num_or_none(r[5])
                out["elo_raizes_sample"].append({
                    "raiz_cnpj": str(r[1]).strip(),
                    "fee_bnd_71": bnd_71,
                    "fee_mkt_71": mkt_71,
                    "fee_71_antigo_total": round((bnd_71 or 0) + (mkt_71 or 0), 4),
                    "fee_71_novo": _num_or_none(r[15]),
                    "fee_bnd_70": bnd_70,
                    "fee_mkt_70": mkt_70,
                    "fee_70_antigo_total": round((bnd_70 or 0) + (mkt_70 or 0), 4),
                    "fee_70_novo": _num_or_none(r[16]),
                    "fee_72a_novo": _num_or_none(r[17]),
                    "fee_72b_novo": _num_or_none(r[18]) if len(r) > 18 else None,
                    "fee_72c_novo": _num_or_none(r[19]) if len(r) > 19 else None,
                    "fee_330_novo": _num_or_none(r[20]) if len(r) > 20 else None,
                    "fee_377_novo": _num_or_none(r[21]) if len(r) > 21 else None,
                })
        wb_ef.close()

    # =========================================================================
    # 5. Tarifas de Bandeira Planilhas (Mastercard v2 & Visa v2) — Com Faixas/Tiers
    # =========================================================================
    for fn, bnd in [("tarifa_bandeira_mastercard_v2.xlsx", "Mastercard"), ("tarifa_bandeira_visa_v2.xlsx", "Visa")]:
        fp = TABELAS_DIR / fn
        if not fp.exists():
            continue
        wb_f = openpyxl.load_workbook(fp, read_only=True, data_only=True)
        for sh in wb_f.sheetnames:
            for r in list(wb_f[sh].iter_rows(values_only=True))[1:]:
                if not r or len(r) < 10 or not r[2]:
                    continue
                if bnd == "Mastercard":
                    # [0:id, 1:bandeira, 2:tarifa, 3:regiao, 4:forma, 5:plataforma, 6:criterio, 7:tier_inicio, 8:tier_fim, 9:tier_tipo, 10:valor, 11:valor_adicional, 12:valor_tipo, 13:valor_moeda, 14:produto]
                    criterio_tier = str(r[6] or "").strip()
                    tier_ini = r[7] if len(r) > 7 and r[7] not in (None, "") else None
                    tier_fim = r[8] if len(r) > 8 and r[8] not in (None, "") else None
                    tier_tipo = str(r[9] or "").strip() if len(r) > 9 else ""
                    valor = r[10] if len(r) > 10 else ""
                    valor_adic = r[11] if len(r) > 11 and r[11] not in (None, "") else None
                    valor_tipo = str(r[12] or "").strip() if len(r) > 12 else ""
                    moeda = str(r[13] or "Real").strip() if len(r) > 13 else "Real"
                    produto = str(r[14] or "").strip() if len(r) > 14 else ""
                    check_status = "Ok"
                else:
                    # [0:id, 1:bandeira, 2:tarifa, 3:regiao, 4:forma, 5:plataforma, 6:tier_inicio, 7:tier_fim, 8:tier_tipo, 9:valor, 10:valor_adicional, 11:valor_tipo, 12:valor_moeda, 13:produto, 14:check]
                    criterio_tier = str(r[8] or "").strip() if len(r) > 8 else ""
                    tier_ini = r[6] if len(r) > 6 and r[6] not in (None, "") else None
                    tier_fim = r[7] if len(r) > 7 and r[7] not in (None, "") else None
                    tier_tipo = str(r[8] or "").strip() if len(r) > 8 else ""
                    valor = r[9] if len(r) > 9 else ""
                    valor_adic = r[10] if len(r) > 10 and r[10] not in (None, "") else None
                    valor_tipo = str(r[11] or "").strip() if len(r) > 11 else ""
                    moeda = str(r[12] or "BRL").strip() if len(r) > 12 and r[12] else "BRL"
                    produto = str(r[13] or "").strip() if len(r) > 13 and r[13] else ""
                    check_status = str(r[14] or "").strip() if len(r) > 14 and r[14] else ""

                out["scheme_fees_planilhas"].append({
                    "id_planilha": r[0],
                    "bandeira": bnd,
                    "tarifa": str(r[2] or "").strip(),
                    "regiao": str(r[3] or "Nacional").strip() or "Nacional",
                    "forma": str(r[4] or "").strip(),
                    "plataforma": str(r[5] or "Todas").strip() or "Todas",
                    "criterio_tier": criterio_tier,
                    "tier_inicio": tier_ini,
                    "tier_fim": tier_fim,
                    "tier_tipo": tier_tipo,
                    "valor": valor,
                    "valor_adicional": valor_adic,
                    "valor_tipo": valor_tipo,
                    "moeda": moeda,
                    "produto": produto,
                    "check": check_status,
                    "aba": sh,
                    "fonte": f"{fn} ({sh})"
                })
        wb_f.close()

    # =========================================================================
    # 6. Catálogo de Arquivos Excel para Download Direto na Plataforma
    # =========================================================================
    catalogo_specs = [
        {
            "id": "tabela_intercambio_visa",
            "nome": "tabela_Intercambio Visa.xlsx",
            "rel_path": "Tabelas/tabela_Intercambio Visa.xlsx",
            "categoria": "Intercâmbio",
            "bandeira": "Visa",
            "titulo": "Tabela Oficial de Intercâmbio Visa Brasil",
            "descricao": "Contém 190 alíquotas de Débito, 676 de Crédito, 21 PIDs (Classificação de Cartão) e 326 critérios de edição de MCC (Tabela 5-3 / NNSS).",
            "abas": ["MCC (326)", "Classificação Cartão (21)", "Débito (190)", "Crédito (676)"]
        },
        {
            "id": "tabela_intercambio_master",
            "nome": "tabela_Intercambio Master.xlsx",
            "rel_path": "Tabelas/tabela_Intercambio Master.xlsx",
            "categoria": "Intercâmbio",
            "bandeira": "Mastercard",
            "titulo": "Tabela Oficial de Intercâmbio Mastercard Brasil",
            "descricao": "Contém 704 regras de Débito e Crédito (219 Taxas Base + 425 Acréscimos + 48 Descontos), 116 linhas de Large Ticket (Table 77), 76 MCCs, 7 códigos de segmento e matriz cruzada de 94.977 linhas.",
            "abas": ["Debito e Credito (704)", "Large Ticket (116)", "MCC (76)", "Codigos (7)", "interchange_rate (94.977)"]
        },
        {
            "id": "tabela_intercambio_elo",
            "nome": "tabela_intercambio_ Elo.xlsx",
            "rel_path": "Tabelas/tabela_intercambio_ Elo.xlsx",
            "categoria": "Intercâmbio",
            "bandeira": "Elo",
            "titulo": "Tabela Oficial de Intercâmbio Elo",
            "descricao": "Contém 20 regras de Débito PF/PJ, 397 regras de Crédito (Taxa Base, Acréscimo NFC/Captura e Descontos por parcelamento/segmento), 21 agrupamentos de MCC e notas técnicas.",
            "abas": ["Debito (20)", "Credito (397)", "MCC (21)", "Anotação"]
        },
        {
            "id": "tarifa_bandeira_mastercard_v2",
            "nome": "tarifa_bandeira_mastercard_v2.xlsx",
            "rel_path": "Tabelas/tarifa_bandeira_mastercard_v2.xlsx",
            "categoria": "Fee de Bandeira",
            "bandeira": "Mastercard",
            "titulo": "Tabela de Tarifas de Bandeira (Scheme Fees) Mastercard v2",
            "descricao": "43 faixas (tiers) de faturamento Mastercard por volume/quantidade, região (Nacional/Internacional), etapa (Autorização/Clearing) e moeda.",
            "abas": ["tarifa_bandeira (43)", "evidencia"]
        },
        {
            "id": "tarifa_bandeira_visa_v2",
            "nome": "tarifa_bandeira_visa_v2.xlsx",
            "rel_path": "Tabelas/tarifa_bandeira_visa_v2.xlsx",
            "categoria": "Fee de Bandeira",
            "bandeira": "Visa",
            "titulo": "Tabela de Tarifas de Bandeira (Scheme Fees) Visa v2",
            "descricao": "71 linhas e tiers de Scheme Fees Visa (Acquiring Marketing Fee, POS Original, Pré-Clearing 5F3517100, Cross-Border) em Real e Dólar.",
            "abas": ["tarifa_bandeira (54)", "Planilha1 (17)"]
        },
        {
            "id": "tabela_fee_elo_v2",
            "nome": "Tabela_fee_elo_v2.xlsx",
            "rel_path": "Tabelas/Tabela_fee_elo_v2.xlsx",
            "categoria": "Fee de Bandeira",
            "bandeira": "Elo",
            "titulo": "Tabela Oficial Elo de Redução de Fee por MCC e Raiz de CNPJ (v2)",
            "descricao": "Base completa com 381 MCCs da Tabela Padrão e 311.480 Raízes de CNPJ da Tabela Especial comparando Fee 1 (Marketing) + Fee 2 (Bandeira) antigo vs. Nova Fee Simplificada (70, 71, 72, 330, 377).",
            "abas": ["Legenda (22)", "MCCs Padrão (381)", "Raízes CNPJ Especial (311.480)"]
        },
        {
            "id": "visa_fee_schedule_2026",
            "nome": "ListOfBillingLines_VisaFeeSchedule_BRAZIL_2026May03034026.xlsx",
            "rel_path": "ListOfBillingLines_VisaFeeSchedule_BRAZIL_2026May03034026.xlsx",
            "categoria": "Fee Schedule & Faturas",
            "bandeira": "Visa",
            "titulo": "Visa Fee Schedule Brasil Completo (Maio/2026 — 10.963 Billing Lines)",
            "descricao": "Catálogo integral de Billing Lines do Visa Fee Schedule Brasil com códigos de evento, vigência, tipo de cliente (Acquirer/Issuer) e descrição.",
            "abas": ["List_of_BLs (10.963)"]
        },
        {
            "id": "analise_intercambio_mc",
            "nome": "Analise_Intercambio_Mastercard.xlsx",
            "rel_path": "Analise_Intercambio_Mastercard.xlsx",
            "categoria": "Motor & Auditoria",
            "bandeira": "Mastercard",
            "titulo": "Auditoria Forense de Divergência de Intercâmbio Mastercard (T068 / FCP)",
            "descricao": "Análise individual de 214 transações, resumo por IRD, confirmação de Cap R$ 0,90 via T068 IP0053T1 e detalhamento do IRD JW.",
            "abas": ["Resumo por IRD", "Transações (214)", "FCPs - Cap T068", "JW - Detalhe Transacoes"]
        },
        {
            "id": "novo_intercambio_regras",
            "nome": "Novo_Intercambio.xlsx",
            "rel_path": "Novo_Intercambio.xlsx",
            "categoria": "Motor & Auditoria",
            "bandeira": "Multi-Bandeira",
            "titulo": "Regras Lógicas de Provisionamento de Intercâmbio (MC, Maestro e Visa)",
            "descricao": "Expressões booleanas compiláveis de qualificação de IRD/Descriptor por prioridade para o motor determinístico de provisionamento.",
            "abas": ["Mastercard", "Maestro", "Visa_v3"]
        },
        {
            "id": "mastercard_30_v2",
            "nome": "Mastercard_30_v2.xlsx",
            "rel_path": "Mastercard_30_v2.xlsx",
            "categoria": "Motor & Auditoria",
            "bandeira": "Mastercard",
            "titulo": "Regras & Dicionário de Variáveis GCMS/DMAS Mastercard (v2)",
            "descricao": "Regras de prioridade de IRD Mastercard e Maestro com Fallback IRD, lista de PDS exigidos e dicionário de variáveis GCMS/DMAS.",
            "abas": ["Regras", "Maestro", "Variavel"]
        },
        {
            "id": "visa_30_v1",
            "nome": "Visa_30_v1.xlsx",
            "rel_path": "Visa_30_v1.xlsx",
            "categoria": "Motor & Auditoria",
            "bandeira": "Visa",
            "titulo": "Regras & Dicionário de Variáveis Base II / VIP Visa (v1)",
            "descricao": "Regras lógicas de qualificação de intercâmbio Visa com Rate, Fixed Fee, Cap Fee e dicionário de campos Base II e VIP.",
            "abas": ["Visa", "Variável"]
        },
        {
            "id": "mcc_listing_2025",
            "nome": "MCCListing2025November.xlsx",
            "rel_path": "MCCListing2025November.xlsx",
            "categoria": "Tabelas Auxiliares",
            "bandeira": "Multi-Bandeira",
            "titulo": "Listagem Oficial Internacional de MCCs (Novembro/2025)",
            "descricao": "Referência completa de Merchant Category Codes (MCC) utilizada para enquadramento de segmento tarifário.",
            "abas": ["MCC Listing"]
        },
        {
            "id": "produtos_obrigatorios_2024",
            "nome": "Produtos_Obrigatorios_Bandeiras_2024.xlsx",
            "rel_path": "Produtos_Obrigatorios_Bandeiras_2024.xlsx",
            "categoria": "Tabelas Auxiliares",
            "bandeira": "Multi-Bandeira",
            "titulo": "Matriz de Produtos Obrigatórios das Bandeiras",
            "descricao": "Relação de produtos e habilitações obrigatórias por bandeira.",
            "abas": ["Produtos"]
        },
        {
            "id": "novo_visa_14_v2",
            "nome": "Novo_visa_14_v2.xlsx",
            "rel_path": "Novo_visa_14_v2.xlsx",
            "categoria": "Motor & Auditoria",
            "bandeira": "Visa",
            "titulo": "Regras de Qualificação Visa (Versão 14 v2)",
            "descricao": "Tabela de expressões lógicas e descritores de intercâmbio Visa Brasil.",
            "abas": ["Página1"]
        },
        {
            "id": "analise_intercambio_mc_v1",
            "nome": "Analise_Intercambio_Mastercard_v1.xlsx",
            "rel_path": "Analise_Intercambio_Mastercard_v1.xlsx",
            "categoria": "Motor & Auditoria",
            "bandeira": "Mastercard",
            "titulo": "Auditoria de Divergência de Intercâmbio Mastercard (v1)",
            "descricao": "Primeira versão do estudo forense de transações e limites de Cap T068 Mastercard.",
            "abas": ["Resumo por IRD", "Transações"]
        },
        {
            "id": "tarifa_bandeira_mastercard_v1",
            "nome": "tarifa_bandeira_mastercard.xlsx",
            "rel_path": "Tabelas/tarifa_bandeira_mastercard.xlsx",
            "categoria": "Fee de Bandeira",
            "bandeira": "Mastercard",
            "titulo": "Tabela de Tarifas de Bandeira Mastercard (v1)",
            "descricao": "Versão anterior da planilha estruturada de Scheme Fees Mastercard.",
            "abas": ["tarifa_bandeira", "evidencia"]
        },
        {
            "id": "tarifa_bandeira_visa_v1",
            "nome": "tarifa_bandeira_visa.xlsx",
            "rel_path": "Tabelas/tarifa_bandeira_visa.xlsx",
            "categoria": "Fee de Bandeira",
            "bandeira": "Visa",
            "titulo": "Tabela de Tarifas de Bandeira Visa (v1)",
            "descricao": "Versão anterior da planilha estruturada de Scheme Fees Visa.",
            "abas": ["tarifa_bandeira", "Planilha1"]
        },
        {
            "id": "tabela_fee_elo_v1",
            "nome": "Tabela_fee_elo.xlsx",
            "rel_path": "Tabelas/Tabela_fee_elo.xlsx",
            "categoria": "Fee de Bandeira",
            "bandeira": "Elo",
            "titulo": "Tabela Oficial Elo de Redução de Fee por MCC e Raiz de CNPJ (v1)",
            "descricao": "Primeira versão da base de redução de fee Elo com 381 MCCs e 311.480 Raízes de CNPJ.",
            "abas": ["Legenda", "MCCs Padrão", "Raízes CNPJ Especial"]
        },
        {
            "id": "country_subdivision_codes",
            "nome": "Country_Subdivision_Codes_Final_August2025.xlsx",
            "rel_path": "Country_Subdivision_Codes_Final_August2025.xlsx",
            "categoria": "Tabelas Auxiliares",
            "bandeira": "Multi-Bandeira",
            "titulo": "Códigos de País e Subdivisão (Agosto/2025)",
            "descricao": "Tabela oficial de códigos ISO de país e subdivisão para mensageria e clearing.",
            "abas": ["Subdivision Codes"]
        },
        {
            "id": "consultas_publicas_bacen",
            "nome": "CONSULTAS PÚBLICAS.xlsx",
            "rel_path": "CONSULTAS PÚBLICAS.xlsx",
            "categoria": "Tabelas Auxiliares",
            "bandeira": "Regulatório / Bacen",
            "titulo": "Consolidação de Consultas Públicas Bacen",
            "descricao": "Planilha de acompanhamento normativo das Consultas Públicas do Banco Central.",
            "abas": ["Consultas Públicas"]
        }
    ]

    for item in catalogo_specs:
        full_p = REPO_ROOT / item["rel_path"]
        size_kb = round(full_p.stat().st_size / 1024, 1) if full_p.exists() else 0
        out["arquivos_catalogo"].append({
            **item,
            "exists": full_p.exists(),
            "size_kb": size_kb
        })

    CACHE_JSON.parent.mkdir(parents=True, exist_ok=True)
    CACHE_JSON.write_text(json.dumps(out, ensure_ascii=False, indent=2), encoding="utf-8")
    return out


def get_sqlite_tarifas():
    if not TARIFAS_DB.exists():
        # Fallback para manter as 89 linhas do bundle existente caso o sqlite externo não esteja montado
        if BUNDLE_JSON.exists():
            try:
                old_b = json.loads(BUNDLE_JSON.read_text(encoding="utf-8"))
                if old_b.get("sqliteTarifas"):
                    return old_b["sqliteTarifas"]
            except Exception:
                pass
        return []
    uri = f"file:{str(TARIFAS_DB).replace(os.sep, '/')}?mode=ro&immutable=1"
    conn = sqlite3.connect(uri, uri=True, timeout=5)
    conn.row_factory = sqlite3.Row
    rows = conn.execute("""
        SELECT t.*, d.arquivo, d.titulo_artigo
        FROM tarifas t
        LEFT JOIN documentos d ON d.sha256 = t.sha256
        ORDER BY t.data_publicacao DESC, t.id
    """).fetchall()
    out = []
    for r in rows:
        out.append({
            "id": r["id"],
            "bandeira": r["bandeira"],
            "artigo": r["artigo"],
            "titulo_artigo": r["titulo_artigo"],
            "data_publicacao": r["data_publicacao"],
            "regiao": r["regiao"],
            "pagina_pdf": r["pagina"],
            "tarifa": r["tarifa"],
            "linha_faturamento": r["linha_faturamento"],
            "descricao_linha": r["descricao_linha"],
            "valores": json.loads(r["valores_json"] or "{}"),
            "arquivo": r["arquivo"]
        })
    conn.close()
    return out


def get_curadas():
    if not TARIFAS_CURADAS.exists():
        if BUNDLE_JSON.exists():
            try:
                old_b = json.loads(BUNDLE_JSON.read_text(encoding="utf-8"))
                if old_b.get("tarifasCuradas"):
                    return old_b["tarifasCuradas"]
            except Exception:
                pass
        return []
    return json.loads(TARIFAS_CURADAS.read_text(encoding="utf-8")).get("tarifas", [])


def action_overview(force=False):
    cache = build_cache_if_needed(force=force)
    sqlite_rows = get_sqlite_tarifas()
    curadas = get_curadas()

    ic = cache.get("intercambio", [])
    by_brand = {}
    by_rule_type = {}
    for row in ic:
        b = row["bandeira"]
        rt = row.get("tipo_regra", "Taxa Base")
        by_brand[b] = by_brand.get(b, 0) + 1
        by_rule_type[rt] = by_rule_type.get(rt, 0) + 1

    res = {
        "connected": True,
        "stats": {
            "totalIntercambioRows": len(ic),
            "intercambioPorBandeira": by_brand,
            "intercambioPorTipoRegra": by_rule_type,
            "totalSchemeFeesPlanilhas": len(cache.get("scheme_fees_planilhas", [])),
            "totalEloMccReducao": len(cache.get("elo_mcc_reducao", [])),
            "totalEloRaizesEspecial": 311480,
            "totalSqliteArtigosTarifas": len(sqlite_rows),
            "totalCuradasAuditadas": len(curadas),
            "totalVisaMccCriterios": len(cache.get("visa_mcc_criterios", [])),
            "totalMastercardMccSegmentos": len(cache.get("mastercard_mcc_segmentos", [])),
            "totalEloMccSegmentos": len(cache.get("elo_mcc_segmentos", [])),
            "totalArquivosDownload": len(cache.get("arquivos_catalogo", []))
        },
        "tarifasCuradas": curadas,
        "sqliteTarifas": sqlite_rows,
        "schemeFeesPlanilhas": cache.get("scheme_fees_planilhas", []),
        "eloMccReducao": cache.get("elo_mcc_reducao", []),
        "eloFeeLegenda": cache.get("elo_fee_legenda", []),
        "eloRaizesSample": cache.get("elo_raizes_sample", []),
        "visaPids": cache.get("visa_pids", []),
        "visaMccCriterios": cache.get("visa_mcc_criterios", []),
        "mastercardMccSegmentos": cache.get("mastercard_mcc_segmentos", []),
        "mastercardCodigos": cache.get("mastercard_codigos", []),
        "eloMccSegmentos": cache.get("elo_mcc_segmentos", []),
        "eloAnotacao": cache.get("elo_anotacao", ""),
        "arquivosCatalogo": cache.get("arquivos_catalogo", [])
    }
    if force:
        BUNDLE_JSON.write_text(json.dumps(res, ensure_ascii=False, indent=2), encoding="utf-8")
    return res


def action_search_intercambio(params):
    cache = build_cache_if_needed()
    ic = cache.get("intercambio", [])
    q = (params.get("q") or "").strip().lower()
    bandeira = (params.get("bandeira") or "ALL").strip()
    modalidade = (params.get("modalidade") or "ALL").strip()
    tipo_regra = (params.get("tipo_regra") or "ALL").strip()
    limit = min(int(params.get("limit") or 250), 2500)

    matched = []
    for row in ic:
        if bandeira != "ALL" and row["bandeira"].lower() != bandeira.lower():
            continue
        if modalidade != "ALL" and row["modalidade"].lower() != modalidade.lower():
            continue
        if tipo_regra != "ALL" and (row.get("tipo_regra") or "Taxa Base").lower() != tipo_regra.lower():
            continue
        if q:
            hay = f"{row['tabela']} {row['programa']} {row['parcelas']} {row['captura']} {row['produto_ird']} {row['segmento']} {row.get('tipo_regra', '')}".lower()
            if q not in hay:
                continue
        matched.append(row)

    return {
        "connected": True,
        "totalMatches": len(matched),
        "results": matched[:limit]
    }


def main():
    try:
        payload = {}
        if len(sys.argv) > 1 and sys.argv[1].strip():
            payload = json.loads(sys.argv[1])
        action = payload.get("action", "overview")
        force = bool(payload.get("force", False))
        if action == "overview":
            res = action_overview(force=force)
        elif action == "search_intercambio":
            res = action_search_intercambio(payload)
        else:
            res = {"connected": False, "error": f"Ação desconhecida: {action}"}
        print(json.dumps(res, ensure_ascii=False))
    except Exception as e:
        print(json.dumps({"connected": False, "error": str(e)}, ensure_ascii=False))


if __name__ == "__main__":
    main()
