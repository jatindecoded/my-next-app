'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
//
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import PageHeader from '@/components/ui/PageHeader';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { IconAsterisk, IconLockOpen, IconPencilCheck, IconPlaylistAdd, IconStar, IconX } from '@tabler/icons-react';

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

interface AuditItemResponse {
  id: string;
  status: 'PASS' | 'FAIL';
  notes?: string;
  has_media: boolean;
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

  // Audit mode state
  const [isAuditing, setIsAuditing] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const [responses, setResponses] = useState<Map<string, AuditItemResponse>>(new Map());
  const [submitting, setSubmitting] = useState(false);

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

  const startAudit = async () => {
    try {
      // Start audit session
      const sessionRes = await fetch('/api/v1/audit-sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId }),
      });
      const session = await sessionRes.json() as { id: string };
      setSessionId(session.id);
      setIsAuditing(true);
    } catch (error) {
      console.error('Error starting audit:', error);
      alert('Failed to start audit session');
    }
  };

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

      // Reset state and refresh data
      setIsAuditing(false);
      setResponses(new Map());
      setSessionId('');

      // Refresh the page data to show updated history
      const response = await fetch(
        `/api/v1/projects/${projectId}/structure?nodeId=${nodeId}`,
      );
      if (response.ok) {
        const nodeData = await response.json() as StructureData;
        setData(nodeData);
      }

      alert('Audit submitted successfully!');
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
        <p className="text-muted-foreground">Loading...</p>
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
        <p className="text-muted-foreground mt-4">Node not found</p>
      </div>
    );
  }

  const node = data.node;
  const auditPoints = data.audit_points || [];
  const breadcrumb = data.breadcrumb || [];

  return (
    <div>
      {/* Mobile sticky breadcrumb */}
      <div className=" -mx-6 sticky top-0 py-4 z-10 backdrop-blur-xl">
        <Breadcrumbs
          items={[
            { label: 'Project', href: `/auditor/projects/${projectId}` },
            ...breadcrumb.map((b) => ({ label: b.name, href: `/auditor/structure/${projectId}/${b.id}` })),
            { label: node.name },
          ]}
        />
      </div>

      <PageHeader title={node.name} subtitle={node.level_type} subtitleClassName='font-mono text-xs font-bold !text-muted-foreground' align="center" />
      {/* Desktop breadcrumb + header
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
      </div> */}

      <div className="space-y-6 max-w-6xl mx-auto md:px-0">
        {/* Check Points (if auditable) */}
        {auditPoints.length > 0 && (
          <div>
            <div className="flex flex-col md:flex-row items-center justify-between mb-4 gap-4">
              {/* <div className=''>
                <h2 className="text-md font-bold">
                  CHECK POINTS <span className='text-xs text-muted-foreground'>for {node.name}</span>
                </h2>
              </div> */}
              <div className="flex items-center justify-center gap-2 w-full">
                {!isAuditing ? (
                  <Button size="sm" className='bg-green-600 hover:bg-green-700 w-full max-w-xl' onClick={startAudit}>
                    <IconPencilCheck /> Start check
                  </Button>
                ) : (
                  <div className="flex w-full gap-2 max-w-xl">
                    <Button size="sm" className='flex-1' variant="outline" onClick={() => {
                      setIsAuditing(false);
                      setResponses(new Map());
                    }}>
                      <IconX /> Cancel
                    </Button>
                    <Button
                      size="sm"
                      className='bg-green-600 hover:bg-green-700 flex-1'
                        onClick={handleSubmitAudit}
                        disabled={submitting || responses.size === 0}
                      >
                        {submitting ? 'Submitting...' : `Submit (${responses.size}/${auditPoints.length})`}
                      </Button>
                  </div>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-4">
              {auditPoints.map((point) => {
                const severityVariant =
                  point.severity === 'HIGH'
                    ? 'destructive'
                    : point.severity === 'MEDIUM'
                      ? 'secondary'
                      : 'default';
                const response = responses.get(point.id);

                return (
                  <Card key={point.id} className="border-dashed">
                    <CardHeader className="flex flex-col gap-2">
                      <CardTitle className=" w-full">
                        <div className='flex gap-2 justify-between items-center w-full'>
                          <div className='text-xl font-bold'>
                            <div className="text-xs font-semibold text-muted-foreground font-mono">CHECK POINT</div>
                            {point.name}
                          </div>
                          {point.is_mandatory && (
                            <Badge className="font-bold bg-red-100 text-red-600" variant="destructive">
                              <IconAsterisk />Required
                            </Badge>
                          )}
                        </div>

                        {/* <CardHeader>
                          <CardTitle className="text-xl">{child.name}</CardTitle>
                        </CardHeader> */}
                      </CardTitle>
                      {/* {isAuditing && response && (
                          <Badge 
                            variant={response.status === 'PASS' ? 'secondary' : 'destructive'}
                            className="font-bold"
                          >
                            {response.status}
                          </Badge>
                        )} */}
                    </CardHeader>

                    {/* Audit Controls - shown only when auditing */}
                    {isAuditing && (
                      <CardContent className="border-t border-gray-100 pt-4 space-y-3">
                        {/* Pass/Fail Buttons */}
                        <div className="flex gap-2">
                          <Button
                            variant={response?.status === 'PASS' ? 'default' : 'outline'}
                            className={response?.status === 'PASS' ? 'bg-emerald-600 hover:bg-emerald-700 flex-1' : 'flex-1'}
                            onClick={() => handleStatusChange(point.id, 'PASS')}
                          >
                            ✓ Pass
                          </Button>
                          <Button
                            variant={response?.status === 'FAIL' ? 'destructive' : 'outline'}
                            className="flex-1"
                            onClick={() => handleStatusChange(point.id, 'FAIL')}
                          >
                            ✗ Fail
                          </Button>
                        </div>

                        {/* Notes */}
                        {response && (
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Notes {response.status === 'FAIL' && '(recommended)'}
                            </label>
                            <Textarea
                              value={response.notes || ''}
                              onChange={(e) => handleNoteChange(point.id, e.target.value)}
                              placeholder="Add notes..."
                              rows={2}
                              className="text-xs"
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
                          </div>
                        )}
                      </CardContent>
                    )}

                    {/* History - shown when not auditing */}
                    {!isAuditing && !collapseAll && (
                      <CardContent className="border-t border-gray-100 pt-4">
                        <>
                          <div className="flex items-center justify-between text-xs text-gray-600">
                            <span>Previous checks</span>
                          </div>
                          <div className="space-y-2 mt-2 text-xs">
                            {point.history ? point.history?.map((h) => (
                              <div key={h.item_id} className="flex items-center justify-between tracking-tight">
                                <div className="flex items-stretch justify-stretch gap-2">
                                  <div className="text-gray-500 font-mono">
                                    {new Date(h.created_at).toLocaleDateString()}
                                  </div>
                                  <div
                                    className={`px-2 py-0.5 font-mono h-full text-white ${h.status === 'PASS' ? 'bg-green-500' : 'bg-red-500'} rounded`}
                                  >
                                    {h.status}
                                  </div>
                                  <div>
                                    <span className="text-gray-800 font-mono">{h.auditor_name}</span>
                                    <div className="text-gray-600 font-mono italic text-xs">{h.notes ? `"${h.notes}"` : ''}</div>
                                  </div>
                                </div>
                                {/* {h.has_media && <Badge variant="secondary">Photo</Badge>} */}
                              </div>
                            )) :
                              <div className='text-sx'>
                                No previous checks available
                              </div>
                            }
                          </div>
                        </>
                      </CardContent>
                    )}
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Child Nodes */}
        {node.children && node.children.length > 0 && (
          <div className='pt-8'>
            <h2 className="text-md font-bold text-gray-900 mb-4">
              {node.children[0].level_type}S <span className="text-xs text-muted-foreground font-semibold">in {node.name}</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
              {node.children.map((child) => (
                <Card
                  key={child.id}
                  className="transition-all cursor-pointer"
                  onClick={() =>
                    router.push(
                      `/auditor/structure/${projectId}/${child.id}`,
                    )
                  }
                >
                  <CardHeader>
                    <CardTitle className="text-xl font-bold">
                      <div className="text-xs font-semibold text-muted-foreground font-mono">{child.level_type}</div>
                      {child.name}
                    </CardTitle>
                  </CardHeader>
                  {/* <CardFooter>
                    {child.isAuditable && <Badge variant="secondary"><IconLockOpen />Auditable</Badge>}
                  </CardFooter> */}
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* No children and not auditable */}
        {(!node.children || node.children.length === 0) && (auditPoints.length === 0) && (
            <p className="text-gray-500 text-sm">
              No sub-levels or check points available
            </p>
          )}
      </div>
    </div>
  );
}
