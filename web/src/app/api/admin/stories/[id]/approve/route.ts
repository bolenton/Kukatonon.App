import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/supabase/admin';

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { error, status, user, supabase } = await requireAdmin();
  if (error || !user) return NextResponse.json({ error }, { status });

  const { data, error: updateError } = await supabase
    .from('stories')
    .update({
      status: 'approved',
      approved_by: user.id,
      approved_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  await supabase.from('audit_log').insert({
    actor_user_id: user.id,
    action: 'approve_story',
    target_type: 'story',
    target_id: id,
  });

  return NextResponse.json(data);
}
