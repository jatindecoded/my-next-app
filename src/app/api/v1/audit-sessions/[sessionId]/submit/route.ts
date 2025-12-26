import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { submitSession } from '@/lib/mock';

export async function POST(_req: NextRequest, ctx: RouteContext<'/api/v1/audit-sessions/[sessionId]/submit'>) {
  const { sessionId } = await ctx.params;
  const result = submitSession(sessionId);
  if (!result.ok) return NextResponse.json(result, { status: 400 });
  return NextResponse.json(result);
}
