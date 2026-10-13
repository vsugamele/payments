import sqlite3
import os
import sys
import json
import re

BASE_LOCAL = r"C:\Users\vsuga\Documents\Codex\2026-10-02\task\base_bandeiras_local"
CAMPOS_DB = os.path.join(BASE_LOCAL, "indice_campos", "campos.sqlite3")
TARIFAS_DB = os.path.join(BASE_LOCAL, "indice_tarifas", "tarifas.sqlite3")
TARIFAS_CURADAS_JSON = os.path.join(BASE_LOCAL, "indice_tarifas", "tarifas_curadas.json")

FRONTEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MCBS_JSON = os.path.join(FRONTEND_DIR, "data", "mcbs-billing-full.json")
VISA_BILLING_JSON = os.path.join(FRONTEND_DIR, "data", "visa-billing-full.json")

FEATURED_LAYOUTS = [
    {
        "id": "visa_tc05_tcr0",
        "bandeira": "Visa",
        "sistema": "Base II Clearing (TC 01–49)",
        "codigo": "TC 05 / TCR 0",
        "nome": "Draft Data Primary Record Layout (Compra Clearing)",
        "doc_id": "visa_tc01_49",
        "page_start": 45,
        "page_end": 46,
        "registro_filter": "Draft Data Record Layout",
        "total_bytes": 168,
        "fluxo": "Adquirente → VisaNet (Base II) → Emissor",
        "descricao": "Registro primário de 168 bytes para apresentação financeira (First Presentment TC 05). Contém PAN, ARN de 23 dígitos, valores, MCC, código de autorização, POS Entry Mode e Reimbursement Attribute (posição 168).",
        "sample_overrides": {
            "1-2": "05",
            "3-3": "0",
            "4-4": "0",
            "5-20": "4111110088771234",
            "21-23": "000",
            "24-24": " ",
            "25-25": " ",
            "26-26": " ",
            "27-49": "74285616105000129384715",
            "50-57": "10045992",
            "58-61": "1013",
            "62-73": "000000125000",
            "74-76": "986",
            "77-88": "000000125000",
            "89-91": "986",
            "92-116": "ECOMMIT PAGAMENTOS LTDA  ",
            "117-129": "SAO PAULO    ",
            "130-132": "BR ",
            "133-136": "5411",
            "137-141": "01310",
            "142-144": "SP ",
            "145-145": "A",
            "146-146": "0",
            "147-147": "1",
            "148-149": "00",
            "150-150": "0",
            "151-151": "A",
            "152-157": "948271",
            "158-158": "5",
            "159-159": " ",
            "160-160": "1",
            "161-161": " ",
            "162-163": "05",
            "164-167": "6286",
            "168-168": "A"
        }
    },
    {
        "id": "visa_tc05_tcr1",
        "bandeira": "Visa",
        "sistema": "Base II Clearing (TC 01–49)",
        "codigo": "TC 05 / TCR 1",
        "nome": "Draft Data Additional Data & Fee Program Indicator (FPI)",
        "doc_id": "visa_tc01_49",
        "page_start": 67,
        "page_end": 68,
        "registro_filter": "Draft Data Record Layout",
        "total_bytes": 168,
        "fluxo": "Adquirente → VisaNet (Base II) → Emissor",
        "descricao": "Segundo registro (TCR 1) do Draft Data. Carrega Chargeback Reduction Service, Fee Program Indicator (FPI nas posições 76–78), Card Acceptor ID (MID), Terminal ID e POS Environment.",
        "sample_overrides": {
            "1-2": "05",
            "3-3": "0",
            "4-4": "1",
            "24-38": "000192837465123",
            "39-46": "TERM0091",
            "76-78": "123"
        }
    },
    {
        "id": "visa_tc05_tcr2_br",
        "bandeira": "Visa",
        "sistema": "Base II Clearing Brasil (TC 01–49)",
        "codigo": "TC 05 / TCR 2 (BR)",
        "nome": "Brazil National Settlement Draft Data (Parcelado & Liquidação Nacional)",
        "doc_id": "visa_tc01_49",
        "page_start": 87,
        "page_end": 87,
        "registro_filter": "Brazil National Settlement Draft Data Record Layout",
        "total_bytes": 168,
        "fluxo": "Adquirente Brasil → VisaNet → Emissor Brasil (CIP/SILOC)",
        "descricao": "Registro específico do arranjo brasileiro (Country Code BR, TCR 2). Transporta o número de parcelas, número da parcela atual, tipo de parcelamento, taxa de embarque e dados de liquidação doméstica.",
        "sample_overrides": {
            "1-2": "05",
            "3-3": "0",
            "4-4": "2",
            "5-6": "BR",
            "7-8": "00",
            "9-11": "012",
            "12-13": "06"
        }
    },
    {
        "id": "visa_tc05_tcr5",
        "bandeira": "Visa",
        "sistema": "Base II Clearing (TC 01–49)",
        "codigo": "TC 05 / TCR 5",
        "nome": "Payment Service Data (Transaction ID, Validation Code, ECI & 3DS)",
        "doc_id": "visa_tc01_49",
        "page_start": 178,
        "page_end": 179,
        "registro_filter": "Draft Data Record Layout",
        "total_bytes": 168,
        "fluxo": "Adquirente → VisaNet (Base II) → Emissor",
        "descricao": "Registro crítico contra Downgrade de Intercâmbio (CPS/Custom Payment Service). Carrega o Transaction Identifier de 15 dígitos (pos 5–19), Validation Code (pos 24–27) e Electronic Commerce Indicator (ECI).",
        "sample_overrides": {
            "1-2": "05",
            "3-3": "0",
            "4-4": "5",
            "5-19": "384920192837465",
            "20-23": "2026",
            "24-27": "A9F2"
        }
    },
    {
        "id": "visa_tc05_tcr7",
        "bandeira": "Visa",
        "sistema": "Base II Clearing (TC 01–49)",
        "codigo": "TC 05 / TCR 7",
        "nome": "Chip Card Transaction Data (EMV Cryptogram, TVR, IAD, ATC)",
        "doc_id": "visa_tc01_49",
        "page_start": 198,
        "page_end": 199,
        "registro_filter": "Draft Data Record Layout",
        "total_bytes": 168,
        "fluxo": "Adquirente → VisaNet (Base II) → Emissor",
        "descricao": "Dados criptográficos EMV do chip enviados no clearing (TCR 7): Application Transaction Counter (ATC), Terminal Verification Results (TVR), Application Cryptogram (ARQC/TC) e Issuer Application Data (IAD).",
        "sample_overrides": {
            "1-2": "05",
            "3-3": "0",
            "4-4": "7",
            "5-6": "00",
            "7-9": "001",
            "10-15": "261013"
        }
    },
    {
        "id": "visa_vss_tc46_sub4",
        "bandeira": "Visa",
        "sistema": "Visa Settlement Service (VSS Vol. 2)",
        "codigo": "TC 46 / Subgroup 4",
        "nome": "VSS-120 / VSS-130 / VSS-140 Client Settlement Data (Intercâmbio & Tarifas)",
        "doc_id": "visa_vss_v2",
        "page_start": 207,
        "page_end": 214,
        "registro_filter": "TC 46, TCR 0 (Report Subgroup 4) Client Settlement Data Record Layout",
        "total_bytes": 168,
        "fluxo": "VisaNet (VSS) → Adquirente / Emissor (Conciliação Financeira)",
        "descricao": "Registro raw de conciliação financeira (TC 46 Subgroup 4) que alimenta os relatórios VSS-120, VSS-130 e VSS-140. Traz SRE de liquidação, moeda (986), contadores, montantes brutos e valores de Intercâmbio/Reimbursement Fees.",
        "sample_overrides": {
            "1-2": "46",
            "3-3": "0",
            "4-4": "0",
            "5-10": "400986",
            "11-16": "400001",
            "17-26": "9000123456",
            "27-36": "9000123456",
            "37-46": "9000123456",
            "47-49": "001",
            "50-52": "986",
            "53-55": "986",
            "56-56": "2",
            "57-57": " ",
            "59-59": "V",
            "60-60": "4",
            "61-63": "120"
        }
    },
    {
        "id": "visa_vss_v22120",
        "bandeira": "Visa",
        "sistema": "Visa Settlement Service (VSS Vol. 2)",
        "codigo": "V22120",
        "nome": "VSS-Specific V22120 — Clearing & Settlement Detail Record",
        "doc_id": "visa_vss_v2",
        "page_start": 365,
        "page_end": 367,
        "registro_filter": "VSS-Specific – V22120",
        "total_bytes": 130,
        "fluxo": "VisaNet (VSS) → Adquirente / Emissor",
        "descricao": "Layout posicional de 130 bytes dos registros analíticos V22120 gerados pelo Visa Settlement Service para batimento transacional de tarifas e intercâmbio.",
        "sample_overrides": {
            "1-6": "V22120",
            "7-16": "9000123456"
        }
    },
    {
        "id": "mc_ptl_ip0040t1",
        "bandeira": "Mastercard",
        "sistema": "MPE / Parameter Tables (GCMS)",
        "codigo": "IP0040T1",
        "nome": "Table IP0040T1 — Issuer Account Range (Tabela de BINs & Produtos GCMS)",
        "doc_id": "mc_dmc_ptl",
        "page_start": 26,
        "page_end": 35,
        "registro_filter": "IP0040T1",
        "total_bytes": 194,
        "fluxo": "Mastercard GCMS (MPE) → Adquirente / Processadora / Emissor",
        "descricao": "Principal tabela de parâmetros MPE da Mastercard (IP0040T1). Define faixas de BIN (Low/High de 19 dígitos), GCMS Product ID (ex: MCB,MPL,MDS), Card Program Identifier (CIR,MDS,Mestro), ICA do Emissor, País (BRA/076) e indicadores de ALM, Tokenização e Contactless.",
        "sample_overrides": {
            "1-7": "2628601",
            "8-8": "A",
            "9-11": "040",
            "12-30": "5536360000000000000",
            "31-33": "MCB",
            "34-52": "5536369999999999999",
            "53-55": "CIR",
            "56-57": "01",
            "58-68": "00000014829",
            "69-69": "C",
            "70-76": "0014829",
            "77-79": "BRA",
            "80-82": "076",
            "83-83": "E",
            "84-86": "PRE",
            "87-87": "Y",
            "88-88": "N",
            "89-89": "Y",
            "90-90": "Y",
            "91-93": "MCB",
            "94-94": "Y",
            "95-95": "Y",
            "96-101": "260101",
            "102-104": "986",
            "105-105": "2",
            "152-152": "Y",
            "153-153": "N"
        }
    },
    {
        "id": "mc_ptl_ip0052t1",
        "bandeira": "Mastercard",
        "sistema": "MPE / Parameter Tables (GCMS)",
        "codigo": "IP0052T1",
        "nome": "Table IP0052T1 — Interchange Fee Group (Regras de Enquadramento IRD)",
        "doc_id": "mc_dmc_ptl",
        "page_start": 244,
        "page_end": 247,
        "registro_filter": "IP0052T1",
        "total_bytes": 77,
        "fluxo": "Mastercard GCMS (MPE) → Adquirente / Emissor",
        "descricao": "Tabela MPE que amarra MTI (1240), Function Code (DE 24 = 200), Process Code (DE 3), Timeliness Pointer e Fee Code Pointer para determinar qual IRD (Interchange Rate Designator) será aplicado no clearing.",
        "sample_overrides": {
            "1-8": "IP0052T1",
            "9-18": "2610130000",
            "23-24": "12",
            "25-26": "20",
            "27-28": "00"
        }
    },
    {
        "id": "mc_ptl_ip0053t1",
        "bandeira": "Mastercard",
        "sistema": "MPE / Parameter Tables (GCMS)",
        "codigo": "IP0053T1",
        "nome": "Table IP0053T1 — Interchange Fee Type (Alíquotas %, Unit Fee e Limites)",
        "doc_id": "mc_dmc_ptl",
        "page_start": 249,
        "page_end": 251,
        "registro_filter": "IP0053T1",
        "total_bytes": 59,
        "fluxo": "Mastercard GCMS (MPE) → Adquirente / Emissor",
        "descricao": "Tabela MPE que armazena os percentuais de intercâmbio (Interchange Rate), tarifa fixa por transação (Unit Fee), direção do fluxo (A->I ou I->A), moeda (986) e piso/teto da tarifa.",
        "sample_overrides": {
            "1-8": "IP0053T1",
            "9-18": "2610130000",
            "23-25": "STD",
            "26-28": "ACQ",
            "29-31": "986",
            "32-32": "2"
        }
    },
    {
        "id": "mc_guide_ip755120",
        "bandeira": "Mastercard",
        "sistema": "GCMS Clearing Reports (DMC Guide)",
        "codigo": "IP755120-AA",
        "nome": "Report IP755120-AA — Clearing Detail Report",
        "doc_id": "mc_dmc_guide",
        "page_start": 2042,
        "page_end": 2042,
        "registro_filter": "Table 2120: Detail record",
        "total_bytes": 105,
        "fluxo": "Mastercard GCMS → Adquirente / Emissor (Backoffice)",
        "descricao": "Registro de detalhe do relatório IP755120-AA enviado pelo GCMS após cada ciclo de clearing (6 janelas diárias), detalhando lotes aceitos, contagens e valores de liquidação.",
        "sample_overrides": {}
    },
    {
        "id": "elo_liq_45",
        "bandeira": "Elo",
        "sistema": "Elo Mensageria de Liquidação 26.2",
        "codigo": "Registro 45",
        "nome": "Registro 45 — Detalhe de Intercâmbios Recalculados (IRQ)",
        "doc_id": "elo_liquidacao",
        "page_start": 267,
        "page_end": 269,
        "registro_filter": "3.7.13 Registro Detalhe de Intercâmbios Recalculados (45)",
        "total_bytes": 181,
        "fluxo": "Elo Liquidação → Adquirente / Emissor",
        "descricao": "Registro posicional do arquivo de liquidação Elo (Release 26.2) que reporta transações cujo intercâmbio foi recalculado pela bandeira, exibindo Range de BIN, Valor da Transação, Taxa de Intercâmbio e o IRQ (Código de Classificação da Taxa nas posições 159–166).",
        "sample_overrides": {
            "1-2": "45",
            "3-10": "63636800",
            "11-18": "63636899",
            "19-22": "0001",
            "23-30": "20261013",
            "31-46": "0000918273645123",
            "47-65": "6363680019283746   ",
            "66-80": "000192837465001",
            "81-92": "000000050000",
            "93-104": "000000000825",
            "105-119": "000000000016500",
            "120-131": "000000000000",
            "132-146": "000000000000000",
            "147-158": "000000000825",
            "159-166": "ELOCons1",
            "167-181": "ELO202610139901"
        }
    },
    {
        "id": "elo_liq_07",
        "bandeira": "Elo",
        "sistema": "Elo Mensageria de Liquidação 26.2",
        "codigo": "Registro 07 (SDR)",
        "nome": "Registro 07 — Dados Suplementares (SDR)",
        "doc_id": "elo_liquidacao",
        "page_start": 255,
        "page_end": 259,
        "registro_filter": "3.7.4 Registro de Dados Suplementares (SDR) (07)",
        "total_bytes": 200,
        "fluxo": "Adquirente ↔ Elo ↔ Emissor",
        "descricao": "Registro de Dados Suplementares (SDR) da Elo (Release 26.2), utilizado para transportar dados estendidos de marketplace, subcredenciadores, tokenização e dados setoriais.",
        "sample_overrides": {
            "1-2": "07"
        }
    }
]


