import LeiturasOrganizedClient from "./LeiturasOrganizedClient";

export const metadata = {
  title: "Leituras e Referências — Vinícius Sugamele",
  description:
    "Normas do Banco Central, manuais técnicos das bandeiras e livros de operação e liderança — organizados em caixinhas lado a lado (1. Ensinar ⇄ 2. Demonstrar no Workbench e SQLite).",
};

export default function LeiturasPage() {
  return (
    <main className="bg-background min-h-dvh">
      <LeiturasOrganizedClient />
    </main>
  );
}
