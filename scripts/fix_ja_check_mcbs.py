"""
Corrige o encoding do IRD JA e verifica/valida os dados do MCBS no banco.
"""
import sys
import os
import psycopg2
from dotenv import load_dotenv

sys.stdout.reconfigure(encoding='utf-8')
load_dotenv()

db_url = os.getenv("DATABASE_URL")
conn = psycopg2.connect(db_url)
conn.autocommit = True
cursor = conn.cursor()

print("=" * 70)
print("PARTE 1: Corrigindo encoding do IRD JA")
print("=" * 70)

# Verifica registros problemáticos
cursor.execute("SELECT ird, COUNT(*) FROM ic_adjustments GROUP BY ird ORDER BY ird;")
rows = cursor.fetchall()
print("\nIRDs em ic_adjustments (raw):")
for r in rows:
    print(f"  repr={repr(r[0])}  count={r[1]}")

# Corrige JA com acento para JA limpo
cursor.execute("UPDATE ic_adjustments SET ird = 'JA' WHERE ird = 'J\u00c1';")
print(f"\n  Corrigido: {cursor.rowcount} registro(s) JA com acento -> JA sem acento")

# Verifica mc_rules também
cursor.execute("SELECT COUNT(*) FROM ic_mc_rules WHERE ird LIKE 'J_' AND active=true;")
row = cursor.fetchone()
print(f"  Regras JA/JV/JW no ic_mc_rules: {row[0]}")

print("\n" + "=" * 70)
print("PARTE 2: Verificando MCBS no banco")
print("=" * 70)

# Grupos
cursor.execute("SELECT COUNT(*) FROM ic_mcbs_groups;")
grupos = cursor.fetchone()[0]
print(f"\n  ic_mcbs_groups: {grupos} grupos")

cursor.execute("SELECT id, label FROM ic_mcbs_groups ORDER BY id;")
for r in cursor.fetchall():
    print(f"    [{r[0]}] {r[1]}")

# Eventos
cursor.execute("SELECT COUNT(*) FROM ic_mcbs_events;")
eventos = cursor.fetchone()[0]
print(f"\n  ic_mcbs_events: {eventos} eventos/taxas")

cursor.execute("""
    SELECT g.id, COUNT(e.id) as qtd_eventos
    FROM ic_mcbs_groups g
    LEFT JOIN ic_mcbs_events e ON e.group_id = g.id
    GROUP BY g.id
    ORDER BY g.id;
""")
print("\n  Eventos por Grupo:")
for r in cursor.fetchall():
    status = "[OK]" if r[1] > 0 else "[VAZIO]"
    print(f"    {status} Grupo {r[0]}: {r[1]} evento(s)")

print("\n" + "=" * 70)
print("PARTE 3: Teste do endpoint /mcbs/fees (simulando a API)")
print("=" * 70)

import httpx
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
}

resp = httpx.get(f"{SUPABASE_URL}/rest/v1/ic_mcbs_groups?select=id,label", headers=headers, timeout=10)
print(f"\n  GET /ic_mcbs_groups -> HTTP {resp.status_code}")
if resp.status_code == 200:
    data = resp.json()
    print(f"  Retornou {len(data)} grupos via REST API")
    for g in data[:3]:
        print(f"    - {g['id']}: {g['label'][:50]}")
else:
    print(f"  Erro: {resp.text[:200]}")

print("\n" + "=" * 70)
print("DIAGNOSTICO CONCLUIDO")
print("=" * 70)

cursor.close()
conn.close()
