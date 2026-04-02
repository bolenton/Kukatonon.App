import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/supabase/admin';
import { createSlug } from '@/lib/slugify';

export async function GET(request: NextRequest) {
  const { error, status, supabase } = await requireAdmin(request);
  if (error) return NextResponse.json({ error }, { status });

  const { data, error: queryError } = await supabase
    .from('categories')
    .select('*')
    .order('name', { ascending: true });

  if (queryError) {
    return NextResponse.json({ error: queryError.message }, { status: 500 });
  }

  return NextResponse.json({ categories: data });
}

export async function POST(request: NextRequest) {
  const { error, status, user, supabase } = await requireAdmin(request);
  if (error || !user) return NextResponse.json({ error }, { status });

  const body = await request.json();
  const { name, description } = body;

  if (!name?.trim()) {
    return NextResponse.json({ error: 'Name is required' }, { status: 422 });
  }

  const { data, error: insertError } = await supabase
    .from('categories')
    .insert({
      name: name.trim(),
      slug: createSlug(name),
      description: description?.trim() || null,
    })
    .select()
    .single();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
