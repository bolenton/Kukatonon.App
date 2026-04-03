import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { generateStoragePath } from '@/lib/media';

export async function POST(request: NextRequest) {
  const supabase = await createServiceClient();

  const body = await request.json();
  const { filename, contentType, type } = body;

  if (!filename || !contentType) {
    return NextResponse.json({ error: 'filename and contentType required' }, { status: 400 });
  }

  const mediaType = type === 'video' ? 'video' : type === 'audio' ? 'audio' : 'image';
  const path = generateStoragePath(mediaType, filename);

  const { data, error } = await supabase.storage
    .from('media')
    .createSignedUploadUrl(path);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
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
