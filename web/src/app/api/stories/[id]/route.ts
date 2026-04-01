import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

const PUBLIC_FIELDS = `
  id, title, slug, honoree_name, summary, content_html,
  youtube_urls, media_items, cover_image_url,
  status, is_featured, source_type, submitted_by_name,
  created_at, updated_at
`;

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createServiceClient();

  const { data, error } = await supabase
    .from('stories')
    .select(PUBLIC_FIELDS)
    .eq('id', id)
    .eq('status', 'approved')
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Story not found' }, { status: 404 });
  }

  return NextResponse.json(data);
}
