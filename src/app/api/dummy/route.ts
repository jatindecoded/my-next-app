
import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET() {
  // Fetch data from a real-world dummy API
  try {
    const res = await fetch('https://jsonplaceholder.typicode.com/todos/1');
    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching data', message: error as string }, { status: 500 });
  }
}
