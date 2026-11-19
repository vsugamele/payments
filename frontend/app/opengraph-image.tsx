import { ImageResponse } from "next/og";

export const alt =
  "Vinícius Sugamele — Meios de Pagamento, Bandeiras e Regulação";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#fafafa",
          color: "#222225",
          padding: "68px 76px",
          fontFamily: "sans-serif",
          border: "1px solid #e4e4e7",
        }}
      >
        {/* Topo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", fontSize: 28 }}>
            <span style={{ fontWeight: 700, color: "#222225" }}>vinícius</span>
            <span style={{ fontWeight: 400, color: "#6b6b73", marginLeft: 8 }}>
              sugamele
            </span>
          </div>

          <div
            style={{
              display: "flex",
              fontSize: 18,
              color: "#6b6b73",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              border: "1px solid #d4d4d8",
              borderRadius: 999,
              padding: "8px 20px",
              background: "#ffffff",
            }}
          >
            Meios de Pagamento · Bandeiras · BCB
          </div>
        </div>

        {/* Manchete */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 24,
            maxWidth: 980,
          }}
        >
          <div
            style={{
              fontSize: 58,
              fontWeight: 700,
              lineHeight: 1.12,
              letterSpacing: "-0.03em",
              color: "#222225",
            }}
          >
            Meios de pagamento, regras de bandeira e o que acontece entre o
            terminal e a liquidação.
          </div>

          <div
            style={{
              fontSize: 24,
              lineHeight: 1.5,
              color: "#52525b",
            }}
          >
            Notícias comentadas, guia prático em 9 capítulos e bastidores de
            Visa, Mastercard, Elo, Amex, Pix e Banco Central.
          </div>
        </div>

        {/* Rodapé com linha sutil de barras de dados */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid #e4e4e7",
            paddingTop: 28,
          }}
        >
          <div style={{ fontSize: 20, color: "#6b6b73" }}>
            Head de Bandeiras · 16+ anos em EcommIT, Elo, Getnet e Verifone / Amex
          </div>

          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div style={{ width: 48, height: 8, borderRadius: 999, background: "#1e6b73" }} />
            <div style={{ width: 24, height: 8, borderRadius: 999, background: "#1f3fe0" }} />
            <div style={{ width: 14, height: 8, borderRadius: 999, background: "#c81e1e" }} />
            <div style={{ width: 10, height: 8, borderRadius: 999, background: "#222225" }} />
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
