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

// ─── Painel lateral ───────────────────────────────────────────────────────────

function PainelLateral({
  no,
  cor,
  vizinhos,
  didatico,
  onClose,
}: {
  no: NoData & { analogy?: string; impacto?: string; curiosidade?: string };
  cor: string;
  vizinhos: NoData[];
  didatico: boolean;
  onClose: () => void;
}) {
  const catMap = Object.fromEntries(mapaData.categorias.map((c) => [c.id, c]));

  return (
    <div
      style={{
        position: "absolute",
        top: 16,
        right: 16,
        width: 320,
        background: "#0f1117",
        border: `1px solid ${cor}40`,
        borderRadius: "1.5rem",
        padding: "1.5rem",
        zIndex: 100,
        boxShadow: `0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px ${cor}20`,
        maxHeight: "calc(100% - 32px)",
        overflowY: "auto",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem", marginBottom: "1rem" }}>
        <div
          style={{
            flex: 1,
            padding: "0.5rem 0.875rem",
            borderRadius: "0.75rem",
            background: `${cor}15`,
            border: `1px solid ${cor}30`,
          }}
        >
          <p style={{ fontSize: "0.75rem", fontWeight: 800, color: cor, margin: 0, letterSpacing: "0.06em", textTransform: "uppercase" }}>
            {no.label}
          </p>
        </div>
        <button
          onClick={onClose}
          className="hover:bg-white/10"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "0.5rem",
            padding: "0.4rem",
            cursor: "pointer",
            color: "rgba(255,255,255,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            transition: "all 0.2s"
          }}
        >
          <X size={14} />
        </button>
      </div>

      {/* Modo Didático: Analogia */}
      {didatico && no.analogy && (
        <div style={{ 
          background: "rgba(59,130,246,0.1)", 
          border: "1px solid rgba(59,130,246,0.2)", 
          padding: "0.875rem", 
          borderRadius: "1rem",
          marginBottom: "1.25rem"
        }}>
          <p style={{ fontSize: "0.65rem", fontWeight: 800, color: "#60a5fa", textTransform: "uppercase", marginBottom: "0.3rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <span style={{ fontSize: "1rem" }}>💡</span> Explicação Simples
          </p>
          <p style={{ fontSize: "0.85rem", color: "#93c5fd", lineHeight: 1.5, fontWeight: 500, fontStyle: "italic" }}>
            "{no.analogy}"
          </p>
        </div>
      )}

      {/* Descrição Técnica */}
      <div style={{ marginBottom: "1.25rem" }}>
        <p style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.8)", lineHeight: 1.6 }}>
          {no.descricao}
        </p>
      </div>

      {/* Efeito Borboleta: Impacto */}
      {no.impacto && (
        <div style={{ 
          background: "rgba(16,185,129,0.08)", 
          border: "1px dashed rgba(16,185,129,0.3)", 
          padding: "0.875rem", 
          borderRadius: "1rem",
          marginBottom: "1.25rem"
        }}>
          <p style={{ fontSize: "0.65rem", fontWeight: 800, color: "#34d399", textTransform: "uppercase", marginBottom: "0.3rem" }}>
            🦋 Efeito Borboleta (Impacto)
          </p>
          <p style={{ fontSize: "0.78rem", color: "#6ee7b7", lineHeight: 1.5 }}>
            {no.impacto}
          </p>
        </div>
      )}

      {/* Curiosidade */}
      {no.curiosidade && (
        <p style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.4)", fontStyle: "italic", marginBottom: "1.25rem" }}>
          <strong>Sabia?</strong> {no.curiosidade}
        </p>
      )}

      {/* Conectado a */}
      {vizinhos.length > 0 && (
        <div style={{ marginBottom: "1.5rem" }}>
          <p style={{
            fontSize: "0.65rem",
            fontWeight: 800,
            color: "rgba(255,255,255,0.3)",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            margin: "0 0 0.6rem",
          }}>
            Conexões Diretas
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
            {vizinhos.map((v) => {
              const cat = catMap[v.categoria];
              return (
                <span
                  key={v.id}
                  style={{
                    fontSize: "0.7rem",
                    fontWeight: 600,
                    padding: "0.25rem 0.65rem",
                    borderRadius: "0.5rem",
                    background: `${cat?.cor ?? "#fff"}10`,
                    border: `1px solid ${cat?.cor ?? "#fff"}20`,
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
      <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
        {no.trilha && (
          <Link
            href={`/trilhas/${no.trilha.id}/${no.trilha.licao}`}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.75rem 1rem",
              borderRadius: "0.875rem",
              background: `${cor}15`,
              border: `1px solid ${cor}30`,
              color: cor,
              fontSize: "0.82rem",
              fontWeight: 700,
              textDecoration: "none",
              transition: "all 0.2s",
            }}
            className="hover:scale-[1.02] active:scale-[0.98]"
          >
            <BookOpen size={14} />
            Estudar este conceito
            <ChevronRight size={14} style={{ marginLeft: "auto" }} />
          </Link>
        )}
        {no.glossario && (
          <Link
            href={`/glossario?q=${encodeURIComponent(no.glossario)}`}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.75rem 1rem",
              borderRadius: "0.875rem",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.6)",
              fontSize: "0.82rem",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            <ExternalLink size={14} />
            Dicionário Técnico
          </Link>
        )}
      </div>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function MapaClient() {
  const [filtro, setFiltro] = useState<string | null>(null);
  const [noSelecionado, setNoSelecionado] = useState<any | null>(null);
  const [busca, setBusca] = useState("");
  const [didatico, setDidatico] = useState(true);

  // Base graph
  const { nodes: baseNodes, edges: baseEdges } = useMemo(
    () => buildGraph(filtro),
    [filtro]
  );

  // Efeito Borboleta: Encontrar todos os nós afetados (descendentes)
  const affectedNodesIds = useMemo<Set<string> | null>(() => {
    if (!noSelecionado) return null;
    
    const affected = new Set<string>([noSelecionado.id]);
    const queue = [noSelecionado.id];
    
    // Busca em largura para encontrar todos os nós "a jusante"
    while (queue.length > 0) {
      const currentId = queue.shift();
      mapaData.arestas.forEach(edge => {
        if (edge.source === currentId && !affected.has(edge.target)) {
          affected.add(edge.target);
          queue.push(edge.target);
        }
      });
    }
    
    // Adiciona também vizinhos diretos que podem ser "a montante" para clareza
    mapaData.arestas.forEach(edge => {
      if (edge.target === noSelecionado.id) affected.add(edge.source);
    });

    return affected;
  }, [noSelecionado]);

  const vizinhosData = useMemo<NoData[]>(() => {
    if (!noSelecionado) return [];
    const directIds = new Set<string>();
    mapaData.arestas.forEach(e => {
      if (e.source === noSelecionado.id) directIds.add(e.target);
      if (e.target === noSelecionado.id) directIds.add(e.source);
    });
    return mapaData.nos.filter(n => directIds.has(n.id));
  }, [noSelecionado]);

  // Overlay de opacidade nos nós
  const nodesComOverlay = useMemo<Node[]>(() => {
    const query = busca.trim().toLowerCase();
    return baseNodes.map((n) => {
      let opacity = 1;
      let isImpacted = false;

      if (query.length >= 1) {
        opacity = (n.data as NodeData).label.toLowerCase().includes(query) ? 1 : 0.08;
      } else if (affectedNodesIds) {
        opacity = affectedNodesIds.has(n.id) ? 1 : 0.15;
        isImpacted = affectedNodesIds.has(n.id) && n.id !== noSelecionado.id;
      }
      
      return { 
        ...n, 
        style: { 
          opacity, 
          transition: "opacity 0.25s, transform 0.25s",
          transform: isImpacted ? "scale(1.05)" : "scale(1)"
        } 
      };
    });
  }, [baseNodes, busca, affectedNodesIds, noSelecionado]);

  // Overlay de opacidade nas arestas
  const edgesComOverlay = useMemo<Edge[]>(() => {
    const query = busca.trim().toLowerCase();
    return baseEdges.map((e) => {
      let opacity = 1;
      let animated = false;

      if (query.length >= 1) {
        opacity = 0.05;
      } else if (affectedNodesIds) {
        const isImpactEdge = affectedNodesIds.has(e.source) && affectedNodesIds.has(e.target);
        opacity = isImpactEdge ? 1 : 0.05;
        animated = isImpactEdge && e.source === noSelecionado?.id;
      }
      
      return { 
        ...e, 
        animated,
        style: { ...e.style, opacity, strokeWidth: animated ? 3 : 1.5, transition: "opacity 0.25s" } 
      };
    });
  }, [baseEdges, busca, affectedNodesIds, noSelecionado]);

  const matchCount = useMemo(() => {
    const q = busca.trim().toLowerCase();
    if (!q) return 0;
    return baseNodes.filter((n) => (n.data as NodeData).label.toLowerCase().includes(q)).length;
  }, [baseNodes, busca]);

  const [, , onNodesChange] = useNodesState(baseNodes);
  const [, , onEdgesChange] = useEdgesState(baseEdges);

  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      const found = mapaData.nos.find((n) => n.id === node.id);
      setNoSelecionado(found as NoData ?? null);
      setBusca("");
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

      {/* ── Controles top-left: busca + filtros + toggle didático ─────────── */}
      <div
        style={{
          position: "absolute",
          top: 24,
          left: 24,
          zIndex: 100,
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          maxWidth: "calc(100% - 400px)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          {/* Toggle Didático */}
          <button
            onClick={() => setDidatico(!didatico)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.6rem",
              padding: "0.5rem 1rem",
              background: didatico ? "rgba(59,130,246,0.15)" : "rgba(255,255,255,0.05)",
              border: `1px solid ${didatico ? "#3b82f6" : "rgba(255,255,255,0.1)"}`,
              borderRadius: "9999px",
              color: didatico ? "#60a5fa" : "rgba(255,255,255,0.5)",
              fontSize: "0.72rem",
              fontWeight: 800,
              textTransform: "uppercase",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
          >
            <span style={{ fontSize: "1rem" }}>{didatico ? "👧" : "🎓"}</span>
            Modo Didático: {didatico ? "ON" : "OFF"}
          </button>

          {/* Busca */}
          <div style={{ position: "relative", width: 260 }}>
            <Search
              size={14}
              style={{
                position: "absolute",
                left: "0.8rem",
                top: "50%",
                transform: "translateY(-50%)",
                color: "rgba(255,255,255,0.3)",
                pointerEvents: "none",
              }}
            />
            <input
              type="text"
              placeholder="Buscar no ecossistema..."
              value={busca}
              onChange={(e) => {
                setBusca(e.target.value);
                setNoSelecionado(null);
              }}
              style={{
                width: "100%",
                padding: "0.5rem 2.5rem 0.5rem 2.2rem",
                background: "rgba(10,15,26,0.8)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "9999px",
                color: "#fff",
                fontSize: "0.8rem",
                outline: "none",
                backdropFilter: "blur(8px)"
              }}
            />
          </div>
        </div>

        {/* Filtros de categoria */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
          <button
            onClick={() => { setFiltro(null); setNoSelecionado(null); setBusca(""); }}
            style={{
              padding: "0.35rem 0.875rem",
              borderRadius: "9999px",
              fontSize: "0.7rem",
              fontWeight: 700,
              cursor: "pointer",
              border: filtro === null ? "1.5px solid #fff" : "1px solid rgba(255,255,255,0.1)",
              background: filtro === null ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.2)",
              color: "#fff",
              transition: "all 0.2s",
            }}
          >
            Todos
          </button>
          {mapaData.categorias.map((cat) => (
            <button
              key={cat.id}
              onClick={() => { setFiltro(filtro === cat.id ? null : cat.id); setNoSelecionado(null); setBusca(""); }}
              style={{
                padding: "0.35rem 0.875rem",
                borderRadius: "9999px",
                fontSize: "0.7rem",
                fontWeight: 700,
                cursor: "pointer",
                border: filtro === cat.id ? `1.5px solid ${cat.cor}` : `1px solid ${cat.corBorda}`,
                background: filtro === cat.id ? cat.corFundo : "rgba(0,0,0,0.2)",
                color: filtro === cat.id ? cat.cor : "rgba(255,255,255,0.5)",
                transition: "all 0.2s",
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
          didatico={didatico}
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
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.1}
        maxZoom={4}
        style={{ background: "#05080f" }}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#1e293b" gap={30} size={1} />
        <Controls
          style={{
            bottom: 30,
            left: 24,
            background: "#0f1117",
            border: "1px solid #1e293b",
            borderRadius: "0.75rem",
            overflow: "hidden"
          }}
        />
      </ReactFlow>

      {/* ── Legenda Didática ─────────────────────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          bottom: 24,
          left: 100,
          padding: "0.75rem 1.25rem",
          background: "rgba(10,15,26,0.8)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "1rem",
          backdropFilter: "blur(12px)",
          zIndex: 50,
          display: "flex",
          gap: "1.5rem"
        }}
      >
         <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <div style={{ width: 12, height: 2, background: "#fff", opacity: 0.15 }} />
            <span style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>Fluxo Normal</span>
         </div>
         <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <div style={{ width: 20, height: 3, background: "#3b82f6", borderRadius: "2px" }} />
            <span style={{ fontSize: "0.7rem", color: "#60a5fa", fontWeight: 800 }}>🦋 Efeito Borboleta Ativo</span>
         </div>
      </div>
    </div>
  );
}

