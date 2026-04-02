const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'https://kukatonon.app';

export class AdminApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function adminFetch(token: string, path: string, options?: RequestInit) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...(options?.headers || {}),
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    console.error(`[adminApi] ${res.status} ${path}:`, body.error || body);
    throw new AdminApiError(res.status, body.error || 'Request failed');
  }
  return res.json();
}

// Dashboard stats
export async function fetchDashboardStats(token: string) {
  const [pending, approved, rejected, featured] = await Promise.all([
    adminFetch(token, '/api/admin/stories?status=pending&limit=1'),
    adminFetch(token, '/api/admin/stories?status=approved&limit=1'),
    adminFetch(token, '/api/admin/stories?status=rejected&limit=1'),
    adminFetch(token, '/api/admin/stories?status=approved&limit=1&featured=true'),
  ]);
  return {
    pending: pending.pagination.total,
    approved: approved.pagination.total,
    rejected: rejected.pagination.total,
    featured: featured.pagination.total,
  };
}

// Stories
export interface AdminStory {
  id: string;
  title: string;
  slug: string;
  honoree_name: string;
  summary: string | null;
  content_html: string | null;
  youtube_urls: string[];
  media_items: { type: 'image' | 'video'; url: string; thumbnail_url?: string }[];
  cover_image_url: string | null;
  content_blocks: unknown[] | null;
  category_ids: string[];
  status: 'pending' | 'approved' | 'rejected';
  is_featured: boolean;
  source_type: 'admin' | 'public_submission';
  submitted_by_name: string | null;
  submitted_by_phone: string | null;
  submitted_by_whatsapp: string | null;
  submitted_by_email: string | null;
  review_notes: string | null;
  approver_name: string | null;
  created_at: string;
  updated_at: string;
}

export async function fetchPendingStories(token: string) {
  const data = await adminFetch(token, '/api/admin/stories?status=pending&limit=50');
  return data.stories as AdminStory[];
}

export async function fetchAdminStories(token: string, params?: {
  status?: string;
  search?: string;
  page?: number;
}) {
  const sp = new URLSearchParams();
  sp.set('limit', '25');
  if (params?.status && params.status !== 'all') sp.set('status', params.status);
  if (params?.search) sp.set('search', params.search);
  if (params?.page) sp.set('page', String(params.page));
  const data = await adminFetch(token, `/api/admin/stories?${sp}`);
  return data as { stories: AdminStory[]; pagination: { page: number; total: number; totalPages: number } };
}

export async function fetchAdminStory(token: string, id: string) {
  return adminFetch(token, `/api/admin/stories/${id}`) as Promise<AdminStory>;
}

export async function approveStory(token: string, id: string) {
  return adminFetch(token, `/api/admin/stories/${id}/approve`, { method: 'POST' });
}

export async function rejectStory(token: string, id: string, reviewNotes?: string) {
  return adminFetch(token, `/api/admin/stories/${id}/reject`, {
    method: 'POST',
    body: JSON.stringify({ review_notes: reviewNotes }),
  });
}

export async function toggleFeatured(token: string, id: string, isFeatured: boolean) {
  return adminFetch(token, `/api/admin/stories/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ is_featured: isFeatured }),
  });
}

export async function updateStoryMeta(token: string, id: string, fields: {
  review_notes?: string;
  category_ids?: string[];
  is_featured?: boolean;
}) {
  return adminFetch(token, `/api/admin/stories/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(fields),
  });
}

// Categories
export async function fetchAdminCategories(token: string) {
  const data = await adminFetch(token, '/api/admin/categories');
  return data.categories as { id: string; name: string; slug: string }[];
}

// Profile
export interface AdminProfile {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
}

export async function fetchAdminProfile(token: string) {
  return adminFetch(token, '/api/admin/profile') as Promise<AdminProfile>;
}

export async function updateAdminProfile(token: string, data: { full_name?: string }) {
  return adminFetch(token, '/api/admin/profile', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}
