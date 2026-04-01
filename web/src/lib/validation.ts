import type { SubmissionPayload, StoryCreatePayload } from '@/types/database';

export interface ValidationError {
  field: string;
  message: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateSubmission(data: SubmissionPayload): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!data.submitted_by_name?.trim()) {
    errors.push({ field: 'submitted_by_name', message: 'Your name is required' });
  }

  const hasPhone = !!data.submitted_by_phone?.trim();
  const hasWhatsapp = !!data.submitted_by_whatsapp?.trim();
  const hasEmail = !!data.submitted_by_email?.trim();

  if (!hasPhone && !hasWhatsapp && !hasEmail) {
    errors.push({ field: 'contact', message: 'At least one contact method is required (phone, WhatsApp, or email)' });
  }

  if (hasEmail && !EMAIL_REGEX.test(data.submitted_by_email!)) {
    errors.push({ field: 'submitted_by_email', message: 'Please enter a valid email address' });
  }

  if (!data.consent_confirmed) {
    errors.push({ field: 'consent_confirmed', message: 'You must confirm consent to submit a story' });
  }

  // Validate story content
  const storyErrors = validateStoryContent({
    title: data.title,
    honoree_name: data.honoree_name,
    content_html: data.content_html,
    youtube_urls: data.youtube_urls,
    media_items: data.media_items,
  });

  return [...errors, ...storyErrors];
}

export function validateStoryContent(data: Partial<StoryCreatePayload>): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!data.title?.trim()) {
    errors.push({ field: 'title', message: 'Story title is required' });
  } else if (data.title.length > 140) {
    errors.push({ field: 'title', message: 'Title must be 140 characters or fewer' });
  }

  if (!data.honoree_name?.trim()) {
    errors.push({ field: 'honoree_name', message: 'Honoree name is required' });
  } else if (data.honoree_name.length > 120) {
    errors.push({ field: 'honoree_name', message: 'Honoree name must be 120 characters or fewer' });
  }

  const hasContent = !!data.content_html?.trim();
  const hasYouTube = (data.youtube_urls?.length ?? 0) > 0;
  const hasMedia = (data.media_items?.length ?? 0) > 0;

  if (!hasContent && !hasYouTube && !hasMedia) {
    errors.push({ field: 'content', message: 'At least one type of content is required (text, YouTube link, or media)' });
  }

  if (data.content_html && data.content_html.length > 20000) {
    errors.push({ field: 'content_html', message: 'Content must be 20,000 characters or fewer' });
  }

  return errors;
}
