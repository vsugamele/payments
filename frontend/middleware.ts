import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // 1. Desconectar / Bloquear Acesso se logout=1
  if (searchParams.get("logout") === "1") {
    const response = NextResponse.redirect(new URL("/", request.url));
    response.cookies.delete("vs_internal_pass");
    return response;
  }

  // 2. Chave de acesso na URL (?internal=vs2026)
  const secretKey = searchParams.get("internal");
  if (secretKey === "vs2026") {
    const targetUrl = pathname === "/" ? new URL("/admin", request.url) : new URL(request.url);
    targetUrl.searchParams.delete("internal");
    const response = NextResponse.redirect(targetUrl);
    response.cookies.set("vs_internal_pass", "1", {
      path: "/",
      httpOnly: false,
      maxAge: 60 * 60 * 24 * 30, // 30 dias
      sameSite: "lax",
    });
    return response;
  }

  // 3. Verificação do Cookie de Autenticação do Proprietário
  const hasAuthCookie = request.cookies.get("vs_internal_pass")?.value === "1";

  // Se o proprietário estiver autenticado, libera o acesso a qualquer rota técnica
  if (hasAuthCookie) {
    return NextResponse.next();
  }

  // 4. Rotas e Arquivos Públicos permitidos a todos
  if (
    pathname === "/" ||
    pathname === "/sobre" ||
    pathname === "/admin" || // Permite abrir a tela de login do proprietário
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/mapas/") ||
    pathname.startsWith("/favicon") ||
    pathname.endsWith(".jpg") ||
    pathname.endsWith(".jpeg") ||
    pathname.endsWith(".png") ||
    pathname.endsWith(".svg") ||
    pathname.endsWith(".ico") ||
    pathname.endsWith(".pdf") ||
    pathname.endsWith(".webp")
  ) {
    return NextResponse.next();
  }

  // 5. Qualquer outra rota técnica/regulatória é bloqueada para visitantes e redirecionada para a Home
  return NextResponse.redirect(new URL("/", request.url));
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static files
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
