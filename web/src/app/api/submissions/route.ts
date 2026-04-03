import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { validateSubmission } from '@/lib/validation';
import { sanitizeHtml } from '@/lib/sanitize';
import { createSlug } from '@/lib/slugify';
import type { SubmissionPayload } from '@/types/database';

export async function POST(request: NextRequest) {
  let body: SubmissionPayload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const errors = validateSubmission(body);
  if (errors.length > 0) {
    return NextResponse.json({ errors }, { status: 422 });
  }

  const supabase = await createServiceClient();

  const { data, error } = await supabase
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
      status: 'pending',
      source_type: 'public_submission',
      submitted_by_name: body.submitted_by_name.trim(),
      submitted_by_phone: body.submitted_by_phone?.trim() || null,
      submitted_by_whatsapp: body.submitted_by_whatsapp?.trim() || null,
      submitted_by_email: body.submitted_by_email?.trim() || null,
      consent_confirmed: true,
      event_latitude: body.event_latitude ?? null,
      event_longitude: body.event_longitude ?? null,
      event_location_name: body.event_location_name?.trim() || null,
    })
    .select('id')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(
    { message: 'Story submitted successfully. It will be reviewed by our team.', id: data.id },
    { status: 201 }
  );
}
