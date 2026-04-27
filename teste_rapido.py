"""Testes rápidos sem precisar da API rodando."""
import sys
sys.path.insert(0, "C:/Users/vsuga/Desktop/V/Ecommit/Tabelasintercambio")

from engine.calculator import InterchangeCalculator

calc = InterchangeCalculator()

print(f"Regras MC carregadas: {len(calc.mc_rules)}")
print(f"Regras Maestro carregadas: {len(calc.maestro_rules)}")
print(f"Taxas base: {len(calc.base_rates)}")
print(f"Ajustes: {len(calc.adjustments)}")
print(f"MCCs mapeados: {len(calc.mcc_to_segment)}")
print()

cenarios = [
    {
        "nome": "Ecommerce + Platinum + Restaurante (PF)",
        "params": {
            "valor": 150.00,
            "bandeira": "mastercard",
            "tipo_cartao": "platinum",
            "pessoa": "fisica",
            "canal": "ecommerce",
            "categoria": "restaurante",
            "parcelas": 1,
        },
        "simples": True,
    },
    {
        "nome": "Ecommerce 3DS (Frictionless) + Gold + Restaurante",
        "params": {
            "valor": 150.00,
            "bandeira": "mastercard",
            "tipo_cartao": "gold",
            "pessoa": "fisica",
            "canal": "ecommerce_3ds",
            "categoria": "restaurante",
            "parcelas": 1,
        },
        "simples": True,
    },
    {
        "nome": "Físico Contactless + Standard + Supermercado",
        "params": {
            "valor": 80.00,
            "bandeira": "mastercard",
            "tipo_cartao": "standard",
            "pessoa": "fisica",
            "canal": "contactless",
            "categoria": "supermercado",
            "parcelas": 1,
        },
        "simples": True,
    },
    {
        "nome": "Físico Chip + Black + Varejo Base",
        "params": {
            "valor": 500.00,
            "bandeira": "mastercard",
            "tipo_cartao": "black",
            "pessoa": "fisica",
            "canal": "fisico",
            "parcelas": 1,
        },
        "simples": True,
    },
    {
        "nome": "Maestro Ecommerce",
        "params": {
            "valor": 50.00,
            "bandeira": "maestro",
            "canal": "ecommerce",
        },
        "simples": True,
    },
    {
        "nome": "Maestro Físico Supermercado (com teto R$0,30)",
        "params": {
            "valor": 200.00,
            "bandeira": "maestro",
            "canal": "fisico",
            "categoria": "supermercado",
        },
        "simples": True,
    },
    {
        "nome": "Crédito Parcelado 3x + Frictionless + Standard",
        "params": {
            "valor": 300.00,
            "bandeira": "mastercard",
            "tipo_cartao": "standard",
            "pessoa": "fisica",
            "canal": "ecommerce_3ds",
            "parcelas": 3,
        },
        "simples": True,
    },
    {
        "nome": "High Ticket (R$250) Ecommerce + Platinum",
        "params": {
            "valor": 250.00,
            "bandeira": "mastercard",
            "tipo_cartao": "platinum",
            "pessoa": "fisica",
            "canal": "ecommerce",
            "parcelas": 1,
        },
        "simples": True,
    },
]

for c in cenarios:
    print(f"{'='*60}")
    print(f"Cenário: {c['nome']}")
    r = calc.calcular_simples(c["params"])
    d = r.to_dict()
    if d["sucesso"]:
        print(f"  IRD/Pseudo-IRD : {d.get('ird', d.get('pseudo_ird', 'N/A'))}")
        print(f"  Regra          : {d.get('descricao_regra', 'N/A')}")
        print(f"  Segment        : {d.get('segment', 'N/A')}")
        print(f"  Taxa           : {d.get('rate_pct', 'N/A')}%")
        print(f"  Valor          : R$ {d['valor_transacao']:.2f}")
        print(f"  Intercâmbio    : {d['taxa_intercambio_fmt']}")
        if d.get("cap_aplicado"):
            print(f"  *** CAP APLICADO (teto R$0,30) ***")
    else:
        print(f"  ERRO: {d.get('erro')}")
    print()
