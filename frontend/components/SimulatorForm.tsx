"use client";

import type { SimForm, Bandeira } from "@/lib/types";

interface Props {
  form: SimForm;
  onChange: (f: SimForm) => void;
  onSubmit: () => void;
  loading: boolean;
}

const PRODUTOS_VISA = [
  { value: "classic",  label: "Classic (F^)" },
  { value: "gold",     label: "Gold (P^)" },
  { value: "platinum", label: "Platinum (N^)" },
  { value: "infinite", label: "Infinite (I^)" },
  { value: "hnw",      label: "Infinite Privilege / HNW (I1)" },
  { value: "signature",label: "Signature (C^)" },
  { value: "electron", label: "Visa Electron (L^)" },
  { value: "business", label: "Business (K^)" },
  { value: "corporate",label: "Corporate (S^)" },
  { value: "b2b",      label: "B2B Virtual (X^)" },
  { value: "bndes",    label: "BNDES (S6)" },
  { value: "vale",     label: "Vale Alimentação/Refeição (J3)" },
  { value: "agro",     label: "Visa Agro (S4)" },
];

const CANAIS_VISA = [
  { value: "fisico", label: "Físico / Chip" },
  { value: "contactless", label: "Contactless / NFC" },
  { value: "ecommerce", label: "E-commerce (sem 3DS)" },
  { value: "ecommerce_3ds", label: "E-commerce + 3DS / Visa Secure" },
];

const TIPOS_MC = [
  { value: "standard", label: "Standard / Classic" },
  { value: "gold", label: "Gold" },
  { value: "platinum", label: "Platinum" },
  { value: "black", label: "Black / Infinite / Signature" },
];

const CANAIS_MC = [
  { value: "fisico", label: "Físico / Chip" },
  { value: "contactless", label: "Contactless / NFC" },
  { value: "ecommerce", label: "E-commerce" },
  { value: "ecommerce_3ds", label: "E-commerce Frictionless (3DS)" },
  { value: "qr", label: "QR Code" },
];

const CATEGORIAS = [
  { value: "", label: "— ou use MCC direto —" },
  { value: "restaurante", label: "Restaurante (5812)" },
  { value: "lanchonete", label: "Lanchonete (5814)" },
  { value: "supermercado", label: "Supermercado (5411)" },
  { value: "atacado", label: "Atacado (5300)" },
  { value: "farmacia", label: "Farmácia (5912)" },
  { value: "posto", label: "Posto / Combustível (5541)" },
  { value: "educacao", label: "Educação (8299)" },
  { value: "saude", label: "Saúde / Médico (8099)" },
  { value: "hotel", label: "Hotel (7011)" },
  { value: "transporte", label: "Transporte (4111)" },
  { value: "governo", label: "Governo (9311)" },
  { value: "vestuario", label: "Vestuário (5621)" },
  { value: "eletronico", label: "Eletrônico (5732)" },
];

