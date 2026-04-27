"use client";

import dynamic from "next/dynamic";

const MapaClient = dynamic(() => import("./MapaClient"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0a0f1a",
        color: "rgba(255,255,255,0.4)",
        fontSize: "0.875rem",
      }}
    >
      Carregando mapa...
    </div>
  ),
});

export default function MapaWrapper() {
  return <MapaClient />;
}
