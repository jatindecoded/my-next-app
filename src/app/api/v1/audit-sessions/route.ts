import { NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { getDB, audit_sessions, projects, users } from '@/lib/db';
import { nanoid } from 'nanoid';
import { eq } from 'drizzle-orm';

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { projectId: string; auditorId?: string };
    if (!body?.projectId) {
      return NextResponse.json({ error: 'projectId required' }, { status: 400 });
    }

    const { env } = await getCloudflareContext({ async: true });
    const db = getDB(env);

    // Verify project exists
    const project = await db.select().from(projects).where(eq(projects.id, body.projectId)).get();
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Get or default auditor ID
    const auditorId = body.auditorId || 'user_1';
    
    // Verify auditor exists, create if needed (for MVP with default user)
    const auditor = await db.select().from(users).where(eq(users.id, auditorId)).get();
    if (!auditor) {
      // Create default user if it doesn't exist
      await db.insert(users).values({
        id: auditorId,
        name: 'Default Auditor',
        role: 'AUDITOR',
        created_at: new Date(),
      });
    }

    // Create audit session
    const sessionId = nanoid();
    const now = new Date();
    const session = {
      id: sessionId,
      project_id: body.projectId,
      auditor_id: auditorId,
      status: 'IN_PROGRESS' as const,
      created_at: now,
      submitted_at: null,
    };

    await db.insert(audit_sessions).values(session);

    return NextResponse.json(session);
  } catch (err) {
    console.error('Error creating audit session:', err);
    return NextResponse.json(
      { error: 'Failed to create audit session' },
      { status: 500 }
    );
  }
}
