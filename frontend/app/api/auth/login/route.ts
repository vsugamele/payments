import { NextResponse } from "next/server";
import {
  OWNER_SESSION_COOKIE,
  OWNER_UI_COOKIE,
  SESSION_TTL_SECONDS,
  createOwnerSessionToken,
  isValidAccessKey,
} from "@/lib/ownerAuth";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const password = typeof body?.password === "string" ? body.password : "";

    if (!isValidAccessKey(password)) {
      return NextResponse.json(
        { ok: false, error: "Chave de acesso incorreta. Tente novamente." },
        { status: 401 }
      );
    }

    const token = await createOwnerSessionToken(SESSION_TTL_SECONDS);
    const isProd = process.env.NODE_ENV === "production";

    const response = NextResponse.json({ ok: true, authenticated: true });
    response.cookies.set(OWNER_SESSION_COOKIE, token, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_TTL_SECONDS,
    });
    // Cookie auxiliar apenas para UI (nunca confiado para autorização em proxy/API)
    response.cookies.set(OWNER_UI_COOKIE, "1", {
      httpOnly: false,
      secure: isProd,
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_TTL_SECONDS,
    });

    return response;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Não foi possível processar o login." },
      { status: 500 }
    );
  }
}
