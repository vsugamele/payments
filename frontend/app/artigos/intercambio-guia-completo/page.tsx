import { ArticleLayout } from "@/components/ArticleLayout";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Intercâmbio: Guia Completo para Adquirentes e Sub-adquirentes | VS Payments",
  description:
    "Entenda como as taxas de intercâmbio funcionam, a cascata de 5 decisões, quais produtos custam mais, como evitar downgrades e como verificar se você está pagando o correto.",
};

export default function ArtigoIntercambio() {
  return (
    <ArticleLayout
      title="Intercâmbio: Guia Completo para Adquirentes e Sub-adquirentes"
      tag="Técnico"
      tagColor="rgba(59,130,246,0.12)"
      tagText="#60a5fa"
      date="28 de abril de 2026"
      readTime="12 min"
    >

      <p>
        O intercâmbio é, provavelmente, o custo mais incompreendido de toda a cadeia de pagamentos. Adquirentes
        o repassam ao lojista embutido no MDR. Sub-adquirentes o absorvem na margem. Mas poucos conseguem
        explicar, campo a campo, <em>por que</em> uma transação custou exatamente 1,64% e não 0,80%.
      </p>

      <p>
        Este guia percorre o ciclo completo: o que é intercâmbio, quem decide, como é calculado, o que causa
        o downgrade silencioso e como você verifica se está pagando o correto.
      </p>

      {/* ── 1. O que é intercâmbio ── */}
      <h2>O que é intercâmbio e por que existe</h2>

      <p>
        Intercâmbio (<em>interchange</em>) é a tarifa paga pela <strong>Adquirente</strong> ao{" "}
        <strong>Banco Emissor</strong> a cada transação aprovada. Não é uma margem da Bandeira —
        é uma remuneração ao banco que emitiu o cartão pelo risco assumido e pelos benefícios financiados
        (milhas, cashback, seguros).
      </p>

      <div className="callout">
        <strong>Exemplo numérico:</strong> O lojista paga 2,50% de MDR. Desse total, ~1,64% vai para o Banco
        Emissor (intercâmbio), ~0,25% vai para a Bandeira (scheme fee) e ~0,61% fica com a Adquirente
        (markup). O lojista recebe os R$ 100,00 menos os 2,50% = R$ 97,50.
      </div>

      <p>
        Quem define as tabelas de intercâmbio são as próprias Bandeiras (Visa e Mastercard). Elas publicam
        os Interchange Rate Designators (IRDs) por país, produto, canal e autenticação. No Brasil, o BACEN
        também regula emissores acima de determinado porte — aplicando um teto de <strong>0,50%</strong>{" "}
        para cartões de crédito (Circular 3.887/2018).
      </p>

      {/* ── 2. Os 5 passos ── */}
      <h2>A cascata de 5 decisões</h2>

      <p>
        Quando um arquivo de clearing (BASE II para Visa, IPM para Mastercard) chega na Bandeira, um motor
        de regras percorre uma <strong>cascata de 5 variáveis em sequência</strong> para determinar qual
        IRD — e portanto qual taxa — se aplica.
      </p>

      <div
        style={{
          background: "rgba(59,130,246,0.05)",
          border: "1px solid rgba(59,130,246,0.2)",
          borderRadius: "0.875rem",
          padding: "1.25rem 1.5rem",
          marginTop: "1.5rem",
          marginBottom: "1.5rem",
        }}
      >
        <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "#60a5fa", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.75rem" }}>
          Cascata de decisão (ordem de prioridade)
        </p>
        {[
          ["1. Produto", "Qual é o cartão? Classic, Platinum, Infinite, Débito, Corporativo?", "F^, N^, I^, DV, K^ (Visa) | 101–104, MDM, MCO (MC)"],
          ["2. Canal de captura", "Como foi capturado? Chip presencial, NFC, e-commerce, MOTO?", "DE 22 — POS Entry Mode"],
          ["3. Autenticação", "Houve 3DS? Apple Pay? Fallback? Qual é o ECI resultante?", "ECI + CAVV (Visa) / AAV (MC)"],
          ["4. MCC", "Em qual setor o lojista opera? Combustível, supermercado ou varejo geral?", "DE 18 — Merchant Category Code"],
          ["5. Status regulatório", "O emissor é regulado pelo BACEN? O cap de 0,50% se aplica?", "SETTL_FLAG (Field 61 / DE 63 Tag 5)"],
        ].map(([passo, desc, campo]) => (
          <div
            key={passo}
            style={{
              display: "grid",
              gridTemplateColumns: "140px 1fr 1fr",
              gap: "1rem",
              padding: "0.625rem 0",
              borderBottom: "1px solid rgba(59,130,246,0.08)",
              alignItems: "start",
            }}
            className="text-sm"
          >
            <span style={{ fontWeight: 700, color: "#93c5fd" }}>{passo}</span>
            <span style={{ color: "var(--muted-foreground)", lineHeight: 1.6 }}>{desc}</span>
            <code style={{ fontSize: "0.7rem", color: "#475569", lineHeight: 1.6 }}>{campo}</code>
          </div>
        ))}
      </div>

      <p>
        A Bandeira percorre essa lista de cima para baixo. A primeira regra que satisfizer{" "}
        <strong>todas</strong> as condições vence — esse é o IRD aplicado à transação. Você pode
        visualizar isso interativamente na{" "}
        <Link href="/matrix" style={{ color: "#60a5fa" }}>Matriz de Intercâmbio</Link>.
      </p>

      {/* ── 3. Produto ── */}
      <h2>Passo 1 — Produto: o maior determinante de custo</h2>

      <p>
        O produto é, em regra, o maior determinante do intercâmbio. Um cartão <strong>Infinite</strong> financia
        benefícios premium (sala VIP, seguro viagem, cashback em dólares) — e esse custo se traduz em
        intercâmbio mais alto para quem aceita o cartão.
      </p>

      <table>
        <thead>
          <tr>
            <th>Produto Visa</th>
            <th>PID (AFS)</th>
            <th>Produto MC</th>
            <th>Código</th>
            <th>Custo relativo</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Classic</td>
            <td><code>F^</code></td>
            <td>Standard</td>
            <td><code>101</code></td>
            <td>Mínimo</td>
          </tr>
          <tr>
            <td>Gold</td>
            <td><code>P^</code></td>
            <td>Gold</td>
            <td><code>102</code></td>
            <td>Moderado</td>
          </tr>
          <tr>
            <td>Platinum</td>
            <td><code>N^</code></td>
            <td>World / Platinum</td>
            <td><code>103</code></td>
            <td>Alto</td>
          </tr>
          <tr>
            <td>Infinite</td>
            <td><code>I^</code></td>
            <td>World Elite</td>
            <td><code>104</code></td>
            <td>Máximo</td>
          </tr>
          <tr>
            <td>Débito</td>
            <td><code>DV</code></td>
            <td>Débito (MDM)</td>
            <td><code>MDM</code></td>
            <td>Menor que crédito</td>
          </tr>
        </tbody>
      </table>

      <p>
        O PID da Visa trafega no <strong>Field 61.5 (AFS)</strong> do arquivo BASE II. O Product Code
        da Mastercard vai no <strong>DE 63 Tag 2</strong> do IPM. Se esses campos chegarem em branco
        no clearing, a Bandeira não consegue identificar o produto e aplica o tier genérico —
        geralmente o mais caro.
      </p>

      {/* ── 4. Canal e auth ── */}
      <h2>Passos 2 e 3 — Canal e Autenticação: o multiplicador de risco</h2>

      <p>
        O canal de captura determina o risco base da transação. A autenticação define se esse risco
        foi mitigado — e, portanto, se o lojista merece uma taxa menor.
      </p>

      <div className="callout">
        <strong>Princípio fundamental:</strong> A Bandeira remunera boas práticas de segurança com
        intercâmbio menor. E-commerce com 3DS frictionless (ECI 05) paga menos que e-commerce sem
        autenticação (ECI 07) — mesmo sendo o mesmo canal.
      </div>

      <p>
        O impacto na prática:
      </p>

      <ul>
        <li><strong>Chip + PIN (DE 22=05):</strong> risco mínimo, intercâmbio base do produto.</li>
        <li><strong>Contactless NFC (DE 22=07):</strong> equivalente ao chip, criptograma de uso único.</li>
        <li><strong>E-com + 3DS (ECI 05):</strong> liability shift ativo, taxa próxima ao presencial.</li>
        <li><strong>E-com sem 3DS (ECI 07):</strong> responsabilidade do adquirente, sobretaxa de risco.</li>
        <li><strong>Apple Pay / DPAN (TAF ativo):</strong> equivalente ao chip — biometria do device.</li>
        <li><strong>Fallback Magstripe (DE 22=90):</strong> canal punitivo, taxa elevada + risco de chargeback.</li>
      </ul>

      <p>
        O ECI é injetado no arquivo de clearing — <strong>não</strong> apenas na autorização. Um erro
        muito comum é o gateway capturar o ECI na autorização mas não replicá-lo no arquivo. Isso causa
        downgrade automático para o tier não-autenticado.
      </p>

      {/* ── 5. MCC ── */}
      <h2>Passo 4 — MCC: setores subsidiados e tier especial</h2>

      <p>
        Alguns segmentos operam com margens tão comprimidas que aceitar cartão seria inviável sem um
        tier especial. As Bandeiras (e o BACEN, para combustível) definem intercâmbios subsidiados para:
      </p>

      <ul>
        <li><strong>Combustível (MCC 5541/5542):</strong> tier especial regulado — pode ser 0,50% ou menos.</li>
        <li><strong>Supermercados (MCC 5411):</strong> margem de ~2–3%, tier reduzido pelas Bandeiras.</li>
        <li><strong>Educação (MCC 8299), Saúde (8099), Transporte Público (4111):</strong> tiers subsidiados.</li>
        <li><strong>Governo (MCC 9311):</strong> tabela própria para pagamentos de tributos e tarifas.</li>
      </ul>

      <p>
        Cadastrar o MCC incorreto é um dos erros mais caros do onboarding. Um posto de combustível com
        MCC 5999 (Miscellaneous) paga até 1,5% em vez de 0,50% — <strong>+R$ 100 por R$ 10 mil transacionados</strong>.
        Use o lookup de MCCs em{" "}
        <Link href="/compliance/mcc" style={{ color: "#60a5fa" }}>compliance/mcc</Link> para verificar.
      </p>

      {/* ── 6. Regulatório ── */}
      <h2>Passo 5 — Status regulatório: o cap de 0,50%</h2>

      <p>
        A <strong>BACEN Circular 3.887/2018</strong> impõe um teto médio de <strong>0,50%</strong>{" "}
        de intercâmbio para emissores acima de determinado porte no crédito (e limites diferentes para
        débito). O campo que sinaliza isso no clearing é o SETTL_FLAG:
      </p>

      <ul>
        <li><strong>Visa BASE II:</strong> Field 61, posição do Settlement Indicator</li>
        <li><strong>Mastercard IPM:</strong> DE 63 Tag 5</li>
      </ul>

      <p>
        Se o flag chegar incorreto, o cap não é aplicado e o adquirente paga mais do que deveria em
        transações com emissores regulados. Conversamente, se o flag indicar "regulado" para um emissor
        que não está sujeito ao cap, a taxa será truncada desnecessariamente.
      </p>

      {/* ── 7. Downgrade ── */}
      <h2>O downgrade: a armadilha silenciosa</h2>

      <p>
        O downgrade é a reclassificação <em>silenciosa</em> do intercâmbio no clearing. A autorização
        passa com RC 00, o lojista recebe normalmente — mas semanas depois, na reconciliação, você
        descobre que pagou 2,40% em vez de 1,64%.
      </p>

      <div className="callout" style={{ borderColor: "rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.05)" }}>
        <strong>Por que "silencioso"?</strong> Porque o downgrade acontece no clearing (BASE II / IPM),
        não na autorização. O lojista não vê, o portador não vê. Só aparece quando você compara o
        intercâmbio cobrado no statement da Bandeira com o que deveria ter sido cobrado.
      </div>

      <p>Os 3 gatilhos mais comuns:</p>

      <ol>
        <li>
          <strong>ECI / CAVV ausente no arquivo de clearing</strong> — o gateway capturou o ECI na
          autorização mas não o colocou no arquivo BASE II / IPM. Solução: garantir que o MPI replique
          o ECI para o campo correto no arquivo de clearing (Field 126.9 Visa / DE 48.42 MC).
        </li>
        <li>
          <strong>MCC errado ou ausente</strong> — cadastrado incorretamente no onboarding. Solução:
          auditar o DE 18 na mensagem de captura e no arquivo.
        </li>
        <li>
          <strong>Captura fora do prazo</strong> — autorização em D+0, captura em D+8. Solução:
          implementar captura automática diária para transações e-commerce não capturadas.
        </li>
      </ol>

      <p>
        O guia completo dos 7 gatilhos, com exemplos de custo e checklist de prevenção, está em{" "}
        <Link href="/compliance/downgrade" style={{ color: "#60a5fa" }}>compliance/downgrade</Link>.
      </p>

      {/* ── 8. Reconciliação ── */}
      <h2>Como verificar se você está pagando o correto</h2>

      <p>
        A reconciliação de intercâmbio é, provavelmente, o processo mais negligenciado em sub-adquirentes
        e ISOs. O fluxo correto é:
      </p>

      <ol>
        <li>
          <strong>Gere o intercâmbio esperado</strong> para cada transação usando o simulador
          (produto + canal + MCC + autenticação). O{" "}
          <Link href="/simulador" style={{ color: "#60a5fa" }}>Simulador</Link> faz isso e mostra o
          caminho de decisão em "Por que esta taxa?".
        </li>
        <li>
          <strong>Compare com o IRD cobrado</strong> no arquivo de clearing (TC46 do BASE II ou
          TC46/TC05 do IPM). O IRD está no arquivo gerado pela Bandeira após o clearing noturno.
        </li>
        <li>
          <strong>Identifique discrepâncias</strong> — qualquer transação onde o IRD cobrado é diferente
          do esperado é um downgrade a investigar.
        </li>
        <li>
          <strong>Corrija a origem</strong> — o downgrade geralmente é técnico (campo vazio) ou
          operacional (MCC errado). Corrija e monitore nos 30 dias seguintes.
        </li>
      </ol>

      <p>
        Para adquirentes com alto volume, uma diferença de 0,20% em 10% das transações representa
        impacto direto na margem. Um portfólio de R$ 10 M/mês com 10% de transações downgraded em
        0,20% = <strong>R$ 20 mil/mês de custo evitável</strong>.
      </p>

      {/* ── 9. Fees adicionais ── */}
      <h2>Além do intercâmbio: scheme fees e MCBS</h2>

      <p>
        O intercâmbio não é o único custo das Bandeiras. Sobre ele se somam as <em>scheme fees</em>:
        cobranças da própria Bandeira pelo uso da rede. Para a Mastercard, isso está centralizado no
        sistema <strong>MCBS (Mastercard Consolidated Billing System)</strong>, com categorias como:
      </p>

      <ul>
        <li><strong>Autorização (AA/AB):</strong> por mensagem de autorização, com tiers por volume.</li>
        <li><strong>Conectividade (CF):</strong> mensalidade de acesso à rede Banknet.</li>
        <li><strong>Tokenização (C1):</strong> por token provisionado via MDES.</li>
        <li><strong>Chargeback (C2):</strong> por primeira disputa e representment.</li>
        <li><strong>AVS (AV):</strong> por consulta de endereço.</li>
      </ul>

      <p>
        A Visa tem estrutura equivalente via <strong>VSS (Visa Settlement Service)</strong>, com fees
        cobradas em TC10 no BASE II. O guia completo do MCBS com taxas reais em BRL está em{" "}
        <Link href="/mcbs" style={{ color: "#60a5fa" }}>mcbs</Link>.
      </p>

      {/* ── 10. Conclusão / ferramentas ── */}
      <h2>Ferramentas para aprofundar</h2>

      <p>
        Este guia cobre a teoria. Para aplicar na prática, use as ferramentas da plataforma:
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "1rem",
          marginTop: "1.5rem",
          marginBottom: "1.5rem",
        }}
        className="grid-cols-1 sm:grid-cols-2"
      >
        {[
          { href: "/simulador",           label: "Simulador de Intercâmbio", desc: "Calcule Visa, MC e Maestro com debug panel" },
          { href: "/matrix",              label: "Matriz de Intercâmbio",     desc: "Cascata visual Visa × Mastercard" },
          { href: "/compliance/downgrade",label: "Guia de Downgrade",         desc: "7 gatilhos com custo e prevenção" },
          { href: "/mcbs",                label: "MCBS — Tarifas Mastercard", desc: "Service IDs reais com taxas em BRL" },
          { href: "/chargeback",          label: "Chargeback",                desc: "Ciclo de disputa e liability shift" },
          { href: "/canais",              label: "Canais",                    desc: "CP, CNP, tokenizado — risco e ECI" },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            style={{
              display: "flex", flexDirection: "column", gap: "0.25rem",
              background: "rgba(59,130,246,0.05)",
              border: "1px solid rgba(59,130,246,0.18)",
              borderRadius: "0.75rem",
              padding: "0.875rem 1rem",
              textDecoration: "none",
              transition: "opacity 0.15s",
            }}
            className="hover:opacity-75"
          >
            <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#93c5fd" }}>{item.label}</span>
            <span style={{ fontSize: "0.75rem", color: "var(--muted-foreground)" }}>{item.desc}</span>
          </Link>
        ))}
      </div>

      <p>
        O intercâmbio não é uma caixa preta — é um sistema determinístico de 5 variáveis que pode ser
        auditado, otimizado e controlado. Cada ponto percentual recuperado de downgrade, cada MCC corrigido
        no onboarding, cada ECI injetado corretamente no clearing: tudo isso impacta diretamente a margem
        de quem opera nessa cadeia.
      </p>

    </ArticleLayout>
  );
}
