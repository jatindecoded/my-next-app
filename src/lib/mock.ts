import { nanoid } from 'nanoid/non-secure';
import type {
  AuditItem,
  AuditMedia,
  AuditSession,
  AuditTemplate,
  Project,
  StructureNode,
  TemplateAuditPoint,
  User,
} from '@/lib/db';

// In-memory stores (reset per worker cold start)
const users: User[] = [
  { id: 'user_builder_1', name: 'Builder One', phone: '1000000000', role: 'BUILDER', created_at: new Date() },
  { id: 'user_auditor_1', name: 'Auditor One', phone: '2000000000', role: 'AUDITOR', created_at: new Date() },
];

const projects: Project[] = [
  { id: 'project_1', name: 'Sunrise Residency', location: 'Sector 15', created_at: new Date() },
];

// Structure hierarchy: PROJECT → BLOCK → FLOOR → UNIT → ROOM
const structure_nodes: StructureNode[] = [
  { id: 'node_project_1', project_id: 'project_1', parent_id: null, level_type: 'PROJECT', name: 'Sunrise Residency', order_index: 0 },
  { id: 'node_block_A', project_id: 'project_1', parent_id: 'node_project_1', level_type: 'BLOCK', name: 'Block A', order_index: 1 },
  { id: 'node_floor_1', project_id: 'project_1', parent_id: 'node_block_A', level_type: 'FLOOR', name: 'Floor 1', order_index: 1 },
  { id: 'node_unit_101', project_id: 'project_1', parent_id: 'node_floor_1', level_type: 'UNIT', name: 'Unit 101', order_index: 1 },
  { id: 'node_room_101_kitchen', project_id: 'project_1', parent_id: 'node_unit_101', level_type: 'ROOM', name: 'Kitchen', order_index: 1 },
  { id: 'node_room_101_bedroom', project_id: 'project_1', parent_id: 'node_unit_101', level_type: 'ROOM', name: 'Bedroom', order_index: 2 },
];

const audit_templates: AuditTemplate[] = [
  { id: 'tmpl_1', project_id: 'project_1', name: 'Standard Quality Template' },
];

const template_audit_points: TemplateAuditPoint[] = [
  { id: 'pt_room_clean', template_audit_id: 'tmpl_1', applicable_level_type: 'ROOM', name: 'Room Cleanliness', is_mandatory: true, severity: 'LOW', order_index: 1 },
  { id: 'pt_room_tiles', template_audit_id: 'tmpl_1', applicable_level_type: 'ROOM', name: 'Tiles Alignment', is_mandatory: true, severity: 'MEDIUM', order_index: 2 },
  { id: 'pt_room_water', template_audit_id: 'tmpl_1', applicable_level_type: 'ROOM', name: 'Water Leakage', is_mandatory: false, severity: 'HIGH', order_index: 3 },
  { id: 'pt_unit_doors', template_audit_id: 'tmpl_1', applicable_level_type: 'UNIT', name: 'Door Fittings', is_mandatory: true, severity: 'MEDIUM', order_index: 1 },
  { id: 'pt_unit_paint', template_audit_id: 'tmpl_1', applicable_level_type: 'UNIT', name: 'Paint Quality', is_mandatory: false, severity: 'LOW', order_index: 2 },
];

// Mutable stores
const audit_sessions: AuditSession[] = [];
const audit_items: AuditItem[] = [];
const audit_media: AuditMedia[] = [];

// Helpers
export function getProjectsForAuditor(): Project[] {
  return projects;
}

type TreeNode = StructureNode & { children: TreeNode[]; isAuditable: boolean };

export function getStructureTree(projectId: string) {
  const nodes = structure_nodes.filter((n) => n.project_id === projectId);
  const byId = new Map<string, TreeNode>();

  for (const n of nodes) {
    const node: TreeNode = {
      ...n,
      children: [],
      isAuditable: n.level_type === 'UNIT' || n.level_type === 'ROOM',
    };
    byId.set(n.id, node);
  }

  for (const n of nodes) {
    if (n.parent_id) {
      const parent = byId.get(n.parent_id);
      const child = byId.get(n.id);
      if (parent && child) parent.children.push(child);
    }
  }

  // root is PROJECT node
  for (const node of byId.values()) {
    if (node.level_type === 'PROJECT') return node;
  }
  return null;
}

export function startAuditSession(projectId: string, auditorId = 'user_auditor_1'): AuditSession {
  const session: AuditSession = {
    id: `sess_${nanoid(10)}`,
    project_id: projectId,
    auditor_id: auditorId,
    status: 'IN_PROGRESS',
    created_at: new Date(),
    submitted_at: null,
  };
  audit_sessions.push(session);
  return session;
}

