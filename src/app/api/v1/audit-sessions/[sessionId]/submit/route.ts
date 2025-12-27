import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { getDB, audit_sessions, audit_items, audit_media } from '@/lib/db';
import { eq } from 'drizzle-orm';

export async function POST(_req: NextRequest, ctx: RouteContext<'/api/v1/audit-sessions/[sessionId]/submit'>) {
  try {
    const { sessionId } = await ctx.params;

    const { env } = await getCloudflareContext({ async: true });
    const db = getDB(env);

    // Verify session exists and is in progress
    const session = await db.select().from(audit_sessions).where(eq(audit_sessions.id, sessionId)).get();
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }
    if (session.status !== 'IN_PROGRESS') {
      return NextResponse.json({ error: 'Session already submitted' }, { status: 400 });
    }

    // Get all audit items for this session
    const items = await db.select().from(audit_items).where(eq(audit_items.audit_session_id, sessionId)).all();

    // Validate: All FAIL items must have at least one photo
    const failItems = items.filter((item) => item.status === 'FAIL');
    for (const failItem of failItems) {
      const media = await db.select().from(audit_media).where(eq(audit_media.audit_item_id, failItem.id)).all();
      if (media.length === 0) {
        return NextResponse.json(
          { 
            ok: false, 
            error: 'All FAIL items must have at least one photo', 
            missingMediaItemId: failItem.id 
          },
          { status: 400 }
        );
      }
    }

    // Update session status to SUBMITTED
    const now = new Date();
    await db
      .update(audit_sessions)
      .set({ status: 'SUBMITTED', submitted_at: now })
      .where(eq(audit_sessions.id, sessionId));

    return NextResponse.json({ ok: true, sessionId, submittedAt: now });
  } catch (err) {
    console.error('Error submitting audit session:', err);
    return NextResponse.json(
      { ok: false, error: 'Failed to submit audit session' },
      { status: 500 }
    );
  }
}
