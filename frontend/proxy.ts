import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  OWNER_SESSION_COOKIE,
  OWNER_UI_COOKIE,
  SESSION_TTL_SECONDS,
  createOwnerSessionToken,
  isValidAccessKey,
  verifyOwnerSessionToken,
} from "@/lib/ownerAuth";

export async function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const isProd = process.env.NODE_ENV === "production";

  // 1. Desconectar / Bloquear Acesso se logout=1
  if (searchParams.get("logout") === "1") {
    const response = NextResponse.redirect(new URL("/", request.url));
    response.cookies.delete(OWNER_SESSION_COOKIE);
    response.cookies.delete(OWNER_UI_COOKIE);
    return response;
  }

  // 2. Chave de acesso via query param (validada server-side contra ADMIN_ACCESS_KEY)
  const secretKey = searchParams.get("internal");
  if (secretKey && isValidAccessKey(secretKey)) {
    const targetUrl =
      pathname === "/" ? new URL("/admin", request.url) : new URL(request.url);
    targetUrl.searchParams.delete("internal");
    const token = await createOwnerSessionToken(SESSION_TTL_SECONDS);
    const response = NextResponse.redirect(targetUrl);
    response.cookies.set(OWNER_SESSION_COOKIE, token, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_TTL_SECONDS,
    });
    response.cookies.set(OWNER_UI_COOKIE, "1", {
      httpOnly: false,
      secure: isProd,
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_TTL_SECONDS,
    });
    return response;
  }

  // 3. Verificação criptográfica do cookie HttpOnly de sessão do Proprietário
  const sessionToken = request.cookies.get(OWNER_SESSION_COOKIE)?.value;
  const hasValidSession = await verifyOwnerSessionToken(sessionToken);

  if (hasValidSession) {
    return NextResponse.next();
  }

  // 4. Bloqueio de APIs privadas (/api/admin/* e /api/editor/*) sem sessão HttpOnly válida
  if (pathname.startsWith("/api/admin") || pathname.startsWith("/api/editor")) {
    const res = NextResponse.json(
      { error: "Acesso restrito. Faça login em /admin." },
      { status: 401 }
    );
    if (request.cookies.get(OWNER_UI_COOKIE)) {
      res.cookies.delete(OWNER_UI_COOKIE);
    }
    return res;
  }

  // 5. Rotas e Arquivos Públicos permitidos a todos
  const isPublicRoute =
    pathname === "/" ||
    pathname === "/curriculo" ||
    pathname === "/sobre" ||
    pathname === "/noticias" ||
    pathname.startsWith("/noticias/") ||
    pathname === "/artigos" ||
    pathname.startsWith("/artigos/") ||
    pathname === "/consultas" ||
    pathname.startsWith("/consultas/") ||
    pathname === "/glossario" ||
    pathname === "/guia" ||
    pathname.startsWith("/guia/") ||
    pathname === "/leituras" ||
    pathname === "/jornada" ||
    pathname === "/trilhas" ||
    pathname === "/feed.xml" ||
    pathname === "/sitemap.xml" ||
    pathname === "/robots.txt" ||
    pathname.startsWith("/opengraph-image") ||
    pathname.startsWith("/twitter-image") ||
    pathname === "/admin" ||
    pathname.startsWith("/api/auth") ||
    pathname === "/api/acervo/search" ||
    pathname === "/api/rag/ask_manuals" ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/mapas/") ||
    pathname.startsWith("/carousel/") ||
    pathname.startsWith("/favicon") ||
    pathname.endsWith(".jpg") ||
    pathname.endsWith(".jpeg") ||
    pathname.endsWith(".png") ||
    pathname.endsWith(".svg") ||
    pathname.endsWith(".ico") ||
    pathname.endsWith(".pdf") ||
    pathname.endsWith(".webp");

  if (isPublicRoute) {
    const res = NextResponse.next();
    // Limpa cookie de UI forjado caso não haja sessão HttpOnly real
    if (request.cookies.get(OWNER_UI_COOKIE)) {
      res.cookies.delete(OWNER_UI_COOKIE);
    }
    return res;
  }

  // 6. Qualquer outra rota técnica/regulatória é bloqueada para visitantes e redirecionada para a Home
  const redirectRes = NextResponse.redirect(new URL("/", request.url));
  if (request.cookies.get(OWNER_UI_COOKIE)) {
    redirectRes.cookies.delete(OWNER_UI_COOKIE);
  }
  return redirectRes;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
