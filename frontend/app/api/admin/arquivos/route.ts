import { NextResponse } from "next/server";
import { spawn } from "child_process";
import path from "path";
import fs from "fs";

export const dynamic = "force-dynamic";

const SCRIPT_PATH = path.join(process.cwd(), "lib", "arquivos_engine.py");

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const payload: Record<string, any> = {};
  searchParams.forEach((value, key) => {
    payload[key] = value;
  });
  if (!payload.action) {
    payload.action = "overview";
  }
  return executeArquivosEngine(payload);
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    if (!body.action) {
      body.action = "overview";
    }
    return executeArquivosEngine(body);
  } catch (err: any) {
    return NextResponse.json({ connected: false, error: err.message }, { status: 500 });
  }
}

async function executeArquivosEngine(payload: Record<string, any>) {
  try {
    if (!fs.existsSync(SCRIPT_PATH)) {
      return NextResponse.json(
        {
          connected: false,
          error: "Motor arquivos_engine.py não encontrado.",
          path: SCRIPT_PATH,
        },
        { status: 500 }
      );
    }

    const args = ["-B", SCRIPT_PATH, JSON.stringify(payload)];
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
      setTimeout(() => reject(new Error("Timeout ao consultar o motor de arquivos e faturamento")), 15000);
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
        error: error.message || "Erro ao consultar motor de arquivos.",
      },
      { status: 500 }
    );
  }
}
