"use client";

import { useCallback, useState, useMemo } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type NodeProps,
  Handle,
  Position,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import Link from "next/link";
import { X, BookOpen, ExternalLink, ChevronRight, Search } from "lucide-react";
import mapaData from "@/data/mapa-conhecimento.json";

// ─── Tipos ────────────────────────────────────────────────────────────────────

type Categoria = (typeof mapaData.categorias)[0];
type NoData = (typeof mapaData.nos)[0];

type NodeData = {
  label: string;
  categoria: string;
  descricao: string;
  corFundo: string;
  corBorda: string;
  cor: string;
  trilha?: { id: string; licao: string };
  glossario?: string;
};

// ─── Nó customizado ───────────────────────────────────────────────────────────

function ConceituoNode({ data, selected }: NodeProps) {
  const d = data as NodeData;
  return (
    <>
      <Handle type="target" position={Position.Left} style={{ opacity: 0, width: 8, height: 8 }} />
      <div
        style={{
          background: d.corFundo,
          border: `1.5px solid ${selected ? d.cor : d.corBorda}`,
          borderRadius: "0.625rem",
          padding: "0.45rem 0.85rem",
          minWidth: 100,
          textAlign: "center",
          boxShadow: selected ? `0 0 0 2px ${d.cor}40` : "none",
          transition: "border-color 0.15s, box-shadow 0.15s",
          cursor: "pointer",
        }}
      >
        <p
          style={{
            fontSize: "0.75rem",
            fontWeight: 700,
            color: d.cor,
            margin: 0,
            whiteSpace: "nowrap",
          }}
        >
          {d.label}
        </p>
      </div>
      <Handle type="source" position={Position.Right} style={{ opacity: 0, width: 8, height: 8 }} />
    </>
  );
}

const nodeTypes = { conceito: ConceituoNode };

// ─── Construção de nodes/edges a partir do JSON ───────────────────────────────

function buildGraph(filtro: string | null) {
  const catMap = Object.fromEntries(mapaData.categorias.map((c) => [c.id, c]));

  const nodes: Node[] = mapaData.nos
    .filter((n) => !filtro || n.categoria === filtro)
    .map((n) => {
      const cat: Categoria = catMap[n.categoria];
      return {
        id: n.id,
        type: "conceito",
        position: { x: n.x, y: n.y },
        data: {
          label: n.label,
          categoria: n.categoria,
          descricao: n.descricao,
          corFundo: cat?.corFundo ?? "rgba(255,255,255,0.05)",
          corBorda: cat?.corBorda ?? "rgba(255,255,255,0.15)",
          cor: cat?.cor ?? "#ffffff",
          trilha: n.trilha,
          glossario: (n as NoData).glossario,
        } as NodeData,
      };
    });

  const nodeIds = new Set(nodes.map((n) => n.id));

  const edges: Edge[] = mapaData.arestas
    .filter((e) => nodeIds.has(e.source) && nodeIds.has(e.target))
    .map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      label: e.label,
      style: { stroke: "rgba(255,255,255,0.15)", strokeWidth: 1.5 },
      labelStyle: { fill: "rgba(255,255,255,0.45)", fontSize: 10 },
      labelBgStyle: { fill: "transparent" },
      animated: false,
    }));

  return { nodes, edges };
}

// ─── Painel lateral ───────────────────────────────────────────────────────────