def get_campos_conn():
    if not os.path.exists(CAMPOS_DB):
        return None
    uri = f"file:{CAMPOS_DB.replace(os.sep, '/')}?mode=ro&immutable=1"
    return sqlite3.connect(uri, uri=True, timeout=5)


def load_json_cached(filepath):
    if not os.path.exists(filepath):
        return []
    with open(filepath, "r", encoding="utf-8") as f:
        return json.load(f)


def action_overview():
    conn = get_campos_conn()
    if not conn:
        return {"connected": False, "error": f"Base campos.sqlite3 não encontrada em {CAMPOS_DB}"}

    c = conn.cursor()
    docs_rows = c.execute("""
        SELECT doc_id, bandeira, titulo, arquivo, edicao, paginas, linhas
        FROM documentos
        ORDER BY linhas DESC
    """).fetchall()

    documentos = []
    total_campos = 0
    for doc_id, bandeira, titulo, arquivo, edicao, paginas, linhas in docs_rows:
        total_campos += (linhas or 0)
        documentos.append({
            "doc_id": doc_id,
            "bandeira": bandeira,
            "titulo": titulo,
            "arquivo": arquivo,
            "edicao": edicao,
            "paginas": paginas,
            "linhas": linhas
        })

    # Count by tipo
    tipos_rows = dict(c.execute("SELECT tipo, COUNT(*) FROM campos GROUP BY tipo").fetchall())
    # Count positional rows
    pos_count = c.execute("SELECT COUNT(*) FROM campos WHERE pos_inicio IS NOT NULL AND pos_fim IS NOT NULL").fetchone()[0]
    de_count = c.execute("SELECT COUNT(DISTINCT de) FROM campos WHERE de IS NOT NULL AND de != ''").fetchone()[0]
    pds_count = c.execute("SELECT COUNT(DISTINCT pds) FROM campos WHERE pds IS NOT NULL AND pds != ''").fetchone()[0]

    conn.close()

    mcbs_data = load_json_cached(MCBS_JSON)
    visa_billing = load_json_cached(VISA_BILLING_JSON)
    tarifas_curadas = load_json_cached(TARIFAS_CURADAS_JSON)
    curadas_list = tarifas_curadas.get("tarifas", []) if isinstance(tarifas_curadas, dict) else []

    return {
        "connected": True,
        "stats": {
            "totalCampos": total_campos,
            "totalManuais": len(documentos),
            "camposPosicionais": pos_count,
            "distinctDEs": de_count,
            "distinctPDSs": pds_count,
            "tipos": tipos_rows,
            "totalMcbsEvents": len(mcbs_data),
            "totalVisaBillingLines": len(visa_billing),
            "totalTarifasCuradas": len(curadas_list)
        },
        "documentos": documentos,
        "featuredLayouts": FEATURED_LAYOUTS,
        "tarifasCuradas": curadas_list
    }


