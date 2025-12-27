'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { IconCompass, IconCircleCheck } from '@tabler/icons-react';
import PageHeader from '@/components/ui/PageHeader';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface TreeNode {
  id: string;
  name: string;
  level_type: string;
  children: TreeNode[];
  isAuditable: boolean;
}

export default function ProjectDetail() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  const [rootNode, setRootNode] = useState<TreeNode | null>(null);
  const [projectName, setProjectName] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStructure() {
      try {
        const response = await fetch(
          `/api/v1/projects/${projectId}/structure`,
        );
        if (!response.ok) throw new Error('Failed to fetch structure');
        const data = await response.json() as TreeNode;
        setRootNode(data);
        setProjectName(data.name);
      } catch (error) {
        console.error('Error fetching structure:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStructure();
  }, [projectId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!rootNode) {
    return (
      <div className="min-h-screen bg-white p-4">
        <Link
          href="/auditor"
          className="text-indigo-600 hover:text-indigo-700 font-medium mb-4 inline-block"
        >
          ← Back to Projects
        </Link>
        <p className="text-gray-500">No structure data available</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="py-16">
        <PageHeader title={projectName} subtitle="Select a section to inspect" align="center" />
      </div>

      {/* Children Grid */}
      <div className="max-w-6xl mx-auto">
        {rootNode.children && rootNode.children.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {rootNode.children.map((child) => (
              <Card
                key={child.id}
                className="card-shadow hover:-translate-y-0.5 transition-all cursor-pointer"
                onClick={() => router.push(`/auditor/structure/${projectId}/${child.id}`)}
              >
                <CardContent className="space-y-2">
                  <CardTitle className="text-lg">
                    <div className="text-xs uppercase tracking-wide text-muted-foreground font-mono font-bold">
                      {child.level_type}
                    </div>
                    {child.name}
                  </CardTitle>
                  {child.isAuditable && (
                    <Badge variant="secondary" className="mt-1 inline-flex items-center gap-1">
                      <IconCircleCheck size={14} /> Auditable
                    </Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No sub-levels available</p>
        )}
      </div>
    </div>
  );
}

