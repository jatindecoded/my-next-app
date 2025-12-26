import { NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { getDB, projects, audit_sessions, audit_items, template_audit_points } from '@/lib/db';

export async function GET() {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const db = getDB(env);

    const allProjects = await db.select().from(projects);
    const allSessions = await db.select().from(audit_sessions);
    const allItems = await db.select().from(audit_items);
    const allPoints = await db.select().from(template_audit_points);

    const summaries = allProjects.map((p) => {
      const projectSessions = allSessions.filter((s) => s.project_id === p.id);
      const sessionIds = projectSessions.map((s) => s.id);
      const projectItems = allItems.filter((i) => sessionIds.includes(i.audit_session_id));
      const totalDefects = projectItems.filter((i) => i.status === 'FAIL').length;
      const passRate = projectItems.length ? (100 * (projectItems.length - totalDefects)) / projectItems.length : 0;
      const criticalDefects = projectItems.filter((i) => {
        const point = allPoints.find((pnt) => pnt.id === i.template_audit_point_id);
        return point?.severity === 'HIGH' && i.status === 'FAIL';
      }).length;

      return {
        ...p,
        summary: {
          total_audits: projectSessions.length,
          total_defects: totalDefects,
          pass_rate: passRate,
          critical_defects: criticalDefects,
        },
      };
    });

    return NextResponse.json(summaries);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch project summaries';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