def action_search_campos(params):
    conn = get_campos_conn()
    if not conn:
        return {"connected": False, "error": "campos.sqlite3 indisponível"}

    c = conn.cursor()
    q = (params.get("q") or "").strip()
    bandeira = (params.get("bandeira") or "").strip()
    doc_id = (params.get("doc_id") or "").strip()
    tipo = (params.get("tipo") or "").strip()
    de = (params.get("de") or "").strip()
    pds = (params.get("pds") or "").strip()
    posicao_str = (params.get("posicao") or "").strip()
    only_positional = params.get("only_positional") in (True, "true", "1")
    limit = min(int(params.get("limit") or 80), 200)

    where_clauses = ["1=1"]
    sql_params = []

    if bandeira and bandeira != "ALL":
        where_clauses.append("cp.bandeira = ?")
        sql_params.append(bandeira)

    if doc_id and doc_id != "ALL":
        where_clauses.append("cp.doc_id = ?")
        sql_params.append(doc_id)

    if tipo and tipo != "ALL":
        where_clauses.append("cp.tipo = ?")
        sql_params.append(tipo)

    if de:
        de_clean = re.sub(r"[^0-9]", "", de)
        if de_clean:
            where_clauses.append("(cp.de = ? OR cp.de = ?)")
            sql_params.extend([de_clean, de_clean.lstrip("0") or "0"])

    if pds:
        pds_clean = re.sub(r"[^0-9]", "", pds)
        if pds_clean:
            where_clauses.append("(cp.pds = ? OR cp.pds = ?)")
            sql_params.extend([pds_clean.zfill(4), pds_clean.lstrip("0") or "0"])

    if posicao_str:
        try:
            pos_int = int(posicao_str)
            where_clauses.append("(cp.pos_inicio <= ? AND cp.pos_fim >= ?)")
            sql_params.extend([pos_int, pos_int])
        except ValueError:
            pass

    if only_positional:
        where_clauses.append("(cp.pos_inicio IS NOT NULL AND cp.pos_fim IS NOT NULL)")

    if q:
        like_q = f"%{q}%"
        where_clauses.append("""(
            cp.nome LIKE ? OR
            cp.descricao LIKE ? OR
            cp.registro LIKE ? OR
            cp.cabecalho_pagina LIKE ? OR
            cp.valor LIKE ? OR
            cp.de LIKE ? OR
            cp.pds LIKE ?
        )""")
        sql_params.extend([like_q] * 7)

    where_sql = " AND ".join(where_clauses)

    count_row = c.execute(f"SELECT COUNT(*) FROM campos cp WHERE {where_sql}", sql_params).fetchone()
    total_matches = count_row[0] if count_row else 0

    rows = c.execute(f"""
        SELECT
            cp.id, cp.doc_id, d.titulo, d.edicao, cp.bandeira, cp.pagina,
            cp.tipo, COALESCE(cp.registro, cp.cabecalho_pagina, '') as reg,
            cp.de, cp.pds, cp.subcampo, cp.posicao, cp.pos_inicio, cp.pos_fim,
            cp.tamanho, cp.formato, cp.nome, cp.valor, cp.descricao
        FROM campos cp
        LEFT JOIN documentos d ON d.doc_id = cp.doc_id
        WHERE {where_sql}
        ORDER BY
            CASE WHEN cp.pos_inicio IS NOT NULL THEN 0 ELSE 1 END,
            cp.doc_id, cp.pagina, COALESCE(cp.pos_inicio, 999999), cp.id
        LIMIT ?
    """, sql_params + [limit]).fetchall()

    results = []
    for r in rows:
        results.append({
            "id": r[0],
            "doc_id": r[1],
            "manual_titulo": r[2],
            "edicao": r[3],
            "bandeira": r[4],
            "pagina": r[5],
            "tipo": r[6],
            "registro": r[7],
            "de": r[8],
            "pds": r[9],
            "subcampo": r[10],
            "posicao": r[11],
            "pos_inicio": r[12],
            "pos_fim": r[13],
            "tamanho": r[14] or ((r[13] - r[12] + 1) if (r[12] and r[13] and r[13] >= r[12]) else None),
            "formato": r[15],
            "nome": r[16],
            "valor": r[17],
            "descricao": r[18]
        })

    conn.close()
    return {
        "connected": True,
        "totalMatches": total_matches,
        "results": results
    }


