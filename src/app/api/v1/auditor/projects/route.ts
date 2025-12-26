import { NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { getDB, projects } from '@/lib/db';

export async function GET() {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const db = getDB(env);
    const allProjects = await db.select().from(projects);
    return NextResponse.json(allProjects);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch projects';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
