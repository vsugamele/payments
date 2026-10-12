"use client";

import React, { useState } from "react";
import {
  Layers,
  Table as TableIcon,
  ShieldAlert,
  Calendar,
  FileCheck2,
  AlertCircle,
  HelpCircle,
  Check,
  Plus,
  X,
  Sparkles,
} from "lucide-react";

export interface SnippetItem {
  id: string;
  category: "tabelas" | "impacto" | "datas" | "alertas" | "compliance";
  title: string;
  description: string;
  badge: string;
  html: string;
}

export const SNIPPETS_CATALOG: SnippetItem[] = [
  {
    id: "tabela_campos_iso",
    category: "tabelas",
    title: "Tabela Técnica de Campos ISO 8583 / IPM",
    description: "Estrutura completa com DE, Subcampo, Presença (M/C/O), Formato e Ação de Engenharia.",
    badge: "Engenharia",
    html: `
      <div style="margin:1.5rem 0; overflow-x:auto;">
        <table style="width:100%; border-collapse:collapse; font-size:12.5px; font-family:system-ui, -apple-system, sans-serif;">
          <thead>
            <tr style="background:#0f2c59; color:#ffffff;">
              <th style="padding:10px 12px; text-align:left; border:1px solid #1e3a8a; width:100px;">Campo (DE)</th>
              <th style="padding:10px 12px; text-align:left; border:1px solid #1e3a8a; width:110px;">Subcampo</th>
              <th style="padding:10px 12px; text-align:center; border:1px solid #1e3a8a; width:90px;">Presença</th>
              <th style="padding:10px 12px; text-align:left; border:1px solid #1e3a8a; width:90px;">Formato</th>
              <th style="padding:10px 12px; text-align:left; border:1px solid #1e3a8a;">Definição & Validação Operacional</th>
            </tr>
          </thead>
          <tbody>
            <tr style="background:#ffffff; border-bottom:1px solid #cbd5e1;">
              <td style="padding:8px 12px; font-family:monospace; font-weight:bold; color:#1e40af;">DE 003</td>
              <td style="padding:8px 12px; font-family:monospace; color:#475569;">SF1 (Tipo Tx)</td>
              <td style="padding:8px 12px; text-align:center;"><span style="background:#dcfce7; color:#166534; font-weight:bold; padding:2px 6px; border-radius:4px; font-size:11px;">M</span></td>
              <td style="padding:8px 12px; font-family:monospace;">n 2</td>
              <td style="padding:8px 12px; color:#1e293b;">Processing Code. Valor <strong>20</strong> obrigatório em Purchase Return/Refund para evitar rejeição no Data Integrity.</td>
            </tr>
            <tr style="background:#f8fafc; border-bottom:1px solid #cbd5e1;">
              <td style="padding:8px 12px; font-family:monospace; font-weight:bold; color:#1e40af;">DE 039</td>
              <td style="padding:8px 12px; font-family:monospace; color:#475569;">—</td>
              <td style="padding:8px 12px; text-align:center;"><span style="background:#dcfce7; color:#166534; font-weight:bold; padding:2px 6px; border-radius:4px; font-size:11px;">M</span></td>
              <td style="padding:8px 12px; font-family:monospace;">an 2</td>
              <td style="padding:8px 12px; color:#1e293b;">Response Code. Emissores não podem retornar códigos 10, 12, 51 ou 57 em devoluções legítimas.</td>
            </tr>
            <tr style="background:#ffffff; border-bottom:1px solid #cbd5e1;">
              <td style="padding:8px 12px; font-family:monospace; font-weight:bold; color:#1e40af;">DE 048</td>
              <td style="padding:8px 12px; font-family:monospace; color:#475569;">SE 22 / PDS 22</td>
              <td style="padding:8px 12px; text-align:center;"><span style="background:#fef3c7; color:#92400e; font-weight:bold; padding:2px 6px; border-radius:4px; font-size:11px;">C</span></td>
              <td style="padding:8px 12px; font-family:monospace;">ans ...999</td>
              <td style="padding:8px 12px; color:#1e293b;">Private Data. Contém credenciais de 3DS CAVV / DAF. Ausência em e-commerce elegível acarreta downgrade de intercâmbio.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p></p>
    `,
  },
  {
    id: "quadro_impacto_atores",
    category: "impacto",
    title: "Quadro Comparativo: Adquirente vs Emissor",
    description: "Grid visual separando as responsabilidades de envio (adquirência) e resposta (emissão).",
    badge: "Papéis",
    html: `
      <div data-layout="dual-cards" class="dual-cards-grid" style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin:1.5rem 0; font-family:system-ui, -apple-system, sans-serif;">
        <!-- Card Adquirente -->
        <div style="background:#eff6ff; border:1px solid #bfdbfe; border-left:5px solid #2563eb; border-radius:12px; padding:16px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
            <strong style="color:#1e40af; font-size:14px; text-transform:uppercase; letter-spacing:0.5px;">🏦 Papel do Adquirente / Credenciador</strong>
            <span style="background:#2563eb; color:#ffffff; font-size:10px; font-weight:bold; padding:2px 8px; border-radius:99px;">Origem / Envio</span>
          </div>
          <p style="margin:0 0 10px 0; font-size:12px; color:#334155; line-height:1.5;">
            Responsável pela captura correta no ponto de venda e estruturação dos dados na mensagem de ida (0100/0200).
          </p>
          <ul style="margin:0; padding-left:18px; font-size:12px; color:#1e293b; line-height:1.6;">
            <li><strong>O que envia:</strong> Popular campos obrigatórios (DE 3, DE 22, DE 48).</li>
            <li><strong>Validação local:</strong> Rejeitar pré-autorização caso a tag de criptograma falhe.</li>
            <li><strong>Risco financeiro:</strong> Cobrança de non-compliance fee e downgrade para taxa padrão não-qualificada.</li>
          </ul>
        </div>

        <!-- Card Emissor -->
        <div style="background:#f0fdf4; border:1px solid #bbf7d0; border-left:5px solid #16a34a; border-radius:12px; padding:16px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
            <strong style="color:#166534; font-size:14px; text-transform:uppercase; letter-spacing:0.5px;">💳 Papel do Emissor / Banco</strong>
            <span style="background:#16a34a; color:#ffffff; font-size:10px; font-weight:bold; padding:2px 8px; border-radius:99px;">Destino / Resposta</span>
          </div>
          <p style="margin:0 0 10px 0; font-size:12px; color:#334155; line-height:1.5;">
            Responsável pela autorização do portador e fornecimento de código de resposta normativo na mensagem 0110.
          </p>
          <ul style="margin:0; padding-left:18px; font-size:12px; color:#1e293b; line-height:1.6;">
            <li><strong>O que valida:</strong> Conferir regras do programa e integridade de refund.</li>
            <li><strong>O que retorna:</strong> DE 39 de acordo com a tabela de motivos válidos da bandeira.</li>
            <li><strong>Risco financeiro:</strong> Inclusão em monitoria oficial de qualidade de autorização e liability shift.</li>
          </ul>
        </div>
      </div>
      <p></p>
    `,
  },
  {
    id: "cronograma_vigencias_badges",
    category: "datas",
    title: "Cronograma de Vigência com Badges & Fases",
    description: "Linha do tempo tabular para acompanhamento de datas de publicação, piloto e obrigatoriedade.",
    badge: "Prazos",
    html: `
      <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:12px; padding:16px; margin:1.5rem 0; font-family:system-ui, -apple-system, sans-serif;">
        <h4 style="margin:0 0 12px 0; color:#0f172a; font-size:13.5px; text-transform:uppercase; letter-spacing:0.5px;">
          📅 Marcos Cronológicos & Janelas de Implantação
        </h4>
        <table style="width:100%; border-collapse:collapse; font-size:12px;">
          <thead>
            <tr style="background:#1e293b; color:#ffffff;">
              <th style="padding:8px 12px; text-align:left; width:130px;">Data Limite</th>
              <th style="padding:8px 12px; text-align:center; width:120px;">Fase / Tipo</th>
              <th style="padding:8px 12px; text-align:left;">Evento Operacional</th>
              <th style="padding:8px 12px; text-align:left; width:160px;">Ação Obrigatória</th>
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom:1px solid #e2e8f0;">
              <td style="padding:8px 12px; font-weight:bold; color:#0f172a;">24/09/2026</td>
              <td style="padding:8px 12px; text-align:center;"><span style="background:#eff6ff; color:#1e40af; border:1px solid #bfdbfe; font-size:10.5px; font-weight:bold; padding:2px 8px; border-radius:99px;">Publicação</span></td>
              <td style="padding:8px 12px; color:#334155;">Divulgação oficial do boletim de regras técnicas pela bandeira.</td>
              <td style="padding:8px 12px; color:#64748b;">Leitura e triagem de impacto interno.</td>
            </tr>
            <tr style="border-bottom:1px solid #e2e8f0; background:#f8fafc;">
              <td style="padding:8px 12px; font-weight:bold; color:#0f172a;">01/11/2026</td>
              <td style="padding:8px 12px; text-align:center;"><span style="background:#fef3c7; color:#92400e; border:1px solid #fde68a; font-size:10.5px; font-weight:bold; padding:2px 8px; border-radius:99px;">Piloto / Testes</span></td>
              <td style="padding:8px 12px; color:#334155;">Abertura do ambiente de homologação e certificação bilateral.</td>
              <td style="padding:8px 12px; color:#2563eb; font-weight:bold;">Execução da suíte de testes em sandbox.</td>
            </tr>
            <tr style="border-bottom:1px solid #e2e8f0;">
              <td style="padding:8px 12px; font-weight:bold; color:#dc2626;">01/04/2027</td>
              <td style="padding:8px 12px; text-align:center;"><span style="background:#fee2e2; color:#b91c1c; border:1px solid #fecaca; font-size:10.5px; font-weight:bold; padding:2px 8px; border-radius:99px;">Mandatório</span></td>
              <td style="padding:8px 12px; color:#334155;">Entrada em vigor em produção global. Fim do período de transição.</td>
              <td style="padding:8px 12px; color:#dc2626; font-weight:bold;">Validação em produção (100% de tráfego).</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p></p>
    `,
  },
  {
    id: "alerta_penalidade_compliance",
    category: "alertas",
    title: "Caixa de Alerta: Risco de Penalidade & Assessment",
    description: "Callout corporativo de alta visibilidade com valores de multas e critérios de fiscalização.",
    badge: "Compliance",
    html: `
      <div style="background:#fef2f2; border:1px solid #fecaca; border-left:5px solid #dc2626; border-radius:12px; padding:16px 20px; margin:1.5rem 0; font-family:system-ui, -apple-system, sans-serif;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
          <div style="display:flex; align-items:center; gap:8px; color:#991b1b; font-weight:bold; font-size:13.5px;">
            <span>⚠️</span>
            <span>ALERTA DE COMPLIANCE & PENALIDADES FINANCEIRAS</span>
          </div>
          <span style="background:#dc2626; color:#ffffff; font-size:10px; font-weight:bold; padding:2px 8px; border-radius:4px; text-transform:uppercase;">Crítico</span>
        </div>
        <p style="margin:0 0 10px 0; color:#7f1d1d; font-size:12.5px; line-height:1.5;">
          A inobservância das diretrizes técnicas deste comunicado expõe a instituição a penalidades progressivas aplicadas mensalmente pela bandeira.
        </p>
        <div style="background:#ffffff; border:1px solid #fee2e2; border-radius:8px; padding:10px 14px; font-size:12px; color:#374151;">
          <div style="margin-bottom:4px;"><strong>Código da Tarifa de Penalidade:</strong> <span style="font-family:monospace; color:#dc2626; font-weight:bold;">2DC0100 / NONCOMPLIANCE-ASSESSMENT</span></div>
          <div style="margin-bottom:4px;"><strong>Impacto Financeiro Estimado:</strong> USD 2.500 no 1º mês, escalando até USD 25.000/mês por ICA recorrente.</div>
          <div><strong>Ação Mitigatória Imediata:</strong> Adequar a validação de regras antes do encerramento do prazo de comply-by e protocolar justificativa no portal oficial.</div>
        </div>
      </div>
      <p></p>
    `,
  },
  {
    id: "ficha_tecnica_release",
    category: "compliance",
    title: "Ficha Técnica de Release (Header Executivo)",
    description: "Quadro de cabeçalho corporativo com dados da EF, Bandeira, Público-alvo e Categoria.",
    badge: "Ficha",
    html: `
      <div style="background:#0f2c59; color:#ffffff; border-radius:12px; padding:20px; margin:1.5rem 0; font-family:system-ui, -apple-system, sans-serif;">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px; border-bottom:1px solid rgba(255,255,255,0.15); padding-bottom:12px;">
          <div>
            <span style="background:#2563eb; color:#ffffff; font-size:10px; font-weight:bold; padding:3px 8px; border-radius:4px; text-transform:uppercase;">Ficha Técnica Operacional</span>
            <h3 style="margin:6px 0 2px 0; font-size:18px; font-weight:800; color:#ffffff;">Boletim de Regras Técnicas das Bandeiras</h3>
            <span style="font-size:12px; color:#93c5fd;">Ref: EF-2026-RELEASE-MANDATE • Versão 2.1</span>
          </div>
          <span style="background:#16a34a; color:#ffffff; font-size:11px; font-weight:bold; padding:4px 10px; border-radius:99px;">Mandatório Global</span>
        </div>

        <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:12px; font-size:12px;">
          <div>
            <span style="color:#94a3b8; font-size:10px; text-transform:uppercase; font-weight:bold; display:block;">Bandeira:</span>
            <span style="font-weight:bold;">Mastercard & Visa</span>
          </div>
          <div>
            <span style="color:#94a3b8; font-size:10px; text-transform:uppercase; font-weight:bold; display:block;">Público Impactado:</span>
            <span style="font-weight:bold;">Adquirentes & Emissores</span>
          </div>
          <div>
            <span style="color:#94a3b8; font-size:10px; text-transform:uppercase; font-weight:bold; display:block;">Ambientes:</span>
            <span style="font-weight:bold;">Autorização & Clearing</span>
          </div>
          <div>
            <span style="color:#94a3b8; font-size:10px; text-transform:uppercase; font-weight:bold; display:block;">Criticidade:</span>
            <span style="color:#f87171; font-weight:bold;">Alta (Risco de Multa)</span>
          </div>
        </div>
      </div>
      <p></p>
    `,
  },
  {
    id: "reason_codes_disputa",
    category: "compliance",
    title: "Matriz de Reason Codes de Disputa & Chargeback",
    description: "Tabela prática para instrução de chargebacks, prazos de réplica e comprovações mínimas.",
    badge: "Disputas",
    html: `
      <div style="margin:1.5rem 0; overflow-x:auto;">
        <table style="width:100%; border-collapse:collapse; font-size:12px; font-family:system-ui, -apple-system, sans-serif;">
          <thead>
            <tr style="background:#1e293b; color:#ffffff;">
              <th style="padding:9px 12px; text-align:left; width:90px;">Código</th>
              <th style="padding:9px 12px; text-align:left; width:120px;">Bandeira</th>
              <th style="padding:9px 12px; text-align:left;">Motivo da Disputa</th>
              <th style="padding:9px 12px; text-align:center; width:90px;">Prazo</th>
              <th style="padding:9px 12px; text-align:left;">Documento Obrigatório de Defesa</th>
            </tr>
          </thead>
          <tbody>
            <tr style="background:#ffffff; border-bottom:1px solid #e2e8f0;">
              <td style="padding:8px 12px; font-family:monospace; font-weight:bold; color:#dc2626;">4837</td>
              <td style="padding:8px 12px; font-weight:bold;">Mastercard</td>
              <td style="padding:8px 12px;">Transação Não Reconhecida / Fraude sem Cartão Presente</td>
              <td style="padding:8px 12px; text-align:center; font-weight:bold;">30 dias</td>
              <td style="padding:8px 12px; color:#334155;">Log de autenticação 3DS com CAVV e ECI 05/02 ou comprovante de entrega no endereço cadastrado.</td>
            </tr>
            <tr style="background:#f8fafc; border-bottom:1px solid #e2e8f0;">
              <td style="padding:8px 12px; font-family:monospace; font-weight:bold; color:#dc2626;">10.4</td>
              <td style="padding:8px 12px; font-weight:bold;">Visa</td>
              <td style="padding:8px 12px;">Outra Fraude em Ambiente com Cartão Ausente (CNP)</td>
              <td style="padding:8px 12px; text-align:center; font-weight:bold;">30 dias</td>
              <td style="padding:8px 12px; color:#334155;">Evidência Compelling Evidence 3.0: 2 transações prévias idênticas sem disputa nos últimos 120 dias.</td>
            </tr>
            <tr style="background:#ffffff; border-bottom:1px solid #e2e8f0;">
              <td style="padding:8px 12px; font-family:monospace; font-weight:bold; color:#d97706;">4853</td>
              <td style="padding:8px 12px; font-weight:bold;">Mastercard</td>
              <td style="padding:8px 12px;">Mercadoria Não Entregue ou Serviços Defeituosos</td>
              <td style="padding:8px 12px; text-align:center; font-weight:bold;">45 dias</td>
              <td style="padding:8px 12px; color:#334155;">Comprovante de rastreamento com assinatura de entrega ou contrato assinado pelo cliente.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p></p>
    `,
  },
  {
    id: "checklist_engenharia_rollout",
    category: "impacto",
    title: "Checklist de Engenharia & Rollout (Do Spec ao Código)",
    description: "Roteiro técnico completo de 5 etapas: Análise de Campos, Migração DB, Switch Mensageria, Certificação Sandbox e Rollout Canário.",
    badge: "Engenharia",
    html: `
      <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:12px; padding:18px; margin:1.5rem 0; font-family:system-ui, -apple-system, sans-serif;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; border-bottom:1px solid #f1f5f9; padding-bottom:8px;">
          <h4 style="margin:0; color:#0f172a; font-size:14px; text-transform:uppercase; letter-spacing:0.5px; font-weight:800;">
            🛠️ Checklist de Engenharia & Rollout (Do Spec ao Código)
          </h4>
          <span style="background:#3b82f6; color:#ffffff; font-size:10px; font-weight:bold; padding:2px 8px; border-radius:99px;">Engineering Sprint</span>
        </div>
        <table style="width:100%; border-collapse:collapse; font-size:12px;">
          <thead>
            <tr style="background:#0f2c59; color:#ffffff;">
              <th style="padding:8px 10px; text-align:left; width:90px;">Fase</th>
              <th style="padding:8px 10px; text-align:left; width:170px;">Item / Entregável</th>
              <th style="padding:8px 10px; text-align:left;">Critério de Aceite & Validação</th>
              <th style="padding:8px 10px; text-align:center; width:90px;">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr style="background:#ffffff; border-bottom:1px solid #e2e8f0;">
              <td style="padding:8px 10px; font-weight:bold; color:#1e40af;">Fase 1: Spec</td>
              <td style="padding:8px 10px; font-weight:bold; color:#0f172a;">Mapeamento de DEs / Subcampos</td>
              <td style="padding:8px 10px; color:#334155;">Dicionário de dados atualizado com formato (ans, n, b), presenças (M/C/O) e regras de parsing.</td>
              <td style="padding:8px 10px; text-align:center;"><span style="background:#dcfce7; color:#166534; font-weight:bold; padding:2px 6px; border-radius:4px; font-size:10px;">CONCLUÍDO</span></td>
            </tr>
            <tr style="background:#f8fafc; border-bottom:1px solid #e2e8f0;">
              <td style="padding:8px 10px; font-weight:bold; color:#1e40af;">Fase 2: DB</td>
              <td style="padding:8px 10px; font-weight:bold; color:#0f172a;">Migração de Schema do Banco</td>
              <td style="padding:8px 10px; color:#334155;">Adição de colunas estruturadas para tags e identificadores (ex: AVS result, DAF token, CPF/CNPJ).</td>
              <td style="padding:8px 10px; text-align:center;"><span style="background:#dbeafe; color:#1e40af; font-weight:bold; padding:2px 6px; border-radius:4px; font-size:10px;">EM DEV</span></td>
            </tr>
            <tr style="background:#ffffff; border-bottom:1px solid #e2e8f0;">
              <td style="padding:8px 10px; font-weight:bold; color:#1e40af;">Fase 3: Switch</td>
              <td style="padding:8px 10px; font-weight:bold; color:#0f172a;">Parser ISO 8583 / IPM</td>
              <td style="padding:8px 10px; color:#334155;">Inclusão dos subcampos na montagem da mensagem de autorização (0100/0200) e repasse no clearing.</td>
              <td style="padding:8px 10px; text-align:center;"><span style="background:#fef3c7; color:#92400e; font-weight:bold; padding:2px 6px; border-radius:4px; font-size:10px;">PENDENTE</span></td>
            </tr>
            <tr style="background:#f8fafc; border-bottom:1px solid #e2e8f0;">
              <td style="padding:8px 10px; font-weight:bold; color:#1e40af;">Fase 4: QA</td>
              <td style="padding:8px 10px; font-weight:bold; color:#0f172a;">Certificação Bilateral / MTF</td>
              <td style="padding:8px 10px; color:#334155;">Simulação de 100% dos cenários de teste da bandeira no ambiente de homologação (Sandbox).</td>
              <td style="padding:8px 10px; text-align:center;"><span style="background:#f1f5f9; color:#475569; font-weight:bold; padding:2px 6px; border-radius:4px; font-size:10px;">AGUARDANDO</span></td>
            </tr>
            <tr style="background:#ffffff;">
              <td style="padding:8px 10px; font-weight:bold; color:#1e40af;">Fase 5: Rollout</td>
              <td style="padding:8px 10px; font-weight:bold; color:#0f172a;">Rollout Canário em Produção</td>
              <td style="padding:8px 10px; color:#334155;">Virada gradual de tráfego: 5% ➔ 20% ➔ 50% ➔ 100% com telemetria ativa de declines (DE 39).</td>
              <td style="padding:8px 10px; text-align:center;"><span style="background:#f1f5f9; color:#475569; font-weight:bold; padding:2px 6px; border-radius:4px; font-size:10px;">PLANEJADO</span></td>
            </tr>
          </tbody>
        </table>
      </div>
      <p></p>
    `,
  },
  {
    id: "cruzamento_interbandeiras",
    category: "impacto",
    title: "Matriz de Cruzamento Inter-Bandeiras (Benchmark Comparativo)",
    description: "Tabela comparativa cruzando requisitos idênticos entre Visa, Mastercard e Elo (Tokens, 3DS, Recusas e Prazos).",
    badge: "Cross-Scheme",
    html: `
      <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:12px; padding:18px; margin:1.5rem 0; font-family:system-ui, -apple-system, sans-serif;">
        <h4 style="margin:0 0 12px 0; color:#0f172a; font-size:14px; text-transform:uppercase; letter-spacing:0.5px; font-weight:800;">
          🌐 Matriz de Cruzamento Inter-Bandeiras (Visa vs Mastercard vs Elo)
        </h4>
        <table style="width:100%; border-collapse:collapse; font-size:12px;">
          <thead>
            <tr style="background:#0f2c59; color:#ffffff;">
              <th style="padding:8px 10px; text-align:left; width:130px;">Tópico Técnico</th>
              <th style="padding:8px 10px; text-align:left; width:28%;">Visa</th>
              <th style="padding:8px 10px; text-align:left; width:28%;">Mastercard</th>
              <th style="padding:8px 10px; text-align:left; width:28%;">Elo</th>
            </tr>
          </thead>
          <tbody>
            <tr style="background:#ffffff; border-bottom:1px solid #e2e8f0;">
              <td style="padding:8px 10px; font-weight:bold; color:#0f172a;">Autenticação E-Commerce</td>
              <td style="padding:8px 10px; color:#334155;"><strong>DAF / 3DS 2.2+:</strong> Tag DAF no F108. Liability shift imediato se autenticado.</td>
              <td style="padding:8px 10px; color:#334155;"><strong>Identity Check / Token:</strong> DE 48 SE 22 (CAVV) e PDS 0023. Programa Data Integrity Edit 30.</td>
              <td style="padding:8px 10px; color:#334155;"><strong>Elo 3DS Seguro:</strong> Layout ISO 8583 específico com repasse de ECI e validação no ACS nacional.</td>
            </tr>
            <tr style="background:#f8fafc; border-bottom:1px solid #e2e8f0;">
              <td style="padding:8px 10px; font-weight:bold; color:#0f172a;">Controle de Retries</td>
              <td style="padding:8px 10px; color:#334155;"><strong>Artigo 2.11:</strong> Stop retry obrigatório nos códigos 59, 82, 83. Limite de 15 retries em 30 dias.</td>
              <td style="padding:8px 10px; color:#334155;"><strong>Excessive Auth Attempts:</strong> Máximo de 35 tentativas em 30 dias. Multas progressivas por ICA.</td>
              <td style="padding:8px 10px; color:#334155;"><strong>Monitoria Antifraude:</strong> Penalidade direta por transações consecutivas rejeitadas no mesmo cartão.</td>
            </tr>
            <tr style="background:#ffffff; border-bottom:1px solid #e2e8f0;">
              <td style="padding:8px 10px; font-weight:bold; color:#0f172a;">Reembolso / Refund</td>
              <td style="padding:8px 10px; color:#334155;">Crédito ao portador processado via Merchandise Return (F3 = 20) com reconciliação no Base II.</td>
              <td style="padding:8px 10px; color:#334155;">Purchase Return Mandate (DE 3 SF1 = 20). Edit 30 v2 exige 99% de aprovação pelo emissor.</td>
              <td style="padding:8px 10px; color:#334155;">Transação de Cancelamento / Devolução no mesmo dia ou estorno via Clearing Elo.</td>
            </tr>
            <tr style="background:#f8fafc;">
              <td style="padding:8px 10px; font-weight:bold; color:#0f172a;">Classificação de EC</td>
              <td style="padding:8px 10px; color:#334155;">Regras de MCC padrão ISO 18245 com programas especiais de grande porte (High-Volume Merchant).</td>
              <td style="padding:8px 10px; color:#334155;">Programas de Intercâmbio Diferenciado baseados em MCC, tier de volume e presença de chip/token.</td>
              <td style="padding:8px 10px; color:#334155;"><strong>Release 26.2:</strong> Segregação estrita entre PJ (CNPJ) e PF (CPF). Tag fiscal obrigatória no lote.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p></p>
    `,
  },
  {
    id: "matriz_downgrade_financeiro",
    category: "alertas",
    title: "Matriz de Downgrade Financeiro & Regras de Multa",
    description: "Cálculo direto de impacto financeiro por não-conformidade técnica (Tarifa Base vs Desqualificada, Perda de Margem em Bps e Multas).",
    badge: "Tarifário",
    html: `
      <div style="background:#ffffff; border:1px solid #fca5a5; border-radius:12px; padding:18px; margin:1.5rem 0; font-family:system-ui, -apple-system, sans-serif;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
          <h4 style="margin:0; color:#991b1b; font-size:14px; text-transform:uppercase; letter-spacing:0.5px; font-weight:800;">
            💸 Matriz de Downgrade Financeiro & Riscos de Margem
          </h4>
          <span style="background:#dc2626; color:#ffffff; font-size:10px; font-weight:bold; padding:2px 8px; border-radius:4px; text-transform:uppercase;">Alerta Financeiro</span>
        </div>
        <p style="margin:0 0 12px 0; font-size:12px; color:#7f1d1d;">
          A ausência de campos normativos ou falha na validação de regras técnicas acarreta desqualificação imediata da transação para categorias de custo máximo.
        </p>
        <table style="width:100%; border-collapse:collapse; font-size:12px;">
          <thead>
            <tr style="background:#7f1d1d; color:#ffffff;">
              <th style="padding:8px 10px; text-align:left;">Cenário de Não-Conformidade</th>
              <th style="padding:8px 10px; text-align:center; width:100px;">Intercâmbio Base</th>
              <th style="padding:8px 10px; text-align:center; width:110px;">Intercâmbio Downgrade</th>
              <th style="padding:8px 10px; text-align:center; width:90px;">Perda (Bps)</th>
              <th style="padding:8px 10px; text-align:left; width:170px;">Assessment / Penalidade Extra</th>
            </tr>
          </thead>
          <tbody>
            <tr style="background:#ffffff; border-bottom:1px solid #fee2e2;">
              <td style="padding:8px 10px; font-weight:bold; color:#0f172a;">E-Commerce sem 3DS / Token (Ausência de CAVV / DAF)</td>
              <td style="padding:8px 10px; text-align:center; color:#16a34a; font-weight:bold;">1,10%</td>
              <td style="padding:8px 10px; text-align:center; color:#dc2626; font-weight:bold;">1,45% (Standard)</td>
              <td style="padding:8px 10px; text-align:center; font-weight:bold; color:#dc2626;">+35 bps</td>
              <td style="padding:8px 10px; color:#475569;">Perda do liability shift + USD 0,05 fee de desqualificação.</td>
            </tr>
            <tr style="background:#fef2f2; border-bottom:1px solid #fee2e2;">
              <td style="padding:8px 10px; font-weight:bold; color:#0f172a;">Retentativa Proibida após DE 39 = 59/82/83 (Visa Art 2.11)</td>
              <td style="padding:8px 10px; text-align:center; color:#475569;">N/A (Recusa)</td>
              <td style="padding:8px 10px; text-align:center; color:#dc2626; font-weight:bold;">Rejeição Switch</td>
              <td style="padding:8px 10px; text-align:center; font-weight:bold; color:#dc2626;">—</td>
              <td style="padding:8px 10px; color:#dc2626; font-weight:bold;">USD 0,25 a USD 0,50 por tentativa excedente cobrado no clearing.</td>
            </tr>
            <tr style="background:#ffffff; border-bottom:1px solid #fee2e2;">
              <td style="padding:8px 10px; font-weight:bold; color:#0f172a;">Enquadramento Indevido de MCC PJ como PF (Elo 26.2)</td>
              <td style="padding:8px 10px; text-align:center; color:#16a34a; font-weight:bold;">1,20% (Especial)</td>
              <td style="padding:8px 10px; text-align:center; color:#dc2626; font-weight:bold;">2,15% (Balcão Geral)</td>
              <td style="padding:8px 10px; text-align:center; font-weight:bold; color:#dc2626;">+95 bps</td>
              <td style="padding:8px 10px; color:#dc2626;">Estorno retroativo da diferença + R$ 5.000 a R$ 50.000 em auditoria.</td>
            </tr>
            <tr style="background:#fef2f2;">
              <td style="padding:8px 10px; font-weight:bold; color:#0f172a;">Taxa de Aprovação de Refund abaixo de 99% (Mastercard Edit 30)</td>
              <td style="padding:8px 10px; text-align:center; color:#16a34a; font-weight:bold;">Tarifa Regular</td>
              <td style="padding:8px 10px; text-align:center; color:#dc2626; font-weight:bold;">Tarifa Regular</td>
              <td style="padding:8px 10px; text-align:center; font-weight:bold; color:#475569;">0 bps</td>
              <td style="padding:8px 10px; color:#dc2626; font-weight:bold;">Assessment de USD 2.500 a USD 25.000/mês por ICA não-conforme.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p></p>
    `,
  },
];

