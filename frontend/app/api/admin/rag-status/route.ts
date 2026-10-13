import { NextResponse } from "next/server";
import { spawn } from "child_process";
import path from "path";
import fs from "fs";

export const dynamic = "force-dynamic";

const SCRIPT_PATH = path.join(process.cwd(), "lib", "rag_status.py");

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query") || "";

  return executeRagStatus(query);
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const query = body.query || "";
    return executeRagStatus(query);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

async function executeRagStatus(query: string) {
  try {
    if (!fs.existsSync(SCRIPT_PATH)) {
      return NextResponse.json(
        {
          connected: false,
          error: "Script de diagnóstico não encontrado.",
          path: SCRIPT_PATH,
        },
        { status: 500 }
      );
    }

    const args = ["-B", SCRIPT_PATH];
    if (query && query.trim()) {
      args.push(query.trim());
    }

    const pythonProc = spawn("python", args, {
      cwd: process.cwd(),
      env: {
        ...process.env,
        PYTHONIOENCODING: "utf-8",
      },
    });

    let stdout = "";
    let stderr = "";

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Timeout ao consultar o status do RAG")), 10000);
    });

    const executionPromise = new Promise<string>((resolve, reject) => {
      pythonProc.stdout.on("data", (data) => {
        stdout += data.toString();
      });

      pythonProc.stderr.on("data", (data) => {
        stderr += data.toString();
      });

      pythonProc.on("close", (code) => {
        if (code === 0 && stdout.trim()) {
          resolve(stdout.trim());
        } else {
          reject(new Error(`Processo finalizado com erro (${code}): ${stderr}`));
        }
      });

      pythonProc.on("error", (err) => {
        reject(err);
      });
    });

    const output = await Promise.race([executionPromise, timeoutPromise]);
    const parsed = JSON.parse(output as string);

    return NextResponse.json(parsed);
  } catch (error: any) {
    return NextResponse.json(
      {
        connected: false,
        error: error.message || "Erro desconhecido ao obter diagnóstico do RAG.",
      },
      { status: 500 }
    );
  }
}
