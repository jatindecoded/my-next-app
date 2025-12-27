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
import { eq, and, inArray } from 'drizzle-orm';

type TreeNode = {
  id: string;
  name: string;
  level_type: string;
  children: TreeNode[];
  isAuditable: boolean;
  project_id: string;
  parent_id: string | null;
  order_index: number;
};

export async function GET(req: NextRequest, ctx: RouteContext<'/api/v1/projects/[projectId]/structure'>) {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const db = getDB(env);
    const { projectId } = await ctx.params;
    const { searchParams } = new URL(req.url);
    const nodeId = searchParams.get('nodeId');

    const nodes = await db.select().from(structure_nodes).where(eq(structure_nodes.project_id, projectId));

    if (nodeId) {
      // Return specific node with breadcrumb and audit points
      const node = nodes.find((n) => n.id === nodeId);
      console.log('Fetched node:', node);
      if (!node) {
        return NextResponse.json({ error: 'Node not found' }, { status: 404 });
      }

      // Build breadcrumb
      const breadcrumb: Array<{ id: string; name: string; level_type: string }> = [];
      let current: typeof node | undefined = node;
      while (current?.parent_id) {
        const found = nodes.find((n) => n.id === current!.parent_id);
        if (!found) break;
        current = found;
        if (current && current.level_type !== 'PROJECT') {
          breadcrumb.unshift({ id: current.id, name: current.name, level_type: current.level_type });
        }
      }

      // Get audit points for this node level
      const tmpl = (await db.select().from(audit_templates).where(eq(audit_templates.project_id, projectId)))[0];
      let audit_points: typeof template_audit_points.$inferSelect[] = [];
      if (tmpl && (node.level_type === 'UNIT' || node.level_type === 'ROOM')) {
        const allPoints = await db.select().from(template_audit_points).where(eq(template_audit_points.template_audit_id, tmpl.id));
        audit_points = allPoints.filter((p) => p.applicable_level_type === node.level_type);
      }

      // Include history for previous checks at this node across all sessions
      type HistoryEntry = {
        item_id: string;
        status: 'PASS' | 'FAIL';
        notes: string | null;
        created_at: Date;
        auditor_id: string;
        auditor_name: string;
        has_media: boolean;
      };

      let enriched_points = audit_points;
      if (audit_points.length > 0) {
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
              eq(audit_items.structure_node_id, node.id),
              eq(audit_sessions.project_id, projectId),
            ),
          );

        const itemIds = itemsWithSessionAndUser.map((r) => r.item_id);
        const mediaForItems = itemIds.length
          ? await db
              .select({ audit_item_id: audit_media.audit_item_id })
              .from(audit_media)
              .where(inArray(audit_media.audit_item_id, itemIds))
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

        enriched_points = audit_points.map((p) => ({ ...p, history: historyByPointId.get(p.id) || [] }));
      }

      // Build tree node with children
      const byId = new Map<string, TreeNode>();
      for (const n of nodes) {
        byId.set(n.id, {
          ...n,
          children: [],
          isAuditable: n.level_type === 'UNIT' || n.level_type === 'ROOM',
        });
      }
      for (const n of nodes) {
        if (n.parent_id) {
          const parent = byId.get(n.parent_id);
          const child = byId.get(n.id);
          if (parent && child) parent.children.push(child);
        }
      }

      const treeNode = byId.get(nodeId)!;
      return NextResponse.json({ node: treeNode, audit_points: enriched_points, breadcrumb });
    }

    // Return root tree
    const byId = new Map<string, TreeNode>();
    for (const n of nodes) {
      byId.set(n.id, {
        ...n,
        children: [],
        isAuditable: n.level_type === 'UNIT' || n.level_type === 'ROOM',
      });
    }
    for (const n of nodes) {
      if (n.parent_id) {
        const parent = byId.get(n.parent_id);
        const child = byId.get(n.id);
        if (parent && child) parent.children.push(child);
      }
    }

    const root = Array.from(byId.values()).find((n) => n.level_type === 'PROJECT');
    return NextResponse.json(root || null);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
