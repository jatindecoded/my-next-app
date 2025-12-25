
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { NextResponse } from 'next/server';
import { drizzle } from 'drizzle-orm/d1';
import { items } from '../../../drizzle/schema';

export async function GET() {
  try {
    const { env } = await getCloudflareContext({ async: true });
    
    // Initialize Drizzle with D1
    const db = drizzle(env.DB);
    
    // Query using Drizzle ORM
    const allItems = await db.select().from(items);
    
    console.log('Items from DB:', allItems);
    return NextResponse.json({ items: allItems });
  } catch (error) {
    console.log('Error fetching data:', error);
    return NextResponse.json({ error: 'Error fetching data', message: String(error) }, { status: 500 });
  }
}
