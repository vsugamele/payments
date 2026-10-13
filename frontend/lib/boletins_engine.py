import os
import sys
import json
import csv
import re
from pathlib import Path

FRONTEND_DIR = Path(__file__).resolve().parent.parent
REPO_ROOT = FRONTEND_DIR.parent
sys.path.insert(0, str(REPO_ROOT))

from engine.comportamento import ComportamentoEngine

CSV_RELEASES = REPO_ROOT / "scratch_release_mandatorio.csv"
AES_SPEC_MD = REPO_ROOT / "comportamento" / "specs" / "visa_aes_tdes_migration.md"


def clean_date(val):
    if not val:
        return ""
    s = str(val).strip()
    if " " in s:
        s = s.split(" ")[0]
    return s


def load_releases_csv():
    if not CSV_RELEASES.exists():
        return []
    items = []
    with open(CSV_RELEASES, "r", encoding="utf-8", errors="replace") as f:
        reader = csv.DictReader(f)
        for idx, row in enumerate(reader, 1):
            bandeira_raw = (row.get("Bandeira") or "").strip()
            if not bandeira_raw:
                continue
            bandeira = (
                "Visa" if bandeira_raw.upper() == "VISA"
                else "Elo" if bandeira_raw.upper() == "ELO"
                else "Mastercard" if "MASTER" in bandeira_raw.upper()
                else bandeira_raw
            )
            classif = " ".join((row.get("Classificação") or "Mandatório").split())
            # Normalizar terminologia conforme skill bandeiras-intercambio (usar Obrigatório / Mandate / Condicional)
            classif_norm = classif.replace("Mandatório", "Obrigatório (Mandate)").replace("Mandatorio", "Obrigatório (Mandate)")

            area_raw = " ".join((row.get("Área Impactada") or "").split())
            parecer = (row.get("Motivo do Impacto (parecer)") or "").strip()
            resumo = (row.get("Resumo") or "").strip()

            items.append({
                "id": f"REL-{idx:03d}",
                "bandeira": bandeira,
                "identificacao": " ".join((row.get("Identificação") or "").split()),
                "titulo": " ".join((row.get("Título") or "").split()),
                "classificacao": classif_norm,
                "release": " ".join((row.get("Release") or "").split()) or "Contínuo",
                "resumo": resumo,
                "parecer_tecnico": parecer or resumo,
                "data_publicacao": clean_date(row.get("Data Publicação")),
                "vigencia": clean_date(row.get("Vigência")),
                "area_impactada": area_raw or "Geral",
                "regiao": " ".join((row.get("Região") or "Brasil").split()),
                "impacta_brasil": " ".join((row.get("Impacto") or "Sim").split()),
                "testes_certificacao": " ".join((row.get("Testes/Certificação") or "Não").split()),
                "complexidade": " ".join((row.get("Complexidade") or "Médio").split()),
                "continuidade": " ".join((row.get("Continuidade") or "").split()),
                "criticidade": " ".join((row.get("Criticidade") or "Médio").split()),
                "impacto_financeiro": " ".join((row.get("Impacto Financeiro") or "Neutro").split()),
                "regulatorio": " ".join((row.get("Regulatório") or "Não").split()),
                "assunto": " ".join((row.get("Assunto") or "").split()),
                "impacto_ec": " ".join((row.get("Impacto no EC") or "Não").split()),
            })
    return items


def action_overview():
    eng = ComportamentoEngine()
    boletins_list = list(eng.boletins.values())
    campos_list = [c.dados for c in [eng.get_campo(cid) for cid in eng.campos.keys()] if c]
    releases = load_releases_csv()

    aes_markdown = ""
    if AES_SPEC_MD.exists():
        aes_markdown = AES_SPEC_MD.read_text(encoding="utf-8")

    by_brand = {}
    by_crit = {}
    releases_set = set()
    for r in releases:
        b = r["bandeira"]
        by_brand[b] = by_brand.get(b, 0) + 1
        cr = r["criticidade"] or "N/D"
        by_crit[cr] = by_crit.get(cr, 0) + 1
        if r["release"]:
            releases_set.add(r["release"])

    return {
        "connected": True,
        "stats": {
            "totalBoletins3Lentes": len(boletins_list),
            "totalCamposComportamento": len(campos_list),
            "totalReleasesTracker": len(releases),
            "porBandeira": by_brand,
            "porCriticidade": by_crit,
        },
        "boletins": boletins_list,
        "campos": campos_list,
        "glossario": eng.glossario,
        "aesSpecMarkdown": aes_markdown,
        "releaseCycles": sorted(list(releases_set))
    }


def action_projetar(params):
    eng = ComportamentoEngine()
    papeis = params.get("papeis") or ["emissor"]
    if isinstance(papeis, str):
        papeis = [p.strip().lower() for p in papeis.split(",") if p.strip()]
    produtos = params.get("produtos") or []
    if isinstance(produtos, str):
        produtos = [p.strip().lower() for p in produtos.split(",") if p.strip()]
    bandeiras = params.get("bandeiras") or []
    if isinstance(bandeiras, str):
        bandeiras = [b.strip() for b in bandeiras.split(",") if b.strip() and b.strip() != "ALL"]
    regioes = params.get("regioes") or ["Brasil", "LAC", "Global"]
    if isinstance(regioes, str):
        regioes = [r.strip() for r in regioes.split(",") if r.strip()]

    perfil = {
        "papeis": papeis,
        "produtos": produtos,
        "bandeiras": bandeiras,
        "regioes": regioes
    }

    projecoes = []
    for bid, b_data in eng.boletins.items():
        proj = eng.projetar_perfil(b_data, perfil)
        proj["boletim_dados"] = b_data
        projecoes.append(proj)

    return {
        "connected": True,
        "perfil": perfil,
        "projecoes": projecoes
    }


def action_search_releases(params):
    releases = load_releases_csv()
    q = (params.get("q") or "").strip().lower()
    bandeira = (params.get("bandeira") or "ALL").strip()
    release_filter = (params.get("release") or "ALL").strip()
    criticidade = (params.get("criticidade") or "ALL").strip()
    apenas_impacto_br = params.get("apenas_impacto_br") in (True, "true", "1")
    limit = min(int(params.get("limit") or 80), 200)

    matched = []
    for item in releases:
        if bandeira != "ALL" and item["bandeira"].lower() != bandeira.lower():
            continue
        if release_filter != "ALL" and item["release"] != release_filter:
            continue
        if criticidade != "ALL" and criticidade.lower() not in item["criticidade"].lower():
            continue
        if apenas_impacto_br and item["impacta_brasil"].lower() not in ("sim", "condicional"):
            continue
        if q:
            hay = f"{item['identificacao']} {item['titulo']} {item['resumo']} {item['parecer_tecnico']} {item['area_impactada']} {item['assunto']}".lower()
            if q not in hay:
                continue
        matched.append(item)

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
        elif action == "projetar":
            res = action_projetar(payload)
        elif action == "search_releases":
            res = action_search_releases(payload)
        else:
            res = {"connected": False, "error": f"Ação desconhecida: {action}"}
        print(json.dumps(res, ensure_ascii=False))
    except Exception as e:
        print(json.dumps({"connected": False, "error": str(e)}, ensure_ascii=False))


if __name__ == "__main__":
    main()
