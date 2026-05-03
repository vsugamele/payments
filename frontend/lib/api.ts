import type {
  HealthResponse,
  VisaResult,
  McResult,
  VisaRule,
  McRule,
  SimForm,
  CalcResult,
} from "./types";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`API ${path} → ${res.status}: ${txt}`);
  }
  return res.json();
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`API ${path} → ${res.status}`);
  return res.json();
}

// ─── Health & Reload ──────────────────────────────────────────────────────────
export const fetchHealth = () => get<HealthResponse>("/");
export const reloadTables = () => post<HealthResponse>("/reload", {});

// ─── Regras ───────────────────────────────────────────────────────────────────
export const fetchVisaRules = () =>
  get<{ total: number; regras: VisaRule[] }>("/regras/visa");
export const fetchMcRules = (limit = 200) =>
  get<{ total: number; regras: McRule[] }>(`/regras/mastercard?limit=${limit}`);

// ─── Cálculo principal ────────────────────────────────────────────────────────
export async function calcular(form: SimForm): Promise<CalcResult> {
  const valor = parseFloat(form.valor);
  if (isNaN(valor) || valor <= 0) throw new Error("Valor inválido");

  if (form.bandeira === "visa") {
    const body: Record<string, unknown> = {
      valor,
      produto: form.produto_visa,
      afs: form.afs,
      canal: form.canal_visa,
      parcelas: parseInt(form.parcelas) || 1,
      internacional: form.internacional,
      debug: form.debug,
    };
    if (form.mcc) body.mcc = parseInt(form.mcc);
    if (form.categoria) body.categoria = form.categoria;
    if (form.eci) body.ECI = form.eci;
    return post<VisaResult>("/calcular/visa/simples", body);
  }

  if (form.bandeira === "mastercard") {
    return post<McResult>("/calcular/simples", {
      valor,
      bandeira: "mastercard",
      tipo_cartao: form.tipo_cartao,
      canal: form.canal_mc,
      pessoa: form.pessoa,
      tipo_produto: form.tipo_produto,
      mcc: form.mcc ? parseInt(form.mcc) : undefined,
      categoria: form.categoria || undefined,
      parcelas: parseInt(form.parcelas) || 1,
    });
  }

  // maestro
  return post<McResult>("/calcular/simples", {
    valor,
    bandeira: "maestro",
    tipo_cartao: form.tipo_cartao,
    canal: form.canal_mc,
    mcc: form.mcc ? parseInt(form.mcc) : undefined,
    categoria: form.categoria || undefined,
  });
}

// ─── MCBS ─────────────────────────────────────────────────────────────────────
export const fetchMcbsFees = () => get<any>("/mcbs/fees");
