import { NextResponse } from "next/server";
import governancaBundle from "@/data/governanca-bundle.json";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(governancaBundle);
}
