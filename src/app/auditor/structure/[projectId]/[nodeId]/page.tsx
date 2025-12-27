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
import { IconAsterisk, IconLockOpen, IconPencilCheck, IconPlaylistAdd, IconStar } from '@tabler/icons-react';

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
      <div className=" -mx-6 sticky top-0 py-4 z-10 backdrop-blur-xl">
        <Breadcrumbs
          items={[
            { label: 'Project', href: `/auditor/projects/${projectId}` },
            ...breadcrumb.map((b) => ({ label: b.name, href: `/auditor/structure/${projectId}/${b.id}` })),
            { label: node.name },
          ]}
        />
        <PageHeader title={node.name} subtitle={node.level_type} align="center" />
      </div>

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

      <div className="space-y-6 max-w-6xl mx-auto px-4 md:px-0">
        {/* Check Points (if auditable) */}
        {node.isAuditable && auditPoints.length > 0 && (
          <div>
            <div className="flex flex-col md:flex-row items-center justify-between mb-4 gap-4"> 
              <div className=''>
                {/* <div className="text-sm text-gray-500">Checks</div> */}
                <h2 className="text-md font-bold text-gray-900">CHECK POINTS <span className='text-xs text-muted-foreground'>for {node.name}</span></h2>
              </div>
              <div className="flex items-center gap-2">
                {/* <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCollapseAll((prev) => {
                      const next = !prev;
                      const map: Record<string, boolean> = {};
                      for (const p of auditPoints) map[p.id] = next;
                      setCollapsedHistory(map);
                      return next;
                    })
                  }
                >
                  {collapseAll ? 'Show history' : 'Hide history'}
                </Button> */}
                <Button size="sm" className='bg-green-600 hover:bg-green-700' onClick={() => router.push(`/auditor/audit/${projectId}/${nodeId}`)}>
                  <IconPencilCheck/> Start check
                </Button>
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

                return (
                  <Card key={point.id} className="">
                    <CardHeader className="flex flex-col gap-2">
                      <CardTitle className="text-base">{point.name}</CardTitle>
                      <div className="flex items-center gap-2">
                        {/* <Badge variant={severityVariant}>{point.severity}</Badge> */}
                        {point.is_mandatory && (
                          <Badge className="font-bold bg-red-100 text-red-600" variant="destructive">
                            {<IconAsterisk />}Required
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    {!collapseAll && (
                      <CardContent className="border-t border-gray-100 pt-4">
                        <>
                          <div className="flex items-center justify-between text-xs text-gray-600">
                            <span>Previous checks</span>
                          </div>
                          <div className="space-y-2 mt-2 text-xs">
                              {point.history ? point.history?.map((h) => (
                                <div key={h.item_id} className="flex items-center justify-between tracking-tight">
                                  <div className="flex items-center gap-2">

                                    <span className="text-gray-500 font-mono">
                                      {new Date(h.created_at).toLocaleDateString()}
                                    </span>
                                    <Badge
                                      variant={h.status === 'PASS' ? 'secondary' : 'destructive'}
                                      className="px-2 py-0.5 font-mono"
                                    >
                                      {h.status}
                                    </Badge>
                                    <span className="text-gray-800 font-mono">{h.auditor_name}</span>
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
            <h2 className="text-md font-bold text-gray-900 mb-3">
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
                    <div className="text-xs font-semibold text-gray-400">{child.level_type}</div>
                    <CardTitle className="text-xl">{child.name}</CardTitle>
                  </CardHeader>
                  <CardFooter>
                    {child.isAuditable && <Badge variant="secondary"><IconLockOpen />Auditable</Badge>}
                  </CardFooter>
                </Card>
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
