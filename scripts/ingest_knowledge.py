import os
import sys
import json
import httpx
from pathlib import Path
from openai import OpenAI
from dotenv import load_dotenv

BASE_DIR = Path(__file__).parent.parent
sys.path.append(str(BASE_DIR))
load_dotenv()

# ── Credenciais ────────────────────────────────────────────────────────────────
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
SUPABASE_URL = os.getenv("SUPABASE_URL", "https://tkbivipqiewkfnhktmqq.supabase.co")
if not SUPABASE_URL.startswith("http"):
    SUPABASE_URL = "https://" + SUPABASE_URL
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=minimal"
}

client = OpenAI(api_key=OPENAI_API_KEY)

# ── Arquivos de Conhecimento Estruturado ──────────────────────────────────────
KNOWLEDGE_FILES = [
    {"path": "frontend/data/glossario.json", "type": "glossary", "title": "Glossário Normativo Digital"},
    {"path": "frontend/data/mastercard-tpe.json", "type": "tpe", "title": "Mastercard TPE Program Guide"},
    {"path": "frontend/data/gcms-tables.json", "type": "gcms", "title": "Manual de Tabelas GCMS"},
    {"path": "frontend/data/downgrade-rules.json", "type": "downgrade", "title": "Guia de Otimização de Intercâmbio"},
    {"path": "frontend/data/pci-v4-changes.json", "type": "pci", "title": "PCI DSS v4.0 Migration Guide"}
]

def get_embedding(text: str) -> list:
    response = client.embeddings.create(input=[text], model="text-embedding-3-small")
    return response.data[0].embedding

def register_document(title: str, file_path: str):
    """Registra ou recupera o ID do documento normativo virtual."""
    # Primeiro verifica se existe
    resp = httpx.get(
        f"{SUPABASE_URL}/rest/v1/ic_documents?title=eq.{title}&select=id",
        headers=HEADERS
    )
    if resp.status_code == 200 and resp.json():
        return resp.json()[0]["id"]

    # Se não existe, cria
    resp = httpx.post(
        f"{SUPABASE_URL}/rest/v1/ic_documents",
        headers={**HEADERS, "Prefer": "return=representation"},
        json={"title": title, "file_path": file_path}
    )
    if resp.status_code in (200, 201):
        return resp.json()[0]["id"]
    return None

def process_file(file_info):
    full_path = BASE_DIR / file_info["path"]
    if not full_path.exists():
        print(f"[AVISO] Arquivo não encontrado: {file_info['path']}")
        return

    print(f"\n[START] Processando {file_info['title']}...")
    doc_id = register_document(file_info["title"], file_info["path"])
    
    with open(full_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    chunks = []
    
    for i, item in enumerate(data):
        # Transforma o JSON em um texto legível para o embedding
        content = ""
        if file_info["type"] == "glossary":
            content = f"Termo: {item['termo']} ({item.get('sigla', 'N/A')})\nCategoria: {item['categoria']}\nDefinição: {item['definicao']}\nImpacto: {item.get('impacto', '')}\nReferência: {item.get('referencia', '')}"
        elif file_info["type"] == "tpe":
            content = f"Programa: {item['name']}\nDescrição: {item['description']}\nThreshold: {item['threshold']}\nPenalidade: {item['penalty']}\nDica Técnica: {item['tip']}"
        elif file_info["type"] == "gcms":
            content = f"Tabela: {item['table']} - {item['name']}\nUso: {item['usage']}\nDescrição: {item['description']}\nImpacto Normativo: {item['impact']}\nCampos: {', '.join(item['fields'])}"
        elif file_info["type"] == "downgrade":
            content = f"Motivo de Downgrade: {item['name']}\nDescrição: {item['description']}\nImpacto Financeiro: +{item['impact_pct']}%\nMotivo Normativo: {item['reason']}"
        elif file_info["type"] == "pci":
            content = f"Mudança PCI v4.0: {item['title']}\nRegra v3: {item['v3_rule']}\nNova Regra v4: {item['v4_rule']}\nImpacto: {item['impact']}\nBenefício: {item['benefit']}"

        print(f"  Vetorizando item {i+1}/{len(data)}: {item.get('termo') or item.get('name') or item.get('title') or item.get('table')}", end="\r")
        
        embedding = get_embedding(content)
        chunks.append({
            "document_id": doc_id,
            "page_number": i + 1,
            "content": content,
            "embedding": embedding
        })

        # Batch insert a cada 20
        if len(chunks) >= 20:
            httpx.post(f"{SUPABASE_URL}/rest/v1/ic_document_chunks", headers=HEADERS, json=chunks)
            chunks = []

    if chunks:
        httpx.post(f"{SUPABASE_URL}/rest/v1/ic_document_chunks", headers=HEADERS, json=chunks)
    
    print(f"\n[DONE] {len(data)} itens processados para {file_info['title']}.")

def main():
    if not OPENAI_API_KEY or not SUPABASE_KEY:
        print("[ERRO] Variáveis de ambiente OPENAI_API_KEY ou SUPABASE_KEY não encontradas.")
        return

    for file_info in KNOWLEDGE_FILES:
        process_file(file_info)

    print("\n[FINISH] Todo o conhecimento estruturado foi vetorizado com sucesso!")

if __name__ == "__main__":
    main()
