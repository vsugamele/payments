import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // 1. Arquivos públicos, assets do Next.js e raiz
  if (
    pathname === "/" ||
    pathname === "/sobre" ||
    pathname.startsWith("/_next") ||
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

  // 2. Chave de acesso interno para Vinícius (Backdoor privado de desenvolvimento)
  const secretKey = searchParams.get("internal");
  const hasAuthCookie = request.cookies.get("vs_internal_pass")?.value === "1";

  if (secretKey === "vs2026") {
    const response = NextResponse.next();
    response.cookies.set("vs_internal_pass", "1", {
      path: "/",
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 30, // 30 dias
      sameSite: "lax",
    });
    return response;
  }

  if (hasAuthCookie) {
    return NextResponse.next();
  }

  // 3. Qualquer outra rota técnica, regulatória ou de bandeira é redirecionada para a Home
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
