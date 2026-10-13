import { NextRequest, NextResponse } from "next/server";
import { execFile } from "child_process";
import { promisify } from "util";
import path from "path";

const execFileAsync = promisify(execFile);

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action") || "overview";
    const q = searchParams.get("q") || "";
    const scriptPath = path.join(process.cwd(), "lib", "subcredenciadores_engine.py");

    const args = [scriptPath, action];
    if (action === "search_catalogo") {
      args.push(q);
    }

    const { stdout } = await execFileAsync("python", args, {
      maxBuffer: 15 * 1024 * 1024,
      env: { ...process.env, PYTHONIOENCODING: "utf-8" },
    });

    return NextResponse.json(JSON.parse(stdout));
  } catch (error: any) {
    return NextResponse.json(
      { error: "Falha ao carregar módulo de Subcredenciadores & Catálogo", detail: error?.message || String(error) },
      { status: 500 }
    );
  }
}
