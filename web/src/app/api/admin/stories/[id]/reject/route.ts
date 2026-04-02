import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/supabase/admin';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { error, status, user, supabase } = await requireAdmin(request);
  if (error || !user) return NextResponse.json({ error }, { status });

  const body = await request.json().catch(() => ({}));

  const { data, error: updateError } = await supabase
    .from('stories')
    .update({
      status: 'rejected',
      review_notes: body.review_notes || null,
    })
    .eq('id', id)
    .select()
    .single();

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  await supabase.from('audit_log').insert({
    actor_user_id: user.id,
    action: 'reject_story',
    target_type: 'story',
    target_id: id,
    meta: { review_notes: body.review_notes || null },
  });

  return NextResponse.json(data);
}
