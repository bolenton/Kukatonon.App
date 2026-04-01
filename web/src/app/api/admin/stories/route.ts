import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/supabase/admin';
import { validateStoryContent } from '@/lib/validation';
import { sanitizeHtml } from '@/lib/sanitize';
import { createSlug } from '@/lib/slugify';

export async function GET(request: NextRequest) {
  const { error, status, supabase } = await requireAdmin();
  if (error) return NextResponse.json({ error }, { status });

  const { searchParams } = new URL(request.url);
  const statusFilter = searchParams.get('status');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const offset = (page - 1) * limit;

  let query = supabase
    .from('stories')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (statusFilter && ['pending', 'approved', 'rejected'].includes(statusFilter)) {
    query = query.eq('status', statusFilter);
  }

  const { data, error: queryError, count } = await query;

  if (queryError) {
    return NextResponse.json({ error: queryError.message }, { status: 500 });
  }

  return NextResponse.json({
    stories: data,
    pagination: { page, limit, total: count || 0, totalPages: Math.ceil((count || 0) / limit) },
  });
}

export async function POST(request: NextRequest) {
  const { error, status, user, supabase } = await requireAdmin();
  if (error || !user) return NextResponse.json({ error }, { status });

  const body = await request.json();
  const errors = validateStoryContent(body);
  if (errors.length > 0) {
    return NextResponse.json({ errors }, { status: 422 });
  }

  const { data, error: insertError } = await supabase
    .from('stories')
    .insert({
      title: body.title.trim(),
      slug: createSlug(body.title),
      honoree_name: body.honoree_name.trim(),
      summary: body.summary?.trim() || null,
      content_html: body.content_html ? sanitizeHtml(body.content_html) : null,
      youtube_urls: body.youtube_urls || [],
      media_items: body.media_items || [],
      cover_image_url: body.cover_image_url || null,
      is_featured: body.is_featured || false,
      status: 'approved',
      source_type: 'admin',
      approved_by: user.id,
      approved_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  // Audit log
  await supabase.from('audit_log').insert({
    actor_user_id: user.id,
    action: 'create_story',
    target_type: 'story',
    target_id: data.id,
  });

  return NextResponse.json(data, { status: 201 });
}
