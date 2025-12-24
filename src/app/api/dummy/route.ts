
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { NextResponse } from 'next/server';

export async function GET() {
  // Fetch data from a real-world dummy API
  try {
    const {env} = await getCloudflareContext({async: true});
    // Query all table names from sqlite_master
    const tablesResult = await env.DB.prepare("SELECT * from test").all();
    console.log('Tables in DB:', tablesResult);
    return NextResponse.json({ tables: tablesResult });
  } catch (error) {
    console.log('Error fetching data:', error);
    return NextResponse.json({ error: 'Error fetching data', message: error as string }, { status: 500 });
  }
}
