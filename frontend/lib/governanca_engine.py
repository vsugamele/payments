import os
import sys
import json
from pathlib import Path

BASE_LOCAL = Path(r"C:\Users\vsuga\Documents\Codex\2026-10-02\task\base_bandeiras_local")
MAPA_INTL_GRAPH = Path(r"D:\AI\Bandeiras\mapa-liquidacao-internacional\graph.json")
MAPAS_INVENTARIO = Path(r"D:\AI\Bandeiras\mapas\inventario.json")
COVERAGE_JSON = BASE_LOCAL / "coverage.json"
ACTION_NEEDED_JSON = BASE_LOCAL / "action_needed_documents.json"


def load_json_safe(p: Path):
    if not p.exists():
        return {}
    try:
        return json.loads(p.read_text(encoding="utf-8"))
    except Exception:
        return {}


def action_overview():
    graph = load_json_safe(MAPA_INTL_GRAPH)
    coverage = load_json_safe(COVERAGE_JSON)
    action_needed = load_json_safe(ACTION_NEEDED_JSON)
    inventario = load_json_safe(MAPAS_INVENTARIO)

    docs = graph.get("documents", [])
    nodes = graph.get("nodes", [])
    edges = graph.get("edges", [])
    modules = graph.get("modules", [])
    pages = graph.get("pages", [])

    # Map document id to title
    doc_map = {d.get("id"): d for d in docs}

    enriched_edges = []
    for e in edges:
        ev_list = e.get("evidence", [])
        first_ev = ev_list[0] if ev_list else {}
        doc_info = doc_map.get(first_ev.get("document_id"), {})
        enriched_edges.append({
            "id": e.get("id"),
            "from": e.get("from"),
            "to": e.get("to"),
            "label": e.get("label"),
            "brand": e.get("brand"),
            "kind": e.get("kind"),
            "role": e.get("role"),
            "region": e.get("region"),
            "component": e.get("component"),
            "direction": e.get("direction"),
            "applicability": e.get("applicability"),
            "limitations": e.get("limitations"),
            "temporal_status": e.get("temporal_status"),
            "quote": first_ev.get("quote", ""),
            "physical_page": first_ev.get("physical_page"),
            "document_id": first_ev.get("document_id"),
            "document_title": doc_info.get("title", first_ev.get("document_id", "")),
            "document_edition": doc_info.get("edition", "")
        })

    return {
        "connected": True,
        "graphMeta": {
            "referenceDate": graph.get("reference_date", "2026-10-11"),
            "scope": graph.get("scope", ""),
            "coverage": graph.get("coverage", {}),
            "totalDocuments": len(docs),
            "totalNodes": len(nodes),
            "totalEdges": len(edges),
            "totalPages": len(pages)
        },
        "documents": docs,
        "nodes": nodes,
        "edges": enriched_edges,
        "modules": modules,
        "coverage": coverage,
        "actionNeeded": action_needed.get("documents", []),
        "mapasInventario": inventario
    }


def main():
    try:
        res = action_overview()
        print(json.dumps(res, ensure_ascii=False))
    except Exception as e:
        print(json.dumps({"connected": False, "error": str(e)}, ensure_ascii=False))


if __name__ == "__main__":
    main()
