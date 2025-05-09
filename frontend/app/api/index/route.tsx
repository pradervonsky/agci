// app/api/index/route.ts
import { NextResponse } from 'next/server';
import { getLatestIndex, getHistoricalIndex } from '@/lib/supabase';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const days = url.searchParams.get('days');
  
  try {
    if (days) {
      // Get historical data
      const historical = await getHistoricalIndex(parseInt(days, 10));
      return NextResponse.json(historical);
    } else {
      // Get latest index only
      const latest = await getLatestIndex();
      return NextResponse.json(latest);
    }
  } catch (error) {
    console.error('Error fetching index data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch index data' },
      { status: 500 }
    );
  }
}