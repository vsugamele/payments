import type { Metadata } from "next";
import BillingClient from "./BillingClient";

export const metadata: Metadata = {
  title: "Billing & Revenue Recovery Suite — Payments Management | VS Payments",
  description:
    "Suite completa de gestão de pagamentos: Inteligência de Decline Codes, Smart Retries, Calculadora de Revenue Recovery em Assinaturas e Monitor de Compliance VFMP/VDMP/ECP.",
};

export default function BillingPage() {
  return <BillingClient />;
}
