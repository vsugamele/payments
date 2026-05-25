"""
Script de ingestão em massa (Bulk Ingest) para carregar os ranges de BINs do Mastercard MPE (tabela IP0040T1)
no banco de dados Supabase de forma ultra-rápida.
"""
import os
import sys
import httpx
import time
from dotenv import load_dotenv

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from engine.parser import MPEParser

load_dotenv()

# Carrega chaves de conexão
SUPABASE_URL = os.getenv("SUPABASE_URL") or "https://tkbivipqiewkfnhktmqq.supabase.co"
if not SUPABASE_URL.startswith("http"):
    SUPABASE_URL = "https://" + SUPABASE_URL
SUPABASE_KEY = os.getenv("SUPABASE_KEY") or "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRrYml2aXBxaWV3a2ZuaGt0bXFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg0NzY4NDgsImV4cCI6MjA1NDA1Mjg0OH0.2TnLj4lriG7eoPQWDo0mV8u8YHor6bd5ItZCHYhkym0"

headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Prefer": "return=minimal"
}

filepath = "PRD_MST_T068_D260417.T040718_A001"

def clear_existing_bins():
    """Limpa os registros anteriores da tabela de BINs (Full File Replacement)"""
    print("Limpando registros antigos da tabela ic_mpe_bins...")
    url = f"{SUPABASE_URL}/rest/v1/ic_mpe_bins?id=not.is.null"
    resp = httpx.delete(url, headers=headers, timeout=60.0)
    if resp.status_code not in (200, 204):
        print(f"Erro ao limpar tabela: {resp.status_code} - {resp.text}")
        sys.exit(1)
    print("Tabela limpa com sucesso.")

def ingest_bins():
    if not os.path.exists(filepath):
        print(f"Erro: Arquivo {filepath} não encontrado no workspace.")
        sys.exit(1)

    parser = MPEParser(filepath)
    parser.parse_table_list()

    # Limpa dados antigos
    clear_existing_bins()

    print("\nIniciando streaming e ingestão em lotes da tabela IP0040T1...")
    
    batch = []
    batch_size = 5000
    total_inserted = 0
    start_time = time.time()

    url = f"{SUPABASE_URL}/rest/v1/ic_mpe_bins"

    for payload in parser.stream_table_records("IP0040T1"):
        record = parser.parse_bin_record(payload)
        if record:
            batch.append({
                "range_start": record["range_start"],
                "range_end": record["range_end"],
                "product_start": record["product_start"],
                "product_end": record["product_end"],
                "card_program_id": record["card_program_id"],
                "issuer_ica": record["issuer_ica"],
                "country_alpha": record["country_alpha"],
                "country_num": record["country_num"],
                "region": record["region"]
            })

            if len(batch) >= batch_size:
                # Envia lote
                resp = httpx.post(url, headers=headers, json=batch, timeout=60.0)
                if resp.status_code not in (200, 201, 204):
                    print(f"\nErro ao inserir lote: {resp.status_code} - {resp.text}")
                    sys.exit(1)
                
                total_inserted += len(batch)
                elapsed = time.time() - start_time
                speed = total_inserted / elapsed if elapsed > 0 else 0
                print(f"  Inseridos {total_inserted} registros... (Velocidade: {speed:.1f} reg/s)", end="\r")
                batch = []

    # Envia lote residual
    if batch:
        resp = httpx.post(url, headers=headers, json=batch, timeout=60.0)
        if resp.status_code not in (200, 201, 204):
            print(f"\nErro ao inserir lote residual: {resp.status_code} - {resp.text}")
            sys.exit(1)
        total_inserted += len(batch)

    total_time = time.time() - start_time
    print(f"\nIngestão concluída! Total inserido: {total_inserted} registros.")
    print(f"Tempo total: {total_time:.1f} segundos. Velocidade média: {total_inserted/total_time:.1f} reg/s.")

if __name__ == "__main__":
    ingest_bins()
