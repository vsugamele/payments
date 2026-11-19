import { NextResponse } from 'next/server';
import { queryUnifiedAcervo } from '@/lib/acervoAiBridge';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const query = String(body.query || body.pergunta || '').trim();
    const matchCount = Number(body.match_count || body.limite || 6);

    if (!query) {
      return NextResponse.json({ success: false, detail: 'Query vazia.' }, { status: 400 });
    }

    const acervoRes = queryUnifiedAcervo({
      pergunta: query,
      bandeira: body.bandeira,
      papel: body.papel,
      componente: body.componente,
      registro: body.registro,
      tool: body.tool || 'all',
      limite: matchCount,
    });

    const sources = acervoRes.evidence.map((ev: any, idx: number) => ({
      title: ev.file,
      page: ev.physicalPage || 1,
      unitLabel: ev.unitLabel,
      sha256: ev.sha256,
      isLiveFts: ev.isLiveFts,
      excerpt: ev.excerpt,
      similarity: Number(Math.max(0.75, 0.98 - idx * 0.03).toFixed(2)),
    }));

    return NextResponse.json({
      success: true,
      answer: acervoRes.answer,
      sources,
      liveEngineConnected: acervoRes.liveEngineConnected,
      evidence: acervoRes.evidence,
      camposMatched: acervoRes.camposMatched,
      tarifasMatched: acervoRes.tarifasMatched,
      regulatorioMatched: acervoRes.regulatorioMatched,
      scopeConflicts: acervoRes.scopeConflicts,
      timingsMs: acervoRes.timingsMs,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, detail: err?.message || 'Erro interno ao consultar o Cérebro Normativo.' },
      { status: 500 }
    );
  }
}
