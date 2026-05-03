import os
import sys
import httpx
import glob
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).parent.parent
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL", "https://tkbivipqiewkfnhktmqq.supabase.co")
if not SUPABASE_URL.startswith("http"):
    SUPABASE_URL = "https://" + SUPABASE_URL
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}"
}

def check_status():
    print("\n🔍 Verificando integridade do Cérebro Normativo...\n")
    
    # 1. Lista arquivos locais (PDFs)
    local_pdfs = {os.path.basename(f) for f in glob.glob(str(BASE_DIR / "*.pdf"))}
    
    # 2. Busca documentos no Supabase
    try:
        resp = httpx.get(
            f"{SUPABASE_URL}/rest/v1/ic_documents?select=title,ic_document_chunks(count)",
            headers=HEADERS,
            timeout=15.0
        )
        if resp.status_code != 200:
            print(f"[ERRO] Falha ao acessar Supabase: {resp.text}")
            return

        db_docs = resp.json()
        indexed_titles = {doc["title"] for doc in db_docs}
        
        print(f"📊 Status no Banco de Dados:")
        print(f"   - Documentos Indexados: {len(db_docs)}")
        
        for doc in db_docs:
            chunk_count = doc.get("ic_document_chunks", [{}])[0].get("count", 0)
            print(f"     ✅ {doc['title']} ({chunk_count} trechos)")

        # 3. Compara
        missing = local_pdfs - indexed_titles
        
        print(f"\n📂 Status da Pasta Local:")
        print(f"   - Total de PDFs na pasta: {len(local_pdfs)}")
        print(f"   - PDFs aguardando vetorização: {len(missing)}")
        
        if missing:
            print("\n⚠️  Documentos NÃO vetorizados:")
            for m in sorted(missing):
                print(f"     ❌ {m}")
            
            print("\n💡 Sugestão: Execute 'python scripts/ingest_pdfs.py --all' para processar tudo.")
        else:
            print("\n✨ Todos os PDFs locais já estão no banco de vetores!")

    except Exception as e:
        print(f"[ERRO] {str(e)}")

if __name__ == "__main__":
    check_status()
