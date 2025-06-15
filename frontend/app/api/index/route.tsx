// app/api/index/route.tsx
import { NextResponse } from 'next/server';
import { getLatestIndex } from '@/lib/supabase';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const days = url.searchParams.get('days');
  
  try {
    if (days) {
      // Calculate the date range for the last N days
      const today = new Date();
      const pastDate = new Date();
      pastDate.setDate(today.getDate() - parseInt(days, 10));
      
      // Format dates for Supabase query
      const todayStr = today.toISOString().split('T')[0];
      const pastDateStr = pastDate.toISOString().split('T')[0];
      
      // Get historical data using direct Supabase client
      const { data, error } = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/green_city_index?select=date,overall_score&gte.date=${pastDateStr}&lte.date=${todayStr}&order=date.asc`, {
        headers: {
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        },
      }).then(res => res.json());

      return new NextResponse(JSON.stringify(data), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });

    } else {
      // Get latest index only
      const latest = await getLatestIndex();
      return new NextResponse(JSON.stringify(latest), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*', // ✅ Allow from all origins
        },
      });
    }

  } catch (error) {
    console.error('Error fetching index data:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to fetch index data' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*', // ✅ Also needed for error cases
        },
      }
    );
  }
}