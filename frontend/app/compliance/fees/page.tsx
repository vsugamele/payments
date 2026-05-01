import { redirect } from "next/navigation";

// Scheme Fees (NABU / Cross-border) — conteúdo consolidado em /mcbs e /comparativo
export default function FeesRedirect() {
  redirect("/mcbs");
}
