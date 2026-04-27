import { ArticleLayout } from "@/components/ArticleLayout";

export const metadata = {
  title: "Visa VDCAP e Mastercard TAF/SCOF: A engenharia da autenticação silenciosa com token — VS Payments",
  description:
    "Como Visa e Mastercard implementam autenticação silenciosa baseada em token, dispensando 3DS sem abrir mão da segurança. VDCAP, TAF e SCOF explicados.",
};

export default function ArtigoVdcap() {
  return (
    <ArticleLayout
      title="Visa VDCAP e Mastercard TAF/SCOF: A engenharia da autenticação silenciosa com token"
      tag="Técnico"
      tagColor="rgba(37,99,235,0.15)"
      tagText="#60a5fa"
      date="12 de abril de 2025"
      readTime="12 min"
    >
      <p>
        No mundo dos pagamentos de cartão não presente, o foco já não está mais na "autenticação
        com fricção". As bandeiras estão liderando uma nova tendência, em que o 3DS deixa de ser o
        protagonista e a segurança passa a ser definida pelo contexto, não pelo challenge.
      </p>

      <p>
        É o uso cada vez mais frequente da <strong>autenticação silenciosa</strong>, baseada em
        token, criptograma e dados contextuais.
      </p>

      <div className="callout">
        <strong>A mudança de paradigma:</strong> Hoje, as bandeiras já consideram certas transações
        tokenizadas como autenticadas, mesmo sem 3DS — mas fazem isso de maneiras diferentes. Para
        entender como isso funciona, precisamos entender o VDCAP (Visa) e o TAF/SCOF da Mastercard.
      </div>

      {/* ── VDCAP ─────────────────────────────────────────────────────────── */}
      <h2>VDCAP — Visa Digital Commerce Authentication Program</h2>

      <p>
        O <strong>VDCAP</strong> é um programa criado pela Visa para validar e proteger transações
        tokenizadas no ambiente <em>Card-Not-Present</em> (CNP) — especialmente em apps, carteiras
        digitais e plataformas de e-commerce.
      </p>

      <h3>Quando a Visa marca a transação como "autenticada"</h3>
      <p>Se a transação:</p>
      <ul>
        <li>For tokenizada (provisionada pelo VTS — provisionamento realizado por um Token Requestor registrado)</li>
        <li>Tiver um <strong>TAVV válido</strong></li>
        <li>Estiver com campos específicos preenchidos (Field 34, 56, 111)</li>
        <li>O emissor estiver habilitado</li>
      </ul>
      <p>…a Visa marca automaticamente a transação como autenticada, mesmo sem challenge 3DS.</p>

      <h3>Campos críticos para elegibilidade VDCAP</h3>

      <div className="callout">
        <strong>Atenção:</strong> Os campos <code>Field 60.8 = 07</code> e{" "}
        <code>Field 63.6 = 7</code> são essenciais para que a Visa identifique a transação como
        potencialmente elegível ao VDCAP, mesmo antes de aplicar a Tag 89 no Field 111.
      </div>

      <table>
        <thead>
          <tr>
            <th>Campo</th>
            <th>Valor</th>
            <th>Descrição</th>
          </tr>
        </thead>
        <tbody>
          {[
            ["Field 34", "Token PAN", "Token provisionado via VTS"],
            ["Field 56", "Token Cryptogram (TAVV)", "Criptograma do token — prova de presença do dispositivo"],
            ["Field 60.8", "07", "Indica transação tokenizada e elegível para VDCAP"],
            ["Field 63.6", "7", "Sinaliza o canal digital da transação"],
            ["Field 111 / Tag 89", "Gerado pela Visa", "Indicador de autenticação VDCAP — NÃO deve ser enviado pelo adquirente"],
          ].map(([campo, valor, desc]) => (
            <tr key={campo}>
              <td>{campo}</td>
              <td style={{ color: "var(--muted-foreground)" }}>{valor}</td>
              <td style={{ color: "var(--muted-foreground)" }}>{desc}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="callout-warning">
        <strong>Atenção:</strong> A Tag 89 em Field 111 é preenchida pela Visa. O adquirente{" "}
        <em>não deve enviá-la</em> na requisição.
      </div>

      <h3>Benefícios do VDCAP</h3>
      <ul>
        <li>Menos fricção no checkout</li>
        <li>Maior taxa de aprovação</li>
        <li>Menos chargebacks</li>
        <li>Proteção do emissor preservada</li>
      </ul>

      <h3>BASE II — o que fazer quando Tag 89 = 1</h3>
      <p>
        Se o adquirente recebe <code>Tag 89 = 1</code> na autorização, ele deve propagar essa
        informação no arquivo de clearing (BASE II) para garantir que a transação seja reconhecida
        como protegida no ciclo de disputa.
      </p>

      <div className="callout-warning">
        <strong>Se os campos Field 60.8 e 63.6 não forem enviados</strong>, a Tag 89 no Field 111
        não será gerada pela Visa. A transação não será VDCAP-eligible — o emissor poderá abrir
        disputas normalmente e o adquirente ficará com o ônus financeiro.
      </div>

      {/* ── TAF ───────────────────────────────────────────────────────────── */}
      <h2>TAF — Token Authentication Framework (Mastercard)</h2>

      <p>
        O <strong>TAF</strong> é o mecanismo da Mastercard que define a validade da autenticação
        com base em <em>UCAF + metadata do token</em>.
      </p>

      <p>
        Através dele é possível avaliar se uma transação CNP com token pode ser considerada
        autenticada e garantir <strong>liability shift</strong> para o emissor.
      </p>

      <div className="callout">
        <strong>O TAF é o "motor invisível"</strong> da autenticação da Mastercard para transações
        tokenizadas. Ele permite dispensar 3DS, proteger contra disputa e autorizar com segurança —
        desde que o contexto seja confiável.
      </div>

      <h3>Elementos obrigatórios para elegibilidade TAF</h3>

      <table>
        <thead>
          <tr>
            <th>Campo</th>
            <th>Valor / Tipo</th>
            <th>Descrição</th>
          </tr>
        </thead>
        <tbody>
          {[
            ["Token", "Provisionado via MDES", "Token Mastercard Digital Enablement Service"],
            ["DE 48.61", "UCAF válido", "Universal Cardholder Authentication Field — criptograma do token"],
            ["DE 22", "81, 91, 80, etc.", "Entry Mode — indica o canal de captura da transação"],
            ["DE 63.2", "Canal específico", "Channel-specific indicators (In-App, Web, etc.)"],
          ].map(([campo, valor, desc]) => (
            <tr key={campo}>
              <td>{campo}</td>
              <td style={{ color: "var(--muted-foreground)" }}>{valor}</td>
              <td style={{ color: "var(--muted-foreground)" }}>{desc}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ── SCOF ──────────────────────────────────────────────────────────── */}
      <h2>SCOF — Secure Card on File Program (Mastercard)</h2>

      <p>
        O <strong>SCOF</strong> é um programa da Mastercard que registra e certifica o uso seguro
        de cartões armazenados digitalmente — os chamados <em>cards on file</em>: cartões que ficam
        salvos em apps, wallets, navegadores ou plataformas de e-commerce.
      </p>

      <h3>Objetivos do SCOF</h3>
      <ul>
        <li>Registrar o token e seu comportamento esperado (file-based, one-click, recurring)</li>
        <li>Definir a elegibilidade para liability shift</li>
        <li>Evitar exposição do PAN, com uso obrigatório de tokens MDES</li>
        <li>Reduzir risco em transações recorrentes ou salvas</li>
        <li>Permitir autenticação sem fricção via token e dados contextuais</li>
      </ul>

      <h3>Critérios de elegibilidade SCOF</h3>
      <p>Para que uma transação seja elegível ao SCOF, ela precisa:</p>
      <ol>
        <li>
          Ser tokenizada via MDES, com:
          <ul>
            <li>
              <strong>TRID (Token Requestor ID)</strong> — identificação do requestor do token
            </li>
            <li>
              <strong>Token Reference ID</strong> — identificador único do token
            </li>
            <li>
              <strong>UCAF (Criptograma)</strong> — prova criptográfica da autenticação
            </li>
          </ul>
        </li>
      </ol>

      {/* ── Jornada ───────────────────────────────────────────────────────── */}
      <h2>A jornada completa: do salvamento do cartão à autorização</h2>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.875rem",
          marginBottom: "1.5rem",
        }}
      >
        {[
          {
            step: "1",
            title: "Merchant salva o cartão",
            desc: "O PAN vira token via MDES. O token é provisionado com TRID, Token Reference ID e UCAF.",
          },
          {
            step: "2",
            title: "Token registrado no SCOF Directory",
            desc: "Canal de uso (web, app, recurring), Token Requestor ID e nível de confiança (assurance level) são registrados.",
          },
          {
            step: "3",
            title: "Usuário faz pagamento com cartão salvo/tokenizado",
            desc: "O sistema (app ou site) prepara a requisição com o token.",
          },
          {
            step: "4",
            title: "Geração do UCAF",
            desc: "O sistema gera um UCAF contendo: criptograma baseado no token, assurance level e metadata do canal.",
          },
          {
            step: "5",
            title: "Autorização com TAF ativo",
            desc: "O adquirente envia a transação com DE 22 (entry mode: 91, 81…), DE 48.61 (UCAF criptografado) e DE 63.2 (canal/contexto).",
          },
          {
            step: "6",
            title: "Verificação Mastercard",
            desc: "O token está registrado no SCOF? O UCAF é válido e consistente? O assurance level é suficiente para isenção de 3DS?",
          },
        ].map((item) => (
          <div
            key={item.step}
            style={{
              display: "flex",
              gap: "1rem",
              alignItems: "flex-start",
              background: "var(--code-bg)",
              border: "1px solid #0f172a",
              borderRadius: "0.75rem",
              padding: "1rem 1.25rem",
            }}
          >
            <div
              style={{
                height: 28,
                width: 28,
                borderRadius: "50%",
                background: "rgba(37,99,235,0.15)",
                border: "1px solid rgba(37,99,235,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.75rem",
                fontWeight: 800,
                color: "var(--code-text)",
                flexShrink: 0,
              }}
            >
              {item.step}
            </div>
            <div>
              <p style={{ fontWeight: 700, color: "var(--foreground)", fontSize: "0.875rem", marginBottom: "0.25rem" }}>
                {item.title}
              </p>
              <p style={{ fontSize: "0.825rem", color: "var(--muted-foreground)", marginBottom: 0 }}>{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="callout">
        <strong>Resultado quando a verificação é positiva:</strong> A transação é considerada
        autenticada pelo TAF/SCOF — sem necessidade de challenge 3DS, com liability shift para o
        emissor e maior taxa de aprovação.
      </div>

      {/* ── Comparação ────────────────────────────────────────────────────── */}
      <h2>Comparação: VDCAP (Visa) vs TAF/SCOF (Mastercard)</h2>

      <table>
        <thead>
          <tr>
            <th>Aspecto</th>
            <th>VDCAP (Visa)</th>
            <th>TAF/SCOF (Mastercard)</th>
          </tr>
        </thead>
        <tbody>
          {[
            ["Serviço de token", "VTS (Visa Token Service)", "MDES (Mastercard Digital Enablement Service)"],
            ["Criptograma", "TAVV (Token Auth Verification Value)", "UCAF (Universal Cardholder Auth Field)"],
            ["Campo de autenticação", "Field 111 / Tag 89", "DE 48.61"],
            ["Campo de canal", "Field 60.8 e 63.6", "DE 22 e DE 63.2"],
            ["Quem gera o indicador", "A Visa (Tag 89 gerada pela rede)", "O adquirente (DE 48.61 enviado com UCAF)"],
            ["Liability shift", "Sim, para o emissor", "Sim, para o emissor"],
            ["Dispensa 3DS", "Sim, quando elegível", "Sim, quando elegível"],
          ].map(([aspecto, visa, mc]) => (
            <tr key={aspecto}>
              <td style={{ color: "var(--muted-foreground)", fontFamily: "var(--font-geist-sans)" }}>{aspecto}</td>
              <td style={{ color: "var(--muted-foreground)" }}>{visa}</td>
              <td style={{ color: "var(--muted-foreground)" }}>{mc}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="callout">
        <strong>Resumo da diferença filosófica:</strong> No VDCAP, a Visa é quem "certifica" a
        autenticação gerando a Tag 89. No TAF/SCOF, a Mastercard valida o UCAF que o adquirente
        enviou com base no registro do token no SCOF Directory. Ambas chegam ao mesmo resultado —
        autenticação silenciosa, aprovação mais alta, menos fraude — mas pela perspectiva
        técnica, os campos e responsabilidades são distintos.
      </div>
    </ArticleLayout>
  );
}
