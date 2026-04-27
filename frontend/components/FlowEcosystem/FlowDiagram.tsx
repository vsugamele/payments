"use client";

import { useState, useCallback, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Node,
  ReactFlowProvider,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { ChevronRight, ChevronLeft, Map, Play, Pause, Minimize2, Maximize2 } from 'lucide-react';

import { initialNodes, NodeData } from './nodes';
import { initialEdges } from './edges';
import CustomNode from './CustomNode';
import LaneNode from './LaneNode';
import SidePanel from './SidePanel';
import { useTheme } from 'next-themes';

const nodeTypes = { custom: CustomNode, lane: LaneNode };

type Bandeira = 'ambas' | 'visa' | 'mastercard';

// Nós e arestas específicos de cada bandeira
const VISA_NODES  = new Set(['visa_switch', 'visa_issuer', 'visa_clearing']);
const MC_NODES    = new Set(['mc_switch', 'mc_issuer', 'mc_clearing']);
const VISA_EDGES  = new Set(['e-adq-visa', 'e-visa-iss', 'e-visaiss-clear', 'e-visaclear-settle', 'e-tds-visa']);
const MC_EDGES    = new Set(['e-adq-mc', 'e-mc-iss', 'e-mciss-clear', 'e-mcclear-settle', 'e-tds-mc']);

type TourStep = {
  title: string;
  description: string;
  activeNodes: string[];
  activeEdges: string[];
};

const TOUR_STEPS: TourStep[] = [
  {
    title: "Livre Exploração",
    description: "Navegue pelo mapa clicando nos nós para descobrir regras de negócio, arquivos ISO e conexões do sistema financeiro. Use as setas para o tour guiado.",
    activeNodes: [],
    activeEdges: [],
  },
  {
    title: "1. Captura e Roteamento",
    description: "A transação nasce no POS (Lojista). O Gateway empacota os dados em ISO 8583 — MTI 0100 — e envia para o Adquirente, que identifica a bandeira pelo BIN e roteia.",
    activeNodes: ['lojista', 'gateway', 'adquirente'],
    activeEdges: ['e-loj-gtw', 'e-gtw-adq'],
  },
  {
    title: "2. Tokenização (Wallets)",
    description: "Em pagamentos via Apple Pay ou Google Pay, o Gateway consulta o VTS/MDES antes de enviar ao Adquirente. O DPAN substitui o PAN — o lojista nunca vê o número real do cartão.",
    activeNodes: ['lojista', 'gateway', 'token_service', 'adquirente'],
    activeEdges: ['e-loj-gtw', 'e-gtw-token', 'e-token-adq', 'e-gtw-adq'],
  },
  {
    title: "3. Switch & Autorização",
    description: "O Adquirente roteia pelo BIN para a bandeira selecionada. A rede valida e encaminha ao Emissor, que verifica ARQC do chip, limite e risco. Resposta em menos de 1,5 segundo.",
    activeNodes: ['adquirente', 'visa_switch', 'visa_issuer', 'mc_switch', 'mc_issuer'],
    activeEdges: ['e-adq-visa', 'e-visa-iss', 'e-adq-mc', 'e-mc-iss'],
  },
  {
    title: "4. Autenticação 3DS",
    description: "Para e-commerce, o Adquirente aciona o 3DS Server antes da autorização. O resultado é um ECI — 05 (autenticado) reduz o intercâmbio; 07 (sem auth) aplica taxa CNP cheia.",
    activeNodes: ['adquirente', 'tds_server', 'visa_switch', 'mc_switch'],
    activeEdges: ['e-adq-tds', 'e-tds-visa', 'e-tds-mc'],
  },
  {
    title: "5. Arquivos de Clearing (D+1)",
    description: "À noite, adquirentes enviam BASE II (Visa) ou IPM (Mastercard) com todas as transações. É aqui que a Taxa de Intercâmbio é calculada — usando PID, AFS, ECI, MCC e canal.",
    activeNodes: ['visa_issuer', 'visa_clearing', 'mc_issuer', 'mc_clearing'],
    activeEdges: ['e-visaiss-clear', 'e-mciss-clear'],
  },
  {
    title: "6. Liquidação (SPB / CIP)",
    description: "O settlement final ocorre no Banco Central via CIP. Um único débito/crédito settle milhares de transações. Intercâmbio vai ao Emissor, Fee à Bandeira, saldo ao Lojista.",
    activeNodes: ['visa_clearing', 'mc_clearing', 'settlement', 'adquirente'],
    activeEdges: ['e-visaclear-settle', 'e-mcclear-settle', 'e-settle-adq'],
  },
];

// Filtra activeNodes/activeEdges de um passo removendo a bandeira não selecionada
function filterByBandeira(step: TourStep, bandeira: Bandeira) {
  if (bandeira === 'ambas') return step;
  const excludeNodes = bandeira === 'visa' ? MC_NODES : VISA_NODES;
  const excludeEdges = bandeira === 'visa' ? MC_EDGES : VISA_EDGES;
  return {
    ...step,
    activeNodes: step.activeNodes.filter((id) => !excludeNodes.has(id)),
    activeEdges: step.activeEdges.filter((id) => !excludeEdges.has(id)),
  };
}

// ─── FlowDiagramInner ────────────────────────────────────────────────────────

function FlowDiagramInner() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node<NodeData> | null>(null);
  const [tourStep, setTourStep]         = useState(0);
  const [minimized, setMinimized]       = useState(false);
  const [bandeira, setBandeira]         = useState<Bandeira>('ambas');
  const [isReplaying, setIsReplaying]   = useState(false);

  const { theme }  = useTheme();
  const { fitView } = useReactFlow();
  const isDark = theme === 'dark';

  const onNodeClick  = useCallback((_: React.MouseEvent, node: Node) => setSelectedNode(node as Node<NodeData>), []);
  const onPaneClick  = useCallback(() => setSelectedNode(null), []);

  // ── Replay automático ────────────────────────────────────────────────────
  useEffect(() => {
    if (!isReplaying) return;
    // se estiver em "livre exploração", pula direto para o passo 1
    if (tourStep === 0) { setTourStep(1); return; }
    const timer = setTimeout(() => {
      if (tourStep < TOUR_STEPS.length - 1) {
        setTourStep((p) => p + 1);
      } else {
        setIsReplaying(false); // chegou ao fim — para
      }
    }, 3500);
    return () => clearTimeout(timer);
  }, [isReplaying, tourStep]);

  // ── Atualiza opacidade ao mudar passo ou bandeira ────────────────────────
  useEffect(() => {
    const rawStep = TOUR_STEPS[tourStep];
    const stepDef = filterByBandeira(rawStep, bandeira);
    const isFree  = tourStep === 0;

    setNodes((nds) =>
      nds.map((n) => {
        // lanes nunca são afetadas pela opacidade do tour
        if (n.type === 'lane') return n;

        const isBandeiraHidden =
          (bandeira === 'visa'       && MC_NODES.has(n.id)) ||
          (bandeira === 'mastercard' && VISA_NODES.has(n.id));
        const isActive = isFree || stepDef.activeNodes.includes(n.id);
        return {
          ...n,
          style: {
            ...n.style,
            opacity: isBandeiraHidden ? 0.05 : isActive ? 1 : 0.15,
            transition: 'opacity 0.4s ease',
          },
        };
      })
    );

    setEdges((eds) =>
      eds.map((e) => {
        const isBandeiraHidden =
          (bandeira === 'visa'       && MC_EDGES.has(e.id)) ||
          (bandeira === 'mastercard' && VISA_EDGES.has(e.id));
        const isActive    = isFree || stepDef.activeEdges.includes(e.id);
        const origEdge    = initialEdges.find((ie) => ie.id === e.id);
        const shouldAnimate = !isBandeiraHidden && (isFree ? origEdge?.animated : isActive);
        return {
          ...e,
          animated: shouldAnimate,
          style: {
            ...e.style,
            opacity: isBandeiraHidden ? 0.03 : isActive ? 1 : 0.08,
            transition: 'opacity 0.4s ease',
          },
        };
      })
    );

    // Recentrar na área activa
    const focusNodes = stepDef.activeNodes.filter((id) => {
      if (bandeira === 'visa'       && MC_NODES.has(id)) return false;
      if (bandeira === 'mastercard' && VISA_NODES.has(id)) return false;
      return true;
    });

    const LANE_IDS = new Set(['lane_visa', 'lane_mc']);

    setTimeout(() => {
      if (!isFree && focusNodes.length > 0) {
        fitView({ nodes: focusNodes.map((id) => ({ id })), duration: 700, padding: 0.35 });
      } else {
        // Exclui lanes — elas têm dimensões grandes e distorcem o zoom do fitView
        const contentIds = initialNodes
          .filter((n) => !LANE_IDS.has(n.id))
          .map((n) => ({ id: n.id }));
        fitView({ nodes: contentIds, duration: 700, padding: 0.22 });
      }
    }, 150);
  }, [tourStep, bandeira, setNodes, setEdges, fitView]);

  const totalSteps = TOUR_STEPS.length - 1; // sem contar o "livre"

  return (
    <>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        minZoom={0.2}
        maxZoom={1.5}
        colorMode={isDark ? 'dark' : 'light'}
        className="touch-none"
      >
        <Background gap={16} size={1} color={isDark ? '#334155' : '#e2e8f0'} />
        <Controls className="bg-background border-border fill-foreground" />
        <MiniMap
          className="bg-background border-border"
          maskColor={isDark ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.4)'}
          nodeColor={(n) => (n.data as NodeData).color || '#64748b'}
        />
      </ReactFlow>

      {/* Side Panel */}
      <SidePanel node={selectedNode} onClose={() => setSelectedNode(null)} />

      {/* ── Tour panel ── */}
      {minimized ? (
        /* Pill minimizado */
        <div className="absolute top-4 left-4 z-10">
          <button
            onClick={() => setMinimized(false)}
            className="flex items-center gap-2 bg-background/90 backdrop-blur-md border border-border rounded-xl px-3.5 py-2 shadow-lg hover:bg-muted transition-colors"
          >
            {tourStep === 0
              ? <Map size={14} className="text-primary shrink-0" />
              : <Play size={14} className="text-primary shrink-0" />}
            <span className="text-xs font-semibold text-foreground">
              {tourStep === 0 ? 'Exploração Livre' : `Passo ${tourStep}/${totalSteps}`}
            </span>
            <span className="text-xs text-muted-foreground hidden sm:inline">
              — {TOUR_STEPS[tourStep].title}
            </span>
            <Maximize2 size={12} className="text-muted-foreground ml-1" />
          </button>
        </div>
      ) : (
        /* Painel expandido */
        <div className="absolute top-4 left-4 w-80 bg-background/90 backdrop-blur-md border border-border shadow-2xl rounded-2xl z-10 overflow-hidden flex flex-col transition-all">

          {/* Header: título + badge + minimizar */}
          <div className="p-4 border-b border-border bg-muted/30">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-sm font-bold text-foreground flex items-center gap-2 min-w-0">
                {tourStep === 0
                  ? <Map size={15} className="text-primary shrink-0" />
                  : <Play size={15} className="text-primary shrink-0" />}
                <span className="truncate">{TOUR_STEPS[tourStep].title}</span>
              </h1>
              <div className="flex items-center gap-1.5 shrink-0 ml-2">
                <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                  {tourStep === 0 ? 'LIVRE' : `${tourStep}/${totalSteps}`}
                </span>
                <button
                  onClick={() => setMinimized(true)}
                  className="p-1 rounded-md hover:bg-muted transition-colors text-muted-foreground"
                  title="Minimizar"
                >
                  <Minimize2 size={13} />
                </button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed min-h-[52px]">
              {TOUR_STEPS[tourStep].description}
            </p>
          </div>

          {/* Seletor de bandeira */}
          <div className="px-4 py-2.5 border-b border-border flex items-center gap-1.5">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mr-1">
              Fluxo:
            </span>
            {(['ambas', 'visa', 'mastercard'] as Bandeira[]).map((b) => (
              <button
                key={b}
                onClick={() => setBandeira(b)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                  bandeira === b
                    ? b === 'visa'
                      ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                      : b === 'mastercard'
                      ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                      : 'bg-primary/15 text-primary border border-primary/30'
                    : 'text-muted-foreground hover:text-foreground border border-transparent hover:border-border'
                }`}
              >
                {b === 'ambas' ? 'Ambas' : b === 'visa' ? 'Visa' : 'Mastercard'}
              </button>
            ))}
          </div>

          {/* Navegação: prev · dots · replay · next */}
          <div className="p-3 bg-background flex items-center justify-between gap-2">
            <button
              onClick={() => { setTourStep((p) => Math.max(0, p - 1)); setIsReplaying(false); }}
              disabled={tourStep === 0}
              className="p-2 rounded-lg hover:bg-muted disabled:opacity-30 transition-colors"
            >
              <ChevronLeft size={18} />
            </button>

            <div className="flex items-center gap-2">
              <div className="flex gap-1.5 flex-wrap justify-center">
                {TOUR_STEPS.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => { setTourStep(idx); setIsReplaying(false); }}
                    className={`rounded-full transition-all ${
                      tourStep === idx
                        ? 'w-4 h-2 bg-primary'
                        : 'w-2 h-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                    }`}
                  />
                ))}
              </div>

              {/* Replay automático */}
              <button
                onClick={() => {
                  if (isReplaying) {
                    setIsReplaying(false);
                  } else {
                    if (tourStep === TOUR_STEPS.length - 1) setTourStep(0);
                    setIsReplaying(true);
                  }
                }}
                title={isReplaying ? 'Pausar replay' : 'Replay automático'}
                className={`p-1.5 rounded-lg transition-all ${
                  isReplaying
                    ? 'bg-primary/15 text-primary'
                    : 'hover:bg-muted text-muted-foreground'
                }`}
              >
                {isReplaying ? <Pause size={14} /> : <Play size={14} />}
              </button>
            </div>

            <button
              onClick={() => { setTourStep((p) => Math.min(TOUR_STEPS.length - 1, p + 1)); setIsReplaying(false); }}
              disabled={tourStep === TOUR_STEPS.length - 1}
              className="p-2 rounded-lg hover:bg-muted disabled:opacity-30 transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Wrapper ─────────────────────────────────────────────────────────────────

export default function FlowDiagram() {
  return (
    <div className="w-full h-[calc(100vh-6rem)] relative bg-background rounded-2xl border overflow-hidden">
      <ReactFlowProvider>
        <FlowDiagramInner />
      </ReactFlowProvider>
    </div>
  );
}
