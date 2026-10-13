import { NextResponse } from "next/server";
import { spawn } from "child_process";
import path from "path";
import fs from "fs";

export const dynamic = "force-dynamic";

const SCRIPT_PATH = path.join(process.cwd(), "lib", "governanca_engine.py");

export async function GET() {
  return executeGovernancaEngine();
}

async function executeGovernancaEngine() {
  try {
    if (!fs.existsSync(SCRIPT_PATH)) {
      return NextResponse.json(
        { connected: false, error: "Script governanca_engine.py não encontrado." },
        { status: 500 }
      );
    }

    const pythonProc = spawn("python", ["-B", SCRIPT_PATH], {
      cwd: process.cwd(),
      env: { ...process.env, PYTHONIOENCODING: "utf-8" },
    });

    let stdout = "";
    let stderr = "";

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Timeout ao consultar o motor de governança e grafo internacional")), 15000);
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
          reject(new Error(`Erro (${code}): ${stderr}`));
        }
      });
      pythonProc.on("error", (err) => reject(err));
    });

    const output = await Promise.race([executionPromise, timeoutPromise]);
    return NextResponse.json(JSON.parse(output as string));
  } catch (error: any) {
    return NextResponse.json(
      { connected: false, error: error.message || "Erro ao consultar governança." },
      { status: 500 }
    );
  }
}
