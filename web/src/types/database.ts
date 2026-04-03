import type { ContentBlock } from './blocks';

export type StoryStatus = 'pending' | 'approved' | 'rejected';
export type SourceType = 'admin' | 'public_submission';
export type AdminRole = 'super_admin' | 'moderator';

export interface MediaItem {
  type: 'image' | 'video' | 'audio';
  url: string;
  thumbnail_url?: string;
  crop?: { x: number; y: number; width: number; height: number; aspect: number };
  width?: number;
  height?: number;
}

export interface Story {
  id: string;
  title: string;
  slug: string;
  honoree_name: string;
  summary: string | null;
  content_html: string | null;
  youtube_urls: string[];
  media_items: MediaItem[];
  cover_image_url: string | null;
  status: StoryStatus;
  is_featured: boolean;
  source_type: SourceType;
  submitted_by_name: string | null;
  submitted_by_phone: string | null;
  submitted_by_whatsapp: string | null;
  submitted_by_email: string | null;
  consent_confirmed: boolean;
  review_notes: string | null;
  approved_by: string | null;
  approved_at: string | null;
  content_blocks: ContentBlock[] | null;
  category_ids: string[];
  event_latitude: number | null;
  event_longitude: number | null;
  event_location_name: string | null;
  show_event_location: boolean;
  created_at: string;
  updated_at: string;
}

// Public-facing story without contact info
export type PublicStory = Omit<
  Story,
  'submitted_by_phone' | 'submitted_by_whatsapp' | 'submitted_by_email' | 'review_notes' | 'approved_by'
>;

export interface Admin {
  id: string;
  user_id: string;
  full_name: string | null;
  role: AdminRole;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
}

export interface AuditLog {
  id: string;
  actor_user_id: string | null;
  action: string;
  target_type: string;
  target_id: string | null;
  meta: Record<string, unknown>;
  created_at: string;
}

export interface SubmissionPayload {
  title: string;
  honoree_name: string;
  summary?: string;
  content_html?: string;
  youtube_urls?: string[];
  media_items?: MediaItem[];
  cover_image_url?: string;
  submitted_by_name: string;
  submitted_by_phone?: string;
  submitted_by_whatsapp?: string;
  submitted_by_email?: string;
  consent_confirmed: boolean;
  event_latitude?: number;
  event_longitude?: number;
  event_location_name?: string;
  show_event_location?: boolean;
}

export interface StoryCreatePayload {
  title: string;
  honoree_name: string;
  summary?: string;
  content_html?: string;
  youtube_urls?: string[];
  media_items?: MediaItem[];
  cover_image_url?: string;
  is_featured?: boolean;
  content_blocks?: ContentBlock[] | null;
  category_ids?: string[];
}

export interface StoryUpdatePayload extends Partial<StoryCreatePayload> {
  status?: StoryStatus;
  review_notes?: string;
  show_event_location?: boolean;
}
