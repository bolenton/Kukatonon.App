import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/supabase/admin';
import { createSlug } from '@/lib/slugify';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { error, status, supabase } = await requireAdmin(request);
  if (error) return NextResponse.json({ error }, { status });

  const body = await request.json();
  const updates: Record<string, unknown> = {};

  if (body.name !== undefined) {
    updates.name = body.name.trim();
    updates.slug = createSlug(body.name);
  }
  if (body.description !== undefined) updates.description = body.description?.trim() || null;

  const { data, error: updateError } = await supabase
    .from('categories')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { error, status, supabase } = await requireAdmin(request);
  if (error) return NextResponse.json({ error }, { status });

  const { error: deleteError } = await supabase
    .from('categories')
    .delete()
    .eq('id', id);

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
