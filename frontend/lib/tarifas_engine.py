import os
import sys
import json
import sqlite3
from pathlib import Path

FRONTEND_DIR = Path(__file__).resolve().parent.parent
REPO_ROOT = FRONTEND_DIR.parent
TABELAS_DIR = REPO_ROOT / "Tabelas"
CACHE_JSON = FRONTEND_DIR / "data" / "tabelas-intercambio-fees.json"

BASE_LOCAL = Path(r"C:\Users\vsuga\Documents\Codex\2026-10-02\task\base_bandeiras_local")
TARIFAS_DB = BASE_LOCAL / "indice_tarifas" / "tarifas.sqlite3"
TARIFAS_CURADAS = BASE_LOCAL / "indice_tarifas" / "tarifas_curadas.json"


def build_cache_if_needed(force=False):
    if CACHE_JSON.exists() and not force:
        return json.loads(CACHE_JSON.read_text(encoding="utf-8"))

    import openpyxl
    out = {
        "intercambio": [],
        "scheme_fees_planilhas": [],
        "elo_mcc_reducao": [],
        "visa_pids": []
    }

    # 1. Visa Intercambio
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

        if "Débito" in wb_v.sheetnames:
            for r in list(wb_v["Débito"].iter_rows(values_only=True))[2:]:
                if not r or len(r) < 6 or r[5] is None:
                    continue
                rate = r[5]
                if not isinstance(rate, (int, float)):
                    continue
                pct = round(float(rate) * 100 if float(rate) < 0.1 else float(rate), 4)
                out["intercambio"].append({
                    "bandeira": "Visa",
                    "modalidade": "Débito",
                    "tabela": str(r[1] or "").strip(),
                    "programa": str(r[2] or "").strip(),
                    "parcelas": "À Vista",
                    "captura": str(r[0] or "Geral").strip(),
                    "produto_ird": str(r[4] or "").strip(),
                    "segmento": "Débito",
                    "aliquota_pct": pct,
                    "teto_brl": float(r[6]) if len(r) > 6 and isinstance(r[6], (int, float)) else None,
                    "fonte": "tabela_Intercambio Visa.xlsx (Aba Débito)"
                })

        if "Crédito" in wb_v.sheetnames:
            for r in list(wb_v["Crédito"].iter_rows(values_only=True))[1:]:
                if not r or len(r) < 8 or r[7] is None:
                    continue
                rate = r[7]
                if not isinstance(rate, (int, float)):
                    continue
                pct = round(float(rate) * 100 if float(rate) < 0.1 else float(rate), 4)
                out["intercambio"].append({
                    "bandeira": "Visa",
                    "modalidade": "Crédito",
                    "tabela": str(r[1] or "").strip(),
                    "programa": str(r[2] or "").strip(),
                    "parcelas": str(r[3] or "À Vista").strip(),
                    "captura": str(r[4] or "").strip(),
                    "produto_ird": f"PID {r[5] or ''} · {r[6] or ''}".strip(" ·"),
                    "segmento": str(r[0] or "").strip(),
                    "aliquota_pct": pct,
                    "teto_brl": float(r[8]) if len(r) > 8 and isinstance(r[8], (int, float)) else None,
                    "fonte": "tabela_Intercambio Visa.xlsx (Aba Crédito)"
                })

    # 2. Mastercard Intercambio
    f_mc = TABELAS_DIR / "tabela_Intercambio Master.xlsx"
    if f_mc.exists():
        wb_m = openpyxl.load_workbook(f_mc, read_only=True, data_only=True)
        if "Debito e Credito" in wb_m.sheetnames:
            for r in list(wb_m["Debito e Credito"].iter_rows(values_only=True))[1:]:
                if not r or len(r) < 8 or r[7] is None:
                    continue
                rate = r[7]
                if not isinstance(rate, (int, float)):
                    continue
                pct = round(float(rate) * 100 if float(rate) < 0.1 else float(rate), 4)
                mod = "Débito" if ("debit" in str(r[1] or "").lower() or "maestro" in str(r[1] or "").lower()) else "Crédito"
                out["intercambio"].append({
                    "bandeira": "Mastercard",
                    "modalidade": mod,
                    "tabela": str(r[0] or "").strip(),
                    "programa": f"{r[1] or ''} — {r[2] or ''}".strip(" —"),
                    "parcelas": str(r[3] or "").strip(),
                    "captura": str(r[3] or "").strip(),
                    "produto_ird": f"IRD {r[4] or ''} ({r[5] or ''})".strip(),
                    "segmento": str(r[6] or "").strip(),
                    "aliquota_pct": pct,
                    "teto_brl": float(r[10]) if len(r) > 10 and isinstance(r[10], (int, float)) else None,
                    "fonte": "tabela_Intercambio Master.xlsx (Aba Debito e Credito)"
                })

    # 3. Elo Intercambio
    f_elo = TABELAS_DIR / "tabela_intercambio_ Elo.xlsx"
    if f_elo.exists():
        wb_e = openpyxl.load_workbook(f_elo, read_only=True, data_only=True)
        if "Debito" in wb_e.sheetnames:
            for r in list(wb_e["Debito"].iter_rows(values_only=True))[1:]:
                if not r or len(r) < 6 or not isinstance(r[5], (int, float)):
                    continue
                rate = float(r[5])
                pct = round(rate * 100 if rate < 0.1 else rate, 4)
                out["intercambio"].append({
                    "bandeira": "Elo",
                    "modalidade": "Débito",
                    "tabela": str(r[1] or "Débito").strip(),
                    "programa": f"{r[2] or ''} — {r[3] or ''}".strip(" —"),
                    "parcelas": "À Vista",
                    "captura": "Presencial / Geral",
                    "produto_ird": str(r[2] or "PF/PJ").strip(),
                    "segmento": str(r[3] or "Geral").strip(),
                    "aliquota_pct": pct,
                    "teto_brl": float(r[6]) if len(r) > 6 and isinstance(r[6], (int, float)) else None,
                    "fonte": "tabela_intercambio_ Elo.xlsx (Aba Debito)"
                })

        if "Credito" in wb_e.sheetnames:
            for r in list(wb_e["Credito"].iter_rows(values_only=True))[1:]:
                if not r or len(r) < 8 or not isinstance(r[7], (int, float)):
                    continue
                rate = float(r[7])
                pct = round(rate * 100 if rate < 0.1 else rate, 4)
                out["intercambio"].append({
                    "bandeira": "Elo",
                    "modalidade": "Crédito",
                    "tabela": str(r[2] or "").strip(),
                    "programa": str(r[4] or "").strip(),
                    "parcelas": str(r[6] or "").strip(),
                    "captura": str(r[4] or "").strip(),
                    "produto_ird": f"{r[5] or ''} ({r[1] or ''})".strip(),
                    "segmento": str(r[3] or "").strip(),
                    "aliquota_pct": pct,
                    "teto_brl": float(r[10]) if len(r) > 10 and isinstance(r[10], (int, float)) else None,
                    "fonte": "tabela_intercambio_ Elo.xlsx (Aba Credito)"
                })

    # 4. Elo Redução de Fee por MCC
    f_elo_fee = TABELAS_DIR / "Tabela_fee_elo_v2.xlsx"
    if f_elo_fee.exists():
        wb_ef = openpyxl.load_workbook(f_elo_fee, read_only=True, data_only=True)
        sh_name = "MCCs (Padrão) - redução fee"
        if sh_name in wb_ef.sheetnames:
            rows_ef = list(wb_ef[sh_name].iter_rows(values_only=True))
            for r in rows_ef[2:]:
                if not r or len(r) < 18 or r[1] is None:
                    continue
                out["elo_mcc_reducao"].append({
                    "mcc": str(r[1]).strip(),
                    "fee_debito_71_antigo": r[2],
                    "fee_debito_71_novo": r[15],
                    "fee_cred_vista_70_antigo": r[4],
                    "fee_cred_vista_70_novo": r[16],
                    "fee_parc_2_6_novo": r[17],
                    "fee_parc_7_12_novo": r[18] if len(r) > 18 else None,
                    "fonte": "Tabela_fee_elo_v2.xlsx (MCCs Padrão - Redução Fee)"
                })

    # 5. Tarifas de Bandeira Planilhas (Mastercard v2 & Visa v2)
    for fn, bnd in [("tarifa_bandeira_mastercard_v2.xlsx", "Mastercard"), ("tarifa_bandeira_visa_v2.xlsx", "Visa")]:
        fp = TABELAS_DIR / fn
        if not fp.exists():
            continue
        wb_f = openpyxl.load_workbook(fp, read_only=True, data_only=True)
        for sh in wb_f.sheetnames:
            for r in list(wb_f[sh].iter_rows(values_only=True))[1:]:
                if not r or len(r) < 10 or not r[2]:
                    continue
                val_idx = 10 if bnd == "Mastercard" else 9
                moeda_idx = 13 if bnd == "Mastercard" else 12
                tipo_idx = 12 if bnd == "Mastercard" else 11
                out["scheme_fees_planilhas"].append({
                    "bandeira": bnd,
                    "tarifa": str(r[2] or "").strip(),
                    "regiao": str(r[3] or "Nacional").strip(),
                    "forma": str(r[4] or "").strip(),
                    "plataforma": str(r[5] or "Todas").strip(),
                    "valor": r[val_idx] if len(r) > val_idx else "",
                    "valor_tipo": str(r[tipo_idx] or "") if len(r) > tipo_idx else "",
                    "moeda": str(r[moeda_idx] or "BRL") if len(r) > moeda_idx else "BRL",
                    "fonte": f"{fn} ({sh})"
                })

    CACHE_JSON.parent.mkdir(parents=True, exist_ok=True)
    CACHE_JSON.write_text(json.dumps(out, ensure_ascii=False, indent=2), encoding="utf-8")
    return out


