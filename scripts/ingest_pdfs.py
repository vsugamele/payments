"""
Script de Ingestão de Manuais PDF -> Supabase (pgvector)
VERSÃO FULL: Sem limite de páginas para garantir cobertura normativa total.
"""
import os
import sys
import glob
import argparse
import time
from pathlib import Path
from pypdf import PdfReader
from openai import OpenAI
import httpx
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

# ── PDFs Estratégicos (Lista Completa e Priorizada) ─────────────────────────────
TARGET_PDFS = [
    "m_mcrs_en-us-2025-08-19.pdf",             # Mastercard Rules (Principal)
    "m_trans_process_rules_en-us-2025-08-12.pdf", # Transaction Processing
    "m_DMAS_en-us-2025-11-04.pdf",             # Mastercom / Disputas
    "m_DMC_guide_en-us.pdf",                   # Dispute Management
    "brazil-irf-guide (5).pdf",                # Intercâmbio Brasil
    "m_lac_inc_customer_en-us-2025-11-11.pdf", # Incentivos LAC
    "vss-user-guide-volume-1.pdf",             # Visa Settlement Vol 1
    "vss-user-guide-volume-2.pdf",             # Visa Settlement Vol 2
    "visanet-authorization-only-online-messages-technical-specifications (2).pdf", # Visa ISO Specs
    "psr-dispute-rules-18-october-2025 (1).pdf", # Visa Dispute Rules
    "m_matchpro_en-us-2025-10-07.pdf",         # MATCH Program
    "base-ii-clearing-system-overview.pdf",    # Visa Base II Overview
    "base-ii-clearing-data-codes.pdf",         # Visa Clearing Codes
    "vts-technical-specifications-guide-for-acquirers.pdf", # Tokenização Specs
    "digital-authentication-framework-faqs.pdf" # DAF Rules
]

def get_embedding(text: str) -> list:
    """Gera embedding usando o modelo v3 small."""
    try:
        response = client.embeddings.create(input=[text], model="text-embedding-3-small")
        return response.data[0].embedding
    except Exception as e:
        print(f"\n[ERRO API] {str(e)}")
        time.sleep(5) # Espera se der erro de rate limit
        return None

def get_indexed_titles() -> set:
    resp = httpx.get(f"{SUPABASE_URL}/rest/v1/ic_documents?select=title", headers=HEADERS)
    if resp.status_code == 200:
        return {row["title"] for row in resp.json()}
    return set()

def ingest_pdf(pdf_path: str, skip_existing: bool = True, indexed_titles: set = None):
    filename = os.path.basename(pdf_path)
    
    if skip_existing and indexed_titles and filename in indexed_titles:
        print(f"[SKIP] {filename} já indexado.")
        return

    print(f"\n{'='*60}")
    print(f"[FULL INGEST] {filename}")
    print(f"{'='*60}")

    # Registra o documento
    doc_headers = HEADERS.copy()
    doc_headers["Prefer"] = "return=representation"
    resp = httpx.post(
        f"{SUPABASE_URL}/rest/v1/ic_documents",
        headers=doc_headers,
        json={"title": filename, "file_path": filename}
    )
    if resp.status_code not in (200, 201):
        print(f"[ERRO] Falha ao registrar documento: {resp.text}")
        return

    doc_id = resp.json()[0]["id"]
    
    # Processamento de TODAS as páginas
    reader = PdfReader(pdf_path)
    total_pages = len(reader.pages)
    print(f"     Documento possui {total_pages} páginas. Iniciando cobertura total...\n")

    chunks = []
    processed = 0
    start_time = time.time()

    for i in range(total_pages):
        page = reader.pages[i]
        text = page.extract_text()

        if not text or len(text.strip()) < 50:
            continue

        # Limpeza básica e chunking (mantendo contexto por página)
        text_clean = text.strip()[:8000]
        
        embedding = get_embedding(text_clean)
        if not embedding: continue

        chunks.append({
            "document_id": doc_id,
            "page_number": i + 1,
            "content": text_clean,
            "embedding": embedding
        })
        processed += 1

        print(f"  Página {i+1}/{total_pages} vetorizada... {processed} chunks criados", end="\r")

        # Envio em lotes para o Supabase
        if len(chunks) >= 10:
            httpx.post(f"{SUPABASE_URL}/rest/v1/ic_document_chunks", headers=HEADERS, json=chunks, timeout=30.0)
            chunks = []
            time.sleep(0.2) # Pequena pausa para evitar stress no DB e API

    # Flush final
    if chunks:
        httpx.post(f"{SUPABASE_URL}/rest/v1/ic_document_chunks", headers=HEADERS, json=chunks)

    elapsed = time.time() - start_time
    print(f"\n[DONE] {processed} páginas indexadas com sucesso em {elapsed:.1f}s")

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--all", action="store_true")
    parser.add_argument("--no-skip", action="store_true")
    args = parser.parse_args()

    indexed_titles = get_indexed_titles() if not args.no_skip else set()
    
    pdf_files = []
    if args.all:
        pdf_files = sorted(glob.glob(os.path.join(str(BASE_DIR), "*.pdf")))
    else:
        for name in TARGET_PDFS:
            full = os.path.join(str(BASE_DIR), name)
            if os.path.exists(full): pdf_files.append(full)

    if not pdf_files:
        print("[AVISO] Nenhum PDF encontrado para processar.")
        return

    print(f"[START] Iniciando processamento de {len(pdf_files)} manuais...")
    for pdf in pdf_files:
        ingest_pdf(pdf, skip_existing=not args.no_skip, indexed_titles=indexed_titles)

if __name__ == "__main__":
    main()
