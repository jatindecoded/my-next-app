import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getStructureTree, getStructureNode } from '@/lib/mock';

export async function GET(req: NextRequest, ctx: RouteContext<'/api/v1/projects/[projectId]/structure'>) {
  try {
    const { projectId } = await ctx.params;
    const { searchParams } = new URL(req.url);
    const nodeId = searchParams.get('nodeId');

    if (nodeId) {
      const result = getStructureNode(projectId, nodeId);
      if (!result) {
        return NextResponse.json({ error: 'Node not found' }, { status: 404 });
      }
      return NextResponse.json(result);
    }

    const tree = getStructureTree(projectId);
    return NextResponse.json(tree);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Failed';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
