'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { IconChevronRight, IconChevronDown, IconCircleCheck } from '@tabler/icons-react';

interface TreeNode {
  id: string;
  name: string;
  level_type: string;
  children: TreeNode[];
  isAuditable: boolean;
}

interface ProjectTreeNavProps {
  projectId: string;
  role: 'auditor' | 'builder';
}

function TreeNodeItem({ 
  node, 
  projectId, 
  role, 
  level = 0,
  currentNodeId 
}: { 
  node: TreeNode; 
  projectId: string; 
  role: string; 
  level?: number;
  currentNodeId?: string;
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = node.children && node.children.length > 0;
  const isActive = currentNodeId === node.id;
  const href = `/${role}/structure/${projectId}/${node.id}`;

  return (
    <div>
      <div className="flex items-center gap-1">
        {/* Expand/collapse button */}
        {hasChildren && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-0.5 hover:bg-gray-100 rounded text-gray-500"
          >
            {isExpanded ? (
              <IconChevronDown size={14} />
            ) : (
              <IconChevronRight size={14} />
            )}
          </button>
        )}
        
        {/* Node link */}
        <Link
          href={href}
          className={`flex-1 flex items-center gap-1.5 px-2 py-1 rounded text-xs hover:bg-indigo-50 transition-colors ${
            isActive ? 'bg-indigo-100 text-indigo-900 font-semibold' : 'text-gray-700'
          }`}
          style={{ marginLeft: `${hasChildren ? 0 : 1.25}rem` }}
        >
          {/* {node.isAuditable && (
            <IconCircleCheck size={12} className="text-green-600 flex-shrink-0" />
          )} */}
          <span className="truncate">{node.name}</span>
          <span className="text-[10px] text-gray-400 uppercase tracking-wide">
            {node.level_type}
          </span>
        </Link>
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div className="ml-3 border-l border-gray-200 pl-1 mt-0.5 space-y-0.5">
          {node.children.map((child) => (
            <TreeNodeItem
              key={child.id}
              node={child}
              projectId={projectId}
              role={role}
              level={level + 1}
              currentNodeId={currentNodeId}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ProjectTreeNav({ projectId, role }: ProjectTreeNavProps) {
  const [rootNode, setRootNode] = useState<TreeNode | null>(null);
  const [loading, setLoading] = useState(true);
  const params = useParams();
  
  // Extract current node ID from URL if we're on a structure page
  const currentNodeId = params.nodeId as string | undefined;

  useEffect(() => {
    async function fetchStructure() {
      try {
        const response = await fetch(`/api/v1/projects/${projectId}/structure`);
        if (!response.ok) throw new Error('Failed to fetch structure');
        const data = await response.json() as TreeNode;
        setRootNode(data);
      } catch (error) {
        console.error('Error fetching structure:', error);
      } finally {
        setLoading(false);
      }
    }

    if (projectId) {
      fetchStructure();
    }
  }, [projectId]);

  if (loading) {
    return (
      <div className="text-xs text-gray-500 px-2 py-1">
        Loading structure...
      </div>
    );
  }

  if (!rootNode) {
    return null;
  }

  return (
    <div className="space-y-1">
      <div className="text-[10px] uppercase tracking-wide text-gray-500 font-semibold px-2 mb-2">
        Project Structure
      </div>
      <TreeNodeItem
        node={rootNode}
        projectId={projectId}
        role={role}
        currentNodeId={currentNodeId}
      />
    </div>
  );
}
