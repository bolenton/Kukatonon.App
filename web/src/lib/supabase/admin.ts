import { createClient } from './server';

export async function requireAdmin(request?: Request) {
  // If a Bearer token is provided (mobile), use token-based auth
  if (request) {
    const authHeader = request.headers.get('authorization');
    console.log('[requireAdmin] authHeader present:', !!authHeader, 'value:', authHeader?.substring(0, 30));
    const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (bearerToken) {
      console.log('[requireAdmin] using Bearer token path');
      return requireAdminWithToken(bearerToken);
    }
  } else {
    console.log('[requireAdmin] no request object passed');
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
  console.log('[requireAdmin] token verify:', authError ? `ERROR: ${authError.message}` : `OK user=${data.user?.id}`);
  if (authError || !data.user) {
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
