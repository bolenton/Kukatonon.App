import { cacheStoriesResponse, getCachedStoriesResponse, cacheStory, cacheStories, getCachedStory, getAllCachedStories } from './offlineStorage';

const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'https://kukatonon.app';

export type ContentBlock =
  | { id: string; type: 'text'; html: string }
  | { id: string; type: 'image'; url: string; width?: number; height?: number; caption?: string }
  | { id: string; type: 'video'; url: string; caption?: string }
  | { id: string; type: 'youtube'; url: string; caption?: string };

export interface PublicStory {
  id: string;
  title: string;
  slug: string;
  honoree_name: string;
  summary: string | null;
  content_html: string | null;
  youtube_urls: string[];
  media_items: { type: 'image' | 'video' | 'audio'; url: string; thumbnail_url?: string }[];
  cover_image_url: string | null;
  is_featured: boolean;
  content_blocks: ContentBlock[] | null;
  category_ids: string[];
  submitted_by_name: string | null;
  created_at: string;
  // Location fields (optional, mobile-submitted stories only)
  event_latitude?: number | null;
  event_longitude?: number | null;
  event_location_name?: string | null;
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
  offline?: boolean;
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

  const cacheKey = searchParams.toString() || 'default';

  try {
    const res = await fetch(`${API_BASE}/api/stories?${searchParams.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch stories');
    const data: StoriesResponse = await res.json();

    // Cache in background
    cacheStoriesResponse(cacheKey, data);
    cacheStories(data.stories);

    return data;
  } catch (error) {
    // Offline fallback: try exact cache key first
    const cached = await getCachedStoriesResponse(cacheKey);
    if (cached) return { ...cached, offline: true };

    // If searching/filtering offline, do it locally against all cached stories
    if (params?.search || params?.category || params?.featured) {
      const allStories = await getAllCachedStories();
      let filtered = allStories;

      if (params?.featured) {
        filtered = filtered.filter((s) => s.is_featured);
      }
      if (params?.search) {
        const q = params.search.toLowerCase();
        filtered = filtered.filter(
          (s) =>
            s.title.toLowerCase().includes(q) ||
            s.honoree_name.toLowerCase().includes(q) ||
            (s.summary && s.summary.toLowerCase().includes(q))
        );
      }
      if (params?.category) {
        filtered = filtered.filter((s) => s.category_ids.includes(params.category!));
      }

      // Sort: featured first, then newest
      filtered.sort((a, b) => {
        if (a.is_featured !== b.is_featured) return a.is_featured ? -1 : 1;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });

      const limit = params?.limit || 50;
      const page = params?.page || 1;
      const offset = (page - 1) * limit;
      const sliced = filtered.slice(offset, offset + limit);

      return {
        stories: sliced,
        pagination: { page, limit, total: filtered.length, totalPages: Math.ceil(filtered.length / limit) },
        offline: true,
      };
    }

    // Last resort: return all cached stories as the default list
    const allStories = await getAllCachedStories();
    if (allStories.length > 0) {
      allStories.sort((a, b) => {
        if (a.is_featured !== b.is_featured) return a.is_featured ? -1 : 1;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
      return {
        stories: allStories,
        pagination: { page: 1, limit: allStories.length, total: allStories.length, totalPages: 1 },
        offline: true,
      };
    }

    throw error;
  }
}

export async function fetchStory(id: string): Promise<PublicStory & { offline?: boolean }> {
  try {
    const res = await fetch(`${API_BASE}/api/stories/${id}`);
    if (!res.ok) throw new Error('Story not found');
    const data: PublicStory = await res.json();

    // Cache for offline reading
    cacheStory(data);

    return data;
  } catch (error) {
    // Offline fallback: return cached story
    const cached = await getCachedStory(id);
    if (cached) return { ...cached, offline: true };
    throw error;
  }
}

export async function fetchCategories(): Promise<CategoryInfo[]> {
  const res = await fetch(`${API_BASE}/api/categories`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.categories || [];
}
