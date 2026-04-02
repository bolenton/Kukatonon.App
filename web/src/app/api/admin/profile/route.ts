import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/supabase/admin';
import { createServiceClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const { error, status, user } = await requireAdmin(request);
  if (error || !user) return NextResponse.json({ error }, { status });

  return NextResponse.json({
    id: user.admin.id,
    user_id: user.id,
    email: user.email,
    full_name: user.admin.full_name,
    role: user.admin.role,
  });
}

export async function PATCH(request: NextRequest) {
  const { error, status, user } = await requireAdmin(request);
  if (error || !user) return NextResponse.json({ error }, { status });

  const body = await request.json();
  const serviceClient = await createServiceClient();

  // Update name in admins table
  if (body.full_name !== undefined) {
    const { error: updateError } = await serviceClient
      .from('admins')
      .update({ full_name: body.full_name?.trim() || null })
      .eq('user_id', user.id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }
  }

  // Update email in auth
  if (body.email && body.email !== user.email) {
    const { error: emailError } = await serviceClient.auth.admin.updateUserById(
      user.id,
      { email: body.email }
    );
    if (emailError) {
      return NextResponse.json({ error: emailError.message }, { status: 400 });
    }
  }

  // Update password in auth
  if (body.password) {
    if (body.password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 422 });
    }
    const { error: pwError } = await serviceClient.auth.admin.updateUserById(
      user.id,
      { password: body.password }
    );
    if (pwError) {
      return NextResponse.json({ error: pwError.message }, { status: 400 });
    }
  }

  return NextResponse.json({ success: true });
}
