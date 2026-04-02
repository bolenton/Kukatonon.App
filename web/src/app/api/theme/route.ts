import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createServiceClient();
    const { data } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'theme')
      .single();

    return NextResponse.json(
      { theme: data?.value || 'nature' },
      { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } }
    );
  } catch {
    return NextResponse.json({ theme: 'nature' });
  }
}
