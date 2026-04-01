import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/supabase/admin';
import { sanitizeHtml } from '@/lib/sanitize';
import { createSlug } from '@/lib/slugify';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { error, status, supabase } = await requireAdmin();
  if (error) return NextResponse.json({ error }, { status });

  const { data, error: queryError } = await supabase
    .from('stories')
    .select('*')
    .eq('id', id)
    .single();

  if (queryError || !data) {
    return NextResponse.json({ error: 'Story not found' }, { status: 404 });
  }

  return NextResponse.json(data);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { error, status, user, supabase } = await requireAdmin();
  if (error || !user) return NextResponse.json({ error }, { status });

  const body = await request.json();
  const updates: Record<string, unknown> = {};

  if (body.title !== undefined) {
    updates.title = body.title.trim();
    updates.slug = createSlug(body.title);
  }
  if (body.honoree_name !== undefined) updates.honoree_name = body.honoree_name.trim();
  if (body.summary !== undefined) updates.summary = body.summary?.trim() || null;
  if (body.content_html !== undefined) updates.content_html = body.content_html ? sanitizeHtml(body.content_html) : null;
  if (body.youtube_urls !== undefined) updates.youtube_urls = body.youtube_urls;
  if (body.media_items !== undefined) updates.media_items = body.media_items;
  if (body.cover_image_url !== undefined) updates.cover_image_url = body.cover_image_url;
  if (body.is_featured !== undefined) updates.is_featured = body.is_featured;
  if (body.review_notes !== undefined) updates.review_notes = body.review_notes;

  const { data, error: updateError } = await supabase
    .from('stories')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  await supabase.from('audit_log').insert({
    actor_user_id: user.id,
    action: 'update_story',
    target_type: 'story',
    target_id: id,
    meta: { fields: Object.keys(updates) },
  });

  return NextResponse.json(data);
}
