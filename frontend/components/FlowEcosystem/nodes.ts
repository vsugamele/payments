import { Node } from '@xyflow/react';

export type NodeData = {
  label: string;
  sub: string;
  icon: string;
  color: string;
};

export const initialNodes: Node<NodeData>[] = [
  // ── Swimlane backgrounds (rendered first = behind all nodes) ──────────────
  {
    id: 'lane_visa',
    type: 'lane',
    position: { x: 655, y: -20 },
    data: { label: 'Visa Lane', color: '#1d4ed8' } as unknown as NodeData,
    style: { width: 570, height: 295 },
    selectable: false,
    draggable: false,
    connectable: false,
    focusable: false,
  },
  {
    id: 'lane_mc',
    type: 'lane',
    position: { x: 655, y: 415 },
    data: { label: 'Mastercard Lane', color: '#dc2626' } as unknown as NodeData,
    style: { width: 570, height: 295 },
    selectable: false,
    draggable: false,
    connectable: false,
    focusable: false,
  },

  // Lojista -> Gateway -> Adquirente
  {
    id: 'lojista',
    type: 'custom',
    position: { x: 50, y: 300 },
    data: { label: 'Lojista / POS', sub: 'Início da Compra', icon: 'Store', color: '#10b981' }
  },
  {
    id: 'gateway',
    type: 'custom',
    position: { x: 250, y: 300 },
    data: { label: 'Gateway', sub: 'Captura ISO 8583', icon: 'Zap', color: '#8b5cf6' }
  },
  {
    id: 'adquirente',
    type: 'custom',
    position: { x: 450, y: 300 },
    data: { label: 'Adquirente', sub: 'Roteamento BIN', icon: 'Building2', color: '#f59e0b' }
  },

  // Visa Swimlane (Top)
  {
    id: 'visa_switch',
    type: 'custom',
    position: { x: 700, y: 150 },
    data: { label: 'VisaNet', sub: 'Switch & STIP', icon: 'Activity', color: '#1d4ed8' }
  },
  {
    id: 'visa_issuer',
    type: 'custom',
    position: { x: 950, y: 150 },
    data: { label: 'Emissor Visa', sub: 'Autorização (ACS)', icon: 'Landmark', color: '#1d4ed8' }
  },
  {
    id: 'visa_clearing',
    type: 'custom',
    position: { x: 950, y: 20 },
    data: { label: 'Visa VSS / Base II', sub: 'Clearing & Taxas', icon: 'FileBox', color: '#0ea5e9' }
  },

  // Mastercard Swimlane (Bottom)
  {
    id: 'mc_switch',
    type: 'custom',
    position: { x: 700, y: 450 },
    data: { label: 'Banknet', sub: 'Switch & STIP', icon: 'Activity', color: '#dc2626' }
  },
  {
    id: 'mc_issuer',
    type: 'custom',
    position: { x: 950, y: 450 },
    data: { label: 'Emissor Mastercard', sub: 'Autorização (ACS)', icon: 'Landmark', color: '#dc2626' }
  },
  {
    id: 'mc_clearing',
    type: 'custom',
    position: { x: 950, y: 580 },
    data: { label: 'Mastercard IPM', sub: 'Clearing & Taxas', icon: 'FileBox', color: '#f59e0b' }
  },

  // Liquidação (Merge)
  {
    id: 'settlement',
    type: 'custom',
    position: { x: 1250, y: 300 },
    data: { label: 'Liquidação SPB', sub: 'Transferência Financeira', icon: 'DollarSign', color: '#10b981' }
  },

  // 3DS Server (entre adquirente e switches)
  {
    id: 'tds_server',
    type: 'custom',
    position: { x: 700, y: 310 },
    data: { label: '3DS Server', sub: 'Autenticação Online', icon: 'ShieldCheck', color: '#a855f7' }
  },

  // VTS / MDES (Tokenização — ao lado do gateway)
  {
    id: 'token_service',
    type: 'custom',
    position: { x: 250, y: 150 },
    data: { label: 'VTS / MDES', sub: 'Token Service', icon: 'Fingerprint', color: '#06b6d4' }
  }
];
