import type { Metadata } from 'next';
import MatrixClient from './MatrixClient';
import { ModuleTeachDemoHeader } from '@/components/ModuleTeachDemoHeader';

export const metadata: Metadata = {
  title: 'Matriz de Intercâmbio — Decisão de Taxa | VS Payments',
  description:
    'Árvore de decisão completa do intercâmbio Visa e Mastercard (1. Ensinar) e guia prático anti-downgrade por campo de clearing (2. Demonstrar).',
};

export default function MatrixPage() {
  return (
    <div className="bg-background min-h-screen">
      <ModuleTeachDemoHeader
        backHref="/trilhas"
        backLabel="Voltar para Jornada por Produto"
        categoryPill="Qualificação & Anti-Downgrade"
        normativeBadge="Visa Base II (FPI/PID) · Mastercard IPM (PDS 0158 IRD)"
        title="Matriz de Decisão de Intercâmbio & Guia Anti-Downgrade"
        subtitle="Explore a cascata de qualificação Visa e Mastercard passo a passo: Produto, Canal, Autenticação 3DS/Token, MCC e Prazos de Envio (Timeliness)."
        teachConcept="A tarifa de intercâmbio não é escolhida manualmente: ela é o resultado determinístico de uma árvore de validação executada no clearing sobre os campos enviados pela adquirente."
        teachRule="Visa Base II Edit Package (Field 61.5 AFS / PID / ECI / Fee Program Indicator) & Mastercard GCMS IPM (DE 48 / PDS 0158 IRD / Timeliness)."
        teachPitfall="Perder a janela de Timeliness (envio do clearing após o prazo D+1/D+2 do produto) ou omitir o Token Assurance Level rebaixa a venda para um IRD/FPI Standard de penalidade."
        demoSteps={[
          "1. Alterne abaixo entre Visa (Base II) e Mastercard (IPM) para comparar os 5 degraus da cascata de qualificação.",
          "2. Inspecione a tabela de MCCs preferenciais e a matriz de códigos IRD (Mastercard) e Rate Qualifiers (Visa).",
          "3. Clique em 'Consultar nos 4 Bancos SQLite do Acervo' para auditar qualquer IRD (ex: BR,BS,BT,DS,TE) ou FPI nos 4 bancos SQLite.",
        ]}
        acervoQuery="Matriz intercâmbio IRD PDS 0158 Visa Base II FPI PID Timeliness downgrade"
        lab3dHref="/simulador"
        lab3dLabel="Abrir Calculadora de Cascata (2.103 Regras)"
      />
      <MatrixClient />
    </div>
  );
}
