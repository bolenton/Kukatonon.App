"use client";

import type { ContentBlock } from "@/types/blocks";
import type { MediaItem } from "@/types/database";
import SourcePalette from "./SourcePalette";
import BlockList from "./BlockList";
import AddBlockMenu from "./AddBlockMenu";

interface StoryComposerProps {
  blocks: ContentBlock[];
  onChange: (blocks: ContentBlock[]) => void;
  sourceContentHtml: string | null;
  sourceMediaItems: MediaItem[];
  sourceYoutubeUrls: string[];
  coverImageUrl: string;
  onCoverImageChange: (url: string) => void;
}

export default function StoryComposer({
  blocks,
  onChange,
  sourceContentHtml,
  sourceMediaItems,
  sourceYoutubeUrls,
  coverImageUrl,
  onCoverImageChange,
}: StoryComposerProps) {
  function addBlock(block: ContentBlock) {
    onChange([...blocks, block]);
  }

  function handleConvertToBlocks() {
    const newBlocks: ContentBlock[] = [];

    if (sourceContentHtml) {
      newBlocks.push({ id: crypto.randomUUID(), type: "text", html: sourceContentHtml });
    }

    for (const item of sourceMediaItems) {
      if (item.type === "image") {
        newBlocks.push({ id: crypto.randomUUID(), type: "image", url: item.url, width: item.width, height: item.height });
      } else if (item.type === "video") {
        newBlocks.push({ id: crypto.randomUUID(), type: "video", url: item.url });
      }
    }

    for (const url of sourceYoutubeUrls) {
      newBlocks.push({ id: crypto.randomUUID(), type: "youtube", url });
    }

    onChange(newBlocks);
  }

  return (
    <div className="space-y-4">
      {/* Source palette */}
      <SourcePalette
        contentHtml={sourceContentHtml}
        mediaItems={sourceMediaItems}
        youtubeUrls={sourceYoutubeUrls}
        onAddBlock={addBlock}
      />

      {/* Convert button for stories without blocks */}
      {blocks.length === 0 && (sourceContentHtml || sourceMediaItems.length > 0 || sourceYoutubeUrls.length > 0) && (
        <button
          onClick={handleConvertToBlocks}
          className="w-full py-2.5 border-2 border-dashed border-earth-gold/40 text-earth-gold rounded-xl text-sm font-medium hover:border-earth-gold hover:bg-earth-gold/5 transition-colors"
        >
          Auto-generate blocks from submitted content
        </button>
      )}

      {/* Block list */}
      <BlockList
        blocks={blocks}
        onChange={onChange}
        coverImageUrl={coverImageUrl}
        onSetCover={onCoverImageChange}
      />

      {/* Add block menu */}
      <AddBlockMenu onAdd={addBlock} />
    </div>
  );
}
