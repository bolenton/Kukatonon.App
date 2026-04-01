import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/supabase/admin';
import { createServiceClient } from '@/lib/supabase/server';

function requireSuperAdmin(user: { admin: { role: string } } | null) {
  if (!user || user.admin.role !== 'super_admin') {
    return { error: 'Forbidden: super_admin role required', status: 403 };
  }
  return null;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { error, status, user } = await requireAdmin();
  if (error || !user) return NextResponse.json({ error }, { status });

  const roleCheck = requireSuperAdmin(user);
  if (roleCheck) return NextResponse.json({ error: roleCheck.error }, { status: roleCheck.status });

  const body = await request.json();
  const updates: Record<string, unknown> = {};

  if (body.full_name !== undefined) updates.full_name = body.full_name?.trim() || null;
  if (body.role !== undefined) {
    if (!['super_admin', 'moderator'].includes(body.role)) {
      return NextResponse.json({ error: 'role must be super_admin or moderator' }, { status: 422 });
    }
    updates.role = body.role;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 422 });
  }

  const serviceClient = await createServiceClient();

  const { data, error: updateError } = await serviceClient
    .from('admins')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: 'Admin not found' }, { status: 404 });
  }

  await serviceClient.from('audit_log').insert({
    actor_user_id: user.id,
    action: 'update_admin',
    target_type: 'admin',
    target_id: id,
    meta: { fields: Object.keys(updates) },
  });

  return NextResponse.json(data);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { error, status, user } = await requireAdmin();
  if (error || !user) return NextResponse.json({ error }, { status });

  const roleCheck = requireSuperAdmin(user);
  if (roleCheck) return NextResponse.json({ error: roleCheck.error }, { status: roleCheck.status });

  const serviceClient = await createServiceClient();

  // Get admin record first
  const { data: admin, error: fetchError } = await serviceClient
    .from('admins')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchError || !admin) {
    return NextResponse.json({ error: 'Admin not found' }, { status: 404 });
  }

  // Prevent self-deletion
  if (admin.user_id === user.id) {
    return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 });
  }

  // Remove from admins table
  const { error: deleteError } = await serviceClient
    .from('admins')
    .delete()
    .eq('id', id);

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  // Delete auth user
  await serviceClient.auth.admin.deleteUser(admin.user_id);

  await serviceClient.from('audit_log').insert({
    actor_user_id: user.id,
    action: 'delete_admin',
    target_type: 'admin',
    target_id: id,
    meta: { deleted_user_id: admin.user_id },
  });

  return NextResponse.json({ success: true });
}
