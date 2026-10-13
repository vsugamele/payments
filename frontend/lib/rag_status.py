import sqlite3
import os
import sys
import json
import time

DB_PATH = r"C:\Users\vsuga\Documents\Codex\2026-10-02\task\base_bandeiras_local\acervo.sqlite3"

def get_rag_status(custom_query=None):
    if not os.path.exists(DB_PATH):
        return {
            "connected": False,
            "error": "Arquivo acervo.sqlite3 não encontrado no caminho local.",
            "path": DB_PATH
        }

    try:
        size_bytes = os.path.getsize(DB_PATH)
        size_mb = round(size_bytes / (1024 * 1024), 2)

        uri = f"file:{DB_PATH.replace(os.sep, '/')}?mode=ro&immutable=1"
        conn = sqlite3.connect(uri, uri=True, timeout=5)
        c = conn.cursor()

        # Benchmarks
        test_queries = ["intercâmbio", "3DS", "chargeback", "settlement", "tokenização"]
        benchmark_results = []
        for q in test_queries:
            t0 = time.perf_counter()
            # Fast search using match and limit
            rows = c.execute(f"SELECT rowid FROM search_fts WHERE search_fts MATCH ? LIMIT 10", (q,)).fetchall()
            dt_ms = round((time.perf_counter() - t0) * 1000, 2)
            benchmark_results.append({
                "query": q,
                "hits": len(rows),
                "latencyMs": dt_ms
            })

        avg_latency = round(sum(b["latencyMs"] for b in benchmark_results) / len(benchmark_results), 2)

        # Custom query if provided
        custom_result = None
        if custom_query and custom_query.strip():
            t0 = time.perf_counter()
            clean_q = custom_query.strip().replace('"', '').replace("'", "")
            rows = c.execute(f"SELECT rowid FROM search_fts WHERE search_fts MATCH ? LIMIT 20", (clean_q,)).fetchall()
            dt_ms = round((time.perf_counter() - t0) * 1000, 2)
            custom_result = {
                "query": clean_q,
                "hits": len(rows),
                "latencyMs": dt_ms
            }

        # Totals
        total_assets = c.execute("SELECT COUNT(*) FROM assets").fetchone()[0]
        units_row = c.execute("SELECT SUM(total_units), SUM(text_units), SUM(ocr_units), SUM(characters) FROM assets").fetchone()
        total_pages = units_row[0] or 0
        text_pages = units_row[1] or 0
        ocr_pages = units_row[2] or 0
        total_chars = units_row[3] or 0

        # Statuses
        statuses = dict(c.execute("SELECT status, COUNT(*) FROM assets GROUP BY status").fetchall())
        extracted = statuses.get("extracted", 0) + statuses.get("extracted_with_ocr_unreviewed", 0)
        failed = statuses.get("failed", 0)
        integrity_pct = round(((total_assets - failed) / total_assets) * 100, 2) if total_assets else 100.0

        # Extensions
        ext_rows = c.execute("""
            SELECT ext, COUNT(*), SUM(bytes) 
            FROM assets 
            GROUP BY ext 
            ORDER BY COUNT(*) DESC 
            LIMIT 8
        """).fetchall()

        ext_stats = []
        for ext, count, bts in ext_rows:
            ext_stats.append({
                "ext": ext or "outro",
                "count": count,
                "sizeMb": round((bts or 0) / (1024 * 1024), 2)
            })

        # Brands
        brand_keys = {
            "Visa": "visa",
            "Mastercard": "mastercard",
            "Elo": "elo",
            "American Express": "amex",
            "Bacen / BCB": "bacen",
            "PCI DSS": "pci"
        }
        brand_stats = {}
        for label, kw in brand_keys.items():
            cnt = c.execute(f"SELECT COUNT(*) FROM assets WHERE lower(name) LIKE ?", (f"%{kw}%",)).fetchone()[0]
            brand_stats[label] = cnt

        # Recent / Featured manuals
        featured_rows = c.execute("""
            SELECT sha, name, ext, total_units, characters, status 
            FROM assets 
            WHERE ext = '.pdf' AND total_units > 10
            ORDER BY characters DESC 
            LIMIT 15
        """).fetchall()

        featured_manuals = []
        for sha, name, ext, units, chars, status in featured_rows:
            featured_manuals.append({
                "sha": sha[:12],
                "name": name,
                "ext": ext,
                "units": units,
                "characters": chars,
                "status": status
            })

        conn.close()

        return {
            "connected": True,
            "path": DB_PATH,
            "sizeMb": size_mb,
            "totalAssets": total_assets,
            "totalPages": total_pages,
            "textPages": text_pages,
            "ocrPages": ocr_pages,
            "totalCharacters": total_chars,
            "integrityPercent": integrity_pct,
            "statuses": statuses,
            "extStats": ext_stats,
            "brandStats": brand_stats,
            "benchmark": benchmark_results,
            "avgLatencyMs": avg_latency,
            "customResult": custom_result,
            "featuredManuals": featured_manuals,
            "sqliteEngine": "SQLite 3 (FTS5 Inverted Index & Match)",
            "retrievalMode": "Read-Only Immutable Offline Memory"
        }

    except Exception as e:
        return {
            "connected": False,
            "error": str(e),
            "path": DB_PATH
        }

if __name__ == "__main__":
    custom = sys.argv[1] if len(sys.argv) > 1 else None
    res = get_rag_status(custom)
    print(json.dumps(res, ensure_ascii=False))