def generate_default_field_value(pos_ini, pos_fim, formato, nome, overrides):
    length = max(1, pos_fim - pos_ini + 1)
    key = f"{pos_ini}-{pos_fim}"
    if key in overrides:
        val = str(overrides[key])
        if len(val) < length:
            fmt_low = (formato or "").lower()
            if "n" in fmt_low or "un" in fmt_low or "sn" in fmt_low:
                return val.zfill(length)
            return val.ljust(length)
        return val[:length]

    nome_low = (nome or "").lower()
    fmt_low = (formato or "").lower()

    if "reserved" in nome_low or "filler" in nome_low:
        return " " * length
    if "currency" in nome_low or "moeda" in nome_low:
        return "986"[:length].ljust(length)
    if "country" in nome_low or "país" in nome_low:
        return ("BRA" if length == 3 else "BR").ljust(length)[:length]
    if "date" in nome_low or "data" in nome_low or "timestamp" in nome_low:
        sample_dt = "20261013" if length >= 8 else "261013"
        return sample_dt[:length].zfill(length)
    if "amount" in nome_low or "valor" in nome_low or "taxa" in nome_low:
        return "15000".zfill(length)[:length]
    if "indicator" in nome_low or "switch" in nome_low or "flag" in nome_low:
        return ("Y" if "a" in fmt_low else "1").ljust(length)[:length]
    if "un" in fmt_low or fmt_low.startswith("n") or "sn" in fmt_low:
        return "0" * length
    return ("X" * min(length, 4)).ljust(length)


