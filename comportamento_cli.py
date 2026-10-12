"""
CLI do Motor de Comportamento (analise generica, sem cliente nomeado).

Uso:
    python comportamento_cli.py campo "DE 63 SF1"
    python comportamento_cli.py boletim "LAC 13906.1"
    python comportamento_cli.py boletim "LAC 13906.1" --papel emissor --produtos moneysend,transfer
    python comportamento_cli.py glossario 0100
    python comportamento_cli.py glossario          # glossario inteiro
    python comportamento_cli.py --list
"""
import argparse
import json
import sys

from engine.comportamento import ComportamentoEngine

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")


def _lista(v: str | None) -> list[str]:
    return [x.strip() for x in v.split(",")] if v else []


def main() -> int:
    ap = argparse.ArgumentParser(description="Motor de Comportamento de bandeiras (generico)")
    ap.add_argument("--list", action="store_true", help="lista campos e boletins")
    sub = ap.add_subparsers(dest="cmd")

    pc = sub.add_parser("campo", help="explica um campo ISO/IPM")
    pc.add_argument("consulta")
    pc.add_argument("--json", action="store_true")

    pb = sub.add_parser("boletim", help="ficha do boletim; com flags de perfil, projeta")
    pb.add_argument("consulta")
    pb.add_argument("--papel", help="papeis do perfil, separados por virgula")
    pb.add_argument("--produtos", help="produtos do perfil, separados por virgula")
    pb.add_argument("--bandeira", help="bandeiras do perfil, separadas por virgula")
    pb.add_argument("--regiao", help="regioes do perfil, separadas por virgula")
    pb.add_argument("--json", action="store_true")

    pg = sub.add_parser("glossario", help="explica um termo (0100, clearing, condicional...) ou tudo")
    pg.add_argument("termo", nargs="?")

    args = ap.parse_args()
    eng = ComportamentoEngine()

    if args.list:
        print("CAMPOS:")
        for d in eng.campos.values():
            print(f"  {d['id']:16} {d.get('campo','')} {d.get('subcampo','')}")
        print("BOLETINS:")
        for d in eng.boletins.values():
            print(f"  {d['id']:16} {d.get('titulo','')}")
        return 0

    if args.cmd == "campo":
        c = eng.get_campo(args.consulta)
        if not c:
            print(f"Campo nao encontrado: '{args.consulta}'")
            return 2
        print(json.dumps(c.dados, ensure_ascii=False, indent=2) if args.json else eng.render_campo(c))
        return 0

    if args.cmd == "boletim":
        b = eng.get_boletim(args.consulta)
        if not b:
            print(f"Boletim nao encontrado: '{args.consulta}'")
            return 2
        perfil = {"papeis": _lista(args.papel), "produtos": _lista(args.produtos),
                  "bandeiras": _lista(args.bandeira), "regioes": _lista(args.regiao)}
        if any(perfil.values()):
            print(eng.render_projecao(eng.projetar_perfil(b, perfil)))
        elif args.json:
            print(json.dumps(b, ensure_ascii=False, indent=2))
        else:
            print(eng.render_boletim(b))
        return 0

    if args.cmd == "glossario":
        if args.termo:
            txt = eng.explicar_termo(args.termo)
            print(txt or f"Termo nao encontrado: '{args.termo}'")
            return 0 if txt else 2
        print(json.dumps(eng.glossario, ensure_ascii=False, indent=2))
        return 0

    ap.print_help()
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
