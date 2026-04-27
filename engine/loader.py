"""
Carrega regras e taxas do Supabase para uso na engine de provisionamento.
"""
import re
import warnings
from typing import NamedTuple, Optional
import httpx
import os
from dotenv import load_dotenv
import datetime as _dt

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL") or "https://tkbivipqiewkfnhktmqq.supabase.co"
if not SUPABASE_URL.startswith("http"):
    SUPABASE_URL = "https://" + SUPABASE_URL
SUPABASE_KEY = os.getenv("SUPABASE_KEY") or "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRrYml2aXBxaWV3a2ZuaGt0bXFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg0NzY4NDgsImV4cCI6MjA1NDA1Mjg0OH0.2TnLj4lriG7eoPQWDo0mV8u8YHor6bd5ItZCHYhkym0"


headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Prefer": "return=minimal"
}

def fetch_supabase(table: str):
    url = f"{SUPABASE_URL}/rest/v1/{table}?valid_until=is.null"
    resp = httpx.get(url, headers=headers, timeout=30.0)
    if resp.status_code != 200:
        print(f"Error fetching {table}: {resp.text}")
    resp.raise_for_status()
    return resp.json()

# ---------------------------------------------------------------------------
# Estruturas de dados
# ---------------------------------------------------------------------------

class MCRule(NamedTuple):
    rule_id: int
    expression: str
    ird: str
    priority: int
    active: bool
    description: str
    compiled: object  # código compilado para eval

class MaestroRule(NamedTuple):
    rule_id: int
    expression: str
    pseudo_ird: str
    priority: int
    rate_pct: float
    cap_brl: Optional[float]
    description: str
    compiled: object

class VisaRule(NamedTuple):
    rule_id: str
    priority: int
    descriptor: str
    accounting_sign: str
    rate_pct: float
    fixed_fee: float
    cap_fee: float
    expression: str
    compiled: object
    rate_corrupted: bool = False

# ---------------------------------------------------------------------------
# Compilador de expressões
# ---------------------------------------------------------------------------

def _compile_expr(expr: str) -> object:
    py = expr.replace('&', ' and ').replace('|', ' or ')
    py = re.sub(r'\((\w+)="([^"]+)"\)', r"(ctx.get('\1') == '\2')", py)
    py = re.sub(r'\((\w+)>=([\d.]+)\)', r"(ctx.get('\1', 0) >= \2)", py)
    py = re.sub(r'\((\w+)<=([\d.]+)\)', r"(ctx.get('\1', 0) <= \2)", py)
    py = re.sub(r'\((\w+)=(\d+)\)', r"(ctx.get('\1') == \2)", py)
    return compile(py, "<expr>", "eval")

def _eval_expr(compiled, ctx: dict) -> bool:
    try:
        return bool(eval(compiled, {"__builtins__": {}}, {"ctx": ctx}))
    except Exception:
        return False

def eval_rule(rule, ctx: dict) -> bool:
    return _eval_expr(rule.compiled, ctx)

def _compile_visa_expr(expr: str) -> object:
    py = expr
    py = re.sub(r'\((\w+) IS NOT NULL\)', r"(ctx.get('\1') not in (None, ''))", py)
    py = re.sub(r'\((\w+) IS EMPTY\)', r"(ctx.get('\1') in (None, ''))", py)

    def _replace_in(m: re.Match) -> str:
        var = m.group(1)
        items = m.group(2)
        return f"(ctx.get('{var}') in ({items}))"

    py = re.sub(r"\((\w+) IN \(([^)]+)\)\)", _replace_in, py)
    py = re.sub(r'\((\w+) >= ([\d.]+)\)', r"(ctx.get('\1', 0) >= \2)", py)
    py = re.sub(r'\((\w+) <= ([\d.]+)\)', r"(ctx.get('\1', 0) <= \2)", py)
    py = re.sub(r'\((\w+) > ([\d.]+)\)', r"(ctx.get('\1', 0) > \2)", py)
    py = re.sub(r'\((\w+) < ([\d.]+)\)', r"(ctx.get('\1', 0) < \2)", py)
    py = re.sub(r"\((\w+)='([^']+)'\)", r"(ctx.get('\1') == '\2')", py)
    py = re.sub(r"\((\w+)!='([^']+)'\)", r"(ctx.get('\1') != '\2')", py)
    py = re.sub(r'\((\w+)=(\d+)\)', r"(ctx.get('\1') == \2)", py)
    py = py.replace('&', ' and ').replace('|', ' or ')
    return compile(py, "<visa_expr>", "eval")

# ---------------------------------------------------------------------------
# Loaders do Supabase
# ---------------------------------------------------------------------------

def load_mc_rules() -> list[MCRule]:
    data = fetch_supabase("ic_mc_rules")
    rules: list[MCRule] = []
    for row in data:
        if not row.get("active", True):
            continue
        try:
            compiled = _compile_expr(row["expression"])
        except Exception:
            continue

        rules.append(MCRule(
            rule_id=row["rule_id"],
            expression=row["expression"],
            ird=row["ird"],
            priority=row["priority"],
            active=row["active"],
            description=row.get("description", ""),
            compiled=compiled,
        ))
    rules.sort(key=lambda r: r.priority)
    return rules

def load_maestro_rules() -> list[MaestroRule]:
    data = fetch_supabase("ic_maestro_rules")
    rules: list[MaestroRule] = []
    for row in data:
        try:
            compiled = _compile_expr(row["expression"])
        except Exception:
            continue

        rules.append(MaestroRule(
            rule_id=row["rule_id"],
            expression=row["expression"],
            pseudo_ird=row["pseudo_ird"],
            priority=row["priority"],
            rate_pct=float(row["rate_pct"]),
            cap_brl=float(row["cap_brl"]) if row.get("cap_brl") is not None else None,
            description=row.get("description", ""),
            compiled=compiled,
        ))
    rules.sort(key=lambda r: r.priority)
    return rules

def load_visa_rules() -> list[VisaRule]:
    data = fetch_supabase("ic_visa_rules")
    rules: list[VisaRule] = []
    for row in data:
        try:
            compiled = _compile_visa_expr(row["expression"])
        except Exception:
            continue

        rules.append(VisaRule(
            rule_id=str(row["rule_id"]),
            priority=row["priority"],
            descriptor=row.get("descriptor", ""),
            accounting_sign=row["accounting_sign"],
            rate_pct=float(row["rate_pct"]),
            fixed_fee=float(row["fixed_fee"]),
            cap_fee=float(row["cap_fee"]),
            expression=row["expression"],
            compiled=compiled,
            rate_corrupted=row.get("rate_corrupted", False),
        ))
    rules.sort(key=lambda r: r.priority)
    return rules

def load_rates() -> tuple[dict, dict]:
    """
    Retorna:
        base_rates: {(ird, tier, segment): rate_pct}
        adjustments: {(ird, segment): adjustment_pct}
    """
    br_data = fetch_supabase("ic_base_rates")
    adj_data = fetch_supabase("ic_adjustments")

    base_rates = {}
    for row in br_data:
        base_rates[(row["ird"], row["tier"], row["segment"])] = float(row["rate_pct"])
        
    adjustments = {}
    for row in adj_data:
        adjustments[(row["ird"], row["segment"])] = float(row["adjustment_pct"])
        
    return base_rates, adjustments

def load_mcc_to_segment() -> dict[int, str]:
    mcc_data = fetch_supabase("ic_mcc_to_segment")
    mcc_seg = {}
    for row in mcc_data:
        mcc_seg[int(row["mcc"])] = row["segment"]
    return mcc_seg
