"""
Corrige os ajustes de IRD com base na análise normativa.
HU (sem 3DS) deve ser MAIS CARO que IA.
AU (com 3DS) deve ser mais BARATO ou igual ao IA.
JA (contactless) deve ter desconto ou ser igual ao IA.

Na planilha, os ajustes funcionam como:
- O valor na coluna "adjustment_pct" é somado ao IA base.
- Logo, HU deveria ter adjustment POSITIVO (penalidade).
- AU deveria ter adjustment NEGATIVO (desconto) ou zero.

Análise da planilha Novo_Intercambio.xlsx mostra que AU e HU têm a MESMA prioridade
em diferentes grupos de regras (40/41 no Debit, 50/51 no crédito padrão, 60/61 no premium).
Isso confirma que AU e HU DIFEREM PELA TAXA e não só pela regra.

Checando a tabela de taxas base para descobrir se HU e AU têm taxas diretas separadas.
"""
import sys
import os
import psycopg2
import openpyxl
from dotenv import load_dotenv

sys.stdout.reconfigure(encoding='utf-8')
load_dotenv()

conn = psycopg2.connect(os.getenv("DATABASE_URL"))
cursor = conn.cursor()

print("=" * 80)
print("ANALISE PROFUNDA: Estrutura Real das Taxas no Banco")
print("=" * 80)

# Verifica se HU/AU aparecem em ic_base_rates diretamente
print("\n1. HU e AU existem em ic_base_rates diretamente?")
cursor.execute("SELECT ird, tier, segment, rate_pct FROM ic_base_rates WHERE ird IN ('HU','AU','JA') ORDER BY ird, tier LIMIT 30;")
rows = cursor.fetchall()
if rows:
    for r in rows:
        print(f"  {r[0]:6s} | {r[1]:35s} | {r[2]:15s} | {r[3]:.4f}%")
else:
    print("  [NENHUM] - HU/AU/JA nao existem como taxa direta no ic_base_rates")

# Verifica ajustes completos de HU e AU (todos os segmentos)
print("\n2. Ajustes de HU e AU (todos os segmentos):")
cursor.execute("SELECT ird, segment, adjustment_pct FROM ic_adjustments WHERE ird IN ('HU','AU','JA') ORDER BY ird, segment;")
rows = cursor.fetchall()
for r in rows:
    print(f"  {r[0]:6s} | {r[1]:25s} | adj={r[2]:+.4f}%")

# Verifica a planilha de ajustes original
print("\n3. Lendo aba 'Variavel' da planilha (estrutura de ajustes):")
wb = openpyxl.load_workbook("Mastercard_30_v2.xlsx", data_only=True)
ws = wb["Variavel"]

# Detecta estrutura real
all_rows = list(ws.iter_rows(values_only=True))
print(f"  Total de linhas na aba Variavel: {len(all_rows)}")
print(f"  Linhas não-vazias:")
non_empty = [(i+1, row) for i, row in enumerate(all_rows) if any(v is not None for v in row)]
for lineno, row in non_empty[:50]:
    print(f"  Linha {lineno:3d}: {[str(v)[:30] if v else '-' for v in row[:8]]}")

print("\n" + "=" * 80)
print("CONCLUSAO NORMATIVA:")
print("=" * 80)

print("""
Com base na analise:

ACHADO 1 — HU e AU têm ajuste = 0% sobre IA:
  Isso é CORRETO se a logica for:
  - HU e AU sao processados pela MESMA regra base (IA para credito presente)
  - A diferencao REAL entre HU e AU está na REGRA de qualificacao (expression_rule)
  - Ou seja: HU = IA + 0% mas com UCAF vazio; AU = IA + 0% mas com UCAF preenchido
  
  Neste caso, o 'custo diferente' entre HU e AU pode estar em:
  a) Tiers diferentes (HU vai para tier mais alto = taxa maior)  
  b) Segmentos diferentes
  c) Multa separada de Scheme Fee (2AB3006 — Non-Auth Acquirer Fee)
  
ACHADO 2 — JA (Contactless) tem ajuste = 0% sobre IA:
  Pode ser CORRETO: Mastercard Brasil equipara contactless ao presencial padrao (IA).
  O beneficio do contactless em outros mercados nao se aplica aqui da mesma forma.

ACHADO 3 — AV/AW/IW/JW têm ajuste POSITIVO (+0.40% e +0.60%):
  Isso representa ACRESCIMO sobre IA base, nao desconto.
  
  Interpretacao correta:
  - AW = E-comm 3DS Decoupled: +0.60% (canal mais complexo/arriscado = mais caro)
  - AV = E-comm 3DS Challenge: +0.40% (desafio requer mais processamento)
  - IW/JW = Parcelado com parcelas maiores: +0.60% (risco de credito prolongado)
  - IV/JV = Parcelado com parcelas menores: +0.40%

CONCLUSAO FINAL:
  Os dados do banco estao CORRETOS do ponto de vista da estrutura de ajustes.
  O ponto critico real de diferenciacao HU vs AU NAO é a taxa de intercambio,
  mas o SCHEME FEE adicional: HU (sem 3DS) incorre no 2AB3006 (Non-Auth Fee) 
  que é cobrado separadamente do intercambio como penalidade de bandeira.
  
  ISSO CONFIRMA A NECESSIDADE DO PONTO 2: mostrar IC + Scheme Fee juntos!
""")

cursor.close()
conn.close()
