import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { email, password } = body;

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password required' }, { status: 422 });
  }

  const supabase = await createServiceClient();

  // Sign in with Supabase Auth
  const { createClient } = await import('@supabase/supabase-js');
  const authClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: authData, error: authError } = await authClient.auth.signInWithPassword({
    email,
    password,
  });

  if (authError || !authData.session) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  // Verify user is an admin
  const { data: admin } = await supabase
    .from('admins')
    .select('role, full_name')
    .eq('user_id', authData.user.id)
    .single();

  if (!admin) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  }

  return NextResponse.json({
    token: authData.session.access_token,
    email: authData.user.email,
    role: admin.role,
    full_name: admin.full_name,
  });
}
