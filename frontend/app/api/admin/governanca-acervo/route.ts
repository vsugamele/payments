import { NextResponse } from "next/server";
import governancaBundle from "@/data/governanca-bundle.json";
import acervoPlugged from "@/data/acervo-plugged-bundle.json";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    ...governancaBundle,
    plugged: acervoPlugged,
  });
}
