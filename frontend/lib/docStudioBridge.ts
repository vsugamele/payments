export interface QueuedEditorPayload {
  mode: "append_html" | "full_dossier";
  title: string;
  sourceModule?: string;
  html: string;
  metadata?: {
    brand?: "mastercard" | "visa" | "elo" | "geral";
    brandName?: string;
    referenceId?: string;
    category?: string;
    effectiveDate?: string;
    riskLevel?: "Alto" | "Médio" | "Baixo";
    executiveSummary?: string;
    recommendedAction?: string;
  };
  createdAt: number;
}

const STORAGE_KEY = "vs_doc_studio_incoming_payload";

export function sendToDocStudio(payload: Omit<QueuedEditorPayload, "createdAt">): void {
  if (typeof window === "undefined") return;
  const fullPayload: QueuedEditorPayload = {
    ...payload,
    createdAt: Date.now()
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(fullPayload));
  window.location.href = "/editor";
}

export function consumeDocStudioPayload(): QueuedEditorPayload | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    localStorage.removeItem(STORAGE_KEY);
    return JSON.parse(raw) as QueuedEditorPayload;
  } catch {
    return null;
  }
}

export function buildBillingEventHtmlBlock(b: {
  bandeira: string;
  sistema: string;
  codigo: string;
  serviceId: string;
  serviceLabelPt?: string;
  nome: string;
  quemPaga: string;
  descricao: string;
  explicacaoPt?: string;
  gatilhoPt?: string;
  rates: string[];
  fonte: string;
  reconciliacao: string;
}): string {
  const ratesHtml =
    b.rates && b.rates.length > 0
      ? `<ul>${b.rates.map((r) => `<li><strong>${r}</strong></li>`).join("")}</ul>`
      : `<p><em>Alíquota variável por faixa de volume mensal (consultar tabela de tiers no manual).</em></p>`;

  return `
    <h3>Ficha Técnica de Faturamento — ${b.bandeira} ${b.codigo} (${b.nome})</h3>
    <table>
      <thead>
        <tr>
          <th>Atributo Normativo</th>
          <th>Especificação Oficial</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Bandeira / Sistema</strong></td>
          <td>${b.bandeira} — ${b.sistema}</td>
        </tr>
        <tr>
          <td><strong>Código do Evento / Billing Line</strong></td>
          <td><code>${b.codigo}</code></td>
        </tr>
        <tr>
          <td><strong>Service ID / Família</strong></td>
          <td>${b.serviceId} — ${b.serviceLabelPt || "Serviço Regulamentado"}</td>
        </tr>
        <tr>
          <td><strong>Sujeito Passivo (Quem Paga)</strong></td>
          <td><strong>${b.quemPaga}</strong></td>
        </tr>
        <tr>
          <td><strong>Explicação Executiva (PT-BR)</strong></td>
          <td>${b.explicacaoPt || b.descricao}</td>
        </tr>
        <tr>
          <td><strong>Gatilho Técnico & Mensageria</strong></td>
          <td>${b.gatilhoPt || "Apurado no ciclo de faturamento da bandeira."}</td>
        </tr>
        <tr>
          <td><strong>Regra Original no Manual</strong></td>
          <td>${b.descricao}</td>
        </tr>
        <tr>
          <td><strong>Alíquotas & Tiers Extraídos</strong></td>
          <td>${ratesHtml}</td>
        </tr>
        <tr>
          <td><strong>Conciliação & Fonte Normativa</strong></td>
          <td>${b.reconciliacao} (${b.fonte})</td>
        </tr>
      </tbody>
    </table>
    <p></p>
  `;
}

export function buildCampoHtmlBlock(c: {
  bandeira: string;
  doc_id: string;
  manual_titulo: string;
  edicao: string;
  pagina: number;
  tipo: string;
  registro: string;
  de: string | null;
  pds: string | null;
  pos_inicio: number | null;
  pos_fim: number | null;
  tamanho: number | null;
  formato: string | null;
  nome: string | null;
  valor: string | null;
  descricao: string | null;
}): string {
  const locationLabel =
    c.pos_inicio !== null && c.pos_fim !== null
      ? `Posição Byte ${c.pos_inicio} a ${c.pos_fim} (${c.tamanho} Bytes · Formato ${c.formato || "N/A"})`
      : `${c.de ? `ISO DE ${c.de}` : ""} ${c.pds ? `· PDS ${c.pds}` : ""} (${c.tipo})`;

  return `
    <h3>Especificação de Campo / Registro — ${c.bandeira}: ${c.nome || c.registro}</h3>
    <table>
      <thead>
        <tr>
          <th>Parâmetro Técnico</th>
          <th>Detalhamento Oficial</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Bandeira & Manual</strong></td>
          <td>${c.bandeira} — ${c.manual_titulo} (${c.doc_id} · Ed. ${c.edicao}, p. ${c.pagina})</td>
        </tr>
        <tr>
          <td><strong>Registro / Tabela</strong></td>
          <td><code>${c.registro || c.tipo}</code></td>
        </tr>
        <tr>
          <td><strong>Localização Física / ISO</strong></td>
          <td><strong>${locationLabel}</strong></td>
        </tr>
        <tr>
          <td><strong>Nome do Campo / Código</strong></td>
          <td>${c.nome || "—"} ${c.valor ? `(Valor/Código: <code>${c.valor}</code>)` : ""}</td>
        </tr>
        <tr>
          <td><strong>Descrição & Regra de Domínio</strong></td>
          <td>${c.descricao || "Campo estrutural extraído da tabela oficial do manual."}</td>
        </tr>
      </tbody>
    </table>
    <p></p>
  `;
}
