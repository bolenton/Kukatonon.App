import { createClient } from './server';

export async function requireAdmin() {
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