export function getStructureNode(projectId: string, nodeId: string) {
  const allNodes = structure_nodes.filter((n) => n.project_id === projectId);
  const byId = new Map<string, TreeNode>();

  for (const n of allNodes) {
    const node: TreeNode = {
      ...n,
      children: [],
      isAuditable: n.level_type === 'UNIT' || n.level_type === 'ROOM',
    };
    byId.set(n.id, node);
  }

  for (const n of allNodes) {
    if (n.parent_id) {
      const parent = byId.get(n.parent_id);
      const child = byId.get(n.id);
      if (parent && child) parent.children.push(child);
    }
  }

  const node = byId.get(nodeId);
  if (!node) return null;

  // Build breadcrumb by traversing up
  const breadcrumb: Array<{ id: string; name: string; level_type: string }> = [];
  let current = node as StructureNode | undefined;
  while (current?.parent_id) {
    current = structure_nodes.find((n) => n.id === current!.parent_id);
    if (current && current.level_type !== 'PROJECT') {
      breadcrumb.unshift({ id: current.id, name: current.name, level_type: current.level_type });
    }
  }

  // Get audit points for this node
  const tmpl = audit_templates.find((t) => t.project_id === projectId)!;
  const audit_points = template_audit_points
    .filter(
      (p) =>
        p.template_audit_id === tmpl.id &&
        (p.applicable_level_type === node.level_type),
    )
    .sort((a, b) => a.order_index - b.order_index);

  return { node, audit_points, breadcrumb };
}

export function getChecklist(sessionId: string, nodeId: string) {
  const node = structure_nodes.find((n) => n.id === nodeId);
  if (!node) throw new Error('Node not found');
  const tmpl = audit_templates.find((t) => t.project_id === node.project_id)!;
  const points = template_audit_points
    .filter((p) => p.template_audit_id === tmpl.id && p.applicable_level_type === (node.level_type === 'ROOM' ? 'ROOM' : node.level_type === 'UNIT' ? 'UNIT' : 'ROOM'))
    .sort((a, b) => a.order_index - b.order_index);
  return { node_name: node.name, audit_points: points };
}

export function submitAuditItem(body: {
  auditSessionId: string;
  structureNodeId: string;
  templateAuditPointId: string;
  status: 'PASS' | 'FAIL';
  notes?: string;
}) {
  const item: AuditItem = {
    id: `item_${nanoid(10)}`,
    audit_session_id: body.auditSessionId,
    structure_node_id: body.structureNodeId,
    template_audit_point_id: body.templateAuditPointId,
    status: body.status,
    notes: body.notes ?? null,
    created_at: new Date(),
  };
  audit_items.push(item);
  return item;
}

export function uploadMedia(auditItemId: string, storage_key = `r2://${auditItemId}.jpg`) {
  const media: AuditMedia = {
    id: `media_${nanoid(10)}`,
    audit_item_id: auditItemId,
    storage_key,
    created_at: new Date(),
  };
  audit_media.push(media);
  return media;
}

export function sessionSummary(sessionId: string) {
  const items = audit_items.filter((i) => i.audit_session_id === sessionId);
  const pass = items.filter((i) => i.status === 'PASS').length;
  const fail = items.filter((i) => i.status === 'FAIL').length;
  return { total: items.length, pass, fail };
}

export function submitSession(sessionId: string) {
  // Minimal validations per MVP
  const items = audit_items.filter((i) => i.audit_session_id === sessionId);
  // FAIL items must have media
  const failures = items.filter((i) => i.status === 'FAIL');
  const hasAllMedia = failures.every((f) => audit_media.some((m) => m.audit_item_id === f.id));
  if (!hasAllMedia) {
    return { ok: false, error: 'Missing media for failed items' };
  }
  // Mark as submitted
  const session = audit_sessions.find((s) => s.id === sessionId);
  if (!session) return { ok: false, error: 'Session not found' };
  session.status = 'SUBMITTED';
  session.submitted_at = new Date();
  return { ok: true };
}

export function builderProjectSummaries() {
  return projects.map((p) => {
    const projectSessions = audit_sessions.filter((s) => s.project_id === p.id);
    const allItems = audit_items.filter((i) => projectSessions.some((s) => s.id === i.audit_session_id));
    const totalDefects = allItems.filter((i) => i.status === 'FAIL').length;
    const passRate = allItems.length ? (100 * (allItems.length - totalDefects)) / allItems.length : 0;
    return {
      ...p,
      summary: {
        total_audits: projectSessions.length,
        total_defects: totalDefects,
        pass_rate: passRate,
        critical_defects: allItems.filter((i) => {
          const point = template_audit_points.find((pnt) => pnt.id === i.template_audit_point_id);
          return point?.severity === 'HIGH' && i.status === 'FAIL';
        }).length,
      },
    };
  });
}

export function builderProjectDefects(projectId: string) {
  const projectSessions = audit_sessions.filter((s) => s.project_id === projectId);
  const allItems = audit_items.filter((i) => projectSessions.some((s) => s.id === i.audit_session_id) && i.status === 'FAIL');
  return {
    project_name: projects.find((p) => p.id === projectId)?.name || projectId,
    defects: allItems.map((i) => {
      const node = structure_nodes.find((n) => n.id === i.structure_node_id)!;
      const point = template_audit_points.find((p) => p.id === i.template_audit_point_id)!;
      const has_photo = audit_media.some((m) => m.audit_item_id === i.id);
      const auditor_name = users.find((u) => u.id === audit_sessions.find((s) => s.id === i.audit_session_id)?.auditor_id)?.name || 'Unknown';
      return {
        id: i.id,
        room_name: node.name,
        audit_point_name: point.name,
        severity: point.severity,
        notes: i.notes || '',
        has_photo,
        audit_date: new Date(i.created_at).toISOString(),
        auditor_name,
      };
    }),
  };
}
