"""
Diagnostico de cobertura de IRDs no banco de dados.
Verifica quais IRDs tem regras ativas e taxas mapeadas.
"""
import sys
import os
import psycopg2
from dotenv import load_dotenv

sys.stdout.reconfigure(encoding='utf-8')

load_dotenv()

db_url = os.getenv("DATABASE_URL")
conn = psycopg2.connect(db_url)
cursor = conn.cursor()

print("=" * 70)
print("DIAGNÓSTICO DE COBERTURA DE IRDs — Mastercard")
print("=" * 70)

# 1. IRDs com regras ativas
print("\n[REGRAS] IRDs mapeados em ic_mc_rules (regras ativas):")
cursor.execute("""
    SELECT ird, COUNT(*) as regras, MAX(priority) as max_priority
    FROM ic_mc_rules
    WHERE active = true
    GROUP BY ird
    ORDER BY ird;
""")
rows = cursor.fetchall()
if rows:
    for r in rows:
        print(f"  IRD={r[0]:6s}  regras={r[1]:3d}  prioridade_max={r[2]}")
else:
    print("  ⚠️  Nenhuma regra encontrada!")

# 2. IRDs com taxas base
print("\n[TAXAS] IRDs mapeados em ic_base_rates (taxas x tier x segmento):")
cursor.execute("""
    SELECT ird, tier, COUNT(*) as segmentos, MIN(rate_pct) as min_rate, MAX(rate_pct) as max_rate
    FROM ic_base_rates
    GROUP BY ird, tier
    ORDER BY ird, tier;
""")
rows = cursor.fetchall()
if rows:
    for r in rows:
        print(f"  IRD={r[0]:6s}  tier={r[1]:30s}  segs={r[2]}  rate={r[3]:.4f}%–{r[4]:.4f}%")
else:
    print("  ⚠️  Nenhuma taxa base encontrada!")

# 3. IRDs com ajustes
print("\n[AJUSTES] IRDs mapeados em ic_adjustments (ajustes sobre IA):")
cursor.execute("""
    SELECT ird, COUNT(*) as segmentos, MIN(adjustment_pct) as min_adj, MAX(adjustment_pct) as max_adj
    FROM ic_adjustments
    GROUP BY ird
    ORDER BY ird;
""")
rows = cursor.fetchall()
if rows:
    for r in rows:
        print(f"  IRD={r[0]:6s}  segs={r[1]}  ajuste={r[2]:.4f}%–{r[3]:.4f}%")
else:
    print("  ⚠️  Nenhum ajuste encontrado!")

# 4. Gap Analysis — IRDs esperados vs encontrados
print("\n[GAP ANALYSIS]")
EXPECTED_IRDS = ["IA", "JA", "HU", "HV", "HW", "AU", "AV", "AW", "IV", "IW", "JV", "JW"]

cursor.execute("SELECT DISTINCT ird FROM ic_mc_rules WHERE active = true;")
irds_com_regras = {r[0] for r in cursor.fetchall()}

cursor.execute("SELECT DISTINCT ird FROM ic_base_rates;")
irds_com_taxas = {r[0] for r in cursor.fetchall()}

cursor.execute("SELECT DISTINCT ird FROM ic_adjustments;")
irds_com_ajuste = {r[0] for r in cursor.fetchall()}

for ird in EXPECTED_IRDS:
    regra = "[OK]" if ird in irds_com_regras else "[MISS]"
    taxa  = "[OK]" if ird in irds_com_taxas else ("[ADJ sobre IA]" if ird in irds_com_ajuste else "[MISS]")
    print(f"  {ird:6s}  regra={regra}  taxa={taxa}")

# 5. Teste de cálculo simulado
print("\n[SIMULACAO] Teste de calculo via banco:")
tests = [
    ("IA",  "Consumer standard", "Base",  "Físico à vista"),
    ("HU",  "Consumer standard", "Base",  "E-comm não autenticado"),
    ("AU",  "Consumer standard", "Base",  "E-comm 3DS Frictionless"),
    ("AV",  "Consumer standard", "Base",  "E-comm 3DS Challenge"),
    ("JW",  "Consumer standard", "Base",  "Contactless"),
    ("IV",  "Consumer standard", "Base",  "Físico parcelado"),
    ("JV",  "Consumer standard", "Base",  "Contactless parcelado"),
]
for ird, tier, seg, desc in tests:
    # Tenta taxa direta
    cursor.execute(
        "SELECT rate_pct FROM ic_base_rates WHERE ird=%s AND tier=%s AND segment=%s LIMIT 1;",
        (ird, tier, seg)
    )
    row = cursor.fetchone()
    if row:
        print(f"  {ird:6s} ({desc:30s})  -> {row[0]:.4f}% [OK]")
        continue

    # Tenta via ajuste
    cursor.execute(
        "SELECT ird FROM ic_mc_rules WHERE active=true ORDER BY priority LIMIT 1;"
    )
    cursor.execute(
        "SELECT adjustment_pct FROM ic_adjustments WHERE ird=%s AND segment=%s LIMIT 1;",
        (ird, seg)
    )
    adj = cursor.fetchone()
    cursor.execute(
        "SELECT rate_pct FROM ic_base_rates WHERE ird='IA' AND tier=%s AND segment=%s LIMIT 1;",
        (tier, seg)
    )
    base = cursor.fetchone()
    if adj and base:
        total = base[0] + adj[0]
        print(f"  {ird:6s} ({desc:30s})  -> {total:.4f}% [OK via ADJ] (IA={base[0]:.4f}% + adj={adj[0]:+.4f}%)")
    else:
        print(f"  {ird:6s} ({desc:30s})  -> [MISS] SEM TAXA (base={'OK' if base else 'MISSING'}, adj={'OK' if adj else 'MISSING'})")

print("\n" + "=" * 70)
cursor.close()
conn.close()
