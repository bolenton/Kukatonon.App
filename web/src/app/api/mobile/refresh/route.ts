import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { refresh_token } = body;

  if (!refresh_token) {
    return NextResponse.json({ error: 'refresh_token required' }, { status: 422 });
  }

  const { createClient } = await import('@supabase/supabase-js');
  const authClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data, error } = await authClient.auth.refreshSession({ refresh_token });

  if (error || !data.session) {
    return NextResponse.json({ error: 'Session expired. Please log in again.' }, { status: 401 });
  }

  // Re-verify admin status
  const supabase = await createServiceClient();
  const { data: admin } = await supabase
    .from('admins')
    .select('role, full_name')
    .eq('user_id', data.user!.id)
    .single();

  if (!admin) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  }

  return NextResponse.json({
    token: data.session.access_token,
    refresh_token: data.session.refresh_token,
    expires_at: data.session.expires_at,
    email: data.user!.email,
    role: admin.role,
    full_name: admin.full_name,
  });
}
