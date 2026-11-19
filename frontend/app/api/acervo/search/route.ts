import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import acervoPlugged from '@/data/acervo-plugged-bundle.json';
import {
  LOCAL_ACERVO_BASE,
  UnifiedAcervoQuery,
  queryUnifiedAcervo,
} from '@/lib/acervoAiBridge';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action') || 'overview';
  const pergunta = searchParams.get('pergunta') || searchParams.get('q') || '';

  if (action === 'overview' && !pergunta) {
    const localAvailable = fs.existsSync(path.join(LOCAL_ACERVO_BASE, 'acervo.sqlite3'));
    return NextResponse.json({
      connected: true,
      localSqliteAvailable: localAvailable,
      ...acervoPlugged,
    });
  }

  const res = queryUnifiedAcervo({
    pergunta: pergunta || 'TCR 0',
    bandeira: searchParams.get('bandeira') || undefined,
    papel: (searchParams.get('papel') as any) || undefined,
    componente: (searchParams.get('componente') as any) || undefined,
    registro: searchParams.get('registro') || undefined,
    tool: (searchParams.get('tool') as any) || 'all',
    limite: Number(searchParams.get('limite') || 8),
  });
  return NextResponse.json(res);
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    if (body.action === 'overview' && !body.pergunta) {
      const localAvailable = fs.existsSync(path.join(LOCAL_ACERVO_BASE, 'acervo.sqlite3'));
      return NextResponse.json({
        connected: true,
        localSqliteAvailable: localAvailable,
        ...acervoPlugged,
      });
    }
    if (!body.pergunta || !String(body.pergunta).trim()) {
      return NextResponse.json(
        { error: "O parâmetro 'pergunta' é obrigatório." },
        { status: 400 }
      );
    }
    const res = queryUnifiedAcervo(body as UnifiedAcervoQuery);
    return NextResponse.json(res);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erro inesperado ao consultar o acervo.' },
      { status: 500 }
    );
  }
}