function PainelLateral({
  no,
  cor,
  vizinhos,
  onClose,
}: {
  no: NoData;
  cor: string;
  vizinhos: NoData[];
  onClose: () => void;
}) {
  const catMap = Object.fromEntries(mapaData.categorias.map((c) => [c.id, c]));

  return (
    <div
      style={{
        position: "absolute",
        top: 16,
        right: 16,
        width: 300,
        background: "#0f1117",
        border: `1px solid ${cor}40`,
        borderRadius: "1rem",
        padding: "1.25rem",
        zIndex: 100,
        boxShadow: `0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px ${cor}20`,
        maxHeight: "calc(100% - 32px)",
        overflowY: "auto",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem", marginBottom: "0.875rem" }}>
        <div
          style={{
            flex: 1,
            padding: "0.4rem 0.75rem",
            borderRadius: "0.5rem",
            background: `${cor}15`,
            border: `1px solid ${cor}30`,
          }}
        >
          <p style={{ fontSize: "0.72rem", fontWeight: 700, color: cor, margin: 0, letterSpacing: "0.06em", textTransform: "uppercase" }}>
            {no.label}
          </p>
        </div>
        <button
          onClick={onClose}
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "0.375rem",
            padding: "0.35rem",
            cursor: "pointer",
            color: "rgba(255,255,255,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <X size={14} />
        </button>
      </div>

      {/* Descrição */}
      <p style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.7)", lineHeight: 1.6, margin: "0 0 1rem" }}>
        {no.descricao}
      </p>

      {/* Conectado a */}
      {vizinhos.length > 0 && (
        <div style={{ marginBottom: "1rem" }}>
          <p style={{
            fontSize: "0.65rem",
            fontWeight: 700,
            color: "rgba(255,255,255,0.3)",
            letterSpacing: "0.07em",
            textTransform: "uppercase",
            margin: "0 0 0.4rem",
          }}>
            Conectado a
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem" }}>
            {vizinhos.map((v) => {
              const cat = catMap[v.categoria];
              return (
                <span
                  key={v.id}
                  style={{
                    fontSize: "0.68rem",
                    fontWeight: 600,
                    padding: "0.2rem 0.5rem",
                    borderRadius: "9999px",
                    background: `${cat?.cor ?? "#fff"}12`,
                    border: `1px solid ${cat?.cor ?? "#fff"}25`,
                    color: cat?.cor ?? "#fff",
                  }}
                >
                  {v.label}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Links */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {no.trilha && (
          <Link
            href={`/trilhas/${no.trilha.id}/${no.trilha.licao}`}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.6rem 0.875rem",
              borderRadius: "0.5rem",
              background: `${cor}12`,
              border: `1px solid ${cor}25`,
              color: cor,
              fontSize: "0.78rem",
              fontWeight: 600,
              textDecoration: "none",
              transition: "background 0.15s",
            }}
          >
            <BookOpen size={13} />
            Ver na trilha
            <ChevronRight size={12} style={{ marginLeft: "auto" }} />
          </Link>
        )}
        {no.glossario && (
          <Link
            href={`/glossario?q=${encodeURIComponent(no.glossario)}`}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.6rem 0.875rem",
              borderRadius: "0.5rem",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.6)",
              fontSize: "0.78rem",
              fontWeight: 500,
              textDecoration: "none",
            }}
          >
            <ExternalLink size={13} />
            Ver no glossário
          </Link>
        )}
      </div>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function MapaClient() {
  const [filtro, setFiltro] = useState<string | null>(null);
  const [noSelecionado, setNoSelecionado] = useState<NoData | null>(null);
  const [busca, setBusca] = useState("");

  // Base graph (sem overlays)
  const { nodes: baseNodes, edges: baseEdges } = useMemo(
    () => buildGraph(filtro),
    [filtro]
  );

  // IDs de vizinhos do nó selecionado (diretos)
  const vizinhosIds = useMemo<Set<string> | null>(() => {
    if (!noSelecionado) return null;
    const ids = new Set<string>([noSelecionado.id]);
    mapaData.arestas.forEach((e) => {
      if (e.source === noSelecionado.id) ids.add(e.target);
      if (e.target === noSelecionado.id) ids.add(e.source);
    });
    return ids;
  }, [noSelecionado]);

  // Objetos NoData dos vizinhos (para exibir no painel)
  const vizinhosData = useMemo<NoData[]>(() => {
    if (!vizinhosIds || !noSelecionado) return [];
    return mapaData.nos.filter(
      (n) => vizinhosIds.has(n.id) && n.id !== noSelecionado.id
    );
  }, [vizinhosIds, noSelecionado]);

  // Overlay de opacidade nos nós
  const nodesComOverlay = useMemo<Node[]>(() => {
    const query = busca.trim().toLowerCase();
    return baseNodes.map((n) => {
      let opacity = 1;
      if (query.length >= 1) {
        opacity = (n.data as NodeData).label.toLowerCase().includes(query) ? 1 : 0.08;
      } else if (vizinhosIds) {
        opacity = vizinhosIds.has(n.id) ? 1 : 0.08;
      }
      return { ...n, style: { opacity, transition: "opacity 0.18s" } };
    });
  }, [baseNodes, busca, vizinhosIds]);

  // Overlay de opacidade nas arestas
  const edgesComOverlay = useMemo<Edge[]>(() => {
    const query = busca.trim().toLowerCase();
    return baseEdges.map((e) => {
      let opacity = 1;
      if (query.length >= 1) {
        opacity = 0.05;
      } else if (vizinhosIds) {
        opacity = vizinhosIds.has(e.source) && vizinhosIds.has(e.target) ? 0.9 : 0.04;
      }
      return { ...e, style: { ...e.style, opacity } };
    });
  }, [baseEdges, busca, vizinhosIds]);

  // Contagem de matches para search
  const matchCount = useMemo(() => {
    const q = busca.trim().toLowerCase();
    if (!q) return 0;
    return baseNodes.filter((n) => (n.data as NodeData).label.toLowerCase().includes(q)).length;
  }, [baseNodes, busca]);

  // Hooks de estado necessários para onNodesChange/onEdgesChange (callbacks do ReactFlow)
  const [, , onNodesChange] = useNodesState(baseNodes);
  const [, , onEdgesChange] = useEdgesState(baseEdges);

  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      const found = mapaData.nos.find((n) => n.id === node.id);
      setNoSelecionado(found as NoData ?? null);
      setBusca(""); // limpa busca ao selecionar nó
    },
    []
  );

  const handlePaneClick = useCallback(() => {
    setNoSelecionado(null);
  }, []);

  const catMap = Object.fromEntries(mapaData.categorias.map((c) => [c.id, c]));
  const corSelecionado = noSelecionado
    ? catMap[noSelecionado.categoria]?.cor ?? "#ffffff"
    : "#ffffff";

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>

      {/* ── Controles top-left: busca + filtros ─────────────────────────── */}
      <div
        style={{
          position: "absolute",
          top: 16,
          left: 16,
          zIndex: 100,
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
          maxWidth: "calc(100% - 340px)",
        }}
      >
        {/* Busca */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <div style={{ position: "relative", width: 220 }}>
            <Search
              size={12}
              style={{
                position: "absolute",
                left: "0.65rem",
                top: "50%",
                transform: "translateY(-50%)",
                color: "rgba(255,255,255,0.35)",
                pointerEvents: "none",
              }}
            />
            <input
              type="text"
              placeholder="Buscar conceito..."
              value={busca}
              onChange={(e) => {
                setBusca(e.target.value);
                setNoSelecionado(null);
              }}
              style={{
                width: "100%",
                padding: "0.32rem 2rem 0.32rem 1.9rem",
                background: busca ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.05)",
                border: busca
                  ? "1px solid rgba(255,255,255,0.3)"
                  : "1px solid rgba(255,255,255,0.1)",
                borderRadius: "9999px",
                color: "#fff",
                fontSize: "0.72rem",
                outline: "none",
                transition: "background 0.15s, border-color 0.15s",
              }}
            />
            {busca && (
              <button
                onClick={() => setBusca("")}
                style={{
                  position: "absolute",
                  right: "0.55rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "rgba(255,255,255,0.4)",
                  display: "flex",
                  alignItems: "center",
                  padding: 0,
                }}
              >
                <X size={11} />
              </button>
            )}
          </div>
          {busca.trim().length >= 1 && (
            <span style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.35)", whiteSpace: "nowrap" }}>
              {matchCount} resultado{matchCount !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* Filtros de categoria */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
          <button
            onClick={() => { setFiltro(null); setNoSelecionado(null); setBusca(""); }}
            style={{
              padding: "0.28rem 0.7rem",
              borderRadius: "9999px",
              fontSize: "0.7rem",
              fontWeight: 700,
              cursor: "pointer",
              border: filtro === null ? "1.5px solid rgba(255,255,255,0.4)" : "1px solid rgba(255,255,255,0.12)",
              background: filtro === null ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.04)",
              color: filtro === null ? "#fff" : "rgba(255,255,255,0.5)",
              transition: "all 0.15s",
            }}
          >
            Todos
          </button>
          {mapaData.categorias.map((cat) => (
            <button
              key={cat.id}
              onClick={() => { setFiltro(filtro === cat.id ? null : cat.id); setNoSelecionado(null); setBusca(""); }}
              style={{
                padding: "0.28rem 0.7rem",
                borderRadius: "9999px",
                fontSize: "0.7rem",
                fontWeight: 700,
                cursor: "pointer",
                border: filtro === cat.id ? `1.5px solid ${cat.cor}` : `1px solid ${cat.corBorda}`,
                background: filtro === cat.id ? cat.corFundo : "rgba(255,255,255,0.03)",
                color: filtro === cat.id ? cat.cor : "rgba(255,255,255,0.5)",
                transition: "all 0.15s",
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Painel do nó selecionado ─────────────────────────────────────── */}
      {noSelecionado && (
        <PainelLateral
          no={noSelecionado}
          cor={corSelecionado}
          vizinhos={vizinhosData}
          onClose={() => setNoSelecionado(null)}
        />
      )}

      {/* ── Grafo ────────────────────────────────────────────────────────── */}
      <ReactFlow
        nodes={nodesComOverlay}
        edges={edgesComOverlay}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        onPaneClick={handlePaneClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.15 }}
        minZoom={0.2}
        maxZoom={2}
        style={{ background: "#0a0f1a" }}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#1e293b" gap={24} size={1} />
        <Controls
          style={{
            bottom: 80,
            left: 16,
            background: "#0f1117",
            border: "1px solid #1e293b",
            borderRadius: "0.5rem",
          }}
        />
        <MiniMap
          style={{
            background: "#0f1117",
            border: "1px solid #1e293b",
            borderRadius: "0.5rem",
          }}
          nodeColor={(node) => {
            const cat = catMap[(node.data as NodeData).categoria];
            return cat?.cor ?? "#334155";
          }}
          maskColor="rgba(0,0,0,0.5)"
        />
      </ReactFlow>

      {/* ── Legenda ──────────────────────────────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          bottom: 16,
          left: 16,
          display: "flex",
          flexWrap: "wrap",
          gap: "0.5rem 1rem",
          padding: "0.6rem 1rem",
          background: "rgba(10,15,26,0.85)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: "0.625rem",
          backdropFilter: "blur(8px)",
          zIndex: 50,
        }}
      >
        {mapaData.categorias.map((cat) => (
          <span
            key={cat.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.35rem",
              fontSize: "0.68rem",
              color: "rgba(255,255,255,0.5)",
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: cat.cor,
                flexShrink: 0,
              }}
            />
            {cat.label}
          </span>
        ))}
      </div>

      {/* ── Hint quando há seleção ───────────────────────────────────────── */}
      {noSelecionado && (
        <div style={{
          position: "absolute",
          bottom: 16,
          right: 16,
          fontSize: "0.68rem",
          color: "rgba(255,255,255,0.3)",
          zIndex: 50,
        }}>
          Clique no fundo para desselecionar
        </div>
      )}
    </div>
  );
}
