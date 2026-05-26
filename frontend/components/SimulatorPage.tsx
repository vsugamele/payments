"use client";

import { useEffect, useState } from "react";
import { Activity } from "lucide-react";
import { calcular, fetchHealth } from "@/lib/api";
import type { CalcResult, HealthResponse, SimForm } from "@/lib/types";
import { SimulatorForm } from "./SimulatorForm";
import { ResultCard } from "./ResultCard";
import { Cascata } from "./Cascata";
import { ReloadButton } from "./ReloadButton";
import { DecisionPath } from "./DecisionPath";
import { ProvisioningWaterfall } from "./ProvisioningWaterfall";
import { CustoTotalCard } from "./CustoTotalCard";
import eloData from "@/data/elo-interchange.json";

const DEFAULT_FORM: SimForm = {
  bandeira: "visa",
  valor: "200",
  pan: "",
  // Visa
  produto_visa: "platinum",
  afs: "credito",
  canal_visa: "ecommerce_3ds",
  mcc: "",
  categoria: "restaurante",
  parcelas: "1",
  eci: "",
  internacional: false,
  // Mastercard / Elo
  tipo_cartao: "platinum",
  canal_mc: "ecommerce_3ds",
  pessoa: "fisica",
  tipo_produto: "CREDIT",
  // Margem
  mdr: "2.50",
  scheme_fee: "0.25",
  // Debug
  debug: true,
};

