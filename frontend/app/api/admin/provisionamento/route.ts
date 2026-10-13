import { NextRequest, NextResponse } from "next/server";
import { execFile } from "child_process";
import { promisify } from "util";
import path from "path";

const execFileAsync = promisify(execFile);

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action") || "overview";
    const scriptPath = path.join(process.cwd(), "lib", "provisionamento_engine.py");

    const args = [scriptPath, action];
    if (action === "simulate") {
      const payload = searchParams.get("payload") || "{}";
      args.push(payload);
    }

    const { stdout } = await execFileAsync("python", args, {
      maxBuffer: 15 * 1024 * 1024,
      env: { ...process.env, PYTHONIOENCODING: "utf-8" },
    });

    return NextResponse.json(JSON.parse(stdout));
  } catch (error: any) {
    return NextResponse.json(
      { error: "Falha ao executar motor de provisionamento", detail: error?.message || String(error) },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const scriptPath = path.join(process.cwd(), "lib", "provisionamento_engine.py");
    const { stdout } = await execFileAsync(
      "python",
      [scriptPath, "simulate", JSON.stringify(body)],
      {
        maxBuffer: 15 * 1024 * 1024,
        env: { ...process.env, PYTHONIOENCODING: "utf-8" },
      }
    );
    return NextResponse.json(JSON.parse(stdout));
  } catch (error: any) {
    return NextResponse.json(
      { error: "Falha ao simular transação no motor", detail: error?.message || String(error) },
      { status: 500 }
    );
  }
}
