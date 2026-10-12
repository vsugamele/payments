import { NextResponse } from "next/server";
import { spawn } from "child_process";
import path from "path";
import fs from "fs";

export const dynamic = "force-dynamic";

const RAG_BASE_PATH = "C:\\Users\\vsuga\\Documents\\Codex\\2026-10-02\\task\\base_bandeiras_local";
const CONSULTAR_SCRIPT = path.join(RAG_BASE_PATH, "rag_local", "consultar.py");

interface SearchRequest {
  pergunta: string;
  bandeira?: string;
  papel?: "emissor" | "adquirente" | "ambos";
  componente?: "authorization" | "clearing" | "settlement" | "reference_data";
  limite?: number;
}

export async function POST(req: Request) {
  try {
    const body: SearchRequest = await req.json();

    if (!body.pergunta || !body.pergunta.trim()) {
      return NextResponse.json(
        { error: "O parâmetro 'pergunta' é obrigatório." },
        { status: 400 }
      );
    }

    if (!fs.existsSync(CONSULTAR_SCRIPT)) {
      return NextResponse.json(
        {
          error: "Motor RAG local não encontrado no caminho especificado.",
          path: CONSULTAR_SCRIPT,
        },
        { status: 500 }
      );
    }

    const payload = {
      pergunta: body.pergunta.trim(),
      ...(body.bandeira ? { bandeira: body.bandeira } : {}),
      ...(body.papel ? { papel: body.papel } : {}),
      ...(body.componente ? { componente: body.componente } : {}),
      limite: Math.min(Math.max(body.limite || 6, 1), 16),
    };

    const pythonProc = spawn("python", ["-B", CONSULTAR_SCRIPT, "--jsonl"], {
      cwd: RAG_BASE_PATH,
      env: {
        ...process.env,
        PYTHONIOENCODING: "utf-8",
      },
    });

    let stdout = "";
    let stderr = "";

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Timeout de 20s ao consultar o acervo local")), 20000);
    });

    const executionPromise = new Promise<{ stdout: string; stderr: string }>((resolve, reject) => {
      pythonProc.stdout.on("data", (data) => {
        stdout += data.toString();
      });

      pythonProc.stderr.on("data", (data) => {
        stderr += data.toString();
      });

      pythonProc.on("close", (code) => {
        if (code === 0) {
          resolve({ stdout, stderr });
        } else {
          reject(new Error(`Processo finalizado com código ${code}: ${stderr}`));
        }
      });

      pythonProc.on("error", (err) => {
        reject(err);
      });

      // Write json input to stdin
      pythonProc.stdin.write(JSON.stringify(payload) + "\n");
      pythonProc.stdin.end();
    });

    const result: any = await Promise.race([executionPromise, timeoutPromise]);
    const lines = result.stdout.split("\n").filter((l: string) => l.trim().length > 0);

    if (lines.length === 0) {
      return NextResponse.json(
        { error: "Nenhuma resposta do motor RAG.", stderr: result.stderr },
        { status: 500 }
      );
    }

    const rawJson = JSON.parse(lines[lines.length - 1]);

    const formattedEvidence = (rawJson.evidence || []).map((e: any) => ({
      file: e.citation?.file || "Documento Não Identificado",
      sha256: e.citation?.sha256 || "",
      physicalPage: e.citation?.physical_pdf_page || null,
      unitLabel: e.citation?.unit_label || "",
      excerpt: e.citation?.excerpt || "",
      locator: e.citation?.locator || "",
      alerts: e.alerts || [],
      impactAnalysis: e.impact_analysis || null,
    }));

    return NextResponse.json({
      state: rawJson.state,
      query: body.pergunta,
      totalCandidates: rawJson.candidate_units || 0,
      evidence: formattedEvidence,
      scopeConflicts: rawJson.scope_conflicts || [],
      timingsMs: rawJson.timings_ms || {},
      warnings: rawJson.warnings || [],
    });
  } catch (error: any) {
    console.error("Erro ao consultar acervo RAG:", error);
    return NextResponse.json(
      {
        error: error.message || "Erro inesperado ao consultar o acervo.",
      },
      { status: 500 }
    );
  }
}
