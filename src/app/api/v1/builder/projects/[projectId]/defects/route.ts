import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { getDB, projects, audit_sessions, audit_items, structure_nodes, template_audit_points, audit_media, users } from '@/lib/db';
import { eq } from 'drizzle-orm';

export async function GET(_req: NextRequest, ctx: RouteContext<'/api/v1/builder/projects/[projectId]/defects'>) {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const db = getDB(env);
    const { projectId } = await ctx.params;

    const project = (await db.select().from(projects).where(eq(projects.id, projectId)))[0];
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const projectSessions = await db.select().from(audit_sessions).where(eq(audit_sessions.project_id, projectId));
    const sessionIds = projectSessions.map((s) => s.id);

    const allItems = await db.select().from(audit_items);
    const failedItems = allItems.filter((i) => sessionIds.includes(i.audit_session_id) && i.status === 'FAIL');

    const allNodes = await db.select().from(structure_nodes);
    const allPoints = await db.select().from(template_audit_points);
    const allMedia = await db.select().from(audit_media);
    const allUsers = await db.select().from(users);

    const defects = failedItems.map((item) => {
      const node = allNodes.find((n) => n.id === item.structure_node_id);
      const point = allPoints.find((p) => p.id === item.template_audit_point_id);
      const has_photo = allMedia.some((m) => m.audit_item_id === item.id);
      const session = projectSessions.find((s) => s.id === item.audit_session_id);
      const auditor = allUsers.find((u) => u.id === session?.auditor_id);

      return {
        id: item.id,
        room_name: node?.name || 'Unknown',
        audit_point_name: point?.name || 'Unknown',
        severity: point?.severity || 'MEDIUM',
        notes: item.notes || '',
        has_photo,
        audit_date: item.created_at.toISOString(),
        auditor_name: auditor?.name || 'Unknown',
      };
    });

    return NextResponse.json({ project_name: project.name, defects });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch defects';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