def action_get_layout(params):
    conn = get_campos_conn()
    if not conn:
        return {"connected": False, "error": "campos.sqlite3 indisponível"}

    preset_id = (params.get("preset_id") or "visa_tc05_tcr0").strip()
    preset = next((p for p in FEATURED_LAYOUTS if p["id"] == preset_id), FEATURED_LAYOUTS[0])

    c = conn.cursor()
    doc_id = preset["doc_id"]
    p_start = preset["page_start"]
    p_end = preset["page_end"]
    reg_filter = preset["registro_filter"]

    rows = c.execute("""
        SELECT
            id, pagina, COALESCE(registro, cabecalho_pagina, '') as reg,
            pos_inicio, pos_fim, tamanho, formato, nome, descricao, de, pds
        FROM campos
        WHERE doc_id = ?
          AND pagina BETWEEN ? AND ?
          AND pos_inicio IS NOT NULL
          AND pos_fim IS NOT NULL
          AND (COALESCE(registro, '') LIKE ? OR COALESCE(cabecalho_pagina, '') LIKE ?)
        ORDER BY pagina, pos_inicio, pos_fim, id
    """, (doc_id, p_start, p_end, f"%{reg_filter}%", f"%{reg_filter}%")).fetchall()

    # Deduplicate overlapping/repeated header rows and keep monotonically clean layout
    seen_ranges = set()
    raw_fields = []
    for r in rows:
        f_id, pagina, reg, p_ini, p_fim, tam, fmt, nome, desc, de, pds = r
        if p_ini < 1 or p_fim < p_ini or p_fim > 4000:
            continue
        # Skip stray rows from previous table on page 26 of IP0040T1 (pos 27, 28 before pos 1)
        if preset_id == "mc_ptl_ip0040t1" and pagina == 26 and p_ini in (27, 28):
            continue
        rng_key = (p_ini, p_fim)
        if rng_key in seen_ranges:
            continue
        seen_ranges.add(rng_key)
        raw_fields.append({
            "id": f_id,
            "pagina": pagina,
            "registro": reg,
            "pos_inicio": p_ini,
            "pos_fim": p_fim,
            "tamanho": p_fim - p_ini + 1,
            "formato": fmt or "AN",
            "nome": nome or f"Campo {p_ini}-{p_fim}",
            "descricao": desc or "",
            "de": de,
            "pds": pds
        })

    raw_fields.sort(key=lambda x: (x["pos_inicio"], x["pos_fim"]))

    # Build a synthetic sample string of length max_pos
    max_pos = max([f["pos_fim"] for f in raw_fields] + [preset.get("total_bytes", 168)])
    max_pos = min(max_pos, 1000)
    buffer = [" "] * max_pos
    overrides = preset.get("sample_overrides", {})

    for f in raw_fields:
        p_ini = f["pos_inicio"]
        p_fim = min(f["pos_fim"], max_pos)
        if p_ini <= max_pos:
            val = generate_default_field_value(p_ini, p_fim, f["formato"], f["nome"], overrides)
            f["sample_value"] = val
            for idx, ch in enumerate(val):
                pos_idx = p_ini - 1 + idx
                if 0 <= pos_idx < max_pos:
                    buffer[pos_idx] = ch

    sample_line = "".join(buffer)
    conn.close()

    return {
        "connected": True,
        "preset": preset,
        "totalBytes": max_pos,
        "fields": raw_fields,
        "sampleLine": sample_line
    }