def get_sqlite_tarifas():
    if not TARIFAS_DB.exists():
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
        return []
    return json.loads(TARIFAS_CURADAS.read_text(encoding="utf-8")).get("tarifas", [])


def action_overview():
    cache = build_cache_if_needed()
    sqlite_rows = get_sqlite_tarifas()
    curadas = get_curadas()

    ic = cache.get("intercambio", [])
    by_brand = {}
    for row in ic:
        b = row["bandeira"]
        by_brand[b] = by_brand.get(b, 0) + 1

    return {
        "connected": True,
        "stats": {
            "totalIntercambioRows": len(ic),
            "intercambioPorBandeira": by_brand,
            "totalSchemeFeesPlanilhas": len(cache.get("scheme_fees_planilhas", [])),
            "totalEloMccReducao": len(cache.get("elo_mcc_reducao", [])),
            "totalSqliteArtigosTarifas": len(sqlite_rows),
            "totalCuradasAuditadas": len(curadas)
        },
        "tarifasCuradas": curadas,
        "sqliteTarifas": sqlite_rows,
        "schemeFeesPlanilhas": cache.get("scheme_fees_planilhas", []),
        "eloMccReducao": cache.get("elo_mcc_reducao", [])[:120],
        "visaPids": cache.get("visa_pids", [])
    }


def action_search_intercambio(params):
    cache = build_cache_if_needed()
    ic = cache.get("intercambio", [])
    q = (params.get("q") or "").strip().lower()
    bandeira = (params.get("bandeira") or "ALL").strip()
    modalidade = (params.get("modalidade") or "ALL").strip()
    limit = min(int(params.get("limit") or 100), 250)

    matched = []
    for row in ic:
        if bandeira != "ALL" and row["bandeira"].lower() != bandeira.lower():
            continue
        if modalidade != "ALL" and row["modalidade"].lower() != modalidade.lower():
            continue
        if q:
            hay = f"{row['tabela']} {row['programa']} {row['parcelas']} {row['captura']} {row['produto_ird']} {row['segmento']}".lower()
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
        if action == "overview":
            res = action_overview()
        elif action == "search_intercambio":
            res = action_search_intercambio(payload)
        else:
            res = {"connected": False, "error": f"Ação desconhecida: {action}"}
        print(json.dumps(res, ensure_ascii=False))
    except Exception as e:
        print(json.dumps({"connected": False, "error": str(e)}, ensure_ascii=False))


if __name__ == "__main__":
    main()
