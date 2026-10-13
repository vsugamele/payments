import { redirect } from "next/navigation";
import consultas from "@/data/consultas-publicas.json";

export async function generateStaticParams() {
  return consultas.map((c) => ({ slug: c.slug }));
}

export default function ConsultaDetalhePage() {
  redirect("/");
}
