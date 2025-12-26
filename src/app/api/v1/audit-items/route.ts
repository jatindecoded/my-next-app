import { NextResponse } from 'next/server';
import { submitAuditItem } from '@/lib/mock';

export async function POST(req: Request) {
  const body = (await req.json()) as {
    auditSessionId: string;
    structureNodeId: string;
    templateAuditPointId: string;
    status: 'PASS' | 'FAIL';
    notes?: string;
  };
  if (!body?.auditSessionId || !body?.structureNodeId || !body?.templateAuditPointId || !body?.status) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }
  const item = submitAuditItem(body);
  return NextResponse.json(item);
}
