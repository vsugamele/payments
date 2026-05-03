"use client";

import { useState } from "react";
import { ShieldCheck, ShieldAlert, Fingerprint, RefreshCw, CreditCard, Info, Smartphone, Zap } from "lucide-react";
import AIAssistant from "./AIAssistant";

export default function DafSimulator() {
  const [source, setSource] = useState("manual_pan");
  const [dafRegistered, setDafRegistered] = useState(false);
  const [firstTx, setFirstTx] = useState(true);

  const getDiagnostics = () => {
    const res: { type: string; icon: React.ReactNode; title: string; msg: string }[] = [];

    if (source === "manual_pan") {
      res.push({
        type: "danger",
        icon: <CreditCard className="text-red-500" />,
        title: "PAN em Claro (Digitado/Guest Checkout)",
        msg: "Transação de altíssimo risco. Sem autenticação (3DS via ACS), todo o risco de Chargeback por fraude cai sob o Lojista/Adquirente. Intercâmbio será o pior cenário (Base/Standard).",
      });
      if (dafRegistered) {
        res.push({
          type: "warning",
          icon: <Info className="text-yellow-500" />,
          title: "DAF inativo para PAN em Claro",
          msg: "Você se registrou no DAF, mas o Digital Authentication Framework exige Tokens (VTS ou Device) ou EMV 3-D Secure. PAN puro não tem benefícios do DAF.",
        });
      }
    }

    if (source === "apple_google_pay") {
      res.push({
        type: "success",
        icon: <Fingerprint className="text-green-500" />,
        title: "Device Token (DPAN) + Device Biometrics",
        msg: "A autenticação acontece via biometria do celular (Touch/Face ID) originando o criptograma TAV (Token Authentication Verification). O DPAN é vinculado ao device e impossível de clonar remotamente.",
      });
      res.push({
        type: "success",
        icon: <ShieldCheck className="text-green-500" />,
        title: "Liability Shift Imediato & Isenção de 3DS",
        msg: "A transação recebe Liability Shift sem passar por 3DS externo (Frictionless nativo via DAF). As taxas de intercâmbio seguem a trilha preferencial TAF (Tokenized Authentication Framework).",
      });
    }

    if (source === "cloud_token") {
      if (!dafRegistered) {
        res.push({
          type: "warning",
          icon: <RefreshCw className="text-yellow-500" />,
          title: "Token Armazenado (COF) Sem Registro DAF",
          msg: "Você usa Card-on-File Tokenizado (VTS/MDES), que melhora a aprovação com criptograma TR, mas sem DAF você ainda corre risco de Chargeback a menos que injete 3DS em cada compra.",
        });
      } else {
        if (firstTx) {
          res.push({
            type: "warning",
            icon: <ShieldAlert className="text-yellow-500" />,
            title: "Primeira Transação DAF (Device Binding)",
            msg: "Para ativar a delegação DAF, a PRIMEIRA transação no dispositivo deve obrigatoriamente ter um Step-up 3DS Challenge ou OTP. Uma vez autenticado, o Token recebe Bind na plataforma.",
          });
        } else {
          res.push({
            type: "success",
            icon: <ShieldCheck className="text-green-500" />,
            title: "DAF Ativo: Zero Fricção nas Futuras Transações",
            msg: "Como a primeira transação já autenticou, o DAF cobre ESTA transação com Liability Shift TOTAL para o Banco — MESMO SEM PASSAR PELO 3DS novamente. Melhor conversão + proteção máxima.",
          });
        }
      }
    }

    if (source === "pix_openfinance") {
      res.push({
        type: "warning",
        icon: <Smartphone className="text-blue-400" />,
        title: "PIX via Open Finance — Iniciação por Terceiro",
        msg: "O Open Finance permite que um lojista (Iniciador de Pagamento - IP) inicie um PIX em nome do portador via API do Bacen. Isso NÃO usa a rede da bandeira (Visa/MC), portanto as regras de DAF e 3DS não se aplicam aqui.",
      });
      res.push({
        type: "warning",
        icon: <Info className="text-blue-400" />,
        title: "Sem Rede de Bandeira = Sem Chargeback Tradicional",
        msg: "Transações PIX via Open Finance não geram chargebacks no framework Mastercard/Visa. A disputa é resolvida via mecanismo de devolução do Bacen (MED — Mecanismo Especial de Devolução). Regras completamente diferentes.",
      });
      if (dafRegistered) {
        res.push({
          type: "danger",
          icon: <Zap className="text-orange-400" />,
          title: "DAF NÃO se aplica a PIX/Open Finance",
          msg: "O DAF é exclusivo da infraestrutura Visa/Mastercard. Transações PIX — mesmo iniciadas via Open Finance — passam pela infraestrutura do Banco Central (SPI), que tem seu próprio framework de autenticação (FIDO2 / biometria do app bancário).",
        });
      }
    }

    return res;
  };

  const results = getDiagnostics();

  return (
    <div className="flex flex-col xl:flex-row gap-8 items-start w-full mt-4">
      {/* Painel de Configuração */}
      <div className="w-full xl:w-5/12 bg-input p-6 rounded-2xl border border-border flex flex-col gap-6">
        <h2 className="text-foreground font-semibold text-xl">Configuração do Fluxo</h2>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-foreground">1. Origem da Credencial</label>
          <select
            value={source}
            onChange={e => setSource(e.target.value)}
            className="input-base bg-background p-3 rounded-lg text-foreground border border-border outline-none focus:border-primary transition-colors"
          >
            <option value="manual_pan">Cartão Digitado (Guest Checkout — PAN Puro)</option>
            <option value="cloud_token">Cartão Salvo Tokenizado (Cloud Token / VTS / MDES)</option>
            <option value="apple_google_pay">Apple Pay / Google Pay (Device Token DPAN)</option>
            <option value="pix_openfinance">PIX via Open Finance (Iniciador de Pagamento)</option>
          </select>
        </div>

        {source === "pix_openfinance" && (
          <div className="flex flex-col gap-2 p-4 bg-blue-500/5 rounded-lg border border-blue-500/20">
            <div className="flex items-center gap-2 text-blue-400">
              <Smartphone size={16} />
              <p className="text-sm font-bold text-blue-400">Open Finance — Bacen Framework</p>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              O Open Finance permite que Iniciadores de Pagamento (IPs) iniciem PIX na conta bancária do cliente via API do Banco Central. Não usa infraestrutura Visa/MC.
            </p>
          </div>
        )}

        {source === "cloud_token" && (
          <div className="flex flex-col gap-2 p-4 bg-background rounded-lg border border-border">
            <label className="flex items-center gap-3 cursor-pointer text-foreground text-sm font-medium">
              <input
                type="checkbox"
                checked={firstTx}
                onChange={e => setFirstTx(e.target.checked)}
                className="w-5 h-5 text-primary bg-input border-border rounded"
              />
              Primeira compra com o dispositivo/token neste lojista?
            </label>
            <p className="text-xs text-muted-foreground ml-8">O fluxo varia caso seja um &quot;retorno&quot; (Returning Customer) com token já pareado.</p>
          </div>
        )}

        {source !== "pix_openfinance" && (
          <div className="flex flex-col gap-2 p-4 bg-background rounded-lg border border-border">
            <label className="flex items-center gap-3 cursor-pointer text-foreground text-sm font-medium">
              <input
                type="checkbox"
                checked={dafRegistered}
                onChange={e => setDafRegistered(e.target.checked)}
                className="w-5 h-5 text-primary bg-input border-border rounded"
              />
              Lojista Aderente ao DAF da Bandeira
            </label>
            <p className="text-xs text-muted-foreground ml-8 leading-relaxed">
              O Digital Authentication Framework (DAF) é um acordo de delegação de autenticação oferecido por Visa e Mastercard para grandes varejos isentarem atrito de checkout.
            </p>
          </div>
        )}

        {source === "pix_openfinance" && (
          <div className="flex flex-col gap-2 p-4 bg-background rounded-lg border border-border">
            <label className="flex items-center gap-3 cursor-pointer text-foreground text-sm font-medium">
              <input
                type="checkbox"
                checked={dafRegistered}
                onChange={e => setDafRegistered(e.target.checked)}
                className="w-5 h-5 text-primary bg-input border-border rounded"
              />
              Lojista também aceita cartões (além de PIX)?
            </label>
            <p className="text-xs text-muted-foreground ml-8 leading-relaxed">
              Habilita comparação entre o framework PIX/Bacen e o DAF das bandeiras.
            </p>
          </div>
        )}
      </div>

      {/* Painel de Diagnósticos */}
      <div className="w-full xl:w-7/12 flex flex-col gap-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-sm uppercase tracking-wider text-muted-foreground font-semibold">
            Liability Shift & UX Diagnosis
          </h3>
          <AIAssistant
            toolName="Simulador DAF"
            triggerLabel="Consultar Manuais"
            context={`Origem: ${source}, DAF Registrado: ${dafRegistered}, Primeira Transação: ${firstTx}. Diagnóstico atual: ${results.map(r => r.title).join("; ")}`}
            placeholder="Como o DAF impacta o intercâmbio neste caso?"
          />
        </div>
        <div className="flex flex-col gap-4">
          {results.map((res, i) => {
            let bg = "bg-input";
            let border = "border-border";
            if (res.type === "danger") { bg = "bg-red-500/10"; border = "border-red-500/30"; }
            else if (res.type === "success") { bg = "bg-green-500/10"; border = "border-green-500/30"; }
            else if (res.type === "warning") { bg = "bg-yellow-500/10"; border = "border-yellow-500/30"; }
            return (
              <div key={i} className={`flex gap-4 p-5 rounded-2xl border ${bg} ${border} items-start transition-all`}>
                <div className="mt-0.5 shrink-0 bg-background/50 p-2 rounded-full ring-1 ring-border shadow-sm">
                  {res.icon}
                </div>
                <div>
                  <h4 className="font-semibold text-foreground text-md mb-2">{res.title}</h4>
                  <p className="text-muted-foreground text-sm leading-relaxed">{res.msg}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