export function SimulatorPage() {
  const [form, setForm] = useState<SimForm>(DEFAULT_FORM);
  const [result, setResult] = useState<CalcResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [health, setHealth] = useState<HealthResponse | null>(null);

  // Carrega health ao montar
  useEffect(() => {
    fetchHealth()
      .then(setHealth)
      .catch(() => {});
  }, []);

  // Limpa resultado ao trocar bandeira para evitar confusão
  useEffect(() => {
    setResult(null);
    setError("");
    if (form.bandeira === "elo") {
      setForm(prev => ({ ...prev, tipo_cartao: "debito", canal_mc: "fisico" }));
    }
  }, [form.bandeira]);

  async function handleSubmit() {
    setLoading(true);
    setError("");
    setResult(null);
    try {
      if (form.bandeira === "elo") {
        // Lógica Local Elo
        const valor = Number(form.valor);
        const produtoStr = form.tipo_cartao === "debito" ? "Elo Débito" : 
                          form.tipo_cartao === "mais" ? "Elo Mais (Crédito)" :
                          form.tipo_cartao === "grafite" ? "Elo Grafite" :
                          "Elo Nanquim / Diners";
        
        const canalLabel = form.canal_mc === "fisico" ? "Físico (Chip)" :
                          form.canal_mc === "ecommerce_3ds" ? "E-commerce (com 3DS)" :
                          "E-commerce (sem 3DS)";

        const produtoData = eloData.find(p => p.produto === produtoStr);
        const segmento = produtoData?.segmentos[0];
        const canalData = segmento?.canais.find(c => c.canal === canalLabel);

        if (canalData) {
          const ic_brl = (canalData.taxa / 100) * valor;
          setResult({
            sucesso: true,
            bandeira: "elo",
            rule_id: `ELO-${form.tipo_cartao.toUpperCase()}`,
            descricao_regra: `Regra Elo Brasil: ${produtoStr} / ${canalLabel}`,
            rate_pct: canalData.taxa,
            valor_transacao: valor,
            taxa_intercambio: ic_brl,
            taxa_intercambio_fmt: `R$ ${ic_brl.toFixed(2)}`,
          } as any);
        } else {
          throw new Error("Combinação de produto/canal Elo não mapeada.");
        }
      } else {
        const r = await calcular(form);
        setResult(r);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  }

  // Extrai cascata do resultado (Visa tem, MC não tem nesta versão)
  const cascata =
    result && "cascata" in result ? result.cascata ?? [] : [];
  const winnerRuleId =
    result?.sucesso
      ? ("rule_id" in result
          ? (result as { rule_id?: string }).rule_id
          : (result as { ird?: string }).ird) ?? ""
      : "";

  return (
    <div className="pb-16">
      {/* ── Painel de Health / Engine Status ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-border">
          <div>
            <h3 className="text-sm font-semibold text-white">Engine Server</h3>
            <p className="text-xs mt-0.5" style={{ color: "var(--border)" }}>
              Motor FastAPI em localhost:8000
            </p>
          </div>
          <ReloadButton health={health} onReload={setHealth} />
      </div>

      {/* ── Layout principal ──────────────────────────────────────────────── */}
      <div>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* ── Painel esquerdo: formulário ─────────────────────────────── */}
          <div>
            <div
              style={{
                background: "#131920",
                border: "1px solid #1e293b",
                borderRadius: "0.75rem",
                padding: "1.5rem",
              }}
            >
              <h2
                className="text-sm font-semibold mb-5"
                style={{ color: "var(--muted-foreground)" }}
              >
                Parâmetros da transação
              </h2>
              <SimulatorForm
                form={form}
                onChange={setForm}
                onSubmit={handleSubmit}
                loading={loading}
              />
            </div>
          </div>

          {/* ── Painel direito: resultados ──────────────────────────────── */}
          <div className="space-y-5 lg:sticky lg:top-8 lg:self-start">
            {/* Estado vazio */}
            {!result && !error && !loading && (
              <div
                style={{
                  background: "#131920",
                  border: "1px solid #1e293b",
                  borderRadius: "0.75rem",
                  padding: "3rem 1.5rem",
                  textAlign: "center",
                }}
              >
                <Activity
                  size={32}
                  style={{ color: "#1e3a5f", margin: "0 auto 0.75rem" }}
                />
                <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                  Preencha os parâmetros e clique em{" "}
                  <strong style={{ color: "var(--muted-foreground)" }}>
                    Calcular intercâmbio
                  </strong>
                </p>
              </div>
            )}

            {/* Erro de conexão */}
            {error && (
              <div
                style={{
                  background: "#1a0a0a",
                  border: "1px solid #7f1d1d",
                  borderRadius: "0.75rem",
                  padding: "1rem 1.25rem",
                }}
              >
                <p className="text-sm font-semibold" style={{ color: "#fca5a5" }}>
                  Erro ao calcular
                </p>
                <p className="text-xs mt-1" style={{ color: "#f87171" }}>
                  {error}
                </p>
                <p className="text-xs mt-2" style={{ color: "#6b7280" }}>
                  Verifique se o backend FastAPI está rodando em{" "}
                  <code style={{ color: "var(--muted-foreground)" }}>localhost:8000</code>
                </p>
              </div>
            )}

            {/* Loading skeleton */}
            {loading && (
              <div
                style={{
                  background: "#131920",
                  border: "1px solid #1e293b",
                  borderRadius: "0.75rem",
                  padding: "1.5rem",
                }}
                className="animate-pulse space-y-4"
              >
                <div
                  style={{
                    height: "1rem",
                    background: "var(--input)",
                    borderRadius: "0.25rem",
                    width: "40%",
                  }}
                />
                <div className="grid grid-cols-3 gap-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      style={{
                        height: "4.5rem",
                        background: "var(--input)",
                        borderRadius: "0.5rem",
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Resultado */}
            {result && !loading && <ResultCard result={result} />}

            {/* Custo Total (IC + Scheme Fee + Markup) — apenas Mastercard/Maestro */}
            {result && !loading && result.sucesso &&
              (form.bandeira === "mastercard" || form.bandeira === "maestro") && (
              <CustoTotalCard
                valor={result.valor_transacao ?? Number(form.valor)}
                taxa_ic_pct={result.rate_pct ?? 0}
                taxa_ic_brl={result.taxa_intercambio ?? 0}
                ird={(result as any).ird ?? "IA"}
                canal={form.canal_mc ?? "fisico"}
                bandeira={form.bandeira}
              />
            )}

            {/* "Por que esta taxa?" — caminho de decisão de 5 passos */}
            {result && !loading && result.sucesso && (
              <DecisionPath form={form} result={result} />
            )}

            {/* Simulador de Spread (Waterfall) */}
            {result && !loading && result.sucesso && form.mdr && form.scheme_fee && (
              <ProvisioningWaterfall
                valorTransacao={result.valor_transacao ?? Number(form.valor)}
                mdrPct={Number(form.mdr)}
                interchangePct={result.taxa_intercambio ?? 0}
                schemeFeePct={Number(form.scheme_fee)}
                bandeira={form.bandeira}
              />
            )}

            {result && !loading && form.debug && cascata.length === 0 && !error && (
              <div
                style={{
                  border: "1px solid #1e3a5f",
                  borderRadius: "0.75rem",
                  padding: "0.875rem 1.25rem",
                  background: "#0d1929",
                }}
              >
                <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                  💡 Cascata vazia. Tente ativar o modo debug ou recarregar as tabelas.
                </p>
              </div>
            )}
            {cascata.length > 0 && !loading && (
              <Cascata steps={cascata} winnerRuleId={winnerRuleId} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
