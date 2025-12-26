import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { sessionSummary } from '@/lib/mock';

export async function GET(_req: NextRequest, ctx: RouteContext<'/api/v1/audit-sessions/[sessionId]/summary'>) {
  const { sessionId } = await ctx.params;
  const summary = sessionSummary(sessionId);
  return NextResponse.json(summary);
}
