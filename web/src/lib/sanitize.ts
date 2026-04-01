import DOMPurify from 'isomorphic-dompurify';

const ALLOWED_TAGS = [
  'p', 'h1', 'h2', 'h3', 'h4',
  'strong', 'em', 'u',
  'ul', 'ol', 'li',
  'blockquote',
  'a',
  'img',
  'iframe',
  'br',
  'div', 'span',
];

const ALLOWED_ATTR = [
  'href', 'target', 'rel',
  'src', 'alt', 'width', 'height',
  'class',
  'frameborder', 'allow', 'allowfullscreen',
];

// Only allow YouTube iframe sources
function isYouTubeUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return (
      parsed.hostname === 'www.youtube.com' ||
      parsed.hostname === 'youtube.com' ||
      parsed.hostname === 'www.youtube-nocookie.com'
    );
  } catch {
    return false;
  }
}

export function sanitizeHtml(dirty: string): string {
  const clean = DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
    ADD_TAGS: ['iframe'],
    ADD_ATTR: ['allowfullscreen', 'frameborder', 'allow'],
  });

  // Post-process: remove non-YouTube iframes
  if (typeof window !== 'undefined' || typeof document !== 'undefined') {
    // Running with DOM available
    const parser = new DOMParser();
    const doc = parser.parseFromString(clean, 'text/html');
    doc.querySelectorAll('iframe').forEach((iframe) => {
      const src = iframe.getAttribute('src') || '';
      if (!isYouTubeUrl(src)) {
        iframe.remove();
      }
    });
    return doc.body.innerHTML;
  }

  // Server-side: simple regex fallback for non-YouTube iframes
  return clean.replace(
    /<iframe[^>]*src="([^"]*)"[^>]*>[\s\S]*?<\/iframe>/gi,
    (match, src) => (isYouTubeUrl(src) ? match : '')
  );
}
