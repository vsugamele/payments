#!/usr/bin/env python3
"""
Motor de Arquitetura de Subcredenciadores (PayFac / Facilitadores), Backlog de Relatórios MCBS e Catálogo Master
Conecta frontend/data/subcredenciadores-catalogo.json ao Cockpit Privado.
"""
import sys
import os
import json
from typing import Dict, Any

sys.stdout.reconfigure(encoding="utf-8")

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
DATA_PATH = os.path.join(BASE_DIR, "frontend", "data", "subcredenciadores-catalogo.json")


def load_data() -> Dict[str, Any]:
    with open(DATA_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def main():
    action = sys.argv[1] if len(sys.argv) > 1 else "overview"
    data = load_data()

    if action == "overview":
        print(json.dumps(data, ensure_ascii=False))
    elif action == "search_catalogo":
        q = (sys.argv[2] if len(sys.argv) > 2 else "").strip().lower()
        cat = data.get("catalogo_master", {})
        all_items = (cat.get("manuals") or []) + (cat.get("bulletins") or [])
        if q:
            all_items = [
                it for it in all_items
                if q in it.get("titulo", "").lower()
                or q in it.get("arquivo", "").lower()
                or q in it.get("bandeira", "").lower()
                or q in it.get("tipo", "").lower()
            ]
        print(json.dumps({"count": len(all_items), "items": all_items[:150]}, ensure_ascii=False))


if __name__ == "__main__":
    main()
