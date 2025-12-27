import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { getDB } from '@/lib/db';
import { audit_media, audit_items } from '@/lib/db';
import { nanoid } from 'nanoid';
import { eq } from 'drizzle-orm';

export async function POST(req: NextRequest, ctx: RouteContext<'/api/v1/audit-items/[auditItemId]/media'>) {
  try {
    const { auditItemId } = await ctx.params;
    const body = (await req.json()) as { storageKey: string };

    if (!body?.storageKey) {
      return NextResponse.json({ error: 'storageKey required' }, { status: 400 });
    }

    const { env } = await getCloudflareContext({ async: true });
    const db = getDB(env);

    // Verify audit item exists
    const item = await db.select().from(audit_items).where(eq(audit_items.id, auditItemId)).get();
    if (!item) {
      return NextResponse.json({ error: 'Audit item not found' }, { status: 404 });
    }

    // Create media record
    const mediaId = nanoid();
    const now = new Date();
    const media = {
      id: mediaId,
      audit_item_id: auditItemId,
      storage_key: body.storageKey,
      created_at: now,
    };

    await db.insert(audit_media).values(media);

    return NextResponse.json(media);
  } catch (err) {
    console.error('Error creating audit media:', err);
    return NextResponse.json(
      { error: 'Failed to create audit media' },
      { status: 500 }
    );
  }
}
