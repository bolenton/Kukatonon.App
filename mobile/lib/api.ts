const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'https://kukatonon.app';

export interface PublicStory {
  id: string;
  title: string;
  slug: string;
  honoree_name: string;
  summary: string | null;
  content_html: string | null;
  youtube_urls: string[];
  media_items: { type: 'image' | 'video'; url: string; thumbnail_url?: string }[];
  cover_image_url: string | null;
  is_featured: boolean;
  category_ids: string[];
  submitted_by_name: string | null;
  created_at: string;
}

export interface CategoryInfo {
  id: string;
  name: string;
  slug: string;
}

export interface StoriesResponse {
  stories: PublicStory[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export async function fetchStories(params?: {
  page?: number;
  limit?: number;
  featured?: boolean;
  search?: string;
  category?: string;
}): Promise<StoriesResponse> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set('page', String(params.page));
  if (params?.limit) searchParams.set('limit', String(params.limit));
  if (params?.featured) searchParams.set('featured', 'true');
  if (params?.search) searchParams.set('search', params.search);
  if (params?.category) searchParams.set('category', params.category);

  const res = await fetch(`${API_BASE}/api/stories?${searchParams.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch stories');
  return res.json();
}

export async function fetchStory(id: string): Promise<PublicStory> {
  const res = await fetch(`${API_BASE}/api/stories/${id}`);
  if (!res.ok) throw new Error('Story not found');
  return res.json();
}

export async function fetchCategories(): Promise<CategoryInfo[]> {
  const res = await fetch(`${API_BASE}/api/categories`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.categories || [];
}
