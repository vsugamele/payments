import GuiaOrganizedClient from "./GuiaOrganizedClient";

export const metadata = {
  title: "Guia Geral de Meios de Pagamento — Vinícius Sugamele",
  description:
    "Como funcionam cartões, clearing, intercâmbio, chargeback, Pix, MED 2.0, Boleto NPC, Open Finance, KYC e o Split Payment da Reforma Tributária — organizado lado a lado (1. Ensinar ⇄ 2. Demonstrar).",
};

export default function GuiaPage() {
  return (
    <main className="bg-background min-h-dvh">
      <GuiaOrganizedClient />
    </main>
  );
}
