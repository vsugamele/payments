import { Edge } from '@xyflow/react';

export const initialEdges: Edge[] = [
  // Auth Flow
  { id: 'e-loj-gtw', source: 'lojista', target: 'gateway', animated: true, style: { stroke: '#94a3b8', strokeWidth: 2 } },
  { id: 'e-gtw-adq', source: 'gateway', target: 'adquirente', animated: true, style: { stroke: '#94a3b8', strokeWidth: 2 } },
  
  // Visa path (Auth)
  { id: 'e-adq-visa', source: 'adquirente', target: 'visa_switch', animated: true, label: 'ISO 0100', style: { stroke: '#3b82f6', strokeWidth: 2 } },
  { id: 'e-visa-iss', source: 'visa_switch', target: 'visa_issuer', animated: true, label: 'ARQC', style: { stroke: '#3b82f6', strokeWidth: 2 } },
  
  // Mastercard path (Auth)
  { id: 'e-adq-mc', source: 'adquirente', target: 'mc_switch', animated: true, label: 'ISO 0100', style: { stroke: '#ef4444', strokeWidth: 2 } },
  { id: 'e-mc-iss', source: 'mc_switch', target: 'mc_issuer', animated: true, label: 'ARQC', style: { stroke: '#ef4444', strokeWidth: 2 } },

  // Clearing / Settlement Visa (D+1)
  { id: 'e-visaiss-clear', source: 'visa_issuer', target: 'visa_clearing', type: 'smoothstep', animated: false, style: { strokeDasharray: '5 5', stroke: '#0ea5e9', strokeWidth: 2 }, label: 'D+1' },
  { id: 'e-visaclear-settle', source: 'visa_clearing', target: 'settlement', type: 'smoothstep', animated: false, style: { stroke: '#10b981', strokeWidth: 2 }, label: 'Net Position' },

  // Clearing / Settlement MC (D+1)
  { id: 'e-mciss-clear', source: 'mc_issuer', target: 'mc_clearing', type: 'smoothstep', animated: false, style: { strokeDasharray: '5 5', stroke: '#f59e0b', strokeWidth: 2 }, label: 'D+1' },
  { id: 'e-mcclear-settle', source: 'mc_clearing', target: 'settlement', type: 'smoothstep', animated: false, style: { stroke: '#10b981', strokeWidth: 2 }, label: 'Net Position' },
  
  // Settlement to Acquirer (Feedback loop)
  { id: 'e-settle-adq', source: 'settlement', target: 'adquirente', type: 'smoothstep', animated: true, style: { strokeDasharray: '4 4', stroke: '#10b981', strokeWidth: 1 }, label: 'Crédito Lojista (EFA)' },

  // 3DS flow (opcional — entre adquirente e switches)
  { id: 'e-adq-tds', source: 'adquirente', target: 'tds_server', animated: false, style: { strokeDasharray: '4 4', stroke: '#a855f7', strokeWidth: 1.5 }, label: '3DS Auth' },
  { id: 'e-tds-visa', source: 'tds_server', target: 'visa_switch', animated: false, style: { strokeDasharray: '4 4', stroke: '#a855f7', strokeWidth: 1.5 }, label: 'ECI' },
  { id: 'e-tds-mc',   source: 'tds_server', target: 'mc_switch',   animated: false, style: { strokeDasharray: '4 4', stroke: '#a855f7', strokeWidth: 1.5 }, label: 'ECI' },

  // Tokenização (VTS/MDES — entre gateway e adquirente)
  { id: 'e-gtw-token',   source: 'gateway',        target: 'token_service', animated: false, style: { strokeDasharray: '4 4', stroke: '#06b6d4', strokeWidth: 1.5 }, label: 'DPAN req' },
  { id: 'e-token-adq',   source: 'token_service',  target: 'adquirente',    animated: false, style: { strokeDasharray: '4 4', stroke: '#06b6d4', strokeWidth: 1.5 }, label: 'DPAN' }
];
