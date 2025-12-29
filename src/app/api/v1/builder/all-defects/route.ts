import { NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { getDB, audit_items, audit_sessions, template_audit_points, structure_nodes, projects, users } from '@/lib/db';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const db = getDB(env);

    // Fetch all failed audit items with related data
    const allItems = await db.select().from(audit_items).where(eq(audit_items.status, 'FAIL'));
    const allSessions = await db.select().from(audit_sessions);
    const allPoints = await db.select().from(template_audit_points);
    const allNodes = await db.select().from(structure_nodes);
    const allProjects = await db.select().from(projects);
    const allUsers = await db.select().from(users);

    // Map defects with all necessary information
    const defects = allItems.map((item) => {
      const session = allSessions.find((s) => s.id === item.audit_session_id);
      const point = allPoints.find((p) => p.id === item.template_audit_point_id);
      const node = allNodes.find((n) => n.id === item.structure_node_id);
      const project = allProjects.find((p) => p.id === session?.project_id);
      const auditor = allUsers.find((u) => u.id === session?.auditor_id);

      return {
        id: item.id,
        project_name: project?.name || 'Unknown Project',
        project_id: project?.id || '',
        location: node?.name || 'Unknown Location',
        node_level: node?.level_type || '',
        audit_point_name: point?.name || 'Unknown Check',
        severity: point?.severity || 'MEDIUM',
        notes: item.notes || '',
        auditor_name: auditor?.name || 'Unknown',
        audit_date: session?.created_at || new Date(),
        has_photo: false, // TODO: Add photo support
      };
    });

    // Sort by severity (HIGH first) and date (newest first)
    const severityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
    defects.sort((a, b) => {
      const sevDiff = severityOrder[a.severity as keyof typeof severityOrder] - severityOrder[b.severity as keyof typeof severityOrder];
      if (sevDiff !== 0) return sevDiff;
      return new Date(b.audit_date).getTime() - new Date(a.audit_date).getTime();
    });

    return NextResponse.json({ defects });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch all defects';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
