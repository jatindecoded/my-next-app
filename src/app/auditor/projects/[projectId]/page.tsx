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
      <div className="flex items-center justify-center min-h-screen bg-white">
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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 p-4 sticky top-0 z-10 bg-white">
        <Link
          href="/auditor"
          className="text-indigo-600 hover:text-indigo-700 font-medium text-sm mb-2 inline-block"
        >
          ← Projects
        </Link>
        <h1 className="text-xl font-semibold text-gray-900">{projectName}</h1>
      </div>

      {/* Children Grid */}
      <div className="p-4">
        {rootNode.children && rootNode.children.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {rootNode.children.map((child) => (
              <button
                key={child.id}
                onClick={() =>
                  router.push(`/auditor/structure/${projectId}/${child.id}`)
                }
                className="p-4 border border-gray-200 rounded-lg hover:border-indigo-400 hover:bg-indigo-50 transition-all text-left"
              >
                <div className="text-sm text-gray-500">{child.level_type}</div>
                <div className="font-medium text-gray-900">{child.name}</div>
              </button>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No sub-levels available</p>
        )}
      </div>
    </div>
  );
}

