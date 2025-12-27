'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
//
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import PageHeader from '@/components/ui/PageHeader';

interface TreeNode {
  id: string;
  name: string;
  level_type: string;
  children: TreeNode[];
  isAuditable: boolean;
}

interface AuditPoint {
  id: string;
  name: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  is_mandatory: boolean;
  history?: HistoryEntry[];
}

interface HistoryEntry {
  item_id: string;
  status: 'PASS' | 'FAIL';
  notes?: string | null;
  has_media: boolean;
  auditor_name: string;
  created_at: string | Date;
}

interface StructureData {
  node: TreeNode;
  audit_points: AuditPoint[];
  breadcrumb: Array<{ id: string; name: string; level_type: string }>;
}

export default function StructureDetail() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  const nodeId = params.nodeId as string;
  const [data, setData] = useState<StructureData | null>(null);
  const [loading, setLoading] = useState(true);
  const [collapsedHistory, setCollapsedHistory] = useState<Record<string, boolean>>({});
  const [collapseAll, setCollapseAll] = useState<boolean>(false); // false = expanded by default

  useEffect(() => {
    async function fetchNode() {
      try {
        const response = await fetch(
          `/api/v1/projects/${projectId}/structure?nodeId=${nodeId}`,
        );
        if (!response.ok) throw new Error('Failed to fetch node');
        const nodeData = (await response.json()) as StructureData;
        setData(nodeData);
      } catch (error) {
        console.error('Error fetching node:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchNode();
  }, [projectId, nodeId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!data?.node) {
    return (
      <div className="min-h-screen bg-white p-4">
        <Link
          href={`/auditor/projects/${projectId}`}
          className="text-indigo-600 hover:text-indigo-700 font-medium text-sm"
        >
          ← Back
        </Link>
        <p className="text-gray-500 mt-4">Node not found</p>
      </div>
    );
  }

  const node = data.node;
  const auditPoints = data.audit_points || [];
  const breadcrumb = data.breadcrumb || [];

  return (
    <div>
      {/* Mobile sticky breadcrumb */}
      <div className="border-b border-gray-200 p-4 sticky top-0 z-10 bg-white/90 backdrop-blur md:hidden">
        <Breadcrumbs
          items={[
            { label: 'Project', href: `/auditor/projects/${projectId}` },
            ...breadcrumb.map((b) => ({ label: b.name, href: `/auditor/structure/${projectId}/${b.id}` })),
            { label: node.name },
          ]}
        />
      </div>

      {/* Desktop breadcrumb + header */}
      <div className="hidden md:block">
        <Breadcrumbs
          size="sm"
          className="mb-2"
          items={[
            { label: 'Project', href: `/auditor/projects/${projectId}` },
            ...breadcrumb.map((b) => ({ label: b.name, href: `/auditor/structure/${projectId}/${b.id}` })),
            { label: node.name },
          ]}
        />
        <PageHeader title={node.name} subtitle={node.level_type} align="center" />
      </div>

      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Check Points (if auditable) */}
        {node.isAuditable && auditPoints.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Check Points</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    setCollapseAll((prev) => {
                      const next = !prev;
                      // Optionally set explicit states for current points to match global toggle
                      const map: Record<string, boolean> = {};
                      for (const p of auditPoints) map[p.id] = next;
                      setCollapsedHistory(map);
                      return next;
                    })
                  }
                  className="btn btn-outline"
                >
                  {collapseAll ? 'Show History' : 'Hide History'}
                </button>
                <button
                  onClick={() => router.push(`/auditor/audit/${projectId}/${nodeId}`)}
                  className="btn btn-primary"
                >
                  Start Check
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
              {auditPoints.map((point) => (
                <div
                  key={point.id}
                  className="card card-shadow border-indigo-100"
                >
                  <div className="flex items-start gap-2">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 text-sm">{point.name}</div>
                      <div className="flex gap-2 mt-1">
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            point.severity === 'HIGH'
                              ? 'bg-rose-100 text-rose-700'
                              : point.severity === 'MEDIUM'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {point.severity}
                        </span>
                        {point.is_mandatory && (
                          <span className="text-xs font-bold text-rose-700">
                            REQUIRED
                          </span>
                        )}
                      </div>
                      {point.history && point.history.length > 0 && (
                        <div className="mt-3 border-t border-gray-200 pt-2">
                          <div className="flex items-center justify-between">
                            <div className="text-xs text-gray-600">Previous checks</div>
                            <button
                              onClick={() =>
                                setCollapsedHistory((prev) => ({
                                  ...prev,
                                  [point.id]: !(prev[point.id] ?? collapseAll),
                                }))
                              }
                              className="text-xs text-indigo-600 hover:text-indigo-700"
                            >
                              {(collapsedHistory[point.id] ?? collapseAll) ? 'Show' : 'Hide'}
                            </button>
                          </div>
                          {!(collapsedHistory[point.id] ?? collapseAll) && (
                            <div className="space-y-1 mt-1">
                              {point.history.map((h) => (
                                <div key={h.item_id} className="flex items-center justify-between text-xs">
                                  <div className="flex items-center gap-2">
                                    <span
                                      className={`px-1.5 py-0.5 rounded font-medium ${
                                        h.status === 'PASS'
                                          ? 'bg-green-100 text-green-800'
                                          : 'bg-red-100 text-red-800'
                                      }`}
                                    >
                                      {h.status}
                                    </span>
                                    <span className="text-gray-700">{h.auditor_name}</span>
                                    <span className="text-gray-500">
                                      {new Date(h.created_at).toLocaleDateString()}
                                    </span>
                                  </div>
                                  {h.has_media && (
                                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-medium">Photo</span>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Child Nodes */}
        {node.children && node.children.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              {node.children[0].level_type}s
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {node.children.map((child) => (
                <button
                  key={child.id}
                  onClick={() =>
                    router.push(
                      `/auditor/structure/${projectId}/${child.id}`,
                    )
                  }
                  className="card hover:border-indigo-400 hover:bg-indigo-50 transition-all text-left"
                >
                  <div className="text-sm text-gray-500">{child.level_type}</div>
                  <div className="font-medium text-gray-900">{child.name}</div>
                  {child.isAuditable && (
                    <div className="badge bg-emerald-50 text-emerald-700 mt-2">Auditable</div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* No children and not auditable */}
        {(!node.children || node.children.length === 0) &&
          !node.isAuditable && (
            <p className="text-gray-500 text-sm">
              No sub-levels or check points available
            </p>
          )}
      </div>
    </div>
  );
}
