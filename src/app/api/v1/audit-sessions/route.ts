import { NextResponse } from 'next/server';
import { startAuditSession } from '@/lib/mock';

export async function POST(req: Request) {
  const body = (await req.json()) as { projectId: string };
  if (!body?.projectId) {
    return NextResponse.json({ error: 'projectId required' }, { status: 400 });
  }
  const session = startAuditSession(body.projectId);
  return NextResponse.json(session);
}
