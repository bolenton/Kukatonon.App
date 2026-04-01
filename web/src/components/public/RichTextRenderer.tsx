"use client";

import { sanitizeHtml } from "@/lib/sanitize";

interface RichTextRendererProps {
  html: string;
  className?: string;
}

export default function RichTextRenderer({ html, className = "" }: RichTextRendererProps) {
  const clean = sanitizeHtml(html);

  return (
    <div
      className={`prose-memorial ${className}`}
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
}