def action_search_billing(params):
    q = (params.get("q") or "").strip().lower()
    brand = (params.get("brand") or "ALL").strip()
    role = (params.get("role") or "ALL").strip()
    service_id = (params.get("service_id") or "ALL").strip().upper()
    limit = min(int(params.get("limit") or 60), 150)

    mcbs_data = load_json_cached(MCBS_JSON)
    visa_data = load_json_cached(VISA_BILLING_JSON)

    results = []
    total_mcbs_matched = 0
    total_visa_matched = 0

    # Collect service IDs for filter dropdown
    mcbs_services = sorted(list({item.get("serviceId", "") for item in mcbs_data if item.get("serviceId")}))

    if brand in ("ALL", "Mastercard"):
        for item in mcbs_data:
            if service_id != "ALL" and item.get("serviceId") != service_id:
                continue
            billed_to = item.get("billedTo", "Adquirente / Emissor")
            if role != "ALL":
                if role == "Adquirente" and "Adquirente" not in billed_to:
                    continue
                if role == "Emissor" and "Emissor" not in billed_to:
                    continue
            if q:
                hay = f"{item.get('code','')} {item.get('name','')} {item.get('description','')} {item.get('serviceId','')}".lower()
                if q not in hay:
                    continue
            total_mcbs_matched += 1
            if len(results) < limit:
                results.append({
                    "bandeira": "Mastercard",
                    "sistema": "MCBS Billing Brazil (IPM 1740)",
                    "codigo": item.get("code"),
                    "serviceId": item.get("serviceId"),
                    "nome": item.get("name"),
                    "quemPaga": billed_to,
                    "descricao": item.get("description"),
                    "rates": item.get("rates", []),
                    "fonte": f"{item.get('manual', 'Manual MCBS - Billing - BRAZIL.pdf')} · p. {item.get('page', '?')}",
                    "reconciliacao": "Fatura MCBS / Arquivo IPM 1740 (Fee Collection)"
                })

    if brand in ("ALL", "Visa"):
        for item in visa_data:
            client_type = str(item.get("Client Type") or "Both")
            quem_paga = "Adquirente / Emissor"
            if "acquirer" in client_type.lower() and "issuer" not in client_type.lower():
                quem_paga = "Adquirente (Acquirer)"
            elif "issuer" in client_type.lower() and "acquirer" not in client_type.lower():
                quem_paga = "Emissor (Issuer)"

            if role != "ALL":
                if role == "Adquirente" and "Adquirente" not in quem_paga:
                    continue
                if role == "Emissor" and "Emissor" not in quem_paga:
                    continue

            b_line = str(item.get("Billing Line") or "")
            f_name = str(item.get("Fee Name") or "")
            inv_desc = str(item.get("Invoice Description") or "")
            long_desc = str(item.get("Long Description") or "")
            f_cat = str(item.get("Fee category") or "")

            if q:
                hay = f"{b_line} {f_name} {inv_desc} {long_desc} {f_cat}".lower()
                if q not in hay:
                    continue

            total_visa_matched += 1
            if len(results) < limit:
                results.append({
                    "bandeira": "Visa",
                    "sistema": f"Visa VSS Billing ({f_cat or 'Fee Guide'})",
                    "codigo": b_line or f_name[:12],
                    "serviceId": str(item.get("Fee Group") or "VSS"),
                    "nome": f_name or inv_desc,
                    "quemPaga": quem_paga,
                    "descricao": long_desc or inv_desc,
                    "rates": [f"Invoice: {inv_desc}", f"Vigência: {item.get('Effective Start Date', '2026')}"],
                    "fonte": "Visa Billing Line Mapping & Fee Guide (Base Oficial)",
                    "reconciliacao": "Relatório VSS-140 / TC 46 Subgroup 4 & 5"
                })

    return {
        "connected": True,
        "totalMcbsMatched": total_mcbs_matched,
        "totalVisaMatched": total_visa_matched,
        "totalMatched": total_mcbs_matched + total_visa_matched,
        "mcbsServiceIds": mcbs_services[:60],
        "results": results
    }


def main():
    try:
        payload = {}
        if len(sys.argv) > 1 and sys.argv[1].strip():
            payload = json.loads(sys.argv[1])

        action = payload.get("action", "overview")
        if action == "overview":
            res = action_overview()
        elif action == "search_campos":
            res = action_search_campos(payload)
        elif action == "get_layout":
            res = action_get_layout(payload)
        elif action == "search_billing":
            res = action_search_billing(payload)
        else:
            res = {"connected": False, "error": f"Ação desconhecida: {action}"}

        print(json.dumps(res, ensure_ascii=False))
    except Exception as e:
        print(json.dumps({"connected": False, "error": str(e)}, ensure_ascii=False))


if __name__ == "__main__":
    main()
