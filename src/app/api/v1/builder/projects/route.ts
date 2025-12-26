import { NextResponse } from 'next/server';
import { builderProjectSummaries } from '@/lib/mock';

export async function GET() {
  return NextResponse.json(builderProjectSummaries());
}
