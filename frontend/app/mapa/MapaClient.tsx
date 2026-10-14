"use client";

import React, { useState, useMemo, useRef, useCallback } from "react";
import Link from "next/link";
import {
  Search,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  BookOpen,
  ExternalLink,
  Wrench,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Layers,
  Table2,
  Network,
  Download,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Info,
  GitCommit,
  Compass,
} from "lucide-react";
import mapaData from "@/data/mapa-conhecimento.json";

// ─── Tipos ────────────────────────────────────────────────────────────────────

type Categoria = (typeof mapaData.categorias)[number];
type NoData = (typeof mapaData.nos)[number];
type EdgeData = (typeof mapaData.arestas)[number];
type RotaGuiada = (typeof mapaData.rotasGuiadas)[number];

type EdgeKind = "dados" | "financeiro" | "calculo" | "compliance";

const EDGE_KIND_META: Record<
  EdgeKind,
  { label: string; short: string; color: string; bg: string; border: string; dashed?: boolean }
> = {
  dados: {
    label: "Fluxo de Dados & Mensageria",
    short: "Dados / ISO",
    color: "#80ddc6",
    bg: "rgba(128, 221, 198, 0.14)",
    border: "rgba(128, 221, 198, 0.35)",
  },
  calculo: {
    label: "Regra de Cálculo & Qualificação",
    short: "Cálculo IC",
    color: "#b6a0f2",
    bg: "rgba(182, 160, 242, 0.14)",
    border: "rgba(182, 160, 242, 0.35)",
    dashed: true,
  },
  financeiro: {
    label: "Fluxo Financeiro & Liquidação",
    short: "Financeiro",
    color: "#f59e0b",
    bg: "rgba(245, 158, 11, 0.14)",
    border: "rgba(245, 158, 11, 0.35)",
  },
  compliance: {
    label: "Monitoria, Disputa & Compliance",
    short: "Compliance",
    color: "#f87171",
    bg: "rgba(248, 113, 113, 0.14)",
    border: "rgba(248, 113, 113, 0.35)",
    dashed: true,
  },
};

const SUBDOMINIO_LABELS: Record<string, string> = {
  autorizacao: "Autorização (D+0)",
  clearing: "Clearing / Apresentação (D+1)",
  liquidacao: "Settlement / Liquidação",
  intercambio: "Tarifa de Intercâmbio",
  pricing: "Pricing, MDR & Billing",
  chargeback: "Disputas & Chargebacks",
  fraude: "Fraude & Reporte (TC40/SAFE)",
  seguranca: "Segurança, EMV, 3DS & Token",
  compliance: "Compliance, Programas & Regulação",
  operacoes: "Operações & Infraestrutura",
  governanca: "Governança & Rulebook",
};

const SWIMLANES = [
  { y: 35, h: 175, title: "CAMADA 1 · ATORES DO ARRANJO, SUBCREDENCIAMENTO & REGULAÇÃO (BACEN / CIP)", color: "#3b82f6" },
  { y: 220, h: 195, title: "CAMADA 2 · DADOS DO CARTÃO, MENSAGERIA ISO 8583, TOKENIZAÇÃO & 3DS", color: "#10b981" },
  { y: 425, h: 120, title: "CAMADA 3 · CICLO DE VIDA TRANSACIONAL (D+0 AUTORIZAÇÃO → D+1 CLEARING → SETTLEMENT → DISPUTAS)", color: "#8b5cf6" },
  { y: 555, h: 190, title: "CAMADA 4 · ECONOMIA DA TRANSAÇÃO (MDR, INTERCÂMBIO, IRD, TIERS, DOWNGRADES & BILLING MCBS)", color: "#f59e0b" },
  { y: 755, h: 175, title: "CAMADA 5 · MOTORES DE BANDEIRA (VISANET/VSS/VCF, GCMS/MPE T068, ELO) & PROGRAMAS (VAMP/ECP/MATCH)", color: "#06b6d4" },
];

// ─── Componente Principal ─────────────────────────────────────────────────────

