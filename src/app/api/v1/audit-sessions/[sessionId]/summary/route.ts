import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { getDB, audit_items } from '@/lib/db';
import { eq } from 'drizzle-orm';

export async function GET(_req: NextRequest, ctx: RouteContext<'/api/v1/audit-sessions/[sessionId]/summary'>) {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const db = getDB(env);
    const { sessionId } = await ctx.params;

    const items = await db.select().from(audit_items).where(eq(audit_items.audit_session_id, sessionId));
    const pass = items.filter((i) => i.status === 'PASS').length;
    const fail = items.filter((i) => i.status === 'FAIL').length;

    return NextResponse.json({ total: items.length, pass, fail });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
