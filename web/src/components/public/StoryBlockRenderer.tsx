import RichTextRenderer from "./RichTextRenderer";
import YouTubeEmbed from "./YouTubeEmbed";
import type { ContentBlock } from "@/types/blocks";

export default function StoryBlockRenderer({ block }: { block: ContentBlock }) {
  switch (block.type) {
    case "text":
      return <RichTextRenderer html={block.html} />;

    case "image":
      return (
        <figure>
          <img
            src={block.url}
            alt={block.caption || ""}
            width={block.width}
            height={block.height}
            className="w-full rounded-xl"
          />
          {block.caption && (
            <figcaption className="text-sm text-gray-500 mt-2 text-center italic">
              {block.caption}
            </figcaption>
          )}
        </figure>
      );

    case "video":
      return (
        <figure>
          <video
            src={block.url}
            controls
            preload="metadata"
            className="w-full rounded-xl"
          />
          {block.caption && (
            <figcaption className="text-sm text-gray-500 mt-2 text-center italic">
              {block.caption}
            </figcaption>
          )}
        </figure>
      );

    case "youtube":
      return (
        <figure>
          <YouTubeEmbed url={block.url} />
          {block.caption && (
            <figcaption className="text-sm text-gray-500 mt-2 text-center italic">
              {block.caption}
            </figcaption>
          )}
        </figure>
      );

    case "audio":
      return (
        <figure className="bg-earth-gold/5 border border-earth-gold/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-4 h-4 text-earth-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
            <span className="text-xs font-semibold uppercase tracking-wider text-earth-gold">Voice Narration</span>
          </div>
          <audio src={block.url} controls className="w-full" preload="metadata" />
          {block.caption && (
            <figcaption className="text-sm text-gray-500 mt-2 text-center italic">
              {block.caption}
            </figcaption>
          )}
        </figure>
      );
  }
}
