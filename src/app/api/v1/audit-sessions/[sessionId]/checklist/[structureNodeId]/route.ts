import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { getDB, structure_nodes, template_audit_points, audit_templates } from '@/lib/db';
import { eq } from 'drizzle-orm';

export async function GET(_req: NextRequest, ctx: RouteContext<'/api/v1/audit-sessions/[sessionId]/checklist/[structureNodeId]'>) {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const db = getDB(env);
    const { structureNodeId } = await ctx.params;

    const node = (await db.select().from(structure_nodes).where(eq(structure_nodes.id, structureNodeId)))[0];
    if (!node) {
      return NextResponse.json({ error: 'Node not found' }, { status: 404 });
    }

    const tmpl = (await db.select().from(audit_templates).where(eq(audit_templates.project_id, node.project_id)))[0];
    if (!tmpl) {
      return NextResponse.json({ error: 'No template found for project' }, { status: 404 });
    }

    const allPoints = await db
      .select()
      .from(template_audit_points)
      .where(eq(template_audit_points.template_audit_id, tmpl.id));

    const points = allPoints.filter(
      (p) => p.applicable_level_type === node.level_type && (node.level_type === 'UNIT' || node.level_type === 'ROOM'),
    );

    return NextResponse.json({ node_name: node.name, audit_points: points });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
