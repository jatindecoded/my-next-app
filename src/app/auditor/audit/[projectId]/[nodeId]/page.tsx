'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface AuditPoint {
  id: string;
  name: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  is_mandatory: boolean;
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
  const [auditPoints, setAuditPoints] = useState<AuditPoint[]>([]);
  const [sessionId, setSessionId] = useState<string>('');
  const [responses, setResponses] = useState<Map<string, AuditItemResponse>>(
    new Map(),
  );
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [nodeName, setNodeName] = useState<string>('');
  const [breadcrumb, setBreadcrumb] = useState<Breadcrumb[]>([]);

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

        // Fetch checklist
        const checklistRes = await fetch(
          `/api/v1/audit-sessions/${session.id}/checklist/${nodeId}`,
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
  }, [projectId, nodeId]);

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
    <div className="min-h-screen bg-white">
      {/* Sticky Breadcrumb Header */}
      <div className="border-b border-gray-200 p-4 sticky top-0 z-10 bg-white">
        <div className="flex items-center gap-2 text-xs text-gray-600 mb-2 overflow-x-auto">
          <Link
            href={`/auditor/projects/${projectId}`}
            className="text-indigo-600 hover:text-indigo-700 whitespace-nowrap font-medium"
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
            {nodeName}
          </span>
        </div>
        <h1 className="text-lg font-semibold text-gray-900">{nodeName}</h1>
      </div>

      {/* Audit Points */}
      <div className="p-4 space-y-3 pb-24">
        {auditPoints.map((point) => {
          const response = responses.get(point.id);
          const isAnswered = response !== undefined;

          return (
            <div
              key={point.id}
              className="border border-gray-200 rounded-lg p-4"
            >
              {/* Point Header */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 text-sm mb-1">
                    {point.name}
                  </h3>
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
                      ? 'bg-green-600 text-white'
                      : 'bg-white border border-green-300 text-green-700 hover:bg-green-50'
                  }`}
                >
                  ✓ Pass
                </button>
                <button
                  onClick={() => handleStatusChange(point.id, 'FAIL')}
                  className={`flex-1 py-2 px-3 rounded font-medium text-sm transition-colors ${
                    response?.status === 'FAIL'
                      ? 'bg-red-600 text-white'
                      : 'bg-white border border-red-300 text-red-700 hover:bg-red-50'
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

      {/* Fixed Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-white p-4 flex gap-2">
        <Link
          href={`/auditor/structure/${projectId}/${nodeId}`}
          className="flex-1 bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors text-center text-sm"
        >
          Back
        </Link>
        <button
          onClick={handleSubmitAudit}
          disabled={submitting}
          className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-indigo-700 disabled:bg-gray-400 transition-colors text-sm"
        >
          {submitting ? 'Submitting...' : 'Submit'}
        </button>
      </div>
    </div>
  );
}
