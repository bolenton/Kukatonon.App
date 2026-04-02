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
  }
}