interface SnippetsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertHtml: (html: string) => void;
}

export default function SnippetsDrawer({
  isOpen,
  onClose,
  onInsertHtml,
}: SnippetsDrawerProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [copiedSnippetId, setCopiedSnippetId] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredSnippets =
    selectedCategory === "all"
      ? SNIPPETS_CATALOG
      : SNIPPETS_CATALOG.filter((s) => s.category === selectedCategory);

  const handleInsert = (snippet: SnippetItem) => {
    onInsertHtml(snippet.html);
    setCopiedSnippetId(snippet.id);
    setTimeout(() => {
      setCopiedSnippetId(null);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end">
      <div className="bg-card border-l border-border shadow-2xl w-full max-w-lg h-full flex flex-col text-foreground animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-border bg-muted/30 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Layers size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold flex items-center gap-2">
                <span>Biblioteca de Blocos & Snippets</span>
                <span className="text-[10px] bg-purple-500/10 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded-full font-semibold">
                  1-Click Insert
                </span>
              </h2>
              <p className="text-xs text-muted-foreground">
                Insira tabelas, cronogramas e cartões de compliance formatados no cursor.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Filter Pills */}
        <div className="p-3 border-b border-border bg-background/50 flex flex-wrap gap-1.5 shrink-0">
          {[
            { id: "all", label: "Todos os Blocos" },
            { id: "tabelas", label: "Tabelas ISO" },
            { id: "impacto", label: "Impacto por Papel" },
            { id: "datas", label: "Cronogramas" },
            { id: "alertas", label: "Alertas & Penalidades" },
            { id: "compliance", label: "Fichas & Disputas" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all ${
                selectedCategory === cat.id
                  ? "bg-purple-600 text-white shadow-xs"
                  : "bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Snippets List */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {filteredSnippets.map((snippet) => (
            <div
              key={snippet.id}
              className="p-4 rounded-xl border border-border bg-card hover:border-purple-500/40 hover:shadow-md transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-xs font-bold text-foreground group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                    {snippet.title}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400">
                    {snippet.badge}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                  {snippet.description}
                </p>
              </div>

              <div className="pt-2 border-t border-border/60 flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground font-mono">
                  HTML Executivo Inline
                </span>
                <button
                  onClick={() => handleInsert(snippet)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-xs transition-all transform active:scale-95"
                >
                  {copiedSnippetId === snippet.id ? (
                    <>
                      <Check size={13} className="text-emerald-300" />
                      <span>Inserido!</span>
                    </>
                  ) : (
                    <>
                      <Plus size={13} />
                      <span>Inserir no Documento</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Drawer Footer */}
        <div className="p-3 border-t border-border bg-muted/30 text-center text-[11px] text-muted-foreground shrink-0">
          Dica: Os blocos inseridos podem ser editados livremente diretamente no documento.
        </div>
      </div>
    </div>
  );
}
