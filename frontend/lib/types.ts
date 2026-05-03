// ─── Tipos compartilhados entre frontend e API ───────────────────────────────

export type Bandeira = "visa" | "mastercard" | "maestro" | "elo";

// ─── Health / Reload ──────────────────────────────────────────────────────────
export interface HealthResponse {
  status: string;
  version: string;
  regras_mastercard: number;
  regras_maestro: number;
  regras_visa: number;
  taxas_base: number;
  loaded_at: number;
}

// ─── Cascata ──────────────────────────────────────────────────────────────────
export interface CascataStep {
  priority: number;
  rule_id: string;
  descriptor?: string;
  description?: string;
  result: boolean;
}

// ─── Resultado Visa ───────────────────────────────────────────────────────────
export interface VisaResult {
  sucesso: boolean;
  bandeira: "visa";
  rule_id?: string;
  descriptor?: string;
  accounting_sign?: string;
  prioridade?: number;
  rate_pct?: number;
  fixed_fee?: number;
  cap_fee?: number;
  valor_transacao?: number;
  taxa_intercambio?: number;
  taxa_intercambio_fmt?: string;
  cap_aplicado?: boolean;
  cascata?: CascataStep[];
  aviso?: string;
  erro?: string;
}

// ─── Resultado Mastercard / Maestro ──────────────────────────────────────────
export interface McResult {
  sucesso: boolean;
  bandeira: string;
  rule_id?: string;
  ird?: string;
  pseudo_ird?: string;
  descricao_regra?: string;
  segment?: string;
  tier?: string;
  rate_pct?: number;
  valor_transacao?: number;
  taxa_intercambio?: number;
  taxa_intercambio_fmt?: string;
  cap_aplicado?: boolean;
  cascata?: CascataStep[];
  prioridade_regra?: number;
  cap_brl?: number;
  erro?: string;
}

export type CalcResult = VisaResult | McResult;

// ─── Formulário de simulação ──────────────────────────────────────────────────
export interface SimForm {
  bandeira: Bandeira;
  valor: string;
  // Visa
  produto_visa: string;
  afs: string;
  canal_visa: string;
  mcc: string;
  categoria: string;
  parcelas: string;
  eci: string;
  internacional: boolean;
  // Mastercard
  tipo_cartao: string;
  canal_mc: string;
  pessoa: string;
  tipo_produto: string;
  // Margem e Provisionamento
  mdr?: string;
  scheme_fee?: string;
  // Debug
  debug: boolean;
}

// ─── Regras carregadas ────────────────────────────────────────────────────────
export interface VisaRule {
  rule_id: string;
  priority: number;
  descriptor: string;
  accounting_sign: string;
  rate_pct: number;
  fixed_fee: number;
  cap_fee: number;
  expression: string;
  aviso?: string;
}

export interface McRule {
  rule_id: number;
  ird: string;
  priority: number;
  description: string;
}
