import { createClient } from './server';
import { createServiceClient } from './server';
import { headers } from 'next/headers';

export async function requireAdmin() {
  // Check for Bearer token (mobile app) or cookie-based session (web)
  const headersList = await headers();
  const authHeader = headersList.get('authorization');
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  let supabase;
  let user;

  if (bearerToken) {
    // Mobile: verify JWT token with Supabase, use service client for DB queries
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
    // Use service client to bypass RLS for admin table lookup and subsequent queries
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
