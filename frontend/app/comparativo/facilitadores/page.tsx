import type { Metadata } from 'next';
import FacilitadoresClient from './FacilitadoresClient';

export const metadata: Metadata = {
  title: 'Comparativo de Facilitadores & Regulação CP 522 | VS Payments',
  description:
    'Guia técnico comparativo completo de regras de Facilitadores de Pagamento, Marketplaces, carteiras digitais e impactos da CP 522 do BACEN.',
};

export default function FacilitadoresPage() {
  return <FacilitadoresClient />;
}
