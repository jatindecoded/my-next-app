import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getChecklist } from '@/lib/mock';

export async function GET(_req: NextRequest, ctx: RouteContext<'/api/v1/audit-sessions/[sessionId]/checklist/[structureNodeId]'>) {
  try {
    const { sessionId, structureNodeId } = await ctx.params;
    const data = getChecklist(sessionId, structureNodeId);
    return NextResponse.json(data);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Failed';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
