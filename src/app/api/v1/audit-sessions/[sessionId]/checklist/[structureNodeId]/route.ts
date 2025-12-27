import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { 
  getDB, 
  structure_nodes, 
  template_audit_points, 
  audit_templates,
  audit_items,
  audit_sessions,
  audit_media,
  users,
} from '@/lib/db';
import { eq, and, ne, inArray } from 'drizzle-orm';

type HistoryEntry = {
  item_id: string;
  status: 'PASS' | 'FAIL';
  notes: string | null;
  created_at: Date;
  auditor_id: string;
  auditor_name: string;
  has_media: boolean;
};

export async function GET(req: NextRequest, ctx: RouteContext<'/api/v1/audit-sessions/[sessionId]/checklist/[structureNodeId]'>) {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const db = getDB(env);
    const { structureNodeId, sessionId } = await ctx.params;
    const url = new URL(req.url);
    const includeHistory =
      url.searchParams.get('includeHistory') === 'true' || req.headers.get('x-feature-include-history') === 'true';

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

    if (!includeHistory) {
      return NextResponse.json({ node_name: node.name, audit_points: points });
    }

    // Fetch history items for this node across all points, excluding current session
    const itemsWithSessionAndUser = await db
      .select({
        item_id: audit_items.id,
        status: audit_items.status,
        notes: audit_items.notes,
        created_at: audit_items.created_at,
        template_audit_point_id: audit_items.template_audit_point_id,
        auditor_id: audit_sessions.auditor_id,
        auditor_name: users.name,
      })
      .from(audit_items)
      .innerJoin(audit_sessions, eq(audit_items.audit_session_id, audit_sessions.id))
      .innerJoin(users, eq(audit_sessions.auditor_id, users.id))
      .where(
        and(
          eq(audit_items.structure_node_id, structureNodeId),
          eq(audit_sessions.project_id, node.project_id),
          ne(audit_items.audit_session_id, sessionId),
        ),
      );

    const itemIds = itemsWithSessionAndUser.map((r) => r.item_id);
    const mediaForItems = itemIds.length
      ? await db.select({ audit_item_id: audit_media.audit_item_id }).from(audit_media).where(inArray(audit_media.audit_item_id, itemIds))
      : [];
    const itemsWithMediaSet = new Set(mediaForItems.map((m) => m.audit_item_id));

    const historyByPointId = new Map<string, HistoryEntry[]>();
    for (const r of itemsWithSessionAndUser) {
      const entry: HistoryEntry = {
        item_id: r.item_id,
        status: r.status,
        notes: r.notes,
        created_at: r.created_at,
        auditor_id: r.auditor_id,
        auditor_name: r.auditor_name,
        has_media: itemsWithMediaSet.has(r.item_id),
      };
      const list = historyByPointId.get(r.template_audit_point_id) || [];
      list.push(entry);
      historyByPointId.set(r.template_audit_point_id, list);
    }

    const enrichedPoints = points.map((p) => ({ ...p, history: historyByPointId.get(p.id) || [] }));

    return NextResponse.json({ node_name: node.name, audit_points: enrichedPoints });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
