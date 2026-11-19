import SoftPOSClient from "./SoftPOSClient";
import { ModuleTeachDemoHeader } from "@/components/ModuleTeachDemoHeader";

export const metadata = {
  title: "SoftPOS & Tap to Phone (PCI MPoC) — VS Payments",
  description:
    "Entenda como transformar smartphones em terminais EMV Contactless certificados (1. Ensinar) e simule atestação e captura (2. Demonstrar).",
};

export default function SoftPOSPage() {
  return (
    <div className="bg-background min-h-screen pb-24">
      <ModuleTeachDemoHeader
        backHref="/compliance"
        backLabel="Voltar para Operação & Simulação"
        categoryPill="Captura Presencial & NFC"
        normativeBadge="PCI MPoC / CPoC · EMV Contactless Kernel"
        title="SoftPOS: Tap to Phone & Mobile Acceptance"
        subtitle="Transforme smartphones Android/iOS (COTS) em terminais EMV Contactless seguros com atestação em nuvem, PIN on Glass e qualificação de intercâmbio presencial."
        teachConcept="O SoftPOS executa o kernel EMV Contactless (Visa payWave / Mastercard PayPass / Elo NFC) diretamente na antena NFC de um smartphone comum (COTS), isolando chaves e captura de PIN por software certificado e monitoria remota."
        teachRule="Padrão PCI MPoC (Mobile Payments on COTS, sucessor do CPoC): exige atestação contínua de integridade do dispositivo (anti-root/jailbreak/hook) e criptografia ponta a ponta até o HSM da adquirente."
        teachPitfall="Se o adquirente classificar o POS Entry Mode como digitado (01/81) em vez de Contactless EMV (07) ou falhar em enviar a Tag 9F6E (Form Factor Indicator), a transação sofre downgrade para tarifa CNP."
        demoSteps={[
          "1. Na bancada interativa abaixo, simule o ciclo de atestação do dispositivo COTS e a leitura NFC do cartão ou carteira digital.",
          "2. Teste compras abaixo e acima do limite CVM (PIN on Glass) para ver como os bits de segurança EMV mudam.",
          "3. Clique em 'Consultar nos 4 Bancos SQLite do Acervo' para auditar os campos DE 22 (POS Entry Mode 07) e Tags EMV 9F6E / 9F33.",
        ]}
        acervoQuery="SoftPOS Tap to Phone PCI MPoC POS Entry Mode 07 Tag 9F6E Form Factor Indicator"
        lab3dHref="/jornada?track=cartao"
        lab3dLabel="Ver Captura Presencial no Lab 3D"
      />

      <div className="mx-auto max-w-6xl px-6 pt-10">
        <SoftPOSClient />
      </div>
    </div>
  );
}