export default function MapaClient() {
  // Filtros e estados de navegação
  const [busca, setBusca] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>("");
  const [bandeiraFiltro, setBandeiraFiltro] = useState<string>("");
  const [papelFiltro, setPapelFiltro] = useState<string>("");
  const [subdominioFiltro, setSubdominioFiltro] = useState<string>("");
  const [kindFiltro, setKindFiltro] = useState<string>("");
  const [rotaAtiva, setRotaAtiva] = useState<string | null>(null);

  // Seleções e modos de visualização
  const [focusNodeId, setFocusNodeId] = useState<string | null>("intercambio");
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>("R28");
  const [inspectMode, setInspectMode] = useState<"node" | "edge">("node");
  const [edgeDetailTab, setEdgeDetailTab] = useState<"payload" | "nodes" | "tools">("payload");
  const [viewMode, setViewMode] = useState<"graph" | "matrix">("graph");
  const [didatico, setDidatico] = useState<boolean>(true);
  const [showLanes, setShowLanes] = useState<boolean>(true);
  const [efeitoBorboleta, setEfeitoBorboleta] = useState<boolean>(true);

  // Estado de Zoom e Pan do SVG
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const dragRef = useRef<{ startX: number; startY: number; panX: number; panY: number } | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Mapas de acesso rápido
  const catMap = useMemo(
    () => Object.fromEntries(mapaData.categorias.map((c) => [c.id, c])),
    []
  );
  const nodeMap = useMemo(
    () => new Map<string, NoData>(mapaData.nos.map((n) => [n.id, n])),
    []
  );
  const edgeMap = useMemo(
    () => new Map<string, EdgeData>(mapaData.arestas.map((e) => [e.id, e])),
    []
  );

  // Filtragem de arestas (como no Atlas de Liquidação Internacional)
  const visibleEdges = useMemo(() => {
    const q = busca.trim().toLowerCase();
    return mapaData.arestas.filter((e) => {
      const sourceNode = nodeMap.get(e.source);
      const targetNode = nodeMap.get(e.target);
      if (!sourceNode || !targetNode) return false;

      if (rotaAtiva && !(e.routeGroup || []).includes(rotaAtiva)) {
        return false;
      }

      if (
        categoriaFiltro &&
        sourceNode.categoria !== categoriaFiltro &&
        targetNode.categoria !== categoriaFiltro
      ) {
        return false;
      }

      if (
        bandeiraFiltro &&
        e.brand !== bandeiraFiltro &&
        e.brand !== "Todas" &&
        sourceNode.bandeira !== bandeiraFiltro &&
        targetNode.bandeira !== bandeiraFiltro
      ) {
        return false;
      }

      if (
        papelFiltro &&
        e.role !== papelFiltro &&
        e.role !== "ambos" &&
        sourceNode.papel !== papelFiltro &&
        targetNode.papel !== papelFiltro
      ) {
        return false;
      }

      if (
        subdominioFiltro &&
        e.subdominio !== subdominioFiltro &&
        sourceNode.subdominio !== subdominioFiltro &&
        targetNode.subdominio !== subdominioFiltro
      ) {
        return false;
      }

      if (kindFiltro && e.kind !== kindFiltro) {
        return false;
      }

      if (q) {
        const haystack = [
          e.id,
          e.label,
          e.direction,
          e.rule,
          e.exceptions,
          e.payload,
          sourceNode.label,
          sourceNode.descricao,
          ...(sourceNode.camposTecnicos || []),
          targetNode.label,
          targetNode.descricao,
          ...(targetNode.camposTecnicos || []),
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      return true;
    });
  }, [
    busca,
    categoriaFiltro,
    bandeiraFiltro,
    papelFiltro,
    subdominioFiltro,
    kindFiltro,
    rotaAtiva,
    nodeMap,
  ]);

  // Filtragem de nós visíveis
  const visibleNodes = useMemo(() => {
    const q = busca.trim().toLowerCase();
    const edgeNodeIds = new Set(visibleEdges.flatMap((e) => [e.source, e.target]));

    return mapaData.nos.filter((n) => {
      // Se há rota ativa, mostra apenas os nós das arestas da rota
      if (rotaAtiva) {
        return edgeNodeIds.has(n.id);
      }

      if (categoriaFiltro && n.categoria !== categoriaFiltro && !edgeNodeIds.has(n.id)) {
        return false;
      }

      if (
        bandeiraFiltro &&
        n.bandeira !== bandeiraFiltro &&
        n.bandeira !== "Todas" &&
        !edgeNodeIds.has(n.id)
      ) {
        return false;
      }

      if (
        papelFiltro &&
        n.papel !== papelFiltro &&
        n.papel !== "ambos" &&
        !edgeNodeIds.has(n.id)
      ) {
        return false;
      }

      if (subdominioFiltro && n.subdominio !== subdominioFiltro && !edgeNodeIds.has(n.id)) {
        return false;
      }

      if (kindFiltro && !edgeNodeIds.has(n.id)) {
        return false;
      }

      if (q) {
        const nodeMatches = [
          n.id,
          n.label,
          n.descricao,
          n.analogy,
          n.impacto,
          n.quemEnvia,
          n.quemRecebe,
          n.comoCalcula,
          ...(n.camposTecnicos || []),
        ]
          .join(" ")
          .toLowerCase()
          .includes(q);
        return nodeMatches || edgeNodeIds.has(n.id);
      }

      return true;
    });
  }, [
    busca,
    categoriaFiltro,
    bandeiraFiltro,
    papelFiltro,
    subdominioFiltro,
    kindFiltro,
    rotaAtiva,
    visibleEdges,
  ]);

  // Efeito Borboleta: calcula nós a montante (upstream) e a jusante (downstream) do focusNodeId
  const butterflySet = useMemo(() => {
    if (!focusNodeId || !efeitoBorboleta) return null;
    const impacted = new Set<string>([focusNodeId]);
    const directUpstream = new Set<string>();
    const downstream = new Set<string>();

    // BFS para encontrar toda a cadeia a jusante (downstream)
    const queue = [focusNodeId];
    while (queue.length > 0) {
      const curr = queue.shift()!;
      for (const e of visibleEdges) {
        if (e.source === curr && !impacted.has(e.target)) {
          impacted.add(e.target);
          downstream.add(e.target);
          queue.push(e.target);
        }
      }
    }

    // Vizinhos diretos a montante (quem alimenta este nó)
    for (const e of visibleEdges) {
      if (e.target === focusNodeId) {
        impacted.add(e.source);
        directUpstream.add(e.source);
      }
    }

    return { all: impacted, upstream: directUpstream, downstream };
  }, [focusNodeId, efeitoBorboleta, visibleEdges]);

  // Lista de ligações no painel inferior central (filtrada pelo foco se houver nó focado)
  const listedEdges = useMemo(() => {
    if (!focusNodeId) return visibleEdges;
    const direct = visibleEdges.filter(
      (e) => e.source === focusNodeId || e.target === focusNodeId
    );
    return direct.length > 0 ? direct : visibleEdges;
  }, [visibleEdges, focusNodeId]);

  // Nó e Aresta atualmente inspecionados no painel direito
  const activeNode = useMemo(() => {
    if (focusNodeId && nodeMap.has(focusNodeId)) return nodeMap.get(focusNodeId)!;
    return visibleNodes[0] || mapaData.nos[0];
  }, [focusNodeId, nodeMap, visibleNodes]);

  const activeEdge = useMemo(() => {
    if (selectedEdgeId && edgeMap.has(selectedEdgeId)) return edgeMap.get(selectedEdgeId)!;
    return listedEdges[0] || visibleEdges[0] || mapaData.arestas[0];
  }, [selectedEdgeId, edgeMap, listedEdges, visibleEdges]);

  // Conexões de entrada e saída do activeNode
  const activeNodeConnections = useMemo(() => {
    if (!activeNode) return { incoming: [], outgoing: [] };
    const incoming = mapaData.arestas
      .filter((e) => e.target === activeNode.id)
      .map((e) => ({ edge: e, node: nodeMap.get(e.source)! }))
      .filter((x) => Boolean(x.node));
    const outgoing = mapaData.arestas
      .filter((e) => e.source === activeNode.id)
      .map((e) => ({ edge: e, node: nodeMap.get(e.target)! }))
      .filter((x) => Boolean(x.node));
    return { incoming, outgoing };
  }, [activeNode, nodeMap]);

  // ─── Ações de Navegação ─────────────────────────────────────────────────────

  const handleSelectNode = useCallback(
    (nodeId: string) => {
      if (focusNodeId === nodeId && inspectMode === "node") {
        // Segundo clique limpa o foco de isolamento, mantendo a inspeção
        setFocusNodeId(null);
        return;
      }
      setFocusNodeId(nodeId);
      setInspectMode("node");
      // Seleciona também a primeira aresta conectada a este nó para deixar pronta na aba de relação
      const connected = visibleEdges.find(
        (e) => e.source === nodeId || e.target === nodeId
      );
      if (connected) setSelectedEdgeId(connected.id);
    },
    [focusNodeId, inspectMode, visibleEdges]
  );

  const handleSelectEdge = useCallback((edgeId: string) => {
    setSelectedEdgeId(edgeId);
    setInspectMode("edge");
    setEdgeDetailTab("payload");
  }, []);

  const handleSelectRoute = useCallback(
    (rota: RotaGuiada) => {
      if (rotaAtiva === rota.id) {
        setRotaAtiva(null);
        return;
      }
      setBusca("");
      setCategoriaFiltro("");
      setBandeiraFiltro("");
      setPapelFiltro("");
      setSubdominioFiltro("");
      setKindFiltro("");
      setRotaAtiva(rota.id);
      setSelectedEdgeId(rota.focoEdge);
      const edge = edgeMap.get(rota.focoEdge);
      if (edge) {
        setFocusNodeId(edge.source);
      }
      setInspectMode("edge");
      setZoom(1);
      setPan({ x: 0, y: 0 });
    },
    [rotaAtiva, edgeMap]
  );

  const handleClearFilters = useCallback(() => {
    setBusca("");
    setCategoriaFiltro("");
    setBandeiraFiltro("");
    setPapelFiltro("");
    setSubdominioFiltro("");
    setKindFiltro("");
    setRotaAtiva(null);
    setFocusNodeId(null);
    setSelectedEdgeId("R28");
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  const handleExportJson = useCallback(() => {
    const blob = new Blob([JSON.stringify(mapaData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "atlas-conceitos-ecossistema.json";
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  // ─── Geometria de Curvas SVG das Arestas ────────────────────────────────────

  const computeEdgeGeometry = useCallback(
    (e: EdgeData) => {
      const a = nodeMap.get(e.source);
      const b = nodeMap.get(e.target);
      if (!a || !b) return null;

      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const len = Math.hypot(dx, dy) || 1;

      // Raio de recuo para não sobrepor a pílula do nó
      const padStart = 36;
      const padEnd = 40;
      const x1 = a.x + (dx / len) * padStart;
      const y1 = a.y + (dy / len) * padStart;
      const x2 = b.x - (dx / len) * padEnd;
      const y2 = b.y - (dy / len) * padEnd;

      // Offset para arestas irmãs entre o mesmo par de nós
      const siblings = visibleEdges.filter(
        (x) =>
          (x.source === e.source && x.target === e.target) ||
          (x.source === e.target && x.target === e.source)
      );
      const idx = siblings.findIndex((x) => x.id === e.id);
      const baseCurve = siblings.length > 1 ? (idx - (siblings.length - 1) / 2) * 34 : 18;

      const mx = (x1 + x2) / 2 - (dy / len) * baseCurve;
      const my = (y1 + y2) / 2 + (dx / len) * baseCurve;

      // Ponto médio na curva quadrática (t = 0.5)
      const labelX = 0.25 * x1 + 0.5 * mx + 0.25 * x2;
      const labelY = 0.25 * y1 + 0.5 * my + 0.25 * y2;

      return {
        path: `M ${x1.toFixed(1)},${y1.toFixed(1)} Q ${mx.toFixed(1)},${my.toFixed(1)} ${x2.toFixed(1)},${y2.toFixed(1)}`,
        labelX,
        labelY,
      };
    },
    [nodeMap, visibleEdges]
  );

  // ─── Controles de Pan / Zoom no SVG ─────────────────────────────────────────

  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    const target = e.target as HTMLElement;
    if (target.closest("[data-node-id],[data-edge-id]")) return;
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      panX: pan.x,
      panY: pan.y,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!dragRef.current || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const scaleX = 1260 / rect.width;
    const scaleY = 960 / rect.height;
    setPan({
      x: dragRef.current.panX + (e.clientX - dragRef.current.startX) * scaleX,
      y: dragRef.current.panY + (e.clientY - dragRef.current.startY) * scaleY,
    });
  };

  const handlePointerUp = () => {
    dragRef.current = null;
  };

  const handleWheel = (e: React.WheelEvent<SVGSVGElement>) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.12 : 0.89;
    setZoom((z) => Math.max(0.55, Math.min(2.6, Number((z * factor).toFixed(2)))));
  };

  const activeRouteObj = useMemo(
    () => mapaData.rotasGuiadas.find((r) => r.id === rotaAtiva) || null,
    [rotaAtiva]
  );

  return (
    <div className="flex flex-col w-full h-full bg-[#11131a] text-[#e9ecf6] select-none overflow-hidden">
      {/* ── Barra de Escopo & Ações Rápidas (Padrão Atlas de Liquidação) ─────── */}
      <div className="flex items-center justify-between gap-4 px-5 py-2 bg-[#1c1d2b] border-b border-[#30364b] text-xs shrink-0 flex-wrap">
        <div className="flex items-center gap-2.5 text-[#c5cbe0]">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[#80ddc6] font-semibold text-[11px]">
            ● Rastreabilidade Ativa
          </span>
          <span className="hidden xl:inline">
            Protocolo <b>Quem Envia → Quem Recebe → Como Calcula</b> · {mapaData.nos.length} conceitos e{" "}
            {mapaData.arestas.length} ligações técnicas mapeadas
          </span>
          {activeRouteObj && (
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold"
              style={{
                background: `${activeRouteObj.cor}20`,
                border: `1px solid ${activeRouteObj.cor}60`,
                color: activeRouteObj.cor,
              }}
            >
              <Compass size={12} />
              Rota: {activeRouteObj.titulo}
              <button
                onClick={() => setRotaAtiva(null)}
                className="ml-1 hover:opacity-75 underline"
              >
                (sair)
              </button>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Toggle Modo Didático */}
          <button
            onClick={() => setDidatico((d) => !d)}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border text-[11px] font-bold transition-all cursor-pointer ${
              didatico
                ? "bg-blue-500/20 border-blue-400/50 text-blue-300"
                : "bg-[#202432] border-[#30364b] text-[#9ba4ba]"
            }`}
            title="Exibe analogias práticas e curiosidades junto com a especificação técnica"
          >
            <Sparkles size={12} />
            Modo Didático: {didatico ? "ON" : "OFF"}
          </button>

          {/* Toggle Efeito Borboleta */}
          <button
            onClick={() => setEfeitoBorboleta((b) => !b)}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border text-[11px] font-bold transition-all cursor-pointer ${
              efeitoBorboleta
                ? "bg-emerald-500/20 border-emerald-400/50 text-[#80ddc6]"
                : "bg-[#202432] border-[#30364b] text-[#9ba4ba]"
            }`}
            title="Destaca automaticamente toda a cadeia de impacto a montante e a jusante do nó focado"
          >
            🦋 Efeito Borboleta: {efeitoBorboleta ? "ON" : "OFF"}
          </button>

          {/* Alternador Grafo vs Matriz */}
          <div className="inline-flex rounded-lg bg-[#151822] p-0.5 border border-[#30364b]">
            <button
              onClick={() => setViewMode("graph")}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                viewMode === "graph"
                  ? "bg-[#273e39] text-[#80ddc6]"
                  : "text-[#9ba4ba] hover:text-white"
              }`}
            >
              <Network size={12} />
              Grafo
            </button>
            <button
              onClick={() => setViewMode("matrix")}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                viewMode === "matrix"
                  ? "bg-[#273e39] text-[#80ddc6]"
                  : "text-[#9ba4ba] hover:text-white"
              }`}
            >
              <Table2 size={12} />
              Matriz ({visibleNodes.length})
            </button>
          </div>

          <button
            onClick={handleExportJson}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#202432] hover:border-[#80ddc6] border border-[#30364b] text-[11px] text-[#e9ecf6] transition-all cursor-pointer"
          >
            <Download size={12} />
            Exportar JSON
          </button>
        </div>
      </div>

      {/* ── Workspace de 3 Colunas (Estilo Liquidação Internacional) ────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[285px_minmax(440px,1fr)_430px] flex-1 min-h-0 overflow-hidden">
        {/* ════════════════════════════════════════════════════════════════════
            COLUNA 1 (ESQUERDA): JORNADAS GUIADAS, BUSCA & FILTROS FACETADOS
           ════════════════════════════════════════════════════════════════════ */}
        <aside className="bg-[#191c26] border-r border-[#30364b] p-4 overflow-y-auto flex flex-col gap-4 min-h-0">
          {/* 1. Rotas Rápidas / Jornadas Guiadas */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#80ddc6] flex items-center gap-1.5">
                <Compass size={13} />
                Jornadas Guiadas
              </h2>
              {rotaAtiva && (
                <button
                  onClick={() => setRotaAtiva(null)}
                  className="text-[10px] text-[#9ba4ba] hover:text-white underline cursor-pointer"
                >
                  Ver todas
                </button>
              )}
            </div>
            <div className="grid gap-1.5">
              {mapaData.rotasGuiadas.map((rota) => {
                const isActive = rotaAtiva === rota.id;
                return (
                  <button
                    key={rota.id}
                    onClick={() => handleSelectRoute(rota)}
                    className={`w-full text-left px-2.5 py-2 rounded-lg border transition-all cursor-pointer ${
                      isActive
                        ? "bg-[#252b3d] border-[#80ddc6] shadow-[inset_3px_0_0_#80ddc6]"
                        : "bg-[#202432] border-[#30364b] hover:border-[#80ddc6]/60"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-semibold text-[#e9ecf6] leading-tight">
                        {rota.titulo}
                      </span>
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ background: rota.cor }}
                      />
                    </div>
                    <span className="block text-[10px] text-[#9ba4ba] mt-0.5 leading-snug">
                      {rota.subtitulo}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Busca Textual */}
          <div>
            <label
              htmlFor="atlas-search"
              className="block text-[11px] font-medium text-[#9ba4ba] mb-1"
            >
              Buscar conceito, campo ISO, tabela ou regra
            </label>
            <div className="relative">
              <Search
                size={13}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#9ba4ba] pointer-events-none"
              />
              <input
                id="atlas-search"
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Ex.: DE 22, PDS 0158, VAMP, T068, IRD…"
                className="w-full pl-8 pr-3 py-2 rounded-lg bg-[#11131a] border border-[#30364b] text-xs text-[#e9ecf6] placeholder:text-[#64708a] focus:outline-none focus:border-[#80ddc6]"
              />
            </div>
          </div>

          {/* 3. Pills de Categoria */}
          <div>
            <span className="block text-[11px] font-medium text-[#9ba4ba] mb-1.5">
              Camada Conceitual (Categoria)
            </span>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setCategoriaFiltro("")}
                className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all cursor-pointer ${
                  categoriaFiltro === ""
                    ? "bg-[#273e39] border-[#80ddc6] text-[#80ddc6]"
                    : "bg-[#11131a] border-[#30364b] text-[#9ba4ba] hover:text-white"
                }`}
              >
                Todas ({mapaData.nos.length})
              </button>
              {mapaData.categorias.map((cat) => {
                const active = categoriaFiltro === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setCategoriaFiltro(active ? "" : cat.id)}
                    style={{
                      borderColor: active ? cat.cor : cat.corBorda,
                      background: active ? cat.corFundo : "#11131a",
                      color: active ? cat.cor : "#b0b8cc",
                    }}
                    className="px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all cursor-pointer hover:opacity-90"
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Filtros Facetados (Dropdowns como em Liquidação Internacional) */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] text-[#9ba4ba] mb-1">
                Bandeira / Rede
              </label>
              <select
                value={bandeiraFiltro}
                onChange={(e) => setBandeiraFiltro(e.target.value)}
                className="w-full px-2 py-1.5 rounded-lg bg-[#202432] border border-[#30364b] text-xs text-[#e9ecf6] focus:outline-none focus:border-[#80ddc6]"
              >
                <option value="">Todas</option>
                <option value="Visa">Visa</option>
                <option value="Mastercard">Mastercard</option>
                <option value="Elo">Elo</option>
                <option value="Bacen">Bacen / CIP / SPB</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] text-[#9ba4ba] mb-1">
                Papel no Arranjo
              </label>
              <select
                value={papelFiltro}
                onChange={(e) => setPapelFiltro(e.target.value)}
                className="w-full px-2 py-1.5 rounded-lg bg-[#202432] border border-[#30364b] text-xs text-[#e9ecf6] focus:outline-none focus:border-[#80ddc6]"
              >
                <option value="">Todos</option>
                <option value="adquirente">Adquirente</option>
                <option value="emissor">Emissor</option>
                <option value="bandeira">Bandeira</option>
                <option value="subcredenciador">Subcredenciador</option>
                <option value="lojista">Lojista (EC)</option>
                <option value="portador">Portador</option>
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-[11px] text-[#9ba4ba] mb-1">
                Subdomínio do Rulebook (Ciclo)
              </label>
              <select
                value={subdominioFiltro}
                onChange={(e) => setSubdominioFiltro(e.target.value)}
                className="w-full px-2 py-1.5 rounded-lg bg-[#202432] border border-[#30364b] text-xs text-[#e9ecf6] focus:outline-none focus:border-[#80ddc6]"
              >
                <option value="">Todos os subdomínios</option>
                {Object.entries(SUBDOMINIO_LABELS).map(([k, label]) => (
                  <option key={k} value={k}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-[11px] text-[#9ba4ba] mb-1">
                Natureza da Relação (Fluxo)
              </label>
              <select
                value={kindFiltro}
                onChange={(e) => setKindFiltro(e.target.value)}
                className="w-full px-2 py-1.5 rounded-lg bg-[#202432] border border-[#30364b] text-xs text-[#e9ecf6] focus:outline-none focus:border-[#80ddc6]"
              >
                <option value="">Todas as naturezas</option>
                <option value="dados">Fluxo de Dados & Mensageria (ISO/Clearing)</option>
                <option value="calculo">Regra de Cálculo & Qualificação (IC/IRD)</option>
                <option value="financeiro">Fluxo Financeiro (Tarifa/Settlement)</option>
                <option value="compliance">Monitoria, Disputa & Penalidade</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleClearFilters}
            className="w-full py-2 px-3 rounded-lg bg-[#202432] hover:bg-[#282d3e] border border-[#30364b] hover:border-[#80ddc6] text-xs font-semibold text-[#e9ecf6] flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <RotateCcw size={13} />
            Limpar filtros e foco
          </button>

          {/* 5. Estado da Curadoria & Métricas do Ecossistema */}
          <div className="p-3.5 rounded-xl bg-[#11131a] border border-[#30364b] text-xs space-y-1.5 mt-auto">
            <div className="text-[10px] font-bold uppercase tracking-widest text-[#80ddc6] mb-1">
              Métricas do Atlas
            </div>
            <div className="flex justify-between">
              <span className="text-[#9ba4ba]">Conceitos visíveis</span>
              <b className="text-[#e9ecf6]">
                {visibleNodes.length} / {mapaData.nos.length}
              </b>
            </div>
            <div className="flex justify-between">
              <span className="text-[#9ba4ba]">Ligações mapeadas</span>
              <b className="text-[#80ddc6]">
                {visibleEdges.length} / {mapaData.arestas.length}
              </b>
            </div>
            <div className="flex justify-between">
              <span className="text-[#9ba4ba]">Jornadas guiadas</span>
              <b className="text-[#b6a0f2]">{mapaData.rotasGuiadas.length} trilhas</b>
            </div>
            <div className="flex justify-between">
              <span className="text-[#9ba4ba]">Cobertura de arranjos</span>
              <b className="text-[#f6c775]">Visa · MC · Elo · CIP</b>
            </div>
            <p className="text-[11px] text-[#7c869e] pt-1.5 border-t border-[#222738] leading-relaxed">
              Clique em um <b>nó</b> para ver a ficha completa do conceito e ativar o{" "}
              <span className="text-[#80ddc6]">Efeito Borboleta</span>, ou clique em uma{" "}
              <b>ligação</b> para auditar campos ISO e regras de cálculo.
            </p>
          </div>
        </aside>

        {/* ════════════════════════════════════════════════════════════════════
            COLUNA 2 (CENTRO): GRAFO INTERATIVO SVG + LISTA DE LIGAÇÕES E REGRAS
           ════════════════════════════════════════════════════════════════════ */}
        <main className="p-4 flex flex-col gap-3 min-w-0 min-h-0 overflow-y-auto bg-[#11131a]">
          {/* Barra de Ferramentas do Grafo */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div>
              <h2 className="text-sm font-bold text-[#e9ecf6] m-0 flex items-center gap-2">
                Mapa de Arquitetura & Relações do Ecossistema
                {focusNodeId && nodeMap.get(focusNodeId) && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#273e39] text-[#80ddc6] text-[11px] font-semibold">
                    Foco: {nodeMap.get(focusNodeId)!.label}
                    <button
                      onClick={() => setFocusNodeId(null)}
                      className="ml-1 text-[10px] hover:underline"
                    >
                      ×
                    </button>
                  </span>
                )}
              </h2>
              <div className="text-[11px] text-[#9ba4ba]">
                {visibleNodes.length} conceitos ativos · {visibleEdges.length} de{" "}
                {mapaData.arestas.length} ligações ·{" "}
                {inspectMode === "node"
                  ? `Inspecionando conceito: ${activeNode?.label}`
                  : `Inspecionando relação: ${activeEdge?.id} (${activeEdge?.label})`}
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setShowLanes((s) => !s)}
                className={`px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-all cursor-pointer ${
                  showLanes
                    ? "bg-[#202432] border-[#80ddc6]/50 text-[#80ddc6]"
                    : "bg-[#191c26] border-[#30364b] text-[#9ba4ba]"
                }`}
              >
                <Layers size={12} className="inline mr-1" />
                Camadas
              </button>
              <button
                onClick={() => setZoom((z) => Math.max(0.55, Number((z / 1.18).toFixed(2))))}
                className="px-2.5 py-1 rounded-lg bg-[#202432] hover:border-[#80ddc6] border border-[#30364b] text-xs cursor-pointer"
                aria-label="Diminuir zoom"
              >
                <ZoomOut size={13} />
              </button>
              <button
                onClick={() => {
                  setZoom(1);
                  setPan({ x: 0, y: 0 });
                }}
                className="px-2.5 py-1 rounded-lg bg-[#202432] hover:border-[#80ddc6] border border-[#30364b] text-[11px] font-medium cursor-pointer"
              >
                <Maximize2 size={11} className="inline mr-1" />
                Enquadrar
              </button>
              <button
                onClick={() => setZoom((z) => Math.min(2.6, Number((z * 1.18).toFixed(2))))}
                className="px-2.5 py-1 rounded-lg bg-[#202432] hover:border-[#80ddc6] border border-[#30364b] text-xs cursor-pointer"
                aria-label="Aumentar zoom"
              >
                <ZoomIn size={13} />
              </button>
            </div>
          </div>

          {/* Legenda de Fluxos */}
          <div className="flex items-center justify-between gap-3 flex-wrap text-[11px] text-[#9ba4ba] px-1">
            <div className="flex items-center gap-4 flex-wrap">
              {(Object.entries(EDGE_KIND_META) as [EdgeKind, (typeof EDGE_KIND_META)[EdgeKind]][]).map(
                ([key, meta]) => (
                  <button
                    key={key}
                    onClick={() => setKindFiltro(kindFiltro === key ? "" : key)}
                    className={`inline-flex items-center gap-1.5 cursor-pointer transition-opacity ${
                      kindFiltro && kindFiltro !== key ? "opacity-40" : "opacity-100"
                    }`}
                  >
                    <span
                      className="inline-block w-2.5 h-2.5 rounded-full"
                      style={{ background: meta.color }}
                    />
                    <span>{meta.label}</span>
                  </button>
                )
              )}
            </div>
            <span className="text-[10px] text-[#73819c]">
              Dica: Clique numa seta ou linha da lista abaixo para ver o payload técnico
            </span>
          </div>

          {/* VISÃO 1: GRAFO INTERATIVO SVG */}
          {viewMode === "graph" ? (
            <div
              className="border border-[#30364b] rounded-2xl relative overflow-hidden shrink-0"
              style={{
                background:
                  "radial-gradient(ellipse at 48% 35%, #23253a 0%, #141822 72%)",
                height: "min(56vh, 590px)",
                minHeight: 410,
              }}
            >
              <svg
                ref={svgRef}
                viewBox="0 0 1260 960"
                className="w-full h-full block touch-none"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                onWheel={handleWheel}
                role="img"
                aria-label="Atlas Interativo do Ecossistema de Pagamentos"
              >
                <defs>
                  <marker
                    id="arrow-dados"
                    viewBox="0 0 10 10"
                    refX="8.5"
                    refY="5"
                    markerWidth="5.5"
                    markerHeight="5.5"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#80ddc6" />
                  </marker>
                  <marker
                    id="arrow-calculo"
                    viewBox="0 0 10 10"
                    refX="8.5"
                    refY="5"
                    markerWidth="5.5"
                    markerHeight="5.5"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#b6a0f2" />
                  </marker>
                  <marker
                    id="arrow-financeiro"
                    viewBox="0 0 10 10"
                    refX="8.5"
                    refY="5"
                    markerWidth="5.5"
                    markerHeight="5.5"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#f59e0b" />
                  </marker>
                  <marker
                    id="arrow-compliance"
                    viewBox="0 0 10 10"
                    refX="8.5"
                    refY="5"
                    markerWidth="5.5"
                    markerHeight="5.5"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#f87171" />
                  </marker>
                </defs>

                <g
                  transform={`translate(${pan.x} ${pan.y}) translate(630 480) scale(${zoom}) translate(-630 -480)`}
                >
                  {/* Swimlanes Horizontais de Arquitetura */}
                  {showLanes &&
                    SWIMLANES.map((lane, idx) => (
                      <g key={idx}>
                        <rect
                          x={20}
                          y={lane.y}
                          width={1220}
                          height={lane.h}
                          rx={14}
                          fill={`${lane.color}07`}
                          stroke={`${lane.color}22`}
                          strokeDasharray="6 6"
                        />
                        <text
                          x={36}
                          y={lane.y + 18}
                          fill={`${lane.color}99`}
                          fontSize={10}
                          fontWeight={700}
                          letterSpacing="1.2px"
                        >
                          {lane.title}
                        </text>
                      </g>
                    ))}

                  {/* Arestas (Ligações) */}
                  {visibleEdges.map((e) => {
                    const geom = computeEdgeGeometry(e);
                    if (!geom) return null;
                    const kindMeta =
                      EDGE_KIND_META[(e.kind as EdgeKind) || "dados"] ||
                      EDGE_KIND_META.dados;
                    const isSelected = selectedEdgeId === e.id;
                    const isDirectFocus =
                      focusNodeId &&
                      (e.source === focusNodeId || e.target === focusNodeId);
                    const isButterflyEdge =
                      butterflySet &&
                      butterflySet.all.has(e.source) &&
                      butterflySet.all.has(e.target);

                    let opacity = 0.45;
                    if (isSelected) {
                      opacity = 1;
                    } else if (focusNodeId && butterflySet) {
                      opacity = isDirectFocus ? 0.95 : isButterflyEdge ? 0.65 : 0.1;
                    }

                    const strokeWidth = isSelected ? 3.4 : isDirectFocus ? 2.5 : 1.7;

                    return (
                      <g
                        key={e.id}
                        data-edge-id={e.id}
                        onClick={() => handleSelectEdge(e.id)}
                        className="cursor-pointer"
                      >
                        <path
                          d={geom.path}
                          fill="none"
                          stroke={kindMeta.color}
                          strokeWidth={strokeWidth}
                          opacity={opacity}
                          strokeDasharray={kindMeta.dashed && !isSelected ? "5 4" : undefined}
                          markerEnd={`url(#arrow-${e.kind || "dados"})`}
                        />
                        {/* Hitbox larga transparente para facilitar o clique */}
                        <path
                          d={geom.path}
                          fill="none"
                          stroke="transparent"
                          strokeWidth={16}
                        >
                          <title>{`${e.id} · ${e.label} (${e.direction})`}</title>
                        </path>

                        {/* Badge de código na aresta quando selecionada ou diretamente conectada ao nó focado */}
                        {(isSelected || isDirectFocus) && (
                          <g transform={`translate(${geom.labelX}, ${geom.labelY})`}>
                            <rect
                              x={-18}
                              y={-9}
                              width={36}
                              height={18}
                              rx={5}
                              fill={isSelected ? "#101720" : "#181d2a"}
                              stroke={kindMeta.color}
                              strokeWidth={isSelected ? 1.8 : 1}
                            />
                            <text
                              y={3.5}
                              textAnchor="middle"
                              fill={kindMeta.color}
                              fontSize={9.5}
                              fontWeight={700}
                            >
                              {e.id}
                            </text>
                          </g>
                        )}
                      </g>
                    );
                  })}

                  {/* Nós (Conceitos) */}
                  {visibleNodes.map((n) => {
                    const cat: Categoria | undefined = catMap[n.categoria];
                    const cor = cat?.cor || "#80ddc6";
                    const isFocused = focusNodeId === n.id;
                    const isEdgeEndpoint =
                      inspectMode === "edge" &&
                      activeEdge &&
                      (activeEdge.source === n.id || activeEdge.target === n.id);
                    const isDimmed =
                      focusNodeId &&
                      butterflySet &&
                      !butterflySet.all.has(n.id) &&
                      !isEdgeEndpoint;
                    const isUpstream = butterflySet?.upstream.has(n.id);
                    const isDownstream = butterflySet?.downstream.has(n.id);

                    const pillW = Math.max(114, n.label.length * 7.2 + 28);
                    const pillH = 34;

                    return (
                      <g
                        key={n.id}
                        data-node-id={n.id}
                        transform={`translate(${n.x}, ${n.y})`}
                        onClick={() => handleSelectNode(n.id)}
                        className="cursor-pointer"
                        style={{
                          opacity: isDimmed ? 0.2 : 1,
                          transition: "opacity 0.2s ease",
                        }}
                      >
                        {/* Halo externo quando selecionado ou endpoint da ligação ativa */}
                        {(isFocused || isEdgeEndpoint) && (
                          <rect
                            x={-pillW / 2 - 5}
                            y={-pillH / 2 - 5}
                            width={pillW + 10}
                            height={pillH + 10}
                            rx={13}
                            fill="none"
                            stroke={isFocused ? "#80ddc6" : cor}
                            strokeWidth={2}
                            strokeDasharray={isEdgeEndpoint && !isFocused ? "4 3" : undefined}
                            opacity={0.85}
                          />
                        )}

                        {/* Corpo do Nó */}
                        <rect
                          x={-pillW / 2}
                          y={-pillH / 2}
                          width={pillW}
                          height={pillH}
                          rx={10}
                          fill={isFocused ? "#1e3536" : "#181e2c"}
                          stroke={isFocused ? "#80ddc6" : cor}
                          strokeWidth={isFocused ? 2.5 : 1.6}
                        />

                        {/* Ponto indicador da categoria */}
                        <circle
                          cx={-pillW / 2 + 12}
                          cy={0}
                          r={4}
                          fill={cor}
                        />

                        {/* Label Principal do Conceito */}
                        <text
                          x={5}
                          y={4}
                          textAnchor="middle"
                          fill="#f1f5f9"
                          fontSize={11.5}
                          fontWeight={700}
                        >
                          {n.label}
                        </text>

                        {/* Tag de papel no Efeito Borboleta */}
                        {efeitoBorboleta && focusNodeId && (isFocused || isUpstream || isDownstream) && (
                          <g transform={`translate(0, ${-pillH / 2 - 10})`}>
                            <rect
                              x={-38}
                              y={-8}
                              width={76}
                              height={14}
                              rx={4}
                              fill={
                                isFocused
                                  ? "#065f46"
                                  : isUpstream
                                  ? "#1e3a8a"
                                  : "#581c87"
                              }
                            />
                            <text
                              y={2}
                              textAnchor="middle"
                              fill="#ffffff"
                              fontSize={8.5}
                              fontWeight={700}
                            >
                              {isFocused
                                ? "● NÓ FOCADO"
                                : isUpstream
                                ? "← A MONTANTE"
                                : "→ A JUSANTE"}
                            </text>
                          </g>
                        )}

                        <title>{`${n.label} (${cat?.label || n.categoria}) — Clique para inspecionar`}</title>
                      </g>
                    );
                  })}
                </g>
              </svg>

              {/* Dica no rodapé do canvas */}
              <div className="absolute bottom-2.5 left-3.5 text-[10px] text-[#8a96b0] bg-[#11131a]/80 px-2.5 py-1 rounded-md border border-[#30364b]/60 pointer-events-none">
                Clique em um <b>Conceito</b> (caixa) ou <b>Ligação</b> (seta R01..R62) · Arraste o fundo para mover · Scroll do mouse para zoom
              </div>
            </div>
          ) : (
            /* VISÃO 2: MATRIZ EXECUTIVA QUEM ENVIA × QUEM RECEBE × COMO CALCULA */
            <div className="border border-[#30364b] rounded-2xl bg-[#191c26] overflow-auto max-h-[56vh]">
              <table className="w-full border-collapse text-left text-xs">
                <thead className="sticky top-0 bg-[#202432] border-b border-[#30364b] text-[11px] uppercase text-[#9ba4ba]">
                  <tr>
                    <th className="p-3">Conceito</th>
                    <th className="p-3">Camada / Bandeira</th>
                    <th className="p-3">Quem Envia (Origem)</th>
                    <th className="p-3">Quem Recebe (Destino)</th>
                    <th className="p-3">Como Calcula / Regra</th>
                    <th className="p-3">Campos Técnicos</th>
                    <th className="p-3 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#282d3e]">
                  {visibleNodes.map((n) => {
                    const cat = catMap[n.categoria];
                    const isFocused = activeNode?.id === n.id;
                    return (
                      <tr
                        key={n.id}
                        onClick={() => {
                          setFocusNodeId(n.id);
                          setInspectMode("node");
                        }}
                        className={`cursor-pointer transition-colors ${
                          isFocused ? "bg-[#25313a]" : "hover:bg-[#222736]"
                        }`}
                      >
                        <td className="p-3 font-bold text-[#e9ecf6] whitespace-nowrap">
                          <span
                            className="inline-block w-2 h-2 rounded-full mr-2"
                            style={{ background: cat?.cor || "#80ddc6" }}
                          />
                          {n.label}
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded bg-[#11131a] border border-[#30364b] text-[10px] text-[#80ddc6]">
                            {n.bandeira}
                          </span>
                          <div className="text-[10px] text-[#9ba4ba] mt-1">
                            {SUBDOMINIO_LABELS[n.subdominio] || n.subdominio}
                          </div>
                        </td>
                        <td className="p-3 text-[11px] text-[#c5cbe0] max-w-[200px]">
                          {n.quemEnvia}
                        </td>
                        <td className="p-3 text-[11px] text-[#c5cbe0] max-w-[200px]">
                          {n.quemRecebe}
                        </td>
                        <td className="p-3 text-[11px] text-[#e9ecf6] max-w-[260px]">
                          {n.comoCalcula}
                        </td>
                        <td className="p-3 font-mono text-[10px] text-[#b6a0f2] max-w-[180px]">
                          {(n.camposTecnicos || []).slice(0, 3).join(" · ")}
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={(ev) => {
                              ev.stopPropagation();
                              setFocusNodeId(n.id);
                              setInspectMode("node");
                              setViewMode("graph");
                            }}
                            className="px-2.5 py-1 rounded bg-[#273e39] text-[#80ddc6] text-[11px] font-semibold hover:opacity-90 cursor-pointer"
                          >
                            Ver no Grafo
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* ── Lista Sincronizada de Ligações e Regras (Padrão Liquidação Internacional) ── */}
          <section className="border border-[#30364b] rounded-xl bg-[#191c26] overflow-hidden flex-1 flex flex-col min-h-[210px]">
            <div className="px-3.5 py-2.5 border-b border-[#30364b] flex items-center justify-between gap-2 bg-[#1d212d]">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#e9ecf6] m-0 flex items-center gap-1.5">
                <GitCommit size={14} className="text-[#80ddc6]" />
                Ligações, Fluxos e Regras Mapeadas ({listedEdges.length})
              </h3>
              <span className="text-[11px] text-[#9ba4ba]">
                {focusNodeId && nodeMap.get(focusNodeId)
                  ? `Filtrado pelas conexões diretas de: ${nodeMap.get(focusNodeId)!.label}`
                  : "Mostrando todas as ligações visíveis · Clique para auditar"}
              </span>
            </div>

            <div className="overflow-y-auto divide-y divide-[#262b3d] max-h-[250px]">
              {listedEdges.length > 0 ? (
                listedEdges.map((e) => {
                  const fromNode = nodeMap.get(e.source);
                  const toNode = nodeMap.get(e.target);
                  const meta =
                    EDGE_KIND_META[(e.kind as EdgeKind) || "dados"] ||
                    EDGE_KIND_META.dados;
                  const isActive =
                    selectedEdgeId === e.id && inspectMode === "edge";

                  return (
                    <button
                      key={e.id}
                      onClick={() => handleSelectEdge(e.id)}
                      className={`w-full text-left px-3.5 py-2.5 flex items-center justify-between gap-3 transition-colors cursor-pointer ${
                        isActive
                          ? "bg-[#263142] shadow-[inset_3px_0_0_#80ddc6]"
                          : "hover:bg-[#222736]"
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-[#e9ecf6] truncate">
                          <span className="font-mono text-[#80ddc6] mr-1.5">
                            {e.id}
                          </span>
                          {e.label}
                        </div>
                        <div className="text-[11px] text-[#9ba4ba] truncate mt-0.5">
                          <span className="text-[#cbd5e1] font-medium">
                            {fromNode?.label}
                          </span>{" "}
                          →{" "}
                          <span className="text-[#cbd5e1] font-medium">
                            {toNode?.label}
                          </span>{" "}
                          · {e.brand} · {e.timing}
                        </div>
                      </div>

                      <span
                        className="px-2 py-0.5 rounded text-[10px] font-bold shrink-0"
                        style={{
                          background: meta.bg,
                          color: meta.color,
                          border: `1px solid ${meta.border}`,
                        }}
                      >
                        {meta.short}
                      </span>
                    </button>
                  );
                })
              ) : (
                <div className="p-6 text-center text-xs text-[#9ba4ba]">
                  Nenhuma ligação corresponde aos filtros atuais. Clique em{" "}
                  <b>Limpar filtros e foco</b> na barra esquerda.
                </div>
              )}
            </div>
          </section>
        </main>

        {/* ════════════════════════════════════════════════════════════════════
            COLUNA 3 (DIREITA): PAINEL DE RASTREABILIDADE & INSPEÇÃO PROFUNDA
           ════════════════════════════════════════════════════════════════════ */}
        <section
          aria-label="Painel de Rastreabilidade e Detalhes"
          className="bg-[#191c26] border-l border-[#30364b] p-4 overflow-y-auto flex flex-col gap-3.5 min-h-0"
        >
          {/* Seletor de Modo: Inspecionar Conceito (Nó) vs Relação (Ligação) */}
          <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-[#11131a] border border-[#30364b] shrink-0">
            <button
              onClick={() => setInspectMode("node")}
              className={`py-1.5 px-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                inspectMode === "node"
                  ? "bg-[#273e39] text-[#80ddc6] border border-[#80ddc6]/40"
                  : "text-[#9ba4ba] hover:text-white"
              }`}
            >
              <span>🔵 Conceito</span>
              <span className="truncate max-w-[95px] font-normal opacity-80">
                ({activeNode?.label})
              </span>
            </button>
            <button
              onClick={() => setInspectMode("edge")}
              className={`py-1.5 px-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                inspectMode === "edge"
                  ? "bg-[#273e39] text-[#80ddc6] border border-[#80ddc6]/40"
                  : "text-[#9ba4ba] hover:text-white"
              }`}
            >
              <span>🔗 Relação</span>
              <span className="font-mono font-normal opacity-80">
                ({activeEdge?.id})
              </span>
            </button>
          </div>

          {/* ──────────────────────────────────────────────────────────────────
              MODO A: FICHA COMPLETA DO CONCEITO (NÓ SELECIONADO)
             ────────────────────────────────────────────────────────────────── */}
          {inspectMode === "node" && activeNode && (
            <div className="space-y-3.5">
              {/* Cabeçalho do Conceito */}
              <div>
                <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
                  <span
                    className="px-2 py-0.5 rounded text-[10px] font-bold uppercase"
                    style={{
                      background: catMap[activeNode.categoria]?.corFundo,
                      color: catMap[activeNode.categoria]?.cor,
                      border: `1px solid ${catMap[activeNode.categoria]?.corBorda}`,
                    }}
                  >
                    {catMap[activeNode.categoria]?.label}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-[#202432] border border-[#30364b] text-[10px] font-semibold text-[#80ddc6]">
                    Bandeira: {activeNode.bandeira}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-[#202432] border border-[#30364b] text-[10px] text-[#b6a0f2]">
                    {SUBDOMINIO_LABELS[activeNode.subdominio] || activeNode.subdominio}
                  </span>
                </div>

                <h2 className="text-lg font-bold text-[#e9ecf6] leading-snug m-0">
                  {activeNode.label}
                </h2>
              </div>

              {/* Explicação Didática (Analogia + Sabia?) */}
              {didatico && activeNode.analogy && (
                <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-400/30 space-y-1.5">
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-blue-300 flex items-center gap-1.5">
                    <span>💡</span> Tradução Didática (Analogia)
                  </div>
                  <p className="text-xs text-blue-100 italic leading-relaxed m-0">
                    “{activeNode.analogy}”
                  </p>
                  {activeNode.curiosidade && (
                    <p className="text-[11px] text-blue-200/80 pt-1.5 border-t border-blue-400/20 m-0">
                      <b>Nota de Mercado:</b> {activeNode.curiosidade}
                    </p>
                  )}
                </div>
              )}

              {/* Definição Técnica */}
              <div className="p-3 rounded-xl bg-[#202432] border border-[#30364b]">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#9ba4ba] mb-1">
                  Definição Técnica & Arquitetura
                </div>
                <p className="text-xs text-[#e9ecf6] leading-relaxed m-0">
                  {activeNode.descricao}
                </p>
              </div>

              {/* Protocolo de Rastreabilidade (Quem Envia / Quem Recebe / Como Calcula) */}
              <div className="p-3.5 rounded-xl bg-[#141822] border border-[#30364b] space-y-2.5">
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#80ddc6] flex items-center gap-1.5">
                  <CheckCircle2 size={12} />
                  Protocolo de Rastreabilidade (Domínio)
                </div>

                <dl className="grid grid-cols-[95px_1fr] gap-x-2.5 gap-y-2 text-xs m-0">
                  <dt className="text-[#9ba4ba] font-medium">Quem envia</dt>
                  <dd className="text-[#e9ecf6] m-0">{activeNode.quemEnvia}</dd>

                  <dt className="text-[#9ba4ba] font-medium">Quem recebe</dt>
                  <dd className="text-[#e9ecf6] m-0">{activeNode.quemRecebe}</dd>

                  <dt className="text-[#9ba4ba] font-medium">Como calcula</dt>
                  <dd className="text-[#80ddc6] font-medium m-0">
                    {activeNode.comoCalcula}
                  </dd>
                </dl>
              </div>

              {/* Efeito Borboleta / Impacto & Exceções */}
              {activeNode.impacto && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#80ddc6] mb-1">
                    🦋 Efeito Borboleta (Impacto no Ecossistema)
                  </div>
                  <p className="text-xs text-emerald-100 leading-relaxed m-0">
                    {activeNode.impacto}
                  </p>
                </div>
              )}

              {activeNode.excecoes && (
                <div className="p-3 rounded-xl bg-amber-500/10 border-l-2 border-[#f6c775] text-xs text-[#f3dcb3] leading-relaxed">
                  <b className="block text-[10px] uppercase tracking-wider text-[#f6c775] mb-0.5">
                    ⚠️ Exceções, Limites & Armadilhas
                  </b>
                  {activeNode.excecoes}
                </div>
              )}

              {/* Campos Técnicos / Mensageria / Arquivos */}
              {activeNode.camposTecnicos && activeNode.camposTecnicos.length > 0 && (
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#9ba4ba] mb-1.5">
                    Campos ISO 8583, PDS, Tabelas & Arquivos
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {activeNode.camposTecnicos.map((c, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 rounded-md bg-[#101720] border border-[#30364b] font-mono text-[11px] text-[#80ddc6]"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Conexões Diretas A Montante e A Jusante (Navegáveis) */}
              <div className="grid grid-cols-1 gap-2.5 pt-1">
                {activeNodeConnections.incoming.length > 0 && (
                  <div className="p-2.5 rounded-xl bg-[#141822] border border-[#282e42]">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-blue-300 mb-1.5">
                      ⬅️ Alimentado por ({activeNodeConnections.incoming.length} a montante)
                    </div>
                    <div className="flex flex-col gap-1">
                      {activeNodeConnections.incoming.map(({ edge, node }) => (
                        <div
                          key={edge.id}
                          className="flex items-center justify-between gap-2 text-[11px] p-1.5 rounded-lg bg-[#191c26] hover:bg-[#232838]"
                        >
                          <button
                            onClick={() => handleSelectNode(node.id)}
                            className="font-semibold text-[#e9ecf6] hover:text-[#80ddc6] text-left truncate cursor-pointer"
                          >
                            {node.label}{" "}
                            <span className="text-[#9ba4ba] font-normal">
                              ({edge.label})
                            </span>
                          </button>
                          <button
                            onClick={() => handleSelectEdge(edge.id)}
                            className="px-1.5 py-0.5 rounded bg-[#273e39] text-[#80ddc6] font-mono text-[10px] shrink-0 cursor-pointer"
                          >
                            {edge.id}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeNodeConnections.outgoing.length > 0 && (
                  <div className="p-2.5 rounded-xl bg-[#141822] border border-[#282e42]">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-purple-300 mb-1.5">
                      ➡️ Impacta / Envia para ({activeNodeConnections.outgoing.length} a jusante)
                    </div>
                    <div className="flex flex-col gap-1">
                      {activeNodeConnections.outgoing.map(({ edge, node }) => (
                        <div
                          key={edge.id}
                          className="flex items-center justify-between gap-2 text-[11px] p-1.5 rounded-lg bg-[#191c26] hover:bg-[#232838]"
                        >
                          <button
                            onClick={() => handleSelectNode(node.id)}
                            className="font-semibold text-[#e9ecf6] hover:text-[#80ddc6] text-left truncate cursor-pointer"
                          >
                            {node.label}{" "}
                            <span className="text-[#9ba4ba] font-normal">
                              ({edge.label})
                            </span>
                          </button>
                          <button
                            onClick={() => handleSelectEdge(edge.id)}
                            className="px-1.5 py-0.5 rounded bg-[#273e39] text-[#80ddc6] font-mono text-[10px] shrink-0 cursor-pointer"
                          >
                            {edge.id}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Botões de Ação / Módulos Práticos */}
              <div className="flex flex-col gap-2 pt-2 border-t border-[#30364b]">
                {activeNode.ferramenta && (
                  <Link
                    href={activeNode.ferramenta.href}
                    className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[#273e39] hover:bg-[#2f4b45] border border-[#80ddc6]/40 text-xs font-bold text-[#80ddc6] transition-all"
                  >
                    <span className="flex items-center gap-2">
                      <Wrench size={14} />
                      Abrir Ferramenta: {activeNode.ferramenta.label}
                    </span>
                    <ArrowRight size={14} />
                  </Link>
                )}

                <div className="grid grid-cols-2 gap-2">
                  {activeNode.trilha && (
                    <Link
                      href={`/trilhas/${activeNode.trilha.id}/${activeNode.trilha.licao}`}
                      className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#202432] hover:border-[#80ddc6] border border-[#30364b] text-xs font-semibold text-[#e9ecf6] transition-all"
                    >
                      <BookOpen size={13} className="text-[#b6a0f2]" />
                      <span className="truncate">Aula da Trilha</span>
                    </Link>
                  )}
                  {activeNode.glossario && (
                    <Link
                      href={`/glossario?q=${encodeURIComponent(activeNode.glossario)}`}
                      className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#202432] hover:border-[#80ddc6] border border-[#30364b] text-xs font-semibold text-[#e9ecf6] transition-all"
                    >
                      <ExternalLink size={13} className="text-[#80ddc6]" />
                      <span>Ver no Glossário</span>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ──────────────────────────────────────────────────────────────────
              MODO B: FICHA DE EVIDÊNCIA & REGRA DA LIGAÇÃO (ARESTA R01..R62)
             ────────────────────────────────────────────────────────────────── */}
          {inspectMode === "edge" && activeEdge && (
            <div className="space-y-3.5">
              {(() => {
                const meta =
                  EDGE_KIND_META[(activeEdge.kind as EdgeKind) || "dados"] ||
                  EDGE_KIND_META.dados;
                const fromNode = nodeMap.get(activeEdge.source);
                const toNode = nodeMap.get(activeEdge.target);

                return (
                  <>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1.5">
                        <span
                          className="px-2 py-0.5 rounded text-[10px] font-bold"
                          style={{
                            background: meta.bg,
                            color: meta.color,
                            border: `1px solid ${meta.border}`,
                          }}
                        >
                          {meta.label}
                        </span>
                        <span className="font-mono text-xs font-bold text-[#80ddc6]">
                          · {activeEdge.id}
                        </span>
                      </div>

                      <h2 className="text-lg font-bold text-[#e9ecf6] leading-snug m-0">
                        {activeEdge.label}
                      </h2>

                      {/* Botões de Origem → Destino */}
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        {fromNode && (
                          <button
                            onClick={() => handleSelectNode(fromNode.id)}
                            className="px-2.5 py-1 rounded-lg bg-[#202432] hover:border-[#80ddc6] border border-[#30364b] text-xs font-semibold text-[#e9ecf6] cursor-pointer"
                          >
                            {fromNode.label}
                          </button>
                        )}
                        <ArrowRight size={14} className="text-[#80ddc6]" />
                        {toNode && (
                          <button
                            onClick={() => handleSelectNode(toNode.id)}
                            className="px-2.5 py-1 rounded-lg bg-[#202432] hover:border-[#80ddc6] border border-[#30364b] text-xs font-semibold text-[#e9ecf6] cursor-pointer"
                          >
                            {toNode.label}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Callout Principal da Regra */}
                    <div className="p-3 rounded-xl bg-[#252836] border border-[#363c52] text-xs text-[#e9ecf6] leading-relaxed">
                      {activeEdge.rule}
                    </div>

                    {/* Metadados Técnicos (Padrão dl.meta do Liquidação Internacional) */}
                    <dl className="grid grid-cols-[100px_1fr] gap-x-3 gap-y-2 text-xs p-3.5 rounded-xl bg-[#141822] border border-[#30364b] m-0">
                      <dt className="text-[#9ba4ba]">Bandeira / Rede</dt>
                      <dd className="text-[#e9ecf6] font-semibold m-0">
                        {activeEdge.brand}
                      </dd>

                      <dt className="text-[#9ba4ba]">Camada / Ciclo</dt>
                      <dd className="text-[#b6a0f2] font-medium m-0">
                        {SUBDOMINIO_LABELS[activeEdge.subdominio] ||
                          activeEdge.subdominio}
                      </dd>

                      <dt className="text-[#9ba4ba]">Papel dominante</dt>
                      <dd className="text-[#e9ecf6] capitalize m-0">
                        {activeEdge.role}
                      </dd>

                      <dt className="text-[#9ba4ba]">Janela / Timing</dt>
                      <dd className="text-[#80ddc6] font-medium m-0">
                        {activeEdge.timing}
                      </dd>

                      <dt className="text-[#9ba4ba]">Enviar → Receber</dt>
                      <dd className="text-[#e9ecf6] m-0">{activeEdge.direction}</dd>
                    </dl>

                    {/* Exceções e Limites */}
                    {activeEdge.exceptions && (
                      <div className="p-3 rounded-xl bg-[#2c2520] border-l-2 border-[#f6c775] text-xs text-[#ebd1a7] leading-relaxed">
                        <b className="block text-[10px] uppercase tracking-wider text-[#f6c775] mb-0.5">
                          ⚠️ Exceção / Risco de Downgrade ou Multa
                        </b>
                        {activeEdge.exceptions}
                      </div>
                    )}

                    {/* Abas de Evidência / Payload / Comparativo (Estilo Liquidação Internacional) */}
                    <div>
                      <div className="flex gap-1.5 mb-2">
                        <button
                          onClick={() => setEdgeDetailTab("payload")}
                          className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border cursor-pointer ${
                            edgeDetailTab === "payload"
                              ? "bg-[#202432] border-[#80ddc6] text-[#80ddc6]"
                              : "bg-[#141822] border-[#30364b] text-[#9ba4ba]"
                          }`}
                        >
                          Payload & Campos
                        </button>
                        <button
                          onClick={() => setEdgeDetailTab("nodes")}
                          className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border cursor-pointer ${
                            edgeDetailTab === "nodes"
                              ? "bg-[#202432] border-[#80ddc6] text-[#80ddc6]"
                              : "bg-[#141822] border-[#30364b] text-[#9ba4ba]"
                          }`}
                        >
                          Origem × Destino
                        </button>
                        <button
                          onClick={() => setEdgeDetailTab("tools")}
                          className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border cursor-pointer ${
                            edgeDetailTab === "tools"
                              ? "bg-[#202432] border-[#80ddc6] text-[#80ddc6]"
                              : "bg-[#141822] border-[#30364b] text-[#9ba4ba]"
                          }`}
                        >
                          Simuladores
                        </button>
                      </div>

                      {edgeDetailTab === "payload" && (
                        <blockquote className="m-0 p-3 rounded-xl bg-[#101720] border-l-2 border-[#80ddc6] font-mono text-[11px] text-[#d8dfee] whitespace-pre-wrap leading-relaxed">
                          {activeEdge.payload}
                        </blockquote>
                      )}

                      {edgeDetailTab === "nodes" && (
                        <div className="space-y-2">
                          {fromNode && (
                            <div className="p-2.5 rounded-xl bg-[#101720] border border-[#30364b] text-xs">
                              <div className="text-[10px] font-bold uppercase text-[#80ddc6]">
                                Origem: {fromNode.label}
                              </div>
                              <p className="text-[11px] text-[#c5cbe0] mt-1 mb-1.5">
                                {fromNode.comoCalcula}
                              </p>
                              <button
                                onClick={() => handleSelectNode(fromNode.id)}
                                className="text-[11px] text-[#80ddc6] hover:underline cursor-pointer"
                              >
                                Abrir ficha completa de {fromNode.label} →
                              </button>
                            </div>
                          )}
                          {toNode && (
                            <div className="p-2.5 rounded-xl bg-[#101720] border border-[#30364b] text-xs">
                              <div className="text-[10px] font-bold uppercase text-[#b6a0f2]">
                                Destino: {toNode.label}
                              </div>
                              <p className="text-[11px] text-[#c5cbe0] mt-1 mb-1.5">
                                {toNode.comoCalcula}
                              </p>
                              <button
                                onClick={() => handleSelectNode(toNode.id)}
                                className="text-[11px] text-[#80ddc6] hover:underline cursor-pointer"
                              >
                                Abrir ficha completa de {toNode.label} →
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {edgeDetailTab === "tools" && (
                        <div className="flex flex-col gap-2">
                          {fromNode?.ferramenta && (
                            <Link
                              href={fromNode.ferramenta.href}
                              className="flex items-center justify-between p-2.5 rounded-xl bg-[#202432] hover:border-[#80ddc6] border border-[#30364b] text-xs text-[#80ddc6] font-semibold"
                            >
                              <span>
                                🔧 {fromNode.ferramenta.label} ({fromNode.label})
                              </span>
                              <ArrowRight size={13} />
                            </Link>
                          )}
                          {toNode?.ferramenta &&
                            toNode.ferramenta.href !== fromNode?.ferramenta?.href && (
                              <Link
                                href={toNode.ferramenta.href}
                                className="flex items-center justify-between p-2.5 rounded-xl bg-[#202432] hover:border-[#80ddc6] border border-[#30364b] text-xs text-[#80ddc6] font-semibold"
                              >
                                <span>
                                  🔧 {toNode.ferramenta.label} ({toNode.label})
                                </span>
                                <ArrowRight size={13} />
                              </Link>
                            )}
                          <Link
                            href="/mapa/liquidacao"
                            className="flex items-center justify-between p-2.5 rounded-xl bg-[#141822] hover:border-[#80ddc6] border border-[#30364b] text-xs text-[#e9ecf6]"
                          >
                            <span>🌍 Ir para Atlas de Liquidação Internacional</span>
                            <ArrowRight size={13} />
                          </Link>
                          <Link
                            href="/mapa/mcbs"
                            className="flex items-center justify-between p-2.5 rounded-xl bg-[#141822] hover:border-[#80ddc6] border border-[#30364b] text-xs text-[#e9ecf6]"
                          >
                            <span>🧾 Ir para Atlas MCBS Faturamento</span>
                            <ArrowRight size={13} />
                          </Link>
                        </div>
                      )}
                    </div>
                  </>
                );
              })()}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
