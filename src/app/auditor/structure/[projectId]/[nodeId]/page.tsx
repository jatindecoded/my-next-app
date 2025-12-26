'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

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
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="border-b border-gray-200 p-4 sticky top-0 z-10 bg-white">
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2 overflow-x-auto">
          <Link
            href={`/auditor/projects/${projectId}`}
            className="text-indigo-600 hover:text-indigo-700 whitespace-nowrap"
          >
            Project
          </Link>
          {breadcrumb.map((crumb) => (
            <div key={crumb.id} className="flex items-center gap-2">
              <span>/</span>
              <span className="whitespace-nowrap">{crumb.name}</span>
            </div>
          ))}
          <span>/</span>
          <span className="whitespace-nowrap font-medium text-gray-900">
            {node.name}
          </span>
        </div>
        <div>
          <div className="text-xs text-gray-500">{node.level_type}</div>
          <h1 className="text-xl font-semibold text-gray-900">{node.name}</h1>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Audit Points (if auditable) */}
        {node.isAuditable && auditPoints.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              Audit Points
            </h2>
            <div className="space-y-2 mb-4">
              {auditPoints.map((point) => (
                <div
                  key={point.id}
                  className="p-3 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-start gap-2">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 text-sm">
                        {point.name}
                      </div>
                      <div className="flex gap-2 mt-1">
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            point.severity === 'HIGH'
                              ? 'bg-red-100 text-red-700'
                              : point.severity === 'MEDIUM'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {point.severity}
                        </span>
                        {point.is_mandatory && (
                          <span className="text-xs font-bold text-red-600">
                            REQUIRED
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => router.push(`/auditor/audit/${projectId}/${nodeId}`)}
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-indigo-700 transition-colors text-sm"
            >
              Start Audit
            </button>
          </div>
        )}

        {/* Child Nodes */}
        {node.children && node.children.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              {node.children[0].level_type}s
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {node.children.map((child) => (
                <button
                  key={child.id}
                  onClick={() =>
                    router.push(
                      `/auditor/structure/${projectId}/${child.id}`,
                    )
                  }
                  className="p-4 border border-gray-200 rounded-lg hover:border-indigo-400 hover:bg-indigo-50 transition-all text-left"
                >
                  <div className="text-sm text-gray-500">{child.level_type}</div>
                  <div className="font-medium text-gray-900">{child.name}</div>
                  {child.isAuditable && (
                    <div className="text-xs text-indigo-600 mt-1">
                      ✓ Auditable
                    </div>
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
              No sub-levels or audit points available
            </p>
          )}
      </div>
    </div>
  );
}
