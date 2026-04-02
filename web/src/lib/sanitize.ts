const ALLOWED_TAGS = new Set([
  'p', 'h1', 'h2', 'h3', 'h4',
  'strong', 'em', 'u',
  'ul', 'ol', 'li',
  'blockquote',
  'a',
  'img',
  'iframe',
  'br',
  'div', 'span',
]);

const ALLOWED_ATTR = new Set([
  'href', 'target', 'rel',
  'src', 'alt', 'width', 'height',
  'class',
  'frameborder', 'allow', 'allowfullscreen',
]);

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
  // Strip all tags except allowed ones, and strip disallowed attributes
  let clean = dirty
    // Remove script tags and their content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove event handlers
    .replace(/\s+on\w+\s*=\s*"[^"]*"/gi, '')
    .replace(/\s+on\w+\s*=\s*'[^']*'/gi, '')
    // Remove javascript: URLs
    .replace(/href\s*=\s*"javascript:[^"]*"/gi, '')
    .replace(/href\s*=\s*'javascript:[^']*'/gi, '')
    .replace(/src\s*=\s*"javascript:[^"]*"/gi, '')
    .replace(/src\s*=\s*'javascript:[^']*'/gi, '');

  // Remove disallowed tags but keep their content
  clean = clean.replace(/<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/g, (match, tag) => {
    const tagLower = tag.toLowerCase();
    if (!ALLOWED_TAGS.has(tagLower)) {
      return '';
    }

    // For allowed tags, strip disallowed attributes
    if (match.startsWith('</')) {
      return `</${tagLower}>`;
    }

    const attrRegex = /\s+([a-zA-Z-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|(\S+))/g;
    let attrs = '';
    let attrMatch;
    while ((attrMatch = attrRegex.exec(match)) !== null) {
      const attrName = attrMatch[1].toLowerCase();
      const attrValue = attrMatch[2] ?? attrMatch[3] ?? attrMatch[4] ?? '';
      if (ALLOWED_ATTR.has(attrName)) {
        attrs += ` ${attrName}="${attrValue.replace(/"/g, '&quot;')}"`;
      }
    }

    const selfClosing = match.endsWith('/>') || tagLower === 'br' || tagLower === 'img';
    return `<${tagLower}${attrs}${selfClosing ? ' /' : ''}>`;
  });

  // Remove non-YouTube iframes
  clean = clean.replace(
    /<iframe[^>]*src="([^"]*)"[^>]*>[\s\S]*?<\/iframe>/gi,
    (match, src) => (isYouTubeUrl(src) ? match : '')
  );

  return clean;
}