export function SimulatorForm({ form, onChange, onSubmit, loading }: Props) {
  function set<K extends keyof SimForm>(key: K, value: SimForm[K]) {
    onChange({ ...form, [key]: value });
  }

  const isVisa = form.bandeira === "visa";
  const isMaestro = form.bandeira === "maestro";

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); onSubmit(); }}
      className="space-y-5"
    >
      {/* Bandeira */}
      <Field label="Bandeira">
        <div className="grid grid-cols-3 gap-2">
          {(["visa", "mastercard", "maestro"] as Bandeira[]).map((b) => (
            <button
              key={b}
              type="button"
              onClick={() => set("bandeira", b)}
              className={`rounded-lg border py-2.5 text-sm font-semibold capitalize transition-all ${
                form.bandeira === b
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-input text-muted-foreground hover:border-input-border hover:text-foreground"
              }`}
            >
              {b}
            </button>
          ))}
        </div>
      </Field>

      {/* Valor */}
      <Field label="Valor da transação (R$)">
        <input
          type="number"
          step="0.01"
          min="0.01"
          placeholder="200,00"
          value={form.valor}
          onChange={(e) => set("valor", e.target.value)}
          className="input-base"
          required
        />
      </Field>

      {/* ─── Campos Visa ─────────────────────────────────────────────────── */}
      {isVisa && (
        <>
          <Field label="Produto / PID">
            <Select
              value={form.produto_visa}
              onChange={(v) => set("produto_visa", v)}
              options={PRODUTOS_VISA}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Funding Source">
              <Select
                value={form.afs}
                onChange={(v) => set("afs", v)}
                options={[
                  { value: "credito", label: "Crédito (C)" },
                  { value: "debito", label: "Débito (D)" },
                ]}
              />
            </Field>
            <Field label="Parcelas">
              <input
                type="number"
                min="1"
                max="36"
                value={form.parcelas}
                onChange={(e) => set("parcelas", e.target.value)}
                className="input-base"
              />
            </Field>
          </div>

          <Field label="Canal">
            <Select
              value={form.canal_visa}
              onChange={(v) => set("canal_visa", v)}
              options={CANAIS_VISA}
            />
          </Field>

          <div className="flex items-center gap-3 rounded-lg border border-border bg-input px-3 py-2.5">
            <input
              id="internacional"
              type="checkbox"
              checked={form.internacional}
              onChange={(e) => set("internacional", e.target.checked)}
              className="h-4 w-4 rounded accent-primary"
            />
            <label htmlFor="internacional" className="text-sm text-foreground cursor-pointer">
              Transação internacional (SETTL_FLAG=0)
            </label>
          </div>
        </>
      )}

      {/* ─── Campos Mastercard / Maestro ─────────────────────────────────── */}
      {!isVisa && (
        <>
          {!isMaestro && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Tipo de cartão">
                  <Select
                    value={form.tipo_cartao}
                    onChange={(v) => set("tipo_cartao", v)}
                    options={TIPOS_MC}
                  />
                </Field>
                <Field label="Pessoa">
                  <Select
                    value={form.pessoa}
                    onChange={(v) => set("pessoa", v)}
                    options={[
                      { value: "fisica", label: "Física (PF)" },
                      { value: "juridica", label: "Jurídica (PJ)" },
                    ]}
                  />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Produto">
                  <Select
                    value={form.tipo_produto}
                    onChange={(v) => set("tipo_produto", v)}
                    options={[
                      { value: "CREDIT", label: "Crédito" },
                      { value: "DEBIT", label: "Débito" },
                    ]}
                  />
                </Field>
                <Field label="Parcelas">
                  <input
                    type="number"
                    min="1"
                    max="36"
                    value={form.parcelas}
                    onChange={(e) => set("parcelas", e.target.value)}
                    className="input-base"
                  />
                </Field>
              </div>
            </>
          )}

          <Field label="Canal">
            <Select
              value={form.canal_mc}
              onChange={(v) => set("canal_mc", v)}
              options={CANAIS_MC}
            />
          </Field>
        </>
      )}

      {/* ─── MCC / Categoria (comum) ──────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3">
        <Field label="Categoria do estabelecimento">
          <Select
            value={form.categoria}
            onChange={(v) => set("categoria", v)}
            options={CATEGORIAS}
          />
        </Field>
        <Field label="MCC (código direto)">
          <input
            type="text"
            placeholder="ex: 5812"
            value={form.mcc}
            onChange={(e) => set("mcc", e.target.value)}
            className="input-base font-mono"
          />
        </Field>
      </div>

      {/* Debug toggle — cascata só funciona para Visa */}
      {isVisa && (
        <div className="flex items-center gap-3 rounded-lg border border-border bg-input px-3 py-2">
          <input
            id="debug"
            type="checkbox"
            checked={form.debug}
            onChange={(e) => set("debug", e.target.checked)}
            className="h-4 w-4 rounded accent-primary"
          />
          <label htmlFor="debug" className="text-xs text-muted-foreground cursor-pointer">
            Mostrar cascata completa de avaliação
          </label>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full disabled:opacity-50"
      >
        {loading ? "Calculando…" : "Calcular intercâmbio →"}
      </button>
    </form>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        {label}
      </label>
      {children}
    </div>
  );
}

function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="input-base"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
