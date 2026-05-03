import type { Metadata } from 'next';
import VisaBusinessClient from './VisaBusinessClient';

export const metadata: Metadata = {
  title: 'Visa Business & Data Intelligence | VS Payments',
  description: 'Exploração técnica de soluções B2B Connect, Commercial Solutions (L3 Data), VBASS e DAF no ecossistema Visa.',
};

export default function VisaBusinessPage() {
  return (
    <div className="min-h-screen bg-[#05080f]">
      <div className="max-w-7xl mx-auto px-6 py-24">
        <VisaBusinessClient />
      </div>
    </div>
  );
}
