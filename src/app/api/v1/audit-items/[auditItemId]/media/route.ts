import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { uploadMedia } from '@/lib/mock';

export async function POST(_req: NextRequest, ctx: RouteContext<'/api/v1/audit-items/[auditItemId]/media'>) {
  const { auditItemId } = await ctx.params;
  const media = uploadMedia(auditItemId);
  return NextResponse.json(media);
}
