"use client";

import { useEffect } from "react";

/**
 * RagChat legacy event bridge.
 * Unificado com AcervoAiGlobalDrawer para eliminar colisão de dois botões
 * flutuantes de IA no canto inferior direito. Qualquer disparo de
 * "open-rag-chat" redireciona automaticamente para o Drawer unificado.
 */
export default function RagChat() {
  useEffect(() => {
    const handleOpenChat = (e: Event) => {
      const custom = e as CustomEvent<{ query?: string }>;
      window.dispatchEvent(
        new CustomEvent("open-acervo-ai-drawer", {
          detail: { query: custom.detail?.query },
        })
      );
    };

    window.addEventListener("open-rag-chat", handleOpenChat);
    return () => window.removeEventListener("open-rag-chat", handleOpenChat);
  }, []);

  return null;
}
