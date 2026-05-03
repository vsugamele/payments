import os
import psycopg2
from dotenv import load_dotenv
import subprocess

load_dotenv()

db_url = os.getenv("DATABASE_URL")
if not db_url:
    print("DATABASE_URL não encontrado.")
    exit(1)

sql_file = r"C:\Users\vsuga\.gemini\antigravity\brain\84e086d3-06d8-4630-9628-df4580510a3e\scratch\mcbs_tables.sql"

print(f"Lendo arquivo SQL em: {sql_file}")
with open(sql_file, "r", encoding="utf-8") as f:
    sql_commands = f.read()

print("Conectando ao banco de dados...")
try:
    conn = psycopg2.connect(db_url)
    conn.autocommit = True
    cursor = conn.cursor()
    
    print("Executando scripts de criação de tabela...")
    cursor.execute(sql_commands)
    print("Tabelas criadas com sucesso!")
    
    cursor.close()
    conn.close()
except Exception as e:
    print(f"Erro ao conectar/executar: {e}")
    exit(1)

print("Rodando script de seed...")
subprocess.run(["python", "scripts/seed_mcbs.py"], check=True)
print("Tudo concluído!")
