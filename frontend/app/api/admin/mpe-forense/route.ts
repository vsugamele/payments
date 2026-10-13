import { NextRequest, NextResponse } from "next/server";
import { execFile } from "child_process";
import { promisify } from "util";
import path from "path";

const execFileAsync = promisify(execFile);

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action") || "overview";
    const scriptPath = path.join(process.cwd(), "lib", "mpe_forense_engine.py");

    const args = [scriptPath, action];
    if (action === "decode") {
      args.push(searchParams.get("raw") || "");
    } else if (action === "search") {
      args.push(
        JSON.stringify({
          table_id: searchParams.get("table_id") || "IP0040T1",
          query: searchParams.get("query") || "",
          limit: Number(searchParams.get("limit") || 25),
        })
      );
    }

    const { stdout } = await execFileAsync("python", args, {
      maxBuffer: 15 * 1024 * 1024,
      env: { ...process.env, PYTHONIOENCODING: "utf-8" },
    });

    return NextResponse.json(JSON.parse(stdout));
  } catch (error: any) {
    return NextResponse.json(
      { error: "Falha ao executar motor forense MPE T068", detail: error?.message || String(error) },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const action = body.action || "search";
    const scriptPath = path.join(process.cwd(), "lib", "mpe_forense_engine.py");
    const arg2 = action === "decode" ? String(body.raw || "") : JSON.stringify(body);

    const { stdout } = await execFileAsync("python", [scriptPath, action, arg2], {
      maxBuffer: 15 * 1024 * 1024,
      env: { ...process.env, PYTHONIOENCODING: "utf-8" },
    });

    return NextResponse.json(JSON.parse(stdout));
  } catch (error: any) {
    return NextResponse.json(
      { error: "Falha ao processar operação forense MPE", detail: error?.message || String(error) },
      { status: 500 }
    );
  }
}
