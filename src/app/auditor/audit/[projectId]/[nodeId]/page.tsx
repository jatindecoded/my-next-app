'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
//
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import PageHeader from '@/components/ui/PageHeader';

interface HistoryEntry {
  item_id: string;
  status: 'PASS' | 'FAIL';
  notes?: string;
  has_media: boolean;
  auditor_name: string;
  created_at: string;
}

interface AuditPoint {
  id: string;
  name: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  is_mandatory: boolean;
  history?: HistoryEntry[];
}

interface AuditItemResponse {
  id: string;
  status: 'PASS' | 'FAIL';
  notes?: string;
  has_media: boolean;
}

interface Breadcrumb {
  id: string;
  name: string;
  level_type: string;
}

export default function AuditChecklist() {
  const params = useParams();
  const projectId = params.projectId as string;
  const nodeId = params.nodeId as string;
  const defaultShowHistory = process.env.NEXT_PUBLIC_SHOW_HISTORY_DEFAULT === 'false' ? false : true;
  const [auditPoints, setAuditPoints] = useState<AuditPoint[]>([]);
  const [sessionId, setSessionId] = useState<string>('');
  const [responses, setResponses] = useState<Map<string, AuditItemResponse>>(
    new Map(),
  );
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [nodeName, setNodeName] = useState<string>('');
  const [breadcrumb, setBreadcrumb] = useState<Breadcrumb[]>([]);
  const [showHistory, setShowHistory] = useState<boolean>(defaultShowHistory);

  useEffect(() => {
    async function initAudit() {
      try {
        // Start session
        const sessionRes = await fetch('/api/v1/audit-sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ projectId }),
        });
        const session = await sessionRes.json() as { id: string };
        setSessionId(session.id);

        // Fetch checklist (with optional history)
        const checklistRes = await fetch(
          `/api/v1/audit-sessions/${session.id}/checklist/${nodeId}?includeHistory=${showHistory}`,
        );
        const data = await checklistRes.json() as {
          node_name: string;
          audit_points: AuditPoint[];
        };
        setAuditPoints(data.audit_points);
        setNodeName(data.node_name);

        // Fetch breadcrumb from structure API
        const structRes = await fetch(
          `/api/v1/projects/${projectId}/structure?nodeId=${nodeId}`,
        );
        if (structRes.ok) {
          const structData = await structRes.json() as {
            breadcrumb: Breadcrumb[];
          };
          setBreadcrumb(structData.breadcrumb || []);
        }
      } catch (error) {
        console.error('Error initializing audit:', error);
      } finally {
        setLoading(false);
      }
    }

    initAudit();
  }, [projectId, nodeId, showHistory]);

  const handleStatusChange = (pointId: string, status: 'PASS' | 'FAIL') => {
    const newResponses = new Map(responses);
    newResponses.set(pointId, {
      ...responses.get(pointId),
      id: pointId,
      status,
      notes: responses.get(pointId)?.notes,
      has_media: responses.get(pointId)?.has_media || false,
    });
    setResponses(newResponses);
  };

  const handleNoteChange = (pointId: string, notes: string) => {
    const newResponses = new Map(responses);
    newResponses.set(pointId, {
      ...responses.get(pointId),
      id: pointId,
      status: responses.get(pointId)?.status || 'PASS',
      notes,
      has_media: responses.get(pointId)?.has_media || false,
    });
    setResponses(newResponses);
  };

  const handleSubmitAudit = async () => {
    setSubmitting(true);
    try {
      // Submit all items
      for (const [pointId, item] of responses) {
        await fetch('/api/v1/audit-items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            auditSessionId: sessionId,
            structureNodeId: nodeId,
            templateAuditPointId: pointId,
            status: item.status,
            notes: item.notes,
          }),
        });
      }

      // Submit session
      await fetch(`/api/v1/audit-sessions/${sessionId}/submit`, {
        method: 'POST',
      });

      // Redirect back
      window.location.href = `/auditor/projects/${projectId}`;
    } catch (error) {
      console.error('Error submitting audit:', error);
      alert('Failed to submit audit');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  const severityBadgeColors = {
    LOW: 'bg-blue-100 text-blue-800',
    MEDIUM: 'bg-yellow-100 text-yellow-800',
    HIGH: 'bg-red-100 text-red-800',
  };

  return (
    <div>
      {/* Sticky Breadcrumb Header (hidden on desktop, sidebar present) */}
      <div className="border-b border-gray-200 p-4 sticky top-0 z-10 bg-white/90 backdrop-blur shadow-sm md:hidden">
        <Breadcrumbs
          size="xs"
          items={[
            { label: 'Project', href: `/auditor/projects/${projectId}` },
            ...breadcrumb.map((b) => ({ label: b.name, href: `/auditor/structure/${projectId}/${b.id}` })),
            { label: nodeName },
          ]}
        />
        <div className="mt-2 flex items-center justify-end">
          <button
            onClick={() => setShowHistory((v) => !v)}
            className="btn btn-outline"
          >
            {showHistory ? 'Hide History' : 'Show History'}
          </button>
        </div>
      </div>

      {/* Desktop breadcrumb + header with action */}
      <div className="hidden md:block">
        <Breadcrumbs
          size="sm"
          className="mb-2"
          items={[
            { label: 'Project', href: `/auditor/projects/${projectId}` },
            ...breadcrumb.map((b) => ({ label: b.name, href: `/auditor/structure/${projectId}/${b.id}` })),
            { label: nodeName },
          ]}
        />
        <PageHeader
          title={nodeName}
          subtitle="Check Points"
          align="center"
          action={
            <button onClick={() => setShowHistory((v) => !v)} className="btn btn-outline">
              {showHistory ? 'Hide History' : 'Show History'}
            </button>
          }
        />
      </div>

      {/* Check Points */}
      <div className="pb-32 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {auditPoints.map((point) => {
          const response = responses.get(point.id);
          const isAnswered = response !== undefined;

          return (
            <div key={point.id} className="card card-shadow">
              {/* Point Header */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 text-sm mb-1">{point.name}</h3>
                  <div className="flex gap-1 flex-wrap">
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded ${
                        severityBadgeColors[point.severity]
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
                {isAnswered && (
                  <div
                    className={`text-xs font-medium px-2 py-1 rounded whitespace-nowrap ${
                      response?.status === 'PASS'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {response?.status}
                  </div>
                )}
              </div>

              {/* Pass/Fail Buttons */}
              <div className="flex gap-2 mb-3">
                <button
                  onClick={() => handleStatusChange(point.id, 'PASS')}
                  className={`flex-1 py-2 px-3 rounded font-medium text-sm transition-colors ${
                    response?.status === 'PASS'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white border border-emerald-300 text-emerald-700 hover:bg-emerald-50'
                  }`}
                >
                  ✓ Pass
                </button>
                <button
                  onClick={() => handleStatusChange(point.id, 'FAIL')}
                  className={`flex-1 py-2 px-3 rounded font-medium text-sm transition-colors ${
                    response?.status === 'FAIL'
                      ? 'bg-rose-600 text-white'
                      : 'bg-white border border-rose-300 text-rose-700 hover:bg-rose-50'
                  }`}
                >
                  ✗ Fail
                </button>
              </div>

              {/* Notes */}
              {isAnswered && (
                <div className="mb-3">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Notes
                    {response?.status === 'FAIL' && ' (recommended)'}
                  </label>
                  <textarea
                    value={response?.notes || ''}
                    onChange={(e) => handleNoteChange(point.id, e.target.value)}
                    placeholder="Add notes..."
                    className="w-full px-2 py-2 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    rows={2}
                  />
                </div>
              )}

              {/* History section */}
              {showHistory && point.history && point.history.length > 0 && (
                <div className="mt-2 border-t border-gray-200 pt-2">
                  <div className="text-xs text-gray-600 mb-1">Previous checks</div>
                  <div className="space-y-1">
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
                </div>
              )}

              {/* Photo Upload for Failures */}
              {response?.status === 'FAIL' && (
                <div className="border border-red-200 rounded p-3 bg-red-50">
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    📸 Photo (Required)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    className="w-full text-xs text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700"
                  />
                  {response?.has_media && (
                    <p className="text-xs text-green-600 mt-1">✓ Photo added</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
        </div>
      </div>

      {/* Fixed Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-white/95 backdrop-blur p-4 flex gap-2">
        <Link
          href={`/auditor/structure/${projectId}/${nodeId}`}
          className="flex-1 btn btn-outline text-center"
        >
          Back
        </Link>
        <button
          onClick={handleSubmitAudit}
          disabled={submitting}
          className="flex-1 btn btn-primary disabled:opacity-60"
        >
          {submitting ? 'Submitting...' : 'Submit'}
        </button>
      </div>
    </div>
  );
}
