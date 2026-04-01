"use client";

import { getEmbedUrl } from "@/lib/youtube";

interface YouTubeEmbedProps {
  url: string;
  className?: string;
}

export default function YouTubeEmbed({ url, className = "" }: YouTubeEmbedProps) {
  const embedUrl = getEmbedUrl(url);
  if (!embedUrl) return null;

  return (
    <div className={`relative w-full aspect-video rounded-xl overflow-hidden ${className}`}>
      <iframe
        src={embedUrl}
        title="YouTube video"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="absolute inset-0 w-full h-full"
      />
    </div>
  );
}
