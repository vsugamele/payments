import { NextResponse } from "next/server";
import { OWNER_SESSION_COOKIE, OWNER_UI_COOKIE } from "@/lib/ownerAuth";

export async function POST() {
  const response = NextResponse.json({ ok: true, authenticated: false });
  response.cookies.delete(OWNER_SESSION_COOKIE);
  response.cookies.delete(OWNER_UI_COOKIE);
  return response;
}
