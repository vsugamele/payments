#!/usr/bin/env python3
"""
Motor Forense Binário MPE (T068 / RDW 1014B) & Lookup de BIN (IP0040T1)
Conecta o snapshot forense frontend/data/mpe-t068-forense.json e o parser binário real engine/parser.py
sobre o arquivo físico PRD_MST_T068_D260417.T040718_A001.
"""
import sys
import os
import json
import re
from typing import Dict, Any, Optional, List

sys.stdout.reconfigure(encoding="utf-8")

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
MPE_JSON_PATH = os.path.join(BASE_DIR, "frontend", "data", "mpe-t068-forense.json")
RAW_T068_PATH = os.path.join(BASE_DIR, "PRD_MST_T068_D260417.T040718_A001")


def load_mpe_snapshot() -> Dict[str, Any]:
    with open(MPE_JSON_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def decode_ip0040_posicional(raw_str: str) -> Dict[str, Any]:
    """
    Disseca um registro posicional de 194 bytes da tabela IP0040T1 (Account Range / BIN)
    byte a byte conforme engine/parser.py.
    """
    padded = raw_str.ljust(194, " ")
    slices = [
        {"pos": "001–011", "py_slice": "[0:11]", "len": 11, "field": "CONTROL_HEADER", "desc": "Timestamp juliano de atualização + Indicador de operação (A=Active) + Table Sub-ID", "value": padded[0:11]},
        {"pos": "012–030", "py_slice": "[11:30]", "len": 19, "field": "ACCOUNT_RANGE_LOW", "desc": "Faixa Inicial do BIN/PAN (19 dígitos preenchidos com zeros à direita)", "value": padded[11:30]},
        {"pos": "031–033", "py_slice": "[30:33]", "len": 3, "field": "GCMS_PRODUCT_LOW", "desc": "Código de Produto Licenciado Inicial (ex: MCS, MCG, MPL, MWE, MDB, MDP, CIR, MSI)", "value": padded[30:33]},
        {"pos": "034–052", "py_slice": "[33:52]", "len": 19, "field": "ACCOUNT_RANGE_HIGH", "desc": "Faixa Final do BIN/PAN (19 dígitos preenchidos com 9/zeros)", "value": padded[33:52]},
        {"pos": "053–055", "py_slice": "[52:55]", "len": 3, "field": "GCMS_PRODUCT_HIGH", "desc": "Código de Produto Licenciado Final", "value": padded[52:55]},
        {"pos": "056–057", "py_slice": "[55:57]", "len": 2, "field": "CARD_PROGRAM_ID", "desc": "Identificador de Programa / Subtipo (ex: MP, MC, MS)", "value": padded[55:57]},
        {"pos": "058–068", "py_slice": "[57:68]", "len": 11, "field": "ISSUER_ICA_MEMBER_ID", "desc": "Member ID / ICA do Banco Emissor (11 bytes)", "value": padded[57:68]},
        {"pos": "069–076", "py_slice": "[68:76]", "len": 8, "field": "RESERVED_FLAGS", "desc": "Indicadores internos de roteamento e parâmetros de tabela", "value": padded[68:76]},
        {"pos": "077–079", "py_slice": "[76:79]", "len": 3, "field": "COUNTRY_CODE_ALPHA3", "desc": "País do Emissor ISO 3166-1 Alpha-3 (ex: BRA, USA, ARG)", "value": padded[76:79]},
        {"pos": "080–082", "py_slice": "[79:82]", "len": 3, "field": "COUNTRY_CODE_NUMERIC", "desc": "País do Emissor ISO 3166-1 Numérico (ex: 076 = Brasil, 840 = EUA)", "value": padded[79:82]},
        {"pos": "083–083", "py_slice": "[82:83]", "len": 1, "field": "ISSUER_REGION", "desc": "Região Mastercard (A=USA, B=LAC/Brasil, C=Europe, D=AP, E=MEA, 1=Canada)", "value": padded[82:83]},
        {"pos": "084–194", "py_slice": "[83:194]", "len": 111, "field": "EXTENDED_ROUTING_AND_FEES", "desc": "Parâmetros de Brand Product, Moeda de Liquidação, Indicadores de Fast Funds e Tokenização", "value": padded[83:194].strip()},
    ]
    return {
        "raw_length": len(raw_str),
        "expected_length": 194,
        "rdw_header_hex": "00C20000" if len(raw_str) == 194 else f"{len(raw_str):04X}",
        "slices": slices,
    }


def live_search_t068(table_id: str, query: str, limit: int = 25) -> Dict[str, Any]:
    """
    Executa busca no snapshot local e, se o arquivo binário PRD_MST_T068_D260417.T040718_A001
    estiver presente na raiz, permite varrer diretamente o stream binário de 1.014 bytes.
    """
    snap = load_mpe_snapshot()
    q_up = (query or "").strip().upper()

    if table_id == "IP0040T1":
        all_bins = snap.get("bin_samples_bra", []) + snap.get("bin_samples_global", [])
        results = []
        # Check if query is a numeric PAN/BIN
        q_digits = re.sub(r"\D", "", q_up)
        for b in all_bins:
            if not q_up:
                results.append(b)
            elif q_digits and len(q_digits) >= 6:
                padded = q_digits.ljust(19, "0")[:19]
                if b["range_start"] <= padded <= b["range_end"] or q_digits in b["range_start"] or q_digits in b["issuer_ica"]:
                    results.append(b)
            elif (
                q_up in b.get("product_start", "").upper()
                or q_up in b.get("country_alpha", "").upper()
                or q_up in b.get("issuer_ica", "").upper()
                or q_up in b.get("raw_record", "").upper()
            ):
                results.append(b)
            if len(results) >= limit:
                break

        # If not enough results and raw binary file exists, scan up to 15,000 blocks fast
        if len(results) < limit and os.path.exists(RAW_T068_PATH) and q_up:
            sys.path.insert(0, BASE_DIR)
            from engine.parser import MPEParser
            mpe = MPEParser(RAW_T068_PATH)
            with open(RAW_T068_PATH, "rb") as f:
                buf = b""
                blocks_read = 0
                while blocks_read < 12000 and len(results) < limit:
                    blk = f.read(1014)
                    if not blk:
                        break
                    blocks_read += 1
                    buf += blk[:1012]
                    while len(buf) >= 4:
                        rdw = buf[:4]
                        rlen = int.from_bytes(rdw[2:4], "big")
                        if len(buf) < 4 + rlen:
                            break
                        rec = buf[4:4 + rlen]
                        buf = buf[4 + rlen:]
                        if rlen == 194 and q_up.encode("ascii", errors="ignore") in rec:
                            parsed = mpe.parse_bin_record(rec)
                            if parsed:
                                parsed["rdw_hex"] = rdw.hex().upper()
                                parsed["raw_record"] = parsed["raw_record"].rstrip()
                                if not any(r["range_start"] == parsed["range_start"] for r in results):
                                    results.append(parsed)
                                    if len(results) >= limit:
                                        break

        return {
            "table_id": "IP0040T1",
            "query": query,
            "count": len(results),
            "results": results[:limit],
        }

    # Other tables in sample_records_by_table
    samples = snap.get("sample_records_by_table", {}).get(table_id, [])
    if q_up:
        samples = [s for s in samples if q_up in s.get("raw_ascii", "").upper()]
    return {
        "table_id": table_id,
        "query": query,
        "count": len(samples),
        "results": samples[:limit],
    }


def main():
    action = sys.argv[1] if len(sys.argv) > 1 else "overview"
    snap = load_mpe_snapshot()

    if action == "overview":
        first_bin = (snap.get("bin_samples_bra") or [{}])[0]
        default_decoded = decode_ip0040_posicional(first_bin.get("raw_record", ""))
        print(json.dumps({
            "file_info": snap["file_info"],
            "physical_blocks_sample": snap["physical_blocks_sample"],
            "tables_catalog": snap["tables_catalog"],
            "sample_records_by_table": snap["sample_records_by_table"],
            "bin_samples_bra": snap["bin_samples_bra"][:50],
            "bin_samples_global": snap["bin_samples_global"][:15],
            "default_decoded_ip0040": default_decoded,
        }, ensure_ascii=False))
    elif action == "decode":
        raw_str = sys.argv[2] if len(sys.argv) > 2 else ""
        print(json.dumps(decode_ip0040_posicional(raw_str), ensure_ascii=False))
    elif action == "search":
        payload = json.loads(sys.argv[2]) if len(sys.argv) > 2 else {}
        table_id = payload.get("table_id", "IP0040T1")
        query = payload.get("query", "")
        limit = int(payload.get("limit", 25))
        print(json.dumps(live_search_t068(table_id, query, limit), ensure_ascii=False))


if __name__ == "__main__":
    main()
