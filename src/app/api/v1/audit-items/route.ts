import { NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { getDB } from '@/lib/db';
import { audit_items, audit_sessions, structure_nodes, template_audit_points } from '@/lib/db';
import { nanoid } from 'nanoid';
import { eq } from 'drizzle-orm';

export async function POST(req: Request) {
  try {
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

    const { env } = await getCloudflareContext({ async: true });
    const db = getDB(env);

    // Verify audit session exists and is in progress
    const session = await db.select().from(audit_sessions).where(eq(audit_sessions.id, body.auditSessionId)).get();
    if (!session) {
      return NextResponse.json({ error: 'Audit session not found' }, { status: 404 });
    }
    if (session.status !== 'IN_PROGRESS') {
      return NextResponse.json({ error: 'Cannot modify submitted session' }, { status: 400 });
    }

    // Verify structure node exists
    const node = await db.select().from(structure_nodes).where(eq(structure_nodes.id, body.structureNodeId)).get();
    if (!node) {
      return NextResponse.json({ error: 'Structure node not found' }, { status: 404 });
    }

    // Verify audit point exists
    const point = await db.select().from(template_audit_points).where(eq(template_audit_points.id, body.templateAuditPointId)).get();
    if (!point) {
      return NextResponse.json({ error: 'Audit point not found' }, { status: 404 });
    }

    // Create audit item
    const itemId = nanoid();
    const now = new Date();
    const item = {
      id: itemId,
      audit_session_id: body.auditSessionId,
      structure_node_id: body.structureNodeId,
      template_audit_point_id: body.templateAuditPointId,
      status: body.status,
      notes: body.notes || null,
      created_at: now,
    };

    await db.insert(audit_items).values(item);

    return NextResponse.json(item);
  } catch (err) {
    console.error('Error creating audit item:', err);
    return NextResponse.json(
      { error: 'Failed to create audit item' },
      { status: 500 }
    );
  }
}
