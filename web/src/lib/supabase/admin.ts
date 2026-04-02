import { createClient, createServiceClient } from './server';

export async function requireAdmin(request?: Request) {
  // Check for Bearer token from mobile app
  let bearerToken: string | null = null;
  if (request) {
    const authHeader = request.headers.get('authorization');
    bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  }

  let supabase;
  let user;

  if (bearerToken) {
    // Mobile: verify JWT token with Supabase
    const { createClient: createSupabaseClient } = await import('@supabase/supabase-js');
    const authClient = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data, error: authError } = await authClient.auth.getUser(bearerToken);
    if (authError || !data.user) {
      return { error: 'Unauthorized', status: 401, user: null, supabase: authClient };
    }
    user = data.user;
    supabase = await createServiceClient();
  } else {
    // Web: use cookie-based session
    supabase = await createClient();
    const { data: { user: cookieUser }, error: authError } = await supabase.auth.getUser();
    if (authError || !cookieUser) {
      return { error: 'Unauthorized', status: 401, user: null, supabase };
    }
    user = cookieUser;
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
