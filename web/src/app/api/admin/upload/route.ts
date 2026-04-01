import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/supabase/admin';
import { generateStoragePath } from '@/lib/media';

export async function POST(request: NextRequest) {
  const { error, status, supabase } = await requireAdmin();
  if (error) return NextResponse.json({ error }, { status });

  const body = await request.json();
  const { filename, contentType, type } = body;

  if (!filename || !contentType) {
    return NextResponse.json({ error: 'filename and contentType required' }, { status: 400 });
  }

  const mediaType = type === 'video' ? 'video' : 'image';
  const path = generateStoragePath(mediaType, filename);

  const { data, error: signError } = await supabase.storage
    .from('media')
    .createSignedUploadUrl(path);

  if (signError) {
    return NextResponse.json({ error: signError.message }, { status: 500 });
  }

  const { data: { publicUrl } } = supabase.storage
    .from('media')
    .getPublicUrl(path);

  return NextResponse.json({
    signedUrl: data.signedUrl,
    token: data.token,
    path,
    publicUrl,
  });
}
