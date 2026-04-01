import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/supabase/admin';
import { createServiceClient } from '@/lib/supabase/server';

function requireSuperAdmin(user: { admin: { role: string } } | null) {
  if (!user || user.admin.role !== 'super_admin') {
    return { error: 'Forbidden: super_admin role required', status: 403 };
  }
  return null;
}

export async function GET() {
  const { error, status, user } = await requireAdmin();
  if (error) return NextResponse.json({ error }, { status });

  const roleCheck = requireSuperAdmin(user);
  if (roleCheck) return NextResponse.json({ error: roleCheck.error }, { status: roleCheck.status });

  const serviceClient = await createServiceClient();
  const { data: admins, error: queryError } = await serviceClient
    .from('admins')
    .select('*')
    .order('created_at', { ascending: false });

  if (queryError) {
    return NextResponse.json({ error: queryError.message }, { status: 500 });
  }

  // Fetch emails from auth.users for each admin
  const enriched = await Promise.all(
    (admins || []).map(async (admin) => {
      const { data } = await serviceClient.auth.admin.getUserById(admin.user_id);
      return { ...admin, email: data?.user?.email || null };
    })
  );

  return NextResponse.json({ users: enriched });
}

export async function POST(request: NextRequest) {
  const { error, status, user } = await requireAdmin();
  if (error || !user) return NextResponse.json({ error }, { status });

  const roleCheck = requireSuperAdmin(user);
  if (roleCheck) return NextResponse.json({ error: roleCheck.error }, { status: roleCheck.status });

  const body = await request.json();
  const { email, password, full_name, role } = body;

  if (!email || !password || !role) {
    return NextResponse.json({ error: 'email, password, and role are required' }, { status: 422 });
  }

  if (!['super_admin', 'moderator'].includes(role)) {
    return NextResponse.json({ error: 'role must be super_admin or moderator' }, { status: 422 });
  }

  const serviceClient = await createServiceClient();

  // Create auth user
  const { data: authData, error: authError } = await serviceClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 400 });
  }

  // Add to admins table
  const { data: admin, error: insertError } = await serviceClient
    .from('admins')
    .insert({
      user_id: authData.user.id,
      full_name: full_name?.trim() || null,
      role,
    })
    .select()
    .single();

  if (insertError) {
    // Clean up auth user if admins insert fails
    await serviceClient.auth.admin.deleteUser(authData.user.id);
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  // Audit log
  await serviceClient.from('audit_log').insert({
    actor_user_id: user.id,
    action: 'create_admin',
    target_type: 'admin',
    target_id: admin.id,
    meta: { email, role },
  });

  return NextResponse.json({ ...admin, email }, { status: 201 });
}
