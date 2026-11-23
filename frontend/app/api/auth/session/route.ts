import { NextRequest, NextResponse } from "next/server";
import {
  OWNER_SESSION_COOKIE,
  OWNER_UI_COOKIE,
  verifyOwnerSessionToken,
} from "@/lib/ownerAuth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(OWNER_SESSION_COOKIE)?.value;
  const authenticated = await verifyOwnerSessionToken(token);

  const response = NextResponse.json({ authenticated });

  // Se alguém manipulou manualmente o cookie de UI sem sessão HttpOnly válida, limpa na hora
  if (!authenticated && req.cookies.get(OWNER_UI_COOKIE)) {
    response.cookies.delete(OWNER_UI_COOKIE);
  }

  return response;
}
