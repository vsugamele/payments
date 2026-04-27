"""
Script de Ingestao de Manuais PDF -> Supabase (pgvector)

Uso:
  python scripts/ingest_pdfs.py                          # ingere PDFs da lista TARGET_PDFS
  python scripts/ingest_pdfs.py --all                    # ingere todos os PDFs da raiz
  python scripts/ingest_pdfs.py arquivo.pdf outro.pdf    # ingere arquivos especificos
  python scripts/ingest_pdfs.py --max-pages 100          # limita paginas por documento
  python scripts/ingest_pdfs.py --no-skip                # reindexar mesmo que ja exista
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

# ── PDFs estrategicos para indexacao prioritaria ───────────────────────────────
TARGET_PDFS = [
    "lac-intraregional-irf-guide.pdf",
    "base-ii-clearing-system-overview.pdf",
    "base-ii-clearing-data-codes.pdf",
    "base-ii-clearing-services.pdf",
    "m_lac_inc_customer_en-us-2025-11-11.pdf",
    "m_DMAS_en-us-2025-11-04.pdf",
]

LARGE_PDF_PAGE_LIMIT = 150
LARGE_PDF_THRESHOLD_MB = 4


def get_embedding(text: str) -> list:
    response = client.embeddings.create(input=[text], model="text-embedding-3-small")
    return response.data[0].embedding


def get_indexed_titles() -> set:
    """Retorna os titulos de documentos ja indexados no Supabase."""
    resp = httpx.get(
        f"{SUPABASE_URL}/rest/v1/ic_documents?select=title",
        headers=HEADERS,
        timeout=15.0
    )
    if resp.status_code == 200:
        return {row["title"] for row in resp.json()}
    return set()


def ingest_pdf(pdf_path: str, max_pages: int = 999, skip_existing: bool = True, indexed_titles: set = None):
    filename = os.path.basename(pdf_path)
    file_size_mb = os.path.getsize(pdf_path) / (1024 * 1024)

    # Auto-limitar PDFs grandes
    if file_size_mb > LARGE_PDF_THRESHOLD_MB and max_pages == 999:
        max_pages = LARGE_PDF_PAGE_LIMIT

    if indexed_titles and filename in indexed_titles:
        print(f"[SKIP] {filename} ja indexado.")
        return

    print(f"\n{'='*60}")
    print(f"[PDF] {filename}")
    print(f"      Tamanho: {file_size_mb:.1f} MB | Limite: {max_pages} paginas")
    print(f"{'='*60}")

    # Registra o documento
    doc_headers = HEADERS.copy()
    doc_headers["Prefer"] = "return=representation"

    resp = httpx.post(
        f"{SUPABASE_URL}/rest/v1/ic_documents",
        headers=doc_headers,
        json={"title": filename, "file_path": filename},
        timeout=15.0
    )
    if resp.status_code not in (200, 201):
        print(f"[ERRO] Falha ao registrar documento: {resp.text}")
        return

    doc_id = resp.json()[0]["id"]
    print(f"[OK] Registrado com ID: {doc_id}")

    # Le e processa paginas
    reader = PdfReader(pdf_path)
    total_pages = min(len(reader.pages), max_pages)
    print(f"     Processando {total_pages} de {len(reader.pages)} paginas...\n")

    chunks = []
    processed = 0
    skipped = 0
    start_time = time.time()

    for i in range(total_pages):
        page = reader.pages[i]
        text = page.extract_text()

        if not text or len(text.strip()) < 80:
            skipped += 1
            continue

        text_clean = text.strip()[:8000]

        elapsed = time.time() - start_time
        rate = processed / elapsed if elapsed > 0 and processed > 0 else 0.5
        eta = (total_pages - i - 1) / rate if rate > 0 else 0
        print(
            f"  [{i+1:>3}/{total_pages}] embedding... ok:{processed} skip:{skipped} ETA:{eta:.0f}s   ",
            end="\r"
        )

        embedding = get_embedding(text_clean)
        chunks.append({
            "document_id": doc_id,
            "page_number": i + 1,
            "content": text_clean,
            "embedding": embedding
        })
        processed += 1

        # Flush em lotes de 10
        if len(chunks) >= 10:
            resp_chunk = httpx.post(
                f"{SUPABASE_URL}/rest/v1/ic_document_chunks",
                headers=HEADERS,
                json=chunks,
                timeout=30.0
            )
            if resp_chunk.status_code not in (200, 201, 204):
                print(f"\n[AVISO] Erro ao inserir batch: {resp_chunk.text[:200]}")
            chunks = []

    # Flush final
    if chunks:
        resp_chunk = httpx.post(
            f"{SUPABASE_URL}/rest/v1/ic_document_chunks",
            headers=HEADERS,
            json=chunks,
            timeout=30.0
        )
        if resp_chunk.status_code not in (200, 201, 204):
            print(f"\n[AVISO] Erro ao inserir batch final: {resp_chunk.text[:200]}")

    elapsed = time.time() - start_time
    print(f"\n[DONE] {processed} chunks indexados | {skipped} paginas vazias | {elapsed:.0f}s")


def main():
    parser = argparse.ArgumentParser(description="Ingere PDFs no Supabase via pgvector")
    parser.add_argument("files", nargs="*", help="Arquivos PDF especificos para ingerir")
    parser.add_argument("--all", action="store_true", help="Ingere todos os PDFs da raiz do projeto")
    parser.add_argument("--max-pages", type=int, default=999, help="Maximo de paginas por PDF")
    parser.add_argument("--no-skip", action="store_true", help="Reindexar mesmo que ja exista")
    args = parser.parse_args()

    skip = not args.no_skip

    # Descobre quais docs ja estao indexados
    indexed_titles = get_indexed_titles() if skip else set()
    if indexed_titles:
        print(f"[INFO] {len(indexed_titles)} documento(s) ja indexado(s) no banco.")

    # Determina a lista de PDFs a processar
    if args.files:
        pdf_files = []
        for f in args.files:
            full = os.path.join(str(BASE_DIR), f) if not os.path.isabs(f) else f
            if os.path.exists(full):
                pdf_files.append(full)
            else:
                print(f"[AVISO] Arquivo nao encontrado: {f}")
    elif args.all:
        pdf_files = sorted(glob.glob(os.path.join(str(BASE_DIR), "*.pdf")))
    else:
        pdf_files = []
        for name in TARGET_PDFS:
            full = os.path.join(str(BASE_DIR), name)
            if os.path.exists(full):
                pdf_files.append(full)
            else:
                print(f"[AVISO] Nao encontrado: {name}")

    if not pdf_files:
        print("[ERRO] Nenhum PDF encontrado para processar.")
        sys.exit(1)

    print(f"\n[START] Iniciando ingestion de {len(pdf_files)} arquivo(s)...\n")

    for pdf in pdf_files:
        ingest_pdf(pdf, max_pages=args.max_pages, skip_existing=skip, indexed_titles=indexed_titles)
        indexed_titles.add(os.path.basename(pdf))

    print(f"\n[DONE] Ingestion concluida!")


if __name__ == "__main__":
    main()
