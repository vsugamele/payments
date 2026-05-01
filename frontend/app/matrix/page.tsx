import type { Metadata } from 'next';
import MatrixClient from './MatrixClient';

export const metadata: Metadata = {
  title: 'Matriz de Intercâmbio — Decisão de Taxa | VS Payments',
  description:
    'Árvore de decisão completa do intercâmbio Visa e Mastercard: produto, canal, autenticação, MCC e status regulatório. Guia anti-downgrade incluso.',
};

export default function MatrixPage() {
  return <MatrixClient />;
}
