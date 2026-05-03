import ComplianceCommandCenter from "./ComplianceClient";

export const metadata = {
  title: "Compliance Command Center — VS Payments",
  description:
    "Plataforma de compliance para adquirentes e emissores: programas VAMP, ECP, EFM, PED, MATCH, lookup de campos DE/PDS e calculadora de risco.",
};

export default function CompliancePage() {
  return <ComplianceCommandCenter />;
}
