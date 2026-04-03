import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

const PUBLIC_FIELDS = `
  id, title, slug, honoree_name, summary, content_html,
  youtube_urls, media_items, cover_image_url, content_blocks,
  category_ids, status, is_featured, source_type, submitted_by_name,
  event_latitude, event_longitude, event_location_name,
  created_at, updated_at
`;

export async function GET(request: NextRequest) {
  const supabase = await createServiceClient();
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '12');
  const featured = searchParams.get('featured');
  const category = searchParams.get('category');
  const search = searchParams.get('search')?.trim();
  const offset = (page - 1) * limit;

  let query = supabase
    .from('stories')
    .select(PUBLIC_FIELDS, { count: 'exact' })
    .eq('status', 'approved')
    .order('is_featured', { ascending: false })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (featured === 'true') {
    query = query.eq('is_featured', true);
  }

  if (category) {
    query = query.contains('category_ids', [category]);
  }

  if (search) {
    query = query.or(`title.ilike.%${search}%,honoree_name.ilike.%${search}%,summary.ilike.%${search}%`);
  }

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    stories: data,
    pagination: {
      page,
      limit,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit),
    },
  });
}
