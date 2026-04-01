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
  const { data } = await serviceClient
    .from('site_settings')
    .select('key, value');

  const settings: Record<string, string> = {};
  (data || []).forEach((row: { key: string; value: string }) => {
    settings[row.key] = row.value;
  });

  return NextResponse.json({ settings });
}

export async function PATCH(request: NextRequest) {
  const { error, status, user } = await requireAdmin();
  if (error || !user) return NextResponse.json({ error }, { status });

  const roleCheck = requireSuperAdmin(user);
  if (roleCheck) return NextResponse.json({ error: roleCheck.error }, { status: roleCheck.status });

  const body = await request.json();
  const serviceClient = await createServiceClient();

  if (body.theme) {
    const validThemes = ['nature', 'classic', 'earth'];
    if (!validThemes.includes(body.theme)) {
      return NextResponse.json({ error: 'Invalid theme' }, { status: 422 });
    }

    const { error: upsertError } = await serviceClient
      .from('site_settings')
      .upsert(
        { key: 'theme', value: body.theme, updated_at: new Date().toISOString() },
        { onConflict: 'key' }
      );

    if (upsertError) {
      return NextResponse.json({ error: upsertError.message }, { status: 500 });
    }
  }

  // Audit log
  await serviceClient.from('audit_log').insert({
    actor_user_id: user.id,
    action: 'update_settings',
    target_type: 'site_settings',
    meta: { changes: body },
  });

  return NextResponse.json({ success: true });
}
