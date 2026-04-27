import sys
from pathlib import Path
import os
from dotenv import load_dotenv
import httpx

# Adiciona a raiz do projeto ao path para conseguir importar 'engine'
BASE_DIR = Path(__file__).parent.parent
sys.path.append(str(BASE_DIR))

from engine.loader import (
    load_mc_rules, load_maestro_rules, load_visa_rules,
    load_rates, load_mcc_to_segment
)

SUPABASE_URL = "https://tkbivipqiewkfnhktmqq.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRrYml2aXBxaWV3a2ZuaGt0bXFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg0NzY4NDgsImV4cCI6MjA1NDA1Mjg0OH0.2TnLj4lriG7eoPQWDo0mV8u8YHor6bd5ItZCHYhkym0"

headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=minimal"
}

def insert_bulk(table_name: str, data: list):
    url = f"{SUPABASE_URL}/rest/v1/{table_name}"
    chunk_size = 1000
    for i in range(0, len(data), chunk_size):
        chunk = data[i:i+chunk_size]
        response = httpx.post(url, headers=headers, json=chunk, timeout=30.0)
        if response.status_code not in (200, 201, 204):
            print(f"Erro ao inserir na {table_name}:", response.text)
        else:
            print(f"Inseridos {len(chunk)} registros na {table_name}...")

def migrate_mc_rules():
    print("Migrando MC Rules...")
    rules = load_mc_rules()
    data = []
    for r in rules:
        data.append({
            "rule_id": r.rule_id,
            "expression": r.expression,
            "ird": r.ird,
            "priority": r.priority,
            "active": r.active,
            "description": r.description
        })
    if data:
        insert_bulk("ic_mc_rules", data)
    print(f"{len(data)} regras Mastercard migradas.")

def migrate_maestro_rules():
    print("Migrando Maestro Rules...")
    rules = load_maestro_rules()
    data = []
    for r in rules:
        data.append({
            "rule_id": r.rule_id,
            "expression": r.expression,
            "pseudo_ird": r.pseudo_ird,
            "priority": r.priority,
            "rate_pct": float(r.rate_pct),
            "cap_brl": float(r.cap_brl) if r.cap_brl is not None else None,
            "description": r.description
        })
    if data:
        insert_bulk("ic_maestro_rules", data)
    print(f"{len(data)} regras Maestro migradas.")

def migrate_visa_rules():
    print("Migrando Visa Rules...")
    rules = load_visa_rules()
    data = []
    for r in rules:
        data.append({
            "rule_id": str(r.rule_id),
            "priority": r.priority,
            "descriptor": r.descriptor,
            "accounting_sign": r.accounting_sign,
            "rate_pct": float(r.rate_pct),
            "fixed_fee": float(r.fixed_fee),
            "cap_fee": float(r.cap_fee),
            "expression": r.expression,
            "rate_corrupted": r.rate_corrupted
        })
    if data:
        insert_bulk("ic_visa_rules", data)
    print(f"{len(data)} regras Visa migradas.")

def migrate_rates():
    print("Migrando Base Rates e Adjustments...")
    base_rates, adjustments = load_rates()
    
    data_br = []
    for (ird, tier, segment), rate in base_rates.items():
        data_br.append({
            "brand": "mastercard",
            "ird": ird,
            "tier": tier,
            "segment": segment,
            "rate_pct": float(rate)
        })
    if data_br:
        insert_bulk("ic_base_rates", data_br)
    print(f"{len(data_br)} taxas base migradas.")
    
    data_adj = []
    for (ird, segment), adj in adjustments.items():
        data_adj.append({
            "ird": ird,
            "segment": segment,
            "adjustment_pct": float(adj)
        })
    if data_adj:
        insert_bulk("ic_adjustments", data_adj)
    print(f"{len(data_adj)} ajustes migrados.")

def migrate_mcc():
    print("Migrando MCCs...")
    mcc_dict = load_mcc_to_segment()
    data = []
    for mcc, seg in mcc_dict.items():
        data.append({
            "mcc": mcc,
            "segment": seg,
            "description": ""
        })
    if data:
        insert_bulk("ic_mcc_to_segment", data)
    print(f"{len(data)} MCCs migrados.")

if __name__ == "__main__":
    print("=== INICIANDO MIGRAÇÃO DO EXCEL PARA SUPABASE ===")
    
    try:
        httpx.delete(f"{SUPABASE_URL}/rest/v1/ic_mc_rules", headers=headers)
        httpx.delete(f"{SUPABASE_URL}/rest/v1/ic_maestro_rules", headers=headers)
        httpx.delete(f"{SUPABASE_URL}/rest/v1/ic_visa_rules", headers=headers)
        httpx.delete(f"{SUPABASE_URL}/rest/v1/ic_base_rates", headers=headers)
        httpx.delete(f"{SUPABASE_URL}/rest/v1/ic_adjustments", headers=headers)
        httpx.delete(f"{SUPABASE_URL}/rest/v1/ic_mcc_to_segment", headers=headers)
    except Exception as e:
        print("Aviso ao limpar tabelas:", e)

    migrate_mc_rules()
    migrate_maestro_rules()
    migrate_visa_rules()
    migrate_rates()
    migrate_mcc()
    
    print("=== MIGRAÇÃO CONCLUÍDA COM SUCESSO ===")
