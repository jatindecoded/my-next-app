import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { getDB, structure_nodes, template_audit_points, audit_templates } from '@/lib/db';
import { eq } from 'drizzle-orm';

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
      return NextResponse.json({ node: treeNode, audit_points, breadcrumb });
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
