import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { builderProjectDefects } from '@/lib/mock';

export async function GET(_req: NextRequest, ctx: RouteContext<'/api/v1/builder/projects/[projectId]/defects'>) {
  const { projectId } = await ctx.params;
  return NextResponse.json(builderProjectDefects(projectId));
}
