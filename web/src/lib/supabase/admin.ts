import { createClient } from './server';

export async function requireAdmin(request?: Request) {
  // If a Bearer token is provided (mobile), use token-based auth
  if (request) {
    const authHeader = request.headers.get('authorization');

    const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (bearerToken) {
      return requireAdminWithToken(bearerToken);
    }
  }

  // Default: cookie-based auth (web)
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: 'Unauthorized', status: 401, user: null, supabase };
  }

  const { data: admin } = await supabase
    .from('admins')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (!admin) {
    return { error: 'Forbidden: not an admin', status: 403, user: null, supabase };
  }

  return { error: null, status: 200, user: { ...user, admin }, supabase };
}

async function requireAdminWithToken(token: string) {
  const { createServiceClient } = await import('./server');
  const { createClient: createSupabaseClient } = await import('@supabase/supabase-js');

  const authClient = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data, error: authError } = await authClient.auth.getUser(token);
  if (authError || !data.user) {
    console.log('[requireAdmin] token verify failed:', authError?.message);
    return { error: 'Unauthorized', status: 401, user: null, supabase: authClient };
  }

  const supabase = await createServiceClient();
  const { data: admin } = await supabase
    .from('admins')
    .select('*')
    .eq('user_id', data.user.id)
    .single();

  if (!admin) {
    return { error: 'Forbidden: not an admin', status: 403, user: null, supabase };
  }

  return { error: null, status: 200, user: { ...data.user, admin }, supabase };
}
